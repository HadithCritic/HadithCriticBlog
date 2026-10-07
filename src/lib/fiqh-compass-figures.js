/**
 * Compare a respondent's axis coordinates with historical figures' placements.
 *
 * A figure stands on an axis only where src/data/fiqh-compass-figures.json
 * places him, each placement citing a passage. Positions run -1..1; a
 * respondent's 0..100 axis score maps onto the same range. Nothing here
 * judges either side correct: it measures distance on the dimensions both
 * share, and nothing else. Similarity is compareMethodProfile's index, 100
 * minus the mean distance on the 0..100 scale.
 */

import { compareMethodProfile } from "./fiqh-compass-scoring.js";

/** Pull to the middle for a figure compared on few dimensions, so two shared axes cannot outrank ten. */
const SHRINK = 2;
export const MIN_SHARED = 2;

export const toUnit = (score) => (score - 50) / 50;
export const toScore = (unit) => 50 + 50 * unit;

/** Mean placement per figure and axis: Map<figureId, Map<axisId, number>>. */
export function figurePositions(placements) {
  const sums = new Map();
  for (const p of placements) {
    const axes = sums.get(p.figure) ?? new Map();
    const [total, count] = axes.get(p.axis) ?? [0, 0];
    axes.set(p.axis, [total + p.position, count + 1]);
    sums.set(p.figure, axes);
  }
  return new Map([...sums].map(([figure, axes]) => [
    figure,
    new Map([...axes].map(([axis, [total, count]]) => [axis, total / count])),
  ]));
}

export function relation(gap) {
  if (gap <= 0.5) return "agree";
  if (gap >= 1) return "differ";
  return "partly";
}

function compareOne(figure, positions, respondent) {
  const axes = [];
  for (const [axisId, position] of positions) {
    const score = respondent.get(axisId);
    if (score === undefined) continue;
    const gap = Math.abs(toUnit(score) - position);
    axes.push({ axisId, respondent: score, figure: toScore(position), gap, relation: relation(gap) });
  }
  const profile = Object.fromEntries([...positions].map(([axisId, position]) => [axisId, toScore(position)]));
  const userScores = [...respondent].map(([axisId, score]) => ({ axisId, score }));
  const { similarity } = compareMethodProfile(userScores, profile, 1);
  if (similarity === null) return { figure, axes, agreement: null, rank: -Infinity };
  const rank = 50 + (similarity - 50) * (axes.length / (axes.length + SHRINK));
  return { figure, axes, agreement: similarity, rank };
}

function ordered(figures, positionsByFigure, respondent) {
  return figures
    .map((figure) => compareOne(figure, positionsByFigure.get(figure.id) ?? new Map(), respondent))
    .sort((a, b) => b.rank - a.rank || b.axes.length - a.axes.length || a.figure.died_ah - b.figure.died_ah);
}

/**
 * Rank figures by closeness to the respondent.
 * axisScores: [{ axisId, score }] with score null where the respondent has no coordinate.
 * Returns { compared, tooFew, stability } where stability says how often the
 * closest figure stays closest when one shared dimension is left out.
 */
export function compareFigures(axisScores, figures, placements) {
  const respondent = new Map(axisScores.filter((a) => a.score !== null).map((a) => [a.axisId, a.score]));
  const positions = figurePositions(placements);
  const all = ordered(figures, positions, respondent);
  const compared = all.filter((entry) => entry.axes.length >= MIN_SHARED);
  const tooFew = all.filter((entry) => entry.axes.length < MIN_SHARED).map((entry) => entry.figure);
  let stability = null;
  if (compared.length > 1) {
    const top = compared[0];
    const checks = top.axes.map(({ axisId }) => {
      const without = new Map(respondent);
      without.delete(axisId);
      const rerun = ordered(figures, positions, without).filter((entry) => entry.axes.length >= MIN_SHARED);
      return rerun[0]?.figure.id === top.figure.id;
    });
    stability = { held: checks.filter(Boolean).length, of: checks.length };
  }
  return { compared, tooFew, stability };
}
