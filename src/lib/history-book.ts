/* Reads one prebuilt history fragment (src/data/history/readers/<slug>.html)
   into a book: parts, chapters and reading pages.

   The fragments are single documents whose headings are very uneven: one
   "chapter" can hold 100,000 words and the next fifteen. A reading page is
   therefore cut here, not in the data. A short chapter is one page. A long
   one is divided at its own headings (years, accounts, entries), and only
   where a stretch has no heading at all is it divided between paragraphs.
   Nothing is dropped or reordered: joining a chapter's pages gives back the
   chapter's text. This module is pure (a string in, a book out) so it can be
   checked from Node without Astro. */

export type HistoryLayout = 'narrative' | 'annals' | 'reports' | 'roster' | 'entries';

export interface HistoryHeading {
  id: string;
  /** 2 for a short chapter sharing a page; 3 for a year, account or entry;
      4 for a topic under it; 5 for a run-in label. */
  level: 2 | 3 | 4 | 5;
  text: string;
  html: string;
  year?: number;
}

export interface HistoryPage {
  slug: string;
  /** The chapter the page opens with, then every chapter on it. Only short
      chapters share a page. */
  chapter: number;
  chapters: number[];
  /** Position within the chapter, from 0, and how many pages the chapter has. */
  index: number;
  of: number;
  /** What the page is called in the contents and the pager. */
  label: string;
  /** True when the page opens in the middle of an unheaded stretch. */
  continued: boolean;
  html: string;
  notes: string;
  translationNotes: string;
  words: number;
  minutes: number;
  headings: HistoryHeading[];
  years: [number, number] | null;
  reports: [number, number] | null;
  folios: [string, string] | null;
  entries: number;
}

export interface HistoryChapter {
  id: string;
  part: number;
  kind: 'chapter' | 'annals' | 'opening';
  number: string | null;
  title: string;
  titleHtml: string;
  sourceTitle: string | null;
  /** A heading the source sets over this chapter and those after it. */
  section: string | null;
  words: number;
  minutes: number;
  pages: number[];
  years: [number, number] | null;
  reports: [number, number] | null;
  entries: number;
}

export interface HistoryPart {
  id: string | null;
  label: string | null;
  title: string | null;
  chapters: number[];
}

export interface HistoryBook {
  slug: string;
  layout: HistoryLayout;
  title: string;
  transliteration: string;
  arabic: string;
  author: string;
  art: string;
  editionNote: string;
  parts: HistoryPart[];
  chapters: HistoryChapter[];
  pages: HistoryPage[];
  /** Every id in the text, and the page it is on. */
  anchors: Record<string, string>;
  words: number;
  minutes: number;
}

const WORDS_PER_MINUTE = 240;
/** A chapter up to this length is one page. */
const SINGLE_PAGE_WORDS = 6000;
/** Pages of a divided chapter aim for this length and never pass the limit. */
const TARGET_WORDS = 4200;
const LIMIT_WORDS = 6000;
/** A last page shorter than this joins the page before it. */
const SHORT_TAIL_WORDS = 900;
/** Short chapters that follow one another share a page up to this length. */
const GATHER_CHAPTER_WORDS = 1200;
const GATHER_PAGE_WORDS = 3000;
/** A prelude this short (a basmala, bare page marks) opens the next chapter. */
const PRELUDE_WORDS = 40;

const VOID_TAGS = new Set(['img', 'br', 'hr', 'wbr']);

const stripTags = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const countWords = (html: string): number => {
  const text = stripTags(html);
  return text ? text.split(' ').length : 0;
};
const toMinutes = (words: number): number => Math.max(1, Math.round(words / WORDS_PER_MINUTE));
const attr = (attrs: string, name: string): string | null => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null;
const inner = (html: string, pattern: RegExp): string | null => html.match(pattern)?.[1] ?? null;

interface Node {
  html: string;
  tag: string;
  cls: string;
  id: string | null;
  words: number;
  /** 3, 2 or 1 where a page may begin: h3, h4, run-in label. 0 otherwise. */
  rank: number;
}

/** The top-level elements of a chapter body, with any loose text kept on the
    element that follows it. */
