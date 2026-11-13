"""Check and typeset the English al-Kashshaf translation, one surah at a time.

    python docs/tafsir/kashshaf-translation/render.py [surah ...] [--quran PATH]
        [--arabic] [--check] [--no-pdf]

Reads sources/<surah>.md, checks it against style-guide.md, and writes
build/<surah>.docx and build/<surah>.pdf (the PDF through LibreOffice).
With no surah numbers it does every file in sources/. --check stops after the
checks. --arabic adds the Arabic of each passage above the English.

The verse blocks are not typed in the sources. They come from the Qur'an
file (--quran, default QURAN_JSON below): Rashad Khalifa's English, the
basmala row numbered 0 for each surah, and the Arabic. Passage ranges and
their first printed page are checked against ../al-kashshaf-verse-groupings.md.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

HERE = Path(__file__).resolve().parent
SOURCES = HERE / 'sources'
BUILD = HERE / 'build'
GROUPINGS = HERE.parent / 'al-kashshaf-verse-groupings.md'
QURAN_JSON = Path.home() / 'Downloads' / 'ws_quran_text_rows_arabic_english_only.json'
SOFFICE = Path('C:/Program Files/LibreOffice/program/soffice.exe')

TEXT_FONT = 'Brill'
ARABIC_FONT = 'Amiri'
QURAN_FONT = 'Amiri Quran'
BODY_PT = 12
LEADING_PT = 17
GRAY = RGBColor(0x6B, 0x6B, 0x6B)
# Honorific symbols (style guide §6). All but ﷺ are the standalone ligatures
# added in Unicode 14, so they are set in Noto Naskh Arabic, which has them all.
HONORIFIC_FONT = 'Noto Naskh Arabic'
HONORIFICS = 'ﷺ﵌﵆﵊﵇﵈﵉﵍﵁﵂﵃﵄﵅﵀﵏'
HONORIFIC_SPLIT = re.compile(f'([{HONORIFICS}])')
WRITTEN_OUT = re.compile(
    r'may God (be pleased|have mercy|bless)|peace be upon|God bless him|'
    r'صلى الله|رضي? الله|عليه السلام|رحمه الله', re.IGNORECASE)

LABELS = {'Q': 'If you ask:', 'A': 'I say:'}
OPENING_TAG = re.compile(r'^(\{p\|\d+\})?\{(L\||Q\}|From\|)')
TOKEN = re.compile(r'\{[^{}]*\}|\*\*\*|\*\*|\*')
PASSAGE = re.compile(r'^::: passage (\d+):(\d+)-(\d+) \| (\d):(\d+)-(\d+)$')
HEADING = re.compile(r'^::: heading (.+)$')
# "<status>. <Count> verses. [Revealed after <name> (<n>).]", where the status
# names Meccan or Medinan (it may qualify it), and an optional note may follow.
# Al-ʿAlaq (96) has no predecessor; its bracket says it was the first revealed.
REVELATION = re.compile(
    r'^(?P<status>[^.]*(?:Meccan|Medinan)[^.]*)\. (?P<count>[A-Z][a-z -]+) verses?(?:; it is also said [a-z -]+)?\. '
    r'\[(?:Revealed after [^\]]+ \((\d+)\)(?:; [^\]]+)?|It is the first of the Qurʾān to be revealed)\.\]'
    r'( [^\[\]]+\.)?$')
NUMBER_WORDS = {w: i for i, w in enumerate(
    'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen '
    'fifteen sixteen seventeen eighteen nineteen'.split())}
TENS = {w: 10 * i for i, w in enumerate('_ _ twenty thirty forty fifty sixty seventy eighty ninety'.split()) if w != '_'}


# ---------------------------------------------------------------- data

def load_quran(path):
    rows = json.loads(Path(path).read_text(encoding='utf-8'))
    return {(int(r['chapter_number']), int(r['verse_number'])): r for r in rows}


def load_groupings():
    pattern = re.compile(r'^\| (\d+):(\d+)(?:–(\d+))? \| (\d):(\d+) \|')
    found = {}
    for line in GROUPINGS.read_text(encoding='utf-8').splitlines():
        m = pattern.match(line)
        if m:
            s, lo, hi, vol, page = m.groups()
            found[(int(s), int(lo), int(hi or lo))] = (int(vol), int(page))
    return found


def parse_source(path):
    text = path.read_text(encoding='utf-8').replace('\r\n', '\n')
    head, _, body = text.partition('\n\n')
    meta = dict(line.split(': ', 1) for line in head.splitlines())
    blocks = [b.strip() for b in body.split('\n\n') if b.strip()]
    return meta, blocks


def words_to_int(phrase):
    total = 0
    for word in phrase.lower().replace('-', ' ').split():
        if word == 'hundred':
            total = total * 100 if total else 100
        elif word in TENS:
            total += TENS[word]
        elif word in NUMBER_WORDS:
            total += NUMBER_WORDS[word]
        elif word != 'and':
            return None
    return total


# ---------------------------------------------------------------- checks

def check_header(meta, surah, quran, problems):
    if not re.fullmatch(r'Sūrat .+ \((\d+)\)', meta.get('title', '')) or \
            not meta['title'].endswith(f'({surah})'):
        problems.append(f'title: expected "Sūrat <name> ({surah})", got "{meta.get("title")}"')
    m = REVELATION.match(meta.get('revelation', ''))
    if not m:
        problems.append('revelation: does not follow "Meccan; it is also said Medinan. '
                        'Six verses. [Revealed after <name> (<n>).]"')
        return
    count = sum(1 for (s, v) in quran if s == surah and v > 0)
    if words_to_int(m.group('count')) != count:
        problems.append(f'revelation: says "{m.group('count')}" verses, the Qur\'an file has {count}')


def check_passage(m, surah, groupings, problems):
    s, lo, hi, vol, p1, p2 = map(int, m.groups())
    if s != surah:
        problems.append(f'passage {s}:{lo}-{hi} is not in surah {surah}')
    where = groupings.get((s, lo, hi))
    if where is None:
        problems.append(f'passage {s}:{lo}-{hi} is not a heading in the groupings file')
    elif where != (vol, p1):
        problems.append(f'passage {s}:{lo}-{hi} starts on {where[0]}:{where[1]}, not {vol}:{p1}')
    if p2 < p1:
        problems.append(f'passage {s}:{lo}-{hi}: page range {p1}-{p2} runs backward')
    return (vol, p1, p2)


def check_paragraph(n, para, pages, problems):
    where = f'paragraph {n} ("{para[:40]}...")'
    plain = TOKEN.sub('', re.sub(r'\s*(\{[^{}]*\}\s*)+', ' ', para))
    for bad, why in (('"', 'straight double quote'), ("'", 'straight single quote'),
                     ('—', 'em dash'), ('  ', 'double space'), (' ,', 'space before comma'),
                     (' .', 'space before period'), ('«', 'guillemet (use curly quotes)')):
        if bad in plain:
            problems.append(f'{where}: {why}')
    unquoted = TOKEN.sub('', re.sub(r'“\*[^*]*\*', '', para))  # Qurʾān quotes keep Khalifa’s words
    written = WRITTEN_OUT.search(unquoted)
    if written:
        problems.append(f'{where}: honorific written out ("{written.group()}"); use its symbol')
    if re.search(rf'\w[{HONORIFICS}]', plain):
        problems.append(f'{where}: no space before an honorific symbol')
    tags = re.findall(r'\{([^{}]*)\}', para)
    for tag in tags:
        if not re.fullmatch(r'Q|A|p\|\d+|L\|[^|]+\|[^|]+|From\|[^|]+', tag):
            problems.append(f'{where}: unknown tag {{{tag}}}')
    opening = [t for t in tags if t == 'Q' or t.startswith(('L|', 'From|'))]
    if opening and not OPENING_TAG.match(para):
        problems.append(f'{where}: {{{opening[0]}}} must open the paragraph')
    if len(opening) > 1:
        problems.append(f'{where}: more than one opening tag; start a new paragraph')
    if tags.count('Q') != tags.count('A') or ('A' in tags and 'Q' not in tags):
        problems.append(f'{where}: every {{Q}} needs one {{A}} after it in the same paragraph')
    stars = TOKEN.findall(re.sub(r'\{[^{}]*\}', '', para))
    if sum(len(s) for s in stars) % 2:
        problems.append(f'{where}: unbalanced * emphasis')
    for page in re.findall(r'\{p\|(\d+)\}', para):
        pages.append((int(page), where))


def check_pages(spans, pages, problems):
    last = 0
    for page, where in pages:
        if page <= last:
            problems.append(f'{where}: page marker {page} does not follow {last}')
        if not any(p1 < page <= p2 for _, p1, p2 in spans):
            problems.append(f'{where}: page marker {page} is outside every passage range')
        last = page
    for _, p1, p2 in spans:
        missing = set(range(p1 + 1, p2 + 1)) - {p for p, _ in pages}
        if missing:
            problems.append(f'no page marker for {sorted(missing)}')


def check_source(surah, meta, blocks, quran, groupings):
    problems, pages, spans = [], [], []
    check_header(meta, surah, quran, problems)
    if not blocks or not PASSAGE.match(blocks[0]):
        problems.append('the first block must be a "::: passage" line')
    for n, block in enumerate(blocks, 1):
        m = PASSAGE.match(block)
        if m:
            spans.append(check_passage(m, surah, groupings, problems))
        elif HEADING.match(block):
            continue
        elif block.startswith(':::'):
            problems.append(f'block {n}: malformed passage line "{block}"')
        else:
            check_paragraph(n, ' '.join(block.split('\n')), pages, problems)
    check_pages(spans, pages, problems)
    return problems


# ---------------------------------------------------------------- docx helpers

def set_run_fonts(run, latin=TEXT_FONT, complex_=ARABIC_FONT):
    rpr = run._element.get_or_add_rPr()
    fonts = rpr.find(qn('w:rFonts'))
    if fonts is None:
        fonts = OxmlElement('w:rFonts')
        rpr.insert(0, fonts)
    for key, value in (('w:ascii', latin), ('w:hAnsi', latin), ('w:cs', complex_)):
        fonts.set(qn(key), value)


def add_run(par, text, bold=False, italic=False, size=None, color=None, superscript=False, small_caps=False):
    for piece in HONORIFIC_SPLIT.split(text):
        if not piece:
            continue
        run = par.add_run(piece)
        run.bold, run.italic = bold, italic
        run.font.superscript = superscript
        run.font.small_caps = small_caps
        if size:
            run.font.size = Pt(size)
            run._element.get_or_add_rPr().append(_cs_size(size))
        if color:
            run.font.color.rgb = color
        if piece in HONORIFICS:
            set_run_fonts(run, HONORIFIC_FONT, HONORIFIC_FONT)
            run.italic = False


def _cs_size(size):
    el = OxmlElement('w:szCs')
    el.set(qn('w:val'), str(int(size * 2)))
    return el


def paragraph(doc, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True, before=0, after=0, keep=False):
    par = doc.add_paragraph()
    fmt = par.paragraph_format
    fmt.alignment = align
    fmt.first_line_indent = Inches(0.4) if indent else Inches(0)
    fmt.space_before, fmt.space_after = Pt(before), Pt(after)
    fmt.keep_with_next = keep
    # A fixed line height, so the taller ﷺ glyph does not open a gap in its line.
    fmt.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    fmt.line_spacing = Pt(LEADING_PT)
    return par


def add_page_field(par):
    run = par.add_run()
    for kind, text in (('begin', None), (None, 'PAGE'), ('end', None)):
        if kind:
            el = OxmlElement('w:fldChar')
            el.set(qn('w:fldCharType'), kind)
        else:
            el = OxmlElement('w:instrText')
            el.set(qn('xml:space'), 'preserve')
            el.text = text
        run._element.append(el)
    run.font.size = Pt(9)


def new_document(meta):
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    for side in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'):
        setattr(sec, side, Inches(1))
    normal = doc.styles['Normal']
    normal.font.name = TEXT_FONT
    normal.font.size = Pt(BODY_PT)
    normal.element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:cs'), ARABIC_FONT)
    normal.paragraph_format.line_spacing = 1.2
    normal.paragraph_format.space_after = Pt(0)
    foot = sec.footer.paragraphs[0]
    foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run(foot, f'al-Kashshāf · {meta["title"]} · ', size=9, color=GRAY)
    add_page_field(foot)
    return doc


# ---------------------------------------------------------------- typesetting

def curly(text):
    text = re.sub(r'(^|[\s(\[—])"', r'\1“', text)
    text = re.sub(r'(^|[\s(\[—])\'', r'\1‘', text)
    return text.replace('"', '”').replace("'", '’')


def khalifa(row):
    return curly(row['english'].replace('±', '').strip())


def to_arabic_digits(n):
    return str(n).translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))


def write_header(doc, meta, surah, quran):
    title = paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, indent=False, keep=True)
    add_run(title, meta['title'], bold=True, size=15)
    rev = paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, indent=False, after=10, keep=True)
    add_run(rev, meta['revelation'], size=11)
    basmala = quran.get((surah, 0))
    if basmala:
        b = paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, indent=False, after=8, keep=True)
        add_run(b, curly(basmala['english']).rstrip('.'))


def write_passage(doc, m, quran, arabic):
    s, lo, hi, vol, p1, p2 = map(int, m.groups())
    verses = f'{lo}' if lo == hi else f'{lo}–{hi}'
    pages = f'p. {p1}' if p1 == p2 else f'pp. {p1}–{p2}'
    label = paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, indent=False, before=6, after=4, keep=True)
    add_run(label, f'Qurʾān {s}:{verses} · al-Kashshāf, vol. {vol}, {pages}', size=9, color=GRAY, small_caps=True)
    if arabic:
        write_arabic(doc, s, lo, hi, quran)
    block = paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, indent=False, after=14)
    for v in range(lo, hi + 1):
        row = quran.get((s, v))
        add_run(block, f'({v}) ')
        if row:
            add_run(block, khalifa(row) + ' ', italic=True)
        else:
            add_run(block, '[This verse is not in Khalifa’s translation.] ')


def write_arabic(doc, s, lo, hi, quran):
    par = paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, indent=False, after=6, keep=True)
    par.paragraph_format.line_spacing = Pt(34)
    par._p.get_or_add_pPr().append(OxmlElement('w:bidi'))
    parts = [f'{quran[(s, v)]["arabic"]} ﴿{to_arabic_digits(v)}﴾' for v in range(lo, hi + 1) if (s, v) in quran]
    run = par.add_run(' '.join(parts))
    set_run_fonts(run, QURAN_FONT, QURAN_FONT)
    run._element.get_or_add_rPr().append(OxmlElement('w:rtl'))
    run.font.size = Pt(17)
    run._element.get_or_add_rPr().append(_cs_size(17))


def write_paragraph(doc, text):
    par = paragraph(doc)
    bold = italic = False
    for piece in re.split(f'({TOKEN.pattern})', text):
        if not piece:
            continue
        if piece in ('*', '**', '***'):
            italic = not italic if piece in ('*', '***') else italic
            bold = not bold if piece in ('**', '***') else bold
        elif piece.startswith('{'):
            write_tag(par, piece[1:-1])
        else:
            add_run(par, piece, bold=bold, italic=italic)


def write_tag(par, tag):
    name, _, rest = tag.partition('|')
    if name in LABELS:
        add_run(par, LABELS[name], bold=True)
    elif name == 'L':
        english, translit = rest.split('|')
        add_run(par, '“', bold=True)
        add_run(par, english, bold=True, italic=True)
        add_run(par, f'” ({translit}):', bold=True)
    elif name == 'From':
        add_run(par, f'From {rest}:', bold=True)
    elif name == 'p':
        add_run(par, f'|{rest}| ', size=8.5, color=GRAY)
        return
    add_run(par, ' ')


def render(surah, meta, blocks, quran, arabic, make_pdf):
    doc = new_document(meta)
    first = PASSAGE.match(blocks[0])
    if int(first.group(2)) == 1:
        write_header(doc, meta, surah, quran)
    for block in blocks:
        m, h = PASSAGE.match(block), HEADING.match(block)
        if m:
            write_passage(doc, m, quran, arabic)
        elif h:
            head = paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, indent=False, before=16, after=8, keep=True)
            add_run(head, h.group(1), bold=True)
        else:
            write_paragraph(doc, re.sub(r'\}\s+', '}', ' '.join(block.split('\n'))))
    BUILD.mkdir(exist_ok=True)
    out = BUILD / f'{surah}.docx'
    doc.save(out)
    embed_fonts(out)
    if make_pdf:
        to_pdf(out)
    return out


def to_pdf(docx_path):
    soffice = shutil.which('soffice') or (str(SOFFICE) if SOFFICE.exists() else None)
    if not soffice:
        print('  LibreOffice not found; skipped the PDF')
        return
    subprocess.run([soffice, '--headless', '--convert-to', 'pdf', '--outdir', str(BUILD), str(docx_path)],
                   check=True, capture_output=True)


# ---------------------------------------------------------------- font embedding
# Brill is installed for this Windows user only, which headless LibreOffice does
# not see, and few machines have a Noto Naskh Arabic recent enough for the
# honorific symbols, so both are embedded in the .docx (both allow embedding).
# Word and LibreOffice read embedded fonts, so the file also looks right on a
# machine without them.

FONT_DIRS = (Path.home() / 'AppData/Local/Microsoft/Windows/Fonts', Path('C:/Windows/Fonts'))
EMBED_FILES = {
    TEXT_FONT: {'embedRegular': 'Brill-Roman.ttf', 'embedBold': 'Brill-Bold.ttf',
                'embedItalic': 'Brill-Italic.ttf', 'embedBoldItalic': 'Brill-BoldItalic.ttf'},
    HONORIFIC_FONT: {'embedRegular': 'NotoNaskhArabic-Regular.ttf', 'embedBold': 'NotoNaskhArabic-Bold.ttf'},
}
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
FONT_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/font'


def find_font(filename):
    for folder in FONT_DIRS:
        path = folder / filename
        if path.exists():
            return path
    return None


def obfuscate(data, guid):
    key = bytes.fromhex(guid.strip('{}').replace('-', ''))[::-1]
    head = bytes(b ^ key[i % 16] for i, b in enumerate(data[:32]))
    return head + data[32:]


def embed_fonts(docx_path):
    import uuid
    import zipfile
    with zipfile.ZipFile(docx_path) as z:
        parts = {name: z.read(name) for name in z.namelist()}
    fonts_xml, rels, n = [], [], 0
    for family, styles in EMBED_FILES.items():
        files = {tag: find_font(name) for tag, name in styles.items()}
        if not all(files.values()):
            print(f'  {family} font files not found; the .docx names the font without embedding it')
            continue
        entries = []
        for tag, path in files.items():
            n += 1
            guid = '{' + str(uuid.uuid4()).upper() + '}'
            parts[f'word/fonts/font{n}.odttf'] = obfuscate(path.read_bytes(), guid)
            entries.append(f'<w:{tag} r:id="rIdF{n}" w:fontKey="{guid}"/>')
            rels.append(f'<Relationship Id="rIdF{n}" Type="{FONT_REL}" Target="fonts/font{n}.odttf"/>')
        fonts_xml.append(f'<w:font w:name="{family}">{"".join(entries)}</w:font>')
    if not rels:
        return
    table = parts['word/fontTable.xml'].decode('utf-8')
    if 'xmlns:r=' not in table.split('>', 2)[1]:
        table = table.replace('<w:fonts ', f'<w:fonts xmlns:r="{R_NS}" ', 1)
    table = table.replace('</w:fonts>', ''.join(fonts_xml) + '</w:fonts>')
    parts['word/fontTable.xml'] = table.encode('utf-8')
    parts['word/_rels/fontTable.xml.rels'] = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + ''.join(rels) + '</Relationships>').encode('utf-8')
    types = parts['[Content_Types].xml'].decode('utf-8')
    if 'Extension="odttf"' not in types:
        types = types.replace('</Types>', '<Default Extension="odttf" ContentType='
                              '"application/vnd.openxmlformats-officedocument.obfuscatedFont"/></Types>')
    parts['[Content_Types].xml'] = types.encode('utf-8')
    settings = parts['word/settings.xml'].decode('utf-8')
    if 'embedTrueTypeFonts' not in settings:
        settings = re.sub(r'(<w:settings[^>]*>)', r'\1<w:embedTrueTypeFonts/>', settings, count=1)
    parts['word/settings.xml'] = settings.encode('utf-8')
    with zipfile.ZipFile(docx_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for name, data in parts.items():
            z.writestr(name, data)


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('surahs', nargs='*', type=int)
    ap.add_argument('--quran', default=str(QURAN_JSON))
    ap.add_argument('--arabic', action='store_true')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--no-pdf', action='store_true')
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    quran, groupings = load_quran(args.quran), load_groupings()
    surahs = args.surahs or sorted(int(p.stem) for p in SOURCES.glob('*.md'))
    failed = False
    for surah in surahs:
        meta, blocks = parse_source(SOURCES / f'{surah}.md')
        problems = check_source(surah, meta, blocks, quran, groupings)
        if problems:
            failed = True
            print(f'{surah}: {len(problems)} problem(s)')
            for p in problems:
                print(f'  - {p}')
            continue
        if args.check:
            print(f'{surah}: ok')
            continue
        out = render(surah, meta, blocks, quran, args.arabic, not args.no_pdf)
        print(f'{surah}: wrote {out.relative_to(HERE)}' + ('' if args.no_pdf else ' and .pdf'))
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
