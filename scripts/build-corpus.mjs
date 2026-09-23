/**
 * Build, verify and stage one corpus version, end to end.
 *
 * The stages are separate scripts because each is independently re-runnable , 
 * re-chunking does not require rebuilding, and verifying does not require
 * either, but the normal path is all of them in order, which is this.
 *
 * Deliberately not part of `npm run build`. The master database is 1.6 GB, is
 * not in git and is not present in CI; the site builds from
 * src/data/corpus-meta.json, which this writes and which is committed. Corpus
 * releases and site deployments are separate events, and the version in the
 * metadata is what ties a deployment to a corpus.
 *
 * Usage:
 *   node scripts/build-corpus.mjs [--version <id>] [--master <path>]
 *                                 [--chunk-size 10MiB] [--publish public]
 *                                 [--skip-verify]
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { ROOT, buildPaths, corpusVersion, heading, parseArgs } from './lib/corpus-dist.mjs';

function run(script, argv) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...argv], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error(`${script} exited with ${result.status ?? 'a signal'}`);
  }
}

const args = parseArgs();
const version = typeof args.version === 'string' ? args.version : corpusVersion();
const versionArgs = ['--version', version];
const masterArgs = typeof args.master === 'string' ? ['--master', args.master] : [];

try {
  run('build-distribution-db.mjs', [
    ...versionArgs,
    ...masterArgs,
    ...(args.prune ? ['--prune'] : []),
    ...(args['optimize-fts'] ? ['--optimize-fts'] : []),
    ...(args['page-size'] ? ['--page-size', String(args['page-size'])] : [])
  ]);

  run('chunk-db.mjs', [
    ...versionArgs,
    ...(args['chunk-size'] ? ['--chunk-size', String(args['chunk-size'])] : [])
  ]);

  run('build-corpus-meta.mjs', versionArgs);
  run('build-corpus-ids.mjs', versionArgs);

  if (!args['skip-verify']) {
    run('verify-distribution.mjs', [...versionArgs, ...masterArgs]);
  }

  if (typeof args.publish === 'string') {
    run('publish-corpus.mjs', [...versionArgs, '--target', args.publish, '--prune']);
  }

  const build = buildPaths(version);
  heading(`CORPUS ${version} READY`);
  console.log(`  ${path.relative(ROOT, build.dir)}`);
  console.log('\n  Publish it with one of:');
  console.log(`    node scripts/publish-corpus.mjs --target r2   --version ${version} --cors`);
  console.log(`    node scripts/publish-corpus.mjs --target dist --version ${version}`);
} catch (error) {
  console.error(`\nbuild-corpus failed: ${error.message}`);
  process.exitCode = 1;
}
