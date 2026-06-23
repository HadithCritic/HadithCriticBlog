# -*- coding: utf-8 -*-
"""Build the local Silsilah SQLite DB (D1-compatible) with FTS5 from website_corpus.
Mirrors lib/silsilah-text.ts normalizeArabic exactly so index == client query normalization."""
import json, glob, os, re, io, sys, sqlite3, time, unicodedata
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
CORPUS = r"C:\Users\Jonathan\Desktop\tsv\website_corpus"
DB = r"C:\Users\Jonathan\Desktop\HadithCriticBlog\scripts\silsilah.db"

# --- exact port of normalizeArabic from src/lib/silsilah-text.ts ---
# marks/harakat/superscript-alef/Quranic-signs/tatweel ONLY (preserve letters U+0621-064A);
# matches the diacritic set used by buildHighlightRegex in src/lib/silsilah-text.ts
_DIAC = re.compile('[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]')
_DIAC2 = re.compile('[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]')
_DIAC3 = re.compile('[' + ''.join(chr(a)+'-'+chr(b) for a,b in
    [(0x0610,0x061A),(0x064B,0x065F),(0x0670,0x0670),(0x06D6,0x06DC),(0x06DF,0x06E8),(0x06EA,0x06ED),(0x0640,0x0640)]) + ']')
def norm_ar(s):
    if not s: return ''
    s = _DIAC3.sub('', s)
    s = re.sub('[أإآٱ]', 'ا', s)
    s = s.replace('ى','ي').replace('ئ','ي').replace('ؤ','و').replace('ة','ه')
    return s
def slugify(s):
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    for ch in 'ʿʾʼʻʹ‘’`': s = s.replace(ch,'')
    s = re.sub(r'[^A-Za-z0-9]+','-', s).strip('-').lower()
    return s or 'x'

if os.path.exists(DB): os.remove(DB)
con = sqlite3.connect(DB); cur = con.cursor()
# FTS5 availability check
try:
    cur.execute("CREATE VIRTUAL TABLE _fts_check USING fts5(x)"); cur.execute("DROP TABLE _fts_check")
except sqlite3.OperationalError as e:
    print("FATAL: this Python's sqlite3 lacks FTS5:", e); sys.exit(1)
cur.executescript("""
PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;
CREATE TABLE collections(
  slug TEXT PRIMARY KEY, collection_id INTEGER, name_en TEXT, name_ar TEXT,
  author_en TEXT, author_death INTEGER, work_group TEXT, is_primary INTEGER,
  hadith_count INTEGER, book_count INTEGER, ordinal INTEGER);
CREATE TABLE books(
  collection_slug TEXT, slug TEXT, ordinal INTEGER, title_en TEXT, title_ar TEXT,
  count INTEGER, PRIMARY KEY(collection_slug, slug));
CREATE TABLE hadith(
  id INTEGER PRIMARY KEY, collection_slug TEXT, book_slug TEXT, ref TEXT, number TEXT, seq INTEGER,
  kitab TEXT, kitab_en TEXT, bab TEXT, bab_en TEXT, chapter_path TEXT, chapter_path_en TEXT,
  chain TEXT, chain_en TEXT, matn TEXT, matn_en TEXT, text TEXT, text_en TEXT, ar_norm TEXT,
  work_group TEXT, recension TEXT, is_primary_recension INTEGER, author_en TEXT, author_death INTEGER,
  collection_en TEXT, volume TEXT, printed_page TEXT, narrator_ids TEXT);
""")
# slug map per collection_id (dedupe collisions by appending id)
coll_slug = {}; used = set()
def coll_slug_for(cid, name_en):
    if cid in coll_slug: return coll_slug[cid]
    base = slugify((name_en or '').split(' - ')[0]); s = base
    if s in used: s = f"{base}-{cid}"
    used.add(s); coll_slug[cid] = s; return s

