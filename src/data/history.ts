/** Source availability checked on 2026-10-16. See docs/history-source-inventory.md.
 * A saved translation catalog is evidence of earlier work, not a published text.
 *
 * Sources are listed in order of their authors' deaths, which is the order the
 * page's chronology draws them in. `died` is the conventional death date in
 * hijrī and common-era years; `circa` marks a date the biographers disagree on.
 */
export const historySources = [
  {
    id: 'al-waqidi-ridda',
    author: 'Muḥammad ibn ʿUmar al-Wāqidī',
    title: 'The Book of Apostasy (Kitāb al-Ridda)',
    arabic: 'كتاب الردة',
    form: 'Early caliphate history',
    died: { ah: 207, ce: 823, circa: false },
    imageBase: '/images/history/al-waqidi-ridda',
    imageAlt: 'An interpretive painting of riders returning across an Arabian plain toward Medina in the early caliphate period.',
    imageCaption: 'The road to Medina',
    description: 'An account of the upheaval after the Prophet’s death, the Saqīfa, tribal defections and the Ridda campaigns across Arabia.',
  },
  {
    id: 'khalifa-ibn-khayyat',
    author: 'Khalīfa ibn Khayyāṭ',
    title: 'Chronicle of Khalīfa ibn Khayyāṭ (Tārīkh Khalīfa ibn Khayyāṭ)',
    arabic: 'تاريخ خليفة بن خياط',
    form: 'Chronicle',
    died: { ah: 240, ce: 854, circa: false },
    imageBase: '/images/history/khalifa-ibn-khayyat',
    imageAlt: 'Historical painting of anonymous commanders overlooking an army crossing a vast desert plain, evoking the campaigns recorded in Khalīfa’s chronicle.',
    imageCaption: 'An early caliphate landscape',
    description: 'A concise annalistic chronicle of early Islamic history, preserving yearly reports and notices on people and campaigns.',
  },
  {
    id: 'ibn-habib-munammaq',
    author: 'Muḥammad ibn Ḥabīb al-Baghdādī',
    title: 'Genealogies of Quraysh (al-Munammaq fī akhbār Quraysh)',
    arabic: 'المنمق في أخبار قريش',
    form: 'Genealogical history',
    died: { ah: 245, ce: 860, circa: false },
    imageBase: '/images/history/ibn-habib-munammaq',
    imageAlt: 'An interpretive painting of a scribe and clan elders studying a genealogy in a Meccan valley.',
    imageCaption: 'Quraysh in the Meccan valley',
    description: 'A history of Quraysh through its lineages, alliances and remembered disputes, including the Pact of the Virtuous and stories of the Kaʿba.',
  },
  {
    id: 'ibn-habib-muhabbar',
    author: 'Muḥammad ibn Ḥabīb al-Baghdādī',
    title: 'The Well-Informed (al-Muḥabbar)',
    arabic: 'المحبّر',
    form: 'Social and genealogical compendium',
    died: { ah: 245, ce: 860, circa: false },
    imageBase: '/images/history/ibn-habib-muhabbar',
    imageAlt: 'An interpretive painting of travelers, tribal delegates and a scribe at a caravan gathering in an Arabian valley.',
    imageCaption: 'Gathering on the caravan road',
    description: 'A compendium of Arab social memory: pilgrimage leaders, caliphs, expeditions, Quraysh lineages, notable people and customs.',
  },
  {
    id: 'ibn-abd-al-hakam',
    author: 'ʿAbd al-Raḥmān ibn ʿAbd Allāh ibn ʿAbd al-Ḥakam',
    title: 'Conquests of Egypt and the Maghrib (Futūḥ Miṣr wa-l-Maghrib)',
    arabic: 'فتوح مصر والمغرب',
    form: 'Regional conquest history',
    died: { ah: 257, ce: 871, circa: false },
    imageBase: '/images/history/ibn-abd-al-hakam',
    imageAlt: 'An interpretive painting of riders approaching an early Islamic riverside settlement along the Nile.',
    imageCaption: 'The Nile frontier',
    description: 'A history of Egypt from traditions about its ancient past through the Roman and Persian periods and the conquest under ʿAmr ibn al-ʿĀṣ, with accounts extending into the Maghrib.',
  },
  {
    id: 'ibn-qutayba-maarif',
    author: 'ʿAbd Allāh ibn Muslim ibn Qutayba al-Dīnawarī',
    title: 'Knowledge (al-Maʿārif)',
    arabic: 'المعارف',
    form: 'Historical and genealogical compendium',
    died: { ah: 276, ce: 889, circa: false },
    imageBase: '/images/history/ibn-qutayba-maarif',
    imageAlt: 'An interpretive painting of an Abbasid-era compiler surrounded by books and scrolls in a Baghdad study.',
    imageCaption: 'A scholar’s compendium',
    description: 'A survey of genealogies and notable figures, including Banū Hāshim, Banū Umayya, Yemen, al-Aws and al-Khazraj, prophets and rulers.',
  },
  {
    id: 'al-fasawi-marifa-tarikh',
    author: 'Yaʿqūb ibn Sufyān al-Fasawī',
    title: 'Knowledge and History (al-Maʿrifa wa-l-tārīkh)',
    arabic: 'المعرفة والتاريخ',
    form: 'History and transmission',
    died: { ah: 277, ce: 890, circa: false },
    imageBase: '/images/history/ibn-fasawi',
    imageAlt: 'An interpretive painting of a scholarly traveler arriving at an Abbasid-era city with books and scroll cases.',
    imageCaption: 'A journey for knowledge',
    description: 'A historical compilation shaped by al-Fasawī’s travels through Mecca, Egypt, Syria, Iraq and Fārs, preserving reports about scholars and transmitters.',
  },
  {
    id: 'al-baladhuri',
    author: 'Al-Balādhurī',
    title: 'The Conquests of the Lands (Futūḥ al-buldān)',
    arabic: 'فتوح البلدان',
    form: 'Conquest history',
    died: { ah: 279, ce: 892, circa: true },
    imageBase: '/images/history/al-baladhuri-v2',
    imageAlt: 'An interpretive painting of an arriving expedition meeting local inhabitants outside a late-antique town gate, evoking the lands and settlements in Futūḥ al-buldān.',
    imageCaption: 'At the gates of a town',
    description: 'An account of conquests and settlements across Arabia, Syria, Egypt, Iraq and other lands, preserving local traditions and agreements.',
  },
  {
    id: 'al-tabari',
    author: 'Al-Ṭabarī',
    title: 'The History of al-Ṭabarī (Tārīkh al-Ṭabarī)',
    arabic: 'تاريخ الطبري',
    form: 'Universal history',
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
