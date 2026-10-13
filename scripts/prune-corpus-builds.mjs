/**
 * Remove old corpus builds from dist-db/builds.
 *
 * Keeps the version src/data/corpus-meta.json deploys, the newest other dated
 * builds (one by default, for a local rollback), and any hand-named build such
 * as a pilot. Published versions also live in R2, so a removed local build is a
 * rebuild away, not lost. Reports only, unless --delete is passed.
 *
 * Usage:
 *   node scripts/prune-corpus-builds.mjs [--keep 1] [--delete]
 */

import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

import { listBuilds, planBuildPrune } from './lib/corpus-builds.mjs';
import { BUILDS_DIR, ROOT, heading, megabytes, parseArgs } from './lib/corpus-dist.mjs';

const SITE_META = path.join(ROOT, 'src', 'data', 'corpus-meta.json');

function directoryBytes(directory) {
  let total = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    total += entry.isDirectory() ? directoryBytes(child) : statSync(child).size;
  }
  return total;
}

function liveVersion() {
  try {
    return JSON.parse(readFileSync(SITE_META, 'utf8')).corpusVersion ?? null;
  } catch (error) {
    throw new Error(`Cannot read the deployed corpus version from ${SITE_META}: ${error.message}`);
  }
}

function main() {
  const args = parseArgs();
  const keep = args.keep === undefined ? 1 : Number(args.keep);
  const live = liveVersion();
  const builds = listBuilds();
  const plan = planBuildPrune({ builds, live, keep });
  const dirOf = new Map(builds.map((build) => [build.version, build.dir]));

  heading(`CORPUS BUILDS  ${args.delete ? 'PRUNE' : 'PRUNE (dry run)'}`);
  console.log(`  Live version: ${live ?? 'none'}`);
  for (const version of plan.keep) console.log(`  keep    ${version}`);

  let freed = 0;
  for (const version of plan.remove) {
    const dir = dirOf.get(version);
    const bytes = directoryBytes(dir);
    freed += bytes;
    console.log(`  remove  ${version}  (${megabytes(bytes)})`);
    if (args.delete) {
      if (path.dirname(dir) !== BUILDS_DIR) throw new Error(`Refusing to remove ${dir}`);
      rmSync(dir, { recursive: true, force: true });
    }
  }

  if (plan.remove.length === 0) {
    console.log('\n  Nothing to remove.');
  } else if (args.delete) {
    console.log(`\n  Removed ${plan.remove.length} build(s), ${megabytes(freed)}.`);
  } else {
    console.log(`\n  Would free ${megabytes(freed)}. Run again with --delete to remove them.`);
  }
}

try {
  main();
} catch (error) {
  console.error(`\nprune-corpus-builds failed: ${error.message}`);
  process.exitCode = 1;
}
