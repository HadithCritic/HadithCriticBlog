-- Additive corpus structure for source-backed compilation hierarchy,
-- vocalized Arabic, and printed page locators. Existing record IDs and text
-- fields remain unchanged. Per-compilation structure rows are populated by
-- the source-specific enrichment scripts, not inferred by this schema.

ALTER TABLE hadith ADD COLUMN text_ar_diac TEXT;
ALTER TABLE hadith ADD COLUMN matn_ar_diac TEXT;
ALTER TABLE hadith_narrator ADD COLUMN surface_diac TEXT;

CREATE TABLE hadith_edition (
  id INTEGER PRIMARY KEY,
  compilation_id INTEGER NOT NULL REFERENCES hadith_book(id),
  work_title_ar TEXT NOT NULL,
  work_title_en TEXT,
  publisher_ar TEXT NOT NULL,
  publisher_en TEXT,
  publication_place_ar TEXT NOT NULL,
  edition_statement_ar TEXT NOT NULL,
  year_hijri INTEGER NOT NULL,
  year_gregorian INTEGER NOT NULL,
  volume_count INTEGER NOT NULL,
  catalog_url TEXT NOT NULL,
  metadata_language TEXT NOT NULL CHECK (metadata_language = 'ar')
);

-- id is the stable corpus ID of the first report in this numbered Kitāb.
CREATE TABLE hadith_kitab (
  id INTEGER PRIMARY KEY REFERENCES hadith(id),
  compilation_id INTEGER NOT NULL REFERENCES hadith_book(id),
  ordinal INTEGER NOT NULL CHECK (ordinal > 0),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  marker_text_ar TEXT NOT NULL,
  boundary_status TEXT NOT NULL CHECK (boundary_status IN ('explicit_source_marker', 'inferred')),
  title_en_status TEXT NOT NULL CHECK (title_en_status IN ('not_supplied', 'verified', 'unverified')),
  provenance_uri TEXT NOT NULL,
  UNIQUE (compilation_id, ordinal)
);

-- id is the stable corpus ID of the first report carrying this source label.
-- Repeated labels in separate positions remain separate Bāb occurrences.
CREATE TABLE hadith_bab (
  id INTEGER PRIMARY KEY REFERENCES hadith(id),
  kitab_id INTEGER NOT NULL REFERENCES hadith_kitab(id),
  ordinal INTEGER NOT NULL CHECK (ordinal > 0),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  label_status TEXT NOT NULL CHECK (label_status IN ('source_chapter_field', 'generic_source_label')),
  title_en_status TEXT NOT NULL CHECK (title_en_status IN ('legacy_unverified', 'missing')),
  UNIQUE (kitab_id, ordinal),
  UNIQUE (kitab_id, id)
);

-- A NULL bab_id is intentional when the source chapter field repeats the
-- Kitāb heading and no separate Bāb label is present in the reviewed mapping.
CREATE TABLE hadith_structure (
  hadith_id INTEGER PRIMARY KEY REFERENCES hadith(id),
  kitab_id INTEGER NOT NULL REFERENCES hadith_kitab(id),
  bab_id INTEGER,
  assignment_basis TEXT NOT NULL CHECK (assignment_basis IN ('source_chapter_label', 'kitab_title_only')),
  FOREIGN KEY (kitab_id, bab_id) REFERENCES hadith_bab(kitab_id, id)
);

CREATE TABLE hadith_reference (
  hadith_id INTEGER NOT NULL REFERENCES hadith(id),
  reference_ordinal INTEGER NOT NULL CHECK (reference_ordinal > 0),
  edition_id INTEGER NOT NULL REFERENCES hadith_edition(id),
  reference_kind TEXT NOT NULL CHECK (reference_kind = 'printed_page'),
  volume INTEGER NOT NULL CHECK (volume > 0),
  page INTEGER NOT NULL CHECK (page > 0),
  source_marker TEXT NOT NULL,
  source_field TEXT NOT NULL CHECK (source_field = 'hadith_text'),
  PRIMARY KEY (hadith_id, reference_ordinal)
);

CREATE INDEX idx_hadith_structure_kitab ON hadith_structure(kitab_id, hadith_id);
CREATE INDEX idx_hadith_structure_bab ON hadith_structure(bab_id, hadith_id);
CREATE INDEX idx_hadith_bab_kitab_ordinal ON hadith_bab(kitab_id, ordinal);
CREATE INDEX idx_hadith_reference_edition_volume_page
  ON hadith_reference(edition_id, volume, page, hadith_id);
