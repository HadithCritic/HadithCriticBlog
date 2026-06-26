<p align="center">
  <img src="docs/hadithcritic-blog-banner-ink.svg" alt="HadithCritic Blog Repository" width="100%" />
</p>

# HadithCritic Blog

The [HadithCritic platform](https://hadithcriticblog.com) is a blog of source-critical hadith studies plus three live projects:

- **Silsilah** (`/silsilah/`): a hadith database covering 19 classical collections (153,000+ reports) with Arabic text, English translation, transmission chains, gradings, and full-text search.
- **Common-Link Studies** (`/studies/`): published isnad scholarship retold with animated transmission diagrams, linking to the original works.
- **Narrator Biographies** (`/rijal/`): a searchable register of 8,000+ transmitters of the six books, parsed from Dhahabi's al-Kashif (OpenITI edition).
- **Corpus Mapping** (`/corpus-map/`): an animated map that traces any report's chain city by city, from the Prophet in Medina to its compiler, using geographic nisbas and a gazetteer of well-known transmitters.

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
| `scripts/build-rijal-data.cjs` | Parse al-Kashif (OpenITI) into the narrator register (expects the mARkdown file at the path set inside the script) |
| `scripts/build-corpus-map-data.cjs` | Derive city journeys for every chain (nisba lexicon + transmitter gazetteer) into public/corpus-data/ |

Search note: the Pagefind index only exists after `npm run build`, so the search page reports itself unavailable under `npm run dev`. Use `npm run preview` to test search locally.
