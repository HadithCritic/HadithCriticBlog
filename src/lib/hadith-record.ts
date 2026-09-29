/**
 * The critical edition record for one narration, rendered in the browser.
 *
 * /hadith/[id] is a shell: the Worker knows the id in the URL and nothing else,
 * because there are 276,347 narrations and no database behind the site to ask.
 * Everything below the layout chrome is built here from the static corpus.
 *
 * The markup is a faithful port of what the page used to render server side,
 * class for class, because the stylesheet is the same stylesheet. Its rules had
 * to move from the page's scoped block to `is:global` in the same change: a
 * node created by script never carries the page's `data-astro-cid` attribute,
 * so a scoped rule cannot reach it, and the page would have rendered unstyled.
 *
 * Section ids matter too. `#matn-heading`, `#report-heading`, `#isnad-heading`
 * and `#apparatus-heading` are the scrollspy's targets and are linked from
 * articles, so they are emitted whether or not this module wrote them.
 */

import {
  CorpusUnavailableError,
  getHadithDetail,
  type ChainNode,
  type HadithDetail,
  type HadithNarratorSurface
} from './corpus-client';
import { escapeHtml } from './snippet';
import { renderArabic, renderRich, toPlainText } from './format-text';

/** Reveal delays stop climbing after this many items, as elsewhere on the site. */
const REVEAL_CAP = 8;

const heroTitle = (detail: HadithDetail) =>
  toPlainText(detail.hadith.chapter_en) || detail.hadith.book_en;

/** "Musnad Ahmad № 1234", the form used in the citation and the breadcrumb. */
export function referenceLabel(detail: HadithDetail): string {
  const { hadith } = detail;
  return `${hadith.book_en}${hadith.hadith_num ? ` № ${hadith.hadith_num}` : ''}`;
}

/** Chain rows arrive flat and ordered; a branch is a run sharing a path_idx. */
function groupPaths(chain: ChainNode[]): Map<number, ChainNode[]> {
  const paths = new Map<number, ChainNode[]>();
  for (const node of chain) {
    if (!paths.has(node.path_idx)) paths.set(node.path_idx, []);
    paths.get(node.path_idx)!.push(node);
  }
  return paths;
}

function heroMarkup(detail: HadithDetail, id: number, pathCount: number, totalParallels: number): string {
  const { hadith } = detail;
  return `
    <header class="edition-hero">
      <div class="edition-hero__topbar">
        <a class="hc-back-link" href="/hadith/collection/${escapeHtml(hadith.book_slug)}/">
          <span>←</span>
          <span>${escapeHtml(hadith.book_en)}</span>
        </a>

        <div class="edition-hero__badges">
          ${
            hadith.hadith_num
              ? `<span class="edition-ref-tag edition-ref-tag--gold">№ ${escapeHtml(hadith.hadith_num)}</span>`
              : ''
          }
          <span class="edition-ref-tag">Record ID #${id}</span>
        </div>
      </div>

      <div class="edition-hero__titles">
        <h1 class="edition-hero__title-en">${escapeHtml(heroTitle(detail))}</h1>
      </div>

      ${structureMarkup(detail)}

      <div class="edition-ledger-grid">
        <div class="ledger-block">
          <span class="ledger-block__label">Source</span>
          <div class="ledger-block__value">
            <a href="/hadith/collection/${escapeHtml(hadith.book_slug)}/" class="ledger-link">
              ${escapeHtml(hadith.book_en)}
            </a>
            ${
              hadith.book_ar
                ? `<span class="ledger-book-ar" lang="ar" dir="rtl">${escapeHtml(hadith.book_ar)}</span>`
                : ''
            }
          </div>
        </div>

        <div class="ledger-block">
          <span class="ledger-block__label">Transmission</span>
          <div class="ledger-block__value">
            <span>${pathCount} ${pathCount === 1 ? 'lineage path' : 'lineage paths'} · ${hadith.narrator_count} transmitters</span>
            <span class="ledger-meta">${totalParallels.toLocaleString()} cross-attestations</span>
          </div>
        </div>

        <div class="ledger-block ledger-block--action">
          <span class="ledger-block__label">Print reference</span>
          ${referenceSummaryMarkup(detail)}
          <button
            type="button"
            class="edition-cite-btn"
            id="edition-cite-btn"
            data-citation="${escapeHtml(citationText(detail, id))}"
            hidden
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span data-cite-label>Copy Citation</span>
          </button>
        </div>
      </div>
    </header>`;
}

