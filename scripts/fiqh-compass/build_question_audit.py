#!/usr/bin/env python3
"""Build the question-to-evidence audit without promoting machine hits."""
from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, default=Path("scratch/fiqh-compass/fiqh-compass-research.sqlite"))
    parser.add_argument("--seed", type=Path, default=Path("scratch/fiqh-compass/seed-data.json"))
    parser.add_argument("--notes", type=Path, default=Path("docs/research/fiqh-compass/question-audit-notes-v1.json"))
    parser.add_argument("--out", type=Path, default=Path("docs/research/fiqh-compass/question-evidence-audit-v1.json"))
    args = parser.parse_args()
    seed = json.loads(args.seed.read_text(encoding="utf-8"))
    notes = json.loads(args.notes.read_text(encoding="utf-8"))["notes"]
    con = sqlite3.connect(f"file:{args.db.resolve().as_posix()}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    plans = json.loads(Path("scripts/fiqh-compass/retrieval-plans-v1.json").read_text(encoding="utf-8"))
    issue_titles = {issue_id: value["label"] for issue_id, value in plans.items()}
    questions = []
    for q in seed["questions"]:
        qid = q["question_id"]
        maps = con.execute("""SELECT qm.issue_id,qm.direction,qm.mapping_status,i.question
          FROM question_mapping qm JOIN issue i USING(issue_id) WHERE qm.question_id=? ORDER BY qm.issue_id""", (qid,)).fetchall()
        issue_rows = []
        for row in maps:
            candidates = con.execute("SELECT COUNT(*) FROM passage WHERE issue_id=?", (row["issue_id"],)).fetchone()[0]
            linked_positions = [x[0] for x in con.execute("""SELECT DISTINCT pe.position_id FROM position_evidence pe
              JOIN passage p USING(passage_id) WHERE p.issue_id=? ORDER BY pe.position_id""", (row["issue_id"],))]
            issue_rows.append({"issue_id":row["issue_id"],"issue_title":issue_titles.get(row["issue_id"]),
              "research_question":row["question"],"mapping_status":row["mapping_status"],
              "retrieved_candidate_count":candidates,"curated_candidate_positions":linked_positions})
        note = notes[qid]
        audit_status = note.get("audit_status", "retrieval_only_unreviewed")
        if audit_status not in {"partial_candidate_evidence", "retrieval_only_unreviewed"}:
            raise ValueError(f"Unsupported question audit status for {qid}: {audit_status}")
        questions.append({"question_id":qid,"axis_id":q["axis_id"],"direction":q.get("direction"),"prompt":q["prompt"],
          "audit_status":audit_status,
          "editorial_finding":note["finding"],"recommendation":note["recommendation"],
          "mapped_issues":issue_rows,"scoring_status":"provisional; no historical score authorized"})
    con.close()
    out = {"schema_version":"1.0.0","generated_from_seed_version":seed.get("source_content_version"),
      "status":"editorial audit of all seeded questions; not comprehension-tested or specialist-reviewed",
      "counts":{"questions":len(questions),"partial_candidate_evidence":sum(q["audit_status"]=="partial_candidate_evidence" for q in questions),
        "retrieval_only_unreviewed":sum(q["audit_status"]=="retrieval_only_unreviewed" for q in questions),
        "provisional_mappings_retained":sum(len(q["mapped_issues"]) for q in questions)},"questions":questions}
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(out["counts"],indent=2))


if __name__ == "__main__":
    main()
