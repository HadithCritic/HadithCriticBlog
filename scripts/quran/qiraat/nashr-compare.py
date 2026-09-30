#!/usr/bin/env python3
"""Check the entered Taḥbīr positions against an-Nashr, Ibn al-Jazarī's larger work, at the level of the qāriʾ.

an-Nashr (Shamela 22642, vol. 2 pp. 206 to 402) treats the same words in the form
"he differed on: WORD; so A, B and C read ...; and the rest read ...". For each item the script finds the
Taḥbīr position on the same word (same sura, similar lemma, in mushaf order), reads which readers each
clause names, and asks one question: does Taḥbīr keep together the readers an-Nashr names together?

It catches two things a person must then read: a place where the printed Taḥbīr sentence leaves out or adds
a reader (12:62, 30:50 and 41:47 were found first by hand), and a place where our own entry assigned a reader
to the wrong form. It says nothing about the form of a reading.

Statuses: agree, differ (an-Nashr names together readers Taḥbīr separates), partial (too little named to
tell), not_located. A machine draft, never a finding.

    python scripts/quran/qiraat/nashr-compare.py           # write second-witness/nashr-compare-auto.json
"""

from __future__ import annotations

import importlib.util
import json
import re
import sys
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import qiraat_lib as lib  # noqa: E402

spec = importlib.util.spec_from_file_location("witness_compare", HERE / "witness-compare.py")
wc = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
spec.loader.exec_module(wc)  # type: ignore[union-attr]

PAGES = lib.REPO / "scratch" / "quran" / "qiraat" / "pages" / "22642.json"
DATA = lib.REPO / "src" / "data" / "qiraat"
OUT = lib.QIRAAT_DIR / "second-witness" / "nashr-compare-auto.json"
FIRST_INDEX, LAST_INDEX = 706, 902  # vol. 2 p. 206 to p. 402

MARKS = re.compile("[ً-ٰٟـ]")
SURA_NAMES = [
    "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد",
    "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان",
    "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "والصافات", "ص",
    "الزمر", "المؤمن", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "والنجم", "اقتربت", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
]
SURA_NUMBER = {name: number for number, name in enumerate(SURA_NAMES, start=2)}
GROUP_RANGES = [(61, 66), (67, 71), (72, 77), (78, 86), (87, 114)]

# Collective terms an-Nashr uses in place of names.
TERMS = [
    ("المدنيان", "نافع وابو جعفر"), ("البصريان", "ابو عمرو ويعقوب"), ("الكوفيون", "عاصم وحمزه والكسايي وخلف"),
    ("الحرميان", "ابن كثير ونافع"), ("المكي", "ابن كثير"), ("المدني", "نافع"), ("الشامي", "ابن عامر"),
    ("البصري", "ابو عمرو"), ("الكوفي", "عاصم"),
]
CLAUSE = re.compile(r"(?:^|[\s.،])(?:ف|و)?(?:قرا|روي|روى)(?:ه|هما|ت)?\s+")
FORM_WORDS = (
    "بضم", "بفتح", "بكسر", "باسكان", "بإسكان", "بالياء", "بالتاء", "بالنون", "بالخطاب", "بالغيب", "بتخفيف", "بتشديد",
    "بالتخفيف", "بالتشديد", "بالرفع", "بالنصب", "بالخفض", "بالجر", "بالجزم", "بالف", "بألف", "بحذف", "بإثبات", "باثبات",
    "بغير", "بهمزه", "بهمزة", "بياء", "بتاء", "بنون", "بالواو", "بالفا", "بالفاء", "بالإماله", "بالاماله", "بالفتح", "بالكسر",
    "بالضم", "بالسكون", "بالمد", "بالقصر", "بالاختلاس", "بالاشمام", "بين", "بتحريك", "بياين", "بتقديم", "بتنوين", "بغيره",
    "بواو", "بتسهيل", "بابدال", "بنقل", "بتحقيق", "بالهمز", "بالإدغام", "بالادغام", "بالاظهار", "بالإظهار", "بجزم", "بنصب",
    "برفع", "بخفض", "بالغنه", "بالإخفاء",
)
FORM_START = re.compile(r"\s(?:" + "|".join(sorted((re.escape(w) for w in FORM_WORDS), key=len, reverse=True)) + r"|على|من غير|مثل|كذلك|بلا)(?![ء-ي])")


