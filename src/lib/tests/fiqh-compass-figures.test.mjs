import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { compareFigures, figurePositions, relation, toScore, toUnit } from '../fiqh-compass-figures.js';

const figures = [
  { id: 'textual', died_ah: 456 },
  { id: 'rational', died_ah: 505 },
  { id: 'single', died_ah: 600 },
];
const placements = [
  { figure: 'textual', axis: 'A05', position: -1 },
  { figure: 'textual', axis: 'A06', position: -1 },
  { figure: 'textual', axis: 'A07', position: -1 },
  { figure: 'rational', axis: 'A05', position: 1 },
  { figure: 'rational', axis: 'A06', position: 0 },
  { figure: 'rational', axis: 'A06', position: 1 },
  { figure: 'single', axis: 'A05', position: 1 },
];
const scores = (map) => Object.entries(map).map(([axisId, score]) => ({ axisId, score }));

test('the unit scale and the 0..100 scale map onto each other', () => {
  assert.equal(toUnit(0), -1);
  assert.equal(toUnit(100), 1);
  assert.equal(toScore(0), 50);
  assert.equal(toUnit(toScore(0.25)), 0.25);
});

test('several placements on one axis average', () => {
  assert.equal(figurePositions(placements).get('rational').get('A06'), 0.5);
});

test('gaps are named without ranking either side', () => {
  assert.equal(relation(0.5), 'agree');
  assert.equal(relation(0.75), 'partly');
  assert.equal(relation(1), 'differ');
});

test('a respondent at the textual pole is closest to the textual figure', () => {
  const { compared, tooFew } = compareFigures(scores({ A05: 0, A06: 0, A07: 0 }), figures, placements);
  assert.equal(compared[0].figure.id, 'textual');
  assert.equal(compared[0].agreement, 100);
  assert.deepEqual(tooFew.map((f) => f.id), ['single']);
});

test('only axes the respondent scored are compared', () => {
  const { compared } = compareFigures(scores({ A05: 100, A06: null, A07: null }), figures, placements);
  assert.equal(compared.length, 0);
});

test('stability counts leave-one-out checks that keep the closest figure first', () => {
  const { stability, compared } = compareFigures(scores({ A05: 0, A06: 0, A07: 0 }), figures, placements);
  assert.equal(stability.of, compared[0].axes.length);
  assert.equal(stability.held, stability.of);
});

test('the published dataset cites a source for every placement', () => {
  const data = JSON.parse(readFileSync(new URL('../../data/fiqh-compass-figures.json', import.meta.url), 'utf8'));
  const ids = new Set(data.figures.map((f) => f.id));
  for (const p of data.placements) {
    assert.ok(ids.has(p.figure), `${p.figure} is a known figure`);
    assert.ok(data.books[p.book], `book ${p.book} has a title`);
    assert.ok(p.quote_ar.length > 0 && p.statement_en.length > 0 && p.page && p.serial);
    assert.ok(p.position >= -1 && p.position <= 1);
    if (p.kind === 'report') assert.ok(p.by, 'a report names its reporter');
  }
});
