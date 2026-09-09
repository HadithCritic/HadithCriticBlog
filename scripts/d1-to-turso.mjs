import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { CLOUDFLARE_FILES, fromEnvFile } from './lib/env-file.mjs';

/**
 * Rebuild the corpus as a local SQLite file from D1, ready to upload to Turso.
 *
 * The move off D1 could not go through the obvious route. Reading 6 million
 * rows out with SELECTs would cost more than the free plan's 5 million daily
 * row reads, and the account had already spent that day's allowance. D1's
 * export is the way through: it dumps server-side to R2 and is not billed as
 * row reads at all, which is what made this migration possible on the free
 * plan. Verified before relying on it — a table exported cleanly while every
 * query was still being refused for quota.
 *
 * Table at a time, and each dump deleted once loaded, because the machine this
 * ran on had 8 GB free and the finished database is 1.5 GB. A single
 * whole-database dump plus the file it builds would not have fit.
 *
 * The search index is deliberately not exported. D1's copy is the truncated
 * one — migration 0004 never ran in production because the database was over
 * its size limit and refused writes — so it is rebuilt on Turso afterwards,
 * where writes work. See DATABASE.md.
 *
 * Usage:
 *   node scripts/d1-to-turso.mjs                 # export and build
 *   node scripts/d1-to-turso.mjs --resume        # skip tables already loaded
 *   node scripts/d1-to-turso.mjs --only hadith   # one table
 *
 * Indexes are rebuilt from migrations/ at the end of every run, because the
 * export does not carry them. See createIndexes.
 */

const WRANGLER = 'node_modules/wrangler/bin/wrangler.js';
const D1 = 'silsilah';

/**
 * Credentials for `wrangler d1 export`, passed explicitly rather than left to
 * wrangler's stored OAuth session — that session expired partway through this
 * migration and the run died on an "Authentication error [code: 10000]".
 */
const WRANGLER_ENV = {
  ...process.env,
  CLOUDFLARE_API_TOKEN: fromEnvFile('CLOUDFLARE_API_TOKEN', CLOUDFLARE_FILES),
  CLOUDFLARE_ACCOUNT_ID: fromEnvFile('CLOUDFLARE_ACCOUNT_ID', CLOUDFLARE_FILES)
};
if (!WRANGLER_ENV.CLOUDFLARE_API_TOKEN) {
  throw new Error('CLOUDFLARE_API_TOKEN is not set and was not found in ../.env.local');
}

const WORK = process.env.MIGRATION_DIR || join(process.cwd(), '..', 'migration-work');
const OUT = join(WORK, 'silsilah.db');
const DUMPS = join(WORK, 'dumps');

/**
 * Rows each table must end up with, and the order to load them in.
 *
 * The counts are the same figures scripts/verify-corpus.mjs asserts, repeated
 * here because `--resume` needs them. Skipping a table merely because it has
 * *some* rows would silently keep a half-loaded one from an interrupted run,
 * which is exactly the failure this migration cannot afford to hide. A table
 * counts as done only when it is complete.
 *
 * `article_notifications` is operational rather than corpus data and grows on
 * its own, so it has no expected size; `--resume` skips it once it is present.
 *
 * Small tables first. The order is not required — there are no foreign keys —
 * but it puts the cheap ones ahead of the 484 MB one so a mistake in the
 * configuration surfaces in seconds.
 */
const TABLES = [
  ['article_notifications', null],
  ['hadith_book', 33],
  ['narrator', 20950],
  ['narrator_detail', 20950],
  ['narrator_alias', 110712],
  ['criticism_statement', 165795],
  ['hadith_gloss', 244508],
  ['hadith_subject', 1348820],
  ['hadith_narrator', 1624087],
  ['hadith_chain', 2249581],
  ['hadith', 276347]
];

const args = process.argv.slice(2);
const resume = args.includes('--resume');
const onlyIndex = args.indexOf('--only');
const only = onlyIndex === -1 ? null : args[onlyIndex + 1];
const tables = only ? TABLES.filter(([name]) => name === only) : TABLES;
if (only && tables.length === 0) throw new Error(`Unknown table: ${only}`);

