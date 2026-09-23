/**
 * Record which hadith and narrator ids exist, so the record shells can answer
 * 404 for an id that is not in the corpus.
 *
 * /hadith/[id] and /narrators/[id] are rendered per request and read nothing,
 * so until this existed every numeric id answered 200: /hadith/999999999 was an
 * indexable page that said "No such record" only once the browser had read the
 * corpus. The ids are sparse (hadith run from 4 to 341,618 across 276,347 rows),
 * so a min/max range cannot answer the question. A bitset can, and it is small:
 * one bit per possible id is about 42 KB for hadith and 3 KB for narrators.
 *
 * The output carries the corpus version it was cut from. The shells only trust
 * it when that version matches src/data/corpus-meta.json, so a stale file, or
 * the e2e fixture swapped in over the real metadata, falls back to the old
 * behavior (200 and let the client decide) instead of 404ing real records.
 *
 * Usage:
 *   node scripts/build-corpus-ids.mjs [--version <id>] [--db <path>]
 */

import { existsSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

import { ROOT, buildPaths, heading, parseArgs, resolveMasterDb } from './lib/corpus-dist.mjs';
import siteMeta from '../src/data/corpus-meta.json' with { type: 'json' };

const OUT = path.join(ROOT, 'src', 'data', 'corpus-ids.json');

/** One bit per id from 0 to the largest id, packed little-end first, base64. */
function bitset(db, table) {
  const ids = db.prepare(`SELECT id FROM ${table} ORDER BY id`).all().map((r) => Number(r.id));
  const max = ids.length ? ids[ids.length - 1] : 0;
  const bytes = new Uint8Array(Math.floor(max / 8) + 1);
  for (const id of ids) bytes[id >> 3] |= 1 << (id & 7);
  return { count: ids.length, max, bits: Buffer.from(bytes).toString('base64') };
}

function main() {
  const args = parseArgs();
  const version = typeof args.version === 'string' ? args.version : siteMeta.corpusVersion;
  const build = buildPaths(version);
  const dbPath = typeof args.db === 'string'
    ? path.resolve(ROOT, args.db)
    : existsSync(build.db)
      ? build.db
      : resolveMasterDb();

  heading(`BUILD CORPUS IDS  ${version}`);
  console.log(`  Source: ${dbPath}`);

  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const hadith = bitset(db, 'hadith');
    const narrators = bitset(db, 'narrator');
    writeFileSync(OUT, `${JSON.stringify({ corpusVersion: version, hadith, narrators })}\n`, 'utf8');
    console.log(
      `  Wrote ${path.relative(ROOT, OUT)} ` +
        `(${hadith.count.toLocaleString()} hadith, ${narrators.count.toLocaleString()} narrators)`
    );
  } finally {
    db.close();
  }
}

try {
  main();
} catch (error) {
  console.error(`\nbuild-corpus-ids failed: ${error.message}`);
  process.exitCode = 1;
}
