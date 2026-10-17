"""Translate a frozen job using explicitly authorized local Codex worker sessions."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import threading
import time

import pipeline as p


def schema(ids):
    return {"type": "object", "properties": {"translations": {"type": "array", "items": {
        "type": "object", "properties": {
            "id": {"type": "string", "enum": ids}, "english": {"type": "string"},
            "uncertainties": {"type": "array", "items": {"type": "string"}}},
        "required": ["id", "english", "uncertainties"], "additionalProperties": False}}},
        "required": ["translations"], "additionalProperties": False}


def batch_prompt(requests):
    # One common instruction block rather than repeating it for each page.
    payload = [{"page_id": r["id"], **r["payload"]} for r in requests]
    return (requests[0]["system"] + "\n\n"
            "This is a complete translation assignment, not a coding task. Do not use tools, inspect files, "
            "run commands, browse, summarize, or delegate. All source text needed is below. "
            "Translate every word of every supplied unit, preserving all names and chain links. "
            "Each unit is a consecutive printed page and may begin or end within a report. "
            "Use adjacent pages/context to understand syntax, but translate only the words assigned to each unit. "
            "Never omit names in lists or repetitive reporting formulas for brevity. "
            "Do not finish a sentence by translating text assigned to the next page. "
            "Check completeness against the Arabic before producing the final JSON. "
            "Keep short specific uncertainty notes for damaged or ambiguous readings. "
            "Acknowledge source uncertainty without replacing the translation with commentary. "
            "Return a single translations array covering all unit ids exactly once in the supplied order.\n\n"
            + p.canonical({"pages": payload}))


def normalize_answer(answer, expected):
    rows, seen = [], {}
    for row in answer.get("translations", []):
        id = row.get("id")
        if id in seen:
            if row != seen[id]:
                raise ValueError("Conflicting duplicate page translations")
            continue
        seen[id] = row
        rows.append(row)
    if [row.get("id") for row in rows] != expected:
        raise ValueError("Missing, unknown or reordered page IDs")
    return rows, len(answer["translations"]) - len(rows)


def run(args):
    args.model = getattr(args, "model", None)
    path, job = p.load_job(args)
    binary = shutil.which(args.codex)
    if not binary:
        raise ValueError("Codex CLI was not found")
    pending = []
    for request in job["requests"]:
        dest = p.result_path(path, request)
        if dest.exists():
            result = p.read(dest)
            if result["job_hash"] != job["job_hash"] or result["request_hash"] != request["request_hash"]:
                raise ValueError("An existing checkpoint does not match the frozen job")
            p.validate_translation(request, result["response"])
        else:
            pending.append(request)
    if args.limit:
        pending = pending[:args.limit]
    groups = [pending[i:i + args.batch_pages] for i in range(0, len(pending), args.batch_pages)]
    print(f"{len(job['requests']) - len([r for r in job['requests'] if not p.result_path(path, r).exists()])}/{len(job['requests'])} saved; {len(pending)} selected; {len(groups)} batches; {args.workers} workers", flush=True)
    if not groups:
        return
    run_root = path / "codex-runs"
    run_root.mkdir(exist_ok=True)
    lock = path / ".codex-running"
    with lock.open("x", encoding="utf-8") as f:
        f.write(str(os.getpid()))
    stop = threading.Event()
    counter_lock = threading.Lock()
    done = 0

    def worker(requests):
        nonlocal done
        if stop.is_set():
            return
        batch_key = p.digest([r["request_hash"] for r in requests])[:24]
        directory = run_root / batch_key
        directory.mkdir(exist_ok=True)
        prompt = batch_prompt(requests)
        schema_file = directory / "schema.json"
        answer_file = directory / "answer.json"
        p.write(schema_file, schema([r["id"] for r in requests]))
        (directory / "prompt.txt").write_text(prompt, encoding="utf-8")
        if not answer_file.exists():
            # A failed attempt never silently starts a second session on resume.
            if (directory / "started.json").exists():
                raise ValueError(f"Unfinished batch {batch_key}; inspect logs before a retry")
            p.write(directory / "started.json", {"pid": os.getpid(), "job_hash": job["job_hash"],
                    "model": args.model or "User-configured Codex default",
                    "request_ids": [r["id"] for r in requests], "prompt_sha256": p.digest(prompt),
                    "started_at": datetime.now(timezone.utc).isoformat()})
            command = [binary, "exec", "--sandbox", "read-only", "--skip-git-repo-check", "--ephemeral",
                       "--color", "never", "--json", "--cd", str(directory),
                       "--output-schema", str(schema_file), "--output-last-message", str(answer_file), "-"]
            if args.model:
                command[2:2] = ["--model", args.model]
            # These configured integrations are unrelated to translation. Disable
            # them only for this invocation; keep account/model preferences intact.
            for server in args.disable_mcp:
                command[2:2] = ["--config", f"mcp_servers.{server}.enabled=false"]
            env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
            with (directory / "events.jsonl").open("wb") as stdout, (directory / "stderr.log").open("wb") as stderr:
                completed = subprocess.run(command, input=prompt.encode("utf-8"), stdout=stdout, stderr=stderr,
                                           env=env, timeout=args.timeout)
            p.write(directory / "exit.json", {"exit_code": completed.returncode,
                    "finished_at": datetime.now(timezone.utc).isoformat()})
            if completed.returncode:
                raise ValueError(f"Codex batch {batch_key} exited {completed.returncode}; inspect its local logs")
        answer = p.read(answer_file)
        expected = [r["id"] for r in requests]
        normalized, duplicates = normalize_answer(answer, expected)
        for request, row in zip(requests, normalized):
            p.validate_translation(request, {"translations": [row]})
        events = p.jsonl(directory / "events.jsonl")
        usage = next((e.get("usage") for e in reversed(events) if e.get("type") == "turn.completed"), None)
        provenance = {"method": "codex-cli", "provider": "Codex CLI, existing ChatGPT login",
                      "model": args.model or "User-configured Codex default; see CLI event log for reported identity",
                      "batch_id": batch_key, "prompt_sha256": p.digest(prompt),
                      "usage_note": "Batch usage is stored once in batch-receipt.json, not multiplied across pages"}
        for request, row in zip(requests, normalized):
            p.save_result(path, job, request, {"translations": [row]}, provenance)
        p.write(directory / "batch-receipt.json", {"job_hash": job["job_hash"], "batch_id": batch_key,
                "model": args.model or "User-configured Codex default",
                "request_ids": expected, "usage": usage, "status": "machine-draft",
                "identical_duplicate_rows_removed": duplicates})
        with counter_lock:
            done += len(requests)
            saved = sum(p.result_path(path, r).exists() for r in job["requests"])
            p.write(path / "progress.json", {"saved": saved, "total": len(job["requests"]),
                    "status": "running" if saved < len(job["requests"]) else "draft-complete",
                    "updated_at": datetime.now(timezone.utc).isoformat()})
            print(f"Saved {saved}/{len(job['requests'])}: {requests[0]['id']} through {requests[-1]['id']}", flush=True)

    try:
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = [pool.submit(worker, group) for group in groups]
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception:
                    stop.set()
                    raise
    finally:
        lock.unlink()
    print(f"Saved {done} pages in this run", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--job", required=True)
    parser.add_argument("--workers", type=int, choices=[1, 2, 3], default=3)
    parser.add_argument("--batch-pages", type=int, default=4)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--timeout", type=int, default=900)
    parser.add_argument("--codex", default="codex")
    parser.add_argument("--model", help="Explicitly requested worker model; otherwise use configured default")
    parser.add_argument("--disable-mcp", action="append", default=[], help="Disable a named unrelated integration only in this worker invocation")
    args = parser.parse_args()
    if args.batch_pages < 1 or args.timeout < 1 or (args.limit is not None and args.limit < 1):
        parser.error("Batch, timeout and limit must be positive")
    try:
        run(args)
    except (ValueError, OSError, subprocess.TimeoutExpired, KeyError, TypeError) as error:
        print(f"Stopped: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
