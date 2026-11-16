#!/usr/bin/env node
/*
 * Applies the source-reconciled al-Muntaqā of Ibn al-Jārūd to its publication source.
 *
 * Usage: node scripts/hadith/convert-muntaqa-reconciled.mjs "<al-muntaqa-ibn-al-jarud_source-reconciled_translations-complete.json>"
 *
 * The reconciled file was checked against the Shamela export of the al-Bārūdī edition (book 13071,
 * Beirut 1988). It keeps the work's 166 numbered sections, sorts them into 28 editorial navigation
 * groups, adds reports 29 and 516, which the earlier source lacked, and gives every report its Shamela
 * page record, edition page and printed number label.
 *
 * What is taken from where:
 * - Structure, headings, groups, page records, numbering labels and the two added reports come from
 *   the reconciled file.
 * - Every other report keeps its record in publication-source.json: the English there is the same
 *   translation with its diacritics (the reconciled copy was read back from the plain-English pages),
 *   and the transmitter data lives only there. The script stops if the Arabic or the English of any
 *   kept report differs from the reconciled file in anything but that spelling.
 * - The groups are an editorial aid and are stored apart from the source's own kitāb and bāb headings.
 *
 * Rerunning it on an already converted source gives the same result.
 */
import fs from 'node:fs';
import path from 'node:path';
import { arabicLinks, englishNames } from './lib/chain-from-isnad.mjs';