function topLevelNodes(html: string): Node[] {
  const nodes: Node[] = [];
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  let depth = 0;
  let start = 0;
  let open: { tag: string; attrs: string } | null = null;
  const push = (end: number, tag: string, attrs: string) => {
    const chunk = html.slice(start, end);
    const cls = attr(attrs, 'class') ?? '';
    const rank = tag === 'h3' ? 3 : tag === 'h4' ? 2 : tag === 'p' && /\b(label|subhead)\b/.test(cls) ? 1 : 0;
    nodes.push({ html: chunk, tag, cls, id: attr(attrs, 'id'), words: countWords(chunk), rank });
    start = end;
  };
  for (let match = tagPattern.exec(html); match; match = tagPattern.exec(html)) {
    const [, closing, rawTag, attrs] = match;
    const tag = rawTag.toLowerCase();
    if (closing) {
      depth -= 1;
      if (depth === 0 && open) {
        push(tagPattern.lastIndex, open.tag, open.attrs);
        open = null;
      }
    } else if (VOID_TAGS.has(tag) || attrs.trimEnd().endsWith('/')) {
      if (depth === 0) push(tagPattern.lastIndex, tag, attrs);
    } else {
      if (depth === 0) open = { tag, attrs };
      depth += 1;
    }
  }
  const tail = html.slice(start);
  if (tail.trim() && nodes.length) nodes[nodes.length - 1] = { ...nodes[nodes.length - 1], html: nodes[nodes.length - 1].html + tail };
  return nodes;
}

const sumWords = (nodes: Node[]): number => nodes.reduce((total, node) => total + node.words, 0);

/** Cuts a run of nodes at every node of the given rank. */
function cutAtRank(nodes: Node[], rank: number): Node[][] {
  const runs: Node[][] = [];
  let current: Node[] = [];
  for (const node of nodes) {
    if (node.rank >= rank && current.some((item) => item.words > 0)) {
      // Marks with no text of their own belong to what they precede.
      let keep = current.length;
      while (keep > 0 && current[keep - 1].words === 0 && current[keep - 1].rank === 0) keep -= 1;
      runs.push(current.slice(0, keep));
      current = current.slice(keep);
    }
    current.push(node);
  }
  if (current.length) runs.push(current);
  return runs;
}

/** How good a paragraph boundary is as a page break, judged by the node that
    would open the new page and the one that would close the old. */
