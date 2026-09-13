#!/usr/bin/env python3
"""Chunk the SQLite database into fixed-size files for sql.js-httpvfs range access."""

import os
import sys
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "dist-db" / "silsilah.db"
CHUNKS_DIR = ROOT / "dist-db" / "chunks"

# 10 MiB chunk size (10 * 1024 * 1024 bytes)
CHUNK_SIZE = 10 * 1024 * 1024
REQUEST_CHUNK_SIZE = 4096  # SQLite page size

def main():
    if not DB_PATH.exists():
        print(f"Error: Database file not found: {DB_PATH}")
        sys.exit(1)

    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Remove any existing chunks
    for existing in CHUNKS_DIR.glob("silsilah.chunk.*"):
        existing.unlink()

    total_bytes = DB_PATH.stat().st_size
    num_chunks = math.ceil(total_bytes / CHUNK_SIZE)
    suffix_len = max(3, len(str(num_chunks - 1)))

    print("=" * 60)
    print("  CHUNKING SQLITE DATABASE FOR HTTP RANGE ACCESS")
    print(f"  Source: {DB_PATH} ({round(total_bytes / (1024*1024), 2)} MB)")
    print(f"  Chunk size: {CHUNK_SIZE} bytes ({round(CHUNK_SIZE / (1024*1024), 2)} MB)")
    print(f"  Total chunks to generate: {num_chunks}")
    print(f"  Suffix length: {suffix_len}")
    print("=" * 60)

    with open(DB_PATH, "rb") as src:
        chunk_idx = 0
        while True:
            data = src.read(CHUNK_SIZE)
            if not data:
                break
            suffix = str(chunk_idx).zfill(suffix_len)
            chunk_file = CHUNKS_DIR / f"silsilah.chunk.{suffix}"
            with open(chunk_file, "wb") as dst:
                dst.write(data)
            chunk_idx += 1
            if chunk_idx % 20 == 0 or chunk_idx == num_chunks:
                print(f"  Generated {chunk_idx}/{num_chunks} chunks ({round((chunk_idx/num_chunks)*100, 1)}%)...")

    # Generate config manifest JSON
    config = {
        "serverMode": "chunked",
        "requestChunkSize": REQUEST_CHUNK_SIZE,
        "databaseLengthBytes": total_bytes,
        "serverChunkSize": CHUNK_SIZE,
        "urlPrefix": "/data/chunks/silsilah.chunk.",
        "suffixLength": suffix_len
    }

    config_path = ROOT / "dist-db" / "hadith-config.json"
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

    print(f"\nManifest written to: {config_path}")
    print(json.dumps(config, indent=2))
    print(f"\nChunking complete: {chunk_idx} files in {CHUNKS_DIR}")

if __name__ == "__main__":
    main()
