import argparse
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import codex_runner as runner
import pipeline as p


class CodexRunnerTests(unittest.TestCase):
    def job(self, root):
        requests = []
        for i in range(1, 6):
            text = f"سنة {i}"
            request = {"id": f"page-{i}", "system": "Translate faithfully",
                       "payload": {"units": [{"id": f"page-{i}", "arabic": text}], "glossary": [],
                                   "context_before": "", "context_after": ""},
                       "source_hash": p.digest(text.encode()), "request_hash": f"request-{i}"}
            requests.append(request)
        job = {"requests": requests}
        job["job_hash"] = p.digest(job)
        p.write(root / "jobs/test/job.json", job)
        return job

    def args(self, root):
        return argparse.Namespace(workspace=str(root), job="test", workers=2, batch_pages=2,
                                  limit=None, codex="codex", timeout=10, disable_mcp=["paper"])

    def test_schema_requires_ids_translation_and_uncertainties(self):
        schema = runner.schema(["page-1", "page-2"])
        item = schema["properties"]["translations"]["items"]
        self.assertEqual(item["properties"]["id"]["enum"], ["page-1", "page-2"])
        self.assertEqual(item["required"], ["id", "english", "uncertainties"])
        self.assertFalse(item["additionalProperties"])

    def test_only_byte_equivalent_duplicate_data_can_be_recovered(self):
        row = {"id": "page-1", "english": "A complete page.", "uncertainties": []}
        rows, removed = runner.normalize_answer({"translations": [row, row.copy()]}, ["page-1"])
        self.assertEqual(rows, [row])
        self.assertEqual(removed, 1)
        with self.assertRaisesRegex(ValueError, "Conflicting duplicate"):
            runner.normalize_answer({"translations": [row, {**row, "english": "Different"}]}, ["page-1"])
        with self.assertRaisesRegex(ValueError, "Missing"):
            runner.normalize_answer({"translations": []}, ["page-1"])

    def test_batched_runner_saves_every_page_and_resume_starts_no_new_sessions(self):
        calls = []

        def fake_run(command, **kwargs):
            calls.append(command)
            schema_file = Path(command[command.index("--output-schema") + 1])
            ids = p.read(schema_file)["properties"]["translations"]["items"]["properties"]["id"]["enum"]
            p.write(command[command.index("--output-last-message") + 1], {
                "translations": [{"id": id, "english": f"In the year {id[-1]}.", "uncertainties": []} for id in ids]})
            kwargs["stdout"].write(b'{"type":"turn.completed","usage":{"input_tokens":100,"output_tokens":50}}\n')
            return argparse.Namespace(returncode=0)

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            job = self.job(root)
            with patch.object(runner.shutil, "which", return_value="codex.exe"), patch.object(runner.subprocess, "run", side_effect=fake_run), redirect_stdout(io.StringIO()):
                runner.run(self.args(root))
                runner.run(self.args(root))
            self.assertEqual(len(calls), 3)
            self.assertTrue(all("read-only" in command for command in calls))
            self.assertTrue(all("mcp_servers.paper.enabled=false" in command for command in calls))
            path = root / "jobs/test"
            self.assertEqual(len(list((path / "results").glob("*.json"))), 5)
            self.assertEqual(p.read(path / "progress.json")["saved"], 5)
            self.assertFalse((path / ".codex-running").exists())
            for request in job["requests"]:
                saved = p.read(p.result_path(path, request))
                self.assertEqual(saved["status"], "machine-draft")
                self.assertIsNone(saved["usage"])
            self.assertEqual(sum(p.read(f)["usage"]["input_tokens"] for f in (path / "codex-runs").glob("*/batch-receipt.json")), 300)

    def test_unfinished_batch_is_not_silently_reissued(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            job = self.job(root)
            args = self.args(root)
            args.limit, args.workers = 2, 1
            batch_key = p.digest([r["request_hash"] for r in job["requests"][:2]])[:24]
            p.write(root / "jobs/test/codex-runs" / batch_key / "started.json", {"state": "unfinished"})
            with patch.object(runner.shutil, "which", return_value="codex.exe"), patch.object(runner.subprocess, "run") as execute, redirect_stdout(io.StringIO()), self.assertRaisesRegex(ValueError, "Unfinished batch"):
                runner.run(args)
            execute.assert_not_called()
            self.assertFalse((root / "jobs/test/.codex-running").exists())


if __name__ == "__main__":
    unittest.main()
