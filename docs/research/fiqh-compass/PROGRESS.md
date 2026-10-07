# Fiqh Compass research progress

Updated: 2026-10-05

## Current phase

M1 research remains incomplete; independent M3 candidate-instrument work is now
in progress in parallel. Preserve the site's separate 12-axis, 24-question,
20-issue quiz prototype. It remains provisional: no historical position or
score is publishable until attribution, context, edition, translation, and
review state are adequately supported. Research artifacts and exact corpus
pages stay in ignored `scratch/fiqh-compass/` pending rights review.

## Latest verified checkpoint

- Reconciled the current 8,538-row catalog index with the 7,552,019-row Parquet
  and its 8,538 distinct book IDs. All IDs now match with no catalog-only or
  corpus-only IDs. The current catalog SHA-256 is
  `d5ab93126517f9c11bb631185ad3b79f650ae2e199c42f831247bc48e03cbe73`; Parquet
  SHA-256 remains `6801716f991a805688a80237dcabac3e63e4c7b404f31565b09caec7a5d39866`.
  The earlier 8,492-ID reconciliation and manifest are preserved under ignored
  `scratch/fiqh-compass/catalog-snapshots/previous-8492/` for reproducible
  comparison. The latest source registry now marks all 8,538 index IDs present.
- The title/edition/publisher/category discrepancy counts (885/171/441/8)
  belong to the earlier CSV snapshot and are retained there; they are not
  current-index comparison results. Current record metadata, including the
  newer `author` field, is loaded into the research store. Work identity,
  edition correspondence, completeness, and reuse rights remain unresolved.
- Corpus-wide quality counts: 314 literal text sentinels and 40,878 rows with
  no usable page label. None of the 12 priority starter works contains a text
  sentinel. Digital locators are not printed-page verification; row presence
  does not prove edition match, completeness, or transcription fidelity.
- The private SQLite store currently contains 8,538 source records all marked
  present in the current catalog and corpus, 20 issues,
  12 axes, 24 questions, 46 provisional question/issue mappings, and eight
  bounded candidate profiles. No coordinates or profile scores are assigned.
- The normalized external-source register now has five candidate works,
  seven manifestations, ten digital-access records, five acquisition leads,
  one existing external machine candidate, and zero rights-cleared records.
  The new Maknoon and Internet Archive al-Mughnī access records remain candidate
  matches with rights pending; they do not create or approve a position.
- Re-ran the complete 20-issue retrieval against the starter set, then
  additively expanded I17 with Shamela 30130, 30064, and 2186 and I14 with five
  cataloged uṣūl works. The current plan finds 11,737 exact page candidates
  across 20 source IDs; I17 contains 1,964 and I14 contains 479. The I14
  additions are al-Āmidī's *al-Iḥkām* (10801), al-Ghazālī's *al-Mustaṣfā*
  (5459), al-Qarāfī's *Nafāʾis al-uṣūl* (14280), Ibn ʿAqīl's *al-Wāḍiḥ fī uṣūl
  al-fiqh* (122232), and Ibn al-Qayyim's *Iʿlām al-muwaqqiʿīn* (17798). The
  discovery scan searched 1,501,147 rows from 1,510 indexed fiqh/uṣūl titles;
  broad terms matched 1,208 book IDs and 40,696 rows, so this is a noisy
  lexical screen rather than evidence relevance. Seven exact passages from
  those five works are in a private I14 specialist packet. Every new hit
  remains a machine candidate; no I14 position or profile answer was created.
  I17's 30064 remains only a case/citation discovery aid, and 2186 requires
  separation of al-Shirazi's base text from al-Nawawi's commentary. All source
  attribution, scope, edition/scan correspondence, translation, and rights
  remain unreviewed. All exact candidates remain private in SQLite.
- All twenty dossiers now have 28 provisional position
  assessments and 28 English working translations tied to exact Arabic
  codepoint spans and SHA-256 hashes. Positions remain `candidate`,
  evidence remains `unreviewed`/`attribution_only`, and scoring is disabled.
  Twenty-four links connect directly authored method and ruling candidates to six
  source-bounded profiles (al-Shafi'i, al-Sarakhsi, Ibn Hazm, Ibn Rushd, Ibn Qudama, and
  al-Shatibi). Comparative attributions and represented opponents are not assigned to an author profile.
- Audited all 24 question records at editorial triage level: twenty are marked
  partial-candidate-evidence and four remain retrieval-only/unreviewed.
  All 46 mappings remain provisional. The 11,737-candidate evidence export
  matches SQLite after regenerating the private bundle. Comprehension testing
  and specialist review are pending.
- Drafted an editorial bank of 72 additional prompts alongside the live 24,
  giving eight candidates per axis and balanced direction counts. Q25-Q96 are
  private, not shown in the quiz, and not scoreable. Their issue links are
  topical pointers only; no question-evidence or historical-position claims are
  inferred. See `instrument-candidate-bank-v1.json` and its generator.
- Recorded a draft scoring contract and extracted respondent-axis scoring,
  method similarity, and case-answer agreement into a pure module. Eleven
  synthetic tests pass, including sparse-profile refusal at fewer than eight
  jointly covered axes, unknown/inapplicable exclusion, conditional exclusion,
  mixed-answer labeling, invalid mappings, and method/ruling separation. No
  historical result is enabled. See `scoring-spec-v1.md`.
- A bounded literal-query coverage scan against the current index found 3
  Ibadi-related, 38 Zaydi-related, 65 Imami/Twelver-related, 6 Ismaili-related,
  and 49 Quran-alone/Qurani-related catalog IDs. False positives and hostile
  refutations are classified in `catalog-coverage-scan.md`. No
  school-representative direct legal source was established for any of the five
  target areas; this is not an exhaustive tradition census.
- Confirmed the user-supplied catalog index is byte-for-byte the current
  reconciled snapshot (8,538 unique book IDs; 7,552,019 indexed records; SHA-256
  `d5ab93126517f9c11bb631185ad3b79f650ae2e199c42f831247bc48e03cbe73`). Its
  twelve new fiqh-related metadata leads remain discovery candidates, not
  source-reviewed evidence.
