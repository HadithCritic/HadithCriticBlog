import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { asyncBufferFromFile, parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

// Source of record: the Ifta narrator/isnad database. Every narrator carries a
// stable narrator_id that the isnad chains and the Shamela criticism layer both
// key against, so it is the spine for the whole rijal archive.
const DB_CANDIDATES = [
  process.env.IFTA_DB_PATH,
  path.resolve('C:', 'Users', 'Jonathan', 'Desktop', 'silsilah', 'ifta.db'),
  path.resolve(rootDir, '..', 'silsilah', 'ifta.db'),
  path.resolve(rootDir, 'data', 'ifta.db')
].filter(Boolean);

const dbPath = DB_CANDIDATES.find((p) => fs.existsSync(p));
if (!dbPath) {
  console.error('[Narrators Build] Could not locate ifta.db. Looked in:');
  for (const p of DB_CANDIDATES) console.error(`  ${p}`);
  console.error('Set IFTA_DB_PATH to override.');
  process.exit(1);
}

// Criticism layer: the Shamela rijal export. It shares ifta.db's narrator_id
// space (same-id name agreement averages 0.81 Jaccard against 0.11 for a
// shuffled control), so it joins on id behind a name-agreement gate.
const CRITICISM_CANDIDATES = [
  process.env.NARRATOR_CRITICISM_PARQUET,
  path.resolve('C:', 'Users', 'Jonathan', 'Desktop', 'db', '_meta', 'narrators.parquet'),
  path.resolve(rootDir, '..', 'db', '_meta', 'narrators.parquet'),
  path.resolve(rootDir, 'data', 'narrators.parquet')
].filter(Boolean);

const criticismPath = CRITICISM_CANDIDATES.find((p) => fs.existsSync(p));

// Out of `public/` on purpose: nothing serves these any more. The register
// queries /api/narrators and the dossier reads the database directly, so
// shipping 61 MB of JSON to the edge was pure deploy weight. They remain a
// build input for scripts/seed-narrators-d1.mjs. See data/generated/README.md.
const outDir = path.resolve(rootDir, 'data', 'generated', 'narrators');
const chunksDir = path.resolve(outDir, 'chunks');

// Two homes for the criticism. Every narrator's statements go to the build
// input directory, which [id].astro reads to inline them into a dossier page
// but which is never served. Only the narrators without a page also get a
// shard under public/, so the deploy never carries the same statements twice.
const criticismBuildDir = path.resolve(rootDir, 'data', 'generated', 'criticism');
const criticismDir = path.resolve(outDir, 'criticism');
if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir, { recursive: true });
if (!fs.existsSync(criticismDir)) fs.mkdirSync(criticismDir, { recursive: true });
if (!fs.existsSync(criticismBuildDir)) fs.mkdirSync(criticismBuildDir, { recursive: true });

// Shards of this size keep a dossier fetch near 120 KB without putting 15,000
// loose files in the repository.
const CRITICISM_SHARD = 50;

const CHUNK_SIZE = 1000;

// Reviewable fixes layered on top of ifta.db. See data/narrator-corrections.json.
const correctionsPath = path.resolve(rootDir, 'data', 'narrator-corrections.json');
const corrections = fs.existsSync(correctionsPath)
  ? JSON.parse(fs.readFileSync(correctionsPath, 'utf8'))
  : { displayNameEn: {}, placeholderIds: [] };

const nameOverrides = new Map(
  Object.entries(corrections.displayNameEn || {}).map(([id, entry]) => [
    Number(id),
    typeof entry === 'string' ? entry : entry.now
  ])
);

// Ids that stand for a class of unnamed transmitters rather than one person.
// They aggregate many individuals under one id, so they are never published as
// people, but they are still emitted to placeholders.json: an anonymous link in
// an isnad is a defect worth surfacing, and hadith display needs a label.
const placeholderIds = new Set(corrections.placeholderIds || []);

// A qualified anonymous entry ("a man from Banu Damrah", "the wife of Rib'i ibn
// Hirash") points at a single referent, so it stays in the register but is
// flagged rather than presented as a named authority.
// \b is ASCII only in JS and never matches next to Arabic letters, so word ends
// are written as an explicit space-or-end lookahead.
const E = '(?=\\s|$)';
const UNNAMED_PATTERN = new RegExp(
  [
    '^\\s*[\\[(]',
    'لم\\s*(نهتد|نقف|يسم|أقف)',
    'موضع\\s*إبهام',
    `^رجل${E}`,
    `^رجلان${E}`,
    `^امرأة${E}`,
    `^نساء${E}`,
    `^أعرابي${E}`,
    `^قوم${E}`,
    `^ناس${E}`,
    '^رجل\\s',
    '^امرأة\\s',
    '^أحد\\s',
    '^بعض\\s',
    '^مولى\\s',
    '^غير\\s*مسمى'
  ].join('|')
);

