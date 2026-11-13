/* Decides which list page each Taqrīb biography goes on. Men listed by
   given name are paged by letter; a letter with more than PAGE_LIMIT names
   is cut into parts at a change of name, so one name never spans two
   pages. Kunyas, people known by a relative, the unnamed and the women
   each get a page of their own, as the book keeps them apart. */
import { fold } from './arabic.mjs';

export const PAGE_LIMIT = 650;

export const ALPHABET = Object.freeze([
  { ar: 'ا', slug: 'alif', en: 'Alif' },
  { ar: 'ب', slug: 'ba', en: 'Bāʾ' },
  { ar: 'ت', slug: 'ta', en: 'Tāʾ' },
  { ar: 'ث', slug: 'tha', en: 'Thāʾ' },
  { ar: 'ج', slug: 'jim', en: 'Jīm' },
  { ar: 'ح', slug: 'hha', en: 'Ḥāʾ' },
  { ar: 'خ', slug: 'kha', en: 'Khāʾ' },
  { ar: 'د', slug: 'dal', en: 'Dāl' },
  { ar: 'ذ', slug: 'dhal', en: 'Dhāl' },
  { ar: 'ر', slug: 'ra', en: 'Rāʾ' },
  { ar: 'ز', slug: 'zay', en: 'Zāy' },
  { ar: 'س', slug: 'sin', en: 'Sīn' },
  { ar: 'ش', slug: 'shin', en: 'Shīn' },
  { ar: 'ص', slug: 'sad', en: 'Ṣād' },
  { ar: 'ض', slug: 'dad', en: 'Ḍād' },
  { ar: 'ط', slug: 'tta', en: 'Ṭāʾ' },
  { ar: 'ظ', slug: 'zza', en: 'Ẓāʾ' },
  { ar: 'ع', slug: 'ayn', en: 'ʿAyn' },
  { ar: 'غ', slug: 'ghayn', en: 'Ghayn' },
  { ar: 'ف', slug: 'fa', en: 'Fāʾ' },
  { ar: 'ق', slug: 'qaf', en: 'Qāf' },
  { ar: 'ك', slug: 'kaf', en: 'Kāf' },
  { ar: 'ل', slug: 'lam', en: 'Lām' },
  { ar: 'م', slug: 'mim', en: 'Mīm' },
  { ar: 'ن', slug: 'nun', en: 'Nūn' },
  { ar: 'ه', slug: 'ha', en: 'Hāʾ' },
  { ar: 'و', slug: 'waw', en: 'Wāw' },
  { ar: 'ي', slug: 'ya', en: 'Yāʾ' },
]);

const LETTER_INDEX = new Map(ALPHABET.map((l, i) => [l.ar, i]));

export const GROUPS = Object.freeze([
  { id: 'kunyas', sections: ['men_kunya'], en: 'Men known by kunya', ar: 'الكنى' },
  { id: 'relatives', sections: ['men_nasab', 'men_ibn_akhi', 'men_ibn_umm', 'nisba_index'], en: 'Men known by a relative, nisba or nickname', ar: 'من نسب إلى أبيه أو جده، والأنساب والألقاب' },
  { id: 'unnamed-men', sections: ['mubham_men'], en: 'Unnamed men', ar: 'المبهمات' },
  { id: 'women', sections: ['women_ism', 'women_kunya', 'women_ibnat', 'mubham_women', 'women_from_women'], en: 'Women', ar: 'النساء' },
]);

/* "والثاني مرادي", "ولهم خامس": entries that continue a list of namesakes
   open with "and", so their first letter says nothing. */
const CONTINUES = /^و(?:ال|لهم|لها)/;

const firstLetter = (n) => {
  const name = fold(n.name.ism ?? n.name.full_ar ?? '').replace(/^ال/, '');
  if (CONTINUES.test(name)) return null;
  return LETTER_INDEX.has(name[0]) ? name[0] : null;
};

const CONFIRM = 3;
const MAX_STEP = 3;

/* Walks the men in book order. The book's own letter headings are missing
   in places, so the letter is read from the names: it moves forward, by
   at most MAX_STEP letters, only when CONFIRM names in a row agree. */
const lettersInOrder = (men) => {
  const at = men.map((n) => {
    const l = firstLetter(n);
    return l == null ? -1 : LETTER_INDEX.get(l);
  });
  let current = 0;
  return at.map((here, i) => {
    const agreed = at.slice(i, i + CONFIRM).every((x) => x === here);
    if (here > current && here - current <= MAX_STEP && agreed) current = here;
    return current;
  });
};

/* Cuts a run into parts of about equal size, each cut at a change of
   given name. */
const cutRun = (run) => {
  if (run.length <= PAGE_LIMIT) return [run];
  const parts = Math.ceil(run.length / PAGE_LIMIT);
  const size = Math.ceil(run.length / parts);
  const out = [];
  let start = 0;
  while (start < run.length) {
    let end = Math.min(run.length, start + size);
    const ism = (k) => fold(run[k]?.name.ism ?? '');
    while (end < run.length && end - start < size * 1.4 && ism(end) === ism(end - 1)) end += 1;
    out.push(run.slice(start, end));
    start = end;
  }
  return out;
};

/* Returns the pages in reading order, each with the narrators on it. */
export const planPages = (narrators) => {
  const men = narrators.filter((n) => n.section === 'men_ism');
  const letters = lettersInOrder(men);
  const pages = [];
  ALPHABET.forEach((letter, li) => {
    const run = men.filter((_, i) => letters[i] === li);
    const parts = cutRun(run);
    parts.forEach((items, pi) => {
      pages.push({
        slug: parts.length > 1 ? `${letter.slug}-${pi + 1}` : letter.slug,
        kind: 'letter',
        letter,
        part: parts.length > 1 ? pi + 1 : null,
        parts: parts.length,
        title_en: parts.length > 1 ? `${letter.en}, part ${pi + 1}` : letter.en,
        title_ar: `حرف ${letter.ar}`,
        range_ar: items.length ? [items[0].name.ism, items.at(-1).name.ism] : [],
        ids: items.map((n) => n.id),
      });
    });
  });
  for (const group of GROUPS) {
    const items = narrators.filter((n) => group.sections.includes(n.section));
    if (!items.length) continue;
    pages.push({
      slug: group.id,
      kind: 'group',
      sections: group.sections,
      part: null,
      parts: 1,
      title_en: group.en,
      title_ar: group.ar,
      range_ar: [],
      ids: items.map((n) => n.id),
    });
  }
  return pages.filter((p) => p.ids.length);
};
