import editionList from '../data/reader-editions.json';
import { narrationCount } from './collection-units';

/**
 * The collections in the /hadith library. Every one is a local edition whose
 * pages are built from the HTML in src/data/hadith-pages/. Titles come from
 * src/data/reader-editions.json (al-Shamāʾil is listed here, since the edition
 * scripts that read that file do not cover it) and counts from each
 * collection's chapter index.
 */
export interface LibraryCollection {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string;
  hadith_count: number;
}

const SHAMAIL = {
  slug: 'al-shama-il-al-muhammadiyah',
  title_en: "Al-Shama'il al-Muhammadiyah",
  title_ar: 'الشمائل المحمدية',
};

// Editions without a chapter index state their extent in their own reader.
const FIXED_COUNTS: Record<string, number> = { 'sahifat-hammam-ibn-munabbih': 137, 'fada-il-makka': 7 };

export const LIBRARY_COLLECTIONS: LibraryCollection[] = [SHAMAIL, ...editionList].map((edition, index) => {
  const count = narrationCount(edition.slug) ?? FIXED_COUNTS[edition.slug];
  if (count == null) throw new Error(`No narration count for ${edition.slug}.`);
  return { id: index + 1, ...edition, hadith_count: count };
});

export const SHAMAIL_COLLECTION = LIBRARY_COLLECTIONS[0];

export const LIBRARY_NARRATIONS = LIBRARY_COLLECTIONS.reduce((sum, book) => sum + book.hadith_count, 0);
