import fs from 'node:fs';
import path from 'node:path';
import { COMPILERS, type Compiler } from './hadith-compilers';

/**
 * Where the hadith library's artwork lives and how a collection finds it. Read at build time only.
 *
 *   public/images/hadith/covers/<collection-slug>.webp   one cover per compilation, named by its site slug
 *   public/images/hadith/medallions/<compiler>.webp      one engraved medallion per compiler, named by the
 *                                                         `medallion` key in hadith-compilers.ts
 *   public/images/hadith/page/                           art that belongs to the /hadith page, not to a work
 *
 * A file is found by its name alone, so adding a cover is saving it under the collection's slug.
 * scripts/hadith/verify-hadith-art.mjs lists every file with the collection or compiler it belongs to.
 */
const ART_ROOT = '/images/hadith';
export const HADITH_PAGE_ART = {
  hero: `${ART_ROOT}/page/hero-manuscript.webp`,
  heroSmall: `${ART_ROOT}/page/hero-manuscript-768.webp`,
  /** Shown on the card of a collection that has no cover of its own. */
  fallbackCover: `${ART_ROOT}/page/library-room.webp`,
} as const;

/** A collection that borrows another work's cover says so here, so no file is named for a work it does not show. */
const BORROWED_COVERS: Record<string, string> = {
  // The same compiler's Muṣannaf; the Musnad has no cover of its own yet.
  'musnad-ibn-abi-shayba': 'musannaf-ibn-abi-shaybah',
};

/** Focal point of each cover inside the card, where it differs from the default. */
const DEFAULT_FOCUS = '72% 50%';
const COVER_FOCUS: Record<string, string> = {
  'musnad-al-humaydi': '50% 50%',
  'musnad-ibn-abi-shayba': '50% 50%',
  'sahifat-hammam-ibn-munabbih': '70% 50%',
  'musnad-abu-hanifa': '70% 50%',
  'musnad-abd-allah-ibn-al-mubarak': '70% 50%',
  'birr-al-walidayn': '70% 42%',
  'musnad-khalifa-ibn-khayyat': '75% 44%',
  'al-shama-il-al-muhammadiyah': '55% 50%',
  'muwatta-ibn-wahb': '72% 50%',
  'musnad-sad-ibn-abi-waqqas': '55% 50%',
  'al-marasil-abi-dawud': '55% 50%',
  'al-muntaqa-ibn-al-jarud': '55% 50%',
};

const publicFile = (url: string): string => path.resolve(process.cwd(), 'public', url.replace(/^\//, ''));
const exists = (url: string): boolean => fs.existsSync(publicFile(url));

export interface CollectionCover {
  src: string;
  position: string;
  /** False when the collection has no cover and shows the shared library image. */
  own: boolean;
}

export function coverFor(slug: string): CollectionCover {
  const src = `${ART_ROOT}/covers/${BORROWED_COVERS[slug] ?? slug}.webp`;
  if (!exists(src)) {
    if (BORROWED_COVERS[slug]) throw new Error(`${slug} borrows a cover that does not exist: ${src}`);
    return { src: HADITH_PAGE_ART.fallbackCover, position: '55% 50%', own: false };
  }
  return { src, position: COVER_FOCUS[slug] ?? DEFAULT_FOCUS, own: true };
}

/** The medallion file of a compiler; a compiler whose registry entry names a missing file fails the build. */
export function medallionFor(compiler: Compiler | undefined): string | null {
  if (!compiler?.medallion) return null;
  const src = `${ART_ROOT}/medallions/${compiler.medallion}.webp`;
  if (!exists(src)) throw new Error(`No medallion file for ${compiler.name}: ${src}`);
  return src;
}

/** Every collection slug the compiler registry knows, with the art it resolves to. Used by the verifier. */
export function artManifest(): Array<{ slug: string; compiler: string; cover: string; medallion: string | null }> {
  return Object.entries(COMPILERS).map(([slug, compiler]) => ({
    slug, compiler: compiler.name, cover: coverFor(slug).src, medallion: medallionFor(compiler),
  }));
}
