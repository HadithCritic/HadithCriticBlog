/*
 * One shared Isnad / Matn presentation for every reader collection.
 * Every report shows the same two labeled blocks in both language columns. When a passage has no chain,
 * or a chain with no separate matn, a short placeholder line takes the place of the missing block, so the
 * distinction looks and is marked up identically everywhere.
 */
import { splitArabic, splitEnglish, reconstructs } from './isnad-split.mjs';

export const NO_ISNAD = 'No isnad: the text is given as a direct statement.';
export const NO_MATN = 'No matn: only the transmission chain is given here.';
const SHEET = 'font-style:italic;opacity:.72';

/** Fills a missing isnad/matn split from the passage itself when a chain is evident; never rewrites text. */
export function resolveParts(text, parts) {
  const out = { en: { ...(parts.en ?? {}) }, ar: { ...(parts.ar ?? {}) } };
  const has = side => Boolean((side.isnad || '').trim() || (side.matn || '').trim());
  const fill = (lang, splitter, basmala) => {
    if (has(out[lang]) || !text[lang]) return;
    let split = splitter(text[lang]);
    if (!split) {
      // A title and basmala may precede the chain; split after them and keep them with the isnad.
      const at = text[lang].search(basmala);
      const cut = at >= 0 && at < 220 ? at + text[lang].slice(at).match(basmala)[0].length : -1;
      const rest = cut > 0 ? splitter(text[lang].slice(cut)) : null;
      if (rest) split = { isnad: `${text[lang].slice(0, cut)} ${rest.isnad}`.trim(), matn: rest.matn };
    }
    if (split && reconstructs(text[lang], split)) out[lang] = split;
  };
  fill('ar', splitArabic, /الرحيم/);
  // The English split only follows an Arabic split, so the two columns always agree.
  if (has(out.ar)) fill('en', splitEnglish, /Most Merciful\.?/);
  return out;
}

/** The labeled Isnad and Matn blocks for one language column. */
export function partsMarkup(side, fallback, format, reason = NO_ISNAD) {
  const isnad = (side.isnad || '').trim();
  const matn = (side.matn || '').trim();
  const isnadBlock = isnad
    ? `<div class="isnad-label">Isnad</div><p class="isnad">${format(isnad)}</p>`
    : `<div class="isnad-label">Isnad</div><p class="isnad isnad--none" style="${SHEET}">${reason}</p>`;
  if (!isnad && !matn) return `${isnadBlock}<div class="matn-label">Matn</div><p class="matn">${format(fallback)}</p>`;
  const matnBlock = matn
    ? `<div class="matn-label">Matn</div><p class="matn">${format(matn)}</p>`
    : `<div class="matn-label">Matn</div><p class="matn matn--none" style="${SHEET}">${NO_MATN}</p>`;
  return isnadBlock + matnBlock;
}
