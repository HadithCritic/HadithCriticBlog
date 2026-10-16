/** Source availability checked on 2026-10-14. See docs/history-source-inventory.md.
 * A saved translation catalog is evidence of earlier work, not a published text.
 *
 * Sources are listed in order of their authors' deaths, which is the order the
 * page's chronology draws them in. `died` is the conventional death date in
 * hijrī and common-era years; `circa` marks a date the biographers disagree on.
 */
export const historySources = [
  {
    id: 'khalifa-ibn-khayyat',
    author: 'Khalīfa ibn Khayyāṭ',
    title: 'Tārīkh Khalīfa ibn Khayyāṭ',
    arabic: 'تاريخ خليفة بن خياط',
    form: 'Chronicle',
    died: { ah: 240, ce: 854, circa: false },
    imageBase: '/images/history/khalifa-ibn-khayyat',
    imageAlt: 'Historical painting of anonymous commanders overlooking an army crossing a vast desert plain, evoking the campaigns recorded in Khalīfa’s chronicle.',
    imageCaption: 'An early caliphate landscape',
    description: 'A starting point for reading a historical chronicle in sequence, with its Arabic text, translation and printed-page references together.',
    availability: 'Earlier digitized translation recorded',
    note: 'The earlier translation catalog records this work, and a saved inspection report describes 433 exported page records with Arabic and English samples. The complete export still needs to be recovered and checked before publication. Translation method and human review are not established.',
    reference: 'Shamela book 6615',
  },
  {
    id: 'al-baladhuri',
    author: 'Al-Balādhurī',
    title: 'Futūḥ al-buldān',
    arabic: 'فتوح البلدان',
    form: 'Conquest history',
    died: { ah: 279, ce: 892, circa: true },
    imageBase: '/images/history/al-baladhuri-v2',
    imageAlt: 'An interpretive painting of an arriving expedition meeting local inhabitants outside a late-antique town gate, evoking the lands and settlements in Futūḥ al-buldān.',
    imageCaption: 'At the gates of a town',
    description: 'An intended source for exploring accounts of the conquests through the places and communities described in the text.',
    availability: 'English edition identified',
    note: 'An English PDF titled History of the Arab Invasions, The Conquest of the Lands is present in the source library. Its translation attribution and edition need to be verified from the book itself before a digitized text is published.',
    reference: 'PDF identified; digital text pending',
  },
  {
    id: 'al-tabari',
    author: 'Al-Ṭabarī',
    title: 'The History of al-Ṭabarī',
    arabic: 'تاريخ الطبري',
    form: 'History',
    died: { ah: 310, ce: 923, circa: false },
    imageBase: '/images/history/al-tabari-v2',
    imageAlt: 'An interpretive painting of Abbasid Baghdad and the Tigris, with working river boats, brick buildings and populated quays, evoking one part of al-Ṭabarī’s broad historical world.',
    imageCaption: 'An Abbasid river city',
    description: 'An intended collection for following historical accounts across volumes and comparing the passages that describe the same events.',
    availability: 'English editions identified',
    note: 'The source library contains English PDFs of volumes 5 and 39, together with an OCR transcript of volume 5. These are published translations, distinct from the earlier translation dataset. A complete digitized edition is not yet available here.',
    reference: 'Volumes 5 and 39 identified',
  },
] as const;

export type HistorySource = (typeof historySources)[number];

/** "d. 240/854", or "d. c. 279/892" where the date is disputed. */
export function deathDate(source: HistorySource): string {
  const { ah, ce, circa } = source.died;
  return `d. ${circa ? 'c. ' : ''}${ah}/${ce}`;
}

/** The span the chronology draws, in hijrī years. It runs past the last death
 * date so the last label has as much room as the others. */
export const chronologySpan = { from: 200, to: 340, ticks: [200, 250, 300] } as const;
