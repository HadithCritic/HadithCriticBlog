#!/usr/bin/env python3
"""Reconstruct commentary search shards from pinned TEI and compare every field."""

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
XPATH = ".//tei:text/tei:body//*[self::tei:ab or self::tei:bibl or self::tei:cell or self::tei:head or self::tei:l or self::tei:label or self::tei:item or self::tei:p or self::tei:title]"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def source_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def expected_records(tei: Path, relative: str, digest: str) -> list[dict]:
    path = tei / relative
    tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
    records = []
    for element in tree.xpath(XPATH, namespaces=NS):
        value = source_text(element)
        if not value.strip():
            continue
        qname = etree.QName(element)
        element_path = tree.getpath(element)
        line = element.sourceline
        native_id = element.get(f"{{{XML}}}id")
        locator = (f"{relative}#xml:id={native_id};element={element_path}"
                   if native_id else f"{relative}#element={element_path}")
        records.append({
            "elementName": qname.localname,
            "nativeId": native_id,
            "exactText": value,
            "xmlLangExact": element.get(f"{{{XML}}}lang"),
            "attributes": [
                {"expandedName": name, "exactValue": exact}
                for name, exact in sorted(element.attrib.items())
            ],
            "locator": locator,
            "elementPath": element_path,
            "line": line,
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
        })
    records.sort(key=lambda row: (row["line"] or 0, row["elementPath"]))
    return records


def expected_source_elements(tei: Path, relative: str) -> list[dict]:
    path = tei / relative
    tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
    elements = []
    for element in tree.xpath(".//tei:text/tei:body//*", namespaces=NS):
        value = source_text(element)
        element_name = etree.QName(element).localname
        element_path = tree.getpath(element)
        line = element.sourceline
        native_id = element.get(f"{{{XML}}}id")
        locator = (f"{relative}#xml:id={native_id};element={element_path}"
                   if native_id else f"{relative}#element={element_path}")
        elements.append({
            "elementName": element_name,
            "nativeId": native_id,
            "exactText": value,
            "xmlLangExact": element.get(f"{{{XML}}}lang"),
            "attributes": [
                {"expandedName": name, "exactValue": exact}
                for name, exact in sorted(element.attrib.items())
            ],
            "locator": locator,
            "elementPath": element_path,
            "line": line,
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
        })
    return elements


