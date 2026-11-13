/* The commentaries published as bilingual reader pages: Tafsīr Mujāhid,
   Tafsīr al-Thawrī and al-Zamakhsharī's al-Kashshāf.

   Each work's page bodies and index live in src/data/tafsir/pages/<id>/, one
   HTML file per surah. The two early commentaries are written by
   scripts/tafsir/build-tafsir-edition-pages.mjs from the organized tafsir library
   (one passage per source row, Arabic and English together) and laid out by
   scripts/tafsir/restyle-tafsir-editions.mjs; al-Kashshāf is written by
   scripts/tafsir/build-tafsir-zamakhshari.mjs. A surah is read one verse at a time:
   src/lib/tafsir-edition-html.ts files its chapters under their verses, and
   the routes are src/pages/projects/tafsir/[work]/[surah]/. */
import mujahid from './pages/mujahid/index.json';
import thawri from './pages/thawri/index.json';
import zamakhshari from './pages/zamakhshari/index.json';

export interface EditionPart {
  slug: string;
  surah: number;
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
  /** al-Kashshāf: whether the whole surah is translated, and what is missing if not. */
  status?: string;
  coverageNote?: string | null;
  /** al-Kashshāf: the printed pages the surah has in Arabic. */
  sourcePages?: number;
  /** al-Kashshāf: the passages the surah is divided into, and its questions and answers. */
  passages?: number;
  exchanges?: number;
}

interface EditionIndex {
  id: string;
  /** Whether the edition prints report numbers (al-Thawrī). */
  numbered: boolean;
  grouping: 'surah';
  edition: { source_url: string };
  parts: EditionPart[];
  /** A page body is made of reports, or of printed pages (al-Kashshāf). */
  unit?: string;
  /** al-Kashshāf: how much Arabic the edition has, and how much of it is in English. */
  sourceTotals?: { surahs: number; pages: number };
  translated?: { surahs: number; pages: number };
  untranslated?: number[];
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
  /** The name on the breadcrumb and the labels: "Mujāhid", "al-Thawrī". */
  short: string;
  /** The line under the author's name at the top of a page. */
  attribution: string;
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
      'The work is traditionally attributed to Abū al-Ḥajjāj Mujāhid ibn Jabr al-Makkī al-Qurashī al-Makhzūmī (d. 104 AH). The attribution names the figure the surviving commentary is associated with; it does not show that he compiled the recension in its present form, and not every report in it is transmitted from him.',
      'Arabic edition: <cite>Tafsīr Mujāhid</cite>, edited by Muḥammad ʿAbd al-Salām Abū al-Nīl (Dār al-Fikr al-Islāmī al-Ḥadītha, Egypt; first edition, 1410 AH / 1989 CE). The text is Shamela book 12810, whose pagination follows the printed edition. The edition does not number the reports, so they are counted within each surah, and it has no section for Sūrat al-Kāfirūn (109).',
      'Verse references are the editor’s printed citations, such as [البقرة: 14], and are not inferred from the wording; Qur’anic wording the edition sets in braces is highlighted.',
    ],
    short: 'Mujāhid',
    attribution: 'Tafsīr attributed to Mujāhid',
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
      'Each report is shown with the Arabic beside its English translation, in the order the edition prints them. That order is the manuscript’s: the editor numbered its 911 reports as he found them, and notes that the manuscript sometimes explains a later verse before an earlier one. Each report is labeled with the numbering as the Arabic prints it; where the English prints a different number, both are given. A report that runs on to the next printed page stays whole, with the page break marked ⦗p. N⦘. Surahs follow the 49 headings the edition prints, from al-Baqara to al-Ṭūr. The editor’s introduction and conclusion are not shown here.',
      'Verse labels come from the edition’s own markers, (الآية N), read against the surah heading above them. Square brackets in the English mark wording the source Arabic leaves unclear.',
    ],
    short: 'al-Thawrī',
    attribution: 'Commentary transmitted by Abū Ḥudhayfa al-Nahdī',
    shamelaId: 2229,
  },
  {
    id: 'zamakhshari',
    name: 'al-Zamakhsharī',
    author: 'Abū al-Qāsim Maḥmūd ibn ʿUmar ibn Aḥmad al-Zamakhsharī',
    died: 538,
    title: 'al-Kashshāf',
    arabic: 'الكشاف عن حقائق غوامض التنزيل',
    blurb:
      'Maḥmūd ibn ʿUmar al-Zamakhsharī of Khwārazm (d. 538 AH). A commentary known for its close attention to Qur’anic language and expression, read here verse by verse with his questions and answers set apart.',
    about: [
      'Abū al-Qāsim Maḥmūd ibn ʿUmar ibn Aḥmad al-Zamakhsharī (d. 538 AH), <cite>al-Kashshāf ʿan ḥaqāʾiq ghawāmiḍ al-tanzīl wa-ʿuyūn al-aqāwīl fī wujūh al-taʾwīl</cite>, edited by Muṣṭafā Ḥusayn Aḥmad (Dār al-Rayyān li-l-Turāth, Cairo, and Dār al-Kitāb al-ʿArabī, Beirut). The text is Shamela book 23627. Shamela’s record gives the date of printing as 1362 AH / 1947 CE and marks it as needing to be checked.',
      'The text is arranged by passage. A passage opens where the edition prints a verse heading, such as [سورة الإخلاص (112) : الآيات 1 الى 4], and runs to the next, so a passage that covers several verses appears on each of their pages. Within it the Arabic faces its English page by page, each row labeled with its printed page, and the editor’s notes for those pages sit under the passage; their markers in the text are set as «1».',
      'Al-Zamakhsharī’s objections and replies (“If you ask … I say …”) are set as question and answer where a page has the same number of them in both languages. Nothing in the text marks where a reply stops, so an answer runs to the next question or to the end of its printed page.',
      'The translation renders Allāh as God and sets honorifics as symbols (ﷺ, ؓ, ؒ).',
    ],
    short: 'al-Zamakhsharī',
    attribution: 'Commentary',
    shamelaId: 23627,
  },
];

const INDEXES: Record<string, EditionIndex> = {
  mujahid: mujahid as EditionIndex,
  thawri: thawri as EditionIndex,
  zamakhshari: zamakhshari as EditionIndex,
};

export type Edition = EditionIndex & EditionText & { enWords: number };

export const editions: Edition[] = TEXT.map((text) => {
  const index = INDEXES[text.id];
  /* The display text wins over the index's raw title and author records. */
  return { ...index, ...text, enWords: index.parts.reduce((sum, p) => sum + p.enWords, 0) };
});

export const editionById = (id: string): Edition | undefined => editions.find((e) => e.id === id);
