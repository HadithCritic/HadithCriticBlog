# HadithCritic Blog Component Context

This document contains the source code for the custom Astro components, styling, and the template usage example used to construct the rich articles on the HadithCritic blog. You can use this as context to format markdown into the proper components.

## `src/pages/blogs/the-abbasid-mahdi.astro`

```astro
---
import ArticleLayout from '../../components/article/ArticleLayout.astro';
import ArticleHero from '../../components/article/ArticleHero.astro';
import ArticleMetaBar from '../../components/article/ArticleMetaBar.astro';
import ArticleTOC from '../../components/article/ArticleTOC.astro';
import ArticleProse from '../../components/article/ArticleProse.astro';
import HadithBlock from '../../components/article/HadithBlock.astro';
import ContextNote from '../../components/article/ContextNote.astro';
import ClaimBox from '../../components/article/ClaimBox.astro';
import VerdictBox from '../../components/article/VerdictBox.astro';
import IsnadMap from '../../components/article/IsnadMap.astro';
import SourceComparisonTable from '../../components/article/SourceComparisonTable.astro';
import RelatedPosts from '../../components/article/RelatedPosts.astro';
import PreviousNext from '../../components/article/PreviousNext.astro';

const headings = [
  { depth: 2, text: "The Black Banner Motif", slug: "motif" },
  { depth: 2, text: "Abbasid Political Memory", slug: "memory" },
  { depth: 2, text: "The Mahdi Claim", slug: "mahdi" },
  { depth: 2, text: "Transmission and Source Spread", slug: "transmission" },
  { depth: 2, text: "Variant Wording", slug: "variant" },
  { depth: 2, text: "Factional Context", slug: "context" },
  { depth: 2, text: "Conclusion", slug: "conclusion" }
];

const paths = [
  {
    label: "Abbasid Political Memory",
    nodes: ["Black banner motif", "Khurasan", "Abbasid revolution", "Mahdi legitimation"]
  },
  {
    label: "Apocalyptic Report Layer",
    nodes: ["End-times frame", "Guided army", "Dynastic claimant", "Later compiler"]
  }
];
---

<ArticleLayout title="The Abbasid Mahdi | HadithCritic" description="A study of black-banner prophecy reports, Abbasid political memory, and apocalyptic legitimacy.">
  
  <ArticleHero 
    slot="hero"
    title="The Abbasid Mahdi"
    subtitle="The Black Banners & Abu Abbas al-Saffah"
    description="A study of black-banner prophecy reports, Abbasid political memory, and how apocalyptic narration can serve dynastic legitimacy."
    category="Hadith Prophecies"
    date="Jan 18, 2025"
    readingTime="14 min read"
    heroImage="/images/blog_thumbnails/tn.abbasidmahdi.png"
  />

  <ArticleMetaBar slot="metabar" />

  <ArticleTOC slot="toc" headings={headings} />

  <ArticleProse>
    <div class="hc-article-panel hc-article-panel--parchment">
      <span class="hc-eyebrow" style="color: var(--hc-gold); margin-bottom: 0.5rem; display: block;">In this study</span>
      <p style="margin-bottom: 0;">This article examines how black-banner prophecy reports became attached to Abbasid legitimacy, why the Mahdi motif was politically useful, and what the transmission setting suggests about later fabrication or factional shaping.</p>
    </div>

    <h2 id="motif">The Black Banner Motif</h2>
    <p>Apocalyptic narratives often rely on recognizable symbols that anchor the believer to historical events while pointing to eschatological fulfillment. The "black banners coming from the East" is one of the most potent of these motifs.</p>
    
    <HadithBlock 
      arabic="يَخْرُجُ نَاسٌ مِنَ الْمَشْرِقِ فَيُوَطِّئُونَ لِلْمَهْدِيِّ"
      translation="People will come from the East, paving the way for the Mahdi."
      source="Sunan Ibn Mājah (4088)"
    />

    <h2 id="memory">Abbasid Political Memory</h2>
    <p>The success of the Abbasid revolution heavily relied on the visual and psychological impact of the black banners (al-rāyāt al-sūd) marching from Khurasan.</p>

    <h2 id="mahdi">The Mahdi Claim</h2>
    <p>Once the Abbasids seized power, justifying their rule against Alid claims required shifting the eschatological focus. By adopting the title "al-Mahdi", the third Abbasid caliph directly fused dynastic authority with messianic expectation.</p>

    <ClaimBox title="Core Claim">
      <p>The black-banner reports are best read not as neutral prophecy, but as apocalyptic legitimation shaped in the memory of the Abbasid revolution.</p>
    </ClaimBox>

    <h2 id="transmission">Transmission and Source Spread</h2>
    <p>When tracing these reports, we consistently find common links originating in Iraq and Khurasan during the early Abbasid era.</p>

    <IsnadMap title="Black Banner Transmission Cluster" paths={paths} />

    <h2 id="variant">Variant Wording</h2>
    <p>Source comparison reveals that the explicit mention of the Mahdi was often absent in earlier recensions, added later as the political utility of the concept grew.</p>

    <SourceComparisonTable>
      <Fragment slot="header">
        <th>Source</th>
        <th>Wording Focus</th>
        <th>Chain Link</th>
        <th>Notes</th>
      </Fragment>
      <tr>
        <td>Musnad Aḥmad</td>
        <td>General arrival of banners</td>
        <td>Thawbān</td>
        <td>No explicit Mahdi</td>
      </tr>
      <tr>
        <td>Sunan Ibn Mājah</td>
        <td>Paving the way for Mahdi</td>
        <td>Thawbān</td>
        <td>Apocalyptic frame added</td>
      </tr>
    </SourceComparisonTable>

    <h2 id="context">Factional Context</h2>
    <ContextNote>
      <p>The Abbasid revolution made black banners a potent symbol of legitimacy. Reports that attach salvation, guidance, or eschatological authority to black banners must be read with that political setting in view.</p>
    </ContextNote>

    <h2 id="conclusion">Conclusion</h2>
    <p>The textual history of the black banner traditions illustrates the intersection of memory and politics.</p>

    <VerdictBox>
      <p>The report’s value does not lie in proving a future prophecy. Its importance lies in showing how apocalyptic symbols could be transmitted, reshaped, and attached to factional legitimacy.</p>
    </VerdictBox>

    <RelatedPosts />

    <PreviousNext 
      prevUrl="#" prevTitle="The Return of Jesus"
      nextUrl="#" nextTitle="Sufyani Narrations"
    />
  </ArticleProse>
</ArticleLayout>

```

