/**
 * The corpus, queried in the reader's browser.
 *
 * Every question the hadith and rijāl sections ask is answered here, by SQLite
 * compiled to WebAssembly reading a 1.6 GB static database over HTTP range
 * requests. There is no database server in the request path: the chunks are
 * ordinary immutable files on a CDN, so a search costs a few cached range
 * requests and nothing per query. That is the whole point of the architecture,
 * described in docs/static-corpus.md, and it is why this file has no network
 * fallback to a hosted SQL endpoint. There is nothing to fall back to.
 *
 * Three things shape the code:
 *
 *   **A round trip is the unit of cost, not a row.** The query shapes in
 *   corpus-count.ts were written to stop D1 billing for scans; the same shapes
 *   are what stop this fetching half the file a 4 KiB page at a time. Counting
 *   through `hadith_fts` alone rather than the join, ranking in a CTE before
 *   joining, and capping counts are all load-bearing here for latency.
 *
 *   **Initialisation is lazy and failure is survivable.** The worker is built
 *   on first use, never at import, so an article page pays nothing. If it
 *   cannot start, no WebAssembly, no range support, a blocked request, the
 *   status goes to `unavailable` and callers get a typed error they can render
 *   as a message instead of a blank page.
 *
 *   **Nothing from a reader is interpolated.** Values are bound; sort keys and
 *   scopes are allow-listed. The database is read-only and public, but a query
 *   assembled by string concatenation is still a query that can be made to
 *   return the wrong rows.
 */

import { createDbWorker } from 'sql.js-httpvfs';

import { buildMatch, buildNarratorMatch } from './arabic-normalize';
import {
  CORPUS_MANIFEST_URL,
  CORPUS_MAX_BYTES_PER_SESSION,
  CORPUS_VERSION,
  CORPUS_WASM_URL,
  CORPUS_WORKER_URL
} from './corpus-config';
import {
  boundedCountSql,
  exactCount,
  ftsCountSql,
  ftsPageSql,
  narratorCountSql,
  pageCount,
  readCount,
  type CountResult
} from './corpus-count';
import { makeSnippet } from './snippet';
import { toPlainText } from './format-text';
import type {
  AttestedForm,
  ChainNode,
  Criticism,
  HadithDetail,
  HadithRecord,
  HadithSearchResponse,
  HadithSearchRow,
  NarratorDetail,
  NarratorDossier,
  NarratorRecord,
  NarratorSearchResponse,
  Relation,
  SearchScope,
  Statement,
  StatementRow,
  Transmission,
  Verdict
} from './corpus-types';

export type { SearchScope } from './corpus-types';
export * from './corpus-types';

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                   */
/* -------------------------------------------------------------------------- */

export type CorpusStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

/** Thrown when the corpus cannot be reached, so a caller can say so plainly. */
export class CorpusUnavailableError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'CorpusUnavailableError';
  }
}

/**
 * Thrown when the corpus is open and answered a query with an error.
 *
 * Kept distinct from `CorpusUnavailableError` because the two need different
 * messages and different fixes. Conflating them told a reader "the corpus could
 * not be loaded" while the corpus was loaded and a query had failed, which sent
 * the investigation at the network for an hour. The underlying SQLite message
 * is logged rather than shown: it is diagnostic, not something a reader can act
 * on.
 */
export class CorpusQueryError extends Error {
  constructor(
    readonly sql: string,
    readonly cause?: unknown
  ) {
    super('The corpus could not answer that query.');
    this.name = 'CorpusQueryError';
  }
}

type StatusListener = (status: CorpusStatus, error?: CorpusUnavailableError) => void;

let status: CorpusStatus = 'idle';
let lastError: CorpusUnavailableError | null = null;
const listeners = new Set<StatusListener>();

function setStatus(next: CorpusStatus, error?: CorpusUnavailableError) {
  status = next;
  lastError = error ?? null;
  for (const listener of listeners) {
    try {
      listener(next, error);
    } catch {
      // A broken indicator must not take the query down with it.
    }
  }
}

