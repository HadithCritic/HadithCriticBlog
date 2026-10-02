"""Build the hadith-criticism research graph from the triaged library.

Inputs (scratchpad): triage.csv, scan.jsonl, seeds.json, enriched2.json, crossref_full.json
Reads the PDFs read-only for full text (citation edges, method and theme tags).
Outputs: research-graph.json (public, no local paths), library-map.json (internal), todo.json
"""
import csv
import difflib
import json
import ntpath
import os
import pickle
import re
import unicodedata
from pathlib import Path

import fitz

LIB = os.environ.get("HADITH_LIBRARY", r"C:\Users\Jonathan\Desktop\org\05 Scholarly Library and OCR\01 PDF Library Collections\Islamic Studies")

rename_log = Path(LIB) / "RENAME_LOG.csv"
renamed_sources = {}
if rename_log.exists():
    with rename_log.open(encoding="utf-8-sig", newline="") as source:
        renamed_sources = {ntpath.basename(row["original_path"]).casefold(): row["new_path"] for row in csv.DictReader(source)}

def source_path(directory, filename):
    path = Path(directory) / filename
    if not path.exists() and Path(directory) == Path(LIB):
        relative = renamed_sources.get(filename.casefold())
        if relative:
            path = Path(LIB) / relative.replace("\\", "/")
    return str(path)

def fold(s):
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace("travelling", "traveling")
    return re.sub(r"[^a-z0-9 ]+", " ", s)

def squash(s):
    return re.sub(r"\s+", " ", s).strip()

# ---------------------------------------------------------------- selection
triage = list(csv.DictReader(open("triage.csv", encoding="utf-8-sig")))
seeds = {s["file"]: s for s in json.load(open("seeds.json", encoding="utf-8"))}
enriched = {r["file"]: r for r in json.load(open("enriched2.json", encoding="utf-8"))}
cr_full = json.load(open("crossref_full.json", encoding="utf-8"))

# Works added after the first build (OCR'd copies) and the studies printed inside larger works.
# RG_BASE=1 skips both, which reproduces the original 85-work graph for regression checks.
OCR_DIR = os.environ.get("HADITH_OCR_DIR", r"C:\Users\Jonathan\Desktop\org\05 Scholarly Library and OCR\02 Full Text OCR Transcripts\ocrd")
NEW_DIR = os.environ.get("HADITH_NEWTEXTS_DIR", r"C:\Users\Jonathan\Desktop\newtexts")
SOURCE_DIRS = {"ocrd": OCR_DIR, "newtexts": NEW_DIR}  # any other value is read from the library folder
BASE_ONLY = os.environ.get("RG_BASE") == "1"
extras = [] if BASE_ONLY else json.load(open("extras.json", encoding="utf-8"))["works"]
ADDITIONS_PATH = Path(__file__).resolve().parents[2] / "docs/research/hadith-graph/library-additions.json"
additions = [] if BASE_ONLY or not ADDITIONS_PATH.exists() else json.load(open(ADDITIONS_PATH, encoding="utf-8"))["works"]
extras.extend(additions)
volumes = {} if BASE_ONLY else json.load(open("chapters.json", encoding="utf-8"))["volumes"]
cr_extra = {} if BASE_ONLY else json.load(open("crossref_extra.json", encoding="utf-8"))

EXCLUDE_FILES = {
    # duplicates of a kept file
    "Melchert_C_-_Bukhari_and_Early_Hadith.pdf",
    "Brown_J_A_-_The_Canonization_of_Ibn.pdf",
    "Brown_J_A_C_-_Misquoting_Muhammad_-.pdf",  # trade book, kept below via override key? no: keep as work
}
EXCLUDE_FILES.discard("Brown_J_A_C_-_Misquoting_Muhammad_-.pdf")
DEMOTED = {  # renunciant / creed / Qur'an-theology items: adjacent, not core
    "Melchert_C_-_Khargushi_Tahdhib_al-Asrar.pdf",
    "Melchert_C_-_The_Biography_of_Muhammad_ibn.pdf",
    "Melchert_C_-_Ahmad_Ibn_Hanbal_s_Book.pdf",
    "Melchert_C_-_Ahmad_Ibn_Hanbal_and_the.pdf",
    "Ibn_Ahmad_ibn_Hanbal_A_-_Kitab_al-Sunnah.pdf",
    "Cook_M_-_The_Stemma.pdf",
    "Guillaume_A_-_The_Traditions_of_Islam.pdf",  # garbled text layer (needs re-OCR)
    "al-Khatib_M_ed_-_Key_Classical_Works_on.pdf",  # Islamic ethics, not hadith criticism
}
SCANNED = {r["file"] for r in triage if r["needs_ocr"] == "True"}

def selected(r):
    return (
        r["tier"] == "A"
        and not r["duplicate_of"]
        and r["file"] not in SCANNED
        and r["file"] not in EXCLUDE_FILES
        and r["file"] not in DEMOTED
    )

files = [r["file"] for r in triage if selected(r)]

