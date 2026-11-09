# CLAUDE.md

Working notes for this repo. `DESIGN.md` is the authority on anything visual;
this file covers everything else you would otherwise have to re-derive.

## What this is

HadithCritic: an Astro site combining long-form research articles (MDX) with
two research databases: a 276,347-narration hadith corpus and a 20,950-entry
rijāl register. Both are one versioned SQLite file, published as immutable
static chunks and queried in the reader's browser over HTTP range requests.
No database server is in the request path for any public page.

## Stack facts that change how you work

- **Astro 7 on the Cloudflare adapter.** Static by default, and the corpus is
  now static with it. Al-Shama'il has 56 prerendered chapter pages, each sourced
  from an editable HTML file in
  `src/data/hadith-pages/al-shama-il-al-muhammadiyah/chapters/`; the collection
  landing page is `src/data/hadith-pages/al-shama-il-al-muhammadiyah/collection.html`.
  Individual `/hadith/<id>/` addresses and `/narrators/<id>/` use one shell each,
  served by a 200 rewrite that `scripts/lib/shell-rewrites.mjs` appends to
  `_redirects`. Only `/api/subscribe` runs on demand. Read
  `docs/static-corpus.md` before touching anything under `/hadith` or
  `/narrators`.
- **The corpus is on disk** at `dist-db/builds/<version>/hadith.db` (1.62 GB),
  built from `dist-db/silsilah.db` by `npm run build:corpus`. Read it directly
  with `node:sqlite` in read-only mode when you need to check a value or a
  distribution before making a claim about it. Neither file is in git; the site
  builds from `src/data/corpus-meta.json`, which is generated and committed.
- **`npm run dev` serves on 127.0.0.1:4321.** Corpus pages take a few seconds on
  first compile. If a page appears to hang for minutes after an edit, it is
  usually dev-server recompilation backlog, not your code: re-request before
  investigating.
- **Dev has a 4 GiB heap budget.** `scripts/dev-site.mjs` sets it through
  `NODE_OPTIONS` so Astro's background process inherits it, and preserves an
  existing explicit heap limit. Vite loads research JSON through `JSON.parse`
  with named exports disabled to avoid building large data-module ASTs. Keep
  JSON imports as default imports.
- Markdown/MDX GFM is declared once on `markdown.processor` in
  `astro.config.mjs`. Do not also pass `remarkPlugins` to the `mdx()`
  integration; that arrangement is deprecated and was already removed.
