/**
 * The design of each collection's front page: how its hero is composed, the
 * pattern drawn behind it, its colors, and a short account of the work.
 * Read by src/components/hadith/CollectionFront.astro.
 *
 *   layout   portrait      the compiler's medallion large beside the title
 *            plate         the work's cover art, the medallion set on its corner
 *            colophon      the Arabic title set large in the work's color
 *            frontispiece  a centered title page under the medallion
 *            (`mirror` sets a portrait's or plate's art on the left)
 *   motif    a pattern that says what kind of work it is: linked rings for a
 *            book ordered by chains, a broken chain for the mursal reports,
 *            ruled lines for a book of rulings, a surveyor's grid for the
 *            land tax, arches for prayer and the Prophet's portrait, waves for
 *            the works of Egypt and Yemen, vowel dots for the readings, reeds
 *            for the ascetics, an eight-point star for the Kufan musnads.
 *   palette  ground and glow color the hero, which stays dark in both themes;
 *            accent is the work's color as text on dark, deep on light. Every
 *            accent and deep clears WCAG AA on the ground it sits on.
 *
 * Place comes from the compiler registry (hadith-compilers.ts), the title and
 * compiler line from the collection's own HTML; nothing here repeats them.
 */

export type HeroLayout = 'portrait' | 'plate' | 'colophon' | 'frontispiece';
export type HeroMotif = 'chain' | 'broken-chain' | 'ledger' | 'measure' | 'star' | 'arcade' | 'waves' | 'dots' | 'reed';

export interface CollectionPalette {
  ground: string;
  glow: string;
  accent: string;
  deep: string;
}

export interface CollectionIdentity {
  layout: HeroLayout;
  motif: HeroMotif;
  palette: CollectionPalette;
  /** Sets the art on the left of a portrait or plate hero. */
  mirror?: boolean;
  era: string;
  /** Replaces the template's generic hero sentence where the work had no description of its own. */
  lede?: string;
  about: string;
  edition: string;
}

const NOT_RECORDED = 'Not recorded in the supplied source';

