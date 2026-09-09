/**
 * Display formatting for corpus text.
 *
 * The corpus carries two kinds of inline marker. They look similar and need
 * opposite treatment, which is the reason this is a formatter rather than a
 * one-line cleanup.
 *
 *   folio markers   "[4/148]" — volume 4, page 148 of the printed edition the
 *                   text was set from. These are citations, and they are kept.
 *   markdown        *emphasis* around transliterated Arabic and Qur'anic
 *                   quotation, **strong** around the chapter heading that opens
 *                   many reports. Rendered as markup rather than shown raw.
 *
 * The folio markers were nearly deleted here on the assumption that they were
 * chunk numbers echoed back by the translator. They are not, and the evidence
 * against that reading is worth recording so it is not re-litigated: they occur
 * in `text_ar` as well as `text_en` (103,783 narrations against 3,099), they sit
 * mid-sentence far more often than at the start (73,807 of them), their first
 * component is bounded 1..25, and within a single collection every marker is
 * non-decreasing in reading order — 1,632 of them in Sahih al-Bukhari running
 * (1,6) to (9,162), and 1,617 in Sahih Muslim running (1,2) to (8,246). Nine
 * volumes and eight. That is pagination, not machinery, and a researcher
 * quoting a narration needs it.
 *
 * Nothing here mutates stored text: `hadith.text_en` stays exactly as
 * translated, so these decisions can be revisited without a re-import.
 *
 * Two entry points, because the call sites differ:
 *   toPlainText  feeds the snippet builder, which escapes and highlights on its
 *                own and must not be handed stray asterisks.
 *   renderRich   produces the reading view, and returns HTML.
 */

/**
 * Emphasis delimiters.
 *
 * The guards matter more than they look. Without them `2 * 3 = 6` opens an
 * emphasis run that never closes and `al-Bukh*ari` loses half its name: an
 * opening marker may not follow a word character or precede a space, and a run
 * may not cross a line, so an unpaired asterisk stays itself.
 */
const STRONG = /\*\*(?=\S)([^\n]*?)(?<=\S)\*\*/g;
const EM = /(?<![\w*])\*(?=[^\s*])([^\n*]*?)(?<=[^\s*])\*(?![\w*])/g;

/** A volume/page reference from the printed edition, e.g. [4/148]. */
const FOLIO = /\[(\d{1,2})\/(\d{1,5})\]/g;

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/**
 * The text with markup delimiters removed and the words themselves untouched.
 * Folio markers survive: they are part of the text a reader is quoting.
 */
export function toPlainText(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.replace(STRONG, '$1').replace(EM, '$1');
}

/**
 * The text as HTML, with emphasis preserved and folio markers marked up so they
 * can be set apart from the narration without being hidden.
 *
 * Escaping happens before any tag is introduced, so a source string containing
 * angle brackets becomes visible text rather than live markup. Today's corpus
 * has none, but that is a fact about the current data, not a guarantee about
 * the next import.
 */
export function renderRich(raw: string | null | undefined): string {
  if (!raw) return '';
  return markFolios(
    escapeHtml(raw).replace(STRONG, '<strong>$1</strong>').replace(EM, '<em>$1</em>')
  );
}

/**
 * The Arabic, with folio markers set apart and nothing else touched.
 *
 * Deliberately not `renderRich`. The emphasis rules are a property of the
 * English translation, and 1,505 Arabic narrations contain an asterisk of their
 * own — verse separators and editorial marks in the source edition. Running the
 * emphasis pass over those would silently eat a pair of them and everything in
 * between.
 */
export function renderArabic(raw: string | null | undefined): string {
  if (!raw) return '';
  return markFolios(escapeHtml(raw));
}

const markFolios = (html: string): string =>
  html.replace(
    FOLIO,
    (_m, volume, page) =>
      `<span class="folio" title="Printed edition: volume ${volume}, page ${page}">${volume}/${page}</span>`
  );
