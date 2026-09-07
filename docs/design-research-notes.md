# Design research notes

Working reference for HadithCritic's design decisions. Sourced from the Figma
Resource Library "Design basics" library (September 2026), mapped against the
actual state of this codebase.

**How to read this:** each section has (a) takeaways, (b) where this site
actually stands with file-level evidence, (c) action items. `[x]` items are
implemented; `[ ]` items are open. Last worked through September 2026
(typography pass, then the accessibility and consolidation pass).

A general caveat about the source: the Figma library is uneven. Colour theory
and the UI/UX principles articles are solid definitional writing. Typography is
about 75% SEO listicles ("25 best sans serif fonts", "23 best wedding font
pairings"); only four articles in that section are substantive. Web design,
Print design and Brand & Storytelling are almost entirely listicles and
templates. Where the library's advice conflicts with established typographic
practice for long-form reading, this document says so rather than deferring.

---

## 1. UI/UX design principles

Read: *Seven essential UI design principles*, *What is UI design?*, *What is
UX design?*, *What is the difference between UI and UX?*, *Understanding button
states in UI design*.

### Takeaways

- Seven principles: hierarchy, progressive disclosure, consistency, contrast,
  accessibility, proximity, alignment. The framing that matters here is
  hierarchy-as-book-structure — size, weight and spacing should orient a reader
  the way chapter headings do.
- Consistency is argued in cognitive-load terms: an element that differs
  without reason makes the reader stop and ask why. That is the strongest
  argument against per-article style overrides.
- Button states: default, hover, active, focus, disabled, plus loading /
  success / error / selected for complex flows. WCAG 2.2 requires a visible
  focus indicator that is never suppressed without an accessible substitute.
  Text contrast minimum 4.5:1 in *every* state. Tap targets ≥ 44×44px.
  Transitions 100–200ms.
- UI is a subset of UX; information architecture is the UX layer that matters
  most for a reference site.

### Where this site stands

- Hierarchy and alignment are strong. `src/styles/treatise-index.css` organises
  with rules and whitespace rather than containers, and the grid discipline in
  `src/layouts/TreatiseLayout.astro` holds a single reading measure.
- Focus states are now consistent and centralised — see the action items
  below for what the audit actually found (the obvious signal was misleading).
- Transition durations already sit in the 160–200ms band the article
  recommends.
- Tap targets: `.hc-btn` in `src/styles/global.css` sets `min-height: 44px`.
  Every other control has now been measured against the WCAG 2.2 24×24
  minimum; two failures were found and fixed.
- Progressive disclosure is used well on the 99-entry register
  (`src/components/treatise/ScholarLedger.astro` filters + sticky controls)
  rather than paginating.

### Action items

- [x] **Focus ring audited and consolidated.** The raw `:hover` vs
      `:focus-visible` count looked alarming (26 unpaired rules in
      `index.astro` alone) but was a false alarm: `global.css` carries one
      global `:focus-visible` ring. The *real* bug was subtler — Astro scopes
      component styles to `[data-astro-cid-*]`, giving any stray
      `outline: none` higher specificity than a bare `:focus-visible`. Fifteen
      such declarations (mostly on inputs) were silently removing the ring.
      The global rule is now authoritative and customisable via
      `--hc-focus-color` / `--hc-focus-width` / `--hc-focus-offset`;
      `SiteHeader` had a competing duplicate ring, now removed.
- [x] **Tap targets measured** against WCAG 2.2 (2.5.8, 24x24), exempting
      links inline in prose. Two failures fixed: the footnote back-reference
      (13x28 -> 24x24 minimum) and `.article-footer__category` (22px tall).
- [ ] Programmatic `.focus()` does not trigger `:focus-visible`, and keyboard
      events do not reach a hidden browser pane, so the ring could not be
      confirmed interactively — only by static reasoning about the cascade.
      Worth one manual Tab-through.

---

## 2. Typography

Read: *What is typography anatomy?*, *Typography in design*, *What is kerning?*.
Skipped the twelve font-roundup listicles.

### Takeaways

- Anatomy that predicts legibility: **x-height**, **open counters**, and
  **aperture**. The guidance worth keeping: "a tall x-height and open counters
  improve legibility at small sizes — ideal for interfaces or body copy."
- Pairing: "spot visual relationships across typefaces to create intentional
  contrast or cohesion" — compare x-height ratios and terminal shapes.
- Hierarchy comes from size, weight, whitespace, alignment, colour **and**
  typeface variety — six levers, not one.
- Kerning/tracking: small text and uppercase text both need deliberate
  letter-spacing; uppercase pairs with diagonal strokes (A, K, V, W, Y) are the
  usual offenders.

### Two places the source is wrong for this site

1. It recommends a **40–60 character** measure. That figure comes from UI and
   accessibility contexts. For continuous long-form prose the established range
   is 66–75 characters (Bringhurst). This site targets 68–75 and measures
   72ch on treatise pages and 71ch on articles. **Keep the site's target.**
2. It recommends **line-height 1.125–1.20**. That is display/heading advice; at
   body sizes it would be unreadable. This site runs 1.7–1.75 for Latin prose
   and 2.0–2.1 for Arabic. **Keep the site's values.**

### Where this site stands

- Two Latin families: Poppins (`--font-display`, `--font-body`) and
  Glacial Indifference (`--font-ui`, self-hosted woff2, weight-ranged
  400–500 / 600–900), both in `src/styles/global.css`.
- **The flatness problem is real and now measured.** Both are geometric sans.
  An audit of every rule binding `--font-ui` found **35 rules using Glacial at
  ≥0.95rem in sentence case** — the size/case band where it is least
  distinguishable from Poppins. Examples: `.hc-article-body table` (1.06rem),
  `.hc-section-divider__subtitle` (1.06rem), `.marginalia-title` (1.08rem).
  Most of the other 35 are legitimately UI chrome (inputs, buttons, pagination).
- Arabic previously fell to **Noto Naskh Arabic**, reached only as a fallback
  inside `--font-display`/`--font-body`/`--font-ui`. Amiri was named in
  `--font-arabic` but never loaded, so that entry was dead text.
- Type floor of 12px now holds everywhere and is enforced by the build. The
  43 declarations that had survived inside `src/content/articles/**/*.mdx`
  `<style>` blocks are fixed, and the audit script fails on any regression.

### Decisions taken

- **[done] No third Latin family.** Reasoning in the summary below and in
  DESIGN.md. Roles were made categorical instead: Poppins owns everything
  sentence-case and readable; Glacial owns uppercase, letter-spaced apparatus
  at 12–13px. The distinction is now carried by case, tracking, weight and size
  band — signals that survive at small sizes — rather than by letterform
  differences that do not.
- **[done] Amiri for Arabic, Amiri Quran for Qur'anic ayat.** Justified by
  measurement, not preference: Qur'anic text in `src/data/quran-verses.json`
  runs 46% harakat density and carries **441 Qur'an-specific marks**
  (U+06D6–06ED: sajdah, waqf, small high seen) across 400 sampled verses.
  Hadith Arabic in MDX runs 36% harakat density with standard harakat only.
  Amiri Quran exists specifically for the former mark set.
- **[done] Amiri via Google Fonts CDN, not self-hosted.** This departs from the
  Glacial precedent deliberately: Glacial was self-hosted because it is not on
  Google Fonts. Amiri is, and Google serves it with `unicode-range` subsetting
  so browsers fetch only the Arabic block, on a connection already open for
  Poppins. Self-hosting a full Amiri would download more, not less.

### Action items

- [x] Load Amiri + Amiri Quran; retire Noto Naskh Arabic to fallback.
- [x] Raise the 43 sub-12px declarations in MDX to the floor.
- [ ] Review `letter-spacing` on Glacial uppercase labels — currently
      0.08–0.12em, which is in range, but the 12px labels could take slightly
      more.

---

## 3. Colour theory

Read: *What is color theory?*, *Types of color palettes*. Skipped the
primary/secondary/triadic and RGB/CMYK breakdowns — this site runs one accent
against a neutral ground, so colour-model theory adds nothing.

### Takeaways

- Hue / value / saturation as the three properties.
- **Monochromatic**: one base colour worked through tints and shades — "clean,
  minimal, and almost impossible to clash."
- **60-30-10**: dominant 60%, secondary 30%, accent 10%. A discipline for
  keeping an accent an accent.
- Colour supports scanning and navigation; it should carry meaning, not
  decoration.

### Where this site stands

- The palette is already essentially monochromatic-plus-one: warm charcoal
  surfaces (`--hc-surface-0..3`) with a single antique gold accent
  (`--hc-gold` and its bright/soft/dim variants) in `src/styles/global.css`.
  This matches the strongest advice in the section without needing changes.
- Gold is close to the 10% budget and is used functionally — active nav state,
  section numerals, links, verdict values. `DESIGN.md` already forbids
  large-area gold fill.
- Category colours (`--cat-history`, `--cat-prophecies`, `--cat-theology`,
  `--cat-philosophy`) are a second, quieter system. They are used at 12%
  opacity for backgrounds and 30% for borders, so they read as tinting rather
  than as a competing palette.
- Not verified: contrast ratios. `--hc-text-tertiary` (`#8c8a86`) on
  `--hc-surface-0` (`#0f0f10`) is the most likely failure point, and it is used
  for metadata throughout.

### Contrast audit — method and results

Raw token-vs-surface arithmetic is misleading here, because most category
colours are painted as text on their own 12%-opacity tint. The audit therefore
composites the full background stack (including alpha) and evaluates each leaf
text node in the rendered page, applying the large-text exemption (>=24px, or
>=18.66px bold). Elements over a gradient are skipped and checked by hand.

**Dark theme** — three genuine failures, all fixed:

| Element | Was | Cause |
|---|---|---|
| `.verdict-value` (Salafi column) | 3.41:1 | `--cat-prophecies` used directly as text |
| `.ledger-entry__separator` | 3.59:1 | `--hc-rule-strong`, a *border* token, used as text |
| `.filter-tab__count` | 4.20:1 | badge darkened an already mid-tone gold |

`--hc-text-tertiary` passes: 5.56 / 5.39 / 4.89 / 4.54 across the four dark
surfaces. It is marginal on `--hc-surface-3` but compliant.

**Light theme — the real finding.** The block's own comment claimed "every
token is deliberately chosen for WCAG AA contrast." It was not true, and the
theme had **74 failures on a single page**:

| Token | Was | Now |
|---|---|---|
| `--hc-gold` | 3.40:1 | 7.03:1 (`#6f5019`) |
| `--hc-gold-dim` | **2.21:1** | 6.09:1 (`#7a5920`) |
| `--hc-text-tertiary` | 3.47:1 | 6.11:1 (`#635e56`) |

Every light gold step now clears 4.5:1 against all four light surfaces,
including the deepest (`#dfd8cb`) — the previous ramp was only ever checked
against the lightest.

Darkening the light gold then exposed a second, larger bug class: **17 rules
painted hardcoded near-black text on a themed gold fill**
(`color: #0c0c0d`, `var(--hc-fixed-black)`). That worked only while gold was
light. All now use `--hc-text-inverse`, which flips with the theme.

Result: **0 contrast failures in both themes** across `/`, `/blogs`,
`/narrators`, the shirk-endorsed hub, a treatise chapter, and an article.

### Action items

- [x] Tertiary token audited on all four surfaces, both themes.
- [x] Category tokens: `--cat-*-text` variants added for both themes; the base
      `--cat-*` values are fill/border only. Documented in DESIGN.md.
- [ ] `/youtube` uses `oklch()` colours, which the audit script cannot parse —
      its 23 reported failures are false positives. Re-check that page with an
      oklch-aware tool.

---

## 4. Prototype & wireframe

Light pass. Section is mostly tool tutorials and prototyping-fidelity
explainers. Relevant: *What is wireframing?*, *What is a user flow?*

### Takeaways

- Wireframing is structure-before-surface; user flows map how someone moves
  between states.

### Where this site stands

Largely not applicable — this is a published site, not a product in design.
The one transferable idea is user flow: the previous pass fixed a real flow
break where `ledger.astro` dropped the chapter sidebar, stranding readers on a
99-entry register with no way back into the monograph. That was a user-flow
bug found by reading the code, not by wireframing.

### Action items

- [x] **`/blogs` entry flow traced.** A reader is never stranded: the sticky
      header carries `/blogs` at y=14 on every article, and the footer adds
      "Back to All Studies". But a 26,000px article (29 viewports) had no
      back-to-top, where treatise pages do — the shared `BackToTop` component
      is now mounted on article pages too. The category chip in the article
      hero was a `<span>`: decorative, which the house rules forbid. `/blogs`
      already reads `?category=` on load, so it is now a link into the
      filtered index.

---

## 5. Web design

Light pass. Section is 14 listicles and 2 substantive articles. Read:
*Responsive website design*.

### Takeaways

- Fluid grids with relative units, `max-width: 100%` on media, mobile-first,
  breakpoints at real content-driven widths.
- Recommends `clamp()` for fluid typography — "sets a minimum and maximum font
  size range to ensure readability across different screen sizes."

### Where this site stands

- Already fully on this pattern. `clamp()` is used throughout for both type and
  spacing; `--pad`, `--section-y` and `--wrap` are all fluid.
- `src/styles/article.css` sets `img { max-width: 100% }` and wide tables scroll
  inside their own container rather than breaking the page.
- Breakpoints (1040px, 1024px, 900px, 780px, 700px, 640px, 480px) are numerous
  and were chosen per-component rather than from a shared scale. Not wrong, but
  undocumented.

### Action items

- [x] **Breakpoints documented** in DESIGN.md. The codebase uses ~20 distinct
      values; `max-width: 640px` dominates (23 uses), then 900, 760, 700, 600,
      1024, 1200, 480. The canonical scale is now 480 / 640 / 768 / 1024 /
      1200, with 1039–1040 recorded as a deliberate exception (where a 245px
      sidebar plus an 810px measure stops fitting). Existing strays are
      documented as drift to migrate on next touch, not mass-rewritten.

---

## 6. Print design

Light pass. Section is entirely flyers, brochures and thank-you cards — no
editorial-layout or grid articles. Nothing of substance transfers.

The one idea worth carrying across is generic and predates the source: print
hierarchy is built from margin, measure and leading rather than from rules and
boxes. This site already works that way — `DESIGN.md` states "fine rules and
underlines outrank large containers," and the treatise index implements it.

### Action items

None. Do not spend further budget on this section.

---

## 7. Brand & storytelling

Light pass. Read: *What is a style guide and how to create one?*

### Takeaways

- A style guide documents: brand foundation, visual identity (typography,
  sizing scales, hierarchy rules, colour in multiple formats), voice, and
  component usage with dos and don'ts.
- Should be revisited every 6–12 months and kept somewhere teams actually read.

### Where this site stands

- `DESIGN.md` is a genuine style guide and unusually disciplined — it states
  design dials numerically, and its "Avoid" list (startup language, futuristic
  AI visuals, decorative dashboards, generic card grids) is enforced in code by
  `scripts/design-audit.mjs`. That script is the strongest asset here: it fails
  the build on nested `<main>`, placeholder `href="#"`, images without alt, and
  non-semantic clickables.
- `src/pages/brand.astro` renders the tokens as a live page, which is better
  than a static document because it cannot drift silently.
- Weakness: DESIGN.md drifted from the implementation twice in two sessions
  (it described a serif hierarchy after serifs were removed, and described
  "a dedicated Arabic face" without naming it). Both are now corrected.

### Action items

- [x] **Type floor is now enforced.** `scripts/design-audit.mjs` walks MDX as
      well as `.astro`/`.css` (81 -> 155 files) and *fails the build* on any
      `font-size` below 12px, in both longhand and the `font:` shorthand. It
      passes clean, so the floor genuinely holds.
- [x] **Role split is now checked.** The script warns when `--font-ui` is used
      at >=0.95rem without `text-transform: uppercase`. It surfaced 25 sites;
      most are legitimate chrome (inputs, buttons, pagination), and two were
      genuine content misuse (`.hc-small`, `.filter-empty-state p`), now moved
      to Poppins. Left as a warning rather than an error because form controls
      legitimately sit in that band.
