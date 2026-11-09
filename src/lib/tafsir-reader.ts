/* Behaviour for the Tafsir reader (src/pages/projects/tafsir/[work]/[surah]/[verse].astro).
   Everything here is progressive: without script the page reads in full, the
   notes show their first nine and the menus fall back to a link.

   Preferences are per reader and kept in localStorage: text size and verse
   highlights here, the theme under the site's own "theme" key so the reader's
   dark-mode switch and the header toggle stay one setting. */

const SIZE_KEY = 'tafsir-reader-size';
const HIGHLIGHT_KEY = 'tafsir-reader-highlights';
const SIZE_MIN = 15;
const SIZE_MAX = 22;

const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* The setting still applies to this page. */
    }
  },
};

export function initReader() {
  const reader = document.querySelector<HTMLElement>('[data-reader]');
  if (!reader) return;
  const all = <T extends Element>(selector: string) => [...reader.querySelectorAll<T>(selector)];
  const html = document.documentElement;

  /* ── Toast ── */
  const toastEl = reader.querySelector<HTMLElement>('[data-toast]');
  let toastTimer = 0;
  const toast = (text: string) => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  };

  /* ── Text size ── */
  let size = Number(store.get(SIZE_KEY)) || 17;
  const setSize = (next: number) => {
    size = Math.max(SIZE_MIN, Math.min(SIZE_MAX, next));
    reader.style.setProperty('--reader-size', `${size}px`);
    all<HTMLOutputElement>('[data-size-value]').forEach((o) => (o.textContent = String(size)));
    all<HTMLButtonElement>('[data-size-step]').forEach((b) => {
      b.disabled = Number(b.dataset.sizeStep) < 0 ? size <= SIZE_MIN : size >= SIZE_MAX;
    });
    store.set(SIZE_KEY, String(size));
  };
  setSize(size);
  all<HTMLButtonElement>('[data-size-step]').forEach((b) => b.addEventListener('click', () => setSize(size + Number(b.dataset.sizeStep))));

  /* ── Verse highlights ── */
  const setHighlights = (on: boolean) => {
    reader.dataset.highlights = on ? 'on' : 'off';
    all<HTMLInputElement>('[data-highlights-switch]').forEach((s) => (s.checked = on));
    store.set(HIGHLIGHT_KEY, on ? 'on' : 'off');
  };
  setHighlights(store.get(HIGHLIGHT_KEY) !== 'off');
  all<HTMLInputElement>('[data-highlights-switch]').forEach((s) => s.addEventListener('change', () => setHighlights(s.checked)));

  /* ── Dark reading mode: the site theme ── */
  const syncDark = () => all<HTMLInputElement>('[data-dark-switch]').forEach((s) => (s.checked = html.dataset.theme !== 'light'));
  syncDark();
  new MutationObserver(syncDark).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  all<HTMLInputElement>('[data-dark-switch]').forEach((s) =>
    s.addEventListener('change', () => {
      const want = s.checked ? 'dark' : 'light';
      if ((html.dataset.theme === 'light' ? 'light' : 'dark') === want) return;
      const toggle = document.querySelector<HTMLButtonElement>('#themeToggle');
      if (toggle) toggle.click();
      else {
        html.dataset.theme = want;
        store.set('theme', want);
      }
    }),
  );

  /* ── Focus mode and print ── */
  reader.querySelector<HTMLButtonElement>('[data-focus-toggle]')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const on = reader.dataset.focus !== 'on';
    reader.dataset.focus = on ? 'on' : 'off';
    button.setAttribute('aria-pressed', String(on));
    const label = button.querySelector('[data-focus-label]');
    if (label) label.textContent = on ? 'Exit focus' : 'Focus mode';
  });
  reader.querySelector('[data-print]')?.addEventListener('click', () => window.print());

  /* ── Menus ── */
  all<HTMLElement>('[data-tafsir-tools] select').forEach((node) => {
    // Typed loosely: the Worker types in this project shadow HTMLSelectElement.
    const select = node as HTMLElement & { value: string };
    select.addEventListener('change', () => {
      if (select.value && select.value !== window.location.pathname) window.location.href = select.value;
    });
  });

  /* ── Sharing: the system share sheet where there is one, else the clipboard ── */
  const share = async (data: { title: string; text?: string; url?: string }, fallback: string, done: string) => {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(fallback);
      toast(done);
    } catch {
      const area = document.createElement('textarea');
      area.value = fallback;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        toast(done);
      } catch {
        toast('Sharing is not available in this browser');
      }
      area.remove();
    }
  };
  const url = window.location.origin + window.location.pathname;
  const ar = reader.querySelector('[data-verse-ar]')?.textContent?.trim() ?? '';
  const en = reader.querySelector('[data-verse-en]')?.textContent?.trim() ?? '';
  const ref = reader.querySelector('#reading-title')?.textContent?.replace(/^.* on /, 'Q ') ?? '';
  all<HTMLButtonElement>('[data-share-verse]').forEach((b) =>
    b.addEventListener('click', () => {
      const text = `${ar}\n${en}\n${ref}`;
      share({ title: ref, text, url }, `${text}\n${url}`, 'Verse copied to the clipboard');
    }),
  );
  reader.querySelector('[data-share-link]')?.addEventListener('click', () => share({ title: document.title, url }, url, 'Link copied to the clipboard'));

  /* ── Editor's notes: search, show all, and open the one a marker points to ── */
  const notes = reader.querySelector<HTMLElement>('[data-notes]');
  if (notes) {
    const rows = [...notes.querySelectorAll<HTMLElement>('[data-note-row]')];
    const query = notes.querySelector<HTMLInputElement>('[data-notes-query]');
    const countEl = notes.querySelector<HTMLElement>('[data-notes-count]');
    const empty = notes.querySelector<HTMLElement>('[data-notes-empty]');
    const expand = notes.querySelector<HTMLButtonElement>('[data-notes-expand]');
    const details = notes.querySelector<HTMLDetailsElement>('[data-notes-details]');
    const limit = Number(notes.dataset.limit) || 9;
    let showAll = false;
    const update = () => {
      const filter = (query?.value ?? '').trim().toLocaleLowerCase();
      let matches = 0;
      let shown = 0;
      rows.forEach((row, i) => {
        const match = !filter || (row.dataset.search ?? '').includes(filter);
        if (match) matches++;
        const visible = match && (showAll || Boolean(filter) || i < limit);
        row.hidden = !visible;
        if (visible) shown++;
      });
      if (countEl) countEl.textContent = filter ? `${matches} of ${rows.length} match` : `Showing ${shown} of ${rows.length}`;
      if (empty) empty.hidden = matches !== 0;
      if (expand) {
        expand.textContent = showAll ? 'Show fewer notes' : `Show all ${rows.length} notes`;
        expand.parentElement!.hidden = Boolean(filter);
      }
    };
    query?.addEventListener('input', update);
    expand?.addEventListener('click', () => {
      showAll = !showAll;
      update();
    });
    const reveal = (hash: string) => {
      const row = hash.startsWith('#note-') ? notes.querySelector<HTMLElement>(hash) : null;
      if (!row) return;
      if (details) details.open = true;
      if (row.hidden) {
        if (query) query.value = '';
        showAll = true;
        update();
      }
      rows.forEach((r) => r.classList.toggle('is-target', r === row));
      row.scrollIntoView({ block: 'center' });
    };
    reader.addEventListener('click', (event) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#note-"]');
      if (!link) return;
      event.preventDefault();
      history.replaceState(null, '', link.hash);
      reveal(link.hash);
    });
    update();
    if (location.hash) reveal(location.hash);
  }

  /* ── Reading progress ── */
  const progress = reader.querySelector<HTMLElement>('[data-progress]');
  let ticking = false;
  const onScroll = () => {
    if (ticking || !progress) return;
    ticking = true;
    requestAnimationFrame(() => {
      const total = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Contents: mark the section in view ── */
  const anchors = all<HTMLAnchorElement>('[data-contents] a');
  const targets = anchors.map((a) => document.querySelector(a.hash)).filter((el): el is Element => Boolean(el));
  if ('IntersectionObserver' in window && targets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        anchors.forEach((a) => {
          const on = a.hash === `#${visible[0].target.id}`;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-90px 0px -65% 0px', threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
  }

  /* ── Arrow keys step to the previous and next verse ── */
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if ((event.target as HTMLElement).closest('input, select, textarea, [contenteditable], dialog')) return;
    const selector = event.key === 'ArrowLeft' ? '[data-prev]' : event.key === 'ArrowRight' ? '[data-next]' : null;
    const link = selector ? reader.querySelector<HTMLAnchorElement>(selector) : null;
    if (link) window.location.href = link.href;
  });
}
