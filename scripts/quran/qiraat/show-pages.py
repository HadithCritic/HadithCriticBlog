#!/usr/bin/env python3
"""Print cached Shamela pages in the view the verifiers use.

Diacritics and tatweel are removed and whitespace runs collapse to one space.
Evidence copied from this output is an exact substring for the verifiers.

    python scripts/quran/qiraat/show-pages.py --book 5556 --from 282 --to 285
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qiraat_lib as lib  # noqa: E402


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--book", required=True)
    parser.add_argument("--from", dest="first", required=True, help="first page label")
    parser.add_argument("--to", dest="last", required=True, help="last page label")
    parser.add_argument("--volume", default=None)
    args = parser.parse_args()
    book = lib.load_book(args.book)
    first = book.index_of(args.first, args.volume)
    last = book.index_of(args.last, args.volume)
    for index in range(first, last + 1):
        page = book.pages[index]
        print(f"=== PAGE {page['page']} (volume {page['volume']}) ===")
        print(lib.normalize(page["text"] or ""))
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
