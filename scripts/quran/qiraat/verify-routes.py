#!/usr/bin/env python3
"""Verify the hand-read route items (routes/routes-*.json) and write routes-*.checked.json.

An item is a passage of one book about one Taḥbīr position, with entries saying which narrator below the twenty
transmitters reports what a transmitter (or qāriʾ) reads. This script checks that

- the evidence is an exact substring of the cited pages, and unique from its start snippet;
- every narrator and form snippet is inside the evidence;
- `under` is a known qāriʾ or transmitter, and `kind` is one of reads, reports, disputed;
- the position exists, and the reading number `value_of`, when given, is one of its readings.

    python scripts/quran/qiraat/verify-routes.py
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import qiraat_lib as lib  # noqa: E402


def load(name: str, file: str):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


vfi = load("vfi", "verify-farsh-items.py")
KINDS = {"reads", "reports", "disputed"}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    authorities = json.loads((lib.QIRAAT_DIR / "authorities.json").read_text(encoding="utf-8"))
    known = vfi.known_readers(authorities)
    features: dict[str, dict] = {}
    for path in (lib.REPO / "src" / "data" / "qiraat").glob("sura-[0-9][0-9][0-9].json"):
        for f in json.loads(path.read_text(encoding="utf-8"))["features"]:
            features[f["id"]] = f
    streams: dict[str, lib.Stream] = {}
    errors, total = [], 0
    for path in sorted((lib.QIRAAT_DIR / "routes").glob("routes-*.json")):
        if path.name.endswith(".checked.json"):
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        out_items = []
        for item in data["items"]:
            iid = item["id"]
            book = item["book_id"]
            if book not in streams:
                streams[book] = lib.Stream(lib.load_book(book))
            stream = streams[book]
            # The page a passage was found on can be the one before or after the page its record started on.
            page = item["page"]
            tries = [(page, item.get("page_end"))]
            if page.isdigit():
                tries += [(page, str(int(page) + 1)), (str(int(page) - 1), page), (str(int(page) + 1), None)]
            found = None
            for first, last in tries:
                window = {"book_id": book, "page": first, "volume": item.get("volume")}
                if last:
                    window["page_end"] = last
                try:
                    text, _ = vfi.window_text(stream, window)
                    begin, end = vfi.cut(item["ev"], text, unique=True)
                    found = (first, last)
                    break
                except (KeyError, ValueError) as error:
                    last_error = error
            if found is None:
                errors.append(f"{iid}: evidence: {last_error.args[0]}")
                continue
            item = {**item, "page": found[0], **({"page_end": found[1]} if found[1] else {})}
            evidence = text[begin:end]
            feature = features.get(item["feature"])
            if feature is None:
                errors.append(f"{iid}: unknown position {item['feature']}")
                continue
            values = {g["value"] for g in feature["groups"] if g["kind"] == "reading"}
            entries = []
            for n, entry in enumerate(item["entries"], start=1):
                tag = f"{iid} entry {n}"
                spans = {}
                for key in ("narrator", "form"):
                    try:
                        a, b = vfi.cut(entry[key], evidence)
                        spans[key] = evidence[a:b]
                    except ValueError as error:
                        errors.append(f"{tag}: {key}: {error.args[0]}")
                if entry["under"] not in known:
                    errors.append(f"{tag}: unknown reader {entry['under']}")
                if entry.get("kind", "reads") not in KINDS:
                    errors.append(f"{tag}: kind must be one of {sorted(KINDS)}")
                if entry.get("value_of") and f"v{entry['value_of']}" not in values:
                    errors.append(f"{tag}: reading v{entry['value_of']} is not a reading of {item['feature']}")
                if len(spans) == 2:
                    entries.append({**entry, "narrator": spans["narrator"], "form": spans["form"]})
            out_items.append({**item, "evidence": evidence, "entries": entries, "lemma": feature.get("lemma")})
            total += len(entries)
        path.with_suffix(".checked.json").write_text(
            json.dumps({"schema": "qiraat-routes/0.1", "items": out_items}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    for line in errors:
        print("error:", line)
    print(f"route entries {total}  errors {len(errors)}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
