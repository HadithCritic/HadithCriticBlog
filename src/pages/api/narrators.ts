export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { buildNarratorMatch } from '../../lib/arabic-normalize';

/**
 * Narrator register query endpoint.
 *
 * Replaces the 5.2 MB `index.json` the browse page used to download in order to
 * filter 20,950 records in the browser. Filtering, sorting and pagination all
 * happen in SQL now, so a page of results is a few KB.
 *
 * Every value that reaches SQL goes through a bound parameter or an allow-list;
 * nothing is interpolated from the query string.
 */

const PAGE_SIZES = [25, 50, 100, 200];
const DEFAULT_PAGE_SIZE = 50;

// Sort keys are mapped to fixed SQL, never interpolated. `id` is appended as a
// tiebreaker so paging is stable when a sort column has duplicates.
const SORTS: Record<string, string> = {
  id: 'id ASC',
  'id-desc': 'id DESC',
  name: 'name_en ASC, id ASC',
  'name-desc': 'name_en DESC, id ASC',
  death: 'death_hijri IS NULL, death_hijri ASC, id ASC',
  'death-desc': 'death_hijri IS NULL, death_hijri DESC, id ASC',
  hadith: 'hadith_count DESC, id ASC',
  'hadith-asc': 'hadith_count ASC, id ASC',
  criticism: 'statement_count DESC, id ASC'
};

// Neutralise the LIKE metacharacters in reader-supplied text. Only meaningful
// alongside `ESCAPE '\'` on the clause itself — SQLite gives `\` no special
// meaning in LIKE otherwise.
const likeEscape = (value: string) => value.replace(/[\\%_]/g, (m) => `\\${m}`);

const json = (body: unknown, status = 200, cache = 'public, max-age=300') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache }
  });

export const GET: APIRoute = async ({ url }) => {
  const p = url.searchParams;

  const where: string[] = [];
  const binds: unknown[] = [];

  const q = (p.get('q') || '').trim().toLowerCase();
  if (q) {
    // `search_text` is a prebuilt haystack holding the transliteration, an
    // ASCII-folded copy of it, the Arabic, the kunya and the places, and it is
    // all still what gets matched — but through `narrator_fts` rather than a
    // `LIKE '%q%'` no index could serve. That scanned all 20,915 named
    // narrators per keystroke and could not match folded Arabic at all. See
    // migrations/0007.
    let match: string;
    try {
      match = buildNarratorMatch(q);
    } catch {
      // A query of only punctuation folds away to nothing. An empty result is
      // the honest answer; bare `MATCH ''` would be a 500.
      return json({ total: 0, page: 1, size: DEFAULT_PAGE_SIZE, pages: 1, results: [] });
    }
    where.push('id IN (SELECT rowid FROM narrator_fts WHERE narrator_fts MATCH ?)');
    binds.push(match);
  }

  const generation = p.get('generation');
  if (generation && generation !== 'all') {
    where.push('generation = ?');
    binds.push(generation);
  }

  const grade = p.get('grade');
  if (grade && grade !== 'all') {
    where.push('grade = ?');
    binds.push(grade);
  }

  const place = p.get('place');
  if (place && place !== 'all') {
    where.push("places_en LIKE ? ESCAPE '\\'");
    binds.push(`%"${likeEscape(place)}"%`);
  }

  // Century of death, in hijri centuries (1 = years 1-100).
  const century = parseInt(p.get('century') || '', 10);
  if (Number.isFinite(century) && century > 0) {
    where.push('death_hijri BETWEEN ? AND ?');
    binds.push((century - 1) * 100 + 1, century * 100);
  }

  if (p.get('graded') === '1') where.push('critic_count > 0');
  // The register holds 35 placeholder entries for narrators who could not be
  // identified; they are noise in a browse view unless asked for.
  if (p.get('unnamed') !== '1') where.push('unnamed = 0');

  const sql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = SORTS[p.get('sort') || 'id'] || SORTS.id;

  const size = PAGE_SIZES.includes(Number(p.get('size'))) ? Number(p.get('size')) : DEFAULT_PAGE_SIZE;
  const page = Math.max(1, parseInt(p.get('page') || '1', 10) || 1);
  const offset = (page - 1) * size;

  try {
    // The page and its total are independent, so they go over the wire together.
    // Awaiting them in sequence cost two round-trips to D1 on every keystroke of
    // the register's search box; `batch` is what the facets endpoint already does.
    const [rows, counted] = await db.batch<Record<string, unknown>>([
      db.prepare(
        `SELECT id, name_en, name_ar, generation, grade, tabaqa_number,
                death_hijri, death_gregorian, death_place, places_en,
                hadith_count, teacher_count, student_count,
                critic_count, statement_count, jarh_count, tadil_count, flags
           FROM narrator ${sql} ORDER BY ${order} LIMIT ? OFFSET ?`
      ).bind(...binds, size, offset),
      db.prepare(`SELECT COUNT(*) AS n FROM narrator ${sql}`).bind(...binds)
    ]);

    const total = Number(counted.results?.[0]?.n ?? 0);

    return json({
      total,
      page,
      size,
      pages: Math.max(1, Math.ceil(total / size)),
      results: (rows.results || []).map((r: Record<string, unknown>) => ({
        ...r,
        places_en: JSON.parse(String(r.places_en || '[]')),
        flags: JSON.parse(String(r.flags || '[]'))
      }))
    });
  } catch (error) {
    console.error('Narrator query failed', error);
    return json({ error: 'Narrator query failed.' }, 500, 'no-store');
  }
};