mkdirSync(DUMPS, { recursive: true });

const db = new DatabaseSync(OUT);
// WAL is what Turso's importer requires, and it is also much faster to bulk
// load into. `synchronous=off` is safe here: if this crashes the answer is to
// rerun it, not to recover the file.
db.exec("PRAGMA journal_mode='wal'");
db.exec('PRAGMA synchronous=off');

const tableExists = (name) =>
  db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name) !== undefined;

const rowCount = (name) => db.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get().n;

/**
 * How many statements are handed to one `exec` call, and how many of those
 * groups share a transaction.
 *
 * Both exist for throughput, and the first also for memory. One `exec` per row
 * meant 1.35 million compile-and-finalize cycles on `hadith_subject`, which
 * ran slower than the file could be read — and that is what killed the first
 * attempt. See the note on backpressure in `load`.
 */
const GROUP = 400;
const GROUPS_PER_TX = 25;

/**
 * Split dump text into complete SQL statements.
 *
 * A dump writes one INSERT per line right up until a value contains a
 * newline, which the Arabic text in `hadith` frequently does. Splitting on
 * lines would cut those statements in half, so a `;` only ends a statement
 * when it falls outside a quoted literal, and `''` is an escaped quote rather
 * than a close.
 *
 * Returns the statements it could complete plus whatever trailing text is
 * still mid-statement, so the caller can prepend it to the next chunk.
 *
 * `restQuoted` is the state at the *start* of `rest`, which is what the next
 * call needs — not the state at the end of the text. A `;` only terminates
 * outside a literal, so once any statement has been completed the leftover
 * begins outside one; if none completed, the leftover begins wherever this
 * call began.
 */
function splitDump(text, startQuoted = false) {
  const found = [];
  let quoted = startQuoted;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === "'") {
        if (text[i + 1] === "'") i += 1;
        else quoted = false;
      }
    } else if (char === "'") {
      quoted = true;
    } else if (char === ';') {
      found.push(text.slice(start, i + 1));
      start = i + 1;
    }
  }
  return {
    found,
    rest: text.slice(start),
    restQuoted: found.length > 0 ? false : startQuoted
  };
}

async function load(table, dump) {
  let applied = 0;
  let group = [];
  let groupsInTx = 0;
  let rest = '';
  let quoted = false;
  let inTx = false;

  const begin = () => {
    if (!inTx) {
      db.exec('BEGIN');
      inTx = true;
    }
  };
  const commit = () => {
    if (inTx) {
      db.exec('COMMIT');
      inTx = false;
    }
  };

  const flush = () => {
    if (group.length === 0) return;
    begin();
    const sql = group.join('\n');
    try {
      db.exec(sql);
    } catch (error) {
      if (inTx) db.exec('ROLLBACK');
      throw new Error(`${table}: ${error.message}\n  near: ${group[0].slice(0, 200)}`);
    }
    applied += group.length;
    group = [];
    if ((groupsInTx += 1) >= GROUPS_PER_TX) {
      commit();
      groupsInTx = 0;
      const rss = Math.round(process.memoryUsage().rss / 1e6);
      process.stdout.write(`\r    ${applied.toLocaleString()} rows, rss ${rss} MB   `);
    }
  };

  const take = (statement) => {
    const sql = statement.trim();
    // The dump opens with PRAGMA defer_foreign_keys, which means nothing here
    // and is not accepted inside a transaction.
    if (!sql || /^PRAGMA\b/i.test(sql)) return;
    group.push(sql);
    if (group.length >= GROUP) flush();
  };

  // Chunks rather than readline. `readline`'s async iterator keeps decoding
  // ahead of a slow consumer and queues the lines it has produced, so with
  // synchronous SQLite writes as the consumer it accumulated the whole 283 MB
  // table in memory and exhausted the pagefile. Iterating the raw stream
  // applies real backpressure: nothing is read until this loop asks for it.
  const stream = createReadStream(dump, { encoding: 'utf8', highWaterMark: 1 << 20 });
  for await (const chunk of stream) {
    const result = splitDump(rest + chunk, quoted);
    rest = result.rest;
    quoted = result.restQuoted;
    for (const statement of result.found) take(statement);
  }
  if (rest.trim()) take(rest);
  flush();
  commit();

  process.stdout.write(`\r    ${applied.toLocaleString()} rows loaded            \n`);
  return applied;
}

