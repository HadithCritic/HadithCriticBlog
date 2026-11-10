/* The early commentaries published as bilingual reader pages: Tafsīr Mujāhid,
   Tafsīr al-Thawrī and Ibn Wahb's Tafsīr from al-Jāmiʿ.

   Each work's page bodies and index live in src/data/tafsir-pages/<id>/,
   written by scripts/build-tafsir-edition-pages.mjs from the organized tafsir
   library (one passage per source row, Arabic and English together). The
   route is src/pages/projects/tafsir/[work]/[part].astro. */
import mujahid from './tafsir-pages/mujahid/index.json';
import thawri from './tafsir-pages/thawri/index.json';
import ibnWahb from './tafsir-pages/ibn-wahb/index.json';

export interface EditionPart {
  slug: string;
  surah?: number;
  /** Ibn Wahb: the manuscript's part (juzʾ) and the chapter page's place in it. */
  volume?: number;
  chapter?: number;
  chapters?: number;
  /** Ibn Wahb: whether the chapter opens with a heading in the source. */
  headed?: boolean;
  title: string;
  ar: string | null;
  verseCount?: number;
  sourceHeading?: string | null;
  entries: number;
  enWords: number;
  arWords: number;
  firstPage: string;
  lastPage: string;
  firstReport: string | null;
  lastReport: string | null;
  verses: number;
  jumps: { id: string; label: string }[];
}

interface EditionIndex {
  id: string;
  /** Whether the edition prints report numbers (al-Thawrī, Ibn Wahb). */
  numbered: boolean;
  grouping: 'surah' | 'chapter';
  edition: { source_url: string };
  parts: EditionPart[];
}

interface EditionText {
  id: string;
  /** Short name, as on the al-Ṭabarī card. */
  name: string;
  author: string;
  died: number;
  title: string;
  arabic: string;
  /** The card's two-sentence introduction, drawn from the edition's own title page. */
  blurb: string;
  /** Paragraphs for "About the edition" on every page of the work. */
  about: string[];
  /** A portrait in /images/tafsir/figures/, if there is one. */
  portrait?: string;
  region?: string;
  shamelaId: number;
}

