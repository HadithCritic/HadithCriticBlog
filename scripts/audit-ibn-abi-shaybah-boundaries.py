from __future__ import annotations

import argparse
import csv
import hashlib
import importlib.util
import json
import re
import sqlite3
import sys
import unicodedata
from pathlib import Path
from typing import Any


BOUNDARIES = [
    (1, 237072), (2, 239476), (3, 239780), (4, 247188), (5, 248247),
    (6, 249412), (7, 250982), (8, 251597), (9, 255519), (10, 257662),
    (11, 259574), (12, 259844), (13, 260305), (14, 264498), (15, 264890),
    (16, 265446), (17, 265502), (18, 265907), (19, 266694), (20, 268384),
    (21, 270030), (22, 271209), (23, 271292), (24, 272274), (25, 272764),
    (26, 272915), (27, 273014), (28, 273201), (29, 273602), (30, 274338),
    (31, 275316), (32, 276721), (33, 276873), (34, 277418), (35, 277674),
    (36, 277705), (37, 279299), (38, 279635), (39, 280248), (40, 280871),
    (41, 281523),
]


def load_streamer() -> Any:
    script = Path(__file__).with_name("audit-ibn-abi-shaybah.py")
    spec = importlib.util.spec_from_file_location("ibn_abi_shaybah_audit", script)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load source JSON streamer: {script}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.stream_array


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def marker_excerpt(text: str, ordinal: int) -> str | None:
    """Return an exact numbered Kitab marker from the report opening."""
    pattern = re.compile(
        rf"(?<!\d){ordinal}\s*(?:[-–—,:]\s*)?(?:\d+\s*[-–—,:]\s*)?"
        r"(?:\[\s*)?كتاب"
        r"[^\]\r\n]{0,120}?"
        r"(?=\]|\s+(?:\d+\s*[-–—]\s*(?!كتاب)|قال\b|حدثنا\b|هذا\b)|\r?\n|$)\]?"
    )
    match = pattern.search(text[:2400])
    return match.group(0).strip() if match else None


def normalized_arabic_heading(value: str | None) -> str:
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(
        char for char in value
        if unicodedata.category(char) != "Mn" and char != "ـ"
    )
    value = re.sub(r"^[\W_]+|[\W_]+$", "", value, flags=re.UNICODE)
    return " ".join(value.split())


