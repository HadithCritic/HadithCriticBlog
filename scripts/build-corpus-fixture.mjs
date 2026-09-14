/**
 * Cut a miniature corpus out of the real one, for CI.
 *
 * The full corpus is 1.62 GB and is not in git, so a clone has no corpus and
 * neither does a CI runner. Without this the corpus acceptance suite could only
 * skip there, which would leave the entire browser-side data layer, six
 * renderers and the range-request path with no automated coverage at all. A
 * suite that always skips protects nothing.
 *
 * So: take a few dozen real narrations and everything they reference, rebuild
 * the derived tables and both FTS indexes over that subset with the same SQL
 * fold the real index was built with, chunk it, and commit the result. It is a
 * few hundred kilobytes and it is genuinely the same schema, the same folding
 * and the same query shapes, which is what the tests are actually checking.
 *
 * The subset is chosen, not random. It has to contain the records the data
 * tests name, both spellings of the folded-Arabic cases, more than one
 * collection so the collection filter means something, and a narration with
 * several isnad branches.
 *
 * Regenerate with `npm run build:corpus:fixture` after a schema change, and
 * commit what it writes.
 *
 * Usage:
 *   node scripts/build-corpus-fixture.mjs [--db <path>] [--chunk-size 2MiB]
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

import { arabicFoldSql } from '../src/lib/arabic-fold-sql.ts';
import {
  ROOT,
  buildPaths,
  corpusVersion,
  fileSize,
  heading,
  megabytes,
  parseArgs,
  resolveMasterDb
} from './lib/corpus-dist.mjs';

/** Where the committed fixture lives. Small enough for git, on purpose. */
export const FIXTURE_DIR = path.join(ROOT, 'tests', 'fixtures', 'corpus');

/**
 * The fixture's version is derived from its own bytes, so a rebuild publishes
 * under a new name.
 *
 * Corpus versions are immutable by contract, and the chunks are served with a
 * year-long `immutable` cache. Rebuilding one in place breaks that promise in
 * the worst way available: a browser holding the previous manifest reads the
 * new chunks as the old layout, and SQLite answers queries with missing rows
 * instead of failing. That happened here with a fixed name, so the fixture
 * follows the same rule as a real release.
 */
const FIXTURE_PREFIX = 'fixture';

const SCHEMA_FILES = [
  'migrations/0002_create_narrators.sql',
  'migrations/0003_create_hadith.sql',
  'migrations/0004_hadith_search_index.sql',
  'migrations/0005_derived_stats.sql',
  'migrations/0006_narrator_top_hadith.sql',
  'migrations/0007_narrator_search_index.sql'
];

/**
 * Narrations the fixture must contain.
 *
 * 20614 is Muwatta' Malik No. 3, which the data tests name: two isnad branches,
 * eight subjects, a gloss, and a chain of four transmitters ending at Malik.
 * The rest are picked below to spread across collections and to cover both
 * spellings of the names the folding tests rely on.
 */
const REQUIRED_HADITH = [20614];

/** Narrators the fixture must contain, whether or not the chains pull them in. */
const REQUIRED_NARRATORS = [5361];

const KIB = 1024;

function parseSize(value, fallback) {
  if (value === undefined || value === true) return fallback;
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*(b|kib|mib|k|m)?$/i);
  if (!match) throw new Error(`Unreadable --chunk-size: ${value}`);
  const scale = { b: 1, k: KIB, kib: KIB, m: KIB * KIB, mib: KIB * KIB }[
    (match[2] || 'kib').toLowerCase()
  ];
  return Math.round(Number(match[1]) * scale);
}

/**
 * Pick the narrations. Deterministic: lowest ids first within each group, so a
 * rebuild against the same corpus produces the same fixture.
 */
