/**
 * Parity test for the Arabic normaliser.
 *
 * The D1 search index was built by the Python `normalize_arabic` in the
 * silsilah tooling. If this TypeScript port ever drifts from it, queries stop
 * matching the indexed text and search degrades silently — no error, just
 * missing results. So the fixtures are 1,313 real strings pulled from the
 * corpus itself (narrator names, matns, chapter headings, subject labels,
 * chain surfaces) with the output Python produced for each.
 *
 * Regenerate with the snippet in scripts/export-hadith-d1.py if the normaliser
 * ever changes on purpose.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { normalizeArabic, buildMatch, hasArabic } from '../arabic-normalize.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(
  readFileSync(join(here, '../../../tests/fixtures-normalize.json'), 'utf8')
);

test('matches the Python normaliser that built the index', () => {
  let checked = 0;
  const drift = [];
  for (const { in: input, out: expected } of fixtures) {
    const actual = normalizeArabic(input);
    if (actual !== expected) drift.push({ input, expected, actual });
    checked += 1;
  }
  assert.equal(
    drift.length,
    0,
    `${drift.length} of ${checked} strings normalise differently. First: ` +
      JSON.stringify(drift[0])
  );
  assert.ok(checked > 1000, 'fixture set should be substantial');
});

test('folds the orthographic variants that motivate it', () => {
  const pairs = [
    ['عائشة', 'عايشة'],
    ['إبراهيم', 'ابراهيم'],
    ['معاوية', 'معاويه'],
    ['العلاء', 'العلا'],
    ['آدم', 'ادم']
  ];
  for (const [a, b] of pairs) {
    assert.equal(normalizeArabic(a), normalizeArabic(b), `${a} should fold to ${b}`);
  }
});

test('strips diacritics without eating letters', () => {
  // A malformed character class here once reduced 59 characters to 7 by
  // swallowing the alphabet, so this asserts the letters survive.
  const vowelled = 'قَمِيصُهُ وَجُدِعَ بَعِيرُهُ';
  const bare = normalizeArabic(vowelled);
  assert.equal(bare, 'قميصه وجدع بعيره');
  assert.ok(bare.length > vowelled.length / 3, 'letters must survive the fold');
});

test('detects Arabic script', () => {
  assert.ok(hasArabic('عائشة'));
  assert.ok(hasArabic('mixed عائشة text'));
  assert.ok(!hasArabic('plain english'));
});

test('builds MATCH expressions across scopes', () => {
  const m = buildMatch('عائشة', 'arabic');
  assert.match(m, /ar_text : "عايشه"/);
  assert.match(m, /ar_matn : "عايشه"/);
  assert.ok(!m.includes('en_text'), 'arabic scope should not query English columns');

  const en = buildMatch('intention', 'english');
  assert.match(en, /en_text : "intention"/);

  const phrase = buildMatch('actions are by intentions', 'english', true);
  assert.match(phrase, /"actions are by intentions"/);

  const multi = buildMatch('prayer fasting', 'english');
  assert.match(multi, /"prayer" AND "fasting"/);
});

test('neutralises FTS5 operators from reader input', () => {
  const m = buildMatch('prayer* OR "injection(', 'english');
  assert.ok(!m.includes('*'), 'star must not reach FTS5');
  assert.ok(!m.includes('('), 'paren must not reach FTS5');
});

test('rejects queries that normalise to nothing', () => {
  assert.throws(() => buildMatch('   ', 'all'));
  assert.throws(() => buildMatch('،،،', 'all'));
});
