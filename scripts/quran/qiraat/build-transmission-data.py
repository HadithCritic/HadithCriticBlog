#!/usr/bin/env python3
"""Lay out the merged transmission graph for the site.

Reads the verified, merged links (transmission/edges.json) and writes
src/data/quran-transmission.json: every person with a position, every link with
a drawn path and its quotations, and for each of the ten readers the set of
people and links in his lineage (his transmitters, himself, and everyone above
him up to the Prophet).

Layout is a small layered drawing, left to right. A person's column is the
length of the longest chain from the Prophet to him. A link that skips columns
is routed through invisible waypoints so it does not run through other people.
Order inside a column is improved by barycenter sweeps, then heights are
relaxed so linked people sit near each other.

    python scripts/quran/qiraat/build-transmission-data.py
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[3]
QIRAAT = REPO / "docs" / "research" / "quran-platform" / "qiraat"
SRC = QIRAAT / "transmission" / "edges.json"
OUT = REPO / "src" / "data" / "quran-transmission.json"

NODE_W, NODE_H, ROW_GAP, COL_W = 176, 46, 10, 250
DUMMY_H, DUMMY_GAP = 4, 6
PAD_X, PAD_TOP, PAD_BOTTOM = 24, 44, 24
SWEEPS = 16
LABEL_MAX = 25


def presentation_latin(text: str) -> str:
    """ASCII apostrophes to ʿ (inside a word) or ʾ (word end). Presentation only."""
    text = re.sub(r"(?<=\w)'(?=\W|$)", "ʾ", text)
    return text.replace("'", "ʿ")


def label_lines(text: str) -> list[str]:
    """Up to two lines of at most LABEL_MAX characters, broken at a space."""
    text = re.sub(r"\s*\(.*?\)", "", text).strip()
    if len(text) <= LABEL_MAX:
        return [text]
    cut = text.rfind(" ", 0, LABEL_MAX + 1)
    first, rest = (text[:cut], text[cut + 1:]) if cut > 0 else (text[:LABEL_MAX], text[LABEL_MAX:])
    if len(rest) > LABEL_MAX:
        rest = rest[: LABEL_MAX - 1].rstrip() + "…"
    return [first, rest]


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    graph = json.loads(SRC.read_text(encoding="utf-8"))
    auth = json.loads((QIRAAT / "authorities.json").read_text(encoding="utf-8"))
    readers = [q["id"] for q in auth["qaris"]]
    qari_of = {r: q["id"] for q in auth["qaris"] for r in q["riwayat"]}
    shade_of = {r: i for q in auth["qaris"] for i, r in enumerate(q["riwayat"])}
    display = {x["id"]: x for x in auth["qaris"] + auth["riwayat"]}

    persons: dict[str, dict[str, Any]] = graph["persons"]
    edges: list[dict[str, Any]] = graph["edges"]
    teachers: dict[str, list[str]] = defaultdict(list)
    students: dict[str, list[str]] = defaultdict(list)
    for edge in edges:
        teachers[edge["student"]].append(edge["teacher"])
        students[edge["teacher"]].append(edge["student"])

    # 1. Columns: longest chain from the Prophet.
    layer: dict[str, int] = {"prophet": 0}

    def column(pid: str, trail: tuple[str, ...] = ()) -> int:
        if pid in layer:
            return layer[pid]
        if pid in trail:
            raise SystemExit("cycle: " + " > ".join(trail + (pid,)))
        layer[pid] = 1 + max((column(t, trail + (pid,)) for t in teachers[pid]), default=0)
        return layer[pid]

    for pid in persons:
        column(pid)
    last = max(layer.values())

    # 2. Waypoints for links that skip columns.
    nodes: dict[str, dict[str, Any]] = {pid: {"layer": layer[pid], "real": True} for pid in persons}
    routes: list[list[str]] = []
    for index, edge in enumerate(edges):
        a, b = layer[edge["teacher"]], layer[edge["student"]]
        chain = [edge["teacher"]]
        for k in range(a + 1, b):
            wid = f"~{index}:{k}"
            nodes[wid] = {"layer": k, "real": False}
            chain.append(wid)
        chain.append(edge["student"])
        routes.append(chain)
    succ: dict[str, list[str]] = defaultdict(list)
    pred: dict[str, list[str]] = defaultdict(list)
    for chain in routes:
        for u, v in zip(chain, chain[1:]):
            succ[u].append(v)
            pred[v].append(u)

    # 3. Order: depth-first from the Prophet keeps kin together, then barycenter sweeps.
    seen: list[str] = []
    order_hint = {r: i for i, r in enumerate(readers)}

    def walk(pid: str) -> None:
        if pid in seen:
            return
        seen.append(pid)
        for s in sorted(students[pid], key=lambda x: (order_hint.get(qari_of.get(x, x), 99), x)):
            walk(s)

    walk("prophet")
    for pid in persons:
        walk(pid)
    columns: dict[int, list[str]] = defaultdict(list)
    for pid in seen:
        columns[layer[pid]].append(pid)
    for wid, meta in nodes.items():
        if not meta["real"]:
            columns[meta["layer"]].append(wid)
    pos = {n: i for c in columns.values() for i, n in enumerate(c)}

    def sweep(cols: range, neighbours: dict[str, list[str]]) -> None:
        for k in cols:
            def bary(n: str) -> float:
                ns = neighbours.get(n)
                return sum(pos[x] for x in ns) / len(ns) if ns else pos[n]
            columns[k].sort(key=bary)
            for i, n in enumerate(columns[k]):
                pos[n] = i

    for _ in range(SWEEPS):
        sweep(range(1, last + 1), pred)
        sweep(range(last - 1, -1, -1), succ)

    # 4. Heights: stack, then relax toward neighbours without overlapping.
    def height(n: str) -> int:
        return NODE_H if nodes[n]["real"] else DUMMY_H

    def gap(a: str, b: str) -> int:
        return ROW_GAP if nodes[a]["real"] and nodes[b]["real"] else DUMMY_GAP

    y: dict[str, float] = {}
    for k in range(last + 1):
        cursor = 0.0
        for i, n in enumerate(columns[k]):
            if i:
                cursor += gap(columns[k][i - 1], n)
            y[n] = cursor + height(n) / 2
            cursor += height(n)

    def relax(k: int, neighbours: dict[str, list[str]]) -> None:
        col = columns[k]
        want = {n: (sum(y[x] for x in neighbours[n]) / len(neighbours[n]) if neighbours.get(n) else y[n]) for n in col}
        down = {}
        prev = None
        for n in col:
            floor = -1e9 if prev is None else down[prev] + height(prev) / 2 + gap(prev, n) + height(n) / 2
            down[n] = max(want[n], floor)
            prev = n
        up = {}
        nxt = None
        for n in reversed(col):
            ceil = 1e9 if nxt is None else up[nxt] - height(nxt) / 2 - gap(n, nxt) - height(n) / 2
            up[n] = min(want[n], ceil)
            nxt = n
        for n in col:
            y[n] = (down[n] + up[n]) / 2
        # The average of the two passes can still touch; push down once more.
        prev = None
        for n in col:
            if prev is not None:
                y[n] = max(y[n], y[prev] + height(prev) / 2 + gap(prev, n) + height(n) / 2)
            prev = n

    for _ in range(8):
        for k in range(1, last + 1):
            relax(k, pred)
        for k in range(last - 1, -1, -1):
            relax(k, succ)
    top = min(y[n] - height(n) / 2 for n in nodes)
    for n in y:
        y[n] += PAD_TOP - top
    bottom = max(y[n] + height(n) / 2 for n in nodes) + PAD_BOTTOM
    width = PAD_X * 2 + last * COL_W + NODE_W

    def x_left(n: str) -> float:
        return PAD_X + nodes[n]["layer"] * COL_W

    # 5. Lineages.
    def ancestors(pid: str) -> set[str]:
        out: set[str] = set()
        stack = [pid]
        while stack:
            for t in teachers[stack.pop()]:
                if t not in out:
                    out.add(t)
                    stack.append(t)
        return out

    lineage: dict[str, set[str]] = {}
    for q in auth["qaris"]:
        lineage[q["id"]] = {q["id"], *q["riwayat"], *ancestors(q["id"])}
    used_by: dict[str, set[str]] = defaultdict(set)
    for r, members in lineage.items():
        for m in members:
            used_by[m].add(r)

    # 6. Output.
    out_persons = []
    for pid, person in persons.items():
        kind = "prophet" if pid == "prophet" else "qari" if pid in readers else "riwaya" if pid in qari_of else "other"
        latin = display[pid]["display"] if pid in display else presentation_latin(person["latin"])
        lone = sorted(used_by[pid]) if kind == "other" and len(used_by[pid]) == 1 else []
        out_persons.append({
            "id": pid, "kind": kind, "latin": latin, "lines": label_lines(latin),
            "ar": display[pid]["name_ar"] if pid in display else person["ar"],
            "ar_full": person["ar"], "layer": layer[pid],
            "q": pid if kind == "qari" else qari_of.get(pid) if kind == "riwaya" else (lone[0] if lone else None),
            "shade": shade_of.get(pid), "x": round(x_left(pid), 1), "y": round(y[pid] - NODE_H / 2, 1),
            "lineages": sorted(used_by[pid]),
        })

    out_edges = []
    for index, (edge, chain) in enumerate(zip(edges, routes)):
        pts = []
        for n in chain:
            if nodes[n]["real"]:
                pts.append((x_left(n), x_left(n) + NODE_W, y[n]))
            else:
                pts.append((x_left(n) + NODE_W / 2, x_left(n) + NODE_W / 2, y[n]))
        d = f"M{pts[0][1]:.1f},{pts[0][2]:.1f}"
        for (_, x1, y1), (x2, _, y2) in zip(pts, pts[1:]):
            mid = (x2 - x1) / 2
            d += f" C{x1 + mid:.1f},{y1:.1f} {x2 - mid:.1f},{y2:.1f} {x2:.1f},{y2:.1f}"
        in_lineages = sorted(r for r, members in lineage.items() if edge["student"] in members)
        sole = in_lineages[0] if len(in_lineages) == 1 else None
        out_edges.append({
            "id": f"l{index + 1}", "student": edge["student"], "teacher": edge["teacher"], "firm": edge["firm"],
            "d": d, "lineages": in_lineages, "q": sole,
            "witnesses": [{
                "book_id": w["book_id"], "volume": w["volume"], "page": w["page"], "quote": w["evidence"],
                "exact_raw": w["exact_raw"], "note": w["note"], "hedged": w["hedged"],
            } for w in edge["witnesses"]],
        })

    data = {
        "schemaVersion": "qiraat-transmission-display/0.1.0",
        "source": {"book_id": "22642", "title": "an-Nashr fī l-qirāʾāt al-ʿashr", "author": "Ibn al-Jazarī"},
        "width": round(width), "height": round(bottom), "node": {"w": NODE_W, "h": NODE_H}, "columns": last + 1,
        "col_x": [round(PAD_X + k * COL_W, 1) for k in range(last + 1)],
        "counts": {"persons": len(out_persons), "links": len(out_edges), "firm": sum(1 for e in out_edges if e["firm"])},
        "readers": [{"id": q["id"], "display": q["display"], "name_ar": q["name_ar"], "riwayat": q["riwayat"]} for q in auth["qaris"]],
        "persons": out_persons, "edges": out_edges,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(REPO)}: {len(out_persons)} people, {len(out_edges)} links, {last + 1} columns, {round(width)} x {round(bottom)} px, {OUT.stat().st_size // 1024} KB")
    per_col = [len([p for p in out_persons if p['layer'] == k]) for k in range(last + 1)]
    print("people per column:", per_col)
    return 0


if __name__ == "__main__":
    sys.exit(main())
