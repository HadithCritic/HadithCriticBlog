/* The front page narrator figures, read from the Taqrīb data in
   src/data/rijal/taqrib/: how many entries fall in each of Ibn Ḥajar's twelve
   generations (the ladder), and one entry set out with its parsed fields (the
   biography card). The JSON is read with readFileSync, as the register's own
   pages do, so the 9 MB of narrators never enters the module graph.
   Build time only. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vocab from '../data/rijal/taqrib/vocab.json';
import { englishName } from '../../scripts/rijal/lib/html.mjs';
import { pageHref, pageHtml, registerPages } from './rijal-register';
import { median, ordinal, sharesOf } from './home-data-core';

/* The entry the card sets out: Ibn Wahb, whose Jāmiʿ supplies the narration
   in the corpus section. Any entry with a grade, a generation and a death
   year will build; one without fails. */
const FEATURED_ID = 'taqrib-3694';
/** Fewest dated entries a generation needs before the ladder prints a typical death year. */
const MIN_DATED = 5;

interface Narrator {
  id: string;
  taqrib_no: number;
  name: { full_ar: string; kunya: string[]; nisbas: string[] };
  assessment: { phrase_ar: string | null; rank: number | null; basis: string; companion: boolean };
  generation: { n: number; tier: string | null } | null;
  death: { year_ah: number | null; basis: string; qualifier: string } | null;
  appearances: { codes: string[]; works: string[] };
}

type Texts = Record<string, { ar: string; en?: string } | undefined>;

export interface GenerationRung {
  n: number;
  label: string;
  count: number;
  share: number;
  /** The median death year of its dated entries, when enough are dated. */
  typicalDeath: number | null;
  example: string;
}

export interface LadderFigure {
  rungs: GenerationRung[];
  placed: number;
  total: number;
}

export interface BiographyTag {
  label: string;
  value: string;
  /** The entry's own Arabic wording, where the value is read from it. */
  ar: string | null;
  /** Where the value comes from, when the entry does not state it outright. */
  note: string | null;
}

export interface BiographyFigure {
  number: number;
  name: string;
  ar: string;
  en: string;
  tags: BiographyTag[];
  href: string;
}

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(resolve(process.cwd(), 'src/data/rijal/taqrib', file), 'utf8')) as T;

let loaded: { narrators: Narrator[]; texts: Texts } | null = null;
const data = () => (loaded ??= { narrators: readJson<Narrator[]>('narrators.json'), texts: readJson<Texts>('texts.json') });

const fail = (message: string): never => {
  throw new Error(`Front page narrators: ${message}`);
};

/* Ibn Ḥajar's first generation is the Companions, whom the entries call
   Companions instead of numbering. */
const generationOf = (n: Narrator): number | null =>
  n.generation?.n ?? (n.assessment.companion || n.assessment.rank === 1 ? 1 : null);

/* A name as a rung prints it: the translator's name line up to its first
   comma, without the bracketed readings of the other edition. */
const shortName = (name: string): string => name.replace(/\s*\[[^\]]*\]/g, '').split(',')[0].trim();

/* The entry a rung names: the one cited in the most of the indexed books,
   then the better graded, then the one Ibn Ḥajar wrote most about (a rough
   mark of how well known a man is), then the first in the book. */
function exampleOf(entries: Narrator[], texts: Texts): string {
  const length = (entry: Narrator) => texts[entry.id]?.ar.length ?? 0;
  const ranked = [...entries].sort(
    (a, b) =>
      b.appearances.works.length - a.appearances.works.length ||
      (a.assessment.rank ?? 99) - (b.assessment.rank ?? 99) ||
      length(b) - length(a) ||
      a.taqrib_no - b.taqrib_no,
  );
  for (const entry of ranked) {
    const name = englishName(texts[entry.id]?.en);
    if (name) return shortName(name);
  }
  return fail('a generation has no entry with an English name.');
}

export function generationLadder(): LadderFigure {
  const { narrators, texts } = data();
  const byGeneration = new Map<number, Narrator[]>();
  for (const entry of narrators) {
    const n = generationOf(entry);
    if (n) byGeneration.set(n, [...(byGeneration.get(n) ?? []), entry]);
  }
  const generations = vocab.generations;
  if (generations.length !== 12) fail(`vocab.json lists ${generations.length} generations, not 12.`);
  const counts = generations.map((g) => byGeneration.get(g.n)?.length ?? 0);
  const shares = sharesOf(counts);
  const rungs = generations.map((g, index): GenerationRung => {
    const entries = byGeneration.get(g.n) ?? fail(`no entries in the ${ordinal(g.n)} generation.`);
    const dated = entries.flatMap((entry) => (entry.death?.year_ah ? [entry.death.year_ah] : []));
    const typical = dated.length >= MIN_DATED ? median(dated) : null;
    return {
      n: g.n,
      label: g.en,
      count: counts[index],
      share: shares[index],
      typicalDeath: typical === null ? null : Math.round(typical),
      example: exampleOf(entries, texts),
    };
  });
  return { rungs, placed: counts.reduce((total, count) => total + count, 0), total: narrators.length };
}

const DEATH_NOTES: Record<string, string> = {
  inferred: "century added by Ibn Ḥajar's rule for the generation",
  stated_variant: 'century given in the Abū al-Ashbāl edition',
  stated_century: 'the text marks this as before the century',
};

function worksLine(codes: string[]): string {
  const groups = vocab.sigla_groups as Record<string, { label: string } | undefined>;
  const sigla = vocab.sigla as Record<string, { work: string } | undefined>;
  return codes.map((code) => groups[code]?.label ?? sigla[code]?.work).filter(Boolean).join(', ');
}

function registerHref(id: string): string {
  const page = registerPages.find((p) => pageHtml(p.slug).includes(`id="${id}"`)) ?? fail(`${id} is on no register page.`);
  return `${pageHref(page.slug)}#${id}`;
}

export function featuredBiography(): BiographyFigure {
  const { narrators, texts } = data();
  const entry = narrators.find((n) => n.id === FEATURED_ID) ?? fail(`${FEATURED_ID} is not in narrators.json.`);
  const text = texts[entry.id] ?? fail(`${FEATURED_ID} has no text.`);
  const rank = vocab.ranks.find((r) => r.rank === entry.assessment.rank);
  const generation = vocab.generations.find((g) => g.n === entry.generation?.n);
  const died = entry.death?.year_ah;
  if (!entry.assessment.phrase_ar || !rank || !generation || !died) fail(`${FEATURED_ID} lacks a grade, generation or death year.`);
  const works = worksLine(entry.appearances.codes);
  const tags: BiographyTag[] = [
    { label: 'Grade', value: `${rank!.en}, rank ${rank!.rank} of 12`, ar: entry.assessment.phrase_ar, note: null },
    { label: 'Generation', value: `${ordinal(generation!.n)}: ${generation!.en}`, ar: null, note: null },
    { label: 'Died', value: `${died} AH`, ar: null, note: DEATH_NOTES[entry.death!.basis] ?? null },
    ...(works ? [{ label: 'Appears in', value: works, ar: null, note: null }] : []),
  ];
  return {
    number: entry.taqrib_no,
    name: shortName(englishName(text.en) ?? fail(`${FEATURED_ID} has no English name.`)),
    ar: text.ar,
    en: (text.en ?? '').replace(/^\s*\d{1,4}\s*[-.–]\s*/, ''),
    tags,
    href: registerHref(entry.id),
  };
}
