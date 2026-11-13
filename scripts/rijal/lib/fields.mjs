/* Field readers for one Taqrīb biography. Every reader takes plain text
   (no vowel marks) and matches against its folded form, which has the same
   length, so offsets found in one apply to the other. */
import { fold, squash, words } from './arabic.mjs';
import { readAlternatives, readNumber, valueOf } from './numbers.mjs';
import { GENERATIONS, TIERS, centuryForGeneration, isSiglum, TAMYIZ } from './vocab.mjs';

const L = '\\p{L}';
const word = (alts) => new RegExp(`(?<!${L})(?:${alts})(?!${L})`, 'u');
const wordG = (alts) => new RegExp(`(?<!${L})(?:${alts})(?!${L})`, 'gu');

/* ── Variant readings ───────────────────────────────────────────── */

/* Bracketed text is the Abū al-Ashbāl edition's reading. It is lifted out
   so the fields below read the ʿAwwāma text only. */
export const liftVariants = (text) => {
  const variants = [];
  const base = squash(text.replace(/\[([^\]]*)\]/g, (_, inner) => {
    const body = squash(inner);
    if (body) {
      const tokens = words(body);
      const sigla = tokens.length > 0 && tokens.every(isSiglum);
      variants.push({ text: body, kind: sigla ? 'sigla' : 'text' });
    }
    return ' ';
  }));
  return { base, variants };
};

/* "سنة سبع وتسعين [ومائة]": a bracket holding only number words completes a
   year, so for reading dates it is kept inline and every other bracket is
   dropped. Returns the text and whether any such bracket was found. */
export const inlineNumberVariants = (text) => {
  let found = false;
  const out = squash(text.replace(/\[([^\]]*)\]/g, (_, inner) => {
    const tokens = words(fold(inner));
    const got = tokens.length ? readNumber(tokens) : null;
    if (got && got.used === tokens.length) {
      found = true;
      return ` ${squash(inner)} `;
    }
    return ' ';
  }));
  return { text: out, found };
};

/* ── Source codes ───────────────────────────────────────────────── */

export const peelSigla = (text) => {
  const tokens = words(text);
  const codes = [];
  while (tokens.length && (isSiglum(tokens.at(-1)) || tokens.at(-1) === 'حرف')) {
    const token = tokens.pop();
    if (token !== 'حرف') codes.unshift(token);
  }
  return { body: tokens.join(' '), codes, tamyiz: codes.includes(TAMYIZ) };
};

/* ── Generation ─────────────────────────────────────────────────── */

const ORDINALS = [...GENERATIONS].sort((a, b) => b.ar.length - a.ar.length);
const GEN_RE = new RegExp(
  `(?<!${L})من (?:(كبار|اوساط|صغار) )?(${ORDINALS.map((g) => fold(g.ar)).join('|')})(?!${L})`,
  'u',
);

export const readGeneration = (text) => {
  const m = GEN_RE.exec(fold(text));
  if (!m) return null;
  const n = ORDINALS.find((g) => fold(g.ar) === m[2]).n;
  const tierWord = Object.keys(TIERS).find((k) => fold(k) === m[1]);
  return {
    n,
    tier: tierWord ? TIERS[tierWord] : null,
    phrase_ar: text.slice(m.index, m.index + m[0].length),
    at: m.index,
    end: m.index + m[0].length,
  };
};

/* ── Grade ──────────────────────────────────────────────────────── */

/* Primary terms. The earliest one in the text opens the grade phrase;
   at the same position the longer term wins. `term` marks Ibn Ḥajar's own
   wording for that rank; the rest are read to the nearest rank. */
