import { restructure, STRUCTURES } from './work-structure.mjs';
import { TREATISES } from './translated-treatises.mjs';

/*
 * Per-collection adapters for the compilation reader builder
 * (scripts/hadith/build-abu-hanifa-mubarak-pages.mjs). Each adapter reads one supplied
 * publication source and exposes the same small surface: how to list headings
 * with their reports, how to read text, isnad/matn parts, numbers and page
 * locators, and how to turn the source's transmitter data into display chains.
 * Arabic and English wording is never altered here; fields the source does not
 * supply are left empty instead of being filled in.
 */

const norm = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const ARABIC_ONLY = /^[\u0600-\u06FF\u0750-\u077F\s.\u060C:\u061B-]+$/;
const ARABIC_RUN = /[\u0600-\u06FF\u0750-\u077F][\u0600-\u06FF\u0750-\u077F\s]*/;
const PAIR_BLOCK = /uncertain|unresolved|unidentified|contextual|narrative|addressed|mentioned|cross_reference|group|not_chain|variant_unresolved/i;
// The compilers appear in their own chains as bare names that a register match would misattribute.
const COMPILER_SELF = /^(?:Abu Yusuf|Muhammad|Muhammad ibn al-Hasan|Ibn Wahb)(?:\s*\(.*)?$/i;
const ROLE_BLOCK = /addressee|report subject|speaker in matn|recipient|commentat|commentary|unresolved|unnamed|unstated|not stated|name stated|anonymous|uncertain|unidentified|implied|antecedent|secondary|additional unnamed/i;

/** Keeps an isnad/matn split only when the two parts really make up the full text. */
function splitParts(text, isnad, matn, prefix = '') {
  const full = norm(text).replace(new RegExp(`^${norm(prefix).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`), '');
  const a = norm(isnad);
  const b = norm(matn);
  if (!a && !b) return { isnad: '', matn: '' };
  const joined = norm(`${a} ${b}`);
  if (joined === full || `${a}${b}` === full.replace(/\s+/g, '') || joined.replace(/\s+/g, '') === full.replace(/\s+/g, '')) {
    return { isnad: isnad ?? '', matn: matn ?? '' };
  }
  return { isnad: '', matn: '' };
}

function arabicForm(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (ARABIC_ONLY.test(text)) return text.replace(/\s+/g, ' ');
  return (text.match(ARABIC_RUN)?.[0] ?? '').trim();
}

function pathNodes(path) {
  return (Array.isArray(path) ? path : path?.narrators ?? []).map(node => ({
    en: node.name_en ?? node.en ?? '',
    ar: arabicForm(node.source_form),
    identity_status: node.identity_status ?? '',
    link_blocked: PAIR_BLOCK.test(node.identity_status ?? '') || COMPILER_SELF.test(node.name_en ?? node.en ?? ''),
  }));
}

// Single-book sources list their reports once and group them with source_sections.
function sectionGroups(source) {
  const book = source.books[0];
  const byId = new Map(book.records.map(record => [String(record.id), record]));
  return book.source_sections.map(section => ({
    ...section,
    records: (section.record_ids ?? []).map(id => {
      const record = byId.get(String(id));
      if (!record) throw new Error(`Section ${section.number} names report ${id}, which is not in the source.`);
      return record;
    }),
  }));
}

const babGroups = source => source.books.flatMap(book => (book.babs ?? []).map(bab => ({ ...bab, records: bab.records })));

function narratorPathChains(record) {
  const supplied = record.narrator_paths?.length ? record.narrator_paths : [record.narrator_path];
  const all = [...supplied, ...(record.additional_narrator_paths ?? []), ...(record.alternate_narrator_paths ?? [])]
    .map(pathNodes)
    .filter(nodes => nodes.length);
  const seen = new Set();
  const unique = all.filter(nodes => {
    const key = nodes.map(node => node.en).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.map((narrators, index) => ({
    narrators,
    direction: 'as_written_later_to_earlier',
    ...(index ? { context: 'alternative route' } : {}),
  }));
}

const NO_ENGLISH_NOTE = 'The source export supplied no English for this report. The English shown was translated from the Arabic in the working edition.';

function withNotes(record, notes) {
  return notes.length ? { ...record, notes } : record;
}

const sourcePage = record => ({ volume: record.source_page?.volume ?? null, page: record.source_page?.page ?? null });
const pairedText = record => ({
  en: record.display_text_en || record.text_en || record.raw_text_en,
  ar: record.display_text_ar || record.text_ar || record.raw_text_ar,
});
const pairedParts = record => {
  const text = pairedText(record);
  const prefix = record.display_prefix_ar ?? '';
  return {
    en: splitParts(text.en, record.display_isnad_en ?? record.isnad_en, record.display_matn_en ?? record.matn_en),
    ar: splitParts(text.ar, record.display_isnad_ar ?? record.isnad_ar, record.display_matn_ar ?? record.matn_ar, prefix),
  };
};
const numberOf = record => record.display_number ?? record.source_number ?? 'Unnumbered';
const clean = value => String(value ?? '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim();

const marasilLike = {
  noun: 'Chapter',
  sourceMetaKey: 'collection',
  groupsFor: babGroups,
  trustSourceNarratorIds: true,
  normalizeRecord: record => withNotes({
    ...record,
    chains: (record.chains ?? []).map(chain => ({
      narrators: (chain.narrators ?? []).map(node => ({
        en: node.en ?? '',
        ar: node.normalized_name_ar ?? '',
        normalized_name_ar: node.normalized_name_ar,
        narrator_id: node.narrator_id,
      })),
      direction: chain.direction,
    })),
  }, record.review?.unresolved ?? []),
  textFor: record => ({
    en: record.display_text_en || record.raw_text_en,
    ar: record.display_text_ar || record.raw_text_ar,
  }),
  // The supplied English is not split into isnad and matn, so English shows as one passage.
  partsFor: record => ({
    en: { isnad: '', matn: '' },
    ar: splitParts(record.display_text_ar || record.raw_text_ar, record.display_isnad_ar, record.display_matn_ar),
  }),
  numberFor: record => record.number ?? record.source_number ?? 'Unnumbered',
  locatorFor: record => ({ volume: null, page: record.page_reference ?? null }),
  editionFor: source => source.collection.edition,
};

const retranslationNote = (count, noun) => `The English is a retranslation that has not yet been reviewed. For ${count} ${noun}, a note beneath the report records a part of the Arabic that the English leaves out or another point still open. The supplied English is not divided into isnad and matn, so it appears as one passage beside the divided Arabic.`;

function marasilNotes(source, metadata) {
  const count = babGroups(source).flatMap(group => group.records).filter(record => record.review?.unresolved?.length).length;
  return [
    { label: 'Edition', text: metadata.edition },
    { label: 'English translation', text: retranslationNote(count, 'reports') },
    { label: 'Transmitters', text: 'Names are shown as the source gives them.' },
  ];
}

function mamarNotes(source, metadata) {
  const unassigned = source.structure.source_material_not_assigned_to_report ?? [];
  const continuations = source.books[0].records.filter(record => record.unnumbered_continuations?.length).length;
  const notes = [
    { label: 'Edition', text: metadata.edition },
    { label: 'English translation', text: 'The English is a working translation. The source states that it has not been independently proofread line by line, and the source review of the reports was not completed (none of the 1,615 reports is marked final). Read it as an aid and check it against the Arabic.' },
    { label: 'Translation provenance', text: 'Reports 19419 to 20800 use an earlier working translation. Reports 20801 to 21033 use a separately supplied English translation with clarifications, variant readings, and noted textual uncertainties. The Arabic is reproduced from the supplied source. Alignment and completeness of the numbered entries were checked; philological accuracy was not established.' },
    ...unassigned
      .filter(item => /translator/i.test(item.title_en))
      .flatMap(item => clean(item.text_en).replace(/^Translator's notes\s*/i, '').split(/\s-\s/).filter(Boolean)
        .map(text => ({ label: 'Translator note', text: text.replace(/^-\s*/, '') }))),
    { label: 'Unnumbered passages', text: `${continuations} reports are followed by short unnumbered continuations printed in the edition. Each appears beneath the report it follows.` },
    { label: 'Arabic text', text: 'The Arabic is shown as supplied, including the section sign that the source places inside many reports.' },
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report.' },
  ];
  return notes.filter(note => note.text);
}

function wahbNotes(source, metadata) {
  const records = source.books[0].records;
  const gaps = records.filter(record => record.manual_review_status === 'reviewed_with_source_gap').length;
  const missing = records.filter(record => !String(record.raw_text_en ?? '').trim()).length;
  return [
    { label: 'Edition', text: metadata.edition },
    { label: 'English translation', text: `The English is the working translation supplied with the source export. The export names no translator. The source counts ${source.structure.bilingual_count} of its ${source.structure.report_count} reports as supplied bilingual pairs. For ${missing} reports the export had no English, and the English shown was translated from the Arabic in the working edition. ${gaps} reports carry a note about a gap or a mismatch in the source. Every report here has both Arabic and English.` },
    { label: 'Corrections', text: 'Where the export ran two reports together or lost a heading or page number, the entry was separated or corrected as the printed edition shows it, and a note on the report says so.' },
    { label: 'Books and chapters', text: clean(source.books[0].source_books_note) },
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report.' },
  ].filter(note => note.text);
}

function yusufNotes(source, metadata) {
  const records = source.books[0].records;
  const missing = records.filter(record => !String(record.raw_text_en ?? '').trim()).length;
  const processing = source.processing ?? {};
  return [
    { label: 'Edition', text: metadata.edition },
    { label: 'English translation', text: `The English is the working translation supplied with the source export. The export names no translator, and the translation has not been checked against the Arabic here. ${source.structure.bilingual_count} of ${source.structure.report_count} reports are supplied bilingual pairs; for ${missing} the export had no English and the English shown was translated from the Arabic.` },
    { label: 'Review status', text: `Sequential manual review covers ${processing.records_manually_reviewed} of ${processing.records_total} reports. Final quality review is not closed and the edition is not certified, so the later reports have had less review than the earlier ones.` },
    { label: 'Notes on reports', text: 'A note appears beneath each report whose Arabic is incomplete, whose English is missing or does not match, or whose text only refers back to an earlier report.' },
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report, including references such as "his father" that the report does not explain.' },
  ].filter(note => note.text);
}

function shaybaniNotes(source, metadata) {
  const structure = source.structure;
  return [
    { label: 'Edition', text: metadata.edition },
    { label: 'Coverage', text: `The supplied export contains ${structure.report_count} reports in ${structure.chapter_count} chapters, which are the first ${structure.chapter_count} of the ${structure.contents_index_chapters} chapter headings in the printed contents index. The remaining chapters are not part of the supplied source and are not shown here.` },
    { label: 'English translation', text: `The English is the working translation supplied with the source export. The export names no translator. ${structure.bilingual_count} of ${structure.report_count} reports are supplied bilingual pairs; for the remaining ${structure.report_count - structure.bilingual_count === 1 ? 'report' : 'reports'} the export had no English and the English shown was translated from the Arabic. All reports had their isnad and matn boundaries reviewed by hand, but the edition is not certified and was not collated against the printed text.` },
    { label: 'Numbering', text: 'Reports carry their printed numbers 1 to 268. One report in chapter 10 is unnumbered in the source and is labeled Unnumbered.' },
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report.' },
  ].filter(note => note.text);
}

const FLAG_KEYS = ['english_missing', 'english_isnad_absent', 'translation_mismatch', 'matn_missing', 'matn_truncated', 'matn_is_cross_reference'];

function noEnglish(record) {
  return !String(record.raw_text_en ?? '').trim();
}

export const additionalConfigs = [
  {
    slug: 'jami-mamar-ibn-rashid',
    noun: 'Chapter',
    compiler: 'Maʿmar ibn Rāshid',
    death: 153,
    expectedGroups: 283,
    expectedRecords: 1615,
    sourceMetaKey: 'compilation',
    sourceId: 'jami-mamar-ibn-rashid',
    conservativeLinking: true,
    metadataOverride: { title_en: 'Jāmiʿ Maʿmar ibn Rāshid', short_name: 'Jāmiʿ Maʿmar ibn Rāshid' },
    groupsFor: sectionGroups,
    normalizeRecord: record => {
      const byId = new Map((record.narrators ?? []).map(node => [node.id, node]));
      const chains = (record.chains ?? []).map((chain, index) => ({
        narrators: chain.narrator_ids.map(id => {
          const node = byId.get(id);
          if (!node) throw new Error(`${record.id}: chain names unknown narrator ${id}.`);
          return {
            en: node.name_en ?? '',
            ar: node.name_ar ?? '',
            identity_status: node.identity_status ?? '',
            link_blocked: ROLE_BLOCK.test(node.chain_role ?? ''),
          };
        }),
        direction: 'as_written_later_to_earlier',
        ...(index ? { context: 'parallel attribution' } : {}),
      }));
      const continuations = (record.unnumbered_continuations ?? []).map(item => ({
        title_en: item.title_en, text_en: item.text_en, text_ar: item.text_ar,
      }));
      return { ...record, chains, continuations };
    },
    textFor: pairedText,
    partsFor: pairedParts,
    numberFor: numberOf,
    locatorFor: record => ({ volume: null, page: record.page_reference ?? null }),
    editionFor: source => source.compilation.edition,
    notesFor: mamarNotes,
  },
  {
    ...marasilLike,
    slug: 'al-marasil-abi-dawud',
    compiler: 'Abū Dāwūd al-Sijistānī',
    death: 275,
    expectedGroups: 114,
    expectedRecords: 543,
    sourceId: 'al-marasil-li-abi-dawud',
    notesFor: marasilNotes,
  },
  {
    slug: 'al-jami-ibn-wahb',
    noun: 'Chapter',
    compiler: 'ʿAbd Allāh ibn Wahb',
    death: 197,
    expectedGroups: 16,
    expectedRecords: 730,
    sourceMetaKey: 'compilation',
    sourceId: 'al-jami-ibn-wahb',
    conservativeLinking: true,
    groupsFor: sectionGroups,
    normalizeRecord: record => withNotes({ ...record, chains: narratorPathChains(record) }, [
      ...(record.manual_review_status === 'reviewed_with_source_gap' && record.boundary_review_note ? [record.boundary_review_note]
        : noEnglish(record) ? [NO_ENGLISH_NOTE] : []),
    ]),
    textFor: pairedText,
    partsFor: pairedParts,
    numberFor: numberOf,
    locatorFor: sourcePage,
    editionFor: source => source.compilation.edition,
    notesFor: wahbNotes,
  },
  {
    ...marasilLike,
    slug: 'al-muntaqa-ibn-al-jarud',
    compiler: 'Ibn al-Jārūd',
    death: 307,
    expectedGroups: 166,
    expectedRecords: 1159,
    sourceId: 'al-muntaqa',
    notesFor: (source, metadata) => marasilNotes(source, metadata).map(note => note.label === 'English translation'
      ? { ...note, text: retranslationNote(babGroups(source).flatMap(group => group.records).filter(record => record.review?.unresolved?.length).length, 'reports') }
      : note),
  },
  {
    slug: 'al-athar-abu-yusuf',
    noun: 'Chapter',
    compiler: 'Abū Yūsuf Yaʿqūb ibn Ibrāhīm',
    death: 182,
    expectedGroups: 39,
    expectedRecords: 1081,
    sourceMetaKey: 'compilation',
    sourceId: 'al-athar-abu-yusuf',
    conservativeLinking: true,
    groupsFor: sectionGroups,
    normalizeRecord: record => withNotes({ ...record, chains: narratorPathChains(record) }, [
      ...(FLAG_KEYS.some(key => record[key]) && record.boundary_review_note ? [record.boundary_review_note]
        : noEnglish(record) ? [NO_ENGLISH_NOTE] : []),
    ]),
    textFor: pairedText,
    partsFor: pairedParts,
    numberFor: numberOf,
    locatorFor: sourcePage,
    editionFor: source => source.compilation.edition,
    notesFor: yusufNotes,
  },
  {
    slug: 'al-athar-al-shaybani',
    noun: 'Chapter',
    compiler: 'Muḥammad ibn al-Ḥasan al-Shaybānī',
    death: 189,
    expectedGroups: 79,
    expectedRecords: 269,
    sourceMetaKey: 'compilation',
    sourceId: 'al-athar-al-shaybani',
    conservativeLinking: true,
    groupsFor: sectionGroups,
    normalizeRecord: record => withNotes({ ...record, chains: narratorPathChains(record) },
      noEnglish(record) ? [NO_ENGLISH_NOTE] : []),
    textFor: pairedText,
    partsFor: pairedParts,
    numberFor: numberOf,
    locatorFor: sourcePage,
    editionFor: source => source.compilation.edition,
    notesFor: shaybaniNotes,
  },
];

// ---- 2nd century (101-200 AH) batch -------------------------------------------------------
// These collections are converted by scripts/hadith/convert-second-century-sources.mjs into one unified
// reader source each. Reports with an isnad/matn split keep it; page-record sources show one page per entry.

const joinText = (a, b) => [a, b].map(value => String(value ?? '').trim()).filter(Boolean).join(' ');
const hasSplit = record => 'isnad_ar' in record || 'matn_ar' in record;

const secondCenturyBase = {
  noun: 'Section',
  sourceMetaKey: 'compilation',
  conservativeLinking: true,
  groupsFor: source => source.groups,
  textFor: record => hasSplit(record)
    ? { en: joinText(record.isnad_en, record.matn_en), ar: joinText(record.isnad_ar, record.matn_ar) }
    : { en: record.text_en, ar: record.text_ar },
  partsFor: record => hasSplit(record)
    ? { en: { isnad: record.isnad_en, matn: record.matn_en }, ar: { isnad: record.isnad_ar, matn: record.matn_ar } }
    : { en: { isnad: '', matn: '' }, ar: { isnad: '', matn: '' } },
  numberFor: record => record.display_number,
  locatorFor: record => ({ volume: record.volume ?? null, page: record.page ?? null }),
  editionFor: source => source.compilation.edition,
};

const overlapNotes = {
  'hadith-sufyan-al-thawri': [{ label: 'Overlap with the manuscript text', text: 'Part One (entries 1 to 211 of the source) is the transmission of al-Sari b. Yahya that is also published here as the manuscript text under his name. The two files carry different Arabic: this is the printed critical edition, with the editor\'s bracketed restorations, and the other is the vowelled manuscript transcription. Part Two, the transmission of al-Firyabi, appears only here. The date shown is the death year of Sufyan al-Thawri, whose hadith is collected; the transmitters of the two parts lived later.' }],
  'ahadith-al-sari-an-al-thawri': [{ label: 'Overlap with the printed edition', text: 'This vowelled manuscript transcription covers the same transmission of al-Sari b. Yahya as Part One of the printed critical edition published here as the Hadith of Sufyan al-Thawri, whose Arabic differs. The printed edition is more complete and also gives al-Firyabi\'s transmission. The date shown is the catalog date of al-Sari b. Yahya, 167 AH; the work collects the hadith of Sufyan al-Thawri (d. 161 AH).' }],
  'muwatta-ibn-wahb-muharaba': [{ label: 'Relation to other editions', text: 'This is a section of the Muwatta of Ibn Wahb in the recension of Yunus b. \'Abd al-A\'la al-Sadafi. It is a different work from the Muwatta of Malik b. Anas in the corpus, although it reports Malik\'s hadith and opinions.' }],
  'muwatta-ibn-wahb-qada-buyu': [{ label: 'Relation to other editions', text: 'This is a section of the Muwatta of Ibn Wahb in the recension of Sahnun b. Sa\'id. It is a different work from the Muwatta of Malik b. Anas in the corpus, although it reports Malik\'s hadith and opinions.' }],
  'kitab-al-qadar-ibn-wahb': [{ label: 'Supplements', text: 'Reports marked (ز) in their number are supplementary reports added by the transmitter of the copy, Abu Bakr al-Warraq, from his own teachers. They are not part of Ibn Wahb\'s original book.' }],
};

// The page-record editions once said they carried no transmitter data. Their chains are now read from the wording.
const READ_TRANSMITTERS = { label: 'Transmitters', text: 'The source supplies no separate transmitter data. Where a report states its own chain, the transmission path lists the names exactly as the isnad words them, read from the text between its transmission terms; English names are shown only where they line up one for one with the Arabic. No transmitter is identified beyond the wording of the source.' };
const pageRecordNotes = structure => ({ drop: ['Transmitters', 'Structure'], add: [{ label: 'Structure', text: structure }, READ_TRANSMITTERS] });
const STRUCTURE_NOTES = {
  'nuskhat-al-zubayr-ibn-adi': { drop: ['Transmitters', 'Structure', 'Isnad and matn'], add: [
    { label: 'Structure', text: 'A notebook (nuskha) carried by one chain. The title page lists the transmitters of the copy and the first narration gives the full chain down to al-Zubayr ibn ʿAdī from Anas ibn Mālik. The narrations after it open with a short formula, “and by it” or “and by his chain”, that points back to that chain, so the chain is stated once at the head of the text and the narrations are read as a numbered list.' },
    { label: 'Isnad and matn', text: 'A narration is divided only where its own wording names links of a chain, such as “and by it, from Ibn ʿUmar”. The division follows a fixed rule and does not alter the text.' },
  ] },
  'kitab-al-hajj-al-majishun': { drop: ['Transmitters', 'Structure', 'Isnad and matn'], add: [
    { label: 'Structure', text: 'A legal treatise on the pilgrimage in running prose, not a collection of separate reports. It opens with the chain through which the book was transmitted and then speaks in the author’s voice, quoting a chain only now and then. The text is therefore read continuously, with the printed page marked beside each passage.' },
  ] },
  'juz-sufyan-ibn-uyayna': pageRecordNotes('A fascicle (juzʾ) of fifty numbered narrations. The printed edition places an editor’s introduction and study before the fascicle and audition notes (samāʿāt) after it. The fascicle is the reading text; the audition notes follow it, and the editor’s introduction is kept as an appendix.'),
  'nuskhat-waki-an-al-amash': pageRecordNotes('A notebook (nuskha) of Wakīʿ’s narrations from al-Aʿmash, numbered 1 to 41. The opening page gives the chain through which the copy was transmitted; each narration then begins from al-Aʿmash. A second numbered series follows, which the source heads “additions to the copy”.'),
  'ahadith-muntakhaba-maghazi-musa-ibn-uqba': pageRecordNotes('A selection of twenty traditions from the Maghāzī of Mūsā ibn ʿUqba. The selector marks which part (juzʾ) of the original work each group of traditions was taken from, with a line such as “from the first part”. Those lines are the divisions of the selection and are its headings here. The opening pages give the transmission of the selection.'),
  'hadith-mujaa-ibn-al-zubayr': pageRecordNotes('A numbered part (juzʾ) of reports, each with its own chain. The series and title pages stand before the narrations and are not counted among them.'),
  'ahadith-yazid-ibn-abi-habib': pageRecordNotes('A fascicle (juzʾ) of numbered narrations, each with its own chain through al-Layth ibn Saʿd. A narration that runs onto a second printed page is shown as one narration with its continuation.'),
  'nuskhat-ibrahim-ibn-sad': pageRecordNotes('A notebook (nuskha) printed on pages 81 to 103 of a larger collection, whose running numbers the reports keep. The title page and the transmission of the copy stand before the reports. A report cut by a page break is shown as one report with its continuation.'),
  'ashara-ahadith-al-layth-ibn-sad': pageRecordNotes('A short selection printed on pages 77 to 79 of a larger collection, whose running numbers the reports keep. A report cut by a page break is shown as one report with its continuation.'),
  'majlis-fawaid-al-layth-ibn-sad': pageRecordNotes('A single session (majlis) of reports. It opens with the ḥadīth of Thumāma ibn Uthāl, which the source does not number, and continues with numbered reports.'),
};

function secondCenturyConfig({ slug, compiler, death, groups, records, noun, authority = false }) {
  return {
    ...secondCenturyBase,
    slug,
    compiler,
    death,
    noun: noun ?? secondCenturyBase.noun,
    authority,
    expectedGroups: groups,
    expectedRecords: records,
    sourceId: slug,
    // Page-record sources are sorted into the shape of the work they hold; see work-structure.mjs.
    groupsFor: source => restructure(source, slug),
    layout: STRUCTURES[slug]?.layout ?? 'cards',
    notesFor: source => [...source.notes.filter(note => !STRUCTURE_NOTES[slug]?.drop?.includes(note.label)), ...(STRUCTURE_NOTES[slug]?.add ?? []), ...(overlapNotes[slug] ?? [])],
  };
}

// 3rd century musnads, converted by scripts/hadith/convert-third-century-musnads.mjs. Both keep the compiler's Companion headings.
export const thirdCenturyConfigs = [
  { slug: 'musnad-al-humaydi', compiler: 'ʿAbd Allāh ibn al-Zubayr al-Ḥumaydī', death: 219, groups: 186, records: 1334 },
  { slug: 'musnad-ibn-abi-shayba', compiler: 'Abū Bakr ibn Abī Shayba', death: 235, groups: 281, records: 998 },
].map(secondCenturyConfig);

export const secondCenturyConfigs = [
  { slug: 'kitab-al-qadar-ibn-wahb', compiler: 'ʿAbd Allāh ibn Wahb', death: 197, groups: 3, records: 51, noun: 'Part' },
  { slug: 'al-dua-ibn-fudayl', compiler: 'Muḥammad ibn Fuḍayl al-Ḍabbī', death: 195, groups: 1, records: 166 },
  { slug: 'mashyakhat-ibn-tahman', compiler: 'Ibrāhīm ibn Ṭahmān', death: 168, groups: 1, records: 208 },
  { slug: 'hadith-sufyan-al-thawri', compiler: 'Sufyān ibn Saʿīd al-Thawrī', death: 161, groups: 8, records: 321, authority: true },
  { slug: 'ahadith-al-sari-an-al-thawri', compiler: 'al-Sarī ibn Yaḥyā', death: 167, groups: 10, records: 211 },
  { slug: 'muwatta-ibn-wahb-muharaba', compiler: 'ʿAbd Allāh ibn Wahb', death: 197, groups: 10, records: 206, noun: 'Chapter' },
  { slug: 'muwatta-ibn-wahb-qada-buyu', compiler: 'ʿAbd Allāh ibn Wahb', death: 197, groups: 37, records: 371, noun: 'Chapter' },
  { slug: 'muwatta-ibn-wahb', compiler: 'ʿAbd Allāh ibn Wahb', death: 197, groups: 1, records: 520, noun: 'Narration' },
  { slug: 'ahadith-muntakhaba-maghazi-musa-ibn-uqba', compiler: 'Mūsā ibn ʿUqba', death: 141, groups: 9, records: 20, authority: true },
  { slug: 'nuskhat-waki-an-al-amash', compiler: 'Wakīʿ ibn al-Jarrāḥ', death: 197, groups: 2, records: 47, authority: true },
  { slug: 'juz-sufyan-ibn-uyayna', compiler: 'Sufyān ibn ʿUyayna', death: 198, groups: 2, records: 51, authority: true },
  { slug: 'hadith-mujaa-ibn-al-zubayr', compiler: 'Mujāʿa ibn al-Zubayr', death: 146, groups: 1, records: 107, authority: true },
  { slug: 'kitab-al-hajj-al-majishun', compiler: 'ʿAbd al-ʿAzīz ibn al-Mājishūn', death: 164, groups: 1, records: 18, authority: true },
  { slug: 'nuskhat-al-zubayr-ibn-adi', compiler: 'al-Zubayr ibn ʿAdī', death: 131, groups: 1, records: 79, authority: true },
  { slug: 'ahadith-yazid-ibn-abi-habib', compiler: 'Yazīd ibn Abī Ḥabīb', death: 129, groups: 1, records: 65, authority: true },
  { slug: 'nuskhat-ibrahim-ibn-sad', compiler: 'Ibrāhīm ibn Saʿd', death: 184, groups: 1, records: 97, authority: true },
  { slug: 'ashara-ahadith-al-layth-ibn-sad', compiler: 'al-Layth ibn Saʿd', death: 175, groups: 1, records: 11, authority: true },
  { slug: 'majlis-fawaid-al-layth-ibn-sad', compiler: 'al-Layth ibn Saʿd', death: 175, groups: 1, records: 7, authority: true },
].map(secondCenturyConfig);

// Shorter 3rd and 4th century works, converted by scripts/hadith/convert-translated-treatises.mjs. Each keeps the
// division its own text has: chapters, headings that stand between the reports, or none.
export const treatiseConfigs = TREATISES.map(({ slug, compiler, death, groups, records, noun }) =>
  secondCenturyConfig({ slug, compiler, death, groups, records, noun }));
