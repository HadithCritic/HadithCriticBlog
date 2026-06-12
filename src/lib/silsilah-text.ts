/*
  Text helpers shared between build-time templates and client scripts.
  No node imports here: this module is bundled into the browser.
*/

/* Combining marks, superscript alef, Quranic annotation signs, tatweel. */
const AR_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/g;

/*
  Normalize Arabic for searching: strip vocalisation and unify the letter
  variants users type interchangeably. Applied identically to the indexed
  shadow text and to queries, so bare-letter input matches vocalised text.
*/
export function normalizeArabic(s: string): string {
  return s
    .replace(AR_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا') // أ إ آ ٱ -> ا
    .replace(/ى/g, 'ي') // ى -> ي
    .replace(/ئ/g, 'ي') // ئ -> ي
    .replace(/ؤ/g, 'و') // ؤ -> و
    .replace(/ة/g, 'ه'); // ة -> ه
}

export function hasArabic(s: string): boolean {
  return /[؀-ۿ]/.test(s);
}

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

/*
  Build a regex that finds a (normalized) query term inside displayed text.
  Arabic: each letter may be followed by diacritics, and letter variants are
  expanded so the bare form matches the vocalised original.
  English: case-insensitive prefix match on word boundaries.
*/
export function buildHighlightRegex(term: string): RegExp | null {
  const t = term.trim();
  if (t.length < 2) return null;
  if (hasArabic(t)) {
    const diac = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E8\\u06EA-\\u06ED\\u0640]*';
    const expand: Record<string, string> = {
      'ا': '[اأإآٱ]',
      'ي': '[يىئ]',
      'و': '[وؤ]',
      'ه': '[هة]'
    };
    let pattern = '';
    for (const ch of normalizeArabic(t)) {
      if (/\s/.test(ch)) {
        pattern += '\\s+';
      } else {
        const esc = ch.replace(REGEX_SPECIALS, '\\$&');
        pattern += (expand[ch] ?? esc) + diac;
      }
    }
    return new RegExp(pattern, 'g');
  }
  const esc = t.replace(REGEX_SPECIALS, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp('\\b' + esc + '[a-z]*', 'gi');
}
