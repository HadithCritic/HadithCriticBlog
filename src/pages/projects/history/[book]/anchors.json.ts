/* Where every anchor in a history now lives. The books used to be one page
   each, so an old link such as /projects/history/khalifa/#year-64-8 lands on
   the title page; its script reads this file and sends the reader on to the
   page that holds the anchor. */
import type { APIRoute } from 'astro';
import { loadBook, openBookSlugs } from '../../../../lib/history-library';

export function getStaticPaths() {
  return openBookSlugs.map((book) => ({ params: { book } }));
}

export const GET: APIRoute = async ({ params }) => {
  const book = await loadBook(String(params.book));
  return new Response(JSON.stringify(book.anchors), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
