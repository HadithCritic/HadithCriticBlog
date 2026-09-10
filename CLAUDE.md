# CLAUDE.md

Working notes for this repo. `DESIGN.md` is the authority on anything visual;
this file covers everything else you would otherwise have to re-derive.

## What this is

HadithCritic: an Astro site combining long-form research articles (MDX) with
two live databases rendered on demand from Cloudflare D1: a 276,347-narration
hadith corpus and a 20,950-entry rijāl register.

## Stack facts that change how you work

- **Astro 7 on the Cloudflare adapter.** Static by default. Corpus and register
  routes opt out with `export const prerender = false` and read D1 through
  `import { env } from 'cloudflare:workers'`.
- **No UI framework anywhere.** No React, Preact, Svelte or Vue, and no islands.
  Interactivity is server-rendered HTML plus a small vanilla module
  (`src/lib/narrator-register.ts`). `gsap` is the only client-side dependency.
  Do not add a framework to solve a styling or animation problem.
- **The local D1 is fully populated** at
  `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite` (~1.7 GB). You can
  render and measure every page against real data. Read it directly with
  `node:sqlite` in read-only mode when you need to check a value or a
  distribution before making a claim about it.
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
- **The register renders rows twice**: server-side in `narrators/index.astro`
  and client-side in `narrator-register.ts`. A change to a row's markup, copy or
  classes has to be made in both, or it reverts on the first filter click.

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
npm run dev              # 127.0.0.1:4321
npm run check            # astro check, must be 0 errors
npm run test:design      # scripts/design-audit.mjs, fails on <12px and outline:none
npm run lint:footnotes
npm run test:normalize   # Arabic folding and formatting
npm run build            # astro build + pagefind, ~208 pages
npm run validate         # all of the above
```

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
| `src/lib/narrator-register.ts` | The register's client module. |
| `scripts/design-audit.mjs` | The design linter wired into `validate`. |

## Conventions

Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). No
co-author or attribution lines. Avoid em-dashes in committed text, including
code comments. Say what changed and why it was wrong before, with the measured
value where there is one.
