import type { CollectionRecord } from './corpus-types';

/** Bibliographic compiler dates, not dates of composition or manuscript witnesses.
 * Source: https://hadith.dev/books (33-book bibliography, checked 2026-10-11).
 * Corpus titles, IDs and narration counts remain owned by corpus-meta.json.
 */
export const COMPILER_DATES: Record<string, number> = {
  'fada-il-makka': 110,
  'sahifat-hammam-ibn-munabbih': 131,
  'jami-mamar-ibn-rashid': 153,
  'musnad-abu-hanifa': 150,
  'al-athar-abu-yusuf': 182,
  'al-athar-al-shaybani': 189,
  'al-jami-ibn-wahb': 197,
  'musnad-abd-allah-ibn-al-mubarak': 181,
  'muwatta-malik': 179,
  'musnad-al-tayalisi': 204,
  'musannaf-abd-al-razzaq': 211,
  'musnad-al-humaydi': 219,
  'sunan-sa-id-ibn-mansur': 227,
  'musannaf-ibn-abi-shaybah': 235,
  'musnad-ahmad': 241,
  'musnad-abd-ibn-humayd': 249,
  'musnad-al-darimi': 255,
  'ahadith-yazid-ibn-abi-habib': 129,
  'nuskhat-al-zubayr-ibn-adi': 131,
  'ahadith-muntakhaba-maghazi-musa-ibn-uqba': 141,
  'hadith-mujaa-ibn-al-zubayr': 146,
  'hadith-sufyan-al-thawri': 161,
  'kitab-al-hajj-al-majishun': 164,
  'ahadith-al-sari-an-al-thawri': 167,
  'mashyakhat-ibn-tahman': 168,
  'ashara-ahadith-al-layth-ibn-sad': 175,
  'majlis-fawaid-al-layth-ibn-sad': 175,
  'nuskhat-ibrahim-ibn-sad': 184,
  'al-dua-ibn-fudayl': 195,
  'kitab-al-qadar-ibn-wahb': 197,
  'muwatta-ibn-wahb-muharaba': 197,
  'muwatta-ibn-wahb-qada-buyu': 197,
  'nuskhat-waki-an-al-amash': 197,
  'juz-sufyan-ibn-uyayna': 198,
  'musnad-sad-ibn-abi-waqqas': 246,
  'sahih-al-bukhari': 256,
  'birr-al-walidayn': 256,
  'musnad-khalifa-ibn-khayyat': 240,
  'sahih-muslim': 261,
  'sunan-ibn-majah': 273,
  'sunan-abi-dawud': 275,
  'al-marasil-li-abi-dawud': 275,
  'al-marasil-abi-dawud': 275,
  'jami-al-tirmidhi': 279,
  'al-shama-il-al-muhammadiyah': 279,
  'musnad-al-bazzar': 292,
  'sunan-al-nasa-i': 303,
  'al-sunan-al-kubra': 303,
  'al-muntaqa': 307,
  'al-muntaqa-ibn-al-jarud': 307,
  'musnad-abi-ya-la-al-mawsili': 307,
  'sahih-ibn-khuzaymah': 311,
  'sharh-ma-ani-al-athar': 321,
  'sharh-mushkil-al-athar': 321,
  'sahih-ibn-hibban': 354,
  'al-mu-jam-al-kabir': 360,
  'al-mu-jam-al-awsat': 360,
  'al-mu-jam-al-saghir': 360,
  'sunan-al-daraqutni': 385,
  'al-mustadrak-ala-al-sahihayn': 405,
  'sunan-al-bayhaqi-al-kubra': 458,
  'al-ahadith-al-mukhtarah': 643,
  'al-matalib-al-aliyah': 852,
};

export function collectionType(slug: string): string {
  if (slug === 'al-ahadith-al-mukhtarah' || slug === 'al-mustadrak-ala-al-sahihayn') return 'Sahih';
  if (slug === 'muwatta-malik' || slug === 'al-muntaqa' || slug === 'al-muntaqa-ibn-al-jarud') return 'Sunan';
  if (slug === 'jami-mamar-ibn-rashid' || slug === 'al-jami-ibn-wahb') return 'Jāmiʿ';
  if (slug.startsWith('muwatta-ibn-wahb-')) return 'Muwaṭṭaʾ';
  if (['al-dua-ibn-fudayl', 'kitab-al-qadar-ibn-wahb', 'kitab-al-hajj-al-majishun'].includes(slug)) return 'Kitāb';
  if (slug === 'mashyakhat-ibn-tahman') return 'Mashyakha';
  if (['hadith-sufyan-al-thawri', 'ahadith-al-sari-an-al-thawri', 'ahadith-muntakhaba-maghazi-musa-ibn-uqba', 'juz-sufyan-ibn-uyayna', 'hadith-mujaa-ibn-al-zubayr', 'ahadith-yazid-ibn-abi-habib', 'ashara-ahadith-al-layth-ibn-sad', 'majlis-fawaid-al-layth-ibn-sad'].includes(slug)) return 'Juzʾ';
  if (slug.startsWith('nuskhat-')) return 'Nuskha';
  if (slug === 'fada-il-makka') return 'Faḍāʾil';
  if (slug === 'sahifat-hammam-ibn-munabbih') return 'Ṣaḥīfa';
  if (slug === 'birr-al-walidayn') return 'Kitāb';
  if (slug === 'al-shama-il-al-muhammadiyah') return 'Shamāʾil';
  if (slug.startsWith('al-athar-')) return 'Āthār';
  if (slug === 'al-marasil-abi-dawud') return 'Marāsīl';
  if (slug === 'al-matalib-al-aliyah') return 'Musnad';
  if (slug.startsWith('sahih-')) return 'Sahih';
  if (slug.startsWith('sunan-') || slug === 'al-sunan-al-kubra' || slug === 'jami-al-tirmidhi') return 'Sunan';
  if (slug.startsWith('musannaf-')) return 'Musannaf';
  if (slug.startsWith('musnad-')) return 'Musnad';
  if (slug.startsWith('al-mu-jam-')) return 'Muʿjam';
  return 'Other';
}

export function chronologicalCollections(books: CollectionRecord[]): CollectionRecord[] {
  // Sorting a copy protects the generated metadata and all corpus query consumers.
  return [...books].sort((a, b) =>
    (COMPILER_DATES[a.slug] ?? Infinity) - (COMPILER_DATES[b.slug] ?? Infinity)
    || Object.keys(COMPILER_DATES).indexOf(a.slug) - Object.keys(COMPILER_DATES).indexOf(b.slug)
    || a.id - b.id);
}

const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`;

/** The Hijri century a death year falls in: 101 to 200 AH is the 2nd century. */
export function centuryOf(year: number): number {
  return Math.ceil(year / 100);
}

export function centuryHeading(century: number): { name: string; range: string } {
  return { name: `${ordinal(century)} century AH`, range: `${(century - 1) * 100 + 1}-${century * 100}` };
}
