/**
 * The tafsir registry is hand-edited and the entry files will be. These checks keep the
 * registry valid against the qirāʾāt data, and pin how a commentary's reading is resolved.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { eraOf, versePartsOf, tafsirPartUrl, indexEntries, readVerse, resolveRef, validateSura, validateWorks } from '../tafsir-core.ts';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const registry = read('../../data/tafsir/works.json');
const fatiha = read('../../data/qiraat/sura-001.json');
const qaris = fatiha.qaris;
const malik = fatiha.features.find((f) => f.id === 'f-1-4-malik');

const work = (reading) => ({ ...registry.works[0], reading });
const entry = (over = {}) => ({
  id: 'e1', work: 'mujahid', verses: { from: 4, to: 4 }, lemma: null, reading: [],
  text: 'نص', citation: { volume: null, page: '12' }, review_state: 'proposed', ...over,
});
const sura = (entries, silent = {}) => ({ schemaVersion: 't', sura: 1, entries, silent });
const ids = new Set(registry.works.map((w) => w.id));

test('the committed registry is valid', () => {
  assert.deepEqual(validateWorks(registry, qaris), []);
});

test('the second century holds the five works, in order of death', () => {
  const second = registry.works.filter((w) => w.century === 2).map((w) => w.death_ah);
  assert.equal(second.length, 5);
  assert.deepEqual(second, [...second].sort((a, b) => a - b));
});

test('no work claims a reading before it is established', () => {
  const bad = { ...registry, works: [work({ status: 'not_established', default: { kind: 'riwaya', id: 'hafs' }, basis: null, evidence: [] })] };
  assert.ok(validateWorks(bad, qaris).some((p) => p.includes('established')));
});

test('an established reading must name a known transmitter and carry evidence', () => {
  const bad = { ...registry, works: [work({ status: 'proposed', default: { kind: 'riwaya', id: 'nobody' }, basis: 'x', evidence: [] })] };
  const problems = validateWorks(bad, qaris);
  assert.ok(problems.some((p) => p.includes('unknown riwaya')));
  assert.ok(problems.some((p) => p.includes('evidence')));
});

test('a riwaya resolves to its group at a position', () => {
  const hafs = resolveRef(malik, { kind: 'riwaya', id: 'hafs' }, qaris);
  assert.equal(hafs.cairo, true);
  assert.equal(hafs.letter, 'A');
  const warsh = resolveRef(malik, { kind: 'riwaya', id: 'warsh' }, qaris);
  assert.notEqual(warsh.label, hafs.label);
});

test('a work with no reading leaves every position open', () => {
  const result = readVerse(work({ status: 'not_established', default: null, basis: null, evidence: [] }), [malik], [], qaris);
  assert.equal(result.positions.length, 1);
  assert.equal(result.positions[0].reading, null);
});

test('an entry that states a reading overrides the default', () => {
  const asHafs = work({ status: 'proposed', default: { kind: 'riwaya', id: 'hafs' }, basis: 'x', evidence: [{ volume: null, page: '1', quote: 'q' }] });
  const other = malik.groups.find((g) => g.kind === 'reading' && !g.includes_hafs);
  const result = readVerse(asHafs, [malik], [entry({ reading: [{ feature: malik.id, value: other.value }] })], qaris);
  assert.equal(result.positions[0].reading.source, 'entry');
  assert.equal(result.positions[0].reading.cairo, false);
});

test('a reading outside the collation is kept in the book\'s form', () => {
  const result = readVerse(registry.works[0], [], [entry({ reading: [{ form: '{ملك}', note: null }] })], qaris);
  assert.deepEqual(result.stated, [{ form: '{ملك}', note: null, entry: 'e1' }]);
});

test('entries are indexed by every verse they cover', () => {
  const index = indexEntries(sura([entry({ verses: { from: 2, to: 4 } })]));
  assert.deepEqual([...index.get('mujahid').keys()], [2, 3, 4]);
});

test('sura validation catches bad verses, works, positions and silent overlaps', () => {
  const problems = validateSura(
    sura(
      [
        entry({ verses: { from: 8, to: 9 } }),
        entry({ id: 'e2', work: 'nobody' }),
        entry({ id: 'e3', reading: [{ feature: malik.id, value: 'no-such-value' }] }),
      ],
      { mujahid: [4] },
    ),
    ids, 7, fatiha.features,
  );
  assert.ok(problems.some((p) => p.includes('not in sura')));
  assert.ok(problems.some((p) => p.includes('unknown work')));
  assert.ok(problems.some((p) => p.includes('has no reading')));
  assert.ok(problems.some((p) => p.includes('also has an entry')));
});

test('a valid sura file passes', () => {
  const value = malik.groups.find((g) => g.kind === 'reading').value;
  assert.deepEqual(validateSura(sura([entry({ reading: [{ feature: malik.id, value }] })], { thawri: [1, 2] }), ids, 7, fatiha.features), []);
});

test('every era has a color, and every century is in an era', () => {
  const css = readFileSync(new URL('../../styles/tafsir.css', import.meta.url), 'utf8');
  for (const era of registry.eras) assert.ok(css.includes(`.era-${era.id} {`), `no .era-${era.id} rule`);
  for (const c of registry.centuries) assert.ok(eraOf(registry.eras, c.n), `century ${c.n} is in no era`);
});

test('a work outside every era is refused', () => {
  const bad = { ...registry, eras: registry.eras.slice(1) };
  assert.ok(validateWorks(bad, qaris).some((p) => p.includes('no era')));
});

test('a short sura is one part and a long one splits without a stub', () => {
  assert.equal(versePartsOf(7).length, 1);
  const parts = versePartsOf(286);
  assert.equal(parts[0].first, 1);
  assert.equal(parts.at(-1).last, 286);
  for (let i = 1; i < parts.length; i++) assert.equal(parts[i].first, parts[i - 1].last + 1);
  assert.ok(parts.at(-1).last - parts.at(-1).first + 1 >= 8);
  assert.equal(tafsirPartUrl(2, parts[0]), '/projects/tafsir/sura/2/');
  assert.equal(tafsirPartUrl(2, parts[1]), '/projects/tafsir/sura/2/part/2/');
});
