/**
 * The corpus carries two inline markers that look alike and must be handled in
 * opposite ways.
 *
 *   folio markers   "[4/148]" is volume 4, page 148 of the printed edition.
 *                   Citations, so they are preserved. These were very nearly
 *                   deleted as translator chunk numbers; see format-text.ts for
 *                   the evidence that they are pagination.
 *   markdown        *emphasis* marks transliterated Arabic and Qur'anic
 *                   quotation, **strong** marks an embedded chapter heading.
 *                   Meaning, so it is rendered rather than shown raw.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toPlainText, renderRich } from '../format-text.ts';

test('folio markers survive as text', () => {
  assert.equal(toPlainText('[1/6] In the Name of Allah'), '[1/6] In the Name of Allah');
  assert.equal(toPlainText('he said [1/4] and then'), 'he said [1/4] and then');
});

test('folio markers are marked up, not hidden', () => {
  const html = renderRich('[4/148] Narrated to us');
  assert.ok(html.includes('>4/148</span> Narrated to us'), html);
  // The volume and page stay legible to a reader quoting the narration.
  assert.ok(html.includes('volume 4, page 148'), html);
});

test('removes emphasis markers but keeps the words', () => {
  assert.equal(toPlainText('declaration (*qawl*), action'), 'declaration (qawl), action');
  assert.equal(toPlainText('**Book of Faith** - Faith is'), 'Book of Faith - Faith is');
});

test('renders emphasis as markup', () => {
  assert.equal(renderRich('**Chapter: Faith**'), '<strong>Chapter: Faith</strong>');
  assert.equal(renderRich('the word *qawl* here'), 'the word <em>qawl</em> here');
});

test('escapes HTML before introducing tags', () => {
  assert.equal(renderRich('a < b & c'), 'a &lt; b &amp; c');
  assert.equal(renderRich('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
});

test('an unpaired asterisk is left alone rather than swallowing the text', () => {
  assert.equal(renderRich('2 * 3 = 6'), '2 * 3 = 6');
  assert.equal(toPlainText('a * b'), 'a * b');
});

test('emphasis does not span a paragraph break', () => {
  assert.equal(renderRich('start *one\n\ntwo* end').includes('<em>'), false);
});

test('handles null and empty input', () => {
  assert.equal(toPlainText(null), '');
  assert.equal(toPlainText(undefined), '');
  assert.equal(renderRich(''), '');
});

test('does not treat an intra-word asterisk as emphasis', () => {
  assert.equal(renderRich('al-Bukh*ari'), 'al-Bukh*ari');
});

test('a bracketed number that is not a volume/page pair is left alone', () => {
  // "[1694]" is a hadith number in several collections, not a folio.
  assert.equal(renderRich('[1694] - He said'), '[1694] - He said');
});
