#!/usr/bin/env python3
"""Build exact, source-located surah shards from the Corpus Coranicum concordance TEI."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import subprocess
from collections import Counter
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
LICENSE = "CC BY-SA 4.0"
NS = {"tei": "http://www.tei-c.org/ns/1.0"}
XML = "http://www.w3.org/XML/1998/namespace"
SOURCE_ROOT = "data/quran_concordance"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def exact_text(element: etree._Element) -> str:
    return "".join(element.itertext())


def attributes(element: etree._Element) -> list[dict[str, str]]:
    return [{"expandedName": key, "exactValue": value}
            for key, value in sorted(element.attrib.items())]


def canonical_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n").encode("utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()

    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"],
                          text=True, capture_output=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned TEI commit {COMMIT}; found {head}")
    connection = sqlite3.connect(args.release_db)
    metadata = dict(connection.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != LICENSE:
        raise ValueError("release metadata does not match pinned Corpus Coranicum TEI commit/license")
    expected_hashes = dict(connection.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))

    source_files = sorted((args.tei / SOURCE_ROOT).glob("*.xml"))
    if len(source_files) != 114 or [p.name for p in source_files] != [f"sura{i:03}.xml" for i in range(1, 115)]:
        raise ValueError(f"Expected sura001.xml through sura114.xml; found {len(source_files)} files")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    shards: list[dict[str, object]] = []
    total_words = total_segments = 0
    field_counts: Counter[str] = Counter()
    field_order: tuple[str, ...] | None = None
    for source_file in source_files:
        relative = source_file.relative_to(args.tei).as_posix()
        expected_hash = expected_hashes.get(relative)
        source_hash = sha256(source_file)
        if expected_hash is None or source_hash != expected_hash:
            raise ValueError(f"Source file hash does not match pinned release manifest: {relative}")
        tree = etree.parse(str(source_file), etree.XMLParser(resolve_entities=False, no_network=True, huge_tree=True))
        words = tree.xpath("/tei:TEI/tei:text/tei:body//tei:w", namespaces=NS)
        if not words:
            raise ValueError(f"No concordance word records in {relative}")
        records: list[dict[str, object]] = []
        for order, word in enumerate(words, 1):
            field_values = []
            for segment in word.findall("./tei:seg", NS):
                kind = segment.get("type")
                if kind is None:
                    raise ValueError(f"Missing source-native seg/@type at {relative}:{segment.sourceline}")
                if set(segment.attrib) != {"type"}:
                    raise ValueError(f"Unexpected seg attributes require explicit schema support at {relative}:{segment.sourceline}")
                field_values.append(exact_text(segment))
                field_counts[kind] += 1
            order_shape = tuple(segment.get("type", "") for segment in word.findall("./tei:seg", NS))
            if field_order is None:
                field_order = order_shape
            if order_shape != field_order:
                raise ValueError(f"Source field order/shape differs at {relative}:{word.sourceline}")
            native_id = word.get(f"{{{XML}}}id")
            path = tree.getpath(word)
            locator = (f"{relative}#xml:id={native_id};element={path}" if native_id
                       else f"{relative}#element={path}")
            records.append({
                "nativeId": native_id,
                "sourceOrder": order,
                "attributes": attributes(word),
                "fieldValuesExact": field_values,
                "locator": locator,
                "elementPath": path,
                "line": word.sourceline,
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{word.sourceline}",
            })
            total_segments += len(field_values)
        title_element = tree.xpath("/tei:TEI/tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title[1]", namespaces=NS)[0]
        title = exact_text(title_element)
        title_path = tree.getpath(title_element)
        title_line = title_element.sourceline
        title_url = f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{title_line}"
        payload = {
            "schemaVersion": "1", "sourceCommit": COMMIT, "sourceLicense": LICENSE,
            "sourceRepository": REPOSITORY, "sourceFile": relative, "sourceFileSha256": source_hash,
            "sourceTitleExact": title, "fieldOrderExact": list(field_order or ()),
            "recordCount": len(records), "fieldCount": sum(len(record["fieldValuesExact"]) for record in records),
            "records": records,
        }
        name = f"concordance-{source_file.stem}.json"
        path = args.out_dir / name
        path.write_bytes(canonical_bytes(payload))
        if path.stat().st_size > 25 * 1024 * 1024:
            raise ValueError(f"Concordance shard exceeds 25 MiB: {name}")
        shards.append({"path": name, "sourceFile": relative, "sourceFileSha256": source_hash,
                       "bytes": path.stat().st_size, "sha256": sha256(path),
                       "recordCount": len(records), "fieldCount": payload["fieldCount"],
                       "sourceTitleExact": title, "sourceTitlePath": title_path,
                       "sourceTitleLine": title_line, "sourceTitleLocator": f"{relative}#element={title_path}",
                       "sourceTitleSourceUrl": title_url})
        total_words += len(records)

    if total_segments != 3_833_970 or total_words != 91_285 or len(field_order or ()) != 42:
        raise ValueError(f"Unexpected pinned concordance coverage: {total_words} words / {total_segments} fields / {len(field_order or ())} field types")
    catalog = {
        "schemaVersion": "1", "sourceCommit": COMMIT, "sourceLicense": LICENSE,
        "sourceRepository": REPOSITORY, "collection": SOURCE_ROOT,
        "recordElement": "{http://www.tei-c.org/ns/1.0}w",
        "fieldElement": "{http://www.tei-c.org/ns/1.0}seg",
        "sourceFileCount": len(shards), "recordCount": total_words, "fieldCount": total_segments,
        "fieldTypeCount": len(field_counts), "fieldOrderExact": list(field_order or ()),
        "fieldCounts": dict(sorted(field_counts.items())),
        "shards": shards,
    }
    catalog_path = args.out_dir / "concordance-catalog.json"
    catalog_path.write_bytes(canonical_bytes(catalog))
    print(json.dumps({"catalog": str(catalog_path), "sourceFiles": len(shards), "records": total_words,
                      "fields": total_segments, "fieldTypes": len(field_counts),
                      "catalogSha256": sha256(catalog_path)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
