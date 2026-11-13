/* Writes the list pages of the narrators register as editable HTML. Each
   name is a <details>: without script it opens in place, with script the
   page shows its contents in a dialog. Cross-references stay where the
   book has them, as rows that link to the biography they point to. */
import { fold } from './arabic.mjs';
import { planPages } from './pages.mjs';
import { GENERATIONS, RANKS, SECTIONS, SIGLA, SIGLA_GROUPS } from './vocab.mjs';

export const BASE = '/projects/rijal/';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ar = (s, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} lang="ar" dir="rtl">${esc(s)}</${tag}>`;

const RANK_SHORT = {
  1: 'Companion', 2: 'Reliable, emphatic', 3: 'Reliable', 4: 'Truthful', 5: 'Truthful, with errors',
  6: 'Acceptable', 7: 'Unestablished', 8: 'Weak', 9: 'Unknown', 10: 'Abandoned', 11: 'Accused of lying', 12: 'Liar',
};

const QUALIFIER_EN = {
  tadlis: 'tadlīs', mixed_late: 'ikhtilāṭ (late decline)', errors: 'errors', poor_memory: 'weak memory',
  qadar: 'qadar', tashayyu: 'tashayyuʿ', rafd: 'rafḍ', irja: 'irjāʾ', nasb: 'naṣb', khawarij: 'Khārijī views',
  jahmiyya: 'Jahmī views', ascetic: 'devout', jurist: 'jurist', hafiz: 'ḥāfiẓ',
};

const RELATION_EN = {
  grandson_of: 'Grandson of', son_of: 'Son of', father_of: 'Father of', brother_of: 'Brother of',
  sister_of: 'Sister of', nephew_of: 'Nephew of', cousin_of: 'Cousin of', uncle_of: 'Uncle of',
  client_of: 'Client of', husband_of: 'Husband of', wife_of: 'Wife of', daughter_of: 'Daughter of',
  mother_of: 'Mother of', same_as: 'Same person as', distinct_from: 'Not the same as',
};

const XREF_EN = { same_as: 'is', correction: 'correctly', see: 'see', note: '' };
const PLACE_EN = { kunya: 'the kunyas', names: 'the given names', nisbas: 'the nisbas', nicknames: 'the nicknames', group: 'its name group' };
const SECTION_EN = Object.fromEntries(SECTIONS.map((s) => [s.id, s.en]));
const SECTION_EN_EXTRA = { laqab_index: 'Nicknames', nisba_index: 'Nisbas' };

const ordinal = (n) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;

/* The translator's line starts with the name: "2142- Zayd b. Ẓabyān (with
   fatḥa ...), al-Kūfī: acceptable; ...". Spelling notes in parentheses go. */
export const englishName = (gloss) => {
  if (!gloss) return null;
  const line = gloss.split('\n')[0].replace(/^\s*\[?\d{1,4}\]?\s*[-.–:]\s*/, '').replace(/\s*\([^)]*\)/g, '');
  const m = /^(.*?)(?::|;|(?<!\bbt?)\.(?:\s|$)|,\s(?:truthful|trustworthy|acceptable|unknown|weak|companion|reliable)\b)/i.exec(line);
  const name = (m ? m[1] : line).trim().replace(/[,.\s]+$/, '');
  return name && name.length <= 160 ? name : null;
};

const searchKey = (...parts) => parts
  .filter(Boolean)
  .map((p) => fold(String(p)).normalize('NFD').replace(/[̀-ًͯ-ْʿʾ'’‘`]/g, '').toLowerCase())
  .join(' ');

const deathLine = (d, gen) => {
  if (!d) return null;
  const pre = { before: 'before ', after: 'after ', circa: 'c. ', or_after: '', or_before: '' }[d.qualifier] ?? '';
  const post = { or_after: ' or later', or_before: ' or earlier' }[d.qualifier] ?? '';
  const years = d.alternatives.length ? d.alternatives.join(' or ') : d.year_ah;
  const manner = d.manner ? ` (${d.manner})` : '';
  const year = years != null ? `${pre}${years}${post} AH${manner}` : null;
  const notes = {
    inferred: `century added by Ibn Ḥajar's rule for the ${ordinal(gen ?? 0)} generation`,
    stated_variant: 'century given in the Abū al-Ashbāl edition',
    stated_century: 'the text marks this as before the century',
    unresolved: 'century not stated',
  };
  return { year, note: notes[d.basis] ?? null, short: years != null ? `d. ${pre}${d.alternatives.length ? d.alternatives[0] : years}` : null };
};

