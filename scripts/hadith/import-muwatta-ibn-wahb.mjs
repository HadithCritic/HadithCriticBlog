#!/usr/bin/env node
/*
 * Imports the supplied organized translation of the surviving Muwaṭṭaʾ of Ibn Wahb excerpt into
 * the source format used by the single-page reader. Reports retain their original printed number,
 * page record, page range, source serial, Arabic, English and translation status.
 *
 * Usage: node scripts/hadith/import-muwatta-ibn-wahb.mjs <organized translation JSON>
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { splitArabic, reconstructs } from './lib/isnad-split.mjs';

const [input] = process.argv.slice(2);
if (!input) throw new Error('Pass the organized translation JSON path.');
const inputPath = path.resolve(input);
const outputDir = path.resolve('src/data/hadith/pages/muwatta-ibn-wahb');
const outputPath = path.join(outputDir, 'publication-source.json');
const bytes = fs.readFileSync(inputPath);
const source = JSON.parse(bytes.toString('utf8'));
const book = source.book;
if (book?.shamela_book_id !== '12534' || !book?.title_arabic?.includes('موطأ عبد الله بن وهب')) {
  throw new Error('The input is not the organized translation of the Muwaṭṭaʾ Ibn Wahb excerpt.');
}
if (source.translation_coverage?.numbered_reports_present !== 520 || source.translation_coverage?.untranslated_reports !== 0) {
  throw new Error('Unexpected translation coverage.');
}

const metadata = source.records.find(record => record.type === 'metadata');
const pageRecords = source.records.filter(record => record.type === 'narrations');
if (!metadata || pageRecords.length !== 130) throw new Error(`Expected one metadata record and 130 page records; found ${pageRecords.length}.`);

const reports = [];
let previousPage = 0;
let unsplitArabic = 0;
for (const pageRecord of pageRecords) {
  const page = Number(pageRecord.page);
  if (!Number.isInteger(page) || page < previousPage) throw new Error(`Source page order breaks at serial ${pageRecord.serial_number}.`);
  previousPage = page;
  for (const item of pageRecord.narrations ?? []) {
    if (!Number.isInteger(item.no) || !item.arabic_text || !item.isnad || !item.matn || item.translation_status !== 'translated') {
      throw new Error(`Report ${item.no ?? '(unlabelled)'} on page ${page} is incomplete.`);
    }
    const split = splitArabic(item.arabic_text);
    const exactSplit = split && reconstructs(item.arabic_text, split) ? split : null;
    if (!exactSplit) unsplitArabic += 1;
    reports.push({
      id: String(item.no),
      no: String(item.no),
      display_number: String(item.no),
      noun: 'Narration',
      volume: pageRecord.volume,
      page: item.source_page_start ?? pageRecord.page,
      source_page_start: item.source_page_start ?? pageRecord.page,
      source_page_end: item.source_page_end ?? item.source_page_start ?? pageRecord.page,
      source_serial_number: item.source_serial_number ?? pageRecord.serial_number,
      isnad_en: item.isnad,
      matn_en: item.matn,
      isnad_ar: exactSplit?.isnad ?? '',
      matn_ar: exactSplit?.matn ?? item.arabic_text,
      original_source_text_arabic: item.arabic_text,
      narrators: item.narrators,
      translation_status: item.translation_status,
      ...(exactSplit ? {} : { no_split_ar: true }),
      ...(item.source_page_end && item.source_page_end !== item.source_page_start
        ? { notes: [`The report continues onto printed page ${item.source_page_end}.`] }
        : {}),
    });
  }
}

const numbers = reports.map(report => Number(report.display_number));
const expectedNumbers = Array.from({ length: 521 }, (_, index) => index + 1).filter(number => number !== 456);
if (reports.length !== 520 || new Set(numbers).size !== reports.length || numbers.some((number, index) => number !== expectedNumbers[index])) {
  throw new Error('The report sequence must contain 1–521 in source order, with printed no. 456 absent.');
}

const title = 'Muwaṭṭaʾ ʿAbd Allāh ibn Wahb (surviving excerpt)';
const arabicTitle = book.title_arabic;
const sourceNote = book.source_note;
const publication = {
  schema_version: 1,
  compilation: {
    id: 'muwatta-ibn-wahb',
    title_en: title,
    title_ar: arabicTitle,
    short_name: 'Muwaṭṭaʾ Ibn Wahb',
    description_en: 'The surviving excerpt of the Muwaṭṭaʾ of ʿAbd Allāh ibn Wahb (d. 197 AH), presented in its printed page and report order. This is not the complete original work.',
    kind_en: 'Muwaṭṭaʾ · surviving excerpt',
    unit_noun: 'Narration',
    edition: book.edition,
    editor: book.editor,
    publisher: 'Dār Ibn al-Jawzī, Dammam',
    shamela_book_id: book.shamela_book_id,
    source_note: sourceNote,
  },
  source_files: {
    source_exports: [{ path: path.basename(inputPath), sha256: crypto.createHash('sha256').update(bytes).digest('hex') }],
    english_provenance: 'The English translation is reproduced from the supplied organized translation JSON. Arabic source text is retained alongside it.',
  },
  source_import: source,
  translation_coverage: source.translation_coverage,
  structure: {
    book_count: 1,
    report_count: reports.length,
    translated_reports: reports.length,
    arabic_reports: reports.length,
    printed_page_range: { first: 27, last: 152 },
    missing_printed_numbers: [456],
    unparsed_arabic_isnad_count: unsplitArabic,
    note: 'No chapter divisions are supplied. Reports remain in source-page and printed-number order; the reader exposes printed page references and search rather than inventing chapter headings.',
  },
  notes: [
    { label: 'Structure', text: 'The supplied excerpt has no separate chapter-heading records. Reports are shown in their original page-record and printed-number order, with printed page references. The reader provides search by report number and text; no chapter divisions have been added.' },
    { label: 'Completeness', text: `${sourceNote} Printed report number 456 is absent from the supplied source; all other numbered reports from 1 through 521 are present.` },
    { label: 'Translation', text: 'The English text is reproduced as supplied in the organized translation. Arabic wording and the report numbering are preserved.' },
  ],
  groups: [{
    number: 1,
    title_en: 'Reports in printed page order',
    title_ar: '',
    kind: 'narrations',
    frames_before: [{
      title_en: 'Bibliographic metadata',
      page: null,
      en: metadata.text_translation,
      ar: metadata.source_arabic,
    }],
    frames_after: [],
    records: reports,
  }],
};

fs.mkdirSync(outputDir, { recursive: true });
const tmp = `${outputPath}.tmp`;
fs.writeFileSync(tmp, `${JSON.stringify(publication, null, 2)}\n`, 'utf8');
const check = JSON.parse(fs.readFileSync(tmp, 'utf8'));
if (check.groups[0].records.length !== 520 || check.source_import.records.length !== source.records.length) {
  fs.rmSync(tmp, { force: true });
  throw new Error('Output validation failed.');
}
fs.renameSync(tmp, outputPath);
console.log(`Imported ${reports.length} numbered reports from printed pages 27–152 (${unsplitArabic} Arabic chains displayed as full source text where they could not be split exactly).`);
