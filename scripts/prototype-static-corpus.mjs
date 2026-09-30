#!/usr/bin/env node

/**
 * Export a small, read-only sample of the corpus as static JSON shards and
 * report raw/gzip sizes. This is a benchmark artifact, not a production
 * publisher. It intentionally writes under ignored dist-db/.
 *
 * Usage:
 *   node --experimental-sqlite scripts/prototype-static-corpus.mjs
 *   node --experimental-sqlite scripts/prototype-static-corpus.mjs 20614 5361
 */

import { gzipSync } from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = resolve(process.env.CORPUS_MASTER_DB || join(root, 'dist-db/silsilah.db'));
const outputDir = join(root, 'dist-db/static-prototype');
const hadithId = Number(process.argv[2] || 20614);
const narratorId = Number(process.argv[3] || 5361);

if (!Number.isSafeInteger(hadithId) || hadithId <= 0) throw new Error('Hadith id must be a positive integer.');
if (!Number.isSafeInteger(narratorId) || narratorId < 0) throw new Error('Narrator id must be a nonnegative integer.');

const db = new DatabaseSync(dbPath, { readOnly: true });
db.exec('PRAGMA query_only = ON');

const get = (sql, ...params) => db.prepare(sql).get(...params);
const all = (sql, ...params) => db.prepare(sql).all(...params);

const book = get(
  `SELECT b.id, b.slug, b.title_en AS titleEn, b.title_ar AS titleAr, b.hadith_count AS hadithCount
     FROM hadith h JOIN hadith_book b ON b.id = h.book_id WHERE h.id = ?`,
  hadithId
);
if (!book) throw new Error(`Hadith ${hadithId} was not found in ${dbPath}.`);

const searchIndex = {
  book,
  rows: all(
    `SELECT id, hadith_num, chapter_ar, chapter_en,
            matn_ar, text_ar, matn_en, text_en
       FROM hadith WHERE book_id = ? ORDER BY id`,
    book.id
  )
};

const hadith = get(
  `SELECT h.id, h.hadith_num, h.chapter_en, h.chapter_ar,
          h.matn_ar, h.matn_en, h.text_ar, h.text_en,
          h.path_count, h.narrator_count, h.parallel_count, h.witness_count, h.variant_count,
          b.id AS book_id, b.title_en AS book_en, b.title_ar AS book_ar, b.slug AS book_slug
     FROM hadith h JOIN hadith_book b ON b.id = h.book_id WHERE h.id = ?`,
  hadithId
);
const chain = all(
  `SELECT c.path_idx, c.pos, c.narrator_id, c.name,
          n.name_en, n.death_hijri
     FROM hadith_chain c LEFT JOIN narrator n ON n.id = c.narrator_id
    WHERE c.hadith_id = ? ORDER BY c.path_idx, c.pos`,
  hadithId
);
const rawSubjects = all('SELECT label_ar, label_en FROM hadith_subject WHERE hadith_id = ?', hadithId);
const subjects = [...new Map(rawSubjects.map((row) => [String(row.label_en).trim(), row])).values()];
const glosses = all('SELECT word_ar, word_en FROM hadith_gloss WHERE hadith_id = ?', hadithId);
const hadithDetail = { hadith, chain, subjects, glosses };

const narratorPayload = get('SELECT payload FROM narrator_detail WHERE id = ?', narratorId)?.payload;
if (!narratorPayload) throw new Error(`Narrator dossier ${narratorId} was not found in ${dbPath}.`);
const narratorDetail = JSON.parse(narratorPayload);
const criticismRows = all(
  `SELECT critic, text, citation, page_id AS pageId, verdict,
          phenomenon_key AS phenomenonKey, phenomenon_label AS phenomenonLabel
     FROM criticism_statement WHERE narrator_id = ? ORDER BY ord`,
  narratorId
);
const transmissions = all(
  `SELECT h.id, h.hadith_num, h.matn_en,
          h.narrator_count, h.parallel_count,
          (SELECT MIN(hn.pos) FROM hadith_narrator hn
            WHERE hn.narrator_id = t.narrator_id AND hn.hadith_id = h.id) AS pos,
          b.title_en AS book_en
     FROM narrator_top_hadith t
     JOIN hadith h ON h.id = t.hadith_id
     JOIN hadith_book b ON b.id = h.book_id
    WHERE t.narrator_id = ? ORDER BY t.ord`,
  narratorId
);
const transmissionCount = Number(get(
  'SELECT COUNT(DISTINCT hadith_id) AS n FROM hadith_narrator WHERE narrator_id = ?', narratorId
)?.n ?? 0);
const attestedForms = all(
  `SELECT surface, n_mentions, is_display
     FROM narrator_alias WHERE narrator_id = ? ORDER BY n_mentions DESC LIMIT 8`,
  narratorId
);
const narratorDossier = { detail: narratorDetail, criticismRows, transmissions, transmissionCount, attestedForms };

const outputs = [
  [`hadith/books/${book.slug}.search.json`, searchIndex],
  [`hadith/records/${hadithId}.json`, hadithDetail],
  [`narrators/${narratorId}.json`, narratorDossier]
];

await mkdir(outputDir, { recursive: true });
const measurements = [];
for (const [relativePath, value] of outputs) {
  const target = join(outputDir, relativePath);
  await mkdir(dirname(target), { recursive: true });
  const json = `${JSON.stringify(value)}\n`;
  await writeFile(target, json, 'utf8');
  const compressed = gzipSync(json, { level: 9 });
  await writeFile(`${target}.gz`, compressed);
  measurements.push({
    file: relativePath,
    rawBytes: Buffer.byteLength(json),
    gzipBytes: compressed.byteLength
  });
}

const report = {
  corpus: { database: dbPath, hadithRows: Number(get('SELECT COUNT(*) AS n FROM hadith').n), narratorRows: Number(get('SELECT COUNT(*) AS n FROM narrator').n) },
  sample: { book: { slug: book.slug, records: book.hadithCount }, hadithId, narratorId },
  files: measurements,
  totals: measurements.reduce((sum, item) => ({ rawBytes: sum.rawBytes + item.rawBytes, gzipBytes: sum.gzipBytes + item.gzipBytes }), { rawBytes: 0, gzipBytes: 0 })
};
await writeFile(join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
db.close();

console.log(JSON.stringify(report, null, 2));
