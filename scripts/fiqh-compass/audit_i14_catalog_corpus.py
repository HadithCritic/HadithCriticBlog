#!/usr/bin/env python3
"""Bounded lexical discovery scan for I14 in catalogued fiqh/usul corpus rows.

This scan only locates candidate texts. It does not establish authorial
positions, relevance, edition identity, translation, rights, or profile scores.
The JSON output belongs in ignored scratch storage because exact corpus records
are not cleared for publication.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb


LEGAL_CATEGORIES = {
    "أصول الفقه",
    "الفقه العام",
    "الفقه الحنفي",
    "الفقه المالكي",
    "الفقه الشافعي",
    "الفقه الحنبلي",
    "السياسة الشرعية والقضاء",
    "علوم الفقه والقواعد الفقهية",
    "الفتاوى",
    "مسائل فقهية",
}
TERMS = [
    "تقليد العامي",
    "تقليد المقلد",
    "تقليد",
    "التقليد",
    "المقلد",
    "العامي",
    "العوام",
    "المفتي",
    "المستفتي",
    "اتباع المفتي",
    "استفتاء العامي",
    "سؤال العالم",
]


def normalize_arabic(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).replace("ـ", "")
    chars = []
    for char in value:
        if unicodedata.category(char) in {"Mn", "Me", "Cf"}:
            continue
        chars.append({
            "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ؤ": "و",
            "ئ": "ي", "ى": "ي", "ة": "ه", "ی": "ي", "ک": "ك",
        }.get(char, char))
    return re.sub(r"[\s\u00a0]+", " ", "".join(chars)).strip()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", type=Path, required=True)
    parser.add_argument("--parquet", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    catalog_path, parquet_path, out_path = (p.resolve() for p in (args.catalog, args.parquet, args.out))

    catalog_bytes = catalog_path.read_bytes()
    with catalog_path.open("r", encoding="utf-8-sig", newline="") as handle:
        catalog_rows = list(csv.DictReader(handle))
    selected = {
        row["book_id"]: {
            "book_title": row["book_title"],
            "author": row["author"],
            "category": row["category"],
            "edition": row.get("edition"),
            "publisher": row.get("publisher"),
        }
        for row in catalog_rows
        if row.get("category") in LEGAL_CATEGORIES
    }
    if not selected:
        raise RuntimeError("No catalog records matched the declared fiqh/usul categories.")

    ids_sql = ",".join("'" + book_id.replace("'", "''") + "'" for book_id in sorted(selected))
    con = duckdb.connect(database=":memory:")
    con.execute("PRAGMA threads=4")
    cursor = con.execute(f"""
        SELECT book_id, serial_number, volume_number, page_number, text, foot_note
        FROM read_parquet(?)
        WHERE trim(book_id) IN ({ids_sql})
        ORDER BY book_id, TRY_CAST(serial_number AS BIGINT), serial_number
    """, [str(parquet_path)])

    per_book: dict[str, dict[str, Any]] = defaultdict(lambda: {
        "matched_rows": 0, "term_hits": Counter(), "candidate_locators": []
    })
    scanned_rows = 0
    normalized_terms = [(term, normalize_arabic(term)) for term in TERMS]
    columns = [column[0] for column in cursor.description]
    while batch := cursor.fetchmany(2_000):
        scanned_rows += len(batch)
        for raw in batch:
            row = dict(zip(columns, raw))
            book_id = str(row["book_id"]).strip()
            body = str(row.get("text") or "")
            footnote = str(row.get("foot_note") or "")
            normalized_fields = {
                "text": normalize_arabic(body),
                "foot_note": normalize_arabic(footnote),
            }
            matches = []
            for term, needle in normalized_terms:
                fields = [name for name, value in normalized_fields.items() if needle and needle in value]
                if fields:
                    matches.append({"term": term, "fields": fields})
                    per_book[book_id]["term_hits"][term] += 1
            if not matches:
                continue
            record = per_book[book_id]
            record["matched_rows"] += 1
            digest = hashlib.sha256((body + "\n" + footnote).encode("utf-8")).hexdigest()
            record["candidate_locators"].append({
                "serial_number": str(row["serial_number"]),
                "volume_number": None if row.get("volume_number") is None else str(row["volume_number"]),
                "page_number": None if row.get("page_number") is None else str(row["page_number"]),
                "matched_terms": matches,
                "text_footnote_sha256": digest,
            })

    results = []
    for book_id, metadata in selected.items():
        record = per_book.get(book_id)
        if not record or not record["matched_rows"]:
            continue
        results.append({
            "book_id": book_id,
            **metadata,
            "matched_rows": record["matched_rows"],
            "term_hits": dict(record["term_hits"].most_common()),
            "candidate_locators": record["candidate_locators"],
        })
    results.sort(key=lambda row: (-row["matched_rows"], row["book_id"]))
    out = {
        "schema_version": "1.0.0",
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "status": "lexical discovery only; all matches require direct context and source review",
        "catalog_path": str(catalog_path),
        "catalog_sha256": hashlib.sha256(catalog_bytes).hexdigest(),
        "catalog_rows": len(catalog_rows),
        "selected_category_names": sorted(LEGAL_CATEGORIES),
        "selected_catalog_records": len(selected),
        "parquet_path": str(parquet_path),
        "scanned_parquet_rows": scanned_rows,
        "retrieval_normalization": "NFKC; strip Arabic combining/control marks and tatwil; fold alef/hamza, ya, ta marbuta variants; collapse whitespace",
        "terms": TERMS,
        "rights_status": "needs_review for every underlying passage",
        "candidate_source_count": len(results),
        "candidate_row_count": sum(row["matched_rows"] for row in results),
        "candidate_sources": results,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "out": str(out_path),
        "catalog_rows": len(catalog_rows),
        "selected_catalog_records": len(selected),
        "scanned_parquet_rows": scanned_rows,
        "candidate_sources": len(results),
        "candidate_rows": out["candidate_row_count"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
