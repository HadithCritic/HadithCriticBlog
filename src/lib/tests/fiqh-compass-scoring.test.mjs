import assert from 'node:assert/strict';
import test from 'node:test';

import { compareMethodProfile, compareRulingAnswers, scoreAxes } from '../fiqh-compass-scoring.js';

const axes = [
  { id: 'A01' }, { id: 'A02' }, { id: 'A03' }, { id: 'A04' },
  { id: 'A05' }, { id: 'A06' }, { id: 'A07' }, { id: 'A08' },
  { id: 'A09' }, { id: 'A10' }, { id: 'A11' }, { id: 'A12' },
];

test('all skipped or non-numeric answers produce unavailable axes', () => {
  const results = scoreAxes(axes, [
    { id: 'Q1', axis: 'A01', direction: 1 },
    { id: 'Q2', axis: 'A02', direction: -1 },
  ], { Q1: 'unknown', Q2: 'na' });

  assert.equal(results[0].score, null);
  assert.equal(results[0].answered, 0);
  assert.equal(results[0].eligible, 1);
  assert.equal(results[1].score, null);
});

test('direction correction maps opposite item wording onto the same axis', () => {
  const results = scoreAxes(axes, [
    { id: 'Q1', axis: 'A01', direction: 1 },
    { id: 'Q2', axis: 'A01', direction: -1 },
  ], { Q1: '2', Q2: '-2' });

  assert.equal(results[0].score, 100);
  assert.equal(results[0].mean, 2);
  assert.equal(results[0].pattern, 'directional');
});

test('opposing corrected answers center the result and remain visibly mixed', () => {
  const results = scoreAxes(axes, [
    { id: 'Q1', axis: 'A01', direction: 1 },
    { id: 'Q2', axis: 'A01', direction: -1 },
  ], { Q1: '2', Q2: '2' });

  assert.equal(results[0].score, 50);
  assert.equal(results[0].pattern, 'mixed');
});

test('neutral answers center the result without being labeled mixed', () => {
  const results = scoreAxes(axes, [{ id: 'Q1', axis: 'A01', direction: 1 }], { Q1: '0' });
  assert.equal(results[0].score, 50);
  assert.equal(results[0].pattern, 'neutral');
});

test('inactive conditional items are excluded from the denominator', () => {
  const results = scoreAxes(axes, [
    { id: 'Q1', axis: 'A01', direction: 1 },
    { id: 'Q2', axis: 'A01', direction: -1, active: false },
  ], { Q1: '1', Q2: '2' });

  assert.equal(results[0].score, 75);
  assert.equal(results[0].answered, 1);
  assert.equal(results[0].eligible, 1);
});

test('malformed and out-of-range responses are not scored', () => {
  const results = scoreAxes(axes, [{ id: 'Q1', axis: 'A01', direction: 1 }], {
    Q1: '3',
  });
  assert.equal(results[0].score, null);
});

test('method profile matching refuses fewer than eight jointly covered axes', () => {
  const userScores = axes.map(({ id }, index) => ({ axisId: id, score: index < 7 ? 50 : null }));
  const profile = Object.fromEntries(axes.map(({ id }) => [id, 50]));
  const result = compareMethodProfile(userScores, profile);

  assert.equal(result.status, 'insufficient_evidence');
  assert.equal(result.similarity, null);
  assert.equal(result.comparableAxes.length, 7);
});

test('method profile similarity uses common axes and is explicitly descriptive', () => {
  const userScores = axes.map(({ id }) => ({ axisId: id, score: 50 }));
  const profile = Object.fromEntries(axes.slice(0, 8).map(({ id }) => [id, 60]));
  const result = compareMethodProfile(userScores, profile);

  assert.equal(result.status, 'descriptive_comparison');
  assert.equal(result.similarity, 90);
  assert.equal(result.distance, 10);
  assert.equal(result.comparableAxes.length, 8);
  assert.match(result.interpretation, /not a probability/);
});

test('case-answer agreement is computed separately and excludes unknowns', () => {
  const result = compareRulingAnswers(
    { Q1: 'yes', Q2: 'unknown', Q3: 'no' },
    { Q1: 'yes', Q2: 'yes', Q3: 'yes' },
    ['Q1', 'Q2', 'Q3'],
  );

  assert.equal(result.status, 'descriptive_comparison');
  assert.equal(result.displayAgreement, 50);
  assert.deepEqual(result.comparableItems, ['Q1', 'Q3']);
});

test('no reviewed comparable case answers yields no agreement percentage', () => {
  const result = compareRulingAnswers({ Q1: 'unknown' }, { Q1: 'yes' }, ['Q1']);
  assert.equal(result.status, 'insufficient_evidence');
  assert.equal(result.agreement, null);
});

test('invalid item-axis and direction mappings fail closed', () => {
  assert.throws(() => scoreAxes(axes, [{ id: 'Q1', axis: 'A99', direction: 1 }], { Q1: '1' }), /Unknown axis/);
  assert.throws(() => scoreAxes(axes, [{ id: 'Q1', axis: 'A01', direction: 0 }], { Q1: '1' }), /Invalid direction/);
});
