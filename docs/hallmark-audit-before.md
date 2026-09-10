# `hallmark audit` of the hadith section, before state

Run date: 2026-09-09. Target: the four page types in the hadith/rijāl section.
Working tree at audit time: `drafts` branch with ~3,100 lines of uncommitted
in-progress design work across `src/pages/hadith/**` and `src/styles/**`.

Audited against `hallmark` (Nutlope) + `design-taste-frontend` (Leonxlnx),
cross-checked against this repo's own `DESIGN.md`, which the audit verb treats
as the authoritative system.

## Standing deviations (accepted, not findings)

Three hallmark gates fire on this site by construction. They are recorded here
once so they do not reappear as findings on every page.

| Gate | Fires because | Why it is accepted |
|---|---|---|
| 1: display font is a named AI tell | `--font-display` is Poppins | The face is load-bearing brand. `DESIGN.md` documents a three-face role split (Poppins = read, Glacial = apparatus, Amiri = Arabic) where the real typographic contrast is Latin against Arabic, not serif against sans. Swapping it is a rebrand, which is out of scope. |
| 22: zero-chroma neutrals | n/a: already satisfied | Every surface is warm-tinted (`#0f0f10`, `#141312`, `#1e1d1b`). No action. |
| 30: icon tells | n/a: already satisfied | The section ships **zero** icon-library SVG. All directional marks are Unicode typographic arrows. That is a coherent manuscript-appropriate choice; introducing Lucide/Phosphor here would be the regression, not the fix. |

---

## 1. Landing / catalogue: `src/pages/hadith/index.astro`

Dials read from the shipped page: VARIANCE 6 · MOTION 3 · DENSITY 5.

### critical

| # | Tell | Where | Fix |
|---|---|---|---|
| L1 | **Mid-render token improvisation / dead class** (gate 48). `.corpus-eyebrow` has no rule anywhere in the codebase. The catalogue hero's kicker renders as 17px parchment body copy instead of 13px gold uppercase apparatus: the single most visible defect in the section. | `index.astro:227` | Repoint to `.hc-eyebrow`. |
| L2 | **Design-system drift: stat band breaks the content measure.** `class="wrap hc-stat-band"` puts the band's top/bottom rules on the `.wrap` *border* box, but `.wrap` carries `padding-inline: max(--pad, --sal)` inside it. The rules overhang the text column by exactly `--pad` (40px each side at ≥1024px). Measured: band `92…1332`, hero title `133`. | `index.astro:245`; same bug at `collection/[slug].astro:239` | Nest the band inside `.wrap` as a child rather than applying both classes to one element. |

### major

| # | Tell | Where | Fix |
|---|---|---|---|
| L3 | **Italic header** (gate 38a, anti-patterns § Italic headers). `The Corpus of *Narration.*`: the italicised emphasis word inside an upright display headline is the single most-cited AI tell. | `index.astro:229, 557` | Drop `font-style: italic`; the gold already carries the accent. |
| L4 | **Eyebrow on every section** + fake ordinals. Five kickers on one page, of which `01 / Archive` numbers a sequence that has exactly one member. | `index.astro:263, 348, 457` | Keep the two that are real breadcrumbs (`Corpus / Search`). Drop the ordinal prefix and the redundant `Research instrument`. |
| L5 | **Hero fit: top-heavy padding** (gate 44a). `.corpus-head` is `padding: clamp(4rem,8vw,7rem) 0 0` with a 4.5rem bottom on the inner grid: 112px top vs 72px bottom. Gate wants bottom ≥ 1.3× top. The hero floats off the page instead of sitting into the ledger below. | `index.astro:530-531` | Rebalance toward a heavier bottom. |
| L6 | **Dead responsive selector.** The 640px block styles `.corpus-search-options`; the markup ships `.hc-searchbar__options`. Search scope/collection selects therefore never stack on a phone. | `index.astro:1173` | Rename to the shipped class. |
| L7 | **Wrong directional glyph.** `↗` (external / new-window) used on internal back-links: `Back to catalogue ↗`, `Clear search ↗`. | `index.astro:218, 268` | `←` for back, `→` for forward. Reserve `↗` for genuinely outbound links. |

### minor

