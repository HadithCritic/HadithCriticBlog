import type { Citation } from '../components/citations/citationTypes';

export function formatCitationLabel(citation: Citation) {
  const year = citation.year ? ` (${citation.year})` : '';
  return `${citation.author}${year}`;
}

export function formatCitationDetail(citation: Citation) {
  const placePublisher = [citation.place, citation.publisher].filter(Boolean).join(': ');
  const year = citation.year ? `${citation.year}` : '';
  return [citation.title, placePublisher, year].filter(Boolean).join(', ');
}
