/**
 * ICMA Archive Art Directions & Visual Profiles
 * Refined, minimalist scholarly archive system focusing on authentic
 * bookbinding textures and restrained, deep academic color palettes.
 */

export interface ICMAArtDirection {
  family: 'network' | 'chronology' | 'geography' | 'source-reconstruction' | 'variants' | 'legal' | 'polemics';
  palette: {
    bg: string;
    bgAccent: string;
    border: string;
    rule: string;
    accent: string;
    accentBright: string;
    paper: string;
    muted: string;
  };
  texture: 'laid' | 'buckram' | 'morocco' | 'vellum' | 'ledger';
  motifLabel: string;
  analyticalNote: string;
  svgArtwork?: string;
}

export const defaultArtDirection: ICMAArtDirection = {
  family: 'network',
  palette: {
    bg: '#14171d',
    bgAccent: '#0a0c10',
    border: 'rgba(216, 186, 130, 0.32)',
    rule: 'rgba(216, 186, 130, 0.18)',
    accent: '#d8ba82',
    accentBright: '#f3cf88',
    paper: '#faf5ea',
    muted: 'rgba(250, 245, 234, 0.72)'
  },
  texture: 'laid',
  motifLabel: 'Archival Isnād-cum-Matn Analysis',
  analyticalNote: 'Applies historical-critical transmission analysis correlating isnād pathways with textual matn variations.',
  svgArtwork: ''
};

