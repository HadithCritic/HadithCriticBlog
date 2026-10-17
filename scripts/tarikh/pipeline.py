"""Local, auditable historical translation jobs. Nothing publishes automatically."""
from __future__ import annotations

import argparse
from collections import Counter
import csv
from datetime import datetime, timezone
import hashlib
import html
import json
import math
import os
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

HERE = Path(__file__).resolve().parent
VERSION = 2
PAGE = re.compile(r"<!-- Page ([^\r\n]*?) -->")
DIACRITICS = re.compile(r"[\u064b-\u065f\u0670\u0640]")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Provider credentials must not follow redirects to another endpoint.
        return None


def digest(value):
    data = value if isinstance(value, bytes) else canonical(value).encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp, path)


def jsonl(path):
    if not Path(path).exists():
        return []
    return [json.loads(line) for line in Path(path).read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path, rows):
    Path(path).write_text("".join(canonical(row) + "\n" for row in rows), encoding="utf-8")


def tokenizer(name):
    try:
        import tiktoken
    except ImportError:
        raise ValueError("Install counting dependency: python -m pip install -r scripts/tarikh/requirements.txt")
    return tiktoken.get_encoding(name)


def count(enc, text):
    return len(enc.encode(text, disallowed_special=()))


def fold(text):
    return DIACRITICS.sub("", text)


def term_present(term, text):
    # Allow attached Arabic conjunctions/prepositions, but not a nisba suffix:
    # دمشق matches بدمشق, while الدمشقي is a person's nisba, not the place token.
    pattern = r"(?<!\w)(?:[وفبكل]{0,2}(?:ال)?)?" + re.escape(fold(term)) + r"(?!\w)"
    return bool(re.search(pattern, fold(text)))


def split_spans(text, start, end, enc, limit):
    """Keep exact character spans; prefer paragraph/word boundaries over token cuts."""
    while start < end:
        if count(enc, text[start:end]) <= limit:
            yield start, end
            return
        words = [m.end() + start for m in re.finditer(r"\S+\s*", text[start:end])]
        low, high = 0, len(words) - 1
        while low < high:
            mid = (low + high + 1) // 2
            if count(enc, text[start:words[mid]]) <= limit:
                low = mid
            else:
                high = mid - 1
        stop = words[low]
        if count(enc, text[start:stop]) > limit:
            raise ValueError("Single unbroken word exceeds token budget; inspect source")
        yield start, stop
        start = stop


def parse_source(text, book_id, enc, limit):
    markers = list(PAGE.finditer(text))
    if not markers:
        raise ValueError(f"{book_id}: no page markers")
    pages, units = [], []
    occurrences = Counter()
    for index, marker in enumerate(markers):
        label = marker.group(1)
        occurrences[label] += 1
        start = marker.end()
        end = markers[index + 1].start() if index + 1 < len(markers) else len(text)
        # Only remove the export's outer Markdown separators, never internal text.
        block = text[start:end]
        left = re.match(r"\s*", block).end()
        right = len(block.rstrip())
        framing = re.search(r"\n\s*---\s*$", block[:right])
        if framing:
            right = framing.start()
        while right > left and block[right - 1].isspace():
            right -= 1
        pstart, pend = start + left, start + right
        page_id = f"{book_id}:p{index + 1:05}"
        pages.append({"id": page_id, "sequence": index + 1, "page_label": label,
                      "label_occurrence": occurrences[label], "start": pstart, "end": pend,
                      "arabic": text[pstart:pend]})
        page_spans = []
        for para in re.finditer(r"\S[\s\S]*?(?=\n\s*\n|\Z)", text[pstart:pend]):
            a, b = pstart + para.start(), pstart + para.end()
            spans = list(split_spans(text, a, b, enc, limit))
            for part, (a, b) in enumerate(spans):
                page_spans.append((a, b, len(spans) > 1, part + 1))
        # Bundle neighboring complete paragraphs on a page to amortize the prompt.
        # Oversized paragraph fragments stay distinct and carry a visible flag.
        bundled = []
        for a, b, partial, part in page_spans:
            if bundled and not partial and not bundled[-1][2] and count(enc, text[bundled[-1][0]:b]) <= limit:
                bundled[-1] = (bundled[-1][0], b, False, 1)
            else:
                bundled.append((a, b, partial, part))
        for seq, (a, b, partial, part) in enumerate(bundled, 1):
            arabic = text[a:b]
            units.append({"id": f"{page_id}:u{seq:03}", "book_id": book_id,
                          "page_id": page_id, "page_label": label,
                          "page_sequence": index + 1, "label_occurrence": occurrences[label],
                          "start": a, "end": b, "arabic": arabic,
                          "source_hash": digest(arabic.encode("utf-8")),
                          "source_tokens": count(enc, arabic),
                          "split_paragraph": partial,
                          "paragraph_part": part})
    return pages, units


