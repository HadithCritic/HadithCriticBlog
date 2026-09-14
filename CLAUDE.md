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
  now static with it. Only `/hadith/[id]` and `/narrators/[id]` set
  `export const prerender = false`, because their ids are unbounded; they read
  nothing at request time and exist to emit a shell the client fills. Read
  `docs/static-corpus.md` before touching anything under `/hadith` or
  `/narrators`.
- **No UI framework anywhere.** No React, Preact, Svelte or Vue, and no islands.
  Interactivity is server-rendered HTML plus a small vanilla module
  (`src/lib/narrator-register.ts`). `gsap` is the only client-side dependency.
  Do not add a framework to solve a styling or animation problem.
- **The corpus is on disk** at `dist-db/builds/<version>/hadith.db` (1.62 GB),
  built from `dist-db/silsilah.db` by `npm run build:corpus`. Read it directly
  with `node:sqlite` in read-only mode when you need to check a value or a
  distribution before making a claim about it. Neither file is in git; the site
  builds from `src/data/corpus-meta.json`, which is generated and committed.
- **`npm run dev` serves on 127.0.0.1:4321.** Corpus pages take a few seconds on
  first compile. If a page appears to hang for minutes after an edit, it is
  usually dev-server recompilation backlog, not your code: re-request before
  investigating.
- Markdown/MDX GFM is declared once on `markdown.processor` in
  `astro.config.mjs`. Do not also pass `remarkPlugins` to the `mdx()`
  integration; that arrangement is deprecated and was already removed.

## Traps that have cost real time

- **Astro scopes page styles** to `[data-astro-cid-*]`, which outranks unscoped
  global CSS at equal specificity. When you repoint a call site to a shared
  component in `global.css`, **delete the page-local original in the same
  commit**, or the leftover copy silently keeps winning.
- **Never put a border-drawing class on a `.wrap` element.** `.wrap` carries
  `padding-inline` inside its border box, so the border lands on the padding box
  and overhangs the text column by `--pad` on each side while the contents still
  align. Nest instead. This shipped as a live defect on two pages.
- **`:focus-visible` is owned globally** in `global.css` with `!important`,
  because a component-scoped `outline: none` used to remove it site-wide. Never
  re-declare `outline` in a component; set `--hc-focus-*` instead.
  `scripts/design-audit.mjs` fails the build on component-level `outline: none`.
- **Astro trims the newline before an element in JSX-like expressions.** Two
  values on separate lines render with no space between them. Emit `{' '}`.
  This shipped as `51-75of 7,410` at 34px.
- **Line endings are mixed** across the repo and git is configured with
  `autocrlf`, so the index stores LF. Normalising a working-tree file to LF is
  diff-neutral. Match the file you are editing or normalise it first; a
  find-and-replace built for `\n` will silently match nothing in a CRLF file.
- **Theme must be set before the document runs.** `BaseLayout` applies
  `data-theme` from `localStorage` in an inline script before paint. Setting the
  attribute after load, as an automated check naturally would, measures
  whichever theme the previous page left behind and reports every colour
  inverted. Use Playwright's `addInitScript`.
- **Chromium returns `color(srgb r g b / a)`** for anything that went through
  `color-mix()`, and those components are 0-1, not 0-255. Parsing them as bytes
  turns a pale parchment panel into near-black and invents contrast failures.
- **Git Bash rewrites a bare `/` argument into a Windows path.**
  `node scripts/check-contrast.mjs --route /` arrives as
  `--route C:/Program Files/Git/`, which the script skips as unreachable and
  then reports zero failures. That looked like a clean home page for several
  runs while it was never being tested. Prefix with `MSYS_NO_PATHCONV=1`, or
  check the route list rather than a single `/`.
- **Article figures are bespoke and dark-first.** Before changing one, read the
  `--hc-scrim` and `.hc-plate` sections of `DESIGN.md`. The short version: a
  panel whose inner text uses tokens wants a scrim, a panel whose inner text is
  hardcoded parchment or gold wants `hc-plate`. Getting that backwards produces
  light ink on black or parchment on paper, and both measure around 1:1.
