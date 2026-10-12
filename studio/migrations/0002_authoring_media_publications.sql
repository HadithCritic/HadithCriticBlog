ALTER TABLE drafts ADD COLUMN editor_json TEXT;
ALTER TABLE drafts ADD COLUMN save_id TEXT;
ALTER TABLE drafts ADD COLUMN archived_at TEXT;
ALTER TABLE draft_revisions ADD COLUMN editor_json TEXT;
ALTER TABLE draft_revisions ADD COLUMN archived_at TEXT;
CREATE TABLE media (
  id TEXT PRIMARY KEY, path TEXT NOT NULL, object_key TEXT NOT NULL UNIQUE,
  mime TEXT NOT NULL, bytes INTEGER NOT NULL, alt TEXT NOT NULL,
  created_at TEXT NOT NULL, deleted_at TEXT,
  parent_id TEXT REFERENCES media(id), width INTEGER
);
CREATE INDEX media_parent ON media(parent_id);
CREATE TABLE publication_jobs (
  id TEXT PRIMARY KEY, path TEXT NOT NULL, version INTEGER NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('publish','unpublish','rollback')),
  status TEXT NOT NULL DEFAULT 'prepared', source TEXT NOT NULL,
  expected_head TEXT NOT NULL, expected_blob TEXT NOT NULL,
  commit_sha TEXT, published_blob TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE UNIQUE INDEX publication_active_path ON publication_jobs(path)
  WHERE status IN ('prepared','committing','uncertain');
CREATE TABLE mutation_limits (actor TEXT PRIMARY KEY, window INTEGER NOT NULL, requests INTEGER NOT NULL);
