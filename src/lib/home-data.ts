/* Every figure the front page prints, read from the data each part of the
   site is built from. The page does no arithmetic of its own; a figure that
   cannot be read fails the build (see requireCount). Build time only. */
import { getCollection, type CollectionEntry } from 'astro:content';
import { LIBRARY_COLLECTIONS, LIBRARY_NARRATIONS } from './hadith-library';
import { chronologicalCollections } from './collection-catalogue';
import { compilerFor } from './hadith-compilers';
import { medallionThumbFor } from './hadith-art';
import { libraryWorks, surahPageHref } from '../data/tafsir/tafsir-library';
import tafsirCoverage from '../data/tafsir/tafsir-coverage.json';
import taqribReport from '../data/rijal/taqrib/report.json';
import { firstByKey, requireCount } from './home-data-core';
import { compilerMap, featuredNarration, type CompilerMapFigure, type NarrationFigure } from './home-corpus';
import { historyChronology, type ChronologyFigure } from './home-history';
import { surahCoverage, verseLayers, type CoverageFigure, type VerseLayersFigure } from './home-tafsir';
import { featuredBiography, generationLadder, type BiographyFigure, type LadderFigure } from './home-narrators';
import { studyTabs, type StudyTab } from './home-studies';
import { resourcesFigure, type ResourcesFigure } from './home-resources';
import { youtubeFigure, type YoutubeFigure } from './home-youtube';
import { openSourceFigure, type OpenSourceFigure } from './home-open-source';

export type Study = CollectionEntry<'articles'>;

export interface TafsirWorkFigure {
  id: string;
  name: string;
  author: string;
  died: number;
  /** What the work is counted in: "passage", "report" or "printed page". */
  unit: string;
  english: number;
  href: string;
}

/** A compiler's medallion in the hero band, linking to the first collection it stands for. */
export interface MedallionFigure {
  src: string;
  compiler: string;
  title: string;
  href: string;
}

export interface HomeData {
  hero: { medallions: MedallionFigure[] };
  studies: { all: Study[]; tabs: StudyTab[] };
  hadith: { narrations: number; collections: number };
  corpus: { map: CompilerMapFigure; narration: NarrationFigure };
  narrators: { biographies: number; generations: number; crossReferences: number; ladder: LadderFigure; biography: BiographyFigure };
  tafsir: { works: TafsirWorkFigure[]; layers: VerseLayersFigure; coverage: CoverageFigure };
  history: { chronology: ChronologyFigure };
  resources: ResourcesFigure;
  youtube: YoutubeFigure;
  openSource: OpenSourceFigure;
}

type CoverageEntry = { unit: string; english: number };

function tafsirWorks(): TafsirWorkFigure[] {
  const coverage = tafsirCoverage as Record<string, CoverageEntry | undefined>;
  return libraryWorks.map((work) => {
    const entry = coverage[work.id];
    if (!entry) throw new Error(`Front page: no tafsir coverage for "${work.id}". Rerun build-tafsir-coverage.mjs.`);
    return {
      id: work.id,
      name: work.short,
      author: work.author,
      died: requireCount(`${work.id} death year`, work.died),
      unit: entry.unit,
      english: requireCount(`${work.id} English units`, entry.english),
      href: surahPageHref(work.id, 1),
    };
  });
}

/* One medallion per compiler, oldest collection first. A compiler with two works,
   or two compilers drawn with one medallion, show once and link to the earlier work. */
function medallionBand(): MedallionFigure[] {
  const figures = chronologicalCollections(LIBRARY_COLLECTIONS).flatMap((book) => {
    const compiler = compilerFor(book.slug);
    const src = medallionThumbFor(compiler);
    if (!src || !compiler) return [];
    return [{ src, compiler: compiler.name, title: book.title_en, href: `/hadith/collection/${book.slug}/` }];
  });
  const band = firstByKey(firstByKey(figures, (figure) => figure.compiler), (figure) => figure.src);
  if (band.length < 2) throw new Error('Front page: fewer than two compiler medallions to show.');
  return band;
}

export async function loadHomeData(): Promise<HomeData> {
  const all = (
    await getCollection('articles', ({ data }) => (import.meta.env.DEV || !data.draft) && !data.preview)
  ).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  if (!all.length) throw new Error('Front page: there are no published studies to show.');

  const works = tafsirWorks();
  const narrations = requireCount('hadith narrations', LIBRARY_NARRATIONS);
  const biographies = requireCount('narrator biographies', taqribReport.narrators);
  const generations = Object.keys(taqribReport.by_rank).filter((rank) => rank !== 'null').length;

  return {
    hero: {
      medallions: medallionBand(),
    },
    studies: {
      all,
      tabs: studyTabs(all),
    },
    hadith: {
      narrations,
      collections: requireCount('hadith collections', LIBRARY_COLLECTIONS.length),
    },
    corpus: { map: compilerMap(), narration: featuredNarration() },
    narrators: {
      biographies,
      generations: requireCount('narrator generations', generations),
      crossReferences: requireCount('narrator cross-references', taqribReport.aliases),
      ladder: generationLadder(),
      biography: featuredBiography(),
    },
    tafsir: { works, layers: await verseLayers(), coverage: surahCoverage() },
    history: { chronology: historyChronology() },
    resources: resourcesFigure(),
    youtube: youtubeFigure(),
    openSource: openSourceFigure(),
  };
}
