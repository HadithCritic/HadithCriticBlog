# HadithCritic Design System

## Front-of-house pages (2026-10)

`/blogs/` (and the branch hubs), `/academia/`, `/projects/`, `/youtube/`, `/contact/` and `/brand/` are built from one shared layer, `src/styles/house.css`, taken from the homepage's own parts: the masked engraving on black (`PageHero.astro`), Cormorant section heads with one word in gold (`.hc-head`), category lozenges (`.hc-cat`), open-lozenge figure rows (`.hc-figures`), the ruled filter list (`.hc-filters`), the ruled field (`.hc-field`), alternating grounds (`.hc-band`, `--soft`, `--warm`) and the parchment closing leaf (`.hc-closing`). Shared parts, not shared pages: the heroes take four shapes (engraving at right, centred title page for Academia, the channel masthead for YouTube, the full lockup over the panorama for Brand).

**Deliberate break, recorded:** like the homepage, these pages are plates (`.hc-plate` on the page root) and stay dark in both themes. Every token inside resolves to the dark palette, so contrast is measured once. The databases and the article reader keep the light theme, because a reader may sit in them for an hour.

- **Blog.** The latest study as a parchment leaf with its own contents list (its `##` headings), the three before it, then the whole archive grouped by year beside a sticky column of full-text search, branch filters and order (`src/lib/blog-index.ts`). Every row is `ArchiveEntry.astro`, which the branch hubs and the brand page reuse. Bespoke engravings come from `src/data/blog-artwork.ts`.
- **Academia.** The treatise as an object beside its record, the citation card (all three formats print without script), and the ICMA studies as a monograph series by research family.
- **Projects.** The corpus as a lead instrument, panels that name the places inside each project, the prototype set apart, and an at-a-glance status table. Panels reuse each project's own masthead engraving.
- **YouTube.** The channel masthead, one player beside the record of the video in it, and the catalogue by subject. Tiles are real links to YouTube; script loads them into the player.
- **Contact.** The reasons people write, as a numbered list that sets the form's topic, beside the form as a parchment leaf.
- **Brand.** Demonstrates rather than describes: the mark (`BrandMark.astro`, recoloured never redrawn), live type specimens, palette with contrast computed from the tokens, plates as drawn and as set, live parts, and article excerpts quoted exactly from their studies.

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
serif Latin. Homepage is an editorial front page; archives are ledgers;
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

`body` is a flat `--hc-surface-0`. Until 2026-10-08 it carried two radial
blooms over a 135° gradient and a grain layer; both were removed so every page,
project pages included, sits on one flat ground.

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

`--hc-copper` is the text-safe member of this family; see Status below. Reach
for it rather than `--hc-umber` whenever the value is a `color`.

### Qirāʾāt palette: `qiraat.css`

Used by `/projects/quran/` and `/projects/quran/transmission/`. **One hue per reader; his two transmitters are its deep and light shade.** Ten hues, fixed and identical in both themes, each ink checked at AA against its own ground (`q-nafi` teal, `q-abu_jafar` amber, `q-abu_amr` lapis, `q-yaqub` rust, `q-asim` pine, `q-hamza` oxblood, `q-khalaf_ashir` plum, `q-kisai` olive, `q-ibn_amir` slate, `q-ibn_kathir` rose). Classes `shade-0` and `shade-1` set `--bg` and `--ink`; `.sw` draws a swatch. These hues identify people and carry no evaluative meaning, and a name is always printed beside them. Do not reuse them for anything else on those pages.

### Tafsir palette: `tafsir.css`

Used by `/projects/tafsir/` and its sura pages. **One hue per era, not per book.** The library runs to a hundred or more commentaries across fourteen centuries, which hue cannot tell apart, so a book is told apart by its name and death date and its color says only when its author died. Five eras take the site’s own tones: `era-e1` gold (101 to 300 AH), `era-e2` copper (301 to 600), `era-e3` oxblood (601 to 900), `era-e4` sage (901 to 1300), `era-e5` slate (1301 to the present). `--e-bg`/`--e-ink` set a tag (`.e-tag`, AA at 5.4 to 8.3); `--e-line` is the mid-tone for borders and swatches (`.e-sq`) and holds 3:1 or better on both themes. A commentary row carries its era as a round `.e-sq` dot beside the work's name, never as an edge border. Color is chronological and never evaluative; the name is always printed beside it. `tests/tafsir.test.mjs` fails a century that is in no era.

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

