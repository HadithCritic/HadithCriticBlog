-- Narrator register moved off static assets and into D1.
--
-- Why: Cloudflare Workers caps a deployment at 20,000 files. The static layout
-- was at 17,818 and paid for it three times over — only 8,000 of 20,950
-- narrators got a page, the served criticism was a stripped 7.8 MB subset of a
-- 54 MB set, and the browse view shipped a 5.2 MB index so it could filter in
-- the browser. Rows in a database have no file cost, so all three go away.
--
-- Shape: one narrow row per narrator for the browse view (filter/sort/paginate
-- in SQL), plus two JSON blobs read only when a dossier page renders. Splitting
-- them keeps the browse query scanning a small table instead of dragging ~100 MB
-- of payload through every filter.

DROP TABLE IF EXISTS criticism_statement;
DROP TABLE IF EXISTS narrator_criticism;
DROP TABLE IF EXISTS narrator_detail;
DROP TABLE IF EXISTS narrator;

-- Browse row. Every column here is something the register lists, filters,
-- or sorts by; nothing else belongs in this table.
CREATE TABLE narrator (
  id              INTEGER PRIMARY KEY,
  name_en         TEXT    NOT NULL DEFAULT '',
  name_ar         TEXT    NOT NULL DEFAULT '',
  generation      TEXT    NOT NULL DEFAULT '',
  grade           TEXT    NOT NULL DEFAULT '',
  tabaqa_number   INTEGER,
  death_hijri     INTEGER,
  death_gregorian INTEGER,
  death_place     TEXT    NOT NULL DEFAULT '',
  places_en       TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  hadith_count    INTEGER NOT NULL DEFAULT 0,
  teacher_count   INTEGER NOT NULL DEFAULT 0,
  student_count   INTEGER NOT NULL DEFAULT 0,
  critic_count    INTEGER NOT NULL DEFAULT 0,
  statement_count INTEGER NOT NULL DEFAULT 0,
  jarh_count      INTEGER NOT NULL DEFAULT 0,
  tadil_count     INTEGER NOT NULL DEFAULT 0,
  mixed_count     INTEGER NOT NULL DEFAULT 0,
  unclassified_count INTEGER NOT NULL DEFAULT 0,
  flags           TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  unnamed         INTEGER NOT NULL DEFAULT 0,     -- 1 = unidentified narrator
  -- Lowercased haystack: transliteration, Arabic, an ASCII-folded form of the
  -- transliteration, and the places. One LIKE against this replaces the
  -- multi-field scan the client used to do over the 5.2 MB index.
  search_text     TEXT    NOT NULL DEFAULT ''
);

-- Full dossier record (teachers, students, aliases, books, sample chains).
-- Read only when a single narrator page renders.
CREATE TABLE narrator_detail (
  id      INTEGER PRIMARY KEY,
  payload TEXT NOT NULL
);

-- Criticism apparatus: one row per statement rather than a JSON blob per
-- narrator. Two reasons. A blob hits a hard ceiling — the largest narrator's
-- apparatus is 116 KB and `wrangler d1 execute` refuses a statement over
-- ~100 KB, so it could not be inserted at all. And rows make the apparatus
-- queryable: "every jarh verdict Ibn Hajar issued" is now a WHERE clause
-- instead of a scan through 54 MB of JSON.
--
-- `phenomena` in the source is a tagging view over these same statements, not a
-- separate set, so it collapses into two nullable columns here.
CREATE TABLE criticism_statement (
  narrator_id      INTEGER NOT NULL,
  ord              INTEGER NOT NULL,          -- stable order within a narrator
  critic           TEXT    NOT NULL DEFAULT '',
  text             TEXT    NOT NULL,
  citation         TEXT    NOT NULL DEFAULT '',
  page_id          INTEGER,
  verdict          TEXT    NOT NULL DEFAULT 'unclassified',
  phenomenon_key   TEXT,
  phenomenon_label TEXT,
  PRIMARY KEY (narrator_id, ord)
);

-- Browse filters. Each of these backs a control in the register UI.
CREATE INDEX idx_narrator_generation ON narrator (generation);
CREATE INDEX idx_narrator_grade      ON narrator (grade);
CREATE INDEX idx_narrator_death      ON narrator (death_hijri);
CREATE INDEX idx_narrator_hadith     ON narrator (hadith_count);
CREATE INDEX idx_narrator_name       ON narrator (name_en);
-- Named narrators first is the common default; this keeps that ordering cheap.
CREATE INDEX idx_narrator_unnamed    ON narrator (unnamed, id);

-- The dossier reads every statement for one narrator; the other two support
-- cross-cutting questions the JSON blobs could never answer.
CREATE INDEX idx_criticism_narrator ON criticism_statement (narrator_id, ord);
CREATE INDEX idx_criticism_verdict  ON criticism_statement (verdict);
CREATE INDEX idx_criticism_critic   ON criticism_statement (critic);
