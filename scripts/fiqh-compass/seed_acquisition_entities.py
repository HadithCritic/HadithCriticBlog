#!/usr/bin/env python3
"""Import sourced acquisition metadata without creating passages or scores.

This is intentionally a metadata-only seed. All names/works/manifests retain
candidate status; it never marks rights cleared or inserts external passages.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path
from typing import Any


SEED_PATH = Path("docs/research/fiqh-compass/acquisition-source-seeds-v1.json")
QUEUE_PATH = Path("docs/research/fiqh-compass/acquisition-review-queue.json")

LEAD_LINKS = {
    "AQ-I01": {
        "work_id": "work:kitab-al-nil-wa-shifa-al-alil",
        "manifestations": ["manifestation:al-nil-portal-edition-claim", "manifestation:al-nil-pdf-frontmatter-claim", "manifestation:al-nil-css-2003-catalogue-claim"],
        "access": [("access:al-nil-portal", "catalogue_record"), ("access:al-nil-part1-pdf", "digitized_source"), ("access:al-nil-part1-text", "searchable_text"), ("access:al-nil-css-library-record", "catalogue_record")],
    },
    "AQ-Z01": {
        "work_id": "work:al-bahr-al-zakhkhar",
        "manifestations": ["manifestation:al-bahr-bsb-cod-arab-1291"],
        "access": [("access:al-bahr-bsb-manuscript", "digitized_source")],
    },
    "AQ-T01": {
        "work_id": "work:al-mabsut-fi-fiqh-al-imamiyya",
        "manifestations": ["manifestation:al-mabsut-second-edition-catalogue-claim"],
        "access": [
            ("access:al-mabsut-nyu-volume", "digitized_source"),
            ("access:al-mabsut-princeton-volume-2", "digitized_source"),
        ],
    },
    "AQ-Q01": {
        "work_id": "work:quran-the-final-testament-rashad-khalifa",
        "manifestations": ["manifestation:quran-final-testament-web-appendices"],
        "access": [("access:quran-final-testament-web", "searchable_text")],
    },
    "AQ-H01": {
        "work_id": "work:al-mughni-ibn-qudama",
        "manifestations": ["manifestation:al-mughni-cairo-1968-vol3-catalogue-claim"],
        "access": [
            ("access:al-mughni-maknoon-vol3-scan", "digitized_source"),
            ("access:al-mughni-archive-vol3-pdf", "digitized_source"),
        ],
    },
}


def insert_ignore(con: sqlite3.Connection, table: str, columns: list[str], values: tuple[Any, ...]) -> None:
    names = ",".join(columns)
    marks = ",".join("?" for _ in columns)
    con.execute(f"INSERT OR IGNORE INTO {table}({names}) VALUES ({marks})", values)


def refresh_unreviewed_al_nil_claims(con: sqlite3.Connection, source_data: dict[str, Any], queue_data: dict[str, Any]) -> None:
    """Refresh sourced Al-Nil metadata without overwriting reviewed decisions.

    The current seed resolves an earlier OCR misread on the scanned title page.
    Only candidate/unresolved manifestations and non-cleared access records are
    refreshed. A specialist-verified identity or rights decision is preserved.
    """
    manifestation_ids = {
        "manifestation:al-nil-portal-edition-claim",
        "manifestation:al-nil-pdf-frontmatter-claim",
    }
    for item in source_data["manifestations"]:
        if item["manifestation_id"] not in manifestation_ids:
            continue
        con.execute(
            """UPDATE manifestation SET title=?, title_ar=?, edition_statement=?,
               editors=?, publisher=?, publication_place=?, publication_date_raw=?,
               shelfmark=?, copy_date_raw=?, locator_system=?, metadata_source_uri=?, notes=?
               WHERE manifestation_id=? AND identity_status IN ('unresolved','candidate')""",
            (
                item.get("title"), item.get("title_ar"), item.get("edition_statement"),
                item.get("editors"), item.get("publisher"), item.get("publication_place"),
                item.get("publication_date_raw"), item.get("shelfmark"), item.get("copy_date_raw"),
                item.get("locator_system", "unresolved"), item.get("metadata_source_uri"),
                item.get("notes", ""), item["manifestation_id"],
            ),
        )

    access_ids = {"access:al-nil-portal", "access:al-nil-part1-pdf"}
    for item in source_data["digital_access"]:
        if item["access_id"] not in access_ids:
            continue
        con.execute(
            """UPDATE digital_access SET manifestation_id=?, provider=?, stable_uri=?,
               media_type=?, sha256=?, byte_size=?, accessed_utc=?, manifestation_match_status=?,
               rights_status=?, rights_claim=?, rights_basis=?, rights_source_uri=?, rights_notes=?
               WHERE access_id=? AND rights_status IN ('unknown','needs_review')
               AND manifestation_match_status IN ('unverified','candidate_match')""",
            (
                item.get("manifestation_id"), item["provider"], item["stable_uri"],
                item.get("media_type"), item.get("sha256"), item.get("byte_size"),
                item.get("accessed_utc"), item.get("manifestation_match_status", "unverified"),
                item.get("rights_status", "unknown"), item.get("rights_claim", ""),
                item.get("rights_basis", "unknown"), item.get("rights_source_uri"),
                item.get("rights_notes", ""), item["access_id"],
            ),
        )

    queue_item = next((item for item in queue_data["queue"] if item["queue_id"] == "AQ-I01"), None)
    if queue_item:
        con.execute(
            """UPDATE acquisition_lead SET source_note=?, next_action=?, queue_status=?
               WHERE queue_id='AQ-I01' AND queue_status IN ('open','metadata_checked')
               AND rights_status IN ('unknown','needs_review','not_assessed')""",
            (queue_item.get("access_note", ""), queue_item.get("next_action", ""), queue_item.get("queue_status", "metadata_checked")),
        )


def refresh_unreviewed_al_mabsut_claims(con: sqlite3.Connection, source_data: dict[str, Any], queue_data: dict[str, Any]) -> None:
    """Refresh title-page inspection metadata without overwriting review decisions."""
    manifestation_id = "manifestation:al-mabsut-second-edition-catalogue-claim"
    item = next((row for row in source_data["manifestations"] if row["manifestation_id"] == manifestation_id), None)
    if item:
        con.execute(
            """UPDATE manifestation SET edition_statement=?, editors=?, publisher=?,
               publication_place=?, publication_date_raw=?, locator_system=?,
               identity_status=?, metadata_source_uri=?, notes=?
               WHERE manifestation_id=? AND identity_status IN ('unresolved','candidate')""",
            (
                item.get("edition_statement"), item.get("editors"), item.get("publisher"),
                item.get("publication_place"), item.get("publication_date_raw"),
                item.get("locator_system", "unresolved"), item.get("identity_status", "candidate"),
                item.get("metadata_source_uri"), item.get("notes", ""), manifestation_id,
            ),
        )

    access_ids = {"access:al-mabsut-nyu-volume", "access:al-mabsut-princeton-volume-2"}
    for item in source_data["digital_access"]:
        if item["access_id"] not in access_ids:
            continue
        con.execute(
            """UPDATE digital_access SET manifestation_id=?, provider=?, stable_uri=?,
               media_type=?, sha256=?, byte_size=?, accessed_utc=?, manifestation_match_status=?,
               rights_status=?, rights_claim=?, rights_basis=?, rights_source_uri=?, rights_notes=?
               WHERE access_id=? AND rights_status IN ('unknown','needs_review')
               AND manifestation_match_status IN ('unverified','candidate_match')""",
            (
                item.get("manifestation_id"), item["provider"], item["stable_uri"],
                item.get("media_type"), item.get("sha256"), item.get("byte_size"),
                item.get("accessed_utc"), item.get("manifestation_match_status", "unverified"),
                item.get("rights_status", "unknown"), item.get("rights_claim", ""),
                item.get("rights_basis", "unknown"), item.get("rights_source_uri"),
                item.get("rights_notes", ""), item["access_id"],
            ),
        )

    queue_item = next((row for row in queue_data["queue"] if row["queue_id"] == "AQ-T01"), None)
    if queue_item:
        con.execute(
            """UPDATE acquisition_lead SET source_note=?, next_action=?, queue_status=?
               WHERE queue_id='AQ-T01' AND queue_status IN ('open','metadata_checked')
               AND rights_status IN ('unknown','needs_review','not_assessed')""",
            (queue_item.get("access_note", ""), queue_item.get("next_action", ""), queue_item.get("queue_status", "metadata_checked")),
        )


def refresh_unreviewed_al_bahr_claims(con: sqlite3.Connection, source_data: dict[str, Any], queue_data: dict[str, Any]) -> None:
    """Refresh the BSB manuscript access lead without resolving conflicting rights."""
    author_id = "author:ahmad-ibn-yahya-ibn-al-murtada"
    author = next((row for row in source_data["authors"] if row["author_id"] == author_id), None)
    if author:
        con.execute(
            """UPDATE author_entity SET authority_uri=?, date_claims_json=?, notes=?
               WHERE author_id=? AND identity_status IN ('unresolved','candidate')""",
            (author.get("authority_uri"), author.get("date_claims_json", "[]"), author.get("notes", ""), author_id),
        )

    manifestation_id = "manifestation:al-bahr-bsb-cod-arab-1291"
    manifestation = next((row for row in source_data["manifestations"] if row["manifestation_id"] == manifestation_id), None)
    if manifestation:
        con.execute(
            """UPDATE manifestation SET shelfmark=?, copy_date_raw=?, locator_system=?,
               identity_status=?, metadata_source_uri=?, notes=?
               WHERE manifestation_id=? AND identity_status IN ('unresolved','candidate')""",
            (
                manifestation.get("shelfmark"), manifestation.get("copy_date_raw"),
                manifestation.get("locator_system", "unresolved"), manifestation.get("identity_status", "candidate"),
                manifestation.get("metadata_source_uri"), manifestation.get("notes", ""), manifestation_id,
            ),
        )

    access_id = "access:al-bahr-bsb-manuscript"
    access = next((row for row in source_data["digital_access"] if row["access_id"] == access_id), None)
    if access:
        con.execute(
            """UPDATE digital_access SET manifestation_id=?, provider=?, stable_uri=?,
               media_type=?, sha256=?, byte_size=?, accessed_utc=?, manifestation_match_status=?,
               rights_status=?, rights_claim=?, rights_basis=?, rights_source_uri=?, rights_notes=?
               WHERE access_id=? AND rights_status IN ('unknown','needs_review')
               AND manifestation_match_status IN ('unverified','candidate_match')""",
            (
                access.get("manifestation_id"), access["provider"], access["stable_uri"],
                access.get("media_type"), access.get("sha256"), access.get("byte_size"),
                access.get("accessed_utc"), access.get("manifestation_match_status", "unverified"),
                access.get("rights_status", "unknown"), access.get("rights_claim", ""),
                access.get("rights_basis", "unknown"), access.get("rights_source_uri"),
                access.get("rights_notes", ""), access_id,
            ),
        )

    queue_item = next((row for row in queue_data["queue"] if row["queue_id"] == "AQ-Z01"), None)
    if queue_item:
        con.execute(
            """UPDATE acquisition_lead SET source_note=?, next_action=?, queue_status=?
               WHERE queue_id='AQ-Z01' AND queue_status IN ('open','metadata_checked')
               AND rights_status IN ('unknown','needs_review','not_assessed')""",
            (queue_item.get("access_note", ""), queue_item.get("next_action", ""), queue_item.get("queue_status", "metadata_checked")),
        )


def refresh_unreviewed_al_mughni_claims(con: sqlite3.Connection, source_data: dict[str, Any], queue_data: dict[str, Any]) -> None:
    """Refresh the volume-3 scan lead without overwriting reviewed identity or rights decisions."""
    manifestation_id = "manifestation:al-mughni-cairo-1968-vol3-catalogue-claim"
    manifestation = next((row for row in source_data["manifestations"] if row["manifestation_id"] == manifestation_id), None)
    if manifestation:
        con.execute(
            """UPDATE manifestation SET edition_statement=?, editors=?, publisher=?,
               publication_place=?, publication_date_raw=?, shelfmark=?, locator_system=?,
               identity_status=?, metadata_source_uri=?, notes=?
               WHERE manifestation_id=? AND identity_status IN ('unresolved','candidate')""",
            (
                manifestation.get("edition_statement"), manifestation.get("editors"),
                manifestation.get("publisher"), manifestation.get("publication_place"),
                manifestation.get("publication_date_raw"), manifestation.get("shelfmark"),
                manifestation.get("locator_system", "unresolved"),
                manifestation.get("identity_status", "candidate"),
                manifestation.get("metadata_source_uri"), manifestation.get("notes", ""),
                manifestation_id,
            ),
        )

    access_ids = {"access:al-mughni-maknoon-vol3-scan", "access:al-mughni-archive-vol3-pdf"}
    for access_id in access_ids:
        access = next((row for row in source_data["digital_access"] if row["access_id"] == access_id), None)
        if not access:
            continue
        con.execute(
            """UPDATE digital_access SET manifestation_id=?, provider=?, stable_uri=?,
               media_type=?, sha256=?, byte_size=?, accessed_utc=?, manifestation_match_status=?,
               rights_status=?, rights_claim=?, rights_basis=?, rights_source_uri=?, rights_notes=?
               WHERE access_id=? AND rights_status IN ('unknown','needs_review')
               AND manifestation_match_status IN ('unverified','candidate_match')""",
            (
                access.get("manifestation_id"), access["provider"], access["stable_uri"],
                access.get("media_type"), access.get("sha256"), access.get("byte_size"),
                access.get("accessed_utc"), access.get("manifestation_match_status", "unverified"),
                access.get("rights_status", "unknown"), access.get("rights_claim", ""),
                access.get("rights_basis", "unknown"), access.get("rights_source_uri"),
                access.get("rights_notes", ""), access_id,
            ),
        )

    queue_item = next((row for row in queue_data["queue"] if row["queue_id"] == "AQ-H01"), None)
    if queue_item:
        con.execute(
            """UPDATE acquisition_lead SET source_note=?, next_action=?, queue_status=?
               WHERE queue_id='AQ-H01' AND queue_status IN ('open','metadata_checked')
               AND rights_status IN ('unknown','needs_review','not_assessed')""",
            (queue_item.get("access_note", ""), queue_item.get("next_action", ""), queue_item.get("queue_status", "metadata_checked")),
        )


def seed(con: sqlite3.Connection, source_data: dict[str, Any], queue_data: dict[str, Any]) -> dict[str, int]:
    queue = {item["queue_id"]: item for item in queue_data["queue"]}
    missing_queue_ids = set(LEAD_LINKS) - queue.keys()
    if missing_queue_ids:
        raise ValueError(f"Acquisition queue is missing IDs: {sorted(missing_queue_ids)}")

    counts = {"authors": 0, "works": 0, "contributors": 0, "manifestations": 0, "digital_access": 0, "leads": 0, "passages_created": 0}
    with con:
        for item in source_data["authors"]:
            before = con.total_changes
            insert_ignore(con, "author_entity", ["author_id", "display_name", "display_name_ar", "identity_status", "authority_uri", "date_claims_json", "notes"], (
                item["author_id"], item["display_name"], item.get("display_name_ar"), item.get("identity_status", "candidate"), item.get("authority_uri"), item.get("date_claims_json", "[]"), item.get("notes", ""),
            ))
            counts["authors"] += con.total_changes - before
        for item in source_data["works"]:
            before = con.total_changes
            insert_ignore(con, "work_entity", ["work_id", "title", "title_ar", "identity_status", "identity_notes"], (
                item["work_id"], item.get("title"), item.get("title_ar"), item.get("identity_status", "candidate"), item.get("identity_notes", ""),
            ))
            counts["works"] += con.total_changes - before
        for item in source_data["contributors"]:
            before = con.total_changes
            insert_ignore(con, "work_contributor", ["work_id", "author_id", "role", "attribution_status", "evidence_uri", "note"], (
                item["work_id"], item["author_id"], item["role"], item.get("attribution_status", "unresolved"), item.get("evidence_uri"), item.get("note", ""),
            ))
            counts["contributors"] += con.total_changes - before
        for item in source_data["manifestations"]:
            before = con.total_changes
            insert_ignore(con, "manifestation", [
                "manifestation_id", "work_id", "manifestation_type", "title", "title_ar", "edition_statement", "editors", "publisher", "publication_place", "publication_date_raw", "shelfmark", "copy_date_raw", "locator_system", "identity_status", "metadata_source_uri", "notes",
            ], (
                item["manifestation_id"], item.get("work_id"), item["manifestation_type"], item.get("title"), item.get("title_ar"), item.get("edition_statement"), item.get("editors"), item.get("publisher"), item.get("publication_place"), item.get("publication_date_raw"), item.get("shelfmark"), item.get("copy_date_raw"), item.get("locator_system", "unresolved"), item.get("identity_status", "unresolved"), item.get("metadata_source_uri"), item.get("notes", ""),
            ))
            counts["manifestations"] += con.total_changes - before
        for item in source_data["digital_access"]:
            before = con.total_changes
            insert_ignore(con, "digital_access", [
                "access_id", "manifestation_id", "provider", "stable_uri", "media_type", "sha256", "byte_size", "accessed_utc", "manifestation_match_status", "rights_status", "rights_claim", "rights_basis", "rights_source_uri", "rights_review_uri", "rights_notes",
            ], (
                item["access_id"], item.get("manifestation_id"), item["provider"], item["stable_uri"], item.get("media_type"), item.get("sha256"), item.get("byte_size"), item.get("accessed_utc"), item.get("manifestation_match_status", "unverified"), item.get("rights_status", "unknown"), item.get("rights_claim", ""), item.get("rights_basis", "unknown"), item.get("rights_source_uri"), item.get("rights_review_uri"), item.get("rights_notes", ""),
            ))
            counts["digital_access"] += con.total_changes - before

        for queue_id, links in LEAD_LINKS.items():
            item = queue[queue_id]
            before = con.total_changes
            insert_ignore(con, "acquisition_lead", ["queue_id", "priority", "tradition_label", "work_id", "queue_status", "rights_status", "source_note", "next_action"], (
                queue_id, item["priority"], item["tradition"], links["work_id"], item.get("queue_status", "metadata_checked"), item.get("rights_status", "unknown"), item.get("access_note", ""), item.get("next_action", ""),
            ))
            counts["leads"] += con.total_changes - before
            for manifestation_id in links["manifestations"]:
                insert_ignore(con, "acquisition_lead_manifestation", ["queue_id", "manifestation_id", "relation_note"], (queue_id, manifestation_id, "Candidate source/manifestation lead; exact identity and locator match remain unverified."))
            for access_id, role in links["access"]:
                insert_ignore(con, "acquisition_lead_access", ["queue_id", "access_id", "access_role"], (queue_id, access_id, role))

        for item in source_data.get("source_work_links", []):
            insert_ignore(con, "source_work_link", ["source_id", "work_id", "link_status", "evidence_uri", "note"], (
                item["source_id"], item["work_id"], item.get("link_status", "candidate"),
                item.get("evidence_uri"), item.get("note", ""),
            ))
        for item in source_data.get("source_manifestation_links", []):
            insert_ignore(con, "source_manifestation_link", ["source_id", "manifestation_id", "link_status", "evidence_uri", "note"], (
                item["source_id"], item["manifestation_id"], item.get("link_status", "candidate"),
                item.get("evidence_uri"), item.get("note", ""),
            ))

        refresh_unreviewed_al_nil_claims(con, source_data, queue_data)
        refresh_unreviewed_al_mabsut_claims(con, source_data, queue_data)
        refresh_unreviewed_al_bahr_claims(con, source_data, queue_data)
        refresh_unreviewed_al_mughni_claims(con, source_data, queue_data)

    counts["passages_created"] = con.execute("SELECT COUNT(*) FROM external_passage").fetchone()[0]
    return counts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--seed", type=Path, default=SEED_PATH)
    parser.add_argument("--queue", type=Path, default=QUEUE_PATH)
    args = parser.parse_args()
    db_path = args.db.resolve()
    if not db_path.is_file():
        raise FileNotFoundError(db_path)
    con = sqlite3.connect(db_path)
    con.execute("PRAGMA foreign_keys=ON")
    counts = seed(
        con,
        json.loads(args.seed.read_text(encoding="utf-8")),
        json.loads(args.queue.read_text(encoding="utf-8")),
    )
    integrity = con.execute("PRAGMA integrity_check").fetchone()[0]
    fk_errors = con.execute("PRAGMA foreign_key_check").fetchall()
    if integrity != "ok" or fk_errors:
        raise RuntimeError(f"Seed validation failed: integrity={integrity}; foreign_key_errors={len(fk_errors)}")
    print(json.dumps({"db": str(db_path), "counts": counts, "integrity": integrity, "foreign_key_errors": len(fk_errors)}, ensure_ascii=False, indent=2))
    con.close()


if __name__ == "__main__":
    main()