def strip(text: str) -> str:
    return MARKS.sub("", text)


def fold(text: str) -> str:
    return wc.fold(strip(text).replace("‌", ""))


def load_text() -> tuple[str, list[tuple[int, str]]]:
    pages = json.loads(PAGES.read_text(encoding="utf-8"))["pages"]
    text, marks = "", []
    for index in range(FIRST_INDEX, LAST_INDEX + 1):
        marks.append((len(text), pages[index]["page"]))
        text += strip(pages[index]["text"]) + "\n"
    return text, marks


def page_at(marks: list[tuple[int, str]], offset: int) -> str:
    label = marks[0][1]
    for start, name in marks:
        if start <= offset:
            label = name
    return label


def headings(text: str) -> list[tuple[int, int]]:
    out: list[tuple[int, int]] = []
    for m in re.finditer(r"‌\s*‌\s*سورة\s+\"?\s*([^\s،.(]+(?: [^\s،.(]+)?)", text):
        name = m.group(1).strip()
        for known in SURA_NAMES:
            if name.startswith(known) and (len(name) == len(known) or name[len(known)] == " "):
                out.append((m.start(), SURA_NUMBER[known]))
                break
    return out


def group_headings(text: str) -> list[int]:
    return [m.start() for m in re.finditer(r"‌\s*‌\s*ومن سورة [^\s]+ إلى (?:سورة )?[^\s]+", text)]


def cut_items(text: str) -> list[tuple[int, str]]:
    starts = [m.start() for m in re.finditer(r"\(واختلفوا\)", text)]
    out = []
    for i, start in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(text)
        body = text[start:end]
        stop = re.search(r"\(واتفقوا\)|\(وفيها|‌\s*‌\s*(?:ومن )?سورة", body[10:])
        if stop:
            body = body[:stop.start() + 10]
        out.append((start, body.strip()))
    return out


def expand_terms(text: str) -> str:
    for term, names in TERMS:
        text = re.sub(term, names, text)
    return text


def clauses(body: str) -> tuple[str, list[dict]]:
    """(lemma, clauses): each clause has the qāriʾ or transmitters it names and whether it is 'the rest'."""
    folded = fold(body)
    m = re.match(r"\(واختلفوا\)\s*في\s*:?\s*", folded)
    tail = folded[m.end():] if m else folded
    marks = list(CLAUSE.finditer(" " + tail))
    lemma = tail[: marks[0].start()].strip() if marks else tail[:40]
    out: list[dict] = []
    for i, mark in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(tail) + 1
        piece = (" " + tail)[mark.end():end]
        rest = bool(re.match(r"\s*الباقون", piece))
        head = FORM_START.split(" " + piece, maxsplit=1)[0]
        head = re.sub(r"^\s*الباقون", "", head)
        named, outside = wc.parse_readers(expand_terms(head))
        out.append({"rest": rest, "readers": sorted(named), "outside": outside, "text": piece.strip()[:180]})
    return lemma, out