`--hc-danger` `#e2907a` / light `#8f3316` is critical or negative emphasis in
running argument (article callouts, negative claim highlighting), distinct from
`--hc-error`, which is a form-failure state. Clears 6.33:1 minimum on the dark
surfaces and 5.59:1 on the light ones. **Not for narrator criticism**: see the
content non-negotiable above.

`--hc-copper` `#c48b68` / light `#8a4c27` is text-safe copper for article
apparatus (context notes, hadith blocks, the isnad diagram). Distinct from
`--hc-umber`, which is a surface and border tone and only reaches 3.51:1 as
text.

### Rules and dividers

`--hc-rule` `rgba(216,177,102,.32)` · `--hc-rule-soft` `rgba(242,235,220,.14)` ·
`--hc-rule-strong` `rgba(216,177,102,.55)`. Light theme rebases all three on
umber at lower alpha.

**Rule tokens are for borders. They are not text colours.**

### Highlight and selection

`--hc-highlight` = gold at 26% (dark) / 18% (light) is the wash behind `<mark>`
search hits. `::selection` is `--hc-gold-soft` with `--hc-text-inverse`.

### Panel washes: `--hc-scrim`

Articles no longer use this (since 2026-10-06 their figures are drawn by the
shared `.hc-fig` vocabulary with no fills); it remains for the pages that still
inset panels. Long-form articles used to inset their own plates, ledgers and matrices with an alpha
wash over the sheet. Written dark-first as a near-black, the same declaration
composited to grey mud on paper and dropped body text as low as 1.02:1 across
fourteen articles. The text colours were theme-aware all along; only the fill
was not.

`--hc-scrim` and `--hc-scrim-warm` carry that fill across themes. They are **rgb
triplets, not colours**, so the author keeps their own alpha:

```css
background: rgba(var(--hc-scrim), 0.64);        /* neutral wash */
background: rgba(var(--hc-scrim-warm), 0.24);   /* sepia wash   */
```

Dark: `15, 15, 16` / `32, 25, 15`. Light: `242, 236, 223` / `245, 236, 215`.

Never hardcode a near-black fill in article CSS. A raw `rgba(0,0,0,.18)` is the
same bug: it reads as an 18% black veil on paper, which is mid grey.

### Fixed-dark plates: `.hc-plate`

No article uses a plate any more; the front-of-house pages and heroes do. Some
article figures were lamp-lit instruments rather than panels: a night sky
behind a moon diagram, an isnād chart drawn as a dark ledger. They were composed
on black and their own labels are written in fixed parchment and gold, so they
stay dark in both themes.

The failure mode is mixing. A plate whose fill is fixed but whose text reaches
for `--hc-text-primary` prints dark ink on a black ground the moment the reader
switches to paper.

Put `hc-plate` on the element that carries the dark fill. It pins the palette,
surfaces included, so the figure can go on using the ordinary token names and
get the dark-theme values on both themes. On paper it also gets an opaque base,
because these fills are translucent and were written to darken a black sheet;
`rgba(17,17,17,.56)` over parchment is mid grey, not a plate, and gold on mid
grey tops out near 2.6:1 however the gold is tuned. That base is scoped to the
light theme: forcing it in dark mode flattened cards that were meant to sit a
shade below the page.

**Which one do you want?** Look at the text inside. Token text means the author
meant the panel to follow the theme, so use a scrim. Hardcoded light ink means a
fixed instrument, so use a plate.

### Contrast contract

All text meets **WCAG 2.2 AA**: 4.5:1 body, 3:1 for large (≥24px, or ≥18.66px
bold). Verified by compositing the full background stack, including
semi-transparent tints, not by comparing raw tokens.

`scripts/check-contrast.mjs` measures this in a real browser against the
composited ancestor stack, in both themes, and is the tool to run after any
token change. A static pass over the stylesheets is not a substitute: it
reported 113 failures where the browser finds none, because most of them were
light text on a legitimately dark embed.

**The whole site is clean**, including every article body:
`node scripts/check-contrast.mjs --all-articles` reports 0 across 93 routes in
both themes. Keep it there.

Two things the checker learned the hard way, worth knowing before trusting a
number it prints:

- **It evaluates gradient stops**, and fails on the worst point of the range.
  It used to treat any gradient as unmeasurable, which was not conservative but
  blind: `.hc-article` paints a gradient behind every article, so every run
  silently skipped the entire article body and only reported text that happened
  to sit inside an opaque panel.
- **A background layer only counts if it covers the box.** The animated
  underline idiom paints an opaque `linear-gradient(gold, gold)` and confines it
  with `background-size: 100% 1px`; counting that as the ground made every gold
  footer link a 1:1 failure against itself.