## `src/components/article/ArticleProse.astro`

```astro
---
---
<div class="hc-article-body">
  <slot />
</div>

```

## `src/components/article/HadithBlock.astro`

```astro
---
export interface Props {
  arabic: string;
  translation: string;
  source: string;
}
const { arabic, translation, source } = Astro.props;
---
<div class="hc-article-panel hc-article-panel--parchment hadith-block">
  <div class="hadith-header">
    <span class="hc-eyebrow" style="color: var(--hc-umber-dark);">Report Text</span>
  </div>
  <div class="hadith-arabic" dir="rtl">
    {arabic}
  </div>
  <div class="hadith-translation">
    {translation}
  </div>
  <div class="hadith-source">
    <span class="hc-eyebrow" style="color: var(--hc-umber-dark); margin-right: 0.5rem;">Source</span> {source}
  </div>
</div>
<style>
  .hadith-block {
    position: relative;
    padding-top: 3rem;
  }
  .hadith-header {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0.5rem 1.25rem;
    background: var(--hc-parchment-deep);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    border-right: 1px solid rgba(0,0,0,0.06);
    border-radius: var(--radius-sm) 0 var(--radius-sm) 0;
  }
  .hadith-arabic {
    font-family: var(--font-arabic);
    font-size: 1.6rem;
    line-height: 2.2;
    margin-bottom: 1.5rem;
    color: var(--hc-parchment-ink);
  }
  .hadith-translation {
    font-size: 1.15rem;
    line-height: 1.7;
    margin-bottom: 1.5rem;
    padding-left: 1rem;
    border-left: 2px solid var(--hc-gold-dim);
  }
  .hadith-source {
    font-family: var(--font-ui);
    font-size: 0.85rem;
    color: rgba(26, 23, 21, 0.7);
    border-top: 1px solid rgba(0,0,0,0.06);
    padding-top: 1rem;
  }
</style>

```

