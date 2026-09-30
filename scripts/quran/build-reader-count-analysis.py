#!/usr/bin/env python3
"""Build a reproducible count of source-native variant records by reader key."""

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


def exact_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def canonical_json(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"],
                          capture_output=True, text=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned TEI commit {COMMIT}; found {head}")

    conn = sqlite3.connect(args.release_db)
    conn.row_factory = sqlite3.Row
    metadata = dict(conn.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != "CC BY-SA 4.0":
        raise ValueError("release metadata does not match the pinned licensed TEI source")
    source_path = "data/quran_variants/allvariants.xml"
    source_file = args.tei / source_path
    source_hash = conn.execute(
        "SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' AND relative_path=?",
        (source_path,)).fetchone()
    if source_hash is None or sha256(source_file) != source_hash[0]:
        raise ValueError("allvariants.xml hash does not match the release manifest")
    authority_path = "data/quran_variants/reader.xml"
    authority_file = args.tei / authority_path
    authority_hash = conn.execute(
        "SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' AND relative_path=?",
        (authority_path,)).fetchone()
    if authority_hash is None or sha256(authority_file) != authority_hash[0]:
        raise ValueError("reader.xml hash does not match the release manifest")

    variants_tree = etree.parse(str(source_file), etree.XMLParser(resolve_entities=False, no_network=True))
    source_lines = {item.get(f"{{{XML}}}id"): item.sourceline
                    for item in variants_tree.xpath(".//tei:item[@xml:id]", namespaces=NS)}
    reader_lines = {}
    for item in variants_tree.xpath(".//tei:item[@xml:id]", namespaces=NS):
        native_id = item.get(f"{{{XML}}}id")
        for ordinal, reference in enumerate(item.findall("./tei:persName", namespaces=NS), 1):
            reader_lines[(native_id, ordinal)] = reference.sourceline
    records: dict[str | None, list[dict[str, object]]] = defaultdict(list)
    for row in conn.execute(
        "SELECT va.native_id FROM variant_assertion va "
        "JOIN source_record sr ON sr.record_id=va.source_record_id "
        "JOIN source_artifact sa ON sa.artifact_id=sr.artifact_id "
        "WHERE sa.snapshot_id='corpus-coranicum-tei' ORDER BY va.native_id"):
        line = source_lines.get(row["native_id"])
        if line is None:
            raise ValueError(f"Variant record lacks source line: {row['native_id']}")
    for row in conn.execute(
        "SELECT va.native_id, vr.ordinal, vr.reader_native_key, vr.exact_source_label "
        "FROM variant_reader_reference vr JOIN variant_assertion va ON va.assertion_id=vr.assertion_id "
        "ORDER BY va.native_id, vr.ordinal"):
        variant_id = row["native_id"]
        line = source_lines.get(variant_id)
        reference_line = reader_lines.get((variant_id, row["ordinal"]))
        if line is None or reference_line is None:
            raise ValueError(f"TEI-listed label lacks source line: {variant_id}#{row['ordinal']}")
        records[row["reader_native_key"]].append({
            "variantId": variant_id,
            "line": line,
            "labelOrdinal": row["ordinal"],
            "exactLabel": row["exact_source_label"],
            "labelLine": reference_line,
            "labelSourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{source_path}#L{reference_line}",
        })
    for row in conn.execute(
        "SELECT va.native_id FROM variant_assertion va "
        "LEFT JOIN variant_reader_reference vr ON vr.assertion_id=va.assertion_id "
        "WHERE vr.assertion_id IS NULL ORDER BY va.native_id"):
        variant_id = row["native_id"]
        line = source_lines.get(variant_id)
        if line is None:
            raise ValueError(f"Variant record lacks source line: {variant_id}")
        records[None].append({"variantId": variant_id, "line": line, "labelOrdinal": None,
                              "exactLabel": None, "labelLine": None, "labelSourceUrl": None})
    source_total = conn.execute("SELECT COUNT(*) FROM variant_assertion").fetchone()[0]
    source_label_count = sum(member["labelOrdinal"] is not None
                             for members in records.values() for member in members)
    if source_total != 18000 or source_label_count != 30112:
        raise ValueError(f"Expected 18,000 records and 30,112 TEI-listed labels; found {source_total}/{source_label_count}")

    reader_tree = etree.parse(str(authority_file), etree.XMLParser(resolve_entities=False, no_network=True))
    authorities = {}
    for person in reader_tree.xpath(".//tei:person[@xml:id]", namespaces=NS):
        key = person.get(f"{{{XML}}}id")
        name = person.find("./tei:name[@type='display']", namespaces=NS)
        if name is None:
            name = person.find("./tei:name[@type='main']", namespaces=NS)
        authorities[key] = {
            "nativeKey": key,
            "exactLabel": exact_text(name) if name is not None else "",
            "line": person.sourceline,
        }

    rows = []
    for raw_key, members in sorted(records.items(), key=lambda item: (item[0] is not None, item[0] or "")):
        authority_key = None
        if raw_key and raw_key.startswith("variantreader_"):
            authority_key = raw_key.replace("variantreader_", "variantsreader_", 1)
        elif raw_key:
            authority_key = raw_key
        authority = authorities.get(authority_key) if authority_key else None
        rows.append({
            "readerNativeKey": raw_key,
            "readerAuthority": ({
                **authority,
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{authority_path}#L{authority['line']}",
            } if authority else None),
            "recordCount": len({member["variantId"] for member in members}),
            "sourceLabelEntryCount": sum(member["labelOrdinal"] is not None for member in members),
            "variantRecords": members,
        })

    result = {
        "dataset": "Corpus Coranicum source-listed variant labels and member records",
        "schemaVersion": "2",
        "analysisVersion": "variant-persName-key-count/2.0.0",
        "sourceRepository": REPOSITORY,
        "sourceCommit": COMMIT,
        "sourceLicense": "CC BY-SA 4.0",
        "attribution": "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg Academy of Sciences and Humanities. https://github.com/telota/corpus-coranicum-tei.",
        "sourceFile": source_path,
        "sourceFileSha256": source_hash[0],
        "inputReleaseSha256": sha256(args.release_db),
        "selection": {"records": "all 18,000 variant_assertion records and every direct persName child in the pinned allvariants.xml", "filter": None},
        "operation": "Group exact direct persName/@key values without normalization; retain each exact label and source line, count distinct member variant records separately from label entries, and list records with no persName under a null-key group.",
        "interpretationLimit": "These counts describe source-listed keys and records in this TEI export. Labels may be descriptive rather than personal names; counts are not historical reading frequency, attestation strength, or transmitter reliability.",
        "recordCount": source_total,
        "sourceLabelEntryCount": source_label_count,
        "groupCount": len(rows),
        "authorityAlias": "variantreader_<suffix> -> variantsreader_<suffix>; original key retained; unmatched key stays unlinked.",
        "rows": rows,
    }
    result["resultSha256"] = hashlib.sha256(canonical_json(result)).hexdigest()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.out), "recordCount": source_total,
                      "sourceLabelEntryCount": source_label_count,
                      "groupCount": len(rows), "rowsWithAuthority": sum(row["readerAuthority"] is not None for row in rows),
                      "rowsWithoutAuthority": sum(row["readerAuthority"] is None for row in rows),
                      "bytes": args.out.stat().st_size, "sha256": sha256(args.out),
                      "analysisResultSha256": result["resultSha256"]}, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
