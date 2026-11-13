/* Tests for the Taqrīb al-Tahdhīb rijal parser.
   Run: npm run test:rijal
   With TAQRIB_SOURCE set to the bilingual Shamela export (book 8609), the
   whole book is also parsed and checked against known counts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fold } from './arabic.mjs';
import { glossesByNumber, glossYear } from './english.mjs';
import {
  inlineNumberVariants, liftVariants, peelSigla, readDeath, readGeneration, readGrade, readRelations,
} from './fields.mjs';
import { parseName } from './names.mjs';
import { readAlternatives, valueOf } from './numbers.mjs';
import { englishName, renderRegister } from './html.mjs';
import { PAGE_LIMIT, planPages } from './pages.mjs';
import { segment } from './segment.mjs';
import { buildTaqrib, parseEntry } from './taqrib.mjs';
import { makeResolver, parseXref } from './xrefs.mjs';

const years = (text) => readAlternatives(fold(text).split(' ')).alternatives.map(valueOf);

/* ── Numbers ───────────────────────────────────────────────────── */

test('number words read as Ibn Ḥajar writes years', () => {
  assert.deepEqual(years('ست وثلاثين'), [36]);
  assert.deepEqual(years('خمس ومائة'), [105]);
  assert.deepEqual(years('ثلاث وثلاثمائة'), [303]);
  assert.deepEqual(years('اثنتي عشرة'), [12]);
  assert.deepEqual(years('مائتين'), [200]);
});

test('alternative years share the tens and hundreds they leave out', () => {
  assert.deepEqual(years('ست أو سبع وثمانين'), [86, 87]);
  assert.deepEqual(years('خمس وقيل ست وتسعين'), [95, 96]);
  assert.deepEqual(years('ثلاث أو أربع ومائة'), [103, 104]);
  assert.deepEqual(years('مائتين أو إحدى'), [200, 201]);
  assert.deepEqual(years('ثلاث وتسعين وقيل سنة اثنتين ومائتين'), [93, 202]);
});

/* ── Fields ────────────────────────────────────────────────────── */

test('source codes are peeled from the end, tamyīz included', () => {
  assert.deepEqual(peelSigla('زيد ثقة من الرابعة د ت عس ق'), {
    body: 'زيد ثقة من الرابعة', codes: ['د', 'ت', 'عس', 'ق'], tamyiz: false,
  });
  assert.equal(peelSigla('زيد مقبول من الحادية عشرة تمييز').tamyiz, true);
});

test('variant readings are lifted, number-only ones can be inlined', () => {
  const { base, variants } = liftVariants('زيد [الهاشمي] ثقة [خ]');
  assert.equal(base, 'زيد ثقة');
  assert.deepEqual(variants, [{ text: 'الهاشمي', kind: 'text' }, { text: 'خ', kind: 'sigla' }]);
  assert.deepEqual(inlineNumberVariants('مات سنة سبع وتسعين [ومائة] [الهاشمي] خ'), {
    text: 'مات سنة سبع وتسعين ومائة خ', found: true,
  });
});

test('generations keep their tier', () => {
  assert.equal(readGeneration('ثقة من الثانية عشرة').n, 12);
  const g = readGeneration('ضعيف من كبار العاشرة مات');
  assert.equal(g.n, 10);
  assert.equal(g.tier, 'senior');
});

test('grades map to the twelve ranks', () => {
  const rank = (t) => readGrade(t).assessment;
  assert.equal(rank('الكوفي ثقة').rank, 3);
  assert.equal(rank('الكوفي ثقة').basis, 'term');
  assert.equal(rank('البصري ثقة حافظ').rank, 2);
  assert.equal(rank('صدوق يخطىء').rank, 5);
  assert.equal(rank('صدوق').rank, 4);
  assert.equal(rank('مقبول').rank, 6);
  assert.equal(rank('لين الحديث').rank, 6);
  assert.equal(rank('مجهول الحال').rank, 7);
  assert.equal(rank('لا يعرف حاله').rank, 7);
  assert.equal(rank('مجهولة').rank, 9);
  assert.equal(rank('متروك').rank, 10);
  assert.equal(rank('كذاب').rank, 12);
  const companion = rank('البهزي صحابي له حديث');
  assert.equal(companion.rank, 1);
  assert.equal(companion.companion, true);
});

