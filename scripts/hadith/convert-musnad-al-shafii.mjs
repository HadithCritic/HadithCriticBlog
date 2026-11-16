#!/usr/bin/env node
/*
 * Converts the bilingual Musnad al-Shāfiʿī (Shamela 9344, Dār al-Kutub al-ʿIlmiyya) into a reader source,
 * src/data/hadith/pages/musnad-al-shafii/publication-source.json, which
 * scripts/hadith/build-abu-hanifa-mubarak-pages.mjs then renders.
 *
 * The work gathers the reports with chains in al-Shāfiʿī's books, as al-Rabīʿ ibn Sulaymān transmitted them,
 * under 68 headings that name the book each group was taken from ("from the Book of Ablution"). The headings and the
 * Shamela text records under them are kept in the source order, one entry per record. The edition prints
 * no report numbers, so the entries are numbered here in that order.
 *
 * Wording is copied as supplied, with two exceptions: honorific formulas in the English are set as the
 * site's symbols by scripts/hadith/lib/honorific-symbols.mjs, following the Arabic; and invisible joiners
 * are removed. Isnads are divided from matns, and transmitters listed, by
 * scripts/hadith/lib/chain-from-isnad.mjs, which reads the text and adds nothing to it. A record that
 * holds a second chain ("Sufyān informed us ... the like of it") keeps it in the matn, as the edition
 * prints it in one paragraph.
 *
 * Usage: node scripts/hadith/convert-musnad-al-shafii.mjs "<musnad-al-shafii-9344-arabic-english-nested-complete.json>"
 */
import fs from 'node:fs';
import path from 'node:path';
import { splitAndChain, arabicNames, englishNames } from './lib/chain-from-isnad.mjs';
import { arabicCut, englishCut, cutAt } from './lib/shafii-split.mjs';
import { symbolizeHonorifics, LEFTOVER } from './lib/honorific-symbols.mjs';

const SLUG = 'musnad-al-shafii';
const EXPECTED = { sections: 68, records: 1678, front: 6, back: 1 };
const [sourceFile] = process.argv.slice(2);
if (!sourceFile) throw new Error('Pass the bilingual Musnad al-Shāfiʿī JSON.');
const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
const outDir = path.resolve('src/data/hadith/pages', SLUG);

const tidy = value => String(value ?? '').replace(/[‌-‏]/g, '').replace(/[ \t]+/g, ' ').trim();
const tidyTitle = value => tidy(value).replace(/\s*⦗[^⦘]*⦘\s*/g, ' ').replace(/\s+:/g, ':').replace(/\s+/g, ' ').trim();
const WHOLE_EN = 'The translation is shown whole: its chain opens the passage below.';
const WHOLE = 'The chain and the words are not divided here; the passage is shown whole.';

const stats = { disagree: [], fallback: [], englishWhole: [], formulas: 0, removed: [], unpaired: [], leftovers: [], split: 0, englishSplit: 0, chains: 0, named: 0 };

function english(textEn, textAr, serial) {
  const result = symbolizeHonorifics(tidy(textEn), textAr);
  stats.formulas += result.count;
  if (result.removed) stats.removed.push(serial);
  if (!result.paired) stats.unpaired.push(`${serial} (Arabic ${result.arabic}, English ${result.english})`);
  if (LEFTOVER.test(result.text)) stats.leftovers.push(serial);
  return result.text;
}

// Page markers ("⦗ص: 8⦘", "⦗p. 8⦘", "[p. 8]") carry a colon or a period that the splitter would read as
// the end of a chain. They are swapped for a bare token while the text is divided, then put back as they were.
const MARKER = /⦗[^⦘]*⦘|\[\s*p\.\s*\d+\s*\]/g;
function shield(text) {
  const marks = [];
  return { text: text.replace(MARKER, mark => `⦗${marks.push(mark) - 1}⦘`), marks };
}
const unshield = (text, marks) => String(text ?? '').replace(/⦗(\d+)⦘/g, (_, i) => marks[Number(i)]);
const bareName = text => String(text ?? '').replace(/\s*⦗\d+⦘\s*/g, ' ').replace(/\s+/g, ' ').trim();