Tokens are picked against the worst ground the system actually paints, which is
rarely a flat surface token. Two composites do the real damage:

- A card can carry a category wash over the body gradient and then a chip wash
  over that. On that triple composite the ground reaches `rgb(196,193,171)`,
  well below `--hc-surface-3`. The light text ramp and every `--cat-*-text` are
  measured there.
- Article panels commonly lay a gold radial glow over their fill. On paper that
  glow *darkens* the panel, so gold-on-gold-tinted-paper is the worst case for
  the light gold ramp, not gold on plain parchment.

Standing boundaries:

- `--hc-ash` is the disabled/placeholder tier and is **not safe as content
  text** on paper (2.61:1). Use `--hc-text-secondary` for anything a reader is
  meant to read.
- `--hc-gold-dim` is dual-use: 66 call sites use it as a `color`, about 20 as a
  rule. It is now tuned to clear AA as text, so it may be used as either.

---

## Typography

Four faces, each with one job. The register is a scholarly journal or an
archival institution: **bold editorial typography, never bold geometric
typography**. Authority comes from serif weight, not from a heavy sans.

### Font family

- **`--font-editorial`. Cormorant Garamond** 600–700
  (`"Cormorant Garamond", "Source Serif 4", "Noto Naskh Arabic", "Georgia", serif`).
  Major display only: page and project heroes, homepage section heads,
  `.hc-title`, `.hc-masthead__title`, `.hc-section-head__title`, the wordmark.
  `--font-brand` aliases it. It has a small x-height and thins out below about
  26px, so it is never a default heading token and never set under ~1.4rem.
  Source Serif 4 follows it in the stack because Cormorant lacks the modifier
  letters ʿ and ʾ (U+02BF, U+02BE).
- **`--font-display`. Source Serif 4** 600. Article titles, secondary headings,
  entry and card titles, figures in stat bands.
- **`--font-body` / `--font-critical`. Source Serif 4** 400 (italic available).
  All running text. Self-hosted full-character-set Roman and italic variable
  fonts, weights 200–900, verified for scholarly transliteration (Ḥadīth,
  Muṣannaf, Ṣaḥīḥ, Ṭabarī, Qurʾān, ʿayn/hamza, macrons, combining marks).
- **`--font-ui`. IBM Plex Sans** 500 (400–600 loaded). The apparatus and
  nothing else: nav, breadcrumbs, metadata lines, filter tabs, buttons, form
  controls, stat labels, numerals in apparatus. Uppercase labels track
  0.10–0.14em at 12–13px.
- **`--font-arabic`. Noto Naskh Arabic** 400–700. All Arabic script.
- **`--font-quran`. Amiri Quran.** Qurʾānic ayāt specifically, because it
  supports the U+06D6–06ED mark set (sajdah, waqf, small high seen) that general
  Naskh faces position poorly.

Latin stacks list Noto Naskh Arabic after themselves so an Arabic run inside an
otherwise Latin string resolves to the Arabic face. Cormorant, Plex, Noto Naskh
and Amiri Quran load from Google Fonts (unicode-range subset); Source Serif 4
is self-hosted. Poppins and Glacial Indifference were retired on 2026-10-05.

Serif display wants close to neutral tracking. The −0.035em to −0.065em the
headings carried for the geometric sans packed serifs into each other; display
tracking is now −0.005em to −0.015em.

### Hierarchy

| Token / class | Size | Face | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `.hc-title--xl` | `clamp(2.98rem, 7vw, 5.1rem)` | editorial | 600 | −0.012em | Page hero |
| `.hc-title--lg` | `clamp(2.55rem, 6vw, 4.93rem)` | editorial | 600 | −0.012em | Major section |
| `.hc-title--md` | `clamp(1.91rem, 4vw, 3.4rem)` | editorial | 600 | −0.012em | Section |
| Section head `h2` | `clamp(2rem, 3.2vw, 2.8rem)` | editorial | 600 | −0.01em | In-page section |
| Panel head | `clamp(1.3rem, 2vw, 1.65rem)` | display | 600 | −0.005em | Section inside a record |
| `body` | `clamp(1.03rem, .25vw + 1rem, 1.13rem)` | body | 400 |: | Running text, 1.72 leading |
| `.hc-copy` | `clamp(1.03rem, .5vw + .96rem, 1.22rem)` | body | 400 |: | Lede |
| `.hc-small` | `0.96rem` | body | 400 |: | Fine print |
| `.hc-eyebrow` / `.hc-label` | `0.78rem` | ui | 500 | 0.12em, upper | Kicker, breadcrumb |
| `.hc-stat__num` | `clamp(1.3rem, 2vw, 1.75rem)` | body | 500 | −0.02em | Stat value, tabular |
| `.hc-stat__label` | `0.75rem` | ui | 600 | 0.10em, upper | Stat label |
| `--text-arabic` | `clamp(1.15rem, .35vw + 1.08rem, 1.3rem)` | arabic | 400 |: | Arabic body |