const worksLine = (codes) => {
  const groups = codes.filter((c) => SIGLA_GROUPS[c]).map((c) => SIGLA_GROUPS[c].label);
  const singles = codes.filter((c) => SIGLA[c]).map((c) => SIGLA[c].work);
  return [...groups, ...singles];
};

const nameParts = (name) => [
  ['Kunya', name.kunya], ['Nisba', name.nisbas], ['Nickname', name.laqab], ['Lived in', name.residence],
  ['Client of', name.wala], ['Office', name.office],
].filter(([, v]) => v.length);

const link = (id, ctx, label) => {
  const page = ctx.pageOf.get(id);
  return page ? `<a href="${BASE}${page}/#${esc(id)}" data-rj-link="${esc(id)}">${label}</a>` : label;
};

const displayName = (id, ctx) => {
  const n = ctx.byId.get(id);
  const en = englishName(ctx.texts[id]?.en);
  return en ? esc(en) : ar(n?.name.full_ar ?? id);
};

const fact = (term, body) => (body ? `<div><dt>${term}</dt><dd>${body}</dd></div>` : '');

const renderBody = (n, ctx) => {
  const a = n.assessment;
  const g = n.generation;
  const gen = g ? GENERATIONS.find((x) => x.n === g.n) : null;
  const death = deathLine(n.death, g?.n);
  const rank = a.rank ? RANKS.find((r) => r.rank === a.rank) : null;
  const grade = a.phrase_ar
    ? `${ar(a.phrase_ar, 'span', 'rj-quote')}${rank ? `<span class="rj-gloss">${esc(rank.en[0].toUpperCase() + rank.en.slice(1))}: rank ${a.rank} of 12${a.basis === 'inferred' ? ', read from his wording' : a.basis === 'variant' ? ', from the Abū al-Ashbāl edition' : ''}</span>` : '<span class="rj-gloss">No rank of Ibn Ḥajar’s own; see the entry</span>'}`
    : null;
  const works = worksLine(n.appearances.codes);
  const relations = n.relations.filter((r) => r.target_id)
    .map((r) => `${RELATION_EN[r.type]} ${link(r.target_id, ctx, displayName(r.target_id, ctx))}`);
  const also = (ctx.aliasesTo.get(n.id) ?? []).map((x) => ar(x.form_ar));
  const text = ctx.texts[n.id] ?? {};
  const variants = n.variants.filter((v) => v.kind === 'text').map((v) => ar(v.text));
  return [
    '<div class="rj-body" data-pagefind-ignore>',
    '<dl class="rj-facts">',
    fact('Grade', grade),
    fact('Generation', g ? `${ordinal(g.n)}${g.tier ? ` (${g.tier})` : ''}: ${esc(gen.en)}` : null),
    fact('Died', death?.year ? `${esc(death.year)}${death.note ? `<span class="rj-gloss">${esc(death.note)}</span>` : ''}` : n.death ? ar(n.death.phrase_ar) : null),
    fact('Born', n.birth ? `${n.birth.as_written}${n.birth.century_stated ? ' AH' : ' (as written)'}` : null),
    fact('Appears in', works.length ? esc(works.join(', ')) : n.appearances.tamyiz ? 'None of these books; listed to tell him apart from a namesake (tamyīz)' : null),
    ...nameParts(n.name).map(([label, v]) => fact(label, v.map((x) => ar(x)).join('، '))),
    fact('Noted', a.qualifiers.length ? esc(a.qualifiers.map((q) => QUALIFIER_EN[q] ?? q).join(', ')) : null),
    fact('Related', relations.length ? relations.join('<br>') : null),
    fact('Also listed as', also.length ? also.join('، ') : null),
    '</dl>',
    '<div class="rj-texts">',
    `<p class="rj-label">Ibn Ḥajar’s entry</p>${ar(text.ar, 'p', 'rj-arabic')}`,
    text.en ? `<p class="rj-label">Translation</p><p class="rj-english">${esc(text.en).replace(/\n/g, '<br>')}</p>` : '',
    variants.length ? `<p class="rj-label">Abū al-Ashbāl edition adds</p><p class="rj-variants">${variants.join(' · ')}</p>` : '',
    '</div>',
    `<p class="rj-source">Taqrīb al-Tahdhīb no. ${n.taqrib_no}, ed. ʿAwwāma, p. ${n.pages.start}${n.pages.end !== n.pages.start ? `–${n.pages.end}` : ''}</p>`,
    '</div>',
  ].join('');
};

