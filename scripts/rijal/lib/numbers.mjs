/* Arabic number words as Ibn Ḥajar writes years ("ست وثلاثين",
   "ثلاث أو أربع ومائة", "خمس وقيل ست وتسعين"). Input is folded text
   (see arabic.mjs). */

const UNITS = new Map([
  ['واحد', 1], ['واحدة', 1], ['احدي', 1], ['احد', 1], ['اثنتين', 2], ['اثنين', 2],
  ['ثنتين', 2], ['اثنتي', 2], ['اثني', 2], ['ثلاث', 3], ['ثلاثة', 3], ['اربع', 4],
  ['اربعة', 4], ['خمس', 5], ['خمسة', 5], ['ست', 6], ['ستة', 6], ['سبع', 7],
  ['سبعة', 7], ['ثمان', 8], ['ثماني', 8], ['ثمانية', 8], ['تسع', 9], ['تسعة', 9],
]);

const TENS = new Map([
  ['عشر', 10], ['عشرة', 10], ['عشرين', 20], ['ثلاثين', 30], ['اربعين', 40],
  ['خمسين', 50], ['ستين', 60], ['سبعين', 70], ['ثمانين', 80], ['تسعين', 90],
  ['عشرون', 20], ['ثلاثون', 30], ['اربعون', 40], ['خمسون', 50], ['ستون', 60],
  ['سبعون', 70], ['ثمانون', 80], ['تسعون', 90],
]);

const HUNDREDS = new Map([
  ['مائة', 100], ['مئة', 100], ['مائتين', 200], ['مائتان', 200], ['مئتين', 200],
  ['ثلاثمائة', 300], ['اربعمائة', 400], ['خمسمائة', 500],
]);

const SOME = new Set(['بضع', 'بضعة', 'نيف', 'نيفا']);

/* Separators between alternative years. */
const ALT_SEPARATORS = [['او', 'سنة'], ['وقيل', 'سنة'], ['ويقال', 'سنة'], ['او'], ['وقيل'], ['ويقال']];

const lookup = (w) => {
  if (UNITS.has(w)) return ['units', UNITS.get(w)];
  if (TENS.has(w)) return ['tens', TENS.get(w)];
  if (HUNDREDS.has(w)) return ['hundreds', HUNDREDS.get(w)];
  if (SOME.has(w)) return ['some', null];
  return null;
};

/* `joined` records a leading و ("ومائة"), which adds rather than multiplies.
   "واحد" begins with و and is itself a number, so the whole word is tried first. */
const kindOf = (word) => {
  const direct = lookup(word) ?? lookup(word.replace(/^ال/, ''));
  if (direct) return { found: direct, joined: false };
  if (!word.startsWith('و')) return null;
  const stem = word.slice(1);
  const found = lookup(stem) ?? lookup(stem.replace(/^ال/, ''));
  return found ? { found, joined: true } : null;
};

/* Reads number words from the start of `words`. "ثلاث مائة" (no و) is 300;
   "خمس ومائة" is 105. */
export const readNumber = (words) => {
  const parts = {};
  let used = 0;
  for (const word of words) {
    const kind = kindOf(word);
    if (!kind) break;
    const [slot, value] = kind.found;
    if (slot === 'hundreds' && value === 100 && !kind.joined && parts.units != null && parts.tens == null && parts.hundreds == null) {
      parts.hundreds = parts.units * 100;
      delete parts.units;
    } else if (slot === 'some') {
      if (parts.some) break;
      parts.some = true;
    } else if (parts[slot] != null) {
      break;
    } else {
      parts[slot] = value;
    }
    used += 1;
  }
  return used ? { parts, used } : null;
};

export const valueOf = (parts) => (parts.hundreds ?? 0) + (parts.tens ?? 0) + (parts.units ?? 0);

const separatorAt = (words, i) => ALT_SEPARATORS.find((sep) => sep.every((w, k) => words[i + k] === w));

/* A bare unit ("ست" in "ست أو سبع وثمانين") borrows the tens and hundreds
   of the nearest following alternative that has them, or failing that the
   nearest earlier one ("مائتين أو إحدى" is 200 or 201). */
const fill = (alts) => alts.map((p, i) => {
  if (p.tens != null || p.hundreds != null) return p;
  const donor = alts.slice(i + 1).find((q) => q.tens != null || q.hundreds != null)
    ?? alts.slice(0, i).reverse().find((q) => q.tens != null || q.hundreds != null);
  if (!donor) return p;
  const tens = donor.tens != null && donor.units != null ? donor.tens : undefined;
  const hundreds = donor.hundreds;
  return { ...p, ...(tens != null ? { tens } : {}), ...(hundreds != null ? { hundreds } : {}) };
});

export const readAlternatives = (words) => {
  const alts = [];
  let i = 0;
  for (;;) {
    const got = readNumber(words.slice(i));
    if (!got) break;
    alts.push(got.parts);
    i += got.used;
    const sep = separatorAt(words, i);
    if (sep && readNumber(words.slice(i + sep.length))) i += sep.length;
    else break;
  }
  return alts.length ? { alternatives: fill(alts), used: i } : null;
};
