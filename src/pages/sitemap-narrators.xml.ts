export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { SITE, NARRATOR_SITEMAP_PAGE_SIZE, narratorSitemapWhere } from '../lib/seo';

/**
 * Sitemap index for the rijal corpus.
 *
 * @astrojs/sitemap only emits prerendered routes, so the entire narrator
 * register (rendered on demand from D1) was invisible to crawlers. This index
 * and its paginated children close that gap.
 *
 * Serving an index rather than one flat file keeps us inside the 50,000-URL
 * limit no matter how far the corpus grows.
 */
export const GET: APIRoute = async () => {
  let pages = 1;

  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM narrator WHERE ${narratorSitemapWhere}`
    ).first<{ n: number }>();
    pages = Math.max(1, Math.ceil((row?.n ?? 0) / NARRATOR_SITEMAP_PAGE_SIZE));
  } catch (error) {
    // An unseeded or unreachable D1 must not produce a 500 here: a broken
    // sitemap teaches crawlers to stop asking. An index with one empty child
    // is a truthful "nothing to list yet".
    console.error('Narrator sitemap index failed', error);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(
  { length: pages },
  (_, i) => `  <sitemap><loc>${SITE.url}/sitemap-narrators-${i + 1}.xml</loc></sitemap>`
).join('\n')}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};
