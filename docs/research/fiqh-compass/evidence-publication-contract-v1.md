# Public evidence publication contract

Status: **implemented and tested against synthetic records; no real entry is approved or published**.

The quiz results include one evidence/review disclosure per axis. The current
public evidence manifest is intentionally empty. The disclosure says no reviewed
historical passage is cleared for that dimension and explains that the displayed
coordinate summarizes only the respondent's draft-item answers.

## Fail-closed requirements

`src/lib/fiqh-compass-evidence.js` only projects a record into public fields if
all of the following metadata is present:

- explicit `releaseStatus: approved` and one or more recognized axis IDs;
- author/work labels, a named edition, a collated edition state, and both
  printed and digital locators;
- Arabic text, English text, exact SHA-256 fields, and an approved translation
  status;
- a recognized attribution type, bounded claim, scope note, and explicit
  qualification, counterevidence, and unresolved-question arrays;
- a recorded specialist finding of supported, supported with qualification, or
  disputed, with qualification, source consulted, and review date;
- an approved Arabic-English review with qualification, source consulted, date,
  and reviewed Arabic/English hashes matching the source text hashes; and
- rights marked cleared, with a basis and authorized-use statement.

At render time the browser recomputes SHA-256 over the exact Arabic and English
strings using WebCrypto. Missing WebCrypto, malformed hashes, stale review
hashes, or any missing gate excludes the record. The public projection is an
allowlist; reviewer names and internal editorial notes are not forwarded. The
quiz inserts text using DOM `textContent`, not HTML parsing. Qualifications,
counterevidence, and unresolved questions are retained for display, including
when a specialist finding is disputed or qualified.

The contract prevents accidental display of ordinary candidate rows; it does
not independently authenticate a reviewer, verify the underlying scan, or
establish a license. Those still require evidence-backed editorial records.
Evidence display eligibility is separate from profile-score eligibility. The
current manifest at `src/data/fiqh-compass-evidence.ts` has zero entries.

Three synthetic unit tests cover rejection when review, edition, translation,
rights, or exact-text hash gates fail; preservation of caveats and allowlist
projection; and per-axis selection/deduplication. These tests validate software
guardrails, not any real source or scholarly decision.
