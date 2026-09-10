/**
 * Social preview card generator.
 *
 * Produces the og:image set under public/og/. Two card families, deliberately
 * distinguishable at a glance in a Discord or iMessage embed:
 *
 *   corpus   - a collection masthead. English title over its Arabic title,
 *              with the narration count. One per collection, plus a corpus
 *              default.
 *   register - a transmitter card carrying the isnad chain ornament, which is
 *              the visual signature that separates rijal links from hadith
 *              links. One per generation, plus a register default.
 *
 * Why build time rather than on demand:
 *
 *   The worker bundle already sits at ~2.5 MB gzipped against Cloudflare's
 *   3 MB free-plan ceiling. Runtime rasterisation (satori plus resvg-wasm)
 *   would add roughly 1.5 MB and could take the deployment over the limit, so
 *   satori is a devDependency here and never reaches the worker.
 *
 * Why satori rather than rendering SVG text with sharp:
 *
 *   sharp resolves fonts through the host's fontconfig, so the same SVG gives
 *   a different result on a dev machine and in CI, and its Arabic came out
 *   unshaped and clipped. satori embeds the font and emits glyph outlines as
 *   <path>, so rasterisation needs no fonts at all and the output is identical
 *   everywhere.
 *
 * Arabic caveat, and the reason for arabicLine() below:
 *
 *   satori shapes Arabic correctly but collapses the spaces between words, so
 *   a title renders as one run with the words jammed together. Splitting on
 *   whitespace and laying the words out as row-reverse flex children with a
 *   real gap restores the spacing while keeping the intra-word shaping intact.
 *   Verified against صحيح البخاري and مصنف ابن أبي شيبة.
 *
 * Regenerate with `npm run build:og`. Output is committed so a build never
 * depends on the network or on a font being installed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import satori from 'satori';
import sharp from 'sharp';

const OUT = 'public/og';
const FONT_DIR = '.cache/fonts';
const W = 1200;
const H = 630;

// Tokens copied from src/styles/global.css. The card is rendered outside the
// browser, so it cannot read the custom properties; these must be kept in step
// with the dark theme block there.
const C = {
  ground: '#0f0f10',
  panel: '#141312',
  gold: '#d8b166',
  goldSoft: '#e2c783',
  goldDim: '#9d7a3c',
  parchment: '#f2ebdc',
  muted: '#b8ad99',
  ash: '#8c8a86',
  rule: 'rgba(216,177,102,0.32)',
  ruleSoft: 'rgba(242,235,220,0.14)'
};

const FONTS = [
  { file: 'Poppins-Medium.ttf', name: 'Poppins', weight: 500, url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Medium.ttf' },
  { file: 'Poppins-SemiBold.ttf', name: 'Poppins', weight: 600, url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf' },
  { file: 'Amiri-Regular.ttf', name: 'Amiri', weight: 400, url: 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf' }
];

async function loadFonts() {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  const out = [];
  for (const f of FONTS) {
    const p = path.join(FONT_DIR, f.file);
    if (!fs.existsSync(p)) {
      process.stdout.write(`  fetching ${f.file}\n`);
      const res = await fetch(f.url);
      if (!res.ok) throw new Error(`font fetch failed ${f.file}: ${res.status}`);
      fs.writeFileSync(p, Buffer.from(await res.arrayBuffer()));
    }
    out.push({ name: f.name, data: fs.readFileSync(p), weight: f.weight, style: 'normal' });
  }
  return out;
}

// ---------------------------------------------------------------- primitives

const div = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const text = (style, value) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: value } });

/** See the Arabic caveat in the header comment. */
const arabicLine = (value, size, color) =>
  div(
    { flexDirection: 'row-reverse', alignItems: 'baseline', gap: `${Math.max(6, Math.round(size * 0.26))}px`, flexWrap: 'wrap' },
    String(value).trim().split(/\s+/).filter(Boolean).map((w) =>
      text({ fontFamily: 'Amiri', fontSize: size, color, lineHeight: 1.5 }, w)
    )
  );

const kicker = (value) =>
  text(
    { fontFamily: 'Poppins', fontWeight: 600, fontSize: 24, letterSpacing: '0.16em', color: C.gold, textTransform: 'uppercase' },
    value
  );

const meta = (value) =>
  text(
    { fontFamily: 'Poppins', fontWeight: 500, fontSize: 21, letterSpacing: '0.11em', color: C.ash, textTransform: 'uppercase' },
    value
  );

