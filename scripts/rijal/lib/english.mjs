/* Lines up the English translation with the numbered Arabic entries.
   The translation came in batches with different conventions, so it is
   kept as each entry's gloss and never read for data. */

const NUMBERED = /^\s*\[?(\d{1,4})\]?\s*[-.–:]\s*/;
const HEADING = /^(the )?letter\b|mention of those named|^(chapter|section|heading)\b|^\[?heading/i;
const BRACKETED = /^\s*\[/;

/* Returns Map<number, string[]>, one gloss per occurrence of the number
   (the source numbers one entry twice). */
export const glossesByNumber = (records) => {
  const out = new Map();
  let current = null;
  for (const record of records) {
    const lines = String(record.text_en ?? '').split(/\n+/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const m = NUMBERED.exec(line);
      if (m) {
        const n = Number(m[1]);
        const list = out.get(n) ?? [];
        current = { n, index: list.length };
        out.set(n, [...list, line]);
      } else if (current && !BRACKETED.test(line) && !HEADING.test(line)) {
        const list = out.get(current.n);
        out.set(current.n, list.map((g, i) => (i === current.index ? `${g}\n${line}` : g)));
      } else if (HEADING.test(line)) {
        current = null;
      }
    }
  }
  return out;
};

/* "died in the year 236 AH" and similar: the first year the gloss gives. */
export const glossYear = (gloss) => {
  const text = String(gloss ?? '').replace(/\[[^\]]*\]/g, ' ');
  const verb = /\b(?:died|killed|martyred)\b/i.exec(text);
  if (!verb) return null;
  const clause = text.slice(verb.index, verb.index + 90).split(/[;\n]/)[0].split(/\baged?\b/i)[0];
  const m = /\b(\d{2,3})\b/.exec(clause);
  return m ? Number(m[1]) : null;
};