export const icmaArtDirections: Record<string, ICMAArtDirection> = {
  // 01 · Damascus Minaret Hadith
  "2-white-minaret-hadith-jesus-damascus": {
    family: "geography",
    palette: {
      bg: "#0e1624",
      bgAccent: "#070c14",
      border: "rgba(215, 185, 130, 0.32)",
      rule: "rgba(215, 185, 130, 0.18)",
      accent: "#d4b26f",
      accentBright: "#f5d998",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "vellum",
    motifLabel: "Sacred Geography · Syrian Regional Isnād Axis",
    analyticalNote: "Correlates regional Syrian isnād variants through Nuʿaym b. Ḥammād with the Umayyad architectural chronology of the Damascus Great Mosque’s eastern minaret."
  },

  // 02 · Second Fitna Mahdi Hadith
  "3-origins-mahdi-hadith-ibn-al-zubayr": {
    family: "chronology",
    palette: {
      bg: "#340d16",
      bgAccent: "#1a050a",
      border: "rgba(223, 190, 125, 0.35)",
      rule: "rgba(223, 190, 125, 0.2)",
      accent: "#dfb873",
      accentBright: "#f7d596",
      paper: "#faf5eb",
      muted: "rgba(250, 245, 235, 0.74)"
    },
    texture: "morocco",
    motifLabel: "Chronological Stratification · 2nd Fitna Terminus",
    analyticalNote: "Isolates the Meccan sanctuary traditions (refuge-seeker, army swallowed at al-Bayḍāʾ) as ex-post prophecies originating during the siege of 64 AH and Ibn al-Zubayr’s defeat in 73 AH."
  },

  // 03 · Bedouins Building Tall Buildings
  "6-bedouins-building-tall-buildings-prophecy": {
    family: "network",
    palette: {
      bg: "#13171f",
      bgAccent: "#090c10",
      border: "rgba(218, 188, 132, 0.3)",
      rule: "rgba(218, 188, 132, 0.18)",
      accent: "#d5b370",
      accentBright: "#f4d695",
      paper: "#f7f4ea",
      muted: "rgba(247, 244, 234, 0.72)"
    },
    texture: "laid",
    motifLabel: "Eschatological Transmission Network",
    analyticalNote: "Traces the Jibrīl hadith’s architectural clause across early Iraqi and Medinan branches, identifying al-Zuhrī and Abū Hurayrah lines as critical transmission convergence points."
  },

  // 04 · Call to Prayer Adhan Origin
  "9-call-to-prayer-adhan-dream-origin": {
    family: "variants",
    palette: {
      bg: "#121d15",
      bgAccent: "#08100b",
      border: "rgba(216, 186, 130, 0.32)",
      rule: "rgba(216, 186, 130, 0.18)",
      accent: "#cdb070",
      accentBright: "#edd092",
      paper: "#f6f4eb",
      muted: "rgba(246, 244, 235, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Matn Variants · Ritual Origin Narratives",
    analyticalNote: "Compares competing dream narratives (ʿAbd Allāh b. Zayd vs. ʿUmar b. al-Khaṭṭāb) to chart how liturgical practices were legitimized through retrospective narrative expansion."
  },

  // 05 · Slandering the Dead
  "11-slandering-the-dead-muammar-ibn-al-muthanna": {
    family: "legal",
    palette: {
      bg: "#241610",
      bgAccent: "#130a06",
      border: "rgba(220, 182, 130, 0.32)",
      rule: "rgba(220, 182, 130, 0.18)",
      accent: "#d2a762",
      accentBright: "#f5caa8",
      paper: "#faf5ec",
      muted: "rgba(250, 245, 236, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Juridical Transmission · Early Iraqi Corpus",
    analyticalNote: "Reconstructs early Baṣran isnād networks in the Muṣannaf of ʿAbd al-Razzāq to test the integrity of single-strand transmission claims before classical hadith canonization."
  },

  // 06 · Pen and Paper Incident
  "12-the-pen-and-paper-incident-calamity-of-thursday": {
    family: "polemics",
    palette: {
      bg: "#230e20",
      bgAccent: "#120611",
      border: "rgba(225, 195, 148, 0.32)",
      rule: "rgba(225, 195, 148, 0.18)",
      accent: "#deb682",
      accentBright: "#fadab0",
      paper: "#fcf7f1",
      muted: "rgba(252, 247, 241, 0.72)"
    },
    texture: "morocco",
    motifLabel: "Sectarian Redaction Strata · Thursday Report",
    analyticalNote: "Maps textual divergences across Ibn ʿAbbās variants regarding the Prophet’s final illness, disentangling early proto-Sunnī and Shīʿī theological polemics."
  },

  // 07 · Poisoning at Khaybar
  "13-the-prophet-poisoning-at-khaybar": {
    family: "chronology",
    palette: {
      bg: "#2b0f13",
      bgAccent: "#150608",
      border: "rgba(222, 185, 128, 0.32)",
      rule: "rgba(222, 185, 128, 0.18)",
      accent: "#dcb776",
      accentBright: "#f9d799",
      paper: "#faf4eb",
      muted: "rgba(250, 244, 235, 0.72)"
    },
    texture: "laid",
    motifLabel: "Historical Stratification · Maghāzī Chronology",
    analyticalNote: "Traces the talking-poisoned-mutton tradition across al-Zuhrī and Ibn Isḥāq to distinguish historical reminiscence from supernatural apologetic embellishments."
  },

  // 08 · First Revelation (Iqra)
  "14-the-first-revelation-iqra-khadija-waraqa": {
    family: "source-reconstruction",
    palette: {
      bg: "#0f1622",
      bgAccent: "#070c12",
      border: "rgba(223, 190, 125, 0.34)",
      rule: "rgba(223, 190, 125, 0.18)",
      accent: "#dfbe7d",
      accentBright: "#f7dc9d",
      paper: "#f9f6ef",
      muted: "rgba(249, 246, 239, 0.72)"
    },
    texture: "laid",
    motifLabel: "Source Reconstruction · al-Zuhrī Stratum",
    analyticalNote: "Reconstructs Ibn Shihāb al-Zuhrī’s composite narrative through parallel recensions of Maʿmar, ʿUqayl, and Yūnus, recovering the earliest identifiable narrative kernel."
  },

  // 09 · Hasanid Mahdi Fabrication
  "15-the-hasanid-mahdi-fabrication-asim-hafs": {
    family: "variants",
    palette: {
      bg: "#101e16",
      bgAccent: "#08100b",
      border: "rgba(216, 186, 130, 0.32)",
      rule: "rgba(216, 186, 130, 0.18)",
      accent: "#d5b06a",
      accentBright: "#f5d392",
      paper: "#f7f5ec",
      muted: "rgba(247, 245, 236, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Matn Variants · Kūfan Genealogical Interpolation",
    analyticalNote: "Demonstrates how the phrase 'from the sons of al-Ḥasan' was systematically interpolated into original Ḥusaynid and general Fāṭimid Mahdī traditions during ʿAbbāsid-era polemics."
  },

  // 10 · Three Consecutive Generations
  "16-three-consecutive-generations-best-generations": {
    family: "network",
    palette: {
      bg: "#101824",
      bgAccent: "#080d14",
      border: "rgba(215, 185, 130, 0.3)",
      rule: "rgba(215, 185, 130, 0.18)",
      accent: "#c8a865",
      accentBright: "#ebcd8e",
      paper: "#f8f5ed",
      muted: "rgba(248, 245, 237, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Transmission Network · Formulaic Isnād Chains",
    analyticalNote: "Analyzes isnād collapse and narrator harmonization in the 'best generation' traditions, isolating late 2nd-century canonizers who retrojected later theological periodization."
  },

  // 11 · Splitting of the Moon
  "17-splitting-of-the-moon-miracle-quran-54": {
    family: "source-reconstruction",
    palette: {
      bg: "#1f0f24",
      bgAccent: "#0f0612",
      border: "rgba(223, 188, 124, 0.32)",
      rule: "rgba(223, 188, 124, 0.18)",
      accent: "#dfba7a",
      accentBright: "#f8d89e",
      paper: "#faf5ef",
      muted: "rgba(250, 245, 239, 0.72)"
    },
    texture: "vellum",
    motifLabel: "Exegetical Source Strata · Sūrah 54 Analysis",
    analyticalNote: "Uncovers the historic transition from an eschatological reading of Q 54:1 ('the hour has drawn near') to a retrospective physical miracle narrative in late 1st-century traditions."
  },

  // 12 · Flight from the Leper
  "18-the-flight-from-the-leper-contagion": {
    family: "legal",
    palette: {
      bg: "#221711",
      bgAccent: "#120a07",
      border: "rgba(220, 180, 128, 0.32)",
      rule: "rgba(220, 180, 128, 0.18)",
      accent: "#cca45f",
      accentBright: "#edd090",
      paper: "#f9f6ee",
      muted: "rgba(249, 246, 238, 0.72)"
    },
    texture: "laid",
    motifLabel: "Legal Transmission · Theological Harmonization",
    analyticalNote: "Correlates contradictory prophetic pronouncements on contagion ('no contagion' vs. 'flee from the leper') with competing theological schools in early Baṣra and Medina."
  },

  // 13 · Dating the Stoning Penalty
  "19-dating-stoning-penalty-adultery-sunnah-quran": {
    family: "legal",
    palette: {
      bg: "#300d15",
      bgAccent: "#18050a",
      border: "rgba(224, 192, 134, 0.35)",
      rule: "rgba(224, 192, 134, 0.2)",
      accent: "#dfb873",
      accentBright: "#f7d697",
      paper: "#faf6ee",
      muted: "rgba(250, 246, 238, 0.74)"
    },
    texture: "morocco",
    motifLabel: "Juridical Evolution · Rajm Transmission Lines",
    analyticalNote: "Traces isnād bundles attributing the stoning penalty to ʿUmar and ʿAlī, demonstrating that procedural justifications arose to harmonize non-Qurʾanic practice with prophetic precedent."
  },

  // 14 · The Satanic Verses (Gharaniq)
  "20-the-satanic-verses-incident-gharaniq": {
    family: "source-reconstruction",
    palette: {
      bg: "#14151a",
      bgAccent: "#090a0d",
      border: "rgba(215, 185, 125, 0.3)",
      rule: "rgba(215, 185, 125, 0.18)",
      accent: "#d2ae6a",
      accentBright: "#f3d18e",
      paper: "#f8f4ec",
      muted: "rgba(248, 244, 236, 0.72)"
    },
    texture: "vellum",
    motifLabel: "Sīra Reconstruction · The Gharānīq Incident",
    analyticalNote: "Demonstrates that the Gharānīq story was universally attested across all early Sīra authorities (ʿUrwah, al-Zuhrī, Qatādah, Ibn Isḥāq) before its theological suppression in later dogma."
  },

  // 15 · Whoever Changes His Religion
  "21-whoever-changes-his-religion-kill-him-apostasy": {
    family: "legal",
    palette: {
      bg: "#261015",
      bgAccent: "#13060a",
      border: "rgba(222, 185, 130, 0.32)",
      rule: "rgba(222, 185, 130, 0.18)",
      accent: "#deb570",
      accentBright: "#fad896",
      paper: "#fbf7f0",
      muted: "rgba(251, 247, 240, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Penal Jurisprudence · Riddah Transmission",
    analyticalNote: "Examines the single-strand bottleneck through ʿIkrimah from Ibn ʿAbbās, contrasting early contextual apostasy-in-warfare traditions with absolute legal mandates."
  },

  // 16 · Urwa b. al-Zubayr Maghazi
  "22-urwa-ibn-al-zubayr-maghazi-source-reconstruction": {
    family: "source-reconstruction",
    palette: {
      bg: "#0e1a14",
      bgAccent: "#070e0a",
      border: "rgba(218, 188, 128, 0.32)",
      rule: "rgba(218, 188, 128, 0.18)",
      accent: "#cfae6b",
      accentBright: "#eed08f",
      paper: "#f6f4ec",
      muted: "rgba(246, 244, 236, 0.72)"
    },
    texture: "laid",
    motifLabel: "1st-Century Maghāzī Source Reconstruction",
    analyticalNote: "Reconstructs ʿUrwah b. al-Zubayr’s letters to the Umayyad caliph ʿAbd al-Malik, demonstrating the presence of written 1st-century historical narratives beneath later compilations."
  },

  // 17 · Surraq Debtors Tradition
  "23-surraq-debtors-tradition-late-attestation": {
    family: "chronology",
    palette: {
      bg: "#0f1922",
      bgAccent: "#070d12",
      border: "rgba(216, 185, 130, 0.32)",
      rule: "rgba(216, 185, 130, 0.18)",
      accent: "#d7b370",
      accentBright: "#f5d494",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Chronological Evaluation · Late Attestation",
    analyticalNote: "Applies Harald Motzki’s critique of the argument from silence, demonstrating that late appearance in extant collections does not inherently establish late fabrication."
  },

  // 18 · Fitna & Tribulations
  "24-fitna-tribulations-traditions-second-century": {
    family: "chronology",
    palette: {
      bg: "#2f0c15",
      bgAccent: "#17050a",
      border: "rgba(223, 190, 125, 0.35)",
      rule: "rgba(223, 190, 125, 0.2)",
      accent: "#dbae66",
      accentBright: "#f9d08e",
      paper: "#faf6ef",
      muted: "rgba(250, 246, 239, 0.74)"
    },
    texture: "morocco",
    motifLabel: "Apocalyptic Stratification · Fitnah Literature",
    analyticalNote: "Disentangles chronological layers of civil-war apocalyptic literature, showing how predictions were repeatedly revised forward following each successive crisis."
  },

  // 19 · Siege of Baghdad Hadith
  "25-siege-of-baghdad-mongol-invasion-fabrication": {
    family: "polemics",
    palette: {
      bg: "#14161a",
      bgAccent: "#0a0b0d",
      border: "rgba(216, 185, 128, 0.3)",
      rule: "rgba(216, 185, 128, 0.18)",
      accent: "#d4b16e",
      accentBright: "#f3d292",
      paper: "#f7f5ed",
      muted: "rgba(247, 245, 237, 0.72)"
    },
    texture: "laid",
    motifLabel: "Anachronism Analysis · Medieval Retrocognition",
    analyticalNote: "Isolates blatant anachronisms in hadiths predicting the 1258 CE Mongol sack of Baghdad, establishing late transmission origins despite chains fabricated to look early."
  },

  // 20 · Seven Ahruf Variants
  "26-the-seven-ahruf-variant-readings-tradition": {
    family: "variants",
    palette: {
      bg: "#200e22",
      bgAccent: "#100611",
      border: "rgba(225, 195, 145, 0.32)",
      rule: "rgba(225, 195, 145, 0.18)",
      accent: "#ddb779",
      accentBright: "#fad69c",
      paper: "#faf6f0",
      muted: "rgba(250, 246, 240, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Codex & Matn Variants · The Aḥruf Traditions",
    analyticalNote: "Maps the isnād convergence around Ubayy b. Kaʿb and ʿUmar, explaining how variant textual readings of the Qurʾān were normalized through retrospective theological formulas."
  },

  // 21 · Fire from Hijaz Prophecy
  "27-fire-from-hijaz-eruption-of-641-prophecy": {
    family: "chronology",
    palette: {
      bg: "#29130e",
      bgAccent: "#140806",
      border: "rgba(224, 186, 130, 0.32)",
      rule: "rgba(224, 186, 130, 0.18)",
      accent: "#e0b772",
      accentBright: "#fbd896",
      paper: "#faf4eb",
      muted: "rgba(250, 244, 235, 0.72)"
    },
    texture: "vellum",
    motifLabel: "Volcanic Chronicle · Provenance Stratification",
    analyticalNote: "Traces reports of the Medina volcanic eruption (654 AH / 1256 CE) retrojected into classical collections, distinguishing genuine early strata from post-event accretions."
  },

  // 22 · Return to Green Arabia
  "28-return-to-green-arabia-ecological-eschatology": {
    family: "geography",
    palette: {
      bg: "#0c1a13",
      bgAccent: "#060d09",
      border: "rgba(215, 185, 125, 0.32)",
      rule: "rgba(215, 185, 125, 0.18)",
      accent: "#d1af69",
      accentBright: "#f2d18d",
      paper: "#f6f4eb",
      muted: "rgba(246, 244, 235, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Ecological Eschatology · Transmission Provenance",
    analyticalNote: "Analyzes the transmission of prophetic ecological descriptions of Arabia through Baṣran and Syrian branches, evaluating historical regional climate memories."
  },

  // 23 · Conquest of Constantinople
  "29-the-conquest-of-constantinople-hadith": {
    family: "geography",
    palette: {
      bg: "#0d1723",
      bgAccent: "#060b11",
      border: "rgba(218, 188, 132, 0.32)",
      rule: "rgba(218, 188, 132, 0.18)",
      accent: "#cbb071",
      accentBright: "#edd395",
      paper: "#f7f5ed",
      muted: "rgba(247, 245, 237, 0.72)"
    },
    texture: "laid",
    motifLabel: "Byzantine Frontier · Military Oracles",
    analyticalNote: "Tracks the emergence of maritime jihad and siege prophecies during the Umayyad campaigns against Constantinople, correlating isnād common links with expedition leadership."
  },

  // 24 · Abu Hanifa False Attributions
  "30-abu-hanifa-false-attributions-fiqh-origins": {
    family: "legal",
    palette: {
      bg: "#23140e",
      bgAccent: "#120906",
      border: "rgba(222, 185, 128, 0.32)",
      rule: "rgba(222, 185, 128, 0.18)",
      accent: "#dcb36d",
      accentBright: "#f9d592",
      paper: "#faf5ed",
      muted: "rgba(250, 245, 237, 0.72)"
    },
    texture: "morocco",
    motifLabel: "Kūfan Jurisprudence · Attribution Strata",
    analyticalNote: "Tests the transmission integrity of early Ḥanafī legal opinions, demonstrating how students like Abū Yūsuf and al-Shaybānī formalized disparate verbal rulings into authoritative corpora."
  },

  // 25 · Women Deficient in Intellect
  "31-women-deficient-in-intellect-and-religion": {
    family: "variants",
    palette: {
      bg: "#2c0c14",
      bgAccent: "#160509",
      border: "rgba(224, 192, 134, 0.35)",
      rule: "rgba(224, 192, 134, 0.2)",
      accent: "#dfb975",
      accentBright: "#f8d89a",
      paper: "#fbf7f0",
      muted: "rgba(251, 247, 240, 0.74)"
    },
    texture: "ledger",
    motifLabel: "Matn Variants · Legal Accretion & Eid Sermon",
    analyticalNote: "Maps the isnād bundle originating in ʿAbd Allāh b. ʿUmar and Abū Saʿīd al-Khudrī, charting the evolution of a general ethical admonition into a standardized legal disqualifier."
  },

  // 26 · Black Banners of Khurasan
  "32-the-black-banners-of-khurasan-abbasid-propaganda": {
    family: "polemics",
    palette: {
      bg: "#0e1117",
      bgAccent: "#06070a",
      border: "rgba(215, 185, 125, 0.3)",
      rule: "rgba(215, 185, 125, 0.18)",
      accent: "#caa764",
      accentBright: "#ebcb88",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "laid",
    motifLabel: "Dynastic Apologetics · ʿAbbāsid Revolution",
    analyticalNote: "Isolates the revolutionary propaganda circulated by the Hāshimiyyah daʿwah in Khurāsān, dating the creation of black banner traditions precisely to the 120s–130s AH."
  },

  // 27 · Dajjal and the Donkey
  "33-dajjal-and-the-donkey-eschatological-variants": {
    family: "variants",
    palette: {
      bg: "#1d0f21",
      bgAccent: "#0e0610",
      border: "rgba(222, 188, 128, 0.32)",
      rule: "rgba(222, 188, 128, 0.18)",
      accent: "#d5b272",
      accentBright: "#f5d496",
      paper: "#faf5ef",
      muted: "rgba(250, 245, 239, 0.72)"
    },
    texture: "vellum",
    motifLabel: "Eschatological Imagery · Folktale Accretion",
    analyticalNote: "Traces grotesque eschatological motifs through regional Iraqi transmitters, showing how popular storytelling (quṣṣāṣ) enriched sparse biblical parallels over multiple generations."
  }
};
