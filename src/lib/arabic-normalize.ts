/**
 * Arabic normalisation for search.
 *
 * This is a port of `normalize_arabic` from the silsilah tooling, which was
 * validated against all 20,957 rows of the source catalogue's own `display_norm`
 * column and reproduces it exactly. The index in D1 was built with that Python
 * function; this file has to agree with it character for character, or queries
 * stop matching what was indexed. `npm run test:normalize` checks the fixtures.
 *
 * Why it exists at all: FTS5's `remove_diacritics 2` handles tashkil, so an
 * unvowelled query already matches vowelled text. It does nothing about
 * orthographic variation, which in this corpus is pervasive — the same name is
 * spelled عائشة and عايشة, إبراهيم and ابراهيم, معاوية and معاويه. Folding those
 * roughly doubles recall on personal names.
 *
 * The fold is deliberately lossy in one direction that matters: standalone
 * hamza is dropped rather than mapped, so العلاء and العلا agree. That follows
 * the source catalogue's convention rather than a general Arabic NLP rule.
 */

/** Harakat, superscript alif, Qur'anic marks, and the tatweel elongation. */
const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/**
 * Zero-width and directional marks. Deleted outright rather than folded to a
 * space: the catalogue contains names with an embedded ZWNJ, and turning it
 * into a space would split one token into two.
 */
const INVISIBLE = /[​-‏‪-‮⁠﻿]/g;

/** Anything that is not an Arabic letter, an Arabic-Indic digit, or ASCII alphanumeric. */
const PUNCT = /[^ء-ي٠-٩a-zA-Z0-9 ]/g;

const SPACES = /\s+/g;

/** Orthographic folds. Order is irrelevant; each source character maps once. */
const LETTER_MAP: Record<string, string> = {
  'آ': 'ا', // آ -> ا
  'أ': 'ا', // أ -> ا
  'إ': 'ا', // إ -> ا
  'ٱ': 'ا', // ٱ -> ا
  'ة': 'ه', // ة -> ه
  'ى': 'ي', // ى -> ي
  'ؤ': 'و', // ؤ -> و
  'ئ': 'ي', // ئ -> ي
  'ء': '' // ء dropped entirely, matching the catalogue
};

const LETTER_RE = new RegExp(`[${Object.keys(LETTER_MAP).join('')}]`, 'g');

/** Reduce Arabic text to the canonical form held in the search index. */
export function normalizeArabic(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .replace(INVISIBLE, '')
    .replace(DIACRITICS, '')
    .replace(LETTER_RE, (c) => LETTER_MAP[c])
    .replace(PUNCT, ' ')
    .replace(SPACES, ' ')
    .trim();
}

/** True when the string carries any Arabic letter. */
export function hasArabic(text: string): boolean {
  return /[ء-ي]/.test(text);
}

/** Characters FTS5 reads as operators, which must never reach it from a reader. */
const FTS_SPECIAL = /["*()^:{}[\]]/g;

export type SearchScope = 'all' | 'matn' | 'arabic' | 'english';

const SCOPE_COLUMNS: Record<SearchScope, readonly string[]> = {
  all: ['ar_text', 'ar_matn', 'en_text', 'en_matn', 'chapter_en'],
  matn: ['ar_matn', 'en_matn'],
  arabic: ['ar_text', 'ar_matn'],
  english: ['en_text', 'en_matn', 'chapter_en']
};

/**
 * Turn a reader's query into an FTS5 MATCH expression.
 *
 * Each token is normalised on its own, so a query mixing scripts works: Arabic
 * words get the orthographic fold, Latin words are lowercased and left alone
 * because the tokenizer already case-folds them.
 *
 * Throws on a query that normalises to nothing — a caller should treat that as
 * an empty search rather than send bare `MATCH ''` to SQLite.
 */
export function buildMatch(query: string, scope: SearchScope = 'all', phrase = false): string {
  const cleaned = query.replace(FTS_SPECIAL, ' ').trim();
  if (!cleaned) throw new Error('empty query');

  const tokens = cleaned
    .split(/\s+/)
    .map((raw) => (hasArabic(raw) ? normalizeArabic(raw) : raw.toLowerCase()))
    // A token has to carry something searchable. Arabic punctuation such as ،
    // sits outside the ء-ي letter range, so it survives normalisation as-is and
    // would otherwise reach FTS5 as a term that can never match.
    .filter((t) => /[ء-ي٠-٩a-z0-9]/.test(t));

  if (!tokens.length) throw new Error('query normalized to nothing');

  const body = phrase
    ? `"${tokens.join(' ')}"`
    : tokens.map((t) => `"${t}"`).join(' AND ');

  return SCOPE_COLUMNS[scope].map((col) => `${col} : ${body}`).join(' OR ');
}

/**
 * Turn a reader's query into a MATCH expression for the narrator register.
 *
 * Separate from `buildMatch` because the two indexes answer different
 * questions. The corpus index ranks prose by relevance across five weighted
 * columns; the register index is a single column of names and is only ever a
 * filter, since the register orders by whatever the reader picked — id, name,
 * death year, hadith count — and never by score.
 *
 * Every token becomes a prefix term. That is what keeps the index usable as
 * someone types: "mali" has to find Malik. It is also the one place this is
 * narrower than the `LIKE '%q%'` it replaced, which matched inside words too
 * and so found "somali" for "mali". For names, prefix is the expectation.
 *
 * Arabic tokens get the same orthographic fold the index was built with, which
 * is a recall gain rather than a change: the register previously held the
 * Arabic unfolded, so عايشه matched nobody at all.
 *
 * Throws on a query that normalizes to nothing, so a caller can treat it as an
 * empty search rather than send bare `MATCH ''` to SQLite.
 */
export function buildNarratorMatch(query: string): string {
  const cleaned = query.replace(FTS_SPECIAL, ' ').trim();
  if (!cleaned) throw new Error('empty query');

  const tokens = cleaned
    .split(/\s+/)
    .map((raw) => (hasArabic(raw) ? normalizeArabic(raw) : raw.toLowerCase()))
    // Same guard as buildMatch: Arabic punctuation survives the fold and would
    // otherwise reach FTS5 as a term that can never match.
    .filter((t) => /[ء-ي٠-٩a-z0-9]/.test(t));

  if (!tokens.length) throw new Error('query normalized to nothing');

  // `"term" *` is not prefix syntax; `"term"*` is. Quoted so a token carrying
  // a hyphen or an apostrophe cannot be read as an operator.
  return tokens.map((t) => `"${t}"*`).join(' AND ');
}