# ---------------------------------------------------------------- overrides
# Every override below is checked against the PDF's own title page or a Crossref record,
# except entries listed in EDITORIAL, which are bibliographic facts not printed in the
# front matter. Those are flagged in the output so they can be confirmed.
O = {
    "Schacht_J_-_A_Revaluation.pdf": dict(title="A Revaluation of Islamic Traditions", authors=["Joseph Schacht"], year=1949, type="article", venue="Journal of the Royal Asiatic Society", doi=None),
    "Schacht_J_-_An_Introduction.pdf": dict(title="An Introduction to Islamic Law", authors=["Joseph Schacht"], year=1964, type="book", publisher="Clarendon Press, Oxford", doi=None, editorial=["year"]),
    "Cook_M_-_The_Opponents_of_the_Writing.pdf": dict(title="The Opponents of the Writing of Tradition in Early Islam", authors=["Michael Cook"], year=1997, type="article", venue="Arabica 44", doi=None, editorial=["year", "venue"], revised=True),
    "Motzki_H_-_Methods_of_Dating.pdf": dict(title="Methods of Dating Early Legal Traditions: Introduction", authors=["Harald Motzki"], year=2012, type="article", venue="Islamic Law and Society 19", doi="10.1163/156851912X611248"),
    "Goldziher_I_-_Mohammed_and_Islam.pdf": dict(title="Mohammed and Islam", authors=["Ignaz Goldziher"], year=None, type="book", doi=None),
    "Goldziher_Ignaz_-_Muslim_Studies_2.pdf": dict(title="Muslim Studies (Muhammedanische Studien), Volume 2", authors=["Ignaz Goldziher"], year=None, type="book", publisher="Halle: Max Niemeyer (original German edition)", doi=None),
    "Wensinck_A_J_-_A_Handbook_of_Early_Muhammadan_Tradition.pdf": dict(title="A Handbook of Early Muhammadan Tradition", authors=["A. J. Wensinck"], year=1927, type="book", publisher="Brill", doi="10.1163/9789004599871"),
    "Calder_N_-_Studies_in_Early_Muslim_1993.pdf": dict(title="Studies in Early Muslim Jurisprudence", authors=["Norman Calder"], year=1993, type="book", publisher="Clarendon Press, Oxford", doi=None),
    "Harald_Motzki_Analysing_Muslim_Traditions.pdf": dict(title="Analysing Muslim Traditions: Studies in Legal, Exegetical and Maghāzī Ḥadīth", authors=["Harald Motzki", "Nicolet Boekhoff-van der Voort", "Sean W. Anthony"], year=2010, type="book", publisher="Brill", doi="10.1163/ej.9789004180499.i-504"),
    "alt_Harald_Motzki_Analysing_Muslim_Traditions.pdf": dict(title="The Transmission and Dynamics of the Textual Sources of Islam: Essays in Honour of Harald Motzki", authors=["Nicolet Boekhoff-van der Voort", "Kees Versteegh", "Joas Wagemakers"], year=2011, type="edited volume", publisher="Brill", doi="10.1163/9789004206786", editors=True),
    "Motzki_H_-_Reconstruction_of_a_Source_of.pdf": dict(title="Reconstruction of a Source of Ibn Isḥāq's Life of the Prophet and Early Qurʾān Exegesis", authors=["Harald Motzki"], year=2017, type="book", publisher="Gorgias Press", doi="10.31826/9781463237363"),
    "Motzki_H_ed_-_Hadith_-_Origins_and.pdf": dict(title="Ḥadīth: Origins and Developments", authors=["Harald Motzki"], year=2004, type="edited volume", publisher="Ashgate (2004); Routledge (2016)", doi="10.4324/9781315253695", editors=True),
    "Motzki_H_-_Alternative_Accounts.pdf": dict(title="Alternative Accounts of the Qurʾān's Formation", authors=["Harald Motzki"], year=2006, type="chapter", venue="The Cambridge Companion to the Qurʾān", doi=None),
    "Brown_D_W_ed_-_The_Wiley_Blackwell.pdf": dict(title="The Wiley Blackwell Concise Companion to the Hadith", authors=["Daniel W. Brown"], year=2020, type="edited volume", publisher="Wiley Blackwell", doi="10.1002/9781118638477", editors=True),
    "Brown_J_-_Hadith_Muhammad_s_Legacy_in.pdf": dict(title="Hadith: Muhammad's Legacy in the Medieval and Modern World", authors=["Jonathan A. C. Brown"], year=2009, type="book", publisher="Oneworld", doi=None),
    "Brown_J_A_C_-_Misquoting_Muhammad_-.pdf": dict(title="Misquoting Muhammad: The Challenge and Choices of Interpreting the Prophet's Legacy", authors=["Jonathan A. C. Brown"], year=2014, type="book", publisher="Oneworld", doi=None),
    "Brown_J_-_Canonization_of_Ibn_Majah.pdf": dict(title="The Canonization of Ibn Māja: Authenticity vs. Utility in the Formation of the Sunni Ḥadīth Canon", authors=["Jonathan A. C. Brown"], year=2011, type="article", venue="Revue des mondes musulmans et de la Méditerranée", doi="10.4000/remmm.7154"),
    "Melchert_C_-_Ahmad_ibn_Hanbal_Makers_of.pdf": dict(title="Ahmad ibn Hanbal", authors=["Christopher Melchert"], year=2006, type="book", publisher="Oneworld (Makers of the Muslim World)", doi=None),
    "Duderija_A_-_The_Sunna_and_its_Status.pdf": dict(title="The Sunna and its Status in Islamic Law: The Search for a Sound Ḥadīth", authors=["Adis Duderija"], year=2015, type="edited volume", publisher="Palgrave Macmillan", doi="10.1057/9781137369925", editors=True),
    "Shah_M_ed_-_The_Hadith.pdf": dict(title="The Ḥadīth (Critical Concepts in Islamic Studies)", authors=["Mustafa Shah"], year=2010, type="edited volume", publisher="Routledge", doi=None, editors=True),
    "Koya_P_K_ed_-_Hadith_and_Sunnah.pdf": dict(title="Ḥadīth and Sunnah: Ideals and Realities", authors=["P. K. Koya"], year=None, type="edited volume", publisher="National Book Service, Lahore", doi=None, editors=True),
    "Melchert_Christopher_-_The_Theory_and_Practice_of.pdf": dict(title="The Theory and Practice of Hadith Criticism in the Mid-Ninth Century", authors=["Christopher Melchert"], year=2020, type="chapter", venue="Islam at 250", doi="10.1163/9789004427952_006"),
    "Melchert_C_-_How_to_Cite_Hadith.pdf": dict(title="How to Cite Hadith: Some Proposed Conventions", authors=["Christopher Melchert"], year=2020, type="draft", doi=None, editorial=["year"]),
    "Pavlovitch_P_-_Hadith_criticism.pdf": dict(title="Al-Jūzjānī's Approach to Hadith Criticism and His \"Antagonism toward ʿAlī\": A Comparative Analysis", authors=["Pavel Pavlovitch"], year=None, type="article", doi=None),
    "Pavlovitch_P_-_Hadith_criticism_2.pdf": dict(title="Ḥadīth criticism", authors=["Pavel Pavlovitch"], year=2019, type="encyclopedia entry", venue="Encyclopaedia of Islam, THREE", doi="10.1163/1573-3912_ei3_com_30164"),
    "Reinhart_A_-_Juybolliana.pdf": dict(title="Juynbolliana, Gradualism, the Big Bang, and Ḥadīth Study in the Twenty-First Century", authors=["A. Kevin Reinhart"], year=2010, type="review article", venue="Journal of the American Oriental Society 130.3", doi=None),
    "Hilali_A_-_The_Notion_of_Truth.pdf": dict(title="The Notion of Truth in Hadith Sciences", authors=["Asma Hilali"], year=None, type="chapter", doi=None),
    "Little_J_-_The_Hadith_of_Aisha_s.pdf": dict(title="The Hadith of ʿĀʾišah's Marital Age: A Study in the Evolution of Early Islamic Historical Memory", authors=["Joshua J. Little"], year=2023, type="thesis", venue="DPhil thesis, University of Oxford (Pembroke College); version 1.1, 8 March 2023", doi=None),
    "Little_J_Where-did-you-learn-to-write-Arabic-A-Critical-Analysis-of-Some-ad-ths-on-the-Origins-and.pdf": dict(title="'Where did you learn to write Arabic?': A Critical Analysis of Some Ḥadīths on the Origins and Spread of the Arabic Script", authors=["Joshua J. Little"], year=2024, type="article", venue="Journal of Islamic Studies 35.2", doi="10.1093/jis/etae008"),
    "Boekhoff_van_der_Voort_Biography_of_Prophet_Muhammad_al_Zuhri.pdf": dict(title="Between History and Legend: The Biography of the Prophet Muhammad by Ibn Shihāb al-Zuhrī", authors=["Nicolet Boekhoff-van der Voort"], year=2012, type="thesis", venue="PhD dissertation, Radboud University Nijmegen", doi=None),
    "Melchert_C_-_Review_of_Abd_al-Rahman_Mahjubi.pdf": dict(title="Review of ʿAbd al-Raḥmān Maḥjūbī, on hadith terminology in Ibn Abī Ḥātim's al-Jarḥ wa-l-taʿdīl", authors=["Christopher Melchert"], year=2015, type="review", venue="Al-ʿUṣūr al-Wusṭā 23", doi=None),
    "Aerts_S_-_Pray_with_Your_Leader_-.pdf": dict(title="“Pray with Your Leader”: A Proto-Sunni Quietist Tradition", authors=["Stijn Aerts"], year=2016, type="article", venue="Journal of the American Oriental Society 136.1", doi="10.7817/jameroriesoci.136.1.29"),
    "Su_I_-_The_Martyrs_on_the_Mountain.pdf": dict(title="The Martyrs on the Mountain: The Early Traditionist Compromise over the First Fitna", authors=["I-Wen Su"], year=2023, type="article", venue="Journal of the American Oriental Society 143.4", doi="10.7817/jaos.143.4.2023.ar030"),
    "Su_I_-_The_Companions_in_Heaven_-.pdf": dict(title="The Companions in Heaven: A Study of the Origin and Formation of a Sunnī Doctrine through Isnād-cum-Matn Analysis", authors=["I-Wen Su"]),
    "Sadeghi_B_-_The_Traveling_Tradition_Test.pdf": dict(title="The Traveling Tradition Test: A Method for Dating Traditions", authors=["Behnam Sadeghi"], year=2010, type="article", venue="Der Islam 85", doi="10.1515/ISLAM.2010.004"),
    "Görke_A_-_Authorship.pdf": dict(title="Authorship in the Sīra Literature", authors=["Andreas Görke"], year=2015, type="chapter", venue="Concepts of Authorship in Pre-Modern Arabic Texts (Bamberger Orientstudien 7)", doi=None, editorial=["title"]),
    "Melchert_C_-_The_Life_and_Works_of.pdf": dict(title="The Life and Works of Abū Dāwūd al-Sijistānī", authors=["Christopher Melchert"], year=2008, type="article", venue="Al-Qanṭara 29.1"),
    "Schacht_J_-_The_Origins_of_Muhammadan_Jurisprudence.pdf": None,
    "Melchert_C_-_Sectaries_in_the_Six_Books.pdf": dict(title="Sectaries in the Six Books: Evidence for Their Exclusion from the Sunni Community"),
    "Melchert_C_-_Traditionist_Jurisprudents_and_the_Framing.pdf": dict(title="Traditionist-Jurisprudents and the Framing of Islamic Law"),
}
# Files where the Crossref candidate was wrong and no override could confirm it: drop DOI, keep the PDF title.
NO_CR = {"Goldziher_I_-_Mohammed_and_Islam.pdf", "Melchert_C_-_How_to_Cite_Hadith.pdf", "Motzki_H_-_Alternative_Accounts.pdf"}