## `src/components/article/SourceComparisonTable.astro`

```astro
---
---
<div class="hc-source-table-wrapper">
  <table class="hc-source-table">
    <thead>
      <tr>
        <slot name="header" />
      </tr>
    </thead>
    <tbody>
      <slot />
    </tbody>
  </table>
</div>
<style>
  .hc-source-table-wrapper {
    overflow-x: auto;
    margin: 2.5rem 0;
    border: 1px solid var(--hc-rule);
    border-radius: var(--radius-sm);
    background: rgba(30, 29, 27, 0.5);
  }
  .hc-source-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .hc-source-table :global(th) {
    font-family: var(--font-ui);
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hc-gold);
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--hc-rule);
    background: rgba(26, 23, 21, 0.8);
  }
  .hc-source-table :global(td) {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--hc-rule-soft);
    color: var(--hc-parchment);
    font-size: 0.95rem;
    line-height: 1.6;
    vertical-align: top;
  }
  .hc-source-table :global(tr:last-child td) {
    border-bottom: none;
  }
</style>

```

## `src/components/article/IsnadMap.astro`

```astro
---
export interface Path {
  label: string;
  nodes: string[];
}
export interface Props {
  title: string;
  paths: Path[];
}
const { title, paths } = Astro.props;
---
<div class="hc-article-panel isnad-map-container">
  <div class="isnad-header">
    <span class="hc-eyebrow" style="color: var(--hc-gold);">{title}</span>
  </div>
  <div class="isnad-scroll-area">
    <div class="isnad-layout">
      {paths.map((path) => (
        <div class="isnad-path">
          <div class="path-label hc-small">{path.label}</div>
          <div class="nodes-container">
            {path.nodes.map((node, nIdx) => (
              <div class="isnad-node">
                <span class="node-text">{node}</span>
                {nIdx < path.nodes.length - 1 && <div class="node-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
<style>
  .isnad-map-container {
    background: var(--hc-black-soft);
    border: 1px solid var(--hc-rule);
  }
  .isnad-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .isnad-scroll-area {
    overflow-x: auto;
    padding-bottom: 1rem;
  }
  .isnad-layout {
    display: flex;
    justify-content: center;
    gap: 4rem;
    min-width: 600px;
  }
  .isnad-path {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .path-label {
    color: var(--hc-muted);
    margin-bottom: 2rem;
    text-align: center;
  }
  .nodes-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .isnad-node {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .node-text {
    background: var(--hc-charcoal-2);
    border: 1px solid var(--hc-rule);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    color: var(--hc-parchment);
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    text-align: center;
    min-width: 140px;
    transition: transform 200ms, border-color 200ms;
  }
  .node-text:hover {
    transform: translateY(-2px);
    border-color: var(--hc-gold-soft);
  }
  .node-connector {
    width: 2px;
    height: 40px;
    background: var(--hc-rule);
    margin: 4px 0;
  }
</style>

```

## `src/components/article/ContextNote.astro`

```astro
---
export interface Props {
  title?: string;
}
const { title = "Historical Context Note" } = Astro.props;
---
<div class="hc-article-panel hc-article-panel--umber context-note">
  <div class="note-header">
    <span class="hc-eyebrow" style="color: var(--hc-gold);">{title}</span>
  </div>
  <div class="note-content">
    <slot />
  </div>
</div>
<style>
  .context-note {
    border-left: 4px solid var(--hc-gold);
  }
  .note-header {
    margin-bottom: 1rem;
  }
  .note-content {
    font-size: 1.05rem;
    line-height: 1.6;
  }
  .note-content :global(p:last-child) {
    margin-bottom: 0;
  }
</style>

```

## `src/components/article/VerdictBox.astro`

