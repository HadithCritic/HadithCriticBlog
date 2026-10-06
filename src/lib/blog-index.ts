/* Blog archive: branch filter, full-text search and order.

   The archive is complete without this module: every study is listed by
   year, and each branch control is a real link to that branch's hub. With
   script, the branch links filter in place, the search field appears and
   reaches into the full text through /search-index.json, and the state is
   kept in the URL (?category=, ?q=, ?order=oldest) so a filtered view can be
   shared and survives a reload. */

interface SearchSection {
  heading: string;
  slug: string;
  text: string;
}

interface SearchDoc {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  sections: SearchSection[];
  fullText: string;
}

interface Match {
  section: SearchSection | null;
  snippet: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function snippetOf(text: string, term: string): string {
  const at = text.toLowerCase().indexOf(term);
  if (at === -1) return '';
  const start = Math.max(0, at - 70);
  const end = Math.min(text.length, at + term.length + 90);
  const body = `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
  return escapeHtml(body).replace(
    new RegExp(`(${escapeRegExp(escapeHtml(term))})`, 'gi'),
    '<mark class="search-match-mark">$1</mark>'
  );
}

/* The first section whose heading or text holds the term, else the full text. */
function findMatch(doc: SearchDoc | undefined, term: string): Match | null {
  if (!doc) return null;
  for (const section of doc.sections) {
    const inText = section.text.toLowerCase().includes(term);
    if (inText || section.heading.toLowerCase().includes(term)) {
      return { section, snippet: snippetOf(inText ? section.text : section.heading, term) };
    }
  }
  if (doc.fullText.toLowerCase().includes(term)) return { section: null, snippet: snippetOf(doc.fullText, term) };
  return null;
}

function initArchive(): void {
  const page = document.querySelector<HTMLElement>('.bi-page');
  /* DOMContentLoaded and astro:page-load can both fire; bind once. */
  if (!page || page.dataset.hcInit === 'true') return;
  page.dataset.hcInit = 'true';

  const chips = [...page.querySelectorAll<HTMLAnchorElement>('#bi-filters .bi-chip')];
  const rows = [...page.querySelectorAll<HTMLLIElement>('.bi-row')];
  const years = [...page.querySelectorAll<HTMLElement>('.bi-year')];
  const ledger = page.querySelector<HTMLElement>('#ledger');
  const input = page.querySelector<HTMLInputElement>('#archive-search-input');
  const clear = page.querySelector<HTMLButtonElement>('#archive-search-clear');
  const reset = page.querySelector<HTMLButtonElement>('#archive-reset-btn');
  const empty = page.querySelector<HTMLElement>('#ledger-empty');
  const emptyReset = page.querySelector<HTMLButtonElement>('#ledger-empty-reset');
  const status = page.querySelector<HTMLElement>('#archive-result-count .bi-status-text');
  /* Cast: the worker types in scope shadow the DOM's select element. */
  const order = page.querySelector('#archive-order') as unknown as HTMLSelectElement | null;

  page.querySelectorAll<HTMLElement>('[data-js-only]').forEach((element) => (element.hidden = false));

  let category = 'all';
  let query = '';

  /* Full-text index, fetched on the first search. */
  const docs = new Map<string, SearchDoc>();
  let indexRequest: Promise<void> | null = null;
  const loadIndex = (): Promise<void> => {
    indexRequest ??= fetch('/search-index.json')
      .then((response) => (response.ok ? (response.json() as Promise<SearchDoc[]>) : []))
      .then((list) => {
        list.forEach((doc) => docs.set(doc.id, doc));
        if (query) apply();
      })
      .catch(() => {
        /* Titles and abstracts still match without the full-text index. */
      });
    return indexRequest;
  };

  const syncUrl = (): void => {
    const url = new URL(location.href);
    if (category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (order?.value === 'oldest') url.searchParams.set('order', 'oldest');
    else url.searchParams.delete('order');
    history.replaceState(null, '', url);
  };

  const setCategory = (requested: string): void => {
    const wanted = requested.trim().toLowerCase();
    const chip = chips.find((item) => (item.dataset.filter ?? '').toLowerCase() === wanted) ?? chips[0];
    category = chip?.dataset.filter ?? 'all';
    for (const item of chips) {
      const active = item === chip;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    }
  };

  const renderMatch = (row: HTMLLIElement, match: Match | null): void => {
    const id = row.dataset.id ?? '';
    const link = row.querySelector<HTMLAnchorElement>('.bi-row__link');
    const box = row.querySelector<HTMLElement>('.bi-row__match');
    const desc = row.querySelector<HTMLElement>('.bi-row__desc');
    link?.setAttribute('href', match?.section?.slug ? `/blogs/${id}/#${match.section.slug}` : `/blogs/${id}/`);
    if (!box) return;
    if (match?.snippet) {
      const where = match.section ? match.section.heading : 'the text of the study';
      box.innerHTML =
        `<p class="bi-match__where">Matched in ${escapeHtml(where)}</p>` +
        `<p class="bi-match__text">${match.snippet}</p>`;
      box.hidden = false;
      if (desc) desc.hidden = true;
    } else {
      box.innerHTML = '';
      box.hidden = true;
      if (desc) desc.hidden = false;
    }
  };

