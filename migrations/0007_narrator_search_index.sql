-- Full-text search over the narrator register.
--
-- The register searched with `search_text LIKE '%q%'`, which no index can
-- serve: every keystroke-driven query scanned all 20,915 named narrators,
-- 24,171 rows read, and it was the most expensive thing left on the site.
--
-- It was also missing matches. `search_text` carries the Arabic name as
-- written, unfolded, so a reader who typed عايشه — the orthographic variant
-- that the corpus index deliberately folds together with عائشة — got **zero**
-- narrators, while عائشة got sixty. The register could not find people the
-- corpus could. Indexing the folded form fixes the recall gap and the cost in
-- the same stroke.
--
-- Contentless and single-column. Contentless because `search_text` is already
-- a derived blob on `narrator` and storing a third copy would be waste; single
-- column because the register orders by whatever the reader chose — id, name,
-- death year, hadith count — and never by relevance, so there is no bm25 to
-- weight and nothing to gain from splitting fields.
--
-- What `search_text` already contains, per narrator: the transliterated name
-- both with and without its diacritics ("ʿāʾishah bint abī bakr al-ṣiddīq"
-- and "aishah bint abi bakr al-siddiq"), the Arabic name, the full nasab, the
-- kunya, the places, the generation and grade labels, and "#<id>". All of it
-- stays searchable — this changes how it is matched, not what is matched
-- against.
--
-- The one deliberate behaviour change: `LIKE '%q%'` matched inside words, so
-- "mali" found "somali". Tokens are matched as prefixes instead, so "mali"
-- finds "malik" and "maliki" but not "somali". For names that is the
-- expectation, and it is what makes an index usable at all.
--
-- rowid is `narrator.id`. Only `unnamed = 0` is indexed, because every query
-- the register runs begins with that clause.
--
-- Derived, never authored: rebuilt by scripts/refresh-stats.mjs and asserted
-- by scripts/verify-corpus.mjs.

DROP TABLE IF EXISTS narrator_fts;

CREATE VIRTUAL TABLE narrator_fts USING fts5(
  text,
  content='',
  tokenize='unicode61 remove_diacritics 2'
);
