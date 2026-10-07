#!/usr/bin/env python3
"""Split each narration's Arabic text into lead, narration and editor's notes.

The Ifta' Sunnah export flattened each record into one string: the edition's
headings and front matter before the narration (kitab and bab titles, a
basmala, the book's own transmission frame), the narration, and after it the
editor's footnotes comparing printings ("كذا في طبعة ..."). Nothing is edited
here. Each record gets two offsets into its unchanged text_ar, so the three
parts are slices of the original and always rejoin to it exactly:

    text_ar[:lead_end]               lead: headings and front matter
    text_ar[lead_end:notes_start]    the narration, with the compiler's remarks
    text_ar[notes_start:]            editor's notes

The printed page comes from the [volume/page] markers, which mark the start of
a page. A narration's first page is the last marker before it begins, in its
own record or carried forward from earlier records of the same collection;
its last page is the last marker inside it.

Fail safe: a record is split only where the evidence is clear. A narration
that cannot be anchored keeps its whole text as narration, and a tail that
looks like it holds another narration is not treated as notes. Each such case
carries a flag and is listed in the report.

Output: table hadith_text_parts in the master database (rows replaced per
collection), and docs/research/hadith/text-parts/<slug>.json with coverage and
a sample for review. Offsets are UTF-16 code units, which equal Python code
points here because no record holds a character outside the BMP (checked).

Usage: python scripts/split-hadith-text.py [--book <slug or id> ...] [--order size]
"""

from __future__ import annotations

import argparse
import json
import random
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "dist-db" / "silsilah.db"
REPORT_DIR = ROOT / "docs" / "research" / "hadith" / "text-parts"

PAGE = re.compile(r"\[(\d+)/(\d+)\]")
# "12 - " as the edition numbers a narration (or a kitab or bab).
# Sub-numbered forms count as their main number: "18 / 2 - " and "794 (م) - ".
# Abu Ya'la's edition adds a bracketed second number: "1 - ( 140 ) - ",
# "1444 مكرر - ( 4199 ) مكرر - ", "68 - ( 1835 - مكرر ) - ".
NUMBER = re.compile(
    r"(?:^|(?<=\s))(\d+)(?:\s*/\s*\d+|\s*\(م\s*\d*\)|\s*\[مكرر\]|\s*مكرر)?\s*[-–]\s"
    r"(?:\s*\(\s*(\d+)(?:\s*\(م\))?(?:\s*-?\s*مكرر)?\s*\)?\s*(?:مكرر\s*)?[-–]\s)?"
)
# How a narration opens once its number is past: a transmission formula,
# possibly bracketed as al-Bayhaqi's edition prints it.
OPENER = re.compile(
    # Al-Bayhaqi opens with "( ورواه )", "( ح ) وأخبرنا", "( وفيما أجاز لي )".
    # Al-Hakim frames narrations ("وأما حديث فلان فحدثناه", "وله شاهد"), and
    # Ibn Hajar's Matalib cites the source compiler first: "مسدد : حدثنا".
    r"(?:[\[(\-–:\s]*(?:و)?(?:قال )?[ء-ي]+(?: [ء-ي]+){0,2}\s*:\s*(?=(?:حدثنا|أخبرنا|ثنا|أنا|حدثني|أخبرني)\b))?"
    r"[\[(\-–:\s]*(?:ح\s*\)\s*\(?\s*)?(?:و|ف)?(?:من ذلك )?(?:كما |ما )?(?:قد )?(?:كذلك )?(?:أما حديث|أما الحديث|أما الأثر|رواه|روى|روينا|فيما أجاز|منهم|منها ما|له شاهد|شاهده|لهذا الحديث|روي|مالك|عبد الرزاق|أخبرنيه|سعيد|أبنا|وذكر|حدثنا|حدثني|حدثناه|حدثنيه|أخبرنا|أخبرني|أخبرناه|أنبأنا|أنبأني|أنبأ|أنا|ثنا|نا|سمعت|حدثت|قرأت|قرئ|بلغني|قال|قالت|عن|وعن|أن|وبه|وبإسناده|وبالإسناد|بالإسناد|وبهذا)\b"
)
# Stricter, for the review flags: a narration opens with a transmission
# formula, not with "أن" or "قال" as an editor's numbered list can.
TRANSMISSION = re.compile(r"[\[(\-–:\s]*(?:و|ف)?(?:حدثنا|حدثني|حدثناه|أخبرنا|أخبرني|أخبرناه|أنبأنا|أنبأ|ثنا|أنا)\b")
# Some editions print the number with no dash ("77 حدثنا", "231 م حدثنا"); a
# bare number counts only when a transmission formula follows it directly.
BARE_NUMBER = re.compile(r"(?:^|(?<=\s))(\d+)(?:\s*/\s*\d+|\s*م)?\s+(?=" + OPENER.pattern + ")")
# Abu Dawud's edition sometimes prints only the dash ("- حدثنا"). Used only
# when a record has no number at all, and only before a strict formula,
# because an isnad also uses dashes for asides ("- يعني ابن ... -").
DASH_ONLY = re.compile(r"(?:^|(?<=\s))()[-–]\s(?=" + TRANSMISSION.pattern + ")")
# A heading printed straight after a number, before the narration proper.
# It may not run past another number or a transmission formula.
HEADING_AFTER_NUMBER = re.compile(
    r"(?:باب|كتاب|ذكر|جماع|أبواب)\b(?:(?!\d+\s*[-–]\s|حدثنا|أخبرنا|حدثني|أخبرني)[^.]){0,400}?"
    # Ends at a full stop, or (al-Bayhaqi) right before his bracketed "( أخبرنا )".
    r"(?:\s\.\s+|\s+(?=\(\s*و?(?:أخبرنا|حدثنا|أخبرني|حدثني|أنبأنا|أنبأ)\s*\)))"
)
# Vocabulary of a modern editor, which no classical compiler writes.
EDITORIAL = re.compile(
    r"طبعة|الطبعة|طبعتي|المحقق|محقق|المعقوفين|المعقوفتين|النسخ الخطية|النسخة الخطية|نسختي|المطبوع|والمثبت|المثبت من"
)


