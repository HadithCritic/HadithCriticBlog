/*
 * Sets the honorific formulas of a supplied English translation as the single symbols the site uses
 * (docs/tafsir/kashshaf-translation/style-guide.md §6): "(RA)", "(may God be pleased with him)" and
 * "(peace and blessings be upon him)" become ﵁ and ﷺ, with a space before them.
 *
 * Which symbol a formula takes follows the Arabic of the same passage, where the edition prints the
 * formula in words: the Arabic formulas are read in order and paired with the English ones when the two
 * lists are the same length. Otherwise the English wording decides (him, her, them both, them), and a
 * bare "(RA)" takes the form the Arabic uses throughout the passage, or ﵁. A formula is shown only where
 * the edition prints one: when the Arabic of a passage has none, the English formulas the translator
 * added are removed. Where the edition breaks a formula off ("raḍiya llāhu" with no "ʿanhu"), the English
 * wording decides its form. Formulas about God, and prayers that belong to the speech of a report
 * ("May God have mercy on ʿUmar"), are left in words.
 */

export const SYMBOLS = {
  PROPHET: 'ﷺ', // صلى الله عليه وسلم
  PEACE: '﵇', // عليه السلام
  PEACE_DUAL: '﵉', // عليهما السلام
  PEACE_PLURAL: '﵈', // عليهم السلام
  PEACE_FEM: '﵍', // عليها السلام
  PRAYER_PEACE: '﵊', // عليه الصلاة والسلام
  PLEASED: '﵁', // رضي الله عنه
  PLEASED_FEM: '﵂', // رضي الله عنها
  PLEASED_PLURAL: '﵃', // رضي الله عنهم
  PLEASED_DUAL: '﵄', // رضي الله عنهما
  PLEASED_FEM_PLURAL: '﵅', // رضي الله عنهن
  MERCY: '﵀', // رحمه الله
  MERCY_PLURAL: '﵏', // رحمهم الله
};

const MARKS = /[ً-ْٰـ‌-‏]/g;
const normalizeAr = text => String(text ?? '').replace(/\s*⦗[^⦘]*⦘\s*/g, ' ').replace(MARKS, '').replace(/ى/g, 'ي').replace(/[أإآ]/g, 'ا');

const AR_FORMS = [
  [/^رضي الله(?: تعالي)? عنهما/, SYMBOLS.PLEASED_DUAL],
  [/^رضي الله(?: تعالي)? عنهن/, SYMBOLS.PLEASED_FEM_PLURAL],
  [/^رضي الله(?: تعالي)? عنهم/, SYMBOLS.PLEASED_PLURAL],
  [/^رضي الله(?: تعالي)? عنها/, SYMBOLS.PLEASED_FEM],
  [/^رضي الله(?: تعالي)? عنه/, SYMBOLS.PLEASED],
  [/^رضوان الله عليه/, SYMBOLS.PLEASED],
  // A formula the edition breaks off: its form is read from the English.
  [/^رضي الله/, null],
  [/^رحمهم الله/, SYMBOLS.MERCY_PLURAL],
  [/^رحمه الله/, SYMBOLS.MERCY],
  [/^عليه الصلاة والسلام/, SYMBOLS.PRAYER_PEACE],
  [/^عليهما السلام/, SYMBOLS.PEACE_DUAL],
  [/^عليهم السلام/, SYMBOLS.PEACE_PLURAL],
  [/^عليها السلام/, SYMBOLS.PEACE_FEM],
  [/^عليه السلام/, SYMBOLS.PEACE],
];
const AR_START = /رضي الله|رضوان الله عليه|رحمه(?:م)? الله|عليه(?:ما|م|ا)? (?:الصلاة و)?السلام/g;

/** The honorific formulas the Arabic prints, other than the blessing on the Prophet, in order. */
export function arabicHonorifics(textAr) {
  const text = normalizeAr(textAr);
  const found = [];
  for (const hit of text.matchAll(AR_START)) {
    const rest = text.slice(hit.index);
    // "radda ʿalayhi al-salām" is a returned greeting, not a formula.
    if (/^عليه/.test(rest) && /(?:^|\s)[فو]?(?:رد|يرد|ترد|سلم|يسلم)\S*\s*$/.test(text.slice(Math.max(0, hit.index - 12), hit.index))) continue;
    const form = AR_FORMS.find(([pattern]) => pattern.test(rest));
    if (form) found.push(form[1]);
  }
  return found;
}

const GOD = String.raw`God(?:\s+(?:the\s+)?(?:Exalted|Almighty|Most\s+High))?`;
const PLEASED_WHO = String.raw`him\s+and\s+(?:with\s+)?his\s+father|her\s+and\s+(?:with\s+)?her\s+father|them\s+both|both\s+of\s+them|them|him|her`;
const PAGE = String.raw`(?:\s*⦗[^⦘]*⦘)?`;
const BLESSING = String.raw`(?:peace\s+and\s+blessings|blessings\s+and\s+peace|God'?s\s+(?:peace\s+and\s+)?blessings(?:\s+and\s+peace)?)\s+be\s+upon\s+him`;
const PARENS = new RegExp(String.raw`\s*\((?:(${BLESSING})|(RA|RH|AS)|may\s+${GOD}\s+be\s+pleased${PAGE}\s+with\s+(${PLEASED_WHO})|may\s+${GOD}\s+have\s+mercy\s+on\s+(him|them)|peace\s+be\s+upon\s+(him|them\s+both|them|her))\)`, 'gi');
const BARE = new RegExp(String.raw`,\s*(?:may\s+${GOD}\s+be\s+pleased${PAGE}\s+(?:\[\s*)?with\s+(${PLEASED_WHO})\]?|(peace\s+be\s+upon\s+(?:him|them|her)))(?=\s*[,.;:!?—–”’"\]]|\s*$)`, 'gi');
// After a bare formula set off by commas, the second comma stays only before words that would take it anyway.
const KEEP_COMMA = new Set(['that', 'who', 'whom', 'whose', 'from', 'and', 'or', 'but', 'regarding', 'concerning', 'when', 'while', 'with', 'saying', 'if', 'then', 'as', 'in', 'on', 'at', 'both']);

