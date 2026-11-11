/* Reads one surah record of the English al-Tabari collection, in whichever of
   its four shapes, into one form:

     units  [{ id, kind, start, end, items, edition, translatorNotes }]
            kind: intro | ayah | lemma | sub_lemma; start/end: the verses it
            treats (null for the surah introduction); items: the stream the
            classifier reads; edition: where the text sits in print.
     notes  the editor's footnotes, each { unit, start, end, volume, page, n, en, ar }
     ayahIndex  verse -> unit ids, from the record when it has one

   Shapes (named after the batches the collection was assembled from):
     A  translation.layout "ayah": one English block per verse (Al Sadiqin)
     B  translation.ayah_blocks: English per verse with PDF line wraps (Al Sadiqin 0.2)
     C  translation.units[].blocks: lemma units of page segments or typed blocks
     D  units[].segments[].text_en: lemma units of page segments

   Footnote markers in the text, "(3)" in C and D segments and "[Fn 3]" in
   C's typed blocks, are linked to their notes here, while the page each
   segment came from is still known. */

import { NOTE_CLOSE, NOTE_MID, NOTE_OPEN, tidy } from './text.mjs';

export function shapeOf(record) {
  const t = record.translation;
  if (t?.layout === 'ayah') return 'A';
  if (t?.ayah_blocks) return 'B';
  if (t?.units?.[0]?.blocks) return 'C';
  if (record.units?.[0]?.segments) return 'D';
  return null;
}

const stripNumber = (s) => String(s ?? '').replace(/^\s*\d+\s*[.\-–]\s*/, '').trim();

export function normalize(record) {
  const shape = shapeOf(record);
  if (!shape) throw new Error(`Unrecognized record shape (keys: ${Object.keys(record).join(', ')})`);
  const meta = record.surah ?? record;
  const t = record.translation;
  const footnotes = t.editor_footnotes ?? [];

  const notes = footnotes.map((f) => ({
    unit: f.unit ?? null,
    start: f.ayah_start ?? null,
    end: f.ayah_end ?? null,
    volume: String(f.volume ?? ''),
    page: f.page ?? null,
    n: f.printed_note_number ?? f.page_note_index ?? null,
    en: tidy(stripNumber(f.text_en), { keepNewlines: false }),
    ar: stripNumber(f.text_ar),
  }));
  const byPage = new Map(footnotes.map((f, i) => [`${f.volume}|${f.page}|${f.page_note_index}`, i]));
  const stats = { markersLinked: 0, markersAbsent: 0, markersUnmatched: 0 };

  const units = [];
  if (shape === 'A') {
    for (const u of t.units) {
      units.push({
        id: u.ayah, kind: 'ayah', start: u.ayah, end: u.ayah,
        items: [{ kind: 'text', text: tidy(u.text_en, { keepNewlines: false }) }],
        edition: { print: 'en', volumes: u.source?.volumes ?? [], pages: u.source?.pdf_pages ?? [] },
      });
    }
  } else if (shape === 'B') {
    if (t.introduction?.text_en) {
      units.push({ id: 'intro', kind: 'intro', start: null, end: null, items: [{ kind: 'text', text: tidy(t.introduction.text_en, { keepNewlines: false }) }], edition: { print: 'en', volumes: [], pages: [] } });
    }
    t.ayah_blocks.forEach((b, i) => {
      // Two batches: { ayah_start, ayah_end, source_volumes } and { ayah, source: { volume, pdf_pages } }.
      const start = b.ayah_start ?? b.ayah;
      units.push({
        id: i, kind: 'ayah', start, end: b.ayah_end ?? start,
        // Line breaks here are the PDF's line wraps, not paragraphs.
        items: [{ kind: 'text', text: tidy(b.text_en, { keepNewlines: false }) }],
        edition: { print: 'en', volumes: b.source_volumes ?? (b.source?.volume ? [b.source.volume] : []), pages: b.source?.pdf_pages ?? [] },
      });
    });
  } else {
    const list = shape === 'C' ? t.units : record.units;
    for (const u of list) {
      const items = [];
      const pages = [];
      const translatorNotes = [];
      let text = '';
      const flushText = () => {
        if (text.trim()) items.push({ kind: 'text', text: tidy(text) });
        text = '';
      };
      const parts = shape === 'C' ? u.blocks : u.segments;
      for (const part of parts) {
        const type = part.type ?? 'segment';
        if (part.volume && part.page) pages.push({ v: String(part.volume), p: part.page });
        if (part.translator_note) translatorNotes.push(tidy(part.translator_note, { keepNewlines: false }));
        const link = (s) => linkMarkers(s, part, u.unit, footnotes, byPage, stats);
        if (type === 'segment') {
          // Page segments run on into each other; paragraphs are the newlines inside them.
          text += (text && !/\n$/.test(text) ? ' ' : '') + link(part.text_en ?? '');
        } else if (type === 'paragraph') {
          text += `${text ? '\n' : ''}${link(part.text_en ?? '')}\n`;
        } else {
          flushText();
          if (type === 'marker') items.push({ kind: 'marker', text: tidy(link(part.text_en ?? '')) });
          else if (type === 'report') {
            items.push({
              kind: 'report',
              isnad: tidy(link(part.isnad_en ?? ''), { keepNewlines: false }),
              matn: tidy(link(part.matn_en ?? ''), { keepNewlines: false }),
              via: part.narrators?.length ? part.narrators[part.narrators.length - 1] : null,
            });
          } else if (type === 'quote') items.push({ kind: 'poem', lines: (part.lines_en ?? []).map((l) => tidy(link(l), { keepNewlines: false })) });
          else if (type === 'list') items.push({ kind: 'text', text: (part.items_en ?? []).map((l) => tidy(link(l), { keepNewlines: false })).join('\n') });
          else items.push({ kind: 'text', text: tidy(link(part.text_en ?? '')) });
        }
      }
      flushText();
      const intro = u.type === 'surah_introduction' || u.ayah_start == null;
      units.push({
        id: u.unit, kind: intro ? 'intro' : u.type ?? 'lemma', start: intro ? null : u.ayah_start, end: intro ? null : u.ayah_end ?? u.ayah_start,
        items, edition: { print: 'ar', pages: dedupePages(pages) }, translatorNotes,
      });
    }
  }

  // Some records carry an empty index; the passages' own ranges are used then.
  const index = shape === 'C' ? t.ayah_index : shape === 'D' ? record.ayah_index : null;
  const ayahIndex = index && Object.keys(index).length ? index : null;
  const withoutUnit = (shape === 'C' ? t.ayahs_without_unit : shape === 'D' ? record.ayahs_without_unit : null) ?? [];
  return { shape, number: meta.number, ayahCount: meta.ayah_count, units, notes, ayahIndex, withoutUnit, translation: attribution(record, shape), stats };
}

