/* The 3rd-century collections whose front page is painted (PaintedFront.astro
   through PaintedCollection.astro): what the fact cards say, how the chapters
   are grouped for the index chips and chart, and the hero's alt text. The
   plates and their alt text come from chapter-cover-meta.json, written by
   scripts/hadith/build-chapter-cover-meta.mjs. Every chapter is in exactly
   one group, and the build fails otherwise. */

import type { BookGroup } from './musnad-abu-hanifa-groups';

export interface PaintedCollection {
  placeAr: string;
  /** Arabic for the recension; only shown where hadith-compilers.ts names one. */
  viaAr?: string;
  shortName: string;
  heroAlt: string;
  itemSingular: string;
  itemPlural: string;
  /** Words after the chapter count, as in "47 Companions and Successors". */
  arrangement: string;
  /** Explicit groups, or 'by-size' to band the chapters by how many reports they hold. */
  groups: readonly BookGroup[] | 'by-size';
}

/** Chapter numbers a..b inclusive. */
const span = (a: number, b: number): number[] => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const group = (id: string, label: string, ...books: (number | number[])[]): BookGroup => ({
  id,
  label,
  books: books.flat()
});

export const PAINTED_COLLECTIONS: Readonly<Record<string, PaintedCollection>> = {
  'kitab-al-kharaj-yahya-ibn-adam': {
    placeAr: 'الكوفة',
    shortName: 'Yaḥyā ibn Ādam',
    heroAlt: 'A mudbrick office in Kufa at golden hour, its arch open on the canals and palm-lined fields of the Sawad.',
    itemSingular: 'chapter',
    itemPlural: 'chapters',
    arrangement: 'chapters on land and its taxes',
    groups: [
      group('spoils', 'Spoils and tribute', span(1, 2)),
      group('land', 'Conquered land', span(3, 8)),
      group('tithe', 'Zakat on produce', span(9, 21))
    ]
  },
  'musnad-al-shafii': {
    placeAr: 'الفسطاط',
    viaAr: 'رواية الربيع بن سليمان',
    shortName: 'al-Shāfiʿī',
    heroAlt: 'A scholar’s upper room in Fusṭāṭ in afternoon light, its window open on the Nile and its sailing boats.',
    itemSingular: 'book',
    itemPlural: 'books',
    arrangement: 'books of al-Shāfiʿī the reports were taken from',
    groups: [
      group('prayer', 'Purity and prayer', span(1, 7), 39, 54, 55),
      group('alms', 'Alms, fasting and pilgrimage', 8, 10, 11, 60, 61),
      group('trade', 'Trade and property', 12, 13, 24, 25, 45, 48, 66),
      group('family', 'Marriage and divorce', 9, 16, 23, span(26, 28), span(33, 38), 62, 63),
      group('courts', 'Courts, injuries and penalties', 14, 18, 46, 49, 52, 53, 59, 65),
      group('wills', 'Slaves, wills and inheritance', 17, 19, 44, 47, 64, 67),
      group('war', 'War and the state', 20, span(40, 43), 57),
      group('theory', 'Legal theory and disagreement', 15, 21, 22, 29, 30, 58, 68),
      group('food', 'Food, drink and hunting', 31, 32, 50, 51, 56)
    ]
  },
  'hadith-muhammad-ibn-abd-allah-al-ansari': {
    placeAr: 'البصرة',
    viaAr: 'رواية أبي مسلم الكجي',
    shortName: 'al-Anṣārī',
    heroAlt: 'A scholar’s room in Basra in early morning, a tied fascicle on a reed mat before a window on the palm groves.',
    itemSingular: 'section',
    itemPlural: 'sections',
    arrangement: 'sections arranged by teacher',
    groups: [
      group('taymi', 'Sulaymān al-Taymī', span(1, 8)),
      group('teachers', 'Other teachers', span(9, 24), 27),
      group('shaykhs', 'Shaykhs and questions', 25, 26)
    ]
  },
  'kitab-al-salah-abu-nuaym': {
    placeAr: 'الكوفة',
    shortName: 'Abū Nuʿaym',
    heroAlt: 'The prayer hall of an early Kufan mosque before dawn, a prayer mat and brass ewer before rows of palm-trunk columns.',
    itemSingular: 'chapter',
    itemPlural: 'chapters',
    arrangement: 'chapters from purity to the prayer times',
    groups: [
      group('menses', 'Menstruation', span(2, 5), 24),
      group('ghusl', 'The full ablution', span(6, 23)),
      group('wudu', 'Ablution and tayammum', span(25, 34)),
      group('adhan', 'The call to prayer', span(35, 62)),
      group('times', 'Prayer and its times', 1, span(63, 66))
    ]
  },
  'musnad-al-humaydi': {
    placeAr: 'مكة',
    shortName: 'al-Ḥumaydī',
    heroAlt: 'A stone room in Mecca in late afternoon, tied notebooks on a desk before a window on the granite mountains.',
    itemSingular: 'Companion',
    itemPlural: 'Companions',
    arrangement: 'chapters arranged by Companion',
    groups: [
      group('ten', 'The Ten', span(1, 9)),
      group('emigrants', 'Early Emigrants', span(10, 16)),
      group('mothers', 'Mothers of the Believers', span(17, 23)),
      group('women', 'Women Companions', span(24, 48)),
      group('ansar', 'The Anṣār', span(50, 67)),
      group('quraysh', 'Hāshim and Quraysh', span(68, 91)),
      group('companions', 'Other Companions', span(92, 178)),
      group('abu-hurayra', 'Abū Hurayra', span(179, 185)),
      group('anas-jabir', 'Anas and Jābir', 186, 187)
    ]
  },
  'musnad-ibn-abi-shayba': {
    placeAr: 'الكوفة',
    shortName: 'Ibn Abī Shayba',
    heroAlt: 'A scholar’s study in Kufa in late afternoon, tall stacks of notebooks before a window on the Euphrates.',
    itemSingular: 'Companion',
    itemPlural: 'Companions',
    arrangement: 'chapters arranged by Companion',
    groups: 'by-size'
  },
  'musnad-khalifa-ibn-khayyat': {
    placeAr: 'البصرة',
    shortName: 'Khalīfa ibn Khayyāṭ',
    heroAlt: 'A historian’s study in Basra at evening, scrolls and quires on a desk before a window on the harbor.',
    itemSingular: 'transmitter',
    itemPlural: 'transmitters',
    arrangement: 'chapters arranged by transmitter',
    groups: [group('companions', 'Companions', span(1, 36)), group('successors', 'Successors and later', span(37, 47))]
  },
  'kitab-al-iman-al-adani': {
    placeAr: 'مكة',
    shortName: 'al-ʿAdanī',
    heroAlt: 'A whitewashed room above the harbor of Aden at morning, a closed book on a wooden stand before the crater and the sea.',
    itemSingular: 'chapter',
    itemPlural: 'chapters',
    arrangement: 'chapters on faith',
    groups: [
      group('faith', 'What faith is', 5, 7, 8, 10, 12, 18, 19, 23, 26, 27, 36, 44, 45, 47, 50, 51, 52, 53),
      group('worship', 'Prayer and worship', 1, 2, 3, 9, 13, 15, 16, 20, 21, 22, 25, 39, 40, 48),
      group('decree', 'God and the decree', 11, 14, 24, 28),
      group('conduct', 'Conduct', 4, 29, 30, 31, 32, 37, 38, 41, 42, 46, 56),
      group('community', 'Community and authority', 6, 17, 33, 34, 35, 43, 49, 54, 55)
    ]
  },
  'qiraat-al-nabi-al-duri': {
    placeAr: 'بغداد',
    shortName: 'al-Dūrī',
    heroAlt: 'A reciter’s room in Baghdad at night, a wrapped codex on a recitation stand before the Tigris and a crescent moon.',
    itemSingular: 'sūra',
    itemPlural: 'sūras',
    arrangement: 'sūras in the order of the codex',
    groups: [
      group('fatiha-tawba', 'Al-Fātiḥa to al-Tawba', span(1, 9)),
      group('yunus-furqan', 'Yūnus to al-Furqān', span(10, 22)),
      group('ankabut-qaf', 'Al-ʿAnkabūt to Qāf', span(23, 33)),
      group('dhariyat-quraysh', 'Al-Dhāriyāt to Quraysh', span(34, 49))
    ]
  },
  'musnad-sad-ibn-abi-waqqas': {
    placeAr: 'البصرة',
    shortName: 'al-Dawraqī',
    heroAlt: 'A stone house on the edge of the ʿAqīq valley near Medina, a bow and quiver against the wall before the lava ridges.',
    itemSingular: 'chapter',
    itemPlural: 'chapters',
    arrangement: 'chapters by those who carried his reports',
    groups: [
      group('companions', 'From Companions', 1, 2),
      group('sons', 'From his sons', span(3, 8)),
      group('daughter', 'From his daughter', 9)
    ]
  },
  'birr-al-walidayn': {
    placeAr: 'بخارى',
    viaAr: 'رواية أبي بكر بن دلويه',
    shortName: 'al-Bukhārī',
    heroAlt: 'A family room in Bukhara at dusk, two cushions side by side with milk and dates before a window on the domes.',
    itemSingular: 'chapter',
    itemPlural: 'chapters',
    arrangement: 'chapters on parents and kin',
    groups: [
      group('parents', 'Parents', span(1, 12), span(24, 32), 45),
      group('kinship', 'Ties of kinship', span(13, 23), span(35, 42), 44),
      group('warnings', 'Warnings', 33, 34, 43)
    ]
  },
  'sunan-al-athram': {
    placeAr: 'بغداد',
    shortName: 'al-Athram',
    heroAlt: 'A student’s room in Baghdad in morning light, notebooks bound with cord on a low desk before the Tigris.',
    itemSingular: 'chapter',
    itemPlural: 'chapters',
    arrangement: 'chapters on purity',
    groups: [
      group('ablution', 'Ablution', span(1, 8)),
      group('waters', 'Waters', span(9, 16)),
      group('nullifiers', 'What breaks ablution', span(17, 22))
    ]
  },
  'al-marasil-abi-dawud': {
    placeAr: 'البصرة',
    shortName: 'Abū Dāwūd',
    heroAlt: 'A scholar’s room in Basra at dusk, an open notebook beside a chain with one broken link before the palm groves.',
    itemSingular: 'chapter',
    itemPlural: 'chapters',
    arrangement: 'chapters of law',
    groups: [
      group('prayer', 'Purity and prayer', span(1, 22)),
      group('worship', 'Fasting, alms and pilgrimage', span(23, 29)),
      group('trade', 'Trade', span(30, 36)),
      group('marriage', 'Marriage', span(37, 42)),
      group('penalties', 'Penalties', span(43, 48)),
      group('jihad', 'Jihad', span(49, 62)),
      group('wills', 'Wills and inheritance', span(63, 69)),
      group('sacrifice', 'Sacrifice, hunting and oaths', span(70, 73), 76),
      group('courts', 'Courts', span(74, 75), span(77, 80)),
      group('funerals', 'Funerals', span(81, 86)),
      group('manners', 'Dress, medicine and manners', span(87, 109)),
      group('last-days', 'Last days and omens', span(110, 114))
    ]
  }
};

interface SizedChapter {
  n: number;
  count: number;
}

/** Bands chapters by how many reports they hold, for musnads with too many Companions to group by hand. */
export function groupsBySize(chapters: readonly SizedChapter[]): BookGroup[] {
  const bands = [
    { id: 'many', label: 'Ten or more reports', test: (c: number) => c >= 10 },
    { id: 'some', label: 'Two to nine reports', test: (c: number) => c >= 2 && c < 10 },
    { id: 'one', label: 'A single report', test: (c: number) => c < 2 }
  ];
  return bands
    .map(({ id, label, test }) => ({ id, label, books: chapters.filter((ch) => test(ch.count)).map((ch) => ch.n) }))
    .filter((band) => band.books.length > 0);
}

export function paintedCollection(slug: string): PaintedCollection {
  const config = PAINTED_COLLECTIONS[slug];
  if (!config) throw new Error(`${slug}: not in painted-collections.ts`);
  return config;
}
