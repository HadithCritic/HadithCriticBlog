/*
 * The shorter works converted by scripts/hadith/convert-translated-treatises.mjs: what each one is, how it is divided,
 * and which Shamela page-record export holds its Arabic. Wording comes from each source's own title page and
 * catalog entry.
 *
 * `groups` and `records` are the counts the builder expects; rerun the converter and update them together.
 */
export const TREATISES = [
  {
    slug: 'kitab-al-kharaj-yahya-ibn-adam', file: 'kitab-al-kharaj', bookId: '26647', mode: 'chapters', noun: 'Chapter',
    title_en: 'Kitāb al-Kharāj of Yaḥyā ibn Ādam', short: 'Kitāb al-Kharāj', compiler: 'Yaḥyā ibn Ādam', death: 203,
    kind: 'Topical book (kitāb)', groups: 21, records: 638,
    blurb: 'The book of Yaḥyā ibn Ādam al-Qurashī (d. 203 AH) on land tax, booty, tribute and the tithe: reports and legal opinions arranged by chapter, in the transmission of al-Ḥasan ibn ʿAlī ibn ʿAffān.',
    structure: 'A topical book in chapters (bāb). The copy is in parts, and each part opens with the chain through which it was transmitted; those chains stand before the reports they introduce and are not counted among them.',
  },
  {
    slug: 'hadith-muhammad-ibn-abd-allah-al-ansari', file: 'hadith-muhammad-b-abd-allah-al-ansari', bookId: '13110', mode: 'chapters', noun: 'Section',
    title_en: 'Ḥadīth of Muḥammad ibn ʿAbd Allāh al-Anṣārī', short: 'Ḥadīth al-Anṣārī', compiler: 'Muḥammad ibn ʿAbd Allāh al-Anṣārī', death: 215,
    kind: 'Fascicle (juzʾ)', groups: 27, records: 97,
    blurb: 'A fascicle of the ḥadīth of Muḥammad ibn ʿAbd Allāh al-Anṣārī (d. 215 AH), judge of Basra, as transmitted by Abū Muslim al-Kajjī. The reports are gathered under the teacher each group comes from.',
    structure: 'A fascicle whose own headings name the teacher whose ḥadīth follows, such as “the ḥadīth of Sulaymān al-Taymī from Abū ʿUthmān al-Nahdī”. Each heading is a section here, with the reports under it.',
  },
  {
    slug: 'kitab-al-salah-abu-nuaym', file: '9644_', bookId: '9644', mode: 'chapters', noun: 'Chapter',
    title_en: 'Kitāb al-Ṣalāh of Abū Nuʿaym al-Faḍl ibn Dukayn', short: 'Kitāb al-Ṣalāh', compiler: 'Abū Nuʿaym al-Faḍl ibn Dukayn', death: 219,
    kind: 'Topical book (kitāb)', groups: 66, records: 348,
    blurb: 'The Book of Prayer of Abū Nuʿaym al-Faḍl ibn Dukayn (d. 219 AH) of Kufa: reports on purity and prayer under short chapter headings, most of them sayings and practice of Companions and Successors.',
    structure: 'A topical book in short chapters (bāb). The first report gives the chain through which the book was transmitted; the reports after it begin from Abū Nuʿaym’s own teacher.',
  },
  {
    slug: 'hadith-abi-al-yaman', bodyTitle: 'The fascicle', file: 'hadith-abi-al-yaman', bookId: '29704', mode: 'flat', noun: 'Section',
    title_en: 'Ḥadīth of Abū al-Yamān', title_ar: 'حديث أبي اليمان الحكم بن نافع', short: 'Ḥadīth Abī al-Yamān', compiler: 'Abū al-Yamān al-Ḥakam ibn Nāfiʿ', death: 222,
    kind: 'Fascicle (juzʾ)', groups: 1, records: 69, titlePage: () => true,
    blurb: 'A fascicle of the ḥadīth of Abū al-Yamān al-Ḥakam ibn Nāfiʿ of Homs (d. 222 AH), nearly all of it from Shuʿayb ibn Abī Ḥamza from al-Zuhrī. The text is a manuscript transcription with one report to a page.',
    structure: 'An undivided fascicle of numbered reports. The title page names the transmitters of the copy and stands before the reports. A few source records hold further unnumbered reports after the numbered one; those are shown together with it, as the source prints them.',
  },
  {
    slug: 'kitab-al-iman-al-adani', file: 'al-iman-al-adani', bookId: '13006', mode: 'chapters', noun: 'Chapter',
    title_en: 'Kitāb al-Īmān of al-ʿAdanī', title_ar: 'الإيمان للعدني', short: 'Kitāb al-Īmān', compiler: 'Ibn Abī ʿUmar al-ʿAdanī', death: 243,
    kind: 'Topical book (kitāb)', groups: 56, records: 79,
    blurb: 'The Book of Faith of Muḥammad ibn Yaḥyā Ibn Abī ʿUmar al-ʿAdanī (d. 243 AH), who taught in Mecca: a short book of reports on faith, its pillars and its conditions, with a chapter heading over nearly every report.',
    structure: 'A short book in chapters (bāb). Most chapters hold one or two reports; each chapter heading is a chapter here, with its reports under it.',
  },
  {
    slug: 'qiraat-al-nabi-al-duri', file: "The Prophet's", bookId: '13106', mode: 'chapters', noun: 'Section',
    title_en: 'Qirāʾāt al-Nabī of al-Dūrī', short: 'Qirāʾāt al-Nabī', compiler: 'Abū ʿUmar Ḥafṣ ibn ʿUmar al-Dūrī', death: 246,
    kind: 'Fascicle (juzʾ)', groups: 49, records: 132,
    editor: 'Ḥikmat Bashīr Yāsīn', edition: 'Maktabat al-Dār, Medina, 1st ed., 1408 AH / 1988 CE',
    blurb: 'A fascicle by the Qurʾān reader Ḥafṣ ibn ʿUmar al-Dūrī (d. 246 AH) gathering reports of how the Prophet recited particular words of the Qurʾān, in the order of the sūras.',
    structure: 'A fascicle in the order of the sūras. The source heads each group of reports with the name of its sūra; each sūra is a section here, with its reports under it. The translation writes each chain with arrows, each transmitter reporting from the one after him.',
  },
  {
    slug: 'kitab-al-fitan-hanbal-ibn-ishaq', bodyTitle: 'The fascicle', file: 'hadith-fitan-hanbal', bookId: '13046', mode: 'flat', noun: 'Section',
    title_en: 'Kitāb al-Fitan of Ḥanbal ibn Isḥāq', short: 'Kitāb al-Fitan', compiler: 'Ḥanbal ibn Isḥāq', death: 273,
    kind: 'Fascicle (juzʾ)', groups: 1, records: 51,
    blurb: 'The fourth part of the Book of Tribulations of Ḥanbal ibn Isḥāq (d. 273 AH), nephew and student of Aḥmad ibn Ḥanbal: reports about the Dajjāl and the trials before the Hour.',
    structure: 'An undivided fascicle of numbered reports. The first report gives the chain through which the part was transmitted; the reports after it begin from Ḥanbal’s own teacher.',
    completeness: 'The supplied source holds reports 1 to 50, and all of them are translated here. The translation notes that the source text it was given broke off after report 50.',
  },
  {
    slug: 'sunan-al-athram', file: 'sunan-al-athram', bookId: '26550', mode: 'chapters', noun: 'Chapter',
    title_en: 'Sunan al-Athram', short: 'Sunan al-Athram', compiler: 'Abū Bakr al-Athram', death: 273,
    kind: 'Sunan (surviving part)', groups: 22, records: 169,
    blurb: 'The surviving part of the Sunan of Abū Bakr al-Athram (d. 273 AH), student of Aḥmad ibn Ḥanbal: chapters on ablution in which reports stand beside al-Athram’s own questions to Aḥmad and his remarks on conflicting reports.',
    structure: 'A book of sunan in chapters (bāb). Each chapter heading is printed on the line of its first report in the source and is the chapter title here. Square brackets in the Arabic are the editor’s supplements from other sources.',
  },
  {
    slug: 'kitab-al-zuhd-abu-hatim-al-razi', bodyTitle: 'The book', file: '3525_', bookId: '3525', mode: 'flat', noun: 'Section',
    title_en: 'Kitāb al-Zuhd of Abū Ḥātim al-Rāzī', title_ar: 'الزهد لأبي حاتم الرازي', short: 'Kitāb al-Zuhd', compiler: 'Abū Ḥātim al-Rāzī', death: 277,
    kind: 'Topical book (kitāb)', groups: 1, records: 123,
    blurb: 'The Book of Asceticism of Abū Ḥātim Muḥammad ibn Idrīs al-Rāzī (d. 277 AH): 105 numbered reports on renunciation, most of them sayings of Companions, Successors and early ascetics.',
    structure: 'An undivided book of numbered reports. It opens with the chain through which the copy was transmitted, which the source spreads over its first pages and which stands once before the reports. Where one printed number covers a second chain or a further passage, each is its own entry under the same number.',
  },
  {
    slug: 'musnad-ibrahim-ibn-adham', file: 'musnad-ibrahim-b-adham', bookId: '13153', mode: 'chapters', noun: 'Section',
    title_en: 'Musnad Ibrāhīm ibn Adham', short: 'Musnad Ibrāhīm ibn Adham', compiler: 'Ibn Manda', death: 395, dateOf: 'Ibn Manda, who compiled it',
    kind: 'Musnad of one transmitter', groups: 23, records: 48,
    blurb: 'The ḥadīth that the ascetic Ibrāhīm ibn Adham (d. 162 AH) transmitted, gathered by Abū ʿAbd Allāh Ibn Manda (d. 395 AH) under the teacher each report comes from, and closed with reports about Ibrāhīm’s repentance and asceticism.',
    structure: 'A short musnad whose headings name the teacher Ibrāhīm ibn Adham reports from. Each heading is a section here, with the reports under it. Many entries are sayings and anecdotes, not Prophetic ḥadīth. Where two printed numbers share one text, the first number is the label.',
  },
];
