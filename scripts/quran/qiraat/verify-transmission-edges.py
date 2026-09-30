#!/usr/bin/env python3
"""Verify transmission edges ("X read on Y") against cached Shamela pages.

An edge is accepted only if its evidence is an exact substring of the cited
page (diacritics and tatweel removed, whitespace runs read as one space) and
both the student span and the teacher span sit inside that evidence. The
matching rules are the ones verify-qiraat-claims.py uses; this script imports
them so the two cannot drift.

Input JSON:

    {
      "persons": { "<id>": { "latin": "...", "ar": "...", "role": "prophet|companion|successor|qari|riwaya|other" } },
      "edges": [ { "id": "...", "student": "<id>", "teacher": "<id>",
                   "witness": { "book_id": "22642", "volume": "1", "page": "178", "page_end": "179" },
                   "evidence": "...", "student_span": "...", "teacher_span": "...", "note": "..." } ]
    }

    python scripts/quran/qiraat/verify-transmission-edges.py --edges FILE [--write OUT]
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROLES = {"prophet", "companion", "successor", "qari", "riwaya", "other"}


def load_matcher() -> Any:
    spec = importlib.util.spec_from_file_location("verify_qiraat_claims", HERE / "verify-qiraat-claims.py")
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


def find_cycle(edges: list[dict[str, Any]]) -> list[str] | None:
    """Return one cycle in the student -> teacher graph, if any."""
    teachers: dict[str, list[str]] = {}
    for edge in edges:
        teachers.setdefault(edge["student"], []).append(edge["teacher"])
    state: dict[str, int] = {}
    stack: list[str] = []

    def visit(node: str) -> list[str] | None:
        state[node] = 1
        stack.append(node)
        for nxt in teachers.get(node, []):
            if state.get(nxt) == 1:
                return stack[stack.index(nxt):] + [nxt]
            if state.get(nxt) is None:
                found = visit(nxt)
                if found:
                    return found
        stack.pop()
        state[node] = 2
        return None

    for node in list(teachers):
        if state.get(node) is None:
            found = visit(node)
            if found:
                return found
    return None


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--edges", type=Path, required=True)
    parser.add_argument("--write", type=Path, help="write the verified edges (with raw slices) here")
    args = parser.parse_args()

    matcher = load_matcher()
    data = json.loads(args.edges.read_text(encoding="utf-8"))
    persons: dict[str, dict[str, Any]] = data["persons"]
    books: dict[str, Any] = {}
    errors: list[str] = []
    verified: list[dict[str, Any]] = []
    seen: set[str] = set()

    for person_id, person in persons.items():
        if person.get("role") not in ROLES:
            errors.append(f"person {person_id}: role must be one of {sorted(ROLES)}")
        if not person.get("latin") or not person.get("ar"):
            errors.append(f"person {person_id}: needs latin and ar")

    for edge in data["edges"]:
        eid = edge.get("id", "?")
        if eid in seen:
            errors.append(f"{eid}: duplicate edge id")
        seen.add(eid)
        for key in ("student", "teacher"):
            if edge.get(key) not in persons:
                errors.append(f"{eid}: unknown {key} {edge.get(key)!r}")
        if edge.get("student") == edge.get("teacher"):
            errors.append(f"{eid}: student and teacher are the same person")
        witness = edge["witness"]
        if witness["book_id"] not in books:
            books[witness["book_id"]] = matcher.Book(witness["book_id"])
        try:
            located = matcher.locate_evidence(books[witness["book_id"]], witness, edge["evidence"], edge.get("occurrence", 1))
        except KeyError as error:
            errors.append(f"{eid}: {error.args[0]}")
            continue
        if not located["ok"]:
            errors.append(f"{eid}: {located['reason']}")
            continue
        for key in ("student_span", "teacher_span"):
            span = matcher.normalize(edge.get(key, ""))
            if not span or span not in located["normalized"]:
                errors.append(f"{eid}: {key} not inside evidence: {edge.get(key)}")
        done = dict(edge)
        done.update({
            "evidence_normalized": located["normalized"],
            "evidence_raw": located["raw"],
            "page_start": located["page_start"],
            "page_end": located["page_end"],
            "cited_pages": located["cited_pages"],
            "review_state": edge.get("review_state", "proposed"),
        })
        verified.append(done)

    cycle = find_cycle(data["edges"])
    if cycle:
        errors.append("cycle in the transmission graph: " + " > ".join(cycle))

    print(f"persons: {len(persons)}  edges: {len(data['edges'])}  verified: {len(verified)}  errors: {len(errors)}")
    for message in errors:
        print("  error:", message)
    if errors:
        return 1
    if args.write:
        out = {"persons": persons, "edges": verified}
        args.write.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"wrote {args.write}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
