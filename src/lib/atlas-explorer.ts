interface Entry {
  t: string;
  a: string;
  y: number | null;
  v: string;
  d: string | null;
  c: string[];
  b: string[];
  p: string | null;
  k: string[];
  s: { href: string; label: string; slug?: string }[];
  themes: string[];
  page: number | null;
}

export function initAtlasExplorer() {
  const page = document.querySelector<HTMLElement>('.atlas-page');
  const raw = document.getElementById('atlas-data')?.textContent;
  if (!page || !raw) return;
  const atlas: Record<string, Entry> = JSON.parse(raw);
  const explorer = page.querySelector<HTMLElement>('[data-explorer]')!;
  const input = page.querySelector<HTMLInputElement>('#atlas-query')!;
  const topicElement = page.querySelector('#atlas-theme');
  const sortElement = page.querySelector('#atlas-sort');
  if (!(topicElement instanceof HTMLSelectElement) || !(sortElement instanceof HTMLSelectElement)) return;
  const topic = topicElement;
  const sort = sortElement;
  const catalogue = page.querySelector<HTMLOListElement>('[data-catalogue]')!;
  const count = page.querySelector<HTMLElement>('#atlas-count')!;
  const more = page.querySelector<HTMLButtonElement>('[data-more]')!;
  const empty = page.querySelector<HTMLElement>('#atlas-empty')!;
  const body = page.querySelector<HTMLElement>('[data-focus-body]')!;
  const welcome = page.querySelector<HTMLElement>('[data-focus-empty]')!;
  const bibliography = page.querySelector<HTMLDetailsElement>('[data-bibliography]')!;
  const focus = page.querySelector<HTMLElement>('[data-focus]')!;
  const searchIndex = new Map(Object.keys(atlas).map(id => [id,
    (document.getElementById(id)?.dataset.search ?? `${atlas[id].t} ${atlas[id].a} ${atlas[id].v} ${atlas[id].y ?? ''}`).toLocaleLowerCase()
  ]));
  let selected = '';
  let limit = 20;
  let matching: string[] = [];

  function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const metadata = (entry: Entry) => [entry.a, entry.y ?? 'n.d.'].join(' · ');
  const searchText = (id: string) => searchIndex.get(id) ?? '';
  const newest = (a: string, b: string) => (atlas[b].y ?? -Infinity) - (atlas[a].y ?? -Infinity) || atlas[a].t.localeCompare(atlas[b].t);

  function save(push = false) {
    const url = new URL(location.href);
    for (const [key, value] of [['q', input.value.trim()], ['theme', topic.value], ['sort', sort.value === 'newest' ? '' : sort.value], ['work', selected]]) {
      value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
    }
    if (push) url.hash = 'map';
    if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](null, '', url);
  }

  function workLink(id: string, className: string) {
    const entry = atlas[id];
    const link = element('a', className);
    link.href = `#${id}`;
    link.dataset.explore = id;
    link.appendChild(element('span', 'entry__title', entry.t));
    link.appendChild(element('span', 'entry__meta', metadata(entry)));
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(id, true);
    });
    return link;
  }

  function renderCatalogue() {
    catalogue.replaceChildren();
    for (const id of matching.slice(0, limit)) {
      const li = element('li', 'catalogue__item');
      const link = workLink(id, 'catalogue__entry');
      if (id === selected) link.setAttribute('aria-current', 'true');
      const entry = atlas[id];
      link.appendChild(element('span', 'entry__relations', `Cites ${entry.c.length} · Cited by ${entry.b.length}`));
      li.appendChild(link);
      catalogue.appendChild(li);
    }
    count.textContent = `Showing ${Math.min(limit, matching.length)} of ${matching.length} works${matching.length !== Object.keys(atlas).length ? ` (${Object.keys(atlas).length} in collection)` : ''}`;
    more.hidden = limit >= matching.length;
    empty.hidden = matching.length > 0;
    empty.querySelector('p')!.textContent = input.value.trim() ? `No works match “${input.value.trim()}”.` : 'No works match these filters.';
  }

  function apply(updateUrl = true) {
    const query = input.value.trim().toLocaleLowerCase();
    matching = Object.keys(atlas).filter(id => (!query || searchText(id).includes(query)) && (!topic.value || atlas[id].themes.includes(topic.value)));
    matching.sort(sort.value === 'title' ? (a, b) => atlas[a].t.localeCompare(atlas[b].t) : sort.value === 'oldest' ? (a, b) => (atlas[a].y ?? Infinity) - (atlas[b].y ?? Infinity) || atlas[a].t.localeCompare(atlas[b].t) : newest);
    renderCatalogue();
    if (updateUrl) save();
  }

  function select(id: string, push = false) {
    if (!Object.hasOwn(atlas, id)) return;
    const entry = atlas[id];
    if (!entry) return;
    selected = id;
    body.replaceChildren();
    const back = element('button', 'focus__back', 'Back to results');
    back.type = 'button';
    back.addEventListener('click', () => {
      selected = '';
      body.hidden = true;
      welcome.hidden = false;
      save(true);
      renderCatalogue();
      input.focus();
    });
    const title = element('h3', 'focus__title', entry.t);
    title.tabIndex = -1;
    const header = element('header', 'focus__header');
    header.appendChild(back);
    header.appendChild(title);
    header.appendChild(element('p', 'focus__by', metadata(entry)));
    if (entry.v) header.appendChild(element('p', 'focus__venue', entry.v));
    if (entry.p) {
      const inside = element('p', 'focus__venue', 'Printed inside ');
      inside.appendChild(workLink(entry.p, 'focus__inline'));
      if (entry.page) inside.appendChild(document.createTextNode(`, beginning on page ${entry.page}`));
      header.appendChild(inside);
    }
    header.appendChild(element('p', 'focus__topics', entry.themes.join(' · ')));
    const actions = element('div', 'focus__actions');
    const full = element('a', 'hc-back-link hc-back-link--ruled', 'Bibliography and source notes');
    full.href = `#${id}`;
    actions.appendChild(full);
    if (entry.d) {
      const doi = element('a', 'hc-back-link hc-back-link--ruled', 'Open work (DOI)');
      doi.href = `https://doi.org/${entry.d}`;
      doi.target = '_blank';
      doi.rel = 'noopener noreferrer';
      doi.appendChild(element('span', 'sr-only', ' (opens in a new tab)'));
      actions.appendChild(doi);
    }
    header.appendChild(actions);
    if (entry.s.length) {
      const site = element('div', 'focus__site');
      site.appendChild(element('p', 'focus__site-label', 'On HadithCritic'));
      const list = element('ul', 'focus__site-list');
      entry.s.forEach(link => {
        const li = element('li', '');
        const a = element('a', 'hc-back-link', link.label);
        a.href = link.slug ? `/blogs/${link.slug}/` : link.href;
        li.appendChild(a);
        list.appendChild(li);
      });
      site.appendChild(list);
      header.appendChild(site);
    }
    body.appendChild(header);

    const filterLabel = element('label', 'connections__search', 'Search this work’s connections');
    const filter = element('input', 'connections__input');
    filter.type = 'search';
    filter.placeholder = 'Title, author or year';
    filterLabel.appendChild(filter);
    const connections = element('div', 'connections');
    const status = element('p', 'connections__status');
    status.setAttribute('aria-live', 'polite');
    const expanded = new Set<string>();

    function renderConnections() {
      connections.replaceChildren();
      const query = filter.value.trim().toLocaleLowerCase();
      let visible = 0;
      const total = entry.c.length + entry.b.length;
      for (const [label, ids] of [['Cites', entry.c], ['Cited by', entry.b]] as const) {
        const matches = [...ids].filter(other => !query || searchText(other).includes(query)).sort(newest);
        visible += matches.length;
        const group = element('section', 'connections__group');
        group.setAttribute('aria-label', label);
        group.appendChild(element('h4', 'connections__heading', `${label} (${ids.length})`));
        group.appendChild(element('p', 'connections__hint', label === 'Cites' ? 'Works named in this text' : 'Works that name this text'));
        const list = element('ol', 'connections__list');
        const shown = expanded.has(label) ? matches : matches.slice(0, 8);
        shown.forEach(other => {
          const li = element('li', 'connections__item');
          li.appendChild(workLink(other, 'connections__entry'));
          list.appendChild(li);
        });
        group.appendChild(list);
        if (!matches.length) group.appendChild(element('p', 'connections__none', ids.length ? 'No connections match this search.' : 'None recorded in this collection.'));
        if (matches.length > shown.length) {
          const expand = element('button', 'connections__more', `Show all ${matches.length} works`);
          expand.type = 'button';
          expand.addEventListener('click', () => {
            expanded.add(label);
            renderConnections();
            connections.querySelectorAll<HTMLElement>('section')[label === 'Cites' ? 0 : 1]?.querySelector<HTMLElement>('h4')?.focus();
          });
          group.appendChild(expand);
        }
        const heading = group.querySelector('h4')!;
        heading.tabIndex = -1;
        connections.appendChild(group);
      }
      status.textContent = query ? `${visible} of ${total} citation connections match` : `${total} citation connections in this collection. Newest works first.`;
    }
    filter.addEventListener('input', () => { expanded.clear(); renderConnections(); });
    body.appendChild(filterLabel);
    body.appendChild(status);
    body.appendChild(connections);
    renderConnections();

    if (entry.k.length) {
      const studies = element('details', 'focus__volume');
      studies.appendChild(element('summary', '', `Studies printed inside this volume (${entry.k.length})`));
      const list = element('ol', 'connections__list');
      entry.k.forEach(other => {
        const li = element('li', '');
        li.appendChild(workLink(other, 'connections__entry'));
        if (atlas[other].page) li.appendChild(element('p', 'focus__volume-label', `Beginning on page ${atlas[other].page}`));
        list.appendChild(li);
      });
      studies.appendChild(list);
      body.appendChild(studies);
    }
    welcome.hidden = true;
    body.hidden = false;
    catalogue.querySelectorAll('[aria-current]').forEach(link => link.removeAttribute('aria-current'));
    catalogue.querySelectorAll<HTMLAnchorElement>('[data-explore]').forEach(link => {
      if (link.dataset.explore === selected) link.setAttribute('aria-current', 'true');
    });
    if (push) {
      save(true);
      title.focus({ preventScroll: true });
      if (matchMedia('(max-width: 900px)').matches) focus.scrollIntoView({ block: 'start' });
    }
  }

  function openBibliography() {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { return; }
    const row = document.getElementById(id);
    if (!Object.hasOwn(atlas, id) || !row) return;
    bibliography.open = true;
    row.tabIndex = -1;
    row.scrollIntoView({ block: 'start' });
    row.focus({ preventScroll: true });
  }

  function restore() {
    selected = '';
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') ?? '';
    topic.value = params.get('theme') ?? '';
    if (topic.selectedIndex < 0) topic.value = '';
    sort.value = ['oldest', 'title'].includes(params.get('sort') ?? '') ? params.get('sort')! : 'newest';
    limit = 20;
    apply(false);
    const id = params.get('work') ?? location.hash.slice(1);
    if (Object.hasOwn(atlas, id)) select(id);
    else { selected = ''; body.hidden = true; welcome.hidden = false; }
    openBibliography();
  }

  [input, topic, sort].forEach(control => control.addEventListener(control === input ? 'input' : 'change', () => { limit = 20; apply(); }));
  more.addEventListener('click', () => {
    const previous = Math.min(limit, matching.length);
    limit += 20;
    renderCatalogue();
    catalogue.querySelectorAll<HTMLAnchorElement>('a')[previous]?.focus();
  });
  page.querySelector('#atlas-reset')?.addEventListener('click', () => {
    input.value = ''; topic.value = ''; limit = 20; apply(); input.focus();
  });
  page.querySelectorAll<HTMLButtonElement>('[data-show]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      select(button.dataset.show!, true);
      explorer.scrollIntoView({ block: 'start' });
    });
  });
  page.addEventListener('click', event => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || link.dataset.explore) return;
    if (link.hash === '#works') { bibliography.open = true; return; }
    if (!Object.hasOwn(atlas, link.hash.slice(1))) return;
    bibliography.open = true;
    // Clicking the same hash does not fire hashchange.
    if (link.hash === location.hash) openBibliography();
  });
  window.addEventListener('hashchange', openBibliography);
  window.addEventListener('popstate', restore);
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    if ((event.target as Element).closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault(); input.focus();
  });
  bibliography.open = false;
  explorer.hidden = false;
  page.querySelector<HTMLAnchorElement>('[data-explorer-start]')!.href = '#map';
  restore();
}
