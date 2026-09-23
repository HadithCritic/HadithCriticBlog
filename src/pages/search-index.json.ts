import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { cleanMarkdown, extractSections } from '../lib/search-index';

/**
 * The full-text article index SearchDialog and the /blogs search fetch on
 * demand. Built with the site, so it always matches the published articles.
 * See src/lib/search-index.ts for what it replaced.
 */

const includeBlogMakerPreview = process.env.BLOG_MAKER_PREVIEW === 'true';

export const GET: APIRoute = async () => {
  const posts = await getCollection('articles', ({ data }) => {
    if (data.preview) return includeBlogMakerPreview;
    return import.meta.env.DEV || !data.draft;
  });

  const docs = await Promise.all(
    posts.map(async (post) => {
      const { headings } = await render(post);
      const slugs = headings
        .filter((h) => h.depth === 2 && h.slug !== 'footnote-label')
        .map((h) => h.slug);
      const body = post.body ?? '';

      return {
        id: post.id,
        title: post.data.title,
        description: post.data.description,
        category: post.data.category,
        tags: post.data.tags,
        date: post.data.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        sections: extractSections(body, slugs),
        fullText: cleanMarkdown(body)
      };
    })
  );

  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
