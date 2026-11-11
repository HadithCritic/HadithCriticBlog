/*
 * Shape B sources of the 2nd century batch are Shamela page records. Each source has a profile that says what
 * kind of work it is, which unit it is read in, and how its pages fall into front matter, text and closing
 * material. Wording comes from each source's own title page and metadata; nothing is added that it does not state.
 */
const FRONT = 'No isnad: this is editorial or catalog material, not a report.';
const COPY = 'No isnad: this passage gives the transmission of the copy, not a report.';
const DIRECT = 'No isnad: the text is given as a direct statement.';
const MARKER_AR = /(?:^|(?<=\s))(\d{1,4})\s-\s(?=[؀-ۿ])/g;
const MARKER_EN = /(?:^|(?<=\s))(\d{1,4})\s[-–]\s(?=\S)/g;

export const PROFILES = {
  'ahadith-yazid-ibn-abi-habib': {
    kind: 'Fascicle (juzʾ)', noun: 'Narration',
    blurb: 'A fascicle of the narrations of Yazīd ibn Abī Ḥabīb (d. 129 AH) as transmitted by al-Layth ibn Saʿd, edited by Ḥamza Aḥmad al-Zayn within the collection Aḥādīth al-Shuyūkh al-Kibār (Dār al-Ḥadīth, Cairo). Narrations keep the edition’s printed numbers; a narration that runs onto a second printed page appears again under the same number.',
    structure: 'A juzʾ of numbered narrations. Page 1 carries the transmission of the copy and the first narration. A narration that continues on a later printed page is shown again under the same number, marked as a continuation.',
    groups: [{ title_en: 'The narrations', title_ar: '' }],
  },
  'nuskhat-al-zubayr-ibn-adi': {
    kind: 'Notebook (nuskha)', noun: 'Narration',
    blurb: 'The second part of the notebook of al-Zubayr ibn ʿAdī al-Kūfī (d. 131 AH), a manuscript text with its line of transmitters given on the title page. After the first narration, many entries open with a short formula such as “and by his chain” that refers back to the full chain given there.',
    structure: 'A numbered notebook (nuskha). The title page lists the transmitters of the copy; narration 1 gives the full chain and later narrations often continue with short formulas that rely on it.',
    groups: [
      { test: (page, i) => i < 1, title_en: 'Title page and transmission of the copy', title_ar: '', reason: COPY, noun: 'Title page', split: false },
      { title_en: 'The narrations', title_ar: '' },
    ],
  },
  'nuskhat-waki-an-al-amash': {
    kind: 'Notebook (nuskha)', noun: 'Narration',
    blurb: 'The notebook of Wakīʿ ibn al-Jarrāḥ (d. 197 AH) from al-Aʿmash: forty-one numbered narrations, followed by a short set of additions that the source marks as supplements to the copy.',
    structure: 'A notebook (nuskha) whose narrations are numbered 1 to 41, followed by a second numbered series that the source labels as additions to the copy.',
    groups: [
      { test: (page, i, all) => i < all.firstOne, title_en: 'Title page and introduction', title_ar: '', reason: FRONT, noun: 'Source text', split: false },
      { test: (page, i, all) => i < all.supplementStart, title_en: 'The notebook', title_ar: '' },
      { title_en: 'Additions to the copy (zayādāt)', title_ar: 'زيادات النسخة' },
    ],
  },
  'juz-sufyan-ibn-uyayna': {
    kind: 'Fascicle (juzʾ) with an editor’s study', noun: 'Narration',
    blurb: 'A fascicle of fifty narrations of Sufyān ibn ʿUyayna (d. 198 AH) in the transmission of Zakariyyā ibn Yaḥyā al-Marwazī. The printed edition adds an editor’s introduction and study before the text and audition notes (samāʿāt) after it; both are kept apart from the narrations.',
    structure: 'The source opens with the editor’s introduction, methodology and biographies, then the fascicle with narrations 1 to 50, then audition notes (samāʿāt).',
    drop: page => /^[\s.‌]+$/.test(page.text),
    groups: [
      { test: page => !(Number(page.page_number) >= 27), title_en: 'Editor’s introduction and title pages', title_ar: '', reason: FRONT, noun: 'Editor’s page', split: false },
      { test: page => Number(page.page_number) < 75, title_en: 'The fascicle', title_ar: '' },
      { title_en: 'Audition notes (samāʿāt)', title_ar: 'سماعات الجزء', reason: 'No isnad: this is a note recording an audition of the fascicle.', noun: 'Audition note', split: false },
    ],
  },
  'hadith-mujaa-ibn-al-zubayr': {
    kind: 'Part (juzʾ) of a scholar’s ḥadīth', noun: 'Narration',
    blurb: 'Part Two of the ḥadīth of Abū ʿUbayda Mujāʿa ibn al-Zubayr al-ʿAtakī al-Baṣrī (d. 146 AH), published in the series Ḥadīth Parts and Books (no. 20) by Dār al-Bashāʾir al-Islāmiyya. Narrations are numbered in the edition.',
    structure: 'A numbered part (juzʾ). A short front section gives the series and title page, then the narrations follow in the edition’s numbering.',
    groups: [
      { test: (page, i) => i < 4, title_en: 'Series information and title page', title_ar: '', reason: FRONT, noun: 'Source text', split: false },
      { title_en: 'The narrations', title_ar: '' },
    ],
  },
  'ahadith-muntakhaba-maghazi-musa-ibn-uqba': {
    kind: 'Selection (muntakhab)', noun: 'Narration',
    blurb: 'Twenty selected traditions drawn from the Maghāzī (campaign narratives) of Mūsā ibn ʿUqba (d. 141 AH), each marked with the part of the original work it comes from. First edition by Muʾassasat al-Rayyān and Dār Ibn Ḥazm, 1991.',
    structure: 'A selection of numbered traditions 1 to 20. Where the source marks it, an entry begins with the part of the Maghāzī it was taken from, such as “from the first part”. The opening pages give the transmission of the selection.',
    groups: [
      { test: (page, i) => i < 2, title_en: 'Opening and transmission of the selection', title_ar: '', reason: COPY, noun: 'Source text', split: false },
      { title_en: 'The selected traditions', title_ar: '' },
    ],
  },
  'kitab-al-hajj-al-majishun': {
    kind: 'Topical book (kitāb)', noun: 'Page',
    blurb: 'The surviving leaves of the Book of Pilgrimage from the books of ʿAbd al-ʿAzīz ibn al-Mājishūn (d. 164 AH), printed with the pilgrimage book of al-ʿUtbī. It is a running legal and ritual text, read here page by page; only a few pages quote a chain, and the rest is stated directly.',
    structure: 'A topical book on the pilgrimage, printed as continuous prose. The unit is the printed page. Isnads occur only where a page quotes a report with its chain; other pages are direct statements.',
    groups: [
      { test: (page, i) => i < 2, title_en: 'Title and catalog material', title_ar: '', reason: FRONT, noun: 'Source text', split: false },
      { title_en: 'The text, page by page', title_ar: '' },
    ],
  },
  'nuskhat-ibrahim-ibn-sad': {
    kind: 'Notebook (nuskha)', noun: 'Report', segment: true,
    blurb: 'The notebook of Ibrāhīm ibn Saʿd (d. 184 AH) in the transmission of Abū Ṣāliḥ, the scribe of al-Layth, printed within a collection published under the title al-Fawāʾid. The edition prints pages of numbered reports, which are shown here report by report with their printed page.',
    structure: 'A notebook (nuskha) printed on pages 81 to 103 of a larger collection. Reports carry the collection’s running numbers. A report cut by a page break appears as a continuation, and a chain cut at a page end is shown without its matn.',
    groups: [
      { test: (page, i) => i < 2, title_en: 'Title page and transmission of the copy', title_ar: '', reason: COPY, noun: 'Source text', split: false, segment: false },
      { title_en: 'The reports', title_ar: '' },
    ],
  },
  'ashara-ahadith-al-layth-ibn-sad': {
    kind: 'Selection of ten ḥadīths', noun: 'Report', segment: true,
    blurb: 'Ten ḥadīths from the first and second selected parts of the ḥadīth of al-Layth ibn Saʿd (d. 175 AH), printed within a collection published as al-Fawāʾid under the name of Ibn Mandah. Only three printed pages survive in the supplied text.',
    structure: 'A short selection printed on pages 77 to 79 of a larger collection, with reports keeping the collection’s running numbers. Reports cut by a page break are shown as continuations.',
    groups: [{ title_en: 'The reports', title_ar: '' }],
  },
  'majlis-fawaid-al-layth-ibn-sad': {
    kind: 'Session (majlis)', noun: 'Report', segment: true,
    blurb: 'A part containing one session (majlis) from the benefits (fawāʾid) of al-Layth ibn Saʿd (d. 175 AH), published by ʿĀlam al-Kutub, Riyadh, 1987. It opens with the ḥadīth of Thumāma ibn Uthāl and continues with numbered reports.',
    structure: 'A single session of numbered reports. The opening pages give the title, the ḥadīth of Thumāma ibn Uthāl and the transmission of the part; the numbered reports follow.',
    groups: [
      { test: (page, i) => i < 1, title_en: 'Title page', title_ar: '', reason: FRONT, noun: 'Source text', split: false, segment: false },
      { title_en: 'The session', title_ar: '' },
    ],
  },
};

