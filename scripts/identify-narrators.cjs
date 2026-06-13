/*
  Narrator identification engine for Corpus Mapping.

  Lifts location coverage beyond the base lexicon in three layers:

  A. Mine every chain in every collection; count unlocated name strings.
  B. Geocode the al-Kashif register (Arabic geographic nisbas in entry names,
     plus "nazil/sakana <city>" residence phrases), then match frequent
     unlocated chain names to register entries by consonant-skeleton
     transliteration. Unambiguous matches become locations.
  C. The variant-transmission method, statistically: a bare name ("Sufyan",
     "Anas") inherits the identity of the fuller spelling that appears in the
     same teacher/student context elsewhere in the corpus. Dominant expansions
     (>=80% share) become context rules keyed on the neighbour's name.

  Outputs (reviewable, consumed by build-corpus-map-data.cjs):
    scripts/narrator-locations.json       normalized name -> city id
    scripts/narrator-context-rules.json   "token|t|teacher" / "token|s|student" -> city id
    scripts/identify-report.json          coverage report + top remaining unlocated

  Run: node scripts/identify-narrators.cjs
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { detectCity, normLatin, CITIES, cityIdx } = require('./build-corpus-map-data.cjs');

const HADITH_DIR = path.join(__dirname, '..', 'hadith');
const RIJAL_DIR = path.join(__dirname, '..', 'src', 'data', 'rijal');

const MIN_FREQ = 25; // only attempt names that occur at least this often
const isNull = (v) => v === undefined || v === null || v === '' || v === 'null';

/* ---------- Arabic geocoding of al-Kashif ---------- */

const AR_DIACRITICS = new RegExp(
  '[' +
    '\u0610-\u061A' +
    '\u064B-\u065F' +
    '\u0670' +
    '\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED' +
    '\u0640' +
    ']',
  'g'
);
const ALEF = new RegExp('[\u0623\u0625\u0622\u0671]', 'g');
const normAr = (s) =>
  s
    .replace(AR_DIACRITICS, String())
    .replace(ALEF, 'ا')
    .replace(new RegExp('\u0649','g'), 'ي')
    .replace(new RegExp('\u0626','g'), 'ي')
    .replace(new RegExp('\u0624','g'), 'و')
    .replace(new RegExp('\u0629','g'), 'ه');

const AR_NISBAS = [
  ['المدني', 'medina'], ['المديني', 'medina'],
  ['المكي', 'mecca'],
  ['الطايفي', 'taif'],
  ['اليمامي', 'yamama'],
  ['الصنعاني', 'sanaa'], ['اليماني', 'sanaa'],
  ['الكوفي', 'kufa'],
  ['البصري', 'basra'],
  ['البغدادي', 'baghdad'],
  ['الواسطي', 'wasit'],
  ['الموصلي', 'mosul'],
  ['الرقي', 'raqqa'],
  ['الحراني', 'harran'],
  ['الحلبي', 'aleppo'],
  ['الحمصي', 'homs'],
  ['الدمشقي', 'damascus'], ['الشامي', 'damascus'],
  ['البيروتي', 'beirut'],
  ['المقدسي', 'jerusalem'],
  ['الرملي', 'ramla'],
  ['العسقلاني', 'ascalon'],
  ['المصري', 'fustat'],
  ['الاسكندراني', 'alexandria'],
  ['الاهوازي', 'ahwaz'],
  ['الهمذاني', 'hamadan'],
  ['الرازي', 'rayy'],
  ['القزويني', 'qazwin'],
  ['الاصبهاني', 'isfahan'],
  ['الكرماني', 'kirman'],
  ['الجرجاني', 'jurjan'],
  ['النيسابوري', 'nishapur'],
  ['البيهقي', 'bayhaq'],
  ['الطوسي', 'tus'],
  ['النسايي', 'nasa'], ['النسوي', 'nasa'],
  ['المروزي', 'merv'],
  ['السجستاني', 'sijistan'], ['السجزي', 'sijistan'],
  ['البستي', 'bust'],
  ['البلخي', 'balkh'],
  ['الترمذي', 'tirmidh'],
  ['البخاري', 'bukhara'],
  ['السمرقندي', 'samarqand'],
  ['الخراساني', 'khurasan'],
  ['الايلي', 'ayla'],
  ['الانصاري', 'medina'],
  ['الخدري', 'medina']
];

