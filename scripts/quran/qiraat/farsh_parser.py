"""A rule-based reader for the word-by-word section of Taḥbīr at-Taysīr.

The section is one long run of sentences of the shape

    READERS (LEMMA) FORM, wal-bāqūn OTHER FORM.

The parser walks the normalized page text once and cuts it into units: a reader
list, the lemma in parentheses, the form the book gives, and "the rest". It
never writes Arabic of its own. Every string it emits is a slice of the page, so
the same verifier that gates hand extraction gates its output.

It does not try to be clever. Anything it cannot decide mechanically (a pronoun
standing for a reader, an unclosed parenthesis, a reader term the book does not
define, a place named by another sura) is marked with a flag, and a unit with
any flag is an exception for a person to read. Only unflagged units are written
as items.
"""

from __future__ import annotations

import bisect
import json
import re
from dataclasses import dataclass, field, replace
from functools import lru_cache
from pathlib import Path
from typing import Any

import qiraat_lib as lib

HAMZA = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا"})
INVISIBLE = {0x200C: " ", 0x200D: " ", 0x200E: " ", 0x200F: " "}
ARABIC = re.compile("[ء-ي]")

# Words before a name that make it a mention, not a reader list: "from Warsh", "except Ḥamza".
REMARK = {"قلت", "وقلت"}
# The yāʾāt lists put the readers after the verb: "(lemma) فتحها READERS."
YA_VERBS = {"فتحها", "فتحهما", "فتحه", "سكنها", "سكنهما", "سكنه", "اثبتها", "اثبتهما", "اثبته", "حذفها", "حذفهما", "حذفه", "اثبتهن", "حذفهن"}
MENTION_BEFORE = {"عن", "من", "على", "الي", "في", "الا", "غير", "خلا", "حاشا", "دون", "سوي", "مع", "عند"}
EXCLUDERS = {"الا", "غير", "خلا", "حاشا", "دون", "سوي"}
PRONOUNS = {"عنه", "عنهم", "عنهما", "وعنه", "وعنهم", "هما", "وهما", "وهم", "معهم", "معه", "لهما", "لهم", "له"}
AGREEMENT = {"وافقهم", "ووافقهم", "وافقه", "ووافقه", "وافقهما", "ووافقهما", "وتابعه", "تابعه", "وتابعهم", "تابعهم", "وتبعهم"}
SAME_AS = {"كذلك", "وكذلك", "وكذا", "كذا"}
# Words that may sit between two lemma groups of one statement without making the second a new reading.
BETWEEN_OK = {"و", "بعده", "قبله", "هنا", "وهنا", "وفي", "في", "سوره", "هذه", "السوره", "ايضا", "وايضا", "معا", "حيث", "وقع"}
# A verb that only introduces a reader list: a clause holding nothing else is noise, not a statement.
INTRO = {"قرا", "قال", "وقال", "قلت", "وقلت", "قراءه"}
REST = {"والباقون", "الباقون", "وباقي", "باقي", "والباقين", "وباقيهم", "وسائرهم", "وسائر"}
CLOSERS = ("والله الموفق", "وبالله التوفيق", "والله اعلم")
WHEREVER = re.compile(r"(?:(?:حيث|كيف)\s+(?:ما\s+)?(?:وقع|اتي|أتى|جاء|كان|تكرر|ورد|وردت|تصرف))|وما جاء منه|وما اشتق منه|وشبهه|ونحوه")
# Words that say where in a sura a word is ("at its end", "the second"): the first occurrence would be wrong.
POSITION = re.compile(
    r"في\s+(?:آخرها|آخر|أولها|أول)(?![ء-ي])|(?<![ء-ي])(?:الثاني|الثالث|الرابع|الأخير|الأخيرة|الثانية|الثالثة)(?![ء-ي])"
)
PLACES = re.compile(r"\b(?:الموضعين|موضعين|مواضع|موضعا|المواضع)\b")

# Collective terms the book does not define here: the parser refuses to guess their members.
UNRESOLVED_TERMS = {
    "المكيان", "المكي", "البصريان", "البصري", "البصريون", "الشامي", "الشاميان", "الاخوان",
    "الكوفي", "المدني", "الكوفيان", "الشاميون", "المكيون", "المدنيون",
}
# Readers outside the ten. Named in a list, they are ignored (rule 8 of the extraction brief).
OUTSIDERS = {
    "ابن محيصن", "الحسن", "الاعمش", "اليزيدي", "ابن مسعود", "ابن عباس", "مجاهد", "قتادة",
    "ابن ابي اسحاق", "عيسي", "ابن جبير", "الشنبوذي", "ابن مهران", "المطوعي", "يحيي بن وثاب",
    "ابن السميفع", "ابو حيوة", "طلحة", "ابو رجاء", "ابن اسحاق", "الاعرج", "عاصم الجحدري",
}