const rule = (color = C.rule, width = '100%') => div({ width, height: '1px', background: color });

/** Wordmark plus the site's one ornament, bottom right on every card. */
const footer = () =>
  div({ alignItems: 'center', justifyContent: 'space-between', width: '100%' }, [
    meta('hadithcriticblog.com'),
    div({ alignItems: 'center', gap: '16px' }, [
      text({ fontFamily: 'Poppins', fontWeight: 600, fontSize: 26, color: C.parchment }, 'HadithCritic'),
      // The site's lozenge ornament, drawn rather than set: Poppins has no
      // U+25C6 and satori renders a missing glyph as tofu.
      div({ width: '13px', height: '13px', background: C.gold, transform: 'rotate(45deg)' })
    ])
  ]);

/**
 * Shared frame. The inset hairline is the .hc-card treatment from global.css:
 * depth on this site comes from a rule, never from a shadow.
 */
const frame = (children) =>
  div(
    {
      width: `${W}px`,
      height: `${H}px`,
      flexDirection: 'column',
      position: 'relative',
      background: C.ground,
      backgroundImage: `radial-gradient(circle at 76% 8%, rgba(216,177,102,0.10), transparent 42%), radial-gradient(circle at 8% 88%, rgba(164,106,63,0.10), transparent 40%)`
    },
    [
      div({ position: 'absolute', top: '0px', left: '0px', width: `${W}px`, height: '4px', background: C.gold }),
      div({ position: 'absolute', top: '28px', left: '28px', width: `${W - 56}px`, height: `${H - 56}px`, border: `1px solid ${C.ruleSoft}` }),
      div({ flexDirection: 'column', justifyContent: 'space-between', padding: '68px 72px 60px', width: `${W}px`, height: `${H}px` }, children)
    ]
  );

// -------------------------------------------------------------- card designs

/**
 * Corpus card. Left-anchored masthead: the collection's English name over its
 * Arabic name, which is the same pairing the collection page itself opens with.
 */
function corpusCard({ kickerText, titleEn, titleAr, stats }) {
  return frame([
    kicker(kickerText),
    div({ flexDirection: 'column', gap: '18px' }, [
      text(
        {
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: titleEn.length > 26 ? 60 : 74,
          letterSpacing: '-0.035em',
          lineHeight: 1.02,
          color: C.parchment,
          maxWidth: '1000px'
        },
        titleEn
      ),
      ...(titleAr ? [arabicLine(titleAr, 46, C.goldSoft)] : [])
    ]),
    div({ flexDirection: 'column', gap: '26px', width: '100%' }, [rule(), meta(stats), footer()])
  ]);
}

/**
 * Register card. The isnad chain ornament is what makes a transmitter link
 * unmistakable next to a hadith link in a feed: same palette, different
 * signature. The filled node is this transmitter's position in the chain.
 */
function registerCard({ kickerText, titleEn, subtitle, stats }) {
  const NODES = 7;
  const chain = div(
    { alignItems: 'center', gap: '0px' },
    Array.from({ length: NODES }).flatMap((_, i) => {
      const active = i === 3;
      const node = div({
        width: active ? '20px' : '13px',
        height: active ? '20px' : '13px',
        borderRadius: '999px',
        background: active ? C.gold : 'transparent',
        border: `2px solid ${active ? C.gold : C.goldDim}`
      });
      return i === NODES - 1 ? [node] : [node, div({ width: '46px', height: '2px', background: C.goldDim })];
    })
  );

  return frame([
    div({ flexDirection: 'column', gap: '34px' }, [kicker(kickerText), chain]),
    div({ flexDirection: 'column', gap: '14px' }, [
      text(
        {
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: titleEn.length > 26 ? 58 : 70,
          letterSpacing: '-0.035em',
          lineHeight: 1.02,
          color: C.parchment,
          maxWidth: '1000px'
        },
        titleEn
      ),
      ...(subtitle ? [text({ fontFamily: 'Poppins', fontWeight: 500, fontSize: 30, color: C.gold, letterSpacing: '-0.01em' }, subtitle)] : [])
    ]),
    div({ flexDirection: 'column', gap: '26px', width: '100%' }, [rule(), meta(stats), footer()])
  ]);
}

// -------------------------------------------------------------------- render

async function render(el, fonts, outPath) {
  const svg = await satori(el, { width: W, height: H, fonts });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
  return png.length;
}

