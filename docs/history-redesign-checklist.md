# History redesign checklist

Objective: the complete autonomous History (Tārīkh) redesign in the attached
`goal-objective.md`, on `drafts`. The objective is not reduced to an artwork swap.

## Audit and implementation

- [x] Confirm the active branch is `drafts` and inventory existing changes.
- [x] Inspect the current route, source data, shared components and theme tokens.
- [x] Inspect the supplied concept and historical-painting reference.
- [x] Verify real source availability against the existing source inventory.
- [x] Identify reusable artwork and document the visual shortcomings.
- [x] Select an editorial archive structure within the locked HadithCritic system.
- [x] Create a distinct panoramic introduction and improve hero typography.
- [x] Implement substantial horizontal source cards with unique paintings.
- [x] Preserve every source title, author, description, availability and note.
- [x] Refine the planned-capabilities section and closing research principles.
- [x] Preserve shared navigation, footer, routes and unrelated working changes.
- [x] Optimize and document artwork, provenance, dimensions and responsive crops.
- [x] Render desktop, tablet and mobile; inspect and refine the first pass.
- [x] Verify keyboard access, native disclosure behavior and no-JavaScript use.
- [x] Verify contrast, image loading and overflow at all required widths.
- [x] Pass `npm run check`, `npm run test:design`, and `npm run build`.
- [x] Audit every objective requirement against current files and runtime evidence.

## Before

The previous work was progress: the route, three source records and illustrations
existed and had passed checks. It does not prove the new redesign objective.
The current artwork is relegated to small thumbnails; status forms a detached
third column; the masthead is an enlarged crop of a source image with a heavy
signature box; capability and principle sections have weak hierarchy. The
al-Ṭabarī painting has a generic, mountainous Sasanian-style setting rather than
the requested Abbasid urban world. All three paintings share similar warm
lighting and foreground observers.

## Direction

Reading this as a scholarly editorial archive for historical-source researchers.
The locked charcoal/parchment/gold palette, Cormorant, Source Serif, IBM Plex
and Naskh typography remain authoritative. Design variance 5, motion 2, density
4. This is an in-place single-page redesign, not a rebuild of shared chrome.

Structure: panoramic opening, factual scope register, framed source catalog,
planned reading prospectus, provenance statement, existing HadithCritic footer.
Navigation and footer reuse the site's existing components. The introduction
stays a dark plate in both themes, consistent with the site's other public
project introductions; a future long-form reader may follow the reader theme.

Khalīfa's existing panorama is suitable for reuse. Generate a separate river-
landscape hero, a flatter and populated Abbasid river-city scene for al-Ṭabarī,
and a conquest-era town scene with restrained late-antique architecture for
al-Balādhurī. Historical paintings are interpretive, not event documentation.

## Completion evidence

Final audit, 15 October 2026, branch `drafts`:

| Objective | Implementation and verification |
| --- | --- |
| Investigate and preserve the existing project | Read repository guidance and brand system; inspected real source records, inventory, existing assets and both supplied references. Baseline hashes preserve unrelated tracked changes, including shared navigation and footer. |
| Distinct, grounded historical illustrations | Original river-landscape hero; retained Khalīfa campaign panorama; new Abbasid river-city painting for al-Ṭabarī; new late-antique conquest-town painting for al-Balādhurī. Provenance, source context, dimensions and interpretive limits recorded in `history-artwork.md`. |
| Redesign the complete page | Bespoke panoramic opening, factual scope register, three substantial editorial source cards, planned reading tools, provenance closing and existing shared footer. `history.astro`, `HistorySourceCard.astro` and `history.css` implement the composition using existing fonts and tokens. |
| Preserve content and actual availability | The three records' titles, Arabic, authors, descriptions, forms, statuses, notes and references match the baseline exactly. All 86 article hashes match the unchanged studio manifest. No reader, dataset or translation availability was invented. |
| Responsive, accessible engineering | Astro, no additional dependencies or page JavaScript. Responsive WebP variants, intrinsic dimensions, lazy source images and prioritized hero. Native links and disclosures work without JavaScript; descriptive alt text, Arabic language/direction and keyboard access verified. |
| Render, evaluate and refine | First renders at 1440, 768 and 375 pixels were inspected; hero spacing, text measure, mobile reserve, contribution label and disclosure states were refined. Final production renders at seven widths were checked, with desktop, tablet and mobile screenshots visually reviewed from introduction through closing/footer. |
| Complete validation | Required type/design/build checks pass, plus footnote lint, five production Playwright cases and contrast checks in both themes at 320, 768 and 1440 pixels. No page errors, horizontal overflow, clipped content or image resizing on disclosure expansion at the seven tested widths. |

