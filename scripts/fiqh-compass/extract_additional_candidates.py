#!/usr/bin/env python3
"""Extract an additive, private lexical shortlist from extra Shamela books.

Unlike extract_candidates.py, this tool never deletes or replaces existing
issue evidence. Exact text is written only to ignored scratch output and all
rows remain unresolved machine candidates with rights_status=needs_review.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb


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


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--parquet", required=True, type=Path)
    parser.add_argument("--catalog-index", required=True, type=Path)
    parser.add_argument("--book-id", required=True)
    parser.add_argument("--issue-id", required=True)
    parser.add_argument("--issue-label", required=True)
    parser.add_argument("--scope", required=True)
    parser.add_argument("--term", action="append", required=True, help="Repeat once per Arabic retrieval term")
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()

    parquet = args.parquet.resolve()
    index_path = args.catalog_index.resolve()
    with index_path.open("r", encoding="utf-8-sig", newline="") as stream:
        index_rows = csv.DictReader(stream)
        metadata = next((row for row in index_rows if row.get("book_id", "").strip() == args.book_id), None)
    if metadata is None:
        raise SystemExit(f"book_id={args.book_id} does not exist in the supplied current catalog index")

    con = duckdb.connect(database=":memory:")
    con.execute("PRAGMA threads=4")
    cursor = con.execute("""
      SELECT book_id, serial_number, volume_number, page_number, text, foot_note
      FROM read_parquet(?)
      WHERE trim(book_id) = ?
      ORDER BY TRY_CAST(serial_number AS BIGINT), serial_number
    """, [str(parquet), args.book_id])
    names = [column[0] for column in cursor.description]
    rows: list[dict[str, Any]] = []
    while batch := cursor.fetchmany(1500):
        rows.extend(dict(zip(names, row)) for row in batch)
    terms = list(dict.fromkeys(args.term))
    normalized_terms = [(term, normalize_arabic(term)) for term in terms]
    matches = []
    per_term = Counter()
    for index, row in enumerate(rows):
        body = str(row.get("text") or "")
        footnote = str(row.get("foot_note") or "")
        body_norm = normalize_arabic(body)
        footnote_norm = normalize_arabic(footnote)
        found = []
        for term, needle in normalized_terms:
            fields = []
            if needle and needle in body_norm:
                fields.append("text")
            if needle and needle in footnote_norm:
                fields.append("foot_note")
            if fields:
                per_term[term] += 1
                found.append({"term": term, "fields": fields})
        if not found:
            continue
        volume = None if row.get("volume_number") is None else str(row["volume_number"])
        page = None if row.get("page_number") is None else str(row["page_number"])
        previous = rows[index - 1] if index and str(rows[index - 1].get("volume_number")) == str(row.get("volume_number")) else None
        following = rows[index + 1] if index + 1 < len(rows) and str(rows[index + 1].get("volume_number")) == str(row.get("volume_number")) else None
        serial = str(row.get("serial_number"))
        matches.append({
            "candidate_id": "shamela:" + args.book_id + ":" + args.issue_id + ":" + serial,
            "source_id": "shamela:" + args.book_id,
            "corpus_serial": serial,
            "digital_volume_raw": volume,
            "digital_page_raw": page,
            "matched_terms": found,
            "arabic_verbatim": body,
            "context_before_ar": str(previous.get("text") or "") if previous else "",
            "context_after_ar": str(following.get("text") or "") if following else "",
            "footnote_verbatim": footnote if footnote.strip().casefold() not in {"", "none", "null", "nan"} else None,
            "source_text_sha256": sha256_text(body + "\n" + (footnote if footnote.strip().casefold() not in {"", "none", "null", "nan"} else "")),
            "attribution_status": "unresolved",
            "extraction_status": "machine_candidate",
            "edition_status": "metadata only; work-layer and printed/scan collation pending",
            "rights_status": "needs_review",
        })

    payload = {
        "schema_version": "1.0.0",
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "search": {
            "issue_id": args.issue_id,
            "issue_label": args.issue_label,
            "scope": args.scope,
            "book_id": args.book_id,
            "terms": terms,
            "normalization": "fiqh-ar-normalize-v1; search copy only; exact Arabic preserved verbatim",
        },
        "inputs": {
            "parquet_path": str(parquet),
            "parquet_bytes": parquet.stat().st_size,
            "catalog_index_path": str(index_path),
            "catalog_index_sha256": hashlib.sha256(index_path.read_bytes()).hexdigest(),
        },
        "catalog_record": metadata,
        "rows_in_book": len(rows),
        "distinct_candidate_rows": len(matches),
        "per_term_matching_row_counts_not_additive": dict(sorted(per_term.items())),
        "source_candidates": matches,
        "interpretation_limits": [
            "Every record is an unreviewed lexical candidate; no match is a legal conclusion or position.",
            "Catalog metadata is not proof of the exact authorial layer, editor's note, commentary, marginal gloss, completeness, or edition identity.",
            "Page and volume values are corpus digital locators, not verified printed or scan locators.",
            "No source passage is approved for public display or reuse; rights_status remains needs_review.",
        ],
    }
    out = args.out.resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "out": str(out),
        "book_id": args.book_id,
        "issue_id": args.issue_id,
        "rows_in_book": len(rows),
        "distinct_candidate_rows": len(matches),
        "per_term_matching_row_counts_not_additive": dict(sorted(per_term.items())),
    }, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