const [reconciledFile] = process.argv.slice(2);
if (!reconciledFile) throw new Error('Pass the reconciled al-Muntaqā JSON.');
const sourcePath = path.resolve('src/data/hadith/pages/al-muntaqa-ibn-al-jarud/publication-source.json');
const reconciled = JSON.parse(fs.readFileSync(reconciledFile, 'utf8'));
const current = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const EXPECTED = { groups: 28, sections: 166, entries: 1161, added: ['29', '516'] };
const norm = value => String(value ?? '').replace(/\s+/g, ' ').trim();
// The spelling the reconciled copy was read back in: plain letters, "b." for "ibn", page markers dropped.
const plainEnglish = value => norm(String(value ?? '')
  .replace(/\[\d+\/\d+\]/g, ' ')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[ʿʾ‘’`']/g, "'").replace(/[“”]/g, '"').replace(/[—–]/g, '-')
  .replace(/\bibn\b/gi, 'b.').replace(/\bbint\b/gi, 'bt.'));
const fail = message => { throw new Error(`al-Muntaqā: ${message}`); };

/*
 * Reports whose isnad and matn the reader divided at the wrong place. Each is a chain with no text of
 * its own (a taḥwīl, or a second route for the report before it), so the whole report is the isnad;
 * 24137 is a chain followed by the compiler's remark and is shown whole.
 */
const CHAIN_ONLY = new Set(['23180', '23181', '23182', '23353', '23813']);
const SHOWN_WHOLE = new Set(['24137']);

if (reconciled.slug !== 'al-muntaqa-ibn-al-jarud' || reconciled.source_book_id !== '13071') fail('the file is not the reconciled al-Muntaqā.');
const groups = reconciled.groups ?? [];
const sections = groups.flatMap(group => group.sections.map(section => ({ group, section })));
const entries = sections.flatMap(({ section }) => section.entries);
if (groups.length !== EXPECTED.groups || sections.length !== EXPECTED.sections || entries.length !== EXPECTED.entries) {
  fail(`expected ${EXPECTED.groups} groups, ${EXPECTED.sections} sections and ${EXPECTED.entries} entries; found ${groups.length}, ${sections.length} and ${entries.length}.`);
}
if (new Set(entries.map(entry => entry.id)).size !== entries.length) fail('an entry id repeats.');
sections.forEach(({ section }, index) => {
  if (section.number !== index + 1) fail(`section ${section.number} is out of order.`);
});

const kept = new Map(current.books[0].babs.flatMap(bab => bab.records.map(record => [String(record.id), { bab, record }])));
const keptBabs = new Map(current.books[0].babs.map(bab => [bab.sequence, bab]));
const unknown = entries.filter(entry => !kept.has(entry.id) && !EXPECTED.added.includes(entry.number));
if (unknown.length) fail(`entries ${unknown.map(entry => entry.id).join(', ')} are neither in the current source nor the two added reports.`);
const lost = [...kept.keys()].filter(id => !entries.some(entry => entry.id === id));
if (lost.length) fail(`the reconciled file leaves out reports ${lost.join(', ')}.`);

// "101/ 2" and "794 (م)" are printed numbers; the plain number stays the record's number.
const displayNumber = entry => {
  const label = norm(entry.source_numbering_label ?? entry.number).replace(/\s*\/\s*/g, '/');
  return label === entry.number ? undefined : label;
};

function keptRecord(entry, section, sequence) {
  const { bab, record } = kept.get(entry.id);
  if (bab.sequence !== section.number) fail(`report ${entry.id} moved from section ${bab.sequence} to ${section.number}.`);
  if (String(record.source_number) !== entry.number) fail(`report ${entry.id} is numbered ${record.source_number} here and ${entry.number} in the reconciled file.`);
  if (norm(`${entry.isnad_ar} ${entry.matn_ar}`) !== norm(record.display_text_ar)) fail(`the Arabic of report ${entry.id} differs.`);
  const english = plainEnglish(record.display_text_en || record.raw_text_en);
  if (plainEnglish(`${entry.isnad_en} ${entry.matn_en}`) !== english) fail(`the English of report ${entry.id} differs.`);
  const page = Number(entry.source_page_number);
  const next = {
    ...record,
    sequence,
    page_reference: page,
    source_serial_number: entry.source_serial_number,
    source_record_type: entry.source_record_type,
    source_numbering_label: entry.source_numbering_label ?? null,
    translation_status: entry.translation_status,
  };
  delete next.display_number;
  delete next.no_split;
  const number = displayNumber(entry);
  if (number) next.display_number = number;
  if (record.page_reference !== page && record.page_reference_previous == null) next.page_reference_previous = record.page_reference;
  if (CHAIN_ONLY.has(entry.id)) {
    Object.assign(next, {
      display_isnad_ar: record.display_text_ar, display_matn_ar: '',
      display_isnad_en: record.display_text_en, display_matn_en: '',
    });
  }
  if (SHOWN_WHOLE.has(entry.id)) Object.assign(next, { display_isnad_ar: '', display_matn_ar: '', no_split: true });
  return next;
}

/** The chain as the isnad words it, latest transmitter first, with names only where both languages agree. */
function chainFrom(entry) {
  const ar = arabicLinks(entry.isnad_ar) ?? [];
  const en = englishNames(entry.isnad_en) ?? [];
  // A remark such as "Abū Muḥammad said: and X and Y related it" does not read as one chain; leave it without one.
  if (!ar.length || ar.some(name => /[:،,]/.test(name) || name.split(/\s+/).length > 6)) return [];
  return [{
    path_id: `${entry.id}/0`,
    direction: 'as_written_later_to_earlier',
    narrators: ar.map((name, index) => ({
      normalized_name_ar: name,
      narrator_id: null,
      en: en.length === ar.length ? en[index] : '',
    })),
  }];
}

// The Shamela text marks the edition's page turns as "⦗ص: 184⦘". As elsewhere in this source, the raw
// Arabic keeps them and the display drops them; the record notes the last page the report reaches.
const PAGE_MARK = /\s*⦗ص:\s*(\d+)⦘\s*/g;
const PAGE_MARK_EN = /\s*⦗p\.\s*\d+⦘\s*/g;
const unmarked = value => norm(String(value ?? '').replace(PAGE_MARK, ' ').replace(PAGE_MARK_EN, ' '));
const lastPage = entry => Math.max(Number(entry.source_page_number), ...[...`${entry.isnad_ar} ${entry.matn_ar}`.matchAll(PAGE_MARK)].map(hit => Number(hit[1])));

function addedRecord(entry, sequence) {
  const isnadAr = unmarked(entry.isnad_ar);
  const matnAr = unmarked(entry.matn_ar);
  const textAr = norm(`${isnadAr} ${matnAr}`);
  const pageEnd = lastPage(entry);
  const rawEn = norm(`${entry.isnad_en} ${entry.matn_en}`);
  const isnadEn = unmarked(entry.isnad_en);
  const matnEn = unmarked(entry.matn_en);
  const textEn = norm(`${isnadEn} ${matnEn}`);
  const corroborates = entry.transmission_relation === 'corroborating_chain_without_independent_matn';
  return {
    id: entry.id,
    stable_id: `al-muntaqa-${entry.id}`,
    number: Number(entry.number),
    source_number: Number(entry.number),
    source_number_occurrence: 1,
    sequence,
    page_reference: Number(entry.source_page_number),
    ...(pageEnd > Number(entry.source_page_number) ? { page_reference_end: pageEnd } : {}),
    raw_text_ar: norm(entry.source_text_ar),
    raw_text_en: rawEn,
    display_text_ar: textAr,
    display_text_en: textEn,
    display_isnad_ar: isnadAr,
    display_matn_ar: matnAr,
    display_isnad_en: isnadEn,
    display_matn_en: matnEn,
    chains: chainFrom(entry),
    source_serial_number: entry.source_serial_number,
    source_record_type: entry.source_record_type,
    source_numbering_label: entry.source_numbering_label ?? null,
    translation_status: entry.translation_status,
    translation_source: entry.translation_source,
    added_from_source: true,
    ...(entry.related_report_number ? { related_report_number: Number(entry.related_report_number) } : {}),
    ...(entry.transmission_relation ? { transmission_relation: entry.transmission_relation } : {}),
    review: {
      unresolved: [
        corroborates
          ? `This report gives only a further route for report ${entry.related_report_number}; the edition prints no text of its own for it.`
          : 'This report was missing from the earlier source and was added from the al-Bārūdī edition. Its English is a new translation.',
      ],
    },
  };
}

let sequence = 0;
const babs = sections.map(({ group, section }) => {
  const before = keptBabs.get(section.number);
  if (!before) fail(`section ${section.number} has no heading in the current source.`);
  if (before.title_en !== section.title_en) fail(`section ${section.number} is titled "${before.title_en}" here and "${section.title_en}" in the reconciled file.`);
  const records = section.entries.map(entry => {
    sequence += 1;
    // The added reports are always rebuilt from the reconciled file, also on a rerun.
    const original = kept.has(entry.id) && !kept.get(entry.id).record.added_from_source;
    return original ? keptRecord(entry, section, sequence) : addedRecord(entry, sequence);
  });
  if (records.length !== section.entry_count) fail(`section ${section.number} counts ${section.entry_count} entries and lists ${records.length}.`);
  return {
    sequence: section.number,
    title_en: section.title_en,
    title_ar: section.title_ar,
    title_ar_unvocalized: before.title_ar_unvocalized ?? before.title_ar,
    source_title_en: before.source_title_en,
    has_heading: before.has_heading,
    placeholder: before.placeholder,
    group: group.number,
    heading: {
      type: section.source_heading_type,
      number: section.source_heading_number,
      text_ar: section.source_heading_text_ar,
      short_ar: section.source_heading_short_ar,
      page: Number(section.source_heading_page),
      source_serial_number: section.source_heading_serial_number,
      confidence: section.heading_confidence,
    },
    hadith_number_start: section.hadith_number_start,
    hadith_number_end: section.hadith_number_end,
    records,
  };
});

const navigationGroups = groups.map(group => {
  const own = babs.filter(bab => bab.group === group.number);
  const count = own.reduce((sum, bab) => sum + bab.records.length, 0);
  if (count !== group.entry_count || own.length !== group.section_count) fail(`group ${group.number} counts do not match its sections.`);
  return {
    number: group.number,
    title_en: group.title_en,
    title_ar: group.title_ar,
    type: group.navigation_group_type,
    first_section: group.source_first_section,
    last_section: group.source_last_section,
    hadith_number_start: group.hadith_number_start,
    hadith_number_end: group.hadith_number_end,
    entry_count: group.entry_count,
    section_count: group.section_count,
    kitab_heading_sections: group.contains_explicit_kitab_headings,
    source_heading_basis: group.source_heading_basis,
  };
});

const next = {
  ...current,
  schema_version: '2.3',
  collection: {
    ...current.collection,
    edition: 'ed. ʿAbd Allāh ʿUmar al-Bārūdī, Muʾassasat al-Kitāb al-Thaqāfiyya and Dār al-Janān, Beirut, 1st ed. 1408/1988',
    edition_ar: 'تحقيق عبد الله عمر البارودي، مؤسسة الكتاب الثقافية ودار الجنان، بيروت، الطبعة الأولى 1408 هـ / 1988 م',
    source_book_id: reconciled.source_book_id,
  },
  navigation_groups: navigationGroups,
  books: [{ ...current.books[0], babs }],
  conversion_metadata: {
    ...current.conversion_metadata,
    reconciled_against: `Shamela book ${reconciled.source_book_id} (al-Bārūdī edition, 1988)`,
    organization_policy: reconciled.organization_explanation,
    numbering_policy: reconciled.numbering_explanation,
    added_reports: EXPECTED.added,
    split_corrections: {
      chain_only: [...CHAIN_ONLY],
      shown_whole: [...SHOWN_WHOLE],
    },
  },
};

const total = babs.reduce((sum, bab) => sum + bab.records.length, 0);
if (total !== EXPECTED.entries) fail(`wrote ${total} entries.`);
fs.writeFileSync(sourcePath, `${JSON.stringify(next, null, 1)}\n`, 'utf8');
console.log(`al-Muntaqā: ${navigationGroups.length} groups, ${babs.length} sections, ${total} reports (${EXPECTED.added.length} added).`);
