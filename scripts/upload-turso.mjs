import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Upload the SQLite file built by d1-to-turso.mjs into Turso.
 *
 * Turso imports a whole database file rather than replaying INSERTs, which is
 * the only sane way to move this corpus: the free plan allows 10 million row
 * writes a month and the corpus is 6 million rows, so inserting it — and
 * inserting it again after any mistake — would have consumed the month.
 *
 * The upload target is the database's own hostname, not the Platform API, and
 * it authenticates with a *database* token rather than the API token. A
 * database only accepts an upload if it was created with
 * `seed: { type: "database_upload" }`, so this recreates it: the name, and
 * therefore the connection URL, is preserved, and a fresh database token is
 * minted and written to .dev.vars — recreating the database invalidates the
 * old one, so that file has to be rewritten on every upload.
 *
 * Destructive by nature — it deletes and recreates the database — so it asks
 * before doing it unless --force is given.
 *
 * Usage:
 *   node scripts/upload-turso.mjs --force
 */

const ORG = process.env.TURSO_ORG || 'hadithcritic';
const DB = process.env.TURSO_DB || 'silsilah';
const GROUP = process.env.TURSO_GROUP || 'default';
const API = 'https://api.turso.tech/v1';

const WORK = process.env.MIGRATION_DIR || join(process.cwd(), '..', 'migration-work');
const FILE = process.env.MIGRATION_FILE || join(WORK, 'silsilah.db');
const DEV_VARS = process.env.DEV_VARS || '.dev.vars';

const apiToken = (() => {
  if (process.env.TURSO_API_TOKEN) return process.env.TURSO_API_TOKEN;
  // The same file the rest of the migration reads. Outside the repo on purpose.
  for (const path of ['../.env.local', '.env.local']) {
    try {
      for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const eq = line.indexOf('=');
        if (eq > 0 && line.slice(0, eq).trim() === 'TURSO_API_TOKEN') {
          return line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // try the next location
    }
  }
  throw new Error('TURSO_API_TOKEN is not set and was not found in .env.local');
})();

const api = async (path, init = {}) => {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${path} -> ${response.status} ${text}`);
  return text ? JSON.parse(text) : {};
};

if (!process.argv.includes('--force')) {
  console.error(
    `This deletes and recreates the Turso database "${DB}" so it will accept a\n` +
      `file upload, then uploads ${FILE}.\n\n` +
      'Anything currently in that database is discarded. Re-run with --force.'
  );
  process.exit(1);
}

const size = statSync(FILE).size;
console.log(`Uploading ${FILE} (${(size / 1e9).toFixed(2)} GB) to ${DB}.${ORG}\n`);

// `--upload-only` retries the upload against the database that is already
// waiting for one, instead of deleting and recreating it again. Recreating is
// the expensive, destructive half; a failed upload is usually just the network.
if (process.argv.includes('--upload-only')) {
  console.log('  reusing the existing database (--upload-only)');
} else {
  console.log('  deleting existing database');
  await api(`/organizations/${ORG}/databases/${DB}`, { method: 'DELETE' }).catch((error) => {
    // A missing database is the state we want; anything else is real.
    if (!String(error).includes('404')) throw error;
  });

  console.log('  recreating it for upload');
  await api(`/organizations/${ORG}/databases`, {
    method: 'POST',
    body: JSON.stringify({ name: DB, group: GROUP, seed: { type: 'database_upload' } })
  });
}

console.log('  minting a database token');
const { jwt } = await api(
  `/organizations/${ORG}/databases/${DB}/auth/tokens?expiration=never&authorization=full-access`,
  { method: 'POST' }
);

const { database } = await api(`/organizations/${ORG}/databases/${DB}`);
const hostname = database.Hostname || database.hostname;

console.log(`  uploading to https://${hostname}/v1/upload`);
const started = Date.now();

/**
 * Upload, retrying a 404.
 *
 * A freshly recreated database keeps its hostname but gets a new namespace id,
 * and for a few seconds the upload endpoint still routes to the old one:
 * `Namespace <old id> doesn't exist`. It is a propagation race, not a bad
 * request, so it is worth waiting out rather than recreating the database
 * again. Every other status fails immediately.
 */
let body = '';
let response;
for (let attempt = 1; attempt <= 6; attempt += 1) {
  response = await fetch(`https://${hostname}/v1/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size)
    },
    // A fresh stream per attempt: a consumed one cannot be replayed.
    body: createReadStream(FILE),
    duplex: 'half'
  });
  body = await response.text();
  if (response.ok) break;
  if (response.status !== 404) break;
  const wait = attempt * 10;
  console.log(`  not routable yet (attempt ${attempt}), retrying in ${wait}s`);
  await new Promise((resolve) => setTimeout(resolve, wait * 1000));
}
if (!response.ok) throw new Error(`upload failed: ${response.status} ${body}`);

console.log(`  ${body.trim()}`);
console.log(`  done in ${((Date.now() - started) / 1000).toFixed(0)}s\n`);

// Written rather than printed. Recreating the database invalidates the old
// token, so this file has to be updated on every upload, and a token echoed to
// a terminal ends up in scrollback and shell history.
const url = `libsql://${hostname}`;
const keep = existsSync(DEV_VARS)
  ? readFileSync(DEV_VARS, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.trim() && !/^TURSO_(DATABASE_URL|AUTH_TOKEN)=/.test(l))
  : [];
writeFileSync(DEV_VARS, [...keep, `TURSO_DATABASE_URL=${url}`, `TURSO_AUTH_TOKEN=${jwt}`].join('\n') + '\n');
console.log(`  wrote the new URL and token to ${DEV_VARS}\n`);

console.log('Production still needs them. From this directory:\n');
console.log(`  npx wrangler secret put TURSO_DATABASE_URL   # ${url}`);
console.log('  npx wrangler secret put TURSO_AUTH_TOKEN     # the value in .dev.vars\n');
console.log('Then rebuild the search index, which the upload does not carry:\n');
console.log('  npm run fts:rebuild');