export const getCorpusStatus = (): CorpusStatus => status;
export const getCorpusError = (): CorpusUnavailableError | null => lastError;

/**
 * Subscribe to corpus readiness. Fires immediately with the current status so
 * a listener registered after initialisation is not left waiting for an event
 * that already happened.
 */
export function onCorpusStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(status, lastError ?? undefined);
  return () => listeners.delete(listener);
}

type Worker = Awaited<ReturnType<typeof createDbWorker>>;

let workerPromise: Promise<Worker> | null = null;

/**
 * Prove the host answers range requests before trusting a byte of it.
 *
 * `sql.js-httpvfs` sends `Range: bytes=from-to` and then treats whatever comes
 * back as if it began at `from`. Given a `200` with the whole file, which is
 * what Cloudflare Pages and Workers static assets currently return, by their
 * own documentation, it copies bytes from the start of the chunk into the
 * page it thinks it asked for. SQLite then reads a database made of the wrong
 * pages: sometimes an error, sometimes wrong rows, never a message that points
 * anywhere near the cause.
 *
 * So one request settles it up front. A host that does not answer `206` with a
 * matching `Content-Range` is refused rather than half-believed, and the reader
 * is told the corpus is unavailable instead of being shown fabricated hadith.
 * That is not a hypothetical distinction on this site.
 *
 * The fix, when this fires, is to serve the chunks from something that does
 * byte serving, R2 behind a data hostname, and point
 * `PUBLIC_CORPUS_BASE_URL` at it. See docs/static-corpus.md.
 */
async function assertRangeSupport(): Promise<void> {
  const manifestResponse = await fetch(CORPUS_MANIFEST_URL);
  if (!manifestResponse.ok) {
    throw new Error(`manifest ${CORPUS_MANIFEST_URL} returned ${manifestResponse.status}`);
  }

  const manifest = (await manifestResponse.json()) as {
    urlPrefix: string;
    suffixLength: number;
    requestChunkSize: number;
  };

  const firstChunk = new URL(
    `${manifest.urlPrefix}${'0'.repeat(manifest.suffixLength)}`,
    new URL(CORPUS_MANIFEST_URL, location.href)
  ).toString();

  const probe = await fetch(firstChunk, { headers: { Range: 'bytes=0-15' } });

  /**
   * A host that ignored the Range header is sending the entire 10 MiB chunk.
   * Drop it on the floor rather than let it finish: this runs on every page
   * load against a misconfigured deployment, and the reader may be on mobile
   * data.
   */
  const abandon = () => probe.body?.cancel().catch(() => {});

  if (probe.status !== 206) {
    abandon();
    throw new Error(
      `${firstChunk} answered ${probe.status} to a range request instead of 206. ` +
        'The corpus cannot be read from a host that does not serve byte ranges.'
    );
  }

  const contentRange = probe.headers.get('Content-Range') || '';
  if (!/^bytes 0-15\/\d+$/.test(contentRange)) {
    abandon();
    throw new Error(`unexpected Content-Range "${contentRange}" from ${firstChunk}`);
  }

  // The first sixteen bytes of chunk zero are the first sixteen bytes of the
  // database, and SQLite stamps its format there. If they are anything else,
  // the chunks are mis-ordered or the range landed somewhere unintended.
  const header = new TextDecoder().decode(await probe.arrayBuffer());
  if (!header.startsWith('SQLite format 3')) {
    throw new Error(`${firstChunk} does not begin with a SQLite header`);
  }
}

/**
 * Open the corpus, building the worker on first call.
 *
 * Concurrent callers share one promise, and a failure is remembered: a page
 * that fires six queries against a corpus that cannot load should show one
 * message, not attempt six downloads of a wasm module that is not coming.
 */
