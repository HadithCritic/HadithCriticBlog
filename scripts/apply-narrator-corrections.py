#!/usr/bin/env python3
"""Apply data/narrator-corrections.json to dist-db/silsilah.db in place.

The corrections file is the record of each English display-name fix and why it
was made. A full rebuild (ifta.db -> build-narrators -> seed -> build-static-db)
picks them up; this script applies them to an existing master database without
that rebuild, so a single fix does not require regenerating every table.

For each corrected narrator it rewrites `narrator.name_en`, the English part of
`narrator.search_text`, and the matching row of the contentless `narrator_fts`
index (deleted with its old text, reinserted with the new). It is idempotent:
a row that already carries the corrected name is left alone.

Run `npm run build:corpus` afterwards to cut a corpus release that carries it.
"""

import json
import sqlite3
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "dist-db" / "silsilah.db"
CORRECTIONS = ROOT / "data" / "narrator-corrections.json"

# The same folding scripts/build-static-db.py applies when it fills narrator_fts.
LETTER_FOLDS = [
    ("آ", "ا"), ("أ", "ا"), ("إ", "ا"), ("ٱ", "ا"),
    ("ة", "ه"), ("ى", "ي"), ("ؤ", "و"), ("ئ", "ي"),
    ("ء", ""), ("ـ", ""),
]
INVISIBLES = [
    "​", "‌", "‍", "‎", "‏",
    "‪", "‫", "‬", "‭", "‮",
    "⁠", "﻿",
]


def fts_text(search_text: str) -> str:
    text = search_text or ""
    for frm, to in LETTER_FOLDS:
        text = text.replace(frm, to)
    for ch in INVISIBLES:
        text = text.replace(ch, "")
    return text


def ascii_fold(name: str) -> str:
    """The plain form search_text carries beside the transliterated one."""
    decomposed = unicodedata.normalize("NFD", name)
    stripped = "".join(c for c in decomposed if unicodedata.category(c) != "Mn")
    return "".join(c for c in stripped if c not in "ʿʾ'’‘`")


def english_keys(name: str) -> str:
    lower = name.lower()
    return f"{lower} {ascii_fold(lower)}"


def rename_in_payloads(conn: sqlite3.Connection, corrections: dict) -> int:
    """Dossier payloads repeat names: a narrator's own nameEn and the names of
    their teachers and students. Each corrected id is renamed wherever it appears,
    matched by id so a different person who shares the old name is untouched."""
    renames = {int(k): (v["was"], v["now"]) for k, v in corrections.items()}
    likes = " OR ".join("payload LIKE ?" for _ in renames)
    rows = conn.execute(
        f"SELECT id, payload FROM narrator_detail WHERE {likes}",
        [f"%{was}%" for was, _ in renames.values()],
    ).fetchall()
    updated = 0
    for detail_id, payload in rows:
        data = json.loads(payload)
        touched = False
        if detail_id in renames and data.get("nameEn") == renames[detail_id][0]:
            data["nameEn"] = renames[detail_id][1]
            touched = True
        for key in ("teachers", "students"):
            for person in data.get(key) or []:
                pair = renames.get(person.get("id"))
                if pair and person.get("name") == pair[0]:
                    person["name"] = pair[1]
                    touched = True
        if touched:
            conn.execute(
                "UPDATE narrator_detail SET payload = ? WHERE id = ?",
                (json.dumps(data, ensure_ascii=False, separators=(",", ":")), detail_id),
            )
            updated += 1
    return updated


def rename_in_hadith_english(conn: sqlite3.Connection, corrections: dict) -> int:
    """The machine English of a report spells its chain with register names, so
    a wrong register name is repeated verbatim in text_en (and occasionally
    matn_en). Only the exact full display name is replaced, which no other
    person carries, and each touched row is re-indexed in hadith_fts with the
    same fold the index was built with (src/lib/arabic-fold-sql.ts)."""
    updated = 0
    for entry in corrections.values():
        was, now = entry["was"], entry["now"]
        rows = conn.execute(
            "SELECT id, text_ar, matn_ar, text_en, matn_en, chapter_en FROM hadith"
            " WHERE instr(text_en, ?) > 0 OR instr(matn_en, ?) > 0",
            (was, was),
        ).fetchall()
        for hadith_id, text_ar, matn_ar, text_en, matn_en, chapter_en in rows:
            new_text = (text_en or "").replace(was, now)
            new_matn = (matn_en or "").replace(was, now)
            ar_text, ar_matn = fts_text(text_ar or ""), fts_text(matn_ar or "")
            conn.execute(
                "INSERT INTO hadith_fts (hadith_fts, rowid, ar_text, ar_matn, en_text, en_matn, chapter_en)"
                " VALUES ('delete', ?, ?, ?, ?, ?, ?)",
                (hadith_id, ar_text, ar_matn, text_en or "", matn_en or "", chapter_en or ""),
            )
            conn.execute(
                "INSERT INTO hadith_fts (rowid, ar_text, ar_matn, en_text, en_matn, chapter_en)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (hadith_id, ar_text, ar_matn, new_text, new_matn, chapter_en or ""),
            )
            conn.execute(
                "UPDATE hadith SET text_en = ?, matn_en = ? WHERE id = ?",
                (new_text if text_en is not None else None, new_matn if matn_en is not None else None, hadith_id),
            )
            updated += 1
    return updated


def main() -> int:
    if not DB_PATH.exists():
        print(f"No master database at {DB_PATH}", file=sys.stderr)
        return 1
    corrections = json.loads(CORRECTIONS.read_text(encoding="utf-8")).get("displayNameEn", {})
    conn = sqlite3.connect(str(DB_PATH))
    changed = 0
    for raw_id, entry in corrections.items():
        narrator_id = int(raw_id)
        row = conn.execute(
            "SELECT name_en, search_text, unnamed FROM narrator WHERE id = ?", (narrator_id,)
        ).fetchone()
        if row is None:
            print(f"  #{narrator_id}: not in the database, skipped")
            continue
        name_en, search_text, unnamed = row
        if name_en == entry["now"]:
            continue
        if name_en != entry["was"]:
            print(f"  #{narrator_id}: name is {name_en!r}, expected {entry['was']!r}; skipped", file=sys.stderr)
            continue
        old_keys, new_keys = english_keys(entry["was"]), english_keys(entry["now"])
        new_search = (search_text or "").replace(old_keys, new_keys, 1)
        if new_search == search_text:
            new_search = f"{new_keys} {search_text or ''}".strip()
        conn.execute(
            "UPDATE narrator SET name_en = ?, search_text = ? WHERE id = ?",
            (entry["now"], new_search, narrator_id),
        )
        if not unnamed:
            conn.execute(
                "INSERT INTO narrator_fts (narrator_fts, rowid, text) VALUES ('delete', ?, ?)",
                (narrator_id, fts_text(search_text)),
            )
            conn.execute(
                "INSERT INTO narrator_fts (rowid, text) VALUES (?, ?)",
                (narrator_id, fts_text(new_search)),
            )
        print(f"  #{narrator_id}: {entry['was']} -> {entry['now']}")
        changed += 1
    changed_payloads = rename_in_payloads(conn, corrections)
    changed_reports = rename_in_hadith_english(conn, corrections)
    conn.commit()
    print(f"{changed_payloads} dossier payload(s) updated")
    print(f"{changed_reports} report English rendering(s) updated and re-indexed")
    conn.close()
    print(f"{changed} correction(s) applied to {DB_PATH.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
