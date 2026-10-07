/**
 * A book page's chapters, filled from the static corpus when opened.
 *
 * Each chapter is a native <details> holding a link into the collection's
 * sequential edition, so it works with JavaScript off. With it on, opening a
 * chapter reads its narrations by id range, 25 at a time, and sets each one
 * as a parchment card: English on the left and first in the DOM, the Arabic
 * beside it, and a link to the full record. The cards are built here, so
 * their rules live in src/styles/kitab-page.css, which is global.
 */

import { CorpusUnavailableError, getRecordsInRange, type HadithRecord } from './corpus-client';
import { escapeHtml } from './snippet';
import { renderArabic, renderRich } from './format-text';

const SIZE = 25;

function cardMarkup(record: HadithRecord): string {
  const english = record.matn_en || record.text_en || '';
  const arabic = record.matn_ar || record.text_ar || '';
  const label = record.hadith_num ? `Hadith ${escapeHtml(record.hadith_num)}` : `Record ${record.id}`;
  const facts = [
    record.narrator_count ? `${record.narrator_count} in the chain` : '',
    record.parallel_count ? `${Number(record.parallel_count).toLocaleString()} parallel reports recorded` : ''
  ].filter(Boolean);
  return `
    <article class="kb-card-record" aria-label="${label}">
      <p class="kb-card-record__meta"><span class="kb-card-record__num">${label}</span></p>
      <div class="kb-card-record__spread">
        <div class="kb-card-record__en">${english ? renderRich(english) : '<span class="kb-card-record__none">No English is recorded for this report.</span>'}</div>
        <div class="kb-card-record__ar" lang="ar" dir="rtl">${renderArabic(arabic)}</div>
      </div>
      <p class="kb-card-record__foot">
        ${facts.map((fact) => `<span>${fact}</span>`).join('')}
        <a class="kb-card-record__open" href="/hadith/${record.id}/">Open the record</a>
      </p>
    </article>`;
}

async function fill(details: HTMLDetailsElement, bookId: number): Promise<void> {
  const body = details.querySelector<HTMLElement>('[data-records]');
  if (!body || details.dataset.state === 'loading' || details.dataset.state === 'done') return;
  const first = Number(details.dataset.first);
  const last = Number(details.dataset.last);
  const count = Number(details.dataset.count);
  const after = details.dataset.after ? Number(details.dataset.after) : null;
  details.dataset.state = 'loading';

  let list = body.querySelector<HTMLElement>('.kb-records');
  if (!list) {
    body.querySelector('.kb-chapter__fallback')?.setAttribute('hidden', '');
    list = document.createElement('div');
    list.className = 'kb-records';
    body.insertAdjacentElement('afterbegin', list);
  }
  body.querySelector('.kb-more')?.remove();
  const status = document.createElement('p');
  status.className = 'kb-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Reading these narrations from the corpus…';
  body.insertAdjacentElement('beforeend', status);

  try {
    const rows = await getRecordsInRange({ bookId, first, last, after, size: SIZE });
    status.remove();
    list.insertAdjacentHTML('beforeend', rows.map(cardMarkup).join(''));
    const shown = list.children.length;
    const lastRow = rows[rows.length - 1];
    if (lastRow && lastRow.id < last && shown < count) {
      details.dataset.after = String(lastRow.id);
      details.dataset.state = 'partial';
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'kb-more';
      more.textContent = `Show the next ${Math.min(SIZE, count - shown).toLocaleString()} of ${(count - shown).toLocaleString()} remaining`;
      more.addEventListener('click', () => void fill(details, bookId));
      body.insertAdjacentElement('beforeend', more);
    } else {
      details.dataset.state = 'done';
    }
  } catch (error) {
    status.textContent =
      error instanceof CorpusUnavailableError
        ? 'The corpus could not be reached, so these narrations cannot be shown here. The edition link below still works.'
        : 'These narrations could not be read from the corpus.';
    status.classList.add('kb-status--error');
    body.querySelector('.kb-chapter__fallback')?.removeAttribute('hidden');
    delete details.dataset.state;
  }
}

export function initKitabPage(): void {
  const root = document.querySelector<HTMLElement>('.kb[data-book-id]');
  if (!root) return;
  const bookId = Number(root.dataset.bookId);
  const chapters = Array.from(root.querySelectorAll<HTMLDetailsElement>('details.kb-chapter'));

  for (const details of chapters) {
    details.addEventListener('toggle', () => {
      if (details.open && !details.dataset.state) void fill(details, bookId);
    });
    if (details.open) void fill(details, bookId);
  }

  // A link to #chapter-n opens that chapter.
  const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (target instanceof HTMLDetailsElement) target.open = true;

  const expand = root.querySelector<HTMLButtonElement>('[data-expand-all]');
  if (expand && chapters.length > 1) {
    expand.hidden = false;
    expand.addEventListener('click', () => {
      const opening = chapters.some((details) => !details.open);
      for (const details of chapters) details.open = opening;
      expand.textContent = opening ? 'Close all chapters' : 'Open all chapters';
    });
  }
}