function chooseHadith(src) {
  const ids = new Set(REQUIRED_HADITH);

  // A spread across the two largest collections, so a collection filter has
  // something to narrow and the catalogue has more than one entry.
  for (const book of src
    .prepare('SELECT id FROM hadith_book ORDER BY hadith_count DESC LIMIT 2')
    .all()) {
    for (const row of src
      .prepare('SELECT id FROM hadith WHERE book_id = ? ORDER BY id LIMIT 12')
      .all(book.id)) {
      ids.add(Number(row.id));
    }
  }

  // Narrations carrying the folded-Arabic test terms, found through the real
  // index so the fixture is guaranteed to answer the same queries.
  for (const term of ['عايشه', 'الصلاه', 'محمد']) {
    for (const row of src
      .prepare('SELECT rowid AS id FROM hadith_fts WHERE hadith_fts MATCH ? ORDER BY rowid LIMIT 6')
      .all(`ar_text : "${term}"`)) {
      ids.add(Number(row.id));
    }
  }

  // Narrations Malik transmits, so the narrator filter and his dossier's
  // "recorded narrations" section both have real rows.
  for (const row of src
    .prepare(
      'SELECT DISTINCT hadith_id AS id FROM hadith_narrator WHERE narrator_id = ? ORDER BY hadith_id LIMIT 8'
    )
    .all(REQUIRED_NARRATORS[0])) {
    ids.add(Number(row.id));
  }

  return [...ids].sort((a, b) => a - b);
}

const placeholders = (n) => Array.from({ length: n }, () => '?').join(',');

function copyRows(src, dst, table, columns, sql, args = []) {
  const rows = src.prepare(sql).all(...args);
  if (!rows.length) return 0;
  const insert = dst.prepare(
    `INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES (${placeholders(columns.length)})`
  );
  for (const row of rows) insert.run(...columns.map((c) => row[c] ?? null));
  return rows.length;
}

