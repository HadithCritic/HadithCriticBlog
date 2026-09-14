/**
 * Byte serving for corpus chunks, shared by the dev middleware and the
 * standalone test server.
 *
 * This exists in one place because getting it slightly wrong is undetectable
 * from the outside. `sql.js-httpvfs` sends `Range: bytes=from-to` and then
 * treats the response body as if it began at `from`. A server that answers 200
 * with the whole file, as Cloudflare Pages and Workers static assets currently
 * do, makes SQLite read a database assembled from the wrong pages: no error, no
 * failed request, just the wrong narration.
 *
 * So both callers answer 206 with a correct `Content-Range`, advertise
 * `Accept-Ranges`, and return 416 rather than guessing at an unsatisfiable
 * range.
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';

export const CORPUS_URL_PREFIX = '/data/corpus/';

const CONTENT_TYPES = {
  '.json': 'application/json; charset=utf-8'
};

/**
 * Resolve a corpus URL against a directory of versioned builds.
 *
 * Only `<version>/manifest.json`, `<version>/corpus-meta.json` and
 * `<version>/chunks/<name>` resolve, and every segment is checked: this reads
 * from disk on a path taken from a URL, and a dev server gets pointed at by
 * pages the developer did not write.
 */
export function resolveCorpusFile(root, pathname) {
  if (!pathname.startsWith(CORPUS_URL_PREFIX)) return null;

  let rest;
  try {
    rest = decodeURIComponent(pathname.slice(CORPUS_URL_PREFIX.length));
  } catch {
    return null;
  }
  const segments = rest.split('/').filter(Boolean);

  if (segments.length < 2 || segments.length > 3) return null;
  if (segments.some((s) => s === '.' || s === '..' || s.includes('\\'))) return null;

  const [version, second, third] = segments;
  if (!/^[A-Za-z0-9._-]+$/.test(version)) return null;

  let relative;
  if (segments.length === 2) {
    if (second !== 'manifest.json' && second !== 'corpus-meta.json') return null;
    relative = second;
  } else {
    if (second !== 'chunks' || !/^[A-Za-z0-9._-]+$/.test(third)) return null;
    relative = path.join('chunks', third);
  }

  const versionRoot = path.join(root, version);
  const file = path.join(versionRoot, relative);
  if (!file.startsWith(versionRoot + path.sep)) return null;
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  return file;
}

/** `bytes=0-4095`, `bytes=4096-`, `bytes=-1024`. Anything else is unsatisfiable. */
export function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header || '').trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;

  if (rawStart === '' && rawEnd === '') return null;

  let start;
  let end;
  if (rawStart === '') {
    const suffix = Number(rawEnd);
    if (!suffix) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === '' ? size - 1 : Number(rawEnd);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

/**
 * Answer one corpus request. Returns false when the URL is not a corpus path,
 * so a caller acting as middleware can pass it along.
 *
 * `cors` mirrors what R2 has to be configured with in production: a browser
 * will not send a cross-origin range request unless `Range` is an allowed
 * header, and cannot read the result unless `Content-Range` is exposed.
 */
export function serveCorpusFile(root, req, res, { cors = false, quiet = false } = {}) {
  const url = (req.url || '').split('?')[0];
  if (!url.startsWith(CORPUS_URL_PREFIX)) return false;

  // `quiet` lets a caller try several roots: a miss reports "not handled"
  // rather than writing a 404, so the next root gets a turn.
  if (quiet && !resolveCorpusFile(root, url)) return false;

  if (cors) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'range, if-match, if-none-match');
    res.setHeader('Access-Control-Expose-Headers', 'content-length, content-range, accept-ranges, etag');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return true;
    }
  }

  const file = resolveCorpusFile(root, url);
  if (!file) {
    res.statusCode = 404;
    res.end(`No corpus file at ${url}.\nBuild and stage one with: npm run build:corpus\n`);
    return true;
  }

  const size = statSync(file).size;

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', CONTENT_TYPES[path.extname(file)] || 'application/octet-stream');

  /**
   * Chunks are immutable and the browser caching them is what makes a second
   * search cost nothing. The manifest is not: it names the chunk count and the
   * database length, so a cached one from a previous build describes a corpus
   * that is no longer there. Caching it for a year made a rebuilt fixture read
   * as 41 chunks of a file that now had 2, and SQLite answered queries with
   * missing rows rather than failing. It also has to stay short-lived for a
   * rollback to take effect at all. This matches public/_headers.
   */
  const immutable = path.basename(path.dirname(file)) === 'chunks';
  res.setHeader(
    'Cache-Control',
    immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=60'
  );

  if (req.method === 'HEAD') {
    res.setHeader('Content-Length', String(size));
    res.statusCode = 200;
    res.end();
    return true;
  }

  const range = req.headers.range ? parseRange(req.headers.range, size) : null;

  if (req.headers.range && !range) {
    res.statusCode = 416;
    res.setHeader('Content-Range', `bytes */${size}`);
    res.end();
    return true;
  }

  if (range) {
    res.statusCode = 206;
    res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
    res.setHeader('Content-Length', String(range.end - range.start + 1));
    createReadStream(file, { start: range.start, end: range.end }).pipe(res);
    return true;
  }

  res.statusCode = 200;
  res.setHeader('Content-Length', String(size));
  createReadStream(file).pipe(res);
  return true;
}