| # | Tell | Where | Fix |
|---|---|---|---|
| L8 | Eight-state gap (gate 26). `.corpus-control select`, `.corpus-pager__jump-input` and `.hc-searchbar__submit` have default + hover + focus only: no `:active`, no `:disabled`. | `index.astro:128-138, 1090-1140` | Add the two missing states. |
| L9 | Arbitrary spacing (gate 24). No named spacing scale exists; the page uses `0.42rem`, `0.55rem`, `0.85rem`, `1.05rem`, `1.25rem`, `1.8rem` ad hoc. | throughout | Introduce a `--space-*` scale in `global.css` and migrate on touch. |

**1 critical (+1 shared) · 5 major · 2 minor**

---

## 2. Collection / edition: `src/pages/hadith/collection/[slug].astro`

Dials read: VARIANCE 6 · MOTION 3 · DENSITY 4.

### critical

| # | Tell | Where | Fix |
|---|---|---|---|
| C1 | **Stat-band measure break**: same defect as L2. | `[slug].astro:239` | As L2. |
| C2 | **Broken running text.** `{resultEnd}` and `<span>of {total}</span>` sit on separate JSX lines; Astro trims the newline, so the edition position renders literally as **`51–75of 7,410`** at 34px, in the most prominent element of the aside. | `[slug].astro:227-228` | Emit an explicit `{' '}`. |

### major

| # | Tell | Where | Fix |
|---|---|---|---|
| C3 | **Orphaned Arabic title.** `.edition-title-ar` is a `dir="rtl"` block inside the 1.4fr grid column, so it right-aligns to an invisible column edge (~x 895): floating in dead space between the English title and the aside card, anchored to nothing. | `[slug].astro:215-217` | Anchor it: either baseline-pair it with the English title or align it to a real edge. |
| C4 | **Container outranks rule** (`DESIGN.md` § Shape and layout: "fine rules and underlines outrank large containers"). `.edition-aside__card` is the only bordered box on the page and runs ~40% empty below its content. Its progress track is a 1px gold hairline at 0.1%: invisible. | `[slug].astro:224-236` | Convert to a ruled block; make the progress read at low percentages or drop it (the stat band already states page N of M). |
| C5 | **Italic header**: `.edition-title-ar` sibling accent, same tell as L3. | `[slug].astro:1106` | As L3. |
| C6 | **DOM reading order inverted on chapter headings.** `.edition-chapter__ar` precedes `.edition-chapter__en` in the DOM, against the site rule that English precedes Arabic. Every other bilingual pair on this page follows the rule. | `[slug].astro:380-382` | Swap; keep the visual result via CSS ordering if the Arabic-first look is wanted. |
| C7 | **Fake ordinal eyebrow**: `02 / Source sequence` numbers a sequence whose `01` is on a different page. | `[slug].astro:347` | Drop the ordinal. |
| C8 | **Wrong glyph**: `Back to corpus ↗`. | `[slug].astro:234` | `←`. |

### minor

| # | Tell | Where | Fix |
|---|---|---|---|
| C9 | Cramped inline control. The `EXACT` checkbox is wedged between the search input and the submit button inside `.hc-searchbar`; its hit area is ~24px inside a 52px bar, and it is the only searchbar in the section shaped this way. | `[slug].astro:276-279` | Move to `.hc-searchbar__options` like the catalogue, or give it a full-height label. |
| C10 | Equal section rhythm (anti-patterns § Every section padded the same). Tools / TOC / reading all use the same `clamp(2.5rem,5vw,4rem)` block padding. | `[slug].astro` | Vary: tighten the tools, open the reading stream. |

**2 critical · 6 major · 2 minor**

---

## 3. Individual hadith: `src/pages/hadith/[id].astro`

Dials read: VARIANCE 4 · MOTION 2 · DENSITY 5.

### critical

| # | Tell | Where | Fix |
|---|---|---|---|
| H1 | **Full-viewport centred hero / centred-everything** (gates 6, 133). `.hadith-banner` is a bordered box with the Arabic collection name, the chapter title and the reference line all on one centred vertical axis. This is the most template-shaped element in the section and the first thing on the page. | `[id].astro:145-163, 365-370` | Break the axis. A critical edition heads a record with a citation block, not a centred plaque. |

### major

