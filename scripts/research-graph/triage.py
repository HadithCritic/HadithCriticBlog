import csv
import json
import re
from collections import Counter, defaultdict

rows = [json.loads(l) for l in open('scan.jsonl', encoding='utf-8')]

def stem(r):
    return r['file'][:-4]

# Curated from reading front matter. Filenames are matched as substrings of the stem.
CORE_INCLUDE = [
    'Hilali_A', 'Hallaq_W_-_The_Authenticity', 'Reinhart_A', 'Juynboll_G', 'Schacht_J', 'Goldziher',
    'Azmi_M_M', 'Cook_M_-_The_Opponents', 'Cook_M_-_The_Stemma', 'Gledhill', 'Sadeghi_B_-_The_Traveling',
    'Sadeghi_B_-_The_Authenticity', 'Motzki', 'Gorke', 'Görke', 'Schoeler', 'Pavlovitch', 'Abu-Alabbas',
    'Brown_J_', 'Brown_J_A', 'Brown_D_W', 'Dickinson_E_-_The_Development', 'Dutton_Y', 'Kose_S',
    'Su_I_', 'Aerts_S', 'Lucas_S_C', 'Mitter_U', 'Little_J_-_The_Hadith', 'Little_J_J_-_Patricia',
    'Little_J_Where', 'Bednarkiewicz', 'Lecker_M_-_Biographical_Notes', 'Boekhoff', 'Rajani',
    'Shah_M_ed', 'Koya_P_K', 'al-Khatib_M', 'Duderija', 'Fishman_T', 'Burton_J_-_The_Sources',
    'Calder_N_-_Studies', 'Wymann-Landgraf', 'El_Shamsy', 'Lindsay_J', 'Melchert_C_-_Bukhari',
    'Melchert_C_-_Traditionist', 'Melchert_Christopher_-_The_Theory', 'Melchert_C_-_Counting',
    'Melchert_C_-_Piety_of_the_Hadith', 'Melchert_C_-_The_Piety', 'Melchert_C_-_How_to_Cite',
    'Melchert_C_-_The_Musnad', 'Melchert_C_-_Early_Renunciants', 'Melchert_C_-_The_Life_and_Works',
    'Melchert_C_-_Review_of_Abd_al-Rahman', 'Melchert_C_-_Khargushi', 'Melchert_C_-_The_Biography_of_Muhammad_ibn',
    'Melchert_C_-_Ahmad_ibn_Hanbal_Makers', 'Melchert_C_-_Ahmad_Ibn_Hanbal_and', 'Melchert_C_-_Ahmad_Ibn_Hanbal_s',
    'Melchert_C_-_The_Formation_of_the_Sunni', 'Melchert_C_-_Sectaries', 'Melchert_C_-_Ibn_Mujahid',
    'Ibn_Ahmad_ibn_Hanbal_A_-_Kitab_al-Sunnah', 'Wensinck', 'Guillaume_A_-_Traditions', 'Guillaume_A_-_The_Traditions',
    'Griffith_H_-_The_Sunna', 'Abbott_N', 'Robinson_C_-_Islamic_Historiography', 'Noth_A',
]
EXCLUDE = [
    'van_Putten', 'Nasser_S_H', 'Kulinich', 'Bonner_M', 'Webb_P', 'Kara_S', 'Ahmed_S', 'Holtzman',
    'Zychowicz', 'Rubin_U', 'Shoemaker_S_-_Christmas', 'Shoemaker_S_-_Muhammad_and', 'Shoemaker_S_J_-_Christmas',
    'Sijpesteijn', 'Delattre', 'Berg_H', 'Inloes', 'Clarke_L', 'Gril_D', 'Motzki_H_-_Abraham_Hagar_XX',
    'Haider_N', 'Hienz', 'Jacobs_B', 'Goodenough', 'Lange_C', 'Chih_R', 'Van_Steenbergen', 'Winter_T',
    'Robinson_N', 'Daneshgar', 'Wheeler', 'Karimi', 'Roohi', 'Hanif', 'Firestone', 'Barakat', 'Makin',
    'Yadgar', 'Guenther', 'Lindstedt_I_-_Muhajirun', 'Toral', 'Hoover', 'El-Tobgui', 'Brockett', 'Peters_F',
    'Noldeke', 'Lindermann', 'Alajmi', 'Anthony_S_-_Keys', 'Anthony_S_-_Two_Lost', 'Reynolds_G',
    'Melchert_C_-_The_Early_Controversy', 'Melchert_C_-_Variant', 'Melchert_C_-_The_Variant', 'Melchert_C_-_The_Concluding',
    'Melchert_C_-_Early_Hanbali_Creeds', 'Melchert_C_-_Ibrahim', 'Melchert_C_-_Al-Shafi_i_Against',
    'Melchert_C_-_Kitab_al-Hujjah', 'Melchert_C_-_Basra_and_Kufa', 'Melchert_C_-_Sufyan', 'Melchert_C_-_How_Hanafism',
    'Melchert_C_-_The_Early_Hanafiyya', 'Melchert_C_-_Shaybani', 'Melchert_C_-_Mawardi', 'Melchert_C_-_Renunciation',
    'Melchert_C_-_Religious', 'Melchert_C_-_Exaggerated', 'Melchert_C_-_Origins_and_Early', 'Melchert_C_-_Basran',
    'Melchert_C_-_Sufis', 'Melchert_C_-_The_Adversaries', 'Melchert_C_-_The_Etiquette', 'Melchert_C_-_The_Hanabila',
    'Melchert_C_-_The_Hanbali_Law', 'Melchert_C_-_The_History_of_the_Judicial', 'Melchert_C_-_Whether',
    'Melchert_C_-_Why_Non', 'Melchert_C_-_Renunciants', 'Melchert_C_-_Review_of_P', 'Melchert_C_-_Review_of_Rudolph',
    'Melchert_C_-_Review_of_The', 'Melchert_C_-_Review_of_Yasin', 'Melchert_Christopher_-_Shaybani',
]
# Adjacent: early legal history, source criticism of sira/maghazi, origins historiography, canon comparisons.
ADJACENT_INCLUDE = [
    'Melchert_C_-_', 'Crone_P', 'Crone_Patricia', 'Hawting', 'Donner', 'Calder_N', 'Hallaq', 'Cook_M', 'Lecker_M',
    'Shoemaker_S_-_In_Search', 'Shoemaker_S_-_Death', 'Rubin_U_-_The_Eye', 'Ahmed_S', 'Holtzman', 'Hoyland_R_-_Writing',
    'Hoyland_R_-_Seeing', 'Robinson_C', 'Noth_A', 'Sinai_N_-_The_Quran_A_Historical', 'Sadeghi_B_-_Islamic_Cultures',
    'Burton_-_The_Collection', 'Wansbrough', 'Watt_W_M', 'Rodinson', 'Kennedy_Hugh', 'Kister_M', 'Gilliot_C',
    'Lindstedt_I_-_Early_Muslim', 'Lindstedt_I_-_Muhammad_and_His', 'Anthony_S', 'Powers_D', 'Zychowicz',
    'Elad_A', 'Brockopp', 'Tabari', 'Ibn_Ishaq', 'Guillaume_A_trans', 'Sprenger', 'Wellhausen', 'Madelung',
    'Hussein_T', 'Holtzman', 'Su_I_', 'Alajmi', 'Sijpesteijn_P_M_and_Adang', 'Nasser_S_H_-_The_Second',
    'Dawood', 'Sirry', 'Mortensen', 'Reynolds_G_-_Remembering', 'Reynolds_G_ed', 'Marsham', 'Dost_S', 'Berg_H',
]

