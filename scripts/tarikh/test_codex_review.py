import unittest
import argparse
from contextlib import redirect_stdout
import io
from pathlib import Path
import tempfile
from unittest.mock import patch

import codex_review as review
import pipeline as p
import test_translation_export as export_tests


class ReviewTests(unittest.TestCase):
    def test_exact_evidence_replaces_only_the_unique_anchor(self):
        revised, accepted, unresolved = review.apply_evidenced_edits(
            {"arabic": "أنت أكبر وأكرم وأنا أسن منك"}, "You are older and nobler; I am older in years.",
            {"edits": [{"source_quote": "أنت أكبر وأكرم", "english_quote": "You are older and nobler",
                        "replacement": "You are greater and nobler", "reason": "The source contrasts standing and age"}]})
        self.assertEqual(revised, "You are greater and nobler; I am older in years.")
        self.assertEqual(len(accepted), 1)
        self.assertFalse(unresolved)

    def test_invented_source_or_nonunique_anchor_is_never_applied(self):
        for source, anchor in [("invented Arabic", "One report."), ("قال زيد", "report")]:
            draft = "One report. Another report."
            revised, accepted, unresolved = review.apply_evidenced_edits({"arabic": "قال زيد"}, draft,
                {"edits": [{"source_quote": source, "english_quote": anchor, "replacement": "Changed text", "reason": "fixture"}]})
            self.assertEqual(revised, draft)
            self.assertFalse(accepted)
            self.assertEqual(len(unresolved), 1)

    def test_revision_cannot_be_applied_to_a_different_initial_draft(self):
        request = {"id": "page", "source_hash": "source"}
        result = {"response": {"translations": [{"id": "page", "english": "Original text.", "uncertainties": []}]}}
        revisions = {"page": {"source_hash": "source", "original_english_hash": p.digest("Some other text.")}}
        with self.assertRaisesRegex(ValueError, "different source or initial draft"):
            p.translation_view(request, result, revisions)

    def test_full_source_comparison_exports_revisions_without_overwriting_raw_drafts(self):
        def fake_run(command, **kwargs):
            ids = p.read(command[command.index("--output-schema") + 1])["properties"]["reviews"]["items"]["properties"]["id"]["enum"]
            rows = [{"id": id, "verdict": "no_issue_found", "edits": [], "notes": []} for id in ids]
            rows[-1] = {"id": ids[-1], "verdict": "changes_suggested", "notes": [], "edits": [
                {"source_quote": "قال عمرو", "english_quote": "ʿUmar said.", "replacement": "ʿAmr said.", "reason": "Incorrect personal name"}]}
            p.write(command[command.index("--output-last-message") + 1], {"reviews": rows})
            kwargs["stdout"].write(b'{"type":"turn.completed","usage":{"input_tokens":200,"output_tokens":100}}\n')
            return argparse.Namespace(returncode=0)

        with tempfile.TemporaryDirectory() as directory, redirect_stdout(io.StringIO()):
            fixture = export_tests.ExportTests()
            args, path, job = fixture.fixture(directory)
            fixture.save(path, job, job["requests"][0], "Zayd said.")
            fixture.save(path, job, job["requests"][1], "ʿUmar said.")
            raw_path = p.result_path(path, job["requests"][1])
            raw = raw_path.read_bytes()
            args.workers, args.batch_pages, args.disable_mcp, args.timeout = 1, 12, [], 10
            with patch.object(review.shutil, "which", return_value="codex.exe"), patch.object(review.subprocess, "run", side_effect=fake_run):
                review.run(args)
            self.assertEqual(raw_path.read_bytes(), raw)
            revised = p.read(path / "machine-reviewed.json")
            self.assertEqual(len(revised["pages"]), 2)
            self.assertFalse(revised["human_review"])
            p.export(args)
            exported = p.read(path / "export/bilingual.json")
            self.assertEqual(exported["passages"][1]["english"], "ʿAmr said.")
            self.assertEqual(exported["passages"][1]["review_status"], "machine-draft")

    def test_wrong_page_proposal_is_recovered_only_by_exact_bilingual_evidence(self):
        with tempfile.TemporaryDirectory() as directory, redirect_stdout(io.StringIO()):
            fixture = export_tests.ExportTests()
            args, path, job = fixture.fixture(directory)
            fixture.save(path, job, job["requests"][0], "Zayd said.")
            fixture.save(path, job, job["requests"][1], "ʿUmar said.")
            first, second = [r["id"] for r in job["requests"]]
            rows = [{"id": first, "verdict": "changes_suggested", "notes": [], "edits": [
                {"source_quote": "قال عمرو", "english_quote": "ʿUmar said.", "replacement": "ʿAmr said.", "reason": "Wrong name"}]},
                {"id": second, "verdict": "no_issue_found", "notes": [], "edits": []}]
            p.write(path / "codex-review/batch/normalized.json", {"reviews": rows})
            review.assemble(path, job)
            revisions = p.read(path / "machine-reviewed.json")["pages"]
            self.assertEqual(revisions[0]["english"], "Zayd said.")
            self.assertEqual(revisions[1]["english"], "ʿAmr said.")
            self.assertEqual(revisions[1]["accepted_edits"][0]["reported_page_id"], first)

    def test_primary_decision_preserves_rejected_wording_and_records_its_own_correction(self):
        with tempfile.TemporaryDirectory() as directory, redirect_stdout(io.StringIO()):
            fixture = export_tests.ExportTests()
            args, path, job = fixture.fixture(directory)
            fixture.save(path, job, job["requests"][0], "Zayd said.")
            fixture.save(path, job, job["requests"][1], "ʿUmar said.")
            first, second = [r["id"] for r in job["requests"]]
            p.write(path / "codex-review/batch/normalized.json", {"reviews": [
                {"id": first, "verdict": "changes_suggested", "notes": [], "edits": [
                    {"source_quote": "قال زيد", "english_quote": "Zayd said.", "replacement": "Zayd reported.", "reason": "Stylistic preference"}]},
                {"id": second, "verdict": "no_issue_found", "notes": [], "edits": []}]})
            p.write(path / "primary-review-decisions.json", {"job_hash": job["job_hash"], "human_review": False, "pages": [
                {"id": first, "reject_anchors": ["Zayd said."], "notes": ["No material error"], "edits": []},
                {"id": second, "reject_anchors": [], "notes": [], "edits": [
                    {"source_quote": "قال عمرو", "english_quote": "ʿUmar said.", "replacement": "ʿAmr said.", "reason": "Wrong name"}]}]})
            review.assemble(path, job)
            revisions = p.read(path / "machine-reviewed.json")["pages"]
            self.assertEqual(revisions[0]["english"], "Zayd said.")
            self.assertEqual(len(revisions[0]["rejected_proposals"]), 1)
            self.assertEqual(revisions[1]["english"], "ʿAmr said.")


if __name__ == "__main__":
    unittest.main()
