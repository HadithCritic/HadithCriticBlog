-- Quran research data schema v3. Source-native facts remain separate from
-- curator interpretations and computed comparisons.
PRAGMA foreign_keys = ON;

CREATE TABLE source_snapshot (
  snapshot_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  origin_uri TEXT,
  source_version TEXT,
  source_commit TEXT,
  license_expression TEXT,
  attribution TEXT,
  rights_state TEXT NOT NULL CHECK (rights_state IN ('identified', 'needs_review', 'restricted')),
  acquired_at TEXT,
  parser_name TEXT,
  parser_version TEXT,
  source_manifest_sha256 TEXT
);

CREATE TABLE source_artifact (
  artifact_id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES source_snapshot(snapshot_id),
  relative_path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  byte_length INTEGER NOT NULL CHECK (byte_length >= 0),
  media_type TEXT,
  redistribution_state TEXT NOT NULL CHECK (redistribution_state IN ('allowed', 'link_only', 'quarantined')),
  UNIQUE (snapshot_id, relative_path)
);

CREATE TABLE source_record (
  record_id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES source_artifact(artifact_id),
  native_id TEXT,
  record_type TEXT NOT NULL,
  locator TEXT,
  raw_fields_json TEXT NOT NULL,
  parse_state TEXT NOT NULL CHECK (parse_state IN ('parsed', 'needs_review', 'quarantined', 'parse_error'))
);

CREATE TABLE work (
  work_id TEXT PRIMARY KEY,
  source_record_id TEXT REFERENCES source_record(record_id),
  native_id TEXT,
  exact_title TEXT,
  exact_creator_label TEXT,
  language_tag TEXT,
  work_metadata_json TEXT NOT NULL
);

CREATE TABLE edition (
  edition_id TEXT PRIMARY KEY,
  work_id TEXT REFERENCES work(work_id),
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  exact_edition_statement TEXT,
  publisher_label TEXT,
  publication_date_text TEXT,
  edition_metadata_json TEXT NOT NULL
);

CREATE TABLE reading_tradition (
  reading_tradition_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  native_id TEXT,
  exact_label TEXT NOT NULL,
  exact_metadata_json TEXT NOT NULL
);

CREATE TABLE transmission_route (
  transmission_route_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  native_id TEXT,
  reading_tradition_id TEXT REFERENCES reading_tradition(reading_tradition_id),
  exact_label TEXT,
  exact_metadata_json TEXT NOT NULL
);

CREATE TABLE passage (
  passage_id TEXT PRIMARY KEY,
  numbering_system TEXT NOT NULL,
  surah_number INTEGER,
  verse_number INTEGER,
  source_native_locator TEXT,
  UNIQUE (numbering_system, source_native_locator)
);

CREATE TABLE text_edition (
  text_edition_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  edition_id TEXT REFERENCES edition(edition_id),
  passage_id TEXT REFERENCES passage(passage_id),
  language_tag TEXT,
  edition_label TEXT,
  exact_source_text TEXT NOT NULL,
  extraction_profile TEXT NOT NULL,
  rights_state TEXT NOT NULL CHECK (rights_state IN ('identified', 'needs_review', 'restricted'))
);

CREATE TABLE translation_edition (
  translation_edition_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  edition_id TEXT REFERENCES edition(edition_id),
  passage_id TEXT REFERENCES passage(passage_id),
  language_tag TEXT,
  translator_label TEXT,
  edition_label TEXT,
  exact_source_text TEXT NOT NULL,
  extraction_profile TEXT NOT NULL,
  rights_state TEXT NOT NULL CHECK (rights_state IN ('identified', 'needs_review', 'restricted'))
);

CREATE TABLE reading_authority (
  authority_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  authority_kind TEXT NOT NULL,
  native_key TEXT,
  exact_label TEXT NOT NULL,
  exact_payload_json TEXT NOT NULL
);

CREATE TABLE source_authority (
  authority_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  native_key TEXT,
  exact_label TEXT,
  exact_payload_json TEXT NOT NULL
);

CREATE TABLE variant_assertion (
  assertion_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  native_id TEXT,
  passage_id TEXT REFERENCES passage(passage_id),
  reading_tradition_id TEXT REFERENCES reading_tradition(reading_tradition_id),
  transmission_route_id TEXT REFERENCES transmission_route(transmission_route_id),
  reader_native_key TEXT,
  source_native_key TEXT,
  reader_authority_id TEXT REFERENCES reading_authority(authority_id),
  source_authority_id TEXT REFERENCES source_authority(authority_id),
  source_native_category TEXT,
  exact_source_text TEXT NOT NULL,
  extraction_profile TEXT NOT NULL
);

CREATE TABLE variant_reader_reference (
  assertion_id TEXT NOT NULL REFERENCES variant_assertion(assertion_id),
  ordinal INTEGER NOT NULL,
  source_record_id TEXT NOT NULL UNIQUE REFERENCES source_record(record_id),
  reader_native_key TEXT,
  reader_authority_id TEXT REFERENCES reading_authority(authority_id),
  exact_source_label TEXT NOT NULL,
  PRIMARY KEY (assertion_id, ordinal)
);

CREATE TABLE variant_word (
  assertion_id TEXT NOT NULL REFERENCES variant_assertion(assertion_id),
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  ordinal INTEGER NOT NULL,
  source_native_locator TEXT,
  exact_source_text TEXT NOT NULL,
  PRIMARY KEY (assertion_id, ordinal)
);

