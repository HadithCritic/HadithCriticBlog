#!/usr/bin/env python3
"""Build a licensed Corpus Coranicum-only Quran SQLite release."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
TABLE_ORDER = [
    "source_snapshot", "source_artifact", "source_record", "work", "edition",
    "reading_tradition", "transmission_route", "passage", "text_edition",
    "translation_edition", "reading_authority", "source_authority",
    "variant_assertion", "variant_reader_reference", "variant_word", "text_token", "manuscript_witness",
    "witness_observation", "attestation", "concept", "concept_mapping",
    "typed_relationship", "crosswalk", "normalization_profile", "comparison_run",
    "normalized_text", "comparison_result", "review_event",
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def insert_rows(destination: sqlite3.Connection, source: sqlite3.Connection,
                table: str, where: str = "", parameters: tuple = ()) -> int:
    columns = [row[1] for row in source.execute(f"PRAGMA table_info({table})")]
    sql = f"SELECT {', '.join(columns)} FROM {table} {where}"
    rows = source.execute(sql, parameters).fetchall()
    if not rows:
        return 0
    placeholders = ",".join("?" for _ in columns)
    destination.executemany(
        f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})", rows)
    return len(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--staging-db", type=Path, required=True)
    parser.add_argument("--schema", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()
    source = sqlite3.connect(args.staging_db)
    source.row_factory = sqlite3.Row
    args.out_dir.mkdir(parents=True, exist_ok=True)
    release_path = args.out_dir / f"quran-coranicum-{COMMIT[:12]}.sqlite"
    if release_path.exists():
        release_path.unlink()
    destination = sqlite3.connect(release_path)
    destination.row_factory = sqlite3.Row
    destination.execute("PRAGMA foreign_keys=ON")
    destination.executescript("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF; PRAGMA temp_store=MEMORY; PRAGMA cache_size=-100000;")
    destination.executescript(args.schema.read_text(encoding="utf-8"))

    source_ids = {row[0] for row in source.execute("SELECT snapshot_id FROM source_snapshot")}
    legacy_audit_sources = {
        "corpus-coranicum-tei", "nasser-export",
        "shamela-category-5-export", "quran-studies-files",
    }
    if ("corpus-coranicum-tei" not in source_ids
            or source_ids - legacy_audit_sources
            or source_ids not in ({"corpus-coranicum-tei"}, legacy_audit_sources)):
        raise ValueError("staging source snapshot set changed; audit before release")
    source_record_subquery = (
        "SELECT record_id FROM source_record WHERE artifact_id IN "
        "(SELECT artifact_id FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei')")
    where_by_table = {
        "source_snapshot": ("WHERE snapshot_id='corpus-coranicum-tei'", ()),
        "source_artifact": ("WHERE snapshot_id='corpus-coranicum-tei'", ()),
    }
    for table in TABLE_ORDER:
        if table in where_by_table:
            where, parameters = where_by_table[table]
        elif table == "source_record":
            where, parameters = ("WHERE artifact_id IN (SELECT artifact_id FROM source_artifact "
                                 "WHERE snapshot_id='corpus-coranicum-tei')", ())
        elif table == "passage":
            where, parameters = ("WHERE passage_id IN (SELECT passage_id FROM text_edition "
                                 "UNION SELECT passage_id FROM translation_edition "
                                 "UNION SELECT passage_id FROM variant_assertion) ", ())
        elif table in {"normalization_profile"}:
            where, parameters = ("", ())
        elif table == "comparison_run":
            where, parameters = ("WHERE 1=0", ())
        else:
            columns = [row[1] for row in source.execute(f"PRAGMA table_info({table})")]
            if "source_record_id" in columns:
                where, parameters = (f"WHERE source_record_id IN ({source_record_subquery})", ())
            elif table == "variant_word":
                where, parameters = (
                    "WHERE assertion_id IN (SELECT assertion_id FROM variant_assertion "
                    "WHERE source_record_id IN (SELECT record_id FROM source_record WHERE artifact_id "
                    "IN (SELECT artifact_id FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'))) ", ())
            elif table == "text_token":
                where, parameters = (
                    "WHERE text_edition_id IN (SELECT text_edition_id FROM text_edition "
                    "WHERE source_record_id IN (SELECT record_id FROM source_record WHERE artifact_id "
                    "IN (SELECT artifact_id FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'))) ", ())
            elif table == "crosswalk":
                where, parameters = ("WHERE review_state='candidate' AND left_record_id IN "
                                     "(SELECT record_id FROM source_record WHERE artifact_id IN "
                                     "(SELECT artifact_id FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'))", ())
            else:
                where, parameters = ("WHERE 1=0", ())
        insert_rows(destination, source, table, where, parameters)

    destination.executescript("""
      CREATE TABLE data_release_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE VIRTUAL TABLE quran_search USING fts5(
        source_record_id UNINDEXED,
        layer UNINDEXED,
        surface,
        tokenize='unicode61 remove_diacritics 0'
      );
    """)
    destination.executemany(
        "INSERT INTO quran_search (source_record_id, layer, surface) VALUES (?, ?, ?)",
        [(row[0], row[1], row[2]) for row in source.execute(
            "SELECT source_record_id, 'variant', exact_source_text FROM variant_assertion "
            "UNION ALL SELECT source_record_id, 'cairo-text', exact_source_text FROM text_edition "
            "UNION ALL SELECT source_record_id, 'translation', exact_source_text FROM translation_edition")]
    )
    counts = {table: destination.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
              for table in TABLE_ORDER}
    metadata = {
        "release_version": f"0.1.2+cc-{COMMIT[:12]}",
        "schema_version": "3",
        "source_repository": "https://github.com/telota/corpus-coranicum-tei",
        "source_commit": COMMIT,
        "source_license": "CC BY-SA 4.0",
        "attribution": "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg Academy of Sciences and Humanities. https://github.com/telota/corpus-coranicum-tei.",
        "modification_notice": "Parsed TEI into linked source records, text layers, tokens, and candidate locators; source strings retain decoded TEI character data and whitespace.",
        "source_manifest_sha256": source.execute(
            "SELECT source_manifest_sha256 FROM source_snapshot WHERE snapshot_id='corpus-coranicum-tei'").fetchone()[0],
        "public_scope": "Local-only Corpus Coranicum TEI parity artifact; no linked image media copied.",
        "redistribution_state": "local_only_needs_review",
        "translation_redistribution_state": "needs_review",
    }
    destination.executemany("INSERT INTO data_release_metadata VALUES (?, ?)",
                            [(key, json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value))
                             for key, value in metadata.items()])
    destination.commit()
    integrity = destination.execute("PRAGMA integrity_check").fetchone()[0]
    foreign_key_errors = destination.execute("PRAGMA foreign_key_check").fetchall()
    if integrity != "ok" or foreign_key_errors:
        raise RuntimeError(f"release database failed checks: {integrity}; FK errors={len(foreign_key_errors)}")

    manifest = {
        **metadata,
        "artifact": release_path.name,
        "artifact_bytes": release_path.stat().st_size,
        "artifact_sha256": sha256(release_path),
        "counts": counts,
        "search_rows": destination.execute("SELECT COUNT(*) FROM quran_search").fetchone()[0],
        "integrity": integrity,
        "foreign_key_errors": len(foreign_key_errors),
        "source_artifacts": [dict(row) for row in source.execute(
            "SELECT relative_path, sha256, byte_length FROM source_artifact "
            "WHERE snapshot_id='corpus-coranicum-tei' ORDER BY relative_path")],
    }
    (args.out_dir / "release-manifest.local.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"artifact": str(release_path), "bytes": manifest["artifact_bytes"],
                      "sha256": manifest["artifact_sha256"], "counts": counts,
                      "searchRows": manifest["search_rows"], "integrity": integrity,
                      "foreignKeyErrors": len(foreign_key_errors)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