const stripAr = text => String(text ?? '').replace(/^[\s‌‏]*(\d{1,4})\s*[-–]\s*/, '');
const stripEn = text => String(text ?? '').replace(/^\s*(\d{1,4})\s*[-–]\s*/, '');
const leadNumber = text => String(text ?? '').replace(/[‌‏]/g, ' ').trim().match(/^(\d{1,4})\s*[-–]\s/)?.[1] ?? null;

function splitMarkers(text, marker) {
  const hits = [...text.matchAll(marker)];
  const lead = hits.length ? text.slice(0, hits[0].index).trim() : text.trim();
  const parts = hits.map((hit, i) => ({ number: hit[1], text: text.slice(hit.index + hit[0].length, hits[i + 1]?.index ?? text.length).trim() }));
  return { lead, parts };
}

/** Splits a page into its numbered reports when the Arabic and English markers line up exactly; otherwise null. */
function segmentPage(ar, en) {
  const a = splitMarkers(ar, MARKER_AR);
  const e = splitMarkers(en, MARKER_EN);
  if (!a.parts.length || a.parts.length !== e.parts.length || a.parts.some((part, i) => part.number !== e.parts[i].number)) return null;
  return { lead: { ar: a.lead, en: e.lead }, parts: a.parts.map((part, i) => ({ number: part.number, ar: part.text, en: e.parts[i].text })) };
}

