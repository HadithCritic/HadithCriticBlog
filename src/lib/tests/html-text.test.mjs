import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlText, removeStyleBlocks } from '../html-text.mjs';

test('HTML text is extracted structurally, including malformed tags and comments', () => {
  assert.equal(htmlText('<p>A <b>word</b> &amp; حرف</p>'), 'A word & حرف');
  assert.equal(htmlText('before<script>alert(1)</script><style>body{}</style>after'), 'beforeafter');
  assert.equal(htmlText('before<script'), 'before');
  assert.equal(htmlText('<p title="a > b">visible</p><!-- hidden -->'), 'visible');
});

test('entities are decoded once, without interpreting decoded text as markup', () => {
  assert.equal(htmlText('&amp;quot; &amp;#39; &amp;#x41;'), '&quot; &#39; &#x41;');
  assert.equal(htmlText('&lt;img src=x onerror=alert(1)&gt;'), '<img src=x onerror=alert(1)>');
  assert.equal(htmlText('&#x110000;'), '\uFFFD');
});

test('style removal reaches a fixed point and preserves surrounding MDX', () => {
  const source = 'English عربي <style>body{}</style><b>source</b>';
  assert.equal(removeStyleBlocks(source), 'English عربي <b>source</b>');
  assert.equal(removeStyleBlocks('<<style>gone</style>style>hidden</style>visible'), 'visible');
  assert.equal(removeStyleBlocks('before<STYLE>unclosed'), 'before');
});
