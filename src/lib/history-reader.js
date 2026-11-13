/* Behavior for a history reading page (styles in history-reader.css): text
   size, the contents drawer and its filter, the heading being read, reading
   progress, note popovers, the translation notes panel, and remembering the
   page so the title page can offer to continue. */
import { wireFilter, writeLast } from './history-contents.js';

const SIZE_KEY = 'hc-history-reader-fs';
const SIZE_MIN = 16;
const SIZE_MAX = 27;

const reader = document.querySelector('[data-hx-reader]');
if (reader) init(reader);

/** @param {HTMLElement} root */
function init(root) {
  const body = document.body;
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];
  const narrow = () => matchMedia('(max-width: 1023px)').matches;
  const store = (key, value) => {
    try {
      if (value !== undefined) localStorage.setItem(key, value);
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const text = $('[data-hx-text]');
  const content = $('[data-hx-body]');
  const bar = $('[data-hx-bar]');

  writeLast(root.dataset.book, { href: location.pathname, label: root.dataset.pageTitle });

  // ---------- text size ----------
  let size = Number(store(SIZE_KEY)) || 0;
  const applySize = () => {
    if (size) root.style.setProperty('--hx-fs', `${size}px`);
    else root.style.removeProperty('--hx-fs');
  };
  const currentSize = () => parseFloat(getComputedStyle(content).fontSize) || 20;
  applySize();
  for (const button of $$('[data-hx-size]')) {
    button.addEventListener('click', () => {
      size = Math.min(SIZE_MAX, Math.max(SIZE_MIN, Math.round(size || currentSize()) + Number(button.dataset.hxSize)));
      store(SIZE_KEY, String(size));
      applySize();
    });
  }

  // ---------- contents drawer ----------
  const rail = $('[data-hx-rail]');
  const navButton = $('[data-hx-nav]');
  const setNav = (open) => {
    body.classList.toggle('hx-nav-open', open);
    navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  navButton.addEventListener('click', () => { closeNotes(); setNav(!body.classList.contains('hx-nav-open')); });
  $('[data-hx-nav-close]').addEventListener('click', () => { setNav(false); navButton.focus(); });
  $('[data-hx-scrim]').addEventListener('click', () => { setNav(false); closeNotes(); });
  const filter = $('[data-hx-filter]', rail);
  wireFilter(filter, $('[data-hx-contents]', rail));
  rail.classList.add('is-enhanced');
  const current = $('[aria-current="page"]', rail);
  if (current) {
    const scroller = $('.hx-rail__scroll', rail);
    scroller.scrollTop = current.offsetTop - scroller.clientHeight / 3;
  }

  // ---------- note popovers ----------
  const pop = $('#pop');
  root.addEventListener('click', (event) => {
    const link = event.target.closest('.note-ref a');
    if (!link) {
      if (!event.target.closest('#pop')) pop.hidden = true;
      return;
    }
    const note = document.getElementById(link.hash.slice(1));
    const source = note?.querySelector('.nb');
    if (!source) return;
    event.preventDefault();
    const copy = source.cloneNode(true);
    copy.querySelectorAll('.note-back').forEach((back) => back.remove());
    const label = document.createElement('strong');
    label.textContent = `Note ${link.textContent}`;
    const noteBody = document.createElement('div');
    noteBody.append(...copy.childNodes);
    const go = document.createElement('a');
    go.href = link.hash;
    go.textContent = 'Go to the note';
    go.addEventListener('click', () => { pop.hidden = true; });
    pop.replaceChildren(label, noteBody, go);
    pop.hidden = false;
    const box = link.getBoundingClientRect();
    const frame = root.getBoundingClientRect();
    pop.style.top = `${box.bottom - frame.top + 10}px`;
    pop.style.left = `${Math.max(8, Math.min(box.left - frame.left - 40, frame.width - pop.offsetWidth - 8))}px`;
  });

  // ---------- translation notes panel ----------
  const panel = $('[data-hx-panel]');
  const notesButton = $('[data-hx-notes]');
  const place = { part: '', year: '' };
  let mode = 'here';
  function showNotes() {
    if (!panel) return;
    let shown = 0;
    for (const note of $$('.tn', panel)) {
      const hit = mode === 'all' || (place.year ? note.dataset.year === place.year : !note.dataset.year);
      note.hidden = !hit;
      if (hit) shown += 1;
    }
    $('[data-hx-panel-empty]', panel).hidden = shown !== 0;
  }
  function setNotes(open) {
    if (!panel) return;
    body.classList.toggle('hx-notes-open', open);
    notesButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeNotes() { setNotes(false); }
  if (panel) {
    notesButton.addEventListener('click', () => { setNav(false); setNotes(!body.classList.contains('hx-notes-open')); });
    $('[data-hx-notes-close]', panel).addEventListener('click', () => { closeNotes(); notesButton.focus(); });
    for (const tab of $$('.hx-panel__tabs button', panel)) {
      tab.addEventListener('click', () => {
        mode = tab.dataset.mode;
        $$('.hx-panel__tabs button', panel).forEach((other) => other.setAttribute('aria-selected', other === tab ? 'true' : 'false'));
        showNotes();
      });
    }
    panel.addEventListener('click', (event) => { if (event.target.closest('.tn-go') && narrow()) closeNotes(); });
  }

  addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    pop.hidden = true;
    setNav(false);
    closeNotes();
  });
  root.addEventListener('click', (event) => {
    if (event.target.closest('.hx-rail a') && narrow()) setNav(false);
  });

  // ---------- where the reader is ----------
  const here = $('[data-hx-here]');
  const progress = $('[data-hx-progress]');
  const outline = $('[data-hx-outline]');
  const links = new Map($$('a', outline ?? document.createElement('div')).map((link) => [link.hash.slice(1), link]));
  const marks = $$('h3[id], h4[id], p.label[id], p.subhead[id], section.gathered[id]', content);
  const chapterTitle = here.textContent;
  const firstYear = marks.find((item) => item.matches('h3.year')) ?? null;
  const undated = panel ? $$('.tn', panel).some((note) => !note.dataset.year) : false;
  const line = () => bar.getBoundingClientRect().bottom + innerHeight * 0.16;
  let lastIndex = -2;

  function locate() {
    const at = line();
    let low = 0;
    let high = marks.length - 1;
    let best = -1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (marks[middle].getBoundingClientRect().top <= at) { best = middle; low = middle + 1; } else high = middle - 1;
    }
    return best;
  }

  function mark() {
    const box = text.getBoundingClientRect();
    const span = box.height - innerHeight * 0.55;
    const done = span > 0 ? Math.min(1, Math.max(0, (line() - box.top) / span)) : 0;
    progress.style.transform = `scaleX(${done})`;
    bar.classList.toggle('is-reading', box.top < bar.getBoundingClientRect().bottom - 8);

    const index = locate();
    if (index === lastIndex) return;
    lastIndex = index;
    const currentMark = marks[index];
    for (const link of links.values()) link.removeAttribute('aria-current');
    const link = currentMark ? links.get(currentMark.id) : null;
    if (link) {
      link.setAttribute('aria-current', 'true');
      const frame = outline.getBoundingClientRect();
      const item = link.getBoundingClientRect();
      if (item.top < frame.top + 24 || item.bottom > frame.bottom - 24) outline.scrollTop += item.top - frame.top - frame.height / 3;
    }
    // The bar names the nearest year, account or chapter heading above the reading line.
    let label = chapterTitle;
    for (let i = index; i >= 0; i -= 1) {
      const candidate = marks[i];
      if (candidate.matches('h3, section.gathered')) {
        label = (candidate.matches('section') ? candidate.querySelector('.ch-title') : candidate.querySelector('.year-n') ?? candidate)?.textContent ?? label;
        break;
      }
    }
    here.textContent = label.replace(/\s+/g, ' ').trim();
    if (panel) {
      // Above the first year of a page whose notes all belong to years, that first year is where the reader is.
      const year = marks.slice(0, index + 1).reverse().find((item) => item.matches('h3.year')) ?? (undated ? null : firstYear);
      place.year = year ? year.id : '';
      place.part = root.dataset.page;
      showNotes();
    }
  }

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mark(); });
  }, { passive: true });
  addEventListener('resize', () => { lastIndex = -2; mark(); });
  showNotes();
  mark();

  // A link to a place on the page lands there once the text and fonts have settled.
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target && root.contains(target)) {
    const go = () => target.scrollIntoView({ block: 'start' });
    go();
    document.fonts?.ready.then(go);
  }
}
