#!/usr/bin/env node
/*
 * Converts the English translations of the shorter 3rd and 4th century works into one reader source per
 * collection (src/data/hadith/pages/<slug>/publication-source.json), which
 * scripts/hadith/build-abu-hanifa-mubarak-pages.mjs then renders.
 *
 * The translation files hold English only, keyed by the serial number of each Shamela page record. The Arabic
 * comes from the matching page-record export ("parquet 6/<century>/<book id>_*.json"). Wording is copied as
 * supplied in both languages; the only things moved are a report's printed number (to its label) and a
 * heading printed on the same line as a report (to the heading).
 *
 * Each work keeps its own shape:
 *   chapters  a topical book whose chapters (bāb) become the reader's chapters
 *   inline    a short work read on one page, with its own headings standing between the reports
 *   flat      a fascicle or notebook with no divisions, read as one undivided text
 *
 * Usage: node scripts/hadith/convert-translated-treatises.mjs "<translations dir>" "<parquet 6 dir>" [slug ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { splitArabic } from './lib/isnad-split.mjs';
import { TREATISES } from './lib/translated-treatises.mjs';

const [translationDir, arabicDir, ...only] = process.argv.slice(2);
if (!translationDir || !arabicDir) throw new Error('Pass the translations directory and the "parquet 6" directory.');
const outRoot = path.resolve('src/data/hadith/pages');

const tidy = value => String(value ?? '').replace(/[‌‏]/g, '').replace(/\s+/g, ' ').trim();
const blank = value => value == null || value === 'None' || value === '';
const MARKER = /(?:^|\s)(\d{1,4})\s?-\s?/g;
const SHARED = 'Several reports share this source record; they are shown together, as the source prints them.';
const UNDIVIDED = 'The Arabic of this report is shown undivided.';

function findArabic(bookId) {
  for (const century of fs.readdirSync(arabicDir)) {
    for (const folder of [path.join(arabicDir, century), path.join(arabicDir, century, 'Done')]) {
      if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) continue;
      const file = fs.readdirSync(folder).find(name => name.startsWith(`${bookId}_`) && name.endsWith('.json'));
      if (file) return JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8'));
    }
  }
  throw new Error(`No Arabic page-record file for Shamela book ${bookId}.`);
}

/** Reads the Markdown translation of al-Dūrī's fascicle into the record shape of the JSON translations. */
function recordsFromMarkdown(file, arabic) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const headings = [];
  const entries = [];
  for (const line of lines) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading) { headings.push({ text: heading[1].trim(), at: entries.length }); continue; }
    const entry = line.match(/^\*\*(\\\[)?([0-9]+[a-z]?)(\\\])?\*\*\s*·\s*(.*)$/);
    if (!entry) continue;
    const body = entry[4].replace(/\\([[\]])/g, '$1');
    const chainAt = body.indexOf('*Chain:*');
    const reportAt = body.indexOf('*Report:*');
    // A few entries are asides with no marked chain: the text follows the page and reference directly.
    const plain = reportAt < 0 ? body.match(/^(p\.\s*[\d–-]+\s*(?:·\s*(?:\d+:[\d–]+|unnumbered in the source|a grammatical aside)\s*)?)([\s\S]+)$/) : null;
    if (reportAt < 0 && !plain) throw new Error(`Entry ${entry[2]} has no report text.`);
    const lead = plain ? plain[1] : body.slice(0, chainAt >= 0 ? chainAt : reportAt);
    const isnad = !plain && chainAt >= 0 ? body.slice(chainAt + 8, reportAt).trim() : '';
    entries.push({
      label: entry[2], printed: !entry[1], page: lead.match(/p\.\s*(\d+)/)?.[1] ?? null,
      reference: lead.split('·').slice(1).map(part => part.trim()).filter(part => part && !/^unnumbered/i.test(part)).join(' · '),
      isnad, matn: plain ? plain[2].trim() : body.slice(reportAt + 9).trim(),
      narrators: isnad ? isnad.replace(/\.$/, '').split('→').map(name => name.replace(/\s+told (?:me|us)$/i, '').trim()).filter(Boolean) : [],
    });
  }
  const pages = arabic.pages;
  const isHeadingPage = page => !blank(page.page_number) && !/\d\s?-\s/.test(page.text) && tidy(page.text).length < 90 && /سور[ةه]|ام الكتاب/.test(page.text.replace(/[ً-ْٰ]/g, '').replace(/[أإآ]/g, 'ا'));
  const records = [];
  let cursor = 0;
  let headingIndex = 0;
  const pageHolding = label => pages.findIndex((page, index) => index >= cursor && new RegExp(`(?:^|\\s)${label}\\s?-\\s`).test(page.text));
  entries.forEach((entry, index) => {
    while (headingIndex < headings.length && headings[headingIndex].at === index) {
      const at = pages.findIndex((page, pageIndex) => pageIndex >= cursor && isHeadingPage(page));
      if (at < 0) throw new Error(`No Arabic heading page for "${headings[headingIndex].text}".`);
      records.push({ serial_number: pages[at].serial_number, page: pages[at].page_number, type: 'heading', text: headings[headingIndex].text });
      cursor = at + 1;
      headingIndex += 1;
    }
    let at = entry.printed ? pageHolding(entry.label) : -1;
    if (at < 0) {
      // An unnumbered report stands on its own page record when one with its printed page follows; otherwise it shares the previous record.
      const own = pages.findIndex((page, pageIndex) => pageIndex >= cursor && page.page_number === entry.page && !isHeadingPage(page) && !/(?:^|\s)\d{1,4}\s?-\s/.test(page.text));
      at = own >= 0 && own - cursor < 3 ? own : cursor - 1;
    }
    const narration = { no: entry.printed ? entry.label : null, isnad: entry.isnad, matn: entry.matn, narrators: entry.narrators, ...(entry.reference ? { reference: entry.reference } : {}), ...(entry.printed ? {} : { note: `Unnumbered in the printed text; the translation counts it as ${entry.label}.` }) };
    const last = records.at(-1);
    if (last?.type === 'narrations' && last.serial_number === pages[at].serial_number) last.narrations.push(narration);
    else records.push({ serial_number: pages[at].serial_number, page: pages[at].page_number, type: 'narrations', narrations: [narration] });
    cursor = Math.max(cursor, at + 1);
  });
  return records;
}

