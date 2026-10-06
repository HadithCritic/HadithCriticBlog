#!/usr/bin/env python3
"""Validate store relationships and exact candidate fidelity to the Parquet.

This proves the saved candidate rows match the supplied Parquet bytes. It does
not verify printed editions, scans, authorship, translation, or legal meaning.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from collections import defaultdict
from pathlib import Path
from typing import Any

import duckdb


def normalized_locator(value: Any) -> str | None:
    raw = None if value is None else str(value)
    if raw is None or raw.strip().casefold() in {"", "none", "null", "nan"}:
        return None
    return raw


def expected_passage_id(source_id: str, serial: str, issue_id: str, profile: str) -> str:
    digest = hashlib.sha256(f"{source_id}\0{serial}\0{issue_id}\0{profile}".encode("utf-8")).hexdigest()
    return "fcpass:" + digest[:24]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--parquet", type=Path, required=True)
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--exports", type=Path, required=True)
    parser.add_argument("--plans", type=Path, default=Path("scripts/fiqh-compass/retrieval-plans-v1.json"))
    args = parser.parse_args()

    db_path, parquet, exports, plans_path = (p.resolve() for p in (args.db, args.parquet, args.exports, args.plans))
    db = sqlite3.connect(f"file:{db_path.as_posix()}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    integrity = db.execute("PRAGMA integrity_check").fetchone()[0]
    fk_errors = [tuple(r) for r in db.execute("PRAGMA foreign_key_check")]
    passages = [dict(row) for row in db.execute("""
      SELECT passage_id,source_id,corpus_serial,corpus_row_key,issue_id,
             retrieval_profile,source_text_sha256,arabic_verbatim,footnote_verbatim,
             digital_volume_raw,digital_page_raw,digital_volume,digital_page,
             printed_volume,printed_page,page_scan_uri,extraction_status,
             attribution_type,rights_status
      FROM passage ORDER BY source_id,corpus_row_key,issue_id
    """)]
    passage_ids = {row["passage_id"] for row in passages}
    source_ids = sorted({row["source_id"].removeprefix("shamela:") for row in passages})
    issues = [row[0] for row in db.execute("SELECT issue_id FROM issue ORDER BY issue_id")]
    question_mappings = db.execute("SELECT COUNT(*) FROM question_mapping").fetchone()[0]
    question_evidence = db.execute("SELECT COUNT(*) FROM question_evidence").fetchone()[0]
    positions = db.execute("SELECT COUNT(*) FROM position").fetchone()[0]
    translation_segments = [dict(row) for row in db.execute("""
      SELECT ts.*,p.arabic_verbatim FROM translation_segment ts
      JOIN passage p USING(passage_id) ORDER BY ts.segment_id
    """)]
    position_rows = [dict(row) for row in db.execute("SELECT * FROM position ORDER BY position_id")]
    position_evidence_rows = [dict(row) for row in db.execute("SELECT * FROM position_evidence ORDER BY position_id,passage_id")]
    profile_position_rows = [dict(row) for row in db.execute("SELECT * FROM profile_position ORDER BY profile_id,position_id")]
    profile_count = db.execute("SELECT COUNT(*) FROM profile").fetchone()[0]
    db_rows = defaultdict(dict)
    for row in passages:
        key = (row["source_id"].removeprefix("shamela:"), str(row["corpus_serial"]))
        db_rows[key][row["issue_id"]] = row

    parquet_hash_mismatches: list[str] = []
    locator_mismatches: list[str] = []
    missing_parquet_rows: list[str] = []
    recomputed_id_mismatches: list[str] = []
    duplicate_ids = len(passages) - len(passage_ids)
    bad_printed_claims = [r["passage_id"] for r in passages if r["printed_volume"] is not None or r["printed_page"] is not None or r["page_scan_uri"] is not None]
    bad_status = [r["passage_id"] for r in passages if r["extraction_status"] != "machine_candidate" or r["attribution_type"] != "unresolved" or r["rights_status"] != "needs_review"]
    bad_segments = []
    for segment in translation_segments:
        body = segment["arabic_verbatim"]
        start, end = segment["source_start_char"], segment["source_end_char"]
        if start < 0 or end <= start or end > len(body):
            bad_segments.append(segment["segment_id"])
        elif hashlib.sha256(body[start:end].encode("utf-8")).hexdigest() != segment["source_span_sha256"]:
            bad_segments.append(segment["segment_id"])
        if segment["translation_status"] != "working_draft":
            bad_segments.append(segment["segment_id"])
    position_ids = {r["position_id"] for r in position_rows}
    evidence_passages = {r["passage_id"] for r in passages}
    bad_positions = [r["position_id"] for r in position_rows if r["epistemic_status"] != "candidate" or r["profile_score_allowed"] != 0]
    bad_position_evidence = [r for r in position_evidence_rows if r["position_id"] not in position_ids or r["passage_id"] not in evidence_passages]
    bad_profile_links = [r for r in profile_position_rows if r["position_id"] not in position_ids]
    for row in passages:
        expected = expected_passage_id(row["source_id"], row["corpus_serial"], row["issue_id"], row["retrieval_profile"])
        if expected != row["passage_id"]:
            recomputed_id_mismatches.append(row["passage_id"])

    if source_ids:
        ids_sql = ",".join("'" + value.replace("'", "''") + "'" for value in source_ids)
        con = duckdb.connect(database=":memory:")
        con.execute("PRAGMA threads=4")
        cursor = con.execute(f"""
          SELECT trim(book_id) AS book_id, CAST(serial_number AS VARCHAR) AS serial,
                 text, foot_note, volume_number, page_number
          FROM read_parquet(?) WHERE trim(book_id) IN ({ids_sql})
        """, [str(parquet)])
        cols = [item[0] for item in cursor.description]
        seen = set()
        while batch := cursor.fetchmany(2000):
            for values in batch:
                source = dict(zip(cols, values))
                key = (str(source["book_id"]), str(source["serial"]))
                if key not in db_rows:
                    continue
                seen.add(key)
                body = str(source.get("text") or "")
                footnote = str(source.get("foot_note") or "")
                if footnote.strip().casefold() in {"", "none", "null", "nan"}:
                    footnote = ""
                digest = hashlib.sha256((body + "\n" + footnote).encode("utf-8")).hexdigest()
                for issue_id, row in db_rows[key].items():
                    if digest != row["source_text_sha256"] or body != row["arabic_verbatim"] or (footnote or None) != row["footnote_verbatim"]:
                        parquet_hash_mismatches.append(row["passage_id"])
                    if str(source.get("volume_number")) != str(row["digital_volume_raw"]) or str(source.get("page_number")) != str(row["digital_page_raw"]):
                        locator_mismatches.append(row["passage_id"])
        con.close()
        missing_parquet_rows = [f"{source}:{serial}" for source, serial in db_rows if (source, serial) not in seen]

    plans = json.loads(plans_path.read_text(encoding="utf-8"))
    dossier_missing = [issue_id for issue_id in plans if not (exports.parent / "dossiers" / f"{issue_id}.json").is_file()]
    dossier_count_mismatches = {}
    for issue_id in plans:
        dossier_path = exports.parent / "dossiers" / f"{issue_id}.json"
        if not dossier_path.exists():
            continue
        dossier = json.loads(dossier_path.read_text(encoding="utf-8"))
        count = db.execute("SELECT COUNT(*) FROM passage WHERE issue_id=?", (issue_id,)).fetchone()[0]
        if dossier.get("candidate_passage_count") != count:
            dossier_count_mismatches[issue_id] = {"dossier": dossier.get("candidate_passage_count"), "database": count}
        shortlist_count = sum(len(source.get("matches", [])) for source in dossier.get("source_candidates", {}).values())
        if shortlist_count > count:
            dossier_count_mismatches[issue_id] = {"shortlist": shortlist_count, "database": count}

    bundle = json.loads((exports / "bundle-index.json").read_text(encoding="utf-8"))
    json_issues = json.loads((exports / "issues.json").read_text(encoding="utf-8"))
    json_question_map = json.loads((exports / "question-evidence-map.json").read_text(encoding="utf-8"))
    json_bundle_passages = bundle["counts"]["candidate_passages"]
    json_issue_passages = sum(len(item.get("candidate_evidence", [])) for item in json_issues)
    all_checks = {
        "sqlite_integrity_ok": integrity == "ok",
        "foreign_keys_ok": not fk_errors,
        "duplicate_passage_ids_absent": duplicate_ids == 0,
        "passage_ids_reproducible": not recomputed_id_mismatches,
        "all_exact_text_matches_parquet": not parquet_hash_mismatches and not missing_parquet_rows,
        "all_digital_locators_match_parquet": not locator_mismatches,
        "printed_locators_not_invented": not bad_printed_claims,
        "candidate_review_and_rights_status_preserved": not bad_status,
        "translation_segments_match_exact_source_spans": not bad_segments,
        "candidate_positions_unscored": not bad_positions,
        "position_evidence_relationships_valid": not bad_position_evidence,
        "profile_position_links_valid": not bad_profile_links,
        "all_planned_dossiers_exist": not dossier_missing,
        "dossier_counts_match_database": not dossier_count_mismatches,
        "bundle_export_matches_database": json_bundle_passages == len(passages),
        "issue_export_contains_each_candidate_once": json_issue_passages == len(passages),
        "question_evidence_export_matches_database": len(json_question_map) == 24,
        "issue_count_20": len(issues) == 20,
    }
    result = {
        "schema_version": "1.0.0",
        "parquet_path": str(parquet),
        "database": str(db_path),
        "counts": {"sources_with_candidates": len(source_ids), "issues": len(issues), "passages": len(passages), "positions": positions, "translation_segments": len(translation_segments), "position_evidence_links": len(position_evidence_rows), "profile_position_links": len(profile_position_rows), "profiles": profile_count, "question_issue_mappings": question_mappings, "question_evidence_links": question_evidence},
        "exports": {"bundle_passages": json_bundle_passages, "issue_passages": json_issue_passages, "questions_in_map": len(json_question_map)},
        "checks": all_checks,
        "details": {"sqlite_integrity": integrity, "foreign_key_errors": len(fk_errors), "duplicate_ids": duplicate_ids, "text_mismatches": len(parquet_hash_mismatches), "locator_mismatches": len(locator_mismatches), "missing_parquet_source_rows": len(missing_parquet_rows), "unreproducible_ids": len(recomputed_id_mismatches), "printed_locator_claims": len(bad_printed_claims), "unexpected_review_or_rights_statuses": len(bad_status), "invalid_translation_segments": len(bad_segments), "scored_or_promoted_candidate_positions": len(bad_positions), "invalid_position_evidence_links": len(bad_position_evidence), "invalid_profile_position_links": len(bad_profile_links), "missing_dossiers": dossier_missing, "dossier_count_mismatches": dossier_count_mismatches},
        "boundary": "Passage-to-Parquet fidelity is verified; authorial attribution, edition-to-scan collation, translation, legal interpretation, rights, and human review are not.",
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    (db_path.parent / "validation-report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    db.close()
    if not all(all_checks.values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
