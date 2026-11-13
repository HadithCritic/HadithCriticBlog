#!/usr/bin/env node
/*
 * Converts the completed bilingual translation files of the 2nd century (101-200 AH)
 * batch into one reader source per collection (src/data/hadith/pages/<slug>/publication-source.json),
 * which scripts/hadith/build-abu-hanifa-mubarak-pages.mjs then renders.
 *
 * Arabic and English wording is copied as supplied; nothing is translated, repaired, or inferred.
 * Two source shapes exist:
 *   A. "hadithcritic.bilingual-edition" files: numbered reports with isnad/matn, transmission paths, flags.
 *   B. Page-record files (*_translated.json and the Layth files): one Arabic and one English text per
 *      source page. They carry no isnad/matn split or transmitter data, so each source page is one entry.
 *
 * Usage: node scripts/hadith/convert-second-century-sources.mjs "<english-dir>" [slug ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { PROFILES, pagesFromB } from './lib/second-century-profiles.mjs';

const sourceDir = process.argv[2];
if (!sourceDir) throw new Error('Pass the directory that holds the translated JSON files.');
const only = process.argv.slice(3);
const outRoot = path.resolve('src/data/hadith/pages');

const SPECS = [
  { slug: 'kitab-al-qadar-ibn-wahb', file: '153_', shape: 'A', title_en: 'Kitāb al-Qadar of Ibn Wahb', title_ar: 'القدر وما ورد في ذلك من الآثار', short: 'Kitāb al-Qadar of Ibn Wahb' },
  { slug: 'al-dua-ibn-fudayl', file: '23102_', shape: 'A', title_en: 'Al-Duʿāʾ of Ibn Fuḍayl', title_ar: 'الدعاء لمحمد بن فضيل', short: 'Al-Duʿāʾ of Ibn Fuḍayl' },
  { slug: 'mashyakhat-ibn-tahman', file: '24831_', shape: 'A', title_en: 'Mashyakhat Ibn Ṭahmān', title_ar: 'مشيخة ابن طهمان', short: 'Mashyakhat Ibn Ṭahmān' },
  { slug: 'hadith-sufyan-al-thawri', file: '26548_', shape: 'A', title_en: 'Ḥadīth Sufyān al-Thawrī (printed edition)', title_ar: 'من حديث الإمام سفيان بن سعيد الثوري', short: 'Ḥadīth Sufyān al-Thawrī' },
  { slug: 'ahadith-al-sari-an-al-thawri', file: '29701_', shape: 'A', title_en: 'Aḥādīth al-Sarī ibn Yaḥyā through al-Thawrī (manuscript text)', title_ar: 'أحاديث السري بن يحيى عن سفيان الثوري', short: 'Aḥādīth al-Sarī ibn Yaḥyā' },
  { slug: 'muwatta-ibn-wahb-muharaba', file: '30173_', shape: 'A', title_en: 'Muwaṭṭaʾ Ibn Wahb: Book of Armed Robbery', title_ar: 'كتاب المحاربة من موطأ عبد الله بن وهب', short: 'Muwaṭṭaʾ Ibn Wahb: Armed Robbery' },
  { slug: 'muwatta-ibn-wahb-qada-buyu', file: '30522_', shape: 'A', title_en: 'Muwaṭṭaʾ Ibn Wahb: Judicial Decisions on Sales', title_ar: 'الموطأ كتاب القضاء في البيوع', short: 'Muwaṭṭaʾ Ibn Wahb: Sales' },
  { slug: 'ahadith-muntakhaba-maghazi-musa-ibn-uqba', file: '1342_', shape: 'B', title_en: 'Selected Traditions from the Maghāzī of Mūsā ibn ʿUqba', title_ar: 'أحاديث منتخبة من مغازي موسى بن عقبة', short: 'Maghāzī of Mūsā ibn ʿUqba' },
  { slug: 'nuskhat-waki-an-al-amash', file: '23118_', shape: 'B', title_en: 'Wakīʿ’s Copy from al-Aʿmash', title_ar: 'نسخة وكيع عن الأعمش', short: 'Wakīʿ’s Copy from al-Aʿmash' },
  { slug: 'juz-sufyan-ibn-uyayna', file: '26337_', shape: 'B', title_en: 'Ḥadīth Fascicle of Sufyān ibn ʿUyayna', title_ar: 'جزء حديث سفيان بن عيينة', short: 'Fascicle of Sufyān ibn ʿUyayna' },
  { slug: 'hadith-mujaa-ibn-al-zubayr', file: '26745_', shape: 'B', title_en: 'Ḥadīth of Mujāʿa ibn al-Zubayr', title_ar: 'من حديث أبي عبيدة مجاعة بن الزبير العتكي البصري', short: 'Ḥadīth of Mujāʿa ibn al-Zubayr' },
  { slug: 'kitab-al-hajj-al-majishun', file: '26922_', shape: 'B', title_en: 'Book of Pilgrimage of al-Mājishūn', title_ar: 'كتاب الحج من كتب عبد العزيز بن عبد الله بن أبي سلمة الماجشون', short: 'Book of Pilgrimage of al-Mājishūn' },
  { slug: 'nuskhat-al-zubayr-ibn-adi', file: '29699_', shape: 'B', title_en: 'Copy of al-Zubayr ibn ʿAdī', title_ar: 'نسخة الزبير بن عدي', short: 'Copy of al-Zubayr ibn ʿAdī' },
  { slug: 'ahadith-yazid-ibn-abi-habib', file: '30310_', shape: 'B', title_en: 'Ḥadīths of Yazīd ibn Abī Ḥabīb', title_ar: 'أحاديث يزيد بن أبي حبيب المصري برواية الليث بن سعد', short: 'Ḥadīths of Yazīd ibn Abī Ḥabīb' },
  { slug: 'nuskhat-ibrahim-ibn-sad', file: '9412_', shape: 'B', title_en: 'Copy of Ibrāhīm ibn Saʿd', title_ar: 'نسخة إبراهيم بن سعد', short: 'Copy of Ibrāhīm ibn Saʿd' },
  { slug: 'ashara-ahadith-al-layth-ibn-sad', file: '9556_', shape: 'B', title_en: 'Ten Selected Ḥadīths of al-Layth ibn Saʿd', title_ar: 'عشرة أحاديث من الجزء المنتقى من حديث الليث', short: 'Ten Ḥadīths of al-Layth ibn Saʿd' },
  { slug: 'majlis-fawaid-al-layth-ibn-sad', file: '9812_', shape: 'B', title_en: 'A Session of Benefits of al-Layth ibn Saʿd', title_ar: 'جزء فيه مجلس من فوائد الليث بن سعد', short: 'Session of al-Layth ibn Saʿd' },
];

const human = value => {
  const text = String(value ?? '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? (text[0].toUpperCase() + text.slice(1)).replace(/arabic/g, 'Arabic').replace(/english/g, 'English') : '';
};
const KIND_TITLES = {
  recension_isnad_preface: 'Opening of the copy: transmission chain',
  closing_formula: 'Closing formula',
  transmission_chain_of_the_copy: 'Transmission of the copy',
  title_and_recension_chain: 'Title and transmission of the copy',
  basmala_title_and_transmitter: 'Title and transmitter of the copy',
};
const BLOCK_NAME = /unnamed|not named|unknown|lacuna|anonymous|^(?:his|her|their|a|an|one|some)\s|^(?:father|grandfather|mother|brother|uncle|son|wife) of\b|\(not named/i;
const pageOf = pages => {
  const list = (pages ?? []).map(String).filter(page => /^\d+$/.test(page));
  if (!list.length) return null;
  return list[0] === list.at(-1) ? list[0] : `${list[0]}-${list.at(-1)}`;
};

function footnoteOut(item) {
  return { marker: item.marker ?? null, kind: human(item.kind), ar: item.ar ?? '', en: item.en ?? '', anchored_in: item.anchored_in ?? null };
}
function frameOut(item, fallbackTitle) {
  return {
    title_en: KIND_TITLES[item.kind] ?? fallbackTitle,
    page: pageOf(item.source_pages),
    ar: item.ar ?? '',
    en: item.en ?? '',
    footnotes: (item.footnotes ?? []).map(footnoteOut),
  };
}

function recordFromA(raw, groupNumber, index, glossary) {
  const chains = (raw.transmission_paths ?? []).map((path, order) => ({
    narrators: path.chain.map(node => ({
      en: node.name_en ?? '',
      ar: node.name_ar ?? '',
      role: node.role ?? '',
      role_label: node.role === 'recension_transmitter' ? 'Transmitter of the copy' : node.role === 'compiler' ? 'Compiler' : node.role === 'earliest_transmitter' ? 'Earliest transmitter' : '',
      link_blocked: node.role === 'recension_transmitter' || BLOCK_NAME.test(node.name_en ?? ''),
    })),
    direction: 'earliest_first',
    ...(order ? { context: 'additional path' } : {}),
  }));
  const label = raw.number_label ?? raw.sequence;
  const extra = [];
  if (raw.reporting_authority?.name_en) extra.push({ label: 'Reported authority', value: `${raw.reporting_authority.name_en} (${human(raw.reporting_authority.level).toLowerCase()})` });
  if (raw.printed_number != null && raw.sequence != null) extra.push({ label: 'Printed number', value: String(raw.printed_number) });
  if (raw.sequence != null && raw.printed_number == null && raw.printed_marker) extra.push({ label: 'Printed number', value: 'None printed' });
  if (raw.part != null) extra.push({ label: 'Part', value: String(raw.part) });
  return {
    id: `${groupNumber}.${index + 1}`,
    source_id: raw.id,
    display_number: String(label),
    page: pageOf((raw.edition_pages ?? raw.source_pages ?? []).map(String)),
    isnad_ar: raw.isnad?.ar ?? '', matn_ar: raw.matn?.ar ?? '',
    isnad_en: raw.isnad?.en ?? '', matn_en: raw.matn?.en ?? '',
    chains,
    flags: (raw.flags ?? []).map(human),
    remarks: (raw.attached_remarks ?? []).map(item => ({ kind: human(item.kind), ar: item.ar ?? '', en: item.en ?? '' })),
    footnotes: (raw.footnotes ?? []).map(footnoteOut),
    glossary: (raw.glossary_ids ?? []).map(id => glossary.get(id)).filter(Boolean),
    extra_refs: extra,
  };
}

function groupsFromA(j) {
  const glossary = new Map((j.glossary ?? []).map(entry => [entry.glossary_id, { term_ar: entry.term_ar, definition_ar: entry.definition_ar, definition_en: entry.definition_en }]));
  const main = j.main_text;
  let groups;
  if (main.divisions && j.work.shamela_book_id === '153') {
    groups = main.divisions.map(division => ({
      title_en: division.title_en, title_ar: division.title_ar,
      frames_before: division.preface ? [frameOut(division.preface, 'Opening')] : [],
      frames_after: division.closing ? [frameOut(division.closing, 'Closing')] : [],
      raw: division.narrations,
    }));
  } else if (main.divisions) {
    groups = main.divisions.map(division => ({
      title_en: division.heading_en || 'Untitled section', title_ar: division.heading_ar || '',
      frames_before: [], frames_after: [], raw: division.reports,
    }));
  } else if (main.chapters) {
    groups = main.chapters.map(chapter => ({
      title_en: chapter.title_en, title_ar: chapter.title_ar || '',
      frames_before: [], frames_after: [], raw: chapter.reports,
    }));
  } else {
    groups = [{ title_en: 'Reports in source order (the book has no chapter headings)', title_ar: '', frames_before: [], frames_after: [], raw: main.reports }];
  }
  const preface = j.recension_preface;
  if (preface && (preface.ar || preface.en)) groups[0].frames_before.unshift(frameOut(preface, 'Transmission of the copy'));
  const colophon = j.colophon ?? j.closing_colophon;
  if (colophon?.ar) groups.at(-1).frames_after.push({ ...frameOut(colophon, 'Colophon'), title_en: 'Colophon' });
  const out = groups.map((group, order) => ({
    number: order + 1, title_en: group.title_en, title_ar: group.title_ar,
    frames_before: group.frames_before, frames_after: group.frames_after,
    records: group.raw.map((raw, index) => recordFromA(raw, order + 1, index, glossary)),
  }));
  if (j.front_matter?.sections?.length) {
    out.push({
      number: out.length + 1, title_en: "Editor's front matter and glossary", title_ar: '', kind: 'apparatus',
      sections: [
        ...j.front_matter.sections.map(section => ({ title_en: section.title_en, page: pageOf(section.source_pages), ar: section.ar, en: section.en, footnotes: (section.footnotes ?? []).map(footnoteOut) })),
        ...(j.glossary?.length ? [{ title_en: "Glossary (editor's appendix of rare words)", page: null, ar: '', en: '', glossary: j.glossary.map(entry => ({ term_ar: entry.term_ar, definition_ar: entry.definition_ar, definition_en: entry.definition_en })) }] : []),
      ],
      records: [],
    });
  }
  return out;
}

function notesFromA(j, spec, groups) {
  const work = j.work;
  const edition = [work.edition?.publisher_en, work.edition?.year_en || work.edition?.edition_en || work.edition?.edition].filter(Boolean).join(', ');
  const notes = [];
  if (edition) notes.push({ label: 'Edition', text: edition });
  if (work.editor?.name_en) notes.push({ label: 'Editor', text: work.editor.name_en });
  if (work.edition?.note) notes.push({ label: 'Numbering', text: work.edition.note });
  if (work.literary_structure_en) notes.push({ label: 'Structure of the work', text: work.literary_structure_en });
  const count = groups.reduce((sum, group) => sum + group.records.length, 0);
  notes.push({ label: 'English translation', text: 'The English is the supplied bilingual translation. The source file names no translator. Notes that the translation file attaches to a report appear beneath it, apart from the Arabic and English text.' });
  notes.push({ label: 'Arabic text', text: 'The Arabic is shown as supplied in the clean text of the source file, where written-out honorific formulas are replaced by Unicode symbols. The file also keeps the unaltered wording of every report.' });
  notes.push({ label: 'Flags and notes', text: 'Source flags mark uncertainties the source records for a report, such as a lacuna, an unnamed transmitter, or a doubt over a name. They describe the text and are not judgments of authenticity. Footnotes, attached remarks, and editor material are listed apart from the report text.' });
  notes.push({ label: 'Transmitters', text: 'Transmission paths run from the earliest named authority to the compiler, as the source lists them.' });
  if (work.compiler?.note_en) notes.push({ label: 'Compiler note', text: work.compiler.note_en });
  if (j.verification?.source_ends_incomplete) notes.push({ label: 'Completeness', text: 'The source text ends incompletely, as the supplied file records.' });
  notes.push({ label: 'Coverage', text: `${count} entries in ${groups.filter(group => group.kind !== 'apparatus').length} ${groups.length === 1 ? 'section' : 'sections'}, in the source order.` });
  return notes;
}

function readJson(prefix) {
  const file = fs.readdirSync(sourceDir).find(name => name.startsWith(prefix) && name.endsWith('.json'));
  if (!file) throw new Error(`No source file starts with ${prefix}`);
  return JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
}

function metadataFromA(j, spec) {
  const work = j.work;
  const transmitter = work.transmitter_of_this_recension?.name_en ?? work.recension_transmitter_who_added_supplements?.name_en ?? '';
  return {
    id: spec.slug, title_en: spec.title_en, title_ar: spec.title_ar, short_name: spec.short, shamela_book_id: work.shamela_book_id,
    author: { name_en: work.compiler.name_en, name_ar: work.compiler.name_ar, death_ah: work.compiler.death_ah },
    transmitter_of_recension: transmitter,
    edition: [work.edition?.publisher_en, work.edition?.year_en || work.edition?.edition_en].filter(Boolean).join(', '),
    unit_label: 'Sections',
  };
}

function convertB(j, spec) {
  const profile = PROFILES[spec.slug];
  const { groups, headerCount, dropped, globalNotes } = pagesFromB(j, profile);
  const first = j.pages.find(page => page.edition_english || page.edition_en) ?? j.pages[0];
  const edition = [first.publisher_english ?? first.publisher_en, first.edition_english ?? first.edition_en].filter(Boolean).join(', ');
  const death = j.associated_authority_death_year_ah;
  const units = groups.reduce((sum, group) => sum + group.records.length, 0);
  const notes = [
    ...(edition ? [{ label: 'Edition', text: edition }] : []),
    { label: 'Kind of work', text: profile.kind },
    { label: 'Structure', text: `${profile.structure} The supplied file holds ${j.pages.length} page records${profile.segment ? `, shown here as ${units} entries` : ''}.` },
    ...(headerCount ? [{ label: 'Catalog header', text: 'The first page record repeats the Shamela catalog header (title, author, editor, publisher). It is not reproduced as an entry.' }] : []),
    ...(dropped ? [{ label: 'Omitted pages', text: `${dropped} page records hold only a row of dots in the source and are not reproduced.` }] : []),
    { label: 'English translation', text: j.translation_info || j.translation_note || 'The English is the supplied translation of each page. The source file names no translator.' },
    ...globalNotes.map(text => ({ label: 'Translator note', text })),
    { label: 'Arabic text', text: 'The Arabic is shown exactly as supplied. Where an entry opens with its printed number, the number appears in the label instead of the text. Square brackets and page markers are carried over from the source.' },
    { label: 'Isnad and matn', text: 'Where the Arabic gives a chain before the words, the chain and the words are shown apart and the English is divided at the same point. Entries with no chain say so. The division follows a fixed rule and does not alter the text.' },
    { label: 'Transmitters', text: 'The source supplies no transmitter data, so this edition does not link transmitters to the Rijāl Register.' },
    { label: 'Dating', text: j.dating_note ? `${j.dating_note} The date shown is the death year of ${j.catalog_compiler_or_authority}, ${death} AH.` : '' },
  ].filter(note => note.text);
  return {
    compilation: {
      id: spec.slug, title_en: spec.title_en, title_ar: spec.title_ar, short_name: spec.short, shamela_book_id: j.shamela_book_id,
      author: { name_en: j.catalog_compiler_or_authority, death_ah: death },
      edition, unit_label: 'Sections', kind_en: profile.kind, description_en: profile.blurb, unit_noun: profile.noun,
    },
    notes,
    groups,
  };
}

fs.mkdirSync(outRoot, { recursive: true });
for (const spec of SPECS.filter(item => !only.length || only.includes(item.slug))) {
  const j = readJson(spec.file);
  let source;
  if (spec.shape === 'A') {
    const groups = groupsFromA(j);
    source = { compilation: metadataFromA(j, spec), notes: notesFromA(j, spec, groups), groups };
  } else {
    source = convertB(j, spec);
  }
  const target = path.join(outRoot, spec.slug);
  fs.mkdirSync(target, { recursive: true });
  const payload = { schema_version: 'hadithcritic.reader-source/1.0', ...source, books: [] };
  fs.writeFileSync(path.join(target, 'publication-source.json'), `${JSON.stringify(payload, null, 1)}\n`, 'utf8');
  const reading = payload.groups.filter(group => group.kind !== 'apparatus');
  console.log(`${spec.slug}: ${reading.length} groups, ${reading.reduce((sum, group) => sum + group.records.length, 0)} records${payload.groups.length > reading.length ? ' + apparatus page' : ''}`);
}
