#!/usr/bin/env python3
"""Compare the current Shamela metadata index with the prior research snapshot.

Metadata only: this script reads the CSV index and old metadata manifests. It
does not read/export Parquet text, infer a legal position, or change rights.

Example:
  python scripts/fiqh-compass/reconcile_catalog_index.py \
    --index C:/Users/Jonathan/Desktop/shamela_catalog_index.csv \
    --previous-manifest scratch/fiqh-compass/source-manifest.json \
    --previous-reconciliation scratch/fiqh-compass/reconciliation.json \
    --json-out docs/research/fiqh-compass/catalog-index-reconciliation.json \
    --markdown-out docs/research/fiqh-compass/catalog-index-reconciliation.md
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REQUIRED_COLUMNS = {
    "book_id", "book_title", "author", "category_id", "category", "edition",
    "publisher", "record_count", "page_count", "volume_count",
    "first_serial_number", "last_serial_number",
}
FIQH_CATEGORY = re.compile(r"فقه|الأحكام الفقهية|مسائل فقهية|أصول الفقه", re.I)
FIQH_TITLE = re.compile(r"فقه|أحكام|الصلاة|الطلاق|الزكاة|الحج|الصيام|القواعد", re.I)
STARTER_IDS = {
    "8180", "1655", "587", "6301", "5423", "10432", "767", "21739",
    "8463", "21113", "7492", "11435",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def number(row: dict[str, str], field: str) -> int:
    value = (row.get(field) or "").strip()
    if not re.fullmatch(r"\d+", value):
        raise ValueError(f"book_id={row.get('book_id')}: invalid {field}={value!r}")
    return int(value)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", required=True, type=Path)
    parser.add_argument("--previous-manifest", required=True, type=Path)
    parser.add_argument("--previous-reconciliation", required=True, type=Path)
    parser.add_argument("--json-out", required=True, type=Path)
    parser.add_argument("--markdown-out", required=True, type=Path)
    args = parser.parse_args()

    index_path = args.index.resolve()
    previous_manifest = load_json(args.previous_manifest.resolve())
    previous_reconciliation = load_json(args.previous_reconciliation.resolve())
    with index_path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        rows = list(reader)
        columns = reader.fieldnames or []
    missing_columns = sorted(REQUIRED_COLUMNS - set(columns))
    if missing_columns:
        raise SystemExit(f"Index is missing required columns: {', '.join(missing_columns)}")

    by_id: dict[str, dict[str, str]] = {}
    duplicate_ids: list[str] = []
    for row in rows:
        book_id = (row.get("book_id") or "").strip()
        if not book_id:
            raise SystemExit("Index contains a blank book_id")
        if book_id in by_id:
            duplicate_ids.append(book_id)
        by_id[book_id] = row
        for field in ("record_count", "page_count", "volume_count", "first_serial_number", "last_serial_number"):
            number(row, field)

    old_catalog_ids = {
        str(record["shamela_book_id"])
        for record in previous_manifest.get("records", [])
        if record.get("catalog_presence")
    }
    old_parquet_only = set(previous_reconciliation["reconciliation"].get("corpus_only_ids", []))
    current_ids = set(by_id)
    additions = sorted(current_ids - old_catalog_ids, key=lambda value: int(value))
    dropped = sorted(old_catalog_ids - current_ids, key=lambda value: int(value))

    serial_ranges: list[tuple[int, int, str]] = []
    record_sum = page_sum = volume_sum = 0
    missing_authors = 0
    categories: Counter[str] = Counter()
    for book_id, row in by_id.items():
        count = number(row, "record_count")
        record_sum += count
        page_sum += number(row, "page_count")
        volume_sum += number(row, "volume_count")
        missing_authors += not bool((row.get("author") or "").strip())
        categories[(row.get("category") or "").strip() or "(blank)"] += 1
        first = number(row, "first_serial_number")
        last = number(row, "last_serial_number")
        if last - first + 1 != count:
            raise SystemExit(f"book_id={book_id}: serial range length differs from record_count")
        serial_ranges.append((first, last, book_id))

    serial_ranges.sort()
    overlap_count = gap_count = 0
    for previous, current in zip(serial_ranges, serial_ranges[1:]):
        if current[0] <= previous[1]:
            overlap_count += 1
        elif current[0] != previous[1] + 1:
            gap_count += 1
    expected_records = serial_ranges[-1][1] - serial_ranges[0][0] + 1 if serial_ranges else 0
    if overlap_count or gap_count or record_sum != expected_records:
        raise SystemExit("Serial ranges do not form one contiguous, non-overlapping record interval")

    fiqh_candidates = []
    for book_id in additions:
        row = by_id[book_id]
        category = row.get("category") or ""
        title = row.get("book_title") or ""
        if FIQH_CATEGORY.search(category) or FIQH_TITLE.search(title):
            fiqh_candidates.append({**row, "discovery_basis": "fiqh-related title/category keyword; human review required"})

    payload = {
        "schema_version": "1.0.0",
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "input": {
            "path": str(index_path),
            "bytes": index_path.stat().st_size,
            "sha256": sha256(index_path),
            "columns": columns,
            "row_count": len(rows),
        },
        "comparison": {
            "previous_catalog_snapshot_id_count": len(old_catalog_ids),
            "current_index_id_count": len(current_ids),
            "current_index_only_ids": additions,
            "previous_catalog_ids_missing_from_current_index": dropped,
            "current_additions_equal_previous_parquet_only_ids": set(additions) == old_parquet_only,
            "previous_parquet_only_ids_count": len(old_parquet_only),
        },
        "inventory": {
            "record_count_sum": record_sum,
            "page_count_sum": page_sum,
            "volume_count_sum": volume_sum,
            "category_count": len(categories),
            "missing_author_count": missing_authors,
            "duplicate_book_ids": sorted(set(duplicate_ids)),
            "serial_range_start": serial_ranges[0][0] if serial_ranges else None,
            "serial_range_end": serial_ranges[-1][1] if serial_ranges else None,
            "serial_range_overlap_count": overlap_count,
            "serial_range_gap_count": gap_count,
            "category_book_counts": dict(sorted(categories.items())),
        },
        "newly_cataloged_records": [by_id[book_id] for book_id in additions],
        "fiqh_discovery_candidates_from_new_records": fiqh_candidates,
        "roadmap_starter_availability": {
            book_id: by_id.get(book_id) for book_id in sorted(STARTER_IDS, key=int)
        },
        "interpretation_limits": [
            "The CSV is a metadata index of records present in the local merged corpus; counts establish indexed availability only.",
            "An indexed work is not thereby complete, correctly attributed, correctly transcribed, or matched to a verified print edition.",
            "Keyword-derived fiqh candidates require title, author, work-layer, relevance, and edition review before use.",
            "The index does not establish public-reuse rights. Shamela text excerpts remain rights-review gated.",
            "Catalog presence is not evidence of a legal conclusion or a tradition's representative position.",
        ],
    }
    for path in (args.json_out, args.markdown_out):
        path.resolve().parent.mkdir(parents=True, exist_ok=True)
    args.json_out.resolve().write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Current Shamela index reconciliation",
        "",
        f"Generated UTC: {payload['generated_utc']}",
        "",
        "## Inventory checks",
        "",
        f"- Current index: {len(rows):,} unique book IDs, SHA-256 `{payload['input']['sha256']}`.",
        f"- Indexed corpus record counts sum to {record_sum:,}; serial ranges cover {serial_ranges[0][0]:,}–{serial_ranges[-1][1]:,} with {overlap_count} overlaps and {gap_count} gaps.",
        f"- Page count sum: {page_sum:,}; volume count sum: {volume_sum:,}; {len(categories):,} categories; {missing_authors:,} records lack an author string.",
        f"- Previous catalog snapshot: {len(old_catalog_ids):,} IDs; current index adds {len(additions):,} and drops {len(dropped):,}.",
        f"- The {len(additions):,} additions exactly match the prior Parquet-only ID set: {payload['comparison']['current_additions_equal_previous_parquet_only_ids']}.",
        "",
        "## Newly surfaced fiqh discovery candidates",
        "",
        "These records were absent from the previous catalog snapshot, but are present in the new metadata index. Keyword/category matches are discovery leads only; review the source identity, edition, text layer, completeness, and rights before citing or using them.",
        "",
        "| ID | Title | Catalogued author | Category | Records |",
        "|---:|---|---|---|---:|",
    ]
    for record in fiqh_candidates:
        title = (record.get("book_title") or "").replace("|", "\\|")
        author = (record.get("author") or "").replace("|", "\\|") or "—"
        category = (record.get("category") or "").replace("|", "\\|") or "—"
        lines.append(f"| {record['book_id']} | {title} | {author} | {category} | {record['record_count']} |")
    lines.extend([
        "",
        "## Limits and workflow",
        "",
        "The index says which catalog records and serial intervals are available in the local corpus. It cannot show that a work is complete or accurate, that its attribution/edition is correct, or that a quotation represents a school or legal position. Rights are not granted by indexing. Keep all passages and score mappings behind source, edition, and rights review.",
        "",
        "Machine-readable detail, including all newly surfaced records and the 12 roadmap starter entries: `catalog-index-reconciliation.json`.",
        "",
    ])
    args.markdown_out.resolve().write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
