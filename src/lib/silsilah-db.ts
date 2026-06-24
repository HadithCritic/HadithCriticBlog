/*
  Cloudflare D1 data access for the Silsilah corpus (SSR / on-demand routes only).
  Importing this module pulls in `cloudflare:workers`, so it must NOT be imported by
  prerendered (static) pages — only by routes with `export const prerender = false`.

  Connection uses the D1 binding "DB" from wrangler.jsonc.
*/
import { env } from 'cloudflare:workers';
import { getTransliteratedTitle } from './collection-titles';

export interface CollectionRow {
  slug: string;
  name_en: string;
  name_ar: string | null;
  author_en: string | null;
  author_death: number | null;
  work_group: string | null;
  is_primary: number;
  hadith_count: number;
  book_count: number;
  ordinal: number;
}

export interface BookRow {
  collection_slug: string;
  slug: string;
  ordinal: number;
  title_en: string | null;
  title_ar: string | null;
  count: number;
}

export interface HadithRow {
  id: number;
  collection_slug: string;
  book_slug: string;
  ref: string;
  number: string | null;
  seq: number;
  kitab: string | null;
  kitab_en: string | null;
  bab: string | null;
  bab_en: string | null;
  chain: string | null;
  chain_en: string | null;
  matn: string | null;
  matn_en: string | null;
  text: string | null;
  text_en: string | null;
  collection_en: string | null;
  volume: string | null;
  printed_page: string | null;
}

function getDB() {
  const db = (env as any).DB;
  if (!db) throw new Error('Cloudflare D1 binding "DB" is not configured. Make sure wrangler is running with remote bindings.');
  return db;
}

/** Run a read query and return mapped rows. Exposed for the search endpoint. */
export async function query<T = Record<string, unknown>>(sql: string, args: any[] = []): Promise<T[]> {
  const stmt = getDB().prepare(sql).bind(...args);
  const { results } = await stmt.all();
  return results as T[];
}

async function first<T>(sql: string, args: any[] = []): Promise<T | null> {
  const stmt = getDB().prepare(sql).bind(...args);
  const result = await stmt.first();
  return result as T | null;
}

export const COLLECTION_ALIASES: Record<string, string> = {
  bukhari: 'sahih-al-bukhari',
  'sahih-bukhari': 'sahih-al-bukhari',
  muslim: 'sahih-muslim',
  'sahih-muslim': 'sahih-muslim',
  abudawud: 'the-sunan-of-abu-dawud',
  'abu-dawud': 'the-sunan-of-abu-dawud',
  dawud: 'the-sunan-of-abu-dawud',
  tirmidhi: 'the-sunan-of-al-tirmidhi',
  'al-tirmidhi': 'the-sunan-of-al-tirmidhi',
  nasai: 'the-sunan-of-an-nasa-i',
  nasaai: 'the-sunan-of-an-nasa-i',
  'nasa-i': 'the-sunan-of-an-nasa-i',
  "nasa'i": 'the-sunan-of-an-nasa-i',
  'an-nasai': 'the-sunan-of-an-nasa-i',
  ibnmajah: 'the-sunan-of-ibn-majah',
  'ibn-majah': 'the-sunan-of-ibn-majah',
  darimi: 'musnad-ad-darimi',
  ahmad: 'musnad-ahmad',
  malik: 'muwatta-malik-1699',
  muwatta: 'muwatta-malik-1699'
};

export function resolveCollectionSlug(input: string | null | undefined): string {
  const slug = (input || '').trim().toLowerCase();
  return COLLECTION_ALIASES[slug] ?? slug;
}

export async function getCollections(): Promise<CollectionRow[]> {
  const rows = await query<CollectionRow>(
    `SELECT slug, name_en, name_ar, author_en, author_death, work_group, is_primary, hadith_count, book_count, ordinal
     FROM collections ORDER BY author_death, name_en`
  );
  
  for (const row of rows) {
    row.name_en = getTransliteratedTitle(row.name_en, row.author_en);
  }
  
  return rows;
}

export async function getCollection(slug: string): Promise<CollectionRow | null> {
  const row = await first<CollectionRow>(
    `SELECT slug, name_en, name_ar, author_en, author_death, work_group, is_primary, hadith_count, book_count, ordinal
     FROM collections WHERE slug = ?`,
    [resolveCollectionSlug(slug)]
  );
  
  if (row) {
    row.name_en = getTransliteratedTitle(row.name_en, row.author_en);
  }
  
  return row;
}

export async function getBooks(collectionSlug: string): Promise<BookRow[]> {
  return query<BookRow>(
    `SELECT collection_slug, slug, ordinal, title_en, title_ar, count
     FROM books WHERE collection_slug = ? ORDER BY ordinal`,
    [collectionSlug]
  );
}

export interface HadithPage {
  rows: HadithRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getBookPage(
  collectionSlug: string,
  bookSlug: string,
  page = 1,
  pageSize = 50
): Promise<HadithPage> {
  const offset = (Math.max(page, 1) - 1) * pageSize;
  const db = getDB();
  
  const countStmt = db.prepare(`SELECT COUNT(*) AS total FROM hadith WHERE collection_slug = ? AND book_slug = ?`).bind(collectionSlug, bookSlug);
  const dataStmt = db.prepare(`SELECT * FROM hadith WHERE collection_slug = ? AND book_slug = ? ORDER BY seq LIMIT ? OFFSET ?`).bind(collectionSlug, bookSlug, pageSize, offset);
  
  const [countRes, dataRes] = await db.batch([countStmt, dataStmt]);
  
  const total = Number((countRes.results[0] as Record<string, unknown>).total ?? 0);
  const rows = dataRes.results as HadithRow[];
  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getHadithByRef(collectionSlug: string, number: string): Promise<HadithRow | null> {
  return first<HadithRow>(
    `SELECT * FROM hadith WHERE collection_slug = ? AND number = ? LIMIT 1`,
    [resolveCollectionSlug(collectionSlug), number]
  );
}

export function fmtCount(n: number): string {
  return (n || 0).toLocaleString('en-US');
}
