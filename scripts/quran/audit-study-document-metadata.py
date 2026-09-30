#!/usr/bin/env python3
"""Create a private, metadata-only audit of user-supplied Quran Studies files.

The PDF bytes remain untouched and are never copied. Embedded metadata and page
counts are inventory hints, not bibliographic authority or rights evidence.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
import warnings
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader, __version__ as PYPDF_VERSION


METADATA_KEYS = (
    "/Title", "/Author", "/Subject", "/Creator", "/Producer",
    "/CreationDate", "/ModDate", "/Keywords", "/Trapped",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def json_value(value: object) -> object:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, bytes):
        return {"decodedDisplay": value.decode("utf-8", errors="replace"),
                "hex": value.hex()}
    return str(value)


def read_docx_core_properties(path: Path) -> tuple[dict[str, str | None], str]:
    names = ("title", "subject", "creator", "description", "keywords",
             "language", "created", "modified", "lastModifiedBy", "revision")
    properties: dict[str, str | None] = {name: None for name in names}
    with zipfile.ZipFile(path) as archive:
        if "word/document.xml" not in archive.namelist():
            raise ValueError("DOCX package lacks word/document.xml")
        if "docProps/core.xml" not in archive.namelist():
            return properties, "metadata_absent"
        xml_bytes = archive.read("docProps/core.xml")
    root = ET.fromstring(xml_bytes)
    local_names = {name: name.lower() for name in names}
    for element in root.iter():
        local_name = element.tag.rsplit("}", 1)[-1]
        target = local_names.get(local_name.lower())
        if target is not None:
            properties[target] = element.text if element.text is not None else ""
    return properties, "parsed"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--studies", type=Path, required=True)
    parser.add_argument("--source-manifest", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    root = args.studies.resolve()
    manifest_path = args.source_manifest.resolve()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    sources = [source for source in manifest.get("sources", [])
               if source.get("id") == "quran-studies-files"]
    errors: list[str] = []
    if len(sources) != 1:
        errors.append("source manifest must contain exactly one quran-studies-files entry")
        source = {}
    else:
        source = sources[0]

    recorded_root = source.get("suppliedLocation")
    if not recorded_root or Path(recorded_root).resolve() != root:
        errors.append("--studies does not match the user-supplied location in the source manifest")
    if source.get("availability") != "present":
        errors.append("source manifest does not record the Studies directory as present")
    if source.get("redistribution") != "quarantined":
        errors.append("Studies source must remain quarantined during metadata-only audit")

    expected = {row["relativePath"]: row for row in source.get("files", [])}
    actual_paths = sorted(path for path in root.iterdir() if path.is_file())
    actual = {path.relative_to(root).as_posix(): path for path in actual_paths}
    if set(actual) != set(expected):
        missing = sorted(set(expected) - set(actual))
        added = sorted(set(actual) - set(expected))
        errors.append(f"source file inventory differs: missing={missing}, added={added}")

    rename_path = root / "_rename_manifest.csv"
    rename_rows: list[dict[str, str]] = []
    if rename_path in actual_paths:
        with rename_path.open("r", encoding="utf-8-sig", newline="") as stream:
            rename_rows = list(csv.DictReader(stream))
    mapped: dict[str, list[dict[str, str]]] = {}
    for row in rename_rows:
        mapped.setdefault(row.get("NewName", ""), []).append(row)
    pdf_paths = [path for path in actual_paths if path.suffix.lower() == ".pdf"]
    docx_paths = [path for path in actual_paths if path.suffix.lower() == ".docx"]
    document_paths = pdf_paths + docx_paths
    mapped_targets = {name for name in mapped if name}
    document_names = {path.name for path in document_paths}
    missing_targets = sorted(mapped_targets - set(actual))
    unlisted_documents = sorted(document_names - mapped_targets)
    duplicate_targets = sorted(name for name, rows in mapped.items() if name and len(rows) > 1)
    if missing_targets or unlisted_documents or duplicate_targets:
        errors.append("rename manifest and document inventory do not reconcile")

    records = []
    metadata_records = pages_known = pdf_signatures = 0
    for path in pdf_paths:
        relative = path.relative_to(root).as_posix()
        expected_file = expected.get(relative, {})
        size = path.stat().st_size
        digest = sha256(path)
        if expected_file and (size != expected_file.get("bytes")
                              or digest != expected_file.get("sha256")):
            errors.append(f"source hash or byte count differs from manifest: {relative}")
        with path.open("rb") as stream:
            signature = stream.read(8)
        has_pdf_signature = signature.startswith(b"%PDF-")
        if has_pdf_signature:
            pdf_signatures += 1
        record: dict[str, object] = {
            "relativePath": relative,
            "byteLength": size,
            "sha256": digest,
            "signatureIsPdf": has_pdf_signature,
            "renameManifestRows": mapped.get(path.name, []),
            "embeddedInfo": None,
            "pageCount": None,
            "encrypted": None,
            "metadataParseState": "not_pdf_signature" if not has_pdf_signature else "pending",
            "parserWarnings": [],
        }
        if not has_pdf_signature:
            errors.append(f"file extension is PDF but signature is not: {relative}")
            records.append(record)
            continue
        try:
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter("always")
                reader = PdfReader(str(path), strict=False)
                info = reader.metadata
                if info is None:
                    record["metadataParseState"] = "metadata_absent"
                else:
                    record["embeddedInfo"] = {
                        key: json_value(info.get(key)) for key in METADATA_KEYS
                    }
                    metadata_records += 1
                    record["metadataParseState"] = "parsed"
                record["encrypted"] = bool(reader.is_encrypted)
                try:
                    record["pageCount"] = len(reader.pages)
                    pages_known += 1
                except Exception as exc:  # preserve encrypted/unreadable state
                    record["pageCountError"] = f"{type(exc).__name__}: {exc}"
                record["parserWarnings"] = [str(item.message) for item in caught]
            if record["pageCount"] is None:
                errors.append(f"page count unavailable: {relative}")
        except Exception as exc:
            record["metadataParseState"] = "parse_error"
            record["parseError"] = f"{type(exc).__name__}: {exc}"
            errors.append(f"PDF metadata parse failed: {relative}: {type(exc).__name__}")
        records.append(record)

    docx_signature_count = 0
    for path in docx_paths:
        relative = path.relative_to(root).as_posix()
        expected_file = expected.get(relative, {})
        size = path.stat().st_size
        digest = sha256(path)
        if expected_file and (size != expected_file.get("bytes")
                              or digest != expected_file.get("sha256")):
            errors.append(f"source hash or byte count differs from manifest: {relative}")
        with path.open("rb") as stream:
            signature = stream.read(4)
        signature_ok = signature.startswith(b"PK")
        if signature_ok:
            docx_signature_count += 1
        record = {
            "relativePath": relative,
            "format": "docx",
            "byteLength": size,
            "sha256": digest,
            "signatureIsZip": signature_ok,
            "renameManifestRows": mapped.get(path.name, []),
            "embeddedInfo": None,
            "cachedPageCount": None,
            "metadataParseState": "not_zip_signature" if not signature_ok else "pending",
            "parserWarnings": [],
        }
        if not signature_ok:
            errors.append(f"file extension is DOCX but ZIP signature is not: {relative}")
        else:
            try:
                record["embeddedInfo"], record["metadataParseState"] = read_docx_core_properties(path)
                if record["metadataParseState"] == "parsed":
                    metadata_records += 1
            except Exception as exc:
                record["metadataParseState"] = "parse_error"
                record["parseError"] = f"{type(exc).__name__}: {exc}"
                errors.append(f"DOCX core-property parse failed: {relative}: {type(exc).__name__}")
        records.append(record)

    hash_groups: dict[str, list[str]] = {}
    for record in records:
        hash_groups.setdefault(str(record["sha256"]), []).append(str(record["relativePath"]))
    duplicate_sha256_groups = {
        digest: paths for digest, paths in sorted(hash_groups.items()) if len(paths) > 1
    }

    output = {
        "auditVersion": "quran-study-pdf-metadata-audit/1.0.0",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "sourceId": "quran-studies-files",
        "sourceManifestSha256": sha256(manifest_path),
        "sourceRightsState": source.get("license", {}).get("status", "needs_review"),
        "redistributionState": source.get("redistribution", "quarantined"),
        "parser": {"name": "pypdf", "version": PYPDF_VERSION, "strict": False},
        "scope": "PDF signatures, source hashes, embedded document-info values, encryption state, and PDF page counts; DOCX ZIP signatures and core properties only. No page text, OCR, or images extracted.",
        "inventory": {
            "manifestFiles": len(expected),
            "filesSeen": len(actual),
            "renameManifestRows": len(rename_rows),
            "documentsSeen": len(document_paths),
            "pdfFiles": len(pdf_paths),
            "docxFiles": len(docx_paths),
            "pdfSignatures": pdf_signatures,
            "docxZipSignatures": docx_signature_count,
            "metadataRecords": metadata_records,
            "pageCountsKnown": pages_known,
            "missingRenameTargets": missing_targets,
            "unlistedDocuments": unlisted_documents,
            "duplicateRenameTargets": duplicate_targets,
            "duplicateSha256Groups": duplicate_sha256_groups,
        },
        "records": records,
        "errors": errors,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    print(json.dumps({"output": str(args.out), "pdfFiles": len(pdf_paths),
                      "metadataRecords": metadata_records,
                      "pageCountsKnown": pages_known, "errors": errors},
                     ensure_ascii=False, indent=2))
    return 0 if not errors and len(document_paths) == len(rename_rows) else 1


if __name__ == "__main__":
    sys.exit(main())
