"""Turn parsed units into canonical farsh items, exceptions and skipped gaps.

The output is the batch format verify-farsh-items.py already reads, so the same
gates (exact evidence, reader spans, group definitions, anchoring, coverage)
apply to a parsed batch and to a hand-made one. A unit with any flag is not
written as an item; it goes to the exceptions list instead.
"""

from __future__ import annotations

import bisect
import json
import re
from functools import lru_cache
from dataclasses import dataclass, field
from typing import Any

import qiraat_lib as lib
from farsh_parser import (
    CLOSERS, PLACES, POSITION, WHEREVER, Clause, Hit, Lexicon, Unit, build_lexicon, elements, fk, match_at, parse_units, sura_headings,
)

# Ways a lemma can match the text of a sura that name its place with confidence.
SOLID = ("exact", "loose", "near")
# A word found in more verses than this cannot be placed by its spelling alone.
COMMON_LEMMA = 8
# Flags that only inform; they never keep a unit out of the batch.
INFO_FLAGS = {"remark"}

BOOK_ID = "5556"
FIRST_PAGE, LAST_PAGE = "282", "620"


@dataclass
class Parsed:
    items: list[dict[str, Any]] = field(default_factory=list)
    exceptions: list[dict[str, Any]] = field(default_factory=list)
    skipped: list[dict[str, Any]] = field(default_factory=list)
    units: int = 0


