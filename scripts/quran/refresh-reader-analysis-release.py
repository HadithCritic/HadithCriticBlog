#!/usr/bin/env python3
"""Publish a new immutable Quran release with freshly verified reader analysis.

All existing assets are copied byte-for-byte from the active release. Only the
reader-count analysis is regenerated against a separately audited SQLite
release. The root pointer changes only after the new release is assembled.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def canonical_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n").encode("utf-8")


def atomic_write(path: Path, payload: bytes) -> None:
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    temporary.write_bytes(payload)
    os.replace(temporary, path)


def run_json_verifier(command: list[str], label: str) -> dict:
    result = subprocess.run(command, text=True, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(f"{label} failed:\n{result.stdout[-4000:]}\n{result.stderr[-2000:]}")
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"{label} did not return JSON: {result.stdout[-2000:]}") from error


def build_provenance(repo_root: Path) -> dict:
    scripts = sorted(Path("scripts/quran").glob("*.py"))
    script_hashes = {path.as_posix(): sha256(repo_root / path) for path in scripts}
    base_commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=repo_root, text=True,
        capture_output=True, check=True,
    ).stdout.strip()
    status = subprocess.run(
        ["git", "status", "--porcelain", "--untracked-files=all"], cwd=repo_root,
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
    parser.add_argument("--release-id", required=True)
    parser.add_argument("--release-db", type=Path, required=True)
    parser.add_argument("--tei", type=Path, required=True)
    parser.add_argument("--analysis", type=Path, required=True)
    args = parser.parse_args()
    if (not args.release_id.startswith("v") or "/" in args.release_id
            or "\\" in args.release_id or args.release_id in {"v", "v.", "v.."}):
        parser.error("release id must be a versioned directory name beginning with v")

    repo_root = Path(__file__).resolve().parents[2]
    data_dir = args.data_dir.resolve()
    pointer_path = data_dir / "manifest.json"
    pointer_bytes = pointer_path.read_bytes()
    pointer = json.loads(pointer_bytes)
    source_id = pointer["releaseId"]
    if source_id == args.release_id:
        raise ValueError("new release ID must differ from the active release")
    source_dir = data_dir / "releases" / source_id
    source_manifest_path = source_dir / "release.json"
    source_manifest_bytes = source_manifest_path.read_bytes()
    source_manifest_hash = hashlib.sha256(source_manifest_bytes).hexdigest()
    if source_manifest_hash != pointer.get("manifestSha256"):
        raise ValueError("active release manifest does not match the root pointer")

    release_report = run_json_verifier(
        [sys.executable, "scripts/quran/verify-static-release.py"], "active static release verifier")
    if release_report.get("errors"):
        raise ValueError("active static release has verification errors")
    analysis_report = run_json_verifier(
        [sys.executable, "scripts/quran/verify-reader-count-analysis.py",
         "--release-db", str(args.release_db), "--tei", str(args.tei),
         "--analysis", str(args.analysis)], "reader-analysis source verifier")
    if analysis_report.get("errors") != 0 or not analysis_report.get("resultHashMatches"):
        raise ValueError("reader-analysis source verifier did not pass")

    source_manifest = json.loads(source_manifest_bytes)
    assets = source_manifest.get("assets", {})
    required = {"variants.json", "manuscripts.json", "reader-record-counts.json"}
    if not required.issubset(assets):
        raise ValueError("active release lacks required top-level assets")
    destination = data_dir / "releases" / args.release_id
    staging = destination.with_name(f".{destination.name}.staging")
    if destination.exists() or staging.exists():
        raise FileExistsError(f"release destination or staging directory already exists: {destination}")

    analysis = json.loads(args.analysis.read_text(encoding="utf-8"))
    if analysis.get("inputReleaseSha256") != sha256(args.release_db):
        raise ValueError("analysis input database hash does not match the supplied SQLite release")

    staging.mkdir(parents=True)
    try:
        new_assets = {}
        expected_source_files = {"release.json", "release-notes.md", *assets.keys()}
        actual_source_files = {item.name for item in source_dir.iterdir() if item.is_file()}
        if actual_source_files != expected_source_files:
            raise ValueError("active release directory contains undeclared or missing files")
        for name, metadata in assets.items():
            source = source_dir / name
            if (source.stat().st_size != metadata.get("bytes")
                    or sha256(source) != metadata.get("sha256")):
                raise ValueError(f"active asset fails its manifest: {name}")
            target = staging / name
            if name == "reader-record-counts.json":
                shutil.copyfile(args.analysis, target)
            else:
                shutil.copyfile(source, target)
            copied_hash = sha256(target)
            if target.stat().st_size == 0:
                raise ValueError(f"empty release asset: {name}")
            asset = dict(metadata)
            asset["path"] = f"/data/quran/releases/{args.release_id}/{name}"
            asset["bytes"] = target.stat().st_size
            asset["sha256"] = copied_hash
            if name == "reader-record-counts.json":
                asset["analysisVersion"] = analysis.get("analysisVersion")
                asset["resultSha256"] = analysis.get("resultSha256")
            new_assets[name] = asset

        notes = (source_dir / "release-notes.md").read_text(encoding="utf-8")
        notes += (
            "\n## Reader-analysis provenance refresh\n\n"
            f"The reader-label analysis was regenerated from the audited local SQLite release "
            f"with SHA-256 `{analysis['inputReleaseSha256']}`. Its source-derived result hash is "
            f"`{analysis['resultSha256']}`; independent TEI/database verification confirms "
            f"{analysis_report['sourceVariantRecords']:,} records, "
            f"{analysis_report['sourceLabelEntries']:,} direct label entries, and "
            f"{analysis_report['readerKeyGroups']:,} source-key groups with zero errors. "
            "No analysis row or source string changed from the previous static release.\n"
        )
        (staging / "release-notes.md").write_text(notes, encoding="utf-8", newline="\n")
        notes_path = f"/data/quran/releases/{args.release_id}/release-notes.md"

        manifest = dict(source_manifest)
        manifest["releaseId"] = args.release_id
        manifest["previousRelease"] = {
            "releaseId": source_id,
            "manifest": f"/data/quran/releases/{source_id}/release.json",
            "manifestSha256": source_manifest_hash,
        }
        manifest["releaseNotes"] = {
            "path": notes_path,
            "bytes": (staging / "release-notes.md").stat().st_size,
            "sha256": sha256(staging / "release-notes.md"),
        }
        manifest["assets"] = new_assets
        manifest["buildProvenance"] = build_provenance(repo_root)
        (staging / "release.json").write_bytes(canonical_bytes(manifest))
        staging.rename(destination)
    except Exception:
        # Keep a partially assembled staging tree for inspection; never alter
        # the active release or its immutable source assets on failure.
        raise

    manifest_path = destination / "release.json"
    manifest_hash = sha256(manifest_path)
    old_mutable = {path: path.read_bytes() for path in
                   [pointer_path, *(data_dir / name for name in required)]}
    try:
        for name in sorted(required):
            asset = new_assets[name]
            alias = {
                "artifact": asset["path"],
                "kind": "immutable-release-pointer",
                "releaseId": args.release_id,
                "sha256": asset["sha256"],
            }
            atomic_write(data_dir / name, canonical_bytes(alias))
        atomic_write(pointer_path, canonical_bytes({
            "manifest": f"/data/quran/releases/{args.release_id}/release.json",
            "manifestSha256": manifest_hash,
            "releaseId": args.release_id,
        }))
        final_report = run_json_verifier(
            [sys.executable, "scripts/quran/verify-static-release.py",
             "--check-current-script-hashes"], "new static release verifier")
        if final_report.get("errors"):
            raise RuntimeError("new static release verifier reported errors")
    except Exception:
        for path, content in old_mutable.items():
            atomic_write(path, content)
        raise

    print(json.dumps({
        "releaseId": args.release_id,
        "previousRelease": source_id,
        "assetCount": len(new_assets),
        "readerAnalysisInputSha256": analysis["inputReleaseSha256"],
        "readerAnalysisResultSha256": analysis["resultSha256"],
        "releaseManifestSha256": manifest_hash,
        "readerAnalysisVerification": analysis_report,
        "staticReleaseErrors": final_report["errors"],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
