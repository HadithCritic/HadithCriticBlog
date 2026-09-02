import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

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

const outDir = path.resolve(rootDir, 'public', 'data', 'narrators');
const chunksDir = path.resolve(outDir, 'chunks');
if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir, { recursive: true });

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

const studentEdges = new Map(); // teacherId -> Map<studentId, count>
const teacherEdges = new Map(); // studentId -> Map<teacherId, count>
const hadithSets = new Map(); // narratorId -> Set<main_id>

function bump(outer, key, inner) {
  let m = outer.get(key);
  if (!m) {
    m = new Map();
    outer.set(key, m);
  }
  m.set(inner, (m.get(inner) || 0) + 1);
}

let chainRowCount = 0;
let prev = null;
for (const row of chainStmt.iterate()) {
  chainRowCount++;

  let set = hadithSets.get(row.narrator_id);
  if (!set) {
    set = new Set();
    hadithSets.set(row.narrator_id, set);
  }
  set.add(row.main_id);

  if (
    prev &&
    prev.main_id === row.main_id &&
    prev.path_idx === row.path_idx &&
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
  const flags = extractFlags(rankHajarAr, rankDhahabiAr, clean(row.madhhab));
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
    students
  };
}

console.log(`[Narrators Build] Assembled ${compactIndex.length} dossiers.`);

// ------------------------------------------------------------------ output

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
