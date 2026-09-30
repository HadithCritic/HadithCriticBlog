"""Look up DOIs for the studies in chapters.json and the works in extras.json.

A Crossref record is accepted only when its title matches the printed title (after
folding case and diacritics, ignoring subtitles) and the lead author's surname is among
its authors. Rejections are printed so they can be checked by hand. Output:
crossref_extra.json, keyed by "<volume file>#<printed page>" for chapters and by the
file name for extras. Run from docs/research/hadith-graph/inputs.
"""
import difflib
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request

UA = {"User-Agent": "hadithcritic-research-atlas (mailto:jonathan@wikisubmission.org)"}


def fold(s):
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"<[^>]+>", "", s).lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", s)).strip()


def surname(name):
    return fold(name).split()[-1] if fold(name).split() else ""


def query(title, author, container=""):
    q = urllib.parse.urlencode({
        "query.bibliographic": f"{title} {author} {container}".strip(),
        "rows": 4,
        "select": "DOI,title,author,editor,issued,container-title,type,publisher,license",
    })
    for attempt in range(3):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request("https://api.crossref.org/works?" + q, headers=UA), timeout=30))
            return d["message"]["items"]
        except Exception as e:  # network hiccup: retry, then give up on this one
            time.sleep(1.5 * (attempt + 1))
            err = e
    print("  ERR", err)
    return []


def matches(item, title, author, kind=None):
    if kind == "book" and not str(item.get("type", "")).startswith(("book", "monograph", "edited-book", "reference-book")):
        return False, 0.0  # a review of the book carries the book's title, so the record type has to be a book
    ct = fold((item.get("title") or [""])[0])
    want = fold(title)
    head = lambda t: fold(re.split(r"[:–—]", t)[0])
    ratio = max(difflib.SequenceMatcher(None, ct, want).ratio(), difflib.SequenceMatcher(None, head(ct), head(want)).ratio() if ct else 0)
    people = [surname(p.get("family", "")) for p in item.get("author", []) + item.get("editor", [])]
    return ratio >= 0.9 and surname(author) in people, ratio


def main():
    chapters = json.load(open("chapters.json", encoding="utf-8"))["volumes"]
    extras = json.load(open("extras.json", encoding="utf-8"))["works"]
    out = {}
    jobs = []
    for vol, v in chapters.items():
        for ch in v["chapters"]:
            if ch.get("existing"):
                continue
            jobs.append((f"{vol}#{ch['printed']}", ch["title"], ch["authors"][0], v["volumeTitle"], None))
    for w in extras:
        jobs.append((w["key"], w["title"], w["authors"][0], "", "book" if w["type"] in ("book", "edited volume") else None))
    for key, title, author, container, kind in jobs:
        items = query(title, author, container)
        chosen = None
        for it in items:
            ok, ratio = matches(it, title, author, kind)
            if ok:
                chosen = it
                break
        if chosen:
            out[key] = {
                "doi": chosen["DOI"],
                "title": (chosen.get("title") or [""])[0],
                "container": (chosen.get("container-title") or [""])[0],
                "year": (chosen.get("issued", {}).get("date-parts") or [[None]])[0][0],
                "type": chosen.get("type"),
                "publisher": chosen.get("publisher"),
                "license": [l.get("URL") for l in chosen.get("license", [])],
            }
            print(f"OK   {title[:60]} | {chosen['DOI']} | {out[key]['container'][:40]} | {out[key]['year']}")
        else:
            print(f"none {title[:60]} ({author})")
        time.sleep(0.2)
    json.dump(out, open("crossref_extra.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(len(out), "of", len(jobs), "matched")


if __name__ == "__main__":
    main()
