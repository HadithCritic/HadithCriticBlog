# Hadith section UI/UX upgrade, implementation plan

Scope: `/hadith`, `/hadith/collection/:slug`, `/hadith/:id`, `/narrators`,
`/narrators/:id`, `/narrators/compare`.

Sources: `docs/hallmark-audit-before.md` (9 critical · 23 major · 9 minor),
`DESIGN.md` (rewritten this pass into the awesome-design-md schema), and direct
inspection of the running site against local D1 (276,347 hadith · 20,950
narrators). Every page was rendered with real data, not fixtures.

---

## 0. What I found before planning (context that shapes everything below)

**There is uncommitted work in scope.** The `drafts` branch carries ~3,100
uncommitted lines across `src/pages/hadith/**`, `src/pages/projects.astro` and
`src/styles/**`. It is a *good* in-flight design pass: it introduced the shared
`.hc-stat-band` / `.hc-back-link` / `.hc-searchbar` layer in `global.css` and
repointed the three hadith pages onto it. This plan **continues** that work; it
does not restart it. I have not reverted or rebased anything.

That pass also left three live regressions, which is where the two catalogue
criticals come from: a dead `.corpus-eyebrow` class, a dead
`.corpus-search-options` media-query selector, and the `.wrap` + `.hc-stat-band`
measure break.

**The narrator routes were never touched by it.** They are a design generation
behind and hold 4 of the 9 criticals. They are first-class scope here.

**Framework:** no React / Preact / Svelte / Vue anywhere. `package.json` has
`gsap` and nothing else client-side; islands are absent. So react-bits is a
motion *reference* only: no CLI installs, no new dependency. See §3.

**`docs/design-audit.md` does not exist**, though `global.css` cites it eight
times (`design-audit.md §1.2`, `§2`, `§5`, `§7`, `§8`). Those citations are
dangling. `docs/hallmark-audit-before.md` now fills that role; I will repoint the
comments as I touch them.

**No `CLAUDE.md` exists.** `AGENTS.md` is a 3-line stub pointing at `DESIGN.md`.
I will write `CLAUDE.md` at the end (§7).

---

## 1. Highest-impact changes per page type

Each is tied to a specific audit finding, not a generic improvement.

### 1.1 Shared layer (Phase 0: do first, see §4 for why)

| # | Change | Finding |
|---|---|---|
| S1 | **Define `--hc-danger` per theme** in `global.css`. 18 call sites reference it; none define it. The dossier's hardcoded `#c2593c` fallback measures **3.10–4.37:1**: fails AA in both themes on every surface. One token definition fixes all 18. | B1 |
| S2 | **Fix the `.wrap` + border-class collision.** Stop applying `.hc-stat-band` to a `.wrap` element; nest it. The band's rules currently overhang the text column by exactly `--pad` (40px each side, measured `92…1332` vs title at `133`). Affects the catalogue and the edition. Document the rule in `DESIGN.md` (done). | L2 / C1 |
| S3 | **Extract `.hc-section-head`**: one section-head component replacing `.corpus-section-head`, `.corpus-results-head`, `.edition-section-head`, `.hadith-panel__head` and `.rijal-section h2`, which are five variants of the same thing at five different type scales. | L4, H3, B8 |
| S4 | **Add `.hc-back-link--disabled`** so the hadith pager's edge states stop borrowing an interactive component for a non-interactive `<span>`. | H6 |
| S5 | **Add a `--space-*` scale** (4px base) to `global.css` and document it. **Migrate opportunistically only**: in the files this pass already touches. A global sweep is a separate change and I am not doing it here. | L9 |
| S6 | **Add `.hc-title-reveal`**: the one new motion primitive (§3). Line-staggered opacity/translate entrance on hero titles, ~90ms apart, `--motion-base`/`--ease-standard`, gated by `prefers-reduced-motion`. Vanilla CSS, no JS. | §3 |

### 1.2 Landing / catalogue: `/hadith`

Dials: **VARIANCE 6 · MOTION 3 · DENSITY 6.** A reference catalogue. Densest of
the four; the ledger is the product.

