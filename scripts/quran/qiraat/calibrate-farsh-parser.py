#!/usr/bin/env python3
"""Measure the farsh parser against hand-checked batches.

For every hand item the parser's item for the same lemma is found, and the two
are compared on what matters downstream: how the twenty transmitters are split
between forms (and which are left unstated). Wording, labels and evidence
boundaries are ignored. The parser's clean items (no flags) and its flagged
ones are reported apart, because the clean number is the one that decides
whether unreviewed parser output can be trusted.

    python scripts/quran/qiraat/calibrate-farsh-parser.py [--show N] BATCH.checked.json ...
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
from farsh_items import Farsh, load_authorities, partition  # noqa: E402
from farsh_parser import fk  # noqa: E402


def stem(word: str) -> str:
    """A word without its conjunction, so that the hand's 'هي' and the parser's 'وهي' meet."""
    return word[1:] if word.startswith("و") and len(word) > 2 else word


def words(item: dict[str, Any]) -> frozenset[str]:
    return frozenset(stem(fk(w)) for w in item["lemma"].split())


def page_of(item: dict[str, Any]) -> int:
    return int(item["witness"]["page"])


def find(item: dict[str, Any], pool: list[tuple[set[str], dict[str, Any]]], used: set[int]):
    """The first unused parser item on the same or the next page whose lemma contains the hand lemma, or is contained in it."""
    mine = words(item)
    for flags, other in pool:
        if id(other) in used or abs(page_of(other) - page_of(item)) > 1:
            continue
        theirs = words(other)
        if mine <= theirs or theirs <= mine:
            # a lemma of one word may sit in several parser items; prefer the one that also shares the verse's sura
            return flags, other
    return None


def describe(item: dict[str, Any], authorities: dict[str, Any]) -> str:
    named, unstated = partition(item, authorities)
    groups = sorted(sorted(g) for g in named)
    return f"{groups} unstated={sorted(unstated)}"


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("batches", nargs="+", type=Path)
    parser.add_argument("--show", type=int, default=25, help="how many disagreements to print")
    args = parser.parse_args()

    authorities = load_authorities()
    farsh = Farsh(authorities)
    hand: list[dict[str, Any]] = []
    pages: list[tuple[int, int]] = []
    for path in args.batches:
        batch = json.loads(path.read_text(encoding="utf-8"))
        hand.extend(batch["items"])
        pages.append((int(batch["pages"]["from"]), int(batch["pages"]["to"])))

    parsed: list[tuple[set[str], dict[str, Any]]] = []
    for first, last in pages:
        for flags, items in farsh.shadow(str(first), str(last)):
            parsed.extend((flags, item) for item in items)
    used: set[int] = set()

    stats = defaultdict(int)
    shown = 0
    problems: list[str] = []
    for item in hand:
        found = find(item, parsed, used)
        if found is None:
            stats["missing"] += 1
            problems.append(f"MISSING  {item['id']} {item['lemma']}  (hand verse {item['verse']})")
            continue
        flags, mine = found
        used.add(id(mine))
        same = partition(mine, authorities) == partition(item, authorities)
        clean = not flags
        stats["clean" if clean else "flagged"] += 1
        stats[("clean" if clean else "flagged") + ("_match" if same else "_differ")] += 1
        hand_verse = item.get("anchor", {}).get("verse")
        if hand_verse is not None and words(item) == words(mine) and str(hand_verse) != mine["verse"].split(":")[1]:
            stats["verse_differ"] += 1
            problems.append(f"VERSE    {item['id']} {item['lemma']}  hand {item['verse']} anchor {hand_verse}  parser {mine['verse']} flags={sorted(flags)} scope={mine['scope']}")
        else:
            stats["verse_match"] += 1
        if not same:
            problems.append(f"DIFFER   {item['id']} {item['lemma']} flags={sorted(flags)}\n"
                            f"    hand:   {describe(item, authorities)}\n    parser: {describe(mine, authorities)}")
    extras = [(f, i) for f, i in parsed if id(i) not in used]
    for flags, item in extras:
        stats["clean_extra" if not flags else "flagged_extra"] += 1
        problems.append(f"EXTRA    {item['id'] or item['witness']['page']} {item['lemma']} flags={sorted(flags)}")

    total = len(hand)
    print(f"hand items {total}   parser items {len(parsed)} ({sum(1 for f, _ in parsed if not f)} clean)")
    print(f"missing (parser produced nothing for the lemma): {stats['missing']}")
    print(f"clean:   {stats['clean']:3d} compared, {stats['clean_match']:3d} same partition, {stats['clean_differ']:3d} different")
    print(f"flagged: {stats['flagged']:3d} compared, {stats['flagged_match']:3d} same partition, {stats['flagged_differ']:3d} different")
    print(f"verse: {stats['verse_match']} same, {stats['verse_differ']} different (where the hand anchor exists)")
    print(f"parser items with no hand counterpart: clean {stats['clean_extra']}, flagged {stats['flagged_extra']}")
    for line in problems[: args.show]:
        print(line)
    if len(problems) > args.show:
        print(f"... {len(problems) - args.show} more")
    return 0


if __name__ == "__main__":
    sys.exit(main())
