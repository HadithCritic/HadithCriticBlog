# Editing Tafsir verse pages

For now, only al-Ṭabarī's seven al-Fātiḥa reader pages are authored directly as
HTML. Their files follow this pattern:

```text
src/data/tafsir-pages/<work>/<surah padded to 3 digits>/<verse padded to 3 digits>.html
```

For example, al-Ṭabarī on al-Fātiḥa 1:7 is
`src/data/tafsir-pages/tabari/001/007.html`.

Each file contains the markup of the Tafsir reader for that verse: the reader's
masthead, introduction, reader controls, verse panel, commentary, notes, edition
information, previous/next navigation and footer. The page HTML is inserted as
authored, so edits to these files appear directly in the built page without
running a content generator. Every verse page is a standalone page (no site
header or footer), like verse 1.

Styles and behaviour are shared, not repeated per file:

- `src/data/tafsir-pages/tabari/reader.css` is the one stylesheet for every
  verse page. The route inlines it just before the page HTML. Do not add a
  `<style>` block to a verse file; put the rule in `reader.css` so all verses
  stay alike.
- `src/lib/tafsir-fatiha-reader.ts` runs the controls (theme, text size,
  citation highlights, notes search, copy verse, section menu). Do not add a
  `<script>` block to a verse file.

All seven files share verse 1's shell. When editing, keep these pieces in the
same form across files:

- the outer `<div class="hc-page tfx tfr" data-reader="" …>` element;
- `header.masthead`, `section.opening`, `div.reader-toolbar`,
  `div.wrap.reader > section.article#commentary`, and `footer.footer`;
- the notes as `details.notes-disclosure#notes > summary + section.notes`;
- previous/next links as `nav.verse-pagination` with `a.next.next--prev`
  (`data-prev`) and `a.next.next--next` (`data-next`), which also give
  left/right arrow-key paging. Use root-relative links (`/projects/…`), not the
  production domain.

Keep IDs used by in-page links and note references consistent when editing
headings or notes. Qur'anic and note links are ordinary HTML anchors and can be
changed directly in the file.

Only `tabari/001/001.html` through `tabari/001/007.html` currently exist and
are published. No other surah has a reader page, route, or browse link until it
has been reviewed and approved. The original per-surah JSON remains in the
research archive, but it is not rendered in the public reader or listed as
available commentary. To publish another surah later, first prepare and review
its complete HTML pages, then add it to the approved release list.

`node scripts/import-tafsir-html-pages.mjs` imports only the seven Fātiḥa pages
from `dist/client/projects/tafsir/tabari/1/` into the editable source tree. It
refuses to replace files that already exist; pass `--overwrite` only when
intentionally replacing those seven HTML files from the current build output.

## The early commentaries: Mujāhid, al-Thawrī, Ibn Wahb

These three works are published in full, one bilingual page per surah. Ibn
Wahb's work is not arranged by surah, so it has one page per chapter heading
within each of the manuscript's three parts. Every page follows the compiler's
units and order: one card per report, in the order the edition prints them.
A report that runs on to the next printed page stays one card, with the page
break marked inside it.

```text
src/data/tafsir-pages/mujahid/<surah>.html     113 surahs (the edition has no Surah 109)
src/data/tafsir-pages/thawri/<surah>.html      49 surahs, the headings the edition prints
src/data/tafsir-pages/ibn-wahb/v<part>-<n>.html 12 chapter pages in 3 parts
src/data/tafsir-pages/<work>/index.json        the parts, counts and jump menus
```

The pages are served at `/projects/tafsir/<work>/<surah or v<part>-<n>>/` by
`src/pages/projects/tafsir/[work]/[part].astro`. Unlike the al-Fātiḥa files,
each HTML file holds only the page body: the verse index and one
`article.tfe-entry` card per report, with the English and the Arabic side by
side. The route supplies the shell (masthead, opening, toolbar, surah
panel, "About the edition", previous/next, footer), so the shell stays the same
on all 174 pages. It inlines the same `tabari/reader.css` and runs the same
reader script, plus `src/lib/tafsir-edition-reader.ts` for the "Show Arabic"
switch. Card styles are in `src/styles/tafsir-edition.css`. The front-page
text and the "About the edition" paragraphs for each work are in
`src/data/tafsir-editions.ts`.

The bodies were generated from the organized tafsir library
(`~/Desktop/tafsir/works/`, built and validated by that folder's
`tools/build_works.py`):

```text
node scripts/build-tafsir-edition-pages.mjs [path/to/tafsir/works] [--overwrite]
```

The generator copies the Arabic and English exactly. It adds only escaping,
paragraph breaks at the source's line breaks, and a highlight on the Qur'anic
wording that the Arabic sets in braces. Verse labels come only from references
the edition prints: the editor's `[السورة: N]` citations in Mujāhid and the
`(الآية N)` markers in al-Thawrī. Ibn Wahb prints none, so it has none. Like
the import script, it refuses to replace existing files unless you pass
`--overwrite`, so hand edits are not lost by accident.