| # | Change | Finding |
|---|---|---|
| A1 | Repoint the dead `.corpus-eyebrow` to `.hc-eyebrow`. The hero kicker currently renders as 17px body copy: the most visible defect in the section. | L1 |
| A2 | Fix the dead `.corpus-search-options` selector (→ `.hc-searchbar__options`) so scope and collection selects actually stack on a phone. | L6 |
| A3 | De-italicise the display headline; keep gold + weight carrying the accent. Cut the eyebrow count from five to two (the real breadcrumbs), drop the fake `01 /` ordinal and the redundant `Research instrument`. | L3, L4 |
| A4 | Rebalance hero padding to bottom-heavy (currently 112px top / 72px bottom, gate wants bottom ≥ 1.3 × top) so the hero sits into the ledger instead of floating above it. | L5 |
| A5 | `↗` → `←` on internal back-links; add `:active`/`:disabled` to the selects, jump input and submit. | L7, L8 |

### 1.3 Collection / edition: `/hadith/collection/:slug`

Dials: **VARIANCE 5 · MOTION 3 · DENSITY 4.** A sequential reader. Deliberately
airier and slower than the catalogue, because this is where someone reads for an hour.

| # | Change | Finding |
|---|---|---|
| E1 | Fix `51–75of 7,410`. Astro trims the JSX newline before the `<span>`; emit an explicit `{' '}`. It is 34px type in the most prominent element of the aside. | C2 |
| E2 | Anchor the orphaned Arabic title. It currently right-aligns to an invisible grid-column edge and floats in dead space between the English title and the aside. | C3 |
| E3 | Dissolve `.edition-aside__card` into a ruled block. It is the page's only bordered box, runs ~40% empty, and its progress track is invisible at low percentages. `DESIGN.md`: fine rules outrank large containers. Make the reading-position track legible at 0.1% or drop it: the stat band already states page N of M. | C4 |
| E4 | Swap `.edition-chapter__ar` / `__en` DOM order so English precedes Arabic, matching every other bilingual pair on the site. Visual result preserved via CSS. | C6 |
| E5 | Drop the `02 /` ordinal; `↗` → `←`; move the cramped inline `EXACT` checkbox into `.hc-searchbar__options` to match the catalogue; vary the section rhythm (tighten tools, open the reading stream). | C7, C8, C9, C10 |

### 1.4 Individual hadith: `/hadith/:id`

Dials: **VARIANCE 5 · MOTION 2 · DENSITY 5.** A critical edition. Quietest
motion of the four. Nothing should move while someone compares two texts.

| # | Change | Finding |
|---|---|---|
| R1 | **Recompose the banner.** It is currently a bordered box with the Arabic collection name, chapter title and reference line all on one centred vertical axis: the most template-shaped element in the section, and the first thing on the page. Replace with an asymmetric citation head: ruled, left-anchored title, reference apparatus off-axis. | H1, H4 |
| R2 | **Swap the DOM order of both `.hadith-cols` blocks** to English-then-Arabic. The existing `grid-column`/`grid-row` rules already produce the correct visual result at both breakpoints, so **nothing moves visually**, but screen-reader and tab order stop reading Arabic first, and the page stops contradicting the other two. | H2 |
| R3 | Give the panels a display-register head via `.hc-section-head` (S3). Right now `Matn` / `Full Report` / `Chain of Transmission` / `Apparatus` are all 13px Glacial, so the record page reads as a lesser page than the catalogue. | H3 |
| R4 | `tabular-nums` on the isnād ladder positions; `.hc-back-link--disabled` on the pager edges. | H6, H7 |

### 1.5 Biographical: `/narrators`, `/narrators/:id`, `/narrators/compare`

Dials: register **VARIANCE 5 · MOTION 3 · DENSITY 6**; dossier **VARIANCE 4 ·
MOTION 2 · DENSITY 5.** The dossier reads as an encyclopedia entry: sectioned,
citable and evidence-forward, rather than a catalogue or a reader.

This is the largest block of work and holds the two changes with the most at
stake.

