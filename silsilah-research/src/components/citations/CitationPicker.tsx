import type { Citation } from './citationTypes';
import { formatCitationLabel } from '../../lib/citations';

interface CitationPickerProps {
  citations: Citation[];
  onInsert: (citation: Citation, page?: string) => void;
}

export function CitationPicker({ citations, onInsert }: CitationPickerProps) {
  return (
    <div className="sr-citation-picker">
      {citations.map((citation) => (
        <CitationPickerItem key={citation.id} citation={citation} onInsert={onInsert} />
      ))}
    </div>
  );
}

function CitationPickerItem({ citation, onInsert }: { citation: Citation; onInsert: (citation: Citation, page?: string) => void }) {
  return (
    <article className="sr-citation-row">
      <div>
        <strong>{formatCitationLabel(citation)}</strong>
        <span>{citation.title}</span>
      </div>
      <button onClick={() => onInsert(citation)}>Insert</button>
    </article>
  );
}
