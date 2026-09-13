import sqlite3
import time
import glob
from pathlib import Path

t0 = time.time()
db_path = "dist-db/test.db"
Path("dist-db").mkdir(exist_ok=True)
if Path(db_path).exists():
    Path(db_path).unlink()

conn = sqlite3.connect(db_path)
conn.execute("PRAGMA journal_mode = OFF;")
conn.execute("PRAGMA synchronous = OFF;")
conn.execute("PRAGMA cache_size = -1000000;")

# Load schema
with open("migrations/0002_create_narrators.sql", "r", encoding="utf-8") as f:
    conn.executescript(f.read())
with open("migrations/0003_create_hadith.sql", "r", encoding="utf-8") as f:
    conn.executescript(f.read())
with open("migrations/0004_hadith_search_index.sql", "r", encoding="utf-8") as f:
    conn.executescript(f.read())

print("Schema created in", round(time.time() - t0, 2), "s")

# Test hadith_book
t1 = time.time()
with open("scripts/d1seed-hadith/01_book_001.sql", "r", encoding="utf-8") as f:
    conn.executescript(f.read())
count = conn.execute("SELECT COUNT(*) FROM hadith_book").fetchone()[0]
print(f"hadith_book loaded: {count} rows in {round(time.time() - t1, 3)}s")

# Test 1 hadith file
t2 = time.time()
with open("scripts/d1seed-hadith/02_hadith_001.sql", "r", encoding="utf-8") as f:
    conn.executescript(f.read())
count = conn.execute("SELECT COUNT(*) FROM hadith").fetchone()[0]
print(f"hadith file 1 loaded: {count} rows in {round(time.time() - t2, 2)}s")

conn.close()
Path(db_path).unlink()
