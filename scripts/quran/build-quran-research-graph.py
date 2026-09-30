#!/usr/bin/env python3
"""Build a provenance-carrying graph from explicit Corpus Coranicum links."""

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
ATTRIBUTION = (
    "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg "
    "Academy of Sciences and Humanities. https://github.com/telota/corpus-coranicum-tei."
)
LICENSE = "CC BY-SA 4.0"
TEI_NS = "http://www.tei-c.org/ns/1.0"
NS = {"tei": TEI_NS}
MAX_ASSET_BYTES = 25 * 1024 * 1024
REFERENCE_CONSTRUCTS = ("ref", "ptr", "relation", "link", "linkGrp", "listRelation", "join", "joinGrp", "anchor")
COMMENTARY_RANGE_PATTERN = re.compile(r"^koran-(\d{3}):(\d{3})-(\d{3}):(\d{3})$")
TUK_TARGET_PATTERN = re.compile(r"^#TUK([0-9]+)$")
TUK_CROSSWALK_METHOD = "corpus-coranicum-website-tuk-fragment-to-intertext-id/1"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def exact_text(element: etree._Element) -> str:
    value = "".join(element.itertext())
    return value[:-len(element.tail)] if element.tail and value.endswith(element.tail) else value


def source_url(relative: str, commit: str, line: int) -> str:
    return f"{REPOSITORY}/blob/{commit}/{relative}#L{line}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--full-index", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()

    commit = __import__("subprocess").run(
        ["git", "-C", str(args.tei), "rev-parse", "HEAD"],
        text=True, capture_output=True, check=True,
    ).stdout.strip()
    if commit != COMMIT:
        raise ValueError(f"Expected pinned TEI commit {COMMIT}; found {commit}")
    with sqlite3.connect(args.release_db) as db:
        metadata = dict(db.execute("SELECT key, value FROM data_release_metadata"))
        if metadata.get("source_commit") != COMMIT or metadata.get("source_license") != LICENSE:
            raise ValueError("release DB does not identify the pinned licensed Corpus Coranicum export")
        expected_hashes = dict(db.execute(
            "SELECT relative_path, sha256 FROM source_artifact WHERE snapshot_id='corpus-coranicum-tei'"))
    source_xml_paths = sorted((args.tei / "data").rglob("*.xml"))
    actual_xml_paths = {path.relative_to(args.tei).as_posix() for path in source_xml_paths}
    expected_xml_paths = {path for path in expected_hashes if path.startswith("data/") and path.endswith(".xml")}
    if len(source_xml_paths) != 3240 or actual_xml_paths != expected_xml_paths:
        missing = sorted(expected_xml_paths - actual_xml_paths)[:5]
        added = sorted(actual_xml_paths - expected_xml_paths)[:5]
        raise ValueError(
            f"Pinned TEI XML inventory mismatch: {len(source_xml_paths)} files; "
            f"missing={missing}; unregistered={added}"
        )

    full_index = json.loads(args.full_index.read_text(encoding="utf-8"))
    if full_index.get("sourceCommit") != COMMIT or full_index.get("sourceLicense") != LICENSE:
        raise ValueError("variant index does not identify the pinned licensed source")

    reader_edges: list[dict[str, object]] = []
    candidate_edges: list[dict[str, object]] = []
    commentary_range_candidates: list[dict[str, object]] = []
    commentary_range_assessment = {
        "referenceCount": 0, "eligibleCandidates": 0, "patternNotMatched": 0,
        "crossSurah": 0, "zeroEndpoint": 0, "missingCairoEndpoint": 0,
        "reversedEndpoints": 0,
    }
    cairo_text_path = args.tei / "data/cairo_quran/cairoquran.xml"
    cairo_text_hash = expected_hashes.get("data/cairo_quran/cairoquran.xml")
    if cairo_text_hash is None or sha256(cairo_text_path) != cairo_text_hash:
        raise ValueError("Cairo source hash mismatch for commentary target assessment")
    cairo_tree = etree.parse(str(cairo_text_path), etree.XMLParser(resolve_entities=False, no_network=True))
    cairo_verse_ids = {
        element.get("{http://www.w3.org/XML/1998/namespace}id")
        for element in cairo_tree.xpath(".//*[@xml:id]", namespaces={"xml": "http://www.w3.org/XML/1998/namespace"})
        if (element.get("{http://www.w3.org/XML/1998/namespace}id") or "").startswith("verse-")
    }
    if len(cairo_verse_ids) != 6236:
        raise ValueError(f"Expected 6,236 Cairo verse IDs for target assessment; found {len(cairo_verse_ids)}")
    source_reference_edges: list[dict[str, object]] = []
    source_reference_missing_targets: list[dict[str, object]] = []
    intertext_records: dict[str, dict[str, object]] = {}
    intertext_paths = sorted((args.tei / "data/quran_intertexts").rglob("*.xml"))
    for path in intertext_paths:
        relative = path.relative_to(args.tei).as_posix()
        expected = expected_hashes.get(relative)
        if expected is None or sha256(path) != expected:
            raise ValueError(f"Intertext source hash mismatch: {relative}")
        tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
        for record in tree.xpath(".//tei:msDesc", namespaces=NS):
            native_id = record.get("{http://www.w3.org/XML/1998/namespace}id")
            if not native_id:
                continue
            if native_id in intertext_records:
                raise ValueError(f"Duplicate intertext xml:id: {native_id}")
            line = record.sourceline
            intertext_records[native_id] = {
                "nativeId": native_id,
                "recordLocator": f"{relative}#xml:id={native_id}",
                "sourceFile": relative,
                "sourceLine": line,
                "sourceFileSha256": expected,
                "sourceUrl": source_url(relative, COMMIT, line),
            }
    tuk_crosswalk_coverage = {"occurrences": 0, "numericTargets": 0, "resolvedOccurrences": 0,
                              "missingNumericTargets": 0, "malformedTargets": 0}
    resolved_tuk_ids: set[str] = set()
    reference_coverage_by_collection: dict[str, dict[str, int]] = {}
    bibliography_key_edges: list[dict[str, object]] = []
    bibliography_coverage_by_collection: dict[str, dict[str, int]] = {}
    bibliography_keys: set[str] = set()
    local_bibliography_ids: set[str] = set()
    reference_construct_counts = {name: 0 for name in REFERENCE_CONSTRUCTS}
    reader_authorities: dict[str, dict[str, object]] = {}
    for record in full_index.get("records", []):
        variant_id = record.get("variantId")
        record_source = record.get("sourceRecord", {})
        variant_url = record_source.get("url")
        variant_line = record_source.get("line")
        for reader_reference in record.get("readerReferences", []):
            reader = reader_reference.get("readerAuthority")
            if not reader:
                continue
            authority_key = reader.get("nativeKey")
            reader_authorities[authority_key] = {
                "nativeKey": authority_key,
                "exactLabel": reader.get("exactLabel"),
                "sourceUrl": reader.get("sourceUrl"),
            }
            reader_edges.append({
                "variantId": variant_id,
                "variantSourceUrl": variant_url,
                "readerAuthorityKey": authority_key,
                "sourceKeyExact": reader_reference.get("nativeKey"),
                "readerLabelExact": reader_reference.get("exactLabel"),
                "readerReferenceOrdinal": reader_reference.get("ordinal"),
                "readerReferenceSourceUrl": reader_reference.get("sourceRecord", {}).get("url"),
            })
        for word in record.get("words", []):
            alignment = word.get("alignment")
            if not alignment:
                continue
            candidate_edges.append({
                "variantId": variant_id,
                "variantSourceUrl": variant_url,
                "variantWordOrdinal": word.get("ordinal"),
                "variantWordLocator": word.get("sourceLocator"),
                "variantWordExactText": word.get("exactText"),
                "candidateMethod": alignment.get("method"),
                "cairoWordLocator": alignment.get("targetSourceLocator"),
                "cairoWordExactText": alignment.get("targetExactText"),
                "cairoWordSourceUrl": alignment.get("targetSourceUrl"),
                "passageNativeId": alignment.get("targetVerseId"),
            })

    commentary_files = sorted((args.tei / "data/quran_commentary").rglob("*.xml"))
    commentary_edges: list[dict[str, object]] = []
    commentary_target_values = set()
    for path in commentary_files:
        relative = path.relative_to(args.tei).as_posix()
        expected = expected_hashes.get(relative)
        if expected is None or sha256(path) != expected:
            raise ValueError(f"Commentary source hash mismatch: {relative}")
        tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
        for ordinal, ref in enumerate(tree.xpath(".//tei:ref", namespaces=NS), 1):
            if ref.get("type") != "koran":
                continue
            line = ref.sourceline
            target = ref.get("target")
            if target is None:
                raise ValueError(f"Quran reference is missing its target: {relative}#{line}")
            commentary_target_values.add(target)
            commentary_edges.append({
                "sourceLocator": f"{relative}#ref[{ordinal}]",
                "sourceLine": line,
                "sourceFileSha256": expected,
                "referenceExactText": exact_text(ref),
                "referenceTypeExact": ref.get("type"),
                "targetExact": target,
                "sourceUrl": source_url(relative, COMMIT, line),
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
                commentary_range_candidates.append({
                    "sourceLocator": f"{relative}#ref[{ordinal}]",
                    "sourceLine": line,
                    "sourceFileSha256": expected,
                    "referenceTypeExact": ref.get("type"),
                    "referenceExactText": exact_text(ref),
                    "targetExact": target,
                    "attributesExact": dict(ref.attrib),
                    "candidateStartPassageNativeId": start_id,
                    "candidateEndPassageNativeId": end_id,
                    "candidateMethod": "strict-cc-koran-range-to-cairo-xml-id/1",
                    "candidateStatus": "unreviewed",
                    "sourceUrl": source_url(relative, COMMIT, line),
                })
            else:
                commentary_range_assessment[status] += 1

    # Preserve every explicit TEI <ref> in the pinned data tree as a source
    # reference. Do not resolve targets into our own entity graph: the source's
    # target, type, visible text, attributes, and locator are the assertion.
    for path in source_xml_paths:
        relative = path.relative_to(args.tei).as_posix()
        expected = expected_hashes.get(relative)
        if expected is None or sha256(path) != expected:
            raise ValueError(f"TEI reference source hash mismatch: {relative}")
        tree = etree.parse(str(path), etree.XMLParser(resolve_entities=False, no_network=True))
        for element in tree.iter():
            if isinstance(element.tag, str):
                name = etree.QName(element).localname
                if name in reference_construct_counts:
                    reference_construct_counts[name] += 1
        collection = path.parent.name
        collection_coverage = reference_coverage_by_collection.setdefault(
            collection, {"allRefElements": 0, "withTarget": 0, "missingTarget": 0,
                        "representedBySpecializedRelationship": 0})
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
            bibliography_key_edges.append({
                "sourceLocator": f"{relative}#bibl[{ordinal}]",
                "sourceLine": element.sourceline,
                "sourceFileSha256": expected,
                "citationNativeId": element.get("{http://www.w3.org/XML/1998/namespace}id"),
                "citationTypeExact": element.get("type"),
                "citationKeyExact": key,
                "citationExactText": exact_value,
                "attributesExact": dict(element.attrib),
                "sourceUrl": source_url(relative, COMMIT, element.sourceline),
            })
        for ordinal, ref in enumerate(tree.xpath(".//tei:ref", namespaces=NS), 1):
            line = ref.sourceline
            target = ref.get("target")
            collection_coverage["allRefElements"] += 1
            exact_attributes = dict(ref.attrib)
            record = {
                "sourceLocator": f"{relative}#ref[{ordinal}]",
                "sourceLine": line,
                "sourceFileSha256": expected,
                "referenceNativeId": ref.get("{http://www.w3.org/XML/1998/namespace}id"),
                "referenceTypeExact": ref.get("type"),
                "referenceExactText": exact_text(ref),
                "targetExact": target,
                "attributesExact": exact_attributes,
                "sourceUrl": source_url(relative, COMMIT, line),
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
            else:
                collection_coverage["withTarget"] += 1
                if collection == "quran_commentary" and ref.get("type") == "koran":
                    collection_coverage["representedBySpecializedRelationship"] += 1
                else:
                    source_reference_edges.append(record)

    args.out_dir.mkdir(parents=True, exist_ok=True)

    def write_shards(prefix: str, edge_type: str, rows: list[dict[str, object]], state: str,
                     shard_size: int) -> list[dict[str, object]]:
        output = []
        for start in range(0, len(rows), shard_size):
            filename = f"{prefix}-{start // shard_size + 1:03d}.json"
            payload = {"sourceCommit": COMMIT, "sourceLicense": LICENSE,
                       "relationshipType": edge_type, "state": state,
                       "edgeCount": len(rows[start:start + shard_size]),
                       "edges": rows[start:start + shard_size]}
            encoded = (json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
            if len(encoded) > MAX_ASSET_BYTES:
                raise ValueError(f"Graph shard is {len(encoded)} bytes, above the static asset limit: {filename}")
            (args.out_dir / filename).write_bytes(encoded)
            output.append({"path": filename, "bytes": len(encoded),
                           "sha256": hashlib.sha256(encoded).hexdigest(),
                           "edgeCount": payload["edgeCount"]})
        return output

    reader_shards = write_shards("research-graph-v5-readers", "reported_reader_authority",
                                 reader_edges, "source_reported", 20000)
    candidate_shards = write_shards("research-graph-v5-candidates", "candidate_cairo_word_locator",
                                    candidate_edges, "candidate", 5000)
    commentary_shards = write_shards("research-graph-v5-commentary", "commentary_quran_reference",
                                     commentary_edges, "source_reported", 4000)
    source_reference_shards = write_shards(
        "research-graph-v5-refs", "source_explicit_tei_reference",
        source_reference_edges, "source_reported", 4000)
    commentary_range_shards = write_shards(
        "research-graph-v5-commentary-ranges", "candidate_commentary_cairo_range_locator",
        commentary_range_candidates, "candidate", 4000)
    bibliography_key_shards = write_shards(
        "research-graph-v5-bibliography", "source_bibliographic_key_reference",
        bibliography_key_edges, "source_reported", 4000)
    assets = (reader_shards + candidate_shards + commentary_shards + source_reference_shards
              + commentary_range_shards + bibliography_key_shards)
    payload = {
        "dataset": "Corpus Coranicum explicit Quran research relationships",
        "schemaVersion": "1",
        "dataVersion": f"cc-{COMMIT[:12]}-research-graph-v5",
        "sourceRepository": REPOSITORY,
        "sourceCommit": COMMIT,
        "sourceLicense": LICENSE,
        "attribution": ATTRIBUTION,
        "modificationNotice": (
            "Relationship rows preserve explicit reader keys, TEI ref targets, and candidate word locators. "
            "The reader-key prefix alias is recorded; Cairo word matches remain candidates. Commentary target "
            "strings are retained exactly and are not expanded or reconciled against another numbering system. "
            "All explicit TEI ref elements are inventoried with exact target/type/text/attributes and source "
            "locators; publisher-coded #TUK numeric targets are cross-linked only when a unique exact local "
            "msDesc xml:id exists; raw target strings remain unchanged. Other targets are not semantically "
            "classified. Bibliographic bibl keys and exact "
            "citation text are retained with source locators; keys remain unresolved because their referenced "
            "bibliography records are not included in this TEI snapshot. Commentary koran-range targets "
            "that match strict syntax and exact Cairo source IDs are exposed only as unreviewed navigation candidates."
        ),
        "relationshipStateDefinitions": {
            "source_reported": "The relationship is stated by an explicit source key or TEI reference.",
            "candidate": "A mechanical locator match that has not been reviewed as an equivalence.",
        },
        "edgeCount": (len(reader_edges) + len(candidate_edges) + len(commentary_edges)
                      + len(source_reference_edges) + len(commentary_range_candidates)
                      + len(bibliography_key_edges)),
        "countsByType": {
            "reported_reader_authority": len(reader_edges),
            "candidate_cairo_word_locator": len(candidate_edges),
            "commentary_quran_reference": len(commentary_edges),
            "source_explicit_tei_reference": len(source_reference_edges),
            "candidate_commentary_cairo_range_locator": len(commentary_range_candidates),
            "source_bibliographic_key_reference": len(bibliography_key_edges),
        },
        "distinctCommentaryTargetValues": len(commentary_target_values),
        "commentaryRangeTargetAssessment": commentary_range_assessment,
        "sourceReferenceCoverage": {
            "allRefElements": sum(row["allRefElements"] for row in reference_coverage_by_collection.values()),
            "withTarget": sum(row["withTarget"] for row in reference_coverage_by_collection.values()),
            "edgesIncluded": len(source_reference_edges),
            "missingTarget": len(source_reference_missing_targets),
            "representedBySpecializedRelationship": sum(
                row["representedBySpecializedRelationship"] for row in reference_coverage_by_collection.values()),
            "linkConstructCounts": reference_construct_counts,
            "byCollection": reference_coverage_by_collection,
            "missingTargetRecords": source_reference_missing_targets,
        },
        "intertextTargetCrosswalk": {
            **tuk_crosswalk_coverage,
            "resolvedNativeIdCount": len(resolved_tuk_ids),
            "method": TUK_CROSSWALK_METHOD,
            "pinnedRecordCount": len(intertext_records),
        },
        "sourceBibliographyKeyCoverage": {
            "allBiblElements": sum(row["allBiblElements"] for row in bibliography_coverage_by_collection.values()),
            "withKey": len(bibliography_key_edges),
            "withoutKey": sum(row["withoutKey"] for row in bibliography_coverage_by_collection.values()),
            "keyedEmptyText": sum(row["keyedEmptyText"] for row in bibliography_coverage_by_collection.values()),
            "distinctKeyValues": len(bibliography_keys),
            "localBiblStructIds": len(local_bibliography_ids),
            "keyValuesMatchingLocalBiblStructIds": len(bibliography_keys & local_bibliography_ids),
            "unresolvedKeyValues": len(bibliography_keys - local_bibliography_ids),
            "byCollection": bibliography_coverage_by_collection,
        },
        "readerAuthorities": sorted(reader_authorities.values(), key=lambda row: row["nativeKey"]),
        "assets": assets,
    }
    encoded = (json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    manifest_path = args.out_dir / "research-graph-v5-manifest.json"
    manifest_path.write_bytes(encoded)
    print(json.dumps({
        "output": str(manifest_path), "bytes": len(encoded), "sha256": hashlib.sha256(encoded).hexdigest(),
        "edges": payload["edgeCount"], "readerAuthorityEdges": len(reader_edges),
        "candidateEdges": len(candidate_edges), "commentaryReferences": len(commentary_edges),
        "explicitTeiReferences": len(source_reference_edges),
        "commentaryRangeCandidates": len(commentary_range_candidates),
        "bibliographicKeyOccurrences": len(bibliography_key_edges),
        "distinctBibliographicKeys": len(bibliography_keys),
        "referencesWithoutTarget": len(source_reference_missing_targets),
        "distinctCommentaryTargetValues": len(commentary_target_values),
        "intertextTargetCrosswalk": payload["intertextTargetCrosswalk"],
    }, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