test('the grade phrase marks where the name ends', () => {
  const g = readGrade('أحمد ابن بديل اليامي قاضي الكوفة صدوق له أوهام');
  assert.equal(g.assessment.phrase_ar, 'صدوق له أوهام');
  assert.equal(g.assessment.rank, 5);
  assert.deepEqual(g.assessment.qualifiers, ['errors']);
  assert.equal('أحمد ابن بديل اليامي قاضي الكوفة صدوق له أوهام'.slice(0, g.at).trim(), 'أحمد ابن بديل اليامي قاضي الكوفة');
});

test('an office named "imam" is not a grade', () => {
  const g = readGrade('إمام مسجد سلمية صدوق').assessment;
  assert.equal(g.rank, 4);
});

test('another critic\'s verdict opens the phrase without a rank', () => {
  const g = readGrade('إسحاق ابن يعقوب البغدادي وثقه النسائي').assessment;
  assert.equal(g.rank, null);
  assert.equal(g.basis, 'attributed');
  assert.equal(g.phrase_ar, 'وثقه النسائي');
});

test('death years take their century from the generation', () => {
  const d = readDeath('فقتل بالكوفة سنة اثنتين وعشرين وكان مولده سنة ثمانين', { generationN: 4 });
  assert.equal(d.year_ah, 122);
  assert.equal(d.basis, 'inferred');
  assert.equal(d.manner, 'killed');
  assert.equal(readDeath('مات سنة أربع وخمسين', { companion: true }).year_ah, 54);
  assert.equal(readDeath('مات سنة ست وثلاثين', { generationN: 10 }).year_ah, 236);
  const stated = readDeath('مات سنة ثلاث وثلاثمائة وله ثمان وثمانون سنة', { generationN: 11 });
  assert.equal(stated.year_ah, 303);
  assert.equal(stated.basis, 'stated');
  assert.equal(stated.age, 88);
  assert.equal(readDeath('مات قبل المائتين', { generationN: 10 }).qualifier, 'before');
  assert.equal(readDeath('من الثالثة'), null);
});

test('alternative death years and "or after"', () => {
  const d = readDeath('مات سنة ست أو سبع وثمانين', { generationN: 8 });
  assert.equal(d.year_ah, 186);
  assert.deepEqual(d.alternatives, [186, 187]);
  assert.equal(readDeath('مات سنة سبع عشرة أو بعدها', { generationN: 11 }).qualifier, 'or_after');
});

test('relations to neighboring entries', () => {
  assert.deepEqual(readRelations('أبو الحسين حفيد الذي قبله مقبول'), [{ type: 'grandson_of', direction: 'previous' }]);
  assert.deepEqual(readRelations('ووهم من زعم أنه هو الذي قبله'), [{ type: 'distinct_from', direction: 'previous' }]);
});

/* ── Names ─────────────────────────────────────────────────────── */

