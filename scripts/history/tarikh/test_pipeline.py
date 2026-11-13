import argparse
from contextlib import redirect_stdout
import http.server
import io
import json
from pathlib import Path
import tempfile
import threading
import unittest

import pipeline as p


class PipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.enc = p.tokenizer("o200k_base")

    def test_page_resets_do_not_collide_and_exact_arabic_survives(self):
        text = "# Metadata\r\n---\r\n<!-- Page 1 -->\r\n\r\nحَدَّثَنَا زيد\r\n\r\nقال: سنة ١٢.\r\n\r\n---\r\n\r\n<!-- Page 1 -->\r\n\r\nقال عمرو.\r\n"
        pages, units = p.parse_source(text, "book", self.enc, 1400)
        self.assertEqual([x["label_occurrence"] for x in pages], [1, 2])
        self.assertEqual(len(units), 2)
        self.assertNotEqual(units[0]["id"], units[1]["id"])
        for unit in units:
            self.assertEqual(text[unit["start"]:unit["end"]], unit["arabic"])
        self.assertIn("حَدَّثَنَا", units[0]["arabic"])
        self.assertIn("\r\n\r\n", units[0]["arabic"])
        self.assertNotIn("---", units[0]["arabic"])

    def test_oversized_paragraph_has_no_loss_at_unicode_boundaries(self):
        text = "<!-- Page 5 -->\n\n" + "حدثنا زيد عن أبيه سنة ثلاث. " * 100
        pages, units = p.parse_source(text, "book", self.enc, 50)
        self.assertGreater(len(units), 2)
        self.assertEqual("".join(u["arabic"] for u in units), pages[0]["arabic"])
        self.assertTrue(all(u["source_tokens"] <= 50 and u["split_paragraph"] for u in units))

    def test_glossary_normalization_does_not_mutate_source(self):
        original = "خَلِيفَة بن خَيَّاط"
        self.assertEqual(p.fold(original), "خليفة بن خياط")
        self.assertIn("َ", original)

    def test_place_glossary_does_not_match_a_persons_nisba(self):
        self.assertTrue(p.term_present("دمشق", "أقام بدمشق"))
        self.assertTrue(p.term_present("أبو بكر", "وأبو بكر قال"))
        self.assertFalse(p.term_present("دمشق", "عروة الدمشقي"))

    def test_poetry_detection_does_not_match_al_ashari(self):
        self.assertNotIn("poetry-candidate", p.tags({"arabic": "أبو موسى الأشعري"}))
        self.assertIn("poetry-candidate", p.tags({"arabic": "وأنشدني لنصر"}))
        self.assertNotIn("poetry-candidate", p.tags({"arabic": "أنشدكما الله"}))

    def test_pilot_is_deterministic_and_spans_the_book(self):
        units = [{"arabic": "حدثنا زيد سنة عشر", "source_tokens": i + 1} for i in range(100)]
        chosen = p.select_pilot(units, 25)
        self.assertEqual(chosen, p.select_pilot(units, 25))
        self.assertEqual(len(chosen), 25)
        self.assertIn(0, chosen)
        self.assertIn(99, chosen)

    def request(self):
        r = {"id": "unit-1", "source_hash": "source", "request_hash": "hash",
             "system": "Translate", "payload": {"units": [{"id": "unit-1", "arabic": "سنة ١٢"}]}, "input_text_tokens": 10}
        return r

    def response(self, text="In the year 12."):
        return {"translations": [{"id": "unit-1", "english": text, "uncertainties": []}]}

    def test_ids_are_checked_not_just_json_syntax(self):
        for value in [{"translations": []}, {"translations": self.response()["translations"] * 2},
                      {"translations": [{"id": "wrong", "english": "Wrong", "uncertainties": []}]}]:
            with self.assertRaises(ValueError):
                p.validate_translation(self.request(), value)

    def test_number_checks_flag_rather_than_invent_corrections(self):
        flags = p.validate_translation(self.request(), self.response("In the year thirteen."))
        self.assertIn("numeric-token-difference-check-spelled-out-numbers", flags)
        self.assertFalse(p.validate_translation(self.request(), self.response()))

    def test_native_context_slices_do_not_create_replacement_characters(self):
        for n in range(1, 20):
            self.assertNotIn("\ufffd", p.context_slice(self.enc, "حَدَّثَنَا خَلِيفَة", n))

    def test_result_is_immutable_and_always_a_draft(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            p.save_result(root, {"job_hash": "job"}, self.request(), self.response(), {"model": "fixture"})
            target = p.result_path(root, self.request())
            first = target.read_bytes()
            p.save_result(root, {"job_hash": "job"}, self.request(), self.response(), {"model": "fixture"})
            self.assertEqual(first, target.read_bytes())
            self.assertEqual(p.read(target)["status"], "machine-draft")
            with self.assertRaises(ValueError):
                p.save_result(root, {"job_hash": "job"}, self.request(), self.response("A different translation."), {})

    def test_http_runner_resumes_without_another_request(self):
        calls = []
        outer = self

        class Handler(http.server.BaseHTTPRequestHandler):
            def do_POST(self):
                calls.append(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))
                body = json.dumps({"model": "fixture", "choices": [{"finish_reason": "stop", "message": {"content": json.dumps(outer.response())}}], "usage": {"prompt_tokens": 10, "completion_tokens": 7}}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *args):
                pass

        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with tempfile.TemporaryDirectory() as d:
                path = Path(d) / "jobs" / "test"
                job = {"requests": [self.request()]}
                job["job_hash"] = p.digest(job)
                p.write(path / "job.json", job)
                args = argparse.Namespace(workspace=d, job="test", limit=25, max_output_tokens=100,
                                          input_rate=None, output_rate=None, max_cost=None, dry_run=False,
                                          base_url=f"http://127.0.0.1:{server.server_port}/v1", model="fixture",
                                          key_env="TARIKH_TEST_UNUSED_KEY", max_input_tokens=100, timeout=5)
                with redirect_stdout(io.StringIO()):
                    p.run(args)
                    p.run(args)
                self.assertEqual(len(calls), 1)
                self.assertEqual(p.read(p.result_path(path, self.request()))["usage"]["completion_tokens"], 7)
                self.assertFalse((path / ".running").exists())
        finally:
            server.shutdown()
            server.server_close()
            thread.join()

    def test_budget_guard_prevents_network_calls(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "jobs" / "test"
            job = {"requests": [self.request()]}
            job["job_hash"] = p.digest(job)
            p.write(path / "job.json", job)
            args = argparse.Namespace(workspace=d, job="test", limit=1, max_output_tokens=100,
                                      input_rate=1, output_rate=1, max_cost=1, dry_run=False,
                                      base_url="http://127.0.0.1:1/v1", model="fixture", key_env="UNUSED",
                                      max_input_tokens=1, timeout=1)
            with redirect_stdout(io.StringIO()), self.assertRaisesRegex(ValueError, "budget exceeded"):
                p.run(args)
            self.assertFalse((path / "attempts").exists())

    def test_benchmark_fork_preserves_exact_inputs_without_copying_drafts(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "jobs" / "original"
            job = {"requests": [self.request()]}
            job["job_hash"] = p.digest(job)
            p.write(path / "job.json", job)
            p.save_result(path, job, self.request(), self.response(), {"model": "fixture"})
            with redirect_stdout(io.StringIO()):
                p.fork_job(argparse.Namespace(workspace=d, from_job="original", job="candidate"))
            self.assertEqual(p.read(Path(d) / "jobs/candidate/job.json"), job)
            self.assertFalse((Path(d) / "jobs/candidate/results").exists())

    def test_unsaved_attempt_blocks_an_automatic_paid_retry(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "jobs" / "test"
            job = {"requests": [self.request()]}
            job["job_hash"] = p.digest(job)
            p.write(path / "job.json", job)
            p.write(path / "attempts" / (p.digest("unit-1")[:24] + "-1.json"), {"raw": "incomplete"})
            args = argparse.Namespace(workspace=d, job="test", limit=1, max_output_tokens=100,
                                      input_rate=None, output_rate=None, max_cost=None, dry_run=False,
                                      base_url="http://127.0.0.1:1/v1", model="fixture", key_env="UNUSED",
                                      max_input_tokens=100, timeout=1)
            with redirect_stdout(io.StringIO()), self.assertRaisesRegex(ValueError, "unsaved attempt"):
                p.run(args)
            self.assertFalse((path / ".running").exists())


if __name__ == "__main__":
    unittest.main()
