#!/usr/bin/env python3
"""Independently compare every concordance shard against pinned source TEI."""

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
LICENSE = "CC BY-SA 4.0"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
NS = {"t": "http://www.tei-c.org/ns/1.0"}
XML = "http://www.w3.org/XML/1998/namespace"


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def attrs(element: etree._Element) -> list[dict[str, str]]:
    return [{"expandedName": k, "exactValue": v} for k, v in sorted(element.attrib.items())]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--package-dir", type=Path, required=True)
    args = parser.parse_args()
    errors: list[str] = []
    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"],
                          text=True, capture_output=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned source commit {COMMIT}; found {head}")
    db = sqlite3.connect(args.release_db)
    meta = dict(db.execute("SELECT key, value FROM data_release_metadata"))
    if meta.get("source_commit") != COMMIT or meta.get("source_license") != LICENSE:
        raise ValueError("SQLite release metadata does not match source commit and license")
    source_hashes = dict(db.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    catalog_path = args.package_dir / "concordance-catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    if catalog.get("sourceCommit") != COMMIT or catalog.get("sourceLicense") != LICENSE:
        errors.append("catalog source commit or license mismatch")
    expected_files = sorted((args.tei / "data/quran_concordance").glob("*.xml"))
    if len(expected_files) != 114 or len(catalog.get("shards", [])) != len(expected_files):
        errors.append("source file or shard count mismatch")
    records_total = fields_total = 0
    type_counts: Counter[str] = Counter()
    expected_order: list[str] | None = None
    for index, source in enumerate(expected_files):
        rel = source.relative_to(args.tei).as_posix()
        sha = digest(source)
        if source_hashes.get(rel) != sha:
            errors.append(f"release source hash mismatch: {rel}")
        shard_name = f"concordance-{source.stem}.json"
        shard_path = args.package_dir / shard_name
        try:
            payload = json.loads(shard_path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"cannot read {shard_name}: {exc}")
            continue
        manifest_rows = catalog.get("shards", [])
        manifest = manifest_rows[index] if index < len(manifest_rows) else {}
        if manifest.get("path") != shard_name or manifest.get("sourceFile") != rel:
            errors.append(f"catalog order/path mismatch: {shard_name}")
        if manifest.get("sha256") != digest(shard_path) or manifest.get("bytes") != shard_path.stat().st_size:
            errors.append(f"package hash/byte count mismatch: {shard_name}")
        if payload.get("sourceFileSha256") != sha or payload.get("sourceFile") != rel:
            errors.append(f"shard source hash/path mismatch: {shard_name}")
        tree = etree.parse(str(source), etree.XMLParser(resolve_entities=False, no_network=True, huge_tree=True))
        words = tree.xpath("/t:TEI/t:text/t:body//t:w", namespaces=NS)
        rows = payload.get("records", [])
        if len(words) != len(rows):
            errors.append(f"word count mismatch {shard_name}: {len(words)} vs {len(rows)}")
        rows_seen: set[str] = set()
        current_types: list[str] | None = None
        for order, word in enumerate(words, 1):
            path = tree.getpath(word)
            row = rows[order - 1] if order - 1 < len(rows) else {}
            expected_id = word.get(f"{{{XML}}}id")
            locator = (f"{rel}#xml:id={expected_id};element={path}" if expected_id
                       else f"{rel}#element={path}")
            if locator in rows_seen:
                errors.append(f"duplicate source locator {locator}")
            rows_seen.add(locator)
            if (row.get("nativeId") != expected_id or row.get("sourceOrder") != order
                    or row.get("attributes") != attrs(word) or row.get("locator") != locator
                    or row.get("elementPath") != path or row.get("line") != word.sourceline
                    or row.get("sourceUrl") != f"{REPOSITORY}/blob/{COMMIT}/{rel}#L{word.sourceline}"):
                errors.append(f"record locator/metadata mismatch {shard_name} #{order}")
            source_fields = word.findall("./t:seg", NS)
            output_fields = row.get("fieldValuesExact", [])
            if len(source_fields) != len(output_fields):
                errors.append(f"field count mismatch {shard_name} #{order}")
            shape: list[str] = []
            for fi, segment in enumerate(source_fields):
                kind = segment.get("type")
                shape.append(kind or "")
                type_counts[kind or ""] += 1
                out = output_fields[fi] if fi < len(output_fields) else None
                if attrs(segment) != [{"expandedName": "type", "exactValue": kind}] or out != "".join(segment.itertext()):
                    errors.append(f"exact field mismatch {shard_name} #{order} field {fi + 1}")
            if current_types is None:
                current_types = shape
            if shape != current_types:
                errors.append(f"source field order varies inside {rel} at word {order}")
            if expected_order is None:
                expected_order = shape
            if shape != expected_order:
                errors.append(f"source field order differs across files at {rel} word {order}")
            fields_total += len(source_fields)
        title = tree.xpath("string(/t:TEI/t:teiHeader/t:fileDesc/t:titleStmt/t:title[1])", namespaces=NS)
        title_element = tree.xpath("/t:TEI/t:teiHeader/t:fileDesc/t:titleStmt/t:title[1]", namespaces=NS)[0]
        title_path = tree.getpath(title_element)
        title_line = title_element.sourceline
        if payload.get("sourceTitleExact") != title:
            errors.append(f"source title mismatch {rel}")
        if (manifest.get("sourceTitleExact") != title or manifest.get("sourceTitlePath") != title_path
                or manifest.get("sourceTitleLine") != title_line
                or manifest.get("sourceTitleLocator") != f"{rel}#element={title_path}"
                or manifest.get("sourceTitleSourceUrl") != f"{REPOSITORY}/blob/{COMMIT}/{rel}#L{title_line}"):
            errors.append(f"source title locator mismatch {rel}")
        records_total += len(words)
        if payload.get("recordCount") != len(words) or payload.get("fieldCount") != sum(len(w.findall('./t:seg', NS)) for w in words):
            errors.append(f"shard totals mismatch {rel}")

    if records_total != 91_285 or fields_total != 3_833_970 or len(expected_order or []) != 42:
        errors.append(f"unexpected totals: {records_total} records, {fields_total} fields, {len(expected_order or [])} field types")
    if catalog.get("recordCount") != records_total or catalog.get("fieldCount") != fields_total:
        errors.append("catalog aggregate counts mismatch")
    if catalog.get("fieldOrderExact") != expected_order:
        errors.append("catalog field order mismatch")
    if catalog.get("fieldCounts") != dict(sorted(type_counts.items())):
        errors.append("catalog per-type counts mismatch")
    print(json.dumps({"sourceFiles": len(expected_files), "records": records_total, "fields": fields_total,
                      "fieldTypes": len(type_counts), "errors": errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
