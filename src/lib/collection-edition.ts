/**
 * The narration stream on a collection's source edition page.
 *
 * The page shell around it is prerendered, title, extent, the scoped search
 * form, because a collection's metadata is fixed for a corpus version and
 * belongs in the HTML a crawler sees. The narrations themselves are not: there
 * are 276,347 of them across 11,054 pages, which is not a thing to prerender,
 * so they are read here from the static corpus by id order.
 *
 * Paging is seek-based rather than OFFSET-based, and the pager is real anchors
 * rather than buttons. Both are deliberate. `WHERE id > ? LIMIT 25` reads
 * twenty-five index entries wherever the reader is in a 39,096-narration
 * volume, where `OFFSET 39000` walks and discards thirty-nine thousand; and an
 * anchor is a link that can be opened in a new tab, copied, or followed with
 * JavaScript off, which a button listened to by this module is not.
 */

import { CorpusUnavailableError, getCollectionRows, type HadithRecord } from './corpus-client';
import { escapeHtml } from './snippet';
import { renderArabic, toPlainText } from './format-text';

const PREVIEW_AR = 420;
const PREVIEW_EN = 380;

/** Cut at a word boundary when one is close enough to the limit to look intended. */
function preview(text: string, limit: number): { text: string; cut: boolean } {
  const clean = (text || '').trim();
  if (clean.length <= limit) return { text: clean, cut: false };
  const space = clean.lastIndexOf(' ', limit);
  return { text: clean.slice(0, space > limit * 0.6 ? space : limit), cut: true };
}

const slugifyChapter = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

function chapterLandmark(id: string, en: string, ar: string): string {
  return `
    <header class="chapter-landmark" id="${escapeHtml(id)}">
      <div class="chapter-landmark__rule" aria-hidden="true"></div>
      <div class="chapter-landmark__content">
        ${ar ? `<p class="chapter-landmark__ar" lang="ar" dir="rtl">${escapeHtml(ar)}</p>` : ''}
        <h2 class="chapter-landmark__en">
          <a class="chapter-landmark__anchor" href="#${escapeHtml(id)}">
            <span class="chapter-landmark__symbol">§</span>
            <span>${escapeHtml(en)}</span>
          </a>
        </h2>
      </div>
    </header>`;
}

function narrationRecord(row: HadithRecord, bookTitle: string): string {
  const ar = preview(row.matn_ar || row.text_ar || '', PREVIEW_AR);
  const en = preview(toPlainText(row.matn_en || row.text_en || ''), PREVIEW_EN);
  const docket = row.hadith_num ? `№ ${escapeHtml(row.hadith_num)}` : `ID #${row.id}`;

  return `
    <article class="narration-record">
      <a class="narration-record__hitlink" href="/hadith/${row.id}">
        <div class="narration-record__meta-header">
          <div class="narration-record__docket">
            <span class="narration-record__num">${docket}</span>
            <span class="narration-record__source">${escapeHtml(bookTitle)}</span>
          </div>
          <span class="narration-record__detail-cta">
            <span>Inspect Apparatus</span>
            <span class="narration-record__arrow">→</span>
          </span>
        </div>

        <div class="narration-record__spread">
          <div class="narration-record__col narration-record__col--en">
            ${
              en.text
                ? `<p class="narration-record__prose-en">${escapeHtml(en.text)}${en.cut ? ' …' : ''}</p>`
                : '<p class="narration-record__missing">Translation not yet registered for this entry.</p>'
            }
          </div>
          <div class="narration-record__col narration-record__col--ar">
            <p class="narration-record__prose-ar" lang="ar" dir="rtl">${renderArabic(ar.text)}${
              ar.cut ? ' …' : ''
            }</p>
          </div>
        </div>

        <div class="narration-record__apparatus-strip">
          <div class="narration-record__tags">
            <span class="apparatus-tag">
              <span class="apparatus-tag__label">Chains:</span>
              <strong>${row.narrator_count} Transmitters</strong>
            </span>
            ${
              Number(row.parallel_count) > 0
                ? `<span class="apparatus-tag apparatus-tag--gold">
                     <span class="apparatus-tag__label">Witnesses:</span>
                     <strong>${Number(row.parallel_count).toLocaleString()} Parallels</strong>
                   </span>`
                : ''
            }
          </div>
          <span class="narration-record__corpus-ref">Corpus Record #${row.id}</span>
        </div>
      </a>
    </article>`;
}