FULLNAMES = {  # surname -> display name, all printed in the works' own front matter or Crossref
    "abu alabbas": "Belal Abu-Alabbas", "dann": "Michael Dann", "melchert": "Christopher Melchert", "aerts": "Stijn Aerts",
    "bednarkiewicz": "Maroussia Bednarkiewicz", "brown": "Jonathan A. C. Brown", "burton": "John Burton", "calder": "Norman Calder",
    "cook": "Michael Cook", "dickinson": "Eerik Dickinson", "el shamsy": "Ahmed El Shamsy", "gledhill": "P. J. Gledhill",
    "goldziher": "Ignaz Goldziher", "gorke": "Andreas Görke", "hallaq": "Wael B. Hallaq", "hilali": "Asma Hilali",
    "juynboll": "G. H. A. Juynboll", "lecker": "Michael Lecker", "little": "Joshua J. Little", "lucas": "Scott C. Lucas",
    "mitter": "Ulrike Mitter", "motzki": "Harald Motzki", "pavlovitch": "Pavel Pavlovitch", "powers": "David S. Powers",
    "rajani": "Kumail Rajani", "reinhart": "A. Kevin Reinhart", "sadeghi": "Behnam Sadeghi", "schacht": "Joseph Schacht",
    "schoeler": "Gregor Schoeler", "shah": "Mustafa Shah", "shoemaker": "Stephen J. Shoemaker", "su": "I-Wen Su",
    "wensinck": "A. J. Wensinck", "wymann landgraf": "Umar F. A. Abd-Allah Wymann-Landgraf", "al khatib": "Mutaz al-Khatib",
    "boekhoff van der voort": "Nicolet Boekhoff-van der Voort", "fishman": "Talya Fishman", "duderija": "Adis Duderija",
    "koya": "P. K. Koya", "anthony": "Sean W. Anthony", "versteegh": "Kees Versteegh", "wagemakers": "Joas Wagemakers",
}

