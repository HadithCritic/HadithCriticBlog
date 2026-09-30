from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import sqlite3
import sys
from pathlib import Path
from typing import Any, Iterator


PAGE = re.compile(r"\[\s*(\d+)\s*/\s*(\d+)\s*\]")


def load_script(name: str, filename: str) -> Any:
    script = Path(__file__).with_name(filename)
    spec = importlib.util.spec_from_file_location(name, script)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {script}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sqlite_uri(path: Path) -> str:
    return f"file:{path.resolve().as_posix()}?mode=ro"


def ensure_schema(db: sqlite3.Connection) -> None:
    expected_columns = {
        "hadith": {"text_ar_diac", "matn_ar_diac"},
        "hadith_narrator": {"surface_diac"},
    }
    expected_tables = {
        "hadith_edition", "hadith_kitab", "hadith_bab", "hadith_structure", "hadith_reference"
    }
    actual_tables = {
        row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
    }
    columns_match = all(
        expected <= {row[1] for row in db.execute(f"PRAGMA table_info({table})")}
        for table, expected in expected_columns.items()
    )
    any_new_columns = any(
        {row[1] for row in db.execute(f"PRAGMA table_info({table})")} & expected
        for table, expected in expected_columns.items()
    )
    if columns_match and expected_tables <= actual_tables:
        return
    if any_new_columns or actual_tables & expected_tables:
        raise ValueError("Partially applied structured corpus migration")
    migration = Path(__file__).parents[1] / "migrations" / "0008_create_structured_hadith.sql"
    db.executescript(migration.read_text(encoding="utf-8"))


def assert_source_matches_register(
    source_path: Path,
    database_path: Path,
    register: dict[str, Any],
) -> None:
    expected_source_hash = register["source"]["sha256"]
    expected_database_hash = register["source"]["database_sha256"]
    actual_source_hash = hash_file(source_path)
    actual_database_hash = hash_file(database_path)
    if actual_source_hash != expected_source_hash:
        raise ValueError("Raw source JSON hash differs from the reviewed boundary register")
    if actual_database_hash != expected_database_hash:
        raise ValueError("Master SQLite hash differs from the reviewed boundary register")


