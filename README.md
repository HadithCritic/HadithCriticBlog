<p align="center">
  <img src="docs/hadithcritic-blog-banner-ink.svg" alt="HadithCritic Blog Repository" width="100%" />
</p>

# HadithCritic Blog

The **[HadithCritic platform](https://hadithcriticblog.com)** is a specialized blog dedicated to source-critical hadith studies. This repository serves as the core engine for the platform, housing all published articles, custom interactive UI components, media assets, and a bespoke authoring environment.

Designed for high performance, readability, and rich interactivity, the blog blends scholarship with modern web technologies to present complex transmissions, isnad diagrams, and textual analysis in an accessible format.

---

## Features

- **Hadith collections**: early compilations in facing Arabic and English, each built from editable HTML in `src/data/hadith-pages/`, with no authenticity gradings stored or shown. Under `/hadith`.
- **Articles**: statically generated MDX with custom components like `IsnadDiagram`, `IsnadDilemmaVisual` and `HifzGame` embedded directly into the prose.
- **Search**: [Pagefind](https://pagefind.app/) over the articles, client-side and built at deploy time.
- **No client hydration**: not one `client:*` directive. Every page is HTML with hand-written vanilla `<script>` where needed.

---

## Tech Stack & Architecture

- **Framework**: [Astro 7](https://astro.build). Every page is prerendered; only `/api/subscribe` runs on demand.
- **Content Formatting**: MDX (`@astrojs/mdx`)
- **Search**: [Pagefind](https://pagefind.app/) for articles
- **Deployment**: **Cloudflare Workers** via the `@astrojs/cloudflare` adapter and `wrangler.jsonc`.

### Where the docs are

| File                                                              | What it answers                                                                                                            |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **[DESIGN.md](DESIGN.md)**                                   | The authority on anything visual. Enforced at build time by`npm run test:design`.                                        |
| **[CLAUDE.md](CLAUDE.md)**, **[AGENTS.md](AGENTS.md)**  | Working notes and the traps that have cost real time.                                                                      |
| **[docs/COMPONENT-GUIDE.md](docs/COMPONENT-GUIDE.md)**       | The MDX components available inside an article.                                                                            |

---

## Repository Structure

```text
/
├── docs/                  # Project notes, taxonomy, and source material
├── public/                # Static assets (favicons, fonts, raw files)
│   └── images/            # Optimized blog images and media assets
├── scripts/               # Data pipelines, database tooling, and audits
│   └── lib/               # Shared helpers for the page builders
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
│   │   ├── hadith/        # The hadith library and its collection pages
│   │   └── api/           # Subscription endpoint only
│   └── styles/            # Global visual system and article-specific styles
└── tests/                 # Playwright suites
```

---

## Getting Started

### Prerequisites

- **Node.js**: version `>=24.0.0`, as `package.json` declares.
- **npm**: package manager

### Installation

Use **npm** for this repository. `package-lock.json` is the lockfile used by local setup, GitHub Actions, and Cloudflare builds. Do not switch package managers or generate a second lockfile; the deployment uses `npm ci` and expects the npm lockfile to stay in sync with `package.json`.

Clone the repository, then move into the repository folder (the folder that contains `package.json`) before running npm commands:

```bash
git clone https://github.com/HadithCritic/hadithcriticblog.git
cd hadithcriticblog
npm ci
```

If you already have a checkout, open a terminal in `HadithCriticBlog` itself. Do not run these commands from its parent folder, such as `C:\Users\Jonathan\Desktop\blogs`; `npm` must be able to find this repository's `package.json` and `package-lock.json` in the current folder.

### Environment and secrets

Nothing is required to run the site locally. `.dev.vars` and `.env.local` are both gitignored; the subscription endpoint reads `RESEND_API_KEY` and `RESEND_SEGMENT_ID` from them.

### Local Development

#### Start the site on Windows

Open PowerShell in the repository folder, `HadithCriticBlog` (the folder containing `package.json`). If starting from the parent folder shown in some IDEs, run:

```powershell
Set-Location .\HadithCriticBlog
```

Then start the site:

```powershell
npm run dev
```

Keep that terminal open. On a first run, Astro may take a minute or more to optimize dependencies; wait for the `Local` address and the `ready` message before opening the site. Visit **http://localhost:4321/**. The npm `dev` script already binds to `127.0.0.1`, so there is no need to add another host option.

To stop the server, focus its terminal and press **Ctrl+C**. Run only one dev server at a time; if port 4321 is already occupied by another copy, stop that copy first. After stopping, start it again from the repository folder with `npm run dev`.

#### Common startup problems

- **`ENOENT` or “package.json not found”**: the terminal is in the wrong folder. Change into `HadithCriticBlog` and try again.
- **`npm` is not recognized**: install Node.js `>=24.0.0` (which includes npm), then close and reopen the terminal.
- **Missing modules or a broken install**: from the repository folder, run `npm ci`, wait for it to finish, then run `npm run dev` again. `npm ci` restores the exact dependencies recorded in `package-lock.json`.
- **Port 4321 is already in use**: stop the other Astro server with Ctrl+C in its terminal, then retry. Do not start a second copy in a different terminal.
- **The browser says it cannot connect**: check that the terminal is still running and has printed the `Local` address; open `http://localhost:4321/` after the ready message.

Do not run `npm install --legacy-peer-deps` as a routine fix. If npm reports a dependency or lockfile error, first run `npm ci` from this repository and keep `package.json` and `package-lock.json` together.

The first visit to a route can take longer while Astro compiles it. Give the terminal time to finish before treating a slow first page load as a site error.

#### Available Development Commands

| Command                                                     | Action                                                                                                   |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                             | Start the Astro development server at`http://127.0.0.1:4321`                                           |
| `npm run build`                                           | Build the site to`./dist/` and generate the Pagefind search index                                      |
| `npm run preview`                                         | Preview the production build locally at`http://127.0.0.1:4321` (required to test search functionality) |
| `npm run check`                                           | Astro and TypeScript type check                                                                          |
| `npm run validate`                                        | Full suite: footnote lint, unit tests, Arabic normalization, type check, design audit, build             |
| `npm run lint:footnotes`                                  | Footnote structure lint across the articles                                                              |
| `npm run test:design`                                     | Enforce the conventions in DESIGN.md                                                                     |
| `npm run test:subscribe`                                  | Unit tests for the subscriber signup integration                                                          |
| `npm run test:normalize`                                  | Arabic normalization and formatting                                                                      |
| `npm run test:e2e`                                        | The full Playwright suite                                                                                |
| `npm run build:e2e`                                       | Build with draft articles included, which the end-to-end run needs                                       |
| `npm run build:og`                                        | Regenerate the Open Graph card images                                                                    |

*Search Note*: The Pagefind index is only generated during the build process. To test the full search feature locally, run `npm run build` followed by `npm run preview`.

---

## Data

The site has no database. Every page is built from files in this repository: the articles in `src/content/articles/`, the hadith collections in `src/data/hadith-pages/`, and the other research data under `src/data/`. Public subscription signup adds contacts to Resend.

---

## Scripts & Utilities

The `scripts/` directory holds the data pipelines and audits.

| Script                                                                                                                                                         | Purpose                                                                                                                                                                       |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build-for-e2e.mjs`                                                                                                                                          | Builds the site with draft articles included, for the end-to-end run.                                                                                                         |
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
2. The single production Workers Build for `main` runs `npm run build`, then `npx wrangler deploy`. It uses the Astro Cloudflare adapter and `wrangler.jsonc`.
3. Prerendered pages are served as static assets.

Runtime secrets `RESEND_API_KEY` and `RESEND_SEGMENT_ID` are used only for subscription signup; the signup endpoint is rate limited by the Worker binding in `wrangler.jsonc`.
