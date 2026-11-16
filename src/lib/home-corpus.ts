/* The hadith corpus figures on the front page: where the compilers worked,
   for the map, and one narration set out in full, for the facing-text card.
   Read from the compiler registry, the catalogue dates, the map outline built
   by scripts/site/build-home-map.mjs and one collection's JSON export.
   Build time only; home-data.ts gathers it with the other figures. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LIBRARY_COLLECTIONS } from './hadith-library';
import { centuryOf, COMPILER_DATES } from './collection-catalogue';
import { compilerFor, type CompilerRegion } from './hadith-compilers';
import { REGION_PLACES, type LabelSide } from '../data/hadith/compiler-regions';
import homeMap from '../data/site/home-map.json';
import { projectPoint, requireCount, sum } from './home-data-core';
// The same reader the collection pages use to list a chain's transmitters.
import { arabicNames, englishNames } from '../../scripts/hadith/lib/chain-from-isnad.mjs';

export interface MapCompiler {
  name: string;
  collections: number;
  narrations: number;
  century: number;
}

export interface MapRegion {
  key: CompilerRegion;
  name: string;
  city: string;
  /** Position on the map as percentages of its width and height. */
  x: number;
  y: number;
  label?: LabelSide;
  collections: number;
  narrations: number;
  centuries: number[];
  compilers: MapCompiler[];
}

export interface CompilerMapFigure {
  width: number;
  height: number;
  land: string;
  source: string;
  regions: MapRegion[];
  centuries: number[];
  /** Collections placed on the map, out of all in the library. */
  placed: number;
  total: number;
}

export interface ChainLink {
  en: string;
  ar: string;
}

export interface NarrationFigure {
  collection: string;
  compiler: string;
  number: string;
  citation: string;
  href: string;
  chain: ChainLink[];
  matnAr: string;
  matnEn: string;
}

/* The narration the facing-text card shows: short, with a chain the isnad
   reader divides cleanly in both languages. */
const FEATURED_NARRATION = { slug: 'al-jami-ibn-wahb', id: '303' };

/* Collections listed under another work's compiler entry, as on /hadith. */
const SAME_COMPILER_AS: Record<string, string> = { 'birr-al-walidayn': 'sahih-al-bukhari' };

interface PlacedCollection {
  region: CompilerRegion;
  compiler: string;
  narrations: number;
  century: number;
}

function placedCollections(): PlacedCollection[] {
  return LIBRARY_COLLECTIONS.flatMap((book) => {
    const key = SAME_COMPILER_AS[book.slug] ?? book.slug;
    const compiler = compilerFor(key);
    const died = COMPILER_DATES[book.slug] ?? COMPILER_DATES[key];
    if (!compiler || died == null) return [];
    return [{ region: compiler.region, compiler: compiler.name, narrations: book.hadith_count, century: centuryOf(died) }];
  });
}

function regionFigure(key: CompilerRegion, books: PlacedCollection[]): MapRegion {
  const place = REGION_PLACES[key];
  const names = [...new Set(books.map((book) => book.compiler))];
  const compilers = names.map((name) => {
    const own = books.filter((book) => book.compiler === name);
    return {
      name,
      collections: own.length,
      narrations: sum(own.map((book) => book.narrations)),
      century: Math.min(...own.map((book) => book.century)),
    };
  });
  return {
    key,
    name: place.name,
    city: place.city,
    ...projectPoint(place.lon, place.lat, homeMap.frame),
    label: place.label,
    collections: books.length,
    narrations: sum(books.map((book) => book.narrations)),
    centuries: [...new Set(books.map((book) => book.century))].sort((a, b) => a - b),
    compilers: compilers.sort((a, b) => b.narrations - a.narrations),
  };
}

export function compilerMap(): CompilerMapFigure {
  const books = placedCollections();
  const keys = Object.keys(REGION_PLACES) as CompilerRegion[];
  const regions = keys
    .map((key) => books.filter((book) => book.region === key))
    .flatMap((own, index) => (own.length ? [regionFigure(keys[index], own)] : []));
  if (!regions.length) throw new Error('Front page map: no collection has a compiler region.');
  return {
    width: homeMap.width,
    height: homeMap.height,
    land: homeMap.land,
    source: homeMap.source,
    regions,
    centuries: [...new Set(books.map((book) => book.century))].sort((a, b) => a - b),
    placed: books.length,
    total: requireCount('library collections', LIBRARY_COLLECTIONS.length),
  };
}

interface ExportEntry {
  id: string;
  number?: string;
  citation?: string;
  isnad_ar?: string;
  matn_ar?: string;
  isnad_en?: string;
  matn_en?: string;
}

interface CompilationExport {
  title_en: string;
  sections: Array<{ entries: ExportEntry[] }>;
}

export function featuredNarration(): NarrationFigure {
  const { slug, id } = FEATURED_NARRATION;
  return narrationFigure(slug, id, 'Front page narration');
}

/** One entry of a collection's JSON export, with its chain divided into
 *  names in both languages. Fails the build, naming `owner`, if the entry is
 *  missing or its chain does not divide the same way in Arabic and English. */
export function narrationFigure(slug: string, id: string, owner: string): NarrationFigure {
  const file = resolve(process.cwd(), `src/data/hadith/json/${slug}.json`);
  const data = JSON.parse(readFileSync(file, 'utf8')) as CompilationExport;
  const entry = data.sections.flatMap((section) => section.entries).find((item) => item.id === id);
  const fail = (why: string): never => {
    throw new Error(`${owner} ${slug} #${id}: ${why}. Pick another entry.`);
  };
  if (!entry) return fail('not found in the JSON export');
  if (!entry.isnad_ar || !entry.isnad_en || !entry.matn_ar || !entry.matn_en) return fail('missing its isnad or matn');

  const ar: string[] | null = arabicNames(entry.isnad_ar);
  const en: string[] | null = englishNames(entry.isnad_en);
  if (!ar || !en || ar.length !== en.length) return fail('its chain does not divide the same way in both languages');

  const compiler = compilerFor(slug);
  if (!compiler) return fail('the collection has no compiler entry');
  return {
    collection: data.title_en,
    compiler: compiler.name,
    number: entry.number ?? id,
    citation: entry.citation ?? data.title_en,
    href: `/hadith/collection/${slug}/`,
    chain: en.map((name, index) => ({ en: name, ar: ar[index] })),
    matnAr: entry.matn_ar,
    matnEn: entry.matn_en,
  };
}
