/**
 * Point the site at the committed test fixture instead of the real corpus.
 *
 * `src/data/corpus-meta.json` is what every prerendered page reads its totals,
 * collection list and register facets from, and it is also where the corpus
 * version comes from. A build that serves the fixture chunks while claiming
 * 276,347 narrations would be internally inconsistent: the catalogue would list
 * 33 collections that are not in the file, and the register would report a
 * total it cannot page through.
 *
 * So a fixture run swaps both generated files before building. This overwrites
 * tracked files on purpose, and says so loudly, because a CI runner is
 * disposable and a developer's checkout is not. `--restore` puts them back from
 * git.
 *
 * Usage:
 *   node scripts/use-corpus-fixture.mjs
 *   node scripts/use-corpus-fixture.mjs --restore
 */

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { ROOT, heading, parseArgs } from './lib/corpus-dist.mjs';

const FIXTURE_ROOT = path.join(ROOT, 'tests', 'fixtures', 'corpus');

/**
 * The fixture's directory is named for its contents, so a rebuild changes it.
 * Find it rather than hardcode it; there is exactly one.
 */
function findFixture() {
  if (!existsSync(FIXTURE_ROOT)) return null;
  const candidates = readdirSync(FIXTURE_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith('fixture'))
    .map((e) => path.join(FIXTURE_ROOT, e.name));

  if (candidates.length > 1) {
    console.error(
      `More than one corpus fixture in ${FIXTURE_ROOT}:\n  ${candidates.join('\n  ')}\n` +
        'Delete the stale one; a rebuild should leave exactly one behind.'
    );
    process.exit(1);
  }
  return candidates[0] ?? null;
}

const SWAPPED = [
  ['corpus-meta.json', path.join('src', 'data', 'corpus-meta.json')],
  ['narrator-sitemap.json', path.join('src', 'data', 'narrator-sitemap.json')]
];

const args = parseArgs();

if (args.restore) {
  heading('RESTORE REAL CORPUS METADATA');
  execFileSync('git', ['checkout', '--', ...SWAPPED.map(([, to]) => to)], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log('  Restored from git.');
  process.exit(0);
}

heading('USE CORPUS FIXTURE');

const fixture = findFixture();
if (!fixture) {
  console.error(
    `\nNo corpus fixture in ${FIXTURE_ROOT}.\n` +
      'Rebuild it with: npm run build:corpus:fixture (needs the master database)'
  );
  process.exit(1);
}

console.log(`  ${path.basename(fixture)}`);

for (const [from, to] of SWAPPED) {
  const source = path.join(fixture, from);
  if (!existsSync(source)) {
    console.error(
      `\nMissing ${source}.\nRebuild it with: npm run build:corpus:fixture (needs the master database)`
    );
    process.exit(1);
  }
  copyFileSync(source, path.join(ROOT, to));
  console.log(`  ${to} <- fixture`);
}

console.log('\n  These are tracked files and are now modified.');
console.log('  Undo with: npm run use:corpus-real');
