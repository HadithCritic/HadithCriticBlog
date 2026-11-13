/* Writes the reader pages for al-Zamakhsharī's al-Kashshāf from the supplied
   English translation, which pairs each printed page of the edition (one
   Shamela row) with its English.

     node scripts/tafsir/build-tafsir-zamakhshari.mjs <translation.json> [arabic-folder] [--overwrite]

   <translation.json> is "Al-Zamakhshari — Al-Kashshaf — English Partial
   Translation.json". [arabic-folder] is the Arabic export of the whole work,
   one JSON per surah (default: ~/Desktop/Tafsir/Tafsir Kashshaf, with its
   "arabic" subfolder); it is read only to count how much of the Arabic there
   is, so the site can say how much of it is translated.

   It writes

     src/data/tafsir/pages/zamakhshari/<surah>.html   one page body per translated surah
     src/data/tafsir/pages/zamakhshari/index.json     the parts, their counts, and the coverage

   The text is arranged by passage, not by printed page. A passage opens where
   the edition prints a verse heading, such as
   [سورة الإخلاص (112) : الآيات 1 الى 4], and runs to the next one, so a
   printed page that holds two headings is divided between two passages. Each
   passage is one <section class="chapter" data-verses="…">; the verse pages
   (src/pages/projects/tafsir/[work]/[surah]/[verse].astro) show the passages
   filed under a verse. Text before a surah's first heading is its opening
   (data-opening) and is read with the first verse.

   Inside a passage:

   - the verses the edition quotes under its heading are set apart as the
     passage's lemma, when their numbers, (1) (2) …, are found in both
     languages;
   - the rest follows page by page, the Arabic facing its English, each row
     labeled with its printed page;
   - al-Zamakhsharī's objections and replies ("فإن قلت … قلت …", "If you
     ask … I say …") are set as question and answer where a page has the same
     number of them in both languages. An answer runs to the next question or
     the end of the page, as nothing in the text marks where it stops;
   - the editor's notes for the passage's pages are gathered under it.

   The wording is copied as supplied. The only markup added is escaping, line
   breaks at the source's own, and small type for the note markers.

   Existing page files are kept unless --overwrite is passed, so hand edits
   are safe. */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const [sourcePath, arabicArg] = args.filter((a) => !a.startsWith('--'));
if (!sourcePath) {
  process.stderr.write('Usage: node scripts/tafsir/build-tafsir-zamakhshari.mjs <translation.json> [arabic-folder] [--overwrite]\n');
  process.exit(1);
}
const arabicDir = resolve(arabicArg ?? join(homedir(), 'Desktop', 'Tafsir', 'Tafsir Kashshaf'));
const outDir = resolve('src/data/tafsir/pages/zamakhshari');
const sura = new Map(JSON.parse(readFileSync('src/data/quran/quran-sura-names.json', 'utf8')).map((s) => [s.n, s]));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
const pad = (n) => String(n).padStart(2, '0');
const words = (s) => (s ? s.split(/\s+/).filter(Boolean).length : 0);
const has = (s) => Boolean(s && s.trim());
/* The export pads its Arabic with zero-width non-joiners. */
const tidy = (s) => s.replace(/[‌‏]/g, '').replace(/[ \t]+/g, ' ').trim();

/* The edition's verse headings: [سورة البقرة (2) : آية 1], [… : الآيات 1 الى 4]. */
const AR_HEADING = /\[سورة[^\]\[]*?\(\s*\d+\s*\)\s*:\s*(?:آية|الآية|الآيات|الآيتان|آيات)\s*(\d+)(?:\s*(?:الى|إلى|و)\s*(\d+))?\s*\]/g;
const EN_HEADING = /\[(?:S[ūu]ra[ht]?|Chapter)\s[^\]\[]{1,70}?\(\s*\d+\s*\)\s*[:,]\s*(?:verses?|ayah?s?)[^\]\[]{1,30}\]/gi;
const NOTE_MARK = /«\s*(\d+)\s*»/g;