CREATE TABLE text_token (
  text_token_id TEXT PRIMARY KEY,
  text_edition_id TEXT NOT NULL REFERENCES text_edition(text_edition_id),
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  ordinal INTEGER NOT NULL,
  source_native_locator TEXT,
  exact_source_text TEXT NOT NULL,
  segmentation_source TEXT NOT NULL
);

CREATE TABLE normalized_text (
  normalized_text_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  text_token_id TEXT REFERENCES text_token(text_token_id),
  text_edition_id TEXT REFERENCES text_edition(text_edition_id),
  profile_id TEXT NOT NULL REFERENCES normalization_profile(profile_id),
  normalized_value TEXT NOT NULL,
  input_sha256 TEXT NOT NULL
);

CREATE TABLE manuscript_witness (
  witness_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  native_id TEXT,
  exact_metadata_json TEXT NOT NULL
);

CREATE TABLE witness_observation (
  observation_id TEXT PRIMARY KEY,
  witness_id TEXT NOT NULL REFERENCES manuscript_witness(witness_id),
  passage_id TEXT REFERENCES passage(passage_id),
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  folio_locator TEXT,
  transcription_layer TEXT,
  exact_observation_text TEXT,
  image_uri TEXT,
  image_rights_state TEXT NOT NULL CHECK (image_rights_state IN ('unknown', 'identified', 'restricted'))
);

CREATE TABLE attestation (
  attestation_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  target_record_id TEXT,
  locator TEXT,
  evidence_kind TEXT NOT NULL,
  exact_citation_text TEXT
);

CREATE TABLE concept (
  concept_id TEXT PRIMARY KEY,
  vocabulary TEXT NOT NULL,
  preferred_label TEXT NOT NULL,
  definition TEXT,
  vocabulary_version TEXT
);

CREATE TABLE concept_mapping (
  mapping_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  concept_id TEXT NOT NULL REFERENCES concept(concept_id),
  exact_source_term TEXT NOT NULL,
  mapping_method TEXT NOT NULL,
  review_state TEXT NOT NULL CHECK (review_state IN ('candidate', 'reviewed', 'rejected')),
  reviewer TEXT,
  evidence TEXT
);

CREATE TABLE typed_relationship (
  relationship_id TEXT PRIMARY KEY,
  subject_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  predicate TEXT NOT NULL,
  object_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  evidence_source_record_id TEXT REFERENCES source_record(record_id),
  relationship_state TEXT NOT NULL CHECK (relationship_state IN ('source_reported', 'observed', 'curated_candidate', 'reviewed')),
  evidence TEXT
);

CREATE TABLE crosswalk (
  crosswalk_id TEXT PRIMARY KEY,
  left_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  right_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  match_method TEXT NOT NULL,
  evidence TEXT,
  review_state TEXT NOT NULL CHECK (review_state IN ('candidate', 'reviewed', 'rejected')),
  reviewer TEXT,
  reviewed_at TEXT
);

CREATE TABLE normalization_profile (
  profile_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  operations_json TEXT NOT NULL,
  UNIQUE (name, version)
);

CREATE TABLE comparison_run (
  comparison_id TEXT PRIMARY KEY,
  input_edition_ids_json TEXT NOT NULL,
  selection_json TEXT NOT NULL,
  profile_id TEXT REFERENCES normalization_profile(profile_id),
  algorithm_name TEXT NOT NULL,
  algorithm_version TEXT NOT NULL,
  result_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE comparison_result (
  comparison_result_id TEXT PRIMARY KEY,
  comparison_id TEXT NOT NULL REFERENCES comparison_run(comparison_id),
  ordinal INTEGER NOT NULL,
  left_record_id TEXT REFERENCES source_record(record_id),
  right_record_id TEXT REFERENCES source_record(record_id),
  result_json TEXT NOT NULL,
  UNIQUE (comparison_id, ordinal)
);

CREATE TABLE review_event (
  review_event_id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_record(record_id),
  reviewer TEXT,
  reviewed_at TEXT NOT NULL,
  action TEXT NOT NULL,
  evidence TEXT,
  outcome TEXT NOT NULL,
  notes TEXT
);

CREATE INDEX idx_source_record_native ON source_record(native_id);
CREATE INDEX idx_source_record_locator ON source_record(locator);
CREATE INDEX idx_variant_assertion_source ON variant_assertion(source_record_id);
CREATE INDEX idx_variant_word_locator ON variant_word(source_native_locator);
CREATE INDEX idx_variant_word_record ON variant_word(source_record_id);
CREATE INDEX idx_text_token_locator ON text_token(source_native_locator);
CREATE INDEX idx_text_token_record ON text_token(source_record_id);
CREATE INDEX idx_crosswalk_state ON crosswalk(review_state);
CREATE INDEX idx_normalized_text_profile ON normalized_text(profile_id);
CREATE INDEX idx_comparison_result_run ON comparison_result(comparison_id, ordinal);

CREATE TRIGGER review_event_no_update
BEFORE UPDATE ON review_event BEGIN
  SELECT RAISE(ABORT, 'review events are append-only');
END;
CREATE TRIGGER review_event_no_delete
BEFORE DELETE ON review_event BEGIN
  SELECT RAISE(ABORT, 'review events are append-only');
END;
