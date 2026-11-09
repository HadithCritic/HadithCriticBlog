/* Rendering helpers for the Tafsir reader: inline runs to HTML, and the
   editorial labels (section titles, eyebrows) the reader shows around the
   source text. Labels are derived from block types only, never from the
   commentary's meaning, so nothing here can misstate the text. */
import type { Block, Run, SectionKind } from '../data/tafsir';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const verseLabel = (s: number, a: number, b = a) => `${s}:${a}${b > a ? `–${b}` : ''}`;

/**
 * Inline runs as HTML. Qur'anic wording becomes a highlight (the braces the
 * translator used return when highlights are off), citations link to the cited
 * verse, and footnote markers link to their note on the page.
 */
export function runsHtml(runs: Run[] | null | undefined, citeHref: (s: number, a: number) => string): string {
  let out = '';
  for (const run of runs ?? []) {
    if (typeof run === 'string') out += escapeHtml(run);
    else if (run[0] === 'h') {
      const braced = run[2] === 1;
      out += `<span class="tfr-phrase${braced ? '' : ' tfr-phrase--ed'}"${braced ? ' data-braced' : ''} title="${braced ? 'Qur’anic wording, marked by the translator' : 'Wording of the verse (editorial highlight)'}">${runsHtml(run[1], citeHref)}</span>`;
    } else if (run[0] === 'r') {
      out += `<a class="tfr-cite" href="${citeHref(run[2], run[3])}" title="Qur’an ${verseLabel(run[2], run[3], run[4])}">${escapeHtml(run[1])}</a>`;
    } else if (run[0] === 'n') {
      out += `<a class="tfr-noteref" href="#note-${run[2]}" data-note-link="${run[2]}" aria-label="Editor's note ${escapeHtml(run[1])}">${escapeHtml(run[1])}</a>`;
    } else if (run[0] === 'i') out += `<i>${escapeHtml(run[1])}</i>`;
  }
  return out;
}

/** Reading text without markup: braces and asterisks dropped, markers kept as written. */
export function runsText(runs: Run[] | null | undefined): string {
  let out = '';
  for (const run of runs ?? []) {
    if (typeof run === 'string') out += run;
    else if (run[0] === 'h') out += runsText(run[1]);
    else out += run[1];
  }
  return out;
}

/** The verse wording a lemma heading quotes, verbatim and shortened, for titles. */
export function lemmaPhrase(runs: Run[]): string | null {
  const text = runsText(runs).replace(/\s+/g, ' ');
  const after = text.includes(':') ? text.slice(text.indexOf(':') + 1) : text;
  const clean = after.replace(/\(\d+\)/g, '').replace(/[“”"{}]/g, '').replace(/\s+/g, ' ').trim().replace(/[.,;:]+$/, '');
  if (!clean) return null;
  const words = clean.split(' ');
  return words.length > 8 ? `${words.slice(0, 8).join(' ')}…` : clean;
}

const EYEBROW: Record<SectionKind | 'intro', string> = {
  explain: "The commentator's explanation",
  reports: 'Transmitted explanations',
  argument: 'Question and answer',
  language: 'Language and expression',
  readings: "The commentator's explanation",
  intro: 'Surah introduction',
};

const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

/** Eyebrow and title for a section, from its kind and its blocks. */
export function sectionLabels(kind: SectionKind, blocks: Block[], commentator: string, intro = false) {
  const eyebrow = intro ? EYEBROW.intro : EYEBROW[kind];
  if (intro) return { eyebrow, title: 'Opening of the surah' };
  if (kind === 'reports') {
    const n = blocks.filter((b) => b.t === 'report').length;
    return { eyebrow, title: `${NUMBER_WORDS[n] ?? n} transmitted reports` };
  }
  const lemma = blocks[0]?.t === 'lemma' ? lemmaPhrase(blocks[0].x) : null;
  if (lemma) return { eyebrow, title: `On “${lemma}”` };
  if (kind === 'argument') return { eyebrow, title: 'An objection and its answer' };
  if (kind === 'language') return { eyebrow, title: 'Language and usage' };
  if (kind === 'readings') return { eyebrow, title: 'How the verse is read' };
  return { eyebrow, title: blocks.some((b) => b.t === 'p' && b.v) ? `${commentator}'s explanation` : 'Discussion' };
}

export const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** The opening of a passage, cut at a word boundary near `max` characters, for
    previews. Highlights that fit are kept; the cut is marked with an ellipsis. */
export function excerptRuns(runs: Run[], max: number): Run[] {
  const out: Run[] = [];
  let used = 0;
  for (const run of runs) {
    const text = typeof run === 'string' ? run : run[0] === 'h' ? runsText(run[1]) : run[1];
    if (used + text.length <= max) {
      out.push(run);
      used += text.length;
      continue;
    }
    if (typeof run === 'string') {
      const room = run.slice(0, max - used);
      out.push(`${room.slice(0, Math.max(0, room.lastIndexOf(' '))).trimEnd()}…`);
    } else out.push('…');
    return out;
  }
  return out;
}
