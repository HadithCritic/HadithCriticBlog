/* The front page tafsir figures: one verse with what each commentary says on
   it (the verse layers), and which surahs each commentary has (the coverage
   grid). Every word is read from the commentaries' own pages and data.
   Build time only. */
import { libraryWorks, surahEntries, versePageHref, type SurahState } from '../data/tafsir/tafsir-library';
import { editions } from '../data/tafsir/tafsir-editions';
import { loadSurah, type Block } from '../data/tafsir/tafsir';
import quranVerses from '../data/quran/quran-verses.json';
import suraNames from '../data/quran/quran-sura-names.json';
import { loadEditionSurah, type EditionChapter } from './tafsir-edition-html';
import { runsText } from './tafsir-render';
import { excerpt, htmlText, requireCount } from './home-data-core';

/* The verse the layers stand on. All four commentaries treat it, and they do
   not agree on what "the seven" are, which is the point of showing them
   together. Any verse they all treat will build; one they do not fails. */
const FEATURED = { surah: 15, verse: 87 };
/** Longest a quotation on a layer may run, in characters. */
const QUOTE_MAX = 190;
/** Most reports quoted from one commentary. */
const QUOTES_MAX = 2;

export interface LayerQuote {
  /** Who a report is from; null where the commentator speaks in his own voice. */
  voice: string | null;
  text: string;
}

export interface TafsirLayer {
  id: string;
  name: string;
  author: string;
  died: number;
  quotes: LayerQuote[];
  /** Words of commentary on the verse, in English. */
  words: number;
  reports: number;
  href: string;
}

export interface VerseLayersFigure {
  surah: number;
  verse: number;
  surahName: string;
  ar: string;
  en: string;
  layers: TafsirLayer[];
}

export interface CoverageCell {
  n: number;
  state: SurahState;
  level: number;
  note: string;
  href: string | null;
}

export interface CoverageRow {
  id: string;
  name: string;
  died: number;
  available: number;
  /** Surahs whose English is still being prepared. */
  pending: number;
  cells: CoverageCell[];
}

export interface CoverageFigure {
  surahs: { n: number; latin: string }[];
  rows: CoverageRow[];
}

const byDeath = [...libraryWorks].sort((a, b) => a.died - b.died);
const SOURCE_REF = /<span class="source-ref">[\s\S]*?<\/span>/g;
const fail = (message: string): never => {
  throw new Error(`Front page tafsir: ${message}`);
};

function editionChapters(workId: string): EditionChapter[] {
  const part = editions.find((edition) => edition.id === workId)?.parts.find((p) => p.surah === FEATURED.surah);
  if (!part) return fail(`${workId} has no surah ${FEATURED.surah}.`);
  const chapters = loadEditionSurah(workId, part.slug).byVerse.get(FEATURED.verse) ?? [];
  if (!chapters.length) return fail(`${workId} has nothing on ${FEATURED.surah}:${FEATURED.verse}. Pick a verse all four treat.`);
  return chapters;
}

/* The reports of Mujāhid and al-Thawrī: who speaks, and what is said. */
function reportQuotes(chapters: EditionChapter[]): LayerQuote[] {
  const reports = chapters.flatMap((chapter) => chapter.html.split('<article class="report').slice(1));
  return reports.slice(0, QUOTES_MAX).map((report) => ({
    voice: htmlText(report.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] ?? ''),
    text: excerpt(htmlText((report.match(/<div class="report__text">([\s\S]*?)<\/div>/)?.[1] ?? '').replace(SOURCE_REF, '')), QUOTE_MAX),
  }));
}

/* Al-Zamakhsharī's own discussion, from its first printed page on the verse. */
function passageQuote(chapters: EditionChapter[]): LayerQuote[] {
  const row = chapters[0].html.match(/<div class="zk-row">[\s\S]*?<div class="zk-en" lang="en">([\s\S]*?)<\/div>/)?.[1];
  return row ? [{ voice: null, text: excerpt(htmlText(row).replace(/^[\s.,;:]+/, ''), QUOTE_MAX) }] : [];
}

function editionLayer(work: (typeof libraryWorks)[number]): Omit<TafsirLayer, 'href'> {
  const chapters = editionChapters(work.id);
  const quotes = chapters.some((chapter) => chapter.reports) ? reportQuotes(chapters) : passageQuote(chapters);
  return {
    id: work.id,
    name: work.short,
    author: work.author,
    died: work.died,
    quotes,
    words: chapters.reduce((total, chapter) => total + chapter.words, 0),
    reports: chapters.reduce((total, chapter) => total + chapter.reports, 0),
  };
}

/* Al-Ṭabarī opens each verse in his own voice; the first two paragraphs set out the question. */
async function tabariLayer(work: (typeof libraryWorks)[number]): Promise<Omit<TafsirLayer, 'href'>> {
  const surah = (await loadSurah(work.id, FEATURED.surah)) ?? fail(`no al-Ṭabarī data for surah ${FEATURED.surah}.`);
  const keys = surah.ayahs[FEATURED.verse - 1]?.u ?? [];
  const units = keys.map((key) => surah.units[String(key)]).filter(Boolean);
  if (!units.length) fail(`al-Ṭabarī has nothing on ${FEATURED.surah}:${FEATURED.verse}.`);
  const blocks: Block[] = units.flatMap((unit) => unit.b);
  const opening = blocks.filter((block) => block.t === 'p').slice(0, 2).map((block) => runsText(block.x)).join(' ');
  return {
    id: work.id,
    name: work.short,
    author: work.author,
    died: work.died,
    quotes: opening ? [{ voice: null, text: excerpt(opening, QUOTE_MAX * 1.75) }] : [],
    words: units.reduce((total, unit) => total + unit.w, 0),
    reports: blocks.filter((block) => block.t === 'report').length,
  };
}

export async function verseLayers(): Promise<VerseLayersFigure> {
  const key = `${FEATURED.surah}:${FEATURED.verse}`;
  const verse = (quranVerses as Record<string, { ar: string; en: string } | undefined>)[key] ?? fail(`no text for Q ${key}.`);
  const surahName = suraNames.find((s) => s.n === FEATURED.surah)?.latin ?? fail(`no name for surah ${FEATURED.surah}.`);
  const layers = await Promise.all(
    byDeath.map(async (work) => {
      const layer = work.bilingual ? editionLayer(work) : await tabariLayer(work);
      if (!layer.quotes.length || layer.quotes.some((quote) => !quote.text)) fail(`no passage to quote from ${work.id}.`);
      requireCount(`${work.id} words on ${key}`, layer.words);
      return { ...layer, href: versePageHref(work.id, FEATURED.surah, FEATURED.verse) };
    }),
  );
  return { ...FEATURED, surahName, ar: verse.ar, en: verse.en, layers };
}

export function surahCoverage(): CoverageFigure {
  const rows = byDeath.map((work): CoverageRow => {
    const cells = surahEntries(work.id).map(({ n, state, level, note, href }) => ({ n, state, level, note, href }));
    if (cells.length !== 114) fail(`${work.id} lists ${cells.length} surahs, not 114.`);
    return {
      id: work.id,
      name: work.short,
      died: work.died,
      available: cells.filter((cell) => cell.state === 'available').length,
      pending: cells.filter((cell) => cell.state === 'pending').length,
      cells,
    };
  });
  return { surahs: suraNames.map(({ n, latin }) => ({ n, latin })), rows };
}
