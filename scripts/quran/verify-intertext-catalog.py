#!/usr/bin/env python3
"""Reconstruct every indexed intertext field from the pinned Corpus Coranicum TEI."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from collections import Counter
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
XML = "http://www.w3.org/XML/1998/namespace"
NS = {"tei": "http://www.tei-c.org/ns/1.0"}
FIELD_SPECS = (
    ("sourceDocumentTitle", "/tei:TEI/tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title"),
    ("repository", "./tei:msIdentifier/tei:repository"),
    ("identifier", "./tei:msIdentifier/tei:idno"),
    ("summary", "./tei:msContents/tei:summary"),
    ("workTitle", "./tei:msContents/tei:msItem/tei:title"),
    ("workAuthor", "./tei:msContents/tei:msItem/tei:author"),
    ("textLanguage", "./tei:msContents/tei:msItem/tei:textLang"),
    ("originDate", "./tei:history/tei:origin/tei:origDate"),
    ("originPlace", "./tei:history/tei:origin/tei:origPlace"),
    ("bibliography", "./tei:additional/tei:listBibl/tei:bibl"),
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
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--index", type=Path, required=True)
    args = parser.parse_args()
    conn = sqlite3.connect(args.release_db)
    metadata = dict(conn.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT:
        raise ValueError("release database does not use the verifier's pinned commit")
    expected_hashes = dict(conn.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    data = json.loads(args.index.read_text(encoding="utf-8"))
    errors: Counter[str] = Counter()
    checked = 0
    field_counts: Counter[str] = Counter()
    seen_ids: set[str] = set()
    tree_cache: dict[str, etree._ElementTree] = {}
    records = data.get("records", [])
    for record in records:
        source = record.get("source", {})
        relative = source.get("file", "")
        path = args.tei / relative
        digest = expected_hashes.get(relative)
        if not path.is_file() or not digest or sha256(path) != digest or source.get("sha256") != digest:
            errors["source_file_hash"] += 1
            continue
        tree = tree_cache.get(relative)
        if tree is None:
            tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
            tree_cache[relative] = tree
        descs = tree.xpath(".//tei:msDesc", namespaces=NS)
        desc = next((element for element in descs if element.sourceline == source.get("line")), None)
        if desc is None:
            errors["record_line"] += 1
            continue
        native_id = desc.get(f"{{{XML}}}id")
        if record.get("nativeId") != native_id:
            errors["native_id"] += 1
        if native_id:
            if native_id in seen_ids:
                errors["duplicate_native_id"] += 1
            seen_ids.add(native_id)
        ordinal = descs.index(desc) + 1
        expected_record_locator = f"{relative}#xml:id={native_id}" if native_id else f"{relative}#msDesc[{ordinal}]"
        if record.get("recordLocator") != expected_record_locator:
            errors["record_locator"] += 1
        if source.get("url") != f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{desc.sourceline}":
            errors["record_url"] += 1
        for key, xpath in FIELD_SPECS:
            context = tree if key == "sourceDocumentTitle" else desc
            elements = context.xpath(xpath, namespaces=NS)
            values = record.get("fields", {}).get(key, {}).get("values", [])
            if len(elements) != len(values):
                errors["field_count"] += 1
                continue
            field_counts[key] += len(elements)
            for stored, element in zip(values, elements):
                checked += 1
                element_path = tree.getpath(element)
                if key == "sourceDocumentTitle":
                    locator = f"{relative}#element={element_path}"
                elif native_id:
                    locator = f"{relative}#xml:id={native_id};element={element_path}"
                else:
                    locator = f"{relative}#msDesc[{ordinal}];element={element_path}"
                expected = {
                    "exactText": exact_text(element),
                    "attributes": [{"expandedName": name, "exactValue": value}
                                   for name, value in sorted(element.attrib.items())],
                    "elementName": etree.QName(element).localname,
                    "elementPath": element_path,
                    "line": element.sourceline,
                    "locator": locator,
                    "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{element.sourceline}",
                }
                for key_name, expected_value in expected.items():
                    if stored.get(key_name) != expected_value:
                        errors[f"field_{key_name}"] += 1

    expected_files = list((args.tei / "data/quran_intertexts").rglob("*.xml"))
    source_file_names = {row.get("source", {}).get("file") for row in records}
    summary = {
        "records": len(records),
        "sourceFilesWithRecords": len(source_file_names),
        "xmlFilesInCollection": len(expected_files),
        "nativeIds": len(seen_ids),
        "fieldElementsChecked": checked,
        "fieldCounts": dict(sorted(field_counts.items())),
        "errors": dict(sorted(errors.items())),
    }
    if (len(records) != 713 or data.get("recordCount") != 713
            or data.get("sourceFileCount") != 714 or data.get("recordSourceFileCount") != len(source_file_names)
            or len(expected_files) != 714 or not source_file_names):
        errors["coverage"] += 1
    if data.get("fieldElementCounts") != dict(sorted(field_counts.items())):
        errors["field_count_metadata"] += 1
    summary["errors"] = dict(sorted(errors.items()))
    print(json.dumps(summary, ensure_ascii=True, indent=2))
    return 0 if not errors and checked > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