def match(name, keys):
    return any(k in name for k in keys)

OVERRIDE = {'Pavlovitch_P_-_Pre-islamic': 'C', 'Abbott_N': 'B', 'Noth_A': 'B', 'Robinson_C_-_Islamic_Historiography': 'B', 'Ibn_Ahmad_ibn_Hanbal': 'B', 'Griffith_H_-_The_Sunna': 'B', 'Melchert_C_-_Ibn_Mujahid': 'B'}

OA = re.compile(r'open access|creative commons|CC[ -]BY|cc by', re.I)
SUB = [
    ('dating-and-common-link', r'dating|common[ -]link|traveling tradition|isn[aā]d[- ]cum[- ]matn|isnad[- ]cum'),
    ('isnad-origins', r'origin of the isn|isn[aā]d\b'),
    ('rijal-jarh-tadil', r'rij[aā]l|jar[hḥ]|ta[ʿ\']?d[iī]l|biographical'),
    ('matn-criticism', r'matn'),
    ('canonization-collections', r'canoniz|musnad|mu[sṣ]annaf|sunan|collections|six books|tahdh[iī]b|abu dawud|bukh[aā]r'),
    ('authenticity-and-skepticism', r'authentic|forger|skeptic|revaluation|reliab|fabricat'),
    ('legal-hadith', r'legal|jurisprud|schools of law|fiqh|law\b'),
    ('sira-maghazi-sources', r's[iī]ra|maghaz|urwa|zuhr|life of (the prophet|muhammad)|biography of'),
    ('shii-hadith', r'shi[ʿ\']?i|twelver|imam'),
    ('historiography', r'histor|annals|narratives'),
]