/* Objection and reply, in each language. */
const AR_TURN = /(فإن\s+قلت\s*:?)|((?<![ء-ي])قلت\s*:)/g;
const EN_TURN = /(\bIf you (?:say|ask|said|asked)\s*[:,])|(\bI (?:say|answer|said|reply)\s*[:,])/g;

const html = (raw) =>
  esc(tidy(raw))
    .replace(NOTE_MARK, (_, n) => `<span class="note-mark">«${n}»</span>`)
    .replace(/\n+/g, '<br>');

const facing = (en, ar) =>
  `<div class="zk-facing"><div class="zk-en" lang="en">${html(en)}</div><div class="zk-ar arabic" dir="rtl" lang="ar">${html(ar)}</div></div>`;

/** A page's text cut at the edition's verse headings: the text before the first, then one piece per heading. */
function cut(text, pattern) {
  const pieces = [{ head: null, text: '' }];
  let at = 0;
  for (const m of text.matchAll(pattern)) {
    pieces.at(-1).text = text.slice(at, m.index);
    const start = Number(m[1]);
    pieces.push({ head: Number.isFinite(start) ? { start, end: Math.max(start, Number(m[2] ?? start)) } : {}, text: '' });
    at = m.index + m[0].length;
  }
  pieces.at(-1).text = text.slice(at);
  return pieces;
}

/** The surah as passages: [{ start, end, parts: [{ seg, en, ar }] }]. */
function passagesOf(segments) {
  const passages = [];
  const open = (start, end) => passages.push({ start, end, parts: [] });
  const add = (seg, en, ar) => {
    if (!has(en) && !has(ar)) return;
    if (!passages.length) open(null, null);
    passages.at(-1).parts.push({ seg, en, ar });
  };
  for (const seg of segments) {
    const ar = cut(seg.text_arabic, AR_HEADING);
    const en = cut(seg.text_en, EN_HEADING);
    if (ar.length === en.length) {
      ar.forEach((piece, i) => {
        if (piece.head) open(piece.head.start, piece.head.end);
        add(seg, en[i].text, piece.text);
      });
      continue;
    }
    /* The English lost a heading: the page stays whole, under every verse its Arabic headings name. */
    const heads = ar.filter((p) => p.head).map((p) => p.head);
    if (heads.length) open(Math.min(...heads.map((h) => h.start)), Math.max(...heads.map((h) => h.end)));
    add(seg, seg.text_en.replace(EN_HEADING, ' '), seg.text_arabic.replace(AR_HEADING, ' '));
  }
  return passages.filter((p) => p.parts.length);
}

/** Where the quoted verses end: after the last of (start) … (end) found in order. */
function lemmaEnd(text, start, end) {
  const ends = [];
  let at = 0;
  for (let v = start; v <= end; v++) {
    const i = text.indexOf(`(${v})`, at);
    if (i < 0) break;
    at = i + String(v).length + 2;
    ends.push(at);
  }
  return ends;
}

/** A page's text as narrative and exchanges, or null when it has no clean objection and reply. */
function turns(text, pattern) {
  const marks = [...text.matchAll(pattern)].map((m) => ({ at: m.index, q: Boolean(m[1]) }));
  const out = [];
  for (let i = 0; i < marks.length; i++) {
    if (!marks[i].q) continue;
    const answer = marks[i + 1];
    if (!answer || answer.q) return null;
    const next = marks.slice(i + 2).find((m) => m.q);
    out.push({ q: marks[i].at, a: answer.at, end: next ? next.at : text.length });
  }
  return out;
}

