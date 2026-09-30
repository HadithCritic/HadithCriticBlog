#!/usr/bin/env python3
"""Print the parser's draft for a run of pages so a person can read every unit against its sentence.

    python scripts/quran/qiraat/review-farsh.py --from 288 --to 297 [--only clean|exceptions]

One block per unit: its id, page and flags; the sentence from the book; then each lemma with the verse it was
placed at and the Cairo words that matched; then who reads what. A unit with no flags is a draft to confirm.
A flagged unit is a draft to correct or replace. Corrections go in a review file read by apply-farsh-review.py.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from farsh_items import Farsh, load_authorities  # noqa: E402


def forms_line(item: dict) -> str:
    parts = []
    for form in item["forms"]:
        who = "+".join(r.get("authority") or r.get("group") for r in form["readers"])
        parts.append((who + " " if who else "") + ("REST" if form.get("rest") else "")) if who or form.get("rest") else None
    return " | ".join(p.strip() for p in parts)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--from", dest="first", required=True)
    parser.add_argument("--to", dest="last", required=True)
    parser.add_argument("--only", choices=["clean", "exceptions"])
    parser.add_argument("--width", type=int, default=330)
    args = parser.parse_args()

    farsh = Farsh(load_authorities())
    drafts = farsh.draft(args.first, args.last)
    shown = 0
    for d in drafts:
        clean = not d["flags"]
        if (args.only == "clean" and not clean) or (args.only == "exceptions" and clean):
            continue
        shown += 1
        print(f"{d['id']} p{d['page']} {'ok' if clean else ','.join(d['flags'])}")
        print("  EV:", d["evidence"][: args.width] + (" ..." if len(d["evidence"]) > args.width else ""))
        items = d["items"]
        if not items:
            print("  (no draft)")
            continue
        base = forms_line(items[0])
        for item in items:
            where = farsh.matched_words(item["lemma"], item["verse"])
            line = forms_line(item)
            print(f"  L: {item['lemma']} -> {item['verse']} [{where}] {item['scope']}" + ("" if line == base else f"  F: {line}"))
        print(f"  F: {base}")
    print(f"-- {shown} units, pages {args.first} to {args.last}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
