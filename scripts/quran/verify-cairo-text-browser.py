#!/usr/bin/env python3
"""Independently reconstruct every Arabic verse and word token from source TEI."""

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
NS = {"t": "http://www.tei-c.org/ns/1.0"}
XML = "http://www.w3.org/XML/1998/namespace"


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def attrs(element: etree._Element) -> list[dict[str, str]]:
    return [{"expandedName": k, "exactValue": v} for k, v in sorted(element.attrib.items())]


def txt(element: etree._Element) -> str:
    text = "".join(element.itertext())
    return text[:-len(element.tail)] if element.tail and text.endswith(element.tail) else text


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--tei", type=Path, required=True)
    ap.add_argument("--release-db", type=Path, required=True)
    ap.add_argument("--package-dir", type=Path, required=True)
    args = ap.parse_args()
    errors: list[str] = []
    head = subprocess.run(["git", "-C", str(args.tei), "rev-parse", "HEAD"], text=True, capture_output=True, check=True).stdout.strip()
    if head != COMMIT:
        raise ValueError(f"Expected pinned source commit {COMMIT}; found {head}")
    db = sqlite3.connect(args.release_db)
    meta = dict(db.execute("SELECT key,value FROM data_release_metadata"))
    if meta.get("source_commit") != COMMIT or meta.get("source_license") != LICENSE:
        raise ValueError("SQLite release metadata mismatch")
    source = args.tei / RELATIVE
    source_hash = sha(source)
    source_manifest_hash = db.execute("SELECT sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei' AND relative_path=?", (RELATIVE,)).fetchone()
    if source_manifest_hash is None or source_manifest_hash[0] != source_hash:
        raise ValueError("Cairo XML hash does not match the release artifact manifest")
    catalog = json.loads((args.package_dir / "cairo-arabic-catalog.json").read_text(encoding="utf-8"))
    if (catalog.get("sourceCommit") != COMMIT or catalog.get("sourceLicense") != LICENSE
            or catalog.get("sourceFileSha256") != source_hash):
        errors.append("catalog provenance/source hash mismatch")
    tree = etree.parse(str(source), etree.XMLParser(resolve_entities=False, no_network=True, huge_tree=True))
    verses = tree.xpath("/t:TEI/t:text/t:body/t:div[@type='arabic_text']//t:lg[starts-with(@xml:id,'verse-')]", namespaces={**NS, "xml": XML})
    if len(verses) != 6236:
        errors.append(f"source contains {len(verses)} verse groups instead of 6,236")
    expected_surahs = sorted({
        (lambda parent: parent.get(f"{{{XML}}}id"))(next(a for a in v.iterancestors() if a.tag == "{http://www.tei-c.org/ns/1.0}lg" and (a.get(f"{{{XML}}}id") or "").startswith("sura-")))
        for v in verses
    })
    shards = catalog.get("shards", [])
    if len(shards) != 114 or sorted(row.get("suraNativeId") for row in shards) != expected_surahs:
        errors.append("surah shard coverage or source IDs mismatch")
    verse_count = token_count = 0
    seen_ids: set[str] = set()
    for shard in shards:
        name = shard.get("path", "")
        path = args.package_dir / name
        if not path.is_file() or sha(path) != shard.get("sha256") or path.stat().st_size != shard.get("bytes"):
            errors.append(f"missing or bad shard checksum: {name}")
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        if (payload.get("sourceFileSha256") != source_hash
                or payload.get("suraNativeId") != shard.get("suraNativeId")):
            errors.append(f"shard provenance/sura ID mismatch: {name}")
        sura_id = shard["suraNativeId"]
        sura = tree.xpath(f"/t:TEI/t:text/t:body/t:div[@type='arabic_text']//t:lg[@xml:id='{sura_id}']", namespaces={**NS, "xml": XML})
        if len(sura) != 1:
            errors.append(f"source surah missing or ambiguous: {sura_id}")
            continue
        source_verses = sura[0].xpath("./t:lg[starts-with(@xml:id,'verse-')]", namespaces=NS)
        output_verses = payload.get("records", [])
        if len(source_verses) != len(output_verses) or shard.get("verseCount") != len(source_verses):
            errors.append(f"verse count mismatch {sura_id}")
        local_tokens = 0
        for idx, verse in enumerate(source_verses):
            row = output_verses[idx] if idx < len(output_verses) else {}
            lines = verse.findall("./t:l", NS)
            if len(lines) != 1:
                errors.append(f"source line shape mismatch {tree.getpath(verse)}")
                continue
            line = lines[0]
            vid = verse.get(f"{{{XML}}}id")
            line_path = tree.getpath(line)
            line_no = line.sourceline
            if not vid or vid in seen_ids:
                errors.append(f"missing or duplicate verse ID: {vid}")
            elif row.get("verseNativeId") != vid:
                errors.append(f"source order/verse ID mismatch: {sura_id} index {idx}")
            if vid:
                seen_ids.add(vid)
            if (row.get("verseAttributes") != attrs(verse) or row.get("versePath") != tree.getpath(verse)
                    or row.get("verseLine") != verse.sourceline
                    or row.get("verseLocator") != f"{RELATIVE}#element={tree.getpath(verse)}"
                    or row.get("verseSourceUrl") != f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{verse.sourceline}"
                    or row.get("exactText") != txt(line)
                    or row.get("lineAttributes") != attrs(line) or row.get("elementPath") != line_path
                    or row.get("line") != line_no or row.get("locator") != f"{RELATIVE}#element={line_path}"
                    or row.get("sourceUrl") != f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{line_no}"):
                errors.append(f"exact verse text or locator mismatch: {vid}")
            source_words = line.findall("./t:w", NS)
            output_words = row.get("words", [])
            if len(source_words) != len(output_words):
                errors.append(f"word count mismatch: {vid}")
            for wi, word in enumerate(source_words):
                out = output_words[wi] if wi < len(output_words) else {}
                word_path = tree.getpath(word)
                word_line = word.sourceline
                if (out.get("nativeId") != word.get(f"{{{XML}}}id") or out.get("attributes") != attrs(word)
                        or out.get("exactText") != txt(word) or out.get("elementPath") != word_path
                        or out.get("line") != word_line or out.get("locator") != f"{RELATIVE}#element={word_path}"
                        or out.get("sourceUrl") != f"{REPOSITORY}/blob/{COMMIT}/{RELATIVE}#L{word_line}"):
                    errors.append(f"exact word/locator mismatch: {vid} token {wi + 1}")
            local_tokens += len(source_words)
            token_count += len(source_words)
        if shard.get("verseNativeIds") != [v.get(f"{{{XML}}}id") for v in source_verses]:
            errors.append(f"source verse order mismatch: {sura_id}")
        if shard.get("wordTokenCount") != local_tokens or payload.get("wordTokenCount") != local_tokens:
            errors.append(f"word-token total mismatch: {sura_id}")
        verse_count += len(source_verses)
    if (verse_count != 6236 or token_count != 77432 or len(seen_ids) != 6236
            or catalog.get("verseCount") != verse_count or catalog.get("wordTokenCount") != token_count):
        errors.append(f"aggregate coverage mismatch: {verse_count} verses / {token_count} words")
    print(json.dumps({"sourceFiles": 1, "surahs": len(shards), "verses": verse_count,
                      "wordTokens": token_count, "errors": errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
