/*
 * Gives each page-record source the shape of the work it holds.
 *
 * The converted sources list one entry per Shamela page record, title pages and editors' introductions
 * included. A reader that prints every such record as a narration with an empty transmission panel
 * misdescribes the work. This step sorts each source by what its own text shows:
 *
 *   - Title pages, the chain through which a copy was transmitted, and audition notes frame the text.
 *     They are shown once, before or after the narrations, and are not counted as narrations.
 *   - A long editor's introduction becomes an appendix.
 *   - Text that a page break cut off from its report is rejoined to that report.
 *   - A work whose narrations all rest on one opening chain (a nuskha) states that chain once, and its
 *     entries are read as a list, without a chain panel for each.
 *   - A work of running prose is read as running prose, page by page.
 *   - A selection that names the part of the original each tradition came from is divided by those parts.
 *   - Everything else is a report with its own chain: the chain is set apart from the words and its
 *     transmitters are listed, read from the wording by chain-from-isnad.mjs.
 *
 * No text is added, dropped, or reworded; a heading line that the source repeats as an entry is the one
 * thing removed, because it is already the heading of its section.
 */
import { splitAndChain, arabicNames, englishNames } from './chain-from-isnad.mjs';

const tidy = value => String(value ?? '').replace(/[‌‏]/g, '').replace(/\s+/g, ' ').trim();
const isFrame = group => group.records.length > 0 && group.records.every(record => record.no_split && !/continued/i.test(record.noun ?? ''));

export const STRUCTURES = {
  'nuskhat-al-zubayr-ibn-adi': {
    layout: 'compact', sharedChain: true,
    chainNote: 'The first narration gives this chain in full. The narrations after it open with “and by it” or “and by his chain”, which points back here, and add only the links that differ.',
  },
  'kitab-al-hajj-al-majishun': { layout: 'prose' },
  'juz-sufyan-ibn-uyayna': { frontAsAppendix: "Editor's introduction and study" },
  'nuskhat-waki-an-al-amash': { dropHeading: record => /^زيادات/.test(tidy(record.text_ar)) && tidy(record.text_ar).length < 40 },
  'ahadith-muntakhaba-maghazi-musa-ibn-uqba': { partHeadings: true },
};

const frameOf = (record, title) => ({
  title_en: title, page: record.page ?? null, ar: record.text_ar ?? '', en: record.text_en ?? '',
  footnotes: record.footnotes ?? [],
});
const emptyGroup = (title_en, title_ar) => ({ title_en, title_ar, frames_before: [], frames_after: [], records: [] });

/** Rejoins text that a page break separated from its report. */
function rejoin(records, group) {
  const out = [];
  for (const record of records) {
    if (/continued/i.test(record.noun ?? '')) {
      const piece = { title_en: `Continues${record.page ? ` on p. ${record.page}` : ''}`, text_en: record.text_en, text_ar: record.text_ar };
      if (out.length) (out.at(-1).continuations ??= []).push(piece);
      else group.frames_before.push(frameOf(record, 'End of a report that begins before this text'));
      continue;
    }
    out.push({ ...record });
  }
  return out;
}

const AR_PART_LINE = /^([\s\S]{0,40}?)\s*(\d{1,3})\s?-\s*/;
const EN_PART_LINE = /^(?:([^.]{0,40}part)\.\s*)?(\d{1,3})\.\s*/i;

/**
 * The Maghāzī selection is divided by the part (juzʾ) of the original work each tradition was taken from:
 * a line such as "from the first part" stands before the first tradition of each part. Those lines are the
 * selection's own divisions, so they become its headings, and the printed number moves to the label.
 */
function byPartHeading(group) {
  const parts = [];
  for (const record of group.records) {
    const arabic = String(record.text_ar ?? '').match(AR_PART_LINE);
    const english = String(record.text_en ?? '').match(EN_PART_LINE);
    const heading = arabic ? tidy(arabic[1]) : '';
    if (heading && english?.[1]) parts.push(emptyGroup(english[1].replace(/^And f/, 'F'), heading.replace(/^و/, '')));
    if (!parts.length) parts.push(emptyGroup(group.title_en, group.title_ar));
    parts.at(-1).records.push({
      ...record,
      text_ar: arabic ? record.text_ar.slice(arabic[0].length) : record.text_ar,
      text_en: english ? record.text_en.slice(english[0].length) : record.text_en,
      display_number: english?.[2] ?? record.display_number,
    });
  }
  parts[0].frames_before.unshift(...group.frames_before);
  parts.at(-1).frames_after.push(...group.frames_after);
  return parts;
}

