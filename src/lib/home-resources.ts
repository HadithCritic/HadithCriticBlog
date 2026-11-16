/* The front page resources figures, read from the same catalogue as
   /resources (src/data/site/resources.ts): the four books on a shelf, the
   GitBooks as a moving band and the three tools as tiles. Build time only. */
import { RESOURCE_CATEGORIES, resourceCategory, type Brand, type Resource } from '../data/site/resources';

export interface ShelfBook {
  id: string;
  title: string;
  description: string;
  href: string;
  cover: string;
  pages: number;
  brand: Brand;
}

export interface BandItem {
  title: string;
  description: string;
  href: string;
}

export interface ToolTile {
  title: string;
  description: string;
  href: string;
  meta: string;
  cta: string;
  art: string;
  brand: Brand;
}

export interface ResourcesFigure {
  books: ShelfBook[];
  pages: number;
  gitbooks: BandItem[];
  tools: ToolTile[];
  /** Every entry in the catalogue, and how many sections hold them. */
  entries: number;
  sections: number;
}

const fail = (message: string): never => {
  throw new Error(`Front page resources: ${message}`);
};

const slugOf = (title: string): string => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function shelfBook(item: Resource): ShelfBook {
  if (!item.cover || !item.pages || !item.brand) return fail(`"${item.title}" needs a cover, a page count and colors.`);
  return {
    id: slugOf(item.title),
    title: item.title,
    description: item.description,
    href: item.href,
    cover: item.cover,
    pages: item.pages,
    brand: item.brand,
  };
}

function toolTile(item: Resource): ToolTile {
  if (!item.art || !item.brand || !item.meta || !item.cta) return fail(`"${item.title}" needs art, colors, a meta line and a call to action.`);
  return {
    title: item.title,
    description: item.description,
    href: item.href,
    meta: item.meta,
    cta: item.cta,
    art: item.art.src,
    brand: item.brand,
  };
}

export function resourcesFigure(): ResourcesFigure {
  const books = resourceCategory('pdfs').items.map(shelfBook);
  const gitbooks = resourceCategory('gitbooks').items.map(({ title, description, href }) => ({ title, description, href }));
  const tools = resourceCategory('apps').items.map(toolTile);
  if (books.length < 2 || gitbooks.length < 4 || !tools.length) fail('the catalogue is too thin for the shelf, band and tools.');
  return {
    books,
    pages: books.reduce((total, book) => total + book.pages, 0),
    gitbooks,
    tools,
    entries: RESOURCE_CATEGORIES.reduce((total, category) => total + category.items.length, 0),
    sections: RESOURCE_CATEGORIES.length,
  };
}
