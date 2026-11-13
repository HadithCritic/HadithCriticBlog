/* Transmitted reports: where one starts, and where its chain (isnād) ends and
   the reported words (matn) begin.

   The parser walks the chain one link at a time:
     NAME told us | told me | related to us | informed us ...   (", he said:" may follow)
     from NAME | on the authority of NAME | according to NAME   (", who said:" may follow)
     NAME said:                                                 (only straight after a link)
   It stops at the first stretch that is not a link. Nothing is moved or
   reworded: the chain is the source text up to that point and the matn is the
   rest. When the walk fails the report is kept whole and flagged. */

// A name: words, particles and "b." abbreviations, with no clause punctuation.
const NAME = String.raw`(?:[^,:;.?!{}“”"()\n]|(?<=\b[bB])\.|(?<=\b[A-Z])\.|\[[^\]]{1,40}\]){2,90}?`;
const VERB = String.raw`(?:told|narrated to|narrated it to|related to|related it to|reported to|reported it to|informed|transmitted to|dictated to)`;
const PRONOUN_SAID = String.raw`(?:,?\s*(?:and\s+)?(?:he|she|they|both|both of them|each of them|the two of them)\s+said(?:\s+to\s+(?:us|me))?)`;

const TOLD = new RegExp(
  String.raw`\s*(${NAME})\s+${VERB}\s+(?:us|me|him|them)\b(?:,?\s*(?:saying|that))?${PRONOUN_SAID}?\s*[:;,]?`,
  'y',
);
// The name must end at a delimiter, or the lazy match would stop after two letters.
const FROM_END = String.raw`(?=\s*[,:;.]|\s*$|\s+(?:regarding|concerning|about|that|who|in his|in her|said)\b)`;
const FROM = new RegExp(
  String.raw`\s*,?\s*(?:and\s+)?(?:from|on the authority of|according to|via|through)\s+(${NAME})${FROM_END}(?:\s*,\s*(?:who|he|she|they|both|that (?:he|she)|and (?:he|she)) said\s*[:,]?|\s*[,:;])?`,
  'y',
);
// "NAME said:" closes a chain; "NAME said regarding ..." names the last authority
// and leaves "regarding ..." with the matn.
const SAID = new RegExp(String.raw`\s*(${NAME})\s+said(?:\s*:|(?=\s+(?:regarding|concerning|about|of|in)\b))`, 'y');
const PASSIVE = new RegExp(
  String.raw`\s*(?:I was (?:told|informed|related|narrated to)|It was (?:narrated|related|reported|transmitted)(?: to (?:me|us))?)\s+(?:from|on the authority of|by)\s+(${NAME})${FROM_END}\s*[,:;]?`,
  'y',
);

const NOT_A_NAME = /^(?:he|she|it|they|we|i|you|god|allah|the most high|the exalted|this|that|which|who|some|others?|one of them|his statement|his saying)$/i;

/** Does this sentence open a transmitted report? */
export function opensReport(sentence) {
  const s = sentence.replace(/^\s*[“"‘']?/, '');
  TOLD.lastIndex = 0;
  const m = TOLD.exec(s);
  if (m && plausibleName(m[1])) return true;
  PASSIVE.lastIndex = 0;
  return Boolean(PASSIVE.exec(s));
}

function plausibleName(name) {
  const n = name.trim();
  if (!n || NOT_A_NAME.test(n)) return false;
  const words = n.split(/\s+/);
  return words.length <= 12 && /^[A-ZĀĪŪḤṢḌṬẒʿʾ‘’'\[]|^(?:my|our|his|al-|ibn|abu|abū|bin|b\.)/i.test(n);
}

const cleanName = (n) => n.trim().replace(/^(?:and|the)\s+/i, '').replace(/[,:;]+$/, '').trim();

/**
 * Splits a report into chain and matn.
 * @returns {{ chainEnd: number, via: string|null } | null} chainEnd is an index
 *   into text; null when no chain could be read.
 */
export function parseChain(text) {
  let pos = 0;
  let links = 0;
  let via = null;
  let lastWasSaid = false;
  for (let guard = 0; guard < 40; guard++) {
    let m = null;
    for (const [re, kind] of [[TOLD, 'told'], [PASSIVE, 'passive'], [FROM, 'from'], [SAID, 'said']]) {
      if (kind === 'said' && (links === 0 || lastWasSaid)) continue;
      if (kind === 'passive' && links > 0) continue;
      re.lastIndex = pos;
      const hit = re.exec(text);
      // "A man came to Umar and said:" is narrative, not a link.
      const narrative = kind === 'said' && (hit?.[1].trim().split(/\s+/).length > 6 || /\b(?:and|came|went|asked|was|were|is|has|had|when|then|to|if)\b/i.test(hit?.[1] ?? ''));
      if (hit && hit[0].trim() && !narrative && (kind === 'from' || plausibleName(hit[1]))) {
        m = { hit, kind };
        break;
      }
    }
    if (!m) break;
    pos = m.hit.index + m.hit[0].length;
    links++;
    lastWasSaid = m.kind === 'said';
    via = cleanName(m.hit[1]);
  }
  if (!links) return null;
  // Punctuation closing the last link, and the space after it, stay with the chain.
  while (pos < text.length && /[.,;:]/.test(text[pos])) pos++;
  while (pos < text.length && /\s/.test(text[pos])) pos++;
  if (pos >= text.length) return null;
  return { chainEnd: pos, via: via && via.split(/\s+/).length <= 10 ? via : null };
}
