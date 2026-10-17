import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  plainLength,
  formatDuration,
  formatViews,
  postDateFromUrl,
  quranWords,
  isArabicOnly
} from '../article-text.ts';

test('plainLength counts visible characters, not markup', () => {
  assert.equal(plainLength('<p>Two <strong>words</strong></p>'), 9);
  assert.equal(plainLength('  a \n\n  b  '), 3);
  assert.equal(plainLength('&amp;'), 1);
  assert.equal(plainLength(''), 0);
});

test('formatDuration prints minutes and seconds, with hours when needed', () => {
  assert.equal(formatDuration(1812), '30:12');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(3725), '1:02:05');
  assert.equal(formatDuration(undefined), '');
  assert.equal(formatDuration(-4), '');
});

test('formatViews abbreviates thousands and millions', () => {
  assert.equal(formatViews(950), '950 views');
  assert.equal(formatViews(1), '1 view');
  assert.equal(formatViews(2725), '2.7K views');
  assert.equal(formatViews(14000), '14K views');
  assert.equal(formatViews(1250000), '1.3M views');
  assert.equal(formatViews(undefined), '');
});

test('postDateFromUrl reads the date out of an X status id', () => {
  assert.equal(postDateFromUrl('https://x.com/HadithCritic/status/1758711719742869716'), 'Feb 17, 2024');
  assert.equal(postDateFromUrl('https://x.com/HadithCritic'), '');
  assert.equal(postDateFromUrl('not a url'), '');
});

test('quranWords keeps pause marks with the word before them', () => {
  assert.deepEqual(quranWords('قُلْ هُوَ ٱللَّهُ أَحَدٌ'), ['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ']);
  assert.deepEqual(quranWords('عَلِيمٌ ۖ وَمَا'), ['عَلِيمٌ ۖ', 'وَمَا']);
  assert.deepEqual(quranWords('  '), []);
});

test('isArabicOnly accepts Arabic with punctuation, rejects Latin prose', () => {
  assert.equal(isArabicOnly('كَذَبَتْ بَنُو الزَّرْقَاءِ، هُمْ مُلُوكٌ'), true);
  assert.equal(isArabicOnly('The Prophet said: كذا'), false);
  assert.equal(isArabicOnly(''), false);
});
