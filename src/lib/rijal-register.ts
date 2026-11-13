/* The narrators register (/projects/rijal/): Ibn Ḥajar's Taqrīb al-Tahdhīb
   as list pages. Each page is a prebuilt, editable HTML file in
   src/data/rijal/pages/taqrib/, written by scripts/rijal/build-taqrib-rijal.mjs;
   pages.json gives their order and titles. Build-time only. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import manifest from '../data/rijal/pages/taqrib/pages.json';

export const RIJAL_BASE = '/projects/rijal/';

export interface RegisterPage {
  slug: string;
  kind: 'letter' | 'group';
  letter?: { ar: string; slug: string; en: string };
  sections?: string[];
  part: number | null;
  parts: number;
  title_en: string;
  title_ar: string;
  range_ar: string[];
  count: number;
  first: string;
  graded: number;
}

export const registerPages = manifest as RegisterPage[];

export const pageHref = (slug: string): string => `${RIJAL_BASE}${slug}/`;

export const pageHtml = (slug: string): string => {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Bad register page slug: ${slug}`);
  return readFileSync(resolve(process.cwd(), 'src/data/rijal/pages/taqrib', `${slug}.html`), 'utf8');
};

/* The letters, each with the pages it runs to, for the contents and the
   letter bar. */
export const letterIndex = (): { letter: NonNullable<RegisterPage['letter']>; pages: RegisterPage[]; count: number }[] => {
  const out = new Map<string, { letter: NonNullable<RegisterPage['letter']>; pages: RegisterPage[]; count: number }>();
  for (const page of registerPages) {
    if (page.kind !== 'letter' || !page.letter) continue;
    const entry = out.get(page.letter.slug) ?? { letter: page.letter, pages: [], count: 0 };
    out.set(page.letter.slug, { ...entry, pages: [...entry.pages, page], count: entry.count + page.count });
  }
  return [...out.values()];
};

export const groupPages = (): RegisterPage[] => registerPages.filter((p) => p.kind === 'group');

export const totals = {
  biographies: registerPages.reduce((sum, p) => sum + p.count, 0),
  graded: registerPages.reduce((sum, p) => sum + p.graded, 0),
};
