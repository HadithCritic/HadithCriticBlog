/** Progressive enhancement of the static catalogue; never queries the corpus. */
export function initCorpusCatalogue(): void {
  const root = document.querySelector<HTMLElement>('[data-corpus-catalogue]');
  const list = root?.querySelector<HTMLOListElement>('.catalog-ledger');
  if (!root || !list || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const rows = Array.from(list.querySelectorAll<HTMLElement>('.catalog-row'));
  const query = root.querySelector<HTMLInputElement>('[data-catalogue-query]');
  // The project's server/client DOM declarations disagree on select.remove().
  // Match the existing collection browser's boundary cast.
  const period = root.querySelector('[data-catalogue-period]') as unknown as HTMLSelectElement | null;
  const type = root.querySelector('[data-catalogue-type]') as unknown as HTMLSelectElement | null;
  const sort = root.querySelector('[data-catalogue-sort]') as unknown as HTMLSelectElement | null;
  const status = root.querySelector<HTMLElement>('[data-catalogue-status]');
  const empty = root.querySelector<HTMLElement>('[data-catalogue-empty]');
  const update = () => {
    const term = (query?.value || '').trim().toLocaleLowerCase();
    rows.sort((a, b) => {
      if (sort?.value === 'latest') return Number(b.dataset.year) - Number(a.dataset.year) || Number(a.dataset.order) - Number(b.dataset.order);
      if (sort?.value === 'size') return Number(b.dataset.count) - Number(a.dataset.count);
      if (sort?.value === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '');
      return Number(a.dataset.order) - Number(b.dataset.order);
    });
    let visible = 0;
    rows.forEach(row => {
      const year = Number(row.dataset.year);
      const matchesPeriod = !period?.value || (period.value === 'early' && year < 300)
        || (period.value === 'middle' && year >= 300 && year < 500) || (period.value === 'later' && year >= 500);
      row.hidden = !matchesPeriod || (!!type?.value && type.value !== row.dataset.type)
        || !(row.dataset.title || '').toLocaleLowerCase().includes(term);
      list.appendChild(row);
      if (!row.hidden) visible++;
    });
    if (status) status.textContent = `${visible} of ${rows.length} compilations`;
    if (empty) empty.hidden = visible > 0;
  };
  root.querySelectorAll<HTMLElement>('[data-catalogue-controls]').forEach(control => { control.hidden = false; });
  query?.addEventListener('input', update);
  [period, type, sort].forEach(select => select?.addEventListener('change', update));
  root.querySelector<HTMLButtonElement>('[data-catalogue-reset]')?.addEventListener('click', () => {
    if (query) query.value = '';
    if (period) period.value = '';
    if (type) type.value = '';
    if (sort) sort.value = 'earliest';
    update();
  });
  root.querySelectorAll<HTMLButtonElement>('[data-catalogue-view]').forEach(button => {
    button.addEventListener('click', () => {
      root.dataset.view = button.dataset.catalogueView;
      root.querySelectorAll<HTMLButtonElement>('[data-catalogue-view]').forEach(toggle => {
        toggle.setAttribute('aria-pressed', String(toggle === button));
      });
    });
  });
  update();
}
