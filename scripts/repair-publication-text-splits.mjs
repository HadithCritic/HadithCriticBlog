import fs from 'node:fs';
const fixes = [
  ['birr-al-walidayn','18',"'"], ['birr-al-walidayn','27','"'],
  ['birr-al-walidayn','32','"'], ['birr-al-walidayn','55','('],
  ['birr-al-walidayn','74','seek'], ['musnad-khalifa-ibn-khayyat','45-1','"'],
];
for (const slug of [...new Set(fixes.map(f => f[0]))]) {
  const path = `src/data/hadith-pages/${slug}/publication-source.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const [, id, moved] of fixes.filter(f => f[0] === slug)) {
    const r = data.records.find(item => item.id === id);
    if (!r || !r.display_isnad_en.endsWith(moved)) throw Error(`Unexpected split in ${slug} ${id}`);
    r.display_isnad_en = r.display_isnad_en.slice(0, -moved.length).trimEnd();
    r.display_matn_en = moved + r.display_matn_en;
    if (typeof r.enEnd === 'number') r.enEnd -= moved.length;
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}
console.log(`Corrected ${fixes.length} text split boundaries.`);