Validation evidence in ignored `scratch/`:

- `history-goal-check.log`: `npm run check`, 340 files, zero errors/warnings; 13 existing hints.
- `history-goal-design.log`: `npm run test:design`, 295 files passed; existing article warnings remain.
- `history-goal-footnotes.log`: `npm run lint:footnotes` passed.
- `history-goal-build.log`: `npm run build` completed, including Pagefind. A temporary process-only Node memory limit was used; build configuration was unchanged.
- `history-goal-prod-tests.log`: five tests passed against the production build. Widths: 320, 375, 414, 768, 1024, 1440 and 1920, in both themes.
- `history-goal-prod-contrast{,-320,-768}.log`: zero rendered contrast failures, both themes, disclosures open.
- `history-goal-render-metrics.json` and `history-goal-review/final-*.png`: final production measurements and visual review evidence.
- `history-goal-baseline.json`, `history-goal-source-records.json` and `history-goal-preservation.json`: unrelated-work, source-content and research-preservation evidence.

The complete redesigned introductory archive is implemented. Full-text reading,
maps, timelines and parallel comparison remain explicitly planned, consistent
with the project's real source availability. The paintings evoke historical
settings; they are not documentary reconstructions of particular events.
No Lighthouse score or exhaustive assistive-technology certification is claimed.

## Review and refinement

The first implementation was rendered at 1440, 768 and 375 pixels. The hero
was too tall on desktop and its lead had an unnecessarily narrow measure.
The second pass reduced hero padding, widened the lead and shortened the mobile
painting reserve. The contribution link was shortened for narrow screens.
Open disclosures now have an explicit visual state, and their contents expand
below the jacket rather than stretching the image.

Initial browser tests passed all five cases, including seven widths in each
theme, native keyboard disclosures without JavaScript, image loading and
project navigation. The first contrast run with disclosures open found zero
failures in either theme. Production-build verification follows below.

## Second pass: orientation and status in the open (15 October 2026)

The first pass gave the page its artwork and structure, but three cards of the
same shape read as a brochure, the facts a reader needed were behind a
disclosure, and nothing said when the three works were written.

- The scope register under the hero is now a chronology: the three authors by
  death date (`died` in `src/data/history.ts`) on a hijrī axis, each linking to
  its record. The grid's column widths are the gaps between dates, so markers
  sit at true positions without absolute layout. It becomes a vertical list
  below 780px. Sources are now listed in that order (Khalīfa, al-Balādhurī,
  al-Ṭabarī).
- Each record shows "Where it stands" openly: availability, the full note and
  the reference, with "Full text not yet published" as a dotted-border state.
  The `<details>` disclosure is gone; the text it hid was the most useful on
  the card. No wording in the records changed.
- Cards alternate the painting's side on wide screens and carry a numeral.
- Paintings open in a native `<dialog>` viewer; without script they remain the
  plain link to the full image. Focus returns to the painting on close.
- Planned tools are a numbered row in a `hc-band--soft` band; the principles
  close with the shared `hc-closing` parchment leaf, as on /projects.
- Breakpoints moved from 1099/767/374 to the DESIGN.md table (1024, 900, 780,
  640, 480).

Verified on the dev server: `tests/history.spec.ts` (7 cases, including the
chronology, the viewer and the no-JS record), zero contrast failures in both
themes, `npm run check` and `npm run test:design`.
