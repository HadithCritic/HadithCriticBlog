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

test('every painted 3rd-century collection groups each chapter once and has a plate for it', async () => {
  const { PAINTED_COLLECTIONS, groupsBySize } = await import('../../data/hadith/painted-collections.ts');
  const meta = JSON.parse(readFileSync(new URL('../../data/hadith/chapter-cover-meta.json', import.meta.url), 'utf8'));
  for (const [slug, config] of Object.entries(PAINTED_COLLECTIONS)) {
    const index = JSON.parse(readFileSync(new URL(`../../data/hadith/pages/${slug}/chapter-index.json`, import.meta.url), 'utf8'));
    const numbers = index.map((chapter) => chapter.n);
    const groups = config.groups === 'by-size' ? groupsBySize(index) : config.groups;
    assert.equal(groupByBook(groups, numbers).size, numbers.length, slug);
    assert.deepEqual(meta[slug].map((plate) => plate.n), numbers, `${slug}: plates out of step with the chapters`);
    for (const n of numbers) {
      const plate = new URL(`../../../public/images/hadith/chapter-covers/${slug}/${String(n).padStart(2, '0')}.webp`, import.meta.url);
      assert.ok(existsSync(plate), `${slug}: missing plate ${n}`);
    }
    assert.ok(existsSync(new URL(`../../../public/images/hadith/covers/${slug}.webp`, import.meta.url)), `${slug}: missing hero`);
  }
});

test('a group list may skip book numbers the collection does not have', () => {
  const groups = [{ id: 'a', label: 'A', books: [1, 3] }];
  assert.equal(groupByBook(groups, [1, 3]).size, 2);
  assert.throws(() => groupByBook(groups, [1, 2, 3]), /no subject/);
  assert.throws(() => groupByBook(groups, [1]), /not in the collection/);
});
