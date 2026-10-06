-- Additive extension to schema-v1.sql for independently identified authors,
-- works, editions/manuscripts, digital manifestations, and external passages.
-- Apply with scripts/fiqh-compass/migrate_schema_v2.py. No source identities or
-- doctrinal claims are populated by this migration.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migration (
  version TEXT PRIMARY KEY,
  applied_utc TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS author_entity (
  author_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  display_name_ar TEXT,
  identity_status TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (identity_status IN ('unresolved', 'candidate', 'verified', 'disputed', 'rejected')),
  authority_uri TEXT,
  date_claims_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS work_entity (
  work_id TEXT PRIMARY KEY,
  title TEXT,
  title_ar TEXT,
  identity_status TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (identity_status IN ('unresolved', 'candidate', 'verified', 'disputed', 'rejected')),
  identity_notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS work_contributor (
  work_id TEXT NOT NULL REFERENCES work_entity(work_id),
  author_id TEXT NOT NULL REFERENCES author_entity(author_id),
  role TEXT NOT NULL CHECK (role IN ('author', 'compiler', 'editor', 'commentator', 'translator', 'attributed_author', 'other')),
  attribution_status TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (attribution_status IN ('unresolved', 'candidate', 'verified', 'disputed', 'rejected')),
  evidence_uri TEXT,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (work_id, author_id, role)
);

-- A manifestation may be a printed edition, manuscript witness, or digital
-- publication. This avoids treating a Shamela record, edition, and scan as the
-- same object. Null work links are allowed while identification is unresolved.
CREATE TABLE IF NOT EXISTS manifestation (
  manifestation_id TEXT PRIMARY KEY,
  work_id TEXT REFERENCES work_entity(work_id),
  manifestation_type TEXT NOT NULL
    CHECK (manifestation_type IN ('printed_edition', 'manuscript_witness', 'digital_transcription', 'web_publication', 'other')),
  title TEXT,
  title_ar TEXT,
  edition_statement TEXT,
  editors TEXT,
  publisher TEXT,
  publication_place TEXT,
  publication_date_raw TEXT,
  shelfmark TEXT,
  copy_date_raw TEXT,
  locator_system TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (locator_system IN ('printed_pages', 'digital_pages', 'folios', 'sections', 'web_anchors', 'mixed', 'unresolved')),
  identity_status TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (identity_status IN ('unresolved', 'candidate', 'verified', 'disputed', 'rejected')),
  metadata_source_uri TEXT,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS digital_access (
  access_id TEXT PRIMARY KEY,
  manifestation_id TEXT REFERENCES manifestation(manifestation_id),
  provider TEXT NOT NULL,
  stable_uri TEXT NOT NULL,
  media_type TEXT,
  sha256 TEXT,
  byte_size INTEGER CHECK (byte_size IS NULL OR byte_size >= 0),
  accessed_utc TEXT,
  manifestation_match_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (manifestation_match_status IN ('unverified', 'candidate_match', 'collated_match', 'mismatch', 'unknown')),
  rights_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (rights_status IN ('cleared', 'needs_review', 'restricted', 'unknown')),
  rights_claim TEXT NOT NULL DEFAULT '',
  rights_basis TEXT NOT NULL DEFAULT 'unknown'
    CHECK (rights_basis IN ('license', 'public_domain_claim', 'provider_notice', 'permission', 'statutory_exception', 'unknown')),
  rights_source_uri TEXT,
  rights_review_uri TEXT,
  rights_notes TEXT NOT NULL DEFAULT '',
  CHECK (rights_status != 'cleared' OR rights_review_uri IS NOT NULL)
);

-- Links from the legacy Shamela-oriented source rows remain qualified. A
-- metadata match is not an edition or author identity assertion.
CREATE TABLE IF NOT EXISTS source_work_link (
  source_id TEXT NOT NULL REFERENCES source_record(source_id),
  work_id TEXT NOT NULL REFERENCES work_entity(work_id),
  link_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (link_status IN ('candidate', 'metadata_only', 'verified', 'disputed', 'rejected')),
  evidence_uri TEXT,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (source_id, work_id)
);

CREATE TABLE IF NOT EXISTS source_manifestation_link (
  source_id TEXT NOT NULL REFERENCES source_record(source_id),
  manifestation_id TEXT NOT NULL REFERENCES manifestation(manifestation_id),
  link_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (link_status IN ('candidate', 'metadata_only', 'verified', 'disputed', 'rejected')),
  evidence_uri TEXT,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (source_id, manifestation_id)
);

CREATE TABLE IF NOT EXISTS profile_manifestation (
  profile_id TEXT NOT NULL REFERENCES profile(profile_id),
  manifestation_id TEXT NOT NULL REFERENCES manifestation(manifestation_id),
  role TEXT NOT NULL CHECK (role IN ('direct_work', 'commentary', 'comparative_source', 'manuscript_witness', 'other')),
  link_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (link_status IN ('candidate', 'verified', 'disputed', 'rejected')),
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (profile_id, manifestation_id, role)
);

CREATE TABLE IF NOT EXISTS acquisition_lead (
  queue_id TEXT PRIMARY KEY,
  priority INTEGER NOT NULL CHECK (priority >= 1),
  tradition_label TEXT NOT NULL,
  work_id TEXT REFERENCES work_entity(work_id),
  queue_status TEXT NOT NULL DEFAULT 'open'
    CHECK (queue_status IN ('open', 'metadata_checked', 'source_acquired', 'review_pending', 'closed', 'deferred')),
  rights_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (rights_status IN ('cleared', 'needs_review', 'restricted', 'unknown', 'not_assessed')),
  source_note TEXT NOT NULL DEFAULT '',
  next_action TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS acquisition_lead_manifestation (
  queue_id TEXT NOT NULL REFERENCES acquisition_lead(queue_id),
  manifestation_id TEXT NOT NULL REFERENCES manifestation(manifestation_id),
  relation_note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (queue_id, manifestation_id)
);

CREATE TABLE IF NOT EXISTS acquisition_lead_access (
  queue_id TEXT NOT NULL REFERENCES acquisition_lead(queue_id),
  access_id TEXT NOT NULL REFERENCES digital_access(access_id),
  access_role TEXT NOT NULL DEFAULT 'discovery'
    CHECK (access_role IN ('catalogue_record', 'digitized_source', 'searchable_text', 'rights_record', 'discovery')),
  PRIMARY KEY (queue_id, access_id)
);

CREATE TABLE IF NOT EXISTS external_passage (
  passage_id TEXT PRIMARY KEY,
  manifestation_id TEXT NOT NULL REFERENCES manifestation(manifestation_id),
  access_id TEXT REFERENCES digital_access(access_id),
  author_id TEXT REFERENCES author_entity(author_id),
  locator_system TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (locator_system IN ('printed_pages', 'digital_pages', 'folios', 'sections', 'web_anchors', 'mixed', 'unresolved')),
  printed_volume TEXT,
  printed_page TEXT,
  digital_volume TEXT,
  digital_page TEXT,
  folio TEXT,
  section_locator TEXT,
  web_anchor TEXT,
  arabic_verbatim TEXT NOT NULL,
  source_text_sha256 TEXT NOT NULL,
  context_before_ar TEXT NOT NULL DEFAULT '',
  context_after_ar TEXT NOT NULL DEFAULT '',
  attribution_type TEXT NOT NULL DEFAULT 'unresolved'
    CHECK (attribution_type IN ('author_statement', 'author_argument', 'quoted_authority', 'represented_opponent', 'later_attribution', 'editor_or_translator', 'editorial_inference', 'unresolved')),
  extraction_status TEXT NOT NULL DEFAULT 'machine_candidate'
    CHECK (extraction_status IN ('machine_candidate', 'context_checked', 'text_verified_against_scan', 'rejected')),
  rights_status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (rights_status IN ('cleared', 'needs_review', 'restricted', 'unknown')),
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS external_translation (
  passage_id TEXT NOT NULL REFERENCES external_passage(passage_id),
  language TEXT NOT NULL,
  translation TEXT NOT NULL,
  translator TEXT NOT NULL,
  translation_status TEXT NOT NULL DEFAULT 'working_draft'
    CHECK (translation_status IN ('working_draft', 'bilingual_review', 'approved', 'rejected')),
  notes TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (passage_id, language)
);

CREATE TABLE IF NOT EXISTS position_external_evidence (
  position_id TEXT NOT NULL REFERENCES position(position_id),
  passage_id TEXT NOT NULL REFERENCES external_passage(passage_id),
  support_type TEXT NOT NULL
    CHECK (support_type IN ('full', 'partial', 'contradicts', 'context_only', 'attribution_only', 'unreviewed')),
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (position_id, passage_id)
);

CREATE TABLE IF NOT EXISTS question_external_evidence (
  question_id TEXT NOT NULL,
  passage_id TEXT NOT NULL REFERENCES external_passage(passage_id),
  relevance_status TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (relevance_status IN ('unreviewed', 'relevant', 'partial', 'contrary', 'irrelevant')),
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (question_id, passage_id)
);

CREATE INDEX IF NOT EXISTS idx_manifestation_work ON manifestation(work_id);
CREATE INDEX IF NOT EXISTS idx_digital_access_manifestation ON digital_access(manifestation_id);
CREATE INDEX IF NOT EXISTS idx_external_passage_manifestation ON external_passage(manifestation_id);
CREATE INDEX IF NOT EXISTS idx_external_passage_author ON external_passage(author_id);
CREATE INDEX IF NOT EXISTS idx_position_external_passage ON position_external_evidence(passage_id);