def title_from_marker(marker: str) -> str:
    title = marker[marker.index("كتاب") + len("كتاب"):]
    return re.sub(r"^[\s:：]+|[\s\]\[.،؛:：]+$", "", title)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify and emit the source-backed Kitab boundary register for compilation 1."
    )
    parser.add_argument("--source", type=Path, default=Path("mus test/musannaf-ibn-abi-shaybah.json"))
    parser.add_argument("--database", type=Path, default=Path("dist-db/silsilah.db"))
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("src/data/corpus-alignment/ibn-abi-shaybah-boundaries.json"),
    )
    parser.add_argument(
        "--runs-output",
        type=Path,
        default=Path("dist-db/alignment/ibn-abi-shaybah/chapter-runs.csv"),
    )
    args = parser.parse_args()
    source_path = args.source.resolve()
    database_path = args.database.resolve()
    output_path = args.output.resolve()
    if not source_path.is_file() or not database_path.is_file():
        parser.error("Both the raw source JSON and master SQLite database must exist")

    expected = dict(BOUNDARIES)
    rows: dict[int, dict[str, Any]] = {}
    stream_array = load_streamer()
    for source in stream_array(source_path):
        if source.get("mainId") in expected.values():
            rows[source["mainId"]] = source
    missing = sorted(set(expected.values()) - rows.keys())
    if missing:
        raise ValueError(f"Boundary IDs missing from source JSON: {missing}")

    connection = sqlite3.connect(f"file:{database_path.as_posix()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    collection = connection.execute(
        "SELECT id, title_en, title_ar FROM hadith_book WHERE id = 1"
    ).fetchone()
    if collection is None:
        raise ValueError("Compilation id 1 is absent from hadith_book")

    boundaries = []
    chapter_runs: list[dict[str, Any]] = []
    for index, (ordinal, start_id) in enumerate(BOUNDARIES):
        source = rows[start_id]
        text = source.get("hadith_text") or ""
        marker = marker_excerpt(text, ordinal)
        row = connection.execute(
            "SELECT id, book_id, chapter_ar, chapter_en, text_ar FROM hadith WHERE id = ?",
            (start_id,),
        ).fetchone()
        if row is None or row["book_id"] != 1:
            raise ValueError(f"Boundary {ordinal} / {start_id} is not in compilation 1")
        if marker is None:
            raise ValueError(f"Boundary {ordinal} / {start_id} has no كتاب marker in its opening text")
        if " ".join(text.split()) != " ".join((row["text_ar"] or "").split()):
            raise ValueError(f"Source full text differs from SQLite at boundary {start_id}")

        next_start = BOUNDARIES[index + 1][1] if index + 1 < len(BOUNDARIES) else None
        if next_start is None:
            count = connection.execute(
                "SELECT count(*) FROM hadith WHERE book_id = 1 AND id >= ?", (start_id,)
            ).fetchone()[0]
            end_id = connection.execute(
                "SELECT max(id) FROM hadith WHERE book_id = 1"
            ).fetchone()[0]
        else:
            count = connection.execute(
                "SELECT count(*) FROM hadith WHERE book_id = 1 AND id >= ? AND id < ?",
                (start_id, next_start),
            ).fetchone()[0]
            end_id = connection.execute(
                "SELECT max(id) FROM hadith WHERE book_id = 1 AND id < ?", (next_start,)
            ).fetchone()[0]

        boundaries.append({
            "ordinal": ordinal,
            "start_report_id": start_id,
            "end_report_id": end_id,
            "report_count": count,
            "boundary_status": "explicit_source_marker",
            "marker_excerpt_ar": marker,
            "first_chapter_label_ar": row["chapter_ar"],
            "first_chapter_label_en": row["chapter_en"],
            "source_report_text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
            "evidence": "The raw source report contains a كتاب marker in its opening text; its full Arabic text matches the master after whitespace-only normalization.",
        })

        kitab_title = title_from_marker(marker)
        sql = "SELECT id, chapter_ar, chapter_en FROM hadith WHERE book_id = 1 AND id >= ?"
        params: tuple[int, ...] = (start_id,)
        if next_start is not None:
            sql += " AND id < ?"
            params = (start_id, next_start)
        sql += " ORDER BY id"
        current_pair: tuple[str | None, str | None] | None = None
        current_run: dict[str, Any] | None = None
        occurrence = 0
        for chapter_row in connection.execute(sql, params):
            pair = (chapter_row["chapter_ar"], chapter_row["chapter_en"])
            if pair != current_pair:
                if current_run is not None:
                    chapter_runs.append(current_run)
                occurrence += 1
                chapter_ar, chapter_en = pair
                if not chapter_ar and not chapter_en:
                    classification = "missing_chapter_label"
                elif normalized_arabic_heading(chapter_ar) == normalized_arabic_heading("كتاب " + kitab_title):
                    classification = "kitab_heading_reused_as_chapter_label"
                elif normalized_arabic_heading(chapter_ar) == normalized_arabic_heading("باب"):
                    classification = "generic_bab_label"
                else:
                    classification = "source_chapter_label_candidate"
                current_run = {
                    "kitab_ordinal": ordinal,
                    "chapter_occurrence": occurrence,
                    "start_report_id": chapter_row["id"],
                    "end_report_id": chapter_row["id"],
                    "report_count": 1,
                    "chapter_ar": chapter_ar,
                    "chapter_en": chapter_en,
                    "classification": classification,
                    "kitab_title_from_marker_ar": kitab_title,
                }
                current_pair = pair
            else:
                assert current_run is not None
                current_run["end_report_id"] = chapter_row["id"]
                current_run["report_count"] += 1
        if current_run is not None:
            chapter_runs.append(current_run)

    runs_output = args.runs_output.resolve()
    runs_output.parent.mkdir(parents=True, exist_ok=True)
    with runs_output.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=[
            "kitab_ordinal", "chapter_occurrence", "start_report_id", "end_report_id",
            "report_count", "chapter_ar", "chapter_en", "classification",
            "kitab_title_from_marker_ar",
        ])
        writer.writeheader()
        writer.writerows(chapter_runs)
    chapter_classification_counts: dict[str, int] = {}
    for run in chapter_runs:
        classification = run["classification"]
        chapter_classification_counts[classification] = chapter_classification_counts.get(classification, 0) + 1

    output = {
        "schema_version": 1,
        "artifact_kind": "reviewable_source_boundary_register",
        "compilation": {
            "id": collection["id"],
            "title_en": collection["title_en"],
            "title_ar": collection["title_ar"],
        },
        "source": {
            "path": "mus test/musannaf-ibn-abi-shaybah.json",
            "sha256": sha256_file(source_path),
            "database_path": "dist-db/silsilah.db",
            "database_sha256": sha256_file(database_path),
        },
        "method": {
            "boundary_ids": "The 41 ordered candidate starts were checked against the raw JSON, their numbered كتاب markers, and compilation 1 in the master SQLite database.",
            "marker": "The exact numbered source marker is retained. It must occur within the first 2,400 characters of the report, and the report's full Arabic text must match SQLite after whitespace-only normalization.",
            "limitations": [
                "The excerpt confirms the numbered Kitab marker at the selected report but does not establish a normalized or canonical Kitab title beyond the exact source wording.",
                "English Kitab titles are intentionally not supplied or inferred from chapter translations.",
                "This register does not assign Babs; chapter-to-Bab classification is a separate audit.",
            ],
        },
        "chapter_label_audit": {
            "run_count": len(chapter_runs),
            "classification_counts": dict(sorted(chapter_classification_counts.items())),
            "runs_file": str(runs_output),
            "method": "Consecutive reports with exactly equal Arabic and English chapter labels are grouped into source-order occurrences. Arabic is normalized only for comparing a label with the numbered Kitab marker or the generic باب label; stored source labels remain unchanged.",
            "limitations": [
                "A source_chapter_label_candidate is not by itself proof that the source edition printed a Bāb heading at that exact point.",
                "A Kitab heading reused as a chapter label is flagged for unassigned-Bāb review; the audit does not silently create a Bāb.",
                "Generic باب labels are retained exactly and are not given invented descriptive titles.",
            ],
        },
        "boundaries": boundaries,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(output_path),
        "boundary_count": len(boundaries),
        "report_count": sum(item["report_count"] for item in boundaries),
        "all_explicit": all(item["boundary_status"] == "explicit_source_marker" for item in boundaries),
        "chapter_run_count": len(chapter_runs),
        "chapter_classification_counts": chapter_classification_counts,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"boundary audit failed: {error}", file=sys.stderr)
        raise
