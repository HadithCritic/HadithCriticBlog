#!/usr/bin/env python3
"""Check the catalog and detail shards against the audited full index byte-for-byte."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
NS = {"tei": "http://www.tei-c.org/ns/1.0", "xml": "http://www.w3.org/XML/1998/namespace"}
XML = "http://www.w3.org/XML/1998/namespace"


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full-index", type=Path, required=True)
    parser.add_argument("--package-dir", type=Path, required=True)
    parser.add_argument("--staging-db", type=Path, required=True,
                        help="Audited SQLite release DB used to independently verify candidate links")
    parser.add_argument("--tei", type=Path, required=True,
                        help="Pinned TEI checkout used to verify source reader-reference locators")
    args = parser.parse_args()
    source = json.loads(args.full_index.read_text(encoding="utf-8"))
    db = sqlite3.connect(args.staging_db)
    db.row_factory = sqlite3.Row
    canonical_candidates = {
        (row["native_id"], row["ordinal"]): {
            "method": row["match_method"],
            "reviewState": row["review_state"],
            "targetWordId": row["target_word_id"],
            "targetExactText": row["target_exact_text"],
            "targetVerseId": row["target_verse_id"],
            "targetSourceLocator": row["target_source_locator"],
        }
        for row in db.execute(
            "SELECT va.native_id, vw.ordinal, cw.match_method, cw.review_state, "
            "tt.source_native_locator AS target_word_id, tt.exact_source_text AS target_exact_text, "
            "p.source_native_locator AS target_verse_id, sr.locator AS target_source_locator "
            "FROM crosswalk cw JOIN variant_word vw ON vw.source_record_id=cw.left_record_id "
            "JOIN variant_assertion va ON va.assertion_id=vw.assertion_id "
            "JOIN text_token tt ON tt.source_record_id=cw.right_record_id "
            "JOIN text_edition te ON te.text_edition_id=tt.text_edition_id "
            "LEFT JOIN passage p ON p.passage_id=te.passage_id "
            "JOIN source_record sr ON sr.record_id=tt.source_record_id "
            "WHERE cw.match_method='cc-variant-n-to-cairo-xml-id-v1' "
            "AND te.edition_label='Corpus Coranicum Cairo 1924 (arabic_text)'"
        )
    }
    variants_path = args.tei / "data/quran_variants/allvariants.xml"
    reader_path = args.tei / "data/quran_variants/reader.xml"
    variant_tree = etree.parse(str(variants_path), etree.XMLParser(resolve_entities=False, no_network=True))
    reader_lines = {}
    for item in variant_tree.xpath(".//tei:item[@xml:id]", namespaces=NS):
        native_id = item.get(f"{{{XML}}}id")
        for ordinal, reference in enumerate(item.findall("./tei:persName", namespaces=NS), 1):
            reader_lines[(native_id, ordinal)] = reference.sourceline
    reader_tree = etree.parse(str(reader_path), etree.XMLParser(resolve_entities=False, no_network=True))
    authority_lines = {
        person.get(f"{{{XML}}}id"): person.sourceline
        for person in reader_tree.xpath(".//tei:person[@xml:id]", namespaces=NS)
    }
    artifact_sha = db.execute(
        "SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' "
        "AND relative_path='data/quran_variants/allvariants.xml'").fetchone()[0]
    canonical_reader_references: dict[tuple[str, int], dict[str, object]] = {}
    for row in db.execute(
        "SELECT va.native_id, vr.ordinal, vr.reader_native_key, vr.exact_source_label, "
        "sr.locator, ra.native_key AS authority_key, ra.exact_label AS authority_label "
        "FROM variant_reader_reference vr "
        "JOIN variant_assertion va ON va.assertion_id=vr.assertion_id "
        "JOIN source_record sr ON sr.record_id=vr.source_record_id "
        "LEFT JOIN reading_authority ra ON ra.authority_id=vr.reader_authority_id "
        "ORDER BY va.native_id, vr.ordinal"):
        native_id, ordinal = row["native_id"], row["ordinal"]
        line = reader_lines.get((native_id, ordinal))
        if line is None:
            continue
        authority_key = row["authority_key"]
        authority = None
        if authority_key:
            authority_line = authority_lines.get(authority_key)
            if authority_line is None:
                continue
            authority = {
                "nativeKey": authority_key,
                "exactLabel": row["authority_label"],
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/data/quran_variants/reader.xml#L{authority_line}",
                "linkRule": "documented-prefix-alias",
            }
        canonical_reader_references[(native_id, ordinal)] = {
            "ordinal": ordinal,
            "nativeKey": row["reader_native_key"],
            "exactLabel": row["exact_source_label"],
            "sourceRecord": {
                "file": "data/quran_variants/allvariants.xml",
                "parentXmlId": native_id,
                "locator": row["locator"],
                "line": line,
                "sha256": artifact_sha,
                "url": f"{REPOSITORY}/blob/{COMMIT}/data/quran_variants/allvariants.xml#L{line}",
            },
            "readerAuthority": authority,
        }
    catalog_path = args.package_dir / "variant-catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    errors: list[str] = []
    if source.get("sourceCommit") != COMMIT or catalog.get("sourceCommit") != COMMIT:
        errors.append("source commit mismatch")
    if source.get("sourceLicense") != "CC BY-SA 4.0" or catalog.get("sourceLicense") != "CC BY-SA 4.0":
        errors.append("source license mismatch")

    source_records = source.get("records", [])
    checked_candidates = 0
    checked_reader_references = 0
    for record in source_records:
        native_id = record.get("variantId")
        expected_refs = [canonical_reader_references[key]
                         for key in sorted(canonical_reader_references)
                         if key[0] == native_id]
        if record.get("readerReferences") != expected_refs:
            errors.append(f"source-listed reader references differ from canonical SQL/source rows: {native_id}")
        else:
            checked_reader_references += len(expected_refs)
        for word in record.get("words", []):
            alignment = word.get("alignment")
            if alignment is None:
                continue
            canonical = canonical_candidates.get((record.get("variantId"), word.get("ordinal")))
            if canonical is None:
                errors.append(f"candidate has no matching canonical SQL row: {record.get('variantId')}#{word.get('ordinal')}")
            elif any(alignment.get(key) != value for key, value in canonical.items()):
                errors.append(f"candidate provenance differs from canonical SQL crosswalk: {record.get('variantId')}#{word.get('ordinal')}")
            else:
                checked_candidates += 1
    catalog_records = catalog.get("records", [])
    shard_size = catalog.get("detailShardSize", 0)
    if not isinstance(shard_size, int) or shard_size < 1:
        errors.append("invalid detail shard size")
        shard_size = 750
    expected_catalog = []
    for i, record in enumerate(source_records):
        expected_catalog.append({key: record.get(key) for key in (
            "variantId", "readerNativeKey", "readerExactLabel", "readerAuthority",
            "sourceNativeKey", "exactSourceText", "sourceRecord", "citationState")})
        expected_catalog[-1].update({
            "readerReferenceCount": len(record.get("readerReferences", [])),
            "candidateCount": sum(1 for word in record.get("words", []) if word.get("alignment")),
            "candidateVerseIds": sorted({word["alignment"]["targetVerseId"]
                                          for word in record.get("words", []) if word.get("alignment")}),
            "detailsFile": f"variant-details-{i // shard_size + 1:03d}.json",
        })
    if len(source_records) != 18000 or catalog_records != expected_catalog:
        errors.append("catalog records or derived candidate metadata do not match the full source index")
    if checked_candidates != 34163:
        errors.append(f"expected to verify 34,163 canonical candidate rows; verified {checked_candidates}")
    if checked_reader_references != 30112:
        errors.append(f"expected to verify 30,112 source-listed label references; verified {checked_reader_references}")
    reader_index_files = catalog.get("readerIndexFiles", [])
    packaged_reader_records: dict[str, list[dict[str, object]]] = {}
    packaged_reader_references = 0
    for index_info in reader_index_files:
        path = args.package_dir / str(index_info.get("path", ""))
        if not path.is_file():
            errors.append(f"missing reader reference index: {path.name}")
            continue
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != index_info.get("sha256") or len(raw) != index_info.get("bytes"):
            errors.append(f"reader reference index checksum or size mismatch: {path.name}")
        index = json.loads(raw)
        if (index.get("sourceCommit") != COMMIT or index.get("sourceLicense") != "CC BY-SA 4.0"
                or index.get("schemaVersion") != "1"):
            errors.append(f"reader reference index source/license mismatch: {path.name}")
        if len(index.get("records", [])) != index_info.get("recordCount"):
            errors.append(f"reader reference index record count mismatch: {path.name}")
        if sum(len(record.get("references", [])) for record in index.get("records", [])) != index_info.get("referenceCount"):
            errors.append(f"reader reference index reference count mismatch: {path.name}")
        for record in index.get("records", []):
            packaged_reader_records[record["variantId"]] = record["references"]
            packaged_reader_references += len(record["references"])
    expected_reader_records = {record["variantId"]: record.get("readerReferences", [])
                               for record in source_records if record.get("readerReferences")}
    if packaged_reader_records != expected_reader_records or packaged_reader_references != 30112:
        errors.append("split reader reference indexes differ from full source index")
    if catalog.get("readerReferenceCount") != packaged_reader_references:
        errors.append("catalog reader-reference total differs from its complete reader indexes")
    catalog_by_id = {record.get("variantId"): record for record in catalog_records}

    checked_records = 0
    checked_words = 0
    contexts: dict[str, dict[str, str | None]] = {}
    listed_shards = catalog.get("detailShards", [])
    if not listed_shards:
        errors.append("catalog lists no detail shards")
    for shard_info in listed_shards:
        shard_path = args.package_dir / str(shard_info.get("path", ""))
        if not shard_path.is_file():
            errors.append(f"missing detail shard: {shard_path.name}")
            continue
        raw = shard_path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != shard_info.get("sha256"):
            errors.append(f"detail shard checksum mismatch: {shard_path.name}")
        if len(raw) != shard_info.get("bytes"):
            errors.append(f"detail shard size mismatch: {shard_path.name}")
        shard = json.loads(raw)
        shard_records = shard.get("records", [])
        if len(shard_records) != shard_info.get("recordCount"):
            errors.append(f"detail shard record count mismatch: {shard_path.name}")
        expected_records = [record for record in source_records
                            if catalog_by_id.get(record.get("variantId"), {}).get("detailsFile") == shard_path.name]
        if len(expected_records) != len(shard_records):
            errors.append(f"detail shard membership mismatch: {shard_path.name}")
            continue
        for expected, actual in zip(expected_records, shard_records, strict=True):
            if (actual.get("variantId") != expected.get("variantId")
                    or actual.get("sourceNativeKey") != expected.get("sourceNativeKey")
                    or actual.get("readerReferences") != expected.get("readerReferences")):
                errors.append(f"source identity mismatch in {shard_path.name}: {expected.get('variantId')}")
                continue
            expected_words = []
            expected_candidates = 0
            for word in expected.get("words", []):
                alignment = word.get("alignment")
                if alignment:
                    expected_candidates += 1
                    verse_id = alignment["targetVerseId"]
                    context = {"exactText": alignment.get("targetVerseExactText"),
                               "sourceUrl": alignment.get("targetVerseSourceUrl")}
                    if verse_id in contexts and contexts[verse_id] != context:
                        errors.append(f"cross-shard source verse conflict: {verse_id}")
                    contexts[verse_id] = context
                    if shard.get("passages", {}).get(verse_id) != context:
                        errors.append(f"source verse context mismatch in {shard_path.name}: {verse_id}")
                    alignment = {key: value for key, value in alignment.items()
                                 if key not in ("targetVerseExactText", "targetVerseSourceUrl")}
                expected_words.append({"ordinal": word.get("ordinal"), "exactText": word.get("exactText"),
                                       "sourceLocator": word.get("sourceLocator"), "alignment": alignment})
            if actual.get("words") != expected_words:
                errors.append(f"word text, order, locator, or candidate mismatch: {expected.get('variantId')}")
            catalog_record = catalog_by_id.get(expected.get("variantId"))
            if catalog_record is None or catalog_record.get("candidateCount") != expected_candidates:
                errors.append(f"catalog candidate count mismatch: {expected.get('variantId')}")
            checked_records += 1
            checked_words += len(expected_words)

    if checked_records != 18000:
        errors.append(f"expected to verify 18,000 detail records; verified {checked_records}")
    if checked_words != 68344:
        errors.append(f"expected to verify 68,344 word entries; verified {checked_words}")
    if len(contexts) != 3492:
        errors.append(f"expected 3,492 distinct candidate verse contexts; found {len(contexts)}")
    if sum(record.get("candidateCount", 0) for record in catalog_records) != 34163:
        errors.append("catalog candidate total mismatch")

    expected_passages: dict[str, dict[str, object]] = {}
    for record in source_records:
        words_by_verse: dict[str, list[dict[str, object]]] = {}
        contexts_by_verse: dict[str, dict[str, str | None]] = {}
        for word in record.get("words", []):
            alignment = word.get("alignment")
            if not alignment:
                continue
            verse_id = alignment["targetVerseId"]
            context = {"exactText": alignment.get("targetVerseExactText"),
                       "sourceUrl": alignment.get("targetVerseSourceUrl")}
            contexts_by_verse[verse_id] = context
            words_by_verse.setdefault(verse_id, []).append({
                "ordinal": word.get("ordinal"),
                "variantExactText": word.get("exactText"),
                "variantSourceLocator": word.get("sourceLocator"),
                "targetExactText": alignment.get("targetExactText"),
                "candidateMethod": alignment.get("method"),
                "targetSourceLocator": alignment.get("targetSourceLocator"),
                "targetSourceUrl": alignment.get("targetSourceUrl"),
            })
        for verse_id, words in words_by_verse.items():
            entry = expected_passages.setdefault(verse_id, {
                **contexts_by_verse[verse_id],
                "records": [],
            })
            if entry["exactText"] != contexts_by_verse[verse_id]["exactText"]:
                errors.append(f"source index has conflicting exact contexts for {verse_id}")
            entry["records"].append({"variantId": record["variantId"], "words": words})

    passage_path = args.package_dir / "variant-passages.json"
    if not passage_path.is_file():
        errors.append("missing complete passage index")
    else:
        passage_index = json.loads(passage_path.read_text(encoding="utf-8"))
        if passage_index.get("sourceCommit") != COMMIT or passage_index.get("sourceLicense") != "CC BY-SA 4.0":
            errors.append("passage index source or license metadata mismatch")
        if passage_index.get("passageCount") != 3492 or len(passage_index.get("passages", {})) != 3492:
            errors.append("passage index coverage mismatch")
        if passage_index.get("candidateWordCount") != 34163:
            errors.append("passage index candidate word count mismatch")
        if passage_index.get("passages") != expected_passages:
            errors.append("passage index text, locators, ordering, or membership differs from source index")

    print(json.dumps({
        "records": checked_records,
        "wordEntries": checked_words,
        "candidateWords": sum(record.get("candidateCount", 0) for record in catalog_records),
        "readerReferences": checked_reader_references,
        "passages": len(expected_passages),
        "distinctCandidateVerseContexts": len(contexts),
        "sourceVariantIndexSha256": digest(args.full_index),
        "errors": errors,
    }, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
