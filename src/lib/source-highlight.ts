/** Emphasize source wording without ever searching generated HTML. */
export function highlightSource(
  raw: string | undefined,
  phrases: string[],
  format: (value: string) => string
): string {
  if (!raw) return '';
  const ranges: [number, number][] = [];
  for (const phrase of new Set(phrases.filter(Boolean))) {
    let start = raw.indexOf(phrase);
    while (start !== -1) {
      ranges.push([start, start + phrase.length]);
      start = raw.indexOf(phrase, start + phrase.length);
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  let cursor = 0;
  let html = '';
  for (const [start, end] of merged) {
    html += format(raw.slice(cursor, start));
    html += `<mark class="hc-source-mark">${format(raw.slice(start, end))}</mark>`;
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

/** Map normalized phrase matches back to the untouched display parts. */
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
        for (let offset = 0; offset < sequence.length; offset++) marked.add(words[start + offset].part);
      }
    }
  }
  return marked;
}
