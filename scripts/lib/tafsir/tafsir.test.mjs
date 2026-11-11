/* Tests for the Tafsir importer and the data it publishes.
   Run: npm run test:tafsir
   With TAFSIR_SOURCE set to the English collection's JSON, every passage of
   the corpus is also re-classified and checked against its source. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { flatten, inline, sentences, surahResolver, NOTE_OPEN, NOTE_MID, NOTE_CLOSE } from './text.mjs';
import { opensReport, parseChain } from './chain.mjs';
import { classify, readingEvidence, reproduces, versePhrases } from './classify.mjs';
import { normalize, shapeOf } from './normalize.mjs';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const names = JSON.parse(fs.readFileSync(path.join(root, 'src/data/quran-sura-names.json'), 'utf8'));
const verses = (s) => names.find((n) => n.n === s)?.verses ?? 0;
const surah = surahResolver(names);

/* ── Text ──────────────────────────────────────────────────────── */

test('sentences respect abbreviations, initials and braces', () => {
  assert.deepEqual(sentences('Aḥmad b. Manīʿ told us. Then {He said. Indeed} it is. M. reads x. End (Ghafir 40:16). Next.'), [
    'Aḥmad b. Manīʿ told us.',
    'Then {He said. Indeed} it is.',
    'M. reads x.',
    'End (Ghafir 40:16).',
    'Next.',
  ]);
});

test('inline runs mark braces, citations, notes and italics, and flatten back exactly', () => {
  const text = `His saying {Say: He is God (1)} means *ṣamad* (An-Nisa’: 66-69) and [5:66] ${NOTE_OPEN}7${NOTE_MID}(2)${NOTE_CLOSE} done (Nowhere 200:1).`;
  const runs = inline(text, { verses, surah });
  const kinds = runs.filter((r) => typeof r !== 'string').map((r) => r[0]);
  assert.deepEqual(kinds, ['h', 'i', 'r', 'r', 'n']);
  const cite = runs.find((r) => r[0] === 'r');
  assert.deepEqual(cite.slice(2), [4, 66, 69]);
  assert.equal(runs.find((r) => r[0] === 'n')[2], 7);
  // An invalid citation stays as text.
  assert.ok(runs.at(-1).includes('(Nowhere 200:1)'));
  assert.equal(flatten(runs), text.replace(`${NOTE_OPEN}7${NOTE_MID}`, '').replace(NOTE_CLOSE, ''));
});

test('surah names in citations resolve with or without articles and diacritics', () => {
  assert.equal(surah('An-Nisa’'), 4);
  assert.equal(surah('Al Imran'), 3);
  assert.equal(surah('Ta-Ha'), 20);
  assert.equal(surah('Ash-Shura'), 42);
  assert.equal(surah('Not a surah'), null);
});

/* ── Chains ────────────────────────────────────────────────────── */

const CHAINS = [
  ['Muhammad ibn al-Ala’ told us: Uthman ibn Saeed told us: Abu Rawq told us, on the authority of al-Dahhak, on the authority of Ibn Abbas: The path means the prophets.', 'Ibn Abbas', 'The path means'],
  ['Al-Qasim told us, he said: Al-Hussein told us, he said: Waki’ said: You have bestowed favor upon them, the Muslims.', 'Waki’', 'You have bestowed'],
  ['Ibn ʿAbd al-Aʿlā told us, he said: Ibn Thawr told us, from Maʿmar, from Qatāda, regarding His saying {and the winds}. He said: mercy.', 'Qatāda', 'regarding His saying'],
  ['Ibn Sa\'d related to me: My father told me; my uncle told me; my father told me, from his father, from Ibn Abbas, concerning {By the heaven}. Ibn Abbas said: palaces.', 'Ibn Abbas', 'concerning'],
  ['Muhammad bin Ubaid told me: Abu Bakr told us, on the authority of Abu Ishaq, who said: A man came to Umar and said: I have sinned.', 'Abu Ishaq', 'A man came'],
  ['Yunus told me: Ibn Wahb told us: Abdul Rahman bin Zaid said regarding God’s statement, The path, he said: The Prophet.', 'Abdul Rahman bin Zaid', 'regarding'],
];

for (const [text, via, matn] of CHAINS) {
  test(`chain: ${text.slice(0, 40)}…`, () => {
    assert.ok(opensReport(text));
    const chain = parseChain(text);
    assert.ok(chain);
    assert.equal(chain.via, via);
    assert.ok(text.slice(chain.chainEnd).startsWith(matn), text.slice(chain.chainEnd, chain.chainEnd + 30));
  });
}

test('narration that is not a chain does not open a report', () => {
  assert.equal(opensReport('He said: The polytheists said to the Prophet.'), false);
  assert.equal(opensReport('God told us in His Book that the path is straight.'), false);
});

