#!/usr/bin/env python3
"""Verify word-by-word (farsh) items extracted from one book, and anchor them.

An item is one contiguous passage of the book about one word, with the forms it
gives and the readers who read each. This script is the gate between an
extraction and the site. For every item it checks that

- the evidence is an exact substring of the cited page (diacritics and tatweel
  ignored, nothing else), and the lemma, every form description, every reader
  span and every "the rest" span sit inside the evidence;
- every reader is a known qāriʾ or riwāya, and a collective term (al-Ḥaramiyyān,
  al-Kūfiyyūn) is used only in a book that defines it, with the definition
  itself found in that book;
- a reader appears in at most one form of an item, and a form is not empty;
- the lemma matches a word of the Cairo text, and the verse chosen for the item
  is reported as agree (the extractor's verse matches), moved (it did not, the
  first match at or after the previous item is used) or none (no verse of the
  sura has the word).

It also measures coverage: the union of all evidence spans and all `skipped`
spans is laid over the pages the batch claims to cover, and any stretch of
letters that no span accounts for is listed. A batch with unaccounted stretches
is incomplete, not wrong.

    python scripts/quran/qiraat/verify-farsh-items.py --batch FILE [--write]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
import qiraat_lib as lib  # noqa: E402

SCOPES = {"here", "wherever", "listed", "rule"}
BASES = {"listing", "report", "rejected", "disputed", "permitted"}
GAP_MIN = 25  # letters; shorter unaccounted stretches are headings and stray marks
LETTERS = re.compile("[ء-ي]")


def known_readers(authorities: dict[str, Any]) -> set[str]:
    return {q["id"] for q in authorities["qaris"]} | {r["id"] for r in authorities["riwayat"]}


def name_table(authorities: dict[str, Any]) -> dict[str, list[str]]:
    """Authority id -> the normalized names that may stand for it in a span."""
    names = {x["id"]: [lib.normalize(m) for m in x["match_ar"]] for x in authorities["qaris"] + authorities["riwayat"]}
    # Taḥbir p. 432 uses the accusative after "except": إلا أبا جعفر.
    # Keep this verification alias out of the frozen parser lexicon, whose
    # segmentation and durable review ids depend on the authority name table.
    names["abu_jafar"].append("أبا جعفر")
    # The same accusative after "أن" in the rules chapters: أن أبا عمرو لم يدغم.
    names["abu_amr"].append("أبا عمرو")
    # p. 211 prints the conjunction and the name run together: وأبوعمرو.
    names["abu_amr"].append("أبوعمرو")
    # "عيسى بن وردان": the book writes the patronymic without the alif.
    names["ibn_wardan"].append("بن وردان")
    # The accusative after "أن" and "روى": أبا شعيب.
    names["susi"].append("أبا شعيب")
    names["susi"].append("أبي شعيب")
    # Prefixed lam of "for": للدوري, للسوسي; and the kunya أبي عمر of al-Duri.
    names["duri_abu_amr"].append("للدوري")
    names["susi"].append("للسوسي")
    names["duri_kisai"].append("أبي عمر عن الكسائي")
    # "Hamza, from the narration of Khalaf": the transmitter is Khalaf from Hamza.
    names["khalaf_hamza"].append("حمزة من رواية خلف")
    # "Khalaf for himself and for Hamza": both Khalafs, the second split by an addition.
    names["khalaf_hamza"].append("لنفسه [ولحمزة]")
    # Genitive after "مذهب" in the chapter headings.
    names["abu_jafar"].append("أبي جعفر")
    # Ibn Mujahid's Sabʿa (5530) spells al-Kisāʾī with an alif maqsura.
    names["kisai"].append("الكسائى")
    # The edition transposes the conjunction in Abu Amr's name on p. 469.
    names["abu_amr"].append("أبو وعمرو")
    return names


# Two transmitters share a name with another reader's; the span must carry the disambiguating word.
NEEDS_WORD = {"duri_abu_amr": "عمرو", "duri_kisai": "الكسائي", "khalaf_hamza": "حمزة"}


def span_names_authority(authority: str, span: str | None, names: dict[str, list[str]]) -> bool:
    text = lib.normalize(span or "")
    if not any(name in text for name in names[authority]):
        return False
    return NEEDS_WORD.get(authority, "") in text


STREAMS: dict[str, lib.Stream] = {}
# Collective terms that name their members without the individual names.
TERMS = {lib.normalize("البصريان"): {"abu_amr", "yaqub"}}


def identified_ok(reader: dict[str, Any], names: dict[str, list[str]]) -> bool:
    """A misprinted or bare name is accepted when a named page of another book carries the identification.

    The quotation must be found on that page and must itself name the reader.
    """
    ident = reader.get("identified_by")
    if not ident:
        return False
    book_id = ident.get("book_id")
    if book_id not in STREAMS:
        STREAMS[book_id] = lib.Stream(lib.load_book(book_id))
    try:
        found = STREAMS[book_id].locate({"page": ident.get("page"), "volume": ident.get("volume")}, ident.get("quote", ""))
    except KeyError:
        return False
    if found is None:
        return False
    quote = lib.normalize(ident.get("quote", ""))
    if any(term in quote and reader["authority"] in members for term, members in TERMS.items()):
        return True
    return span_names_authority(reader["authority"], ident.get("quote", ""), names)


def context_witness(witness: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    """The page window a context reader is cut from, independent of the item's own pages."""
    out = {k: v for k, v in witness.items() if k in ("book_id", "volume")}
    out["page"] = context["page"]
    out["page_end"] = context.get("page_end", context["page"])
    return out


