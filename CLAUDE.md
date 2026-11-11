# CLAUDE.md

Working notes for this repo. `DESIGN.md` is the authority on anything visual;
this file covers everything else you would otherwise have to re-derive.

## What this is

HadithCritic: an Astro site of long-form research articles (MDX) and research
projects. Its hadith collections are static pages built from editable HTML in
`src/data/hadith-pages/`. There is no database anywhere in the request path.

## Stack facts that change how you work

- **Astro 7 on the Cloudflare adapter.** Static throughout; only
  `/api/subscribe` runs on demand. Al-Shama'il has 56 prerendered chapter
  pages, each sourced from an editable HTML file in
  `src/data/hadith-pages/al-shama-il-al-muhammadiyah/chapters/`; the collection
  landing page is `src/data/hadith-pages/al-shama-il-al-muhammadiyah/collection.html`.
  The other collections follow the same layout under their own slug, and
  `src/lib/hadith-library.ts` lists every collection on `/hadith`.
- **The rijal register was removed on 2026-11-10** to be rebuilt from scratch.
  Transmitter names in the collection pages are plain text. Chain items keep a
  `data-narrator-id` attribute from the source data, but nothing reads it.
- **`npm run dev` serves on 127.0.0.1:4321.** Large pages take a few seconds on
  first compile. If a page appears to hang for minutes after an edit, it is
  usually dev-server recompilation backlog, not your code: re-request before
  investigating.
- **Dev has a 4 GiB heap budget.** `scripts/dev-site.mjs` sets it through
  `NODE_OPTIONS` so Astro's background process inherits it, and preserves an
  existing explicit heap limit. Vite loads research JSON through `JSON.parse`
  with named exports disabled to avoid building large data-module ASTs. Keep
  JSON imports as default imports.
- **Tafsir library (`/projects/tafsir/`) has four commentaries, read one
  verse at a time.** Every work has a surah page listing its verses
  (`[work]/[surah]/index.astro`) and a page per verse
  (`[work]/[surah]/[verse].astro`), all under the site's standard header.
  Mujāhid, al-Thawrī and al-Zamakhsharī are editable HTML, one file per surah,
  in `src/data/tafsir-pages/<id>/`, registered in
  `src/data/tafsir-editions.ts`; `src/lib/tafsir-edition-html.ts` files each
  `<section class="chapter" data-verses="…">` under its verses, and chapters
  without a verse go to the surah's `general` page. Al-Ṭabarī's al-Fātiḥa is
  hand-edited HTML in `src/data/tafsir-pages/tabari/001/`; his other surahs are
  rendered from `src/data/tafsir/tabari/surahs/NNN.json` by
  `src/lib/tafsir-verse-html.ts`. Those JSON files are read with
  `readFileSync` at build time, not imported. `src/data/tafsir-library.ts`
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
