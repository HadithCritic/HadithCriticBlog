/**
 * Filter, subject chips and sort for the book grid on a painted collection
 * front (PaintedBookIndex.astro). The text filter matches English and Arabic
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

type SortKey = 'book' | 'size';

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
  if (!input || !grid || !count || !empty || input.dataset.bound) return;
  input.dataset.bound = '1';

  const entries: Entry[] = [...grid.querySelectorAll<HTMLElement>('.pf-card')].map((card) => ({
    card,
    haystack: foldForSearch(`${card.dataset.pfEn ?? ''} ${card.dataset.pfAr ?? ''}`),
    group: card.dataset.pfGroup ?? '',
    n: Number(card.dataset.pfN),
    size: Number(card.dataset.pfSize)
  }));
  const bars = new Map(
    [...root.querySelectorAll<HTMLElement>('[data-pf-bar]')].map((bar) => [Number(bar.dataset.pfBar), bar])
  );
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-pf-chip]')];
  const sorts = [...root.querySelectorAll<HTMLButtonElement>('[data-pf-sort]')];
  const total = entries.length;
  let group = 'all';

  const apply = () => {
    const terms = foldForSearch(input.value).split(' ').filter(Boolean);
    const shown = entries.filter(({ card, haystack, group: own, n }) => {
      const match = (group === 'all' || own === group) && terms.every((term) => haystack.includes(term));
      card.hidden = !match;
      bars.get(n)?.toggleAttribute('data-dim', !match);
      return match;
    }).length;
    count.textContent = `${shown} shown · ${total} total`;
    empty.hidden = shown > 0;
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
      pressed(chips, chip);
      apply();
    });
  }

  /* Reordering the DOM, not just the picture, keeps the tab order true. */
  for (const button of sorts) {
    button.addEventListener('click', () => {
      pressed(sorts, button);
      const order = sortEntries(entries, button.dataset.pfSort === 'size' ? 'size' : 'book');
      order.forEach((entry) => grid.appendChild(entry.card));
    });
  }

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
}
