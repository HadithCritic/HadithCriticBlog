/**
 * Put a built corpus version where the browser can range-request it.
 *
 * Three targets, one artifact. The bytes published are identical in all three
 * cases and the manifest is self-locating, so which one a deployment uses is a
 * matter of `PUBLIC_CORPUS_BASE_URL` and nothing else:
 *
 *   public  the site's own static assets, for `npm run dev`
 *   dist    straight into the built output, so a 1.6 GB corpus is copied once
 *           at deploy time rather than once into public/ and again into dist/
 *   r2      a bucket served from a data hostname, for when the corpus should
 *           be released independently of the site
 *
 * Versioned directories are never rewritten. Publishing 2026-09-20 leaves
 * 2026-09-14 intact and reachable, so a reader who is midway through loading
 * the old corpus when a deploy lands finishes on the file they started with
 * instead of reading half of each.
 *
 * Without `--version` this publishes the version the site is built against, the
 * one in src/data/corpus-meta.json.
 *
 * Usage:
 *   node scripts/publish-corpus.mjs --target public [--version <id>] [--copy]
 *   node scripts/publish-corpus.mjs --target dist   [--version <id>]
 *   node scripts/publish-corpus.mjs --target r2     [--version <id>] [--cors]
 */

import {
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync
} from 'node:fs';
import path from 'node:path';

import { ROOT, buildPaths, heading, megabytes, parseArgs } from './lib/corpus-dist.mjs';

const R2_BUCKET = process.env.CORPUS_R2_BUCKET || 'hadithcritic-corpus';

/**
 * Immutable, because the path carries the version. A chunk at a given URL is
 * the same bytes forever, so there is no revalidation worth paying for.
 */
const IMMUTABLE = 'public, max-age=31536000, immutable';

/**
 * The manifest is the one mutable-ish thing: a deployment points at it by
 * version, but a rollback should not be held up by a year-long cache.
 */
const MANIFEST_CACHE = 'public, max-age=300, s-maxage=3600';

/**
 * Origins allowed to range-request the corpus.
 *
 * Both hostnames, because www.hadithcriticblog.com serves the site directly
 * rather than redirecting to the apex. A reader who arrives on the one that is
 * not listed gets no corpus at all: the browser refuses to send the cross
 * origin `Range` and the page never leaves its loading state. Override with a
 * comma-separated CORPUS_ALLOWED_ORIGIN.
 */
const CORS_ORIGINS = (
  process.env.CORPUS_ALLOWED_ORIGIN ||
  'https://hadithcriticblog.com,https://www.hadithcriticblog.com'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const readEnvFile = (name) => {
  for (const file of ['.dev.vars', '.env']) {
    try {
      for (const line of readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/)) {
        const eq = line.indexOf('=');
        if (eq > 0 && line.slice(0, eq).trim() === name) {
          return line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // Absent file is normal; the variable may be in the environment instead.
    }
  }
  return process.env[name];
};

/** Hard link where the filesystem allows it, copy where it does not. */
function place(from, to, forceCopy) {
  if (existsSync(to)) rmSync(to);
  if (!forceCopy) {
    try {
      linkSync(from, to);
      return 'linked';
    } catch {
      // Different volume, or a filesystem without hard links.
    }
  }
  copyFileSync(from, to);
  return 'copied';
}

function publishToDirectory(build, root, forceCopy) {
  const target = path.join(root, build.version);
  const chunks = path.join(target, 'chunks');

  rmSync(target, { recursive: true, force: true });
  mkdirSync(chunks, { recursive: true });

  let mode = place(build.manifest, path.join(target, 'manifest.json'), forceCopy);
  if (existsSync(build.meta)) {
    place(build.meta, path.join(target, 'corpus-meta.json'), forceCopy);
  }

  const files = readdirSync(build.chunksDir);
  let bytes = 0;
  for (const name of files) {
    bytes += statSync(path.join(build.chunksDir, name)).size;
    mode = place(path.join(build.chunksDir, name), path.join(chunks, name), forceCopy);
  }

  console.log(`  ${files.length} chunks ${mode} (${megabytes(bytes)})`);
  console.log(`  Published to ${path.relative(ROOT, target)}`);
  return target;
}

/** Remove versions other than this one, so old builds do not accumulate. */
function pruneOtherVersions(root, keep) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root)) {
    if (entry === keep) continue;
    rmSync(path.join(root, entry), { recursive: true, force: true });
    console.log(`  Pruned ${entry}`);
  }
}

