type Range = [number, number];

/** Every occurrence of every phrase, with overlapping ranges merged. */
function phraseRanges(raw: string, phrases: string[]): Range[] {
  const ranges: Range[] = [];
  for (const phrase of new Set(phrases.filter(Boolean))) {
    let start = raw.indexOf(phrase);
    while (start !== -1) {
      ranges.push([start, start + phrase.length]);
      start = raw.indexOf(phrase, start + phrase.length);
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  return ranges.reduce<Range[]>((merged, range) => {
    const previous = merged.at(-1);
    return previous && range[0] <= previous[1]
      ? [...merged.slice(0, -1), [previous[0], Math.max(previous[1], range[1])]]
      : [...merged, range];
  }, []);
}

/** Emphasize source wording without ever searching generated HTML. The
    `secondary` phrases are marked in a second tone; where one overlaps a
    primary phrase, the primary mark wins. */
export function highlightSource(
  raw: string | undefined,
  phrases: string[],
  format: (value: string) => string,
  secondary: string[] = []
): string {
  if (!raw) return '';
  const primary = phraseRanges(raw, phrases);
  const overlapsPrimary = ([start, end]: Range) => primary.some(([a, b]) => start < b && a < end);
  const marks = [
    ...primary.map((range) => ({ range, tone: 'hc-source-mark' })),
    ...phraseRanges(raw, secondary)
      .filter((range) => !overlapsPrimary(range))
      .map((range) => ({ range, tone: 'hc-source-mark hc-source-mark--alt' })),
  ].sort((a, b) => a.range[0] - b.range[0]);
  let cursor = 0;
  let html = '';
  for (const { range: [start, end], tone } of marks) {
    html += format(raw.slice(cursor, start));
    html += `<mark class="${tone}">${format(raw.slice(start, end))}</mark>`;
    cursor = end;
  }
  return html + format(raw.slice(cursor));
}

const normalize = (value: string, arabic: boolean) => value
  .normalize('NFD')
  .replace(arabic ? /[\u064B-\u065F\u0670\u06D6-\u06ED]/g : /$^/, '')
  .replace(arabic ? /ٱ/g : /$^/, 'ا')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

/** Map normalized phrase matches back to the untouched display parts. A match
    marks every part from its first word to its last, so the spaces and
    punctuation inside a phrase are marked with it. */
export function markedSourceParts(parts: string[], phrases: string[], arabic: boolean): Set<number> {
  const words: { value: string; part: number }[] = [];
  parts.forEach((part, index) => {
    for (const value of normalize(part, arabic).split(/\s+/).filter(Boolean)) {
      words.push({ value, part: index });
    }
  });
  const marked = new Set<number>();
  for (const phrase of phrases) {
    const sequence = normalize(phrase, arabic).split(/\s+/).filter(Boolean);
    if (!sequence.length) continue;
    for (let start = 0; start <= words.length - sequence.length; start++) {
      if (sequence.every((word, offset) => words[start + offset].value === word)) {
        const last = words[start + sequence.length - 1].part;
        for (let part = words[start].part; part <= last; part++) marked.add(part);
      }
    }
  }
  return marked;
}

export interface SourceRun {
  text: string;
  marked: boolean;
}

/** Join display parts into runs, so one highlighted phrase renders as one
    mark rather than a mark per word with the spaces left bare. */
export function sourceRuns(parts: string[], marked: Set<number>): SourceRun[] {
  return parts.reduce<SourceRun[]>((runs, text, index) => {
    const isMarked = marked.has(index);
    const previous = runs.at(-1);
    return previous && previous.marked === isMarked
      ? [...runs.slice(0, -1), { text: previous.text + text, marked: isMarked }]
      : [...runs, { text, marked: isMarked }];
  }, []);
}
