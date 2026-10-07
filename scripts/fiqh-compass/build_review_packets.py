#!/usr/bin/env python3
"""Build private human-review packets from the ignored Fiqh Compass SQLite store.

The output intentionally remains under scratch/ (ignored). It contains corpus
text and is not suitable for publication or onward distribution before rights
review. It does not record or imply scholarly approval.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import unicodedata
from pathlib import Path


def normalize_arabic(text: str) -> str:
    text = "".join(
        char
        for char in unicodedata.normalize("NFKC", text)
        if unicodedata.category(char) not in {"Mn", "Me", "Cf"} and char != "ـ"
    )
    for source, target in (("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ٱ", "ا"), ("ى", "ي")):
        text = text.replace(source, target)
    return text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--assessments", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    assessment_doc = json.loads(args.assessments.read_text(encoding="utf-8"))
    assessments = assessment_doc["assessments"]
    con = sqlite3.connect(args.db)
    con.row_factory = sqlite3.Row
    packets: list[dict] = []
    for a in assessments:
        row = con.execute(
            """SELECT p.passage_id, p.issue_id, p.arabic_verbatim,
                      p.context_before_ar, p.context_after_ar, p.footnote_verbatim,
                      p.digital_volume, p.digital_page, p.printed_volume, p.printed_page,
                      p.source_text_sha256, p.attribution_type, p.extraction_status,
                      p.text_quality_notes, p.rights_status AS passage_rights,
                      s.shamela_book_id, s.title_ar, s.author_as_catalogued_ar,
                      s.editor_raw, s.publisher_raw, s.edition_raw,
                      s.identity_status, s.edition_review_status,
                      s.rights_status AS source_rights
                 FROM passage p JOIN source_record s ON s.source_id=p.source_id
                WHERE p.passage_id=?""",
            (a["passage_id"],),
        ).fetchone()
        if row is None:
            raise SystemExit(f"Missing passage for {a['position_id']}: {a['passage_id']}")
        segments = [dict(x) for x in con.execute(
            """SELECT source_start_char, source_end_char, source_span_sha256,
                      language, translation, translator, translation_status, notes
                 FROM translation_segment WHERE passage_id=? ORDER BY language, source_start_char""",
            (a["passage_id"],),
        )]
        # Arabic assessment anchors may omit diacritics. Check them only in a
        # lossy normalized copy; preserve the exact corpus text below.
        source_text = row["arabic_verbatim"]
        normalized_source = normalize_arabic(source_text)
        for segment in segments:
            start, end = segment["source_start_char"], segment["source_end_char"]
            if end > len(source_text):
                raise SystemExit(f"Translation span exceeds source row for {a['position_id']}")
            actual_hash = hashlib.sha256(source_text[start:end].encode("utf-8")).hexdigest()
            if actual_hash != segment["source_span_sha256"]:
                raise SystemExit(f"Translation span hash mismatch for {a['position_id']}")
        anchor_status = {
            "start_exact_match": bool(a.get("start")) and a["start"] in source_text,
            "start_normalized_match": bool(a.get("start")) and normalize_arabic(a["start"]) in normalized_source,
            "end_exact_match": bool(a.get("end")) and a["end"] in source_text,
            "end_normalized_match": bool(a.get("end")) and normalize_arabic(a["end"]) in normalized_source,
            "note": "Anchor checks use lossy normalization only for validation; quoted Arabic remains the exact source row.",
        }
        if not anchor_status["start_normalized_match"] or not anchor_status["end_normalized_match"]:
            raise SystemExit(f"Assessment anchor not found even after Arabic normalization for {a['position_id']}")
        packet = {
            "packet_status": "private review aid; no reviewer response recorded",
            "rights_notice": "Restricted project research text. Do not redistribute or publish until rights are checked.",
            "position": {k: a.get(k) for k in (
                "position_id", "passage_id", "issue_id", "holder_label", "author_id", "proposition",
                "reasoning", "conditions", "exceptions", "domain", "attribution_type",
                "method_or_ruling", "translation", "translation_note", "translation_status"
            )},
            "source_record": dict(row),
            "passage_context": {
                "context_before_ar": row["context_before_ar"],
                "arabic_verbatim": source_text,
                "context_after_ar": row["context_after_ar"],
                "footnote_verbatim": row["footnote_verbatim"],
                "translation_segments": segments,
                "assessment_anchor_check": anchor_status,
            },
            "review_form": {
                "reviewer_code": None,
                "reviewer_role_and_relevant_competence": None,
                "sources_or_editions_consulted": [],
                "reviewed_on": None,
                "claim_finding": None,
                "attribution_finding": None,
                "scope_and_conditions": None,
                "reasoning_finding": None,
                "translation_finding": None,
                "counterevidence_or_variation": None,
                "edition_scan_locator_finding": None,
                "rights_finding": None,
                "proposed_corrections": [],
                "unresolved_disagreement": None,
            },
        }
        packets.append(packet)

    args.out.mkdir(parents=True, exist_ok=True)
    for packet in packets:
        pos = packet["position"]["position_id"]
        safe_pos = "".join(char if char.isalnum() or char in "-_" else "_" for char in pos)
        (args.out / f"{safe_pos}.json").write_text(
            json.dumps(packet, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    index = {
        "status": "private generated packet index; not a review-completion record",
        "assessment_source": str(args.assessments),
        "database": str(args.db),
        "packet_count": len(packets),
        "counts": {
            "reviewer_responses": 0,
            "specialist_approvals": 0,
            "bilingual_approvals": 0,
            "rights_cleared": 0,
            "edition_scan_verified": 0,
        },
        "packets": [
            {
                "position_id": p["position"]["position_id"],
                "issue_id": p["position"]["issue_id"],
                "passage_id": p["position"]["passage_id"],
                "status": "candidate; review pending",
            }
            for p in packets
        ],
    }
    (args.out / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    con.close()
    print(f"Built {len(packets)} private candidate review packets at {args.out}")


if __name__ == "__main__":
    main()
