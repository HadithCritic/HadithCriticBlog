const ATTRIBUTION_TYPES = new Set([
  "author_argument",
  "author_ruling",
  "quoted_view",
  "reported_view",
  "editorial_inference",
]);

const SPECIALIST_FINDINGS = new Set([
  "supported",
  "supported_with_qualification",
  "disputed",
]);

const sha256 = (value) => typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const stringList = (value) => Array.isArray(value) && value.every(nonEmpty);
const isoDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

function hasQualifiedReview(review, allowedStatuses) {
  return review &&
    allowedStatuses.has(review.status) &&
    nonEmpty(review.qualification) &&
    nonEmpty(review.sourceConsulted) &&
    isoDate(review.reviewedOn);
}

/** Return only a deliberately small public projection after metadata gates. */
function toPublicEvidence(record) {
  if (!record || record.releaseStatus !== "approved") return null;
  if (!Array.isArray(record.axisIds) || !record.axisIds.length || !record.axisIds.every(nonEmpty)) return null;
  if (!record.source || !record.attribution || !record.review || !record.translation || !record.rights) return null;

  const source = record.source;
  const attribution = record.attribution;
  const specialist = record.review.specialist;
  const bilingual = record.review.bilingual;
  if (!nonEmpty(record.id) || !nonEmpty(source.authorLabel) || !nonEmpty(source.workTitle) || !nonEmpty(source.editionLabel)) return null;
  if (source.editionStatus !== "collated" || !nonEmpty(source.printedLocator) || !nonEmpty(source.digitalLocator)) return null;
  if (!nonEmpty(source.arabicText) || !nonEmpty(source.englishText) || !sha256(source.arabicSha256) || !sha256(source.englishSha256)) return null;
  if (!ATTRIBUTION_TYPES.has(attribution.type) || !nonEmpty(attribution.claim) || !nonEmpty(attribution.scopeNote)) return null;
  if (!SPECIALIST_FINDINGS.has(attribution.finding) || !stringList(attribution.qualifications) || !stringList(attribution.counterEvidence) || !stringList(attribution.unresolved)) return null;
  if (!hasQualifiedReview(specialist, SPECIALIST_FINDINGS) || specialist.finding !== attribution.finding) return null;
  if (!hasQualifiedReview(bilingual, new Set(["approved"])) || bilingual.arabicSha256 !== source.arabicSha256 || bilingual.englishSha256 !== source.englishSha256) return null;
  if (record.translation.status !== "approved") return null;
  if (record.rights.status !== "cleared" || !nonEmpty(record.rights.basis) || !nonEmpty(record.rights.authorizedUse)) return null;

  // Allowlist fields rather than forwarding research-store objects to the DOM.
  return {
    id: record.id,
    axisIds: [...new Set(record.axisIds)],
    authorLabel: source.authorLabel,
    workTitle: source.workTitle,
    editionLabel: source.editionLabel,
    printedLocator: source.printedLocator,
    digitalLocator: source.digitalLocator,
    arabicText: source.arabicText,
    englishText: source.englishText,
    attributionType: attribution.type,
    finding: attribution.finding,
    claim: attribution.claim,
    scopeNote: attribution.scopeNote,
    qualifications: [...attribution.qualifications],
    counterEvidence: [...attribution.counterEvidence],
    unresolved: [...attribution.unresolved],
    reviewerQualifications: [specialist.qualification, bilingual.qualification],
  };
}

async function digestMatches(text, expected) {
  if (!globalThis.crypto?.subtle || !globalThis.TextEncoder) return false;
  try {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    const actual = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return actual === expected.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Select exact-text records only. Text hashes bind bilingual review to the
 * precise Arabic and English strings; unavailable WebCrypto fails closed.
 */
export async function selectPublicEvidence(records, axisId) {
  if (!Array.isArray(records) || (axisId !== undefined && !nonEmpty(axisId))) return [];
  const seen = new Set();
  const selected = [];
  for (const record of records) {
    const published = toPublicEvidence(record);
    if (!published || (axisId !== undefined && !published.axisIds.includes(axisId)) || seen.has(published.id)) continue;
    if (!await digestMatches(published.arabicText, record.source.arabicSha256)) continue;
    if (!await digestMatches(published.englishText, record.source.englishSha256)) continue;
    seen.add(published.id);
    selected.push(published);
  }
  return selected;
}
