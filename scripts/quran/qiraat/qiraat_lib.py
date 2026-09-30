"""Shared helpers for the sura-by-sura qirāʾāt pipeline.

Kept separate from the verifier scripts (whose file names contain hyphens and
cannot be imported) so the item verifier, the assembler and the display builder
read the Cairo text and the cached Shamela pages one way.
"""

from __future__ import annotations

import importlib.util
import json
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[3]
QIRAAT_DIR = REPO / "docs" / "research" / "quran-platform" / "qiraat"
RELEASES = REPO / "public" / "data" / "quran" / "releases"


@lru_cache(maxsize=1)
def claims_module():
    """The claims verifier, loaded by path because its file name is not importable."""
    path = Path(__file__).with_name("verify-qiraat-claims.py")
    spec = importlib.util.spec_from_file_location("verify_qiraat_claims", path)
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


# ---------------------------------------------------------------- Cairo text

# Quranic annotation marks and vowel signs; U+0670 (dagger alif) is mapped first.
_MARKS = re.compile("[ؐ-ًؚ-ٟۖ-ۭ࣓-ࣿـ]")
_FOLD = str.maketrans({
    "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",
    "ٲ": "ا", "ٳ": "ا",
    "ؤ": "و", "ئ": "ي", "ى": "ي", "ة": "ه",
    "ی": "ي", "ک": "ك",
})


def fold(text: str) -> str:
    """Letters only, in one orthography: Uthmani and modern spellings meet here.

    The dagger alif becomes a full alif first, so "ٱلصِّرَٰطَ" and "الصراط" agree.
    """
    text = text.replace("ٰ", "ا")
    text = _MARKS.sub("", text).translate(_FOLD)
    return re.sub("[^ء-غف-ي]", " ", text)


def skeleton(text: str) -> str:
    """A looser view for spelling differences between the two orthographies.

    Long vowels (alif, waw, ya) and hamza carriers are dropped, so "الصلوة" and
    "الصلاة" meet. Used only after the strict fold fails, and reported as loose.
    """
    return re.sub("[اويء]", "", fold(text))


def tokens(text: str) -> list[str]:
    return [t for t in fold(text).split() if t]


@dataclass
class Verse:
    number: int
    words: list[tuple[str, str]]  # (native id, exact text)
    strict: list[str] = field(default_factory=list)
    loose: list[str] = field(default_factory=list)


@dataclass
class Sura:
    number: int
    verses: dict[int, Verse]

    def verse_ids(self) -> list[int]:
        return sorted(self.verses)


def cairo_path(sura: int) -> Path:
    pointer = json.loads((REPO / "public/data/quran/manifest.json").read_text(encoding="utf-8"))
    return RELEASES / pointer["releaseId"] / f"cairo-arabic-sura-{sura:03d}.json"


@lru_cache(maxsize=None)
def load_sura(number: int) -> Sura:
    data = json.loads(cairo_path(number).read_text(encoding="utf-8"))
    verses: dict[int, Verse] = {}
    for record in data["records"]:
        verse_no = int(next(a["exactValue"] for a in record["verseAttributes"] if a["expandedName"] == "n"))
        words = [(w["nativeId"], w["exactText"].strip()) for w in record["words"]]
        verse = Verse(verse_no, words)
        verse.strict = [fold(text).strip() for _, text in words]
        verse.loose = [skeleton(text) for _, text in words]
        verses[verse_no] = verse
    return Sura(number, verses)


def find_run(needles: list[str], haystack: list[str]) -> list[int]:
    """Start indexes where `needles` appears as consecutive words."""
    if not needles:
        return []
    return [i for i in range(len(haystack) - len(needles) + 1) if haystack[i:i + len(needles)] == needles]


