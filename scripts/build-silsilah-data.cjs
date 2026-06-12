/*
  Silsilah data pipeline.

  Streams the raw TSV exports in hadith/ and produces compact JSON used by the
  Astro pages under src/pages/silsilah/ plus client-side reference indexes in
  public/silsilah-data/.

  Outputs:
    src/data/silsilah/index.json                  collections + book lists (small, used by getStaticPaths)
    src/data/silsilah/<slug>/book-<bookSlug>.json paginated entries for one kitab
    public/silsilah-data/<slug>/refindex.json     ref -> [bookSlug, page] for the reference jump

  Run: node scripts/build-silsilah-data.cjs
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const HADITH_DIR = path.join(ROOT, 'hadith');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'silsilah');
const PUB_DIR = path.join(ROOT, 'public', 'silsilah-data');

const PAGE_TARGET = 120; // preferred hadith per page
const PAGE_HARD = 200; // never exceed

// Display metadata per collection. Order within each category is the display order.
const MANIFEST = [
  // The Six Books
  { slug: 'bukhari', file: 'bukhari.tsv', category: 'The Six Books', died: 'd. 256 AH / 870 CE', blurb: 'The most revered Sunni collection. Compiled from a claimed pool of 600,000 reports.' },
  { slug: 'muslim', file: 'muslim.tsv', category: 'The Six Books', died: 'd. 261 AH / 875 CE', blurb: 'Second of the two Ṣaḥīḥs, known for its strict chapter arrangement and variant chains.' },
  { slug: 'nasai', file: 'nasai.tsv', category: 'The Six Books', died: 'd. 303 AH / 915 CE', blurb: 'Al-Sunan al-Ṣughrá, the distilled selection from al-Nasāʾī’s larger Sunan.' },
  { slug: 'abudawud', file: 'abudawud.tsv', category: 'The Six Books', died: 'd. 275 AH / 889 CE', blurb: 'A Sunan focused on legal reports, with the compiler’s own remarks on defects.' },
  { slug: 'tirmidhi', file: 'tirmidhi.tsv', category: 'The Six Books', died: 'd. 279 AH / 892 CE', blurb: 'A Jāmiʿ noted for grading its own reports and recording juristic usage.' },
  { slug: 'ibnmajah', file: 'ibnmajah.tsv', category: 'The Six Books', died: 'd. 273 AH / 887 CE', blurb: 'The disputed sixth book, containing material absent from the other five.' },
  // Early Collections
  { slug: 'malik', file: 'malik.tsv', category: 'Early Collections', died: 'd. 179 AH / 795 CE', blurb: 'The earliest surviving collection, blending reports with Medinan practice.' },
  { slug: 'ahmad', file: 'ahmad.tsv', category: 'Early Collections', died: 'd. 241 AH / 855 CE', blurb: 'The massive musnad arranged by companion rather than by topic.' },
  { slug: 'darimi', file: 'darimi.tsv', category: 'Early Collections', died: 'd. 255 AH / 869 CE', blurb: 'An early Sunan from Samarqand, often cited alongside the six books.' },
  // Sahih Compilations
  { slug: 'ibnkhuzaymah', file: 'ibnkhuzaymah.tsv', category: 'Ṣaḥīḥ Compilations', died: 'd. 311 AH / 924 CE', blurb: 'A self-declared ṣaḥīḥ collection limited to ritual law. Only a portion survives.' },
  { slug: 'ibnhibban', file: 'ibnhibban.tsv', category: 'Ṣaḥīḥ Compilations', died: 'd. 354 AH / 965 CE', blurb: 'A ṣaḥīḥ collection with an unusual thematic ordering (al-Taqāsīm wa-al-Anwāʿ).' },
  { slug: 'hakim', file: 'hakim.tsv', category: 'Ṣaḥīḥ Compilations', died: 'd. 405 AH / 1014 CE', blurb: 'Al-Mustadrak: reports al-Ḥākim judged to meet the two Ṣaḥīḥs’ criteria yet absent from them.' },
  { slug: 'lulu-marjan', file: 'lulu-marjan.tsv', category: 'Ṣaḥīḥ Compilations', died: 'compiled 14th c. AH', blurb: 'Modern compilation of the reports Bukhārī and Muslim transmit in common (muttafaq ʿalayh).' },
  // Musnads and Mu'jams
  { slug: 'bazzar', file: 'bazzar.tsv', category: 'Musnads and Muʿjams', died: 'd. 292 AH / 905 CE', blurb: 'Al-Baḥr al-Zakhkhār, a musnad noting the uniqueness of chains.' },
  { slug: 'tabarani', file: 'tabarani.tsv', category: 'Musnads and Muʿjams', died: 'd. 360 AH / 971 CE', blurb: 'Al-Muʿjam al-Kabīr, arranged by companion in alphabetical order.' },
  { slug: 'nasai-kubra', file: 'nasai-kubra.tsv', category: 'Musnads and Muʿjams', died: 'd. 303 AH / 915 CE', blurb: 'The larger Sunan of al-Nasāʾī, source of the distilled al-Ṣughrá.' },
  { slug: 'bayhaqi', file: 'bayhaqi.tsv', category: 'Musnads and Muʿjams', died: 'd. 458 AH / 1066 CE', blurb: 'Al-Sunan al-Kabīr, the largest surviving Sunan, rich in legal variants.' },
  // Topical Works
  { slug: 'adab', file: 'adab.tsv', category: 'Topical Works', died: 'd. 256 AH / 870 CE', blurb: 'Al-Adab al-Mufrad, Bukhārī’s standalone work on manners and conduct.' },
  { slug: 'ahmad-zuhd', file: 'ahmad-zuhd.tsv', category: 'Topical Works', died: 'd. 241 AH / 855 CE', blurb: 'Kitāb al-Zuhd, reports and sayings on asceticism and renunciation.' }
];

const isNull = (v) => v === undefined || v === null || v === '' || v === 'null';
const val = (v) => (isNull(v) ? null : v);

const ARABIC_RE = /[؀-ۿ]/;

// Some exports carry English in `text` and Arabic in `text_en` (swapped). Pick by script.
function pickEnglish(bodyEn, text) {
  if (!isNull(bodyEn)) return bodyEn;
  if (!isNull(text) && !ARABIC_RE.test(text.slice(0, 80))) return text;
  return null;
}
function pickArabic(body, textEn) {
  if (!isNull(body)) return body;
  if (!isNull(textEn) && ARABIC_RE.test(textEn.slice(0, 80))) return textEn;
  return null;
}

function bookSlugOf(h1) {
  if (isNull(h1)) return 'intro';
  return String(h1).replace(/[^0-9a-zA-Z]+/g, '-');
}

function anchorOf(num, ref) {
  const base = !isNull(num) ? String(num) : String(ref).split(':').pop();
  return 'h' + base.replace(/[^0-9a-zA-Z-]+/g, '-');
}

// Strip "[Machine]" markers; remember that it was machine translated.
function cleanIntro(s) {
  if (isNull(s)) return { text: null, machine: false };
  const machine = s.includes('[Machine]');
  return { text: s.replace(/\s*\[Machine\]\s*/g, ' ').trim(), machine };
}

