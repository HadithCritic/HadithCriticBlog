/* Renders one verse of al-Ṭabarī's commentary from the imported surah data
   (src/data/tafsir/tabari/surahs/NNN.json) into the reader's markup: the same
   chapters, report cards and question-and-answer blocks the hand-edited
   al-Fātiḥa pages use (src/data/tafsir/pages/tabari/reader.css).

   Every word comes from the block's source runs. The labels around them
   (chapter titles, "Transmission wording", "Question") are editorial and are
   derived from the block types only. */
import type { Block, Run, TafsirNote, TafsirSurah, TafsirUnit } from '../data/tafsir/tafsir';
import { escapeHtml, pad, runsText, sectionLabels, verseLabel } from './tafsir-render';

type CiteHref = (surah: number, ayah: number) => string;

export interface VersePage {
  html: string;
  chapters: { id: string; label: string }[];
  notes: { index: number; note: TafsirNote }[];
  reports: number;
  words: number;
  /** The widest range a passage on this page treats together, when it is more than this verse. */
  shared: { start: number; end: number } | null;
}

const SQ_TITLE = 'Qur’anic wording quoted within the commentary';

function runsHtml(runs: Run[] | null | undefined, cite: CiteHref): string {
  let out = '';
  for (const run of runs ?? []) {
    if (typeof run === 'string') out += escapeHtml(run);
    else if (run[0] === 'h') out += `<span class="scripture-quote" title="${SQ_TITLE}">${runsHtml(run[1], cite)}</span>`;
    else if (run[0] === 'r') out += `<a class="qref" href="${cite(run[2], run[3])}" title="Qur’an ${verseLabel(run[2], run[3], run[4])}">${escapeHtml(run[1])}</a>`;
    else if (run[0] === 'n') out += `<a class="tfr-noteref" href="#note-${run[2]}" data-note-link="${run[2]}" aria-label="Editor's note ${escapeHtml(run[1])}">${escapeHtml(run[1])}</a>`;
    else if (run[0] === 'i') out += `<em>${escapeHtml(run[1])}</em>`;
  }
  return out;
}

const editionLine = (unit: TafsirUnit): string => {
  if (unit.ed.print === 'en') {
    const { volumes, pages } = unit.ed;
    if (!volumes.length) return '';
    return `English edition, vol. ${volumes.join(', ')}${pages.length ? `, p. ${pages[0]}${pages.length > 1 ? `–${pages.at(-1)}` : ''}` : ''}`;
  }
  const { pages } = unit.ed;
  if (!pages.length) return '';
  const [first, last] = [pages[0], pages.at(-1)!];
  return `Arabic edition, vol. ${first.v}, p. ${first.p}${last.p !== first.p || last.v !== first.v ? `–${last.v !== first.v ? `${last.v}:` : ''}${last.p}` : ''}`;
};

/** The blocks of one section. Consecutive reports share one card group. */
function sectionHtml(blocks: Block[], indices: number[], cite: CiteHref, counter: { reports: number }): string {
  const html = (runs: Run[] | null | undefined) => runsHtml(runs, cite);
  let out = '';
  let group: string[] = [];
  const flush = () => {
    if (group.length) out += `<div class="report-group">${group.join('')}</div>`;
    group = [];
  };
  for (const i of indices) {
    const b = blocks[i];
    if (b.t === 'report') {
      const n = pad(++counter.reports);
      group.push(
        `<article class="report" id="report-${counter.reports}">` +
        `<header class="report__header"><span aria-hidden="true" class="report__emblem${n.length > 2 ? ' report__emblem--long' : ''}">${n}</span>` +
        `<div class="report__byline"><span class="report__eyebrow">${b.via ? 'Transmitted from' : 'Transmitted report'} <span class="report__number">${n}</span></span><h3>${escapeHtml(b.via ?? 'Chain not separated')}</h3></div></header>` +
        (b.c ? `<div class="isnad-inline"><span class="isnad-label">Transmission wording</span><div class="isnad-text">${html(b.c)}</div></div>` : '') +
        `<div class="report__text">${html(b.m)}</div></article>`,
      );
      continue;
    }
    flush();
    if (b.t === 'p') {
      out += `<div class="prose">${b.v ? `<span class="speaker-label">${escapeHtml(b.v)}</span>` : ''}<p>${html(b.x)}</p></div>`;
    } else if (b.t === 'lemma') {
      out += `<div class="prose tfg-lemma"><span class="speaker-label">The heading in the commentary</span><p>${html(b.x)}</p></div>`;
    } else if (b.t === 'intro') {
      out += `<p class="report-intro">${html(b.x)}</p>`;
    } else if (b.t === 'quote') {
      const [, text, s, a, e] = b.r;
      out += `<figure class="verse-poetry tfg-quote"><figcaption>Qur’anic cross-reference · <a class="qref" href="${cite(s, a)}">Q ${verseLabel(s, a, e)}</a></figcaption><blockquote>${html(b.x)}</blockquote><div class="prose tfg-quote__source">Cited in the source as ${escapeHtml(text)}${escapeHtml(b.tp ?? '')}</div></figure>`;
    } else if (b.t === 'arg') {
      out +=
        `<div class="exchange"><div class="exchange__turn exchange__turn--question"><span class="exchange__label">${escapeHtml(b.q.l || 'Question')}</span><div class="prose"><p>${html(b.q.x)}</p></div></div>` +
        `<div class="exchange__turn exchange__turn--answer"><span class="exchange__label">${escapeHtml(b.a.l || 'Answer')}</span><div class="prose"><p>${html(b.a.x)}</p></div></div></div>`;
    } else if (b.t === 'poem') {
      out +=
        `<figure class="verse-poetry"><figcaption>Poetic evidence</figcaption>${b.i ? `<div class="prose">${html(b.i)}</div>` : ''}` +
        `<blockquote>${b.lines ? b.lines.map((line) => `<span>${html(line)}</span>`).join('<br>') : html(b.x)}</blockquote></figure>`;
    }
  }
  flush();
  return out;
}

