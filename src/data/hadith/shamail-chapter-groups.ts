import type { BookGroup } from './musnad-abu-hanifa-groups';

/** Topical filters for al-Shamāʾil; every chapter appears in exactly one group. */
export const SHAMAIL_CHAPTER_GROUPS: readonly BookGroup[] = [
  { id: 'appearance', label: 'Appearance', books: [1, 2, 3, 4, 5, 6, 7] },
  { id: 'clothing', label: 'Clothing & belongings', books: [8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20] },
  { id: 'daily-life', label: 'Daily life', books: [9, 19, 21, 22, 23, 33, 34, 35, 36, 37, 38, 39, 46, 52] },
  { id: 'food-drink', label: 'Food & drink', books: [24, 25, 26, 27, 28, 29, 30, 31, 32] },
  { id: 'worship', label: 'Worship', books: [40, 41, 42, 43, 44, 45] },
  { id: 'character', label: 'Character', books: [47, 48, 49] },
  { id: 'life-and-memory', label: 'Life & remembrance', books: [50, 51, 53, 54, 55, 56] },
];
