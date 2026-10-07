import worksFile from "../data/tafsir/works.json";
import names from "../data/quran-sura-names.json";
import verseText from "../data/quran-verses.json";
import { loadSuras, type SuraEntry } from "./qiraat-suras";
import { partUrl } from "./qiraat-parts";
import {
  eraOf,
  indexEntries,
  readVerse,
  validateSura,
  validateWorks,
  verseNumberOf,
  type Entry,
  type QFeature,
  type QQari,
  type ReadingRef,
  type SuraEntriesFile,
  type VerseReading,
  type SurahMaterial,
  type Work,
  type WorksFile,
} from "./tafsir-core";

export * from "./tafsir-core";

/*
 * The data behind /projects/tafsir/. The registry is src/data/tafsir/works.json; entries for a
 * sura live in src/data/tafsir/sura-NNN.json and only exist once something has been entered.
 * Verse text and qirāʾāt positions come from the qirāʾāt module. Both files are validated here,
 * so a bad entry fails the build instead of rendering.
 */

export const registry = worksFile as unknown as WorksFile;
export const works: Work[] = [...registry.works].sort((a, b) => a.death_ah - b.death_ah);

export const eraIdOf = (work: Work): string => eraOf(registry.eras, work.century)?.id ?? "e1";
export const shortName = (work: Work): string => work.title.replace(/^Tafsīr\s+/, "");

export interface CenturyGroup {
  century: (typeof registry.centuries)[number];
  era: string;
  works: Work[];
}

/** Every century in order with its works, for the hub and the picker. Empty centuries are kept so the timeline is whole. */
export const centuryGroups: CenturyGroup[] = registry.centuries.map((century) => ({
  century,
  era: eraOf(registry.eras, century.n)?.id ?? "e1",
  works: works.filter((w) => w.century === century.n),
}));

const qiraat = loadSuras();
const qiraatBySura = new Map<number, SuraEntry>(qiraat.map((s) => [s.n, s]));
const qaris = (qiraat[0]?.data.qaris ?? []) as QQari[];

const riwayat = (qiraat[0]?.data.riwayat ?? []) as { id: string; display: string; qari: string }[];

/** "Warsh from Nāfiʿ", or "Nāfiʿ" for a reading named by its qāriʾ. */
export function readingName(ref: ReadingRef): string {
  if (ref.kind === "qari") return qaris.find((q) => q.id === ref.id)?.display ?? ref.id;
  const riwaya = riwayat.find((r) => r.id === ref.id);
  const qari = qaris.find((q) => q.id === riwaya?.qari);
  return riwaya ? `${riwaya.display} from ${qari?.display ?? riwaya.qari}` : ref.id;
}

/** One sentence on the reading a work is shown in. */
export function readingStatus(work: Work): string {
  const { status, default: ref } = work.reading;
  if (!ref) return "Not established yet. Verses are shown in the Cairo text, and where the ten readers differ the position is marked but left open.";
  const state = status === "reviewed" ? "Reviewed" : "Proposed, not yet reviewed";
  return `${state}: read with ${readingName(ref)}, except where an entry states otherwise.`;
}

export function extentStatus(work: Work): string {
  if (work.extent.status === "not_measured") return "Which suras this edition reaches has not been measured yet.";
  return `${work.extent.suras.length} of 114 suras.`;
}

const registryProblems = validateWorks(registry, qaris);
if (registryProblems.length) throw new Error(`src/data/tafsir/works.json:\n  ${registryProblems.join("\n  ")}`);

const entryFiles = import.meta.glob("../data/tafsir/sura-*.json", { eager: true, import: "default" });
const entriesBySura = new Map<number, SuraEntriesFile>(
  Object.entries(entryFiles).map(([path, data]) => [Number(path.match(/sura-(\d+)\.json$/)![1]), data as SuraEntriesFile]),
);

/*
 * Works imported by their own builder (src/data/tafsir/works/<id>/sura-NNN.json,
 * al-Ṭabarī first) are merged into the sura they belong to, so each builder can
 * rewrite its own files without touching another's.
 */
const workFiles = import.meta.glob("../data/tafsir/works/*/sura-*.json", { eager: true, import: "default" });
for (const [path, data] of Object.entries(workFiles)) {
  const n = Number(path.match(/sura-(\d+)\.json$/)![1]);
  const file = data as SuraEntriesFile;
  const base = entriesBySura.get(n) ?? { schemaVersion: file.schemaVersion, sura: n, entries: [], silent: {}, surahMaterial: [] };
  entriesBySura.set(n, {
    ...base,
    entries: [...base.entries, ...file.entries],
    silent: { ...base.silent, ...file.silent },
    surahMaterial: [...(base.surahMaterial ?? []), ...(file.surahMaterial ?? [])],
  });
}

