import type { Citation, UsedCitation } from '../components/citations/citationTypes';
import type { HadithBlockData } from '../components/hadith/hadithTypes';

export interface FrontmatterResult {
  frontmatter: Record<string, string>;
  body: string;
}

export interface Heading {
  level: number;
  text: string;
  line: number;
}

export type MarkdownBlock =
  | { type: 'markdown'; text: string }
  | { type: 'hadith'; raw: string; data: HadithBlockData };

export function parseFrontmatter(source: string): FrontmatterResult {
  if (!source.startsWith('---')) {
    return { frontmatter: {}, body: source };
  }

  const end = source.indexOf('\n---', 3);
  if (end === -1) {
    return { frontmatter: {}, body: source };
  }

  const rawFrontmatter = source.slice(3, end).trim();
  const body = source.slice(end + 4).replace(/^\r?\n/, '');
  const frontmatter: Record<string, string> = {};

  for (const line of rawFrontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }

  return { frontmatter, body };
}

export function extractHeadings(source: string): Heading[] {
  const { body } = parseFrontmatter(source);
  return body
    .split(/\r?\n/)
    .map((line, index) => {
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (!match) return null;
      return {
        level: match[1].length,
        text: match[2].replace(/[#*_`]/g, '').trim(),
        line: index + 1,
      };
    })
    .filter((heading): heading is Heading => Boolean(heading));
}

export function extractCitations(source: string, citations: Citation[]): UsedCitation[] {
  const citationMap = new Map(citations.map((citation) => [citation.id, citation]));
  const used: UsedCitation[] = [];
  const citationPattern = /\[\[cite:([^:\]]+)(?::([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = citationPattern.exec(source))) {
    used.push({
      id: match[1],
      page: match[2],
      raw: match[0],
      citation: citationMap.get(match[1]),
    });
  }

  return used;
}

export function splitMarkdownBlocks(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const pattern = /:::hadith\s*\r?\n([\s\S]*?)\r?\n:::/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    const markdown = source.slice(cursor, match.index);
    if (markdown.trim()) {
      blocks.push({ type: 'markdown', text: markdown });
    }

    blocks.push({
      type: 'hadith',
      raw: match[0],
      data: parseHadithBlock(match[1]),
    });
    cursor = match.index + match[0].length;
  }

  const tail = source.slice(cursor);
  if (tail.trim()) {
    blocks.push({ type: 'markdown', text: tail });
  }

  return blocks;
}

export function parseHadithBlock(raw: string): HadithBlockData {
  const data: Record<string, string> = {};
  let currentKey: string | null = null;
  let multiline = false;

  for (const line of raw.split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(\|)?\s*(.*)$/);

    if (keyMatch) {
      currentKey = keyMatch[1];
      multiline = Boolean(keyMatch[2]);
      data[currentKey] = multiline ? '' : keyMatch[3].trim();
      continue;
    }

    if (currentKey && multiline) {
      const value = line.replace(/^ {2}/, '');
      data[currentKey] = data[currentKey] ? `${data[currentKey]}\n${value}` : value;
    }
  }

  return data;
}

export function formatFrontmatterValue(value?: string) {
  return value && value.trim() ? value : 'Not set';
}

export function makeHadithSnippet() {
  return `\n:::hadith
id: source-id
collection: Collection Name
reference: Reference
arabic: |
  النص العربي هنا
english_isnad: |
  Preserve the full English transmission wording here.
english_matn: |
  Translate the matn here. Use God and the Messenger of God in translation.
:::\n`;
}

export function makeQuranSnippet() {
  return `\n:::quran
surah: 
ayah: 
arabic: |
  
translation: |
  
:::\n`;
}

export function makeFootnoteSnippet() {
  return `[^note]: `;
}
