import assert from 'node:assert/strict';
import test from 'node:test';

import { serializeDraftToMdx } from '../lib/serializer.mjs';

test('serializes frontmatter, rich blocks, custom components, and escaped MDX text', () => {
  const draft = {
    id: 'draft-1',
    meta: {
      title: 'A Test {Article}',
      slug: 'a-test-article',
      description: 'A short preview with {braces}.',
      date: '2026-06-11T12:00:00.000Z',
      category: 'History',
      tags: ['isnad', 'method'],
      thumbnail: '/api/uploads/draft-1/thumb.webp',
      heroAlt: 'Manuscript page',
      readingTime: '8 min read',
      author: 'HadithCritic',
    },
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Opening Claim' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This has ' },
            { type: 'text', text: 'emphasis', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' and {braces}.' },
          ],
        },
        {
          type: 'image',
          attrs: {
            src: '/api/uploads/draft-1/body.webp',
            alt: 'Body image',
          },
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Source' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Verdict' }] }] },
              ],
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Weak' }] }] },
              ],
            },
          ],
        },
        {
          type: 'hadithBlock',
          attrs: {
            label: 'Report',
            arabic: 'قال',
            translation: 'He said "{test}"',
            source: 'Example source',
          },
        },
        {
          type: 'claimBox',
          attrs: {
            title: 'Core Claim',
            text: 'The claim uses {careful} wording.',
          },
        },
        {
          type: 'quranVerse',
          attrs: {
            verse: '49:6',
            label: '',
          },
        },
      ],
    },
  };

  const result = serializeDraftToMdx(draft, {
    thumbnailResolver: (src) => src.replace('/api/uploads', '/images/blog-maker'),
    assetResolver: (src) => src.replace('/api/uploads', '/images/blog-maker'),
  });

  assert.match(result.mdx, /title: A Test \{Article\}/);
  assert.match(result.mdx, /thumbnail: \/images\/blog-maker\/draft-1\/thumb\.webp/);
  assert.match(result.mdx, /import HadithBlock/);
  assert.match(result.mdx, /import ClaimBox/);
  assert.match(result.mdx, /import QuranVerse/);
  assert.doesNotMatch(result.mdx, /import ContextNote/);
  assert.match(result.mdx, /This has \*\*emphasis\*\* and &#123;braces&#125;\./);
  assert.match(result.mdx, /!\[Body image\]\(\/images\/blog-maker\/draft-1\/body\.webp\)/);
  assert.match(result.mdx, /\| Source \| Verdict \|/);
  assert.match(result.mdx, /translation="He said &quot;&#123;test&#125;&quot;"/);
  assert.match(result.mdx, /The claim uses &#123;careful&#125; wording\./);
  assert.match(result.mdx, /<QuranVerse verse="49:6" \/>/);
});

