/* Writes the bilingual reader pages for the early commentaries (Mujāhid,
   al-Thawrī, Ibn Wahb) from the organized tafsir library.

     node scripts/build-tafsir-edition-pages.mjs [path/to/tafsir/works] [--overwrite]

   The library is the folder built by tools/build_works.py in the tafsir
   collection (default: ~/Desktop/tafsir/works). For each work it writes

     src/data/tafsir-pages/<id>/<part>.html   one page body per surah, or per chapter for Ibn Wahb
     src/data/tafsir-pages/<id>/index.json    the parts, their counts and menus

   Pages follow the compiler's units and order: one card per report, in the
   order the edition prints them (which is the compiler's numbering). A report
   that runs on to the next printed page stays one card, with the page break
   marked inside it. Ibn Wahb, whose work is not arranged by surah, is read by
   his own chapter headings within the manuscript's three parts.

   Page bodies are ordinary HTML and can be edited by hand afterwards, like the
   al-Ṭabarī pages. This script refuses to replace files that already exist;
   pass --overwrite only to regenerate them on purpose.

   The Arabic and English are copied exactly as they stand in the library. The
   only markup added is escaping, paragraph breaks at the source's own line
   breaks, page-break markers between the pieces of a report, and a highlight
   around Qur'anic wording the edition itself sets in braces {…}. Verse labels
   come only from references the edition prints. */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const library = resolve(args.find((a) => !a.startsWith('--')) ?? join(homedir(), 'Desktop', 'tafsir', 'works'));
const outRoot = resolve('src/data/tafsir-pages');
const suraNames = JSON.parse(readFileSync('src/data/quran-sura-names.json', 'utf8'));
const sura = new Map(suraNames.map((s) => [s.n, s]));

const WORKS = [
  { id: 'mujahid', dir: '0104_mujahid-ibn-jabr/shamela-12810', numbered: false },
  { id: 'thawri', dir: '0161_sufyan-al-thawri/shamela-2229', numbered: true },
  { id: 'ibn-wahb', dir: '0197_ibn-wahb/shamela-37361', numbered: true },
];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
const pad = (n, w = 2) => String(n).padStart(w, '0');
const words = (s) => (s ? s.split(/\s+/).filter(Boolean).length : 0);
const SHOWN = new Set(['tafsir', 'surah_heading', 'section_heading', 'preamble']);

