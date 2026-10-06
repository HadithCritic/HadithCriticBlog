import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { selectPublicEvidence } from "../fiqh-compass-evidence.js";

const arabicText = "نصّ تجريبي لا يخص مصدرًا حقيقيًا";
const englishText = "Synthetic text, not a real quotation.";
const digest = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const hashA = digest(arabicText);
const hashB = digest(englishText);

function reviewedRecord(overrides = {}) {
  return {
    id: "synthetic-evidence-1",
    releaseStatus: "approved",
    axisIds: ["A01"],
    source: {
      authorLabel: "Synthetic author",
      workTitle: "Synthetic work",
      editionLabel: "Synthetic edition",
      editionStatus: "collated",
      printedLocator: "vol. 1, p. 1",
      digitalLocator: "record 1",
      arabicText,
      englishText,
      arabicSha256: hashA,
      englishSha256: hashB,
    },
    attribution: {
      type: "author_argument",
      finding: "supported_with_qualification",
      claim: "Synthetic bounded claim.",
      scopeNote: "Synthetic test only.",
      qualifications: ["Synthetic qualification."],
      counterEvidence: ["Synthetic contrary evidence note."],
      unresolved: ["Synthetic unresolved note."],
    },
    review: {
      specialist: {
        status: "supported_with_qualification",
        finding: "supported_with_qualification",
        qualification: "Synthetic subject-review role",
        sourceConsulted: "Synthetic witness checked for test coverage",
        reviewedOn: "2026-01-01",
      },
      bilingual: {
        status: "approved",
        qualification: "Synthetic Arabic-English review role",
        sourceConsulted: "Synthetic source and translation checked for test coverage",
        reviewedOn: "2026-01-02",
        arabicSha256: hashA,
        englishSha256: hashB,
      },
    },
    translation: { status: "approved" },
    rights: { status: "cleared", basis: "Synthetic test basis", authorizedUse: "Synthetic test only" },
    internalEditorialNotes: "Must not be included in the public projection.",
    ...overrides,
  };
}

test("evidence stays fail-closed unless review, edition, translation, and rights gates are complete", async () => {
  const source = reviewedRecord();
  const rejected = [
    { ...source, releaseStatus: "candidate" },
    { ...source, source: { ...source.source, editionStatus: "unresolved" } },
    { ...source, rights: { status: "needs_review", basis: "", authorizedUse: "" } },
    { ...source, translation: { status: "working_draft" } },
    { ...source, review: { ...source.review, specialist: { ...source.review.specialist, status: "unable_to_assess" } } },
    { ...source, review: { ...source.review, bilingual: { ...source.review.bilingual, englishSha256: "c".repeat(64) } } },
    { ...source, attribution: { ...source.attribution, finding: "contradicted" } },
    { ...source, source: { ...source.source, arabicSha256: "invalid" } },
  ];
  for (const record of rejected) assert.deepEqual(await selectPublicEvidence([record]), []);
  assert.deepEqual(await selectPublicEvidence([{
    ...source,
    source: { ...source.source, arabicText: `${arabicText} تغير` },
  }]), []);
});

test("approved disputed and qualified records preserve caveats while exposing only allowlisted fields", async () => {
  const record = reviewedRecord({ internalSecret: "not for public output" });
  const [publicRecord] = await selectPublicEvidence([record]);
  assert.ok(publicRecord);
  assert.equal(publicRecord.finding, "supported_with_qualification");
  assert.deepEqual(publicRecord.qualifications, ["Synthetic qualification."]);
  assert.deepEqual(publicRecord.counterEvidence, ["Synthetic contrary evidence note."]);
  assert.deepEqual(publicRecord.unresolved, ["Synthetic unresolved note."]);
  assert.equal("internalEditorialNotes" in publicRecord, false);
  assert.equal("internalSecret" in publicRecord, false);
});

test("selection filters by axis and removes duplicate evidence ids", async () => {
  const first = reviewedRecord();
  const otherAxis = reviewedRecord({ id: "synthetic-evidence-2", axisIds: ["A02"] });
  assert.deepEqual((await selectPublicEvidence([first, first, otherAxis], "A01")).map((entry) => entry.id), ["synthetic-evidence-1"]);
  assert.deepEqual((await selectPublicEvidence([first, otherAxis], "A02")).map((entry) => entry.id), ["synthetic-evidence-2"]);
  assert.deepEqual(await selectPublicEvidence([first], "A12"), []);
});