test('names split into their parts, spelling notes kept apart', () => {
  const n = parseName('أحمد ابن إسحاق ابن الحصين ابن جابر السلمي أبو إسحاق السرماري بضم المهملة وبفتحها');
  assert.equal(n.ism, 'أحمد');
  assert.deepEqual(n.nasab, ['إسحاق', 'الحصين', 'جابر']);
  assert.deepEqual(n.kunya, ['أبو إسحاق']);
  assert.deepEqual(n.nisbas, ['السلمي', 'السرماري']);
  assert.equal(n.spelling[0].word, 'السرماري');
  const z = parseName('زيد ابن أبي عتاب الشامي مولى معاوية نزيل بغداد');
  assert.deepEqual(z.nasab, ['أبي عتاب']);
  assert.deepEqual(z.wala, ['معاوية']);
  assert.deepEqual(z.residence, ['بغداد']);
  const k = parseName('أم أبان بنت الوازع ابن الزارع');
  assert.equal(k.ism, null);
  assert.deepEqual(k.kunya, ['أم أبان']);
  assert.deepEqual(k.nasab, ['الوازع', 'الزارع']);
  assert.deepEqual(parseName('زيد ابن ضميرة ويقال ابن حمزة').alternatives, ['ويقال ابن حمزة']);
});

/* ── Whole entries ─────────────────────────────────────────────── */

test('a full biography', () => {
  const e = parseEntry('زيد ابن علي ابن الحسين ابن علي ابن أبي طالب [الهاشمي] أبو الحسين المدني ثقة من الرابعة وهو الذي ينسب إليه الزيدية خرج في خلافة هشام ابن عبد الملك فقتل بالكوفة سنة اثنتين وعشرين وكان مولده سنة ثمانين د ت عس ق');
  assert.equal(e.name.full_ar, 'زيد ابن علي ابن الحسين ابن علي ابن أبي طالب أبو الحسين المدني');
  assert.equal(e.assessment.rank, 3);
  assert.equal(e.generation.n, 4);
  assert.equal(e.death.year_ah, 122);
  assert.deepEqual(e.birth, { as_written: 80, century_stated: false });
  assert.deepEqual(e.appearances.codes, ['د', 'ت', 'عس', 'ق']);
  assert.deepEqual(e.appearances.works, ['د', 'ت', 'عس', 'ق']);
  assert.deepEqual(e.variants, [{ text: 'الهاشمي', kind: 'text' }]);
});

test('group codes expand to the books they stand for', () => {
  assert.deepEqual(parseEntry('فلان ثقة من الثالثة ع').appearances.works, ['خ', 'م', 'د', 'ت', 'س', 'ق']);
  assert.deepEqual(parseEntry('فلان ثقة من الثالثة 4').appearances.works, ['د', 'ت', 'س', 'ق']);
});

test('a century supplied by the other edition is marked', () => {
  const e = parseEntry('فلان صدوق ربما أخطأ من التاسعة مات سنة سبع وتسعين [ومائة] خ');
  assert.equal(e.death.year_ah, 197);
  assert.equal(e.death.basis, 'stated_variant');
  const early = parseEntry('فلان مقبول من الثالثة مات [دون المائة] سنة ست وخمسين ت ق');
  assert.equal(early.death.year_ah, 56);
  assert.equal(early.death.basis, 'stated_century');
});

test('a grade given after the generation is still read', () => {
  const e = parseEntry('إسماعيل ابن مسلم الطائي من السابعة مجهول تمييز');
  assert.equal(e.assessment.rank, 9);
  assert.equal(e.name.full_ar, 'إسماعيل ابن مسلم الطائي');
  assert.equal(e.appearances.tamyiz, true);
});

/* ── Segmenting ────────────────────────────────────────────────── */

const page = (n, text, en = '') => ({ serial_number: String(1000 + n), page_number: String(n), text, text_en: en });

const FIXTURE = [
  page(1, 'مقدمة الكتاب'),
  page(2, 'حرف الألف ذكر من اسمه أحمد 1- أحمد ابن فلان ثقة من العاشرة د 2- أحمد ابن علان صدوق', '1- Aḥmad b. Fulān: reliable.\n2- Aḥmad b. ʿAllān: truthful,'),
  page(3, 'من الحادية عشرة مات سنة خمسين س [] أحمد التيمي هو أحمد ابن فلان باب الكنى 3- أبو بكر الكوفي مجهول من الثالثة ت آخر الكتاب فرغ', 'eleventh generation; died 250 AH.\n[] al-Taymī is Aḥmad b. Fulān.\n3. Abū Bakr al-Kūfī: unknown.'),
];

