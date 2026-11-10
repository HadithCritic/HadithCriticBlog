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
- Markdown/MDX GFM is declared once on `markdown.processor` in
  `astro.config.mjs`. Do not also pass `remarkPlugins` to the `mdx()`
  integration; that arrangement is deprecated and was already removed.
