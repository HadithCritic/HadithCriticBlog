/* The 33 books of Musnad Abī Ḥanīfa in seven broad subjects, for the filter
   chips and the entries chart on its front page (PaintedFront.astro). The
   books keep their own order; a subject only gathers them. Every book is in
   exactly one subject, and the build fails otherwise. */

export interface BookGroup {
  id: string;
  label: string;
  books: readonly number[];
}

export const MUSNAD_ABU_HANIFA_GROUPS: readonly BookGroup[] = [
  { id: 'faith', label: 'Faith and knowledge', books: [1, 2, 31] },
  { id: 'worship', label: 'Worship', books: [3, 4, 5, 6, 7] },
  { id: 'family', label: 'Family', books: [8, 9, 10, 11, 12, 13, 32] },
  { id: 'law', label: 'Law and dealings', books: [14, 15, 16, 17, 18, 19, 20, 28, 29] },
  { id: 'prophet', label: 'The Prophet', books: [21, 22] },
  { id: 'life', label: 'Daily life', books: [23, 24, 25, 26, 27] },
  { id: 'end', label: 'Trials and the end', books: [30, 33] }
];

/** The subject of each book by its number; throws if the list has a gap or a repeat. */
export function groupByBook(groups: readonly BookGroup[], bookCount: number): ReadonlyMap<number, BookGroup> {
  const map = new Map<number, BookGroup>();
  for (const group of groups) {
    for (const book of group.books) {
      if (map.has(book)) throw new Error(`Book ${book} is in two subjects: ${map.get(book)?.id} and ${group.id}`);
      map.set(book, group);
    }
  }
  for (let n = 1; n <= bookCount; n += 1) {
    if (!map.has(n)) throw new Error(`Book ${n} has no subject in the groups list`);
  }
  return map;
}
