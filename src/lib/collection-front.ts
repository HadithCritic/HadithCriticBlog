/**
 * Reads a collection's front page out of its editable HTML
 * (src/data/hadith/pages/<slug>/collection.html, written by
 * scripts/hadith/lib/t2-collection-template.mjs and edited by hand since).
 *
 * The HTML stays the source of the title, the compiler line, the hero
 * sentence, the chapter index and the edition notes. CollectionFront.astro
 * sets them in the work's own design; the HTML's embedded stylesheet, its
 * figures strip and its generic "close reading" panel are not carried over.
 * A file this cannot read fails the build rather than printing an empty page.
 */

export interface EditionNote {
  label: string;
  /** Inner HTML of the note after its label, as written in the source. */
  html: string;
}

export interface CollectionFrontData {
  /** Inner HTML of the title, which may hold a line break. */
  titleHtml: string;
  authorLabel: string;
  compiler: string;
  /** As printed, for example "d. 182 AH"; empty when the source gives none. */
  date: string;
  lede: string;
  beginHref: string;
  beginLabel: string;
  exploreHref: string;
  exploreLabel: string;
  /** The chapter index section, as written in the source. */
  indexHtml: string;
  notes: EditionNote[];
  /** Inline scripts the source page runs (the index filter). */
  scripts: string[];
}

/** The template's sentence for works that had no description of their own. */
export const GENERIC_LEDE = /^Explore the collection in its original \w+ order/;

const decode = (text: string): string =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const plain = (html: string): string => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/** Drops the arrows and spacing the template put inside its button labels. */
const label = (html: string): string => plain(html).replace(/[↗↓→]/g, '').trim();

function required(slug: string, what: string, match: RegExpMatchArray | null, group = 1): string {
  const value = match?.[group];
  if (value === undefined) throw new Error(`${slug}: collection.html has no ${what}`);
  return value;
}

/** The section that starts at `start`, through its matching close tag. */
function sectionAt(html: string, start: number): string {
  const tag = /<\/?section\b[^>]*>/g;
  tag.lastIndex = start;
  let depth = 0;
  for (let match = tag.exec(html); match; match = tag.exec(html)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, match.index + match[0].length);
  }
  throw new Error('unclosed <section>');
}

export function parseCollectionHtml(slug: string, html: string): CollectionFrontData {
  const hero = required(slug, 'hero', html.match(/<section class="collection-hero">([\s\S]*?)<\/section>/));
  const titleHtml = required(slug, 'title', hero.match(/<h1 class="hero-title">([\s\S]*?)<\/h1>/)).trim();
  const author = hero.match(
    /<span class="hero-author__label">([^<]*)<\/span>\s*<strong>([^<]*)<\/strong>(?:\s*<span class="hero-author__date">([^<]*)<\/span>)?/
  );
  const lede = plain(required(slug, 'hero sentence', hero.match(/<\/div>\s*<p>([\s\S]*?)<\/p>\s*<div class="hero-actions">/)));
  const actions = [...hero.matchAll(/<a class="pill-btn[^"]*" href="([^"]+)">([\s\S]*?)<\/a>/g)];
  if (actions.length < 2) throw new Error(`${slug}: collection.html hero has ${actions.length} actions, expected 2`);

  const indexStart = html.indexOf('<section id="chapters"');
  if (indexStart < 0) throw new Error(`${slug}: collection.html has no chapter index`);
  const indexHtml = sectionAt(html, indexStart);

  const source = required(slug, 'edition notes', html.match(/<section class="frame source-row">([\s\S]*?)<\/section>/));
  const notes = [...source.matchAll(/<p><b>([^<]*?)\.?<\/b>\s*([\s\S]*?)<\/p>/g)].map((note) => ({
    label: plain(note[1]),
    html: note[2].trim()
  }));
  if (notes.length === 0) throw new Error(`${slug}: collection.html has no edition notes`);

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((script) => script[1]);

  return {
    titleHtml,
    authorLabel: plain(required(slug, 'compiler label', author)),
    compiler: plain(required(slug, 'compiler', author, 2)),
    date: plain(author?.[3] ?? ''),
    lede,
    beginHref: actions[0][1],
    beginLabel: label(actions[0][2]),
    exploreHref: actions[1][1],
    exploreLabel: label(actions[1][2]),
    indexHtml,
    notes,
    scripts
  };
}
