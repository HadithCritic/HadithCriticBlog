#!/usr/bin/env python3
"""Load audit + prototype seeds into SQLite, then emit reproducible JSON.

All generated database and passage exports should live in ignored scratch:

  python scripts/fiqh-compass/build_research_store.py \
    --input scratch/fiqh-compass --out scratch/fiqh-compass
"""
from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path
from typing import Any


PROFILE_SEEDS = [
    {"profile_id": "al-shafii", "display_name": "Al-Shāfiʿī", "scope": "Positions expressed in al-Risāla (Shamela 8180) and al-Umm (1655); distinguish authorial text, reports, and later redaction/attribution.", "sources": [("8180", "methodology/source text"), ("1655", "applied-law text")]},
    {"profile_id": "al-sarakhsi", "display_name": "Al-Sarakhsī", "scope": "Positions expressed in Uṣūl al-Sarakhsī (6301) and al-Mabsūṭ (5423); record each work separately before synthesis.", "sources": [("6301", "legal-method text"), ("5423", "applied-law text")]},
    {"profile_id": "ibn-hazm", "display_name": "Ibn Ḥazm", "scope": "Positions expressed in al-Iḥkām (10432) and al-Muḥallā (767); distinguish methodological claims from case rulings.", "sources": [("10432", "legal-method text"), ("767", "applied-law text")]},
    {"profile_id": "ibn-rushd", "display_name": "Ibn Rushd", "scope": "Disputes and their explanations as presented in Bidāyat al-mujtahid (21739); comparative presentation is not automatically each reported jurist's direct evidence.", "sources": [("21739", "comparative synthesis; attributed positions require verification")]},
    {"profile_id": "ibn-qudama", "display_name": "Ibn Qudāma", "scope": "Positions and comparisons in al-Mughnī (8463); distinguish Ibn Qudāma's argument from positions he quotes.", "sources": [("8463", "comparative applied-law text")]},
    {"profile_id": "ibn-al-mundhir", "display_name": "Ibn al-Mundhir", "scope": "Positions and authorities in al-Awsaṭ (21113); identify direct wording, transmitted views, and source dependence.", "sources": [("21113", "comparative report of early disagreements")]},
    {"profile_id": "al-tabari", "display_name": "Al-Ṭabarī", "scope": "Material presented in Ikhtilāf al-fuqahāʾ (7492); verify text attribution and distinguish his own position from the comparative record.", "sources": [("7492", "comparative-law text; authorial stance requires verification")]},
    {"profile_id": "al-shatibi", "display_name": "Al-Shāṭibī", "scope": "Legal-method and purposive arguments in al-Muwāfaqāt (11435); do not treat abstract method as an unqualified case ruling.", "sources": [("11435", "legal-method text")]},
]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True, help="Directory containing source-manifest.json, reconciliation.json, and seed-data.json")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--schema", type=Path, default=Path("docs/research/fiqh-compass/schema-v1.sql"))
    args = parser.parse_args()
    in_dir, out_dir = args.input.resolve(), args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = load_json(in_dir / "source-manifest.json")
    reconciliation = load_json(in_dir / "reconciliation.json")
    seed = load_json(in_dir / "seed-data.json")
    schema_path = args.schema.resolve()
    db_path = out_dir / "fiqh-compass-research.sqlite"
    dataset_id = f"shamela-merged:{manifest['dataset_sha256']}"
    source_file = reconciliation["inputs"]["parquet"]
    catalog_file = reconciliation["inputs"]["catalog"]

    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(schema_path.read_text(encoding="utf-8"))
    source_columns = {row[1] for row in con.execute("PRAGMA table_info(source_record)")}
    if "corpus_text_sentinel_count" not in source_columns:
        con.execute("ALTER TABLE source_record ADD COLUMN corpus_text_sentinel_count INTEGER")
    passage_columns = {row[1] for row in con.execute("PRAGMA table_info(passage)")}
    for column in ("digital_volume_raw", "digital_page_raw"):
        if column not in passage_columns:
            con.execute(f"ALTER TABLE passage ADD COLUMN {column} TEXT")
    with con:
        con.execute(
            "INSERT OR IGNORE INTO dataset_snapshot VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (dataset_id, "Maktaba Shamela merged Parquet", source_file["path"], source_file["sha256"], source_file["bytes"], reconciliation["generated_utc"], "needs_review", "Source/export provenance and reuse terms not established; keep copied text local pending review."),
        )
        for record in manifest["records"]:
            catalog = record["catalog_records"][0] if record["catalog_records"] else {}
            corpus = record["corpus"] or {}
            con.execute("""
              INSERT INTO source_record (
                source_id,dataset_id,shamela_book_id,catalog_present,corpus_present,
                title_ar,author_as_catalogued_ar,author_year_raw,editor_raw,publisher_raw,edition_raw,category_raw,
                corpus_title_values_json,corpus_edition_values_json,corpus_publisher_values_json,corpus_category_values_json,
                corpus_row_count,corpus_blank_text_count,corpus_text_sentinel_count,corpus_missing_page_count,corpus_missing_volume_count,
                corpus_min_serial,corpus_max_serial,identity_status,edition_review_status,rights_status,rights_notes
              ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
              ON CONFLICT(source_id) DO UPDATE SET
                dataset_id=excluded.dataset_id, shamela_book_id=excluded.shamela_book_id,
                catalog_present=excluded.catalog_present, corpus_present=excluded.corpus_present,
                title_ar=excluded.title_ar, author_as_catalogued_ar=excluded.author_as_catalogued_ar,
                author_year_raw=excluded.author_year_raw, editor_raw=excluded.editor_raw,
                publisher_raw=excluded.publisher_raw, edition_raw=excluded.edition_raw, category_raw=excluded.category_raw,
                corpus_title_values_json=excluded.corpus_title_values_json, corpus_edition_values_json=excluded.corpus_edition_values_json,
                corpus_publisher_values_json=excluded.corpus_publisher_values_json, corpus_category_values_json=excluded.corpus_category_values_json,
                corpus_row_count=excluded.corpus_row_count, corpus_blank_text_count=excluded.corpus_blank_text_count,
                corpus_text_sentinel_count=excluded.corpus_text_sentinel_count,
                corpus_missing_page_count=excluded.corpus_missing_page_count, corpus_missing_volume_count=excluded.corpus_missing_volume_count,
                corpus_min_serial=excluded.corpus_min_serial, corpus_max_serial=excluded.corpus_max_serial
            """, (
                record["source_record_id"], dataset_id, record["shamela_book_id"], int(record["catalog_presence"]), int(record["corpus_presence"]),
                catalog.get("book_title"), catalog.get("author_name") or catalog.get("author"), catalog.get("author_year"), catalog.get("editor"), catalog.get("publisher"), catalog.get("edition"), catalog.get("category"),
                json.dumps((corpus.get("book_titles") or []), ensure_ascii=False), json.dumps((corpus.get("editions") or []), ensure_ascii=False),
                json.dumps((corpus.get("publishers") or []), ensure_ascii=False), json.dumps((corpus.get("categories") or []), ensure_ascii=False),
                corpus.get("row_count"), corpus.get("blank_text_count"), corpus.get("text_sentinel_count"), corpus.get("missing_page_count"), corpus.get("missing_volume_count"),
                corpus.get("first_serial"), corpus.get("last_serial"), record.get("identity_status", "work-versus-edition unresolved"),
                record.get("edition_review_status", "unreviewed"), record.get("rights_status", "needs_review"), "rights/edition review required before release",
            ))
        for axis in seed["axes"]:
            con.execute("INSERT OR IGNORE INTO axis(axis_id,title,low_endpoint,high_endpoint,scope_note) VALUES (?,?,?,?,?)", (axis["axis_id"],axis["title"],axis["low_endpoint"],axis["high_endpoint"],axis["scope_note"]))
        issue_index = {}
        for group in seed["issue_groups"]:
            for issue in group["issues"]:
                issue_index[issue["id"]] = {**issue, "group_id": group["id"], "group_title": group["title"]}
                con.execute("INSERT OR IGNORE INTO issue(issue_id,issue_group_id,question,dossier_json_path) VALUES (?,?,?,?)", (issue["id"],group["id"],issue["question"],f"dossiers/{issue['id']}.json"))
                for axis_id in issue["axes"]:
                    con.execute("INSERT OR IGNORE INTO issue_axis(issue_id,axis_id,relationship) VALUES (?,?,?)", (issue["id"],axis_id,"primary"))
        for question in seed["questions"]:
            issue_ids = [issue_id for issue_id, issue in issue_index.items() if question["axis_id"] in issue["axes"]]
            for issue_id in issue_ids:
                con.execute("INSERT OR IGNORE INTO question_mapping(question_id,issue_id,mapping_status,direction,rationale) VALUES (?,?,?,?,?)", (question["question_id"],issue_id,"candidate",str(question["direction"]),"Provisional axis-to-issue mapping from the draft instrument; issue-specific fit remains to be audited."))
        for profile in PROFILE_SEEDS:
            con.execute("INSERT OR IGNORE INTO profile(profile_id,display_name,scope,status,representation_notes) VALUES (?,?,?,?,?)", (profile["profile_id"],profile["display_name"],profile["scope"],"candidate","No position or coordinate is encoded. Profile boundaries and author/work attributions require specialist and source review."))
            for book_id, role in profile["sources"]:
                con.execute("INSERT OR IGNORE INTO profile_source(profile_id,source_id,role) VALUES (?,?,?)", (profile["profile_id"],f"shamela:{book_id}",role))

    integrity = con.execute("PRAGMA integrity_check").fetchone()[0]
    fk_errors = con.execute("PRAGMA foreign_key_check").fetchall()
    if integrity != "ok" or fk_errors:
        raise RuntimeError(f"SQLite validation failed: integrity={integrity}; fk_errors={len(fk_errors)}")

    issue_list = []
    for row in con.execute("SELECT i.*, json_group_array(ia.axis_id) AS axes_json FROM issue i LEFT JOIN issue_axis ia USING(issue_id) GROUP BY i.issue_id ORDER BY i.issue_id"):
        d = dict(row)
        d["axes"] = sorted(v for v in json.loads(d.pop("axes_json")) if v is not None)
        d["candidate_evidence"] = [dict(p) for p in con.execute("""
          SELECT p.passage_id,p.source_id,p.corpus_row_key,p.digital_volume,p.digital_page,
                 p.attribution_type,p.extraction_status,p.rights_status,
                 sr.title_ar AS work_title_ar,sr.author_as_catalogued_ar,
                 sr.edition_raw,sr.publisher_raw,sr.edition_review_status,
                 p.source_text_sha256
          FROM passage p JOIN source_record sr USING(source_id)
          WHERE p.issue_id=? ORDER BY p.source_id,CAST(p.corpus_row_key AS INTEGER),p.passage_id
        """, (d["issue_id"],))]
        d["positions"] = []
        for position in con.execute("""
          SELECT position_id,holder_label,author_id,period_label,proposition,reasoning,
                 conditions_json,exceptions_json,domain,attribution_type,epistemic_status,
                 method_or_ruling,profile_score_allowed,editorial_notes
          FROM position WHERE issue_id=? ORDER BY position_id
        """, (d["issue_id"],)):
            item = dict(position)
            item["evidence"] = [dict(ev) for ev in con.execute("""
              SELECT pe.passage_id,pe.support_type,pe.note,p.source_id,p.corpus_row_key,
                     p.digital_volume,p.digital_page,p.source_text_sha256
              FROM position_evidence pe JOIN passage p USING(passage_id)
              WHERE pe.position_id=? ORDER BY pe.passage_id
            """, (item["position_id"],))]
            for ev in item["evidence"]:
                ev["translation_segments"] = [dict(seg) for seg in con.execute("""
                  SELECT segment_id,source_start_char,source_end_char,source_span_sha256,
                         language,translation,translator,translation_status,notes
                  FROM translation_segment WHERE passage_id=? ORDER BY source_start_char
                """, (ev["passage_id"],))]
            d["positions"].append(item)
        d["translation_segments"] = [dict(seg) for seg in con.execute("""
          SELECT ts.segment_id,ts.passage_id,ts.source_start_char,ts.source_end_char,
                 ts.source_span_sha256,ts.language,ts.translation,ts.translator,
                 ts.translation_status,ts.notes,p.source_id,p.corpus_row_key,
                 p.digital_volume,p.digital_page
          FROM translation_segment ts JOIN passage p USING(passage_id)
          WHERE p.issue_id=? ORDER BY ts.segment_id
        """, (d["issue_id"],))]
        issue_list.append(d)
    profiles = []
    for row in con.execute("SELECT * FROM profile ORDER BY profile_id"):
        d = dict(row)
        d["sources"] = [dict(s) for s in con.execute("SELECT ps.source_id, ps.role, sr.title_ar, sr.author_as_catalogued_ar, sr.edition_raw, sr.publisher_raw, sr.edition_review_status, sr.rights_status FROM profile_source ps JOIN source_record sr USING(source_id) WHERE ps.profile_id=? ORDER BY ps.source_id", (d["profile_id"],))]
        d["positions"] = [dict(p) for p in con.execute("SELECT pp.position_id, rp.issue_id, rp.proposition, rp.reasoning, rp.conditions_json, rp.exceptions_json, rp.attribution_type, rp.epistemic_status, rp.method_or_ruling, rp.profile_score_allowed FROM profile_position pp JOIN position rp USING(position_id) WHERE pp.profile_id=? ORDER BY rp.issue_id, pp.position_id", (d["profile_id"],))]
        profiles.append(d)
    questions = []
    for q in seed["questions"]:
        mappings = [dict(row) for row in con.execute("SELECT question_id, issue_id, mapping_status, direction, rationale FROM question_mapping WHERE question_id=? ORDER BY issue_id", (q["question_id"],))]
        ev = [dict(row) for row in con.execute("SELECT qe.passage_id, qe.relevance_status, qe.note, p.issue_id FROM question_evidence qe JOIN passage p USING(passage_id) WHERE qe.question_id=? ORDER BY p.issue_id, qe.passage_id", (q["question_id"],))]
        questions.append({**q, "candidate_issue_mappings": mappings, "evidence_links": ev})
    coverage = []
    for issue in issue_list:
        linked = con.execute("""
          SELECT p.profile_id, p.display_name,
                 COUNT(DISTINCT pp.position_id) AS positions,
                 COUNT(DISTINCT pe.passage_id) AS evidence_passages
          FROM profile p LEFT JOIN profile_source ps USING(profile_id)
          LEFT JOIN source_record sr USING(source_id)
          LEFT JOIN passage pe ON pe.source_id=sr.source_id AND pe.issue_id=?
          LEFT JOIN position_evidence px ON px.passage_id=pe.passage_id
          LEFT JOIN profile_position pp ON pp.position_id=px.position_id AND pp.profile_id=p.profile_id
          GROUP BY p.profile_id ORDER BY p.profile_id
        """, (issue["issue_id"],)).fetchall()
        coverage.append({"issue_id": issue["issue_id"], "issue_status": issue["dossier_status"], "profiles": [dict(r) for r in linked]})
    summary = {
        "schema_version": "1.0.0",
        "seed_content_version": seed["source_content_version"],
        "seed_source_sha256": seed["source_sha256"],
        "corpus_dataset_id": dataset_id,
        "catalog_sha256": catalog_file["sha256"],
        "counts": {
            "source_records": con.execute("SELECT COUNT(*) FROM source_record").fetchone()[0],
            "sources_in_both": con.execute("SELECT COUNT(*) FROM source_record WHERE catalog_present=1 AND corpus_present=1").fetchone()[0],
            "issues": con.execute("SELECT COUNT(*) FROM issue").fetchone()[0],
            "axes": con.execute("SELECT COUNT(*) FROM axis").fetchone()[0],
            "questions": len(seed["questions"]),
            "question_issue_mappings": con.execute("SELECT COUNT(*) FROM question_mapping").fetchone()[0],
            "profiles": con.execute("SELECT COUNT(*) FROM profile").fetchone()[0],
            "candidate_passages": con.execute("SELECT COUNT(*) FROM passage").fetchone()[0],
            "positions": con.execute("SELECT COUNT(*) FROM position").fetchone()[0],
            "translation_segments": con.execute("SELECT COUNT(*) FROM translation_segment").fetchone()[0],
            "profile_position_links": con.execute("SELECT COUNT(*) FROM profile_position").fetchone()[0],
            "review_events": con.execute("SELECT COUNT(*) FROM review_event").fetchone()[0],
        },
        "sqlite_integrity_check": integrity,
        "foreign_key_errors": len(fk_errors),
        "rights_status": "Shamela text excerpts remain local pending rights review.",
        "research_status": "Candidate mappings and source leads only. No specialist review or score is implied.",
    }
    export_root = out_dir / "json"
    write_json(export_root / "bundle-index.json", summary)
    write_json(export_root / "issues.json", issue_list)
    write_json(export_root / "profiles.json", profiles)
    write_json(export_root / "question-evidence-map.json", questions)
    write_json(export_root / "coverage-matrix.json", coverage)
    con.close()
    print(json.dumps({"db": str(db_path), "json_dir": str(export_root), **summary["counts"], "integrity": integrity, "foreign_key_errors": len(fk_errors)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
