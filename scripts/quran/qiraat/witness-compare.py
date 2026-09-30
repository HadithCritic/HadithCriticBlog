#!/usr/bin/env python3
"""First-pass comparison of Taḥbīr's positions with al-Mabsūṭ (an independent witness of the ten).

For each Taḥbīr position the script finds the al-Mabsūṭ item on the same word, reads which transmitters
each clause names, and compares the *partition* of the twenty transmitters: who reads together, and who
reads differently from them. It says nothing about the form of a reading, only who is grouped with whom.

Statuses (a machine draft, never a finding):
  agree        every named group of al-Mabsūṭ sits inside one Taḥbīr group and different groups sit in different ones
  partial      consistent, but the two books split the readers into a different number of groups, or too few are named
  differ       al-Mabsūṭ puts together readers that Taḥbīr separates, or separates ones Taḥbīr puts together
  not_located  no al-Mabsūṭ item on this word was found

Routes that are not among the twenty (Zayd from Yaʿqūb, al-Burjumī from Shuʿba, Qutayba from al-Kisāʾī and
so on) are left out of the reader sets, so an item that rests only on them cannot be located by this script.

    python scripts/quran/qiraat/witness-compare.py            # write second-witness/compare-auto.json
    python scripts/quran/qiraat/witness-compare.py --sura 2   # print one sura
"""

from __future__ import annotations

import argparse
from difflib import SequenceMatcher
import importlib.util
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import qiraat_lib as lib  # noqa: E402

spec = importlib.util.spec_from_file_location("witness_gap", HERE / "witness-gap.py")
gap = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
spec.loader.exec_module(gap)  # type: ignore[union-attr]

DATA = lib.REPO / "src" / "data" / "qiraat"
OUT = lib.QIRAAT_DIR / "second-witness" / "compare-auto.json"
AUTH = json.loads((lib.QIRAAT_DIR / "authorities.json").read_text(encoding="utf-8"))
RIWAYAT = {r["id"]: r for r in AUTH["riwayat"]}
QARIS = {q["id"]: q for q in AUTH["qaris"]}


def fold(text: str) -> str:
    text = lib.normalize(text)
    for a, b in (("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ٱ", "ا"), ("ؤ", "و"), ("ئ", "ي"), ("ى", "ي"), ("ة", "ه"), ("ء", "")):
        text = text.replace(a, b)
    return text


QARI_NAMES = {
    "nafi": ["نافع"], "abu_jafar": ["ابو جعفر", "ابي جعفر", "ابا جعفر"], "abu_amr": ["ابو عمرو", "ابي عمرو", "ابا عمرو"],
    "yaqub": ["يعقوب"], "asim": ["عاصم"], "hamza": ["حمزه"], "khalaf_ashir": ["خلف"], "kisai": ["الكسايي", "الكسائي", "الكساي"],
    "ibn_amir": ["ابن عامر"], "ibn_kathir": ["ابن كثير"],
}
RIWAYA_NAMES = {
    "warsh": ["ورش"], "qalun": ["قالون", "قلون"], "ibn_wardan": ["ابن وردان"], "ibn_jammaz": ["ابن جماز"],
    "duri_abu_amr": [], "susi": ["السوسي", "ابو شعيب"], "ruways": ["رويس"], "rawh": ["روح"], "shuba": ["شعبه", "ابو بكر", "ابي بكر", "ابا بكر"],
    "hafs": ["حفص"], "khalaf_hamza": [], "khallad": ["خلاد"], "ishaq": ["اسحاق"], "idris": ["ادريس"], "abu_harith": ["ابو الحارث"],
    "duri_kisai": [], "hisham": ["هشام"], "ibn_dhakwan": ["ابن ذكوان"], "bazzi": ["البزي"], "qunbul": ["قنبل"],
}
ALL_NAMES = sorted(
    [(n, ("q", k)) for k, names in QARI_NAMES.items() for n in names]
    + [(n, ("r", k)) for k, names in RIWAYA_NAMES.items() for n in names],
    key=lambda x: -len(x[0]),
)
OUTSIDE_TRANSMITTERS = re.compile(
    r"(البرجمي|الاعشي|نصير|قتيبه|زيد|حماد|يحيي|ابن فليح|القواس|شبل|اسماعيل|ابن سعدان|الحلواني|هبيره|عبد الحميد|اسيد|خارجه|القطعي|رجاء|العجلي|ابان)")
CONNECT = re.compile(r"^(?:و|،|\s|في رواية|برواية|من طريق|في|رواية)+$")


