<p align="center">
  <img src="docs/hadithcritic-blog-banner-ink.svg" alt="HadithCritic Blog Repository" width="100%" />
</p>

# HadithCritic Blog

The **[HadithCritic platform](https://hadithcriticblog.com)** is a specialized blog dedicated to source-critical hadith studies. This repository serves as the core engine for the platform, housing all published articles, custom interactive UI components, media assets, and a bespoke authoring environment.

Designed for high performance, readability, and rich interactivity, the blog blends scholarship with modern web technologies to present complex transmissions, isnad diagrams, and textual analysis in an accessible format.

---

## Features

- **Hadith corpus**: 276,347 narrations across 33 collections, browsable in sequence and searchable in Arabic and English, with no authenticity gradings stored or shown. Under `/hadith`.
- **Rijāl register**: 20,915 transmitter dossiers with attributed critical verdicts, isnād relationships and attested name variants. Under `/narrators`.
- **Articles**: statically generated MDX with custom components like `IsnadDiagram`, `IsnadDilemmaVisual` and `HifzGame` embedded directly into the prose.
- **Two search systems**: [Pagefind](https://pagefind.app/) over the articles, client-side and built at deploy time; SQLite FTS5 over the corpus, with Arabic folded so عائشة and عايشة match.
- **No client hydration**: not one `client:*` directive. Every page is HTML with hand-written vanilla `<script>` where needed.

---

## Tech Stack & Architecture

- **Framework**: [Astro 7](https://astro.build). Almost everything is prerendered, the corpus included. Only `/hadith/[id]` and `/narrators/[id]` render on demand, because their ids are unbounded; they read nothing at request time.
- **Content Formatting**: MDX (`@astrojs/mdx`)
- **Corpus**: a 1.62 GB SQLite database published as immutable static chunks and queried in the reader's browser over HTTP range requests. No database server is in the request path for any public page. See **[docs/static-corpus.md](docs/static-corpus.md)**, which is required reading before touching a corpus query, and **[DATABASE.md](DATABASE.md)** for how it got here.
- **Search**: [Pagefind](https://pagefind.app/) for articles, FTS5 for the corpus
- **Deployment**: **Cloudflare Workers** via the `@astrojs/cloudflare` adapter and `wrangler.jsonc`.

### Where the docs are

| File                                                              | What it answers                                                                                                            |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **[docs/static-corpus.md](docs/static-corpus.md)**           | How the corpus is built, chunked, published and read. Required before editing anything under`/hadith` or `/narrators`. |
| **[docs/corpus-performance.md](docs/corpus-performance.md)** | Why corpus pages are slow, measured against production, and the ranked fixes.                                              |
| **[DATABASE.md](DATABASE.md)**                               | Current corpus publishing, runtime data flows, and historical database resources.                                      |
| **[DESIGN.md](DESIGN.md)**                                   | The authority on anything visual. Enforced at build time by`npm run test:design`.                                        |
| **[CLAUDE.md](CLAUDE.md)**, **[AGENTS.md](AGENTS.md)**  | Working notes and the traps that have cost real time.                                                                      |
| **[docs/COMPONENT-GUIDE.md](docs/COMPONENT-GUIDE.md)**       | The MDX components available inside an article.                                                                            |

---

## Repository Structure

```text
/
├── data/generated/        # Build inputs for the register seed. Never served.
├── dist-db/               # Master and built corpus databases. Not in git.
├── docs/                  # Project notes, taxonomy, and source material
├── migrations/            # Historical SQL schemas; not applied by current builds.
├── public/                # Static assets (favicons, fonts, raw files)
│   └── images/            # Optimized blog images and media assets
├── scripts/               # Data pipelines, database tooling, and audits
│   └── lib/               # Shared corpus vocabulary and range-serving code
├── src/
│   ├── components/        # Custom interactive UI components
│   │   ├── IsnadDiagram.astro
│   │   ├── HifzGame.astro
│   │   ├── ReportCard.astro
│   │   └── ...
│   ├── content/articles/  # The core blog posts authored in MDX format
│   ├── data/              # Generated JSON data used across the site
│   ├── layouts/           # Site-wide structural layouts
│   ├── lib/               # Shared utilities, including the corpus client
│   ├── pages/             # Astro application routes
│   │   ├── hadith/        # Corpus: browse, search, collection, narration
│   │   ├── narrators/     # Rijāl register and dossiers
│   │   └── api/           # Subscription and admin endpoints only
│   └── styles/            # Global visual system and article-specific styles
└── tests/                 # Playwright suites and the committed corpus fixture
```

---

## Getting Started

### Prerequisites

- **Node.js**: version `>=24.0.0`, as `package.json` declares. The corpus scripts use `node:sqlite`.
- **npm**: package manager
- **Python 3**: only if you need to rebuild the master corpus database from the seed dumps

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/HadithCritic/hadithcriticblog.git
cd hadithcriticblog
npm install
```

*(Note: If you encounter peer dependency conflicts, use `npm install --legacy-peer-deps`)*

### Environment and secrets

Nothing is required to run the article pages locally. These variables are for building or publishing the separate hadith corpus.

| Variable                                             | Read from                                                    | Needed for                                                                                                                                                                                                                                                                                                    |
| :--------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_CORPUS_BASE_URL`                           | Cloudflare Worker build environment                          | Inlined into the client bundle. Production is explicitly set to `https://data.hadithcriticblog.com/`; local development uses the range-capable dev server. |
| `PUBLIC_CORPUS_VERSION`                            | build environment                                            | Pinning or rolling back to a corpus version other than the one in`src/data/corpus-meta.json`.                                                                                                                                                                                                               |
| `CLOUDFLARE_*` (API token, account id, R2 S3 keys) | `../.env.local`, outside the repo                          | `npm run publish:corpus`, which uploads to R2.                                                                                                                                                                                                                                                              |
| `CORPUS_MASTER_DB`                                 | shell                                                        | Pointing the corpus build at a master database outside`dist-db/`.                                                                                                                                                                                                                                           |
| `CORPUS_VERSION`                                   | shell                                                        | Republishing under an existing version name instead of minting a new one.                                                                                                                                                                                                                                     |
| `CORPUS_R2_BUCKET`, `CORPUS_ALLOWED_ORIGIN`      | shell                                                        | Overriding the publish bucket or the CORS origins.                                                                                                                                                                                                                                                            |
| `CORPUS_PORT`, `CORPUS_ROOT`                     | shell                                                        | The standalone corpus file server the end-to-end run uses.                                                                                                                                                                                                                                                    |

`.dev.vars` and `.env.local` are both gitignored. `wrangler.jsonc` deliberately carries no database binding and no corpus URL.

### Local Development

#### Starting the Development Server

To start the Astro development server locally with Hot Module Replacement (HMR):

```bash
npm run dev
```

Or run Astro directly:

```bash
npx astro dev --host 127.0.0.1
```

Once the development server is running, open your browser and navigate to:

- **`http://localhost:4321`** or **`http://127.0.0.1:4321`**

> **Note on Localhost Connection**: The dev server binds explicitly to `127.0.0.1:4321`. If your browser has trouble resolving `localhost`, navigate directly to `http://127.0.0.1:4321`.

Corpus pages take a few seconds on first compile. If a page seems to hang for minutes after an edit, that is usually dev-server recompilation backlog rather than your code: re-request before investigating.

#### Working on the corpus locally

The corpus is 1.62 GB and is **not in git**. Everything the site prerenders comes from `src/data/corpus-meta.json`, which is generated and committed, so the site builds and every article works without it. Only the interactive parts of `/hadith` and `/narrators` need the database itself.

Three ways to get corpus pages answering locally, in order of how much you need:

**1. Nothing at all.** Articles, the catalogue, collection pages and every count render from the committed metadata. Corpus search and dossiers report that the corpus is unavailable.

**2. The committed fixture**, 48 narrations and 161 transmitters, about 2.6 MB in `tests/fixtures/corpus/`. This is what CI uses. The standalone corpus server serves it, not `astro dev`:

```bash
npm run build:e2e:fixture   # swap in the fixture metadata, build against it
npm run test:e2e:corpus     # start the corpus server and run the suites
npm run use:corpus-real     # put the tracked metadata files back
```

`use:corpus-fixture` overwrites two tracked files, `src/data/corpus-meta.json` and `src/data/narrator-sitemap.json`. `use:corpus-real` restores them from git.

**3. The real corpus.** Build the master database once with `python scripts/build-static-db.py`, which writes `dist-db/silsilah.db` from the seed dumps, then:

```bash
npm run build:corpus        # distribution db, chunks, metadata, verification
```

That writes `dist-db/builds/<version>/`, which the Vite plugin in `scripts/lib/corpus-dev-server.mjs` serves at `/data/corpus/` with real `206` responses. `npm run dev` then has a working corpus.

To exercise a **built** site against the real corpus, use `npm run build:e2e`. Stop `npm run dev` first: Playwright reuses a server already answering on 4321, and a dev server serves the source rather than that build, so every corpus test fails on a 404.

#### Available Development Commands

| Command                                                     | Action                                                                                                   |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                             | Start the Astro development server at`http://127.0.0.1:4321`                                           |
| `npm run build`                                           | Build the site to`./dist/` and generate the Pagefind search index                                      |
| `npm run preview`                                         | Preview the production build locally at`http://127.0.0.1:4321` (required to test search functionality) |
| `npm run check`                                           | Astro and TypeScript type check                                                                          |
| `npm run validate`                                        | Full suite: footnote lint, unit tests, Arabic normalization parity, type check, design audit, build      |
| `npm run lint:footnotes`                                  | Footnote structure lint across the articles                                                              |
| `npm run test:design`                                     | Enforce the conventions in DESIGN.md                                                                     |
| `npm run test:subscribe`                                  | Unit tests for the subscriber signup integration                                                          |
| `npm run test:normalize`                                  | Arabic normalization and formatting parity, JS against SQL                                               |
| `npm run test:e2e`                                        | The full Playwright suite                                                                                |
| `npm run test:e2e:corpus`                                 | Both corpus suites, including the assertions about what the real corpus contains                         |
| `npm run build:e2e`                                       | Build with the corpus on its own byte-serving origin, which the end-to-end run needs                     |
| `npm run build:e2e:fixture`                               | The same, against the committed miniature corpus                                                         |
| `npm run build:corpus`                                    | Build, chunk, verify and stage a corpus release from the master database (local only)                    |
| `npm run build:corpus:fixture`                            | Cut the committed miniature corpus out of the real one                                                   |
| `npm run corpus:meta`                                     | Regenerate`src/data/corpus-meta.json` and the narrator sitemap ids                                     |
| `npm run verify:corpus`                                   | Row counts, chunk integrity and query parity between the distribution and the master                     |
| `npm run publish:corpus`                                  | Upload a built corpus release to R2, with CORS, where production reads it                                |
| `npm run publish:corpus:dist`                             | Copy a release into`dist/client` instead, for a host that serves byte ranges                           |
| `npm run use:corpus-fixture`, `npm run use:corpus-real` | Swap the committed corpus metadata for the fixture's, and back                                           |
| `npm run build:narrators`                                 | Rebuild generated narrator research files under `data/generated/`                                      |
| `npm run build:og`                                        | Regenerate the Open Graph card images                                                                    |

*Search Note*: The Pagefind index is only generated during the build process. To test the full search feature locally, run `npm run build` followed by `npm run preview`.

---

## Databases

The hadith corpus is a versioned SQLite file, served as immutable static chunks from the `hadithcritic-corpus` R2 bucket and queried in the reader's browser over HTTP range requests. The public reading path has no database server. A release is named `YYYY-MM-DD-<short commit>`, is never rewritten in place, and is tied to a site deployment through `src/data/corpus-meta.json`. Read **[docs/static-corpus.md](docs/static-corpus.md)** before changing a corpus query.

Publishing a corpus release and deploying the site are separate events:

```bash
npm run build:corpus     # from the master database, local only
npm run publish:corpus   # upload that version to R2
```

The article-announcement admin page has been removed. Public subscription signup remains available and adds contacts to Resend; it does not use a database. Historical SQL files under `migrations/` document earlier versions and are not part of deployment.

The master corpus database is not stored in Git. Keep an identified, backed-up master copy separate from the published R2 releases. **[DATABASE.md](DATABASE.md)** describes the current data flow and the historical D1/Turso resources.

---

## Scripts & Utilities

The `scripts/` directory holds the data pipelines and audits.

| Script                                                                                                                                                         | Purpose                                                                                                                                                                       |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build-static-db.py`                                                                                                                                         | Builds the master database from the seed dumps. Local, occasional, and the only Python here.                                                                                  |
| `build-corpus.mjs`                                                                                                                                           | Runs the four stages below in order. The normal way to cut a corpus release.                                                                                                  |
| `build-distribution-db.mjs`                                                                                                                                  | Master to distribution: ANALYZE, VACUUM, integrity check.                                                                                                                     |
| `chunk-db.mjs`                                                                                                                                               | Splits the distribution database into 10 MiB chunks and writes the manifest.                                                                                                  |
| `build-corpus-meta.mjs`                                                                                                                                      | Generates`src/data/corpus-meta.json` and the narrator sitemap ids. Both are committed.                                                                                      |
| `verify-distribution.mjs`                                                                                                                                    | Row counts, chunk reassembly and query parity against the master. Fails the release, not the page.                                                                            |
| `publish-corpus.mjs`                                                                                                                                         | Publishes one version to R2, or into`dist/` for a host that serves byte ranges.                                                                                             |
| `build-corpus-fixture.mjs`                                                                                                                                   | Cuts the miniature corpus CI serves out of the real one. Output is committed.                                                                                                 |
| `use-corpus-fixture.mjs`                                                                                                                                     | Swaps the committed corpus metadata for the fixture's, and back.                                                                                                              |
| `corpus-file-server.mjs`                                                                                                                                     | Serves corpus chunks with real byte ranges, which`astro preview` cannot. Used by the e2e run.                                                                               |
| `build-for-e2e.mjs`                                                                                                                                          | Builds the site pointed at that server, optionally against the fixture.                                                                                                       |
| `lib/corpus-range.mjs`                                                                                                                                       | The byte-serving implementation, shared by the dev middleware and that server.                                                                                                |
| `build-narrators.mjs`                                                                                                                                        | Builds generated narrator research files in `data/generated/` from the al-Kashif source.                                                                                     |
| `build-og-images.mjs`                                                                                                                                        | Generates the Open Graph card images with Satori.                                                                                                                             |
| `build-quran-data.cjs`                                                                                                                                       | Generates Quranic verse JSON data for quick citations within blog articles.                                                                                                   |
| `optimize-images.cjs`                                                                                                                                        | Converts heavy PNG/JPG files in`public/` to optimized WebP.                                                                                                                 |
| `convert_to_mdx.cjs`                                                                                                                                         | Converts legacy content formats into standardized MDX.                                                                                                                        |
| `test-search.mjs`                                                                                                                                            | Runs end-to-end queries against the compiled Pagefind search index.                                                                                                           |
| `design-audit.mjs`, `check-contrast.mjs`                                                                                                                   | Enforce DESIGN.md and WCAG AA at build time.                                                                                                                                  |
| `lint-footnotes.mjs`                                                                                                                                         | Footnote structure lint across the articles.                                                                                                                                  |

---

## Deployment

The site deploys to the Cloudflare Worker named **`hcb`**.

1. Push changes to the main branch.
2. The single production Workers Build for `main` runs `npm run build`, then `npx wrangler deploy`. It uses the Astro Cloudflare adapter and `wrangler.jsonc`; `PUBLIC_CORPUS_BASE_URL` is configured on the production build trigger.
3. Prerendered pages are served as static assets. `/hadith/[id]` and `/narrators/[id]` run on demand and perform no I/O.
4. Corpus releases are published separately from article changes: `npm run publish:corpus` uploads a built release to R2. Update and commit `src/data/corpus-meta.json` when the site should use a new release.

The published corpus is public static data. Runtime secrets `RESEND_API_KEY` and `RESEND_SEGMENT_ID` are used only for subscription signup; the signup endpoint is rate limited by the Worker binding in `wrangler.jsonc`.
