/**
 * The production build ships only the Quran releases the site can reach.
 *
 * A release is reachable when site code or a public file names it, or when a
 * reachable release's own files point into it. The `previousRelease` link in
 * release.json is provenance, not a dependency; following it would pull in
 * every release ever published.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { referencedReleases } from '../quran-releases.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'quran-releases-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const releases = path.join(root, 'public', 'data', 'quran', 'releases');
  const write = (relative, content) => {
    const file = path.join(root, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  };
  const release = (id, files = {}, previous) => {
    const manifest = { releaseId: id, assets: {} };
    if (previous) {
      manifest.previousRelease = {
        releaseId: previous,
        manifest: `/data/quran/releases/${previous}/release.json`
      };
    }
    write(`public/data/quran/releases/${id}/release.json`, JSON.stringify(manifest));
    for (const [name, content] of Object.entries(files)) {
      write(`public/data/quran/releases/${id}/${name}`, content);
    }
  };
  const scan = () => referencedReleases({
    releasesRoot: releases,
    roots: [path.join(root, 'src'), path.join(root, 'public')]
  });
  return { write, release, scan };
}

test('a release named in site code is shipped', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a');
  release('v0.2.0-cc-a');
  write('src/lib/reader.ts', 'const URL = "/data/quran/releases/v0.2.0-cc-a/catalog.json";');

  assert.deepEqual([...scan()].sort(), ['v0.2.0-cc-a']);
});

test('a release id held in a constant is found without its path', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a');
  write('src/lib/reader.ts', 'const RELEASE = "v0.1.0-cc-a";\nconst ROOT = `/data/quran/releases/${RELEASE}/`;');

  assert.deepEqual([...scan()], ['v0.1.0-cc-a']);
});

test('the root pointer in public names the active release', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a');
  release('v0.2.0-cc-a', {}, 'v0.1.0-cc-a');
  write('public/data/quran/manifest.json', '{"releaseId":"v0.2.0-cc-a"}');

  assert.deepEqual([...scan()], ['v0.2.0-cc-a']);
});

test('previousRelease provenance does not pull in older releases', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a');
  release('v0.2.0-cc-a', {}, 'v0.1.0-cc-a');
  release('v0.3.0-cc-a', {}, 'v0.2.0-cc-a');
  write('src/a.ts', '"v0.3.0-cc-a"');

  assert.deepEqual([...scan()], ['v0.3.0-cc-a']);
});

test('a shipped release that points into another release ships both', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a', { 'shard.json': '{}' });
  release('v0.2.0-cc-a', {
    'catalog.json': '{"shard":"/data/quran/releases/v0.1.0-cc-a/shard.json"}'
  });
  release('v0.3.0-cc-a');
  write('src/a.ts', '"v0.2.0-cc-a"');

  assert.deepEqual([...scan()].sort(), ['v0.1.0-cc-a', 'v0.2.0-cc-a']);
});

test('one id is not mistaken for a longer id that starts the same way', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.5.2-cc-a');
  release('v0.5.20-cc-a');
  write('src/a.ts', '"v0.5.20-cc-a"');

  assert.deepEqual([...scan()], ['v0.5.20-cc-a']);
});

test('staging directories and files inside releases are not roots', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a', { 'notes.md': 'see v0.2.0-cc-a' });
  release('v0.2.0-cc-a');
  write('public/data/quran/releases/.v0.3.0-cc-a.staging/release.json', '{}');

  assert.deepEqual([...scan()], []);
});

test('release notes naming the release before do not pull it in', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a');
  release('v0.2.0-cc-a', { 'release-notes.md': 'Built from v0.1.0-cc-a.' }, 'v0.1.0-cc-a');
  write('src/a.ts', '"v0.2.0-cc-a"');

  assert.deepEqual([...scan()], ['v0.2.0-cc-a']);
});

test('an id that ends a sentence is still found', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a');
  write('src/notes.md', 'The reader uses v0.1.0-cc-a.');

  assert.deepEqual([...scan()], ['v0.1.0-cc-a']);
});

test('extensionless host files such as _headers are scanned', (t) => {
  const { write, release, scan } = fixture(t);
  release('v0.1.0-cc-a');
  write('public/_headers', '/data/quran/releases/v0.1.0-cc-a/*\n  Cache-Control: immutable');

  assert.deepEqual([...scan()], ['v0.1.0-cc-a']);
});
