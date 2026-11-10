/**
 * Unit counts and labels for the collection cards and collection pages.
 *
 * Counts come from each collection's chapter-index.json, written by the reader builders, so a card,
 * a page description, and the page itself cannot drift apart. The noun is the collection's own word
 * for its divisions: the builders store it on every index entry, and the older hand-built editions
 * are listed below.
 */
interface IndexEntry { n: number; count: number; noun?: string; unit?: string }

const indexes = import.meta.glob<IndexEntry[]>('../data/hadith-pages/*/chapter-index.json', { eager: true, import: 'default' });
const bySlug = new Map(Object.entries(indexes).map(([file, entries]) => [file.split('/').at(-2) as string, entries]));

// Editions that were built before the index carried a noun.
const LEGACY_NOUNS: Record<string, string> = {
  'musnad-khalifa-ibn-khayyat': 'Section',
  'musnad-sad-ibn-abi-waqqas': 'Chapter',
  'birr-al-walidayn': 'Chapter',
};
// The Birr index also lists the opening isnad as an entry; the published narration count excludes it.
const NARRATION_COUNTS: Record<string, number> = { 'birr-al-walidayn': 78 };
// Editions without a chapter index state their divisions in their own reader.
const FIXED_UNITS: Record<string, { count: number; noun: string }> = { 'fada-il-makka': { count: 7, noun: 'Section' } };

const plural = (count: number, noun: string) => `${count.toLocaleString('en-US')} ${count === 1 ? noun : `${noun}s`}`;

export interface UnitSummary { count: number; noun: string; label: string }

export function unitSummary(slug: string): UnitSummary | null {
  const entries = bySlug.get(slug);
  if (!entries) {
    const fixed = FIXED_UNITS[slug];
    return fixed ? { count: fixed.count, noun: fixed.noun.toLowerCase(), label: plural(fixed.count, fixed.noun.toLowerCase()) } : null;
  }
  const reading = entries.filter(entry => entry.unit !== 'sections');
  const noun = (reading[0]?.noun ?? LEGACY_NOUNS[slug] ?? 'Chapter').toLowerCase();
  // A source with no divisions of its own reads as one undivided text.
  return { count: reading.length, noun, label: reading.length === 1 ? 'Undivided text' : plural(reading.length, noun) };
}

export function narrationCount(slug: string): number | null {
  if (NARRATION_COUNTS[slug]) return NARRATION_COUNTS[slug];
  const entries = bySlug.get(slug);
  return entries ? entries.filter(entry => entry.unit !== 'sections').reduce((sum, entry) => sum + entry.count, 0) : null;
}

/** One title and description pattern for every reader collection page. */
export function collectionFrontMatter(slug: string, title: string) {
  const units = unitSummary(slug);
  const narrations = narrationCount(slug);
  if (!units || narrations == null) throw new Error(`No chapter index for ${slug}.`);
  return {
    title,
    description: `${title}: ${plural(narrations, 'narration')} in ${units.label}, presented in Arabic and English with source references.`,
  };
}
