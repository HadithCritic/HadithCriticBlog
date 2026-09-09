# Codebase audit

Read-only audit, September 2026. **This is a proposal list. Nothing here has been
implemented and no existing file was modified.**

> **Two items are now out of date; corrections are inline below.** 1.1 is done —
> all four unused dependencies are gone. **4.3 was wrong**: `public/data/narrators`
> was not being fetched at runtime, and 61 MB was deployed for nothing. Both are
> marked where they appear. Everything else still stands as written.

## Method

Static analysis first, then individual verification of every candidate.

- **depcheck** ran clean and produced a dependency candidate list.
- **knip** crashed on Windows out of the box (`ERR_INVALID_ARG_VALUE` — it builds
  a glob containing a null byte, `...\!**\\\x00`, in `fast-glob`). It runs
  correctly when given an explicit config with `--no-gitignore`. Worth knowing
  before anyone tries `npx knip` here and concludes the tool is broken.
- Every candidate was then checked by hand for indirect references: dynamic
  `fetch()` template paths, `site.webmanifest` / `browserconfig.xml` icon
  entries, MDX imports, and YAML frontmatter. That check removed a large number
  of tooling false positives, recorded below so nobody re-derives them.

Confidence levels: **confirmed** (verified against every reference path I could
find), **likely** (strong evidence, one plausible unknown), **needs review**
(real finding, but the call is a product/editorial decision, not a code one).

---

## 1. Dead code, unused files, unused dependencies

### 1.1 Four genuinely unused npm dependencies — *confirmed* — **DONE**

> Resolved. `@libsql/client`, `fast-xml-parser`, `turath-sdk` and `yaml` are all
> gone from `package.json`. The `yaml` override is still pinned, which is
> harmless but is now a pin for a package nothing declares.

`package.json`

| Package | Evidence |
|---|---|
| `@libsql/client` | zero references in `src/`, `scripts/`, `tests/`, config |
| `fast-xml-parser` | zero references |
| `turath-sdk` | zero references |
| `yaml` | zero references (the `overrides` block pins it, but nothing imports it) |

Flagged independently by both knip and depcheck, then confirmed by grep across
every source extension. `turath-sdk` and `@libsql/client` suggest an abandoned
Turath/SQLite data path — `scripts/build-narrators.mjs` now uses `node:sqlite`
and `hyparquet` instead.

Note the `overrides` block also pins `yaml`; removing the dependency without
removing the override would leave a pin for a package nothing installs.

### 1.2 depcheck/knip false positives — *do not act on these*

Recorded so the next pass doesn't repeat the work:

- **`marked`** — depcheck reports it unused because it does not parse `.astro`.
  It is used in `src/pages/research/shirk-endorsed/[...slug].astro` (5 call sites).
- **`@astrojs/check`, `typescript`** — used by `npm run check`, not imported.
- **`pagefind`** — invoked in the `build` script, not imported.
- **`astro:content`, `cloudflare:workers`** — virtual modules, not packages.
- **21 "unused exported types"** from knip — these are `interface Props` in Astro
  components. Astro consumes `Props` implicitly; this is the documented
  convention, not dead code.

### 1.3 `src/components/Emblem.astro` — *likely dead*

89 lines. No importers anywhere in `src/`. Last substantive commit
2026-06-08 ("Holy See inspired redesign v2"), 2 commits total.
`GeometricEmblem.astro` is the live component and *is* imported. This reads as a
superseded first version rather than an unlinked feature.

### 1.4 One-off migration scripts inside the content collection — *confirmed*

`src/content/articles/` contains 10 non-content files, ~86 KB:

```
apply_all_fixes.cjs   fix_21_diagram.cjs   fix_22.cjs   fix_23.cjs
fix_30.cjs            fix_31.cjs           fix_37.cjs   fix_38.cjs
fix_39.cjs            fix_tables.py
```

These are single-use codemods that were run against the articles and left in
place. Astro's content collection globs `.md`/`.mdx`, so they are not parsed and
cause no build error — but they sit inside the content directory, are tracked in
git, and are numbered against articles in a way that implies they are content.
If any are worth keeping as provenance they belong in `scripts/`, not in the
collection.

### 1.5 Two log files are tracked in git — *confirmed*

