#!/usr/bin/env python3
"""Package the complete pinned variant index as a search catalogue and detail shards."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import sys
from pathlib import Path

COMMIT = "57cb2b7be321ecfba100cb5f7988974f47864a14"
MAX_ASSET_BYTES = 25 * 1024 * 1024


def json_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")


def write_asset(path: Path, value: object) -> dict[str, object]:
    payload = json_bytes(value)
    if len(payload) > MAX_ASSET_BYTES:
        raise ValueError(f"{path.name} is {len(payload)} bytes, above the 25 MiB static asset limit")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)
    return {
        "path": path.name,
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "gzipBytes": len(gzip.compress(payload, compresslevel=9)),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full-index", type=Path, required=True,
                        help="Complete output from build-variant-index.py without --limit")
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--shard-size", type=int, default=750)
    args = parser.parse_args()
    if args.shard_size < 1:
        parser.error("--shard-size must be positive")

    source = json.loads(args.full_index.read_text(encoding="utf-8"))
    if source.get("sourceCommit") != COMMIT or source.get("sourceLicense") != "CC BY-SA 4.0":
        raise ValueError("input does not identify the pinned, reviewed Corpus Coranicum CC BY-SA release")
    records = source.get("records")
    if not isinstance(records, list) or len(records) != source.get("completeSourceRecordCount"):
        raise ValueError("full index record count does not match its declared source coverage")
    record_ids = [record.get("variantId") for record in records]
    if any(not isinstance(native_id, str) or not native_id for native_id in record_ids):
        raise ValueError("every source variant record must retain its native ID")
    if len(set(record_ids)) != len(record_ids):
        raise ValueError("duplicate source-native variant IDs in input")

    shards: list[dict[str, object]] = []
    catalog_records: list[dict[str, object]] = []
    passage_index: dict[str, dict[str, object]] = {}
    reader_index_records: list[dict[str, object]] = []
    reader_authorities: dict[str, dict[str, object]] = {}
    aligned_word_count = 0
    records_without_source_key = 0
    for start in range(0, len(records), args.shard_size):
        shard_records = records[start:start + args.shard_size]
        shard_name = f"variant-details-{start // args.shard_size + 1:03d}.json"
        passages: dict[str, dict[str, str | None]] = {}
        compact_records: list[dict[str, object]] = []
        for record in shard_records:
            reader_references = record.get("readerReferences", [])
            for reference in reader_references:
                authority = reference.get("readerAuthority")
                if authority:
                    reader_authorities[authority["nativeKey"]] = {
                        "nativeKey": authority["nativeKey"],
                        "exactLabel": authority.get("exactLabel"),
                        "sourceUrl": authority.get("sourceUrl"),
                        "linkRule": authority.get("linkRule"),
                    }
            if reader_references:
                reader_index_records.append({
                    "variantId": record["variantId"],
                    "sourceUrl": record.get("sourceRecord", {}).get("url"),
                    "references": reader_references,
                })
            words = []
            candidate_count = 0
            candidate_verses: set[str] = set()
            candidate_words_by_verse: dict[str, list[dict[str, object]]] = {}
            for word in record.get("words", []):
                alignment = word.get("alignment")
                if alignment:
                    if alignment.get("reviewState") != "candidate":
                        raise ValueError(f"unexpected alignment review state in {record['variantId']}")
                    aligned_word_count += 1
                    candidate_count += 1
                    verse_id = alignment["targetVerseId"]
                    candidate_verses.add(verse_id)
                    passage = {
                        "exactText": alignment.get("targetVerseExactText"),
                        "sourceUrl": alignment.get("targetVerseSourceUrl"),
                    }
                    existing = passages.get(verse_id)
                    if existing is not None and existing != passage:
                        raise ValueError(f"conflicting exact Cairo contexts for {verse_id}")
                    passages[verse_id] = passage
                    candidate_words_by_verse.setdefault(verse_id, []).append({
                        "ordinal": word.get("ordinal"),
                        "variantExactText": word.get("exactText"),
                        "variantSourceLocator": word.get("sourceLocator"),
                        "targetExactText": alignment.get("targetExactText"),
                        "candidateMethod": alignment.get("method"),
                        "targetSourceLocator": alignment.get("targetSourceLocator"),
                        "targetSourceUrl": alignment.get("targetSourceUrl"),
                    })
                    alignment = {key: value for key, value in alignment.items()
                                 if key not in ("targetVerseExactText", "targetVerseSourceUrl")}
                words.append({
                    "ordinal": word.get("ordinal"),
                    "exactText": word.get("exactText"),
                    "sourceLocator": word.get("sourceLocator"),
                    "alignment": alignment,
                })
            if record.get("citationState") == "source-key-missing":
                records_without_source_key += 1
            compact_records.append({
                "variantId": record["variantId"],
                "sourceNativeKey": record.get("sourceNativeKey"),
                "readerReferences": record.get("readerReferences", []),
                "words": words,
            })
            catalog_records.append({
                "variantId": record["variantId"],
                "readerNativeKey": record.get("readerNativeKey"),
                "readerExactLabel": record.get("readerExactLabel"),
                "readerAuthority": record.get("readerAuthority"),
                "readerReferenceCount": len(reader_references),
                "sourceNativeKey": record.get("sourceNativeKey"),
                "exactSourceText": record.get("exactSourceText"),
                "sourceRecord": record.get("sourceRecord"),
                "citationState": record.get("citationState"),
                "candidateCount": candidate_count,
                "candidateVerseIds": sorted(candidate_verses),
                "detailsFile": shard_name,
            })
            for verse_id, candidate_words in candidate_words_by_verse.items():
                context = passages[verse_id]
                passage_entry = passage_index.setdefault(verse_id, {
                    "exactText": context["exactText"],
                    "sourceUrl": context["sourceUrl"],
                    "records": [],
                })
                if passage_entry["exactText"] != context["exactText"] or passage_entry["sourceUrl"] != context["sourceUrl"]:
                    raise ValueError(f"conflicting exact Cairo contexts across shards for {verse_id}")
                passage_entry["records"].append({"variantId": record["variantId"], "words": candidate_words})

        shard_data = {
            "dataset": source["dataset"],
            "dataVersion": source["dataVersion"],
            "schemaVersion": "3",
            "sourceCommit": source["sourceCommit"],
            "sourceRepository": source["sourceRepository"],
            "sourceLicense": source["sourceLicense"],
            "attribution": source["attribution"],
            "modificationNotice": (
                "Variant word text and source locators are retained exactly. Repeated Cairo verse context is "
                "stored once per source verse ID in this shard; its exact text and source URL are unchanged. "
                "Cairo word links remain unreviewed candidates."
            ),
            "recordCount": len(compact_records),
            "passages": passages,
            "records": compact_records,
        }
        shard_info = write_asset(args.out_dir / shard_name, shard_data)
        shard_info["recordCount"] = len(compact_records)
        shards.append(shard_info)

    passage_data = {
        "dataset": "Corpus Coranicum Cairo candidate passage index",
        "dataVersion": source["dataVersion"],
        "schemaVersion": "2",
        "sourceCommit": source["sourceCommit"],
        "sourceRepository": source["sourceRepository"],
        "sourceLicense": source["sourceLicense"],
        "attribution": source["attribution"],
        "modificationNotice": (
            "Each passage is keyed by its source-native Cairo verse ID. Exact Cairo verse text, word text, "
            "source locators, source line links, and variant word text are retained. Every cross-text link "
            "remains a candidate and does not establish reading equivalence."
        ),
        "passageCount": len(passage_index),
        "candidateWordCount": aligned_word_count,
        "passages": passage_index,
    }
    passage_index_result = write_asset(args.out_dir / "variant-passages.json", passage_data)
    passage_index_result["passageCount"] = len(passage_index)
    passage_index_result["candidateWordCount"] = aligned_word_count

    reader_index_results = []
    reader_index_shard_size = max(1, (len(reader_index_records) + 1) // 2)
    for start in range(0, len(reader_index_records), reader_index_shard_size):
        index_records = reader_index_records[start:start + reader_index_shard_size]
        reader_index = {
            "dataset": "Corpus Coranicum exact variant persName references",
            "dataVersion": source["dataVersion"],
            "schemaVersion": "1",
            "sourceCommit": source["sourceCommit"],
            "sourceRepository": source["sourceRepository"],
            "sourceLicense": source["sourceLicense"],
            "sourceFile": "data/quran_variants/allvariants.xml",
            "sourceFileSha256": index_records[0]["references"][0]["sourceRecord"]["sha256"],
            "recordCount": len(index_records),
            "referenceCount": sum(len(record["references"]) for record in index_records),
            "readerAuthorities": reader_authorities,
            "records": index_records,
        }
        result = write_asset(args.out_dir / f"variant-reader-index-{len(reader_index_results) + 1:03d}.json", reader_index)
        result["schemaVersion"] = reader_index["schemaVersion"]
        result["recordCount"] = len(index_records)
        result["referenceCount"] = reader_index["referenceCount"]
        reader_index_results.append(result)

    catalog = {
        "dataset": source["dataset"],
        "dataVersion": source["dataVersion"],
        "schemaVersion": "2",
        "sourceCommit": source["sourceCommit"],
        "sourceRepository": source["sourceRepository"],
        "sourceLicense": source["sourceLicense"],
        "attribution": source["attribution"],
        "modificationNotice": (
            "Complete source-native record catalog. Source text, authority labels, source keys, IDs, and "
            "source locators are retained from TEI. Search folds case for matching only; displayed strings "
            "are unchanged. Candidate word details load from the named immutable detail shard."
        ),
        "recordGranularity": source["recordGranularity"],
        "recordCount": len(catalog_records),
        "completeSourceRecordCount": source["completeSourceRecordCount"],
        "candidateWordCount": aligned_word_count,
        "recordsWithoutSourceKey": records_without_source_key,
        "readerReferenceCount": sum(item["referenceCount"] for item in reader_index_results),
        "readerIndexFiles": reader_index_results,
        "passageIndexFile": "variant-passages.json",
        "passageIndexBytes": passage_index_result["bytes"],
        "passageIndexSha256": passage_index_result["sha256"],
        "passageIndexGzipBytes": passage_index_result["gzipBytes"],
        "passageCount": len(passage_index),
        "detailShardSize": args.shard_size,
        "detailShards": shards,
        "records": catalog_records,
    }
    catalog_result = write_asset(args.out_dir / "variant-catalog.json", catalog)
    report = {
        "sourceCommit": COMMIT,
        "sourceLicense": "CC BY-SA 4.0",
        "sourceIndexBytes": args.full_index.stat().st_size,
        "sourceIndexSha256": hashlib.sha256(args.full_index.read_bytes()).hexdigest(),
        "catalog": catalog_result,
        "passageIndex": passage_index_result,
        "readerIndexes": reader_index_results,
        "detailShards": shards,
        "records": len(catalog_records),
        "recordsWithoutSourceKey": records_without_source_key,
        "candidateWords": aligned_word_count,
        "readerReferences": catalog["readerReferenceCount"],
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
