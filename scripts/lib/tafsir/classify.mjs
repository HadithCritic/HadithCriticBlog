/* Reads the structure of one commentary passage and returns the blocks it is
   rendered from.

   Every block keeps its source text in order and unchanged; the classifier
   only decides where one block ends and what kind it is. Classifications are
   editorial and are labelled as such on the page. Block types:

     lemma   the commentator's heading quoting the verse ("The statement in the
             interpretation of His saying: ...")
     p       a paragraph; v: the opening formula when the commentator speaks in
             his own voice ("Abu Jaʿfar said:"); cont: split from a long paragraph
     intro   a sentence introducing the reports that follow ("Mention of those
             who said that:")
     report  a transmitted report: c chain, m matn, via the last named authority
     quote   a Qur'anic passage quoted with its citation
     arg     an objection (q) and its answer (a), each with its opening formula
     poem    verse cited as evidence: i introduction, x the verse or lines
   Paragraph tags: lang (discusses language), qir (discusses the readings). */

import { opensReport, parseChain } from './chain.mjs';
import { inline, sentences, squash, unsentinel, flatten, plain } from './text.mjs';

/* ── Sentence kinds ────────────────────────────────────────────── */

const VOICE = /^([“"‘]?Ab[uū] Ja(?:ʿ|'|’|‘|a)?far(?: al-Ṭabarī| al-Tabari| Muḥammad ibn Jarīr)?(?:\s*[^]*)?(?:,? may God (?:have mercy on|be pleased with) him,?)?\s+said\s*:)\s*/;
const LEMMA = /^(?:And\s+)?(?:The\s+|the\s+)?(?:statement|discussion|explanation|saying|words?|interpretation|commentary|account)\s+(?:of\s+the\s+(?:interpretation|explanation)\s+)?(?:in|on|of|about|concerning|regarding)\s+(?:the\s+)?(?:interpretation|explanation|meaning|commentary|exegesis)\s+of\s+/i;
const DISCUSSION = /^(?:Others|Some (?:of them|others|people|said|scholars|of the)|Another (?:group|said|view)|One group|A group|Others among them|Those who said|Mention of|Who said that|The people of (?:interpretation|knowledge|exegesis|Arabic)|The interpreters|The scholars|Some of the people|Among those who said)\b/;
const OBJECTION = /^(?:And\s+|So\s+|But\s+)?(?:if|If)\s+(?:someone|anyone|a\s+(?:questioner|person|man|critic|speaker)|one|it\s+(?:is|were|be)|he|they)\s+(?:were\s+to\s+|should\s+|then\s+)?(?:say|says|said|ask|asks|asked|object|objects|objected|argue|argues|claim|claims|think|thinks|imagine|imagines)\b|^Someone (?:might|may) (?:say|ask)\b/;
const ANSWER = /^(?:It\s+(?:is|was|will\s+be|would\s+be|should\s+be)\s+said(?:\s+to\s+(?:him|them|that\s+one|the\s+one\s+who\s+said\s+that))?\s*[:,]|We\s+(?:say|said|would\s+say|reply)\s*[:,]|The\s+(?:answer|reply)(?:\s+to\s+(?:him|that|this))?\s+is\b|Say\s+to\s+him\s*:)/;
const GLOSS = /^(?:He (?:means|meant|intends|intended|is saying)|By (?:this|that|his saying|his words)|Meaning\b|That is,|i\.e\.)/;
const POEM_INTRO = /^([\s\S]*?\b(?:the poet|poet|poetess|another|[A-Z][\w’'ʿʾ\-āīūḥṣḍṭẓ]+(?:\s+(?:ibn|bin|b\.|bint|al-|Ibn|Bin|Al-)?[\w’'ʿʾ\-āīūḥṣḍṭẓ]+){0,5})\s+(?:said|says|recited|recites)(?:\s+in\s+(?:his|her|a|the)\s+(?:poem|verse|ode|rajaz|poetry))?\s*:|[\s\S]*?\b(?:the\s+)?(?:saying|words|verse|line) of (?:the poet|another|[A-Z][^:]{1,60}?)\s*:)\s*([\s\S]+)$/;
const POEM_WORD = /\b(?:poet|poetess|poem|verse of poetry|rajaz|ode|recited|line of)\b/i;
const SACRED = /\b(?:God|Allah|Most High|Exalted|Prophet|Messenger|His statement|His saying|His words|Gabriel|Qur['’]an)\b/;

const LANGUAGE = /\b(?:Arabs?|Arabic|grammar(?:ians)?|Kufans?|Basrans?|nominative|accusative|genitive|jussive|vocative|particle|preposition|plural|singular|dual|verbal noun|maṣdar|masdar|morpholog\w*|lexic\w*|idiom\w*|ellipsis|elided|elision|omitted|omission|dialect|conjugat\w*|derived from|derivation|inflect\w*|syntax|predicate|subject of|object of|poetry|poet)\b/gi;

/* ── The readings (qirāʾāt) ────────────────────────────────────── */

const READING = [
  /\b(?:readers|reciters|Qur['’]?an readers|qurrāʾ|qurra['’]?)\b/i,
  /\b(?:read|reads|recited|recite|recites)\s+(?:it|this|that|them|these|those|the word|the verse|the letter|with|as)\b/i,
  /\b(?:is|was|were|be|been)\s+(?:read|recited)\b/i,
  /\b(?:the|two|this|that|other|his|their|our|whose|a|one|each)\s+(?:\w+\s+)?(?:readings?|recitations?)\b/i,
  /\bqirāʾ(?:a|āt)\b|\bqira['’]?(?:a|at)\b/i,
];
const PREFERENCE = /\b(?:the\s+(?:correct|right|sound|preferred|better|best|most\s+correct|soundest|proper|more\s+correct|chosen)\s+(?:one\s+)?(?:of\s+the\s+(?:two\s+)?)?(?:readings?|recitations?)|the\s+(?:reading|recitation)\s+(?:that|which)\s+(?:we|I)\s+(?:choose|prefer|consider|regard|hold|deem)|(?:we|I)\s+(?:choose|prefer)\s+(?:the|this|that)\s+(?:reading|recitation)|the\s+(?:reading|recitation)\s+(?:that\s+is|which\s+is)\s+(?:correct|right|sound|preferable)|both\s+(?:readings|recitations)\s+are\s+(?:correct|sound|valid|acceptable|well[- ]known))/i;
const READERS = [
  'Nāfiʿ', 'Nafiʿ', "Nafi'", 'Nafi', 'Ibn Kathīr', 'Ibn Kathir', 'Abū ʿAmr', 'Abu ʿAmr', "Abu 'Amr", 'Abu Amr', 'Ibn ʿĀmir', "Ibn 'Amir", 'Ibn Amir',
  'ʿĀṣim', "'Asim", 'Asim', 'Ḥamza', 'Hamza', 'al-Kisāʾī', "al-Kisa'i", 'al-Kisai', 'Kisai', 'Yaʿqūb', "Ya'qub", 'Yaqub', 'Khalaf',
  'Ibn Masʿūd', "Ibn Mas'ud", 'Ibn Masud', 'Ubayy', 'al-Aʿmash', "al-A'mash", 'al-Amash', 'Ibn Muḥayṣin', 'Ibn Muhaysin', 'Shayba',
  'Abū Jaʿfar al-Madanī', 'Yazīd ibn al-Qaʿqāʿ', 'Ibn Abī Isḥāq', 'ʿĪsā ibn ʿUmar', 'al-Ḥasan', 'al-Hasan', 'Mujāhid', 'Mujahid', 'Qatāda', 'Qatada',
  'Ibn ʿAbbās', 'Ibn Abbas', 'Ibn ʿUmar', 'ʿĀʾisha', 'Aisha', 'Ibn al-Zubayr',
];
const REGIONS = /\b(?:(?:readers|reciters|people|reading) of (?:Medina|Madinah|Mecca|Makkah|Kufa|Kūfa|Basra|Baṣra|Syria|al-Shām|the Levant|the Hijaz|the Ḥijāz|Iraq)|the (?:Kufans|Kūfans|Basrans|Baṣrans|Medinans|Meccans|Syrians|Hijazis))\b/g;

export function readingEvidence(sentence) {
  const text = unsentinel(sentence);
  if (!READING.some((re) => re.test(text))) return null;
  const voice = text.match(VOICE)?.[0] ?? '';
  const body = text.slice(voice.length);
  const names = READERS.filter((name) => new RegExp(`(?<![\\w’'ʿ])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w’'ʿ])`).test(body));
  const regions = [...new Set(body.match(REGIONS) ?? [])];
  return { preference: PREFERENCE.test(text), names, regions };
}

/* ── Verse wording to highlight (translations without braces) ─── */

const STOP = new Set('the and that this with from those have they them their there which what when where your yours upon unto into will shall were been being about over said says saying statement words word his him who whom you'.split(' '));
const PHRASE = /\b(?:His|his|God['’]s|the Most High['’]s|the Exalted['’]s|Allah['’]s)\s+(?:statement|saying|words?)\s*(?:,|:)?\s*[“"]?([A-Z][^,.;:?!“”"{}]{6,140})/g;

const content = (s) => new Set((s.toLowerCase().match(/[a-zāīūḥṣḍṭẓʿʾ']{4,}/g) ?? []).filter((w) => !STOP.has(w)));

/** Wording of the verse as the commentary quotes it, for translations that do
    not mark Qur'anic text. A candidate must share a content word with the verse
    or recur in the passage, so stray clauses are not highlighted. */
export function versePhrases(text, verseEnglish) {
  const verseWords = content(verseEnglish ?? '');
  const found = new Map();
  for (const m of text.matchAll(PHRASE)) {
    const phrase = m[1].trim().replace(/\s+(?:is|was|means|meaning|he said|and|that|which)$/i, '');
    if (phrase.split(/\s+/).length < 3) continue;
    found.set(phrase, (found.get(phrase) ?? 0) + 1);
  }
  const out = [];
  for (const [phrase] of found) {
    const recurs = text.split(phrase).length - 1 + (text.split(phrase[0].toLowerCase() + phrase.slice(1)).length - 1);
    const shared = [...content(phrase)].some((w) => verseWords.has(w));
    if (shared || recurs >= 2) out.push(phrase);
  }
  return out.sort((a, b) => b.length - a.length).slice(0, 12);
}

/* ── Classifier ────────────────────────────────────────────────── */

const LONG = 1400;
const CHUNK = 900;

/**
 * @param {Array<{kind:'text', text:string} | {kind:'report', isnad:string, matn:string, via?:string}
 *   | {kind:'poem', lines:string[]} | {kind:'marker', text:string}>} items
 * @param {{ phrases?: string[], verses?: (s:number)=>number }} ctx
 */
export function classify(items, ctx = {}) {
  const blocks = [];
  const flags = [];
  const run = (text) => inline(text, ctx);

  for (const item of items) {
    if (item.kind === 'marker') blocks.push({ t: 'intro', x: run(item.text) });
    else if (item.kind === 'poem') blocks.push({ t: 'poem', lines: item.lines.map(run) });
    else if (item.kind === 'report') {
      blocks.push({ t: 'report', c: run(item.isnad), m: run(item.matn), via: item.via ?? null, typed: 1 });
    } else if (item.kind === 'text') {
      for (const paragraph of item.text.split(/\n+/)) {
        if (paragraph.trim()) readParagraph(paragraph.trim(), blocks, flags, run);
      }
    }
  }

  // An introducing sentence that ends in a colon and leads into a report.
  for (let i = 0; i < blocks.length - 1; i++) {
    const b = blocks[i];
    if (b.t === 'p' && !b.v && !b.cont && blocks[i + 1].t === 'report' && /:\s*$/.test(flatten(b.x)) && flatten(b.x).length < 400) b.t = 'intro';
  }

  // Tags and evidence.
  const readings = [];
  blocks.forEach((b, i) => {
    const text = blockText(b);
    if (b.t === 'p') {
      const hits = new Set((unsentinel(text).match(LANGUAGE) ?? []).map((w) => w.toLowerCase()));
      if (hits.size >= 2) b.tag = 'lang';
    }
    for (const s of sentences(squash(text))) {
      const ev = readingEvidence(s);
      if (!ev) continue;
      readings.push({ b: i, text: squash(unsentinel(s)), ...ev });
      if (b.t === 'p') b.tag = 'qir';
    }
  });

  for (const b of blocks) {
    if (b.t === 'report' && !b.c) flags.push('report-chain-unread');
    if (b.t === 'report' && flatten(b.m).length > 1800) flags.push('report-long');
  }

  return { blocks, sections: sectionize(blocks), readings: summarizeReadings(readings), flags };
}

/* A report can begin straight after a colon inside a sentence ("... on the
   authority of Ibn Abbas and others: Muhammad ibn al-Ala' told us: ..."). Such
   a sentence is split at that colon so the report is read as one. */
function splitAtReports(list) {
  const out = [];
  for (const s of list) {
    let rest = s;
    for (let guard = 0; guard < 4; guard++) {
      const at = [...rest.matchAll(/:\s+/g)].find((m) => m.index > 20 && opensReport(rest.slice(m.index + m[0].length)) && !opensReport(rest));
      if (!at) break;
      out.push(rest.slice(0, at.index + 1));
      rest = rest.slice(at.index + at[0].length);
    }
    out.push(rest);
  }
  return out;
}

function readParagraph(paragraph, blocks, flags, run) {
  const list = splitAtReports(sentences(paragraph));
  let prose = null; // { lead, parts: string[], cont }
  let report = null; // string[]

  const flushProse = () => {
    if (prose && (prose.parts.length || prose.lead)) {
      pushProse({ t: 'p', ...(prose.lead ? { v: prose.lead } : {}), ...(prose.cont ? { cont: 1 } : {}) }, prose.parts.join(' '), run, blocks);
    }
    prose = null;
  };
  const flushReport = () => {
    if (report) {
      const text = report.join(' ');
      const chain = parseChain(text);
      blocks.push(chain
        ? { t: 'report', c: run(text.slice(0, chain.chainEnd)), m: run(text.slice(chain.chainEnd)), via: chain.via }
        : { t: 'report', c: null, m: run(text), via: null });
    }
    report = null;
  };
  const flush = () => (flushProse(), flushReport());
  const addProse = (s, next) => {
    if (!prose) prose = { lead: null, parts: [], cont: false };
    prose.parts.push(s);
    const length = prose.parts.join(' ').length + (prose.lead?.length ?? 0);
    // Never break before a citation, which belongs to the sentence it closes.
    if (length >= CHUNK && paragraph.length > LONG && !/^[([]/.test(next ?? '') && !/:\s*$/.test(s)) {
      const cont = { lead: null, parts: [], cont: true };
      flushProse();
      prose = cont;
    }
  };

  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const bare = unsentinel(s).replace(/^[“"‘]/, '');

    if (LEMMA.test(bare)) {
      flush();
      blocks.push({ t: 'lemma', x: run(s) });
      continue;
    }
    const voice = s.match(VOICE);
    if (voice) {
      flush();
      const rest = s.slice(voice[0].length);
      if (rest && opensReport(rest)) {
        // The formula introduces a report: it stays as its own line, in place.
        blocks.push({ t: 'p', v: voice[1], x: [] });
        report = [rest];
        continue;
      }
      prose = { lead: voice[1], parts: rest ? [rest] : [], cont: false };
      continue;
    }
    if (opensReport(s)) {
      // A closing "...said that:" introduces the reports; it becomes their introduction.
      const last = prose?.parts[prose.parts.length - 1];
      if (last && /:\s*$/.test(last) && last.length < 400 && !(prose.lead && prose.parts.length === 1)) {
        prose.parts.pop();
        flush();
        blocks.push({ t: 'intro', x: run(last) });
      } else flush();
      report = [s];
      continue;
    }
    if (report) {
      if (DISCUSSION.test(bare) || OBJECTION.test(bare)) flushReport();
      else {
        report.push(s);
        continue;
      }
    }
    if (OBJECTION.test(bare)) {
      const answerAt = list.findIndex((t, k) => k > i && k <= i + 6 && ANSWER.test(unsentinel(t)));
      if (answerAt > 0) {
        flush();
        let end = answerAt + 1;
        while (end < list.length && end <= answerAt + 4) {
          const next = unsentinel(list[end]);
          if (LEMMA.test(next) || VOICE.test(next) || opensReport(list[end]) || DISCUSSION.test(next) || OBJECTION.test(next) || POEM_INTRO.test(next)) break;
          end++;
        }
        const q = list.slice(i, answerAt).join(' ');
        const a = list.slice(answerAt, end).join(' ');
        const qLead = formula(q, /^[^:]{0,140}:/);
        const aLead = formula(a, ANSWER);
        blocks.push({ t: 'arg', q: { l: qLead, x: run(q.slice(qLead.length).trimStart()) }, a: { l: aLead, x: run(a.slice(aLead.length).trimStart()) } });
        i = end - 1;
        continue;
      }
      flags.push('objection-without-answer');
    }
    if (DISCUSSION.test(bare)) flushProse();

    // Verse cited as evidence, read up to the commentator's gloss.
    const poem = bare.length < 1600 ? s.match(POEM_INTRO) : null;
    if (poem && !SACRED.test(poem[1].slice(-80))) {
      const glossAt = list.findIndex((t, k) => k > i && k <= i + 3 && GLOSS.test(unsentinel(t)));
      if (glossAt > 0 || POEM_WORD.test(poem[1])) {
        flushProse();
        const verse = [poem[2], ...(glossAt > 0 ? list.slice(i + 1, glossAt) : [])].join(' ');
        blocks.push({ t: 'poem', i: run(poem[1]), x: run(verse) });
        if (glossAt < 0) flags.push('poem-without-gloss');
        i = glossAt > 0 ? glossAt - 1 : i;
        continue;
      }
    }
    addProse(s, list[i + 1]);
  }
  flush();
}

function formula(text, re) {
  const m = text.match(re);
  return m && m[0].length < 160 ? m[0] : '';
}

/* A Qur'anic passage in quotation marks (or braces) followed by its citation
   becomes a quotation card; the text around it stays where it was. */
const QUOTE = /(“[^“”]{12,700}”|"[^"]{12,700}"|\{[^{}]{12,700}\})(\s*)(\([A-Z][A-Za-z‘’'ʿʾ\-āīūḥṣḍṭẓĀĪŪḤṢḌṬẒ ]{1,30}?(?:\s+\d{1,3})?\s*:\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?\)|\[\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?\])([.,;:]?)/;

/* A passage the commentator introduces as God's words ("as the Most High said:")
   and closes with a citation. The match is shaped like QUOTE's: [whole, quote,
   space, citation, trailing punctuation], with index at the quote. */
const SAID_INTRO = /\b(?:God|Allah|the Most High|the Exalted|our Lord|He|His (?:statement|saying|revelation|words))\b[^:.()]{0,60}?\b(?:said|says|saying|states|stated)\b[^:.()]{0,40}?:\s*/g;
const CITE_AHEAD = /^([^:()]{8,700}?)(\s*)(\([A-Z][A-Za-z‘’'ʿʾ\-āīūḥṣḍṭẓĀĪŪḤṢḌṬẒ ]{1,30}?(?:\s+\d{1,3})?\s*:\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?\)|\[\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?\])([.,;:]?)/;

function quoteAfterSaid(raw) {
  for (const intro of raw.matchAll(SAID_INTRO)) {
    const start = intro.index + intro[0].length;
    const m = raw.slice(start).match(CITE_AHEAD);
    if (!m || /[{}]/.test(m[1])) continue;
    const out = [m[0], m[1], m[2], m[3], m[4]];
    out.index = start;
    return out;
  }
  return null;
}

function pushProse(block, raw, run, blocks) {
  const m = raw.match(QUOTE) ?? quoteAfterSaid(raw);
  const ref = m ? run(m[3]) : null;
  // Text glued to the citation ("[73:20]—whether") cannot be split off cleanly.
  const glued = m && /^\S/.test(raw.slice(m.index + m[0].length));
  if (!m || glued || ref.length !== 1 || ref[0][0] !== 'r') {
    blocks.push({ ...block, x: run(raw) });
    return;
  }
  const before = raw.slice(0, m.index).trimEnd();
  const after = raw.slice(m.index + m[0].length).trimStart();
  if (before || block.v) blocks.push({ ...block, x: run(before) });
  blocks.push({ t: 'quote', x: run(m[1]), r: ref[0], ...(m[2] !== ' ' ? { sp: m[2] } : {}), ...(m[4] ? { tp: m[4] } : {}) });
  if (after) pushProse({ t: 'p', cont: 1 }, after, run, blocks);
}

/* ── Sections ──────────────────────────────────────────────────── */

/** Groups blocks into the sections listed in the contents rail. A run of two
    or more reports is its own section; a lemma heading, a voice paragraph
    after reports, or the end of a run starts a new discussion section. */
export function sectionize(blocks) {
  const sections = [];
  let current = null;
  const open = (k) => (current = { k, b: [] }, sections.push(current));
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === 'report' && current?.k === 'reports') {
      current.b.push(i);
      continue;
    }
    let runLength = 0;
    if (b.t === 'report' || (b.t === 'intro' && blocks[i + 1]?.t === 'report')) {
      let k = b.t === 'intro' ? i + 1 : i;
      while (blocks[k]?.t === 'report') runLength++, k++;
    }
    if (runLength >= 2 && current?.k !== 'reports') open('reports');
    else if (runLength < 2 && (b.t === 'lemma' || !current || current.k === 'reports' || (b.v && current.b.some((x) => x.t === 'report')))) open('explain');
    current.b.push(i);
  }
  for (const s of sections) {
    if (s.k !== 'explain') continue;
    const kinds = s.b.map((i) => blocks[i]);
    const paras = kinds.filter((b) => b.t === 'p');
    const share = (tag) => paras.length && paras.filter((b) => b.tag === tag).length / paras.length;
    if (share('qir') >= 0.5) s.k = 'readings';
    else if (kinds.some((b) => b.t === 'poem') || share('lang') >= 0.5) s.k = 'language';
    else if (kinds.some((b) => b.t === 'arg') && paras.length <= 3) s.k = 'argument';
  }
  return sections;
}

function summarizeReadings(list) {
  const names = [...new Set(list.flatMap((e) => e.names))];
  const regions = [...new Set(list.flatMap((e) => e.regions))];
  const status = !list.length ? 'none' : list.some((e) => e.preference) ? 'preference' : 'discussed';
  return { status, names, regions, evidence: list.map(({ b, text, preference }) => ({ b, text, ...(preference ? { p: 1 } : {}) })) };
}

/* ── Integrity ─────────────────────────────────────────────────── */

/** The source text of a block, as written. */
export function blockText(b) {
  switch (b.t) {
    case 'p': return [b.v ?? '', flatten(b.x)].filter(Boolean).join(' ');
    // A parsed chain keeps the space before the matn; a typed one is a separate field.
    case 'report': return b.c ? `${flatten(b.c)}${b.typed ? ' ' : ''}${flatten(b.m)}` : flatten(b.m);
    case 'quote': return `${flatten(b.x)}${b.sp ?? ' '}${b.r[1]}${b.tp ?? ''}`;
    case 'arg': return [b.q.l, flatten(b.q.x), b.a.l, flatten(b.a.x)].filter(Boolean).join(' ');
    case 'poem': return b.lines ? b.lines.map(flatten).join(' ') : [flatten(b.i), flatten(b.x)].join(' ');
    default: return flatten(b.x);
  }
}

/** Reading text of a block without markup, for search and word counts. */
export function blockPlain(b) {
  switch (b.t) {
    case 'p': return [b.v ?? '', plain(b.x)].filter(Boolean).join(' ');
    case 'report': return b.c ? `${plain(b.c)}${b.typed ? ' ' : ''}${plain(b.m)}` : plain(b.m);
    case 'quote': return `${plain(b.x)} ${b.r[1]}${b.tp ?? ''}`;
    case 'arg': return [b.q.l, plain(b.q.x), b.a.l, plain(b.a.x)].filter(Boolean).join(' ');
    case 'poem': return b.lines ? b.lines.map(plain).join(' ') : `${plain(b.i)} ${plain(b.x)}`;
    default: return plain(b.x);
  }
}

/** True when the blocks reproduce the source exactly, ignoring only spacing. */
export function reproduces(blocks, source) {
  const rendered = squash(unsentinel(blocks.map(blockText).join(' ')));
  return rendered === squash(unsentinel(source));
}
