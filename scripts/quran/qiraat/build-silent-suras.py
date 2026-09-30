#!/usr/bin/env python3
"""Record what the books say about the suras that have no word-by-word position.

Taḥbīr's word-by-word section prints a heading only for a sura with something to say, and Ibn Mujāhid
often writes "there is no difference in it". For each such sura this script keeps the book's own words:
a quotation that must be an exact substring of the cited page, cut from the cached text. Nothing is
inferred; a sura with no statement stays "not extracted".

    python scripts/quran/qiraat/build-silent-suras.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qiraat_lib as lib  # noqa: E402

OUT = lib.REPO / "src" / "data" / "qiraat" / "silent-suras.json"

# status: none    the books state that there is no difference in the sura
#         rule    the books state only a general rule that reaches the sura (see the rules page)
#         report  the books record only a report from outside the twenty transmitters
SPEC: dict[int, dict] = {
    62: {"status": "none", "summary": "Every book that speaks of it says there is nothing here beyond what the general rules already give.", "quotes": [
        ("5556", "582", "وليس في سورة الجمعة خلف إلا ما تقدم من الإمالة وغيرها"),
        ("5527", "211", "وليس في سورة الجمعة خلف الا ما تقدم من الامالة وغيرها"),
        ("5530", "636", "لم يختلفوا فى سورة الجمعة"),
        ("36104", "436", "ليس بينهم اختلاف، ولا شيء في هذه السورة إلا وقد مر ذكره"),
    ]},
    94: {"status": "none", "summary": "Ibn Mujāhid states that there is no difference in it.", "quotes": [
        ("5530", "690", "سورة الانشراح ليس فيها خلاف"),
    ]},
    95: {"status": "none", "summary": "Ibn Mujāhid states that there is no difference in it.", "quotes": [
        ("5530", "690", "سورة التين ليس فيها أيضا خلاف"),
    ]},
    100: {"status": "none", "summary": "Ibn Mujāhid states that there is no difference in it beyond the general rules.", "quotes": [
        ("5530", "694", "سورة العاديات ليس فيها خلاف إلا ما تقدم من الأصول"),
    ]},
    103: {"status": "report", "summary": "Ibn Mujāhid records only a report about Abū ʿAmr that he himself says is allowed on stopping alone.", "quotes": [
        ("5530", "696", "هذا الذى قال أبو حاتم لا يجوز إلا فى الوقف"),
    ]},
    105: {"status": "none", "summary": "Ibn Mujāhid states that there is no difference in it.", "quotes": [
        ("5530", "697", "سورة الفيل ليس فيها خلاف"),
    ]},
    107: {"status": "none", "summary": "Ibn Mujāhid states that there is no difference in it.", "quotes": [
        ("5530", "698", "سورة الماعون ليس فيها خلاف"),
    ]},
    108: {"status": "none", "summary": "Ibn Mujāhid states that there is no difference in it.", "quotes": [
        ("5530", "698", "سورة الكوثر ليس فيها خلاف"),
    ]},
    110: {"status": "none", "summary": "Ibn Mujāhid states that there is no difference in it.", "quotes": [
        ("5530", "700", "سورة النصر ليس فيها خلاف"),
    ]},
    113: {"status": "report", "summary": "Ibn Mujāhid records only a report of a kasra on the ḥāʾ of حاسد for Abū ʿAmr, through a student, against all seven who read a fatḥa.", "quotes": [
        ("5530", "703", "ابن كثير ونافع وأبو عمرو وابن عامر وعاصم وحمزة والكسائى {حاسد} بفتح الحاء"),
    ]},
    114: {"status": "rule", "summary": "The only treatment is the imāla of the nūn of الناس after a genitive, which the book gives for al-Dūrī as a general rule.", "quotes": [
        ("5530", "703", "إلا ما روى الحلوانى عن أبى عمر الدورى عن الكسائى أن قراءته كانت بإمالة النون من {الناس}"),
        ("5556", "249", "بإمالة فتحة النون من (الناس) في موضع الجر حيث وقع"),
    ]},
}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    books = {b["book_id"]: b for b in json.loads((lib.QIRAAT_DIR / "sources.json").read_text(encoding="utf-8"))["books"]}
    streams: dict[str, lib.Stream] = {}
    out: dict[str, dict] = {}
    errors: list[str] = []
    for sura, entry in sorted(SPEC.items()):
        quotes = []
        for book_id, page, snippet in entry["quotes"]:
            stream = streams.setdefault(book_id, lib.Stream(lib.load_book(book_id)))
            text = lib.normalize(snippet)
            try:
                located = stream.locate({"book_id": book_id, "page": page}, text, 1)
            except KeyError as error:
                errors.append(f"sura {sura}: {error.args[0]}")
                continue
            if located is None:
                errors.append(f"sura {sura}: not on page {page} of {book_id}: {snippet}")
                continue
            book = books[book_id]
            quotes.append({
                "book_id": book_id, "mark": book.get("mark", book_id[:2]),
                "book": book.get("short_title") or book["book_title"], "page": f"p. {page}", "quote": text,
            })
        out[str(sura)] = {"status": entry["status"], "summary": entry["summary"], "quotes": quotes}
    if errors:
        for message in errors:
            print("error:", message)
        return 1
    payload = {"schemaVersion": "qiraat-silent/0.1.0", "generator": "scripts/quran/qiraat/build-silent-suras.py", "suras": out}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(out)} suras, {sum(len(v['quotes']) for v in out.values())} quotations -> {OUT.relative_to(lib.REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
