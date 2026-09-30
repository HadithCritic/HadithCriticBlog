#!/usr/bin/env python3
"""Independently compare the public manuscript index with pinned source TEI."""

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
NS = {"tei": "http://www.tei-c.org/ns/1.0", "xml": XML}
FIELD_SPECS = (
    ("identifierText", "./tei:msIdentifier/tei:idno"),
    ("repositoryText", "./tei:msIdentifier/tei:repository"),
    ("dateText", "./tei:history/tei:origin/tei:origDate"),
    ("supportText", "./tei:physDesc/tei:objectDesc/tei:supportDesc"),
    ("handText", "./tei:physDesc/tei:handDesc"),
    ("provenanceText", "./tei:history/tei:provenance"),
    ("contentsSummary", "./tei:msContents/tei:summary"),
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


def expected_elements(desc: etree._Element, tree: etree._ElementTree, relative: str,
                      record_locator: str) -> list[dict]:
    elements = []
    for element in (desc, *desc.iterdescendants()):
        element_path = tree.getpath(element)
        line = element.sourceline
        elements.append({
            "elementName": etree.QName(element).localname,
            "nativeId": element.get(f"{{{XML}}}id"),
            "exactText": exact_text(element),
            "xmlLangExact": element.get(f"{{{XML}}}lang"),
            "attributes": [
                {"expandedName": name, "exactValue": value}
                for name, value in sorted(element.attrib.items())
            ],
            "locator": f"{record_locator};element={element_path}",
            "elementPath": element_path,
            "line": line,
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
        })
    return elements


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--index", type=Path, required=True)
    parser.add_argument("--elements-dir", type=Path,
                        help="Directory containing catalog-referenced manuscript element shards (defaults to --index parent)")
    args = parser.parse_args()
    conn = sqlite3.connect(args.release_db)
    conn.row_factory = sqlite3.Row
    metadata = dict(conn.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT:
        raise ValueError("release database does not use the verifier's pinned commit")
    expected_hashes = dict(conn.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    data = json.loads(args.index.read_text(encoding="utf-8"))
    elements_dir = args.elements_dir or args.index.parent
    errors = Counter()
    checked_fields = 0
    checked_elements = 0
    element_text_bytes = 0
    element_name_counts: Counter[str] = Counter()
    seen: set[str] = set()
    tree_cache: dict[str, etree._ElementTree] = {}
    listed_shards = {row.get("path"): row for row in data.get("elementShards", [])}
    shard_records: dict[str, tuple[dict, str]] = {}
    shard_record_total = 0
    shard_element_total = 0
    for shard_name, shard_meta in listed_shards.items():
        if not shard_name or Path(shard_name).name != shard_name:
            errors["unsafe_element_shard_path"] += 1
            continue
        shard_path = elements_dir / shard_name
        if (not shard_path.is_file() or shard_path.stat().st_size != shard_meta.get("bytes")
                or sha256(shard_path) != shard_meta.get("sha256")):
            errors["element_shard_hash_or_size"] += 1
            continue
        shard = json.loads(shard_path.read_text(encoding="utf-8"))
        if (shard.get("sourceCommit") != COMMIT or shard.get("sourceLicense") != "CC BY-SA 4.0"
                or not isinstance(shard.get("shardIndex"), int) or shard.get("shardIndex") < 1):
            errors["element_shard_provenance"] += 1
        rows = shard.get("records", [])
        shard_record_total += len(rows)
        if len(rows) != shard_meta.get("recordCount"):
            errors["element_shard_record_count"] += 1
        shard_element_count = 0
        for row in rows:
            locator = row.get("recordLocator", "")
            if not locator or locator in shard_records:
                errors["element_record_locator_duplicate_or_missing"] += 1
            shard_records[locator] = (row, shard_name)
            elements = row.get("elements", [])
            shard_element_count += len(elements)
            shard_element_total += len(elements)
            if len(elements) != row.get("elementCount"):
                errors["element_record_count"] += 1
        if shard_element_count != shard_meta.get("elementCount"):
            errors["element_shard_element_count"] += 1
    if (shard_record_total != data.get("recordCount")
            or shard_element_total != data.get("sourceElementCount")
            or len(listed_shards) != data.get("elementShardCount", len(listed_shards))):
        errors["element_shard_aggregate_count"] += 1
    for record in data.get("records", []):
        source = record.get("source", {})
        relative = source.get("file", "")
        path = args.tei / relative
        if expected_hashes.get(relative) != source.get("sha256") or not path.is_file() or sha256(path) != expected_hashes.get(relative):
            errors["source_file_hash"] += 1
            continue
        tree = tree_cache.get(relative)
        if tree is None:
            tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
            tree_cache[relative] = tree
        descriptions = tree.xpath(".//tei:msDesc", namespaces=NS)
        native_id = record.get("nativeId")
        desc = next((element for element in descriptions
                     if element.sourceline == source.get("line")), None)
        if desc is None or record.get("source", {}).get("line") != desc.sourceline:
            errors["record_id_or_line"] += 1
            continue
        if native_id:
            source_id = desc.get(f"{{{XML}}}id")
            if native_id != source_id:
                errors["native_id"] += 1
            if native_id in seen:
                errors["duplicate_native_id"] += 1
            seen.add(native_id)
        ordinal = descriptions.index(desc) + 1
        expected_locator = f"{relative}#xml:id={native_id}" if native_id else f"{relative}#msDesc[{ordinal}]"
        if record.get("recordLocator") != expected_locator:
            errors["record_locator"] += 1
        if source.get("url") != f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{desc.sourceline}":
            errors["record_url"] += 1
        for key, xpath in FIELD_SPECS:
            stored_values = record.get("fields", {}).get(key, {}).get("values", [])
            source_values = desc.xpath(xpath, namespaces=NS)
            if len(stored_values) != len(source_values):
                errors["field_count"] += 1
                continue
            for stored, element in zip(stored_values, source_values):
                checked_fields += 1
                expected_attributes = []
                for name, value in sorted(element.attrib.items()):
                    qname = etree.QName(name)
                    attr_name = f"xml:{qname.localname}" if qname.namespace == XML else qname.localname
                    expected_attributes.append({"name": attr_name, "expandedName": name, "exactValue": value})
                element_path = tree.getpath(element)
                checks = {
                    "exactText": exact_text(element),
                    "attributes": expected_attributes,
                    "elementName": etree.QName(element).localname,
                    "elementPath": element_path,
                    "line": element.sourceline,
                    "locator": f"{expected_locator};element={element_path}",
                    "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{element.sourceline}",
                }
                for field, expected in checks.items():
                    if stored.get(field) != expected:
                        errors[f"field_{field}"] += 1
        found = shard_records.get(expected_locator)
        if found is None:
            errors["missing_complete_element_record"] += 1
        else:
            element_row, element_shard_name = found
            expected_element_rows = expected_elements(desc, tree, relative, expected_locator)
            actual_element_rows = element_row.get("elements", [])
            if actual_element_rows != expected_element_rows:
                errors["complete_element_content"] += 1
                errors["complete_element_count_mismatch"] += abs(len(actual_element_rows) - len(expected_element_rows))
            if (record.get("elementShard") != element_shard_name
                    or record.get("elementShard") not in listed_shards
                    or element_row.get("sourceFile") != relative
                    or element_row.get("sourceFileSha256") != source.get("sha256")
                    or element_row.get("elementCount") != len(expected_element_rows)):
                errors["complete_element_identity"] += 1
            checked_elements += len(actual_element_rows)
            for element_record in expected_element_rows:
                element_text_bytes += len(element_record["exactText"].encode("utf-8"))
                element_name_counts[element_record["elementName"]] += 1
    summary = {
        "records_in_index": len(data.get("records", [])),
        "source_files_expected": len({r.get("source", {}).get("file") for r in data.get("records", [])}),
        "unique_native_ids": len(seen),
        "records_without_native_id": sum(not row.get("nativeId") for row in data.get("records", [])),
        "field_elements_checked": checked_fields,
        "source_elements_checked": checked_elements,
        "source_element_text_utf8_bytes": element_text_bytes,
        "source_element_name_counts": dict(sorted(element_name_counts.items())),
        "mismatches": dict(sorted(errors.items())),
    }
    print(json.dumps(summary, ensure_ascii=True, indent=2))
    valid = (summary["records_in_index"] == 2322
             and summary["records_without_native_id"] == 2322
             and checked_fields > 0 and checked_elements == data.get("sourceElementCount")
             and element_text_bytes == data.get("sourceElementTextUtf8Bytes")
             and dict(sorted(element_name_counts.items())) == data.get("sourceElementNameCounts")
             and not errors)
    return 0 if valid else 1


if __name__ == "__main__":
    sys.exit(main())
