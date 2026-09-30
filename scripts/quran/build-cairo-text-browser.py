#!/usr/bin/env python3
"""Build all source-located Arabic Cairo verses as lazy per-surah shards."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import subprocess
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
LICENSE = "CC BY-SA 4.0"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
RELATIVE = "data/cairo_quran/cairoquran.xml"
NS = {"tei": "http://www.tei-c.org/ns/1.0"}
XML = "http://www.w3.org/XML/1998/namespace"


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def exact_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def attrs(element: etree._Element) -> list[dict[str, str]]:
    return [{"expandedName": k, "exactValue": v} for k, v in sorted(element.attrib.items())]


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--tei", type=Path, required=True)
    ap.add_argument("--release-db", type=Path, required=True)
    ap.add_argument("--out-dir", type=Path, required=True)
    args = ap.parse_args()
    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"], text=True, capture_output=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned source commit {COMMIT}; found {head}")
    db = sqlite3.connect(args.release_db)
    metadata = dict(db.execute("SELECT key, value FROM data_release_metadata"))
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != LICENSE:
        raise ValueError("SQLite release metadata does not match the pinned licensed source")
    source_path = args.tei / RELATIVE
    source_sha = digest(source_path)
    expected = db.execute("SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' AND relative_path=?", (RELATIVE,)).fetchone()
    if expected is None or expected[0] != source_sha:
        raise ValueError("Cairo source hash does not match the release artifact manifest")

    tree = etree.parse(str(source_path), etree.XMLParser(resolve_entities=False, no_network=True, huge_tree=True))
    verse_groups = tree.xpath("/tei:TEI/tei:text/tei:body/tei:div[@type='arabic_text']//tei:lg[starts-with(@xml:id, 'verse-')]", namespaces=NS)
    if len(verse_groups) != 6236:
        raise ValueError(f"Expected all 6,236 Arabic verse groups; found {len(verse_groups)}")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    records_by_sura: dict[str, list[dict[str, object]]] = {}
    sura_attrs: dict[str, list[dict[str, str]]] = {}
    sura_paths: dict[str, str] = {}
    for verse in verse_groups:
        sura = verse.getparent()
        while sura is not None and not (sura.tag == f"{{{NS['tei']}}}lg" and (sura.get(f"{{{XML}}}id") or "").startswith("sura-")):
            sura = sura.getparent()
        if sura is None:
            raise ValueError(f"Verse group has no source sura ancestor: {tree.getpath(verse)}")
        sura_id = sura.get(f"{{{XML}}}id")
        assert sura_id is not None
        lines = verse.findall("./tei:l", NS)
        if len(lines) != 1:
            raise ValueError(f"Expected one source line in {verse.get(f'{{{XML}}}id')}; found {len(lines)}")
        line = lines[0]
        words = line.findall("./tei:w", NS)
        if not words:
            raise ValueError(f"Arabic source verse has no direct word tokens: {tree.getpath(verse)}")
        line_path = tree.getpath(line)
        line_no = line.sourceline
        record = {
            "verseNativeId": verse.get(f"{{{XML}}}id"),
            "verseAttributes": attrs(verse),
            "versePath": tree.getpath(verse),
            "verseLine": verse.sourceline,
            "verseLocator": f"{RELATIVE}#element={tree.getpath(verse)}",
            "verseSourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{verse.sourceline}",
            "exactText": exact_text(line),
            "lineAttributes": attrs(line),
            "locator": f"{RELATIVE}#element={line_path}",
            "elementPath": line_path,
            "line": line_no,
            "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{line_no}",
            "words": [],
        }
        for word in words:
            word_path = tree.getpath(word)
            word_line = word.sourceline
            record["words"].append({
                "nativeId": word.get(f"{{{XML}}}id"),
                "attributes": attrs(word),
                "exactText": exact_text(word),
                "locator": f"{RELATIVE}#element={word_path}",
                "elementPath": word_path,
                "line": word_line,
                "sourceUrl": f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{word_line}",
            })
        records_by_sura.setdefault(sura_id, []).append(record)
        sura_attrs[sura_id] = attrs(sura)
        sura_paths[sura_id] = tree.getpath(sura)

    shards = []
    total_words = 0
    seen_verses: set[str] = set()
    for sura_id, records in sorted(records_by_sura.items()):
        ids = [record["verseNativeId"] for record in records]
        if len(ids) != len(set(ids)) or seen_verses.intersection(ids):
            raise ValueError(f"Duplicate source verse ID under {sura_id}")
        seen_verses.update(ids)
        token_count = sum(len(record["words"]) for record in records)
        number = sura_id.removeprefix("sura-")
        name = f"cairo-arabic-sura-{number}.json"
        payload = {"schemaVersion": "1", "sourceCommit": COMMIT, "sourceLicense": LICENSE,
                   "sourceRepository": REPOSITORY, "sourceFile": RELATIVE,
                   "sourceFileSha256": source_sha, "suraNativeId": sura_id,
                   "suraAttributes": sura_attrs[sura_id], "suraPath": sura_paths[sura_id],
                   "verseCount": len(records), "wordTokenCount": token_count, "records": records}
        path = args.out_dir / name
        write_json(path, payload)
        if path.stat().st_size > 25 * 1024 * 1024:
            raise ValueError(f"Cairo surah shard exceeds 25 MiB: {name}")
        shards.append({"path": name, "suraNativeId": sura_id, "suraAttributes": sura_attrs[sura_id],
                       "suraPath": sura_paths[sura_id], "verseCount": len(records),
                       "wordTokenCount": token_count, "verseNativeIds": ids,
                       "bytes": path.stat().st_size, "sha256": digest(path)})
        total_words += token_count
    if len(records_by_sura) != 114 or len(seen_verses) != 6236 or total_words != 77432:
        raise ValueError(f"Unexpected Cairo coverage: {len(records_by_sura)} suras, {len(seen_verses)} verses, {total_words} words")
    catalog = {"schemaVersion": "1", "sourceCommit": COMMIT, "sourceLicense": LICENSE,
               "sourceRepository": REPOSITORY, "sourceFile": RELATIVE, "sourceFileSha256": source_sha,
               "sourceFileCount": 1, "suraCount": len(shards), "verseCount": len(seen_verses),
               "wordTokenCount": total_words, "largestShardBytes": max(shard["bytes"] for shard in shards),
               "shards": shards}
    write_json(args.out_dir / "cairo-arabic-catalog.json", catalog)
    print(json.dumps({"sourceFile": RELATIVE, "suras": len(shards), "verses": len(seen_verses),
                      "wordTokens": total_words, "largestShardBytes": catalog["largestShardBytes"],
                      "catalogSha256": digest(args.out_dir / "cairo-arabic-catalog.json")}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
