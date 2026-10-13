/**
 * Reuse and retention for corpus builds under dist-db/builds.
 *
 * A build is the distribution database plus the same bytes again as chunks,
 * about 3.4 GB. Its version name comes from the date and the git commit, so a
 * rebuild after any commit produced a new directory even when the master
 * database had not changed, and nothing ever removed the old ones. Builds now
 * record a fingerprint of everything their bytes depend on, so an unchanged
 * corpus is reused rather than rebuilt, and planBuildPrune decides which old
 * builds can go.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { BUILDS_DIR, ROOT, sha256File } from './corpus-dist.mjs';

export const FINGERPRINT_FILE = 'fingerprint.json';

/** Scripts that decide a build's bytes. Editing any of them must force a rebuild. */
export const PIPELINE_FILES = [
  'scripts/build-distribution-db.mjs',
  'scripts/chunk-db.mjs',
  'scripts/build-corpus-meta.mjs',
  'scripts/build-corpus-ids.mjs',
  'scripts/lib/corpus-dist.mjs'
].map((relative) => path.join(ROOT, relative));

/** Dated builds are prunable. Hand-named builds such as a pilot are always kept. */
const DATED_VERSION = /^\d{4}-\d{2}-\d{2}(?:-[0-9a-f]{7,40})?$/;

function sortedObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * @param {object} input
 * @param {string} input.master         Master database path.
 * @param {object} input.options        Build options that change the output bytes.
 * @param {string[]} [input.pipelineFiles]
 */
export async function buildFingerprint({ master, options, pipelineFiles = PIPELINE_FILES }) {
  const pipeline = {};
  for (const file of pipelineFiles) {
    pipeline[path.relative(ROOT, file).split(path.sep).join('/')] = await sha256File(file);
  }
  const inputs = {
    masterSha256: await sha256File(master),
    options: sortedObject(options),
    pipeline: sortedObject(pipeline)
  };
  const id = createHash('sha256').update(JSON.stringify(inputs)).digest('hex');
  return { id, ...inputs };
}

export function writeBuildFingerprint(buildDir, fingerprint) {
  writeFileSync(
    path.join(buildDir, FINGERPRINT_FILE),
    `${JSON.stringify({ ...fingerprint, recordedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8'
  );
}

/**
 * Called before any stage writes into a build directory. Version names repeat
 * within a day, so a rebuild can land on a directory whose old fingerprint
 * would otherwise vouch for bytes it never verified.
 */
export function clearBuildFingerprint(buildDir) {
  rmSync(path.join(buildDir, FINGERPRINT_FILE), { force: true });
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function isComplete(buildDir) {
  const manifest = readJson(path.join(buildDir, 'manifest.json'));
  const chunksDir = path.join(buildDir, 'chunks');
  if (!manifest || !existsSync(path.join(buildDir, 'hadith.db')) || !existsSync(chunksDir)) return false;
  return readdirSync(chunksDir).length === manifest.chunkCount;
}

/** The newest complete, verified build with this fingerprint, or null. */
export function findReusableBuild(fingerprintId, buildsDir = BUILDS_DIR) {
  if (!existsSync(buildsDir)) return null;
  const matches = readdirSync(buildsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(buildsDir, entry.name))
    .filter((dir) => readJson(path.join(dir, FINGERPRINT_FILE))?.id === fingerprintId && isComplete(dir))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return matches.length ? path.basename(matches[0]) : null;
}

/** Every build directory with the time it was built, for planBuildPrune. */
export function listBuilds(buildsDir = BUILDS_DIR) {
  if (!existsSync(buildsDir)) return [];
  return readdirSync(buildsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(buildsDir, entry.name);
      const generatedAt = readJson(path.join(dir, 'manifest.json'))?.generatedAt;
      return {
        version: entry.name,
        dir,
        builtAt: typeof generatedAt === 'string' ? generatedAt : statSync(dir).mtime.toISOString()
      };
    });
}

/**
 * @param {object} input
 * @param {{version: string, builtAt: string}[]} input.builds
 * @param {string|null} input.live  The version src/data/corpus-meta.json deploys.
 * @param {number} input.keep       How many dated builds besides the live one to keep.
 */
export function planBuildPrune({ builds, live, keep }) {
  if (!Number.isInteger(keep) || keep < 0) {
    throw new Error(`keep must be a whole number of builds, got ${keep}`);
  }
  const kept = [];
  const candidates = [];
  for (const build of builds) {
    if (build.version === live || !DATED_VERSION.test(build.version)) kept.push(build.version);
    else candidates.push(build);
  }
  candidates.sort((a, b) => Date.parse(b.builtAt) - Date.parse(a.builtAt));
  return {
    keep: [...kept, ...candidates.slice(0, keep).map((build) => build.version)],
    remove: candidates.slice(keep).map((build) => build.version)
  };
}
