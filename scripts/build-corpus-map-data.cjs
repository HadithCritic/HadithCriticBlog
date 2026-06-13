/*
  Corpus Mapping pipeline.

  For every hadith in the Silsilah TSVs, derive the geographic journey of its
  chain: narrator names in chain_en carry geographic nisbas (al-Kufi, al-Basri,
  al-Madani ...) which map to cities. The journey runs companion-first (chains
  are stored collector-first, so we reverse), is prefixed by the Prophet in
  Medina, and ends at the compiler's home city.

  Outputs to public/corpus-data/<slug>/:
    manifest.json   cities table, compiler city, shard count, coverage stats
    shard-<n>.json  ref -> [[narratorName, cityIdx|-1], ...]  (djb2(ref) % shards)

  Run: node scripts/build-corpus-map-data.cjs
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const HADITH_DIR = path.join(ROOT, 'hadith');
const OUT_DIR = path.join(ROOT, 'public', 'corpus-data');
const SHARD_SIZE = 4000;

/* ---- city gazetteer: [id, label, lon, lat] ---- */
const CITIES = [
  ['medina', 'Madīna', 39.61, 24.47],
  ['mecca', 'Makka', 39.83, 21.42],
  ['taif', 'Ṭāʾif', 40.42, 21.27],
  ['yamama', 'Yamāma', 46.7, 24.6],
  ['sanaa', 'Ṣanʿāʾ', 44.21, 15.37],
  ['kufa', 'Kūfa', 44.4, 32.03],
  ['basra', 'Baṣra', 47.78, 30.51],
  ['baghdad', 'Baghdād', 44.4, 33.34],
  ['wasit', 'Wāsiṭ', 45.8, 32.18],
  ['mosul', 'Mawṣil', 43.13, 36.34],
  ['raqqa', 'Raqqa', 39.01, 35.95],
  ['harran', 'Ḥarrān', 39.03, 36.87],
  ['aleppo', 'Ḥalab', 37.16, 36.2],
  ['homs', 'Ḥimṣ', 36.72, 34.73],
  ['damascus', 'Dimashq', 36.3, 33.51],
  ['beirut', 'Bayrūt', 35.5, 33.89],
  ['tiberias', 'Ṭabariyya', 35.53, 32.79],
  ['jerusalem', 'Bayt al-Maqdis', 35.23, 31.78],
  ['ramla', 'Ramla', 34.87, 31.93],
  ['ascalon', 'ʿAsqalān', 34.56, 31.67],
  ['fustat', 'Fusṭāṭ (Miṣr)', 31.23, 30.01],
  ['alexandria', 'Iskandariyya', 29.92, 31.2],
  ['ahwaz', 'Ahwāz', 48.67, 31.32],
  ['hamadan', 'Hamadhān', 48.51, 34.8],
  ['rayy', 'Rayy', 51.43, 35.61],
  ['qazwin', 'Qazwīn', 50.0, 36.27],
  ['isfahan', 'Aṣbahān', 51.67, 32.65],
  ['kirman', 'Kirmān', 57.08, 30.28],
  ['jurjan', 'Jurjān', 54.43, 36.84],
  ['nishapur', 'Nīsābūr', 58.8, 36.21],
  ['bayhaq', 'Bayhaq', 57.68, 36.22],
  ['tus', 'Ṭūs', 59.22, 36.49],
  ['nasa', 'Nasā', 58.38, 38.03],
  ['merv', 'Marw', 62.19, 37.66],
  ['sijistan', 'Sijistān', 61.89, 31.03],
  ['bust', 'Bust', 64.36, 31.62],
  ['balkh', 'Balkh', 66.9, 36.76],
  ['tirmidh', 'Tirmidh', 67.24, 37.22],
  ['bukhara', 'Bukhārā', 64.42, 39.77],
  ['samarqand', 'Samarqand', 66.92, 39.65],
  ['khurasan', 'Khurāsān', 60.5, 35.2],
  ['ayla', 'Ayla', 34.99, 29.53],
  ['kufa_or_iraq', 'ʿIrāq', 45.5, 31.5]
];
const cityIdx = new Map(CITIES.map((c, i) => [c[0], i]));

