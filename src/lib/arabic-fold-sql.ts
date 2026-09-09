/**
 * The Arabic fold, expressed as a SQLite expression.
 *
 * This is the index-time half of a pair. `normalizeArabic` in
 * ./arabic-normalize.ts folds a reader's query; this folds the corpus as it is
 * inserted into `hadith_fts`. If the two ever disagree, nothing errors and no
 * test fails on its own — results simply stop appearing for spellings that used
 * to match. `arabic-fold-sql.test.mjs` runs both through real SQLite and
 * compares them, which is the only thing standing between a small edit here and
 * silent recall loss.
 *
 * Why the index is built in SQL at all: the alternative was a `hadith_search`
 * table holding a pre-folded copy of the corpus, which is what migration 0004
 * originally did. That copy costs about 468 MB, and the database is at 1.74 GB
 * against a 2 GB ceiling. Folding inside `INSERT ... SELECT` keeps the narration
 * text out of the statement text entirely (so D1's 100 KB statement limit stops
 * applying, which is what truncated 67 narrations under migration 0003) while
 * storing nothing twice.
 *
 * What this deliberately does not reproduce:
 *
 *   NFKC          Not expressible in SQLite. It rewrites 2,073 of the corpus's
 *                 812,587 Arabic values, so it was measured rather than waved
 *                 through: compared as tokens, the two folds agree on every one
 *                 of those 2,073 values. NFKC here only touches characters the
 *                 tokeniser discards regardless.
 *   diacritics    `tokenize='unicode61 remove_diacritics 2'` already strips
 *                 combining marks on both the indexed text and the query.
 *   punctuation   unicode61 splits on it, which is the same outcome as folding
 *                 it to a space.
 *
 * Tatweel and the invisible marks are *not* covered by either of those, so they
 * are handled here: tatweel is a modifier letter the tokeniser would keep inside
 * a token, and the zero-width marks would split one token into two.
 */

/** The nine orthographic folds, plus tatweel. Mirrors LETTER_MAP exactly. */
const LETTER_FOLDS: ReadonlyArray<readonly [string, string]> = [
  ['آ', 'ا'], // آ -> ا
  ['أ', 'ا'], // أ -> ا
  ['إ', 'ا'], // إ -> ا
  ['ٱ', 'ا'], // ٱ -> ا
  ['ة', 'ه'], // ة -> ه
  ['ى', 'ي'], // ى -> ي
  ['ؤ', 'و'], // ؤ -> و
  ['ئ', 'ي'], // ئ -> ي
  ['ء', ''], // ء dropped, matching the source catalogue
  ['ـ', ''] // tatweel: a modifier letter, so the tokeniser would keep it
];

/**
 * Zero-width and directional marks. Deleted rather than folded to a space, for
 * the same reason as in normalizeArabic: a name with an embedded ZWNJ must stay
 * one token.
 */
const INVISIBLES: readonly string[] = [
  '​', '‌', '‍', '‎', '‏',
  '‪', '‫', '‬', '‭', '‮',
  '⁠', '﻿'
];

/**
 * Wrap `column` in the replace() chain that folds it.
 *
 * The result is an expression, not a statement: substitute it into a SELECT
 * list. It contains no user input and no string literals drawn from data, only
 * the fixed character constants above.
 */
export function arabicFoldSql(column: string): string {
  let expression = column;
  for (const [from, to] of LETTER_FOLDS) {
    expression = `replace(${expression},'${from}','${to}')`;
  }
  for (const mark of INVISIBLES) {
    // char() rather than a literal: several of these are invisible in a source
    // file, and one stray edit to a raw character would be undetectable.
    expression = `replace(${expression},char(${mark.codePointAt(0)}),'')`;
  }
  return expression;
}
