"""Build the Fiqh Compass figure dataset the quiz compares a reader against.

Reads the authored placements in data/fiqh-compass/figure-placements.json and
writes src/data/fiqh-compass-figures.json. Every quote_ar must appear verbatim
in the Shamela excerpt saved for that serial by run-placement-queries.py
(scratch/fiqh-compass/placement-hits*.json); a placement whose quote is not
found stops the build rather than shipping wording the source does not carry.

    python scripts/fiqh-compass/build-figures.py
"""

from __future__ import annotations

import json
import unicodedata
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLACEMENTS = ROOT / "data" / "fiqh-compass" / "figure-placements.json"
HITS = [ROOT / "scratch" / "fiqh-compass" / name for name in ("placement-hits.json", "placement-hits-2.json")]
OUT = ROOT / "src" / "data" / "fiqh-compass-figures.json"
AXES = {f"A{n:02d}" for n in range(1, 13)}
KINDS = {"own", "report", "editor"}


def excerpts_by_serial() -> dict[str, list[str]]:
    found: dict[str, list[str]] = {}
    for path in HITS:
        for group in json.loads(path.read_text(encoding="utf-8")):
            for hit in group["hits"]:
                found.setdefault(str(hit["serial"]), []).append(hit["excerpt"])
    return found


def clusters(text: str) -> list[str]:
    """Split into base letters with their marks, each mark run in canonical order.

    Shamela often stores shadda before the vowel it carries, which is the same
    text as the canonical order but not the same string.
    """
    out: list[str] = []
    for ch in text:
        if out and unicodedata.combining(ch):
            out[-1] += ch
        else:
            out.append(ch)
    return [unicodedata.normalize("NFC", c) for c in out]


def source_wording(quote: str, excerpt: str) -> str | None:
    """The excerpt's own characters for quote, or None when it does not carry it."""
    want, have = clusters(quote), clusters(excerpt)
    raw: list[str] = []
    for ch in excerpt:
        if raw and unicodedata.combining(ch):
            raw[-1] += ch
        else:
            raw.append(ch)
    for start in range(len(have) - len(want) + 1):
        if have[start:start + len(want)] == want:
            return "".join(raw[start:start + len(want)])
    return None


def problems_in(data: dict, excerpts: dict[str, list[str]]) -> list[str]:
    figures = {f["id"] for f in data["figures"]}
    problems = []
    for i, p in enumerate(data["placements"]):
        where = f"placement {i} ({p['figure']} {p['axis']})"
        if p["figure"] not in figures:
            problems.append(f"{where}: unknown figure")
        if p["axis"] not in AXES:
            problems.append(f"{where}: unknown axis")
        if p["kind"] not in KINDS:
            problems.append(f"{where}: unknown kind {p['kind']}")
        if p["kind"] == "report" and not p.get("by"):
            problems.append(f"{where}: a report must name who reports it")
        if not -1 <= p["position"] <= 1:
            problems.append(f"{where}: position outside -1..1")
        if p["book"] not in data["books"]:
            problems.append(f"{where}: book {p['book']} has no title")
        wording = next(
            (w for ex in excerpts.get(p["serial"], []) if (w := source_wording(p["quote_ar"], ex))),
            None,
        )
        if wording is None:
            problems.append(f"{where}: quote not found in serial {p['serial']}")
        else:
            p["quote_ar"] = wording
    return problems


def main() -> int:
    data = json.loads(PLACEMENTS.read_text(encoding="utf-8"))
    problems = problems_in(data, excerpts_by_serial())
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 1
    placed = {p["figure"] for p in data["placements"]}
    out = {
        "about": data["about"],
        "books": data["books"],
        "figures": [f for f in data["figures"] if f["id"] in placed],
        "placements": data["placements"],
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(out['placements'])} placements, {len(out['figures'])} figures -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
