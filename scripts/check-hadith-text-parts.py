#!/usr/bin/env python3
"""Check hadith_text_parts against the text it slices.

Invariants, per record: the offsets lie in the text and in order (so the
three parts rejoin to text_ar exactly); where the matn can be found in the
text, it lies inside the narration part; every notes part uses an editor's
vocabulary, opening with the editor's own words. Exits 1 on any violation
and prints the first few.

Usage: python scripts/check-hadith-text-parts.py [--book <slug> ...]
"""

from __future__ import annotations

import argparse
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "dist-db" / "silsilah.db"
EDITORIAL = re.compile(
    r"طبعة|الطبعة|طبعتي|المحقق|محقق|المعقوفين|المعقوفتين|النسخ الخطية|النسخة الخطية|نسختي|المطبوع|والمثبت|المثبت من"
)
NOTE_FORMULA = re.compile(
    r"(?:كذا في (?:ال)?طبع|ما بين المعقوف|الفراغ الذي بين المعقوف|في (?:ال)?طبعة|سقطت? من (?:ال)?طبعة|"
    r"تصحفت في طبعة|زاد بعده في طبعة|قال محقق|أشار المحقق)"
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", action="append", default=[])
    args = parser.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    db = sqlite3.connect(f"file:{MASTER.as_posix()}?mode=ro", uri=True)
    where = ""
    params: list[str] = []
    if args.book:
        where = f"WHERE b.slug IN ({','.join('?' * len(args.book))})"
        params = args.book
    rows = db.execute(
        f"""SELECT h.id, h.text_ar, h.matn_ar, p.lead_end, p.notes_start
              FROM hadith h JOIN hadith_book b ON b.id = h.book_id
              LEFT JOIN hadith_text_parts p ON p.hadith_id = h.id {where}""",
        params,
    )
    problems: list[str] = []
    checked = 0
    for rid, text, matn, lead_end, notes_start in rows:
        checked += 1
        text = text or ""
        if lead_end is None:
            problems.append(f"{rid}: no parts row")
            continue
        if not 0 <= lead_end <= notes_start <= len(text):
            problems.append(f"{rid}: offsets out of order ({lead_end}, {notes_start}, {len(text)})")
            continue
        if text[:lead_end] + text[lead_end:notes_start] + text[notes_start:] != text:
            problems.append(f"{rid}: parts do not rejoin")
        anchor = (matn or "").strip()[:25]
        if len(anchor) >= 12:
            # A heading can quote the matn's words too; one occurrence must
            # fall inside the narration.
            if anchor in text and anchor not in text[lead_end:notes_start]:
                problems.append(f"{rid}: matn outside the narration (narration {lead_end}-{notes_start})")
        notes = text[notes_start:]
        if notes.strip():
            # A notes part opens with the editor's words; what follows is theirs.
            opening = re.split(r"[.؟!](?:\s|$)", notes.lstrip(), maxsplit=1)[0][:60]
            if not (EDITORIAL.search(opening) or NOTE_FORMULA.match(notes.lstrip())):
                problems.append(f"{rid}: notes do not open with an editor's words: {notes[:80]}")
    print(f"checked {checked} records, {len(problems)} problem(s)")
    for p in problems[:25]:
        print("  " + p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
