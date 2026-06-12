// Survey hadith TSV files: row counts, doctype distribution, English coverage,
// chapter hierarchy stats. Streaming since files are large.
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const HADITH_DIR = path.join(__dirname, '..', 'hadith');

const isNull = (v) => v === undefined || v === null || v === '' || v === 'null';

async function surveyFile(file) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(HADITH_DIR, file), 'utf8'),
    crlfDelay: Infinity
  });

  let header = null;
  let idx = {};
  const stats = {
    file,
    rows: 0,
    doctypes: {},
    hadith: 0,
    bodyEn: 0,
    machineEn: 0,
    arabicBody: 0,
    h1Set: new Set(),
    h2Set: new Set(),
    h3Set: new Set(),
    grades: {},
    bookNameEn: '',
    bookName: '',
    bookAuthor: '',
    minNum: Infinity,
    maxNum: -Infinity,
    sampleNoEn: []
  };

  for await (const line of rl) {
    if (!header) {
      header = line.split('\t');
      header.forEach((h, i) => (idx[h] = i));
      continue;
    }
    if (!line.trim()) continue;
    const cols = line.split('\t');
    stats.rows++;
    const dt = cols[idx.doctype] || '(none)';
    stats.doctypes[dt] = (stats.doctypes[dt] || 0) + 1;
    if (dt !== 'hadith') continue;
    stats.hadith++;
    if (!stats.bookNameEn) {
      stats.bookNameEn = cols[idx.book_name_en];
      stats.bookName = cols[idx.book_name];
      stats.bookAuthor = cols[idx.book_author];
    }
    const bodyEn = cols[idx.body_en];
    const textEn = cols[idx.text_en];
    const en = !isNull(bodyEn) ? bodyEn : !isNull(textEn) ? textEn : null;
    if (en) {
      stats.bodyEn++;
      if (en.includes('[Machine]')) stats.machineEn++;
    } else if (stats.sampleNoEn.length < 2) {
      stats.sampleNoEn.push(cols[idx.ref]);
    }
    if (!isNull(cols[idx.body]) || !isNull(cols[idx.text])) stats.arabicBody++;
    if (!isNull(cols[idx.h1_id])) stats.h1Set.add(cols[idx.h1_id]);
    if (!isNull(cols[idx.h2_id])) stats.h2Set.add(cols[idx.h2_id]);
    if (!isNull(cols[idx.h3_id])) stats.h3Set.add(cols[idx.h3_id]);
    const grade = cols[idx.grade_grade_en];
    if (!isNull(grade)) stats.grades[grade] = (stats.grades[grade] || 0) + 1;
    const num = parseFloat(cols[idx.num]);
    if (!Number.isNaN(num)) {
      if (num < stats.minNum) stats.minNum = num;
      if (num > stats.maxNum) stats.maxNum = num;
    }
  }

  return {
    file,
    book: stats.bookNameEn,
    author: stats.bookAuthor,
    rows: stats.rows,
    doctypes: stats.doctypes,
    hadith: stats.hadith,
    english: stats.bodyEn,
    englishPct: stats.hadith ? ((stats.bodyEn / stats.hadith) * 100).toFixed(1) : '0',
    machine: stats.machineEn,
    arabic: stats.arabicBody,
    h1: stats.h1Set.size,
    h2: stats.h2Set.size,
    h3: stats.h3Set.size,
    numRange: [stats.minNum, stats.maxNum],
    topGrades: Object.entries(stats.grades).sort((a, b) => b[1] - a[1]).slice(0, 5)
  };
}

(async () => {
  const files = fs.readdirSync(HADITH_DIR).filter((f) => f.endsWith('.tsv'));
  const results = [];
  for (const f of files) {
    const r = await surveyFile(f);
    results.push(r);
    console.log(JSON.stringify(r));
  }
  fs.writeFileSync(path.join(__dirname, 'survey-results.json'), JSON.stringify(results, null, 2));
})();