- Added a correction intake and public handling explanation, plus a draft
  internal procedure. The latest 705-page isolated build succeeds; Astro check
  reports zero diagnostics and design audit passes with nine unrelated
  warnings. Two focused Chromium journeys pass, including a mocked correction
  submission at 390px with keyboard access; a seeded quiz answer was neither
  read nor included in the request. This did not test live Web3Forms delivery.
  The account's retention/recipient settings and accountable editor/backup are
  still unverified; see `correction-handling-procedure.md`.
- Added a dedicated bilingual correction intake route, with prefilled links
  from the issue register, profile candidates, project overview, and quiz
  results. It collects no quiz answers and discloses third-party processing and
  the unverified retention setting. Editorial routing/handling and the
  comparison view remain open; this closes only the public intake surface.
- On 2026-10-04, a fresh isolated full-site build completed in
  `dist-fc-review-m6`; the emitted Pagefind manifest indexes 705 pages. The
  focused `tests/fiqh-compass.spec.ts` Chromium run passed both current journeys
  against that exact build: quiz resume/results with uncertainty excluded from
  axis scores, and correction intake with a mocked endpoint, 390px width check,
  keyboard navigation, and saved-answer isolation. The correction provider was
  not contacted. `npm run check` reports 0 diagnostics across 219 files;
  `npm run test:design` passes across 245 files with nine pre-existing warnings
  outside the Fiqh Compass work. The scorer's 11 and router's 6 synthetic tests
  also pass. This is build and prototype behavior evidence, not M4 alpha
  completeness, user evaluation, or release approval.
- The roadmap acceptance status is recorded in `roadmap-gates.md`: M1 remains
  open, M2 has partial infrastructure, M3 is in progress with the first full
  candidate-bank draft and scoring tests, M4 is a partial UI scaffold, and
  M5–M8 have not passed.
- On 2026-10-05, rebuilt the current tree into isolated `dist-fc-review-m8`;
  the production build completed and Pagefind indexed 705 pages. Astro check
  reports zero diagnostics across 219 files; the design audit passes 245 files
  with nine warnings outside Fiqh Compass. Both focused Playwright journeys
  passed against the m8 client output: local quiz resume/results/uncertainty
  handling and correction-form prefill, mocked submission, 390px bounds,
  keyboard tab access, and saved-answer isolation. Current synthetic scoring
  and routing suites pass 11/11 and 6/6. The correction endpoint was mocked;
  the built Cloudflare worker runtime, live correction delivery, quiz mobile/
  zoom behavior, and screen-reader behavior were not exercised. See
  `M4-quiz-technical-audit-2026-10-05.md`; M4 remains partial.
- Follow-up M4 hardening on 2026-10-05 changed the quiz from a GET form to a
  non-submitting response area. Without JavaScript the static page now shows all
  24 questions and axis definitions, lets readers select responses, and states
  that selections are neither saved nor sent and no automatic profile is
  calculated. A JavaScript-disabled Chromium test verified all 24 questions
  are visible and selecting an answer leaves the URL unchanged. The existing
  resume/results and correction-isolation journeys also pass against the latest
  `npm run build:e2e` output (`dist`); Pagefind indexed 705 pages. A fresh
  `npm run check` reports zero diagnostics across 219 files. This closes the
  inaccessible-hidden-questions issue, not the full no-script quiz flow,
  Arabic support, actual browser-zoom checks, or assistive-technology review.
- Expanded the focused browser coverage on 2026-10-05: all four Fiqh Compass
  Playwright journeys pass against the rebuilt `dist` output. The quiz now has
  checks at 320px and 390px, keyboard-only completion through all 24 responses,
  visible global focus styling, reduced-motion preference, and 200% root font
  size reflow. This is not a manual screen-reader review or a browser zoom
  certification. Removed green/red answer fills and the component-declared
  outline so the options no longer imply approval and answer focus uses the
  site's global focus treatment. `npm run check` remains clean and
  `npm run test:design` passes with nine existing warnings outside this work.
- Rendered contrast checks initially found a faint quiz question numeral,
  disabled Back text in the light theme, and issue-tag links inheriting a dark
  surface under dark ink. The issue card now uses its parchment surface token;
  quiz colors were adjusted. All five overview, issues, profiles, corrections,
  and quiz routes now report zero text contrast failures in dark and light
  themes. Hidden result/interaction states are not covered by this route pass.
- Extended `scripts/check-contrast.mjs` with a `--quiz-results` mode that
  completes the local prototype using neutral responses before measuring the
  results screen, plus `--quiz-results-empty` to skip all items. The checker
  asserts 12 result axes, 12 meters for the neutral state, and 12 “No scored
  answers” rows with zero meters for all-skipped. All four viewport/theme
  combinations (1440px and 390px, dark and light) report zero text-contrast
  failures for both result states. Neutral responses only reveal display state;
  they do not validate the coordinates or question instrument. All-unknown
  results and remaining hover/focus/disabled states still need checks.
- Latest validator passed SQLite/foreign keys; passage-ID uniqueness and
  reproducibility; exact text and footnote fidelity and digital locators
  against the Parquet; no invented printed locators; all 20 dossier/export
  counts; exact translation-segment offsets and hashes; position/evidence and
  profile links; and candidate non-scoring status. Counts: 11,737 passages
  across 20 source IDs, 28 positions, 28 translation segments, 24
  profile-position links, 28 editorial triage events, 20 dossiers, and 24
  questions. I14 has 479 machine candidates, including seven packeted passages
  from five added works; all remain unreviewed. This does not
  verify scholarly attribution, legal interpretation, translations, print/scan
  correspondence, rights, or human review.
