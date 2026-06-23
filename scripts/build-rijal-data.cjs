/*
  Rijal data pipeline: parse Dhahabi's al-Kashif (OpenITI mARkdown) into the
  JSON used by the narrator pages under src/pages/rijal/.

  Al-Kashif covers exactly the transmitters of the six canonical books, which
  matches Silsilah's core collections. Entries are short and formulaic:

    ### $ 38 -
    # NAME, [residence], عن TEACHERS, وعنه STUDENTS, [verdict], مات YEAR. SYMBOLS.

  Outputs:
    src/data/rijal/meta.json            counts + source metadata
    src/data/rijal/chunk-<n>.json       entries in chunks of 400 (build-time reads)
    public/rijal-data/index.json        compact search index for the client

  Run: node scripts/build-rijal-data.cjs
*/

const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/Jonathan/Downloads/0748Dhahabi.Kashif.Shia003276Vols-ara1.mARkdown';
const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'rijal');
const PUB_DIR = path.join(__dirname, '..', 'public', 'rijal-data');
const CHUNK = 400;

/* keep in sync with src/lib/silsilah-text.ts */
const AR_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/g;
function normalizeArabic(s) {
  return s
    .replace(AR_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه');
}

/* collection sigla used by Dhahabi (after Mizzi) */
const KNOWN_SYMBOLS = new Set([
  'خ', 'م', 'د', 'ت', 'س', 'ق', 'ع', '4', 'خت', 'بخ', 'مق', 'تم', 'سي', 'كن',
  'مد', 'قد', 'خد', 'فق', 'عخ', 'ل', 'ص', 'عس', 'ر', 'كد', 'سق'
]);

function cleanLine(line) {
  return line
    .replace(/^#+\s?/, '')
    .replace(/^~~/, '')
    .replace(/PageV\d+P\d+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseEntry(headerLine, bodyLines, ordinal) {
  const text = bodyLines.map(cleanLine).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const numMatch = headerLine.match(/\$+\s+(\d+)/);
  const num = numMatch ? numMatch[1] : null;
  const isStub = /\[=\s*\d+\]/.test(text) || /\*\s*-?\s*$/.test(headerLine.trim());

  // name: up to the first "، عن " (taught-by marker) or first comma group
  let name = text;
  let rest = '';
  const teachIdx = text.search(/،\s*عن\s/);
  if (teachIdx > 0) {
    name = text.slice(0, teachIdx);
    rest = text.slice(teachIdx + 1);
  } else {
    const firstComma = text.indexOf('،');
    if (firstComma > 0 && firstComma < 90) {
      name = text.slice(0, firstComma);
      rest = text.slice(firstComma + 1);
    }
  }
  name = name.trim().replace(/[.،]$/, '');

  // teachers: عن ... وعنه
  let teachers = null;
  let students = null;
  const tMatch = rest.match(/عن\s+([\s\S]*?)(?:،\s*وعنه|$)/);
  if (tMatch) teachers = tMatch[1].trim().replace(/[.،]+$/, '');
  const sMatch = rest.match(/وعنه\s+([\s\S]*?)(?:،\s*(?:مات|توفي)|\.\s*(?:مات|توفي)|$)/);
  if (sMatch) students = sMatch[1].trim().replace(/[.،]+$/, '');

  // death year: first number after مات / توفي / ماتت
  let death = null;
  const dMatch = text.match(/(?:مات|ماتت|توفي|توفيت)[^0-9]{0,18}(\d{1,3})/);
  if (dMatch) death = dMatch[1];

  // sigla: trailing tokens at the very end of the entry
  const symbols = [];
  const tailTokens = text.replace(/[.،]+\s*$/, '').split(/\s+/).slice(-4);
  for (const tok of tailTokens) {
    const t = tok.replace(/[.،]/g, '');
    if (KNOWN_SYMBOLS.has(t)) symbols.push(t);
  }

  return {
    id: ordinal,
    num,
    name,
    nameNorm: normalizeArabic(name),
    teachers,
    students,
    death,
    symbols,
    stub: isStub ? 1 : 0,
    text
  };
}

(async () => {
  const raw = fs.readFileSync(SRC, 'utf8');
  const lines = raw.split(/\r?\n/);

  // skip OpenITI metadata header
  let start = lines.findIndex((l) => l.startsWith('#META#Header#End#'));
  if (start === -1) start = 0;

  const entries = [];
  let header = null;
  let body = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^### \$+/.test(line)) {
      if (header) entries.push(parseEntry(header, body, entries.length + 1));
      header = line;
      body = [];
    } else if (header) {
      if (/^### /.test(line)) {
        // structural heading (letter sections etc.) ends the current entry
        entries.push(parseEntry(header, body, entries.length + 1));
        header = null;
        body = [];
      } else if (line.trim()) {
        body.push(line);
      }
    }
  }
  if (header) entries.push(parseEntry(header, body, entries.length + 1));

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.rmSync(PUB_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PUB_DIR, { recursive: true });

  const chunks = Math.ceil(entries.length / CHUNK);
  for (let c = 0; c < chunks; c++) {
    fs.writeFileSync(
      path.join(OUT_DIR, `chunk-${c}.json`),
      JSON.stringify(entries.slice(c * CHUNK, (c + 1) * CHUNK))
    );
  }

  const withDeath = entries.filter((e) => e.death).length;
  const withSymbols = entries.filter((e) => e.symbols.length).length;
  const stubs = entries.filter((e) => e.stub).length;

  fs.writeFileSync(
    path.join(OUT_DIR, 'meta.json'),
    JSON.stringify({
      source: 'al-Kāshif fī maʿrifat man lahu riwāya fī al-kutub al-sitta',
      author: 'Shams al-Dīn al-Dhahabī (d. 748/1348)',
      basedOn: 'Tahdhīb al-Kamāl of al-Mizzī (d. 742/1341)',
      count: entries.length,
      stubs,
      withDeath,
      withSymbols,
      chunk: CHUNK,
      chunks
    }, null, 1)
  );

  // compact client search index: [id, normalized name, display name, death, symbols, stub]
  const index = entries.map((e) => [e.id, e.nameNorm, e.name, e.death, e.symbols.join(' '), e.stub]);
  fs.writeFileSync(path.join(PUB_DIR, 'index.json'), JSON.stringify(index));

  console.log('entries:', entries.length, '| stubs:', stubs, '| with death year:', withDeath, '| with sigla:', withSymbols);
  console.log('sample:', JSON.stringify(entries[1], null, 1).slice(0, 600));
})();
