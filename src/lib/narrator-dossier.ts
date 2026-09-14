/**
 * The rijāl dossier for one transmitter, rendered in the browser.
 *
 * /narrators/[id] is a shell. There are 20,950 transmitters, past what
 * Cloudflare will hold as prerendered assets, and there is no database behind
 * the site to ask at request time, so everything below the layout chrome is
 * built here from the static corpus.
 *
 * A faithful port of what the page used to render server side, class for class,
 * because the stylesheet is the same stylesheet. It moved in the same change
 * from the page's scoped block to `is:global`, since a node created by script
 * never carries the page's `data-astro-cid` attribute.
 *
 * The product rule this page exists under is unchanged and absolute: nothing
 * here grades anyone. Classical verdicts and jarḥ/taʿdīl statements are printed
 * as attributed source data, in neutral apparatus ink, with the critic and the
 * citation attached. There is no score, no badge and no colour doing evaluative
 * work: `rijal-stmt-verdict--jarh` and `--tadil` say which category a statement
 * belongs to, not whether the transmitter is to be believed.
 */

import {
  CorpusUnavailableError,
  getNarratorDossier,
  type Criticism,
  type NarratorDetail,
  type NarratorDossier,
  type Verdict
} from './corpus-client';
import { escapeHtml } from './snippet';
import { toPlainText } from './format-text';

const VERDICT_LABELS: Record<Verdict, string> = {
  jarh: 'Jarḥ',
  tadil: 'Taʿdīl',
  mixed: 'Mixed',
  unclassified: 'Unclassified'
};

const sectionHead = (id: string, title: string, sub: string) => `
  <div class="rijal-section__head">
    <h2 id="${id}" class="rijal-section__title">${title}</h2>
    <p class="rijal-section__sub">${sub}</p>
  </div>`;

const deathLine = (detail: NarratorDetail) =>
  detail.deathHijri ? `${detail.deathHijri} AH / ${detail.deathGregorian} CE` : 'Date not recorded';

function heroMarkup(detail: NarratorDetail): string {
  const badges = [
    detail.generation
      ? `<span class="rijal-badge rijal-badge--gen">${escapeHtml(detail.generation)}</span>`
      : '',
    detail.tabaqaNumber ? `<span class="rijal-badge">Ṭabaqa ${detail.tabaqaNumber}</span>` : '',
    detail.grade
      ? `<span class="rijal-badge rijal-badge--grade">${escapeHtml(detail.grade)}</span>`
      : '',
    ...(detail.flags || []).map(
      (f) => `<span class="rijal-badge rijal-badge--flag">${escapeHtml(f)}</span>`
    )
  ].join('');

  const place = detail.deathPlace ? ` (${detail.deathPlace})` : '';

  return `
    <header class="rijal-hero">
      <div class="rijal-hero__top">
        <a class="rijal-back" href="/narrators">
          <span class="rijal-back__arrow">←</span>
          <span>Rijāl Register</span>
        </a>
        <span class="rijal-id-pill">Transmitter #${detail.id}</span>
      </div>

      <div class="rijal-hero__names">
        <h1 class="rijal-name-en">${escapeHtml(detail.nameEn || detail.nameAr)}</h1>
        ${
          detail.nameAr
            ? `<p class="rijal-name-ar" dir="rtl" lang="ar">${escapeHtml(detail.nameAr)}</p>`
            : ''
        }
      </div>

      <div class="rijal-badges">${badges}</div>

      <div class="rijal-facts-grid">
        <div class="rijal-fact-card">
          <span class="rijal-fact-label">Death Notice</span>
          <span class="rijal-fact-val">${escapeHtml(deathLine(detail) + place)}</span>
        </div>
        <div class="rijal-fact-card">
          <span class="rijal-fact-label">Recorded Narrations</span>
          <span class="rijal-fact-val rijal-fact-val--num">${
            detail.hadithCount ? detail.hadithCount.toLocaleString() : '0'
          }</span>
        </div>
        <div class="rijal-fact-card">
          <span class="rijal-fact-label">Teachers</span>
          <span class="rijal-fact-val rijal-fact-val--num">${detail.teachers?.length || 0}</span>
        </div>
        <div class="rijal-fact-card">
          <span class="rijal-fact-label">Students</span>
          <span class="rijal-fact-val rijal-fact-val--num">${detail.students?.length || 0}</span>
        </div>
      </div>
    </header>`;
}

