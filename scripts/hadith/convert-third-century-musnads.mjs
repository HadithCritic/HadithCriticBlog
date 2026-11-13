#!/usr/bin/env node
/*
 * Converts the two supplied musnad translations into reader sources
 * (src/data/hadith/pages/<slug>/publication-source.json), which
 * scripts/hadith/build-abu-hanifa-mubarak-pages.mjs then renders.
 *
 *   Musnad Ibn Abī Shayba: numbered narrations under their Companion headings, with an English isnad/matn
 *     division supplied by the file. Arabic is supplied for narrations 399 onward; for 1 to 398 it is read
 *     from the Shamela page file the translation names as its source, matched by serial number.
 *   Musnad al-Ḥumaydī: Shamela page records under Companion headings. A page can hold several numbered
 *     narrations and a narration can run over two records, so pages are divided at the printed numbers.
 *
 * Both works are musnads: the compiler's own divisions are the Companion headings, which are kept in the
 * source order. Wording is copied as supplied. Isnads are divided from matns, and transmitters listed,
 * by scripts/hadith/lib/chain-from-isnad.mjs, which reads the text and adds nothing to it.
 *
 * Usage: node scripts/hadith/convert-third-century-musnads.mjs "<ibn-abi-shayba.json>" "<shamela-13155.json>" "<humaydi.json>"
 */
import fs from 'node:fs';
import path from 'node:path';
import { splitAndChain } from './lib/chain-from-isnad.mjs';

const [shaybaFile, shamelaFile, humaydiFile] = process.argv.slice(2);
if (!shaybaFile || !shamelaFile || !humaydiFile) throw new Error('Pass the Ibn Abī Shayba translation, its Shamela page file, and the al-Ḥumaydī file.');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const outRoot = path.resolve('src/data/hadith/pages');

const tidy = value => String(value ?? '').replace(/[‌‏]/g, '').replace(/[ \t]+/g, ' ').trim();
const stripNumberAr = value => tidy(value).replace(/^\d{1,4}\s*-\s*/, '');
const stripNumberEn = value => String(value ?? '').trim().replace(/^\d{1,4}\s*[-–]\s*/, '');
const WHOLE_AR = 'The Arabic is shown whole: its chain opens the passage below.';
const WHOLE_EN = 'The translation is shown whole: its chain opens the passage below.';
const WHOLE = 'The chain and the words are not divided here; the passage is shown whole.';

/** One reader record from a bilingual passage, split and with its transmitters where the wording allows. */
function record(base, ar, en, supplied = {}) {
  const result = splitAndChain(ar, en, supplied);
  const given = supplied.isnad_en || supplied.matn_en;
  const chains = result?.chain ? [{ narrators: result.chain, direction: 'as_written_later_to_earlier' }] : [];
  const shared = { chains, flags: [], remarks: [], footnotes: [], translator_notes: [], extra_refs: [], ...base };
  if (result?.en) return { ...shared, isnad_ar: result.ar.isnad, matn_ar: result.ar.matn, isnad_en: result.en.isnad, matn_en: result.en.matn };
  if (result) return { ...shared, isnad_ar: result.ar.isnad, matn_ar: result.ar.matn, isnad_en: '', matn_en: en, no_isnad_reason: WHOLE_EN };
  if (given) return { ...shared, isnad_ar: '', matn_ar: ar, isnad_en: supplied.isnad_en ?? '', matn_en: supplied.matn_en ?? '', no_isnad_reason: WHOLE_AR };
  return { ...shared, text_ar: ar, text_en: en, no_split: true, no_isnad_reason: WHOLE };
}

function finish(groups) {
  let count = 0;
  for (const group of groups) for (const item of group.records) { count += 1; item.id = `${group.number}.${count}`; }
  return groups;
}

function write(slug, source) {
  const target = path.join(outRoot, slug);
  fs.mkdirSync(target, { recursive: true });
  const payload = { schema_version: 'hadithcritic.reader-source/1.0', ...source, books: [] };
  fs.writeFileSync(path.join(target, 'publication-source.json'), `${JSON.stringify(payload, null, 1)}\n`, 'utf8');
  const records = source.groups.flatMap(group => group.records);
  const split = records.filter(item => item.isnad_ar).length;
  const paths = records.filter(item => item.chains.length).length;
  const paired = records.filter(item => item.chains[0]?.narrators.every(node => node.en)).length;
  console.log(`${slug}: ${source.groups.length} sections, ${records.length} records, ${split} with a divided isnad, ${paths} with a transmission path (${paired} with English names).`);
}

// ---- Musnad Ibn Abī Shayba ----------------------------------------------------------------

