/* Rewrites the page bodies of the early commentaries
   (src/data/tafsir/pages/<mujahid|thawri>/<part>.html) from the
   side-by-side cards written by build-tafsir-edition-pages.mjs into the
   sectioned report layout: chapters of reports, each report with its chain set
   apart from its text.

     node scripts/tafsir/restyle-tafsir-editions.mjs [--dry]

   Nothing in the source wording is rewritten. The script only moves it:

   - the chain is cut from the text at the first Qur'anic citation or quotation
     mark (or, in English, after the first "who said:"). Where no safe cut
     exists the report is left whole. Al-Thawrī's Arabic has no quotation marks,
     so only its English is divided;
   - braces round Qur'anic wording become a highlight, and the printed verse
     references, such as [البقرة: 14] or (الآية 48), are set in small type;
   - the Arabic "صلى الله عليه وسلم" is set as the ﷺ ligature;
   - in the surah commentaries a chapter opens at each report whose first cited
     verse differs from the one before it; reports that cite nothing stay with
     the chapter above.

   Chapter titles are the English of the first Qur'anic wording the chapter
   quotes, or the report numbers. Surah and chapter headings the edition prints
   are dropped from the body: the page shows them from index.json. Files that
   are already converted are skipped, so hand edits made afterwards are safe. */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dry = process.argv.includes('--dry');
const root = resolve('src/data/tafsir/pages');
const SQ_TITLE = 'Qurʾānic wording quoted by the edition';
const TITLE_MAX = 68;
const CHUNK = 20;
const HONORIFICS = /[ؓؑؒﷺﷻ]|\(\s*\)/g;

/* How each work is divided, and who speaks when a chain names no one. */
const WORKS = [
  { id: 'mujahid', chapters: 'verse', speaker: null },
  { id: 'thawri', chapters: 'verse', speaker: { full: 'Sufyān al-Thawrī', short: 'Sufyān' } },
];

/* Names as the English prints them, without diacritics, to a consistent
   transliteration: [full name, short name for the label]. */
