import { defineMiddleware } from 'astro:middleware';
import { isCacheablePath, wantsEdgeCache } from './lib/edge-cache';

/**
 * Serve the corpus and register pages from Cloudflare's cache when they have
 * already been rendered.
 *
 * Scope is deliberately narrow. Only GET, only the /hadith and /narrators
 * routes, only responses that opted in by sending an `s-maxage` (see
 * src/lib/edge-cache.ts), and only when no cookie is present — a signed-in
 * editor gets the live page, and nothing personalized can be stored under a
 * shared key. Everything else passes straight through.
 *
 * A miss is not allowed to fail the request: if the Cache API is unavailable,
 * as it is under `astro dev`, the page still renders and simply is not stored.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const cache = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches?.default;
  const eligible =
    context.request.method === 'GET' &&
    isCacheablePath(context.url.pathname) &&
    !context.request.headers.has('Cookie');

  if (!cache || !eligible) return next();

  // Keyed on the URL alone. The rendered page varies by path and query string
  // and by nothing else, so a bare GET is the whole identity of the request.
  const key = new Request(context.url.toString(), { method: 'GET' });

  try {
    const hit = await cache.match(key);
    if (hit) return hit;
  } catch {
    // An unreadable cache is a miss, not an error.
  }

  const response = await next();
  if (!wantsEdgeCache(response)) return response;

  try {
    // `waitUntil` so storing the copy does not sit between the reader and the
    // page. The clone is required: the original body is still being consumed.
    // `cfContext` is the adapter's current name for the ExecutionContext; the
    // older `locals.runtime.ctx` is a deprecated getter and untyped.
    const store = cache.put(key, response.clone());
    if (context.locals.cfContext) context.locals.cfContext.waitUntil(store);
    else await store;
  } catch {
    // Not storing it costs a re-render later and nothing now.
  }

  return response;
});
