#!/usr/bin/env python3
"""Independently verify private Nasser/Studies staging against supplied files."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sqlite3
import sys
from pathlib import Path
from typing import Any


class DuplicateJsonKey(ValueError):
    pass


def unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateJsonKey(key)
        result[key] = value
    return result


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"),
                      object_pairs_hook=unique_object)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def same_location(actual: Path, supplied: str | None) -> bool:
    return bool(supplied) and actual.resolve() == Path(supplied).resolve()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-manifest", type=Path, required=True)
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--nasser", type=Path, required=True)
    parser.add_argument("--studies", type=Path, required=True)
    parser.add_argument("--shamela", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    manifest = load_json(args.source_manifest)
    sources = {source["id"]: source for source in manifest.get("sources", [])}
    checks: dict[str, Any] = {}
    errors: list[str] = []
    db_uri = f"file:{args.db.resolve().as_posix()}?mode=ro"
    connection = sqlite3.connect(db_uri, uri=True)
    connection.row_factory = sqlite3.Row

    def error(message: str) -> None:
        errors.append(message)

    def one_snapshot(source_id: str) -> sqlite3.Row | None:
        row = connection.execute(
            "SELECT snapshot_id, source_name, rights_state, source_manifest_sha256 "
            "FROM source_snapshot WHERE snapshot_id=?", (source_id,),
        ).fetchone()
        if row is None:
            error(f"missing source snapshot: {source_id}")
            return None
        if row["rights_state"] != "needs_review":
            error(f"quarantined source has unexpected rights state: {source_id}")
        if row["source_manifest_sha256"] != sha256(args.source_manifest):
            error(f"staged source manifest hash differs: {source_id}")
        return row

    def verify_artifacts(source_id: str, root: Path) -> tuple[sqlite3.Row | None, dict[str, sqlite3.Row]]:
        source = sources.get(source_id)
        if source is None:
            error(f"source manifest lacks {source_id}")
            return None, {}
        if not same_location(root, source.get("suppliedLocation")):
            error(f"supplied directory differs from source manifest: {source_id}")
        if source.get("availability") != "present" or source.get("redistribution") != "quarantined":
            error(f"source is not recorded present and quarantined: {source_id}")
        expected = {row["relativePath"]: row for row in source.get("files", [])}
        actual = {path.relative_to(root).as_posix(): path
                  for path in root.rglob("*") if path.is_file()}
        if set(actual) != set(expected):
            error(f"source file set differs: {source_id}; missing={sorted(set(expected)-set(actual))}; "
                  f"added={sorted(set(actual)-set(expected))}")
        snapshot = one_snapshot(source_id)
        if snapshot is None:
            return None, {}
        artifact_rows = connection.execute(
            "SELECT artifact_id, relative_path, sha256, byte_length, redistribution_state "
            "FROM source_artifact WHERE snapshot_id=?", (source_id,),
        ).fetchall()
        artifacts = {row["relative_path"]: row for row in artifact_rows}
        if set(artifacts) != set(expected):
            error(f"staged artifact set differs from source manifest: {source_id}")
        for relative, expected_file in expected.items():
            path = actual.get(relative)
            artifact = artifacts.get(relative)
            if path is None:
                continue
            digest = sha256(path)
            size = path.stat().st_size
            if size != expected_file.get("bytes") or digest != expected_file.get("sha256"):
                error(f"supplied source hash differs from pinned manifest: {source_id}/{relative}")
            if artifact is None:
                error(f"staging lacks source artifact: {source_id}/{relative}")
                continue
            if (artifact["sha256"] != digest or artifact["byte_length"] != size
                    or artifact["redistribution_state"] != "quarantined"):
                error(f"staged artifact metadata mismatch or non-quarantined state: {source_id}/{relative}")
        return snapshot, artifacts

    try:
        nasser_snapshot, nasser_artifacts = verify_artifacts("nasser-export", args.nasser)
        nasser_files_checked = nasser_rows_checked = nasser_containers_checked = 0
        nasser_duplicate_free_files = 0
        for relative, artifact in nasser_artifacts.items():
            path = args.nasser / relative
            try:
                payload = load_json(path)
            except Exception as exc:
                error(f"Nasser JSON parse failed or has duplicate keys: {relative}: {type(exc).__name__}")
                continue
            nasser_duplicate_free_files += 1
            nasser_files_checked += 1
            records = connection.execute(
                "SELECT native_id, record_type, locator, raw_fields_json, parse_state "
                "FROM source_record WHERE artifact_id=?", (artifact["artifact_id"],),
            ).fetchall()
            expected_records: list[tuple[str | None, str, str, Any, str]] = []
            if not isinstance(payload, dict):
                expected_records.append((None, "nasser-root", relative, payload, "needs_review"))
            else:
                family = next((key for key, value in payload.items() if isinstance(value, list)), None)
                rows = payload.get(family, []) if family else []
                expected_records.append((None, f"nasser-{family or 'root'}-container",
                                         f"{relative}#/{family or ''}", payload, "quarantined"))
                for index, row in enumerate(rows):
                    native_id = (str(row["id"])
                                 if isinstance(row, dict) and row.get("id") is not None
                                 else None)
                    expected_records.append((native_id, f"nasser-{family}-record",
                                             f"{relative}#/{family}/{index}", row, "quarantined"))
            by_locator = {row["locator"]: row for row in records}
            if len(by_locator) != len(records) or set(by_locator) != {row[2] for row in expected_records}:
                error(f"Nasser staged record locators differ: {relative}")
            for native_id, record_type, locator, raw_value, parse_state in expected_records:
                staged = by_locator.get(locator)
                if staged is None:
                    continue
                try:
                    fields = json.loads(staged["raw_fields_json"], object_pairs_hook=unique_object)
                except Exception as exc:
                    error(f"staged Nasser JSON cannot be parsed uniquely: {relative} {locator}: {type(exc).__name__}")
                    continue
                if (staged["native_id"] != native_id or staged["record_type"] != record_type
                        or staged["parse_state"] != parse_state or fields != raw_value):
                    error(f"Nasser staged fields/identity/state differ from source: {relative} {locator}")
                if record_type.endswith("-container"):
                    nasser_containers_checked += 1
                else:
                    nasser_rows_checked += 1
        checks["nasser"] = {
            "files": nasser_files_checked,
            "duplicateKeyFreeJsonFiles": nasser_duplicate_free_files,
            "containerRecords": nasser_containers_checked,
            "dataRows": nasser_rows_checked,
        }

        studies_snapshot, studies_artifacts = verify_artifacts("quran-studies-files", args.studies)
        rename_path = args.studies / "_rename_manifest.csv"
        with rename_path.open("r", encoding="utf-8-sig", newline="") as stream:
            rename_rows = list(csv.DictReader(stream))
        studies_rows_checked = studies_files_checked = 0
        for relative, artifact in studies_artifacts.items():
            path = args.studies / relative
            records = connection.execute(
                "SELECT native_id, record_type, locator, raw_fields_json, parse_state "
                "FROM source_record WHERE artifact_id=?", (artifact["artifact_id"],),
            ).fetchall()
            by_locator = {row["locator"]: row for row in records}
            if relative == "_rename_manifest.csv":
                expected_rows = [(None, "study-rename-manifest-row",
                                  f"_rename_manifest.csv line {index + 2}", row, "quarantined")
                                 for index, row in enumerate(rename_rows)]
            else:
                expected_rows = [(None, "study-file",
                                  f"{path.name}; bytes={path.stat().st_size}; sha256={sha256(path)}",
                                  {"filename": path.name, "bytes": path.stat().st_size,
                                   "sha256": sha256(path)}, "quarantined")]
            if len(by_locator) != len(records) or set(by_locator) != {row[2] for row in expected_rows}:
                error(f"Studies staged record locators differ: {relative}")
            for native_id, record_type, locator, raw_value, parse_state in expected_rows:
                staged = by_locator.get(locator)
                if staged is None:
                    continue
                try:
                    fields = json.loads(staged["raw_fields_json"], object_pairs_hook=unique_object)
                except Exception as exc:
                    error(f"staged Studies JSON cannot be parsed uniquely: {relative} {locator}: {type(exc).__name__}")
                    continue
                if (staged["native_id"] != native_id or staged["record_type"] != record_type
                        or staged["parse_state"] != parse_state or fields != raw_value):
                    error(f"Studies staged fields/identity/state differ from source: {relative} {locator}")
                if record_type == "study-file":
                    studies_files_checked += 1
                else:
                    studies_rows_checked += 1
        checks["studies"] = {
            "files": len(studies_artifacts),
            "documentRecords": studies_files_checked,
            "renameManifestRows": studies_rows_checked,
        }

        shamela = sources.get("shamela-category-5-export", {})
        shamela_snapshot = connection.execute(
            "SELECT snapshot_id FROM source_snapshot WHERE snapshot_id='shamela-category-5-export'"
        ).fetchone()
        shamela_artifacts = connection.execute(
            "SELECT COUNT(*) FROM source_artifact WHERE snapshot_id='shamela-category-5-export'"
        ).fetchone()[0]
        if shamela.get("availability") == "present":
            supplied_path = args.shamela
            if supplied_path is None or not same_location(supplied_path, shamela.get("suppliedLocation")):
                error("Shamela is present in the manifest but its exact user-supplied path was not provided")
            else:
                error("present Shamela source requires a dedicated row-level audit before this verifier can validate it")
        elif args.shamela is not None:
            error("--shamela was supplied while the pinned source manifest does not mark it present")
        elif shamela.get("availability") == "missing":
            missing_path = Path(shamela.get("suppliedLocation", ""))
            if missing_path.exists():
                error("the exact path marked missing in the source manifest now exists; create a new manifest")
            if shamela_snapshot is None or shamela_artifacts != 0:
                error("missing Shamela source should have a snapshot but no staged file artifacts")
            else:
                snapshot = one_snapshot("shamela-category-5-export")
        checks["shamela"] = {
            "availability": shamela.get("availability"),
            "snapshotPresent": shamela_snapshot is not None,
            "stagedArtifacts": shamela_artifacts,
        }
    finally:
        connection.close()

    output = {"verifier": "quarantined-source-staging/1.0.0", "checks": checks,
              "errors": errors}
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n",
                            encoding="utf-8")
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
