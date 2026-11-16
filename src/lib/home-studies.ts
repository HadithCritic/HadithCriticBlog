/* The front page studies: one tab for every study and one per category, each
   with its newest study as the lead and the next ones as rows. Build time
   only. */
import type { CollectionEntry } from 'astro:content';
import { blogArtwork } from '../data/blog/blog-artwork';
import { CATEGORIES, type CategoryTone } from './categories';
import { latestByKey } from './home-data-core';

type Study = CollectionEntry<'articles'>;

/** Studies a tab shows: the lead and the rows under it. */
const PER_TAB = 6;
const GENERIC_THUMB = '/images/blog/thumbnails/tn.generic.webp';
const WORDS_PER_MINUTE = 200;

export interface StudyCard {
  href: string;
  title: string;
  description: string | null;
  category: string;
  tone: CategoryTone;
  iso: string;
  date: string;
  minutes: number;
  image: { src: string; srcset: string | null; width: number; height: number };
}

export interface StudyTab {
  id: string;
  label: string;
  count: number;
  href: string;
  /** The category's color tokens, or null for the tab of every study. */
  tone: CategoryTone | null;
  studies: StudyCard[];
}

const toneOf = new Map(CATEGORIES.map((category) => [category.name, category.tone]));

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function readingMinutes(study: Study): number {
  const words = (study.body ?? '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function card(study: Study): StudyCard {
  const art = blogArtwork[study.id];
  const tone = toneOf.get(study.data.category);
  if (!tone) throw new Error(`Front page: study "${study.id}" has no known category.`);
  return {
    href: `/blogs/${study.id}/`,
    title: study.data.title,
    description: study.data.description ?? null,
    category: study.data.category,
    tone,
    iso: study.data.date.toISOString().slice(0, 10),
    date: formatDate(study.data.date),
    minutes: readingMinutes(study),
    image: {
      src: art?.src ?? study.data.thumbnail ?? GENERIC_THUMB,
      srcset: art?.srcset ?? null,
      width: art?.width ?? 1536,
      height: art?.height ?? 1024,
    },
  };
}

/** The tabs, "All" first and then each category that has a study, given studies newest first. */
export function studyTabs(all: readonly Study[]): StudyTab[] {
  const groups = latestByKey(all, (study) => study.data.category, CATEGORIES.map((c) => c.name), PER_TAB);
  const categoryTabs = CATEGORIES.flatMap((category, index): StudyTab[] => {
    const group = groups[index];
    return group.total
      ? [{
          id: category.slug,
          label: category.name,
          count: group.total,
          href: `/blogs/category/${category.slug}/`,
          tone: category.tone,
          studies: group.items.map(card),
        }]
      : [];
  });
  return [
    { id: 'all', label: 'All', count: all.length, href: '/blogs/', tone: null, studies: all.slice(0, PER_TAB).map(card) },
    ...categoryTabs,
  ];
}