def narrowing_ok(reader: dict[str, Any], evidence: str, authorities: dict[str, Any], names: dict[str, list[str]]) -> bool:
    """A reader may be entered under a wider name when the same evidence sets his sibling apart.

    This is the book's own way of excepting one transmitter ("Ibn Amir, with a dispute about Hisham",
    "Nafi, with a dispute about Warsh", "the Haramiyyan, and Warsh changes it to an alif"). The entry
    says which qari, or which collective term, the span names (`narrowed_from`); the evidence must
    name another transmitter of the same qari, or of a member of the term.
    """
    parent = reader.get("narrowed_from")
    authority = reader.get("authority")
    if not parent or not authority:
        return False
    span = lib.normalize(reader.get("span", ""))
    riwayat = authorities["riwayat"]
    mine = next((x for x in riwayat if x["id"] == authority), None)
    my_qari = mine["qari"] if mine else authority
    groups = authorities.get("groups", {})
    if parent in groups:
        members = groups[parent]["members"]
        # The plural terms are declined in the text (الحرميين after an accusative particle), so compare the stem.
        if my_qari not in members or not any(lib.normalize(m)[:-2] in span for m in groups[parent]["match_ar"]):
            return False
        siblings = [x["id"] for x in riwayat if x["qari"] in members and x["id"] != authority]
    else:
        if mine is None or mine["qari"] != parent or not span_names_authority(parent, span, names):
            return False
        siblings = [x["id"] for x in riwayat if x["qari"] == parent and x["id"] != authority]
    return any(span_names_authority(sib, evidence, names) for sib in siblings)


def check_groups(authorities: dict[str, Any], streams: dict[str, lib.Stream]) -> list[str]:
    """Every collective term must be defined by a sentence found in the defining book."""
    errors: list[str] = []
    for gid, group in authorities.get("groups", {}).items():
        by = group["defined_by"]
        stream = streams.setdefault(by["book_id"], lib.Stream(lib.load_book(by["book_id"])))
        try:
            found = stream.locate({"page": by["page"], "volume": by.get("volume")}, by["evidence"])
        except KeyError as error:
            errors.append(f"group {gid}: {error.args[0]}")
            continue
        if found is None:
            errors.append(f"group {gid}: its definition is not on page {by['page']} of book {by['book_id']}")
    return errors


# ------------------------------------------------------------ compact input
#
# Agents do not copy sentences. They give a snippet, or a [start, end] pair of
# snippets, and this tool cuts the exact text out of the cited pages. A snippet
# that occurs more than once in the page window is refused for evidence, so the
# text taken is always the passage the extractor meant.


def window_text(stream: lib.Stream, witness: dict[str, Any]) -> tuple[str, int]:
    first, last = stream.book.window(witness)
    lo, hi = stream.starts[first], stream.ends[last]
    return stream.text[lo:hi], lo


