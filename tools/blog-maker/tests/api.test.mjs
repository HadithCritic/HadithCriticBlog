import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createApp } from '../lib/app.mjs';

const SVG_1X1 = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#d8b166"/></svg>'
).toString('base64')}`;

test('API saves drafts, uploads images, previews, publishes, and rejects duplicate slugs', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-maker-'));
  const app = createApp({
    root,
    apiOrigin: 'http://127.0.0.1:8787',
    astroOrigin: 'http://127.0.0.1:4321',
  });
  const server = await listen(app);
  const base = `http://127.0.0.1:${server.address().port}/api`;

  try {
    const created = await json(base, '/drafts', {
      method: 'POST',
      body: {
        meta: {
          title: 'Local Publish Test',
          category: 'History',
        },
      },
    });
    const draft = created.draft;

    const uploaded = await json(base, `/drafts/${draft.id}/assets`, {
      method: 'POST',
      body: {
        fileName: 'thumbnail.png',
        purpose: 'thumbnail',
        dataUrl: SVG_1X1,
      },
    });

    draft.meta = {
      ...draft.meta,
      title: 'Local Publish Test',
      slug: 'local-publish-test',
      description: 'A private draft becomes a public article.',
      date: '2026-06-11T16:00:00.000Z',
      category: 'History',
      thumbnail: uploaded.asset.src,
      heroAlt: 'Generated thumbnail',
      readingTime: '4 min read',
    };
    draft.content = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'A local heading' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'A local body.' }] },
        { type: 'image', attrs: { src: uploaded.asset.src, alt: 'Inline copy' } },
      ],
    };

    await json(base, `/drafts/${draft.id}`, { method: 'PUT', body: draft });
    const preview = await json(base, `/drafts/${draft.id}/preview`, { method: 'POST', body: {} });

    const previewFile = path.join(root, 'src', 'content', 'articles', '_preview-local-publish-test.mdx');
    assert.equal(preview.url, 'http://127.0.0.1:4321/blogs/_preview-local-publish-test');
    assert.match(await fs.readFile(previewFile, 'utf8'), /preview: true/);

    const published = await json(base, `/drafts/${draft.id}/publish`, { method: 'POST', body: {} });
    const articleFile = path.join(root, 'src', 'content', 'articles', 'local-publish-test.mdx');
    const article = await fs.readFile(articleFile, 'utf8');

    assert.equal(published.url, '/blogs/local-publish-test');
    assert.match(article, /thumbnail: \/images\/blog-maker\/local-publish-test\//);
    assert.match(article, /!\[Inline copy\]\(\/images\/blog-maker\/local-publish-test\//);

    const duplicate = await fetch(`${base}/drafts/${draft.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(duplicate.status, 409);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(root, { recursive: true, force: true });
  }
});

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function json(base, pathname, init = {}) {
  const response = await fetch(`${base}${pathname}`, {
    method: init.method ?? 'GET',
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  assert.equal(response.ok, true, data.errors?.join('\n') || response.statusText);
  return data;
}