TRAILING = set("!؟.»\"”’)] ، ")


LETTER = re.compile(r"[ء-ي]")
LEADING_APPARATUS = re.compile(r"(?:\(\s*\d+\s*\)|\[\d+/\d+\])\s*")


def has_heading(lead: str) -> bool:
    """A lead counts as headings only if it holds words, not just page markers."""
    return bool(re.search(r"[ء-ي]", PAGE.sub("", lead)))


def sentence_starts(text: str, lo: int) -> list[int]:
    """Positions after lo where a sentence begins (after ' . ' as the edition punctuates)."""
    starts = []
    for m in re.finditer(r"[.؟!]\s+", text):
        p = m.end()
        # Closing punctuation, quotation marks, the edition's cross-reference
        # number "( 18770 )" and a page marker all finish the sentence before.
        while True:
            while p < len(text) and text[p] in TRAILING:
                p += 1
            closing = LEADING_APPARATUS.match(text, p)
            if not closing:
                break
            p = closing.end()
        if p > lo:
            starts.append(p)
    return starts


def narration_start(text: str, num: str, matn: str) -> tuple[int, str]:
    """Offset where the narration begins, and the basis for it.

    The matn bounds the search: the narration's number comes before it. A
    heading can quote the same words (a verse the narration explains), so
    when the first occurrence leaves no opening narration before it, the
    last occurrence is tried, and then the whole text."""
    limits = []
    if len(matn) >= 12:
        first, last = text.find(matn[:25]), text.rfind(matn[:25])
        limits = [x for x in dict.fromkeys((first, last)) if x >= 0]
    for limit in limits + [len(text)]:
        found = _start_before(text, num, limit)
        if found[1] not in ("no-number", "unanchored"):
            break
    # The matn belongs to the narration. If it occurs only before the chosen
    # start, the edition's numbering and the matn disagree: keep it whole.
    if limits and matn[:25] not in text[found[0]:]:
        return 0, "matn-before-number"
    return found


def _start_before(text: str, num: str, limit: int) -> tuple[int, str]:
    markers = sorted(
        (m for pattern in (NUMBER, BARE_NUMBER) for m in pattern.finditer(text) if m.start() <= limit),
        key=lambda m: m.start(),
    )
    if not markers:
        dash = DASH_ONLY.search(text, 0, limit + 1)
        # Only a dash with no transmission before it: otherwise it closes an
        # aside inside the isnad ("حدثنا يزيد - هو ابن هارون - ثنا").
        if dash and not re.search(r"حدثنا|أخبرنا|ثنا|أنا|حدثني|أخبرني|\sعن\s", text[:dash.start()]):
            return dash.start(), "dash"
        return 0, "no-number"

    def opens(m: re.Match) -> int | None:
        """Where the narration proper begins after this marker, or None."""
        rest = text[m.end():]
        if OPENER.match(rest):
            return m.start()
        heading = HEADING_AFTER_NUMBER.match(rest)
        if heading and OPENER.match(rest[heading.end():]):
            return m.end() + heading.end()
        return None

    # The record's number may be the outer or the bracketed one ("1 - ( 140 ) -").
    numbered = [m for m in markers if num and num in (g for g in m.groups() if g)]
    for group, basis in ((numbered, "number"), (markers, "marker")):
        for m in reversed(group):
            at = opens(m)
            if at is not None:
                return at, basis
    if numbered:
        return numbered[-1].start(), "number-unopened"
    return 0, "unanchored"