def match_lemma(lemma: str, sura: Sura) -> dict[int, dict[str, Any]]:
    """Every verse whose words contain the lemma, with the matching word ids.

    Tries the whole lemma as consecutive words first, then its longest word.
    `how` says which: exact, loose, or word (only the longest word matched).
    """
    strict = tokens(lemma)
    loose = [skeleton(t) for t in strict]
    found: dict[int, dict[str, Any]] = {}
    if not strict:
        return found
    whole: list[tuple[str, list[str], str]] = [("exact", strict, "strict"), ("loose", loose, "loose")]
    partial: list[tuple[str, list[str], str]] = []
    longest = max(strict, key=len)
    if len(strict) > 1:
        partial = [("word", [longest], "strict"), ("word-loose", [skeleton(longest)], "loose")]

    def scan(attempts: list[tuple[str, list[str], str]]) -> dict[int, dict[str, Any]]:
        hits: dict[int, dict[str, Any]] = {}
        for how, needles, view in attempts:
            if not all(needles):
                continue
            for number, verse in sura.verses.items():
                if number in hits:
                    continue
                haystack = verse.strict if view == "strict" else verse.loose
                starts = find_run(needles, haystack)
                if starts:
                    hits[number] = {"how": how, "word_ids": [verse.words[starts[0] + k][0] for k in range(len(needles))]}
            if hits:
                break
        return hits

    found = scan(whole) or near_matches(strict, sura) or scan(partial)
    return found


def edit_distance(a: str, b: str, limit: int = 2) -> int:
    """Levenshtein distance, giving up above `limit`."""
    if abs(len(a) - len(b)) > limit:
        return limit + 1
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        current = [i]
        for j, cb in enumerate(b, start=1):
            current.append(min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (ca != cb)))
        previous = current
    return previous[-1]


def near_matches(needles: list[str], sura: Sura) -> dict[int, dict[str, Any]]:
    """Verses holding the lemma up to one letter of difference in the whole run.

    The book often prints the variant, not the Cairo word (a tāʾ where the text
    has a yāʾ, a nūn where it has a yāʾ). One changed letter, and only in words
    of at least three letters, still names the same place. Reported as `near`.
    """
    found: dict[int, dict[str, Any]] = {}
    if any(len(n) < 3 for n in needles):
        return found
    width = len(needles)
    for number, verse in sura.verses.items():
        for start in range(len(verse.strict) - width + 1):
            cost = sum(edit_distance(a, b, 1) for a, b in zip(needles, verse.strict[start:start + width]))
            if cost <= 1:
                found[number] = {"how": "near", "word_ids": [verse.words[start + k][0] for k in range(width)]}
                break
    return found


def choose_verse(matches: dict[int, dict[str, Any]], hint: int | None, cursor: int) -> tuple[int | None, str]:
    """Pick the verse for an item, using the book's order as the tiebreak.

    agree: the extractor's hint is one of the matching verses.
    moved: the hint is not a match; the first match at or after the cursor is used.
    none: no verse of the sura contains the lemma.
    """
    if not matches:
        return None, "none"
    if hint in matches:
        return hint, "agree"
    ahead = sorted(v for v in matches if v >= cursor)
    return (ahead[0] if ahead else sorted(matches)[0]), "moved"


# --------------------------------------------------------------- Shamela text

def load_book(book_id: str):
    return claims_module().Book(book_id)


def normalize(text: str) -> str:
    return claims_module().normalize(text)


def normalize_with_map(raw: str):
    return claims_module().normalize_with_map(raw)


class Stream:
    """One book's pages joined into a single normalized string, for coverage.

    `starts[i]` is the offset where page index i begins. Evidence is located by
    exact substring inside the window of the pages it cites.
    """

    def __init__(self, book) -> None:
        self.book = book
        self.text = ""
        self.starts: list[int] = []
        for page in book.pages:
            norm, _ = normalize_with_map(page["text"] or "")
            if self.text:
                self.text += " "
            self.starts.append(len(self.text))
            self.text += norm
        self.ends = [s + len(normalize_with_map(p["text"] or "")[0]) for s, p in zip(self.starts, book.pages)]

    def locate(self, witness: dict[str, Any], evidence: str, occurrence: int = 1) -> tuple[int, int] | None:
        first, last = self.book.window(witness)
        lo, hi = self.starts[first], self.ends[last]
        needle = normalize(evidence)
        if not needle:
            return None
        window = self.text[lo:hi]
        hits = [m.start() for m in re.finditer(re.escape(needle), window)]
        if occurrence > len(hits) or not hits:
            return None
        return lo + hits[occurrence - 1], lo + hits[occurrence - 1] + len(needle)
