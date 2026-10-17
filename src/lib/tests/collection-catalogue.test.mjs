import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chronologicalCollections, COMPILER_DATES } from '../collection-catalogue.ts';

const metadata = JSON.parse(readFileSync(new URL('../../data/corpus-meta.json', import.meta.url), 'utf8'));

test('every released compilation has a chronological position without changing corpus metadata', () => {
  const before = JSON.stringify(metadata.collections);
  for (const book of metadata.collections) assert.ok(Number.isInteger(COMPILER_DATES[book.slug]), `Missing compiler date: ${book.slug}`);
  const sorted = chronologicalCollections(metadata.collections);
  assert.equal(JSON.stringify(metadata.collections), before);
  assert.equal(sorted.length, metadata.collections.length);
  assert.deepEqual(new Set(sorted.map(book => book.id)), new Set(metadata.collections.map(book => book.id)));
  assert.ok(sorted.every((book, i) => i === 0 || COMPILER_DATES[book.slug] >= COMPILER_DATES[sorted[i - 1].slug]));
});

test('the catalogue starts with Malik, ends with Ibn Hajar, and keeps each compiler together', () => {
  // The release fixture is a subset, so assert these endpoints only when present.
  const sorted = chronologicalCollections(metadata.collections);
  if (sorted.some(book => book.slug === 'muwatta-malik')) assert.equal(sorted[0].slug, 'muwatta-malik');
  if (sorted.some(book => book.slug === 'al-matalib-al-aliyah')) assert.equal(sorted.at(-1).slug, 'al-matalib-al-aliyah');
  for (const slugs of [
    ['sunan-abi-dawud', 'al-marasil-li-abi-dawud'],
    ['jami-al-tirmidhi', 'al-shama-il-al-muhammadiyah'],
    ['sunan-al-nasa-i', 'al-sunan-al-kubra'],
    ['al-mu-jam-al-kabir', 'al-mu-jam-al-awsat', 'al-mu-jam-al-saghir'],
  ]) {
    const positions = slugs.map(slug => sorted.findIndex(book => book.slug === slug)).filter(i => i >= 0).sort((a, b) => a - b);
    if (positions.length > 1) assert.equal(positions.at(-1) - positions[0], positions.length - 1);
  }
});
