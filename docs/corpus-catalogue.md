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
Six original copperplate-style scenes in `public/images/hadith/collections/`
give each foundational collection its own illustration. The Bukhari scene is
the parchment feature plate; the remaining five scenes appear on dark cards.
Each master WebP has an 800px derivative for responsive loading. The scenes are
conceptual architecture, not depictions of specific historical sites or
manuscript evidence. No invented per-collection chain-link counts or decorative
scholarly quotation from the concept is added.

The shared `SiteFooter.astro` consumes `site-footer.css`. Smaller type, tighter
spacing, and a shallow panorama replace the former oversized footer. All directory
links, social channels and the existing signup contract remain. Research
principles move into a native disclosure with their exact wording. Directory
groups become native disclosures and close by default on phones with JavaScript;
without JavaScript all groups remain open and usable.

## Foundational collection illustrations

The asymmetric feature presents Sahih al-Bukhari as a parchment plate beside a
chronological rail; the other five featured collections sit in dark illustrated
cards. Artwork contains no text, so titles, Arabic names, dates, narration
counts and links remain live data from the page. The visual scenes are
decorative interpretations, not reproductions of historical sites, editions or
manuscripts, and make no claims about the collections' contents or authority.

