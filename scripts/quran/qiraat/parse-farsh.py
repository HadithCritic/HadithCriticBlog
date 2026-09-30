#!/usr/bin/env python3
"""Parse the word-by-word section of Taḥbīr at-Taysīr into a verifiable batch.

    python scripts/quran/qiraat/parse-farsh.py --from 282 --to 287 --out FILE

Writes FILE (a batch in the format verify-farsh-items.py reads: parsed items and
the stretches nothing accounts for) and FILE with `.exceptions.json` beside it
(units the parser would not decide, each with its flags). Nothing is written to
the folder the site build reads.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from farsh_items import Farsh, load_authorities  # noqa: E402


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--from", dest="first", required=True)
    parser.add_argument("--to", dest="last", required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    farsh = Farsh(load_authorities())
    parsed = farsh.cut(args.first, args.last)
    batch = {
        "schema": "qiraat-farsh-batch/0.1", "book_id": "5556", "parser": "farsh_parser/0.1",
        "pages": {"volume": "1", "from": args.first, "to": args.last},
        "items": parsed.items, "skipped": parsed.skipped,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(batch, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    exceptions = args.out.with_suffix(".exceptions.json")
    exceptions.write_text(json.dumps(parsed.exceptions, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    flags = Counter(f for x in parsed.exceptions for f in x["flags"])
    print(f"units {parsed.units}  items {len(parsed.items)}  exceptions {len(parsed.exceptions)}  gaps {len(parsed.skipped)}")
    print("flags:", dict(flags.most_common()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
