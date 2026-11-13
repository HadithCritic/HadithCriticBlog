/* Reads a surah of the bilingual commentaries (Mujāhid, al-Thawrī,
   al-Zamakhsharī) from its editable HTML in src/data/tafsir/pages/<work>/ and
   files its chapters under the verses they are about, so each verse has a page
   of its own. Build-time only.

   A chapter is a <section class="chapter" data-verses="14 15">. One without
   verses is either the surah's opening (data-opening, al-Zamakhsharī), which
   is read with the first verse, or a report the edition prints without a verse
   reference, which goes to the surah's "general" page. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface EditionChapter {
  id: string;
  title: string;
  verses: number[];
  opening: boolean;
  html: string;
  /** English words in the chapter. */
  words: number;
  reports: number;
}

export interface EditionSurah {
  chapters: EditionChapter[];
  byVerse: Map<number, EditionChapter[]>;
  /** Chapters the edition does not tie to a verse. */
  general: EditionChapter[];
}

export const GENERAL = 'general';

const CHAPTER_START = /(?=<section aria-labelledby="chapter-\d+-title" class="chapter)/;
const ARABIC_BLOCK = /<(section|div)\b[^>]*\blang="ar"[^>]*>[\s\S]*?<\/\1>/g;

const strip = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
const countWords = (text: string): number => text.split(/\s+/).filter(Boolean).length;

function parseChapter(html: string): EditionChapter {
  const open = html.slice(0, html.indexOf('>') + 1);
  const verses = (open.match(/data-verses="([\d ]+)"/)?.[1] ?? '').split(' ').filter(Boolean).map(Number);
  const content = html.slice(html.indexOf('</header>') + 9);
  return {
    id: open.match(/ id="(chapter-\d+)"/)?.[1] ?? '',
    title: strip(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '').trim(),
    verses,
    opening: open.includes('data-opening'),
    html: html.trim(),
    words: countWords(strip(content.replace(ARABIC_BLOCK, ' '))),
    reports: (html.match(/<article class="report/g) ?? []).length,
  };
}

let last: { key: string; surah: EditionSurah } | null = null;

export function loadEditionSurah(workId: string, slug: string): EditionSurah {
  const key = `${workId}/${slug}`;
  if (last?.key === key) return last.surah;
  const body = readFileSync(resolve(process.cwd(), 'src/data/tafsir/pages', workId, `${slug}.html`), 'utf8');
  const chapters = body.split(CHAPTER_START).slice(1).map(parseChapter);
  const byVerse = new Map<number, EditionChapter[]>();
  const file = (verse: number, chapter: EditionChapter): void => {
    byVerse.set(verse, [...(byVerse.get(verse) ?? []), chapter]);
  };
  const general: EditionChapter[] = [];
  for (const chapter of chapters) {
    if (chapter.opening) file(1, chapter);
    else if (chapter.verses.length) chapter.verses.forEach((v) => file(v, chapter));
    else general.push(chapter);
  }
  const surah = { chapters, byVerse, general };
  last = { key, surah };
  return surah;
}

/** A verse page's chapters: renumbered from 01, with the in-page verse links pointed at verse pages. */
export function chaptersHtml(chapters: EditionChapter[], verseHref: (verse: number) => string): string {
  return chapters
    .map((chapter, i) =>
      chapter.html
        .replace(/(<span class="chapter__number">)\d+(<\/span>)/, `$1${String(i + 1).padStart(2, '0')}$2`)
        .replace(/href="#verse-(\d+)"/g, (_, v: string) => `href="${verseHref(Number(v))}"`),
    )
    .join('\n');
}

/** The widest run of verses a chapter on the page treats together, when it is more than one verse. */
export function sharedRange(chapters: EditionChapter[]): { start: number; end: number } | null {
  let widest: { start: number; end: number } | null = null;
  for (const { verses } of chapters) {
    if (verses.length < 2) continue;
    const range = { start: Math.min(...verses), end: Math.max(...verses) };
    if (!widest || range.end - range.start > widest.end - widest.start) widest = range;
  }
  return widest;
}
