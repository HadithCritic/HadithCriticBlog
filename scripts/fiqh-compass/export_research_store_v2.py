#!/usr/bin/env python3
"""Export normalized source/edition acquisition records from a private store."""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from pathlib import Path
from typing import Any


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rows(con: sqlite3.Connection, query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    return [dict(row) for row in con.execute(query, params)]


def export(con: sqlite3.Connection, seed_path: Path, queue_path: Path) -> dict[str, Any]:
    authors = rows(con, "SELECT * FROM author_entity ORDER BY author_id")
    for author in authors:
        author["date_claims"] = json.loads(author.pop("date_claims_json"))
    works = rows(con, "SELECT * FROM work_entity ORDER BY work_id")
    for work in works:
        work["contributors"] = rows(con, """
          SELECT wc.author_id, a.display_name, a.display_name_ar, wc.role,
                 wc.attribution_status, wc.evidence_uri, wc.note
          FROM work_contributor wc JOIN author_entity a USING(author_id)
          WHERE wc.work_id=? ORDER BY wc.role, wc.author_id
        """, (work["work_id"],))
    manifestations = rows(con, "SELECT * FROM manifestation ORDER BY manifestation_id")
    for manifestation in manifestations:
        manifestation["access"] = rows(con, """
          SELECT access_id, provider, stable_uri, media_type, sha256, byte_size,
                 accessed_utc, manifestation_match_status, rights_status,
                 rights_claim, rights_basis, rights_source_uri, rights_review_uri,
                 rights_notes
          FROM digital_access WHERE manifestation_id=? ORDER BY access_id
        """, (manifestation["manifestation_id"],))
    leads = rows(con, "SELECT * FROM acquisition_lead ORDER BY priority, queue_id")
    for lead in leads:
        lead["manifestations"] = rows(con, """
          SELECT m.*, alm.relation_note
          FROM acquisition_lead_manifestation alm
          JOIN manifestation m USING(manifestation_id)
          WHERE alm.queue_id=? ORDER BY m.manifestation_id
        """, (lead["queue_id"],))
        lead["access_records"] = rows(con, """
          SELECT da.access_id, da.provider, da.stable_uri, da.media_type,
                 da.manifestation_match_status, da.rights_status, da.rights_claim,
                 da.rights_basis, da.rights_source_uri, da.rights_review_uri,
                 da.rights_notes, ala.access_role
          FROM acquisition_lead_access ala JOIN digital_access da USING(access_id)
          WHERE ala.queue_id=? ORDER BY da.access_id
        """, (lead["queue_id"],))
    external_passages = rows(con, """
      SELECT passage_id,manifestation_id,access_id,author_id,locator_system,
             printed_volume,printed_page,digital_volume,digital_page,folio,
             section_locator,web_anchor,arabic_verbatim,source_text_sha256,
             context_before_ar,context_after_ar,attribution_type,extraction_status,
             rights_status,notes
      FROM external_passage ORDER BY passage_id
    """)
    return {
        "schema_version": "2.0.0",
        "source_seed_sha256": digest(seed_path),
        "acquisition_queue_sha256": digest(queue_path),
        "research_only": True,
        "summary": {
            "authors": len(authors),
            "works": len(works),
            "manifestations": len(manifestations),
            "digital_access_records": con.execute("SELECT COUNT(*) FROM digital_access").fetchone()[0],
            "acquisition_leads": len(leads),
            "external_passages": len(external_passages),
            "rights_cleared_access_records": con.execute("SELECT COUNT(*) FROM digital_access WHERE rights_status='cleared'").fetchone()[0],
        },
        "authors": authors,
        "works": works,
        "manifestations": manifestations,
        "acquisition_leads": leads,
        "external_passages": external_passages,
        "notice": "Candidate metadata and access leads only. This export does not imply reviewed attribution, edition match, rights clearance, or a scored position.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--seed", type=Path, default=Path("docs/research/fiqh-compass/acquisition-source-seeds-v1.json"))
    parser.add_argument("--queue", type=Path, default=Path("docs/research/fiqh-compass/acquisition-review-queue.json"))
    parser.add_argument("--out", type=Path, default=Path("scratch/fiqh-compass/json/external-source-register-v2.json"))
    args = parser.parse_args()
    db_path = args.db.resolve()
    con = sqlite3.connect(f"file:{db_path.as_posix()}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    data = export(con, args.seed.resolve(), args.queue.resolve())
    con.close()
    out_path = args.out.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"out": str(out_path), **data["summary"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
