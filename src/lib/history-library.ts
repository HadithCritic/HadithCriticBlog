/* The history books as Astro pages use them: each fragment in
   src/data/history/readers parsed once per build and paired with its record
   in src/data/history/history.ts. The parsing itself is in history-book.ts. */
import { historySources, type HistorySource } from '../data/history/history';
import { parseHistoryBook, readingTime, type HistoryBook, type HistoryChapter, type HistoryPage } from './history-book';

const fragments = import.meta.glob<string>('../data/history/readers/*.html', { query: '?raw', import: 'default' });
const cache = new Map<string, Promise<HistoryBook>>();

export const historyHome = '/projects/history/';

/** Slugs of the books whose reading edition is open, in library order. */
export const openBookSlugs: string[] = historySources.flatMap((source) => (source.reader ? [source.reader.slug] : []));

export function sourceForBook(slug: string): HistorySource {
  const source = historySources.find((item) => item.reader?.slug === slug);
  if (!source) throw new Error(`No history source is recorded for ${slug}.`);
  return source;
}

export function loadBook(slug: string): Promise<HistoryBook> {
  const cached = cache.get(slug);
  if (cached) return cached;
  const load = fragments[`../data/history/readers/${slug}.html`];
  if (!load) throw new Error(`No reading edition for ${slug}.`);
  const book = load().then((fragment) => parseHistoryBook(slug, fragment));
  cache.set(slug, book);
  return book;
}

export const bookHref = (slug: string): string => `${historyHome}${slug}/`;
export const pageHref = (slug: string, page: HistoryPage): string => `${historyHome}${slug}/${page.slug}/`;

/** Where a chapter begins: its page, and its own heading when it shares one. */
export function chapterHref(book: HistoryBook, chapter: HistoryChapter): string {
  const page = book.pages[chapter.pages[0]];
  return `${pageHref(book.slug, page)}${page.slug === chapter.id ? '' : `#${chapter.id}`}`;
}

export interface BookFacts {
  chapters: number;
  pages: number;
  words: number;
  time: string;
}

export function bookFacts(book: HistoryBook): BookFacts {
  return { chapters: book.chapters.length, pages: book.pages.length, words: book.words, time: readingTime(book.minutes) };
}

/** "22 chapters", "1 chapter". */
export const count = (value: number, singular: string, plural = `${singular}s`): string =>
  `${value.toLocaleString('en-US')} ${value === 1 ? singular : plural}`;

/** What a page is called outside itself (the pager, the browser tab), and
    where it sits when it is one of several pages of a chapter. */
export function pageName(book: HistoryBook, page: HistoryPage): { title: string; context: string | null } {
  const chapter = book.chapters[page.chapter];
  if (page.of === 1) {
    const others = page.chapters.length - 1;
    return {
      title: others > 0 ? `${chapter.title} and ${count(others, 'more chapter')}` : chapter.title,
      context: chapter.number ? `Chapter ${chapter.number}` : null,
    };
  }
  const where = `Page ${page.index + 1} of ${page.of}`;
  if (page.index === 0 || /^Part \d+$/.test(page.label)) return { title: chapter.title, context: where };
  return { title: page.label, context: `${chapter.title} · ${where}` };
}

/** What stands beside a page in the contents: its years, reports, source
    pages or reading time, whichever says most about this kind of book. */
export function pageMeta(book: HistoryBook, page: HistoryPage): string {
  if (book.layout === 'reports' && page.reports) {
    return page.reports[0] === page.reports[1] ? `report ${page.reports[0]}` : `reports ${page.reports[0]} to ${page.reports[1]}`;
  }
  if (page.folios) return page.folios[0] === page.folios[1] ? `p. ${page.folios[0]}` : `pp. ${page.folios[0]} to ${page.folios[1]}`;
  return `${page.minutes} min`;
}