def surname_key(name):
    return fold(name).split()[-1] if fold(name).split() else ""

def scholar_id(name):
    return re.sub(r"[^a-z0-9]+", "-", fold(name).strip()).strip("-")

def slug(work):
    first = scholar_id(work["authors"][0]["name"]).split("-")[-1] if work["authors"] else "anon"
    t = " ".join(w for w in fold(work["title"]).split() if w not in ("the", "of", "and", "in", "a", "an", "to", "on", "for"))[:40]
    return f"{first}-{work['year'] or 'nd'}-{re.sub(r' ', '-', t.strip())}"

SMALL = {"of", "and", "the", "in", "a", "an", "to", "on", "for", "from", "with", "by", "as", "at", "or", "vs.", "al-", "b."}

def smart_title(t):
    letters = [c for c in t if c.isalpha()]
    if not letters or sum(c.isupper() for c in letters) / len(letters) < 0.6:
        return re.sub(r"\s+", " ", t).strip()
    words = re.sub(r"\s+", " ", t).strip().lower().split(" ")
    out = []
    for i, w in enumerate(words):
        out.append(w if (w in SMALL and i) else re.sub(r"^([^\w]*)(\w)", lambda m: m.group(1) + m.group(2).upper(), w))
    return " ".join(out)

# ---------------------------------------------------------------- assemble works
works, lib_map = [], {}
for f in files:
    seed, en = seeds[f], enriched.get(f)
    acc = (en or {}).get("accepted") if f not in NO_CR else None
    ov = O.get(f)
    doi = None
    rec = {}
    if acc:
        doi = acc.get("doi")
        full = cr_full.get(doi, {})
        rec = dict(title=re.sub(r"<[^>]+>", "", full.get("title") or acc["title"]), year=full.get("year") or acc.get("year"), type=(full.get("type") or acc.get("type") or "").replace("-", " "),
                   venue=re.sub(r"<[^>]+>", "", full.get("venue") or acc.get("venue") or ""), publisher=full.get("publisher"),
                   authors=[(a["given"] + " " + a["family"]).strip() for a in full.get("authors", [])] or [seed["author"]],
                   license=full.get("license", []), doi=doi, crossref_verified=True)
        rec["title"] = rec["title"].replace("&lt;i&gt;", "").replace("&lt;/i&gt;", "")
    else:
        rec = dict(title=seed["title"], year=None, type="", venue="", authors=[seed["author"]], doi=None, crossref_verified=False)
    editorial = []
    if ov:
        editorial = ov.pop("editorial", []) if "editorial" in ov else []
        rec.update({k: v for k, v in ov.items() if k != "editors"})
        rec["doi"] = ov.get("doi", rec.get("doi"))
        rec["crossref_verified"] = bool(rec.get("doi") and rec["doi"] in cr_full and rec["doi"] == (acc or {}).get("doi")) or bool(ov.get("doi") and ov["doi"] in cr_full)
        if ov.get("editors"):
            rec["role"] = "editor"
    # normalise authors to display names
    names = []
    for a in rec.get("authors", []):
        key = fold(a).strip()
        sk = None
        for k in sorted(FULLNAMES, key=len, reverse=True):
            if key.endswith(k) or key.startswith(k):
                sk = k
                break
        names.append(FULLNAMES.get(sk, re.sub(r"\b([a-z])\.?$", lambda m: m.group(1).upper() + ".", a.strip())))
    rec["authors"] = [{"name": n, "id": scholar_id(n)} for n in dict.fromkeys(names)]
    rec["title"] = smart_title(rec["title"])
    if "edited" in (rec.get("type") or ""):
        rec["role"] = "editor"
    cr_title = re.sub(r"<[^>]+>", "", (cr_full.get(rec.get("doi") or "", {}) or {}).get("title", ""))
    ft, fc = fold(rec["title"]).strip(), fold(cr_title).strip()
    if cr_title and ft not in fc and fc not in ft and difflib.SequenceMatcher(None, fc, ft).ratio() < 0.75:
        rec["publishedTitle"] = cr_title
    rec["editorial"] = editorial
    rec["file"] = f
    rec["pages"] = seed["pages"]
    works.append(rec)