// Ibn Hajar's Taqrib grades are a fixed scale, so the reliability facet is
// derived from the Arabic head term rather than the free-text translation.
// Order matters: compound grades are tested before the bare term they contain.
const GRADE_RULES = [
  [
    /صحاب(ي|ية)|له صحبة|لها صحبة|مختلف في صحبته|له رؤية|أم المؤمنين|شهد بدرا|أحد العشرة|الصحابة/,
    'Companion (Sahabi)'
  ],
  [/كذاب|وضاع|يكذب|كذبوه|متهم بالكذب|دجال|يسرق الحديث/, 'Accused of Lying'],
  [/متروك/, 'Matruk (Abandoned)'],
  [/منكر الحديث|ضعيف|فيه ضعف|واه|ساقط|ليس بالقوي|ليس بحجة/, "Da'if (Weak)"],
  [/لين/, 'Layyin (Soft)'],
  [/مستور/, 'Mastur (Concealed)'],
  [/مجهول|لا يعرف|لا تعرف|لم يعرف|لا أعرف/, 'Majhul (Unknown)'],
  [/سيئ الحفظ/, 'Poor Memory'],
  [/صدوق.*(يخطئ|يهم|أوهام|وهم|أخطأ)/, 'Saduq with Errors'],
  [/صدوق/, 'Saduq (Truthful)'],
  [/لا بأس به|ليس به بأس/, "La ba'sa bihi"],
  [/مقبول/, 'Maqbul (Acceptable)'],
  // The lookbehind keeps the negated forms (لم يوثقه, لا يوثق) out of this bucket.
  [/ثقة|حافظ|ثبت|إمام|(?<![يت])وثق/, 'Thiqa (Trustworthy)'],
  [/شيخ|صالح الحديث/, 'Maqbul (Acceptable)']
];

function classifyGrade(rankIbnHajar, rankDhahabi) {
  for (const source of [rankIbnHajar, rankDhahabi]) {
    if (!source) continue;
    for (const [pattern, label] of GRADE_RULES) {
      if (pattern.test(source)) return label;
    }
  }
  return 'Unrated';
}

// Critical secondary attributes. Tadlis and confusion in later life change how a
// chain reads even when the narrator is otherwise graded trustworthy, so they are
// surfaced as their own flags instead of being buried in the grade string.
const FLAG_RULES = [
  [/يدلس|مدلس|تدليس/, 'Mudallis'],
  [/اختلط|مختلط/, 'Confused in Later Life'],
  [/رمي بالتشيع|شيعي|تشيع/, 'Accused of Shiism'],
  [/القدر|قدري/, 'Accused of Qadarism'],
  [/ناصبي|نصب/, 'Accused of Nasibism'],
  [/مرجئ|إرجاء/, 'Accused of Irja'],
  [/خارجي|خوارج/, 'Accused of Kharijism'],
  [/يرسل|مرسل/, 'Sends Mursal Reports'],
  [/عابد|فاضل|صالح/, 'Noted for Piety']
];

function extractFlags(...sources) {
  const text = sources.filter(Boolean).join(' ');
  const flags = [];
  for (const [pattern, label] of FLAG_RULES) {
    if (pattern.test(text) && !flags.includes(label)) flags.push(label);
  }
  return flags;
}

const TABAQA_ORDINALS = [
  [/الأولى|الاولى/, 1],
  [/الثانية عشر/, 12],
  [/الحادية عشر/, 11],
  [/الثانية/, 2],
  [/الثالثة/, 3],
  [/الرابعة/, 4],
  [/الخامسة/, 5],
  [/السادسة/, 6],
  [/السابعة/, 7],
  [/الثامنة/, 8],
  [/التاسعة/, 9],
  [/العاشرة/, 10]
];

// Ibn Hajar's twelve tabaqat, collapsed into the four cohorts the explorer filters on.
function tabaqaToNumber(tabaqa) {
  if (!tabaqa) return null;
  if (/صحاب(ي|ية)|صحبة/.test(tabaqa)) return 1;
  for (const [pattern, n] of TABAQA_ORDINALS) {
    if (pattern.test(tabaqa)) return n;
  }
  return null;
}

function tabaqaToGeneration(n) {
  if (n === null) return 'Unclassified';
  if (n === 1) return 'Companion (Sahabi)';
  if (n <= 6) return "Follower (Tabi'i)";
  if (n <= 9) return "Successor (Taba' Tabi'i)";
  return 'Later (3rd Century AH onward)';
}

// A lunar year is roughly 0.970224 solar years. This is an approximation used only
// for orientation alongside the authoritative Hijri figure, never on its own.
function hijriToGregorian(ah) {
  if (ah === null || ah === undefined || Number.isNaN(ah)) return '';
  return String(Math.round(622 + ah * 0.970224));
}

