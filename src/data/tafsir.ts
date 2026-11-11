/* The Tafsir project registry for the verse-by-verse commentaries: what is
   imported, and the address of each verse.

   Al-Ṭabarī on al-Fātiḥa is authored as complete, hand-edited HTML pages under
   src/data/tafsir-pages/tabari/001/. Every other surah is rendered from the
   imported JSON under src/data/tafsir/tabari/surahs/ by
   src/lib/tafsir-verse-html.ts. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import suraNames from './quran-sura-names.json';

/* The shape of a surah file, as scripts/build-tafsir-data.mjs writes it. Inline
   runs and block types are described in scripts/lib/tafsir/text.mjs and
   classify.mjs. */
export type Run =
  | string
  | ['h', Run[], 0 | 1]
  | ['r', string, number, number, number]
  | ['n', string, number]
  | ['i', string];

export type Block =
  | { t: 'p'; x: Run[]; v?: string; cont?: 1; tag?: 'lang' | 'qir' }
  | { t: 'lemma' | 'intro'; x: Run[] }
  | { t: 'report'; c: Run[] | null; m: Run[]; via: string | null; typed?: 1 }
  | { t: 'quote'; x: Run[]; r: ['r', string, number, number, number]; sp?: string; tp?: string }
  | { t: 'arg'; q: { l: string; x: Run[] }; a: { l: string; x: Run[] } }
  | { t: 'poem'; i?: Run[]; x?: Run[]; lines?: Run[][] };

export type SectionKind = 'explain' | 'reports' | 'argument' | 'language' | 'readings';

export interface Readings {
  status: 'none' | 'discussed' | 'preference';
  names: string[];
  regions: string[];
  evidence: { b: number; text: string; p?: 1 }[];
}

export interface TafsirUnit {
  k: 'intro' | 'ayah' | 'lemma' | 'sub_lemma';
  s: number | null;
  e: number | null;
  ed: { print: 'en'; volumes: number[]; pages: number[] } | { print: 'ar'; pages: { v: string; p: number }[] };
  w: number;
  b: Block[];
  sec: { k: SectionKind; b: number[] }[];
  rd: Readings;
  tn?: string[];
  fl?: string[];
}

export interface TafsirNote {
  v: string;
  p: number | null;
  n: number | null;
  en: string;
  ar: string;
}

export interface TafsirSurah {
  n: number;
  shape: 'A' | 'B' | 'C' | 'D';
  ayahCount: number;
  translation: {
    title?: string | null;
    version?: string;
    credit?: string | null;
    publisher?: string;
    license?: string;
    url?: string;
    quality?: string;
    copyright?: string;
    modifications?: string;
    notes?: string[];
  };
  intro: (number | string)[];
  units: Record<string, TafsirUnit>;
  ayahs: { n: number; u: (number | string)[]; nt: number[]; wu?: 1 }[];
  notes: TafsirNote[];
}

interface ImportedSurah {
  n: number;
  ayahs: number;
  words: number;
  notes: number;
}

/* ── Commentaries ─────────────────────────────────────────────── */

const WORKS = [
  {
    id: 'tabari',
    name: 'al-Ṭabarī',
    author: 'Abū Jaʿfar Muḥammad ibn Jarīr al-Ṭabarī',
    died: 310,
    title: 'Jāmiʿ al-bayān ʿan taʾwīl āy al-Qurʾān',
    arabic: 'جامع البيان عن تأويل آي القرآن',
    /** The letter on the commentator's own paragraphs. */
    initial: 'Ṭ',
    /** The printed edition the editor's notes come from. */
    noteEdition: 'ʿAbd Allāh al-Turkī’s edition (Dār Hajr, 2001)',
  },
] as const;

const indexes = import.meta.glob<{ surahs: ImportedSurah[] }>('./tafsir/*/index.json', {
  eager: true,
  import: 'default',
});
/* Surahs whose verse pages are hand-edited HTML rather than rendered from the data. */
export const HAND_EDITED_SURAHS = new Set([1]);

export type TafsirWork = (typeof WORKS)[number] & {
  imported: Map<number, ImportedSurah>;
  words: number;
  notes: number;
};

export const works: TafsirWork[] = WORKS.map((work) => {
  const list = [...(indexes[`./tafsir/${work.id}/index.json`]?.surahs ?? [])].sort((a, b) => a.n - b.n);
  return {
    ...work,
    imported: new Map(list.map((s) => [s.n, s])),
    words: list.reduce((sum, s) => sum + s.words, 0),
    notes: list.reduce((sum, s) => sum + s.notes, 0),
  };
});

export const defaultWork = works[0];

/* Surah files are read from disk at build time, one at a time: the largest is
   over 5 MB, and keeping them out of the module graph keeps the build's memory
   flat. The last one read is kept, since a surah's verse pages build in a run. */
let lastLoaded: { key: string; surah: TafsirSurah | null } | null = null;

export async function loadSurah(workId: string, n: number): Promise<TafsirSurah | null> {
  const key = `${workId}/${n}`;
  if (lastLoaded?.key === key) return lastLoaded.surah;
  let surah: TafsirSurah | null = null;
  try {
    const file = resolve(process.cwd(), 'src/data/tafsir', workId, 'surahs', `${String(n).padStart(3, '0')}.json`);
    surah = JSON.parse(readFileSync(file, 'utf8')) as TafsirSurah;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  lastLoaded = { key, surah };
  return surah;
}

/* ── Surahs and addresses ─────────────────────────────────────── */

export interface SurahListing {
  n: number;
  latin: string;
  ar: string;
  verses: number;
  /** The commentaries that have this surah, in WORKS order. */
  works: TafsirWork[];
}

export const surahs: SurahListing[] = (suraNames as { n: number; ar: string; latin: string; verses: number }[])
  .map((s) => ({ ...s, works: works.filter((w) => w.imported.has(s.n)) }))
  .filter((s) => s.works.length > 0);

/** How many verse pages a commentary has for a surah: one per verse once imported, else a single placeholder. */
export const pageCount = (work: TafsirWork, surah: number) => work.imported.get(surah)?.ayahs ?? 1;

/** A verse page. A verse the commentary has no page for falls back to the surah's first page. */
export function verseHref(work: TafsirWork, surah: number, verse = 1) {
  const v = verse <= pageCount(work, surah) ? verse : 1;
  return `/projects/tafsir/${work.id}/${surah}/${v}/`;
}

/** Where a surah opens: its first verse in the first commentary that has it. */
export const surahHref = (surah: SurahListing) => verseHref(surah.works[0] ?? defaultWork, surah.n, 1);

/** A commentary's page for a whole surah: its verses, and how much each has. */
export const surahIndexHref = (work: TafsirWork, surah: number) => `/projects/tafsir/${work.id}/${surah}/`;

export const formatCount = (value: number) => value.toLocaleString('en-US');
