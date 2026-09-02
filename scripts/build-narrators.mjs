import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
// Primary CSV path inside HadithCriticBlog/data/
let csvPath = path.resolve(rootDir, 'data', 'all_rawis.csv');
if (!fs.existsSync(csvPath)) {
  csvPath = path.resolve(rootDir, '..', 'all_rawis.csv');
}
if (!fs.existsSync(csvPath)) {
  csvPath = path.resolve(rootDir, 'all_rawis.csv');
}

const outDir = path.resolve(rootDir, 'public', 'data', 'narrators');
const chunksDir = path.resolve(outDir, 'chunks');

if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

console.log(`[Narrators Build] Reading CSV from ${csvPath}...`);

function parseCSV(content) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else if (char === '\n') {
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField);
    lines.push(currentLine);
  }

  return lines;
}

function parseName(rawName) {
  if (!rawName) return { en: '', ar: '' };
  const raw = rawName.trim();
  const arabicRegex = /[\u0600-\u06FF]/;
  const match = raw.match(arabicRegex);

  if (match && match.index !== undefined) {
    const idx = match.index;
    const parenIdx = raw.lastIndexOf('(', idx);
    let en = '';
    let ar = '';

    if (parenIdx !== -1) {
      en = raw.slice(0, parenIdx).trim();
      ar = raw.slice(parenIdx).replace(/^[\s()]+|[\s()]+$/g, '');
    } else {
      en = raw.slice(0, idx).trim();
      ar = raw.slice(idx).replace(/^[\s()]+|[\s()]+$/g, '');
    }
    ar = ar.replace(/[()]/g, '').trim();
    return { en: en || raw, ar };
  }

  return { en: raw, ar: '' };
}

function parseRelations(text) {
  if (!text || text.trim() === '' || text.trim() === 'NA' || text.trim() === 'None') {
    return [];
  }
  const items = [];
  let parts = text.split(' , ').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1 && parts[0].includes(',')) {
    parts = parts[0].split(',').map((p) => p.trim()).filter(Boolean);
  }

  for (const p of parts) {
    if (!p || p.toLowerCase() === 'others' || p.toLowerCase() === 'other') continue;
    const match = p.match(/^(.*?)\s*\[\s*(\d+)\s*\]$/);
    if (match) {
      items.push({ id: parseInt(match[2], 10), name: match[1].trim() });
    } else {
      const cleanName = p.replace(/\[.*?\]/g, '').trim();
      if (cleanName && cleanName.toLowerCase() !== 'others') {
        items.push({ id: null, name: cleanName });
      }
    }
  }
  return items;
}

function parseTags(text) {
  if (!text || text.trim() === '' || text.trim() === 'NA' || text.trim() === 'None') {
    return [];
  }
  const tags = [];
  const parts = text.split(' , ').map((p) => p.trim()).filter(Boolean);
  for (const p of parts) {
    const clean = p.replace(/\[.*?\]/g, '').trim();
    if (clean && clean !== 'NA' && clean !== 'None' && !tags.includes(clean)) {
      tags.push(clean);
    }
  }
  return tags;
}

function simplifyGeneration(grade) {
  const g = (grade || '').toLowerCase();
  if (g.includes('comp') || g.includes('prophet') || g.includes('sahab') || g.includes('1st gen')) {
    return 'Companion (Sahabi)';
  }
  if (g.includes('follower') || g.includes("tabi'")) {
    return "Follower (Tabi'i)";
  }
  if (g.includes('succ') || g.includes("taba'")) {
    return "Successor (Taba' Tabi'i)";
  }
  if (g.includes('3rd century')) {
    return '3rd Century AH';
  }
  if (g.includes('4th century')) {
    return '4th Century AH';
  }
  return 'Other / Later Era';
}

function simplifyGrade(areaOfInterest, rawGrade) {
  const text = `${areaOfInterest || ''} ${rawGrade || ''}`.toLowerCase();
  if (text.includes('thiqah') || text.includes('ثقة') || text.includes('trustworthy')) {
    return 'Thiqah (Trustworthy)';
  }
  if (text.includes('sadooq') || text.includes('صدوق') || text.includes('truthful')) {
    return 'Sadooq (Truthful)';
  }
  if (text.includes('maqbool') || text.includes('مقبول') || text.includes('acceptable')) {
    return 'Maqbool (Acceptable)';
  }
  if (text.includes("da'if") || text.includes('ضعيف') || text.includes('weak')) {
    return "Da'if (Weak)";
  }
  if (text.includes('matrook') || text.includes('abandoned') || text.includes('متروك')) {
    return 'Matrook (Abandoned)';
  }
  if (text.includes('majhool') || text.includes('unknown') || text.includes('مجهول')) {
    return 'Majhool (Unknown)';
  }
  if (text.includes('comp.') || text.includes('sahab') || text.includes('rasool')) {
    return 'Sahabi (Companion)';
  }
  return 'Documented';
}

const fileContent = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(fileContent);

if (rows.length === 0) {
  console.error('No rows found in CSV!');
  process.exit(1);
}

const header = rows[0].map((h) => h.trim());
console.log(`Found header with ${header.length} columns.`);

