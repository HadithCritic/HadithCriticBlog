/*
 * The tafsir module, without any file loading, so it can be tested under plain node.
 *
 * A commentary is read in the reading it follows. That reading is a property of the work
 * (its default, once established from its own text) and can be overridden for one verse by
 * an entry that states the reading the commentator glosses there. Readings among the ten are
 * resolved against the qirāʾāt collation; a reading outside it is kept as the book's own form.
 */

export type ReviewState = "proposed" | "reviewed";

export interface Citation {
  volume: string | null;
  page: string;
}

export interface ReadingRef {
  /** A riwāya id (warsh, hafs) or a qāriʾ id (nafi, asim) from the qirāʾāt data. */
  kind: "riwaya" | "qari";
  id: string;
}

export interface WorkReading {
  status: "not_established" | ReviewState;
  default: ReadingRef | null;
  /** How the reading was established, in our words. */
  basis: string | null;
  evidence: (Citation & { quote: string })[];
}

export interface Work {
  id: string;
  title: string;
  title_ar: string;
  author: string;
  author_ar: string;
  death_ah: number;
  century: number;
  dating_basis: string;
  edition: {
    shamela_book_id: string;
    editor_ar: string | null;
    publisher_ar: string;
    edition_ar: string;
    volumes: number;
  };
  extent: { status: "not_measured" | "measured"; suras: number[] };
  reading: WorkReading;
}

export interface Century {
  n: number;
  label: string;
  range: string;
}

/** A run of centuries drawn in one color. Color marks when an author died, never which book. */
export interface Era {
  id: string;
  from: number;
  to: number;
  label: string;
}

export interface WorksFile {
  schemaVersion: string;
  source: string;
  eras: Era[];
  centuries: Century[];
  works: Work[];
}

/** A reading among the ten, named by its qirāʾāt position and group value. */
export interface CollatedReading {
  feature: string;
  value: string;
}

/** A reading the commentary states that the collation does not hold, in the book's own form. */
export interface StatedReading {
  form: string;
  note: string | null;
}

export type EntryReading = CollatedReading | StatedReading;

export interface Entry {
  id: string;
  work: string;
  verses: { from: number; to: number };
  /** The Qurʾānic words the comment glosses, as the book prints them. */
  lemma: string | null;
  reading: EntryReading[];
  /** The commentary, reproduced exactly. */
  text: string;
  /** Source-preserving catalogue text; either or both may be present. */
  text_ar?: string | null;
  text_en?: string | null;
  translation_status?: string | null;
  locator_status?: string;
  content_tags?: string[];
  cross_references?: { surah_number: number; verse_start?: number; verse_end?: number; verse_number?: number; reference_text?: string; reference_text_ar?: string }[];
  printed_label?: string | null;
  /** The last page, when a passage runs past the one it starts on. */
  page_end?: string | null;
  source_record_serial?: string | null;
  source_entry_id?: string | null;
  sequence_position?: number | null;
  foot_note_ar?: string | null;
  foot_note_en?: string | null;
  citation: Citation;
  review_state: ReviewState;
}

export interface SurahMaterial extends Omit<Entry, "verses"> {
  /** This is intentionally null: the source does not safely identify a verse. */
  verses: null;
  placement: "surah";
  verse_references: { surah_number: number; verse_start?: number; verse_end?: number; verse_number?: number; reference_text?: string; reference_text_ar?: string }[];
}

export interface SuraEntriesFile {
  schemaVersion: string;
  sura: number;
  entries: Entry[];
  /** Verses a work has been read for and has nothing on. */
  silent: Record<string, number[]>;
  /** Material catalogued under a surah where the source does not safely identify a verse. */
  surahMaterial?: SurahMaterial[];
}

/* The parts of the qirāʾāt data the reading layer needs. */
export interface QGroup {
  kind: string;
  tone: number | null;
  short: string;
  value?: string;
  value_label?: string;
  includes_hafs: boolean;
}

export interface QFeature {
  id: string;
  verse: string;
  words: { id: string; text: string }[];
  lemma?: string | null;
  groups: QGroup[];
  cells: Record<string, { g: number }>;
}

export interface QQari {
  id: string;
  display: string;
  riwayat: string[];
}

export interface ResolvedReading {
  /** Our short label for the reading, or what the books say when they do not settle it. */
  label: string;
  /** A, B, C as on the qirāʾāt pages; A is the reading that includes Ḥafṣ. Null when unsettled. */
  letter: string | null;
  cairo: boolean | null;
  source: "entry" | "default";
}

export interface PositionReading {
  feature: string;
  word: string;
  reading: ResolvedReading | null;
}

export interface VerseReading {
  positions: PositionReading[];
  stated: (StatedReading & { entry: string })[];
}

const KIND_LABEL: Record<string, string> = {
  differs: "The books differ",
  reported: "Reported, not listed",
  unstated: "Not stated in the books cited",
};

