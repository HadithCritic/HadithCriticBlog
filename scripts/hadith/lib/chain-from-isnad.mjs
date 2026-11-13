/*
 * Reads the transmitters out of an isnad that the source gives only as running text, and divides the
 * English at the same point as the Arabic.
 *
 * Nothing is identified or corrected here: a name is the exact wording that stands between two
 * transmission terms (ḥaddathanā, ʿan, samiʿtu ...) in the Arabic, and between the matching terms in the
 * English. The two lists are paired only when they have the same length, so an English name is never
 * attached to the wrong Arabic one. When the wording does not divide cleanly the functions return null
 * and the reader shows no path, or no division, instead of a guessed one.
 */
import { splitArabic, splitEnglish, reconstructs } from './isnad-split.mjs';

const MARKS = /[ً-ٰٟـ​-‏‪-‮⁦-⁩﻿]/g;
const bare = word => word.replace(MARKS, '').replace(/[أإآٱ]/g, 'ا').replace(/[،؛.:«»"“”()[\]{}]/g, '');

const AR_LINK = new Set([
  'حدثنا', 'حدثني', 'حدثه', 'حدثهم', 'حدثتنا', 'حدثتني', 'حدثته', 'ثنا', 'ثني', 'نا', 'انا', 'ابنا', 'انبا', 'انبانا', 'انباني',
  'اخبرنا', 'اخبرني', 'اخبره', 'اخبرهم', 'اخبرتنا', 'اخبرتني', 'اخبرته', 'دثنا', 'سمعت', 'سمع', 'سمعا', 'عن', 'قرات',
].flatMap(word => [word, `و${word}`]));
// Words that close a name; what follows them, up to the next transmission term, is not part of a name.
const AR_CLOSE = new Set([
  'قال', 'قالت', 'قالا', 'قالوا', 'يقول', 'تقول', 'يقولان', 'يحدث', 'يحدثه', 'يخبر', 'انه', 'انها', 'انهم', 'ان', 'يبلغ', 'يرفعه', 'رفعه',
  'قراءه', 'قراءة', 'اجازه', 'اجازة', 'بقراءتي', 'سماعا', 'مكاتبه', 'مكاتبة', 'رحمه', 'رحمها', 'رحمهما', 'رضي', 'ابقاه', 'حرسه', 'ايده',
  'يعني', 'وهو', 'وهي', 'وانا', 'في', 'بمكه', 'بمكة', 'ببغداد', 'بمصر', 'بدمشق', 'املاء', 'لفظا', 'مثله', 'بمثله', 'نحوه', 'بنحوه', 'ايضا',
  'صلي', 'عليه', 'عليهما', 'عليها',
  // Back-references to a chain given earlier in the work.
  'وبه', 'وبإسناده', 'وباسناده', 'وبالاسناد', 'وبهذا', 'الاسناد', 'باسناده', 'بالاسناد', 'وبالسند',
].map(bare));
const PROPHET_AR = /^(?:رسول الله|النبي|نبي الله)/;
const PROPHET_EN = /^(?:the\s+)?(?:Prophet|Messenger of God|Messenger of Allah)\b/i;
// Late transmitters of a copy carry long strings of titles ("the shaykh, the imam, the scholar ...").
const MAX_NAME_WORDS = 24;
const isProphetAr = name => PROPHET_AR.test(name.replace(MARKS, '').replace(/[أإآ]/g, 'ا'));

/** Every name the Arabic isnad gives, latest first, the Prophet included when the chain reaches him. */
export function arabicLinks(isnad) {
  const words = String(isnad ?? '').replace(/⦗[^⦘]*(?:⦘|$)/g, ' ').replace(/^[\s‌‏]*\d{1,4}\s*-\s*/, '').split(/\s+/).filter(Boolean);
  const names = [];
  let current = null;
  let linked = false;
  const close = () => { if (current?.length) names.push(current); current = null; };
  for (const word of words) {
    const key = bare(word);
    if (!key) continue;
    if (AR_LINK.has(key)) { close(); current = []; linked = true; continue; }
    if (AR_CLOSE.has(key)) { close(); linked = linked || names.length > 0; continue; }
    // "qaraʾtu ʿalā": the preposition belongs to the transmission term, not to the name.
    if (key === 'على' && current && !current.length) continue;
    // A name before the first transmission term is the speaker who opens the chain.
    if (!current && !linked && !names.length) current = [];
    if (current) current.push(word);
  }
  close();
  const cleaned = names.map(parts => parts.join(' ').replace(/^[\s،:؛.]+|[\s،:؛.]+$/g, '')).filter(Boolean);
  if (!cleaned.length || cleaned.some(name => name.split(/\s+/).length > MAX_NAME_WORDS)) return null;
  return cleaned;
}

export function arabicNames(isnad) {
  const names = arabicLinks(isnad)?.filter(name => !isProphetAr(name));
  return names?.length ? names : null;
}

const EN_LINK_SOURCE = [
  String.raw`\b(?:narrated|related|reported|transmitted|recounted|dictated|recited|read)\s+(?:it\s+)?to\s+(?:us|me|him|her|them)\b`,
  String.raw`\b(?:informed|told)\s+(?:us|me|him|her|them)\b`,
  String.raw`\b(?:and\s+)?(?:narrating\s+|reporting\s+|relating\s+)?(?:from|on the authority of)\b`,
  String.raw`\b(?:I|he|she|they|who)\s+heard\b`, String.raw`\bthat\s+(?:he|she)\s+heard\b`,
  String.raw`\bI\s+(?:recited|read)\s+(?:it\s+)?(?:to|before)\b`,
  String.raw`;`, String.raw`,?\s*\b(?:who|he|she|both)\s+said\s*:`, String.raw`,?\s*\b(?:both\s+)?saying\s*:`,
].join('|');
const EN_NAME_END = /[,;]?\s*\b(?:who\s+(?:said|say|narrated|reported|related)|(?:he|she|they)\s+said|saying|said|say|says|that|narrating|narrate|by way of reading|while I was listening|may God)\b|:/i;
// Where a chain hands over to the words; honorific and aside phrases do not end it.
const EN_CLOSE = /[,;]?\s*\b(?:who\s+(?:said|say|narrated|reported|related)|(?:he|she|they)\s+said|saying|said|say|says|that)\b|:/i;
const cleanEnglishName = chunk => chunk
  .replace(/\[[^\]]*\]/g, ' ').replace(/\((?:ﷺ|ؓ|ؑ|may [^)]*|God [^)]*)\)/gi, ' ')
  .replace(/^[\s,;:.—-]+/, '').replace(/^(?:saying|who said|he said|said)\s*[:,]?\s*/i, '')
  .replace(/^and by (?:it|this|the same|his) ?(?:chain|isnad)?(?: of transmission)?,?\s*/i, '')
  .replace(new RegExp(`(?:${EN_NAME_END.source})[\\s\\S]*$`, 'i'), '')
  .replace(/[\s,;:.—-]+$/, '').replace(/\s+(?:say|says|mention|mentions|narrate|relate|report|recount)$/i, '')
  .replace(/\s*[ؓؑ﵁﵂﵃﵄ﷺ]\s*$/u, '').replace(/\s+/g, ' ').trim();