const NAMES = {
  'mujahid': ['Mujāhid ibn Jabr', 'Mujāhid'],
  'ibn abbas': ['Ibn ʿAbbās'],
  'al-hasan': ['al-Ḥasan'],
  'al-hasan al-basri': ['al-Ḥasan al-Baṣrī', 'al-Ḥasan'],
  'said ibn jubayr': ['Saʿīd ibn Jubayr'],
  'ibn masud': ['Ibn Masʿūd'],
  'abd allah ibn masud': ['ʿAbd Allāh ibn Masʿūd', 'Ibn Masʿūd'],
  'ikrima': ['ʿIkrima'],
  'ibrahim': ['Ibrāhīm'],
  'abu hurayra': ['Abū Hurayra'],
  'ibn jurayj': ['Ibn Jurayj'],
  'abu al-aliya': ['Abū al-ʿĀliya'],
  'abu al-aliya al-riyahi': ['Abū al-ʿĀliya al-Riyāḥī', 'Abū al-ʿĀliya'],
  'aisha': ['ʿĀʾisha'],
  'muhammad ibn kab al-qurazi': ['Muḥammad ibn Kaʿb al-Quraẓī', 'Muḥammad ibn Kaʿb'],
  'jabir': ['Jābir'],
  'ali': ['ʿAlī'],
  'ali ibn abi talib': ['ʿAlī ibn Abī Ṭālib', 'ʿAlī'],
  'al-shabi': ['al-Shaʿbī'],
  'ubayd ibn umayr al-laythi': ['ʿUbayd ibn ʿUmayr al-Laythī', 'ʿUbayd ibn ʿUmayr'],
  'al-bara ibn azib': ['al-Barāʾ ibn ʿĀzib'],
  'anas ibn malik': ['Anas ibn Mālik'],
  'anas': ['Anas'],
  'ibn abi najih': ['Ibn Abī Najīḥ'],
  'qatada': ['Qatāda'],
  'abu umama': ['Abū Umāma'],
  'abu umama al-bahili': ['Abū Umāma al-Bāhilī', 'Abū Umāma'],
  'said ibn al-musayyab': ['Saʿīd ibn al-Musayyab'],
  'abu said al-khudri': ['Abū Saʿīd al-Khudrī'],
  'wahb ibn munabbih': ['Wahb ibn Munabbih'],
  'khalid ibn arara': ['Khālid ibn ʿArʿara'],
  'kab': ['Kaʿb'],
  'kab al-ahbar': ['Kaʿb al-Aḥbār'],
  'ibn umar': ['Ibn ʿUmar'],
  'abu abd al-rahman al-sulami': ['Abū ʿAbd al-Raḥmān al-Sulamī'],
  'ata': ['ʿAṭāʾ'],
  'ata ibn abi rabah': ['ʿAṭāʾ ibn Abī Rabāḥ'],
  'ata ibn al-saib': ['ʿAṭāʾ ibn al-Sāʾib'],
  'abu malik': ['Abū Mālik'],
  'masruq': ['Masrūq'],
  'masruq ibn al-ajda': ['Masrūq ibn al-Ajdaʿ', 'Masrūq'],
  'abd allah ibn amr ibn al-as': ['ʿAbd Allāh ibn ʿAmr ibn al-ʿĀṣ', 'ʿAbd Allāh ibn ʿAmr'],
  'abu razin': ['Abū Razīn'],
  'humayd al-tawil': ['Ḥumayd al-Ṭawīl'],
  'umar ibn al-khattab': ['ʿUmar ibn al-Khaṭṭāb', 'ʿUmar'],
  'miqsam abu abd al-rahman': ['Miqsam Abū ʿAbd al-Raḥmān', 'Miqsam'],
  'nawf al-bikali': ['Nawf al-Bikālī'],
  'abu musa al-ashari': ['Abū Mūsā al-Ashʿarī'],
  'shibak': ['Shibāk'],
  'abu wail shaqiq ibn salama': ['Abū Wāʾil Shaqīq ibn Salama', 'Abū Wāʾil'],
  'shaqiq ibn salama': ['Shaqīq ibn Salama', 'Shaqīq'],
  'al-rabi ibn anas': ['al-Rabīʿ ibn Anas'],
  'al-rabi ibn khuthaym': ['al-Rabīʿ ibn Khuthaym'],
  'tawus': ['Ṭāwūs'],
  'amr ibn dinar': ['ʿAmr ibn Dīnār'],
  'shurayh': ['Shurayḥ'],
  'muadh ibn jabal': ['Muʿādh ibn Jabal'],
  'muhammad ibn sirin': ['Muḥammad ibn Sīrīn'],
  'abu dharr al-ghifari': ['Abū Dharr al-Ghifārī', 'Abū Dharr'],
  'zayd ibn aslam': ['Zayd ibn Aslam'],
  'zayd ibn arqam': ['Zayd ibn Arqam'],
  'zayd ibn wahb': ['Zayd ibn Wahb'],
  'malik ibn dinar': ['Mālik ibn Dīnār'],
  'sufyan': ['Sufyān'],
  'sufyan al-thawri': ['Sufyān al-Thawrī'],
  'abu al-darda': ['Abū al-Dardāʾ'],
  'shahr ibn hawshab': ['Shahr ibn Ḥawshab'],
  'ali ibn husayn': ['ʿAlī ibn Ḥusayn'],
  'abu ishaq': ['Abū Isḥāq'],
  'al-aswad': ['al-Aswad'],
  'al-aswad ibn yazid': ['al-Aswad ibn Yazīd'],
  'abu al-tufayl': ['Abū al-Ṭufayl'],
  'al-numan ibn bashir': ['al-Nuʿmān ibn Bashīr'],
  'abu ubayda': ['Abū ʿUbayda'],
  'kab ibn ujra': ['Kaʿb ibn ʿUjra'],
  'abd al-rahman ibn abi layla': ['ʿAbd al-Raḥmān ibn Abī Laylā'],
  'umm atiyya': ['Umm ʿAṭiyya'],
  'ibn abi awfa': ['Ibn Abī Awfā'],
  'abu maysara': ['Abū Maysara'],
  'murra al-hamdani': ['Murra al-Hamdānī'],
  'yahya ibn abi kathir': ['Yaḥyā ibn Abī Kathīr'],
  'abu al-bakhtari': ['Abū al-Bakhtarī'],
  'abu al-duha': ['Abū al-Ḍuḥā'],
  'salim ibn abi al-jad': ['Sālim ibn Abī al-Jaʿd'],
  'abd allah ibn shaddad ibn al-had': ['ʿAbd Allāh ibn Shaddād ibn al-Hād'],
  'hilal ibn yasaf': ['Hilāl ibn Yasāf'],
  'musab ibn sad ibn abi waqqas': ['Muṣʿab ibn Saʿd ibn Abī Waqqāṣ', 'Muṣʿab ibn Saʿd'],
  'al-dahhak': ['al-Ḍaḥḥāk'],
  'al-dahhak ibn muzahim': ['al-Ḍaḥḥāk ibn Muzāḥim', 'al-Ḍaḥḥāk'],
  'ibn shihab': ['Ibn Shihāb'],
  'al-qurazi': ['al-Quraẓī'],
  'muhammad ibn kab': ['Muḥammad ibn Kaʿb'],
  'abd allah': ['ʿAbd Allāh'],
  'abd allah ibn abbas': ['ʿAbd Allāh ibn ʿAbbās', 'Ibn ʿAbbās'],
  'abd allah ibn amr': ['ʿAbd Allāh ibn ʿAmr'],
  'abd allah ibn al-harith': ['ʿAbd Allāh ibn al-Ḥārith'],
  'abu salih': ['Abū Ṣāliḥ'],
  'al-amash': ['al-Aʿmash'],
  'al-suddi': ['al-Suddī'],
  'said ibn al-musayyib': ['Saʿīd ibn al-Musayyib'],
  'malik': ['Mālik'],
  'abu sakhr': ['Abū Ṣakhr'],
  'yazid ibn abi habib': ['Yazīd ibn Abī Ḥabīb'],
  'al-layth': ['al-Layth'],
  'nafi': ['Nāfiʿ'],
  'ibn sirin': ['Ibn Sīrīn'],
  'abu mijlaz': ['Abū Mijlaz'],
  'umar': ['ʿUmar'],
  'yahya ibn said': ['Yaḥyā ibn Saʿīd'],
  'ubayd ibn umayr': ['ʿUbayd ibn ʿUmayr'],
  'amr ibn shuayb': ['ʿAmr ibn Shuʿayb'],
  'rabia ibn abi abd al-rahman': ['Rabīʿa ibn Abī ʿAbd al-Raḥmān', 'Rabīʿa'],
  'abd al-rahman al-araj': ['ʿAbd al-Raḥmān al-Aʿraj'],
  'abu al-aswad': ['Abū al-Aswad'],
  'said ibn abi hilal': ['Saʿīd ibn Abī Hilāl'],
  'kharija ibn zayd ibn thabit': ['Khārija ibn Zayd ibn Thābit'],
  'abu ubayd': ['Abū ʿUbayd'],
};