| # | Change | Finding |
|---|---|---|
| N1 | **Remove the reliability traffic light.** `gradeTone()` colours narrator grades green (`is-trusted`) and red (`is-weak`) on every register row; the same grade is the gold pill on the dossier, the most emphasized element after the name. Colour is doing evaluative work the lead paragraph explicitly disclaims. **Keep the grade term** (it is attributed source data and a legitimate facet) but render it in neutral apparatus ink with its attribution visible. Same for the `--jarh` red / `--tadil` gold valence on the criticism apparatus. | B2, plus the stated non-negotiable |
| N2 | **Make the register work without JavaScript.** Every generation / grade / century filter is a `<button type="button">` that only `narrator-register.ts` listens to; the sort `<select>` has no submit. With JS off the register renders page 1, unfiltered and unsortable, and the `All` tab is hardcoded `is-active`, so a URL-filtered request renders a *wrong* active state server-side. Convert to `<button type="submit" name="generation" value="…">` inside the existing `method="get"` form and derive `is-active` from the parsed params. The client module keeps enhancing on top. | B3, plus the stated no-JS rule |
| N3 | **Repoint to the shared layer and delete the originals.** `.register-stat-band` → `.hc-stat-band`; `.rijal-facts` → `.hc-stat-band`; `.register-search` → `.hc-searchbar`; `.rijal-back` and `.compare-crumb a` → `.hc-back-link`. Add the missing breadcrumb kicker (`.hc-eyebrow`) to both narrator pages: neither currently tells a reader the dossier belongs to the register. | B4, B11 |
| N4 | **Resolve the inert pills.** Generation and century become real links into the register's own query params (both exist); tabaqa and grade have no corresponding filter, so they become ruled metadata rows rather than fake-affordance pills. Same for the tally and phenomena rows. | B5 |
| N5 | **Rebuild the verdict / criticism blocks as ruled bilingual rows.** They are currently bordered `--hc-surface-2` cards running ~40% empty because the English sits left and the Arabic right-aligns as a detached block. Pair each translation with its Arabic on one baseline, English-before-Arabic in the DOM, collapsing Arabic-first below 780px. Anchor the orphaned `.rijal-name-ar`. | B6, B9 |
| N6 | Token hygiene: replace 4 hardcoded font stacks with `var(--font-ui)` / `var(--font-arabic)`, 2 hardcoded `--hc-rule` fallbacks, the `var(--font-display, serif)` fallback, and 4 untokenised `6px` radii. Give the dossier a display-register head (S3). Move the compare `+` button after the row link so a JS-only control stops taking tab priority on all 50 rows. | B7, B8, B14, B15 |
| N7 | **Copy reframe:** `With Verdicts` → attributed-criticism wording; `Verdict` filter and compare-row labels → `Recorded grade` or similar; `Scholarly Verdicts` → `Attributed assessments`. The lead sentence already makes this distinction; the UI should stop undoing it. **This is copy on a research surface. I will propose exact strings for approval rather than rewriting unilaterally.** | B13 |

---

## 2. Shared component consolidation

| Component | Lives in | Absorbs | Call sites to repoint |
|---|---|---|---|
| `.hc-stat-band` / `.hc-stat` | `global.css` (exists) | `.register-stat-band`/`.register-stat`, `.rijal-facts` | `narrators/index.astro:159-166`, `narrators/[id].astro:352-357` |
| `.hc-back-link` | `global.css` (exists) | `.rijal-back`, `.compare-crumb a` | `narrators/[id].astro:335`, `narrators/compare.astro:91` |
| `.hc-searchbar` | `global.css` (exists) | `.register-search`/`__input`/`__clear` | `narrators/index.astro:168-180` |
| `.hc-eyebrow` | `global.css` (exists) | `.corpus-eyebrow` (dead) | `hadith/index.astro:227`; **new** on both narrator pages |
| `.hc-section-head` | `global.css` (**new**, S3) | `.corpus-section-head`, `.corpus-results-head`, `.edition-section-head`, `.hadith-panel__head`, `.rijal-section h2` | 5 pages |
| `.hc-back-link--disabled` | `global.css` (**new**, S4) |: | `hadith/[id].astro:334-343` |
| `--hc-danger` | `global.css` (**new** token, S1) |: | 2 in scope, 16 in `src/content/articles/**` fixed for free |
| `--space-*` | `global.css` (**new**, S5) |: | opportunistic only |
| `.hc-title-reveal` | `global.css` (**new**, S6) |: | 4 hero titles |

**Discipline, every time:** Astro scopes page CSS to `[data-astro-cid-*]`, which
outranks unscoped global CSS at equal specificity. So each repoint **deletes the
page-local original in the same commit**. This is already documented in
`global.css` and is now in `DESIGN.md` § Components and § Iteration Guide.

---

## 3. Inspiration pass: what it actually yielded

Time-boxed, and I would rather report it honestly than pad it.

