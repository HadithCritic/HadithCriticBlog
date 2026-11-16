/* The front page chronology: every history in src/data/history/history.ts
   placed at its author's death on a hijri axis, with a bar for the words of
   its English reader. Build time only. */
import { deathDate, historySources, readerFor, roundedWords } from '../data/history/history';
import { dodge, formatCount, requireCount, sharesOf, sum, timeAxis, type AxisTick } from './home-data-core';

/** Years between ticks on the axis. */
const TICK_STEP = 20;
/** Closest two bars may stand, as a share of the axis width. */
const BAR_GAP = 3.6;
/** How far in from either end a bar may sit, so it never hangs off the axis. */
const EDGE = 1.5;

export interface ChronologyBook {
  id: string;
  title: string;
  author: string;
  authorShort: string;
  died: string;
  /** Where the author's death falls on the axis, 0 to 100. */
  x: number;
  /** Where the bar stands, moved off its neighbors when two deaths are close. */
  barX: number;
  /** The bar's height against the longest open reader, or null while the book is not open. */
  share: number | null;
  /** "128 reading pages, about 468,000 words", or "Not open yet". */
  facts: string;
  href: string | null;
}

export interface ChronologyFigure {
  ticks: AxisTick[];
  books: ChronologyBook[];
  open: number;
  words: number;
}

export function historyChronology(): ChronologyFigure {
  const axis = timeAxis(historySources.map((source) => source.died.ah), TICK_STEP);
  const readers = historySources.map(readerFor);
  const words = readers.map((reader, index) =>
    reader ? requireCount(`${historySources[index].id} words`, reader.words) : 0,
  );
  const shares = sharesOf(words);
  const xs = historySources.map((source) => axis.at(source.died.ah));
  const barXs = dodge(xs, BAR_GAP, EDGE, 100 - EDGE);

  const books = historySources.map((source, index): ChronologyBook => {
    const reader = readers[index];
    return {
      id: source.id,
      title: source.title,
      author: source.author,
      authorShort: source.authorShort,
      died: deathDate(source),
      x: xs[index],
      barX: barXs[index],
      share: reader ? shares[index] : null,
      facts: reader
        ? `${formatCount(requireCount(`${source.id} pages`, reader.entries))} reading pages, ${roundedWords(reader.words)}`
        : 'Not open yet',
      href: reader?.href ?? null,
    };
  });

  const open = books.filter((book) => book.href).length;
  if (!open) throw new Error('Front page: no history reader is open to place on the chronology.');
  return { ticks: axis.ticks, books, open, words: sum(words) };
}