```astro
---
export interface Props {
  title?: string;
}
const { title = "Conclusion" } = Astro.props;
---
<div class="hc-article-panel verdict-box">
  <div class="verdict-header">
    <span class="hc-eyebrow" style="color: var(--hc-parchment);">{title}</span>
  </div>
  <div class="verdict-content">
    <slot />
  </div>
</div>
<style>
  .verdict-box {
    border: 1px solid var(--hc-gold-dim);
    background: linear-gradient(145deg, rgba(30,29,27,0.9), rgba(20,19,18,0.95));
    position: relative;
  }
  .verdict-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--hc-gold), transparent);
  }
  .verdict-header {
    margin-bottom: 1rem;
    text-align: center;
  }
  .verdict-content {
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--hc-parchment);
    text-align: center;
  }
  .verdict-content :global(p:last-child) {
    margin-bottom: 0;
  }
</style>

```

## `src/components/article/ClaimBox.astro`

```astro
---
export interface Props {
  title?: string;
}
const { title = "Core Claim" } = Astro.props;
---
<div class="hc-article-panel claim-box">
  <div class="claim-header">
    <span class="hc-eyebrow" style="color: var(--hc-gold);">{title}</span>
  </div>
  <div class="claim-content">
    <slot />
  </div>
</div>
<style>
  .claim-box {
    border-left: 4px solid var(--hc-gold);
    background: color-mix(in srgb, var(--hc-charcoal) 90%, transparent);
  }
  .claim-header {
    margin-bottom: 0.75rem;
  }
  .claim-content {
    font-size: 1.15rem;
    line-height: 1.6;
    color: var(--hc-parchment);
    font-style: italic;
  }
  .claim-content :global(p:last-child) {
    margin-bottom: 0;
  }
</style>

```

## `src/styles/article.css`

```css
/* HadithCritic Article Template Styles */

.hc-article {
  background:
    radial-gradient(circle at 70% 0%, rgba(216, 177, 102, 0.08), transparent 34%),
    linear-gradient(180deg, var(--hc-black) 0%, var(--hc-black-soft) 100%);
  min-height: 100vh;
  position: relative;
}

.hc-article-body {
  width: min(100% - 2rem, 820px);
  margin-inline: auto;
  font-family: var(--font-body);
  font-size: clamp(1.08rem, 0.4vw + 1rem, 1.22rem);
  line-height: 1.85;
}

.hc-article-body p {
  margin: 0 0 1.45rem;
  color: var(--hc-parchment);
}

.hc-article-body h2 {
  margin-top: 4rem;
  margin-bottom: 1.2rem;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 4.2rem);
  line-height: 0.98;
  color: var(--hc-gold-soft);
  font-weight: 400;
}

.hc-article-body h3 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: var(--hc-parchment);
  font-weight: 400;
}

.hc-article-body a {
  color: var(--hc-gold);
  text-decoration: underline;
  text-decoration-color: var(--hc-rule-strong);
  text-underline-offset: 4px;
  transition: color 200ms ease, text-decoration-color 200ms ease;
}

.hc-article-body a:hover {
  color: var(--hc-gold-soft);
  text-decoration-color: var(--hc-gold-soft);
}

.hc-article-body ul, .hc-article-body ol {
  margin: 0 0 1.45rem 1.5rem;
  color: var(--hc-parchment);
}

.hc-article-body li {
  margin-bottom: 0.5rem;
}

/* Article Panels */
.hc-article-panel {
  margin: 2.5rem 0;
  padding: clamp(1.4rem, 3vw, 2.2rem);
  border: 1px solid var(--hc-rule);
  box-shadow: 0 22px 70px rgba(0,0,0,.28);
  border-radius: var(--radius-sm);
  position: relative;
}

.hc-article-panel--parchment {
  background:
    linear-gradient(rgba(242,235,220,.94), rgba(229,215,189,.96)),
    radial-gradient(circle at 20% 30%, rgba(157,122,60,.15), transparent 22%);
  color: var(--hc-parchment-ink);
  border-color: rgba(157,122,60,.45);
}

.hc-article-panel--parchment p, .hc-article-panel--parchment h2, .hc-article-panel--parchment h3 {
  color: #2f281f;
}

.hc-article-panel--parchment .hc-eyebrow {
  color: var(--hc-gold-dim);
}

.hc-article-panel--umber {
  background:
    linear-gradient(rgba(164,106,63,.88), rgba(110,59,36,.96)),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,.08), transparent 26%);
  color: var(--hc-parchment);
  border-color: rgba(216,177,102,.45);
}

.hc-article-panel--umber p {
  color: var(--hc-parchment);
}

/* Layout Grid */
.hc-article-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 1rem 6rem;
  position: relative;
}

@media (min-width: 1200px) {
  .hc-article-grid {
    grid-template-columns: minmax(0, 1fr) min(100%, 800px) 240px;
    column-gap: clamp(3rem, 5vw, 6rem);
    padding: 5rem 2rem 8rem;
  }
}

```

