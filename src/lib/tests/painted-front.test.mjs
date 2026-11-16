import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { foldForSearch, sortEntries } from '../painted-front-filter.ts';
import { MUSNAD_ABU_HANIFA_GROUPS, groupByBook } from '../../data/hadith/musnad-abu-hanifa-groups.ts';
import { COVER_ROOT, MUSNAD_ABU_HANIFA_COVERS } from '../../data/hadith/musnad-abu-hanifa-covers.ts';

const chapters = JSON.parse(
  readFileSync(new URL('../../data/hadith/pages/musnad-abu-hanifa/chapter-index.json', import.meta.url), 'utf8')
);

test('folding drops Latin diacritics, ʿayn and hamza marks, and case', () => {
  assert.equal(foldForSearch('Shafāʿah'), 'shafaah');
  assert.equal(foldForSearch('ĪMĀN'), 'iman');
  assert.equal(foldForSearch('Walāʾ'), 'wala');
});

test('folding drops Arabic vowels and evens out alif, yaʾ and taʾ marbuta', () => {
  assert.equal(foldForSearch('كِتَابُ الصَّلَاةِ'), foldForSearch('كتاب الصلاه'));
  assert.equal(foldForSearch('الْإِيمَانِ'), 'الايمان');
  assert.equal(foldForSearch('أُمَّتِهِ'), 'امته');
});

test('every book has a painted cover, and the counts total 523', () => {
  assert.equal(MUSNAD_ABU_HANIFA_COVERS.length, chapters.length);
  assert.equal(chapters.reduce((sum, chapter) => sum + chapter.count, 0), 523);
});

test('every cover file exists at both sizes and stays under 400 KB', () => {
  const root = new URL(`../../../public${COVER_ROOT}/`, import.meta.url);
  const files = ['hero', ...MUSNAD_ABU_HANIFA_COVERS.map((cover, i) => `${String(i + 1).padStart(2, '0')}-${cover.stem}`)];
  for (const stem of files) {
    const full = new URL(`${stem}.jpg`, root);
    assert.ok(existsSync(full), `missing ${stem}.jpg`);
    assert.ok(statSync(full).size <= 400_000, `${stem}.jpg is over 400 KB`);
    const small = new URL(`${stem}-${stem === 'hero' ? 1200 : 880}.jpg`, root);
    assert.ok(existsSync(small), `missing the small copy of ${stem}`);
  }
});

test('every book is in exactly one subject', () => {
  const map = groupByBook(MUSNAD_ABU_HANIFA_GROUPS, chapters.length);
  assert.equal(map.size, chapters.length);
  assert.throws(() => groupByBook([{ id: 'a', label: 'A', books: [1, 1] }], 1), /two subjects/);
  assert.throws(() => groupByBook([{ id: 'a', label: 'A', books: [1] }], 2), /no subject/);
});

test('sorting by entries puts the largest book first and keeps book order on ties', () => {
  const books = chapters.map((chapter) => ({ n: chapter.n, size: chapter.count }));
  const bySize = sortEntries(books, 'size');
  assert.equal(bySize[0].n, 4);
  const ties = bySize.filter((book) => book.size === 3).map((book) => book.n);
  assert.deepEqual(ties, [...ties].sort((a, b) => a - b));
  assert.deepEqual(sortEntries(bySize, 'book').map((book) => book.n), chapters.map((chapter) => chapter.n));
});