def expected_header_elements(tei: Path, relative: str) -> list[dict]:
    path = tei / relative
    tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
    elements = []
    for element in tree.xpath(".//tei:teiHeader | .//tei:teiHeader//*", namespaces=NS):
        value = source_text(element)
        element_name = etree.QName(element).localname
        element_path = tree.getpath(element)
        line = element.sourceline
        native_id = element.get(f"{{{XML}}}id")
        locator = (f"{relative}#xml:id={native_id};element={element_path}"
                   if native_id else f"{relative}#element={element_path}")
        elements.append({
            "elementName": element_name,
            "nativeId": native_id,
            "exactText": value,
            "xmlLangExact": element.get(f"{{{XML}}}lang"),
            "attributes": [
                {"expandedName": name, "exactValue": exact}
                for name, exact in sorted(element.attrib.items())
            ],
            "locator": locator,
            "elementPath": element_path,
            "line": line,
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
        })
    return elements


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--package-dir", type=Path, required=True)
    args = parser.parse_args()

    connection = sqlite3.connect(args.release_db)
    metadata = dict(connection.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != "CC BY-SA 4.0":
        raise ValueError("release metadata does not match the pinned licensed Corpus Coranicum source")
    expected_hashes = dict(connection.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    manifest_path = args.package_dir / "commentary-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    errors: Counter[str] = Counter()
    if manifest.get("sourceCommit") != COMMIT:
        errors["manifest_source_commit"] += 1
    if manifest.get("sourceLicense") != "CC BY-SA 4.0":
        errors["manifest_license"] += 1
    if manifest.get("schemaVersion") != "3":
        errors["manifest_schema_version"] += 1
    expected_files = sorted((args.tei / "data/quran_commentary").rglob("*.xml"))
    listed_files = {row.get("sourceFile") for row in manifest.get("assets", [])}
    expected_relatives = {path.relative_to(args.tei).as_posix() for path in expected_files}
    if listed_files != expected_relatives:
        errors["source_file_inventory"] += len(listed_files.symmetric_difference(expected_relatives))
    checked_records = 0
    exact_text_bytes = 0
    source_element_text_bytes = 0
    source_element_count = 0
    header_element_count = 0
    header_element_text_bytes = 0
    element_counts: Counter[str] = Counter()
    source_element_counts: Counter[str] = Counter()
    header_element_counts: Counter[str] = Counter()
    body_element_counts: Counter[str] = Counter()
    nonindexed_element_counts: Counter[str] = Counter()
    omitted_blank = 0
    for asset in manifest.get("assets", []):
        relative = asset.get("sourceFile", "")
        source_path = args.tei / relative
        expected_hash = expected_hashes.get(relative)
        if not source_path.is_file() or not expected_hash or sha256(source_path) != expected_hash:
            errors["source_file_hash"] += 1
            continue
        if asset.get("sourceFileSha256") != expected_hash:
            errors["asset_source_hash"] += 1
        shard_name = asset.get("path", "")
        if not shard_name or Path(shard_name).name != shard_name:
            errors["unsafe_shard_path"] += 1
            continue
        shard_path = args.package_dir / shard_name
        if not shard_path.is_file():
            errors["missing_shard"] += 1
            continue
        if shard_path.stat().st_size != asset.get("bytes") or sha256(shard_path) != asset.get("sha256"):
            errors["shard_hash_or_size"] += 1
        shard = json.loads(shard_path.read_text(encoding="utf-8"))
        if shard.get("sourceCommit") != COMMIT or shard.get("sourceLicense") != "CC BY-SA 4.0":
            errors["shard_provenance"] += 1
        if shard.get("sourceFile") != relative or shard.get("sourceFileSha256") != expected_hash:
            errors["shard_source_identity"] += 1
        tree = etree.parse(str(source_path), etree.XMLParser(resolve_entities=False, no_network=True))
        for body_element in tree.xpath(".//tei:text/tei:body//*", namespaces=NS):
            if source_text(body_element).strip():
                element_name = etree.QName(body_element).localname
                body_element_counts[element_name] += 1
                if element_name not in {"ab", "bibl", "cell", "head", "l", "label", "item", "p", "title"}:
                    nonindexed_element_counts[element_name] += 1
            elif etree.QName(body_element).localname in {"ab", "bibl", "cell", "head", "l", "label", "item", "p", "title"}:
                omitted_blank += 1
        expected = expected_records(args.tei, relative, expected_hash)
        actual = shard.get("records", [])
        if actual != expected:
            # Report first mismatch per shard while retaining complete record coverage diagnostics.
            errors["record_content"] += 1
            errors["record_count_mismatch"] += abs(len(actual) - len(expected))
        if len(actual) != asset.get("recordCount") or len(actual) != shard.get("recordCount"):
            errors["record_count_metadata"] += 1
        checked_records += len(actual)
        for row in expected:
            exact_text_bytes += len(row["exactText"].encode("utf-8"))
            element_counts[row["elementName"]] += 1
        expected_elements = expected_source_elements(args.tei, relative)
        actual_elements = shard.get("sourceElements", [])
        if actual_elements != expected_elements:
            errors["source_element_content"] += 1
            errors["source_element_count_mismatch"] += abs(len(actual_elements) - len(expected_elements))
        if len(actual_elements) != asset.get("sourceElementCount") or len(actual_elements) != shard.get("sourceElementCount"):
            errors["source_element_count_metadata"] += 1
        expected_headers = expected_header_elements(args.tei, relative)
        actual_headers = shard.get("headerElements", [])
        if actual_headers != expected_headers:
            errors["header_element_content"] += 1
            errors["header_element_count_mismatch"] += abs(len(actual_headers) - len(expected_headers))
        if (len(actual_headers) != asset.get("headerElementCount")
                or len(actual_headers) != shard.get("headerElementCount")):
            errors["header_element_count_metadata"] += 1
        header_element_count += len(actual_headers)
        for row in expected_headers:
            header_element_text_bytes += len(row["exactText"].encode("utf-8"))
            header_element_counts[row["elementName"]] += 1
        asset_header_counts = Counter({k: int(v) for k, v in asset.get("headerElementNameCounts", {}).items()})
        if asset_header_counts != Counter(row["elementName"] for row in expected_headers):
            errors["header_element_name_counts"] += 1
        source_element_count += len(actual_elements)
        for row in expected_elements:
            source_element_text_bytes += len(row["exactText"].encode("utf-8"))
            source_element_counts[row["elementName"]] += 1
        asset_element_counts = Counter({k: int(v) for k, v in asset.get("sourceElementNameCounts", {}).items()})
        if asset_element_counts != Counter(row["elementName"] for row in expected_elements):
            errors["source_element_name_counts"] += 1

    if manifest.get("recordCount") != checked_records:
        errors["manifest_record_count"] += 1
    if manifest.get("exactTextUtf8Bytes") != exact_text_bytes:
        errors["exact_text_bytes"] += 1
    if manifest.get("sourceElementCount") != source_element_count:
        errors["source_element_count"] += 1
    if manifest.get("sourceElementTextUtf8Bytes") != source_element_text_bytes:
        errors["source_element_text_bytes"] += 1
    if manifest.get("sourceElementNameCounts") != dict(sorted(source_element_counts.items())):
        errors["source_element_name_counts_total"] += 1
    if manifest.get("headerElementCount") != header_element_count:
        errors["header_element_count"] += 1
    if manifest.get("headerElementTextUtf8Bytes") != header_element_text_bytes:
        errors["header_element_text_bytes"] += 1
    if manifest.get("headerElementNameCounts") != dict(sorted(header_element_counts.items())):
        errors["header_element_name_counts_total"] += 1
    if manifest.get("headerElementNames") != sorted(header_element_counts):
        errors["header_element_names"] += 1
    if manifest.get("indexedElementCounts") != dict(sorted(element_counts.items())):
        errors["element_counts"] += 1
    if manifest.get("nonEmptyBodyElementCountsIncludingNestedText") != dict(sorted(body_element_counts.items())):
        errors["body_element_counts"] += 1
    if manifest.get("nonEmptyNonIndexedBodyElementCounts") != dict(sorted(nonindexed_element_counts.items())):
        errors["nonindexed_element_counts"] += 1
    if manifest.get("omittedWhitespaceOnlyElements") != omitted_blank:
        errors["omitted_whitespace_only"] += 1
    summary = {
        "sourceFiles": len(listed_files),
        "sourceFilesExpected": len(expected_files),
        "recordsChecked": checked_records,
        "exactTextUtf8Bytes": exact_text_bytes,
        "sourceElementsChecked": source_element_count,
        "sourceElementTextUtf8Bytes": source_element_text_bytes,
        "headerElementsChecked": header_element_count,
        "headerElementTextUtf8Bytes": header_element_text_bytes,
        "headerElementNameCounts": dict(sorted(header_element_counts.items())),
        "sourceElementNameCounts": dict(sorted(source_element_counts.items())),
        "elementCounts": dict(sorted(element_counts.items())),
        "nonEmptyBodyElementCountIncludingNestedText": sum(body_element_counts.values()),
        "nonEmptyNonIndexedBodyElementCount": sum(nonindexed_element_counts.values()),
        "omittedWhitespaceOnlyElements": omitted_blank,
        "errors": dict(sorted(errors.items())),
    }
    print(json.dumps(summary, ensure_ascii=True, indent=2))
    return 0 if not errors and len(expected_files) == 85 and checked_records > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
