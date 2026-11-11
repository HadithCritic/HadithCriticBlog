/* Controls the bilingual reader pages (Mujāhid, al-Thawrī, al-Zamakhsharī)
   add to the al-Ṭabarī reader's (src/lib/tafsir-fatiha-reader.ts): a
   three-way language switch, kept per reader. Without script both languages
   are shown. */

const ARABIC_KEY = 'hc-tafsir-arabic';
const LANG_KEY = 'hc-tafsir-lang';
const LANGS = ['both', 'en', 'ar'] as const;
const COPIED_MS = 1500;

type Lang = (typeof LANGS)[number];

const isLang = (value: string | null | undefined): value is Lang => LANGS.includes(value as Lang);

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; /* Storage is unavailable; the default stays. */
  }
}

function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* The choice still applies to this page. */
  }
}

function initArabicToggle(page: HTMLElement): void {
  const article = page.querySelector<HTMLElement>('.article');
  const toggle = page.querySelector<HTMLInputElement>('#arabicToggle');
  if (!article || !toggle) return;
  const apply = (on: boolean) => {
    article.dataset.arabic = on ? 'on' : 'off';
    toggle.checked = on;
  };
  if (stored(ARABIC_KEY) === 'off') apply(false);
  toggle.addEventListener('change', () => {
    apply(toggle.checked);
    store(ARABIC_KEY, toggle.checked ? 'on' : 'off');
  });
}

function initLanguageSwitch(page: HTMLElement): void {
  const buttons = [...page.querySelectorAll<HTMLButtonElement>('[data-language]')];
  if (!buttons.length) return;
  const apply = (lang: Lang) => {
    page.dataset.lang = lang;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === lang)));
  };
  const saved = stored(LANG_KEY);
  if (isLang(saved)) apply(saved);
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const lang = button.dataset.language;
      if (!isLang(lang)) return;
      apply(lang);
      store(LANG_KEY, lang);
    }),
  );
}

function initCopySurah(page: HTMLElement): void {
  const button = page.querySelector<HTMLButtonElement>('#copySurah');
  if (!button) return;
  const label = button.textContent;
  const cell = (row: Element, name: string) => row.querySelector(`.quran-row__${name}`)?.textContent?.trim() ?? '';
  button.addEventListener('click', async () => {
    const text = [...page.querySelectorAll('.quran-row')].map((row) => `${cell(row, 'arabic')}\n${cell(row, 'translation')}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Select the text to copy';
    }
    setTimeout(() => (button.textContent = label), COPIED_MS);
  });
}

export function initEditionReader(): void {
  const page = document.querySelector<HTMLElement>('.hc-page.tfe');
  if (!page) return;
  initArabicToggle(page);
  initLanguageSwitch(page);
  initCopySurah(page);
}
