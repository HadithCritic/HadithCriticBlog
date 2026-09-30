#!/usr/bin/env python3
"""Verify qirāʾāt reading claims against the cached Shamela pages.

A claim is accepted only if its evidence is an exact substring of the cited
page text. Both sides are read through one view: Arabic diacritics and tatweel
are removed and any run of whitespace counts as one space; nothing else is
changed. Every reader, form and "the rest" span must sit inside the evidence.
Accepted claims record the raw slice, with the book's own diacritics on every
letter including the last, next to the normalized one. Nothing is corrected: a
mismatch is a failure, not a suggestion. Each cached page is checked against
its stored SHA-256 on load, and the hashes of the cited pages are written into
the verified claim.

The script then resolves each feature witness by witness. A claim naming a
qāriʾ applies to that qāriʾ's riwāyāt, and "the rest" applies to every riwāya
in the witness's declared reader set that no claim of the same feature and
witness names. Any claim that names a reader excludes that reader from "the
rest", whatever its basis (listing, report or rejected), because the book has
singled the reader out. Those two steps are inference, and every resolved value
is tagged with how it was reached: direct, qari, or rest.

    python scripts/quran/qiraat/verify-qiraat-claims.py --write
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[3]
QIRAAT_DIR = REPO / "docs" / "research" / "quran-platform" / "qiraat"
PAGES_DIR = REPO / "scratch" / "quran" / "qiraat" / "pages"
DIACRITICS = re.compile("[ً-ٰٟـ]")
BASES = {"listing", "report", "rejected", "disputed", "permitted"}
BASIS_MARK = {"listing": "", "report": " [report]", "rejected": " [rejected]", "disputed": " [disputed]", "permitted": " [permitted]"}
VIA_MARK = {"direct": "d", "qari": "q", "rest": "r"}


def normalize(value: str) -> str:
    """Drop diacritics and tatweel; treat any whitespace run as one space."""
    return re.sub(r"\s+", " ", DIACRITICS.sub("", value)).strip()


def normalize_with_map(raw: str) -> tuple[str, list[int]]:
    """Same view as normalize() before stripping, plus the raw index of each character."""
    chars: list[str] = []
    mapping: list[int] = []
    for index, char in enumerate(raw):
        if DIACRITICS.match(char):
            continue
        if char.isspace():
            if chars and chars[-1] == " ":
                continue
            char = " "
        chars.append(char)
        mapping.append(index)
    return "".join(chars), mapping


class Book:
    """One cached book. Page lookups fail loudly instead of guessing."""

    def __init__(self, book_id: str) -> None:
        path = PAGES_DIR / f"{book_id}.json"
        if not path.exists():
            raise SystemExit(f"Missing page cache {path}; run cache-shamela-pages.py --ids {book_id}")
        self.payload: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
        self.pages: list[dict[str, Any]] = self.payload["pages"]
        for page in self.pages:
            actual = hashlib.sha256((page["text"] or "").encode("utf-8")).hexdigest()
            if actual != page["text_sha256"]:
                raise SystemExit(
                    f"Cache for book {book_id} is corrupt at volume {page['volume']} page {page['page']}"
                )

    def index_of(self, label: str, volume: str | None) -> int:
        matches = [
            index for index, page in enumerate(self.pages)
            if page["page"] == label and (volume is None or page["volume"] == volume)
        ]
        if not matches:
            raise KeyError(f"page {label} (volume {volume}) not in book {self.payload['book_id']}")
        if len(matches) > 1:
            raise KeyError(
                f"page label {label} is ambiguous in book {self.payload['book_id']} "
                f"({len(matches)} pages); add a volume"
            )
        return matches[0]

    def window(self, witness: dict[str, Any]) -> tuple[int, int]:
        volume = witness.get("volume")
        first = self.index_of(witness["page"], volume)
        last = self.index_of(witness.get("page_end", witness["page"]), volume)
        if last < first:
            raise KeyError(f"page_end {witness.get('page_end')} comes before page {witness['page']}")
        if len({self.pages[i]["volume"] for i in range(first, last + 1)}) > 1:
            raise KeyError("the cited pages cross a volume boundary")
        return first, last


def raw_subspan(raw: str, span: str) -> str | None:
    """The raw text of `span` inside `raw`, keeping every diacritic of its last letter."""
    norm, mapping = normalize_with_map(raw)
    needle = normalize(span)
    index = norm.find(needle)
    if not needle or index < 0:
        return None
    stop = mapping[index + len(needle) - 1] + 1
    while stop < len(raw) and DIACRITICS.match(raw[stop]):
        stop += 1
    return raw[mapping[index]:stop]


def locate_evidence(book: Book, witness: dict[str, Any], evidence: str, occurrence: int) -> dict[str, Any]:
    first, last = book.window(witness)
    combined_norm: list[str] = []
    combined_map: list[tuple[int, int]] = []  # (page index, raw index)
    for page_index in range(first, last + 1):
        norm, mapping = normalize_with_map(book.pages[page_index]["text"])
        if combined_norm:
            combined_norm.append(" ")
            combined_map.append((page_index, -1))
        combined_norm.append(norm)
        combined_map.extend((page_index, raw) for raw in mapping)
    haystack = "".join(combined_norm)
    needle = normalize(evidence)
    if not needle:
        return {"ok": False, "reason": "evidence is empty"}
    starts = [m.start() for m in re.finditer(re.escape(needle), haystack)]
    if not starts:
        return {"ok": False, "reason": "evidence not found in cited page"}
    if occurrence > len(starts):
        return {"ok": False, "reason": f"occurrence {occurrence} requested but only {len(starts)} found"}
    start = starts[occurrence - 1]
    end = start + len(needle) - 1
    (start_page, start_raw), (end_page, end_raw) = combined_map[start], combined_map[end]
    raw = None
    if start_page == end_page and start_raw >= 0 and end_raw >= 0:
        text = book.pages[start_page]["text"]
        stop = end_raw + 1
        while stop < len(text) and DIACRITICS.match(text[stop]):
            stop += 1  # keep the marks that belong to the last letter
        raw = text[start_raw:stop]
        if normalize(raw) != needle:
            return {"ok": False, "reason": "raw slice does not normalize back to the evidence"}
    cited = [
        {"volume": book.pages[i]["volume"], "page": book.pages[i]["page"],
         "text_sha256": book.pages[i]["text_sha256"]}
        for i in range(first, last + 1)
    ]
    return {
        "ok": True,
        "occurrences": len(starts),
        "normalized": needle,
        "raw": raw,
        "spans_page_break": start_page != end_page,
        "page_start": book.pages[start_page]["page"],
        "page_end": book.pages[end_page]["page"],
        "cited_pages": cited,
    }


def riwayat_of(authority_id: str, authorities: dict[str, Any]) -> list[str]:
    for qari in authorities["qaris"]:
        if qari["id"] == authority_id:
            return list(qari["riwayat"])
    if any(item["id"] == authority_id for item in authorities["riwayat"]):
        return [authority_id]
    raise KeyError(authority_id)


def set_riwayat(reader_set: str, authorities: dict[str, Any]) -> list[str]:
    out: list[str] = []
    for qari_id in authorities["sets"][reader_set]:
        out.extend(riwayat_of(qari_id, authorities))
    return out


def check_claim(claim: dict[str, Any], features: dict[str, Any], registry: dict[str, Any],
                authorities: dict[str, Any], cairo_words: set[str],
                books: dict[str, Book], strict: bool) -> tuple[dict[str, Any], list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    cid = claim["id"]
    witness = claim["witness"]
    if witness["book_id"] not in registry:
        return {}, [f"{cid}: book {witness['book_id']} is not in the registry"], warnings
    if witness["book_id"] not in books:
        books[witness["book_id"]] = Book(witness["book_id"])
    book = books[witness["book_id"]]
    try:
        located = locate_evidence(book, witness, claim["evidence"], claim.get("occurrence", 1))
    except KeyError as error:
        return {}, [f"{cid}: {error.args[0]}"], warnings
    if not located["ok"]:
        return {}, [f"{cid}: {located['reason']}"], warnings
    if located["occurrences"] > 1 and "occurrence" not in claim:
        message = f"{cid}: evidence occurs {located['occurrences']} times in the window; first used"
        (errors if strict else warnings).append(message)
    evidence_norm = located["normalized"]

    spans = [reader["span"] for reader in claim.get("readers", []) if not reader.get("context")]
    for reader in claim.get("readers", []):
        ctx = reader.get("context")
        if not ctx:
            continue
        # A reader named on an earlier page of the same chapter; the span must be found there.
        window = {k: v for k, v in witness.items() if k in ("book_id", "volume")}
        window.update(page=ctx["page"], page_end=ctx.get("page_end", ctx["page"]))
        try:
            found = locate_evidence(book, window, reader["span"], 1)
        except KeyError as error:
            errors.append(f"{cid}: context {error.args[0]}")
            continue
        if not found["ok"]:
            errors.append(f"{cid}: context span not found on page {ctx['page']}: {reader['span']}")
    if claim.get("form_span"):
        spans.append(claim["form_span"])
    if claim.get("rest"):
        spans.append(claim["rest"]["span"])
    for span in spans:
        cleaned = normalize(span)
        if not cleaned:
            errors.append(f"{cid}: empty span")
        elif cleaned not in evidence_norm:
            errors.append(f"{cid}: span not inside evidence: {span}")
    for reader in claim.get("readers", []):
        try:
            riwayat_of(reader["authority"], authorities)
        except KeyError:
            errors.append(f"{cid}: unknown authority {reader['authority']}")
    if not claim.get("readers") and not claim.get("rest"):
        errors.append(f"{cid}: names no reader and no 'rest'")
    if claim.get("rest") and registry[witness["book_id"]]["reader_set"] not in authorities["sets"]:
        errors.append(
            f"{cid}: 'rest' needs a book whose reader_set is one of {sorted(authorities['sets'])}, "
            f"not {registry[witness['book_id']]['reader_set']}"
        )
    if claim.get("basis", "listing") not in BASES:
        errors.append(f"{cid}: basis must be one of {sorted(BASES)}")
    for feature_id in claim["features"]:
        feature = features.get(feature_id)
        if feature is None:
            errors.append(f"{cid}: unknown feature {feature_id}")
            continue
        if claim["value"] not in feature["values"]:
            errors.append(f"{cid}: value {claim['value']} not in {feature_id}")
        for word_id in feature["anchors"]:
            if word_id not in cairo_words:
                errors.append(f"{cid}: anchor {word_id} not in the Cairo layer")
    verified = dict(claim)
    form_raw = None
    if claim.get("form_span") and located["raw"]:
        form_raw = raw_subspan(located["raw"], claim["form_span"])
    verified.update({
        "evidence_normalized": evidence_norm,
        "evidence_raw": located["raw"],
        "form_raw": form_raw,
        "spans_page_break": located["spans_page_break"],
        "page_start": located["page_start"],
        "page_end": located["page_end"],
        "cited_pages": located["cited_pages"],
        "cache": {
            "source_file": book.payload["source_file"],
            "source_file_bytes": book.payload["source_file_bytes"],
        },
    })
    return verified, errors, warnings


def check_rest_uniqueness(claims: list[dict[str, Any]]) -> list[str]:
    seen: dict[tuple[str, str], str] = {}
    errors: list[str] = []
    for claim in claims:
        if not claim.get("rest"):
            continue
        for feature_id in claim["features"]:
            key = (feature_id, claim["witness"]["book_id"])
            if key in seen:
                errors.append(
                    f"{claim['id']}: second 'rest' claim for {feature_id} in book {key[1]} "
                    f"(first is {seen[key]}); a book has one 'the rest' per feature"
                )
            else:
                seen[key] = claim["id"]
    return errors


def resolve(claims: list[dict[str, Any]], features: dict[str, Any], registry: dict[str, Any],
            authorities: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """feature -> witness book -> riwaya -> list of value entries."""
    out: dict[str, Any] = {}
    warnings: list[str] = []
    for feature_id in features:
        by_witness: dict[str, dict[str, list[dict[str, Any]]]] = {}
        witnesses = sorted({c["witness"]["book_id"] for c in claims if feature_id in c["features"]})
        for book_id in witnesses:
            entries: dict[str, list[dict[str, Any]]] = defaultdict(list)
            here = [c for c in claims if feature_id in c["features"] and c["witness"]["book_id"] == book_id]
            for claim in here:
                for reader in claim.get("readers", []):
                    direct = any(item["id"] == reader["authority"] for item in authorities["riwayat"])
                    for riwaya in riwayat_of(reader["authority"], authorities):
                        entries[riwaya].append({
                            "value": claim["value"], "basis": claim.get("basis", "listing"),
                            "via": "direct" if direct else "qari", "claim": claim["id"],
                        })
            named = {r for r, es in entries.items() if any(e["basis"] != "permitted" for e in es)}
            for claim in here:
                if not claim.get("rest"):
                    continue
                for riwaya in set_riwayat(registry[book_id]["reader_set"], authorities):
                    if riwaya not in named:
                        entries[riwaya].append({
                            "value": claim["value"], "basis": claim.get("basis", "listing"),
                            "via": "rest", "claim": claim["id"],
                        })
            for riwaya, items in entries.items():
                listed = {e["value"] for e in items if e["basis"] == "listing"}
                if len(listed) > 1:
                    warnings.append(
                        f"{feature_id}, book {book_id}, {riwaya}: listing claims disagree {sorted(listed)}"
                    )
            by_witness[book_id] = dict(entries)
        out[feature_id] = by_witness
    return out, warnings


def cell(entries: list[dict[str, Any]] | None) -> str:
    if not entries:
        return ""
    seen: list[str] = []
    for entry in entries:
        text = f"{entry['value']}:{VIA_MARK[entry['via']]}{BASIS_MARK[entry['basis']]}"
        if text not in seen:
            seen.append(text)
    return "; ".join(seen)


def agreement(per_witness: list[list[dict[str, Any]] | None]) -> str:
    """Compare what the witnesses list outright; flag reports that add other values."""
    present = [entries for entries in per_witness if entries]
    listed = [
        {e["value"] for e in entries if e["basis"] == "listing"}
        for entries in present if any(e["basis"] == "listing" for e in entries)
    ]
    union = set().union(*listed) if listed else set()
    others = {e["value"] for entries in present for e in entries if e["basis"] != "listing"} - union
    if not listed:
        verdict = "no listing"
    elif len(listed) == 1:
        verdict = "one witness"
    elif len(union) == 1:
        verdict = "agree"
    else:
        verdict = "differ"
    return verdict + ("; other reports" if others else "")


def witness_label(book: dict[str, Any]) -> str:
    name = book.get("short_title") or book["book_title"]
    return f"{name} (d. {book['author_year']} AH, book {book['book_id']})"


def matrix_markdown(resolved: dict[str, Any], features: dict[str, Any], registry: dict[str, Any],
                    authorities: dict[str, Any], order: list[str]) -> str:
    qari_of = {item["id"]: item["qari"] for item in authorities["riwayat"]}
    latin = {q["id"]: q["name_latin"] for q in authorities["qaris"]}
    riwaya_latin = {r["id"]: r["name_latin"] for r in authorities["riwayat"]}
    lines = [
        "# Sura 1 pilot: resolved readings by riwāya",
        "",
        "Generated by `scripts/quran/qiraat/verify-qiraat-claims.py`. Do not edit by hand.",
        "",
        "Each cell is `value:how`, where how is `d` (the source names the riwāya), `q` (the source names the qāriʾ, applied to his riwāyāt), or `r` (the source says \"the rest\", resolved against that book's declared reader set). Suffixes `[report]` and `[rejected]` mark readings the source narrates through named students or mentions and rejects. An empty cell means the witness does not cover that riwāya or does not state it.",
        "",
    ]
    for feature_id, feature in features.items():
        lines += [f"## {feature_id}: {feature['label']}", "",
                  "Values: " + "; ".join(f"`{k}` = {v}" for k, v in feature["values"].items()), ""]
        witnesses = [b for b in order if b in resolved[feature_id]]
        header = ["Riwāya", "Qāriʾ"] + [witness_label(registry[b]) for b in witnesses] + ["Agreement"]
        lines += ["| " + " | ".join(header) + " |", "|" + "---|" * len(header)]
        for riwaya in [r["id"] for r in authorities["riwayat"]]:
            cells = [resolved[feature_id][b].get(riwaya) for b in witnesses]
            lines.append("| " + " | ".join([
                riwaya_latin[riwaya], latin[qari_of[riwaya]],
                *[cell(c) for c in cells], agreement(cells),
            ]) + " |")
        lines.append("")
    return "\n".join(lines) + "\n"


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--claims", type=Path, default=QIRAAT_DIR / "claims" / "sura-001.json")
    parser.add_argument("--registry", type=Path, default=QIRAAT_DIR / "sources.json")
    parser.add_argument("--authorities", type=Path, default=QIRAAT_DIR / "authorities.json")
    parser.add_argument("--cairo", type=Path, help="cairo-arabic-sura-NNN.json (default: active release)")
    parser.add_argument("--matrix-out", type=Path, help="where to write the comparison markdown")
    parser.add_argument("--strict", action="store_true", help="treat warnings as errors")
    parser.add_argument("--write", action="store_true", help="write verified claims and the matrix")
    parser.add_argument("--no-matrix", action="store_true", help="skip the comparison markdown (large suras)")
    args = parser.parse_args()

    data = json.loads(args.claims.read_text(encoding="utf-8"))
    registry = {b["book_id"]: b for b in json.loads(args.registry.read_text(encoding="utf-8"))["books"]}
    authorities = json.loads(args.authorities.read_text(encoding="utf-8"))
    cairo_path = args.cairo
    if cairo_path is None and data["sura"] != 0:
        pointer = json.loads((REPO / "public/data/quran/manifest.json").read_text(encoding="utf-8"))
        cairo_path = (REPO / "public/data/quran/releases" / pointer["releaseId"]
                      / f"cairo-arabic-sura-{data['sura']:03d}.json")
    if data["sura"] == 0:
        cairo_words: set[str] = set()  # general rules belong to no verse
    else:
        cairo = json.loads(cairo_path.read_text(encoding="utf-8"))
        cairo_words = {w["nativeId"] for verse in cairo["records"] for w in verse["words"]}

    books: dict[str, Book] = {}
    verified: list[dict[str, Any]] = []
    errors: list[str] = []
    warnings: list[str] = []
    seen_ids: set[str] = set()
    for claim in data["claims"]:
        if claim["id"] in seen_ids:
            errors.append(f"{claim['id']}: duplicate claim id")
        seen_ids.add(claim["id"])
        done, claim_errors, claim_warnings = check_claim(
            claim, data["features"], registry, authorities, cairo_words, books, args.strict)
        errors.extend(claim_errors)
        warnings.extend(claim_warnings)
        if done:
            verified.append(done)
    errors.extend(check_rest_uniqueness(data["claims"]))

    print(f"claims: {len(data['claims'])}  verified: {len(verified)}  "
          f"errors: {len(errors)}  warnings: {len(warnings)}")
    for message in errors:
        print("  error:", message)
    if errors:
        for message in warnings:
            print("  warning:", message)
        return 1

    resolved, resolve_warnings = resolve(verified, data["features"], registry, authorities)
    warnings.extend(resolve_warnings)
    for message in warnings:
        print("  warning:", message)
    if args.strict and warnings:
        return 1

    order = data.get("witness_order") or sorted({c["witness"]["book_id"] for c in verified})
    if args.write:
        out = dict(data)
        out["claims"] = verified
        verified_path = args.claims.with_suffix(".verified.json")
        verified_path.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        resolved_path = args.claims.with_suffix(".resolved.json")
        resolved_path.write_text(json.dumps(resolved, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        if args.no_matrix:
            print(f"wrote {verified_path.name} and {resolved_path.name}")
        else:
            matrix_path = args.matrix_out or QIRAAT_DIR / f"pilot-sura-{data['sura']:03d}-matrix.md"
            matrix_path.write_text(
                matrix_markdown(resolved, data["features"], registry, authorities, order), encoding="utf-8")
            print(f"wrote {verified_path.name}, {resolved_path.name} and {matrix_path.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
