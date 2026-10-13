"""Shared storage for immutable Quran release assets.

Every release is a complete snapshot, and most assets are byte-identical to the
release before it. Writing a full copy each time filled the disk with dozens of
near-duplicate 0.5 GB directories. Instead, an asset whose bytes already exist in
another release is hard-linked to that file, so a new release costs only the
assets that changed. Paths, manifests and checksums are unchanged, and a
filesystem without hard links falls back to an ordinary copy.

Linked files share one set of bytes. Release assets are never written in place,
and the release verifiers hash every asset against its manifest, so editing one
by hand would be caught rather than silently spread.
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def release_dirs(releases_root: Path) -> list[Path]:
    """Published release directories, oldest name first. Staging trees start with a dot."""
    if not releases_root.is_dir():
        return []
    return sorted(
        entry for entry in releases_root.iterdir()
        if entry.is_dir() and not entry.name.startswith(".")
    )


def manifest_assets(release: Path) -> list[tuple[Path, str, int]]:
    """(path, sha256, bytes) for each asset the release manifest declares."""
    manifest_path = release / "release.json"
    if not manifest_path.is_file():
        return []
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    assets = manifest.get("assets") if isinstance(manifest, dict) else None
    if not isinstance(assets, dict):
        return []
    declared = []
    for name, asset in assets.items():
        if not isinstance(asset, dict) or Path(name).name != name:
            continue
        digest = asset.get("sha256")
        size = asset.get("bytes")
        if isinstance(digest, str) and isinstance(size, int):
            declared.append((release / name, digest, size))
    return declared


def link_or_copy(existing: Path, destination: Path) -> bool:
    """Hard-link existing to destination. Returns False when it had to copy."""
    try:
        os.link(existing, destination)
        return True
    except FileExistsError:
        raise
    except OSError:
        shutil.copyfile(existing, destination)
        return False


class ReleaseStore:
    """Places assets into a release, reusing identical bytes from other releases."""

    def __init__(self, releases_root: Path) -> None:
        self.index: dict[str, tuple[Path, int]] = {}
        self._verified: set[Path] = set()
        for release in release_dirs(releases_root):
            for path, digest, size in manifest_assets(release):
                if path.is_file():
                    self.index.setdefault(digest, (path, size))

    def _reusable(self, digest: str, size: int) -> Path | None:
        entry = self.index.get(digest)
        if entry is None:
            return None
        path, declared_size = entry
        if declared_size != size or not path.is_file() or path.stat().st_size != size:
            return None
        if path not in self._verified:
            # The manifest says what the bytes should be; only the bytes prove it.
            if sha256(path) != digest:
                del self.index[digest]
                return None
            self._verified.add(path)
        return path

    def place(self, source: Path, destination: Path) -> None:
        """shutil.copyfile(source, destination), except it never overwrites.

        Writing through an existing destination could change every release that
        shares its bytes, so an existing destination is an error.
        """
        if destination.exists():
            raise FileExistsError(f"release asset already exists: {destination}")
        digest = sha256(source)
        size = source.stat().st_size
        existing = self._reusable(digest, size)
        if existing is not None:
            link_or_copy(existing, destination)
        else:
            shutil.copyfile(source, destination)
        self.index.setdefault(digest, (destination, size))
        self._verified.add(destination)


def dedupe_releases(releases_root: Path, dry_run: bool = False) -> dict[str, object]:
    """Hard-link identical assets that existing releases hold as separate copies."""
    first_seen: dict[str, Path] = {}
    linked_files = 0
    linked_bytes = 0
    errors: list[str] = []
    for release in release_dirs(releases_root):
        for path, digest, size in manifest_assets(release):
            if not path.is_file():
                continue
            original = first_seen.get(digest)
            if original is not None and os.path.samefile(original, path):
                continue
            if path.stat().st_size != size or sha256(path) != digest:
                errors.append(f"{path.relative_to(releases_root).as_posix()}: bytes disagree with release.json")
                continue
            if original is None:
                first_seen[digest] = path
                continue
            linked_files += 1
            linked_bytes += size
            if dry_run:
                continue
            temporary = path.with_name(f".{path.name}.dedupe-{os.getpid()}")
            try:
                os.link(original, temporary)
                os.replace(temporary, path)
            finally:
                # Gone after a successful replace; left behind only by a failure.
                temporary.unlink(missing_ok=True)
    return {
        "dryRun": dry_run,
        "linkedFiles": linked_files,
        "linkedBytes": linked_bytes,
        "errors": errors,
    }
