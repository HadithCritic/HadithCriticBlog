#!/usr/bin/env python3
"""Read one Shamela book from the merged corpus and search it.

The merged parquet is 7.9 GB in row groups of 1,000 rows ordered by serial
number, and the catalogue index gives each book's first and last serial, so a
book is read from its own row groups only. Each book is cached as JSON lines in
scratch/fiqh-compass/books/<id>.jsonl (ignored by git).

  python scripts/fiqh-compass/shamela_book.py <book_id> "<regex>" [--context 220]

prints every match with its volume, page and serial, so a placement can cite the
passage exactly. Diacritics are ignored when matching (the regex is applied to
an unvocalized copy, and the printed excerpt is the original text).
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
PARQUET = Path("C:/Users/Jonathan/Desktop/silsilah/shamela_full_merged.parquet")
CATALOG = Path("C:/Users/Jonathan/Desktop/shamela_catalog_index.csv")
CACHE = ROOT / "scratch" / "fiqh-compass" / "books"
MARKS = re.compile("[\u0610-\u061A\u064B-\u065F\u0670\u0640]")


def fold(text: str) -> str:
    text = MARKS.sub("", text or "")
    return text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ى", "ي").replace("ة", "ه")


def group_ranges(pf: pq.ParquetFile) -> list[tuple[int, int]]:
    """Each row group's serial range. Groups are contiguous runs of serials but
    are not stored in serial order, so the ranges are read once and cached."""
    index = CACHE / "_row-groups.json"
    if index.exists():
        return [tuple(r) for r in json.loads(index.read_text())]
    ranges = []
    for g in range(pf.num_row_groups):
        serials = [int(s) for s in pf.read_row_group(g, columns=["serial_number"]).column(0).to_pylist()]
        ranges.append((min(serials), max(serials)))
    CACHE.mkdir(parents=True, exist_ok=True)
    index.write_text(json.dumps(ranges))
    return ranges


def book_rows(book_id: str) -> list[dict]:
    cached = CACHE / f"{book_id}.jsonl"
    if cached.exists() and cached.stat().st_size > 0:
        return [json.loads(line) for line in cached.read_text(encoding="utf-8").splitlines()]
    entry = next(r for r in csv.DictReader(CATALOG.open(encoding="utf-8-sig")) if r["book_id"] == book_id)
    first, last = int(entry["first_serial_number"]), int(entry["last_serial_number"])
    pf = pq.ParquetFile(str(PARQUET))
    rows = []
    groups = [g for g, (lo, hi) in enumerate(group_ranges(pf)) if lo <= last and hi >= first]
    for group in groups:
        table = pf.read_row_group(group, columns=["serial_number", "book_id", "volume_number", "page_number", "text", "foot_note"])
        for row in table.to_pylist():
            if row["book_id"] == book_id:
                rows.append(row)
    rows.sort(key=lambda r: int(r["serial_number"]))
    CACHE.mkdir(parents=True, exist_ok=True)
    cached.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in rows), encoding="utf-8")
    return rows


def search(book_id: str, pattern: str, context: int = 220, limit: int = 12) -> list[dict]:
    regex = re.compile(pattern)
    hits = []
    for row in book_rows(book_id):
        original = row["text"] or ""
        folded = fold(original)
        for m in regex.finditer(folded):
            # Map the folded offset back to the original by counting kept characters.
            kept = -1
            start_orig = end_orig = None
            for i, ch in enumerate(original):
                if MARKS.match(ch):
                    continue
                kept += 1
                if kept == max(0, m.start() - context) and start_orig is None:
                    start_orig = i
                if kept == min(len(folded) - 1, m.end() + context):
                    end_orig = i + 1
                    break
            hits.append({
                "serial": row["serial_number"],
                "volume": row["volume_number"],
                "page": row["page_number"],
                "excerpt": original[start_orig or 0:end_orig or len(original)],
            })
            if len(hits) >= limit:
                return hits
    return hits


def main() -> int:
    book_id, pattern = sys.argv[1], sys.argv[2]
    context = int(sys.argv[sys.argv.index("--context") + 1]) if "--context" in sys.argv else 220
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else 12
    for hit in search(book_id, pattern, context, limit):
        print(f"[{hit['serial']}] vol {hit['volume']} p {hit['page']}: {hit['excerpt']}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
