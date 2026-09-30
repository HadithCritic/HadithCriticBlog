#!/usr/bin/env python3
"""Run the whole qirāʾāt chain and write the per-sura index.

    1. verify every farsh batch (exact evidence, readers, anchors, coverage)
    2. assemble checked batches into claims/farsh-sura-NNN.json
    3. verify each sura's claims and resolve "the rest"
    4. build src/data/qiraat/sura-NNN.json for the site
    5. write src/data/qiraat/index.json (counts per sura, coverage of pages)

Sura 1 keeps its hand-made five-book pilot and is rebuilt from it. Any failure
stops the run with the failing command's output.

    python scripts/quran/qiraat/build-qiraat.py [--skip-verify-batches]
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qiraat_lib as lib  # noqa: E402

HERE = Path(__file__).resolve().parent
FARSH = lib.QIRAAT_DIR / "farsh"
CLAIMS = lib.QIRAAT_DIR / "claims"
OUT = lib.REPO / "src" / "data" / "qiraat"


def run(script: str, *args: str) -> str:
    result = subprocess.run([sys.executable, str(HERE / script), *args], capture_output=True, text=True,
                            encoding="utf-8", env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"})
    if result.returncode != 0:
        raise SystemExit(f"{script} {' '.join(args)} failed ({result.returncode}):\n{result.stdout}{result.stderr}")
    return result.stdout


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--skip-verify-batches", action="store_true")
    args = parser.parse_args()

    batches = sorted(p for p in FARSH.rglob("batch-*.json") if not p.name.endswith(".checked.json"))
    ranges = []
    for path in batches:
        if not args.skip_verify_batches:
            print(run("verify-farsh-items.py", "--batch", str(path), "--write").splitlines()[0])
        header = json.loads(path.read_text(encoding="utf-8"))
        if header.get("coverage") == "supplement":
            continue  # enters deferred statements from pages another batch already accounts for
        ranges.append({"batch": path.name, "book_id": header["book_id"], **header["pages"],
                       "items": len(header["items"]), "skipped": len(header.get("skipped", []))})

    print(run("assemble-farsh.py").splitlines()[-1])
    claim_suras = sorted(int(p.stem.rsplit("-", 1)[1]) for p in CLAIMS.glob("farsh-sura-*.json")
                         if p.suffixes == [".json"] and p.name.count(".") == 1)
    suras = [1] + [n for n in claim_suras if n > 0]  # sura 0 holds the general rules, built below
    OUT.mkdir(parents=True, exist_ok=True)
    index: dict[int, dict] = {}
    for sura in suras:
        stem = "sura-001" if sura == 1 else f"farsh-sura-{sura:03d}"
        run("verify-qiraat-claims.py", "--claims", str(CLAIMS / f"{stem}.json"), "--strict", "--write", "--no-matrix")
        run("build-display-data.py", "--sura", str(sura), "--out", str(OUT / f"sura-{sura:03d}.json"))
        data = json.loads((OUT / f"sura-{sura:03d}.json").read_text(encoding="utf-8"))
        status = Counter(f["anchor_status"] or "pilot" for f in data["features"])
        kinds = Counter(g["kind"] for f in data["features"] for g in f["groups"])
        index[sura] = {"sura": sura, "positions": len(data["features"]), "claims": data["counts"]["claims"],
                       "verses": data["counts"]["verses"], "books": [b["book_id"] for b in data["books"]],
                       "anchors": dict(status), "group_kinds": dict(kinds)}
        print(f"sura {sura:3d}: {index[sura]['positions']:4d} positions  {index[sura]['claims']:4d} claims  anchors {dict(status)}")
    rules_summary = None
    if 0 in claim_suras:
        run("verify-qiraat-claims.py", "--claims", str(CLAIMS / "farsh-sura-000.json"), "--strict", "--write", "--no-matrix")
        print(run("build-rules-data.py").strip().splitlines()[-1])
        rules = json.loads((OUT / "rules.json").read_text(encoding="utf-8"))
        rules_summary = rules["counts"]
    print(run("build-silent-suras.py").strip().splitlines()[-1])
    summary = {
        "generator": "scripts/quran/qiraat/build-qiraat.py",
        "suras_with_data": len(index), "positions": sum(v["positions"] for v in index.values()),
        "claims": sum(v["claims"] for v in index.values()),
        "rules": rules_summary,
        "batches": ranges, "suras": [index[k] for k in sorted(index)],
    }
    (OUT / "index.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"index: {summary['suras_with_data']} suras, {summary['positions']} positions, {summary['claims']} claims")
    return 0


if __name__ == "__main__":
    sys.exit(main())
