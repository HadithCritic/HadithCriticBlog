#!/usr/bin/env python3
"""Collect the passages of an-Nashr, al-Mabsūṭ and the Sabʿa that the drafters could not enter as claims.

The claims model resolves to twenty transmitters. Where a book goes below them (al-Ḥulwānī and al-Dājūnī under
Hishām, Zayd and al-Burjumī under Yaʿqūb and Shuʿba, and so on), or treats several places or an exception in one
sentence, the drafters refuse the item and write it to `second-witness/*-not-entered.json` with its text.
This script turns those refusals into one record file, `second-witness/route-detail.json`: for each passage the
exact text (checked as a substring of the book's pages), its page, the Taḥbīr position it belongs to when there
is one, and which narrators below the twenty it names. Nothing here is interpreted or entered as a claim.

    python scripts/quran/qiraat/build-route-detail.py
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import importlib.util  # noqa: E402
import qiraat_lib as lib  # noqa: E402

_spec = importlib.util.spec_from_file_location("nc", HERE / "nashr-compare.py")
nc = importlib.util.module_from_spec(_spec)  # type: ignore[arg-type]
_spec.loader.exec_module(nc)  # type: ignore[union-attr]

SW = lib.QIRAAT_DIR / "second-witness"
OUT = SW / "route-detail.json"
BOOKS = {
    "nashr": ("22642", "an-Nashr (Ibn al-Jazarī)"),
    "mabsut": ("36104", "al-Mabsūṭ (Ibn Mihrān)"),
    "saba": ("5530", "Kitāb al-Sabʿa (Ibn Mujāhid)"),
}
# Narrators below the twenty transmitters, as the three books name them (folded spellings not needed: the
# texts are read as printed).
BELOW_TWENTY = (
    "الحلواني", "الداجوني", "الأخفش", "الصوري", "النقاش", "ابن شنبوذ", "الأعشى", "البرجمي", "زيد", "حماد", "يحيى",
    "قتيبة", "القواس", "إسماعيل", "ابن فليح", "المسيبي", "شجاع", "الضرير", "أبو حمدون", "العليمي", "الهاشمي",
    "ابن مجاهد", "ابن مهران", "أبو الطيب", "المعدل", "الكارزيني", "الشذائي", "المفسر", "الفارسي", "الداني",
    "سبط الخياط", "ابن سوار", "الأزرق", "الأصبهاني", "أبو الحارث", "الطبري", "الرملي", "النخاس", "ابن الأخرم",
    "ابن بويان", "الشطوي", "المطوعي", "ابن جماز", "ابن وردان",
)
# The last two are among the twenty; they are listed so the record can say when a route runs through them.
TWENTY_NAMES = {
    "نافع": "nafi", "قالون": "qalun", "ورش": "warsh", "أبو جعفر": "abu_jafar", "ابن وردان": "ibn_wardan",
    "ابن جماز": "ibn_jammaz", "أبو عمرو": "abu_amr", "السوسي": "susi", "يعقوب": "yaqub", "رويس": "ruways",
    "روح": "rawh", "عاصم": "asim", "شعبة": "shuba", "أبو بكر": "shuba", "حفص": "hafs", "حمزة": "hamza",
    "خلف": "khalaf", "خلاد": "khallad", "الكسائي": "kisai", "الدوري": "duri", "ابن عامر": "ibn_amir",
    "هشام": "hisham", "ابن ذكوان": "ibn_dhakwan", "ابن كثير": "ibn_kathir", "البزي": "bazzi", "قنبل": "qunbul",
}


def excerpt_of(text: str, names: list[str]) -> str:
    """The run of sentences of `text` that name a narrator below the twenty, at most 700 letters, as printed."""
    if not names:
        return ""
    bounds = [0] + [m.end() for m in re.finditer(r"[.؛]\s+", text)] + [len(text)]
    spans = [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1) if bounds[i + 1] > bounds[i]]
    hit = [i for i, (a, b) in enumerate(spans) if any(n in text[a:b] for n in names)]
    if not hit:
        return ""
    a, b = spans[hit[0]][0], spans[hit[-1]][1]
    piece = text[a:b].strip()
    if len(piece) > 700:
        piece = piece[:700].rsplit(" ", 1)[0]
    return piece


def sabaa_feature(record: dict, by_sura: dict[int, list[dict]]) -> str | None:
    """The single Taḥbīr position at the verse and word a Sabʿa item names, or None."""
    m = re.search(r"\{([^}]*)\}\s*(\d+)", record["text"])
    if not m or not record.get("sura"):
        return None
    word, verse = m.group(1).strip(), int(m.group(2))
    lw = nc.wc.words(word)
    scored = []
    for f in by_sura.get(record["sura"], []):
        if int(f["verse"].rsplit("-", 1)[1]) != verse:
            continue
        other = f.get("lemma") or ""
        cov = max(nc.lemma_score(lw, other), nc.lemma_score(nc.wc.words(other), word))
        if cov >= 0.5:
            scored.append((cov, f["id"]))
    scored.sort(reverse=True)
    top = [fid for cov, fid in scored if scored and cov == scored[0][0]]
    return top[0] if len(top) == 1 else None


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    records: list[dict] = []
    by_sura: dict[int, list[dict]] = {}
    for path in sorted((lib.REPO / "src" / "data" / "qiraat").glob("sura-[0-9][0-9][0-9].json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        by_sura[data["sura"]] = [f for f in data["features"] if f.get("scope") != "rule"]
    reasons: Counter = Counter()
    for key, (book_id, title) in BOOKS.items():
        stream = lib.Stream(lib.load_book(book_id))
        text = stream.text
        notes = json.loads((SW / f"{key}-not-entered.json").read_text(encoding="utf-8"))
        seen: set[tuple[str, str]] = set()
        for note in notes:
            body = (note.get("body") or "").strip()
            if not body or note["reason"] in ("items read", "rest not determined"):
                continue
            marker = (note.get("feature") or f"{note.get('sura')}-{note.get('number')}", body[:80])
            if marker in seen:
                continue
            seen.add(marker)
            found = text.find(body)
            if found < 0:
                # the drafters trim at 1,600 letters, which can end inside a word; shorten until it fits
                cut = body
                while len(cut) > 200 and text.find(cut) < 0:
                    cut = cut[:-20]
                if text.find(cut) < 0:
                    reasons["text not found"] += 1
                    continue
                body = cut
            below = [n for n in BELOW_TWENTY if n in body and n not in TWENTY_NAMES]
            twenty = sorted({ident for n, ident in TWENTY_NAMES.items() if n in body})
            feature_id = note.get("feature") or (sabaa_feature({"text": body, "sura": note.get("sura")}, by_sura) if key == "saba" else None)
            records.append({
                "book_id": book_id, "book": title, "volume": note.get("volume"), "page": note.get("page"),
                "feature": feature_id, "sura": note.get("sura"), "excerpt": excerpt_of(body, below), "reason": note["reason"],
                "names_below_the_twenty": below, "twenty_named": twenty, "text": body,
            })
            reasons[(key, note["reason"])] += 1
    payload = {
        "schema": "qiraat-route-detail/0.1",
        "note": "Passages the claims model cannot carry (routes below the twenty transmitters, several places, exceptions, "
                "disagreements with Taḥbīr), with their exact text and page. Not interpreted, not entered as claims. See D-085.",
        "counts": {f"{k[0]}: {k[1]}" if isinstance(k, tuple) else k: v for k, v in reasons.items()},
        "records": records,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(len(records), "records;", dict(reasons))
    named = Counter(n for r in records for n in r["names_below_the_twenty"])
    print(named.most_common(12))
    return 0


if __name__ == "__main__":
    sys.exit(main())
