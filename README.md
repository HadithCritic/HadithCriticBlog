<p align="center">
  <img src="docs/hadithcritic-blog-banner-ink.svg" alt="HadithCritic Blog Repository" width="100%" />
</p>

# HadithCritic Blog

The **[HadithCritic platform](https://hadithcriticblog.com)** is a specialized blog dedicated to source-critical hadith studies. This repository serves as the core engine for the platform, housing all published articles, custom interactive UI components, media assets, and a bespoke authoring environment. 

Designed for high performance, readability, and rich interactivity, the blog blends scholarship with modern web technologies to present complex transmissions, isnad diagrams, and textual analysis in an accessible format.

---

## Features

- **Blazing Fast Performance**: Statically generated (SSG) with Astro for instant page loads.
- **Rich Interactive Components**: Custom components like `IsnadDiagram`, `IsnadDilemmaVisual`, and `HifzGame` embedded directly into articles.
- **MDX Powered Content**: Write content seamlessly using Markdown with embedded JSX components.
- **Integrated Full-Text Search**: Client-side, lightning-fast search powered by [Pagefind](https://pagefind.app/).

---

## Tech Stack & Architecture

- **Framework**: [Astro 6](https://astro.build) (Static Site Generation)
- **Content Formatting**: MDX (`@astrojs/mdx`)
- **Search**: [Pagefind](https://pagefind.app/)
- **Deployment**: Hosted on **Cloudflare Pages** using the `@astrojs/cloudflare` adapter.

---

## Repository Structure

```text
/
├── docs/                  # Project notes, taxonomy, and source material
├── public/                # Static assets (favicons, fonts, raw files)
│   └── images/            # Optimized blog images and media assets
├── scripts/               # Utility scripts for data processing and optimization
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
| `npm run validate` | Run full validation suite (footnote linting, type check, design audit, and build) |

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

---

## Deployment

The platform is configured for seamless deployment to **Cloudflare Pages**.

1. Push changes to the main branch.
2. Cloudflare Pages automatically detects the Astro build configuration via the `@astrojs/cloudflare` adapter.
3. The site is built (`npm run build`) and served globally across Cloudflare's Edge network.