function breakQuality(before: Node, after: Node): number {
  if (before.rank > 0) return -2; // a heading stays with its text
  if (/:\s*(<[^>]+>\s*)*$/.test(before.html)) return -1; // "He recited:" stays with what follows
  if (after.tag !== 'p') return 0;
  if (/\brpt\b/.test(after.cls)) return 3;
  const text = stripTags(after.html);
  if (/^\[.*\]$/.test(text)) return 3;
  if (after.words <= 8 && !/[.:,;”"]$/.test(text)) return 2;
  return 1;
}

/** Divides an unheaded stretch between paragraphs into near-equal pages. */
function cutBetweenParagraphs(nodes: Node[]): Node[][] {
  const total = sumWords(nodes);
  const count = Math.ceil(total / TARGET_WORDS);
  if (count < 2) return [nodes];
  const ideal = total / count;
  const window = ideal * 0.18;
  const runs: Node[][] = [];
  let startIndex = 0;
  let passed = 0;
  let running = 0;
  for (let cut = 1; cut < count; cut += 1) {
    const goal = ideal * cut;
    let best = -1;
    let bestScore = -Infinity;
    let acc = running;
    for (let i = startIndex; i < nodes.length - 1; i += 1) {
      acc += nodes[i].words;
      if (acc < goal - window) continue;
      if (acc > goal + window && best >= 0) break;
      const score = breakQuality(nodes[i], nodes[i + 1]) * 1000 - Math.abs(acc - goal);
      if (score > bestScore) {
        bestScore = score;
        best = i;
        passed = acc;
      }
      if (acc > goal + window) break;
    }
    if (best < startIndex) break;
    while (best > startIndex && nodes[best].words === 0) best -= 1;
    runs.push(nodes.slice(startIndex, best + 1));
    startIndex = best + 1;
    running = passed;
  }
  runs.push(nodes.slice(startIndex));
  return runs.filter((run) => run.length);
}

/** Blocks no longer than the limit, cut at the coarsest heading that works. */
function atomicBlocks(nodes: Node[], rank = 3): Node[][] {
  if (sumWords(nodes) <= LIMIT_WORDS) return [nodes];
  if (rank === 0) return cutBetweenParagraphs(nodes);
  const runs = cutAtRank(nodes, rank);
  return runs.flatMap((run) => (sumWords(run) > LIMIT_WORDS ? atomicBlocks(run, rank - 1) : [run]));
}

/** Packs a chapter's blocks into pages. Marks and anchors that carry no text
    travel with the block that follows them. */
function paginate(nodes: Node[]): Node[][] {
  if (sumWords(nodes) <= SINGLE_PAGE_WORDS) return [nodes];
  const blocks = atomicBlocks(nodes);
  const pages: Node[][] = [];
  let current: Node[] = [];
  let size = 0;
  for (const block of blocks) {
    const words = sumWords(block);
    if (current.length && size + words > TARGET_WORDS && size > 0) {
      pages.push(current);
      current = [];
      size = 0;
    }
    current = [...current, ...block];
    size += words;
  }
  if (current.length) pages.push(current);
  const last = pages[pages.length - 1];
  if (pages.length > 1 && sumWords(last) < SHORT_TAIL_WORDS && sumWords(pages[pages.length - 2]) + sumWords(last) <= LIMIT_WORDS) {
    pages.splice(pages.length - 2, 2, [...pages[pages.length - 2], ...last]);
  }
  return pages;
}

/** "page-39" reads 39, "page-volume-2-115" reads 2:115. */
function folioLabel(id: string): string {
  const volume = id.match(/^page-volume-(\d+)-(\d+)$/);
  if (volume) return `${volume[1]}:${volume[2]}`;
  const intro = id.match(/^page-introduction-(\d+)$/);
  if (intro) return `intro. ${intro[1]}`;
  return id.replace(/^page-/, '');
}

/** Source page marks keep their ids; the last of each run also carries the
    number to print in the margin. */
function markFolios(html: string): string {
  return html.replace(/(?:<span class="pa" id="[^"]+"><\/span>\s*)+/g, (run) => {
    const ids = [...run.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
    return ids
      .map((id, index) => (index === ids.length - 1 ? `<span class="pa" id="${id}" data-p="${folioLabel(id)}"></span>` : `<span class="pa" id="${id}"></span>`))
      .join('');
  });
}

const yearOf = (text: string): number | undefined => {
  const match = text.match(/\b[Yy]ear (\d{1,3})\b/);
  return match ? Number(match[1]) : undefined;
};

interface RawChapter {
  id: string;
  /** The title of an empty chapter that stands over this one in the source. */
  section: string | null;
  kind: HistoryChapter['kind'];
  number: string | null;
  titleHtml: string;
  sourceTitle: string | null;
  body: string;
}

/** A year chapter of al-Fasawī's annals as a year heading and its text, so a
    run of short years can share a page. */
function yearAsHeading(id: string, year: string, titleHtml: string): string {
  const plain = stripTags(titleHtml).toLowerCase().replace(/[\[\]]/g, '');
  const redundant = new RegExp(`^(in )?the year ${year}( ah)?$`).test(plain);
  const sub = redundant ? '' : `<span class="year-sub">${titleHtml}</span>`;
  return `<h3 class="year" id="${id}"><span class="year-n">The Year ${year}</span>${sub}</h3>`;
}

interface Section {
  attrs: string;
  body: string;
}

function sectionsOf(article: string): Section[] {
  return [...article.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)].map((match) => ({ attrs: match[1], body: match[2] }));
}

function notesOf(section: string): Map<string, string> {
  const notes = new Map<string, string>();
  for (const chunk of section.split('<div class="note" ').slice(1)) {
    const end = chunk.lastIndexOf('</div></div>');
    if (end < 0) continue;
    const html = `<div class="note" ${chunk.slice(0, end + 12)}`;
    const id = attr(html, 'id');
    if (id) notes.set(id, html);
  }
  return notes;
}

function translationNotesOf(fragment: string): Map<string, string> {
  const notes = new Map<string, string>();
  const panel = fragment.slice(fragment.indexOf('<aside class="notes-panel"'));
  if (!panel.startsWith('<aside')) return notes;
  for (const match of panel.matchAll(/<section class="tn"[^>]*>[\s\S]*?<\/section>/g)) {
    const anchor = match[0].match(/class="tn-go" href="#([^"]+)"/)?.[1];
    if (anchor) notes.set(anchor, match[0]);
  }
  return notes;
}

const span = (values: number[]): [number, number] | null => (values.length ? [Math.min(...values), Math.max(...values)] : null);

