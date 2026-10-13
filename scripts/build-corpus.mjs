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
 * A verified build records a fingerprint of the master database, the build
 * options and the pipeline scripts. When a later run finds a complete build with
 * the same fingerprint it reuses that version and only refreshes the site
 * metadata, instead of writing another 3.4 GB copy of an unchanged corpus.
 * `--version` or `--force` always builds.
 *
 * Usage:
 *   node scripts/build-corpus.mjs [--version <id>] [--master <path>]
 *                                 [--chunk-size 10MiB] [--publish public]
 *                                 [--skip-verify] [--force]
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import {
  buildFingerprint,
  clearBuildFingerprint,
  findReusableBuild,
  writeBuildFingerprint
} from './lib/corpus-builds.mjs';
import { ROOT, buildPaths, corpusVersion, heading, parseArgs, resolveMasterDb } from './lib/corpus-dist.mjs';

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
const masterArgs = typeof args.master === 'string' ? ['--master', args.master] : [];

/** Everything on the command line that changes the bytes of a build. */
const buildOptions = {
  prune: Boolean(args.prune),
  optimizeFts: Boolean(args['optimize-fts']),
  pageSize: args['page-size'] ? String(args['page-size']) : null,
  chunkSize: args['chunk-size'] ? String(args['chunk-size']) : null
};

async function main() {
  const master = resolveMasterDb(typeof args.master === 'string' ? args.master : undefined);
  const fingerprint = await buildFingerprint({ master, options: buildOptions });
  const explicitVersion = typeof args.version === 'string' ? args.version : null;
  const reused = explicitVersion || args.force ? null : findReusableBuild(fingerprint.id);
  const version = explicitVersion ?? reused ?? corpusVersion();
  const versionArgs = ['--version', version];
  const build = buildPaths(version);

  if (reused) {
    heading(`CORPUS ${version} REUSED`);
    console.log('  The master database, build options and pipeline scripts are unchanged');
    console.log('  since this verified build, so it is not rebuilt. Pass --force to rebuild.');
    run('build-corpus-meta.mjs', versionArgs);
    run('build-corpus-ids.mjs', versionArgs);
  } else {
    clearBuildFingerprint(build.dir);
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
      // Only a verified build may be reused later.
      writeBuildFingerprint(build.dir, fingerprint);
    }
  }

  if (typeof args.publish === 'string') {
    run('publish-corpus.mjs', [...versionArgs, '--target', args.publish, '--prune']);
  }

  heading(`CORPUS ${version} READY`);
  console.log(`  ${path.relative(ROOT, build.dir)}`);
  console.log('\n  Publish it with one of:');
  console.log(`    node scripts/publish-corpus.mjs --target r2   --version ${version} --cors`);
  console.log(`    node scripts/publish-corpus.mjs --target dist --version ${version}`);
  console.log('\n  Remove old builds with: npm run prune:corpus');
}

main().catch((error) => {
  console.error(`\nbuild-corpus failed: ${error.message}`);
  process.exitCode = 1;
});
