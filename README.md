# HadithCritic

The HadithCritic platform: a blog of source-critical hadith studies plus **Silsilah**, a hadith database covering 19 classical collections (153,000+ reports) with Arabic text, English translation, transmission chains, gradings, and full-text search.

Built with Astro 6, fully static.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies (use `--legacy-peer-deps` if peer conflicts appear) |
| `npm run dev` | Dev server at `localhost:4321` (search is unavailable in dev, see below) |
| `npm run build` | Build to `./dist/` and generate the Pagefind search index |
| `npm run preview` | Preview the built site, including search |
| `npm run author` | Local blog authoring workspace |

## Project structure

```text
/
├── docs/                  Project notes, taxonomy, source material
├── hadith/                Raw TSV exports of the 19 collections (gitignored, ~550 MB)
├── public/                Static assets; silsilah-data/ holds generated reference indexes (gitignored)
├── scripts/               Data pipelines and utilities (see below)
├── src/
│   ├── components/        Site and article components; silsilah/ has database components
│   ├── content/articles/  Blog posts (MDX)
│   ├── data/              Generated JSON: quran verses, silsilah/ book chunks (gitignored)
│   ├── layouts/           BaseLayout (main site), SilsilahLayout (database)
│   ├── lib/               silsilah.ts (build-time data access), silsilah-text.ts (shared text utils)
│   ├── pages/             Routes; silsilah/ holds the database pages
│   └── styles/            Global visual system and article styles
└── tools/                 Blog-maker authoring tool
```

## Silsilah data pipeline

The database pages are generated from TSV exports in `hadith/`:

1. Place or update the `*.tsv` files in `hadith/`.
2. Run `node scripts/build-silsilah-data.cjs`. This writes book chunks to `src/data/silsilah/` and reference indexes to `public/silsilah-data/`.
3. `npm run build` renders ~1,900 database pages and builds the search index (`dist/pagefind/`).

Useful scripts:

| Script | Purpose |
| :-- | :-- |
| `scripts/build-silsilah-data.cjs` | TSV to JSON pipeline for the database |
| `scripts/survey-hadith.cjs` | Statistics over the raw TSVs (coverage, grading, structure) |
| `scripts/inspect-row.cjs` | Print a single TSV row as key:value pairs |
| `scripts/test-search.mjs` | End-to-end queries against the built search index |
| `scripts/optimize-images.cjs` | Convert heavy PNGs in public/ to WebP |
| `scripts/build-quran-data.cjs` | Quran verse JSON for blog citations |

Search note: the Pagefind index only exists after `npm run build`, so the search page reports itself unavailable under `npm run dev`. Use `npm run preview` to test search locally.
