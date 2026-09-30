#!/usr/bin/env python3
"""Build the qirāʾāt source registry from curated roles and the Shamela index.

Roles, reader sets and scope notes come from source-roles.json. Everything
bibliographic (title, author, editor, edition, page counts) is copied from the
Shamela index CSV, never typed by hand. When a parquet path is supplied, the
number of stored pages per book is recorded too, so a registry entry that has
no text behind it fails loudly.

    python scripts/quran/qiraat/build-source-registry.py \
        --index "$SHAMELA_INDEX_CSV" --parquet "$SHAMELA_PARQUET"
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
QIRAAT_DIR = REPO / "docs" / "research" / "quran-platform" / "qiraat"
INDEX_FIELDS = (
    "book_title", "author_name", "author_year", "editor", "publisher",
    "edition", "pages", "volumes", "category", "category_id", "sn",
)


def load_index(path: Path) -> dict[str, dict[str, str]]:
    rows: dict[str, dict[str, str]] = {}
    with path.open(encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            book_id = row["book_id"].strip()
            if book_id in rows:
                raise SystemExit(f"Index lists book_id {book_id} more than once")
            rows[book_id] = row
    return rows


def parquet_page_counts(path: Path, wanted: set[str]) -> dict[str, int]:
    import pyarrow.compute as pc
    import pyarrow.parquet as pq

    column = pq.read_table(path, columns=["book_id"]).column("book_id")
    counts = {item["values"]: item["counts"] for item in pc.value_counts(column).to_pylist()}
    return {book_id: counts.get(book_id, 0) for book_id in wanted}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--index", default=os.environ.get("SHAMELA_INDEX_CSV"),
                        help="Shamela index CSV (env SHAMELA_INDEX_CSV)")
    parser.add_argument("--parquet", default=os.environ.get("SHAMELA_PARQUET"),
                        help="Shamela parquet, optional (env SHAMELA_PARQUET)")
    parser.add_argument("--roles", type=Path, default=QIRAAT_DIR / "source-roles.json")
    parser.add_argument("--out", type=Path, default=QIRAAT_DIR / "sources.json")
    args = parser.parse_args()

    if not args.index:
        parser.error("--index or SHAMELA_INDEX_CSV is required")

    roles = json.loads(args.roles.read_text(encoding="utf-8"))
    index = load_index(Path(args.index))
    ids = [book["book_id"] for book in roles["books"]]
    duplicates = sorted({book_id for book_id in ids if ids.count(book_id) > 1})
    if duplicates:
        raise SystemExit(f"Duplicate book_id in the roles file: {', '.join(duplicates)}")
    wanted = set(ids)
    missing = sorted(wanted - index.keys())
    if missing:
        raise SystemExit(f"Book IDs absent from the index: {', '.join(missing)}")

    page_counts = parquet_page_counts(Path(args.parquet), wanted) if args.parquet else {}
    empty = sorted(book_id for book_id, count in page_counts.items() if count == 0)
    if empty:
        raise SystemExit(f"Book IDs with no stored pages: {', '.join(empty)}")

    books = []
    for curated in roles["books"]:
        row = index[curated["book_id"]]
        entry = {"book_id": curated["book_id"]}
        entry.update({field: row[field] for field in INDEX_FIELDS})
        if page_counts:
            entry["stored_pages"] = page_counts[curated["book_id"]]
        entry.update({key: value for key, value in curated.items() if key != "book_id"})
        books.append(entry)

    registry = {
        "schemaVersion": "qiraat-sources/0.1.0",
        "generator": "scripts/quran/qiraat/build-source-registry.py",
        "corpus": "Maktaba Shamela export, local; not redistributed",
        "roles": roles["roles"],
        "reader_sets": roles["reader_sets"],
        "not_found_by_title": roles["not_found_by_title"],
        "books": books,
    }
    args.out.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(books)} books to {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
