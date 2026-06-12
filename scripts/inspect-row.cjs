// Print selected rows from a TSV as key: value pairs for inspection.
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const [, , file, ...wantRefs] = process.argv;
const HADITH_DIR = path.join(__dirname, '..', 'hadith');

(async () => {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(HADITH_DIR, file), 'utf8'),
    crlfDelay: Infinity
  });
  let header = null;
  let printed = 0;
  for await (const line of rl) {
    if (!header) {
      header = line.split('\t');
      continue;
    }
    const cols = line.split('\t');
    const ref = cols[header.indexOf('ref')];
    if (wantRefs.length && !wantRefs.includes(ref)) continue;
    console.log('=== ' + ref + ' ===');
    header.forEach((h, i) => {
      let v = cols[i];
      if (v && v.length > 220) v = v.slice(0, 220) + '…';
      if (v !== 'null' && v !== '' && v !== undefined) console.log(h + ': ' + v);
    });
    printed++;
    if (printed >= (wantRefs.length || 3)) break;
  }
})();
