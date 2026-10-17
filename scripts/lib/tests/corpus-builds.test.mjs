/**
 * Corpus builds are reused when nothing they depend on changed, and old builds
 * can be pruned without touching the live version or a named pilot.
 *
 * Every build is a 1.6 GB database plus the same bytes again as chunks, and the
 * version name follows the git commit, so rebuilding after any unrelated commit
 * used to leave another 3.4 GB directory behind.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  buildFingerprint,
  clearBuildFingerprint,
  findReusableBuild,
  planBuildPrune,
  writeBuildFingerprint
} from '../corpus-builds.mjs';

function workspace(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'corpus-builds-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const file = (relative, content) => {
    const target = path.join(root, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
    return target;
  };
  return { root, file, buildsDir: path.join(root, 'builds') };
}

function completeBuild(file, version) {
  file(`builds/${version}/hadith.db`, 'db');
  file(`builds/${version}/manifest.json`, '{"chunkCount":1}');
  file(`builds/${version}/chunks/hadith.chunk.000`, 'db');
}

test('the fingerprint is stable for identical inputs', async (t) => {
  const { file } = workspace(t);
  const master = file('master.db', 'corpus');
  const script = file('pipeline.mjs', 'v1');
  const a = await buildFingerprint({ master, options: { prune: false }, pipelineFiles: [script] });
  const b = await buildFingerprint({ master, options: { prune: false }, pipelineFiles: [script] });
  assert.equal(a.id, b.id);
});

test('the fingerprint changes with the master, the options or the pipeline', async (t) => {
  const { file } = workspace(t);
  const master = file('master.db', 'corpus');
  const script = file('pipeline.mjs', 'v1');
  const base = await buildFingerprint({ master, options: { prune: false }, pipelineFiles: [script] });

  const otherOptions = await buildFingerprint({ master, options: { prune: true }, pipelineFiles: [script] });
  file('master.db', 'corpus, edited');
  const otherMaster = await buildFingerprint({ master, options: { prune: false }, pipelineFiles: [script] });
  file('master.db', 'corpus');
  file('pipeline.mjs', 'v2');
  const otherPipeline = await buildFingerprint({ master, options: { prune: false }, pipelineFiles: [script] });

  assert.notEqual(otherOptions.id, base.id);
  assert.notEqual(otherMaster.id, base.id);
  assert.notEqual(otherPipeline.id, base.id);
});

test('option key order does not change the fingerprint', async (t) => {
  const { file } = workspace(t);
  const master = file('master.db', 'corpus');
  const a = await buildFingerprint({ master, options: { prune: false, pageSize: null }, pipelineFiles: [] });
  const b = await buildFingerprint({ master, options: { pageSize: null, prune: false }, pipelineFiles: [] });
  assert.equal(a.id, b.id);
});

test('a complete build with the same fingerprint is reused', (t) => {
  const { file, buildsDir } = workspace(t);
  completeBuild(file, '2026-10-07-aaaaaaa');
  writeBuildFingerprint(path.join(buildsDir, '2026-10-07-aaaaaaa'), { id: 'abc' });

  assert.equal(findReusableBuild('abc', buildsDir), '2026-10-07-aaaaaaa');
  assert.equal(findReusableBuild('different', buildsDir), null);
});

test('a build missing its chunks or manifest is not reused', (t) => {
  const { file, buildsDir } = workspace(t);
  file('builds/2026-10-07-aaaaaaa/hadith.db', 'db');
  writeBuildFingerprint(path.join(buildsDir, '2026-10-07-aaaaaaa'), { id: 'abc' });

  assert.equal(findReusableBuild('abc', buildsDir), null);
});

test('no builds directory means nothing to reuse', (t) => {
  const { buildsDir } = workspace(t);
  assert.equal(findReusableBuild('abc', buildsDir), null);
});

test('prune keeps the live build, the newest other build and named builds', () => {
  const plan = planBuildPrune({
    builds: [
      { version: '2026-09-14-d0aafac', builtAt: '2026-09-14T20:26:00Z' },
      { version: '2026-10-07-b3bb3b3', builtAt: '2026-10-07T00:19:00Z' },
      { version: '2026-10-07-18caf2f', builtAt: '2026-10-07T04:05:00Z' },
      { version: 'ibn-abi-shaybah-pilot-2026-09-26', builtAt: '2026-09-27T01:18:00Z' }
    ],
    live: '2026-10-07-18caf2f',
    keep: 1
  });

  assert.deepEqual(plan.keep.sort(), [
    '2026-10-07-18caf2f',
    '2026-10-07-b3bb3b3',
    'ibn-abi-shaybah-pilot-2026-09-26'
  ]);
  assert.deepEqual(plan.remove, ['2026-09-14-d0aafac']);
});

test('prune orders same-day builds by build time, not by commit hash', () => {
  const plan = planBuildPrune({
    builds: [
      { version: '2026-10-07-ffffff0', builtAt: '2026-10-07T01:00:00Z' },
      { version: '2026-10-07-0000001', builtAt: '2026-10-07T09:00:00Z' },
      { version: '2026-10-08-abcdef0', builtAt: '2026-10-08T00:00:00Z' }
    ],
    live: '2026-10-08-abcdef0',
    keep: 1
  });

  assert.deepEqual(plan.remove, ['2026-10-07-ffffff0']);
});

test('keep 0 leaves only the live build and named builds', () => {
  const plan = planBuildPrune({
    builds: [
      { version: '2026-09-14-d0aafac', builtAt: '2026-09-14T00:00:00Z' },
      { version: '2026-10-07-18caf2f', builtAt: '2026-10-07T00:00:00Z' }
    ],
    live: '2026-10-07-18caf2f',
    keep: 0
  });

  assert.deepEqual(plan.remove, ['2026-09-14-d0aafac']);
});

test('prune refuses a negative or fractional keep count', () => {
  assert.throws(() => planBuildPrune({ builds: [], live: null, keep: -1 }), /keep/);
  assert.throws(() => planBuildPrune({ builds: [], live: null, keep: 1.5 }), /keep/);
});

test('a build whose chunk count disagrees with its manifest is not reused', (t) => {
  const { file, buildsDir } = workspace(t);
  completeBuild(file, '2026-10-07-aaaaaaa');
  file('builds/2026-10-07-aaaaaaa/manifest.json', '{"chunkCount":2}');
  writeBuildFingerprint(path.join(buildsDir, '2026-10-07-aaaaaaa'), { id: 'abc' });

  assert.equal(findReusableBuild('abc', buildsDir), null);
});

test('clearing the fingerprint stops a build being reused while it is rebuilt', (t) => {
  const { file, buildsDir } = workspace(t);
  completeBuild(file, '2026-10-07-aaaaaaa');
  const dir = path.join(buildsDir, '2026-10-07-aaaaaaa');
  writeBuildFingerprint(dir, { id: 'abc' });

  clearBuildFingerprint(dir);
  clearBuildFingerprint(path.join(buildsDir, 'missing'));

  assert.equal(findReusableBuild('abc', buildsDir), null);
});

test('a hand-named build that starts with a date is not pruned', () => {
  const plan = planBuildPrune({
    builds: [
      { version: '2026-10-13-pilot', builtAt: '2026-10-13T00:00:00Z' },
      { version: '2026-09-14-d0aafac', builtAt: '2026-09-14T00:00:00Z' },
      { version: '2026-10-07-18caf2f', builtAt: '2026-10-07T00:00:00Z' }
    ],
    live: '2026-10-07-18caf2f',
    keep: 0
  });

  assert.deepEqual(plan.remove, ['2026-09-14-d0aafac']);
});