## `src/styles/global.css`

```css
/* HadithCritic Visual System
   Official look: dark scholarly archive, antique gold, parchment, umber notes,
   humanistic serif typography, manuscript texture, and illustrated muḥaddithūn assets.
*/

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,600&display=swap');
@import url('./article.css');

:root {
  /* Core palette */
  --hc-black: #0f0f10;
  --hc-black-soft: #141312;
  --hc-charcoal: #1e1d1b;
  --hc-charcoal-2: #26231f;

  --hc-gold: #d8b166;
  --hc-gold-soft: #e2c783;
  --hc-gold-dim: #9d7a3c;

  --hc-parchment: #f2ebdc;
  --hc-parchment-deep: #e5d7bd;
  --hc-parchment-ink: #1a1715;

  --hc-muted: #b8ad99;
  --hc-ash: #8c8a86;

  --hc-umber: #a46a3f;
  --hc-umber-dark: #6e3b24;
  --hc-prophecy: #7b2d24;

  --hc-rule: rgba(216, 177, 102, 0.32);
  --hc-rule-soft: rgba(242, 235, 220, 0.14);
  --hc-rule-strong: rgba(216, 177, 102, 0.55);
  
  --shadow: 0 30px 100px rgba(0, 0, 0, 0.42);

  /* Typography */
  --font-display: "Cormorant Garamond", serif;
  --font-body: "Source Serif 4", serif;
  --font-ui: "IBM Plex Sans", sans-serif;
  --font-arabic: "Noto Naskh Arabic", "Amiri", serif;

  /* Geometry */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;
  --wrap: 1240px;
  --wrap-reading: 780px;
  --pad: clamp(1.2rem, 4vw, 2.5rem);
  --section-y: clamp(4.5rem, 9vw, 8rem);
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Bootstrap compatibility:
   Do not style .btn, .card, .container, .row, etc. globally.
   Use hc-* classes so Bootstrap can exist without corrupting the brand system.
*/

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  scroll-behavior: smooth;
  text-size-adjust: 100%;
  background: var(--hc-black);
}

body {
  min-height: 100vh;
  margin: 0;
  color: var(--hc-parchment);
  font-family: var(--font-body);
  font-size: clamp(1.03rem, 0.25vw + 1rem, 1.13rem);
  line-height: 1.72;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background:
    radial-gradient(circle at 75% 10%, rgba(216,177,102,.08), transparent 30%),
    radial-gradient(circle at 10% 20%, rgba(164,106,63,.09), transparent 28%),
    linear-gradient(135deg, var(--hc-black) 0%, var(--hc-charcoal) 46%, var(--hc-black) 100%);
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: .08;
  mix-blend-mode: soft-light;
  z-index: 100;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255,255,255,.12) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 60%, rgba(255,255,255,.08) 0 1px, transparent 1px);
  background-size: 180px 180px, 260px 260px;
}

img,
svg,
video {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
  text-underline-offset: 0.18em;
  transition: color 180ms ease, border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

:focus-visible {
  outline: 2px solid var(--hc-gold);
  outline-offset: 4px;
}

::selection {
  color: var(--hc-black);
  background: var(--hc-gold-soft);
}

/* Layout primitives */

.site-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: clip;
}

main {
  flex: 1;
}

.wrap,
.hc-container {
  width: min(100% - (var(--pad) * 2), var(--wrap));
  margin-inline: auto;
}

.hc-reading {
  width: min(100% - (var(--pad) * 2), var(--wrap-reading));
  margin-inline: auto;
}

.section,
.hc-section {
  padding-block: var(--section-y);
}

.section--tight,
.hc-section--tight {
  padding-block: clamp(3rem, 6vw, 5.5rem);
}

/* Accessibility */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Type system */

.hc-eyebrow,
.hc-label {
  font-family: var(--font-ui);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.72rem;
  line-height: 1.3;
  color: var(--hc-gold);
  font-weight: 600;
}

.hc-title {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 0.93;
  color: var(--hc-parchment);
  margin: 0;
}

.hc-title--xl {
  font-size: clamp(4rem, 9vw, 8.7rem);
}

.hc-title--lg {
  font-size: clamp(3rem, 6vw, 5.8rem);
}

.hc-title--md {
  font-size: clamp(2.25rem, 4vw, 4rem);
}

.hc-copy {
  color: var(--hc-muted);
  font-size: clamp(1.03rem, 0.5vw + 0.96rem, 1.22rem);
  line-height: 1.72;
}

.hc-small {
  font-family: var(--font-ui);
  color: var(--hc-ash);
  font-size: 0.86rem;
  line-height: 1.55;
}

.arabic,
.hc-arabic {
  font-family: var(--font-arabic);
  direction: rtl;
  line-height: 2;
  font-size: clamp(1.25rem, 1vw + 1rem, 1.65rem);
}

/* Buttons: hc-* only, to avoid Bootstrap .btn collisions */

.hc-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.62rem;
  min-height: 44px;
  padding: 0.72rem 1.15rem;
  border: 1px solid var(--hc-rule-strong);
  border-radius: var(--radius-xs);
  color: var(--hc-black);
  background: linear-gradient(135deg, var(--hc-gold), var(--hc-gold-soft));
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: 0.88rem;
  letter-spacing: 0.02em;
  text-decoration: none;
  box-shadow: 0 12px 32px rgba(216, 177, 102, 0.13);
  transition: transform 200ms var(--ease), filter 200ms ease, background 200ms ease, border-color 200ms ease;
}

.hc-btn:hover {
  background: var(--hc-gold-soft);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(216, 177, 102, 0.4), 0 4px 12px rgba(216, 177, 102, 0.2);
}

.hc-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(216, 177, 102, 0.3);
}

.hc-btn--ghost {
  background: transparent;
  border: 1px solid var(--hc-rule);
  color: var(--hc-gold);
  box-shadow: none;
}

.hc-btn--ghost:hover {
  background: rgba(216, 177, 102, 0.08);
  border-color: var(--hc-gold-dim);
  color: var(--hc-gold-soft);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Animated Swoop Effect */
.hc-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-25deg);
  transition: none;
  z-index: 1;
}

.hc-btn:hover::before {
  animation: shine 0.65s cubic-bezier(0.1, 0, 0.3, 1);
}

.hc-btn--ghost::before {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.6), transparent);
}

@keyframes shine {
  100% {
    left: 200%;
  }
}

/* Panels and cards */

.hc-card {
  position: relative;
  border: 1px solid var(--hc-rule);
  border-radius: var(--radius-xs);
  background:
    linear-gradient(180deg, rgba(38, 35, 31, 0.82), rgba(20, 19, 18, 0.9)),
    url("/assets/textures/charcoal-paper.png");
  box-shadow: var(--hc-shadow);
}

.hc-card::before {
  content: "";
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(216, 177, 102, 0.12);
  pointer-events: none;
}

.hc-card--parchment {
  color: var(--hc-parchment-ink);
  border: 1px solid rgba(157, 122, 60, 0.42);
  background:
    linear-gradient(rgba(242, 235, 220, 0.93), rgba(229, 215, 189, 0.96)),
    url("/assets/textures/parchment-card-light.png");
  box-shadow: 0 18px 56px rgba(0, 0, 0, 0.2);
}

.hc-card--parchment .hc-eyebrow,
.hc-card--parchment .hc-label {
  color: var(--hc-gold-dim);
}

.hc-card--parchment .hc-copy,
.hc-card--parchment p {
  color: #4b4033;
}

.hc-context-note {
  position: relative;
  color: var(--hc-parchment);
  border: 1px solid rgba(216, 177, 102, 0.4);
  border-radius: var(--radius-xs);
  background:
    linear-gradient(rgba(164, 106, 63, 0.88), rgba(110, 59, 36, 0.94)),
    url("/assets/textures/grain-overlay.png");
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.26);
}

.hc-context-note::after {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px dashed rgba(242, 235, 220, 0.3);
  pointer-events: none;
}

/* Section headers */

.hc-section-head {
  max-width: 780px;
  margin-bottom: clamp(2rem, 5vw, 3.75rem);
}

.hc-section-head--center {
  margin-inline: auto;
  text-align: center;
}

.hc-section-head .hc-title {
  margin-top: 0.35rem;
}

.hc-section-head .hc-copy {
  margin-top: 1rem;
}

/* Ornaments */

.ornamental-divider,
.hc-divider {
  width: 100%;
  height: 1px;
  background: var(--hc-rule);
  position: relative;
  margin: clamp(2rem, 5vw, 3rem) 0;
}

.ornamental-divider::before,
.hc-divider::before {
  content: "♦";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--hc-gold);
  font-size: 0.78rem;
  line-height: 1;
  background: var(--hc-black);
  padding: 0 12px;
}

/* Header-ready primitives */

.hc-header-link {
  font-family: var(--font-ui);
  font-size: 0.84rem;
  letter-spacing: 0.035em;
  text-decoration: none;
  color: rgba(242, 235, 220, 0.86);
}

.hc-header-link:hover {
  color: var(--hc-gold);
}

/* Directory cards */

.hc-directory-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid var(--hc-rule);
  background: var(--hc-rule);
}

.hc-directory-card {
  min-height: 360px;
  position: relative;
  overflow: hidden;
  padding: clamp(1.3rem, 3vw, 2rem);
  color: var(--hc-parchment);
  text-decoration: none;
  background:
    linear-gradient(180deg, rgba(30, 29, 27, 0.88), rgba(15, 15, 16, 0.96)),
    url("/assets/textures/charcoal-paper.png");
}

.hc-directory-card h3 {
  margin: 0.65rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(2.35rem, 4vw, 4rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
  font-weight: 500;
}

.hc-directory-card p {
  max-width: 22rem;
  color: var(--hc-muted);
  margin: 1rem 0 0;
}

.hc-directory-card img {
  position: absolute;
  right: -8%;
  bottom: -8%;
  width: 72%;
  max-height: 58%;
  object-fit: contain;
  opacity: 0.58;
  filter: sepia(0.2) saturate(0.9);
  transition: transform 450ms var(--ease), opacity 250ms ease;
}

.hc-directory-card:hover img {
  transform: translate3d(-8px, -8px, 0) scale(1.035);
  opacity: 0.78;
}

.hc-directory-card--parchment {
  color: var(--hc-parchment-ink);
  background:
    linear-gradient(rgba(242, 235, 220, 0.94), rgba(229, 215, 189, 0.96)),
    url("/assets/textures/parchment-card-light.png");
}

.hc-directory-card--parchment p {
  color: #4b4033;
}

.hc-directory-card--umber {
  color: var(--hc-parchment);
  background:
    linear-gradient(rgba(164, 106, 63, 0.9), rgba(110, 59, 36, 0.95)),
    url("/assets/textures/grain-overlay.png");
}

/* Manuscript / report apparatus */

.hc-apparatus {
  border: 1px solid var(--hc-rule);
  background: rgba(15, 15, 16, 0.54);
  padding: clamp(1.2rem, 3vw, 1.75rem);
}

.hc-apparatus-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem;
  border-bottom: 1px solid var(--hc-rule-soft);
}

.hc-apparatus-row:last-child {
  border-bottom: 0;
}

.hc-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0.25rem 0.72rem;
  border: 1px solid var(--hc-rule);
  border-radius: var(--radius-pill);
  color: var(--hc-gold-soft);
  background: rgba(216, 177, 102, 0.06);
  font-family: var(--font-ui);
  font-size: 0.78rem;
  text-decoration: none;
}

/* Responsive */

@media (max-width: 991px) {
  .hc-directory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hc-title--xl {
    font-size: clamp(3.5rem, 15vw, 6rem);
  }
}

@media (max-width: 640px) {
  :root {
    --pad: 1rem;
  }

  .hc-directory-grid {
    grid-template-columns: 1fr;
  }

  .hc-directory-card {
    min-height: 310px;
  }

  .hc-directory-card img {
    width: 78%;
    max-height: 52%;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

```