def cut(snip: Any, text: str, start: int = 0, unique: bool = False) -> tuple[int, int]:
    """(start, end) of a snippet or a [start, end] snippet pair inside `text`, from `start`."""
    parts = [snip] if isinstance(snip, str) else list(snip)
    if len(parts) not in (1, 2) or not all(isinstance(x, str) for x in parts):
        raise ValueError(f"a span is a snippet or a [start, end] pair, not {snip!r}")
    head = lib.normalize(parts[0])
    if not head:
        raise ValueError("empty snippet")
    hits = [m.start() for m in re.finditer(re.escape(head), text[start:])]
    if not hits:
        raise ValueError(f"snippet not found: {parts[0]}")
    if unique and len(hits) > 1:
        raise ValueError(f"snippet occurs {len(hits)} times in the pages; lengthen it: {parts[0]}")
    begin = start + hits[0]
    if len(parts) == 1:
        return begin, begin + len(head)
    tail = lib.normalize(parts[1])
    at = text.find(tail, begin)
    if not tail or at < 0:
        raise ValueError(f"end snippet not found after the start: {parts[1]}")
    return begin, at + len(tail)


def source_labels(item: dict[str, Any]) -> dict[str, Any]:
    """Replace draft placeholders with a literal prefix of the source description."""
    forms = []
    for form in item.get("forms", []):
        label = str(form.get("short") or "").strip()
        if not label or re.fullmatch(r"form \d+", label):
            label = " ".join(str(form.get("desc") or "").split()[:4])
        forms.append({**form, "short": label})
    return {**item, "forms": forms}


def expand_item(item: dict[str, Any], stream: lib.Stream, book_id: str) -> tuple[dict[str, Any], list[str]]:
    """Compact item -> canonical item, with source labels for draft placeholders."""
    if "evidence" in item:
        return source_labels(item), []
    iid = item.get("id", "?")
    errors: list[str] = []
    witness = {"book_id": book_id, "page": item.get("page")}
    if item.get("volume"):
        witness["volume"] = item["volume"]
    if item.get("page_end"):
        witness["page_end"] = item["page_end"]
    try:
        text, _ = window_text(stream, witness)
        begin, end = cut(item["ev"], text, unique=True)
    except (KeyError, ValueError) as error:
        return item, [f"{iid}: evidence: {error.args[0]}"]
    evidence = text[begin:end]
    occurrence = len(re.findall(re.escape(evidence), text[:begin + len(evidence)]))
    canon: dict[str, Any] = {
        "id": iid, "witness": witness, "evidence": evidence, "occurrence": occurrence,
        "lemma": item.get("lemma"), "verse": item.get("verse"), "scope": item.get("scope"), "forms": [],
    }
    for key in ("note", "unresolved", "anchor_at_hint", "chapter", "merge_into"):
        if item.get(key):
            canon[key] = item[key]

    def span(snip: Any, label: str) -> str | None:
        try:
            a, b = cut(snip, evidence)
        except ValueError as error:
            errors.append(f"{iid}: {label}: {error.args[0]}")
            return None
        return evidence[a:b]

    canon["lemma"] = span(item.get("lemma"), "lemma") if item.get("lemma") else None
    for index, form in enumerate(item.get("forms") or [], start=1):
        out: dict[str, Any] = {"short": form.get("short"), "basis": form.get("basis", "listing"), "readers": []}
        if form.get("desc") is not None:
            out["desc"] = span(form["desc"], f"form {index} desc")
        for reader in form.get("readers") or []:
            kind, ident, snip, *extra = reader
            context = extra[2] if len(extra) > 2 and extra[2] else None
            if context:
                # The reader is named in a sentence before the evidence (a chapter that speaks of one
                # reader and then uses pronouns). The span is cut from the page window named here.
                try:
                    ctx_text, _ = window_text(stream, context_witness(witness, context))
                    ca, cb = cut(snip, ctx_text, unique=True)
                    text_span = ctx_text[ca:cb]
                except (KeyError, ValueError) as error:
                    errors.append(f"{iid}: form {index} reader {ident} context: {error.args[0]}")
                    text_span = None
            else:
                text_span = span(snip, f"form {index} reader {ident}")
            entry: dict[str, Any] = {("group" if kind == "g" else "authority"): ident, "span": text_span}
            if extra:
                entry["basis"] = extra[0]
            if len(extra) > 1 and extra[1]:
                entry["narrowed_from"] = extra[1]
            if context:
                entry["context"] = context
            if len(extra) > 3 and extra[3]:
                entry["identified_by"] = extra[3]
            out["readers"].append(entry)
        if form.get("rest"):
            out["rest"] = {"span": span(form["rest"], f"form {index} rest")}
        if form.get("value_of"):
            out["value_of"] = form["value_of"]
        canon["forms"].append(out)
    canon["unresolved"] = [{"span": span(u["span"], "unresolved"), "reason": u.get("reason", "")}
                           for u in item.get("unresolved", [])]
    if not canon["unresolved"]:
        canon.pop("unresolved")
    return source_labels(canon), errors