const gb = (bytes) => `${(bytes / 1e9).toFixed(2)} GB`;

let short = 0;

for (const [table, expected] of tables) {
  if (resume && tableExists(table) && (expected === null || rowCount(table) === expected)) {
    console.log(`skip  ${table} (${rowCount(table).toLocaleString()} rows)`);
    continue;
  }
  const dump = join(DUMPS, `${table}.sql`);
  if (!existsSync(dump)) {
    console.log(`export ${table} ...`);
    execFileSync(
      process.execPath,
      [WRANGLER, 'd1', 'export', D1, '--remote', '--table', table, '--output', dump],
      { stdio: ['ignore', 'ignore', 'inherit'], maxBuffer: 64 * 1024 * 1024, env: WRANGLER_ENV }
    );
  }
  // The dump recreates the table, so a partial load from an interrupted run
  // has to go first — otherwise its CREATE TABLE fails and its rows double up.
  db.exec(`DROP TABLE IF EXISTS "${table}"`);
  console.log(`load  ${table} (dump ${gb(statSync(dump).size)})`);
  await load(table, dump);
  const got = rowCount(table);
  const ok = expected === null || got === expected;
  if (!ok) short += 1;
  console.log(
    `  ${ok ? 'ok' : 'SHORT'}  ${table}: ${got.toLocaleString()}` +
      (ok ? '' : ` rows, expected ${expected.toLocaleString()}`)
  );
  // Reclaim the space before the next, larger, table is fetched.
  rmSync(dump);
}

/**
 * Recreate the indexes, which the export does not carry.
 *
 * `wrangler d1 export --table X` emits that table's `CREATE TABLE` and its
 * rows and nothing else — no `CREATE INDEX`. Uploading the file as exported
 * would have produced a corpus where every query is a table scan: the
 * collection page's `ORDER BY id` would stop riding `(book_id, id)`, and on a
 * backend that bills row reads a sequential scan of 276,347 rows per page view
 * is the very cost this migration existed to escape. Nothing would have
 * errored, which is what makes it worth asserting.
 *
 * Taken from the migrations rather than restated here, so there is one
 * definition of each index.
 */
function createIndexes() {
  const wanted = [];
  for (const file of readdirSync('migrations').filter((f) => f.endsWith('.sql')).sort()) {
    const sql = readFileSync(join('migrations', file), 'utf8');
    for (const match of sql.matchAll(/^CREATE INDEX[\s\S]*?;/gm)) wanted.push(match[0]);
  }
  const before = indexCount();
  console.log(`\nindexes: ${wanted.length} declared in migrations, ${before} present`);
  db.exec('BEGIN');
  for (const statement of wanted) {
    // IF NOT EXISTS so a resumed run is not a failure.
    db.exec(statement.replace(/^CREATE INDEX\s+/i, 'CREATE INDEX IF NOT EXISTS '));
  }
  db.exec('COMMIT');
  console.log(`  built ${indexCount() - before}, ${indexCount()} present now`);
  return wanted.length;
}

const indexCount = () =>
  db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").get()
    .n;

const declared = createIndexes();
const missing = declared - indexCount();

db.exec('PRAGMA wal_checkpoint(truncate)');
console.log('\nrow counts');
for (const [table, expected] of TABLES) {
  if (!tableExists(table)) continue;
  const got = rowCount(table);
  const mark = expected === null || got === expected ? ' ' : '!';
  console.log(` ${mark} ${table.padEnd(22)} ${got.toLocaleString()}`);
}
db.close();
console.log(`\nbuilt ${OUT} (${gb(statSync(OUT).size)})`);
if (short || missing > 0) {
  if (short) console.error(`\n${short} table(s) came up short.`);
  if (missing > 0) console.error(`\n${missing} of ${declared} index(es) missing.`);
  console.error('Do not upload this file.');
  process.exit(1);
}
console.log('Upload it with: node scripts/upload-turso.mjs --force');
