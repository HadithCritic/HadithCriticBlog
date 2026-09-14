/**
 * Serve the built corpus to `astro dev`, with real HTTP range support.
 *
 * The corpus is 1.6 GB. Putting it in `public/` would work, and would then be
 * copied into `dist/` on every single build, so it lives in `dist-db/builds/`
 * and is published to the deploy output by scripts/publish-corpus.mjs instead.
 * This plugin is what makes `/data/corpus/...` resolve during development, from
 * exactly the bytes that will be published.
 *
 * Range handling is the whole point rather than a nicety. `sql.js-httpvfs`
 * probes the server before it will open a database: it needs `Accept-Ranges`,
 * a 206 with a correct `Content-Range`, and a `Content-Length` it can trust. A
 * static handler that quietly answers 200 with the whole chunk makes SQLite
 * read garbage, and the failure surfaces as a corrupt-database error rather
 * than anything pointing here.
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';

import { BUILDS_DIR } from './corpus-dist.mjs';

const PREFIX = '/data/corpus/';

const CONTENT_TYPES = {
  '.json': 'application/json; charset=utf-8'
};

/**
 * Only `<version>/manifest.json`, `<version>/corpus-meta.json` and
 * `<version>/chunks/<name>` resolve, and every segment is checked: this reads
 * from disk on a path taken from a URL, and dev servers get pointed at by
 * pages the developer did not write.
 */
function resolveCorpusFile(pathname) {
  const rest = decodeURIComponent(pathname.slice(PREFIX.length));
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

  const file = path.join(BUILDS_DIR, version, relative);
  const root = path.join(BUILDS_DIR, version);
  if (!file.startsWith(root + path.sep)) return null;
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  return file;
}

/** `bytes=0-4095`, `bytes=4096-`, `bytes=-1024`. Anything else is unsatisfiable. */
function parseRange(header, size) {
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

export function corpusDevServer() {
  return {
    name: 'hadithcritic:corpus-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!url.startsWith(PREFIX)) return next();

        const file = resolveCorpusFile(url);
        if (!file) {
          res.statusCode = 404;
          res.end(
            `No corpus file at ${url}.\n` +
              'Build and stage one with: npm run build:corpus\n'
          );
          return;
        }

        const size = statSync(file).size;
        const type = CONTENT_TYPES[path.extname(file)] || 'application/octet-stream';

        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', type);
        // Versioned paths are immutable, and the browser caching them is what
        // makes a second search cost nothing.
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        if (req.method === 'HEAD') {
          res.setHeader('Content-Length', String(size));
          res.statusCode = 200;
          res.end();
          return;
        }

        const range = req.headers.range ? parseRange(req.headers.range, size) : null;

        if (req.headers.range && !range) {
          res.statusCode = 416;
          res.setHeader('Content-Range', `bytes */${size}`);
          res.end();
          return;
        }

        if (range) {
          res.statusCode = 206;
          res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
          res.setHeader('Content-Length', String(range.end - range.start + 1));
          createReadStream(file, { start: range.start, end: range.end }).pipe(res);
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Length', String(size));
        createReadStream(file).pipe(res);
      });
    }
  };
}