def expand_batch(batch: dict[str, Any], stream: lib.Stream) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    items = []
    for item in batch["items"]:
        canon, item_errors = expand_item(item, stream, batch["book_id"])
        errors.extend(item_errors)
        items.append(canon)
    skipped = []
    for skip in batch.get("skipped", []):
        if "evidence" in skip:
            skipped.append(skip)
            continue
        witness = {"book_id": batch["book_id"], "page": skip.get("page")}
        if skip.get("volume"):
            witness["volume"] = skip["volume"]
        if skip.get("page_end"):
            witness["page_end"] = skip["page_end"]
        try:
            text, _ = window_text(stream, witness)
            a, b = cut(skip["ev"], text)
        except (KeyError, ValueError) as error:
            errors.append(f"skipped {skip.get('id')}: {error.args[0]}")
            continue
        skipped.append({"id": skip.get("id"), "witness": witness, "evidence": text[a:b], "reason": skip.get("why", "")})
    return dict(batch, items=items, skipped=skipped), errors


def check_item(item: dict[str, Any], stream: lib.Stream, registry: dict[str, Any],
               authorities: dict[str, Any], readers: set[str],
               names: dict[str, list[str]]) -> tuple[list[str], tuple[int, int] | None]:
    errors: list[str] = []
    iid = item.get("id", "?")
    witness = item.get("witness") or {}
    book_id = witness.get("book_id")
    if book_id not in registry:
        return [f"{iid}: book {book_id} is not in the registry"], None
    try:
        span = stream.locate(witness, item["evidence"], item.get("occurrence", 1))
    except KeyError as error:
        return [f"{iid}: {error.args[0]}"], None
    if span is None:
        return [f"{iid}: evidence not found in the cited pages"], None
    evidence = lib.normalize(item["evidence"])

    def inside(label: str, text: str | None) -> None:
        cleaned = lib.normalize(text or "")
        if not cleaned:
            errors.append(f"{iid}: empty {label}")
        elif cleaned not in evidence:
            errors.append(f"{iid}: {label} not inside evidence: {text}")

    inside("lemma", item.get("lemma"))
    if item.get("scope") not in SCOPES:
        errors.append(f"{iid}: scope must be one of {sorted(SCOPES)}")
    if item.get("scope") == "rule":
        if item.get("verse"):
            errors.append(f"{iid}: a rule has no verse")
    elif not re.fullmatch(r"\d{1,3}:\d{1,3}", str(item.get("verse", ""))):
        errors.append(f"{iid}: verse must look like 2:9")
    forms = item.get("forms") or []
    if not forms:
        errors.append(f"{iid}: no forms")
    named: dict[str, tuple[int, str]] = {}
    rests = 0
    for index, form in enumerate(forms, start=1):
        tag = f"{iid} form {index}"
        inside(f"{tag} desc", form.get("desc"))
        if not str(form.get("short", "")).strip():
            errors.append(f"{tag}: missing short label")
        if form.get("basis", "listing") not in BASES:
            errors.append(f"{tag}: basis must be one of {sorted(BASES)}")
        if not form.get("readers") and not form.get("rest"):
            errors.append(f"{tag}: names no reader and no 'rest'")
        if form.get("rest"):
            rests += 1
            inside(f"{tag} rest", form["rest"].get("span"))
            if registry[book_id]["reader_set"] not in authorities["sets"]:
                errors.append(f"{tag}: 'rest' needs a book with a declared reader set")
        for reader in form.get("readers", []):
            if reader.get("context"):
                ctx = reader["context"]
                located = stream.locate(context_witness(witness, ctx), reader.get("span") or "", 1)
                if located is None:
                    errors.append(f"{tag}: context span not found on page {ctx['page']}: {reader.get('span')}")
            else:
                inside(f"{tag} reader span", reader.get("span"))
            if reader.get("basis", "listing") not in BASES:
                errors.append(f"{tag}: reader basis must be one of {sorted(BASES)}")
            if "group" in reader:
                group = authorities.get("groups", {}).get(reader["group"])
                if group is None:
                    errors.append(f"{tag}: unknown group {reader['group']}")
                elif book_id != group["defined_by"]["book_id"] and book_id not in group.get("applies_to", []):
                    errors.append(f"{tag}: group {reader['group']} is not defined for book {book_id}")
                members = group["members"] if group else []
            elif reader.get("authority") in readers:
                members = [reader["authority"]]
                if reader.get("narrowed_from"):
                    if not narrowing_ok(reader, evidence, authorities, names):
                        errors.append(f"{tag}: {reader['authority']} cannot be narrowed from {reader['narrowed_from']}: "
                                      "the span must name that qari and the evidence must name his other transmitter")
                elif not span_names_authority(reader["authority"], reader.get("span", ""), names):
                    if not identified_ok(reader, names):
                        errors.append(f"{tag}: span '{reader.get('span')}' does not name {reader['authority']}")
            else:
                errors.append(f"{tag}: unknown authority {reader.get('authority')}")
                members = []
            basis = reader.get("basis", form.get("basis", "listing"))
            for member in members:
                earlier = named.get(member)
                if earlier and earlier[0] != index and not (basis == "disputed" == earlier[1])                         and "permitted" not in (basis, earlier[1]):
                    errors.append(f"{tag}: {member} is also named in form {earlier[0]}; "
                                  "a reader may sit in two forms only if both entries are marked disputed "
                                  "or one of them is a permitted way of beginning")
                if basis != "permitted" or member not in named:
                    named[member] = (index, basis)
            span_text = lib.normalize(reader.get("span") or "")
            if reader.get("authority") == "khalaf_ashir" and "عن حمزة" in span_text:
                errors.append(f"{tag}: span says 'from Ḥamza', which is the transmitter, not Khalaf al-ʿĀshir")
    if rests > 1:
        errors.append(f"{iid}: more than one 'the rest' in one item")
    for unresolved in item.get("unresolved", []):
        inside("unresolved span", unresolved.get("span"))
        if not str(unresolved.get("reason", "")).strip():
            errors.append(f"{iid}: an unresolved span needs a reason")
    if item.get("unresolved") and rests:
        errors.append(f"{iid}: 'the rest' cannot be resolved while the item has unresolved reader terms; "
                      "move the rest phrase into unresolved")
    return errors, span


