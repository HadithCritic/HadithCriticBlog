/**
 * Edge caching for the on-demand corpus pages.
 *
 * The corpus routes are server rendered because they read D1, and D1 bills
 * rows read. That makes repeat traffic — a crawler walking the collections, a
 * reader paging back and forth — pure cost for a byte-identical page. Cutting
 * the wasteful counts (src/lib/corpus-count.ts) fixed the per-request price;
 * this stops the same request being paid for twice.
 *
 * Cloudflare does not cache HTML from a Worker on its own, so `s-maxage` alone
 * changes nothing here and the Cache API has to be addressed directly.
 *
 * A page opts in by setting its own `Cache-Control` with an `s-maxage`, and
 * only on a successful read. That keeps the decision next to the query it
 * protects and, more importantly, means a page that fell back to "temporarily
 * unavailable" is never the thing that gets stored: caching a quota failure
 * would turn a few bad minutes into a bad hour.
 */

/** How long a corpus page stays served from the edge. */
export const CORPUS_TTL = 600;

/** The opt-in header. Browsers revalidate; the edge holds it for `CORPUS_TTL`. */
export const CORPUS_CACHE_CONTROL = `public, max-age=0, s-maxage=${CORPUS_TTL}`;

/**
 * Routes allowed to be cached, so nothing personalized can be.
 *
 * The register is here as well as the corpus. Both are public, read-only and
 * identical for every visitor, and the register was the more expensive of the
 * two before its aggregates were stored. `/narrators/compare` is included by
 * the prefix and is fine: it takes ids from the query string, which is part of
 * the cache key.
 */
const CACHEABLE = /^\/(?:hadith|narrators)(\/|$)/;

export const isCacheablePath = (pathname: string) => CACHEABLE.test(pathname);

/**
 * Whether a rendered response asked to be cached.
 *
 * `s-maxage` is the opt-in marker rather than mere cacheability: the JSON
 * endpoints send `max-age` for browsers and should not be stored at the edge
 * under a key that ignores their headers.
 */
export const wantsEdgeCache = (response: Response) =>
  response.status === 200 && /s-maxage=[1-9]/.test(response.headers.get('Cache-Control') || '');
