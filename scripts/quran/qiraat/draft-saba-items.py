#!/usr/bin/env python3
"""Draft Ibn Mujāhid's Kitāb al-Sabʿa (Shamela 5530) as claims on positions already entered from Taḥbīr.

Ibn Mujāhid (d. 324 AH) gives the seven readers only, and names every side ("so A and B read ..., and C and D read
..."), with the sura from the heading and the verse after the braced word. Each item whose clauses are only names
and a form becomes an item with `merge_into` (the Taḥbīr item at the same sura and verse and a similar word) and a
`value_of` for each form. There is no "the rest": the three readers outside the seven are left unstated.

Skipped: an item with a route, a student or a place word; a form label that contradicts Taḥbīr's; readers split
across Taḥbīr readings; or an item with no single Taḥbīr position at that verse.

    python scripts/quran/qiraat/draft-saba-items.py    # writes farsh/saba/batch-5530-agree.json
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
nc = dn.nc
QIRAAT = lib.QIRAAT_DIR
OUT_DIR = QIRAAT / "farsh" / "saba"
OUT = OUT_DIR / "batch-5530-agree.json"
SEVEN = {"nafi", "ibn_kathir", "abu_amr", "ibn_amir", "asim", "hamza", "kisai"}
SEVEN_TRANSMITTERS = {r for q in SEVEN for r in dn.RIWAYAT_OF[q]}
MARK = re.compile(r"(?:^|[\s.،])(?:ف|و)?قرأ\s+")
FORBIDDEN = re.compile(
    r"(?<![ء-ي])[وف]?(?:روى|روي|واختلف|وافق|وافقه|وافقهم|انفرد|إلا|الا|حيث|كلهم|وكذلك|وكذا|قال|"
    r"أيضا|ياءات)(?![ء-ي])"
)
LATER_HEADING = re.compile(r"ذكر اختلافهم (?:فى|في) سورة ([ء-ي ]{2,30}?)(?= \d| عليه|\s1)")
LATER_SURAS = {
    "الدخان": 44, "الجاثية": 45, "الأحقاف": 46, "محمد صلى الله": 47, "الفتح": 48, "الحجرات": 49, "الذاريات": 51,
    "الطور": 52, "النجم": 53, "القمر": 54, "الرحمن جل ثناؤه": 55, "الواقعة": 56, "الحديد": 57, "المجادلة": 58,
    "الحشر": 59, "الممتحنة": 60, "الصف": 61, "المنافقون": 63, "التغابن": 64, "الطلاق": 65, "التحريم": 66,
    "الملك": 67, "ن القلم": 68, "الحاقه": 69, "الواقع": 70, "نوح": 71, "الجن": 72, "المزمل": 73, "المدثر": 74,
    "القيامة": 75, "الإنسان": 76, "المرسلات": 77, "عم يتساءلون": 78, "النازعات": 79, "عبس": 80, "كورت": 81,
    "انفطرت": 82, "المطففين": 83, "انشقت": 84, "البروج": 85, "الطارق": 86, "الأعلى": 87, "الغاشية": 88,
    "الفجر": 89, "البلد": 90, "الشمس": 91, "الليل": 92, "الضحى": 93, "العلق": 96, "القدر": 97, "لم يكن": 98,
    "الزلزلة": 99, "القارعة": 101, "التكاثر": 102, "العصر": 103, "الهمزة": 104, "قريش": 106, "الكافرون": 109,
    "المسد": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114,
}
PLACE_IN_FORM = re.compile(r"(?<![ء-ي])(?:و)?(?:سورة|السورة|السورتين|ههنا|هنا|وفي|وفى)(?![ء-ي])")
HEAD_END = re.compile(r"\{|\s/\s|\s(?:ب|م)[ء-ي]")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    stream = lib.Stream(lib.load_book("5530"))
    text = stream.text
    heads = [m.start() for m in re.finditer(r"‌\s*‌\s*سورة", text)]
    # The 43 headings of the first part cover suras 1 to 43 in order. After al-Zukhruf the book heads each sura
    # "ذكر اختلافهم في سورة X" and skips the suras it has nothing to say about, so the sura comes from the name.
    later = [(m.start(), LATER_SURAS[m.group(1).strip()]) for m in LATER_HEADING.finditer(text)
             if m.start() > heads[-1] and m.group(1).strip() in LATER_SURAS]
    starts = [(h, i + 1) for i, h in enumerate(heads)] + later
    starts.sort()
    tahbir_items: dict[str, str] = {}
    by_sura: dict[int, list[dict]] = {}
    for path in sorted((QIRAAT / "claims").glob("farsh-sura-[0-9][0-9][0-9].json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for fid, feature in data["features"].items():
            tahbir_items[fid] = feature["item"]
    for path in sorted((lib.REPO / "src" / "data" / "qiraat").glob("sura-[0-9][0-9][0-9].json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data["sura"] >= 2:
            by_sura[data["sura"]] = [f for f in data["features"] if f.get("scope") != "rule"]
    NOTES: list[dict] = []
    CUR: dict = {}

    def note(reason: str) -> None:
        skipped[reason] += 1
        NOTES.append({**CUR, "reason": reason})

    items, skipped, counter = [], Counter(), Counter()
    seen: set[str] = set()
    for i, (section_start, sura) in enumerate(starts):
        if sura < 2 or (i > 0 and starts[i - 1][1] == sura):
            continue
        section_end = starts[i + 1][0] if i + 1 < len(starts) else len(text)
        section = text[section_start:section_end]
        marks = list(re.finditer(r"(?<![ء-ي\d])\d{1,3} - ", section))
        for k, m in enumerate(marks):
            body = section[m.end(): marks[k + 1].start() if k + 1 < len(marks) else len(section)].strip()
            body = body.split("‌")[0].strip()  # the next sura's heading follows the last item of a section
            CUR.clear()
            CUR.update(sura=sura, number=k + 1, starts=body[:70], body=body[:1600], volume="1",
                       page=stream.book.pages[bisect.bisect_right(stream.starts, section_start + m.end()) - 1]["page"])
            skipped["items read"] += 1
            if not body.startswith(("واختلفوا", "اختلفوا", "قوله")) or FORBIDDEN.search(body[10:]):
                note("route, agreement or place word")
                continue
            clause_marks = list(MARK.finditer(" " + body))
            if len(clause_marks) < 2:
                note("fewer than two clauses")
                continue
            brace = re.search(r"\{([^}]*)\}\s*(\d+)", body)
            if not brace:
                note("no braced word with a verse")
                continue
            word, verse = brace.group(1).strip(), int(brace.group(2))
            lw = nc.wc.words(word)
            scored = []
            for f in by_sura.get(sura, []):
                if int(f["verse"].rsplit("-", 1)[1]) != verse:
                    continue
                other = f.get("lemma") or ""
                cov = max(nc.lemma_score(lw, other), nc.lemma_score(nc.wc.words(other), word))
                if cov >= 0.5:
                    scored.append((cov, f))
            if not scored:
                # Ibn Mujāhid numbers some verses one apart from the count Taḥbīr uses; accept a neighbouring verse
                # only for a word that matches the position's lemma almost completely.
                for f in by_sura.get(sura, []):
                    if abs(int(f["verse"].rsplit("-", 1)[1]) - verse) != 1:
                        continue
                    other = f.get("lemma") or ""
                    cov = nc.lemma_score(nc.wc.words(other), word)
                    if cov >= 0.9:
                        scored.append((cov, f))
            scored.sort(key=lambda x: -x[0])
            candidates = [f for cov, f in scored if cov == scored[0][0]] if scored else []
            if not candidates:
                note("no single Taḥbīr position at that verse")
                continue
            for feature in candidates:
                tah_groups = [g for g in feature["groups"] if g["kind"] == "reading"]
                by_transmitter = {mm: g["value"] for g in tah_groups for mm in g["members"]}
                clauses, ok = [], True
                for j, cm in enumerate(clause_marks):
                    end = clause_marks[j + 1].start() if j + 1 < len(clause_marks) else len(body) + 1
                    piece = (" " + body)[cm.end():end].strip(" ،.")
                    cut = HEAD_END.search(piece)
                    head = piece[: cut.start()].strip() if cut else ""
                    head = re.sub(r"\s+وحده$", "", head)
                    names = dn.read_head_rich(head) if head else None
                    if names is None:
                        ok = False
                        break
                    if not all(kind == "a" and (ident in SEVEN or ident in SEVEN_TRANSMITTERS) for kind, ident, _s in names):
                        ok = False
                        break
                    form = re.sub(r"^\s*وحده\s*", "", piece[len(head):]).strip(" ،.")
                    if PLACE_IN_FORM.search(form):
                        ok = False
                        break
                    if not form or "الباقون" in form or len(form.split()) > 14:
                        ok = False
                        break
                    clauses.append({"readers": names, "form": form})
                if not ok:
                    note("unreadable clause")
                    continue
                seen_readers = [(kk, ii) for c in clauses for kk, ii, _s in c["readers"]]
                if len(seen_readers) != len(set(seen_readers)):
                    note("a reader in two clauses")
                    continue
                forms, bad = [], False
                for c in clauses:
                    members = set().union(*(dn.transmitters(kk, ii) for kk, ii, _ in c["readers"]))
                    values = {by_transmitter[x] for x in members if x in by_transmitter}
                    if len(values) != 1:
                        bad = True
                        break
                    value = next(iter(values))
                    label = next((g.get("value_label") or "" for g in tah_groups if g["value"] == value), "")
                    here, there = dn.family_values(c["form"]), dn.family_values(label)
                    if any(here[f] != there[f] for f in here if f in there):
                        bad = True
                        break
                    forms.append({"desc": c["form"], "readers": [[kk, ii, s] for kk, ii, s in c["readers"]], "value_of": int(value[1:])})
                if bad:
                    note("readers split or label differs")
                    continue
                if feature["id"] in seen:
                    note("second item for one position")
                    continue
                seen.add(feature["id"])
                start = section_start + m.end()
                first = bisect.bisect_right(stream.starts, start) - 1
                last = bisect.bisect_right(stream.starts, start + len(body) - 1) - 1
                page, page_end = stream.book.pages[first]["page"], stream.book.pages[last]["page"]
                volume = stream.book.pages[first].get("volume") or "1"
                window = {"book_id": "5530", "page": page, "volume": volume, **({"page_end": page_end} if page_end != page else {})}
                window_text, _ = dn.vfi.window_text(stream, window)
                needed = [f["desc"] for f in forms] + [s for f in forms for _k, _i, s in f["readers"]] + [word]
                ev = None
                for words in (8, 14, 24):
                    for tail in (6, 12):
                        cand = [" ".join(body.split()[:words]), " ".join(forms[-1]["desc"].split()[-tail:])]
                        try:
                            lo, hi = dn.vfi.cut(cand, window_text, unique=True)
                        except ValueError:
                            continue
                        if all(lib.normalize(x) in window_text[lo:hi] for x in needed):
                            ev = cand
                            break
                    if ev:
                        break
                if ev is None:
                    note("evidence not unique or end not found")
                    continue
                counter[page] += 1
                item = {
                    "id": f"s{page}-{counter[page]:02d}", "page": page, "volume": volume, "ev": ev, "lemma": word,
                    "scope": feature["scope"], "forms": forms, "merge_into": tahbir_items[feature["id"]],
                    "verse": "%d:%d" % (sura, verse),
                }
                if page_end != page:
                    item["page_end"] = page_end
                items.append(item)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "schema": "qiraat-farsh-batch/0.1", "book_id": "5530", "coverage": "supplement",
        "pages": {"volume": "1", "from": "1", "to": "646"}, "items": items, "skipped": [],
        "note": "Drafted by draft-saba-items.py from items that agree with Taḥbīr; see D-084.",
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (QIRAAT / "second-witness" / "saba-not-entered.json").write_text(json.dumps(NOTES, ensure_ascii=False, indent=1) + chr(10), encoding="utf-8")
    print(len(items), "items drafted;", dict(skipped))
    return 0


if __name__ == "__main__":
    sys.exit(main())
