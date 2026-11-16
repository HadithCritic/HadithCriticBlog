/* Plain arithmetic behind the front page figures, kept free of Astro and data
   imports so node --test can check it (src/lib/tests/home-data.test.mjs).
   src/lib/home-data.ts feeds it the registries. */

export interface KeyCount {
  key: string;
  count: number;
}

/** 13684 -> "13,684". */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Returns the value if it is a whole, non-negative number, and throws
 * otherwise. A figure the page cannot read should fail the build, not print
 * as 0 or NaN.
 */
export function requireCount(label: string, value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`Front page figure "${label}" is missing or is not a whole count (got ${String(value)}).`);
  }
  return value;
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Each value as a share of the largest, from 0 to 1. */
export function sharesOf(values: readonly number[]): number[] {
  const largest = Math.max(0, ...values);
  return values.map((value) => (largest > 0 ? value / largest : 0));
}

/**
 * Counts items by key, in the order given. Keys with no items count as 0, and
 * an item whose key is not in the order throws, so a new category cannot go
 * missing from the page unnoticed.
 */
export function countBy<T>(items: readonly T[], keyOf: (item: T) => string, order: readonly string[]): KeyCount[] {
  const counts = new Map<string, number>(order.map((key) => [key, 0]));
  for (const item of items) {
    const key = keyOf(item);
    const current = counts.get(key);
    if (current === undefined) throw new Error(`Front page count has no place for the key "${key}".`);
    counts.set(key, current + 1);
  }
  return order.map((key) => ({ key, count: counts.get(key) ?? 0 }));
}

/**
 * The first item for each key, in the order given. Items whose key is null or
 * empty are left out. Used where several collections share one medallion.
 */
export function firstByKey<T>(items: readonly T[], keyOf: (item: T) => string | null | undefined): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The map frame written by scripts/site/build-home-map.mjs, in degrees. */
export interface MapFrame {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
}

/**
 * A place's position on the map as percentages of its width and height. The
 * map is equirectangular, so both run straight with the degrees; the shortened
 * longitude only changes the drawing's aspect, which the SVG already has.
 */
export function projectPoint(lon: number, lat: number, frame: MapFrame): { x: number; y: number } {
  if (lon < frame.lonMin || lon > frame.lonMax || lat < frame.latMin || lat > frame.latMax) {
    throw new Error(`Map point ${lon}, ${lat} is outside the map frame. Widen FRAME in scripts/site/build-home-map.mjs and rerun it.`);
  }
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    x: round(((lon - frame.lonMin) / (frame.lonMax - frame.lonMin)) * 100),
    y: round(((frame.latMax - lat) / (frame.latMax - frame.latMin)) * 100),
  };
}

/**
 * The common-era year in which a hijri year begins, by the tabular Islamic
 * calendar (Meeus, Astronomical Algorithms, ch. 9) and the Julian calendar,
 * which is the one historians use for these centuries. 200 AH began in 815.
 */
export function hijriYearStartCE(ah: number): number {
  const julianDay = Math.floor((11 * ah + 3) / 30) + 354 * ah + 1948086;
  const b = julianDay + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const month = e < 14 ? e - 1 : e - 13;
  return month > 2 ? c - 4716 : c - 4715;
}

/**
 * Spreads points on a line so no two are closer than `gap`, moving each
 * crowded group evenly about its own middle and keeping the points' order.
 * Returns the positions in the order the values were given. Groups pushed
 * past `min` or `max` are slid back inside.
 */
export function dodge(values: readonly number[], gap: number, min = -Infinity, max = Infinity): number[] {
  type Group = { members: number[]; start: number };
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value || a.index - b.index);
  const groups: Group[] = [];
  for (const { value } of order) {
    let group: Group = { members: [value], start: value };
    while (groups.length) {
      const previous = groups[groups.length - 1];
      if (previous.start + previous.members.length * gap <= group.start) break;
      groups.pop();
      const members = [...previous.members, ...group.members];
      const middle = sum(members) / members.length;
      group = { members, start: middle - ((members.length - 1) * gap) / 2 };
    }
    groups.push(group);
  }
  const placed = groups.flatMap(({ members, start }) => {
    const span = (members.length - 1) * gap;
    const first = Math.min(Math.max(start, min), max - span);
    return members.map((_, offset) => first + offset * gap);
  });
  const result = new Array<number>(values.length);
  order.forEach(({ index }, position) => {
    result[index] = placed[position];
  });
  return result;
}

export interface AxisTick {
  ah: number;
  ce: number;
  /** Position along the axis, 0 to 100. */
  x: number;
}

export interface TimeAxis {
  start: number;
  end: number;
  ticks: AxisTick[];
  /** Position of a hijri year along the axis, 0 to 100. */
  at: (ah: number) => number;
}

/**
 * A hijri axis wide enough for the given years, from the step at or below the
 * first to the step after the last, ticked every `step` years with the
 * common-era year each tick begins in.
 */
export function timeAxis(years: readonly number[], step: number): TimeAxis {
  if (!years.length) throw new Error('timeAxis: no years to place.');
  const start = Math.floor(Math.min(...years) / step) * step;
  const end = Math.ceil((Math.max(...years) + 1) / step) * step;
  const at = (ah: number) => ((ah - start) / (end - start)) * 100;
  const ticks: AxisTick[] = [];
  for (let ah = start; ah <= end; ah += step) ticks.push({ ah, ce: hijriYearStartCE(ah), x: at(ah) });
  return { start, end, ticks, at };
}

const ENTITIES: Record<string, string> = { quot: '"', amp: '&', apos: "'", nbsp: ' ', lt: '<', gt: '>', '#39': "'" };

/** The text of an HTML fragment: tags dropped, the common entities decoded, spaces collapsed. */
export function htmlText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#39|[a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * A text cut to at most `max` characters for a quotation: whole if it fits,
 * else up to its last full sentence when that keeps at least half, else at a
 * word with an ellipsis.
 */
export function excerpt(text: string, max: number): string {
  const tidy = text.replace(/\s+/g, ' ').trim();
  if (tidy.length <= max) return tidy;
  const head = tidy.slice(0, max);
  const sentence = head.match(/^.*[.!?]["”’)]?(?=\s)/)?.[0];
  if (sentence && sentence.length >= max / 2) return sentence;
  const word = head.slice(0, head.lastIndexOf(' ')).replace(/[\s,;:–-]+$/, '');
  return `${word}…`;
}

/** "1st", "2nd", "11th": the register's way of naming a generation. */
export function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/** The middle of a list of numbers, or null for an empty list. */
export function median(values: readonly number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface KeyGroup<T> {
  key: string;
  total: number;
  items: T[];
}

/**
 * The first `take` items under each key, keys in the given order, each with
 * how many items it has in all. Items keep the order they come in, so a list
 * sorted newest first gives each key its newest. An item whose key is not in
 * the order throws, as in countBy.
 */
export function latestByKey<T>(items: readonly T[], keyOf: (item: T) => string, order: readonly string[], take: number): KeyGroup<T>[] {
  const groups = new Map<string, T[]>(order.map((key) => [key, []]));
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (!group) throw new Error(`Front page: "${key}" is not a known key.`);
    group.push(item);
  }
  return order.map((key) => {
    const all = groups.get(key) ?? [];
    return { key, total: all.length, items: all.slice(0, take) };
  });
}

/** 1691 seconds as "28:11", an hour or more as "1:02:05". */
export function clockTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
