"""Scan a PDF library: metadata, text-layer check, front matter, hadith-criticism term density.

Writes one JSON object per line. Read-only on the library.
"""
import json
import os
import re
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed

import fitz  # PyMuPDF

SRC = sys.argv[1]
OUT = sys.argv[2]
SAMPLE_PAGES = 45  # pages sampled per file for term density
FRONT_PAGES = 4

TERMS = {
    "hadith": r"\b(?:ḥadīth|hadith|hadīth|ahadith|aḥādīth)s?\b",
    "isnad": r"\b(?:isnād|isnad|asānīd|asanid|isnāds|isnads)\b",
    "matn": r"\b(?:matn|mutūn|matns)\b",
    "common_link": r"common[\s-]link|partial common link|PCL\b",
    "icma": r"isnād[\s-]cum[\s-]matn|isnad[\s-]cum[\s-]matn|ICMA",
    "rijal": r"\b(?:rijāl|rijal|jarḥ|jarh|ta[ʿ']dīl|tadil|ʿilm al-rijāl)\b",
    "sunna": r"\b(?:sunna|sunnah)\b",
    "traditionist": r"\b(?:muḥaddith|muhaddith|traditionist|transmitter|tradent)s?\b",
    "dating": r"\bdating\b|\bdated to\b|\bterminus\b",
    "authenticity": r"\bauthentic(?:ity)?\b|\bforgery\b|\bfabricat\w+|\bpseudepigra\w+",
    "schacht_juynboll": r"\b(?:Schacht|Juynboll|Motzki|Goldziher|Azami|A'ẓami|Azmi)\b",
}
TERM_RE = {k: re.compile(v, re.I) for k, v in TERMS.items()}


def scan(path):
    rec = {"file": os.path.basename(path), "bytes": os.path.getsize(path)}
    try:
        doc = fitz.open(path)
        rec["pages"] = doc.page_count
        meta = doc.metadata or {}
        rec["meta_title"] = (meta.get("title") or "").strip()[:200]
        rec["meta_author"] = (meta.get("author") or "").strip()[:200]
        rec["meta_year"] = (meta.get("creationDate") or "")[2:6]
        n = doc.page_count
        idx = list(range(min(n, FRONT_PAGES)))
        step = max(1, (n - FRONT_PAGES) // SAMPLE_PAGES)
        idx += list(range(FRONT_PAGES, n, step))[:SAMPLE_PAGES]
        front, body = [], []
        for i in idx:
            t = doc.load_page(i).get_text("text") or ""
            (front if i < FRONT_PAGES else body).append(t)
        front_txt = "\n".join(front)
        body_txt = "\n".join(body)
        all_txt = front_txt + "\n" + body_txt
        rec["chars_sampled"] = len(all_txt)
        rec["has_text"] = len(all_txt.strip()) > 400
        rec["front"] = re.sub(r"\s+", " ", front_txt)[:1600]
        words = max(1, len(all_txt.split()))
        rec["words_sampled"] = words
        counts = {k: len(r.findall(all_txt)) for k, r in TERM_RE.items()}
        rec["counts"] = counts
        # density per 1000 words for the core hadith-criticism vocabulary
        core = counts["hadith"] + counts["isnad"] + counts["matn"] + counts["common_link"] + counts["icma"] + counts["rijal"]
        rec["core_density"] = round(core * 1000 / words, 2)
        m = re.search(r"\b(1[5-9]\d\d|20[0-2]\d)\b", front_txt)
        rec["year_guess"] = m.group(1) if m else ""
        doi = re.search(r"10\.\d{4,9}/[^\s\"<>]+", front_txt)
        rec["doi"] = doi.group(0).rstrip(".,;)") if doi else ""
        doc.close()
    except Exception as exc:  # noqa: BLE001 - report and continue
        rec["error"] = str(exc)[:200]
    return rec


def main():
    files = sorted(
        os.path.join(SRC, f) for f in os.listdir(SRC) if f.lower().endswith(".pdf")
    )
    done = 0
    with open(OUT, "w", encoding="utf-8") as out, ProcessPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(scan, p) for p in files]
        for fut in as_completed(futures):
            out.write(json.dumps(fut.result(), ensure_ascii=False) + "\n")
            done += 1
            if done % 50 == 0:
                out.flush()
                print(f"{done}/{len(files)}", flush=True)
    print("done", done, flush=True)


if __name__ == "__main__":
    main()
