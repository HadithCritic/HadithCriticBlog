#!/usr/bin/env python3
"""Build an exact, source-linked field index for CC intertext source records."""

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
ATTRIBUTION = (
    "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg "
    "Academy of Sciences and Humanities. https://github.com/telota/corpus-coranicum-tei."
)
FIELD_SPECS = (
    ("sourceDocumentTitle", "Source document title", "/tei:TEI/tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title"),
    ("repository", "Repository statement", "./tei:msIdentifier/tei:repository"),
    ("identifier", "Identifier statement", "./tei:msIdentifier/tei:idno"),
    ("summary", "Source record summary", "./tei:msContents/tei:summary"),
    ("workTitle", "Described work title", "./tei:msContents/tei:msItem/tei:title"),
    ("workAuthor", "Described work author", "./tei:msContents/tei:msItem/tei:author"),
    ("textLanguage", "TEI text language statement", "./tei:msContents/tei:msItem/tei:textLang"),
    ("originDate", "Origin date statement", "./tei:history/tei:origin/tei:origDate"),
    ("originPlace", "Origin place statement", "./tei:history/tei:origin/tei:origPlace"),
    ("bibliography", "Bibliography entries", "./tei:additional/tei:listBibl/tei:bibl"),
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
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    head = __import__("subprocess").run(
        ["git", "-C", str(args.tei), "rev-parse", "HEAD"],
        text=True, capture_output=True, check=True,
    ).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned TEI commit {COMMIT}; found {head}")
    conn = sqlite3.connect(args.release_db)
    metadata = dict(conn.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != "CC BY-SA 4.0":
        raise ValueError("release metadata does not match pinned licensed Corpus Coranicum source")
    hashes = dict(conn.execute(
        "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))

    root = args.tei / "data/quran_intertexts"
    xml_files = sorted(root.rglob("*.xml"))
    records = []
    counts: Counter[str] = Counter()
    seen_ids: set[str] = set()
    for path in xml_files:
        relative = path.relative_to(args.tei).as_posix()
        digest = hashes.get(relative)
        if digest is None or sha256(path) != digest:
            raise ValueError(f"Source file hash does not match release manifest: {relative}")
        tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
        descs = tree.xpath(".//tei:msDesc", namespaces=NS)
        for ordinal, desc in enumerate(descs, 1):
            native_id = desc.get(f"{{{XML}}}id")
            if native_id:
                if native_id in seen_ids:
                    raise ValueError(f"Duplicate intertext msDesc xml:id: {native_id}")
                seen_ids.add(native_id)
            record_line = desc.sourceline
            locator = f"{relative}#xml:id={native_id}" if native_id else f"{relative}#msDesc[{ordinal}]"
            record = {
                "nativeId": native_id,
                "recordLocator": locator,
                "source": {
                    "repository": REPOSITORY,
                    "commit": COMMIT,
                    "file": relative,
                    "line": record_line,
                    "sha256": digest,
                    "url": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{record_line}",
                },
                "fields": {},
            }
            for key, label, xpath in FIELD_SPECS:
                values = []
                context = tree if key == "sourceDocumentTitle" else desc
                for element in context.xpath(xpath, namespaces=NS):
                    attributes = [
                        {"expandedName": name, "exactValue": value}
                        for name, value in sorted(element.attrib.items())
                    ]
                    element_path = tree.getpath(element)
                    line = element.sourceline
                    values.append({
                        "exactText": exact_text(element),
                        "attributes": attributes,
                        "elementName": etree.QName(element).localname,
                        "elementPath": element_path,
                        "line": line,
                        "locator": f"{relative}#element={element_path}" if key == "sourceDocumentTitle" else f"{relative}#xml:id={native_id};element={element_path}" if native_id else f"{relative}#msDesc[{ordinal}];element={element_path}",
                        "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}",
                    })
                record["fields"][key] = {"label": label, "values": values}
                counts[key] += len(values)
            records.append(record)
    records.sort(key=lambda row: (row["source"]["file"], row["source"]["line"] or 0))
    if len(records) != 713:
        raise ValueError(f"Expected 713 intertext msDesc records, found {len(records)}")

    payload = {
        "dataset": "Corpus Coranicum intertext source descriptions",
        "schemaVersion": "1",
        "dataVersion": f"cc-{COMMIT[:12]}-intertext-sources-v1",
        "recordCount": len(records),
        "sourceFileCount": len(xml_files),
        "recordSourceFileCount": len({record["source"]["file"] for record in records}),
        "sourceCommit": COMMIT,
        "sourceRepository": REPOSITORY,
        "sourceLicense": "CC BY-SA 4.0",
        "attribution": ATTRIBUTION,
        "modificationNotice": (
            "Indexes selected TEI source title, msIdentifier, msContents, msItem, origin, "
            "and bibliography elements. Exact descendant character data, direct attributes, "
            "source file hash, record identity, XPath, source line, and source URL are retained. "
            "Date, language, place, authorship, and source relationships are displayed as the "
            "source reports them and are not normalized or independently verified."
        ),
        "scope": "All msDesc records under data/quran_intertexts; the categories.xml taxonomy file is not included in this record index.",
        "fieldPaths": [
            {"key": key, "label": label, "teiXPathRelativeToMsDesc": xpath}
            for key, label, xpath in FIELD_SPECS
        ],
        "fieldElementCounts": dict(sorted(counts.items())),
        "records": records,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(args.out),
        "records": len(records),
        "sourceFiles": len(xml_files),
        "recordSourceFiles": len({record["source"]["file"] for record in records}),
        "bytes": args.out.stat().st_size,
        "sha256": sha256(args.out),
        "fieldElementCounts": dict(sorted(counts.items())),
    }, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
