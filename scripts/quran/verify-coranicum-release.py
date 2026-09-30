#!/usr/bin/env python3
"""Compare a CC-only SQLite release row-by-row with audited local staging."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from pathlib import Path
from typing import Any


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def quote(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def digest_rows(connection: sqlite3.Connection, table: str, query: str,
                order_columns: list[str]) -> tuple[int, str]:
    ordering = ", ".join(quote(column) for column in order_columns)
    cursor = connection.execute(f"{query} ORDER BY {ordering}")
    digest = hashlib.sha256()
    count = 0
    for row in cursor:
        encoded = json.dumps(list(row), ensure_ascii=False, separators=(",", ":"),
                             default=lambda value: {"blobHex": value.hex()}
                             if isinstance(value, bytes) else str(value)).encode("utf-8")
        digest.update(encoded)
        digest.update(b"\n")
        count += 1
    return count, digest.hexdigest()


def table_columns(connection: sqlite3.Connection, table: str) -> tuple[list[str], list[str]]:
    info = connection.execute(f"PRAGMA table_info({quote(table)})").fetchall()
    columns = [row[1] for row in info]
    primary = [row[1] for row in sorted((row for row in info if row[5]), key=lambda row: row[5])]
    return columns, primary


def source_query(table: str, columns: list[str]) -> str:
    selected = ", ".join(quote(column) for column in columns)
    cc_records = ("SELECT record_id FROM source_record WHERE artifact_id IN "
                  "(SELECT artifact_id FROM source_artifact "
                  "WHERE snapshot_id='corpus-coranicum-tei')")
    if table == "source_snapshot":
        return f"SELECT {selected} FROM {quote(table)} WHERE snapshot_id='corpus-coranicum-tei'"
    if table == "source_artifact":
        return f"SELECT {selected} FROM {quote(table)} WHERE snapshot_id='corpus-coranicum-tei'"
    if table == "source_record":
        return f"SELECT {selected} FROM {quote(table)} WHERE artifact_id IN " \
               "(SELECT artifact_id FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei')"
    if table == "passage":
        return f"SELECT {selected} FROM {quote(table)} WHERE passage_id IN " \
               "(SELECT passage_id FROM text_edition UNION SELECT passage_id FROM translation_edition " \
               "UNION SELECT passage_id FROM variant_assertion)"
    if table == "normalization_profile":
        return f"SELECT {selected} FROM {quote(table)}"
    if table == "comparison_run":
        return f"SELECT {selected} FROM {quote(table)} WHERE 1=0"
    if "source_record_id" in columns:
        return f"SELECT {selected} FROM {quote(table)} WHERE source_record_id IN ({cc_records})"
    if table == "variant_word":
        return f"SELECT {selected} FROM {quote(table)} WHERE assertion_id IN " \
               "(SELECT assertion_id FROM variant_assertion WHERE source_record_id IN " \
               f"({cc_records}))"
    if table == "text_token":
        return f"SELECT {selected} FROM {quote(table)} WHERE text_edition_id IN " \
               "(SELECT text_edition_id FROM text_edition WHERE source_record_id IN " \
               f"({cc_records}))"
    if table == "crosswalk":
        return f"SELECT {selected} FROM {quote(table)} WHERE review_state='candidate' " \
               "AND left_record_id IN (" + cc_records + ")"
    return f"SELECT {selected} FROM {quote(table)} WHERE 1=0"


def digest_fts_source(staging: sqlite3.Connection) -> tuple[int, str]:
    query = (
        "SELECT source_record_id, 'variant' AS layer, exact_source_text AS surface "
        "FROM variant_assertion UNION ALL "
        "SELECT source_record_id, 'cairo-text' AS layer, exact_source_text AS surface "
        "FROM text_edition UNION ALL "
        "SELECT source_record_id, 'translation' AS layer, exact_source_text AS surface "
        "FROM translation_edition"
    )
    return digest_rows(staging, "quran_search", query,
                       ["source_record_id", "layer", "surface"])


def digest_fts_release(release: sqlite3.Connection) -> tuple[int, str]:
    query = "SELECT source_record_id, layer, surface FROM quran_search"
    return digest_rows(release, "quran_search", query,
                       ["source_record_id", "layer", "surface"])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--staging-db", type=Path, required=True)
    parser.add_argument("--release-dir", type=Path, required=True)
    args = parser.parse_args()
    manifest_path = args.release_dir / "release-manifest.local.json"
    if not manifest_path.is_file():
        parser.error(f"local release manifest not found: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    release_path = args.release_dir / manifest.get("artifact", "")
    errors: list[str] = []
    if not release_path.is_file():
        parser.error(f"release SQLite artifact not found: {release_path}")
    if (release_path.stat().st_size != manifest.get("artifact_bytes")
            or sha256(release_path) != manifest.get("artifact_sha256")):
        errors.append("release SQLite artifact size or SHA-256 differs from its manifest")
    for field, expected in (("source_commit", "57cb2b7be321ecfba100cb5f7988974f47864a14"),
                            ("source_license", "CC BY-SA 4.0")):
        if manifest.get(field) != expected:
            errors.append(f"release manifest {field} does not match the pinned source")
    if manifest.get("public_scope") != "Local-only Corpus Coranicum TEI parity artifact; no linked image media copied.":
        errors.append("release manifest has unexpected public scope")
    for field, expected in (("schema_version", "3"),
                            ("redistribution_state", "local_only_needs_review"),
                            ("translation_redistribution_state", "needs_review")):
        if manifest.get(field) != expected:
            errors.append(f"release manifest {field} is not conservatively marked")

    staging = sqlite3.connect(f"file:{args.staging_db.resolve().as_posix()}?mode=ro", uri=True)
    release = sqlite3.connect(f"file:{release_path.resolve().as_posix()}?mode=ro", uri=True)
    staging.row_factory = sqlite3.Row
    release.row_factory = sqlite3.Row
    table_results: dict[str, dict[str, Any]] = {}
    try:
        snapshot_ids = {row[0] for row in release.execute(
            "SELECT snapshot_id FROM source_snapshot")}
        if snapshot_ids != {"corpus-coranicum-tei"}:
            errors.append("release contains a non-Corpus-Coranicum source snapshot")
        artifact_snapshots = {row[0] for row in release.execute(
            "SELECT DISTINCT snapshot_id FROM source_artifact")}
        if artifact_snapshots != {"corpus-coranicum-tei"}:
            errors.append("release contains a non-Corpus-Coranicum artifact")
        if (staging.execute("SELECT COUNT(*) FROM text_edition WHERE rights_state!='identified'").fetchone()[0]
                or release.execute("SELECT COUNT(*) FROM text_edition WHERE rights_state!='identified'").fetchone()[0]):
            errors.append("Cairo Arabic/transcription edition rights state differs from identified")
        if (staging.execute("SELECT COUNT(*) FROM translation_edition WHERE rights_state!='needs_review'").fetchone()[0]
                or release.execute("SELECT COUNT(*) FROM translation_edition WHERE rights_state!='needs_review'").fetchone()[0]):
            errors.append("translation editions are not consistently marked needs_review")

        for table, expected_count in manifest.get("counts", {}).items():
            columns, primary = table_columns(staging, table)
            release_columns, release_primary = table_columns(release, table)
            if columns != release_columns or primary != release_primary or not columns:
                errors.append(f"release table schema differs: {table}")
                continue
            ordering = primary or columns
            query = source_query(table, columns)
            source_count, source_digest = digest_rows(staging, table, query, ordering)
            release_count, release_digest = digest_rows(
                release, table, f"SELECT {', '.join(quote(column) for column in columns)} FROM {quote(table)}",
                ordering,
            )
            table_results[table] = {
                "sourceRows": source_count,
                "releaseRows": release_count,
                "manifestRows": expected_count,
                "sourceRowsSha256": source_digest,
                "releaseRowsSha256": release_digest,
            }
            if (source_count != expected_count or release_count != expected_count
                    or source_digest != release_digest):
                errors.append(f"staged source and release rows differ: {table}")

        search_source_count, search_source_digest = digest_fts_source(staging)
        search_release_count, search_release_digest = digest_fts_release(release)
        if (search_source_count != manifest.get("search_rows")
                or search_release_count != manifest.get("search_rows")
                or search_source_digest != search_release_digest):
            errors.append("SQLite search rows differ from the exact source text layers")

        staged_artifacts = [tuple(row) for row in staging.execute(
            "SELECT relative_path, sha256, byte_length FROM source_artifact "
            "WHERE snapshot_id='corpus-coranicum-tei' ORDER BY relative_path")]
        manifest_artifacts = [tuple(row[key] for key in ("relative_path", "sha256", "byte_length"))
                              for row in manifest.get("source_artifacts", [])]
        if staged_artifacts != manifest_artifacts:
            errors.append("release manifest source artifact inventory differs from staging")

        release_metadata = {row[0]: row[1] for row in release.execute(
            "SELECT key, value FROM data_release_metadata")}
        for key in ("release_version", "schema_version", "source_repository", "source_commit",
                    "source_license", "attribution", "modification_notice", "source_manifest_sha256",
                    "public_scope", "redistribution_state", "translation_redistribution_state"):
            expected = manifest.get(key)
            expected_value = (json.dumps(expected, ensure_ascii=False)
                              if isinstance(expected, (dict, list)) else str(expected))
            if release_metadata.get(key) != expected_value:
                errors.append(f"release metadata differs from manifest: {key}")

        integrity = release.execute("PRAGMA integrity_check").fetchone()[0]
        foreign_key_errors = release.execute("PRAGMA foreign_key_check").fetchall()
        if integrity != "ok":
            errors.append(f"release SQLite integrity check failed: {integrity}")
        if foreign_key_errors or manifest.get("integrity") != "ok" or manifest.get("foreign_key_errors") != 0:
            errors.append("release SQLite foreign-key check failed")
    finally:
        staging.close()
        release.close()

    result = {
        "verifier": "coranicum-sqlite-release/1.0.0",
        "artifact": manifest.get("artifact"),
        "artifactBytes": manifest.get("artifact_bytes"),
        "artifactSha256": manifest.get("artifact_sha256"),
        "sourceSnapshotIds": sorted(snapshot_ids),
        "tablesChecked": len(table_results),
        "tableCounts": {name: item["releaseRows"] for name, item in table_results.items()},
        "searchRows": search_release_count,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
