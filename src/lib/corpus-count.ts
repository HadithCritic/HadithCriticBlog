/**
 * Row-read budgeting for the corpus queries.
 *
 * D1 bills every row a query touches, index rows included, and the corpus is
 * 276,347 narrations. An unqualified `COUNT(*) FROM hadith` therefore costs a
 * quarter of a million reads to produce one integer, and it was being run on
 * every view of /hadith and every call to /api/hadith. Sixteen page views
 * exhausted the whole account's daily allowance, after which every other
 * query — including the cheap 25-row reads behind a collection page — was
 * refused with "exceeded D1's free tier daily row read limit". That is what
 * put "This collection is temporarily unavailable" on collection pages that
 * were themselves costing almost nothing. See DATABASE.md.
 *
 * Two rules come out of that, and both are applied here:
 *
 *   1. A total that is already stored is never recounted. `hadith_book`
 *      carries `hadith_count` per collection, so corpus and per-collection
 *      totals come off 33 rows instead of a scan.
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
 * Deepest page the result pager will offer. D1 walks and discards every row an
 * OFFSET skips, so page 401 of a 25-row page costs 10,000 reads before it
 * returns anything. Refine the query instead — this is the same ceiling
 * search engines apply, for the same reason.
 */
export const MAX_PAGES = Math.floor(COUNT_CAP / 25);

/**
 * A `COUNT(*)` that stops once the cap is reached.
 *
 * Wrapping the row source in a `LIMIT`ed subquery is what bounds the cost:
 * SQLite stops feeding rows at the limit, so the count touches at most
 * `COUNT_CAP + 1` of them however many actually match. The extra row is the
 * signal — a result of exactly `COUNT_CAP + 1` means "at least this many",
 * which is what `readCount` reports back.
 */
export const boundedCountSql = (from: string, clause: string) =>
  `SELECT COUNT(*) AS n FROM (SELECT 1 ${from} ${clause} LIMIT ${COUNT_CAP + 1})`;

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