const AR_PLACES = [
  ['بغداد', 'baghdad'], ['مصر', 'fustat'], ['مكه', 'mecca'], ['المدينه', 'medina'],
  ['الكوفه', 'kufa'], ['البصره', 'basra'], ['دمشق', 'damascus'], ['الشام', 'damascus'],
  ['نيسابور', 'nishapur'], ['واسط', 'wasit'], ['حمص', 'homs'], ['الري', 'rayy'],
  ['مرو', 'merv'], ['اليمن', 'sanaa'], ['صنعاء', 'sanaa'], ['خراسان', 'khurasan'],
  ['بخاري', 'bukhara'], ['سمرقند', 'samarqand'], ['حلب', 'aleppo'], ['الموصل', 'mosul'],
  ['عسقلان', 'ascalon'], ['الرمله', 'ramla'], ['بيت المقدس', 'jerusalem'], ['الطايف', 'taif']
];

function geocodeKashif(entry) {
  const name = normAr(entry.name || '');
  for (const [nisba, city] of AR_NISBAS) {
    if (name.includes(normAr(nisba))) return city;
  }
  const text = normAr((entry.text || '').slice(0, 220));
  const m = text.match(/(?:نزيل|سكن|نزل)\s+([؀-ۿ ]{2,18})/);
  if (m) {
    for (const [place, city] of AR_PLACES) {
      if (m[1].includes(normAr(place))) return city;
    }
  }
  for (const [nisba, city] of AR_NISBAS) {
    if (text.includes(normAr(nisba))) return city;
  }
  return null;
}

/* ---------- consonant-skeleton transliteration matching ---------- */

function latinSkeletonToken(tok) {
  let t = tok.toLowerCase();
  if (/^(b\.?|bn|ibn)$/.test(t)) return 'bn';
  if (/^(abu|abi|aba)$/.test(t)) return 'ab';
  t = t.replace(/^al-/, '').replace(/[^a-z]/g, '');
  if (!t) return '';
  t = t.replace(/th/g, 'T').replace(/kh/g, 'K').replace(/dh/g, 'D').replace(/sh/g, 'S').replace(/gh/g, 'G');
  t = t.replace(/[aeiouwy]/g, '');
  t = t.replace(/(.)\1+/g, '$1');
  return t;
}

const AR_LETTER = {
  'ب': 'b', 'ت': 't', 'ث': 'T', 'ج': 'j', 'ح': 'h', 'خ': 'K', 'د': 'd', 'ذ': 'D',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'S', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h'
};

function arabicSkeletonToken(tok) {
  let t = normAr(tok);
  if (t === 'بن' || t === 'ابن') return 'bn';
  if (t === 'ابو' || t === 'ابي' || t === 'ابا') return 'ab';
  t = t.replace(/^ال/, '');
  let out = '';
  for (const ch of t) out += AR_LETTER[ch] ?? '';
  out = out.replace(/(.)\1+/g, '$1');
  return out;
}

function latinSkeleton(name) {
  return name.split(/\s+/).map(latinSkeletonToken).filter((t) => t.length > 0);
}

function arabicSkeleton(name) {
  return name
    .split(/\s+/)
    .map(arabicSkeletonToken)
    .filter((t) => t.length > 0);
}

/* is `small` an ordered subsequence of `big`? */
function isSubsequence(small, big) {
  let j = 0;
  for (let i = 0; i < big.length && j < small.length; i++) {
    if (big[i] === small[j]) j++;
  }
  return j === small.length;
}

/* ---------- main ---------- */

