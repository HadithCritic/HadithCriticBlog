# `hallmark audit` of the hadith section, after state

Run date: 2026-09-09, after phases 0 to 4. Compare against
`docs/hallmark-audit-before.md`.

Method: each page re-read against the same gate list, then a scripted
regression check of all 37 named defects against the running site with real
D1 data (276,347 hadith, 20,950 narrators), plus per-page measurement in the
browser at 1440px and 375px in both themes.

## Scoreboard

| Page type | Before (C / M / m) | After (C / M / m) | Closed |
|---|---|---|---|
| Landing / catalogue | 2 / 5 / 2 | 0 / 0 / 1 | 8 of 9 |
| Collection / edition | 2 / 6 / 2 | 0 / 0 / 1 | 9 of 10 |
| Individual hadith | 1 / 3 / 2 | 0 / 0 / 1 | 5 of 6 |
| Biographical (3 routes) | 4 / 9 / 3 | 0 / 0 / 2 | 14 of 16 |
| **Total** | **9 / 23 / 9** | **0 / 0 / 5** | **36 of 41** |

Every critical and every major is closed. Five minors remain, all of them
deliberate and listed below.

## What each page closed

### Landing / catalogue

L1 dead `.corpus-eyebrow` repointed to `.hc-eyebrow` (the kicker was rendering
as 17px body copy). L2 stat band nested inside `.wrap`, so its rules stop
overhanging the text column by 40px: measured band `133..1293` against title
`133..1293` at 1440px, and `30..330` against `30..330` at 375px. L3 italic
accent dropped. L4 five kickers cut to two real breadcrumbs, fake `01 /`
ordinal removed. L5 hero rebalanced from 112/72 to 46/65 (bottom is 1.40x top,
gate wants 1.3x). L6 dead `.corpus-search-options` selector renamed, so the
scope and collection selects now stack on a phone (verified `flex-direction:
column` at 375px). L7 three outbound arrows corrected. L8 pressed and
unavailable states added to the selects, jump input and submit.

### Collection / edition

C1 as L2. C2 `51-75of 7,410` fixed with an explicit `{' '}`. C3 the orphaned
Arabic title anchored into a fit-content masthead against the end of the
English title. C4 the bordered aside dissolved into a ruled block and the
invisible progress hairline replaced by the shared `.hc-progress`. C5 as L3.
C6 chapter headings now emit English before Arabic, with the Arabic-above-gloss
look restored via flex `order` (verified: DOM en at 2521562, ar at 2521711;
computed order 1/2/3). C7 fake `02 /` ordinal removed. C8 outbound arrow
corrected. C9 the exact-phrase control moved out of the search bar, where it
had a 24px hit area inside a 52px control. C10 tools and reading rhythms
separated.

### Individual hadith

H1 and H4 the centred bordered banner replaced by a ruled citation head:
breadcrumb, title on the text axis, and the citation apparatus off-axis as a
labelled definition list. H2 both facing-column blocks now emit English before
Arabic; the existing grid rules reproduce the identical picture (English
`189..693`, Arabic `733..1237`), so tab and screen-reader order changed and
nothing else did. H3 panel heads lifted from 13px apparatus to a 28px display
step. H6 the pager's non-interactive edges marked disabled.

H5 was withdrawn during the audit on verification (the `Chapter:` prefix is
inconsistent source wording, not a template artifact). H7 was withdrawn on
inspection: `.isnad__pos` already carried `tabular-nums`.

### Biographical

B1 `--hc-danger` defined per theme, closing 18 undefined call sites at once.
The dossier's two were the worst: `#c2593c` measured 3.10 to 4.37:1 and failed
AA in both themes on every surface. B2 the reliability traffic light removed
from both the server template and the client row template, so it does not
return on the first filter click. B3 filters converted from dead
`type="button"` controls to links, with active state derived from parsed
params and a `noscript` sort fallback; verified server-side (`generation=Companion (Sahabi)`
returns 758, `century=2` returns 3,226, both plus `sort=hadith` returns 247)
and client-side (a marker survives the click, so the module intercepts rather
than navigating). B4 four page-local components repointed to the shared layer
with the originals deleted in the same commits. B5 inert pills replaced by
ruled identity rows, with the one value that maps to a real filter as a link.
B6 the Arabic name anchored. B7 token hygiene. B8 section heads lifted. B9
assessment cards rebuilt as ruled bilingual rows. B11 breadcrumbs added to both
narrator pages. B12 italic headline dropped. B13 copy reframed. B14 the compare
control moved after the row link in both templates. B15 radii tokenised.

## Remaining minors, all deliberate

| # | Finding | Why it stands |
|---|---|---|
| L9 | Arbitrary spacing values | The `--space-*` scale is defined and documented. Migrating ~9,500 lines of existing CSS onto it is a mechanical change that deserves its own reviewable commit, not a rider on a design pass. |
| C10b | Section rhythm still fairly even | Tools and reading were separated; the TOC still shares the tools rhythm. Further variation risks making the reader feel arbitrary rather than paced. |
| H8 | Record page measure is 68rem while `.wrap` is 1240px | One of the three coexisting measures. Reconciling them is a section-wide layout decision, logged as a Known Gap in `DESIGN.md`. |
| B10 | Three content measures coexist | As H8. |
| B16 | `narrators/compare.astro` only lightly touched | Copy and the shared back link only. It is `noindex`, reachable solely from the register's compare dock, and a full pass on it was not in the four page types scoped. |

## Standing accepted deviations

Unchanged from the before-audit, and recorded there with reasoning: gate 1
(Poppins is a named AI tell but is load-bearing brand), gate 22 (already
satisfied, every neutral is warm-tinted), gate 30 (already satisfied, the
section ships zero icon-library SVG and uses Unicode arrows).

One gate was deliberately re-opened and then closed differently. The plan
carried a `.hc-title-reveal` hero entrance borrowed from react-bits' line
stagger. Built and rendered, it failed this project's own rule that motion
must be motivated: a title fade communicates no hierarchy, orientation or
state, and `fill-mode: both` hides the h1 during its delay, which is the LCP
element. It was replaced by `.hc-progress`, where the draw actually tells a
reader how far into 1,564 pages they are.

## Verification

- 37 of 37 scripted defect checks pass against the running site.
- 54 of 54 new or changed colour pairs clear WCAG AA in both themes,
  computed rather than eyeballed. Table in the final summary.
- `npm run lint:footnotes`, `test:notifications`, `test:normalize`,
  `astro check` (0 errors, 0 warnings, 0 hints), `test:design` and the full
  `build` (208 pages, Pagefind index rebuilt) all pass.
- No horizontal overflow at 375px on any page in scope
  (`scrollWidth 360 <= innerWidth 375`).

## Pre-emit self-critique

`P5 H5 E5 S5 R4 V4`. Restraint remains the weakest axis: the biographical
block was large and a few of its findings (B10, B16) were deferred rather than
resolved, which is the right call for scope but leaves the section not quite
uniform.
