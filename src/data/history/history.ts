/** Source availability checked on 2026-10-16. See docs/history-source-inventory.md.
 * `reader` is the English reading edition under /projects/history/<slug>/, with
 * its reading pages (`entries`) and the words of its text, or null where the translation is
 * not open yet. scripts/history/verify-history-books.mjs fails when these counts drift
 * from what src/lib/history-book.ts makes of the fragment.
 *
 * Sources are listed in order of their authors' deaths, which is the order the
 * page's chronology draws them in. `died` is the conventional death date in
 * hijrī and common-era years; `circa` marks a date the biographers disagree on.
 * `arrangement` says in a few words how the author ordered the book, which is
 * also how its reader is laid out (src/lib/history-book.ts).
 */
export const historySources = [
  {
    id: 'al-waqidi-ridda',
    reader: { slug: 'book-of-apostasy', entries: 13, words: 51740 },
    author: 'Muḥammad ibn ʿUmar al-Wāqidī',
    title: 'The Book of Apostasy (Kitāb al-Ridda)',
    arabic: 'كتاب الردة',
    form: 'Early caliphate history',
    arrangement: 'A continuous narrative in four chapters',
    died: { ah: 207, ce: 823, circa: false },
    imageBase: '/images/history/al-waqidi-ridda',
    imageAlt: 'An interpretive painting of riders returning across an Arabian plain toward Medina in the early caliphate period.',
    imageCaption: 'The road to Medina',
    description: 'An account of the upheaval after the Prophet’s death, the Saqīfa, tribal defections and the Ridda campaigns across Arabia.',
  },
  {
    id: 'khalifa-ibn-khayyat',
    reader: { slug: 'khalifa', entries: 42, words: 127451 },
    author: 'Khalīfa ibn Khayyāṭ',
    title: 'Chronicle of Khalīfa ibn Khayyāṭ (Tārīkh Khalīfa ibn Khayyāṭ)',
    arabic: 'تاريخ خليفة بن خياط',
    form: 'Chronicle',
    arrangement: 'Year by year from 1 to 232 AH, grouped by reign',
    died: { ah: 240, ce: 854, circa: false },
    imageBase: '/images/history/khalifa-ibn-khayyat',
    imageAlt: 'Historical painting of anonymous commanders overlooking an army crossing a vast desert plain, evoking the campaigns recorded in Khalīfa’s chronicle.',
    imageCaption: 'An early caliphate landscape',
    description: 'A concise annalistic chronicle of early Islamic history, preserving yearly reports and notices on people and campaigns.',
  },
  {
    id: 'ibn-habib-munammaq',
    reader: { slug: 'genealogies-of-quraysh', entries: 32, words: 106527 },
    author: 'Muḥammad ibn Ḥabīb al-Baghdādī',
    title: 'Genealogies of Quraysh (al-Munammaq fī akhbār Quraysh)',
    arabic: 'المنمق في أخبار قريش',
    form: 'Genealogical history',
    arrangement: 'Accounts of Quraysh, one episode after another',
    died: { ah: 245, ce: 860, circa: false },
    imageBase: '/images/history/ibn-habib-munammaq',
    imageAlt: 'An interpretive painting of a scribe and clan elders studying a genealogy in a Meccan valley.',
    imageCaption: 'Quraysh in the Meccan valley',
    description: 'A history of Quraysh through its lineages, alliances and remembered disputes, including the Pact of the Virtuous and stories of the Kaʿba.',
  },
  {
    id: 'ibn-habib-muhabbar',
    reader: { slug: 'well-informed', entries: 34, words: 108756 },
    author: 'Muḥammad ibn Ḥabīb al-Baghdādī',
    title: 'The Well-Informed (al-Muḥabbar)',
    arabic: 'المحبّر',
    form: 'Social and genealogical compendium',
    arrangement: 'Fifty lists of names, with reports between them',
    died: { ah: 245, ce: 860, circa: false },
    imageBase: '/images/history/ibn-habib-muhabbar',
    imageAlt: 'An interpretive painting of travelers, tribal delegates and a scribe at a caravan gathering in an Arabian valley.',
    imageCaption: 'Gathering on the caravan road',
    description: 'A compendium of Arab social memory: pilgrimage leaders, caliphs, expeditions, Quraysh lineages, notable people and customs.',
  },
  {
    id: 'ibn-abd-al-hakam',
    reader: { slug: 'conquests-of-egypt-and-the-maghrib', entries: 46, words: 140670 },
    author: 'ʿAbd al-Raḥmān ibn ʿAbd Allāh ibn ʿAbd al-Ḥakam',
    title: 'Conquests of Egypt and the Maghrib (Futūḥ Miṣr wa-l-Maghrib)',
    arabic: 'فتوح مصر والمغرب',
    form: 'Regional conquest history',
    arrangement: 'From Egypt’s ancient past to the conquest, then its judges',
    died: { ah: 257, ce: 871, circa: false },
    imageBase: '/images/history/ibn-abd-al-hakam',
    imageAlt: 'An interpretive painting of riders approaching an early Islamic riverside settlement along the Nile.',
    imageCaption: 'The Nile frontier',
    description: 'A history of Egypt from traditions about its ancient past through the Roman and Persian periods and the conquest under ʿAmr ibn al-ʿĀṣ, with accounts extending into the Maghrib.',
  },
  {
    id: 'ibn-qutayba-maarif',
    reader: { slug: 'book-of-knowledge', entries: 47, words: 142158 },
    author: 'ʿAbd Allāh ibn Muslim ibn Qutayba al-Dīnawarī',
    title: 'Knowledge (al-Maʿārif)',
    arabic: 'المعارف',
    form: 'Historical and genealogical compendium',
    arrangement: 'Genealogies, then entries on prophets, caliphs and notables',
    died: { ah: 276, ce: 889, circa: false },
    imageBase: '/images/history/ibn-qutayba-maarif',
    imageAlt: 'An interpretive painting of an Abbasid-era compiler surrounded by books and scrolls in a Baghdad study.',
    imageCaption: 'A scholar’s compendium',
    description: 'A survey of genealogies and notable figures, including Banū Hāshim, Banū Umayya, Yemen, al-Aws and al-Khazraj, prophets and rulers.',
  },
  {
    id: 'al-fasawi-marifa-tarikh',
    reader: { slug: 'knowledge-and-history', entries: 128, words: 468179 },
    author: 'Yaʿqūb ibn Sufyān al-Fasawī',
    title: 'Knowledge and History (al-Maʿrifa wa-l-tārīkh)',
    arabic: 'المعرفة والتاريخ',
    form: 'History and transmission',
    arrangement: 'Annals from 135 to 241 AH, then entries on transmitters',
    died: { ah: 277, ce: 890, circa: false },
    imageBase: '/images/history/ibn-fasawi',
    imageAlt: 'An interpretive painting of a scholarly traveler arriving at an Abbasid-era city with books and scroll cases.',
    imageCaption: 'A journey for knowledge',
    description: 'A historical compilation shaped by al-Fasawī’s travels through Mecca, Egypt, Syria, Iraq and Fārs, preserving reports about scholars and transmitters.',
  },
  {
    id: 'al-baladhuri',
    reader: { slug: 'futuh-al-buldan', entries: 78, words: 176846 },
    author: 'Al-Balādhurī',
    title: 'The Conquests of the Lands (Futūḥ al-buldān)',
    arabic: 'فتوح البلدان',
    form: 'Conquest history',
    arrangement: 'Region by region, in numbered reports',
    died: { ah: 279, ce: 892, circa: true },
    imageBase: '/images/history/al-baladhuri-v2',
    imageAlt: 'An interpretive painting of an arriving expedition meeting local inhabitants outside a late-antique town gate, evoking the lands and settlements in Futūḥ al-buldān.',
    imageCaption: 'At the gates of a town',
    description: 'An account of conquests and settlements across Arabia, Syria, Egypt, Iraq and other lands, preserving local traditions and agreements.',
  },
  {
    id: 'al-tabari',
    reader: null,
    author: 'Al-Ṭabarī',
    title: 'The History of al-Ṭabarī (Tārīkh al-Ṭabarī)',
    arabic: 'تاريخ الطبري',
    form: 'Universal history',
    arrangement: 'Year by year, in many volumes',
    died: { ah: 310, ce: 923, circa: false },
    imageBase: '/images/history/al-tabari-v2',
    imageAlt: 'An interpretive painting of Abbasid Baghdad and the Tigris, with working river boats, brick buildings and populated quays, evoking one part of al-Ṭabarī’s broad historical world.',
    imageCaption: 'An Abbasid river city',
    description: 'A broad chronicle for following reports across volumes and comparing the passages that describe the same events.',
  },
] as const;

export type HistorySource = (typeof historySources)[number];

/** "d. 240/854", or "d. c. 279/892" where the date is disputed. */
export function deathDate(source: HistorySource): string {
  const { ah, ce, circa } = source.died;
  return `d. ${circa ? 'c. ' : ''}${ah}/${ce}`;
}

export interface ReaderFacts {
  href: string;
  entries: number;
  words: number;
}

/** The open reading edition for a source, or null while it is not published. */
export function readerFor(source: HistorySource): ReaderFacts | null {
  const { reader } = source;
  return reader ? { href: `/projects/history/${reader.slug}/`, entries: reader.entries, words: reader.words } : null;
}

/** Every source whose reading edition is open, with its facts. */
export const openReaders = historySources.flatMap((source) => {
  const reader = readerFor(source);
  return reader ? [{ source, reader }] : [];
});

/** "about 145,000 words". */
export function roundedWords(words: number): string {
  return `about ${(Math.round(words / 1000) * 1000).toLocaleString("en-US")} words`;
}
