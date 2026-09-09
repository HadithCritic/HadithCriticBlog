import { tursoConnect, tursoTarget } from './lib/turso.mjs';

/**
 * Recompute the derived totals and facet counts in `corpus_stat` and
 * `narrator_facet`.
 *
 * Run this after any import that changes the corpus or the register. Nothing
 * reads these tables for correctness — they are a cache of aggregates the pages
 * used to compute per view — but a stale cache shows the reader a wrong count,
 * so treat it as part of the import, not an optional extra.
 *
 * Every statement is an `INSERT ... SELECT`, so the aggregates run inside the
 * database and only the final numbers cross the network. The whole refresh is
 * a handful of small requests, and the row reads it costs are the ones the
 * pages no longer pay on every view.
 *
 * Usage:
 *   node scripts/refresh-stats.mjs
 *   node scripts/refresh-stats.mjs --check    # report drift, change nothing
 */

const conn = tursoConnect();
const check = process.argv.includes('--check');

/**
 * The stored totals, each with the query that defines it.
 *
 * `narrator_named` is the count of identified transmitters — the register's own
 * baseline, since every one of its queries starts `WHERE unnamed = 0`. It is
 * also the "Transmitters" figure in the corpus hero, which is the same number
 * asked for by a different page.
 *
 * `hadith_narrations` is summed from `hadith_book.hadith_count` rather than
 * counted over `hadith`, for the reason in src/lib/corpus-count.ts: the stored
 * per-collection totals are exact, and verify-corpus asserts it.
 */
const STATS = {
  hadith_narrations: 'SELECT COALESCE(SUM(hadith_count), 0) AS v FROM hadith_book',
  hadith_collections: 'SELECT COUNT(*) AS v FROM hadith_book',
  narrator_named: 'SELECT COUNT(*) AS v FROM narrator WHERE unnamed = 0',
  narrator_graded:
    'SELECT COUNT(*) AS v FROM narrator WHERE unnamed = 0 AND critic_count > 0',
  narrator_dated:
    'SELECT COUNT(*) AS v FROM narrator WHERE unnamed = 0 AND death_hijri IS NOT NULL'
};

/**
 * The register's filter chips, in display order.
 *
 * Every grade is stored, not the top eight. The register shows eight and
 * /api/narrator-facets returns all fourteen, so storing the page's `LIMIT 8`
 * would have quietly dropped six grades from the API. The cap belongs to the
 * page, and the page applies it.
 */
const FACETS = {
  generation: `SELECT generation AS value, COUNT(*) AS n FROM narrator
                WHERE unnamed = 0 AND generation <> ''
                GROUP BY generation ORDER BY n DESC`,
  grade: `SELECT grade AS value, COUNT(*) AS n FROM narrator
           WHERE unnamed = 0 AND grade <> ''
           GROUP BY grade ORDER BY n DESC`,
  century: `SELECT ((death_hijri - 1) / 100) + 1 AS value, COUNT(*) AS n FROM narrator
             WHERE unnamed = 0 AND death_hijri IS NOT NULL
             GROUP BY value ORDER BY value`
};

console.log(`${check ? 'Checking' : 'Refreshing'} derived stats on ${tursoTarget()}\n`);

let drift = 0;

console.log('totals');
for (const [key, query] of Object.entries(STATS)) {
  const fresh = Number((await conn.all(query))[0].v);
  const storedRow = (await conn.all('SELECT value FROM corpus_stat WHERE key = ?', key))[0];
  const stored = storedRow ? Number(storedRow.value) : null;
  const same = stored === fresh;
  if (!same) drift += 1;
  console.log(
    `  ${same ? 'ok  ' : 'DIFF'} ${key.padEnd(20)} ${fresh.toLocaleString().padStart(10)}` +
      (same ? '' : `   (stored ${stored === null ? 'missing' : stored.toLocaleString()})`)
  );
  if (!check && !same) {
    await conn.run(
      'INSERT INTO corpus_stat (key, value) VALUES (?, ?) ' +
        'ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key,
      fresh
    );
  }
}

console.log('\nfacets');
for (const [kind, query] of Object.entries(FACETS)) {
  const fresh = await conn.all(query);
  const stored = await conn.all(
    'SELECT value, n FROM narrator_facet WHERE kind = ? ORDER BY ord',
    kind
  );
  const same =
    stored.length === fresh.length &&
    fresh.every((r, i) => String(stored[i].value) === String(r.value) && Number(stored[i].n) === Number(r.n));
  if (!same) drift += 1;
  console.log(
    `  ${same ? 'ok  ' : 'DIFF'} ${kind.padEnd(20)} ${String(fresh.length).padStart(3)} value(s)` +
      (same ? '' : `   (stored ${stored.length})`)
  );
  if (!check && !same) {
    await conn.run('DELETE FROM narrator_facet WHERE kind = ?', kind);
    // One batch: a half-written facet would render a filter bar missing chips.
    await conn.batch(
      fresh.map((row, i) => ({
        sql: 'INSERT INTO narrator_facet (kind, value, n, ord) VALUES (?, ?, ?, ?)',
        args: [kind, String(row.value), Number(row.n), i]
      })),
      'write'
    );
  }
}

if (check) {
  console.log(`\n${drift === 0 ? 'up to date' : `${drift} group(s) stale — run without --check`}`);
  process.exit(drift === 0 ? 0 : 1);
}
console.log(`\n${drift === 0 ? 'already up to date' : `refreshed ${drift} group(s)`}`);
