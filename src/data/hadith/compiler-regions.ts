import type { CompilerRegion } from '../../lib/hadith-compilers';

/**
 * Where each compiler region sits on the front page map: one city that stands
 * for the region, in degrees. The region keys are the ones in
 * src/lib/hadith-compilers.ts. `label` is the side of the point its name is
 * printed on; regions in the crowded Iraqi cluster print no name and show it
 * only in their callout.
 */
export type LabelSide = 'left' | 'right' | 'top' | 'bottom';

export interface RegionPlace {
  name: string;
  /** The city the point is drawn at, named in the callout. */
  city: string;
  lon: number;
  lat: number;
  label?: LabelSide;
}

export const REGION_PLACES: Record<CompilerRegion, RegionPlace> = {
  medina: { name: 'Medina', city: 'Medina', lon: 39.61, lat: 24.47, label: 'left' },
  mecca: { name: 'Mecca', city: 'Mecca', lon: 39.83, lat: 21.42, label: 'left' },
  basra: { name: 'Basra', city: 'Basra', lon: 47.78, lat: 30.51, label: 'right' },
  kufa: { name: 'Kufa', city: 'Kufa', lon: 44.4, lat: 32.03, label: 'left' },
  wasit: { name: 'Wāsiṭ', city: 'Wāsiṭ', lon: 46.3, lat: 32.19 },
  baghdad: { name: 'Baghdad', city: 'Baghdad', lon: 44.36, lat: 33.31, label: 'top' },
  jibal: { name: 'al-Jibāl', city: 'Rayy', lon: 51.43, lat: 35.59, label: 'top' },
  merv: { name: 'Merv', city: 'Merv', lon: 61.83, lat: 37.66, label: 'bottom' },
  nishapur: { name: 'Khurasan', city: 'Nishapur', lon: 58.8, lat: 36.21, label: 'bottom' },
  bukhara: { name: 'Transoxiana', city: 'Bukhara', lon: 64.42, lat: 39.77, label: 'top' },
  damascus: { name: 'Syria', city: 'Damascus', lon: 36.29, lat: 33.51, label: 'top' },
  jazira: { name: 'al-Jazīra', city: 'Mosul', lon: 43.13, lat: 36.34, label: 'top' },
  palestine: { name: 'Palestine', city: 'Jerusalem', lon: 35.23, lat: 31.78, label: 'left' },
  egypt: { name: 'Egypt', city: 'Fusṭāṭ', lon: 31.23, lat: 30.01, label: 'left' },
  yemen: { name: 'Yemen', city: 'Sanaa', lon: 44.21, lat: 15.35, label: 'right' },
  maghrib: { name: 'Ifrīqiya', city: 'Qayrawān', lon: 10.1, lat: 35.68, label: 'bottom' },
  andalus: { name: 'al-Andalus', city: 'Córdoba', lon: -4.78, lat: 37.88, label: 'bottom' },
};