/* ---- nisba lexicon (normalized latin) -> city id ---- */
const NISBAS = [
  ['madani', 'medina'], ['madini', 'medina'],
  ['makki', 'mecca'],
  ['taifi', 'taif'], ['ta\'ifi', 'taif'],
  ['yamami', 'yamama'],
  ['sanani', 'sanaa'], ['san\'ani', 'sanaa'], ['yamani', 'sanaa'],
  ['kufi', 'kufa'],
  ['basri', 'basra'],
  ['baghdadi', 'baghdad'],
  ['wasiti', 'wasit'],
  ['mawsili', 'mosul'], ['mausili', 'mosul'],
  ['raqqi', 'raqqa'],
  ['harrani', 'harran'],
  ['halabi', 'aleppo'],
  ['himsi', 'homs'],
  ['dimashqi', 'damascus'], ['shami', 'damascus'],
  ['bayruti', 'beirut'],
  ['tabarani', 'tiberias'],
  ['maqdisi', 'jerusalem'],
  ['ramli', 'ramla'],
  ['asqalani', 'ascalon'],
  ['misri', 'fustat'],
  ['iskandarani', 'alexandria'],
  ['ahwazi', 'ahwaz'],
  ['hamadhani', 'hamadan'], ['hamadani', 'hamadan'],
  ['razi', 'rayy'],
  ['qazwini', 'qazwin'],
  ['isfahani', 'isfahan'], ['asbahani', 'isfahan'],
  ['kirmani', 'kirman'],
  ['jurjani', 'jurjan'],
  ['naysaburi', 'nishapur'], ['nisaburi', 'nishapur'], ['nishapuri', 'nishapur'],
  ['bayhaqi', 'bayhaq'],
  ['tusi', 'tus'],
  ['nasai', 'nasa'], ['nasawi', 'nasa'],
  ['marwazi', 'merv'],
  ['sijistani', 'sijistan'], ['sijzi', 'sijistan'],
  ['busti', 'bust'],
  ['balkhi', 'balkh'],
  ['tirmidhi', 'tirmidh'],
  ['bukhari', 'bukhara'],
  ['samarqandi', 'samarqand'],
  ['khurasani', 'khurasan'],
  ['iraqi', 'kufa_or_iraq'],
  /* school nisbas that are reliably geographic in isnad context */
  ['ansari', 'medina'],
  ['khudri', 'medina'],
  ['darawardi', 'medina'],
  ['ayli', 'ayla'],
  ['zahrani', 'basra'],
  ['qawariri', 'basra'],
  ['muqaddami', 'basra'],
  ['anbari', 'basra'],
  ['mismai', 'basra'],
  ['jahdari', 'basra'],
  ['tayalisi', 'basra'],
  ['awzai', 'beirut'],
  ['nakhai', 'kufa'],
  ['thawri', 'kufa'],
  ['amash', 'kufa'],
  ['sabii', 'kufa']
];

/*
  Curated gazetteer of the most frequent transmitters. Two kinds:
  - EXACT: the whole (normalized) name equals the key. Catches the bare names
    chains use constantly ("Nafi", "Qatada", "Malik").
  - SUBSTRING: the normalized name contains the pattern. Ordered longest first
    so specific patterns win (e.g. "anas b. malik" matches before "malik").
  Deliberately omitted because ambiguous: bare Sufyan (Thawri vs Ibn Uyayna),
  bare Hammad (b. Zayd vs b. Salama, both Basran anyway -> included as exact),
  bare Yahya, bare Alqama (Kufan b. Qays vs Medinan b. Waqqas).
*/
const EXACT_NAMES = {
  // Medina
  'nafi': 'medina', 'zuhri': 'medina', 'al-zuhri': 'medina', 'ibn shihab': 'medina',
  'urwah': 'medina', 'malik': 'medina', 'ikrimah': 'medina', 'rabiah': 'medina',
  // Mecca
  'mujahid': 'mecca', 'ibn jurayj': 'mecca', 'amr b. dinar': 'mecca', 'al-humaydi': 'mecca',
  // Basra
  'qatadah': 'basra', 'shubah': 'basra', 'ayyub': 'basra', 'thabit': 'basra',
  'hammad': 'basra', 'musaddad': 'basra', 'ghundar': 'basra', 'bahz': 'basra',
  'al-hasan': 'basra', 'humayd': 'basra', 'hisham al-dastawai': 'basra',
  // Kufa
  'waki': 'kufa', 'mansur': 'kufa', 'al-hakam': 'kufa', 'abu ishaq': 'kufa',
  'abu muawiyah': 'kufa', 'abu kurayb': 'kufa', 'abu usamah': 'kufa', 'abu nuaym': 'kufa',
  'sharik': 'kufa', 'israil': 'kufa',
  // Sanaa
  'mamar': 'sanaa', 'abd al-razzaq': 'sanaa', 'tawus': 'sanaa',
  // Wasit
  'hushaym': 'wasit',
  // Baghdad
  'affan': 'baghdad'
};

