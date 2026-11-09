import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';

const slugs = ['birr-al-walidayn','musnad-khalifa-ibn-khayyat','musnad-sad-ibn-abi-waqqas'];
const attr = (node, key) => node.attrs?.find(a => a.name === key)?.value;
const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
function find(node, predicate) { if (predicate(node)) return node; for (const child of node.childNodes || []) { const found = find(child, predicate); if (found) return found; } }
function all(node, predicate, found = []) { if (predicate(node)) found.push(node); for (const child of node.childNodes || []) all(child, predicate, found); return found; }
const text = node => node?.nodeName === '#text' ? node.value : (node?.childNodes || []).map(text).join('');
const normalize = value => String(value || '').replace(/\*([^*\n]+)\*/g, '$1').replace(/\s+/g, ' ').trim();
for (const slug of slugs) {
  const root = path.join('src/data/hadith-pages', slug);
  const source = JSON.parse(fs.readFileSync(path.join(root, 'publication-source.json'), 'utf8'));
  const index = JSON.parse(fs.readFileSync(path.join(root, 'chapter-index.json'), 'utf8'));
  const byId = new Map(source.records.map(record => [String(record.id), record]));
  const seen = new Set();
  for (const chapter of index) {
    const html = fs.readFileSync(path.join(root, chapter.file), 'utf8');
    const document = parse(html);
    for (const article of all(document, node => node.tagName === 'article' && hasClass(node, 'hadith'))) {
      const id = attr(article, 'data-hadith');
      const record = byId.get(id);
      if (!record || seen.has(id)) throw new Error(`${slug}: missing or duplicate source record ${id}`);
      seen.add(id);
      if (slug === 'musnad-sad-ibn-abi-waqqas' && id === '34-1') {
        if (find(article, node => node.tagName === 'a' && attr(node, 'href') === '/narrators/5797/')) throw new Error('Abu Awn from another transmission was incorrectly applied to entry 34');
      }
      for (const chain of record.chains || []) for (const person of chain) if (person.narrator_id != null) {
        const link = find(article, node => node.tagName === 'a' && attr(node, 'href') === `/narrators/${person.narrator_id}/`);
        if (!link) throw new Error(`${slug} ${id}: reviewed narrator ${person.narrator_id} is not linked`);
      }
      if (record.preceding_source_material && !html.includes(record.preceding_source_material.title_en)) throw new Error(`${slug} ${id}: transmission preface missing`);
      for (const [lang, cls] of [['en','english'],['ar','arabic']]) {
        const column = find(article, node => hasClass(node, 'language-column') && hasClass(node, cls));
        if (!column) throw new Error(`${slug} ${id}: ${lang} column missing`);
        const isnad = record[`display_isnad_${lang}`] || '';
        const matn = record[`display_matn_${lang}`] || '';
        const full = record[`display_text_${lang}`];
        if (typeof full === 'string' && (isnad || matn) && normalize(full) !== normalize(`${isnad} ${matn}`)) throw new Error(`${slug} ${id}: ${lang} split does not reconstruct the displayed text`);
        const expectedIsnad = isnad;
        const expectedMatn = isnad || matn ? matn : (record[lang] || '');
        for (const [kind, expected] of [['isnad', expectedIsnad], ['matn', expectedMatn]]) {
          const node = find(column, el => el.tagName === 'p' && hasClass(el, kind));
          const actual = text(node);
          if (normalize(actual) !== normalize(expected)) throw new Error(`${slug} ${id}: ${lang} ${kind} differs from its display field`);
          if (/#{2,6}\s|\[p\.\s*\d+\]|⦗ص:\s*\d+⦘/i.test(actual)) throw new Error(`${slug} ${id}: source heading or page marker in ${lang} ${kind}`);
        }
      }
    }
    for (const script of all(document, node => node.tagName === 'script')) if (text(script).trim()) new Function(text(script));
  }
  if (seen.size !== source.records.length) throw new Error(`${slug}: rendered ${seen.size}/${source.records.length} entries`);
  console.log(`${slug}: ${index.length} pages and ${seen.size} source entries verified.`);
}