- Prepared `M1-human-review-protocol.md` with a participant-safe cognitive
  interview plan for all 24 items and separate specialist/bilingual, attribution,
  edition, and rights review questions. Added a reproducible private packet
  generator; it emitted 28 position packets from the ignored database. The
  generator verifies Arabic anchors against a lossy normalized copy while
  preserving exact corpus text, and rechecks translation-segment hashes. This
  is preparation only: 0/24 questions have reader records, no human review is
  claimed, rights remain uncleared, and edition/scan collation is pending.
- Screened a possible I17 comparison in al-Shāfiʿī's *al-Umm* (digital vol. 1,
  pp. 154–155) and Ibn Qudāma's *al-Mughnī* (digital vol. 2, p. 15). The latter
  gives an explicit authorial rationale distinguishing the solitary worshipper
  from an imam; the former excerpt includes hadith and later reported wording,
  so the second author's own rationale and aligned case conditions are not yet
  established. Recorded it as a lead, not as the roadmap's worked example; M1's
  comparison criterion remains open.
- Followed the I17 lead against an online Dar al-Fikr *al-Umm* page view
  labeled p. 154. The section explicitly introduces material in *Mukhtaṣar
  al-Muzanī* that it says was not found in *al-Umm*, and the page includes
  al-Sirāj al-Bulqīnī's later footnotes. Treat the corresponding Shamela 1655
  text as a layered-source warning, not verified direct al-Shāfiʿī wording.
  This online text view is not a scan collation and its manifestation is not
  matched to the local record. A focused private review packet records the
  local serial, locator, text hash, and required scan/edition checks. The I17
  comparison remains ineligible as M1's worked example; seek another aligned
  example if direct attribution cannot be established.
- Hardened Fiqh Compass landmarks and text after the design audit found nested
  main landmarks, labels below 12px, and an ornamental navigation glyph. The
  shared layout now emits one main landmark; inner content uses sections or
  divs, small labels meet the 12px floor, and the quiz link is text-labelled.
  Astro check passed (0 errors, 0 warnings, 235 generated-code hints), the design
  audit passed (nine unrelated existing warnings), and a full production build
  with a 704-page Pagefind index passed in `dist-fc-review-m3`. The standard
  `dist` was held open by an existing preview, so it was left untouched. The
  updated scorer and compiled Chromium quiz regression passed against the fresh
  isolated build. Pagefind still skips `/research/`, which lacks an HTML root.
- Followed up the underrepresented-tradition acquisition queue against live
  institutional records. The al-Saʿīdiyya *Kitāb al-Nīl* title page confirms a
  1423 AH / 2002 first-edition printing and states that the text reproduces
  the second edition, 1287 AH / 1967. Preliminary p. 17 separately describes
  the editor's use of three copies for correction; this textual history still
  needs bibliographic review. The title-page statements are no longer treated
  as a date contradiction. For the Zaydī
  *al-Baḥr al-zakhkhār*, identified BSB Cod.arab. 1291 (189 folios, copied
  1032 AH / 1623 CE) via Deutsche Digitale Bibliothek; recorded it as a
  manuscript witness distinct from the searchable Usul.ai text, with a
  displayed CC BY-NC-SA 4.0 notice requiring object-level rights review. For
  al-Ṭūsī's *al-Mabsūṭ*, found an NYU Libraries Arabic Collections Online scan
  and permanent handle, call number KBP370.T88 A35 1967, 420 pages in the
  opened viewer volume, and an independent WorldCat second-edition record.
  Recorded the NYU public-domain belief as a source-specific notice, not blanket
  republication clearance. Identified *Quran: The Final Testament* chapters
  18–19 as one bounded Rashad Khalifa / United Submitters lead; its host states
  copyright © Islamic Productions 2003. It cannot stand for Qurʾān-alone
  approaches generally. Full URLs, edition/rights caveats, and next checks are
  in `acquisition-review-queue.json` and `coverage-acquisition-audit.md`.
  These are access and metadata findings only: no passage was promoted, scored,
  or cleared for reuse.
- Added an additive schema v2 so the research store can represent authors,
  works, printed editions/manuscript witnesses/web publications, digital access
  records, acquisition leads, and external passages independently of Shamela
  IDs. Migrated the private SQLite store and imported metadata-only leads for
  four bounded cases: *al-Nīl*, *al-Baḥr al-zakhkhār*, al-Ṭūsī's *al-Mabsūṭ*,
  and one Rashad Khalifa publication. Current extension counts are 4 authors,
  4 works, 6 manifestations, 7 access records, and 4 acquisition leads; there
  is one private, unreviewed *al-Nīl* external passage and 0 rights-cleared
  access records. Edition match, attribution, and rights statuses remain
  unverified. The
  deterministic private JSON export is
  `scratch/fiqh-compass/json/external-source-register-v2.json`.
- Added migration, seed, and export scripts plus four in-memory checks covering
  v1 data preservation, migration/seed idempotence, unresolved-attribution
  handling, the rights-clearance constraint, foreign keys, and empty passage
  state. All four passed. Repeated export produced the same SHA-256 both times:
  `38AA7628BCA58A94EC3E93CB3B722C2E52C554E22C53ADDEBD9C876824FBB95B`.
  SQLite integrity is `ok` and foreign-key errors are zero after the real
  private-store migration and metadata import.
- Reconciled the newly supplied current Shamela index. It contains 8,538 unique
  book IDs whose 7,552,019 per-book record counts and serial ranges cover
  records 1–7,552,019 without gaps or overlap. The 46 IDs missing from the
  earlier 8,492-entry catalog are present in the merged corpus and now have
  catalog metadata. Twelve of those records match fiqh-related title/category
  keywords and are recorded as discovery leads, including comparative fiqh,
  prayer, fasting, legal maxims, divorce, pilgrimage, Shāfiʿī, Mālikī, and
  Ḥanbalī material. This does not verify attribution, complete text, edition,
  doctrinal relevance, scan correspondence, or reuse rights. A separate bounded
  underrepresented-tradition metadata scan has now covered all 8,538 entries;
  it found no school-representative direct legal source for any of the five
  queried gaps. Report and reproducible metadata-only script:
  `catalog-index-reconciliation.md` and
  `scripts/fiqh-compass/reconcile_catalog_index.py`.
