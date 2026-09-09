/**
 * The index-time fold must agree with the query-time fold.
 *
 * These are two separate implementations of one rule: `arabicFoldSql` runs
 * inside SQLite when `hadith_fts` is populated, `normalizeArabic` runs in the
 * worker on whatever a reader typed. When they diverge the failure is silent —
 * no error, no empty page, just a spelling that quietly stops matching. So the
 * check runs the SQL through real SQLite rather than approximating it.
 *
 * Comparison is on tokens, not on strings, because tokens are what FTS5 matches.
 * The SQL fold deliberately leaves diacritics and punctuation to the tokeniser
 * (`unicode61 remove_diacritics 2`), so the two sides are not expected to
 * produce identical text — only identical tokens.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { arabicFoldSql } from '../arabic-fold-sql.ts';
import { normalizeArabic } from '../arabic-normalize.ts';

const db = new DatabaseSync(':memory:');
const foldInSql = (text) => {
  const stmt = db.prepare(`SELECT ${arabicFoldSql('?')} AS folded`);
  return stmt.get(text).folded;
};

/** Stand-in for unicode61 + remove_diacritics 2. */
const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const SPLIT = /[^ء-ي٠-٩a-zA-Z0-9]+/;
const tokens = (s) => s.replace(DIACRITICS, '').split(SPLIT).filter(Boolean);

const CASES = [
  'عائشة',
  'عايشة',
  'إبراهيم',
  'ابراهيم',
  'آدم',
  'معاوية',
  'معاويه',
  'العلاء',
  'العلا',
  'ٱلرحمن',
  'مؤمن',
  'صلى الله عليه وسلم',
  'حدثنا أبو بكر بن أبي شيبة قال حدثنا وكيع',
  // vowelled, so the tokeniser rather than the fold has to do the work
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  // tatweel, which neither remove_diacritics nor unicode61 would strip
  'محـــمد',
  // an embedded zero-width joiner must not split the token
  'عبد‌الله',
  'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ',
  ''
];

test('the SQL fold and normalizeArabic agree, token for token', () => {
  for (const input of CASES) {
    assert.deepEqual(
      tokens(foldInSql(input)),
      tokens(normalizeArabic(input)),
      `fold disagreed on: ${JSON.stringify(input)}`
    );
  }
});

test('the folds that make variant spellings match actually collapse', () => {
  const same = (a, b) =>
    assert.deepEqual(tokens(foldInSql(a)), tokens(foldInSql(b)), `${a} should fold to ${b}`);
  same('عائشة', 'عايشة');
  same('إبراهيم', 'ابراهيم');
  same('معاوية', 'معاويه');
  same('محـــمد', 'محمد');
});

test('tatweel and invisibles are removed rather than left as token characters', () => {
  assert.equal(foldInSql('محـــمد').includes('ـ'), false);
  assert.equal(foldInSql('عبد‌الله').includes('‌'), false);
  // Deleted, not spaced: the name stays a single token.
  assert.deepEqual(tokens(foldInSql('عبد‌الله')), ['عبدالله']);
});

test('a column reference is folded the same way as a bound value', () => {
  db.exec("CREATE TABLE t (v TEXT)");
  db.prepare('INSERT INTO t (v) VALUES (?)').run('عائشة');
  const viaColumn = db.prepare(`SELECT ${arabicFoldSql('v')} AS f FROM t`).get().f;
  assert.deepEqual(tokens(viaColumn), tokens(normalizeArabic('عائشة')));
});