/** Matches the slug already used by /narrators?generation= links. */
export const generationSlug = (g) =>
  String(g || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unclassified';

function openCorpusDb() {
  const dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
  if (!fs.existsSync(dir)) return null;
  const file = fs.readdirSync(dir).find((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
  if (!file) return null;
  return new DatabaseSync(path.join(dir, file), { readOnly: true });
}

async function main() {
  const fonts = await loadFonts();
  const db = openCorpusDb();
  let count = 0;
  let bytes = 0;

  const emit = async (el, rel) => {
    bytes += await render(el, fonts, path.join(OUT, rel));
    count += 1;
    process.stdout.write(`  ${rel}\n`);
  };

  // ---- site default ------------------------------------------------------
  await emit(
    corpusCard({
      kickerText: 'Independent historical criticism',
      titleEn: 'HadithCritic',
      titleAr: '',
      stats: 'Isnad analysis · transmission history · manuscript evidence'
    }),
    'default.png'
  );

  // ---- corpus ------------------------------------------------------------
  const books = db
    ? db.prepare('SELECT slug, title_en, title_ar, hadith_count FROM hadith_book ORDER BY hadith_count DESC').all()
    : [];
  const totalNarrations = db ? db.prepare('SELECT COUNT(*) AS n FROM hadith').get().n : 0;
  const totalNarrators = db ? db.prepare('SELECT COUNT(*) AS n FROM narrator WHERE unnamed = 0').get().n : 0;

  await emit(
    corpusCard({
      kickerText: 'Hadith · Corpus',
      titleEn: 'The Corpus of Narration',
      titleAr: '',
      stats: db
        ? `${totalNarrations.toLocaleString('en-US')} narrations · ${books.length} collections · no authenticity grading`
        : 'Arabic and English · no authenticity grading'
    }),
    'hadith.png'
  );

  for (const b of books) {
    await emit(
      corpusCard({
        kickerText: 'Hadith · Collection',
        titleEn: b.title_en,
        titleAr: b.title_ar,
        stats: `${Number(b.hadith_count).toLocaleString('en-US')} narrations · source sequence · no authenticity grading`
      }),
      `collection/${b.slug}.png`
    );
  }

  // ---- register ----------------------------------------------------------
  await emit(
    registerCard({
      kickerText: 'Rijāl · Transmitter register',
      titleEn: 'The Transmitters of Hadith',
      subtitle: '',
      stats: db
        ? `${totalNarrators.toLocaleString('en-US')} transmitters · attributed criticism · no rating of our own`
        : 'Attributed criticism · no rating of our own'
    }),
    'narrators.png'
  );

  const generations = db
    ? db
        .prepare("SELECT generation AS g, COUNT(*) AS n FROM narrator WHERE unnamed = 0 AND generation <> '' GROUP BY generation")
        .all()
    : [];

  for (const row of generations) {
    await emit(
      registerCard({
        kickerText: 'Rijāl · Dossier',
        titleEn: 'Transmitter Dossier',
        subtitle: row.g,
        stats: `${Number(row.n).toLocaleString('en-US')} in this generation · attributed criticism only`
      }),
      `narrator/${generationSlug(row.g)}.png`
    );
  }

  // Fallback for a dossier whose generation is missing or unrecognised.
  await emit(
    registerCard({
      kickerText: 'Rijāl · Dossier',
      titleEn: 'Transmitter Dossier',
      subtitle: '',
      stats: 'Teachers, students, and attributed criticism · no rating of our own'
    }),
    'narrator/default.png'
  );

  // The manifest is what src/lib/seo.ts checks before pointing a page at a
  // card, so a collection added after this ran falls back to the corpus card
  // instead of emitting an og:image that 404s.
  if (books.length) {
    const slugs = JSON.stringify(books.map((b) => b.slug).sort());
    const manifest = `// Generated by scripts/build-og-images.mjs. Do not edit by hand.
// Regenerate with \`npm run build:og\` after adding a collection.
export const COLLECTION_CARDS: ReadonlySet<string> = new Set(${slugs});
`;
    fs.writeFileSync('src/lib/og-cards.ts', manifest);
    process.stdout.write('  src/lib/og-cards.ts\n');
  } else {
    process.stdout.write('  (manifest left unchanged: no collections read)\n');
  }

  db?.close();
  process.stdout.write(`\n${count} cards, ${(bytes / 1024).toFixed(0)} KB total\n`);
  if (!db) process.stdout.write('note: local D1 not found, counts omitted from cards\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
