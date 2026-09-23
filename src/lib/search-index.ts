/**
 * Plain-text extraction for the article search index.
 *
 * The index used to be written by a hand-run script, scripts/build_search_index.cjs,
 * that parsed frontmatter with regexes. Nothing ran it on build, so the
 * committed file drifted from the articles, and its description pattern
 * stopped at the first apostrophe, which cut 9 of 81 descriptions short
 * ("A strengthened Qur"). The index is now an endpoint built with the site from
 * the content collection (src/pages/search-index.json.ts), so the frontmatter
 * comes from Astro's own parser and the file cannot go stale.
 *
 * The text cleanup below is carried over from the old script unchanged, so the
 * searchable text is the same as it was.
 */

export interface SearchSection {
  heading: string;
  slug: string;
  text: string;
}

function stripCodeAndMdx(content: string): string {
  let clean = content.replace(/^import\s+[\s\S]*?;(?:\r?\n|$)/gm, '');
  clean = clean.replace(/^import\s+['"][^'"]+['"];?(?:\r?\n|$)/gm, '');
  clean = clean.replace(/^export\s+(?:const|let|var|function|default)\s+[\s\S]*?;(?:\r?\n|$)/gm, '');
  clean = clean.replace(/```[\s\S]*?```/g, ' ');
  // MDX components, such as <IsnadDiagram ... /> and <HadithBlock>...</HadithBlock>.
  clean = clean.replace(/<[A-Z][A-Za-z0-9_]*[\s\S]*?(\/>|<\/[A-Z][A-Za-z0-9_]*>)/g, ' ');
  clean = clean.replace(/<!--[\s\S]*?-->/g, ' ');
  clean = clean.replace(/<[^>]+>/g, ' ');
  return clean;
}

export function cleanMarkdown(md: string): string {
  return stripCodeAndMdx(md)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[\^[^\]]+\]:?[^\n]*/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]+/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The old script's anchor slug, kept only as a fallback. */
function fallbackSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Split an article body into its `##` sections.
 *
 * `slugs` are the depth-2 heading anchors Astro generated for the rendered
 * page, in order. They are what a result link has to point at, and the old
 * script's own slugify dropped every non-ASCII letter, so a heading such as
 * "Ṣaḥīḥ al-Bukhārī" linked to an anchor that did not exist. When the heading
 * count in the source and in the render disagree, the old slug is used rather
 * than pairing a section with the wrong anchor.
 */
export function extractSections(body: string, slugs: string[]): SearchSection[] {
  const lines = stripCodeAndMdx(body).split(/\r?\n/);
  const headingCount = lines.filter((line) => /^##\s+(.+)$/.test(line)).length;
  const useRendered = headingCount === slugs.length;

  const sections: SearchSection[] = [];
  let heading = 'Introduction';
  let slug = '';
  let paragraphs: string[] = [];
  let index = 0;

  const flush = () => {
    const text = cleanMarkdown(paragraphs.join(' '));
    if (text.length > 20) sections.push({ heading, slug, text });
  };

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (!match) {
      paragraphs.push(line);
      continue;
    }
    flush();
    heading = match[1].trim();
    slug = useRendered ? slugs[index] : fallbackSlug(heading);
    index++;
    paragraphs = [];
  }
  flush();

  return sections;
}
