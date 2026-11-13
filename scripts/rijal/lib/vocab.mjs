/* Reference tables for Ibn Ḥajar's Taqrīb al-Tahdhīb, taken from the
   author's introduction (pp. 74-76 of the ʿAwwāma edition). */

/* Source codes (rumūz) placed after each biography. */
export const SIGLA = Object.freeze({
  'خ': { work: 'Ṣaḥīḥ al-Bukhārī', author: 'al-Bukhārī' },
  'خت': { work: 'Ṣaḥīḥ al-Bukhārī (suspended reports)', author: 'al-Bukhārī' },
  'بخ': { work: 'al-Adab al-Mufrad', author: 'al-Bukhārī' },
  'عخ': { work: 'Khalq Afʿāl al-ʿIbād', author: 'al-Bukhārī' },
  'ر': { work: 'Juzʾ al-Qirāʾa', author: 'al-Bukhārī' },
  'ي': { work: 'Rafʿ al-Yadayn', author: 'al-Bukhārī' },
  'م': { work: 'Ṣaḥīḥ Muslim', author: 'Muslim' },
  'مق': { work: 'Muqaddimat Ṣaḥīḥ Muslim', author: 'Muslim' },
  'د': { work: 'Sunan Abī Dāwūd', author: 'Abū Dāwūd' },
  'مد': { work: 'al-Marāsīl', author: 'Abū Dāwūd' },
  'صد': { work: 'Faḍāʾil al-Anṣār', author: 'Abū Dāwūd' },
  'خد': { work: 'al-Nāsikh', author: 'Abū Dāwūd' },
  'قد': { work: 'al-Qadar', author: 'Abū Dāwūd' },
  'ف': { work: 'al-Tafarrud', author: 'Abū Dāwūd' },
  'ل': { work: 'al-Masāʾil', author: 'Abū Dāwūd' },
  'كد': { work: 'Musnad Mālik', author: 'Abū Dāwūd' },
  'ت': { work: 'Jāmiʿ al-Tirmidhī', author: 'al-Tirmidhī' },
  'تم': { work: 'al-Shamāʾil', author: 'al-Tirmidhī' },
  'س': { work: 'Sunan al-Nasāʾī', author: 'al-Nasāʾī' },
  'عس': { work: 'Musnad ʿAlī', author: 'al-Nasāʾī' },
  'كن': { work: 'Musnad Mālik', author: 'al-Nasāʾī' },
  'سي': { work: 'ʿAmal al-Yawm wa-l-Layla', author: 'al-Nasāʾī' },
  'ص': { work: 'Khaṣāʾiṣ ʿAlī', author: 'al-Nasāʾī' },
  'ق': { work: 'Sunan Ibn Māja', author: 'Ibn Māja' },
  'فق': { work: 'al-Tafsīr', author: 'Ibn Māja' },
});

/* Group codes that stand for several of the six books. */
export const SIGLA_GROUPS = Object.freeze({
  'ع': { label: 'all six books', codes: ['خ', 'م', 'د', 'ت', 'س', 'ق'] },
  '4': { label: 'the four Sunan', codes: ['د', 'ت', 'س', 'ق'] },
});

/* Marks a narrator who has no report in these books and is listed only to
   tell him apart from someone with a similar name. */
export const TAMYIZ = 'تمييز';

export const isSiglum = (token) => token in SIGLA || token in SIGLA_GROUPS || token === TAMYIZ;

/* The twelve generations (ṭabaqāt), keyed by the ordinal Ibn Ḥajar uses. */
export const GENERATIONS = Object.freeze([
  { n: 1, ar: 'الأولى', en: 'the Companions' },
  { n: 2, ar: 'الثانية', en: 'senior Successors' },
  { n: 3, ar: 'الثالثة', en: 'middle Successors' },
  { n: 4, ar: 'الرابعة', en: 'Successors who mostly narrate from senior Successors' },
  { n: 5, ar: 'الخامسة', en: 'junior Successors' },
  { n: 6, ar: 'السادسة', en: 'contemporaries of the fifth who met no Companion' },
  { n: 7, ar: 'السابعة', en: 'senior Followers of the Successors' },
  { n: 8, ar: 'الثامنة', en: 'middle Followers of the Successors' },
  { n: 9, ar: 'التاسعة', en: 'junior Followers of the Successors' },
  { n: 10, ar: 'العاشرة', en: 'senior transmitters from the Followers of the Successors' },
  { n: 11, ar: 'الحادية عشرة', en: 'middle transmitters from the Followers of the Successors' },
  { n: 12, ar: 'الثانية عشرة', en: 'junior transmitters from the Followers of the Successors' },
]);