export const eraOf = (eras: Era[], century: number): Era | undefined => eras.find((e) => century >= e.from && century <= e.to);

/* A long sura is shown in parts of this many verses; a last part under MIN_LAST is folded into the one before. */
export const PART_VERSES = 25;
const MIN_LAST = 8;

export interface VersePart {
  index: number;
  of: number;
  first: number;
  last: number;
}

export function versePartsOf(verseCount: number): VersePart[] {
  if (verseCount <= PART_VERSES + MIN_LAST) return [{ index: 1, of: 1, first: 1, last: verseCount }];
  const bounds: number[] = [];
  for (let start = 1; start <= verseCount; start += PART_VERSES) bounds.push(start);
  if (verseCount - bounds[bounds.length - 1] + 1 < MIN_LAST) bounds.pop();
  return bounds.map((first, i) => ({ index: i + 1, of: bounds.length, first, last: i + 1 < bounds.length ? bounds[i + 1] - 1 : verseCount }));
}

export const tafsirPartUrl = (sura: number, part: VersePart): string =>
  part.index === 1 ? `/projects/tafsir/sura/${sura}/` : `/projects/tafsir/sura/${sura}/part/${part.index}/`;

export const isStated = (reading: EntryReading): reading is StatedReading => "form" in reading;

export const verseNumberOf = (verseId: string) => Number(verseId.slice(verseId.lastIndexOf("-") + 1));

export const featureWord = (feature: QFeature) => (feature.words.length ? feature.words.map((w) => w.text).join(" ") : feature.lemma ?? feature.id);

function describe(group: QGroup, source: ResolvedReading["source"]): ResolvedReading {
  if (group.kind === "reading") {
    return {
      label: group.value_label ?? group.short,
      letter: String.fromCharCode(65 + (group.tone ?? 0)),
      cairo: group.includes_hafs,
      source,
    };
  }
  return { label: KIND_LABEL[group.kind] ?? group.short, letter: null, cairo: null, source };
}

/** The reading a riwāya or a qāriʾ has at one position, or null if the data cannot say. */
export function resolveRef(feature: QFeature, ref: ReadingRef, qaris: QQari[]): ResolvedReading | null {
  const ids = ref.kind === "riwaya" ? [ref.id] : qaris.find((q) => q.id === ref.id)?.riwayat ?? [];
  const groups = [...new Set(ids.map((id) => feature.cells[id]?.g).filter((g): g is number => g !== undefined))];
  if (groups.length === 0) return null;
  if (groups.length > 1) return { label: "His transmitters differ here", letter: null, cairo: null, source: "default" };
  return describe(feature.groups[groups[0]], "default");
}

export function resolveValue(feature: QFeature, value: string): ResolvedReading | null {
  const group = feature.groups.find((g) => g.value === value);
  return group ? describe(group, "entry") : null;
}

/**
 * The reading a work has in one verse: every qirāʾāt position in it, each resolved from an
 * entry that states it, else from the work's default reading, else left open.
 */
export function readVerse(work: Work, features: QFeature[], entries: Entry[], qaris: QQari[]): VerseReading {
  const collated = new Map<string, string>();
  const stated: VerseReading["stated"] = [];
  for (const entry of entries) {
    for (const reading of entry.reading) {
      if (isStated(reading)) stated.push({ ...reading, entry: entry.id });
      else collated.set(reading.feature, reading.value);
    }
  }
  const ref = work.reading.default;
  const positions = features.map((feature) => {
    const value = collated.get(feature.id);
    const reading = value !== undefined ? resolveValue(feature, value) : ref ? resolveRef(feature, ref, qaris) : null;
    return { feature: feature.id, word: featureWord(feature), reading };
  });
  return { positions, stated };
}

/** Entries of one sura by work, then by every verse they cover. */
export function indexEntries(file: SuraEntriesFile | null): Map<string, Map<number, Entry[]>> {
  const byWork = new Map<string, Map<number, Entry[]>>();
  for (const entry of file?.entries ?? []) {
    const byVerse = byWork.get(entry.work) ?? new Map<number, Entry[]>();
    for (let verse = entry.verses.from; verse <= entry.verses.to; verse += 1) {
      byVerse.set(verse, [...(byVerse.get(verse) ?? []), entry]);
    }
    byWork.set(entry.work, byVerse);
  }
  return byWork;
}