**Figma community categories.** The Figma MCP connector
(`plugin:brand-voice:figma`) is **not authorized in this session**, so I could
not browse the community categories directly. You would need to authorize it via
your claude.ai connector settings for that. What I did instead was check whether
the three ideas those categories would supply are already solved here: and all
three are:

- *Ornamental dividers / illuminated chapter markers*: the site already has one
  ornament vocabulary (`.hc-divider`, a gold `♦` knocked out of a hairline) and
  the edition already has a chapter-mark treatment (`.edition-chapter` with
  paired rules). Adding a second ornament system would dilute, not sharpen.
- *Paper grain / shader texture*: **already implemented natively.**
  `body::before` is a fixed, `soft-light`, `pointer-events: none` two-field
  radial dot texture at `opacity .08` (`.04` light). It is exactly the
  "felt more than seen" treatment, in plain CSS. No change.
- *A coherent icon set*: **deliberately not adding one.** The four page types
  ship **zero** icon SVG; every directional mark is a Unicode arrow, and the only
  SVG in the whole flow is in the header/footer chrome. Bolting Lucide or
  Phosphor onto a manuscript archive would be the regression. The real icon
  finding is smaller and I am fixing it: `↗` (outbound) is used on three internal
  back-links where `←` belongs.

**FigJam / ai-skills categories**: skipped per your instruction, no tool calls
spent.

**react-bits.** No React islands exist, so this is vocabulary only: no
dependency, no CLI. I read the catalogue (`TextAnimations`, `Animations`); most
of it: `BlobCursor`, `GhostCursor`, `GlitchText`, `ParticleText`, `Magnet`,
`ElasticMesh`, `MetaBalls`, `GradientText`: is banned outright by `DESIGN.md`
(cursor followers, bounce/elastic easing, infinite movement, gradient text).
`Noise` is already implemented natively.

**One borrow, reimplemented in vanilla CSS:** the `SplitText` / `MaskedHeading`
line-stagger. It becomes `.hc-title-reveal`: hero title lines fade and rise
~8px, ~90ms apart, on `--motion-base` / `--ease-standard`, pure CSS
`animation-delay`, no JS, no layout shift, and it inherits the global
`prefers-reduced-motion` flattening. One orchestrated entrance per page and
nothing else moves, which is exactly what `DESIGN.md` allows ("short entrances")
and what the anti-pattern list demands (no universal scroll-triggered fade-up).

---

## 4. Order of execution

I am deviating from your default order by inserting **Phase 0** first, and I
think it earns its place: two of the nine criticals (`--hc-danger`, the
`.wrap`/band measure break) and three of the consolidations live in
`global.css` and affect three or four page types each. Doing them first keeps
every subsequent page commit small and stops me fixing the same defect four
times. After Phase 0, your order stands: it is the order a first-time visitor
moves through the site.

| Phase | Scope | Commit |
|---|---|---|
| **0** | Shared layer: S1–S6 in `global.css` only | `fix(design): define danger token and correct stat-band measure` + `feat(design): extract shared section head and title reveal` |
| **1** | Landing / catalogue: A1–A5 | `fix(hadith): repair catalogue kicker, mobile search options, and hero rhythm` |
| **2** | Collection / edition: E1–E5 | `fix(hadith): repair edition position typography and anchor bilingual titles` |
| **3** | Individual hadith: R1–R4 | `refactor(hadith): recompose record head and correct bilingual reading order` |
| **4** | Biographical: N1–N7 | Split into three: `fix(narrators): remove reliability colouring from the register`, `fix(narrators): make register filters work without javascript`, `refactor(narrators): repoint dossier onto the shared component layer` |
| **5** | Close-out: after-audit, `CLAUDE.md`, repoint dangling `design-audit.md` comments | `docs: record design system, audit results, and agent guide` |

Each phase: render dark **and** light at 1440 / 768 / 375, screenshot, diff
against its punch list, re-run `hallmark audit` on just that page, fold findings
back in, then `npm run check && npm run test:design && npm run build` before
moving on.

---

## 5. Data-touching vs presentation

Flagged explicitly, as requested.

### Touches data or queries: needs scrutiny

