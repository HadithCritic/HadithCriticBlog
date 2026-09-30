"""Cross-check the form label of each Taḥbīr group against the form an-Nashr gives the same readers.

Only three families are compared, because they can be read off a label without understanding it: the person
(yāʾ, tāʾ, nūn), the case (rafʿ, naṣb, khafḍ, jazm) and the doubling (tashdīd, takhfīf). It needs
second-witness/nashr-compare-auto.json, so run nashr-compare.py first. Run from the repository root.
"""
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, 'scripts/quran/qiraat')
import importlib.util
spec = importlib.util.spec_from_file_location('nc', 'scripts/quran/qiraat/nashr-compare.py'); nc = importlib.util.module_from_spec(spec); spec.loader.exec_module(nc)
wc = nc.wc
FAM = {
 'person': {'yaa': r'(?:بالياء|باليا|بياء|على التذكير|بالغيب)', 'taa': r'(?:بالتاء|بالتا\b|بتاء|على التأنيث|على التانيث|بالخطاب)', 'noon': r'(?:بالنون|بنون)'},
 'case': {'raf': r'(?:بالرفع|برفع)', 'nasb': r'(?:بالنصب|بنصب)', 'khafd': r'(?:بالخفض|بخفض|بالجر)', 'jazm': r'(?:بالجزم|بجزم)'},
 'shadda': {'shadd': r'(?:بالتشديد|بتشديد|مشددا|مثقلا)', 'khaff': r'(?:بالتخفيف|بتخفيف|مخففا)'},
}
def fam_values(text):
    t = wc.fold(text)
    out = {}
    for fam, d in FAM.items():
        hits = {k for k, pat in d.items() if re.search(wc.fold(pat), t)}
        if len(hits) == 1: out[fam] = next(iter(hits))
    return out
N = json.load(open('docs/research/quran-platform/qiraat/second-witness/nashr-compare-auto.json', encoding='utf8'))
cache = {}
flags = []
COMPARED = []
for x in N['items']:
    if x['status'] != 'agree': continue
    s = x['sura']
    if s not in cache: cache[s] = json.load(open(f'src/data/qiraat/sura-{s:03d}.json', encoding='utf8'))
    f = next(ft for ft in cache[s]['features'] if ft['id'] == x['feature'])
    part = wc.tahbir_partition(f)
    for c in x['nashr_clauses']:
        if c['rest'] or not c['readers']: continue
        groups = {part[r] for r in c['readers'] if r in part}
        if len(groups) != 1: continue
        g = f['groups'][next(iter(groups))]
        label = ' '.join(filter(None, [g.get('value_label') or '', ' '.join(cl['quote'] for cl in g.get('claims', [])[:0])]))
        # Nashr form text = clause text up to 90 chars
        nv = fam_values(c['text'][:90])
        tv = fam_values(g.get('value_label') or '')
        comp = [fam for fam in nv if fam in tv]
        COMPARED.append(len(comp))
        bad = [fam for fam in nv if fam in tv and nv[fam] != tv[fam]]
        if bad:
            flags.append((x['feature'], f['lemma'], bad, nv, tv, g.get('value_label'), c['text'][:100]))
print(len(flags))
for fl in flags: print(fl[0], fl[1], '|', fl[2], fl[3], fl[4], '|', fl[5], '|', fl[6])

print('clauses', len(COMPARED), 'with a comparable family', sum(1 for c in COMPARED if c))