async function publishToR2(build, args) {
  const { S3Client, PutObjectCommand, PutBucketCorsCommand } = await import('@aws-sdk/client-s3');

  const endpoint = readEnvFile('CLOUDFLARE_S3_API_ENDPOINT');
  const accessKeyId = readEnvFile('CLOUDFLARE_ACCESS_KEY_ID');
  const secretAccessKey =
    readEnvFile('CLOUDFLARE_SECRET_ACCESS_KEY') || readEnvFile('CLOURDLARE_SECRET_ACCESS_KEY');

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2 credentials missing. Set CLOUDFLARE_S3_API_ENDPOINT, CLOUDFLARE_ACCESS_KEY_ID and ' +
        'CLOUDFLARE_SECRET_ACCESS_KEY in .dev.vars or the environment.'
    );
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  });

  if (args.cors) {
    // Range requests are what the whole architecture rests on, and a browser
    // will not issue a cross-origin one unless Range is an allowed header and
    // Content-Range is exposed back.
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: R2_BUCKET,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: CORS_ORIGINS,
              AllowedMethods: ['GET', 'HEAD'],
              AllowedHeaders: ['range', 'if-match', 'if-none-match'],
              ExposeHeaders: ['content-length', 'content-range', 'accept-ranges', 'etag'],
              MaxAgeSeconds: 86400
            }
          ]
        }
      })
    );
    console.log(`  CORS rules applied to ${R2_BUCKET} for ${CORS_ORIGINS.join(', ')}`);
  }

  const put = (key, file, contentType, cacheControl) =>
    s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: readFileSync(file),
        ContentType: contentType,
        CacheControl: cacheControl
      })
    );

  const prefix = `${build.version}/`;
  const chunkFiles = readdirSync(build.chunksDir);
  const concurrency = Number(args.concurrency) || 6;
  let done = 0;
  const t0 = Date.now();

  const queue = [...chunkFiles];
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      for (let name = queue.pop(); name; name = queue.pop()) {
        await put(
          `${prefix}chunks/${name}`,
          path.join(build.chunksDir, name),
          'application/octet-stream',
          IMMUTABLE
        );
        done += 1;
        if (done % 20 === 0 || done === chunkFiles.length) {
          console.log(`  ${done}/${chunkFiles.length} chunks (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
        }
      }
    })
  );

  // Manifest last. Until it lands, the version does not exist as far as a
  // client is concerned, so a partial upload is never a half-published corpus.
  if (existsSync(build.meta)) {
    await put(`${prefix}corpus-meta.json`, build.meta, 'application/json', MANIFEST_CACHE);
  }
  await put(`${prefix}manifest.json`, build.manifest, 'application/json', MANIFEST_CACHE);

  console.log(`  Published to r2://${R2_BUCKET}/${prefix}`);
  console.log('\n  Point the site at it with:');
  console.log(`    PUBLIC_CORPUS_BASE_URL=https://data.hadithcriticblog.com/`);
  console.log(`    PUBLIC_CORPUS_VERSION=${build.version}`);
}

/**
 * Which version to publish, when no `--version` says.
 *
 * Not `corpusVersion()`: that mints a *new* name from today's date and HEAD,
 * which is right for build-corpus.mjs because it is creating one, and wrong
 * here because this only moves an existing build. On any day after the release
 * was cut, or after any commit, it named a directory that does not exist, and
 * `npm run publish:corpus` failed telling the developer to rebuild a 1.6 GB
 * corpus they already had.
 *
 * The site asks for exactly one version, the one in src/data/corpus-meta.json
 * that src/lib/corpus-config.ts reads, so that is the one worth staging. A
 * publish that disagrees with it stages bytes nothing requests.
 */
function siteCorpusVersion() {
  if (process.env.PUBLIC_CORPUS_VERSION) return process.env.PUBLIC_CORPUS_VERSION;
  const meta = path.join(ROOT, 'src', 'data', 'corpus-meta.json');
  try {
    const version = JSON.parse(readFileSync(meta, 'utf8')).corpusVersion;
    if (version) return version;
  } catch {
    // Fall through to the error below, which names the flag to pass instead.
  }
  throw new Error(
    `No corpus version in ${meta}.
` +
      'Regenerate it with `npm run corpus:meta`, or name one with --version.'
  );
}

async function main() {
  const args = parseArgs();
  const version = typeof args.version === 'string' ? args.version : siteCorpusVersion();
  const target = typeof args.target === 'string' ? args.target : 'public';

  /**
   * `--from` points at a directory of versioned builds other than dist-db, so
   * the committed test fixture under tests/fixtures/corpus is published by this
   * script rather than by a second one that would drift from it.
   */
  const build =
    typeof args.from === 'string'
      ? (() => {
          const dir = path.join(path.resolve(ROOT, args.from), version);
          return {
            version,
            dir,
            db: path.join(dir, 'hadith.db'),
            chunksDir: path.join(dir, 'chunks'),
            manifest: path.join(dir, 'manifest.json'),
            meta: path.join(dir, 'corpus-meta.json')
          };
        })()
      : buildPaths(version);

  if (!existsSync(build.manifest)) {
    throw new Error(
      `No built corpus for version ${version}.\n` +
        `Expected ${build.manifest}.\n` +
        `Run: node scripts/build-corpus.mjs --version ${version}`
    );
  }

  heading(`PUBLISH CORPUS  ${version}  ->  ${target}`);

  if (target === 'public' || target === 'dist') {
    const root =
      target === 'public'
        ? path.join(ROOT, 'public', 'data', 'corpus')
        : path.join(ROOT, 'dist', 'client', 'data', 'corpus');

    if (target === 'dist' && !existsSync(path.join(ROOT, 'dist', 'client'))) {
      throw new Error('dist/client does not exist. Run `npm run build` first.');
    }

    mkdirSync(root, { recursive: true });
    publishToDirectory(build, root, Boolean(args.copy));
    if (args.prune) pruneOtherVersions(root, version);
    return;
  }

  if (target === 'r2') {
    await publishToR2(build, args);
    return;
  }

  throw new Error(`Unknown --target ${target}. Use public, dist or r2.`);
}

main().catch((error) => {
  console.error(`\npublish-corpus failed: ${error.message}`);
  process.exitCode = 1;
});