`.astro-preview.log` (487 B), `.astro-preview.err.log` (0 B) are **tracked and
not gitignored**. Build/preview logs should not be in version control.

`.gitignore` correctly covers `dist`, `test-results`, `.astro`, `.wrangler`,
`.env`, `.dev.vars` and `.cf-secret.json`. **No secret has ever been committed**
— I checked `git log --all` for all three secret files and the history is clean.

### 1.6 `dev-server.mjs` — *needs review*

At the repo root, **untracked and not gitignored**, so it will be swept into the
next `git add -A`. It is a 12-line wrapper that boots the Astro dev server
programmatically on a fixed port. Either commit it deliberately or add it to
`.gitignore`; leaving it in the current state is the one option that will
produce an accidental commit.

### 1.7 Orphaned assets in `public/` — *confirmed*, ~20 MB

Verified against literal references, YAML frontmatter, dynamic `fetch()`
templates, `site.webmanifest` and `browserconfig.xml`.

| File | Size | Note |
|---|---|---|
| `public/data/narrators/index_tuples.json` | 3.22 MB | legacy index format; `index.json` is the live one |
| `public/images/asset1-light.png` | 3.08 MB | the `.webp` (397 KB) is what the hero loads |
| `public/images/blog_thumbnails/tn.77–80.png` | 10.58 MB | the `.webp` versions (180–226 KB each) are the ones in frontmatter |
| `public/images/brand/dark_footer_asset.png` | 2.38 MB | zero references |
| `public/rijal-data/` (whole dir) | 1.60 MB | zero references to the path anywhere |
| `public/images/brand/footerasset.webp` | 0.13 MB | zero references |

**False positives excluded** after verification: all `/data/narrators/chunks/*`
and `/data/narrators/criticism/*` (fetched via template literals),
`android-chrome-*` and `maskable-icon-512x512.png` (in `site.webmanifest`),
`mstile-150x150.png` (in `browserconfig.xml`), and
`uncurable_illness_scan.png` / `salafi_dilemma_screenshot.png` (referenced once
each). A naive scan reports 475 files / 28.9 MB here; the real number is far
smaller.

Lower value: `favicon-512/384/256/192/180.png` (~140 KB total) are not referenced
by `BaseLayout.astro` or the manifest, which use `favicon-32x32.png`,
`favicon.ico` and `apple-touch-icon.png`. Harmless, but they are dead bytes.

---

## 2. Redundant or over-fragmented code

### 2.1 39.1 MB of byte-identical duplicated images — *confirmed*, highest-value finding

`shirk-endorsed-by-the-scholars-of-islam/` (41 MB, 323 files, **all tracked**)
holds the raw scraped source for the treatise: 200 `.jpg`, 114 `.md`, 7 `.png`.

All **207 images are byte-identical duplicates** (MD5-compared, 207/207 match,
0 differ) of the images already in `public/assets/treatises/shirk-endorsed/`.
That is **39.1 MB carried twice in the repository**.

Nothing reads the directory at build time — I checked for `readFile`, `readdir`
and `import` against that path and found none. Its only apparent "references" are
`pathname` strings inside `src/data/shirk-endorsed/chapters.json`, which are
original source **URLs**, not filesystem paths. The `.md` files have already been
ingested into `src/data/shirk-endorsed/chapters.json` and `scholars.json`.

**Needs review, not deletion.** This is scholarly source material and its
retention is an editorial/provenance decision. But the *duplication* is a code
concern regardless of that decision: the 207 images could be removed from the
source directory (keeping the `.md` provenance) without losing anything, since
byte-identical copies are already served from `public/`. That alone recovers
~39 MB.

### 2.2 Clipboard logic copy-pasted across 7 files — *confirmed*

`src/components/article/{QuranVerse,BibleVerse,HadithBlock,ArticleHero}.astro`,
`src/pages/contact.astro`, `src/pages/narrators/index.astro`,
`src/pages/research/shirk-endorsed/[...slug].astro`

Each independently implements: `navigator.clipboard.writeText()` → try/catch →
add an `is-copied` class → swap label text → `setTimeout` to revert. The four
article components are near-identical (13–14 matching lines each), differing
only in which element they read text from and the label.

