/**
 * The research graph is committed, generated data. These checks keep it honest:
 * every edge points at a real work, every citation has an author to pin it to, and
 * nothing in the public file leaks a local path or an evaluative label.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { indexGraph, layoutTimeline, authorLine } from '../research-graph-core.ts';

const data = JSON.parse(readFileSync(new URL('../../data/research-graph.json', import.meta.url), 'utf8'));
const index = indexGraph(data);

test('the graph passes referential validation', () => {
  assert.ok(index.data.works.length > 0);
  assert.equal(new Set(data.works.map((w) => w.id)).size, data.works.length);
});

test('edges connect known works, without self loops or duplicates', () => {
  const seen = new Set();
  for (const e of data.edges) {
    assert.ok(index.workById.has(e.from) && index.workById.has(e.to), `${e.from} -> ${e.to}`);
    assert.notEqual(e.from, e.to);
    const key = `${e.type}:${e.from}:${e.to}`;
    assert.ok(!seen.has(key), `duplicate ${key}`);
    seen.add(key);
  }
});

test('no work cites a publication dated after itself', () => {
  // Five years covers forthcoming citations of papers that circulated before publication.
  // Revised copies are exempt: they cite newer work than their dated original.
  for (const e of data.edges.filter((x) => x.type === 'cites')) {
    const a = index.workById.get(e.from);
    const b = index.workById.get(e.to);
    if (a.year && b.year && !a.revisedCopy) assert.ok((b.originalYear ?? b.year) <= a.year + 5, `${a.title} (${a.year}) cites ${b.title} (${b.year})`);
  }
});

test('reviewed generic wording is not mistaken for a bibliography citation', () => {
  const source = 'kara-2026-debating-origins-sanctity-madina-hadith';
  assert.ok(index.workById.has(source));
  // Kara cites Motzki's Dating Muslim Traditions. Nearby references to
  // Juynboll concern his Nāfiʿ article, not the 1983 Muslim Tradition book.
  assert.ok(data.edges.some(e => e.type === 'cites' && e.from === source && e.to === 'motzki-2005-dating-muslim-traditions-survey'));
  assert.ok(!data.edges.some(e => e.type === 'cites' && e.from === source && e.to === 'juynboll-1983-muslim-tradition'));
});

test('the public file has no local paths, page numbers or evaluative fields', () => {
  const text = JSON.stringify(data);
  assert.ok(!/[A-Z]:\|\.pdf/i.test(text), 'a local path or file name leaked');
  for (const e of data.edges) assert.equal(e.pages, undefined);
  for (const w of data.works) for (const key of ['grade', 'rating', 'score', 'reliability', 'authenticity']) assert.equal(w[key], undefined);
});

test('the timeline places every work once, inside its plot', () => {
  const t = layoutTimeline(index);
  assert.equal(t.nodes.length, data.works.length);
  assert.equal(new Set(t.nodes.map((n) => n.id)).size, data.works.length);
  for (const n of t.nodes) assert.ok(n.x > t.left && n.y > 0 && n.y < t.height);
});

test('author lines mark editors', () => {
  const editor = data.works.find((w) => w.role === 'editor');
  if (editor) assert.match(authorLine(editor, index), /\(ed\.\)$/);
});

test('a study printed inside a volume points at exactly one volume, with its page', () => {
  const partEdges = data.edges.filter((e) => e.type === 'part_of');
  assert.ok(partEdges.length > 0);
  const seen = new Set();
  for (const e of partEdges) {
    assert.ok(!seen.has(e.from), `${e.from} is printed inside two volumes`);
    seen.add(e.from);
    const volume = index.workById.get(e.to);
    assert.ok(['edited volume', 'edited book', 'book'].includes(volume.type), `${volume.title} is not a volume`);
    assert.ok(Number.isInteger(e.page) && e.page > 0, `${e.from} has no printed page in ${volume.title}`);
    assert.ok(index.parts.get(e.to).includes(e.from));
  }
});

test('a volume and the studies printed inside it never cite each other', () => {
  for (const e of data.edges.filter((x) => x.type === 'cites')) {
    assert.notEqual(index.partOf.get(e.from), e.to, `${e.from} cites its own volume`);
    assert.notEqual(index.partOf.get(e.to), e.from, `${e.from} cites a study printed inside it`);
  }
});

test('studies inside a volume are listed in the order they begin', () => {
  for (const [volume, ids] of index.parts) {
    const pages = ids.map((id) => index.partPage.get(id));
    assert.deepEqual(pages, [...pages].sort((a, b) => a - b), `${volume} studies are out of order`);
  }
});
