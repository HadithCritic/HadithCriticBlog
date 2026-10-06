# Component usage guide for authors

Reference for which article component fits which content pattern. All of
these are imported directly inside `.mdx` articles from
`src/components/article/<group>/`. How each one looks, and why, is in
`DESIGN.md`, "Article reader".

## When to use which component

| Content pattern | Component (import path under `components/article/`) | Notes |
|---|---|---|
| Quranic citation, one or more verses | `<QuranVerse verse="2:255, 24:13" />` (`sources/QuranVerse.astro`) | Comma-separated refs or `a:b-c` ranges. Text comes from `src/data/quran-verses.json`; `label` overrides the citation line. |
| Hadith report with Arabic + translation | `<HadithBlock label="…" source="…" arabic={`…`} translation={`…`} />` (`sources/HadithBlock.astro`) | `title` is accepted as a synonym for `label`. Arabic and translation may instead go inside the tag as `<div class="hadith-block__arabic">` / `<div class="hadith-block__translation">`. |
| Biblical citation | `<BibleVerse reference="Exodus 24:12">…</BibleVerse>` (`sources/BibleVerse.astro`) | |
| Thesis the article argues | `<ClaimBox title="…">` (`text/ClaimBox.astro`) | One per article, near the top. |
| Conclusion it reaches | `<VerdictBox title="…" status="…">` (`text/VerdictBox.astro`) | The one shaded field; keep it for the actual conclusion. |
| Background the argument leans on | `<ContextNote title="…" collapsible>` (`text/ContextNote.astro`) | `collapsible` starts it closed. |
| General quotation (non-scripture) | `<QuoteBlock author="…" source="…" sourceUrl="…">` (`text/QuoteBlock.astro`) | A plain Markdown `>` is fine for a short unattributed passage. |
| Inline Arabic in a Latin sentence | `<Arabic>عِكْرِمَة</Arabic>` (`text/Arabic.astro`) | Equivalent to `<span lang="ar" dir="rtl">`. |
| Thematic part break with a title | `<SectionDivider title="…" subtitle="…" />` (`text/SectionDivider.astro`) | The title is a real `h2` and appears in the contents. |
| Source-comparison table | `<SourceComparisonTable caption="…" stickyFirstCol>` (`sources/SourceComparisonTable.astro`) | Named `header` slot for `<th>`, default slot for `<tr>` rows. Markdown pipe tables get the identical setting. |
| Bibliography / reference list | `<Bibliography entries={[{ author, title, details, year }]} />` (`sources/Bibliography.astro`) | Or a Markdown list under `## Bibliography`, which is set the same way. |
| Video | `<YouTubeEmbed url="…" title="…" channel="…" />` (`media/YouTubeEmbed.astro`) | |
| QuranTalk essay | `<QuranTalk url="…" title="…" date="…" />` (`media/QuranTalk.astro`) | Formerly `QuranTalkEmbed_v2`. |
| Post on X | `<XEmbed url="…" author="…" text="…" />` (`media/XEmbed.astro`) | Static; no third-party script. |
| Isnād chain diagram | `<IsnadDiagram nodes={…} edges={…} tiers={…} />` (`figures/IsnadDiagram.astro`) | Types are exported from that file. |
| One bottleneck fanning into matn variants | `<VariantTree title="…" root="…" bottleneck="…" branches={[…]} />` (`figures/VariantTree.astro`) | |
| Logical dilemma diagram | `<IsnadDilemmaVisual>` (`figures/IsnadDilemmaVisual.astro`) | Rare, bespoke. |

The page chrome (header, contents, end matter, footnote previews) lives in
`shell/` and is wired up by `src/pages/blogs/[...id].astro`; articles never
import it.

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
