import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(repoRoot, 'public');
const buildArgs = process.argv.slice(2);
const outDirIndex = buildArgs.indexOf('--outDir');
const inlineOutDir = buildArgs.find((arg) => arg.startsWith('--outDir='));
if (outDirIndex >= 0 && (!buildArgs[outDirIndex + 1] || buildArgs[outDirIndex + 1].startsWith('--'))) {
  throw new Error('--outDir requires a directory');
}
if (inlineOutDir === '--outDir=') throw new Error('--outDir requires a directory');
const outputRoot = path.resolve(repoRoot, inlineOutDir?.slice('--outDir='.length)
  ?? (outDirIndex >= 0 ? buildArgs[outDirIndex + 1] : 'dist'));
const stageRoot = mkdtempSync(path.join(os.tmpdir(), 'hadithcritic-public-stage-'));
const releasesRelative = path.join('data', 'quran', 'releases');
const releasesRoot = path.join(publicRoot, releasesRelative);

function sha256(filePath) {
  const hash = createHash('sha256');
  const data = requireBuffer(filePath);
  hash.update(data);
  return hash.digest('hex');
}

function requireBuffer(filePath) {
  // Release assets are bounded JSON/text shards. Reading one at a time keeps
  // peak memory limited to the largest declared asset.
  return readFileSync(filePath);
}

function stageFile(source, destination) {
  mkdirSync(path.dirname(destination), { recursive: true });
  try {
    linkSync(source, destination);
  } catch {
    // Staging may be on a different volume from public/. A normal copy is the
    // safe fallback; the staged tree is temporary and never edits the source.
    copyFileSync(source, destination);
  }
}

function walkFiles(directory, relative = '') {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const childRelative = path.join(relative, entry.name);
    const childPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(childPath, childRelative));
    else if (entry.isFile()) files.push(childRelative);
    else throw new Error(`Unsupported public asset entry: ${childPath}`);
  }
  return files;
}

function stageOrdinaryPublicFiles() {
  for (const relative of walkFiles(publicRoot)) {
    const normalized = relative.split(path.sep).join('/');
    if (normalized === 'data/quran/releases' || normalized.startsWith('data/quran/releases/')) continue;
    stageFile(path.join(publicRoot, relative), path.join(stageRoot, relative));
  }
}

function releaseAssetSet(releaseDirectory, releaseId) {
  const manifestPath = path.join(releaseDirectory, 'release.json');
  if (!existsSync(manifestPath)) throw new Error(`${releaseId}: missing release.json`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.releaseId !== releaseId || !manifest.assets || typeof manifest.assets !== 'object') {
    throw new Error(`${releaseId}: malformed or mismatched release manifest`);
  }

  const allowed = new Set(['release.json']);
  for (const [name, asset] of Object.entries(manifest.assets)) {
    if (!name || path.basename(name) !== name || !asset || typeof asset !== 'object') {
      throw new Error(`${releaseId}: unsafe asset entry ${name}`);
    }
    const expectedPath = `/data/quran/releases/${releaseId}/${name}`;
    if (asset.path !== expectedPath || !/^[a-f0-9]{64}$/.test(asset.sha256 ?? '')
      || !Number.isSafeInteger(asset.bytes) || asset.bytes < 0) {
      throw new Error(`${releaseId}/${name}: invalid path, size, or checksum metadata`);
    }
    const source = path.join(releaseDirectory, name);
    if (!existsSync(source) || !lstatSync(source).isFile()) {
      throw new Error(`${releaseId}/${name}: manifest-listed asset is missing`);
    }
    const info = statSync(source);
    if (info.size !== asset.bytes || sha256(source) !== asset.sha256) {
      throw new Error(`${releaseId}/${name}: manifest-listed asset failed size or SHA-256 validation`);
    }
    allowed.add(name);
  }

  const notes = manifest.releaseNotes;
  if (notes) {
    const name = path.basename(notes.path ?? '');
    if (!name || notes.path !== `/data/quran/releases/${releaseId}/${name}`
      || !/^[a-f0-9]{64}$/.test(notes.sha256 ?? '')
      || !Number.isSafeInteger(notes.bytes) || notes.bytes < 0) {
      throw new Error(`${releaseId}: invalid release-notes metadata`);
    }
    const source = path.join(releaseDirectory, name);
    if (!existsSync(source) || !lstatSync(source).isFile()
      || statSync(source).size !== notes.bytes || sha256(source) !== notes.sha256) {
      throw new Error(`${releaseId}/${name}: release notes failed manifest validation`);
    }
    allowed.add(name);
  }

  return { allowed, manifest };
}

