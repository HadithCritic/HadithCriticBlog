PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS drafts (
  path TEXT PRIMARY KEY NOT NULL,
  source TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  base_sha TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS draft_revisions (
  path TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  source TEXT NOT NULL,
  base_sha TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  PRIMARY KEY (path, version)
);

CREATE TABLE IF NOT EXISTS studio_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  path TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS draft_revisions_path_created
  ON draft_revisions (path, created_at DESC);
CREATE INDEX IF NOT EXISTS studio_audit_created
  ON studio_audit (created_at DESC);