def insert_structure(
    db: sqlite3.Connection,
    register: dict[str, Any],
    boundary_module: Any,
) -> dict[str, int]:
    summaries = {key: 0 for key in (
        "kitab_count", "bab_count", "reports_assigned", "reports_without_bab",
        "generic_bab_count", "chapter_label_candidate_count",
    )}
    boundaries = register["boundaries"]
    source_url = "https://sunna.alifta.gov.sa/Book/Details?bookId=15"
    for boundary in boundaries:
        marker = boundary["marker_excerpt_ar"]
        title_ar = boundary_module.title_from_marker(marker)
        db.execute(
            """INSERT INTO hadith_kitab
               (id, compilation_id, ordinal, title_ar, title_en, marker_text_ar,
                boundary_status, title_en_status, provenance_uri)
               VALUES (?, 1, ?, ?, NULL, ?, ?, 'not_supplied', ?)""",
            (boundary["start_report_id"], boundary["ordinal"], title_ar, marker,
             boundary["boundary_status"], source_url),
        )
    summaries["kitab_count"] = len(boundaries)

    for index, boundary in enumerate(boundaries):
        start_id = boundary["start_report_id"]
        next_start = boundaries[index + 1]["start_report_id"] if index + 1 < len(boundaries) else None
        kitab_title = boundary_module.title_from_marker(boundary["marker_excerpt_ar"])
        sql = "SELECT id, chapter_ar, chapter_en FROM hadith WHERE book_id = 1 AND id >= ?"
        params: tuple[int, ...] = (start_id,)
        if next_start is not None:
            sql += " AND id < ?"
            params = (start_id, next_start)
        sql += " ORDER BY id"

        occurrence = 0
        bab_ordinal = 0
        pair: tuple[str, str] | None = None
        run: list[sqlite3.Row] = []
        assignment_rows: list[tuple[int, int, int | None, str]] = []
        bab_rows: list[tuple[Any, ...]] = []

        def flush_run() -> None:
            nonlocal occurrence, bab_ordinal, run, pair
            if not run or pair is None:
                return
            occurrence += 1
            chapter_ar, chapter_en = pair
            exact_kitab_label = (
                boundary_module.normalized_arabic_heading(chapter_ar)
                == boundary_module.normalized_arabic_heading("كتاب " + kitab_title)
            )
            if exact_kitab_label:
                assignment_rows.extend(
                    (item["id"], start_id, None, "kitab_title_only") for item in run
                )
                summaries["reports_without_bab"] += len(run)
            else:
                bab_ordinal += 1
                bab_id = run[0]["id"]
                label_status = (
                    "generic_source_label"
                    if boundary_module.normalized_arabic_heading(chapter_ar)
                    == boundary_module.normalized_arabic_heading("باب")
                    else "source_chapter_field"
                )
                title_en_status = "legacy_unverified" if chapter_en.strip() else "missing"
                bab_rows.append((bab_id, start_id, bab_ordinal, chapter_ar, chapter_en, label_status, title_en_status))
                assignment_rows.extend(
                    (item["id"], start_id, bab_id, "source_chapter_label") for item in run
                )
                summaries["bab_count"] += 1
                summaries["generic_bab_count"] += label_status == "generic_source_label"
                summaries["chapter_label_candidate_count"] += label_status == "source_chapter_field"
            run = []

        for item in db.execute(sql, params):
            item_pair = (item["chapter_ar"] or "", item["chapter_en"] or "")
            if pair is not None and item_pair != pair:
                flush_run()
            pair = item_pair
            run.append(item)
        flush_run()

        db.executemany(
            """INSERT INTO hadith_bab
               (id, kitab_id, ordinal, title_ar, title_en, label_status, title_en_status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            bab_rows,
        )
        db.executemany(
            """INSERT INTO hadith_structure
               (hadith_id, kitab_id, bab_id, assignment_basis)
               VALUES (?, ?, ?, ?)""",
            assignment_rows,
        )
        summaries["reports_assigned"] += len(assignment_rows)

    return summaries


def enrich_text_and_references(
    db: sqlite3.Connection,
    source_path: Path,
    stream_array: Any,
) -> dict[str, int]:
    counters = {key: 0 for key in (
        "source_records", "full_text_diac_added", "matn_diac_added",
        "narrator_surfaces_diac_added", "page_reference_occurrences",
    )}
    update_hadith = db.cursor()
    update_surface = db.cursor()
    insert_reference = db.cursor()
    for source in stream_array(source_path):
        hadith_id = source.get("mainId")
        if not isinstance(hadith_id, int):
            raise ValueError("Source record is missing integer mainId")
        full_diac = source.get("hadith_text_diac") or None
        matn_diac = source.get("matn_text_diac") or None
        update_hadith.execute(
            "UPDATE hadith SET text_ar_diac = ?, matn_ar_diac = ? WHERE id = ? AND book_id = 1",
            (full_diac, matn_diac, hadith_id),
        )
        if update_hadith.rowcount != 1:
            raise ValueError(f"Could not update vocalized text for source report {hadith_id}")
        counters["source_records"] += 1
        counters["full_text_diac_added"] += full_diac is not None
        counters["matn_diac_added"] += matn_diac is not None

        for position, name in enumerate(source.get("names") or []):
            if len(name) < 3:
                raise ValueError(f"Malformed narrator surface at report {hadith_id}, position {position}")
            update_surface.execute(
                "UPDATE hadith_narrator SET surface_diac = ? WHERE hadith_id = ? AND pos = ? AND narrator_id = ?",
                (name[1] or None, hadith_id, position, name[2]),
            )
            if update_surface.rowcount != 1:
                raise ValueError(f"Could not align vocalized narrator surface at report {hadith_id}, position {position}")
            counters["narrator_surfaces_diac_added"] += bool(name[1])

        for ordinal, match in enumerate(PAGE.finditer(source.get("hadith_text") or ""), start=1):
            volume, page = (int(value) for value in match.groups())
            insert_reference.execute(
                """INSERT INTO hadith_reference
                   (hadith_id, reference_ordinal, edition_id, reference_kind, volume, page,
                    source_marker, source_field)
                   VALUES (?, ?, 1, 'printed_page', ?, ?, ?, 'hadith_text')""",
                (hadith_id, ordinal, volume, page, match.group(0)),
            )
            counters["page_reference_occurrences"] += 1
    return counters


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create a staged, additive structured corpus for Musannaf Ibn Abi Shaybah."
    )
    parser.add_argument("--source", type=Path, default=Path("mus test/musannaf-ibn-abi-shaybah.json"))
    parser.add_argument("--master", type=Path, default=Path("dist-db/silsilah.db"))
    parser.add_argument(
        "--register", type=Path,
        default=Path("src/data/corpus-alignment/ibn-abi-shaybah-boundaries.json"),
    )
    parser.add_argument(
        "--output", type=Path,
        default=Path("dist-db/alignment/ibn-abi-shaybah/structured-master-v1.db"),
    )
    args = parser.parse_args()
    source_path, master_path, register_path, output_path = (
        path.resolve() for path in (args.source, args.master, args.register, args.output)
    )
    if not source_path.is_file() or not master_path.is_file() or not register_path.is_file():
        parser.error("The source JSON, master database, and reviewed boundary register must exist")
    if output_path.exists():
        parser.error(f"Refusing to overwrite staged database: {output_path}")

    register = json.loads(register_path.read_text(encoding="utf-8"))
    boundary_module = load_script("ibn_boundary_audit", "audit-ibn-abi-shaybah-boundaries.py")
    source_audit_module = load_script("ibn_source_audit", "audit-ibn-abi-shaybah.py")
    assert_source_matches_register(source_path, master_path, register)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    source_db = sqlite3.connect(sqlite_uri(master_path), uri=True)
    target_db = sqlite3.connect(output_path)
    try:
        source_db.backup(target_db, pages=20000)
    finally:
        source_db.close()
        target_db.close()

    db = sqlite3.connect(output_path)
    db.row_factory = sqlite3.Row
    try:
        db.execute("PRAGMA foreign_keys = ON")
        ensure_schema(db)
        db.execute("BEGIN IMMEDIATE")
        db.execute(
            """INSERT INTO hadith_edition
               (id, compilation_id, work_title_ar, work_title_en, publisher_ar, publisher_en,
                publication_place_ar, edition_statement_ar, year_hijri, year_gregorian,
                volume_count, catalog_url, metadata_language)
               VALUES (1, 1, 'مصنف ابن أبي شيبة', NULL,
                       'دار القبلة؛ مؤسسة علوم القرآن', NULL, 'جدة؛ دمشق',
                       'الطبعة الأولى: 1427 هـ - 2006م', 1427, 2006, 21,
                       'https://sunna.alifta.gov.sa/Book/Details?bookId=15', 'ar')"""
        )
        structure_counts = insert_structure(db, register, boundary_module)
        source_counts = enrich_text_and_references(
            db, source_path, source_audit_module.stream_array
        )
        db.execute("PRAGMA user_version = 2")
        db.commit()

        integrity = db.execute("PRAGMA quick_check").fetchone()[0]
        if integrity != "ok":
            raise ValueError(f"SQLite quick_check failed: {integrity}")
        foreign_key_errors = db.execute("PRAGMA foreign_key_check").fetchall()
        if foreign_key_errors:
            raise ValueError(f"SQLite foreign-key violations: {len(foreign_key_errors)}")

        result = {
            "structure": structure_counts,
            "source_fields": source_counts,
            "database": {
                "hadith_records": db.execute("SELECT count(*) FROM hadith WHERE book_id = 1").fetchone()[0],
                "kitab_records": db.execute("SELECT count(*) FROM hadith_kitab WHERE compilation_id = 1").fetchone()[0],
                "bab_records": db.execute("SELECT count(*) FROM hadith_bab b JOIN hadith_kitab k ON k.id = b.kitab_id WHERE k.compilation_id = 1").fetchone()[0],
                "unassigned_bab_reports": db.execute("SELECT count(*) FROM hadith_structure WHERE kitab_id IN (SELECT id FROM hadith_kitab WHERE compilation_id = 1) AND bab_id IS NULL").fetchone()[0],
                "hadith_structure_records": db.execute("SELECT count(*) FROM hadith_structure WHERE kitab_id IN (SELECT id FROM hadith_kitab WHERE compilation_id = 1)").fetchone()[0],
                "printed_page_references": db.execute("SELECT count(*) FROM hadith_reference r JOIN hadith h ON h.id = r.hadith_id WHERE h.book_id = 1").fetchone()[0],
                "full_arabic_with_diacritics": db.execute("SELECT count(*) FROM hadith WHERE book_id = 1 AND text_ar_diac IS NOT NULL").fetchone()[0],
                "matn_ar_with_diacritics": db.execute("SELECT count(*) FROM hadith WHERE book_id = 1 AND matn_ar_diac IS NOT NULL").fetchone()[0],
                "narrator_surfaces_with_diacritics": db.execute("SELECT count(*) FROM hadith_narrator n JOIN hadith h ON h.id = n.hadith_id WHERE h.book_id = 1 AND n.surface_diac IS NOT NULL").fetchone()[0],
            },
            "checks": {"quick_check": integrity, "foreign_key_errors": len(foreign_key_errors)},
            "output": str(output_path),
        }
        if result["database"]["hadith_records"] != 39096 or result["database"]["hadith_structure_records"] != 39096:
            raise ValueError("Report or hierarchy assignment count is not 39,096")
        if result["database"]["kitab_records"] != 41 or result["database"]["printed_page_references"] != 12000:
            raise ValueError("Unexpected Kitab or printed page-reference count")
        if result["database"]["unassigned_bab_reports"] != 237:
            raise ValueError("Unexpected count of reports without an identified Bāb")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"corpus enrichment failed: {error}", file=sys.stderr)
        raise
