import type { Citation, UsedCitation } from './citationTypes';
import { formatCitationDetail, formatCitationLabel } from '../../lib/citations';
import { CitationPicker } from './CitationPicker';

interface CitationPanelProps {
  citations: Citation[];
  usedCitations: UsedCitation[];
  onInsertCitation: (citation: Citation, page?: string) => void;
}

export function CitationPanel({ citations, usedCitations, onInsertCitation }: CitationPanelProps) {
  return (
    <div className="sr-citation-panel">
      <section>
        <h3>Used in Document</h3>
        {usedCitations.length ? (
          <div className="sr-used-citations">
            {usedCitations.map((used, index) => (
              <article key={`${used.raw}-${index}`} className="sr-used-citation">
                <strong>{used.citation ? formatCitationLabel(used.citation) : used.id}</strong>
                <span>{used.page ? `page ${used.page}` : 'no page'}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="sr-empty-text">No citations in this document.</p>
        )}
      </section>

      <section>
        <h3>Library</h3>
        <CitationPicker citations={citations} onInsert={onInsertCitation} />
      </section>

      {citations.length ? (
        <section>
          <h3>Selected Data</h3>
          <div className="sr-citation-data">
            {citations.map((citation) => (
              <details key={citation.id}>
                <summary>{citation.id}</summary>
                <p>{formatCitationDetail(citation)}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
