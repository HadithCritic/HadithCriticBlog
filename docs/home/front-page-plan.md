# Front page plan

The goal is a front page split into clear sections, one for each thing HadithCritic
offers. Each section gets a figure that is built from the site's own data and that
moves or responds, in the way avrea.com's sections do.

Decisions so far (2026-11-13):

- Sections: studies, hadith corpus, narrators register, tafsir, tārīkh, resources,
  YouTube, open source (the site repository and its open data).
- Tone: dark with gold as the base, with parchment (`#f2ebdc`) bands on three
  sections so the page alternates the way avrea's light and dark sections do.
- Motion: inline SVG and CSS only. No canvas or WebGL.
- Every number and label in a figure is read from data at build time. Nothing is
  invented for the illustration.

## Page order

| # | Section | Band | Figure | Data source |
|---|---------|------|--------|-------------|
| 0 | Hero | photo | Centered statement and medallion band | `hadith-compilers.ts`, `hadith-library.ts` |
| 1 | Method | dark panel | Five-station research pipeline | static, links to each tool |
| 2 | Studies | dark | Category tabs over lead study and rows | `articles` collection |
| 3 | Hadith corpus | parchment | Compiler map, facing-text card | `hadith-compilers.ts`, `hadith-library.ts`, `collection-catalogue.ts` |
| 4 | Narrators | dark | Generation ladder and a biography card | `src/data/rijal/taqrib/` |
| 5 | Tafsir | dark | Verse layers and a surah coverage grid | `tafsir-coverage.json`, `tafsir-library.ts` |
| 6 | Tārīkh | parchment | Chronology rail by author death date | `history.ts` |
| 7 | Resources | dark | Shelf of covers and the GitBook band | `resources.astro` lists (moved to data) |
| 8 | YouTube | dark | Channel figures, featured lecture, rail | `youtube-meta.json` |
| 9 | Open source | parchment | Setup card with tabs, repository tree | repo layout, `src/data/hadith/json/` |
| 10 | Subscribe | photo | Existing closing form | none |

## 0. Hero

Keep the photo and headline. Add two things from avrea's hero:

- **Corpus ledger card**: built in step 2 and removed on 2026-11-13 at the owner's
  request. The headline, lede and buttons sit centered on the photo.
- **Medallion band** under the hero: the compiler medallions (60 files) as a slow
  marquee with faded edges, each one linking to its collection. It pauses on hover
  and focus, and wraps into a static grid under reduced motion. This replaces avrea's
  customer logo strip.

## 1. Method: how a study is built

The counterpart to avrea's "Accelerate your entire delivery workflow". One dark
panel, five stations on a horizontal line, each a small looping SVG scene with an
eyebrow, a title and a link to the part of the site that does that step:

1. **Collect the variants**: scattered text fragments drift into one stack (hadith corpus).
2. **Identify the narrators**: names resolve to labeled nodes (narrators register).
3. **Map the chains**: lines draw from many collectors back to a single common link.
4. **Compare the wording**: two text lines, with a deletion and an insertion highlighted.
5. **Date the report**: a marker settles on a century axis (studies).

All five loop on one shared clock (`--duration-ambient`) and stop when off screen.

## 2. Studies

Keep the lead study and the five rows, which already work. Add:

- **Category tabs** for the four categories, using each category's existing color.
  Pure CSS (radio inputs and `:checked`), so it works without script. Each tab shows
  the newest study in that category as the lead and its next rows. "All" is the
  default.
- Row hover: the arrow grows a shaft (the avrea button arrow), and the category
  color shows as a thin left rule.

## 3. Hadith corpus (parchment band)

Two cards side by side on desktop, stacked on mobile.

- **Compiler map.** An SVG outline of the region from al-Andalus to Transoxiana,
  with one point per `CompilerRegion` (17 regions). The size of each point follows
  the number of collections from that region. Hovering or focusing a point lifts it,
  dims the others and shows a callout with the region, its compilers and their
  narration counts. A century switch (2nd, 3rd, 4th AH, from `COMPILER_DATES`) fades
  out the compilers outside that century. This is the role avrea's globe plays,
  drawn in flat SVG.
- **Facing-text card.** One real narration from a chosen collection in Arabic and
  English, with its isnad set apart from the matn. On first view the chain draws
  link by link and the matn fades in under it. A "Read the collection" button below.

## 4. Narrators register

- **Generation ladder.** The Taqrīb sorts narrators into twelve generations
  (ṭabaqāt). A vertical ladder of twelve rungs, each with a bar for the number of
  narrators in that generation. Hovering a rung shows the count and one named
  example. Counts come from `narrators.json`.
- **Biography card.** One entry in Arabic with the translator's English below and
  the parsed fields (grade, generation, death year, and its basis) as tags, which
  shows what the register adds over the raw text.

## 5. Tafsir

