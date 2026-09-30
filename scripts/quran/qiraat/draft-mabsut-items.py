#!/usr/bin/env python3
"""Draft al-Mabsūṭ claims for positions already entered from Taḥbīr, keeping only the ones that agree.

al-Mabsūṭ (Ibn Mihrān, Shamela 36104, about 381 AH) is an early witness for the ten. Its clauses read
"he read: A and B {the word} [verse] form; and the rest read {the word} form". Each such clause becomes a
form whose readers are the names before the brace, mapped to the Taḥbīr reading that holds them
(`merge_into`, `value_of`), exactly as `draft-nashr-items.py` does for an-Nashr.

Skipped: an item with a route or a student outside the twenty (Zayd, Ḥammād, al-Aʿshā and so on), a word
of agreement or place, two verses, or a clause that is not only names before the brace; and any item in which a
transmitter would get a reading other than the one Taḥbīr gives him.

    python scripts/quran/qiraat/draft-mabsut-items.py   # writes farsh/mabsut/batch-36104-agree.json
"""

from __future__ import annotations

import bisect
import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import qiraat_lib as lib  # noqa: E402


def load(name: str, file: str):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


dn = load("dn", "draft-nashr-items.py")
gap = load("gap", "witness-gap.py")

QIRAAT = lib.QIRAAT_DIR
OUT_DIR = QIRAAT / "farsh" / "mabsut"
OUT = OUT_DIR / "batch-36104-agree.json"
MARK = re.compile(r"(?:^|[\s.،])(?:و)?قرأ\s+")
FORBIDDEN = re.compile(
    r"(?<![ء-ي])[وف]?(?:روي|رويت|واختلف|وافق|وافقه|وافقهم|انفرد|إلا|الا|حيث|هنا|الموضعين|الحرفين|السورتين|وكذلك|وكذا|"
    r"زيد|حماد|يحيي|يحيى|البرجمي|العجلي|الاعشي|الأعشى|الحلواني|حمدون|إسماعيل|اسماعيل|شجاع|القواس|فليح|الضرير|سليم|"
    r"قتيبة|قتيبه|الجمال|اليزيدي|هبيرة|هبيره|نصير|ذكرت|ذكرته|وحماد|الهاشمي|الدوري|السوسي)(?![ء-ي])"
)
# "Ḥafṣ from ʿĀṣim", "Ruways from Yaʿqūb": the qāriʾ after "from" is dropped and the transmitter kept.
FROM_QARI = re.compile(r"\s+عن\s+(?:عاصم|نافع|يعقوب|حمزة|حمزه|الكسائي|الكسايي|أبي عمرو|ابي عمرو|ابن كثير|ابن عامر|أبي جعفر)")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    stream = lib.Stream(lib.load_book("36104"))
    text = stream.text
    sections = gap.mabsut_sections()
    compare = json.loads((QIRAAT / "second-witness" / "compare-auto.json").read_text(encoding="utf-8"))
    tahbir_items: dict[str, str] = {}
    for path in (QIRAAT / "claims").glob("farsh-sura-[0-9][0-9][0-9].json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        for fid, feature in data["features"].items():
            tahbir_items[fid] = feature["item"]
    features: dict[int, dict[str, dict]] = {}

    def feature_of(fid: str) -> dict:
        sura = int(fid.split("-")[1])
        if sura not in features:
            data = json.loads((lib.REPO / "src" / "data" / "qiraat" / f"sura-{sura:03d}.json").read_text(encoding="utf-8"))
            features[sura] = {f["id"]: f for f in data["features"]}
        return features[sura][fid]

    bodies: dict[tuple[int, int], str] = {}
    NOTES: list[dict] = []
    CUR: dict = {}

    def note(reason: str) -> None:
        skipped[reason] += 1
        NOTES.append({**CUR, "reason": reason})

    items, skipped = [], Counter()
    counter: Counter = Counter()
    seen: set[tuple[str, str]] = set()
    for entry in compare["items"]:
        if entry["status"] not in ("agree", "partial"):
            continue
        CUR.clear()
        CUR.update(feature=entry["feature"], mabsut_item=entry["matched"]["item"], sura=entry["matched"]["sura"])
        key = (entry["matched"]["sura"], entry["matched"]["item"])
        if key not in bodies:
            bodies[key] = next((b for n, _p, b in gap.cut_items(sections[key[0]]) if n == key[1]), "")
        raw = bodies[key]
        start = text.find(lib.normalize(re.sub(r"^\d+\s*-\s*", "", raw)[:60]))
        if start < 0:
            note("not located")
            continue
        body = lib.normalize(re.sub(r"^\d+\s*-\s*", "", raw))
        CUR.update(body=body[:1600], page=stream.book.pages[bisect.bisect_right(stream.starts, start) - 1]["page"], volume="1")
        if len(set(re.findall(r"\[(\d+)\]", body))) > 1:
            note("two verses")
            continue
        if FORBIDDEN.search(body):
            note("route, agreement or place word")
            continue
        marks = list(MARK.finditer(" " + body))
        if not marks:
            note("no clause")
            continue
        feature = feature_of(entry["feature"])
        tah_groups = [g for g in feature["groups"] if g["kind"] == "reading"]
        by_transmitter = {m: g["value"] for g in tah_groups for m in g["members"]}
        clauses, ok, lemma = [], True, ""
        for i, mark in enumerate(marks):
            clause_end = marks[i + 1].start() if i + 1 < len(marks) else len(body) + 1
            piece = (" " + body)[mark.end():clause_end].strip(" ،.")
            rest = piece.startswith("الباقون")
            brace = re.search(r"\{([^}]*)\}", piece)
            if not brace:
                ok = False
                break
            word = brace.group(1).strip()
            if not lemma:
                lemma = word
            head = piece[: brace.start()]
            after = re.sub(r"^\s*\[\d+\]\s*", "", piece[brace.end():]).strip(" ،.")
            if rest:
                if head.strip() != "الباقون" or not after:
                    ok = False
                    break
                clauses.append({"rest": True, "form": after, "readers": [], "word": word})
                continue
            cleaned = FROM_QARI.sub("", head)
            got = dn.read_head(cleaned)
            if got is None:
                ok = False
                break
            names, _end = got
            if not after or "الباقون" in after or len(after.split()) > 14 or re.search(r"(?<![ء-ي])عن(?![ء-ي])", after):
                ok = False
                break
            clauses.append({"rest": False, "readers": names, "form": after, "word": word})
        named = [c for c in clauses if not c["rest"]]
        rests = [c for c in clauses if c["rest"]]
        if not ok or not named or len(rests) > 1 or not lemma:
            note("unreadable clause")
            continue
        predicted: dict[str, str] = {}
        forms, used = [], set()
        bad = False
        for c in named:
            members = set().union(*(dn.transmitters(k, i) for k, i, _ in c["readers"]))
            values = {by_transmitter[m] for m in members if m in by_transmitter}
            if len(values) != 1:
                bad = True
                break
            value = next(iter(values))
            label = next((g.get("value_label") or "" for g in tah_groups if g["value"] == value), "")
            here, there = dn.family_values(c["form"]), dn.family_values(label)
            if any(here[f] != there[f] for f in here if f in there):
                bad = True
                break
            for m in members:
                predicted[m] = value
            used.add(value)
            forms.append({"desc": c["form"], "readers": [[k, i, s] for k, i, s in c["readers"]], "value_of": int(value[1:])})
        if bad:
            note("readers split or label differs")
            continue
        if rests:
            remaining = {g["value"] for g in tah_groups} - used
            if len(remaining) == 1:
                value = next(iter(remaining))
                forms.append({"desc": rests[0]["form"], "readers": [], "rest": "الباقون", "value_of": int(value[1:])})
                for m in by_transmitter:
                    predicted.setdefault(m, value)
        if any(predicted.get(m, v) != v for m, v in by_transmitter.items()):
            note("a transmitter differs from Taḥbīr")
            continue
        first = bisect.bisect_right(stream.starts, start) - 1
        page = stream.book.pages[first]["page"]
        if (entry["feature"], page) in seen:
            note("second item for one position")
            continue
        seen.add((entry["feature"], page))
        counter[page] += 1
        end_snip = " ".join(forms[-1]["desc"].split()[-6:])
        last = bisect.bisect_right(stream.starts, start + len(body) - 1) - 1
        page_end = stream.book.pages[last]["page"]
        window = {"book_id": "36104", "page": page, "volume": "1", **({"page_end": page_end} if page_end != page else {})}
        window_text, _ = dn.vfi.window_text(stream, window)
        ev = None
        needed = [f["desc"] for f in forms] + [sp for f in forms for _k, _i, sp in f["readers"]] + [lemma]
        for words in (8, 14, 24, 40):
            for tail_words in (6, 12, 20):
                candidate = [" ".join(body.split()[:words]), " ".join(forms[-1]["desc"].split()[-tail_words:])]
                try:
                    lo, hi = dn.vfi.cut(candidate, window_text, unique=True)
                except ValueError:
                    continue
                if all(lib.normalize(x) in window_text[lo:hi] for x in needed):
                    ev = candidate
                    break
            if ev:
                break
        if ev is None:
            note("evidence not unique or end not found")
            continue
        item = {
            "id": f"m{page}-{counter[page]:02d}", "page": page, "volume": "1",
            "ev": ev, "lemma": lemma, "scope": feature["scope"], "forms": forms,
            "merge_into": tahbir_items[entry["feature"]],
            "verse": "%d:%d" % tuple(int(x) for x in entry["feature"].split("-")[1:3]),
        }
        if page_end != page:
            item["page_end"] = page_end
        items.append(item)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "schema": "qiraat-farsh-batch/0.1", "book_id": "36104", "coverage": "supplement",
        "pages": {"volume": "1", "from": "1", "to": "481"}, "items": items, "skipped": [],
        "note": "Drafted by draft-mabsut-items.py from items that agree with Taḥbīr in grouping; see D-084.",
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (QIRAAT / "second-witness" / "mabsut-not-entered.json").write_text(json.dumps(NOTES, ensure_ascii=False, indent=1) + chr(10), encoding="utf-8")
    print(len(items), "items drafted;", dict(skipped))
    return 0


if __name__ == "__main__":
    sys.exit(main())