class Farsh:
    """The farsh section of one book, parsed once; batches are cut from it by page range."""

    def __init__(self, authorities: dict[str, Any]) -> None:
        self.authorities = authorities
        self.lex: Lexicon = build_lexicon(authorities)
        self.book = lib.load_book(BOOK_ID)
        self.stream = lib.Stream(self.book)
        self.first = self.book.index_of(FIRST_PAGE, "1")
        self.last = self.book.index_of(LAST_PAGE, "1")
        self.lo = self.stream.starts[self.first]
        self.hi = self.stream.ends[self.last]
        self.text = self.stream.text
        self.els = elements(self.text[self.lo:self.hi], self.lo)
        self.headings = sura_headings(self.text[self.lo:self.hi], self.lo)
        self.names = {x["id"]: [lib.normalize(m) for m in x["match_ar"]] for x in authorities["qaris"] + authorities["riwayat"]}
        self.sura_names = json.loads((lib.REPO / "src" / "data" / "quran-sura-names.json").read_text(encoding="utf-8"))
        self.units: list[Unit] = merge_units(parse_units(self.els, self.lex, self.sura_at))

    # ---------------------------------------------------------------- context
    def sura_at(self, offset: int) -> int:
        starts = [h[0] for h in self.headings]
        at = bisect.bisect_right(starts, offset) - 1
        return self.headings[at][1] if at >= 0 else 2

    def sura_name(self, n: int) -> str:
        return self.sura_names[n - 1]["latin"]

    def heading_index(self, offset: int) -> int:
        return bisect.bisect_right([h[0] for h in self.headings], offset) - 1

    def next_heading_sura(self, sura: int) -> int:
        """The sura of the first heading after `sura`'s own, or 115 at the end: the suras between have no printed heading."""
        later = [n for _, n in self.headings if n > sura]
        return min(later) if later else 115

    def section_sura(self, offset: int, state: dict[Any, Any]) -> int:
        """The sura the text is in: the last heading, or a later sura the words themselves have moved us to."""
        heading = self.heading_index(offset)
        floor = state.get("floor")
        if floor and floor[0] == heading:
            return floor[1]
        return self.sura_at(offset)

    def page_index(self, offset: int) -> int:
        return bisect.bisect_right(self.stream.starts, offset) - 1

    def page_label(self, offset: int) -> str:
        return self.book.pages[self.page_index(offset)]["page"]

    def witness(self, s: int, e: int) -> dict[str, str]:
        a, b = self.page_label(s), self.page_label(e - 1)
        return {"book_id": BOOK_ID, "page": a, **({"page_end": b} if b != a else {})}

    def occurrence(self, s: int, e: int, witness: dict[str, str]) -> int:
        first, last = self.book.window(witness)
        lo, hi = self.stream.starts[first], self.stream.ends[last]
        window = self.text[lo:hi]
        evidence = self.text[s:e]
        return len(re.findall(re.escape(evidence), window[:s - lo + len(evidence)]))

    # ------------------------------------------------------------------ build
    def cut(self, first_page: str, last_page: str) -> Parsed:
        lo = self.stream.starts[self.book.index_of(first_page, "1")]
        hi = self.stream.ends[self.book.index_of(last_page, "1")]
        out = Parsed()
        cursor: dict[int, int] = {}
        spans: list[tuple[int, int]] = []
        for unit in self.units:
            if unit.start < lo or unit.start >= hi:
                # Items advance the verse cursor even outside the requested range so that ordering matches a full pass.
                self._items_for(unit, cursor, dry=True)
                continue
            out.units += 1
            items, flags = self._items_for(unit, cursor)
            s, e = self._evidence_span(unit)
            if flags or not items:
                out.exceptions.append(self._exception(unit, flags or {"no-item"}, s, e))
            else:
                out.items.extend(items)
            spans.append((s, e))
        out.skipped = self._gaps(spans, lo, hi)
        for number, exception in enumerate(out.exceptions, start=1):
            witness = self.witness(exception["start"], exception["end"])
            out.skipped.append({"id": f"x{number:03d}", "witness": witness, "evidence": exception["evidence"],
                                "reason": "left for a person: " + ", ".join(exception["flags"])})
        for number, item in enumerate(out.items, start=1):
            item["id"] = f"p{item['witness']['page']}-{number:03d}"
        return out

    def shadow(self, first_page: str, last_page: str) -> list[tuple[set[str], list[dict[str, Any]]]]:
        """Every unit in the pages as (flags, items), items built even when the unit is flagged. For calibration only."""
        lo = self.stream.starts[self.book.index_of(first_page, "1")]
        hi = self.stream.ends[self.book.index_of(last_page, "1")]
        cursor: dict[int, int] = {}
        out: list[tuple[set[str], list[dict[str, Any]]]] = []
        for unit in self.units:
            in_range = lo <= unit.start < hi
            items, flags = self._items_for(unit, cursor, dry=not in_range, force=True)
            if in_range:
                out.append((flags, items))
        return out

    def draft(self, first_page: str, last_page: str) -> list[dict[str, Any]]:
        """Every unit whose evidence starts in the pages, in book order, with the parser's draft items and flags.

        A unit's id is the offset of its evidence in the joined text, so it stays put while the parser does.
        """
        lo = self.stream.starts[self.book.index_of(first_page, "1")]
        hi = self.stream.ends[self.book.index_of(last_page, "1")]
        cursor: dict[Any, Any] = {}
        out: list[dict[str, Any]] = []
        for unit in self.units:
            in_range = lo <= unit.start < hi
            items, flags = self._items_for(unit, cursor, dry=not in_range, force=True)
            if not in_range:
                continue
            s, e = self._evidence_span(unit)
            out.append({"id": f"u{s}", "unit": unit, "start": s, "end": e, "page": self.page_label(s),
                        "flags": sorted(flags - INFO_FLAGS), "evidence": self.text[s:e], "items": items})
        return out

    def matched_words(self, phrase: str, verse_ref: str) -> str:
        """The Cairo words a lemma was matched to at its verse, for a reader to check the placement."""
        sura, verse = (int(x) for x in verse_ref.split(":"))
        found = lib.match_lemma(phrase, lib.load_sura(sura)).get(verse)
        if not found:
            return "?"
        words = dict(lib.load_sura(sura).verses[verse].words)
        return " ".join(words[i] for i in found["word_ids"])

    def _evidence_span(self, unit: Unit) -> tuple[int, int]:
        s, e = unit.start, unit.end
        tail = self.text[s:e].rstrip(" .،/؛:")
        for closer in CLOSERS:
            if tail.endswith(closer):
                tail = tail[: -len(closer)].rstrip(" .،/؛:")
        while tail.endswith(("]", ")")) and tail.count("[") < tail.count("]") and False:
            tail = tail[:-1]
        return s, s + len(tail)

    def _exception(self, unit: Unit, flags: set[str], s: int, e: int) -> dict[str, Any]:
        return {"page": self.page_label(s), "start": s, "end": e, "flags": sorted(flags), "evidence": self.text[s:e]}

    def _gaps(self, spans: list[tuple[int, int]], lo: int, hi: int) -> list[dict[str, Any]]:
        merged: list[list[int]] = []
        for s, e in sorted(spans):
            if merged and s <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], e)
            else:
                merged.append([s, e])
        gaps: list[dict[str, Any]] = []
        cursor = lo
        for s, e in merged + [[hi, hi]]:
            if s > cursor:
                text = self.text[cursor:s].strip()
                if len(re.findall("[ء-ي]", text)) >= 3:
                    a = cursor + (len(self.text[cursor:s]) - len(self.text[cursor:s].lstrip()))
                    b = a + len(text)
                    witness = self.witness(a, b)
                    gaps.append({"id": f"g{len(gaps) + 1:03d}", "witness": witness, "evidence": self.text[a:b],
                                 "reason": "not part of a parsed unit"})
            cursor = max(cursor, e)
        return gaps

    # ------------------------------------------------------------------ items
    def _items_for(self, unit: Unit, cursor: dict[int, int], dry: bool = False, force: bool = False) -> tuple[list[dict[str, Any]], set[str]]:
        flags: set[str] = set(unit.flags)
        for clause in unit.clauses:
            flags |= clause.flags
        first = unit.clauses[0]
        lemmas = [x for x in first.lemmas if not x.excluded]
        if first.compound and all(x.sura is None for x in lemmas):
            lemmas = lemmas[:1]
        if first.is_rest:
            flags.add("orphan-rest")
        if not lemmas:
            flags.add("no-lemma")
        s, e = self._evidence_span(unit)
        evidence = self.text[s:e]
        witness = self.witness(s, e)
        if POSITION.search(evidence):
            flags.add("position-phrase")
        scope = "wherever" if WHEREVER.search(evidence) else ("listed" if PLACES.search(evidence) else "here")
        also = sorted({n for c in unit.clauses for n in c.also})
        if also or any(x.sura for x in lemmas):
            scope = "listed"
        flags -= INFO_FLAGS
        placed: list[tuple[str, int, int]] = []
        for lemma in lemmas:
            home = lemma.sura or self.section_sura(s, cursor)
            phrases = self.split_lemma(lemma.text, home, roam=scope != "here")
            if phrases is None:
                flags.add("lemma-list")
                continue
            for phrase in phrases:
                sura, verse, status = self._place(phrase, home, cursor, scope)
                if lemma.sura is None and scope == "here" and sura != home and verse is not None:
                    cursor["floor"] = (self.heading_index(s), sura)
                if verse is None:
                    flags.add("verse-unmatched")
                elif status in ("weak", "near"):
                    flags.add("verse-weak" if status == "weak" else "verse-near")
                    placed.append((phrase, sura, verse))
                elif status == "common":
                    flags.add("verse-ambiguous")
                    placed.append((phrase, sura, verse))
                else:
                    placed.append((phrase, sura, verse))
        items: list[dict[str, Any]] = []
        for phrase, sura, verse in placed:
            forms, conflict = self._forms(unit, e, phrase)
            flags |= conflict
            if not any(f.get("readers") for f in forms):
                flags.add("no-reader")
            if self._unassigned(s, e, forms):
                flags.add("unassigned-mention")
            items.append({
                "id": "", "witness": witness, "evidence": evidence, "occurrence": self.occurrence(s, e, witness),
                "lemma": phrase, "verse": f"{sura}:{verse}", "scope": scope, "forms": forms,
                **({"note": "The book also gives this reading in " + ", ".join(self.sura_name(n) for n in also) + "."} if also else {}),
            })
        if dry or (flags and not force):
            return [], flags
        return items, flags

    # ---------------------------------------------------------------- lemmas
    def matches_solidly(self, phrase: str, sura: int, roam: bool = False) -> bool:
        if 1 <= sura <= 114:
            exact, loose = self.spelled_in(phrase, sura)
            if exact or loose:
                return True
            found = lib.match_lemma(phrase, lib.load_sura(sura))
            if any(v["how"] in SOLID for v in found.values()):
                return True
        return roam and self.first_anywhere(phrase) is not None

    @staticmethod
    def spelled_in(phrase: str, sura: int) -> tuple[list[int], list[int]]:
        """Verses of a sura holding the phrase as printed (exact) and only after long vowels are dropped (loose).

        Cheap: no edit distance, so it can be run over the whole Qur'an.
        """
        strict = lib.tokens(phrase)
        if not strict or not all(strict):
            return [], []
        loose = [lib.skeleton(t) for t in strict]
        verses = lib.load_sura(sura).verses
        exact = sorted(n for n, v in verses.items() if lib.find_run(strict, v.strict))
        near = sorted(n for n, v in verses.items() if n not in exact and all(loose) and lib.find_run(loose, v.loose))
        return exact, near

    @lru_cache(maxsize=None)
    def first_anywhere(self, phrase: str, kinds: tuple[str, ...] = ("exact", "loose")) -> tuple[int, int] | None:
        """The first (sura, verse) of the Qur'an whose text holds the phrase in one of the given spellings."""
        for sura in range(1, 115):
            exact, loose = self.spelled_in(phrase, sura)
            verses = (exact if "exact" in kinds else []) + (loose if "loose" in kinds else [])
            if verses:
                return sura, min(verses)
        return None

    def split_lemma(self, text: str, sura: int, roam: bool = False) -> list[str] | None:
        """One phrase, or several when the book lists words in one parenthesis. None when it cannot be told.

        A parenthesis that is a phrase of the Qur'an stays whole. One that is not, and whose later words
        each open with the conjunction, is a list: it is cut at word boundaries into phrases that each occur
        in the sura (or, for a word given "wherever it occurs", anywhere), or refused.
        """
        out: list[str] = []
        for part in (p.strip() for p in re.split(r"[،,]", text)):
            if not letters_in(part):
                continue
            words = part.split()
            if len(words) == 1 or self.matches_solidly(part, sura, roam) or not all(fk(w).startswith("و") for w in words[1:]):
                out.append(part)
                continue
            cuts = self._segment(words, sura, roam)
            if cuts is None:
                return None
            out.extend(cuts)
        return out or None

    def _segment(self, words: list[str], sura: int, roam: bool) -> list[str] | None:
        """The fewest contiguous phrases, each found in the Qur'an, that cover the words; None if there is no cover.

        A single word after the first that opens with the conjunction is taken without it when that is found
        too: "وهي" in a list is the word "هي".
        """
        n = len(words)
        best: list[list[str] | None] = [None] * (n + 1)
        best[0] = []
        for i in range(1, n + 1):
            for k in range(i):
                if best[k] is None:
                    continue
                phrase = " ".join(words[k:i])
                if i - k == 1 and k > 0 and phrase.startswith("و") and len(phrase) > 3 and self.matches_solidly(phrase[1:], sura, roam):
                    phrase = phrase[1:]
                    solid = True
                else:
                    solid = self.matches_solidly(phrase, sura, roam)
                if solid:
                    candidate = best[k] + [phrase]
                    if best[i] is None or len(candidate) < len(best[i]):
                        best[i] = candidate
        return best[n]

    def _place(self, phrase: str, sura: int, cursor: dict[int, int], scope: str) -> tuple[int, int | None, str]:
        """(sura, verse, status). A word given wherever it occurs is placed at its first occurrence in the Qur'an.

        The spelling as the book prints it comes first (exact), then a spelling that differs only in long vowels
        and hamza carriers (loose). A one-letter difference ("near") is reported as such and left for a person:
        it once put a word at a verse that only has its neighbour.
        """
        if not 1 <= sura <= 114:
            return sura, None, "none"
        exact, loose = self.spelled_in(phrase, sura)
        if not exact and not loose and scope == "here":
            # No heading was printed for some suras: the words tell us the section has moved on.
            for ahead in range(sura + 1, self.next_heading_sura(sura)):
                e2, l2 = self.spelled_in(phrase, ahead)
                if e2 or l2:
                    verses = e2 or l2
                    if len(verses) <= COMMON_LEMMA:
                        return ahead, verses[0], "agree"
                    break
        if not exact and scope != "here":
            first = self.first_anywhere(phrase, ("exact",))
            if first is not None:
                return first[0], first[1], "agree"
        pool = exact or loose
        if not pool and scope != "here":
            first = self.first_anywhere(phrase)
            if first is not None:
                return first[0], first[1], "agree"
        if pool and not exact:
            # The loose spelling can match the wrong word ("الحميد لله" against "الحمد لله"). If a verse
            # matches within one letter and is not among them, the place is in doubt.
            close = lib.near_matches(lib.tokens(phrase), lib.load_sura(sura))
            if set(close) - set(pool):
                return sura, min(pool), "common"
        if pool and not exact and len(pool) > COMMON_LEMMA:
            # Loose spelling drops long vowels and hamza carriers, so a broad loose match says nothing about the place.
            return sura, min(pool), "common"
        if pool:
            at = cursor.get(sura, 1) if scope == "here" else 1
            verse = next((v for v in pool if v >= at), pool[0])
            if scope == "here":
                if len(pool) > COMMON_LEMMA:
                    return sura, verse, "common"
                cursor[sura] = verse
            return sura, verse, "agree" if verse in pool else "moved"
        matches = lib.match_lemma(phrase, lib.load_sura(sura))
        if not matches:
            return sura, None, "none"
        verse, _ = lib.choose_verse(matches, None, 1)
        if matches[verse]["how"] != "near":
            return sura, verse, "weak"
        # A book prints the variant, so its spelling is often one letter from the Cairo text. That is safe to place
        # only when the sura has one such verse and the word as printed occurs nowhere else exactly.
        if len(matches) == 1 and self.first_anywhere(phrase) is None:
            cursor[sura] = verse if scope == "here" else cursor.get(sura, 1)
            return sura, verse, "agree"
        return sura, verse, "near"

    # ------------------------------------------------------------------ forms
    def _forms(self, unit: Unit, e: int, phrase: str) -> tuple[list[dict[str, Any]], set[str]]:
        forms: list[dict[str, Any]] = []
        flags: set[str] = set()
        owner: dict[str, int] = {}
        words = {stem(w) for w in phrase.split()}
        for clause in unit.clauses:
            if not applies(clause, words):
                continue
            end = min(clause.end, e)
            desc = self.text[clause.form_s:end].strip(" .،/؛:") if clause.form_s < end else ""
            if not letters_in(desc):
                desc = self.text[clause.rs:end].strip(" .،/؛:")
            number = len(forms) + 1
            form: dict[str, Any] = {"short": f"form {number}", "basis": "listing", "desc": desc, "readers": []}
            if clause.is_rest:
                a, b = clause.rest_span or (clause.rs, clause.re_)
                form["rest"] = {"span": self.text[a:b].strip(" []()،.")}
            for hit in clause.hits:
                if hit.kind == "o":
                    continue
                if hit.kind == "u":
                    flags.add("unresolved-term")
                    continue
                if hit.kind == "duri":
                    flags.add("bare-duri")
                    continue
                entry = {("group" if hit.kind == "g" else "authority"): hit.ident, "span": self._span(hit)}
                form["readers"].append(entry)
                for riwaya in self._riwayat(hit):
                    if riwaya in owner and owner[riwaya] != number:
                        flags.add("reader-conflict")
                    owner[riwaya] = number
            if not clause.is_rest and not form["readers"]:
                flags.add("outsider-or-empty-clause")
                continue
            forms.append(form)
        return forms, flags

    def _unassigned(self, s: int, e: int, forms: list[dict[str, Any]]) -> bool:
        """True when a reader is named in the evidence but the item's forms give him nothing.

        The book often names a reader for another word or another state inside the same passage. If that reader
        is not in this item's forms he would be swept into "the rest", which the book may not have said.
        """
        named: set[str] = set()
        for form in forms:
            for reader in form.get("readers", []):
                hit = Hit("g" if "group" in reader else "a", reader.get("group") or reader["authority"], 0, 0, 0)
                named.update(self._riwayat(hit))
        first = bisect.bisect_left([el.s for el in self.els], s)
        i = first
        while i < len(self.els) and self.els[i].e <= e:
            hit = match_at(self.els, i, self.lex)
            if hit is not None and hit.kind in ("a", "g"):
                if not set(self._riwayat(hit)) <= named:
                    return True
                i += hit.n
            else:
                i += 1
        return False

    def _riwayat(self, hit) -> list[str]:
        if hit.kind == "g":
            members = self.lex.group_members[hit.ident]
        else:
            members = [hit.ident]
        out: list[str] = []
        for m in members:
            out.extend(self.lex.riwayat_of.get(m, [m]))
        return out

    def _span(self, hit) -> str:
        text = self.text[hit.s:hit.e]
        if hit.kind == "a":
            names = self.names[hit.ident]
            if text.startswith(("و", "ف")) and any(n in text[1:] for n in names) and not any(text.startswith(n) for n in names):
                text = text[1:]
        else:
            if text.startswith(("و", "ف")) and len(text) > 3:
                text = text[1:]
        return text.strip(" []()،.:")


