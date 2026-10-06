"""Bring the bespoke figure CSS inside articles into the reading system.

Forty-six articles carry their own <style> block for hand-built figures
(openings, route cards, matrices). They were written for the earlier
geometric sans and the "desk" layout: drop-shadow glows, radial glow layers,
tight negative tracking, 800-weight labels and display sizes up to 4rem
inside a 43rem column. This rewrites only declarations inside
`<style>{`...`}</style>` blocks; article prose and markup are not touched.

  - box-shadow: removed unless it is an inset (inset shadows draw rules)
  - radial-gradient layers: removed from a background that has other
    layers (a lone radial gradient is a marker or chart, and is kept)
  - letter-spacing tighter than -0.015em: set to -0.01em
  - font-weight 800/900: set to 600
  - clamp() font sizes above 2.6rem: maximum capped at 2.6rem
  - unitless line-height below 1: raised to 1.05 (serif lines collided)

Usage: python scripts/codemods/article-figure-styles.py [--write]
"""
import glob
import re
import sys

WRITE = '--write' in sys.argv
STYLE_BLOCK = re.compile(r'(<style>\{`)(.*?)(`\}</style>)', re.S)


def split_layers(value):
    layers, depth, current = [], 0, ''
    for ch in value:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ',' and depth == 0:
            layers.append(current)
            current = ''
        else:
            current += ch
    layers.append(current)
    return layers


def fix_background(match, stats):
    prop, value = match.group(1), match.group(2)
    layers = split_layers(value)
    kept = [l for l in layers if not l.strip().startswith('radial-gradient(')]
    if len(kept) == len(layers) or not kept:
        return match.group(0)
    stats['radial'] += len(layers) - len(kept)
    joined = ','.join(kept).lstrip('\n')
    if not joined.startswith((' ', '\n')):
        joined = ' ' + joined.strip()
    return f'{prop}:{joined};'


def fix_css(css, stats):
    def shadow(m):
        if 'inset' in m.group(1):
            return m.group(0)
        stats['shadow'] += 1
        return ''
    css = re.sub(r'[ \t]*box-shadow:([^;{}]*);[ \t]*\n?', shadow, css)
    css = re.sub(r'(background(?:-image)?)\s*:([^;{}]*);', lambda m: fix_background(m, stats), css)

    def spacing(m):
        if float(m.group(1)) < -0.015:
            stats['tracking'] += 1
            return 'letter-spacing: -0.01em'
        return m.group(0)
    css = re.sub(r'letter-spacing:\s*(-0?\.\d+)em', spacing, css)

    def weight(m):
        stats['weight'] += 1
        return 'font-weight: 600'
    css = re.sub(r'font-weight:\s*[89]00', weight, css)

    def size(m):
        top = float(m.group(3))
        if top <= 2.6:
            return m.group(0)
        stats['size'] += 1
        low = m.group(1).strip()
        low_val = re.match(r'([\d.]+)rem', low)
        if low_val and float(low_val.group(1)) > 2.6:
            low = '2.2rem'
        return f'font-size: clamp({low},{m.group(2)}, 2.6rem)'
    css = re.sub(r'font-size:\s*clamp\(([^,]+),([^,]+),\s*([\d.]+)rem\)', size, css)

    def leading(m):
        stats['leading'] += 1
        return 'line-height: 1.05'
    css = re.sub(r'line-height:\s*0?\.\d+(?=\s*[;}])', leading, css)
    return css


total = {'shadow': 0, 'radial': 0, 'tracking': 0, 'weight': 0, 'size': 0, 'leading': 0}
touched = 0
for path in sorted(glob.glob('src/content/articles/**/*.mdx', recursive=True)):
    raw = open(path, 'rb').read().decode('utf-8')
    stats = {k: 0 for k in total}
    new = STYLE_BLOCK.sub(lambda m: m.group(1) + fix_css(m.group(2), stats) + m.group(3), raw)
    if new != raw:
        touched += 1
        for k in total:
            total[k] += stats[k]
        if WRITE:
            open(path, 'w', encoding='utf-8', newline='').write(new)
print(('wrote' if WRITE else 'would change'), touched, 'articles', total)
