/**
 * Serve the static corpus so that range requests are actually cached.
 *
 * ## Why this exists
 *
 * The corpus is read by `sql.js-httpvfs` one SQLite page at a time, with a
 * `Range` header per page, serially, because SQLite's VFS is synchronous. Page
 * latency is therefore request count multiplied by round-trip time, and the
 * round trip is the only half a server can do anything about.
 *
 * Serving the bucket directly through an R2 custom domain does not cache those
 * reads. A Cache Rule on the hostname makes whole-object GETs `HIT`, verified,
 * but every request carrying a `Range` header still answered
 * `cf-cache-status: DYNAMIC`, measured at 185 ms each against 52 ms for a
 * cached asset from the same client. Thirty-four of those is a six second wait
 * on one narration record.
 *
 * So the ranges are served here instead, where the cache key is ours to choose.
 *
 * ## How
 *
 * A client range is widened to the enclosing 1 MiB slice and that slice is
 * cached under a synthetic URL that contains the slice number and no `Range`
 * header. One reader's 4 KiB page read therefore warms the 256 page reads
 * around it, and the next request for any of them is a Cache API hit inside the
 * colo rather than a trip to the bucket.
 *
 * The bucket is reached through an R2 binding, not over HTTP, so a miss is an
 * in-network read rather than a second internet round trip.
 *
 * ## What must not regress
 *
 * `openCorpus()` in src/lib/corpus-client.ts probes with `Range: bytes=0-15`
 * and refuses the corpus unless the answer is `206` with a matching
 * `Content-Range`. That check is load-bearing: given a `200` and a whole file,
 * sql.js-httpvfs copies bytes from offset 0 into the page it believes it asked
 * for, and SQLite reads a database assembled from the wrong pages. It does not
 * error, it returns the wrong narration. Every path below that answers a range
 * answers `206` with a correct `Content-Range`, or answers `416`, and never
 * `200`.
 */

/**
 * How much of the file one cache entry holds.
 *
 * Cloudflare aligns its own origin range fetches to 1 MiB, so this matches the
 * grain the platform already works in. Larger would warm more per miss but
 * costs more subrequest bytes on a cold read of a random page; 1 MiB is 256
 * SQLite pages at the current 4 KiB page size, which covers a record page's
 * whole working set in a handful of misses.
 */
const SLICE_SIZE = 1024 * 1024;

/** Versioned corpus paths are immutable, so a year is the honest answer. */
const IMMUTABLE = 'public, max-age=31536000, immutable';

/**
 * The manifest points at a version and a rollback has to be able to take
 * effect, so it is deliberately not immutable.
 */
const MANIFEST_CACHE = 'public, max-age=300, s-maxage=3600';

/**
 * Origins allowed to range-request the corpus.
 *
 * Both hostnames, because www serves the site directly rather than redirecting
 * to the apex. A reader who arrives on one that is not listed gets no corpus at
 * all: the browser refuses to send the cross-origin `Range` and the page never
 * leaves its loading state.
 */
const DEFAULT_ORIGINS = 'https://hadithcriticblog.com,https://www.hadithcriticblog.com';

const allowedOrigins = (env) =>
  (env.CORPUS_ALLOWED_ORIGIN || DEFAULT_ORIGINS).split(',').map((o) => o.trim()).filter(Boolean);

function corsHeaders(request, env, headers = new Headers()) {
  const origin = request.headers.get('Origin');
  const allowed = allowedOrigins(env);

  if (origin && allowed.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.append('Vary', 'Origin');
  } else if (!origin) {
    // curl, a crawler, a same-origin fetch. Nothing to negotiate.
    headers.set('Access-Control-Allow-Origin', '*');
  }

  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'range, if-match, if-none-match');
  headers.set('Access-Control-Expose-Headers', 'content-range, accept-ranges, content-length, etag');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

/**
 * Parse a single-range `bytes=` header.
 *
 * Only the forms sql.js-httpvfs emits are honoured: `bytes=from-to` and
 * `bytes=from-`. A multi-range request, which the library never sends, is
 * treated as no range rather than answered wrongly.
 */
function parseRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (rawStart === '' && rawEnd === '') return null;

  let start;
  let end;
  if (rawStart === '') {
    // A suffix range: the last N bytes.
    const suffix = Number(rawEnd);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === '' ? size - 1 : Number(rawEnd);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start > end || start >= size) return { unsatisfiable: true };
  return { start, end: Math.min(end, size - 1) };
}

const isManifest = (key) => key.endsWith('manifest.json') || key.endsWith('corpus-meta.json');

