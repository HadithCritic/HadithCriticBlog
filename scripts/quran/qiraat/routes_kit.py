"""Authoring helpers for the route layer: narrators below the twenty transmitters and what each reads.

A route item is one passage of a book about one Taḥbīr position, read by hand:

    R = RouteBatch("an-nashr-2")
    R.item("22642", "2", "219", "f-002-098-02",
           ["واختلف عن قنبل", "كالباقين،"],
           [E("ابن مجاهد", "qunbul", "بهمزة بعدها ياء كالباقين", value=3),
            E("ابن شنبوذ", "qunbul", "بهمزة من غير ياء", value=2)])
    R.save()

`E(narrator, under, form)` says: the narrator, named as printed, reports that `under` (one of the twenty transmitters, or a
qāriʾ) reads `form`, a snippet of the passage. `value` is the number of the Taḥbīr reading the form equals, when it does.
Everything is a snippet of the printed page; `verify-routes.py` cuts the exact text out and refuses what is not there.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import qiraat_lib as lib

ROUTES_DIR = lib.QIRAAT_DIR / "routes"


def E(narrator: str, under: str, form: str, value: int | None = None, kind: str = "reads") -> dict[str, Any]:
    out: dict[str, Any] = {"narrator": narrator, "under": under, "form": form, "kind": kind}
    if value is not None:
        out["value_of"] = value
    return out


class RouteBatch:
    def __init__(self, name: str) -> None:
        self.name = name
        self.items: list[dict[str, Any]] = []

    def item(self, book_id: str, volume: str, page: str, feature: str, ev: Any, entries: list[dict[str, Any]],
             page_end: str | None = None, note: str | None = None) -> str:
        ident = f"rt-{self.name}-{len(self.items) + 1:03d}"
        out: dict[str, Any] = {"id": ident, "book_id": book_id, "volume": volume, "page": page, "feature": feature,
                               "ev": ev, "entries": entries}
        if page_end:
            out["page_end"] = page_end
        if note:
            out["note"] = note
        self.items.append(out)
        return ident

    def save(self) -> str:
        ROUTES_DIR.mkdir(parents=True, exist_ok=True)
        path = ROUTES_DIR / f"routes-{self.name}.json"
        path.write_text(json.dumps({"schema": "qiraat-routes/0.1", "items": self.items}, ensure_ascii=False, indent=1) + "\n",
                        encoding="utf-8")
        return str(path)