function loadWork(spec) {
  const arabic = findArabic(spec.bookId);
  const file = fs.readdirSync(translationDir).find(name => name.startsWith(spec.file));
  if (!file) throw new Error(`No translation file starts with ${spec.file}`);
  const full = path.join(translationDir, file);
  if (file.endsWith('.md')) return { arabic, book: { edition: spec.edition, editor: spec.editor }, records: recordsFromMarkdown(full, arabic) };
  const translation = JSON.parse(fs.readFileSync(full, 'utf8'));
  return { arabic, book: translation.book, records: translation.records };
}

/** The Arabic of one page record, cut at the printed numbers of the reports the translation lists for it. */
function arabicSegments(text, narrations, hasHeading) {
  const source = String(text ?? '');
  const markers = [...source.matchAll(MARKER)].map(match => ({ number: match[1], start: match.index + (/^\s/.test(match[0]) ? 1 : 0), end: match.index + match[0].length }));
  let lead = '';
  let from = 0;
  const starts = [];
  let cursor = 0;
  for (const [index, narration] of narrations.entries()) {
    const marker = blank(narration.no) ? null : markers.find(item => item.start >= cursor && item.number === String(narration.no).replace(/\D/g, ''));
    if (marker) { starts.push(marker); cursor = marker.end; } else if (index === 0) starts.push(null); else return null;
  }
  if (starts[0]) { lead = source.slice(0, starts[0].start); from = starts[0].end; }
  if (tidy(lead) && !hasHeading && tidy(lead).length > 0) { lead = ''; from = 0; if (narrations.length > 1) return null; }
  const pieces = starts.map((marker, index) => {
    const begin = index === 0 ? from : marker.end;
    const end = starts[index + 1] ? starts[index + 1].start : source.length;
    return source.slice(begin, end).trim().replace(/^[-:.\s]+/, '');
  });
  return pieces.every(Boolean) ? { lead: lead.trim(), pieces } : null;
}