SURA_ALIASES = {
    "براءه": 9, "التوبه": 9, "المؤمن": 40, "غافر": 40, "سبح": 87, "التطفيف": 83, "المطففين": 83,
    "السجده": 32, "الذاريات": 51, "الطور": 52, "يس": 36, "النجم": 53, "ق": 50, "ص": 38,
    "الانسان": 76, "الدهر": 76, "القيامه": 75, "الرحمن": 55, "نوح": 71, "محمد": 47, "الاحقاف": 46,
    "الشوري": 42, "فصلت": 41, "حم السجده": 41, "الملك": 67, "تبارك": 67, "النبا": 78, "عم": 78,
    "الاعلي": 87, "الضحي": 93, "الم نشرح": 94, "الشرح": 94, "الماعون": 107, "الكافرون": 109,
    "الاخلاص": 112, "الفلق": 113, "الناس": 114, "التين": 95, "العلق": 96, "القدر": 97, "الفيل": 105,
}


def fk(word: str) -> str:
    """Fold key: diacritics and tatweel gone, hamza carriers and final forms unified."""
    return lib.fold(word).replace(" ", "")


def letters(text: str) -> str:
    return "".join(ARABIC.findall(text))


# ------------------------------------------------------------------ elements

@dataclass(frozen=True)
class El:
    kind: str  # "word", "paren", "open", "close"
    s: int
    e: int
    raw: str
    core: str  # folded letters of a word; inner text of a paren
    sentence_end: bool = False
    comma: bool = False


_ELEM = re.compile(r"\([^()]{0,400}\)|[^\s()]+|[()]")
_SENT = re.compile(r"\.[\]\s/]*$")


def elements(text: str, offset: int = 0) -> list[El]:
    scan = text.translate(INVISIBLE)
    out: list[El] = []
    for m in _ELEM.finditer(scan):
        raw = m.group(0)
        s, e = offset + m.start(), offset + m.end()
        if raw == "(":
            out.append(El("open", s, e, raw, ""))
        elif raw == ")":
            out.append(El("close", s, e, raw, ""))
        elif raw.startswith("("):
            out.append(El("paren", s, e, raw, raw[1:-1].strip()))
        else:
            core = fk(raw)
            if not core:
                if "." in raw and out:  # a lone "." or "/." after a word ends its sentence
                    prev = out[-1]
                    out[-1] = El(prev.kind, prev.s, prev.e, prev.raw, prev.core, True, prev.comma)
                continue
            out.append(El("word", s, e, raw, core, bool(_SENT.search(raw)) or raw.endswith(".)"), raw.rstrip("]").endswith(("،", ","))))
    return out


# ------------------------------------------------------------------- lexicon

@dataclass(frozen=True)
class Hit:
    kind: str  # "a" authority, "g" group, "u" unresolved term, "duri" bare al-Dūrī, "o" outsider
    ident: str
    s: int
    e: int
    n: int  # elements consumed


@dataclass
class Lexicon:
    names: dict[tuple[str, ...], tuple[str, str]]
    heads: dict[str, list[tuple[str, ...]]]
    riwayat_of: dict[str, list[str]]
    group_members: dict[str, list[str]]
    transmitters: dict[str, str]  # transmitter id -> its qariʾ id
    ten: list[str]


def build_lexicon(authorities: dict[str, Any]) -> Lexicon:
    names: dict[tuple[str, ...], tuple[str, str]] = {}

    def add(phrase: str, kind: str, ident: str) -> None:
        tokens = tuple(fk(t) for t in phrase.split())
        if tokens and all(tokens):
            names[tokens] = (kind, ident)

    riwayat_of = {q["id"]: list(q["riwayat"]) for q in authorities["qaris"]}
    transmitters = {r["id"]: r["qari"] for r in authorities["riwayat"]}
    for x in authorities["qaris"] + authorities["riwayat"]:
        for phrase in x["match_ar"]:
            if lib.normalize(phrase) == "الدوري":
                continue
            add(phrase, "a", x["id"])
    for gid, group in authorities.get("groups", {}).items():
        for phrase in group["match_ar"]:
            add(phrase, "g", gid)
    add("الدوري", "duri", "duri")
    for phrase in UNRESOLVED_TERMS:
        add(phrase, "u", phrase)
    for phrase in OUTSIDERS:
        add(phrase, "o", phrase)
    heads: dict[str, list[tuple[str, ...]]] = {}
    for tokens in names:
        heads.setdefault(tokens[0], []).append(tokens)
    for key in heads:
        heads[key].sort(key=len, reverse=True)
    ten = [r for q in authorities["sets"]["ten"] for r in riwayat_of[q]]
    return Lexicon(names, heads, riwayat_of, {g: v["members"] for g, v in authorities.get("groups", {}).items()},
                   transmitters, ten)


