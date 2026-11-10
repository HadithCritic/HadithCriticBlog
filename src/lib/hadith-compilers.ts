/**
 * Who compiled each collection, where they worked, and which engraved
 * medallion stands for them on the library cards. Read at build time only.
 *
 * The region keys pick a color pair from src/styles/hadith-library.css and
 * follow the compiler's main place of work, not their birthplace. Medallions
 * are interpretive engravings, not likenesses; a compiler without one gets an
 * empty ring. Death dates stay in COMPILER_DATES (collection-catalogue.ts).
 */

export type CompilerRegion =
  | 'medina' | 'mecca' | 'basra' | 'kufa' | 'wasit' | 'baghdad' | 'jibal' | 'merv'
  | 'nishapur' | 'bukhara' | 'damascus' | 'jazira' | 'palestine' | 'egypt' | 'yemen'
  | 'maghrib' | 'andalus';

export interface Compiler {
  name: string;
  origin: string;
  region: CompilerRegion;
  /** Person stem; the file is /images/hadith/medallions/<stem>-medallion.webp, when one exists. */
  medallion?: string;
}

const MALIK: Compiler = { name: 'Mālik ibn Anas', origin: 'Medina', region: 'medina', medallion: 'malik' };
const ABU_DAWUD: Compiler = { name: 'Abū Dāwūd al-Sijistānī', origin: 'Basra', region: 'basra', medallion: 'abu-dawud' };
const TIRMIDHI: Compiler = { name: 'Muḥammad ibn ʿĪsā al-Tirmidhī', origin: 'Tirmidh (Transoxiana)', region: 'bukhara', medallion: 'tirmidhi' };
const NASAI: Compiler = { name: 'Aḥmad ibn Shuʿayb al-Nasāʾī', origin: 'Nasa (Khurasan)', region: 'nishapur', medallion: 'nasai' };
const TAHAWI: Compiler = { name: 'Abū Jaʿfar al-Ṭaḥāwī', origin: 'Egypt', region: 'egypt', medallion: 'tahawi' };
const IBN_AL_JARUD: Compiler = { name: 'Ibn al-Jārūd', origin: 'Nishapur', region: 'nishapur', medallion: 'ibn-al-jarud' };
const IBN_WAHB: Compiler = { name: 'ʿAbd Allāh ibn Wahb', origin: 'Egypt', region: 'egypt', medallion: 'ibn-wahb' };
const LAYTH: Compiler = { name: 'al-Layth ibn Saʿd', origin: 'Egypt', region: 'egypt', medallion: 'al-layth-ibn-sad' };
const ABU_HANIFA_SCHOOL_KUFA = { origin: 'Kufa', region: 'kufa' } as const;
const TABARANI: Compiler = { name: 'Sulaymān ibn Aḥmad al-Ṭabarānī', origin: 'Isfahan', region: 'jibal', medallion: 'tabarani' };

