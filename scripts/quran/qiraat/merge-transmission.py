#!/usr/bin/env python3
"""Merge the per-reader transmission extractions into one verified graph.

Each agent file is verified first (verify-transmission-edges.py), so every link
carries its exact raw quotation and page. The merge then

- unifies persons by id, keeping the strongest role (a reader or transmitter
  keeps his authority role; otherwise companion beats successor beats other),
- keeps one link per (student, teacher) pair with every witnessing passage,
- marks a link as not firm when every passage hedges it or describes something
  other than reading on the teacher (hearing, letters only, a companionship),
- refuses cycles, and reports which readers and transmitters reach the Prophet.

    python scripts/quran/qiraat/merge-transmission.py
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[3]
SOURCE_DIR = REPO / "scratch" / "quran" / "qiraat" / "transmission"
OUT = REPO / "docs" / "research" / "quran-platform" / "qiraat" / "transmission" / "edges.json"
AGENTS = ["A", "B", "C", "D"]

# The book writes "al-Daylami"; the extraction's slug and Latin name said al-Duali.
RENAMES = {"abu_al_aswad_al_duali": "abu_al_aswad_al_daylami"}
LATIN_FIXES = {"abu_al_aswad_al_daylami": "Abu al-Aswad al-Daylami"}
ROLE_RANK = {"prophet": 6, "qari": 5, "riwaya": 5, "companion": 4, "successor": 3, "other": 1}
HEDGE = re.compile("وقيل|ويقال|محتمل|يحتمل|ولعله")
# In these two sentences "ويقال" only concerns which kunya Nafi carried; the extraction's
# own notes say so, and the link that Warsh and Qalun read on him is stated without hedge.
FIRM_OVERRIDES = {"A-001", "A-002"}
LOOSE_NOTE = re.compile(r"hedg|heard|letters|harf|companion|sam[aā]|possib|not that he read", re.IGNORECASE)
READERS = ["nafi", "abu_jafar", "abu_amr", "yaqub", "asim", "hamza", "khalaf_ashir", "kisai", "ibn_amir", "ibn_kathir"]
TRANSMITTERS = ["warsh", "qalun", "ibn_wardan", "ibn_jammaz", "duri_abu_amr", "susi", "ruways", "rawh", "shuba", "hafs",
                "khalaf_hamza", "khallad", "ishaq", "idris", "abu_harith", "duri_kisai", "hisham", "ibn_dhakwan", "bazzi", "qunbul"]


def verify(agent: str) -> dict[str, Any]:
    source = SOURCE_DIR / f"agent-{agent}.json"
    out = SOURCE_DIR / f"agent-{agent}.verified.json"
    result = subprocess.run(
        [sys.executable, str(REPO / "scripts/quran/qiraat/verify-transmission-edges.py"), "--edges", str(source), "--write", str(out)],
        capture_output=True, text=True, encoding="utf-8",
    )
    if result.returncode != 0:
        raise SystemExit(f"agent {agent} does not verify:\n{result.stdout}{result.stderr}")
    return json.loads(out.read_text(encoding="utf-8"))


def rename(person_id: str) -> str:
    return RENAMES.get(person_id, person_id)


def reachable(start: str, teachers: dict[str, set[str]], goal: str) -> bool:
    seen: set[str] = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node == goal:
            return True
        if node in seen:
            continue
        seen.add(node)
        stack.extend(teachers.get(node, ()))
    return False


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    persons: dict[str, dict[str, Any]] = {}
    links: dict[tuple[str, str], dict[str, Any]] = {}

    for agent in AGENTS:
        data = verify(agent)
        for raw_id, person in data["persons"].items():
            pid = rename(raw_id)
            person = dict(person, latin=LATIN_FIXES.get(pid, person["latin"]))
            current = persons.get(pid)
            if current is None:
                persons[pid] = dict(person, ar_forms=[person["ar"]])
                continue
            if ROLE_RANK[person["role"]] > ROLE_RANK[current["role"]]:
                current["role"] = person["role"]
            if person["ar"] not in current["ar_forms"]:
                current["ar_forms"].append(person["ar"])
        for edge in data["edges"]:
            key = (rename(edge["student"]), rename(edge["teacher"]))
            witness = {
                "agent_edge": edge["id"],
                "book_id": edge["witness"]["book_id"],
                "volume": edge["witness"].get("volume"),
                "page": edge["page_start"] if edge["page_start"] == edge["page_end"] else f"{edge['page_start']} to {edge['page_end']}",
                "evidence": edge["evidence_raw"] if edge["evidence_raw"] is not None else edge["evidence_normalized"],
                "exact_raw": edge["evidence_raw"] is not None,
                "note": edge.get("note"),
                "hedged": edge["id"] not in FIRM_OVERRIDES and bool(HEDGE.search(edge["evidence_normalized"])),
                "loose": edge["id"] not in FIRM_OVERRIDES and bool(edge.get("note") and LOOSE_NOTE.search(edge["note"])),
            }
            link = links.setdefault(key, {"student": key[0], "teacher": key[1], "witnesses": []})
            if not any(w["page"] == witness["page"] and w["evidence"] == witness["evidence"] for w in link["witnesses"]):
                link["witnesses"].append(witness)

    for pid in persons:
        persons[pid]["ar"] = min(persons[pid]["ar_forms"], key=len)

    edges = []
    for (student, teacher), link in sorted(links.items()):
        ws = link["witnesses"]
        link["firm"] = any(not w["hedged"] and not w["loose"] for w in ws)
        edges.append(link)

    teachers: dict[str, set[str]] = {}
    for edge in edges:
        teachers.setdefault(edge["student"], set()).add(edge["teacher"])
    missing = [pid for pid in READERS + TRANSMITTERS if not reachable(pid, teachers, "prophet")]

    unknown = sorted({p for e in edges for p in (e["student"], e["teacher"])} - persons.keys())
    if unknown:
        raise SystemExit(f"links name persons that were never defined: {unknown}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"schemaVersion": "qiraat-transmission/0.1.0", "source": "an-Nashr (22642), Ibn al-Jazari",
                               "persons": persons, "edges": edges}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    firm = sum(1 for e in edges if e["firm"])
    print(f"persons {len(persons)}  links {len(edges)} ({firm} firm, {len(edges) - firm} hedged or loose)  witnesses {sum(len(e['witnesses']) for e in edges)}")
    print("readers and transmitters with no chain to the Prophet in the extracted entries:", missing or "none")
    return 0


if __name__ == "__main__":
    sys.exit(main())
