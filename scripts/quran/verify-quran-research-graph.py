#!/usr/bin/env python3
"""Independently verify the explicit CC graph against source TEI and the full variant index."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import sys
from pathlib import Path

from lxml import etree

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
REPOSITORY = "https://github.com/telota/corpus-coranicum-tei"
LICENSE = "CC BY-SA 4.0"
TEI_NS = "http://www.tei-c.org/ns/1.0"
NS = {"tei": TEI_NS}
REFERENCE_CONSTRUCTS = ("ref", "ptr", "relation", "link", "linkGrp", "listRelation", "join", "joinGrp", "anchor")
COMMENTARY_RANGE_PATTERN = re.compile(r"^koran-(\d{3}):(\d{3})-(\d{3}):(\d{3})$")
TUK_TARGET_PATTERN = re.compile(r"^#TUK([0-9]+)$")
TUK_CROSSWALK_METHOD = "corpus-coranicum-website-tuk-fragment-to-intertext-id/1"


def exact_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def source_url(relative: str, line: int) -> str:
    return f"{REPOSITORY}/blob/{COMMIT}/{relative}#L{line}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--full-index", type=Path, required=True)
    parser.add_argument("--graph", type=Path, required=True)
    args = parser.parse_args()

    with sqlite3.connect(args.release_db) as db:
        metadata = dict(db.execute("SELECT key, value FROM data_release_metadata"))
        expected_hashes = dict(db.execute(
            "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    source_xml_paths = sorted((args.tei / "data").rglob("*.xml"))
    actual_xml_paths = {path.relative_to(args.tei).as_posix() for path in source_xml_paths}
    expected_xml_paths = {path for path in expected_hashes if path.startswith("data/") and path.endswith(".xml")}
    full_index = json.loads(args.full_index.read_text(encoding="utf-8"))
    graph = json.loads(args.graph.read_text(encoding="utf-8"))
    errors: list[str] = []
    cairo_text_path = args.tei / "data/cairo_quran/cairoquran.xml"
    cairo_text_hash = expected_hashes.get("data/cairo_quran/cairoquran.xml")
    cairo_verse_ids: set[str] = set()
    if cairo_text_hash is None or not cairo_text_path.is_file() or hashlib.sha256(cairo_text_path.read_bytes()).hexdigest() != cairo_text_hash:
        errors.append("Cairo source hash mismatch for commentary target assessment")
    else:
        cairo_tree = etree.parse(str(cairo_text_path), etree.XMLParser(resolve_entities=False, no_network=True))
        cairo_verse_ids = {
            element.get("{http://www.w3.org/XML/1998/namespace}id")
            for element in cairo_tree.xpath(".//*[@xml:id]", namespaces={"xml": "http://www.w3.org/XML/1998/namespace"})
            if (element.get("{http://www.w3.org/XML/1998/namespace}id") or "").startswith("verse-")
        }
        if len(cairo_verse_ids) != 6236:
            errors.append(f"expected 6,236 Cairo verse IDs; found {len(cairo_verse_ids)}")
    if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != LICENSE:
        errors.append("release database provenance/license mismatch")
    if full_index.get("sourceCommit") != COMMIT or full_index.get("sourceLicense") != LICENSE:
        errors.append("full variant index provenance/license mismatch")
    if graph.get("sourceCommit") != COMMIT or graph.get("sourceLicense") != LICENSE:
        errors.append("graph provenance/license mismatch")
    if len(source_xml_paths) != 3240 or actual_xml_paths != expected_xml_paths:
        errors.append(
            f"pinned TEI XML inventory mismatch: {len(source_xml_paths)} files; "
            f"missing={sorted(expected_xml_paths - actual_xml_paths)[:5]}; "
            f"unregistered={sorted(actual_xml_paths - expected_xml_paths)[:5]}"
        )

    intertext_records: dict[str, dict[str, object]] = {}
    for path in sorted((args.tei / "data/quran_intertexts").rglob("*.xml")):
        relative = path.relative_to(args.tei).as_posix()
        expected_hash = expected_hashes.get(relative)
        if expected_hash is None or hashlib.sha256(path.read_bytes()).hexdigest() != expected_hash:
            errors.append(f"intertext source hash mismatch: {relative}")
            continue
        tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
        for record in tree.xpath(".//tei:msDesc", namespaces=NS):
            native_id = record.get("{http://www.w3.org/XML/1998/namespace}id")
            if not native_id:
                continue
            if native_id in intertext_records:
                errors.append(f"duplicate intertext xml:id: {native_id}")
                continue
            line = record.sourceline
            intertext_records[native_id] = {
                "nativeId": native_id,
                "recordLocator": f"{relative}#xml:id={native_id}",
                "sourceFile": relative,
                "sourceLine": line,
                "sourceFileSha256": expected_hash,
                "sourceUrl": source_url(relative, line),
            }
    tuk_crosswalk_coverage = {"occurrences": 0, "numericTargets": 0, "resolvedOccurrences": 0,
                              "missingNumericTargets": 0, "malformedTargets": 0}
    resolved_tuk_ids: set[str] = set()

    expected_by_type: dict[str, list[dict[str, object]]] = {
        "reported_reader_authority": [],
        "candidate_cairo_word_locator": [],
        "commentary_quran_reference": [],
        "source_explicit_tei_reference": [],
        "candidate_commentary_cairo_range_locator": [],
        "source_bibliographic_key_reference": [],
    }
    expected_authorities: dict[str, dict[str, object]] = {}
    reader_count = 0
    candidate_count = 0
    for record in full_index.get("records", []):
        variant_id = record.get("variantId")
        source = record.get("sourceRecord", {})
        for reader_reference in record.get("readerReferences", []):
            reader = reader_reference.get("readerAuthority")
            if not reader:
                continue
            reader_count += 1
            source_key = reader_reference.get("nativeKey")
            expected_key = "variantreader_" + str(reader.get("nativeKey", "")).removeprefix("variantsreader_")
            if source_key != expected_key:
                errors.append(f"reader authority alias does not match source key: {variant_id}#{reader_reference.get('ordinal')}")
            source_reference = reader_reference.get("sourceRecord", {})
            if not source.get("url") or not reader.get("sourceUrl") or not source_reference.get("url"):
                errors.append(f"reader authority edge lacks source URL: {variant_id}#{reader_reference.get('ordinal')}")
            expected_authorities[reader.get("nativeKey")] = {
                "nativeKey": reader.get("nativeKey"),
                "exactLabel": reader.get("exactLabel"),
                "sourceUrl": reader.get("sourceUrl"),
            }
            expected_by_type["reported_reader_authority"].append({
                "variantId": variant_id,
                "variantSourceUrl": source.get("url"),
                "readerAuthorityKey": reader.get("nativeKey"),
                "sourceKeyExact": source_key,
                "readerLabelExact": reader_reference.get("exactLabel"),
                "readerReferenceOrdinal": reader_reference.get("ordinal"),
                "readerReferenceSourceUrl": source_reference.get("url"),
            })
        for word in record.get("words", []):
            alignment = word.get("alignment")
            if not alignment:
                continue
            candidate_count += 1
            expected_by_type["candidate_cairo_word_locator"].append({
                "variantId": variant_id,
                "variantSourceUrl": source.get("url"),
                "variantWordOrdinal": word.get("ordinal"),
                "variantWordLocator": word.get("sourceLocator"),
                "variantWordExactText": word.get("exactText"),
                "candidateMethod": alignment.get("method"),
                "cairoWordLocator": alignment.get("targetSourceLocator"),
                "cairoWordExactText": alignment.get("targetExactText"),
                "cairoWordSourceUrl": alignment.get("targetSourceUrl"),
                "passageNativeId": alignment.get("targetVerseId"),
            })

    ref_count = 0
    target_values: set[str] = set()
    commentary_range_assessment = {
        "referenceCount": 0, "eligibleCandidates": 0, "patternNotMatched": 0,
        "crossSurah": 0, "zeroEndpoint": 0, "missingCairoEndpoint": 0,
        "reversedEndpoints": 0,
    }
    commentary_root = args.tei / "data/quran_commentary"
    for path in sorted(commentary_root.rglob("*.xml")):
        relative = path.relative_to(args.tei).as_posix()
        expected_hash = expected_hashes.get(relative)
        if not expected_hash or hashlib.sha256(path.read_bytes()).hexdigest() != expected_hash:
            errors.append(f"commentary source file hash mismatch: {relative}")
            continue
        tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
        for ordinal, ref in enumerate(tree.xpath(".//tei:ref", namespaces=NS), 1):
            if ref.get("type") != "koran":
                continue
            target = ref.get("target")
            if target is None:
                errors.append(f"commentary target absent: {relative}#{ref.sourceline}")
                continue
            ref_count += 1
            target_values.add(target)
            expected_by_type["commentary_quran_reference"].append({
                "sourceLocator": f"{relative}#ref[{ordinal}]",
                "sourceLine": ref.sourceline,
                "sourceFileSha256": expected_hash,
                "referenceExactText": exact_text(ref),
                "referenceTypeExact": ref.get("type"),
                "targetExact": target,
                "sourceUrl": source_url(relative, ref.sourceline),
            })
            commentary_range_assessment["referenceCount"] += 1
            match = COMMENTARY_RANGE_PATTERN.fullmatch(target)
            status = "eligible"
            if not match:
                status = "patternNotMatched"
            else:
                start_sura, start_verse, end_sura, end_verse = match.groups()
                start_id = f"verse-{start_sura}-{start_verse}"
                end_id = f"verse-{end_sura}-{end_verse}"
                if start_sura != end_sura:
                    status = "crossSurah"
                elif start_verse == "000" or end_verse == "000":
                    status = "zeroEndpoint"
                elif start_id not in cairo_verse_ids or end_id not in cairo_verse_ids:
                    status = "missingCairoEndpoint"
                elif start_verse > end_verse:
                    status = "reversedEndpoints"
            if status == "eligible":
                commentary_range_assessment["eligibleCandidates"] += 1
                expected_by_type["candidate_commentary_cairo_range_locator"].append({
                    "sourceLocator": f"{relative}#ref[{ordinal}]",
                    "sourceLine": ref.sourceline,
                    "sourceFileSha256": expected_hash,
                    "referenceTypeExact": ref.get("type"),
                    "referenceExactText": exact_text(ref),
                    "targetExact": target,
                    "attributesExact": dict(ref.attrib),
                    "candidateStartPassageNativeId": start_id,
                    "candidateEndPassageNativeId": end_id,
                    "candidateMethod": "strict-cc-koran-range-to-cairo-xml-id/1",
                    "candidateStatus": "unreviewed",
                    "sourceUrl": source_url(relative, ref.sourceline),
                })
            else:
                commentary_range_assessment[status] += 1

    source_reference_missing_targets: list[dict[str, object]] = []
    reference_coverage_by_collection: dict[str, dict[str, int]] = {}
    all_ref_elements = 0
    all_ref_targets = 0
    specialized_reference_overlap = 0
    reference_construct_counts = {name: 0 for name in REFERENCE_CONSTRUCTS}
    bibliography_coverage_by_collection: dict[str, dict[str, int]] = {}
    bibliography_keys: set[str] = set()
    local_bibliography_ids: set[str] = set()
    for path in source_xml_paths:
        relative = path.relative_to(args.tei).as_posix()
        expected_hash = expected_hashes.get(relative)
        if expected_hash is None or hashlib.sha256(path.read_bytes()).hexdigest() != expected_hash:
            errors.append(f"TEI reference source file hash mismatch: {relative}")
            continue
        tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
        for element in tree.iter():
            if isinstance(element.tag, str):
                name = etree.QName(element).localname
                if name in reference_construct_counts:
                    reference_construct_counts[name] += 1
        collection = path.parent.name
        bibliography_coverage = bibliography_coverage_by_collection.setdefault(
            collection, {"allBiblElements": 0, "withKey": 0, "withoutKey": 0,
                         "keyedEmptyText": 0})
        for element in tree.xpath(".//tei:biblStruct", namespaces=NS):
            native_id = element.get("{http://www.w3.org/XML/1998/namespace}id")
            if native_id:
                local_bibliography_ids.add(native_id)
        for ordinal, element in enumerate(tree.xpath(".//tei:bibl", namespaces=NS), 1):
            bibliography_coverage["allBiblElements"] += 1
            key = element.get("key")
            if key is None:
                bibliography_coverage["withoutKey"] += 1
                continue
            bibliography_coverage["withKey"] += 1
            bibliography_keys.add(key)
            exact_value = exact_text(element)
            if not exact_value.strip():
                bibliography_coverage["keyedEmptyText"] += 1
            expected_by_type["source_bibliographic_key_reference"].append({
                "sourceLocator": f"{relative}#bibl[{ordinal}]",
                "sourceLine": element.sourceline,
                "sourceFileSha256": expected_hash,
                "citationNativeId": element.get("{http://www.w3.org/XML/1998/namespace}id"),
                "citationTypeExact": element.get("type"),
                "citationKeyExact": key,
                "citationExactText": exact_value,
                "attributesExact": dict(element.attrib),
                "sourceUrl": source_url(relative, element.sourceline),
            })
        collection_coverage = reference_coverage_by_collection.setdefault(
            collection, {"allRefElements": 0, "withTarget": 0, "missingTarget": 0,
                         "representedBySpecializedRelationship": 0})
        for ordinal, ref in enumerate(tree.xpath(".//tei:ref", namespaces=NS), 1):
            line = ref.sourceline
            target = ref.get("target")
            collection_coverage["allRefElements"] += 1
            all_ref_elements += 1
            record = {
                "sourceLocator": f"{relative}#ref[{ordinal}]",
                "sourceLine": line,
                "sourceFileSha256": expected_hash,
                "referenceNativeId": ref.get("{http://www.w3.org/XML/1998/namespace}id"),
                "referenceTypeExact": ref.get("type"),
                "referenceExactText": exact_text(ref),
                "targetExact": target,
                "attributesExact": dict(ref.attrib),
                "sourceUrl": source_url(relative, line),
            }
            if target is not None and target.startswith("#TUK"):
                tuk_crosswalk_coverage["occurrences"] += 1
                match = TUK_TARGET_PATTERN.fullmatch(target)
                if match:
                    tuk_crosswalk_coverage["numericTargets"] += 1
                    native_id = f"tuk_{int(match.group(1), 10)}"
                    destination = intertext_records.get(native_id)
                    if destination:
                        record["targetResolution"] = {
                            "state": "exact_source_record",
                            "method": TUK_CROSSWALK_METHOD,
                            **destination,
                        }
                        tuk_crosswalk_coverage["resolvedOccurrences"] += 1
                        resolved_tuk_ids.add(native_id)
                    else:
                        tuk_crosswalk_coverage["missingNumericTargets"] += 1
                else:
                    tuk_crosswalk_coverage["malformedTargets"] += 1
            if target is None:
                collection_coverage["missingTarget"] += 1
                source_reference_missing_targets.append(record)
                continue
            all_ref_targets += 1
            collection_coverage["withTarget"] += 1
            if collection == "quran_commentary" and ref.get("type") == "koran":
                collection_coverage["representedBySpecializedRelationship"] += 1
                specialized_reference_overlap += 1
            else:
                expected_by_type["source_explicit_tei_reference"].append(record)

    if (graph.get("readerAuthorities") != sorted(expected_authorities.values(), key=lambda row: row["nativeKey"])):
        errors.append("deduplicated reader authority nodes differ from source records")
    expected_counts = {key: len(rows) for key, rows in expected_by_type.items()}
    if graph.get("countsByType") != expected_counts:
        errors.append("graph edge-type totals mismatch")
    asset_rows = graph.get("assets", [])
    checked_by_type = {key: [] for key in expected_by_type}
    seen_paths: set[str] = set()
    for asset in asset_rows:
        name = asset.get("path", "")
        if not name or Path(name).name != name or name in seen_paths:
            errors.append(f"unsafe or duplicate graph shard path: {name}")
            continue
        seen_paths.add(name)
        asset_path = args.graph.parent / name
        if not asset_path.is_file():
            errors.append(f"graph shard is missing: {name}")
            continue
        raw = asset_path.read_bytes()
        if len(raw) != asset.get("bytes") or hashlib.sha256(raw).hexdigest() != asset.get("sha256"):
            errors.append(f"graph shard size/hash mismatch: {name}")
        shard = json.loads(raw)
        if shard.get("sourceCommit") != COMMIT or shard.get("sourceLicense") != LICENSE:
            errors.append(f"graph shard provenance/license mismatch: {name}")
        relationship_type = shard.get("relationshipType")
        if relationship_type not in checked_by_type:
            errors.append(f"unknown graph relationship type in shard: {name}")
            continue
        candidate_types = {"candidate_cairo_word_locator", "candidate_commentary_cairo_range_locator"}
        if shard.get("state") != ("candidate" if relationship_type in candidate_types else "source_reported"):
            errors.append(f"unsupported graph relationship state: {name}")
        if shard.get("edges") != expected_by_type[relationship_type][len(checked_by_type[relationship_type]):
                                                                  len(checked_by_type[relationship_type]) + len(shard.get("edges", []))]:
            errors.append(f"graph shard rows differ from source: {name}")
        checked_by_type[relationship_type].extend(shard.get("edges", []))
        if shard.get("edgeCount") != len(shard.get("edges", [])) or asset.get("edgeCount") != len(shard.get("edges", [])):
            errors.append(f"graph shard edge count mismatch: {name}")
    if checked_by_type != expected_by_type:
        errors.append("graph shard coverage or ordering differs from source")
    if graph.get("edgeCount") != sum(expected_counts.values()):
        errors.append("graph total edge count mismatch")
    if graph.get("distinctCommentaryTargetValues") != len(target_values):
        errors.append("distinct commentary target count mismatch")
    if graph.get("commentaryRangeTargetAssessment") != commentary_range_assessment:
        errors.append("commentary target range assessment differs from source")
    expected_reference_coverage = {
        "allRefElements": all_ref_elements,
        "withTarget": all_ref_targets,
        "edgesIncluded": len(expected_by_type["source_explicit_tei_reference"]),
        "missingTarget": len(source_reference_missing_targets),
        "representedBySpecializedRelationship": specialized_reference_overlap,
        "linkConstructCounts": reference_construct_counts,
        "byCollection": reference_coverage_by_collection,
        "missingTargetRecords": source_reference_missing_targets,
    }
    if graph.get("sourceReferenceCoverage") != expected_reference_coverage:
        errors.append("explicit TEI reference inventory differs from source")
    expected_tuk_crosswalk = {
        **tuk_crosswalk_coverage,
        "resolvedNativeIdCount": len(resolved_tuk_ids),
        "method": TUK_CROSSWALK_METHOD,
        "pinnedRecordCount": len(intertext_records),
    }
    if graph.get("intertextTargetCrosswalk") != expected_tuk_crosswalk:
        errors.append("publisher-coded intertext target crosswalk differs from pinned TEI records")
    if expected_tuk_crosswalk != {
        "occurrences": 183,
        "numericTargets": 182,
        "resolvedOccurrences": 146,
        "missingNumericTargets": 36,
        "malformedTargets": 1,
        "resolvedNativeIdCount": 100,
        "method": TUK_CROSSWALK_METHOD,
        "pinnedRecordCount": 713,
    }:
        errors.append("publisher-coded intertext target counts differ from the audited source inventory")
    expected_bibliography_coverage = {
        "allBiblElements": sum(row["allBiblElements"] for row in bibliography_coverage_by_collection.values()),
        "withKey": len(expected_by_type["source_bibliographic_key_reference"]),
        "withoutKey": sum(row["withoutKey"] for row in bibliography_coverage_by_collection.values()),
        "keyedEmptyText": sum(row["keyedEmptyText"] for row in bibliography_coverage_by_collection.values()),
        "distinctKeyValues": len(bibliography_keys),
        "localBiblStructIds": len(local_bibliography_ids),
        "keyValuesMatchingLocalBiblStructIds": len(bibliography_keys & local_bibliography_ids),
        "unresolvedKeyValues": len(bibliography_keys - local_bibliography_ids),
        "byCollection": bibliography_coverage_by_collection,
    }
    if graph.get("sourceBibliographyKeyCoverage") != expected_bibliography_coverage:
        errors.append("TEI bibliography-key occurrence inventory differs from source")
    if reader_count != 30112 or candidate_count != 34163 or ref_count != 15977:
        errors.append("source coverage differs from audited pinned counts")
    if commentary_range_assessment != {
        "referenceCount": 15977, "eligibleCandidates": 13719, "patternNotMatched": 0,
        "crossSurah": 18, "zeroEndpoint": 2224, "missingCairoEndpoint": 7,
        "reversedEndpoints": 9,
    }:
        errors.append("commentary Cairo target candidate coverage differs from audited pinned counts")
    if all_ref_elements != 30940 or all_ref_targets != 30936 or len(source_reference_missing_targets) != 4:
        errors.append("explicit TEI ref element coverage differs from audited pinned counts")
    if (expected_bibliography_coverage["allBiblElements"] != 10678
            or expected_bibliography_coverage["withKey"] != 4201
            or expected_bibliography_coverage["distinctKeyValues"] != 770
            or expected_bibliography_coverage["localBiblStructIds"] != 58
            or expected_bibliography_coverage["keyValuesMatchingLocalBiblStructIds"] != 0):
        errors.append("TEI bibliography-key coverage differs from audited pinned counts")
    expected_reference_construct_counts = {
        "ref": 30940, "ptr": 0, "relation": 0, "link": 0,
        "linkGrp": 0, "listRelation": 0, "join": 0, "joinGrp": 0, "anchor": 4,
    }
    if reference_construct_counts != expected_reference_construct_counts:
        errors.append("explicit TEI link-construct coverage differs from audited pinned counts")
    print(json.dumps({
        "edgeCount": sum(expected_counts.values()), "readerAuthorityEdges": reader_count,
        "candidateEdges": candidate_count, "commentaryReferences": ref_count,
        "explicitTeiReferences": len(expected_by_type["source_explicit_tei_reference"]),
        "commentaryRangeCandidates": commentary_range_assessment["eligibleCandidates"],
        "referencesWithoutTarget": len(source_reference_missing_targets),
        "bibliographyKeyOccurrences": len(expected_by_type["source_bibliographic_key_reference"]),
        "distinctBibliographyKeys": len(bibliography_keys),
        "bibliographyKeysResolvingToLocalRecords": len(bibliography_keys & local_bibliography_ids),
        "referenceConstructCounts": reference_construct_counts,
        "distinctCommentaryTargetValues": len(target_values), "errors": errors,
    }, ensure_ascii=True, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
