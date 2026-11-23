import chapterIndex from '../data/hadith/pages/sunan-ibn-majah/chapter-index.json';
import bookTitles from '../data/hadith/pages/sunan-ibn-majah/book-titles.json';

export type SunanChapter = (typeof chapterIndex)[number];

export interface SunanBook {
  number: number;
  title: string;
  titleAr: string;
  chapters: SunanChapter[];
  reportCount: number;
  firstReport: string;
  lastReport: string;
}

export function getSunanBooks(): SunanBook[] {
  const arabicTitles = new Map((bookTitles as { number: number; title_ar: string }[]).map((book) => [book.number, book.title_ar]));
  return [...new Set(chapterIndex.map((chapter) => chapter.group))].map((number) => {
    const chapters = chapterIndex.filter((chapter) => chapter.group === number);
    return {
      number,
      title: chapters[0].group_title_en,
      titleAr: arabicTitles.get(number) ?? '',
      chapters,
      reportCount: chapters.reduce((total, chapter) => total + chapter.count, 0),
      firstReport: chapters[0].first,
      lastReport: chapters[chapters.length - 1].last
    };
  });
}
