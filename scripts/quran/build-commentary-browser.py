#!/usr/bin/env python3
"""Build source-anchored, per-file search shards for CC commentary TEI."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import sys
from collections import Counter
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
XML = "http://www.w3.org/XML/1998/namespace"
TEI_NS = "http://www.tei-c.org/ns/1.0"
NS = {"tei": TEI_NS}
BLOCK_TAGS = ("ab", "bibl", "cell", "head", "l", "label", "item", "p", "title")
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
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()

    head = __import__("subprocess").run(
        ["git", "-C", str(args.tei), "rev-parse", "HEAD"],
        text=True, capture_output=True, check=True,
    ).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned TEI commit {COMMIT}; found {head}")
    connection = sqlite3.connect(args.release_db)
    metadata = dict(connection.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != "CC BY-SA 4.0":
        raise ValueError("release metadata does not match the pinned licensed TEI source")
    expected_hashes = dict(connection.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))

    source_root = args.tei / "data/quran_commentary"
    xml_files = sorted(source_root.rglob("*.xml"))
    if len(xml_files) != 85:
        raise ValueError(f"Expected 85 commentary source files; found {len(xml_files)}")

    args.out_dir.mkdir(parents=True, exist_ok=True)
    file_assets = []
    block_counts: Counter[str] = Counter()
    body_element_counts: Counter[str] = Counter()
    nonindexed_element_counts: Counter[str] = Counter()
    source_element_counts: Counter[str] = Counter()
    header_element_counts: Counter[str] = Counter()
    total_bytes = 0
    source_element_bytes = 0
    record_count = 0
    source_element_count = 0
    header_element_count = 0
    header_element_bytes = 0
    omitted_blank = 0
    for source_file in xml_files:
        relative = source_file.relative_to(args.tei).as_posix()
        expected_hash = expected_hashes.get(relative)
        if expected_hash is None or sha256(source_file) != expected_hash:
            raise ValueError(f"Source file hash does not match the release manifest: {relative}")
        tree = etree.parse(str(source_file), etree.XMLParser(resolve_entities=False, no_network=True))
        records = []
        source_elements = []
        header_elements = []
        for header_element in tree.xpath(".//tei:teiHeader | .//tei:teiHeader//*", namespaces=NS):
            text = exact_text(header_element)
            element_name = etree.QName(header_element).localname
            element_path = tree.getpath(header_element)
            line = header_element.sourceline
            native_id = header_element.get(f"{{{XML}}}id")
            locator = (f"{relative}#xml:id={native_id};element={element_path}"
                       if native_id else f"{relative}#element={element_path}")
            header_elements.append({
                "elementName": element_name,
                "nativeId": native_id,
                "exactText": text,
                "xmlLangExact": header_element.get(f"{{{XML}}}lang"),
                "attributes": [
                    {"expandedName": name, "exactValue": exact}
                    for name, exact in sorted(header_element.attrib.items())
                ],
                "locator": locator,
                "elementPath": element_path,
                "line": line,
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
            })
            header_element_counts[element_name] += 1
            header_element_bytes += len(text.encode("utf-8"))
        for body_element in tree.xpath(".//tei:text/tei:body//*", namespaces=NS):
            text = exact_text(body_element)
            element_name = etree.QName(body_element).localname
            element_path = tree.getpath(body_element)
            line = body_element.sourceline
            native_id = body_element.get(f"{{{XML}}}id")
            locator = (f"{relative}#xml:id={native_id};element={element_path}"
                       if native_id else f"{relative}#element={element_path}")
            source_elements.append({
                "elementName": element_name,
                "nativeId": native_id,
                "exactText": text,
                "xmlLangExact": body_element.get(f"{{{XML}}}lang"),
                "attributes": [
                    {"expandedName": name, "exactValue": exact}
                    for name, exact in sorted(body_element.attrib.items())
                ],
                "locator": locator,
                "elementPath": element_path,
                "line": line,
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
            })
            source_element_counts[element_name] += 1
            source_element_bytes += len(text.encode("utf-8"))
            if text.strip():
                body_element_counts[element_name] += 1
                if element_name not in BLOCK_TAGS:
                    nonindexed_element_counts[element_name] += 1
        for element in tree.xpath(".//tei:text/tei:body//*[self::tei:ab or self::tei:bibl or self::tei:cell or self::tei:head or self::tei:l or self::tei:label or self::tei:item or self::tei:p or self::tei:title]", namespaces=NS):
            value = exact_text(element)
            if not value.strip():
                omitted_blank += 1
                continue
            qname = etree.QName(element)
            element_path = tree.getpath(element)
            line = element.sourceline
            native_id = element.get(f"{{{XML}}}id")
            locator = (f"{relative}#xml:id={native_id};element={element_path}"
                       if native_id else f"{relative}#element={element_path}")
            record = {
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
            }
            records.append(record)
            block_counts[qname.localname] += 1
            total_bytes += len(value.encode("utf-8"))
        records.sort(key=lambda row: (row["line"] or 0, row["elementPath"]))
        file_payload = {
            "schemaVersion": "1",
            "sourceCommit": COMMIT,
            "sourceLicense": "CC BY-SA 4.0",
            "sourceFile": relative,
            "sourceFileSha256": expected_hash,
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}",
            "recordCount": len(records),
            "records": records,
            "sourceElementCount": len(source_elements),
            "sourceElements": source_elements,
            "headerElementCount": len(header_elements),
            "headerElements": header_elements,
        }
        safe_name = re.sub(r"[^a-zA-Z0-9_-]", "-", source_file.stem)
        name = f"commentary-{safe_name}.json"
        output = args.out_dir / name
        encoded = json.dumps(file_payload, ensure_ascii=False, separators=(",", ":")) + "\n"
        output.write_text(encoded, encoding="utf-8")
        file_assets.append({
            "sourceFile": relative,
            "sourceFileSha256": expected_hash,
            "path": name,
            "bytes": output.stat().st_size,
            "sha256": sha256(output),
            "recordCount": len(records),
            "sourceElementCount": len(source_elements),
            "headerElementCount": len(header_elements),
            "headerElementNameCounts": dict(sorted(Counter(row["elementName"] for row in header_elements).items())),
            "headerElementTextUtf8Bytes": sum(len(row["exactText"].encode("utf-8")) for row in header_elements),
            "sourceElementTextUtf8Bytes": sum(len(row["exactText"].encode("utf-8")) for row in source_elements),
            "sourceElementNameCounts": dict(sorted(Counter(row["elementName"] for row in source_elements).items())),
        })
        record_count += len(records)
        source_element_count += len(source_elements)
        header_element_count += len(header_elements)

    manifest = {
        "dataset": "Corpus Coranicum commentary source elements and text blocks",
        "schemaVersion": "3",
        "dataVersion": f"cc-{COMMIT[:12]}-commentary-elements-v3",
        "sourceRepository": REPOSITORY,
        "sourceCommit": COMMIT,
        "sourceLicense": "CC BY-SA 4.0",
        "attribution": ATTRIBUTION,
        "modificationNotice": (
            "Preserves every TEI element below text/body and every element in teiHeader "
            "(including the teiHeader element) in source order with its exact "
            "descendant character data (including empty/whitespace-only values), direct "
            "xml:lang, all direct attributes, source file hash, XPath, and source line. "
            "Also exposes a separate searchable text-block scope limited to non-empty "
            "ab, bibl, cell, head, l, label, item, p, and title elements. Ancestor and "
            "descendant element values may repeat the same source characters; records "
            "remain separate and are never merged. This is not a critical edition or "
            "translation alignment."
        ),
        "scope": "All XML files under data/quran_commentary; all teiHeader elements, all text/body descendant elements, plus a separate selected text-block index",
        "recordCount": record_count,
        "sourceFileCount": len(file_assets),
        "exactTextUtf8Bytes": total_bytes,
        "sourceElementCount": source_element_count,
        "sourceElementTextUtf8Bytes": source_element_bytes,
        "headerElementCount": header_element_count,
        "headerElementTextUtf8Bytes": header_element_bytes,
        "headerElementNameCounts": dict(sorted(header_element_counts.items())),
        "headerElementNames": sorted(header_element_counts),
        "sourceElementNameCounts": dict(sorted(source_element_counts.items())),
        "omittedWhitespaceOnlyElements": omitted_blank,
        "indexedElementCounts": dict(sorted(block_counts.items())),
        "nonEmptyBodyElementCountsIncludingNestedText": dict(sorted(body_element_counts.items())),
        "nonEmptyNonIndexedBodyElementCounts": dict(sorted(nonindexed_element_counts.items())),
        "indexedElementNames": list(BLOCK_TAGS),
        "sourceElementNames": sorted(source_element_counts),
        "assets": file_assets,
    }
    manifest_path = args.out_dir / "commentary-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({
        "manifest": str(manifest_path),
        "sourceFiles": len(file_assets),
        "records": record_count,
        "exactTextUtf8Bytes": total_bytes,
        "sourceElements": source_element_count,
        "sourceElementTextUtf8Bytes": source_element_bytes,
        "headerElements": header_element_count,
        "headerElementTextUtf8Bytes": header_element_bytes,
        "elementCounts": dict(sorted(block_counts.items())),
        "largestShardBytes": max(asset["bytes"] for asset in file_assets),
        "manifestSha256": sha256(manifest_path),
    }, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
