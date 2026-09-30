#!/usr/bin/env python3
"""Build the display data for the general rules (Tahbir pp. 181 to 281).

Rules are items of scope "rule": they belong to no verse, so they are filed under
sura 0 by assemble-farsh.py and verified by verify-qiraat-claims.py like any other
claims. This script groups the resolved comparison the same way the sura pages do
(build-display-data.build_feature) and orders the rules by chapter and page.

    python scripts/quran/qiraat/build-rules-data.py
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
QIRAAT_DIR = REPO / "docs" / "research" / "quran-platform" / "qiraat"
OUT = REPO / "src" / "data" / "qiraat" / "rules.json"
SCHEMA = "qiraat-rules/0.1.0"

spec = importlib.util.spec_from_file_location("display_data", HERE / "build-display-data.py")
display = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
spec.loader.exec_module(display)  # type: ignore[union-attr]


def first_page(feature: dict[str, Any]) -> int:
    pages = [int(p) for group in feature["groups"] for claim in group.get("claims", [])
             for p in [claim["page"].replace("pp. ", "p. ").split("p. ")[-1].split(" ")[0]] if p.isdigit()]
    return min(pages) if pages else 10**6


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    verified = json.loads((QIRAAT_DIR / "claims" / "farsh-sura-000.verified.json").read_text(encoding="utf-8"))
    resolved = json.loads((QIRAAT_DIR / "claims" / "farsh-sura-000.resolved.json").read_text(encoding="utf-8"))
    authorities = json.loads((QIRAAT_DIR / "authorities.json").read_text(encoding="utf-8"))
    registry = {b["book_id"]: b for b in json.loads((QIRAAT_DIR / "sources.json").read_text(encoding="utf-8"))["books"]}
    claims = {c["id"]: c for c in verified["claims"]}
    order: list[str] = verified["witness_order"]

    rules = []
    for fid, feature in verified["features"].items():
        built = display.build_feature(fid, feature, resolved, claims, authorities, order, {})
        built["chapter"] = feature.get("chapter") or "بدون باب"
        built["item"] = feature.get("item")
        rules.append(built)
    rules.sort(key=lambda r: (first_page(r), r["id"]))

    chapters: list[dict[str, Any]] = []
    for rule in rules:
        if not chapters or chapters[-1]["title_ar"] != rule["chapter"]:
            chapters.append({"title_ar": rule["chapter"], "rules": []})
        chapters[-1]["rules"].append(rule)

    books = []
    for book_id in order:
        book = registry[book_id]
        cited = [c for c in verified["claims"] if c["witness"]["book_id"] == book_id]
        books.append({
            "book_id": book_id, "mark": book.get("mark", book_id[:2]),
            "short_title": book.get("short_title") or book["book_title"], "title_ar": book["book_title"],
            "author_year": book["author_year"], "reader_set": book["reader_set"], "edition": book["edition"],
            "claim_count": len(cited),
            "pages": sorted({display.page_label(c) for c in cited}),
        })

    data = {
        "schemaVersion": SCHEMA,
        "generator": "scripts/quran/qiraat/build-rules-data.py",
        "counts": {"rules": len(rules), "chapters": len(chapters), "claims": len(verified["claims"]),
                   "books": len(books)},
        "review_state": "proposed",
        "qaris": [{"id": q["id"], "display": q["display"], "name_ar": q["name_ar"], "riwayat": q["riwayat"]}
                  for q in authorities["qaris"]],
        "riwayat": [{"id": r["id"], "qari": r["qari"], "display": r["display"], "name_ar": r["name_ar"]}
                    for r in authorities["riwayat"]],
        "books": books,
        "chapters": chapters,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"rules: {len(rules)} in {len(chapters)} chapters, {len(verified['claims'])} claims -> {OUT.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