function pager(slug: string, page: number, pages: number, rows: HadithRecord[]): string {
  const pageUrl = (n: number) => `/hadith/collection/${slug}?page=${n}`;
  const first = rows[0]?.id;
  const last = rows[rows.length - 1]?.id;
  const nextUrl = last ? `${pageUrl(page + 1)}&after=${last}` : pageUrl(page + 1);
  const prevUrl = first ? `${pageUrl(page - 1)}&before=${first}` : pageUrl(page - 1);

  const back =
    page > 1
      ? `<a class="edition-pager__link" href="${prevUrl}">← Previous Page</a>`
      : '<span class="edition-pager__link is-disabled" aria-disabled="true">← Previous Page</span>';
  const forward =
    page < pages
      ? `<a class="edition-pager__link" href="${nextUrl}">Next Page →</a>`
      : '<span class="edition-pager__link is-disabled" aria-disabled="true">Next Page →</span>';

  return `
    <nav class="edition-pager" aria-label="Collection sequential navigation">
      ${back}
      <span class="edition-pager__counter">
        Page <strong>${page.toLocaleString()}</strong> of <strong>${pages.toLocaleString()}</strong>
      </span>
      ${forward}
    </nav>`;
}

export async function initCollectionEdition(): Promise<void> {
  const container = document.getElementById('coll-client-container');
  if (!container) return;

  const bookId = Number(container.dataset.bookId);
  const slug = container.dataset.slug || '';
  const bookTitle = container.dataset.bookTitle || '';
  const size = Number(container.dataset.size) || 25;
  const total = Number(container.dataset.total) || 0;
  const pages = Math.max(1, Math.ceil(total / size));

  // The shell is one prerendered document per collection and is served for
  // every page of it, so the position has to come from the URL. Reading it from
  // a data attribute left the pager permanently claiming page 1 while showing
  // the right records.
  const params = new URLSearchParams(location.search);
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const readSeek = (key: string) => {
    const value = Number(params.get(key));
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  try {
    const rows = await getCollectionRows({
      bookId,
      size,
      page,
      after: readSeek('after'),
      before: readSeek('before')
    });

    if (!rows.length) {
      container.innerHTML =
        '<p class="coll-empty">No narrations are recorded for this collection at this position.</p>';
      return;
    }

    let lastChapter = '';
    let chapterOrdinal = 0;
    let html = '<div class="edition-records-stream">';

    for (const row of rows) {
      const chapter = toPlainText(row.chapter_en || '');
      if (chapter && chapter !== lastChapter) {
        lastChapter = chapter;
        chapterOrdinal += 1;
        html += chapterLandmark(
          `ch-${chapterOrdinal}-${slugifyChapter(chapter)}`,
          chapter,
          (row.chapter_ar || '').trim()
        );
      }
      html += narrationRecord(row, bookTitle);
    }

    html += '</div>';
    html += pager(slug, page, pages, rows);
    container.innerHTML = html;
  } catch (error) {
    const unavailable = error instanceof CorpusUnavailableError;
    container.innerHTML = `
      <p class="coll-error">
        ${
          unavailable
            ? 'The corpus could not be loaded, so this edition cannot be displayed right now. The rest of the site is unaffected.'
            : 'This edition could not be rendered.'
        }
        <button type="button" class="edition-pager__link" data-corpus-retry>Try again</button>
      </p>`;
    container.querySelector('[data-corpus-retry]')?.addEventListener('click', () => {
      location.reload();
    });
  }
}