function dockMarkup(matnIsDistinct: boolean, pathCount: number, hasApparatus: boolean): string {
  return `
    <nav class="edition-nav-dock" aria-label="Record Sections" id="edition-jump-bar">
      <div class="edition-nav-dock__inner">
        <div class="edition-nav-dock__links">
          ${
            matnIsDistinct
              ? `<a href="#matn-heading" class="dock-link">
                   <span>Substantive Matn</span>
                   <span class="dock-link__ar" lang="ar">المتن</span>
                 </a>`
              : ''
          }
          <a href="#report-heading" class="dock-link">
            <span>Full Transmission</span>
            <span class="dock-link__ar" lang="ar">الرواية الكاملة</span>
          </a>
          ${
            pathCount > 0
              ? `<a href="#isnad-heading" class="dock-link">
                   <span>Isnād Transmission Graph</span>
                   <span class="dock-link__count">${pathCount}</span>
                 </a>`
              : ''
          }
          ${
            hasApparatus
              ? `<a href="#apparatus-heading" class="dock-link"><span>Critical Apparatus</span></a>`
              : ''
          }
        </div>
      </div>
    </nav>`;
}

/**
 * A facing-page spread. Arabic and English carry their own rendering paths:
 * `renderRich` for the translation, `renderArabic` for the original, both of
 * which escape and then reintroduce only the markup the source encodes.
 */
function spread(options: {
  modifier: string;
  englishLabel?: string;
  englishCaveat: string;
  english: string | null;
  englishEmpty: string;
  arabicTag: string;
  arabicFolio: string;
  arabic: string;
}): string {
  return `
    <div class="critical-spread${options.modifier}">
      <div class="critical-col critical-col--en">
        <div class="critical-col__header">
          <div class="critical-col__tag">
            <span class="critical-col__dot critical-col__dot--en" aria-hidden="true"></span>
            <span>${escapeHtml(options.englishLabel || 'English Translation')}</span>
          </div>
          <span class="critical-col__caveat">${escapeHtml(options.englishCaveat)}</span>
        </div>
        <div class="critical-col__prose">
          ${
            options.english
              ? `<div class="facing-prose facing-prose--en">${renderRich(options.english)}</div>`
              : `<p class="facing-prose--empty">${escapeHtml(options.englishEmpty)}</p>`
          }
        </div>
      </div>

      <div class="critical-col critical-col--ar">
        <div class="critical-col__header">
          <div class="critical-col__tag">
            <span class="critical-col__dot critical-col__dot--ar" aria-hidden="true"></span>
            <span lang="ar" dir="rtl">${escapeHtml(options.arabicTag)}</span>
          </div>
          <span class="critical-col__folio">${escapeHtml(options.arabicFolio)}</span>
        </div>
        <div class="critical-col__prose">
          <div class="facing-prose facing-prose--ar" lang="ar" dir="rtl">${renderArabic(options.arabic)}</div>
        </div>
      </div>
    </div>`;
}

function sectionHeader(kicker: string, id: string, title: string, description: string): string {
  return `
    <div class="record-section__header">
      <div class="record-section__kicker">
        <span class="hc-eyebrow">${escapeHtml(kicker)}</span>
      </div>
      <h2 class="record-section__title" id="${id}">${title}</h2>
      <p class="record-section__desc">${escapeHtml(description)}</p>
    </div>`;
}

