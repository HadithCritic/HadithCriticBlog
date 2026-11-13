import unittest
from contextlib import redirect_stdout
import io
from pathlib import Path
import tempfile

from finish_continuation import merge, finish, format_reports
import pipeline as p
from audit_translation import latin_key
import test_translation_export


class ContinuationTests(unittest.TestCase):
    def test_report_formatting_requires_exact_source_numbers_and_preserves_words(self):
        row = {"arabic": "٨٨٠ - قال. ٨٨١ - قال", "english": "880. He said.\n\n881 — They said."}
        self.assertEqual(format_reports(row), "**880.** He said.\n\n**881.** They said.")
        row["english"] = "880. He said."
        with self.assertRaisesRegex(ValueError, "Report-number markers"):
            format_reports(row)

    def test_name_check_accepts_compact_patronymic_without_changing_place_names(self):
        self.assertEqual(latin_key("ʿUmar ibn al-Khaṭṭāb"), latin_key("ʿUmar b. al-Khaṭṭāb"))
        self.assertNotEqual(latin_key("Ibn Khaldūn"), latin_key("Khaldūn"))
        self.assertEqual(latin_key("Ibnub"), "ibnub")

    def test_preserves_bom_crlf_and_repeated_existing_footnotes(self):
        prefix = b'\xef\xbb\xbf# Original\r\n\r\n[^1]: Note\r\n'
        result = merge(prefix, [{"english": "**526.** ʿAmr said."},
                                {"english": "The book ends."}])
        self.assertEqual(result[:len(prefix)], prefix)
        self.assertEqual(result.count(prefix), 1)
        self.assertTrue(result.endswith(b'The book ends.\n'))
        self.assertEqual(result.count(b'**526.**'), 1)

    def test_changed_prefix_and_incomplete_continuation_cannot_export(self):
        fixture = test_translation_export.ExportTests()
        with tempfile.TemporaryDirectory() as directory, redirect_stdout(io.StringIO()):
            args, path, job = fixture.fixture(directory)
            original = Path(directory) / "previous.md"
            original.write_bytes(b'Existing translation\r\n')
            snapshot = Path(directory) / "snapshot.md"
            snapshot.write_bytes(original.read_bytes())
            p.write(path / "continuation-provenance.json", {
                "job_hash": job["job_hash"],
                "english_prefix_snapshot_path": str(snapshot),
                "english_prefix_path": str(original),
                "english_prefix_sha256": p.digest(original.read_bytes()),
                "first_source_offset": job["requests"][0]["source_unit"]["start"]})
            args.output = str(Path(directory) / "finished")
            with self.assertRaisesRegex(ValueError, "Incomplete"):
                finish(args)
            self.assertFalse(Path(args.output).exists())
            original.write_bytes(b'Edited after job creation')
            with self.assertRaisesRegex(ValueError, "Existing English translation changed"):
                finish(args)
            self.assertFalse(Path(args.output).exists())


if __name__ == "__main__":
    unittest.main()
