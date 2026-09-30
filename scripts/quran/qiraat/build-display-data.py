#!/usr/bin/env python3
"""Build the display data for the qirāʾāt view from verified claims.

Reads the verifier's outputs (sura-NNN.verified.json and sura-NNN.resolved.json),
the authority table, the source registry and the Cairo text layer, and writes
one JSON file the Astro page imports at build time. Nothing here re-reads
Shamela and nothing is invented: every quotation is the raw slice the verifier
located, every reader comes from a claim, and every grouping is computed from
the resolved comparison. Grouping rule per riwāya:

- reading: every book that lists the riwāya agrees on one value
- differs: books that list the riwāya disagree (each book's value is kept)
- reported: only reports or rejected attributions exist, no listing
- unstated: no book in the cited set covers the riwāya

    python scripts/quran/qiraat/build-display-data.py
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[3]
QIRAAT_DIR = REPO / "docs" / "research" / "quran-platform" / "qiraat"
DEFAULT_OUT = REPO / "src" / "data" / "quran-qiraat-sura-001.json"
SCHEMA = "qiraat-display/0.1.0"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def page_label(claim: dict[str, Any]) -> str:
    witness = claim["witness"]
    volume = f"vol. {witness['volume']}, " if witness.get("volume") else ""
    first, last = claim["page_start"], claim["page_end"]
    pages = f"p. {first}" if first == last else f"pp. {first} to {last}"
    return volume + pages


def claim_view(claim: dict[str, Any], via: list[str]) -> dict[str, Any]:
    raw = claim.get("evidence_raw")
    return {
        "id": claim["id"],
        "book_id": claim["witness"]["book_id"],
        "page": page_label(claim),
        "quote": raw if raw is not None else claim["evidence_normalized"],
        "quote_is_exact_raw": raw is not None,
        "form": claim.get("form_raw"),
        "via": sorted(set(via)),
        "basis": claim.get("basis", "listing"),
        "value": claim["value"],
        "note": claim.get("note"),
        "review_state": claim.get("review_state", "proposed"),
    }


def reader_groups(members: list[str], authorities: dict[str, Any]) -> list[dict[str, Any]]:
    """Collapse riwāya ids into qāriʾ entries, in the owner's order."""
    groups = []
    for qari in authorities["qaris"]:
        present = [r for r in qari["riwayat"] if r in members]
        if not present:
            continue
        by_id = {r["id"]: r for r in authorities["riwayat"]}
        groups.append({
            "qari": qari["id"],
            "display": qari["display"],
            "name_ar": qari["name_ar"],
            "whole": len(present) == len(qari["riwayat"]),
            "riwayat": [{"id": r, "display": by_id[r]["display"], "name_ar": by_id[r]["name_ar"]} for r in present],
        })
    return groups