/** Every problem with the registry, as readable strings. Empty means valid. */
export function validateWorks(file: WorksFile, qaris: QQari[]): string[] {
  const problems: string[] = [];
  const centuries = new Set(file.centuries.map((c) => c.n));
  const riwayat = new Set(qaris.flatMap((q) => q.riwayat));
  const qariIds = new Set(qaris.map((q) => q.id));
  const seen = new Set<string>();
  const eraIds = new Set<string>();
  for (const era of file.eras) {
    if (eraIds.has(era.id)) problems.push(`era ${era.id}: duplicate id`);
    eraIds.add(era.id);
    if (era.from > era.to) problems.push(`era ${era.id}: runs backwards`);
  }
  for (const c of file.centuries) if (!eraOf(file.eras, c.n)) problems.push(`century ${c.n} is in no era`);
  for (const work of file.works) {
    if (!/^[a-z][a-z0-9_]*$/.test(work.id)) problems.push(`${work.id}: id must be lower snake case`);
    if (seen.has(work.id)) problems.push(`${work.id}: duplicate id`);
    seen.add(work.id);
    if (!eraOf(file.eras, work.century)) problems.push(`${work.id}: century ${work.century} is in no era`);
    if (!centuries.has(work.century)) problems.push(`${work.id}: century ${work.century} is not listed`);
    if (Math.ceil(work.death_ah / 100) !== work.century) problems.push(`${work.id}: death ${work.death_ah} AH is not in century ${work.century}`);
    if (!/^\d+$/.test(work.edition.shamela_book_id)) problems.push(`${work.id}: Shamela book id must be numeric`);
    if (work.extent.status === "not_measured" && work.extent.suras.length) problems.push(`${work.id}: an unmeasured extent lists suras`);
    for (const n of work.extent.suras) if (!(n >= 1 && n <= 114)) problems.push(`${work.id}: extent lists sura ${n}`);
    const { status, default: ref, evidence } = work.reading;
    if ((status === "not_established") !== (ref === null)) problems.push(`${work.id}: a reading has a default exactly when it is established`);
    if (ref && !(ref.kind === "riwaya" ? riwayat : qariIds).has(ref.id)) problems.push(`${work.id}: unknown ${ref.kind} ${ref.id}`);
    if (ref && evidence.length === 0) problems.push(`${work.id}: an established reading needs evidence`);
  }
  return problems;
}

/** Every problem with one sura's entries. Features are the sura's qirāʾāt positions, if any. */
export function validateSura(file: SuraEntriesFile, workIds: Set<string>, verseCount: number, features: QFeature[]): string[] {
  const problems: string[] = [];
  const featureOf = new Map(features.map((f) => [f.id, f]));
  const inSura = (v: number) => Number.isInteger(v) && v >= 1 && v <= verseCount;
  const seen = new Set<string>();
  for (const entry of file.entries) {
    const at = `${file.sura}/${entry.id}`;
    if (seen.has(entry.id)) problems.push(`${at}: duplicate id`);
    seen.add(entry.id);
    if (!workIds.has(entry.work)) problems.push(`${at}: unknown work ${entry.work}`);
    const { from, to } = entry.verses;
    if (!inSura(from) || !inSura(to) || from > to) problems.push(`${at}: verses ${from} to ${to} are not in sura ${file.sura}`);
    if (!entry.text.trim()) problems.push(`${at}: empty text`);
    if (!entry.citation.page.trim()) problems.push(`${at}: no page`);
    for (const reading of entry.reading) {
      if (isStated(reading)) {
        if (!reading.form.trim()) problems.push(`${at}: a stated reading has no form`);
        continue;
      }
      const feature = featureOf.get(reading.feature);
      if (!feature) {
        problems.push(`${at}: unknown qirāʾāt position ${reading.feature}`);
        continue;
      }
      const verse = verseNumberOf(feature.verse);
      if (verse < from || verse > to) problems.push(`${at}: ${reading.feature} is outside verses ${from} to ${to}`);
      if (!feature.groups.some((g) => g.value === reading.value)) problems.push(`${at}: ${reading.feature} has no reading ${reading.value}`);
    }
  }
  const surahIds = new Set<string>();
  for (const entry of file.surahMaterial ?? []) {
    const at = `${file.sura}/${entry.id}`;
    if (surahIds.has(entry.id)) problems.push(`${at}: duplicate surah-level id`);
    surahIds.add(entry.id);
    if (!workIds.has(entry.work)) problems.push(`${at}: unknown work ${entry.work}`);
    if (entry.verses !== null) problems.push(`${at}: surah-level material must not imply a verse`);
    if (!entry.text.trim()) problems.push(`${at}: empty text`);
    if (!entry.citation.page.trim()) problems.push(`${at}: no page`);
  }
  const covered = indexEntries(file);
  for (const [work, verses] of Object.entries(file.silent)) {
    if (!workIds.has(work)) problems.push(`${file.sura}/silent: unknown work ${work}`);
    for (const v of verses) {
      if (!inSura(v)) problems.push(`${file.sura}/silent/${work}: verse ${v} is not in the sura`);
      if (covered.get(work)?.has(v)) problems.push(`${file.sura}/silent/${work}: verse ${v} also has an entry`);
    }
  }
  return problems;
}