export const TIERS = Object.freeze({ 'كبار': 'senior', 'أوساط': 'middle', 'صغار': 'junior' });

/* Ibn Ḥajar's own rule for death dates written without a century. */
export const centuryForGeneration = (n) => {
  if (n == null) return null;
  if (n <= 2) return 0;
  if (n <= 8) return 100;
  return 200;
};

/* The twelve grades (marātib) of the introduction. */
export const RANKS = Object.freeze([
  { rank: 1, term_ar: 'صحابي', en: 'Companion' },
  { rank: 2, term_ar: 'ثقة ثقة / ثقة حافظ', en: 'emphatically reliable' },
  { rank: 3, term_ar: 'ثقة', en: 'reliable' },
  { rank: 4, term_ar: 'صدوق', en: 'truthful' },
  { rank: 5, term_ar: 'صدوق يهم', en: 'truthful with a stated weakness' },
  { rank: 6, term_ar: 'مقبول', en: 'acceptable when corroborated' },
  { rank: 7, term_ar: 'مستور', en: 'of unestablished standing' },
  { rank: 8, term_ar: 'ضعيف', en: 'weak' },
  { rank: 9, term_ar: 'مجهول', en: 'unknown' },
  { rank: 10, term_ar: 'متروك', en: 'abandoned' },
  { rank: 11, term_ar: 'متهم بالكذب', en: 'accused of lying' },
  { rank: 12, term_ar: 'كذاب', en: 'liar or forger' },
]);

export const LETTERS = Object.freeze([
  'الألف', 'الباء', 'التاء', 'الثاء', 'الجيم', 'الحاء', 'الخاء', 'الدال', 'الذال',
  'الراء', 'الزاي', 'السين', 'الشين', 'الصاد', 'الضاد', 'الطاء', 'الظاء', 'العين',
  'الغين', 'الفاء', 'القاف', 'الكاف', 'اللام', 'الميم', 'النون', 'الهاء', 'الواو',
  'لام ألف', 'الياء',
]);

/* Sections of the book, in order, with the heading that opens each. */
export const SECTIONS = Object.freeze([
  { id: 'men_ism', gender: 'm', en: 'Men, by given name' },
  { id: 'men_kunya', gender: 'm', en: 'Men, by kunya', opens: /باب الكني/ },
  { id: 'men_nasab', gender: 'm', en: 'Men known by a father, mother, grandfather or uncle', opens: /باب من نسب الي/ },
  { id: 'men_ibn_akhi', gender: 'm', en: 'Men called "nephew of"', opens: /فصل فيمن قيل فيه ابن اخي/ },
  { id: 'men_ibn_umm', gender: 'm', en: 'Men called "son of Umm"', opens: /فصل فيمن قيل فيه ابن ام/ },
  { id: 'nisba_index', gender: 'm', en: 'Index of nisbas', opens: /باب الانساب الي القبائل/ },
  { id: 'laqab_index', gender: 'm', en: 'Index of nicknames', opens: /باب الالقاب/ },
  { id: 'mubham_men', gender: 'm', en: 'Unnamed men', opens: /باب المبهمات/ },
  { id: 'women_ism', gender: 'f', en: 'Women, by name', opens: /باب النساء/ },
  { id: 'women_kunya', gender: 'f', en: 'Women, by kunya', opens: /الكني من النساء/ },
  { id: 'women_ibnat', gender: 'f', en: 'Women called "daughter of"', opens: /فصل فيمن قيل لها ابنة/ },
  { id: 'mubham_women', gender: 'f', en: 'Unnamed women', opens: /فصل في (\[?بيان\]? )?المبهمات من النسوة/ },
  { id: 'women_from_women', gender: 'f', en: 'Women narrating from women', opens: /فصل النساء عن النساء/ },
]);
