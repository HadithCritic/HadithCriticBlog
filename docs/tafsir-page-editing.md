# Editing Tafsir verse pages

For now, only al-Ṭabarī's seven al-Fātiḥa reader pages are authored directly as
HTML. Their files follow this pattern:

```text
src/data/tafsir-pages/<work>/<surah padded to 3 digits>/<verse padded to 3 digits>.html
```

For example, al-Ṭabarī on al-Fātiḥa 1:7 is
`src/data/tafsir-pages/tabari/001/007.html`.

Each file contains the complete Tafsir reader for that verse: its introduction,
reader controls, verse panel, commentary, notes, edition information and
previous/next navigation. The global site header, footer, document metadata and
shared styles remain in Astro. The page HTML is inserted as authored, so edits
to these files appear directly in the built page without running a content
generator.

Keep the outer `.hc-page.tfx.tfr` element and its `data-reader` attribute; the
reader controls use them. Keep IDs used by in-page links and note references
consistent when editing headings or notes. Qur'anic and note links are ordinary
HTML anchors and can be changed directly in the file.

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