/* Paragraphs at the source's own line breaks. */
const paras = (text, decorate = (s) => s) =>
  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${decorate(esc(line))}</p>`)
    .join('');

/* The edition sets Qur'anic wording in braces; the braces stay visible. */
const braces = (html) => html.replace(/\{[^{}]{1,600}\}/g, (m) => `<span class="scripture-quote">${m}</span>`);

const pageOf = (src) => (src.page ? `p. ${src.page}` : 'unpaginated');
const locator = (src) => (src.volume ? `Vol. ${src.volume}, ${pageOf(src)}` : pageOf(src));
const anchor = (rec) => `r-${rec.id.split('.').pop()}`;
const refLabel = (r) => `Q ${r.surah}:${r.ayah_from}${r.ayah_to && r.ayah_to !== r.ayah_from ? `–${r.ayah_to}` : ''}`;
const firstNumber = (s) => (s ? Number(s.match(/\d+/)?.[0]) : null);

function readPassages(dir) {
  const files = readdirSync(join(dir, 'passages')).filter((f) => f.endsWith('.jsonl')).sort();
  return files.map((file) => ({
    file: file.replace(/\.jsonl$/, ''),
    records: readFileSync(join(dir, 'passages', file), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line)),
  }));
}

/* Report cards: a segment that continues the previous page's report joins its card. */
function toCards(records) {
  const cards = [];
  for (const rec of records) {
    if (!SHOWN.has(rec.kind)) continue;
    const last = cards.at(-1);
    if (rec.continues && last && last.kind === 'tafsir') last.parts.push(rec);
    else cards.push({ kind: rec.kind, report: rec.report, parts: [rec], section: rec.section ?? null, orphan: Boolean(rec.continues) });
  }
  return cards;
}

function cardLabel(card, n, work) {
  if (card.kind === 'surah_heading') return 'Surah heading';
  if (card.kind === 'section_heading') return 'Chapter heading';
  if (card.kind === 'preamble') return 'Opening chain of transmission';
  if (card.orphan) return 'Continued from the previous page';
  if (!work.numbered) return `Report ${pad(n)}`;
  if (!card.report) return 'Report';
  const { ar, en } = card.report;
  return firstNumber(ar) === firstNumber(en) || !en ? `No. ${ar}` : `No. ${ar} (English ${en})`;
}

function cardHtml(card, n, opts) {
  const first = card.parts[0];
  const refs = [];
  const seen = new Set();
  for (const p of card.parts) for (const r of p.quran) {
    const key = refLabel(r);
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push(opts.surah && r.surah === opts.surah
      ? `<a class="tfe-ref" href="#${opts.firstFor.get(`${r.surah}:${r.ayah_from}`)}">${esc(key)}</a>`
      : `<span class="tfe-ref tfe-ref--other">${esc(key)}</span>`);
  }
  const pages = [...new Set(card.parts.map((p) => p.source.page ?? 'unpaginated'))];
  const where = opts.withVolume
    ? `Vol. ${first.source.volume}, ${pages.length > 1 ? `pp. ${pages[0]}–${pages.at(-1)}` : pageOf(first.source)}`
    : pages.length > 1 ? `pp. ${pages[0]}–${pages.at(-1)}` : pageOf(first.source);
  /* The pieces of the report, with the printed page break between them. */
  const column = (lang) => card.parts.map((p, i) => {
    const text = lang === 'ar' ? p.ar.text : p.en.text ?? '';
    const marker = i > 0 && p.source.page !== card.parts[i - 1].source.page
      ? `<p class="tfe-pb"><span>${esc(pageOf(p.source))}</span></p>` : '';
    return marker + (lang === 'ar' ? paras(text, braces) : paras(text));
  }).join('');
  const notes = card.parts
    .filter((p) => p.ar.footnote || p.en.footnote)
    .map((p) => `<aside class="tfe-note"><span class="tfe-note__label">Editor's note, ${esc(pageOf(p.source))}</span><div class="tfe-entry__body">` +
      `<div class="tfe-entry__en">${p.en.footnote ? paras(p.en.footnote) : ''}</div>` +
      `<div class="tfe-entry__ar arabic" lang="ar" dir="rtl">${p.ar.footnote ? paras(p.ar.footnote) : ''}</div></div></aside>`)
    .join('');
  const heading = card.kind === 'surah_heading' || card.kind === 'section_heading';
  return (
    `<article class="tfe-entry${heading ? ' tfe-entry--heading' : ''}${card.kind === 'preamble' ? ' tfe-entry--preamble' : ''}" id="${anchor(first)}" data-serial="${card.parts.map((p) => p.source.serial).join(' ')}">` +
    `<header class="tfe-entry__head"><span class="tfe-entry__n">${esc(cardLabel(card, n, opts.work))}</span>` +
    `<span class="tfe-entry__loc">${esc(where)}</span>` +
    (refs.length ? `<span class="tfe-entry__refs" aria-label="Verses the edition cites">${refs.join('')}</span>` : '') +
    `</header><div class="tfe-entry__body">` +
    `<div class="tfe-entry__en prose" lang="en">${column('en')}</div>` +
    `<div class="tfe-entry__ar arabic" lang="ar" dir="rtl">${column('ar')}</div>` +
    `</div>${notes}</article>`
  );
}

function buildPart(work, source, cards, meta) {
  const surah = meta.surah ?? null;
  /* The first card citing each verse of this surah, for the verse index and menu. */
  const firstFor = new Map();
  for (const c of cards) for (const p of c.parts) for (const q of p.quran) {
    if (q.surah !== surah) continue;
    const key = `${q.surah}:${q.ayah_from}`;
    if (!firstFor.has(key)) firstFor.set(key, anchor(c.parts[0]));
  }
  const verses = [...firstFor.keys()].map((k) => Number(k.split(':')[1])).sort((a, b) => a - b);
  const opts = { work, surah, firstFor, withVolume: work.id === 'ibn-wahb' };

  let html = `<!-- Generated by scripts/build-tafsir-edition-pages.mjs from the tafsir library (${work.dir}/passages/${source}). Safe to edit by hand; regeneration needs --overwrite. -->\n`;
  const jumps = [];
  if (verses.length) {
    html += `<nav class="tfe-verses" aria-label="Verses cited in this surah"><span class="tfe-verses__label">Verses the edition cites</span><div class="tfe-verses__list">` +
      verses.map((v) => `<a class="tfe-ref" href="#${firstFor.get(`${surah}:${v}`)}">${surah}:${v}</a>`).join('') +
      `</div></nav>\n`;
    for (const v of verses) jumps.push({ id: firstFor.get(`${surah}:${v}`), label: `Verse ${surah}:${v}` });
  }
  let n = 0;
  html += `<section class="tfe-section" id="reports"><div class="tfe-entries">`;
  for (const c of cards) {
    if (c.kind === 'tafsir' && !c.orphan) n++;
    html += cardHtml(c, n, opts) + '\n';
    if (!verses.length && c.kind === 'tafsir' && c.report) jumps.push({ id: anchor(c.parts[0]), label: `No. ${c.report.ar}` });
  }
  html += `</div></section>\n`;

  const tafsir = cards.filter((c) => c.kind === 'tafsir');
  const first = cards[0].parts[0].source;
  const last = cards.at(-1).parts.at(-1).source;
  return {
    html,
    summary: {
      entries: tafsir.filter((c) => !c.orphan).length,
      enWords: cards.reduce((s, c) => s + c.parts.reduce((t, p) => t + words(p.en.text), 0), 0),
      arWords: cards.reduce((s, c) => s + c.parts.reduce((t, p) => t + words(p.ar.text), 0), 0),
      firstPage: locator(first),
      lastPage: locator(last),
      firstReport: tafsir.find((c) => c.report)?.report.ar ?? null,
      lastReport: tafsir.findLast((c) => c.report)?.report.ar ?? null,
      verses: verses.length,
      jumps,
    },
  };
}

