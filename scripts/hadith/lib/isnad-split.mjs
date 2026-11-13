/*
 * Deterministic isnad/matn splitting for reports whose supplied text is one undivided passage.
 *
 * The splitter never rewrites text. It only finds the offset where the transmission chain ends, so
 * that `isnad + separator + matn` equals the original passage (see reconstructs()). Arabic is split
 * first; the English split follows the same chain grammar over the English words. A passage with no
 * chain returns null, and the readers then show an explicit "No isnad" label instead of a fake chain.
 */

const INVISIBLE = /[​-‏‪-‮⁦-⁩﻿]/g;
const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const PUNCT = /[،؛.,;:«»"“”'()[\]{}‘’*]/g;

const norm = word => word.replace(INVISIBLE, '').replace(TASHKEEL, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي');
const bare = word => norm(word).replace(PUNCT, '');

// Chain verbs and formulas (normalized: no diacritics, bare alef, ya for alef maqsura).
const AR_VERBS = new Set([
  'حدثنا', 'حدثني', 'حدثنيه', 'حدثناه', 'حدثتنا', 'حدثه', 'حدثهم', 'اخبرنا', 'اخبرني', 'اخبرناه', 'اخبرتنا', 'اخبره', 'اخبرهم', 'انبانا', 'انباني', 'انبا', 'انبانيه',
  'انا', 'نا', 'ثنا', 'نبانا', 'ثني', 'قرات', 'اجازني', 'اجازنا', 'كتب', 'سمعت',
]);
const AR_REFS = new Set(['وبه', 'وبالاسناد', 'وباسناده', 'وبهذا', 'وباسناد', 'باسناده', 'بالاسناد', 'وبذلك', 'وبالسند']);
const AR_SAID = new Set(['قال', 'قالت', 'قالا', 'قالوا', 'يقول', 'يحدث', 'يحدثنا', 'وقال', 'وقالت']);
const AR_THAT = new Set(['ان', 'انه', 'انها', 'انهم', 'ان.']);
const AR_STOP_NAME = new Set([...AR_SAID, ...AR_THAT, 'عن']);
const AR_APPOSITIVE = new Set(['مولي', 'مولاه', 'مولاها', 'اخي', 'اخو', 'صاحب', 'جار', 'عم', 'خال', 'والد', 'ابن', 'بن', 'ابو', 'ابي', 'ام', 'امراه', 'جد', 'جده', 'ابنه', 'ابنها', 'يقال', 'يعني', 'يعنى', 'وهو', 'وهي', 'واسمه', 'اسمه', 'وكان', 'وكانت']);
const AR_HONORIFIC = new Set(['رسول', 'الله', 'النبي', 'نبي', 'صلي', 'عليه', 'وسلم', 'السلام', 'رضي', 'عنه', 'عنها', 'عنهما', 'ﷺ', 'ﷺ', '﴿', '﴾', 'ﵠ', '﵌', '﵇', '﵁', '﵂', 'ﵐ', 'عليهما', 'وآله', 'واله', 'تعالي', 'عز', 'وجل']);
const AR_ELLIPTIC = new Set(['يرفعه', 'رفعه', 'مرفوعا', 'يسنده', 'يبلغ', 'يبلغه', 'رواية', 'يرويه', 'بلغه']);

const AN = word => (word === 'وعن' ? 'عن' : word);
const baseVerb = word => (AR_VERBS.has(word) ? word : word.startsWith('و') && AR_VERBS.has(word.slice(1)) ? word.slice(1) : word.startsWith('ف') && AR_VERBS.has(word.slice(1)) ? word.slice(1) : null);

function tokens(text) {
  const out = [];
  for (const match of text.matchAll(/\S+/g)) {
    const raw = match[0];
    const clean = raw.replace(INVISIBLE, '');
    if (!clean) continue;
    if (/^[:：،,;؛]+$/.test(clean) && out.length) {
      const last = out[out.length - 1];
      last.end = match.index + raw.length;
      if (/[:：]/.test(clean)) last.colon = true; else last.comma = true;
      continue;
    }
    out.push({ raw, start: match.index, end: match.index + raw.length, word: AN(bare(raw)), colon: /[:：]$/.test(clean), comma: /[،,;؛]$/.test(clean), opens: /^[«"“„[{(]/.test(clean) });
  }
  return out;
}

/**
 * Consumes a transmitter name phrase starting at index i and returns the index after it.
 * A name ends at a comma or colon on its last word, or before a verb, "from", "said", "that", or an opening quote.
 */
function consumeNameAr(list, i) {
  let count = 0;
  while (i < list.length) {
    const token = list[i];
    if (token.opens && count > 0) break;
    if (count > 0 && (AR_STOP_NAME.has(token.word) || AR_ELLIPTIC.has(token.word) || baseVerb(token.word) || AR_REFS.has(token.word))) break;
    if (count === 0 && (AR_SAID.has(token.word) || AR_THAT.has(token.word) || token.word === 'عن')) break;
    i += 1;
    count += 1;
    if (token.colon) break;
    if (token.comma) {
      // A comma may separate parallel names or an appositive ("..., مولى علي ...") before the next link.
      const next = list[i];
      if (next && (AR_APPOSITIVE.has(next.word) || AR_APPOSITIVE.has(next.word.replace(/^و/, '')) || AR_HONORIFIC.has(next.word)
        || (next.word === 'من' && /^(?:بني|بنو|اهل|ال|ولد|بطون|قريش|اهل)$/.test(list[i + 1]?.word ?? '')))) continue;
      let ahead = -1;
      for (let k = i; k < Math.min(list.length, i + 6); k += 1) {
        const probe = list[k];
        if (probe.word === 'عن') { ahead = k; break; }
        if (probe.colon || probe.opens || AR_SAID.has(probe.word) || AR_THAT.has(probe.word) || baseVerb(probe.word)) break;
      }
      if (ahead > i && /^و/.test(list[i].word)) { i = ahead; break; }
      break;
    }
    if (count > 16) return -1;
  }
  return count ? i : -1;
}

const isSaid = token => token && AR_SAID.has(token.word);

/**
 * After the last transmitter, the reporting formula that introduces the words ("قال:", "قال رسول الله ﷺ:",
 * "أنه قال:", "أنه سمع أنسا يقول:") belongs to the isnad. Returns the new end index.
 */
function absorbReporting(list, start) {
  let i = start;
  for (let round = 0; round < 3; round += 1) {
    let j = i;
    const lead = list[j] && AR_THAT.has(list[j].word);
    if (lead) j += 1;
    let found = -1;
    for (let k = j; k < Math.min(list.length, j + (lead ? 12 : 9)); k += 1) {
      const token = list[k];
      if (token.opens && k > j) break;
      if (isSaid(token) && (token.colon || list[k + 1]?.opens || k + 1 >= list.length)) {
        // plain "قال:" or "قال النبي ﷺ:" with only honorific words between "قال" and the colon
        found = token.colon ? k + 1 : k + 1;
        const tail = list.slice(k + 1, found);
        if (!token.colon) found = k + 1;
        void tail;
        break;
      }
      if (isSaid(token) && !token.colon) {
        // "قال النبي ﷺ:" : find the colon within a few honorific words
        let m = k + 1;
        while (m < list.length && m < k + 8 && !list[m - 1].colon && (AR_HONORIFIC.has(list[m].word) || list[m].word === '')) m += 1;
        if (list[m - 1].colon) { found = m; break; }
        if (!lead && m < list.length && list[m].opens) { found = m; break; }
        if (!lead && m > k + 1 && AR_HONORIFIC.has(list[m - 1].word)) { found = m; break; }
        break;
      }
      if (token.colon && !lead) break;
    }
    if (found < 0) break;
    i = found;
    if (!(list[i] && (isSaid(list[i]) || AR_THAT.has(list[i].word)))) break;
  }
  return i;
}

/** Returns the token index where the matn starts, or -1 when the passage has no chain. */
function arabicChainEnd(list) {
  const isLink = token => token && (baseVerb(token.word) || AR_REFS.has(token.word) || token.word === 'عن');
  const isNoise = token => token && (token.word === '' || token.word === 'ح');
  let i = 0;
  let end = -1;
  if (list[0] && AR_SAID.has(list[0].word)) {
    if (isLink(list[1])) { i = 1; end = 1; }
    else {
      const after = consumeNameAr(list, 1);
      if (after > 0 && after - 1 <= 7 && isLink(list[after])) { i = after; end = after; }
    }
  }
  while (i < list.length) {
    const token = list[i];
    const verb = baseVerb(token.word);
    if (isNoise(token) && end >= 0) { i += 1; continue; }
    if (verb || AR_REFS.has(token.word)) {
      i += 1;
      if (verb === 'قرات' && list[i]?.word === 'علي') i += 1;
      if (verb === 'كتب' && list[i]?.word === 'الي') i += 1;
      if (list[i] && !list[i - 1].colon) {
        const next = consumeNameAr(list, i);
        if (next > 0) i = next;
      }
      end = i;
      continue;
    }
    if (token.word === 'عن') {
      i += 1;
      const next = consumeNameAr(list, i);
      if (next < 0) break;
      i = next;
      end = i;
      continue;
    }
    if (end >= 0 && AR_SAID.has(token.word)) {
      // "قال: ثنا فلان" continues the chain; otherwise this is the reporting formula
      let j = i + 1;
      while (isNoise(list[j])) j += 1;
      if (isLink(list[j])) { i = j; end = j; continue; }
      break;
    }
    break;
  }
  if (end < 0) return -1;
  while (list[end] && list[end].word === '') end += 1;
  while (list[end] && AR_ELLIPTIC.has(list[end].word)) end += 1;
  return absorbReporting(list, end);
}

/** Splits Arabic text into { isnad, matn } preserving every character, or returns null when there is no chain. */
export function splitArabic(text) {
  const source = String(text ?? '');
  const list = tokens(source);
  const end = arabicChainEnd(list);
  if (end <= 0 || end >= list.length) return null;
  const cut = list[end].start;
  const isnad = source.slice(0, cut).trimEnd();
  const matn = source.slice(cut).trimStart();
  if (!isnad || !matn) return null;
  return { isnad, matn };
}

// ---- English ------------------------------------------------------------------------------

const EN_REPORT_VERB = /^(?:narrate|narrates|relate|relates|informs|informed|narrated|reported|related|told|transmitted|recounted|conveyed|heard|read|recited|wrote|dictated)$/i;
const EN_OBJECT = new Set(['us', 'me', 'him', 'them', 'her']);
const EN_SAID = /^(?:said|saying|says|stated|replied)$/i;
const EN_KIN = new Set(['his', 'her', 'their', 'father', 'mother', 'grandfather', 'grandmother', 'uncle', 'paternal', 'maternal', 'aunt', 'brother', 'son', 'daughter', 'a', 'an', 'man', 'woman', 'one', 'someone', 'whom', 'who', 'informed', 'him', 'companions', 'companion', 'people', 'of', 'the', 'among', 'some', 'other', 'others', 'and', 'ibn', 'bint', 'bin', 'abu', 'abi', 'wa', 'al', 'bani', 'banu', 'umm', 'on', 'authority', 'to', 'us', 'trustworthy', 'shaykh', 'imam', 'both', 'two', 'may', 'god', 'be', 'pleased', 'with', 'peace', 'blessings', 'upon', 'or', 'unnamed', 'freed', 'slave', 'wife', 'prophet', 'messenger', 'mercy', 'else', 'heard', 'told', 'think', 'it', 'was', 'say', 'narrating', 'called', 'named', 'nephew', 'theirs']);
const EN_KIN_HEAD = /^(?:father|grandfather|mother|grandmother|uncle|aunt|brother|son|father,|teacher|shaykh)$/i;
const EN_STOP_NAME = /^(?:that|said|saying|says|replied|stated|regarding|concerning|about|reported|narrated|related)$/i;

function tokensEn(text) {
  const out = [];
  for (const match of text.matchAll(/\S+/g)) {
    const raw = match[0];
    const word = raw.replace(/[,:;.()"“”*]/g, '');
    out.push({
      raw, word, lower: word.toLowerCase(), start: match.index, end: match.index + raw.length,
      colon: /:$/.test(raw), comma: /[,;]$/.test(raw),
      stop: /\.$/.test(raw) && !/\b(?:b|bt|ibn|Dr|St)\.$/i.test(raw),
      opens: /^[“"]/.test(raw),
    });
  }
  return out;
}

const isNameWord = word => {
  if (!word) return true;
  if (/[؀-ۿﭐ-﷿ﹰ-﻿]/.test(word)) return true;
  if (/^[ʿʾʻʼ‘’']?[A-ZÀ-ỿ]/.test(word)) return true;
  return /^(?:al|l|b|bin|ibn|abu|abi|bint)-?$/i.test(word) || /^(?:al|l|b|bin|ibn|abu|abi)-/i.test(word);
};
const isNameish = token => isNameWord(token.word) || EN_KIN.has(token.lower) || /^\[|\]$/.test(token.word);

/** Index after "informed us" / "narrated to us" / "reported" (before "from"), or -1. */
function verbPhraseEnd(list, i) {
  const token = list[i];
  if (!token || !EN_REPORT_VERB.test(token.word)) return -1;
  let j = i + 1;
  if (token.colon) return j;
  if (list[j]?.lower === 'to' && EN_OBJECT.has(list[j + 1]?.lower)) j += 1;
  if (EN_OBJECT.has(list[j]?.lower)) return j + 1;
  if (list[j]?.lower === 'from' || list[j]?.lower === 'that') return j;
  const named = nameEnd(list, j);
  if (named > j && fromTokenLength(list, named) > 0) return named;
  return -1;
}

/** Looks for "Name ... verb-phrase" starting at i; returns the index after the verb phrase or -1. */
function narratorClauseEnd(list, i) {
  for (let j = i; j < Math.min(list.length, i + 45); j += 1) {
    const token = list[j];
    const verbal = EN_REPORT_VERB.test(token.word) || EN_OBJECT.has(token.lower);
    if (token.opens || (token.stop && j > i && !verbal)) return -1;
    if (j > i && token.colon && !verbal && !EN_SAID.test(token.word)) return -1;
    const end = verbPhraseEnd(list, j);
    if (end > 0 && j > i) return end;
  }
  return -1;
}

/** Consumes a transmitter name phrase starting at i; returns the index after it (including a closing comma/colon). */
function nameEnd(list, i) {
  let n = i;
  while (list[n] && n - i < 20) {
    const token = list[n];
    if (n > i && (EN_STOP_NAME.test(token.word) || /^(?:he|she|they)$/i.test(token.word))) break;
    if (!isNameish(token) || token.opens) break;
    n += 1;
    if (token.comma && list[n] && !/[A-Za-z]/.test(list[n].raw)) continue;
    if (token.comma && EN_KIN_HEAD.test(token.word) && list[n] && /^[A-Zʿ‘']/.test(list[n].word)) continue;
    if (token.colon || token.comma || token.stop) break;
  }
  return n;
}

/** Absorbs "who said:", "he said:", "saying:", "that the Prophet said:" after a transmitter; returns the new end. */
function reportingEnd(list, i) {
  let k = i;
  const at = offset => list[k + offset]?.lower ?? '';
  if (list[k - 1]?.colon) return k;
  if (at(0) === 'and' && EN_SAID.test(at(1))) k += 1;
  if (/^(?:who|he|she)$/.test(at(0)) && EN_SAID.test(at(1)) && at(2) !== 'that') return k + 2;
  if (/^(?:who|he|she)$/.test(at(0)) && EN_SAID.test(at(1))) k += 2;
  if (EN_SAID.test(at(0))) return k + 1;
  if (at(0) === 'who' || at(0) === 'both') {
    // "who used to say:", "who traced the report to the Prophet:" : absorb through the colon
    for (let m = k + 1; m < Math.min(list.length, k + 11); m += 1) {
      if (list[m].opens || list[m].stop) break;
      if (list[m].colon) return m + 1;
    }
  }
  if (at(0) === 'that') {
    for (let m = k + 1; m < Math.min(list.length, k + 10); m += 1) {
      if (list[m].opens || list[m].stop) break;
      const subject = list.slice(k + 1, m).map(t => t.word).join(' ');
      if (EN_SAID.test(list[m].word) && (list[m].colon || list[m].comma || list[m + 1]?.opens || (/^(?:he|she)$|Prophet|Messenger/.test(subject) && list[m + 1]?.lower !== 'to'))) return m + 1;
      if (!isNameish(list[m]) && !/^(?:he|she|they|was|had|used|to)$/i.test(list[m].word)) break;
    }
  }
  return i;
}

/** After "who said:", "I heard X say:" and "The Messenger of God ﷺ said:" still belong to the isnad. */
function speakerEnd(list, i) {
  let k = i;
  for (let round = 0; round < 3; round += 1) {
    const lead = list.slice(k, k + 13).findIndex(t => /^(?:said|say|says|saying)$/i.test(t.word));
    if (lead <= 0 || !list[k + lead].colon) break;
    const words = list.slice(k, k + lead);
    const plain = words.every(t => isNameish(t) || /^(?:I|We)$/.test(t.word) || /[ﷺﭐ-﷿؀-ۿ,]/.test(t.raw));
    const speaker = /^I heard/.test(words.map(t => t.word).join(' ')) || /Messenger|Prophet/.test(words.map(t => t.word).join(' '));
    if (!plain || !speaker) break;
    k += lead + 1;
  }
  return k;
}

/** Length of a "from" introducer at i ("from", "and from", "on the authority of"), or 0. */
function fromTokenLength(list, i) {
  const at = offset => list[i + offset]?.lower ?? '';
  const skip = at(0) === 'and' ? 1 : 0;
  const base = i + skip;
  const word = list[base]?.lower;
  if (word === 'from') return skip + 1;
  if (word === 'on' && list[base + 1]?.lower === 'the' && list[base + 2]?.lower === 'authority' && list[base + 3]?.lower === 'of') return skip + 4;
  return 0;
}

/** "And by it", "And by his chain of transmission": a back-reference to the previous chain; returns the index after it, or -1. */
function referenceEnd(list) {
  const words = list.slice(0, 8).map(t => t.lower);
  let k = words[0] === 'and' ? 1 : 0;
  if (words[k] !== 'by' && words[k] !== 'through') return -1;
  k += 1;
  if (/^(?:it|him)$/.test(words[k] ?? '')) k += 1;
  else if (/^(?:his|the|that|this|same)$/.test(words[k] ?? '')) {
    const stop = words.findIndex((w, idx) => idx > k && /^(?:transmission|chain|isnad)$/.test(w));
    if (stop < 0) return -1;
    k = stop + 1;
    if (words[k] === 'of' && words[k + 1] === 'transmission') k += 2;
  } else return -1;
  if (words[k] === 'also') k += 1;
  return k;
}

/** A chain may open with a bare name before "from" ("Yusuf from his father ..."); returns the index of "from" or -1. */
function bareStart(list) {
  const first = list[0]?.lower === 'and' ? 1 : 0;
  if (fromTokenLength(list, first)) return first;
  const n = nameEnd(list, first);
  return n > first && fromTokenLength(list, n) ? n : -1;
}

/** Reads one run of "from X, from Y" links; returns the new index and whether any link was read. */
function fromLinks(list, start) {
  let i = start;
  let linked = false;
  for (let len = fromTokenLength(list, i); len > 0; len = fromTokenLength(list, i)) {
    i += len;
    const next = nameEnd(list, i);
    if (next === i) break;
    i = next;
    linked = true;
    if (list[i - 1].colon) break;
  }
  return { i, linked };
}

/** Walks the English chain; returns the token index where the matn starts, or -1. */
function englishChainEnd(list) {
  let i = 0;
  let end = -1;
  for (let guard = 0; guard < 60 && i < list.length; guard += 1) {
    let fromStart = fromTokenLength(list, i) > 0;
    const verbEnd = fromStart ? -1 : narratorClauseEnd(list, i);
    if (verbEnd < 0 && !fromStart) {
      const ref = guard === 0 ? referenceEnd(list) : -1;
      const bare = ref < 0 && guard === 0 ? bareStart(list) : -1;
      if (ref < 0 && bare < 0) break;
      i = ref >= 0 ? ref : bare;
      if (ref >= 0) end = i;
      fromStart = true;
    }
    if (verbEnd > 0) {
      i = verbEnd;
      end = i;
      const after = reportingEnd(list, i);
      if (after > i && EN_SAID.test(list[after - 1].word)) { i = after; end = i; }
    }
    const run = fromLinks(list, i);
    if (run.linked) { i = run.i; end = i; }
    const after = list[i - 1]?.colon ? i : reportingEnd(list, i);
    if (after > i) { i = after; end = i; }
    const speaker = speakerEnd(list, i);
    if (speaker > i) { i = speaker; end = i; }
    if (!list[i] || list[i].opens || narratorClauseEnd(list, i) < 0) break;
  }
  return end;
}

/** Splits English text into { isnad, matn }, or returns null when no chain is found. */
export function splitEnglish(text) {
  const source = String(text ?? '');
  const list = tokensEn(source);
  const end = englishChainEnd(list);
  if (end <= 0 || end >= list.length) return null;
  const cut = list[end].start;
  const isnad = source.slice(0, cut).trimEnd();
  const matn = source.slice(cut).trimStart();
  if (!isnad || !matn) return null;
  return { isnad, matn };
}

/** True when the two parts, rejoined with whitespace, give back the original text exactly. */
export function reconstructs(text, parts) {
  if (!parts) return false;
  const squash = value => String(value ?? '').replace(/\s+/g, '');
  return squash(`${parts.isnad}${parts.matn}`) === squash(text);
}

/** Splits both languages; aligned means both found a chain or both found none. */
export function splitBoth(arText, enText) {
  const ar = splitArabic(arText);
  const en = splitEnglish(enText);
  return { ar, en, aligned: Boolean(ar) === Boolean(en) };
}