const sameText = (a, b) => a.replace(/\s/g, '') === b.replace(/\s/g, '');
// An English cut is kept only when its isnad reads as a chain: no quoted words, and roughly the length of the Arabic one.
function plausibleEnglish(parts, arParts) {
  if (!parts) return false;
  if (/[“‘"]/.test(parts.isnad) && !/[«"]/.test(arParts.isnad)) return false;
  const ratio = parts.isnad.split(/\s+/).length / arParts.isnad.split(/\s+/).length;
  return ratio > 0.6 && ratio < 2.6 && !/^[,:;.]/.test(parts.matn);
}

// Passages no rule divides well, read by hand: the words each matn opens with, by report number. An Arabic
// phrase is matched without its vowel marks. A side left out keeps the division the rules give it.
const OVERRIDES = {
  9: { ar: 'أن أبا قتادة دخل', en: 'Abu Qatadah came in' },
  115: { en: 'I said to Abu Mahdhurah' },
  146: { ar: 'أن النبي صلى الله عليه وسلم كان إذا ركع', en: 'the Prophet ﷺ, when he bowed' },
  190: { ar: 'لا يختلفان', en: 'and they did not differ' },
  370: { ar: '" هذه الصدقة', en: '“This is the charity' },
  421: { en: 'being asked about the kanz' },
  432: { en: 'ask Abdullah ibn Umar' },
  474: { ar: '«الحج جهاد', en: '“Hajj is jihad' },
  531: { ar: 'كان من تلبية', en: 'Among the talbiyah' },
  575: { ar: '" الحجر من البيت', en: '“The Hijr is part' },
  715: { en: '“' },
  731: { ar: '«إن رسول الله', en: '“The Messenger of God ﷺ forbade' },
  1115: { ar: 'كنا في موقف لنا', en: 'We were at a standing place' },
  1164: { ar: 'أن رسول الله صلى الله عليه وسلم نهى', en: 'the Messenger of God ﷺ forbade' },
  1171: { ar: 'لما نزلت آية الملاعنة', en: 'when the verse of liʿān' },
  1372: { ar: 'أن فاطمة', en: 'Fāṭima' },
  376: { ar: 'جاءني رجلان', en: 'Two men came to me' },
  1440: { en: 'ask Anas ibn Mālik' },
  1550: { ar: '«قام رسول الله', en: '“The Messenger of God ﷺ stood' },
  1575: { ar: 'وأنه صلى الله عليه وسلم قال لهم', en: 'and that he ﷺ said to them' },
  1584: { ar: 'أن عائشة', en: 'ʿĀʾisha ﵂ performed' },
  1677: { ar: 'بينا أنا مع عثمان', en: 'While I was with ʿUthmān' },
};
const VOWELS = '[\\u064B-\\u0652\\u0670\\u0640]*';
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function overrideAt(text, phrase, id) {
  const pattern = /[؀-ۿ]/.test(phrase) ? new RegExp([...phrase].map(char => escape(char) + VOWELS).join('')) : new RegExp(escape(phrase));
  const hit = text.match(pattern);
  if (!hit) throw new Error(`Report ${id}: the override "${phrase}" is not in the text.`);
  return cutAt(text, hit.index);
}

function splitShielded(ar, en, id) {
  const a = shield(ar);
  const e = shield(en);
  const fixed = OVERRIDES[id];
  if (fixed) {
    const division = splitParts(a, e, id, true);
    const arParts = fixed.ar ? overrideAt(a.text, fixed.ar, id) : division.arParts;
    const enParts = fixed.en ? overrideAt(e.text, fixed.en, id) : division.enParts;
    return finish(a, e, arParts, enParts, id);
  }
  const { arParts, enParts } = splitParts(a, e, id, false);
  return finish(a, e, arParts, enParts, id);
}

function splitParts(a, e, id, quiet) {
  const generic = splitAndChain(a.text, e.text);
  const offset = arabicCut(a.text);
  let arParts = offset > 0 ? cutAt(a.text, offset) : null;
  let enParts = null;
  if (arParts) {
    const cut = englishCut(e.text, arParts.isnad, arParts.matn);
    enParts = cut > 0 ? cutAt(e.text, cut) : null;
    if (!plausibleEnglish(enParts, arParts)) enParts = generic?.ar?.isnad === arParts.isnad && plausibleEnglish(generic.en, arParts) ? generic.en : null;
    if (!quiet && generic?.ar && generic.ar.isnad !== arParts.isnad) stats.disagree.push(id);
  } else if (generic?.ar) {
    arParts = generic.ar;
    const cut = englishCut(e.text, arParts.isnad, arParts.matn);
    const own = cut > 0 ? cutAt(e.text, cut) : null;
    enParts = [own, generic.en].find(parts => plausibleEnglish(parts, arParts)) ?? null;
    if (!quiet) stats.fallback.push(id);
  }
  return { arParts, enParts };
}

