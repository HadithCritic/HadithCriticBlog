#!/usr/bin/env python3
"""Build a clean, optimized read-only SQLite database snapshot of the corpus.

Loads all seed files from scripts/d1seed/ and scripts/d1seed-hadith/,
builds FTS5 indexes and derived tables, and optimizes the database.
"""

import os
import sys
import glob
import time
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST_DB = ROOT / "dist-db"
DIST_DB.mkdir(exist_ok=True)
DB_PATH = DIST_DB / "silsilah.db"

def main():
    if DB_PATH.exists():
        print(f"Removing existing {DB_PATH}...")
        DB_PATH.unlink()

    print(f"Creating fresh SQLite database: {DB_PATH}")
    start_total = time.time()
    
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    
    # Configure speed pragmas for bulk load
    cur.execute("PRAGMA journal_mode = OFF;")
    cur.execute("PRAGMA synchronous = OFF;")
    cur.execute("PRAGMA page_size = 4096;")
    cur.execute("PRAGMA cache_size = -1000000;")  # ~1GB cache
    cur.execute("PRAGMA temp_store = MEMORY;")

    print("\n[1/5] Applying base schemas...")
    schema_files = [
        "migrations/0002_create_narrators.sql",
        "migrations/0003_create_hadith.sql",
        "migrations/0004_hadith_search_index.sql",
        "migrations/0005_derived_stats.sql",
        "migrations/0006_narrator_top_hadith.sql",
        "migrations/0007_narrator_search_index.sql",
    ]
    for sf in schema_files:
        path = ROOT / sf
        print(f"  Schema: {sf}")
        with open(path, "r", encoding="utf-8") as f:
            cur.executescript(f.read())

    print("\n[2/5] Loading narrator dataset (scripts/d1seed/)...")
    t0 = time.time()
    narrator_files = sorted(glob.glob(str(ROOT / "scripts" / "d1seed" / "*.sql")))
    print(f"  Found {len(narrator_files)} narrator files to load.")
    for i, nf in enumerate(narrator_files, 1):
        if i % 25 == 0 or i == len(narrator_files):
            print(f"    Loaded {i}/{len(narrator_files)} files ({round(time.time() - t0, 1)}s)...")
        with open(nf, "r", encoding="utf-8") as f:
            cur.executescript(f.read())
    print(f"  Narrator dataset loaded in {round(time.time() - t0, 2)}s.")

    print("\n[3/5] Loading hadith dataset & search index (scripts/d1seed-hadith/)...")
    t0 = time.time()
    hadith_files = sorted(glob.glob(str(ROOT / "scripts" / "d1seed-hadith" / "*.sql")))
    print(f"  Found {len(hadith_files)} hadith files to load.")
    for i, hf in enumerate(hadith_files, 1):
        if i % 50 == 0 or i == len(hadith_files):
            print(f"    Loaded {i}/{len(hadith_files)} files ({round(time.time() - t0, 1)}s)...")
        with open(hf, "r", encoding="utf-8") as f:
            cur.executescript(f.read())
    print(f"  Hadith dataset loaded in {round(time.time() - t0, 2)}s.")

    print("\n[4/5] Populating derived tables & search index...")
    t0 = time.time()
    
    # 1. Populating corpus_stat
    print("  Populating corpus_stat...")
    stats = {
        "hadith_narrations": "SELECT COALESCE(SUM(hadith_count), 0) FROM hadith_book",
        "hadith_collections": "SELECT COUNT(*) FROM hadith_book",
        "narrator_named": "SELECT COUNT(*) FROM narrator WHERE unnamed = 0",
        "narrator_graded": "SELECT COUNT(*) FROM narrator WHERE unnamed = 0 AND critic_count > 0",
        "narrator_dated": "SELECT COUNT(*) FROM narrator WHERE unnamed = 0 AND death_hijri IS NOT NULL",
    }
    for k, q in stats.items():
        val = cur.execute(q).fetchone()[0]
        cur.execute("INSERT OR REPLACE INTO corpus_stat (key, value) VALUES (?, ?)", (k, val))

    # 2. Populating narrator_facet
    print("  Populating narrator_facet...")
    facets = {
        "generation": "SELECT generation, COUNT(*) FROM narrator WHERE unnamed = 0 AND generation <> '' GROUP BY generation ORDER BY COUNT(*) DESC",
        "grade": "SELECT grade, COUNT(*) FROM narrator WHERE unnamed = 0 AND grade <> '' GROUP BY grade ORDER BY COUNT(*) DESC",
        "century": "SELECT ((death_hijri - 1) / 100) + 1, COUNT(*) FROM narrator WHERE unnamed = 0 AND death_hijri IS NOT NULL GROUP BY ((death_hijri - 1) / 100) + 1 ORDER BY ((death_hijri - 1) / 100) + 1",
    }
    for kind, q in facets.items():
        rows = cur.execute(q).fetchall()
        for ord_idx, (val, n) in enumerate(rows):
            cur.execute("INSERT INTO narrator_facet (kind, value, n, ord) VALUES (?, ?, ?, ?)", (kind, str(val), n, ord_idx))

    # 3. Populating narrator_top_hadith
    print("  Populating narrator_top_hadith (ranking top 8 paralleled hadiths per transmitter)...")
    cur.execute("""
        INSERT INTO narrator_top_hadith (narrator_id, ord, hadith_id)
        SELECT narrator_id, ord, hadith_id FROM (
          SELECT hn.narrator_id AS narrator_id,
                 hn.hadith_id AS hadith_id,
                 ROW_NUMBER() OVER (
                   PARTITION BY hn.narrator_id
                   ORDER BY h.parallel_count DESC, h.id ASC
                 ) - 1 AS ord
            FROM (SELECT DISTINCT narrator_id, hadith_id FROM hadith_narrator
                   WHERE narrator_id IS NOT NULL) hn
            JOIN hadith h ON h.id = hn.hadith_id
        ) WHERE ord < 8
    """)

    # 4. Populating narrator_fts
    print("  Populating narrator_fts...")
    # Using python to fold arabic identically to arabicFoldSql
    # Or SQL replaces:
    letter_folds = [
        ('آ', 'ا'), ('أ', 'ا'), ('إ', 'ا'), ('ٱ', 'ا'),
        ('ة', 'ه'), ('ى', 'ي'), ('ؤ', 'و'), ('ئ', 'ي'),
        ('ء', ''), ('ـ', '')
    ]
    invisibles = [
        '\u200b', '\u200c', '\u200d', '\u200e', '\u200f',
        '\u202a', '\u202b', '\u202c', '\u202d', '\u202e',
        '\u2060', '\ufeff'
    ]
    
    expr = "COALESCE(search_text, '')"
    for frm, to in letter_folds:
        expr = f"replace({expr}, '{frm}', '{to}')"
    for inv in invisibles:
        expr = f"replace({expr}, char({ord(inv)}), '')"
        
    cur.execute(f"INSERT INTO narrator_fts (rowid, text) SELECT id, {expr} FROM narrator WHERE unnamed = 0")

    # 5. Optimize FTS tables
    print("  Optimizing FTS5 indexes...")
    cur.execute("INSERT INTO hadith_fts(hadith_fts) VALUES ('optimize')")
    cur.execute("INSERT INTO narrator_fts(narrator_fts) VALUES ('optimize')")
    conn.commit()
    print(f"  Derived tables and FTS optimization finished in {round(time.time() - t0, 2)}s.")

    print("\n[5/5] Running final VACUUM and PRAGMA optimize...")
    t0 = time.time()
    cur.execute("PRAGMA optimize;")
    cur.execute("VACUUM;")
    conn.commit()
    conn.close()
    print(f"  Vacuum finished in {round(time.time() - t0, 2)}s.")

    file_size_bytes = DB_PATH.stat().st_size
    file_size_mb = round(file_size_bytes / (1024 * 1024), 2)
    file_size_gb = round(file_size_bytes / (1024 * 1024 * 1024), 2)
    
    print("\n" + "=" * 60)
    print("  DATABASE GENERATION COMPLETE")
    print(f"  Output File: {DB_PATH}")
    print(f"  Size: {file_size_mb} MB ({file_size_gb} GB)")
    print(f"  Total Duration: {round(time.time() - start_total, 1)}s")
    print("=" * 60)

if __name__ == "__main__":
    main()