function rowHtml(part, label) {
  const where = `Vol. ${label(part.seg.volume)}, p. ${part.seg.page}`;
  const folio = `<span class="zk-folio">${where}</span>`;
  const en = turns(part.en, EN_TURN);
  const ar = turns(part.ar, AR_TURN);
  if (!en || !ar || en.length !== ar.length || !en.length) {
    return { html: `<div class="zk-row">${folio}${facing(part.en, part.ar)}</div>`, exchanges: 0 };
  }
  let out = '';
  const lead = [part.en.slice(0, en[0].q), part.ar.slice(0, ar[0].q)];
  if (has(lead[0]) || has(lead[1])) out += `<div class="zk-row">${folio}${facing(...lead)}</div>`;
  en.forEach((turn, i) => {
    const other = ar[i];
    out +=
      `<div class="exchange zk-exchange">${i === 0 && !out ? folio : ''}` +
      `<div class="exchange__turn exchange__turn--question"><span class="exchange__label">Question</span>${facing(part.en.slice(turn.q, turn.a), part.ar.slice(other.q, other.a))}</div>` +
      `<div class="exchange__turn exchange__turn--answer"><span class="exchange__label">Answer</span>${facing(part.en.slice(turn.a, turn.end), part.ar.slice(other.a, other.end))}</div></div>`;
  });
  return { html: out, exchanges: en.length };
}

function notesHtml(parts, label) {
  const seen = new Set();
  const rows = [];
  for (const { seg } of parts) {
    if (seen.has(seg.serial) || (!has(seg.foot_note_en) && !has(seg.foot_note_arabic))) continue;
    seen.add(seg.serial);
    rows.push(
      `<div class="zk-note"><span class="zk-folio">Vol. ${label(seg.volume)}, p. ${seg.page}</span>` +
      facing(has(seg.foot_note_en) ? seg.foot_note_en : 'Translation in progress.', seg.foot_note_arabic ?? '') +
      `</div>`,
    );
  }
  if (!rows.length) return '';
  return `<details class="page-notes zk-notes"><summary>Editor’s notes on ${rows.length === 1 ? 'this page' : `these ${rows.length} pages`}</summary>${rows.join('')}</details>`;
}

function buildSurah(record, volumeLabels) {
  const n = record.surah.number;
  const label = (v) => volumeLabels[Number(v) - 1] ?? v;
  const segments = record.segments.filter((s) => has(s.text_en) && has(s.text_arabic));
  const passages = passagesOf(segments);
  const covered = new Set();
  let exchanges = 0;
  const body = passages.map((p, i) => {
    const k = i + 1;
    const opening = p.start === null;
    const verses = [];
    if (!opening) for (let v = p.start; v <= p.end; v++) verses.push(v);
    verses.forEach((v) => covered.add(v));
    const title = opening ? 'Opening of the surah' : p.start === p.end ? `Verse ${p.start}` : `Verses ${p.start} to ${p.end}`;
    const first = p.parts[0].seg;
    const last = p.parts.at(-1).seg;
    const pages = first.serial === last.serial
      ? `Vol. ${label(first.volume)}, p. ${first.page}`
      : first.volume === last.volume
        ? `Vol. ${label(first.volume)}, pp. ${first.page}–${last.page}`
        : `Vol. ${label(first.volume)}, p. ${first.page} to vol. ${label(last.volume)}, p. ${last.page}`;
    const ref = opening ? 'Before the first verse' : `Q ${n}:${p.start}${p.end > p.start ? `–${p.end}` : ''}`;

    /* The quoted verses come off the front of the passage's first page. */
    let lemma = '';
    const parts = p.parts.map((part) => ({ ...part }));
    if (!opening) {
      const en = lemmaEnd(parts[0].en, p.start, p.end);
      const ar = lemmaEnd(parts[0].ar, p.start, p.end);
      const shared = Math.min(en.length, ar.length);
      if (shared > 0) {
        lemma =
          `<div class="zk-lemma"><span class="speaker-label">The ${p.end > p.start ? 'verses' : 'verse'} as the commentary quotes ${p.end > p.start ? 'them' : 'it'}</span>` +
          `${facing(parts[0].en.slice(0, en[shared - 1]), parts[0].ar.slice(0, ar[shared - 1]))}</div>`;
        parts[0].en = parts[0].en.slice(en[shared - 1]);
        parts[0].ar = parts[0].ar.slice(ar[shared - 1]);
      }
    }
    const rows = parts.filter((part) => has(part.en) || has(part.ar)).map((part) => rowHtml(part, label));
    exchanges += rows.reduce((sum, r) => sum + r.exchanges, 0);
    return (
      `<section aria-labelledby="chapter-${k}-title" class="chapter zk-passage" id="chapter-${k}"${verses.length ? ` data-verses="${verses.join(' ')}"` : ' data-opening=""'}>` +
      `<header class="chapter__heading"><span class="chapter__number">${pad(k)}</span><div><span class="section-label">${ref} · ${pages}</span><h2 id="chapter-${k}-title">${title}</h2></div></header>\n` +
      `<div class="chapter__content">${lemma}\n${rows.map((r) => r.html).join('\n')}\n${notesHtml(p.parts, label)}</div></section>`
    );
  }).join('\n');
  const first = segments[0];
  const last = segments.at(-1);
  const info = sura.get(n);
  return {
    html: `<!-- Generated by scripts/tafsir/build-tafsir-zamakhshari.mjs from the supplied al-Kashshāf translation (surah ${n}). Safe to edit by hand; regeneration needs --overwrite. -->\n${body}\n`,
    part: {
      slug: String(n),
      surah: n,
      title: info.latin,
      ar: info.ar,
      verseCount: info.verses,
      sourceHeading: null,
      entries: segments.length,
      passages: passages.length,
      exchanges,
      enWords: segments.reduce((sum, s) => sum + words(s.text_en), 0),
      arWords: segments.reduce((sum, s) => sum + words(s.text_arabic), 0),
      firstPage: `Vol. ${label(first.volume)}, p. ${first.page}`,
      lastPage: `Vol. ${label(last.volume)}, p. ${last.page}`,
      firstReport: null,
      lastReport: null,
      verses: [...covered].filter((v) => v <= info.verses).length,
      jumps: [],
      status: record.translation_status,
      coverageNote: record.translation_status === 'complete' ? null : record.coverage_note,
    },
  };
}