**This is a real consolidation candidate** — a shared `copyToClipboard(el, opts)`
helper in `src/lib/` plus one CSS rule for the copied state would remove
genuine duplication, not just files. Worth doing.

### 2.3 `IsnadDilemmaVisual` exists twice — *needs review*

- `src/components/IsnadDilemmaVisual.astro` — 629 lines, **no importers**
- `src/components/article/IsnadDilemmaVisual.astro` — 335 lines, imported by
  `src/content/articles/origins-early-history/63-the-resurrections-500-witnesses-one-chain-not-500.mdx`

They differ substantially (849 differing lines ignoring whitespace), so the
unused one is not a stale copy of the used one — it is a **larger, different
version**, roughly twice the size. Both were last touched in the same
2026-08-14 commit.

Per the caution about unlinked features: **this is not obviously dead code.** The
629-line version may be a richer iteration that was never wired up, or an earlier
elaborate version that was deliberately slimmed. Deciding which is a product
call. **Flagged, not recommended for deletion.**

### 2.4 Three design-system classes defined in two files each — *low priority*

`.hc-header-link` (`global.css` + `SiteHeader.astro`), `.hc-article-body` and
`.hc-article-grid` (`global.css` + `article.css`).

The `hc-` prefix signals a global design-system class, so having 3 of the 50 also
defined in a component or a second stylesheet is mild drift — it means the
cascade decides which wins by source order. Small, but the exact class of bug
that produced the `:lang(ar)` cascade issue found in a previous session.

### 2.5 Merges I looked at and am **not** recommending

- **The `src/components/article/*` set (20 components).** These are one concern
  per file and correctly separated. Merging them into a barrel or a combined file
  would reduce the file count and make the codebase worse. Leave split.
- **`article.css` into `global.css`.** They are separate concerns (article body
  typography vs. site tokens and chrome) and both are already large. Merging
  would produce one ~2,000-line file with no benefit.
- **`EditionNav` / `EditionBreadcrumb` / `BackToTop`.** Small, single-purpose,
  and shared across the treatise pages. Correct as-is.

---

## 3. Inconsistent patterns

### 3.1 Things that are already clean — *no action needed*

Recorded so these do not get re-audited:

- **No leftover debug logging.** All 13 `console.*` calls across 9 files are
  `console.error` / `console.warn` inside `catch` blocks — legitimate error
  handling, correctly not `console.log`.
- **No `TODO`, `FIXME`, `HACK`, `XXX` or `@deprecated`** anywhere in `src/`.
- **No large commented-out code blocks** in any `.astro` or `.css` file.

### 3.2 Inline styles where the codebase uses shared classes — *likely*

`src/pages/narrators/index.astro` has 11 inline `style="…"` attributes;
`src/pages/youtube.astro` and `src/pages/blogs/[...id].astro` have 1 each. The
rest of the codebase styles via classes and tokens. Worth checking whether the
11 in `narrators` are dynamic (justifiable) or static (should be classes).

Content MDX has only 3 inline styles across 1 file, which is fine.

---

## 4. Performance

### 4.1 No client-side hydration at all — *excellent, no action*

There is not a single `client:load` / `client:idle` / `client:visible` /
`client:only` directive in the codebase. Every page ships as static HTML with
hand-written vanilla `<script>` where needed. This is the ideal Astro outcome and
should be stated explicitly so a future change does not casually regress it.

### 4.2 Redundant image originals shipped to production — *confirmed*

13 MB of `.png` files sit next to the `.webp` versions that are actually
referenced (see 1.7). These are deployed and count against the Cloudflare asset
budget. The `.webp` versions are 8–13× smaller.

`scripts/optimize-images.cjs` already exists — the originals appear to be inputs
that were never cleaned up after conversion.

### 4.3 `public/` is 139 MB — ~~*needs review*~~ **CORRECTED — this section was wrong**

> The claim below that the narrator JSON "is legitimately fetched in chunks at
> runtime — that is a deliberate architecture, not waste" was false by the time
> it was written. `src/lib/narrator-register.ts` states outright that it
> "queries /api/narrators instead of downloading a 5.2 MB index", and
> `src/pages/narrators/[id].astro` reads criticism from the database rather than
> the sharded copy. There were zero references to the path anywhere in `src/`.
>
> All 471 files (61 MB) were tracked in git *and* copied into `dist/client`, so
> they shipped on every deploy for nothing. They are now `data/generated/narrators/`,
> a build input for the seed script only, which took the deploy from ~151 MB to
> 90 MB. The lesson is the one this audit warns about in its own Method section:
> a path can stop being read without anything erroring.

