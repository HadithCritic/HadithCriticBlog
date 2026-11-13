/* Controls for the hand-authored al-Ṭabarī reader pages
   (src/data/tafsir/pages/tabari/<surah>/<verse>.html). One script for every
   verse, so the pages behave alike: text size, citation
   highlights, the editor's notes, the verse copy button and the section menu.
   Without script the page still reads in full; the notes list simply shows
   every note. */

const NOTES_SHOWN = 9;

export function initFatihaReader() {
  const page = document.querySelector<HTMLElement>('.hc-page.tfr[data-reader]');
  if (!page) return;
  const root = document.documentElement;
  const article = page.querySelector<HTMLElement>('.article');

  /* Text size */
  let size = 19;
  const sizeOut = page.querySelector<HTMLElement>('#sizeValue');
  const setSize = (next: number) => {
    size = Math.max(16, Math.min(24, next));
    root.style.setProperty('--reading-size', `${size}px`);
    if (sizeOut) sizeOut.textContent = String(size);
  };
  page.querySelector('#sizeMinus')?.addEventListener('click', () => setSize(size - 1));
  page.querySelector('#sizePlus')?.addEventListener('click', () => setSize(size + 1));

  /* Citation highlights */
  page.querySelector<HTMLInputElement>('#highlightToggle')?.addEventListener('change', (event) => {
    if (article) article.dataset.highlights = String((event.target as HTMLInputElement).checked);
  });

  /* Editor's notes: the first nine, a search, and "show all" */
  const disclosure = page.querySelector<HTMLDetailsElement>('.notes-disclosure');
  const notes = [...page.querySelectorAll<HTMLElement>('#noteList > li')];
  const search = page.querySelector<HTMLInputElement>('#noteSearch');
  const more = page.querySelector<HTMLButtonElement>('#noteMore');
  const count = page.querySelector<HTMLElement>('#noteCount');
  let showAll = false;
  const updateNotes = () => {
    const query = (search?.value ?? '').trim().toLocaleLowerCase();
    let matches = 0;
    notes.forEach((row, index) => {
      const match = !query || (row.dataset.search || row.textContent || '').toLocaleLowerCase().includes(query);
      if (match) matches++;
      row.hidden = !match || (!query && !showAll && index >= NOTES_SHOWN);
    });
    if (count) {
      count.textContent = query
        ? `${matches} matching notes`
        : showAll || notes.length <= NOTES_SHOWN
          ? `All ${notes.length} notes`
          : `First ${NOTES_SHOWN} of ${notes.length} notes`;
    }
    if (more) more.hidden = Boolean(query) || showAll || notes.length <= NOTES_SHOWN;
  };
  search?.addEventListener('input', updateNotes);
  more?.addEventListener('click', () => {
    showAll = true;
    updateNotes();
  });
  updateNotes();

  /* A note reference opens the notes at that note */
  page.querySelectorAll<HTMLAnchorElement>('a.tfr-noteref').forEach((link) =>
    link.addEventListener('click', () => {
      showAll = true;
      if (search) search.value = '';
      updateNotes();
      if (disclosure) disclosure.open = true;
      const target = link.hash ? document.querySelector(link.hash) : null;
      requestAnimationFrame(() => target?.scrollIntoView({ block: 'center' }));
    }),
  );

  /* Copy the verse in Arabic and English with its reference */
  const ref = page.querySelector('.crumb strong')?.textContent?.trim();
  page.querySelector<HTMLButtonElement>('#copyVerse')?.addEventListener('click', async function (this: HTMLButtonElement) {
    const arabic = page.querySelector('#arabicVerse')?.textContent ?? '';
    const english = page.querySelector('#englishVerse')?.textContent ?? '';
    const value = `${arabic}\n${english}${ref ? `\nQ ${ref}` : ''}`;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement('textarea');
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const label = this.textContent;
    this.textContent = 'Copied';
    setTimeout(() => (this.textContent = label), 1700);
  });

  /* Jump to a section */
  const jump = page.querySelector<HTMLElement & { value: string }>('#chapterJump');
  jump?.addEventListener('change', () => {
    const target = document.getElementById(jump.value);
    if (target instanceof HTMLDetailsElement) target.open = true;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    jump.value = '';
  });
}
