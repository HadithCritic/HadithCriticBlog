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
  | 'medina' | 'mecca' | 'basra' | 'kufa' | 'baghdad' | 'jibal' | 'merv'
  | 'nishapur' | 'bukhara' | 'damascus' | 'jazira' | 'egypt' | 'yemen'
  | 'khurasan' | 'sijistan';

export interface Compiler {
  name: string;
  origin: string;
  region: CompilerRegion;
  /** File stem under /images/hadith/medallions/, when one exists. */
  medallion?: string;
}

const MALIK: Compiler = { name: 'Mālik ibn Anas', origin: 'Medina', region: 'medina', medallion: 'malik' };
const ABU_DAWUD: Compiler = { name: 'Abū Dāwūd al-Sijistānī', origin: 'Sijistān', region: 'sijistan', medallion: 'abu-dawud' };
const TIRMIDHI: Compiler = { name: 'Muḥammad ibn ʿĪsā al-Tirmidhī', origin: 'Tirmidh (Transoxiana)', region: 'bukhara', medallion: 'tirmidhi' };
const NASAI: Compiler = { name: 'Aḥmad ibn Shuʿayb al-Nasāʾī', origin: 'Nasa (Khurasan)', region: 'khurasan', medallion: 'nasai' };
const TAHAWI: Compiler = { name: 'Abū Jaʿfar al-Ṭaḥāwī', origin: 'Egypt', region: 'egypt', medallion: 'tahawi-cutout' };
const TABARANI: Compiler = { name: 'Sulaymān ibn Aḥmad al-Ṭabarānī', origin: 'Isfahan', region: 'jibal', medallion: 'tabarani' };

export const COMPILERS: Record<string, Compiler> = {
  'muwatta-malik': MALIK,
  'musnad-al-tayalisi': { name: 'Abū Dāwūd al-Ṭayālisī', origin: 'Basra', region: 'basra', medallion: 'tayalisi' },
  'musannaf-abd-al-razzaq': { name: 'ʿAbd al-Razzāq al-Ṣanʿānī', origin: 'Sanaa (Yemen)', region: 'yemen', medallion: 'abd-al-razzaq-cutout' },
  'musnad-al-humaydi': { name: 'ʿAbd Allāh ibn al-Zubayr al-Ḥumaydī', origin: 'Mecca', region: 'mecca', medallion: 'humaydi' },
  'sunan-sa-id-ibn-mansur': { name: 'Saʿīd ibn Manṣūr', origin: 'Mecca', region: 'mecca', medallion: 'said-ibn-mansur-cutout' },
  'musannaf-ibn-abi-shaybah': { name: 'Abū Bakr ibn Abī Shayba', origin: 'Kufa', region: 'kufa', medallion: 'ibn-abi-shaybah' },
  'musnad-ahmad': { name: 'Aḥmad ibn Ḥanbal', origin: 'Baghdad', region: 'baghdad', medallion: 'ahmad-ibn-hanbal' },
  'musnad-abd-ibn-humayd': { name: 'ʿAbd ibn Ḥumayd', origin: 'Kish (Transoxiana)', region: 'bukhara', medallion: 'abd-ibn-humayd' },
  'musnad-al-darimi': { name: 'ʿAbd Allāh ibn ʿAbd al-Raḥmān al-Dārimī', origin: 'Samarqand', region: 'bukhara', medallion: 'darimi' },
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
  'al-muntaqa': { name: 'Ibn al-Jārūd', origin: 'Nishapur', region: 'nishapur', medallion: 'ibn-al-jarud' },
  'musnad-abi-ya-la-al-mawsili': { name: 'Abū Yaʿlā al-Mawṣilī', origin: 'Mosul', region: 'jazira', medallion: 'abu-yala' },
  'sahih-ibn-khuzaymah': { name: 'Ibn Khuzayma', origin: 'Nishapur', region: 'nishapur', medallion: 'ibn-khuzayma' },
  'sharh-ma-ani-al-athar': TAHAWI,
  'sharh-mushkil-al-athar': TAHAWI,
  'sahih-ibn-hibban': { name: 'Ibn Ḥibbān al-Bustī', origin: 'Bust (Sijistān)', region: 'sijistan', medallion: 'ibn-hibban-cutout' },
  'al-mu-jam-al-kabir': TABARANI,
  'al-mu-jam-al-awsat': TABARANI,
  'al-mu-jam-al-saghir': TABARANI,
  'sunan-al-daraqutni': { name: 'ʿAlī ibn ʿUmar al-Dāraquṭnī', origin: 'Baghdad', region: 'baghdad', medallion: 'daraqutni-cutout' },
  'al-mustadrak-ala-al-sahihayn': { name: 'al-Ḥākim al-Naysābūrī', origin: 'Nishapur', region: 'nishapur', medallion: 'hakim-cutout' },
  'sunan-al-bayhaqi-al-kubra': { name: 'Aḥmad ibn al-Ḥusayn al-Bayhaqī', origin: 'Nishapur', region: 'nishapur', medallion: 'bayhaqi' },
  'al-ahadith-al-mukhtarah': { name: 'Ḍiyāʾ al-Dīn al-Maqdisī', origin: 'Damascus', region: 'damascus', medallion: 'maqdisi-cutout' },
  'al-matalib-al-aliyah': { name: 'Ibn Ḥajar al-ʿAsqalānī', origin: 'Cairo', region: 'egypt', medallion: 'ibn-hajar-cutout' },
};

/** The Six Books, numbered on their cards in this order. */
export const SIX_BOOKS = ['sahih-al-bukhari', 'sahih-muslim', 'sunan-abi-dawud', 'jami-al-tirmidhi', 'sunan-al-nasa-i', 'sunan-ibn-majah'] as const;

export function compilerFor(slug: string): Compiler | undefined {
  return COMPILERS[slug];
}
