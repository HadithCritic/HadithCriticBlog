import fs from 'node:fs';
const path = 'src/data/hadith/pages/musnad-sad-ibn-abi-waqqas/publication-source.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
for (const [id, nextId, label] of [['44-1','45-1','Second transmission preface'], ['92-1','93-1','Third transmission preface']]) {
  const record = data.records.find(r => r.id === id);
  const next = data.records.find(r => r.id === nextId);
  const enMarker = `*${label}:*`;
  const arMarker = 'أَخْبَرَنَا الشَّيْخَانِ:';
  const enAt = record?.en.indexOf(enMarker) ?? -1;
  const arAt = record?.ar.indexOf(arMarker) ?? -1;
  if (!record || !next || enAt < 0 || arAt < 0 || next.preceding_source_material) throw Error(`Unexpected preface boundaries for ${id}`);
  const en = record.en.slice(enAt + enMarker.length).trim();
  const ar = record.ar.slice(arAt).trim();
  next.preceding_source_material = { type: 'transmission_preface', title_en: label, text_en: en, text_ar: ar, page_breaks: record.source_page_breaks || [] };
  record.en = record.en.slice(0, enAt).trimEnd();
  record.ar = record.ar.slice(0, arAt).trimEnd();
  for (const key of ['display_text_en', 'display_matn_en']) {
    const at = record[key].indexOf(enMarker);
    if (at < 0) throw Error(`Missing ${key} preface in ${id}`);
    record[key] = record[key].slice(0, at).trimEnd();
  }
  for (const key of ['display_text_ar', 'display_matn_ar']) {
    const at = record[key].indexOf(arMarker);
    if (at < 0) throw Error(`Missing ${key} preface in ${id}`);
    record[key] = record[key].slice(0, at).trimEnd();
  }
  delete record.source_page_breaks;
}
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Separated two transmission prefaces and preserved their text before the following entries.');
