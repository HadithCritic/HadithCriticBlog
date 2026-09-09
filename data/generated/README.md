# Generated build inputs

Written by `npm run build:narrators` from `ifta.db` and the Shamela criticism
parquet, neither of which is in this repository. These files are committed
because the site build reads them and a CI runner has no access to those
sources.

`criticism/` holds the jarh and ta'dil statements for every narrator. It is a
build input only: `src/pages/narrators/[id].astro` reads it to inline the
statements into each dossier page, and it is never served. The subset under
`public/data/narrators/criticism/` is the served copy, and deliberately holds
only the narrators that did not get a page, so the deploy never carries the
same statements twice.
