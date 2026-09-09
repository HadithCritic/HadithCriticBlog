/**
 * Search snippets, generated in application code.
 *
 * FTS5's own snippet() needs the indexed text to be retrievable, which a
 * contentless table (`content=''`) cannot do — it stores an inverted index and
 * nothing else. Storing the text a second time inside FTS would add roughly
 * 360 MB to D1 for data the same query already returns from `hadith`, so the
 * window is cut here instead.
 *
 * Highlighting Arabic accurately is the reason this is more than a substring
 * search. The index holds normalised text (alif forms folded, hamza dropped),
 * so a match found in normalised space sits at a different offset than in the
 * text a reader should see. `normalizeWithMap` records where every normalised
 * character came from, which makes the mapping back exact rather than
 * approximate.
 *
 * All output is HTML-escaped here and only <mark> is reintroduced, so a corpus
 * that later contains angle brackets cannot inject markup. The present corpus
 * has none, but that is a property of today's data, not a guarantee.
 */

import { normalizeArabic, hasArabic } from './arabic-normalize';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/**
 * Normalise while recording the source offset of each output character.
 * `map[i]` is the index in `raw` that produced `out[i]`.
 */
function normalizeWithMap(raw: string): { out: string; map: number[] } {
  let out = '';
  const map: number[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    const folded = normalizeArabic(raw[i]);
    for (const ch of folded) {
      out += ch;
      map.push(i);
    }
  }
  return { out, map };
}

export interface SnippetOptions {
  /** Characters of context to keep around the match. */
  window?: number;
  /** Ellipsis inserted where text was cut. */
  ellipsis?: string;
}

/**
 * Return an HTML-safe excerpt of `text` centred on the first query term,
 * with every occurrence of any term wrapped in <mark>.
 *
 * Falls back to the opening of the text when no term is found, which happens
 * when the hit was in a different column than the one being displayed.
 */
export function makeSnippet(
  text: string | null | undefined,
  query: string,
  opts: SnippetOptions = {}
): string {
  if (!text) return '';
  const window = opts.window ?? 220;
  const ellipsis = opts.ellipsis ?? ' … ';

  const terms = query
    .split(/\s+/)
    .map((t) => (hasArabic(t) ? normalizeArabic(t) : t.toLowerCase()))
    .filter((t) => t.length > 1);

  if (!terms.length) {
    return escapeHtml(text.slice(0, window)) + (text.length > window ? escapeHtml(ellipsis) : '');
  }

  const { out: haystack, map } = normalizeWithMap(text);
  const lowered = haystack.toLowerCase();

  // Every hit, in normalised space, mapped back to raw offsets.
  const hits: { start: number; end: number }[] = [];
  for (const term of terms) {
    let from = 0;
    for (;;) {
      const at = lowered.indexOf(term, from);
      if (at === -1) break;
      const rawStart = map[at];
      const rawEnd = at + term.length - 1 < map.length ? map[at + term.length - 1] + 1 : text.length;
      hits.push({ start: rawStart, end: rawEnd });
      from = at + term.length;
    }
  }

  if (!hits.length) {
    return escapeHtml(text.slice(0, window)) + (text.length > window ? escapeHtml(ellipsis) : '');
  }

  hits.sort((a, b) => a.start - b.start);

  // Merge overlaps so adjacent terms do not produce nested <mark>.
  const merged: { start: number; end: number }[] = [];
  for (const hit of hits) {
    const last = merged[merged.length - 1];
    if (last && hit.start <= last.end) last.end = Math.max(last.end, hit.end);
    else merged.push({ ...hit });
  }

  // Centre the window on the first hit, clamped to the text.
  const first = merged[0];
  let start = Math.max(0, first.start - Math.floor(window / 3));
  let end = Math.min(text.length, start + window);
  if (end - start < window) start = Math.max(0, end - window);

  // Do not cut a word in half at either edge.
  if (start > 0) {
    const space = text.indexOf(' ', start);
    if (space !== -1 && space - start < 20) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space !== -1 && end - space < 20) end = space;
  }

  let html = '';
  let cursor = start;
  for (const hit of merged) {
    if (hit.end <= start || hit.start >= end) continue;
    const from = Math.max(hit.start, start);
    const to = Math.min(hit.end, end);
    html += escapeHtml(text.slice(cursor, from));
    html += `<mark>${escapeHtml(text.slice(from, to))}</mark>`;
    cursor = to;
  }
  html += escapeHtml(text.slice(cursor, end));

  return (
    (start > 0 ? escapeHtml(ellipsis) : '') +
    html +
    (end < text.length ? escapeHtml(ellipsis) : '')
  );
}