const fromEnglish = (who, kind) => {
  const key = String(who ?? '').toLowerCase().replace(/\s+/g, ' ');
  if (kind === 'mercy') return key === 'them' ? SYMBOLS.MERCY_PLURAL : SYMBOLS.MERCY;
  if (kind === 'peace') return { 'them both': SYMBOLS.PEACE_DUAL, them: SYMBOLS.PEACE_PLURAL, her: SYMBOLS.PEACE_FEM }[key] ?? SYMBOLS.PEACE;
  if (/^(?:them both|both of them)$/.test(key)) return SYMBOLS.PLEASED_DUAL;
  if (key === 'them') return SYMBOLS.PLEASED_PLURAL;
  if (key.startsWith('her')) return SYMBOLS.PLEASED_FEM;
  return SYMBOLS.PLEASED;
};

/**
 * Returns the English with every honorific formula set as a symbol, and a short account of what was done:
 * how many formulas were set, and whether the English and Arabic formulas paired one for one.
 */
export function symbolizeHonorifics(textEn, textAr = '') {
  const text = String(textEn ?? '');
  const hits = [];
  for (const hit of text.matchAll(PARENS)) {
    const [whole, blessing, abbreviation, pleased, mercy, peace] = hit;
    const kind = blessing ? 'prophet' : mercy ? 'mercy' : peace ? 'peace' : abbreviation ? abbreviation.toUpperCase() : 'pleased';
    hits.push({ start: hit.index, end: hit.index + whole.length, kind, who: pleased ?? mercy ?? peace ?? '', bare: false });
  }
  for (const hit of text.matchAll(BARE)) {
    if (hits.some(other => hit.index < other.end && other.start < hit.index + hit[0].length)) continue;
    hits.push({ start: hit.index, end: hit.index + hit[0].length, kind: hit[2] ? 'peace' : 'pleased', who: hit[1] ?? hit[2].replace(/^peace\s+be\s+upon\s+/i, ''), bare: true });
  }
  hits.sort((a, b) => a.start - b.start);
  const arabic = arabicHonorifics(textAr);
  const aligned = hits.filter(hit => hit.kind !== 'prophet');
  const paired = aligned.length === arabic.length;
  const uniform = arabic.length && arabic.every(symbol => symbol === arabic[0]) ? arabic[0] : null;
  // The Arabic prints no formula here, so the English ones are the translator's and are left out.
  const unprinted = !arabic.length && Boolean(textAr);
  aligned.forEach((hit, index) => {
    if (unprinted) hit.symbol = '';
    else if (paired && arabic[index]) hit.symbol = arabic[index];
    else if (hit.kind === 'RA') hit.symbol = uniform && [SYMBOLS.PLEASED, SYMBOLS.PLEASED_FEM, SYMBOLS.PLEASED_DUAL, SYMBOLS.PLEASED_PLURAL].includes(uniform) ? uniform : SYMBOLS.PLEASED;
    else if (hit.kind === 'RH') hit.symbol = SYMBOLS.MERCY;
    else if (hit.kind === 'AS') hit.symbol = SYMBOLS.PEACE;
    else hit.symbol = fromEnglish(hit.who, hit.kind);
  });
  for (const hit of hits) if (hit.kind === 'prophet') hit.symbol = SYMBOLS.PROPHET;

  let out = '';
  let cursor = 0;
  for (const hit of hits) {
    out += hit.symbol ? `${text.slice(cursor, hit.start)} ${hit.symbol}` : text.slice(cursor, hit.start);
    cursor = hit.end;
    if (hit.bare && hit.symbol) {
      const next = text.slice(cursor).match(/^,\s*([A-Za-zʿʾĀ-ž'’]+)/);
      if (next && !KEEP_COMMA.has(next[1].toLowerCase())) cursor += 1;
    }
  }
  out += text.slice(cursor);
  return {
    text: out.replace(/ {2,}/g, ' '),
    count: hits.filter(hit => hit.symbol).length,
    removed: unprinted ? aligned.length : 0,
    paired: paired || !aligned.length || unprinted,
    arabic: arabic.length,
    english: aligned.length,
  };
}

/** Formula wording that is still written out after symbolizeHonorifics, for a report of what to read by hand. */
export const LEFTOVER = /\((?:RA|RH|AS|SAWS?|pbuh)\)|be\s+pleased\s+with|blessings\s+be\s+upon\s+him|peace\s+be\s+upon\s+(?:him|them|her)/i;