def display_authors(names):
    return [{"name": n, "id": scholar_id(n)} for n in dict.fromkeys(names)]

def crossref_fields(key):
    cr = cr_extra.get(key)
    if not cr:
        return {}
    return dict(doi=cr["doi"], crossref_verified=True, license=cr.get("license") or [])

# Copies OCR'd after the first build. Each is read from the ocrd folder.
for x in extras:
    rec = dict(title=smart_title(x["title"]), year=x.get("year"), type=x["type"], venue=x.get("venue", ""), publisher=x.get("publisher"),
               authors=display_authors(x["authors"]), doi=None, crossref_verified=False, editorial=x.get("editorial", []),
               file=x["key"], src_dir=x.get("dir", "ocrd"), pages=0, reviews_file=x.get("reviews"), alias=x.get("alias"), part_of_file=x.get("partOf"), revised=x.get("revised", False))
    rec["source_spec"] = x
    rec["license"] = x.get("license", [])
    rec.update(crossref_fields(x["key"]))
    if x.get("doi"):
        # A DOI set by hand wins over the automatic match: it is the original publication (the
        # match can land on a reprint chapter) and was seen in a Crossref record or printed on the work.
        rec.update(doi=x["doi"], crossref_verified=x.get("crossrefVerified", True))
    if x.get("role") == "editor":
        rec["role"] = "editor"
    works.append(rec)

# Studies printed inside a larger work become works of their own, tied to the volume by part_of.
chapter_specs = []  # (volume file, spec, work or None)
for vol, v in volumes.items():
    for ch in v["chapters"]:
        if ch.get("skip"):
            continue  # boundary only: marks where the previous listed study's pages end
        if ch.get("existing"):
            chapter_specs.append((vol, ch, None))
            continue
        rec = dict(title=ch["title"], year=ch.get("year"), type="chapter", venue=ch.get("venue", ""), publisher=None,
                   authors=display_authors(ch["authors"]), doi=None, crossref_verified=False, editorial=ch.get("editorial", []),
                   file=f"{vol}#{ch['printed']}", chapter_of=vol, printed=ch["printed"], pages=0, contents_page=True, revised=ch.get("revised", False))
        rec.update(crossref_fields(rec["file"]))
        works.append(rec)
        chapter_specs.append((vol, ch, rec))

# Works the atlas dates by an English edition that cite or are cited as an earlier original.
ORIGINAL = {
    "Motzki_H_-_The_Origins_of_Islamic_Jurisprudence.pdf": (1991, "Die Anfänge der islamischen Jurisprudenz (Stuttgart: Steiner, 1991)"),
}
for w in works:
    if w["file"] in ORIGINAL:
        w["original_year"], w["original_note"] = ORIGINAL[w["file"]]

for w in works:
    w["id"] = slug(w)
# disambiguate ids
seen = {}
for w in works:
    n = seen.get(w["id"], 0)
    seen[w["id"]] = n + 1
    if n:
        w["id"] += f"-{n + 1}"

# ---------------------------------------------------------------- full text
cache = "texts.pkl"
texts = pickle.load(open(cache, "rb")) if os.path.exists(cache) else {}

def read_pdf(path, spec):
    """Recover a known shifted Latin encoding without changing the source PDF."""
    with fitz.open(path) as doc:
        if spec.get("encoding") != "gentium-shift-29":
            return [page.get_text("text") for page in doc]
        pages = []
        for page in doc:
            lines = []
            for block in page.get_text("dict")["blocks"]:
                for line in block.get("lines", []):
                    spans = []
                    for span in line["spans"]:
                        text = span["text"]
                        # The PDF mixes correctly encoded italic titles/names with
                        # shifted text. Correct spans contain ordinary lowercase.
                        if not re.search(r"[a-z]", text):
                            text = "".join(chr(ord(c) + 29) if 3 <= ord(c) <= 95 and c != " " else c for c in text)
                            text = text.translate(str.maketrans({"є": "ḥ", "҇": "Ḥ", "Ҹ": "ī", "č": "ā", "ࡃ": "ū", "Ϯ": "fi", "ϸ": "ff"}))
                        spans.append(text)
                    lines.append("".join(spans))
            pages.append("\n".join(lines))
        return pages
def md_pages(path):
    """Markdown transcripts carry their page breaks as headings or rules."""
    body = open(path, encoding="utf-8").read()
    parts = re.split(r"\n## Printed page \d+\n|\n---\n", body)
    return [p for p in parts if p.strip()] or [body]

