#!/usr/bin/env python3
"""Segment Ibn Mujāhid's Kitāb as-Sabʿa (Shamela 5530) into sura sections and
numbered items.

The book opens each sura with a heading and then lists numbered items of the
form "N - ikhtalafū fī qawlihi {form} verse ...". This script finds the
headings and items, records where each starts (volume and page label), the
first quoted form, and the verse number that follows it when the book gives
one. It reads the page cache written by cache-shamela-pages.py and changes no
text: normalization here only removes Arabic diacritics and tatweel to make
patterns matchable.

The book's own numbering is imperfect (it skips numbers and contains stray
digits), so item numbers are accepted when they move forward by one to three.
Anything else is reported as a stray candidate instead of silently ending the
section, and every gap is listed so a reader can check it against the page.

    python scripts/quran/qiraat/segment-ibn-mujahid.py [--strict]
"""

from __future__ import annotations

import argparse
import bisect
import json
import re
import sys
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[3]
PAGES = REPO / "scratch" / "quran" / "qiraat" / "pages" / "5530.json"
DEFAULT_OUT = REPO / "scratch" / "quran" / "qiraat" / "ibn-mujahid-items.json"

DIACRITICS = re.compile("[ً-ٰٟـ]")
# Sura headings come in three wordings; ي and ى are both used for "fī".
# A plain mention of a sura inside prose does not qualify: the caller also
# requires an item "1 -" shortly after the heading.
HEADING = re.compile(
    r"(?:ذكر\s+(?:ما\s+اختلفوا\s+فيه\s+من\s+(?:القراءة\s+ف[يى]\s+)?|اختلافهم\s+ف[يى]\s+)"
    r"|القراءة\s+ف[يى]\s+)سورة\s+([^\d{]{1,45})"
)
FATIHA_HEADING = "ذكر اختلاف القراء في فاتحة الكتاب"
ITEM = re.compile(r"(?<!\S)(\d{1,3})\s+[-–]\s+")
FIRST_ITEM_NEARBY = re.compile(r"(?<!\S)1\s+[-–]\s+")
FIRST_FORM = re.compile(r"\{([^{}]+)\}\s*(\d{1,3})?(?![\d-])")
TITLE_STOP = re.compile(r"\s+(?:قال|عليه|عليها|عليهم|جل|صلى|ومعرفة)\b")
MAX_FORWARD_JUMP = 3
NEARBY_WINDOW = 500


def normalize(value: str) -> str:
    return DIACRITICS.sub("", value)


def load_view(path: Path) -> tuple[str, list[int], list[dict[str, Any]]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    pieces: list[str] = []
    starts: list[int] = []
    position = 0
    for page in payload["pages"]:
        starts.append(position)
        chunk = normalize(page["text"]) + " "
        pieces.append(chunk)
        position += len(chunk)
    return "".join(pieces), starts, payload["pages"]


def locate(offset: int, starts: list[int], pages: list[dict[str, Any]]) -> dict[str, str]:
    page = pages[bisect.bisect_right(starts, offset) - 1]
    return {"volume": page["volume"], "page": page["page"]}


def accept_items(section: str) -> tuple[list[re.Match[str]], list[int], list[int]]:
    """Return accepted item matches, the numbers skipped, and stray candidates."""
    accepted: list[re.Match[str]] = []
    skipped: list[int] = []
    strays: list[int] = []
    last = 0
    for match in ITEM.finditer(section):
        number = int(match.group(1))
        if last < number <= last + MAX_FORWARD_JUMP:
            skipped.extend(range(last + 1, number))
            accepted.append(match)
            last = number
        else:
            strays.append(number)
    return accepted, skipped, strays


def find_headings(view: str) -> list[tuple[int, str]]:
    found: list[tuple[int, str]] = []
    fatiha = view.find(FATIHA_HEADING)
    if fatiha >= 0:
        found.append((fatiha, "فاتحة الكتاب"))
    for match in HEADING.finditer(view):
        if not FIRST_ITEM_NEARBY.search(view[match.end():match.end() + NEARBY_WINDOW]):
            continue  # a mention inside prose, not a section start
        title = TITLE_STOP.split(match.group(1).strip())[0]
        found.append((match.start(), title))
    found.sort()
    return found


def segment(view: str, starts: list[int], pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    headings = find_headings(view)
    sections: list[dict[str, Any]] = []
    for index, (offset, title) in enumerate(headings):
        end = headings[index + 1][0] if index + 1 < len(headings) else len(view)
        body = view[offset:end]
        matches, skipped, strays = accept_items(body)
        items = []
        for n, match in enumerate(matches):
            item_end = matches[n + 1].start() if n + 1 < len(matches) else len(body)
            text = body[match.start():item_end]
            form = FIRST_FORM.search(text[:400])
            items.append({
                "number": int(match.group(1)),
                "start": locate(offset + match.start(), starts, pages),
                "first_form": form.group(1) if form else None,
                "verse_number": int(form.group(2)) if form and form.group(2) else None,
                "characters": len(text),
            })
        sections.append({
            "heading": title,
            "start": locate(offset, starts, pages),
            "item_count": len(items),
            "skipped_numbers": skipped,
            "stray_candidates": strays,
            "items": items,
        })
    return sections


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--pages", type=Path, default=PAGES)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--strict", action="store_true",
                        help="exit non-zero if any section has no items")
    args = parser.parse_args()

    if not args.pages.exists():
        raise SystemExit(f"Missing page cache {args.pages}; run cache-shamela-pages.py --ids 5530")
    view, starts, pages = load_view(args.pages)
    sections = segment(view, starts, pages)

    items = [item for section in sections for item in section["items"]]
    empty = [section["heading"] for section in sections if section["item_count"] == 0]
    summary = {
        "sections": len(sections),
        "items": len(items),
        "items_with_quoted_form": sum(1 for item in items if item["first_form"]),
        "items_with_verse_number": sum(1 for item in items if item["verse_number"] is not None),
        "sections_with_skipped_numbers": sum(1 for s in sections if s["skipped_numbers"]),
        "skipped_numbers_total": sum(len(s["skipped_numbers"]) for s in sections),
        "sections_with_stray_candidates": sum(1 for s in sections if s["stray_candidates"]),
        "empty_sections": empty,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps({"book_id": "5530", "summary": summary, "sections": sections},
                   ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False))
    if args.strict and empty:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
