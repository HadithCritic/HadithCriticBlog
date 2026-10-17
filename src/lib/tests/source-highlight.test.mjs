import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFragment } from 'parse5';
import { highlightSource, markedSourceParts } from '../source-highlight.ts';
import { renderArabic } from '../format-text.ts';
import { htmlText } from '../html-text.mjs';
import { quranWords } from '../article-text.ts';

test('overlapping highlights preserve source text and never match inserted markup', () => {
  const raw = 'mark class & <source> [4/148]';
  const html = highlightSource(raw, ['mark class', 'class', 'mark', 'Printed edition'], renderArabic);
  assert.equal(htmlText(html), 'mark class & <source> 4/148');
  const fragment = parseFragment(html);
  assert.equal(fragment.childNodes.filter(node => node.tagName === 'mark').length, 1);
  assert.match(html, /title="Printed edition: volume 4, page 148"/);
  assert.match(html, /&lt;source&gt;/);
  assert.doesNotMatch(html, /<source>/);
});

test('Quran highlighting includes words with attached pause marks and preserves the Arabic', () => {
  const parts = quranWords('عَلِيمٌ ۖ وَمَا');
  assert.deepEqual([...markedSourceParts(parts, ['عليم وما'], true)], [0, 1]);
  assert.deepEqual(parts, ['عَلِيمٌ ۖ', 'وَمَا']);
});

test('phrase matching handles punctuation within a word and punctuation-only parts', () => {
  const parts = '“God’s word” — is true.'.split(/(\s+)/);
  const marked = markedSourceParts(parts, ["God’s word is true"], false);
  assert.deepEqual([...marked], [0, 2, 6, 8]);
  assert.equal(highlightSource('mark mark', ['mark', '', 'mark'], renderArabic),
    '<mark class="hc-source-mark">mark</mark> <mark class="hc-source-mark">mark</mark>');
});