const REVIEW_FLAGS = {
  complex_layered_transmission: 'Layered transmission: the chain continues inside the report.',
  narration_inside_story_kept_in_matn: 'A further narration inside the story is kept with the matn.',
  quoted_embedded_transmission_kept_in_matn: 'A transmission quoted inside the report is kept with the matn.',
  printed_number_not_detected_in_linked_record: 'The printed number was not found in the linked source record.',
};

function convertShayba() {
  const source = read(shaybaFile);
  const pages = read(shamelaFile).pages;
  const bySerial = new Map(pages.map((page, index) => [String(page.serial_number), { page, index }]));
  const arabicOf = serial => {
    const hit = bySerial.get(String(serial));
    if (!hit) throw new Error(`Ibn Abī Shayba: no Shamela record ${serial}.`);
    return hit.page.text;
  };
  const arabicFor = narration => {
    if (narration.arabic_text) return stripNumberAr(narration.arabic_text);
    const parts = [narration.serial_number, ...(narration.additional_serial_numbers ?? [])].map(arabicOf).map(tidy);
    // A record that also carries the next printed number ends where that number begins.
    const next = parts[0].search(new RegExp(`\\s${narration.number + 1}\\s-\\s`));
    if (next > 0) parts[0] = parts[0].slice(0, next);
    return stripNumberAr(parts.join(' '));
  };
  const headingAr = section => {
    if (section.section_title_arabic) return tidy(section.section_title_arabic);
    // The heading is the unnumbered record printed just before the section's first narration.
    const first = bySerial.get(String(section.narrations[0].serial_number));
    const before = first && pages[first.index - 1];
    return before && !/\d\s-\s/.test(before.text) && before.text.length < 200 ? tidy(before.text) : '';
  };
  const fragments = source.source_fragments ?? [];
  const groups = source.sections.map((section, order) => {
    const records = [];
    for (const narration of section.narrations) {
      const ar = arabicFor(narration);
      const review = narration.corpus_review?.review_flags ?? [];
      const extra = [];
      if (narration.number_inferred || narration.source_number_inferred) extra.push({ label: 'Number', value: 'Not printed in the source record; supplied from the sequence' });
      if (narration.printed_number != null && String(narration.printed_number) !== String(narration.number)) extra.push({ label: 'Printed number', value: String(narration.printed_number) });
      if (narration.additional_serial_numbers?.length) extra.push({ label: 'Further source records', value: narration.additional_serial_numbers.join(', ') });
      records.push(record({
        source_id: String(narration.serial_number),
        display_number: String(narration.number),
        volume: narration.volume, page: String(narration.page),
        flags: review.map(flag => REVIEW_FLAGS[flag] ?? flag),
        translator_notes: [narration.source_note, narration.translation_note].filter(Boolean),
        extra_refs: extra,
        ...(narration.continuations?.length ? {
          continuations: narration.continuations.map(item => ({ title_en: `Continuation${item.page ? ` · p. ${item.page}` : ''}`, text_en: item.text, text_ar: tidy(item.arabic_text) })),
        } : {}),
      }, ar, narration.text, { isnad_en: narration.isnad, matn_en: narration.matn, narrators: narration.narrators }));
      for (const fragment of fragments.filter(item => item.after_number === narration.number)) {
        records.push({
          source_id: String(fragment.serial_number), display_number: '—', noun: 'Unnumbered record',
          volume: fragment.volume, page: String(fragment.page),
          text_ar: tidy(fragment.arabic_text), text_en: fragment.english_text, no_split: true,
          no_isnad_reason: 'No divided isnad: this unnumbered record begins partway through a chain in the source.',
          chains: [], flags: [], remarks: [], footnotes: [], extra_refs: [],
          translator_notes: [fragment.editorial_status],
        });
      }
    }
    return { number: order + 1, title_en: section.section_title, title_ar: headingAr(section), frames_before: [], frames_after: [], records };
  });
  const scope = source.translation_scope;
  write('musnad-ibn-abi-shayba', {
    compilation: {
      id: 'musnad-ibn-abi-shayba', title_en: 'Musnad Ibn Abī Shayba', title_ar: 'مسند ابن أبي شيبة', short_name: 'Musnad Ibn Abī Shayba',
      shamela_book_id: source.shamela_book_id,
      author: { name_en: 'Abū Bakr ibn Abī Shayba', death_ah: 235 },
      edition: `${source.editors}, ${source.publisher}, ${source.edition}`,
      unit_label: 'Sections', kind_en: 'Musnad', unit_noun: 'Narration',
      description_en: 'The Musnad of Abū Bakr ibn Abī Shayba (d. 235 AH), arranged as he arranged it: under the name of each Companion, the reports that Companion transmitted. Every narration is given in Arabic and English with its chain set apart from its words.',
    },
    notes: [
      { label: 'Edition', text: `${source.editors}; ${source.publisher}; ${source.edition}. Two volumes.` },
      { label: 'Structure of the work', text: `A musnad: the compiler's own headings name a Companion, and each heading is followed by that Companion's reports. The ${groups.length} headings and the narrations under them are kept in the order of the printed edition.` },
      { label: 'Numbering', text: `Narrations keep the printed numbers ${scope.numbered_from} to ${scope.numbered_through}. Number ${scope.source_number_gaps.join(', ')} is absent from the supplied translation and is not shown. Numbers ${scope.editorially_inferred_numbers.join(', ')} are not printed in their source records and are supplied from the sequence.` },
      { label: 'English translation', text: 'The English is the supplied translation, which names no translator. Its division into isnad and matn is the one the translation file records after its own review; narrations it flags as layered or as holding a second narration inside the story carry a source flag.' },
      { label: 'Arabic text', text: 'The Arabic of narrations 399 onward comes with the translation file. The Arabic of narrations 1 to 398 is taken from the Shamela text of the same edition, the source the translation names, matched record by record through the serial number. Printed numbers appear in the label instead of the text; page markers are carried over.' },
      { label: 'Isnad and matn', text: 'The Arabic is divided where its chain ends, by a fixed rule that does not alter the wording. A passage the rule cannot divide is shown whole and says so.' },
      { label: 'Transmitters', text: 'Each transmission path lists the names exactly as the isnad words them, read from the text between its transmission terms. English names are shown only where they line up one for one with the Arabic. No transmitter is identified beyond the wording of the source.' },
    ],
    groups: finish(groups),
  });
}

