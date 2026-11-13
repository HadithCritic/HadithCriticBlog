/* One view of the four commentaries for the pages that treat them alike: the
   front page's contents and the surah and verse routes. Al-Ṭabarī comes from
   src/data/tafsir/tafsir.ts (imported JSON), the others from
   src/data/tafsir/tafsir-editions.ts (editable HTML). */
import suraNames from '../quran/quran-sura-names.json';
import { works } from './tafsir';
import { editions } from './tafsir-editions';

export interface LibraryWork {
  id: string;
  name: string;
  /** The name on breadcrumbs and labels. */
  short: string;
  author: string;
  died: number;
  title: string;
  arabic: string;
  /** The line under the author's name at the top of a page. */
  attribution: string;
  portrait?: string;
  region?: string;
  /** Whether the Arabic of the edition is printed beside the English. */
  bilingual: boolean;
}

export type SurahState = 'available' | 'none' | 'pending';

export interface SurahEntry {
  n: number;
  latin: string;
  ar: string;
  verses: number;
  state: SurahState;
  /** Words of commentary in English. */
  words: number;
  /** 1 to 4 for an available surah, by how much commentary it has; 0 otherwise. */
  level: number;
  href: string | null;
  note: string;
}

const LEVELS = 4;
const names = suraNames as { n: number; ar: string; latin: string; verses: number }[];
const tabari = works[0];

/* The order the commentaries are shown in. */
const ORDER = ['mujahid', 'thawri', 'zamakhshari', 'tabari'];

export const libraryWorks: LibraryWork[] = [
  ...editions.map((e) => ({
    id: e.id,
    name: e.name,
    short: e.short,
    author: e.author,
    died: e.died,
    title: e.title,
    arabic: e.arabic,
    attribution: e.attribution,
    portrait: e.portrait,
    region: e.region,
    bilingual: true,
  })),
  {
    id: tabari.id,
    name: tabari.name,
    short: tabari.name,
    author: tabari.author,
    died: tabari.died,
    title: tabari.title,
    arabic: tabari.arabic,
    attribution: 'Commentary',
    portrait: 'tabari',
    region: 'tabaristan',
    bilingual: false,
  },
].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

export const libraryWork = (id: string): LibraryWork | undefined => libraryWorks.find((w) => w.id === id);

export const surahPageHref = (workId: string, surah: number): string => `/projects/tafsir/${workId}/${surah}/`;
export const versePageHref = (workId: string, surah: number, verse: number | string): string =>
  `/projects/tafsir/${workId}/${surah}/${verse}/`;

const count = (n: number, word: string): string => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;

interface Held {
  words: number;
  note: string;
}

/* What each work has for a surah, by surah number. */
function held(workId: string): Map<number, Held> {
  if (workId === tabari.id) {
    return new Map([...tabari.imported.values()].map((s) => [s.n, { words: s.words, note: `${count(s.ayahs, 'verse')} · ${count(s.words, 'word')}` }]));
  }
  const edition = editions.find((e) => e.id === workId);
  return new Map(
    (edition?.parts ?? []).map((p) => {
      const amount = edition?.unit === 'page' ? count(p.enWords, 'word') : count(p.entries, 'report');
      const partial = p.status && p.status !== 'complete' ? ' · translation in progress' : '';
      return [p.surah, { words: p.enWords, note: `${p.verses} of ${p.verseCount} verses · ${amount}${partial}` }];
    }),
  );
}

/** Every surah of the Qur'an for one commentary: what it has, or why it has nothing. */
export function surahEntries(workId: string): SurahEntry[] {
  const has = held(workId);
  const pending = new Set(editions.find((e) => e.id === workId)?.untranslated ?? []);
  const logs = [...has.values()].map((h) => Math.log(Math.max(h.words, 1)));
  const low = Math.min(...logs);
  const span = Math.max(...logs) - low || 1;
  return names.map((s) => {
    const h = has.get(s.n);
    if (h) {
      const level = Math.min(LEVELS, 1 + Math.floor(((Math.log(Math.max(h.words, 1)) - low) / span) * LEVELS));
      return { ...s, state: 'available' as const, words: h.words, level, href: surahPageHref(workId, s.n), note: h.note };
    }
    const waiting = pending.has(s.n) || workId === tabari.id;
    return {
      ...s,
      state: waiting ? ('pending' as const) : ('none' as const),
      words: 0,
      level: 0,
      href: null,
      note: waiting ? 'Translation in progress' : 'No commentary in the edition',
    };
  });
}
