/**
 * Build the browser distribution database from the master corpus.
 *
 * The master database is a build artifact of the seed dumps and carries
 * whatever the load process needed. What the browser opens over HTTP range
 * requests is a different thing: it is read-only, it is never written again,
 * and every page the query planner reads by mistake is a network round trip
 * rather than a disk seek. So this stage does three things that matter and
 * nothing that risks the data:
 *
 *   ANALYZE  writes sqlite_stat1, which is what stops the planner choosing a
 *            scan over an index it cannot see the selectivity of. On a local
 *            file a bad plan is slow; here it is hundreds of 4 KiB fetches.
 *   VACUUM   rewrites the file so pages of one table sit together, which is
 *            what makes the read-ahead in sql.js-httpvfs pay off.
 *   journal  DELETE, so no -wal or -shm file is implied by the header.
 *
 * Index pruning is available behind `--prune` and off by default. Measured on
 * the current corpus it saves about 15 MB out of 1.6 GB, and size is not what
 * costs a reader anything here: they fetch ranges, not the file. Correctness is
 * worth more than 1%.
 *
 * Usage:
 *   node scripts/build-distribution-db.mjs [--master <path>] [--version <id>]
 *                                          [--prune] [--optimize-fts]
 *                                          [--page-size <n>] [--full-check]
 */

import { copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

import {
  buildPaths,
  corpusVersion,
  fileSize,
  heading,
  megabytes,
  parseArgs,
  resolveMasterDb,
  sha256File
} from './lib/corpus-dist.mjs';

/**
 * Indexes the website never queries through, verified against every SQL string
 * in src/. Dropping them is opt-in because "nothing greps for it" is weaker
 * evidence than a query plan, and the payoff is small.
 */
const PRUNABLE_INDEXES = [
  'idx_criticism_critic',
  'idx_criticism_verdict',
  'idx_alias_norm',
  'idx_hadith_num',
  'idx_narrator_facet_kind'
];

const timed = async (label, fn) => {
  const t0 = Date.now();
  process.stdout.write(`  ${label}... `);
  const out = await fn();
  console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return out;
};

async function main() {
  const args = parseArgs();
  const master = resolveMasterDb(typeof args.master === 'string' ? args.master : undefined);
  const version = typeof args.version === 'string' ? args.version : corpusVersion();
  const out = buildPaths(version);

  heading(`BUILD DISTRIBUTION DATABASE  ${version}`);
  console.log(`  Master: ${master} (${megabytes(fileSize(master))})`);
  console.log(`  Output: ${out.db}`);

  mkdirSync(out.dir, { recursive: true });
  for (const stale of [out.db, `${out.db}-wal`, `${out.db}-shm`, `${out.db}-journal`]) {
    if (existsSync(stale)) rmSync(stale);
  }

  await timed('copying master', () => copyFileSync(master, out.db));
  const beforeBytes = fileSize(out.db);

  const db = new DatabaseSync(out.db);
  try {
    db.exec('PRAGMA journal_mode = DELETE');
    db.exec('PRAGMA temp_store = MEMORY');
    db.exec('PRAGMA cache_size = -524288');

    if (args.prune) {
      await timed(`dropping ${PRUNABLE_INDEXES.length} build-only indexes`, () => {
        for (const index of PRUNABLE_INDEXES) db.exec(`DROP INDEX IF EXISTS ${index}`);
      });
    }

    if (args['optimize-fts']) {
      await timed('optimizing FTS5 indexes', () => {
        db.exec("INSERT INTO hadith_fts(hadith_fts) VALUES ('optimize')");
        db.exec("INSERT INTO narrator_fts(narrator_fts) VALUES ('optimize')");
      });
    }

    await timed('ANALYZE', () => db.exec('ANALYZE'));

    if (args['page-size']) {
      const size = Number(args['page-size']);
      if (!Number.isInteger(size) || size < 512 || size > 65536 || (size & (size - 1)) !== 0) {
        throw new Error(`--page-size must be a power of two between 512 and 65536, got ${args['page-size']}`);
      }
      // Only takes effect on the VACUUM below, which is why it is set here.
      db.exec(`PRAGMA page_size = ${size}`);
    }

    await timed('VACUUM', () => db.exec('VACUUM'));

    const check = args['full-check'] ? 'integrity_check' : 'quick_check';
    const result = await timed(`PRAGMA ${check}`, () => db.prepare(`PRAGMA ${check}`).get());
    const verdict = String(Object.values(result)[0]);
    if (verdict !== 'ok') throw new Error(`${check} failed: ${verdict}`);

    const pageSize = db.prepare('PRAGMA page_size').get().page_size;
    const pageCount = db.prepare('PRAGMA page_count').get().page_count;
    const encoding = db.prepare('PRAGMA encoding').get().encoding;

    console.log(`\n  page_size ${pageSize} · page_count ${pageCount.toLocaleString()} · ${encoding}`);
    if (encoding !== 'UTF-8') {
      throw new Error(`Distribution database must be UTF-8, found ${encoding}`);
    }

    db.close();

    const afterBytes = fileSize(out.db);
    const sha256 = await timed('sha256', () => sha256File(out.db));

    console.log(
      `\n  ${megabytes(beforeBytes)} -> ${megabytes(afterBytes)} ` +
        `(${(((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1)}% smaller)`
    );
    console.log(`  sha256 ${sha256}`);
    console.log(`\n  Next: node scripts/chunk-db.mjs --version ${version}`);
  } catch (error) {
    try {
      db.close();
    } catch {
      // Already closed, or never opened cleanly. The original error is the news.
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(`\nbuild-distribution-db failed: ${error.message}`);
  process.exitCode = 1;
});