for w in works:
    if w.get("chapter_of") or w["file"] in texts:
        continue
    path = source_path(SOURCE_DIRS.get(w.get("src_dir"), LIB), w["file"])
    if path.endswith(".md"):
        texts[w["file"]] = md_pages(path)
        continue
    texts[w["file"]] = read_pdf(path, w.get("source_spec", {}))
pickle.dump(texts, open(cache, "wb"))
# Entry excerpts may carry publisher matter and the end of a preceding entry.
# Blank those portions while preserving original PDF page numbers for evidence.
for w in works:
    spec = w.get("source_spec", {})
    if spec.get("textRange"):
        first, last = spec["textRange"]
        pages = list(texts[w["file"]])
        for i in range(len(pages)):
            if not first <= i + 1 <= last:
                pages[i] = ""
        marker = spec.get("startMarker")
        if marker:
            start = pages[first - 1].find(marker)
            if start < 0:
                raise ValueError(f"Entry opening not found: {w['file']}")
            pages[first - 1] = pages[first - 1][start:]
        texts[w["file"]] = pages
folded = {f: [squash(fold(t)) for t in pages] for f, pages in texts.items()}
for w in works:
    if not w.get("chapter_of"):
        w["pages"] = len(texts[w["file"]])

# Where each study begins in its volume. The printed start page and the title (with the
# author's surname close by) are matched to find the offset between printed and PDF pages.
def to_pdf(vol, printed, offset):
    """Some scans put two printed pages (a spread) on each PDF page: PDF page = printed // 2 + spread."""
    spread = volumes[vol].get("spread")
    return printed // 2 + spread if spread is not None else printed + offset

def locate_chapters(vol):
    pages = folded[vol]
    spec = volumes[vol]["chapters"]
    rows = []
    for ch in spec:
        rec = next((r for r in works if r.get("file") == f"{vol}#{ch['printed']}"), None)
        title = ch["title"] if not ch.get("existing") else next(w for w in works if w["file"] == ch["existing"])["title"]
        authors = ch["authors"] if not ch.get("existing") else [a["name"] for a in next(w for w in works if w["file"] == ch["existing"])["authors"]]
        head_words = squash(fold(re.split(r"[:–—]", title)[0])).split()[:6]
        head = " ".join(head_words)
        sn = surname_key(authors[0])
        hits = [i for i in range(8, len(pages)) if head in pages[i][:900] and sn in pages[i][:1800]]
        rows.append((ch, head, hits))
    # Running heads repeat a study's title on every page, so only the first page that shows
    # the title counts toward the printed-to-PDF offset.
    votes = {}
    for ch, _, hits in rows:
        if hits:
            first = hits[0] + 1
            votes[first - ch["printed"]] = votes.get(first - ch["printed"], 0) + 1
    offset = volumes[vol].get("offset")
    if offset is None and "spread" not in volumes[vol]:
        offset = max(votes, key=votes.get)
    starts = []
    for ch, head, hits in rows:
        expected = to_pdf(vol, ch["printed"], offset)
        window = ch.get("search", 2)
        near = [i + 1 for i in hits if -window <= (i + 1) - expected <= 0 or 0 <= (i + 1) - expected <= 2]
        starts.append((min(near) if near and window > 2 else expected, bool(near)))
    return offset, starts

volume_of = {}  # chapter work id -> volume work id, and existing studies likewise
part_pages = {}  # (child id, volume id) -> printed page the study begins on
for vol in volumes:
    offset, starts = locate_chapters(vol)
    tail_pdf = to_pdf(vol, volumes[vol]["tail"], offset)
    chs = volumes[vol]["chapters"]
    unverified = []
    spread = "spread" in volumes[vol]
    for k, (ch, (start, ok)) in enumerate(zip(chs, starts)):
        if k + 1 < len(chs):
            # on a spread scan the next study's first page shares a PDF page with this one's last
            shares = spread and chs[k + 1]["printed"] % 2 == 1
            end = starts[k + 1][0] if shares else starts[k + 1][0] - 1
        else:
            end = tail_pdf - 1
        rec = next((r for r in works if r.get("file") == f"{vol}#{ch['printed']}"), None)
        if rec is not None:
            rec["slice"] = (vol, start, end)
            folded[rec["file"]] = folded[vol][start - 1: end]
            texts[rec["file"]] = texts[vol][start - 1: end]
            rec["pages"] = end - start + 1
        if not ok:
            unverified.append((ch.get("title") or ch["existing"])[:50])
    print(f"{vol}: printed-to-PDF offset {offset if offset is not None else 'spread'}; start page not confirmed by title for: {unverified or 'none'}")
    for ch in chs:
        if ch.get("existing"):
            next(w for w in works if w["file"] == ch["existing"])["part_of_file"] = vol