const SUBSTRING_NAMES = [
  // companions
  ['abu hurayrah', 'medina'], ['abu hurayra', 'medina'],
  ['aishah', 'medina'], ['aisha', 'medina'],
  ['ibn abbas', 'mecca'], ['b. abbas', 'mecca'],
  ['ibn umar', 'medina'], ['abdullah b. umar', 'medina'],
  ['umar b. al-khattab', 'medina'],
  ['uthman b. affan', 'medina'],
  ['abu bakr al-siddiq', 'medina'],
  ['ali b. abu talib', 'kufa'], ['ali b. abi talib', 'kufa'],
  ['ibn masud', 'kufa'], ['b. masud', 'kufa'],
  ['anas b. malik', 'basra'],
  ['jabir b. abdullah', 'medina'],
  ['abu musa al-ashari', 'basra'],
  ['muadh b. jabal', 'damascus'],
  ['abu al-darda', 'damascus'], ['abu darda', 'damascus'],
  ['imran b. husayn', 'basra'],
  ['mughirah b. shubah', 'kufa'],
  ['sahl b. sad', 'medina'],
  ['ubadah b. al-samit', 'jerusalem'],
  ['amr b. al-as', 'fustat'],
  ['abdullah b. amr', 'fustat'],
  ['zayd b. thabit', 'medina'],
  ['ubayy b. kab', 'medina'],
  ['abu ayyub', 'medina'],
  ['al-bara b. azib', 'kufa'], ['bara b. azib', 'kufa'],
  ['hudhayfah', 'kufa'],
  ['abu umamah', 'homs'],
  ['ibn al-zubayr', 'mecca'],
  ['umm salamah', 'medina'],
  ['abu dharr', 'medina'],
  // Medina school
  ['hisham b. urwah', 'medina'],
  ['said b. al-musayyab', 'medina'],
  ['al-qasim b. muhammad', 'medina'],
  ['salim b. abdullah', 'medina'],
  ['abu salamah b. abd', 'medina'],
  ['yahya b. said al-ansari', 'medina'],
  ['malik b. anas', 'medina'],
  ['abu al-zinad', 'medina'], ['al-araj', 'medina'],
  // Mecca
  ['ata b. abu rabah', 'mecca'], ['ata b. abi rabah', 'mecca'],
  ['ibn uyaynah', 'mecca'], ['b. uyaynah', 'mecca'],
  // Basra school
  ['ibn sirin', 'basra'], ['b. sirin', 'basra'],
  ['hammad b. salamah', 'basra'], ['hammad b. zayd', 'basra'],
  ['abd al-warith', 'basra'],
  ['yazid b. zuray', 'basra'],
  ['ibn ulayyah', 'basra'], ['b. ulayyah', 'basra'],
  ['yahya b. said al-qattan', 'basra'], ['al-qattan', 'basra'],
  ['abd al-rahman b. mahdi', 'basra'], ['b. mahdi', 'basra'],
  ['muslim b. ibrahim', 'basra'],
  ['muhammad b. al-muthanna', 'basra'],
  ['muhammad b. bashshar', 'basra'], ['bundar', 'basra'],
  ['amr b. ali', 'basra'],
  ['yunus b. ubayd', 'basra'],
  ['muhammad b. jafar', 'basra'],
  // Kufa school
  ['ibrahim al-nakhai', 'kufa'],
  ['al-shabi', 'kufa'], ['amir al-shabi', 'kufa'],
  ['alqamah b. qays', 'kufa'],
  ['ibn numayr', 'kufa'], ['b. numayr', 'kufa'],
  ['ibn abi shaybah', 'kufa'], ['b. abu shaybah', 'kufa'], ['b. abi shaybah', 'kufa'],
  ['ubaydullah b. musa', 'kufa'],
  ['abu bakr b. ayyash', 'kufa'],
  ['jarir b. abd al-hamid', 'rayy'],
  // Syria, Egypt, north
  ['al-walid b. muslim', 'damascus'],
  ['hisham b. ammar', 'damascus'],
  ['abu mushir', 'damascus'],
  ['abu al-yaman', 'homs'],
  ['baqiyyah', 'homs'],
  ['ismail b. ayyash', 'homs'],
  ['shuayb b. abu hamzah', 'homs'], ['shuayb b. abi hamzah', 'homs'],
  ['al-layth', 'fustat'], ['layth b. sad', 'fustat'],
  ['ibn wahb', 'fustat'], ['b. wahb', 'fustat'],
  ['ibn lahiah', 'fustat'],
  ['yahya b. bukayr', 'fustat'],
  ['harmalah', 'fustat'],
  ['muhammad b. rumh', 'fustat'],
  ['abu al-tahir', 'fustat'],
  ['yunus b. yazid', 'ayla'],
  // east
  ['yahya b. yahya', 'nishapur'],
  ['ishaq b. ibrahim', 'nishapur'], ['ibn rahawayh', 'nishapur'],
  ['qutaybah b. said', 'balkh'], ['qutaybah', 'balkh'],
  ['ibn al-mubarak', 'merv'], ['b. al-mubarak', 'merv'],
  ['abd al-razzaq', 'sanaa'],
  ['wahb b. munabbih', 'sanaa'],
  // Wasit, Baghdad
  ['yazid b. harun', 'wasit'],
  ['b. hanbal', 'baghdad'],
  ['yahya b. main', 'baghdad'],
  ['zuhayr b. harb', 'baghdad'],
  ['abu khaythamah', 'baghdad'],
  ['al-humaydi', 'mecca']
]
  .sort((a, b) => b[0].length - a[0].length)
  .map(([pat, city]) => ({
    re: new RegExp('(^|[^a-z])' + pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z])'),
    city
  }));

