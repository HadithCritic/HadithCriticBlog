// Reviewed source forms, checked against the named register entries and, for
// abbreviated names, the neighboring transmitters in the corpus paths.
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const corpusVersion = JSON.parse(fs.readFileSync('src/data/corpus-meta.json','utf8')).corpusVersion;
const db = new DatabaseSync(`dist-db/builds/${corpusVersion}/hadith.db`, {readOnly:true});
const ids = new Set(db.prepare('SELECT id FROM narrator').all().map(r => r.id));
const reviewed = {
  'birr-al-walidayn': { 'the owner of this house (Ibn Masʿūd)': 3913 },
  'musnad-khalifa-ibn-khayyat': {
    "Muhammad b. Sawa'": 5653, "Mus'ab b. Sa'd": 6170,
    "His father (Sa'd, by patronymic)": 2289,
    "His grandfather ('Abd Allah b. Salam, by patronymic)": 3693,
    'Abu Muwayhiba (freedman of the Messenger of God ﷺ)': 7516,
    "al-'Ala' b. 'Abd Allah b. Rafi'": 4474,
    'Artat b. al-Husayn': 19984, 'Burayda b. Sufyan b. Farwa': 904,
    "Muhammad b. Fada'": 5876, 'Muslim b. Ibrahim': 6106,
  },
  'musnad-sad-ibn-abi-waqqas': {
    "Abu 'Abd Allah Ahmad b. Ibrahim b. Kathir al-Dawraqi": 404,
    'Ahmad b. Ibrahim al-Dawraqi': 404,
    "his father Sa'd": 2289, "his father Sa'd b. Malik": 2289,
    "his father Sa'd b. Abi Waqqas": 2289,
    "his grandfather Sa'd": 2289,
    'Abu Badr Shuja b. al-Walid b. Qays al-Sakuni': 2747,
  },
};
for (const [slug, forms] of Object.entries(reviewed)) {
  const path = `src/data/hadith-pages/${slug}/publication-source.json`;
  const source = JSON.parse(fs.readFileSync(path, 'utf8'));
  let count = 0;
  for (const record of source.records) for (const chain of record.chains || []) for (let i=0; i<chain.length; i++) {
    const node = chain[i];
    let id = forms[node.en];
    let scope = null;
    if (slug === 'musnad-sad-ibn-abi-waqqas' && node.en === 'Ahmad' && /compiler.*Dawraqi/i.test(node.role || '')) id = 404;
    if (slug === 'musnad-sad-ibn-abi-waqqas' && node.en === "Mus'ab b. Sa'd" && /^(his father|Sa'd)/i.test(chain[i+1]?.en || '')) id = 6170;
    if (slug === 'musnad-sad-ibn-abi-waqqas' && node.en === "Abu 'Awn" && chain[i-1]?.en === "Shu'ba" && chain[i+1]?.en === 'Jabir b. Samura') { id = 5797; scope = 'occurrence'; }
    if (slug === 'musnad-sad-ibn-abi-waqqas' && node.en === 'Abu Dawud' && chain[i-1]?.en === 'Ahmad' && /compiler.*Dawraqi/i.test(chain[i-1]?.role || '')) { id = 2594; scope = 'occurrence'; }
    if (!id) continue;
    if (!ids.has(id) || (node.narrator_id != null && Number(node.narrator_id) !== id)) throw Error(`Conflicting register ID: ${slug} ${record.id} ${node.en}`);
    node.narrator_id = id;
    if (scope) node.narrator_id_scope = scope;
    node.narrator_id_source = 'reviewed against register and source transmission context';
    count++;
  }
  fs.writeFileSync(path, JSON.stringify(source, null, 2) + '\n');
  console.log(`${slug}: ${count} reviewed occurrences linked.`);
}
db.close();