/** Everything al-Ṭabarī's commentary has for one verse, as chapters. */
export function renderVerse(surah: TafsirSurah, verse: number, commentator: string, cite: CiteHref): VersePage {
  const ayah = surah.ayahs[verse - 1];
  const keys = [...(verse === 1 ? surah.intro : []), ...(ayah?.u ?? [])].filter((k, i, all) => all.indexOf(k) === i);
  const chapters: VersePage['chapters'] = [];
  const counter = { reports: 0 };
  let words = 0;
  let shared: VersePage['shared'] = null;
  let html = '';
  for (const key of keys) {
    const unit = surah.units[String(key)];
    if (!unit) continue;
    words += unit.w;
    const isIntro = unit.k === 'intro';
    if (unit.s !== null && unit.e !== null && unit.e > unit.s && (!shared || unit.e - unit.s > shared.end - shared.start)) shared = { start: unit.s, end: unit.e };
    const where = editionLine(unit);
    unit.sec.forEach((section, at) => {
      const blocks = section.b.map((i) => unit.b[i]);
      const { eyebrow, title } = sectionLabels(section.k, blocks, commentator, isIntro);
      const n = chapters.length + 1;
      const id = `chapter-${n}`;
      chapters.push({ id, label: title });
      const range = at === 0 && unit.s !== null && unit.e !== null && unit.e > unit.s
        ? `<p class="chapter__lede">This passage treats verses ${unit.s} to ${unit.e} together, so it also appears on their pages.</p>`
        : '';
      html +=
        `<section aria-labelledby="${id}-title" class="chapter" id="${id}"><header class="chapter__heading"><span class="chapter__number">${pad(n)}</span>` +
        `<div><span class="section-label">${escapeHtml(eyebrow)}</span><h2 id="${id}-title">${escapeHtml(title)}</h2></div></header>${range}` +
        `<div class="chapter__content">${sectionHtml(unit.b, section.b, cite, counter)}</div>` +
        (at === unit.sec.length - 1 && where ? `<p class="tfg-where">${escapeHtml(where)}</p>` : '') +
        `</section>`;
    });
  }
  const notes = (ayah?.nt ?? []).map((index) => ({ index, note: surah.notes[index] })).filter((entry) => entry.note);
  return { html, chapters, notes, reports: counter.reports, words, shared };
}

/** Words of commentary filed under each verse of a surah, for the surah's index. */
export function verseWords(surah: TafsirSurah): number[] {
  return surah.ayahs.map((ayah) => ayah.u.reduce((sum: number, key) => sum + (surah.units[String(key)]?.w ?? 0), 0));
}

export const noteSearch = (note: TafsirNote): string =>
  `${note.en} ${note.ar ?? ''} vol. ${note.v}${note.p ? `, p. ${note.p}` : ''}`.toLocaleLowerCase();

export { runsText };