function ladderNode(node: ChainNode, index: number, total: number): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const classes = ['ladder-node', 'hc-reveal'];
  if (isFirst) classes.push('is-source');
  if (isLast) classes.push('is-compiler');

  const role = isFirst
    ? '<span class="role-pill role-pill--source">Earliest Authority · Source</span>'
    : isLast
      ? '<span class="role-pill role-pill--compiler">Compiler · Collector</span>'
      : `<span class="role-pill">Intermediate Transmitter #${index + 1}</span>`;

  const name = node.narrator_id
    ? `<a class="ladder-card__name" href="/narrators/${node.narrator_id}/">${escapeHtml(
        node.name_en || node.name
      )}</a>`
    : `<div class="ladder-card__unresolved">
         <span class="ladder-card__name is-unlinked">${escapeHtml(
           node.name || 'Unidentified Transmitter'
         )}</span>
         <span class="unresolved-badge">Unresolved in Register</span>
       </div>`;

  return `
    <li class="${classes.join(' ')}" style="--reveal-delay:${Math.min(index, REVEAL_CAP)}">
      <div class="ladder-spine">
        <span class="ladder-spine__circle">${index + 1}</span>
        ${
          isLast
            ? ''
            : `<div class="ladder-spine__connector" aria-hidden="true">
                 <span class="ladder-spine__line"></span>
               </div>`
        }
      </div>

      <div class="ladder-card">
        <div class="ladder-card__content">
          <div class="ladder-card__role">${role}</div>
          ${name}
        </div>

        <div class="ladder-card__meta">
          ${node.death_hijri ? `<span class="death-tag">d. ${node.death_hijri} AH</span>` : ''}
          ${
            node.narrator_id
              ? `<a class="dossier-button" href="/narrators/${node.narrator_id}/">
                   <span>Dossier</span>
                   <span class="dossier-arrow">→</span>
                 </a>`
              : ''
          }
        </div>
      </div>
    </li>`;
}

function isnadSection(paths: Map<number, ChainNode[]>, detail: HadithDetail): string {
  const cards = [...paths.entries()]
    .map(
      ([idx, nodes]) => `
      <div class="isnad-path-card">
        <div class="isnad-path-card__header">
          <div class="isnad-path-card__title-wrap">
            <span class="isnad-path-badge">Lineage Branch ${idx + 1}</span>
            <span class="isnad-path-count">${nodes.length} Transmitters in Direct Succession</span>
          </div>

        </div>

        <ol class="isnad-chain-ladder">
          ${nodes.map((node, i) => ladderNode(node, i, nodes.length)).join('')}
        </ol>
      </div>`
    )
    .join('');

  return `
    <section class="record-section" aria-labelledby="isnad-heading">
      ${sectionHeader(
        'Transmitter Lineage',
        'isnad-heading',
        'Transmission Graph &amp; Rijal Register (الإسناد)',
        'Normalized transmitter paths indexed for navigation. These paths are not a diplomatic transcription of the source isnād; consult the source narrator forms below for names recorded with this report.'
      )}
      <div class="isnad-graph-stack">${cards}</div>
      ${sourceNarratorMarkup(detail.sourceNarrators)}
    </section>`;
}

function sourceNarratorMarkup(surfaces: HadithNarratorSurface[]): string {
  if (!surfaces.length) return '';
  return `
    <details class="source-narrators">
      <summary>Source narrator name forms <span>${surfaces.length} indexed forms</span></summary>
      <p class="source-narrators__note">Arabic forms are transcribed from the source dataset. English names are register cross-references; they are not a translation of the Arabic forms.</p>
      <ol>
        ${surfaces.map((entry) => `
          <li>
            <span class="source-narrators__position">${entry.pos + 1}</span>
            <span class="source-narrators__en">${entry.narrator_id ? `<a href="/narrators/${entry.narrator_id}/">${escapeHtml(entry.name_en || 'Open Rijāl dossier')}</a>` : escapeHtml(entry.name_en || 'No register match')}</span>
            <span class="source-narrators__ar" lang="ar" dir="rtl">${renderArabic(entry.surface_diac || entry.surface)}</span>
          </li>`).join('')}
      </ol>
    </details>`;
}

