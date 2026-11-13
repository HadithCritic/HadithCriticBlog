#!/usr/bin/env node
/*
 * Writes one bilingual JSON file per compilation to src/data/hadith/json/<slug>.json.
 *
 * The published reader pages are the reference for what each compilation contains, so the export reads
 * them back: every heading in the collection's chapter index, and under it every entry with its number,
 * its page citation, and its Arabic and English text (isnad and matn apart where the page divides them).
 * The two editions with their own readers (Ṣaḥīfat Hammām, Faḍāʾil Makka) are read from
 * src/data/hadith/local-editions/. Nothing here is imported by the site; the files are data for reuse.
 *
 * Usage: node scripts/hadith/export-compilation-json.mjs [slug ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { RENOVATED, SINGLE_PAGE } from './lib/renovated-readers.mjs';

const pagesRoot = path.resolve('src/data/hadith/pages');
const outRoot = path.resolve('src/data/hadith/json');
const only = process.argv.slice(2);
const titles = new Map(JSON.parse(fs.readFileSync('src/data/hadith/reader-editions.json', 'utf8')).map(item => [item.slug, item]));
titles.set('al-shama-il-al-muhammadiyah', { title_en: "Al-Shama'il al-Muhammadiyah", title_ar: 'الشمائل المحمدية' });

const decode = value => value
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const plain = html => decode(String(html ?? '').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').trim();
const first = (html, pattern) => html.match(pattern)?.[1] ?? '';

/** The isnad and matn paragraphs of one language column; a placeholder line is not text. */
function column(html) {
  const pick = name => [...html.matchAll(new RegExp(`<p class="${name}">([\\s\\S]*?)</p>`, 'g'))].map(hit => plain(hit[1])).filter(Boolean).join('\n');
  return { isnad: pick('isnad'), matn: pick('matn') };
}

function entryFrom(article) {
  const split = article.indexOf('column-ar');
  const end = article.search(/<div class="(?:details-grid|entry-foot|entry-notes)"|<\/section>/);
  const en = column(article.slice(0, split));
  const ar = column(article.slice(split, end > split ? end : undefined));
  const cite = plain(first(article, /<div class="hadith-cite">([\s\S]*?)<\/div>/));
  return {
    id: first(article, /id="hadith-([^"]+)"/),
    label: plain(first(article, /<div class="hadith-count"[^>]*><span>([\s\S]*?)<\/span>/)),
    number: plain(first(article, /<div class="hadith-count"[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>/)),
    citation: cite,
    isnad_ar: ar.isnad, matn_ar: ar.matn,
    isnad_en: en.isnad, matn_en: en.matn,
  };
}

function prosePages(html) {
  return html.split('<div class="prose-page"').slice(1).map(block => {
    const split = block.indexOf('column-ar');
    return {
      id: first(block, /id="hadith-([^"]+)"/),
      label: 'Page', number: plain(first(block, /<div class="language-label">Page ([^<]*)</)), citation: '',
      isnad_ar: '', matn_ar: column(block.slice(split)).matn, isnad_en: '', matn_en: column(block.slice(0, split)).matn,
    };
  });
}

function fromPages(slug) {
  const root = path.join(pagesRoot, slug);
  const index = JSON.parse(fs.readFileSync(path.join(root, 'chapter-index.json'), 'utf8'));
  return index.map(chapter => {
    const html = fs.readFileSync(path.join(root, chapter.file), 'utf8');
    const articles = html.split('<article class="hadith').slice(1).map(block => block.slice(0, block.indexOf('</article>')));
    const entries = articles.length ? articles.map(entryFrom) : prosePages(html);
    return { number: chapter.n, kind: chapter.noun ?? 'Section', title_en: chapter.title_en, title_ar: chapter.title_ar ?? '', entries };
  });
}

/** A single-page reader carries its entries as data; they are read back from it. */
function fromReader(slug) {
  const html = fs.readFileSync(path.join(pagesRoot, slug, 'reader.html'), 'utf8');
  const data = JSON.parse(html.match(/<script type="application\/json" id="sf-data">([\s\S]*?)<\/script>/)[1]);
  const sections = [];
  for (const report of data.reports) {
    if (report.heading || !sections.length) sections.push({ number: sections.length + 1, kind: report.heading ? 'Heading' : 'Text', title_en: report.heading?.en ?? 'The text', title_ar: report.heading?.ar ?? '', entries: [] });
    sections.at(-1).entries.push({
      id: report.id.replace(/^hadith-/, ''), label: report.noun, number: report.label, citation: [data.short, report.page ? `p. ${report.page}` : ''].filter(Boolean).join(' · '),
      isnad_ar: report.isnad_ar, matn_ar: report.matn_ar, isnad_en: report.isnad_en, matn_en: report.matn_en,
    });
  }
  return sections;
}

