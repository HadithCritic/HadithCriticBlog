#!/usr/bin/env python3
"""Place al-Tabari's Jami' al-bayan (Shamela 7798, al-Turki edition) at the verses.

al-Tabari opens each discussion with a heading, "al-qawl fi ta'wil qawlihi ...",
followed by the Qur'anic words in braces. Each heading and the text after it, up
to the next heading, is one entry, placed at the verses its quoted words occupy.

Placement is mechanical and checked, not guessed:

  * the quote is reduced to a consonantal skeleton (no vowels, no alif, the
    usual orthographic folds) so the edition's spelling meets the Cairo rasm;
  * it is matched word by word against the Cairo text, one edit allowed in a
    word of four letters or more, and at least four of its first words (or all
    of a shorter quote) must agree;
  * the search moves forward from the previous match, because the book follows
    the mushaf order, and only falls back to the whole Qur'an when the forward
    window has nothing, which is recorded on the entry;
  * a heading that matches nowhere is not placed: its text is kept with the
    previous entry and counted in the report.

Sura openings ("tafsir surat ...", "al-qawl fi tafsir al-sura ...") become
sura-level material for the sura whose first heading follows them.

Every entry keeps its volume and page (and the last page when it runs on), the
Arabic exactly as exported, and review_state "proposed".

Output: src/data/tafsir/works/tabari/sura-NNN.json and a summary report at
docs/research/tafsir/tabari-placement.json.

Usage: python scripts/build-tafsir-tabari.py [path-to-7798.json]
"""

from __future__ import annotations

import bisect
import glob
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = Path("C:/Users/Jonathan/Desktop/tafsir/dated tafsir/03 century AH")
OUT_DIR = ROOT / "src" / "data" / "tafsir" / "works" / "tabari"
REPORT = ROOT / "docs" / "research" / "tafsir" / "tabari-placement.json"
VERSES = ROOT / "src" / "data" / "quran-verses.json"
SURA_NAMES = ROOT / "src" / "data" / "quran-sura-names.json"

MARKS = "[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]"
GAP = f"{MARKS}*"


def tolerant(phrase: str) -> str:
    """A regex for an unvocalized phrase that also matches it fully vocalized."""
    out = []
    for ch in phrase:
        if ch == " ":
            out.append(r"\s+")
        elif ch in "اأإآ":
            out.append(f"[اأإآ]{GAP}")
        else:
            out.append(re.escape(ch) + GAP)
    return "".join(out)


HEADING = re.compile(tolerant("القول في تاويل") + r"(?:\s+" + tolerant("قوله") + r")?[^{\n]{0,80}?\{")
SURA_OPENING = re.compile(
    r"(?:" + tolerant("القول في تفسير السورة") + r"|" + tolerant("تفسير سورة") + r")"
)
BRACES = re.compile(r"\{([^{}]{1,600})\}")
WINDOW = 6000  # Qur'an words searched forward from the last match


def skeleton(word: str) -> str:
    word = re.sub(MARKS, "", word)
    word = word.replace("ٱ", "").replace("ا", "").replace("أ", "").replace("إ", "").replace("آ", "")
    word = word.replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي").replace("ء", "")
    word = re.sub(r"[^\u0621-\u064A]", "", word)
    # A doubled letter is one letter with shadda in the Cairo rasm (\u0671\u0644\u064E\u0651\u064A\u06E1\u0644)
    # and often two in the edition (\u0627\u0644\u0644\u064E\u0651\u064A\u0652\u0644); compare them as one.
    return re.sub(r"(.)\1+", r"\1", word)


def words_of(text: str) -> list[str]:
    return [w for w in (skeleton(t) for t in re.split(r"[\s\u06DD*]+", text)) if w]


def near(a: str, b: str) -> bool:
    if a == b:
        return True
    if min(len(a), len(b)) < 4 or abs(len(a) - len(b)) > 1:
        return False
    # one edit
    if len(a) == len(b):
        return sum(x != y for x, y in zip(a, b)) <= 1
    short, long_ = (a, b) if len(a) < len(b) else (b, a)
    for i in range(len(long_)):
        if long_[:i] + long_[i + 1:] == short:
            return True
    return False


def load_quran() -> tuple[list[str], list[tuple[int, int]]]:
    verses = json.loads(VERSES.read_text(encoding="utf-8"))
    names = json.loads(SURA_NAMES.read_text(encoding="utf-8"))
    words, where = [], []

    def cairo(sura_n: int, v: int) -> str:
        """quran-verses.json follows an edition without 9:128-129; the qira'at
        module's Cairo 1924 text fills any verse it lacks."""
        if f"{sura_n}:{v}" in verses:
            return verses[f"{sura_n}:{v}"]["ar"]
        data = json.loads((ROOT / "src" / "data" / "qiraat" / f"sura-{sura_n:03d}.json").read_text(encoding="utf-8"))
        verse = next(x for x in data["verses"] if x["number"] == v)
        return " ".join(w["text"] for w in verse["words"])

    for sura in names:
        for v in range(1, sura["verses"] + 1):
            for w in words_of(cairo(sura["n"], v)):
                words.append(w)
                where.append((sura["n"], v))
    return words, where


