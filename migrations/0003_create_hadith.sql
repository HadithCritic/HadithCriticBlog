-- The hadith corpus, joined to the rijal register already in D1.
--
-- Why this lands here rather than as another static asset: the corpus is
-- 276,347 narrations across 33 collections. The narrator register already
-- learned this lesson — Workers caps a deployment at 20,000 files, so pages
-- have to come out of a database, not off disk.
--
-- Identity: `hadith_narrator.narrator_id` and `hadith_chain.narrator_id` are
-- the same integers as `narrator.id`. Verified on all 20,950 shared rows: the
-- Arabic names agree 100%. No crosswalk table is needed, and none should be
-- introduced — joins go straight across.
--
-- Deliberately absent: any authenticity grading. The source carries no
-- sahih/da'if ruling and none is inferred here. A grade is a conclusion, and
-- shipping conclusions as data forecloses the inquiry this archive exists to
-- support. Narrator-level rijal opinion stays where it belongs, on `narrator`,
-- reported as what a critic said rather than as a property of the text.

DROP TABLE IF EXISTS hadith_fts;
DROP TABLE IF EXISTS hadith_gloss;
DROP TABLE IF EXISTS hadith_subject;
DROP TABLE IF EXISTS hadith_chain;
DROP TABLE IF EXISTS hadith_narrator;
DROP TABLE IF EXISTS hadith;
DROP TABLE IF EXISTS hadith_book;
DROP TABLE IF EXISTS narrator_alias;

-- The 33 collections.
CREATE TABLE hadith_book (
  id           INTEGER PRIMARY KEY,
  title_ar     TEXT    NOT NULL DEFAULT '',
  title_en     TEXT    NOT NULL DEFAULT '',
  slug         TEXT    NOT NULL DEFAULT '',
  hadith_count INTEGER NOT NULL DEFAULT 0
);

-- One narration. `matn` is the prophetic core with the chain stripped; it is
-- present on 94% of rows and is what matn-comparison work actually reads.
-- `text` is the whole report including its isnad.
CREATE TABLE hadith (
  id            INTEGER PRIMARY KEY,      -- ifta main_id, stable across releases
  book_id       INTEGER NOT NULL,
  hadith_num    TEXT    NOT NULL DEFAULT '',
  chapter_ar    TEXT    NOT NULL DEFAULT '',
  chapter_en    TEXT    NOT NULL DEFAULT '',
  matn_ar       TEXT,
  matn_en       TEXT,
  text_ar       TEXT    NOT NULL DEFAULT '',
  text_en       TEXT    NOT NULL DEFAULT '',
  path_count    INTEGER NOT NULL DEFAULT 0,   -- parallel isnads recorded
  narrator_count INTEGER NOT NULL DEFAULT 0,
  -- Precomputed so a detail page can report the size of the parallel tradition
  -- without shipping the 34.9M-row cross-reference table into D1.
  parallel_count INTEGER NOT NULL DEFAULT 0,
  witness_count  INTEGER NOT NULL DEFAULT 0,
  variant_count  INTEGER NOT NULL DEFAULT 0
);

-- Who is named in the report, in the order they appear. This is the join that
-- makes "every hadith this narrator transmitted" a single indexed lookup.
CREATE TABLE hadith_narrator (
  hadith_id   INTEGER NOT NULL,
  pos         INTEGER NOT NULL,
  narrator_id INTEGER,
  surface     TEXT    NOT NULL DEFAULT '',   -- the name as printed here
  PRIMARY KEY (hadith_id, pos)
);

-- The isnad as a graph. `path_idx` separates parallel chains on one report;
-- `pos` runs from the earliest transmitter toward the collector.
CREATE TABLE hadith_chain (
  hadith_id   INTEGER NOT NULL,
  path_idx    INTEGER NOT NULL,
  pos         INTEGER NOT NULL,
  narrator_id INTEGER,
  name        TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (hadith_id, path_idx, pos)
);

CREATE TABLE hadith_subject (
  hadith_id INTEGER NOT NULL,
  label_ar  TEXT    NOT NULL DEFAULT '',
  label_en  TEXT    NOT NULL DEFAULT ''
);

-- Gharib: rare vocabulary glossed by the editors.
CREATE TABLE hadith_gloss (
  hadith_id INTEGER NOT NULL,
  word_ar   TEXT NOT NULL DEFAULT '',
  word_en   TEXT NOT NULL DEFAULT ''
);

-- Attested spellings of each narrator's name, counted. A name in a chain is
-- often not the register's display form, and this is what lets a reader see
-- that "Abu Dawud" and "Abu Dawud al-Sijistani" are one person.
CREATE TABLE narrator_alias (
  narrator_id INTEGER NOT NULL,
  surface     TEXT    NOT NULL,
  surface_norm TEXT   NOT NULL DEFAULT '',
  n_mentions  INTEGER NOT NULL DEFAULT 0,
  n_hadiths   INTEGER NOT NULL DEFAULT 0,
  is_display  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (narrator_id, surface)
);

-- Search. Contentless: FTS keeps only the inverted index and the rowid, and the
-- caller joins back to `hadith`, so the text is not stored twice.
--
-- Two normalisation layers, and both are required. The tokenizer's
-- `remove_diacritics 2` strips tashkil, so an unvowelled query matches vowelled
-- text. It does nothing about orthographic variation, which is why the indexed
-- Arabic is passed through normalizeArabic() first: without that fold, a search
-- for عائشة misses every copy spelled عايشة — about half the corpus.
-- The same function must run on the query. See src/lib/arabic-normalize.ts.
CREATE VIRTUAL TABLE hadith_fts USING fts5(
  ar_text,
  ar_matn,
  en_text,
  en_matn,
  chapter_en,
  content='',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE INDEX idx_hadith_book        ON hadith (book_id, id);
CREATE INDEX idx_hadith_num         ON hadith (book_id, hadith_num);
CREATE INDEX idx_hn_narrator        ON hadith_narrator (narrator_id, hadith_id);
CREATE INDEX idx_hn_hadith          ON hadith_narrator (hadith_id, pos);
CREATE INDEX idx_hc_narrator        ON hadith_chain (narrator_id, hadith_id);
CREATE INDEX idx_hc_hadith          ON hadith_chain (hadith_id, path_idx, pos);
CREATE INDEX idx_hs_hadith          ON hadith_subject (hadith_id);
CREATE INDEX idx_hs_label           ON hadith_subject (label_en);
CREATE INDEX idx_hg_hadith          ON hadith_gloss (hadith_id);
CREATE INDEX idx_alias_narrator     ON narrator_alias (narrator_id, n_mentions DESC);
CREATE INDEX idx_alias_norm         ON narrator_alias (surface_norm);
