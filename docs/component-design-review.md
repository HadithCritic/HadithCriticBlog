# Blog component design review

This review records the direction applied to the local article-style preview. The component system should read as one scholarly publication: a clear editorial hierarchy, restrained archive colors, calm evidence panels, and consistent source labels. The active article route already supplies the shared header, reading controls, contents navigation, related studies, mobile contents sheet, footnotes, and return navigation.

## Shared article shell

| Component | Design review and upgrade direction |
| --- | --- |
| `EditorialHeader` | Standardize a left-aligned category, prominent title, readable standfirst, ruled metadata, plain-text topics, and a 16:9 cover. Keep all header elements on the prose edge and ensure metadata wraps cleanly on phones. |
| `EditorialReader` | Reduce the layered “desk” effect and make the reading sheet feel like the page's primary surface. Keep reading controls quiet, predictable, and aligned to the same measure. |
| `EditorialToc` | Updated for the preview: typographic navigation on a single rule, with a clear gold active state and compact labels. |
| `OtherStudies` | Updated for the preview: related titles now form a compact, ruled list without nested cards or competing borders. |
| `PreviousNext` | Use stable text labels and clear destination titles. Keep both directions balanced and easy to tap. |
| `MobileArticleTOC` | Replace symbol-only controls with explicit labels; retain accessible touch targets and give the outline sheet calmer spacing and clearer states. |
| `FootnoteSheet` | Keep citation text readable at mobile size, make close and jump actions explicit, and preserve the anchor back to the full note. |
| `EditorialRightRuler` | Legacy visual aid with no current article-route call site. Reassess whether the ornamental ruler improves orientation enough to justify its visual weight before reintroducing it. |
| `ArticleLayout` | Legacy alternate shell with no current article-route call site. Consolidate or retire after confirming no external imports; do not use it alongside the current route shell. |
| `ArticleTOC` | Legacy contents implementation with no current call site. Keep one contents pattern so desktop and mobile do not drift. |
| `ArticleHero` | Legacy alternate hero with no current article-route call site. It is kept out of the sample to avoid duplicating the canonical `EditorialHeader`; consolidate or retire it after confirming there are no external imports. |

## Evidence and citation components

| Component | Design review and upgrade direction |
| --- | --- |
| `Arabic` | Preserve correct RTL shaping and inline flow. Increase block Arabic line-height only where needed; never let an inline run disrupt Latin paragraph alignment. |
| `HadithBlock` | Keep report type, translation, and source in a predictable order. Replace ornamental badges with restrained labels and make the share action text-based and accurately named. |
| `QuranVerse` | Preserve Arabic typography, verse markers, translation, and reference hierarchy. Use the shared article scale and an explicit share label. |
| `BibleVerse` | Match the Qur’an and hadith citation card's spacing and source hierarchy while preserving the distinct source label. |
| `QuoteBlock` | Distinguish quotations with type scale, spacing, and a simple rule; keep attribution close to the quoted text. |
| `Bibliography` | Align heading and entries to the prose edge, increase citation legibility, and use a consistent hanging-indent treatment for long references. |
| `ClaimBox` | Make the thesis legible through one restrained accent and clear label. Avoid inner glow, multiple borders, and a shadow competing with the prose. |
| `ContextNote` | Make collapsible state explicit in text, preserve keyboard disclosure behavior, and keep context visually secondary to the argument. |
| `VerdictBox` | Give the conclusion a clear label and stable source of emphasis; avoid a stronger effect than the article's actual evidence panels. |
| `SourceComparisonTable` | Updated for the preview: flat, compact comparison table with row rhythm, semantic row headings, subdued labels, and horizontal overflow on narrow screens. |
| `VariantTree` | Updated for the preview: a ruled transmission path and compact branch list replace the stacked diagram cards; narrow layouts preserve the reading order. |
| `IsnadDiagram` | Preserve only connectors that encode transmission relationships. Improve label collision handling, zoom/touch instructions, and small-screen legibility. |
| `IsnadBundle` | Align its preset data visualization with the shared diagram treatment and give the caption enough space to explain what is schematic. |
| `IsnadDilemmaVisual` | Updated for the preview: paired evidence examples use a shared typographic hierarchy and simple count rows, with a single gold rule and theme-aware text. Copy remains illustrative and fixed. |
| `XEmbed` | Keep attribution, date, and excerpt readable without relying on platform widgets or decorative brand glow. Treat the X mark only as source identification. |
| `YouTubeEmbed` | Updated for the preview: a restrained thumbnail and compact source details replace the large framed player; the privacy-enhanced embed loads only on request. |
| `QuranTalkEmbed_v2` | Preserve source identity and link attribution while reducing layered effects to match the other external citation cards. |
| `RelatedPosts` | Component exists but is not the route's current related-study renderer. Reconcile its data shape and appearance with `OtherStudies` before using both. |

## Site-wide components appearing around articles

| Component | Design review and upgrade direction |
| --- | --- |
| `SiteHeader` | Keep the publication mark and navigation compact, align active/focus states, and make search and theme actions accessible and visually quiet. |
| `SiteFooter` | Use consistent link grouping, clear subscription hierarchy, and plain copyright and return labels. Avoid decorative separators competing with the navigation. |
| `SearchDialog` | Keep the results list scannable, use clear text for keyboard guidance, and reduce nested surfaces and decoration. |
| `SubscribeForm` | Use the publication name consistently, keep the promise concise, and make input, submit, loading, and success/error states consistent. |
| `Emblem` and `GeometricEmblem` | Treat these as the brand mark, not reusable decoration. Keep proportions, color, and clear space consistent; do not add them to article callouts or buttons. |
| `MotionRuntime` | Preserve only motion that helps orientation or feedback; honor reduced-motion preferences and avoid perpetual ornamental movement. |
| `EditionNav` | Make chapter names and current position the hierarchy, with descriptive destination labels instead of decorative numbering symbols. |
| `EditionBreadcrumb` | Keep the hierarchy compact, left aligned, and readable at narrow widths. |
| `ScholarLedger` | Prioritize searchable names, readable evidence summaries, and transparent filters; reduce the dense data-table feel on phones. |
| `ManuscriptLightbox` | Give the source image most of the space, label close and open-image actions with words, and keep attribution visible. |
| `BackToTop` | Use one concise text label and a consistent placement and focus state. |

The shared controls follow the same label, spacing, and theme rules. Search suggestions should remain plain and scannable; subscription identity should use the publication name; top/back/close actions should use words. Service logos remain only where they identify the source.

## Design tokens and enforcement

The accompanying `DESIGN.md` is the design contract. It now specifies 17–19px body text, 1.78 line-height, a 66ch prose measure with room to 72ch for evidence, no first-line paragraph indents, approximately 1.1em paragraph spacing, left-aligned headings, and a consistent cover treatment. Visible interface controls use words; ornamental Unicode glyphs, emoji, icon-only controls, and “Copy” labels are disallowed. Diagram connectors remain only where they encode evidence relationships.

The temporary local style-preview article was removed after review at the user's request. The redesigned shared components and this review remain in the working tree; nothing has been committed or published.
