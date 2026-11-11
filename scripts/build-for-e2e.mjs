/**
 * Build the site for an end-to-end run.
 *
 * Draft article routes are included with noindex for the reader tests. Their
 * frontmatter and the production build's publication filter stay unchanged.
 *
 * Usage:
 *   node scripts/build-for-e2e.mjs
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * `npm` is a batch file on Windows, and since Node 20.12 spawning one without
 * a shell is refused outright, so it gets `shell: true` there.
 */
const result = spawnSync('npm', ['run', 'build'], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, E2E_DRAFT_ARTICLES: 'true' }
});

if (result.status !== 0) {
  console.error(`\nbuild-for-e2e failed: npm run build exited with ${result.status ?? 'a signal'}`);
  process.exitCode = 1;
}