# ---------------------------------------------------------------- citation edges
ALIASES = {
    "Juynboll_G_H_-_Muslim_Traditions.pdf": ["muslim tradition", "muslim traditions"],
    "Juynboll_G_H_A_-_Encyclopedia_of_Canonical.pdf": ["encyclopedia of canonical hadith"],
    "Brown_J_-_Hadith_Muhammad_s_Legacy_in.pdf": ["muhammad s legacy in the medieval"],
    "Brown_J_A_C_-_The_Canonization_of.pdf": ["canonization of al bukhari and muslim", "canonization of al bukhari"],
    "Harald_Motzki_Analysing_Muslim_Traditions.pdf": ["analysing muslim traditions"],
    "Motzki_H_-_The_Origins_of_Islamic_Jurisprudence.pdf": ["origins of islamic jurisprudence", "die anfange der islamischen jurisprudenz"],
    "Melchert_C_-_The_Formation_of_the_Sunni.pdf": ["formation of the sunni schools of law"],
    "Melchert_C_-_Bukhari_and_Early_Hadith_Criticism.pdf": ["bukhari and early hadith criticism"],
    "Motzki_H_-_Dating_Muslim_Traditions.pdf": ["dating muslim traditions"],
    "Sadeghi_B_-_The_Traveling_Tradition_Test.pdf": ["traveling tradition test"],
    "Schoeler_G_-_Constitution.pdf": ["constitution of the koran as a codified work"],
    "Wymann-Landgraf_U_F_A_-A_-_Malik_and.pdf": ["malik and medina"],
    "Dickinson_E_-_The_Development_of_Early.pdf": ["development of early sunnite hadith criticism"],
    "Hallaq_W_-_The_Authenticity.pdf": ["authenticity of prophetic hadith"],
    "Cook_M_-_The_Opponents_of_the_Writing.pdf": ["opponents of the writing of tradition"],
    "Motzki_H_-_The_Role_of_Non-arab_Converts.pdf": ["role of non arab converts"],
}
STOP = set("the of and in a an to on for from with by as at is or its de al b ibn".split())

def keys_for(w):
    if w["file"] in ALIASES:
        return ALIASES[w["file"]]
    if w.get("alias"):
        return w["alias"]
    main = re.split(r"[:\u2013\u2014]| - ", w["title"])[0]
    ks = [squash(fold(main))]
    return [k for k in ks if len([x for x in k.split() if x not in STOP]) >= 3]

def surname_of(w):
    return surname_key(w["authors"][0]["name"]) if w["authors"] else ""

def find_edges():
    edges = []
    for a in works:
        pages = folded[a["file"]]
        if a.get("chapter_of"):
            skip = 0  # a study printed inside a volume starts at its own first page
        else:
            skip = 12 if len(pages) > 150 else (6 if len(pages) > 60 else 0)
        if a.get("source_spec", {}).get("citationStart"):
            skip = a["source_spec"]["citationStart"] - 1
        base = a["slice"][1] - 1 if a.get("slice") else 0  # report PDF pages of the containing volume
        joined = " ".join(pages[skip:])
        for b in works:
            if a is b:
                continue
            if b["id"] in a.get("source_spec", {}).get("excludeCitationIds", []):
                continue  # reviewed ambiguous title/author match, not a citation
            # A volume prints its studies' titles in running heads, so a volume and its own
            # studies never count as citing each other.
            if a.get("chapter_of") == b["file"] or b.get("chapter_of") == a["file"] or a.get("part_of_file") == b["file"] or b.get("part_of_file") == a["file"]:
                continue
            ks = keys_for(b)
            if not ks:
                continue
            sn = surname_of(b)
            if sn and sn not in joined:
                continue
            hits = []
            for pi in range(skip, len(pages)):
                pg = pages[pi]
                for k in ks:
                    start = 0
                    while True:
                        i = pg.find(k, start)
                        if i < 0:
                            break
                        window = pg[max(0, i - 500): i + len(k) + 500]
                        if sn and sn in window:
                            hits.append(base + pi + 1)
                        start = i + len(k)
            if hits:
                edges.append({"from": a["id"], "to": b["id"], "type": "cites", "count": len(hits), "pages": sorted(set(hits))[:8]})
    return edges

edges = find_edges()

# part_of: chapters -> containing volume when the volume is in the collection
by_title = {fold(w["title"]).strip(): w for w in works}
for w in works:
    v = fold(w.get("venue", "")).strip()
    if not v:
        continue
    for t, vol in by_title.items():
        if vol is not w and len(v) > 12 and (v in t or t.startswith(v)) and vol["type"] in ("edited volume", "book", "edited book"):
            edges.append({"from": w["id"], "to": vol["id"], "type": "part_of"})
            break
# explicit part_of from the Crossref container titles, checked against the collection
fid = {w["file"]: w["id"] for w in works}
edges = [e for e in edges if e["type"] != "part_of"]
seen_part = set()
for vol, v in volumes.items():
    for ch in v["chapters"]:
        child = ch.get("existing") or f"{vol}#{ch['printed']}"
        if child in fid and vol in fid and (child, vol) not in seen_part:
            seen_part.add((child, vol))
            edges.append({"from": fid[child], "to": fid[vol], "type": "part_of", "page": ch["printed"]})

for w in works:
    if w.get("reviews_file") and w["reviews_file"] in fid:
        edges.append({"from": w["id"], "to": fid[w["reviews_file"]], "type": "reviews"})

# verified reply and review relations (each checked against the work's own front matter)
REPLIES = [
    ("Gledhill_P_-_Motzkis_Forger_The_Corpus_of.pdf", "Motzki_H_-_The_Origins_of_Islamic_Jurisprudence.pdf", "replies_to"),
    ("Reinhart_A_-_Juybolliana.pdf", "Juynboll_G_H_A_-_Encyclopedia_of_Canonical.pdf", "reviews"),
    ("Reinhart_A_-_Juybolliana.pdf", "Brown_J_-_Hadith_Muhammad_s_Legacy_in.pdf", "reviews"),
    ("Reinhart_A_-_Juybolliana.pdf", "Brown_J_A_C_-_The_Canonization_of.pdf", "reviews"),
]
for a, b, t in REPLIES:
    if a in fid and b in fid:
        edges.append({"from": fid[a], "to": fid[b], "type": t})