- Reran Arabic literal-substring discovery for five underrepresented areas
  against the latest index and manually inspected the title/author metadata.
  Unique hit counts are 3 Ibāḍī-related, 38 Zaydī-related, 65 Imāmī/Twelver,
  6 Ismāʿīlī-related, and 49 Qurʾān-alone/Qurʾānī-related; the broader terms
  produce many false positives and are not comparable with the old query
  totals. The local *al-Baḥr al-zakhkhār* hit is al-Bazzār's hadith musnad.
  Al-Shawkānī fiqh/usul works may be researched as his individual positions,
  but do not fill a school-representative Zaydī gap. No score or source claim
  was added. Exact query terms, all matched metadata, limitations, and
  classifications are recorded in `catalog-coverage-scan.md` and `.json`.
- Added Shamela 30130 to I17 using additive retrieval. The 282 new unresolved
  page candidates raise I17 from 652 to 934 without removing its existing
  evidence links. A two-page source-layer supplement for vol. 1, pp. 531 and
  543 is ready in the private review-packet folder. It asks a specialist to
  distinguish the quoted report, base text, commentary, marginal gloss, and
  editorial matter, and to align the exact prayer case against al-Shafiʿi and
  Ibn Qudama before any comparison. Full local validation passes for 10,232
  passages, text/locator fidelity, deterministic IDs, exported counts, SQLite,
  and preserved unscored/unreviewed states. The supplement does not approve a
  legal position or clear reuse rights.

## Current deliverables

- `schema-v1.sql`, additive `schema-v2.sql`, `README.md`, `task-ledger.json`,
  and this checkpoint.
- `reconciliation.json` / `.md`, `source-manifest.json`, retrieval plans,
  all-20 issue dossiers, candidate-retrieval report, and JSON exports under
  ignored `scratch/fiqh-compass/`.
- `pilot-assessments-v1.json` and `question-audit-notes-v1.json` as tracked
  non-source-text assessment definitions; generated all-question evidence
  audit in `question-evidence-audit-v1.json`.
- `coverage-acquisition-audit.md`, `acquisition-review-queue.json`,
  `roadmap-gates.md`, and `M1-data-findings.md`.
- Current-index findings in `catalog-index-reconciliation.md` and
  `catalog-index-reconciliation.json`; reproducible via
  `scripts/fiqh-compass/reconcile_catalog_index.py`.
- Latest coverage scan in `catalog-coverage-scan.md` and `.json`; reproducible
  via `scripts/fiqh-compass/audit_catalog_coverage.py`.
- `M1-human-review-protocol.md` and
  `scripts/fiqh-compass/build_review_packets.py`; generated source packets are
  private under ignored `scratch/fiqh-compass/review-packets/`.
- `instrument-candidate-bank-v1.json` and its draft-only generator;
  `scoring-spec-v1.md`, the pure scoring/comparison helpers, and synthetic unit
  tests. None of the additional question candidates or historical matches are
  enabled for public use.
- Metadata-only acquisition seeds in `acquisition-source-seeds-v1.json`; v2
  migration, seed, export, and in-memory check scripts under
  `scripts/fiqh-compass/`. The normalized export is private in
  `scratch/fiqh-compass/json/external-source-register-v2.json`.
- Reproducible scripts for corpus reconciliation, seed export, extraction,
  store/export building, candidate assessment seeding, question audit, and
  validation under `scripts/fiqh-compass/`.

## Gates and next research batch

M1 is not complete. All twenty dossiers now contain bounded candidate readings;
none is resolved research and all still require specialist and source review. Further
claim-level dossier work and human source review remain. Missing M1 work
includes a worked example of shared rulings with
different reasoning and comprehension checks with approximately five to
eight readers. All 28 translations need bilingual review; the relevant
editions, scans, and text reuse rights need independent checks. M2's expanded
40–60 dossiers, 10–15 bounded profiles, and direct-source cross-tradition
coverage also remain outstanding.

Next batch: use schema v2 to record exact passages from the acquired
cross-tradition sources after matching digital locators to title pages/scans and
checking rights. Resolve the *al-Nīl* edition conflict, inspect the NYU
*al-Mabsūṭ* and BSB *al-Baḥr al-zakhkhār* items, and find a second independent
Qurʾān-alone source. In parallel, develop the M1 shared-ruling/different-reasoning
example, recruit readers and conduct the comprehension exercise using the
prepared protocol, and obtain qualified review against the private packets.
I09–I17, I19, and I20 still need contrary views and additional direct cases;
I10 and I14 especially need other author/tradition treatments. Continue M3/M4
work only where it does not depend on unreviewed historical claims. Preserve all
unknowns. Historical profile scores and comparisons remain disabled; the local
prototype's respondent-axis summaries are provisional and are not evidence of
instrument validation.
Roadmap effort allowances are 2–4 focused weeks for M1 and 4–10 for M2, not
forecasts of remaining effort.

### M3 routing checkpoint

- The 24-item prototype is fixed-order; there were no categorical authority or
  respondent-role gates, even though the scorer already supported excluding an
  explicitly inactive item. Added an isolated fail-closed routing helper and a
  draft, non-scored routing proposal for report-authority follow-ups and the
  distinct layperson/qualified-jurist items. Missing or non-matching gate
  answers deactivate conditional candidates, and the scorer then excludes them
  from the eligible count.
- Six focused routing tests cover denial of report authority without generating
  negative follow-up answers, role-specific route separation, malformed rules,
  and the configuration's candidate/gate references. The route helper is not
  imported by the live quiz, and draft wording and conditions are not reviewed
  or approved. Existing fixed quiz content and browser storage behavior are
  unchanged.

### Instrument candidate-screen checkpoint

- Read the full 96-item candidate bank against the roadmap's twelve axis
  definitions and boundaries. The bank meets its numeric quota (eight prompts
  and four directions each per axis), but this does not establish construct
  validity. Recorded item-level axis findings around ambiguous constructs,
  role/domain mixing, near duplicates, and prompts that do not express opposed
  positions in `instrument-editorial-screen-v1.md`.
