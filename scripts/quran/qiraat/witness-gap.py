#!/usr/bin/env python3
"""List items of an independent witness that land on verses with no entered position.

Al-Mabsut (Shamela 36104) is ordered by sura and prints a verse number after
each quoted word. This script cuts it into items, reads the printed verse
numbers, and compares them with the verses that carry a position in
src/data/qiraat/sura-NNN.json. It only finds candidates: a verse number is a
locator, not proof that the item states a reading Tahbir omits. Read every
candidate before entering anything.

    python scripts/quran/qiraat/witness-gap.py            # summary
    python scripts/quran/qiraat/witness-gap.py --sura 2   # items for one sura
    python scripts/quran/qiraat/witness-gap.py --write    # second-witness/mabsut-gap.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))
import qiraat_lib as lib  # noqa: E402

DATA = ROOT / "src" / "data" / "qiraat"
OUT = ROOT / "docs" / "research" / "quran-platform" / "qiraat" / "second-witness" / "mabsut-gap.json"

# Heading text in al-Mabsut -> sura number. Longer keys are tried first.
HEADINGS = {
    "البقرة": 2, "الصافات": 37, "آل عمران": 3, "النساء": 4, "المائدة": 5, "الأنعام": 6, "الأعراف": 7,
    "الأنفال": 8, "التوبة": 9, "يونس": 10, "هود": 11, "يوسف": 12, "الرعد": 13,
    "إبراهيم": 14, "الحجر": 15, "النحل": 16, "سبحان": 17, "الكهف": 18, "مريم": 19,
    "طه": 20, "الأنبياء": 21, "الحج": 22, "المؤمنين": 23, "النور": 24, "الفرقان": 25,
    "الشعراء": 26, "النمل": 27, "القصص": 28, "العنكبوت": 29, "الروم": 30, "لقمان": 31,
    "السجدة": 32, "الأحزاب": 33, "سبأ": 34, "الملائكة": 35, "يس": 36, "الصافات": 37,
    "ص": 38, "الزمر": 39, "المؤمن": 40, "السجدة [فصلت]": 41, "الشورى": 42,
    "الزخرف": 43, "الدخان": 44, "الجاثية": 45, "الأحقاف": 46, "محمد": 47, "الفتح": 48,
    "الحجرات": 49, "ق": 50, "الذاريات": 51, "الطور": 52, "النجم": 53, "القمر": 54,
    "الرحمن": 55, "الواقعة": 56, "الحديد": 57, "المجادلة": 58, "الحشر": 59, "المودة": 60,
    "الصف": 61, "الجمعة": 62, "المنافقين": 63, "التغابن": 64, "الطلاق": 65,
    "التحريم": 66, "تبارك": 67, "ن والقلم": 68, "الحاقة": 69, "المعارج": 70, "نوح": 71,
    "الجن": 72, "المزمل": 73, "المدثر": 74, "القيامة": 75, "الدهر": 76, "المرسلات": 77,
    "المعصرات": 78, "النازعات": 79, "عبس": 80, "كورت": 81, "انفطرت": 82, "انشقت": 84,
    "البروج": 85, "الطارق": 86, "المطففين": 83, "الأعلى": 87, "الغاشية": 88,
    "الفجر": 89, "البلد": 90, "الشمس": 91, "الليل": 92, "الضحى": 93, "العلق": 96,
    "القدر": 97, "لم يكن": 98, "الزلزلة": 99, "القارعة": 101, "التكاثر": 102,
    "الهمزة": 104, "قريش": 106, "الكافرين": 109, "تبت": 111, "الإخلاص": 112,
}

TAIL_FROM = 469  # index of page 474
FULL_HEADING = re.compile(r"[سص]ورة\s+((?:\S+\s+){1,8}?)بسم الله")
TAIL_MARK = re.compile(r"(?:في|ومن|من|بقية المفصل من)\s*سورة\s+((?:\S+\s?){1,2})")
ITEM_MARK = re.compile(r"(?<![\d\]\[])\s(\d{1,3}) - (?=[\S])")
VERSE_BRACKET = re.compile(r"\[\s*(\d+(?:\s*(?:و|,|-)\s*\d+)*)\s*\]")


def sura_of(name: str) -> int | None:
    name = name.strip()
    for key in sorted(HEADINGS, key=len, reverse=True):
        if name.startswith(key) or key in name:
            return HEADINGS[key]
    return None


def cut_items(text: str) -> list[tuple[int, int, str]]:
    marks = [(m.start(), m.end(), int(m.group(1))) for m in ITEM_MARK.finditer(text)]
    items = []
    for k, (start, _end, number) in enumerate(marks):
        stop = marks[k + 1][0] if k + 1 < len(marks) else len(text)
        items.append((number, start, text[start:stop].strip()))
    return items


def verses_in(item: str) -> list[int]:
    found: list[int] = []
    for m in VERSE_BRACKET.finditer(item):
        for n in re.findall(r"\d+", m.group(1)):
            found.append(int(n))
    return sorted(set(found))


def words(text: str) -> set[str]:
    return {w for w in re.findall(r"[ء-ي]+", lib.normalize(text)) if len(w) >= 3}


def entered_lemmas(sura: int) -> list[set[str]]:
    path = DATA / f"sura-{sura:03d}.json"
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [
        words(f"{feature.get('lemma') or ''} {feature.get('label') or ''}")
        for feature in data.get("features", [])
    ]


def lemma_entered(item: str, banks: list[set[str]]) -> bool:
    for lemma in re.findall(r"\{([^}]+)\}", item):
        need = words(lemma)
        if need and any(len(need & bank) >= min(2, len(need)) for bank in banks):
            return True
    return False


def nearby_features(item: str, sura: int) -> list[str]:
    path = DATA / f"sura-{sura:03d}.json"
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    rare = {w for lemma in re.findall(r"\{([^}]+)\}", item) for w in words(lemma) if len(w) >= 4}
    out = []
    for feature in data.get("features", []):
        if rare & words(f"{feature.get('lemma') or ''} {feature.get('label') or ''}"):
            verse = int(feature["verse"].rsplit("-", 1)[1]) if feature.get("verse") else 0
            out.append(f"{verse}:{feature.get('lemma')}")
    return out[:4]


def entered_verses(sura: int) -> set[int]:
    path = DATA / f"sura-{sura:03d}.json"
    if not path.exists():
        return set()
    data = json.loads(path.read_text(encoding="utf-8"))
    return {
        int(feature["verse"].rsplit("-", 1)[1])
        for feature in data.get("features", [])
        if feature.get("verse")
    }


def mabsut_sections() -> dict[int, str]:
    """Concatenate the text that belongs to each sura, following the printed headings."""
    book = lib.load_book("36104")
    sections: dict[int, list[str]] = {}
    current: int | None = None
    for page_index, page in enumerate(book.pages):
        text = lib.normalize(page["text"] or "").replace("‌", " ").replace("‍", " ")
        text = re.sub(r"[ ]{2,}", " ", text)
        cursor = 0
        events = []
        for m in FULL_HEADING.finditer(text):
            events.append((m.start(), m.end(), sura_of(m.group(1)), "heading"))
        for m in TAIL_MARK.finditer(text):
            # Ignore marks that sit inside a full heading match.
            if any(e[0] <= m.start() < e[1] for e in events):
                continue
            target = sura_of(m.group(1))
            # Markers of this shape only introduce a sura in the compressed tail
            # (from p. 474); earlier they are cross-references inside a sura.
            if target and target >= 91 and page_index >= TAIL_FROM:
                events.append((m.start(), m.end(), target, "tail"))
        events.sort()
        for start, end, sura, _kind in events:
            if current is not None:
                sections.setdefault(current, []).append(text[cursor:start])
            current = sura if sura else current
            cursor = end
        if current is not None:
            sections.setdefault(current, []).append(text[cursor:])
    return {sura: " ".join(parts) for sura, parts in sections.items()}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--sura", type=int)
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--width", type=int, default=260)
    args = parser.parse_args()

    sections = mabsut_sections()
    report = []
    for sura in sorted(sections):
        if args.sura and sura != args.sura:
            continue
        have = entered_verses(sura)
        banks = entered_lemmas(sura)
        for number, _pos, item in cut_items(sections[sura]):
            verses = verses_in(item)
            if not verses:
                continue
            missing = [v for v in verses if v not in have]
            report.append(
                {
                    "sura": sura,
                    "item": number,
                    "verses": verses,
                    "uncovered": missing,
                    "all_uncovered": len(missing) == len(verses),
                    "lemma_entered": lemma_entered(item, banks),
                    "nearby": nearby_features(item, sura) if missing else [],
                    "text": item,
                }
            )

    total = len(report)
    uncovered = [r for r in report if r["all_uncovered"] and not r["lemma_entered"]]
    partial = [r for r in report if r["uncovered"] and not r["all_uncovered"] and not r["lemma_entered"]]
    print(f"items with printed verse numbers: {total}")
    print(f"  every verse has an entered position: {total - len(uncovered) - len(partial)}")
    print(f"  some verse without a position:       {len(partial)}")
    print(f"  no verse with a position:            {len(uncovered)}")
    by_sura: dict[int, int] = {}
    for r in uncovered:
        by_sura[r["sura"]] = by_sura.get(r["sura"], 0) + 1
    print("uncovered items by sura:", dict(sorted(by_sura.items())))
    if args.sura:
        for r in report:
            if r["uncovered"]:
                tag = "NONE" if r["all_uncovered"] else "PART"
                print(f"[{r['sura']}:{r['item']}] {tag} verses {r['verses']} missing {r['uncovered']}")
                print("   ", r["text"][: args.width])
    if args.write:
        OUT.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
        print("wrote", OUT.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
