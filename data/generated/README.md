# Generated build inputs

Written by `npm run build:narrators` from `ifta.db` and the Shamela criticism
parquet, neither of which is in this repository. These files are committed
because a CI runner has no access to those sources.

Nothing here is served. Both directories are inputs to
`scripts/seed-narrators-d1.mjs`, which turns them into the SQL batches that
load the narrator register into the database.

`criticism/` holds the jarh and ta'dil statements for every narrator.

`narrators/` holds the full dossier records, and used to live under
`public/data/narrators/`. It was moved here once nothing read it at runtime:
the register queries `/api/narrators` (see `src/lib/narrator-register.ts`) and
each dossier reads the database directly (see `src/pages/narrators/[id].astro`),
so 61 MB across 471 files was being deployed to the edge on every build for
nothing.

That split is also why the old `public/data/narrators/criticism/` subset
existed — it carried only the narrators that had no prerendered page, because
Workers cap a deployment at 20,000 files and the build had already reached
17,818. Every narrator now has a URL served from the database, so there is no
pageless subset left to serve.
