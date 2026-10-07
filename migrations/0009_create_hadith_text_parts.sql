-- Each narration's Arabic, split into the parts the export flattened together.
-- Offsets are UTF-16 code units into hadith.text_ar, which is never changed:
--   text_ar[0, lead_end)              the edition's headings and front matter
--   text_ar[lead_end, notes_start)    the narration, with the compiler's remarks
--   text_ar[notes_start, end)         the editor's notes comparing printings
-- page_start and page_end are the printed "volume/page" the narration begins
-- and ends on, from the edition's page markers. flags lists anything the
-- split left for review. Written by scripts/split-hadith-text.py.
CREATE TABLE IF NOT EXISTS hadith_text_parts (
  hadith_id INTEGER PRIMARY KEY REFERENCES hadith(id),
  lead_end INTEGER NOT NULL,
  notes_start INTEGER NOT NULL,
  page_start TEXT,
  page_end TEXT,
  flags TEXT
);
