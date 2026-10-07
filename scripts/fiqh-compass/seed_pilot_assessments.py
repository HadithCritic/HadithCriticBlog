#!/usr/bin/env python3
"""Add narrowly scoped, reproducible working assessments to the private store."""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from extract_candidates import normalize_arabic


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def normalized_span(body: str, start_marker: str, end_marker: str) -> tuple[int, int, str]:
    """Find retrieval-normalized markers and map their span to source codepoints."""
    chars: list[str] = []
    offsets: list[int] = []
    pending_space: tuple[str, int] | None = None
    replacements = {"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ؤ": "و", "ئ": "ي", "ى": "ي", "ة": "ه", "ی": "ي", "ک": "ك"}
    for original_i, original_char in enumerate(body):
        for char in unicodedata.normalize("NFKC", original_char):
            if char == "ـ" or unicodedata.category(char) in {"Mn", "Me", "Cf"}:
                continue
            char = replacements.get(char, char)
            if char.isspace() or char == "\u00a0":
                if chars and pending_space is None:
                    pending_space = (" ", original_i)
                continue
            if pending_space is not None:
                chars.append(pending_space[0])
                offsets.append(pending_space[1])
                pending_space = None
            chars.append(char)
            offsets.append(original_i)
    normalized = "".join(chars)
    start_marker = normalize_arabic(start_marker)
    end_marker = normalize_arabic(end_marker)
    nstart = normalized.find(start_marker)
    nend_marker = normalized.find(end_marker, nstart + len(start_marker)) if nstart >= 0 else -1
    if nstart < 0 or nend_marker < 0:
        return -1, -1, normalized
    nend = nend_marker + len(end_marker)
    return offsets[nstart], offsets[nend - 1] + 1, normalized


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, default=Path("scratch/fiqh-compass/fiqh-compass-research.sqlite"))
    parser.add_argument("--assessments", type=Path, default=Path("docs/research/fiqh-compass/pilot-assessments-v1.json"))
    parser.add_argument("--dossiers", type=Path, default=Path("scratch/fiqh-compass/dossiers"))
    args = parser.parse_args()

    db_path = args.db.resolve()
    assessments_path = args.assessments.resolve()
    dossier_dir = args.dossiers.resolve()
    data = read_json(assessments_path)
    if data.get("status") != "editorial research triage; not specialist reviewed":
        raise ValueError("Assessment file must retain its explicit non-specialist status.")

    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys=ON")
    try:
        # Preflight every exact source span before writing any assessment.
        prepared = []
        for a in data["assessments"]:
            passage = con.execute("SELECT * FROM passage WHERE passage_id=?", (a["passage_id"],)).fetchone()
            if not passage:
                raise ValueError(f"Missing source passage: {a['passage_id']}")
            if passage["issue_id"] != a["issue_id"]:
                raise ValueError(f"Issue mismatch for {a['position_id']}")
            if a["author_id"] and a["author_id"] != passage["source_id"]:
                raise ValueError(f"Author/source mismatch for {a['position_id']}")
            body = passage["arabic_verbatim"]
            start, end, _ = normalized_span(body, a["start"], a["end"])
            if start < 0 or end < 0:
                raise ValueError(f"Exact Arabic span markers not found for {a['position_id']}")
            source_span = body[start:end]
            profile_id = None
            if a["author_id"]:
                profile = con.execute("""SELECT ps.profile_id FROM profile_source ps
                  WHERE ps.source_id=? ORDER BY ps.profile_id LIMIT 1""", (a["author_id"],)).fetchone()
                if profile:
                    profile_id = profile["profile_id"]
            prepared.append((a, passage, start, end, sha256(source_span), profile_id))

        con.execute("BEGIN IMMEDIATE")
        for a, passage, start, end, span_hash, profile_id in prepared:
            con.execute("""INSERT INTO position (
              position_id,issue_id,holder_label,author_id,period_label,proposition,reasoning,
              conditions_json,exceptions_json,domain,attribution_type,epistemic_status,
              method_or_ruling,profile_score_allowed,editorial_notes
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(position_id) DO UPDATE SET
              issue_id=excluded.issue_id,holder_label=excluded.holder_label,author_id=excluded.author_id,
              proposition=excluded.proposition,reasoning=excluded.reasoning,
              conditions_json=excluded.conditions_json,exceptions_json=excluded.exceptions_json,
              domain=excluded.domain,attribution_type=excluded.attribution_type,
              epistemic_status=excluded.epistemic_status,method_or_ruling=excluded.method_or_ruling,
              profile_score_allowed=excluded.profile_score_allowed,editorial_notes=excluded.editorial_notes""",
              (a["position_id"],a["issue_id"],a["holder_label"],a["author_id"],None,a["proposition"],a["reasoning"],
               json.dumps(a["conditions"],ensure_ascii=False),json.dumps(a["exceptions"],ensure_ascii=False),
               a["domain"],a["attribution_type"],"candidate",a["method_or_ruling"],0,a["translation_note"]))
            con.execute("DELETE FROM position_evidence WHERE position_id=?", (a["position_id"],))
            con.execute("INSERT INTO position_evidence(position_id,passage_id,support_type,note) VALUES (?,?,?,?)",
                        (a["position_id"],a["passage_id"],a["support_type"],
                         "Editorial candidate assessment only; source context and exact span are stored. Specialist review remains pending."))
            if profile_id and a["attribution_type"] in {"author_statement","author_argument"}:
                con.execute("INSERT OR IGNORE INTO profile_position(profile_id,position_id) VALUES (?,?)",
                            (profile_id,a["position_id"]))
            segment_id = "fcseg:" + sha256(f"{a['passage_id']}:{start}:{end}:en")[:24]
            con.execute("""INSERT INTO translation_segment(
              segment_id,passage_id,source_start_char,source_end_char,source_span_sha256,
              language,translation,translator,translation_status,notes
            ) VALUES (?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(segment_id) DO UPDATE SET source_start_char=excluded.source_start_char,
              source_end_char=excluded.source_end_char,source_span_sha256=excluded.source_span_sha256,
              translation=excluded.translation,translator=excluded.translator,
              translation_status=excluded.translation_status,notes=excluded.notes""",
              (segment_id,a["passage_id"],start,end,span_hash,"en",a["translation"],
               "Codex working translation",data["translation_status"],a["translation_note"]))
            con.execute("INSERT OR IGNORE INTO position_evidence(position_id,passage_id,support_type,note) VALUES (?,?,?,?)",
                        (a["position_id"],a["passage_id"],a["support_type"],
                         "Linked to exact hashed translation segment " + segment_id + "."))
            review_id = "fcreview:" + sha256("pilot-triage-v1:" + a["position_id"])[:24]
            con.execute("""INSERT OR REPLACE INTO review_event(
              review_id,object_type,object_id,reviewer_role,reviewer_label,reviewed_utc,
              finding,change_summary,disagreement_open
            ) VALUES (?,?,?,?,?,?,?,?,?)""",
              (review_id,"position",a["position_id"],"automated_editorial_triage","Codex research triage",
               datetime.now(timezone.utc).isoformat(),
               "Provisional reading recorded for research organization; not specialist fiqh review or translation approval.",
               "Added bounded proposition, conditions, attribution type, exact source span, and working translation.",1))

        # Keep issue dossier JSON synchronized without copying source pages into tracked files.
        for issue_id in sorted({a["issue_id"] for a in data["assessments"]}):
            path = dossier_dir / f"{issue_id}.json"
            dossier = read_json(path)
            issue_assessments = [a for a in data["assessments"] if a["issue_id"] == issue_id]
            dossier["positions"] = [{
                "position_id": a["position_id"], "holder_label": a["holder_label"],
                "proposition": a["proposition"], "reasoning": a["reasoning"],
                "conditions": a["conditions"], "exceptions": a["exceptions"],
                "domain": a["domain"], "attribution_type": a["attribution_type"],
                "epistemic_status": "candidate", "method_or_ruling": a["method_or_ruling"],
                "profile_score_allowed": False, "passage_id": a["passage_id"],
                "review_status": "automated editorial triage only; specialist review pending",
                "translation_status": "working_draft"
            } for a in issue_assessments]
            dossier["candidate_assessment_note"] = "Candidate interpretations are explicitly provisional; quotations, method arguments, attributed views, and case-specific holdings must not be collapsed."
            dossier["review_gates"] = {**dossier.get("review_gates", {}), "specialist_fiqh_review": "pending", "arabic_translation_review": "pending", "scan_collation": "pending", "rights_review": "pending"}
            path.write_text(json.dumps(dossier,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")

        con.commit()
        print(json.dumps({"assessments":len(prepared),"positions":con.execute("SELECT COUNT(*) FROM position").fetchone()[0],
          "translation_segments":con.execute("SELECT COUNT(*) FROM translation_segment").fetchone()[0],
          "profile_position_links":con.execute("SELECT COUNT(*) FROM profile_position").fetchone()[0],
          "review_events":con.execute("SELECT COUNT(*) FROM review_event").fetchone()[0],
          "all_scores_disabled":con.execute("SELECT COUNT(*) FROM position WHERE profile_score_allowed<>0").fetchone()[0]==0},ensure_ascii=False,indent=2))
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


if __name__ == "__main__":
    main()
