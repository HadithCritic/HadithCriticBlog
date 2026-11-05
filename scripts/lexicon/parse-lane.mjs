#!/usr/bin/env node
/**
 * Parse the Perseus TEI XML of Lane's Arabic-English Lexicon into structured
 * JSON, one file per letter, for the /lexicon/ pipeline.
 *
 * Input is the Arabic-script copy written by tools/lane_to_arabic.py in the
 * lanes-lexicon checkout (default ../../lanes-lexicon/arabic relative to this
 * repo, or LANE_XML_DIR). Output goes to data/lexicon/lane/ (gitignored).
 *
 * The parse keeps everything Lane says. It adds signals the later stages need:
 * sense groups, Form I imperfect vowels, cross-reference stubs, phrase
 * headwords, source abbreviations, Quran references converted to standard
 * numbering, hadith mentions, and figurative tags. The rules behind each one
 * are in docs/lexicon/case-study.md, sections 1 and 4.
 *
 * Usage: node scripts/lexicon/parse-lane.mjs [--only Hdv,snd]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { normalizeArabic } from '../../src/lib/arabic-normalize.ts';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const XML_DIR = process.env.LANE_XML_DIR ?? path.resolve(REPO, '../../lanes-lexicon/arabic');
const OUT_DIR = process.env.LANE_OUT_DIR ?? path.join(REPO, 'data/lexicon/lane');
const CORRECTIONS_FILE = path.join(REPO, 'data/lexicon/lane-corrections.json');
const QURAN_FILE = path.join(REPO, 'src/data/quran-verses.json');

// ---------------------------------------------------------------------------
// XML

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decode(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|\w+);/g, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    if (e in ENTITIES) return ENTITIES[e];
    throw new Error(`unknown entity ${m}`);
  });
}

const TOKEN = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>|([^<]+)/g;
const ATTR = /([\w:.-]+)\s*=\s*"([^"]*)"/g;

/**
 * Small strict XML reader for these files: elements, attributes, text.
 * Throws on anything it does not recognize instead of skipping it.
 */
export function parseXml(src) {
  src = src.replace(/<!DOCTYPE[^>]*>/, '').replace(/&encoding;/g, '');
  const root = { name: '#root', attrs: {}, children: [] };
  const stack = [root];
  let pos = 0;
  TOKEN.lastIndex = 0;
  for (let m; (m = TOKEN.exec(src)); ) {
    if (m.index !== pos) throw new Error(`unparsed XML at offset ${pos}: ${src.slice(pos, pos + 60)}`);
    pos = TOKEN.lastIndex;
    if (m[5] !== undefined) {
      stack.at(-1).children.push(decode(m[5]));
    } else if (m[2]) {
      if (m[1]) {
        const top = stack.pop();
        if (top.name !== m[2]) throw new Error(`</${m[2]}> closes <${top.name}> at offset ${m.index}`);
      } else {
        const attrs = {};
        for (const a of m[3].matchAll(ATTR)) attrs[a[1]] = decode(a[2]);
        const el = { name: m[2], attrs, children: [] };
        stack.at(-1).children.push(el);
        if (!m[4]) stack.push(el);
      }
    }
  }
  if (pos !== src.length) throw new Error(`unparsed XML at offset ${pos}`);
  if (stack.length !== 1) throw new Error(`unclosed <${stack.at(-1).name}>`);
  return root;
}

function* elements(node, name) {
  for (const c of node.children) {
    if (typeof c === 'string') continue;
    if (c.name === name) yield c;
    else yield* elements(c, name);
  }
}

// ---------------------------------------------------------------------------
// Arabic helpers

/** Search fold shared with the hadith corpus. */
const fold = (s) => normalizeArabic(s);

/** Tighter skeleton for matching Lane's quotations against Uthmani Quran text. */
const skeleton = (s) => fold(s).replace(/ا/g, '').replace(/ /g, '');

const WEAK = new Set(['ا', 'و', 'ي', 'ء', '']);

