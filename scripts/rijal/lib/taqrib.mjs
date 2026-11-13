/* Turns the Shamela page records of Taqrīb al-Tahdhīb into rijal records:
   one per biography, one per cross-reference, plus the reference tables
   and a report of what the parser could not settle. Pure: no file access. */
import { squash } from './arabic.mjs';
import { glossesByNumber, glossYear } from './english.mjs';
import {
  centuryHintOf, deathAt, inlineNumberVariants, liftVariants, peelSigla, qualifiersOf, readBirth, readDeath,
  readGeneration, readGrade, readRelations,
} from './fields.mjs';
import { parseName } from './names.mjs';
import { segment } from './segment.mjs';
import { GENERATIONS, RANKS, SECTIONS, SIGLA, SIGLA_GROUPS, TAMYIZ } from './vocab.mjs';
import { makeResolver, parseXref } from './xrefs.mjs';

const GENDER = Object.fromEntries(SECTIONS.map((s) => [s.id, s.gender]));

const appearancesOf = (codes) => {
  const listed = codes.filter((c) => c !== TAMYIZ);
  const expanded = [...new Set(listed.flatMap((c) => SIGLA_GROUPS[c]?.codes ?? [c]))];
  return { codes: listed, works: expanded.filter((c) => SIGLA[c]) };
};

/* Dates are read from the text with number-only brackets kept inline. A
   year whose hundreds come only from such a bracket is marked
   `stated_variant`. */
const readDeathWithVariants = (text, { generationN, companion, fallback }) => {
  const inlined = inlineNumberVariants(text);
  const { body } = peelSigla(inlined.text);
  const generation = readGeneration(body);
  const verbAt = deathAt(body);
  const after = generation ? body.slice(generation.end) : verbAt >= 0 ? body.slice(verbAt) : '';
  const opts = { generationN, companion, centuryHint: centuryHintOf(text.slice(Math.max(0, deathAt(text)))) };
  const death = readDeath(after || fallback, opts);
  if (!death || !inlined.found || death.basis !== 'stated') return death;
  const { base } = liftVariants(text);
  const plainDeath = readDeath(base.slice(Math.max(0, deathAt(base))), opts);
  return plainDeath?.basis === 'stated' ? death : { ...death, basis: 'stated_variant' };
};

/* "[مقبول]": when only the Abū al-Ashbāl reading gives a grade, use it and
   say so. The name boundary still comes from the ʿAwwāma text. */
const withVariantGrade = (grade, variants) => {
  if (grade.assessment.rank != null) return grade;
  const fromVariant = variants
    .filter((v) => v.kind === 'text')
    .map((v) => readGrade(v.text).assessment)
    .find((a) => a.rank != null && a.basis === 'term');
  if (!fromVariant) return grade;
  return { ...grade, assessment: { ...fromVariant, basis: 'variant', needs_review: false } };
};

/* The grade normally sits between the name and the generation. Some
   tamyīz entries give it after the generation ("من السابعة مجهول"); then
   the name still ends at the generation. */
const gradeOf = (body, generation, verbAt, variants) => {
  const regionEnd = generation ? generation.at : verbAt >= 0 ? verbAt : body.length;
  const before = withVariantGrade(readGrade(body.slice(0, regionEnd)), variants);
  if (before.assessment.rank != null || !generation) return before;
  const tailEnd = verbAt > generation.end ? verbAt : body.length;
  const after = readGrade(body.slice(generation.end, tailEnd));
  if (after.assessment.rank == null) return before;
  return { at: Math.min(before.at, generation.at), assessment: { ...after.assessment, needs_review: true } };
};

/* Reads one numbered biography. */
export const parseEntry = (text) => {
  const { base, variants } = liftVariants(text);
  const { body, codes, tamyiz } = peelSigla(base);
  const generation = readGeneration(body);
  const verbAt = deathAt(body);
  const grade = gradeOf(body, generation, verbAt, variants);
  const nameText = squash(body.slice(0, grade.at));
  const after = generation ? body.slice(generation.end) : verbAt >= 0 ? body.slice(verbAt) : '';
  const notes = squash(after) || null;
  const assessment = {
    ...grade.assessment,
    qualifiers: [...new Set([...grade.assessment.qualifiers, ...(notes ? qualifiersOf(notes) : [])])],
  };
  const death = readDeathWithVariants(text, {
    generationN: generation?.n ?? null,
    companion: assessment.companion,
    fallback: body.slice(grade.at),
  });
  const { at, end, ...generationOut } = generation ?? {};
  return {
    name: { full_ar: nameText || null, ...parseName(nameText) },
    assessment,
    generation: generation ? generationOut : null,
    death,
    birth: readBirth(body),
    appearances: { ...appearancesOf(codes), tamyiz },
    relations: readRelations(body),
    notes_ar: notes,
    variants,
  };
};

const idFor = (no, seen) => {
  const count = (seen.get(no) ?? 0) + 1;
  seen.set(no, count);
  return { id: count === 1 ? `taqrib-${no}` : `taqrib-${no}-${count}`, occurrence: count - 1 };
};

