import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tursoConnect, tursoTarget, splitStatements } from './lib/turso.mjs';

/**
 * Apply the schema in migrations/ to Turso.
 *
 * Replaces `wrangler d1 execute --file`. The SDK rejects multi-statement SQL,
 * so each file is split into statements (see splitStatements, which respects
 * string literals and comments) and sent as one batch. A batch is a single
 * transaction, which is what these migrations want: 0003 drops and recreates
 * seven tables with their indexes, and a half-applied schema is worse than a
 * failed one.
 *
 * Ordering is the filename order, which is why they are numbered. Run one file
 * on its own by passing its number:
 *
 *   node scripts/migrate-turso.mjs                    # every migration, in order
 *   node scripts/migrate-turso.mjs 0004               # just the search index
 *   node scripts/migrate-turso.mjs --dir scripts/d1seed   # apply seed batches
 *
 * These migrations are not idempotent by accident — 0003 and 0004 open with
 * `DROP TABLE IF EXISTS`, so re-running either one discards the corpus and
 * the search index respectively. That is deliberate for a reimport and
 * catastrophic by mistake, hence the confirmation below.
 */

const argv = process.argv.slice(2);
const dirIndex = argv.indexOf('--dir');
// `--dir` exists so the seed batches under scripts/d1seed/ can be applied the
// same way. seed-narrators-d1.mjs only writes SQL files — it never connects to
// anything — so applying them was always a separate step, and this is now it.
const DIR = dirIndex === -1 ? 'migrations' : argv[dirIndex + 1];
// `dirIndex + 1` is the directory that follows `--dir`, and is not a filter.
// Guarded against dirIndex === -1, where index 0 is a real argument.
const dirValueIndex = dirIndex === -1 ? -1 : dirIndex + 1;
const only = argv.filter((a, i) => !a.startsWith('-') && i !== dirValueIndex);
const force = argv.includes('--force');

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .filter((f) => only.length === 0 || only.some((n) => f.startsWith(n)));

if (files.length === 0) {
  console.error(`No .sql files in ${DIR} matched ${only.join(', ') || '(all)'}`);
  process.exit(1);
}

// A migration that drops the corpus should not be reachable by a typo.
const destructive = files.filter((f) =>
  /DROP TABLE IF EXISTS (hadith|narrator)\b/.test(readFileSync(join(DIR, f), 'utf8'))
);
if (destructive.length && !force) {
  console.error('These migrations drop and recreate populated tables:\n');
  for (const f of destructive) console.error(`  ${f}`);
  console.error('\nRe-run with --force if you mean to reimport from scratch.');
  process.exit(1);
}

const conn = tursoConnect();
console.log(`Applying ${files.length} migration(s) to ${tursoTarget()}\n`);

for (const file of files) {
  const statements = splitStatements(readFileSync(join(DIR, file), 'utf8'));
  const started = Date.now();
  try {
    await conn.batch(statements, 'deferred');
    console.log(
      `  ok    ${file}  ${statements.length} statement(s), ` +
        `${((Date.now() - started) / 1000).toFixed(1)}s`
    );
  } catch (error) {
    console.error(`  FAIL  ${file}\n        ${error.message}`);
    process.exit(1);
  }
}

const tables = await conn.all(
  "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name"
);
console.log(`\n${tables.length} tables: ${tables.map((r) => r.name).join(', ')}`);