### Principles

- **12px floor.** No body or label text below 12px anywhere, MDX `<style>`
  blocks included. Uppercase micro-labels sit at 12–13px.
- **Prose measure: about 80 characters a line in the article reader** (the
  owner asked for a wider column on 2026-10-06), 68–75 characters elsewhere,
  1.7–1.75 leading. Count characters in the browser, not `ch`: Source Serif 4
  sets oldstyle figures, so its `0` is narrow and `ch` overstates the measure
  by about a quarter.
- **Arabic runs at `--leading-arabic` (2.05)**, never at Latin leading. A Naskh face
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

### Article reader

Redesigned again 2026-10-06, as a whole system rather than per article. An
article is set like a journal: one reading column, a title page, prose as
ruled text and every component as a plate. `src/styles/article.css` carries the
page and the prose, `src/styles/article-plates.css` the components; components
emit plain class names and carry no styles of their own (except the isnad
figures, which draw SVG).

**Palette.** The reader defines its own ramp on `.hc-article` (`--r-ink`,
`--r-ink-2`, `--r-ink-3`, `--r-accent`, `--r-rule`, `--r-rule-strong`,
`--r-rule-accent`, the five `--r-mark-*` hues) for both themes, and re-points
the site tokens (`--hc-text-*`, `--hc-gold*`, `--hc-rule*`) to it, so any
component inside an article inherits one palette. Measured on the page ground:
ink 14.7:1 dark and 15.6:1 light, ink-2 8.6 / 8.7, ink-3 5.8 / 5.8, accent
8.9 / 6.2. The accent is reserved for the branch kicker, note labels, reference
numerals and link underlines; links are body ink with an accent underline.

**Page.** One column, `--measure: 44.5rem` (about 82 characters a line at
19px; 41rem until 2026-10-06). At 1200px and wider the contents sit in a sticky
margin to the left, aligned with the title leaf's left edge, with the column
centred; below that they are a closed native disclosure under the header.

**Title leaf.** The opening is a leaf across the top of the page
(`--page-wide: 1240px`), above the column and its margin, built in
`ArticleHeader.astro`: meta line (branch behind a lozenge in its own ink, date,
reading time, author), the title in Cormorant, the standfirst, and the folio
with a short rule; the artwork on the right. Dark theme: a dark plate with a
gold double rule and corner ticks, the artwork framed inside it. Light theme:
the parchment leaf of the homepage's featured study, where an editorial
engraving (`blogArtwork`) fades into the paper and an older 16:9 thumbnail
stays framed. Its inks are fixed per theme (`--leaf-*`) rather than read from
the reader ramp. Every rule is scoped to `.hc-article`, because article.css is
global and house.css owns `.hc-head` for the homepage-style section heads. No progress bar, toolbar,
breadcrumb strip, reading settings, back-to-top or floating control. The
footnote preview dialog is rendered inside `.hc-article` so it reads the
palette.

**Type.** Source Serif 4 at 17/18/19px (phones, 720px, 1200px), 1.68 to 1.7
leading, oldstyle figures in prose, hyphenation on phones only. Title and `h2`
in Cormorant 600; `h3` in Source Serif 600; `h4` in Source Serif italic.
Editorial labels (branch kicker, contents, note labels, citations, table heads,
figure labels) are Source Serif in real small caps (`font-variant-caps:
small-caps`; the self-hosted face carries `smcp` and `c2sc`). IBM Plex Sans is
used only for interface apparatus: the byline line, dates, footnote numerals,
the Share control.

**Prose and plates (redesigned 2026-10-07).** Prose stays ruled text: `hr` is
the brand lozenge alone, centred; list bullets take the accent. Every component
that quotes, argues or cites is a plate, built in `src/styles/article-plates.css`
from the component showcase the owner reworked. Plates come in fixed grounds
that keep their inks in both themes, as the Hadith Corpus edition plates do,
plus reader surfaces that follow the theme:

