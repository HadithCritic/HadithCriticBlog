export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { buildMatch, type SearchScope } from '../../lib/arabic-normalize';
import { makeSnippet } from '../../lib/snippet';
import { toPlainText } from '../../lib/format-text';
import { boundedCountSql, pageCount, readCount } from '../../lib/corpus-count';

/**
 * Hadith search endpoint.
 *
 * Follows the same shape as /api/narrators: filtering, sorting and pagination
 * happen in SQL, a page of results is a few KB, and nothing from the query
 * string is interpolated — values are bound, keys are allow-listed.
 *
 * The Arabic query is folded by the same normaliser that built the FTS index
 * (src/lib/arabic-normalize.ts, parity-tested against the Python that wrote it).
 * Skipping that fold does not error; it silently halves recall on names, which
 * is the failure mode this endpoint exists to avoid.
 *
 * No authenticity filter is offered because no grading is stored. That is the
 * point of the corpus, not an omission.
 */

const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

const SCOPES = new Set<SearchScope>(['all', 'matn', 'arabic', 'english']);

// bm25 weights, per FTS column: ar_text, ar_matn, en_text, en_matn, chapter_en.
// The matn columns are weighted double — a hit in the prophetic core is more
// interesting than one anywhere in the chain, which is mostly names.
const BM25 = 'bm25(hadith_fts, 1.0, 2.0, 1.0, 2.0, 0.5)';

const SORTS: Record<string, string> = {
  relevance: `${BM25} ASC`,
  id: 'h.id ASC',
  'id-desc': 'h.id DESC',
  book: 'b.title_en ASC, h.id ASC',
  parallels: 'h.parallel_count DESC, h.id ASC'
};

const json = (body: unknown, status = 200, cache = 'public, max-age=300') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache }
  });

export const GET: APIRoute = async ({ url }) => {
  const p = url.searchParams;
  const rawQuery = (p.get('q') || '').trim();

  const scopeParam = (p.get('scope') || 'all') as SearchScope;
  const scope: SearchScope = SCOPES.has(scopeParam) ? scopeParam : 'all';
  const phrase = p.get('phrase') === '1';

  const where: string[] = [];
  const binds: unknown[] = [];
  let joinFts = false;

  if (rawQuery) {
    let match: string;
    try {
      match = buildMatch(rawQuery, scope, phrase);
    } catch {
      // A query of only punctuation or operators normalises away. An empty
      // result set is the honest answer; MATCH '' would be a 500.
      return json({ total: 0, page: 1, size: DEFAULT_PAGE_SIZE, pages: 1, results: [] });
    }
    joinFts = true;
    where.push('hadith_fts MATCH ?');
    binds.push(match);
  }

  const book = parseInt(p.get('book') || '', 10);
  if (Number.isFinite(book) && book > 0) {
    where.push('h.book_id = ?');
    binds.push(book);
  }

  const narrator = parseInt(p.get('narrator') || '', 10);
  if (Number.isFinite(narrator) && narrator > 0) {
    where.push(
      'EXISTS (SELECT 1 FROM hadith_narrator hn WHERE hn.hadith_id = h.id AND hn.narrator_id = ?)'
    );
    binds.push(narrator);
  }

  const subject = (p.get('subject') || '').trim();
  if (subject) {
    where.push(
      'EXISTS (SELECT 1 FROM hadith_subject hs WHERE hs.hadith_id = h.id AND hs.label_en = ?)'
    );
    binds.push(subject);
  }

  // Only rows carrying an extracted prophetic core, for matn comparison work.
  if (p.get('matn') === '1') where.push("h.matn_ar IS NOT NULL AND h.matn_ar <> ''");

  const sortKey = p.get('sort') || (rawQuery ? 'relevance' : 'id');
  // Relevance is meaningless without a query, and bm25() is not available
  // unless the FTS table is in the join.
  const order = SORTS[joinFts ? sortKey : sortKey === 'relevance' ? 'id' : sortKey] || SORTS.id;

  const size = PAGE_SIZES.includes(Number(p.get('size')))
    ? Number(p.get('size'))
    : DEFAULT_PAGE_SIZE;
  const page = Math.max(1, parseInt(p.get('page') || '1', 10) || 1);
  const offset = (page - 1) * size;

  const from = joinFts
    ? 'FROM hadith_fts JOIN hadith h ON h.id = hadith_fts.rowid JOIN hadith_book b ON b.id = h.book_id'
    : 'FROM hadith h JOIN hadith_book b ON b.id = h.book_id';
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';


  try {
    const [rows, counted] = await env.DB.batch<Record<string, unknown>>([
      env.DB.prepare(
        `SELECT h.id, h.hadith_num, h.chapter_en,
                h.matn_ar, h.matn_en, h.text_ar, h.text_en,
                h.parallel_count, h.witness_count, h.variant_count,
                h.narrator_count, h.path_count,
                b.id AS book_id, b.title_en AS book_en, b.title_ar AS book_ar
           ${from} ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`
      ).bind(...binds, size, offset),
      env.DB.prepare(boundedCountSql(from, clause)).bind(...binds)
    ]);

    // Counted to a ceiling. Unbounded, this was a 276,347-row scan on every
    // call — and with no filter required, a bare GET /api/hadith paid it.
    // `total_approximate` says when the figure is a floor rather than exact.
    const count = readCount(counted.results?.[0]?.n);
    return json({
      total: count.total,
      total_approximate: count.approximate,
      page,
      size,
      pages: pageCount(count, size),
      scope,
      // Snippets are cut here rather than by FTS5: a contentless index has no
      // text to excerpt from. Output is escaped, with only <mark> reintroduced.
      results: (rows.results || []).map((r: Record<string, unknown>) => ({
        ...r,
        snippet_en: rawQuery
          ? makeSnippet(toPlainText(String(r.matn_en || r.text_en || '')), rawQuery, { window: 240 })
          : null,
        snippet_ar: rawQuery
          ? makeSnippet(String(r.matn_ar || r.text_ar || ''), rawQuery, { window: 180 })
          : null
      }))
    });
  } catch (error) {
    console.error('Hadith query failed', error);
    return json({ error: 'Hadith query failed.' }, 500, 'no-store');
  }
};
