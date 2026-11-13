/* Unnumbered cross-references ("[] X هو Y", "[] X صوابه Y", "[] X في Y",
   "[] X اسمه Y", and in the nisba and nickname indexes "[] الأصمعي Y").
   Each gives a name form and the biography the book files it under. */
import { fold, squash, words } from './arabic.mjs';
import { liftVariants, peelSigla } from './fields.mjs';
import { liftSpelling } from './names.mjs';

const L = '\\p{L}';
const KINDS = [
  { kind: 'correction', re: new RegExp(`(?<!${L})(?:صوابه|والصواب|الصواب)(?!${L}):?`, 'u') },
  { kind: 'same_as', re: new RegExp(`(?<!${L})(?:هو|هي|وهو|وهي|هم|اسمه|اسمها|واسمه)(?!${L})`, 'u') },
  { kind: 'see', re: new RegExp(`(?<!${L})(?:ياتي|سياتي|تاتي|تقدم|تقدمت|تقدموا|تقدما|تقدمن|مضي)(?!${L})(?: في)?`, 'u') },
  { kind: 'see', re: new RegExp(`(?<!${L})في(?!${L})`, 'u') },
];

/* Words that end a target: where-to-look phrases and asides. */
const TRAIL = new RegExp(
  `(?<!${L})(?:تقدم|تقدمت|تقدموا|تقدما|تقدمن|ياتي|سياتي|تاتي|مضي|نسب|ينسب|قريبا|كذا|وهو|وقيل|ذكر|المتقدم|الاتي|الماضي)(?!${L})`,
  'u',
);

const INDEX_SECTIONS = new Set(['nisba_index', 'laqab_index']);

/* Section names a cross-reference can point to instead of a person. */
const PLACES = [
  ['kunya', /^(?:باب )?الكني/],
  ['names', /^الاسماء/],
  ['nisbas', /^الانساب/],
  ['nicknames', /^الالقاب/],
  ['group', /^(?:المحمدين|العبادلة|من اسمه)/],
];

const cutTarget = (body, key, from) => {
  const rest = key.slice(from);
  const trail = TRAIL.exec(rest);
  const end = trail ? from + trail.index : key.length;
  return squash(body.slice(from, end));
};

/* In the nisba and nickname indexes a bare entry is "الأصمعي عبد الملك ابن
   قريب": the leading ال-words are the form, the rest the person. */
const splitIndexEntry = (body) => {
  const tokens = words(body);
  let i = 0;
  while (i < tokens.length && /^ال/.test(fold(tokens[i]))) i += 1;
  if (i === 0 || i === tokens.length) return null;
  return { form: tokens.slice(0, i).join(' '), target: tokens.slice(i).join(' ') };
};

export const parseXref = (text, section = null) => {
  const { base, variants } = liftVariants(text);
  const { body, codes } = peelSigla(base);
  const key = fold(body);
  /* A correction wins wherever it falls ("X في الوتر صوابه Y"); otherwise
     the earliest keyword decides. */
  let best = null;
  for (const k of KINDS) {
    const m = k.re.exec(key);
    if (!m || m.index === 0) continue;
    if (best?.kind === 'correction') break;
    if (!best || k.kind === 'correction' || m.index < best.at) best = { kind: k.kind, at: m.index, end: m.index + m[0].length };
  }
  const base_out = { codes, variants };
  if (!best) {
    const split = INDEX_SECTIONS.has(section) ? splitIndexEntry(body) : null;
    if (split) return { form_ar: split.form, kind: 'same_as', target_ar: split.target, place: null, direction: null, ...base_out };
    return { form_ar: body || null, kind: 'note', target_ar: null, place: null, direction: null, ...base_out };
  }
  const target = cutTarget(body, key, best.end);
  const tail = fold(body.slice(best.at));
  const place = PLACES.find(([, re]) => re.test(fold(target)))?.[0] ?? null;
  return {
    form_ar: squash(body.slice(0, best.at)),
    kind: best.kind,
    target_ar: place ? null : target || null,
    place,
    direction: /تقدم|مضي/.test(tail) ? 'earlier' : /ياتي|تاتي/.test(tail) ? 'later' : null,
    ...base_out,
  };
};