/* ── Classification ────────────────────────────────────────────── */

const PASSAGE = [
  'The statement in the interpretation of His saying: The path of those whom You blessed.',
  'Abu Ja`far said: The path is the way of the prophets, as the Most High said: And whoever obeys God and the Messenger (An-Nisa’: 69).',
  'Those who said that: Al-Qasim told us, he said: Al-Hussein told us, he said: Waki’ said: The Muslims.',
  'Yunus told me: Ibn Wahb told us: Ibn Zayd said: The Prophet and those with him.',
  'If someone were to say: Where is the rest of the report? It was said to him: The apparent indicates the hidden.',
  'As al-Farazdaq said: You see their necks hanging on it. He means: those who wear it.',
  'The reciters differed in their reading of it, and the correct reading in our view is the first.',
].join(' ').replace(/`/g, 'ʿ');

test('a passage is read into the expected blocks and reproduces its source', () => {
  const { blocks, sections, readings } = classify([{ kind: 'text', text: PASSAGE }], { verses, surah });
  const types = blocks.map((b) => b.t);
  assert.deepEqual(types, ['lemma', 'p', 'quote', 'intro', 'report', 'report', 'arg', 'poem', 'p']);
  assert.equal(blocks[1].v, 'Abu Jaʿfar said:');
  assert.deepEqual(blocks[2].r.slice(2), [4, 69, 69]);
  assert.equal(blocks[4].via, 'Waki’');
  assert.equal(blocks[6].q.l, 'If someone were to say:');
  assert.equal(blocks[6].a.l, 'It was said to him:');
  assert.ok(reproduces(blocks, PASSAGE));
  assert.ok(sections.some((s) => s.k === 'reports'));
  assert.equal(readings.status, 'preference');
});

test('typed source blocks keep their structure', () => {
  const items = [
    { kind: 'marker', text: 'Mention of those who said so:' },
    { kind: 'report', isnad: 'Abū Kurayb told us, from Ubayy b. Kaʿb.', matn: 'He said: Trace for us the lineage of your Lord.', via: 'Ubayy b. Kaʿb' },
    { kind: 'poem', lines: ['How can I sleep on my bed,', 'when a widespread raid'] },
  ];
  const { blocks } = classify(items, { verses, surah });
  assert.deepEqual(blocks.map((b) => b.t), ['intro', 'report', 'poem']);
  assert.equal(blocks[1].via, 'Ubayy b. Kaʿb');
  assert.ok(reproduces(blocks, items.map((i) => i.text ?? i.lines?.join(' ') ?? `${i.isnad} ${i.matn}`).join(' ')));
});

test('readings: nothing is attributed without a statement in the text', () => {
  assert.equal(readingEvidence('He said: the path is straight.'), null);
  const ev = readingEvidence('Most of the reciters of Medina read it with yāʾ, and ʿĀṣim read it with tāʾ.');
  assert.ok(ev);
  assert.equal(ev.preference, false);
  assert.ok(ev.names.includes('ʿĀṣim'));
  assert.ok(ev.regions.some((r) => r.includes('Medina')));
  // al-Ṭabarī's own kunya is not taken for a reader.
  const voice = readingEvidence('Abu Jaʿfar said: The reciters differ in their recitation of it.');
  assert.ok(voice && !voice.names.includes('Abu Jaʿfar'));
});

test('verse wording is highlighted only when it matches the verse or recurs', () => {
  const phrases = versePhrases('And His statement, The path of those upon whom You have bestowed favor, is an explanation. His statement, Something unrelated entirely here, is another.', 'the path of those whom You blessed');
  assert.deepEqual(phrases, ['The path of those upon whom You have bestowed favor']);
});

/* ── Normalizing the four shapes ───────────────────────────────── */

const footnote = (o) => ({ unit: 1, ayah_start: 1, ayah_end: 2, volume: '24', page: 10, page_note_index: 1, printed_note_number: 1, text_ar: '1. في م.', text_en: '1. M reads.', ...o });

test('shape A, B (both batches), C typed and D are read into units', () => {
  const a = normalize({ surah: { number: 1, ayah_count: 1 }, translation: { layout: 'ayah', units: [{ ayah: 1, text_en: 'Abu Ja`far said: x.', source: { volumes: [1], pdf_pages: [8] } }], source: {}, editor_footnotes: [] } });
  assert.equal(a.shape, 'A');
  assert.equal(a.units[0].items[0].text, 'Abu Jaʿfar said: x.');

  const b = normalize({ surah: { number: 61, ayah_count: 2 }, translation: { ayah_blocks: [{ ayah: 1, text_en: 'line one\nline two', source: { volume: 30, pdf_pages: [87] } }, { ayah_start: 2, ayah_end: 2, text_en: 'y', source_volumes: [30] }], source: {}, editor_footnotes: [] } });
  assert.equal(b.shape, 'B');
  assert.deepEqual(b.units.map((u) => [u.start, u.end]), [[1, 1], [2, 2]]);
  assert.equal(b.units[0].items[0].text, 'line one line two');

  const c = normalize({
    surah: { number: 112, ayah_count: 2 },
    translation: {
      ayah_index: {},
      units: [{ unit: 1, type: 'lemma', ayah_start: 1, ayah_end: 2, blocks: [
        { type: 'paragraph', text_en: 'Discussion of {Say (1)} here [Fn 1].', footnotes: [{ n: 1, text: '1. في م.' }] },
        { type: 'report', isnad_en: 'X told us, from Y.', matn_en: 'He said: z.', narrators: ['X', 'Y'] },
      ] }],
      editor_footnotes: [footnote()],
    },
  });
  assert.equal(c.shape, 'C');
  assert.equal(c.ayahIndex, null, 'an empty index falls back to ranges');
  assert.ok(c.units[0].items[0].text.includes(`${NOTE_OPEN}0${NOTE_MID}[Fn 1]${NOTE_CLOSE}`));
  assert.ok(c.units[0].items[0].text.includes('{Say (1)}'), 'a verse number inside braces is not a marker');
  assert.equal(c.units[0].items[1].via, 'Y');

  const d = normalize({
    surah: { number: 45, ayah_count: 1 },
    units: [{ unit: 1, type: 'lemma', ayah_start: 1, ayah_end: 1, segments: [{ volume: '24', page: 10, serial: 5, text_en: 'Text {Ḥā Mīm} (1) more.', footnotes: [{ page_note_index: 1, n: 1 }] }] }],
    ayah_index: { 1: [1] },
    translation: { editor_footnotes: [footnote({ ayah_end: 1 })] },
  });
  assert.equal(shapeOf({ units: [{ segments: [] }], translation: {} }), 'D');
  assert.ok(d.units[0].items[0].text.includes(`${NOTE_OPEN}0${NOTE_MID}(1)${NOTE_CLOSE}`));
  assert.equal(d.stats.markersLinked, 1);
});

