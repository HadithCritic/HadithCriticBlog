# Component usage guide for authors

Reference for which `src/components/article/*` component fits which content pattern. All of these are used directly inside `.mdx` articles.

## When to use which component

| Content pattern | Component | Notes |
|---|---|---|
| Quranic citation, one or more verses | `<QuranVerse verse="2:255, 24:13" />` | Comma-separated refs or `a:b-c` ranges. Renders each translation as its own paragraph. |
| Hadith report with Arabic + translation | `<HadithBlock>` | See existing articles for the `hadith-block__arabic` / `hadith-block__translation` inner markup. |
| Scholarly claim or thesis statement | `<ClaimBox title="...">` | |
| Contextual/historical background aside | `<ContextNote>` | |
| Final verdict or conclusion | `<VerdictBox title="...">` | |
| Source-comparison table (multiple variants, families, references) | `<SourceComparisonTable>` | Uses a named `header` slot for `<th>` and the default slot for `<tr>`/`<td>` rows -- **not** raw Markdown pipe tables. See any of the 20+ existing articles using it for the exact markup shape. |
| Isnād chain diagram | `<IsnadDiagram nodes={...} edges={...} tiers={...} />` (from `src/components/IsnadDiagram.astro`) | Types `DiagramNode`/`DiagramEdge`/`DiagramTier`/`DiagramAnnotation` are exported from that file. |
| Preset isnād bundle diagram (bukhari:1) | `<IsnadBundle>` (from `src/components/IsnadBundle.astro`) | |
| Single-transmitter bottleneck fanning into matn variants | `<VariantTree title="..." root="Prophet" bottleneck="..." branches={[{ name, from, quote, sources }]} />` | Use instead of hand-rolled `<div>` trees -- those ship with no shared styling. |
| Inline or block Arabic script | `<Arabic>عِكْرِمَة</Arabic>` or `<Arabic inline={false}>...</Arabic>` | Equivalent to `<span lang="ar" dir="rtl">`, which already gets RTL/font styling automatically inside `.hc-article-body`. Use the component for content that may render outside that scope. |
| Biblical citation | `<BibleVerse>` | Rare; used where an article compares Quranic/hadith and Biblical material. |
| General quotation (non-hadith, non-Quran) | `<QuoteBlock>` | |
| Philosophical/logical dilemma diagram | `<IsnadDilemmaVisual>` | Rare, bespoke visual argument mapping. |
| Bibliography / reference list | `<Bibliography entries={[{ author, title, details, year }]} />` | |
| Thematic section break with optional heading | `<SectionDivider title="..." subtitle="..." />` | Use instead of a bare `##` heading or `---` when the break is thematic rather than a new subsection. |

Components that render page chrome (`ArticleHero`, `ArticleMetaBar`, `ArticleTOC`, `PreviousNext`, `RelatedPosts`, `ArticleLayout`, `ArticleProse`) are wired up by `src/pages/blogs/[...id].astro` automatically -- articles never import these directly.

## Footnote rules

1. Use `[^1]`, `[^2]` -- never escaped `\[^1\]`. `npm run lint:footnotes` fails the build if an escaped footnote slips in.
2. Place footnote definitions (`[^1]: ...`) at the article's end.
3. Full bibliographic citation on first use; short form afterward.

## Arabic text rules

1. Wrap Arabic script in `<Arabic>` or `<span lang="ar" dir="rtl">`. Anything with `lang="ar"` inside `.hc-article-body` gets the right font/RTL/line-height automatically -- no extra CSS needed.
2. Use diacritics (tashkīl) in Quranic and hadith citations where the source has them.

## Table rules

1. For source-comparison tables, always use `<SourceComparisonTable>` -- raw Markdown pipe tables (`| a | b |`) only work correctly with GFM enabled (`remark-gfm`, wired into both the `mdx()` integration and the shared `markdown` config in `astro.config.mjs`); prefer the component regardless, for consistent styling and a horizontal-scroll wrapper on narrow viewports.
2. Keep header rows concise.
3. Use `---:` in a Markdown delimiter row for right-aligned numeric columns if you do write a raw table outside `<SourceComparisonTable>`.
4. Use `—` (em dash) for empty cells, not a blank string.

## Category values

`category` in frontmatter is a strict enum (`src/content.config.ts`) matching exactly one of:

- `Origins & Early History`
- `Transmission & Narrators`
- `Theology & Epistemology`
- `Prophecies & Eschatology`

Any other string fails the content schema at build time.