const pad = (n) => String(n).padStart(2, '0');
/* One run of text per column: paragraphs joined, a printed page break kept inline. */
const unp = (html) =>
  html
    .replace(/<\/p><p class="tfe-pb"><span>([^<]*)<\/span><\/p><p>/g, ' <span class="report__pb">⦗$1⦘</span> ')
    .replace(/^<p>/, '')
    .replace(/<\/p>$/, '')
    .replace(/<\/p><p>/g, '<br>');
const nameKey = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ʿʾ’‘`]|&#39;/g, '')
    .replace(/\bb\. /g, 'ibn ')
    .replace(/\babdallah\b/gi, 'abd allah')
    .replace(/\babd god\b/gi, 'abd allah')
    .replace(/\b(abi|abu|ibn) l-/gi, '$1 al-')
    .toLowerCase()
    .trim();

/* The last authority the English chain names. */
function authority(head, work) {
  const from = [...head.matchAll(/\b[Ff]rom ([^,:(]+)/g)].pop();
  const heard = [...head.matchAll(/\b(?:heard|asked) ([^,:(]+?) (?:say|about)\b/g)].pop();
  const said = [...head.matchAll(/\b(?:And |and )?((?:al-|ʿ)?[A-Z][^,:(]{2,40}?) said[,:]/g)]
    .filter((m) => !/^(And|He|She|They|God|Some)\b/.test(m[1]) && !/\b(informed|narrated|related|told|recited|heard)\b/.test(m[1]))
    .pop();
  const pick = [from, heard, said].filter(Boolean).sort((a, b) => b.index - a.index)[0];
  if (!pick) return null;
  const raw = pick[1]
    .replace(HONORIFICS, '')
    .replace(/\s+(who|on|regarding|concerning|about|that|and would)\b.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const key = nameKey(raw);
  if (!key || key.split(' ').length > 7 || /^(the|his|her|him|them|me|us|it|a|an|and|god|above|someone|some)\b/.test(key) || /[.;]/.test(raw)) return null;
  if (key === 'sufyan' && work.speaker) return work.speaker;
  const known = NAMES[key];
  const full = known?.[0] ?? raw.replace(/\bAbd God\b/g, 'ʿAbd Allāh');
  return { full, short: known?.[1] ?? full };
}

const sq = (text) => `<span class="scripture-quote" title="${SQ_TITLE}">${text}</span>`;
const ref = (text) => `<span class="source-ref">${text}</span>`;
const EN_REF = String.raw`\[[^\[\]<>]{2,40}\d+\]`;

/* English: braces, or a quotation followed at once by a printed reference. */
function decorateEn(html) {
  const quoted = (open, close) =>
    new RegExp(`${open}((?:(?!${open}|${close}|&quot;|<).){1,400}?)${close}\\s*(${EN_REF})`, 'g');
  return html
    .replace(/\{([^{}<>]{1,600})\}/g, (_, t) => sq(t))
    .replace(quoted('&quot;', '&quot;'), (_, t, r) => `${sq(t)} ${ref(r)}`)
    .replace(quoted('“', '”'), (_, t, r) => `${sq(t)} ${ref(r)}`)
    .replace(quoted('&#39;', '&#39;'), (_, t, r) => `${sq(t)} ${ref(r)}`)
    .replace(quoted('‘', '’'), (_, t, r) => `${sq(t)} ${ref(r)}`)
    .replace(new RegExp(`(?<!source-ref">)${EN_REF}`, 'g'), (r) => ref(r))
    .replace(/\((?:verses?|v\.) [^()<>]{1,60}\)/g, (r) => ref(r));
}

