/**
 * ICMA Archive Art Directions & Visual Profiles
 * Refined, minimalist scholarly archive system focusing on authentic
 * bookbinding textures and restrained, deep academic color palettes.
 * Tailored for all 27 ICMA monograph investigations in the archive.
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
      bg: "#2b0d15",
      bgAccent: "#15050a",
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
  "5-debunking-the-hadith-prophecy-of-bedouins-building-tall-buildings": {
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

  // 04 · The First Revelation Story
  "8-the-first-revelation-story-a-zubayrid-call-narrative": {
    family: "source-reconstruction",
    palette: {
      bg: "#191512",
      bgAccent: "#0c0a09",
      border: "rgba(216, 186, 130, 0.32)",
      rule: "rgba(216, 186, 130, 0.18)",
      accent: "#d8ba82",
      accentBright: "#f3cf88",
      paper: "#faf5ea",
      muted: "rgba(250, 245, 234, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Biographical Source Reconstruction",
    analyticalNote: "Deconstructs the ʿUrwa-al-Zuhrī narrative of the cave of Ḥirāʾ, demonstrating how family memory and Zubayrid political interests shaped early prophetic biographies."
  },

  // 05 · The Hasanid Mahdi
  "15-the-hasanid-mahdi-a-mahdi-fabricated-by-asim-teacher-of-quran-reciter-hafs": {
    family: "polemics",
    palette: {
      bg: "#1c1214",
      bgAccent: "#0e080a",
      border: "rgba(224, 185, 135, 0.32)",
      rule: "rgba(224, 185, 135, 0.18)",
      accent: "#dfb776",
      accentBright: "#f8d598",
      paper: "#faf5ec",
      muted: "rgba(250, 245, 236, 0.72)"
    },
    texture: "morocco",
    motifLabel: "Dynastic Polemics · Kufan Transmission",
    analyticalNote: "Identifies ʿĀṣim b. Bahdalah as the common link responsible for interpolating the patronymic «whose father’s name matches my father’s name» to legitimize Muḥammad al-Nafs al-Zakiyyah."
  },

  // 06 · The Kaysanite Mahdi
  "16-the-kaysanite-mahdi-the-obscure-3rd-son-of-ali": {
    family: "polemics",
    palette: {
      bg: "#16121f",
      bgAccent: "#0a0812",
      border: "rgba(218, 188, 140, 0.32)",
      rule: "rgba(218, 188, 140, 0.18)",
      accent: "#d7b475",
      accentBright: "#f5d697",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Proto-Shiʿi Eschatology · Kufan Stratum",
    analyticalNote: "Traces traditions identifying Ibn al-Ḥanafiyyah as Mahdī to Abū al-Ṭufayl and early Kaysānite partisans reacting to the aftermath of Karbalāʾ and al-Mukhtār’s rebellion."
  },

  // 07 · The Bewitched Prophet Report
  "21-hadith-the-prophet-was-bewitched-by-a-jew": {
    family: "variants",
    palette: {
      bg: "#151b18",
      bgAccent: "#0a0e0c",
      border: "rgba(215, 190, 135, 0.32)",
      rule: "rgba(215, 190, 135, 0.18)",
      accent: "#d4b574",
      accentBright: "#f3d796",
      paper: "#f7f5ec",
      muted: "rgba(247, 245, 236, 0.72)"
    },
    texture: "laid",
    motifLabel: "Textual Matn Discrepancy · Epistemic Tension",
    analyticalNote: "Maps the divergent transmission lines through Hishām b. ʿUrwa across Iraqi and Medinan students, isolating theological contamination and folklorization."
  },

  // 08 · The Abbasid Mahdi & Black Banners
  "22-the-abbasid-mahdi-the-black-banners-abu-abbas-al-saffah": {
    family: "polemics",
    palette: {
      bg: "#111215",
      bgAccent: "#08080a",
      border: "rgba(220, 185, 125, 0.35)",
      rule: "rgba(220, 185, 125, 0.2)",
      accent: "#dbb672",
      accentBright: "#f6d695",
      paper: "#f9f6ed",
      muted: "rgba(249, 246, 237, 0.74)"
    },
    texture: "morocco",
    motifLabel: "Revolutionary Propaganda · Khurasani Millenarianism",
    analyticalNote: "Identifies pro-Abbasid dāʿī transmission networks fabricating black-banner eschatology to underwrite the overthrow of the Umayyad caliphate in 132 AH."
  },

  // 09 · The Fire from Hijaz
  "24-fabricated-hadith-prophecy-the-fire-from-hijaz-the-eruption-of-641-ad": {
    family: "chronology",
    palette: {
      bg: "#25110d",
      bgAccent: "#120705",
      border: "rgba(228, 185, 120, 0.35)",
      rule: "rgba(228, 185, 120, 0.2)",
      accent: "#e0b870",
      accentBright: "#f9d892",
      paper: "#faf5eb",
      muted: "rgba(250, 245, 235, 0.74)"
    },
    texture: "vellum",
    motifLabel: "Event-Dating Terminus · Volcanic Memory",
    analyticalNote: "Correlates the Busra-camel-neck illumination motif with historical volcanic eruptions in the Ḥarrat Rahat field, tracing the transmission hub to al-Zuhrī."
  },

  // 10 · The Siege of Baghdad & Banu Qantura
  "25-fabricated-hadith-prophecy-the-siege-of-baghdad": {
    family: "geography",
    palette: {
      bg: "#18151f",
      bgAccent: "#0b0a10",
      border: "rgba(218, 188, 138, 0.32)",
      rule: "rgba(218, 188, 138, 0.18)",
      accent: "#d7b373",
      accentBright: "#f6d595",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Basran Frontier Anxieties · Central Asian Threats",
    analyticalNote: "Examines Saʿīd b. Jumhān’s transmission bottleneck in Baṣra, demonstrating how 8th-century Türgesh and Khazar military conflicts were cast as end-times prophecies."
  },

  // 11 · Return to Green Arabia
  "27-fabricated-hadith-prophecy-return-to-green-arabia": {
    family: "chronology",
    palette: {
      bg: "#111b15",
      bgAccent: "#070d0a",
      border: "rgba(215, 192, 135, 0.32)",
      rule: "rgba(215, 192, 135, 0.18)",
      accent: "#d3b674",
      accentBright: "#f2d897",
      paper: "#f7f6ec",
      muted: "rgba(247, 246, 236, 0.72)"
    },
    texture: "laid",
    motifLabel: "Umayyad Agricultural Stratum · Ecological Eschatology",
    analyticalNote: "Contextualizes the tradition within Umayyad canalization and oasis estates in the Ḥijāz, pinpointing Suhayl b. Abī Ṣāliḥ as the single transmitting bottleneck."
  },

  // 12 · The Killing of Umar and the Afflictions
  "28-fabricated-hadith-prophecy-the-killing-of-umar-the-afflictions": {
    family: "polemics",
    palette: {
      bg: "#201217",
      bgAccent: "#0f080b",
      border: "rgba(224, 186, 132, 0.32)",
      rule: "rgba(224, 186, 132, 0.18)",
      accent: "#dfb774",
      accentBright: "#f8d596",
      paper: "#faf5eb",
      muted: "rgba(250, 245, 235, 0.72)"
    },
    texture: "morocco",
    motifLabel: "Kufan Fitna Memory · Closed-Door Allegory",
    analyticalNote: "Traces the isnād branches converging on al-Aʿmash in Kūfa, demonstrating how the traumatic memory of the First Fitna was retrojected as a prophecy of ʿUmar’s death."
  },

  // 13 · The Return of Dhu al-Khalasa
  "29-fabricated-prophecy-the-prophecied-return-of-dhul-khalasa": {
    family: "geography",
    palette: {
      bg: "#1a1713",
      bgAccent: "#0d0b09",
      border: "rgba(218, 186, 130, 0.32)",
      rule: "rgba(218, 186, 130, 0.18)",
      accent: "#d8ba82",
      accentBright: "#f4cf88",
      paper: "#f9f5ea",
      muted: "rgba(249, 245, 234, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Shrine Politics · South Arabian Tribal Rivalries",
    analyticalNote: "Analyzes the anti-Daws polemical strand in Medinan hadith, demonstrating how residual pagan sanctuary memories were deployed against Yamānī tribal influence."
  },

  // 14 · The Six Signs of the Hour
  "32-fabricated-hadith-prophecy-hold-on-to-these-6-things-that-will-occur-in-the-future": {
    family: "chronology",
    palette: {
      bg: "#141a24",
      bgAccent: "#090e15",
      border: "rgba(216, 188, 134, 0.32)",
      rule: "rgba(216, 188, 134, 0.18)",
      accent: "#d5b472",
      accentBright: "#f4d695",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "vellum",
    motifLabel: "Syrian Military Matrix · Amwas Plague Terminus",
    analyticalNote: "Identifies the Syrian military lineage through ʿAwf b. Mālik as an ex-post compilation codifying the conquest of Jerusalem and the devastating Plague of ʿAmwās (18 AH)."
  },

  // 15 · The Thirty-Year Caliphate
  "33-fabricated-hadith-prophecy-the-thirty-year-reign": {
    family: "polemics",
    palette: {
      bg: "#241215",
      bgAccent: "#110709",
      border: "rgba(226, 186, 130, 0.34)",
      rule: "rgba(226, 186, 130, 0.18)",
      accent: "#deb673",
      accentBright: "#f7d595",
      paper: "#faf5eb",
      muted: "rgba(250, 245, 235, 0.74)"
    },
    texture: "morocco",
    motifLabel: "Dynastic Delegitimation · Anti-Umayyad Chronology",
    analyticalNote: "Exposes Saʿīd b. Jumhān’s sole-transmitter bottleneck from Safīnah, engineering an exact 30-year boundary to reclassify the Umayyad state from caliphate to illegitimate biting kingship."
  },

  // 16 · The Constantinople Prophecies
  "35-fabricated-hadith-prophecy-the-conquest-of-constantinople": {
    family: "geography",
    palette: {
      bg: "#101726",
      bgAccent: "#060b14",
      border: "rgba(215, 186, 132, 0.32)",
      rule: "rgba(215, 186, 132, 0.18)",
      accent: "#d4b26f",
      accentBright: "#f4d593",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "laid",
    motifLabel: "Imperial Jihad Ideology · Umayyad Fleet Campaigns",
    analyticalNote: "Dissects Syrian and Egyptian military isnāds manufactured during the caliphates of Muʿāwiyah and Sulaymān b. ʿAbd al-Malik to recruit soldiers for the massive maritime sieges."
  },

  // 17 · The Keeper of Secrets Myth
  "43-hudhayfah-ibn-al-yaman-the-false-story-of-the-keeper-of-secrets": {
    family: "source-reconstruction",
    palette: {
      bg: "#17161b",
      bgAccent: "#0a090e",
      border: "rgba(218, 188, 138, 0.32)",
      rule: "rgba(218, 188, 138, 0.18)",
      accent: "#d7b475",
      accentBright: "#f5d697",
      paper: "#f8f5ee",
      muted: "rgba(248, 245, 238, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Factional Weaponization · Secret Knowledge Topos",
    analyticalNote: "Reconstructs how Kūfan sectarian circles converted Ḥudhayfah into a keeper of esoteric rosters to cast suspicion upon prominent Companions and state officials."
  },

  // 18 · The Origin of Islamic Apostasy
  "45-the-origin-of-islamic-apostasy-the-slave-of-ibn-abbas": {
    family: "legal",
    palette: {
      bg: "#1c1512",
      bgAccent: "#0e0907",
      border: "rgba(224, 186, 130, 0.34)",
      rule: "rgba(224, 186, 130, 0.18)",
      accent: "#dfb772",
      accentBright: "#f8d594",
      paper: "#faf5eb",
      muted: "rgba(250, 245, 235, 0.74)"
    },
    texture: "ledger",
    motifLabel: "Juristic Capital Penalties · Kharijite Polemics",
    analyticalNote: "Demonstrates that the capital apostasy ruling originates entirely with ʿIkrimah mawlā Ibn ʿAbbās, conflicting with early Quranic evidence and parallel Medinan legal practice."
  },

  // 19 · Fabricating Against Husaynid Mourners
  "50-how-masruq-wrote-a-hadith-against-the-mourners-of-husayn": {
    family: "polemics",
    palette: {
      bg: "#250f14",
      bgAccent: "#120609",
      border: "rgba(225, 185, 128, 0.34)",
      rule: "rgba(225, 185, 128, 0.18)",
      accent: "#deb570",
      accentBright: "#f8d592",
      paper: "#faf5ea",
      muted: "rgba(250, 245, 234, 0.74)"
    },
    texture: "morocco",
    motifLabel: "State Suppression · Post-Karbala Political Laments",
    analyticalNote: "Pinpoints Masrūq b. al-Ajdaʿ in early Umayyad Kūfa formulating anti-mourning traditions to silence popular grief demonstrations following the massacre of al-Ḥusayn."
  },

  // 20 · The Ten Promised Paradise
  "55-the-myth-of-the-ten-promised-paradise-hadith": {
    family: "polemics",
    palette: {
      bg: "#18131d",
      bgAccent: "#0c0810",
      border: "rgba(220, 186, 135, 0.32)",
      rule: "rgba(220, 186, 135, 0.18)",
      accent: "#d9b574",
      accentBright: "#f6d696",
      paper: "#f9f5ee",
      muted: "rgba(249, 245, 238, 0.72)"
    },
    texture: "vellum",
    motifLabel: "Creedal Canonization · Kufan Anti-Alid Response",
    analyticalNote: "Traces the formation of the al-ʿAsharah al-Mubashsharah report across Ḥumayd b. ʿAbd al-Raḥmān’s cluster, revealing it as a second-century Sunni compromise formula."
  },

  // 21 · Whitewashing al-Zuhri
  "64-whitewashing-al-zuhri-and-why-it-fails": {
    family: "source-reconstruction",
    palette: {
      bg: "#18191d",
      bgAccent: "#0a0b0e",
      border: "rgba(216, 186, 130, 0.32)",
      rule: "rgba(216, 186, 130, 0.18)",
      accent: "#d8ba82",
      accentBright: "#f3cf88",
      paper: "#faf5ea",
      muted: "rgba(250, 245, 234, 0.72)"
    },
    texture: "buckram",
    motifLabel: "Court Bureaucracy · Dynastic Historiography",
    analyticalNote: "Examines al-Zuhrī’s direct stipends and editorial commissions under ʿAbd al-Malik and Hishām, testing where state patronage compromised his isnād attributions."
  },

  // 22 · The Judge’s Double Reward
  "69-how-the-legal-islamic-class-invented-their-own-divine-reward": {
    family: "legal",
    palette: {
      bg: "#191814",
      bgAccent: "#0b0a08",
      border: "rgba(218, 188, 134, 0.32)",
      rule: "rgba(218, 188, 134, 0.18)",
      accent: "#d6b472",
      accentBright: "#f4d594",
      paper: "#f8f5eb",
      muted: "rgba(248, 245, 235, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Juristic Guild Immunity · Professional Self-Protection",
    analyticalNote: "Deconstructs the transmission network behind the judicial indemnity hadith, showing how second-century qāḍīs secured spiritual protection for erroneous judicial rulings."
  },

  // 23 · The Baghdad Matrix Re-examined
  "72-more-on-the-fabricated-baghdad-hadith-prophecy": {
    family: "network",
    palette: {
      bg: "#12161e",
      bgAccent: "#080a0f",
      border: "rgba(216, 186, 132, 0.32)",
      rule: "rgba(216, 186, 132, 0.18)",
      accent: "#d5b370",
      accentBright: "#f4d492",
      paper: "#f7f4ea",
      muted: "rgba(247, 244, 234, 0.72)"
    },
    texture: "laid",
    motifLabel: "Transmission Network Topology · Iraqi Cross-Attribution",
    analyticalNote: "Presents formal isnād topological diagrams mapping the Baghdad city prophecies, isolating systematic chain-spreader interventions in third-century Baṣra and Kūfa."
  },

  // 24 · The Green Arabia Translation Shift
  "73-green-arabia-hadith-sunnah-com-translation-change-fabrication": {
    family: "variants",
    palette: {
      bg: "#111815",
      bgAccent: "#070b09",
      border: "rgba(215, 190, 135, 0.32)",
      rule: "rgba(215, 190, 135, 0.18)",
      accent: "#d3b573",
      accentBright: "#f2d795",
      paper: "#f7f5ec",
      muted: "rgba(247, 245, 236, 0.72)"
    },
    texture: "ledger",
    motifLabel: "Modern Redactional Shifts · Digital Miracle Industry",
    analyticalNote: "Traces the philological translation drift of «ḥattā taʿūda» from its classical meaning of cyclical pasture growth to a modern scientific-miracle claim of ancient lush climate."
  },

  // 25 · Faces Like Hammered Shields
  "77-faces-like-hammered-shields-the-turks-hadith-clusters": {
    family: "geography",
    palette: {
      bg: "#1b1416",
      bgAccent: "#0c0809",
      border: "rgba(222, 186, 132, 0.32)",
      rule: "rgba(222, 186, 132, 0.18)",
      accent: "#deb673",
      accentBright: "#f7d595",
      paper: "#faf5eb",
      muted: "rgba(250, 245, 235, 0.72)"
    },
    texture: "morocco",
    motifLabel: "Central Asian Front · Five Regional Bottlenecks",
    analyticalNote: "Isolates five distinct regional transmission bottlenecks across Baṣra, Kūfa, and Khurāsān, reflecting frontline traumatic encounters with Türgesh cavalry."
  },

  // 26 · The Scroll and the Sword
  "78-the-scroll-and-the-sword-the-polemical-use-of-alis-authority": {
    family: "polemics",
    palette: {
      bg: "#1d1314",
      bgAccent: "#0e0708",
      border: "rgba(224, 186, 130, 0.34)",
      rule: "rgba(224, 186, 130, 0.18)",
      accent: "#dfb772",
      accentBright: "#f8d594",
      paper: "#faf5eb",
      muted: "rgba(250, 245, 235, 0.74)"
    },
    texture: "buckram",
    motifLabel: "Proto-Sunni / Shiʿi Disputation · Written Document Topos",
    analyticalNote: "Demonstrates how rival legal schools claimed the contents of ʿAlī’s sword-sheath scroll to legitimize competing blood-money tariffs and non-Muslim wergild standards."
  },

  // 27 · The Kharijite and the Beast
  "80-the-kharijite-and-the-beast": {
    family: "legal",
    palette: {
      bg: "#1a1512",
      bgAccent: "#0d0907",
      border: "rgba(220, 186, 132, 0.32)",
      rule: "rgba(220, 186, 132, 0.18)",
      accent: "#dbb672",
      accentBright: "#f7d594",
      paper: "#f9f5eb",
      muted: "rgba(249, 245, 235, 0.72)"
    },
    texture: "laid",
    motifLabel: "Extreme Penal Codification · Ikrimah Bottleneck",
    analyticalNote: "Traces the severe ruling demanding the death of both human and animal back to ʿIkrimah, revealing early juristic resistance and its rejection by Imām al-Shāfiʿī."
  }
};
