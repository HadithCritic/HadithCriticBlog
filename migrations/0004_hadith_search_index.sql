-- Rebuild the search index so it covers every narration in full.
--
-- Two separate problems forced this, and the second one killed the first fix.
--
-- 1. Statement size. D1 caps SQL *statement text* at 100 KB while allowing a
--    row value up to 2 MB. Those are different limits. The largest narration is
--    62,955 bytes of raw text, which becomes a ~125 KB statement once matn,
--    chapter and quote-escaping are added: illegal as SQL, perfectly legal as
--    data. Shrinking the batch cannot help, because a batch budget decides how
--    many rows share a statement and does nothing when one row exceeds the
--    ceiling alone. Migration 0003 worked around it by trimming the tail off 67
--    narrations, leaving 0.024% of the corpus partly unsearchable.
--
-- 2. Database size. The first version of this migration staged the normalised
--    text in a `hadith_search` table so oversized rows could be assembled with
--    chunked `col = col || '...'` appends. That works, but it stores a second
--    copy of the whole corpus: about 468 MB. The database is already at 1.74 GB
--    against a 2 GB ceiling, and writes are refused with
--    "Exceeded maximum DB size [code: 7500]". There is no room for a second
--    copy, and there never was going to be.
--
-- The fix that satisfies both: fold the Arabic inside the INSERT ... SELECT and
-- read straight from `hadith`. The text never enters the statement text, so the
-- 100 KB ceiling stops applying no matter how long a narration is; and nothing
-- is stored twice, so the rebuild is size neutral rather than +468 MB.
--
-- Why folding in SQL is safe. `normalizeArabic` (src/lib/arabic-normalize.ts)
-- is NFKC, then delete invisibles, then delete diacritics and tatweel, then a
-- nine-character letter map, then punctuation to space. Everything but NFKC is
-- plain character substitution, which `replace()` reproduces exactly, and the
-- tokeniser already handles diacritics (`remove_diacritics 2`) and punctuation
-- (unicode61 splits on it). That leaves NFKC as the only gap. It rewrites 2,073
-- of 812,587 Arabic values in this corpus, so it was measured rather than
-- assumed: compared as tokens, which is what search actually matches on, the
-- SQL fold and the real normaliser agree on 40,000/40,000 sampled narrations
-- and on 2,073/2,073 of the NFKC-affected values. The characters NFKC touches
-- are ones the tokeniser discards anyway.
--
-- Only the Arabic columns are folded. English text is indexed as written, which
-- is what 0003 did too: the tokeniser already discards the markdown emphasis
-- and chunk markers the translator left behind, since neither is alphanumeric.
--
-- Why the index stays contentless rather than external-content: with
-- `content='hadith'`, FTS5 would read that table to build snippets and return
-- *folded* Arabic, عايشه where the reader should see عائشة. The application cuts
-- snippets from the raw text and maps match offsets back through the fold
-- (src/lib/snippet.ts), so a contentless index costs nothing here and stores no
-- duplicate text.
--
-- Apply this, then run scripts/fill-hadith-fts.mjs, which emits and executes
-- the ranged INSERT ... SELECT statements that populate the index.

DROP TABLE IF EXISTS hadith_search;   -- staging table from the abandoned design
DROP TABLE IF EXISTS hadith_fts;

CREATE VIRTUAL TABLE hadith_fts USING fts5(
  ar_text,
  ar_matn,
  en_text,
  en_matn,
  chapter_en,
  content='',
  tokenize='unicode61 remove_diacritics 2'
);
