/* Which verses of which surahs each commentary has a page for. It feeds the
   surah and verse switcher on every reader page
   (src/components/tafsir/VerseSwitcher.astro) and the JSON it loads when the
   reader picks another surah (src/pages/projects/tafsir/[work]/verses.json.ts).
   Build-time only. */
import { pageCount, works } from '../data/tafsir/tafsir';
import { editions } from '../data/tafsir/tafsir-editions';
import { loadEditionSurah } from './tafsir-edition-html';

/** Inclusive runs of verse numbers: [[1, 5], [7, 7]]. */
export type VerseRanges = [number, number][];

export interface SurahVerses {
  ranges: VerseRanges;
  /** Whether the surah has a page of reports without a verse reference. */
  general: boolean;
}

function toRanges(verses: number[]): VerseRanges {
  const out: VerseRanges = [];
  for (const v of [...verses].sort((a, b) => a - b)) {
    const last = out.at(-1);
    if (last && v === last[1] + 1) last[1] = v;
    else out.push([v, v]);
  }
  return out;
}

export const expandRanges = (ranges: VerseRanges): number[] =>
  ranges.flatMap(([start, end]) => Array.from({ length: end - start + 1 }, (_, i) => start + i));

const cache = new Map<string, Map<number, SurahVerses>>();

/** Every surah the work has, with the verses that have a page. */
export function verseIndex(workId: string): Map<number, SurahVerses> {
  const known = cache.get(workId);
  if (known) return known;
  const tabari = works[0];
  const edition = editions.find((e) => e.id === workId);
  const index = new Map<number, SurahVerses>(
    edition
      ? edition.parts.map((part) => {
        const data = loadEditionSurah(workId, part.slug);
        const verses = [...data.byVerse.keys()].filter((v) => v <= (part.verseCount ?? 0));
        return [part.surah, { ranges: toRanges(verses), general: data.general.length > 0 }];
      })
      : [...tabari.imported.keys()].map((n) => [n, { ranges: [[1, pageCount(tabari, n)]] as VerseRanges, general: false }]),
  );
  cache.set(workId, index);
  return index;
}
