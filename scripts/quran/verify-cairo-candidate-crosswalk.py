#!/usr/bin/env python3
"""Check every candidate passage/token against the complete Cairo Arabic package."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cairo-package-dir", type=Path, required=True)
    ap.add_argument("--variant-package-dir", type=Path, required=True)
    args = ap.parse_args()
    catalog = json.loads((args.cairo_package_dir / "cairo-arabic-catalog.json").read_text(encoding="utf-8"))
    verse_map = {}
    word_by_url = {}
    for shard in catalog["shards"]:
        payload = json.loads((args.cairo_package_dir / shard["path"]).read_text(encoding="utf-8"))
        for verse in payload["records"]:
            verse_map[verse["verseNativeId"]] = verse
            for word in verse["words"]:
                word_by_url[word["sourceUrl"]] = word
    passages = json.loads((args.variant_package_dir / "variant-passages.json").read_text(encoding="utf-8"))["passages"]
    errors = []
    word_total = null_locators = 0
    for verse_id, candidate in passages.items():
        verse = verse_map.get(verse_id)
        if verse is None:
            errors.append(f"candidate verse missing from full Cairo source: {verse_id}")
            continue
        if candidate.get("exactText") != verse.get("exactText") or candidate.get("sourceUrl") != verse.get("verseSourceUrl"):
            errors.append(f"candidate verse text/locator mismatch: {verse_id}")
        for record in candidate.get("records", []):
            for row in record.get("words", []):
                word_total += 1
                url = row.get("targetSourceUrl")
                if not url:
                    null_locators += 1
                    continue
                word = word_by_url.get(url)
                if word is None:
                    errors.append(f"candidate Cairo token locator missing from full source: {verse_id} {url}")
                elif row.get("targetExactText") != word.get("exactText"):
                    errors.append(f"candidate Cairo token exact text mismatch: {verse_id} {url}")
    if len(passages) != 3492 or word_total != 34163:
        errors.append(f"unexpected candidate totals: {len(passages)} passages / {word_total} word links")
    print(json.dumps({"candidatePassages": len(passages), "candidateWordLinks": word_total,
                      "candidateRowsWithoutTargetUrl": null_locators, "errors": errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
