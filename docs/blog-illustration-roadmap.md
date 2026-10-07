# Blog illustration migration

The `/blogs/` page now uses an illustrated editorial journal: a dark engraved hero, real category navigation, a featured newest article, a two-column illustrated selection, a desktop search sidebar, and the earlier archive in a native disclosure. The existing site navigation, article URLs, article source wording, category hubs, lazy full-text index, and passage jump links are retained.

## First release

The latest ten published articles at implementation time are 81 through 72. Artwork assignments live in `src/data/blog-artwork.ts`, separate from article frontmatter. The ten article images are 1536 × 1024 WebP assets; the archival hero is 2172 × 724. These are editorial illustrations and visual metaphors, not source evidence or literal reconstructions. Art uses cream parchment and sepia engraving; the hero uses gold engraving on charcoal. Page typography reuses the site's Source Serif 4 editorial face and Glacial Indifference apparatus face.

The page selects 720px article derivatives or full-resolution artwork using responsive `srcset`; sidebar previews use 160px crops. The hero also has a 1086px derivative. Cards below the fold load lazily. Keep these derivatives with each future manifest entry.

| Article | Visual brief |
| --- | --- |
| 81, People of the Canyon | Hinnom's rocky valley, ancient Jerusalem, stars and a small empty terrace fire; no invented atrocity scene |
| 80, The Kharijite and the Beast | Three parchments sharing a seal, a separate counter-report, and an unharmed sheep |
| 79, Wisdom of Solomon | Empty judgment seat, wisdom codex, olive branch and late antique Judean landscape |
| 78, Scroll and Sword | Straight early Islamic sword, scabbard document and independent parchment fragments |
| 77, Hammered Shields | Early Central Asian frontier riders and round hammered shield |
| 76, Plural of Participation | Convergent light through apertures, a conceptual metaphor for mediation |
| 75, Family of Amram | Aaronic garment, twelve-stone breastplate, temple lampstand and scroll |
| 74, Verification | Joseph's torn linen shirt as physical evidence under lamplight |
| 73, Green Arabia | Human irrigation, date cultivation and translation sheets |
| 72, Baghdad Prophecy | Early Basran river settlement and cords meeting at a single ring |

## Remaining archive roadmap

1. Inventory the remaining articles by exact article ID, date, category, thesis, historical setting, and existing artwork. Read each article before defining its visual brief.
2. Migrate in batches of ten, alternating landscape, material object, transmission metaphor, and historically grounded scenes. Avoid generic scholars or manuscripts unless the subject requires them.
3. Generate using the saved prompt system in `docs/blog-artwork-prompts.json`. Check period-specific architecture, garments, weapons, religious artifacts, and the distinction between a conceptual illustration and evidence. Add text separately in HTML rather than generating citations or Arabic inscriptions.
4. Add optimized WebP assets and manifest assignments. Preserve article frontmatter and original social thumbnails until a separate article-header/social-card migration is requested.
5. Expand the illustrated selection deliberately as coverage grows. Keep older entries readable in the archive and searchable regardless of artwork availability. Verify category counts, passage matches, links, both themes, and 320–1920px layouts for each batch.

No popularity rankings are invented: the sidebar lists recent articles using publication dates.
