#!/usr/bin/env python3
"""Checks that Quran releases share storage for identical assets."""
from __future__ import annotations

import hashlib
import json
import os
import tempfile
import unittest
from pathlib import Path

from release_store import ReleaseStore, dedupe_releases


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_release(root: Path, release_id: str, files: dict[str, bytes]) -> Path:
    release = root / release_id
    release.mkdir(parents=True)
    assets = {}
    for name, data in files.items():
        (release / name).write_bytes(data)
        assets[name] = {
            "path": f"/data/quran/releases/{release_id}/{name}",
            "bytes": len(data),
            "sha256": digest(data),
        }
    manifest = {"releaseId": release_id, "assets": assets}
    (release / "release.json").write_text(json.dumps(manifest), encoding="utf-8")
    return release


def same_file(a: Path, b: Path) -> bool:
    return os.path.samefile(a, b)


class ReleaseStoreTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / "releases"
        self.root.mkdir()
        self.source_dir = Path(self.tmp.name) / "package"
        self.source_dir.mkdir()

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_place_links_bytes_an_earlier_release_already_holds(self) -> None:
        old = write_release(self.root, "v0.1.0-cc-a", {"catalog.json": b"same"})
        source = self.source_dir / "catalog.json"
        source.write_bytes(b"same")
        new = self.root / "v0.2.0-cc-a"
        new.mkdir()

        ReleaseStore(self.root).place(source, new / "catalog.json")

        self.assertTrue(same_file(old / "catalog.json", new / "catalog.json"))
        self.assertEqual((new / "catalog.json").read_bytes(), b"same")

    def test_place_copies_bytes_no_release_holds(self) -> None:
        write_release(self.root, "v0.1.0-cc-a", {"catalog.json": b"old"})
        source = self.source_dir / "catalog.json"
        source.write_bytes(b"new")
        new = self.root / "v0.2.0-cc-a"
        new.mkdir()

        ReleaseStore(self.root).place(source, new / "catalog.json")

        self.assertEqual((new / "catalog.json").read_bytes(), b"new")
        self.assertFalse(same_file(source, new / "catalog.json"))

    def test_place_reuses_a_file_placed_earlier_in_the_same_run(self) -> None:
        first = self.source_dir / "a.json"
        second = self.source_dir / "b.json"
        first.write_bytes(b"shared")
        second.write_bytes(b"shared")
        new = self.root / "v0.1.0-cc-a"
        new.mkdir()

        store = ReleaseStore(self.root)
        store.place(first, new / "a.json")
        store.place(second, new / "b.json")

        self.assertTrue(same_file(new / "a.json", new / "b.json"))

    def test_place_ignores_an_asset_whose_bytes_disagree_with_its_manifest(self) -> None:
        old = write_release(self.root, "v0.1.0-cc-a", {"catalog.json": b"same"})
        (old / "catalog.json").write_bytes(b"tampered")
        source = self.source_dir / "catalog.json"
        source.write_bytes(b"same")
        new = self.root / "v0.2.0-cc-a"
        new.mkdir()

        ReleaseStore(self.root).place(source, new / "catalog.json")

        self.assertEqual((new / "catalog.json").read_bytes(), b"same")
        self.assertFalse(same_file(old / "catalog.json", new / "catalog.json"))

    def test_place_skips_staging_directories(self) -> None:
        write_release(self.root, ".v0.1.0-cc-a.staging", {"catalog.json": b"same"})
        self.assertEqual(ReleaseStore(self.root).index, {})

    def test_dedupe_links_identical_assets_across_releases(self) -> None:
        old = write_release(self.root, "v0.1.0-cc-a", {"a.json": b"shared", "b.json": b"one"})
        new = write_release(self.root, "v0.2.0-cc-a", {"a.json": b"shared", "b.json": b"two"})

        report = dedupe_releases(self.root)

        self.assertTrue(same_file(old / "a.json", new / "a.json"))
        self.assertFalse(same_file(old / "b.json", new / "b.json"))
        self.assertEqual(report["linkedFiles"], 1)
        self.assertEqual(report["linkedBytes"], len(b"shared"))
        self.assertEqual(report["errors"], [])

    def test_dedupe_is_idempotent(self) -> None:
        write_release(self.root, "v0.1.0-cc-a", {"a.json": b"shared"})
        write_release(self.root, "v0.2.0-cc-a", {"a.json": b"shared"})

        dedupe_releases(self.root)
        second = dedupe_releases(self.root)

        self.assertEqual(second["linkedFiles"], 0)

    def test_dedupe_dry_run_changes_nothing(self) -> None:
        old = write_release(self.root, "v0.1.0-cc-a", {"a.json": b"shared"})
        new = write_release(self.root, "v0.2.0-cc-a", {"a.json": b"shared"})

        report = dedupe_releases(self.root, dry_run=True)

        self.assertEqual(report["linkedFiles"], 1)
        self.assertFalse(same_file(old / "a.json", new / "a.json"))

    def test_dedupe_reports_and_leaves_a_file_that_fails_its_manifest(self) -> None:
        write_release(self.root, "v0.1.0-cc-a", {"a.json": b"shared"})
        new = write_release(self.root, "v0.2.0-cc-a", {"a.json": b"shared"})
        (new / "a.json").write_bytes(b"corrupt")

        report = dedupe_releases(self.root)

        self.assertEqual(report["linkedFiles"], 0)
        self.assertEqual(len(report["errors"]), 1)
        self.assertEqual((new / "a.json").read_bytes(), b"corrupt")

    def test_place_never_writes_through_an_existing_destination(self) -> None:
        old = write_release(self.root, "v0.1.0-cc-a", {"catalog.json": b"same"})
        source = self.source_dir / "catalog.json"
        source.write_bytes(b"different")

        with self.assertRaises(FileExistsError):
            ReleaseStore(self.root).place(source, old / "catalog.json")
        self.assertEqual((old / "catalog.json").read_bytes(), b"same")

    def test_dedupe_cleans_up_when_a_replace_fails(self) -> None:
        write_release(self.root, "v0.1.0-cc-a", {"a.json": b"shared"})
        new = write_release(self.root, "v0.2.0-cc-a", {"a.json": b"shared"})
        import release_store
        original = release_store.os.replace

        def failing_replace(*_args):
            raise PermissionError("file is open")

        release_store.os.replace = failing_replace
        try:
            with self.assertRaises(PermissionError):
                dedupe_releases(self.root)
        finally:
            release_store.os.replace = original
        self.assertEqual(sorted(p.name for p in new.iterdir()), ["a.json", "release.json"])


if __name__ == "__main__":
    unittest.main()