function apparatusSection(detail: HadithDetail, totalParallels: number): string {
  const { hadith, glosses, subjects } = detail;
  const cards: string[] = [];
  const detailCardCount = Number(glosses.length > 0) + Number(subjects.length > 0);

  if (totalParallels > 0) {
    const circulation = [
      [
        'Parallels (متابعات)',
        'Identical companion report transmitted through alternate transmission branches',
        Number(hadith.parallel_count || 0)
      ],
      [
        'Witnesses (شواهد)',
        'Corroborating reports transmitted through distinct companion witnesses',
        Number(hadith.witness_count || 0)
      ],
      [
        'Manuscript Variants (روايات وألفاظ)',
        'Recorded wording, expansion, and phrasing variants across codices',
        Number(hadith.variant_count || 0)
      ]
    ] as const;

    cards.push(`
      <div class="apparatus-card apparatus-card--circulation hc-reveal" style="--reveal-delay:0">
        <div class="apparatus-card__header">
          <h3 class="apparatus-card__title">Cross-Attestation Network</h3>
          <span class="apparatus-card__count">${totalParallels.toLocaleString()} Occurrences</span>
        </div>
        <p class="apparatus-card__note">
          Documented circulation of this narration across parallel paths and corroborating witnesses:
        </p>
        <div class="circulation-list">
          ${circulation
            .map(
              ([title, desc, n]) => `
            <div class="circulation-item">
              <div class="circulation-item__meta">
                <span class="circulation-item__title">${escapeHtml(title)}</span>
                <span class="circulation-item__desc">${escapeHtml(desc)}</span>
              </div>
              <span class="circulation-item__num">${n.toLocaleString()}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>`);
  }

  if (glosses.length > 0) {
    cards.push(`
      <div class="apparatus-card apparatus-card--lexicon hc-reveal" style="--reveal-delay:1">
        <div class="apparatus-card__header">
          <h3 class="apparatus-card__title">Gharīb Vocabulary (غريب الحديث)</h3>
          <span class="apparatus-card__count">${glosses.length} Terms</span>
        </div>
        <p class="apparatus-card__note">Lexicographical commentary on archaic or specialized terms:</p>
        <dl class="lexicon-ledger">
          ${glosses
            .map(
              (g) => `
            <div class="lexicon-entry">
              <dt lang="ar" dir="rtl" class="lexicon-entry__ar">${escapeHtml(g.word_ar)}</dt>
              <dd class="lexicon-entry__en">${escapeHtml(g.word_en)}</dd>
            </div>`
            )
            .join('')}
        </dl>
      </div>`);
  }

  if (subjects.length > 0) {
    cards.push(`
      <div class="apparatus-card apparatus-card--subjects hc-reveal" style="--reveal-delay:2">
        <div class="apparatus-card__header">
          <h3 class="apparatus-card__title">Controlled Subject Taxonomy</h3>
          <span class="apparatus-card__count">${subjects.length} Categories</span>
        </div>
        <p class="apparatus-card__note">Thematic categories indexed for textual cross-referencing:</p>
        <div class="subject-tags-grid">
          ${subjects
            .map(
              (s) => `
            <a class="subject-pill" href="/hadith/?subject=${encodeURIComponent(s.label_en)}">
              <span>${escapeHtml(s.label_en)}</span>
              <span class="subject-pill__arrow">→</span>
            </a>`
            )
            .join('')}
        </div>
      </div>`);
  }

  return `
    <section class="record-section" aria-labelledby="apparatus-heading">
      ${sectionHeader(
        'Text-Critical Apparatus',
        'apparatus-heading',
        'Apparatus, Lexicon &amp; Taxonomy',
        'Cross-attestation statistics indicate circulation across canonical compilations. Vocabulary notes isolate archaic terminology.'
      )}
      <div class="apparatus-grid${detailCardCount === 1 ? ' apparatus-grid--single-detail' : ''}">${cards.join('')}</div>
    </section>`;
}

export function renderHadithRecord(detail: HadithDetail, id: number): string {
  const { hadith } = detail;
  const paths = groupPaths(detail.chain);
  const totalParallels =
    Number(hadith.parallel_count || 0) +
    Number(hadith.witness_count || 0) +
    Number(hadith.variant_count || 0);

  const matnIsDistinct =
    Boolean(hadith.matn_ar) && String(hadith.matn_ar).trim() !== String(hadith.text_ar).trim();
  const hasApparatus =
    totalParallels > 0 || detail.glosses.length > 0 || detail.subjects.length > 0;
  const supportingSections = [
    paths.size > 0 ? isnadSection(paths, detail) : '',
    hasApparatus ? apparatusSection(detail, totalParallels) : ''
  ].filter(Boolean);

  const matnSection = matnIsDistinct
    ? `<section class="record-section" aria-labelledby="matn-heading">
         ${sectionHeader(
           'Textual Artifact · Primary Speech',
           'matn-heading',
           'Substantive Matn (المتن)',
           'The operative verdict or substantive prophetic utterance, isolated from introductory transmission formulas for comparative text-critical analysis.'
         )}
         ${spread({
           modifier: ' critical-spread--matn',
           englishCaveat: 'Descriptive machine rendering · Unreviewed',
           english: hadith.matn_en,
           englishEmpty: 'No distinct translation recorded for this matn isolation.',
           arabicTag: 'نص المتن المجرد',
           arabicFolio: 'المتن العربي',
           arabic: hadith.matn_ar_diac || hadith.matn_ar || ''
         })}
       </section>`
    : '';

  return [
    heroMarkup(detail, id, paths.size, totalParallels),
    dockMarkup(matnIsDistinct, paths.size, hasApparatus),
    matnSection,
    `<section class="record-section" aria-labelledby="report-heading">
       ${sectionHeader(
         'Source Text · Full Report',
         'report-heading',
         'Full Arabic Report',
         'Source dataset transcription including compiler opening, transmission wording, chain, and matn. The English rendering is supplied separately and is not line-aligned.'
       )}
       ${spread({
         modifier: '',
         englishLabel: 'English report rendering',
         englishCaveat: 'Coverage may differ from source Arabic',
         english: hadith.text_en,
         englishEmpty: 'Translation not registered for this manuscript formulation.',
         arabicTag: 'الرواية المسندة في المصنف',
         arabicFolio: 'الأصل العربي',
         arabic: hadith.text_ar_diac || hadith.text_ar
       })}
    </section>`,
    supportingSections.length > 0
      ? `<div class="record-support-grid">${supportingSections.join('')}</div>`
      : ''
  ].join('');
}

function structureMarkup(detail: HadithDetail): string {
  const { hadith } = detail;
  if (!hadith.kitab_id) return '';
  return `
    <nav class="edition-source-path" aria-label="Compilation structure">
      <span class="edition-source-path__item">Kitāb ${hadith.kitab_ordinal}</span>
      <span class="edition-source-path__title" lang="ar" dir="rtl">${renderArabic(hadith.kitab_ar || '')}</span>
      ${
        hadith.bab_id
          ? `<span class="edition-source-path__separator" aria-hidden="true">/</span>
             <span class="edition-source-path__item">Bāb ${hadith.bab_ordinal}</span>
             <span class="edition-source-path__title" lang="ar" dir="rtl">${renderArabic(hadith.bab_ar || '')}</span>`
          : `<span class="edition-source-path__note">No separate Bāb label recorded for this report</span>`
      }
    </nav>`;
}

function referenceSummaryMarkup(detail: HadithDetail): string {
  const reference = detail.references[0];
  if (!reference) return '<span class="ledger-meta">No printed page marker recorded</span>';
  const markers = detail.references.map((item) => escapeHtml(item.source_marker)).join(' ');
  return `
    <div class="edition-reference-summary">
      <span>${escapeHtml(detail.hadith.book_en)} · First edition · ${reference.volume_count} volumes · ${reference.year_hijri} AH / ${reference.year_gregorian} CE</span>
      <span class="edition-reference-summary__pages">${markers}</span>
      <span class="edition-reference-summary__ar" lang="ar" dir="rtl">${escapeHtml(reference.work_title_ar)} · ${escapeHtml(reference.publisher_ar)} · ${escapeHtml(reference.publication_place_ar)} · ${escapeHtml(reference.edition_statement_ar)}</span>
    </div>`;
}

function citationText(detail: HadithDetail, id: number): string {
  const { hadith } = detail;
  const edition = detail.references[0];
  const pages = detail.references
    .map((reference) => `vol. ${reference.volume}, p. ${reference.page}`)
    .join('; ');
  const pageCitation = pages ? `; ${pages}` : '';
  const editionCitation = edition
    ? `; ${edition.publisher_ar}, ${edition.edition_statement_ar}, ${edition.publication_place_ar}`
    : '';
  return `${hadith.book_en}${hadith.hadith_num ? ` no. ${hadith.hadith_num}` : ''}${pageCitation}${editionCitation} (HadithCritic corpus record #${id})`;
}

/** A record that cannot be shown. The badge says why, because they differ. */
function degraded(badge: string, title: string, body: string): string {
  return `
    <div class="hadith-degraded">
      <span class="hadith-degraded__badge">${escapeHtml(badge)}</span>
      <h1 class="hadith-degraded__title">${escapeHtml(title)}</h1>
      <p class="hadith-degraded__text">${escapeHtml(body)}</p>
      <div class="hadith-degraded__actions">
        <a class="hc-btn" href="/hadith/">← Return to Corpus Index</a>
      </div>
    </div>`;
}

/* -------------------------------------------------------------------------- */
/* Behaviour                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Scrollspy and citation copying.
 *
 * Bound after each render rather than once at load, because the nodes it
 * listens to did not exist when the module started.
 */
function bindRecordBehaviour(): void {
  const jumpBar = document.getElementById('edition-jump-bar');
  if (jumpBar) {
    const links = Array.from(jumpBar.querySelectorAll('.dock-link')) as HTMLAnchorElement[];
    const targets = links
      .map((link) => document.querySelector(link.getAttribute('href') || '') as HTMLElement | null)
      .filter((el): el is HTMLElement => Boolean(el));

    if (targets.length) {
      const setActive = (targetId: string) => {
        for (const link of links) {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${targetId}`);
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActive(visible[0].target.id);
        },
        { rootMargin: '-35% 0px -45% 0px', threshold: 0 }
      );
      targets.forEach((el) => observer.observe(el));
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const link of links) {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href')?.slice(1);
        const target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', `#${targetId}`);
      });
    }
  }

  const citeBtn = document.getElementById('edition-cite-btn') as HTMLButtonElement | null;
  if (citeBtn && navigator.clipboard) {
    citeBtn.hidden = false;
    const label = citeBtn.querySelector('[data-cite-label]');
    const originalLabel = label?.textContent || 'Copy Citation';
    citeBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(citeBtn.dataset.citation || '');
        citeBtn.dataset.copied = 'true';
        if (label) label.textContent = 'Copied to Clipboard ✓';
        setTimeout(() => {
          citeBtn.dataset.copied = 'false';
          if (label) label.textContent = originalLabel;
        }, 2200);
      } catch {
        // Clipboard denied. The citation is still selectable on the page.
      }
    });
  }
}

