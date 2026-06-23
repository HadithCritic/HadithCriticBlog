# -*- coding: utf-8 -*-
"""Generate D1 seed SQL from the validated local silsilah.db.
Byte-budgeted, OR-IGNORE (resumable) INSERTs; FTS built+populated separately; no BEGIN/COMMIT."""
import sqlite3, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
DB = r"C:\Users\Jonathan\Desktop\HadithCriticBlog\scripts\silsilah.db"
OUT = r"C:\Users\Jonathan\Desktop\HadithCriticBlog\scripts\d1seed"
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT): os.remove(os.path.join(OUT, f))
con = sqlite3.connect(DB); con.row_factory = sqlite3.Row; cur = con.cursor()
STMT_BUDGET = 40*1024        # under D1's ~100KB per-statement cap
FILE_BUDGET = 45*1024*1024
MAX_ROW = 70*1024            # rows whose serialized value exceeds this are excluded + logged (D1 stmt cap)

def sqlval(v):
    if v is None: return "NULL"
    if isinstance(v, int): return str(v)
    if isinstance(v, float): return repr(v)
    return "'" + str(v).replace("'", "''") + "'"

schema = """CREATE TABLE IF NOT EXISTS collections(
  slug TEXT PRIMARY KEY, collection_id INTEGER, name_en TEXT, name_ar TEXT,
  author_en TEXT, author_death INTEGER, work_group TEXT, is_primary INTEGER,
  hadith_count INTEGER, book_count INTEGER, ordinal INTEGER);
CREATE TABLE IF NOT EXISTS books(
  collection_slug TEXT, slug TEXT, ordinal INTEGER, title_en TEXT, title_ar TEXT,
  count INTEGER, PRIMARY KEY(collection_slug, slug));
CREATE TABLE IF NOT EXISTS hadith(
  id INTEGER PRIMARY KEY, collection_slug TEXT, book_slug TEXT, ref TEXT, number TEXT, seq INTEGER,
  kitab TEXT, kitab_en TEXT, bab TEXT, bab_en TEXT, chapter_path TEXT, chapter_path_en TEXT,
  chain TEXT, chain_en TEXT, matn TEXT, matn_en TEXT, text TEXT, text_en TEXT, ar_norm TEXT,
  work_group TEXT, recension TEXT, is_primary_recension INTEGER, author_en TEXT, author_death INTEGER,
  collection_en TEXT, volume TEXT, printed_page TEXT, narrator_ids TEXT);
"""
open(os.path.join(OUT, "00_schema.sql"), "w", encoding="utf-8").write(schema)

def emit_table(table, fh_path, file_budget=None, max_row=None):
    """Write byte-budgeted INSERT OR IGNORE statements; optionally split into ~45MB files.
    Rows whose serialized value exceeds max_row are skipped and returned for separate handling."""
    cols = [c[1] for c in cur.execute(f"PRAGMA table_info({table})")]
    collist = "(" + ",".join(cols) + ")"
    prefix = f"INSERT OR IGNORE INTO {table} {collist} VALUES\n"
    fidx = 0; n = 0; skipped = []
    def newfh(i): return open(fh_path(i), "w", encoding="utf-8")
    fh = newfh(fidx); fsize = 0; stmt = []; sb = 0
    def flush():
        nonlocal stmt, sb, fsize
        if stmt:
            s = prefix + ",\n".join(stmt) + ";\n"; fh.write(s); fsize += len(s.encode("utf-8")); stmt=[]; sb=0
    for r in cur.execute(f"SELECT * FROM {table} ORDER BY rowid"):
        v = "(" + ",".join(sqlval(r[c]) for c in cols) + ")"; vb = len(v.encode("utf-8"))
        if max_row and vb > max_row:
            skipped.append({k: r[k] for k in cols}); continue
        if stmt and sb+vb > STMT_BUDGET: flush()
        stmt.append(v); sb += vb; n += 1
        if file_budget and fsize > file_budget and not stmt:
            fh.close(); fidx += 1; fh = newfh(fidx); fsize = 0
        elif file_budget and fsize > file_budget:
            flush(); fh.close(); fidx += 1; fh = newfh(fidx); fsize = 0
    flush(); fh.close()
    return n, fidx+1, skipped

nc,_,_ = emit_table("collections", lambda i: os.path.join(OUT, "05_collections.sql"))
nb,_,_ = emit_table("books",       lambda i: os.path.join(OUT, "06_books.sql"))
nh,ndf,skipped = emit_table("hadith", lambda i: os.path.join(OUT, f"10_data_{i:03d}.sql"), FILE_BUDGET, MAX_ROW)
import json as _json
_json.dump(skipped, open(os.path.join(OUT, "..", "oversized_excluded.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"excluded {len(skipped)} oversized rows -> oversized_excluded.json (refs: {[s['ref'] for s in skipped]})")

# FTS create + chunked populate + optimize; indexes last
maxid = cur.execute("SELECT MAX(id) FROM hadith").fetchone()[0]; CHUNK = 20000
open(os.path.join(OUT,"20_fts.sql"),"w",encoding="utf-8").write(
  "CREATE VIRTUAL TABLE IF NOT EXISTS hadith_fts USING fts5(text_en, ar_norm, content='hadith', "
  "content_rowid='id', tokenize='unicode61 remove_diacritics 2');\n")
with open(os.path.join(OUT,"21_fts_fill.sql"),"w",encoding="utf-8") as fh:
    lo=1
    while lo<=maxid:
        fh.write(f"INSERT INTO hadith_fts(rowid,text_en,ar_norm) SELECT id,text_en,ar_norm FROM hadith WHERE id>={lo} AND id<{lo+CHUNK};\n")
        lo+=CHUNK
open(os.path.join(OUT,"22_fts_opt.sql"),"w",encoding="utf-8").write("INSERT INTO hadith_fts(hadith_fts) VALUES('optimize');\n")
open(os.path.join(OUT,"30_indexes.sql"),"w",encoding="utf-8").write(
  "CREATE INDEX IF NOT EXISTS idx_browse ON hadith(collection_slug, book_slug, seq);\n"
  "CREATE INDEX IF NOT EXISTS idx_ref ON hadith(collection_slug, number);\n"
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_refuniq ON hadith(ref);\n")
con.close()
files = sorted(os.listdir(OUT)); tot = sum(os.path.getsize(os.path.join(OUT,f)) for f in files)/1024/1024
print(f"collections={nc} books={nb} hadith={nh:,}  data_files={ndf}  total={tot:.0f} MB  files={len(files)}")
