/* Text primitives for the Tafsir importer: tidying, sentences, and the inline
   runs a passage is rendered from.

   Inline runs are an array of strings and tagged tuples:
     'plain text'
     ['h', runs, braced]   Qur'anic wording. braced: the translator marked it
                           with {braces}; otherwise it is an editorial
                           highlight of the verse's wording.
     ['r', text, s, a, b]  a Qur'anic citation as written, e.g. "(Ghafir 40:16)"
     ['n', text, note]     an editor's footnote marker as written, e.g. "(3)"
     ['i', text]           *italic* in the source
   flatten() turns runs back into the source text, which is how the importer
   proves that no word was dropped or changed. */

/* Footnote markers are resolved per page segment before the segments are
   joined, so they travel through the text as sentinels. */
export const NOTE_OPEN = '';
export const NOTE_MID = '';
export const NOTE_CLOSE = '';
const SENTINEL = /(\d+)([^]*)/g;

/** The only change made to a translation's text: the backtick some editions use
    for ʿayn is set as ʿ, and runs of spaces collapse. Newlines are kept when
    they mark paragraphs. */
export function tidy(text, { keepNewlines = true } = {}) {
  let s = String(text ?? '').replace(/`/g, 'ʿ').replace(/\r/g, '');
  s = keepNewlines ? s.replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n') : s.replace(/\s+/g, ' ');
  return s.trim();
}

export const squash = (s) => String(s).replace(/\s+/g, ' ').trim();

/* ── Sentences ─────────────────────────────────────────────────── */

const ABBREVIATIONS = new Set([
  'b', 'bt', 'd', 'p', 'pp', 'vol', 'vols', 'cf', 'e.g', 'i.e', 'no', 'nos', 'lit', 'ca', 'ch', 'fn', 'st', 'viz', 'ibid', 'mr', 'dr', 'q',
]);

/** Splits a paragraph into sentences without breaking inside {braces} or a
    footnote sentinel, after "b." in a name, or after an initial. */
export function sentences(paragraph) {
  const text = paragraph;
  const out = [];
  let start = 0;
  let brace = 0;
  let sentinel = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === NOTE_OPEN) sentinel = true;
    else if (c === NOTE_CLOSE) sentinel = false;
    else if (c === '{') brace++;
    else if (c === '}') brace = Math.max(0, brace - 1);
    if (brace || sentinel || !/[.?!]/.test(c)) continue;
    // Take closing quotes and brackets with the sentence.
    let j = i + 1;
    while (j < text.length && /[”’"')\]]/.test(text[j])) j++;
    if (j >= text.length || !/\s/.test(text[j])) continue;
    let k = j;
    while (k < text.length && /\s/.test(text[k])) k++;
    if (k >= text.length) break;
    // The next sentence opens with a capital, a quote, a bracket, a digit or a sentinel.
    if (!/[A-ZĀĪŪḤṢḌṬẒʿʾ“"‘'({\[0-9]/.test(text[k])) continue;
    if (c === '.') {
      const word = text.slice(start, i).match(/([A-Za-z.]+)$/)?.[1] ?? '';
      if (ABBREVIATIONS.has(word.toLowerCase()) || /^[A-Z]$/.test(word)) continue;
    }
    out.push(text.slice(start, j));
    start = k;
    i = k - 1;
  }
  if (start < text.length) out.push(text.slice(start));
  return out.filter((s) => s.trim());
}

/* ── Inline runs ───────────────────────────────────────────────── */

const CITATION_NAME = String.raw`[A-Z][A-Za-z‘’'ʿʾ\-āīūḥṣḍṭẓĀĪŪḤṢḌṬẒ ]{1,30}?`;
const CITATION = new RegExp(
  String.raw`\((${CITATION_NAME})\s+(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\)|\[(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?\]|\((${CITATION_NAME})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\)`,
  'y',
);

const ARTICLES = new Set(['al', 'an', 'as', 'ash', 'at', 'ad', 'adh', 'ar', 'az', 'ath', 'surat', 'surah', 'sura']);
const fold = (name) => {
  const tokens = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'‘ʿʾ`]/g, '').split(/[-\s]+/).filter(Boolean);
  while (tokens.length > 1 && ARTICLES.has(tokens[0])) tokens.shift();
  return tokens.join('');
};

/** Resolves a surah named in a citation ("An-Nisa’", "Al Imran") to its number. */
export function surahResolver(list) {
  const map = new Map(list.map((s) => [fold(s.latin), s.n]));
  return (name) => map.get(fold(name)) ?? null;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Parses text into inline runs.
 * @param {string} text
 * @param {{ phrases?: string[], verses?: (s:number)=>number, surah?: (name:string)=>number|null }} ctx
 *   phrases: verse wording to highlight; verses: verse count of a surah, used to
 *   reject citations that point nowhere.
 */
export function inline(text, ctx = {}) {
  const runs = [];
  let buf = '';
  const push = (run) => {
    if (buf) runs.push(buf), (buf = '');
    runs.push(run);
  };
  const phraseRe = ctx.phrases?.length
    ? new RegExp(ctx.phrases.map((p) => escapeRe(p.slice(1)).replace(/^/, `[${escapeRe(p[0].toUpperCase())}${escapeRe(p[0].toLowerCase())}]`)).join('|'), 'y')
    : null;

  for (let i = 0; i < text.length; ) {
    const c = text[i];
    if (c === NOTE_OPEN) {
      SENTINEL.lastIndex = i;
      const m = SENTINEL.exec(text);
      if (m && m.index === i) {
        push(['n', m[2], Number(m[1])]);
        i += m[0].length;
        continue;
      }
    }
    if (c === '{') {
      const end = matchingBrace(text, i);
      if (end > i) {
        push(['h', inline(text.slice(i + 1, end), { verses: ctx.verses, surah: ctx.surah }), 1]);
        i = end + 1;
        continue;
      }
    }
    if (c === '*' && text[i + 1] && text[i + 1] !== ' ') {
      const end = text.indexOf('*', i + 1);
      if (end > i + 1 && end - i < 120 && !text.slice(i + 1, end).includes('\n')) {
        push(['i', text.slice(i + 1, end)]);
        i = end + 1;
        continue;
      }
    }
    if (c === '(' || c === '[') {
      CITATION.lastIndex = i;
      const m = CITATION.exec(text);
      if (m) {
        const s = m[8] ? ctx.surah?.(m[8]) ?? 0 : Number(m[2] ?? m[5]);
        const a = Number(m[3] ?? m[6] ?? m[9]);
        const b = Number(m[4] ?? m[7] ?? m[10] ?? a);
        const valid = s >= 1 && s <= 114 && a >= 1 && b >= a && (!ctx.verses || b <= ctx.verses(s));
        if (valid) {
          push(['r', m[0], s, a, b]);
          i += m[0].length;
          continue;
        }
      }
    }
    if (phraseRe && /[A-Za-z]/.test(c) && (i === 0 || !/[A-Za-z]/.test(text[i - 1]))) {
      phraseRe.lastIndex = i;
      const m = phraseRe.exec(text);
      if (m && !/[A-Za-z]/.test(text[i + m[0].length] ?? '')) {
        push(['h', [m[0]], 0]);
        i += m[0].length;
        continue;
      }
    }
    buf += c;
    i++;
  }
  if (buf) runs.push(buf);
  return runs;
}

function matchingBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length && i - open < 1500; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return i;
  }
  return -1;
}

/** Back to the source text: braces, asterisks and markers as written. */
export function flatten(runs) {
  if (typeof runs === 'string') return runs;
  let out = '';
  for (const run of runs ?? []) {
    if (typeof run === 'string') out += run;
    else if (run[0] === 'h') out += run[2] ? `{${flatten(run[1])}}` : flatten(run[1]);
    else if (run[0] === 'i') out += `*${run[1]}*`;
    else out += run[1];
  }
  return out;
}

/** Plain reading text, for search and copying: no braces or asterisks. */
export function plain(runs) {
  if (typeof runs === 'string') return runs;
  let out = '';
  for (const run of runs ?? []) {
    if (typeof run === 'string') out += run;
    else if (run[0] === 'h') out += plain(run[1]);
    else out += run[1];
  }
  return out.replace(SENTINEL, '$2');
}

/** Removes footnote sentinels, leaving the marker text as written. */
export const unsentinel = (s) => s.replace(SENTINEL, '$2');

export const wordCount = (s) => (squash(unsentinel(s)).match(/\S+/g) ?? []).length;
