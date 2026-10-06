#!/usr/bin/env python3
"""Extract local, unreviewed text candidates for the planned M1 issues.

Nothing emitted here is a fiqh conclusion. Exact source rows and adjacent row
context are kept under the ignored scratch directory because Shamela rights
remain unresolved.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb


SEARCH_PROFILE = "fiqh-ar-normalize-v1"
PILOT_QUERIES: dict[str, dict[str, Any]] = {
    "I01": {
        "label": "Extra-Qurʾānic authority",
        "sources": ["8180", "1655", "6301", "10432", "11435"],
        "terms": ["طاعة الرسول", "أطيعوا الرسول", "فرض رسول الله", "فرض الله في كتابه", "فرض الله طاعة رسوله", "الكتاب والسنة", "بيان النبي", "بيان رسول الله", "حكم رسول الله", "ما أحل رسول الله", "ما حرم رسول الله", "حرام رسول الله", "السنة مع الكتاب", "ليس في كتاب الله", "ليس في القرآن", "اتباع السنة", "بيان السنة", "ما أنزل الله في كتابه", "حجية السنة"],
        "scope": "Locate authorial statements and arguments about the relationship between Qurʾān and Sunna as sources of binding legal requirements. Keep this distinct from the authenticity or sufficiency of a particular report.",
    },
    "I02": {
        "label": "Report sufficiency",
        "sources": ["8180", "6301", "10432", "21739", "21113", "7492"],
        "terms": ["خبر الواحد", "خبر الواحد العدل", "خبر واحد", "الخبر الواحد", "خبر الآحاد", "آحاد الأخبار", "خبر الثقة", "الراوي الواحد", "خبر من الثقات", "متواتر", "التواتر", "المتواتر", "مستفيض", "الخبر المستفيض", "ما يوجب العلم", "العلم بخبر الواحد", "عدد الرواة", "قبول خبر الواحد"],
        "scope": "Locate methodological or case-specific treatment of reports with limited routes of transmission. Record conditions such as narrator reliability, corroboration, public practice, domain, and epistemic/legal effect separately.",
    },
    "I07": {
        "label": "Analogy (qiyās)",
        "sources": ["8180", "6301", "10432", "21739", "8463", "11435"],
        "terms": ["القياس", "القياس على", "القياس في", "الاستدلال بالقياس", "العمل بالقياس", "حجية القياس", "قياسا", "قاس على", "يقاس على", "علة الحكم", "علّة الحكم", "العلة", "الأصل والفرع", "حكم الأصل", "إلحاق الفرع", "الجامع بين الأصل والفرع", "العلة الجامعة", "قياس الشبه"],
        "scope": "Locate explicit argument about analogical extension, its conditions, and its permitted domains. Distinguish qiyās from interpretation of general wording, identification of facts, and other forms of reasoning.",
    },
    "I11": {
        "label": "Custom (ʿurf)",
        "sources": ["587", "5423", "8463", "11435", "21739", "1655"],
        "terms": ["العرف", "العرف والعادة", "العادة", "في عرف الناس", "في العرف", "ما تعارف", "عادة الناس", "من عادتهم", "عرف الناس", "بالعرف", "عرفا", "المعروف عرفا", "المعروف في الاستعمال", "الاستعمال في العرف", "ما جرى به العرف", "تعارف الناس"],
        "scope": "Locate passages where custom affects legal meaning, facts, contractual terms, obligation fulfillment, or outcomes. Record which role custom plays and whether the case is bounded by validity conditions.",
    },
    "I16": {
        "label": "Default status under uncertainty",
        "sources": ["6301", "10432", "5423", "767", "8463", "11435", "1655"],
        "terms": ["الأصل في الأشياء", "الأصل في الأفعال", "الأصل في العادات", "الأصل الإباحة", "الأصل هو الإباحة", "الأصل في الأشياء الإباحة", "الأصل في الأشياء الحظر", "البراءة الأصلية", "استصحاب البراءة", "الأصل عدم التحريم", "لا يحرم شيء", "لا تحريم إلا بنص", "حتى يرد الدليل", "حتى يرد فيه نهي", "ما لم يرد به نهي", "الأصل براءة الذمة", "استصحاب الحكم"],
        "scope": "Locate statements about the default status of ordinary activities or transactions when no prohibition has been established. Separate that question from worship, evidentiary burden, precaution, and domain-specific exceptions.",
    },
}


def normalize_arabic(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).replace("ـ", "")
    chars = []
    for char in value:
        category = unicodedata.category(char)
        if category in {"Mn", "Me", "Cf"}:
            continue
        char = {
            "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",
            "ؤ": "و", "ئ": "ي", "ى": "ي", "ة": "ه",
            "ی": "ي", "ک": "ك",
        }.get(char, char)
        chars.append(char)
    value = "".join(chars)
    value = re.sub(r"[\s\u00a0]+", " ", value)
    return value.strip()


def normalized_locator(value: Any) -> str | None:
    raw = None if value is None else str(value)
    if raw is None or raw.strip().casefold() in {"", "none", "null", "nan"}:
        return None
    return raw


def passage_key(source_id: str, serial: str, issue_id: str) -> str:
    digest = hashlib.sha256(f"{source_id}\0{serial}\0{issue_id}\0{SEARCH_PROFILE}".encode("utf-8")).hexdigest()
    return "fcpass:" + digest[:24]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--parquet", type=Path, required=True)
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--plans", type=Path, default=Path("scripts/fiqh-compass/retrieval-plans-v1.json"))
    parser.add_argument("--shortlist-per-source", type=int, default=8)
    parser.add_argument("--additive", action="store_true", help="Keep existing passage/review links and only insert new candidate rows")
    args = parser.parse_args()
    parquet, db_path, out_dir = args.parquet.resolve(), args.db.resolve(), args.out.resolve()
    plans_path = args.plans.resolve()
    plans = json.loads(plans_path.read_text(encoding="utf-8")) if plans_path.exists() else PILOT_QUERIES
    if not plans or any(not value.get("sources") or not value.get("terms") for value in plans.values()):
        raise ValueError("Every issue plan must list at least one source and one retrieval term.")
    out_dir.mkdir(parents=True, exist_ok=True)

    all_ids = sorted({str(book_id) for plan in plans.values() for book_id in plan["sources"]})
    ids_sql = ",".join("'" + book_id + "'" for book_id in all_ids)
    con = duckdb.connect(database=":memory:")
    con.execute("PRAGMA threads=4")
    cursor = con.execute(f"""
      SELECT book_id, serial_number, volume_number, page_number, text, foot_note
      FROM read_parquet(?)
      WHERE trim(book_id) IN ({ids_sql})
      ORDER BY book_id, TRY_CAST(serial_number AS BIGINT), serial_number
    """, [str(parquet)])
    by_book: dict[str, list[dict[str, Any]]] = defaultdict(list)
    columns = [col[0] for col in cursor.description]
    while rows := cursor.fetchmany(1500):
        for row in rows:
            record = dict(zip(columns, row))
            book_id = str(record["book_id"]).strip()
            record["serial_number"] = str(record["serial_number"])
            record["_norm_text"] = normalize_arabic(str(record.get("text") or ""))
            record["_norm_footnote"] = normalize_arabic(str(record.get("foot_note") or ""))
            by_book[book_id].append(record)

    db = sqlite3.connect(db_path)
    db.execute("PRAGMA foreign_keys = ON")
    with db:
        for issue_id, plan in plans.items():
            # By default a changed retrieval plan replaces the issue's machine
            # candidates. Additive mode is required when any candidate may
            # already have translation, assessment, or position-evidence links.
            if not args.additive:
                db.execute("DELETE FROM question_evidence WHERE passage_id IN (SELECT passage_id FROM passage WHERE issue_id=?)", (issue_id,))
                db.execute("DELETE FROM passage WHERE issue_id=?", (issue_id,))
            per_source: dict[str, dict[str, Any]] = {}
            for book_id in plan["sources"]:
                rows = by_book.get(book_id, [])
                row_by_serial = {row["serial_number"]: index for index, row in enumerate(rows)}
                matches = []
                for index, row in enumerate(rows):
                    text_norm = row["_norm_text"]
                    footnote_norm = row["_norm_footnote"]
                    matched = []
                    for term in plan["terms"]:
                        needle = normalize_arabic(term)
                        fields = []
                        if needle and needle in text_norm:
                            fields.append("text")
                        if needle and needle in footnote_norm:
                            fields.append("foot_note")
                        if fields:
                            matched.append({"term": term, "fields": fields})
                    if not matched:
                        continue
                    serial = row["serial_number"]
                    volume_raw = None if row.get("volume_number") is None else str(row["volume_number"])
                    page_raw = None if row.get("page_number") is None else str(row["page_number"])
                    prior = rows[index - 1] if index > 0 and str(rows[index - 1].get("volume_number")) == str(row.get("volume_number")) else None
                    following = rows[index + 1] if index + 1 < len(rows) and str(rows[index + 1].get("volume_number")) == str(row.get("volume_number")) else None
                    body = str(row.get("text") or "")
                    footnote = str(row.get("foot_note") or "")
                    if footnote.strip().casefold() in {"", "none", "null", "nan"}:
                        footnote = ""
                    source_id = "shamela:" + book_id
                    row_digest = hashlib.sha256((body + "\n" + footnote).encode("utf-8")).hexdigest()
                    pid = passage_key(source_id, serial, issue_id)
                    digital_volume = normalized_locator(volume_raw)
                    digital_page = normalized_locator(page_raw)
                    quality = []
                    if digital_page is None:
                        quality.append(f"Page locator is missing/sentinel; raw page_number={page_raw!r}.")
                    if not body.strip() or body.strip().casefold() in {"none", "null", "nan"}:
                        quality.append("Text field is blank or a sentinel; candidate must not be used as evidence.")
                    if footnote:
                        quality.append("The hit may also occur in a separately stored footnote; verify the matched field.")
                    before = str(prior.get("text") or "") if prior else ""
                    after = str(following.get("text") or "") if following else ""
                    if before.strip().casefold() in {"none", "null", "nan"}:
                        before = ""
                    if after.strip().casefold() in {"none", "null", "nan"}:
                        after = ""
                    db.execute("""
                      INSERT OR IGNORE INTO passage (
                        passage_id,source_id,corpus_serial,corpus_row_key,issue_id,
                        retrieval_query,retrieval_profile,matched_terms_json,arabic_verbatim,
                        context_before_ar,context_after_ar,footnote_verbatim,digital_volume_raw,digital_page_raw,
                        digital_volume,digital_page,printed_volume,printed_page,page_scan_uri,source_text_sha256,
                        attribution_type,extraction_status,text_quality_notes,rights_status
                      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                    """, (
                        pid,source_id,serial,serial,issue_id,
                        plan["label"],SEARCH_PROFILE,json.dumps(matched,ensure_ascii=False),body,
                        before,after,footnote or None,volume_raw,page_raw,digital_volume,digital_page,
                        None,None,None,row_digest,"unresolved","machine_candidate"," ".join(quality),"needs_review",
                    ))
                    for q in db.execute("SELECT question_id FROM question_mapping WHERE issue_id=?", (issue_id,)).fetchall():
                        db.execute("INSERT OR IGNORE INTO question_evidence(question_id,passage_id,relevance_status,note) VALUES (?,?,?,?)", (q[0],pid,"unreviewed","Machine-retrieved candidate for the linked issue; direct fit to this question has not been assessed."))
                    matches.append({
                        "passage_id": pid,
                        "source_id": source_id,
                        "corpus_row_key": serial,
                        "digital_volume_raw": volume_raw,
                        "digital_page_raw": page_raw,
                        "digital_volume": digital_volume,
                        "digital_page": digital_page,
                        "matched_terms": matched,
                        "arabic_verbatim": body,
                        "context_before_ar": before,
                        "context_after_ar": after,
                        "footnote_verbatim": footnote or None,
                        "source_text_sha256": row_digest,
                        "attribution_type": "unresolved",
                        "extraction_status": "machine_candidate",
                        "translation_en": None,
                        "translation_status": "not_started",
                        "text_quality_notes": quality,
                        "edition_status": "metadata recorded; printed/scan collation pending",
                        "rights_status": "needs_review",
                    })
                per_source[book_id] = {"candidate_passages": len(matches), "matches": matches}
            per_issue_count = sum(v["candidate_passages"] for v in per_source.values())
            for source_id, source_report in per_source.items():
                source_report["total_candidate_passages"] = source_report["candidate_passages"]
                ranked = sorted(source_report.pop("matches"), key=lambda match: (
                    -sum(1 for hit in match["matched_terms"] if "text" in hit["fields"]),
                    -len(match["matched_terms"]),
                    0 if match["digital_page"] is not None else 1,
                    int(match["corpus_row_key"]),
                ))
                source_report["matches"] = ranked[:max(0, args.shortlist_per_source)]
                source_report["omitted_from_dossier_export"] = max(0, source_report["total_candidate_passages"] - len(source_report["matches"]))
            db.execute("UPDATE issue SET dossier_status=? WHERE issue_id=?", ("candidate_evidence" if per_issue_count else "unresolved", issue_id))
            write_json(out_dir / "dossiers" / f"{issue_id}.json", {
                "schema_version": "1.0.0",
                "issue_id": issue_id,
                "issue_title": plan["label"],
                "roadmap_question": db.execute("SELECT question FROM issue WHERE issue_id=?", (issue_id,)).fetchone()[0],
                "research_scope": plan["scope"],
                "dossier_status": "candidate_evidence" if per_issue_count else "unresolved",
                "candidate_passage_count": per_issue_count,
                "sources_searched": plan["sources"],
                "retrieval_profile": SEARCH_PROFILE,
                "retrieval_terms": plan["terms"],
                "retrieval_scope_note": "All listed Shamela rows were searched locally with this lossy normalized copy; exact Arabic for every candidate remains in the private SQLite store. The dossier export includes a ranked discovery shortlist per source. These lexical hits are not positions or evidence until context, attribution, edition, relevance, and source text are reviewed.",
                "shortlist_per_source": args.shortlist_per_source,
                "source_candidates": per_source,
                "positions": [],
                "unresolved_questions": ["Which passages state the author's own view?", "Which apparent positions are quotations, reports, opponents' views, or later attributions?", "What conditions, exceptions, and domain restrictions govern each position?", "Can the locator and wording be collated against the named printed edition or scan?"],
                "review_gates": {"specialist_fiqh_review": "pending", "arabic_translation_review": "pending", "scan_collation": "pending", "rights_review": "pending"},
            })
            write_json(out_dir / "retrieval-plan" / f"{issue_id}.json", {"issue_id":issue_id,"retrieval_profile":SEARCH_PROFILE,"sources":plan["sources"],"terms":plan["terms"],"scope":plan["scope"]})

    db.commit()
    db.close()
    reconciliation_path = out_dir / "reconciliation.json"
    reconciliation = json.loads(reconciliation_path.read_text(encoding="utf-8")) if reconciliation_path.exists() else {}
    parquet_sha256 = reconciliation.get("inputs", {}).get("parquet", {}).get("sha256")
    report = {
        "schema_version": "1.0.0",
        "retrieved_utc": datetime.now(timezone.utc).isoformat(),
        "parquet_sha256": parquet_sha256,
        "parquet_path": str(parquet),
        "plans_sha256": hashlib.sha256(plans_path.read_bytes()).hexdigest() if plans_path.exists() else None,
        "retrieval_profile": SEARCH_PROFILE,
        "source_ids_loaded": len(by_book),
        "issues": {issue_id: {"sources_searched": plan["sources"], "candidate_passages": sum(1 for row in db_query_passages(args.db, issue_id)), "terms": plan["terms"]} for issue_id, plan in plans.items()},
        "all_matches_unreviewed": True,
        "positions_created": 0,
        "rights_status": "needs_review; exports remain in ignored scratch",
    }
    write_json(out_dir / "candidate-retrieval-report.json", report)
    print(json.dumps({"source_ids_loaded": len(by_book), "issues": {k:v["candidate_passages"] for k,v in report["issues"].items()}, "total_candidates": sum(v["candidate_passages"] for v in report["issues"].values()), "out": str(out_dir)}, ensure_ascii=False, indent=2))


def db_query_passages(db_path: Path, issue_id: str) -> list[tuple[Any, ...]]:
    con = sqlite3.connect(db_path)
    try:
        return con.execute("SELECT passage_id FROM passage WHERE issue_id=?", (issue_id,)).fetchall()
    finally:
        con.close()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