def subtopic(r):
    hay = (stem(r) + ' ' + r['front'][:600]).lower()
    for name, rx in SUB:
        if re.search(rx, hay, re.I):
            return name
    return 'general'

def author_of(r):
    base = stem(r).split('_-_')[0]
    base = re.sub(r'_(ed|eds|e_a|et_al|trans|ed_and_trans)(_|$)', ' ', base)
    return re.sub(r'_', ' ', base).strip()

# duplicate detection: same front text, or _v2 / alt_ variants
front_seen = {}
dupe_of = {}
for r in sorted(rows, key=lambda r: (r['file'].startswith('alt_'), '_v2' in r['file'], r['file'])):
    key = re.sub(r'\W+', '', r['front'][:400]).lower()
    if key and len(key) > 80 and key in front_seen and r['has_text']:
        dupe_of[r['file']] = front_seen[key]
    elif key and len(key) > 80:
        front_seen[key] = r['file']
for r in rows:
    if r['file'].endswith('_v2.pdf'):
        base = r['file'][:-7] + '.pdf'
        if any(x['file'] == base for x in rows):
            dupe_of.setdefault(r['file'], base)

out = []
for r in rows:
    s = stem(r)
    if match(s, EXCLUDE) and not match(s, ['Melchert_C_-_The_Piety']):
        tier = 'B' if r['core_density'] >= 0.75 or match(s, ['Melchert_C_-', 'Kulinich']) else 'C'
        if match(s, ['Melchert_C_-']) and 'Melchert_C_-_The_Musnad' not in s:
            tier = 'B'
    elif match(s, CORE_INCLUDE) or r['core_density'] >= 3.0:
        tier = 'A'
    elif match(s, ADJACENT_INCLUDE) or r['core_density'] >= 0.75:
        tier = 'B'
    else:
        tier = 'C'
    # scanned files cannot be scored by density: keep them if the name matched a list, else C
    for k, v in OVERRIDE.items():
        if k in s:
            tier = v
    r['tier'] = tier
    r['subtopic'] = subtopic(r) if tier in ('A', 'B') else ''
    r['author'] = author_of(r)
    r['oa'] = bool(OA.search(r['front'])) if r['has_text'] else False
    r['dupe_of'] = dupe_of.get(r['file'], '')
    out.append(r)

with open('triage.csv', 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.writer(fh)
    w.writerow(['tier', 'subtopic', 'author', 'file', 'pages', 'year_guess', 'doi', 'has_text', 'needs_ocr', 'open_access_flag', 'duplicate_of', 'core_density'])
    order = {'A': 0, 'B': 1, 'C': 2}
    for r in sorted(out, key=lambda r: (order[r['tier']], r['subtopic'], r['author'], r['file'])):
        w.writerow([r['tier'], r['subtopic'], r['author'], r['file'], r['pages'], r['year_guess'], r['doi'], r['has_text'], not r['has_text'], r['oa'], r['dupe_of'], r['core_density']])

if __name__ == '__main__':
    tiers = Counter(r['tier'] for r in out)
    print('tiers', dict(tiers))
    for t in 'AB':
        sub = [r for r in out if r['tier'] == t]
        print(f'-- tier {t}: {len(sub)} files, {sum(1 for r in sub if not r["has_text"])} need OCR, {sum(1 for r in sub if r["dupe_of"])} dupes, {sum(1 for r in sub if r["oa"])} OA-flagged')
        print('   subtopics', dict(Counter(r['subtopic'] for r in sub).most_common()))
        print('   authors', Counter(r['author'] for r in sub).most_common(14))
    print('A needing OCR:')
    print('; '.join(r['file'][:-4][:50] for r in out if r['tier'] == 'A' and not r['has_text']))
    print('A with DOI:', sum(1 for r in out if r['tier'] == 'A' and r['doi']))
    print('Tier A files:')
    for r in sorted((r for r in out if r['tier'] == 'A'), key=lambda r: r['author']):
        print(('  *' if r['dupe_of'] else '   '), r['file'][:-4][:75])
