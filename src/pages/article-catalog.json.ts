import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * The title-level article catalog SearchDialog searches while the full-text
 * /search-index.json is still loading.
 *
 * It used to be inlined into every page by SearchDialog, which put 44 KB of
 * JSON on each of the 2,400 pages and, because BaseLayout also renders the
 * on-demand /hadith/[id] and /narrators/[id] shells, bundled the whole content
 * layer (every article and the Qur'an text) into the Worker. As a prerendered
 * file it is fetched once and cached.
 */
export const GET: APIRoute = async () => {
  const articles = await getCollection('articles', ({ data }) => import.meta.env.DEV || !data.draft);
  const catalog = articles.map((article) => {
    const d = article.data.date ? new Date(article.data.date) : null;
    const formattedDate = d && !isNaN(d.getTime())
      ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';

    return {
      url: `/blogs/${article.id}/`,
      title: article.data.title,
      description: article.data.description || '',
      category: article.data.category,
      tags: article.data.tags || [],
      date: formattedDate
    };
  });

  return new Response(JSON.stringify(catalog), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