function main() {
  const args = parseArgs();
  // Well above the read-ahead floor enforced by chunk-db.mjs. The fixture is
  // 2.5 MB, so this still produces two chunks and exercises multi-chunk
  // addressing; anything smaller silently returns short reads.
  const chunkSize = parseSize(args['chunk-size'], 2 * KIB * KIB);

  // Prefer the current distribution build; fall back to the master.
  const explicit = typeof args.db === 'string' ? path.resolve(ROOT, args.db) : null;
  const current = buildPaths(corpusVersion()).db;
  let source = explicit;
  if (!source) {
    try {
      fileSize(current);
      source = current;
    } catch {
      source = resolveMasterDb();
    }
  }

  heading('BUILD CORPUS FIXTURE');
  console.log(`  Source: ${source}`);

  const src = new DatabaseSync(source, { readOnly: true });

  rmSync(FIXTURE_DIR, { recursive: true, force: true });
  mkdirSync(FIXTURE_DIR, { recursive: true });

  const dbPath = path.join(FIXTURE_DIR, 'fixture.db');
  const dst = new DatabaseSync(dbPath);

  try {
    dst.exec('PRAGMA journal_mode = DELETE');
    for (const file of SCHEMA_FILES) {
      dst.exec(readFileSync(path.join(ROOT, file), 'utf8'));
    }

    const hadithIds = chooseHadith(src);
    const inHadith = placeholders(hadithIds.length);
    console.log(`  Narrations: ${hadithIds.length}`);

    copyRows(
      src,
      dst,
      'hadith',
      [
        'id',
        'book_id',
        'hadith_num',
        'chapter_ar',
        'chapter_en',
        'matn_ar',
        'matn_en',
        'text_ar',
        'text_en',
        'path_count',
        'narrator_count',
        'parallel_count',
        'witness_count',
        'variant_count'
      ],
      `SELECT * FROM hadith WHERE id IN (${inHadith})`,
      hadithIds
    );

    for (const [table, columns] of [
      ['hadith_chain', ['hadith_id', 'path_idx', 'pos', 'narrator_id', 'name']],
      ['hadith_narrator', null],
      ['hadith_subject', ['hadith_id', 'label_ar', 'label_en']],
      ['hadith_gloss', ['hadith_id', 'word_ar', 'word_en']]
    ]) {
      const cols =
        columns ??
        src
          .prepare(`SELECT * FROM ${table} LIMIT 1`)
          .all()
          .flatMap((r) => Object.keys(r));
      const n = copyRows(
        src,
        dst,
        table,
        cols,
        `SELECT * FROM ${table} WHERE hadith_id IN (${inHadith})`,
        hadithIds
      );
      console.log(`  ${table}: ${n}`);
    }

    // Collections, with the count recomputed for the subset so the catalogue
    // and the collection pager agree with what is actually in the file.
    const bookIds = dst
      .prepare('SELECT DISTINCT book_id AS id FROM hadith ORDER BY book_id')
      .all()
      .map((r) => Number(r.id));
    copyRows(
      src,
      dst,
      'hadith_book',
      ['id', 'title_ar', 'title_en', 'slug', 'hadith_count'],
      `SELECT * FROM hadith_book WHERE id IN (${placeholders(bookIds.length)})`,
      bookIds
    );
    dst.exec(
      'UPDATE hadith_book SET hadith_count = (SELECT COUNT(*) FROM hadith WHERE hadith.book_id = hadith_book.id)'
    );
    console.log(`  hadith_book: ${bookIds.length}`);

    // Narrators the fixture references, plus the ones the data tests name.
    const narratorIds = [
      ...new Set([
        ...REQUIRED_NARRATORS,
        ...dst
          .prepare('SELECT DISTINCT narrator_id AS id FROM hadith_chain WHERE narrator_id IS NOT NULL')
          .all()
          .map((r) => Number(r.id)),
        ...dst
          .prepare('SELECT DISTINCT narrator_id AS id FROM hadith_narrator WHERE narrator_id IS NOT NULL')
          .all()
          .map((r) => Number(r.id))
      ])
    ].sort((a, b) => a - b);
    const inNarrator = placeholders(narratorIds.length);
    console.log(`  Narrators: ${narratorIds.length}`);

    copyRows(
      src,
      dst,
      'narrator',
      [
        'id',
        'name_en',
        'name_ar',
        'generation',
        'grade',
        'tabaqa_number',
        'death_hijri',
        'death_gregorian',
        'death_place',
        'places_en',
        'hadith_count',
        'teacher_count',
        'student_count',
        'critic_count',
        'statement_count',
        'jarh_count',
        'tadil_count',
        'mixed_count',
        'unclassified_count',
        'flags',
        'unnamed',
        'search_text'
      ],
      `SELECT * FROM narrator WHERE id IN (${inNarrator})`,
      narratorIds
    );

    const detailCopied = copyRows(
      src,
      dst,
      'narrator_detail',
      ['id', 'payload'],
      `SELECT * FROM narrator_detail WHERE id IN (${inNarrator})`,
      narratorIds
    );
    console.log(`  narrator_detail: ${detailCopied}`);

    /**
     * Aliases and criticism are capped per narrator, which is what keeps the
     * fixture committable: unrestricted, 162 narrators bring 6,569 alias rows
     * and 7,472 statements, and the file goes from 1 MB to 6 MB. The dossier
     * reads at most eight alias forms anyway, and the narrators the tests name
     * keep their full apparatus so the criticism section is exercised properly.
     */
    const ALIAS_PER_NARRATOR = 8;
    const STATEMENTS_PER_NARRATOR = 6;

    let aliases = 0;
    let statements = 0;
    for (const id of narratorIds) {
      const required = REQUIRED_NARRATORS.includes(id);
      aliases += copyRows(
        src,
        dst,
        'narrator_alias',
        ['narrator_id', 'surface', 'surface_norm', 'n_mentions', 'n_hadiths', 'is_display'],
        'SELECT * FROM narrator_alias WHERE narrator_id = ? ORDER BY n_mentions DESC, surface LIMIT ?',
        [id, ALIAS_PER_NARRATOR]
      );
      statements += copyRows(
        src,
        dst,
        'criticism_statement',
        [
          'narrator_id',
          'ord',
          'critic',
          'text',
          'citation',
          'page_id',
          'verdict',
          'phenomenon_key',
          'phenomenon_label'
        ],
        'SELECT * FROM criticism_statement WHERE narrator_id = ? ORDER BY ord LIMIT ?',
        [id, required ? 1000 : STATEMENTS_PER_NARRATOR]
      );
    }
    console.log(`  narrator_alias: ${aliases}`);
    console.log(`  criticism_statement: ${statements}`);

    // The register shows these as totals, so they have to describe what the
    // fixture actually holds rather than what the real corpus does.
    dst.exec(`
      UPDATE narrator SET
        statement_count = (SELECT COUNT(*) FROM criticism_statement c WHERE c.narrator_id = narrator.id),
        critic_count = (SELECT COUNT(DISTINCT critic) FROM criticism_statement c WHERE c.narrator_id = narrator.id),
        jarh_count = (SELECT COUNT(*) FROM criticism_statement c WHERE c.narrator_id = narrator.id AND c.verdict = 'jarh'),
        tadil_count = (SELECT COUNT(*) FROM criticism_statement c WHERE c.narrator_id = narrator.id AND c.verdict = 'tadil')
    `);

    // Only the top narrations that survived into the fixture.
    dst.exec(`
      INSERT INTO narrator_top_hadith (narrator_id, ord, hadith_id)
      SELECT narrator_id, ord, hadith_id FROM (
        SELECT hn.narrator_id AS narrator_id,
               hn.hadith_id AS hadith_id,
               ROW_NUMBER() OVER (
                 PARTITION BY hn.narrator_id
                 ORDER BY h.parallel_count DESC, h.id ASC
               ) - 1 AS ord
          FROM (SELECT DISTINCT narrator_id, hadith_id FROM hadith_narrator
                 WHERE narrator_id IS NOT NULL) hn
          JOIN hadith h ON h.id = hn.hadith_id
      ) WHERE ord < 8
    `);

    // Both indexes, rebuilt with the same fold the real ones were built with.
    dst.exec(`
      INSERT INTO hadith_fts (rowid, ar_text, ar_matn, en_text, en_matn, chapter_en)
      SELECT id,
             ${arabicFoldSql("COALESCE(text_ar,'')")},
             ${arabicFoldSql("COALESCE(matn_ar,'')")},
             COALESCE(text_en,''),
             COALESCE(matn_en,''),
             COALESCE(chapter_en,'')
        FROM hadith
    `);
    dst.exec(`
      INSERT INTO narrator_fts (rowid, text)
      SELECT id, ${arabicFoldSql("COALESCE(search_text,'')")}
        FROM narrator WHERE unnamed = 0
    `);

    // Derived tables, recomputed for the subset.
    for (const [key, sql] of Object.entries({
      hadith_narrations: 'SELECT COALESCE(SUM(hadith_count), 0) AS n FROM hadith_book',
      hadith_collections: 'SELECT COUNT(*) AS n FROM hadith_book',
      narrator_named: 'SELECT COUNT(*) AS n FROM narrator WHERE unnamed = 0',
      narrator_graded: 'SELECT COUNT(*) AS n FROM narrator WHERE unnamed = 0 AND critic_count > 0',
      narrator_dated:
        'SELECT COUNT(*) AS n FROM narrator WHERE unnamed = 0 AND death_hijri IS NOT NULL'
    })) {
      dst
        .prepare('INSERT OR REPLACE INTO corpus_stat (key, value) VALUES (?, ?)')
        .run(key, Number(dst.prepare(sql).get().n));
    }

    for (const [kind, sql] of Object.entries({
      generation:
        "SELECT generation AS v, COUNT(*) AS n FROM narrator WHERE unnamed = 0 AND generation <> '' GROUP BY generation ORDER BY COUNT(*) DESC",
      grade:
        "SELECT grade AS v, COUNT(*) AS n FROM narrator WHERE unnamed = 0 AND grade <> '' GROUP BY grade ORDER BY COUNT(*) DESC",
      century:
        'SELECT ((death_hijri - 1) / 100) + 1 AS v, COUNT(*) AS n FROM narrator WHERE unnamed = 0 AND death_hijri IS NOT NULL GROUP BY v ORDER BY v'
    })) {
      dst.prepare('DELETE FROM narrator_facet WHERE kind = ?').run(kind);
      const insert = dst.prepare(
        'INSERT INTO narrator_facet (kind, value, n, ord) VALUES (?, ?, ?, ?)'
      );
      dst
        .prepare(sql)
        .all()
        .forEach((row, ord) => insert.run(kind, String(row.v), Number(row.n), ord));
    }

    dst.exec("INSERT INTO hadith_fts(hadith_fts) VALUES ('optimize')");
    dst.exec("INSERT INTO narrator_fts(narrator_fts) VALUES ('optimize')");
    dst.exec('ANALYZE');
    dst.exec('VACUUM');

    const verdict = String(Object.values(dst.prepare('PRAGMA integrity_check').get())[0]);
    if (verdict !== 'ok') throw new Error(`fixture integrity_check failed: ${verdict}`);
  } finally {
    dst.close();
    src.close();
  }

  const bytes = fileSize(dbPath);
  const version = `${FIXTURE_PREFIX}-${createHash('sha256')
    .update(readFileSync(dbPath))
    .digest('hex')
    .slice(0, 8)}`;
  mkdirSync(path.join(FIXTURE_DIR, version, 'chunks'), { recursive: true });

  console.log(`\n  Fixture database: ${megabytes(bytes)}`);
  console.log(`  Fixture version:  ${version}`);

  // Chunked by the same script the real corpus uses, so the fixture exercises
  // the real addressing rather than a simplified copy of it.
  execFileSync(
    process.execPath,
    [
      path.join(ROOT, 'scripts', 'chunk-db.mjs'),
      '--version',
      version,
      '--chunk-size',
      `${chunkSize}b`,
      '--db',
      dbPath,
      '--out',
      path.join(FIXTURE_DIR, version)
    ],
    { cwd: ROOT, stdio: 'inherit' }
  );

  execFileSync(
    process.execPath,
    [
      path.join(ROOT, 'scripts', 'build-corpus-meta.mjs'),
      '--version',
      version,
      '--db',
      dbPath,
      '--out',
      path.join(FIXTURE_DIR, version, 'corpus-meta.json'),
      '--no-site'
    ],
    { cwd: ROOT, stdio: 'inherit' }
  );

  // The sitemap routes prerender from this, so the fixture needs its own or a
  // fixture build would advertise 18,924 narrators it does not contain.
  const ids = (() => {
    const db = new DatabaseSync(dbPath, { readOnly: true });
    try {
      return db
        .prepare(
          'SELECT id FROM narrator WHERE unnamed = 0 AND (statement_count > 0 OR hadith_count > 0) ORDER BY statement_count DESC, id ASC'
        )
        .all()
        .map((r) => Number(r.id));
    } finally {
      db.close();
    }
  })();
  writeFileSync(
    path.join(FIXTURE_DIR, version, 'narrator-sitemap.json'),
    `${JSON.stringify({ corpusVersion: version, ids })}\n`,
    'utf8'
  );
  console.log(`  Wrote fixture narrator-sitemap.json (${ids.length} ids)`);

  // The database itself is not committed; the chunks are what gets served.
  rmSync(dbPath, { force: true });

  console.log(`\n  Fixture written to ${path.relative(ROOT, FIXTURE_DIR)}`);
  console.log('  Commit it. CI serves this in place of the real corpus.');
}

try {
  main();
} catch (error) {
  console.error(`\nbuild-corpus-fixture failed: ${error.message}`);
  process.exitCode = 1;
}
