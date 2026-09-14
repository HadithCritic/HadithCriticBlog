/**
 * Row shapes returned by the static corpus.
 *
 * These mirror the distribution database's schema rather than any particular
 * page's needs, so a page that adds a field changes one query and one type
 * instead of inventing a parallel vocabulary. Column names are SQLite's,
 * unaltered, because renaming them in transit is where a silent null comes
 * from when a query is edited later.
 */

import type { SearchScope } from './arabic-normalize';

export type { SearchScope };

export interface CollectionRecord {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string;
  hadith_count: number;
}

export interface HadithRecord {
  id: number;
  hadith_num: string;
  chapter_en: string;
  chapter_ar: string;
  matn_ar: string | null;
  matn_en: string | null;
  text_ar: string;
  text_en: string;
  path_count: number;
  narrator_count: number;
  parallel_count: number;
  witness_count: number;
  variant_count: number;
  book_id: number;
  book_en: string;
  book_ar: string;
  book_slug: string;
}

/** A search hit: the record plus the excerpts the reader's query earned. */
export interface HadithSearchRow extends HadithRecord {
  snippet_en: string | null;
  snippet_ar: string | null;
}

export interface HadithSearchResponse {
  total: number;
  page: number;
  size: number;
  pages: number;
  scope: SearchScope;
  results: HadithSearchRow[];
}

export interface ChainNode {
  path_idx: number;
  pos: number;
  narrator_id: number | null;
  name: string;
  name_en: string | null;
  death_hijri: number | null;
}

export interface HadithDetail {
  hadith: HadithRecord;
  chain: ChainNode[];
  subjects: { label_ar: string; label_en: string }[];
  glosses: { word_ar: string; word_en: string }[];
}

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

export type Verdict = 'jarh' | 'tadil' | 'mixed' | 'unclassified';

export interface Relation {
  id: number;
  name: string;
  count: number;
}

export interface Statement {
  text: string;
  citation: string;
  pageId: number | null;
  verdict: Verdict;
}

/**
 * The dossier body, stored as one JSON payload per narrator.
 *
 * It is assembled by the register build rather than joined at read time
 * because the alternative is eleven queries against tables of millions of
 * rows, which over HTTP range requests is eleven round trips of latency.
 */
export interface NarratorDetail {
  id: number;
  nameEn: string;
  nameAr: string;
  fullName: string;
  kunya: string;
  nickname: string;
  lineage: string;
  relation: string;
  generation: string;
  grade: string;
  tabaqa: string;
  tabaqaEn: string;
  tabaqaNumber: number | null;
  rankIbnHajar: string;
  rankIbnHajarEn: string;
  rankDhahabi: string;
  rankDhahabiEn: string;
  madhhab: string;
  madhhabEn: string;
  flags: string[];
  deathPlace: string;
  placesEn: string[];
  placesAr: string[];
  deathDate: string;
  deathHijri: string;
  deathGregorian: string;
  hadithCount: number;
  aliasCount: number;
  aliases: { form: string; count: number }[];
  teachers: Relation[];
  students: Relation[];
  books: { book: string; count: number }[];
  positions: { pos: number; count: number }[];
  sampleChains: { book: string; number: string; path: number[] }[];
}

export interface StatementRow {
  critic: string;
  text: string;
  citation: string;
  page_id: number | null;
  verdict: Verdict;
  phenomenon_key: string | null;
  phenomenon_label: string | null;
}

export interface Criticism {
  criticCount: number;
  statementCount: number;
  tally: Record<Verdict, number>;
  critics: { critic: string; statements: Statement[] }[];
  phenomena: { key: string; label: string; statements: Statement[] }[];
}

export interface Transmission {
  id: number;
  hadith_num: string;
  book_en: string;
  matn_en: string | null;
  pos: number;
  narrator_count: number;
  parallel_count: number;
}

export interface AttestedForm {
  surface: string;
  n_mentions: number;
  is_display: number;
}

/** Everything /narrators/[id] renders, in one fetch. */
export interface NarratorDossier {
  detail: NarratorDetail;
  criticism: Criticism | null;
  chainNames: Record<string, string>;
  transmissions: Transmission[];
  transmissionCount: number;
  attestedForms: AttestedForm[];
}
