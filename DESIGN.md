# HadithCritic Design System

> Single locked reference for this site's visual system. Sourced from
> `src/styles/global.css`, `article.css`, `footer.css` and `treatise-index.css`.
> Every token name below is real and greppable. If a value here disagrees with
> `global.css`, `global.css` wins and this file is stale: fix it.
>
> Schema follows [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
> Format only. No palette, type pairing or layout idea is borrowed from that repo.

## Overview

HadithCritic is an independent digital scholarly publication and research
archive. It presents evidence-led studies of hadith transmission, early Islamic
history and source criticism, together with a 276,347-narration corpus and a
20,950-entry rijāl register.

The surface is a **dark manuscript archive**: tinted-black ground, antique gold
as the only accent, parchment and umber text tiers, Naskh Arabic set against
geometric Latin. Homepage is an editorial front page; archives are ledgers;
articles and corpus records are critical editions. It should feel like a
carefully typeset critical edition, calm enough for sustained reading, exact
enough to cite.

- **Audience:** researchers, students, careful readers, source critics.
- **Tone:** exact, calm, independent, critical.
- **Register:** brand.
- **Anti-references:** AI-startup styling, SaaS dashboards, glassmorphism,
  nested card grids, agency animation, developer-tool visual language,
  futuristic-AI visuals, decorative dashboards, generic card grids.

### Dials

| Dial | Value | Meaning here |
|---|---|---|
| Design variance | 6 / 10 | Offset, not symmetric. Asymmetric hero splits and ledger rows, never artsy chaos. |
| Motion intensity | 4 / 10 | Fluid CSS only. Transitions on `transform`/`opacity`/`background-size`. No scroll choreography. |
| Visual density | 4 / 10 | Airy prose, dense ledgers. The catalogue and register run denser (5–6); the sequential reader and article body run airier (3–4). |

Per page type, calibrate away from the section default rather than applying one
setting everywhere:

| Page type | Variance | Motion | Density | Reads like |
|---|---|---|---|---|
| Corpus catalogue `/hadith` | 6 | 3 | 6 | A reference catalogue. Ledger-dense, scannable. |
| Collection edition `/hadith/collection/:slug` | 5 | 3 | 4 | A sequential reader. Slow, generous, one report at a time. |
| Hadith record `/hadith/:id` | 5 | 2 | 5 | A critical edition. Facing columns and apparatus. |
| Rijāl register `/narrators` | 5 | 3 | 6 | A faceted index. |
| Rijāl dossier `/narrators/:id` | 4 | 2 | 5 | An encyclopedia entry. Sectioned, citable, evidence-forward. |

### The one non-negotiable of content

**No authenticity grading is ever displayed or implied: anywhere, including
biographical pages.** No reliability score, no star rating, no ṣaḥīḥ/ḍaʿīf
badge, and no colour that does evaluative work the copy disclaims. Classical
grades and jarḥ/taʿdīl statements are shown as **attributed source data in
neutral apparatus ink**, never as a traffic light. The site's premise is
presenting evidence without a verdict; the visual layer must not smuggle one in.

---

## Colors

Two themes. Dark is the default and is defined by bare `:root`;
`[data-theme="light"]` is the sole override block on the site. Theme is set by
an inline script in `BaseLayout.astro` before paint, from `localStorage.theme`
falling back to `prefers-color-scheme`.

### Fixed tones

Never change across themes. Used where a value must stay dark or stay parchment
regardless of theme, i.e. inside umber cards, context notes, and the parchment card.

`--hc-fixed-black #0f0f10` · `--hc-fixed-black-soft #141312` ·
`--hc-fixed-charcoal #1e1d1b` · `--hc-fixed-charcoal-2 #26231f` ·
`--hc-fixed-parchment #f2ebdc` · `--hc-fixed-parchment-deep #e5d7bd` ·
`--hc-fixed-parchment-ink #1a1715` · `--hc-fixed-muted #b8ad99` ·
`--hc-fixed-ash #8c8a86`

### Surface

Four levels, warm-tinted in both themes. Never pure black, never pure white.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--hc-surface-0` | `#0f0f10` | `#fbf9f4` | Page ground |
| `--hc-surface-1` | `#141312` | `#f2ece0` | Panels, nav |
| `--hc-surface-2` | `#1e1d1b` | `#e8e2d5` | Elevated blocks |
| `--hc-surface-3` | `#26231f` | `#dfd8cb` | Cards, input wells, borders |

`body` is not a flat fill: two low-opacity radial blooms (gold at 75% 10%, umber
at 10% 20%) over a 135° `surface-0 → surface-2 → surface-0` gradient.

### Text

| Token | Dark | Light | Use |
|---|---|---|---|
| `--hc-text-primary` | `#f2ebdc` | `#2b2824` | Headings, body |
| `--hc-text-secondary` | `#b8ad99` | `#6b635a` | Captions, lede, meta |
| `--hc-text-tertiary` | `#8c8a86` | `#635e56` | Labels, placeholders. **The dimmest legible text token.** |
| `--hc-text-inverse` | `#0f0f10` | `#fbf9f4` | Text on gold / accent fills |

### Accent: antique gold

Gold signals hierarchy, active state and division. **Never large-area fill.**
Accent footprint stays under ~5% of any viewport.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--hc-gold` | `#d8b166` | `#6f5019` | Links, kickers, active state, focus ring |
| `--hc-gold-bright` | `#e8c878` | `#63440f` | Hover |
| `--hc-gold-soft` | `#e2c783` | `#795820` | Selection, button gradient stop |
| `--hc-gold-dim` | `#9d7a3c` | `#7a5920` | **Borders only in dark theme**: see contrast note |

The light ramp is deliberately much deeper and less saturated. The previous
light ramp sat at 3.40:1 (`--hc-gold`) and 2.21:1 (`--hc-gold-dim`) on paper and
failed every gold link and section numeral in light mode.

### Secondary hues

`--hc-umber #a46a3f` / light `#8a4c27` is the second archive tone; carries
context notes and umber directory cards.
`--hc-prophecy #7b2d24` / light `#a84b3e` is sparse. Red is never the dominant
brand accent.

### Categories

Four article-taxonomy hues, tuned for **12% fills and 30% borders**:
`--cat-history` `#b88a64`, `--cat-prophecies` `#a84b3e`,
`--cat-theology` `#6a8c74`, `--cat-philosophy` `#6e7e9e`,
each with a matching `-bg` and `-border`.

**Only the `--cat-*-text` variants may be used as a `color`.** Used raw as text
the red drops to 3.4:1. Text-safe dark: `#c99a72` / `#c8705f` / `#7fa389` /
`#8595b5`. Light theme redefines all four; without the override the dark
variants leak into light mode and fail.

**The `--cat-*` hues do not carry evaluative meaning.** They are taxonomy
colours for article categories. Do not repurpose green/red as trust/weakness
signals on narrator or hadith material (see the content non-negotiable above).

### Status

`--hc-success` `#81c784` / light `#2e6b2e` · `--hc-error` `#e57373` / light
`#b71c1c`. Per-theme audited: the dark green is 1.71:1 and the dark red 2.54:1
on paper, so light needs its own values.

`--hc-danger` is a **known gap**: 18 call sites reference it, none define it.
See Known Gaps.

### Rules and dividers

`--hc-rule` `rgba(216,177,102,.32)` · `--hc-rule-soft` `rgba(242,235,220,.14)` ·
`--hc-rule-strong` `rgba(216,177,102,.55)`. Light theme rebases all three on
umber at lower alpha.

**Rule tokens are for borders. They are not text colours.**

### Highlight and selection

`--hc-highlight` = gold at 26% (dark) / 18% (light) is the wash behind `<mark>`
search hits. `::selection` is `--hc-gold-soft` with `--hc-text-inverse`.

### Contrast contract

All text meets **WCAG 2.2 AA**: 4.5:1 body, 3:1 for large (≥24px, or ≥18.66px
bold). Verified by compositing the full background stack, including
semi-transparent tints, not by comparing raw tokens.

Verified boundaries (recompute with `scripts/` helpers after any token change):

- `--hc-text-tertiary` clears 4.5:1 on all four surfaces in both themes
  (worst case 4.54:1, light on `surface-3`).
- `--hc-text-secondary` light is **4.17:1 on `surface-3`**: below the floor.
  `surface-3` is a border/input token in light and is not used as a text ground;
  do not start using it as one without re-picking the token.
- `--hc-gold-dim` dark is **4.24:1 on `surface-2`** and **3.93:1 on
  `surface-3`**. It is a border token in dark. Do not use it as a `color` on
  elevated surfaces.

---

## Typography

Three faces, each with one job. The roles are **categorical, not stylistic**: a
reader should be able to tell which face they are looking at from case and
tracking alone, without comparing letterforms.

### Font family

- **`--font-display` / `--font-body`. Poppins** (`"Poppins", "Amiri", "Segoe UI", sans-serif`).
  Carries everything meant to be *read*: titles, prose, tables, captions,
  pull-quote attributions, and all numerals in stat bands. Sentence case.
  Weights 400–600. **Never letterspaced.**
- **`--font-ui`. Glacial Indifference** (self-hosted, SIL OFL; only Regular and
  Bold ship, so 400–500 maps to Regular and 600–900 to Bold: no faux bold).
  Carries **the apparatus and nothing else**: nav, breadcrumbs, metadata lines,
  filter tabs, buttons, form controls, stat labels. Uppercase, letterspaced
  0.08–0.12em, weights 600–700, 12–13px.
- **`--font-arabic`. Amiri** (`"Amiri", "Noto Naskh Arabic", "Scheherazade New", serif`).
  All Arabic script.
- **`--font-quran`. Amiri Quran.** Qurʾānic ayāt specifically, because it
  supports the U+06D6–06ED mark set (sajdah, waqf, small high seen) that general
  Arabic faces render poorly.

The Latin faces list Amiri after themselves so an Arabic run inside an otherwise
Latin string resolves to the Arabic face rather than a system fallback.

Because the two Latin faces are both geometric sans, hierarchy between them
rests on **case, tracking, weight and size band**: not on serif/sans contrast.
The genuine typographic contrast on the page is Latin against Arabic, which is
where this material needs it.

### Hierarchy

| Token / class | Size | Face | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `.hc-title--xl` | `clamp(2.98rem, 7vw, 5.1rem)` | display | 500 | −0.035em | Page hero |
| `.hc-title--lg` | `clamp(2.55rem, 6vw, 4.93rem)` | display | 500 | −0.035em | Major section |
| `.hc-title--md` | `clamp(1.91rem, 4vw, 3.4rem)` | display | 500 | −0.035em | Section |
| Section head `h2` | `clamp(1.8rem, 3vw, 2.55rem)` | display | 500 | −0.03em | In-page section |
| `body` | `clamp(1.03rem, .25vw + 1rem, 1.13rem)` | body | 400 |: | Running text, 1.72 leading |
| `.hc-copy` | `clamp(1.03rem, .5vw + .96rem, 1.22rem)` | body | 400 |: | Lede |
| `.hc-small` | `0.96rem` | body | 400 |: | Fine print |
| `.hc-eyebrow` / `.hc-label` | `0.81rem` | ui | 600 | 0.15em, upper | Kicker, breadcrumb |
| `.hc-stat__num` | `clamp(1.3rem, 2vw, 1.75rem)` | body | 500 | −0.02em | Stat value, tabular |
| `.hc-stat__label` | `0.75rem` | ui | 600 | 0.10em, upper | Stat label |
| `--text-arabic` | `clamp(1.15rem, .35vw + 1.08rem, 1.3rem)` | arabic | 400 |: | Arabic body |

### Principles

- **12px floor.** No body or label text below 12px anywhere, MDX `<style>`
  blocks included. Uppercase micro-labels sit at 12–13px.
- **Prose measure 68–75ch**, 1.7–1.75 leading. Never above 75ch.
- **Arabic runs at `--leading-arabic` (2.05)**, never at Latin leading. Amiri
  sits small on the em and its ḥarakāt occupy the space above and below the
  baseline that Latin leading would absorb.
- **Every Arabic run must carry `lang="ar"`.** The global rule keys off it.
  Unmarked Arabic falls through to a Latin face and loses its shaping.
- An inline Arabic run inside a Latin sentence must not flip the paragraph's
  alignment or become a block: `span[lang="ar"]` stays `display: inline`.
- Metadata is compact and restrained, never a monospace costume. There is no
  mono face on this site.
- **Headings are roman.** No italic display type, and in particular no single
  italicised emphasis word inside an upright headline. Carry emphasis with
  `--hc-gold` and weight.
- Numerals in any column context carry `font-variant-numeric: lining-nums
  tabular-nums`.

### The button exception

`.hc-btn` and its variants sit in Glacial at ~15px, weight 500, light tracking,
**sentence case**: not the 12–13px uppercase apparatus treatment. A call to
action is a tap target before it is apparatus, and uppercasing it at 13px costs
more in legibility on a phone than the face contrast buys back. Buttons keep the
apparatus *face*, not its size and case. **Nothing else may borrow this
exception.**

### Enforcement

`scripts/design-audit.mjs` runs in `npm run validate` and fails the build on:
any `font-size` below 12px under `src/` (MDX `<style>` included); any
component-level `outline: none` (the focus ring is owned globally). It warns on
`--font-ui` at ≥0.95rem without `text-transform: uppercase`, skipping selectors
that name a button.

---

## Layout

### Spacing

There is **no named spacing scale yet** (see Known Gaps). Current values are ad
hoc rem literals. The rhythm tokens that do exist:

| Token | Value | Use |
|---|---|---|
| `--pad` | `clamp(1.2rem, 4vw, 2.5rem)`, `1rem` ≤640px | Container inline padding |
| `--section-y` | `clamp(2.5rem, 5vw, 4.5rem)` | Section block padding |
| `--section-y-hero` | `clamp(3.5rem, 7vw, 6rem)` | Hero block padding |

Hero padding is **bottom-heavy**: block-end ≥ 1.3 × block-start, so the hero
sits into the next section's rhythm instead of floating above it.

Sections do not all share one rhythm. Tighten the instrument sections; open the
reading sections.

### Grid and container

| Token | Value | Use |
|---|---|---|
| `--wrap` | `1240px` | `.wrap` / `.hc-container` |
| `--wrap-reading` | `780px` | `.hc-reading`: long-form prose |

`.wrap` is `width: min(100% - (--pad * 2), --wrap)` **plus** an inner
`padding-inline: max(--pad, --sal)` for notched devices. That padding is *inside*
the border box.

**Consequence, and the rule that follows from it:** never put a
border-drawing class on the same element as `.wrap`. `class="wrap hc-stat-band"`
draws the band's rules on the padding box, overhanging the text column by
`--pad` on each side. Nest instead: `<div class="wrap"><div class="hc-stat-band">`.

### Bilingual reading order (hard rule)

**English precedes Arabic in the DOM.** On wide screens English sits visual-left
and Arabic visual-right; below 780px both collapse to **Arabic first**. This is
achieved with explicit `grid-column` / `grid-row` on the two columns, never by
reordering the DOM:

```css
.x__col--en { grid-column: 1; grid-row: 1; }
.x__col--ar { grid-column: 2; grid-row: 1; }
@media (max-width: 780px) {
  .x__cols   { grid-template-columns: 1fr; }
  .x__col--ar { grid-column: 1; grid-row: 1; }
  .x__col--en { grid-column: 1; grid-row: 2; }
}
```

DOM order is what screen readers and keyboards follow; the grid handles the
picture. Getting this backwards is invisible in a screenshot and wrong for
every assistive-technology user.

### Whitespace philosophy

Fine rules and underlines outrank large containers. A hairline between two
ledger rows does more work than a border around each. Reach for a container only
when the content is genuinely a distinct object: a parchment card, a context
note: not to group things that a rule already groups.

---

## Elevation & Depth

This site is nearly flat. Elevation is carried by **surface level and hairline**,
not by shadow.

| Level | Treatment | Use |
|---|---|---|
| 0 | `--hc-surface-0` + body gradient | Page ground |
| 1 | `--hc-surface-1`, `1px --hc-rule` | Panels, sticky header, nav |
| 2 | `--hc-surface-2` | Elevated blocks, details bodies |
| 3 | `--hc-surface-3` gradient + `--hc-rule`, plus `.hc-card::before` inset hairline at 10px | Cards |
| Overlay | `--shadow` `0 30px 100px rgba(0,0,0,.42)` (light: `0 12px 24px rgba(43,40,36,.08)`) | Dialogs, mobile nav |

`--hc-header-shadow` `0 12px 40px rgba(0,0,0,.35)` is the only shadow on a
non-overlay element.

**No shadow-glow on dark.** A coloured halo around a card on the dark ground is
a named AI tell and is banned. Depth comes from the inset hairline.

### Paper grain

`body::before` is a fixed, `pointer-events: none`, `mix-blend-mode: soft-light`
layer of two radial dot fields (180px and 260px tiles) at `opacity .08`
(light: `.04`), tinted by `--hc-noise` / `--hc-noise-dim`. It is meant to be
felt, not seen. Do not raise the opacity; do not add a second grain layer.

### Decorative imagery

A decorative image that has to blend into the page gets its **own absolutely
positioned layer with a `mask-image` fade on every edge it meets**. Do not stack
it as a `background-image` behind gradient layers: background layers cannot be
masked independently, so a `contain`-sized image ends on a hard line no scrim can
hide. Masking also removes any dependence on the image's own letterbox colour
matching the surface token: `asset1.webp` letterboxes to a warm `rgb(12,12,10)`
against a cool `rgb(15,15,16)` ground, and its light counterpart is off by
`(4,13,25)`.

---

## Shapes

### Border radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 2px | Buttons, cards, panels: the default |
| `--radius-sm` | 4px | Inputs, small chips |
| `--radius-md` | 8px | Rare; nothing in the corpus section |
| `--radius-lg` | 12px | Reserved |
| `--radius-pill` | 999px | **Chips and pills only** |

Corners are square or minimally rounded. `design-audit.mjs` warns on large radii
outside allowed components.

### Pills

Pills are reserved for **filters, categories and statuses, and every pill must
do something**. A pill that is not a control or a link is decoration and does
not belong. If a value is worth showing but is not actionable, it is a ruled
metadata row, not a pill.

### Ornament

`.hc-divider` / `.ornamental-divider`: a 1px `--hc-rule` with a centred `♦` in
gold on a `--hc-surface-0` knockout. This is the section's only ornament
vocabulary. Do not introduce a second.

---

## Components

Everything in this section is **unscoped global CSS** in `global.css`. Astro
scopes component styles to `[data-astro-cid-*]`, which outranks these rules at
equal specificity: so **after repointing a call site, its page-local original
MUST be deleted in the same commit**, or the leftover scoped copy silently wins.

### `.hc-stat-band` / `.hc-stat`

The ledger stat row. Grid of `--stat-cols` (default 4; `--3`/`--4`/`--5`
modifiers). Top and bottom `--hc-rule`; a `--hc-rule-soft` hairline before every
cell but the first, drawn as `::before` so it does not add width. Value in body
face at `clamp(1.3rem, 2vw, 1.75rem)` tabular; label in ui face 12px uppercase
tertiary. Wraps to two columns below 900px, where the first cell of each row
drops its hairline and wrapped rows pick up a top rule.

Modifiers: `--display` sets the value in display face at a smaller clamp (for a
worded value like "Not stored"); `--quiet` demotes the value to secondary ink.

Replaced four page-local copies. **Never combine with `.wrap`** (see Grid).

### `.hc-back-link`

`display: inline-flex`, 44px min-height (WCAG 2.2 §2.5.8), ui face 0.8rem/600,
gold, gap 0.4rem. Hover recolours to `--hc-gold-bright` **and widens the gap to
0.6rem**: the gap-shift is the site's arrow-motion vocabulary. `--ruled`
modifier adds a `--hc-rule-strong` underline. Back links take `←`; forward links
take `→`; `↗` is reserved for genuinely outbound destinations.

### `.hc-searchbar`

Flex row: `.hc-searchbar__input` (flex 1, 3.25rem min-height) +
`.hc-searchbar__submit` (ui face, gold, left hairline). `:focus-within` lifts the
border to `--hc-gold` and the fill to 82% `--hc-surface-1`.
`.hc-searchbar__options` is the wrapped row of scope selects and
`.hc-searchbar__phrase` checkbox beneath it.

**Form semantics are load-bearing:** `method="get"`, real inputs, hidden
param passthrough. The no-JS guarantee is preserved by construction, not by
script.

### `.hc-ulink`

Animated underline for links that would otherwise only recolour. A
`linear-gradient(currentColor, currentColor)` background grown from `0% 1px` to
`100% 1px` on hover, over `--motion-base`/`--ease-standard`. Reduced motion
pins it at 0%.

### `.hc-btn` / `.hc-btn--ghost`

44px min-height, `--radius-xs`, gold gradient fill with `--hc-text-inverse`
label. A single skewed `::before` sheen sweeps on hover (`shine`, 0.65s). Ghost
is transparent with a `--hc-rule` border and gold label.

### `.hc-card`, `.hc-card--parchment`, `.hc-context-note`

Bordered blocks with a second inset hairline (`::before` at 10px / `::after` at
6px dashed for the context note). Parchment and umber variants carry
`--hc-fixed-*` ink so they read correctly in both themes.

### `.hc-chip`

The pill. 32px min-height, `--radius-pill`, coloured by the `--cat-*` custom
properties inherited from a `[data-category]` ancestor.

### Row hover

`.book-row__link`, `.corpus-result__link`, `.edition-report__link`,
`.contents-row`, `.dossier-entry` share one hover: an `inset 2px 0 0
--hc-gold-dim` box-shadow plus a short gold wash and a small inline padding
shift. **State is carried by shape, not colour alone** (WCAG 1.4.1-adjacent).

### `.hc-skip-link`

Off-screen until `:focus-visible`, then slides to the top edge. Targets
`main#main-content`. WCAG 2.4.1.

---

## Motion & Interaction

### Tokens

`--motion-fast 160ms` · `--motion-base 260ms` · `--motion-slow 520ms` ·
`--ease-standard cubic-bezier(.22,1,.36,1)` ·
`--ease-emphasis cubic-bezier(.16,1,.3,1)` · `--ease` (legacy alias of emphasis).

All live in `global.css :root`. `motion.css` retains only the global
`prefers-reduced-motion` block; its token block was dead code and was removed.

### Allowed

Short entrances, rule drawing, list reveal, scrollspy, progress, small arrow
shifts, gap shifts, subtle desktop parallax.

### Disallowed

Bounce, elastic and overshoot easing on UI state changes; infinite movement;
cursor followers; scroll hijacking; autoplay media; `transition: all`; uniform
`hover:scale`; more than one hover effect on one element; animating `width`,
`height`, `top`, `left`, `margin` or `padding`; focus rings that fade in.

### Reduced motion

`global.css` flattens every animation and transition to 0.001ms under
`prefers-reduced-motion: reduce`. Components that add a bespoke transition should
still name themselves in a local reduced-motion block, because a scoped
`transition` shorthand can otherwise outlive the global flattening on
re-declaration.

### Focus

**The ring is defined once, globally**, as `:focus-visible` in `global.css`, with
`!important` on both `outline` and `outline-offset`. This is deliberate: Astro
scopes component styles to `[data-astro-cid-*]`, which outranks a bare
`:focus-visible`, so a stray `outline: none` in a component used to silently
remove the ring site-wide.

**Components must not re-declare `outline`.** To restyle the ring, set
`--hc-focus-color`, `--hc-focus-width` or `--hc-focus-offset` on the component.
`design-audit.mjs` fails the build on any component-level `outline: none`.

### No-JS guarantee

The site stays usable with JavaScript off. Any new interaction needs a working
no-JS fallback (native `<details>`, a real `<form method="get">`, real anchors)
**before** reaching for client script. Filters synchronise with URLs; content
remains visible without JavaScript. A `<button type="button">` that only a module
listens to is not a filter; it is a decoration that happens to be focusable.

---

## Do's and Don'ts

### Do

- Use `--hc-gold` for hierarchy, active state and division: under ~5% of any
  viewport.
- Carry state changes with **shape as well as colour** (hairline, inset shadow,
  gap shift).
- Reach for the shared component layer first: `.hc-stat-band`, `.hc-back-link`,
  `.hc-searchbar`, `.hc-eyebrow`, `.hc-ulink`, `.hc-btn`.
- Delete a page-local original in the same commit that repoints its call site.
- Mark every Arabic run `lang="ar"`, and keep English before Arabic in the DOM.
- Set numerals in tabular figures anywhere they form a column.
- Give every new token a per-theme value and recompute contrast against the
  **composited** background.
- Keep prose between 45 and 75 characters.

### Don't

- Don't display or imply an authenticity grade, a reliability score or a trust
  colour: on any page, for any narrator or report.
- Don't put a border-drawing class on a `.wrap` element.
- Don't use `--hc-rule*` as a text colour, or a raw `--cat-*` hue as a text
  colour.
- Don't use `--hc-gold-dim` as text on `--hc-surface-2`/`-3` in dark theme.
- Don't italicise a heading, or one word inside a heading.
- Don't open a section with an eyebrow unless it is a real breadcrumb or a real
  ordinal. Cap at 1–2 per page.
- Don't ship an inert pill.
- Don't re-declare `outline` in a component.
- Don't reference an undefined custom property with a hardcoded hex fallback.
- Don't hardcode a font stack: `var(--font-ui)`, not `'Glacial Indifference', sans-serif`.
- Don't paraphrase research claims, Arabic, transliteration, citations, titles,
  project names or forthcoming statuses during design work.
- Don't introduce an icon library. The section's directional vocabulary is
  Unicode arrows; the only SVG is in the header and footer chrome.

---

## Responsive Behavior

### Breakpoints

New components should not invent intermediate values. If a layout needs one,
that is usually a sign it should be fluid (`clamp()`, `minmax()`, `flex-wrap`)
rather than switched at a new width.

| Width | Meaning | Key changes |
|---|---|---|
| 480px | Small phone | Fine adjustments only |
| 640px | **Phone: the primary layout switch** | `--pad` → 1rem; container padding → 0.9rem; directory grid → 1 column; searchbar → 3rem; ledger rows drop the trailing arrow |
| 780px | Bilingual switch | Column pairs collapse to one column, **Arabic first**; section heads stack; back links move below their heading |
| 900px | Stat band switch | `.hc-stat-band` → 2 columns; hero grids → 1 column |
| 1024px | Tablet landscape / small laptop |: |
| 1200px | Desktop |: |

One deliberate exception: the treatise layout switches its sidebar grid at
1040px (mirrored at 1039px), because that is where a 245px sidebar plus an 810px
reading measure stops fitting. Anything else outside this table is drift and
should be migrated when the file is next touched.

### Touch targets

44 × 44px minimum on primary navigation controls (WCAG 2.2 §2.5.8); the 24px AA
floor is met everywhere else. `.hc-btn`, `.hc-back-link`, `.mobile-nav-toggle`
and the pager links all declare it explicitly.

### Safe areas

`--sat`/`--sar`/`--sab`/`--sal` map `env(safe-area-inset-*)`. Containers use
`padding-inline: max(--pad, --sal)`; sticky elements offset by
`calc(var(--site-header-height, 72px) + var(--sat))`; the footer pads to
`max(2rem, var(--sab))`.

### Overflow

`html, body { overflow-x: clip }`: `clip`, never `hidden`, so `position:
sticky` and `fixed` descendants survive. Wide article material (tables, code,
diagrams) owns its own `overflow-x: auto` scroll container. No horizontal scroll
between 320px and 1920px.

---

## Iteration Guide

1. **Read this file and `global.css` before changing any UI.** `AGENTS.md`
   requires it.
2. **One component at a time.** Name the token you are consuming, don't invent a
   sibling.
3. **If a value you need doesn't exist as a token, lift it into `global.css`
   with a per-theme value**: then reference it. Never inline a hex.
4. **Check the shared layer before writing a new class.** Stat bands, back
   links, search bars, kickers and animated underlines already exist.
5. **When you repoint a call site to the shared layer, delete the page-local
   original in the same commit.** Astro scoping makes a leftover copy win
   silently.
6. **Recompute contrast for anything new**, in both themes, against the
   composited background: not the raw token.
7. **Verify no-JS before verifying JS.** Disable scripting, load the page,
   confirm filters, search and pagination still work.
8. **Run `npm run check`, `npm run test:design` and `npm run build` before
   finishing.**

---

## Known Gaps

- **`--hc-danger` is referenced but never defined.** 18 call sites (2 in
  `narrators/[id].astro`, 16 in `src/content/articles/**`) fall back to a
  hardcoded hex. The dossier's `#c2593c` fails AA in both themes on every
  surface (worst case 3.10:1). Needs a per-theme definition in `global.css`.
- **No named spacing scale.** Padding, gap and margin are ad hoc rem literals
  across the site. A `--space-*` scale on a 4px base would close it.
- **Three content measures coexist** in the corpus/rijāl section: `--wrap`
  1240px, `.hadith` 68rem, `.rijal-page` ~955px. Not yet reconciled.
- **Input state coverage is partial.** Selects and number inputs generally have
  default + hover + focus but no `:active` or `:disabled` styling.
- **`motion.css` is a stub** kept only for its reduced-motion block; it can be
  deleted once no entry point imports both it and `global.css`.
- **The catalogue's `--display` stat cell states "Not stored / Authenticity
  gradings"**: a deliberate anti-claim, not a metric. Keep it worded, never
  numeric.