function verifyQuranReleases() {
  if (!existsSync(releasesRoot)) return { releases: [], excludedFiles: [] };
  const excludedFiles = [];
  const releases = [];
  for (const entry of readdirSync(releasesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) throw new Error(`Unexpected entry in Quran releases: ${entry.name}`);
    const releaseId = entry.name;
    const sourceDirectory = path.join(releasesRoot, releaseId);
    const { allowed, manifest } = releaseAssetSet(sourceDirectory, releaseId);
    const actual = walkFiles(sourceDirectory);
    const actualSet = new Set(actual.map((relative) => relative.split(path.sep).join('/')));
    for (const name of allowed) {
      if (!actualSet.has(name)) throw new Error(`${releaseId}/${name}: declared file is absent`);
    }
    for (const name of actualSet) {
      if (!allowed.has(name)) excludedFiles.push(`${releaseId}/${name}`);
    }
    releases.push({ releaseId, sourceDirectory, allowed, manifest });
  }
  return { releases, excludedFiles };
}

function linkQuranReleasesIntoDist(releases) {
  const clientRoot = path.join(outputRoot, 'client');
  let linkedCount = 0;
  for (const release of releases) {
    for (const name of release.allowed) {
      const source = path.join(release.sourceDirectory, name);
      const destination = path.join(clientRoot, releasesRelative, release.releaseId, name);
      mkdirSync(path.dirname(destination), { recursive: true });
      if (existsSync(destination)) {
        throw new Error(`Unexpected Quran release output already exists: ${destination}`);
      }
      if (path.parse(source).root.toLowerCase() !== path.parse(destination).root.toLowerCase()) {
        throw new Error(`Quran release hardlinks require source and dist on the same volume: ${source}`);
      }
      // Releases are immutable and were checksum-verified above. Hardlinks
      // preserve their exact bytes in dist without a second 11+ GiB copy.
      linkSync(source, destination);
      linkedCount += 1;
    }
  }
  return linkedCount;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    ...options
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

try {
  stageOrdinaryPublicFiles();
  const { releases, excludedFiles } = verifyQuranReleases();
  console.log(`Verified ${releases.length} Quran releases from immutable asset manifests.`);
  if (excludedFiles.length) {
    console.log(`Excluded ${excludedFiles.length} unmanifested Quran release files from the production build.`);
  }

  run(process.execPath, [path.join(repoRoot, 'node_modules/astro/bin/astro.mjs'), 'build', ...buildArgs], {
    env: { ...process.env, ASTRO_PUBLIC_DIR: stageRoot }
  });

  const linkedQuranFiles = linkQuranReleasesIntoDist(releases);
  console.log(`Hardlinked ${linkedQuranFiles} manifest-declared Quran release files into ${path.relative(repoRoot, path.join(outputRoot, 'client'))}.`);

  for (const relative of excludedFiles) {
    const deployedPath = path.join(outputRoot, 'client/data/quran/releases', relative);
    if (existsSync(deployedPath)) throw new Error(`Unmanifested Quran release file reached dist: ${relative}`);
  }

  run(process.execPath, [
    path.join(repoRoot, 'node_modules/pagefind/lib/runner/bin.cjs'),
    '--site',
    path.join(outputRoot, 'client')
  ]);
} finally {
  const resolvedStage = path.resolve(stageRoot);
  if (!resolvedStage.startsWith(path.resolve(os.tmpdir()) + path.sep)
    || !path.basename(resolvedStage).startsWith('hadithcritic-public-stage-')) {
    throw new Error(`Refusing to remove unexpected public staging path: ${resolvedStage}`);
  }
  rmSync(resolvedStage, { recursive: true, force: true });
}