  const apply = (): void => {
    let visible = 0;
    for (const row of rows) {
      const inBranch = category === 'all' || row.dataset.category === category;
      let match: Match | null = null;
      let matches = !query;
      if (query) {
        match = findMatch(docs.get(row.dataset.id ?? ''), query);
        matches = (row.dataset.search ?? '').includes(query) || match !== null;
      }
      const show = inBranch && matches;
      row.hidden = !show;
      renderMatch(row, show ? match : null);
      if (show) visible += 1;
    }

    for (const year of years) {
      const shown = year.querySelectorAll('.bi-row:not([hidden])').length;
      year.hidden = shown === 0;
      const count = year.querySelector<HTMLElement>('.bi-year__count');
      if (count) {
        const total = Number(count.dataset.total ?? shown);
        const noun = (n: number) => (n === 1 ? 'study' : 'studies');
        count.textContent = shown === total ? `${total} ${noun(total)}` : `${shown} of ${total} ${noun(total)}`;
      }
    }

    if (empty) empty.hidden = visible > 0;
    if (reset) reset.hidden = category === 'all' && !query;
    if (clear) clear.hidden = !query;

    if (status) {
      const noun = visible === 1 ? 'study' : 'studies';
      const branch = category === 'all' ? '' : ` in <strong>${escapeHtml(category)}</strong>`;
      status.innerHTML = query
        ? `<strong>${visible}</strong> ${noun} matching “${escapeHtml(query)}”${branch}`
        : category === 'all'
          ? `<strong>${visible}</strong> studies in the archive`
          : `<strong>${visible}</strong> ${noun}${branch}`;
    }
  };

  /* Newest first is the server order; oldest first reverses years and rows. */
  const sort = (): void => {
    if (!ledger) return;
    const oldest = order?.value === 'oldest';
    const direction = oldest ? 1 : -1;
    [...years]
      .sort((a, b) => (Number(a.dataset.year) - Number(b.dataset.year)) * direction)
      .forEach((year) => {
        const list = year.querySelector('.bi-ledger');
        if (list) {
          [...list.querySelectorAll<HTMLLIElement>('.bi-row')]
            .sort((a, b) => (Number(a.dataset.timestamp) - Number(b.dataset.timestamp)) * direction)
            .forEach((row) => list.appendChild(row));
        }
        ledger.appendChild(year);
      });
  };

  const resetAll = (): void => {
    query = '';
    if (input) input.value = '';
    setCategory('all');
    syncUrl();
    apply();
  };

  for (const chip of chips) {
    chip.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      setCategory(chip.dataset.filter ?? 'all');
      syncUrl();
      apply();
    });
  }

  input?.addEventListener('input', () => {
    query = input.value.trim().toLowerCase();
    if (query) void loadIndex();
    syncUrl();
    apply();
  });

  input?.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !input.value) return;
    input.value = '';
    query = '';
    syncUrl();
    apply();
  });

  clear?.addEventListener('click', () => {
    if (input) {
      input.value = '';
      input.focus();
    }
    query = '';
    syncUrl();
    apply();
  });

  order?.addEventListener('change', () => {
    sort();
    syncUrl();
  });

  reset?.addEventListener('click', resetAll);
  emptyReset?.addEventListener('click', resetAll);

  page.querySelector<HTMLFormElement>('#archive-search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    input?.dispatchEvent(new Event('input'));
  });

  /* Deep links. */
  const params = new URLSearchParams(location.search);
  setCategory(params.get('category') ?? 'all');
  const requested = params.get('q');
  if (requested && input) {
    input.value = requested;
    query = requested.trim().toLowerCase();
    void loadIndex();
  }
  if (order && params.get('order') === 'oldest') {
    order.value = 'oldest';
    sort();
  }
  apply();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArchive, { once: true });
} else {
  initArchive();
}
document.addEventListener('astro:page-load', initArchive);
