# M4 quiz and correction technical audit

Date: 5 October 2026  
Scope: current Fiqh Compass overview, standalone quiz/results flow, and correction journey. This is an implementation audit, not a WCAG conformance claim, scholarly review, or full-site performance study.

## Audit health score

| Dimension | Score | Finding |
|---|---:|---|
| Accessibility | 2/4 | Semantic radio groups and announced status exist; a no-JavaScript page now exposes all items without sending answers, but it cannot calculate a summary. Quiz keyboard and assistive-technology behavior need direct evaluation. |
| Performance | 3/4 | The quiz is a static route with a small page module and local calculations; field performance and assistive-technology overhead were not measured. |
| Responsive design | 3/4 | Follow-up Chromium checks found no horizontal overflow at 320px or 390px and confirmed the active quiz panel fits both widths. Root font size was increased to 200% and remained within the viewport. Full browser zoom and all result/overview breakpoints still need review. |
| Theming | 3/4 | The quiz deliberately uses the site's fixed parchment surface and shared tokens, but several answer-state colors and a focus outline are page-local. Component contrast was not separately measured. |
| Anti-patterns | 3/4 | The interface is legible and uses conventional quiz controls; the repeated answer rows are task-appropriate. Page-local outline/color declarations conflict with the site's locked design-system guidance. |
| **Total** | **14/20** | **Good prototype quality; substantial release work remains.** |

Scores describe this bounded source review and the checks listed below. They do not certify WCAG 2.2 AA or public-release readiness.

## Checks performed

- `npm run check`: passed, 219 files, zero errors, warnings, or hints.
- `npm run test:design`: passed, 245 source files; nine warnings are in unrelated site/article files.
- Isolated production build `dist-fc-review-m8`: passed; Pagefind indexed 705 pages out of 706 HTML files. `/research/` remains unindexed because it has no outer `<html>` element.
- The current m8 static client build passed both `tests/fiqh-compass.spec.ts` Chromium journeys: local resume/results with unknown answers excluded from coordinates, and correction intake with seeded answer data unread and absent from the mocked request.
- Current synthetic scoring tests passed 11/11 and routing tests passed 6/6.
- The correction journey checked keyboard tab order and horizontal bounds at 390px. It did not exercise the quiz at that viewport.
- Quiz request checks saw no non-GET requests. This supports the tested client flow, not a complete browser-network or hosting privacy audit.
- No live correction submission was sent. Web3Forms recipient, retention, and operational handling remain unverified.

## Findings

### P1 — Arabic quiz and results are not implemented

**Location:** `src/pages/projects/fiqh-compass.astro`; `src/pages/projects/fiqh-compass/quiz.astro`.  
**Category:** Internationalization and release completeness.  
**Impact:** The overview, questions, navigation, scoring explanation, and result labels are English-only. This does not meet the public-version requirement for English and Arabic. Arabic scholarly wording and corresponding English must be reviewed together before the Arabic instrument is made scoreable.  
**Recommendation:** Add a language selection and bilingual interface/content model. Keep unreviewed Arabic item translations marked draft and out of scored/public use until bilingual and specialist review is recorded.

### P1 — No-JavaScript respondents cannot calculate a summary

**Location:** `src/pages/projects/fiqh-compass/quiz.astro:53-92`; `src/lib/fiqh-compass.js:5-211`.  
**Category:** Accessibility and design-system consistency.  
**Status:** Partially addressed on 5 October 2026. The quiz now renders all 24 questions and all axis definitions in the static HTML; a visible fallback explains that without JavaScript there is no automatic summary and answers are neither sent nor saved. The client adds the one-question flow only after initialization. The interaction is a non-submitting container rather than a form, so answers cannot be serialized into a GET URL. A focused Chromium context with JavaScript disabled confirmed all 24 cards are visible, an answer can be selected, and the URL remains unchanged.
**Remaining impact:** No-script respondents cannot navigate one question at a time, save/resume, or calculate a result. The fallback is a readable/selectable questionnaire, not a complete quiz flow. Keyboard selection and assistive-technology behavior still need direct evaluation.
**Next:** Consider a static downloadable/printable response sheet or an equivalent accessible manual result guide. Do not put answer values into a GET URL.

### P2 — Responsive and keyboard coverage is improved, but not complete

**Location:** `tests/fiqh-compass.spec.ts:3-60`; `src/pages/projects/fiqh-compass/quiz.astro:40-90`.  
**Category:** Accessibility and responsive verification.  
**Status:** Partially addressed on 5 October 2026. Browser checks cover the quiz at 320px and 390px, a keyboard-only path through all 24 answers to results, the global focus outline on an answer radio, reduced-motion preference, and 200% root font-size reflow. The 390px correction-form check remains separate.
**Remaining impact:** This is not a manual keyboard review of every control or a screen-reader test. The 200% assertion changes root font size rather than browser zoom, and responsive coverage does not yet exercise overview, evidence, or future comparison pages.
**Next:** Conduct manual keyboard and screen-reader review, then test the production browser's 200% zoom and complete-result/overview layouts at narrow widths.

### P2 — Verify route-specific contrast with assistive technology