def build_feature(feature_id: str, feature: dict[str, Any], resolved: dict[str, Any],
                  claims: dict[str, dict[str, Any]], authorities: dict[str, Any],
                  order: list[str], cairo_words: dict[str, str]) -> dict[str, Any]:
    riwayat = [r["id"] for r in authorities["riwayat"]]
    by_witness = resolved[feature_id]
    witnesses = [b for b in order if b in by_witness]
    per_riwaya: dict[str, dict[str, Any]] = {}
    for riwaya in riwayat:
        listing: dict[str, set[str]] = {}
        reports: list[tuple[str, dict[str, Any]]] = []
        for book in witnesses:
            for entry in by_witness[book].get(riwaya, []):
                if entry["basis"] == "listing":
                    listing.setdefault(book, set()).add(entry["value"])
                else:
                    reports.append((book, entry))
        union = set().union(*listing.values()) if listing else set()
        if not listing and not reports:
            per_riwaya[riwaya] = {"kind": "unstated"}
        elif not listing:
            per_riwaya[riwaya] = {"kind": "reported", "values": sorted({e["value"] for _, e in reports})}
        elif len(union) == 1:
            per_riwaya[riwaya] = {"kind": "reading", "value": next(iter(union))}
        else:
            signature = tuple(sorted((b, tuple(sorted(v))) for b, v in listing.items()))
            per_riwaya[riwaya] = {"kind": "differs", "signature": signature}

    buckets: dict[tuple, list[str]] = {}
    for riwaya, status in per_riwaya.items():
        if status["kind"] == "reading":
            key: tuple = ("reading", status["value"])
        elif status["kind"] == "differs":
            key = ("differs", status["signature"])
        elif status["kind"] == "reported":
            key = ("reported", tuple(status["values"]))
        else:
            key = ("unstated",)
        buckets.setdefault(key, []).append(riwaya)

    def attestations(members: list[str], value: str | None) -> list[dict[str, Any]]:
        seen: dict[str, list[str]] = {}
        for book in witnesses:
            for riwaya in members:
                for entry in by_witness[book].get(riwaya, []):
                    if entry["basis"] == "listing" and (value is None or entry["value"] == value):
                        seen.setdefault(entry["claim"], []).append(entry["via"])
        ranked = sorted(seen, key=lambda cid: (order.index(claims[cid]["witness"]["book_id"]), cid))
        return [claim_view(claims[cid], seen[cid]) for cid in ranked]

    groups: list[dict[str, Any]] = []
    for key, members in buckets.items():
        kind = key[0]
        group: dict[str, Any] = {
            "kind": kind,
            "readers": reader_groups(members, authorities),
            "qaris": sorted({r["qari"] for r in reader_groups(members, authorities)}),
            "includes_hafs": "hafs" in members,
            "member_count": len(members),
            "members": members,
        }
        if kind == "reading":
            group["value"] = key[1]
            group["value_label"] = feature["values"][key[1]]
            group["claims"] = attestations(members, key[1])
            forms: list[dict[str, str]] = []
            for claim in group["claims"]:
                if claim["form"] and claim["form"] not in {f["text"] for f in forms}:
                    forms.append({"text": claim["form"], "book_id": claim["book_id"], "page": claim["page"]})
            group["forms"] = forms
        elif kind == "differs":
            group["by_book"] = [
                {"book_id": b, "values": [{"value": v, "label": feature["values"][v]} for v in vals]}
                for b, vals in key[1]
            ]
            group["claims"] = attestations(members, None)
        elif kind == "reported":
            group["values"] = [{"value": v, "label": feature["values"][v]} for v in key[1]]
        groups.append(group)

    kind_rank = {"reading": 0, "differs": 1, "reported": 2, "unstated": 3}
    groups.sort(key=lambda g: (kind_rank[g["kind"]], not g["includes_hafs"], -g["member_count"]))

    # Tone 0 is the reading that includes Ḥafṣ (the Cairo text); the rest count up.
    # Colors mean nothing across positions, only within one.
    short = feature.get("short", {})
    tone = 0
    for group in groups:
        if group["kind"] == "reading":
            group["tone"] = tone
            group["short"] = short.get(group["value"], group["value"])
            tone += 1
        else:
            group["tone"] = None
            group["short"] = {"differs": "differs", "reported": "reported", "unstated": "not stated"}[group["kind"]]

    def book_marks(riwaya: str) -> str:
        marks = []
        for book in witnesses:
            entries = by_witness[book].get(riwaya, [])
            marks.append("l" if any(e["basis"] == "listing" for e in entries) else "r" if entries else "-")
        return "".join(marks)

    cells = {
        riwaya: {"g": index, "b": book_marks(riwaya)}
        for index, group in enumerate(groups) for riwaya in group["members"]
    }

    reports: dict[str, dict[str, Any]] = {}
    for book in witnesses:
        for riwaya, entries in by_witness[book].items():
            for entry in entries:
                if entry["basis"] != "listing":
                    reports.setdefault(entry["claim"], {"members": set(), "via": []})
                    reports[entry["claim"]]["members"].add(riwaya)
                    reports[entry["claim"]]["via"].append(entry["via"])
    report_rows = []
    for cid in sorted(reports, key=lambda c: (order.index(claims[c]["witness"]["book_id"]), c)):
        view = claim_view(claims[cid], reports[cid]["via"])
        view["readers"] = reader_groups(sorted(reports[cid]["members"]), authorities)
        view["value_label"] = feature["values"][view["value"]]
        report_rows.append(view)

    return {
        "id": feature_id,
        "label": feature["label"],
        "words": [{"id": w, "text": cairo_words[w]} for w in feature["anchors"]],
        "verse": "verse-" + (feature["anchors"][0][2:].rsplit("-", 1)[0] if feature["anchors"]
                             else "-".join(f"{int(x):03d}" for x in feature["verse"].split(":"))),
        "lemma": feature.get("lemma", feature["label"]),
        "scope": feature.get("scope"),
        "anchor_status": feature.get("anchor_status"),
        "note": feature.get("note"),
        "unresolved": feature.get("unresolved", []),
        "groups": groups,
        "cells": cells,
        "books": witnesses,
        "reports": report_rows,
    }


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--sura", type=int, default=1, help="sura number; 1 is the hand-made pilot, the rest are farsh")
    parser.add_argument("--verified", type=Path)
    parser.add_argument("--resolved", type=Path)
    parser.add_argument("--registry", type=Path, default=QIRAAT_DIR / "sources.json")
    parser.add_argument("--authorities", type=Path, default=QIRAAT_DIR / "authorities.json")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    stem = "sura-001" if args.sura == 1 else f"farsh-sura-{args.sura:03d}"
    args.verified = args.verified or QIRAAT_DIR / "claims" / f"{stem}.verified.json"
    args.resolved = args.resolved or QIRAAT_DIR / "claims" / f"{stem}.resolved.json"
    if args.out == DEFAULT_OUT and args.sura != 1:
        args.out = REPO / "src" / "data" / "qiraat" / f"sura-{args.sura:03d}.json"

    verified = load(args.verified)
    resolved = load(args.resolved)
    authorities = load(args.authorities)
    registry = {b["book_id"]: b for b in load(args.registry)["books"]}
    claims = {c["id"]: c for c in verified["claims"]}
    order: list[str] = verified["witness_order"]

    pointer = load(REPO / "public/data/quran/manifest.json")
    cairo = load(REPO / "public/data/quran/releases" / pointer["releaseId"]
                 / f"cairo-arabic-sura-{verified['sura']:03d}.json")
    cairo_words = {w["nativeId"]: w["exactText"] for v in cairo["records"] for w in v["words"]}

    features = [
        build_feature(fid, feature, resolved, claims, authorities, order, cairo_words)
        for fid, feature in verified["features"].items()
    ]
    # Passages of the other books that go below the twenty transmitters (routes), quoted and not read as claims.
    route_file = QIRAAT_DIR / "second-witness" / "route-detail.json"
    routes: dict[str, list[dict[str, Any]]] = {}
    if route_file.exists():
        for record in load(route_file)["records"]:
            if record.get("feature") and record.get("excerpt") and record.get("names_below_the_twenty"):
                routes.setdefault(record["feature"], []).append({
                    "book_id": record["book_id"], "page": record["page"], "volume": record.get("volume"),
                    "narrators": record["names_below_the_twenty"], "excerpt": record["excerpt"],
                })
    # Route entries read by hand (routes/routes-*.checked.json): a narrator below the twenty and what he reports.
    names = {x["id"]: x["display"] for x in authorities["qaris"]}
    names.update({x["id"]: x["display"] for x in authorities["riwayat"]})
    route_entries: dict[str, list[dict[str, Any]]] = {}
    for path in sorted((QIRAAT_DIR / "routes").glob("routes-*.checked.json")):
        for item in load(path)["items"]:
            fid = item["feature"]
            source = verified["features"].get(fid)
            if source is None:
                continue
            rows = []
            for entry in item["entries"]:
                rows.append({
                    "narrator": entry["narrator"], "under": names.get(entry["under"], entry["under"]),
                    "kind": entry.get("kind", "reads"), "form": entry["form"],
                    "reading": source["values"].get(f"v{entry['value_of']}") if entry.get("value_of") else None,
                })
            route_entries.setdefault(fid, []).append({
                "book_id": item["book_id"], "page": item["page"], "volume": item.get("volume"),
                "evidence": item["evidence"], "entries": rows, "note": item.get("note"),
            })
    for feature in features:
        feature["route_entries"] = route_entries.get(feature["id"], [])
        read_here = {(e["book_id"], e["page"]) for e in feature["route_entries"]}
        feature["route_notes"] = [n for n in routes.get(feature["id"], []) if (n["book_id"], n["page"]) not in read_here]
    word_features: dict[str, list[str]] = {}
    for feature in features:
        for word in feature["words"]:
            word_features.setdefault(word["id"], []).append(feature["id"])
    verses = [
        {
            "id": v["verseNativeId"],
            "number": int(v["verseNativeId"].rsplit("-", 1)[1]),
            "words": [{"id": w["nativeId"], "text": w["exactText"],
                       "features": word_features.get(w["nativeId"], [])} for w in v["words"]],
        }
        for v in cairo["records"]
    ]

    books = []
    for book_id in order:
        book = registry[book_id]
        cited = [c for c in verified["claims"] if c["witness"]["book_id"] == book_id]
        books.append({
            "book_id": book_id,
            "mark": book.get("mark", book_id[:2]),
            "short_title": book.get("short_title") or book["book_title"],
            "title_ar": book["book_title"],
            "author_year": book["author_year"],
            "reader_set": book["reader_set"],
            "granularity": book.get("granularity"),
            "edition": book["edition"],
            "claim_count": len(cited),
            "pages": sorted({page_label(c) for c in cited}),
        })

    data = {
        "schemaVersion": SCHEMA,
        "generator": "scripts/quran/qiraat/build-display-data.py",
        "sura": verified["sura"],
        "cairo": {"release": pointer["releaseId"], "layer": "Corpus Coranicum Cairo 1924 (arabic_text)"},
        "counts": {
            "claims": len(verified["claims"]),
            "features": len(features),
            "books": len(books),
            "riwayat": len(authorities["riwayat"]),
            "verses": len(verses),
        },
        "review_state": "proposed",
        "qaris": [{"id": q["id"], "display": q["display"], "name_ar": q["name_ar"],
                   "riwayat": q["riwayat"]} for q in authorities["qaris"]],
        "riwayat": [{"id": r["id"], "qari": r["qari"], "display": r["display"], "name_ar": r["name_ar"]}
                    for r in authorities["riwayat"]],
        "books": books,
        "verses": verses,
        "features": features,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {args.out.resolve().relative_to(REPO)}: {len(features)} positions, {len(books)} books, "
          f"{sum(len(f['groups']) for f in features)} groups")
    return 0


if __name__ == "__main__":
    sys.exit(main())