/**
 * Deep links land on a fragment that does not exist until this has run, so the
 * browser's own scroll-to-anchor has already failed by now. Repeat it.
 */
async function honourFragment(): Promise<void> {
  const id = location.hash.slice(1);
  if (!id) return;
  await document.fonts.ready;
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
}

export async function initHadithRecord(): Promise<void> {
  const container = document.querySelector('.hadith-container') as HTMLElement | null;
  if (!container) return;

  const id = Number(container.dataset.hadithId);
  if (!Number.isFinite(id) || id <= 0) {
    container.innerHTML = degraded(
      'Not a reference',
      'Not a narration reference',
      'That address does not name a record in the corpus. The corpus index lists every collection.'
    );
    return;
  }

  try {
    const detail = await getHadithDetail(id);

    if (!detail) {
      container.innerHTML = degraded(
        'No such record',
        `Narration #${id} is not in this corpus`,
        'No record carries that identifier. It may belong to a different corpus version, or the link may be mistyped.'
      );
      document.title = `Narration #${id} not found | HadithCritic`;
      return;
    }

    container.innerHTML = renderHadithRecord(detail, id);

    // The shell could not know the collection or the chapter, so the tab and
    // the address bar are corrected once the record is in hand.
    const reference = referenceLabel(detail);
    document.title = `${reference} · Hadith ${id} | HadithCritic Critical Edition`;

    bindRecordBehaviour();
    honourFragment();
  } catch (error) {
    container.innerHTML = degraded(
      'Corpus Unavailable',
      `Narration #${id} could not be loaded`,
      error instanceof CorpusUnavailableError
        ? 'The static corpus could not be reached, so this record cannot be displayed. Articles and the rest of the site are unaffected.'
        : 'Something went wrong reading this record from the corpus.'
    );
  }
}