function verdictsSection(detail: NarratorDetail): string {
  const rows: [string, string, string][] = [
    ['Ibn Ḥajar al-ʿAsqalānī', detail.rankIbnHajarEn, detail.rankIbnHajar],
    ['al-Dhahabī', detail.rankDhahabiEn, detail.rankDhahabi],
    ['Ṭabaqa (Taqrīb al-Tahdhīb)', detail.tabaqaEn, detail.tabaqa],
    ['Creedal Attribution', detail.madhhabEn, detail.madhhab]
  ];
  const present = rows.filter(([, en, ar]) => en || ar);
  if (!present.length) return '';

  return `
    <section class="rijal-section" aria-labelledby="sec-verdicts">
      ${sectionHead(
        'sec-verdicts',
        'Scholarly Verdicts',
        'Evaluative classifications recorded by major bio-bibliographers, with facing English translation and Arabic phrasing.'
      )}
      <div class="rijal-verdicts-grid">
        ${present
          .map(
            ([who, en, ar]) => `
          <div class="rijal-verdict-card">
            <div class="rijal-verdict__auth">${escapeHtml(who)}</div>
            ${en ? `<p class="rijal-verdict__en">${escapeHtml(en)}</p>` : ''}
            ${ar ? `<p class="rijal-verdict__ar" dir="rtl" lang="ar">${escapeHtml(ar)}</p>` : ''}
          </div>`
          )
          .join('')}
      </div>
    </section>`;
}

function deathNoticeSection(detail: NarratorDetail): string {
  if (!detail.deathDate) return '';
  return `
    <section class="rijal-section" aria-labelledby="sec-death">
      ${sectionHead(
        'sec-death',
        'Death Notice',
        'Preserved verbatim from the biographical manuscripts, noting variant dates and locations.'
      )}
      <div class="rijal-quote-card">
        <p class="rijal-arabic-quote" dir="rtl" lang="ar">${escapeHtml(detail.deathDate)}</p>
      </div>
    </section>`;
}

function presenceSection(detail: NarratorDetail): string {
  if (!detail.books?.length) return '';
  const maxBook = detail.books[0]?.count || 1;
  const maxPos = Math.max(1, ...(detail.positions || []).map((p) => p.count));

  const positions = detail.positions?.length
    ? `
      <div class="rijal-position-block">
        <h3 class="rijal-subhead">Position in the Transmission Chain</h3>
        <p class="rijal-note">
          Position 0 denotes the earliest tier (Companion/Successor); higher positions indicate
          transmitters nearer to the compiler.
        </p>
        <div class="rijal-bars-card rijal-bars-card--sub">
          <ul class="rijal-bars rijal-bars--compact">
            ${detail.positions
              .map(
                (p) => `
              <li class="rijal-bar">
                <span class="rijal-bar__label">Tier ${p.pos}</span>
                <div class="rijal-bar__track">
                  <div class="rijal-bar__fill rijal-bar__fill--alt" style="width:${Math.max(
                    3,
                    (p.count / maxPos) * 100
                  )}%"></div>
                </div>
                <span class="rijal-bar__val">${p.count.toLocaleString()}</span>
              </li>`
              )
              .join('')}
          </ul>
        </div>
      </div>`
    : '';

  return `
    <section class="rijal-section" aria-labelledby="sec-presence">
      ${sectionHead(
        'sec-presence',
        'Presence in Canonical Collections',
        'Distribution of narrations across corpus works. Bars represent relative volume.'
      )}
      <div class="rijal-bars-card">
        <ul class="rijal-bars">
          ${detail.books
            .slice(0, 12)
            .map(
              (b) => `
            <li class="rijal-bar">
              <span class="rijal-bar__label">${escapeHtml(b.book)}</span>
              <div class="rijal-bar__track">
                <div class="rijal-bar__fill" style="width:${Math.max(
                  3,
                  (b.count / maxBook) * 100
                )}%"></div>
              </div>
              <span class="rijal-bar__val">${b.count.toLocaleString()}</span>
            </li>`
            )
            .join('')}
        </ul>
      </div>
      ${positions}
    </section>`;
}