export function openCorpus(): Promise<Worker> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new CorpusUnavailableError('The corpus is only available in the browser.')
    );
  }

  if (!workerPromise) {
    setStatus('loading');
    workerPromise = assertRangeSupport()
      .then(() =>
        createDbWorker(
          [{ from: 'jsonconfig', configUrl: CORPUS_MANIFEST_URL }],
          CORPUS_WORKER_URL,
          CORPUS_WASM_URL,
          CORPUS_MAX_BYTES_PER_SESSION
        )
      )
      .then((worker) => {
        setStatus('ready');
        return worker;
      })
      .catch((cause) => {
        const error = new CorpusUnavailableError(
          `Could not open corpus ${CORPUS_VERSION} from ${CORPUS_MANIFEST_URL}`,
          cause
        );
        setStatus('unavailable', error);
        // Kept rejected on purpose: retryCorpus() is the way back, so a burst
        // of queries cannot each start their own download attempt.
        throw error;
      });
  }

  return workerPromise;
}

/** Discard a failed attempt so a reader can ask again. */
export function retryCorpus(): Promise<Worker> {
  if (status === 'unavailable') {
    workerPromise = null;
    setStatus('idle');
  }
  return openCorpus();
}

/**
 * Bytes fetched and requests made so far, for measuring rather than guessing.
 *
 * The range requests are issued from inside the web worker, so they do not
 * appear in `performance.getEntriesByType('resource')` on the main thread and
 * the devtools network panel attributes them to the worker. This is the honest
 * figure, and it is what the numbers in docs/static-corpus.md were taken from.
 */
export async function corpusTransferStats() {
  if (!workerPromise || status !== 'ready') return null;
  const worker = await workerPromise;
  return worker.worker.getStats();
}

// Reachable from the console as `await window.__corpusStats()`, so the cost of
// a real workflow can be measured on a real page rather than estimated.
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__corpusStats = corpusTransferStats;
}

async function query<T = Record<string, unknown>>(sql: string, args: unknown[] = []): Promise<T[]> {
  const worker = await openCorpus();
  try {
    return (await worker.db.query(sql, args)) as T[];
  } catch (cause) {
    // The SQLite message is the only thing that identifies which query broke,
    // and it never reaches the page, so it goes to the console.
    console.error('Corpus query failed:', cause, '\nSQL:', sql, '\nArgs:', args);
    throw new CorpusQueryError(sql, cause);
  }
}

