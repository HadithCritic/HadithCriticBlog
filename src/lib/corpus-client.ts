/**
 * In-browser SQLite client for HadithCritic corpus.
 *
 * Runs FTS5 search and entity lookups directly in the client via sql.js-httpvfs
 * using HTTP range requests against Cloudflare R2 chunked storage.
 *
 * Falls back to network API calls (/api/hadith, /api/narrators) if WebAssembly
 * or range requests are unsupported in the environment.
 */

import { createDbWorker } from 'sql.js-httpvfs';
import { buildMatch, buildNarratorMatch, type SearchScope } from './arabic-normalize';
import { makeSnippet } from './snippet';
import { toPlainText } from './format-text';

export interface NarratorRecord {
  id: number;
  name_en: string;
  name_ar: string;
  generation: string;
  grade: string;
  tabaqa_number: number | null;
  death_hijri: number | null;
  death_gregorian: number | null;
  death_place: string;
  places_en: string[];
  hadith_count: number;
  teacher_count: number;
  student_count: number;
  critic_count: number;
  statement_count: number;
  jarh_count: number;
  tadil_count: number;
  flags: string[];
}

export interface NarratorSearchResponse {
  total: number;
  page: number;
  size: number;
  pages: number;
  results: NarratorRecord[];
}

export interface HadithRecord {
  id: number;
  hadith_num: string;
  chapter_en: string;
  matn_ar: string;
  matn_en: string;
  text_ar: string;
  text_en: string;
  parallel_count: number;
  witness_count: number;
  variant_count: number;
  narrator_count: number;
  path_count: number;
  book_id: number;
  book_en: string;
  book_ar: string;
  snippet_en: string | null;
  snippet_ar: string | null;
}

export interface HadithSearchResponse {
  total: number;
  total_approximate?: boolean;
  page: number;
  size: number;
  pages: number;
  scope: SearchScope;
  results: HadithRecord[];
}

let workerInstance: any = null;
let workerInitPromise: Promise<any> | null = null;
let workerFailed = false;

export async function getCorpusWorker(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if (workerFailed) return null;
  if (workerInstance) return workerInstance;

  if (!workerInitPromise) {
    workerInitPromise = (async () => {
      try {
        const worker = await createDbWorker(
          [{ from: 'jsonconfig', configUrl: '/data/hadith-config.json' }],
          '/sqlite.worker.js',
          '/sql-wasm.wasm'
        );
        workerInstance = worker;
        return worker;
      } catch (err) {
        console.warn('sql.js-httpvfs worker initialization failed, falling back to server API:', err);
        workerFailed = true;
        return null;
      }
    })();
  }

  return workerInitPromise;
}