/** The name chunks of an English isnad with their positions in the text. */
export function englishLinks(isnad) {
  const text = String(isnad ?? '');
  const lead = text.match(/^\s*\d{1,4}\s*[-–]\s*/)?.[0].length ?? 0;
  const links = [...text.matchAll(new RegExp(EN_LINK_SOURCE, 'gi'))].filter(hit => hit.index >= lead);
  const bounds = [lead, ...links.flatMap(hit => [hit.index, hit.index + hit[0].length]), text.length];
  const chunks = [];
  for (let i = 0; i < bounds.length; i += 2) {
    const name = cleanEnglishName(text.slice(bounds[i], bounds[i + 1]));
    if (name && !/^both$/i.test(name)) chunks.push({ name, start: bounds[i], end: bounds[i + 1] });
  }
  return chunks;
}

export function englishNames(isnad) {
  const names = englishLinks(isnad).map(chunk => chunk.name).filter(name => !PROPHET_EN.test(name));
  if (!names.length || names.some(name => name.split(/\s+/).length > MAX_NAME_WORDS)) return null;
  return names;
}

/**
 * Divides the English where the Arabic isnad ends: after as many names as the Arabic chain gives.
 * Returns null unless the names line up and the two parts give the text back exactly.
 */
export function alignEnglish(textEn, arLinks) {
  const text = String(textEn ?? '');
  const chunks = englishLinks(text);
  const last = chunks[arLinks.length - 1];
  if (!last || chunks.slice(0, arLinks.length).some(chunk => chunk.name.split(/\s+/).length > MAX_NAME_WORDS)) return null;
  if (isProphetAr(arLinks.at(-1)) !== PROPHET_EN.test(last.name)) return null;
  const tail = text.slice(last.start, last.end);
  const close = tail.match(EN_CLOSE);
  if (!close) return null;
  // Keep "who said:" and the like with the isnad, as the Arabic split does.
  const rest = tail.slice(close.index + close[0].length);
  const cut = last.start + close.index + close[0].length + (close[0].endsWith(':') ? 0 : (rest.match(/^\s*:/)?.[0].length ?? 0));
  const parts = { isnad: text.slice(0, cut).trimEnd(), matn: text.slice(cut).trimStart() };
  return parts.isnad && parts.matn && reconstructs(text, parts) ? parts : null;
}