const nameKey = (text) => fold(liftSpelling(text ?? '').tokens.join(' '))
  .replace(/(?<!\p{L})بن(?!\p{L})/gu, 'ابن')
  .replace(/\s+/g, ' ')
  .trim();

const KUNYA_RE = /(?<!\p{L})(?:ابو|ام) \p{L}+(?: \p{L}+)*/u;

/* Finds the biographies a cross-reference points to by matching the start
   of their names. A relative target ("ابن عبد الله") takes the form's given
   name; a target of "the kunyas" looks up the form's kunya there. One
   match resolves it; several are kept as candidates. */
export const makeResolver = (narrators) => {
  const keyed = narrators.map((n) => ({ id: n.id, section: n.section, key: nameKey(n.name.full_ar) }));
  const find = (wanted, pool = keyed) => pool.filter((n) => n.key === wanted || n.key.startsWith(`${wanted} `));

  const byPrefix = (tokens, pool) => {
    for (let len = tokens.length; len >= 2; len -= 1) {
      const hits = find(tokens.slice(0, len).join(' '), pool);
      if (hits.length) return hits;
    }
    return [];
  };

  /* "ابن راهويه" for Isḥāq: a name that starts with the given name and
     contains the rest somewhere, when no name starts with the whole. */
  const findWithin = (wanted) => {
    const [ism, ...rest] = wanted.split(' ');
    const tail = ` ${rest.join(' ')}`;
    return keyed.filter((n) => n.key.startsWith(`${ism} `) && (`${n.key} `).includes(`${tail} `));
  };

  const one = (target, form) => {
    let wanted = nameKey(target);
    if (/^ابن /.test(wanted) && form) wanted = `${nameKey(form).split(' ')[0]} ${wanted}`;
    if (wanted.split(' ').length < 2) return [];
    const hits = find(wanted);
    return hits.length ? hits : findWithin(wanted);
  };

  return ({ target_ar: target, form_ar: form, place }) => {
    const context = nameKey(form).split(' ').slice(1).filter((w) => w.length > 2 && w !== 'ابن');
    if (place === 'kunya' && form) {
      const kunya = KUNYA_RE.exec(nameKey(form));
      if (!kunya) return { ids: [], status: 'no_target' };
      const pool = keyed.filter((n) => /kunya/.test(n.section));
      return verdict(byPrefix(kunya[0].split(' '), pool), context);
    }
    if (!target) return { ids: [], status: 'no_target' };
    const parts = fold(target).includes(' او ') ? target.split(/\s+(?:أو|او)\s+/) : [target];
    const hits = [...new Map(parts.flatMap((p) => one(p, form)).map((h) => [h.id, h])).values()];
    if (!hits.length && nameKey(target).split(' ').length < 2) return { ids: [], status: 'too_short' };
    return verdict(hits, parts.length > 1 ? [] : context);
  };
};

/* Several candidates: the one sharing the most words with the form
   (a nisba, a teacher's name) wins if it is alone at the top. */
const verdict = (hits, context = []) => {
  if (hits.length === 1) return { ids: [hits[0].id], status: 'resolved' };
  if (hits.length === 0) return { ids: [], status: 'not_found' };
  const scored = hits.map((h) => ({ h, score: context.filter((w) => ` ${h.key} `.includes(` ${w} `)).length }));
  const top = Math.max(...scored.map((s) => s.score));
  const best = scored.filter((s) => s.score === top);
  if (top > 0 && best.length === 1) return { ids: [best[0].h.id], status: 'resolved_by_context' };
  return { ids: hits.slice(0, 12).map((h) => h.id), status: 'ambiguous' };
};