function finish(a, e, arParts, enParts, id) {
  if (!arParts) return null;
  if (!enParts) stats.englishWhole.push(id);
  const names = arabicNames(arParts.isnad) ?? [];
  const english = enParts ? englishNames(enParts.isnad) : null;
  const paired = english && english.length === names.length ? english : null;
  const parts = (pair, marks) => pair && { isnad: unshield(pair.isnad, marks), matn: unshield(pair.matn, marks) };
  return {
    ar: parts(arParts, a.marks),
    en: parts(enParts, e.marks),
    chain: names.length ? names.map((name, i) => ({ ar: bareName(name), en: bareName(paired?.[i] ?? '') })) : null,
  };
}

// "... ʿan Saʿīd, anna Jābira bna ʿAbd Allāh qāla:": the shared chain reader stops at "anna", so the
// authority named before his own words is added here as the earliest link.
const VOWEL_MARKS = /[ً-ْٰـ]/g;
const plainAr = word => word.replace(VOWEL_MARKS, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/[،,:]/g, '');
const FORMULA_WORDS = new Set(['رضي', 'الله', 'تعالي', 'عنه', 'عنها', 'عنهما', 'عنهم', 'صلي', 'عليه', 'وسلم', 'ﷺ']);
const unmarked = text => String(text ?? '').replace(MARKER, ' ').replace(/\s+/g, ' ').trim();
function withSpeaker(chain, isnadAr, isnadEn) {
  const words = unmarked(isnadAr).split(' ');
  const plain = words.map(plainAr);
  const said = plain.length - 1;
  if (!/^قال(?:ت)?$/.test(plain[said]) || !/:\s*$/.test(isnadAr)) return chain;
  const that = plain.lastIndexOf('ان', said);
  // "anna", not "in shāʾa llāh".
  if (that < 0 || !words[that].replace(VOWEL_MARKS, '').startsWith('أ') || said - that < 2 || said - that > 10) return chain;
  let span = words.slice(that + 1, said);
  const formula = span.findIndex(word => /^(?:رضي|صلي|ﷺ)$/.test(plainAr(word)));
  if (formula >= 0) span = span.slice(0, formula);
  const name = span.join(' ');
  const namePlain = plainAr(name);
  if (!name || /[،,]/.test(name) || /^(?:رسول|النبي|رجلا|امراة)/.test(namePlain) || plainAr(chain.at(-1)?.ar ?? '') === namePlain) return chain;
  const english = unmarked(isnadEn).match(/\bthat\s+([^,:;“"]{2,60}?)\s*[﵁﵂﵃﵄﵅]?\s*said\s*:\s*$/)?.[1]?.trim() ?? '';
  // A chain named in both languages stays so; without the English name the speaker is left out.
  if (chain.every(node => node.en) && !english) return chain;
  return [...chain, { ar: name, en: chain.every(node => node.en) ? english : '' }];
}

/** One reader record from a bilingual passage, divided and with its transmitters where the wording allows. */
function record(base, ar, en) {
  const result = splitShielded(ar, en, base.display_number);
  if (result && !sameText(`${result.ar.isnad}${result.ar.matn}`, ar)) throw new Error(`${base.source_id}: the Arabic division does not give the text back.`);
  if (result?.en && !sameText(`${result.en.isnad}${result.en.matn}`, en)) throw new Error(`${base.source_id}: the English division does not give the text back.`);
  const narrators = result?.chain ? withSpeaker(result.chain, result.ar.isnad, result.en?.isnad) : null;
  const chains = narrators ? [{ narrators, direction: 'as_written_later_to_earlier' }] : [];
  const shared = { chains, flags: [], remarks: [], footnotes: [], translator_notes: [], extra_refs: [], ...base };
  if (result) stats.split += 1;
  if (result?.en) stats.englishSplit += 1;
  if (chains.length) {
    stats.chains += 1;
    if (chains[0].narrators.every(node => node.en)) stats.named += 1;
  }
  if (result?.en) return { ...shared, isnad_ar: result.ar.isnad, matn_ar: result.ar.matn, isnad_en: result.en.isnad, matn_en: result.en.matn };
  if (result) return { ...shared, isnad_ar: result.ar.isnad, matn_ar: result.ar.matn, isnad_en: '', matn_en: en, no_isnad_reason: WHOLE_EN };
  return { ...shared, text_ar: ar, text_en: en, no_split: true, no_isnad_reason: WHOLE };
}

const pageOf = item => (/^\d+$/.test(String(item.page_number)) ? String(item.page_number) : null);
const frame = (item, title) => {
  const ar = tidy(item.text_ar);
  return { title_en: title, page: pageOf(item), ar, en: english(item.text_en, ar, item.serial_number), footnotes: [] };
};

function check(condition, message) {
  if (!condition) throw new Error(`Musnad al-Shāfiʿī: ${message}`);
}

check(source.shamela_book_id === '9344', `expected Shamela book 9344, found ${source.shamela_book_id}.`);
check(source.sections.length === EXPECTED.sections, `expected ${EXPECTED.sections} headings, found ${source.sections.length}.`);
check(source.front_matter.length === EXPECTED.front && source.back_matter.length === EXPECTED.back, 'front or back matter changed.');
const all = source.sections.flatMap(section => section.hadith_records);
check(all.length === EXPECTED.records, `expected ${EXPECTED.records} records, found ${all.length}.`);
check(new Set(all.map(item => item.serial_number)).size === all.length, 'a source record appears twice.');
check(all.every(item => item.text_ar && item.text_en), 'a record has no Arabic or no English.');
const serials = all.map(item => Number(item.serial_number));
check(serials.every((serial, i) => i === 0 || serial > serials[i - 1]), 'records are out of source order.');

// The first front-matter record repeats the Shamela catalog header and is not reproduced.
const [catalog, titlePage, ...introduction] = source.front_matter;
check(/^القسم/.test(tidy(catalog.text_ar)), 'the first front-matter record is not the catalog header.');
const prayer = introduction.pop();
const opening = [
  frame(titlePage, 'Title page'),
  ...introduction.map(item => frame(item, `Editor’s note on al-Shāfiʿī · p. ${item.page_number}`)),
  frame(prayer, 'Prayer on the Prophet before the text'),
];

let count = 0;
const groups = source.sections.map((section, index) => {
  check(section.section_number === index + 1, `heading ${index + 1} is numbered ${section.section_number}.`);
  check(section.hadith_records.length === section.report_record_count, `heading ${section.section_number} count differs from its record list.`);
  const records = section.hadith_records.map(item => {
    count += 1;
    const ar = tidy(item.text_ar);
    const base = {
      source_id: String(item.serial_number),
      volume: Number(item.volume_number) || 1,
      page: pageOf(item),
      display_number: String(count),
    };
    return record(base, ar, english(item.text_en, ar, item.serial_number));
  });
  return {
    number: section.section_number,
    title_en: section.title_en,
    title_ar: tidyTitle(section.title_ar),
    heading_type: section.heading_type,
    pages: { start: section.start_page, end: section.end_page },
    source_serial: section.heading_source_serial,
    frames_before: index === 0 ? opening : [],
    frames_after: index === source.sections.length - 1 ? [frame(source.back_matter[0], 'Colophon of the edition')] : [],
    records: records.map((item, i) => ({ ...item, id: `${section.section_number}.${count - records.length + i + 1}` })),
  };
});

const lastPage = source.back_matter[0].page_number;
const payload = {
  schema_version: 'hadithcritic.reader-source/1.0',
  compilation: {
    id: SLUG,
    title_en: 'Musnad al-Shāfiʿī',
    title_ar: 'مسند الشافعي',
    short_name: 'Musnad al-Shāfiʿī',
    shamela_book_id: source.shamela_book_id,
    author: { name_en: 'Muḥammad ibn Idrīs al-Shāfiʿī', death_ah: source.associated_authority_death_year_ah },
    edition: 'Dār al-Kutub al-ʿIlmiyya, Beirut, 1400 AH (1980), corrected against the Būlāq and Indian printings',
    unit_label: 'Books',
    kind_en: 'Musnad',
    unit_noun: 'Report',
    description_en: 'The reports al-Shāfiʿī (d. 204 AH) cites in his books, as his student al-Rabīʿ ibn Sulaymān transmitted them, gathered under the name of the book each came from: ablution, prayer, pilgrimage, sales, divorce, al-Risāla and the rest. Every report is given in Arabic and English with its chain set apart from its words.',
  },
  notes: [
    { label: 'Edition', text: `Dār al-Kutub al-ʿIlmiyya, Beirut, 1400 AH, one volume of ${lastPage} pages, corrected against the Būlāq (Amīriyya) printing and the Indian printing (Shamela ${source.shamela_book_id}). The colophon says the text was collated with the Amīriyya copy, which had itself been collated with an old Syrian manuscript bearing audition notes, the last dated 784 AH.` },
    { label: 'Structure of the work', text: `Not a musnad arranged by Companion. The reports with chains in al-Shāfiʿī’s books, as his student al-Rabīʿ ibn Sulaymān transmitted them in Egypt, were taken out and set under ${groups.length} headings, each naming the book they came from. The gathering is usually credited to Abū al-ʿAbbās al-Aṣamm (d. 346 AH), who heard the books from al-Rabīʿ. Some headings say that al-Rabīʿ did not hear that material from al-Shāfiʿī himself. The headings and the reports under them keep the order of the printed edition.` },
    { label: 'Numbering', text: `The edition prints no report numbers. The ${count} entries are the text records of the Shamela edition, numbered here 1 to ${count} in their printed order; a page reference stands beside each. A record can hold more than one chain for the same report, or al-Shāfiʿī’s remark after it, and these are shown together as the edition prints them.` },
    { label: 'English translation', text: 'The English is the supplied translation, assembled from several batches that name no translator and spell names in more than one way. It has not been checked word by word against the Arabic.' },
    { label: 'Honorifics', text: 'Blessings and honorifics after a name are set as symbols (ﷺ, ﵁, ﵂, ﵄ and the like), where the translation spelled them out or abbreviated them. Each symbol follows the formula the Arabic prints at that place. Formulas about God stay in words.' },
    { label: 'Arabic text', text: 'The Arabic is shown as supplied, with its honorific formulas in words as the edition prints them. Page markers are carried over in both languages.' },
    { label: 'Isnad and matn', text: 'The Arabic is divided where its chain ends and the English at the same link of the chain, by a fixed rule that does not alter the wording. A further chain given for the same report stays with the matn. A passage the rule cannot divide is shown whole and says so.' },
    { label: 'Transmitters', text: 'Each transmission path lists the names exactly as the isnad words them, read from the text between its transmission terms. English names are shown only where they line up one for one with the Arabic. No transmitter is identified beyond the wording of the source.' },
    { label: 'Front matter', text: 'The edition’s title page, its short note on al-Shāfiʿī and its opening prayer stand before the first heading. The Shamela catalog header is not reproduced.' },
    { label: 'Dating', text: `The date shown is the death year of al-Shāfiʿī, ${source.associated_authority_death_year_ah} AH. The gathering was made later, from al-Rabīʿ’s transmission (al-Rabīʿ d. 270 AH).` },
  ],
  groups,
  books: [],
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'publication-source.json'), `${JSON.stringify(payload, null, 1)}\n`, 'utf8');
console.log(`${SLUG}: ${groups.length} headings, ${count} records; ${stats.split} with a divided Arabic isnad (${stats.englishSplit} divided in English too), ${stats.chains} with a transmission path (${stats.named} with English names).`);
console.log(`Division: ${stats.disagree.length} differ from the shared splitter (${stats.disagree.join(' ')}); ${stats.fallback.length} from the shared splitter (${stats.fallback.join(' ')}); English shown whole: ${stats.englishWhole.join(' ')}`);
console.log(`Honorifics: ${stats.formulas} formulas set as symbols; ${stats.unpaired.length} passages where the English and Arabic formulas do not pair one for one; ${stats.removed.length} passages where the translator added a formula the Arabic does not print (removed).`);
if (stats.removed.length) console.log(`  Removed: ${stats.removed.join(', ')}`);
if (stats.unpaired.length) console.log(`  Unpaired: ${stats.unpaired.join('; ')}`);
if (stats.leftovers.length) console.log(`  Formula wording left in: ${stats.leftovers.join(', ')}`);
