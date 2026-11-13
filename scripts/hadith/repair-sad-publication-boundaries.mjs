// Separate the following chapter's heading and printed page breaks from the
// narration display. Raw page breaks remain in the source transcription.
import fs from 'node:fs';

const path = 'src/data/hadith/pages/musnad-sad-ibn-abi-waqqas/publication-source.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const expected = new Map(data.books.slice(1).map(book => [String(book.firstReport - 1) + '-1', book.titleEn]));
const englishPage = /\s*\[p\.\s*(\d+)\]\s*/gi;
const arabicPage = /\s*⦗ص:\s*(\d+)⦘\s*/g;
const cleanPages = (value, pattern) => value.replace(pattern, ' ').trim();
let headings = 0;
let pageRecords = 0;
for (const record of data.records) {
  if (record.en?.includes('###')) {
    const heading = expected.get(record.id);
    if (!heading || !record.en.endsWith(`### ${heading}`)) throw new Error(`Unexpected heading in ${record.id}`);
    for (const key of ['en', 'display_text_en', 'display_matn_en']) {
      const suffix = ` ### ${heading}`;
      if (typeof record[key] !== 'string' || !record[key].endsWith(suffix)) throw new Error(`Unexpected ${key} in ${record.id}`);
      record[key] = record[key].slice(0, -suffix.length);
    }
    headings++;
  }
  const pages = new Set();
  for (const [key, pattern] of [['en', englishPage], ['ar', arabicPage]]) {
    for (const match of (record[key] || '').matchAll(pattern)) pages.add(Number(match[1]));
  }
  if (pages.size) {
    record.source_page_breaks = [...pages].sort((a, b) => a - b);
    for (const key of ['display_text_en', 'display_isnad_en', 'display_matn_en']) if (typeof record[key] === 'string') record[key] = cleanPages(record[key], englishPage);
    for (const key of ['display_text_ar', 'display_isnad_ar', 'display_matn_ar']) if (typeof record[key] === 'string') record[key] = cleanPages(record[key], arabicPage);
    pageRecords++;
  }
}
if (headings !== 8) throw new Error(`Expected eight chapter boundaries, found ${headings}`);
if (pageRecords !== 15) throw new Error(`Expected 15 records with page breaks, found ${pageRecords}`);
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log(`Corrected ${headings} chapter headings and ${pageRecords} records with printed page breaks.`);
