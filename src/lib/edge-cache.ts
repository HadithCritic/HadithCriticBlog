/**
 * Edge caching for the two on-demand corpus shells.
 *
 * Only /hadith/[id] and /narrators/[id] reach the Worker now. Everything else
 * under /hadith and /narrators is prerendered and served as a static asset,
 * which never runs this. Those two routes are on demand because their ids are
 * unbounded — 276,347 narrations and 20,950 transmitters cannot be prerendered
 * — not because they need anything at request time. They read no database and
 * perform no I/O at all; the record itself is fetched from the static corpus in
 * the reader's browser.
 *
 * So what is cached here is a shell that depends on the URL and the deployment
 * and nothing else. It was worth caching before because a miss cost billed
 * database rows; it is worth caching now because a hit costs no Worker
 * invocation. The failure mode that shaped the original rule is gone with the
 * database: there is no longer a "temporarily unavailable" variant of these
 * pages that could be stored by mistake.
 *
 * Cloudflare does not cache HTML from a Worker on its own, so `s-maxage` alone
 * changes nothing and the Cache API has to be addressed directly. A page opts
 * in by setting its own `Cache-Control` with an `s-maxage`.
 */

/** How long a corpus shell stays served from the edge. */
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
