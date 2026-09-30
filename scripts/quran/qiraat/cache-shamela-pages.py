#!/usr/bin/env python3
"""Copy registered Shamela books out of the parquet into ignored scratch files.

One JSON file per book under scratch/quran/qiraat/pages/, holding every page
exactly as stored (text, footnote, volume, page label) plus a SHA-256 of each
page text. Nothing is normalized here. The cache is the fixed input that
extraction and verification read, so a claim can be re-checked later against
the same bytes. The cache is never committed or published.

    python scripts/quran/qiraat/cache-shamela-pages.py --ids 5556 5530
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
QIRAAT_DIR = REPO / "docs" / "research" / "quran-platform" / "qiraat"
DEFAULT_OUT = REPO / "scratch" / "quran" / "qiraat" / "pages"
COLUMNS = ["volume_number", "page_number", "text", "foot_note"]


def sha256_text(value: str | None) -> str:
    return hashlib.sha256((value or "").encode("utf-8")).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--parquet", default=os.environ.get("SHAMELA_PARQUET"),
                        help="Shamela parquet (env SHAMELA_PARQUET)")
    parser.add_argument("--registry", type=Path, default=QIRAAT_DIR / "sources.json")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--ids", nargs="*", help="Book IDs to cache (default: every registered book)")
    args = parser.parse_args()

    if not args.parquet:
        parser.error("--parquet or SHAMELA_PARQUET is required")

    import pyarrow.dataset as ds

    registry = json.loads(args.registry.read_text(encoding="utf-8"))
    by_id = {book["book_id"]: book for book in registry["books"]}
    wanted = args.ids or list(by_id)
    unknown = [book_id for book_id in wanted if book_id not in by_id]
    if unknown:
        raise SystemExit(f"Not in the registry: {', '.join(unknown)}")

    parquet_path = Path(args.parquet)
    stat = parquet_path.stat()
    table = ds.dataset(parquet_path).to_table(
        filter=ds.field("book_id").isin(wanted), columns=["book_id", *COLUMNS]
    )
    rows = table.to_pylist()

    args.out.mkdir(parents=True, exist_ok=True)
    grouped: dict[str, list[dict]] = {book_id: [] for book_id in wanted}
    for row in rows:
        grouped[row["book_id"]].append({
            "volume": row["volume_number"],
            "page": row["page_number"],
            "text": row["text"] or "",
            "foot_note": row["foot_note"],
            "text_sha256": sha256_text(row["text"]),
        })

    empty = sorted(book_id for book_id, pages in grouped.items() if not pages)
    if empty:
        raise SystemExit(f"No pages found for: {', '.join(empty)}; existing caches were left untouched")

    for book_id, pages in grouped.items():
        book = by_id[book_id]
        labels = [(page["volume"], page["page"]) for page in pages]
        payload = {
            "book_id": book_id,
            "title": book["book_title"],
            "edition": book["edition"],
            "source_file": parquet_path.name,
            "source_file_bytes": stat.st_size,
            "page_count": len(pages),
            "duplicate_page_labels": len(labels) - len(set(labels)),
            "pages": pages,
        }
        (args.out / f"{book_id}.json").write_text(
            json.dumps(payload, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        print(f"{book_id}: {len(pages)} pages, {len(labels) - len(set(labels))} repeated labels")
    return 0


if __name__ == "__main__":
    sys.exit(main())
