#!/usr/bin/env python3
"""Apply the additive work/edition/external-source schema to a private store.

Example:
  python scripts/fiqh-compass/migrate_research_store_v2.py \
    --db scratch/fiqh-compass/fiqh-compass-research.sqlite

This migration creates empty extension tables. It deliberately does not infer
authors, works, editions, rights, or passage attribution from Shamela metadata.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


VERSION = "2.0.0"
DESCRIPTION = "Add normalized author/work/manifestation, rights-aware digital access, and external evidence records."


def apply_migration(con: sqlite3.Connection, sql_text: str, applied_utc: str | None = None) -> None:
    required = {"source_record", "profile", "position", "position_evidence"}
    present = {
        row[0]
        for row in con.execute("SELECT name FROM sqlite_master WHERE type='table'")
    }
    missing = required - present
    if missing:
        raise RuntimeError(f"Not a Fiqh Compass v1 research store; missing tables: {sorted(missing)}")

    timestamp = applied_utc or datetime.now(timezone.utc).isoformat(timespec="seconds")
    try:
        con.executescript(
            "BEGIN IMMEDIATE;\n"
            + sql_text
            + "\nINSERT OR IGNORE INTO schema_migration(version, applied_utc, description) VALUES ("
            + "'" + VERSION + "', '" + timestamp.replace("'", "''") + "', '" + DESCRIPTION.replace("'", "''") + "');\n"
            + "COMMIT;"
        )
    except Exception:
        if con.in_transaction:
            con.rollback()
        raise

    integrity = con.execute("PRAGMA integrity_check").fetchone()[0]
    fk_errors = con.execute("PRAGMA foreign_key_check").fetchall()
    if integrity != "ok" or fk_errors:
        raise RuntimeError(f"Post-migration check failed: integrity={integrity}; foreign_key_errors={len(fk_errors)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True, help="Private SQLite store produced from schema-v1")
    parser.add_argument("--schema", type=Path, default=Path("docs/research/fiqh-compass/schema-v2.sql"))
    args = parser.parse_args()
    db_path, schema_path = args.db.resolve(), args.schema.resolve()
    if not db_path.is_file():
        raise FileNotFoundError(db_path)
    if not schema_path.is_file():
        raise FileNotFoundError(schema_path)

    con = sqlite3.connect(db_path)
    con.execute("PRAGMA foreign_keys = ON")
    apply_migration(con, schema_path.read_text(encoding="utf-8"))
    summary = {
        "db": str(db_path),
        "schema_version": VERSION,
        "migration_record": dict(
            zip(
                ["version", "applied_utc", "description"],
                con.execute(
                    "SELECT version, applied_utc, description FROM schema_migration WHERE version=?",
                    (VERSION,),
                ).fetchone(),
            )
        ),
        "extension_counts": {
            table: con.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in (
                "author_entity",
                "work_entity",
                "manifestation",
                "digital_access",
                "acquisition_lead",
                "external_passage",
                "external_translation",
            )
        },
        "integrity": con.execute("PRAGMA integrity_check").fetchone()[0],
        "foreign_key_errors": len(con.execute("PRAGMA foreign_key_check").fetchall()),
    }
    con.close()
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
