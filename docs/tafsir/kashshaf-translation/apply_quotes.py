"""Apply line-exact quotation edits to a source.

    python apply_quotes.py 50 edits.txt

Each edit line is  N: old => new  where N is the source line number. The old
text must occur on that line; every occurrence on the line is replaced.
"""
import sys
from pathlib import Path

HERE = Path(__file__).parent


def main(sura: str, edits_path: str) -> None:
    path = HERE / 'sources' / f'{sura}.md'
    lines = path.read_text(encoding='utf-8').split('\n')
    failed = []
    for raw in Path(edits_path).read_text(encoding='utf-8').splitlines():
        if not raw.strip() or raw.startswith('#'):
            continue
        num, _, rest = raw.partition(': ')
        old, sep, new = rest.partition(' => ')
        i = int(num) - 1
        if not sep or old not in lines[i]:
            failed.append(raw)
            continue
        lines[i] = lines[i].replace(old, new)
    path.write_text('\n'.join(lines), encoding='utf-8')
    for f in failed:
        print('NOT APPLIED:', f)
    print(f'{sura}: done, {len(failed)} not applied')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