function decorateAr(html) {
  return html
    .replace(/<span class="scripture-quote">\{?([^<]*?)\}?<\/span>/g, (_, t) => sq(t))
    .replace(/\[[^\[\]<>]{2,30}:\s*[\d٠-٩]+\]/g, (r) => ref(r))
    .replace(/\((?:الآية|الآيات|الآيتان)[^()<>]{1,40}\)/g, (r) => ref(r))
    .replace(/صلى الله عليه وسلم/g, 'ﷺ');
}

const CHAIN_EN = /\b(informed|narrated to|related to|told) (us|me)\b|\b[Ff]rom [A-Zʿa]|^[\d:\s.]*(And )?(Sufy[aā]n|He said)\b/;

function splitEn(text) {
  const quote = text.search(/\{|“|&quot;|"/);
  const said = text.match(/, who said:\s/);
  const saidAt = said ? said.index + said[0].length : -1;
  const cut = [quote, saidAt].filter((n) => n > 0).sort((a, b) => a - b)[0];
  if (!cut) return null;
  const head = text.slice(0, cut).trim();
  const body = text.slice(cut).trim();
  return CHAIN_EN.test(head) && body ? { head, body } : null;
}

function splitAr(text, enHeadLength) {
  const cut = text.search(/<span class="scripture-quote">|&quot;|«|"/);
  if (cut <= 0) return null;
  const head = text.slice(0, cut).trim();
  const body = text.slice(cut).trim();
  /* A chain far longer than its English counterpart has swallowed narrative. */
  if (!body || enHeadLength === null || head.length > enHeadLength * 2.5 + 80) return null;
  return { head, body };
}

/* The first quoted wording of a report that cites a verse, where the English
   marks Qur'anic wording with quotation marks alone (al-Thawrī). */
const firstQuoted = (text) => text.match(/(?:&quot;|“)((?:(?!&quot;|”|<).){3,200}?)(?:&quot;|”)/)?.[1] ?? null;

function parseNote(html) {
  const label = html.match(/tfe-note__label">([^<]*)/)?.[1] ?? "Editor's note";
  const en = html.match(/tfe-entry__en">([\s\S]*?)<\/div><div class="tfe-entry__ar/)?.[1] ?? '';
  const ar = html.match(/tfe-entry__ar arabic" lang="ar" dir="rtl">([\s\S]*?)<\/div><\/div>/)?.[1] ?? '';
  return { label, en: unp(en), ar: unp(ar) };
}

function parseEntry(html, work) {
  const en = unp(html.match(/tfe-entry__en prose" lang="en">([\s\S]*?)<\/div><div class="tfe-entry__ar/)[1]);
  const ar = unp(html.match(/tfe-entry__ar arabic" lang="ar" dir="rtl">([\s\S]*?)<\/div><\/div>/)[1]);
  const verses = [...html.matchAll(/<a class="tfe-ref"[^>]*>Q (\d+):(\d+)(?:–(\d+))?<\/a>/g)].map((m) => Number(m[2]));
  const label = html.match(/tfe-entry__n">([^<]+)/)[1];
  const preamble = html.includes('tfe-entry--preamble');
  const enSplit = preamble ? null : splitEn(en);
  const arSplit = preamble ? null : splitAr(ar, enSplit ? enSplit.head.length : null);
  const enText = decorateEn(enSplit ? enSplit.body : en);
  const named = authority(enSplit ? enSplit.head : '', work);
  const cites = ar.includes('scripture-quote') || verses.length > 0;
  return {
    id: html.match(/id="([^"]+)"/)[1],
    serial: html.match(/data-serial="([^"]*)"/)[1],
    label,
    /* "Report 04" counts within the surah; "No. 358: 9: 11" is the edition's own number. */
    number: Number(label.match(/^(?:Report|No\.) (\d+)/)?.[1] ?? 0),
    printed: label.startsWith('No.'),
    preamble,
    page: html.match(/tfe-entry__loc">([^<]*)/)[1],
    verses: [...new Set(verses)],
    who: named ?? (enSplit && !preamble ? work.speaker : null),
    enHead: enSplit ? decorateEn(enSplit.head) : null,
    enText,
    arHead: arSplit ? decorateAr(arSplit.head) : null,
    arText: decorateAr(arSplit ? arSplit.body : ar),
    quote: enText.match(/<span class="scripture-quote"[^>]*>([^<]+)<\/span>/)?.[1] ?? (verses.length ? firstQuoted(enText) : null),
    opensWithQuote: /^(&quot;|\s)*<span class="scripture-quote"/.test(arSplit ? arSplit.body : ''),
    cites,
    notes: (html.match(/<aside class="tfe-note">[\s\S]*?<\/aside>/g) ?? []).map(parseNote),
  };
}

function reportHtml(r) {
  const n = r.number ? (r.printed ? String(r.number) : pad(r.number)) : '··';
  const label = r.preamble
    ? r.label
    : r.who
      ? `${r.cites ? 'Explanation' : 'Report'} from ${r.who.short}`
      : r.number
        ? 'Report'
        : 'Continued from the previous page';
  const title = r.preamble ? 'How the text was transmitted' : r.who?.full ?? (r.number ? `Report ${n}` : 'Continued text');
  const tag = r.printed ? r.label : n;
  const column = (lang, head, text) =>
    (head ? `<div class="isnad-inline"><span class="isnad-label">${lang === 'ar' ? 'الإسناد' : 'Transmission wording'}</span><div class="isnad-text${lang === 'ar' ? ' arabic' : ''}">${head}</div></div>\n` : '') +
    `<div class="report__text${lang === 'ar' ? ' arabic' : ''}">${text}</div>\n`;
  const notes = r.notes
    .map((note) =>
      `<aside class="report__note"><span class="report__note-label">${note.label}</span><div class="report__layout">` +
      `<div class="report__column report__column--en" lang="en">${note.en}</div>` +
      `<div class="report__column report__column--ar arabic" dir="rtl" lang="ar">${note.ar}</div></div></aside>\n`)
    .join('');
  return (
    `<article class="report" data-report="${r.number}" data-serial="${r.serial}" id="${r.id}">\n` +
    `<header class="report__header"><span aria-hidden="true" class="report__emblem${n.length > 2 ? ' report__emblem--long' : ''}">${n}</span>\n` +
    `<div class="report__byline"><span class="report__eyebrow">${label} <span class="report__number">${tag}</span></span><h3>${title}</h3></div></header>\n` +
    `<div class="report__layout">\n` +
    `<section aria-label="English translation" class="report__column report__column--en" lang="en"><span class="report__lang">English</span>\n${column('en', r.enHead, r.enText)}</section>\n` +
    `<section aria-label="Arabic source text" class="report__column report__column--ar" dir="rtl" lang="ar"><span class="report__lang">العربية</span>\n${column('ar', r.arHead, r.arText)}</section></div>\n` +
    notes +
    `<div class="report__foot"><span>Edition record ${r.serial} · ${r.page}</span><a aria-label="Link to report ${r.number || ''}" href="#${r.id}">Link to report ↗</a></div>\n` +
    `</article>`
  );
}

function chaptersOf(reports, work) {
  const chapters = [];
  if (work.chapters === 'chunk') {
    for (let i = 0; i < reports.length; i += CHUNK) chapters.push({ verse: null, reports: reports.slice(i, i + CHUNK) });
    return chapters;
  }
  for (const r of reports) {
    const current = chapters.at(-1);
    const opens = !current || (r.verses.length ? r.verses[0] !== current.verse : r.opensWithQuote);
    if (opens) chapters.push({ verse: r.verses[0] ?? null, reports: [r] });
    else current.reports.push(r);
  }
  return chapters;
}

function shorten(text) {
  const clean = text.replace(/\s+/g, ' ').replace(/^[\s,;:.]+|[\s,;:.]+$/g, '');
  if (clean.length <= TITLE_MAX) return clean;
  return `${clean.slice(0, clean.lastIndexOf(' ', TITLE_MAX)).replace(/[,;:]+$/, '')}…`;
}

const COUNT = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const list = (items) => (items.length < 3 ? items.join(' and ') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);

function chapterTitle(chapter, index, work, anyCited) {
  const { reports } = chapter;
  if (work.chapters === 'chunk') {
    const numbered = reports.filter((r) => r.number);
    if (!numbered.length) return 'Opening';
    const [first, last] = [numbered[0].number, numbered.at(-1).number];
    return first === last ? `Report ${first}` : `Reports ${first} to ${last}`;
  }
  const quote = reports.find((r) => r.quote)?.quote;
  if (quote) return `“${shorten(quote)}”`;
  if (chapter.verse) return `Verse ${chapter.verse}`;
  if (!anyCited) return 'Transmitted reports';
  if (index === 0) return `${reports.length === 1 ? 'A report' : 'Reports'} before the first cited verse`;
  return reports.length === 1 ? 'A further report' : 'Further reports';
}

function chapterHtml(chapter, index, surah, work, anyCited) {
  const { reports } = chapter;
  const n = index + 1;
  const names = [...new Set(reports.map((r) => r.who?.full).filter(Boolean))];
  const shown = names.length > 4 ? [...names.slice(0, 3), 'others'] : names;
  const kind = work.chapters === 'verse' && reports.some((r) => r.cites) ? 'explanation' : 'report';
  const count = COUNT[reports.length] ?? String(reports.length);
  const what = reports.length === 1 ? `${kind === 'explanation' ? 'An' : 'A'} ${kind}` : `${count} ${kind}s`;
  const verses = [...new Set(reports.flatMap((r) => r.verses))].sort((a, b) => a - b);
  const links = verses.slice(0, 4).map((v, i) => `<a href="#verse-${v}">${i === 0 ? 'Q ' : ''}${surah}:${v}</a>`);
  const where = verses.length ? ` (${links.join(', ')}${verses.length > 4 ? ` and ${verses.length - 4} more` : ''})` : '';
  const lede = `${what}${shown.length ? ` transmitted from ${list(shown)}` : ''}${where}.`;
  return (
    `<section aria-labelledby="chapter-${n}-title" class="chapter" id="chapter-${n}"${verses.length ? ` data-verses="${verses.join(' ')}"` : ''}>` +
    `<header class="chapter__heading"><span class="chapter__number">${pad(n)}</span><h2 id="chapter-${n}-title">${chapterTitle(chapter, index, work, anyCited)}</h2></header>` +
    `<p class="chapter__lede">${lede}</p><div class="report-group">${reports.map(reportHtml).join('')}</div></section>`
  );
}

for (const work of WORKS) {
  const dir = join(root, work.id);
  let converted = 0;
  let skipped = 0;
  const stats = { reports: 0, chapters: 0, enSplit: 0, arSplit: 0, named: 0, titled: 0 };
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    const path = join(dir, file);
    const source = readFileSync(path, 'utf8');
    if (!source.includes('class="tfe-entry')) {
      skipped++;
      continue;
    }
    const surah = Number(file.replace('.html', '')) || null;
    const comment = source.match(/^<!--[\s\S]*?-->/)?.[0] ?? '';
    const entries = source.match(/<article class="tfe-entry[^>]*>[\s\S]*?<\/article>/g) ?? [];
    const reports = entries.filter((e) => !e.includes('tfe-entry--heading')).map((e) => parseEntry(e, work));
    const chapters = chaptersOf(reports, work);
    const anyCited = reports.some((r) => r.verses.length);
    const html =
      `${comment.replace(' Safe to edit by hand; regeneration needs --overwrite.', '').replace(' -->', '')} Laid out in chapters by scripts/tafsir/restyle-tafsir-editions.mjs. Safe to edit by hand. -->\n` +
      chapters.map((c, i) => chapterHtml(c, i, surah, work, anyCited)).join('\n') +
      '\n';
    stats.reports += reports.length;
    stats.chapters += chapters.length;
    stats.enSplit += reports.filter((r) => r.enHead).length;
    stats.arSplit += reports.filter((r) => r.arHead).length;
    stats.named += reports.filter((r) => r.who).length;
    stats.titled += chapters.filter((c) => c.reports.some((r) => r.quote)).length;
    if (!dry) writeFileSync(path, html);
    converted++;
  }
  process.stdout.write(`${work.id}: ${dry ? 'would convert' : 'converted'} ${converted} pages; skipped ${skipped} already converted. ${JSON.stringify(stats)}\n`);
}