const TERMS = [
  { rank: 1, re: wordG('صحابي|صحابية'), term: true, companion: true },
  { rank: 1, re: wordG('له صحبة|لها صحبة|يقال له صحبة|يقال لها صحبة|له رؤية|لها رؤية|مختلف في صحبته|ادرك النبي'), companion: true },
  { rank: 12, re: wordG('كذاب|وضاع|يضع الحديث') , term: true },
  { rank: 11, re: wordG('متهم|متهم بالكذب|اتهم|اتهموه|كذبوه|رمي بالكذب|الي الكذب') },
  { rank: 10, re: wordG('متروك|متروكة|متروك الحديث'), term: true },
  { rank: 10, re: wordG('ساقط|ذاهب الحديث|واهي الحديث|واه') },
  { rank: 9, re: wordG('مجهول|مجهولة'), term: true },
  { rank: 9, re: wordG('لا يعرف|لا تعرف|لا يدري من هو') },
  { rank: 7, re: wordG('مستور|مستورة|مجهول الحال|مجهولة الحال'), term: true },
  { rank: 7, re: wordG('لا يعرف حاله|لا يعرف حالها|لا تعرف حالها|لا يعرف حالهم') },
  { rank: 8, re: wordG('ضعيف|ضعيفة|ضعيف الحديث'), term: true },
  { rank: 8, re: wordG('ليس بالقوي|منكر الحديث|فيه ضعف|لين جدا') },
  { rank: 6, re: wordG('مقبول|مقبولة|لين الحديث|لينة الحديث'), term: true },
  { rank: 4, re: wordG('صدوق|صدوقة|لا باس به|ليس به باس'), term: true },
  { rank: 3, re: wordG('ثقة|ثبت|متقن'), term: true },
  { rank: 3, re: wordG('حجة|احد الائمة|احد الاعلام|حافظ|امير المؤمنين في الحديث') },
  { rank: 1, re: wordG('الصحابي|الصحابية|له ولابيه صحبة|لها ولابيها صحبة|مذكور في الصحابة|خادم رسول الله'), companion: true },
  /* Another critic's verdict, reported without a grade of Ibn Ḥajar's own.
     It opens the grade phrase but sets no rank. */
  { rank: null, re: wordG('وثقه|ضعفه|تركه|لينه|كذبه|تكلم فيه|تكلموا فيه|اختلف فيه|مختلف فيه|وما عرف') },
];

const EMPHATIC = word('ثقة ثقة|ثقة ثبت|ثقة حافظ|ثقة متقن|ثقة حجة|ثبت حجة|حافظ حجة|ثقة امام|احد الائمة|احد الاعلام|امير المؤمنين في الحديث|اوثق الناس');
const LESSENED = word('يهم|يخط(?:يء|ئ)|له اوهام|اوهام|اغلاط|ربما وهم|ربما اخطا|سي+ء الحفظ|تغير|اختلط|يغرب|فيه لين|لين|يدلس|مدلس|رمي ب\\p{L}+|يتشيع|فيه تشيع|شيعي|ناصبي|قدري|مرجي|خارجي|جهمي|يري الارجاء|يري القدر');

const QUALIFIERS = [
  ['tadlis', 'يدلس|مدلس|بالتدليس|التدليس'],
  ['mixed_late', 'اختلط|تغير|اختلاط|خلط في'],
  ['errors', 'يهم|يخط(?:يء|ئ)|اوهام|اغلاط|ربما وهم|ربما اخطا|يغرب|له مناكير'],
  ['poor_memory', 'سي+ء الحفظ'],
  ['qadar', 'بالقدر|القدر|قدري'],
  ['tashayyu', 'يتشيع|تشيع|شيعي|بالتشيع'],
  ['rafd', 'رافضي|بالرفض|الرفض'],
  ['irja', 'الارجاء|بالارجاء|مرجي'],
  ['nasb', 'ناصبي|بالنصب|النصب'],
  ['khawarij', 'الخوارج|خارجي|حروري|الحرورية'],
  ['jahmiyya', 'جهمي|بالتجهم'],
  ['ascetic', 'عابد|زاهد|عابدة'],
  ['jurist', 'فقيه|فقيهة'],
  ['hafiz', 'حافظ'],
].map(([tag, alts]) => [tag, word(alts)]);

