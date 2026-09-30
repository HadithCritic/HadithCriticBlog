#!/usr/bin/env python3
"""Build a source-faithful hierarchy for Corpus Coranicum's intertext taxonomy."""

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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
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
        raise ValueError(f"Source file hash does not match release manifest: {RELATIVE}")

    tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
    taxonomy = tree.xpath("/tei:TEI/tei:teiHeader/tei:encodingDesc/tei:classDecl/tei:taxonomy",
                          namespaces=NS)
    if len(taxonomy) != 1:
        raise ValueError(f"Expected exactly one TEI taxonomy; found {len(taxonomy)}")
    taxonomy_element = taxonomy[0]
    categories: list[dict[str, object]] = []
    seen_ids: set[str] = set()

    def visit(parent: etree._Element, parent_id: str | None, depth: int) -> None:
        for sibling_order, element in enumerate(parent.findall("./tei:category", NS), 1):
            native_id = element.get(f"{{{XML}}}id")
            if native_id and native_id in seen_ids:
                raise ValueError(f"Duplicate taxonomy xml:id: {native_id}")
            if native_id:
                seen_ids.add(native_id)
            category = {
                "nativeId": native_id,
                "parentNativeId": parent_id,
                "depth": depth,
                "siblingOrder": sibling_order,
                "attributes": [
                    {"expandedName": name, "exactValue": value}
                    for name, value in sorted(element.attrib.items())
                ],
                "elementPath": tree.getpath(element),
                "line": element.sourceline,
                "locator": f"{RELATIVE}#xml:id={native_id}" if native_id else f"{RELATIVE}#category[{len(categories) + 1}]",
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{element.sourceline}",
                "descriptions": [],
            }
            for desc in element.findall("./tei:catDesc", NS):
                line = desc.sourceline
                desc_path = tree.getpath(desc)
                category["descriptions"].append({
                    "exactText": exact_text(desc),
                    "attributes": [
                        {"expandedName": name, "exactValue": value}
                        for name, value in sorted(desc.attrib.items())
                    ],
                    "elementName": etree.QName(desc).localname,
                    "elementPath": desc_path,
                    "line": line,
                    "locator": f"{RELATIVE}#xml:id={native_id};element={desc_path}" if native_id
                               else f"{RELATIVE}#category[{len(categories) + 1}];element={desc_path}",
                    "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{line}",
                })
            categories.append(category)
            visit(element, native_id, depth + 1)

    visit(taxonomy_element, taxonomy_element.get(f"{{{XML}}}id"), 1)
    metadata_values = {}
    for key, xpath in (
        ("title", "/tei:TEI/tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title"),
        ("publisher", "/tei:TEI/tei:teiHeader/tei:fileDesc/tei:publicationStmt/tei:publisher"),
    ):
        elements = tree.xpath(xpath, namespaces=NS)
        metadata_values[key] = [{
            "exactText": exact_text(element),
            "elementPath": tree.getpath(element),
            "line": element.sourceline,
            "locator": f"{RELATIVE}#element={tree.getpath(element)}",
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{element.sourceline}",
        } for element in elements]

    intertext_files = sorted((args.tei / "data/quran_intertexts").rglob("*.xml"))
    explicit_record_category_refs = 0
    for intertext_path in intertext_files:
        if intertext_path.name == "categories.xml":
            continue
        intertext_tree = etree.parse(str(intertext_path), etree.XMLParser(resolve_entities=False, no_network=True))
        explicit_record_category_refs += len(intertext_tree.xpath(".//tei:catRef", namespaces=NS))
    payload = {
        "dataset": "Corpus Coranicum intertext category taxonomy",
        "schemaVersion": "1",
        "dataVersion": f"cc-{COMMIT[:12]}-intertext-taxonomy-v1",
        "categoryCount": len(categories),
        "topLevelCategoryCount": len(taxonomy_element.findall("./tei:category", NS)),
        "sourceFile": {
            "repository": REPOSITORY,
            "commit": COMMIT,
            "path": RELATIVE,
            "sha256": digest,
            "url": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}",
            "taxonomyId": taxonomy_element.get(f"{{{XML}}}id"),
        },
        "sourceCommit": COMMIT,
        "sourceRepository": REPOSITORY,
        "sourceLicense": LICENSE,
        "attribution": "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg Academy of Sciences and Humanities.",
        "modificationNotice": (
            "Indexes the source taxonomy category hierarchy in document order. Category IDs, parent-child "
            "structure, attributes, category descriptions, paths, lines, and source file hash are retained. "
            "No category is assigned to an intertext record unless an explicit source link exists."
        ),
        "explicitRecordCategoryReferenceCount": explicit_record_category_refs,
        "metadata": metadata_values,
        "categories": categories,
    }
    if len(categories) != 122 or explicit_record_category_refs != 0:
        raise ValueError(f"Unexpected taxonomy/reference coverage: {len(categories)} categories, "
                         f"{explicit_record_category_refs} intertext catRef entries")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.out), "categoryCount": len(categories),
                      "topLevelCategoryCount": payload["topLevelCategoryCount"],
                      "explicitRecordCategoryReferenceCount": explicit_record_category_refs,
                      "bytes": args.out.stat().st_size, "sha256": sha256(args.out)}, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
