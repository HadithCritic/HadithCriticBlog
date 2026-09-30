from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator, TextIO

DEFAULT_COMPILATION_ID = 1
DEFAULT_HADITHWEB_BOOK_ID = 15
FIELD_ARRAYS = (
    "names", "narrators", "chain_of_narrators", "narration_words", "places",
    "ghareeb", "subjects", "takhreej", "comparisons", "shawahed",
)
PAGE = re.compile(r"\[\s*(\d+)\s*/\s*(\d+)\s*\]")
ENGLISH_NUMBER_PREFIX = re.compile(r"^\s*(?:\*\*)?(\d{1,6})(?:\*\*)?\s*[-–—.]")


def stream_array(path: Path, chunk_size: int = 4 * 1024 * 1024) -> Iterator[dict[str, Any]]:
    """Read objects from a top-level JSON array without loading the 700 MB file."""
    with path.open("r", encoding="utf-8") as source:
        if source.read(1) != "[":
            raise ValueError(f"Expected a top-level JSON array in {path}")
        decoder = json.JSONDecoder()
        buffer = ""
        position = 0
        eof = False
        while True:
            while True:
                while position < len(buffer) and (buffer[position].isspace() or buffer[position] == ","):
                    position += 1
                if position < len(buffer):
                    break
                chunk = source.read(chunk_size)
                if not chunk:
                    eof = True
                    break
                buffer = buffer[position:] + chunk
                position = 0
            if position < len(buffer) and buffer[position] == "]":
                return
            if eof:
                raise ValueError("Unexpected end of file before the array closed")
            try:
                value, end = decoder.raw_decode(buffer, position)
            except json.JSONDecodeError:
                chunk = source.read(chunk_size)
                if not chunk:
                    raise
                buffer = buffer[position:] + chunk
                position = 0
                continue
            if not isinstance(value, dict):
                raise ValueError(f"Expected an object at character {position}")
            yield value
            position = end
            if position > 8 * 1024 * 1024:
                buffer = buffer[position:]
                position = 0


def sha256_text(value: str | None) -> str:
    return hashlib.sha256((value or "").encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(4 * 1024 * 1024), b""):
            size += len(chunk)
            digest.update(chunk)
    return size, digest.hexdigest()


