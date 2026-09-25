/**
 * Row-read budgeting for the corpus queries.
 *
 * These shapes were written when the corpus was on D1, which bills every row a
 * query touches. An unqualified `COUNT(*) FROM hadith` cost a quarter of a
 * million reads to produce one integer, and it ran on every view of /hadith.
 * Sixteen page views exhausted the account's daily allowance, after which even
 * the cheap 25-row reads behind a collection page were refused. See
 * DATABASE.md.
 *
 * That bill is gone. The corpus is now a static SQLite file the browser reads
 * over HTTP range requests, and nothing is metered. The arithmetic is kept
 * because the cost simply changed units. Every row SQLite touches that is not
 * already in the page cache is a 4 KiB range request over the network, so a
 * scan that cost 276,347 billed rows now costs an unbounded series of round
 * trips on someone's phone. If anything the ceilings matter more here: a
 * quota failure was a bad afternoon, and this is a reader watching a spinner.
 *
 * Two rules come out of that, and both are applied here:
 *
 *   1. A total that is already stored is never recounted. `hadith_book`
 *      carries `hadith_count` per collection, and src/data/corpus-meta.json
 *      carries the corpus and register totals, so those come off stored data
 *      rather than a scan.
 *   2. A total that must be counted is counted to a ceiling. Past a few
 *      hundred results the exact figure is not information a reader uses, and
 *      "10,000+" is both honest and bounded.
 */

/**
 * Most rows any single count is allowed to touch. Also the point past which a
 * total is reported as approximate.
 */
export const COUNT_CAP = 10_000;

/**
 * Deepest page the result pager will offer. SQLite walks and discards every row
 * an OFFSET skips, so page 401 of a 25-row page costs 10,000 reads before it
 * returns anything. Refine the query instead. This is the same ceiling
 * search engines apply, for the same reason.
 */
export const MAX_PAGES = Math.floor(COUNT_CAP / 25);

/**
 * A `COUNT(*)` that stops once the cap is reached.
 *
 * Wrapping the row source in a `LIMIT`ed subquery is what bounds the cost:
 * SQLite stops feeding rows at the limit, so the count touches at most
 * `COUNT_CAP + 1` of them however many actually match. The extra row is the
 * signal: a result of exactly `COUNT_CAP + 1` means "at least this many",
 * which is what `readCount` reports back.
 */
export const boundedCountSql = (from: string, clause: string) =>
  `SELECT COUNT(*) AS n FROM (SELECT 1 ${from} ${clause} LIMIT ${COUNT_CAP + 1})`;

/**
 * Count matches for a full-text query without touching `hadith` at all.
 *
 * The generic form above counts rows of the *joined* result, so it drags
 * `hadith` and `hadith_book` in behind the FTS scan: 30,002 rows touched where
 * the index alone answers in 10,000. Over range requests that ratio is the
 * difference between reading the posting list and reading the narration text
 * of every match. Historical measurements are in docs/corpus-performance.md.
 *
 * Only valid when the query is the single filter. With a book or narrator
 * clause as well, this would count matches the reader is not being shown.
 */
export const ftsCountSql = () =>
  `SELECT COUNT(*) AS n FROM (SELECT rowid FROM hadith_fts WHERE hadith_fts MATCH ? LIMIT ${COUNT_CAP + 1})`;

/**
 * Read a collection's total from `hadith_book` instead of counting its rows.
 *
 * This is rule 1 above applied to the one filter that has a stored answer. The
 * generic bounded count stops at the cap, so a collection larger than the cap
 * reported "10,000+" for a figure the corpus already holds exactly: Musannaf
 * Ibn Abi Shaybah has 39,096 narrations and the catalogue said so on the page
 * before the reader filtered by it. One indexed row read replaces 10,001, and
 * the answer is exact rather than a floor.
 *
 * It comes off the corpus rather than corpus-meta.json on purpose: the count
 * then cannot disagree with the rows being paged through, whatever metadata a
 * build was generated from.
 *
 * Only valid when the collection is the single filter, like the shapes around
 * it; with a query or a narrator as well this would be the collection's whole
 * total against a narrower list.
 */
export const bookCountSql = () => `SELECT hadith_count AS n FROM hadith_book WHERE id = ?`;

/**
 * Count the narrations a narrator appears in, from the chain index alone.
 *
 * The generic form scans `hadith` and evaluates an EXISTS per row, 197,064
 * rows touched and 441 ms, because `ORDER BY h.id` with an EXISTS filter walks
 * the table. Driven from `idx_hn_narrator (narrator_id, hadith_id)` instead it is
 * 10,131 rows and 11 ms for the same answer.
 *
 * `DISTINCT` is required, not tidiness: a narrator can occupy several
 * positions in one chain, and `hadith_narrator` has a row per position. For
 * narrator 5361 that is 10,485 rows against 8,693 narrations, so counting rows
 * would overstate by a fifth.
 */
export const narratorCountSql = () =>
  `SELECT COUNT(*) AS n FROM (SELECT DISTINCT hadith_id FROM hadith_narrator WHERE narrator_id = ? LIMIT ${COUNT_CAP + 1})`;

/**
 * Rank on the index, then fetch only the page of rows that survived.
 *
 * `ORDER BY bm25(...) LIMIT 25` over a joined query does not stop at 25: FTS5
 * has to score every match, and with the join in place SQLite materialises the
 * text of all of them into a temp b-tree before sorting. For a term matching
 * 18,565 narrations that measured 74,260 rows read and 2,190 ms. Ranking
 * inside a CTE first, where there is nothing to materialise but a rowid and a
 * score, then joining the 25 survivors, is 37,180 rows and 22 ms for
 * byte-identical output.
 *
 * A hundredfold on latency is the point. Search felt slow because it was.
 *
 * Like the counts above, only valid when the query is the single filter: the
 * CTE's LIMIT is applied before any other clause could be, so a book filter
 * would narrow the 25 already chosen rather than the corpus.
 */
export const ftsPageSql = (columns: string, order: string) =>
  `WITH ranked AS (
     SELECT rowid AS hadith_id, ${order} AS score
       FROM hadith_fts WHERE hadith_fts MATCH ?
      ORDER BY score ASC LIMIT ? OFFSET ?
   )
   SELECT ${columns}
     FROM ranked
     JOIN hadith h ON h.id = ranked.hadith_id
     JOIN hadith_book b ON b.id = h.book_id
    ORDER BY ranked.score ASC`;

export interface CountResult {
  /** Matches found, never above `COUNT_CAP` when `approximate` is set. */
  total: number;
  /** True when counting stopped at the cap, so `total` is a floor. */
  approximate: boolean;
}

/** Read a `boundedCountSql` result, folding the sentinel row into a flag. */
export const readCount = (n: unknown): CountResult => {
  const counted = Number(n ?? 0);
  return counted > COUNT_CAP
    ? { total: COUNT_CAP, approximate: true }
    : { total: counted, approximate: false };
};

/** An exact total that came from stored data and needed no counting. */
export const exactCount = (total: number): CountResult => ({
  total,
  approximate: false
});

/** "1,204 narrations", or "10,000+ narrations" when the count was capped. */
export const formatCount = ({ total, approximate }: CountResult) =>
  `${total.toLocaleString()}${approximate ? '+' : ''}`;

/** Pages of `size` results, held to `MAX_PAGES`. */
export const pageCount = ({ total }: CountResult, size: number) =>
  Math.min(MAX_PAGES, Math.max(1, Math.ceil(total / size)));