def prepare(args):
    config = read(args.config)
    enc = tokenizer(config["encoding"])
    root = Path(args.workspace)
    for book in config["books"]:
        raw = (Path(args.source_dir) / book["filename"]).read_bytes()
        # Decode without newline translation: spans refer to this exact UTF-8 string.
        text = raw.decode("utf-8-sig")
        pages, units = parse_source(text, book["id"], enc, config["max_segment_tokens"])
        target = root / "books" / book["id"]
        manifest = {"schema_version": VERSION, "book_id": book["id"], "filename": book["filename"],
                    "file_sha256": digest(raw), "config": config,
                    "metadata_markdown": text[:PAGE.search(text).start()].strip(),
                    "pages": len(pages), "units": len(units),
                    "repeated_page_labels": len(pages) - len({p["page_label"] for p in pages}),
                    "source_tokens": sum(u["source_tokens"] for u in units),
                    "token_count_note": f"Exact {enc.name} text encoding counts; not provider billing counts",
                    "coordinate_note": "Python Unicode character offsets in UTF-8-sig decoded original; CRLF retained"}
        if (target / "manifest.json").exists():
            if read(target / "manifest.json") != manifest:
                raise ValueError(f"{target}: existing source/config differs; use a new workspace")
            print(f"{book['id']}: already prepared, unchanged")
            continue
        target.mkdir(parents=True, exist_ok=True)
        (target / "original.md").write_bytes(raw)
        write_jsonl(target / "pages.jsonl", pages)
        write_jsonl(target / "units.jsonl", units)
        write(target / "manifest.json", manifest)
        print(f"{book['id']}: {len(pages)} page blocks, {len(units)} units, {manifest['source_tokens']:,} encoded tokens")


def audit(args):
    for book in sorted((Path(args.workspace) / "books").iterdir()):
        manifest = read(book / "manifest.json")
        raw = (book / "original.md").read_bytes()
        if digest(raw) != manifest["file_sha256"]:
            raise ValueError(f"{book.name}: original file hash changed")
        text = raw.decode("utf-8-sig")
        enc = tokenizer(manifest["config"]["encoding"])
        pages, units = parse_source(text, manifest["book_id"], enc, manifest["config"]["max_segment_tokens"])
        if pages != jsonl(book / "pages.jsonl") or units != jsonl(book / "units.jsonl"):
            raise ValueError(f"{book.name}: stored source spans differ from the original")
        if len({u["id"] for u in units}) != len(units):
            raise ValueError("Duplicate unit ids")
        for page in pages:
            joined = "".join(u["arabic"] for u in units if u["page_id"] == page["id"])
            if re.sub(r"\s", "", joined) != re.sub(r"\s", "", page["arabic"]):
                raise ValueError(f"{page['id']}: text lost while segmenting")
        if any(u["source_tokens"] > manifest["config"]["max_segment_tokens"] for u in units):
            raise ValueError("Segment token budget exceeded")
        print(f"{book.name}: original SHA-256, exact spans, complete non-whitespace coverage, unique IDs and token budgets verified")


