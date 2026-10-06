import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { resolveItemRoutes, validateItemRoutes } from '../fiqh-compass-routing.js';
import { scoreAxes } from '../fiqh-compass-scoring.js';

const axes = [{ id: 'A02' }, { id: 'A10' }];
const routePlan = JSON.parse(readFileSync(new URL('../../../docs/research/fiqh-compass/instrument-routing-proposal-v1.json', import.meta.url), 'utf8'));
const candidateBank = JSON.parse(readFileSync(new URL('../../../docs/research/fiqh-compass/instrument-candidate-bank-v1.json', import.meta.url), 'utf8'));
const gates = [
  { id: 'C_REPORT_AUTHORITY', options: ['conditional', 'broad', 'does_not_accept'] },
  { id: 'C_RESPONDENT_ROLE', options: ['layperson', 'qualified_jurist', 'unsure'] },
];
const items = [
  { id: 'Q30', axis: 'A02', direction: 1 },
  { id: 'Q31', axis: 'A02', direction: 1, route: { all: [{ questionId: 'C_REPORT_AUTHORITY', anyOf: ['conditional', 'broad'] }] } },
  { id: 'Q79', axis: 'A10', direction: 1, route: { all: [{ questionId: 'C_RESPONDENT_ROLE', anyOf: ['layperson'] }] } },
  { id: 'Q81', axis: 'A10', direction: -1, route: { all: [{ questionId: 'C_RESPONDENT_ROLE', anyOf: ['qualified_jurist'] }] } },
];

test('unconditional items stay active and missing gate answers suppress conditional items', () => {
  const routed = resolveItemRoutes(items, gates, {});
  assert.deepEqual(routed.map(({ id, active }) => [id, active]), [
    ['Q30', true], ['Q31', false], ['Q79', false], ['Q81', false],
  ]);
});

test('rejecting report authority does not score report-specific follow-ups', () => {
  const routed = resolveItemRoutes(items, gates, { C_REPORT_AUTHORITY: 'does_not_accept' });
  const result = scoreAxes(axes, routed, { Q30: '1', Q31: '2' });
  assert.equal(result.find(({ axisId }) => axisId === 'A02').eligible, 1);
  assert.equal(result.find(({ axisId }) => axisId === 'A02').answered, 1);
});

test('a qualified report-authority response activates only its conditional follow-up', () => {
  const routed = resolveItemRoutes(items, gates, { C_REPORT_AUTHORITY: 'conditional' });
  assert.equal(routed.find(({ id }) => id === 'Q31').active, true);
  assert.equal(routed.find(({ id }) => id === 'Q79').active, false);
});

test('lay and qualified-jurist questions are mutually exclusive by respondent role', () => {
  const lay = resolveItemRoutes(items, gates, { C_RESPONDENT_ROLE: 'layperson' });
  const jurist = resolveItemRoutes(items, gates, { C_RESPONDENT_ROLE: 'qualified_jurist' });
  assert.equal(lay.find(({ id }) => id === 'Q79').active, true);
  assert.equal(lay.find(({ id }) => id === 'Q81').active, false);
  assert.equal(jurist.find(({ id }) => id === 'Q79').active, false);
  assert.equal(jurist.find(({ id }) => id === 'Q81').active, true);
});

test('invalid or ambiguous route metadata fails closed', () => {
  assert.throws(() => validateItemRoutes([{ id: 'Q1', route: { all: [] } }], gates), /non-empty route/);
  assert.throws(() => validateItemRoutes([{ id: 'Q1', route: { all: [{ questionId: 'C1', anyOf: [] }] } }], gates), /Unknown gate question/);
  assert.throws(() => validateItemRoutes([{ id: 'Q1', route: { all: [{ questionId: 'C_REPORT_AUTHORITY', anyOf: [] }] } }], gates), /anyOf/);
  assert.throws(() => validateItemRoutes([{ id: 'Q1' }, { id: 'Q1' }], gates), /Duplicate/);
  assert.throws(() => validateItemRoutes([{ id: 'Q1', route: { all: [{ questionId: 'C_REPORT_AUTHORITY', anyOf: ['invalid'] }] } }], gates), /Unknown gate answer/);
});

test('draft route proposal references known non-scored gates and candidate items', () => {
  const gateById = new Map(routePlan.gate_questions.map((gate) => [gate.id, gate]));
  const candidateIds = new Set(candidateBank.items.map((item) => item.id));
  assert.ok(routePlan.gate_questions.every((gate) => gate.scoreable === false));
  for (const route of routePlan.candidate_item_routes) {
    const gate = gateById.get(route.condition.question_id);
    assert.ok(gate, `unknown gate ${route.condition.question_id}`);
    assert.ok(route.item_ids.every((id) => candidateIds.has(id)), 'route references missing candidate item');
    assert.ok(route.condition.any_of.every((answer) => gate.draft_options.includes(answer)), 'route references unknown gate option');
  }
});
