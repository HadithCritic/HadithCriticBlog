#!/usr/bin/env python3
"""Run a reproducible metadata-only discovery scan for coverage-gap sources.

Substring hits are discovery leads, not tradition assignments. This script
does not inspect or export book text and does not score any position.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


SEARCH_FIELDS = ("book_title", "author", "category")
QUERY_TERMS = {
    "Ibadi": ["الإباضية", "الإباضي", "إباضي", "الأباضية", "الاباضية", "الوهبية", "الوهبي", "أطفيش", "أطفّيش", "القطب أطفيش", "الثميني", "الجيطالي", "السالمي الإباضي", "ابن غنيم الإباضي", "الورجلاني"],
    "Zaydi": ["الزيدية", "الزيدي", "زيدي", "الجارودية", "الجارودي", "القاسم الرسي", "الهادي إلى الحق", "الإمام زيد", "زيد بن علي", "البحر الزخار", "البحر الزخّار", "شرح الأزهار", "الأزهار في فقه", "المرتضى الزيدي", "الروض النضير", "السيل الجرار", "الشوكاني"],
    "Imami_Twelver": ["الإمامية", "إمامية", "الإمامي", "الجعفرية", "جعفري", "الاثنا عشرية", "الاثني عشرية", "الإثنا عشرية", "الإثني عشرية", "الشيعة الإمامية", "فقه الإمامية", "الطوسي", "الشيخ المفيد", "المفيد", "السيد المرتضى", "المحقق الحلي", "الحلي الإمامي", "الصدر الإمامي"],
    "Ismaili": ["الإسماعيلية", "الإسماعيلي", "إسماعيلي", "القرامطة", "القرامطي", "الفاطميون", "الفاطمي", "دعائم الإسلام", "القاضي النعمان", "النعمان الإسماعيلي", "النزاري", "المستعلية"],
    "Quran_alone": ["القرآنيون", "قرآني", "القرآني", "القرآنية", "أهل القرآن", "القرآن وحده", "القرآن فقط", "منكري السنة", "إنكار السنة", "إنكار الحديث", "القرآنيين", "القرانيون", "القراني"],
}


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", required=True, type=Path)
    parser.add_argument("--json-out", required=True, type=Path)
    parser.add_argument("--markdown-out", required=True, type=Path)
    args = parser.parse_args()
    index = args.index.resolve()
    with index.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        rows = list(reader)
        columns = reader.fieldnames or []
    if not {"book_id", *SEARCH_FIELDS}.issubset(columns):
        raise SystemExit("Index needs book_id, book_title, author, and category columns")
    by_id = {str(row["book_id"]).strip(): row for row in rows}
    if len(by_id) != len(rows):
        raise SystemExit("Index has blank or duplicate book IDs")

    groups = {}
    for group, terms in QUERY_TERMS.items():
        hits: dict[str, dict] = {}
        term_counts = Counter()
        for term in terms:
            for book_id, row in by_id.items():
                matched_fields = [field for field in SEARCH_FIELDS if term in (row.get(field) or "")]
                if not matched_fields:
                    continue
                term_counts[term] += 1
                item = hits.setdefault(book_id, {**row, "matched_terms": [], "matched_fields": []})
                if term not in item["matched_terms"]:
                    item["matched_terms"].append(term)
                for field in matched_fields:
                    if field not in item["matched_fields"]:
                        item["matched_fields"].append(field)
        records = sorted(hits.values(), key=lambda row: int(row["book_id"]))
        groups[group] = {
            "query_terms": terms,
            "distinct_book_id_count": len(records),
            "per_term_matching_record_counts_not_additive": dict(sorted(term_counts.items())),
            "metadata_matches": records,
        }

    payload = {
        "schema_version": "1.0.0",
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "method": "Literal substring matching against Arabic/Latin catalog book_title, author, and category values; no normalization, semantic classification, or full-text search.",
        "index": {"path": str(index), "sha256": file_hash(index), "row_count": len(rows), "columns": columns},
        "groups": groups,
        "interpretation": {
            "Ibadi": "Three matches: two genealogy/history records by authors catalogued with Ibadi association and one explicit hostile refutation; no direct fiqh manual surfaced in this bounded query set.",
            "Zaydi": "Thirty-eight broad matches, dominated by lexical false positives and 25 al-Shawkani author records. Al-Shawkani works are retained as individually attributable Yemeni jurist texts, not treated as automatically representative Zaydi sources. The matching al-Bahr al-zakhkhar title is al-Bazzar's hadith musnad, not the Zaydi legal work sought.",
            "Imami_Twelver": "Sixty-five broad matches. All three records matching explicit al-Imamiyya title wording are polemical; other hits include homonymous 'two imams', the nisba al-Tusi (including al-Ghazali), and bibliographic 'Jaafari' publisher references. No direct Imami fiqh work was established in the local index.",
            "Ismaili": "Six broad matches: al-Ismaili nisba records, Qarmatian/Fatimid history, and a hostile esotericist refutation; no direct Ismaili fiqh work was established.",
            "Quran_alone": "Forty-nine broad matches. The explicit al-Quraniyyun title is a refutation; most 'Qurani' hits refer to Quranic topics, and other explicit hits are refutations of Sunnah rejection. No self-representative contemporary legal source was established.",
        },
        "limitations": [
            "Counts are unique catalog IDs per query family; per-term counts overlap and must not be summed.",
            "Terms are intentionally discoverability probes, not exhaustive Arabic morphology or transliteration search.",
            "Catalog author identities and group labels are unverified metadata. A matching name does not establish a work's doctrinal scope or a direct-source role.",
            "No hit is not proof of absence beyond this index and these terms; manuscript libraries, other repositories, and titles under alternate names remain outside the scan.",
            "The scan reads no passage content and establishes no legal position, text completeness, edition accuracy, or reuse rights.",
        ],
    }
    for out in (args.json_out, args.markdown_out):
        out.resolve().parent.mkdir(parents=True, exist_ok=True)
    args.json_out.resolve().write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Underrepresented-tradition discovery scan of the current Shamela index",
        "",
        f"Generated UTC: {payload['generated_utc']}",
        "",
        f"Index: {len(rows):,} book IDs; SHA-256 `{payload['index']['sha256']}`.",
        "",
        "Search used literal substrings across title, author, and category metadata. It did not normalize Arabic, inspect text passages, or establish group identity. Distinct book-ID counts within each query family are not additive; the machine-readable report preserves exact terms and matched records.",
        "",
        "| Search family | Unique catalog IDs | Assessment after title/author inspection |",
        "|---|---:|---|",
    ]
    labels = {"Ibadi": "Ibāḍī", "Zaydi": "Zaydī-related", "Imami_Twelver": "Imāmī / Twelver-related", "Ismaili": "Ismāʿīlī-related", "Quran_alone": "Qurʾān-alone / Qurʾānī"}
    for group, result in groups.items():
        lines.append(f"| {labels[group]} | {result['distinct_book_id_count']} | {payload['interpretation'][group]} |")
    lines.extend([
        "",
        "## Useful classification boundaries",
        "",
        "- *Al-Sayl al-jarrār* (Shamela 7342), *al-Durārī al-muḍiyya* (7264), *Irshād al-fuḥūl* (11437), and *al-Qawl al-mufīd fī adillat al-ijtihād wa-l-taqlīd* (6359) are indexed under al-Shawkani's name. They may support a bounded profile of his own positions after direct passage review; do not treat them as a proxy for Zaydi doctrine.",
        "- The local title hit for *al-Baḥr al-zakhkhār* (12981) is explicitly al-Bazzar's hadith musnad. It is not Ahmad b. Yahya al-Murtada's Zaydi legal work; the separate external acquisition lead remains necessary.",
        "- The earlier external leads for al-Nīl / Aṭṭafayyish's commentary, al-Ṭūsī's *al-Mabsūṭ fī fiqh al-Imāmiyya*, the Zaydi *al-Baḥr al-zakhkhār*, and Rashad Khalifa remain separate from Shamela index hits. Their edition and rights checks remain open.",
        "",
        "## Next coverage action",
        "",
        "Continue acquiring and checking direct sources for Ibāḍī, Zaydī, Imāmī/Twelver, and Ismāʿīlī law, and a second independently bounded Qurʾān-alone author. Review 8,538 index entries by metadata does not replace an exhaustive catalog census or specialist source review.",
        "",
        "Full per-term hits and metadata are in `catalog-coverage-scan.json`.",
        "",
    ])
    args.markdown_out.resolve().write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
