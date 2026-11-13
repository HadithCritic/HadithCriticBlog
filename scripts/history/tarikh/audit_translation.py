"""Audit coverage and produce a targeted review queue without more model calls."""
from __future__ import annotations

import argparse
from collections import Counter
import csv
from pathlib import Path
import re
import unicodedata

import pipeline as p


def latin_key(text):
    # The continuation follows the user's existing compact name style. Treat
    # ibn and b. alike without changing either source or translated prose.
    text = re.sub(r"\bibn\b|\bb\.", "b", text, flags=re.I)
    text = unicodedata.normalize("NFKD", text).lower()
    return "".join(c for c in text if "a" <= c <= "z" or "0" <= c <= "9")


def audit(args):
    path, job = p.load_job(args)
    revisions = p.load_revisions(path, job)
    book = Path(args.workspace) / "books" / job["book_id"]
    manifest = p.read(book / "manifest.json")
    if p.digest(manifest) != job["source_manifest_hash"]:
        raise ValueError("Source manifest differs from the frozen job")
    original = (book / "original.md").read_bytes()
    if p.digest(original) != job["source_file_sha256"]:
        raise ValueError("Original bytes differ from the frozen source")
    text = original.decode("utf-8-sig")
    units = {u["id"]: u for u in p.jsonl(book / "units.jsonl")}
    rows, missing = [], []
    for request in job["requests"]:
        target = p.result_path(path, request)
        if not target.exists():
            missing.append(request["id"])
            continue
        result = p.read(target)
        unit = request.get("source_unit") or units[request["id"]]
        if text[unit["start"]:unit["end"]] != unit["arabic"]:
            raise ValueError(f"Source offset mismatch: {unit['id']}")
        if (result["job_hash"] != job["job_hash"] or result["request_hash"] != request["request_hash"]
                or result["source_hash"] != p.digest(unit["arabic"].encode("utf-8"))):
            raise ValueError(f"Checkpoint fingerprint mismatch: {unit['id']}")
        flags = p.validate_translation(request, result["response"])
        translated = p.translation_view(request, result, revisions)
        flags = p.validate_translation(request, {"translations": [{k: translated[k] for k in ["id", "english", "uncertainties"]}]})
        english = translated["english"]
        if re.search(r"as an ai|for brevity|\[omitted\]|\[translation\]|I cannot translate|translation omitted|remaining (?:text|pages) (?:omitted|summarized)", english, re.I):
            flags.append("possible-placeholder-or-meta-commentary")
        absent = [g["target"] for g in request["payload"].get("glossary", [])
                  if p.term_present(g["source"], unit["arabic"]) and latin_key(g["target"]) not in latin_key(english)]
        if absent:
            flags.append("glossary-form-needs-check")
        # A heuristic, not a completeness assertion. 'ibn', 'b.' and 'son of'
        # can legitimately vary, and some Arabic بن forms are textually damaged.
        without_age = re.sub(r"\b(?:بن|ابن)\s+(?:ثلاث|خمس|ست|سبع|ثمان|تسع|عشر|أربع|اربع|اثن|اثنت)[\w]*", "", p.fold(unit["arabic"]))
        source_ibn = len(re.findall(r"\b(?:بن|ابن)\b", without_age))
        target_ibn = len(re.findall(r"\b(?:ibn|b\.|son of)\s", english, re.I))
        if source_ibn >= 6 and target_ibn < source_ibn * .7:
            flags.append("genealogical-list-coverage-needs-check")
        rows.append({"id": unit["id"], "page_label": unit["page_label"],
                     "page_sequence": unit["page_sequence"], "flags": sorted(set(flags)),
                     "missing_glossary_forms": absent, "uncertainties": translated["uncertainties"],
                     "arabic": unit["arabic"], "english": english})
    seen_english = {}
    for row in rows:
        key = p.digest(row["english"])
        previous = seen_english.get(key)
        if previous and previous["arabic"] != row["arabic"] and len(row["english"]) > 100:
            flag = "identical-translation-for-different-arabic"
            if flag not in previous["flags"]:
                previous["flags"].append(flag)
            row["flags"].append(flag)
        seen_english[key] = row
    receipts = [p.read(f) for f in (path / "codex-runs").glob("*/batch-receipt.json")]
    page_receipts = Counter(id for r in receipts for id in r["request_ids"])
    duplicate_receipts = [id for id, count in page_receipts.items() if count > 1]
    if duplicate_receipts:
        raise ValueError(f"Duplicate batch accounting: {duplicate_receipts}")
    usage = Counter()
    for receipt in receipts:
        usage.update({k: v for k, v in (receipt.get("usage") or {}).items() if isinstance(v, int)})
    review_usage = Counter()
    review_receipts = list((path / "codex-review").glob("*/receipt.json"))
    for receipt_file in review_receipts:
        review_usage.update({k: v for k, v in (p.read(receipt_file).get("usage") or {}).items() if isinstance(v, int)})
    samples = sorted({round(i * (len(rows) - 1) / 12) for i in range(13)}) if rows else []
    summary = {"job_hash": job["job_hash"], "book_id": job["book_id"], "source_sha256": p.digest(original),
               "requested": len(job["requests"]), "saved": len(rows), "missing": missing,
               "coverage_complete": not missing, "review_status": "machine-draft",
               "flag_counts": dict(Counter(flag for row in rows for flag in row["flags"])),
               "flagged_pages": sum(bool(row["flags"]) for row in rows),
               "cli_batch_receipts": len(receipts), "recorded_cli_usage": dict(usage),
               "source_compared_pages": len(revisions),
               "source_comparison_batch_receipts": len(review_receipts),
               "source_comparison_cli_usage": dict(review_usage),
               "accepted_machine_edits": sum(len(r["accepted_edits"]) for r in revisions.values()),
               "unresolved_machine_edits": sum(len(r["unresolved_edits"]) for r in revisions.values()),
               "usage_note": "Codex CLI turn usage, not a separately billed API dollar total. Each batch counted once.",
               "quality_note": "Coverage and heuristic checks do not establish scholarly accuracy; human review not claimed.",
               "sample_page_ids": [rows[i]["id"] for i in samples]}
    p.write(path / "coverage-audit.json", summary)
    p.write(path / "quality-review-packet.json", {"summary": summary, "samples": [rows[i] for i in samples],
             "risk_pages": [{k: v for k, v in row.items() if k not in {"arabic", "english"}}
                            for row in rows if row["flags"]]})
    with (path / "quality-review-queue.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "printed_page", "source_block", "flags", "glossary_forms_to_check", "uncertainties"])
        for row in rows:
            writer.writerow([row["id"], row["page_label"], row["page_sequence"], "; ".join(row["flags"]),
                             "; ".join(row["missing_glossary_forms"]), "; ".join(row["uncertainties"])])
    print(p.canonical({k: v for k, v in summary.items() if k not in {"missing", "sample_page_ids"}}))
    if args.require_complete and missing:
        raise ValueError(f"Incomplete: {len(missing)} requested pages are missing")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--job", required=True)
    parser.add_argument("--require-complete", action="store_true")
    arguments = parser.parse_args()
    try:
        audit(arguments)
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, f"Stopped: {error}\n")
