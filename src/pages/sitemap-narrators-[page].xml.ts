export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { SITE, NARRATOR_SITEMAP_PAGE_SIZE, narratorSitemapWhere } from '../lib/seo';

/**
 * One page of the rijal sitemap.
 *
 * Only narrators carrying real biographical substance are listed. Roughly 1,991
 * entries in the register are bare stubs with no criticism and no attributed
 * hadith; submitting those invites a thin-content assessment that would dampen
 * crawling of the whole section, so they stay out of the sitemap while
 * remaining reachable and indexable if a crawler finds them by link.
 */
export const GET: APIRoute = async ({ params }) => {
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const offset = (page - 1) * NARRATOR_SITEMAP_PAGE_SIZE;

  let ids: number[] = [];

  try {
    const rows = await env.DB.prepare(
      `SELECT id FROM narrator WHERE ${narratorSitemapWhere}
        ORDER BY statement_count DESC, id ASC LIMIT ? OFFSET ?`
    )
      .bind(NARRATOR_SITEMAP_PAGE_SIZE, offset)
      .all<{ id: number }>();
    ids = (rows.results || []).map((r) => r.id);
  } catch (error) {
    console.error(`Narrator sitemap page ${page} failed`, error);
  }

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