export const COLLECTION_IDENTITIES: Record<string, CollectionIdentity> = {
  'musnad-abu-hanifa': {
    mirror: true,
    layout: 'portrait',
    motif: 'star',
    palette: { ground: '#121a24', glow: '#c49a4e', accent: '#ead2a0', deep: '#7a5a1e' },
    era: '2nd century AH',
    lede: 'The reports that pass through Abū Ḥanīfa, gathered after his death and arranged by the books of law, from faith and purity to judgment.',
    about:
      'Abū Ḥanīfa taught in Kufa and left no book of ḥadīth of his own. Later scholars collected the reports transmitted through him into musnads, and this is the version associated with al-Ḥaṣkafī. It shows the Kufan teachers, among them Ḥammād ibn Abī Sulaymān, behind the school that bears his name.',
    edition: 'ed. ʿAbd al-Raḥmān Ḥasan Maḥmūd, al-Ādāb, Egypt'
  },
  'jami-mamar-ibn-rashid': {
    layout: 'plate',
    motif: 'waves',
    palette: { ground: '#26132a', glow: '#b86aa5', accent: '#ecbfe0', deep: '#80386f' },
    era: '2nd century AH',
    lede: 'One of the oldest arranged books of ḥadīth, written by a Basran who settled in Yemen and taught it there to ʿAbd al-Razzāq.',
    about:
      'Maʿmar ibn Rāshid studied with al-Zuhrī and Qatāda before making his home in Sanaa. His Jāmiʿ survives because his student ʿAbd al-Razzāq copied it whole at the end of his own Muṣannaf, where it fills the last two volumes. Its chapters reach past law into manners, the virtues of the Companions and the end of time.',
    edition: 'ed. Ḥabīb al-Raḥmān al-Aʿẓamī, al-Majlis al-ʿIlmī, 2nd ed., 1983 (vols. 10 and 11 of the Muṣannaf)'
  },
  'hadith-sufyan-al-thawri': {
    layout: 'colophon',
    motif: 'reed',
    palette: { ground: '#161a1f', glow: '#9aa7b8', accent: '#d5dce8', deep: '#475670' },
    era: '2nd century AH',
    lede: 'Two parts of the ḥadīth of Sufyān al-Thawrī, the Kufan whom his contemporaries called the commander of the faithful in ḥadīth.',
    about:
      'Al-Thawrī refused office under the ʿAbbāsids and spent his last years in hiding, yet his reports passed to almost every major collector of the next generation. These two parts keep them as al-Sarī ibn Yaḥyā and al-Firyābī carried them, in the sections of the manuscript.',
    edition: 'ed. ʿĀmir Ḥasan Ṣabrī, Dār al-Bashāʾir al-Islāmiyya, 2004'
  },
  'ahadith-al-sari-an-al-thawri': {
    layout: 'plate',
    motif: 'chain',
    palette: { ground: '#132222', glow: '#6aa6a0', accent: '#b4ddd7', deep: '#2b6560' },
    era: '2nd century AH',
    lede: 'Reports of Sufyān al-Thawrī as they reached al-Sarī ibn Yaḥyā, kept in the sections of a single manuscript.',
    about:
      'Al-Thawrī’s ḥadīth was gathered by many hands, and each student’s collection preserves a slightly different selection. This one follows al-Sarī ibn Yaḥyā, and its manuscript was published before it was printed, so the folio numbers here are the manuscript’s own.',
    edition: 'ed. ʿĀmir Ḥasan Ṣabrī, Dār al-Bashāʾir, 2004'
  },
  'musnad-abd-allah-ibn-al-mubarak': {
    layout: 'portrait',
    motif: 'chain',
    palette: { ground: '#2a1910', glow: '#d9822b', accent: '#f2b77c', deep: '#8a4814' },
    era: '2nd century AH',
    lede: 'A short musnad of ʿAbd Allāh ibn al-Mubārak of Merv, its reports set out under thirteen topical headings.',
    about:
      'Ibn al-Mubārak divided his years between trade, the pilgrimage and the Byzantine frontier, and he was remembered as much for his generosity and asceticism as for his learning. Students came to him from Khurasan and Iraq alike. This musnad keeps a small part of what he taught, from purity to the trials of the last days.',
    edition: 'ed. Ṣubḥī al-Badrī al-Sāmarrāʾī, Maktabat al-Maʿārif, Riyadh, 1987'
  },
  'al-athar-abu-yusuf': {
    layout: 'plate',
    motif: 'ledger',
    palette: { ground: '#2a1513', glow: '#b5523f', accent: '#efa894', deep: '#8f3b2b' },
    era: '2nd century AH',
    lede: 'The reports on which the Kufan school built its law, set out by Abū Yūsuf in the order of a book of fiqh, from ablution to slaughter.',
    about:
      'Abū Yūsuf was Abū Ḥanīfa’s leading student and the first to hold the title of chief judge, serving in Baghdad under Hārūn al-Rashīd. Most of these reports come through Abū Ḥanīfa from Ḥammād and Ibrāhīm al-Nakhaʿī, and many end in a Companion’s or Successor’s ruling rather than a word of the Prophet.',
    edition: 'ed. Abū al-Wafāʾ al-Afghānī, Lajnat Iḥyāʾ al-Maʿārif al-Nuʿmāniyya, Hyderabad'
  },
  'al-athar-al-shaybani': {
    layout: 'colophon',
    motif: 'ledger',
    palette: { ground: '#1d1830', glow: '#8a6fc4', accent: '#cdbdf2', deep: '#5a4494' },
    era: '2nd century AH',
    lede: 'Al-Shaybānī’s recension of the reports Abū Ḥanīfa taught, each one weighed against the school’s practice.',
    about:
      'Muḥammad ibn al-Ḥasan al-Shaybānī studied with Abū Ḥanīfa and then with Abū Yūsuf and Mālik, and his books became the written foundation of the Ḥanafī school. Here he often closes a report with his own verdict, “and this we follow” (wa-bihi naʾkhudh), often noting that it was also the view of Abū Ḥanīfa. The edition covers the first 79 chapters.',
    edition: 'ed. Abū al-Wafāʾ al-Afghānī, Lajnat Iḥyāʾ al-Maʿārif al-Nuʿmāniyya, Hyderabad'
  },
  'al-jami-ibn-wahb': {
    layout: 'portrait',
    motif: 'waves',
    palette: { ground: '#0f2826', glow: '#3f9c8c', accent: '#95dccb', deep: '#1d6659' },
    era: '2nd century AH',
    lede: 'Ibn Wahb’s collection of reports on conduct, learning and piety, the matters a book of law leaves aside.',
    about:
      'ʿAbd Allāh ibn Wahb of Egypt studied with Mālik in Medina for many years and with al-Layth ibn Saʿd at home, and he carried both men’s teaching to the next generation of Egyptian scholars. His Jāmiʿ gathers what did not fit his Muwaṭṭaʾ: manners, knowledge, worship and the life to come.',
    edition: 'ed. Muṣṭafā Ḥasan Abū al-Khayr, Dār Ibn al-Jawzī'
  },
  'muwatta-ibn-wahb-muharaba': {
    layout: 'frontispiece',
    motif: 'star',
    palette: { ground: '#1b1d21', glow: '#8a96a8', accent: '#c8d0dc', deep: '#4a5568' },
    era: '2nd century AH',
    lede: 'The book on armed robbery and its penalty from Ibn Wahb’s Muwaṭṭaʾ, in the recension of Yūnus ibn ʿAbd al-Aʿlā.',
    about:
      'The penalty for those who “wage war against God and His Messenger” (Q 5:33) was one of the hardest questions early jurists faced. Ibn Wahb answers it the Medinan way, setting Prophetic reports beside the rulings of Companions and Successors and the opinions of Mālik.',
    edition: 'Dār al-Gharb, Beirut, 1st ed.'
  },
  'muwatta-ibn-wahb-qada-buyu': {
    layout: 'plate',
    motif: 'measure',
    palette: { ground: '#2a2010', glow: '#c4943a', accent: '#ebc882', deep: '#7a5714' },
    era: '2nd century AH',
    lede: 'The book on judgment in sales from Ibn Wahb’s Muwaṭṭaʾ, kept in the recension of Saḥnūn of Qayrawān.',
    about:
      'Saḥnūn studied with Ibn Wahb in Egypt and carried his teaching west to Ifrīqiya, where it shaped the Mālikī school of North Africa. This book sets Prophetic reports beside the rulings and opinions that settled disputes over trade, debt and delivery.',
    edition: 'No printed edition named in the supplied source'
  },
  'kitab-al-kharaj-yahya-ibn-adam': {
    layout: 'portrait',
    motif: 'measure',
    palette: { ground: '#1b2314', glow: '#8aa24e', accent: '#c9db92', deep: '#4b6120' },
    era: '3rd century AH',
    about:
      'With Abū Yūsuf’s book of the same name, this is among the earliest surviving works on how the early state taxed conquered land. Yaḥyā ibn Ādam set out the reports and the jurists’ opinions on land tax, tribute and the tithe, and historians of early Islamic Iraq still read it for what it records of the first settlements.',
    edition: 'al-Maṭbaʿa al-Salafiyya, 2nd ed., 1384 AH'
  },
  'hadith-muhammad-ibn-abd-allah-al-ansari': {
    layout: 'colophon',
    motif: 'chain',
    palette: { ground: '#0f1f33', glow: '#4f86c6', accent: '#a4c8ef', deep: '#24548c' },
    era: '3rd century AH',
    about:
      'Al-Anṣārī lived long and had heard from Successors such as Ḥumayd al-Ṭawīl and Sulaymān al-Taymī, so his chains were short; several of al-Bukhārī’s three-link chains pass through him. This fascicle reaches us through Abū Muslim al-Kajjī and groups the reports under the teacher each came from.',
    edition: 'ed. Masʿad ʿAbd al-Ḥamīd al-Saʿdanī, Aḍwāʾ al-Salaf, Riyadh, 1998'
  },
  'musnad-al-humaydi': {
    layout: 'portrait',
    motif: 'arcade',
    palette: { ground: '#17161b', glow: '#c9a85c', accent: '#e8d29c', deep: '#76601f' },
    era: '3rd century AH',
    about:
      'Al-Ḥumaydī sat with Sufyān ibn ʿUyayna in Mecca for many years, and much of his Musnad passes through that one teacher. Al-Bukhārī, his student, opens the Ṣaḥīḥ with a report he heard from al-Ḥumaydī.',
    edition: 'ed. Ḥasan Salīm Asad al-Dārānī, Dār al-Saqqā, Damascus, 1996'
  },
  'musnad-al-shafii': {
    layout: 'colophon',
    motif: 'ledger',
    palette: { ground: '#122019', glow: '#5fa37a', accent: '#a9d8b8', deep: '#2f6b47' },
    era: '3rd century AH',
    about:
      'Al-Shāfiʿī never compiled a musnad. These are the reports he cites in his books, as al-Rabīʿ ibn Sulaymān transmitted them in Fusṭāṭ, gathered under the book each one came from, so the order follows his law rather than his teachers.',
    edition: 'Dār al-Kutub al-ʿIlmiyya, Beirut, 1980, corrected against the Būlāq and Indian printings'
  },
  'kitab-al-salah-abu-nuaym': {
    layout: 'frontispiece',
    motif: 'arcade',
    palette: { ground: '#221a20', glow: '#c98a8a', accent: '#f1bfba', deep: '#8e4545' },
    era: '3rd century AH',
    about:
      'Abū Nuʿaym belonged to the Kufan generation that taught al-Bukhārī and Aḥmad ibn Ḥanbal. His Book of Prayer keeps the practice of Kufa as its people remembered it, and the sayings and acts of Companions and Successors far outnumber the reports from the Prophet.',
    edition: 'ed. Ṣalāḥ b. ʿĀyiḍ al-Shilāḥī, Maktabat al-Ghurabāʾ al-Athariyya, Medina, 1996'
  },
  'musnad-ibn-abi-shayba': {
    mirror: true,
    layout: 'portrait',
    motif: 'star',
    palette: { ground: '#2b1310', glow: '#d0603f', accent: '#f3a98d', deep: '#9a3a1f' },
    era: '3rd century AH',
    about:
      'Abū Bakr ibn Abī Shayba of Kufa is best known for his great Muṣannaf, arranged by subject. In this Musnad he arranged reports by Companion instead. Muslim took more of his Ṣaḥīḥ from him than from any other teacher.',
    edition: 'ed. ʿĀdil al-ʿAzāzī and Aḥmad al-Mazīdī, Dār al-Waṭan, Riyadh, 1997'
  },
  'musnad-khalifa-ibn-khayyat': {
    layout: 'colophon',
    motif: 'ledger',
    palette: { ground: '#14202a', glow: '#6f9bb5', accent: '#add0e2', deep: '#2f5f78' },
    era: '3rd century AH',
    lede: 'A Basran historian’s musnad: reports set out under the Companions who transmitted them.',
    about:
      'Khalīfa ibn Khayyāṭ wrote the earliest surviving annals of Islamic history and a book of the generations of scholars, and al-Bukhārī was among his students. This smaller work shows the same orderly hand turned to ḥadīth.',
    edition: NOT_RECORDED
  },
  'kitab-al-iman-al-adani': {
    layout: 'frontispiece',
    motif: 'star',
    palette: { ground: '#0e2427', glow: '#3aa0a8', accent: '#98dadd', deep: '#1b686e' },
    era: '3rd century AH',
    about:
      'Ibn Abī ʿUmar came from Aden and taught in Mecca for decades; Muslim and al-Tirmidhī were among his students. His book belongs to the early works that set out faith as both word and deed, a definition argued over in his century.',
    edition: 'ed. Ḥamad al-Jābirī al-Ḥarbī, al-Dār al-Salafiyya, Kuwait, 1407 AH'
  },
  'qiraat-al-nabi-al-duri': {
    layout: 'colophon',
    motif: 'dots',
    palette: { ground: '#111a33', glow: '#5b6fd1', accent: '#b1bdf6', deep: '#34459e' },
    era: '3rd century AH',
    about:
      'Al-Dūrī transmitted the readings of both Abū ʿAmr of Basra and al-Kisāʾī, and two of the canonical transmissions of the Qurʾān still bear his name. In this fascicle he turns from the readers to the Prophet himself, sūra by sūra.',
    edition: 'ed. Ḥikmat Bashīr Yāsīn, Maktabat al-Dār, Medina, 1988'
  },
  'musnad-sad-ibn-abi-waqqas': {
    mirror: true,
    layout: 'portrait',
    motif: 'star',
    palette: { ground: '#261c12', glow: '#b8874a', accent: '#e6c592', deep: '#7a5320' },
    era: '3rd century AH',
    lede: 'The reports of a single Companion, Saʿd ibn Abī Waqqāṣ, gathered by Aḥmad ibn Ibrāhīm al-Dawraqī.',
    about:
      'Saʿd was among the earliest converts to Islam, led the Muslim army at al-Qādisiyya and founded the garrison city of Kufa. A musnad of one Companion lets a reader see everything a single witness was remembered as saying, and how his sons and clients carried it on.',
    edition: NOT_RECORDED
  },
  'birr-al-walidayn': {
    layout: 'frontispiece',
    motif: 'arcade',
    palette: { ground: '#2a1716', glow: '#c97a6a', accent: '#f3bcaf', deep: '#93473a' },
    era: '3rd century AH',
    lede: 'A short book of reports on kindness to parents, attributed to al-Bukhārī.',
    about:
      'The duty to parents was a theme al-Bukhārī returned to: it is the subject that opens his al-Adab al-Mufrad. This short work gathers the reports on it, read here in the recension of Abū Bakr ibn Dallūya from Abū Yaʿlā al-Muhallabī.',
    edition: NOT_RECORDED
  },
  'sunan-al-athram': {
    mirror: true,
    layout: 'plate',
    motif: 'ledger',
    palette: { ground: '#14231d', glow: '#5f9c7c', accent: '#aad8be', deep: '#2b6747' },
    era: '3rd century AH',
    about:
      'Al-Athram was among Aḥmad ibn Ḥanbal’s closest students and wrote down his answers to questions of law and ḥadīth criticism. Later Ḥanbalīs drew on those records when they gathered their imam’s rulings, and this surviving part of his Sunan shows them in use.',
    edition: 'ed. ʿĀmir Ḥasan Ṣabrī, Dār al-Bashāʾir al-Islāmiyya, Beirut, 2004'
  },
  'al-marasil-abi-dawud': {
    layout: 'colophon',
    motif: 'broken-chain',
    palette: { ground: '#1d1a26', glow: '#8d7fb8', accent: '#cec4ec', deep: '#574a85' },
    era: '3rd century AH',
    lede: 'Reports in which a Successor speaks for the Prophet without naming the Companion between them, gathered by Abū Dāwūd in the chapters of law.',
    about:
      'Abū Dāwūd kept these mursal reports out of his Sunan and gave them a book of their own, because jurists disagreed on whether a chain with a missing link could prove a ruling. Mālik and Abū Ḥanīfa often accepted them; al-Shāfiʿī set conditions.',
    edition: 'Muʾassasat al-Risāla, Beirut, 2nd ed., 1998'
  },
  'al-shama-il-al-muhammadiyah': {
    layout: 'frontispiece',
    motif: 'arcade',
    palette: { ground: '#0f241c', glow: '#4f9a72', accent: '#b4e0c5', deep: '#21613f' },
    era: '3rd century AH',
    lede: 'Al-Tirmidhī’s portrait of the Prophet: his appearance, dress, food, speech, worship and manner, in fifty-six chapters.',
    about:
      'Al-Tirmidhī, author of the Jāmiʿ, gathered here every report he knew on how the Prophet looked and lived. The book founded its genre and has been read, taught and commented on in every century since.',
    edition: 'ed. Māhir Yāsīn al-Faḥl, Dār al-Gharb al-Islāmī, Beirut, 2000'
  },
  'al-muntaqa-ibn-al-jarud': {
    layout: 'portrait',
    motif: 'star',
    palette: { ground: '#2a1d0e', glow: '#d29a4a', accent: '#f0ca8f', deep: '#7f5214' },
    era: '4th century AH',
    lede: 'A selection (muntaqā) of reports on law that Ibn al-Jārūd judged sound, arranged in the chapters of a book of sunan.',
    about:
      'Ibn al-Jārūd came from Nishapur and settled in Mecca. His book is short and strict, and later scholars counted it among the collections that admit only sound ḥadīth.',
    edition: 'ed. ʿAbd Allāh ʿUmar al-Bārūdī, Beirut, 1988'
  },
  'musnad-ibrahim-ibn-adham': {
    mirror: true,
    layout: 'portrait',
    motif: 'reed',
    palette: { ground: '#1e2018', glow: '#8e9a6a', accent: '#d0d8ab', deep: '#535e2b' },
    era: '4th century AH',
    about:
      'Ibrāhīm ibn Adham left a life of wealth in Balkh for poverty and the Syrian frontier, and became one of the models of early asceticism. Two centuries later Ibn Manda of Isfahan gathered the little ḥadīth he transmitted and the stories told about him.',
    edition: 'ed. Majdī al-Sayyid Ibrāhīm, Maktabat al-Qurʾān, Cairo'
  },
  'sahifat-hammam-ibn-munabbih': {
    layout: 'frontispiece',
    motif: 'ledger',
    palette: { ground: '#24161c', glow: '#c08a6a', accent: '#f0c8aa', deep: '#8a4f2c' },
    era: 'Written in the 1st century AH',
    about:
      'Hammām ibn Munabbih of Sanaa wrote these reports down from Abū Hurayra, which makes the Ṣaḥīfa one of the oldest written collections of ḥadīth known to survive. It came down whole through Maʿmar ibn Rāshid and ʿAbd al-Razzāq, and its wording can be compared report by report with the same texts in the later collections.',
    edition: 'ed. ʿAlī Ḥasan ʿAlī ʿAbd al-Ḥamīd, al-Maktab al-Islāmī and Dār ʿAmmār, 1987'
  }
};

export function identityFor(slug: string): CollectionIdentity {
  const identity = COLLECTION_IDENTITIES[slug];
  if (!identity) throw new Error(`No front page design for ${slug} in collection-identities.ts`);
  return identity;
}
