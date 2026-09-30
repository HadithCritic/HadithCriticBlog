"""Helpers for writing a batch of general rules (Tahbir pp. 181 to 281) in the item format.

A rule is an item with scope "rule": no verse, a lemma that names the subject (a snippet of the
evidence), and forms that assign readers to treatments exactly as the farsh items do. The
verifier, assembler and claims builder read the batch like any other.

    from rules_kit import *
    b = RuleBatch("181", "185", "isti'adha and basmala")
    b.rule("184", ["اختلفوا في التسمية", "قراءة الباقين"], "التسمية", [form(...)], chapter="باب ذكر التسمية")
    b.skip("181", ["الخياط قال", "والله الموفق"], "chain of transmission")
    b.save()

Reader entries and forms use the same helpers as review_kit (A, G, form).
"""

from __future__ import annotations

import json
from typing import Any

import qiraat_lib as lib
from review_kit import A, C, G, form  # noqa: F401  (re-exported)

RULES_DIR = lib.QIRAAT_DIR / "farsh" / "rules"
SUPPLEMENT_DIR = lib.QIRAAT_DIR / "farsh" / "supplement"


class RuleBatch:
    def __init__(self, first: str, last: str, name: str, supplement: bool = False) -> None:
        self.first, self.last, self.name = first, last, name
        self.supplement = supplement
        self.items: list[dict[str, Any]] = []
        self.skipped: list[dict[str, Any]] = []

    def rule(self, page: str, ev: Any, lemma: str, forms: list[dict[str, Any]], page_end: str | None = None,
             note: str | None = None, chapter: str | None = None, unresolved: list[dict[str, str]] | None = None) -> str:
        ident = f"ru{page}-{len(self.items) + 1:02d}"
        out: dict[str, Any] = {"id": ident, "page": page, "ev": ev, "lemma": lemma, "scope": "rule", "forms": forms}
        if page_end:
            out["page_end"] = page_end
        if note:
            out["note"] = note
        if chapter:
            out["chapter"] = chapter
        if unresolved:
            out["unresolved"] = unresolved
        self.items.append(out)
        return ident

    def position(self, page: str, ev: Any, lemma: str, verse: str, forms: list[dict[str, Any]], scope: str = "here",
                 page_end: str | None = None, note: str | None = None, unresolved: list[dict[str, str]] | None = None,
                 anchor_at_hint: str | None = None) -> str:
        """A word-level position (with a verse), for a supplement batch."""
        ident = f"su{page}-{len(self.items) + 1:02d}"
        out: dict[str, Any] = {"id": ident, "page": page, "ev": ev, "lemma": lemma, "verse": verse, "scope": scope, "forms": forms}
        for key, value in (("page_end", page_end), ("note", note), ("unresolved", unresolved), ("anchor_at_hint", anchor_at_hint)):
            if value:
                out[key] = value
        self.items.append(out)
        return ident

    def skip(self, page: str, ev: Any, why: str, page_end: str | None = None) -> None:
        out: dict[str, Any] = {"id": f"rs{page}-{len(self.skipped) + 1:02d}", "page": page, "ev": ev, "why": why}
        if page_end:
            out["page_end"] = page_end
        self.skipped.append(out)

    def save(self) -> str:
        path_dir = SUPPLEMENT_DIR if self.supplement else RULES_DIR
        path_dir.mkdir(parents=True, exist_ok=True)
        if self.supplement:
            path = SUPPLEMENT_DIR / f"batch-5556-supplement-{self.name}.json"
        else:
            path = RULES_DIR / f"batch-5556-rules-p{self.first}-{self.last}.json"
        payload = {
            "schema": "qiraat-farsh-batch/0.1", "book_id": "5556",
            "pages": {"volume": "1", "from": self.first, "to": self.last},
            "items": self.items, "skipped": self.skipped,
            **({"coverage": "supplement"} if self.supplement else {}),
        }
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        return str(path)
