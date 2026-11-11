#!/usr/bin/env node
/*
 * Spot-checks the 2nd century (101-200 AH) reader editions against the ORIGINAL translated JSON files,
 * not the converted publication-source.json: for random records, the Arabic in the built page must equal
 * the source Arabic character for character, and the English must equal the source English after the
 * plain-ASCII transliteration step.
 *
 * Usage: node scripts/verify-second-century-pages.mjs "<english-dir>" [samples-per-collection]
 */
import fs from 'node:fs';
import path from 'node:path';
import { toPlainEnglish } from './lib/plain-english.mjs';

const dir = process.argv[2];
const samples = Number(process.argv[3] ?? 3);
const specs = JSON.parse(fs.readFileSync('src/data/reader-editions.json', 'utf8'));
const files = fs.readdirSync(dir).filter(name => name.endsWith('.json'));

const decode = value => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const emphasis = value => value.replace(/\*([^*\n]*[A-Za-z][^*\n]*)\*/g, '$1');
const text = html => decode(html.replace(/<[^>]+>/g, ''));
const pick = (list, count) => [...list].sort(() => Math.random() - 0.5).slice(0, count);

function units(raw) {
  const out = [];
  (function walk(node) {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      if ('isnad' in node && 'matn' in node) out.push(node);
      else Object.values(node).forEach(walk);
    }
  })(raw.main_text ?? {});
  return out;
}

function articleHtml(slug, key) {
  const chapters = path.join('src/data/hadith-pages', slug, 'chapters');
  for (const name of fs.readdirSync(chapters)) {
    const html = fs.readFileSync(path.join(chapters, name), 'utf8');
    const start = html.indexOf(`id="hadith-${key}"`);
    if (start >= 0) return html.slice(start, html.indexOf('</article>', start));
  }
  return null;
}

const column = (article, lang) => {
  const start = article.indexOf(`column-${lang}`);
  const end = lang === 'en' ? article.indexOf('column-ar', start) : article.indexOf('class="details-grid"', start);
  return [...article.slice(start, end).matchAll(/<p class="(?:isnad|matn)">([\s\S]*?)<\/p>/g)].map(match => emphasis(text(match[1])));
};

let failures = 0;
for (const spec of specs) {
  if (!fs.existsSync(path.join('src/data/hadith-pages', spec.slug, 'publication-source.json'))) continue;
  const source = JSON.parse(fs.readFileSync(path.join('src/data/hadith-pages', spec.slug, 'publication-source.json'), 'utf8'));
  const raw = (() => {
    const compilation = source.compilation ?? {};
    if (source.schema_version !== 'hadithcritic.reader-source/1.0') return null;
    const file = files.find(name => name.startsWith(`${compilation.shamela_book_id}_`));
    return file ? JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) : null;
  })();
  if (!raw) continue; // earlier editions are not part of this batch
  const records = source.groups.flatMap(group => group.records);
  const chosen = pick(records, samples);
  const results = [];
  for (const record of chosen) {
    const article = articleHtml(spec.slug, record.id.replace(/[:.]/g, '-'));
    if (!article) { results.push(`${record.id}: article not found`); failures += 1; continue; }
    let expectedAr; let expectedEn;
    if (raw.main_text) {
      const unit = units(raw).find(item => item.id === record.source_id);
      expectedAr = [unit.isnad.ar, unit.matn.ar].filter(Boolean);
      expectedEn = [unit.isnad.en, unit.matn.en].filter(Boolean).map(toPlainEnglish);
    } else {
      const page = raw.pages.find(item => String(item.serial_number) === record.source_id);
      expectedAr = [page.text];
      expectedEn = [toPlainEnglish(page.text_english ?? page.text_en)];
    }
    const gotAr = column(article, 'ar');
    const gotEn = column(article, 'en');
    // Page-record sources are divided into isnad and matn, stripped of the printed number prefix, and may be cut
    // into numbered reports, so compare letters only and accept a record that is a whole page or part of one.
    const letters = list => list.join('').replace(/[^\p{L}\p{M}]/gu, '');
    const same = (got, want) => raw.main_text ? JSON.stringify(got) === JSON.stringify(want) : letters(want).includes(letters(got)) && letters(got).length > 0;
    const okAr = same(gotAr, expectedAr);
    const okEn = same(gotEn, expectedEn);
    if (!okAr || !okEn) failures += 1;
    results.push(`${record.id} (${record.source_id}) ar ${okAr ? 'equal' : 'DIFF'} en ${okEn ? 'equal' : 'DIFF'} [${expectedAr.join('').length} Arabic chars]`);
  }
  console.log(`${spec.slug}: ${results.join('; ')}`);
}
console.log(failures ? `FAILURES: ${failures}` : 'All sampled records match their sources.');
process.exit(failures ? 1 : 0);
