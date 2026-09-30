#!/usr/bin/env python3
"""Turn a reviewed run of the parser's drafts into a batch for verify-farsh-items.py.

    python scripts/quran/qiraat/apply-farsh-review.py REVIEW.json [--out BATCH.json]

REVIEW.json:

    {"from": "288", "to": "297",
     "accept":  ["u123"],                  flagged units whose draft was read and is right
     "reject":  {"u456": "why"},           unflagged units whose draft is wrong and not replaced
     "replace": {"u789": [ITEM, ...]},     items written by the reviewer in place of the draft
     "drop":    {"u999": "why"}}           units that are not statements about a word

An unflagged unit not named anywhere is confirmed. A flagged unit not named is skipped as unreviewed and listed,
so nothing reaches the site that a person has not read. ITEM is the compact hand format of EXTRACTION.md; its
page, id and short labels are filled in when left out.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qiraat_lib as lib  # noqa: E402
from farsh_items import Farsh, load_authorities  # noqa: E402


def compact_item(unit_id: str, number: int, page: str, page_end: str | None, item: dict[str, Any]) -> dict[str, Any]:
    out = dict(item)
    out.setdefault("id", f"{unit_id}-r{number}")
    out.setdefault("page", page)
    if page_end and "page_end" not in out:
        out["page_end"] = page_end
    forms = []
    for index, form in enumerate(out.get("forms", []), start=1):
        forms.append({"short": f"form {index}", **form})
    out["forms"] = forms
    return out


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("review", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    review = json.loads(args.review.read_text(encoding="utf-8"))
    first, last = review["from"], review["to"]
    accept = set(review.get("accept", []))
    reject: dict[str, str] = review.get("reject", {})
    replace: dict[str, list[dict[str, Any]]] = review.get("replace", {})
    drop: dict[str, str] = review.get("drop", {})

    farsh = Farsh(load_authorities())
    drafts = farsh.draft(first, last)
    known = {d["id"] for d in drafts}
    unknown = [u for u in [*accept, *reject, *replace, *drop] if u not in known]
    if unknown:
        raise SystemExit(f"units not in pages {first} to {last}: {unknown}")

    items: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    unreviewed: list[str] = []
    spans: list[tuple[int, int]] = []
    for d in drafts:
        uid, s, e = d["id"], d["start"], d["end"]
        spans.append((s, e))
        witness = farsh.witness(s, e)
        if uid in replace:
            for number, item in enumerate(replace[uid], start=1):
                items.append(compact_item(uid, number, witness["page"], witness.get("page_end"), item))
            # Keep the unit's whole text accounted for: the reviewer's items may stop short of its end.
            skipped.append({"id": f"s{uid}", "witness": witness, "evidence": d["evidence"], "reason": "replaced by the reviewer's items"})
            continue
        reason: str | None = None
        if uid in drop:
            reason = "not a statement about a word: " + drop[uid]
        elif uid in reject:
            reason = "draft rejected on reading: " + reject[uid]
        elif d["flags"] and uid not in accept:
            unreviewed.append(uid)
            reason = "not yet reviewed: " + ", ".join(d["flags"])
        elif not d["items"]:
            unreviewed.append(uid)
            reason = "no draft"
        if reason:
            skipped.append({"id": f"s{uid}", "witness": witness, "evidence": d["evidence"], "reason": reason})
            continue
        for number, item in enumerate(d["items"], start=1):
            item = dict(item)
            item["id"] = f"{uid}-{number}"
            items.append(item)
    lo = farsh.stream.starts[farsh.book.index_of(first, "1")]
    hi = farsh.stream.ends[farsh.book.index_of(last, "1")]
    skipped.extend(farsh._gaps(spans, lo, hi))

    batch = {"schema": "qiraat-farsh-batch/0.1", "book_id": "5556", "reviewed": True, "pages": {"volume": "1", "from": first, "to": last},
             "items": items, "skipped": skipped}
    out = args.out or (lib.QIRAAT_DIR / "farsh" / f"batch-5556-p{first}-{last}.json")
    out.write_text(json.dumps(batch, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{out.name}: {len(drafts)} units, {len(items)} items, {len(skipped)} skipped, {len(unreviewed)} unreviewed")
    if unreviewed:
        print("  unreviewed:", " ".join(unreviewed[:40]) + (" ..." if len(unreviewed) > 40 else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
