#!/usr/bin/env python3
"""Validate and stage Quran source material in an ignored local SQLite DB.

The database belongs under scratch/ and must never be copied into the public
application bundle. Rights-unresolved sources are parsed for local inventory
and remain marked quarantined.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sqlite3
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from lxml import etree

TEI = "http://www.tei-c.org/ns/1.0"
XML = "http://www.w3.org/XML/1998/namespace"
NS = {"tei": TEI, "xml": XML}
PARSER_VERSION = "quran-local-ingest/0.1.5"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def exact_text(element: etree._Element) -> str:
    # Deliberately do not strip or Unicode-normalize. This is TEI descendant
    # character data after XML entity decoding, retaining internal whitespace.
    # itertext() also yields the element's tail, which belongs to its parent;
    # remove only that outside text node.
    value = "".join(element.itertext())
    # lxml includes the element's own tail, but nested elements can have their
    # own tails that belong inside the parent text. Remove only this element's
    # trailing sibling whitespace, and only when it is actually a suffix.
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def json_payload(element: etree._Element) -> str:
    return etree.tostring(element, encoding="unicode", with_tail=False)


def stable_id(prefix: str, value: str) -> str:
    return f"{prefix}_{hashlib.sha256(value.encode('utf-8')).hexdigest()}"


def connect(db_path: Path, schema_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if db_path.exists():
        db_path.unlink()
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    connection.executescript("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF; PRAGMA temp_store=MEMORY; PRAGMA cache_size=-100000;")
    connection.executescript(schema_path.read_text(encoding="utf-8"))
    return connection


def add_snapshot(connection: sqlite3.Connection, snapshot_id: str, source_name: str,
                 origin: str, version: str | None, commit: str | None,
                 license_text: str | None, rights_state: str,
                 attribution: str | None = None,
                 acquired_at: str | None = None) -> None:
    connection.execute(
        "INSERT INTO source_snapshot VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (snapshot_id, source_name, origin, version, commit, license_text,
         attribution, rights_state, acquired_at,
         PARSER_VERSION, PARSER_VERSION, None),
    )


def add_artifact(connection: sqlite3.Connection, snapshot_id: str, root: Path,
                 path: Path, redistributable: bool,
                 expected_sha256: str | None = None) -> str:
    relative = path.relative_to(root).as_posix() if root.is_dir() else path.name
    digest = sha256(path)
    if expected_sha256 and digest != expected_sha256:
        raise ValueError(f"source changed since manifest creation: {snapshot_id}/{relative}")
    artifact_id = f"{snapshot_id}:{relative}"
    connection.execute(
        "INSERT INTO source_artifact VALUES (?, ?, ?, ?, ?, ?, ?)",
        (artifact_id, snapshot_id, relative, digest, path.stat().st_size,
         "application/xml" if path.suffix.lower() == ".xml" else None,
         "allowed" if redistributable else "quarantined"),
    )
    return artifact_id


def add_record(connection: sqlite3.Connection, artifact_id: str, native_id: str | None,
               record_type: str, locator: str | None, payload: str,
               parse_state: str = "parsed") -> str:
    record_id = stable_id("sr", f"{artifact_id}\0{record_type}\0{native_id or ''}\0{locator or ''}")
    connection.execute(
        "INSERT INTO source_record VALUES (?, ?, ?, ?, ?, ?, ?)",
        (record_id, artifact_id, native_id, record_type, locator, payload, parse_state),
    )
    return record_id


def validate_and_stage_tei(connection: sqlite3.Connection, tei_root: Path,
                           schema_path: Path,
                           expected_hashes: dict[tuple[str, str], str]) -> dict:
    schema = etree.RelaxNG(etree.parse(str(schema_path)))
    parser = etree.XMLParser(resolve_entities=False, no_network=True,
                             remove_blank_text=False, huge_tree=True)
    repository_files = sorted(path for path in tei_root.rglob("*")
                              if path.is_file() and ".git" not in path.parts)
    artifact_ids = {
        path: add_artifact(connection, "corpus-coranicum-tei", tei_root, path, True,
                           expected_hashes[("corpus-coranicum-tei", path.relative_to(tei_root).as_posix())])
        for path in repository_files
    }
    xml_files = sorted((tei_root / "data").rglob("*.xml"),
                       key=lambda item: (item.name not in {"reader.xml", "sources.xml"}, item.as_posix()))
    invalid = []
    record_counts = Counter()
    variant_count = 0
    word_count = 0
    manuscript_count = 0
    manuscript_descriptions_by_collection = Counter()
    cairo_layer_counts = Counter()
    cairo_empty_text = Counter()
    reader_authorities = {}
    source_authorities = {}
    unresolved_authority_keys = Counter()
    authority_key_aliases = Counter()
    missing_source_key_count = 0
    missing_variant_word_locator_count = 0
    for file_path in xml_files:
        artifact_id = artifact_ids[file_path]
        relative = file_path.relative_to(tei_root).as_posix()
        try:
            tree = etree.parse(str(file_path), parser)
            if not schema.validate(tree):
                invalid.append({"file": relative, "errors": [str(err) for err in schema.error_log]})
                continue
        except (OSError, etree.XMLSyntaxError, etree.DocumentInvalid) as exc:
            invalid.append({"file": relative, "errors": [str(exc)]})
            continue

        root = tree.getroot()
        file_record = add_record(connection, artifact_id, root.get(f"{{{XML}}}id"),
                                 "tei-file", relative,
                                 json.dumps({"source_file": relative}, ensure_ascii=False))
        record_counts["tei_files"] += 1

        if relative.endswith("/quran_variants/reader.xml"):
            for person in root.xpath(".//tei:person[@xml:id]", namespaces=NS):
                key = person.get(f"{{{XML}}}id")
                label = person.find("./tei:name[@type='display']", namespaces=NS)
                if label is None:
                    label = person.find("./tei:name[@type='main']", namespaces=NS)
                record = add_record(connection, artifact_id, key, "tei-reading-authority",
                                    f"{relative}#xml:id={key}", json_payload(person))
                authority_id = f"corpus-coranicum-tei:reader:{key}"
                connection.execute("INSERT INTO reading_authority VALUES (?, ?, ?, ?, ?, ?)",
                                   (authority_id, record, "reader", key,
                                    exact_text(label) if label is not None else "", json_payload(person)))
                reader_authorities[key] = authority_id
        elif relative.endswith("/quran_variants/sources.xml"):
            for bibl in root.xpath(".//tei:biblStruct[@xml:id]", namespaces=NS):
                key = bibl.get(f"{{{XML}}}id")
                record = add_record(connection, artifact_id, key, "tei-source-authority",
                                    f"{relative}#xml:id={key}", json_payload(bibl))
                authority_id = f"corpus-coranicum-tei:source:{key}"
                connection.execute("INSERT INTO source_authority VALUES (?, ?, ?, ?, ?)",
                                   (authority_id, record, key, exact_text(bibl), json_payload(bibl)))
                source_authorities[key] = authority_id

        for item in root.xpath(".//tei:item[@xml:id]", namespaces=NS):
            native_id = item.get(f"{{{XML}}}id")
            locator = f"{relative}#xml:id={native_id}"
            item_record = add_record(connection, artifact_id, native_id, "tei-item", locator,
                                      json_payload(item))
            record_counts["tei_items"] += 1
            if "/quran_variants/" in f"/{relative}/" and native_id.startswith("variant_"):
                reader_references = item.findall(f"{{{TEI}}}persName")
                reader = reader_references[0] if reader_references else None
                source = item.find(f"{{{TEI}}}title")
                reader_key = reader.get("key") if reader is not None else None
                source_key = source.get("key") if source is not None else None
                words = item.xpath(".//tei:w", namespaces=NS)
                assertion_text = exact_text(item.find(f"{{{TEI}}}ab")) if item.find(f"{{{TEI}}}ab") is not None else exact_text(item)
                reader_lookup_key = reader_key.replace("variantreader_", "variantsreader_", 1) if reader_key and reader_key.startswith("variantreader_") else reader_key
                source_lookup_key = source_key.replace("variantsource_", "variantssource_", 1) if source_key and source_key.startswith("variantsource_") else source_key
                reader_authority_id = reader_authorities.get(reader_lookup_key)
                source_authority_id = source_authorities.get(source_lookup_key)
                if source_authority_id and source_lookup_key != source_key:
                    authority_key_aliases["variantsource_to_variantssource"] += 1
                if source_key and source_key != "variantsource_" and not source_authority_id:
                    unresolved_authority_keys[f"source:{source_key}"] += 1
                if not source_key or source_key == "variantsource_":
                    missing_source_key_count += 1
                assertion_id = stable_id("va", item_record)
                connection.execute(
                    "INSERT INTO variant_assertion "
                    "(assertion_id, source_record_id, native_id, reader_native_key, "
                    "source_native_key, reader_authority_id, source_authority_id, "
                    "source_native_category, exact_source_text, extraction_profile) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (assertion_id, item_record, native_id,
                     reader_key, source_key,
                     reader_authority_id,
                     source_authority_id,
                    None, assertion_text, "tei-descendant-text-v1"),
                )
                for reader_ordinal, reader_reference in enumerate(reader_references, 1):
                    native_key = reader_reference.get("key")
                    lookup_key = (native_key.replace("variantreader_", "variantsreader_", 1)
                                  if native_key and native_key.startswith("variantreader_")
                                  else native_key)
                    reader_authority = reader_authorities.get(lookup_key)
                    reader_locator = f"{locator};persName[{reader_ordinal}]"
                    reader_record = add_record(
                        connection, artifact_id, None, "tei-variant-reader-reference",
                        reader_locator, json_payload(reader_reference))
                    if reader_authority and lookup_key != native_key:
                        authority_key_aliases["variantreader_to_variantsreader"] += 1
                    if native_key and not reader_authority:
                        unresolved_authority_keys[f"reader:{native_key}"] += 1
                    connection.execute(
                        "INSERT INTO variant_reader_reference "
                        "(assertion_id, ordinal, source_record_id, reader_native_key, "
                        "reader_authority_id, exact_source_label) VALUES (?, ?, ?, ?, ?, ?)",
                        (assertion_id, reader_ordinal, reader_record, native_key,
                         reader_authority, exact_text(reader_reference)),
                    )
                for ordinal, word in enumerate(words, 1):
                    if not word.get("n"):
                        missing_variant_word_locator_count += 1
                    word_locator = f"{locator};word[{ordinal}];n={word.get('n') or 'missing'}"
                    word_record = add_record(connection, artifact_id, word.get(f"{{{XML}}}id"),
                                             "tei-variant-word", word_locator, json_payload(word))
                    connection.execute(
                        "INSERT INTO variant_word VALUES (?, ?, ?, ?, ?)",
                        (assertion_id, word_record, ordinal,
                         word.get("n"), exact_text(word)),
                    )
                variant_count += 1
                word_count += len(words)

        for index, msdesc in enumerate(root.xpath(".//tei:msDesc", namespaces=NS), 1):
            native_id = msdesc.get(f"{{{XML}}}id")
            locator = f"{relative}#xml:id={native_id}" if native_id else f"{relative}#msDesc[{index}]"
            record = add_record(connection, artifact_id, native_id, "tei-msDesc",
                                locator, json_payload(msdesc))
            connection.execute(
                "INSERT INTO manuscript_witness VALUES (?, ?, ?, ?)",
                (stable_id("mw", record), record, native_id, json_payload(msdesc)),
            )
            manuscript_count += 1
            collection = relative.split("/")[1] if len(relative.split("/")) > 1 else "unknown"
            manuscript_descriptions_by_collection[collection] += 1

        if relative == "data/cairo_quran/cairoquran.xml":
            for line in root.xpath(".//tei:div[@type]//tei:l", namespaces=NS):
                layer_element = line.xpath("ancestor::tei:div[@type][1]", namespaces=NS)
                layer_element = layer_element[0] if layer_element else None
                layer = layer_element.get("type") if layer_element is not None else "untyped"
                language = layer_element.get(f"{{{XML}}}lang") if layer_element is not None else None
                parent_group = line.getparent()
                verse_id = parent_group.get(f"{{{XML}}}id") if parent_group is not None else None
                text = exact_text(line)
                cairo_layer_counts[f"{layer}:{language or 'und'}"] += 1
                if not text:
                    cairo_empty_text[f"{layer}:{language or 'und'}"] += 1
                locator = f"{relative}#xml:id={verse_id};layer={layer};lang={language or 'und'};line-n={line.get('n')}"
                record = add_record(connection, artifact_id, verse_id,
                                    f"tei-cairo-{layer}", locator, json_payload(line))
                passage_id = stable_id("passage", f"corpus-coranicum:{verse_id}") if verse_id else None
                if verse_id:
                    connection.execute(
                        "INSERT OR IGNORE INTO passage VALUES (?, ?, ?, ?, ?)",
                        (passage_id, "Corpus Coranicum Cairo TEI xml:id", None, None, verse_id),
                    )
                if layer == "translation":
                    connection.execute(
                        "INSERT INTO translation_edition (translation_edition_id, source_record_id, edition_id, passage_id, language_tag, translator_label, edition_label, exact_source_text, extraction_profile, rights_state) "
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (stable_id("tr", f"{record}#translation"), record, None, passage_id, language,
                         None, f"Corpus Coranicum Cairo 1924 ({language or 'language unmarked'})",
                         text, "tei-descendant-text-v1", "needs_review"),
                    )
                else:
                    text_edition_id = stable_id("te", f"{record}#text-edition")
                    connection.execute(
                        "INSERT INTO text_edition (text_edition_id, source_record_id, edition_id, passage_id, language_tag, edition_label, exact_source_text, extraction_profile, rights_state) "
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (text_edition_id, record, None, passage_id, language,
                         f"Corpus Coranicum Cairo 1924 ({layer})", text,
                         "tei-descendant-text-v1", "identified"),
                    )
                    for ordinal, word in enumerate(line.xpath(".//tei:w", namespaces=NS), 1):
                        word_id = word.get(f"{{{XML}}}id")
                        word_locator = f"{relative}#xml:id={word_id};layer={layer}"
                        word_record = add_record(connection, artifact_id, word_id,
                                                 f"tei-cairo-word-{layer}", word_locator,
                                                 json_payload(word))
                        connection.execute(
                            "INSERT INTO text_token VALUES (?, ?, ?, ?, ?, ?, ?)",
                            (stable_id("tt", f"{word_record}#token"), text_edition_id, word_record,
                             ordinal, word_id, exact_text(word), "TEI w element"),
                        )

        for element in root.xpath(".//*[@xml:id]", namespaces=NS):
            xml_id = element.get(f"{{{XML}}}id")
            tag = etree.QName(element).localname
            if tag in {"item", "msDesc"}:
                continue
            record_counts[f"tei_id_{tag}"] += 1

    return {
        "xml_files": len(xml_files),
        "repository_files_accounted": len(repository_files),
        "non_data_repository_files": len(repository_files) - len(xml_files),
        "schema_valid_files": len(xml_files) - len(invalid),
        "schema_invalid_files": len(invalid),
        "variant_assertions": variant_count,
        "variant_words": word_count,
        "manuscript_descriptions": manuscript_count,
        "manuscript_descriptions_by_collection": dict(sorted(manuscript_descriptions_by_collection.items())),
        "cairo_layer_counts": dict(sorted(cairo_layer_counts.items())),
        "cairo_empty_text": dict(sorted(cairo_empty_text.items())),
        "unresolved_authority_keys": dict(sorted(unresolved_authority_keys.items())),
        "authority_key_aliases": dict(sorted(authority_key_aliases.items())),
        "variant_assertions_without_source_key": missing_source_key_count,
        "variant_words_without_native_locator": missing_variant_word_locator_count,
        "record_counts": dict(sorted(record_counts.items())),
        "errors": invalid,
    }


def stage_nasser(connection: sqlite3.Connection, directory: Path,
                 expected_hashes: dict[tuple[str, str], str]) -> dict:
    files = sorted(directory.glob("*.json"))
    summary = {"files": len(files), "records": {}, "list_entries": {},
               "missing_native_ids": {}, "duplicate_native_ids": {}}
    for path in files:
        artifact = add_artifact(connection, "nasser-export", directory, path, False,
                                 expected_hashes[("nasser-export", path.name)])
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
        if not isinstance(payload, dict):
            add_record(connection, artifact, None, "nasser-root", path.name,
                       json.dumps(payload, ensure_ascii=False), "needs_review")
            summary["records"][path.name] = None
            continue
        family = next((key for key in payload if isinstance(payload[key], list)), None)
        rows = payload.get(family, []) if family else []
        add_record(connection, artifact, None, f"nasser-{family or 'root'}-container",
                   f"{path.name}#/{family or ''}",
                   json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
                   "quarantined")
        native_ids = Counter(str(row.get("id")) for row in rows
                             if isinstance(row, dict) and row.get("id") is not None)
        summary["missing_native_ids"][path.name] = sum(
            not isinstance(row, dict) or row.get("id") is None for row in rows)
        summary["duplicate_native_ids"][path.name] = sum(
            count - 1 for count in native_ids.values() if count > 1)
        for index, row in enumerate(rows):
            native_id = (str(row["id"])
                         if isinstance(row, dict) and row.get("id") is not None
                         else None)
            add_record(connection, artifact, native_id, f"nasser-{family}-record",
                       f"{path.name}#/{family}/{index}",
                       json.dumps(row, ensure_ascii=False, separators=(",", ":")),
                       "quarantined")
        list_value = payload.get("list")
        summary["records"][path.name] = len(rows)
        summary["list_entries"][path.name] = {
            "type": type(list_value).__name__,
            "count": len(list_value) if isinstance(list_value, (list, dict)) else None,
            "meaning": "unmapped",
        }
    return summary


def stage_shamela(connection: sqlite3.Connection, csv_path: Path,
                  expected_hashes: dict[tuple[str, str], str]) -> dict:
    artifact = add_artifact(connection, "shamela-category-5-export", csv_path, csv_path, False,
                             expected_hashes[("shamela-category-5-export", csv_path.name)])
    expected = ["serial_number", "category_id", "category", "book_title", "book_id",
                "edition", "publisher", "page_number", "volume_number", "text", "foot_note"]
    with csv_path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream, strict=True)
        header = reader.fieldnames or []
        counts = Counter()
        book_ids = set()
        duplicate_serials = Counter()
        for line, row in enumerate(reader, 2):
            counts["rows"] += 1
            if None in row:
                counts["extra_columns"] += 1
            if not row.get("text"):
                counts["blank_text"] += 1
            if not row.get("page_number"):
                counts["missing_page"] += 1
            if row.get("foot_note"):
                counts["rows_with_footnote"] += 1
            if row.get("book_id"):
                book_ids.add(row["book_id"])
            if row.get("serial_number"):
                duplicate_serials[row["serial_number"]] += 1
            native_id = row.get("serial_number") or None
            add_record(connection, artifact, native_id, "shamela-row",
                       f"CSV line {line}; book_id={row.get('book_id')}; serial_number={native_id}",
                       json.dumps(row, ensure_ascii=False, separators=(",", ":")), "quarantined")
    return {"header": header, "header_matches_expected": header == expected,
            **dict(counts), "book_ids": len(book_ids),
            "duplicate_serials": sum(n - 1 for n in duplicate_serials.values() if n > 1)}


def stage_studies(connection: sqlite3.Connection, directory: Path,
                  expected_hashes: dict[tuple[str, str], str]) -> dict:
    manifest_path = directory / "_rename_manifest.csv"
    files = sorted(item for item in directory.iterdir() if item.is_file() and item.name != manifest_path.name)
    manifest_artifact = add_artifact(connection, "quran-studies-files", directory, manifest_path, False,
                                     expected_hashes[("quran-studies-files", manifest_path.name)])
    with manifest_path.open("r", encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    names = {item.name for item in files}
    missing_targets = [row.get("NewName") for row in rows if row.get("NewName") and row["NewName"] not in names]
    for index, row in enumerate(rows, 1):
        add_record(connection, manifest_artifact, None, "study-rename-manifest-row",
                   f"{manifest_path.name} line {index + 1}",
                   json.dumps(row, ensure_ascii=False, separators=(",", ":")), "quarantined")
    hashes = {}
    for path in files:
        digest = sha256(path)
        hashes.setdefault(digest, []).append(path.name)
        artifact = add_artifact(connection, "quran-studies-files", directory, path, False,
                                expected_hashes[("quran-studies-files", path.relative_to(directory).as_posix())])
        add_record(connection, artifact, None, "study-file",
                   f"{path.name}; bytes={path.stat().st_size}; sha256={digest}",
                   json.dumps({"filename": path.name, "bytes": path.stat().st_size,
                               "sha256": digest}, ensure_ascii=False), "quarantined")
    duplicate_groups = [sorted(names) for names in hashes.values() if len(names) > 1]
    return {"files": len(files), "manifest_rows": len(rows),
            "missing_manifest_targets": missing_targets,
            "duplicate_sha256_groups": duplicate_groups}


def build_tei_locator_candidates(connection: sqlite3.Connection) -> dict:
    tokens = {
        row["source_native_locator"]: row["source_record_id"]
        for row in connection.execute(
            "SELECT source_native_locator, source_record_id FROM text_token "
            "WHERE source_native_locator IS NOT NULL")
    }
    matched = 0
    unmatched = 0
    rows = connection.execute(
            "SELECT vw.source_record_id, vw.source_native_locator "
            "FROM variant_word vw WHERE vw.source_native_locator IS NOT NULL").fetchall()
    for row in rows:
        source_locator = row["source_native_locator"]
        candidate_locator = "w-" + source_locator.replace(":", "-")
        target_record_id = tokens.get(candidate_locator)
        if target_record_id is None:
            unmatched += 1
            continue
        candidate_id = stable_id("cw", f"cc-word-locator-candidate:{row['source_record_id']}")
        connection.execute(
            "INSERT INTO crosswalk VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (candidate_id, row["source_record_id"], target_record_id,
             "cc-variant-n-to-cairo-xml-id-v1",
             f"Same TEI snapshot; source n={source_locator}; candidate target xml:id={candidate_locator}. "
             "Transform is mechanically reproducible; human review is pending.",
             "candidate", None, None),
        )
        matched += 1
    return {"candidate_links": matched, "unmatched_nonempty_locators": unmatched,
            "review_state": "candidate"}


def verify_source_manifest(manifest_path: Path, roots: dict[str, Path | None]) -> dict[tuple[str, str], str]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    declared_sources = {source["id"]: source for source in manifest.get("sources", [])}
    result = {}
    for source_id, source in declared_sources.items():
        root = roots.get(source_id)
        availability = source.get("availability", "present")
        if availability in {"missing", "not_supplied", "excluded_by_scope"}:
            if root is not None and root.exists():
                raise ValueError(f"source is marked {availability} but is now present: {source_id}")
            if availability == "excluded_by_scope" and (
                    source.get("fileCount") != 0 or source.get("files") != []):
                raise ValueError(f"excluded source has declared files: {source_id}")
            continue
        if root is None:
            raise ValueError(f"source manifest marks {source_id} present, but no path was supplied")
        if not root.exists():
            raise ValueError(f"source manifest marks {source_id} present, but its path is missing: {root}")
        declared = {item["relativePath"]: item["sha256"]
                    for item in source.get("files", [])}
        if root.is_dir():
            actual_paths = sorted(path for path in root.rglob("*")
                                  if path.is_file() and ".git" not in path.parts)
            actual = {path.relative_to(root).as_posix(): path for path in actual_paths}
        else:
            actual = {root.name: root}
        missing = sorted(set(declared) - set(actual))
        extra = sorted(set(actual) - set(declared))
        if missing or extra:
            raise ValueError(f"source inventory changed for {source_id}: missing={missing[:5]}, extra={extra[:5]}")
        result.update({(source_id, relative): expected for relative, expected in declared.items()})
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--nasser", type=Path)
    parser.add_argument("--shamela", type=Path)
    parser.add_argument("--studies", type=Path)
    parser.add_argument("--schema", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--source-manifest", type=Path,
                        default=Path("scratch/quran/source-manifest.local.json"))
    args = parser.parse_args()
    if not args.source_manifest.is_file():
        parser.error(f"source manifest does not exist: {args.source_manifest}")
    source_roots: dict[str, Path | None] = {
        "corpus-coranicum-tei": args.tei,
        "nasser-export": args.nasser,
        "shamela-category-5-export": args.shamela,
        "quran-studies-files": args.studies,
    }
    expected_hashes = verify_source_manifest(args.source_manifest, source_roots)
    source_manifest = json.loads(args.source_manifest.read_text(encoding="utf-8"))
    source_states = {source["id"]: source.get("availability", "present")
                     for source in source_manifest.get("sources", [])}
    args.out_dir.mkdir(parents=True, exist_ok=True)
    db_path = args.out_dir / "quran-staging.sqlite"
    connection = connect(db_path, args.schema)
    ingest_created_at = datetime.now(timezone.utc).isoformat()
    tei_manifest_record = next(
        source for source in source_manifest.get("sources", [])
        if source.get("id") == "corpus-coranicum-tei")
    sources = [
        ("corpus-coranicum-tei", "Corpus Coranicum TEI", "https://github.com/telota/corpus-coranicum-tei", "2024-12-19", "57cb2b7be321ecfba100cb5f7988974f47864a14", "CC BY-SA 4.0", "identified", "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg Academy of Sciences and Humanities. https://github.com/telota/corpus-coranicum-tei.", tei_manifest_record.get("acquiredAt")),
        ("nasser-export", "User-supplied Nasser JSON", None, None, None, None, "needs_review"),
        ("shamela-category-5-export", "User-supplied Shamela CSV", None, None, None, None, "needs_review"),
        ("quran-studies-files", "User-supplied Studies files", None, None, None, None, "needs_review"),
    ]
    for source in sources:
        availability = source_states.get(source[0], "not_supplied")
        if source[0] == "corpus-coranicum-tei" or availability in {"present", "missing"}:
            add_snapshot(connection, *source)
    manifest_hash = sha256(args.source_manifest)
    connection.execute("UPDATE source_snapshot SET source_manifest_sha256=?", (manifest_hash,))
    # Bind a fixed timestamp for a reproducible set of records; manifest times
    # are separately recorded outside the deterministic database build.
    tei_report = validate_and_stage_tei(connection, args.tei,
                                        args.tei / "schema" / "corpus_coranicum.rng",
                                        expected_hashes)
    tei_report["variant_to_cairo_locator_crosswalk"] = build_tei_locator_candidates(connection)
    nasser_state = source_states.get("nasser-export", "not_supplied")
    if nasser_state == "present":
        if args.nasser is None:
            raise ValueError("the manifest marks Nasser present, but --nasser was not supplied")
        nasser_report = {"availability": "present",
                         **stage_nasser(connection, args.nasser, expected_hashes)}
    else:
        nasser_report = {
            "availability": nasser_state,
            "recordCount": 0,
            "publicRelease": False,
            "note": f"No Nasser rows were staged; manifest availability is {nasser_state}.",
        }
    if source_states.get("shamela-category-5-export") == "present":
        if args.shamela is None:
            raise ValueError("the manifest marks Shamela present, but --shamela was not supplied")
        shamela_report = {"availability": "present",
                          **stage_shamela(connection, args.shamela, expected_hashes)}
    else:
        shamela_report = {
            "availability": source_states.get("shamela-category-5-export", "not_supplied"),
            "recordCount": 0,
            "publicRelease": False,
            "note": "No Shamela rows were staged because the source is not present in this manifest.",
        }
    studies_state = source_states.get("quran-studies-files", "not_supplied")
    if studies_state == "present":
        if args.studies is None:
            raise ValueError("the manifest marks Studies present, but --studies was not supplied")
        studies_report = {"availability": "present",
                          **stage_studies(connection, args.studies, expected_hashes)}
    else:
        studies_report = {
            "availability": studies_state,
            "recordCount": 0,
            "publicRelease": False,
            "note": f"No Studies rows were staged; manifest availability is {studies_state}.",
        }
    connection.commit()
    integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    foreign_keys = connection.execute("PRAGMA foreign_key_check").fetchall()
    report = {
        "reportVersion": 1,
        "parser": PARSER_VERSION,
        "createdAt": ingest_created_at,
        "outputs": {"stagingDatabase": str(db_path)},
        "tei": tei_report,
        "nasser_quarantined": nasser_report,
        "shamela_quarantined": shamela_report,
        "studies_quarantined": studies_report,
        "database": {"integrity": integrity, "foreignKeyErrors": len(foreign_keys)},
        "publicRelease": False,
    }
    (args.out_dir / "ingest-report.local.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(args.out_dir / "ingest-report.local.json"),
                      "teiFiles": tei_report["xml_files"],
                      "teiSchemaValid": tei_report["schema_valid_files"],
                      "teiSchemaInvalid": tei_report["schema_invalid_files"],
                      "variants": tei_report["variant_assertions"],
                      "manuscripts": tei_report["manuscript_descriptions"],
                      "dbIntegrity": integrity,
                      "foreignKeyErrors": len(foreign_keys)}, ensure_ascii=False, indent=2))
    return 1 if tei_report["schema_invalid_files"] or integrity != "ok" or foreign_keys else 0


if __name__ == "__main__":
    sys.exit(main())
