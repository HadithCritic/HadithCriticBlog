#!/usr/bin/env python3
"""Run corpus verification checks against local SQLite database."""

import sqlite3
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DB_PATH = Path(__file__).resolve().parent.parent / "dist-db" / "silsilah.db"
if not DB_PATH.exists():
    print(f"Error: {DB_PATH} does not exist.")
    sys.exit(1)

conn = sqlite3.connect(str(DB_PATH))
cur = conn.cursor()

EXPECTED = {
    "hadith": 276347,
    "hadith_book": 33,
    "hadith_narrator": 1624087,
    "hadith_chain": 2249581,
    "hadith_subject": 1348820,
    "hadith_gloss": 244508,
    "narrator_alias": 110712,
    "narrator": 20950,
    "criticism_statement": 165795,
}

print("=" * 60)
print(f"  CORPUS VERIFICATION: {DB_PATH.name} ({round(DB_PATH.stat().st_size / (1024*1024), 2)} MB)")
print("=" * 60)

failures = 0
checks = 0

def check(label, actual, expected):
    global checks, failures
    checks += 1
    ok = (actual == expected)
    if not ok:
        failures += 1
    status = "PASS" if ok else "FAIL"
    exp_str = f" (expected {expected:,})" if not ok else ""
    print(f"  {status}  {label}: {actual:,}{exp_str}")
    return ok

print("\n[1] Table Row Counts:")
for table, exp in EXPECTED.items():
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    actual = cur.fetchone()[0]
    check(table, actual, exp)

print("\n[2] Stored Totals vs Rows:")
cur.execute("SELECT COALESCE(SUM(hadith_count), 0) FROM hadith_book")
summed_books = cur.fetchone()[0]
check("SUM(hadith_book.hadith_count)", summed_books, EXPECTED["hadith"])

cur.execute("""
    SELECT COUNT(*) FROM hadith_book WHERE hadith_count <> (
        SELECT COUNT(*) FROM hadith WHERE hadith.book_id = hadith_book.id
    )
""")
disagreeing = cur.fetchone()[0]
check("Collections with a wrong count", disagreeing, 0)

print("\n[3] FTS5 Virtual Tables:")
cur.execute("SELECT COUNT(*) FROM hadith_fts")
fts_hadith = cur.fetchone()[0]
check("hadith_fts rows", fts_hadith, EXPECTED["hadith"])

cur.execute("SELECT COUNT(*) FROM narrator_fts")
fts_narrator = cur.fetchone()[0]
check("narrator_fts rows", fts_narrator, 20915)

# Test FTS query
cur.execute("SELECT rowid, ar_text FROM hadith_fts WHERE hadith_fts MATCH 'عايشه' LIMIT 1")
row = cur.fetchone()
print(f"  FTS test query 'عايشه': matched rowid {row[0] if row else 'NONE'}")

print("\n[4] Derived Stats:")
cur.execute("SELECT COUNT(*) FROM corpus_stat")
n_stats = cur.fetchone()[0]
check("corpus_stat entries", n_stats, 5)

cur.execute("SELECT COUNT(*) FROM narrator_facet")
n_facets = cur.fetchone()[0]
print(f"  narrator_facet entries: {n_facets}")

cur.execute("SELECT COUNT(*) FROM narrator_top_hadith")
n_top = cur.fetchone()[0]
print(f"  narrator_top_hadith entries: {n_top}")

conn.close()

print("\n" + "=" * 60)
if failures == 0:
    print(f"  ALL {checks} VERIFICATION CHECKS PASSED!")
else:
    print(f"  FAILED: {failures} / {checks} checks failed.")
print("=" * 60)

if failures > 0:
    sys.exit(1)