- The most substantial construct questions are A06 (moral reasoning versus
  authority to bind), A10 (lay following versus qualified juristic departure),
  A11 (domain-specific uncertainty), and A12 (distinct source relations in
  abrogation). A03, A08, and A09 also contain near-duplicate or differently
  scoped prompts. The screen changes no item or mapping and is explicitly not
  scholarly, bilingual, comprehension, or psychometric review. M3 remains open;
  Q25–Q96 remain private and unscored, and historical comparisons remain
  disabled.

### Supplemental source screen: I17 / Shamela 30083

- Screened the newly indexed *Qiṭʿa min Takmilat al-Majmūʿ* (30083) against
  I17. The controlled phrase scans surfaced a page that uses doubt after
  completing prayer as an analogy in a sale-dispute argument, and an
  *al-Mughnī* passage that applies a similar completion principle to ṭawāf.
  Neither gives the exact same prayer case with clearly different authorial
  reasoning. No passage was promoted, no historical position was coded, and
  no profile score changed. Both candidate layers and edition/scan identity,
  translation, and rights remain open; the private packet preserves hashes,
  locators, and the specialist checks.

### Supplemental source expansion: I17 / Shamela 30064

- Added the cataloged 2024 prayer compendium 30064 to the I17 retrieval plan as
  a secondary case/citation discovery aid. It yielded 762 additional machine
  candidates; the complete export now contains 10,994 candidates across 14
  sources, including 1,696 for I17. The shortlist includes prayer-time,
  opening-takbir, and three-versus-four-rakah discussions and references to
  works including *al-Umm*, *al-Majmūʿ*, and *al-Mughnī*. A private packet keeps
  five exact serial/hash leads and the primary-source checks. No position,
  translation, profile answer, or score was added. The compendium's own
  synthesis and its quotations/attributions remain to be separated; scan and
  edition correspondence, completeness, translation, specialist review, and
  rights remain unresolved. The full store/export validator passes with the
  updated plan and dossier counts.

### Supplemental source expansion: I17 / Shamela 2186

