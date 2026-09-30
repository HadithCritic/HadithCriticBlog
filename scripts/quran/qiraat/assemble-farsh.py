#!/usr/bin/env python3
"""Assemble checked farsh batches into one claims file per sura.

Reads every `*.checked.json` in qiraat/farsh (written by verify-farsh-items.py
--write), routes each item to the sura its lemma was anchored in, and writes
`claims/farsh-sura-NNN.json` in the format verify-qiraat-claims.py reads:

- an item becomes a feature; each form becomes a value of it;
- each form becomes one claim per basis: readers named through a collective
  term are expanded to the term's members, and "the rest" stays a `rest` claim
  for the claims verifier to resolve against the book's declared reader set;
- an item whose lemma could not be placed in a verse stays in the sura it was
  filed under, with no anchors, and is marked unanchored.

Nothing is invented: every string is copied from the checked batch.

    python scripts/quran/qiraat/assemble-farsh.py [--sura N]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qiraat_lib as lib  # noqa: E402

FARSH = lib.QIRAAT_DIR / "farsh"
CLAIMS = lib.QIRAAT_DIR / "claims"
PLACED = {"agree", "moved"}
HEADING = re.compile(r"\((?:باب|فصل|ذكر)[^()]{3,90}\)")


def place(item: dict[str, Any]) -> tuple[int, int, bool]:
    """(sura, verse, anchored) for an item. General rules are filed under sura 0."""
    anchor = item["anchor"]
    if anchor["status"] == "rule":
        return 0, 0, False
    if anchor["status"] in PLACED:
        return anchor["sura"], anchor["verse"], True
    sura, verse = (int(x) for x in item["verse"].split(":"))
    return sura, verse, False


def claims_for(item: dict[str, Any], feature_id: str, authorities: dict[str, Any], merged: bool = False) -> list[dict[str, Any]]:
    groups = authorities.get("groups", {})
    claims: list[dict[str, Any]] = []
    for number, form in enumerate(item["forms"], start=1):
        value = f"v{form['value_of']}" if merged else f"v{number}"
        by_basis: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for reader in form.get("readers", []):
            basis = reader.get("basis", form.get("basis", "listing"))
            extra = {"context": reader["context"]} if reader.get("context") else {}
            if reader.get("identified_by"):
                extra["identified_by"] = reader["identified_by"]
            if "group" in reader:
                for member in groups[reader["group"]]["members"]:
                    by_basis[basis].append({"authority": member, "span": reader["span"], **extra})
            else:
                by_basis[basis].append({"authority": reader["authority"], "span": reader["span"], **extra})
        if form.get("rest"):
            by_basis.setdefault(form.get("basis", "listing"), [])
        for basis, readers in by_basis.items():
            claim: dict[str, Any] = {
                "id": f"c-{item['id']}-{number}" + ("" if basis == form.get("basis", "listing") else f"-{basis}"),
                "features": [feature_id],
                "witness": item["witness"],
                "evidence": item["evidence"],
                "occurrence": item.get("occurrence", 1),
                "readers": readers,
                "form_span": form.get("desc"),
                "value": value,
                "basis": basis,
                "review_state": "proposed",
            }
            if form.get("rest") and basis == form.get("basis", "listing"):
                claim["rest"] = form["rest"]
            claims.append(claim)
    return claims


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--sura", type=int, help="write only this sura")
    parser.add_argument("--batches", type=Path, default=FARSH)
    args = parser.parse_args()

    authorities = json.loads((lib.QIRAAT_DIR / "authorities.json").read_text(encoding="utf-8"))
    placed: dict[int, list[tuple[int, int, bool, dict[str, Any]]]] = defaultdict(list)
    order = 0
    # Items of a second book that add their claims to a position already entered from the first (`merge_into`).
    merged_by_sura: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for path in sorted(args.batches.rglob("*.checked.json")):
        batch = json.loads(path.read_text(encoding="utf-8"))
        for item in batch["items"]:
            order += 1
            if item.get("merge_into"):
                merged_by_sura[int(item["verse"].split(":")[0])].append(item)
                continue
            sura, verse, anchored = place(item)
            placed[sura].append((verse, order, anchored, item))

    editorial_path = args.batches / "editorial-notes.json"
    editorial: dict[str, str] = (
        json.loads(editorial_path.read_text(encoding="utf-8")).get("notes", {}) if editorial_path.exists() else {}
    )
    CLAIMS.mkdir(parents=True, exist_ok=True)
    total_items = total_claims = 0
    for sura in sorted(placed):
        if args.sura and sura != args.sura:
            continue
        features: dict[str, Any] = {}
        claims: list[dict[str, Any]] = []
        counter: dict[int, int] = defaultdict(int)
        item_fid: dict[str, str] = {}
        books: list[str] = []
        for verse, _, anchored, item in sorted(placed[sura], key=lambda x: (x[0], x[1])):
            counter[verse] += 1
            fid = f"f-{sura:03d}-{verse:03d}-{counter[verse]:02d}"
            values = {f"v{n}": form["short"] for n, form in enumerate(item["forms"], start=1)}
            short = {f"v{n}": form["short"] for n, form in enumerate(item["forms"], start=1)}
            anchor = item["anchor"]
            features[fid] = {
                "label": item["lemma"], "lemma": item["lemma"], "verse": f"{sura}:{verse}", "scope": item["scope"],
                "anchors": anchor.get("word_ids", []) if anchored else [],
                "anchor_status": anchor["status"] if anchored else f"unanchored ({anchor['status']})",
                "anchor_how": anchor.get("how"), "item": item["id"],
                "values": values, "short": short,
                **({"note": " ".join(x for x in (item.get("note"), editorial.get(item["id"])) if x)}
                   if item.get("note") or editorial.get(item["id"]) else {}),
                **({"chapter": item["chapter"]} if item.get("chapter") else {}),
                **({"unresolved": item["unresolved"]} if item.get("unresolved") else {}),
            }
            claims.extend(claims_for(item, fid, authorities))
            item_fid[item["id"]] = fid
            book = item["witness"]["book_id"]
            if book not in books:
                books.append(book)
        for item in merged_by_sura.get(sura, []):
            target = item_fid.get(item["merge_into"])
            if target is None:
                raise SystemExit(f"{item['id']}: merge_into {item['merge_into']} is not an item of sura {sura}")
            claims.extend(claims_for(item, target, authorities, merged=True))
            book = item["witness"]["book_id"]
            if book not in books:
                books.append(book)
        payload = {
            "schemaVersion": "qiraat-claims/0.2.0", "sura": sura, "witness_order": books,
            "note": "Assembled by assemble-farsh.py from checked farsh batches. Every claim is a proposal; evidence is an exact "
                    "substring of the cited page and review_state stays 'proposed' until a person has read the passage.",
            "features": features, "claims": claims,
        }
        (CLAIMS / f"farsh-sura-{sura:03d}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        total_items += len(features)
        total_claims += len(claims)
        unanchored = sum(1 for f in features.values() if f["anchor_status"].startswith("unanchored"))
        print(f"sura {sura:3d}: {len(features):4d} positions  {len(claims):4d} claims  unanchored {unanchored}")
    print(f"total {total_items} positions, {total_claims} claims")
    return 0


if __name__ == "__main__":
    sys.exit(main())