def match(quote: list[str], words: list[str], start: int, stop: int) -> int | None:
    probe = quote[:6]
    need = len(probe) if len(probe) < 4 else max(4, len(probe) - 1)
    for i in range(max(0, start), min(len(words) - len(probe) + 1, stop)):
        if not near(probe[0], words[i]):
            continue
        hits = sum(1 for k, w in enumerate(probe) if near(w, words[i + k]))
        if hits >= need:
            return i
    return None


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(glob.glob(str(SOURCE_DIR / "*7798*"))[0])
    records = json.loads(src.read_text(encoding="utf-8"))["records"]
    body = [r for r in records if r["volume_number"] not in ("مقدمة", "None", None)]

    # The body as one text, with the page each character came from.
    text_parts, starts, pages = [], [], []
    offset = 0
    for r in body:
        starts.append(offset)
        pages.append((r["volume_number"], r["page_number"], r["serial_number"]))
        text_parts.append(r["text"])
        offset += len(r["text"]) + 1
    text = "\n".join(text_parts)

    def page_at(pos: int) -> tuple[str, str, str]:
        return pages[bisect.bisect_right(starts, pos) - 1]

    words, where = load_quran()
    cuts: list[tuple[int, str]] = [(m.start(), "heading") for m in HEADING.finditer(text)]
    cuts += [(m.start(), "opening") for m in SURA_OPENING.finditer(text)]
    cuts.sort()

    by_sura: dict[int, dict] = {}
    report = {"headings": 0, "placed": 0, "global_fallback": 0, "unplaced": [], "openings": 0}
    cursor = 0
    pending_opening: list[dict] = []


    for n, (pos, kind) in enumerate(cuts):
        end = cuts[n + 1][0] if n + 1 < len(cuts) else len(text)
        segment = text[pos:end].strip()
        if not segment:
            continue
        first, last = page_at(pos), page_at(max(pos, end - 1))
        citation = {"volume": first[0], "page": first[1]}
        page_end = None if (last[0], last[1]) == (first[0], first[1]) else f"vol. {last[0]}, p. {last[1]}"

        if kind == "opening":
            report["openings"] += 1
            pending_opening.append({"text": segment, "citation": citation, "page_end": page_end, "serial": first[2], "pos": pos})
            continue

        report["headings"] += 1
        head = segment[:900]
        # The heading's quotations: the first braces after the heading, and any
        # further braces that follow closely (a heading may quote two fragments).
        quotes = []
        last_end = None
        for m in BRACES.finditer(head):
            if last_end is not None and m.start() - last_end > 250:
                break
            found_words = words_of(m.group(1))
            if found_words:
                quotes.append(found_words)
            last_end = m.end()
            if len(quotes) == 3:
                break
        found = None
        fallback = False
        if quotes:
            found = match(quotes[0], words, cursor, cursor + WINDOW)
            if found is None:
                found = match(quotes[0], words, 0, len(words))
                fallback = found is not None
        if found is None:
            # Kept, but never given a verse: it goes to the sura being read.
            report["unplaced"].append({"citation": citation, "heading": head[:160]})
            current_sura = where[max(cursor - 1, 0)][0]
            by_sura.setdefault(current_sura, {"entries": [], "surahMaterial": []})["surahMaterial"].append({
                "id": f"tabari-{first[2]}-{pos}-s",
                "work": "tabari",
                "verses": None,
                "placement": "surah",
                "lemma": None,
                "reading": [],
                "text": segment,
                "text_en": None,
                "translation_status": "no translation supplied",
                "locator_status": "heading quotation not matched to a verse; kept at sura level",
                "citation": citation,
                "page_end": page_end,
                "verse_references": [],
                "review_state": "proposed",
            })
            continue

        # The span covers every quoted fragment that matches near the first.
        span_end = found + len(quotes[0]) - 1
        for extra in quotes[1:]:
            more = match(extra, words, found, found + 400)
            if more is not None:
                span_end = max(span_end, more + len(extra) - 1)
        span_end = min(span_end, len(words) - 1)
        sura, v_from = where[found]
        sura_end, v_to = where[span_end]
        if sura_end != sura:
            v_to = max(v for (s, v) in where[found:span_end + 1] if s == sura)
        cursor = found + 1
        report["placed"] += 1
        report["global_fallback"] += int(fallback)

        file = by_sura.setdefault(sura, {"entries": [], "surahMaterial": []})
        for opening in pending_opening:
            file["surahMaterial"].append({
                "id": f"tabari-{opening['serial']}-{opening['pos']}-s",
                "work": "tabari",
                "verses": None,
                "placement": "surah",
                "lemma": None,
                "reading": [],
                "text": opening["text"],
                "text_en": None,
                "translation_status": "no translation supplied",
                "locator_status": "sura opening heading in the source",
                "citation": opening["citation"],
                "page_end": opening["page_end"],
                "verse_references": [],
                "review_state": "proposed",
            })
        pending_opening = []
        entry = {
            "id": f"tabari-{first[2]}-{pos}",
            "work": "tabari",
            "verses": {"from": v_from, "to": v_to},
            "lemma": None,
            "reading": [],
            "text": segment,
            "text_en": None,
            "translation_status": "no translation supplied",
            "locator_status": "heading quotation matched to the Cairo text" + (" (outside the forward window)" if fallback else ""),
            "citation": citation,
            "page_end": page_end,
            "source_record_serial": first[2],
            "review_state": "proposed",
        }
        file["entries"].append(entry)


    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("sura-*.json"):
        old.unlink()
    for sura, file in sorted(by_sura.items()):
        payload = {
            "schemaVersion": "tafsir-entries/0.2.0",
            "sura": sura,
            "entries": file["entries"],
            "silent": {},
            "surahMaterial": file["surahMaterial"],
        }
        (OUT_DIR / f"sura-{sura:03d}.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    report["suras"] = len(by_sura)
    report["unplaced_count"] = len(report["unplaced"])
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{report['placed']} of {report['headings']} headings placed in {len(by_sura)} suras; "
          f"{report['global_fallback']} by global search; {report['unplaced_count']} unplaced; "
          f"{report['openings']} sura openings")
    return 0


if __name__ == "__main__":
    sys.exit(main())