# The formulas an editor's note opens with. After a comma only these count.
NOTE_FORMULA = re.compile(
    r"(?:كذا في (?:ال)?طبع|ما بين المعقوف|الفراغ الذي بين المعقوف|في (?:ال)?طبعة|سقطت? من (?:ال)?طبعة|"
    r"تصحفت في طبعة|زاد بعده في طبعة|قال محقق|أشار المحقق)"
)


def note_candidates(text: str, lo: int, matn_end: int | None) -> list[int]:
    """Where a note could begin: a sentence whose opening words are an editor's,
    or a clause after a comma that opens with an editor's formula. After the
    matn, an unmistakable formula ("كذا في طبعة") also starts one mid-sentence,
    since the platform sometimes appends a note with no punctuation."""
    found = []
    for p in sentence_starts(text, lo):
        end = re.search(r"[.؟!](?:\s|$)", text[p:])
        opening = text[p:p + min(60, end.start() if end else 60)]
        if EDITORIAL.search(opening):
            found.append(p)
    for m in re.finditer(r"،\s+", text):
        p = m.end()
        if p > lo and NOTE_FORMULA.match(text, p):
            found.append(p)
    if matn_end is not None:
        for m in re.finditer(r"\s(?=" + NOTE_FORMULA.pattern + ")", text):
            if m.end() >= matn_end:
                found.append(m.end())
    return sorted(found)


def notes_start(text: str, lo: int, matn_at: int | None, matn_end: int | None) -> tuple[int, str | None]:
    """Offset where the editor's notes begin (len(text) when there are none).

    A note never starts before the matn does. The platform appends the
    editor's notes after the text, so once they have begun, a numbered
    narration after them is one the editor quotes from another printing
    ("في طبعة دار الصميعي زيادة حديثين ... هما : 121 - حدثنا"). Such records
    are flagged for review."""
    floor = max(lo, matn_at if matn_at is not None else lo)
    for p in note_candidates(text, floor, matn_end):
        if p <= floor:
            continue
        quoted = any(TRANSMISSION.match(text, m.end()) for m in NUMBER.finditer(text, p))
        return p, ("notes-quote-narration" if quoted else None)
    return len(text), None


def page_at(markers: list[tuple[int, str]], pos: int, carried: str | None) -> str | None:
    current = carried
    for at, label in markers:
        if at >= pos:
            break
        current = label
    return current


