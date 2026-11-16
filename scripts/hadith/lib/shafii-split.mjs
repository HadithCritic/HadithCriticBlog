/*
 * Isnad/matn division for Musnad al-Shāfiʿī, whose chains follow a small grammar:
 * "akhbaranā X, ʿan Y, ʿan Z, anna rasūla llāhi ﷺ qāla: «…»". The Arabic is divided first; the English
 * is then cut at the same point of the same chain, found by counting the clauses the Arabic isnad has.
 *
 * Nothing is rewritten: both functions return offsets into the text, and the parts give the text back.
 * They return null when the wording does not fit, and the converter then falls back to the shared
 * splitter or shows the passage whole. Page markers must be shielded as "⦗n⦘" tokens before the call.
 */

const MARKS = /[ً-ْٰـ‌-‏]/g;
const PUNCT = /[،؛.,;:«»"“”'()[\]{}‘’!؟?]/g;
const bareAr = word => word.replace(MARKS, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(PUNCT, '');

const LINKS = new Set([
  'اخبرنا', 'اخبرني', 'اخبرناه', 'اخبرنيه', 'اخبره', 'اخبرها', 'اخبرهم', 'اخبرتني', 'اخبرتنا', 'اخبرته',
  'حدثنا', 'حدثني', 'حدثناه', 'حدثنيه', 'حدثه', 'حدثها', 'حدثهم', 'حدثتني', 'حدثتنا', 'حدثته',
  'انبانا', 'انباني', 'انبانيه', 'ثنا', 'سمعت', 'سمعنا', 'سمع', 'سمعا', 'سمعه', 'سمعها', 'قرات',
  'اخبراه', 'اخبروه', 'حدثاه', 'حدثوه', 'ذكر', 'سمعوا',
]);
const isLink = word => LINKS.has(word) || (/^و/.test(word) && LINKS.has(word.slice(1)));
const isFrom = word => word === 'عن' || word === 'وعن';
const SAID = new Set(['قال', 'قالت', 'قالا', 'قالوا', 'يقول', 'تقول', 'يقولان', 'يقولون', 'يحدث', 'تحدث', 'يخبر', 'يذكر', 'يحدثه', 'يحدثونه', 'يحدثانه', 'يحدثون', 'يحدثان', 'كلاهما', 'كلهم']);
const THAT = new Set(['ان', 'انه', 'انها', 'انهما', 'انهم']);
const RAISED = new Set(['يبلغ', 'يبلغه', 'يرفعه', 'رفعه', 'يسنده', 'مرفوعا', 'يرويه']);
const REFS = new Set(['وبه', 'وبهذا', 'وباسناده', 'وبالاسناد', 'بهذا', 'باسناده', 'وبذلك']);
// Words after a comma that keep the name going: an appositive, a kinship or a doubt between two names.
const APPOSITIVE = /^(?:رضي|صلي|مولي|مولاه|مولاة|ابن|بن|ابي|ابو|ام|اخي|اخو|صاحب|رجل|امراه|امراة|شيخ|يعني|وهو|وهي|وكان|وكانت|وكانا|من|او|احد|احسبه|اظنه|الشك|ثقة|الثقة|زوج|اخر|احدهما|اصحابنا|لم|احدي|اهل)$/;
// "samiʿa X yasʾalu ...": the question he was heard asking is the report.
const ASKED = /^(?:يسال|تسال|يساله|يسالها|يسالون|سال|سئل|يقرا|يخطب)$/;
const CHAIN_REF = /^و?(?:باسناده|باسناد|باسنادهما)$/;
const KIN = /^(?:عمه|عمها|جده|جدها|جدته|ابيه|ابيها|اخيه|اخيها|خاله|خالته|امه|عمته|اخته|ابنه|زوجها|زوجته|مولاه|مولاها|عمي|جدي|خالي)$/;
const UNNAMED = /^(?:رجلا|امراة|امراه|اعرابيا|ناسا|اناسا|قوما|نفرا|غلاما|جارية)$/;
// "dhukira ʿinda ..." is the passive verb of a report, not "dhakara" naming a source.
const linkAt = (list, j) => Boolean(list[j]) && (isFrom(list[j].word) || (isLink(list[j].word) && !(list[j].word === 'ذكر' && /^(?:عند|ل)/.test(list[j + 1]?.word ?? ''))));
const PROPHET = new Set(['رسول', 'النبي', 'نبي']);
const HONORIFIC = new Set(['الله', 'صلي', 'عليه', 'وسلم', 'ﷺ', 'رضي', 'عنه', 'عنها', 'عنهما', 'عنهم', 'تعالي']);

function tokensAr(text) {
  const out = [];
  for (const match of text.matchAll(/\S+/g)) {
    const raw = match[0];
    if (/^[:،,؛;]+$/.test(raw) && out.length) {
      const last = out.at(-1);
      last.end = match.index + raw.length;
      if (raw.includes(':')) last.colon = true; else last.comma = true;
      continue;
    }
    out.push({
      raw, start: match.index, end: match.index + raw.length, word: bareAr(raw),
      colon: /:$/.test(raw), comma: /[،,؛;]$/.test(raw), opens: /^[«"“]/.test(raw), marker: /^⦗\d+⦘$/.test(raw),
    });
  }
  return out;
}

/** A name opened by "wa-" that the chain goes on from ("Mālik, wa-Ibn ʿUyayna, ʿan Abī al-Zinād"). */
function parallel(list, i) {
  const word = list[i].word;
  if (!/^و./.test(word) || isLink(word) || isFrom(word) || THAT.has(word.slice(1)) || APPOSITIVE.test(word)) return false;
  for (let k = i + 1; k < Math.min(list.length, i + 9); k += 1) {
    const token = list[k];
    if (token.opens || ASKED.test(token.word)) return false;
    if (/^(?:كلاهما|كلهم|جميعا)$/.test(token.word)) return true;
    // "wa-Abī Salama, annahumā akhbarāhu ...": both names go on to the same link. A kunya or nasab
    // named beside the first ("ʿan Ibn al-Musayyab, wa-Abī Salama, anna l-nabiyya ...") also stays.
    if (THAT.has(token.word)) return Boolean(list[k + 1] && (isLink(list[k + 1].word) || SAID.has(list[k + 1].word))) || /^و(?:ابي|ابو|ابن|ام|عبد|عبيد)$/.test(word);
    if (isFrom(token.word) || isLink(token.word)) return true;
    if (SAID.has(token.word)) return Boolean(token.colon || colonAfter(list, k) > 0);
  }
  return false;
}

/** A name repeated after a comma, as a kinship term is followed by the person's name, before the next "ʿan". */
function restated(list, i) {
  const span = [];
  for (let k = i; k < Math.min(list.length, i + 6); k += 1) {
    const token = list[k];
    // "samiʿa ʿammahu, Anasa bna Mālikin yaqūlu:": the kinship term is named before the verb.
    if (SAID.has(token.word) && span.length && KIN.test(list[i - 1]?.word ?? '')) return true;
    if (isLink(token.word) && span.length && KIN.test(list[i - 1]?.word ?? '')) return true;
    if (token.opens || SAID.has(token.word) || isLink(token.word)) return false;
    if (isFrom(token.word) || THAT.has(token.word)) return span.length > 0 && (KIN.test(list[i - 1]?.word ?? '') || span.some(word => /^(?:بن|بنت|ابن|ابنة|ابي|ابو|ام)$/.test(word)));
    span.push(token.word);
  }
  return false;
}

/** Index after a name that starts at i, or -1. A name runs to a comma or colon, or up to the next link. */
function nameEnd(list, i) {
  let count = 0;
  while (i < list.length) {
    const token = list[i];
    if (token.marker) {
      i += 1;
      if (token.colon && count) return i;
      continue;
    }
    if (token.opens) break;
    if (count > 0 && (ASKED.test(token.word) || isFrom(token.word) || isLink(token.word) || SAID.has(token.word) || THAT.has(token.word) || RAISED.has(token.word))) break;
    i += 1;
    count += 1;
    if (token.colon) return count > 14 ? -1 : i;
    // "wa-kāna, qāḍiyan ...": a connective set off by a comma goes on with the description.
    if (token.comma && count > 1 && /^(?:وكان|وكانت|وهو|وهي|او|يعني)$/.test(token.word)) continue;
    if (token.comma) {
      let next = i;
      while (list[next]?.marker) next += 1;
      // "wa-huwa yusʾalu" opens the report rather than describing the name.
      if (list[next] && APPOSITIVE.test(list[next].word) && !(/^وه[وي]$/.test(list[next].word) && ASKED.test(list[next + 1]?.word ?? ''))) continue;
      // "Mālik, wa-Ibn ʿUyayna, ʿan ...": a second transmitter in parallel with the first.
      if (list[next] && parallel(list, next)) continue;
      // A kinship term followed by the person’s name, before the next "ʿan".
      if (list[next] && restated(list, next)) continue;
      return count > 14 ? -1 : i;
    }
    if (count > 14) return -1;
  }
  return count ? i : -1;
}

/** Index after a word and any page markers that follow it, when a colon closes them; otherwise -1. */
function colonAfter(list, i) {
  if (list[i]?.colon) return i + 1;
  let j = i + 1;
  while (list[j]?.marker) {
    if (list[j].colon) return j + 1;
    j += 1;
  }
  return -1;
}

/** "qāla: qāla rasūlu llāhi ﷺ:" — the second formula also stays with the isnad. */
function prophetSaid(list, i) {
  let k = i;
  while (list[k]?.marker) k += 1;
  if (!SAID.has(list[k]?.word) || !PROPHET.has(list[k + 1]?.word)) return i;
  k += 2;
  while (list[k] && (HONORIFIC.has(list[k].word) || list[k].marker) && colonAfter(list, k - 1) < 0) k += 1;
  const closed = colonAfter(list, k - 1);
  return closed > 0 ? closed : i;
}

/** "anna rasūla llāhi ﷺ qāla:" and "annahu qāla:" stay with the isnad, as on every reader page. */
function reportingEnd(list, i) {
  let j = i;
  if (THAT.has(list[j]?.word)) j += 1;
  let k = j;
  if (PROPHET.has(list[k]?.word)) {
    k += 1;
    while (list[k] && (HONORIFIC.has(list[k].word) || list[k].marker)) k += 1;
  }
  if (!SAID.has(list[k]?.word)) return -1;
  if (k === j && j === i) return -1;
  const closed = colonAfter(list, k);
  if (closed > 0) return closed;
  if (list[k + 1]?.opens) return k + 1;
  // "annahu samiʿa rasūla llāh ﷺ yaqūlu:" is handled as a link; a bare "qāla" without a colon opens the matn.
  return -1;
}

/** Returns the offset where the Arabic matn begins, or -1. */
export function arabicCut(text) {
  const list = tokensAr(text);
  let i = 0;
  while (list[i]?.marker) i += 1;
  if (REFS.has(list[i]?.word)) i += 1;
  else if (!isLink(list[i]?.word) && !isFrom(list[i]?.word)) return -1;
  let end = -1;
  let linkStart = -1;
  for (let guard = 0; guard < 40 && i < list.length; guard += 1) {
    const token = list[i];
    if (token.marker || token.word === 'ح') { i += 1; continue; }
    if (linkAt(list, i)) {
      if (!THAT.has(list[i - 1]?.word)) linkStart = i;
      i += 1;
      // "samiʿa rasūla llāh ﷺ yaqraʾu ...": what he was heard doing is the report, not a link.
      if (/^و?سمع/.test(token.word) && PROPHET.has(list[i]?.word)) {
        let k = i + 1;
        while (list[k] && (HONORIFIC.has(list[k].word) || list[k].marker)) k += 1;
        if (SAID.has(list[k]?.word)) {
          const closed = colonAfter(list, k);
          if (closed > 0 || list[k + 1]?.opens || list[k].comma) { end = closed > 0 ? closed : k + 1; break; }
        }
        end = linkStart;
        break;
      }
      if (token.word === 'قرات' && list[i]?.word === 'علي') i += 1;
      if (token.colon) { end = i; continue; }
      // "akhbarahu, ʿan ..." and "akhbarahu anna ...": the object pronoun is the name.
      let ahead = i;
      while (list[ahead]?.marker) ahead += 1;
      if (/(?:ه|ها|هم)$/.test(token.word) && list[ahead] && (isFrom(list[ahead].word) || THAT.has(list[ahead].word) || isLink(list[ahead].word))) { end = i; continue; }
      const next = nameEnd(list, i);
      if (next < 0) return -1;
      i = next;
      end = i;
      continue;
    }
    if (end < 0) return -1;
    // "akhbaranā Ismāʿīl, bi-isnādihi ʿan Abī Mūsā": the chain is given in short and goes on.
    if (CHAIN_REF.test(token.word) && (linkAt(list, i + 1) || THAT.has(list[i + 1]?.word))) { i += 1; continue; }
    if (THAT.has(token.word)) {
      const after = list[i + 1];
      // "annahu samiʿa ..." and "annahu akhbarahu ..." continue the chain.
      if (after && isLink(after.word)) { linkStart = i; i += 1; continue; }
      // "anna X akhbarahu" names the next transmitter.
      if (token.word === 'ان') {
        const named = nameEnd(list, i + 1);
        const verb = list[named]?.word.replace(/^و/, '') ?? '';
        if (named > 0 && !PROPHET.has(list[i + 1]?.word) && /^(?:اخبر|حدث)(?:ه|ها|هم|اه|وه)$/.test(verb)) { i = named; continue; }
      }
      const reported = reportingEnd(list, i);
      // "annahu qāla: samiʿtu Abā Saʿīd ...": the chain goes on after the formula.
      if (reported > 0 && linkAt(list, reported)) { i = reported; continue; }
      // "anna Ibn ʿAbbās qāla: «...»": the authority named before his own words stays with the isnad.
      if (reported < 0 && token.word === 'ان' && !UNNAMED.test(list[i + 1]?.word ?? '')) {
        const named = nameEnd(list, i + 1);
        const closed = named > 0 && SAID.has(list[named]?.word) ? colonAfter(list, named) : -1;
        if (closed > 0 && !linkAt(list, closed)) { end = prophetSaid(list, closed); break; }
      }
      if (reported > 0) { end = reported; break; }
      break;
    }
    // "yablughu bihi l-nabiyya ﷺ", "yarfaʿuhu": the chain is raised to the Prophet; it stays with the isnad.
    if (RAISED.has(token.word)) {
      i += 1;
      if (list[i]?.word === 'به') i += 1;
      if (PROPHET.has(list[i]?.word)) {
        i += 1;
        while (list[i] && (HONORIFIC.has(list[i].word) || list[i].marker)) i += 1;
      }
      end = i;
      continue;
    }
    if (SAID.has(token.word)) {
      const closed = colonAfter(list, i);
      // "qāla Ibn Shihāb: ḥaddathanī ...": the speaker is named before the colon and the chain goes on.
      if (closed < 0) {
        const named = nameEnd(list, i + 1);
        if (named > 0 && colonAfter(list, named - 1) === named && linkAt(list, named)) { i = named; continue; }
      }
      let j = closed > 0 ? closed : i + 1;
      while (list[j]?.marker) j += 1;
      // "kulluhum yukhbiruhu ʿan al-Qāsim": a second verb before the next link.
      if (closed < 0 && /^(?:يخبره|يخبرونه|يحدثه|يحدثونه|يحدثانه|يرويه|يروونه)$/.test(list[j]?.word ?? '')) j += 1;
      if (linkAt(list, j)) { i = j; continue; }
      // "yaqūlu: anna Abā Saʿīd qāla: ...": the next speaker is named before his own "qāla:".
      if (closed > 0 && list[j]?.word === 'ان') {
        const named = nameEnd(list, j + 1);
        if (named > 0 && SAID.has(list[named]?.word) && colonAfter(list, named) > 0) { i = named; continue; }
      }
      const reported = reportingEnd(list, i);
      if (reported > 0) { end = reported; break; }
      if (closed > 0) { end = prophetSaid(list, closed); break; }
      // "samiʿtu rasūla llāh ﷺ yaqūlu, idhā ...": the verb closes the chain even without a colon.
      if (token.comma) { end = i + 1; break; }
      break;
    }
    break;
  }
  if (end <= 0 || end >= list.length) return -1;
  return list[end].start;
}

// ---- English ------------------------------------------------------------------------------

const outside = text => text.replace(/⦗\d+⦘/g, m => ' '.repeat(m.length));

/**
 * Cuts the English at the point that matches an Arabic isnad: after as many colons as the Arabic isnad
 * has when it ends at a colon, or after the "that" that opens the matn when the Arabic matn begins with
 * "anna". Returns the offset or -1.
 */
const SAID_COLON_AR = /(?:^|\s)(?:[فو]?(?:قال|قالت|قالا|قالوا|يقول|تقول|يقولان|يقولون)|وسلم|ﷺ)\s*(?:⦗\d+⦘\s*)*:/g;
const SAID_COLON_EN = /\b(?:said|say|says|saying|stated|declared|related|reported)\b(?:\s+(?:to\s+(?:us|me|him|them)|it|this|that))?(?:\s*(?:⦗\d+⦘|\[[^\]]*\]))*\s*:/gi;

// "that he heard X", "that X informed him": a "that" which carries the chain on, not one that opens the report.
const LINKING_THAT = /^\s*(?:(?:he|she|they|I|both)\s+heard\b|(?:[\wʿʾ'’.-]+\s+){1,7}(?:informed|narrated\s+to|told|reported\s+to)\s+(?:him|her|them|me)\b|(?:both|they|he|she)\s+(?:informed|narrated\s+to|told)\b)/i;

export function englishCut(textEn, isnadAr, matnAr) {
  const en = outside(textEn);
  const ar = outside(isnadAr);
  const flat = ar.replace(MARKS, '').replace(/\s+/g, ' ').replace(/ (?=:)/g, '');
  const said = /(?:قال|قالت|قالا|قالوا|يقول|تقول|يقولان|يقولون|وسلم|ﷺ):/g;
  const colons = [...flat.matchAll(said)].length;
  const saidColons = [...en.matchAll(SAID_COLON_EN)];
  const colonAt = n => (n === 0 ? 0 : saidColons[n - 1] ? saidColons[n - 1].index + saidColons[n - 1][0].length : -1);
  const plainColon = n => {
    let k = 0;
    for (let i = 0; i < en.length; i += 1) if (en[i] === ':' && ++k === n) return i + 1;
    return -1;
  };
  if (/:\s*$/.test(ar)) {
    // The isnad closes on a verb of saying ("qāla:") or on a bare name ("ʿan Saʿīd ibn Jubayr:").
    if (/(?:قال|قالت|قالا|قالوا|يقول|تقول|يقولان|يقولون|وسلم|ﷺ):\s*$/.test(flat)) {
      const cut = colonAt(colons);
      if (cut > 0) return cut;
    }
    return plainColon((ar.match(/:/g) ?? []).length);
  }
  const rest = String(matnAr).replace(/⦗\d+⦘/g, '').trim();
  const from = colonAt(colons);
  if (from < 0) return -1;
  const opening = bareAr(rest.replace(/^[\s"«“]+/, '').split(/\s+/)[0] ?? '');
  if (THAT.has(opening)) {
    // "annahu akhbarahu" is often rendered "who informed him", with no "that" to skip.
    const relative = [...en.matchAll(/\bwho\s+(?:both\s+|all\s+)?(?:informed|narrated|told|reported)\b/gi)].length;
    const thatsInIsnad = Math.max(0, ar.split(/\s+/).filter(word => THAT.has(bareAr(word))).length - relative);
    const re = /\bthat\b/g;
    re.lastIndex = from;
    let skipped = 0;
    for (let hit = re.exec(en); hit; hit = re.exec(en)) {
      if (skipped < thatsInIsnad || LINKING_THAT.test(en.slice(hit.index + 4, hit.index + 90))) { skipped += 1; continue; }
      return hit.index + 4;
    }
  }
  // The Arabic report opens with a quotation: the English one opens at its first quotation mark.
  if (/^["«“]/.test(rest)) {
    const quote = en.slice(from).search(/[“"]/);
    if (quote > 0) return from + quote;
  }
  return -1;
}

/** Divides text at an offset, or returns null when either side would be empty. */
export function cutAt(text, offset) {
  if (offset <= 0 || offset >= text.length) return null;
  const isnad = text.slice(0, offset).trimEnd();
  const matn = text.slice(offset).trimStart();
  return isnad && matn ? { isnad, matn } : null;
}
