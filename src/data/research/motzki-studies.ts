export interface MotzkiStudy {
  number: string;
  year: string;
  title: string;
  subject: string;
  type: string;
  classification: string;
  bookTitle: string;
  bookSubtitle?: string;
  seriesTitle?: string;
  publisher: string;
  summary: string;
  points: string[];
  link?: { url: string; label: string };
}

export const motzkiStudies: MotzkiStudy[] = [
  // Brill - The Origins of Islamic Jurisprudence (01–06)
  {
    number: '01',
    year: '1991',
    title: 'The Muṣannaf of ʿAbd al-Razzāq al-Ṣanʿānī as a Source of Authentic Aḥādīth of the First Century A.H.',
    subject: 'ʿAbd al-Razzāq’s Muṣannaf',
    type: 'Case study',
    classification: 'Source reconstruction · authenticity testing',
    bookTitle: 'The Origins of Islamic Jurisprudence',
    bookSubtitle: 'Meccan Fiqh before the Classical Schools',
    seriesTitle: 'Islamic History and Civilization · Vol. 28',
    publisher: 'BRILL',
    summary:
      'Motzki investigates whether the 11-volume Muṣannaf of ʿAbd al-Razzāq al-Ṣanʿānī (d. 211/827) preserves authentic legal traditions from the 1st and early 2nd centuries A.H., directly confronting Joseph Schacht’s skepticism regarding early legal isnāds. Reconstructing the work’s manuscript recensions (chiefly via Isḥāq b. Ibrāhīm al-Dabarī, d. 286/899) and evaluating a statistical cross-section of 3,810 traditions across ʿAbd al-Razzāq’s primary teachers—Maʿmar b. Rāshid (32%), Ibn Jurayj (29%), Sufyān al-Thawrī (22%), and Sufyān b. ʿUyayna (4%)—Motzki demonstrates that each authority possesses an idiosyncratic transmission profile statistically irreconcilable with retrospective forgery. Corroborated by formal hallmarks like expressed uncertainty (shakk), indirect cross-citations, and independent biographical records, the study establishes that ʿAbd al-Razzāq faithfully reproduced pre-classical legal teaching corpora from Mecca, Medina, and Basra.',
    points: [
      'Refuting Schachtian Skepticism: Schacht accepted 2nd-century attribution to Abū Ḥanīfa while dismissing 1st-century authorities as fictive without empirical proof; Motzki demonstrates that transmission history must be tested for concrete evidence of falsification rather than dismissed a priori.',
      'Manuscript Recension Recovery: 90% (29 of 33 books) of the extant Muṣannaf derives from a single student, Isḥāq b. Ibrāhīm al-Dabarī (d. 286/899), who audited the work under parental supervision in 210 A.H.; collation across later branches (al-Aʿrābī, al-Būsī, al-Qurṭubī) proves the text represents stable written lecture notebooks.',
      'Quantified Informant Profiles: Statistical profiling of 3,810 traditions shows radically divergent source structures—Maʿmar relies 28% on al-Zuhrī and 25% on Qatāda with 1% personal opinion; Ibn Jurayj draws 39% from ʿAṭāʾ b. Abī Rabāḥ; al-Thawrī contains 19% personal legal reasoning (raʾy) across 161 authorities. A forger fabricating labels would never invent such distinct profiles.',
      'Inadvertent Criteria of Authenticity: Non-deliberate textual markers—including explicit admissions of teacher doubt (e.g. "Abū Bakr was unsure about it"), indirect cross-transmissions between primary teachers (al-Thawrī → Ibn Jurayj), and specific samāʿ distinctions—preclude deliberate pseudepigraphy.',
      'Rebuttal of Hawting & Juynboll: Refutes Hawting’s claim of late redaction by showing introductory formulae mirror student copyist practices, and dismisses Juynboll’s conjecture of hyper-sophisticated forgery designed to trick modern critics as unsupported speculation.',
      'Historical Horizon of 1st-Century Law: Because ʿAbd al-Razzāq acquired his material between 144 and 153 A.H. from scholars recording 1st-century Meccan jurists like ʿAṭāʾ and Companions like Ibn ʿAbbās, the Muṣannaf offers genuine historical access to pre-classical Islamic jurisprudence before the formal madhāhib.'
    ],
    link: {
      url: '/projects/motzki-origins-jurisprudence/',
      label: 'Read Complete Academic Chapter & Apparatus'
    }
  },
  {
    number: '02',
    year: '1991 / 2002',
    title: 'Die Anfänge der islamischen Jurisprudenz / The Origins of Islamic Jurisprudence',
    subject: 'Early Meccan fiqh',
    type: 'Monograph',
    classification: 'Large-scale source reconstruction',
    bookTitle: 'The Origins of Islamic Jurisprudence',
    bookSubtitle: 'Meccan Fiqh before the Classical Schools',
    seriesTitle: 'Islamic History and Civilization · Vol. 28',
    publisher: 'BRILL',
    summary: 'This is Motzki’s large-scale application of source criticism to early Meccan jurisprudence. Using ʿAbd al-Razzāq’s transmission material, he reconstructs earlier layers of teaching and then compares them with biographical evidence.',
    points: [
      'The roots of Meccan legal scholarship can be traced into the middle of the first Islamic century.',
      'The material attributed to ʿAṭāʾ, ʿAmr b. Dīnār, Ibn Jurayj, and other transmitters can be tested through formal transmission criteria.',
      'The evidence points to substantial local development in Mecca alongside reception of material from other centers.',
      'The strongest conclusions come from combining source analysis, variant comparison, and biography.'
    ]
  },
  {
    number: '03',
    year: '1991',
    title: 'The ʿAṭāʾ b. Abī Rabāḥ Corpus',
    subject: 'ʿAṭāʾ · Ibn Jurayj',
    type: 'Case study',
    classification: 'Authenticity test · Meccan fiqh',
    bookTitle: 'The Origins of Islamic Jurisprudence',
    bookSubtitle: 'Meccan Fiqh before the Classical Schools',
    seriesTitle: 'Islamic History and Civilization · Vol. 28',
    publisher: 'BRILL',
    summary: 'Within The Origins of Islamic Jurisprudence, Motzki tests whether Ibn Jurayj’s large corpus from ʿAṭāʾ genuinely reflects his teacher’s legal instruction rather than later attribution.',
    points: [
      'ʿAṭāʾ material accounts for almost 40% of the Ibn Jurayj material preserved through ʿAbd al-Razzāq.',
      'Indirect transmissions, variant reports, uncertainties, and disagreements with ʿAṭāʾ are treated as evidence of reporting precision.',
      'The corpus is dominated by legal opinions and teaching rather than a later, artificially standardized Prophetic corpus.',
      'Motzki concludes that the transmission provides a substantial basis for reconstructing early Meccan legal thought.'
    ]
  },
  {
    number: '04',
    year: '1991',
    title: 'The ʿAmr b. Dīnār Transmission Experiment',
    subject: 'ʿAmr b. Dīnār · Ibn Jurayj · Ibn ʿUyayna',
    type: 'Case study',
    classification: 'Independent pupils · transmission control',
    bookTitle: 'The Origins of Islamic Jurisprudence',
    bookSubtitle: 'Meccan Fiqh before the Classical Schools',
    seriesTitle: 'Islamic History and Civilization · Vol. 28',
    publisher: 'BRILL',
    summary: 'Motzki compares the ʿAmr material transmitted by Ibn Jurayj with the parallel corpus transmitted by Sufyān b. ʿUyayna. The two strands provide an unusually valuable internal control because they preserve the same teacher through different pupils.',
    points: [
      'The two transmission strands have distinct profiles rather than looking like a single fabricated chain duplicated mechanically.',
      'Genre distribution, use of transmission formulas, and treatment of ʿAmr’s own opinions differ in systematic ways.',
      'The 72-year age gap between ʿAmr and Ibn ʿUyayna is treated as unusual but not sufficient by itself to prove fabrication.',
      'Independent pupils make it possible to test the quality and stability of material attributed to the same teacher.'
    ]
  },
  {
    number: '05',
    year: '1991',
    title: 'The Ibn Jurayj Source Corpus',
    subject: 'Ibn Jurayj and his informants',
    type: 'Case study',
    classification: 'Source provenance · geographic stratification',
    bookTitle: 'The Origins of Islamic Jurisprudence',
    bookSubtitle: 'Meccan Fiqh before the Classical Schools',
    seriesTitle: 'Islamic History and Civilization · Vol. 28',
    publisher: 'BRILL',
    summary: 'Motzki maps Ibn Jurayj’s extensive network of more than one hundred informants to determine where his material came from and whether it reflects a coherent historical teaching environment.',
    points: [
      'Meccan authorities form the backbone of the corpus, with ʿAṭāʾ and ʿAmr accounting for the largest share.',
      'Medinan material is present in a meaningful secondary proportion, while genuine Syrian and Basran material is marginal.',
      'The profile suggests strong local Meccan development together with selective reception of outside traditions.',
      'The differing profiles of individual source corpora support the authenticity of the transmission attributions.'
    ]
  },
  {
    number: '06',
    year: '1991 / 2010',
    title: 'The Jurisprudence of Ibn Shihāb al-Zuhrī',
    subject: 'Ibn Shihāb al-Zuhrī',
    type: 'Case study',
    classification: 'Source-critical reconstruction',
    bookTitle: 'The Origins of Islamic Jurisprudence',
    bookSubtitle: 'Meccan Fiqh before the Classical Schools',
    seriesTitle: 'Islamic History and Civilization · Vol. 28',
    publisher: 'BRILL',
    summary: 'Motzki reconstructs al-Zuhrī’s legal teaching from later collections and compares independent transmission lines. The study becomes an important example of how a teacher’s corpus can be reconstructed without simply equating it with a lost written book.',
    points: [
      'Transmission terminology and source preferences can reveal distinctive profiles within a teacher’s corpus.',
      'Later collections can preserve earlier teaching when their transmission relationships are reconstructed critically.',
      'Matn comparison is required to determine whether different isnād branches really transmit related material.',
      'Source reconstruction is about recovering a historical body of teaching, not automatically a verbatim lost book.'
    ]
  },

  // Brill - Analysing Muslim Traditions (07–09)
  {
    number: '07',
    year: '1996',
    title: '“Whither Ḥadīth Studies?” / Quo vadis Ḥadīth-Forschung?',
    subject: 'Nāfiʿ traditions',
    type: 'Case study',
    classification: 'Explicit ICMA · common-link reassessment',
    bookTitle: 'Analysing Muslim Traditions',
    bookSubtitle: 'Studies in Legal, Exegetical and Maghāzī Ḥadīth',
    seriesTitle: 'Islamic History and Civilization · Vol. 78',
    publisher: 'BRILL',
    summary: 'Motzki’s clearest named ICMA case re-examines Juynboll’s analysis of traditions attributed to Nāfiʿ. The study uses the relationship between isnād and matn variants to test whether the common link should be understood as the originator or as a historical collector and disseminator.',
    points: [
      'The common link should not automatically be identified with the invention of the tradition.',
      'A single strand below the common link is not automatically fictitious merely because other branches are unknown.',
      'Matn groups that correspond to transmission branches provide an empirical check on the isnād reconstruction.',
      'The common link may be the first major collector and professional disseminator, while the informant he names may push the tradition’s history earlier.'
    ]
  },
  {
    number: '08',
    year: '2000',
    title: 'The Prophet and the Debtors: A Ḥadīth Analysis under Scrutiny',
    subject: 'Surraq / debtors tradition',
    type: 'Case study',
    classification: 'Applied criticism · late attestation',
    bookTitle: 'Analysing Muslim Traditions',
    bookSubtitle: 'Studies in Legal, Exegetical and Maghāzī Ḥadīth',
    seriesTitle: 'Islamic History and Civilization · Vol. 78',
    publisher: 'BRILL',
    summary: 'Motzki uses the Surraq tradition to demonstrate the danger of assuming that a tradition first existed when it first appears in a surviving compilation. Its transmission history is used to test chronology more cautiously.',
    points: [
      'Non-occurrence in a surviving early collection can have several explanations besides non-existence.',
      'Early collections were selective and could be edited, rearranged, or transmitted incompletely.',
      'A tradition may be historically early even when its earliest extant witness is late.',
      'The case reinforces Motzki’s broader rejection of arguments from silence as a standalone dating method.'
    ]
  },
  {
    number: '09',
    year: '2010',
    title: 'The Origins of Muslim Exegesis: A Debate',
    subject: 'Early tafsīr transmission',
    type: 'Methodological application',
    classification: 'Source criticism · exegesis',
    bookTitle: 'Analysing Muslim Traditions',
    bookSubtitle: 'Studies in Legal, Exegetical and Maghāzī Ḥadīth',
    seriesTitle: 'Islamic History and Civilization · Vol. 78',
    publisher: 'BRILL',
    summary: 'Motzki applies his broader source-critical program to early Muslim exegesis, challenging approaches that attempt to date exegetical material from textual content alone.',
    points: [
      'Exegetical texts can preserve older sources inside later compilations.',
      'Source reconstruction can shorten the chronological distance between a report and the period it describes.',
      'The provenance claimed in an isnād must be tested rather than simply accepted or dismissed.',
      'The same transmission logic used for ḥadīth can illuminate the development of tafsīr.'
    ]
  },

  // Brill - The Biography of Muḥammad (10)
  {
    number: '10',
    year: '2000',
    title: 'The Murder of Ibn Abī l-Ḥuqayq',
    subject: 'Maghāzī traditions',
    type: 'Case study',
    classification: 'Applied ICMA · historical reports',
    bookTitle: 'The Biography of Muḥammad',
    bookSubtitle: 'The Issue of the Sources',
    seriesTitle: 'Islamic History and Civilization · Vol. 32',
    publisher: 'BRILL',
    summary: 'Motzki applies the combined method to reports about the murder of Ibn Abī l-Ḥuqayq, testing the origin and reliability of competing Maghāzī narratives through their transmission and textual relationships.',
    points: [
      'Different narrative forms can be compared as members of a transmission history rather than treated as isolated accounts.',
      'The isnād bundle provides a framework for locating where individual versions become visible.',
      'Textual divergences can indicate later expansion, combination, or modification.',
      'The study is explicitly listed by Motzki among detailed examples of isnād-cum-matn analysis.'
    ]
  },

  // Gorgias Press - Reconstruction of a Source of Ibn Isḥāq… (11)
  {
    number: '11',
    year: '2017',
    title: 'Reconstruction of a Source of Ibn Isḥāq’s Life of the Prophet and Early Qurʾān Exegesis',
    subject: 'Muḥammad b. Abī Muḥammad · Ibn ʿAbbās traditions',
    type: 'Case study',
    classification: 'Explicit ICMA · source reconstruction',
    bookTitle: 'Reconstruction of a Source of Ibn Isḥāq',
    bookSubtitle: 'A Study of Early Ibn ʿAbbās Traditions',
    seriesTitle: 'Islamic History and Thought',
    publisher: 'GORGIAS PRESS',
    summary: 'Motzki reconstructs the profile of Muḥammad b. Abī Muḥammad inside Ibn Isḥāq’s Sīra material. He argues that the source can be identified only by combining the patterns of transmission with differences in textual content and structure.',
    points: [
      'The material attributed to Muḥammad b. Abī Muḥammad has a distinctive profile when compared with Ibn Isḥāq’s other named sources.',
      'The combined method allows Ibn Isḥāq to remain a meaningful common link while his earlier sources are separately reconstructed.',
      'Motzki identifies recurring information about the Prophet’s Qurayshī, Jewish, and Medinan opponents as part of the source’s profile.',
      'The central conclusion is that Muḥammad b. Abī Muḥammad was a source for Ibn Isḥāq’s vita, a conclusion unavailable from isnād or text alone.'
    ]
  },

  // Routledge - Ḥadīth: Origins and Developments (12)
  {
    number: '12',
    year: '2004',
    title: 'Ḥadīth: Origins and Developments',
    subject: 'Modern scholarship on ḥadīth',
    type: 'Edited volume',
    classification: 'Research context · edited collection',
    bookTitle: 'Ḥadīth: Origins and Developments',
    bookSubtitle: 'Origins and Developments',
    seriesTitle: 'The Formation of the Classical Islamic World · Vol. 28',
    publisher: 'ROUTLEDGE',
    summary: 'Motzki’s edited volume places the major debates over ḥadīth transmission, isnād origins, and methods of dating into one scholarly corpus. It also includes his important study of ʿAbd al-Razzāq’s Muṣannaf.',
    points: [
      'The volume is organized around origins and transmission, the origin and reliability of the isnād, and methods of analysing and dating ḥadīths.',
      'Motzki’s introduction presents the move away from sweeping scepticism toward source-critical examination of individual traditions.',
      'His Muṣannaf study appears within the section on methods of analysing and dating ḥadīths.',
      'The volume is best treated as methodological context rather than a single ICMA case study.'
    ]
  },

  // Standalone HadithCritic Research Dossiers (13–17)
  {
    number: '13',
    year: '2012',
    title: 'Methods of Dating Early Legal Traditions',
    subject: 'Methodological program',
    type: 'Methodology',
    classification: 'Dating · source criticism · ICMA',
    bookTitle: 'HadithCritic Methodology Register',
    publisher: 'HADITHCRITIC',
    summary: 'Motzki frames the problem of recovering the first century and a half of Islamic law from later sources. He presents isnād-cum-matn analysis as a concrete way to test whether transmitted material preserves earlier reports rather than simply projecting later ideas backward.',
    points: [
      'Source claims should be tested through concrete examinations of mutūn, asānīd, and biographical information rather than accepted or rejected wholesale.',
      'ICMA asks whether differences in matn correlate with differences in transmission lines.',
      'A positive correlation supports the historical reality of the named transmission process.',
      'The method is a testable middle position between radical scepticism and uncritical acceptance.'
    ]
  },
  {
    number: '14',
    year: '2005',
    title: 'Dating Muslim Traditions: A Survey',
    subject: 'Dating traditions',
    type: 'Methodology',
    classification: 'Core ICMA · five-step model',
    bookTitle: 'HadithCritic Methodology Register',
    publisher: 'HADITHCRITIC',
    summary: 'Motzki surveys the principal methods used to date Muslim traditions and argues that isnād-cum-matn analysis is more reliable than matn-only, collection-occurrence, or common-link analysis used in isolation.',
    points: [
      'Compile all identifiable variants of the tradition.',
      'Diagram the full isnād bundle and identify common links and partial common links.',
      'Compile the matns belonging to the different transmission branches for synoptic comparison.',
      'Compare isnād groups with matn groups to determine whether a correlation exists.',
      'Where correlation exists, reconstruct the common link’s transmitted form and later changes.'
    ]
  },
  {
    number: '15',
    year: '1998',
    title: 'The Prophet and the Cat: On Dating Mālik’s Muwaṭṭaʾ and Legal Traditions',
    subject: 'Mālik’s Muwaṭṭaʾ · Companion traditions',
    type: 'Case study',
    classification: 'Applied ICMA · dating',
    bookTitle: 'HadithCritic Applied ICMA',
    publisher: 'HADITHCRITIC',
    summary: 'Motzki extends his transmission-critical method to traditions preserved in Mālik’s Muwaṭṭaʾ, using their transmission history to reassess the dating of legal and Companion material.',
    points: [
      'The date of the earliest surviving collection is not automatically the date of origin of its contents.',
      'Companion traditions can be investigated through their surviving chains and textual variants.',
      'Transmission structure must be read alongside textual form to distinguish older material from subsequent reshaping.',
      'The study is one of the detailed isnād-cum-matn examples Motzki later cites when explaining the method.'
    ]
  },
  {
    number: '16',
    year: '2001',
    title: 'The Collection of the Qurʾān',
    subject: 'Reports on Abū Bakr’s collection and ʿUthmān’s edition',
    type: 'Case study',
    classification: 'Applied ICMA · Qurʾānic tradition',
    bookTitle: 'HadithCritic Applied ICMA',
    publisher: 'HADITHCRITIC',
    summary: 'Motzki applies his isnād-plus-matn method to reports about the collection of the Qurʾān. He argues that the transmission evidence permits a substantially earlier dating of these reports than major text-centered theories had proposed.',
    points: [
      'Groups of matn variants correspond closely with groups of isnād variants.',
      'That correlation supports interpreting the transmission as historical rather than wholesale fabrication.',
      'Al-Zuhrī is treated as a major disseminator of the report on Abū Bakr’s collection.',
      'The material can be placed by the first quarter of the second Islamic century, while the named earlier informants provide further chronological depth.'
    ]
  },
  {
    number: '17',
    year: '1999',
    title: 'The Role of Non-Arab Converts in the Development of Early Islamic Law',
    subject: 'Ethnicity and legal scholarship',
    type: 'Historical study',
    classification: 'Not ICMA · prosopographical statistics',
    bookTitle: 'HadithCritic Historical Dossier',
    publisher: 'HADITHCRITIC',
    summary: 'This study belongs in the Motzki research dossier but is not an ICMA case. He tests the claim that non-Arab converts came to dominate early Islamic jurisprudence through a statistical analysis of the biographical evidence.',
    points: [
      'The overall sample contains 63 Arab and 52 non-Arab scholars, rather than a clear non-Arab majority.',
      'The proportions change substantially across generations, contradicting a simple linear story of mawālī dominance.',
      'Regional patterns differ sharply, with non-Arab scholars especially prominent in some centers but not others.',
      'Motzki argues that the conventional picture results partly from overgeneralizing a limited set of prominent examples.'
    ]
  }
];