const resolveRelations = (narrators) => narrators.map((n, i) => ({
  ...n,
  relations: n.relations.map((r) => ({
    ...r,
    target_id: (r.direction === 'previous' ? narrators[i - 1] : narrators[i + 1])?.id ?? null,
  })),
}));

const numbering = (narrators) => {
  const nos = narrators.map((n) => n.taqrib_no);
  const dups = [...new Set(nos.filter((n, i) => nos.indexOf(n) !== i))];
  const max = Math.max(...nos);
  const have = new Set(nos);
  const missing = Array.from({ length: max }, (_, i) => i + 1).filter((n) => !have.has(n));
  const backwards = nos.filter((n, i) => i > 0 && n < nos[i - 1]);
  return { max, duplicates: dups, missing, out_of_order: backwards };
};

export const buildTaqrib = (sourceRecords) => {
  const { items, intro, colophon } = segment(sourceRecords);
  const glosses = glossesByNumber(sourceRecords);
  const seen = new Map();
  const texts = {};
  let lastId = null;

  const parsed = [];
  const xrefItems = [];
  for (const item of items) {
    if (item.kind === 'entry') {
      const { id, occurrence } = idFor(item.no, seen);
      texts[id] = { ar: item.raw, en: glosses.get(item.no)?.[occurrence] ?? null };
      parsed.push({
        id,
        taqrib_no: item.no,
        section: item.section,
        gender: GENDER[item.section],
        letter: item.letter,
        group: item.group,
        pages: item.pages,
        serials: item.serials,
        ...parseEntry(item.text),
      });
      lastId = id;
    } else if (item.kind === 'xref') {
      xrefItems.push({ item, after: lastId });
    }
  }

  const narrators = resolveRelations(parsed);
  const resolve = makeResolver(narrators);
  const aliases = xrefItems.map(({ item, after }, i) => {
    const x = parseXref(item.text, item.section);
    const found = resolve(x);
    return {
      id: `taqrib-x${String(i + 1).padStart(4, '0')}`,
      ...x,
      target_ids: found.ids,
      resolution: found.status,
      after_id: after,
      section: item.section,
      pages: item.pages,
      raw_ar: item.raw,
    };
  });

  const vocab = {
    sigla: SIGLA,
    sigla_groups: SIGLA_GROUPS,
    generations: GENERATIONS,
    ranks: RANKS,
    sections: SECTIONS.map(({ opens, ...s }) => s),
    intro_ar: intro.map((r) => r.text),
    colophon_ar: colophon,
  };

  return { narrators, aliases, texts, vocab, report: makeReport(narrators, aliases, texts) };
};

const countBy = (list, fn) => list.reduce((acc, x) => {
  const k = String(fn(x));
  return { ...acc, [k]: (acc[k] ?? 0) + 1 };
}, {});

const makeReport = (narrators, aliases, texts) => {
  const review = narrators.flatMap((n) => {
    const reasons = [];
    if (n.assessment.needs_review) reasons.push(n.assessment.rank == null ? 'no_grade' : 'grade_inferred');
    if (!n.generation && !n.assessment.companion) reasons.push('no_generation');
    if (n.death && (n.death.basis === 'unresolved' || n.death.basis === 'none')) reasons.push('death_unresolved');
    if (!n.appearances.codes.length && !n.appearances.tamyiz) reasons.push('no_sigla');
    if (!n.name.full_ar) reasons.push('no_name');
    return reasons.length ? [{ id: n.id, reasons }] : [];
  });
  const yearChecks = narrators.filter((n) => n.death?.year_ah != null && glossYear(texts[n.id].en) != null);
  const yearDisagree = yearChecks.filter((n) => glossYear(texts[n.id].en) !== n.death.year_ah);
  return {
    narrators: narrators.length,
    aliases: aliases.length,
    numbering: numbering(narrators),
    /* Biographies only the Abū al-Ashbāl edition has ("[7117- ...]"). */
    variant_entries: narrators.flatMap((n) => n.variants
      .map((v) => /^(\d{1,4})- (.*)$/.exec(v.text))
      .filter(Boolean)
      .map((m) => ({ no: Number(m[1]), inside: n.id, text_ar: m[2] }))),
    by_section: countBy(narrators, (n) => n.section),
    by_rank: countBy(narrators, (n) => n.assessment.rank),
    grade_basis: countBy(narrators, (n) => n.assessment.basis),
    with_generation: narrators.filter((n) => n.generation).length,
    with_death: narrators.filter((n) => n.death).length,
    death_basis: countBy(narrators.filter((n) => n.death), (n) => n.death.basis),
    with_sigla: narrators.filter((n) => n.appearances.codes.length || n.appearances.tamyiz).length,
    with_english: narrators.filter((n) => texts[n.id].en).length,
    death_year_vs_english: { compared: yearChecks.length, disagree: yearDisagree.map((n) => n.id) },
    alias_kinds: countBy(aliases, (a) => a.kind),
    alias_resolution: countBy(aliases, (a) => a.resolution),
    review_count: review.length,
    review,
  };
};
