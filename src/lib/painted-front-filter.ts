/**
 * Search, section filters, sorting, view mode and progressive reveal for the
 * compilation index on a painted collection front (PaintedBookIndex.astro).
 * The text filter matches English and Arabic
 * titles, ignoring case,
 * Latin diacritics, the ʿayn and hamza marks, Arabic short vowels and the
 * variant forms of alif, yāʾ and tāʾ marbūṭa. A chip narrows the books to
 * one subject; the columns of the entries chart dim with the cards they
 * stand for.
 *
 * Ctrl/Cmd+K focuses the filter. Pressed again while the filter has focus,
 * the shortcut falls through to the site search, so both stay reachable.
 */

const ARABIC_FOLDS: ReadonlyArray<[RegExp, string]> = [
  [/[ً-ٰٟۖ-ۭـ]/g, ''],
  [/[أإآٱ]/g, 'ا'],
  [/ى/g, 'ي'],
  [/ة/g, 'ه'],
  [/[ؤ]/g, 'و'],
  [/[ئ]/g, 'ي']
];

export function foldForSearch(text: string): string {
  const latin = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[ʿʾ'’‘`]/g, '')
    .toLowerCase();
  const folded = ARABIC_FOLDS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), latin);
  return folded.replace(/\s+/g, ' ').trim();
}

interface Entry {
  card: HTMLElement;
  haystack: string;
  group: string;
  n: number;
  size: number;
}

type SortKey = 'book' | 'size' | 'alpha';

/** The cards in the order a sort asks for; book order breaks ties. */
export function sortEntries<T extends { n: number; size: number }>(entries: readonly T[], sort: SortKey): T[] {
  return [...entries].sort((a, b) => (sort === 'size' ? b.size - a.size || a.n - b.n : a.n - b.n));
}

const pressed = (buttons: readonly HTMLElement[], chosen: HTMLElement) =>
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === chosen)));

export function bindBookFilter(root: Document): void {
  const input = root.querySelector<HTMLInputElement>('[data-pf-filter]');
  const grid = root.querySelector<HTMLElement>('[data-pf-grid]');
  const count = root.querySelector<HTMLElement>('[data-pf-count]');
  const empty = root.querySelector<HTMLElement>('[data-pf-empty]');
  const more = root.querySelector<HTMLButtonElement>('[data-pf-more]');
  const remaining = root.querySelector<HTMLElement>('[data-pf-remaining]');
  if (!input || !grid || !count || !empty || input.dataset.bound) return;
  input.dataset.bound = '1';

  const entries: Entry[] = [...grid.querySelectorAll<HTMLElement>('.pf-card')].map((card) => ({
    card,
    haystack: foldForSearch(`${card.dataset.pfEn ?? ''} ${card.dataset.pfAr ?? ''}`),
    group: card.dataset.pfGroup ?? '',
    n: Number(card.dataset.pfN),
    size: Number(card.dataset.pfSize)
  }));
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-pf-chip]')];
  const sorts = [...root.querySelectorAll<HTMLButtonElement>('[data-pf-sort]')];
  const plural = grid.closest<HTMLElement>('[data-pf-index]')?.dataset.pfPlural ?? 'entries';
  let group = 'all';
  let limit = 24;
  let sort: SortKey = 'book';

  const apply = () => {
    const terms = foldForSearch(input.value).split(' ').filter(Boolean);
    entries.forEach(({ card }) => { card.hidden = true; });
    const matching = entries.filter(({ haystack, group: own }) =>
      (group === 'all' || own === group) && terms.every((term) => haystack.includes(term))
    );
    const ordered = sort === 'alpha'
      ? [...matching].sort((a, b) => foldForSearch(a.card.dataset.pfEn ?? '').localeCompare(foldForSearch(b.card.dataset.pfEn ?? '')) || a.n - b.n)
      : sortEntries(matching, sort);
    ordered.forEach((entry, i) => {
      grid.appendChild(entry.card);
      entry.card.hidden = i >= limit;
    });
    const shown = Math.min(ordered.length, limit);
    count.textContent = `Showing ${shown.toLocaleString()} of ${ordered.length.toLocaleString()} ${plural}`;
    empty.hidden = ordered.length > 0;
    if (more) more.hidden = shown >= ordered.length;
    if (remaining) {
      remaining.hidden = shown >= ordered.length;
      remaining.textContent = `${(ordered.length - shown).toLocaleString()} remaining`;
    }
  };

  input.addEventListener('input', apply);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      input.value = '';
      apply();
    }
  });

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      group = chip.dataset.pfChip ?? 'all';
      limit = 24;
      pressed(chips, chip);
      apply();
    });
  }

  /* Reordering the DOM, not just the picture, keeps the tab order true. */
  for (const button of sorts) {
    button.addEventListener('click', () => {
      sort = button.dataset.pfSort === 'size' ? 'size' : button.dataset.pfSort === 'alpha' ? 'alpha' : 'book';
      pressed(sorts, button);
      limit = 24;
      apply();
    });
  }

  // Index rows use one consistent text layout.

  more?.addEventListener('click', () => {
    limit += 24;
    apply();
  });

  window.addEventListener(
    'keydown',
    (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      if (root.activeElement === input) return;
      if (root.querySelector('dialog[open]')) return;
      event.preventDefault();
      event.stopPropagation();
      input.focus({ preventScroll: true });
      input.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    },
    { capture: true }
  );

  apply();
}
