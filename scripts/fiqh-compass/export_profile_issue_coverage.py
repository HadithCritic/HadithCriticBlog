#!/usr/bin/env python3
"""Export a candidate-only profile × issue coverage matrix from the private store.

The export contains identifiers, counts, and review-state metadata only. It never
exports passage text and does not treat retrieval or candidate links as reviewed
evidence or scoring eligibility.
"""

from __future__ import annotations

import argparse
import csv
import json
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / "scratch/fiqh-compass/fiqh-compass-research.sqlite"
DEFAULT_CSV = ROOT / "docs/research/fiqh-compass/profile-issue-coverage-v1.csv"
DEFAULT_SUMMARY = ROOT / "docs/research/fiqh-compass/profile-issue-coverage-v1.md"


def grouped_values(values: list[str]) -> str:
    return "; ".join(sorted({value for value in values if value}))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--out", type=Path, default=DEFAULT_CSV)
    parser.add_argument("--summary", type=Path, default=DEFAULT_SUMMARY)
    args = parser.parse_args()
    if not args.db.is_file():
        parser.error(f"research database does not exist: {args.db}")

    db_uri = f"file:{args.db.resolve().as_posix()}?mode=ro"
    con = sqlite3.connect(db_uri, uri=True)
    con.row_factory = sqlite3.Row
    try:
        profiles = con.execute(
            "SELECT profile_id, display_name, period_label, tradition_label, "
            "status, coordinates_status FROM profile ORDER BY profile_id"
        ).fetchall()
        issues = con.execute(
            "SELECT issue_id, issue_group_id, question, dossier_status "
            "FROM issue ORDER BY issue_id"
        ).fetchall()
        position_states = Counter(
            {row["epistemic_status"]: row["n"] for row in con.execute(
                "SELECT epistemic_status, COUNT(*) AS n FROM position GROUP BY epistemic_status"
            )}
        )
        sources_by_profile: dict[str, list[sqlite3.Row]] = defaultdict(list)
        for row in con.execute(
            "SELECT profile_id, source_id, role FROM profile_source "
            "ORDER BY profile_id, source_id, role"
        ):
            sources_by_profile[row["profile_id"]].append(row)

        fields = [
            "profile_id", "profile_name", "period_label", "tradition_label",
            "profile_status", "coordinates_status", "issue_id", "issue_group_id",
            "dossier_status", "position_candidate_count", "position_epistemic_statuses",
            "position_attribution_types", "position_domains", "position_evidence_link_count",
            "position_evidence_passage_count", "source_linked_passage_count",
            "source_linked_passage_statuses", "translation_segment_count_by_language_status",
            "position_review_event_count", "source_ids", "source_roles",
            "source_identity_review_states", "source_edition_review_states",
            "source_rights_states", "coverage_state",
        ]
        output: list[dict[str, object]] = []
        totals: Counter[str] = Counter()
        for profile in profiles:
            profile_id = profile["profile_id"]
            source_rows = sources_by_profile.get(profile_id, [])
            source_ids = sorted({r["source_id"] for r in source_rows})
            source_roles = grouped_values([r["role"] for r in source_rows])
            source_meta: list[sqlite3.Row] = []
            if source_ids:
                marks = ",".join("?" for _ in source_ids)
                source_meta = con.execute(
                    f"SELECT source_id, identity_status, edition_review_status, rights_status "
                    f"FROM source_record WHERE source_id IN ({marks}) ORDER BY source_id",
                    source_ids,
                ).fetchall()

            for issue in issues:
                issue_id = issue["issue_id"]
                position_rows = con.execute(
                    "SELECT p.position_id, p.domain, p.attribution_type, p.epistemic_status "
                    "FROM position p JOIN profile_position pp USING(position_id) "
                    "WHERE pp.profile_id=? AND p.issue_id=? ORDER BY p.position_id",
                    (profile_id, issue_id),
                ).fetchall()
                position_ids = [r["position_id"] for r in position_rows]
                evidence_link_count = 0
                evidence_passage_ids: set[str] = set()
                translation_counts: Counter[tuple[str, str]] = Counter()
                review_event_count = 0
                if position_ids:
                    marks = ",".join("?" for _ in position_ids)
                    evidence_rows = con.execute(
                        f"SELECT position_id, passage_id FROM position_evidence "
                        f"WHERE position_id IN ({marks}) ORDER BY position_id, passage_id",
                        position_ids,
                    ).fetchall()
                    evidence_link_count = len(evidence_rows)
                    evidence_passage_ids = {r["passage_id"] for r in evidence_rows}
                    review_event_count = con.execute(
                        f"SELECT COUNT(*) FROM review_event WHERE object_type='position' "
                        f"AND object_id IN ({marks})",
                        position_ids,
                    ).fetchone()[0]

                passage_records: list[sqlite3.Row] = []
                if source_ids:
                    marks = ",".join("?" for _ in source_ids)
                    passage_records = con.execute(
                        f"SELECT passage_id, extraction_status FROM passage "
                        f"WHERE issue_id=? AND source_id IN ({marks}) "
                        "ORDER BY passage_id",
                        [issue_id, *source_ids],
                    ).fetchall()
                passage_count = len(passage_records)
                passage_statuses = Counter(r["extraction_status"] for r in passage_records)
                all_passage_ids = evidence_passage_ids | {r["passage_id"] for r in passage_records}
                if all_passage_ids:
                    marks = ",".join("?" for _ in all_passage_ids)
                    for row in con.execute(
                        f"SELECT language, translation_status, COUNT(*) AS n "
                        f"FROM translation_segment WHERE passage_id IN ({marks}) "
                        "GROUP BY language, translation_status ORDER BY language, translation_status",
                        sorted(all_passage_ids),
                    ):
                        translation_counts[(row["language"], row["translation_status"])] = row["n"]
                position_count = len(position_rows)
                if position_count:
                    coverage_state = "profile_position_candidates_unreviewed"
                elif passage_count:
                    coverage_state = "source_linked_passages_only_unreviewed"
                else:
                    coverage_state = "no_source_linked_candidate_in_current_store"
                totals[coverage_state] += 1
                output.append({
                    "profile_id": profile_id,
                    "profile_name": profile["display_name"],
                    "period_label": profile["period_label"],
                    "tradition_label": profile["tradition_label"],
                    "profile_status": profile["status"],
                    "coordinates_status": profile["coordinates_status"],
                    "issue_id": issue_id,
                    "issue_group_id": issue["issue_group_id"],
                    "dossier_status": issue["dossier_status"],
                    "position_candidate_count": position_count,
                    "position_epistemic_statuses": grouped_values([r["epistemic_status"] for r in position_rows]),
                    "position_attribution_types": grouped_values([r["attribution_type"] for r in position_rows]),
                    "position_domains": grouped_values([r["domain"] for r in position_rows]),
                    "position_evidence_link_count": evidence_link_count,
                    "position_evidence_passage_count": len(evidence_passage_ids),
                    "source_linked_passage_count": passage_count,
                    "source_linked_passage_statuses": "; ".join(f"{status}={count}" for status, count in sorted(passage_statuses.items())),
                    "translation_segment_count_by_language_status": "; ".join(f"{language}/{status}={count}" for (language, status), count in sorted(translation_counts.items())),
                    "position_review_event_count": review_event_count,
                    "source_ids": ";".join(source_ids),
                    "source_roles": source_roles,
                    "source_identity_review_states": grouped_values([r["identity_status"] for r in source_meta]),
                    "source_edition_review_states": grouped_values([r["edition_review_status"] for r in source_meta]),
                    "source_rights_states": grouped_values([r["rights_status"] for r in source_meta]),
                    "coverage_state": coverage_state,
                })
    finally:
        con.close()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields, extrasaction="raise")
        writer.writeheader()
        writer.writerows(output)

    summary_lines = [
        "# Profile × issue coverage matrix",
        "",
        "Generated from the private Fiqh Compass SQLite store by `scripts/fiqh-compass/export_profile_issue_coverage.py`.",
        "",
        "This export contains metadata and counts only; it does not include Arabic passages or translations. It is an inventory of current database links, not a scholarly review, a coverage claim, or authorization to score.",
        "",
        f"- Profiles: {len(profiles)}",
        f"- Issues: {len(issues)}",
        f"- Profile × issue cells: {len(output)}",
        f"- Position epistemic states as stored: {', '.join(f'{state}={count}' for state, count in sorted(position_states.items()))}",
        "- No cell state in this export grants score eligibility.",
        "- Coverage CSV: `profile-issue-coverage-v1.csv`",
        "",
        "## Cell-state counts",
        "",
        "| State | Cells | Meaning |",
        "|---|---:|---|",
        f"| `profile_position_candidates_unreviewed` | {totals['profile_position_candidates_unreviewed']} | A profile-position link exists; review status and attribution remain as stored, and no score is implied. |",
        f"| `source_linked_passages_only_unreviewed` | {totals['source_linked_passages_only_unreviewed']} | At least one linked source has passage rows for the issue, but no profile-position link exists. Retrieval is not relevance review. |",
        f"| `no_source_linked_candidate_in_current_store` | {totals['no_source_linked_candidate_in_current_store']} | No current source-linked position or passage candidate was found for that cell; this is not proof of absence. |",
        "",
        "## Field interpretation",
        "",
        "Position candidate counts, attribution types, domains, evidence links, translation-segment states, source identity/edition/rights states, profile period/tradition, and issue dossier state are exported separately. Source-linked passage counts include only records attached to that profile's currently linked source IDs and issue ID. Counts must not be summed as independent evidence without deduplication.",
        "",
        "A cell marked as lacking a current candidate is an acquisition/retrieval prompt. A cell with candidates still requires source and edition identification, complete-context review, attribution analysis, bilingual review, rights determination, and documented specialist evaluation before any historical comparison can be published.",
        "",
    ]
    args.summary.write_text("\n".join(summary_lines), encoding="utf-8")
    print(json.dumps({
        "profiles": len(profiles), "issues": len(issues), "cells": len(output),
        "cell_states": dict(sorted(totals.items())),
        "csv": str(args.out), "summary": str(args.summary),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
