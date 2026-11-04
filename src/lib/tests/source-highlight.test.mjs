import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFragment } from 'parse5';
import { highlightSource, markedSourceParts, sourceRuns } from '../source-highlight.ts';
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
  assert.deepEqual([...marked].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(highlightSource('mark mark', ['mark', '', 'mark'], renderArabic),
    '<mark class="hc-source-mark">mark</mark> <mark class="hc-source-mark">mark</mark>');
});

test('a highlighted phrase is one run with its spaces inside it', () => {
  const parts = 'No soul can carry the sins of another soul, and if'.split(/(\s+)/);
  const runs = sourceRuns(parts, markedSourceParts(parts, ['No soul can carry the sins of another soul'], false));
  assert.deepEqual(runs, [
    { text: 'No soul can carry the sins of another soul,', marked: true },
    { text: ' and if', marked: false },
  ]);
  const arabic = quranWords('وَلَا تَزِرُ وَازِرَةٌ وِزْرَ أُخْرَىٰ ۚ وَإِن').flatMap((word, index) => (index ? [' ', word] : [word]));
  const arabicRuns = sourceRuns(arabic, markedSourceParts(arabic, ['وَلَا تَزِرُ وَازِرَةٌ وِزْرَ أُخْرَى'], true));
  assert.equal(arabicRuns.filter((run) => run.marked).length, 1);
  assert.equal(arabicRuns.map((run) => run.text).join(''), arabic.join(''));
});

test('a second phrase list renders in its own tone and never overlaps the first', () => {
  const html = highlightSource('they call him the sabi; he is the Messenger', ['the sabi'], renderArabic, ['the Messenger', 'him the']);
  assert.equal(html,
    'they call him <mark class="hc-source-mark">the sabi</mark>; he is <mark class="hc-source-mark hc-source-mark--alt">the Messenger</mark>');
  assert.equal(htmlText(html), 'they call him the sabi; he is the Messenger');
  assert.equal(highlightSource('a b', ['a'], renderArabic), highlightSource('a b', ['a'], renderArabic, []));
});