// ---- Musnad al-Ḥumaydī --------------------------------------------------------------------

const FULL_CHAIN_AR = /^(?:وَ?حَدَّثَنَا|حدثنا|ثنا|ثَنَا|أَخْبَرَنَا|أخبرنا)\s/;

/** The numbered pieces of one page, keeping any text printed before the first number. */
function piecesOf(text, numbers, marker) {
  const wanted = new Set(numbers.map(String));
  const hits = [...text.matchAll(marker)].filter(hit => wanted.has(hit[1]));
  const lead = (hits.length ? text.slice(0, hits[0].index) : text).trim();
  return { lead, parts: hits.map((hit, i) => ({ number: hit[1], text: text.slice(hit.index + hit[0].length, hits[i + 1]?.index ?? text.length).trim() })) };
}

function convertHumaydi() {
  const source = read(humaydiFile);
  const groups = [];
  const empty = [];
  let pendingFrames = [];
  let previous = null;
  let skippedHeaders = 0;
  const notesOf = page => [page.translation_editorial_note, page.editorial_note, ...(page.review_flags ?? []).map(flag => `Review flag: ${String(flag).replace(/_/g, ' ')}.`)].filter(Boolean);
  for (const page of source.pages) {
    if (page.record_type === 'bibliographic_metadata') { skippedHeaders += 1; continue; }
    if (page.record_type === 'section_heading') {
      groups.push({ number: groups.length + 1, title_en: page.section_heading_en, title_ar: tidy(page.section_heading_ar), frames_before: pendingFrames, frames_after: [], records: [] });
      pendingFrames = [];
      previous = null;
      continue;
    }
    const locator = { volume: Number(page.volume_number), page: /^\d+$/.test(page.page_number) ? page.page_number : null };
    if (page.record_type === 'unnumbered_source_text') {
      pendingFrames.push({ title_en: 'Part heading in the source', page: locator.page, ar: tidy(page.text), en: page.translation, footnotes: [] });
      continue;
    }
    const group = groups.at(-1);
    if (!group) throw new Error(`al-Ḥumaydī: record ${page.serial_number} precedes every heading.`);
    const base = { source_id: String(page.serial_number), ...locator, translator_notes: notesOf(page) };
    const arText = tidy(page.text);
    const ar = piecesOf(arText, page.narration_numbers, /(?:^|\s)(\d{1,4})\s-(?:\s|$)/g);
    // A printed number with nothing after it is a gap in the source, not a narration.
    empty.push(...ar.parts.filter(part => !part.text).map(part => part.number));
    ar.parts = ar.parts.filter(part => part.text);
    const kept = new Set(ar.parts.map(part => part.number));
    const byNumber = page.narration_translations;
    const en = byNumber
      ? { lead: '', parts: ar.parts.map(part => ({ number: part.number, text: byNumber[part.number] ?? '' })) }
      : piecesOf(String(page.translation ?? '').trim(), page.narration_numbers, /(?:^|\s)(\d{1,4})\s[-–](?:\s|$)/g);
    en.parts = en.parts.filter(part => kept.has(part.number));
    const aligned = ar.parts.length && ar.parts.length === en.parts.length && ar.parts.every((part, i) => part.number === en.parts[i].number);
    const continueWith = (textAr, textEn) => {
      // Text printed before a section's first number is not a narration: at the head of the work it is the chain through which the copy was transmitted.
      if (!previous) {
        group.frames_before.push({ title_en: groups.length === 1 && !group.records.length ? 'Opening of the copy: transmission chain' : 'Text before the first numbered narration', page: locator.page, ar: textAr, en: textEn, footnotes: [] });
        return;
      }
      (previous.continuations ??= []).push({ title_en: `Continuation${locator.page ? ` · p. ${locator.page}` : ''}`, text_en: textEn, text_ar: textAr });
    };
    if (!aligned) {
      // The page is not numbered the same way in both languages: keep it whole under its printed numbers.
      const numbers = page.narration_numbers;
      if (!numbers.length) { continueWith(arText, page.translation); continue; }
      previous = record({ ...base, display_number: numbers.length > 1 ? `${numbers[0]}–${numbers.at(-1)}` : String(numbers[0]) }, stripNumberAr(arText), stripNumberEn(page.translation));
      group.records.push(previous);
      continue;
    }
    if (ar.lead || en.lead) continueWith(ar.lead, en.lead);
    for (const [index, part] of ar.parts.entries()) {
      const english = en.parts[index].text;
      if (previous && previous.display_number === part.number && !FULL_CHAIN_AR.test(part.text)) { continueWith(part.text, english); continue; }
      const repeat = previous && previous.display_number === part.number;
      previous = record({ ...base, display_number: part.number, ...(repeat ? { source_number_occurrence: 2 } : {}) }, part.text, english);
      group.records.push(previous);
    }
  }
  if (pendingFrames.length) groups.at(-1).frames_after.push(...pendingFrames);
  const coverage = source.english_translation_coverage;
  write('musnad-al-humaydi', {
    compilation: {
      id: 'musnad-al-humaydi', title_en: 'Musnad al-Ḥumaydī', title_ar: 'مسند الحميدي', short_name: 'Musnad al-Ḥumaydī',
      shamela_book_id: source.shamela_book_id,
      author: { name_en: 'ʿAbd Allāh ibn al-Zubayr al-Ḥumaydī', death_ah: source.associated_authority_death_year_ah },
      edition: 'Ḥasan Salīm Asad al-Dārānī, Dār al-Saqqā, Damascus, 1st ed., 1996',
      unit_label: 'Sections', kind_en: 'Musnad', unit_noun: 'Narration',
      description_en: 'The Musnad of al-Ḥumaydī (d. 219 AH), the Meccan teacher of al-Bukhārī, arranged as he arranged it: the ḥadīths of each Companion under that Companion’s name, beginning with Abū Bakr. Every narration is given in Arabic and English with its chain set apart from its words.',
    },
    notes: [
      { label: 'Edition', text: 'Edited by Ḥasan Salīm Asad al-Dārānī; Dār al-Saqqā, Damascus; first edition, 1996. Two volumes.' },
      { label: 'Structure of the work', text: `A musnad: each of the compiler's headings names a Companion and is followed by that Companion's ḥadīths. The ${groups.length} headings and the narrations under them are kept in the order of the printed edition.` },
      { label: 'Numbering', text: `Narrations keep the printed numbers 1 to ${coverage.original_numbered_positions}. The supplied text is a set of page records: a record that holds several numbered narrations is divided at the printed numbers, and a narration that runs into a second record is shown as one narration with its continuation. Numbers ${empty.join(', ')} are printed with no text after them in the source and are not shown.` },
      { label: 'English translation', text: 'The English is the supplied translation, assembled from several batches that name no translator and spell names in more than one way. It has not been checked word by word against the Arabic; readings the translation marks for review carry a note.' },
      { label: 'Arabic text', text: 'The Arabic is shown as supplied. Printed numbers appear in the label instead of the text; page markers are carried over.' },
      { label: 'Isnad and matn', text: 'The Arabic is divided where its chain ends and the English at the same link of the chain, by a fixed rule that does not alter the wording. A passage the rule cannot divide is shown whole and says so.' },
      { label: 'Transmitters', text: 'Each transmission path lists the names exactly as the isnad words them, read from the text between its transmission terms. English names are shown only where they line up one for one with the Arabic. No transmitter is identified beyond the wording of the source.' },
      ...(skippedHeaders ? [{ label: 'Catalog header', text: 'Each volume opens with a record that repeats the Shamela catalog header. It is not reproduced as an entry.' }] : []),
      { label: 'Dating', text: `${source.dating_note} The date shown is the death year of the compiler, ${source.associated_authority_death_year_ah} AH.` },
    ],
    groups: finish(groups.filter(group => group.records.length || group.frames_before.length)),
  });
}

convertShayba();
convertHumaydi();