def whitespace_normalize(value: str | None) -> str:
    return " ".join((value or "").split())


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit a raw compilation JSON export against the local corpus SQLite.")
    parser.add_argument("--source", type=Path, default=Path("mus test/musannaf-ibn-abi-shaybah.json"))
    parser.add_argument("--database", type=Path, default=Path("dist-db/silsilah.db"))
    parser.add_argument("--book-id", type=int, default=DEFAULT_COMPILATION_ID, help="SQLite hadith_book.id")
    parser.add_argument("--hadithweb-book-id", type=int, default=DEFAULT_HADITHWEB_BOOK_ID)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()
    source_path = args.source.resolve()
    database_path = args.database.resolve()
    output_path = (args.output or Path(f"dist-db/alignment/compilation-{args.book_id}")).resolve()
    if not source_path.is_file() or not database_path.is_file():
        parser.error("Both source JSON and database must exist")
    output_path.mkdir(parents=True, exist_ok=True)

    db = sqlite3.connect(f"file:{database_path.as_posix()}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    collection_row = db.execute("SELECT * FROM hadith_book WHERE id = ?", (args.book_id,)).fetchone()
    if collection_row is None:
        parser.error(f"SQLite hadith_book.id {args.book_id} does not exist")
    collection = dict(collection_row)
    query_record_sql = """
        SELECT id, book_id, hadith_num, chapter_ar, chapter_en, matn_ar, matn_en, text_ar, text_en,
               path_count, narrator_count, parallel_count, witness_count, variant_count
          FROM hadith WHERE id = ?
    """
    query_path_count_sql = "SELECT count(DISTINCT path_idx) FROM hadith_chain WHERE hadith_id = ?"
    query_narrator_count_sql = "SELECT count(*) FROM hadith_narrator WHERE hadith_id = ?"
    query_paths_sql = "SELECT path_idx, pos, narrator_id, name FROM hadith_chain WHERE hadith_id = ? ORDER BY path_idx, pos"
    query_surfaces_sql = "SELECT pos, narrator_id, surface FROM hadith_narrator WHERE hadith_id = ? ORDER BY pos"

    total_db = db.execute("SELECT count(*) FROM hadith WHERE book_id = ?", (args.book_id,)).fetchone()[0]
    english_collisions = db.execute("""
        SELECT count(*) FROM (
          SELECT chapter_en FROM hadith WHERE book_id = ?
           GROUP BY chapter_en HAVING count(DISTINCT chapter_ar) > 1
        )
    """, (args.book_id,)).fetchone()[0]
    arabic_collisions = db.execute("""
        SELECT count(*) FROM (
          SELECT chapter_ar FROM hadith WHERE book_id = ?
           GROUP BY chapter_ar HAVING count(DISTINCT chapter_en) > 1
        )
    """, (args.book_id,)).fetchone()[0]
    duplicate_numbers = [dict(row) for row in db.execute("""
        SELECT hadith_num, count(*) AS record_count, group_concat(id) AS record_ids
          FROM hadith WHERE book_id = ? GROUP BY hadith_num HAVING count(*) > 1
         ORDER BY hadith_num
    """, (args.book_id,))]
    printed_number_values = [
        str(row[0]).strip()
        for row in db.execute(
            "SELECT hadith_num FROM hadith WHERE book_id = ? ORDER BY id", (args.book_id,)
        )
    ]
    numeric_printed_values = [
        int(value) for value in printed_number_values if value.isdecimal()
    ]
    numeric_number_counts = Counter(numeric_printed_values)
    maximum_printed_number = max(numeric_number_counts, default=0)
    missing_printed_numbers = sorted(
        set(range(1, maximum_printed_number + 1)) - set(numeric_number_counts)
    )
    chapter_run_count = db.execute("""
        WITH ordered AS (
          SELECT chapter_ar, lag(chapter_ar) OVER (ORDER BY id) AS prior_chapter
            FROM hadith WHERE book_id = ?
        )
        SELECT count(*) FROM ordered
         WHERE prior_chapter IS NULL OR chapter_ar <> prior_chapter
    """, (args.book_id,)).fetchone()[0]

    counters: Counter[str] = Counter()
    array_entries: Counter[str] = Counter()
    seen_ids: set[int] = set()
    mismatch_rows: list[dict[str, Any]] = []
    english_number_prefix_mismatches: list[dict[str, Any]] = []
    chapter_to_english: dict[str, set[str]] = defaultdict(set)
    english_to_chapter: dict[str, set[str]] = defaultdict(set)
    ledger_path = output_path / "records.csv"
    fields = [
        "id", "hadith_num", "chapter_ar", "chapter_en", "source_matn_present",
        "database_matn_present", "matn_state", "source_text_whitespace_match",
        "source_matn_whitespace_match", "source_chapter_whitespace_match", "page_marker_count",
        "source_hadith_text_sha256", "source_hadith_text_diac_sha256",
        "source_matn_text_sha256", "source_matn_text_diac_sha256", "source_chain_path_count",
        "database_chain_path_count", "source_narrator_surface_count", "database_narrator_surface_count",
        "source_connector_count", "connector_and_name_array_same_length", "source_chain_path_values_match",
        "source_narrator_surface_values_match",
    ]
    with ledger_path.open("w", encoding="utf-8-sig", newline="") as ledger_file:
        writer = csv.DictWriter(ledger_file, fieldnames=fields)
        writer.writeheader()
        for source in stream_array(source_path):
            counters["source_records"] += 1
            record_id = source.get("mainId")
            if not isinstance(record_id, int):
                counters["invalid_or_missing_source_id"] += 1
                mismatch_rows.append({"id": record_id, "field": "mainId", "kind": "missing_or_not_integer"})
                continue
            if record_id in seen_ids:
                counters["duplicate_source_id"] += 1
                mismatch_rows.append({"id": record_id, "field": "mainId", "kind": "duplicate"})
            seen_ids.add(record_id)
            row = db.execute(query_record_sql, (record_id,)).fetchone()
            if row is None:
                counters["source_id_missing_from_database"] += 1
                mismatch_rows.append({"id": record_id, "field": "id", "kind": "missing_from_database"})
                continue
            if row["book_id"] != args.book_id:
                counters["source_id_wrong_compilation"] += 1
                mismatch_rows.append({"id": record_id, "field": "book_id", "kind": "wrong_compilation"})
            source_number = str(source.get("hadith_num") or "")
            database_number = str(row["hadith_num"] or "")
            counters["hadith_number_exact_matches"] += source_number == database_number
            if source_number != database_number:
                mismatch_rows.append({"id": record_id, "field": "hadith_num", "kind": "not_exactly_equal", "source": source_number, "database": database_number})
            english_number_match = ENGLISH_NUMBER_PREFIX.match(row["text_en"] or "")
            if english_number_match:
                english_prefix_number = english_number_match.group(1)
                counters["english_text_leading_number_present"] += 1
                matches_local_number = english_prefix_number == database_number
                counters["english_text_leading_number_matches_local_number"] += matches_local_number
                if not matches_local_number:
                    counters["english_text_leading_number_differs_from_local_number"] += 1
                    english_number_prefix_mismatches.append({
                        "id": record_id,
                        "english_text_number_prefix": english_prefix_number,
                        "local_hadith_num": database_number,
                    })
            source_book_title = whitespace_normalize(source.get("book"))
            database_book_title = whitespace_normalize(collection.get("title_ar"))
            counters["book_title_whitespace_matches"] += source_book_title == database_book_title
            if source_book_title != database_book_title:
                mismatch_rows.append({"id": record_id, "field": "book", "kind": "not_equal_after_whitespace_normalization", "source": source_book_title, "database": database_book_title})
            source_chapter = source.get("chapter") or ""
            source_text = source.get("hadith_text") or ""
            source_matn = source.get("matn_text") or ""
            chapter_equal = whitespace_normalize(source_chapter) == whitespace_normalize(row["chapter_ar"])
            text_equal = whitespace_normalize(source_text) == whitespace_normalize(row["text_ar"])
            matn_equal = whitespace_normalize(source_matn) == whitespace_normalize(row["matn_ar"])
            counters["chapter_whitespace_matches"] += chapter_equal
            counters["full_text_whitespace_matches"] += text_equal
            counters["matn_whitespace_matches"] += matn_equal
            counters["source_matn_present"] += bool(source_matn.strip())
            counters["database_matn_present"] += bool((row["matn_ar"] or "").strip())
            counters["both_matin_present"] += bool(source_matn.strip() and (row["matn_ar"] or "").strip())
            counters["vocalized_full_text_present"] += bool((source.get("hadith_text_diac") or "").strip())
            counters["vocalized_matn_present"] += bool((source.get("matn_text_diac") or "").strip())
            counters["source_text_has_edition_note"] += "طبعة دار" in source_text
            counters["source_page_markers"] += len(PAGE.findall(source_text))
            counters["reports_with_page_markers"] += bool(PAGE.search(source_text))
            counters["reports_with_edition_notes"] += "طبعة دار" in source_text
            chapter_to_english[source_chapter].add(row["chapter_en"])
            english_to_chapter[row["chapter_en"]].add(source_chapter)
            for key in FIELD_ARRAYS:
                value = source.get(key)
                if isinstance(value, list):
                    counters[f"records_with_{key}"] += bool(value)
                    array_entries[key] += len(value)
            if not chapter_equal:
                counters["chapter_mismatches"] += 1
                mismatch_rows.append({"id": record_id, "field": "chapter", "kind": "not_equal_after_whitespace_normalization"})
            if not text_equal:
                counters["full_text_mismatches"] += 1
                mismatch_rows.append({"id": record_id, "field": "hadith_text", "kind": "not_equal_after_whitespace_normalization"})
            if not matn_equal:
                counters["matn_mismatches"] += 1
                mismatch_rows.append({"id": record_id, "field": "matn_text", "kind": "not_equal_after_whitespace_normalization"})
            source_paths = source.get("chain_of_narrators") or []
            source_names = source.get("names") or []
            source_connectors = source.get("narration_words") or []
            row_path_count = db.execute(query_path_count_sql, (record_id,)).fetchone()[0]
            row_narrator_count = db.execute(query_narrator_count_sql, (record_id,)).fetchone()[0]
            database_paths = db.execute(query_paths_sql, (record_id,)).fetchall()
            database_surfaces = db.execute(query_surfaces_sql, (record_id,)).fetchall()
            grouped_database_paths: dict[int, list[sqlite3.Row]] = defaultdict(list)
            for path_row in database_paths:
                grouped_database_paths[path_row["path_idx"]].append(path_row)
            source_paths_match = len(source_paths) == len(grouped_database_paths)
            if source_paths_match:
                for path_idx, source_chain_nodes in enumerate(source_paths):
                    database_chain_nodes = grouped_database_paths.get(path_idx, [])
                    if len(source_chain_nodes) != len(database_chain_nodes) or any(
                        whitespace_normalize(source_name) != whitespace_normalize(database_node["name"])
                        for source_name, database_node in zip(source_chain_nodes, database_chain_nodes)
                    ):
                        source_paths_match = False
                        break
            source_surfaces_match = len(source_names) == len(database_surfaces)
            if source_surfaces_match:
                for source_name, database_surface in zip(source_names, database_surfaces):
                    if (
                        len(source_name) < 3
                        or whitespace_normalize(source_name[0]) != whitespace_normalize(database_surface["surface"])
                        or source_name[2] != database_surface["narrator_id"]
                    ):
                        source_surfaces_match = False
                        break
            connectors_match_names = len(source_connectors) == len(source_names)
            counters["source_chain_path_values_match"] += source_paths_match
            counters["source_narrator_surface_values_match"] += source_surfaces_match
            counters["source_connector_name_lengths_match"] += connectors_match_names
            counters["source_connectors"] += len(source_connectors)
            if not source_paths_match:
                mismatch_rows.append({"id": record_id, "field": "chain_of_narrators", "kind": "not_equal_in_path_order"})
            if not source_surfaces_match:
                mismatch_rows.append({"id": record_id, "field": "names", "kind": "not_equal_in_position_surface_or_narrator_id"})
            counters["source_records_with_connector_name_length_difference"] += not connectors_match_names
            counters[f"connector_name_length_delta_{len(source_connectors) - len(source_names):+d}"] += 1
            counters["database_path_counts_match"] += row["path_count"] == row_path_count
            counters["database_narrator_counts_match"] += row["narrator_count"] == row_narrator_count
            counters["source_records_with_paths"] += bool(source_paths)
            counters["source_path_instances"] += len(source_paths)
            counters["source_records_with_names"] += bool(source_names)
            counters["source_name_instances"] += len(source_names)
            matn_state = "both_present" if source_matn.strip() and (row["matn_ar"] or "").strip() else "both_absent" if not source_matn.strip() and not (row["matn_ar"] or "").strip() else "presence_mismatch"
            writer.writerow({
                "id": record_id,
                "hadith_num": row["hadith_num"],
                "chapter_ar": source_chapter,
                "chapter_en": row["chapter_en"],
                "source_matn_present": bool(source_matn.strip()),
                "database_matn_present": bool((row["matn_ar"] or "").strip()),
                "matn_state": matn_state,
                "source_text_whitespace_match": text_equal,
                "source_matn_whitespace_match": matn_equal,
                "source_chapter_whitespace_match": chapter_equal,
                "page_marker_count": len(PAGE.findall(source_text)),
                "source_hadith_text_sha256": sha256_text(source_text),
                "source_hadith_text_diac_sha256": sha256_text(source.get("hadith_text_diac")),
                "source_matn_text_sha256": sha256_text(source_matn),
                "source_matn_text_diac_sha256": sha256_text(source.get("matn_text_diac")),
                "source_chain_path_count": len(source_paths),
                "database_chain_path_count": row_path_count,
                "source_narrator_surface_count": len(source_names),
                "database_narrator_surface_count": row_narrator_count,
                "source_connector_count": len(source_connectors),
                "connector_and_name_array_same_length": connectors_match_names,
                "source_chain_path_values_match": source_paths_match,
                "source_narrator_surface_values_match": source_surfaces_match,
            })
    db_ids = {row[0] for row in db.execute("SELECT id FROM hadith WHERE book_id = ?", (args.book_id,))}
    counters["database_ids_missing_from_source"] = len(db_ids - seen_ids)
    counters["database_records"] = total_db
    counters["english_chapter_labels_with_multiple_arabic_labels"] = english_collisions
    counters["arabic_chapter_labels_with_multiple_english_labels"] = arabic_collisions
    counters["reports_without_chain_paths"] = db.execute("SELECT count(*) FROM hadith WHERE book_id = ? AND path_count = 0", (args.book_id,)).fetchone()[0]
    counters["reports_without_narrator_surfaces"] = db.execute("SELECT count(*) FROM hadith WHERE book_id = ? AND narrator_count = 0", (args.book_id,)).fetchone()[0]
    counters["no_path_but_narrator_surface"] = db.execute("""
        SELECT count(*) FROM hadith h
         WHERE h.book_id = ? AND NOT EXISTS (SELECT 1 FROM hadith_chain c WHERE c.hadith_id = h.id)
           AND EXISTS (SELECT 1 FROM hadith_narrator n WHERE n.hadith_id = h.id)
    """, (args.book_id,)).fetchone()[0]
    counters["number_duplicate_groups"] = len(duplicate_numbers)
    counters["number_duplicate_excess_records"] = sum(item["record_count"] - 1 for item in duplicate_numbers)

    source_size, source_hash = sha256_file(source_path)
    db_size, db_hash = sha256_file(database_path)
    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": {"compilation_id": args.book_id, "compilation_title_en": collection["title_en"], "compilation_title_ar": collection["title_ar"], "external_hadithweb_book_id": args.hadithweb_book_id},
        "inputs": {
            "source_json": {"path": str(source_path), "bytes": source_size, "sha256": source_hash},
            "sqlite_master": {"path": str(database_path), "bytes": db_size, "sha256": db_hash},
        },
        "counts": dict(sorted(counters.items())),
        "source_array_entry_counts": dict(sorted(array_entries.items())),
            "chapter_alignment": {
            "distinct_arabic_labels": len(chapter_to_english),
            "distinct_english_labels": len(english_to_chapter),
            "english_labels_with_multiple_arabic_labels": [
                {"chapter_en": en, "chapter_ar": sorted(ar)}
                for en, ar in sorted(english_to_chapter.items()) if len(ar) > 1
            ],
        },
        "duplicate_printed_numbers": duplicate_numbers,
        "english_number_prefix_mismatches": english_number_prefix_mismatches,
        "numbering_audit": {
            "record_count": total_db,
            "blank_number_records": sum(not value for value in printed_number_values),
            "numeric_numbered_record_count": len(numeric_printed_values),
            "distinct_numeric_numbers": len(numeric_number_counts),
            "maximum_numeric_number": maximum_printed_number,
            "missing_numbers_from_1_to_maximum": missing_printed_numbers,
            "duplicate_numeric_excess_records": sum(
                count - 1 for count in numeric_number_counts.values() if count > 1
            ),
            "non_numeric_nonblank_values": sorted(
                {value for value in printed_number_values if value and not value.isdecimal()}
            ),
        },
        "chapter_run_audit": {
            "contiguous_chapter_label_runs": chapter_run_count,
            "distinct_arabic_chapter_labels": len(chapter_to_english),
            "source_chapter_label_is_not_a_bab_identifier": True,
        },
        "mismatch_count": len(mismatch_rows),
        "mismatches_file": "mismatches.csv",
        "records_file": "records.csv",
        "method": {
            "string_comparison": "Unicode strings compared after collapsing whitespace only; source strings are never rewritten.",
            "database_rows": f"SQLite rows for compilation id {args.book_id}; stable hadith.id matched to raw mainId.",
            "isnad_arrays": "Source `names` surfaces and `chain_of_narrators` paths are compared to their matching SQLite tables in order. `narration_words` is audited as its own source sequence; its count is not required to equal the name count because it is not a positional one-to-one field.",
            "limitations": [
                "Source edition title-page images and rights terms are not embedded in the JSON.",
                "Chapter labels are not stable Kitāb or Bāb identifiers.",
                "Bibliographic claims require independent source verification; the parity audit itself uses no network data.",
            ],
        },
    }
    (output_path / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (output_path / "mismatches.csv").open("w", encoding="utf-8-sig", newline="") as mismatch_file:
        writer = csv.DictWriter(mismatch_file, fieldnames=["id", "field", "kind", "source", "database"])
        writer.writeheader()
        writer.writerows(mismatch_rows)
    print(json.dumps({"output": str(output_path), "source_records": counters["source_records"], "database_records": total_db, "mismatches": len(mismatch_rows), "source_sha256": source_hash, "database_sha256": db_hash}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"audit failed: {error}", file=sys.stderr)
        raise
