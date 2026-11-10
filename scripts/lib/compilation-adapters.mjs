/*
 * Per-collection adapters for the compilation reader builder
 * (scripts/build-abu-hanifa-mubarak-pages.mjs). Each adapter reads one supplied
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
    { label: 'Transmitters', text: 'Names link to the Rijāl Register using the identifiers supplied with the source. Names the source does not identify stay unlinked.' },
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
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report. A name links to the Rijāl Register only when it matches a single register entry; the source does not assert identities.' },
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
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report. A name links to the Rijāl Register only when it matches a single register entry; the source does not assert identities.' },
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
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report, including references such as "his father" that the report does not explain. A name links to the Rijāl Register only when it matches a single register entry.' },
  ].filter(note => note.text);
}

function shaybaniNotes(source, metadata) {
  const structure = source.structure;
  return [
    { label: 'Edition', text: metadata.edition },
    { label: 'Coverage', text: `The supplied export contains ${structure.report_count} reports in ${structure.chapter_count} chapters, which are the first ${structure.chapter_count} of the ${structure.contents_index_chapters} chapter headings in the printed contents index. The remaining chapters are not part of the supplied source and are not shown here.` },
    { label: 'English translation', text: `The English is the working translation supplied with the source export. The export names no translator. ${structure.bilingual_count} of ${structure.report_count} reports are supplied bilingual pairs; for the remaining ${structure.report_count - structure.bilingual_count === 1 ? 'report' : 'reports'} the export had no English and the English shown was translated from the Arabic. All reports had their isnad and matn boundaries reviewed by hand, but the edition is not certified and was not collated against the printed text.` },
    { label: 'Numbering', text: 'Reports carry their printed numbers 1 to 268. One report in chapter 10 is unnumbered in the source and is labeled Unnumbered.' },
    { label: 'Transmitters', text: 'Transmitter names are shown as written in each report. A name links to the Rijāl Register only when it matches a single register entry.' },
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
// These collections are converted by scripts/convert-second-century-sources.mjs into one unified
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
  locatorFor: record => ({ volume: null, page: record.page ?? null }),
  editionFor: source => source.compilation.edition,
};

const overlapNotes = {
  'hadith-sufyan-al-thawri': [{ label: 'Overlap with the manuscript text', text: 'Part One (entries 1 to 211 of the source) is the transmission of al-Sari b. Yahya that is also published here as the manuscript text under his name. The two files carry different Arabic: this is the printed critical edition, with the editor\'s bracketed restorations, and the other is the vowelled manuscript transcription. Part Two, the transmission of al-Firyabi, appears only here. The date shown is the death year of Sufyan al-Thawri, whose hadith is collected; the transmitters of the two parts lived later.' }],
  'ahadith-al-sari-an-al-thawri': [{ label: 'Overlap with the printed edition', text: 'This vowelled manuscript transcription covers the same transmission of al-Sari b. Yahya as Part One of the printed critical edition published here as the Hadith of Sufyan al-Thawri, whose Arabic differs. The printed edition is more complete and also gives al-Firyabi\'s transmission. The date shown is the catalog date of al-Sari b. Yahya, 167 AH; the work collects the hadith of Sufyan al-Thawri (d. 161 AH).' }],
  'muwatta-ibn-wahb-muharaba': [{ label: 'Relation to other editions', text: 'This is a section of the Muwatta of Ibn Wahb in the recension of Yunus b. \'Abd al-A\'la al-Sadafi. It is a different work from the Muwatta of Malik b. Anas in the corpus, although it reports Malik\'s hadith and opinions.' }],
  'muwatta-ibn-wahb-qada-buyu': [{ label: 'Relation to other editions', text: 'This is a section of the Muwatta of Ibn Wahb in the recension of Sahnun b. Sa\'id. It is a different work from the Muwatta of Malik b. Anas in the corpus, although it reports Malik\'s hadith and opinions.' }],
  'kitab-al-qadar-ibn-wahb': [{ label: 'Supplements', text: 'Reports marked (ز) in their number are supplementary reports added by the transmitter of the copy, Abu Bakr al-Warraq, from his own teachers. They are not part of Ibn Wahb\'s original book.' }],
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
    notesFor: source => [...source.notes, ...(overlapNotes[slug] ?? [])],
  };
}

export const secondCenturyConfigs = [
  { slug: 'kitab-al-qadar-ibn-wahb', compiler: 'ʿAbd Allāh ibn Wahb', death: 197, groups: 3, records: 51, noun: 'Part' },
  { slug: 'al-dua-ibn-fudayl', compiler: 'Muḥammad ibn Fuḍayl al-Ḍabbī', death: 195, groups: 1, records: 166 },
  { slug: 'mashyakhat-ibn-tahman', compiler: 'Ibrāhīm ibn Ṭahmān', death: 168, groups: 1, records: 208 },
  { slug: 'hadith-sufyan-al-thawri', compiler: 'Sufyān ibn Saʿīd al-Thawrī', death: 161, groups: 8, records: 321, authority: true },
  { slug: 'ahadith-al-sari-an-al-thawri', compiler: 'al-Sarī ibn Yaḥyā', death: 167, groups: 10, records: 211 },
  { slug: 'muwatta-ibn-wahb-muharaba', compiler: 'ʿAbd Allāh ibn Wahb', death: 197, groups: 10, records: 206, noun: 'Chapter' },
  { slug: 'muwatta-ibn-wahb-qada-buyu', compiler: 'ʿAbd Allāh ibn Wahb', death: 197, groups: 37, records: 371, noun: 'Chapter' },
  { slug: 'ahadith-muntakhaba-maghazi-musa-ibn-uqba', compiler: 'Mūsā ibn ʿUqba', death: 141, groups: 1, records: 22, authority: true },
  { slug: 'nuskhat-waki-an-al-amash', compiler: 'Wakīʿ ibn al-Jarrāḥ', death: 197, groups: 1, records: 50, authority: true },
  { slug: 'juz-sufyan-ibn-uyayna', compiler: 'Sufyān ibn ʿUyayna', death: 198, groups: 1, records: 80, authority: true },
  { slug: 'hadith-mujaa-ibn-al-zubayr', compiler: 'Mujāʿa ibn al-Zubayr', death: 146, groups: 1, records: 111, authority: true },
  { slug: 'kitab-al-hajj-al-majishun', compiler: 'ʿAbd al-ʿAzīz ibn al-Mājishūn', death: 164, groups: 1, records: 20, authority: true },
  { slug: 'nuskhat-al-zubayr-ibn-adi', compiler: 'al-Zubayr ibn ʿAdī', death: 131, groups: 1, records: 80, authority: true },
  { slug: 'ahadith-yazid-ibn-abi-habib', compiler: 'Yazīd ibn Abī Ḥabīb', death: 129, groups: 1, records: 68, authority: true },
  { slug: 'nuskhat-ibrahim-ibn-sad', compiler: 'Ibrāhīm ibn Saʿd', death: 184, groups: 1, records: 23, authority: true },
  { slug: 'ashara-ahadith-al-layth-ibn-sad', compiler: 'al-Layth ibn Saʿd', death: 175, groups: 1, records: 3, authority: true },
  { slug: 'majlis-fawaid-al-layth-ibn-sad', compiler: 'al-Layth ibn Saʿd', death: 175, groups: 1, records: 8, authority: true },
].map(secondCenturyConfig);