function contentTypeFor(key) {
  if (key.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

/**
 * Read one aligned slice, from the colo cache if it is there and from the
 * bucket if it is not.
 *
 * The cache key carries the slice number and no `Range` header, which is the
 * whole point: every client range that lands inside this slice maps to this one
 * entry.
 */
async function readSlice(request, env, ctx, key, sliceIndex, objectSize) {
  const cache = caches.default;
  const cacheUrl = new URL(request.url);
  cacheUrl.search = '';
  cacheUrl.pathname = `/__slice/${SLICE_SIZE}/${sliceIndex}/${cacheUrl.pathname.replace(/^\//, '')}`;
  const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) {
    return { body: await cached.arrayBuffer(), hit: true };
  }

  const sliceStart = sliceIndex * SLICE_SIZE;
  const sliceEnd = Math.min(sliceStart + SLICE_SIZE, objectSize) - 1;

  const object = await env.CORPUS.get(key, {
    range: { offset: sliceStart, length: sliceEnd - sliceStart + 1 }
  });
  if (!object) return null;

  const body = await object.arrayBuffer();

  // Stored without a Range header and with its own length, so it round-trips
  // through the cache as an ordinary 200.
  ctx.waitUntil(
    cache.put(
      cacheKey,
      new Response(body, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(body.byteLength),
          'Cache-Control': IMMUTABLE
        }
      })
    )
  );

  return { body, hit: false };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      // A cross-origin request carrying `Range` is preflighted. Without this the
      // browser never sends the real request and the corpus never loads.
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders(request, env, new Headers({ Allow: 'GET, HEAD, OPTIONS' }))
      });
    }

    let key;
    try {
      key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    } catch {
      return new Response('Bad request', { status: 400, headers: corsHeaders(request, env) });
    }

    if (!key || key.includes('..')) {
      return new Response('Not found', { status: 404, headers: corsHeaders(request, env) });
    }

    const rangeHeader = request.headers.get('Range');

    // The manifest and the metadata are small, whole-file reads. Let the normal
    // CDN cache have them; a Cache Rule on this hostname already makes JSON
    // eligible, and they are the one thing that must stay revalidatable.
    if (!rangeHeader) {
      const object = await env.CORPUS.get(key);
      if (!object) {
        return new Response('Not found', { status: 404, headers: corsHeaders(request, env) });
      }

      const headers = corsHeaders(request, env);
      object.writeHttpMetadata(headers);
      headers.set('Content-Type', contentTypeFor(key));
      headers.set('Cache-Control', isManifest(key) ? MANIFEST_CACHE : IMMUTABLE);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('ETag', object.httpEtag);

      return new Response(request.method === 'HEAD' ? null : object.body, { status: 200, headers });
    }

    // A range read. Everything below answers 206 or 416, never 200.
    const head = await env.CORPUS.head(key);
    if (!head) {
      return new Response('Not found', { status: 404, headers: corsHeaders(request, env) });
    }

    const size = head.size;
    const parsed = parseRange(rangeHeader, size);

    if (!parsed) {
      return new Response('Unsupported range', {
        status: 400,
        headers: corsHeaders(request, env)
      });
    }

    if (parsed.unsatisfiable) {
      const headers = corsHeaders(request, env);
      headers.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const { start, end } = parsed;
    const firstSlice = Math.floor(start / SLICE_SIZE);
    const lastSlice = Math.floor(end / SLICE_SIZE);

    /**
     * A read that straddles slices is rare but has to be correct. The read-ahead
     * in sql.js-httpvfs grows to 5 MiB on sequential access, so this is the
     * normal path during a table scan, not an edge case.
     */
    const parts = [];
    let hits = 0;
    for (let index = firstSlice; index <= lastSlice; index += 1) {
      const slice = await readSlice(request, env, ctx, key, index, size);
      if (!slice) {
        return new Response('Not found', { status: 404, headers: corsHeaders(request, env) });
      }
      if (slice.hit) hits += 1;

      const sliceStart = index * SLICE_SIZE;
      const from = Math.max(start, sliceStart) - sliceStart;
      const to = Math.min(end, sliceStart + slice.body.byteLength - 1) - sliceStart;
      parts.push(new Uint8Array(slice.body, from, to - from + 1));
    }

    const length = parts.reduce((total, part) => total + part.byteLength, 0);
    const body = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
      body.set(part, offset);
      offset += part.byteLength;
    }

    const headers = corsHeaders(request, env);
    headers.set('Content-Type', contentTypeFor(key));
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(length));
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', isManifest(key) ? MANIFEST_CACHE : IMMUTABLE);
    headers.set('ETag', head.httpEtag);
    // Which slices answered from the colo, for measuring this without guessing.
    headers.set('X-Corpus-Slice-Cache', `${hits}/${parts.length}`);

    return new Response(request.method === 'HEAD' ? null : body, { status: 206, headers });
  }
};