def resolve_name(text: str) -> tuple[str, str] | None:
    t = fold(text).strip()
    for name, ident in ALL_NAMES:
        if t == fold(name) or t.startswith(fold(name) + " "):
            return ident
    return None


def riwayat_of_qari(qid: str) -> list[str]:
    return list(QARIS[qid]["riwayat"])


def parse_readers(part: str) -> tuple[set[str], bool]:
    """(riwāya ids named, whether the text names anyone outside the twenty)."""
    text = fold(part)
    text = re.sub(r"\[[^\]]*\]", " ", text)
    found: set[str] = set()
    outside = False
    entries = [e.strip() for e in re.split(r"\sو|،", " " + text) if e.strip()]
    for entry in entries:
        # The text is folded (ة becomes ه), so the patterns are spelled the folded way.
        entry = re.sub(r"(?:في روايه|بروايه|من طريق|روايه)", " برواية ", entry)
        # "X عن Y" and "Q برواية R"
        m = re.match(r"^(.*?)\s+(?:عن|برواية)\s+(.*)$", entry)
        if m:
            left, right = m.group(1).strip(), m.group(2).strip()
            l, r = resolve_name(left), resolve_name(right)
            if "برواية" in entry and l and l[0] == "q":
                if r and r[0] == "r" and RIWAYA_NAMES.get(r[1]) is not None and RIWAYAT[r[1]]["qari"] == l[1]:
                    found.add(r[1])
                elif OUTSIDE_TRANSMITTERS.search(right) or not r:
                    outside = True
                else:
                    found.update(riwayat_of_qari(l[1]))
                continue
            if l and r and r[0] == "q" and l[0] == "r":
                found.add(l[1])
                continue
            if l and l[0] == "q" and r and r[0] == "q":
                found.update(riwayat_of_qari(l[1]))
                continue
            if left and (OUTSIDE_TRANSMITTERS.search(left) or not l):
                outside = True
                continue
            if l and l[0] == "r":
                found.add(l[1])
                continue
        ident = resolve_name(entry)
        if ident is None:
            if OUTSIDE_TRANSMITTERS.search(entry):
                outside = True
            continue
        if ident[0] == "q":
            found.update(riwayat_of_qari(ident[1]))
        else:
            found.add(ident[1])
    return found, outside


READ_MARK = re.compile(r"(?:^|[\s.،])(?:و)?قرا(?:ت)?\s+")


def clauses_of(item: str) -> list[dict]:
    """Split an al-Mabsūṭ item into clauses: readers, whether it is 'the rest', the word it is about, its text."""
    text = fold(item)
    pieces: list[dict] = []
    marks = [m for m in READ_MARK.finditer(text)]
    previous_lemma = ""
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        body = text[m.end():end]
        brace = re.search(r"[{(\[]", body)
        reader_part = body[: brace.start()] if brace else " ".join(body.split()[:12])
        rest = bool(re.match(r"^\s*الباقون", reader_part))
        lemma = " ".join(re.findall(r"\{([^}]+)\}", body)) or previous_lemma
        previous_lemma = lemma or previous_lemma
        if rest:
            named, outside = parse_readers(re.sub(r"^\s*الباقون", "", reader_part))
        else:
            named, outside = parse_readers(reader_part)
        pieces.append({"rest": rest, "readers": sorted(named), "outside": outside, "lemma": lemma, "text": body.strip()[:160]})
    # "the rest, and Warsh ..." moves a named transmitter out of the clauses that named his qāriʾ.
    for piece in pieces:
        if piece["rest"] and piece["readers"]:
            for other in pieces:
                if other is not piece and not other["rest"]:
                    other["readers"] = [r for r in other["readers"] if r not in piece["readers"]]
    return pieces


def tahbir_partition(feature: dict) -> dict[str, int]:
    out: dict[str, int] = {}
    for index, group in enumerate(feature["groups"]):
        if group["kind"] != "reading":
            continue
        for member in group["members"]:
            out[member] = index
    return out


def words(text: str) -> set[str]:
    return {w for w in re.findall(r"[ء-ي]+", fold(text)) if len(w) >= 3}


def similar_count(a: set[str], b: set[str]) -> int:
    """How many words of `a` have an equal or very similar word in `b` (the books spell some words differently)."""
    hits = 0
    for word in a:
        if word in b or any(len(word) >= 4 and len(other) >= 4 and SequenceMatcher(None, word, other).ratio() >= 0.8 for other in b):
            hits += 1
    return hits


YAA = re.compile(r"(فتحها|فتحهما|سكنها|سكنهما|أسكنها|أثبتها|أثبتهما|حذفها|حذفهما|أثبت|حذف)")


