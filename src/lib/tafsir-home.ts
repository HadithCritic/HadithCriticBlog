/* The Tafsir front page's contents: one tab per commentary and a filter for
   the list on show. Without script the controls stay hidden and every list is
   printed in full, one after another. A link to #contents-<id> opens that
   commentary's tab. */

const HASH_PREFIX = '#contents-';

const fold = (s: string): string =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase().replace(/[ʿ‘’ʼʾ'`]/g, '').replace(/[\s-]/g, '');

export function initContents(): void {
  const root = document.querySelector<HTMLElement>('[data-contents]');
  if (!root) return;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-contents-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-contents-panel]')];
  const controls = root.querySelector<HTMLElement>('[data-contents-controls]');
  const search = root.querySelector<HTMLInputElement>('[data-contents-search]');
  if (!tabs.length || !panels.length || !controls) return;

  let active = tabs[0].dataset.contentsTab ?? '';

  const filter = (): void => {
    const query = fold(search?.value.trim() ?? '');
    const panel = panels.find((p) => p.dataset.contentsPanel === active);
    if (!panel) return;
    const items = [...panel.querySelectorAll<HTMLElement>('[data-contents-item]')];
    let shown = 0;
    items.forEach((item) => {
      const match = !query || fold(item.dataset.search ?? '').includes(query);
      item.hidden = !match;
      if (match) shown++;
    });
    panel.querySelectorAll<HTMLElement>('[data-contents-group]').forEach((group) => {
      group.hidden = !group.querySelector('[data-contents-item]:not([hidden])');
    });
    const count = panel.querySelector<HTMLElement>('[data-contents-count]');
    if (count) count.textContent = query ? `${shown} of ${items.length} shown` : (count.dataset.total ?? '');
    const empty = panel.querySelector<HTMLElement>('[data-contents-empty]');
    if (empty) empty.hidden = shown > 0;
  };

  const select = (id: string): void => {
    if (!tabs.some((tab) => tab.dataset.contentsTab === id)) return;
    active = id;
    tabs.forEach((tab) => {
      const on = tab.dataset.contentsTab === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => (panel.hidden = panel.dataset.contentsPanel !== id));
    filter();
  };

  const fromHash = (): void => {
    if (location.hash.startsWith(HASH_PREFIX)) select(location.hash.slice(HASH_PREFIX.length));
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.contentsTab ?? ''));
    tab.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      select(next.dataset.contentsTab ?? '');
      next.focus();
    });
  });
  search?.addEventListener('input', filter);
  window.addEventListener('hashchange', fromHash);

  controls.hidden = false;
  root.dataset.ready = 'true';
  select(active);
  fromHash();
}