/** A chain that opens with its speaker's bare name ("ʿUmar: Ibn Abī Shayba narrated to us ...") is split after that name. */
function splitAfterSpeaker(textAr) {
  const text = String(textAr ?? '');
  const words = [...text.matchAll(/\S+/g)].slice(0, 6);
  const first = words.findIndex(word => AR_LINK.has(bare(word[0])));
  if (first <= 0) return null;
  const rest = splitArabic(text.slice(words[first].index));
  return rest ? { isnad: `${text.slice(0, words[first].index)}${rest.isnad}`, matn: rest.matn } : null;
}

/** A chain that pauses at "he said:" and then resumes with a transmission term ("... qāla: akhbaranā ...") is one chain. */
function continueChain(textAr, parts) {
  let current = parts;
  for (let guard = 0; current && guard < 12; guard += 1) {
    const firstWord = current.matn.match(/\S+/)?.[0] ?? '';
    if (!AR_LINK.has(bare(firstWord)) || bare(firstWord) === 'عن') break;
    const more = splitArabic(current.matn);
    if (!more) break;
    const cut = String(textAr).length - current.matn.length + (current.matn.length - more.matn.length);
    current = { isnad: String(textAr).slice(0, cut).trimEnd(), matn: more.matn };
  }
  return current;
}

/**
 * Splits one bilingual report into isnad and matn and lists its transmitters.
 * `supplied` is an English name list or split the source already gives; either is kept as it stands.
 * Returns null when the Arabic states no chain.
 */
export function splitAndChain(textAr, textEn, supplied = {}) {
  const ar = continueChain(textAr, splitArabic(textAr) ?? splitAfterSpeaker(textAr));
  if (!ar || !reconstructs(textAr, ar)) return null;
  const links = arabicLinks(ar.isnad);
  const given = supplied.isnad_en || supplied.matn_en ? { isnad: supplied.isnad_en ?? '', matn: supplied.matn_en ?? '' } : null;
  const fallback = () => { const parts = splitEnglish(textEn); return parts && reconstructs(textEn, parts) ? parts : null; };
  const en = given ?? (links && alignEnglish(textEn, links)) ?? fallback();
  const names = links?.filter(name => !isProphetAr(name)) ?? [];
  const listed = Array.isArray(supplied.narrators) ? supplied.narrators.map(name => cleanEnglishName(name)).filter(name => name && !PROPHET_EN.test(name)) : null;
  const read = en ? englishNames(en.isnad) : null;
  const english = [listed, read].find(list => list && list.length === names.length) ?? null;
  return {
    ar, en,
    chain: names.length ? names.map((name, index) => ({ ar: name, en: english ? english[index] : '' })) : null,
  };
}
