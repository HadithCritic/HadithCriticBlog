#!/usr/bin/env python3
"""Recompute reader-key count rows and source locators independently."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
XML = "http://www.w3.org/XML/1998/namespace"
NS = {"tei": "http://www.tei-c.org/ns/1.0", "xml": XML}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def canonical_json(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--analysis", type=Path, required=True)
    args = parser.parse_args()
    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"],
                          capture_output=True, text=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError("TEI source is not the pinned commit")
    conn = sqlite3.connect(args.release_db)
    conn.row_factory = sqlite3.Row
    metadata = dict(conn.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != "CC BY-SA 4.0":
        raise ValueError("release metadata mismatch")
    index = json.loads(args.analysis.read_text(encoding="utf-8"))
    variants_rel = "data/quran_variants/allvariants.xml"
    reader_rel = "data/quran_variants/reader.xml"
    hashes = dict(conn.execute("SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    variants_path = args.tei / variants_rel
    reader_path = args.tei / reader_rel
    if sha256(variants_path) != hashes[variants_rel] or sha256(reader_path) != hashes[reader_rel]:
        raise ValueError("source file hashes do not match the release manifest")
    if index.get("inputReleaseSha256") != sha256(args.release_db):
        raise ValueError("analysis names a different release database hash")

    tree = etree.parse(str(variants_path), etree.XMLParser(resolve_entities=False, no_network=True))
    source_lines = {element.get(f"{{{XML}}}id"): element.sourceline
                    for element in tree.xpath(".//tei:item[@xml:id]", namespaces=NS)}
    errors = 0
    groups: dict[str | None, list[dict[str, object]]] = defaultdict(list)
    source_refs = []
    records_with_refs = set()
    reference_lines = {}
    for item in tree.xpath(".//tei:item[@xml:id]", namespaces=NS):
        variant_id = item.get(f"{{{XML}}}id")
        line = source_lines.get(variant_id)
        if line is None:
            errors = 1
            continue
        references = item.findall("./tei:persName", namespaces=NS)
        for ordinal, reference in enumerate(references, 1):
            key = reference.get("key")
            label_line = reference.sourceline
            reference_lines[(variant_id, ordinal)] = label_line
            source_ref = {
                "variantId": variant_id,
                "line": line,
                "labelOrdinal": ordinal,
                "exactLabel": "".join(reference.itertext())[:-len(reference.tail)]
                if reference.tail and "".join(reference.itertext()).endswith(reference.tail)
                else "".join(reference.itertext()),
                "labelLine": label_line,
                "labelSourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{variants_rel}#L{label_line}",
            }
            groups[key].append(source_ref)
            source_refs.append((variant_id, ordinal, key, source_ref["exactLabel"]))
            records_with_refs.add(variant_id)
    expected_missing = sorted(variant_id for variant_id in source_lines if variant_id not in records_with_refs)
    groups[None].extend({"variantId": variant_id, "line": source_lines[variant_id],
                         "labelOrdinal": None, "exactLabel": None, "labelLine": None,
                         "labelSourceUrl": None} for variant_id in expected_missing)
    for members in groups.values():
        members.sort(key=lambda member: (member["variantId"], member["labelOrdinal"] or 0))
    staged_refs = [(row["native_id"], row["ordinal"], row["reader_native_key"], row["exact_source_label"])
                   for row in conn.execute(
                       "SELECT va.native_id, vr.ordinal, vr.reader_native_key, vr.exact_source_label "
                       "FROM variant_reader_reference vr JOIN variant_assertion va ON va.assertion_id=vr.assertion_id "
                       "ORDER BY va.native_id, vr.ordinal")]
    database_ref_mismatches = int(staged_refs != sorted(source_refs))

    authority_tree = etree.parse(str(reader_path), etree.XMLParser(resolve_entities=False, no_network=True))
    authorities = {}
    for person in authority_tree.xpath(".//tei:person[@xml:id]", namespaces=NS):
        key = person.get(f"{{{XML}}}id")
        label = person.find("./tei:name[@type='display']", namespaces=NS)
        if label is None:
            label = person.find("./tei:name[@type='main']", namespaces=NS)
        value = "".join(label.itertext()) if label is not None else ""
        if label is not None and label.tail and value.endswith(label.tail):
            value = value[:-len(label.tail)]
        authorities[key] = {"nativeKey": key, "exactLabel": value, "line": person.sourceline}

    expected_rows = []
    errors += database_ref_mismatches
    for raw_key, members in sorted(groups.items(), key=lambda item: (item[0] is not None, item[0] or "")):
        authority_key = raw_key.replace("variantreader_", "variantsreader_", 1) if raw_key and raw_key.startswith("variantreader_") else raw_key
        authority = authorities.get(authority_key) if authority_key else None
        expected_authority = ({**authority, "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{reader_rel}#L{authority['line']}"}
                              if authority else None)
        if any(member["line"] is None for member in members):
            errors += 1
        expected_rows.append({"readerNativeKey": raw_key, "readerAuthority": expected_authority,
                              "recordCount": len({member["variantId"] for member in members}),
                              "sourceLabelEntryCount": sum(member["labelOrdinal"] is not None for member in members),
                              "variantRecords": members})

    actual = index.get("rows", [])
    if actual != expected_rows:
        errors += 1
    result_hash = index.get("resultSha256")
    hash_input = dict(index)
    hash_input.pop("resultSha256", None)
    if result_hash != hashlib.sha256(canonical_json(hash_input)).hexdigest():
        errors += 1
    expected_source_records = len(source_lines)
    expected_source_labels = len(source_refs)
    if index.get("recordCount") != expected_source_records:
        errors += 1
    if index.get("sourceLabelEntryCount") != expected_source_labels:
        errors += 1
    summary = {
        "sourceVariantRecords": expected_source_records,
        "sourceLabelEntries": expected_source_labels,
        "databaseReaderReferenceMismatches": database_ref_mismatches,
        "readerKeyGroups": len(groups),
        "memberRecordsChecked": sum(len(row["variantRecords"]) for row in expected_rows),
        "rowsWithAuthority": sum(row["readerAuthority"] is not None for row in expected_rows),
        "rowsWithoutAuthority": sum(row["readerAuthority"] is None for row in expected_rows),
        "analysisRowsMatchRecomputation": actual == expected_rows,
        "resultHashMatches": result_hash == hashlib.sha256(canonical_json(hash_input)).hexdigest(),
        "errors": errors,
    }
    print(json.dumps(summary, ensure_ascii=True, indent=2))
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
