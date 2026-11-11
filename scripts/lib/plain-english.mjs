/*
 * Khayyat-style English transliteration: plain ASCII names with ' for ayn and
 * hamza, and "b." for "ibn" inside a name. Applied at build time to English
 * display text only; Arabic and the stored source JSON are never altered.
 */
const NOT_A_NAME = new Set([
  'from', 'to', 'that', 'and', 'or', 'said', 'by', 'of', 'with', 'until', 'asked', 'met', 'called',
  'heard', 'than', 'if', 'while', 'was', 'watching', 'concerning', 'supporting', 'me', 'us', 'him',
  'her', 'them', 'on', 'for', 'about', 'told', 'narrated', 'reported', 'saying', 'whom', 'son',
]);

export function toPlainEnglish(value) {
  const text = String(value ?? '');
  if (!text) return text;
  // Modifier letters used for ayn and hamza (U+02BF, U+02BE, U+02BB, U+02BC) become an apostrophe.
  // Typographic quotes are left alone because the sources use them as real quotation marks.
  const folded = text
    .replace(/[ʿʾʻʼ]/g, "'")
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC');
  // "ibn" inside a name becomes "b."; a leading "Ibn" and prose words are untouched.
  return folded.replace(/(\S+) ibn (?=\S)/g, (match, previous) => {
    if (/[.,;:"?!”)]$/.test(previous)) return match;
    const bare = previous.replace(/[^\p{L}]/gu, '').toLowerCase();
    if (!bare && !/\]$/.test(previous)) return match;
    return NOT_A_NAME.has(bare) ? match : `${previous} b. `;
  });
}
