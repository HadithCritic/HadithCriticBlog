# -*- coding: utf-8 -*-
import sqlite3, re, io, sys, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
DB = r"C:\Users\Jonathan\Desktop\HadithCriticBlog\scripts\silsilah.db"
_DIAC = re.compile('[ؐ-ٰۖ-ۜ۟-ۭ]')
_DIAC3 = re.compile('[' + ''.join(chr(a)+'-'+chr(b) for a,b in
    [(0x0610,0x061A),(0x064B,0x065F),(0x0670,0x0670),(0x06D6,0x06DC),(0x06DF,0x06E8),(0x06EA,0x06ED),(0x0640,0x0640)]) + ']')
def norm_ar(s):
    s = _DIAC3.sub('', s or '')
    s = re.sub('[أإآٱ]','ا', s)
    return s.replace('ى','ي').replace('ئ','ي').replace('ؤ','و').replace('ة','ه')
con = sqlite3.connect(DB); con.row_factory = sqlite3.Row; cur = con.cursor()
print("counts:", dict(
  hadith=cur.execute("SELECT COUNT(*) FROM hadith").fetchone()[0],
  collections=cur.execute("SELECT COUNT(*) FROM collections").fetchone()[0],
  books=cur.execute("SELECT COUNT(*) FROM books").fetchone()[0]))
def fts_quote(q): return '"' + q.replace('"','""') + '"'
def search(label, col, raw, lim=5):
    q = norm_ar(raw) if col=='ar_norm' else raw
    t=time.perf_counter()
    rows=cur.execute(f"""
      SELECT h.ref, h.collection_en, snippet(hadith_fts, {0 if col=='text_en' else 1}, '[', ']', ' … ', 8) AS snip
      FROM hadith_fts JOIN hadith h ON h.id=hadith_fts.rowid
      WHERE hadith_fts MATCH ? ORDER BY rank LIMIT ?""",
      (f'{col} : {fts_quote(q)}', lim)).fetchall()
    ms=(time.perf_counter()-t)*1000
    print(f"\n[{label}] '{raw}' -> {len(rows)} hits in {ms:.1f} ms")
    for r in rows[:3]: print(f"   {r['ref']} | {r['collection_en']} | {r['snip'][:110]}")
# total count for a query (for "X results")
def count(col, raw):
    q = norm_ar(raw) if col=='ar_norm' else raw
    t=time.perf_counter()
    n=cur.execute("SELECT COUNT(*) FROM hadith_fts WHERE hadith_fts MATCH ?", (f'{col} : {fts_quote(q)}',)).fetchone()[0]
    return n, (time.perf_counter()-t)*1000
search("EN", "text_en", "intentions")
search("EN", "text_en", "black banners")
search("AR diacritic-insensitive", "ar_norm", "الاعمال بالنيات")
search("AR bare", "ar_norm", "حراء")
n,ms = count("text_en","prayer"); print(f"\ncount(EN 'prayer') = {n:,} in {ms:.0f} ms")
n,ms = count("ar_norm","الجنه"); print(f"count(AR 'الجنه') = {n:,} in {ms:.0f} ms")
# ref jump
r=cur.execute("SELECT ref,collection_en,number FROM hadith WHERE collection_slug=? AND number=? LIMIT 1",
              ("sahih-al-bukhari","1")).fetchone()
print("\nref-jump sahih-al-bukhari #1:", dict(r) if r else None)
con.close()
