import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNewArticleEmail } from '../new-article.mjs';

test('builds the subject from the article title', () => {
  const result = buildNewArticleEmail({
    title: 'The People of the Canyon',
    description: 'A case for the Valley of Hinnom.',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-the-people-of-the-canyon',
  });
  assert.equal(result.subject, 'New on HadithCritic: The People of the Canyon');
});

test('includes the thumbnail image when provided', () => {
  const result = buildNewArticleEmail({
    title: 'Title',
    description: 'Description',
    thumbnail: 'https://hadithcriticblog.com/images/blog_thumbnails/tn.81.webp',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x',
  });
  assert.match(result.html, /<img src="https:\/\/hadithcriticblog\.com\/images\/blog_thumbnails\/tn\.81\.webp"/);
});

test('omits the thumbnail image when not provided', () => {
  const result = buildNewArticleEmail({
    title: 'Title',
    description: 'Description',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x',
  });
  assert.doesNotMatch(result.html, /<img/);
});

test('includes the Resend unsubscribe template variable in html and text', () => {
  const result = buildNewArticleEmail({
    title: 'Title',
    description: 'Description',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x',
  });
  assert.match(result.html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
  assert.match(result.text, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
});

test('includes the canonical link in html and text', () => {
  const url = 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x';
  const result = buildNewArticleEmail({ title: 'Title', description: 'Description', canonicalUrl: url });
  assert.ok(result.html.includes(url));
  assert.ok(result.text.includes(url));
});