def stem(word: str) -> str:
    """The folded word without a conjunction, so "وشيئا" in a list and "شيئا" as a lemma are the same word."""
    key = fk(word)
    return key[1:] if key.startswith("و") and len(key) > 2 else key


def clause_words(clause: Clause) -> set[str]:
    return {stem(w) for lemma in clause.lemmas if not lemma.excluded for w in lemma.text.split()}


def applies(clause: Clause, words: set[str]) -> bool:
    """A clause with no lemma of its own, or a rest, speaks about every word of its unit; one with a lemma, only its own."""
    if clause.is_rest or not clause.lemmas:
        return True
    return words <= clause_words(clause)


def merge_units(units: list[Unit]) -> list[Unit]:
    """Fold a clause that names fewer words than the statement before it back into that statement."""
    merged: list[Unit] = []
    for unit in units:
        prev = merged[-1] if merged else None
        first = unit.clauses[0]
        if prev is not None and not first.is_rest and first.lemmas:
            last = prev.clauses[-1]
            open_ = not last.is_rest and not last.sentence_end
            mine, theirs = clause_words(first), clause_words(prev.clauses[0])
            if open_ and prev.clauses[0].lemmas and mine and mine <= theirs:
                prev.clauses.extend(unit.clauses)
                continue
        merged.append(unit)
    # A rest can answer a statement that came before it: across an author's remark, or at the end of several statements.
    run: list[Unit] = []
    pending: list[Unit] = []  # statements since the last rest
    for unit in merged:
        tail = unit.clauses[-1]
        has_rest = any(c.is_rest for c in unit.clauses)
        if has_rest:
            answers_earlier = "remark" in unit.clauses[0].flags or not unit.clauses[0].lemmas
            if answers_earlier and pending:
                for held in pending[-4:]:
                    held.flags.add("rest-displaced")
                unit.flags.add("rest-displaced")
            pending = []
        else:
            pending.append(unit)
        if not tail.is_rest and not tail.sentence_end:
            run.append(unit)  # still open: the next statement began before this one closed
            continue
        if tail.is_rest and run:
            for held in run:
                held.flags.add("rest-shared")
        run = []
    return merged