function fromLocal(slug) {
  if (slug === 'sahifat-hammam-ibn-munabbih') {
    const records = JSON.parse(fs.readFileSync('src/data/hadith/local-editions/hammam.json', 'utf8'));
    const entry = (record, index) => ({
      id: `entry-${index + 1}`, label: 'Narration', number: record.hadith_number == null ? '' : String(record.hadith_number - 1), citation: '',
      isnad_ar: '', matn_ar: record.text ?? '', isnad_en: '', matn_en: record.english ?? '',
    });
    return [
      { number: 1, kind: 'Opening', title_en: 'Introduction and the one chain of the ṣaḥīfa', title_ar: '', entries: records.slice(0, 3).map(entry).map(item => ({ ...item, label: 'Opening text', number: '' })) },
      { number: 2, kind: 'Text', title_en: 'The narrations', title_ar: '', entries: records.slice(3).map((record, index) => entry(record, index + 3)) },
    ];
  }
  const makka = JSON.parse(fs.readFileSync('src/data/hadith/local-editions/fadail-makka.json', 'utf8'));
  return [{
    number: 1, kind: 'Text', title_en: 'The treatise, by printed page', title_ar: '',
    entries: makka.pages.map(page => ({ id: `page-${page.page_number}`, label: 'Page', number: String(page.page_number), citation: page.heading ?? '', isnad_ar: '', matn_ar: page.arabic ?? '', isnad_en: '', matn_en: page.english ?? '' })),
  }];
}

fs.mkdirSync(outRoot, { recursive: true });
const summary = [];
const LOCAL = new Set(['sahifat-hammam-ibn-munabbih', 'fada-il-makka']);
for (const slug of fs.readdirSync(pagesRoot).filter(name => !only.length || only.includes(name))) {
  // A redesigned reader holds the same text as the pages its JSON was exported from, so that file stands.
  if (RENOVATED.has(slug) && !LOCAL.has(slug)) {
    const kept = JSON.parse(fs.readFileSync(path.join(outRoot, `${slug}.json`), 'utf8'));
    summary.push({ slug, title_en: kept.title_en, title_ar: kept.title_ar, sections: kept.section_count, entries: kept.entry_count, file: `${slug}.json` });
    console.log(`${slug}: kept (redesigned reader)`);
    continue;
  }
  const hasIndex = fs.existsSync(path.join(pagesRoot, slug, 'chapter-index.json'));
  const sections = hasIndex ? fromPages(slug) : SINGLE_PAGE.has(slug) ? fromReader(slug) : fromLocal(slug);
  const entries = sections.reduce((sum, section) => sum + section.entries.length, 0);
  const missing = sections.flatMap(section => section.entries).filter(entry => !(entry.matn_ar || entry.isnad_ar) || !(entry.matn_en || entry.isnad_en)).length;
  const title = titles.get(slug) ?? { title_en: slug, title_ar: '' };
  const payload = {
    schema_version: 'hadithcritic.compilation/1.0',
    slug, title_en: title.title_en, title_ar: title.title_ar,
    source: hasIndex || SINGLE_PAGE.has(slug) ? `src/data/hadith/pages/${slug}/` : 'src/data/hadith/local-editions/',
    section_count: sections.length, entry_count: entries,
    sections,
  };
  fs.writeFileSync(path.join(outRoot, `${slug}.json`), `${JSON.stringify(payload, null, 1)}\n`, 'utf8');
  summary.push({ slug, title_en: title.title_en, title_ar: title.title_ar, sections: sections.length, entries, file: `${slug}.json` });
  console.log(`${slug}: ${sections.length} sections, ${entries} entries${missing ? `, ${missing} with one language empty` : ''}`);
}
if (!only.length) fs.writeFileSync(path.join(outRoot, 'index.json'), `${JSON.stringify(summary, null, 1)}\n`, 'utf8');