export const COMPILERS: Record<string, Compiler> = {
  'musnad-abu-hanifa': { name: 'Abū Ḥanīfa al-Nuʿmān ibn Thābit', origin: 'Kufa', region: 'kufa', medallion: 'abu-hanifa', via: 'riwāyat al-Ḥaṣkafī' },
  'musnad-abd-allah-ibn-al-mubarak': { name: 'ʿAbd Allāh ibn al-Mubārak', origin: 'Merv', region: 'merv', medallion: 'ibn-al-mubarak' },
  // Local reader editions. Regions follow where each compiler is from and worked; portraits are added later.
  'jami-mamar-ibn-rashid': { name: 'Maʿmar ibn Rāshid', origin: 'Sanaa (Yemen)', region: 'yemen', medallion: 'mamar-ibn-rashid' },
  'al-marasil-abi-dawud': { ...ABU_DAWUD, medallion: 'abu-dawud-marasil' },
  'al-jami-ibn-wahb': IBN_WAHB,
  'al-muntaqa-ibn-al-jarud': IBN_AL_JARUD,
  'al-athar-abu-yusuf': { name: 'Abū Yūsuf Yaʿqūb ibn Ibrāhīm', ...ABU_HANIFA_SCHOOL_KUFA, medallion: 'abu-yusuf' },
  'al-athar-al-shaybani': { name: 'Muḥammad ibn al-Ḥasan al-Shaybānī', ...ABU_HANIFA_SCHOOL_KUFA, medallion: 'al-shaybani' },
  // 2nd century (101-200 AH) reader editions. Ibn Wahb reuses his existing medallion; the Thawrī medallion also stands for the al-Sarī transmission of al-Thawrī.
  'kitab-al-qadar-ibn-wahb': { ...IBN_WAHB, via: 'with supplements by al-Warrāq' },
  'muwatta-ibn-wahb-muharaba': { ...IBN_WAHB, via: 'recension of Yūnus ibn ʿAbd al-Aʿlā' },
  'muwatta-ibn-wahb-qada-buyu': { ...IBN_WAHB, via: 'recension of Saḥnūn ibn Saʿīd' },
  'al-dua-ibn-fudayl': { name: 'Muḥammad ibn Fuḍayl al-Ḍabbī', origin: 'Kufa', region: 'kufa', medallion: 'ibn-fudayl' },
  'mashyakhat-ibn-tahman': { name: 'Ibrāhīm ibn Ṭahmān', origin: 'Herat and Nishapur (Khurasan)', region: 'nishapur', medallion: 'ibn-tahman' },
  'hadith-sufyan-al-thawri': { name: 'Sufyān ibn Saʿīd al-Thawrī', origin: 'Kufa', region: 'kufa', medallion: 'sufyan-al-thawri', via: 'transmitted by al-Sarī ibn Yaḥyā and al-Firyābī' },
  'ahadith-al-sari-an-al-thawri': { name: 'al-Sarī ibn Yaḥyā', origin: 'Basra', region: 'basra', medallion: 'sufyan-al-thawri', via: 'collects the ḥadīth of Sufyān al-Thawrī' },
  'ahadith-muntakhaba-maghazi-musa-ibn-uqba': { name: 'Mūsā ibn ʿUqba', origin: 'Medina', region: 'medina', medallion: 'musa-ibn-uqba' },
  'nuskhat-waki-an-al-amash': { name: 'Wakīʿ ibn al-Jarrāḥ', origin: 'Kufa', region: 'kufa', medallion: 'waki' },
  'juz-sufyan-ibn-uyayna': { name: 'Sufyān ibn ʿUyayna', origin: 'Mecca', region: 'mecca', medallion: 'ibn-uyayna', via: 'transmitted by Zakariyyā al-Marwazī' },
  'hadith-mujaa-ibn-al-zubayr': { name: 'Mujāʿa ibn al-Zubayr', origin: 'Basra', region: 'basra', medallion: 'mujaa-ibn-al-zubayr' },
  'kitab-al-hajj-al-majishun': { name: 'ʿAbd al-ʿAzīz ibn al-Mājishūn', origin: 'Medina', region: 'medina', medallion: 'ibn-al-majishun' },
  'nuskhat-al-zubayr-ibn-adi': { name: 'al-Zubayr ibn ʿAdī', origin: 'Kufa', region: 'kufa', medallion: 'al-zubayr-ibn-adi' },
  'ahadith-yazid-ibn-abi-habib': { name: 'Yazīd ibn Abī Ḥabīb', origin: 'Egypt', region: 'egypt', medallion: 'yazid-ibn-abi-habib', via: 'through al-Layth ibn Saʿd' },
  'nuskhat-ibrahim-ibn-sad': { name: 'Ibrāhīm ibn Saʿd', origin: 'Medina', region: 'medina', medallion: 'ibrahim-ibn-sad', via: 'transmitted by Abū Ṣāliḥ, scribe of al-Layth' },
  'ashara-ahadith-al-layth-ibn-sad': LAYTH,
  'majlis-fawaid-al-layth-ibn-sad': LAYTH,
  'fada-il-makka': { name: 'Attributed to al-Ḥasan al-Baṣrī', origin: 'Basra', region: 'basra', medallion: 'hasan-al-basri' },
  'sahifat-hammam-ibn-munabbih': { name: 'Hammām ibn Munabbih', origin: 'Sanaa', region: 'yemen', medallion: 'hammam-ibn-munabbih' },
  'musnad-sad-ibn-abi-waqqas': { name: 'Aḥmad ibn Ibrāhīm al-Dawraqī', origin: 'Basra', region: 'basra', medallion: 'sad-ibn-abi-waqqas' },
  'muwatta-malik': MALIK,
  'musnad-al-tayalisi': { name: 'Abū Dāwūd al-Ṭayālisī', origin: 'Basra', region: 'basra', medallion: 'tayalisi' },
  'musannaf-abd-al-razzaq': { name: 'ʿAbd al-Razzāq al-Ṣanʿānī', origin: 'Sanaa (Yemen)', region: 'yemen', medallion: 'abd-al-razzaq' },
  'musnad-al-humaydi': { name: 'ʿAbd Allāh ibn al-Zubayr al-Ḥumaydī', origin: 'Mecca', region: 'mecca', medallion: 'humaydi' },
  'sunan-sa-id-ibn-mansur': { name: 'Saʿīd ibn Manṣūr', origin: 'Mecca', region: 'mecca', medallion: 'said-ibn-mansur' },
  'musannaf-ibn-abi-shaybah': { name: 'Abū Bakr ibn Abī Shayba', origin: 'Kufa', region: 'kufa', medallion: 'ibn-abi-shaybah' },
  'musnad-ahmad': { name: 'Aḥmad ibn Ḥanbal', origin: 'Baghdad', region: 'baghdad', medallion: 'ahmad-ibn-hanbal' },
  'musnad-abd-ibn-humayd': { name: 'ʿAbd ibn Ḥumayd', origin: 'Kish (Transoxiana)', region: 'bukhara', medallion: 'abd-ibn-humayd' },
  'musnad-al-darimi': { name: 'ʿAbd Allāh ibn ʿAbd al-Raḥmān al-Dārimī', origin: 'Samarqand', region: 'bukhara', medallion: 'darimi' },
  'musnad-khalifa-ibn-khayyat': { name: 'Khalīfa ibn Khayyāṭ', origin: 'Basra', region: 'basra', medallion: 'khalifa-ibn-khayyat' },
  'sahih-al-bukhari': { name: 'Muḥammad ibn Ismāʿīl al-Bukhārī', origin: 'Bukhara', region: 'bukhara', medallion: 'bukhari' },
  'sahih-muslim': { name: 'Muslim ibn al-Ḥajjāj al-Naysābūrī', origin: 'Nishapur', region: 'nishapur', medallion: 'muslim' },
  'sunan-ibn-majah': { name: 'Ibn Mājah al-Qazwīnī', origin: 'Qazwin', region: 'jibal', medallion: 'ibn-majah' },
  'sunan-abi-dawud': ABU_DAWUD,
  'al-marasil-li-abi-dawud': ABU_DAWUD,
  'jami-al-tirmidhi': TIRMIDHI,
  'al-shama-il-al-muhammadiyah': TIRMIDHI,
  'musnad-al-bazzar': { name: 'Abū Bakr al-Bazzār', origin: 'Basra', region: 'basra', medallion: 'bazzar' },
  'sunan-al-nasa-i': NASAI,
  'al-sunan-al-kubra': NASAI,
  'al-muntaqa': IBN_AL_JARUD,
  'musnad-abi-ya-la-al-mawsili': { name: 'Abū Yaʿlā al-Mawṣilī', origin: 'Mosul', region: 'jazira', medallion: 'abu-yala' },
  'sahih-ibn-khuzaymah': { name: 'Ibn Khuzayma', origin: 'Nishapur', region: 'nishapur', medallion: 'ibn-khuzayma' },
  'sharh-ma-ani-al-athar': TAHAWI,
  'sharh-mushkil-al-athar': TAHAWI,
  'sahih-ibn-hibban': { name: 'Ibn Ḥibbān al-Bustī', origin: 'Bust (Sijistān)', region: 'nishapur', medallion: 'ibn-hibban' },
  'al-mu-jam-al-kabir': TABARANI,
  'al-mu-jam-al-awsat': TABARANI,
  'al-mu-jam-al-saghir': TABARANI,
  'sunan-al-daraqutni': { name: 'ʿAlī ibn ʿUmar al-Dāraquṭnī', origin: 'Baghdad', region: 'baghdad', medallion: 'daraqutni' },
  'al-mustadrak-ala-al-sahihayn': { name: 'al-Ḥākim al-Naysābūrī', origin: 'Nishapur', region: 'nishapur', medallion: 'hakim' },
  'sunan-al-bayhaqi-al-kubra': { name: 'Aḥmad ibn al-Ḥusayn al-Bayhaqī', origin: 'Nishapur', region: 'nishapur', medallion: 'bayhaqi' },
  'al-ahadith-al-mukhtarah': { name: 'Ḍiyāʾ al-Dīn al-Maqdisī', origin: 'Damascus', region: 'damascus', medallion: 'maqdisi' },
  'al-matalib-al-aliyah': { name: 'Ibn Ḥajar al-ʿAsqalānī', origin: 'Cairo', region: 'egypt', medallion: 'ibn-hajar' },
};

/** The Six Books, numbered on their cards in this order. */
export const SIX_BOOKS = ['sahih-al-bukhari', 'sahih-muslim', 'sunan-abi-dawud', 'jami-al-tirmidhi', 'sunan-al-nasa-i', 'sunan-ibn-majah'] as const;

export function compilerFor(slug: string): Compiler | undefined {
  return COMPILERS[slug];
}
