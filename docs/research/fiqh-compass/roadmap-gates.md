# Fiqh Compass roadmap gate register

Updated: 2026-10-05
Authority: `C:/Users/Jonathan/Downloads/Fiqh_Compass_Complete_Project_Roadmap.md`  
Overall status: **M1 research prototype in progress; public version 1.0 is not release-ready.**

This register records what current artifacts prove, rather than estimating a
project-completion percentage. `Met` means there is direct artifact or test
evidence for that individual criterion. `Partial` means a scaffold exists but
does not satisfy the full criterion. `Open` means the criterion is outstanding.

## M1 — Research prototype

**Gate: open.** The 20 dossiers are populated with traceable candidate readings,
but positions are unreviewed. The current store has 28 candidate positions and
working translations, eight candidate profiles, 24 draft questions, and a
candidate/source coverage audit.

- **Update:** A 1344H [NYU/AUB *al-Majmuʿ* vol. 8 scan](https://sites.dlib.nyu.edu/viewer/books/aub_aco003847/display?lang=ar) visually confirms the tawaf-count candidate at printed p. 21 in its commentary layer. An [NYU/AUB 1926 *al-Mughni* vol. 3 scan](https://sites.dlib.nyu.edu/viewer/books/aub_aco003830/display?lang=ar) has a different passage at its printed p. 344, so that witness does not collate the Shamela 8463 digital p. 344 by page number. The exact local manifestations remain unidentified, and specialists have not determined whether the two authors' reasoning differs materially; the worked-example criterion stays open.

- **I17 scan update:** Maknoon and Internet Archive expose volume 3 page images that appear to be the same Cairo Library scan; the title page provides a candidate match and the p. 344 image visibly prints p. 344. The complete Maknoon page OCR contains the normalized local Shamela 8463/page 344 row, including sections 2463–2465. Waqfeya catalogs the 10-volume set as 1388 AH / 1968 CE and links an Internet Archive PDF; the title-page year is not securely legible, and CiNii/Shamela retain their distinct set-date claims. This supports candidate text-to-page alignment, not an independent physical witness or proof of Shamela's scan provenance. Scan/text rights and scholarly attribution remain unresolved. Do not treat this as an approved ruling or score (`coverage-acquisition-audit.md`).

**Acquisition and scan check:** The [Waqfeyah listing](https://waqfeyah.wordpress.com/2002/10/22/12691/) links volume 3 through Internet Archive. The linked 526-page PDF was later retrieved and its title page and printed p. 344 visually inspected; its p. 344 page OCR contains the normalized local Shamela row. Maknoon and Archive appear to expose the same scan, so these are two access routes rather than independent physical witnesses. The scan supports a candidate text/page concordance, while exact Shamela source lineage, the volume-level year, scholarly attribution, and reuse rights remain unresolved (`AQ-H01`; see `coverage-acquisition-audit.md`).

| Acceptance criterion | Status | Evidence / gap |
|---|---|---|
| Every dossier has traceable evidence or is explicitly unresolved; unresolved material cannot support scoring | Partial | All 20 dossiers have source-linked candidate records and exact Parquet text/locator validation; relevance and scholarly interpretation remain unreviewed. |
| Every encoded profile answer cites a reviewed passage or a labeled reconstruction | Open | No profile answers are approved; scoring and profile coordinates remain disabled. |
| Each axis has at least two draft items | Met | 24 draft items cover 12 axes, two per axis. This is a count check, not evidence that the items measure their definitions. |
| All items receive reader comprehension checks and resulting corrections | Open | The participant-safe 5–8-reader protocol is prepared in `M1-human-review-protocol.md`; no participants have been recruited and no item has a human comprehension record. |
| Missing and inapplicable data are handled explicitly | Partial | “I am not sure,” “Not applicable,” and skipped answers are excluded from coordinates; profile coverage and uncertainty display still need fuller treatment. |
| Prototype demonstrates one shared ruling reached through different reasoning | Open | No sufficiently verified comparative example has been documented. |
| Remaining source gaps have named acquisition tasks | Partial | Queue covers Ibadi, Zaydi, Imami/Twelver, Ismaili, and Qurʾan-alone leads. A bounded scan of the latest 8,538-ID index found no direct source for these areas within Shamela; an external *al-Nil* print-scan and one unreviewed, unscored Ibadi passage are now recorded. This does not establish school-wide representation or eligibility for matching. Al-Shawkani materials remain candidates for an individual profile only. Direct-source acquisition, edition/rights review, and specialist coverage remain unresolved (`catalog-coverage-scan.md`). |

## M2 — Reviewed research foundation

**Gate: not passed; foundational tooling is partial.** A private structured store,
stable passage IDs, source reconciliation, and a targeted coverage audit exist.
The evidence is not yet a reviewed research foundation.

- **Partial:** schema v2 and a deterministic private export now model authors,
  works, manifestations, access objects, rights claims, acquisition leads, and
  external passages separately. Five candidate works, seven manifestations,
  ten access records, and five acquisition leads are recorded; one external
  *al-Nil* passage is stored as a hash-checked machine candidate with unresolved
  attribution, no issue/profile link, and rights pending. Edition and full
  text/scan matching remain incomplete. The older 8,538 Shamela rows still need
  evidence-backed work/edition resolution. The *al-Mughnī* volume 3 lead now
  includes a Maknoon scan: its page-1 title image identifies the work, author,
  volume, editor, and Cairo Library publisher; its image of printed p. 344 and
  page OCR match the full local Shamela 8463/page 344 row, including sections
  2463–2465. This is candidate text-to-page evidence within one displayed scan,
  not proof of scan provenance or the source lineage of Shamela. The title-page
  year remains unreadable; CiNii and Shamela date spans differ; passage
  attribution, specialist interpretation, and reuse rights remain unresolved
  (`AQ-H01`). The Shamela-mirror claim that its numbering matches print remains
  same-source-family metadata, not independent evidence.
  A separate Twelver/Imāmī lead now has volume-title-page inspections for
  volumes 1 and 2 of al-Ṭūsī's *al-Mabsūṭ* in NYU- and Princeton-provided ACO
  scans. Canvas 5 in each identifies the volume, work, editor, publisher, and
  1387 AH. Volume 1 visibly bears a printed rights-reserved notice. These are
  title-page candidate matches only; the rest of the set, pagination, full text
  collation, and project-specific reuse rights remain unresolved (`AQ-T01`).
- **Open:** expand toward 40–60 dossiers and 10–15 bounded profiles.
- **Open:** acquire and edition-check direct Ibadi, Zaydi, Twelver/Imami, and
  specified self-representative Qurʾan-alone sources.
- **Partial:** coverage/gap records and a bounded literal-query scan across all
  8,538 current catalog IDs now exist; results document false positives,
  specific title collisions, and the distinction between al-Shawkani and
  school-representative Zaydi coverage. Follow-up checks identified a
  BSB manuscript witness for *al-Baḥr al-zakhkhār*, an NYU scan for al-Ṭūsī's
  *al-Mabsūṭ*, and a bounded self-representative Rashad Khalifa lead. The BSB
  witness is catalogued as 189 leaves, copied 1032 AH / 1623 CE; canvas 3 of its
  451-image IIIF sequence visibly bears the work title. Canvas labels are not
  foliated and no Usul.ai/print equivalence is established. DDB displays a
  CC BY-NC-SA 4.0 notice while the BSB IIIF manifest states Public Domain Mark
  1.0; reuse scope remains unresolved. Its linked authority gives raw dates
  1373–1437 without a stated era, not reconciled with AH variants. The
  *al-Nīl* title page now identifies a 1423/2002 first-edition printing
  that reproduces the 1287/1967 second edition; preliminary p. 17's three-copy
  correction note and a separate 2003 Omani catalog record still need
  reconciliation. The stored page-50 passage is a candidate, not a reviewed
  position. Edition/page mapping, source-layer attribution, rights, source
  interpretation, and a complete reviewed profile × issue coverage
  analysis by period, domain, language, and source type remain open. A first
  reproducible, metadata-only matrix now covers 8 candidate profiles × 20 issues
  (160 cells): 23 cells have profile-position candidates, 73 have source-linked
  passage candidates only, and 64 have no linked candidate in the current store.
  It records source, period/tradition, domain, language/translation, and review
  states without passage text; blank profile metadata remains blank. This is a
  coverage inventory, not scholarly review or proof of absence
  (`profile-issue-coverage-v1.md`, `.csv`; generator: `scripts/fiqh-compass/export_profile_issue_coverage.py`).
- **Open:** specialist review of translations, attribution, scope, and
  conflicting passages; identify profiles eligible for matching.

## M3 — Complete candidate instrument

**Gate: in progress.** A 96-item editorial candidate bank now covers eight
drafts per provisional axis. Only the original 24 appear in the prototype quiz;
the other 72 remain private, unscored candidates. A draft deterministic scoring
specification and synthetic tests now exist, but this does not validate the
instrument or authorize historical comparisons.

- **Partial:** `instrument-candidate-bank-v1.json` contains 96 prompts, eight
  per axis with four positive and four negative directions. Q25-Q96 are only
  topically linked to research issues; they have no reviewed passage mappings,
  comprehension records, or publication/score eligibility. The 96-item
  editorial pre-screen is complete; its construct flags and limits are recorded
  in `instrument-editorial-screen-v1.md`.
- **Partial:** `instrument-editorial-screen-v1.md` records an initial construct,
  wording, role/domain, and redundancy screen for all twelve axes. It flags
  mixed constructs (especially A06, A10, A11, and A12), near-duplicate prompts,
  and pairs that do not state opposite positions on one scale. This is an
  editorial checkpoint only; it does not satisfy scholarly, bilingual, reader,
  or psychometric review, and it changes no item or historical score.
- **Partial:** `scoring-spec-v1.md` records the equal-weight prototype formula,
  missing-answer treatment, mixed-response display, eight-axis method-match
  floor, and separate case agreement. Pure functions are covered by 11 passing
  synthetic tests. The scoring rule is draft, not frozen or calibrated.
- **Partial:** a fail-closed routing helper and draft categorical gates for
  report-authority assumptions and respondent role now exist in
  `fiqh-compass-routing.js` and `instrument-routing-proposal-v1.json`; focused
  tests cover inactive-item denominator handling, role separation, and malformed
  routes. The helper is not connected to the quiz. Gate wording, candidate routes,
  evidence mappings, and local-storage behavior require editorial, specialist,
  bilingual, and reader review before integration.
- **Open:** evidence-backed mappings for retained items, profile coding and
  disputed-position sensitivity, reviewer-approved worked examples, and
  evaluation of short-form thresholds.

## M4 — Usable private alpha

**Gate: partial scaffold only.** The site contains an overview, separate quiz,
issue/profile indexes, responsive quiz flow, progress controls, local saving,
provisional results, and correction intake. The latest `npm run check` covered
222 files with 0 errors, warnings, or hints. `npm run test:design` passed across
247 source files; nine warnings are in unrelated site/article files. The fresh
isolated `dist-fc-review-m11` production build completed and Pagefind indexed
705 pages. All four focused Chromium journeys passed against this build,
including no-JavaScript reading, resume/results, phone/keyboard use, and
correction isolation. The correction endpoint remains mocked, so delivery and
account retention are unverified. A bounded technical review is recorded in
`M4-quiz-technical-audit-2026-10-05.md`.
The quiz now exposes all 24 questions and definitions with JavaScript off, and a
focused Chromium check confirms answers remain in-page and the URL does not
change. No-script respondents still cannot get an automatic summary or save and
resume. Arabic quiz/result support remains open. A restricted paired-review packet places exact English strings beside first-draft Arabic for the 12 axis definitions, 24 live questions, and seven response choices (`scratch/fiqh-compass/instrument-bilingual-review-packet-v1.json`). It is excluded from site content; all entries remain unreviewed, with zero bilingual approvals. This advances review preparation only and does not close Arabic support or authorize scoring; the quiz is verified at 320px
and 390px with a complete keyboard path through answers to results. The run
checks reduced-motion preference and 200% root font-size reflow. Rendered
contrast passes on the five overview, issue, profile, correction, and quiz
routes in both themes. Manual screen-reader/full keyboard review, actual
browser-zoom behavior, and other focus, hover, and disabled states remain open. The revealed results state has been checked at
1440px and 390px in both themes for a neutral-answer presentation and an
all-skipped presentation; the latter shows 12 no-score rows and no meters. The
all-unknown path also selects “I am not sure” for all 24 items and shows 12
no-score rows with no meters. Each of these three presentations has zero text
contrast failures in both themes at 1440px and 390px. This is presentation
evidence, not score validation. The contrast checker now opens all 12 per-axis
evidence disclosures before measuring. A fail-closed disclosure implementation
shows no historical passage because the approved evidence manifest is empty;
it explains the respondent-only scope for each axis. Exact Arabic/English text
must pass WebCrypto SHA-256 checks before an approved entry can render. Three
synthetic unit tests exercise the guardrails. This verifies software behavior
and presentation, not actual evidence, scholarly approval, license status, or
score validity. The latest isolated review build is `dist-fc-review-m11`.

Current UI hardening also passes `npm run test:design` across 247 source files;
the audit reports nine warnings in unrelated site/article files. The M3 scorer
and routing modules pass 11 and 6 synthetic tests, respectively. `/research/`
remains unindexed because it lacks an HTML root element.

- **Partial:** introduction, quiz, result dimensions, accessibility labels,
  local resume, and a source/profile browse scaffold are present. The no-script
  view exposes all 24 response items and prevents answer-bearing GET requests,
  but cannot produce a result or persist responses.
- **Partial:** respondent-axis calculation is now a pure tested module; method
  similarity and case-answer agreement are implemented as separate helpers but
  no reviewed profiles are eligible for public comparison.
- **Open:** reviewed content contract and adequate instrument precede final alpha.
- **Partial:** each result axis has an evidence/review disclosure with an honest
  empty state and a fail-closed publication gate for reviewed Arabic, approved
  translation, edition, attribution, scope, caveats, and cleared rights. The
  manifest has zero approved entries; actual reviewed passages and separate
  method/ruling comparisons remain open.
- **Partial:** dedicated correction intake with Arabic guidance captures
  category, issue/page reference, citation/URL, correction text, and optional reply email;
  issue, profile, overview, and quiz-result links route into it. The form never
  reads or submits browser-stored quiz answers. A Chromium check at a 390px
  viewport verifies prefill, keyboard tab access, and a mocked submission with
  seeded quiz data remaining unread and absent from the request. No live
  submission was sent. A public review-process explanation and internal draft
  handling procedure now distinguish triage states and source verification;
  neither an accountable editor nor the account's Web3Forms retention/routing
  settings have been verified. The two-axis comparison view and complete
  end-to-end alpha evaluation remain open.

- **Methodology-page scaffold:** `/projects/fiqh-compass/methodology/` is now linked in project navigation. Its no-JavaScript test confirms a single main landmark, explicit prototype limits, attribution layers, current Arabic/profile review state, and working issue/profile/quiz/correction links. It passed the rendered contrast check in both themes at desktop and 390px. This is a public-process explanation scaffold, not an evidence approval or release-candidate gate pass.

## M5 — Evaluated beta

**Gate: not started.** Recruit testers, run comprehension and usability checks,
revise or remove unclear items, evaluate routing and scoring sensitivity, and
document limitations and item-selection rationale. The M1 comprehension exercise
must not be substituted by an LLM-only review.

## M6 — Release candidate

**Gate: not started (release candidate); preparatory page scaffolds are partial.** A dedicated public methodology route now documents source attribution layers, the current prototype limits, answer handling, privacy, and correction paths. The existing profile directory describes candidate authors and coverage goals without assigning coordinates. These pages are static and usable without JavaScript, but they do not satisfy M6 on their own. Prepare a frozen reviewed content release, an approved English/Arabic experience, reviewed bounded profiles, the full correction policy, release/change log, and backup/rollback procedure. Verify rights, mobile behavior, keyboard and screen-reader access, contrast, deterministic results, and safe rendering before release.

## M7 — Public beta

**Gate: not started.** Requires an approved release candidate and configured
hosting. Run a limited public release with visible scope limits, operational
monitoring, correction handling, privacy protection, backups, and issue-specific
verification. Public deployment remains subject to final user approval.

## M8 — Public version 1.0

**Gate: not started.** Requires M7 issues resolved, reproducible versioned
releases, all roadmap acceptance items verified, reviewed English and Arabic
experiences, evidence-backed results, explicit unknowns and coverage, and a
documented editor maintenance handoff. The acceptance checklist in roadmap
section 13 is the release authority; a passing build alone is insufficient.

## Next actions

1. Resolve the I17 *al-Umm* p. 154 source-layer warning against the exact
   Shamela manifestation and a print scan; seek a separate, aligned
   shared-ruling/different-reasoning example if attribution cannot be verified.
   The 96-item editorial pre-screen is complete; specialist, bilingual, and
   reader review and resulting item decisions remain open.
2. Recruit readers and conduct comprehension sessions for retained wording;
   the protocol is prepared, but no human review has occurred.
3. Reconcile the *al-Nīl* edition metadata; map target passages to printed
   locators in the title-page-checked *al-Mabsūṭ* volumes; map BSB manuscript
   folios to IIIF canvases and resolve its conflicting rights notices; and
   identify another independently bounded Qurʾān-alone author/source before
   retrieval and review.
4. Use v2 external-passage records only after exact passages and source rights
   are reviewed; no external source lead is eligible for scoring.
5. Verify the correction form's Web3Forms account routing and retention, name
   the accountable editor and backup, and verify delivery with a marked test
   submission containing no personal or quiz data before beta intake opens.
6. Complete M3 routing, question-to-evidence mappings, profile-coding rules,
   disputed-position sensitivity, and worked examples before freezing scoring.
7. Continue independent M4 work without presenting unreviewed candidates as
   historical positions or matches.
