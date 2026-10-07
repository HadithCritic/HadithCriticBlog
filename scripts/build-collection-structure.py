#!/usr/bin/env python3
"""Build collection -> kitab -> chapter structure from the Ifta' Sunnah platform.

The corpus is the Ifta' Sunnah export, which kept each narration's bab heading
but dropped the platform's table of contents. scripts/fetch-ifta-toc.mjs saves
that table (data/ifta-toc/<platform book id>.json). Its node ids share one
sequence with the narrations' mainIds, which are the corpus ids: a kitab node,
a bab node, that bab's narrations, the next bab. So a narration belongs to the
nearest kitab node at or before its id, and to the nearest bab node within it.
Nothing is matched or inferred.

Titles: the Arabic kitab and bab titles are the platform's. A chapter's English
title is the corpus's English for that bab heading (the same machine rendering
the narration pages show). A kitab's English title comes from
data/kitab-titles-en.json when it has one; otherwise there is none.

Output: src/data/collection-structure/<slug>.json, read by the kitab pages at
build time; public/data/collection-structure/<slug>.json, the kitab ranges the
record pages fetch; and a summary in
docs/research/hadith/collection-structure.json.

Usage: python scripts/build-collection-structure.py
"""

from __future__ import annotations

import json
import re
import sqlite3
import sys
from bisect import bisect_left, bisect_right
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "dist-db" / "silsilah.db"
TOC_DIR = ROOT / "data" / "ifta-toc"
OUT_DIR = ROOT / "src" / "data" / "collection-structure"
PUBLIC_DIR = ROOT / "public" / "data" / "collection-structure"
REPORT = ROOT / "docs" / "research" / "hadith" / "collection-structure.json"
TITLES_EN = ROOT / "data" / "kitab-titles-en.json"
MARKS = re.compile("[ً-ْٰـ]")


def title_key(title: str) -> str:
    """Vowel marks and spacing only: the hamza seat is kept, since it separates
    kitab al-iman (faith) from kitab al-ayman (oaths)."""
    return re.sub(r"\s+", " ", MARKS.sub("", title or "")).strip()


def norm(title: str) -> str:
    t = MARKS.sub("", title or "")
    t = t.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ى", "ي").replace("ة", "ه")
    return re.sub(r"\s+", " ", t).strip()


def build(toc: dict, db: sqlite3.Connection, books_by_title: dict, titles_en: dict) -> dict:
    book = books_by_title.get(norm(toc["title"] or ""))
    if not book:
        return {"platform_book_id": toc["platformBookId"], "title": toc["title"], "status": "no corpus collection with this title"}
    book_id, slug, title_en, title_ar = book
    records = db.execute(
        "SELECT id, hadith_num, chapter_en, chapter_ar FROM hadith WHERE book_id = ? ORDER BY id", (book_id,)
    ).fetchall()
    ids = [r[0] for r in records]

    groups = sorted(toc["groups"], key=lambda g: g["id"])
    kitab_starts = [g["id"] for g in groups]
    kitabs = []
    unplaced = 0
    for index, group in enumerate(groups):
        lo = group["id"]
        hi = kitab_starts[index + 1] if index + 1 < len(groups) else float("inf")
        rows = records[bisect_right(ids, lo):bisect_left(ids, hi)]
        if not rows:
            continue
        headings = sorted((c for c in group.get("children", []) if not c["leaf"]), key=lambda c: c["id"])
        starts = [c["id"] for c in headings]
        chapters: list[dict] = []
        for rid, _num, ch_en, ch_ar in rows:
            at = bisect_right(starts, rid) - 1
            key = headings[at]["id"] if at >= 0 else f"pre-{group['id']}"
            if not chapters or chapters[-1]["key"] != key:
                chapters.append({
                    "key": key,
                    "title_ar": headings[at]["title"] if at >= 0 else (ch_ar or "").strip(),
                    "title_en": (ch_en or "").strip(),
                    "first": rid, "last": rid, "count": 0,
                })
            chapters[-1]["last"] = rid
            chapters[-1]["count"] += 1
        kitab_ar = group["title"]
        kitabs.append({
            "n": len(kitabs) + 1,
            "toc_id": group["id"],
            "title_ar": kitab_ar,
            "title_en": titles_en.get(title_key(kitab_ar)),
            "first": rows[0][0],
            "last": rows[-1][0],
            "count": len(rows),
            "chapters": [{"n": i + 1, **{k: v for k, v in c.items() if k != "key"}} for i, c in enumerate(chapters)],
        })
    placed = sum(k["count"] for k in kitabs)
    unplaced = len(records) - placed
    # The placement rests on heading nodes and narrations sharing one id
    # sequence, so a heading id that is also a narration id breaks it.
    id_set = set(ids)
    heading_ids = {g["id"] for g in groups} | {c["id"] for g in groups for c in g.get("children", []) if not c["leaf"]}
    collisions = sorted(heading_ids & id_set)

    payload = {
        "schemaVersion": "collection-structure/2.0.0",
        "slug": slug,
        "book_id": book_id,
        "title_en": title_en,
        "title_ar": title_ar,
        "source": {
            "name": "Ifta' Sunnah platform table of contents",
            "url": toc["source"],
            "fetched": toc["fetched"],
            "method": "Each narration is placed under the nearest kitab and bab node at or before its mainId in the platform's table of contents.",
        },
        "kitabs": kitabs,
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{slug}.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    # The record pages only need each kitab's range and titles.
    compact = {"slug": slug, "kitabs": [{k: v for k, v in kitab.items() if k in ("n", "title_ar", "title_en", "first", "last")} for kitab in kitabs]}
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    (PUBLIC_DIR / f"{slug}.json").write_text(json.dumps(compact, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return {"slug": slug, "platform_book_id": toc["platformBookId"], "records": len(records), "placed": placed,
            "unplaced": unplaced, "kitabs": len(kitabs), "chapters": sum(len(k["chapters"]) for k in kitabs),
            "kitabs_without_english": sum(1 for k in kitabs if not k["title_en"]),
            "heading_ids_in_corpus": len(collisions), "heading_id_samples": collisions[:10],
            "status": "built" if not collisions else "built, interleaving broken"}


def build_file(path: Path) -> dict:
    """One collection, in its own process with its own read-only connection."""
    db = sqlite3.connect(f"file:{MASTER.as_posix()}?mode=ro", uri=True)
    books_by_title = {norm(r[3]): r for r in db.execute("SELECT id, slug, title_en, title_ar FROM hadith_book")}
    titles_en_raw = json.loads(TITLES_EN.read_text(encoding="utf-8")) if TITLES_EN.exists() else {}
    titles_en = {title_key(k): v for k, v in titles_en_raw.items() if not k.startswith("_")}
    summary = build(json.loads(path.read_text(encoding="utf-8")), db, books_by_title, titles_en)
    db.close()
    return summary


def main() -> int:
    # Only the parsed collections (<platform book id>.json), not manifest.json.
    paths = sorted((p for p in TOC_DIR.glob("*.json") if p.stem.isdigit()), key=lambda p: int(p.stem))
    with ProcessPoolExecutor() as pool:
        summaries = list(pool.map(build_file, paths))
    report = {}
    for path, summary in zip(paths, summaries):
        report[summary.get("slug", path.stem)] = summary
        print(json.dumps(summary, ensure_ascii=False))
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
