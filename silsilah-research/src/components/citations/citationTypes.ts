export type CitationKind = 'book' | 'article' | 'chapter' | 'source' | 'other';

export interface Citation {
  id: string;
  type: CitationKind;
  author: string;
  title: string;
  publisher?: string;
  journal?: string;
  year?: number;
  place?: string;
}

export interface UsedCitation {
  id: string;
  page?: string;
  raw: string;
  citation?: Citation;
}
