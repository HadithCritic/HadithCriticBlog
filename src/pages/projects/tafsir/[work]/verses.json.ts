/* The verses each surah of a commentary has a page for, as the surah and verse
   switcher loads them when the reader picks another surah. One static file per
   work: { "2": { "r": [[1, 5], [7, 7]], "g": true } }. */
import type { APIRoute } from 'astro';
import { libraryWorks } from '../../../../data/tafsir-library';
import { verseIndex } from '../../../../lib/tafsir-verse-index';

export function getStaticPaths(): { params: { work: string } }[] {
  return libraryWorks.map((work) => ({ params: { work: work.id } }));
}

export const GET: APIRoute = ({ params }) => {
  const index = verseIndex(params.work ?? '');
  const body = Object.fromEntries([...index].map(([n, s]) => [n, { r: s.ranges, ...(s.general ? { g: true } : {}) }]));
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