- Added *al-Majmuʿ* (Shamela 2186) with bounded terms for live doubt about
  tawaf/saʿi counts. This added 268 I17 candidates, bringing the validated
  full export to 11,262 candidates across 15 sources and 1,964 I17 candidates.
  The private comparison packet pairs vol. 8/p. 21, serial 3960970, with
  *al-Mughni* vol. 3/p. 344, serial 4224391. Both appear to prescribe the
  lower/certain count when a person doubts the number of tawaf rounds during
  performance. Ibn Qudama explicitly cites a reported consensus and analogy
  to prayer; al-Nawawi's passage is commentary on al-Shirazi's base text.
  Whether the rationales materially differ remains a specialist question.
  Independently inspected [NYU/AUB item aub_aco003847](https://sites.dlib.nyu.edu/viewer/books/aub_aco003847/display?lang=ar), *al-Majmuʿ*, vol. 8
  (Medina: al-Maktabah al-Salafiyah; catalog date 1344 H. [1925? M.]). Its
  photographed title page identifies vol. 8 and publisher; canvas 25 is printed
  p. 21 and visibly contains the matching live-count ruling in the commentary
  section. This confirms the pinpoint in that manifestation and supports the
  local 8/21 locator, but does not identify the exact print source behind
  Shamela 2186 or prove the full corpus text derives from this scan. Corrected a
  prior NYU item error: aub_aco003855 is vol. 16; aub_aco003847 is vol. 8.
  Secondary references also use 8/29. Rights remain needs_review, and no
  translation, scholarly endorsement, position, profile answer, or score was
  added. Specialist assessment of distinct reasoning and full edition matching
  remain open.
- A bounded companion check sampled NYU/AUB aub_aco003830, al-Mughni, vol. 3
  (Egypt: Matbaat al-Manar, catalog date 1926). It is distinct from Shamela
  8463's indexed 1388-1389 H./1968-1969, 10-volume Cairo Library record. NYU
  canvas 348 is printed p. 344, but it shows a different passage and does not
  contain the candidate tawaf-count discussion. Same-number pagination does
  not collate the two manifestations; the target was not located elsewhere in
  this bounded scan check. Rights remain needs_review.
- A search found a listing for Cairo Library's 1388/1968 ten-volume
  *al-Mughni* set with a volume 3 PDF link on Internet Archive, plus a second
  listing identifying a 1968 Cairo Library vol. 3. The Archive file endpoint
  returned HTTP 403 in that initial check, so the entry was recorded then as an
  acquisition lead only. This was superseded by the later retrieval and visual
  inspection recorded in “I17 Maknoon al-Mughnī scan-page match” below; source
  lineage, exact Shamela manifestation, and reuse rights remain unresolved.

### External source acquisition: Ibadi *Kitab al-Nil*, volume 1

- Visually checked the al-Saʿīdiyya title page: it claims a first-edition
  printing in 1423 AH / 2002 and labels the text a photographic reproduction
  of the second edition from 1287 AH / 1967. Printed page 50 is PDF page 76
  in the downloaded 337-page part 1. The discussion treats impurity transfer,
  sensory evidence, and doubt, and records alternatives within the passage.
  Because *al-Nil* is a compilation and its preliminary matter describes an
  editorial correction process, its exact authorial/source layer remains
  unresolved. This purity case does not fit current I16 or I17 as scored.
- Added one hash-checked external candidate passage to the private v2 store
  (`rights_status=needs_review`, `attribution_type=unresolved`,
  `extraction_status=machine_candidate`), with no issue/question/position link.
  Added the paired al-Saʿīdiyya TXT, checksums, scan locator, and a separate
  College of Sharia Sciences catalog claim for a 2003 edition. The Oman
  platform's open-license footer is recorded as a provider claim only; no
  source reuse rights are cleared. A focused packet lists bibliographic,
  transcription, source-layer, scope, and rights checks. Five v2 importer
  tests pass, including packet hash, idempotency, and rejection of altered
  text. The external register exports 4 authors, 4 works, 6 manifestations,
  7 access records, 4 acquisition leads, and 1 external passage.

### Verification checkpoint — 2026-10-05

- `npm run check`: passed; 219 files, 0 errors, warnings, or hints.
- `npm run test:design`: passed; nine existing warnings point to files outside
  Fiqh Compass.
- `npm run build -- --outDir dist-fc-review-m7`: passed in an isolated output
  directory. It verified 37 Quran releases, excluded 435 unmanifested files,
  and Pagefind indexed 705 pages. It reported that `/research/` has no `<html>`
  root, so that page remains unindexed.
- Focused synthetic scoring and routing tests: 11/11 and 6/6 passed.
- No Fiqh Compass browser test was rerun against `dist-fc-review-m7`; latest
  browser evidence remains T27 against `dist-fc-review-m6`, and correction
  delivery was mocked. No live correction was sent.

### Paired English-Arabic instrument review preparation — 2026-10-05

- Prepared `scratch/fiqh-compass/instrument-bilingual-review-packet-v1.json` as restricted working material. It pairs the exact English strings in `src/data/fiqh-compass.ts` with first-draft Modern Standard Arabic for 12 axis titles/endpoints/construct notes, all 24 quiz questions, and all seven response options. The packet includes term notes and per-entry human review fields.
- This is preparation only: 0 bilingual human reviews and 0 approved translations. Nothing from the packet is wired into the public page or authorized for scoring/profile matching. English wording and Arabic drafts must be reviewed together; linguistic review is separate from specialist approval of evidence and fiqh scope.

### All-unknown result-state contrast — 2026-10-05

- Extended `scripts/check-contrast.mjs` with `--quiz-results-unknown`. It selects “I am not sure” on all 24 questions, then requires 12 “No scored answers” result rows and zero meters before checking contrast.
- Against the live Astro dev rendering at port 4322, both dark and light themes pass at 1440px and 390px with zero text-contrast failures. `node --check` passes. This confirms only the rendered all-unknown state; it does not validate score meaning or cover assistive technology and other interactive states.

### Profile × issue coverage inventory — 2026-10-05

- Added a deterministic, read-only exporter, `scripts/fiqh-compass/export_profile_issue_coverage.py`, and generated `profile-issue-coverage-v1.csv` plus its interpretation note. The matrix joins eight source-bounded candidate profiles to all twenty issues (160 cells) without exporting passage text.
- Current store states: 23 profile-position-candidate cells, 73 source-linked passage-only cells, and 64 with no linked candidate in this store. All 28 recorded position epistemic states remain `candidate`; the export authorizes no scores. It includes stored period/tradition, source-role, domain, language/translation, and edition/rights/review metadata; unavailable values remain blank. Repeated generation produced byte-identical outputs.
- This is an initial link inventory only. It does not establish tradition coverage, prove absence, validate relevance, or satisfy specialist, translation, edition, or rights review.

### Fail-closed evidence disclosure — 2026-10-05

- Added a per-axis evidence/review disclosure to the quiz results and a
  publication contract that keeps the public evidence manifest empty until a
  record meets edition and locator, attribution/scope/caveat, specialist,
  approved translation, bilingual review, and rights gates. The browser
  recomputes SHA-256 for the exact Arabic and English text and excludes records
  whose hashes do not match the reviewed strings. The public renderer uses an
  explicit field allowlist and inserts content as text.
- Current state is intentionally empty: 0 approved source passages, 0 real
  evidence records rendered. The empty state explains that each provisional
  axis reflects only the respondent's answers, not a jurist or school match.
  Three synthetic tests cover missing/stale gates, caveat retention and
  allowlisting, and per-axis selection/deduplication. This is software
  enforcement, not source verification: the application does not authenticate
  reviewer identity or determine licensing status.
- Verified isolated `dist-fc-review-m10` build and Pagefind output (705
  pages). All four Fiqh Compass Chromium journeys pass against the build.
  `npm run check` passes across 222 files with zero diagnostics; `npm run
  test:design` passes across 247 source files with nine warnings outside Fiqh
  Compass. Neutral, all-skipped, and all-unknown result disclosures are opened
  during contrast checks; all three states pass in dark/light themes at 1440px
  and 390px with zero text contrast failures.
- No source positions or coordinates were promoted. M1–M8 gates remain open;
  research validation, human review, rights, Arabic approvals, user research,
  accessible-operation review, correction-service ownership, and release
  operations remain outstanding.

### I17 *al-Mughnī* volume 3 catalog lead — 2026-10-05

- Added acquisition lead `AQ-H01` for a University of Jordan Library catalog
  search-result holding of the Cairo Library 1968 volume 3 (call number
  `I22 A35 1968 V.3`), with separate CiNii and WorldCat set-level corroboration.
  The CiNii record says 1968–1970, while local Shamela 8463 metadata says
  1388–1389 AH / 1968–1969 CE. This date conflict is retained; the library
  record could not be opened directly during this turn and no scan was acquired.
- Normalized the author, work, and volume 3 catalog manifestation in the
  private v2 store. Shamela 8463 links to both work and manifestation at
  `metadata_only`, with notes warning against conflating title match with exact
  edition or scan identity. The I17 lead remains serial 4224391, digital vol.
  3/page 344, printed locator unset, source-text SHA-256
  `c2e0bf830ed6bcbae423150d6eb0cb9640044862b8be5ce7d9a3b3a68e73ce06`,
  attribution unresolved, machine candidate, and rights pending.
- The repeatable metadata seeder and external-register export now report five
  authors, five works, seven manifestations, seven access records, five
  acquisition leads, and one existing external machine candidate. Five
  schema-v2 smoke tests pass; no new passage or score was created, and rights
  cleared remains zero. This is an acquisition path only, not a source
  collation, position endorsement, or worked-example approval.
- Current repository validations: `npm run check` passed across 222 files with
  zero diagnostics; `npm run test:design` passed across 247 files with nine
  unrelated warnings. `npm run build -- --outDir dist-fc-review-m11` completed,
  verified the 37 Quran release manifests, hardlinked 11,799 declared assets,
  and Pagefind indexed 705 pages. All four focused Fiqh Compass Chromium
  journeys passed against this M11 build. `/research/` still has no outer HTML
  element and remains excluded from Pagefind; this build does not resolve that
  pre-existing issue.

### I17 text-access follow-up — 2026-10-05

- The Shamela-mirror provider index for book 8463 describes the Cairo Library
  10-part, 1388 AH / 1968 CE text and says its numbering matches print. Its
  direct volume 3 link timed out, so the page-number claim is recorded as
  provider metadata from the same source family, not independent scan
  verification.
- Found a text-and-page-image access path in Maknoon labeled as the Cairo
  Library *al-Mughnī*, volume 3. The inspected page was digital page 21, not
  the I17 target page; no title page or target-page image was inspected.
- IslamWeb identifies section 2463 in volume 3. Its visible Arabic agrees with
  the corresponding section in local Shamela serial 4224391; sections 2464–2466
  concatenated in that local row were not separately collated against the page.
  This is a text concordance with uncertain source dependency, not independent
  edition/scan verification. IslamArchive also
  indexes the tawaf section under a Cairo Library label, but its digital page
  sequence is not mapped to printed pagination.
- Updated `AQ-H01` with the access records and revised next steps. The 1968–1970
  versus 1388–1389 AH / 1968–1969 CE date discrepancy, printed locator,
  authorial/quotation layers, and rights remain open. The passage remains
  `machine_candidate`, unscored, and not eligible for public evidence.
- Source pages: [Maknoon volume 3](https://maknoon.org/ai/view.php?bk=03_elmoghni&p=21),
  [IslamWeb section 2463](https://www.islamweb.net/ar/library/content/15/2002/%D9%81%D8%B5%D9%84-%D8%A5%D8%B0%D8%A7-%D8%B4%D9%83-%D9%81%D9%8A-%D8%A7%D9%84%D8%B7%D9%87%D8%A7%D8%B1%D8%A9-%D9%88%D9%87%D9%88-%D9%81%D9%8A-%D8%A7%D9%84%D8%B7%D9%88%D8%A7%D9%81),
  [IslamArchive Cairo Library entry](https://islamarchive.cc/ketab_content/2508463/p-2232).

### Verification after I17 text-access update — 2026-10-05

- `python scripts/fiqh-compass/test_schema_v2.py`: 5/5 passed; candidate
  import remains idempotent and does not create a passage or grant rights.
- `npm run check`: 222 files, 0 errors, 0 warnings, 0 hints.
- `npm run test:design`: 247 files passed; nine existing warnings are outside
  Fiqh Compass.
- `npm run build -- --outDir dist-fc-review-m12`: passed in an isolated output
  directory; 37 Quran manifests verified, 435 unmanifested files excluded,
  11,799 assets hardlinked, and Pagefind indexed 705 pages / 66,600 words.
  `/research/` retains its known no-`<html>` Pagefind warning. This verifies
  packaging after a research-only update; no application or scoring code
  changed, and the M1–M8 research/review/release gates remain open.


### Al-Mabsūṭ volume-title-page inspection — 2026-10-05

- Inspected IIIF canvas 5 in the official ACO scan `nyu_aco001662` (420
  canvases). The title page identifies volume 1 of *al-Mabsūṭ fī fiqh
  al-Imāmiyya*, names al-Ṭūsī and al-Sayyid Muḥammad Taqī al-Kashfī, gives
  1387 AH, and visibly states “حقوق الطبع محفوظ” (rights reserved).
- Inspected canvas 5 in the separate Princeton-provided ACO scan
  `princeton_aco001610` (418 canvases). Its title page identifies volume 2,
  the same work/editor/publisher, and 1387 AH. The ACO item is linked to the
  Princeton catalog record and permanent handle `2333.1/xpnvx7sc`.
- Recorded both as candidate matches to the 1387 AH edition family. Only two
  volume title pages were checked. Other volumes, set chronology, printed-page
  mapping, full text-to-scan collation, doctrinal attribution, and project-specific
  reuse rights remain open; no passage, position, or score was added.
- Added Princeton volume 2 as a distinct digital-access object under `AQ-T01`;
  the rights status remains `needs_review`. The ACO public-domain statement is
  recorded alongside, not as clearance overriding, the printed rights notice.
- Source records: [NYU ACO volume 1](https://aco.dlib.nyu.edu/book/nyu_aco001662/1?lang=ar),
  [Princeton ACO volume 2](https://aco.dlib.nyu.edu/book/princeton_aco001610/1?lang=ar),
  [Princeton viewer metadata and permanent handle](https://sites.dlib.nyu.edu/viewer/books/princeton_aco001610/1?embed=1&lang=ar),
  and the [CiNii eight-volume catalogue record](https://ci.nii.ac.jp/ncid/BA69026060.amp).



### BSB *al-Baḥr al-zakhkhār* manuscript access — 2026-10-05

- Read the [Deutsche Digitale Bibliothek object record](https://www.deutsche-digitale-bibliothek.de/item/PFT7CDYQLSKBUY7DGWLX4QXEJMWQOV7Z)
  and the BSB [IIIF Presentation v2 manifest](https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00038405/manifest).
  BSB shelfmark is Cod.arab. 1291 (former Glaser 18); the catalogue states 189
  leaves, copy date 1032 AH / 1623 CE, and says its first part includes
  dogmatics and Zaydi law. The IIIF manifest has 451 sequential canvas labels,
  which are not folio identifiers.
- Visually inspected canvas 3 via the [BSB viewer](https://www.digitale-sammlungen.de/en/view/bsb00038405):
  the title leaf visibly bears *Kitāb al-Baḥr al-zakhkhār*. I did not read the
  author attribution from that leaf or establish a folio-to-canvas map, manuscript
  completeness, or equivalence to Usul.ai/any printed edition.
- The DDB page displays CC BY-NC-SA 4.0 while the BSB IIIF manifest declares
  Public Domain Mark 1.0. This difference is recorded as unresolved; no image
  or transcription reuse is cleared. The linked [DDB GND authority record](https://www.deutsche-digitale-bibliothek.de/person/gnd/103490949)
  gives birth 1373 and death 1437 without stating the era; this raw catalogue
  claim is kept separate from AH dates pending review.
- Updated `AQ-Z01` and the private normalized register, preserving `candidate_match`,
  `rights_status=needs_review`, no issue or position links, and no new passage or score.
  Schema-v2 smoke checks: 5/5 passed. Two consecutive v2 exports matched at
  SHA-256 `DDFE9E4CCC2EAE0F761EF48569170E6F248109B316979CB951819539D5F09C9F`;
  current register: 5 works, 7 manifestations, 8 access records, 1 existing
  external machine candidate, and 0 rights-cleared access records.


### Shamela index confirmation and BSB opening-canvas sample — 2026-10-05

- The newly supplied `shamela_catalog_index.csv` is byte-identical to the
  reconciled snapshot (SHA-256
  `d5ab93126517f9c11bb631185ad3b79f650ae2e199c42f831247bc48e03cbe73`). It
  remains the current inventory boundary: 8,538 book IDs across 40 categories,
  7,552,019 indexed records, matching corpus serial coverage with no gaps or
  overlaps. The existing bounded source-coverage scan and candidate leads
  already use this version; no reconciliation artifacts needed refreshing.
- Visually sampled BSB canvases 1 and 4–6 in addition to the prior canvas 3
  title-leaf inspection. Canvas 1 shows the binding; canvases 4–6 show opening
  manuscript text and canvas 6 a prominent *al-Baḥr al-zakhkhār* heading. This
  does not map manuscript folios to IIIF canvases, establish completeness, read
  the author attribution, collate with a printed/Usul.ai text, or resolve the
  conflicting rights statements. No passage, position, or score was added.


### I17 Maknoon *al-Mughnī* scan-page match — 2026-10-05

- Inspected Maknoon page 1 and page 344 images in its volume 3 sequence. The
  title image identifies *al-Mughnī*, Ibn Qudāma, volume 3, editor Ṭāhā
  Muḥammad al-Zaynī, and Maktabat al-Qāhirah. The printing year is not securely
  legible. The target image visibly prints p. 344 and contains I17 section 2463
  plus adjacent sections 2464–2465.
- Waqfeya's catalog entry identifies the 10-volume Cairo edition as 1388 AH /
  1968 CE and links an Internet Archive volume 3 PDF. Downloaded the 526-page
  PDF (14,224,100 bytes; SHA-256
  `8386E2FE6D9613C9196BE57D197C95B50DD2E6F9A0655908973D862245638504`) and
  inspected its p. 1 and p. 344 images. They appear to show the same scan as
  Maknoon's images, so this adds a separate access route, not an independent
  physical witness. Internet Archive item metadata has no rights/license
  statement. Preserve Waqfeya 1388/1968, Shamela 1388–1389/1968–1969, and
  CiNii 1968–1970 as separate claims; do not treat the title-page year as read.
- Compared the local Shamela 8463 / serial 4224391 Arabic row with the page OCR.
  After removing diacritics and punctuation, the entire local row (1,717
  normalized letters) occurs in the page OCR (1,785 normalized letters). The
  scan therefore supports a candidate text-to-printed-page match; it does not
  establish that this scan supplied Shamela's text or identify the exact same
  copy/printing. The title-page year and scan provenance still need independent
  verification; CiNii and Shamela's set-date ranges remain discrepant.
- Added Maknoon and Internet Archive as distinct candidate digital-access
  objects and refreshed the private source register. These access objects
  appear to expose the same scan. Rights remain `needs_review`; the local row remains
  `machine_candidate`, attribution unresolved, and score-ineligible. No legal
  position, translation, or profile score was promoted. Specialist review,
  scan/text rights review, and source-lineage checks remain open.



### I17 *al-Mughnī* surrounding-page review packet update — 2026-10-05

- Retrieved and visually inspected the Maknoon page images for printed pp. 343–345, recording each image SHA-256 and byte count in the private comparison packet. Page 344 visibly contains section 2463 with the purity and round-count questions, the Ibn al-Mundhir report, Ibn Qudāma’s prayer analogy, and the distinct post-completion rule. Pages 343 and 345 bound the adjacent sections; the packet explicitly excludes those neighboring issues from support for the target claim.
- This sharpens the specialist review question but does not validate the local Shamela manifestation, establish independent scan provenance, approve a translation, clear rights, or authorize a position/score. The private packet remains `candidate_for_specialist_review`; serial 4224391 remains machine-candidate and unscored.


### Public methodology route scaffold — 2026-10-05

- Added `/projects/fiqh-compass/methodology/` and a Methodology link in the Fiqh Compass navigation. The page states the prototype's scope and limits, gives the source/attribution review sequence, distinguishes author statements from quotations, reports, and editorial explanation, and records current instrument, profile, evidence-display, and Arabic review status. It explains the browser-local quiz flow and the separate Web3Forms correction channel with the retention caveat.
- `npm run check`: 223 files, 0 errors/warnings/hints. `npm run test:design`: 248 files passed; nine existing warnings remain in unrelated site/article files. `npm run build` completed: 707 HTML files found, 706 indexed / 66,613 words; the existing `/research/` no-HTML-root Pagefind warning remains.
- Targeted Chromium test passed with JavaScript disabled, including exactly one main landmark, status claims, route links, and no horizontal overflow at 320, 390, 780, and 1280px. The route's rendered contrast check reported 0 failures in both themes at 1440px and 390px. This does not constitute manual screen-reader review, Arabic approval, reader comprehension validation, rights clearance, or M6 release-candidate approval.