| Ground | Components | How it is drawn |
|---|---|---|
| Parchment (`--pl-paper`) | `ClaimBox`, `VerdictBox`, `HadithBlock` leaf, `BibleVerse`, `.hc-fig` cells, `.hc-fig--extract`, `VariantTree` versions | paper texture, corner ornaments on the display plates; the claim has a dashed inner frame and a seal; labels in tracked Plex capitals |
| Night (`--pl-night`) | `QuoteBlock` | the quill engraving to the right, a hanging mark, the author in gold |
| Bronze | `ContextNote` | a warm card with an "i" mark; collapsible context is a quiet ruled disclosure instead |
| Surface (`--r-surface`) | `QuranVerse`, tables, flows, rows, chains, disclosures, the video card, footnotes | a boxed panel in the theme's own surface |
| Publisher | `QuranTalk` (white), `XEmbed` (black) | each drawn in its own register |

Display plates switch to a reading setting past a length (claims and quotes at
360 characters, Bible passages at 420), so a long passage is never set as a
display. Wide components (tables, `VariantTree`, `QuoteBlock`,
column and flow figures, framed images) step past the measure where the page
has room: up to 6rem a side between 760px and 1199px, 2rem from 1200px, none
on phones. No plate carries a grade, a score or an evaluative colour; `facts`
on a claim or verdict are the author's statements of fact.

**Figures: the shared vocabulary.** Articles that need structure beyond prose
build it from `.hc-fig` and its parts, never from their own CSS:

| Class | Meaning |
|---|---|
| `.hc-fig` | a figure block (`--cols`, `--c2`/`--c3`/`--c4`, `--flow` (`--steps` numbers it), `--chain`, `--rows`, `--lead`, `--extract`) |
| `.hc-fig__item` | a cell: a parchment card in a column grid, a step card in a flow, a row in a ledger |
| `.hc-fig__join` (`--arrow`) | text or an arrow between cells of a flow; an arrow is drawn, whatever arrow was typed, and turns down when stacked |
| `.hc-fig__badge` | a short label in a disclosure's summary |
| `.hc-fig__label`, `__kicker`, `__title` | figure label, cell label (small caps), cell heading (`h3`/`h4` take it too) |
| `.hc-fig__ar`, `__quote`, `__note`, `__tags` | Arabic, a quoted line, secondary text, a run of short terms |
| `.hc-fig__caption`, `__ornament` | caption below; an ornament, never shown |

`scripts/codemods/article-figures-to-shared.mjs` moved all 46 articles that
carried their own `<style>` blocks (about 10,000 lines of CSS, some 500
one-off classes, and the dark `hc-plate` figures) onto this vocabulary. It
rewrote `class` attributes and deleted the style blocks only; the visible text
of every article is identical to the previous commit (checked by comparing the
tag-stripped text of each file). A per-article `<style>` block is no longer
allowed in an article.

**End matter, in order.** Notes (a boxed panel with parchment numerals, a
"Notes" label only when the article has no heading of its own; end-matter
headings are set smaller and ruled), bibliography as ruled rows with hanging
indents, topics as plain text, three more studies
from the same branch with dates, then the earlier and later study.

**Kept.** Footnote previews and the per-source Share control, which is created
by script and shown on hover or focus (always on touch screens).

**Component folder.** `src/components/article/`:

- `shell/`: `ArticleHeader`, `ArticleContents`, `ArticleEnd`, `FootnoteSheet`
- `text/`: `Note` (and `ClaimBox`, `VerdictBox`, `ContextNote`), `QuoteBlock`, `Arabic`, `SectionDivider`
- `sources/`: `QuranVerse`, `HadithBlock`, `Source` (and `BibleVerse`), `SourceShare` (the Share script), `SourceComparisonTable`, `Bibliography`
- `media/`: `QuranTalk`, `XEmbed`, `YouTubeEmbed`
- `figures/`: `IsnadDiagram`, `IsnadDilemmaVisual`, `VariantTree`

### The button exception

`.hc-btn` and its variants sit in IBM Plex Sans at ~15px, weight 500, light tracking,
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
| 0 | `--hc-surface-0`, flat | Page ground |
| 1 | `--hc-surface-1`, `1px --hc-rule` | Panels, sticky header, nav |
| 2 | `--hc-surface-2` | Elevated blocks, details bodies |
| 3 | `--hc-surface-3` gradient + `--hc-rule`, plus `.hc-card::before` inset hairline at 10px | Cards |
| Overlay | `--shadow` `0 30px 100px rgba(0,0,0,.42)` (light: `0 12px 24px rgba(43,40,36,.08)`) | Dialogs, mobile nav |

`--hc-header-shadow` `0 12px 40px rgba(0,0,0,.35)` is the only shadow on a
non-overlay element.

**No shadow-glow on dark.** A coloured halo around a card on the dark ground is
a named AI tell and is banned. Depth comes from the inset hairline.

### No grain, no edge strips

