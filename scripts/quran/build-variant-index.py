#!/usr/bin/env python3
"""Build a compact, attributed, Corpus Coranicum-only browser index."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import subprocess
import sys
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
TEI = "http://www.tei-c.org/ns/1.0"
XML = "http://www.w3.org/XML/1998/namespace"
NS = {"tei": TEI, "xml": XML}
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
ATTRIBUTION = (
    "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg "
    "Academy of Sciences and Humanities. https://github.com/telota/corpus-coranicum-tei."
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def exact_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()
    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"],
                          text=True, capture_output=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned TEI commit {COMMIT}; found {head}")

    connection = sqlite3.connect(args.release_db)
    connection.row_factory = sqlite3.Row
    metadata = dict(connection.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != "CC BY-SA 4.0":
        raise ValueError("release database metadata does not match the reviewed CC TEI source")
    source_path = "data/quran_variants/allvariants.xml"
    source_file = args.tei / source_path
    artifact = connection.execute(
        "SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' "
        "AND relative_path=?", (source_path,)).fetchone()
    if artifact is None or sha256(source_file) != artifact[0]:
        raise ValueError("allvariants.xml hash does not match the release artifact manifest")

    tree = etree.parse(str(source_file), etree.XMLParser(resolve_entities=False, no_network=True))
    source_lines = {
        element.get(f"{{{XML}}}id"): element.sourceline
        for element in tree.xpath(".//tei:item[@xml:id]", namespaces=NS)
    }
    reader_reference_lines = {}
    reader_labels = {}
    for element in tree.xpath(".//tei:item[@xml:id]", namespaces=NS):
        label_element = element.find("./tei:persName", namespaces=NS)
        native_id = element.get(f"{{{XML}}}id")
        for ordinal, reference in enumerate(element.findall("./tei:persName", namespaces=NS), 1):
            reader_reference_lines[(native_id, ordinal)] = reference.sourceline
        if label_element is None:
            reader_labels[element.get(f"{{{XML}}}id")] = None
            continue
        reader_labels[element.get(f"{{{XML}}}id")] = exact_text(label_element)
    reader_path = "data/quran_variants/reader.xml"
    reader_file = args.tei / reader_path
    reader_artifact = connection.execute(
        "SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' "
        "AND relative_path=?", (reader_path,)).fetchone()
    if reader_artifact is None or sha256(reader_file) != reader_artifact[0]:
        raise ValueError("reader.xml hash does not match the release artifact manifest")
    reader_tree = etree.parse(str(reader_file), etree.XMLParser(resolve_entities=False, no_network=True))
    reader_authorities = {}
    for person in reader_tree.xpath(".//tei:person[@xml:id]", namespaces=NS):
        native_key = person.get(f"{{{XML}}}id")
        label = person.find("./tei:name[@type='display']", namespaces=NS)
        if label is None:
            label = person.find("./tei:name[@type='main']", namespaces=NS)
        line = person.sourceline
        reader_authorities[native_key] = {
            "nativeKey": native_key,
            "exactLabel": exact_text(label) if label is not None else None,
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{reader_path}#L{line}",
        }
    reader_references_by_variant = {}
    for reference in connection.execute(
        "SELECT va.native_id, vr.ordinal, vr.reader_native_key, vr.exact_source_label, "
        "sr.locator AS reference_locator, ra.native_key AS authority_key, "
        "ra.exact_label AS authority_label "
        "FROM variant_reader_reference vr "
        "JOIN variant_assertion va ON va.assertion_id=vr.assertion_id "
        "JOIN source_record sr ON sr.record_id=vr.source_record_id "
        "LEFT JOIN reading_authority ra ON ra.authority_id=vr.reader_authority_id "
        "ORDER BY va.native_id, vr.ordinal"):
        native_id = reference["native_id"]
        ordinal = reference["ordinal"]
        line = reader_reference_lines.get((native_id, ordinal))
        if line is None:
            raise ValueError(f"variant reader reference lacks source XML line: {native_id}#{ordinal}")
        key = reference["reader_native_key"]
        authority_key = reference["authority_key"]
        authority = reader_authorities.get(authority_key) if authority_key else None
        if authority and authority["exactLabel"] != reference["authority_label"]:
            raise ValueError(f"reader authority label differs from reader.xml: {native_id}#{ordinal}")
        reader_references_by_variant.setdefault(native_id, []).append({
            "ordinal": ordinal,
            "nativeKey": key,
            "exactLabel": reference["exact_source_label"],
            "sourceRecord": {
                "file": source_path,
                "parentXmlId": native_id,
                "locator": reference["reference_locator"],
                "line": line,
                "sha256": artifact[0],
                "url": f"{REPOSITORY}/blob/{COMMIT}/{source_path}#L{line}",
            },
            "readerAuthority": ({
                "nativeKey": authority["nativeKey"],
                "exactLabel": authority["exactLabel"],
                "sourceUrl": authority["sourceUrl"],
                "linkRule": "documented-prefix-alias",
            } if authority else None),
        })
    cairo_path = "data/cairo_quran/cairoquran.xml"
    cairo_file = args.tei / cairo_path
    cairo_artifact = connection.execute(
        "SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' "
        "AND relative_path=?", (cairo_path,)).fetchone()
    if cairo_artifact is None or sha256(cairo_file) != cairo_artifact[0]:
        raise ValueError("cairoquran.xml hash does not match the release artifact manifest")
    cairo_tree = etree.parse(str(cairo_file), etree.XMLParser(resolve_entities=False, no_network=True))
    cairo_lines = {
        element.get(f"{{{XML}}}id"): element.sourceline
        for element in cairo_tree.xpath(".//*[@xml:id]", namespaces=NS)
    }
    cairo_verses = {}
    for row in connection.execute(
        "SELECT p.source_native_locator AS verse_id, te.exact_source_text, sr.locator "
        "FROM text_edition te JOIN passage p ON p.passage_id=te.passage_id "
        "JOIN source_record sr ON sr.record_id=te.source_record_id "
        "WHERE te.edition_label='Corpus Coranicum Cairo 1924 (arabic_text)'"):
        verse_id = row["verse_id"]
        cairo_verses[verse_id] = {
            "exactText": row["exact_source_text"],
            "sourceUrl": (f"{REPOSITORY}/blob/{COMMIT}/data/cairo_quran/cairoquran.xml"
                          f"#L{cairo_lines[verse_id]}") if verse_id in cairo_lines else None,
        }
    alignment_by_word = {}
    for row in connection.execute(
        "SELECT cw.left_record_id, cw.match_method, cw.review_state, tt.source_native_locator AS target_word_id, "
        "tt.exact_source_text AS target_exact_text, te.edition_label AS target_layer, "
        "p.source_native_locator AS target_verse_id, sr.locator AS target_source_locator "
        "FROM crosswalk cw JOIN text_token tt ON tt.source_record_id=cw.right_record_id "
        "JOIN text_edition te ON te.text_edition_id=tt.text_edition_id "
        "LEFT JOIN passage p ON p.passage_id=te.passage_id "
        "JOIN source_record sr ON sr.record_id=tt.source_record_id "
        "WHERE cw.match_method='cc-variant-n-to-cairo-xml-id-v1' "
        "AND te.edition_label='Corpus Coranicum Cairo 1924 (arabic_text)'"):
        target_locator = row["target_source_locator"]
        target_xml_id = target_locator.split("#xml:id=", 1)[1].split(";", 1)[0]
        target_line = cairo_lines.get(target_xml_id)
        target_path = target_locator.split("#", 1)[0]
        verse = cairo_verses.get(row["target_verse_id"])
        alignment_by_word[row["left_record_id"]] = {
            "method": row["match_method"],
            "reviewState": row["review_state"],
            "targetWordId": row["target_word_id"],
            "targetExactText": row["target_exact_text"],
            "targetLayer": row["target_layer"],
            "targetVerseId": row["target_verse_id"],
            "targetVerseExactText": verse["exactText"] if verse else None,
            "targetVerseSourceUrl": verse["sourceUrl"] if verse else None,
            "targetSourceLocator": row["target_source_locator"],
            "targetSourceUrl": (f"{REPOSITORY}/blob/{COMMIT}/{target_path}#L{target_line}"
                                if target_line else None),
        }
    words_by_assertion = {}
    for row in connection.execute(
        "SELECT vw.assertion_id, vw.source_record_id, vw.ordinal, vw.source_native_locator, "
        "vw.exact_source_text FROM variant_word vw ORDER BY vw.assertion_id, vw.ordinal"):
        words_by_assertion.setdefault(row["assertion_id"], []).append({
            "ordinal": row["ordinal"],
            "exactText": row["exact_source_text"],
            "sourceLocator": row["source_native_locator"],
            "alignment": alignment_by_word.get(row["source_record_id"]),
        })

    records = []
    variant_query = (
        "SELECT va.assertion_id, va.native_id, va.reader_native_key, va.source_native_key, "
        "va.exact_source_text, sr.locator "
        "FROM variant_assertion va JOIN source_record sr ON sr.record_id=va.source_record_id "
        "WHERE sr.artifact_id IN (SELECT artifact_id FROM source_artifact "
        "WHERE snapshot_id='corpus-coranicum-tei') ORDER BY va.native_id")
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be a positive integer")
    if args.limit is not None:
        variant_query += " LIMIT ?"
    query_rows = connection.execute(variant_query, (args.limit,) if args.limit is not None else ())
    for row in query_rows:
        native_id = row["native_id"]
        line = source_lines.get(native_id)
        if line is None:
            raise ValueError(f"variant {native_id} has no source XML line locator")
        github = f"{REPOSITORY}/blob/{COMMIT}/{source_path}#L{line}"
        records.append({
            "variantId": native_id,
            "readerNativeKey": row["reader_native_key"],
            "readerExactLabel": reader_labels.get(native_id),
            "readerReferences": reader_references_by_variant.get(native_id, []),
            "readerAuthority": reader_authorities.get(
                row["reader_native_key"].replace("variantreader_", "variantsreader_", 1)
                if row["reader_native_key"] and row["reader_native_key"].startswith("variantreader_")
                else row["reader_native_key"]),
            "sourceNativeKey": row["source_native_key"],
            "exactSourceText": row["exact_source_text"],
            "sourceRecord": {
                "repository": REPOSITORY,
                "commit": COMMIT,
                "file": source_path,
                "xmlId": native_id,
                "line": line,
                "locator": row["locator"],
                "sha256": artifact[0],
                "url": github,
            },
            "words": words_by_assertion.get(row["assertion_id"], []),
            "citationState": "source-key-missing" if not row["source_native_key"] or row["source_native_key"] == "variantsource_" else "source-key-present-unreviewed",
        })

    data = {
        "dataset": "Corpus Coranicum Quran variants",
        "dataVersion": f"cc-{COMMIT[:12]}",
        "schemaVersion": "1",
        "sourceCommit": COMMIT,
        "sourceRepository": REPOSITORY,
        "sourceLicense": "CC BY-SA 4.0",
        "attribution": ATTRIBUTION,
        "modificationNotice": (
            "Variant records, authority labels, word forms, and source locators were extracted from TEI. "
            "TEI character data and whitespace are retained. Reader authority keys use the documented "
            "prefix alias; Cairo word links remain unreviewed candidates."
        ),
        "recordGranularity": "One entry per source-native TEI variant xml:id; no cross-record deduplication.",
        "completeSourceRecordCount": connection.execute("SELECT COUNT(*) FROM variant_assertion").fetchone()[0],
        "recordCount": len(records),
        "indexScope": (f"First {len(records)} records in source-native ID order; pilot preview only."
                       if args.limit is not None else "Complete indexed set for source records currently imported."),
        "records": records,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.out), "records": len(records),
                      "bytes": args.out.stat().st_size, "sha256": sha256(args.out),
                      "recordsWithoutSourceKeys": sum(r["citationState"] == "source-key-missing" for r in records),
                      "candidateWordLinks": sum(w["alignment"] is not None for r in records for w in r["words"])},
                     ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