const NARRATOR_SORTS: Record<string, string> = {
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

const likeEscape = (val: string) => val.replace(/[\\%_]/g, (m) => `\\${m}`);

export async function searchNarratorsClient(params: {
  q?: string;
  generation?: string;
  grade?: string;
  place?: string;
  century?: number;
  graded?: boolean;
  unnamed?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<NarratorSearchResponse> {
  const worker = await getCorpusWorker();

  if (!worker) {
    // Fallback to server API
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.generation && params.generation !== 'all') qs.set('generation', params.generation);
    if (params.grade && params.grade !== 'all') qs.set('grade', params.grade);
    if (params.place && params.place !== 'all') qs.set('place', params.place);
    if (params.century) qs.set('century', String(params.century));
    if (params.graded) qs.set('graded', '1');
    if (params.unnamed) qs.set('unnamed', '1');
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', String(params.page));
    if (params.size) qs.set('size', String(params.size));

    const res = await fetch(`/api/narrators?${qs.toString()}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as NarratorSearchResponse;
  }

  const where: string[] = [];
  const binds: unknown[] = [];

  const rawQ = (params.q || '').trim().toLowerCase();
  if (rawQ) {
    try {
      const match = buildNarratorMatch(rawQ);
      where.push('id IN (SELECT rowid FROM narrator_fts WHERE narrator_fts MATCH ?)');
      binds.push(match);
    } catch {
      return { total: 0, page: 1, size: params.size || 50, pages: 1, results: [] };
    }
  }

  if (params.generation && params.generation !== 'all') {
    where.push('generation = ?');
    binds.push(params.generation);
  }

  if (params.grade && params.grade !== 'all') {
    where.push('grade = ?');
    binds.push(params.grade);
  }

  if (params.place && params.place !== 'all') {
    where.push("places_en LIKE ? ESCAPE '\\'");
    binds.push(`%"${likeEscape(params.place)}"%`);
  }

  if (params.century && params.century > 0) {
    where.push('death_hijri BETWEEN ? AND ?');
    binds.push((params.century - 1) * 100 + 1, params.century * 100);
  }

  if (params.graded) where.push('critic_count > 0');
  if (!params.unnamed) where.push('unnamed = 0');

  const sqlClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = NARRATOR_SORTS[params.sort || 'id'] || NARRATOR_SORTS.id;

  const size = params.size || 50;
  const page = Math.max(1, params.page || 1);
  const offset = (page - 1) * size;

  const countQuery = `SELECT COUNT(*) AS n FROM narrator ${sqlClause}`;
  const dataQuery = `SELECT id, name_en, name_ar, generation, grade, tabaqa_number,
                            death_hijri, death_gregorian, death_place, places_en,
                            hadith_count, teacher_count, student_count,
                            critic_count, statement_count, jarh_count, tadil_count, flags
                     FROM narrator ${sqlClause} ORDER BY ${order} LIMIT ? OFFSET ?`;

  const countRes = await worker.db.query(countQuery, binds);
  const total = Number(countRes?.[0]?.n ?? 0);

  const rows = await worker.db.query(dataQuery, [...binds, size, offset]);

  return {
    total,
    page,
    size,
    pages: Math.max(1, Math.ceil(total / size)),
    results: (rows || []).map((r: any) => ({
      ...r,
      places_en: typeof r.places_en === 'string' ? JSON.parse(r.places_en || '[]') : r.places_en || [],
      flags: typeof r.flags === 'string' ? JSON.parse(r.flags || '[]') : r.flags || []
    }))
  };
}

const HADITH_BM25 = 'bm25(hadith_fts, 1.0, 2.0, 1.0, 2.0, 0.5)';
const HADITH_SORTS: Record<string, string> = {
  relevance: `${HADITH_BM25} ASC`,
  id: 'h.id ASC',
  'id-desc': 'h.id DESC',
  book: 'b.title_en ASC, h.id ASC',
  parallels: 'h.parallel_count DESC, h.id ASC'
};

export async function searchHadithClient(params: {
  q?: string;
  scope?: SearchScope;
  phrase?: boolean;
  book?: number;
  narrator?: number;
  subject?: string;
  matnOnly?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<HadithSearchResponse> {
  const worker = await getCorpusWorker();

  const scope = params.scope || 'all';
  const size = params.size || 25;
  const page = Math.max(1, params.page || 1);
  const offset = (page - 1) * size;
  const rawQuery = (params.q || '').trim();

  if (!worker) {
    // Fallback to server API
    const qs = new URLSearchParams();
    if (rawQuery) qs.set('q', rawQuery);
    if (scope !== 'all') qs.set('scope', scope);
    if (params.phrase) qs.set('phrase', '1');
    if (params.book) qs.set('book', String(params.book));
    if (params.narrator) qs.set('narrator', String(params.narrator));
    if (params.subject) qs.set('subject', params.subject);
    if (params.matnOnly) qs.set('matn', '1');
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', String(params.page));
    if (params.size) qs.set('size', String(params.size));

    const res = await fetch(`/api/hadith?${qs.toString()}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as HadithSearchResponse;
  }

  const where: string[] = [];
  const binds: unknown[] = [];
  let joinFts = false;

  if (rawQuery) {
    try {
      const match = buildMatch(rawQuery, scope, params.phrase);
      where.push('hadith_fts MATCH ?');
      binds.push(match);
      joinFts = true;
    } catch {
      return { total: 0, page: 1, size, pages: 1, scope, results: [] };
    }
  }

  if (params.book && params.book > 0) {
    where.push('h.book_id = ?');
    binds.push(params.book);
  }

  if (params.narrator && params.narrator > 0) {
    where.push(
      'EXISTS (SELECT 1 FROM hadith_narrator hn WHERE hn.hadith_id = h.id AND hn.narrator_id = ?)'
    );
    binds.push(params.narrator);
  }

  if (params.subject) {
    where.push(
      'EXISTS (SELECT 1 FROM hadith_subject hs WHERE hs.hadith_id = h.id AND hs.label_en = ?)'
    );
    binds.push(params.subject);
  }

  if (params.matnOnly) {
    where.push("h.matn_ar IS NOT NULL AND h.matn_ar <> ''");
  }

  const sortKey = params.sort || (rawQuery ? 'relevance' : 'id');
  const order = HADITH_SORTS[joinFts ? sortKey : sortKey === 'relevance' ? 'id' : sortKey] || HADITH_SORTS.id;

  const from = joinFts
    ? 'FROM hadith_fts JOIN hadith h ON h.id = hadith_fts.rowid JOIN hadith_book b ON b.id = h.book_id'
    : 'FROM hadith h JOIN hadith_book b ON b.id = h.book_id';
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) AS n ${from} ${clause}`;
  const countRes = await worker.db.query(countQuery, binds);
  const total = Number(countRes?.[0]?.n ?? 0);

  const COLUMNS = `h.id, h.hadith_num, h.chapter_en,
                  h.matn_ar, h.matn_en, h.text_ar, h.text_en,
                  h.parallel_count, h.witness_count, h.variant_count,
                  h.narrator_count, h.path_count,
                  b.id AS book_id, b.title_en AS book_en, b.title_ar AS book_ar`;

  const dataQuery = `SELECT ${COLUMNS} ${from} ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`;
  const rows = await worker.db.query(dataQuery, [...binds, size, offset]);

  return {
    total,
    page,
    size,
    pages: Math.max(1, Math.ceil(total / size)),
    scope,
    results: (rows || []).map((r: any) => ({
      ...r,
      snippet_en: rawQuery
        ? makeSnippet(toPlainText(String(r.matn_en || r.text_en || '')), rawQuery, { window: 240 })
        : null,
      snippet_ar: rawQuery
        ? makeSnippet(String(r.matn_ar || r.text_ar || ''), rawQuery, { window: 180 })
        : null
    }))
  };
}
