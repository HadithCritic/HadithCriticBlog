-- Migration number: 0001 	 2026-08-17T21:28:57.527Z

CREATE TABLE IF NOT EXISTS article_notifications (
  slug TEXT PRIMARY KEY,
  sent_at TEXT NOT NULL
);
