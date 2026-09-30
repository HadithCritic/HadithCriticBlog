"""Helpers for writing a review file: compact items in the hand format, and a place to save them.

    from review_kit import *
    review = Review("288", "292")
    review.replace("u110348", item("288", ["نافع: (النبيين)", "والباقون بغير همز"], "النبيين", None, [...]))
    review.save()

A verse of None is filled with the first exact occurrence of the lemma in the Qur'an, which is what a word given
"wherever it occurs" is placed at. Give a verse for a word that is meant at one place.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import qiraat_lib as lib
from farsh_items import Farsh, load_authorities

REVIEWS = lib.QIRAAT_DIR / "farsh" / "reviews"
_farsh: Farsh | None = None


def farsh() -> Farsh:
    global _farsh
    if _farsh is None:
        _farsh = Farsh(load_authorities())
    return _farsh


def A(ident: str, snippet: str, basis: str | None = None, narrowed_from: str | None = None,
      identified_by: dict[str, Any] | None = None) -> list[Any]:
    """A reader entry. `narrowed_from` names the qari whose name the span carries, for a transmitter the
    same sentence sets apart from his sibling ("Ibn Amir, with a dispute about Hisham" enters Ibn Dhakwan)."""
    if identified_by:
        # The edition prints a misspelled or bare name (a dropped kunya, a bare epithet). A second book of the
        # same author names the reader in the same place; the verifier finds `quote` on that page.
        return ["a", ident, snippet, basis or "listing", narrowed_from, None, identified_by]
    if narrowed_from:
        return ["a", ident, snippet, basis or "listing", narrowed_from]
    return ["a", ident, snippet] + ([basis] if basis else [])


def C(ident: str, page: str, snippet: str, basis: str | None = None, page_end: str | None = None) -> list[Any]:
    """A reader named on an earlier page of the same chapter, for passages that continue with pronouns.

    `snippet` is cut from `page` (through `page_end`), not from the evidence.
    """
    return ["a", ident, snippet, basis or "listing", None, {"page": page, **({"page_end": page_end} if page_end else {})}]


def G(ident: str, snippet: str) -> list[str]:
    return ["g", ident, snippet]


def form(desc: str, readers: list[list[str]] | None = None, rest: str | None = None, basis: str | None = None) -> dict[str, Any]:
    out: dict[str, Any] = {"desc": desc, "readers": readers or []}
    if rest:
        out["rest"] = rest
    if basis:
        out["basis"] = basis
    return out


def first_verse(lemma: str) -> str:
    """sura:verse of the first exact occurrence of the lemma (or of the lemma without its conjunction)."""
    tries = [lemma] + ([lemma[1:]] if lemma.startswith("و") else [])
    for text in tries:
        found = farsh().first_anywhere(text, ("exact",))
        if found:
            return f"{found[0]}:{found[1]}"
    for text in tries:
        found = farsh().first_anywhere(text)
        if found:
            return f"{found[0]}:{found[1]}"
    raise SystemExit(f"no verse holds {lemma!r}; give one")


def item(page: str, ev: Any, lemma: str, verse: str | None, forms: list[dict[str, Any]], scope: str = "here",
         page_end: str | None = None, note: str | None = None, unresolved: list[dict[str, str]] | None = None) -> dict[str, Any]:
    out: dict[str, Any] = {"page": page, "ev": ev, "lemma": lemma, "verse": verse or first_verse(lemma), "scope": scope, "forms": forms}
    if page_end:
        out["page_end"] = page_end
    if note:
        out["note"] = note
    if unresolved:
        out["unresolved"] = unresolved
    return out


class Review:
    def __init__(self, first: str, last: str) -> None:
        self.first, self.last = first, last
        self.data: dict[str, Any] = {"from": first, "to": last, "accept": [], "reject": {}, "replace": {}, "drop": {}}

    def accept(self, *ids: str) -> None:
        self.data["accept"].extend(ids)

    def reject(self, unit: str, why: str) -> None:
        self.data["reject"][unit] = why

    def drop(self, why: str, *ids: str) -> None:
        for unit in ids:
            self.data["drop"][unit] = why

    def replace(self, unit: str, *items: dict[str, Any]) -> None:
        self.data["replace"][unit] = list(items)

    def save(self) -> Path:
        REVIEWS.mkdir(parents=True, exist_ok=True)
        path = REVIEWS / f"r{self.first}-{self.last}.json"
        path.write_text(json.dumps(self.data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        return path