def match_at(els: list[El], i: int, lex: Lexicon) -> Hit | None:
    """The reader name starting at element i, if any. A leading و or ف is a conjunction."""
    if els[i].kind != "word":
        return None
    core = els[i].core
    variants = [core] + ([core[1:]] if len(core) > 2 and core[0] in "وف" else [])
    for head in variants:
        for tokens in lex.heads.get(head, []):
            span = els[i:i + len(tokens)]
            if len(span) < len(tokens):
                continue
            if all(el.kind == "word" for el in span) and (span[0].core == head or span[0].core[1:] == head) \
                    and all(span[k].core == tokens[k] for k in range(1, len(tokens))):
                kind, ident = lex.names[tokens]
                hit = Hit(kind, ident, span[0].s, span[-1].e, len(tokens))
                return _extend_with_an(els, i, hit, lex)
    return None


def _extend_with_an(els: list[El], i: int, hit: Hit, lex: Lexicon) -> Hit:
    """Join "transmitter عن qariʾ" ("Ḥafṣ from ʿĀṣim", "al-Dūrī from Abū ʿAmr") into one named reader."""
    j = i + hit.n
    if j + 1 >= len(els) or els[j].core != "عن":
        return hit
    after = match_at(els, j + 1, lex)
    if after is None or after.kind != "a":
        return hit
    if hit.kind == "duri" and after.ident in ("abu_amr", "kisai"):
        ident = "duri_abu_amr" if after.ident == "abu_amr" else "duri_kisai"
        return Hit("a", ident, hit.s, after.e, hit.n + 1 + after.n)
    if hit.kind == "a" and lex.transmitters.get(hit.ident) == after.ident:
        return Hit("a", hit.ident, hit.s, after.e, hit.n + 1 + after.n)
    return hit


def trim_span(text: str) -> str:
    """A reader span without the brackets or the conjunction the book prints around it."""
    return text.strip(" []()،,.:/؛")


# --------------------------------------------------------------------- suras

@lru_cache(maxsize=1)
def sura_table() -> dict[str, int]:
    path = lib.REPO / "src" / "data" / "quran-sura-names.json"
    table: dict[str, int] = {}
    for row in json.loads(path.read_text(encoding="utf-8")):
        table[_sura_key(row["ar"])] = row["n"]
    for name, n in SURA_ALIASES.items():
        table[_sura_key(name)] = n
    return table


def _sura_key(name: str) -> str:
    key = fk(name)
    for prefix in ("وال", "ال"):
        if key.startswith(prefix) and len(key) > len(prefix) + 1:
            key = key[len(prefix):]
            break
    return key


def sura_from_words(words: list[str]) -> tuple[int, int] | None:
    """(sura, words consumed) for the longest run of words that names a sura."""
    table = sura_table()
    for take in (3, 2, 1):
        if len(words) >= take:
            n = table.get(_sura_key("".join(words[:take])))
            if n:
                return n, take
    return None


HEADING = re.compile(r"سورة\s+([^\[\)\(.]{2,40})")


def sura_headings(text: str, offset: int) -> list[tuple[int, int]]:
    """(absolute offset, sura) for each sura heading in the text, in order."""
    found: list[tuple[int, int]] = []
    for m in HEADING.finditer(text):
        before = text[max(0, m.start() - 3):m.start()]
        if "(" not in before and not text[max(0, m.start() - 40):m.start()].rstrip().endswith("،"):
            continue
        words = [w for w in re.split(r"\s+", m.group(1).strip()) if w]
        got = sura_from_words(words[:3])
        if got:
            found.append((offset + m.start(), got[0]))
    return found


# --------------------------------------------------------------------- units

@dataclass(frozen=True)
class Lemma:
    text: str
    s: int
    e: int
    sura: int | None  # a sura the book names ("and in al-Nisāʾ (…)"); None means the section's own sura
    excluded: bool  # the book excepts it ("except (…)"), so it takes no item


