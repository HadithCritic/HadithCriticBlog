#!/usr/bin/env python3
"""Hard-link identical assets that existing Quran releases store as separate copies.

Releases written before release_store.py existed hold a full copy of every
asset. This verifies each asset against its release.json and replaces later
duplicates with a hard link to the first copy. Paths and bytes do not change.

Usage:
  python scripts/quran/dedupe-releases.py [--data-dir public/data/quran] [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from release_store import dedupe_releases


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("public/data/quran"))
    parser.add_argument("--dry-run", action="store_true",
                        help="Report what would be linked without changing any file")
    args = parser.parse_args()
    releases_root = args.data_dir / "releases"
    if not releases_root.is_dir():
        parser.error(f"no releases directory at {releases_root}")
    report = dedupe_releases(releases_root, dry_run=args.dry_run)
    report["linkedGiB"] = round(report["linkedBytes"] / 1024 ** 3, 2)
    print(json.dumps(report, indent=2))
    return 1 if report["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