export function restructure(source, slug) {
  const rules = STRUCTURES[slug] ?? {};
  const groups = source.groups.map(group => ({ ...group, frames_before: [...(group.frames_before ?? [])], frames_after: [...(group.frames_after ?? [])], records: [...group.records] }));
  // Sources that already carry an isnad/matn division and their own headings are left as converted.
  const pageRecords = !groups.some(group => group.kind === 'apparatus' || group.records.some(record => 'isnad_ar' in record));
  if (!pageRecords) return source.groups;

  let reading = groups.filter(group => !isFrame(group));
  const first = groups.indexOf(reading[0]);
  const last = groups.indexOf(reading.at(-1));
  const appendix = [];
  groups.forEach((group, index) => {
    if (!isFrame(group)) return;
    if (index < first && rules.frontAsAppendix) {
      appendix.push({
        title_en: rules.frontAsAppendix, title_ar: '', kind: 'apparatus', records: [],
        sections: group.records.map(record => ({ title_en: record.page ? `Page ${record.page}` : group.title_en, page: record.page ?? null, ar: record.text_ar, en: record.text_en, footnotes: record.footnotes ?? [] })),
      });
    } else if (index < first) reading[0].frames_before.push(...group.records.map(record => frameOf(record, group.title_en)));
    else if (index > last) reading.at(-1).frames_after.push(...group.records.map(record => frameOf(record, group.title_en)));
    else groups[index + 1].frames_before.push(...group.records.map(record => frameOf(record, group.title_en)));
  });
  if (rules.partHeadings) reading = reading.flatMap(byPartHeading);

  for (const group of reading) {
    let records = rejoin(group.records, group);
    if (rules.dropHeading) records = records.filter(record => !rules.dropHeading(record));
    group.records = records.map(record => {
      const next = { ...record };
      // A page with no printed number of its own was labeled with its page number; that is not a narration number.
      if (rules.layout !== 'prose' && next.page && next.display_number === next.page && records.some(item => item.display_number !== item.page)) {
        next.display_number = '—';
        next.noun = 'Unnumbered text';
      }
      if (rules.layout === 'prose') return { ...next, no_split: true };
      if (next.no_split) return next;
      const result = splitAndChain(next.text_ar, next.text_en);
      if (!result?.en) return next;
      const { text_ar, text_en, ...rest } = next;
      return {
        ...rest,
        isnad_ar: result.ar.isnad, matn_ar: result.ar.matn, isnad_en: result.en.isnad, matn_en: result.en.matn,
        chains: result.chain && !rules.sharedChain ? [{ narrators: result.chain, direction: 'as_written_later_to_earlier' }] : [],
        ...(rules.sharedChain && result.chain ? { stated_chain: result.chain } : {}),
      };
    });
    if (rules.sharedChain) {
      // Only the first narration states the chain in full. It is read from everything that stands before the
      // quoted words, so a chain that pauses and resumes is taken whole; if it cannot be read, no chain is shown.
      const opening = group.records[0];
      const whole = opening && { ar: opening.text_ar ?? `${opening.isnad_ar} ${opening.matn_ar}`, en: opening.text_en ?? `${opening.isnad_en} ${opening.matn_en}` };
      const before = (text, quote) => (text.search(quote) > 0 ? text.slice(0, text.search(quote)) : '');
      const ar = whole && arabicNames(before(whole.ar, /[«"]/));
      const en = whole && englishNames(before(whole.en, /[“"«]/));
      if (ar?.length > 3) opening.stated_chain = ar.map((name, index) => ({ ar: name, en: en?.length === ar.length ? en[index] : '' }));
      if (opening?.stated_chain?.length > 3) group.shared_chain = { nodes: [...opening.stated_chain].reverse(), from: opening.display_number, note: rules.chainNote };
    }
  }

  const ordered = [...reading, ...appendix].map((group, index) => ({ ...group, number: index + 1 }));
  let count = 0;
  for (const group of ordered) for (const record of group.records) { count += 1; record.id = `${group.number}.${count}`; }
  return ordered;
}
