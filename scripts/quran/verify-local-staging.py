#!/usr/bin/env python3
"""Recompare staged TEI text and locators with the pinned source XML."""

from __future__ import annotations

import argparse
import sqlite3
import sys
from pathlib import Path

from lxml import etree

TEI = "http://www.tei-c.org/ns/1.0"
XML = "http://www.w3.org/XML/1998/namespace"
NS = {"tei": TEI, "xml": XML}


def exact_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--db", type=Path, required=True)
    args = parser.parse_args()
    connection = sqlite3.connect(args.db)
    connection.row_factory = sqlite3.Row

    variants_path = args.tei / "data/quran_variants/allvariants.xml"
    variant_tree = etree.parse(str(variants_path), etree.XMLParser(resolve_entities=False, no_network=True))
    assertions = {
        row["native_id"]: row
        for row in connection.execute(
            "SELECT va.native_id, va.assertion_id, va.exact_source_text "
            "FROM variant_assertion va JOIN source_record sr ON sr.record_id=va.source_record_id "
            "JOIN source_artifact sa ON sa.artifact_id=sr.artifact_id "
            "WHERE sa.relative_path='data/quran_variants/allvariants.xml'")
    }
    variant_word_rows = connection.execute(
        "SELECT vw.assertion_id, vw.source_native_locator, vw.exact_source_text "
        "FROM variant_word vw JOIN variant_assertion va ON va.assertion_id=vw.assertion_id "
        "JOIN source_record sr ON sr.record_id=va.source_record_id "
        "JOIN source_artifact sa ON sa.artifact_id=sr.artifact_id "
        "WHERE sa.relative_path='data/quran_variants/allvariants.xml' "
        "ORDER BY vw.assertion_id, vw.ordinal").fetchall()
    staged_words_by_assertion = {}
    for row in variant_word_rows:
        staged_words_by_assertion.setdefault(row["assertion_id"], []).append(row)
    variant_mismatches = 0
    word_mismatches = 0
    source_items = variant_tree.xpath(".//tei:item[@xml:id]", namespaces=NS)
    for item in source_items:
        native_id = item.get(f"{{{XML}}}id")
        staged = assertions.get(native_id)
        ab = item.find(f"{{{TEI}}}ab")
        source_value = exact_text(ab if ab is not None else item)
        if staged is None or staged["exact_source_text"] != source_value:
            variant_mismatches += 1
            continue
        staged_words = staged_words_by_assertion.get(staged["assertion_id"], [])
        source_words = item.xpath(".//tei:w", namespaces=NS)
        if len(staged_words) != len(source_words):
            word_mismatches += 1
            continue
        for stored, word in zip(staged_words, source_words):
            if (stored["source_native_locator"] != word.get("n")
                    or stored["exact_source_text"] != exact_text(word)):
                word_mismatches += 1
                break

    staged_reader_references = {}
    staged_authority_keys = {row[0] for row in connection.execute(
        "SELECT native_key FROM reading_authority")}
    for row in connection.execute(
        "SELECT va.native_id, vr.ordinal, vr.reader_native_key, vr.exact_source_label, "
        "sr.locator, ra.native_key AS authority_native_key "
        "FROM variant_reader_reference vr "
        "JOIN variant_assertion va ON va.assertion_id=vr.assertion_id "
        "JOIN source_record sr ON sr.record_id=vr.source_record_id "
        "LEFT JOIN reading_authority ra ON ra.authority_id=vr.reader_authority_id "
        "ORDER BY va.native_id, vr.ordinal"):
        staged_reader_references.setdefault(row["native_id"], []).append(row)
    reader_reference_mismatches = 0
    source_reader_reference_count = 0
    for item in source_items:
        native_id = item.get(f"{{{XML}}}id")
        source_references = item.findall(f"{{{TEI}}}persName")
        staged_references = staged_reader_references.get(native_id, [])
        source_reader_reference_count += len(source_references)
        if len(staged_references) != len(source_references):
            reader_reference_mismatches += abs(len(staged_references) - len(source_references)) or 1
            continue
        for ordinal, (source_reference, staged_reference) in enumerate(
                zip(source_references, staged_references, strict=True), 1):
            key = source_reference.get("key")
            alias_key = (key.replace("variantreader_", "variantsreader_", 1)
                         if key and key.startswith("variantreader_") else key)
            expected_authority_key = alias_key if alias_key in staged_authority_keys else None
            expected_locator = (
                f"data/quran_variants/allvariants.xml#xml:id={native_id};persName[{ordinal}]"
            )
            if (staged_reference["ordinal"] != ordinal
                    or staged_reference["reader_native_key"] != key
                    or staged_reference["exact_source_label"] != exact_text(source_reference)
                    or staged_reference["locator"] != expected_locator
                    or staged_reference["authority_native_key"] != expected_authority_key):
                reader_reference_mismatches += 1

    reader_authority_tree = etree.parse(
        str(args.tei / "data/quran_variants/reader.xml"),
        etree.XMLParser(resolve_entities=False, no_network=True))
    source_reader_authorities = {}
    for person in reader_authority_tree.xpath(".//tei:person[@xml:id]", namespaces=NS):
        key = person.get(f"{{{XML}}}id")
        label = person.find("./tei:name[@type='display']", namespaces=NS)
        if label is None:
            label = person.find("./tei:name[@type='main']", namespaces=NS)
        source_reader_authorities[key] = exact_text(label) if label is not None else ""
    staged_reader_authorities = {
        row["native_key"]: row["exact_label"]
        for row in connection.execute("SELECT native_key, exact_label FROM reading_authority")
    }
    reader_authority_mismatches = sum(
        1 for key, label in source_reader_authorities.items()
        if staged_reader_authorities.get(key) != label)
    if len(staged_reader_authorities) != len(source_reader_authorities):
        reader_authority_mismatches += abs(len(staged_reader_authorities) - len(source_reader_authorities))

    source_authority_tree = etree.parse(
        str(args.tei / "data/quran_variants/sources.xml"),
        etree.XMLParser(resolve_entities=False, no_network=True))
    source_bibliographies = {
        element.get(f"{{{XML}}}id"): exact_text(element)
        for element in source_authority_tree.xpath(".//tei:biblStruct[@xml:id]", namespaces=NS)
    }
    staged_bibliographies = {
        row["native_key"]: row["exact_label"]
        for row in connection.execute("SELECT native_key, exact_label FROM source_authority")
    }
    source_authority_mismatches = sum(
        1 for key, label in source_bibliographies.items()
        if staged_bibliographies.get(key) != label)
    if len(staged_bibliographies) != len(source_bibliographies):
        source_authority_mismatches += abs(len(staged_bibliographies) - len(source_bibliographies))

    cairo_path = args.tei / "data/cairo_quran/cairoquran.xml"
    cairo_tree = etree.parse(str(cairo_path), etree.XMLParser(resolve_entities=False, no_network=True))
    cairo_mismatches = 0
    cairo_count = 0
    staged_cairo_lines = {}
    staged_cairo_line_ids = {}
    for row in connection.execute(
            "SELECT sr.locator, te.text_edition_id, te.exact_source_text FROM text_edition te "
            "JOIN source_record sr ON sr.record_id=te.source_record_id "
            "JOIN source_artifact sa ON sa.artifact_id=sr.artifact_id "
            "WHERE sa.relative_path='data/cairo_quran/cairoquran.xml' "
            "UNION ALL "
            "SELECT sr.locator, te.translation_edition_id AS text_edition_id, te.exact_source_text FROM translation_edition te "
            "JOIN source_record sr ON sr.record_id=te.source_record_id "
            "JOIN source_artifact sa ON sa.artifact_id=sr.artifact_id "
            "WHERE sa.relative_path='data/cairo_quran/cairoquran.xml'"):
        staged_cairo_lines[row["locator"]] = row["exact_source_text"]
        staged_cairo_line_ids[row["locator"]] = row["text_edition_id"]
    staged_cairo_tokens = {}
    for row in connection.execute(
            "SELECT text_edition_id, ordinal, source_native_locator, exact_source_text "
            "FROM text_token ORDER BY text_edition_id, ordinal"):
        staged_cairo_tokens.setdefault(row["text_edition_id"], []).append(row)
    cairo_token_mismatches = 0
    for line in cairo_tree.xpath(".//tei:div[@type]//tei:l", namespaces=NS):
        layer_elements = line.xpath("ancestor::tei:div[@type][1]", namespaces=NS)
        layer_element = layer_elements[0] if layer_elements else None
        layer = layer_element.get("type") if layer_element is not None else "untyped"
        language = layer_element.get(f"{{{XML}}}lang") if layer_element is not None else None
        parent_group = line.getparent()
        verse_id = parent_group.get(f"{{{XML}}}id") if parent_group is not None else None
        locator = (f"data/cairo_quran/cairoquran.xml#xml:id={verse_id};layer={layer};"
                   f"lang={language or 'und'};line-n={line.get('n')}")
        if locator not in staged_cairo_lines or staged_cairo_lines[locator] != exact_text(line):
            cairo_mismatches += 1
        edition_id = staged_cairo_line_ids.get(locator)
        staged_tokens = staged_cairo_tokens.get(edition_id, [])
        source_tokens = line.xpath(".//tei:w", namespaces=NS)
        if len(staged_tokens) != len(source_tokens):
            cairo_token_mismatches += 1
        else:
            for stored, word in zip(staged_tokens, source_tokens):
                if (stored["source_native_locator"] != word.get(f"{{{XML}}}id")
                        or stored["exact_source_text"] != exact_text(word)):
                    cairo_token_mismatches += 1
                    break
        cairo_count += 1

    crosswalk_rows = connection.execute(
        "SELECT vw.source_native_locator AS source_locator, tt.source_native_locator AS target_locator "
        "FROM crosswalk cw JOIN variant_word vw ON vw.source_record_id=cw.left_record_id "
        "JOIN text_token tt ON tt.source_record_id=cw.right_record_id "
        "WHERE cw.match_method='cc-variant-n-to-cairo-xml-id-v1' "
        "AND cw.review_state='candidate'").fetchall()
    bad_crosswalks = sum(1 for row in crosswalk_rows
                         if row["target_locator"] != "w-" + row["source_locator"].replace(":", "-"))

    integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    foreign_keys = connection.execute("PRAGMA foreign_key_check").fetchall()
    duplicate_locators = connection.execute(
        "SELECT COUNT(*) FROM (SELECT locator FROM source_record WHERE locator IS NOT NULL "
        "GROUP BY locator HAVING COUNT(*)>1)").fetchone()[0]
    text_layer_rights = connection.execute(
        "SELECT COUNT(*) FROM text_edition WHERE rights_state!='identified'").fetchone()[0]
    translation_layer_rights = connection.execute(
        "SELECT COUNT(*) FROM translation_edition WHERE rights_state!='needs_review'").fetchone()[0]
    translation_without_source = connection.execute(
        "SELECT COUNT(*) FROM translation_edition WHERE source_record_id IS NULL").fetchone()[0]
    translation_without_passage = connection.execute(
        "SELECT COUNT(*) FROM translation_edition WHERE passage_id IS NULL").fetchone()[0]
    translation_labels_inferred = connection.execute(
        "SELECT COUNT(*) FROM translation_edition WHERE translator_label IS NOT NULL").fetchone()[0]
    summary = {
        "source_variant_records": len(source_items),
        "variant_records_staged": len(assertions),
        "variant_text_or_count_mismatches": variant_mismatches,
        "variant_word_text_or_locator_mismatches": word_mismatches,
        "variant_reader_references_checked": source_reader_reference_count,
        "variant_reader_reference_mismatches": reader_reference_mismatches,
        "reader_authorities_checked": len(source_reader_authorities),
        "reader_authority_mismatches": reader_authority_mismatches,
        "source_authorities_checked": len(source_bibliographies),
        "source_authority_mismatches": source_authority_mismatches,
        "cairo_lines_checked": cairo_count,
        "cairo_text_or_locator_mismatches": cairo_mismatches,
        "cairo_word_tokens_checked": sum(map(len, staged_cairo_tokens.values())),
        "cairo_word_token_mismatches": cairo_token_mismatches,
        "text_layer_rights_state_errors": text_layer_rights,
        "translation_layer_rights_state_errors": translation_layer_rights,
        "translation_source_locator_errors": translation_without_source,
        "translation_passage_locator_errors": translation_without_passage,
        "unexpected_translation_labels": translation_labels_inferred,
        "translation_records_staged": connection.execute(
            "SELECT COUNT(*) FROM translation_edition").fetchone()[0],
        "variant_to_cairo_candidate_links": len(crosswalk_rows),
        "invalid_variant_to_cairo_candidates": bad_crosswalks,
        "duplicate_source_locators": duplicate_locators,
        "sqlite_integrity": integrity,
        "foreign_key_errors": len(foreign_keys),
    }
    print(__import__("json").dumps(summary, indent=2))
    ok = (variant_mismatches == 0 and word_mismatches == 0
          and reader_reference_mismatches == 0
          and reader_authority_mismatches == 0 and source_authority_mismatches == 0
          and cairo_mismatches == 0
          and cairo_token_mismatches == 0 and bad_crosswalks == 0
          and text_layer_rights == 0 and translation_layer_rights == 0
          and translation_without_source == 0 and translation_without_passage == 0
          and translation_labels_inferred == 0
          and duplicate_locators == 0 and integrity == "ok" and not foreign_keys
          and len(assertions) == len(source_items))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