export function parseHistoryBook(slug: string, fragment: string): HistoryBook {
  const cover = inner(fragment, /<section class="cover">([\s\S]*?)<\/section>/) ?? '';
  const articleStart = fragment.indexOf('<article class="bk-text"');
  const articleEnd = fragment.lastIndexOf('</article>');
  if (articleStart < 0 || articleEnd < 0) throw new Error(`History fragment ${slug} has no text article.`);
  const article = fragment.slice(fragment.indexOf('>', articleStart) + 1, articleEnd);

  const layout = (inner(fragment, /data-layout="([a-z]+)"/) ?? 'narrative') as HistoryLayout;
  let editionNote = '';
  let notes = new Map<string, string>();
  const translationNotes = translationNotesOf(fragment);

  const parts: HistoryPart[] = [{ id: null, label: null, title: null, chapters: [] }];
  const raw: { chapter: RawChapter; part: number }[] = [];
  let prelude = '';
  let over: { id: string | null; title: string } | null = null;
  const sectionIds: [string, string][] = [];
  let openings = 0;
  let afterPart = false;

  for (const section of sectionsOf(article)) {
    const cls = attr(section.attrs, 'class') ?? '';
    const id = attr(section.attrs, 'id');
    if (cls === 'front') {
      if (id === 'edition-note') editionNote = section.body.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '').trim();
      continue;
    }
    if (cls === 'notes') {
      notes = notesOf(section.body);
      continue;
    }
    if (cls === 'part') {
      parts.push({
        id,
        label: stripTags(inner(section.body, /<span class="part-label">([\s\S]*?)<\/span>/) ?? '') || null,
        title: stripTags(inner(section.body, /<h2[^>]*>([\s\S]*?)<\/h2>/) ?? '') || null,
        chapters: [],
      });
      afterPart = true;
      continue;
    }
    if (!cls.includes('chapter')) continue;

    const part = parts.length - 1;
    const header = inner(section.body, /^\s*<header>([\s\S]*?)<\/header>/);
    const body = header === null ? section.body : section.body.slice(section.body.indexOf('</header>') + 9);

    if (cls.includes('chapter--plain')) {
      if (countWords(body) <= PRELUDE_WORDS) {
        prelude += body;
        continue;
      }
      openings += 1;
      const partTitle = parts[part].title ?? parts[part].label;
      const title = afterPart && partTitle ? `Start of ${partTitle}` : openings === 1 ? 'Opening' : 'Continuation';
      raw.push({
        part,
        chapter: { id: openings === 1 ? 'opening' : `opening-${openings}`, section: null, kind: 'opening', number: null, titleHtml: title, sourceTitle: null, body: prelude + body },
      });
      prelude = '';
      afterPart = false;
      continue;
    }

    afterPart = false;
    const titleHtml = (inner(header ?? '', /<h2[^>]*>([\s\S]*?)<\/h2>/) ?? '').trim();
    const year = inner(header ?? '', /<span class="yr">(\d+)<\/span>/);
    const chapterId = id ?? `chapter-${raw.length + 1}`;
    // A chapter with a title and no text of its own is a heading over the chapters after it.
    if (!cls.includes('chapter--year') && countWords(body) === 0 && titleHtml) {
      over = { id, title: stripTags(titleHtml) };
      prelude += body;
      continue;
    }
    if (cls.includes('chapter--year') && year) {
      const block = yearAsHeading(chapterId, year, titleHtml) + prelude + body;
      prelude = '';
      const previous = raw[raw.length - 1];
      // Opening matter that already holds year headings belongs to the annals that follow it.
      if (previous && previous.part === part && previous.chapter.kind === 'annals') {
        raw[raw.length - 1] = { part, chapter: { ...previous.chapter, body: previous.chapter.body + block } };
      } else if (previous && previous.part === part && previous.chapter.kind === 'opening' && /<h3 class="year"/.test(previous.chapter.body)) {
        raw[raw.length - 1] = { part, chapter: { ...previous.chapter, id: 'annals', kind: 'annals', titleHtml: 'The annals', body: previous.chapter.body + block } };
      } else {
        raw.push({ part, chapter: { id: raw.some((item) => item.chapter.id === 'annals') ? `annals-${raw.length + 1}` : 'annals', section: null, kind: 'annals', number: null, titleHtml: 'The annals', sourceTitle: null, body: block } });
      }
      continue;
    }

    const number = stripTags(inner(header ?? '', /<span class="num">([\s\S]*?)<\/span>/) ?? '').replace(/^Chapter\s+/i, '') || null;
    raw.push({
      part,
      chapter: {
        id: chapterId,
        section: over?.title ?? null,
        kind: 'chapter',
        number,
        titleHtml,
        sourceTitle: stripTags(inner(header ?? '', /<p class="src-title">([\s\S]*?)<\/p>/) ?? '') || null,
        body: prelude + body,
      },
    });
    if (over?.id) sectionIds.push([over.id, chapterId]);
    over = null;
    prelude = '';
  }

  const kept = parts.filter((_, index) => raw.some((item) => item.part === index));
  const partIndex = new Map(kept.map((part, index) => [parts.indexOf(part), index]));
  const chapters: HistoryChapter[] = [];
  const pages: HistoryPage[] = [];
  const anchors: Record<string, string> = {};
  let generated = 0;
  /** True while the last page holds only short chapters and can take another. */
  let gathering = false;

  for (const { chapter, part: rawPart } of raw) {
    const part = partIndex.get(rawPart) ?? 0;
    const chapterIndex = chapters.length;
    const title = stripTags(chapter.titleHtml);
    const runs = paginate(topLevelNodes(markFolios(chapter.body)));
    const pageIndexes: number[] = [];
    const last = pages[pages.length - 1];
    const short = runs.length === 1 && chapter.kind === 'chapter' && sumWords(runs[0]) <= GATHER_CHAPTER_WORDS;
    const joins = short && gathering && last !== undefined && chapters[last.chapter].part === part && last.words + sumWords(runs[0]) <= GATHER_PAGE_WORDS;

    runs.forEach((run, index) => {
      const slug = joins && last ? last.slug : index === 0 ? chapter.id : `${chapter.id}-${index + 1}`;
      const headings: HistoryHeading[] = [];
      const html = run
        .map((node) => {
          if (!node.rank) return node.html;
          const level = node.rank === 3 ? 3 : node.rank === 2 ? 4 : 5;
          let nodeHtml = node.html;
          let id = node.id;
          if (!id) {
            generated += 1;
            id = `mark-${generated}`;
            nodeHtml = nodeHtml.replace(/<(h3|h4|p)\b/, `<$1 id="${id}"`);
          }
          const body = nodeHtml.replace(/^[\s\S]*?<(?:h3|h4|p)\b[^>]*>/, '').replace(/<\/(?:h3|h4|p)>\s*$/, '');
          const yearText = inner(body, /<span class="year-n">([\s\S]*?)<\/span>/);
          const text = stripTags(body.replace(/<\/span><span class="year-sub">/, '</span>: <span class="year-sub">'));
          headings.push({ id, level, text, html: body, year: yearText ? yearOf(yearText) : undefined });
          return nodeHtml;
        })
        .join('');

      const noteIds = [...new Set([...html.matchAll(/href="#(translator-note-\d+)"/g)].map((match) => match[1]))];
      const tnIds = [...html.matchAll(/class="tn-anchor" id="([^"]+)"/g)].map((match) => match[1]);
      const folios = [...html.matchAll(/data-p="([^"]+)"/g)].map((match) => match[1]);
      const reports = [...html.matchAll(/id="report-(\d+)"/g)].map((match) => Number(match[1]));
      const years = headings.flatMap((heading) => (heading.year === undefined ? [] : [heading.year]));
      const words = sumWords(run);
      const first = run.find((node) => node.words > 0);
      const continued = index > 0 && !(first && first.rank > 0);
      const yearSpan = span(years);
      // A page is named for what its own headings say and nothing more: a
      // stretch the source leaves unheaded is only "Part 5" of its chapter.
      let label = title;
      if (runs.length > 1) {
        if (yearSpan && yearSpan[0] !== yearSpan[1]) label = `Years ${yearSpan[0]} to ${yearSpan[1]}`;
        else if (yearSpan && !continued) label = `The Year ${yearSpan[0]}`;
        else if (index === 0) label = title;
        else if (continued) label = `Part ${index + 1}`;
        else label = headings[0].text;
      }

      for (const match of html.matchAll(/\bid="([^"]+)"/g)) anchors[match[1]] = slug;
      for (const id of noteIds) {
        anchors[id] ??= slug;
      }
      if (joins && last) {
        // A short chapter goes onto the page before it, under its own heading.
        const head = [
          chapter.section ? `<p class="ch-section">${chapter.section}</p>` : '',
          chapter.number ? `<p class="ch-num">Chapter ${chapter.number}</p>` : '',
          `<h2 class="ch-title">${chapter.titleHtml}</h2>`,
          chapter.sourceTitle ? `<p class="src-title">${chapter.sourceTitle}</p>` : '',
        ].join('');
        const merged = [last.folios, folios.length ? [folios[0], folios[folios.length - 1]] : null].filter((item) => item !== null);
        pageIndexes.push(pages.length - 1);
        pages[pages.length - 1] = {
          ...last,
          chapters: [...last.chapters, chapterIndex],
          html: `${last.html}<section class="gathered" id="${chapter.id}"><header class="ch-head">${head}</header>${html}</section>`,
          notes: last.notes + noteIds.map((id) => notes.get(id) ?? '').join(''),
          translationNotes: last.translationNotes + tnIds.map((id) => translationNotes.get(id) ?? '').join(''),
          words: last.words + words,
          minutes: toMinutes(last.words + words),
          headings: [...last.headings, { id: chapter.id, level: 2, text: title, html: chapter.titleHtml }, ...headings],
          years: span([...(last.years ?? []), ...years]),
          reports: span([...(last.reports ?? []), ...reports]),
          folios: merged.length ? [merged[0][0], merged[merged.length - 1][1]] : null,
          entries: last.entries + (html.match(/<p class="entry"/g) ?? []).length,
        };
        return;
      }
      pageIndexes.push(pages.length);
      pages.push({
        slug,
        chapter: chapterIndex,
        chapters: [chapterIndex],
        index,
        of: runs.length,
        label,
        continued,
        html,
        notes: noteIds.map((id) => notes.get(id) ?? '').join(''),
        translationNotes: tnIds.map((id) => translationNotes.get(id) ?? '').join(''),
        words,
        minutes: toMinutes(words),
        headings,
        years: yearSpan,
        reports: span(reports),
        folios: folios.length ? [folios[0], folios[folios.length - 1]] : null,
        entries: (html.match(/<p class="entry"/g) ?? []).length,
      });
    });

    gathering = short;
    anchors[chapter.id] = pages[pageIndexes[0]].slug;
    const words = sumWords(runs.flat());
    const own = joins ? [] : pageIndexes.map((index) => pages[index]);
    chapters.push({
      id: chapter.id,
      part,
      kind: chapter.kind,
      number: chapter.number,
      title,
      titleHtml: chapter.titleHtml,
      sourceTitle: chapter.sourceTitle,
      section: chapter.section,
      words,
      minutes: toMinutes(words),
      pages: pageIndexes,
      years: span(own.flatMap((page) => page.years ?? [])),
      reports: span(joins ? [...chapter.body.matchAll(/id="report-(\d+)"/g)].map((match) => Number(match[1])) : own.flatMap((page) => page.reports ?? [])),
      entries: (chapter.body.match(/<p class="entry"/g) ?? []).length,
    });
    kept[part].chapters.push(chapterIndex);
  }

  for (const [id, chapterId] of sectionIds) anchors[id] = anchors[chapterId];
  for (const part of kept) {
    if (part.id && part.chapters.length) anchors[part.id] = anchors[chapters[part.chapters[0]].id];
  }

  const words = pages.reduce((total, page) => total + page.words, 0);
  return {
    slug,
    layout,
    title: stripTags(inner(cover, /<h1>([\s\S]*?)<\/h1>/) ?? slug),
    transliteration: stripTags(inner(cover, /<div class="tr">([\s\S]*?)<\/div>/) ?? ''),
    arabic: stripTags(inner(cover, /<div class="ar"[^>]*>([\s\S]*?)<\/div>/) ?? ''),
    author: stripTags(inner(cover, /<div class="au">([\s\S]*?)<\/div>/) ?? ''),
    art: inner(cover, /class="cover-art" src="([^"]+)"/) ?? '',
    editionNote,
    parts: kept,
    chapters,
    pages,
    anchors,
    words,
    minutes: toMinutes(words),
  };
}

/** "about 9 hours", "about 40 minutes". */
export function readingTime(minutes: number): string {
  if (minutes < 50) return `about ${Math.max(5, Math.round(minutes / 5) * 5)} minutes`;
  const hours = Math.round(minutes / 60);
  return `about ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}