def coverage(stream: lib.Stream, batch: dict[str, Any], spans: list[tuple[int, int]]) -> list[dict[str, Any]]:
    """Unaccounted stretches of letters inside the batch's pages."""
    pages = batch["pages"]
    volume = pages.get("volume")
    first = stream.book.index_of(pages["from"], volume)
    last = stream.book.index_of(pages["to"], volume)
    lo, hi = stream.starts[first], stream.ends[last]
    covered = bytearray(hi - lo)
    for start, end in spans:
        for position in range(max(start, lo), min(end, hi)):
            covered[position - lo] = 1
    gaps: list[dict[str, Any]] = []
    position = 0
    text = stream.text[lo:hi]
    while position < len(covered):
        if covered[position]:
            position += 1
            continue
        end = position
        while end < len(covered) and not covered[end]:
            end += 1
        chunk = text[position:end]
        if len(LETTERS.findall(chunk)) >= GAP_MIN:
            page_index = max(i for i in range(first, last + 1) if stream.starts[i] <= lo + position)
            gaps.append({"page": stream.book.pages[page_index]["page"], "letters": len(LETTERS.findall(chunk)),
                         "text": chunk.strip()})
        position = end
    return gaps


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--batch", type=Path, required=True)
    parser.add_argument("--registry", type=Path, default=lib.QIRAAT_DIR / "sources.json")
    parser.add_argument("--authorities", type=Path, default=lib.QIRAAT_DIR / "authorities.json")
    parser.add_argument("--write", action="store_true", help="write <batch>.checked.json with anchors and coverage")
    parser.add_argument("--allow-gaps", action="store_true", help="do not fail on unaccounted stretches")
    args = parser.parse_args()

    batch = json.loads(args.batch.read_text(encoding="utf-8"))
    registry = {b["book_id"]: b for b in json.loads(args.registry.read_text(encoding="utf-8"))["books"]}
    authorities = json.loads(args.authorities.read_text(encoding="utf-8"))
    readers = known_readers(authorities)
    names = name_table(authorities)
    book_id = batch["book_id"]
    streams: dict[str, lib.Stream] = {book_id: lib.Stream(lib.load_book(book_id))}
    STREAMS.update(streams)
    errors = check_groups(authorities, streams)
    stream = streams[book_id]
    batch, expand_errors = expand_batch(batch, stream)
    errors.extend(expand_errors)
    if expand_errors:
        batch = dict(batch, items=[i for i in batch["items"] if "evidence" in i])

    spans: list[tuple[int, int]] = []
    seen: set[str] = set()
    checked: list[dict[str, Any]] = []
    cursor: dict[int, int] = {}
    for item in batch["items"]:
        if item.get("id") in seen:
            errors.append(f"{item.get('id')}: duplicate id")
        seen.add(item.get("id"))
        if item.get("witness", {}).get("book_id") != book_id:
            errors.append(f"{item.get('id')}: witness book differs from the batch book {book_id}")
        item_errors, span = check_item(item, stream, registry, authorities, readers, names)
        errors.extend(item_errors)
        if span:
            spans.append(span)
        anchor: dict[str, Any] = {"status": "none"}
        if item.get("scope") == "rule":
            anchor = {"status": "rule"}
        elif not item_errors:
            sura_no, hint = (int(x) for x in item["verse"].split(":"))
            if not 1 <= sura_no <= 114:
                errors.append(f"{item['id']}: sura {sura_no} out of range")
            else:
                sura = lib.load_sura(sura_no)
                matches = lib.match_lemma(item["lemma"], sura)
                if hint not in matches:
                    # The book prints the variant, so the Cairo word at the stated verse may differ by one letter.
                    near = lib.near_matches(lib.tokens(item["lemma"]), sura)
                    if hint in near:
                        matches = {**matches, hint: near[hint]}
                verse, status = lib.choose_verse(matches, hint, cursor.get(sura_no, 1))
                anchor = {"status": status, "sura": sura_no, "hint": hint}
                if status == "moved" and item.get("anchor_at_hint"):
                    # A reviewed source locator can specify a variant spelling
                    # absent at the Cairo verse. Do not bind it to another occurrence.
                    anchor = {"status": "weak", "sura": sura_no, "hint": hint,
                              "candidates": sorted(matches), "review_note": item["anchor_at_hint"]}
                elif verse is not None and (matches[verse]["how"].startswith("word")
                                          or (matches[verse]["how"] == "near" and status != "agree")):
                    # One word of a longer lemma matched, or a one-letter match away from the named verse:
                    # too weak to place at a verse.
                    anchor = {"status": "weak", "sura": sura_no, "hint": hint, "candidates": sorted(matches)}
                elif verse is not None:
                    cursor[sura_no] = verse
                    anchor.update({"verse": verse, "how": matches[verse]["how"], "word_ids": matches[verse]["word_ids"],
                                   "candidates": sorted(matches)})
        checked.append({**item, "anchor": anchor})

    for skip in batch.get("skipped", []):
        try:
            span = stream.locate(skip["witness"], skip["evidence"])
        except KeyError as error:
            errors.append(f"skipped {skip.get('id')}: {error.args[0]}")
            continue
        if span is None:
            errors.append(f"skipped {skip.get('id')}: evidence not found in the cited pages")
        else:
            spans.append(span)
        if not str(skip.get("reason", "")).strip():
            errors.append(f"skipped {skip.get('id')}: needs a reason")

    # A supplement batch enters statements that an earlier review set aside. Their pages are already
    # accounted for in the batch that owns them, so it is not measured for coverage again.
    gaps = coverage(stream, batch, spans) if not errors and batch.get("coverage") != "supplement" else []
    counts: dict[str, int] = {}
    for item in checked:
        counts[item["anchor"]["status"]] = counts.get(item["anchor"]["status"], 0) + 1
    print(f"batch {args.batch.name}: items {len(batch['items'])}  skipped {len(batch.get('skipped', []))}  "
          f"errors {len(errors)}  gaps {len(gaps)}  anchors {counts}")
    for message in errors[:60]:
        print("  error:", message)
    if len(errors) > 60:
        print(f"  ... {len(errors) - 60} more errors")
    for gap in gaps:
        print(f"  gap p.{gap['page']} ({gap['letters']} letters): {gap['text'][:110]}")
    unanchored = [i["id"] for i in checked if i["anchor"]["status"] in ("none", "moved", "weak")]
    if unanchored and not errors:
        print("  anchor attention:", ", ".join(unanchored[:40]) + (" ..." if len(unanchored) > 40 else ""))
    if args.write and not errors:
        out = dict(batch, items=checked, coverage_gaps=gaps)
        target = args.batch.with_suffix(".checked.json")
        target.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"wrote {target.name}")
    if errors:
        return 1
    return 0 if (args.allow_gaps or not gaps) else 2


if __name__ == "__main__":
    sys.exit(main())
