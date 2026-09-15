/**
 * Build the site for an end-to-end run, with the corpus on its own origin.
 *
 * The tests serve the built site through `astro preview`, which is `wrangler`
 * serving Cloudflare static assets, and those answer a range request with `200`
 * and the whole file. A corpus cannot be read from such a host: `openCorpus()`
 * probes for `206` and refuses, by design, because the alternative is SQLite
 * silently assembling pages out of the wrong bytes.
 *
 * So the corpus is served by scripts/corpus-file-server.mjs on its own port and
 * the build is pointed at it. That is not a test-only contrivance: it is the
 * same arrangement as production on R2, down to the cross-origin range request
 * and the CORS headers that have to allow it.
 *
 * `--fixture` first swaps in the committed miniature corpus, which is what CI
 * uses because the real one is 1.62 GB and not in git.
 *
 * Usage:
 *   node scripts/build-for-e2e.mjs [--fixture] [--port 4322]
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { ROOT, heading, parseArgs } from './lib/corpus-dist.mjs';

const args = parseArgs();
const port = Number(args.port) || Number(process.env.CORPUS_PORT) || 4322;
const base = `http://127.0.0.1:${port}/data/corpus/`;

const run = (command, argv, env) => {
  /**
   * `npm` is a batch file on Windows, and since Node 20.12 spawning one without
   * a shell is refused outright, so it gets `shell: true` and Node's DEP0190
   * warning with it. `node` must not get one, or the interpreter path is split
   * on the space in "Program Files". Nothing here takes an argument from
   * outside the file, which is what DEP0190 is about.
   */
  const shell = process.platform === 'win32' && command === 'npm';
  const result = spawnSync(command, argv, {
    cwd: ROOT,
    stdio: 'inherit',
    shell,
    env: { ...process.env, ...env }
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${argv.join(' ')} exited with ${result.status ?? 'a signal'}`);
  }
};

try {
  heading('BUILD FOR END-TO-END TESTS');

  if (args.fixture) {
    run(process.execPath, [path.join(ROOT, 'scripts', 'use-corpus-fixture.mjs')]);
  }

  console.log(`\n  PUBLIC_CORPUS_BASE_URL=${base}`);
  run('npm', ['run', 'build'], { PUBLIC_CORPUS_BASE_URL: base });

  console.log('\n  Built. `npm run test:e2e` will start the corpus file server itself.');
} catch (error) {
  console.error(`\nbuild-for-e2e failed: ${error.message}`);
  process.exitCode = 1;
}