YAA_LABEL = re.compile(r"^\s*(فتح|سكن|أسكن|أثبت|حذف)")


def is_yaa(feature: dict) -> bool:
    for group in feature["groups"]:
        if group["kind"] == "reading" and YAA_LABEL.match(group.get("value_label") or ""):
            return True
    """Positions about a yāʾ (opened, silent, kept or dropped) are compared against al-Mabsūṭ's own yāʾ lists, not here."""
    for group in feature["groups"]:
        for claim in group.get("claims", []):
            if YAA.search(claim["quote"]):
                return True
    return False


def compare(feature: dict, mabsut_items: list[dict]) -> dict:
    if is_yaa(feature):
        return {"status": "yaa_list"}
    verse = int(feature["verse"].rsplit("-", 1)[1])
    lemma_words = {w for w in words(feature.get("lemma") or feature.get("label") or "")}
    best, best_score = None, 0.0
    for item in mabsut_items:
        braces = re.findall(r"\{([^}]+)\}", item["text"]) or [item["text"][:120]]
        ratio = max((similar_count(lemma_words, words(b)) / max(1, len(lemma_words)) for b in braces if lemma_words & words(b)), default=0.0)
        if ratio < 0.5:
            continue
        near = min((abs(verse - v) for v in item["verses"]), default=99)
        if near > 3:
            continue
        score = ratio + (0.3 if near == 0 else 0.15 if near == 1 else 0.0)
        if score > best_score:
            best, best_score = item, score
    if best is None:
        return {"status": "not_located"}
    partition = tahbir_partition(feature)
    parts = [p for p in clauses_of(best["text"]) if similar_count(lemma_words, words(p["lemma"])) / max(1, len(lemma_words)) >= 0.5]
    named = [p for p in parts if not p["rest"] and p["readers"]]
    rest = [p for p in parts if p["rest"] and not p["readers"]] or [p for p in parts if p["rest"]]
    groups_used: list[set[int]] = []
    problem = None
    for p in named:
        gs = {partition[r] for r in p["readers"] if r in partition}
        if len(gs) > 1:
            problem = "al-Mabsūṭ groups readers that Taḥbīr separates"
        groups_used.append(gs)
    flat = [next(iter(gs)) for gs in groups_used if len(gs) == 1]
    if problem is None and len(flat) != len(set(flat)):
        problem = "al-Mabsūṭ separates readers that Taḥbīr groups together"
    tahbir_groups = len({g for g in partition.values()})
    unstated = sum(len(g["members"]) for g in feature["groups"] if g["kind"] == "unstated")
    if problem:
        status = "differ"
    elif not named or not flat:
        status = "not_located"
    elif unstated >= 4:
        status = "partial"
    elif len(flat) + (1 if rest else 0) == tahbir_groups:
        status = "agree"
    else:
        status = "partial"
    return {
        "status": status,
        "matched": {"sura": best["sura"], "item": best["item"], "verses": best["verses"]},
        "problem": problem,
        "mabsut_clauses": [{"rest": p["rest"], "readers": p["readers"], "outside": p["outside"], "text": p["text"]} for p in parts],
        "tahbir_groups": tahbir_groups,
    }


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--sura", type=int)
    args = parser.parse_args()

    sections = gap.mabsut_sections()
    items_by_sura: dict[int, list[dict]] = {}
    for sura, text in sections.items():
        for number, _pos, body in gap.cut_items(text):
            verses = gap.verses_in(body)
            if verses:
                items_by_sura.setdefault(sura, []).append({"sura": sura, "item": number, "verses": verses, "text": body})

    results = []
    for path in sorted(DATA.glob("sura-*.json")):
        sura = int(path.stem.split("-")[1])
        if sura == 1 or (args.sura and sura != args.sura):
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        for feature in data["features"]:
            if feature.get("scope") == "rule":
                continue
            outcome = compare(feature, items_by_sura.get(sura, []))
            results.append({
                "feature": feature["id"], "sura": sura, "verse": feature["verse"], "lemma": feature.get("lemma"),
                "review_state": "machine_first_pass", **outcome,
            })
    from collections import Counter
    counts = Counter(r["status"] for r in results)
    print(dict(counts), "of", len(results))
    if not args.sura:
        OUT.write_text(json.dumps({"schema": "qiraat-second-witness-auto/0.1", "note": "A machine first pass over who is grouped with whom. Not a finding; every difference and a sample of agreements are read by a person.", "counts": dict(counts), "items": results}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print("wrote", OUT.relative_to(lib.REPO))
    return 0


if __name__ == "__main__":
    sys.exit(main())
