const NUMERIC_RESPONSES = new Set([-2, -1, 0, 1, 2]);

/**
 * Score only the respondent's answers. This function knows nothing about
 * historical profiles, source authenticity, or doctrinal correctness.
 * `items` should contain only items shown on the selected route; set
 * `active: false` to exclude a conditional item from its denominator.
 */
export function scoreAxes(axisDefinitions, items, answers) {
  const axisIds = new Set(axisDefinitions.map((axis) => axis.id));
  const accumulators = new Map(axisDefinitions.map((axis) => [axis.id, {
    eligible: 0,
    answered: 0,
    weightedTotal: 0,
    totalWeight: 0,
    positive: false,
    negative: false,
    neutral: false,
  }]));

  for (const item of items) {
    if (item.active === false) continue;
    if (!axisIds.has(item.axis)) throw new Error(`Unknown axis on item ${item.id}: ${item.axis}`);
    if (![1, -1].includes(item.direction)) throw new Error(`Invalid direction on item ${item.id}`);
    const weight = item.weight ?? 1;
    if (!Number.isFinite(weight) || weight <= 0) throw new Error(`Invalid weight on item ${item.id}`);

    const accumulator = accumulators.get(item.axis);
    accumulator.eligible += 1;
    const response = answers?.[item.id];
    const numericInput = typeof response === "number"
      ? Number.isInteger(response)
      : typeof response === "string" && /^-?[0-2]$/.test(response);
    if (!numericInput) continue;
    const numericResponse = Number(response);
    if (!NUMERIC_RESPONSES.has(numericResponse)) continue;

    const directedResponse = item.direction * numericResponse;
    accumulator.answered += 1;
    accumulator.weightedTotal += weight * directedResponse;
    accumulator.totalWeight += weight;
    if (directedResponse > 0) accumulator.positive = true;
    else if (directedResponse < 0) accumulator.negative = true;
    else accumulator.neutral = true;
  }

  return axisDefinitions.map((axis) => {
    const value = accumulators.get(axis.id);
    if (value.totalWeight === 0) {
      return {
        axisId: axis.id,
        score: null,
        mean: null,
        answered: 0,
        eligible: value.eligible,
        pattern: "unavailable",
      };
    }
    const mean = value.weightedTotal / value.totalWeight;
    const score = 50 + 25 * mean;
    return {
      axisId: axis.id,
      score,
      displayScore: Math.round(score),
      mean,
      answered: value.answered,
      eligible: value.eligible,
      pattern: value.positive && value.negative ? "mixed" : value.neutral && !value.positive && !value.negative ? "neutral" : "directional",
    };
  });
}

/**
 * Descriptive method comparison on jointly covered axes only. Similarity is
 * 100 minus mean absolute distance, not a probability or identity estimate.
 */
export function compareMethodProfile(userScores, profileScores, minimumAxes = 8) {
  const userByAxis = new Map(userScores.map((entry) => [entry.axisId, entry.score]));
  const profileByAxis = new Map(Object.entries(profileScores ?? {}));
  const comparable = [...userByAxis.entries()]
    .filter(([axisId, userScore]) => Number.isFinite(userScore) && Number.isFinite(profileByAxis.get(axisId)))
    .map(([axisId, userScore]) => ({ axisId, distance: Math.abs(userScore - profileByAxis.get(axisId)) }));

  if (comparable.length < minimumAxes) {
    return { status: "insufficient_evidence", similarity: null, distance: null, comparableAxes: comparable.map(({ axisId }) => axisId), requiredAxes: minimumAxes };
  }
  const distance = comparable.reduce((sum, item) => sum + item.distance, 0) / comparable.length;
  return {
    status: "descriptive_comparison",
    similarity: 100 - distance,
    distance,
    comparableAxes: comparable.map(({ axisId }) => axisId),
    requiredAxes: minimumAxes,
    interpretation: "Chosen descriptive index on the jointly covered axes; not a probability of identity or correctness.",
  };
}

/** Compare case answers separately from method coordinates. */
export function compareRulingAnswers(userAnswers, profileAnswers, reviewedComparableItemIds) {
  const agreements = [];
  for (const itemId of reviewedComparableItemIds) {
    const user = userAnswers?.[itemId];
    const profile = profileAnswers?.[itemId];
    if (user === undefined || user === null || user === "unknown" || user === "na") continue;
    if (profile === undefined || profile === null || profile === "unknown" || profile === "na") continue;
    agreements.push({ itemId, agrees: String(user) === String(profile) });
  }
  if (!agreements.length) return { status: "insufficient_evidence", agreement: null, comparableItems: [] };
  const agreement = agreements.filter((item) => item.agrees).length / agreements.length;
  return {
    status: "descriptive_comparison",
    agreement,
    displayAgreement: Math.round(agreement * 100),
    comparableItems: agreements.map(({ itemId }) => itemId),
    interpretation: "Exact answer agreement on reviewed, comparable case items; calculated separately from method similarity.",
  };
}