def split_book(db: sqlite3.Connection, book_id: int, slug: str, sample_size: int = 8) -> dict:
    rows = db.execute(
        "SELECT id, hadith_num, text_ar, matn_ar FROM hadith WHERE book_id = ? ORDER BY id", (book_id,)
    ).fetchall()
    out = []
    stats = {"records": len(rows), "lead": 0, "notes": 0, "page_known": 0, "flags": {}}
    flagged: dict[str, list[int]] = {}
    carried: str | None = None
    last_page: tuple[int, int] | None = None
    for rid, num, text, matn in rows:
        text = text or ""
        num = str(num or "").strip("() ")
        flags = []
        lead_end, basis = narration_start(text, num, (matn or "").strip())
        if basis in ("no-number", "unanchored", "number-unopened"):
            flags.append(basis)
        anchor = (matn or "").strip()[:25]
        matn_at = text.find(anchor, lead_end) if len(anchor) >= 12 else -1
        matn_at = matn_at if matn_at >= 0 else None
        n_start, note_flag = notes_start(
            text, lead_end, matn_at, matn_at + len(anchor) if matn_at is not None else None
        )
        if note_flag:
            flags.append(note_flag)
        markers = [(m.start(), f"{m.group(1)}/{m.group(2)}") for m in PAGE.finditer(text)]
        for _, label in markers:
            v, p = map(int, label.split("/"))
            if last_page and (v, p) < last_page:
                flags.append("page-goes-back")
            last_page = (v, p)
        p_start = page_at(markers, lead_end + 1, carried)
        # The last page is where the narration's last letter falls: a page
        # marker right at its end opens a page the narration does not reach.
        letters = [m.start() for m in LETTER.finditer(text, lead_end, n_start)]
        p_end = page_at(markers, letters[-1] if letters else n_start, carried) or p_start
        if markers:
            carried = markers[-1][1]
        # Any further numbered narration inside this record's own narration.
        body = text[lead_end:n_start]
        later = [m for m in NUMBER.finditer(body) if m.start() > 0 and TRANSMISSION.match(body, m.end())]
        if later:
            flags.append("holds-another-narration")
        stats["lead"] += has_heading(text[:lead_end])
        stats["notes"] += n_start < len(text)
        stats["page_known"] += p_start is not None
        for f in flags:
            stats["flags"][f] = stats["flags"].get(f, 0) + 1
            flagged.setdefault(f, []).append(rid)
        out.append((rid, lead_end, n_start, p_start, p_end, ",".join(sorted(set(flags))) or None))

    db.execute("DELETE FROM hadith_text_parts WHERE hadith_id IN (SELECT id FROM hadith WHERE book_id = ?)", (book_id,))
    db.executemany(
        "INSERT INTO hadith_text_parts (hadith_id, lead_end, notes_start, page_start, page_end, flags) VALUES (?, ?, ?, ?, ?, ?)",
        out,
    )

    by_id = {r[0]: r for r in rows}
    rng = random.Random(book_id)
    parts = {r[0]: r for r in out}

    def show(rid: int) -> dict:
        _, lead_end, n_start, p_start, p_end, flags = parts[rid]
        text = by_id[rid][2] or ""
        return {
            "id": rid,
            "lead": text[:lead_end][-220:],
            "narration_opens": text[lead_end:lead_end + 120],
            "narration_closes": text[max(lead_end, n_start - 120):n_start],
            "notes": text[n_start:][:260],
            "pages": [p_start, p_end],
            "flags": flags,
        }

    with_lead = [r[0] for r in out if has_heading((by_id[r[0]][2] or "")[:r[1]])]
    with_notes = [r[0] for r in out if r[2] < len(by_id[r[0]][2] or "")]
    report = {
        "slug": slug,
        "book_id": book_id,
        **{k: v for k, v in stats.items() if k != "flags"},
        "flags": stats["flags"],
        "flag_samples": {f: ids[:12] for f, ids in flagged.items()},
        "sample_lead": [show(i) for i in rng.sample(with_lead, min(sample_size, len(with_lead)))],
        "sample_notes": [show(i) for i in rng.sample(with_notes, min(sample_size, len(with_notes)))],
        "sample_any": [show(i) for i in rng.sample([r[0] for r in out], min(sample_size, len(out)))],
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / f"{slug}.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", action="append", default=[])
    args = parser.parse_args()
    db = sqlite3.connect(MASTER)
    db.execute(
        """CREATE TABLE IF NOT EXISTS hadith_text_parts (
             hadith_id INTEGER PRIMARY KEY REFERENCES hadith(id),
             lead_end INTEGER NOT NULL,
             notes_start INTEGER NOT NULL,
             page_start TEXT,
             page_end TEXT,
             flags TEXT
           )"""
    )
    books = db.execute(
        "SELECT b.id, b.slug, count(h.id) AS n FROM hadith_book b JOIN hadith h ON h.book_id = b.id GROUP BY b.id ORDER BY n"
    ).fetchall()
    wanted = set(args.book)
    summary = []
    for book_id, slug, n in books:
        if wanted and slug not in wanted and str(book_id) not in wanted:
            continue
        r = split_book(db, book_id, slug)
        db.commit()
        row = {k: r[k] for k in ("slug", "records", "lead", "notes", "page_known", "flags")}
        summary.append(row)
        print(json.dumps(row, ensure_ascii=False))
    db.close()
    if not wanted:
        # A full run records coverage for every collection, smallest first.
        totals = {k: sum(r[k] for r in summary) for k in ("records", "lead", "notes", "page_known")}
        (REPORT_DIR / "summary.json").write_text(
            json.dumps({"collections": len(summary), "totals": totals, "by_collection": summary}, ensure_ascii=False, indent=1),
            encoding="utf-8",
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
