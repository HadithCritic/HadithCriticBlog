import type { ReactElement, ReactNode } from 'react';
import type { Citation } from '../citations/citationTypes';
import { HadithBlock } from '../hadith/HadithBlock';
import { parseFrontmatter, splitMarkdownBlocks } from '../../lib/markdown';

interface MarkdownPreviewProps {
  source: string;
  citations: Citation[];
  onCitationClick?: (id: string) => void;
}

export function MarkdownPreview({ source, citations, onCitationClick }: MarkdownPreviewProps) {
  const { body } = parseFrontmatter(source);
  const blocks = splitMarkdownBlocks(body);

  return (
    <article className="sr-preview" dir="auto">
      {blocks.map((block, index) =>
        block.type === 'hadith' ? (
          <HadithBlock key={`${block.raw}-${index}`} data={block.data} />
        ) : (
          <MarkdownText key={`${block.text}-${index}`} source={block.text} citations={citations} onCitationClick={onCitationClick} />
        ),
      )}
    </article>
  );
}

function MarkdownText({ source, citations, onCitationClick }: MarkdownPreviewProps) {
  const citationMap = new Map(citations.map((citation) => [citation.id, citation]));
  const lines = source.split(/\r?\n/);
  const elements: ReactElement[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    elements.push(
      <p key={`p-${elements.length}`} dir="auto">
        <InlineText text={paragraph.join(' ')} citationMap={citationMap} onCitationClick={onCitationClick} />
      </p>,
    );
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    elements.push(
      <ul key={`ul-${elements.length}`}>
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>
            <InlineText text={item} citationMap={citationMap} onCitationClick={onCitationClick} />
          </li>
        ))}
      </ul>,
    );
    list = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length, 4);
      elements.push(
        renderHeading(level, `h-${elements.length}`,
          <InlineText text={heading[2]} citationMap={citationMap} onCitationClick={onCitationClick} />
        ),
      );
      return;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      elements.push(
        <blockquote key={`bq-${elements.length}`} dir="auto">
          <InlineText text={trimmed.replace(/^>\s?/, '')} citationMap={citationMap} onCitationClick={onCitationClick} />
        </blockquote>,
      );
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <>{elements}</>;
}

function InlineText({
  text,
  citationMap,
  onCitationClick,
}: {
  text: string;
  citationMap: Map<string, Citation>;
  onCitationClick?: (id: string) => void;
}) {
  const pattern = /\[\[cite:([^:\]]+)(?::([^\]]+))?\]\]/g;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }

    const citation = citationMap.get(match[1]);
    parts.push(
      <button
        key={`${match[0]}-${match.index}`}
        className="sr-inline-cite"
        type="button"
        onClick={() => onCitationClick?.(match?.[1] ?? '')}
      >
        {citation ? `${citation.author}${citation.year ? ` ${citation.year}` : ''}` : match[1]}
        {match[2] ? `, ${match[2]}` : ''}
      </button>,
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}

function renderHeading(level: number, key: string, children: ReactNode) {
  if (level === 1) return <h1 key={key} dir="auto">{children}</h1>;
  if (level === 2) return <h2 key={key} dir="auto">{children}</h2>;
  if (level === 3) return <h3 key={key} dir="auto">{children}</h3>;
  return <h4 key={key} dir="auto">{children}</h4>;
}