Breakdown: 66 MB JSON (474 files), 33 MB JPG (200), 23 MB PNG (33), 12 MB WEBP (89).

Most of the JSON is the narrator dataset (`public/data/narrators` alone is 64 MB)
and is legitimately fetched in chunks at runtime — that is a deliberate
architecture, not waste. But it is worth confirming the chunking strategy is
still right at this size, and `index.json` (5.3 MB) is downloaded before any
chunk.

### 4.4 Render-blocking font stylesheet — *likely*

`src/layouts/BaseLayout.astro` loads Google Fonts via
`<link rel="stylesheet">` in `<head>`, which is render-blocking. The
self-hosted Glacial Indifference faces are correctly `rel="preload"`ed and
`preconnect` is present, so the setup is already better than default — but the
Poppins/Amiri stylesheet still blocks first paint. A
`media="print" onload="this.media='all'"` swap or inlining the `@font-face`
rules would remove it. Measure before changing; `font-display: swap` is already
set, so the practical impact may be small.

### 4.5 Build-only packages in `dependencies` — *confirmed*, correctness not speed

`@astrojs/check`, `typescript` and `sharp` are in `dependencies` but are only
used by CLI scripts (`astro check`, `scripts/optimize-images.cjs`). `sharp` in
particular is a large native module. Moving them to `devDependencies` shrinks
production installs. Verify first that the Cloudflare adapter does not want
`sharp` at build time on the deploy runner.

---

## 5. Best-practice drift

### 5.1 No automated gate for dead code — *proposal*

`scripts/design-audit.mjs` already enforces design conventions at build time
(type floor, `--font-ui` role split, alt text, landmarks). There is no equivalent
gate for unused files, exports or dependencies, which is why the four unused
packages in 1.1 accumulated.

Adding `knip` to the `validate` chain would close that gap — but it needs a
committed config file to work on Windows at all (see Method). Given the false
positives documented in 1.2, the config would need `ignoreDependencies` for
`pagefind` / `@astrojs/check` / `typescript` and `ignoreExportsUsedInFile` for
the Astro `Props` convention.

### 5.2 `worker-configuration.d.ts` is a 570 KB generated file in git — *needs review*

Generated by `wrangler types`. Committing it is a legitimate choice (it keeps
`astro check` working without a wrangler run), but it is worth a comment at the
top saying it is generated and how to regenerate, so nobody hand-edits it.

---

## Top 10 by value

1. **Remove the 207 duplicated treatise images** (2.1) — 39.1 MB, byte-identical,
   verified by hash. Largest single win. Keep the `.md` provenance.
2. **Delete the orphaned `public/` assets** (1.7) — ~20 MB of shipped bytes,
   including 13 MB of PNG originals whose `.webp` versions are the ones used.
3. **Drop the four unused dependencies** (1.1) — `@libsql/client`,
   `fast-xml-parser`, `turath-sdk`, `yaml`, plus the stale `yaml` override.
4. **Decide on `IsnadDilemmaVisual`** (2.3) — 629 unused lines vs. a 335-line
   used version. A product call, not a cleanup.
5. **Decide on the 41 MB source directory** (2.1) — provenance archive or
   removable once the images are de-duplicated.
6. **Extract the clipboard helper** (2.2) — the one consolidation here that
   removes real duplication across 7 files.
7. **Move the one-off codemods out of the content collection** (1.4) — 10 files
   that look like content but are not.
8. **Fix the git hygiene trio** (1.5, 1.6) — untrack two log files, and either
   commit or ignore `dev-server.mjs` before it is committed by accident.
9. **Move `sharp` / `typescript` / `@astrojs/check` to `devDependencies`** (4.5).
10. **Add a `knip` gate to `validate`** (5.1) — with the Windows config and the
    documented false-positive exclusions, so 1.1 does not recur.

Items 4 and 5 are explicitly **decisions for a human**, not cleanup tasks.
