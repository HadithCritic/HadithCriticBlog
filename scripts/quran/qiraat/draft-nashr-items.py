#!/usr/bin/env python3
"""Draft an-Nashr claims for positions already entered from Taḥbīr, keeping only the ones that agree.

an-Nashr (Shamela 22642, vol. 2 pp. 206 to 402) states the same words as Taḥbīr, with route detail. For each
item that `nashr-compare.py` found to agree in grouping, this script reads the clauses of the item as
"so A, B and C read X, and the rest read Y", turns each into a form whose readers are the names in the
clause, and maps the form to the Taḥbīr reading (`value_of`) that holds those readers. The result is a batch of
items with `merge_into` (the Taḥbīr item), which the assembler adds as claims of a second book to the same
position.

The script is deliberately narrow. It skips an item when

- the text has any word of route, agreement or place (he agreed, he reported, only here, wherever, the two
  places), or any clause it cannot read completely, or
- a transmitter would end up with a different reading from the one Taḥbīr gives him (a difference is not a
  corroboration, and is left to `second-witness/`).

    python scripts/quran/qiraat/draft-nashr-items.py     # writes farsh/nashr/batch-22642-agree.json
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


vfi = load("vfi", "verify-farsh-items.py")
nc = load("nc", "nashr-compare.py")

QIRAAT = lib.QIRAAT_DIR
OUT_DIR = QIRAAT / "farsh" / "nashr"
OUT = OUT_DIR / "batch-22642-agree.json"
A = json.loads((QIRAAT / "authorities.json").read_text(encoding="utf-8"))
NAMES = vfi.name_table(A)
# Transmitters whose bare name is shared or needs a disambiguating word: an item that uses them is skipped.
AMBIGUOUS = {"duri_abu_amr", "duri_kisai", "khalaf_hamza"}
QARI_OF = {r["id"]: r["qari"] for r in A["riwayat"]}
RIWAYAT_OF = {q["id"]: q["riwayat"] for q in A["qaris"]}
GROUPS = {"madaniyan": ["abu_jafar", "nafi"], "basriyan": ["abu_amr", "yaqub"], "kufiyun_nashr": ["asim", "hamza", "kisai", "khalaf_ashir"]}

MARK = re.compile(r"(?:^|[\s،.])(?:ف|و)?قر[أا](?:ه|هما|ت)?\s+")
_FORBIDDEN_WORDS = (
    "روى|رواه|رواية|واختلف|وافق|وافقه|وافقهم|وافقهما|انفرد|إلا|فقط|حيث|هنا|الموضعين|الحرفين|الأربعة|الثلاثة|عنه|عنهم|"
    "من طريق|وحده|الجميع|بخلاف|كذلك|أيضا|وكذا|ويجوز|قيل|وقد|ذكر|خاصة"
)
# a word of route, agreement or place, whole (optionally with a conjunction before it)
FORBIDDEN = re.compile(r"(?<![ء-ي])[وف]?(?:" + _FORBIDDEN_WORDS + r")(?![ء-ي])")
STOP_AT = re.compile(r"\(واختلفوا\)|\(واتفقوا\)|\(وفيها|\(ومن الزوائد|\(قلت\)|وتقدم|‌\s*‌|ومن سورة")

# Names to look for, longest first; the ambiguous transmitters are left out on purpose.
ALTS: list[tuple[str, str]] = []
for ident, names in NAMES.items():
    if ident in AMBIGUOUS:
        continue
    for name in names:
        ALTS.append((lib.normalize(name), ident))
for term, gid in (("البصريان", "basriyan"), ("المدنيان", "madaniyan"), ("الكوفيون", "kufiyun_nashr")):
    ALTS.append((lib.normalize(term), "g:" + gid))
ALTS.sort(key=lambda x: -len(x[0]))


def read_head(head: str) -> tuple[list[tuple[str, str, str]], int] | None:
    """([(kind, id, span)], where the names end), or None. A short quoted word after the names is allowed."""
    out: list[tuple[str, str, str]] = []
    pos = 0
    end = 0
    head = head.strip()
    while pos < len(head):
        while pos < len(head) and head[pos] in " ،":
            pos += 1
        if pos >= len(head):
            break
        if head[pos] == "و" and not any(head.startswith(n, pos) for n, _ in ALTS if n.startswith("و")):
            pos += 1
            continue
        for name, ident in ALTS:
            if head.startswith(name, pos) and (pos + len(name) >= len(head) or not head[pos + len(name)].isalpha()):
                out.append(("g" if ident.startswith("g:") else "a", ident.removeprefix("g:"), name))
                pos += len(name)
                end = pos
                break
        else:
            tail = head[pos:]
            if out and len(tail.split()) <= 4 and not any(n in tail for n, _ in ALTS if len(n) > 4):
                return out, end
            return None
    return (out, end) if out else None


FAMILIES = {
    "person": {"yaa": r"(?:بالياء|باليا|بياء|على التذكير|بالغيب)", "taa": r"(?:بالتاء|بالتا|بتاء|على التأنيث|بالخطاب)", "noon": r"(?:بالنون|بنون)"},
    "case": {"raf": r"(?:بالرفع|برفع)", "nasb": r"(?:بالنصب|بنصب)", "khafd": r"(?:بالخفض|بخفض|بالجر)", "jazm": r"(?:بالجزم|بجزم)"},
    "shadda": {"shadd": r"(?:بالتشديد|بتشديد|مشددا|مثقلا)", "khaff": r"(?:بالتخفيف|بتخفيف|مخففا)"},
}


def family_values(text: str) -> dict[str, str]:
    """The person, case or doubling a label states, when it states exactly one of a family."""
    out = {}
    for family, options in FAMILIES.items():
        hits = {k for k, pattern in options.items() if re.search(pattern, text)}
        if len(hits) == 1:
            out[family] = next(iter(hits))
    return out


_QARI_WORDS = "نافع|ابن كثير|أبو عمرو|أبي عمرو|ابن عامر|عاصم|حمزة|الكسائي|الكسائى|أبو جعفر|أبي جعفر|يعقوب|خلف"
_COMPOUNDS = (
    (re.compile(r"الدوري\s+عن\s+(?:أبي|أبو)\s+عمرو"), "duri_abu_amr"),
    (re.compile(r"الدوري\s+عن\s+الكسائ[يى]"), "duri_kisai"),
    (re.compile(r"خلف\s+عن\s+حمزة"), "khalaf_hamza"),
)
_VIA = re.compile(r"(?:%s)\s+(?:في\s+|من\s+)?(?:رواية|برواية)\s+" % _QARI_WORDS)
_FROM = re.compile(r"\s+عن\s+(?:%s)(?![ء-ي])" % _QARI_WORDS)


def read_head_rich(head: str) -> list[tuple[str, str, str]] | None:
    """Like read_head, but also reads "al-Dūrī from Abū ʿAmr", "Nāfiʿ in the narration of Warsh" and "Ḥafṣ from ʿĀṣim".

    The whole head must be names; a transmitter keeps his own name and the qāriʾ he narrates from is dropped."""
    found: list[tuple[str, str, str]] = []
    for pattern, ident in _COMPOUNDS:
        for m in pattern.finditer(head):
            found.append(("a", ident, m.group(0)))
        head = pattern.sub(" ", head)
    head = _VIA.sub(" ", head)
    head = _FROM.sub(" ", head)
    head = head.strip(" ،")
    if head:
        got = read_head(head)
        if got is None or got[1] != len(head.rstrip()):
            return None
        found.extend(got[0])
    return found or None


def transmitters(kind: str, ident: str) -> set[str]:
    if kind == "g":
        return {r for q in GROUPS[ident] for r in RIWAYAT_OF[q]}
    return set(RIWAYAT_OF[ident]) if ident in RIWAYAT_OF else {ident}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    stream = lib.Stream(lib.load_book("22642"))
    text = stream.text
    compare = json.loads((QIRAAT / "second-witness" / "nashr-compare-auto.json").read_text(encoding="utf-8"))
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

    NOTES: list[dict] = []
    CUR: dict = {}

    def note(reason: str) -> None:
        skipped[reason] += 1
        NOTES.append({**CUR, "reason": reason})

    items, skipped = [], Counter()
    clashes: list[dict] = []
    disagreements: list[dict] = []
    seen_targets: set[tuple[str, str]] = set()
    counter: Counter = Counter()
    for entry in compare["items"]:
        if entry["status"] != "agree":
            continue
        CUR.clear()
        CUR.update(feature=entry["feature"], nashr_lemma=entry["lemma"][:60], page=entry["page"])
        start = text.find(lib.normalize(entry["text"][:60]))
        ends = [m.start() for m in STOP_AT.finditer(text, start + 12)]
        end = min(ends) if ends else start + 900
        body = text[start:end].strip()
        CUR.update(body=body[:1600], page=stream.book.pages[bisect.bisect_right(stream.starts, start) - 1]["page"], volume="2")
        if FORBIDDEN.search(body[12:]):
            note("route, agreement or place word")
            continue
        marks = list(MARK.finditer(" " + body))
        if not marks:
            note("no clause")
            continue
        lemma = re.sub(r"^\(واختلفوا\)\s*في\s*:?\s*", "", (" " + body)[: marks[0].start()].strip()).strip(" ،:")
        lemma_plain = lemma.strip("()").strip()
        if not lemma_plain or len(lemma_plain.split()) > 4:
            note("lemma")
            continue
        feature = feature_of(entry["feature"])
        tah_groups = [g for g in feature["groups"] if g["kind"] == "reading"]
        by_transmitter = {m: g["value"] for g in tah_groups for m in g["members"]}
        clauses = []
        ok = True
        for i, mark in enumerate(marks):
            clause_end = marks[i + 1].start() if i + 1 < len(marks) else len(body) + 1
            piece = (" " + body)[mark.end():clause_end].strip(" ،.")
            rest = piece.startswith("الباقون")
            head_part = nc.FORM_START.split(" " + piece, maxsplit=1)
            head = head_part[0].strip()
            form = piece[len(head):].strip(" ،.") if not rest else piece[len("الباقون"):].strip(" ،.")
            if rest:
                if head != "الباقون" and not head.startswith("الباقون"):
                    ok = False
                    break
                clauses.append({"rest": True, "readers": [], "form": form})
                continue
            got = read_head(head)
            if got is None:
                ok = False
                break
            names, name_end = got
            form = piece[name_end:].strip(" ،.")
            if len(form.split()) > 12 or not form or "الباقون" in form:
                ok = False
                break
            clauses.append({"rest": False, "readers": names, "form": form})
        named = [c for c in clauses if not c["rest"]]
        rests = [c for c in clauses if c["rest"]]
        if not ok or not named or len(rests) > 1:
            note("unreadable clause")
            continue
        predicted: dict[str, str] = {}
        forms = []
        used_values: set[str] = set()
        bad = False
        label_clash = False
        for c in named:
            members = set().union(*(transmitters(k, i) for k, i, _ in c["readers"]))
            values = {by_transmitter[m] for m in members if m in by_transmitter}
            if len(values) != 1:
                bad = True
                break
            value = next(iter(values))
            label = next((g.get("value_label") or "" for g in tah_groups if g["value"] == value), "")
            here, there = family_values(c["form"]), family_values(label)
            if any(here[f] != there[f] for f in here if f in there):
                bad = True
                label_clash = True
                break
            for m in members:
                predicted[m] = value
            used_values.add(value)
            forms.append({"desc": c["form"], "readers": [[k, i, s] for k, i, s in c["readers"]], "value_of": int(value[1:])})
        if bad:
            skipped["form label differs from Taḥbīr" if label_clash else "readers split across Taḥbīr readings"] += 1
            if label_clash:
                clashes.append({"item": entry["feature"], "nashr": " ".join(c["form"].split()[:8]), "tahbir": label})
            continue
        if rests:
            remaining = {g["value"] for g in tah_groups} - used_values
            if len(remaining) == 1:
                value = next(iter(remaining))
                forms.append({"desc": rests[0]["form"], "readers": [], "rest": "الباقون", "value_of": int(value[1:])})
                for m, v in by_transmitter.items():
                    predicted.setdefault(m, value)
            else:
                note("rest not determined")
        # every transmitter Taḥbīr states must have the reading this draft gives him
        clash = [m for m, v in by_transmitter.items() if predicted.get(m, v) != v]
        if clash:
            disagreements.append({"feature": entry["feature"], "tahbir_lemma": feature.get("lemma"), "nashr": body[:260],
                                  "transmitters": clash})
            note("a transmitter differs from Taḥbīr")
            continue
        key = (entry["feature"], entry["page"])
        if key in seen_targets:
            note("second item for one position")
            continue
        seen_targets.add(key)
        # the evidence runs from the start of the item to the end of its last clause
        last_form = forms[-1]["desc"]
        ev_start = " ".join(body.split()[:10])
        ev_end = " ".join(last_form.split()[-6:])
        first_page_index = bisect.bisect_right(stream.starts, start) - 1
        last_page_index = bisect.bisect_right(stream.starts, end - 1) - 1
        page = stream.book.pages[first_page_index]["page"]
        page_end = stream.book.pages[last_page_index]["page"]
        counter[page] += 1
        item = {
            "id": f"n{page}-{counter[page]:02d}", "page": page, "volume": "2",
            "ev": [ev_start, ev_end], "lemma": lemma_plain, "verse": feature["verse"].replace("verse-", "").replace("-", ":").lstrip("0") if False else None,
            "scope": feature["scope"], "forms": forms, "merge_into": tahbir_items[entry["feature"]],
            "_feature": entry["feature"],
        }
        if page_end != page:
            item["page_end"] = page_end
        items.append(item)
    # the verse is the one of the Taḥbīr position
    for item in items:
        sura, verse = (int(x) for x in item["_feature"].split("-")[1:3])
        item["verse"] = f"{sura}:{verse}"
        del item["_feature"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "schema": "qiraat-farsh-batch/0.1", "book_id": "22642", "coverage": "supplement",
        "pages": {"volume": "2", "from": "206", "to": "402"}, "items": items, "skipped": [],
        "note": "Drafted by draft-nashr-items.py from items that agree with Taḥbīr in grouping; see D-083.",
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (OUT_DIR / "label-clashes.json").write_text(json.dumps(clashes, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (QIRAAT / "second-witness" / "nashr-disagreements.json").write_text(json.dumps(disagreements, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (QIRAAT / "second-witness" / "nashr-not-entered.json").write_text(json.dumps(NOTES, ensure_ascii=False, indent=1) + chr(10), encoding="utf-8")
    print(len(items), "items drafted;", dict(skipped))
    return 0


if __name__ == "__main__":
    sys.exit(main())
