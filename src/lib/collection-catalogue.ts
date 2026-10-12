import type { CollectionRecord } from './corpus-types';

/** Bibliographic compiler dates, not dates of composition or manuscript witnesses.
 * Source: https://hadith.dev/books (33-book bibliography, checked 2026-10-11).
 * Corpus titles, IDs and narration counts remain owned by corpus-meta.json.
 */
export const COMPILER_DATES: Record<string, number> = {
  'muwatta-malik': 179,
  'musnad-al-tayalisi': 204,
  'musannaf-abd-al-razzaq': 211,
  'musnad-al-humaydi': 219,
  'sunan-sa-id-ibn-mansur': 227,
  'musannaf-ibn-abi-shaybah': 235,
  'musnad-ahmad': 241,
  'musnad-abd-ibn-humayd': 249,
  'musnad-al-darimi': 255,
  'sahih-al-bukhari': 256,
  'sahih-muslim': 261,
  'sunan-ibn-majah': 273,
  'sunan-abi-dawud': 275,
  'al-marasil-li-abi-dawud': 275,
  'jami-al-tirmidhi': 279,
  'al-shama-il-al-muhammadiyah': 279,
  'musnad-al-bazzar': 292,
  'sunan-al-nasa-i': 303,
  'al-sunan-al-kubra': 303,
  'al-muntaqa': 307,
  'musnad-abi-ya-la-al-mawsili': 307,
  'sahih-ibn-khuzaymah': 311,
  'sharh-ma-ani-al-athar': 321,
  'sharh-mushkil-al-athar': 321,
  'sahih-ibn-hibban': 354,
  'al-mu-jam-al-kabir': 360,
  'al-mu-jam-al-awsat': 360,
  'al-mu-jam-al-saghir': 360,
  'sunan-al-daraqutni': 385,
  'al-mustadrak-ala-al-sahihayn': 405,
  'sunan-al-bayhaqi-al-kubra': 458,
  'al-ahadith-al-mukhtarah': 643,
  'al-matalib-al-aliyah': 852,
};

export function collectionType(slug: string): string {
  if (slug === 'al-ahadith-al-mukhtarah' || slug === 'al-mustadrak-ala-al-sahihayn') return 'Sahih';
  if (slug === 'muwatta-malik' || slug === 'al-muntaqa') return 'Sunan';
  if (slug === 'al-matalib-al-aliyah') return 'Musnad';
  if (slug.startsWith('sahih-')) return 'Sahih';
  if (slug.startsWith('sunan-') || slug === 'al-sunan-al-kubra' || slug === 'jami-al-tirmidhi') return 'Sunan';
  if (slug.startsWith('musannaf-')) return 'Musannaf';
  if (slug.startsWith('musnad-')) return 'Musnad';
  if (slug.startsWith('al-mu-jam-')) return 'Muʿjam';
  return 'Other';
}

export function chronologicalCollections(books: CollectionRecord[]): CollectionRecord[] {
  // Sorting a copy protects the generated metadata and all corpus query consumers.
  return [...books].sort((a, b) =>
    (COMPILER_DATES[a.slug] ?? Infinity) - (COMPILER_DATES[b.slug] ?? Infinity)
    || Object.keys(COMPILER_DATES).indexOf(a.slug) - Object.keys(COMPILER_DATES).indexOf(b.slug)
    || a.id - b.id);
}