/* The parts of a work: surahs as the edition heads them, or (Ibn Wahb) his
   chapter headings within each of the manuscript's parts. */
function partsOf(workJson, groups) {
  const out = [];
  if (workJson.structure.grouping === 'volume') {
    for (const { file, records } of groups) {
      const volume = Number(file.replace(/^v/, ''));
      const cards = toCards(records);
      if (!cards.length) continue;
      const chapters = [];
      for (const c of cards) {
        if (c.kind === 'section_heading' || !chapters.length) chapters.push({ heading: c.kind === 'section_heading' ? c.section : null, cards: [] });
        chapters.at(-1).cards.push(c);
      }
      chapters.forEach((ch, i) => {
        const title = ch.heading?.en?.replace(/[.\s]+$/, '')
          ?? (chapters.length === 1 ? `Volume ${volume}` : `Volume ${volume}, before the first heading`);
        out.push({
          meta: {
            slug: `v${volume}-${i + 1}`,
            volume,
            chapter: i + 1,
            chapters: chapters.length,
            title,
            ar: ch.heading?.ar ?? null,
            headed: Boolean(ch.heading),
          },
          cards: ch.cards,
          source: `${file}.jsonl`,
        });
      });
    }
  } else {
    for (const { file, records } of groups) {
      if (!records.some((r) => r.kind === 'tafsir')) continue; // front and back matter
      const n = Number(file.slice(0, 3));
      const heading = records.find((r) => r.kind === 'surah_heading');
      out.push({
        meta: {
          slug: String(n),
          surah: n,
          title: sura.get(n).latin,
          ar: sura.get(n).ar,
          verseCount: sura.get(n).verses,
          sourceHeading: workJson.structure.source_headings?.[String(n)] ?? heading?.ar.text.replace(/‌/g, '').trim() ?? null,
        },
        cards: toCards(records),
        source: `${file}.jsonl`,
      });
    }
  }
  return out;
}

let written = 0;
let skipped = 0;
const write = (target, text) => {
  if (existsSync(target) && !overwrite) skipped++;
  else {
    writeFileSync(target, text);
    written++;
  }
};
for (const work of WORKS) {
  const dir = join(library, work.dir);
  if (!existsSync(dir)) throw new Error(`Missing ${dir}. Run tools/build_works.py in the tafsir folder first.`);
  const workJson = JSON.parse(readFileSync(join(dir, 'work.json'), 'utf8'));
  const out = join(outRoot, work.id);
  mkdirSync(out, { recursive: true });
  const parts = [];
  for (const { meta, cards, source } of partsOf(workJson, readPassages(dir))) {
    const { html, summary } = buildPart(work, source, cards, meta);
    write(join(out, `${meta.slug}.html`), html);
    parts.push({ ...meta, ...summary });
  }
  write(join(out, 'index.json'), JSON.stringify({
    id: work.id,
    workId: workJson.work_id,
    editionId: workJson.edition_id,
    unit: 'report',
    numbered: work.numbered,
    grouping: workJson.structure.grouping === 'volume' ? 'chapter' : 'surah',
    title: workJson.title,
    author: workJson.author,
    edition: workJson.edition,
    structureNote: workJson.structure.note,
    translation: workJson.translations[0],
    parts,
  }, null, 1) + '\n');
  console.log(`${work.id}: ${parts.length} pages, ${parts.reduce((s, p) => s + p.entries, 0)} reports`);
}
console.log(`Wrote ${written} files${skipped ? `; kept ${skipped} existing (use --overwrite to replace)` : ''}.`);