function transmissionsSection(dossier: NarratorDossier): string {
  const { detail, transmissions, transmissionCount } = dossier;
  if (transmissionCount <= 0) return '';

  return `
    <section class="rijal-section" aria-labelledby="sec-transmissions">
      ${sectionHead(
        'sec-transmissions',
        'Recorded Hadith Narrations',
        `${transmissionCount.toLocaleString()} narrations in the corpus cite this transmitter. Below are key attestations ordered by parallel frequency.`
      )}

      <div class="rijal-transmissions-list">
        ${transmissions
          .map(
            (t) => `
          <a class="rijal-transmission-card" href="/hadith/${t.id}">
            <div class="rijal-tcard__header">
              <span class="rijal-tcard__src">${escapeHtml(t.book_en)} № ${escapeHtml(
                t.hadith_num
              )}</span>
              <span class="rijal-tcard__pill">Tier ${t.pos} of ${t.narrator_count}</span>
            </div>
            ${
              t.matn_en
                ? `<p class="rijal-tcard__matn">${escapeHtml(
                    toPlainText(t.matn_en).slice(0, 240)
                  )}…</p>`
                : ''
            }
            <div class="rijal-tcard__meta">
              <span class="rijal-meta-tag">${t.narrator_count} in chain</span>
              ${
                t.parallel_count > 0
                  ? `<span class="rijal-meta-tag">${t.parallel_count.toLocaleString()} parallels</span>`
                  : ''
              }
            </div>
          </a>`
          )
          .join('')}
      </div>

      <div class="rijal-view-more">
        <a class="rijal-btn rijal-btn--gold" href="/hadith?narrator=${detail.id}">
          View All ${transmissionCount.toLocaleString()} Narrations in Corpus →
        </a>
      </div>
    </section>`;
}

function attestedFormsSection(dossier: NarratorDossier): string {
  const forms = dossier.attestedForms;
  if (forms.length <= 1) return '';

  return `
    <section class="rijal-section" aria-labelledby="sec-forms">
      ${sectionHead(
        'sec-forms',
        'Attested Name Spellings in Isnāds',
        'Documented variations in chain formulas. Biographical indices map these variations to ensure consistent identity resolution.'
      )}
      <div class="rijal-forms-grid">
        ${forms
          .map(
            (f) => `
          <div class="rijal-form-card">
            <div class="rijal-form-card__top">
              <span lang="ar" dir="rtl" class="rijal-form-card__ar">${escapeHtml(f.surface)}</span>
              ${f.is_display === 1 ? '<span class="rijal-form-tag">Register Canonical</span>' : ''}
            </div>
            <span class="rijal-form-card__n">${f.n_mentions.toLocaleString()} attestations</span>
          </div>`
          )
          .join('')}
      </div>
    </section>`;
}

function chainsSection(dossier: NarratorDossier, linkable: Set<number>): string {
  const { detail, chainNames } = dossier;
  if (!detail.sampleChains?.length) return '';

  return `
    <section class="rijal-section" aria-labelledby="sec-chains">
      ${sectionHead(
        'sec-chains',
        'Representative Isnād Chains',
        'Transmission trajectories illustrating the path from origin to final compilation. This transmitter is highlighted in gold.'
      )}
      <div class="rijal-chains-container">
        ${detail.sampleChains
          .map(
            (chain) => `
          <div class="rijal-chain-card">
            <div class="rijal-chain-card__hdr">
              <span class="rijal-chain-src">${escapeHtml(chain.book)}${
                chain.number ? ` № ${escapeHtml(chain.number)}` : ''
              }</span>
              <span class="rijal-chain-len">${chain.path.length} transmitters</span>
            </div>
            <ol class="rijal-chain-path">
              ${chain.path
                .map((nid, idx) => {
                  const isSelf = nid === detail.id;
                  const displayName = chainNames[nid] || `#${nid}`;
                  const node = isSelf
                    ? `<span class="rijal-node__name rijal-node__name--active">${escapeHtml(
                        detail.nameEn || detail.nameAr
                      )}</span>`
                    : linkable.has(nid)
                      ? `<a class="rijal-node__name" href="/narrators/${nid}">${escapeHtml(
                          displayName
                        )}</a>`
                      : `<span class="rijal-node__name">${escapeHtml(displayName)}</span>`;
                  const sep =
                    idx < chain.path.length - 1
                      ? '<span class="rijal-node__sep">→</span>'
                      : '';
                  return `<li class="rijal-node ${isSelf ? 'rijal-node--self' : ''}">${node}${sep}</li>`;
                })
                .join('')}
            </ol>
          </div>`
          )
          .join('')}
      </div>
    </section>`;
}