const TEXT: EditionText[] = [
  {
    id: 'mujahid',
    name: 'Mujāhid ibn Jabr',
    author: 'Abū al-Ḥajjāj Mujāhid ibn Jabr al-Makkī',
    died: 104,
    title: 'Tafsīr Mujāhid',
    arabic: 'تفسير مجاهد',
    blurb:
      'The Successor Mujāhid ibn Jabr of Mecca (d. 104 AH). His explanations of the Qur’an, transmitted through Ādam ibn Abī Iyās and arranged surah by surah.',
    about: [
      'Abū al-Ḥajjāj Mujāhid ibn Jabr al-Makkī al-Qurashī al-Makhzūmī (d. 104 AH), <cite>Tafsīr Mujāhid</cite>, edited by Muḥammad ʿAbd al-Salām Abū al-Nīl (Dār al-Fikr al-Islāmī al-Ḥadītha, Egypt; first edition, 1410 AH / 1989 CE). The text is Shamela book 12810, whose pagination follows the printed edition.',
      'Each card is one record of the edition, usually one report, with the Arabic beside its English translation, in the edition’s order. The edition does not number the reports, so the cards are counted within each surah. The surah headings are the edition’s own. The edition has no section for Sūrat al-Kāfirūn (109).',
      'Verse labels are the editor’s printed citations, such as [البقرة: 14], and are not inferred from the wording. Qur’anic wording set in braces in the Arabic is highlighted; the braces are the edition’s.',
    ],
    portrait: 'mujahid',
    region: 'mecca',
    shamelaId: 12810,
  },
  {
    id: 'thawri',
    name: 'Sufyān al-Thawrī',
    author: 'Abū ʿAbd Allāh Sufyān ibn Saʿīd ibn Masrūq al-Thawrī al-Kūfī',
    died: 161,
    title: 'Tafsīr al-Thawrī',
    arabic: 'تفسير الثوري',
    blurb:
      'The supplied edition identifies Sufyān ibn Saʿīd al-Thawrī as al-Kūfī (d. 161 AH) and records this commentary through Abū Jaʿfar Muḥammad ibn Abī Ḥudhayfa al-Nahdī.',
    about: [
      'Abū ʿAbd Allāh Sufyān ibn Saʿīd ibn Masrūq al-Thawrī al-Kūfī (d. 161 AH), <cite>Tafsīr al-Thawrī</cite>, transmitted from him by Abū Jaʿfar Muḥammad ibn Abī Ḥudhayfa al-Nahdī (Dār al-Kutub al-ʿIlmiyya, Beirut; first edition, 1403 AH / 1983 CE). The text is Shamela book 2229, whose pagination follows the printed edition.',
      'Each card is one numbered report, with the Arabic beside its English translation, in the order the edition prints them. That order is the manuscript’s: the editor numbered its 911 reports as he found them, and notes that the manuscript sometimes explains a later verse before an earlier one. Each card is labeled with the numbering as the Arabic prints it; where the English prints a different number, both are given. A report that runs on to the next printed page stays one card, with the page break marked. Surahs follow the 49 headings the edition prints, from al-Baqara to al-Ṭūr. The editor’s introduction and conclusion are not shown here.',
      'Verse labels come from the edition’s own markers, (الآية N), read against the surah heading above them. Square brackets in the English mark wording the source Arabic leaves unclear.',
    ],
    shamelaId: 2229,
  },
  {
    id: 'ibn-wahb',
    name: 'Ibn Wahb',
    author: 'Abū Muḥammad ʿAbd Allāh ibn Wahb ibn Muslim al-Miṣrī al-Qurashī',
    died: 197,
    title: 'Tafsīr al-Qurʾān min al-Jāmiʿ',
    arabic: 'تفسير القرآن من الجامع لابن وهب',
    blurb:
      'The Egyptian traditionist ʿAbd Allāh ibn Wahb (d. 197 AH). Qur’anic reports from his Jāmiʿ in the transmission of Saḥnūn, edited by Miklos Muranyi in three volumes.',
    about: [
      'Abū Muḥammad ʿAbd Allāh ibn Wahb ibn Muslim al-Miṣrī al-Qurashī (d. 197 AH), <cite>Tafsīr al-Qurʾān min al-Jāmiʿ</cite>, in the transmission of Saḥnūn ibn Saʿīd, edited by Miklos Muranyi (Dār al-Gharb al-Islāmī; first edition, 2003 CE; three volumes). The text is Shamela book 37361, whose pagination follows the printed edition.',
      'The work is not arranged by surah, so it is read here by Ibn Wahb’s own chapter headings, within the three parts (ajzāʾ) of the manuscript, each of which opens with its own title page. Reports before a part’s first heading, and the whole of the second part, which has no headings, have pages of their own. Each card is one numbered report, with the Arabic beside its English translation, in the edition’s order. The editor’s page breaks appear in the English as ⦗p. N⦘.',
      'The edition prints no verse references, so none are added. Square brackets in the English mark lacunae and wording the source Arabic leaves unclear.',
    ],
    shamelaId: 37361,
  },
];

const INDEXES: Record<string, EditionIndex> = {
  mujahid: mujahid as EditionIndex,
  thawri: thawri as EditionIndex,
  'ibn-wahb': ibnWahb as EditionIndex,
};

export type Edition = EditionIndex & EditionText & { enWords: number; collection: number };

/* Collection numbers continue the front page's sequence (al-Ṭabarī 001,
   al-Zamakhsharī 002). */
const COLLECTION: Record<string, number> = { thawri: 3, mujahid: 4, 'ibn-wahb': 5 };

export const editions: Edition[] = TEXT.map((text) => {
  const index = INDEXES[text.id];
  /* The display text wins over the index's raw title and author records. */
  return {
    ...index,
    ...text,
    enWords: index.parts.reduce((sum, p) => sum + p.enWords, 0),
    collection: COLLECTION[text.id],
  };
});

export const editionById = (id: string) => editions.find((e) => e.id === id);

export const partHref = (edition: Edition, part: EditionPart) => `/projects/tafsir/${edition.id}/${part.slug}/`;

/** "Sūrah 02" or "Vol. 3". */
export const partLabel = (part: EditionPart) => (part.surah ? `Sūrah ${String(part.surah).padStart(2, '0')}` : `Vol. ${part.volume}`);

/** "2" for a surah; "3.5" for Ibn Wahb's fifth chapter page in part 3. */
export const partCode = (part: EditionPart) => (part.surah ? String(part.surah) : `${part.volume}.${part.chapter}`);
