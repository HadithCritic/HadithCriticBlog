#!/usr/bin/env python3
"""Copy cleared Quran JSON assets into an immutable, checksummed release."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import subprocess
from pathlib import Path

ASSETS = ("variants.json", "manuscripts.json", "reader-record-counts.json")
COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
LICENSE = "CC BY-SA 4.0"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def canonical_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n").encode("utf-8")


def build_provenance(repo_root: Path) -> dict[str, object]:
    script_paths = sorted(Path("scripts/quran").glob("*.py"))
    script_hashes = {
        path.as_posix(): sha256(repo_root / path)
        for path in script_paths
    }
    base_commit = subprocess.run(
        ["git", "-C", str(repo_root), "rev-parse", "HEAD"],
        text=True, capture_output=True, check=True,
    ).stdout.strip()
    status = subprocess.run(
        ["git", "-C", str(repo_root), "status", "--porcelain", "--untracked-files=all"],
        text=True, capture_output=True, check=True,
    ).stdout
    dirty = bool(status.strip())
    fingerprint = hashlib.sha256(canonical_bytes(script_hashes)).hexdigest()
    return {
        "buildCommit": None if dirty else base_commit,
        "baseCommit": base_commit,
        "workingTreeDirty": dirty,
        "quranScriptSha256": script_hashes,
        "quranScriptTreeSha256": fingerprint,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("public/data/quran"))
    parser.add_argument("--variant-package-dir", type=Path,
                        help="Optional complete catalog and detail shards from build-full-variant-browser-package.py")
    parser.add_argument("--graph-package-dir", type=Path,
                        help="Optional verified explicit relationship graph package from build-quran-research-graph.py")
    parser.add_argument("--commentary-package-dir", type=Path,
                        help="Optional verified source-located commentary text package from build-commentary-browser.py")
    parser.add_argument("--intertext-index", type=Path,
                        help="Optional independently verified Corpus Coranicum intertext source catalogue JSON")
    parser.add_argument("--intertext-taxonomy", type=Path,
                        help="Optional independently verified Corpus Coranicum intertext category taxonomy JSON")
    parser.add_argument("--concordance-package-dir", type=Path,
                        help="Optional verified, per-surah source-located concordance package")
    parser.add_argument("--cairo-text-package-dir", type=Path,
                        help="Optional verified full Cairo Arabic text package, sharded by surah")
    parser.add_argument("--manuscript-package-dir", type=Path,
                        help="Optional verified manuscript catalog and lazy complete-TEI-element shards")
    parser.add_argument("--release-id", required=True,
                        help="Immutable release directory name, for example v0.1.0-cc-57cb2b7be321")
    args = parser.parse_args()
    if not args.release_id.startswith("v") or "/" in args.release_id or "\\" in args.release_id:
        parser.error("release id must be a versioned directory name beginning with v")
    target = args.data_dir / "releases" / args.release_id
    target.mkdir(parents=True, exist_ok=True)
    repo_root = Path(__file__).resolve().parents[2]
    previous_release = None
    pointer_path = args.data_dir / "manifest.json"
    if pointer_path.is_file():
        previous_pointer = json.loads(pointer_path.read_text(encoding="utf-8"))
        previous_id = previous_pointer.get("releaseId")
        previous_manifest = previous_pointer.get("manifest")
        previous_hash = previous_pointer.get("manifestSha256")
        if previous_id and previous_manifest and previous_hash and previous_id != args.release_id:
            relative_manifest = Path(previous_manifest.lstrip("/"))
            prior_path = args.data_dir.parent.parent / relative_manifest
            if prior_path.is_file() and sha256(prior_path) == previous_hash:
                previous_release = {
                    "releaseId": previous_id,
                    "manifest": previous_manifest,
                    "manifestSha256": previous_hash,
                }
            else:
                raise ValueError("previous release pointer is missing or fails its recorded hash")

    sources = {}
    for name in ASSETS:
        if name == "manuscripts.json" and args.manuscript_package_dir:
            continue
        current = args.data_dir / name
        versioned = target / name
        source = None
        payload = None
        candidates = [current, versioned]
        if current.is_file():
            current_payload = json.loads(current.read_text(encoding="utf-8"))
            if current_payload.get("kind") == "immutable-release-pointer":
                target_path = current_payload.get("artifact", "")
                if target_path.startswith("/data/quran/"):
                    candidates.append(args.data_dir.parent.parent / target_path.lstrip("/"))
        for candidate in candidates:
            if not candidate.is_file():
                continue
            candidate_payload = json.loads(candidate.read_text(encoding="utf-8"))
            if candidate_payload.get("sourceCommit") == COMMIT and candidate_payload.get("sourceLicense") == LICENSE:
                source = candidate
                payload = candidate_payload
                break
        if source is None or payload is None:
            raise FileNotFoundError(f"No source data asset with pinned metadata is available for {name}")
        if payload.get("sourceCommit") != COMMIT or payload.get("sourceLicense") != LICENSE:
            raise ValueError(f"{name} does not identify the pinned licensed Corpus Coranicum source")
        digest = sha256(source)
        if versioned.exists():
            if sha256(versioned) != digest:
                raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
        elif source != versioned:
            shutil.copyfile(source, versioned)
            if sha256(versioned) != digest:
                raise IOError(f"Copied asset checksum mismatch: {name}")
        sources[name] = {
            "path": f"/data/quran/releases/{args.release_id}/{name}",
            "bytes": versioned.stat().st_size,
            "sha256": digest,
            "recordCount": payload.get("recordCount"),
            "schemaVersion": payload.get("schemaVersion"),
        }
        if name == "reader-record-counts.json":
            sources[name]["analysisVersion"] = payload.get("analysisVersion")
            sources[name]["resultSha256"] = payload.get("resultSha256")

    manuscript_element_coverage = None
    if args.manuscript_package_dir:
        catalog_path = args.manuscript_package_dir / "manuscripts.json"
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        if (catalog.get("sourceCommit") != COMMIT or catalog.get("sourceLicense") != LICENSE
                or catalog.get("recordCount") != 2322
                or catalog.get("sourceElementCount") != 192295
                or len(catalog.get("elementShards", [])) != catalog.get("elementShardCount")):
            raise ValueError("complete manuscript package does not match the independently audited source coverage")
        package_assets = [(catalog_path, None)]
        for shard in catalog["elementShards"]:
            name = shard.get("path", "")
            if not name or Path(name).name != name:
                raise ValueError(f"unsafe manuscript element shard name: {name}")
            source_path = args.manuscript_package_dir / name
            if (not source_path.is_file() or source_path.stat().st_size != shard.get("bytes")
                    or sha256(source_path) != shard.get("sha256")
                    or source_path.stat().st_size > 25 * 1024 * 1024):
                raise ValueError(f"missing, oversized, or mismatched manuscript element shard: {name}")
            package_assets.append((source_path, shard))
        for source_path, shard in package_assets:
            name = source_path.name
            versioned = target / name
            digest = sha256(source_path)
            if versioned.exists():
                if sha256(versioned) != digest:
                    raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
            else:
                shutil.copyfile(source_path, versioned)
                if sha256(versioned) != digest:
                    raise IOError(f"Copied manuscript asset checksum mismatch: {name}")
            asset = {"path": f"/data/quran/releases/{args.release_id}/{name}",
                     "bytes": versioned.stat().st_size, "sha256": digest}
            if shard is None:
                asset.update({"recordCount": catalog["recordCount"],
                              "sourceElementCount": catalog["sourceElementCount"],
                              "elementShardCount": catalog["elementShardCount"],
                              "schemaVersion": catalog["schemaVersion"]})
                sources["manuscripts.json"] = asset
            else:
                asset.update({"recordCount": shard["recordCount"],
                              "sourceElementCount": shard["elementCount"]})
                sources[name] = asset
        manuscript_element_coverage = {
            "recordCount": catalog["recordCount"],
            "sourceElementCount": catalog["sourceElementCount"],
            "elementShardCount": catalog["elementShardCount"],
            "maximumShardBytes": max(row["bytes"] for row in catalog["elementShards"]),
        }

    variant_coverage = None
    if args.variant_package_dir:
        catalog_path = args.variant_package_dir / "variant-catalog.json"
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        if catalog.get("sourceCommit") != COMMIT or catalog.get("sourceLicense") != LICENSE:
            raise ValueError("complete variant catalog does not identify the pinned CC BY-SA source")
        passage_name = catalog.get("passageIndexFile")
        if not passage_name or Path(passage_name).name != passage_name:
            raise ValueError("complete variant catalog has no safe passage index filename")
        passage_path = args.variant_package_dir / passage_name
        if (not passage_path.is_file()
                or passage_path.stat().st_size != catalog.get("passageIndexBytes")
                or sha256(passage_path) != catalog.get("passageIndexSha256")):
            raise ValueError("complete variant passage index does not match its catalog manifest")
        package_files = [catalog_path, passage_path]
        reader_index_names = []
        reader_index_by_name = {}
        for reader_index in catalog.get("readerIndexFiles", []):
            name = reader_index.get("path", "")
            if not name or Path(name).name != name:
                raise ValueError(f"unsafe reader-reference index filename: {name}")
            reader_path = args.variant_package_dir / name
            if (not reader_path.is_file() or reader_path.stat().st_size != reader_index.get("bytes")
                    or sha256(reader_path) != reader_index.get("sha256")):
                raise ValueError(f"missing or mismatched reader-reference index: {name}")
            package_files.append(reader_path)
            reader_index_names.append(name)
            reader_index_by_name[name] = reader_index
        shard_names = []
        for shard in catalog.get("detailShards", []):
            name = shard.get("path", "")
            if not name or Path(name).name != name:
                raise ValueError(f"unsafe variant detail shard name: {name}")
            shard_path = args.variant_package_dir / name
            if not shard_path.is_file() or sha256(shard_path) != shard.get("sha256"):
                raise ValueError(f"missing or mismatched variant detail shard: {name}")
            package_files.append(shard_path)
            shard_names.append(name)
        for source in package_files:
            name = source.name
            versioned = target / name
            digest = sha256(source)
            if source.stat().st_size > 25 * 1024 * 1024:
                raise ValueError(f"static site asset exceeds 25 MiB: {name}")
            if versioned.exists():
                if sha256(versioned) != digest:
                    raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
            else:
                shutil.copyfile(source, versioned)
                if sha256(versioned) != digest:
                    raise IOError(f"Copied asset checksum mismatch: {name}")
            asset = {
                "path": f"/data/quran/releases/{args.release_id}/{name}",
                "bytes": versioned.stat().st_size,
                "sha256": digest,
                "schemaVersion": "3" if name.startswith("variant-details-") else catalog.get("schemaVersion"),
            }
            if name == "variant-catalog.json":
                asset["recordCount"] = catalog.get("recordCount")
                asset["candidateWordCount"] = catalog.get("candidateWordCount")
                asset["gzipBytes"] = catalog.get("gzipBytes")
            elif name == passage_name:
                asset["recordCount"] = catalog.get("passageCount")
                asset["candidateWordCount"] = catalog.get("candidateWordCount")
                asset["gzipBytes"] = catalog.get("passageIndexGzipBytes")
            elif name in reader_index_by_name:
                reader_index = reader_index_by_name[name]
                asset["schemaVersion"] = reader_index.get("schemaVersion")
                asset["recordCount"] = reader_index.get("recordCount")
                asset["referenceCount"] = reader_index.get("referenceCount")
                asset["gzipBytes"] = reader_index.get("gzipBytes")
            else:
                shard_info = next(shard for shard in catalog["detailShards"] if shard["path"] == name)
                asset["recordCount"] = shard_info.get("recordCount")
                asset["gzipBytes"] = shard_info.get("gzipBytes")
            sources[name] = asset
        variant_coverage = {
            "recordCount": catalog.get("recordCount"),
            "candidateWordCount": catalog.get("candidateWordCount"),
            "recordsWithoutSourceKey": catalog.get("recordsWithoutSourceKey"),
            "detailShards": len(shard_names),
            "readerReferenceCount": catalog.get("readerReferenceCount"),
            "readerIndexShards": len(reader_index_names),
        }
    graph_coverage = None
    if args.graph_package_dir:
        graph_manifests = sorted(args.graph_package_dir.glob("research-graph*-manifest.json"))
        if len(graph_manifests) != 1:
            raise ValueError("research graph package must contain exactly one research-graph*-manifest.json")
        graph_manifest_path = graph_manifests[0]
        graph_manifest = json.loads(graph_manifest_path.read_text(encoding="utf-8"))
        if graph_manifest.get("sourceCommit") != COMMIT or graph_manifest.get("sourceLicense") != LICENSE:
            raise ValueError("research graph does not identify the pinned CC BY-SA source")
        graph_files = [graph_manifest_path]
        graph_names = []
        for asset in graph_manifest.get("assets", []):
            name = asset.get("path", "")
            if not name or Path(name).name != name:
                raise ValueError(f"unsafe research graph shard name: {name}")
            source_path = args.graph_package_dir / name
            if (not source_path.is_file() or source_path.stat().st_size != asset.get("bytes")
                    or sha256(source_path) != asset.get("sha256")):
                raise ValueError(f"missing or mismatched research graph shard: {name}")
            graph_files.append(source_path)
            graph_names.append(name)
        for source_path in graph_files:
            name = source_path.name
            versioned = target / name
            digest = sha256(source_path)
            if source_path.stat().st_size > 25 * 1024 * 1024:
                raise ValueError(f"static site asset exceeds 25 MiB: {name}")
            if versioned.exists():
                if sha256(versioned) != digest:
                    raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
            else:
                shutil.copyfile(source_path, versioned)
                if sha256(versioned) != digest:
                    raise IOError(f"Copied research graph asset checksum mismatch: {name}")
            asset = {
                "path": f"/data/quran/releases/{args.release_id}/{name}",
                "bytes": versioned.stat().st_size,
                "sha256": digest,
            }
            if name == graph_manifest_path.name:
                asset["edgeCount"] = graph_manifest.get("edgeCount")
                asset["relationshipTypeCount"] = len(graph_manifest.get("countsByType", {}))
            else:
                source_info = next(row for row in graph_manifest["assets"] if row["path"] == name)
                asset["edgeCount"] = source_info.get("edgeCount")
            sources[name] = asset
        graph_coverage = {
            "manifestName": graph_manifest_path.name,
            "edgeCount": graph_manifest.get("edgeCount"),
            "countsByType": graph_manifest.get("countsByType"),
            "shardCount": len(graph_names),
        }
    commentary_coverage = None
    if args.commentary_package_dir:
        commentary_manifest_path = args.commentary_package_dir / "commentary-manifest.json"
        commentary_manifest = json.loads(commentary_manifest_path.read_text(encoding="utf-8"))
        if commentary_manifest.get("sourceCommit") != COMMIT or commentary_manifest.get("sourceLicense") != LICENSE:
            raise ValueError("commentary package does not identify the pinned CC BY-SA source")
        commentary_files = [commentary_manifest_path]
        commentary_names = []
        for asset_info in commentary_manifest.get("assets", []):
            name = asset_info.get("path", "")
            if not name or Path(name).name != name:
                raise ValueError(f"unsafe commentary shard name: {name}")
            source_path = args.commentary_package_dir / name
            if (not source_path.is_file() or source_path.stat().st_size != asset_info.get("bytes")
                    or sha256(source_path) != asset_info.get("sha256")):
                raise ValueError(f"missing or mismatched commentary shard: {name}")
            commentary_files.append(source_path)
            commentary_names.append(name)
        for source_path in commentary_files:
            name = source_path.name
            versioned = target / name
            digest = sha256(source_path)
            if source_path.stat().st_size > 25 * 1024 * 1024:
                raise ValueError(f"static site asset exceeds 25 MiB: {name}")
            if versioned.exists():
                if sha256(versioned) != digest:
                    raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
            else:
                shutil.copyfile(source_path, versioned)
                if sha256(versioned) != digest:
                    raise IOError(f"Copied commentary asset checksum mismatch: {name}")
            asset = {
                "path": f"/data/quran/releases/{args.release_id}/{name}",
                "bytes": versioned.stat().st_size,
                "sha256": digest,
            }
            if name == commentary_manifest_path.name:
                asset["recordCount"] = commentary_manifest.get("recordCount")
                asset["sourceFileCount"] = commentary_manifest.get("sourceFileCount")
                asset["sourceElementCount"] = commentary_manifest.get("sourceElementCount")
                asset["headerElementCount"] = commentary_manifest.get("headerElementCount")
            else:
                source_info = next(row for row in commentary_manifest["assets"] if row["path"] == name)
                asset["recordCount"] = source_info.get("recordCount")
                asset["sourceFile"] = source_info.get("sourceFile")
                asset["sourceElementCount"] = source_info.get("sourceElementCount")
                asset["headerElementCount"] = source_info.get("headerElementCount")
            if name in sources:
                raise ValueError(f"duplicate release asset name: {name}")
            sources[name] = asset
        commentary_coverage = {
            "recordCount": commentary_manifest.get("recordCount"),
            "sourceFileCount": commentary_manifest.get("sourceFileCount"),
            "exactTextUtf8Bytes": commentary_manifest.get("exactTextUtf8Bytes"),
            "sourceElementCount": commentary_manifest.get("sourceElementCount"),
            "sourceElementTextUtf8Bytes": commentary_manifest.get("sourceElementTextUtf8Bytes"),
            "headerElementCount": commentary_manifest.get("headerElementCount"),
            "headerElementTextUtf8Bytes": commentary_manifest.get("headerElementTextUtf8Bytes"),
            "shardCount": len(commentary_names),
        }
    intertext_coverage = None
    if args.intertext_index:
        intertext = json.loads(args.intertext_index.read_text(encoding="utf-8"))
        if intertext.get("sourceCommit") != COMMIT or intertext.get("sourceLicense") != LICENSE:
            raise ValueError("intertext index does not identify the pinned CC BY-SA source")
        if intertext.get("recordCount") != 713 or len(intertext.get("records", [])) != 713:
            raise ValueError("intertext index must contain all 713 pinned msDesc records")
        name = "intertext-catalog.json"
        if args.intertext_index.stat().st_size > 25 * 1024 * 1024:
            raise ValueError(f"static site asset exceeds 25 MiB: {name}")
        versioned = target / name
        digest = sha256(args.intertext_index)
        if versioned.exists():
            if sha256(versioned) != digest:
                raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
        else:
            shutil.copyfile(args.intertext_index, versioned)
            if sha256(versioned) != digest:
                raise IOError("Copied intertext catalogue checksum mismatch")
        if name in sources:
            raise ValueError(f"duplicate release asset name: {name}")
        sources[name] = {
            "path": f"/data/quran/releases/{args.release_id}/{name}",
            "bytes": versioned.stat().st_size,
            "sha256": digest,
            "recordCount": 713,
            "sourceFileCount": intertext.get("recordSourceFileCount"),
        }
        intertext_coverage = {
            "recordCount": 713,
            "recordSourceFileCount": intertext.get("recordSourceFileCount"),
            "sourceFileCount": intertext.get("sourceFileCount"),
            "fieldElementCounts": intertext.get("fieldElementCounts"),
        }
    taxonomy_coverage = None
    if args.intertext_taxonomy:
        taxonomy = json.loads(args.intertext_taxonomy.read_text(encoding="utf-8"))
        if taxonomy.get("sourceCommit") != COMMIT or taxonomy.get("sourceLicense") != LICENSE:
            raise ValueError("intertext taxonomy does not identify the pinned CC BY-SA source")
        categories = taxonomy.get("categories", [])
        if taxonomy.get("categoryCount") != 122 or len(categories) != 122:
            raise ValueError("intertext taxonomy must contain all 122 source categories")
        name = "intertext-taxonomy.json"
        if args.intertext_taxonomy.stat().st_size > 25 * 1024 * 1024:
            raise ValueError(f"static site asset exceeds 25 MiB: {name}")
        versioned = target / name
        digest = sha256(args.intertext_taxonomy)
        if versioned.exists():
            if sha256(versioned) != digest:
                raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
        else:
            shutil.copyfile(args.intertext_taxonomy, versioned)
            if sha256(versioned) != digest:
                raise IOError("Copied intertext taxonomy checksum mismatch")
        if name in sources:
            raise ValueError(f"duplicate release asset name: {name}")
        sources[name] = {
            "path": f"/data/quran/releases/{args.release_id}/{name}",
            "bytes": versioned.stat().st_size,
            "sha256": digest,
            "categoryCount": 122,
            "sourceFile": taxonomy.get("sourceFile", {}).get("path"),
        }
        taxonomy_coverage = {
            "categoryCount": 122,
            "topLevelCategoryCount": taxonomy.get("topLevelCategoryCount"),
            "explicitRecordCategoryReferenceCount": taxonomy.get("explicitRecordCategoryReferenceCount"),
        }
    concordance_coverage = None
    if args.concordance_package_dir:
        catalog_path = args.concordance_package_dir / "concordance-catalog.json"
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        if (catalog.get("sourceCommit") != COMMIT or catalog.get("sourceLicense") != LICENSE
                or catalog.get("sourceFileCount") != 114 or catalog.get("recordCount") != 91_285
                or catalog.get("fieldCount") != 3_833_970 or catalog.get("fieldTypeCount") != 42
                or len(catalog.get("shards", [])) != 114):
            raise ValueError("concordance package does not match complete pinned source coverage")
        shard_names = []
        for shard in catalog["shards"]:
            name = shard.get("path", "")
            if not name or Path(name).name != name or name in shard_names:
                raise ValueError(f"invalid or duplicate concordance shard path: {name}")
            source = args.concordance_package_dir / name
            if (not source.is_file() or source.stat().st_size != shard.get("bytes")
                    or sha256(source) != shard.get("sha256") or source.stat().st_size > 25 * 1024 * 1024):
                raise ValueError(f"missing, oversized, or mismatched concordance shard: {name}")
            shard_names.append(name)
        if "concordance-catalog.json" in sources:
            raise ValueError("duplicate release asset name: concordance-catalog.json")
        for source in [catalog_path, *(args.concordance_package_dir / name for name in shard_names)]:
            name = source.name
            versioned = target / name
            digest = sha256(source)
            if versioned.exists():
                if sha256(versioned) != digest:
                    raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
            else:
                shutil.copyfile(source, versioned)
                if sha256(versioned) != digest:
                    raise IOError(f"Copied concordance asset checksum mismatch: {name}")
            info = {"path": f"/data/quran/releases/{args.release_id}/{name}",
                    "bytes": versioned.stat().st_size, "sha256": digest}
            if name == catalog_path.name:
                info.update({"sourceFileCount": catalog["sourceFileCount"],
                             "recordCount": catalog["recordCount"], "fieldCount": catalog["fieldCount"]})
            else:
                item = next(row for row in catalog["shards"] if row["path"] == name)
                info.update({"sourceFile": item["sourceFile"], "recordCount": item["recordCount"],
                             "fieldCount": item["fieldCount"]})
            if name in sources:
                raise ValueError(f"duplicate release asset name: {name}")
            sources[name] = info
        concordance_coverage = {"sourceFileCount": 114, "shardCount": len(shard_names),
                                "recordCount": catalog["recordCount"], "fieldCount": catalog["fieldCount"],
                                "fieldTypeCount": catalog["fieldTypeCount"],
                                "maximumShardBytes": max(row["bytes"] for row in catalog["shards"])}
    cairo_coverage = None
    if args.cairo_text_package_dir:
        catalog_path = args.cairo_text_package_dir / "cairo-arabic-catalog.json"
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        if (catalog.get("sourceCommit") != COMMIT or catalog.get("sourceLicense") != LICENSE
                or catalog.get("sourceFile") != "data/cairo_quran/cairoquran.xml"
                or catalog.get("suraCount") != 114 or catalog.get("verseCount") != 6236
                or catalog.get("wordTokenCount") != 77432 or len(catalog.get("shards", [])) != 114):
            raise ValueError("Cairo Arabic package does not match full pinned source coverage")
        if "cairo-arabic-catalog.json" in sources:
            raise ValueError("duplicate release asset name: cairo-arabic-catalog.json")
        file_rows = [(catalog_path, None),
                     *((args.cairo_text_package_dir / row["path"], row) for row in catalog["shards"])]
        seen = set()
        for source, shard in file_rows:
            name = source.name
            if name in seen:
                raise ValueError(f"duplicate Cairo release asset name: {name}")
            seen.add(name)
            if (not source.is_file() or source.stat().st_size > 25 * 1024 * 1024
                    or (shard and (source.stat().st_size != shard.get("bytes") or sha256(source) != shard.get("sha256")))):
                raise ValueError(f"missing, oversized, or mismatched Cairo asset: {name}")
            versioned = target / name
            digest = sha256(source)
            if versioned.exists():
                if sha256(versioned) != digest:
                    raise ValueError(f"Immutable release file already exists with different bytes: {versioned}")
            else:
                shutil.copyfile(source, versioned)
                if sha256(versioned) != digest:
                    raise IOError(f"Copied Cairo text asset checksum mismatch: {name}")
            info = {"path": f"/data/quran/releases/{args.release_id}/{name}",
                    "bytes": versioned.stat().st_size, "sha256": digest}
            if shard is None:
                info.update({"suraCount": catalog["suraCount"], "verseCount": catalog["verseCount"],
                             "wordTokenCount": catalog["wordTokenCount"]})
            else:
                info.update({"suraNativeId": shard["suraNativeId"], "verseCount": shard["verseCount"],
                             "wordTokenCount": shard["wordTokenCount"]})
            if name in sources:
                raise ValueError(f"duplicate release asset name: {name}")
            sources[name] = info
        cairo_coverage = {"sourceFile": catalog["sourceFile"], "suraCount": 114,
                          "verseCount": 6236, "wordTokenCount": 77432, "shardCount": 114,
                          "maximumShardBytes": catalog["largestShardBytes"]}
    scope = ("Variant preview, quran_manuscripts catalogue field index, source-native reader-key analysis, "
             "and explicitly selected research graph. No Nasser, Shamela, Studies, or manuscript image content.")
    if variant_coverage:
        scope = ("Complete pinned Quran variant catalog, candidate passage index, lazy detail shards, and explicit "
                 "reader-authority, candidate, and commentary-reference graph; variant preview; quran_manuscripts "
                 "catalogue field index; and source-native reader-key count analysis. No Nasser, Shamela, Studies, "
                 "or manuscript image content.")
    if commentary_coverage:
        scope += " Every TEI element below text/body and within teiHeader is preserved for all pinned quran_commentary files, with a separate searchable selected text-block view."
    if intertext_coverage:
        scope += " A source-anchored field index for all pinned quran_intertexts msDesc records."
    if taxonomy_coverage:
        scope += " A separate source-anchored hierarchy for all categories in quran_intertexts/categories.xml; no categories are assigned to records because the TEI export contains no explicit catRef links."
    if concordance_coverage:
        scope += " Source-located, exact-field concordance records for all 114 quran_concordance TEI files; field names and values remain source-native and unnormalized."
    if cairo_coverage:
        scope += " The full 6,236-verse Cairo 1924 Arabic text layer and 77,432 source-identified word tokens, loaded by surah."
    if manuscript_element_coverage:
        scope += " A lazy, complete source-element index for all elements within the 2,322 pinned quran_manuscripts msDesc records."
    release_notes = (
        f"# Quran data release {args.release_id}\n\n"
        f"Previous release: {previous_release['releaseId'] if previous_release else 'none recorded'}.\n\n"
        "## Sources and reuse\n\n"
        "This release contains derived indexes from the pinned Corpus Coranicum TEI export only. "
        f"Source commit: `{COMMIT}`. Source license: `{LICENSE}`. Attribution: Corpus Coranicum Project, "
        "ed. Michael Marx, TEI Data, Berlin-Brandenburg Academy of Sciences and Humanities. "
        "Adapted text data is distributed under CC BY-SA 4.0; cite the pinned source commit and retain "
        "the license/attribution when redistributing. The license does not establish rights for linked "
        "third-party manuscript images. No Nasser, Shamela, Studies, translations, or manuscript image "
        "content is included.\n\n"
        "## Coverage\n\n"
        f"- Quran variants: {variant_coverage.get('recordCount', 0) if variant_coverage else 0} source records; "
        f"{variant_coverage.get('candidateWordCount', 0) if variant_coverage else 0} candidate word links.\n"
        f"- Cairo Arabic: {cairo_coverage.get('verseCount', 0) if cairo_coverage else 0} verses, "
        f"{cairo_coverage.get('wordTokenCount', 0) if cairo_coverage else 0} source word tokens.\n"
        f"- Commentary: {commentary_coverage.get('sourceElementCount', 0) if commentary_coverage else 0} "
          f"`text/body` elements, {commentary_coverage.get('headerElementCount', 0) if commentary_coverage else 0} "
          f"`teiHeader` elements, and {commentary_coverage.get('recordCount', 0) if commentary_coverage else 0} "
        "selected searchable text blocks.\n"
        f"- Concordance: {concordance_coverage.get('recordCount', 0) if concordance_coverage else 0} "
        f"word records and {concordance_coverage.get('fieldCount', 0) if concordance_coverage else 0} field values.\n"
        f"- Manuscript descriptions: {json.loads((target / 'manuscripts.json').read_text(encoding='utf-8')).get('recordCount', 0)} records; "
        f"{manuscript_element_coverage.get('sourceElementCount', 0) if manuscript_element_coverage else 0} complete source elements in "
        f"{manuscript_element_coverage.get('elementShardCount', 0) if manuscript_element_coverage else 0} lazy shards.\n"
        f"- Research graph: {graph_coverage.get('edgeCount', 0) if graph_coverage else 0} typed source/candidate edges.\n\n"
        "## Known limits\n\n"
        "Variant-to-Cairo word links remain candidates, not reviewed equivalences. All 18,000 exported "
          "variant source keys remain missing in the TEI data. Commentary body and header element "
          "indexes preserve nested repeated text as separate XML records. "
        "No intertext category assignments are inferred where source `catRef` links are absent. "
        "Concordance field codes are not interpreted. Nasser, Shamela, and Studies inputs are "
        "outside this release scope. Full SQLite publication and deployed "
        "range/performance checks await a user-supplied Quran data destination.\n\n"
        "## Build and audit provenance\n\n"
        "The `release.json` manifest records the previous release pointer, source commit/license, "
        "coverage, every asset hash, and generator source hashes. The site worktree was not clean at "
        "build time; `buildCommit` is therefore null rather than attributing these outputs to the base "
        "commit. The exact generator hashes and base commit are recorded in `release.json`.\n"
    )
    notes_path = target / "release-notes.md"
    notes_bytes = release_notes.encode("utf-8")
    if notes_path.exists() and notes_path.read_bytes() != notes_bytes:
        raise ValueError(f"Immutable release notes already exist with different bytes: {notes_path}")
    if not notes_path.exists():
        notes_path.write_bytes(notes_bytes)
    release_manifest = {
        "schemaVersion": "1",
        "releaseId": args.release_id,
        "dataset": "HadithCritic Quran source documentation assets",
        "sourceRepository": "https://github.com/telota/corpus-coranicum-tei",
        "sourceCommit": COMMIT,
        "sourceLicense": LICENSE,
        "attribution": "Corpus Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg Academy of Sciences and Humanities.",
        "scope": scope,
        "assets": sources,
        "previousRelease": previous_release,
        "buildProvenance": build_provenance(repo_root),
        "releaseNotes": {
            "path": f"/data/quran/releases/{args.release_id}/release-notes.md",
            "bytes": notes_path.stat().st_size,
            "sha256": sha256(notes_path),
        },
        "coverage": ({**({"variants": variant_coverage} if variant_coverage else {}),
                      **({"researchGraph": graph_coverage} if graph_coverage else {}),
                      **({"commentary": commentary_coverage} if commentary_coverage else {}),
                      **({"intertexts": intertext_coverage} if intertext_coverage else {}),
                      **({"intertextTaxonomy": taxonomy_coverage} if taxonomy_coverage else {}),
                      **({"concordance": concordance_coverage} if concordance_coverage else {}),
                      **({"cairoArabicText": cairo_coverage} if cairo_coverage else {}),
                      **({"manuscriptElements": manuscript_element_coverage} if manuscript_element_coverage else {})}),
        "fullSqliteRelease": "Built and audited locally; not included in this site asset release.",
    }
    manifest_path = target / "release.json"
    manifest_bytes = canonical_bytes(release_manifest)
    if manifest_path.exists() and manifest_path.read_bytes() != manifest_bytes:
        raise ValueError(f"Immutable release manifest already exists with different bytes: {manifest_path}")
    if not manifest_path.exists():
        manifest_path.write_bytes(manifest_bytes)
    manifest_hash = sha256(manifest_path)
    pointer = {
        "releaseId": args.release_id,
        "manifest": f"/data/quran/releases/{args.release_id}/release.json",
        "manifestSha256": manifest_hash,
    }
    (args.data_dir / "manifest.json").write_bytes(canonical_bytes(pointer))
    for name in ASSETS:
        alias = {
            "kind": "immutable-release-pointer",
            "releaseId": args.release_id,
            "artifact": sources[name]["path"],
            "sha256": sources[name]["sha256"],
        }
        (args.data_dir / name).write_bytes(canonical_bytes(alias))
    print(json.dumps({"releaseId": args.release_id,
                      "releaseManifest": str(manifest_path),
                      "manifestSha256": manifest_hash,
                      "assets": sources}, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
