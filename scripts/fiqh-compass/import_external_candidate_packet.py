#!/usr/bin/env python3
"""Import one hash-checked, unreviewed external passage packet into v2 SQLite."""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from pathlib import Path
from typing import Any


def import_packet(con: sqlite3.Connection, packet: dict[str, Any]) -> bool:
    text = packet["arabic_verbatim"]
    actual_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    if actual_hash != packet["source_text_sha256"]:
        raise ValueError("Packet Arabic text does not match its source_text_sha256")
    locator = packet["locator"]
    passage_id = "passage:" + packet["packet_id"]
    values = (
        passage_id,
        packet["manifestation_id"],
        packet["access_id"],
        None,  # keep attribution unresolved; source's compilation layers are unreviewed
        "mixed",
        locator.get("printed_volume"),
        locator.get("printed_page"),
        None,
        str(locator.get("digital_pdf_page_one_based", "")),
        None,
        None,
        text,
        actual_hash,
        "unresolved",
        "machine_candidate",
        packet.get("rights_status", "needs_review"),
        packet.get("candidate_scope", ""),
    )
    before = con.total_changes
    with con:
        con.execute(
            """INSERT OR IGNORE INTO external_passage(
                 passage_id, manifestation_id, access_id, author_id, locator_system,
                 printed_volume, printed_page, digital_volume, digital_page, folio,
                 section_locator, arabic_verbatim, source_text_sha256, attribution_type,
                 extraction_status, rights_status, notes
               ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            values,
        )
    stored = con.execute(
        "SELECT source_text_sha256, arabic_verbatim, attribution_type, extraction_status, rights_status FROM external_passage WHERE passage_id=?",
        (passage_id,),
    ).fetchone()
    expected = (actual_hash, text, "unresolved", "machine_candidate", packet.get("rights_status", "needs_review"))
    if tuple(stored) != expected:
        raise ValueError("An existing passage ID has conflicting packet data")
    integrity = con.execute("PRAGMA integrity_check").fetchone()[0]
    fk_errors = con.execute("PRAGMA foreign_key_check").fetchall()
    if integrity != "ok" or fk_errors:
        raise RuntimeError(f"Database check failed: integrity={integrity}; foreign_key_errors={len(fk_errors)}")
    return con.total_changes > before


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--packet", type=Path, required=True)
    args = parser.parse_args()
    con = sqlite3.connect(args.db.resolve())
    con.execute("PRAGMA foreign_keys=ON")
    created = import_packet(con, json.loads(args.packet.read_text(encoding="utf-8")))
    print(json.dumps({"passage_created": created, "external_passages": con.execute("SELECT COUNT(*) FROM external_passage").fetchone()[0], "integrity": "ok"}, indent=2))
    con.close()


if __name__ == "__main__":
    main()
