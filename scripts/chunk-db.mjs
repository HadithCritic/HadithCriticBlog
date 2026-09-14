/**
 * Split the distribution database into static chunks and write the manifest.
 *
 * `sql.js-httpvfs` in `chunked` mode turns a SQLite page read into a Range
 * request against one of these files, so the chunks are an addressing scheme
 * rather than a transfer unit: a reader who searches for one word fetches a few
 * kilobytes, not a chunk, and never the whole database.
 *
 * Two constraints set the chunk size. Cloudflare rejects a static asset over
 * 25 MiB, and both Pages and Workers stop at 20,000 files. 10 MiB puts the
 * current 1.6 GB corpus at about 162 files with a 15 MiB margin per file, which
 * is why it is the default; `--chunk-size` exists so the trade can be measured
 * rather than assumed.
 *
 * The manifest is a superset of the `jsonconfig` contract the library reads.
 * Its `urlPrefix` is deliberately relative: the library resolves it against the
 * URL the manifest was fetched from, so the same bytes work unchanged whether
 * they are served from the site itself or from a separate data host. Nothing
 * downstream is allowed to know how many chunks there are.
 *
 * Usage:
 *   node scripts/chunk-db.mjs [--version <id>] [--chunk-size 10MiB] [--hash-chunks]
 */

import { closeSync, createWriteStream, mkdirSync, openSync, readSync, rmSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

import {
  CHUNK_BASENAME,
  CHUNK_URL_PREFIX,
  buildPaths,
  corpusVersion,
  fileSize,
  heading,
  megabytes,
  parseArgs,
  sha256File
} from './lib/corpus-dist.mjs';

const MIB = 1024 * 1024;

/** Cloudflare refuses a static asset above this, on both Pages and Workers. */
const CLOUDFLARE_MAX_ASSET_BYTES = 25 * MIB;

/** Both platforms stop at 20,000 files, and the site itself needs some of them. */
const CLOUDFLARE_MAX_FILES = 20000;
const FILE_BUDGET_FOR_CHUNKS = 15000;

const DEFAULT_CHUNK_SIZE = 10 * MIB;

function parseSize(value) {
  if (value === undefined || value === true) return DEFAULT_CHUNK_SIZE;
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*(b|kib|mib|k|m)?$/i);
  if (!match) throw new Error(`Unreadable --chunk-size: ${value}`);
  const scale = { b: 1, k: 1024, kib: 1024, m: MIB, mib: MIB }[(match[2] || 'mib').toLowerCase()];
  return Math.round(Number(match[1]) * scale);
}

async function main() {
  const args = parseArgs();
  const version = typeof args.version === 'string' ? args.version : corpusVersion();
  const build = buildPaths(version);

  if (!existsSync(build.db)) {
    throw new Error(
      `No distribution database for version ${version}.\n` +
        `Expected ${build.db}. Run: node scripts/build-distribution-db.mjs --version ${version}`
    );
  }

  const chunkSize = parseSize(args['chunk-size']);
  if (chunkSize > CLOUDFLARE_MAX_ASSET_BYTES) {
    throw new Error(
      `--chunk-size ${megabytes(chunkSize)} exceeds Cloudflare's ${megabytes(CLOUDFLARE_MAX_ASSET_BYTES)} per-asset limit.`
    );
  }

  // Read at the page size the file actually has, rather than the one it had
  // when this script was written: `build-distribution-db --page-size` can change
  // it, and a mismatch makes every page read span two requests.
  const pageDb = new DatabaseSync(build.db, { readOnly: true });
  const pageSize = pageDb.prepare('PRAGMA page_size').get().page_size;
  pageDb.close();

  const totalBytes = fileSize(build.db);
  const chunkCount = Math.ceil(totalBytes / chunkSize);
  const suffixLength = Math.max(3, String(chunkCount - 1).length);

  if (chunkCount > FILE_BUDGET_FOR_CHUNKS) {
    throw new Error(
      `${chunkCount.toLocaleString()} chunks would leave too little of Cloudflare's ` +
        `${CLOUDFLARE_MAX_FILES.toLocaleString()}-file budget for the site. Raise --chunk-size.`
    );
  }

  heading(`CHUNK DISTRIBUTION DATABASE  ${version}`);
  console.log(`  Source:     ${build.db} (${megabytes(totalBytes)})`);
  console.log(`  Chunk size: ${megabytes(chunkSize)}`);
  console.log(`  Chunks:     ${chunkCount} files, suffix width ${suffixLength}`);
  console.log(`  Page size:  ${pageSize} bytes (request granularity)`);

  rmSync(build.chunksDir, { recursive: true, force: true });
  mkdirSync(build.chunksDir, { recursive: true });

  const chunkHashes = args['hash-chunks'] ? [] : null;
  const fd = openSync(build.db, 'r');
  const buffer = Buffer.allocUnsafe(chunkSize);
  const t0 = Date.now();

  try {
    for (let index = 0; index < chunkCount; index += 1) {
      const read = readSync(fd, buffer, 0, chunkSize, index * chunkSize);
      const slice = buffer.subarray(0, read);
      const name = `${CHUNK_BASENAME}${String(index).padStart(suffixLength, '0')}`;

      await new Promise((resolve, reject) => {
        const stream = createWriteStream(path.join(build.chunksDir, name));
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(slice);
      });

      if (chunkHashes) chunkHashes.push(createHash('sha256').update(slice).digest('hex'));

      if ((index + 1) % 25 === 0 || index + 1 === chunkCount) {
        console.log(`  ${index + 1}/${chunkCount} chunks`);
      }
    }
  } finally {
    closeSync(fd);
  }

  const written = readdirSync(build.chunksDir).filter((f) => f.startsWith(CHUNK_BASENAME));
  if (written.length !== chunkCount) {
    throw new Error(`Wrote ${written.length} chunks but expected ${chunkCount}`);
  }

  const sha256 = await sha256File(build.db);

  /**
   * `requestChunkSize` must be the database page size: it is the granularity
   * the VFS reads at, and a mismatch makes every page read span two requests.
   */
  const manifest = {
    version,
    generatedAt: new Date().toISOString(),
    serverMode: 'chunked',
    requestChunkSize: pageSize,
    databaseLengthBytes: totalBytes,
    serverChunkSize: chunkSize,
    chunkCount,
    urlPrefix: CHUNK_URL_PREFIX,
    suffixLength,
    sha256,
    ...(chunkHashes ? { chunkSha256: chunkHashes } : {})
  };

  writeFileSync(build.manifest, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`\n  Manifest: ${build.manifest}`);
  console.log(`  sha256:   ${sha256}`);
  console.log(`  Elapsed:  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`\n  Next: node scripts/verify-distribution.mjs --version ${version}`);
}

main().catch((error) => {
  console.error(`\nchunk-db failed: ${error.message}`);
  process.exitCode = 1;
});