/* How much Arabic there is: every surah file in the export, by printed page. */
function arabicTotals() {
  const perSurah = new Map();
  for (const dir of [arabicDir, join(arabicDir, 'arabic')]) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => /^\d{3}_.*\.json$/.test(f))) {
      const record = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      if (record.surah?.number && Array.isArray(record.segments)) perSurah.set(record.surah.number, record.segments.length);
    }
  }
  return perSurah;
}

const source = JSON.parse(readFileSync(resolve(sourcePath), 'utf8'));
const totals = arabicTotals();
if (totals.size !== 114) throw new Error(`Expected 114 Arabic surah files under ${arabicDir}, found ${totals.size}.`);
mkdirSync(outDir, { recursive: true });

let written = 0;
let kept = 0;
const parts = [];
for (const record of source.surahs) {
  const { html: page, part } = buildSurah(record, source.source.volume_labels ?? []);
  const target = join(outDir, `${part.slug}.html`);
  if (existsSync(target) && !overwrite) kept++;
  else {
    writeFileSync(target, page);
    written++;
  }
  parts.push({ ...part, sourcePages: totals.get(part.surah) });
}
parts.sort((a, b) => a.surah - b.surah);
const translated = new Set(parts.map((p) => p.surah));
const index = {
  id: 'zamakhshari',
  unit: 'page',
  numbered: false,
  grouping: 'surah',
  title: source.source.book_title,
  edition: { source_url: source.source.shamela_url, editor: source.source.editor, publisher: source.source.publisher },
  translationNote: source.translation_note,
  sourceTotals: {
    surahs: totals.size,
    pages: [...totals.values()].reduce((sum, n) => sum + n, 0),
  },
  translated: {
    surahs: parts.length,
    pages: parts.reduce((sum, p) => sum + p.entries, 0),
  },
  untranslated: [...totals.keys()].filter((n) => !translated.has(n)).sort((a, b) => a - b),
  parts,
};
writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(index, null, 1)}\n`);
process.stdout.write(
  `zamakhshari: ${parts.length} surahs, ${index.translated.pages} of ${index.sourceTotals.pages} printed pages in English, ` +
  `${parts.reduce((sum, p) => sum + p.passages, 0)} passages, ${parts.reduce((sum, p) => sum + p.exchanges, 0)} exchanges. ` +
  `Wrote ${written} pages${kept ? `; kept ${kept} existing (use --overwrite to replace)` : ''}.\n`,
);
