/* Splits the name part of a Taqrīb biography (everything before the grade)
   into its components. Ibn Ḥajar's spelling notes ("بفتح المعجمة بعدها
   موحدة") are lifted out first and kept with the word they spell. */
import { fold, squash, words } from './arabic.mjs';

const LETTER_NAMES = 'الف|همزة|باء|تاء|ثاء|جيم|حاء|خاء|دال|ذال|راء|زاي|سين|شين|صاد|ضاد|طاء|ظاء|عين|غين|فاء|قاف|كاف|لام|ميم|نون|هاء|واو|ياء|يا';
const SPELL_WORD = new RegExp(
  `^(?:[وب]|بال|وال|ال)?(?:فتح|ضم|كسر|سكون|تشديد|تخفيف|تصغير|التصغير|معجمة|مهملة|موحدة|موحدتين|مثناة|مثناتين|مثلثة|تحتانية|تحتانيتين|فوقانية|ساكنة|مفتوحة|مكسورة|مضمومة|مشددة|ثقيلة|خفيفة|مثقلة|مخففة|مشالة|اوله|اخره|ثانيه|ثالثه|اولها|اخرها|الاولي|الثانية|الثالثة|المد|مد|القصر|مقصور|ممدود|${LETTER_NAMES})$`,
);
const SPELL_START = new RegExp(
  `^(?:ب|بال)(?:فتح|ضم|كسر|سكون|تشديد|تخفيف|تصغير|معجمة|مهملة|موحدة|موحدتين|مثناة|مثلثة|تحتانية|فوقانية|${LETTER_NAMES})$|^(?:بالتصغير|مصغر|مصغرا|مكبر|مكبرا)$`,
);
const SPELL_LINK = new Set(['ثم', 'بعدها', 'بعده', 'وبعدها', 'وبعده', 'بينهما', 'وآخره', 'واخره', 'ثانية', 'ساكنة', 'خفيفة', 'ثقيلة', 'الاولي', 'والثانية', 'مفتوحة', 'مكسورة', 'مضمومة', 'مشالة', 'ونون', 'وراء']);

const isSpellWord = (k) => SPELL_WORD.test(k) || SPELL_LINK.has(k);

/* Removes spelling notes, returning the remaining tokens and the notes. */
export const liftSpelling = (text) => {
  const tokens = words(text);
  const keys = tokens.map(fold);
  const kept = [];
  const spelling = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (!SPELL_START.test(keys[i])) {
      kept.push(tokens[i]);
      continue;
    }
    let j = i + 1;
    while (j < tokens.length && isSpellWord(keys[j])) j += 1;
    spelling.push({ word: kept.at(-1) ?? null, note: tokens.slice(i, j).join(' ') });
    i = j - 1;
  }
  return { tokens: kept, spelling };
};

const COMPOUND_HEAD = new Set(['عبد', 'عبيد']);
const KUNYA_HEAD = new Set(['ابو', 'ابي', 'ابا', 'ام']);
const NASAB_HEAD = new Set(['ابن', 'بن', 'بنت', 'ابنة']);
const ALT_HEAD = new Set(['ويقال', 'وقيل', 'ويقال له', 'او', 'وقيل له', 'وسماه', 'ويسمى']);

/* One name: "زيد", "عبد الله", "أبي طالب", "أبي عبد الرحمن". */
const takeName = (tokens, keys, i) => {
  let j = i;
  if (KUNYA_HEAD.has(keys[j]) || keys[j] === 'ذي' || keys[j] === 'ذو') j += 1;
  if (COMPOUND_HEAD.has(keys[j])) j += 1;
  j += 1;
  return { text: tokens.slice(i, Math.min(j, tokens.length)).join(' '), next: Math.min(j, tokens.length) };
};

const isNisba = (k) => /^ال\p{L}{2,}(ي|ية)$/u.test(k);

const emptyName = () => ({
  ism: null, nasab: [], kunya: [], nisbas: [], laqab: [], residence: [],
  wala: [], office: [], descriptors: [], alternatives: [], spelling: [],
});

/* A name that opens with a kunya or a relative ("ابن", "بنت"), as in the
   kunya and nasab sections, has no given name. */
export const parseName = (text) => {
  const { tokens, spelling } = liftSpelling(text);
  const keys = tokens.map(fold);
  const name = { ...emptyName(), spelling };
  let i = 0;
  if (tokens.length && !KUNYA_HEAD.has(keys[0]) && !NASAB_HEAD.has(keys[0])) {
    const first = takeName(tokens, keys, 0);
    name.ism = first.text;
    i = first.next;
  }
  while (i < tokens.length) {
    const k = keys[i];
    const pair = `${k} ${keys[i + 1] ?? ''}`;
    if (ALT_HEAD.has(k) || ALT_HEAD.has(pair)) {
      name.alternatives.push(squash(tokens.slice(i).join(' ')));
      break;
    }
    if (NASAB_HEAD.has(k) && i + 1 < tokens.length) {
      const got = takeName(tokens, keys, i + 1);
      name.nasab.push(got.text);
      i = got.next;
    } else if (KUNYA_HEAD.has(k) && i + 1 < tokens.length) {
      const got = takeName(tokens, keys, i);
      name.kunya.push(got.text);
      i = got.next;
    } else if (k === 'يكني' && i + 1 < tokens.length) {
      const got = takeName(tokens, keys, i + 1);
      name.kunya.push(got.text);
      i = got.next;
    } else if (/^(نزيل|نزيلة|سكن|نزل)$/.test(k) && i + 1 < tokens.length) {
      name.residence.push(tokens[i + 1]);
      i += 2;
    } else if (k === 'مولاهم' || k === 'مولاتهم') {
      name.wala.push(tokens[i]);
      i += 1;
    } else if (/^(مولي|مولاة)$/.test(k) && i + 1 < tokens.length) {
      const got = takeName(tokens, keys, i + 1);
      name.wala.push(got.text);
      i = got.next;
    } else if (/^(قاضي|امير|خطيب|مؤذن|امام)$/.test(k) && i + 1 < tokens.length) {
      name.office.push(`${tokens[i]} ${tokens[i + 1]}`);
      i += 2;
    } else if (/^(لقبه|يلقب|المعروف|يعرف)$/.test(k) && i + 1 < tokens.length) {
      name.laqab.push(tokens[i + 1].replace(/^ب/, ''));
      i += 2;
    } else if (isNisba(k)) {
      name.nisbas.push(tokens[i]);
      i += 1;
    } else {
      name.descriptors.push(tokens[i]);
      i += 1;
    }
  }
  return name;
};
