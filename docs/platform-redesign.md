# Homepage and research platform redesign

## Reference review

Reviewed the ten PNG concepts in `C:/Users/Jonathan/Desktop/hcb`, collectively:
engraved scholarly landscapes and archival scenes, dark foundations, antique-gold
linework, small ornamental transitions, editorial hierarchy and integrated art.
The implementation borrows that shared language rather than inventing concept
metrics, authenticity evaluations or placeholder research content.

## Implementation

- Homepage: restrained Poppins hero; integrated newest-study illustration;
  category discovery rail; filtered study ledger; existing video catalogue;
  six illustrated project entrances; correspondence closing panel.
- Hadith: full-width search desk and three-column numbered collection catalogue.
- Rijal: desktop filter desk beside the searchable biographical ledger; stacked
  controls on smaller screens. Attributed verdict labels remain unchanged.
- Qiraat: ten reader dossiers and compact bilingual 114-sura register, preserving
  coverage, profiles and comparison navigation.
- Tafsir: calm bilingual folio index, preserving 114 suras and coverage status.
- Atlas: catalogue with a source-connected reading panel and existing URL state.
- ICMA: family navigation and searchable study slips with common link and dating
  visible; family colors confined to swatches and fine identification rules.

Shared components: `src/components/ResearchHero.astro`,
`src/styles/research-platform.css`, `src/styles/home-platform.css`.
The site header and research data are preserved. Corpus access remains the
existing browser-query system; no database/query changes were required.

## Artwork

Seven distinct original gold-on-charcoal engravings, 2172 x 724 WebP with 1086px
responsive derivatives: river bridge (homepage); seal impressions and cords
(corpus); travellers through successive arches (Rijal); ten parallel arched
channels (Qiraat); illuminated stone niche (Tafsir); armillary sphere and
connections (Atlas); converging loom threads (ICMA). These represent each
workflow conceptually. They are not historical source evidence. Exact generation
prompts are in `platform-artwork-prompts.json`.

## Verification

Reviewed all seven pages in both themes across nine viewport widths from 320 to
1920px: 126 cases with no horizontal overflow or missing hero images. Screenshots
and measurements are saved in `output/platform/`. Desktop and mobile contrast
checks cover all seven roots in both themes.

Functional checks cover homepage category filtering and video activation,
ICMA family/search URL state, Tafsir navigation, Atlas catalogue/focus state,
corpus search/filter/history/pagination, narrator search/dossiers/comparison,
and Qiraat profiles, long suras, quoted sources and no-script reader focus.
One existing corpus-record assertion remains incompatible with the current data:
record 237072 does not have the expected `Kitab 1`/`[1/217]` edition metadata.
The test expects `.edition-source-path`, while the record renders the release's
actual metadata including 'No printed page marker recorded'. This redesign does
not alter record rendering or corpus data, so that expectation was not rewritten.

Final gates passed: `npm run check` (zero errors, warnings or hints),
`npm run test:design` (existing archive warnings only), and `npm run build`.
The built preview also passed all 11 homepage/Atlas/ICMA/Tafsir/profile interaction
checks. All seven root routes returned HTTP 200 with decoded hero artwork.
Across the functional suites, 43 distinct checks passed; the one corpus metadata
expectation described above remains unresolved and unrelated to the UI changes.

## Homepage refinement

Kept the established hero, typography, imagery, project presentation and footer.
Recovered the old category mapping from the previous homepage source and existing
shared tokens. Moved the category previews beneath the horizontal feature and
refined the latest five entries into compact colored journal rows. Excerpts are
visually shortened with line clamping; article content/data remain untouched.

At 1672px, the feature reduced from 661px to approximately 250px; the complete
archive preview reduced by about 36%. The CTA-to-footer gap reduced from 120px
to 24px by removing duplicated footer margin on the homepage, not through a
negative offset. Before/after screenshots and measured geometry are saved in
`output/home-refinement/`. Reviewed the whole page with its lazy-loaded artwork.
Both themes pass desktop/phone contrast checks; 18 responsive cases have no
horizontal overflow. Tests cover category colors as previews change, filter/reset
behavior, compact feature height, CTA/footer spacing and video activation.
The final production build passed, along with all four homepage interaction
checks against the built preview. Final desktop measurements: 1408px archive
preview (previously 2200px), 250px feature (previously 661px), and 24px CTA/footer
spacing (previously 120px). Source check and design audit passed.