rid = 0; t0 = time.time()
coll_agg = {}  # cid -> dict
book_agg = {}  # (cslug, bslug) -> dict
rows = []
for p in sorted(glob.glob(os.path.join(CORPUS, "*.json"))):
    if os.path.basename(p) == "_manifest.json": continue
    data = json.load(open(p, encoding='utf-8'))
    if not data: continue
    cid = data[0].get('collection_id'); cslug = coll_slug_for(cid, data[0].get('collection_en'))
    for r in data:
        rid += 1
        kit = r.get('kitab') or ''; kit_en = r.get('kitab_en') or ''
        bslug = slugify(kit_en or kit) if (kit_en or kit) else 'main'
        txt = r.get('text') or ''
        rows.append((rid, cslug, bslug, r.get('ref'), r.get('number'), r.get('seq'),
            kit, kit_en, r.get('bab'), r.get('bab_en'),
            json.dumps(r.get('chapter_path'), ensure_ascii=False) if r.get('chapter_path') else None,
            json.dumps(r.get('chapter_path_en'), ensure_ascii=False) if r.get('chapter_path_en') else None,
            r.get('chain'), r.get('chain_en'), r.get('matn'), r.get('matn_en'), txt, r.get('text_en'),
            norm_ar(txt), r.get('work_group'), r.get('recension'),
            1 if r.get('is_primary_recension') else 0, r.get('author_en'), r.get('author_death'),
            r.get('collection_en'), str(r.get('volume') or ''), str(r.get('printed_page') or ''),
            json.dumps(r.get('narrator_ids') or [])))
        c = coll_agg.setdefault(cid, {"slug":cslug,"cid":cid,"name_en":(r.get('collection_en') or '').split(' - ')[0],
            "author_en":r.get('author_en'),"death":r.get('author_death'),"wg":r.get('work_group'),
            "prim":1 if r.get('is_primary_recension') else 0,"n":0,"books":set()})
        c["n"]+=1; c["books"].add(bslug)
        b = book_agg.setdefault((cslug,bslug), {"cslug":cslug,"bslug":bslug,"title_en":kit_en or None,
            "title_ar":kit or None,"n":0,"ord":r.get('seq') or 0})
        b["n"]+=1
        if len(rows) >= 5000:
            cur.executemany("INSERT INTO hadith VALUES (%s)" % ",".join("?"*28), rows); rows=[]
if rows: cur.executemany("INSERT INTO hadith VALUES (%s)" % ",".join("?"*28), rows)
con.commit()
print(f"inserted {rid:,} hadith in {time.time()-t0:.0f}s")
# collections + books
for i,(cid,c) in enumerate(sorted(coll_agg.items(), key=lambda kv:(kv[1]['death'] or 0)),1):
    cur.execute("INSERT INTO collections VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (c["slug"],cid,c["name_en"],None,c["author_en"],c["death"],c["wg"],c["prim"],c["n"],len(c["books"]),i))
for (cslug,bslug),b in book_agg.items():
    cur.execute("INSERT INTO books VALUES (?,?,?,?,?,?)",(cslug,bslug,b["ord"],b["title_en"],b["title_ar"],b["n"]))
con.commit()
# indexes + FTS
print("building indexes + FTS5 ...")
cur.executescript("""
CREATE INDEX idx_browse ON hadith(collection_slug, book_slug, seq);
CREATE INDEX idx_ref ON hadith(collection_slug, number);
CREATE UNIQUE INDEX idx_refuniq ON hadith(ref);
CREATE VIRTUAL TABLE hadith_fts USING fts5(text_en, ar_norm, content='hadith', content_rowid='id',
  tokenize='unicode61 remove_diacritics 2');
INSERT INTO hadith_fts(rowid, text_en, ar_norm) SELECT id, text_en, ar_norm FROM hadith;
INSERT INTO hadith_fts(hadith_fts) VALUES('optimize');
""")
con.commit(); cur.close()
try:
    con.isolation_level = None; con.execute("VACUUM"); con.isolation_level = ''
except Exception as e:
    print("(vacuum skipped:", e, ")")
cur = con.cursor()
size = os.path.getsize(DB)/1024/1024
nh = cur.execute("SELECT COUNT(*) FROM hadith").fetchone()[0]
nc = cur.execute("SELECT COUNT(*) FROM collections").fetchone()[0]
nb = cur.execute("SELECT COUNT(*) FROM books").fetchone()[0]
print(f"DONE: {nh:,} hadith, {nc} collections, {nb:,} books; db={size:.0f} MB")
con.close()