| # | Tell | Where | Fix |
|---|---|---|---|
| H2 | **DOM reading order inverted.** Both `.hadith-cols` blocks emit `--ar` before `--en` and then reposition English to grid column 1. Visual order is right, but screen-reader and tab order read Arabic first: inconsistent with the catalogue and the edition, which both emit English first and use the identical grid trick. | `[id].astro:181-196, 212-227` | Swap the DOM order; the existing `grid-column`/`grid-row` rules already produce the correct visual result at both breakpoints, so nothing moves. |
| H3 | **No display register.** The page's only large type is the chapter title inside the banner. Every section head (`Matn`, `Full Report`, `Chain of Transmission`, `Apparatus`) is Glacial 13px uppercase. Against the catalogue's `clamp(1.8rem,3vw,2.55rem)` section heads, the record page reads as a lesser page. | `[id].astro:405-410` | Give the panels a display-scale head with the apparatus label demoted to a kicker. |
| H4 | **Container outranks rule**: the banner is the section's only card. | `[id].astro:365-370` | As H1. |
| ~~H5~~ | ~~Data leakage into display copy: titles render as `Chapter: How the first revelation…`~~ **Withdrawn on verification.** Checked against the corpus: 46,570 rows begin `Chapter:` and 59,857 begin `Chapter on`, out of 276,347 with a non-empty `chapter_en`: so the prefix is inconsistent *source* wording, not a uniform field artifact. Stripping it would edit the source, which the content-integrity rule forbids. Separately, a subset of rows carries stray wrapping double quotes (`"Chapter: The Muslim is he…"`), which is a **data** issue for the import pipeline, not a design one. | `[id].astro:150` | No design change. Logged for the data owner. |

### minor

| # | Tell | Where | Fix |
|---|---|---|---|
| H6 | `.hadith-pager` reuses `.hc-back-link` for a *forward* link and for a disabled `<span>`; the shared component has no disabled affordance. | `[id].astro:334-343` | Add a disabled modifier to the shared component. |
| H7 | Isnād ladder positions use `.isnad__pos` numerals without `font-variant-numeric: tabular-nums` (anti-patterns § Tabular data without tabular-nums). | `[id].astro` | Add the property. |

**1 critical · 3 major · 2 minor** (H5 withdrawn on verification)

---

## 4. Biographical: `src/pages/narrators/index.astro`, `narrators/[id].astro`, `narrators/compare.astro`

These three routes were never touched by the in-flight design pass. They are a
design generation behind the hadith pages and account for most of the section's
total debt.

Dials read: VARIANCE 4 · MOTION 2 · DENSITY 6.

### critical

| # | Tell | Where | Fix |
|---|---|---|---|
| B1 | **Contrast failure, both themes, every surface.** `--hc-danger` is referenced 18 times across the repo and **is never defined**. Every call site falls back to a hardcoded hex. On the dossier that is `#c2593c`, carrying the jarḥ pill and the jarḥ statement label: the most important apparatus on the page. Measured: **4.37** (dark s0), **3.84** (dark s2), **4.17** (light s0), **3.40** (light s2), **3.10** (light s3). All below the 4.5:1 floor. | `narrators/[id].astro:824, 872`; 16 more in `src/content/articles/**` | Define `--hc-danger` per theme in `global.css`. Fixes all 18 sites at once. |
| B2 | **Reliability traffic light**: violates the project's own no-grading rule. `gradeTone()` maps narrator grades to `is-trusted` (green, `--cat-theology-text`) and `is-weak` (red, `--cat-prophecies-text`), rendered on every register row. On the dossier the same grade is the gold pill, the most emphasized element after the name. Colour is doing evaluative work the copy explicitly disclaims. | `narrators/index.astro:127-132, 278, 734-736`; `narrators/[id].astro:200, 62` | Keep the grade term as attributed source data in neutral apparatus ink; remove the valence colouring. Same for `--jarh`/`--tadil` red/gold. |
| B3 | **No-JS failure**: violates the project's own no-JS rule. Every generation / grade / century filter is a `<button type="button">` driven only by `narrator-register.ts`, and the sort `<select>` has no submit. With JS off the register renders page 1 unfiltered and unsortable, and the `All` tab is hard-coded `is-active` so a URL-filtered request renders a *wrong* active state server-side. | `narrators/index.astro:186-234` | Real `<button type="submit" name="…" value="…">` inside the existing `method="get"` form; derive `is-active` from the parsed params. |
| B4 | **Design-system drift.** `.register-stat-band`/`.register-stat` is a fourth copy of the stat band that the `global.css` consolidation missed, and `.register-search` is a second copy of `.hc-searchbar`. `.rijal-facts` is a fifth stat-band analogue with a different type scale and no cell rules. `.rijal-back` is a third back-link. None reference the shared layer. | `narrators/index.astro:359-400, 561+`; `narrators/[id].astro:663-686, 609-617` | Repoint to `.hc-stat-band`, `.hc-searchbar`, `.hc-back-link` and delete the page-local originals in the same commit. |

