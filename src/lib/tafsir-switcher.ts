/* The surah and verse menus on the Tafsīr reader pages
   (src/components/tafsir/VerseSwitcher.astro). Choosing a verse opens it.
   Choosing another surah loads that commentary's verse list once
   (/projects/tafsir/<work>/verses.json) and refills the verse menu, where the
   reader picks a verse or "All verses" for the surah's page. If the list
   cannot be loaded the surah's page opens instead. */

/* A <select>, typed as the existing reader scripts type theirs. */
type Menu = HTMLElement & { value: string };
type VerseRanges = [number, number][];
type VerseIndex = Record<string, { r: VerseRanges; g?: boolean }>;

/* The verse menu's own values: the surah's page, and the line shown until a verse is chosen. */
const ALL = '';
const PROMPT = 'choose';

const base = (work: string): string => `/projects/tafsir/${work}/`;

function isVerseIndex(value: unknown): value is VerseIndex {
  return typeof value === 'object' && value !== null && Object.values(value).every((entry) => Array.isArray((entry as { r?: unknown }).r));
}

function menuOption(value: string, label: string): HTMLOptionElement {
  const node = document.createElement('option');
  node.value = value;
  node.textContent = label;
  return node;
}

function chooseOption(): HTMLOptionElement {
  const node = menuOption(PROMPT, 'Choose a verse');
  node.disabled = true;
  return node;
}

function initSwitcher(form: HTMLFormElement): void {
  const work = form.dataset.work;
  const general = form.dataset.general ?? 'general';
  const surahMenu = form.querySelector<Menu>('[data-switch-surah]');
  const verseMenu = form.querySelector<Menu>('[data-switch-verse]');
  if (!work || !surahMenu || !verseMenu) return;
  const startSurah = surahMenu.value;
  const startVerse = verseMenu.value;
  let index: Promise<VerseIndex> | null = null;

  const load = (): Promise<VerseIndex> => {
    index ??= fetch(`${base(work)}verses.json`).then(async (response) => {
      if (!response.ok) throw new Error(`verses.json: ${response.status}`);
      const data: unknown = await response.json();
      if (!isVerseIndex(data)) throw new Error('verses.json: unexpected shape');
      return data;
    });
    return index;
  };

  const goTo = (surah: string, verse: string): void => {
    location.href = verse ? `${base(work)}${surah}/${verse}/` : `${base(work)}${surah}/`;
  };

  surahMenu.addEventListener('change', async () => {
    const surah = surahMenu.value;
    try {
      const entry = (await load())[surah];
      if (!entry) throw new Error(`no verses listed for surah ${surah}`);
      const choices = [
        ...(surah === startSurah ? [] : [chooseOption()]),
        menuOption(ALL, 'All verses'),
        ...(entry.g ? [menuOption(general, 'Without a verse reference')] : []),
        ...entry.r.flatMap(([start, end]) => Array.from({ length: end - start + 1 }, (_, i) => menuOption(String(start + i), `${surah}:${start + i}`))),
      ];
      verseMenu.replaceChildren(...choices);
      verseMenu.value = surah === startSurah ? startVerse : PROMPT;
      verseMenu.focus();
    } catch {
      /* The verse list is unavailable: the surah's own page lists them. */
      goTo(surah, '');
    }
  });

  verseMenu.addEventListener('change', () => {
    if (verseMenu.value !== PROMPT) goTo(surahMenu.value, verseMenu.value);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    goTo(surahMenu.value, verseMenu.value === PROMPT ? ALL : verseMenu.value);
  });
}

export function initSwitchers(): void {
  document.querySelectorAll<HTMLFormElement>('[data-switcher]').forEach(initSwitcher);
}