export const qualifiersOf = (text) => {
  const key = fold(text);
  return QUALIFIERS.filter(([, re]) => re.test(key)).map(([tag]) => tag);
};

/* Every term occurrence, earliest first; at one position the longer wins. */
const termHits = (key) => {
  const hits = [];
  for (const t of TERMS) {
    for (const m of key.matchAll(t.re)) hits.push({ ...t, at: m.index, length: m[0].length });
  }
  return hits.sort((a, b) => a.at - b.at || b.length - a.length);
};

const NO_GRADE = Object.freeze({ phrase_ar: null, rank: null, basis: 'none', companion: false, qualifiers: [], needs_review: true });

/* Reads the grade from the text before the generation (or the whole
   body when there is none). The phrase opens at the first term; the rank
   comes from the first term that carries one. Returns where the phrase
   starts so the caller can take the name from what comes before it. */
export const readGrade = (region) => {
  const hits = termHits(fold(region));
  if (!hits.length) return { at: region.length, assessment: NO_GRADE };
  const start = hits[0];
  const ranked = hits.find((h) => h.rank != null);
  const phrase = squash(region.slice(start.at));
  const phraseKey = fold(phrase);
  let rank = ranked?.rank ?? null;
  if (rank === 3 && EMPHATIC.test(phraseKey)) rank = 2;
  if (rank === 4 && LESSENED.test(phraseKey)) rank = 5;
  const basis = !ranked ? 'attributed' : ranked === start && ranked.term ? 'term' : 'inferred';
  return {
    at: start.at,
    assessment: {
      phrase_ar: phrase,
      rank,
      basis,
      companion: hits.some((h) => h.companion),
      qualifiers: qualifiersOf(phrase),
      needs_review: basis !== 'term',
    },
  };
};

/* ── Death and birth ────────────────────────────────────────────── */

const DEATH_VERB = new RegExp(`(?<!${L})[وف]?(مات|ماتت|قتل|قتلت|استشهد|استشهدت|توفي|توفيت|هلك)(?!${L})`, 'u');
/* Offset of the first death verb, or -1. */
export const deathAt = (text) => {
  const m = DEATH_VERB.exec(fold(text));
  return m ? m.index : -1;
};

const YEAR_LEAD ={ 'سنة': 'exact', 'سنه': 'exact', 'حدود': 'circa', 'بعد': 'after', 'قبل': 'before' };

const yearAfter = (tokens, from) => {
  for (let i = from; i < tokens.length; i += 1) {
    const lead = YEAR_LEAD[tokens[i]];
    if (!lead) continue;
    if (['وله', 'له', 'ابن', 'عن'].includes(tokens[i - 1]) || /^(ولد|مولده|وولد)$/.test(tokens[i - 1] ?? '')) continue;
    const got = readAlternatives(tokens.slice(i + 1));
    if (!got) continue;
    let qualifier = lead;
    const rest = tokens.slice(i + 1 + got.used, i + 3 + got.used).join(' ');
    if (rest.startsWith('او بعدها') || rest.startsWith('او بعده')) qualifier = 'or_after';
    if (rest.startsWith('او قبلها') || rest.startsWith('او قبله')) qualifier = 'or_before';
    if (got.alternatives.some((p) => p.some)) qualifier = 'circa';
    return { qualifier, alternatives: got.alternatives, index: i };
  }
  return null;
};

/* Years without a century get one from the generation, unless the text
   says otherwise ("دون المائة", usually as an Abū al-Ashbāl reading). */
const datesFor = (alternatives, { generationN, companion, centuryHint }) => {
  if (alternatives.every((p) => p.hundreds != null)) return { values: alternatives.map(valueOf), basis: 'stated' };
  const century = centuryHint ?? (companion ? 0 : centuryForGeneration(generationN));
  if (century == null) return { values: null, basis: 'unresolved' };
  return {
    values: alternatives.map((p) => (p.hundreds != null ? valueOf(p) : valueOf(p) + century)),
    basis: centuryHint != null ? 'stated_century' : 'inferred',
  };
};