/* compiler home city per collection */
const COMPILERS = {
  bukhari: ['bukhara', 'al-Bukhārī'],
  muslim: ['nishapur', 'Muslim'],
  nasai: ['nasa', 'al-Nasāʾī'],
  'nasai-kubra': ['nasa', 'al-Nasāʾī'],
  abudawud: ['basra', 'Abū Dāwūd'],
  tirmidhi: ['tirmidh', 'al-Tirmidhī'],
  ibnmajah: ['qazwin', 'Ibn Mājah'],
  malik: ['medina', 'Mālik'],
  ahmad: ['baghdad', 'Ibn Ḥanbal'],
  'ahmad-zuhd': ['baghdad', 'Ibn Ḥanbal'],
  darimi: ['samarqand', 'al-Dārimī'],
  ibnkhuzaymah: ['nishapur', 'Ibn Khuzayma'],
  ibnhibban: ['bust', 'Ibn Ḥibbān'],
  hakim: ['nishapur', 'al-Ḥākim'],
  'lulu-marjan': ['fustat', 'ʿAbd al-Bāqī'],
  bazzar: ['baghdad', 'al-Bazzār'],
  tabarani: ['isfahan', 'al-Ṭabarānī'],
  bayhaqi: ['bayhaq', 'al-Bayhaqī'],
  adab: ['bukhara', 'al-Bukhārī']
};

/* strip latin transliteration diacritics, lowercase */
function normLatin(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʿʾ‘’ʻ]/g, '')
    .toLowerCase();
}

const NISBA_RES = NISBAS.map(([k, city]) => ({
  re: new RegExp(`(?:^|[^a-z])(?:al[- ])?${k.replace(/'/g, '')}(?:$|[^a-z])`),
  city
}));

