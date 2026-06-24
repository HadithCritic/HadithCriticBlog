import type { APIRoute } from 'astro';
import { query, resolveCollectionSlug } from '../../lib/silsilah-db';

export const prerender = false;

// Arabic search normalization — MUST match the indexed `ar_norm` column produced by
// scripts/build_silsilah_db.py (marks/harakat/superscript-alef/Quranic-signs/tatweel stripped;
// alef/ya/waw/ta-marbuta folded). Keeps letters U+0621-064A.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/g;
function normAr(s: string): string {
  return s
    .replace(MARKS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه');
}
const hasArabic = (s: string): boolean => /[؀-ۿ]/.test(s);

// strip FTS5 operators so user input can't break the MATCH grammar
function ftsTokens(s: string): string[] {
  return s.replace(/["*():^\-]/g, ' ').split(/\s+/).map((t) => t.trim()).filter(Boolean);
}
function buildMatch(col: string, raw: string): string | null {
  const toks = ftsTokens(raw);
  if (!toks.length) return null;
  // Treat the entire query as an exact phrase match, with prefix search on the last word
  return `${col} : "${toks.join(' ')}"*`;
}
function json(o: unknown, maxAge = 60): Response {
  return new Response(JSON.stringify(o), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${maxAge}` }
  });
}

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') || '').trim();
  const collection = resolveCollectionSlug(url.searchParams.get('collection'));
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 50);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
  if (q.length < 2) return json({ results: [], hasMore: false });

  // Direct reference jump: "bukhari:2487", "sahih-al-bukhari 1", etc.
  const refm = q.toLowerCase().match(/^([a-z][a-z0-9-]*)[\s:\/]+([0-9][\w-]*)$/);
  if (refm) {
    const rows = await query(
      `SELECT ref, collection_slug, collection_en, book_slug, number, kitab_en, bab_en, kitab, bab,
              text, text_en, substr(text_en, 1, 240) AS excerpt
       FROM hadith WHERE collection_slug = ? AND number = ? LIMIT 1`,
      [resolveCollectionSlug(refm[1]), refm[2]]
    );
    if (rows.length) return json({ ref: true, results: rows, hasMore: false });
  }

  const ar = hasArabic(q);
  const match = buildMatch(ar ? 'ar_norm' : 'text_en', ar ? normAr(q) : q);
  if (!match) return json({ results: [], hasMore: false });
  const snipCol = ar ? 1 : 0; // 0 = text_en, 1 = ar_norm (FTS column order)

  const where = collection ? 'hadith_fts MATCH ? AND h.collection_slug = ?' : 'hadith_fts MATCH ?';
  const sql =
    `SELECT h.ref, h.collection_slug, h.collection_en, h.book_slug, h.number, h.kitab_en, h.bab_en, h.kitab, h.bab,
            h.text, h.text_en,
            snippet(hadith_fts, ${snipCol}, '<mark>', '</mark>', ' … ', 12) AS excerpt
     FROM hadith_fts JOIN hadith h ON h.id = hadith_fts.rowid
     WHERE ${where} ORDER BY rank LIMIT ? OFFSET ?`;
  const args = collection ? [match, collection, limit + 1, offset] : [match, limit + 1, offset];

  try {
    const results = await query(sql, args);
    return json({ results: results.slice(0, limit), hasMore: results.length > limit });
  } catch (err) {
    return json({ results: [], hasMore: false, error: 'search_failed' }, 0);
  }
};