/* "مات [دون المائة] سنة ..." marks an early death that the generation
   rule would put a century too late. */
export const centuryHintOf = (text) => {
  const key = fold(text);
  if (/(?:دون|قبل) (?:ال)?(?:مائتين|مئتين)/.test(key)) return 100;
  if (/(?:دون|قبل) (?:ال)?(?:مائة|مئة)/.test(key)) return 0;
  return null;
};

const AGE_RE = new RegExp(`(?<!${L})(?:وله|له|وهو ابن|عن) ((?:\\p{L}+ ){1,4}?)سنة`, 'u');

export const readDeath = (text, { generationN = null, companion = false, centuryHint = null } = {}) => {
  const key = fold(text);
  const verb = DEATH_VERB.exec(key);
  if (!verb) return null;
  const clause = squash(text.slice(verb.index));
  const tokens = words(fold(clause));
  const year = yearAfter(tokens, 1);
  const ageMatch = AGE_RE.exec(fold(clause));
  const age = ageMatch ? readAlternatives(words(ageMatch[1])) : null;
  const dates = year ? datesFor(year.alternatives, { generationN, companion, centuryHint }) : null;
  return {
    phrase_ar: clause,
    year_ah: dates?.values?.[0] ?? null,
    alternatives: dates?.values && dates.values.length > 1 ? dates.values : [],
    qualifier: year?.qualifier ?? null,
    basis: dates?.basis ?? 'none',
    manner: /قتل|استشهد/.test(verb[1]) ? (verb[1].startsWith('است') ? 'martyred' : 'killed') : null,
    age: age ? valueOf(age.alternatives[0]) : null,
  };
};

const BIRTH_RE = new RegExp(`(?<!${L})(?:ولد|مولده|وولد)(?: \\p{L}+)? سنة ((?:\\p{L}+ ?){1,4})`, 'u');

export const readBirth = (text) => {
  const m = BIRTH_RE.exec(fold(text));
  if (!m) return null;
  const got = readAlternatives(words(m[1]));
  if (!got) return null;
  const parts = got.alternatives[0];
  return { as_written: valueOf(parts), century_stated: parts.hundreds != null };
};

/* ── Relations to the neighboring entries ───────────────────────── */

const KIN = [
  ['grandson_of', 'حفيد'], ['son_of', 'ابن|ولد'], ['father_of', 'والد|ابو'],
  ['brother_of', 'اخو'], ['sister_of', 'اخت'], ['nephew_of', 'ابن اخي|ابن اخت'],
  ['cousin_of', 'ابن عم'], ['uncle_of', 'عم'], ['client_of', 'مولي'],
  ['husband_of', 'زوج'], ['wife_of', 'زوجة|امراة'], ['daughter_of', 'بنت|ابنة'],
  ['mother_of', 'ام'],
];
const KIN_RE = new RegExp(
  `(?<!${L})(${KIN.map(([, a]) => a).join('|')}) (?:الذي|التي) (قبله|قبلها|بعده|بعدها)(?!${L})`,
  'gu',
);
const SAME_RE = new RegExp(`(?<!${L})(?:وهو|هو|وهي|هي) (?:الذي|التي) (قبله|قبلها|بعده|بعدها)(?!${L})`, 'gu');

export const readRelations = (text) => {
  const key = fold(text);
  const out = [];
  for (const m of key.matchAll(KIN_RE)) {
    const type = KIN.find(([, alts]) => new RegExp(`^(?:${alts})$`).test(m[1]))[0];
    out.push({ type, direction: /قبل/.test(m[2]) ? 'previous' : 'next' });
  }
  for (const m of key.matchAll(SAME_RE)) {
    const before = key.slice(Math.max(0, m.index - 20), m.index);
    const denied = /زعم|ليس|وهم/.test(before);
    out.push({ type: denied ? 'distinct_from' : 'same_as', direction: /قبل/.test(m[1]) ? 'previous' : 'next' });
  }
  return out;
};