function detectCity(name) {
  const n = normLatin(name).replace(/'/g, '').replace(/\s+/g, ' ').trim();
  // 1. exact famous-name match (bare names used constantly in chains)
  const exact = EXACT_NAMES[n] ?? EXACT_NAMES[n.replace(/^al-/, '')];
  if (exact) return cityIdx.get(exact);
  // 2. curated patterns with word boundaries, longest first
  for (const { re, city } of SUBSTRING_NAMES) {
    if (re.test(n)) return cityIdx.get(city);
  }
  // 3. geographic nisba in the name itself
  for (const { re, city } of NISBA_RES) {
    if (re.test(n)) return cityIdx.get(city);
  }
  return -1;
}

function djb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

const isNull = (v) => v === undefined || v === null || v === '' || v === 'null';

async function processCollection(slug, file) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(HADITH_DIR, file), 'utf8'),
    crlfDelay: Infinity
  });

  let header = null;
  const idx = {};
  const items = new Map(); // ref -> [[name, cityIdx], ...] companion-first
  let narrators = 0;
  let located = 0;
  let chainsTotal = 0;

  for await (const line of rl) {
    if (!header) {
      header = line.split('\t');
      header.forEach((h, i) => (idx[h] = i));
      continue;
    }
    if (!line.trim()) continue;
    const c = line.split('\t');
    if (c[idx.doctype] !== 'hadith') continue;
    const ref = c[idx.ref];
    let chain = c[idx.chain_en];
    if (isNull(ref) || isNull(chain)) continue;
    // use the first chain when several are recorded
    chain = chain.split(/\[Chain \d+\]/).map((s) => s.trim()).filter(Boolean)[0] || '';
    const names = chain.split('>').map((s) => s.trim()).filter((s) => s.length > 1);
    if (!names.length) continue;
    chainsTotal++;
    // stored collector-first; reverse to companion-first
    names.reverse();
    const norms = names.map(normName);
    const seq = names.map((name, i) => {
      let ci = detectCityFull(name);
      if (ci < 0) ci = detectCityContext(norms, i);
      narrators++;
      if (ci >= 0) located++;
      return [name, ci];
    });
    items.set(ref, seq);
  }

  const shards = Math.max(1, Math.ceil(items.size / SHARD_SIZE));
  const buckets = Array.from({ length: shards }, () => ({}));
  for (const [ref, seq] of items) {
    buckets[djb2(ref) % shards][ref] = seq;
  }

  const dir = path.join(OUT_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  buckets.forEach((b, i) => {
    fs.writeFileSync(path.join(dir, `shard-${i}.json`), JSON.stringify(b));
  });

  const [compilerCity, compilerName] = COMPILERS[slug] ?? [null, null];
  fs.writeFileSync(
    path.join(dir, 'manifest.json'),
    JSON.stringify({
      slug,
      shards,
      count: items.size,
      compilerCity: compilerCity ? cityIdx.get(compilerCity) : -1,
      compilerName,
      narrators,
      located,
      cities: CITIES
    })
  );

  return { slug, chains: chainsTotal, narrators, located, pct: ((located / Math.max(narrators, 1)) * 100).toFixed(1) };
}

/* supplements produced by scripts/identify-narrators.cjs (reviewable, regenerable) */
function loadJson(p) {
  const full = path.join(__dirname, p);
  return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : {};
}
const SUPPLEMENT = loadJson('narrator-locations.json'); // norm name -> city id string
const CONTEXT_RULES = loadJson('narrator-context-rules.json'); // token0|side|neighbour -> city id

const normName = (s) => normLatin(s).replace(/'/g, '').replace(/\s+/g, ' ').trim();

/* lexicon + curated locations, single-name scope */
function detectCityFull(name) {
  const base = detectCity(name);
  if (base >= 0) return base;
  const sup = SUPPLEMENT[normName(name)];
  return sup !== undefined ? cityIdx.get(sup) ?? -1 : -1;
}

/* apply context rules: a bare name inherits a city from a known neighbour.
   norms[i] is the name; teacher = norms[i+1] (heard from), student = norms[i-1]. */
function detectCityContext(norms, i) {
  const toks = norms[i].split(' ');
  if (toks.length !== 1) return -1;
  const token0 = toks[0].replace(/^al-/, '');
  const teacher = norms[i + 1];
  const student = norms[i - 1];
  for (const [side, nb] of [['t', teacher], ['s', student]]) {
    if (!nb) continue;
    const city = CONTEXT_RULES[`${token0}|${side}|${nb}`];
    if (city) return cityIdx.get(city) ?? -1;
  }
  return -1;
}

module.exports = { detectCity, detectCityFull, normLatin, normName, CITIES, cityIdx, COMPILERS };

if (require.main === module) {
  (async () => {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const files = fs.readdirSync(HADITH_DIR).filter((f) => f.endsWith('.tsv'));
    const stats = [];
    for (const f of files) {
      const slug = f.replace(/\.tsv$/, '');
      const s = await processCollection(slug, f);
      stats.push(s);
      console.log(slug.padEnd(14), 'chains', String(s.chains).padStart(6), '| narrators located', s.pct + '%');
    }
    const totN = stats.reduce((a, s) => a + s.narrators, 0);
    const totL = stats.reduce((a, s) => a + s.located, 0);
    console.log('TOTAL located:', ((totL / totN) * 100).toFixed(1) + '% of', totN, 'narrator positions');
  })();
}