| # | What | Risk | Handling |
|---|---|---|---|
| N2 | Register filters become real submits; `is-active` derived from parsed params instead of hardcoded | **Medium.** Changes how filter state resolves server-side. No new queries, no schema change: it reads params the page already parses. But it changes form structure, and `narrator-register.ts` must keep working on top. | Verify no-JS and JS paths separately. Confirm `?generation=…&grade=…&century=…&sort=…&page=…` round-trips identically before and after. |
| N4 | Dossier pills become links to register query params | **Low.** Read-only links. But `generation` and `century` are real filters while **`tabaqa` is not**: there is no tabaqa param in `narrators/index.astro`. So tabaqa must become metadata, not a link to a filter that would silently ignore it. | Verified against the existing `where` clause. Only link what actually filters. |
| N7 | Copy changes on a research surface | **Medium: this is content, not chrome.** | Propose exact strings for your approval before writing. Not doing this unilaterally. |

### Pure presentation: no data touched

S1–S6, A1–A5, E1–E5, R1–R4, N1, N3, N5, N6.

Note on N1: removing `gradeTone()` deletes a *presentation* helper only. The
`grade` column, the grade facet query and the `?grade=` filter all stay: the
grade remains searchable, sortable and displayed. What goes is the green/red
valence.

---

## 6. Explicitly out of scope

| Item | Why |
|---|---|
| The `Chapter:` / `Chapter on` prefix in `chapter_en` | Verified against the corpus: 46,570 rows begin `Chapter:`, 59,857 begin `Chapter on`, of 276,347 non-empty. It is inconsistent *source* wording, not a template artifact, and the content-integrity rule forbids editing it. **Separately: a subset carries stray wrapping double quotes: that is an import-pipeline data issue for you, not a design one.** |
| Global `--space-*` migration | The scale gets defined and documented; sweeping ~9,500 lines of CSS onto it is a mechanical change that deserves its own reviewable commit. |
| Reconciling the three content measures (1240 / 1088 / 955px) | Documented as a Known Gap in `DESIGN.md`. Picking one is a section-wide layout decision I would rather put to you than make silently. |
| `src/pages/projects.astro` | It has ~1,000 uncommitted lines from the same in-flight pass but is outside the four page types you scoped. Untouched. |
| Deleting `motion.css` | Its own header says to delete it once no entry point imports both it and `global.css`. `BaseLayout.astro` currently imports both. Removing an import from the global layout is a site-wide change, not a hadith-section one. |
| Swapping Poppins | Hallmark gate 1 names it as a tell. You said the type stack is load-bearing and does not change. Recorded as a standing accepted deviation with reasoning in the audit. |
| `--hc-gold-dim` failing on dark `surface-2`/`-3` (4.24 / 3.93:1) | Only used as a *border* in dark, which is legal at 3:1. Documented as a boundary in `DESIGN.md` so nobody starts using it as text. No live failure. |
| 16 `--hc-danger` call sites in `src/content/articles/**` | Fixed for free by S1, but not otherwise audited: article bodies are outside this scope. |

---

## 7. Close-out deliverables

- `docs/hallmark-audit-after.md`: per-page after-scores against the before
  punch list.
- Measured contrast ratios for every new or changed pair, both themes,
  composited: not eyeballed.
- Consolidation table with every repointed call site.
- **`CLAUDE.md`** at the repo root: framework facts (Astro, no islands, D1 via
  `cloudflare:workers`, `prerender = false` on corpus routes), the
  local-D1-is-populated fact, the validate/check/build commands, the Astro CSS
  scoping trap, the `.wrap` border trap, and a pointer to `DESIGN.md` as the
  visual authority. `AGENTS.md` will point at it.

---

## Two things I want a decision on before Phase 4

Both are in the biographical block and both are judgement calls I would rather
not make for you.

1. **N1 boundary.** I read your non-negotiable as: the *grade term* stays
   (attributed source data, and a working filter facet), the *trust colouring*
   goes. That keeps `Thiqa (Trustworthy)` on the row and in the filter but in
   neutral ink. The stricter reading would remove the grade display entirely and
   leave only the individual attributed critic statements. **Tell me which
   reading you want**. I will implement the first unless you say otherwise.

2. **N7 copy strings.** Retitling `Scholarly Verdicts`, `With Verdicts` and the
   `Verdict` filter label is content on a research surface. I will bring you
   exact proposed strings in Phase 4 rather than rewriting them now.

Everything else in this plan I am confident enough to build as specified.