function dedupePages(pages) {
  const seen = new Set();
  return pages.filter((p) => !seen.has(`${p.v}|${p.p}`) && seen.add(`${p.v}|${p.p}`));
}

/* Replaces a footnote marker with a sentinel naming its note. "(3)" inside
   {braces} is a verse number, not a marker, so it is left alone. */
function linkMarkers(text, part, unit, footnotes, byPage, stats) {
  let out = String(text ?? '');
  for (const f of part.footnotes ?? []) {
    const n = f.n ?? f.printed_note_number ?? f.page_note_index;
    let idx = part.page ? byPage.get(`${part.volume}|${part.page}|${f.page_note_index}`) : undefined;
    if (idx === undefined) {
      // Typed blocks carry no page: match within the unit by number, then by text.
      const same = footnotes.map((g, i) => [g, i]).filter(([g]) => g.unit === unit && (g.printed_note_number ?? g.page_note_index) === n);
      const byText = same.filter(([g]) => f.text && (g.text_ar ?? '').trim() === String(f.text).trim());
      idx = (byText.length === 1 ? byText : same.length === 1 ? same : [])[0]?.[1];
    }
    const marker = [`(${n})`, `[Fn ${n}]`].find((m) => unbracedIndexOf(out, m) >= 0);
    if (!marker) stats.markersAbsent++;
    else if (idx === undefined) stats.markersUnmatched++;
    else {
      const at = unbracedIndexOf(out, marker);
      out = `${out.slice(0, at)}${NOTE_OPEN}${idx}${NOTE_MID}${marker}${NOTE_CLOSE}${out.slice(at + marker.length)}`;
      stats.markersLinked++;
    }
  }
  return out;
}

function unbracedIndexOf(text, marker) {
  let depth = 0;
  let sentinel = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === NOTE_OPEN) sentinel = true;
    else if (c === NOTE_CLOSE) sentinel = false;
    else if (c === '{') depth++;
    else if (c === '}') depth = Math.max(0, depth - 1);
    else if (!depth && !sentinel && text.startsWith(marker, i)) return i;
  }
  return -1;
}

/* Who made the English, as each record states it. Nothing is supplied that the
   record does not say; local file paths are left out. */
function attribution(record, shape) {
  const t = record.translation;
  if (shape === 'A') {
    const s = t.source ?? {};
    return { title: s.title, credit: s.translator_credit, publisher: s.publisher, license: s.license, url: s.source_url, quality: s.translation_quality_note };
  }
  if (shape === 'B') {
    const s = t.source ?? {};
    return {
      title: s.title, version: s.version, credit: [s.translator, s.editor && `edited by ${s.editor}`].filter(Boolean).join(', '),
      publisher: s.publisher, license: s.license, url: s.website, quality: s.quality_disclosure, copyright: s.copyright,
      modifications: record.translation_note?.modifications,
    };
  }
  const notes = shape === 'C'
    ? [t.translation_notes].flat().filter(Boolean)
    : (record.translation_note?.details ?? []).filter((d) => !/Downloads\/|[A-Z]:\\/.test(d));
  return { title: t.title_en ?? null, credit: t.translator ?? null, notes: notes.map((n) => tidy(n, { keepNewlines: false })) };
}