const workIds = new Set(works.map((w) => w.id));
for (const [n, file] of entriesBySura) {
  const problems = file.sura === n ? validateSura(file, workIds, names[n - 1].verses, featuresOf(n)) : [`file is named for sura ${n} but says ${file.sura}`];
  if (problems.length) throw new Error(`src/data/tafsir/sura-${String(n).padStart(3, "0")}.json:\n  ${problems.join("\n  ")}`);
}

function featuresOf(n: number): QFeature[] {
  return (qiraatBySura.get(n)?.data.features ?? []) as unknown as QFeature[];
}

const texts = verseText as Record<string, { ar: string; en: string } | undefined>;

export interface VerseWord {
  text: string;
  /** Ids of the qirāʾāt positions on this word. */
  features: string[];
}

export interface TafsirVerse {
  number: number;
  en: string | null;
  /** Word by word when the qirāʾāt module has the sura, so positions can be marked. */
  words: VerseWord[];
  features: { id: string; word: string; href: string }[];
  /** Per work: its entries here, the reading it has here, and whether it was read and found silent. */
  byWork: Record<string, { entries: Entry[]; reading: VerseReading; silent: boolean }>;
}

export interface TafsirSura {
  n: number;
  name: (typeof names)[number];
  prev: { n: number; latin: string } | null;
  next: { n: number; latin: string } | null;
  /** True when the verse text and positions come from the qirāʾāt module's Cairo text. */
  collated: boolean;
  verses: TafsirVerse[];
  /** Per work: passages the source assigns to this sura but not safely to a verse. */
  surahMaterial: Record<string, SurahMaterial[]>;
  /** Verses with at least one entry, per work. A count, not a ranking. */
  coverage: Record<string, number>;
}

/* A position lives on the sura page, or on the part page of a long sura. */
function positionHref(n: number, featureId: string): string {
  const sura = qiraatBySura.get(n);
  if (!sura) return `/projects/quran/`;
  const index = sura.data.features.findIndex((f) => f.id === featureId);
  const part = sura.parts.find((p) => index >= p.start && index < p.end);
  return `${part ? partUrl(n, part.index) : `/projects/quran/sura/${n}/`}#${featureId}`;
}

export function entryCount(n: number): number {
  const file = entriesBySura.get(n);
  return (file?.entries.length ?? 0) + (file?.surahMaterial?.length ?? 0);
}

export function totalEntries(): number {
  const ids = new Set<string>();
  for (const [sura, file] of entriesBySura) {
    for (const entry of [...file.entries, ...(file.surahMaterial ?? [])]) ids.add(entry.source_entry_id ?? `${sura}:${entry.id}`);
  }
  return ids.size;
}

export function entriesForWork(id: string): number {
  const ids = new Set<string>();
  for (const [sura, file] of entriesBySura) {
    for (const entry of [...file.entries, ...(file.surahMaterial ?? [])]) {
      if (entry.work === id) ids.add(entry.source_entry_id ?? `${sura}:${entry.id}`);
    }
  }
  return ids.size;
}

export function loadTafsirSura(n: number): TafsirSura {
  const name = names[n - 1];
  const sura = qiraatBySura.get(n);
  const features = featuresOf(n);
  const file = entriesBySura.get(n) ?? null;
  const index = indexEntries(file);
  const surahMaterial = Object.fromEntries(works.map((work) => [
    work.id,
    (file?.surahMaterial ?? []).filter((entry) => entry.work === work.id),
  ]));
  const link = (m: number) => (m >= 1 && m <= 114 ? { n: m, latin: names[m - 1].latin } : null);

  const verses: TafsirVerse[] = [];
  for (let number = 1; number <= name.verses; number += 1) {
    const cairo = sura?.data.verses.find((v) => v.number === number);
    const words: VerseWord[] = cairo
      ? cairo.words.map((w) => ({ text: w.text, features: w.features }))
      : [{ text: texts[`${n}:${number}`]?.ar ?? "", features: [] }];
    const here = features.filter((f) => verseNumberOf(f.verse) === number);
    const byWork: TafsirVerse["byWork"] = {};
    for (const work of works) {
      const entries = index.get(work.id)?.get(number) ?? [];
      byWork[work.id] = {
        entries,
        reading: readVerse(work, here, entries, qaris),
        silent: file?.silent[work.id]?.includes(number) ?? false,
      };
    }
    verses.push({
      number,
      en: texts[`${n}:${number}`]?.en ?? null,
      words,
      features: here.map((f) => ({ id: f.id, word: f.words.map((w) => w.text).join(" ") || (f.lemma ?? ""), href: positionHref(n, f.id) })),
      byWork,
    });
  }

  const coverage = Object.fromEntries(works.map((w) => [w.id, index.get(w.id)?.size ?? 0]));
  return { n, name, prev: link(n - 1), next: link(n + 1), collated: Boolean(sura), verses, surahMaterial, coverage };
}