# ---------------------------------------------------------------- methods and themes
METHODS = {
    "ICMA (isnād-cum-matn analysis)": r"isnad cum matn",
    "Common-link analysis": r"common link",
    "Traveling tradition test": r"traveling tradition test",
    "Matn criticism": r"matn criticism|criticism of the matn|matn analysis",
    "Jarḥ wa-taʿdīl / rijāl criticism": r"\bjarh\b|\brijal\b",
    "Oral and written transmission": r"oral transmission|written transmission|writing of tradition",
}
MIN = {"ICMA (isnād-cum-matn analysis)": 3}
THEMES = {
    "Dating and common links": r"dating|common link|isnad cum matn|traveling tradition|dated",
    "Isnād and transmission": r"\bisnad|transmission|transmitter",
    "Rijāl and jarḥ wa-taʿdīl": r"rijal|jarh|tadil|biograph|ibn abi hatim|critic",
    "Canonization and collections": r"canoniz|canon\b|bukhari|musnad|musannaf|ibn maja|abu dawud|six books|collection",
    "Authenticity debate": r"authentic|forg|revaluation|skeptic|reliab|fabricat",
    "Legal ḥadīth and sunna": r"legal|law\b|jurisprud|sunna|hanafi|maliki|shafi",
    "Sīra and maghāzī sources": r"\bsira\b|maghazi|urwa|life of the prophet|zuhri|biography of",
    "Shiʿi ḥadīth": r"\bshii\b|\bshia\b|twelver",
}
for w in works:
    full_text = " ".join(folded[w["file"]])
    words_total = max(1, len(full_text.split()))
    w["methods"] = [m for m, rx in METHODS.items() if len(re.findall(rx, full_text)) >= MIN.get(m, 5)]
    head = fold(w["title"] + " " + " ".join(folded[w["file"]][:2]))[:2500]
    w["themes"] = [t for t, rx in THEMES.items() if re.search(rx, fold(w["title"])) or len(re.findall(rx, head)) >= 3]
    if not w["themes"] and (w.get("chapter_of") or w.get("src_dir")):
        # Works added later (OCR'd copies and studies inside volumes) often open with front
        # matter or a long introduction, so fall back to counting across the whole text.
        counts = sorted(((len(re.findall(rx, full_text)), t) for t, rx in THEMES.items()), reverse=True)
        w["themes"] = [t for n, t in counts[:2] if n >= 12]
    if not w["themes"]:
        w["themes"] = ["General studies of ḥadīth"]
    w["words"] = words_total

# ---------------------------------------------------------------- site links (hand-verified)
SITE = {
    "Su_I_-_The_Companions_in_Heaven_-.pdf": [{"href": "/blogs/", "label": "HadithCritic study: the ten promised Paradise ḥadīth", "slug": "55-the-myth-of-the-ten-promised-paradise-hadith"}],
    "Lecker_M_-_Biographical_Notes_on_Ibn_Shihab.pdf": [{"href": "/blogs/", "label": "HadithCritic study: Whitewashing al-Zuhrī", "slug": "64-whitewashing-al-zuhri-and-why-it-fails"}],
    "Boekhoff_van_der_Voort_Biography_of_Prophet_Muhammad_al_Zuhri.pdf": [{"href": "/blogs/", "label": "HadithCritic study: Whitewashing al-Zuhrī", "slug": "64-whitewashing-al-zuhri-and-why-it-fails"}],
}
for w in works:
    w["site"] = SITE.get(w["file"], [])

# ---------------------------------------------------------------- scholars
scholars = {}
for w in works:
    for a in w["authors"]:
        s = scholars.setdefault(a["id"], {"id": a["id"], "name": a["name"], "works": [], "years": []})
        s["works"].append(w["id"])
        if w["year"]:
            s["years"].append(w["year"])
for s in scholars.values():
    s["firstYear"], s["lastYear"] = (min(s["years"]), max(s["years"])) if s["years"] else (None, None)
    del s["years"]

# ---------------------------------------------------------------- output
def public(w):
    oa = any("creativecommons" in (l or "") for l in w.get("license", []))
    d = {k: w.get(k) for k in ("id", "title", "publishedTitle", "year", "type", "venue", "publisher", "doi", "themes", "methods", "site")}
    if w.get("original_year"):
        d["originalYear"], d["originalNote"] = w["original_year"], w["original_note"]
    d["authors"] = [a["id"] for a in w["authors"]]
    d["role"] = w.get("role", "author")
    d["openAccess"] = oa
    if w.get("revised"):
        d["revisedCopy"] = True
    source = "contents-page" if w.get("contents_page") else "title-page"  # studies inside a volume are taken from its contents page
    d["provenance"] = f"crossref+{source}" if w.get("crossref_verified") else source
    if w.get("editorial"):
        d["unconfirmed"] = w["editorial"]
    return {k: v for k, v in d.items() if v not in (None, [], "")}

out = {
    "generated": "2026-09-30" if additions else "2026-09-29",
    "note": "Bibliographic data verified against Crossref and each work's own title page. Edges are extracted from the works' own text. No evaluative labels.",
    "works": [public(w) for w in sorted(works, key=lambda w: (w["year"] or 0, w["title"]))],
    "scholars": sorted(scholars.values(), key=lambda s: (-len(s["works"]), s["name"])),
    "edges": [{k: v for k, v in e.items() if k != "pages"} for e in edges],
}
json.dump(out, open("research-graph.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump([e for e in edges if e["type"] == "cites"], open("evidence.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump({w["id"]: w["file"] for w in works}, open("library-map.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(works), "works;", len(scholars), "scholars;", len(edges), "edges", {t: sum(1 for e in edges if e['type'] == t) for t in {e['type'] for e in edges}})
