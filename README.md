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

---

## Repository Structure

```text
/
├── data/generated/        # Build inputs for the register seed. Never served.
├── docs/                  # Project notes, taxonomy, and source material
├── migrations/            # Database schema, applied with `npm run db:migrate`
├── public/                # Static assets (favicons, fonts, raw files)
│   └── images/            # Optimized blog images and media assets
├── scripts/               # Data pipelines, database tooling, and audits
├── src/
│   ├── components/        # Custom interactive UI components
│   │   ├── IsnadDiagram.astro
│   │   ├── HifzGame.astro
│   │   ├── ReportCard.astro
│   │   └── ...
│   ├── content/articles/  # The core blog posts authored in MDX format
│   ├── data/              # Generated JSON data used across the site
│   ├── layouts/           # Site-wide structural layouts
│   ├── lib/               # Shared utilities
│   ├── pages/             # Astro application routes
│   │   ├── hadith/        # Corpus: browse, search, collection, narration
│   │   ├── narrators/     # Rijāl register and dossiers
│   │   └── api/           # Subscription and admin endpoints only
│   └── styles/            # Global visual system and article-specific styles
```

---

## Getting Started

### Prerequisites

- **Node.js**: Version `>=22.12.0`
- **npm**: Package manager

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/HadithCritic/hadithcriticblog.git
cd hadithcriticblog
npm install
```

*(Note: If you encounter peer dependency conflicts, use `npm install --legacy-peer-deps`)*

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

#### Available Development Commands

| Command                   | Action                                                                                                   |
| :------------------------ | :------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Start the Astro development server at`http://127.0.0.1:4321`                                           |
| `npm run build`         | Build the site to`./dist/` and generate the Pagefind search index                                      |
| `npm run preview`       | Preview the production build locally at`http://127.0.0.1:4321` (required to test search functionality) |
| `npm run validate`      | Full suite: footnote lint, unit tests, Arabic normalization parity, type check, design audit, build      |
| `npm run build:corpus`  | Build, chunk, verify and stage a corpus release from the master database (local only)                    |
| `npm run verify:corpus` | Row counts, chunk integrity and query parity between the distribution and the master                     |
| `npm run publish:corpus`| Upload a built corpus release to R2, where production reads it                                          |
| `npm run build:e2e`     | Build with the corpus on its own byte-serving origin, which the end-to-end run needs                     |
| `npm run test:e2e:corpus` | Both corpus suites, including the assertions about what the real corpus contains                       |

*Search Note*: The Pagefind index is only generated during the build process. To test the full search feature locally, run `npm run build` followed by `npm run preview`.

---

## Scripts & Utilities

The `scripts/` directory contains various Node.js pipelines to maintain the site's data and media:

| Script                                    | Purpose                                                                                          |
| :---------------------------------------- | :----------------------------------------------------------------------------------------------- |
| `test-search.mjs`                       | Runs end-to-end queries against the compiled Pagefind search index to verify search integrity.   |
| `optimize-images.cjs`                   | Automatically converts heavy PNG/JPG files in the`public/` directory to optimized WebP format. |
| `build-quran-data.cjs`                  | Generates Quranic verse JSON data for quick citations within blog articles.                      |
| `convert_to_mdx.cjs`                    | Utility to convert legacy content formats into standardized MDX.                                 |
| `build-corpus.mjs`                      | Runs the four stages below in order. The normal way to cut a corpus release.                     |
| `build-corpus-fixture.mjs`              | Cuts the miniature corpus CI serves out of the real one. Output is committed.                    |
| `corpus-file-server.mjs`                | Serves corpus chunks with real byte ranges, which `astro preview` cannot. Used by the e2e run.  |
| `build-for-e2e.mjs`                     | Builds the site pointed at that server, optionally against the fixture.                          |
| `build-distribution-db.mjs`             | Master to distribution: ANALYZE, VACUUM, integrity check.                                        |
| `chunk-db.mjs`                          | Splits the distribution database into 10 MiB chunks and writes the manifest.                     |
| `build-corpus-meta.mjs`                 | Generates`src/data/corpus-meta.json` and the narrator sitemap ids. Both are committed.          |
| `verify-distribution.mjs`               | Row counts, chunk reassembly and query parity against the master. Fails the release, not the page. |
| `publish-corpus.mjs`                    | Publishes one version to R2, or into`dist/`for a host that serves byte ranges.                 |
| `build-static-db.py`                    | Builds the master database from the seed dumps. Local, occasional, and the only Python here.     |
| `migrate-turso.mjs`, `refresh-stats.mjs`, `verify-corpus.mjs`, `fill-hadith-fts.mjs`, `d1-to-turso.mjs`, `upload-turso.mjs` | The hosted-corpus era. Kept as the record of how the corpus moved; none is part of a current workflow. |
| `seed-narrators-d1.mjs`                 | Turns`data/generated/` into SQL batches for the register.                                      |
| `design-audit.mjs`                      | Enforces the design conventions in DESIGN.md at build time.                                      |

---

## Deployment

The platform deploys to **Cloudflare Workers**.

1. Push changes to the main branch.
2. Cloudflare builds the project (`npm run build`) via the `@astrojs/cloudflare` adapter and the settings in `wrangler.jsonc`.
3. Prerendered pages are served as static assets. `/hadith/[id]` and `/narrators/[id]` run on demand and perform no I/O.
4. The corpus is published separately from the site: `npm run publish:corpus` uploads a release to R2, which is where production reads it from. `PUBLIC_CORPUS_BASE_URL` points the site at it, and a build without it fails rather than falling back to an origin that cannot serve byte ranges.

The corpus needs no credentials: it is public static files. `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` remain as secrets for the article notification ledger alone, which is not the corpus.
