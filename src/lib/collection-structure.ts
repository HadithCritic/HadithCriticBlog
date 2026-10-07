/**
 * Each collection's books and chapters, from the Ifta' Sunnah platform's
 * table of contents (scripts/build-collection-structure.py). Read at build
 * time only: the files are imported here, so nothing ships to the browser
 * except the pages built from them.
 */

export type CollectionShape = 'kitab' | 'companion' | 'flat';

export interface StructureChapter {
  n: number;
  title_ar: string;
  title_en: string | null;
  first: number;
  last: number;
  count: number;
}

export interface StructureKitab {
  n: number;
  toc_id: number | null;
  title_ar: string;
  title_en: string | null;
  /** "curated": a HadithCritic translation; "corpus": the corpus's own English for the heading. */
  english_basis: 'curated' | 'corpus' | null;
  first: number;
  last: number;
  count: number;
  chapters: StructureChapter[];
  /** The Companion a musnad section names, when it resolves to one Rijal register entry. */
  companion?: { narrator_id: number; name_en: string };
}

export interface CollectionStructure {
  slug: string;
  book_id: number;
  title_en: string;
  title_ar: string;
  shape: CollectionShape;
  source: { name: string; url: string; fetched: string; method: string };
  kitabs: StructureKitab[];
}

const files = import.meta.glob<CollectionStructure>('../data/collection-structure/*.json', {
  eager: true,
  import: 'default'
});

export const STRUCTURES: CollectionStructure[] = Object.values(files);

export function structureFor(slug: string): CollectionStructure | undefined {
  return STRUCTURES.find((structure) => structure.slug === slug);
}

/** What a collection calls its top-level divisions. */
export function divisionNoun(shape: CollectionShape): { one: string; many: string } {
  if (shape === 'companion') return { one: 'Section', many: 'Sections' };
  if (shape === 'flat') return { one: 'Chapters', many: 'Chapters' };
  return { one: 'Book', many: 'Books' };
}

/** A book's English title, falling back to the collection's when it has none (a flat collection). */
export function kitabTitle(structure: CollectionStructure, kitab: StructureKitab): string {
  if (structure.shape === 'flat') return 'All chapters';
  return kitab.title_en || kitab.title_ar;
}

/**
 * The collection's sequential edition lists narrations by id, 25 a page. A
 * chapter's first narration is at a known position in that order, because
 * every narration is placed, so its page can be linked directly.
 */
export function editionPage(structure: CollectionStructure, first: number, size = 25): number {
  let before = 0;
  for (const kitab of structure.kitabs) {
    for (const chapter of kitab.chapters) {
      if (chapter.first >= first) return Math.floor(before / size) + 1;
      before += chapter.count;
    }
  }
  return Math.floor(before / size) + 1;
}