/* ── The published data ────────────────────────────────────────── */

test('every published surah file is internally consistent', () => {
  const dir = path.join(root, 'src/data/tafsir/tabari/surahs');
  const files = fs.readdirSync(dir);
  assert.ok(files.length > 0);
  for (const file of files) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    assert.equal(s.ayahs.length, s.ayahCount, `${file}: one entry per verse`);
    const check = (runs) => {
      for (const r of runs ?? []) {
        if (typeof r === 'string') continue;
        if (r[0] === 'n') assert.ok(s.notes[r[2]], `${file}: marker points at a note`);
        if (r[0] === 'r') assert.ok(r[2] >= 1 && r[2] <= 114 && r[3] <= r[4] && r[4] <= verses(r[2]), `${file}: citation in range`);
        if (r[0] === 'h') check(r[1]);
      }
    };
    for (const [key, unit] of Object.entries(s.units)) {
      const covered = new Set(unit.sec.flatMap((x) => x.b));
      assert.equal(covered.size, unit.b.length, `${file} unit ${key}: every block is in a section`);
      for (const b of unit.b) {
        for (const field of ['x', 'c', 'm', 'i']) check(b[field]);
        if (b.t === 'arg') check(b.q.x), check(b.a.x);
        b.lines?.forEach(check);
      }
      for (const e of unit.rd.evidence) assert.ok(unit.b[e.b], `${file} unit ${key}: evidence points at a block`);
    }
    for (const a of s.ayahs) {
      for (const u of a.u) assert.ok(s.units[String(u)], `${file} ${a.n}: unit exists`);
      for (const n of a.nt) assert.ok(s.notes[n], `${file} ${a.n}: note exists`);
    }
  }
});

/* ── The whole corpus, when the source is available ─────────────── */

const SOURCE = process.env.TAFSIR_SOURCE;
test('every passage of the corpus reproduces its source', { skip: !SOURCE && 'set TAFSIR_SOURCE to run' }, () => {
  const source = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const itemSource = (i) => (i.kind === 'report' ? `${i.isnad} ${i.matn}` : i.kind === 'poem' ? i.lines.join(' ') : i.text);
  let units = 0;
  for (const record of source.surahs) {
    for (const unit of normalize(record).units) {
      const text = unit.items.map(itemSource).join(' ');
      assert.ok(reproduces(classify(unit.items, { verses, surah }).blocks, text), `surah ${(record.surah ?? record).number} unit ${unit.id}`);
      units++;
    }
  }
  assert.ok(units > 4000);
});
