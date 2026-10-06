-- Research-side evidence store. No content is published from this schema
-- automatically. Unknown and unreviewed values remain null/status-coded.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS dataset_snapshot (
  dataset_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  generated_utc TEXT NOT NULL,
  rights_status TEXT NOT NULL CHECK (rights_status IN ('cleared', 'needs_review', 'restricted', 'unknown')),
  rights_notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS source_record (
  source_id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL REFERENCES dataset_snapshot(dataset_id),
  shamela_book_id TEXT NOT NULL,
  catalog_present INTEGER NOT NULL CHECK (catalog_present IN (0, 1)),
  corpus_present INTEGER NOT NULL CHECK (corpus_present IN (0, 1)),
  title_ar TEXT,
  author_as_catalogued_ar TEXT,
  author_year_raw TEXT,
  editor_raw TEXT,
  publisher_raw TEXT,
  edition_raw TEXT,
  category_raw TEXT,
  corpus_title_values_json TEXT NOT NULL DEFAULT '[]',
  corpus_edition_values_json TEXT NOT NULL DEFAULT '[]',
  corpus_publisher_values_json TEXT NOT NULL DEFAULT '[]',
  corpus_category_values_json TEXT NOT NULL DEFAULT '[]',
  corpus_row_count INTEGER,
  corpus_blank_text_count INTEGER,
  corpus_text_sentinel_count INTEGER,
  corpus_missing_page_count INTEGER,
  corpus_missing_volume_count INTEGER,
  corpus_min_serial INTEGER,
  corpus_max_serial INTEGER,
  identity_status TEXT NOT NULL DEFAULT 'work-versus-edition unresolved',
  edition_review_status TEXT NOT NULL DEFAULT 'unreviewed',
  rights_status TEXT NOT NULL DEFAULT 'needs_review',
  rights_notes TEXT NOT NULL DEFAULT '',
  UNIQUE (dataset_id, shamela_book_id)
);

CREATE TABLE IF NOT EXISTS axis (
  axis_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  low_endpoint TEXT NOT NULL,
  high_endpoint TEXT NOT NULL,
  scope_note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'provisional'
);

CREATE TABLE IF NOT EXISTS issue (
  issue_id TEXT PRIMARY KEY,
  issue_group_id TEXT NOT NULL,
  question TEXT NOT NULL,
  case_definition TEXT,
  scope_notes TEXT NOT NULL DEFAULT '',
  dossier_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (dossier_status IN ('not_started', 'retrieval_in_progress', 'candidate_evidence', 'drafted_unreviewed', 'specialist_review', 'resolved', 'unresolved')),
  dossier_json_path TEXT,
  resolution_note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS issue_axis (
  issue_id TEXT NOT NULL REFERENCES issue(issue_id),
  axis_id TEXT NOT NULL REFERENCES axis(axis_id),
  relationship TEXT NOT NULL DEFAULT 'primary'
    CHECK (relationship IN ('primary', 'secondary')),
  PRIMARY KEY (issue_id, axis_id)
);

CREATE TABLE IF NOT EXISTS passage (
  passage_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES source_record(source_id),
  corpus_serial TEXT NOT NULL,
  corpus_row_key TEXT NOT NULL,
  issue_id TEXT NOT NULL REFERENCES issue(issue_id),
  retrieval_query TEXT NOT NULL,
  retrieval_profile TEXT NOT NULL,
  matched_terms_json TEXT NOT NULL DEFAULT '[]',
  arabic_verbatim TEXT NOT NULL,
  context_before_ar TEXT NOT NULL DEFAULT '',
  context_after_ar TEXT NOT NULL DEFAULT '',
  footnote_verbatim TEXT,
  digital_volume_raw TEXT,
  digital_page_raw TEXT,
  digital_volume TEXT,
  digital_page TEXT,
  printed_volume TEXT,
  printed_page TEXT,
  page_scan_uri TEXT,
  source_text_sha256 TEXT NOT NULL,
  attribution_type TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (attribution_type IN ('author_statement', 'author_argument', 'quoted_authority', 'represented_opponent', 'later_attribution', 'editor_or_translator', 'editorial_inference', 'unresolved')),
  extraction_status TEXT NOT NULL DEFAULT 'machine_candidate'
    CHECK (extraction_status IN ('machine_candidate', 'context_checked', 'text_verified_against_scan', 'rejected')),
  text_quality_notes TEXT NOT NULL DEFAULT '',
  rights_status TEXT NOT NULL DEFAULT 'needs_review',
  UNIQUE (source_id, corpus_row_key, issue_id, retrieval_profile)
);

CREATE TABLE IF NOT EXISTS translation (
  passage_id TEXT NOT NULL REFERENCES passage(passage_id),
  language TEXT NOT NULL,
  translation TEXT NOT NULL,
  translator TEXT NOT NULL,
  translation_status TEXT NOT NULL DEFAULT 'working_draft'
    CHECK (translation_status IN ('working_draft', 'bilingual_review', 'approved', 'rejected')),
  notes TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (passage_id, language)
);

-- A passage row can span a full digital page. Translate only an exact, hashed
-- source span so a short working translation is never mistaken for a full
-- page translation. Character offsets refer to Unicode code points in the
-- preserved arabic_verbatim string.
CREATE TABLE IF NOT EXISTS translation_segment (
  segment_id TEXT PRIMARY KEY,
  passage_id TEXT NOT NULL REFERENCES passage(passage_id),
  source_start_char INTEGER NOT NULL CHECK (source_start_char >= 0),
  source_end_char INTEGER NOT NULL CHECK (source_end_char > source_start_char),
  source_span_sha256 TEXT NOT NULL,
  language TEXT NOT NULL,
  translation TEXT NOT NULL,
  translator TEXT NOT NULL,
  translation_status TEXT NOT NULL DEFAULT 'working_draft'
    CHECK (translation_status IN ('working_draft', 'bilingual_review', 'approved', 'rejected')),
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE (passage_id, language, source_start_char, source_end_char)
);

CREATE TABLE IF NOT EXISTS position (
  position_id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES issue(issue_id),
  holder_label TEXT NOT NULL,
  author_id TEXT,
  period_label TEXT,
  proposition TEXT NOT NULL,
  reasoning TEXT NOT NULL DEFAULT '',
  conditions_json TEXT NOT NULL DEFAULT '[]',
  exceptions_json TEXT NOT NULL DEFAULT '[]',
  domain TEXT,
  attribution_type TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (attribution_type IN ('author_statement', 'author_argument', 'quoted_authority', 'represented_opponent', 'later_attribution', 'editor_or_translator', 'editorial_inference', 'unresolved')),
  epistemic_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (epistemic_status IN ('candidate', 'supported', 'qualified', 'disputed', 'rejected', 'unresolved')),
  method_or_ruling TEXT NOT NULL CHECK (method_or_ruling IN ('method', 'practical_ruling', 'historical_affinity', 'other')),
  profile_score_allowed INTEGER NOT NULL DEFAULT 0 CHECK (profile_score_allowed IN (0, 1)),
  editorial_notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS position_evidence (
  position_id TEXT NOT NULL REFERENCES position(position_id),
  passage_id TEXT NOT NULL REFERENCES passage(passage_id),
  support_type TEXT NOT NULL CHECK (support_type IN ('full', 'partial', 'contradicts', 'context_only', 'attribution_only', 'unreviewed')),
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (position_id, passage_id)
);

CREATE TABLE IF NOT EXISTS profile (
  profile_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  scope TEXT NOT NULL,
  period_label TEXT,
  status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate', 'researching', 'reviewed', 'published', 'retired')),
  tradition_label TEXT,
  representation_notes TEXT NOT NULL DEFAULT '',
  coordinates_status TEXT NOT NULL DEFAULT 'not_computed'
    CHECK (coordinates_status IN ('not_computed', 'provisional', 'reviewed', 'withheld'))
);

CREATE TABLE IF NOT EXISTS profile_source (
  profile_id TEXT NOT NULL REFERENCES profile(profile_id),
  source_id TEXT NOT NULL REFERENCES source_record(source_id),
  role TEXT NOT NULL,
  PRIMARY KEY (profile_id, source_id)
);

CREATE TABLE IF NOT EXISTS profile_position (
  profile_id TEXT NOT NULL REFERENCES profile(profile_id),
  position_id TEXT NOT NULL REFERENCES position(position_id),
  PRIMARY KEY (profile_id, position_id)
);

CREATE TABLE IF NOT EXISTS question_mapping (
  question_id TEXT NOT NULL,
  issue_id TEXT NOT NULL REFERENCES issue(issue_id),
  mapping_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (mapping_status IN ('candidate', 'supported', 'revise', 'no_evidence', 'not_applicable')),
  direction TEXT,
  rationale TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (question_id, issue_id)
);

CREATE TABLE IF NOT EXISTS question_evidence (
  question_id TEXT NOT NULL,
  passage_id TEXT NOT NULL REFERENCES passage(passage_id),
  relevance_status TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (relevance_status IN ('unreviewed', 'relevant', 'partial', 'contrary', 'irrelevant')),
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (question_id, passage_id)
);

CREATE TABLE IF NOT EXISTS review_event (
  review_id TEXT PRIMARY KEY,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  reviewer_role TEXT NOT NULL,
  reviewer_label TEXT NOT NULL,
  reviewed_utc TEXT NOT NULL,
  finding TEXT NOT NULL,
  change_summary TEXT NOT NULL DEFAULT '',
  disagreement_open INTEGER NOT NULL DEFAULT 0 CHECK (disagreement_open IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_passage_issue ON passage(issue_id);
CREATE INDEX IF NOT EXISTS idx_passage_source ON passage(source_id);
CREATE INDEX IF NOT EXISTS idx_translation_segment_passage ON translation_segment(passage_id);
CREATE INDEX IF NOT EXISTS idx_position_issue ON position(issue_id);
CREATE INDEX IF NOT EXISTS idx_profile_source ON profile_source(source_id);
