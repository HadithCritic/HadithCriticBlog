# Corpus discovery and compact footer, 2026-10-11

The corpus index uses the supplied visual concept: a manuscript library masthead,
parchment search desk, a register of the actual corpus totals, six illustrated
collection links, and a compact three-column catalogue beside local filters.
The search module still queries the versioned SQLite release in the browser.
Catalogue filtering, sorting, and view switching operate only on static markup.
All collection titles, IDs, slugs, Arabic and narration counts remain unchanged.

## Chronology

The default order is ascending compiler death year, not collection size. Dates
and bibliographic classifications were checked against the 33-book bibliography
at [HadithWeb's books index](https://hadith.dev/books) on 2026-10-11. The corpus's
[source catalogue](https://sunna.alifta.gov.sa/Book/IndexMatnBooks) identifies the
same works. `src/lib/collection-catalogue.ts` keeps this display metadata separate
from the generated corpus metadata. Bibliography counts differ slightly from
this immutable release and are deliberately not imported.

Mālik (179 AH) opens the archive; Ibn Ḥajar (852 AH) closes it. Works by the same
compiler stay together. A compiler's death is a chronological reference, not
an asserted date of composition, final redaction, or manuscript attestation;
the index explicitly labels this distinction. Period filters use that same
compiler chronology. The six featured works follow chronological order too.

## Imagery and footer

The existing library illustration from `docs/compilation-artwork-prompts.json`
is reused in the masthead. It is a decorative scene, not manuscript evidence.
No invented per-collection chain-link counts or decorative scholarly quotation
from the concept is added.

The shared `SiteFooter.astro` consumes `site-footer.css`. Smaller type, tighter
spacing, and a shallow panorama replace the former oversized footer. All directory
links, social channels and the existing signup contract remain. Research
principles move into a native disclosure with their exact wording. Directory
groups become native disclosures and close by default on phones with JavaScript;
without JavaScript all groups remain open and usable.

## Foundational compilation bindings

The six foundational collection cards use hand-drawn SVG ornament in
`src/components/CompilationCover.astro`. These are decorative, personalized
bindings inspired by the supplied printed covers, not reproductions of an
edition or evidence of a historical manuscript. Palmettes, lobes, almond
medallions, geometric tooling, rosettes and arches distinguish the works.
Fixed site palette tokens supply the foil, inlay and dark grounds in both
themes. Titles and narration counts remain unchanged; the text field stays
clear of the patterned inlay. No generated raster images are used for these
six bindings.