**Location:** `src/pages/projects/fiqh-compass/quiz.astro`.  
**Category:** Theming and accessibility.  
**Status:** Partially addressed on 5 October 2026. The custom component outline was removed; answer radios are visibly rendered and use the site-wide `:focus-visible` outline. Agree/disagree options no longer use green/red state fills that could be read as evaluative. The rendered contrast checker reports zero failures in either theme on the five overview, issue, profile, correction, and quiz routes. Fixes addressed the question number, disabled Back text, and an axis-tag background mismatch on issue cards.  
**Follow-up verification:** The contrast checker renders 24-neutral-answer, all-skipped, and all-unknown result states. It asserts 12 meters for the neutral presentation and 12 “No scored answers” rows with zero meters for both skipped and unknown states, then measures text contrast. All three result states have zero contrast failures in dark/light themes at 1440px and 390px. Neutral responses only reveal the prototype meters; they are not evidence for a scholarly coordinate.  
**Remaining impact:** No manual screen-reader review has been completed. All-unknown results, result actions, focus states, and hover/disabled interaction states are not fully covered by this result-state check.  
**Next:** Check interactive-state contrast, then complete a manual keyboard and screen-reader pass.

## Positive findings

- Native labelled radio inputs and a fieldset/legend structure give the quiz a sound semantic base.
- Progress and navigation status use live regions; results move focus to the results heading.
- Unknown and not-applicable answers are omitted from axis means, and the result text explains the draft status and limited coverage.
- The current client stores answers locally, catches unavailable-storage errors, clears saved answers on reset, and sends no quiz data in the tested flow.
- The correction form did not read local quiz storage; its submission was isolated to a mocked endpoint during testing.
- With JavaScript disabled, all 24 question panels remain available in the static page; the response controls are not inside a submitting form.
- The standalone quiz has a reduced-motion rule and the tested correction form stayed within 390px.

## Follow-up verification — 5 October 2026

- Rebuilt the E2E site into `dist`; Pagefind indexed 705 pages.
- `npm run check` passed across 219 files with zero errors, warnings, or hints.
- `npm run test:design` passed across 245 source files with nine warnings in unrelated article/site files.
- The final four-case run against the rebuilt E2E output checked the quiz at 320px/390px, a keyboard-only completion path through all 24 items, global focus visibility, reduced-motion preference, and 200% root font-size reflow. All four cases passed.
- Rendered contrast checks report zero text failures in dark and light themes on the five overview, issues, profiles, corrections, and quiz routes against the live dev rendering. The axis-tag background mismatch, disabled button, and large question numeral were adjusted to pass.
- The reusable `--quiz-results` and `--quiz-results-empty` modes check both the 12-meter neutral presentation and the no-score presentation with 12 “No scored answers” rows and zero meters at 1440px and 390px. Both report zero text-contrast failures in both themes. Neutral answers are presentation test data and do not validate or authorize the prototype score.
- The no-JavaScript flow has no automatic result or persistence. Actual browser zoom, full manual keyboard/screen-reader review, live correction delivery, account retention, and operational ownership remain outstanding.

## Release effect

M4 remains **partial**. The current build and four focused browser journeys support the prototype scaffold, including a JavaScript-off view of every question, but do not close Arabic support, automatic no-JavaScript results, manual screen-reader review, actual browser-zoom evaluation, live correction delivery, or account-retention/operational ownership. The all-unknown state now passes a focused rendered check; contrast measurement does not validate scoring.

## All-unknown result contrast follow-up — 5 October 2026

- Added `--quiz-results-unknown` to `scripts/check-contrast.mjs`. It turns off auto-advance, selects “I am not sure” for all 24 items, completes the real client flow, and asserts 12 result rows labeled “No scored answers” with zero meters before measuring text contrast.
- Against the live Astro dev rendering at `http://127.0.0.1:4322`, the mode passed in dark and light themes at 1440px and 390px, with zero contrast failures. `node --check scripts/check-contrast.mjs` passed.
- This is rendered presentation and a narrow assertion that unknown responses do not produce meters. It is not score validation, a production-build browser run, a manual assistive-technology review, or coverage of result actions/focus/hover/disabled states.

## Fail-closed evidence disclosure follow-up — 5 October 2026

- Added one evidence/review disclosure per result axis. The manifest is empty,
  so the user sees a clear no-reviewed-passage state and a statement that the
  provisional dimension reflects only their answers. Three synthetic unit
  tests pass.
- A record must pass the allowlisted metadata gates for source/edition/locators,
  exact Arabic/English text hashes, approved translation and bilingual review,
  specialist finding and caveats, and cleared-rights metadata. Browser
  WebCrypto checks the exact strings against those hashes before rendering.
  Missing crypto, mismatches, or incomplete records are excluded. This code
  cannot authenticate reviewer identity or establish legal reuse rights.
- `npm run check` passes across 222 files with zero diagnostics;
  `npm run test:design` passes across 247 source files with nine unrelated
  warnings. The isolated `dist-fc-review-m10` build completed and Pagefind
  indexed 705 pages. All four focused Chromium journeys pass against this
  build. Neutral, all-skipped, and all-unknown results pass rendered contrast
  with all 12 evidence disclosures expanded in dark/light themes at 1440px and
  390px, with zero text failures.
- This follow-up adds a display safeguard and test coverage only. No evidence
  entry is approved/rendered; there is no new scholarly review, score
  authorization, rights clearance, or change to the release gate. Manual
  keyboard/screen-reader review, actual browser zoom, account retention,
  correction delivery, and editor ownership remain outstanding.

## Isolated M11 build verification — 5 October 2026

- After the metadata-only I17 acquisition update, `npm run check` passed across
  222 files with zero diagnostics; `npm run test:design` passed across 247
  source files with nine unrelated warnings. The isolated M11 production build
  completed, verified 37 Quran release manifests, excluded 435 unmanifested
  Quran files, linked 11,799 immutable release assets, and Pagefind indexed
  705 pages. `/research/` remains unindexed because it lacks an outer `<html>`
  element.
- All four Fiqh Compass Chromium journeys passed against M11: the no-JavaScript
  questionnaire and URL privacy path, local resume/results, phone/keyboard
  completion, and correction answer isolation. These checks validate runtime
  and packaging, not M1–M8 research/review/release gates.