@dataclass
class Clause:
    hits: list[Hit]
    rs: int  # start offset of the reader list
    re_: int  # end offset of the reader list
    form_s: int
    end: int
    lemmas: list[Lemma] = field(default_factory=list)
    is_rest: bool = False
    rest_span: tuple[int, int] | None = None
    flags: set[str] = field(default_factory=set)
    sentence_end: bool = False
    compound: bool = False  # two lemma groups with form words between: one reading of a phrase, anchored at the first
    also: list[int] = field(default_factory=list)  # other suras the book gives the same reading in ("هنا وفي Y")


@dataclass
class Unit:
    clauses: list[Clause]
    flags: set[str] = field(default_factory=set)

    @property
    def start(self) -> int:
        return self.clauses[0].rs

    @property
    def end(self) -> int:
        return self.clauses[-1].end


def read_run(els: list[El], i: int, lex: Lexicon) -> tuple[list[Hit], int] | None:
    """Consecutive reader names starting at element i, and the index just past them."""
    hits: list[Hit] = []
    j = i
    while j < len(els):
        hit = match_at(els, j, lex)
        if hit is None:
            break
        hits.append(hit)
        j += hit.n
        if els[j - 1].sentence_end:  # a full stop closes the list; the next name begins another
            break
    return (hits, j) if hits else None


def is_mention_word(core: str) -> bool:
    """A preposition that makes a following name a mention, with or without a one-letter prefix (لغير, وعن)."""
    if core in MENTION_BEFORE:
        return True
    return len(core) > 2 and core[0] in "ولفب" and core[1:] in MENTION_BEFORE


def starts_list(els: list[El], i: int, lex: Lexicon) -> tuple[list[Hit], int] | None:
    """A reader list that opens a clause at i, not a name mentioned inside a sentence."""
    if els[i].kind != "word":
        return None
    if i > 0 and not els[i - 1].comma and is_mention_word(els[i - 1].core):
        return None
    return read_run(els, i, lex)


def _is_noise(clause: Clause, els: list[El], j: int, first: int) -> bool:
    """A reader list followed by nothing but an introducing verb ("قرأ", "وقال") and no lemma."""
    if clause.is_rest or clause.lemmas:
        return False
    words = [e.core for e in els[first:j] if e.kind == "word"]
    return all(w in INTRO for w in words)


def parse_units(els: list[El], lex: Lexicon, sura_at) -> list[Unit]:
    """Cut the element stream into units. A unit is the clauses of one statement about a word."""
    units: list[Unit] = []
    cur: list[Clause] = []

    def close() -> None:
        nonlocal cur
        if cur:
            units.append(Unit(cur))
        cur = []

    i, n = 0, len(els)
    while i < n:
        el = els[i]
        if el.kind == "paren" and ARABIC.search(el.core) and i + 2 < n and els[i + 1].kind == "word" and els[i + 1].core in YA_VERBS:
            after = read_run(els, i + 2, lex)
            if after is not None:
                hits, j = after
                clause = Clause(hits, el.s, hits[-1].e, el.e, els[j - 1].e,
                                lemmas=[Lemma(el.core, el.s + 1, el.e - 1, None, False)], sentence_end=els[j - 1].sentence_end)
                follows = els[j] if j < n else None
                if not clause.sentence_end and follows is not None and follows.kind != "paren":
                    clause.flags.add("ya-tail")  # words follow the readers: another state or another reader may be meant
                close()
                units.append(Unit([clause]))
                i = j
                continue
        run = starts_list(els, i, lex)
        is_rest = el.kind == "word" and el.core in REST
        if run is None and not is_rest:
            i += 1
            continue
        if run is not None:
            hits, j = run
            clause = Clause(hits, hits[0].s, hits[-1].e, els[j - 1].e, els[j - 1].e)
        else:
            j = i + 1
            if el.core in {"وباقي", "باقي", "وسائر", "سائر"} and j < n and els[j].core in {"العشره", "القراء", "السبعه"}:
                j += 1
            clause = Clause([], el.s, els[j - 1].e, els[j - 1].e, els[j - 1].e, is_rest=True, rest_span=(el.s, els[j - 1].e))
        first = j
        if run is not None and els[j - 1].sentence_end:
            clause.sentence_end = True
            clause.flags.add("no-form")  # the readers end the sentence; what they read is not in it
            cur = cur + [clause] if cur else [clause]
            close()
            i = j
            continue
        if i > 0 and els[i - 1].core in AGREEMENT:
            clause.flags.add("agreement")
        if any(e.core in REMARK for e in els[max(0, i - 2):i]):
            clause.flags.add("remark")
        j = _scan_body(els, j, clause, lex, sura_at(clause.rs))
        if _is_noise(clause, els, j, first):
            i = j
            continue

        if clause.is_rest:
            if not cur and units and not any(c.is_rest for c in units[-1].clauses):
                units[-1].clauses.append(clause)  # "…ذلك. والباقون …": the rest answers the sentence before
            else:
                cur.append(clause)
                close()
        elif not cur or clause.lemmas:
            # A clause with its own lemma opens a unit; merge_units later folds it back if it only narrows the last one.
            close()
            cur = [clause]
        else:
            cur.append(clause)
        if clause.sentence_end:
            close()
        i = j
    close()
    return units


