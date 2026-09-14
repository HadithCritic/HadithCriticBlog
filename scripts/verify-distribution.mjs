/**
 * Prove a corpus build before it is published.
 *
 * Three separate questions, because they fail in different ways:
 *
 *   1. Is the distribution database the master database? Row counts per table,
 *      compared, not spot-checked.
 *   2. Do the chunks reassemble into exactly that database? The chunks are
 *      what a reader actually downloads, and a truncated or mis-ordered chunk
 *      produces a file that still opens and then returns wrong rows.
 *   3. Does it still answer the questions the website asks? Every query shape
 *      the site uses is run here, through the same Arabic folding the browser
 *      will use, and compared against the master. An FTS index that silently
 *      stopped matching folded Arabic is the failure this exists to catch.
 *
 * Usage:
 *   node scripts/verify-distribution.mjs [--version <id>] [--master <path>]
 *                                        [--skip-chunk-hash]
 */

import { createHash } from 'node:crypto';
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

import { buildMatch, buildNarratorMatch } from '../src/lib/arabic-normalize.ts';
import {
  CHUNK_BASENAME,
  buildPaths,
  corpusVersion,
  fileSize,
  heading,
  megabytes,
  parseArgs,
  resolveMasterDb
} from './lib/corpus-dist.mjs';

const COUNTED_TABLES = [
  'hadith',
  'hadith_book',
  'hadith_chain',
  'hadith_gloss',
  'hadith_narrator',
  'hadith_subject',
  'narrator',
  'narrator_alias',
  'narrator_detail',
  'narrator_facet',
  'narrator_top_hadith',
  'criticism_statement',
  'corpus_stat'
];

/**
 * One entry per query shape the site issues, so a build cannot pass while a
 * page is broken. `expect` guards against a query that starts returning
 * nothing, which would otherwise compare equal between two equally broken
 * databases.
 */
const PROBES = [
  {
    name: 'hadith by id, joined to its collection',
    sql: `SELECT h.id, h.hadith_num, b.slug FROM hadith h
            JOIN hadith_book b ON b.id = h.book_id WHERE h.id = ?`,
    args: [20614],
    expect: (rows) => rows.length === 1
  },
  {
    name: 'collection page, ordered by id',
    sql: `SELECT id, hadith_num FROM hadith WHERE book_id =
            (SELECT id FROM hadith_book ORDER BY hadith_count DESC LIMIT 1)
          ORDER BY id LIMIT 25`,
    args: [],
    expect: (rows) => rows.length === 25
  },
  {
    name: 'FTS5 Arabic search, primary spelling',
    sql: `SELECT rowid FROM hadith_fts WHERE hadith_fts MATCH ?
          ORDER BY rowid LIMIT 20`,
    args: [buildMatch('عائشة', 'all')],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'FTS5 Arabic search, folded alternate spelling',
    sql: `SELECT rowid FROM hadith_fts WHERE hadith_fts MATCH ?
          ORDER BY rowid LIMIT 20`,
    args: [buildMatch('عايشه', 'all')],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'FTS5 Arabic search, al-salah',
    sql: `SELECT rowid FROM hadith_fts WHERE hadith_fts MATCH ?
          ORDER BY rowid LIMIT 20`,
    args: [buildMatch('الصلاة', 'all')],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'FTS5 English search, matn scope',
    sql: `SELECT rowid FROM hadith_fts WHERE hadith_fts MATCH ?
          ORDER BY rowid LIMIT 20`,
    args: [buildMatch('prayer', 'matn')],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'bm25 relevance ranking is available',
    sql: `SELECT rowid, bm25(hadith_fts, 1.0, 2.0, 1.0, 2.0, 0.5) AS score
            FROM hadith_fts WHERE hadith_fts MATCH ?
           ORDER BY score ASC, rowid ASC LIMIT 10`,
    args: [buildMatch('المدينة', 'all')],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'narrator register, first page',
    sql: `SELECT id, name_en FROM narrator WHERE unnamed = 0 ORDER BY id ASC LIMIT 50`,
    args: [],
    expect: (rows) => rows.length === 50
  },
  {
    name: 'narrator_fts prefix search, latin',
    sql: `SELECT rowid FROM narrator_fts WHERE narrator_fts MATCH ? ORDER BY rowid LIMIT 20`,
    args: [buildNarratorMatch('malik')],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'narrator_fts prefix search, folded arabic',
    sql: `SELECT rowid FROM narrator_fts WHERE narrator_fts MATCH ? ORDER BY rowid LIMIT 20`,
    args: [buildNarratorMatch('عايشه')],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'narrator dossier payload',
    sql: `SELECT length(payload) AS n FROM narrator_detail
           WHERE id = (SELECT id FROM narrator WHERE unnamed = 0
                        ORDER BY hadith_count DESC LIMIT 1)`,
    args: [],
    expect: (rows) => Number(rows[0]?.n) > 0
  },
  {
    name: 'criticism statements for a narrator',
    sql: `SELECT critic, verdict FROM criticism_statement
           WHERE narrator_id = (SELECT narrator_id FROM criticism_statement LIMIT 1)
           ORDER BY ord LIMIT 25`,
    args: [],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'isnad chain for a narration',
    sql: `SELECT c.path_idx, c.pos, c.narrator_id, n.name_en
            FROM hadith_chain c LEFT JOIN narrator n ON n.id = c.narrator_id
           WHERE c.hadith_id = ? ORDER BY c.path_idx, c.pos`,
    args: [20614],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'narrator filter over hadith',
    sql: `SELECT h.id FROM hadith h
           WHERE EXISTS (SELECT 1 FROM hadith_narrator hn
                          WHERE hn.hadith_id = h.id AND hn.narrator_id = ?)
           ORDER BY h.id LIMIT 25`,
    args: [5361],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'subject filter over hadith',
    sql: `SELECT h.id FROM hadith h
           WHERE EXISTS (SELECT 1 FROM hadith_subject hs
                          WHERE hs.hadith_id = h.id AND hs.label_en =
                            (SELECT label_en FROM hadith_subject LIMIT 1))
           ORDER BY h.id LIMIT 25`,
    args: [],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'stored corpus statistics',
    sql: 'SELECT key, value FROM corpus_stat ORDER BY key',
    args: [],
    expect: (rows) => rows.length > 0
  },
  {
    name: 'narrator facets',
    sql: 'SELECT kind, value, n FROM narrator_facet ORDER BY kind, ord',
    args: [],
    expect: (rows) => rows.length > 0
  }
];

