import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chronologicalCollections, COMPILER_DATES } from '../collection-catalogue.ts';

const editions = JSON.parse(readFileSync(new URL('../../data/reader-editions.json', import.meta.url), 'utf8'));
const library = [{ slug: 'al-shama-il-al-muhammadiyah' }, ...editions].map((edition, index) => ({ id: index + 1, slug: edition.slug }));
// Birr al-Walidayn is dated by al-Bukhari's death, as on the /hadith cards.
const dateOf = (slug) => COMPILER_DATES[slug === 'birr-al-walidayn' ? 'sahih-al-bukhari' : slug];

test('every library collection has a compiler date', () => {
  for (const book of library) assert.ok(Number.isInteger(dateOf(book.slug)), `Missing compiler date: ${book.slug}`);
});

test('sorting returns a copy in compiler-date order', () => {
  const before = JSON.stringify(library);
  const sorted = chronologicalCollections(library);
  assert.equal(JSON.stringify(library), before);
  assert.equal(sorted.length, library.length);
  assert.deepEqual(new Set(sorted.map(book => book.id)), new Set(library.map(book => book.id)));
  const dated = sorted.filter(book => Number.isInteger(COMPILER_DATES[book.slug]));
  assert.ok(dated.every((book, i) => i === 0 || COMPILER_DATES[book.slug] >= COMPILER_DATES[dated[i - 1].slug]));
});
