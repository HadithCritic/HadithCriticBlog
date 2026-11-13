/* Cuts the page records of Taqrīb al-Tahdhīb into a single run of items:
   numbered biographies, unnumbered cross-references ("[]" in this edition)
   and headings (sections, letters, name groups). Pages are joined first
   because 657 biographies run across a page break. */
import { fold, squash } from './arabic.mjs';
import { LETTERS, SECTIONS } from './vocab.mjs';

const MARKS = /[ً-ْٰـ​-‏‪-‮﻿]/;

/* Plain text plus, for every kept character, its offset in the source. */
const plainWithMap = (raw) => {
  const out = [];
  const map = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (!MARKS.test(raw[i])) {
      out.push(raw[i]);
      map.push(i);
    }
  }
  map.push(raw.length);
  return { text: out.join(''), map };
};

const tidyPage = (text) => squash(String(text ?? '')
  .replace(/‌/g, '')
  .replace(/ب\s+ا\s+ب(?=\s)/g, 'باب'));

const firstEntryRecord = (records) => records.findIndex((r) => /(^|\s)1- /.test(r.text ?? ''));

/* Joins the body pages into one string and remembers where each page
   starts. The colophon after "آخر الكتاب" is set aside. */
export const joinPages = (records) => {
  const start = firstEntryRecord(records);
  if (start < 0) throw new Error('No record contains entry 1; is this the Taqrīb export?');
  const pages = [];
  let raw = '';
  for (const record of records.slice(start)) {
    const offset = raw.length ? raw.length + 1 : 0;
    raw = raw ? `${raw} ${tidyPage(record.text)}` : tidyPage(record.text);
    pages.push({ offset, page: Number(record.page_number) || null, serial: record.serial_number });
  }
  const end = raw.lastIndexOf('آخر الكتاب');
  const colophon = end > 0 ? raw.slice(end) : null;
  return {
    intro: records.slice(0, start),
    raw: end > 0 ? raw.slice(0, end) : raw,
    pages,
    colophon,
  };
};

const pageIndexAt = (pages, offset) => {
  let lo = 0;
  let hi = pages.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (pages[mid].offset <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

const LETTER_RE = new RegExp(
  `حرف (${LETTERS.map(fold).join('|')})( (المهملة|المعجمة|الموحدة|المثناة|المثلثة|الاخيرة|التحتانية|الفوقانية))?`,
  'g',
);

const MARKERS = [
  { kind: 'entry', re: /(?<![\d[])(\d{1,4})- /g },
  { kind: 'xref', re: /\[\]/g },
  { kind: 'letter', re: LETTER_RE },
  { kind: 'group', re: /ذكر من اسمه/g },
  { kind: 'end_of_men', re: /اخر كتاب الرجال/g },
  { kind: 'subhead', re: /(الكني|الانساب) من الالقاب/g },
  ...SECTIONS.filter((s) => s.opens).map((s) => ({
    kind: 'section', section: s.id, re: new RegExp(s.opens.source, 'g'),
  })),
];

const findMarkers = (key) => {
  const found = [];
  for (const marker of MARKERS) {
    for (const m of key.matchAll(marker.re)) {
      found.push({ ...marker, at: m.index, length: m[0].length, no: marker.kind === 'entry' ? Number(m[1]) : null });
    }
  }
  found.sort((a, b) => a.at - b.at || b.length - a.length);
  /* Keep the longest match at a position and nothing that starts inside it. */
  const kept = [];
  for (const m of found) {
    const prev = kept.at(-1);
    if (!prev || m.at >= prev.at + prev.length) kept.push(m);
  }
  return kept;
};

/* Sections only move forward, so a section name quoted inside a biography
   cannot reopen an earlier one; such a match stays part of the text. */
const forwardOnly = (markers) => {
  const order = SECTIONS.map((s) => s.id);
  let current = 0;
  return markers.filter((m) => {
    if (m.kind !== 'section') return true;
    const next = order.indexOf(m.section);
    if (next <= current) return false;
    current = next;
    return true;
  });
};

/* Walks the markers in order, keeping the current section, letter and
   name group, and returns one item per marker. */
export const segment = (records) => {
  const book = joinPages(records);
  const { text, map } = plainWithMap(book.raw);
  const markers = forwardOnly(findMarkers(fold(text)));
  const state = { section: SECTIONS[0].id, letter: null, group: null };
  const items = [];

  markers.forEach((marker, i) => {
    const bodyStart = marker.kind === 'entry' || marker.kind === 'xref' ? marker.at + marker.length : marker.at;
    const end = i + 1 < markers.length ? markers[i + 1].at : text.length;
    if (marker.kind === 'section') {
      state.section = marker.section;
      state.letter = null;
      state.group = null;
    }
    const plainText = squash(text.slice(bodyStart, end));
    if (marker.kind === 'letter') {
      state.letter = squash(text.slice(marker.at, marker.at + marker.length));
      state.group = null;
    }
    if (marker.kind === 'group') state.group = plainText;
    const rawStart = map[marker.at];
    const rawEnd = map[end];
    const first = pageIndexAt(book.pages, rawStart);
    const last = pageIndexAt(book.pages, Math.max(rawStart, rawEnd - 1));
    items.push({
      kind: marker.kind,
      no: marker.no,
      section: state.section,
      letter: state.letter,
      group: state.group,
      raw: squash(book.raw.slice(map[bodyStart], rawEnd)),
      text: plainText,
      key: fold(plainText),
      pages: { start: book.pages[first].page, end: book.pages[last].page },
      serials: book.pages.slice(first, last + 1).map((p) => p.serial),
    });
  });

  return { items, intro: book.intro, colophon: book.colophon };
};
