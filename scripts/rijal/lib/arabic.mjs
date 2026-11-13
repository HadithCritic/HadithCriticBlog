/* Text helpers for parsing Arabic rijal entries.
   `fold` maps hamza-seat and alif-maqsura variants one character for one
   character, so a match found in folded text has the same offsets in the
   text it came from. Vowel marks are removed earlier, in segment.mjs. */

const FOLD = new Map([
  ['أ', 'ا'], ['إ', 'ا'], ['آ', 'ا'], ['ٱ', 'ا'], ['ى', 'ي'],
]);

export const fold = (text) => Array.from(text, (ch) => FOLD.get(ch) ?? ch).join('');

export const squash = (text) => text.replace(/\s+/g, ' ').trim();

export const words = (text) => squash(text).split(' ').filter(Boolean);