test('segment joins pages and follows the sections', () => {
  const { items, intro, colophon } = segment(FIXTURE);
  assert.equal(intro.length, 1);
  assert.match(colophon, /^آخر الكتاب/);
  const entries = items.filter((i) => i.kind === 'entry');
  assert.deepEqual(entries.map((e) => e.no), [1, 2, 3]);
  assert.deepEqual(entries[1].pages, { start: 2, end: 3 });
  assert.deepEqual(entries[1].serials, ['1002', '1003']);
  assert.equal(entries[0].letter, 'حرف الألف');
  assert.equal(entries[2].section, 'men_kunya');
  assert.equal(items.filter((i) => i.kind === 'xref').length, 1);
});

test('English glosses follow their entry across a page break', () => {
  const g = glossesByNumber(FIXTURE);
  assert.equal(g.get(2)[0], '2- Aḥmad b. ʿAllān: truthful,\neleventh generation; died 250 AH.');
  assert.equal(g.get(3)[0], '3. Abū Bakr al-Kūfī: unknown.');
  assert.equal(glossYear(g.get(2)[0]), 250);
  assert.equal(glossYear('died [before 100 AH] in 92 AH aged 40'), 92);
});

test('buildTaqrib links cross-references and neighbors', () => {
  const { narrators, aliases, report } = buildTaqrib(FIXTURE);
  assert.deepEqual(narrators.map((n) => n.id), ['taqrib-1', 'taqrib-2', 'taqrib-3']);
  assert.equal(narrators[1].death.year_ah, 250);
  assert.equal(narrators[2].gender, 'm');
  assert.equal(aliases[0].kind, 'same_as');
  assert.deepEqual(aliases[0].target_ids, ['taqrib-1']);
  assert.equal(aliases[0].after_id, 'taqrib-2');
  assert.deepEqual(report.numbering.duplicates, []);
});

/* ── Cross-references ──────────────────────────────────────────── */

test('cross-reference kinds and targets', () => {
  const c = parseXref('أحمد ابن إبراهيم التيمي [كذا ذكره صاحب الكمال] صوابه إبراهيم ابن محمد');
  assert.equal(c.kind, 'correction');
  assert.equal(c.form_ar, 'أحمد ابن إبراهيم التيمي');
  assert.equal(c.target_ar, 'إبراهيم ابن محمد');
  const s = parseXref('إياس ابن ثعلبة أبو أمامة البلوي يأتي في الكنى');
  assert.equal(s.place, 'kunya');
  assert.equal(s.direction, 'later');
  const idx = parseXref('الأصمعي عبد الملك ابن قريب', 'nisba_index');
  assert.deepEqual([idx.form_ar, idx.kind, idx.target_ar], ['الأصمعي', 'same_as', 'عبد الملك ابن قريب']);
});

test('the resolver uses the form for relative targets and context', () => {
  const people = [
    { id: 'a', section: 'men_ism', name: { full_ar: 'أحمد ابن نصر المقرئ' } },
    { id: 'b', section: 'men_ism', name: { full_ar: 'أحمد ابن نصر النيسابوري' } },
    { id: 'c', section: 'men_kunya', name: { full_ar: 'أبو أمامة البلوي' } },
  ];
  const resolve = makeResolver(people);
  assert.deepEqual(resolve({ form_ar: 'أحمد ابن أبي رجاء المقرئ', target_ar: 'ابن نصر' }), { ids: ['a'], status: 'resolved_by_context' });
  assert.deepEqual(resolve({ form_ar: 'إياس ابن ثعلبة أبو أمامة البلوي', target_ar: null, place: 'kunya' }), { ids: ['c'], status: 'resolved' });
  assert.equal(resolve({ form_ar: 'x', target_ar: 'يسير' }).status, 'too_short');
});

