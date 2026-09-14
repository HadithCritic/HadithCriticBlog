/**
 * Shared vocabulary for the static corpus distribution pipeline.
 *
 * One place decides where the master database is, what a build is called, and
 * how a published artifact is laid out, so `build-distribution-db`, `chunk-db`,
 * `verify-distribution`, `build-corpus-meta` and `publish-corpus` cannot drift
 * apart. Everything downstream of the master database is generated; nothing
 * here is hand-maintained.
 */

import { createHash } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Everything the pipeline writes lives under here, and none of it is in git. */
export const DIST_DB_DIR = path.join(ROOT, 'dist-db');

/** Published builds, one directory per corpus version. */
export const BUILDS_DIR = path.join(DIST_DB_DIR, 'builds');

/**
 * Candidate master databases, most specific first.
 *
 * `silsilah.db` is what `scripts/build-static-db.py` has always written, so it
 * stays a candidate rather than being renamed out from under an existing
 * checkout. `master.db` is the name new builds should use.
 */
const MASTER_CANDIDATES = ['master.db', 'silsilah.db', 'hadith.db'];

export function resolveMasterDb(explicit) {
  const candidates = explicit
    ? [path.resolve(ROOT, explicit)]
    : [
        process.env.CORPUS_MASTER_DB && path.resolve(ROOT, process.env.CORPUS_MASTER_DB),
        ...MASTER_CANDIDATES.map((name) => path.join(DIST_DB_DIR, name))
      ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error(
    `No master corpus database found. Looked in:\n  ${candidates.join('\n  ')}\n` +
      'Build one with `python scripts/build-static-db.py`, or point --master at it.'
  );
}

/**
 * The corpus version, as a deterministic identifier.
 *
 * `YYYY-MM-DD` plus the short commit the build was cut from, so two builds of
 * the same corpus on the same day from the same tree name the same version and
 * a rebuild after a schema change does not. `CORPUS_VERSION` overrides it for
 * a republish that has to keep an existing name.
 */
export function corpusVersion() {
  if (process.env.CORPUS_VERSION) return process.env.CORPUS_VERSION;

  const day = new Date().toISOString().slice(0, 10);
  let commit = '';
  try {
    commit = execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    // A build from an export rather than a checkout still deserves a version.
  }

  return commit ? `${day}-${commit}` : day;
}

/** Where one version's artifacts live on disk. */
export function buildPaths(version) {
  const dir = path.join(BUILDS_DIR, version);
  return {
    version,
    dir,
    db: path.join(dir, 'hadith.db'),
    chunksDir: path.join(dir, 'chunks'),
    manifest: path.join(dir, 'manifest.json'),
    meta: path.join(dir, 'corpus-meta.json')
  };
}

/** The chunk basename. Chunks are addressed relative to the manifest. */
export const CHUNK_BASENAME = 'hadith.chunk.';

/** Relative so the manifest resolves against wherever it is served from. */
export const CHUNK_URL_PREFIX = `chunks/${CHUNK_BASENAME}`;

export async function sha256File(file) {
  const hash = createHash('sha256');
  for await (const block of createReadStream(file, { highWaterMark: 1 << 22 })) {
    hash.update(block);
  }
  return hash.digest('hex');
}

export const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const fileSize = (file) => statSync(file).size;

/** `--flag value` and `--flag` parsing, without pulling in a dependency. */
export function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function heading(title) {
  const line = '='.repeat(Math.max(60, title.length + 4));
  console.log(`\n${line}\n  ${title}\n${line}`);
}