const failures = [];
const note = (ok, text) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${text}`);
  if (!ok) failures.push(text);
};

async function reassembledSha256(chunksDir, expectedBytes) {
  const names = readdirSync(chunksDir)
    .filter((f) => f.startsWith(CHUNK_BASENAME))
    .sort();
  const hash = createHash('sha256');
  let seen = 0;

  for (const name of names) {
    const stream = createReadStream(path.join(chunksDir, name), { highWaterMark: 1 << 22 });
    for await (const block of stream) {
      hash.update(block);
      seen += block.length;
    }
  }

  if (seen !== expectedBytes) {
    throw new Error(`Chunks total ${seen} bytes, database is ${expectedBytes}`);
  }
  return hash.digest('hex');
}

async function main() {
  const args = parseArgs();
  const version = typeof args.version === 'string' ? args.version : corpusVersion();
  const build = buildPaths(version);
  const masterPath = resolveMasterDb(typeof args.master === 'string' ? args.master : undefined);

  if (!existsSync(build.db)) throw new Error(`No distribution database at ${build.db}`);
  if (!existsSync(build.manifest)) throw new Error(`No manifest at ${build.manifest}`);

  heading(`VERIFY DISTRIBUTION  ${version}`);
  console.log(`  Master:       ${masterPath}`);
  console.log(`  Distribution: ${build.db} (${megabytes(fileSize(build.db))})`);

  const manifest = JSON.parse(readFileSync(build.manifest, 'utf8'));
  const dbBytes = fileSize(build.db);

  console.log('\n  Manifest');
  note(manifest.version === version, `version is ${version}`);
  note(manifest.serverMode === 'chunked', 'serverMode is chunked');
  note(
    manifest.databaseLengthBytes === dbBytes,
    `databaseLengthBytes ${manifest.databaseLengthBytes} matches the file`
  );
  note(
    !manifest.urlPrefix.startsWith('/') && !/^https?:/i.test(manifest.urlPrefix),
    `urlPrefix "${manifest.urlPrefix}" is relative, so the manifest can change host`
  );
  note(
    manifest.chunkCount === Math.ceil(dbBytes / manifest.serverChunkSize),
    `chunkCount ${manifest.chunkCount} matches ceil(length / chunkSize)`
  );

  const chunkFiles = readdirSync(build.chunksDir).filter((f) => f.startsWith(CHUNK_BASENAME));
  note(
    chunkFiles.length === manifest.chunkCount,
    `${chunkFiles.length} chunk files on disk match the manifest`
  );
  const oversize = chunkFiles.filter(
    (f) => statSync(path.join(build.chunksDir, f)).size > 25 * 1024 * 1024
  );
  note(oversize.length === 0, 'every chunk is under the 25 MiB Cloudflare asset limit');

  const expectedSuffix = Math.max(3, String(manifest.chunkCount - 1).length);
  note(
    manifest.suffixLength === expectedSuffix &&
      chunkFiles.every((f) => f.slice(CHUNK_BASENAME.length).length === expectedSuffix),
    `chunk suffixes are ${expectedSuffix} digits wide`
  );

  if (!args['skip-chunk-hash']) {
    console.log('\n  Chunk integrity');
    const rebuilt = await reassembledSha256(build.chunksDir, dbBytes);
    note(rebuilt === manifest.sha256, 'chunks reassemble to the manifest sha256');
  }

  const master = new DatabaseSync(masterPath, { readOnly: true });
  const dist = new DatabaseSync(build.db, { readOnly: true });

  try {
    console.log('\n  Row counts');
    for (const table of COUNTED_TABLES) {
      const a = master.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
      const b = dist.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
      note(a === b, `${table}: ${Number(b).toLocaleString()}`);
    }

    console.log('\n  Query behaviour');
    for (const probe of PROBES) {
      let masterRows;
      let distRows;
      try {
        masterRows = master.prepare(probe.sql).all(...probe.args);
        distRows = dist.prepare(probe.sql).all(...probe.args);
      } catch (error) {
        note(false, `${probe.name}, threw: ${error.message}`);
        continue;
      }

      if (!probe.expect(distRows)) {
        note(false, `${probe.name}, returned nothing usable (${distRows.length} rows)`);
        continue;
      }
      note(
        JSON.stringify(masterRows) === JSON.stringify(distRows),
        `${probe.name} (${distRows.length} rows)`
      );
    }

    console.log('\n  Query planner');
    const stat1 = dist
      .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'sqlite_stat1'")
      .get().n;
    note(stat1 === 1, 'sqlite_stat1 is present, so the planner has selectivity data');
  } finally {
    master.close();
    dist.close();
  }

  console.log('');
  if (failures.length) {
    console.error(`  ${failures.length} check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log('  All checks passed.');
  }
}

main().catch((error) => {
  console.error(`\nverify-distribution failed: ${error.message}`);
  process.exitCode = 1;
});