const headerIndex = {};
header.forEach((h, idx) => {
  headerIndex[h] = idx;
});

const compactIndex = [];
const allDetails = {};
const CHUNK_SIZE = 1000;

const genCounts = {};
const gradeCounts = {};
const placeCounts = {};

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || row.length < 2) continue;

  const getVal = (colName) => {
    const idx = headerIndex[colName];
    return idx !== undefined && row[idx] !== undefined ? row[idx].trim() : '';
  };

  const rawId = getVal('scholar_indx');
  const sid = parseInt(rawId, 10);
  if (isNaN(sid)) continue;

  let nameEn = getVal('name_en');
  let nameAr = getVal('name_ar');
  if (!nameEn && !nameAr) {
    const rawName = getVal('name');
    const parsed = parseName(rawName);
    nameEn = parsed.en;
    nameAr = parsed.ar;
  }
  const rawGrade = getVal('grade');
  const areaOfInterest = getVal('area_of_interest');

  const gen = simplifyGeneration(rawGrade);
  const reliability = simplifyGrade(areaOfInterest, rawGrade);

  const deathH = getVal('death_date_hijri') !== 'NA' ? getVal('death_date_hijri') : '';
  const deathG = getVal('death_date_gregorian') !== 'NA' ? getVal('death_date_gregorian') : '';
  const birthH = getVal('birth_date_hijri') !== 'NA' ? getVal('birth_date_hijri') : '';
  const birthG = getVal('birth_date_gregorian') !== 'NA' ? getVal('birth_date_gregorian') : '';
  const deathPlace = getVal('death_place') !== 'NA' ? getVal('death_place') : '';
  const birthPlace = getVal('birth_place') !== 'NA' ? getVal('birth_place') : '';
  const placesOfStay = getVal('places_of_stay') !== 'NA' ? getVal('places_of_stay') : '';
  const deathReason = getVal('death_reason') !== 'NA' ? getVal('death_reason') : '';

  const teachers = parseRelations(getVal('teachers'));
  const students = parseRelations(getVal('students'));
  const parents = parseRelations(getVal('parents'));
  const spouse = parseRelations(getVal('spouse'));
  const siblings = parseRelations(getVal('siblings'));
  const children = parseRelations(getVal('children'));
  const tags = parseTags(getVal('tags'));

  genCounts[gen] = (genCounts[gen] || 0) + 1;
  gradeCounts[reliability] = (gradeCounts[reliability] || 0) + 1;
  if (deathPlace) {
    placeCounts[deathPlace] = (placeCounts[deathPlace] || 0) + 1;
  }

  // Compact index for instant search & filtering
  compactIndex.push({
    i: sid,
    e: nameEn,
    a: nameAr,
    g: gen,
    r: reliability,
    dh: deathH,
    dg: deathG,
    dp: deathPlace,
    ps: placesOfStay,
    tc: teachers.length,
    sc: students.length,
    t: tags.slice(0, 3)
  });

  allDetails[sid] = {
    id: sid,
    nameEn,
    nameAr,
    rawName: nameEn,
    rawGrade,
    generation: gen,
    grade: reliability,
    parents,
    spouse,
    siblings,
    children,
    birthDatePlace: getVal('birth_date_place'),
    placesOfStay,
    deathDatePlace: getVal('death_date_place'),
    birthPlace,
    deathPlace,
    deathReason,
    birthHijri: birthH,
    birthGregorian: birthG,
    deathHijri: deathH,
    deathGregorian: deathG,
    teachers,
    students,
    areaOfInterest,
    tags,
    books: getVal('books')
  };
}

console.log(`Parsed ${compactIndex.length} transmitters.`);

// Write compact index
const indexFile = path.resolve(outDir, 'index.json');
fs.writeFileSync(indexFile, JSON.stringify(compactIndex));
const indexSizeMB = (fs.statSync(indexFile).size / (1024 * 1024)).toFixed(2);
console.log(`Compact index written: ${indexFile} (${indexSizeMB} MB)`);

// Write biographical detail chunks
const totalKeys = Object.keys(allDetails).length;
const numChunks = Math.ceil(totalKeys / CHUNK_SIZE);

for (let c = 0; c < numChunks; c++) {
  const startId = c * CHUNK_SIZE + 1;
  const endId = (c + 1) * CHUNK_SIZE;
  const chunkObj = {};

  for (let id = startId; id <= endId; id++) {
    if (allDetails[id]) {
      chunkObj[id] = allDetails[id];
    }
  }

  const chunkFile = path.resolve(chunksDir, `chunk_${c}.json`);
  fs.writeFileSync(chunkFile, JSON.stringify(chunkObj));
}

// Write stats
const sortedPlaces = Object.entries(placeCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([place, count]) => ({ place, count }));

const stats = {
  total: compactIndex.length,
  generations: genCounts,
  grades: gradeCounts,
  topPlaces: sortedPlaces
};

const statsFile = path.resolve(outDir, 'stats.json');
fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

console.log(`[Narrators Build] Success! Wrote ${numChunks} chunks and stats to ${outDir}`);