- **Verse layers.** Four stacked isometric plates, one per commentary, over a
  single verse that all four comment on (to be picked from the data). They pulse in turn on the
  ambient clock. Hovering a plate lifts it and shows a short passage from that
  commentary. This is avrea's cache stack used for commentaries.
- **Coverage grid.** Four rows of 114 small cells, one cell per surah, filled where
  that commentary has text. Hovering a row lights that work, and hovering a cell
  shows the surah name and what each work has for it. Al-Zamakhsharī's partial
  English (92 of 114 surahs) shows as a lighter fill.

## 6. Tārīkh (parchment band)

- **Chronology rail.** A horizontal axis from 200 to 320 AH (CE shown beneath).
  Each history sits at its author's death date (`died.ah`), with a bar above it
  scaled to its word count. Open readers are solid and works not open yet are
  outlined. The rail draws left to right once, then each book lands. Hovering a
  book raises a card with its title, author and reading pages, and clicking opens it.
  This is the counterpart to avrea's CI graph.

## 7. Resources

- **Shelf.** The four PDF covers stand on a shelf tilted in 3D (the same tilt avrea
  uses for its runner card). Hovering a cover pulls it forward and turns it to face
  the reader, with page count and a download link.
- **GitBook band.** The eleven GitBooks as a second, slower marquee of title tiles.
- Tools (WikiSubmission site, app and Discord) as three small banner tiles.
- The lists move out of `resources.astro` into `src/data/site/resources.ts` so the
  resources page and the front page read the same data.

## 8. YouTube

- **Channel figures.** Subscribers, total views and video count from
  `youtube-meta.json`, set large in tabular figures, as in avrea's "Faster CI at a
  lower cost" strip, over a halftone fade.
- **Featured lecture** large on the left, the next three as a rail on the right,
  keeping the existing click-to-load player.

## 9. Open source (parchment band)

The counterpart to avrea's "Set up in minutes".

- **Setup card with tabs**: "Read the data", "Run the site", "Cite a source". Each
  tab shows numbered steps and a code block with a copy button. For example: the
  JSON path for a collection and a sample record, `git clone` with `npm run dev`,
  and a citation line.
- **Repository tree**: the `src/data/` folders drawn as a tree. Hovering a folder
  shows what it holds and how many files it has.
- A link to the GitHub repository.

## 10. Subscribe

Keep the current closing section unchanged.

## Shared foundation (build first)

These come from avrea's structure and every section uses them:

1. **Motion tokens** in `global.css`: `--duration-ui .2s`, `--duration-reveal .5s`,
   `--duration-settle .8s`, `--duration-ambient 3.6s`, and the easings `out`,
   `out-back`, `in-out-quart`, `in-out-soft`.
2. **`src/lib/home-motion.ts`**:
   - Elements marked `data-ambient-scene` get `data-motion-paused` when off screen
     or in a hidden tab. One CSS rule then pauses their animations.
   - Elements marked `data-reveal-once` get `.is-armed` from script, then
     `.is-playing` at 50% visibility. Without script they show their final state.
   - Under reduced motion, every figure shows its final state.
   - Sections get `content-visibility: auto` after their first measurement.
3. **`HomeSection.astro`**: the section shell, with kicker, title, lede, a figure
   slot, `tone="dark|parchment|panel"` and an optional notched divider between
   sections.
4. **`HomeButton.astro`**: a button where a small chevron tile grows to fill the
   button on hover and the chevron becomes an arrow.
5. **Halftone fade** (`.dots-fade`) and `.surface-lift` utilities.
6. **`src/lib/home-data.ts`**: one module that gathers every figure the page shows
   from the registries, so the page does no arithmetic of its own.

## Constraints

- Type follows the site faces (Newsreader, Literata, Public Sans, Noto Naskh
  Arabic) with a 12px floor. Avrea's 8 to 10px chart labels do not carry over: SVG
  labels have to render at 12px or more on a phone, or be HTML placed over the
  figure.
- Each figure is one `.astro` component with its own scoped style and a small
  script. No framework runtime.
- Every interactive figure works by keyboard (focus, Enter or Space, Escape) and
  by touch (tap to hold, tap outside to release).
- `DESIGN.md` was deleted in 8392b08, but `CLAUDE.md` still names it as the
  authority on visual design. Either restore it or update `CLAUDE.md` once this
  page sets the direction.

## Build order

1. Foundation: tokens, `home-motion.ts`, `HomeSection`, `HomeButton`, `home-data.ts`,
   and the page rebuilt in the new order with the current content in place.
2. Hero ledger card and medallion band.
3. Method pipeline.
4. Hadith compiler map and facing-text card.
5. Tārīkh chronology rail.
6. Tafsir verse layers and coverage grid.
7. Narrators generation ladder and biography card.
8. Studies category tabs.
9. Resources shelf, YouTube figures, open source setup card.
10. Pass over mobile, reduced motion, keyboard, both themes, and
    `scripts/site/design-audit.mjs`.

Each step can ship on its own, since the page works with any subset of figures in place.
