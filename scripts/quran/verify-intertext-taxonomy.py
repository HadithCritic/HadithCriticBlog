#!/usr/bin/env python3
"""Independently reconstruct taxonomy entries from the pinned source TEI."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import subprocess
import sys
from collections import Counter
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
LICENSE = "CC BY-SA 4.0"
XML = "http://www.w3.org/XML/1998/namespace"
NS = {"tei": "http://www.tei-c.org/ns/1.0"}
RELATIVE = "data/quran_intertexts/categories.xml"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def exact_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def reconstruct(tree: etree._ElementTree) -> tuple[list[dict[str, object]], int, str | None]:
    taxonomy = tree.xpath("/tei:TEI/tei:teiHeader/tei:encodingDesc/tei:classDecl/tei:taxonomy",
                          namespaces=NS)
    if len(taxonomy) != 1:
        raise ValueError("source must contain exactly one taxonomy")
    taxonomy_element = taxonomy[0]
    categories: list[dict[str, object]] = []

    def visit(parent: etree._Element, parent_id: str | None, depth: int) -> None:
        for sibling_order, element in enumerate(parent.findall("./tei:category", NS), 1):
            native_id = element.get(f"{{{XML}}}id")
            row: dict[str, object] = {
                "nativeId": native_id,
                "parentNativeId": parent_id,
                "depth": depth,
                "siblingOrder": sibling_order,
                "attributes": [{"expandedName": key, "exactValue": value}
                               for key, value in sorted(element.attrib.items())],
                "elementPath": tree.getpath(element),
                "line": element.sourceline,
                "locator": f"{RELATIVE}#xml:id={native_id}" if native_id else f"{RELATIVE}#category[{len(categories) + 1}]",
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{element.sourceline}",
                "descriptions": [],
            }
            for desc in element.findall("./tei:catDesc", NS):
                path = tree.getpath(desc)
                line = desc.sourceline
                row["descriptions"].append({
                    "exactText": exact_text(desc),
                    "attributes": [{"expandedName": key, "exactValue": value}
                                   for key, value in sorted(desc.attrib.items())],
                    "elementName": etree.QName(desc).localname,
                    "elementPath": path,
                    "line": line,
                    "locator": f"{RELATIVE}#xml:id={native_id};element={path}" if native_id
                               else f"{RELATIVE}#category[{len(categories) + 1}];element={path}",
                    "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{line}",
                })
            categories.append(row)
            visit(element, native_id, depth + 1)

    visit(taxonomy_element, taxonomy_element.get(f"{{{XML}}}id"), 1)
    return categories, len(taxonomy_element.findall("./tei:category", NS)), taxonomy_element.get(f"{{{XML}}}id")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--index", type=Path, required=True)
    args = parser.parse_args()
    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"],
                          text=True, capture_output=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned TEI commit {COMMIT}; found {head}")
    conn = sqlite3.connect(args.release_db)
    metadata = dict(conn.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != LICENSE:
        raise ValueError("release metadata does not match pinned licensed Corpus Coranicum source")
    hashes = dict(conn.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    path = args.tei / RELATIVE
    digest = hashes.get(RELATIVE)
    if digest is None or sha256(path) != digest:
        raise ValueError("categories.xml source hash differs from the audited snapshot")
    tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
    expected, top_level, taxonomy_id = reconstruct(tree)
    data = json.loads(args.index.read_text(encoding="utf-8"))
    errors: Counter[str] = Counter()
    if data.get("categories") != expected:
        actual = data.get("categories", [])
        if len(actual) != len(expected):
            errors["category_count"] += 1
        for i, (want, got) in enumerate(zip(expected, actual)):
            if want != got:
                for key in want:
                    if want.get(key) != got.get(key):
                        errors[f"category_{key}"] += 1
    expected_metadata = {
        "repository": REPOSITORY,
        "commit": COMMIT,
        "path": RELATIVE,
        "sha256": digest,
        "url": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}",
        "taxonomyId": taxonomy_id,
    }
    if data.get("sourceFile") != expected_metadata:
        errors["source_file_metadata"] += 1
    if data.get("categoryCount") != len(expected) or data.get("topLevelCategoryCount") != top_level:
        errors["coverage_metadata"] += 1
    records = sorted((args.tei / "data/quran_intertexts").glob("intertext-*.xml"))
    ref_count = 0
    for intertext_path in records:
        intertext_tree = etree.parse(str(intertext_path), etree.XMLParser(resolve_entities=False, no_network=True))
        ref_count += len(intertext_tree.xpath(".//tei:catRef", namespaces=NS))
    if ref_count != 0 or data.get("explicitRecordCategoryReferenceCount") != ref_count:
        errors["explicit_record_category_refs"] += 1
    if data.get("sourceCommit") != COMMIT or data.get("sourceLicense") != LICENSE:
        errors["provenance"] += 1
    summary = {"categoryCount": len(expected), "topLevelCategoryCount": top_level,
               "categoriesWithNativeId": sum(row["nativeId"] is not None for row in expected),
               "descriptionCount": sum(len(row["descriptions"]) for row in expected),
               "intertextRecordCategoryReferences": ref_count,
               "sourceSha256": digest, "errors": dict(sorted(errors.items()))}
    print(json.dumps(summary, ensure_ascii=True, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