async function processCollection(meta) {
  const filePath = path.join(HADITH_DIR, meta.file);
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  let header = null;
  const idx = {};
  const books = new Map(); // h1 -> { meta, hadith: [] }
  const colInfo = {
    slug: meta.slug,
    category: meta.category,
    died: meta.died,
    blurb: meta.blurb,
    nameEn: '',
    nameAr: '',
    shortEn: '',
    shortAr: '',
    author: '',
    hadithCount: 0,
    englishCount: 0,
    aiCount: 0,
    graders: new Map()
  };

  for await (const line of rl) {
    if (!header) {
      header = line.split('\t');
      header.forEach((h, i) => (idx[h] = i));
      continue;
    }
    if (!line.trim()) continue;
    const c = line.split('\t');
    const g = (n) => val(c[idx[n]]);
    if (g('doctype') !== 'hadith') continue;

    if (!colInfo.nameEn) {
      colInfo.nameEn = g('book_name_en') || meta.slug;
      colInfo.nameAr = g('book_name') || '';
      colInfo.shortEn = g('book_shortName_en') || '';
      colInfo.shortAr = g('book_shortName') || '';
      colInfo.author = g('book_author') || '';
    }

    const h1 = g('h1');
    const key = isNull(h1) ? '__intro__' : String(h1);
    if (!books.has(key)) {
      const i1 = cleanIntro(g('h1_intro_en'));
      books.set(key, {
        h1: isNull(h1) ? null : String(h1),
        slug: bookSlugOf(h1),
        titleEn: g('h1_title_en'),
        titleAr: g('h1_title'),
        introEn: i1.text,
        introAr: g('h1_intro'),
        hadith: []
      });
    }
    const book = books.get(key);

    let english = pickEnglish(g('body_en'), c[idx.text]);
    const arabic = pickArabic(g('body'), c[idx.text_en]);
    let mt = false;
    if (english && english.includes('[AI]')) {
      mt = true;
      english = english.replace(/\s*\[AI\]\s*/g, ' ').trim();
    }
    colInfo.hadithCount++;
    if (english) colInfo.englishCount++;
    if (mt) colInfo.aiCount++;
    const grader = g('grader_shortName_en');
    if (grader) colInfo.graders.set(grader, (colInfo.graders.get(grader) || 0) + 1);

    const i2 = cleanIntro(g('h2_intro_en'));
    const i3 = cleanIntro(g('h3_intro_en'));

    book.hadith.push({
      ordinal: Number(g('ordinal')) || 0,
      ref: g('ref'),
      num: g('num'),
      nic: g('numInChapter'),
      titleEn: g('title_en'),
      gradeEn: g('grade_grade_en'),
      gradeAr: g('grade_grade'),
      graderEn: grader,
      gradesRaw: g('grade_grades'),
      chainEn: g('chain_en'),
      bodyEn: english,
      mt,
      footEn: g('footnote_en'),
      chainAr: g('chain'),
      bodyAr: arabic,
      footAr: g('footnote'),
      tags: g('tags'),
      h2: g('h2'),
      h2TitleEn: g('h2_title_en'),
      h2TitleAr: g('h2_title'),
      h2IntroEn: i2.text,
      h2IntroAr: g('h2_intro'),
      h2Machine: i2.machine,
      h3: g('h3'),
      h3TitleEn: g('h3_title_en'),
      h3TitleAr: g('h3_title'),
      h3IntroEn: i3.text,
      h3IntroAr: g('h3_intro'),
      h3Machine: i3.machine
    });
  }

  // Order books by reading order (min ordinal), order hadith within book by ordinal.
  const bookList = [...books.values()];
  for (const b of bookList) b.hadith.sort((x, y) => x.ordinal - y.ordinal);
  bookList.sort((a, b) => (a.hadith[0]?.ordinal || 0) - (b.hadith[0]?.ordinal || 0));

  // Resolve duplicate slugs (paranoia)
  const seen = new Set();
  for (const b of bookList) {
    let s = b.slug;
    let i = 2;
    while (seen.has(s)) s = b.slug + '-' + i++;
    b.slug = s;
    seen.add(s);
  }

  const outColDir = path.join(OUT_DIR, meta.slug);
  fs.mkdirSync(outColDir, { recursive: true });
  const pubColDir = path.join(PUB_DIR, meta.slug);
  fs.mkdirSync(pubColDir, { recursive: true });

  const refIndex = {};
  const bookSummaries = [];

  for (let bi = 0; bi < bookList.length; bi++) {
    const b = bookList[bi];

    // Group into chapter (h2) groups preserving order.
    const groups = [];
    let cur = null;
    for (const h of b.hadith) {
      const ck = h.h2 == null ? '__none__' + (groups.length ? '' : '') : String(h.h2);
      if (!cur || cur.key !== ck) {
        cur = { key: ck, items: [] };
        groups.push(cur);
      }
      cur.items.push(h);
    }

    // Paginate: keep chapters intact when possible.
    const pages = [];
    let page = [];
    for (const grp of groups) {
      if (page.length && page.length + grp.items.length > PAGE_TARGET) {
        pages.push(page);
        page = [];
      }
      if (grp.items.length <= PAGE_HARD) {
        page.push(...grp.items);
        if (page.length >= PAGE_TARGET) {
          pages.push(page);
          page = [];
        }
      } else {
        // Oversized chapter: hard-split.
        for (let i = 0; i < grp.items.length; i += PAGE_HARD) {
          const slice = grp.items.slice(i, i + PAGE_HARD);
          if (page.length) {
            pages.push(page);
            page = [];
          }
          page = slice;
          if (page.length >= PAGE_TARGET) {
            pages.push(page);
            page = [];
          }
        }
      }
    }
    if (page.length) pages.push(page);

    // Entry stream per page with chapter markers.
    const pageEntries = pages.map((items, pi) => {
      const entries = [];
      let lastH2;
      let lastH3;
      let first = true;
      for (const h of items) {
        if (h.h2 != null && h.h2 !== lastH2) {
          entries.push({
            t: 'ch',
            level: 2,
            n: h.h2,
            en: h.h2TitleEn,
            ar: h.h2TitleAr,
            introEn: h.h2IntroEn,
            introAr: h.h2IntroAr,
            machine: h.h2Machine,
            cont: false
          });
          lastH2 = h.h2;
          lastH3 = undefined;
        } else if (first && h.h2 != null) {
          // page starts mid-chapter
          entries.push({
            t: 'ch', level: 2, n: h.h2, en: h.h2TitleEn, ar: h.h2TitleAr,
            introEn: null, introAr: null, machine: false, cont: true
          });
          lastH2 = h.h2;
        }
        if (h.h3 != null && h.h3 !== lastH3 && (h.h3TitleEn || h.h3TitleAr)) {
          entries.push({
            t: 'ch', level: 3, n: h.h3, en: h.h3TitleEn, ar: h.h3TitleAr,
            introEn: h.h3IntroEn, introAr: h.h3IntroAr, machine: h.h3Machine, cont: false
          });
          lastH3 = h.h3;
        }
        first = false;
        const anchor = anchorOf(h.num, h.ref);
        entries.push({
          t: 'h',
          ref: h.ref,
          num: h.num,
          nic: h.nic,
          anchor,
          titleEn: h.titleEn,
          gradeEn: h.gradeEn,
          gradeAr: h.gradeAr,
          graderEn: h.graderEn,
          gradesRaw: h.gradesRaw,
          chainEn: h.chainEn,
          bodyEn: h.bodyEn,
          mt: h.mt ? 1 : 0,
          footEn: h.footEn,
          chainAr: h.chainAr,
          bodyAr: h.bodyAr,
          footAr: h.footAr,
          tags: h.tags
        });
        if (h.ref) refIndex[h.ref] = [b.slug, pi + 1, anchor];
      }
      return entries;
    });

    const first = b.hadith[0];
    const last = b.hadith[b.hadith.length - 1];
    bookSummaries.push({
      h1: b.h1,
      slug: b.slug,
      ordinal: bi + 1,
      titleEn: b.titleEn,
      titleAr: b.titleAr,
      count: b.hadith.length,
      pages: pageEntries.length,
      firstNum: first ? first.num : null,
      lastNum: last ? last.num : null
    });

    fs.writeFileSync(
      path.join(outColDir, 'book-' + b.slug + '.json'),
      JSON.stringify({
        h1: b.h1,
        slug: b.slug,
        ordinal: bi + 1,
        titleEn: b.titleEn,
        titleAr: b.titleAr,
        introEn: b.introEn,
        introAr: b.introAr,
        count: b.hadith.length,
        pages: pageEntries
      })
    );
  }

  fs.writeFileSync(path.join(pubColDir, 'refindex.json'), JSON.stringify(refIndex));

  const graders = [...colInfo.graders.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]);

  return {
    slug: colInfo.slug,
    category: colInfo.category,
    died: colInfo.died,
    blurb: colInfo.blurb,
    nameEn: colInfo.nameEn,
    nameAr: colInfo.nameAr,
    shortEn: colInfo.shortEn,
    shortAr: colInfo.shortAr,
    author: colInfo.author,
    hadithCount: colInfo.hadithCount,
    englishCount: colInfo.englishCount,
    aiCount: colInfo.aiCount,
    englishPct: colInfo.hadithCount ? Math.round((colInfo.englishCount / colInfo.hadithCount) * 1000) / 10 : 0,
    graders,
    bookCount: bookSummaries.length,
    books: bookSummaries
  };
}

(async () => {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.rmSync(PUB_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PUB_DIR, { recursive: true });

  const collections = [];
  for (const meta of MANIFEST) {
    if (!fs.existsSync(path.join(HADITH_DIR, meta.file))) {
      console.warn('missing TSV, skipping:', meta.file);
      continue;
    }
    process.stdout.write('processing ' + meta.slug + ' ... ');
    const t = Date.now();
    const info = await processCollection(meta);
    collections.push(info);
    console.log(info.hadithCount + ' hadith, ' + info.bookCount + ' books, ' + ((Date.now() - t) / 1000).toFixed(1) + 's');
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify({ collections }, null, 1));
  console.log('done. collections:', collections.length, 'total hadith:', collections.reduce((s, c) => s + c.hadithCount, 0));
})();
