#!/usr/bin/env python3
"""Cross-check the module's Taysir claims against van Putten's translation.

The module cites al-Dani's at-Taysir (Shamela 5527, Pretzl's pagination) for
its claims; van Putten translates the same edition and prints Pretzl's page
breaks and the verse of every statement. So each Taysir claim can be checked
against the translation on two counts: is there a translated statement on
that verse, and does the claim's page fall on that statement's pages.

This is a read-only check, never evidence for a claim: the module's claims
rest on the Arabic. It reports
  - claims on a verse van Putten translates, and whether the pages agree;
  - claims on a verse he has no statement for;
  - verses he translates where the module has no Taysir claim (Taysir items
    the module may lack).

Output: docs/research/qiraat/van-putten-crosscheck.json

Usage: python scripts/quran/qiraat/crosscheck-van-putten.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "src" / "data" / "qiraat"
OUT = ROOT / "docs" / "research" / "qiraat" / "van-putten-crosscheck.json"
TAYSIR = "5527"


def pages(locator: str) -> list[int]:
    """'vol. 1, p. 72' or 'vol. 1, pp. 72 to 73' as [72] or [72, 73]."""
    numbers = [int(n) for n in re.findall(r"\d+", locator.split(",", 1)[-1])]
    if len(numbers) == 2 and numbers[1] >= numbers[0]:
        return list(range(numbers[0], numbers[1] + 1))
    return numbers[:1]


def main() -> int:
    vp = json.loads((DATA / "van-putten-taysir.json").read_text(encoding="utf-8"))
    statements: dict[tuple[int, int], list[dict]] = {}
    # A sura's closing lists (its yāʾs, numbered but with no verse) and the
    # general principles (uṣūl) are cited by page, not by verse.
    ya_list_pages: dict[int, set[int]] = {}
    usul_pages: dict[int, str] = {}
    for st in vp["statements"]:
        if st["section"] == "farsh" and st["verse"] is not None:
            statements.setdefault((st["sura"], st["verse"]), []).append(st)
        elif st["section"] == "farsh" and st["sura"] is not None:
            ya_list_pages.setdefault(st["sura"], set()).update(st["pretzl_pages"])
        elif st["section"] == "usul":
            for p in st["pretzl_pages"]:
                usul_pages.setdefault(p, st["id"])
    # Every page a per-verse statement falls on, for rules stated once and
    # applied "wherever it occurs".
    farsh_pages: dict[int, str] = {}
    for st in vp["statements"]:
        if st["section"] == "farsh":
            for p in st["pretzl_pages"]:
                farsh_pages.setdefault(p, st["id"])

    agree, agree_list, agree_usul, agree_first, differ, no_statement = [], [], [], [], [], []
    claimed_verses: set[tuple[int, int]] = set()
    for path in sorted(DATA.glob("sura-*.json")):
        sura = json.loads(path.read_text(encoding="utf-8"))
        n = sura["sura"]
        for feature in sura.get("features", []):
            verse = int(str(feature["verse"]).split("-")[-1])
            claims = [c for g in feature.get("groups", []) for c in g.get("claims", []) if str(c.get("book_id")) == TAYSIR]
            if not claims:
                continue
            claimed_verses.add((n, verse))
            claim_pages = sorted({p for c in claims for p in pages(c.get("page") or "")})
            entry = {"feature": feature["id"], "sura": n, "verse": verse, "label": feature.get("label"), "claim_pages": claim_pages}
            found = statements.get((n, verse))
            vp_pages = sorted({p for st in found for p in st["pretzl_pages"]}) if found else []
            if found:
                entry["vp_pages"] = vp_pages
                entry["vp_statements"] = [st["id"] for st in found]
            # A statement can start on the page before the one the claim cites.
            if any(abs(a - b) <= 1 for a in claim_pages for b in vp_pages):
                agree.append(entry)
            elif claim_pages and set(claim_pages) & ya_list_pages.get(n, set()):
                agree_list.append(entry)
            elif claim_pages and all(p in usul_pages for p in claim_pages):
                entry["vp_usul"] = sorted({usul_pages[p] for p in claim_pages})
                agree_usul.append(entry)
            elif (
                claim_pages
                and all(any(p + d in farsh_pages for d in (-1, 0, 1)) for p in claim_pages)
                and max(claim_pages) <= (min(vp_pages) if vp_pages else 10**6)
            ):
                # Taysir states a rule once, where the word first occurs, and it
                # holds for later occurrences: the claim cites that earlier page.
                entry["earlier_statement"] = sorted({farsh_pages[p + d] for p in claim_pages for d in (-1, 0, 1) if p + d in farsh_pages})[:3]
                agree_first.append(entry)
            elif found:
                differ.append(entry)
            else:
                no_statement.append(entry)

    uncovered = [
        {"sura": s, "verse": v, "vp_statements": [st["id"] for st in sts], "vp_pages": sorted({p for st in sts for p in st["pretzl_pages"]}),
         "text": sts[0]["text"][:240]}
        for (s, v), sts in sorted(statements.items())
        if (s, v) not in claimed_verses
    ]
    report = {
        "about": "Read-only cross-check of the module's at-Taysir claims against Marijn van Putten's translation (CC BY-NC 4.0). Not evidence for any claim.",
        "categories": {
            "statement_on_verse_pages_agree": "van Putten translates a statement on the claim's verse, on the page the claim cites (within one page).",
            "cites_the_suras_closing_list": "The claim cites a page of the sura's closing yāʾ list, which he translates without verse numbers.",
            "cites_a_general_principle": "The claim cites a page of the uṣūl, the general principles.",
            "cites_an_earlier_page_not_word_checked": "The claim cites an earlier page that carries a translated statement, as a rule stated once where a word first occurs would. That the statement concerns this word is not checked here.",
            "statement_on_verse_pages_differ": "He translates a statement on the verse, but the claim cites a later page: review.",
            "no_statement_on_verse": "He has no statement on the verse and the cited page carries none: review."
        },
        "counts": {
            "taysir_positions": len(agree) + len(agree_list) + len(agree_usul) + len(agree_first) + len(differ) + len(no_statement),
            "statement_on_verse_pages_agree": len(agree),
            "cites_the_suras_closing_list": len(agree_list),
            "cites_a_general_principle": len(agree_usul),
            "cites_an_earlier_page_not_word_checked": len(agree_first),
            "statement_on_verse_pages_differ": len(differ),
            "no_statement_on_verse": len(no_statement),
            "translated_verses_without_a_taysir_claim": len(uncovered),
        },
        "cites_an_earlier_page_not_word_checked": agree_first,
        "pages_differ": differ,
        "no_statement_on_verse": no_statement,
        "translated_verses_without_a_taysir_claim": uncovered,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(report["counts"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
