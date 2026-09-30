#!/usr/bin/env python3
"""Verify the Quran release pointer, immutable manifest, and public JSON assets."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path("public/data/quran")
CORE_ASSETS = {"variants.json", "manuscripts.json", "reader-record-counts.json"}
EXPECTED_COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--check-current-script-hashes", action="store_true",
        help="also require the recorded Quran scripts to match the current checkout",
    )
    args = parser.parse_args()
    pointer = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    release_id = pointer["releaseId"]
    release_dir = ROOT / "releases" / release_id
    manifest_path = release_dir / "release.json"
    manifest_bytes = manifest_path.read_bytes()
    manifest = json.loads(manifest_bytes)
    errors = []
    if hashlib.sha256(manifest_bytes).hexdigest() != pointer.get("manifestSha256"):
        errors.append("release manifest hash does not match the root pointer")
    if manifest.get("releaseId") != release_id or manifest.get("sourceCommit") != EXPECTED_COMMIT:
        errors.append("release id or source commit mismatch")
    previous = manifest.get("previousRelease")
    if previous:
        previous_url = previous.get("manifest", "")
        if not previous_url.startswith("/data/quran/"):
            errors.append("previous release manifest URL is outside the Quran data root")
        else:
            previous_path = ROOT.parent.parent / previous_url.lstrip("/")
            if not previous_path.is_file() or sha256(previous_path) != previous.get("manifestSha256"):
                errors.append("previous release manifest is missing or has a bad checksum")
    provenance = manifest.get("buildProvenance")
    if provenance:
        if (not isinstance(provenance.get("workingTreeDirty"), bool)
                or len(provenance.get("baseCommit", "")) != 40
                or not isinstance(provenance.get("quranScriptSha256"), dict)
                or not provenance.get("quranScriptTreeSha256")):
            errors.append("build provenance is incomplete")
        if provenance.get("workingTreeDirty") and provenance.get("buildCommit") is not None:
            errors.append("dirty build provenance claims a clean build commit")
        if not provenance.get("workingTreeDirty") and provenance.get("buildCommit") != provenance.get("baseCommit"):
            errors.append("clean build commit does not match the recorded base commit")
        script_hashes = provenance.get("quranScriptSha256", {})
        if not script_hashes:
            errors.append("build provenance has no Quran script hashes")
        for relative, expected_hash in script_hashes.items():
            script = Path(relative)
            if (script.is_absolute() or ".." in script.parts
                    or not re.fullmatch(r"[0-9a-f]{64}", expected_hash)):
                errors.append(f"Quran builder source hash is malformed: {relative}")
                continue
            if args.check_current_script_hashes:
                if not script.is_file() or sha256(script) != expected_hash:
                    errors.append(f"Quran builder source is missing or has changed: {relative}")
        canonical_script_hashes = (
            json.dumps(script_hashes, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n"
        ).encode("utf-8")
        if sha256_bytes(canonical_script_hashes) != provenance.get("quranScriptTreeSha256"):
            errors.append("Quran script tree hash does not match its recorded script hashes")
    notes = manifest.get("releaseNotes")
    if notes:
        notes_url = notes.get("path", "")
        if not notes_url.startswith("/data/quran/"):
            errors.append("release notes URL is outside the Quran data root")
        else:
            notes_path = ROOT.parent.parent / notes_url.lstrip("/")
            if (not notes_path.is_file() or notes_path.stat().st_size != notes.get("bytes")
                    or sha256(notes_path) != notes.get("sha256")):
                errors.append("release notes are missing or have a bad checksum")
    if not CORE_ASSETS.issubset(set(manifest.get("assets", {}))):
        errors.append("release is missing one or more required base assets")
    output_assets = {}
    for name, asset in manifest.get("assets", {}).items():
        asset_url = asset.get("path", "")
        if not asset_url.startswith("/data/quran/"):
            errors.append(f"asset URL outside Quran data root: {name}")
            continue
        path = ROOT.parent.parent / asset_url.lstrip("/")
        if not path.is_file():
            errors.append(f"missing asset: {name}")
            continue
        actual_hash = sha256(path)
        if actual_hash != asset.get("sha256") or path.stat().st_size != asset.get("bytes"):
            errors.append(f"asset checksum/size mismatch: {name}")
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("sourceCommit") != EXPECTED_COMMIT or data.get("sourceLicense") != "CC BY-SA 4.0":
            errors.append(f"asset provenance/license mismatch: {name}")
        output_assets[name] = {"bytes": path.stat().st_size, "sha256": actual_hash}
        if name in CORE_ASSETS:
            alias_path = ROOT / name
            alias = json.loads(alias_path.read_text(encoding="utf-8"))
            if (alias.get("kind") != "immutable-release-pointer"
                    or alias.get("releaseId") != release_id
                    or alias.get("artifact") != asset.get("path")
                    or alias.get("sha256") != actual_hash):
                errors.append(f"mutable alias mismatch: {name}")
    variants = json.loads((release_dir / "variants.json").read_text(encoding="utf-8"))
    manuscripts = json.loads((release_dir / "manuscripts.json").read_text(encoding="utf-8"))
    counts = json.loads((release_dir / "reader-record-counts.json").read_text(encoding="utf-8"))
    if variants.get("recordCount") != 24 or variants.get("completeSourceRecordCount") != 18000:
        errors.append("variant preview coverage mismatch")
    if manuscripts.get("recordCount") != 2322 or manuscripts.get("recordsWithoutNativeId") != 2322:
        errors.append("manuscript catalogue coverage/identifier disclosure mismatch")
    manuscript_element_coverage = manifest.get("coverage", {}).get("manuscriptElements")
    if manuscript_element_coverage:
        shard_catalog = {row.get("path"): row for row in manuscripts.get("elementShards", [])}
        listed_shards = {name for name in manifest.get("assets", {})
                         if name.startswith("manuscript-elements-")}
        if set(shard_catalog) != listed_shards:
            errors.append("manuscript element shard set differs from release asset manifest")
        element_total = record_total = 0
        seen_record_locators: set[str] = set()
        for name, shard_info in shard_catalog.items():
            if name not in manifest.get("assets", {}):
                errors.append(f"manuscript element shard absent from release manifest: {name}")
                continue
            shard_path = release_dir / name
            if not shard_path.is_file():
                errors.append(f"missing manuscript element shard: {name}")
                continue
            payload = json.loads(shard_path.read_text(encoding="utf-8"))
            shard_records = payload.get("records", [])
            shard_elements = 0
            for record in shard_records:
                locator = record.get("recordLocator", "")
                if not locator or locator in seen_record_locators:
                    errors.append(f"duplicate or missing manuscript source record locator: {name}")
                    break
                seen_record_locators.add(locator)
                elements = record.get("elements", [])
                shard_elements += len(elements)
                if (len(elements) != record.get("elementCount")
                        or not record.get("sourceFile") or not record.get("sourceFileSha256")):
                    errors.append(f"manuscript source element record identity/count mismatch: {name}")
                    break
                for element in elements:
                    if (not isinstance(element.get("exactText"), str)
                            or not element.get("locator") or not element.get("sourceUrl")
                            or not element.get("elementPath")
                            or not isinstance(element.get("attributes"), list)
                            or not isinstance(element.get("line"), int)):
                        errors.append(f"manuscript TEI element lacks exact text or locator: {name}")
                        break
            if (payload.get("sourceCommit") != EXPECTED_COMMIT
                    or payload.get("sourceLicense") != "CC BY-SA 4.0"
                    or len(shard_records) != shard_info.get("recordCount")
                    or shard_elements != shard_info.get("elementCount")
                    or shard_elements != manifest.get("assets", {}).get(name, {}).get("sourceElementCount")):
                errors.append(f"manuscript element shard metadata mismatch: {name}")
            record_total += len(shard_records)
            element_total += shard_elements
        record_lookup = {row.get("recordLocator"): row for row in manuscripts.get("records", [])}
        if any(row.get("elementShard") not in shard_catalog
               or row.get("recordLocator") not in seen_record_locators
               for row in manuscripts.get("records", [])):
            errors.append("manuscript catalog contains a record without a complete element shard")
        if (record_total != manuscripts.get("recordCount")
                or record_total != manuscript_element_coverage.get("recordCount")
                or element_total != manuscripts.get("sourceElementCount")
                or element_total != manuscript_element_coverage.get("sourceElementCount")
                or len(shard_catalog) != manuscript_element_coverage.get("elementShardCount")
                or len(record_lookup) != record_total):
            errors.append("manuscript element source coverage totals mismatch")
    analysis_members = [member for row in counts.get("rows", []) for member in row.get("variantRecords", [])]
    analysis_ids = {member.get("variantId") for member in analysis_members}
    analysis_labels = sum(member.get("labelOrdinal") is not None for member in analysis_members)
    if (counts.get("recordCount") != 18000 or len(analysis_ids) != 18000
            or counts.get("sourceLabelEntryCount") != 30112 or analysis_labels != 30112
            or len(counts.get("rows", [])) != 754):
        errors.append("reader-label analysis record, entry, or group coverage mismatch")
    catalog_path = release_dir / "variant-catalog.json"
    if catalog_path.is_file():
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        catalog_records = catalog.get("records", [])
        catalog_ids = [record.get("variantId") for record in catalog_records]
        if catalog.get("recordCount") != 18000 or len(catalog_records) != 18000:
            errors.append("complete variant catalog record count mismatch")
        if catalog.get("completeSourceRecordCount") != 18000 or len(set(catalog_ids)) != 18000:
            errors.append("complete variant catalog source coverage or ID uniqueness mismatch")
        if catalog.get("candidateWordCount") != 34163:
            errors.append("complete variant catalog candidate-word total mismatch")
        if catalog.get("passageCount") != 3492:
            errors.append("complete variant catalog passage count mismatch")
        shard_names = set()
        shard_ids = []
        candidate_total = 0
        for shard in catalog.get("detailShards", []):
            name = shard.get("path", "")
            shard_names.add(name)
            if name not in manifest.get("assets", {}):
                errors.append(f"detail shard is absent from release manifest: {name}")
                continue
            path = release_dir / name
            if not path.is_file():
                errors.append(f"missing variant detail shard: {name}")
                continue
            data = json.loads(path.read_text(encoding="utf-8"))
            ids = [record.get("variantId") for record in data.get("records", [])]
            shard_ids.extend(ids)
            if len(ids) != shard.get("recordCount"):
                errors.append(f"variant shard record count mismatch: {name}")
            if (data.get("schemaVersion") != "3" or data.get("sourceCommit") != EXPECTED_COMMIT
                    or manifest.get("assets", {}).get(name, {}).get("schemaVersion") != data.get("schemaVersion")):
                errors.append(f"variant shard schema/provenance mismatch: {name}")
            candidate_total += sum(1 for record in data.get("records", [])
                                   for word in record.get("words", []) if word.get("alignment"))
        if set(name for name in manifest.get("assets", {}) if name.startswith("variant-details-")) != shard_names:
            errors.append("manifest detail shard set differs from the catalog")
        reader_index_paths = {entry.get("path") for entry in catalog.get("readerIndexFiles", [])}
        packaged_reader_records = set()
        packaged_reader_labels = 0
        if len(reader_index_paths) != 2:
            errors.append("complete variant catalog must declare both reader-reference index assets")
        for name in reader_index_paths:
            if name not in manifest.get("assets", {}) or not (release_dir / name).is_file():
                errors.append(f"reader-reference index is absent from release: {name}")
                continue
            reader_index = json.loads((release_dir / name).read_text(encoding="utf-8"))
            if (reader_index.get("schemaVersion") != "1"
                    or manifest.get("assets", {}).get(name, {}).get("schemaVersion") != reader_index.get("schemaVersion")):
                errors.append(f"reader-reference index schema-version mismatch: {name}")
            for record in reader_index.get("records", []):
                if record.get("variantId") in packaged_reader_records:
                    errors.append(f"duplicate variant in reader-reference indexes: {record.get('variantId')}")
                packaged_reader_records.add(record.get("variantId"))
                packaged_reader_labels += len(record.get("references", []))
        if packaged_reader_labels != 30112 or len(packaged_reader_records) != 17986:
            errors.append("reader-reference index source coverage mismatch")
        release_variant_counts = manifest.get("coverage", {}).get("variants", {})
        if (catalog.get("readerReferenceCount") != packaged_reader_labels
                or release_variant_counts.get("readerReferenceCount") != packaged_reader_labels):
            errors.append("catalog and release reader-reference totals differ from complete index coverage")
        if len(shard_ids) != 18000 or len(set(shard_ids)) != 18000 or set(shard_ids) != set(catalog_ids):
            errors.append("variant detail shards do not cover the complete catalog IDs exactly once")
        if candidate_total != 34163:
            errors.append("variant detail shard candidate-word total mismatch")
        passage_name = catalog.get("passageIndexFile")
        if passage_name not in manifest.get("assets", {}):
            errors.append("complete candidate passage index is absent from release manifest")
        elif passage_name:
            passage_path = release_dir / passage_name
            if not passage_path.is_file():
                errors.append("complete candidate passage index file is missing")
            else:
                passage_asset = manifest["assets"][passage_name]
                passage_hash = sha256(passage_path)
                passage_index = json.loads(passage_path.read_text(encoding="utf-8"))
                passages = passage_index.get("passages", {})
                if (passage_hash != catalog.get("passageIndexSha256")
                        or passage_hash != passage_asset.get("sha256")
                        or passage_path.stat().st_size != catalog.get("passageIndexBytes")
                        or len(passages) != 3492
                        or passage_index.get("passageCount") != 3492):
                    errors.append("passage index hash, size, or coverage mismatch")
                passage_candidates = 0
                passage_record_ids = set()
                for verse_id, passage in passages.items():
                    if not isinstance(passage.get("exactText"), str) or not passage.get("sourceUrl"):
                        errors.append(f"passage is missing its exact context or source locator: {verse_id}")
                    for entry in passage.get("records", []):
                        variant_id = entry.get("variantId")
                        if variant_id not in set(catalog_ids):
                            errors.append(f"passage references unknown variant record: {variant_id}")
                        passage_record_ids.add(variant_id)
                        for word in entry.get("words", []):
                            passage_candidates += 1
                            if not word.get("targetSourceLocator") or not word.get("targetSourceUrl"):
                                errors.append(f"candidate lacks Cairo token provenance: {verse_id}/{variant_id}")
                if passage_candidates != 34163 or passage_index.get("candidateWordCount") != 34163:
                    errors.append("passage index candidate-word total mismatch")
                if passage_record_ids - set(catalog_ids):
                    errors.append("passage index contains variant IDs outside the catalog")
    graph_coverage = manifest.get("coverage", {}).get("researchGraph")
    if graph_coverage:
        graph_name = graph_coverage.get("manifestName", "research-graph-manifest.json")
        if graph_name not in manifest.get("assets", {}):
            errors.append("release research graph manifest is absent from asset manifest")
        else:
            graph_path = release_dir / graph_name
            graph = json.loads(graph_path.read_text(encoding="utf-8"))
            graph_asset_names = {row.get("path") for row in graph.get("assets", [])}
            if not graph_asset_names <= set(manifest.get("assets", {})):
                errors.append("research graph shard set differs from the release manifest")
            edge_totals = {}
            checked_edge_total = 0
            for graph_asset in graph.get("assets", []):
                name = graph_asset.get("path", "")
                if name not in manifest.get("assets", {}):
                    errors.append(f"research graph shard is absent from release manifest: {name}")
                    continue
                path = release_dir / name
                if not path.is_file():
                    errors.append(f"missing research graph shard: {name}")
                    continue
                data = json.loads(path.read_text(encoding="utf-8"))
                relationship_type = data.get("relationshipType")
                if data.get("edgeCount") != len(data.get("edges", [])):
                    errors.append(f"research graph edge count mismatch: {name}")
                if len(data.get("edges", [])) != graph_asset.get("edgeCount"):
                    errors.append(f"research graph shard manifest count mismatch: {name}")
                edge_totals[relationship_type] = edge_totals.get(relationship_type, 0) + len(data.get("edges", []))
                checked_edge_total += len(data.get("edges", []))
            if (edge_totals != graph.get("countsByType")
                    or checked_edge_total != graph.get("edgeCount")
                    or graph_coverage.get("edgeCount") != checked_edge_total
                    or graph_coverage.get("countsByType") != edge_totals):
                errors.append("research graph coverage totals mismatch")
    commentary_coverage = manifest.get("coverage", {}).get("commentary")
    if commentary_coverage:
        commentary_name = "commentary-manifest.json"
        if commentary_name not in manifest.get("assets", {}):
            errors.append("release commentary manifest is absent from asset manifest")
        else:
            commentary_path = release_dir / commentary_name
            commentary = json.loads(commentary_path.read_text(encoding="utf-8"))
            commentary_assets = {row.get("path"): row for row in commentary.get("assets", [])}
            listed_commentary_assets = {
                name for name in manifest.get("assets", {})
                if name == commentary_name or name.startswith("commentary-sura-")
            }
            if set(commentary_assets) | {commentary_name} != listed_commentary_assets:
                errors.append("commentary shard set differs from the release manifest")
            commentary_total = 0
            commentary_element_total = 0
            commentary_header_total = 0
            source_files = set()
            for name, source_asset in commentary_assets.items():
                if name not in manifest.get("assets", {}):
                    errors.append(f"commentary shard is absent from release manifest: {name}")
                    continue
                path = release_dir / name
                if not path.is_file():
                    errors.append(f"missing commentary shard: {name}")
                    continue
                data = json.loads(path.read_text(encoding="utf-8"))
                records = data.get("records", [])
                source_elements = data.get("sourceElements", [])
                header_elements = data.get("headerElements", [])
                source_files.add(data.get("sourceFile"))
                commentary_total += len(records)
                commentary_element_total += len(source_elements)
                commentary_header_total += len(header_elements)
                if (data.get("recordCount") != len(records)
                        or len(records) != source_asset.get("recordCount")
                        or data.get("sourceElementCount") != len(source_elements)
                        or len(source_elements) != source_asset.get("sourceElementCount")
                        or data.get("headerElementCount") != len(header_elements)
                        or len(header_elements) != source_asset.get("headerElementCount")
                        or data.get("sourceFileSha256") != source_asset.get("sourceFileSha256")):
                    errors.append(f"commentary record count or source identity mismatch: {name}")
                for record in records:
                    if (not isinstance(record.get("exactText"), str)
                            or not record.get("locator") or not record.get("sourceUrl")
                            or not isinstance(record.get("line"), int)
                            or not record.get("elementPath")):
                        errors.append(f"commentary record lacks exact source text or locator: {name}")
                        break
                for record in source_elements:
                    if (not isinstance(record.get("exactText"), str)
                            or not record.get("locator") or not record.get("sourceUrl")
                            or not isinstance(record.get("line"), int)
                            or not record.get("elementPath")
                            or not isinstance(record.get("attributes"), list)):
                        errors.append(f"commentary source element lacks text, attributes, or locator: {name}")
                        break
                for record in header_elements:
                    if (not isinstance(record.get("exactText"), str)
                            or not record.get("locator") or not record.get("sourceUrl")
                            or not isinstance(record.get("attributes"), list)
                            or not record.get("elementPath")):
                        errors.append(f"commentary header element lacks text, attributes, or locator: {name}")
                        break
            if (commentary_total != commentary.get("recordCount")
                    or commentary_total != commentary_coverage.get("recordCount")
                    or len(source_files) != 85
                    or commentary.get("sourceFileCount") != 85
                    or commentary_coverage.get("sourceFileCount") != 85
                    or commentary_element_total != commentary.get("sourceElementCount")
                    or commentary_element_total != commentary_coverage.get("sourceElementCount")
                    or commentary_header_total != commentary.get("headerElementCount")
                    or commentary_header_total != commentary_coverage.get("headerElementCount")
                    or commentary_coverage.get("sourceElementTextUtf8Bytes") != commentary.get("sourceElementTextUtf8Bytes")
                    or commentary_coverage.get("headerElementTextUtf8Bytes") != commentary.get("headerElementTextUtf8Bytes")
                    or commentary_coverage.get("shardCount") != len(commentary_assets)):
                errors.append("commentary source/record/element coverage totals mismatch")
    intertext_coverage = manifest.get("coverage", {}).get("intertexts")
    if intertext_coverage:
        name = "intertext-catalog.json"
        if name not in manifest.get("assets", {}):
            errors.append("release intertext catalogue is absent from asset manifest")
        else:
            intertext_path = release_dir / name
            intertexts = json.loads(intertext_path.read_text(encoding="utf-8"))
            records = intertexts.get("records", [])
            native_ids = [record.get("nativeId") for record in records if record.get("nativeId")]
            if (len(records) != 713 or intertexts.get("recordCount") != 713
                    or intertext_coverage.get("recordCount") != 713
                    or len({row.get("source", {}).get("file") for row in records}) != 713
                    or intertexts.get("sourceFileCount") != 714
                    or intertext_coverage.get("sourceFileCount") != 714
                    or intertext_coverage.get("recordSourceFileCount") != 713
                    or len(native_ids) != 713 or len(set(native_ids)) != 713):
                errors.append("intertext source record, file, or native ID coverage mismatch")
            for record in records:
                if not record.get("source", {}).get("sha256") or not record.get("source", {}).get("url"):
                    errors.append("intertext record lacks source file hash or line URL")
                    break
                for field in record.get("fields", {}).values():
                    for value in field.get("values", []):
                        if (not isinstance(value.get("exactText"), str)
                                or not value.get("locator") or not value.get("sourceUrl")
                                or not isinstance(value.get("line"), int)):
                            errors.append("intertext field lacks exact text or source locator")
                            break
    taxonomy_coverage = manifest.get("coverage", {}).get("intertextTaxonomy")
    if taxonomy_coverage:
        name = "intertext-taxonomy.json"
        if name not in manifest.get("assets", {}):
            errors.append("release intertext taxonomy is absent from asset manifest")
        else:
            taxonomy_path = release_dir / name
            taxonomy = json.loads(taxonomy_path.read_text(encoding="utf-8"))
            categories = taxonomy.get("categories", [])
            ids = [row.get("nativeId") for row in categories if row.get("nativeId")]
            ids_set = set(ids)
            if (len(categories) != 122 or taxonomy.get("categoryCount") != 122
                    or taxonomy_coverage.get("categoryCount") != 122
                    or taxonomy.get("topLevelCategoryCount") != 16
                    or taxonomy_coverage.get("topLevelCategoryCount") != 16
                    or len(ids) != 122 or len(ids_set) != 122):
                errors.append("intertext taxonomy category coverage/identity mismatch")
            if (taxonomy.get("explicitRecordCategoryReferenceCount") != 0
                    or taxonomy_coverage.get("explicitRecordCategoryReferenceCount") != 0):
                errors.append("taxonomy claims unsupported category-to-record links")
            for category in categories:
                parent = category.get("parentNativeId")
                if (not category.get("nativeId") or not category.get("elementPath")
                        or not category.get("locator") or not category.get("sourceUrl")
                        or not isinstance(category.get("line"), int)
                        or (category.get("depth") == 1 and parent != taxonomy.get("sourceFile", {}).get("taxonomyId"))
                        or (category.get("depth", 0) > 1 and parent not in ids_set)):
                    errors.append("taxonomy category lacks source locator or valid source hierarchy")
                    break
                for description in category.get("descriptions", []):
                    if (not isinstance(description.get("exactText"), str)
                            or not description.get("locator") or not description.get("sourceUrl")
                            or not isinstance(description.get("line"), int)):
                        errors.append("taxonomy description lacks exact text or source locator")
                        break
    concordance_coverage = manifest.get("coverage", {}).get("concordance")
    if concordance_coverage:
        catalog_name = "concordance-catalog.json"
        if catalog_name not in manifest.get("assets", {}):
            errors.append("release concordance catalog is absent from asset manifest")
        else:
            catalog = json.loads((release_dir / catalog_name).read_text(encoding="utf-8"))
            shards = catalog.get("shards", [])
            if (len(shards) != 114 or catalog.get("sourceFileCount") != 114
                    or catalog.get("recordCount") != 91_285
                    or catalog.get("fieldCount") != 3_833_970
                    or catalog.get("fieldTypeCount") != 42
                    or concordance_coverage.get("sourceFileCount") != 114
                    or concordance_coverage.get("recordCount") != 91_285
                    or concordance_coverage.get("fieldCount") != 3_833_970
                    or concordance_coverage.get("shardCount") != 114):
                errors.append("concordance catalog coverage mismatch")
            order = catalog.get("fieldOrderExact", [])
            if len(order) != 42 or len(set(order)) != 42:
                errors.append("concordance source-native field order is missing or duplicated")
            field_sum = record_sum = 0
            for shard in shards:
                name = shard.get("path", "")
                if name not in manifest.get("assets", {}):
                    errors.append(f"concordance shard absent from release asset manifest: {name}")
                    continue
                payload = json.loads((release_dir / name).read_text(encoding="utf-8"))
                records = payload.get("records", [])
                if (payload.get("sourceFile") != shard.get("sourceFile")
                        or payload.get("sourceFileSha256") != shard.get("sourceFileSha256")
                        or len(records) != shard.get("recordCount")
                        or payload.get("fieldCount") != shard.get("fieldCount")
                        or not shard.get("sourceTitleLocator")
                        or not isinstance(shard.get("sourceTitleLine"), int)
                        or not shard.get("sourceTitleSourceUrl")):
                    errors.append(f"concordance shard manifest mismatch: {name}")
                for record in records:
                    values = record.get("fieldValuesExact", [])
                    if (len(values) != 42 or not record.get("locator")
                            or not record.get("elementPath")
                            or not isinstance(record.get("line"), int)
                            or len(record.get("sourceUrl", "")) == 0):
                        errors.append(f"concordance record lacks source locator or full field values: {name}")
                        break
                record_sum += len(records)
                field_sum += payload.get("fieldCount", 0)
            if record_sum != 91_285 or field_sum != 3_833_970:
                errors.append("concordance shard totals do not sum to full source coverage")
    cairo_coverage = manifest.get("coverage", {}).get("cairoArabicText")
    if cairo_coverage:
        catalog_name = "cairo-arabic-catalog.json"
        if catalog_name not in manifest.get("assets", {}):
            errors.append("release Cairo Arabic catalog is absent from asset manifest")
        else:
            catalog = json.loads((release_dir / catalog_name).read_text(encoding="utf-8"))
            shards = catalog.get("shards", [])
            if (catalog.get("sourceFile") != "data/cairo_quran/cairoquran.xml"
                    or len(shards) != 114 or catalog.get("suraCount") != 114
                    or catalog.get("verseCount") != 6236 or catalog.get("wordTokenCount") != 77432
                    or cairo_coverage.get("verseCount") != 6236
                    or cairo_coverage.get("wordTokenCount") != 77432
                    or cairo_coverage.get("shardCount") != 114):
                errors.append("Cairo Arabic catalog coverage mismatch")
            seen_verses: set[str] = set()
            verse_total = word_total = 0
            for shard in shards:
                name = shard.get("path", "")
                if name not in manifest.get("assets", {}):
                    errors.append(f"Cairo Arabic shard absent from release asset manifest: {name}")
                    continue
                payload = json.loads((release_dir / name).read_text(encoding="utf-8"))
                rows = payload.get("records", [])
                if (payload.get("sourceFileSha256") != catalog.get("sourceFileSha256")
                        or payload.get("suraNativeId") != shard.get("suraNativeId")
                        or len(rows) != shard.get("verseCount")
                        or payload.get("wordTokenCount") != shard.get("wordTokenCount")):
                    errors.append(f"Cairo Arabic shard metadata mismatch: {name}")
                for row in rows:
                    verse_id = row.get("verseNativeId")
                    if (not verse_id or verse_id in seen_verses or not row.get("locator")
                            or not row.get("sourceUrl") or not row.get("verseLocator")
                            or not row.get("verseSourceUrl") or not isinstance(row.get("line"), int)):
                        errors.append(f"Cairo Arabic verse lacks unique source identity/locator: {name}")
                        break
                    seen_verses.add(verse_id)
                    words = row.get("words", [])
                    if any(not word.get("nativeId") or not word.get("locator") or not word.get("sourceUrl")
                           or not isinstance(word.get("exactText"), str) for word in words):
                        errors.append(f"Cairo Arabic word lacks exact source identity/locator: {name}")
                        break
                    word_total += len(words)
                verse_total += len(rows)
            if verse_total != 6236 or word_total != 77432 or len(seen_verses) != 6236:
                errors.append("Cairo Arabic shards do not sum to the complete verse/token source")
    print(json.dumps({"releaseId": release_id, "releaseManifestSha256": pointer.get("manifestSha256"),
                      "assets": output_assets, "errors": errors}, ensure_ascii=True, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