function criticismSection(criticism: Criticism | null): string {
  if (!criticism) return '';

  const critics = [...criticism.critics].sort((a, b) => b.statements.length - a.statements.length);

  const tally = (Object.entries(criticism.tally) as [Verdict, number][])
    .filter(([, n]) => n > 0)
    .map(
      ([k, n]) => `<span class="rijal-tally-pill rijal-tally-pill--${k}">${VERDICT_LABELS[k]}: ${n}</span>`
    )
    .join('');

  const phenomena = criticism.phenomena?.length
    ? `<div class="rijal-phenomena-strip">${criticism.phenomena
        .map(
          (p) =>
            `<span class="rijal-phenom-tag">${escapeHtml(p.label)} (${p.statements.length})</span>`
        )
        .join('')}</div>`
    : '';

  return `
    <section class="rijal-section" aria-labelledby="sec-criticism">
      ${sectionHead(
        'sec-criticism',
        'Jarḥ &amp; Taʿdīl Apparatus',
        `${criticism.statementCount.toLocaleString()} authoritative statements recorded across ${
          criticism.criticCount
        } traditional critics.`
      )}

      <div class="rijal-tally-bar">${tally}</div>
      ${phenomena}

      <div class="rijal-critics-stack">
        ${critics
          .map(
            (g) => `
          <details class="rijal-critic-accordion">
            <summary class="rijal-critic-summary">
              <span class="rijal-critic-name" dir="rtl" lang="ar">${escapeHtml(g.critic)}</span>
              <span class="rijal-critic-counter">${g.statements.length} statement${
                g.statements.length === 1 ? '' : 's'
              }</span>
            </summary>
            <ul class="rijal-critic-stmts">
              ${g.statements
                .map(
                  (s) => `
                <li class="rijal-critic-stmt rijal-critic-stmt--${s.verdict}">
                  <p class="rijal-stmt-arabic" dir="rtl" lang="ar">${escapeHtml(s.text)}</p>
                  <div class="rijal-stmt-meta">
                    <span class="rijal-stmt-verdict rijal-stmt-verdict--${s.verdict}">${
                      VERDICT_LABELS[s.verdict]
                    }</span>
                    ${
                      s.citation
                        ? `<cite class="rijal-stmt-cite" dir="rtl" lang="ar">${escapeHtml(
                            s.citation
                          )}</cite>`
                        : ''
                    }
                  </div>
                </li>`
                )
                .join('')}
            </ul>
          </details>`
          )
          .join('')}
      </div>
    </section>`;
}

function nomenclatureSection(detail: NarratorDetail): string {
  const nameRows: [string, string][] = [
    ['Full name', detail.fullName],
    ['Kunyah', detail.kunya],
    ['Nickname', detail.nickname],
    ['Lineage', detail.lineage],
    ['Relations', detail.relation]
  ];
  const present = nameRows.filter(([, v]) => v);
  if (!present.length && !detail.aliases?.length) return '';

  const dl = present.length
    ? `<dl class="rijal-dl">${present
        .map(
          ([label, value]) => `
        <div class="rijal-dl__row">
          <dt class="rijal-dl__term">${escapeHtml(label)}</dt>
          <dd class="rijal-dl__def" dir="auto">${escapeHtml(value)}</dd>
        </div>`
        )
        .join('')}</dl>`
    : '';

  const aliases = detail.aliases?.length
    ? `
      <div class="rijal-aliases-block">
        <h3 class="rijal-subhead">Recorded Alias Forms (${detail.aliasCount})</h3>
        <div class="rijal-aliases-wrap">
          ${detail.aliases
            .map(
              (a) => `
            <span class="rijal-alias-pill" dir="rtl" lang="ar">
              ${escapeHtml(a.form)}
              <span class="rijal-alias-n">${a.count}</span>
            </span>`
            )
            .join('')}
        </div>
      </div>`
    : '';

  return `
    <section class="rijal-section" aria-labelledby="sec-genealogy">
      ${sectionHead(
        'sec-genealogy',
        'Nomenclature &amp; Lineage',
        'Complete genealogical, tribal, and kunyah designations documented in biographical dictionaries.'
      )}
      <div class="rijal-names-card">${dl}${aliases}</div>
    </section>`;
}

function placesSection(detail: NarratorDetail): string {
  const journey = detail.placesEn?.length ? detail.placesEn : detail.placesAr || [];
  if (!journey.length) return '';

  return `
    <section class="rijal-section" aria-labelledby="sec-places">
      ${sectionHead(
        'sec-places',
        'Geographic Travels &amp; Residence',
        'Documented regions of scholarly travel (ṭalab al-ʿilm) and residence.'
      )}
      <div class="rijal-journey-card">
        <div class="rijal-journey-flow">
          ${journey
            .map(
              (p, idx) => `
            <div class="rijal-journey-stop">
              <span class="rijal-journey-name" dir="auto">${escapeHtml(p)}</span>
              ${idx < journey.length - 1 ? '<span class="rijal-journey-arrow">→</span>' : ''}
            </div>`
            )
            .join('')}
        </div>
      </div>
    </section>`;
}

