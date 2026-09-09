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

- **Framework**: [Astro 7](https://astro.build). Articles are prerendered; the corpus and register routes opt into on-demand rendering with `export const prerender = false` because they read a database.
- **Content Formatting**: MDX (`@astrojs/mdx`)
- **Database**: [Turso](https://turso.tech) (libSQL), reached through `src/lib/db.ts`. See **[DATABASE.md](DATABASE.md)** — it is required reading before touching a query, because reads are metered per row.
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
│   │   └── api/           # JSON endpoints backing the register and corpus
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

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start the Astro development server at `http://127.0.0.1:4321` |
| `npm run build` | Build the site to `./dist/` and generate the Pagefind search index |
| `npm run preview` | Preview the production build locally at `http://127.0.0.1:4321` (required to test search functionality) |
| `npm run validate` | Full suite: footnote lint, unit tests, Arabic normalization parity, type check, design audit, build |
| `npm run verify:corpus` | 38 checks against the database — row counts, FTS integrity, Arabic search recall |
| `npm run stats:check` | Report whether the precomputed totals have drifted from the rows |

*Search Note*: The Pagefind index is only generated during the build process. To test the full search feature locally, run `npm run build` followed by `npm run preview`.

---

## Scripts & Utilities

The `scripts/` directory contains various Node.js pipelines to maintain the site's data and media:

| Script | Purpose |
| :--- | :--- |
| `test-search.mjs` | Runs end-to-end queries against the compiled Pagefind search index to verify search integrity. |
| `optimize-images.cjs` | Automatically converts heavy PNG/JPG files in the `public/` directory to optimized WebP format. |
| `build-quran-data.cjs` | Generates Quranic verse JSON data for quick citations within blog articles. |
| `convert_to_mdx.cjs` | Utility to convert legacy content formats into standardized MDX. |
| `migrate-turso.mjs` | Applies `migrations/*.sql` to Turso as one transaction per file. |
| `refresh-stats.mjs` | Recomputes the precomputed totals and facet counts. Run after any import. |
| `verify-corpus.mjs` | Post-import verification: counts, FTS integrity, no truncation, search recall. |
| `fill-hadith-fts.mjs` | Builds the FTS5 index over the corpus, in id ranges. |
| `d1-to-turso.mjs`, `upload-turso.mjs` | The one-off migration off Cloudflare D1. Kept as the record of how the corpus moved. |
| `seed-narrators-d1.mjs` | Turns `data/generated/` into SQL batches for the register. |
| `design-audit.mjs` | Enforces the design conventions in DESIGN.md at build time. |

---

## Deployment

The platform deploys to **Cloudflare Workers**.

1. Push changes to the main branch.
2. Cloudflare builds the project (`npm run build`) via the `@astrojs/cloudflare` adapter and the settings in `wrangler.jsonc`.
3. Prerendered pages are served as static assets; the corpus and register routes run on demand and read Turso.

The database connection is supplied as two secrets, `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, set with `wrangler secret put` and mirrored locally in an untracked `.dev.vars`. Neither is in `wrangler.jsonc`.