The `body::before` grain layer was removed on 2026-10-08. Do not add one back.
`--hc-noise` and `--hc-noise-dim` remain defined but nothing reads them.

**No edge strips.** A 2 to 6px colored bar on one side of a card, box, row or
callout (`border-inline-start`, `border-top`, an inset `box-shadow`, or a
`::before` strip) is not part of this system. Use a full 1px border, a faint
tint, a dot or chip beside the name, or typography. Where a strip used to carry
information (a reader's color, a "reported" state), the replacement must carry
it too: a dot for a person or era, a word plus a dashed or dotted full border
for a state.

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

### `.hc-masthead` / `.hc-instrument`

The split page hero. `.hc-masthead__inner` is a 1.08fr / 0.92fr grid,
`align-items: end`, that stacks below 1000px; title and lede sit left, an
**instrument** sits right. Flat `--hc-surface-0` and compact, bottom-heavy
padding since 2026-10-08 (it used to lay two radial glows under up to 9.5rem of
padding). No page uses it at present; the project pages moved to `.pj-hero`.

The instrument is a tray (`.hc-instrument`, surface-2), a well
(`.hc-instrument__well`, surface-1) and a fixed-parchment plate
(`.hc-instrument__plate`, with a double inset hairline so it holds against the
paper ground in the light theme). `.hc-instrument__cap` is the gold-dim
apparatus caption, `.hc-instrument__figure` the plate numeral, `.hc-hatch` the
gold hatch fill. **The shell is shared; the contents are not.** Each page sets
its own data out as a working apparatus in the well: `/youtube` a runtime reel
(ticks sized by film length, true to scale against an hour ruler), `/contact` a
review docket with topic rows that preselect the form, `/projects` a register
with jump links. Never fill a well with icon tiles or generic stat cards.

`/resources` still carries its own page-local copy (`.hero`, `.ledger*`); repoint
it and delete the local rules together if it is ever touched.

### `/resources` modules

Three sections on `/resources` use their own shapes, not the shared card.
**GitBooks** is a two-column numbered index of hairline rows (the numeral is a CSS
counter, so it renumbers under a filter). **Channels and blogs** are `.tile`
modules that carry the source's own colors: `--tile-bg`, `--tile-ink` and
`--tile-accent` are sampled from its logo and set inline, and they are fixed
rather than themed, like the parchment plate. This is the one place the site
uses colors outside its tokens, because the point is recognition of the source.
Each ink/background and accent/background pair is checked at 4.5:1; adjust the
ground, never the ink, when a new brand fails. A source with no logo we can
fetch carries initials. **Tools and documentaries** are `.feat` cards: the same fixed
colors, plus art built into the card on its own masked layer (the WikiSubmission
background painting, three of the app's own App Store screenshots staggered off the card
edge, the Discord server's banner). Never repeat the logo as art when the card head
already carries it. Each tool card also carries its own CSS texture under the
text (cross-hatching, a dot grid, brickwork), faded out before the art. The three
tools share one fixed height so they read as a set; each takes its own look from its
source. Documentary grounds and accents are sampled from each video's thumbnail.
**Publications** are `.book` cards (cover left at 2:3, author eyebrow, title, format
and page count) after the Submission Archives written display. Like the tools, each
takes its colors from its cover and its own texture from that book's world: ruled
lines, a blueprint grid, green-bar printer paper, a silver lattice. The cover carries
a spine hinge and a cast shadow so it reads as a bound book.

Polish rules for these cards: tile rows share one height only on wide screens (a
stretched row on a phone is dead space); titles use `text-wrap: balance`; the featured
channel tile carries its real numbers from `youtube-meta.json` along the foot; every
link that opens a new tab says so to screen readers; and a texture never runs behind
body text at a strength that cuts through a line (the printer-paper card puts its bars
in a perforated margin for that reason). The rail and section labels use the section's
own name (Channels, Publications, Tools, Documentaries), not the old format names.

The `/resources` search dock: the format chips follow the order of the sections on
the page, and a chip is named for what it holds (Tool covers a website, an app and a
server). A field that carries focus with its own border must set `--hc-focus-width: 0px`
on the inner input so focus is not drawn twice. The native search clear button is
re-drawn in a themed color. An empty result names the query. Old `?format=App` links
still resolve to Tool. Card grids use a 10px gap.

### `/projects/islamic-studies-atlas` atlas

The hadith criticism atlas reuses the masthead, instrument and ruled-list shapes. Its
entry point is a searchable works catalogue with topic and chronological ordering controls.
Selecting a work opens a focused citation explorer: the selected bibliography above two
explicitly labelled lists, **Cites** and **Cited by**. Every connection prints its title,
author and year. Citations are separate from volume membership. Both citation lists are
searchable together; long lists expand on request. Catalogue search filters the results,
without hiding the selected work's citation context. The catalogue starts with 20 results
and loads more on request. Selection and filters persist in the URL, and browser Back
restores the previous selection. On phones, the catalogue precedes the selected work and
the two citation directions stack. The full bibliography preserves all source notes and
native citation `<details>` as the no-JavaScript path. Existing work anchors open it directly.
There is no full-network drawing: density grows in the lists rather than in crossing lines.

### Row hover

`.book-row__link`, `.corpus-result__link`, `.edition-report__link`,
`.contents-row`, `.dossier-entry` share one hover: a flat 7% gold tint. The
inset 2px gold bar it used to add down the leading edge was retired with the
other edge strips. Hover is an affordance, not information; each row keeps its
own arrow or underline as the shape cue.

### `.hc-skip-link`

Off-screen until `:focus-visible`, then slides to the top edge. Targets
`main#main-content`. WCAG 2.4.1.

---

## Social preview cards

`npm run build:og` writes 56 cards to `public/og/` (1200x630 JPEG, about
110 KB each): the site default, the blog index and the four category hubs, the
editorial pages, the six projects, every collection, and one transmitter
dossier per generation. Articles keep their own illustrated thumbnails.

Every card is the page it previews, in miniature: the page's engraving masked
into the black ground from the right, the Cormorant title with a gold phrase,
the ornament rule, the double frame with gilt corners, the wordmark and the
address. Projects carry their signature instrument drawn from the same data
the page uses (catalogue card, century chart, readers' hues, Q 1:1, decades,
family mix); category cards list the branch's three newest studies in their
category ink; collection cards carry a parchment slip with the edition's size.

Rendering notes, all in `scripts/og/kit.mjs`:

- satori reads only static TTF/OTF, so the faces are fetched as static TTFs
  into `.cache/fonts`.
- Card Arabic is **Amiri**, not Noto Naskh. Noto Naskh places its dots as GPOS
  marks, which satori does not apply, so ث lost its dots.
- Labels are uppercased in JavaScript and their hyphens made non-breaking:
  satori measures before `text-transform` and drops tracking at hyphens, which
  ran words together.
- Titles are laid out one flex child per word so they wrap like text.

Inputs are committed files only (`scripts/og/data.mjs`); no corpus build is
needed. Re-run after adding a collection, category or project, or after a
change to the palette or type.

- Palette values are **copied** into `scripts/og/kit.mjs`, because the card
  renders outside the browser and cannot read the custom properties. Keep its
  `C` block in step with `global.css`.
- The lozenge is **drawn**, not set: the card faces have no U+25C6 and satori
  renders a missing glyph as tofu.
- Arabic is laid out one word per flex child: satori shapes it but collapses
  the spaces between words.
- A collection, category or generation with no card falls back to its section
  card (the manifest is `src/lib/og-cards.ts`), so no page emits an `og:image`
  that 404s. Reach for the `OG` helpers in `src/lib/seo.ts` rather than
  writing a path; `tests/social-cards.spec.ts` checks the main routes.

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
- Don't hardcode a font stack: `var(--font-ui)`, not `'IBM Plex Sans', sans-serif`.
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

### Editorial index pages

Blog, Academia, Projects, Resources, YouTube, and Contact use Source Serif 4 for
editorial headings and prose. `EditorialHero.astro` and `editorial-pages.css`
share dark engraved banners, thin gold rules, and fixed parchment plates with
`--hc-fixed-bronze` accents. Each hero has its own subject in the same illustration
system; see `docs/editorial-pages.md` and `docs/editorial-hero-prompts.json`.
Existing navigation, research text, data, and page controls retain their owners.
Native overview disclosures hold longer indexes and statistics below the banner.

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

## Homepage

One composition in seven movements, each with its own ground, so the page reads
as a sequence and not as a stack of equal black panels. Owned by
`src/styles/home.css`.

| Movement | Ground | Composition |
|---|---|---|
| Hero | black, engraved city masked into the page | Cormorant title with a gold phrase, ornament rule, lede, two actions |
| From the archive | soft black | heading, one horizontal **parchment leaf** for the latest study, four research branches |
| Latest studies | black | a journal contents page: sticky head with branch filter, entries with folio numerals |
| Lectures | soft black band | one lead lecture over two rows, five beside it; thumbnails as published |
| Projects | black | the suite in two labelled groups, Databases and Research, each entry with its own figures |
| Closing | parchment leaf | engraved plate, Cormorant line, ink button |
| Footer | after a single `--hc-footer-gap` | unchanged |

Rules that hold it together:

- **Parchment is rationed.** `.hc-parchment` appears twice on the page, for the
  featured study and the closing note. It pins paper inks in both themes.
- **Category colour is a marker, never a fill.** Each branch shows its ink as a
  2px top rule, a lozenge beside its label, and a count. Hover widens the rule
  and lays a faint `--cat-bg` wash. Colours identify subjects; they do not
  evaluate sources.
- **Every control works without script.** Branch names and their latest study
  are real links to the category hubs. The contents filter ships `hidden` and
  is revealed by the module, so it never exists as a dead control.
- **The CTA-to-footer gap is a token.** The footer's top margin is
  `var(--hc-footer-gap, 64px)`; the homepage sets it once and its closing
  section has no bottom padding. Do not patch it with negative margins.

## Research projects

`ResearchHero.astro` is one shell with six faces. Shared: the engraved ground,
the Cormorant title with the discipline's Arabic name beneath it, the ornament
rule, the register bar of figures. Not shared: the `signature` slot, where each
project sets one instrument drawn from its own data.

| Route | Variant | Signature | Body |
|---|---|---|---|
| `/hadith/` | corpus | parchment catalogue card: build, narrations, compilations, transmitters, chain links | search desk pulled onto the masthead edge, ruled collection slips |
| `/narrators/` | register | transmitters by century of death, as a hatched column chart | sticky filter desk beside the live ledger |
| `/projects/quran/` | readings | the ten readers in their own hues, Latin and Arabic names | reader dossiers, bilingual sura register |
| `/projects/tafsir/` | reader | Q 1:1 in Amiri Quran with its translation | quiet folio index of 114 suras |
| `/projects/islamic-studies-atlas/` | atlas | works by decade, hatched bars | catalogue beside a persistent reading panel |
| `/projects/academic-studies/` | icma | family mix bar and legend | study jackets with a 3px family top rule |

`research-platform.css` owns the shell, the signatures and each page's body
refinements. Every figure in a signature or register bar is read from the data
the page is built from.

The seven `public/images/platform/` engravings have 2172px originals and 1086px
responsive derivatives. These are conceptual illustrations, not reproductions of
historical artifacts or evidence for research claims. Prompts and subjects are
recorded in `docs/platform-artwork-prompts.json` and `docs/platform-redesign.md`.

## Project pages (2026-10-08)

The Qur'an sura pages (`SuraQiraat.astro`), the tafsir sura pages
(`SuraTafsir.astro`), the reader pages (`/projects/quran/readers/[id]`) and the
Fiqh Compass overview share one layer, `src/styles/project-pages.css`, built
after `/resources`. Everything in it reads the theme tokens, so these pages keep
the light theme.

| Part | Class | Rule |
|---|---|---|
| Hero | `.pj-hero` | Eyebrow (with prev and next where there are neighbours), title with its Arabic name, one line of context, at most two chips or one button. Flat ground, one hairline below. No side panel. |
| How to read | `.pj-about` | Closed native disclosures directly under the hero for anything that used to sit in a hero panel. |
| Disclosure | `.pj-disc`, `--row`, `--card`, `--quiet` | One accordion: a `<details>` with a drawn chevron. Works with scripting off. |
| Section head | `.pj-head` | Title, a flat 1px rule, a plain count. |
| Chip | `.pj-chip` | A link, a toggle (`.pj-chip__input` radio or checkbox) or a disclosure summary. Never inert. |
| Dot | `.pj-dot` | A person's or an era's color beside a name. |
| Card | `.pj-card` | Surface-1, full 1px border. |
| Toolbar | `.pj-toolbar` | Filters left, Expand all and Collapse all right. The buttons ship `hidden` and the page's module reveals them. Sticky above 1000px. |
| Legend | `.pj-legend` | One per page, in a `<details>` popover. |
| Pager | `.pj-pager` | Previous, the index, next. |

One width and one measure per page: `--pj-width` (1240px for the Qur'an and
Fiqh pages, 1100px for tafsir, 960px for readers) and `--pj-measure` (42rem).
Cream is not used as a panel ground on these pages; Arabic sits on the card
surface. The collation grid states "reported" and "not stated" in words with a
dashed or dotted full border (the dense overview uses `r` and `–`, explained in
the legend), and keeps the reader colors from `qiraat.css` unchanged.

`scripts/check-contrast.mjs --open-details` opens every disclosure before
measuring, because closed text is never painted and so never measured.