def letters_in(text: str) -> str:
    return "".join(re.findall("[ء-ي]", text))


def resolve(item: dict[str, Any], authorities: dict[str, Any]) -> dict[str, list[tuple[int, str]]]:
    """transmitter -> [(form index, basis)], the way the claims are resolved downstream."""
    riw_of = {q["id"]: q["riwayat"] for q in authorities["qaris"]}
    ten = [r for q in authorities["sets"]["ten"] for r in riw_of[q]]
    groups = authorities["groups"]
    out: dict[str, list[tuple[int, str]]] = {}
    named: set[str] = set()
    for i, form in enumerate(item["forms"]):
        for r in form.get("readers", []):
            members = groups[r["group"]]["members"] if "group" in r else [r["authority"]]
            for m in members:
                for rw in riw_of.get(m, [m]):
                    basis = r.get("basis", form.get("basis", "listing"))
                    out.setdefault(rw, []).append((i, basis))
                    if basis != "permitted":
                        named.add(rw)
    for i, form in enumerate(item["forms"]):
        if form.get("rest"):
            for rw in ten:
                if rw not in named:
                    out.setdefault(rw, []).append((i, "listing"))
    return out


def partition(item: dict[str, Any], authorities: dict[str, Any]) -> tuple[frozenset[frozenset[str]], frozenset[str]]:
    """The twenty transmitters grouped by the form they read, and those the item leaves unstated."""
    riw_of = {q["id"]: q["riwayat"] for q in authorities["qaris"]}
    ten = [r for q in authorities["sets"]["ten"] for r in riw_of[q]]
    resolved = resolve(item, authorities)
    by_sig: dict[tuple, list[str]] = {}
    for rw in ten:
        by_sig.setdefault(tuple(sorted(resolved.get(rw, []))), []).append(rw)
    named = frozenset(frozenset(v) for k, v in by_sig.items() if k)
    return named, frozenset(rw for rw in ten if rw not in resolved)


def load_authorities() -> dict[str, Any]:
    return json.loads((lib.QIRAAT_DIR / "authorities.json").read_text(encoding="utf-8"))
