#!/usr/bin/env python3
"""Run every query in placement-queries.json and write the hits for reading.

Output: scratch/fiqh-compass/placement-hits.json (ignored by git). Each query
keeps up to four hits with volume, page, serial and the original excerpt, so a
placement is written from a passage that was read, never from memory alone.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from shamela_book import search  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
QUERIES = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent / "placement-queries.json"
OUT = ROOT / "scratch" / "fiqh-compass" / (Path(sys.argv[1]).stem.replace("queries", "hits") + ".json" if len(sys.argv) > 1 else "placement-hits.json")


def main() -> int:
    queries = json.loads(QUERIES.read_text(encoding="utf-8"))
    results = []
    for q in queries:
        hits = search(q["book"], q["pattern"], context=240, limit=4)
        results.append({**q, "hits": hits})
        print(f"{q['figure']:12} {q['axis']} {q['book']:>6}: {len(hits)} hit(s)", flush=True)
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
