#!/usr/bin/env python3
"""Parse Marijn van Putten's translation of al-Dani's at-Taysir into statements.

Source: Marijn van Putten, al-Dani's al-Taysir fi al-Qira'at al-Sab': A
Translation with Linguistic Commentary (Open Book Publishers, 2026), CC BY-NC
4.0. It translates Otto Pretzl's 1930 edition, the edition Shamela book 5527
reproduces, and prints Pretzl's page breaks inline as "(P:72)", each marking
the END of that page. That is what lets a statement be tied to the Shamela page
the project already cites.

Output, one record per statement (a verse group in the farsh, a section in the
usul), each with its Pretzl page or pages, the text with footnote references,
and the footnotes:

  src/data/qiraat/van-putten-taysir.json

The English is the translator's, reproduced as printed. Only line-end
hyphenation is undone, and the page markers are lifted into a field. It is a
translation and a check, never claim evidence: claims keep their Arabic span.

Usage: python scripts/quran/qiraat/parse-van-putten.py [path-to-pdf]
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PDF = Path("C:/Users/Jonathan/Desktop/qiraat_sources/obp.0475.pdf")
OUT = ROOT / "src" / "data" / "qiraat" / "van-putten-taysir.json"

BODY_MIN = 10.5          # body text is 11 pt
FOOTNOTE_SIZE = 10.0     # footnote text is 10 pt, its number 6 pt
SUPERSCRIPT_MAX = 7.0    # footnote references in the body are 6.5 pt
HEADER_Y = 60            # running heads sit at y ~ 34

PAGE_MARK = re.compile(r"\(P:(\d+)\)")
VERSE_START = re.compile(r"^(\d+):\s*")
FARSH_HEADING = re.compile(r"^F\.(\d+)\.(?:\s|–|-)")
YA_HEADING = re.compile(r"^F\.\d+\.\d+\.\s*\[(?P<kind>Yāʾs?|Removed yāʾs?) of Q(?P<sura>\d+)\]")
USUL_HEADING = re.compile(r"^U\.(\d+(?:\.\d+)*)\.\s+(.*)")
CLITIC = re.compile(r"(?:^|[\s(])(?:al|wa|fa|bi|li|ka|la|ʾa|a[ṣšdnrstḏḍẓṭzṯ])-$")


@dataclass
class Statement:
    section: str
    heading: str
    sura: int | None
    verse: int | None
    kind: str
    pages: list[int] = field(default_factory=list)
    lines: list[str] = field(default_factory=list)
    notes: list[int] = field(default_factory=list)
    pdf_page: int = 0


def join_lines(lines: list[str]) -> str:
    text = ""
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if text.endswith("-") and not CLITIC.search(text) and line[:1].islower():
            text = text[:-1] + line           # a word broken across lines
        elif text.endswith("-"):
            text += line                      # a prefix such as al- before its word
        else:
            text = f"{text} {line}" if text else line
    return re.sub(r"\s+", " ", text).strip()


def line_text(spans: list[dict]) -> tuple[str, list[int]]:
    """Body spans, with 6.5 pt footnote references turned into [n]."""
    out, refs = [], []
    for span in spans:
        if span["size"] <= SUPERSCRIPT_MAX:
            if PAGE_MARK.search(span["text"]):
                out.append(span["text"])  # Pretzl page breaks are also set small
                continue
            number = span["text"].strip()
            if number.isdigit():
                out.append(f"[{number}]")
                refs.append(int(number))
            continue
        out.append(span["text"])
    return "".join(out), refs


def parse(pdf_path: Path) -> dict:
    doc = fitz.open(str(pdf_path))
    toc = doc.get_toc()
    start = next(p for _, title, p in toc if title.startswith("U. Preamble")) - 1
    end = doc.page_count

    statements: list[Statement] = []
    footnotes: dict[int, str] = {}
    current: Statement | None = None
    section, heading, sura, kind = "usul", "", None, "statement"
    page = None  # the Pretzl page the running text is on

    def open_statement(verse: int | None, pdf_page: int) -> Statement:
        st = Statement(section, heading, sura, verse, kind, pdf_page=pdf_page)
        if page is not None:
            st.pages.append(page)
        statements.append(st)
        return st

    for index in range(start, end):
        blocks = doc[index].get_text("dict")["blocks"]
        last_note: int | None = None
        for block in blocks:
            for raw in block.get("lines", []):
                spans = raw["spans"]
                visible = [s for s in spans if s["text"].strip()]
                if not visible or raw["bbox"][1] < HEADER_Y:
                    continue
                size = max(s["size"] for s in visible)
                if size < BODY_MIN:
                    # A footnote line: a 6 pt number opens one, 10 pt text continues it.
                    first = visible[0]
                    if first["size"] <= SUPERSCRIPT_MAX and first["text"].strip().isdigit():
                        last_note = int(first["text"].strip())
                        footnotes[last_note] = "".join(s["text"] for s in spans[spans.index(first) + 1:]).strip()
                    elif last_note is not None and abs(size - FOOTNOTE_SIZE) < 0.6:
                        footnotes[last_note] = join_lines([footnotes[last_note], "".join(s["text"] for s in spans)])
                    continue

                text, refs = line_text(spans)
                bold = all("Bold" in s["font"] for s in visible)
                stripped = text.strip()

                if bold or FARSH_HEADING.match(stripped) or USUL_HEADING.match(stripped) or YA_HEADING.match(stripped):
                    ya = YA_HEADING.match(stripped)
                    farsh = FARSH_HEADING.match(stripped)
                    usul = USUL_HEADING.match(stripped)
                    if ya:
                        section, kind, sura = "farsh", "ya-list", int(ya.group("sura"))
                        heading, current = stripped, None
                        continue
                    if farsh:
                        section, kind = "farsh", "statement"
                        sura = int(farsh.group(1)) if int(farsh.group(1)) <= 114 else sura
                        heading, current = stripped, None
                        continue
                    if usul:
                        section, kind, sura = "usul", "statement", None
                        heading, current = stripped, None
                        continue

                verse_match = VERSE_START.match(stripped) if section == "farsh" else None
                if verse_match:
                    current = open_statement(int(verse_match.group(1)), index + 1)
                    stripped = stripped[verse_match.end():]
                elif current is None:
                    current = open_statement(None, index + 1)

                # Page breaks inside the line: the text before "(P:n)" is page n,
                # the text after it is page n + 1.
                parts = PAGE_MARK.split(stripped)
                current.lines.append(parts[0])
                for i in range(1, len(parts), 2):
                    ended = int(parts[i])
                    if ended not in current.pages:
                        current.pages.append(ended)
                    page = ended + 1
                    tail = parts[i + 1]
                    if tail.strip():
                        current.lines.append(tail)
                        if page not in current.pages:
                            current.pages.append(page)
                current.notes.extend(refs)

    records = []
    for n, st in enumerate(statements):
        text = join_lines(st.lines)
        if not text:
            continue
        records.append({
            "id": f"vp-{n:05d}",
            "section": st.section,
            "heading": st.heading,
            "sura": st.sura,
            "verse": st.verse,
            "kind": st.kind,
            "pretzl_pages": sorted(set(p for p in st.pages if p is not None)),
            "text": text,
            "footnotes": [{"n": k, "text": footnotes[k]} for k in dict.fromkeys(st.notes) if k in footnotes],
            "pdf_page": st.pdf_page,
        })
    return records


def main() -> int:
    pdf = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    records = parse(pdf)
    payload = {
        "schemaVersion": "van-putten-taysir/1.0.0",
        "generator": "scripts/quran/qiraat/parse-van-putten.py",
        "source": {
            "author": "Marijn van Putten",
            "title": "al-Dānī’s al-Taysīr fī al-Qirāʾāt al-Sabʿ: A Translation with Linguistic Commentary",
            "publisher": "Open Book Publishers",
            "year": 2026,
            "license": "CC BY-NC 4.0",
            "url": "https://www.openbookpublishers.com",
            "edition_translated": "Otto Pretzl (ed.), Das Lehrbuch der sieben Koranlesungen, 1930",
            "page_note": "pretzl_pages are Pretzl's pages, the pagination Shamela book 5527 reproduces.",
        },
        "statements": records,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    farsh = [r for r in records if r["section"] == "farsh"]
    print(f"{len(records)} statements ({len(farsh)} farsh, {len(records) - len(farsh)} usul) -> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
