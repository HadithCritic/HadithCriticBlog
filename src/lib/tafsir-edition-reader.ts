/* The one control the bilingual reader pages add to the al-Ṭabarī reader's
   (src/lib/tafsir-fatiha-reader.ts): showing or hiding the Arabic column. The
   choice is kept per reader; without script both languages are shown. */

const ARABIC_KEY = 'hc-tafsir-arabic';

export function initEditionReader() {
  const article = document.querySelector<HTMLElement>('.tfe .article');
  const toggle = document.querySelector<HTMLInputElement>('#arabicToggle');
  if (!article || !toggle) return;
  const apply = (on: boolean) => {
    article.dataset.arabic = on ? 'on' : 'off';
    toggle.checked = on;
  };
  try {
    if (localStorage.getItem(ARABIC_KEY) === 'off') apply(false);
  } catch {
    /* Storage is unavailable; both languages stay. */
  }
  toggle.addEventListener('change', () => {
    apply(toggle.checked);
    try {
      localStorage.setItem(ARABIC_KEY, toggle.checked ? 'on' : 'off');
    } catch {
      /* The choice still applies to this page. */
    }
  });
}