// Place fields are comma separated, and the separator is the Arabic comma when the
// field was never translated. Kept per script: mixing them in one journey path makes
// the same city appear twice (Rayy and الري) because only some columns are translated.
function splitPlaces(...fields) {
  const parts = fields
    .filter(Boolean)
    .join(',')
    .split(/[,،؛]/)
    .map((p) => p.replace(/^\s*و\s*/, '').trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

// ------------------------------------------------- criticism classification

// Polarity of a single jarh/ta'dil statement. Deliberately conservative: a
// statement is only labelled when an unambiguous formula is present, and the
// rest stay unclassified rather than being guessed at. Roughly 43 percent are
// narrative notes with no verdict formula and land in that bucket.
const AT_END = '(?=\\s|$|[.,،:؛])';

// Negations that are actually praise. "ليس به بأس" is a standard ta'dil formula,
// so it has to be taken out before the generic negation rule sees it.
const NEG_IS_PRAISE = /ليس[ت]?\s+ب[هها]\s+بأس|ليس\s+بالمتروك|ليس\s+بمتروك/g;

// A praise word inside a negation is jarh, not praise, so these are stripped
// before the ta'dil vocabulary runs. Otherwise "ليس بثقة" reads as trustworthy.
const NEG_OF_PRAISE =
  /ليس[ت]?\s+ب(ال)?(ثقة|حجة|قوي|القوي|ذاك|شيء|متقن|مأمون|صدوق|ثبت)|غير\s+ثقة|لم\s+يكن\s+ثقة|لا\s+يحتج|لا\s+يكتب\s+حديثه|لا\s+يساوي/g;

const JARH_TERMS =
  /ضعيف|ضعفه|متروك|تركوه|تركه|كذاب|يكذب|وضاع|يضع\s+الحديث|منكر\s+الحديث|مناكير|مجهول|لين\s+الحديث|واه|سيئ\s+الحفظ|سكتوا\s+عنه|فيه\s+نظر|يسرق\s+الحديث|اتهم|متهم|يهم|أوهام|مضطرب|ذاهب\s+الحديث|رديء/;

const TADIL_TERMS = new RegExp(
  `ثقة|ثقات|صدوق|حجة|ثبت|مأمون|وثق${AT_END}|وثقه|وثقوه|لا\\s+بأس\\s+به|ما\\s+به\\s+بأس|متقن|صالح\\s+الحديث|مستقيم\\s+الحديث`
);

function classifyStatement(text) {
  if (!text) return 'unclassified';
  let rest = text;
  let praise = false;
  let blame = false;

  if (NEG_IS_PRAISE.test(rest)) {
    praise = true;
    rest = rest.replace(NEG_IS_PRAISE, ' ');
  }
  NEG_IS_PRAISE.lastIndex = 0;

  if (NEG_OF_PRAISE.test(rest)) {
    blame = true;
    rest = rest.replace(NEG_OF_PRAISE, ' ');
  }
  NEG_OF_PRAISE.lastIndex = 0;

  if (JARH_TERMS.test(rest)) blame = true;
  if (TADIL_TERMS.test(rest)) praise = true;

  if (blame && praise) return 'mixed';
  if (blame) return 'jarh';
  if (praise) return 'tadil';
  return 'unclassified';
}

// The fwaed layer is keyed by phenomenon rather than by critic. Tadlis, irsal
// and idrak decide whether a chain is even possible, so they surface as flags.
const PHENOMENON_LABELS = new Map([
  ['الإرسال', 'Irsal (Mursal Transmission)'],
  ['التدليس', 'Tadlis'],
  ['الاختلاط', 'Ikhtilat (Confusion in Later Life)'],
  ['الإدراك', 'Idrak (Contemporaneity)'],
  ['إثبات سماع الراوي', 'Audition Established'],
  ['الاختلاف في سماع الراوي', 'Audition Disputed'],
  ['التوثيق الضمني', 'Implicit Authentication'],
  ['التضعيف الضمني', 'Implicit Weakening'],
  ['التوثيق الاستثنائي', 'Exceptional Authentication'],
  ['التضعيف الاستثنائي', 'Exceptional Weakening'],
  ['المفاضلة بين الرواة', 'Comparative Ranking'],
  ['المفاضلة بين الرواة في راو', 'Comparative Ranking (Shared Teacher)'],
  ['المفاضلة بين الرواة في بلد', 'Comparative Ranking (Regional)']
]);

// Phenomena that describe a defect in the chain, promoted onto the index so the
// explorer can filter for them.
const PHENOMENON_FLAGS = new Map([
  // Same label as the rank-derived flag, so the two sources merge into one
  // count instead of showing Tadlis and Mudallis as separate things.
  ['التدليس', 'Mudallis'],
  ['الاختلاط', 'Confused in Later Life'],
  ['الإرسال', 'Sends Mursal Reports'],
  ['الاختلاف في سماع الراوي', 'Audition Disputed']
]);

function nameTokens(...values) {
  const joined = values.filter(Boolean).join(' ');
  const normalised = joined
    .replace(/[ً-ْٰـ‌-‏]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^ء-ي ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return new Set(normalised.split(' ').filter((t) => t && t !== 'بن' && t !== 'ابن'));
}

// Containment, not Jaccard. The id already asserts the link, so this gate only
// has to catch the cases where the two sources name different people. Jaccard
// punishes a name that is merely shorter on one side, and the sources routinely
// differ that way ("حرب بن قيس" against "حرب بن قيس المدني مولى يحيى بن طلحة"),
// which threw out several hundred correct matches including identical names.
function containment(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared / Math.min(a.size, b.size);
}

function clean(value) {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  if (!s || s === 'None' || s === 'NA') return '';
  // The source pads punctuation with spaces and leaves stray trailing separators.
  return s.replace(/\s+/g, ' ').replace(/\s+([،,.])/g, '$1').replace(/[،,.\s]+$/, '').trim();
}

console.log(`[Narrators Build] Reading ${dbPath}`);
const db = new DatabaseSync(dbPath, { readOnly: true });

// ---------------------------------------------------------------- narrators

const narratorRows = db
  .prepare(
    `SELECT narrator_id, display_name, display_name_en, full_name, kunya, nickname,
            lineage, relation, tabaqa, tabaqa_en, madhhab, madhhab_en,
            rank_ibn_hajar, rank_ibn_hajar_en, rank_dhahabi, rank_dhahabi_en,
            birth_place, birth_place_en, residence, residence_en,
            travel_place, travel_place_en, death_place, death_place_en,
            birth_date, death_date, death_ah_min, death_ah_max
       FROM narrators
      ORDER BY narrator_id`
  )
  .all();

console.log(`[Narrators Build] ${narratorRows.length} narrators loaded.`);

// ------------------------------------------------- isnad adjacency + volume

// Position 0 of a chain sits at the Companion end and the highest position sits
// with the compiler: mean death year climbs from ~84 AH at pos 0-1 to ~358 AH at
// pos 6+. So the narrator at pos-1 is the teacher and the one at pos+1 the student.
console.log('[Narrators Build] Walking isnad chains...');

const chainStmt = db.prepare(
  `SELECT main_id, path_idx, pos, narrator_id
     FROM chain
    WHERE narrator_id > 0
    ORDER BY main_id, path_idx, pos`
);

// Which collection each hadith belongs to, so the same pass can answer "where
// in the corpus does this narrator actually appear". Joining chain to hadith in
// SQL instead costs about 45 seconds; this map costs a few hundred milliseconds.
const bookTitles = new Map();
for (const b of db.prepare('SELECT book_id, title, title_en FROM books').all()) {
  bookTitles.set(b.book_id, clean(b.title_en) || clean(b.title));
}
const bookOfHadith = new Map();
const numberOfHadith = new Map();
for (const h of db.prepare('SELECT main_id, book_id, hadith_num FROM hadith').all()) {
  bookOfHadith.set(h.main_id, h.book_id);
  numberOfHadith.set(h.main_id, clean(h.hadith_num));
}

const studentEdges = new Map(); // teacherId -> Map<studentId, count>
const teacherEdges = new Map(); // studentId -> Map<teacherId, count>
const hadithSets = new Map(); // narratorId -> Set<main_id>
const bookCounts = new Map(); // narratorId -> Map<bookId, Set<main_id>>
const positionCounts = new Map(); // narratorId -> Map<pos, count>
const sampleChains = new Map(); // narratorId -> up to SAMPLE_CHAINS paths

// Enough to show how a narrator actually sits in a chain without inflating the
// payload. Paths are stored as ids and resolved against the index in the client.
const SAMPLE_CHAINS = 3;

function bump(outer, key, inner) {
  let m = outer.get(key);
  if (!m) {
    m = new Map();
    outer.set(key, m);
  }
  m.set(inner, (m.get(inner) || 0) + 1);
}

// Flush one completed transmission path: record a sample of it for each
// narrator on it that does not have enough samples yet.
function recordPath(mainId, path) {
  if (path.length < 2) return;
  const bookId = bookOfHadith.get(mainId);
  for (const id of path) {
    if (placeholderIds.has(id)) continue;
    const held = sampleChains.get(id);
    if (held && held.length >= SAMPLE_CHAINS) continue;
    const entry = {
      book: bookTitles.get(bookId) || '',
      number: numberOfHadith.get(mainId) || '',
      path: [...path]
    };
    if (held) held.push(entry);
    else sampleChains.set(id, [entry]);
  }
}

let chainRowCount = 0;
let prev = null;
let currentPath = [];
for (const row of chainStmt.iterate()) {
  chainRowCount++;

  let set = hadithSets.get(row.narrator_id);
  if (!set) {
    set = new Set();
    hadithSets.set(row.narrator_id, set);
  }
  set.add(row.main_id);

  const bookId = bookOfHadith.get(row.main_id);
  if (bookId !== undefined) {
    let byBook = bookCounts.get(row.narrator_id);
    if (!byBook) {
      byBook = new Map();
      bookCounts.set(row.narrator_id, byBook);
    }
    let seen = byBook.get(bookId);
    if (!seen) {
      seen = new Set();
      byBook.set(bookId, seen);
    }
    seen.add(row.main_id);
  }

  bump(positionCounts, row.narrator_id, Math.min(row.pos, 12));

  const samePath =
    prev && prev.main_id === row.main_id && prev.path_idx === row.path_idx;
  if (!samePath) {
    if (prev) recordPath(prev.main_id, currentPath);
    currentPath = [];
  }
  currentPath.push(row.narrator_id);

  if (
    samePath &&
    prev.pos === row.pos - 1 &&
    // An edge to "a man" names no teacher, so placeholders are left out of the
    // transmission network even though their hadith are still counted above.
    !placeholderIds.has(prev.narrator_id) &&
    !placeholderIds.has(row.narrator_id)
  ) {
    bump(studentEdges, prev.narrator_id, row.narrator_id);
    bump(teacherEdges, row.narrator_id, prev.narrator_id);
  }
  prev = row;
}
if (prev) recordPath(prev.main_id, currentPath);
console.log(`[Narrators Build] ${chainRowCount.toLocaleString()} chain positions walked.`);

// ----------------------------------------------------------------- aliases

// 103,289 distinct surface forms collapse onto these ids, which is what makes
// "Ibn Shihab" and "al-Zuhri" resolve to one person.
console.log('[Narrators Build] Collecting alias surface forms...');
const aliasRows = db
  .prepare(
    `SELECT narrator_id, surface, COUNT(*) AS n
       FROM mention
      WHERE narrator_id > 0
      GROUP BY narrator_id, surface`
  )
  .all();

const aliasMap = new Map();
for (const row of aliasRows) {
  const surface = clean(row.surface);
  if (!surface) continue;
  let list = aliasMap.get(row.narrator_id);
  if (!list) {
    list = [];
    aliasMap.set(row.narrator_id, list);
  }
  list.push({ form: surface, count: row.n });
}
for (const list of aliasMap.values()) list.sort((a, b) => b.count - a.count);

// ---------------------------------------------------------- criticism merge

// Minimum name containment between the two sources for the same id. At 0.5,
// 9 of 18,926 shared ids are rejected, and each of those is a genuine
// disagreement about who the person is rather than a difference in how fully
// the name is written out.
const NAME_GATE = 0.5;

const criticismById = new Map();
let criticismRejected = 0;
let criticismStatements = 0;

if (!criticismPath) {
  console.warn('[Narrators Build] narrators.parquet not found, skipping criticism layer.');
  for (const p of CRITICISM_CANDIDATES) console.warn(`  looked in ${p}`);
} else {
  console.log(`[Narrators Build] Merging criticism from ${criticismPath}`);
  const buffer = await asyncBufferFromFile(criticismPath);
  const critRows = await parquetReadObjects({ file: buffer, compressors });

  const iftaNames = new Map();
  for (const row of narratorRows) {
    iftaNames.set(row.narrator_id, nameTokens(row.display_name, row.full_name));
  }

  for (const row of critRows) {
    const id = Number(row.id);
    if (placeholderIds.has(id)) continue;
    const target = iftaNames.get(id);
    if (!target) continue;

    // Guard the id join: an id that carries a different person's name in the
    // two sources must not have someone else's criticism attached to it.
    if (containment(target, nameTokens(row.short_name, row.long_name)) < NAME_GATE) {
      criticismRejected++;
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(row.criticism_text || '{}');
    } catch {
      continue;
    }

    const critics = [];
    for (const [critic, quotes] of parsed.garh || []) {
      const statements = (quotes || []).map(([text, citation, pageId]) => ({
        text: clean(text),
        citation: clean(citation),
        pageId: pageId ?? null,
        verdict: classifyStatement(text || '')
      }));
      if (statements.length > 0) critics.push({ critic: clean(critic), statements });
    }

    const phenomena = [];
    for (const [key, quotes] of parsed.fwaed || []) {
      const statements = (quotes || []).map(([text, citation, pageId]) => ({
        text: clean(text),
        citation: clean(citation),
        pageId: pageId ?? null
      }));
      if (statements.length === 0) continue;
      phenomena.push({
        key: clean(key),
        label: PHENOMENON_LABELS.get(clean(key)) || clean(key),
        statements
      });
    }

    const tally = { jarh: 0, tadil: 0, mixed: 0, unclassified: 0 };
    for (const c of critics) for (const s of c.statements) tally[s.verdict]++;
    const total = critics.reduce((n, c) => n + c.statements.length, 0);
    criticismStatements += total;

    if (total === 0 && phenomena.length === 0) continue;

    criticismById.set(id, {
      id,
      criticCount: critics.length,
      statementCount: total,
      tally,
      critics,
      phenomena,
      flags: [
        ...new Set(
          phenomena.map((p) => PHENOMENON_FLAGS.get(p.key)).filter(Boolean)
        )
      ]
    });
  }
  console.log(
    `[Narrators Build] criticism matched ${criticismById.size} narrators, ${criticismStatements.toLocaleString()} statements, ${criticismRejected} rejected by the name gate.`
  );
}

// ------------------------------------------------------------------- build

const MAX_RELATIONS = 40;
const MAX_ALIASES = 25;

function displayNameEnFor(row) {
  return nameOverrides.get(row.narrator_id) || clean(row.display_name_en);
}

const nameById = new Map();
for (const row of narratorRows) {
  if (placeholderIds.has(row.narrator_id)) continue;
  nameById.set(row.narrator_id, displayNameEnFor(row) || clean(row.display_name));
}

function relationList(edges, id) {
  const m = edges.get(id);
  if (!m) return [];
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_RELATIONS)
    .map(([otherId, count]) => ({ id: otherId, name: nameById.get(otherId) || `#${otherId}`, count }))
    .filter((r) => r.name);
}

const compactIndex = [];
const allDetails = {};
const genCounts = {};
const gradeCounts = {};
const placeCounts = {};
const flagCounts = {};
const tabaqaCounts = {};

const placeholders = [];

for (const row of narratorRows) {
  const id = row.narrator_id;
  const nameEn = displayNameEnFor(row);
  const nameAr = clean(row.display_name);
  if (!nameEn && !nameAr) continue;

  if (placeholderIds.has(id)) {
    placeholders.push({
      id,
      nameEn,
      nameAr,
      hadithCount: hadithSets.get(id)?.size ?? 0,
      aliasCount: (aliasMap.get(id) || []).length
    });
    continue;
  }

  // Qualified anonymous entries stay, but are marked so a chain that runs
  // through one is not read as though it named an authority.
  const isUnnamed = UNNAMED_PATTERN.test(nameAr);

  const rankHajarAr = clean(row.rank_ibn_hajar);
  const rankHajarEn = clean(row.rank_ibn_hajar_en);
  const rankDhahabiAr = clean(row.rank_dhahabi);
  const rankDhahabiEn = clean(row.rank_dhahabi_en);

  const grade = classifyGrade(rankHajarAr, rankDhahabiAr);
  const tabaqaAr = clean(row.tabaqa);
  const tabaqaNum = tabaqaToNumber(tabaqaAr);
  const generation = tabaqaToGeneration(tabaqaNum);
  const criticism = criticismById.get(id) || null;

  const flags = extractFlags(rankHajarAr, rankDhahabiAr, clean(row.madhhab));
  // Phenomena evidenced by an actual cited statement outrank a keyword read off
  // the grade string, so they are merged in rather than duplicated.
  for (const f of criticism?.flags || []) if (!flags.includes(f)) flags.push(f);
  if (isUnnamed) flags.unshift('Unnamed in Isnad');

  const deathAhMin = row.death_ah_min ?? null;
  const deathAhMax = row.death_ah_max ?? null;
  const deathHijri = deathAhMin === null ? '' : String(deathAhMin);
  const deathGregorian = hijriToGregorian(deathAhMin);

  const deathPlace = clean(row.death_place_en) || clean(row.death_place);
  const residence = clean(row.residence_en) || clean(row.residence);

  // One journey path per script, so a partly translated record does not list the
  // same city twice. The English path wins when it has anything in it.
  const placesEn = splitPlaces(
    clean(row.residence_en),
    clean(row.travel_place_en),
    clean(row.death_place_en)
  );
  const placesAr = splitPlaces(
    clean(row.residence),
    clean(row.travel_place),
    clean(row.death_place)
  );

  const teachers = relationList(teacherEdges, id);
  const students = relationList(studentEdges, id);

  // Where in the corpus this narrator actually appears, and where in a chain
  // they tend to sit. Position 0 is the Companion end.
  const books = [...(bookCounts.get(id) || new Map())]
    .map(([bookId, seen]) => ({ book: bookTitles.get(bookId) || '', count: seen.size }))
    .filter((b) => b.book)
    .sort((a, b) => b.count - a.count);

  const positions = [...(positionCounts.get(id) || new Map())]
    .sort((a, b) => a[0] - b[0])
    .map(([pos, count]) => ({ pos, count }));
  const aliases = (aliasMap.get(id) || []).slice(0, MAX_ALIASES);
  const hadithCount = hadithSets.get(id)?.size ?? 0;

  genCounts[generation] = (genCounts[generation] || 0) + 1;
  gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  if (deathPlace) placeCounts[deathPlace] = (placeCounts[deathPlace] || 0) + 1;
  for (const f of flags) flagCounts[f] = (flagCounts[f] || 0) + 1;
  if (tabaqaNum !== null) tabaqaCounts[tabaqaNum] = (tabaqaCounts[tabaqaNum] || 0) + 1;

  // Compact index drives instant search, filtering and sorting in the explorer.
  compactIndex.push({
    i: id,
    e: nameEn,
    a: nameAr,
    g: generation,
    r: grade,
    dh: deathHijri,
    dg: deathGregorian,
    dp: deathPlace,
    ps: residence,
    tc: teachers.length,
    sc: students.length,
    hc: hadithCount,
    tb: tabaqaNum,
    cs: criticism?.statementCount ?? 0,
    cc: criticism?.criticCount ?? 0,
    cj: criticism?.tally.jarh ?? 0,
    ct: criticism?.tally.tadil ?? 0,
    t: flags.slice(0, 3)
  });

  allDetails[id] = {
    id,
    nameEn,
    nameAr,
    fullName: clean(row.full_name),
    kunya: clean(row.kunya),
    nickname: clean(row.nickname),
    lineage: clean(row.lineage),
    relation: clean(row.relation),
    generation,
    grade,
    tabaqa: tabaqaAr,
    tabaqaEn: clean(row.tabaqa_en),
    tabaqaNumber: tabaqaNum,
    rankIbnHajar: rankHajarAr,
    rankIbnHajarEn: rankHajarEn,
    rankDhahabi: rankDhahabiAr,
    rankDhahabiEn: rankDhahabiEn,
    madhhab: clean(row.madhhab),
    madhhabEn: clean(row.madhhab_en),
    flags,
    unnamed: isUnnamed,
    birthPlace: clean(row.birth_place_en) || clean(row.birth_place),
    residence,
    travelPlace: clean(row.travel_place_en) || clean(row.travel_place),
    deathPlace,
    placesEn,
    placesAr,
    birthDate: clean(row.birth_date),
    // Kept verbatim: the source preserves the disagreement between authorities
    // over the death year, which is itself evidence.
    deathDate: clean(row.death_date),
    deathAhMin,
    deathAhMax,
    deathHijri,
    deathGregorian,
    hadithCount,
    aliasCount: (aliasMap.get(id) || []).length,
    aliases,
    teachers,
    students,
    books,
    positions,
    sampleChains: sampleChains.get(id) || [],
    // Summary only. The statements themselves live in the criticism shards,
    // which are fetched when a dossier is opened.
    criticism: criticism
      ? {
          criticCount: criticism.criticCount,
          statementCount: criticism.statementCount,
          tally: criticism.tally,
          phenomena: criticism.phenomena.map((p) => ({
            label: p.label,
            count: p.statements.length
          })),
          shard: Math.floor(id / CRITICISM_SHARD)
        }
      : null
  };
}

console.log(`[Narrators Build] Assembled ${compactIndex.length} dossiers.`);

// ------------------------------------------------------------------ output

// Cloudflare Workers static assets cap a deployment at 20,000 files, and each
// dossier costs two of them: the page, and the Pagefind fragment that makes its
// criticism searchable. With about 1,450 files for the rest of the site that
// leaves room for roughly 9,200 dossiers, so the budget is set below that to
// leave the site somewhere to grow. The cut is shallow either way: at this
// budget no excluded narrator has more than 13 hadith or 7 recorded statements.
// Pages go to the narrators research actually reaches for, those with recorded
// criticism first, ordered by how much was said about them, then the prolific
// transmitters. The explorer covers all 20,950 client side regardless.
const PAGE_BUDGET = Number(process.env.NARRATOR_PAGE_LIMIT || 8000);

// Two rankings, taken in turn. Ranking on criticism alone drops the prolific
// transmitters who were never argued about, which cut compilers held in this
// very corpus: Abu Ya'la al-Mawsili, 11,184 hadith, and al-Diya' al-Maqdisi,
// 4,944, both fell outside the budget behind narrators with two statements
// against them. Alternating guarantees the top of both lists gets a page.
const byCriticism = compactIndex
  .filter((n) => n.cs > 0)
  .sort((a, b) => b.cs - a.cs || b.hc - a.hc || a.i - b.i);
const byVolume = compactIndex
  .filter((n) => n.hc > 0)
  .sort((a, b) => b.hc - a.hc || b.cs - a.cs || a.i - b.i);

const prerenderIds = [];
const chosen = new Set();
for (let i = 0; prerenderIds.length < PAGE_BUDGET; i++) {
  if (i >= byCriticism.length && i >= byVolume.length) break;
  for (const list of [byCriticism, byVolume]) {
    const candidate = list[i];
    if (!candidate || chosen.has(candidate.i)) continue;
    chosen.add(candidate.i);
    prerenderIds.push(candidate.i);
    if (prerenderIds.length >= PAGE_BUDGET) break;
  }
}

const prerenderSet = chosen;
for (const item of compactIndex) {
  // Lets the explorer link to a dossier page only where one was generated.
  if (prerenderSet.has(item.i)) item.p = 1;
}

fs.writeFileSync(
  path.resolve(outDir, 'prerendered.json'),
  JSON.stringify(prerenderIds)
);
console.log(
  `[Narrators Build] ${prerenderIds.length.toLocaleString()} narrators marked for a static page.`
);

const indexFile = path.resolve(outDir, 'index.json');
fs.writeFileSync(indexFile, JSON.stringify(compactIndex));
console.log(
  `[Narrators Build] index.json (${(fs.statSync(indexFile).size / 1048576).toFixed(2)} MB)`
);

for (const stale of fs.readdirSync(chunksDir)) {
  if (stale.startsWith('chunk_') && stale.endsWith('.json')) {
    fs.unlinkSync(path.resolve(chunksDir, stale));
  }
}

const maxId = Math.max(...Object.keys(allDetails).map(Number));
const numChunks = Math.floor((maxId - 1) / CHUNK_SIZE) + 1;
for (let c = 0; c < numChunks; c++) {
  const chunkObj = {};
  const startId = c * CHUNK_SIZE + 1;
  for (let id = startId; id < startId + CHUNK_SIZE; id++) {
    if (allDetails[id]) chunkObj[id] = allDetails[id];
  }
  fs.writeFileSync(path.resolve(chunksDir, `chunk_${c}.json`), JSON.stringify(chunkObj));
}

const topPlaces = Object.entries(placeCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([place, count]) => ({ place, count }));

// Criticism shards, fetched on demand when a dossier opens.
for (const stale of fs.readdirSync(criticismDir)) {
  if (stale.endsWith('.json')) fs.unlinkSync(path.resolve(criticismDir, stale));
}
// Narrators with a static page carry their statements in that page's HTML,
// which is also what makes the criticism searchable. Shipping the shard for
// them as well would deploy the same 54 MB twice, so shards are emitted only
// for the narrators the explorer cannot hand off to a page.
const shards = new Map();
const buildShards = new Map();
let shardedNarrators = 0;
for (const [id, entry] of criticismById) {
  const shard = Math.floor(id / CRITICISM_SHARD);
  if (!buildShards.has(shard)) buildShards.set(shard, {});
  buildShards.get(shard)[id] = entry;

  if (prerenderSet.has(id)) continue;
  shardedNarrators++;
  if (!shards.has(shard)) shards.set(shard, {});
  shards.get(shard)[id] = entry;
}
for (const stale of fs.readdirSync(criticismBuildDir)) {
  if (stale.endsWith('.json')) fs.unlinkSync(path.resolve(criticismBuildDir, stale));
}
for (const [shard, payload] of buildShards) {
  fs.writeFileSync(path.resolve(criticismBuildDir, `${shard}.json`), JSON.stringify(payload));
}
for (const [shard, payload] of shards) {
  fs.writeFileSync(path.resolve(criticismDir, `${shard}.json`), JSON.stringify(payload));
}
console.log(
  `[Narrators Build] Wrote ${shards.size} criticism shards covering ${shardedNarrators.toLocaleString()} narrators without a page.`
);

// Anonymous classes are published separately so hadith display can label them,
// without letting them into any narrator count.
fs.writeFileSync(
  path.resolve(outDir, 'placeholders.json'),
  JSON.stringify(placeholders, null, 2)
);

const stats = {
  total: compactIndex.length,
  source: 'ifta.db',
  corrections: {
    renamed: nameOverrides.size,
    placeholdersExcluded: placeholders.length,
    placeholderHadith: placeholders.reduce((sum, p) => sum + p.hadithCount, 0),
    unnamedFlagged: compactIndex.filter((n) => n.t.includes('Unnamed in Isnad')).length
  },
  generations: genCounts,
  grades: gradeCounts,
  tabaqat: tabaqaCounts,
  flags: flagCounts,
  topPlaces,
  criticism: {
    narratorsWithCriticism: criticismById.size,
    statements: criticismStatements,
    rejectedByNameGate: criticismRejected,
    nameGate: NAME_GATE,
    verdicts: [...criticismById.values()].reduce(
      (acc, c) => {
        for (const k of Object.keys(acc)) acc[k] += c.tally[k];
        return acc;
      },
      { jarh: 0, tadil: 0, mixed: 0, unclassified: 0 }
    )
  },
  withVerdict: compactIndex.filter((n) => n.r !== 'Unrated').length,
  withDatedDeath: compactIndex.filter((n) => n.dh).length,
  inIsnadChains: compactIndex.filter((n) => n.hc > 0).length
};

fs.writeFileSync(path.resolve(outDir, 'stats.json'), JSON.stringify(stats, null, 2));

db.close();

console.log(`[Narrators Build] Wrote ${numChunks} chunks and stats to ${outDir}`);
console.log(
  `[Narrators Build] verdicts ${stats.withVerdict} | dated deaths ${stats.withDatedDeath} | in chains ${stats.inIsnadChains}`
);
