"""Join a preserved translation prefix to a complete, audited continuation."""
import argparse
from pathlib import Path
import re
from collections import Counter

import audit_translation
import pipeline as p


def format_reports(row):
    expected = Counter(int(m.group(1)) for m in re.finditer(
        r"(?<!\d)([٠-٩]{3,4})\s*-\s", row.get("arabic", "")))
    if not expected:
        return row["english"]
    numbers = "|".join(map(str, sorted(expected, reverse=True)))
    pattern = re.compile(r"(?<![\w\d])(?:\*\*)?(" + numbers +
                         r")(?:\.\*\*|\*\*\s*[—–-]?|\.[ \t]*|[ \t]+[—–-])[ \t]*")
    observed = Counter(int(m.group(1)) for m in pattern.finditer(row["english"]))
    if observed != expected:
        raise ValueError(f"Report-number markers need inspection: {row.get('id')}: {expected} / {observed}")
    return pattern.sub(lambda m: "**" + m.group(1) + ".** ", row["english"])


def merge(prefix, passages):
    """Keep the original bytes, including its BOM and line endings, untouched."""
    continuation = "\n\n---\n\n<!-- Codex continuation; original translation above preserved byte for byte. -->\n\n"
    continuation += "\n\n".join(format_reports(row).strip() for row in passages) + "\n"
    return prefix + continuation.encode("utf-8")


def finish(args):
    path, job = p.load_job(args)
    provenance = p.read(path / "continuation-provenance.json")
    if provenance["job_hash"] != job["job_hash"]:
        raise ValueError("Continuation provenance refers to a different job")
    prefix = Path(provenance["english_prefix_path"]).read_bytes()
    if p.digest(prefix) != provenance["english_prefix_sha256"]:
        raise ValueError("Existing English translation changed since preparation")
    if Path(provenance["english_prefix_snapshot_path"]).read_bytes() != prefix:
        raise ValueError("Original English snapshot differs from the supplied translation")
    # A missing checkpoint or changed source must prevent a complete-book export.
    args.require_complete = True
    audit_translation.audit(args)
    revisions = p.load_revisions(path, job)
    if len(revisions) != len(job["requests"]):
        raise ValueError("Every continuation block must pass Arabic comparison before assembly")
    p.export(args)
    release = p.read(path / "export/bilingual.json")
    prepared = p.jsonl(Path(args.workspace) / "books" / job["book_id"] / "units.jsonl")
    expected = [provenance["first_unit_id"]] + [u["id"] for u in prepared
                if u["start"] >= provenance["first_unit_end"]]
    if [r["id"] for r in release["passages"]] != expected:
        raise ValueError("Continuation does not cover every remaining prepared source unit")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    combined = merge(prefix, release["passages"])
    (output / "English.md").write_bytes(combined)
    assert combined[:len(prefix)] == prefix
    for source, target in [("review.html", "Continuation - Arabic and English.html"),
                           ("bilingual.json", "Continuation - Bilingual.json"),
                           ("review-queue.csv", "Continuation - Review queue.csv")]:
        (output / target).write_bytes((path / "export" / source).read_bytes())
    for source in ["coverage-audit.json", "continuation-provenance.json", "primary-review-decisions.json"]:
        if (path / source).exists():
            (output / source).write_bytes((path / source).read_bytes())
    if (path / "report-marker-audit.json").exists():
        (output / "report-marker-audit.json").write_bytes((path / "report-marker-audit.json").read_bytes())
    nums = [int(m.group(1)) for row in release["passages"]
            for m in re.finditer(r"\*\*(\d+)\.\*\*", format_reports(row))]
    p.write(output / "Completion record.json", {
        "job_hash": job["job_hash"], "arabic_sha256": job["source_file_sha256"],
        "prefix_sha256": p.digest(prefix), "prefix_bytes": len(prefix),
        "prefix_preserved_byte_for_byte": True,
        "continuation_units": len(expected), "source_coverage_to_end": True,
        "existing_prefix_not_retranslated_or_independently_certified": True,
        "continuation_human_review": False, "bold_report_numbers_emitted_in_continuation": nums,
        "english_sha256": p.digest(combined)})
    notes = ["# Futūḥ al-Buldān — complete English draft", "",
             "English.md preserves your updated supplied translation through report 535 byte for byte, then continues from report 536 through the supplied Arabic file’s closing words.", "",
             "The continuation is a Codex machine draft, with source-comparison status and uncertainties recorded in the coverage audit and review queue. Human scholarly review has not been performed. Existing OCR errors, repetitions and irregular report numbering are retained rather than silently repaired.", "",
             "The bilingual HTML and JSON cover the new continuation only. Your earlier translation has not been newly aligned or independently reviewed. Its original title and footnotes are preserved.", "",
             f"Continuation: {len(expected)} source blocks. Job: {args.job}.", "",
             "Nothing has been published to the website. Raw worker outputs and checkpoints remain in the active translation workspace.", ""]
    (output / "README.md").write_text("\n".join(notes), encoding="utf-8")
    p.write(output / "File checksums.json", {f.name: p.digest(f.read_bytes()) for f in output.iterdir()
                                            if f.is_file() and f.name != "File checksums.json"})
    print(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--job", required=True)
    parser.add_argument("--output", required=True)
    finish(parser.parse_args())