function networkSection(detail: NarratorDetail, linkable: Set<number>): string {
  const teachers = detail.teachers || [];
  const students = detail.students || [];
  if (!teachers.length && !students.length) return '';

  const card = (title: string, people: typeof teachers) => `
    <div class="rijal-network-card">
      <div class="rijal-net-hdr">
        <h3 class="rijal-net-title">${title}</h3>
        <span class="rijal-net-count">${people.length}</span>
      </div>
      <ul class="rijal-net-list">
        ${people
          .map(
            (person) => `
          <li class="rijal-net-item">
            ${
              linkable.has(person.id)
                ? `<a class="rijal-net-link" href="/narrators/${person.id}">${escapeHtml(
                    person.name
                  )}</a>`
                : `<span class="rijal-net-plain">${escapeHtml(person.name)}</span>`
            }
            <span class="rijal-net-freq">${person.count.toLocaleString()}</span>
          </li>`
          )
          .join('')}
      </ul>
    </div>`;

  return `
    <section class="rijal-section" aria-labelledby="sec-network">
      ${sectionHead(
        'sec-network',
        'Transmission Network',
        'Primary scholarly lineages determined by isnād adjacency across the corpus.'
      )}
      <div class="rijal-network-grid">
        ${card('Teachers', teachers)}
        ${card('Students', students)}
      </div>
    </section>`;
}

export function renderNarratorDossier(dossier: NarratorDossier): string {
  const { detail } = dossier;
  // Only ids the corpus resolved to a name become links; the rest print as text
  // rather than pointing at a dossier that turns out to be empty.
  const linkable = new Set(Object.keys(dossier.chainNames).map(Number));

  return [
    heroMarkup(detail),
    verdictsSection(detail),
    deathNoticeSection(detail),
    presenceSection(detail),
    transmissionsSection(dossier),
    attestedFormsSection(dossier),
    chainsSection(dossier, linkable),
    criticismSection(dossier.criticism),
    nomenclatureSection(detail),
    placesSection(detail),
    networkSection(detail, linkable)
  ].join('');
}

/** A dossier that cannot be shown. The badge says why, because they differ. */
function degraded(badge: string, id: number, title: string, body: string): string {
  return `
    <div class="rijal-degraded">
      <div class="rijal-degraded__badge">${escapeHtml(badge)}</div>
      <h1 class="rijal-degraded__title">${escapeHtml(title)}</h1>
      <p class="rijal-degraded__text">${escapeHtml(body)}</p>
      <div class="rijal-degraded__actions">
        <a class="rijal-btn" href="/narrators">← Return to Rijāl Register</a>
        <a class="rijal-btn rijal-btn--gold" href="/hadith?narrator=${id}">Search Narrations for #${id}</a>
      </div>
    </div>`;
}

export async function initNarratorDossier(): Promise<void> {
  const page = document.querySelector('.rijal-page') as HTMLElement | null;
  if (!page) return;

  const id = Number(page.dataset.narratorId);
  if (!Number.isFinite(id) || id < 0) {
    page.innerHTML = degraded(
      'Not a reference',
      id,
      'Not a transmitter reference',
      'That address does not name an entry in the register.'
    );
    return;
  }

  try {
    const dossier = await getNarratorDossier(id);

    if (!dossier) {
      page.innerHTML = degraded(
        'No such entry',
        id,
        `Transmitter #${id} is not in this register`,
        'No entry carries that identifier. It may belong to a different corpus version, or the link may be mistyped.'
      );
      document.title = `Transmitter #${id} not found | HadithCritic`;
      return;
    }

    page.innerHTML = renderNarratorDossier(dossier);

    // The shell could not know whose dossier this is, so the tab is corrected
    // once the record is in hand.
    const name = dossier.detail.nameEn || dossier.detail.nameAr || `#${id}`;
    document.title = `${name} | Rijāl Dossier | HadithCritic`;

    const crumb = document.querySelector('[data-crumb-current]');
    if (crumb) crumb.textContent = name;
  } catch (error) {
    page.innerHTML = degraded(
      'Corpus Unavailable',
      id,
      `Transmitter #${id} could not be loaded`,
      error instanceof CorpusUnavailableError
        ? 'The static corpus could not be reached, so this dossier cannot be displayed. Articles and the rest of the site are unaffected.'
        : 'Something went wrong reading this dossier from the corpus.'
    );
  }
}