- **A background declaration can span several lines.** `.article-opening` puts
  its colours on the continuation lines of a `background:` shorthand, so a
  line-based scan for `background:.*rgba` misses them entirely. Parse
  declarations, not lines.
- **Corpus markup gets no scope hash.** Astro scopes a page's `<style>` to
  `[data-astro-cid-*]`, and a node created by script never carries that
  attribute. Every rule for markup the corpus modules emit lives in an
  `is:global` block. Moving one back into a scoped block silently unstyles the
  page, and nothing fails: it renders, in the wrong typeface, at the wrong size.
- **`:global()` inside an `is:global` block ships as a literal selector.** Astro
  only rewrites `:global()` in a *scoped* block. In a global one it passes
  through, lightningcss logs "'global' is not recognized as a valid
  pseudo-class", and the built CSS contains `.facing-prose :global(.folio){...}`,
  which matches nothing. That shipped: emphasis, bold and folio marks inside
  every narration were unstyled, with a build warning as the only sign. Unwrap
  every `:global()` when you convert a block.
- **Middleware runs while Astro prerenders.** `src/middleware.ts` reads
  `context.request.headers`, and there is no request during a build. Touching it
  logs "`Astro.request.headers` is not available on prerendered pages" once per
  page, which was 33 warnings per build once the collection editions were
  prerendered. It returns early on `context.isPrerendered`; keep any new header
  read below that guard.
- **Small corpus chunks silently lose rows.** The VFS grows its read window as
  it scans and maps each read to one chunk file, so a read wider than a chunk is
  clamped and only the pages that arrived get stored. Nothing errors: queries
  just return fewer rows than the file holds. Measured at 64 KiB chunks, a term
  in seven narrations returned none. `chunk-db.mjs` refuses anything under
  1 MiB; production uses 10 MiB.
- **Never republish a corpus version in place.** Chunks are served `immutable`
  for a year, so new bytes at an old URL leave browsers pairing the old manifest
  with the new chunks, which loses rows the same silent way. Corpus versions are
  dated plus a commit; the test fixture is named for a hash of its own contents.
  The manifest is deliberately short-cached so a rollback can take effect.
- **`astro preview` cannot serve the corpus.** It is wrangler, and Cloudflare
  static assets answer a range request with `200` and the whole file, which
  makes SQLite read pages from the wrong offsets. `openCorpus()` refuses rather
  than returning wrong narrations, so the corpus is served from its own origin
  by `scripts/corpus-file-server.mjs` in tests, exactly as production serves it
  from R2. Build for that with `npm run build:e2e`, never plain `npm run build`,
  when you intend to exercise the corpus end to end.
- **A corpus page is a shell until the corpus answers.** Any check that waits
  for `load` is measuring a spinner. `scripts/check-contrast.mjs` waits for real
  content per route and fails the route if it never arrives; anything new that
  inspects these pages has to do the same, or it passes by not running.
- **The collection shell is one document for every page of a collection.**
  `?page=2` must be read from the URL, never from a data attribute baked into
  the prerendered HTML. This shipped wrong once: the right twenty-five records,
  with the pager insisting it was page one.

## Rules that are not negotiable

These are product commitments, not preferences. `DESIGN.md` carries the detail.

1. **No authenticity grading is displayed or implied, anywhere**, including on
   narrator pages. No reliability score, no star rating, no ṣaḥīḥ/ḍaʿīf badge,
   and no colour doing evaluative work. Classical grades and jarḥ/taʿdīl
   statements appear as attributed source data in neutral apparatus ink.
2. **WCAG 2.2 AA on every text/background pair, both themes.** Compute it
   against the composited background; do not eyeball it, and do not compare raw
   tokens when a semi-transparent layer sits between them.