/** Does this word contain the root's strong letters in order? */
function hasRoot(word, rootLetters) {
  const w = [...fold(word)];
  let i = 0;
  for (const r of rootLetters) {
    if (WEAK.has(r)) continue;
    while (i < w.length && w[i] !== r) i++;
    if (i === w.length) return false;
    i++;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Sources (Lane's abbreviations)

/** Frequent abbreviations in the entries that the DTD's list leaves out. */
const EXTRA_SIGLA = {
  Har: 'The commentary in De Sacy’s edition of the “Maḳámát” of El-Ḥareeree.',
  Sgh: 'Eṣ-Ṣaghánee.',
  Golius: 'Golius, “Lexicon Arabico-Latinum.”'
};

/** Build abbreviation -> expansion from the authorities list in Encoding.dtd. */
export function loadSigla(dtdPath) {
  const dtd = fs.readFileSync(dtdPath, 'utf8');
  const map = new Map();
  for (const [, abbr, expan] of dtd.matchAll(/<abbr>([^<]*)<\/abbr>\s*<expan[^>]*>([^<]*)<\/expan>/g)) {
    let key = siglumKey(abbr);
    // The DTD writes some "Ibn" abbreviations with a lowercase L: lDrd, lbrD.
    if (/^l[A-Z]/.test(key)) key = `I${key.slice(1)}`;
    map.set(key, { abbr, expansion: decode(expan).trim() });
  }
  for (const [abbr, expansion] of Object.entries(EXTRA_SIGLA)) {
    if (!map.has(abbr)) map.set(abbr, { abbr, expansion, extra: true });
  }
  return map;
}

/** Exact key first, then a case-insensitive match (the entries write ISK for ISk). */
function lookupSiglum(sigla, key) {
  if (sigla.has(key)) return key;
  sigla.lower ??= new Map([...sigla.keys()].map((k) => [k.toLowerCase(), k]));
  return sigla.lower.get(key.toLowerCase()) ?? null;
}

/** The DTD writes Ṣ, Ḳ, Mṣb; the entries write S, K, Msb. Fold both the same way. */
function siglumKey(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘ʼ]/g, "'");
}

/** Pull Lane's source abbreviations out of parenthetical groups like "(S, A, Msb, K,)". */
function findSigla(text, sigla, unknown) {
  const found = [];
  for (const [, inner] of text.matchAll(/\(([^()]{1,240})\)/g)) {
    for (let tok of inner.split(/[,;]/)) {
      tok = tok.replace(/[*]/g, ' ').trim().replace(/^(?:in|and|from|voce)\s+/i, '');
      const m = tok.match(/^(\p{Lu}[\p{L}\p{M}'’\-]{0,14})/u);
      if (!m) continue;
      const key = siglumKey(m[1]);
      const hit = lookupSiglum(sigla, key);
      if (hit) {
        if (!found.includes(hit)) found.push(hit);
      } else if (/^[A-Z][A-Za-z']{0,5}$/.test(key)) {
        unknown.set(key, (unknown.get(key) ?? 0) + 1);
      }
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Quran references

const ROMAN = { i: 1, v: 5, x: 10, l: 50, c: 100 };

function romanToInt(s) {
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]], next = ROMAN[s[i + 1]] ?? 0;
    total += v < next ? -v : v;
  }
  return total;
}

function intToRoman(n) {
  const table = [[100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
  let out = '';
  for (const [v, r] of table) while (n >= v) { out += r; n -= v; }
  return out;
}

const QURAN_CONTEXT = /\b(?:Kur|Ḳur|Kor|Jel|Bd|Bḍ|Ksh)\b/;
const REF = /\b([ivxlc]{1,8})\.,?\s?(\d{1,3})\b/g;

/** Find references such as "Kur, xlv. 28", "Kur [viii. 62]", "(Jel in iii. 31". */
function findQuranRefs(text) {
  const refs = [];
  let lastEnd = -1000;
  for (const m of text.matchAll(REF)) {
    const sura = romanToInt(m[1]);
    if (sura < 1 || sura > 114 || intToRoman(sura) !== m[1]) continue;
    const before = text.slice(Math.max(0, m.index - 80), m.index);
    if (!QURAN_CONTEXT.test(before) && m.index - lastEnd > 40) continue;
    lastEnd = m.index + m[0].length;
    refs.push({ lane: `${m[1]}. ${m[2]}`, sura, laneVerse: Number(m[2]), at: [m.index, lastEnd] });
  }
  return refs;
}

class QuranIndex {
  constructor(verses) {
    this.skel = new Map();
    for (const [key, v] of Object.entries(verses)) {
      const [s, a] = key.split(':').map(Number);
      if (a > 0) this.skel.set(key, skeleton(v.ar));
    }
  }

  /**
   * Find the verse near Lane's (Flügel) number that contains the quoted
   * Arabic. Returns { v, len, dist } for the best candidate, or null.
   * settleQuranRefs decides afterwards whether to trust it.
   *
   * Only quotations containing a word from the root count. Lane often cites a
   * verse for how the commentators explain a word that is not in the verse
   * itself, and matching his other Arabic there finds the wrong verse.
   */
  match(ref, arabic, rootLetters) {
    const needles = new Set();
    for (const a of arabic) {
      const words = fold(a).split(' ').filter((w) => hasRoot(w, rootLetters));
      if (!words.length) continue;
      const whole = skeleton(a);
      if (whole.length >= 3) needles.add(whole);
      for (const w of words) {
        const k = skeleton(w);
        if (k.length >= 3) needles.add(k);
      }
    }
    let best = null;
    for (let v = Math.max(1, ref.laneVerse - 10); v <= ref.laneVerse + 10; v++) {
      const verse = this.skel.get(`${ref.sura}:${v}`);
      if (!verse) continue;
      let len = 0;
      for (const n of needles) if (n.length > len && verse.includes(n)) len = n.length;
      if (!len) continue;
      const dist = Math.abs(v - ref.laneVerse);
      if (!best || len > best.len || (len === best.len && dist < best.dist)) best = { v, len, dist };
    }
    return best;
  }
}

/** A quotation this long (skeleton letters) is specific enough to anchor the numbering. */
const ANCHOR_LEN = 6;

/**
 * Decide every reference using all of Lane at once.
 *
 * Flügel's numbering drifts from the standard one gradually within a sura, so
 * long quotations found in a verse act as anchors: two anchors on either side
 * that agree on the offset fix it for everything between them. A short match
 * (a single common word) that disagrees with its anchors is overridden.
 *
 * Status: matched (quoted text found and consistent), inferred (placed from
 * anchors on both sides that agree), uncertain (placed from one side or from
 * anchors that disagree), unresolved (nothing to go on).
 */
function settleQuranRefs(allRefs) {
  const anchors = new Map();
  for (const r of allRefs) {
    if (!r.match || r.match.len < ANCHOR_LEN) continue;
    if (!anchors.has(r.sura)) anchors.set(r.sura, []);
    anchors.get(r.sura).push({ f: r.laneVerse, off: r.match.v - r.laneVerse, ref: r });
  }
  for (const list of anchors.values()) {
    list.sort((a, b) => a.f - b.f);
    // Drop an anchor whose neighbors agree with each other but not with it.
    for (let i = 1; i < list.length - 1; i++) {
      const [p, a, n] = [list[i - 1], list[i], list[i + 1]];
      if (p.off === n.off && a.off !== p.off && n.f - p.f <= 20) a.outlier = true;
    }
  }

  const expected = (sura, f) => {
    const list = (anchors.get(sura) ?? []).filter((a) => !a.outlier);
    let prev = null, next = null;
    for (const a of list) {
      if (a.f <= f && f - a.f <= 20) prev = a;
      if (a.f >= f && a.f - f <= 20 && !next) next = a;
    }
    if (prev && next && prev.off === next.off) return { verse: f + prev.off, sure: true };
    const side = prev && next ? (f - prev.f <= next.f - f ? prev : next) : prev ?? next;
    if (!side) return null;
    const offs = [prev?.off, next?.off].filter((o) => o !== undefined);
    return { verse: f + side.off, sure: false, range: [f + Math.min(...offs), f + Math.max(...offs)] };
  };

  for (const r of allRefs) {
    const exp = expected(r.sura, r.laneVerse);
    const m = r.match;
    const fits = m && exp && (exp.sure ? m.v === exp.verse : m.v >= exp.range[0] && m.v <= exp.range[1]);
    if (m && m.len >= ANCHOR_LEN && !anchors.get(r.sura).find((a) => a.ref === r)?.outlier) {
      Object.assign(r, { verse: m.v, status: 'matched' });
    } else if (m && (m.len >= 4 || m.dist <= 1) && (fits || !exp?.sure)) {
      Object.assign(r, { verse: m.v, status: 'matched' });
    } else if (exp) {
      Object.assign(r, { verse: exp.verse, status: exp.sure ? 'inferred' : 'uncertain' });
    } else {
      Object.assign(r, { verse: null, status: 'unresolved' });
    }
    if (r.verse) r.ref = `${r.sura}:${r.verse}`;
    if (!process.env.LANE_DEBUG) delete r.match;
  }
}

// ---------------------------------------------------------------------------
// Rendering sense text

const ORIG_VOWEL = { Ba: 'a', Bi: 'i', Bu: 'u' };

/**
 * Walk mixed content in document order. Collects text segments, keeps the
 * current page up to date, and records imperfect vowels from <choice type="infl">.
 */
function render(node, ctx, segs = []) {
  for (const c of node.children) {
    if (typeof c === 'string') { segs.push({ k: 't', v: c }); continue; }
    switch (c.name) {
      case 'pb':
        ctx.page = Number(c.attrs.n);
        ctx.pages?.add(ctx.page);
        break;
      case 'hi':
        segs.push({ k: 'it', v: plain(c, ctx) });
        break;
      case 'foreign':
        segs.push({ k: c.attrs.lang === 'ar' ? 'ar' : 'fx', lang: c.attrs.lang, v: plain(c, ctx) });
        break;
      case 'choice':
        for (const o of elements(c, 'orth')) {
          const vowel = ORIG_VOWEL[o.attrs.orig];
          if (vowel && ctx.vowels && !ctx.vowels.includes(vowel)) ctx.vowels.push(vowel);
          segs.push({ k: 'ar', v: plain(o, ctx), infl: o.attrs.orig || undefined });
        }
        break;
      case 'span':
        break; // ＝ and ― separators are read from the structure
      case 'L':
        render(c, ctx, segs);
        segs.push({ k: 'br' });
        break;
      default:
        render(c, ctx, segs);
    }
  }
  return segs;
}

// Poetry line breaks survive whitespace collapsing as this placeholder.
const LINE_SEP = String.fromCharCode(0x2028);
const LINE_SEP_RE = new RegExp(` ?${LINE_SEP} ?`, 'g');

function plain(node, ctx) {
  return segsToText(render(node, ctx));
}

function segsToText(segs) {
  return segs
    .map((s) => (s.k === 'it' ? `*${s.v.trim()}*` : s.k === 'br' ? LINE_SEP : s.v))
    .join('')
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(LINE_SEP_RE, '\n')
    .replace(/\* \*/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Structure

function buildSense(senseEl, group, ctx, env) {
  ctx.pages = new Set([ctx.page]);
  ctx.vowels = [];
  const segs = render(senseEl, ctx);
  const text = segsToText(segs);
  const ar = segs.filter((s) => s.k === 'ar' && s.v.trim()).map((s) => s.v.trim());
  const en = segs.filter((s) => s.k === 'it' && s.v.trim()).map((s) => s.v.trim());
  const other = segs.filter((s) => s.k === 'fx').map((s) => ({ lang: s.lang, text: s.v.trim() }));

  // Lane often splits one quotation over several <foreign> elements
  // ("كُتِبَ عَلَيْكُمُ" + "الصِّيَامُ"). Join neighbors separated only by space.
  const arRuns = [];
  let run = null;
  for (const s of segs) {
    if (s.k === 'ar') run = run === null ? s.v.trim() : `${run} ${s.v.trim()}`;
    else if (!(s.k === 't' && !s.v.trim())) {
      if (run) arRuns.push(run);
      run = null;
    }
  }
  if (run) arRuns.push(run);

  // "see X": the Arabic word right after "see" / "see also", or a form number.
  const see = { words: [], forms: [], roots: [] };
  for (let i = 0; i < segs.length - 1; i++) {
    if (segs[i].k !== 't') continue;
    const t = segs[i].v;
    if (/\bsee(?: also)?\s*$/i.test(t) && segs[i + 1].k === 'ar') see.words.push(segs[i + 1].v.trim());
    if (/\bart\.\s*$/.test(t) && segs[i + 1].k === 'ar') see.roots.push(segs[i + 1].v.trim());
  }
  for (const m of text.matchAll(/\bsee(?: also)? (\d{1,2})\b/gi)) see.forms.push(Number(m[1]));

  // Match each reference against the quotations next to it (between the
  // previous and the next reference), so a sense citing 2:178 and 2:183 does
  // not match both against the same words.
  const found = findQuranRefs(text);
  const quran = found.map((r, i) => {
    const window = text.slice(i ? found[i - 1].at[1] : 0, found[i + 1]?.at[0] ?? text.length);
    const local = arRuns.filter((a) => window.includes(a));
    const { at, ...ref } = r;
    ref.match = env.quran.match(r, [...(local.length ? local : arRuns), env.headword], env.rootLetters);
    env.allQuranRefs.push(ref);
    return ref;
  });

  return {
    n: senseEl.attrs.n ? Number(senseEl.attrs.n) : null,
    group,
    pages: [...ctx.pages],
    text,
    en,
    ar,
    ...(other.length ? { other } : {}),
    figurative: /\(tropical:\)/.test(text) ? 'tropical' : /\(assumed tropical:\)/.test(text) ? 'assumed' : null,
    sources: findSigla(text, env.sigla, env.unknownSigla),
    quran,
    hadith: /\btrads?\.|\btradition\b/.test(text),
    see,
    laneOnly: /^\[[\s\S]*\]\.?$/.test(text),
    ...(ctx.vowels.length ? { imperfect: ctx.vowels } : {})
  };
}

function buildEntry(entryEl, root, index, ctx, env) {
  const form = entryEl.children.find((c) => c.name === 'form');
  const iType = form && [...elements(form, 'iType')][0];
  const orths = form ? [...elements(form, 'orth')].map((o) => plain(o, ctx)).filter(Boolean) : [];
  const headword = orths[0] ?? '';
  const senses = [];
  env.headword = headword;

  const walk = (node, group) => {
    for (const c of node.children) {
      if (typeof c === 'string') continue;
      if (c.name === 'pb') { ctx.page = Number(c.attrs.n); continue; }
      if (c.name === 'form') continue;
      if (c.name === 'hom') walk(c, c.attrs.n ?? group);
      else if (c.name === 'sense') senses.push(buildSense(c, group, ctx, env));
      else walk(c, group);
    }
  };
  walk(entryEl, 'A');

  // Imperfect vowels per meaning group: ʿalima "know" (yaʿlamu) and ʿalama
  // "mark" (yaʿlumu) share one entry but are different verbs.
  const imperfect = {};
  for (const s of senses) {
    for (const v of s.imperfect ?? []) {
      imperfect[s.group] ??= [];
      if (!imperfect[s.group].includes(v)) imperfect[s.group].push(v);
    }
  }
  const isStub = senses.length > 0 && senses.every((s) => s.en.length === 0 && /\bsee\b/i.test(s.text));
  const isPhrase = /\s/.test(headword.trim());
  let lemma = headword;
  if (isPhrase) {
    lemma = headword.split(/\s+/).find((w) => hasRoot(w, root.letters)) ?? null;
  }

  return {
    id: entryEl.attrs['xml:id'] ?? `${root.id}#${index}`,
    n: entryEl.attrs.n ?? null,
    form: iType ? Number(plain(iType, ctx)) : null,
    headword,
    lemma,
    spellings: [...new Set(orths.slice(1))],
    isStub,
    isPhrase,
    ...(Object.keys(imperfect).length ? { imperfect } : {}),
    senses
  };
}

function applyCorrections(xml, rootId, corrections, log) {
  for (const c of corrections) {
    if (c.root !== rootId) continue;
    const expected = c.count ?? 1;
    const found = xml.split(c.find).length - 1;
    if (found !== expected) {
      log.push({ ...c, status: `found ${found}, expected ${expected}; not applied` });
      continue;
    }
    xml = xml.split(c.find).join(c.replace);
    c.applied = true;
    log.push({ ...c, status: 'applied' });
  }
  return xml;
}

// ---------------------------------------------------------------------------
// Main

/** Letter files sorted by printed page, so page numbers carry across files. */
function listFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => /^\d\d_\w\d\.xml$/.test(f))
    .map((f) => {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const first = src.match(/<pb n="(\d+)"/);
      return { file: f, src, firstPage: first ? Number(first[1]) : Infinity };
    })
    .sort((a, b) => a.firstPage - b.firstPage);
}

export function parseLane({ xmlDir = XML_DIR, only = null } = {}) {
  const sigla = loadSigla(path.join(xmlDir, 'Encoding.dtd'));
  const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_FILE, 'utf8')).corrections;
  const env = {
    sigla,
    unknownSigla: new Map(),
    quran: new QuranIndex(JSON.parse(fs.readFileSync(QURAN_FILE, 'utf8'))),
    allQuranRefs: []
  };
  const correctionLog = [];
  const roots = new Map(); // id -> merged root
  const ctx = { page: null };

  for (const { file, src } of listFiles(xmlDir)) {
    const section = /^\d\d_\w1\.xml$/.test(file) ? 'supplement' : 'main';
    const letterKey = file.slice(0, 2);
    // Work root by root on the raw text so corrections stay scoped to one root.
    const parts = src.split(/(?=<superEntry\b)/);
    for (const pb of parts[0].matchAll(/<pb n="(\d+)"/g)) ctx.page = Number(pb[1]);
    for (const part of parts.slice(1)) {
      const end = part.indexOf('</superEntry>') + '</superEntry>'.length;
      const id = part.match(/xml:id="Root_([^"]*)"/)?.[1] ?? `?${file}`;
      if (only && !only.includes(id)) {
        for (const pb of part.matchAll(/<pb n="(\d+)"/g)) ctx.page = Number(pb[1]);
        continue;
      }
      const xml = applyCorrections(part.slice(0, end), id, corrections, correctionLog);
      const el = [...elements(parseXml(xml), 'superEntry')][0];
      const title = [...elements(el, 'title')].find((t) => t.attrs.type === 'root');
      const rootAr = title ? plain(title, { page: ctx.page }).replace(/\s+/g, '') : '';

      if (!roots.has(id)) {
        roots.set(id, { id, letterKey, root: rootAr, letters: [...fold(rootAr).replace(/ /g, '')], records: [] });
      }
      const root = roots.get(id);
      env.rootLetters = root.letters;
      const startPage = ctx.page;
      const entries = [];
      let i = 0;
      for (const c of el.children) {
        if (typeof c === 'string') continue;
        if (c.name === 'pb') ctx.page = Number(c.attrs.n);
        else if (c.name === 'entry') entries.push(buildEntry(c, root, i++, ctx, env));
      }
      root.records.push({ section, file, pages: [startPage, ctx.page], entries });
      // Pages after the root's closing tag (before the next root).
      for (const pb of part.slice(end).matchAll(/<pb n="(\d+)"/g)) ctx.page = Number(pb[1]);
    }
  }

  settleQuranRefs(env.allQuranRefs);

  for (const c of corrections) {
    if (!c.applied && (!only || only.includes(c.root)) && !correctionLog.some((l) => l.root === c.root && l.find === c.find)) {
      correctionLog.push({ ...c, status: 'root not found' });
    }
  }
  return { roots, sigla, env, correctionLog };
}

function stats(roots, env, correctionLog) {
  let entries = 0, senses = 0, stubs = 0, phrases = 0, phraseNoLemma = 0, withImperfect = 0;
  let both = 0, suppOnly = 0;
  for (const r of roots.values()) {
    const sections = new Set(r.records.map((x) => x.section));
    if (sections.size === 2) both++;
    else if (sections.has('supplement')) suppOnly++;
    for (const rec of r.records) {
      for (const e of rec.entries) {
        entries++;
        senses += e.senses.length;
        if (e.isStub) stubs++;
        if (e.isPhrase) { phrases++; if (!e.lemma) phraseNoLemma++; }
        if (e.imperfect) withImperfect++;
      }
    }
  }
  const q = env.allQuranRefs;
  const count = (s) => q.filter((r) => r.status === s).length;
  return {
    roots: roots.size,
    rootsInBothParts: both,
    rootsSupplementOnly: suppOnly,
    entries,
    senses,
    stubEntries: stubs,
    phraseEntries: phrases,
    phraseEntriesWithoutLemma: phraseNoLemma,
    entriesWithImperfect: withImperfect,
    quranRefs: {
      total: q.length,
      matched: count('matched'),
      inferred: count('inferred'),
      uncertain: count('uncertain'),
      unresolved: count('unresolved')
    },
    corrections: {
      applied: correctionLog.filter((c) => c.status === 'applied').length,
      failed: correctionLog.filter((c) => c.status !== 'applied').length
    }
  };
}

function main() {
  const onlyArg = process.argv.indexOf('--only');
  const only = onlyArg > -1 ? process.argv[onlyArg + 1].split(',') : null;
  if (!fs.existsSync(XML_DIR)) {
    console.error(`Lane XML not found at ${XML_DIR}. Set LANE_XML_DIR.`);
    process.exit(1);
  }
  const { roots, sigla, env, correctionLog } = parseLane({ only });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const byLetter = new Map();
  for (const r of roots.values()) {
    const { letters, ...out } = r;
    if (!byLetter.has(r.letterKey)) byLetter.set(r.letterKey, []);
    byLetter.get(r.letterKey).push(out);
  }
  for (const [key, list] of byLetter) {
    fs.writeFileSync(path.join(OUT_DIR, `${key}.json`), JSON.stringify(list));
  }

  const summary = stats(roots, env, correctionLog);
  const report = {
    generated: new Date().toISOString(),
    source: XML_DIR,
    ...(only ? { only } : {}),
    stats: summary,
    corrections: correctionLog,
    unresolvedQuran: env.allQuranRefs.filter((r) => r.status === 'unresolved').map(({ lane, sura, laneVerse }) => ({ lane, sura, laneVerse })),
    unknownSigla: [...env.unknownSigla].sort((a, b) => b[1] - a[1]).slice(0, 80),
    sigla: Object.fromEntries([...sigla].map(([k, v]) => [k, v.expansion]))
  };
  fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  const failed = correctionLog.filter((c) => c.status !== 'applied');
  if (failed.length) console.warn('Corrections not applied:', failed);
  console.log(`Wrote ${byLetter.size} letter files and report.json to ${OUT_DIR}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
