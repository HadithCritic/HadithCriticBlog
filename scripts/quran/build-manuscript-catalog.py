#!/usr/bin/env python3
"""Build a source-anchored index of the pinned CC manuscript TEI records."""

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
TEI_NS = "http://www.tei-c.org/ns/1.0"
ATTRIBUTION = (
    "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg "
    "Academy of Sciences and Humanities. https://github.com/telota/corpus-coranicum-tei."
)
FIELD_SPECS = (
    ("identifierText", "Identifier text", "./tei:msIdentifier/tei:idno"),
    ("repositoryText", "Repository text", "./tei:msIdentifier/tei:repository"),
    ("dateText", "Date statement", "./tei:history/tei:origin/tei:origDate"),
    ("supportText", "Support description", "./tei:physDesc/tei:objectDesc/tei:supportDesc"),
    ("handText", "Hand description", "./tei:physDesc/tei:handDesc"),
    ("provenanceText", "Provenance statement", "./tei:history/tei:provenance"),
    ("contentsSummary", "Contents summary", "./tei:msContents/tei:summary"),
)
NS = {"tei": TEI_NS, "xml": XML}


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
    parser.add_argument("--elements-out-dir", type=Path, required=True)
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
        "SELECT relative_path, sha256 FROM source_artifact "
        "WHERE snapshot_id='corpus-coranicum-tei'"))

    records = []
    field_counts: Counter[str] = Counter()
    all_element_counts: Counter[str] = Counter()
    all_element_text_bytes = 0
    all_element_count = 0
    seen_ids: set[str] = set()
    root = args.tei / "data/quran_manuscripts"
    xml_files = sorted(root.rglob("*.xml"))
    for source_file in xml_files:
        relative = source_file.relative_to(args.tei).as_posix()
        expected = expected_hashes.get(relative)
        if expected is None or sha256(source_file) != expected:
            raise ValueError(f"Source file hash does not match the release manifest: {relative}")
        tree = etree.parse(str(source_file), etree.XMLParser(resolve_entities=False, no_network=True))
        for ordinal, desc in enumerate(tree.xpath(".//tei:msDesc", namespaces=NS), 1):
            native_id = desc.get(f"{{{XML}}}id")
            if native_id:
                if native_id in seen_ids:
                    raise ValueError(f"Duplicate manuscript xml:id in collection: {native_id}")
                seen_ids.add(native_id)
            line = desc.sourceline
            locator = f"{relative}#xml:id={native_id}" if native_id else f"{relative}#msDesc[{ordinal}]"
            record = {
                "nativeId": native_id,
                "recordLocator": locator,
                "source": {
                    "repository": REPOSITORY,
                    "commit": COMMIT,
                    "file": relative,
                    "line": line,
                    "sha256": expected,
                    "url": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
                },
                "fields": {},
            }
            for key, label, xpath in FIELD_SPECS:
                values = []
                for element in desc.xpath(xpath, namespaces=NS):
                    attributes = []
                    for name, value in sorted(element.attrib.items()):
                        qname = etree.QName(name)
                        attr_name = f"xml:{qname.localname}" if qname.namespace == XML else qname.localname
                        attributes.append({"name": attr_name, "expandedName": name, "exactValue": value})
                    values.append({
                        "exactText": exact_text(element),
                        "attributes": attributes,
                        "elementName": etree.QName(element).localname,
                        "elementPath": tree.getpath(element),
                        "line": element.sourceline,
                        "locator": f"{relative}#xml:id={native_id};element={tree.getpath(element)}" if native_id else f"{relative}#msDesc[{ordinal}];element={tree.getpath(element)}",
                        "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{element.sourceline}",
                    })
                record["fields"][key] = {"label": label, "values": values}
                field_counts[key] += len(values)
            source_elements = []
            for element in (desc, *desc.iterdescendants()):
                element_path = tree.getpath(element)
                element_line = element.sourceline
                element_name = etree.QName(element).localname
                element_text = exact_text(element)
                element_locator = f"{locator};element={element_path}"
                source_elements.append({
                    "elementName": element_name,
                    "nativeId": element.get(f"{{{XML}}}id"),
                    "exactText": element_text,
                    "xmlLangExact": element.get(f"{{{XML}}}lang"),
                    "attributes": [
                        {"expandedName": name, "exactValue": value}
                        for name, value in sorted(element.attrib.items())
                    ],
                    "locator": element_locator,
                    "elementPath": element_path,
                    "line": element_line,
                    "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{element_line}",
                })
                all_element_counts[element_name] += 1
                all_element_text_bytes += len(element_text.encode("utf-8"))
            record["elementCount"] = len(source_elements)
            record["_sourceElements"] = source_elements
            all_element_count += len(source_elements)
            records.append(record)

    records.sort(key=lambda row: (row["source"]["file"], row["source"]["line"] or 0))
    if len(records) != 2322:
        raise ValueError(f"Expected 2,322 manuscript descriptions in this pinned collection; found {len(records)}")
    args.elements_out_dir.mkdir(parents=True, exist_ok=True)
    element_shards = []
    # Small shards keep the full record tree lazy-loadable without approaching the
    # static release's per-asset size ceiling, even for unusually large records.
    shard_size = 25
    for start in range(0, len(records), shard_size):
        group = records[start:start + shard_size]
        shard_name = f"manuscript-elements-{start // shard_size + 1:03d}.json"
        shard_records = []
        for record in group:
            shard_records.append({
                "recordLocator": record["recordLocator"],
                "sourceFile": record["source"]["file"],
                "sourceFileSha256": record["source"]["sha256"],
                "elementCount": record["elementCount"],
                "elements": record.pop("_sourceElements"),
            })
            record["elementShard"] = shard_name
        shard_payload = {
            "dataset": "Corpus Coranicum complete manuscript TEI elements",
            "schemaVersion": "1",
            "sourceCommit": COMMIT,
            "sourceLicense": "CC BY-SA 4.0",
            "shardIndex": len(element_shards) + 1,
            "records": shard_records,
        }
        shard_path = args.elements_out_dir / shard_name
        encoded_shard = json.dumps(shard_payload, ensure_ascii=False, separators=(",", ":")) + "\n"
        shard_path.write_text(encoded_shard, encoding="utf-8")
        shard_digest = sha256(shard_path)
        shard_bytes = shard_path.stat().st_size
        if shard_bytes > 25 * 1024 * 1024:
            raise ValueError(f"Manuscript element shard exceeds 25 MiB: {shard_name} ({shard_bytes} bytes)")
        element_shards.append({
            "path": shard_name,
            "recordCount": len(shard_records),
            "elementCount": sum(row["elementCount"] for row in shard_records),
            "bytes": shard_bytes,
            "sha256": shard_digest,
        })

    payload = {
        "dataset": "Corpus Coranicum manuscript descriptions",
        "schemaVersion": "2",
        "dataVersion": f"cc-{COMMIT[:12]}-manuscripts-v2",
        "recordCount": len(records),
        "recordsWithNativeId": sum(record["nativeId"] is not None for record in records),
        "recordsWithoutNativeId": sum(record["nativeId"] is None for record in records),
        "fileCount": len(xml_files),
        "scope": "TEI msDesc records and every element within each msDesc under data/quran_manuscripts; no images copied",
        "sourceCommit": COMMIT,
        "sourceRepository": REPOSITORY,
        "sourceLicense": "CC BY-SA 4.0",
        "attribution": ATTRIBUTION,
        "modificationNotice": "Selected catalogue fields and every TEI element within each msDesc are indexed verbatim with source file, xml:id or record locator, XPath, source line, and source file hash. The index does not reinterpret identifiers as shelfmarks or date statements as normalized dates. Element text for parent and child nodes can repeat; every XML node remains a distinct record.",
        "fieldPaths": [{"key": key, "label": label, "teiXPathRelativeToMsDesc": xpath}
                       for key, label, xpath in FIELD_SPECS],
        "fieldElementCounts": dict(sorted(field_counts.items())),
        "sourceElementCount": all_element_count,
        "sourceElementTextUtf8Bytes": all_element_text_bytes,
        "sourceElementNameCounts": dict(sorted(all_element_counts.items())),
        "elementShardSize": shard_size,
        "elementShardCount": len(element_shards),
        "elementShards": element_shards,
        "records": records,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n"
    args.out.write_text(encoded, encoding="utf-8")
    print(json.dumps({
        "output": str(args.out),
        "records": len(records),
        "recordsWithoutNativeId": sum(record["nativeId"] is None for record in records),
        "files": len(xml_files),
        "bytes": args.out.stat().st_size,
        "sha256": sha256(args.out),
        "fieldElementCounts": dict(sorted(field_counts.items())),
        "sourceElements": all_element_count,
        "elementShards": len(element_shards),
        "sourceElementTextUtf8Bytes": all_element_text_bytes,
        "largestElementShardBytes": max(shard["bytes"] for shard in element_shards),
        "duplicateNativeIds": 0,
    }, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
