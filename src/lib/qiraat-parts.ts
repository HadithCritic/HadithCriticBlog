/*
 * A long sura is shown in parts so that no page carries hundreds of position blocks.
 * A part is a run of consecutive positions that never splits a verse, so a verse is
 * always read on one page. Position numbers stay global across the parts of a sura.
 */

export const PART_SIZE = 12;
/* A last part smaller than this is folded into the one before it. */
const MIN_LAST_PART = 4;

export interface PartSpan {
  /** 1-based part number. */
  index: number;
  /** How many parts the sura has. */
  of: number;
  /** First position of the part, as an index into the sura's features. */
  start: number;
  /** One past the last position of the part. */
  end: number;
  firstVerse: number;
  lastVerse: number;
}

interface FeatureLike {
  id: string;
  verse: string;
}

interface WordLike {
  features: string[];
}

interface VerseLike {
  words: WordLike[];
}

interface SuraLike {
  features: FeatureLike[];
  verses: VerseLike[];
}

export function verseNumber(verseId: string): number {
  return Number(verseId.split("-")[2]);
}

/* Returns no parts when the sura fits on one page. */
export function splitParts(features: readonly FeatureLike[], size: number = PART_SIZE): PartSpan[] {
  if (features.length <= size) return [];

  const bounds: number[] = [0];
  for (let i = 1; i < features.length; i += 1) {
    const sameVerse = features[i].verse === features[i - 1].verse;
    if (i - bounds[bounds.length - 1] >= size && !sameVerse) bounds.push(i);
  }
  if (bounds.length > 1 && features.length - bounds[bounds.length - 1] < MIN_LAST_PART) bounds.pop();
  bounds.push(features.length);

  const of = bounds.length - 1;
  return bounds.slice(0, -1).map((start, i) => {
    const end = bounds[i + 1];
    return {
      index: i + 1,
      of,
      start,
      end,
      firstVerse: verseNumber(features[start].verse),
      lastVerse: verseNumber(features[end - 1].verse),
    };
  });
}

/* The sura as one part sees it: its positions, and the verses that hold them, with foreign positions removed. */
export function sliceSura<T extends SuraLike>(data: T, span: PartSpan): T {
  const features = data.features.slice(span.start, span.end);
  const ids = new Set(features.map((feature) => feature.id));
  const verses = data.verses
    .map((verse) => ({ ...verse, words: verse.words.map((word) => ({ ...word, features: word.features.filter((id) => ids.has(id)) })) }))
    .filter((verse) => verse.words.some((word) => word.features.length > 0));
  return { ...data, features, verses };
}

export function partUrl(sura: number, part: number): string {
  return `/projects/quran/sura/${sura}/part/${part}/`;
}