def _scan_body(els: list[El], j: int, clause: Clause, lex: Lexicon, home: int) -> int:
    """Consume one clause after its reader list: lemma groups, then the form. Returns the next index."""
    n = len(els)
    override: int | None = None
    prev_core = ""
    last_paren_end = clause.form_s
    first_paren_end: int | None = None
    started = False  # a form word has been read
    between: set[str] = set()  # words read since the last lemma group
    here_seen = False
    while j < n:
        el = els[j]
        if el.kind == "word" and el.core in REST and not clause.is_rest:
            break
        if el.kind == "word" and starts_list(els, j, lex) and not (clause.is_rest and not started):
            if prev_core in AGREEMENT:
                clause.flags.add("agreement")
            break
        if el.kind == "paren":
            if ARABIC.search(el.core):
                if clause.lemmas and between and prev_core not in EXCLUDERS and not (between & SAME_AS) and not between <= BETWEEN_OK:
                    clause.compound = True
                if clause.is_rest and started:
                    clause.flags.add("rest-with-lemma")
                clause.lemmas.append(Lemma(el.core, el.s + 1, el.e - 1, override, prev_core in EXCLUDERS))
                override = None
                between = set()
                if first_paren_end is None:
                    first_paren_end = el.e
            last_paren_end = el.e
            clause.end = el.e
            prev_core = ""
            j += 1
            continue
        if el.kind == "open":
            clause.flags.add("unclosed-paren")
            clause.end = max(clause.end, el.e)
            j += 1
            continue
        if el.kind == "close":
            clause.end = max(clause.end, el.e)
            j += 1
            continue
        core = el.core
        started = True
        nxt = els[j + 1] if j + 1 < n else None
        between.add(core)
        if core in {"هنا", "وهنا"}:
            here_seen = True
            override = None
        elif core in {"في", "وفي"}:
            words = [e for e in els[j + 1:j + 5] if e.kind == "word"]
            skip = 1 if words and words[0].core == "سوره" else 0
            got = sura_from_words([e.core for e in words[skip:skip + 3]])
            if got and got[0] != home:
                after = els[j + 1 + skip + got[1]] if j + 1 + skip + got[1] < n else None
                if after is not None and after.kind == "paren":
                    override = got[0]  # "and in al-Nisāʾ (…)": the group that follows is there
                elif here_seen:
                    clause.also.append(got[0])  # "(…) here and in al-Ḥujurāt": the same reading, another place
                elif clause.lemmas and clause.lemmas[-1].sura is None:
                    clause.lemmas[-1] = replace(clause.lemmas[-1], sura=got[0])  # "(…) in Sūrat al-Nisāʾ"
                else:
                    clause.flags.add("sura-mention")
        if core in PRONOUNS:
            clause.flags.add("pronoun")
        if core in AGREEMENT:
            clause.flags.add("agreement")
        if nxt is not None and nxt.kind == "word":
            if core in SAME_AS and starts_list(els, j + 1, lex):
                clause.flags.add("same-as")
            if core in EXCLUDERS and starts_list(els, j + 1, lex) is None and read_run(els, j + 1, lex):
                clause.flags.add("exclusion")
            if core == "عن" and read_run(els, j + 1, lex):
                clause.flags.add("attribution")
        if core in UNRESOLVED_TERMS or (core.startswith("و") and core[1:] in UNRESOLVED_TERMS):
            clause.flags.add("unresolved-term")
        if core.startswith("بخلاف"):
            clause.flags.add("dispute")
        clause.end = el.e
        prev_core = core
        if el.sentence_end:
            clause.sentence_end = True
            j += 1
            break
        j += 1
    if not clause.sentence_end and j > 0 and els[j - 1].sentence_end:
        clause.sentence_end = True
    if clause.lemmas and first_paren_end is not None:
        clause.form_s = first_paren_end
    return j