def tags(unit):
    t = fold(unit["arabic"])
    return [name for name, regex in [
        ("chain", r"حدثنا|حدثني|أخبرنا|اخبرنا"),
        ("date", r"سنة|عام |شهر|\d|[٠-٩]"),
        ("poetry-candidate", r"أنشدني|انشدني|\bالشاعر\b|\bشعرا\b|\.\.\."),
        ("editorial-candidate", r"المحقق|المخطوط|نسخة|الهامش"),
        ("variant-candidate", r"وقيل|ويقال|اختلف|قال بعض")
    ] if re.search(regex, t)]


def select_pilot(units, size):
    if size < 1 or size > len(units):
        raise ValueError(f"Pilot count must be between 1 and {len(units)}")
    selected = {0, len(units) - 1} if size >= 2 else {0}
    # Coverage across the entire book, then difficult text types and length extremes.
    for feature in ["poetry-candidate", "editorial-candidate", "variant-candidate", "chain", "date"]:
        candidates = [i for i, u in enumerate(units) if feature in tags(u)]
        if candidates and len(selected) < size:
            selected.add(candidates[len(candidates) // 2])
        if len(selected) == size:
            break
    if len(selected) < size:
        selected.add(max(range(len(units)), key=lambda i: units[i]["source_tokens"]))
    for i in range(size):
        if len(selected) >= size:
            break
        selected.add(round(i * (len(units) - 1) / max(1, size - 1)))
    for i in range(len(units)):
        if len(selected) >= size:
            break
        selected.add(i)
    return sorted(selected)


def context_slice(enc, text, limit, tail=False):
    tokens = enc.encode(text, disallowed_special=())
    chosen = tokens[-limit:] if tail else tokens[:limit]
    return enc.decode_bytes(chosen).decode("utf-8", errors="ignore")


def pilot_excerpt(unit, enc, limit):
    """A complete paragraph from each sampled page where possible, not 25 full pages."""
    if unit["source_tokens"] <= limit:
        return unit, "", ""
    text = unit["arabic"]
    paragraphs = list(re.finditer(r"\S[\s\S]*?(?=\n\s*\n|\Z)", text))
    candidates = [m for m in paragraphs if 50 <= count(enc, m.group()) <= limit]
    if candidates:
        # Prefer substantive, report-bearing paragraphs over tiny headings.
        chosen = max(candidates, key=lambda m: min(count(enc, m.group()), 350)
                     + 20 * len(tags({"arabic": m.group()}))
                     + (1000 if "poetry-candidate" in tags({"arabic": m.group()}) else 0))
        start, end, partial = chosen.start(), chosen.end(), False
    else:
        chosen = max(paragraphs, key=lambda m: count(enc, m.group()))
        start, end = next(split_spans(text, chosen.start(), chosen.end(), enc, limit))
        partial = True
    result = {**unit, "id": unit["id"] + f":x{start}-{end}", "start": unit["start"] + start,
              "end": unit["start"] + end, "arabic": text[start:end],
              "source_hash": digest(text[start:end].encode("utf-8")),
              "source_tokens": count(enc, text[start:end]), "split_paragraph": partial,
              "parent_unit_id": unit["id"], "pilot_excerpt": True}
    return result, text[:start], text[end:]


def make_job(args):
    book = Path(args.workspace) / "books" / args.book
    manifest = read(book / "manifest.json")
    units = jsonl(book / "units.jsonl")
    enc = tokenizer(manifest["config"]["encoding"])
    glossary = read(args.glossary)
    prompt = Path(args.prompt).read_text(encoding="utf-8").strip()
    indices = select_pilot(units, args.count) if args.command == "pilot" else list(range(len(units)))
    if args.unit_id:
        indices = [i for i, unit in enumerate(units) if unit["id"] in args.unit_id]
        if len(indices) != len(set(args.unit_id)):
            raise ValueError("Unknown --unit-id")
    requests = []
    for i in indices:
        unit = units[i]
        before, after = "", ""
        if args.command == "pilot":
            unit, before, after = pilot_excerpt(unit, enc, args.max_source_tokens)
        folded = fold(unit["arabic"])
        matched = [entry for entry in glossary if term_present(entry["source"], folded)]
        context_limit = manifest["config"]["context_tokens_each_side"]
        before = "\n\n".join(s for s in [(units[i - 1]["arabic"] if i else ""), before] if s)
        after = "\n\n".join(s for s in [after, (units[i + 1]["arabic"] if i + 1 < len(units) else "")] if s)
        payload = {"context_before": context_slice(enc, before, context_limit, True),
                   "units": [{"id": unit["id"], "arabic": unit["arabic"], "partial_paragraph": unit["split_paragraph"]}],
                   "context_after": context_slice(enc, after, context_limit),
                   "glossary": matched}
        request = {"id": unit["id"], "system": prompt, "payload": payload,
                   "source_hash": unit["source_hash"], "source_unit": unit, "features": tags(unit)}
        request["input_text_tokens"] = count(enc, prompt) + count(enc, canonical(payload))
        request["request_hash"] = digest(request)
        requests.append(request)
    job = {"schema_version": VERSION, "book_id": args.book, "source_file_sha256": manifest["file_sha256"],
           "source_manifest_hash": digest(manifest), "prompt_hash": digest(prompt), "glossary_hash": digest(glossary),
           "kind": args.command, "encoding": enc.name, "request_count": len(requests),
           "input_text_tokens": sum(r["input_text_tokens"] for r in requests),
           "requests": requests}
    job["job_hash"] = digest(job)
    target = Path(args.workspace) / "jobs" / args.job
    if (target / "job.json").exists() and read(target / "job.json") != job:
        raise ValueError("Job already exists with different inputs; choose a new --job")
    write(target / "job.json", job)
    print(f"{target}: {len(requests)} requests, {job['input_text_tokens']:,} input text tokens (encoding: {enc.name}; excludes API framing)")


def load_job(args):
    path = Path(args.workspace) / "jobs" / args.job
    job = read(path / "job.json")
    expected = job.pop("job_hash")
    if digest(job) != expected:
        raise ValueError("Job integrity check failed")
    job["job_hash"] = expected
    return path, job


def fork_job(args):
    if args.job == args.from_job:
        raise ValueError("Fork needs a different job name")
    _, job = load_job(argparse.Namespace(workspace=args.workspace, job=args.from_job))
    target = Path(args.workspace) / "jobs" / args.job / "job.json"
    if target.exists():
        if read(target) != job:
            raise ValueError("Destination already contains a different job")
    else:
        write(target, job)
    print(f"{args.job}: exact frozen requests copied; no results copied")


def validate_translation(request, response):
    if not isinstance(response, dict) or set(response) != {"translations"}:
        raise ValueError("Response must have only a translations array")
    rows = response["translations"]
    ids = [u["id"] for u in request["payload"]["units"]]
    if not isinstance(rows, list) or [r.get("id") for r in rows if isinstance(r, dict)] != ids or len(rows) != len(ids):
        raise ValueError("Missing, duplicated, reordered or unknown unit IDs")
    flags = []
    for source, row in zip(request["payload"]["units"], rows):
        if set(row) != {"id", "english", "uncertainties"}:
            raise ValueError("Each translation needs exactly id, english, uncertainties")
        if not isinstance(row["english"], str) or not re.search(r"[A-Za-z]", row["english"]):
            raise ValueError("Translation must contain English text")
        if not isinstance(row["uncertainties"], list) or any(not isinstance(x, str) for x in row["uncertainties"]):
            raise ValueError("uncertainties must be a string array")
        ratio = len(row["english"]) / max(1, len(source["arabic"]))
        if ratio < 0.35 or ratio > 5:
            flags.append("unusual-length-ratio")
        if row["uncertainties"]:
            flags.append("translator-uncertainty")
        normalize = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")
        original_numbers = Counter(re.findall(r"\d+", source["arabic"].translate(normalize)))
        translated_numbers = Counter(re.findall(r"\d+", row["english"].translate(normalize)))
        if original_numbers != translated_numbers:
            flags.append("numeric-token-difference-check-spelled-out-numbers")
    return sorted(set(flags))


def result_path(path, request):
    return path / "results" / (digest(request["id"])[:24] + ".json")


def load_revisions(path, job):
    target = path / "machine-reviewed.json"
    if not target.exists():
        return {}
    review = read(target)
    if review["job_hash"] != job["job_hash"] or review.get("human_review") is not False:
        raise ValueError("Machine review does not match this job or claims human review")
    rows = {row["id"]: row for row in review["pages"]}
    if len(rows) != len(review["pages"]) or set(rows) != {r["id"] for r in job["requests"]}:
        raise ValueError("Machine review page coverage mismatch")
    return rows


def translation_view(request, result, revisions):
    original = result["response"]["translations"][0]
    review = revisions.get(request["id"])
    if review is None:
        return {**original, "translation_revision": "initial-machine-draft"}
    if review["source_hash"] != request["source_hash"] or review["original_english_hash"] != digest(original["english"]):
        raise ValueError("Machine revision refers to a different source or initial draft")
    revised = {**original, "english": review["english"], "translation_revision": "codex-source-compared",
               "uncertainties": list(dict.fromkeys(original["uncertainties"] + review["review_notes"] +
                    ["Unapplied proposed correction: " + edit["reason"] for edit in review["unresolved_edits"]])),
               "machine_review": {"verdict": review["review_verdict"], "human_review": False,
                    "accepted_edits": len(review["accepted_edits"]), "unresolved_edits": len(review["unresolved_edits"])}}
    validate_translation(request, {"translations": [{k: revised[k] for k in ["id", "english", "uncertainties"]}]})
    return revised


def save_result(path, job, request, response, provenance, usage=None):
    flags = validate_translation(request, response)
    target = result_path(path, request)
    result = {"job_hash": job["job_hash"], "request_hash": request["request_hash"],
              "source_hash": request["source_hash"], "status": "machine-draft",
              "response": response, "flags": flags, "provenance": provenance,
              "usage": usage, "created_at": datetime.now(timezone.utc).isoformat()}
    if target.exists():
        existing = read(target)
        if existing["request_hash"] == request["request_hash"] and existing["response"] == response:
            return
        raise ValueError("Existing translation differs; use a new job for revisions")
    write(target, result)


def ingest(args):
    path, job = load_job(args)
    incoming = read(args.file)
    lookup = {r["id"]: r for r in job["requests"]}
    if not isinstance(incoming, list):
        raise ValueError("Import must be an array of {request_id, response} objects")
    seen = set()
    # Validate entire import before making any writes.
    for row in incoming:
        if row["request_id"] in seen or row["request_id"] not in lookup:
            raise ValueError("Duplicate or unknown imported request_id")
        seen.add(row["request_id"])
        validate_translation(lookup[row["request_id"]], row["response"])
    for row in incoming:
        save_result(path, job, lookup[row["request_id"]], row["response"],
                    {"method": "import", "model": args.model, "provider": args.provider})
    print(f"Imported {len(incoming)} machine drafts; no human review claimed")


def run(args):
    path, job = load_job(args)
    pending = [r for r in job["requests"] if not result_path(path, r).exists()][:args.limit]
    total = sum(r["input_text_tokens"] for r in pending)
    ceiling = len(pending) * args.max_output_tokens
    estimate = (total * args.input_rate + ceiling * args.output_rate) / 1_000_000 if args.input_rate is not None and args.output_rate is not None else None
    print(canonical({"pending_requests": len(pending), "input_text_tokens": total,
                     "output_token_ceiling": ceiling, "estimated_cost_usd": estimate,
                     "note": "Input excludes provider framing; rates supplied by operator. No billing guarantee."}))
    if args.dry_run or not pending:
        return
    parsed = urllib.parse.urlparse(args.base_url or "")
    local = parsed.hostname in {"localhost", "127.0.0.1", "::1"}
    if not parsed.hostname or (parsed.scheme != "https" and not (local and parsed.scheme == "http")) or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError("Explicit HTTPS --base-url required (HTTP allowed on loopback only); no embedded credentials/query")
    if not args.model:
        raise ValueError("Explicit --model required")
    key = os.environ.get(args.key_env, "")
    if not local and not key:
        raise ValueError(f"Set {args.key_env} in the environment; do not put keys in source files")
    if total > args.max_input_tokens:
        raise ValueError("Input token budget exceeded")
    if args.max_cost is not None and (estimate is None or estimate * 1.1 > args.max_cost):
        raise ValueError("Cost guard needs both rates and estimate plus 10% framing reserve below --max-cost")
    identity = {"model": args.model, "base_url": args.base_url, "max_output_tokens": args.max_output_tokens}
    if (path / "runner.json").exists() and read(path / "runner.json") != identity:
        raise ValueError("Runner configuration changed; use a separate job for each benchmark model/configuration")
    for request in pending:
        if list((path / "attempts").glob(digest(request["id"])[:24] + "-*.json")):
            raise ValueError("An unsaved attempt exists; recover its raw response with import or use a new job. No automatic paid retry.")
    lock = path / ".running"
    with lock.open("x", encoding="utf-8") as f:
        f.write(str(os.getpid()))
    try:
        write(path / "runner.json", identity)
        for request in pending:
            if result_path(path, request).exists():
                continue
            if list((path / "attempts").glob(digest(request["id"])[:24] + "-*.json")):
                raise ValueError("Unsaved attempt appeared; inspect it before retrying")
            body = {"model": args.model, "messages": [
                {"role": "system", "content": request["system"]},
                {"role": "user", "content": canonical(request["payload"])}],
                "max_tokens": args.max_output_tokens, "response_format": {"type": "json_object"}}
            headers = {"Content-Type": "application/json"}
            if key:
                headers["Authorization"] = f"Bearer {key}"
            req = urllib.request.Request(args.base_url.rstrip("/") + "/chat/completions", data=canonical(body).encode("utf-8"), headers=headers)
            # No automatic retries: ambiguous failures may already have incurred cost.
            try:
                with urllib.request.build_opener(NoRedirect).open(req, timeout=args.timeout) as response:
                    raw = json.load(response)
            except urllib.error.HTTPError as error:
                raise ValueError(f"Provider HTTP {error.code}; stopped without retry (response body withheld)") from None
            except urllib.error.URLError:
                raise ValueError("Provider connection failed; stopped without retry; check provider usage before resuming") from None
            attempt = path / "attempts" / (digest(request["id"])[:24] + f"-{time.time_ns()}.json")
            write(attempt, {"request_id": request["id"], "job_hash": job["job_hash"],
                            "provider": args.base_url, "model": args.model, "raw": raw})
            choice = raw["choices"][0]
            if choice.get("finish_reason") != "stop":
                raise ValueError(f"Incomplete output for {request['id']}; raw response saved; no retry")
            result = json.loads(choice["message"]["content"])
            save_result(path, job, request, result, {"method": "chat-completions", "provider": args.base_url,
                        "model": args.model, "reported_model": raw.get("model")}, raw.get("usage"))
            print(f"Saved {request['id']}")
    finally:
        lock.unlink()


def export(args):
    path, job = load_job(args)
    revisions = load_revisions(path, job)
    book = Path(args.workspace) / "books" / job["book_id"]
    units = {u["id"]: u for u in jsonl(book / "units.jsonl")}
    manifest = read(book / "manifest.json")
    if digest(manifest) != job["source_manifest_hash"]:
        raise ValueError("Source manifest no longer matches job")
    rows, missing = [], []
    for request in job["requests"]:
        target = result_path(path, request)
        unit = request.get("source_unit") or units[request["id"]]
        if not target.exists():
            missing.append(unit["id"])
            continue
        result = read(target)
        if result["job_hash"] != job["job_hash"] or result["request_hash"] != request["request_hash"] or digest(unit["arabic"].encode("utf-8")) != result["source_hash"]:
            raise ValueError("Result/source integrity mismatch")
        flags = validate_translation(request, result["response"])
        translated = translation_view(request, result, revisions)
        flags = validate_translation(request, {"translations": [{k: translated[k] for k in ["id", "english", "uncertainties"]}]})
        rows.append({**unit, "english": translated["english"], "uncertainties": translated["uncertainties"],
                     "review_status": "machine-draft", "translation_revision": translated["translation_revision"],
                     "machine_review": translated.get("machine_review"),
                     "flags": flags, "provenance": result["provenance"], "usage": result["usage"]})
    release = {"schema_version": VERSION, "book_id": job["book_id"], "kind": job["kind"],
               "job_hash": job["job_hash"], "source_file_sha256": job["source_file_sha256"],
               "edition_metadata": manifest["metadata_markdown"], "complete": not missing,
               "requested": len(job["requests"]), "translated": len(rows), "missing": missing,
               "review_status": "machine-draft", "passages": rows}
    write(path / "export" / "bilingual.json", release)
    esc = html.escape
    cards = []
    for r in rows:
        cards.append(f'<article><h2>{esc(r["id"])}</h2><p>Printed label {esc(r["page_label"])}; page block {r["page_sequence"]}. Machine draft; unreviewed.</p><div class="pair"><p lang="ar" dir="rtl">{esc(r["arabic"])}</p><p lang="en">{esc(r["english"])}</p></div><p>Review flags: {esc(", ".join(r["flags"]) or "none automatically detected; not an accuracy guarantee")}</p><p>{esc("; ".join(r["uncertainties"]))}</p></article>')
    missing_cards = []
    for request in job["requests"]:
        if request["id"] not in missing:
            continue
        u = request.get("source_unit") or units[request["id"]]
        missing_cards.append(f'<article><h2>{esc(u["id"])}</h2><p>Awaiting translation. Candidates: {esc(", ".join(request["features"]))}</p><p lang="ar" dir="rtl">{esc(u["arabic"])}</p></article>')
    doc = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Tārīkh translation review</title><style>body{max-width:1100px;margin:2rem auto;padding:0 1rem;font:18px/1.7 Georgia,serif;color:#222;background:#faf8f2}h1{line-height:1.2}h2{font:16px/1.5 monospace;overflow-wrap:anywhere}article{border-top:1px solid #999;padding:1rem 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:2rem}p{white-space:pre-wrap;overflow-wrap:anywhere}[lang=ar]{font:24px/2 serif}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Tārīkh translation review</h1>'
    doc += f'<p>{len(rows)} / {len(job["requests"])} translated passages. All translations remain machine drafts without human scholarly review. {len(revisions)} pages have a recorded Codex source-comparison pass. This is a local review artifact.</p>' + "".join(cards + missing_cards) + '</html>'
    (path / "export" / "review.html").write_text(doc, encoding="utf-8")
    english = ["# " + manifest["metadata_markdown"].splitlines()[0].lstrip("# "),
               "", "Machine translation without human scholarly review. Source page labels and sequence IDs are retained.",
               f"Job: {args.job}. Scope: {job['kind']}. Completed passages: {len(rows)}/{len(job['requests'])}.",
               f"Pages with a recorded Codex source-comparison pass: {len(revisions)}.", ""]
    for row in rows:
        english.extend([f"## Page {row['page_label']} (source block {row['page_sequence']})", "",
                        f"<!-- {row['id']} -->", "", row["english"], ""])
        if row["uncertainties"]:
            english.extend(["Translation uncertainties:", ""] + ["- " + note for note in row["uncertainties"]] + [""])
    (path / "export" / "english.md").write_text("\n".join(english), encoding="utf-8")
    with (path / "export" / "review-queue.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "source_page_label", "source_page_sequence", "review_status", "flags", "uncertainties"])
        for row in rows:
            writer.writerow([row["id"], row["page_label"], row["page_sequence"], "machine-draft",
                             "; ".join(row["flags"]), "; ".join(row["uncertainties"])])
    print(f"{path / 'export'}: {len(rows)} drafts; {len(missing)} awaiting translation")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--workspace", required=True, help="Local persistent workspace, outside public/")
    sub = p.add_subparsers(dest="command", required=True)
    prep = sub.add_parser("prepare")
    prep.add_argument("--source-dir", required=True)
    prep.add_argument("--config", default=str(HERE / "config.json"))
    sub.add_parser("audit")
    for name in ["pilot", "full"]:
        job = sub.add_parser(name)
        job.add_argument("--book", required=True)
        job.add_argument("--job", required=True)
        job.add_argument("--count", type=int, default=25)
        job.add_argument("--max-source-tokens", type=int, default=500, help="Pilot only: prefer a complete paragraph within this budget")
        job.add_argument("--unit-id", action="append", help="Select specific prepared units instead of automatic sampling")
        job.add_argument("--glossary", default=str(HERE / "glossary.json"))
        job.add_argument("--prompt", default=str(HERE / "prompt.txt"))
    imp = sub.add_parser("import")
    imp.add_argument("--job", required=True)
    imp.add_argument("--file", required=True)
    imp.add_argument("--model", required=True)
    imp.add_argument("--provider", required=True)
    fork = sub.add_parser("fork")
    fork.add_argument("--from-job", required=True)
    fork.add_argument("--job", required=True)
    runner = sub.add_parser("run")
    runner.add_argument("--job", required=True)
    runner.add_argument("--model")
    runner.add_argument("--base-url")
    runner.add_argument("--key-env", default="TARIKH_API_KEY")
    runner.add_argument("--dry-run", action="store_true")
    runner.add_argument("--limit", type=int, default=25)
    runner.add_argument("--max-input-tokens", type=int, default=100000)
    runner.add_argument("--max-output-tokens", type=int, default=3500)
    runner.add_argument("--input-rate", type=float, help="USD per million input tokens")
    runner.add_argument("--output-rate", type=float, help="USD per million output tokens")
    runner.add_argument("--max-cost", type=float)
    runner.add_argument("--timeout", type=int, default=180)
    ex = sub.add_parser("export")
    ex.add_argument("--job", required=True)
    args = p.parse_args()
    for field in ["book", "job", "from_job"]:
        value = getattr(args, field, None)
        if value is not None and not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", value):
            p.error(f"--{field.replace('_', '-')} must be a simple identifier, not a path")
    if Path(args.workspace).resolve().is_relative_to(HERE.parents[1] / "public"):
        p.error("Workspace must stay outside public/; exports are not automatically published")
    if args.command == "run" and (args.limit < 1 or args.max_output_tokens < 1 or args.max_input_tokens < 1 or args.timeout < 1 or any(v is not None and (not math.isfinite(v) or v < 0) for v in [args.input_rate, args.output_rate, args.max_cost])):
        p.error("Limits must be positive; rates and costs nonnegative")
    try:
        {"prepare": prepare, "audit": audit, "pilot": make_job, "full": make_job, "fork": fork_job, "run": run, "import": ingest, "export": export}[args.command](args)
    except (ValueError, OSError, KeyError, TypeError, json.JSONDecodeError) as error:
        print(f"Stopped: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