### major

| # | Tell | Where | Fix |
|---|---|---|---|
| B5 | **Inert pills**: direct `DESIGN.md` violation ("every pill must do something; a pill that is not a control or a link is decoration and does not belong"). The dossier ships three inert `.rijal-badge` pills in the header, an inert `.rijal-pill` tally row, an inert `.rijal-phenomena` row, and inert `.rijal-alias` chips. | `narrators/[id].astro:340-345, 505-512` | Make them links into the register's own filters (generation, tabaqa, century are all real query params) or demote to ruled metadata. |
| B6 | **Orphaned Arabic name.** `.rijal-name-ar` is an unanchored RTL block that lands at the far right of a ~950px column, visually detached from the English name it belongs to. | `narrators/[id].astro:337, 636-643` | Anchor to the name block. |
| B7 | **Hardcoded fonts and colours** (gate 48). `font-family: 'Glacial Indifference', system-ui, sans-serif` ×3 and `'Amiri', serif` ×1 instead of `var(--font-ui)` / `var(--font-arabic)`; `var(--hc-rule, rgba(197,160,89,0.16))` hardcoded fallbacks ×2; `var(--font-display, serif)` names a serif fallback for a sans stack. | `narrators/[id].astro:939-982` | Token-only. |
| B8 | **No display register**: `.rijal-section h2` at 1.35rem against the catalogue's 2.55rem. The dossier, the section's densest and most citable page, has the weakest hierarchy. | `narrators/[id].astro:693` | Give the dossier a proper head scale. |
| B9 | **Card-heavy, air-heavy.** `.rijal-verdict`, `.rijal-chain`, `.rijal-critic` and `.rijal-alias` are all bordered `--hc-surface-2` boxes. The verdict cards run ~40% empty because the English sits left and the Arabic right-aligns as a separate block. | `narrators/[id].astro:728-750` | Ruled two-column rows; pair each translation with its Arabic on one baseline. |
| B10 | **Three content measures in one section.** `.wrap` 1240px, `.hadith` 68rem/1088px, `.rijal-page` ~955px. | across | Pick one, or make the difference deliberate and documented. |
| B11 | **No eyebrow / no breadcrumb** on either narrator page, where all three hadith pages carry one. Nothing tells a reader the dossier belongs to the register. | `narrators/index.astro:146`, `[id].astro:335` | Add the breadcrumb kicker. |
| B12 | **Italic header**: `The Transmitters of *Hadith.*` | `narrators/index.astro:158, 349` | As L3. |
| B13 | **Copy frames source grades as site verdicts.** `With Verdicts` stat, `Verdict` filter label, `Verdict` compare row, `Scholarly Verdicts` section. The lead sentence disclaims exactly this, then the UI does it anyway. | `index.astro:136, 205`; `compare.astro:68`; `[id].astro:349` | Reframe as attributed criticism. |

### minor

| # | Tell | Where | Fix |
|---|---|---|---|
| B14 | Compare `+` button precedes the row link in DOM on all 50 rows, so a JS-only control takes tab priority over the primary destination on every row. | `narrators/index.astro:256-264` | Move after the link. |
| B15 | Radius drift: `border-radius: 6px` ×4 with no matching token (`--radius-sm` 4px, `--radius-md` 8px). | `narrators/[id].astro` | Tokenize. |
| B16 | `.rijal-back` is 0.87rem with no min-height; below the 44px target the shared `.hc-back-link` guarantees. | `narrators/[id].astro:609-617` | Covered by B4. |

**4 critical · 9 major · 3 minor**

---

## Section totals: before

| Page type | critical | major | minor |
|---|---|---|---|
| Landing / catalogue | 2 | 5 | 2 |
| Collection / edition | 2 | 6 | 2 |
| Individual hadith | 1 | 3 | 2 |
| Biographical (3 routes) | 4 | 9 | 3 |
| **Total** | **9** | **23** | **9** |

Two criticals (L2 / C1) are the same defect counted on both affected pages.

## Pre-emit self-critique of the audit

`P5 H4 E5 S5 R4 V4`: findings are anchored to file:line and to measured
values rather than impressions; the weakest axis is Restraint, since the
biographical section produced a long list that the plan will need to
prioritise rather than execute wholesale.