async function queryOne<T = Record<string, unknown>>(
  sql: string,
  args: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/* Shared SQL                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * bm25 weights, per FTS column: ar_text, ar_matn, en_text, en_matn, chapter_en.
 * The matn columns are weighted double: a hit in the prophetic core is more
 * interesting than one anywhere in the chain, which is mostly names.
 */
const BM25 = 'bm25(hadith_fts, 1.0, 2.0, 1.0, 2.0, 0.5)';

const HADITH_COLUMNS = `h.id, h.hadith_num, h.chapter_en, h.chapter_ar,
  h.matn_ar, h.matn_en, h.text_ar, h.text_en,
  h.path_count, h.narrator_count, h.parallel_count, h.witness_count, h.variant_count,
  b.id AS book_id, b.title_en AS book_en, b.title_ar AS book_ar, b.slug AS book_slug`;

const HADITH_SORTS: Record<string, string> = {
  relevance: `${BM25} ASC`,
  id: 'h.id ASC',
  'id-desc': 'h.id DESC',
  book: 'b.title_en ASC, h.id ASC',
  parallels: 'h.parallel_count DESC, h.id ASC'
};

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

const SCOPES = new Set<SearchScope>(['all', 'matn', 'arabic', 'english']);

/** Neutralise LIKE metacharacters; only meaningful with `ESCAPE '\'`. */
const likeEscape = (value: string) => value.replace(/[\\%_]/g, (m) => `\\${m}`);

const parseJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  try {
    const parsed = JSON.parse(String(value ?? '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* -------------------------------------------------------------------------- */
/* Hadith search                                                               */
/* -------------------------------------------------------------------------- */

export interface HadithSearchParams {
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
  /** Known total, when the caller already has one that needs no counting. */
  knownTotal?: number;
}

export interface HadithSearchResult extends HadithSearchResponse {
  approximate: boolean;
}

export async function searchHadith(params: HadithSearchParams): Promise<HadithSearchResult> {
  const scope: SearchScope = SCOPES.has(params.scope as SearchScope)
    ? (params.scope as SearchScope)
    : 'all';
  const size = Math.min(100, Math.max(1, params.size || 25));
  const page = Math.max(1, params.page || 1);
  const offset = (page - 1) * size;
  const rawQuery = (params.q || '').trim();

  const where: string[] = [];
  const binds: unknown[] = [];
  let joinFts = false;

  if (rawQuery) {
    let match: string;
    try {
      match = buildMatch(rawQuery, scope, params.phrase);
    } catch {
      // A query of punctuation alone folds away to nothing. An empty result is
      // the honest answer; bare `MATCH ''` is an error.
      return { total: 0, approximate: false, page: 1, size, pages: 1, scope, results: [] };
    }
    where.push('hadith_fts MATCH ?');
    binds.push(match);
    joinFts = true;
  }

  const book = Number(params.book);
  if (Number.isFinite(book) && book > 0) {
    where.push('h.book_id = ?');
    binds.push(book);
  }

  const narrator = Number(params.narrator);
  if (Number.isFinite(narrator) && narrator > 0) {
    where.push(
      'EXISTS (SELECT 1 FROM hadith_narrator hn WHERE hn.hadith_id = h.id AND hn.narrator_id = ?)'
    );
    binds.push(narrator);
  }

  const subject = (params.subject || '').trim();
  if (subject) {
    where.push(
      'EXISTS (SELECT 1 FROM hadith_subject hs WHERE hs.hadith_id = h.id AND hs.label_en = ?)'
    );
    binds.push(subject);
  }

  if (params.matnOnly) where.push("h.matn_ar IS NOT NULL AND h.matn_ar <> ''");

  const sortKey = params.sort || (rawQuery ? 'relevance' : 'id');
  const order =
    HADITH_SORTS[joinFts ? sortKey : sortKey === 'relevance' ? 'id' : sortKey] || HADITH_SORTS.id;

  const from = joinFts
    ? 'FROM hadith_fts JOIN hadith h ON h.id = hadith_fts.rowid JOIN hadith_book b ON b.id = h.book_id'
    : 'FROM hadith h JOIN hadith_book b ON b.id = h.book_id';
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Which single filter is doing all the narrowing, if any. The cheap query
  // shapes are each valid for one filter and wrong for a combination.
  const active = [
    rawQuery ? 'query' : null,
    Number.isFinite(book) && book > 0 ? 'book' : null,
    Number.isFinite(narrator) && narrator > 0 ? 'narrator' : null,
    subject ? 'subject' : null,
    params.matnOnly ? 'matn' : null
  ].filter(Boolean);
  const sole = active.length === 1 ? active[0] : null;
  const queryOnly = sole === 'query' && order === HADITH_SORTS.relevance;
  const narratorOnly = sole === 'narrator';

  const rows = queryOnly
    ? await query<Record<string, unknown>>(ftsPageSql(HADITH_COLUMNS, BM25), [
        binds[0],
        size,
        offset
      ])
    : await query<Record<string, unknown>>(
        `SELECT ${HADITH_COLUMNS} ${from} ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`,
        [...binds, size, offset]
      );

  let count: CountResult;
  if (params.knownTotal !== undefined) {
    count = exactCount(params.knownTotal);
  } else if (queryOnly) {
    count = readCount((await queryOne<{ n: number }>(ftsCountSql(), [binds[0]]))?.n);
  } else if (narratorOnly) {
    count = readCount((await queryOne<{ n: number }>(narratorCountSql(), [narrator]))?.n);
  } else {
    count = readCount((await queryOne<{ n: number }>(boundedCountSql(from, clause), binds))?.n);
  }

  return {
    total: count.total,
    approximate: count.approximate,
    page,
    size,
    pages: pageCount(count, size),
    scope,
    results: rows.map((row) => toSearchRow(row, rawQuery))
  };
}

function toSearchRow(row: Record<string, unknown>, rawQuery: string): HadithSearchRow {
  const record = row as unknown as HadithRecord;
  return {
    ...record,
    // Cut here rather than by FTS5: a contentless index has no text to excerpt
    // from. Output is escaped, with only <mark> reintroduced.
    snippet_en: rawQuery
      ? makeSnippet(toPlainText(String(record.matn_en || record.text_en || '')), rawQuery, {
          window: 240
        })
      : null,
    snippet_ar: rawQuery
      ? makeSnippet(String(record.matn_ar || record.text_ar || ''), rawQuery, { window: 180 })
      : null
  };
}

/* -------------------------------------------------------------------------- */
/* One narration                                                               */
/* -------------------------------------------------------------------------- */

export async function getHadithDetail(id: number): Promise<HadithDetail | null> {
  if (!Number.isFinite(id) || id <= 0) return null;

  const hadith = await queryOne<HadithRecord>(
    `SELECT ${HADITH_COLUMNS} FROM hadith h JOIN hadith_book b ON b.id = h.book_id WHERE h.id = ?`,
    [id]
  );
  if (!hadith) return null;

  const [chain, rawSubjects, glosses] = await Promise.all([
    query<ChainNode>(
      `SELECT c.path_idx, c.pos, c.narrator_id, c.name, n.name_en, n.death_hijri
         FROM hadith_chain c
         LEFT JOIN narrator n ON n.id = c.narrator_id
        WHERE c.hadith_id = ? ORDER BY c.path_idx, c.pos`,
      [id]
    ),
    query<{ label_ar: string; label_en: string }>(
      'SELECT label_ar, label_en FROM hadith_subject WHERE hadith_id = ?',
      [id]
    ),
    query<{ word_ar: string; word_en: string }>(
      'SELECT word_ar, word_en FROM hadith_gloss WHERE hadith_id = ?',
      [id]
    )
  ]);

  return {
    hadith,
    chain,
    // The taxonomy repeats a label per matching path; the reader wants the set.
    subjects: [...new Map(rawSubjects.map((s) => [String(s.label_en).trim(), s])).values()],
    glosses
  };
}

/* -------------------------------------------------------------------------- */
/* One collection                                                              */
/* -------------------------------------------------------------------------- */

export interface CollectionPageParams {
  bookId: number;
  size?: number;
  page?: number;
  /** Seek past this id, in place of an OFFSET the database has to walk. */
  after?: number | null;
  before?: number | null;
}

export async function getCollectionRows(params: CollectionPageParams): Promise<HadithRecord[]> {
  const size = Math.min(100, Math.max(1, params.size || 25));
  const columns = `h.id, h.hadith_num, h.chapter_en, h.chapter_ar, h.matn_en, h.text_en,
                   h.matn_ar, h.text_ar, h.narrator_count, h.parallel_count`;

  if (params.after) {
    return query<HadithRecord>(
      `SELECT ${columns} FROM hadith h WHERE h.book_id = ? AND h.id > ? ORDER BY h.id LIMIT ?`,
      [params.bookId, params.after, size]
    );
  }

  if (params.before) {
    const rows = await query<HadithRecord>(
      `SELECT ${columns} FROM hadith h WHERE h.book_id = ? AND h.id < ? ORDER BY h.id DESC LIMIT ?`,
      [params.bookId, params.before, size]
    );
    return rows.reverse();
  }

  const offset = (Math.max(1, params.page || 1) - 1) * size;
  return query<HadithRecord>(
    `SELECT ${columns} FROM hadith h WHERE h.book_id = ? ORDER BY h.id LIMIT ? OFFSET ?`,
    [params.bookId, size, offset]
  );
}

/* -------------------------------------------------------------------------- */
/* Narrator register                                                           */
/* -------------------------------------------------------------------------- */

export interface NarratorSearchParams {
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
  /** Total for the unfiltered register, which is stored and needs no count. */
  knownTotal?: number;
}

export async function searchNarrators(
  params: NarratorSearchParams
): Promise<NarratorSearchResponse> {
  const size = Math.min(200, Math.max(1, params.size || 50));
  const page = Math.max(1, params.page || 1);
  const offset = (page - 1) * size;

  const where: string[] = [];
  const binds: unknown[] = [];

  const q = (params.q || '').trim().toLowerCase();
  if (q) {
    try {
      where.push('id IN (SELECT rowid FROM narrator_fts WHERE narrator_fts MATCH ?)');
      binds.push(buildNarratorMatch(q));
    } catch {
      // Folds away to nothing. Dropping the clause would answer punctuation
      // with the whole register, so the query is made unsatisfiable instead.
      where.pop();
      where.push('0');
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

  const century = Number(params.century);
  if (Number.isFinite(century) && century > 0) {
    where.push('death_hijri BETWEEN ? AND ?');
    binds.push((century - 1) * 100 + 1, century * 100);
  }

  if (params.graded) where.push('critic_count > 0');
  // The register holds 35 placeholder entries for narrators who could not be
  // identified; they are noise in a browse view unless asked for.
  if (!params.unnamed) where.push('unnamed = 0');

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = NARRATOR_SORTS[params.sort || 'id'] || NARRATOR_SORTS.id;

  const rows = await query<Record<string, unknown>>(
    `SELECT id, name_en, name_ar, generation, grade, tabaqa_number,
            death_hijri, death_gregorian, death_place, places_en,
            hadith_count, teacher_count, student_count,
            critic_count, statement_count, jarh_count, tadil_count, flags
       FROM narrator ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...binds, size, offset]
  );

  const total =
    params.knownTotal !== undefined
      ? params.knownTotal
      : Number((await queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM narrator ${clause}`, binds))?.n ?? 0);

  return {
    total,
    page,
    size,
    pages: Math.max(1, Math.ceil(total / size)),
    results: rows.map(toNarratorRecord)
  };
}

const toNarratorRecord = (row: Record<string, unknown>): NarratorRecord => ({
  ...(row as unknown as NarratorRecord),
  places_en: parseJsonArray(row.places_en),
  flags: parseJsonArray(row.flags)
});

/** Named narrators by id, in the order asked for. Used by the comparison view. */
export async function getNarratorsByIds(ids: number[]): Promise<NarratorRecord[]> {
  const wanted = [...new Set(ids.filter((n) => Number.isFinite(n) && n >= 0))].slice(0, 12);
  if (!wanted.length) return [];

  const rows = await query<Record<string, unknown>>(
    `SELECT id, name_en, name_ar, generation, grade, tabaqa_number,
            death_hijri, death_gregorian, death_place, places_en,
            hadith_count, teacher_count, student_count,
            critic_count, statement_count, jarh_count, tadil_count, flags
       FROM narrator WHERE id IN (${wanted.map(() => '?').join(',')})`,
    wanted
  );

  const byId = new Map(rows.map((r) => [Number(r.id), toNarratorRecord(r)]));
  return wanted.map((id) => byId.get(id)).filter((r): r is NarratorRecord => Boolean(r));
}

/* -------------------------------------------------------------------------- */
/* One dossier                                                                 */
/* -------------------------------------------------------------------------- */

export async function getNarratorDossier(id: number): Promise<NarratorDossier | null> {
  if (!Number.isFinite(id) || id < 0) return null;

  const payloadRow = await queryOne<{ payload: string }>(
    'SELECT payload FROM narrator_detail WHERE id = ?',
    [id]
  );
  if (!payloadRow?.payload) return null;

  let detail: NarratorDetail;
  try {
    detail = JSON.parse(payloadRow.payload) as NarratorDetail;
  } catch (cause) {
    throw new CorpusUnavailableError(`Narrator ${id} has an unreadable dossier payload.`, cause);
  }

  const [statements, transmissions, countRow, attestedForms] = await Promise.all([
    query<StatementRow>(
      `SELECT critic, text, citation, page_id, verdict, phenomenon_key, phenomenon_label
         FROM criticism_statement WHERE narrator_id = ? ORDER BY ord`,
      [id]
    ),
    query<Transmission>(
      `SELECT h.id, h.hadith_num, h.matn_en, h.narrator_count, h.parallel_count,
              (SELECT MIN(hn.pos) FROM hadith_narrator hn
                WHERE hn.narrator_id = t.narrator_id AND hn.hadith_id = h.id) AS pos,
              b.title_en AS book_en
         FROM narrator_top_hadith t
         JOIN hadith h ON h.id = t.hadith_id
         JOIN hadith_book b ON b.id = h.book_id
        WHERE t.narrator_id = ?
        ORDER BY t.ord`,
      [id]
    ),
    queryOne<{ n: number }>(
      'SELECT COUNT(DISTINCT hadith_id) AS n FROM hadith_narrator WHERE narrator_id = ?',
      [id]
    ),
    query<AttestedForm>(
      `SELECT surface, n_mentions, is_display FROM narrator_alias
        WHERE narrator_id = ? ORDER BY n_mentions DESC LIMIT 8`,
      [id]
    )
  ]);

  return {
    detail,
    criticism: foldCriticism(statements),
    chainNames: await resolveChainNames(detail),
    transmissions,
    transmissionCount: Number(countRow?.n ?? 0),
    attestedForms
  };
}

function foldCriticism(rows: StatementRow[]): Criticism | null {
  if (!rows.length) return null;

  const byCritic = new Map<string, Statement[]>();
  const byPhenomenon = new Map<string, { key: string; label: string; statements: Statement[] }>();
  const tally: Record<Verdict, number> = { jarh: 0, tadil: 0, mixed: 0, unclassified: 0 };

  for (const row of rows) {
    const statement: Statement = {
      text: row.text,
      citation: row.citation,
      pageId: row.page_id,
      verdict: row.verdict
    };

    if (!byCritic.has(row.critic)) byCritic.set(row.critic, []);
    byCritic.get(row.critic)!.push(statement);

    if (tally[row.verdict] !== undefined) tally[row.verdict] += 1;

    if (row.phenomenon_key) {
      if (!byPhenomenon.has(row.phenomenon_key)) {
        byPhenomenon.set(row.phenomenon_key, {
          key: row.phenomenon_key,
          label: row.phenomenon_label || row.phenomenon_key,
          statements: []
        });
      }
      byPhenomenon.get(row.phenomenon_key)!.statements.push(statement);
    }
  }

  return {
    criticCount: byCritic.size,
    statementCount: rows.length,
    tally,
    critics: [...byCritic].map(([critic, statements]) => ({ critic, statements })),
    phenomena: [...byPhenomenon.values()]
  };
}

/**
 * Names for every narrator the dossier links to.
 *
 * A teacher, student or chain position is stored as an id; a link needs a name.
 * One `IN` query rather than one lookup each, because each lookup here is a
 * network round trip rather than a b-tree descent on a local file.
 */
async function resolveChainNames(detail: NarratorDetail): Promise<Record<string, string>> {
  const referenced = [
    ...(detail.sampleChains || []).flatMap((c) => c.path),
    ...(detail.teachers || []).map((t: Relation) => t.id),
    ...(detail.students || []).map((t: Relation) => t.id)
  ];
  const ids = [...new Set(referenced)].filter((n) => Number.isFinite(n));
  if (!ids.length) return {};

  const rows = await query<{ id: number; name_en: string; name_ar: string }>(
    `SELECT id, name_en, name_ar FROM narrator WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids
  );

  const names: Record<string, string> = {};
  for (const row of rows) names[row.id] = row.name_en || row.name_ar;
  return names;
}
