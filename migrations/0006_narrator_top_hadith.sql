-- The handful of narrations each dossier opens with, precomputed.
--
-- A dossier shows a narrator's eight most widely-attested reports, which means
-- "their narrations, ordered by parallel_count". Asked directly that is not a
-- cheap eight rows: there is no index spanning `hadith_narrator.narrator_id`
-- and `hadith.parallel_count`, so SQLite gathers every narration the person
-- appears in and sorts the lot to take eight off the top. For ʿĀʾishah, with
-- 16,511 of them, that measured 66,853 rows read and 735 ms — about 80% of the
-- cost of the whole page, and the page a reader lands on after clicking any
-- name in an isnad.
--
-- Ordering by `hadith_id` instead is 24 rows, and was rejected: it answers a
-- different question. "The first eight by internal id" is an accident of
-- import order, while "the most paralleled eight" is the thing that tells a
-- reader whether this transmitter carried widely-corroborated material or
-- singular reports. The number is worth keeping and worth not recomputing.
--
-- So it is stored. Derived, never authored: rebuilt by
-- scripts/refresh-stats.mjs from the same ORDER BY the page used to run, and
-- dropping it loses nothing.

DROP TABLE IF EXISTS narrator_top_hadith;

CREATE TABLE narrator_top_hadith (
  narrator_id INTEGER NOT NULL,
  ord         INTEGER NOT NULL,   -- 0-based rank, most paralleled first
  hadith_id   INTEGER NOT NULL,
  PRIMARY KEY (narrator_id, ord)
);
