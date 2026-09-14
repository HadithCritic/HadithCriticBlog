import type { APIRoute } from 'astro';
import { SITE, NARRATOR_SITEMAP_PAGE_SIZE } from '../lib/seo';
import sitemap from '../data/narrator-sitemap.json';

/**
 * Sitemap index for the rijāl corpus.
 *
 * @astrojs/sitemap only emits prerendered routes, and the register's dossiers
 * are rendered in the browser from the static corpus, so they are invisible to
 * it. This index and its paginated children close that gap.
 *
 * Built from src/data/narrator-sitemap.json, which scripts/build-corpus-meta.mjs
 * generates alongside a corpus release. It used to be a count against a hosted
 * database on every request; the answer only changes when the corpus does, and
 * there is no database to ask any more.
 *
 * An index rather than one flat file keeps this inside the 50,000-URL limit
 * however far the corpus grows.
 */
const pages = Math.max(1, Math.ceil(sitemap.ids.length / NARRATOR_SITEMAP_PAGE_SIZE));

export const GET: APIRoute = () => {
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
