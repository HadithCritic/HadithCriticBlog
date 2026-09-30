"""Cross-check the form label of each Taḥbīr group against the form al-Mabsūṭ gives the same readers (person, case, doubling).

Needs second-witness/compare-auto.json, so run witness-compare.py first. Run from the repository root.
"""
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, 'scripts/quran/qiraat')
import importlib.util
spec = importlib.util.spec_from_file_location('wc', 'scripts/quran/qiraat/witness-compare.py'); wc = importlib.util.module_from_spec(spec); spec.loader.exec_module(wc)
FAM = {
 'person': {'yaa': r'(?:باليا|بالياء|باليا|بيا)', 'taa': r'(?:بالتا|بالتاء|بتا\b)', 'noon': r'(?:بالنون|بنون)'},
 'case': {'raf': r'(?:بالرفع|برفع|مرفوع)', 'nasb': r'(?:بالنصب|بنصب|منصوب)', 'khafd': r'(?:بالخفض|بخفض|بالجر|مخفوض)', 'jazm': r'(?:بالجزم|بجزم|مجزوم)'},
 'shadda': {'shadd': r'(?:مشدد|بالتشديد|بتشديد)', 'khaff': r'(?:مخفف|بالتخفيف|بتخفيف)'},
}
def fold_pat(p): return wc.fold(p)
def fam_values(text):
    t = wc.fold(text)
    out = {}
    for fam, d in FAM.items():
        hits = {k for k, pat in d.items() if re.search(fold_pat(pat), t)}
        if len(hits) == 1: out[fam] = next(iter(hits))
    return out
def tvals(label):
    t = wc.fold(label)
    out = {}
    for fam, d in {
      'person': {'yaa': r'(?:بالياء|بياء)', 'taa': r'(?:بالتاء|بتاء)', 'noon': r'(?:بالنون|بنون)'},
      'case': {'raf': r'(?:بالرفع|برفع)', 'nasb': r'(?:بالنصب|بنصب)', 'khafd': r'(?:بالخفض|بخفض|بالجر)', 'jazm': r'(?:بالجزم|بجزم)'},
      'shadda': {'shadd': r'(?:بالتشديد|بتشديد|مشددا|مثقلا)', 'khaff': r'(?:بالتخفيف|بتخفيف|مخففا)'}}.items():
        hits = {k for k, pat in d.items() if re.search(wc.fold(pat), t)}
        if len(hits) == 1: out[fam] = next(iter(hits))
    return out
N = json.load(open('docs/research/quran-platform/qiraat/second-witness/compare-auto.json', encoding='utf8'))
cache = {}; flags = []; comp = 0
for x in N['items']:
    if x['status'] not in ('agree', 'partial'): continue
    s = x['sura']
    if s not in cache: cache[s] = json.load(open(f'src/data/qiraat/sura-{s:03d}.json', encoding='utf8'))
    f = next(ft for ft in cache[s]['features'] if ft['id'] == x['feature'])
    part = wc.tahbir_partition(f)
    for c in x.get('mabsut_clauses', []):
        if c['rest'] or not c['readers']: continue
        groups = {part[r] for r in c['readers'] if r in part}
        if len(groups) != 1: continue
        g = f['groups'][next(iter(groups))]
        nv = fam_values(c['text'])
        tv = tvals(g.get('value_label') or '')
        cf = [k for k in nv if k in tv]
        if cf: comp += 1
        bad = [k for k in cf if nv[k] != tv[k]]
        if bad: flags.append((x['feature'], f['lemma'], bad, nv, tv, g.get('value_label'), c['text'][:110]))
print('compared', comp, 'flags', len(flags))
for fl in flags: print(fl[0], fl[1], fl[2], fl[3], fl[4], '|', fl[5], '|', fl[6])
