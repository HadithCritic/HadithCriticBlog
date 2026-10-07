#!/usr/bin/env python3
"""Reconcile the supplied Shamela catalog with its merged Parquet corpus.

The script writes metadata-only outputs. It never exports book text. Run with:

  python scripts/fiqh-compass/reconcile_corpus.py \
    --catalog C:/Users/Jonathan/Desktop/shamela_books_info.csv \
    --parquet C:/Users/Jonathan/Desktop/silsilah/shamela_full_merged.parquet \
    --out scratch/fiqh-compass

Requires Python 3.11+ and DuckDB (`python -m pip install duckdb`).
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb


ROADMAP_STARTERS = {
    "8180": {"author": "Al-Shāfiʿī", "work": "al-Risāla", "role": "Sources, reports, and interpretation"},
    "1655": {"author": "Al-Shāfiʿī", "work": "al-Umm", "role": "Applied positions and arguments"},
    "587": {"author": "Saḥnūn (transmitting Mālikī material)", "work": "al-Mudawwana", "role": "Mālikī positions and internal variation"},
    "6301": {"author": "Al-Sarakhsī", "work": "Uṣūl al-Sarakhsī", "role": "Legal reasoning and evidence"},
    "5423": {"author": "Al-Sarakhsī", "work": "al-Mabsūṭ", "role": "Applied cases and reasoning"},
    "10432": {"author": "Ibn Ḥazm", "work": "al-Iḥkām", "role": "Methodological comparison"},
    "767": {"author": "Ibn Ḥazm", "work": "al-Muḥallā", "role": "Rulings and comparative disagreements"},
    "21739": {"author": "Ibn Rushd", "work": "Bidāyat al-mujtahid", "role": "Discover disputes and stated causes"},
    "8463": {"author": "Ibn Qudāma", "work": "al-Mughnī", "role": "Comparative rulings and attributed positions"},
    "21113": {"author": "Ibn al-Mundhir", "work": "al-Awsaṭ", "role": "Earlier disagreements and authorities"},
    "7492": {"author": "Al-Ṭabarī", "work": "Ikhtilāf al-fuqahāʾ", "role": "Comparative material"},
    "11435": {"author": "Al-Shāṭibī", "work": "al-Muwāfaqāt", "role": "Purposes and legal reasoning"},
}

TEXT_FIELDS = ("book_title", "edition", "publisher", "category")
METADATA_LIST_COLUMNS = {
    "book_title": "book_titles",
    "edition": "editions",
    "publisher": "publishers",
    "category": "categories",
}
NULL_SENTINELS = {"", "none", "null", "nan", "n/a"}


def clean(value: Any) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    return None if value.casefold() in NULL_SENTINELS else value


def id_key(value: Any) -> str | None:
    value = clean(value)
    if value is None:
        return None
    # Shamela IDs are integer identifiers. Remove formatting whitespace but do
    # not silently coerce arbitrary identifiers or discard raw values.
    if re.fullmatch(r"\d+\.0", value):
        value = value[:-2]
    return value


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(8 * 1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", required=True, type=Path)
    parser.add_argument("--parquet", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--skip-file-hash", action="store_true", help="Skip the 7.9 GB Parquet SHA-256 pass")
    args = parser.parse_args()
    catalog_path = args.catalog.resolve()
    parquet_path = args.parquet.resolve()
    out_dir = args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    with catalog_path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        catalog_rows = list(reader)
        catalog_columns = reader.fieldnames or []
    catalog_by_id: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for raw in catalog_rows:
        key = id_key(raw.get("book_id"))
        if key is not None:
            catalog_by_id[key].append(raw)
    catalog_ids = set(catalog_by_id)

    con = duckdb.connect(database=":memory:")
    con.execute("PRAGMA threads=4")
    parquet_sql = "read_parquet(?)"
    # One projected scan yields per-ID coverage and an auditable set of
    # metadata values without materializing the 7.9 GB text column.
    metadata_query = f"""
      SELECT
        trim(book_id) AS book_id,
        list_sort(list(DISTINCT trim(coalesce(book_title, '')))) AS book_titles,
        list_sort(list(DISTINCT trim(coalesce(edition, '')))) AS editions,
        list_sort(list(DISTINCT trim(coalesce(publisher, '')))) AS publishers,
        list_sort(list(DISTINCT trim(coalesce(category, '')))) AS categories,
        COUNT(*) AS row_count,
        COUNT(*) FILTER (WHERE text IS NULL OR trim(text) = '') AS blank_text_count,
        COUNT(*) FILTER (WHERE lower(trim(coalesce(text, ''))) IN ('none','null','nan')) AS text_sentinel_count,
        COUNT(*) FILTER (WHERE page_number IS NULL OR lower(trim(coalesce(page_number, ''))) IN ('','none','null','nan')) AS missing_page_count,
        COUNT(*) FILTER (WHERE volume_number IS NULL OR lower(trim(coalesce(volume_number, ''))) IN ('','none','null','nan')) AS missing_volume_count,
        COUNT(DISTINCT CASE WHEN lower(trim(coalesce(page_number, ''))) IN ('','none','null','nan') THEN NULL ELSE trim(page_number) END) AS page_label_count,
        COUNT(DISTINCT CASE WHEN lower(trim(coalesce(volume_number, ''))) IN ('','none','null','nan') THEN NULL ELSE trim(volume_number) END) AS volume_label_count,
        MIN(TRY_CAST(serial_number AS BIGINT)) AS first_serial,
        MAX(TRY_CAST(serial_number AS BIGINT)) AS last_serial
      FROM {parquet_sql}
      WHERE trim(coalesce(book_id, '')) <> ''
      GROUP BY trim(book_id)
      ORDER BY trim(book_id)
    """
    cols = [d[0] for d in con.execute(metadata_query, [str(parquet_path)]).description]
    corpus_rows = [dict(zip(cols, row)) for row in con.fetchall()]
    corpus_by_id = {str(row["book_id"]): row for row in corpus_rows}
    corpus_ids = set(corpus_by_id)

    summary = (
        sum(row["row_count"] for row in corpus_rows),
        len(corpus_ids),
        len({clean(category) for row in corpus_rows for category in row["categories"] if clean(category) is not None}),
        sum(row["blank_text_count"] for row in corpus_rows),
        sum(row["text_sentinel_count"] for row in corpus_rows),
        sum(row["missing_page_count"] for row in corpus_rows),
        sum(row["missing_volume_count"] for row in corpus_rows),
    )

    dup_catalog_ids = {key: values for key, values in catalog_by_id.items() if len(values) > 1}
    missing_in_parquet = sorted(catalog_ids - corpus_ids)
    extra_in_parquet = sorted(corpus_ids - catalog_ids)

    comparison_counts: Counter[str] = Counter()
    comparison_examples: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for book_id in sorted(catalog_ids & corpus_ids):
        raw = catalog_by_id[book_id][0]
        corp = corpus_by_id[book_id]
        for field in TEXT_FIELDS:
            catalog_value = clean(raw.get(field))
            corpus_values = [clean(v) for v in corp[METADATA_LIST_COLUMNS[field]]]
            corpus_values = sorted({v for v in corpus_values if v is not None})
            if catalog_value is not None and corpus_values and catalog_value not in corpus_values:
                comparison_counts[field] += 1
                if len(comparison_examples[field]) < 50:
                    comparison_examples[field].append({
                        "book_id": book_id,
                        "catalog_value": catalog_value,
                        "corpus_values": corpus_values,
                    })

    manifest_records: list[dict[str, Any]] = []
    for book_id in sorted(catalog_ids | corpus_ids):
        catalog_versions = catalog_by_id.get(book_id, [])
        corp = corpus_by_id.get(book_id)
        record: dict[str, Any] = {
            "source_record_id": f"shamela:{book_id}",
            "shamela_book_id": book_id,
            "catalog_presence": bool(catalog_versions),
            "corpus_presence": corp is not None,
            "catalog_duplicate_record_count": len(catalog_versions),
            "catalog_records": catalog_versions,
            "corpus": corp,
            "identity_status": "work-versus-edition unresolved",
            "rights_status": "needs_review",
        }
        starter = ROADMAP_STARTERS.get(book_id)
        if starter:
            record["roadmap_starter"] = starter
            record["edition_review_status"] = "metadata recorded; printed/scan collation pending"
        manifest_records.append(record)

    file_hash = None if args.skip_file_hash else sha256_file(parquet_path)
    audit = {
        "schema_version": "1.0.0",
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "inputs": {
            "catalog": {"path": str(catalog_path), "bytes": catalog_path.stat().st_size, "sha256": sha256_file(catalog_path), "row_count": len(catalog_rows), "columns": catalog_columns},
            "parquet": {"path": str(parquet_path), "bytes": parquet_path.stat().st_size, "sha256": file_hash, "row_count": summary[0], "book_id_count": summary[1], "category_count": summary[2], "blank_text_count": summary[3], "text_sentinel_count": summary[4], "missing_page_count_including_sentinels": summary[5], "missing_volume_count_including_sentinels": summary[6]},
        },
        "reconciliation": {
            "catalog_distinct_ids": len(catalog_ids),
            "parquet_distinct_ids": len(corpus_ids),
            "matched_ids": len(catalog_ids & corpus_ids),
            "catalog_only_ids": missing_in_parquet,
            "corpus_only_ids": extra_in_parquet,
            "duplicate_catalog_ids": {key: len(value) for key, value in sorted(dup_catalog_ids.items())},
            "metadata_mismatch_id_counts": dict(comparison_counts),
            "metadata_mismatch_examples_first_50": dict(comparison_examples),
            "metadata_variation_within_parquet_id_counts": {
                field: sum(len(row[METADATA_LIST_COLUMNS[field]]) > 1 for row in corpus_rows)
                for field in TEXT_FIELDS
            },
        },
        "starter_work_ids": {
            book_id: {
                **ROADMAP_STARTERS[book_id],
                "present_in_catalog": book_id in catalog_ids,
                "present_in_corpus": book_id in corpus_ids,
                "text_row_count": corpus_by_id.get(book_id, {}).get("row_count", 0),
                "nonblank_text_rows": (corpus_by_id.get(book_id, {}).get("row_count", 0) - corpus_by_id.get(book_id, {}).get("blank_text_count", 0)),
                "edition_values": corpus_by_id.get(book_id, {}).get("editions", []),
                "publisher_values": corpus_by_id.get(book_id, {}).get("publishers", []),
                "catalog_record": catalog_by_id.get(book_id, [None])[0],
                "page_label_count": corpus_by_id.get(book_id, {}).get("page_label_count", 0),
                "volume_label_count": corpus_by_id.get(book_id, {}).get("volume_label_count", 0),
                "missing_page_rows": corpus_by_id.get(book_id, {}).get("missing_page_count", 0),
                "missing_volume_rows": corpus_by_id.get(book_id, {}).get("missing_volume_count", 0),
                "text_sha256": None,
                "edition_review_status": "metadata recorded; printed/scan collation pending",
            }
            for book_id in ROADMAP_STARTERS
        },
        "limitations": [
            "Catalog metadata and Parquet metadata are not independent verification of the printed edition.",
            "Work identity, reprints, abridgments, commentary layers, and text lineage require editorial resolution.",
            "A non-empty row does not demonstrate a complete work or an accurate transcription.",
            "The Parquet schema contains no scan/facsimile locator or OCR-confidence/correction history.",
            "The global page-label count is a count of distinct strings after sentinel handling, not a count of verified printed pages.",
            "Rights status remains needs_review for the Shamela edition text layer; full texts must remain in ignored local scratch until clearance.",
        ],
    }

    manifest = {
        "schema_version": "1.0.0",
        "generated_utc": audit["generated_utc"],
        "dataset_sha256": file_hash,
        "catalog_sha256": audit["inputs"]["catalog"]["sha256"],
        "record_count": len(manifest_records),
        "records": manifest_records,
    }
    (out_dir / "reconciliation.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "source-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Shamela catalog and Parquet reconciliation",
        "",
        f"Generated UTC: {audit['generated_utc']}",
        "",
        "## Inventory",
        "",
        f"- Catalog: {len(catalog_rows):,} rows; {len(catalog_ids):,} distinct book IDs; SHA-256 `{audit['inputs']['catalog']['sha256']}`.",
        f"- Parquet: {summary[0]:,} text rows; {len(corpus_ids):,} distinct book IDs; {summary[2]:,} categories; {parquet_path.stat().st_size:,} bytes.",
        f"- ID intersection: {len(catalog_ids & corpus_ids):,} IDs.",
        f"- Catalog-only IDs: {len(missing_in_parquet):,}; corpus-only IDs: {len(extra_in_parquet):,}.",
        f"- Duplicate catalog IDs: {len(dup_catalog_ids):,}.",
        f"- Empty text rows: {summary[3]:,}; sentinel text rows: {summary[4]:,}.",
        f"- Missing page rows including null/blank/sentinel labels: {summary[5]:,}; missing volume rows: {summary[6]:,}.",
        f"- Parquet file SHA-256: `{file_hash or 'not computed'}`.",
        "",
        "## Metadata discrepancies",
        "",
    ]
    lines.extend(f"- {field}: {count:,} matched IDs whose nonempty catalog value is not among the Parquet values." for field, count in comparison_counts.items())
    if not comparison_counts:
        lines.append("- No nonempty catalog-to-Parquet mismatches in compared fields.")
    lines += [
        "",
        "## Roadmap starter texts",
        "",
        "| Shamela ID | Work | Rows | Volumes | Page labels | Edition / collation |",
        "|---:|---|---:|---:|---:|---|",
    ]
    for book_id, item in audit["starter_work_ids"].items():
        lines.append(f"| {book_id} | {item['work']} | {item['text_row_count']:,} | {item['volume_label_count']:,} | {item['page_label_count']:,} | Present; printed/scan collation pending |")
    lines += [
        "",
        "## Interpretation limits",
        "",
        "These counts establish record availability only. They do not prove that a whole work is present, that the recorded text matches the named edition, or that a locator maps correctly to a scan. Distinguish source work, edition, digitization, corpus row, and printed locator before using a passage as evidence. Shamela rights remain `needs_review`; this report contains metadata only.",
        "",
        "Machine-readable detail: `reconciliation.json` and `source-manifest.json`.",
    ]
    (out_dir / "reconciliation.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "catalog_rows": len(catalog_rows),
        "catalog_ids": len(catalog_ids),
        "corpus_ids": len(corpus_ids),
        "matched": len(catalog_ids & corpus_ids),
        "catalog_only": len(missing_in_parquet),
        "corpus_only": len(extra_in_parquet),
        "duplicate_catalog_ids": len(dup_catalog_ids),
        "starter_count": sum(v["present_in_corpus"] for v in audit["starter_work_ids"].values()),
        "out_dir": str(out_dir),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
