/**
 * A byte-serving origin for the corpus, for end-to-end tests.
 *
 * The tests run against the built site under `astro preview`, which is
 * `wrangler` serving Cloudflare static assets, and those answer a range request
 * with `200` and the whole file. The corpus cannot be read from such a host at
 * all: `openCorpus()` probes for `206` and refuses. So the corpus is served
 * here instead, on its own port, the way it is served in production from R2.
 *
 * That makes the test arrangement match the deployed one rather than diverge
 * from it, and it means the cross-origin path gets exercised too: a browser
 * will not send a cross-origin range request unless CORS allows the `Range`
 * header, which is the single most likely way an R2 deployment breaks.
 *
 * Usage:
 *   node scripts/corpus-file-server.mjs [--root <dir>] [--port 4322]
 */

import http from 'node:http';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { BUILDS_DIR, ROOT, parseArgs } from './lib/corpus-dist.mjs';
import { serveCorpusFile } from './lib/corpus-range.mjs';

const args = parseArgs();
const port = Number(args.port) || Number(process.env.CORPUS_PORT) || 4322;

/**
 * Several roots, tried in order, so the same server answers for a fixture build
 * and for a real one without being told which is running. Which corpus the site
 * asks for is decided at build time by its version; this just has to be able to
 * find it.
 */
const roots = (
  typeof args.root === 'string'
    ? [args.root]
    : process.env.CORPUS_ROOT
      ? [process.env.CORPUS_ROOT]
      : [path.join('tests', 'fixtures', 'corpus'), BUILDS_DIR]
)
  .map((dir) => path.resolve(ROOT, dir))
  .filter((dir) => existsSync(dir));

if (!roots.length) {
  console.error(
    'corpus-file-server: no corpus root found\n' +
      'Build one with `npm run build:corpus`, or a fixture with `npm run build:corpus:fixture`.'
  );
  process.exit(1);
}

const versions = roots.flatMap((dir) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
);

if (!versions.length) {
  console.error(`corpus-file-server: ${roots.join(', ')} hold no corpus versions`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  // Playwright waits on this before starting the run, and a 404 would read as
  // "not up yet" until it timed out.
  if ((req.url || '').split('?')[0] === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', roots, versions }));
    return;
  }

  for (const dir of roots) {
    if (serveCorpusFile(dir, req, res, { cors: true, quiet: dir !== roots[roots.length - 1] })) {
      return;
    }
  }
  res.statusCode = 404;
  res.end('Only /data/corpus/... is served here.\n');
});

server.listen(port, '127.0.0.1', () => {
  for (const dir of roots) console.log(`corpus-file-server: root ${dir}`);
  console.log(`corpus-file-server: versions ${versions.join(', ')}`);
  console.log(`corpus-file-server: listening on http://127.0.0.1:${port}/`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
