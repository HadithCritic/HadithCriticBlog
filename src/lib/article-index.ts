import type { CollectionEntry } from 'astro:content';
import { blogArtwork, type BlogArtwork } from '../data/blog-artwork';

/**
 * Listing helpers shared by the homepage, the blog archive and the branch
 * hubs, so a study carries the same folio number, date and reading time
 * wherever it is listed.
 */

export type Article = CollectionEntry<'articles'>;

export interface ArticleEntry {
  post: Article;
  /** Position in the whole archive, oldest first, zero-padded: "081". */
  folio: string;
  dateLabel: string;
  dateISO: string;
  year: number;
  minutes: number;
  artwork?: BlogArtwork;
  /** Small image for a listing: the bespoke engraving where one exists. */
  thumb?: string;
}

export const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

export const readingMinutes = (post: Article): number => {
  const words = (post.body || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

/** Newest first. `all` fixes the folio numbering when `posts` is a subset. */
export function toEntries(posts: Article[], all: Article[] = posts): ArticleEntry[] {
  const chronological = [...all].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  const position = new Map(chronological.map((post, index) => [post.id, index + 1]));
  return [...posts]
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((post) => {
      const artwork = blogArtwork[post.id];
      return {
        post,
        folio: String(position.get(post.id) ?? 0).padStart(3, '0'),
        dateLabel: formatDate(post.data.date),
        dateISO: isoDate(post.data.date),
        year: post.data.date.getUTCFullYear(),
        minutes: readingMinutes(post),
        artwork,
        thumb: artwork?.thumbnail ?? post.data.thumbnail
      };
    });
}

/** Entries grouped by year of publication, newest year first. */
export function byYear(entries: ArticleEntry[]): { year: number; entries: ArticleEntry[] }[] {
  const groups = new Map<number, ArticleEntry[]>();
  for (const entry of entries) groups.set(entry.year, [...(groups.get(entry.year) ?? []), entry]);
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, entries: items }));
}

export const searchText = (post: Article): string =>
  `${post.data.title} ${post.data.description ?? ''} ${post.data.category} ${(post.data.tags ?? []).join(' ')} ${post.data.author}`.toLowerCase();
