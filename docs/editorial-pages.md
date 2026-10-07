# Editorial pages

Academia, Projects, Resources, YouTube, and Contact use the blog's visual system:
self-hosted Source Serif 4, charcoal engraved banners, parchment content plates,
antique gold rules, and restrained bronze on paper. The existing site navigation
and footer remain shared through BaseLayout.

`EditorialHero.astro` owns the banner, heading, decorative artwork, and optional
actions. `editorial-pages.css` provides common styling plus page-specific layouts.
`EditorialOverview.astro` is a native, initially closed details disclosure: the
existing statistics, project index, video categories, and correspondence guidance
remain available without pushing the main content below a large desktop sidebar.
The disclosure works without JavaScript.

## Illustration system

Each banner is an original concept illustration, not historical source evidence.
The full assets are 2172 × 724 WebP with 1086 × 362 responsive derivatives.
Exact generation prompts are recorded in `editorial-hero-prompts.json`.

| Page | Subject |
| --- | --- |
| Academia | Evidence scales, archaeological fragments, and a coin in a colonnade |
| Projects | Astrolabe, celestial sphere, and a connected constellation |
| Resources | Caravanserai exchange, travellers, and a route through mountains |
| YouTube | Pierced brass lantern projecting geometric light through an arcade |
| Contact | Courier and horse carrying correspondence through a city gate |

The composition reserves dark space on the left and places the subject on the
right. CSS masks blend the artwork into the banner; smaller screens soften it
behind the text. Actual monograph covers, project illustrations, external resource
logos, and video posters remain attached to their original content.

## Preserved behavior

- Academia: publication text, cover tabs, thesis disclosures, and citation formats.
- Projects: all seven destinations, section navigation, and live collection counts.
- Resources: real entries, query and format filters, URL state, and reset behavior.
- YouTube: real video data, subject filters, query, player selection, and subscribe link.
- Contact: topics, validation, original form backend, and submission state handling.

`tests/editorial-pages.spec.ts` exercises these behaviors. Contact requests are
intercepted locally; verification does not send messages. Responsive review covers
320–1920px in dark and light themes; rendered contrast is checked in both themes.