/* ── The whole book ────────────────────────────────────────────── */

/* ── Register pages ────────────────────────────────────────────── */

test('the English name is the gloss up to the first verdict or colon', () => {
  assert.equal(englishName('2149- Zayd b. ʿAlī b. al-Ḥusayn, trustworthy, from the fourth'), 'Zayd b. ʿAlī b. al-Ḥusayn');
  assert.equal(englishName('12. Aḥmad b. Ibrāhīm (al-Dawraqī): truthful'), 'Aḥmad b. Ibrāhīm');
  assert.equal(englishName('Umm Kulthūm bt. ʿUqba. A Companion.'), 'Umm Kulthūm bt. ʿUqba');
  assert.equal(englishName(''), null);
});

const man = (id, ism) => ({ id, section: 'men_ism', name: { ism, full_ar: ism } });

test('a page letter moves only when several names in a row agree', () => {
  const men = [
    man('a1', 'أحمد'), man('a2', 'أحمد'), man('a3', 'إبراهيم'),
    man('a4', 'والثاني'), man('a5', 'وهب'),
    man('b1', 'بشر'), man('b2', 'بكر'), man('b3', 'بلال'),
  ];
  const pages = planPages(men);
  assert.deepEqual(pages.map((p) => p.slug), ['alif', 'ba']);
  assert.deepEqual(pages[0].ids, ['a1', 'a2', 'a3', 'a4', 'a5']);
  assert.deepEqual(pages[1].range_ar, ['بشر', 'بلال']);
});

test('a long letter is cut into parts at a change of given name', () => {
  const men = Array.from({ length: PAGE_LIMIT + 10 }, (_, i) => man(`m${i}`, i < PAGE_LIMIT - 5 ? 'أحمد' : 'إبراهيم'));
  const pages = planPages(men);
  assert.deepEqual(pages.map((p) => p.slug), ['alif-1', 'alif-2']);
  assert.equal(pages.reduce((sum, p) => sum + p.ids.length, 0), men.length);
});

const SOURCE = process.env.TAQRIB_SOURCE;

test('the whole book parses to the expected shape', { skip: !SOURCE && 'set TAQRIB_SOURCE to run' }, () => {
  const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const { narrators, aliases, texts, report } = buildTaqrib(data.source_records);
  assert.equal(report.numbering.max, 8826);
  assert.deepEqual(report.numbering.out_of_order, []);
  assert.equal(aliases.length, 3212);
  assert.ok(narrators.length >= 8826);
  assert.equal(narrators.find((n) => n.taqrib_no === 7922).section, 'men_kunya');
  assert.equal(narrators.find((n) => n.taqrib_no === 8525).section, 'women_ism');
  assert.equal(narrators.find((n) => n.taqrib_no === 8816).section, 'women_from_women');
  assert.ok(report.with_english >= narrators.length - 2, 'every entry has its English line');
  assert.ok(narrators.filter((n) => n.assessment.rank != null).length / narrators.length > 0.94);
  assert.ok(report.with_generation > 7600);
  assert.ok(Object.values(texts).every((t) => t.ar));
});

test('the register puts every narrator on exactly one page', { skip: !SOURCE && 'set TAQRIB_SOURCE to run' }, () => {
  const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const { narrators, aliases, texts } = buildTaqrib(data.source_records);
  const { manifest, files } = renderRegister({ narrators, aliases, texts });
  assert.equal(manifest.reduce((sum, p) => sum + p.count, 0), narrators.length);
  const ids = Object.values(files).flatMap((html) => [...html.matchAll(/<li class="rj-row" id="([^"]+)"/g)].map((m) => m[1]));
  assert.equal(new Set(ids).size, narrators.length);
  assert.ok(manifest.every((p) => p.count <= PAGE_LIMIT * 1.4));
  assert.ok(Object.values(files).every((html) => !/<script|<\/?(?:iframe|style)/i.test(html)));
});