const renderEntry = (n, ctx) => {
  const en = englishName(ctx.texts[n.id]?.en);
  const a = n.assessment;
  const death = deathLine(n.death, n.generation?.n);
  const meta = [
    a.rank ? `<span class="rj-grade" data-rank="${a.rank}">${esc(RANK_SHORT[a.rank])}</span>` : '<span class="rj-grade" data-rank="0">Not graded</span>',
    n.generation ? `<span>${ordinal(n.generation.n)} gen.</span>` : '',
    death?.short ? `<span>${esc(death.short)}</span>` : '',
  ].join('');
  return [
    `<li class="rj-row" id="${esc(n.id)}" data-rank="${a.rank ?? 0}" data-search="${esc(searchKey(en, n.name.full_ar, n.taqrib_no))}">`,
    '<details class="rj-entry"><summary>',
    `<span class="rj-no">${n.taqrib_no}</span>`,
    `<span class="rj-name">${en ? `<span class="rj-name__en">${esc(en)}</span>` : ''}${ar(n.name.full_ar ?? '', 'span', 'rj-name__ar')}</span>`,
    `<span class="rj-meta">${meta}</span>`,
    '</summary>',
    renderBody(n, ctx),
    '</details></li>',
  ].join('');
};

const renderXref = (x, ctx) => {
  const target = x.target_ids.length === 1
    ? link(x.target_ids[0], ctx, displayName(x.target_ids[0], ctx))
    : x.target_ar ? ar(x.target_ar) : x.place ? `in ${PLACE_EN[x.place]}` : '';
  const verb = XREF_EN[x.kind] ?? '';
  return `<li class="rj-xref" data-search="${esc(searchKey(x.form_ar, x.target_ar))}">${ar(x.form_ar ?? x.raw_ar, 'span', 'rj-xref__form')}${verb || target ? `<span class="rj-xref__to">${verb ? `${esc(verb)} ` : ''}${target}</span>` : ''}</li>`;
};

const renderPage = (page, ctx) => {
  const items = [];
  if (page === ctx.firstPage) for (const x of ctx.aliasesAfter.get(null) ?? []) items.push({ kind: 'x', section: x.section, x });
  for (const id of page.ids) {
    const n = ctx.byId.get(id);
    items.push({ kind: 'n', section: n.section, n });
    for (const x of ctx.aliasesAfter.get(id) ?? []) items.push({ kind: 'x', section: x.section, x });
  }
  const sections = [];
  for (const item of items) {
    const last = sections.at(-1);
    if (page.kind === 'group' && (!last || last.section !== item.section)) sections.push({ section: item.section, items: [item] });
    else if (!last) sections.push({ section: null, items: [item] });
    else last.items.push(item);
  }
  const body = sections.map((s) => {
    const title = s.section ? SECTION_EN_EXTRA[s.section] ?? SECTION_EN[s.section] : null;
    const rows = s.items.map((it) => (it.kind === 'n' ? renderEntry(it.n, ctx) : renderXref(it.x, ctx))).join('\n');
    return `<section class="rj-section"${s.section ? ` data-section="${s.section}"` : ''}>${title ? `<h2 class="rj-section__title">${esc(title)}</h2>` : ''}\n<ol class="rj-list">\n${rows}\n</ol></section>`;
  }).join('\n');
  return `<!-- Generated by scripts/rijal/build-taqrib-rijal.mjs from Taqrīb al-Tahdhīb (Shamela 8609). Edit freely; a rebuild overwrites it. -->\n${body}\n`;
};

/* Returns { manifest, files } where files maps a page slug to its HTML. */
export const renderRegister = ({ narrators, aliases, texts }) => {
  const pages = planPages(narrators);
  const byId = new Map(narrators.map((n) => [n.id, n]));
  const pageOf = new Map(pages.flatMap((p) => p.ids.map((id) => [id, p.slug])));
  const aliasesAfter = new Map();
  const aliasesTo = new Map();
  for (const x of aliases) {
    aliasesAfter.set(x.after_id, [...(aliasesAfter.get(x.after_id) ?? []), x]);
    if (x.target_ids.length === 1 && x.form_ar) aliasesTo.set(x.target_ids[0], [...(aliasesTo.get(x.target_ids[0]) ?? []), x]);
  }
  const ctx = { byId, texts, pageOf, aliasesAfter, aliasesTo, firstPage: pages[0] };
  const files = Object.fromEntries(pages.map((p) => [p.slug, renderPage(p, ctx)]));
  const manifest = pages.map(({ ids, ...p }) => ({
    ...p,
    count: ids.length,
    first: ids[0],
    graded: ids.filter((id) => byId.get(id).assessment.rank != null).length,
  }));
  return { manifest, files };
};