const noteListFor = (page, bySerial) => {
  const list = [];
  for (const key of ['translation_notes', 'translator_note']) {
    const value = page[key];
    if (Array.isArray(value)) list.push(...value.filter(item => typeof item === 'string'));
    else if (typeof value === 'string' && value) list.push(value);
  }
  if (bySerial.has(String(page.serial_number))) list.push(bySerial.get(String(page.serial_number)));
  return list;
};

export function pagesFromB(j, profile) {
  const globalNotes = (j.translation_notes ?? []).filter(note => note.scope === 'global').map(note => note.note);
  const bySerial = new Map((j.translation_notes ?? []).filter(note => note.serial_number).map(note => [String(note.serial_number), note.note]));
  const isHeader = (page, index) => index < 3 && !/^\d+$/.test(String(page.page_number)) && /المؤلف|الناشر/.test(String(page.text)) && /الطبعة|عدد الأجزاء|عدد الصفحات/.test(String(page.text));
  let all = j.pages.filter((page, index) => !isHeader(page, index));
  const headerCount = j.pages.length - all.length;
  const dropped = profile.drop ? all.filter(profile.drop).length : 0;
  if (profile.drop) all = all.filter(page => !profile.drop(page));
  const supplement = all.findIndex(page => /^[\s‌]*زيادات/.test(page.text));
  all.firstOne = Math.max(0, all.findIndex(page => leadNumber(page.text) === '1'));
  all.supplementStart = supplement < 0 ? all.length : supplement;
  const buckets = profile.groups.map(group => ({ ...group, records: [] }));
  let previous = null;
  all.forEach((page, index) => {
    const found = buckets.findIndex(group => !group.test || group.test(page, index, all));
    const group = buckets[found < 0 ? buckets.length - 1 : found];
    const en = page.text_english ?? page.text_en ?? '';
    const footAr = page.foot_note && page.foot_note !== 'None' ? page.foot_note : '';
    const footEn = page.foot_note_english && page.foot_note_english !== 'None' ? page.foot_note_english : '';
    const base = {
      source_id: String(page.serial_number),
      page: /^\d+$/.test(String(page.page_number)) ? String(page.page_number) : null,
      chains: [], flags: [], remarks: [], extra_refs: [],
      footnotes: footAr || footEn ? [{ marker: null, kind: 'Source footnote', ar: footAr, en: footEn, anchored_in: null }] : [],
      translator_notes: noteListFor(page, bySerial),
      ...(group.split === false ? { no_split: true, no_isnad_reason: group.reason } : {}),
      ...(group.noun ? { noun: group.noun } : {}),
    };
    const seg = group.segment !== false && profile.segment ? segmentPage(page.text, en) : null;
    if (seg) {
      if (seg.lead.ar || seg.lead.en) group.records.push({ ...base, text_ar: seg.lead.ar, text_en: seg.lead.en, display_number: previous ?? '—', noun: 'Report (continued)', no_split: true, no_isnad_reason: 'No isnad: this continues a report that began on the previous page.' });
      seg.parts.forEach(part => { previous = part.number; group.records.push({ ...base, text_ar: part.ar, text_en: part.en, display_number: part.number }); });
      return;
    }
    const printed = leadNumber(page.text);
    const numbered = profile.noun === 'Narration' && group.split !== false;
    const continuation = numbered && printed && printed === previous;
    if (numbered && printed) previous = printed;
    const fallbackNumber = base.page ?? String(index + 1);
    group.records.push({
      ...base,
      text_ar: numbered ? stripAr(page.text) : page.text,
      text_en: numbered ? stripEn(en) : en,
      display_number: numbered ? (printed ?? previous ?? '1') : fallbackNumber,
      ...(continuation ? { noun: 'Narration (continued)', no_split: true, no_isnad_reason: 'No isnad: this printed page continues the preceding narration.' } : {}),
    });
  });
  const groups = buckets.filter(group => group.records.length).map((group, order) => ({
    number: order + 1, title_en: group.title_en, title_ar: group.title_ar, frames_before: [], frames_after: [],
    records: group.records,
  }));
  let count = 0;
  for (const group of groups) for (const record of group.records) { count += 1; record.id = `${group.number}.${count}`; }
  return { groups, headerCount, dropped, globalNotes };
}
