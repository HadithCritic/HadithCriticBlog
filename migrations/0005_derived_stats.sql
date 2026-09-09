-- Totals and facet counts, precomputed.
--
-- Every figure in here was previously recomputed from scratch on every page
-- view, and the aggregates are the most expensive queries the site runs. The
-- register was the worst: `/narrators` counted its 20,915 rows once for
-- pagination and then aggregated them four more times for the filter chips and
-- the header stats. About 105,000 rows read to render a page whose listing is
-- 50 rows, and roughly 4,800 views a month before the row-read allowance is
-- gone.
--
-- What makes it pure waste rather than a trade: the four facet aggregates carry
-- no user filter. They are `WHERE unnamed = 0` and nothing else, so every
-- visitor paid for the identical answer, and paid again on /api/narrator-facets.
--
-- This could not be done on D1. The database was over the free plan's 500 MB
-- limit and refused to create a table at all ("Exceeded maximum DB size"). On
-- Turso there is room, so the numbers are stored once per data refresh and read
-- back in tens of rows instead of a hundred thousand. See DATABASE.md.
--
-- Derived data, never authored: `scripts/refresh-stats.mjs` recomputes both
-- tables with INSERT ... SELECT, inside the database, and
-- `scripts/verify-corpus.mjs` asserts they still agree with the rows they came
-- from. Dropping and rebuilding them loses nothing.

DROP TABLE IF EXISTS corpus_stat;
DROP TABLE IF EXISTS narrator_facet;

-- One row per named total. Key/value rather than columns so a new figure is a
-- refresh rather than a migration.
CREATE TABLE corpus_stat (
  key   TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

-- The register's filter chips: generation, grade, and century of death. `ord`
-- preserves the ordering each facet was displayed in, which differs per kind
-- (counts descending for generation and grade, chronological for century), so
-- the reader gets the same order without the page re-sorting anything.
CREATE TABLE narrator_facet (
  kind  TEXT    NOT NULL,
  value TEXT    NOT NULL,
  n     INTEGER NOT NULL DEFAULT 0,
  ord   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, value)
);

CREATE INDEX idx_narrator_facet_kind ON narrator_facet (kind, ord);
