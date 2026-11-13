# CLAUDE.md

Working notes for this repo. `DESIGN.md` is the authority on anything visual;
this file covers everything else you would otherwise have to re-derive.

## What this is

HadithCritic: an Astro site of long-form research articles (MDX) and research
projects. Its hadith collections are static pages built from editable HTML in
`src/data/hadith/pages/`. There is no database anywhere in the request path.

`src/data/` is grouped by area, with nothing loose at its top level:
`hadith/` (`pages/`, `json/`, `local-editions/`, `reader-editions.json`),
`tafsir/` (the registry modules, `pages/` for edited HTML, `tabari/` for
JSON), `history/` (`history.ts`, `readers/`), `rijal/` (`taqrib/` JSON,
`pages/`), `quran/`, `research/`, `blog/` and `site/`. Put new data in the
folder for its area.

`scripts/` follows the same areas: `site/` (build, dev server, previews,
audits), `blog/`, `og/`, `hadith/`, `tafsir/`, `quran/`, `history/`
(including the `tarikh/` translation pipeline) and `rijal/`. Helpers shared
inside an area live in its own `lib/`; nothing sits directly in `scripts/`.
A script that finds the repo root from its own location goes two folders up.

`public/` keeps only what browsers and Cloudflare expect at the root
(`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, the manifests,
`robots.txt`, `_headers`, `_redirects`). Other icons are in `icons/`, blog
art in `images/blog/{editorial,generated,thumbnails}/`. When a public file
moves, add a redirect for its old address to `_redirects`.

## Stack facts that change how you work

- **Astro 7 on the Cloudflare adapter.** Static throughout; only
  `/api/subscribe` runs on demand. Al-Shama'il has 56 prerendered chapter
  pages, each sourced from an editable HTML file in
  `src/data/hadith/pages/al-shama-il-al-muhammadiyah/chapters/`; the collection
  landing page is `src/data/hadith/pages/al-shama-il-al-muhammadiyah/collection.html`.
  The other collections follow the same layout under their own slug, and
  `src/lib/hadith-library.ts` lists every collection on `/hadith`.
- **Each compilation keeps its own structure.** `scripts/hadith/lib/work-structure.mjs`
  decides how a page-record source is read: full narration cards (own isnad),
  a compact list under one shared chain (`nuskhat-al-zubayr-ibn-adi`), or
  running prose (`kitab-al-hajj-al-majishun`). Title pages, copy transmissions
  and audition notes are frames around the text, not narrations. Transmission
  paths for sources without narrator data are read from the isnad wording by
  `scripts/hadith/lib/chain-from-isnad.mjs`; it never identifies anyone.
  `scripts/hadith/build-abu-hanifa-mubarak-pages.mjs <slug ...>` rebuilds only the
  named collections; a bare run rewrites every collection, so name the slugs.
  Musnad al-Ḥumaydī and Musnad Ibn Abī Shayba come from
  `scripts/hadith/convert-third-century-musnads.mjs`.
- **Nine collections are redesigned single-page readers.** Their page is
  `src/data/hadith/pages/<slug>/reader.html` (hero, index, text and notes in
  one document), served by `src/components/hadith/ReaderEdition.astro` at
  `/hadith/collection/<slug>/`. `scripts/hadith/import-reader-renovations.mjs "<folder>"`
  takes a standalone redesign and strips its embedded header, its html/body
  rules and its absolute links; `reader-meta.json` beside it holds the title
  and the counts the cards show. `scripts/hadith/lib/renovated-readers.mjs` lists
  them, and the chapter builder and JSON export skip that list. Their old
  `/chapter/N/` and `/read/` URLs redirect from `public/_redirects`.
  `publication-source.json` stays as the source record but no longer builds
  anything.
- **A collection with no chapters is one page; a collection with chapters
  keeps chapter pages.** `SINGLE_PAGE` in `scripts/hadith/lib/renovated-readers.mjs`
  lists the works that are a single run of narrations (fascicles, notebooks,
  short books). `scripts/hadith/build-single-page-readers.mjs [slug ...]` builds each
  as one reader in the form of Ṣaḥīfat Hammām's, whose stylesheet it reuses:
  every narration in the index, the work's own headings as dividers, edition
  notes on a second tab. It writes `reader.html`, `reader-meta.json` and the
  Astro page, and removes any chapter files. Works with real divisions (a
  musnad by Companion, a sunan by bāb) are built by
  `build-abu-hanifa-mubarak-pages.mjs`, which skips the single-page list. Add
  a new one-chapter work to `SINGLE_PAGE` instead of giving it a chapter page.
  A work whose text has its own headings (sūras, teachers, bābs) is a chapter
  collection, one chapter per heading, however short the chapters are.
- **The shorter 3rd and 4th century works are English-only translations**
  keyed by Shamela page-record serial. `scripts/hadith/convert-translated-treatises.mjs
  "<translations dir>" "<parquet 6 dir>" [slug ...]` joins each to its Arabic
  export (it also looks in the century's `Done` folder) and writes
  `publication-source.json`; `scripts/hadith/lib/translated-treatises.mjs` says what
  each work is, whether it reads as chapters, as one page with its own
  headings between the reports (`record.lead`), or as one undivided text, and
  the group and record counts the builder expects. They have no cover or
  medallion yet: the card shows the shared library image and the empty ring
  until files named for the slug and a `medallion` key are added.
- **`src/data/hadith/json/` holds one bilingual JSON per compilation**, written
  by `scripts/hadith/export-compilation-json.mjs` from the built pages. Rerun it after
  rebuilding a collection. Nothing imports these files.
- **Hadith artwork is found by file name.** Covers are
  `public/images/hadith/covers/<collection-slug>.webp`, medallions are
  `public/images/hadith/medallions/<compiler>.webp` (the `medallion` key in
  `src/lib/hadith-compilers.ts`), and art that belongs to the `/hadith` page
  itself is in `public/images/hadith/page/`. `src/lib/hadith-art.ts` resolves
  both and holds the focal points; nothing else builds these paths. Run
  `node scripts/hadith/verify-hadith-art.mjs` after adding or renaming art.
- **The rijal register was removed on 2026-11-10** to be rebuilt from scratch.
  Transmitter names in the collection pages are plain text. Chain items keep a
  `data-narrator-id` attribute from the source data, but nothing reads it.
- **The new rijal data starts from Ibn Ḥajar's Taqrīb al-Tahdhīb.**
  `scripts/rijal/build-taqrib-rijal.mjs "<bilingual 8609 export>"` reads the Shamela
  page records and writes `src/data/rijal/taqrib/`: `narrators.json` (one
  record per biography, id `taqrib-<number>`), `texts.json` (Arabic and the
  translator's English by id), `aliases.json` (the 3,212 "[]"
  cross-references, resolved to ids where the name allows), `vocab.json` and
  `report.json` (coverage and the entries to check by hand). Fields are read
  from the Arabic only; the English came in batches with different
  conventions and is kept as a gloss. Bracketed text is the Abū al-Ashbāl
  edition's reading and is stored as a variant, except that a number-only
  bracket ("[ومائة]") still completes a death year. Years without a century
  get one from the generation by the rule in Ibn Ḥajar's introduction, and
  `death.basis` says which happened. The parser is in `scripts/rijal/lib/`;
  `npm run test:rijal` tests it, and with `TAQRIB_SOURCE` set it also parses
  the whole book. The site does not read this JSON.
- **The narrators register (`/projects/rijal/`) is prebuilt HTML.** The same
  build script writes `src/data/rijal/pages/taqrib/`: one fragment per page
  plus `pages.json`. A page is a letter of the men's names (cut into parts of
  about `PAGE_LIMIT` names, at a change of given name) or one of the book's
  other lists (kunyas, women and so on); `scripts/rijal/lib/pages.mjs` plans
  them and `html.mjs` writes them. There is no page per narrator: each name is
  a `<details>` that opens in place, and `src/lib/rijal-register-client.ts`
  opens it in a dialog instead, with the hash set to the narrator's id.
  `src/lib/rijal-register.ts` reads the fragments with `readFileSync` for
  `projects/rijal/[page].astro`. Styles are `rijal.css` on top of
  `history.css`. Rebuild with `npm run build:taqrib -- "<export>"`.
- **`npm run dev` serves on 127.0.0.1:4321.** Large pages take a few seconds on
  first compile. If a page appears to hang for minutes after an edit, it is
  usually dev-server recompilation backlog, not your code: re-request before
  investigating.
- **Dev has a 4 GiB heap budget.** `scripts/site/dev-site.mjs` sets it through
  `NODE_OPTIONS` so Astro's background process inherits it, and preserves an
  existing explicit heap limit. Vite loads research JSON through `JSON.parse`
  with named exports disabled to avoid building large data-module ASTs. Keep
  JSON imports as default imports.
- **History library (`/projects/history/`) reads each book a page at a
  time.** A book's source is one prebuilt fragment,
  `src/data/history/readers/<slug>.html`, which stays a single editable
  document. `src/lib/history-book.ts` cuts it at build time: a short chapter
  is one page, short chapters that follow one another share a page, and a
  long chapter is divided at its own headings (years, accounts, entries) or,
  where it has none, between paragraphs. Each book has a title page
  (`history/[book]/index.astro`) whose contents follow `data-layout` (annals
  list years under reigns, reports show report numbers, and so on) and
  reading pages (`history/[book]/[page].astro`). A page's slug is the id it
  starts at in the fragment, so old `#anchor` links to the title page are
  forwarded through `[book]/anchors.json`. The paging limits are constants at
  the top of `history-book.ts`; after changing them or a fragment, run
  `node --experimental-strip-types scripts/history/verify-history-books.mjs`, which
  fails if any word or note is lost. These pages are set in Source Serif 4
  (`HistoryFonts.astro`) because Newsreader draws ī with a dot under its
  macron. Styles are `history.css` (tokens, library page), `history-book.css`
  and `history-reader.css`; they use the site color tokens, so both themes
  work without rules of their own.
- **Tafsir library (`/projects/tafsir/`) has four commentaries, read one
  verse at a time.** Every work has a surah page listing its verses
  (`[work]/[surah]/index.astro`) and a page per verse
  (`[work]/[surah]/[verse].astro`), all under the site's standard header.
  Mujāhid, al-Thawrī and al-Zamakhsharī are editable HTML, one file per surah,
  in `src/data/tafsir/pages/<id>/`, registered in
  `src/data/tafsir/tafsir-editions.ts`; `src/lib/tafsir-edition-html.ts` files each
  `<section class="chapter" data-verses="…">` under its verses, and chapters
  without a verse go to the surah's `general` page. Al-Ṭabarī's al-Fātiḥa is
  hand-edited HTML in `src/data/tafsir/pages/tabari/001/`; his other surahs are
  rendered from `src/data/tafsir/tabari/surahs/NNN.json` by
  `src/lib/tafsir-verse-html.ts`. Those JSON files are read with
  `readFileSync` at build time, not imported. `src/data/tafsir/tafsir-library.ts`
  gives the front page all 114 surahs per work. The scripts that write this
  data (`build-tafsir-data.mjs`, `build-tafsir-edition-pages.mjs`,
  `restyle-tafsir-editions.mjs`, `build-tafsir-zamakhshari.mjs`,
  `build-tafsir-coverage.mjs`) read source folders outside the repo; their
  header comments say which. Rerun `build-tafsir-coverage.mjs` after any of
  the others so the front page's progress bars stay true. Ibn Wahb's Tafsīr
  was removed on 2026-11-11.
- Markdown/MDX GFM is declared once on `markdown.processor` in
  `astro.config.mjs`. Do not also pass `remarkPlugins` to the `mdx()`
  integration; that arrangement is deprecated and was already removed.
