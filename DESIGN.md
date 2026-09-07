# HadithCritic Design System

HadithCritic is a dark scholarly publication and research archive. It combines manuscript and journal cues with modern search, navigation, and data presentation. It is serious, evidentiary, and editorial.

## Design read

- Surface: scholarly publication and research archive
- Audience: readers, researchers, students, and source critics
- Tone: exact, calm, independent, critical
- Avoid: startup language, futuristic AI visuals, decorative dashboards, generic card grids

## Design dials

- Design variance: 6/10
- Motion intensity: 4/10
- Visual density: 4/10

## Color

- Backgrounds use tinted black and warm charcoal, never pure browser black.
- Primary text is parchment or warm off-white.
- Gold signals hierarchy, active state, and division, never large-area fill.
- Red is sparse and never the dominant brand accent.
- No purple-blue AI gradients.

## Typography

Three faces, each with one job. The roles are categorical, not stylistic:
a reader should be able to tell which face they are looking at from case and
tracking alone, without comparing letterforms.

- **Poppins** carries everything meant to be read: titles, prose, tables,
  captions, pull-quote attributions. Sentence case. Weights 400–600. Never
  letterspaced.
- **Glacial Indifference** carries the apparatus and nothing else: nav,
  breadcrumbs, metadata lines, filter tabs, buttons, form controls, stat
  labels. Uppercase, letterspaced 0.08–0.12em, weights 600–700, 12–13px.
  Do not use it sentence-case above 14px — that is the band where it stops
  being distinguishable from Poppins and the page reads flat.
- **Amiri** carries all Arabic script. **Amiri Quran** carries Qur'anic ayat
  specifically, because it supports the U+06D6–06ED mark set (sajdah, waqf,
  small high seen) that general Arabic faces render poorly.

Because the two Latin faces are both geometric sans, hierarchy between them
rests on case, tracking, weight and size band rather than on a serif/sans
contrast. The genuine typographic contrast on the page is Latin against
Arabic, which is where this material needs it.

- Arabic runs at line-height 2.0–2.1, never at Latin leading — harakat occupy
  the space above and below the baseline that Latin leading would absorb.
- Every Arabic run must carry `lang="ar"`; the global rule keys off it.
  Unmarked Arabic falls through to a Latin face and loses its shaping.
- Maximum prose measure is approximately 68–75 characters. Latin prose runs
  1.7–1.75 line-height.
- No body or label text below 12px anywhere, including inside MDX `<style>`
  blocks. Uppercase micro-labels sit at 12–13px.
- Metadata is compact and restrained, never a monospace costume.

The type floor and the Poppins/Glacial role split are both enforced by
`scripts/design-audit.mjs`, which fails the build on any `font-size` below
12px anywhere under `src/` (MDX `<style>` blocks included) and warns when
`--font-ui` is used at ≥0.95rem without `text-transform: uppercase`.

## Shape and layout

- Fine rules and underlines outrank large containers.
- Corners are square or minimally rounded (2–6px).
- Pills are reserved for filters, categories, and statuses, and every pill must
  do something. A pill that is not a control or a link is decoration and does
  not belong.
- Homepage is an editorial front page; archives are ledgers; articles are
  critical editions.
- A decorative image that has to blend into the page gets its own absolutely
  positioned layer with a `mask-image` fade on every edge it meets. Do not
  stack it as a `background-image` behind gradient layers: background layers
  cannot be masked independently, so a `contain`-sized image ends on a hard
  line no scrim can hide. Masking the edges also removes any dependence on the
  image's own letterbox colour matching the surface token — `asset1.webp`
  letterboxes to a warm `rgb(12,12,10)` against a cool `rgb(15,15,16)` ground,
  and its light counterpart is off by `(4,13,25)`.

### Breakpoints

Use this scale. New components should not invent intermediate values; if a
layout needs one, it is usually a sign the component should be fluid instead
(`clamp()`, `minmax()`, `flex-wrap`) rather than switched at a new width.

| Width    | Meaning                                  |
|----------|------------------------------------------|
| 480px    | small phone                              |
| 640px    | phone — the primary layout switch        |
| 768px    | tablet portrait                          |
| 1024px   | tablet landscape / small laptop          |
| 1200px   | desktop                                  |

One deliberate exception: the treatise layout switches its sidebar grid at
1040px (and mirrors it at 1039px), because that is where a 245px sidebar plus
an 810px reading measure stops fitting. Anything else outside the table above
is drift and should be migrated when the file is next touched.

## Motion and interaction

- Motion serves hierarchy, orientation, active state, and reading structure.
- Allowed: short entrances, rule drawing, list reveal, scrollspy, progress, small arrow shifts, and subtle desktop parallax.
- Disallowed: bounce, elastic easing, infinite movement, cursor followers, scroll hijacking, and autoplay media.
- All interactive controls show focus. The ring is defined once, globally, as
  `:focus-visible` in `global.css`. Components must not re-declare `outline` —
  Astro scopes component styles to `[data-astro-cid-*]`, which outranks a bare
  `:focus-visible`, so a stray `outline: none` silently removes the ring. To
  restyle it, set `--hc-focus-color`, `--hc-focus-width` or `--hc-focus-offset`.
- Filters synchronize with URLs; content remains visible without JavaScript.

## Colour and contrast

- All text meets WCAG AA: 4.5:1 for body, 3:1 for large text (≥24px, or ≥18.66px
  bold). Verified by compositing the full background stack, including
  semi-transparent tints, not by comparing raw tokens.
- The `--cat-*` category hues are tuned for 12% fills and 30% borders. Used
  directly as a `color` the red drops to 3.4:1. **Only the `--cat-*-text`
  variants may be used as text colour.**
- Rule tokens (`--hc-rule`, `--hc-rule-strong`) are for borders. They are not
  text colours; `--hc-text-tertiary` is the dimmest legible text token.

## Content integrity

Do not paraphrase research claims, Arabic, transliteration, citations, titles, project names, or forthcoming statuses during design work.
