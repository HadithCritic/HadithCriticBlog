import type { APIRoute } from 'astro';
import { SITE, NARRATOR_SITEMAP_PAGE_SIZE } from '../lib/seo';
import sitemap from '../data/narrator-sitemap.json';

/**
 * One page of the rijāl sitemap, prerendered.
 *
 * The id list is generated with the corpus by scripts/build-corpus-meta.mjs and
 * already excludes the bare stubs, narrators with no criticism and no
 * attributed hadith, for the reason given there. Order is the file's: most
 * discussed first.
 */
export function getStaticPaths() {
  const pages = Math.max(1, Math.ceil(sitemap.ids.length / NARRATOR_SITEMAP_PAGE_SIZE));
  return Array.from({ length: pages }, (_, i) => ({ params: { page: String(i + 1) } }));
}

export const GET: APIRoute = ({ params }) => {
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const offset = (page - 1) * NARRATOR_SITEMAP_PAGE_SIZE;
  const ids = sitemap.ids.slice(offset, offset + NARRATOR_SITEMAP_PAGE_SIZE);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ids
  .map((id) => `  <url><loc>${SITE.url}/narrators/${id}</loc><priority>0.6</priority></url>`)
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};
