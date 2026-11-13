/* Browser side of a narrators register page. Progressive enhancement:
   without it every name is a <details> that opens in place. With it a name
   opens in a dialog, the URL hash follows the open name, and the list can
   be filtered by name and grade. */

const fold = (text: string): string => text
  .normalize('NFD')
  .replace(/[̀-ًͯ-ْ]/g, '')
  .replace(/[أإآٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/[ʿʾ'’‘`]/g, '')
  .toLowerCase();

/* "2-3", "8,10-12", "0" → the set of ranks it names. */
const parseRanks = (value: string): Set<number> | null => {
  if (!value) return null;
  const out = new Set<number>();
  for (const part of value.split(',')) {
    const [lo, hi] = part.split('-').map(Number);
    for (let r = lo; r <= (hi ?? lo); r += 1) out.add(r);
  }
  return out;
};

interface DialogParts {
  dialog: HTMLDialogElement;
  no: HTMLElement;
  title: HTMLElement;
  ar: HTMLElement;
  meta: HTMLElement;
  body: HTMLElement;
}

const dialogParts = (): DialogParts | null => {
  const dialog = document.querySelector<HTMLDialogElement>('[data-rj-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return null;
  const pick = (sel: string): HTMLElement | null => dialog.querySelector<HTMLElement>(sel);
  const no = pick('[data-rj-dialog-no]');
  const title = pick('[data-rj-dialog-title]');
  const ar = pick('[data-rj-dialog-ar]');
  const meta = pick('[data-rj-dialog-meta]');
  const body = pick('[data-rj-dialog-body]');
  return no && title && ar && meta && body ? { dialog, no, title, ar, meta, body } : null;
};

const visibleRows = (register: HTMLElement): HTMLLIElement[] =>
  [...register.querySelectorAll<HTMLLIElement>('li.rj-row')].filter((li) => !li.hidden);

export function initRegister(): void {
  const register = document.querySelector<HTMLElement>('[data-rj-register]');
  const parts = dialogParts();
  if (!register || !parts) return;
  const { dialog } = parts;
  let current: HTMLLIElement | null = null;

  const fill = (row: HTMLLIElement): void => {
    const en = row.querySelector('.rj-name__en')?.textContent ?? '';
    const arName = row.querySelector('.rj-name__ar')?.textContent ?? '';
    parts.no.textContent = `Taqrīb no. ${row.querySelector('.rj-no')?.textContent ?? ''}`;
    parts.title.textContent = en || arName;
    parts.ar.textContent = en ? arName : '';
    parts.ar.hidden = !en;
    parts.meta.replaceChildren(...[...row.querySelectorAll('.rj-meta > *')].map((el) => el.cloneNode(true)));
    const body = row.querySelector('.rj-body');
    parts.body.replaceChildren(...(body ? [body.cloneNode(true)] : []));
    parts.body.scrollTop = 0;
  };

  const open = (row: HTMLLIElement, focusOrigin = true): void => {
    current = row;
    fill(row);
    history.replaceState(null, '', `#${row.id}`);
    if (!dialog.open) dialog.showModal();
    if (!focusOrigin) row.scrollIntoView({ block: 'center' });
  };

  const step = (delta: number): void => {
    if (!current) return;
    const rows = visibleRows(register);
    const next = rows[rows.indexOf(current) + delta];
    if (next) open(next, false);
  };

  register.addEventListener('click', (event) => {
    const mouse = event as MouseEvent;
    if (mouse.button !== 0 || mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey) return;
    const summary = (event.target as Element).closest('summary');
    const row = summary?.closest<HTMLLIElement>('li.rj-row');
    if (!summary || !row) return;
    event.preventDefault();
    open(row);
  });

  /* A link to a name on this page opens it here; other pages load. */
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
      return;
    }
    const a = (event.target as Element).closest<HTMLAnchorElement>('a[data-rj-link]');
    if (!a || new URL(a.href).pathname !== location.pathname) return;
    const row = document.getElementById(a.dataset.rjLink ?? '');
    if (row instanceof HTMLLIElement) {
      event.preventDefault();
      open(row, false);
    }
  });
  register.addEventListener('click', (event) => {
    const a = (event.target as Element).closest<HTMLAnchorElement>('a[data-rj-link]');
    if (!a || new URL(a.href).pathname !== location.pathname) return;
    const row = document.getElementById(a.dataset.rjLink ?? '');
    if (row instanceof HTMLLIElement) {
      event.preventDefault();
      open(row);
    }
  });

  dialog.querySelectorAll<HTMLButtonElement>('[data-rj-step]').forEach((button) => {
    button.addEventListener('click', () => step(Number(button.dataset.rjStep)));
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      if ((event.target as Element).closest('input, select, textarea')) return;
      step(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  dialog.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    current?.querySelector('summary')?.focus({ preventScroll: true });
  });

  const fromHash = (): void => {
    const row = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (row instanceof HTMLLIElement && row.classList.contains('rj-row')) open(row, false);
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();

  initFilter(register);
}

function initFilter(register: HTMLElement): void {
  const tools = document.querySelector<HTMLElement>('[data-rj-tools]');
  const find = tools?.querySelector('[data-rj-find]');
  const grade = tools?.querySelector('[data-rj-grade]');
  const count = tools?.querySelector<HTMLElement>('[data-rj-count]');
  if (!tools || !(find instanceof HTMLInputElement) || !(grade instanceof HTMLSelectElement) || !count) return;
  tools.hidden = false;

  const rows = [...register.querySelectorAll<HTMLLIElement>('li.rj-row, li.rj-xref')];
  const keys = rows.map((li) => fold(li.dataset.search ?? ''));
  const total = register.querySelectorAll('li.rj-row').length;
  const sections = [...register.querySelectorAll<HTMLElement>('.rj-section')];

  const apply = (): void => {
    const words = fold(find.value).split(/\s+/).filter(Boolean);
    const ranks = parseRanks(grade.value);
    let shown = 0;
    rows.forEach((li, i) => {
      const isRow = li.classList.contains('rj-row');
      const rankOk = !ranks || (isRow && ranks.has(Number(li.dataset.rank)));
      const textOk = words.every((w) => keys[i].includes(w));
      li.hidden = !(rankOk && textOk);
      if (isRow && !li.hidden) shown += 1;
    });
    sections.forEach((s) => { s.hidden = !s.querySelector('li:not([hidden])'); });
    count.textContent = words.length || ranks ? `${shown.toLocaleString('en-US')} of ${total.toLocaleString('en-US')} names` : '';
  };

  let timer = 0;
  find.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(apply, 120);
  });
  grade.addEventListener('change', apply);
}