3. **English precedes Arabic in the DOM.** English sits visual-left on wide
   screens and both collapse to Arabic-first below 780px, achieved with explicit
   `grid-column`/`grid-row`, never by reordering the DOM. DOM order is what
   screen readers and keyboards follow.
4. **The site stays usable with JavaScript off.** Any new interaction needs a
   working fallback first: native `<details>`, a real `<form method="get">`, or
   real anchors. A `<button type="button">` that only a module listens to is not
   a control.
5. **Never paraphrase research content.** Arabic, transliteration, citations,
   titles, quoted claims and source wording are reproduced exactly. If source
   data looks wrong, report it rather than editing it.

## Commands

```bash
npm run build:corpus     # build + chunk + verify a corpus release (needs the master db)
npm run publish:corpus   # stage it where `npm run dev` serves it
npm run verify:corpus    # row counts, chunk reassembly, query parity vs the master

npm run build:corpus:fixture  # recut the committed CI fixture from the real corpus
npm run build:e2e        # build with the corpus on its own origin, then test:e2e
npm run test:e2e:corpus  # both corpus suites, data assertions included

npm run dev              # 127.0.0.1:4321
npm run build:og         # regenerate the social preview cards in public/og
npm run check            # astro check, must be 0 errors
npm run test:design      # scripts/design-audit.mjs, fails on <12px and outline:none
npm run lint:footnotes
npm run test:normalize   # Arabic folding and formatting
npm run build            # astro build + pagefind, ~208 pages
npm run validate         # all of the above

node scripts/check-contrast.mjs                # WCAG AA, both themes, key routes
node scripts/check-contrast.mjs --all-articles # include every article body
node scripts/check-contrast.mjs --json         # composited bg and DOM path
```

`check-contrast.mjs` needs the dev server running, and the corpus staged
(`npm run publish:corpus`) or the corpus routes fail as "never rendered". It is
not in `validate` only because it needs a live server rather than a build.

Run `check`, `test:design` and `build` before finishing any UI change.

## Where things live

| Path | What |
|---|---|
| `DESIGN.md` | The visual system. Read before any UI change. |
| `docs/hallmark-audit-before.md`, `-after.md` | The 2026-09 design pass, with the punch list and what closed. |
| `src/styles/global.css` | Tokens, both themes, and the shared component layer. |
| `src/styles/article.css` | Long-form article body. |
| `src/styles/motion.css` | A stub kept only for its reduced-motion block. |
| `src/pages/hadith/**` | Corpus catalogue, collection edition, hadith record. |
| `src/pages/narrators/**` | Rijāl register, dossier, comparison. |
| `docs/static-corpus.md` | The static corpus: build, publish, measure, traps. |
| `src/lib/corpus-config.ts` | Which corpus version, served from where. |
| `src/lib/corpus-client.ts` | Every corpus query, and the worker's lifecycle. |
| `src/lib/narrator-register.ts` | The register's client module. |
| `src/lib/hadith-search.ts`, `hadith-record.ts`, `collection-edition.ts`, `narrator-dossier.ts`, `narrator-compare.ts` | The other corpus renderers. |
| `src/data/corpus-meta.json` | Generated totals, collections and facets. Committed; never edited by hand. |
| `scripts/build-corpus.mjs` | The corpus release pipeline. |
| `tests/corpus.spec.ts` | Corpus behaviour, against any corpus. Includes "no database traffic". |
| `tests/corpus-data.spec.ts` | What the real corpus contains. Skips against the fixture. |
| `tests/fixtures/corpus/` | The miniature corpus CI serves. Generated, committed, 2.6 MB. |
| `scripts/design-audit.mjs` | The design linter wired into `validate`. |
| `scripts/check-contrast.mjs` | Real-browser WCAG AA check against the composited background. |
| `scripts/build-og-images.mjs` | Generates the social preview cards. |
| `public/og/`, `src/lib/og-cards.ts` | The generated cards and their manifest. |

## Conventions

Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). No
co-author or attribution lines. Avoid em-dashes in committed text, including
code comments. Say what changed and why it was wrong before, with the measured
value where there is one.
