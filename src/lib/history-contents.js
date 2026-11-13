/* Behavior shared by the history contents lists: the filter, the jump to a
   year or a report, the "continue reading" link, and the forwarding of links
   made when each book was a single page. Loaded by the title page; the reader
   script imports the pieces it needs. */

const LAST_KEY = 'hc-history-last';

/** @param {string} text */
export function fold(text) {
  return text.normalize('NFD').replace(/[̀-ͯʿʾʼ’']/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** The reader's last page in each book: { [book]: { href, label } }. */
export function readLast() {
  try {
    const stored = JSON.parse(localStorage.getItem(LAST_KEY) ?? '{}');
    return stored && typeof stored === 'object' ? stored : {};
  } catch {
    return {};
  }
}

/** @param {string} book @param {{ href: string, label: string }} place */
export function writeLast(book, place) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ ...readLast(), [book]: { ...place, at: Date.now() } }));
  } catch {
    /* Storage can be disabled by the reader. */
  }
}

/** Filters the rows of a contents list as the reader types.
    @param {HTMLInputElement} input @param {HTMLElement} list */
export function wireFilter(input, list) {
  const rows = [...list.querySelectorAll('[data-hx-row]')];
  const groups = [...list.querySelectorAll('[data-hx-group]')];
  const empty = list.querySelector('[data-hx-empty]');
  const apply = () => {
    const query = fold(input.value);
    let shown = 0;
    for (const row of rows) {
      const hit = !query || (row.dataset.search ?? '').includes(query);
      row.hidden = !hit;
      if (hit) shown += 1;
    }
    for (const group of groups) group.hidden = !group.querySelector('[data-hx-row]:not([hidden])');
    if (empty) empty.hidden = shown > 0;
    list.classList.toggle('is-filtering', Boolean(query));
  };
  input.addEventListener('input', apply);
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const first = list.querySelector('[data-hx-row]:not([hidden]) a');
    if (first && input.value.trim()) first.click();
  });
}

/** @param {HTMLFormElement} form */
function wireJump(form) {
  const input = form.querySelector('input');
  const note = form.querySelector('[data-hx-jump-note]');
  let index;
  try {
    index = JSON.parse(form.dataset.index ?? 'null');
  } catch {
    index = null;
  }
  if (!input || !index) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = Number(input.value);
    let href = null;
    if (form.dataset.hxJump === 'year') {
      href = index[value] ?? null;
      if (!href && note) {
        // A chronicle skips years it has nothing for: offer the nearest one before.
        const earlier = Object.keys(index).map(Number).filter((year) => year < value).sort((a, b) => b - a)[0];
        note.textContent = earlier === undefined ? `The book has no entry for the year ${value}.` : `The book has no entry for ${value}. The nearest before it is ${earlier}.`;
        if (earlier !== undefined) input.value = String(earlier);
      }
    } else {
      const page = index.find((item) => value >= item[0] && value <= item[1]);
      href = page ? `${page[2]}#report-${value}` : null;
      if (!href && note) note.textContent = `There is no report numbered ${value}.`;
    }
    if (href) location.assign(href);
  });
  input.addEventListener('input', () => { if (note) note.textContent = ''; });
}

function init() {
  const book = document.querySelector('[data-hx-book]');
  for (const list of document.querySelectorAll('[data-hx-contents]')) {
    const input = list.querySelector('[data-hx-filter]');
    if (input) wireFilter(input, list);
    list.querySelectorAll('[data-hx-jump]').forEach(wireJump);
  }

  // Continue reading: the title page of a book, and each book on the library page.
  const last = readLast();
  if (book) {
    const place = last[book.dataset.hxBook];
    const resume = book.querySelector('[data-hx-resume]');
    if (place && resume && typeof place.href === 'string' && place.href.startsWith('/projects/history/')) {
      resume.href = place.href;
      resume.textContent = `Continue: ${place.label}`;
      resume.hidden = false;
    }
  }
  for (const link of document.querySelectorAll('[data-hx-resume-book]')) {
    const place = last[link.dataset.hxResumeBook];
    if (place && typeof place.href === 'string' && place.href.startsWith('/projects/history/')) {
      link.href = place.href;
      link.hidden = false;
    }
  }

  // A link from when the whole book was one page: find the page that holds its anchor.
  const id = decodeURIComponent(location.hash.slice(1));
  if (book && id && !document.getElementById(id)) {
    fetch(`${location.pathname.replace(/\/?$/, '/')}anchors.json`)
      .then((response) => (response.ok ? response.json() : null))
      .then((anchors) => {
        const page = anchors?.[id];
        if (typeof page === 'string') location.replace(`${location.pathname.replace(/\/?$/, '/')}${page}/${page === id ? '' : `#${id}`}`);
      })
      .catch(() => { /* The title page still stands if the lookup fails. */ });
  }
}

if (document.querySelector('[data-hx-book], [data-hx-home]')) init();