const PAGE_MARK = /\s*⦗ص: ?\d+⦘\s*/g;

/**
 * Divides the Arabic where its chain ends. Page markers are set aside while the chain is read, then kept in place.
 * A division is accepted only when the chain takes a share of the Arabic close to the share it takes of the
 * English, so the two columns break at the same point; otherwise the Arabic is shown whole.
 */
function splitIsnad(arabic, english) {
  if (!tidy(english.isnad)) return { isnad: '', matn: arabic };
  const map = [];
  let clean = '';
  let last = 0;
  for (const match of arabic.matchAll(PAGE_MARK)) {
    for (let i = last; i < match.index; i += 1) { map.push(i); clean += arabic[i]; }
    map.push(match.index); clean += ' ';
    last = match.index + match[0].length;
  }
  for (let i = last; i < arabic.length; i += 1) { map.push(i); clean += arabic[i]; }
  const share = english.isnad.length / (english.isnad.length + english.matn.length);
  const split = splitArabic(clean);
  const cuts = [
    ...(split ? [clean.length - split.matn.length] : []),
    ...[...clean.matchAll(/[«"{]/g)].map(match => match.index),
  ].filter(cut => cut > 12 && clean.length - cut > 8 && Math.abs(cut / clean.length - share) < 0.3);
  if (!cuts.length) return null;
  const at = map[cuts[0]];
  const isnad = arabic.slice(0, at).trimEnd();
  const matn = arabic.slice(at).trimStart();
  return isnad && matn ? { isnad, matn } : null;
}

/** A heading printed on the line of its first report: the heading, and any words after it that belong to the report. */
function splitLead(lead) {
  const text = tidy(lead);
  const stop = text.indexOf(' .');
  if (stop > 0) return { heading: text.slice(0, stop).trim(), rest: text.slice(stop + 2).trim() };
  if (text.startsWith('[') && text.includes(']')) return { heading: text.slice(0, text.indexOf(']') + 1), rest: text.slice(text.indexOf(']') + 1).trim() };
  return { heading: text, rest: '' };
}

function convert(spec) {
  const { arabic, book, records } = loadWork(spec);
  const bySerial = new Map(arabic.pages.map(page => [page.serial_number, page]));
  const groups = [];
  let pending = [];
  let sequence = 0;
  const stats = { merged: 0, undivided: 0 };
  const open = (title_en, title_ar) => { groups.push({ title_en, title_ar, frames_before: [], frames_after: [], records: [] }); return groups.at(-1); };
  const current = () => groups.at(-1) ?? open(spec.mode === 'chapters' ? spec.openingTitle ?? 'Opening' : spec.bodyTitle ?? 'The text', '');
  const heading = (en, ar, page) => {
    const item = { kind: 'heading', en: tidy(en), ar: tidy(ar).replace(/^-?\d{1,4}\s?-\s*/, ''), page };
    if (spec.mode === 'chapters') open(item.en, item.ar);
    else if (spec.mode === 'inline') pending.push(item);
    else current().frames_before.push({ title_en: 'Heading', page, en: item.en, ar: item.ar, footnotes: [] });
  };
  const frame = (title_en, en, ar, page) => {
    const item = { kind: 'frame', title_en, en: tidy(en), ar: tidy(ar), page };
    if (!groups.length || !current().records.length) (groups.length ? current() : open(spec.mode === 'chapters' ? spec.openingTitle ?? 'Opening' : spec.bodyTitle ?? 'The text', '')).frames_before.push({ ...item, footnotes: [] });
    else pending.push(item);
  };
  const push = record => {
    sequence += 1;
    const group = current();
    group.records.push({ id: `${groups.length}.${sequence}`, ...record, ...(pending.length ? { lead: pending } : {}) });
    pending = [];
  };

  let openFrame = null;
  for (const record of records) {
    const page = bySerial.get(record.serial_number);
    if (!page) throw new Error(`${spec.slug}: no Arabic page record ${record.serial_number}.`);
    const printed = blank(record.page) ? null : String(record.page);
    if (record.type !== 'transmission_frame' && openFrame) { frame('Transmission of the copy', openFrame.en.join(' '), openFrame.ar.join(' '), openFrame.page); openFrame = null; }
    if (record.type === 'metadata') continue;
    if (record.type === 'transmission_frame') {
      openFrame ??= { en: [], ar: [], page: printed };
      openFrame.en.push(record.text); openFrame.ar.push(page.text);
      continue;
    }
    if (record.type === 'introduction') { frame('Title page, transmission of the work and preface', record.text_translation ?? record.text, page.text, printed); continue; }
    if (record.type === 'heading') {
      if (spec.titlePage?.(record)) { frame('Title page and transmission of the copy', record.text, page.text, printed); continue; }
      if (record.preamble) {
        const cut = page.text.search(/[‌\s]*بَابُ|[‌\s]*بَابٌ|[‌\s]*باب/);
        const arabicHeading = cut > 0 ? page.text.slice(cut) : page.text;
        heading(record.text, arabicHeading, printed);
        current().frames_before.push({ title_en: 'Opening of the book', page: printed, en: tidy(record.preamble), ar: tidy(cut > 0 ? page.text.slice(0, cut) : ''), footnotes: [] });
      } else heading(record.text, page.text, printed);
      continue;
    }
    if (record.type !== 'narrations') throw new Error(`${spec.slug}: unknown record type ${record.type}.`);
    const before = record.heading ?? record.heading_before ?? null;
    const frameText = record.transmission_frame?.text ?? null;
    const cut = arabicSegments(page.text, record.narrations, Boolean(before || frameText));
    const leadParts = before && !frameText && cut ? splitLead(cut.lead) : null;
    if (leadParts?.rest) cut.pieces[0] = `${leadParts.rest} ${cut.pieces[0]}`;
    if (before) heading(before, leadParts?.heading ?? '', printed);
    if (frameText) frame('Transmission of the copy', frameText, cut?.lead ?? '', printed);
    const notesOf = narration => [narration.note, narration.reference ? `Reading discussed: ${narration.reference}.` : null].filter(Boolean);
    if (!cut) {
      stats.merged += record.narrations.length > 1 ? 1 : 0;
      const numbers = record.narrations.map(narration => narration.no).filter(value => !blank(value));
      const english = record.narrations.map(narration => [!blank(narration.no) && record.narrations.length > 1 ? `[${narration.no}]` : '', narration.isnad, narration.matn].filter(Boolean).join(' ')).join(' ');
      push({
        source_id: record.serial_number, display_number: numbers.length ? (numbers.length > 1 && numbers[0] !== numbers.at(-1) ? `${numbers[0]}-${numbers.at(-1)}` : String(numbers[0])) : '—',
        ...(numbers.length ? {} : { noun: 'Unnumbered report' }), page: printed,
        text_ar: page.text.replace(/^\s*\d{1,4}\s?-\s?/, '').trim(), text_en: english, no_split: true, no_isnad_reason: SHARED,
        chains: [], translator_notes: record.narrations.flatMap(notesOf),
      });
    } else {
      record.narrations.forEach((narration, index) => {
        const arabicText = cut.pieces[index];
        const split = splitIsnad(arabicText, { isnad: tidy(narration.isnad), matn: tidy(narration.matn) });
        if (!split) stats.undivided += 1;
        push({
          source_id: record.serial_number, display_number: blank(narration.no) ? '—' : String(narration.no),
          ...(blank(narration.no) ? { noun: 'Unnumbered report' } : {}), page: printed,
          isnad_ar: split?.isnad ?? '', matn_ar: split?.matn ?? arabicText,
          isnad_en: tidy(narration.isnad), matn_en: tidy(narration.matn),
          ...(split ? {} : { no_isnad_reason: UNDIVIDED }),
          chains: (narration.narrators ?? []).length ? [{ narrators: narration.narrators.map(name => ({ en: name, ar: '' })), direction: 'as_written_later_to_earlier' }] : [],
          translator_notes: notesOf(narration),
        });
      });
    }
    if (record.heading_after) heading(record.heading_after, '', printed);
  }
  if (pending.length) throw new Error(`${spec.slug}: a heading or frame has no report after it.`);
  const reading = groups.filter(group => group.records.length || group.frames_before.length);
  // A heading with no report of its own (a division title) passes its frames to the chapter that follows.
  const kept = [];
  let carried = [];
  for (const group of reading) {
    if (!group.records.length) { carried.push({ title_en: 'Division heading', page: null, en: group.title_en, ar: group.title_ar, footnotes: [] }, ...group.frames_before); continue; }
    group.frames_before.unshift(...carried); carried = [];
    kept.push(group);
  }
  if (carried.length) kept.at(-1).frames_after.push(...carried);
  kept.forEach((group, index) => { group.number = index + 1; group.records.forEach(record => { record.id = `${index + 1}.${record.id.split('.')[1]}`; }); });

  const count = kept.reduce((sum, group) => sum + group.records.length, 0);
  const edition = spec.edition ?? book.edition ?? '';
  const editor = spec.editor ?? (blank(book.editor) ? '' : book.editor);
  const notes = [
    { label: 'Edition', text: edition },
    { label: 'Editor', text: editor },
    { label: 'Kind of work', text: spec.kind },
    { label: 'Structure', text: spec.structure },
    { label: 'English translation', text: 'The English is the supplied translation, which follows the source record by record. Notes that the translation attaches to a report appear beneath it, apart from the Arabic and English text.' },
    { label: 'Arabic text', text: 'The Arabic is the text of the source page records, shown as supplied. A report’s printed number stands in its label instead of the text, and page markers are carried over from the source.' },
    { label: 'Isnad and matn', text: 'The English chain and words are divided as the translation gives them. The Arabic is divided at the same point by a fixed rule that does not alter the text; where the rule finds no clean division, the Arabic is shown whole.' },
    { label: 'Transmitters', text: 'Transmission paths list the names the translation gives for each chain, in English only. No transmitter is identified beyond the wording of the source.' },
    ...(spec.completeness ? [{ label: 'Completeness', text: spec.completeness }] : []),
    { label: 'Dating', text: `The date shown is the death year of ${spec.dateOf ?? spec.compiler}, ${spec.death} AH, not a verified date of composition.` },
    { label: 'Coverage', text: `${count} entries in ${kept.length} ${kept.length === 1 ? 'section' : 'sections'}, in the source order.` },
  ].filter(note => note.text);
  return {
    stats,
    payload: {
      schema_version: 'hadithcritic.reader-source/1.0',
      compilation: {
        id: spec.slug, title_en: spec.title_en, title_ar: spec.title_ar ?? arabic.book_title_original, short_name: spec.short, shamela_book_id: spec.bookId,
        author: { name_en: spec.compiler, death_ah: String(spec.death) }, edition, unit_label: 'Sections', kind_en: spec.kind, description_en: spec.blurb, unit_noun: spec.unit ?? 'Narration',
      },
      notes, groups: kept, books: [],
    },
  };
}

for (const spec of TREATISES.filter(item => !only.length || only.includes(item.slug))) {
  const { payload, stats } = convert(spec);
  const target = path.join(outRoot, spec.slug);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'publication-source.json'), `${JSON.stringify(payload, null, 1)}\n`, 'utf8');
  const records = payload.groups.reduce((sum, group) => sum + group.records.length, 0);
  console.log(`${spec.slug}: ${payload.groups.length} groups, ${records} records (${stats.merged} shared source records, ${stats.undivided} with undivided Arabic)`);
}
