import argparse
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import tempfile
import unittest

import audit_translation
import pipeline as p


class ExportTests(unittest.TestCase):
    def fixture(self, directory):
        root = Path(directory)
        source = root / "input"
        source.mkdir()
        (source / "book.md").write_text("# History\n\nAuthor: Test\n\n<!-- Page 1 -->\n\nقال زيد.\n\n---\n\n<!-- Page 1 -->\n\nقال عمرو.\n", encoding="utf-8")
        config = {"encoding": "o200k_base", "max_segment_tokens": 1400, "context_tokens_each_side": 100,
                  "books": [{"id": "book", "filename": "book.md"}]}
        p.write(root / "config.json", config)
        (root / "prompt.txt").write_text("Translate the source.", encoding="utf-8")
        p.write(root / "glossary.json", [])
        p.prepare(argparse.Namespace(config=root / "config.json", workspace=root / "work", source_dir=source))
        args = argparse.Namespace(workspace=root / "work", command="full", book="book", job="test", count=25,
                                  unit_id=None, glossary=root / "glossary.json", prompt=root / "prompt.txt")
        p.make_job(args)
        path, job = p.load_job(args)
        return args, path, job

    def save(self, path, job, request, text):
        p.save_result(path, job, request, {"translations": [{"id": request["id"], "english": text,
                      "uncertainties": []}]}, {"provider": "test fixture"})

    def test_partial_and_complete_exports_are_distinguished_and_html_is_escaped(self):
        with tempfile.TemporaryDirectory() as directory, redirect_stdout(io.StringIO()):
            args, path, job = self.fixture(directory)
            self.save(path, job, job["requests"][0], 'Zayd said: <script>alert("test")</script>.')
            p.export(args)
            release = p.read(path / "export/bilingual.json")
            self.assertFalse(release["complete"])
            self.assertEqual(len(release["missing"]), 1)
            self.assertIn("&lt;script&gt;", (path / "export/review.html").read_text(encoding="utf-8"))
            self.assertNotIn('<script>alert("test")</script>', (path / "export/review.html").read_text(encoding="utf-8"))
            self.save(path, job, job["requests"][1], "ʿAmr said.")
            p.export(args)
            release = p.read(path / "export/bilingual.json")
            self.assertTrue(release["complete"])
            self.assertEqual(len({row["id"] for row in release["passages"]}), 2)
            self.assertTrue(all(row["review_status"] == "machine-draft" for row in release["passages"]))
            self.assertEqual((path / "export/english.md").read_text(encoding="utf-8").count("## Page 1"), 2)
            self.assertTrue((path / "export/review-queue.csv").exists())

    def test_coverage_audit_refuses_missing_pages_and_changed_original(self):
        with tempfile.TemporaryDirectory() as directory, redirect_stdout(io.StringIO()):
            args, path, job = self.fixture(directory)
            args.require_complete = True
            self.save(path, job, job["requests"][0], "Zayd said.")
            with self.assertRaisesRegex(ValueError, "Incomplete"):
                audit_translation.audit(args)
            self.save(path, job, job["requests"][1], "ʿAmr said.")
            audit_translation.audit(args)
            self.assertTrue(p.read(path / "coverage-audit.json")["coverage_complete"])
            (Path(args.workspace) / "books/book/original.md").write_text("Changed", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "Original bytes differ"):
                audit_translation.audit(args)


if __name__ == "__main__":
    unittest.main()
