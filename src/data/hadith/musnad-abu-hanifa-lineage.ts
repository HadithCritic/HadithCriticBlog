/* The recension of Musnad Abī Ḥanīfa shown on its front page, set against
   the other works that carry the same reports. MusnadTransmissionMap.astro
   draws it as three lanes on a hijri axis; every node sits at its author's
   death, except the edition, which sits at the present.

   lane  main     the line this page follows: the Imam, al-Ḥārithī's
                  compilation, al-Ḥaṣkafī's abridgment, this edition
         parallel the other musnads, gathered later by al-Khwārizmī
         built    works made from al-Ḥaṣkafī's riwāya

   The claims are the ones the cited sources support; nothing here says
   that every report shares one chain. */

export type LineageLane = 'main' | 'parallel' | 'built';

export interface LineageNode {
  id: string;
  lane: LineageLane;
  /** Year of death in AH, or null for the present edition. */
  ah: number | null;
  ce: number | null;
  name: string;
  nameAr: string;
  role: string;
  work?: string;
  text: string;
}

export interface LineageSource {
  label: string;
  href: string;
}

export const LINEAGE_LANES: Record<LineageLane, { label: string; note: string }> = {
  parallel: { label: 'Parallel musnads', note: 'Gathered later' },
  main: { label: 'This recension', note: 'The line this page follows' },
  built: { label: 'Built on al-Ḥaṣkafī', note: 'Arrangement and commentary' }
};

export const LINEAGE_NODES: readonly LineageNode[] = [
  {
    id: 'abu-hanifa',
    lane: 'main',
    ah: 150,
    ce: 767,
    name: 'Abū Ḥanīfa',
    nameAr: 'أبو حنيفة',
    role: 'The Imam · Kufa',
    text: 'Taught in Kufa and left no book of ḥadīth of his own. Every musnad under his name was compiled by later scholars from reports transmitted through him.'
  },
  {
    id: 'harithi',
    lane: 'main',
    ah: 340,
    ce: 952,
    name: 'al-Ḥārithī',
    nameAr: 'عبد الله الحارثي',
    role: 'Early compilation',
    text: 'ʿAbd Allāh al-Ḥārithī compiled a large collection of reports attributed to Abū Ḥanīfa.'
  },
  {
    id: 'haskafi',
    lane: 'main',
    ah: 650,
    ce: 1252,
    name: 'al-Ḥaṣkafī',
    nameAr: 'موسى الحصكفي',
    role: 'Abridged recension',
    text: 'Mūsā al-Ḥaṣkafī’s riwāya is described as an abridgment of al-Ḥārithī’s collection. It is the recension read on this page.'
  },
  {
    id: 'edition',
    lane: 'main',
    ah: null,
    ce: null,
    name: 'This edition',
    nameAr: 'رواية الحصكفي',
    role: 'Riwāyat al-Ḥaṣkafī · 33 books',
    text: 'The supplied Arabic and English text, in the recension’s own book order, from faith and purity to paradise.'
  },
  {
    id: 'other-musnads',
    lane: 'parallel',
    ah: null,
    ce: null,
    name: 'Other musnads',
    nameAr: 'مسانيد أبي حنيفة',
    role: 'Parallel compilations',
    text: 'Several collections transmit material under the Imam’s name. A shared attribution does not make them one recension, or put every text on a direct line.'
  },
  {
    id: 'khwarizmi',
    lane: 'parallel',
    ah: 665,
    ce: 1266,
    name: 'al-Khwārizmī',
    nameAr: 'جامع المسانيد',
    role: 'A compilation of musnads',
    work: 'Jāmiʿ al-Masānīd',
    text: 'Brings fifteen musnad collections together and arranges them by legal topic. It is a wider compilation, not another copy of this recension.'
  },
  {
    id: 'qari',
    lane: 'built',
    ah: 1014,
    ce: 1606,
    name: 'al-Qārī',
    nameAr: 'شرح مسند أبي حنيفة',
    role: 'Commentary',
    work: 'Sharḥ al-Musnad',
    text: 'Mullā ʿAlī al-Qārī’s commentary belongs to a commentary tradition, not a separate recension. A Lahore print of 1307 AH / 1889 CE sets al-Ḥaṣkafī’s riwāya beside it.'
  },
  {
    id: 'sindi',
    lane: 'built',
    ah: 1257,
    ce: 1841,
    name: 'al-Sindī',
    nameAr: 'المواهب اللطيفة',
    role: 'Arrangement and commentary',
    work: 'al-Mawāhib al-Laṭīfa',
    text: 'Muḥammad ʿĀbid al-Sindī works from al-Ḥaṣkafī’s riwāya, arranges its reports by legal topic and discusses their parallels and corroborating reports.'
  }
];

export const LINEAGE_SOURCES: readonly LineageSource[] = [
  { label: 'Study of al-Ḥārithī’s Musnad', href: 'https://johas.org/al-harithis-musnad-of-abu-hanifa-a-source-for-abu-hanifas-hadith/' },
  { label: 'Record for al-Ḥaṣkafī and al-Sindī', href: 'https://mohammadkhair.com/series/series-11/records/42701' },
  { label: 'Study of Abū Ḥanīfa’s musnads (Arabic)', href: 'https://www.tadween.sa/documents/researchDatabase/6OCjUm.pdf' },
  { label: 'Lahore print catalogue record', href: 'https://www.deutsche-digitale-bibliothek.de/item/K2PL7STK5C2FHMK32RPV3DWMBE5X4SHI' }
];