(async () => {
  /* layer A: mine chains */
  const files = fs.readdirSync(HADITH_DIR).filter((f) => f.endsWith('.tsv'));
  const freq = new Map(); // norm name -> count (unlocated only)
  const display = new Map(); // norm -> original sample
  // expansions: token0 -> Map(fullNorm -> {count, city})
  const expansions = new Map();
  // contexts for bare tokens: `${token0}|t|${teacher}` etc -> Map(fullNorm -> count)
  const contexts = new Map();

  const normName = (s) => normLatin(s).replace(/'/g, '').replace(/\s+/g, ' ').trim();

  for (const f of files) {
    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(HADITH_DIR, f), 'utf8'),
      crlfDelay: Infinity
    });
    let header = null;
    const idx = {};
    for await (const line of rl) {
      if (!header) {
        header = line.split('\t');
        header.forEach((h, i) => (idx[h] = i));
        continue;
      }
      const c = line.split('\t');
      if (c[idx.doctype] !== 'hadith') continue;
      let chain = c[idx.chain_en];
      if (isNull(chain)) continue;
      chain = chain.split(/\[Chain \d+\]/).map((s) => s.trim()).filter(Boolean)[0] || '';
      const names = chain.split('>').map((s) => s.trim()).filter((s) => s.length > 1);
      const norms = names.map(normName);
      for (let i = 0; i < norms.length; i++) {
        const n = norms[i];
        const city = detectCity(names[i]);
        const toks = n.split(' ');
        const token0 = toks[0].replace(/^al-/, '');
        if (toks.length >= 2) {
          // record as a possible expansion of its first token
          let m = expansions.get(token0);
          if (!m) expansions.set(token0, (m = new Map()));
          const e = m.get(n) ?? { count: 0, city };
          e.count++;
          if (e.city < 0 && city >= 0) e.city = city;
          m.set(n, e);
        }
        if (city >= 0) continue;
        freq.set(n, (freq.get(n) ?? 0) + 1);
        if (!display.has(n)) display.set(n, names[i]);
        if (toks.length === 1) {
          // bare name: remember its neighbours for context rules
          const teacher = norms[i + 1]; // he heard from
          const student = norms[i - 1]; // who heard from him
          for (const [side, nb] of [['t', teacher], ['s', student]]) {
            if (!nb) continue;
            const key = `${token0}|${side}|${nb}`;
            let m = contexts.get(key);
            if (!m) contexts.set(key, (m = new Map()));
            m.set(n, (m.get(n) ?? 0) + 1);
          }
        }
      }
    }
  }

  const candidates = [...freq.entries()].filter(([, c]) => c >= MIN_FREQ).sort((a, b) => b[1] - a[1]);
  console.log('unlocated name strings occurring >=', MIN_FREQ, ':', candidates.length);

  /* layer B: geocode al-Kashif, then skeleton-match */
  const meta = JSON.parse(fs.readFileSync(path.join(RIJAL_DIR, 'meta.json'), 'utf8'));
  const register = []; // {skel, city, name, id}
  let geocoded = 0;
  for (let ci = 0; ci < meta.chunks; ci++) {
    const chunk = JSON.parse(fs.readFileSync(path.join(RIJAL_DIR, `chunk-${ci}.json`), 'utf8'));
    for (const e of chunk) {
      if (e.stub) continue;
      const city = geocodeKashif(e);
      if (!city) continue;
      geocoded++;
      register.push({ skel: arabicSkeleton(e.name), city, name: e.name, id: e.id });
    }
  }
  console.log('al-Kashif entries geocoded:', geocoded, 'of', meta.count);

  const locations = {}; // norm -> city id (string)
  const provenance = {};
  let viaKashif = 0;

  for (const [n] of candidates) {
    const toks = n.split(' ');
    if (toks.length < 2) continue; // bare names go through context rules
    const skel = latinSkeleton(n);
    if (skel.length < 2) continue;
    const matches = register.filter((r) => isSubsequence(skel, r.skel));
    if (!matches.length) continue;
    const cities = new Map();
    for (const m of matches) cities.set(m.city, (cities.get(m.city) ?? 0) + 1);
    const top = [...cities.entries()].sort((a, b) => b[1] - a[1])[0];
    const share = top[1] / matches.length;
    if ((matches.length === 1 || share >= 0.9) && top[1] >= 1) {
      locations[n] = top[0];
      provenance[n] = { via: 'kashif', matches: matches.length, sample: matches[0].name.slice(0, 60) };
      viaKashif++;
    }
  }
  console.log('located via al-Kashif skeleton match:', viaKashif);

  /* layer C: dominant expansions for bare names (variant-transmission, aggregate) */
  let viaExpansion = 0;
  for (const [n, count] of candidates) {
    if (locations[n]) continue;
    const toks = n.split(' ');
    if (toks.length !== 1) continue;
    const token0 = toks[0].replace(/^al-/, '');
    const exps = expansions.get(token0);
    if (!exps) continue;
    const located = [...exps.values()].filter((e) => e.city >= 0);
    const total = located.reduce((a, e) => a + e.count, 0);
    if (total < 10) continue;
    const byCity = new Map();
    for (const e of located) byCity.set(e.city, (byCity.get(e.city) ?? 0) + e.count);
    const top = [...byCity.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top[1] / total >= 0.85) {
      locations[n] = CITIES[top[0]][0];
      provenance[n] = { via: 'expansion', share: +(top[1] / total).toFixed(2), of: total, freq: count };
      viaExpansion++;
    }
  }
  console.log('located via dominant expansion:', viaExpansion);

  /* layer C2: per-context rules for still-ambiguous bare names */
  const contextRules = {};
  let rules = 0;
  for (const [key, m] of contexts) {
    const token0 = key.split('|')[0];
    if (locations[token0]) continue; // already resolved context-free
    const exps = expansions.get(token0);
    if (!exps) continue;
    // candidate identities = located expansions of this token seen with this neighbour anywhere
    // simpler high-precision rule: among located expansions of token0, pick the city that
    // dominates (>=80%) within chains sharing this neighbour. We approximate by checking
    // whether the neighbour string itself appears in our located corpus pairs.
    void m;
    void exps;
    void rules;
    break; // placeholder: refined per-pair mining below
  }

  // Refined context mining: second pass over corpus, this time recording, for every
  // located multi-token name, its neighbours, keyed the same way bare names were.
  const pairCity = new Map(); // `${token0}|side|${neighbour}` -> Map(cityIdx -> count)
  for (const f of files) {
    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(HADITH_DIR, f), 'utf8'),
      crlfDelay: Infinity
    });
    let header = null;
    const idx = {};
    for await (const line of rl) {
      if (!header) {
        header = line.split('\t');
        header.forEach((h, i) => (idx[h] = i));
        continue;
      }
      const c = line.split('\t');
      if (c[idx.doctype] !== 'hadith') continue;
      let chain = c[idx.chain_en];
      if (isNull(chain)) continue;
      chain = chain.split(/\[Chain \d+\]/).map((s) => s.trim()).filter(Boolean)[0] || '';
      const names = chain.split('>').map((s) => s.trim()).filter((s) => s.length > 1);
      const norms = names.map(normName);
      for (let i = 0; i < norms.length; i++) {
        const n = norms[i];
        const toks = n.split(' ');
        if (toks.length < 2) continue;
        const city = detectCity(names[i]);
        const c2 = city >= 0 ? city : locations[n] !== undefined ? cityIdx.get(locations[n]) : -1;
        if (c2 === undefined || c2 < 0) continue;
        const token0 = toks[0].replace(/^al-/, '');
        const teacher = norms[i + 1];
        const student = norms[i - 1];
        for (const [side, nb] of [['t', teacher], ['s', student]]) {
          if (!nb) continue;
          const key = `${token0}|${side}|${nb}`;
          if (!contexts.has(key)) continue; // only contexts where a bare name actually occurs
          let m = pairCity.get(key);
          if (!m) pairCity.set(key, (m = new Map()));
          m.set(c2, (m.get(c2) ?? 0) + 1);
        }
      }
    }
  }

  rules = 0;
  for (const [key, m] of pairCity) {
    const total = [...m.values()].reduce((a, b) => a + b, 0);
    if (total < 3) continue;
    const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top[1] / total >= 0.8) {
      contextRules[key] = CITIES[top[0]][0];
      rules++;
    }
  }
  console.log('context rules (bare name + neighbour):', rules);

  /* curated seeds: very frequent figures outside al-Kashif's scope
     (post-six-books transmitters in Bayhaqi, Hakim, Tabarani chains)
     plus famous kunyas the layers above cannot disambiguate mechanically */
  const SEEDS = {
    'abu al-abbas muhammad b. yaqub': 'nishapur', // al-Asamm, al-Hakim's main shaykh
    'abu abdullah al-hafiz': 'nishapur', // al-Hakim al-Naysaburi himself
    'abu bakr b. ishaq': 'nishapur',
    'abu bakr muhammad b. al-husayn b. fawrak': 'isfahan',
    'ali b. abd al-aziz': 'mecca', // al-Baghawi, Tabarani's main shaykh
    'abu al-zubayr': 'mecca', // M. b. Muslim b. Tadrus
    'abu salamah': 'medina', // Abu Salama b. Abd al-Rahman
    'abu sufyan': 'mecca',
    'anas': 'basra', // Anas b. Malik
    'abu hazim': 'medina',
    'amrah': 'medina',
    'al-zubaydi': 'homs',
    'safwan b. amr': 'homs',
    'damrah b. rabiah': 'ramla',
    'adam': 'ascalon', // Adam b. Abi Iyas in Bukhari chains
    'abu asim': 'basra', // al-Dahhak b. Makhlad
    'abu amir al-aqadi': 'basra',
    'rawh': 'basra', // Rawh b. Ubada
    'bishr b. al-mufaddal': 'basra',
    'yazid b. zuray': 'basra',
    'abd al-samad': 'basra',
    'abu al-walid': 'basra', // al-Tayalisi
    'sulayman b. harb': 'basra',
    'abu al-nadr': 'baghdad', // Hashim b. al-Qasim
    'aswad b. amir': 'baghdad',
    'hajjaj': 'baghdad', // Hajjaj b. Muhammad al-Awar
    'husayn b. muhammad': 'baghdad',
    'abu dawud al-hafari': 'kufa',
    'qabisah': 'kufa',
    'abu ahmad al-zubayri': 'kufa',
    'muawiyah b. amr': 'baghdad',
    'yala b. ubayd': 'kufa',
    'jafar b. awn': 'kufa',
    'amr b. awn': 'basra'
  };
  let viaSeeds = 0;
  for (const [n, city] of Object.entries(SEEDS)) {
    if (!locations[n]) {
      locations[n] = city;
      provenance[n] = { via: 'seed' };
      viaSeeds++;
    }
  }
  console.log('located via curated seeds:', viaSeeds);

  /* write outputs */
  fs.writeFileSync(path.join(__dirname, 'narrator-locations.json'), JSON.stringify(locations, null, 1));
  fs.writeFileSync(path.join(__dirname, 'narrator-context-rules.json'), JSON.stringify(contextRules, null, 1));

  const remaining = candidates.filter(([n]) => !locations[n]).slice(0, 80);
  fs.writeFileSync(
    path.join(__dirname, 'identify-report.json'),
    JSON.stringify(
      {
        candidates: candidates.length,
        viaKashif,
        viaExpansion,
        contextRules: rules,
        kashifGeocoded: geocoded,
        topRemaining: remaining.map(([n, c]) => ({ name: display.get(n), count: c }))
      },
      null,
      1
    )
  );
  console.log('top remaining unlocated:', remaining.slice(0, 12).map(([n, c]) => `${n} (${c})`).join(' | '));
})();
