/* Build a compact Quran lookup (verse_id -> {ar, en}) from the source CSV.
   Source CSV is large (~19MB) and stays out of git; this generated JSON is the
   build-time data used by the <QuranVerse /> component.
   Run: node scripts/build-quran-data.cjs
*/
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'data', 'ws_quran_text_rows.csv');
const OUT = path.join(__dirname, '..', 'src', 'data', 'quran-verses.json');

// Parse one CSV line into fields (handles "" escaped quotes inside quoted fields).
function parseLine(line) {
  const fields = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') {
      inQ = true;
    } else if (c === ',') {
      fields.push(cur); cur = '';
    } else cur += c;
  }
  fields.push(cur);
  return fields;
}

// Strip footnote markers Khalifa's text carries (± and trailing * / digits markers).
function cleanEnglish(s) {
  return s
    .replace(/±/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const raw = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n').split('\n');
const header = parseLine(raw[0]);
const iId = header.indexOf('verse_id');
const iEn = header.indexOf('english');
const iAr = header.indexOf('arabic');

const out = {};
let count = 0;
for (let r = 1; r < raw.length; r++) {
  if (!raw[r]) continue;
  const f = parseLine(raw[r]);
  const id = f[iId];
  if (!id || !/^\d+:\d+$/.test(id)) continue;
  out[id] = { ar: (f[iAr] || '').trim(), en: cleanEnglish(f[iEn] || '') };
  count++;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Wrote ${count} verses to ${path.relative(path.join(__dirname, '..'), OUT)} (${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB)`);
