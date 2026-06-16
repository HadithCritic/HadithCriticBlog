import type { Citation } from '../citations/citationTypes';
import { CitationPanel } from '../citations/CitationPanel';
import { Tabs } from '../ui/Tabs';
import { extractCitations, extractHeadings, parseFrontmatter } from '../../lib/markdown';
import { formatFrontmatterValue } from '../../lib/markdown';

type ResearchTab = 'outline' | 'citations' | 'properties';

interface ResearchPanelProps {
  activeTab: ResearchTab;
  documentText: string;
  citations: Citation[];
  onTabChange: (tab: ResearchTab) => void;
  onInsertCitation: (citation: Citation, page?: string) => void;
}

const tabs = [
  { id: 'outline', label: 'Outline' },
  { id: 'citations', label: 'Citations' },
  { id: 'properties', label: 'Properties' },
] satisfies Array<{ id: ResearchTab; label: string }>;

export function ResearchPanel({ activeTab, documentText, citations, onTabChange, onInsertCitation }: ResearchPanelProps) {
  const headings = extractHeadings(documentText);
  const usedCitations = extractCitations(documentText, citations);
  const { frontmatter } = parseFrontmatter(documentText);

  return (
    <aside className="sr-research-panel">
      <Tabs tabs={tabs} value={activeTab} onChange={onTabChange} />
      <div className="sr-research-panel__body">
        {activeTab === 'outline' ? (
          <div className="sr-outline">
            {headings.length ? (
              headings.map((heading) => (
                <button key={`${heading.line}-${heading.text}`} style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}>
                  <span>H{heading.level}</span>
                  {heading.text}
                </button>
              ))
            ) : (
              <p className="sr-empty-text">Headings appear here as you write.</p>
            )}
          </div>
        ) : null}

        {activeTab === 'citations' ? (
          <CitationPanel citations={citations} usedCitations={usedCitations} onInsertCitation={onInsertCitation} />
        ) : null}

        {activeTab === 'properties' ? (
          <dl className="sr-properties">
            <div>
              <dt>Title</dt>
              <dd>{formatFrontmatterValue(frontmatter.title)}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{formatFrontmatterValue(frontmatter.type)}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatFrontmatterValue(frontmatter.created)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatFrontmatterValue(frontmatter.updated)}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </aside>
  );
}
