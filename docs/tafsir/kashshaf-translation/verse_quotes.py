"""Report Qur'an quotations in a source that do not use Khalifa's wording.

    python verse_quotes.py 50 [51 ...]      one report per sura
    python verse_quotes.py 50-79 --summary  counts only

Three kinds of quotation are checked against the Khalifa JSON that render.py
uses:

  label   the English of a {L|English|translit} lemma label
  verse   a "*...*" quotation inside a passage that shares words with the
          verses of that passage (or of the sura) and is not in Khalifa
  ref     a "*...*" quotation followed by (Q s:v) or (Q s:v-w)

A quotation passes when its words, lowercased and stripped of punctuation,
appear in that order and unbroken in Khalifa's text of the verses concerned.
Quotations that share few words with any verse (hadith, poetry, sayings) are
not reported.
"""
import argparse
import unicodedata
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from render import QURAN_JSON, load_quran  # noqa: E402

PASSAGE = re.compile(r'^::: passage (\d+):(\d+)-(\d+) \| \d+:\d+-\d+$')
LABEL = re.compile(r'\{L\|([^|]+)\|([^}]+)\}')
QUOTE = re.compile(r'“\*([^*]+)\*[^”]{0,3}”(\s*\((?:\*[^*]+\*,\s*(?:“[^”]*,”\s*)?)?Q (\d+):(\d+)(?:[–-](\d+))?\))?')  # ref may carry (*translit*, “literal,” Q x:y)
STOP = set('a an the and of to in on for is are be was were it its they them their he his him'
           ' we our us you your i me my that this which who what not no by with as at from or'
           ' so then but if all do did has have had will shall'.split())


def words(text):
    text = unicodedata.normalize('NFKD', text.lower().replace('’', "'").replace('±', ''))
    text = ''.join(c for c in text if not unicodedata.combining(c)).replace('ʾ', '').replace('ʿ', '')
    text = re.sub(r"[^a-z0-9' ]+", ' ', text.replace('-', ' '))
    return [w.strip("'") for w in text.split() if w.strip("'")]


def contains(hay, needle):
    n = len(needle)
    return n == 0 or any(hay[i:i + n] == needle for i in range(len(hay) - n + 1))


def overlap(quote, hay):
    content = [w for w in quote if w not in STOP]
    if not content:
        return 0.0
    pool = set(hay)
    return sum(w in pool for w in content) / len(content)


def verse_words(quran, s, lo, hi):
    out = []
    for v in range(lo, hi + 1):
        row = quran.get((s, v))
        if row:
            out += words(row['english'])
    return out


def check(path, quran, threshold):
    surah = int(path.stem)
    sura_words = verse_words(quran, surah, 1, 300)
    found = []
    span = None
    for n, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        m = PASSAGE.match(line)
        if m:
            span = tuple(map(int, m.groups()))
            continue
        if span is None:
            continue
        s, lo, hi = span
        own = verse_words(quran, s, lo, hi)
        for lm in LABEL.finditer(line):
            q = words(lm.group(1))
            if not contains(own, q):
                found.append((n, 'label', lm.group(1) + ' | ' + lm.group(2), f'{s}:{lo}-{hi}'))
        for qm in QUOTE.finditer(line):
            q = words(qm.group(1))
            if qm.group(2):
                rs, rv, rw = int(qm.group(3)), int(qm.group(4)), qm.group(5)
                ref = verse_words(quran, rs, rv, int(rw) if rw else rv)
                if not contains(ref, q):
                    found.append((n, 'ref', qm.group(1), f'{rs}:{rv}' + (f'-{rw}' if rw else '')))
            elif not contains(sura_words, q) and (
                    overlap(q, own) >= threshold or line[qm.end():qm.end() + 1] == ':'
                    or line[qm.end():qm.end() + 3] == ' (*'):
                after = line[qm.end():qm.end() + 50]
                found.append((n, 'verse', qm.group(1) + ' ~~ ' + after, f'{s}:{lo}-{hi}'))
    return found


def show(quran, where):
    s, rest = where.split(':')
    lo, _, hi = rest.partition('-')
    lo, hi = int(lo), int(hi or lo)
    return ' '.join(f'({v}) ' + quran[(int(s), v)]['english'].replace('±', '')
                    for v in range(lo, hi + 1) if (int(s), v) in quran)


def expand(args):
    out = []
    for a in args:
        if '-' in a:
            lo, hi = map(int, a.split('-'))
            out += range(lo, hi + 1)
        else:
            out.append(int(a))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('suras', nargs='+')
    ap.add_argument('--summary', action='store_true')
    ap.add_argument('--threshold', type=float, default=0.3)
    ap.add_argument('--kind', choices=['label', 'verse', 'ref'])
    ap.add_argument('--quran', default=str(QURAN_JSON))
    args = ap.parse_args()
    quran = load_quran(args.quran)
    total = 0
    for s in expand(args.suras):
        path = HERE / 'sources' / f'{s}.md'
        if not path.exists():
            continue
        found = [f for f in check(path, quran, args.threshold) if not args.kind or f[1] == args.kind]
        total += len(found)
        if args.summary:
            kinds = {k: sum(f[1] == k for f in found) for k in ('label', 'verse', 'ref')}
            print(s, kinds)
            continue
        shown = set()
        for n, kind, text, where in found:
            if where not in shown:
                shown.add(where)
                print(f'== {where}: ' + show(quran, where))
            print(f'{n} {kind} {text}')
    print('total', total)


if __name__ == '__main__':
    main()
