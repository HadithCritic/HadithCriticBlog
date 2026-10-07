/**
 * Resolve candidate item routes from categorical, non-scored gate answers.
 * Items without route metadata remain active. Missing, unrecognized, or
 * contradictory gate answers make a conditional item inactive by default.
 */
export function resolveItemRoutes(items, gateQuestions, gateAnswers = {}) {
  validateItemRoutes(items, gateQuestions);
  return items.map((item) => {
    const conditions = item.route?.all ?? [];
    const active = conditions.every(({ questionId, anyOf }) => {
      const answer = gateAnswers?.[questionId];
      return typeof answer === "string" && anyOf.includes(answer);
    });
    return { ...item, active };
  });
}

/** Reject ambiguous routing metadata rather than silently broadening a route. */
export function validateItemRoutes(items, gateQuestions = []) {
  if (!Array.isArray(gateQuestions)) throw new Error("gateQuestions must be an array");
  const gatesById = new Map();
  for (const gate of gateQuestions) {
    if (!gate || typeof gate.id !== "string" || !gate.id || gatesById.has(gate.id)) {
      throw new Error("Every gate question needs a unique non-empty string id");
    }
    gatesById.set(gate.id, gate);
  }

  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item.id !== "string" || !item.id) {
      throw new Error("Every routed item needs a non-empty string id");
    }
    if (ids.has(item.id)) throw new Error(`Duplicate routed item id: ${item.id}`);
    ids.add(item.id);
  }

  for (const item of items) {
    if (item.route === undefined) continue;
    if (!item.route || !Array.isArray(item.route.all) || item.route.all.length === 0) {
      throw new Error(`Invalid route on ${item.id}: expected a non-empty route.all list`);
    }
    for (const condition of item.route.all) {
      if (!condition || typeof condition.questionId !== "string" || !condition.questionId) {
        throw new Error(`Invalid route condition on ${item.id}: missing questionId`);
      }
      const gate = gatesById.get(condition.questionId);
      if (!gate) throw new Error(`Unknown gate question on ${item.id}: ${condition.questionId}`);
      if (!Array.isArray(condition.anyOf) || condition.anyOf.length === 0
        || condition.anyOf.some((value) => typeof value !== "string" || !value)) {
        throw new Error(`Invalid route condition on ${item.id}: expected non-empty string anyOf values`);
      }
      if (Array.isArray(gate.options)
        && condition.anyOf.some((value) => !gate.options.includes(value))) {
        throw new Error(`Unknown gate answer on ${item.id}: ${condition.questionId}`);
      }
    }
  }
  return true;
}