def features_by_sura() -> dict[int, list[dict]]:
    out: dict[int, list[dict]] = {}
    for path in sorted(DATA.glob("sura-*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data["sura"] >= 2:
            out[data["sura"]] = [f for f in data["features"] if f.get("scope") != "rule"]
    return out


def lemma_score(lemma_words: set[str], other: str) -> float:
    a, b = lemma_words, wc.words(other)
    if not a or not b:
        return 0.0

    def stem(w: str) -> str:
        return w[1:] if len(w) > 3 else w

    hits = 0
    sk_b = {lib.skeleton(o) for o in b}
    for word in a:
        if word in b or lib.skeleton(word) in sk_b or any(
            len(word) >= 4 and len(o) >= 4 and SequenceMatcher(None, lib.skeleton(word), o).ratio() >= 0.75 for o in sk_b
        ) or any(
            stem(word) == stem(o) or SequenceMatcher(None, word, o).ratio() >= 0.8 for o in b if len(o) >= 3
        ):
            hits += 1
    return hits / len(a)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    text, marks = load_text()
    heads = headings(text)
    groups = group_headings(text)
    features = features_by_sura()
    items = cut_items(text)

    def sura_at(offset: int) -> int:
        current = 2
        for position, number in heads:
            if position <= offset:
                current = number
        return current

    def group_range(offset: int) -> tuple[int, int] | None:
        index = -1
        for i, position in enumerate(groups):
            if position <= offset:
                index = i
        return GROUP_RANGES[index] if 0 <= index < len(GROUP_RANGES) else None

    results: list[dict] = []
    cursor = {"sura": 2, "verse": 0}
    for offset, body in items:
        sura = sura_at(offset)
        lemma, parts = clauses(body)
        lw = wc.words(lemma)
        span = group_range(offset)
        if span and sura >= 60:
            best = None
            for candidate in range(max(span[0], cursor["sura"]), span[1] + 1):
                score = max((lemma_score(lw, f.get("lemma") or "") for f in features.get(candidate, [])), default=0.0)
                if score >= 0.5:
                    best = candidate
                    break
            sura = best or max(span[0], cursor["sura"])
        if sura != cursor["sura"]:
            cursor = {"sura": sura, "verse": 0}
        pool = features.get(sura, [])
        scored = []
        for f in pool:
            quote = next((c["quote"] for g in f["groups"] for c in g.get("claims", [])), "")
            score = max(lemma_score(lw, f.get("lemma") or ""), lemma_score(lw, quote) * 0.9)
            if score < 0.5 or wc.is_yaa(f):
                continue
            verse = int(f["verse"].rsplit("-", 1)[1])
            scored.append((score, -abs(verse - cursor["verse"]) if verse >= cursor["verse"] - 2 else -99, f))
        record = {"sura": sura, "page": page_at(marks, offset), "lemma": lemma[:60], "text": body[:600]}
        if not scored:
            results.append({**record, "status": "not_located"})
            continue
        scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
        named = [p for p in parts if not p["rest"] and p["readers"]]

        def judge(feature: dict) -> tuple[str, str | None]:
            partition = wc.tahbir_partition(feature)
            problem = None
            flat = []
            for p in named:
                hit = {partition[r] for r in p["readers"] if r in partition}
                if len(hit) > 1:
                    problem = "an-Nashr groups readers that Taḥbīr separates"
                elif len(hit) == 1:
                    flat.append(next(iter(hit)))
            if problem is None and len(flat) != len(set(flat)):
                problem = "an-Nashr separates readers that Taḥbīr groups together"
            if problem is None and len(named) == 1 and any(p["rest"] for p in parts) and not named[0]["outside"]:
                # Taḥbīr keeps with the named readers someone an-Nashr leaves to "the rest".
                union = {r for p in named for r in p["readers"]}
                for p in named:
                    hit = {partition[r] for r in p["readers"] if r in partition}
                    if len(hit) == 1:
                        group = next(iter(hit))
                        extra = {r for r, g in partition.items() if g == group} - union
                        if extra and len(extra) < len({r for r, g in partition.items() if g == group}):
                            problem = "an-Nashr leaves to the rest a reader Taḥbīr groups with the named ones"
            return ("differ" if problem else ("agree" if flat else "not_located")), problem

        # An item can be about a word that recurs in the sura, so every candidate is tried and one that
        # agrees wins; only when none agrees is the best lemma match reported as a difference.
        verdicts = [(judge(f), score, f) for score, _, f in scored]
        chosen = next((v for v in verdicts if v[0][0] == "agree"), verdicts[0])
        (status, problem), _, feature = chosen
        cursor["verse"] = max(cursor["verse"], int(feature["verse"].rsplit("-", 1)[1]))
        results.append({
            **record, "feature": feature["id"], "verse": feature["verse"], "tahbir_lemma": feature.get("lemma"),
            "status": status, "problem": problem,
            "nashr_clauses": [{k: p[k] for k in ("rest", "readers", "outside", "text")} for p in parts],
        })
    counts = Counter(r["status"] for r in results)
    print(dict(counts), "of", len(results))
    OUT.write_text(json.dumps({
        "schema": "qiraat-second-witness-nashr-auto/0.1",
        "note": "A machine first pass: does Taḥbīr keep together the readers an-Nashr names together. Not a finding; every difference is read by a person.",
        "counts": dict(counts), "items": results,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("wrote", OUT.relative_to(lib.REPO))
    return 0


if __name__ == "__main__":
    sys.exit(main())
