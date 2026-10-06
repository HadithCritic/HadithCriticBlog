/**
 * Drawing kit for the social preview cards: palette, fonts, satori element
 * helpers, the engraved ground and the frame every card shares.
 *
 * Satori lays out a subset of CSS with flexbox only, so every element with
 * more than one child must be `display: flex`; `div()` sets that once.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const W = 1200;
export const H = 630;

/* Tokens from src/styles/global.css, dark theme and the fixed tones. The card
   renders outside the browser, so it cannot read the custom properties. */
export const C = {
  ground: '#0f0f10',
  groundSoft: '#141312',
  charcoal: '#1e1d1b',
  gold: '#d8b166',
  goldSoft: '#e2c783',
  goldDim: '#bf9957',
  parchment: '#f2ebdc',
  parchmentDeep: '#e5d7bd',
  ink: '#1a1715',
  inkSoft: '#4e4842',
  inkGold: '#6a4c18',
  muted: '#b8ad99',
  ash: '#8c8a86',
  rule: 'rgba(216,177,102,0.32)',
  ruleStrong: 'rgba(216,177,102,0.55)',
  ruleSoft: 'rgba(242,235,220,0.14)',
  category: {
    'Origins & Early History': '#d5b091',
    'Transmission & Narrators': '#a3afc7',
    'Prophecies & Eschatology': '#d7988b',
    'Theology & Epistemology': '#9cb8a4'
  }
};

/* The site's four faces, as static TTFs: satori reads neither WOFF2 nor the
   weight axis of a variable font. Fetched once into .cache/fonts. */
const FONT_DIR = '.cache/fonts';
const FONT_FILES = [
  ['Cormorant', 600, 'normal', 'CormorantGaramond-SemiBold.ttf', 'https://github.com/CatharsisFonts/Cormorant/raw/master/fonts/ttf/CormorantGaramond-SemiBold.ttf'],
  ['Cormorant', 700, 'normal', 'CormorantGaramond-Bold.ttf', 'https://github.com/CatharsisFonts/Cormorant/raw/master/fonts/ttf/CormorantGaramond-Bold.ttf'],
  ['Serif', 400, 'normal', 'SourceSerif4-Regular.ttf', 'https://github.com/adobe-fonts/source-serif/raw/release/TTF/SourceSerif4-Regular.ttf'],
  ['Serif', 600, 'normal', 'SourceSerif4-Semibold.ttf', 'https://github.com/adobe-fonts/source-serif/raw/release/TTF/SourceSerif4-Semibold.ttf'],
  ['Serif', 400, 'italic', 'SourceSerif4-It.ttf', 'https://github.com/adobe-fonts/source-serif/raw/release/TTF/SourceSerif4-It.ttf'],
  ['Plex', 500, 'normal', 'IBMPlexSans-Medium.ttf', 'https://github.com/IBM/plex/raw/master/packages/plex-sans/fonts/complete/ttf/IBMPlexSans-Medium.ttf'],
  ['Plex', 600, 'normal', 'IBMPlexSans-SemiBold.ttf', 'https://github.com/IBM/plex/raw/master/packages/plex-sans/fonts/complete/ttf/IBMPlexSans-SemiBold.ttf'],
  /* The site sets Arabic in Noto Naskh, but Noto Naskh places its dots as
     separate marks through GPOS, which satori does not apply: ث rendered as a
     bare tooth with its dots adrift. Amiri draws the dots into each glyph and
     shapes correctly here, so the cards use it. */
  ['Naskh', 400, 'normal', 'Amiri-Regular.ttf', 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf'],
  ['Naskh', 700, 'normal', 'Amiri-Bold.ttf', 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Bold.ttf'],
  ['AmiriQuran', 400, 'normal', 'AmiriQuran-Regular.ttf', 'https://github.com/google/fonts/raw/main/ofl/amiriquran/AmiriQuran-Regular.ttf']
];

export async function loadFonts() {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  const fonts = [];
  for (const [name, weight, style, file, url] of FONT_FILES) {
    const target = path.join(FONT_DIR, file);
    if (!fs.existsSync(target)) {
      process.stdout.write(`  fetching ${file}\n`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`font fetch failed for ${file}: ${res.status}`);
      fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    }
    fonts.push({ name, weight, style, data: fs.readFileSync(target) });
  }
  return fonts;
}

// ---------------------------------------------------------------- elements

export const div = (style, children = []) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
export const text = (style, value) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: String(value) } });
export const img = (src, style) => ({ type: 'img', props: { src, width: style.width, height: style.height, style } });

/** A raster as a data URI, cropped to the box it will fill. */
export async function raster(file, width, height, { position = 'right', quality = 84, modulate, zoom = 1 } = {}) {
  let pipeline = sharp(file);
  if (zoom !== 1) {
    // Crop in before fitting, for art whose own margins are blank paper.
    const { width: w0, height: h0 } = await sharp(file).metadata();
    const w = Math.round(w0 / zoom);
    const h = Math.round(h0 / zoom);
    pipeline = pipeline.extract({ left: w0 - w, top: Math.round((h0 - h) / 2), width: w, height: h });
  }
  pipeline = pipeline.resize(width, height, { fit: 'cover', position });
  if (modulate) pipeline = pipeline.modulate(modulate);
  const buf = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

export async function pngData(file, width, height) {
  const buf = await sharp(file).resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

/**
 * Satori shapes Arabic but collapses the spaces between words. Laying the
 * words out as row-reverse flex children with a real gap restores spacing
 * while keeping each word's shaping intact.
 */
export const arabic = (value, { size, color, family = 'Naskh', weight = 400 }) =>
  div(
    { flexDirection: 'row-reverse', alignItems: 'baseline', flexWrap: 'wrap', gap: `${Math.max(6, Math.round(size * 0.28))}px` },
    String(value).trim().split(/\s+/).filter(Boolean).map((word) =>
      text({ fontFamily: family, fontWeight: weight, fontSize: size, color, lineHeight: 1.45 }, word)
    )
  );

/* Uppercased here, not with text-transform: satori measures the text before
   transforming it, so a wide capital word spilled over the space after it
   ("ISNĀD-CUM-MATNSTUDIES"). It also splits a tracked word at its hyphens and
   drops the tracking from the width, so hyphens are made non-breaking. */
export const label = (value, { color = C.gold, size = 17, spacing = '0.16em' } = {}) =>
  div({ flexWrap: 'wrap' },
    String(value).split(/\s+/).map((word, i, all) =>
      text({ fontFamily: 'Plex', fontWeight: 500, fontSize: size, letterSpacing: spacing, color, marginRight: i < all.length - 1 ? `${Math.round(size * 0.5)}px` : '0px' }, word.toUpperCase().replace(/-/g, "‑"))
    )
  );

/** The lozenge, drawn: none of the faces carries U+25C6. */
export const lozenge = (size = 9, { fill = 'transparent', stroke = C.gold } = {}) =>
  div({ width: `${size}px`, height: `${size}px`, border: `1.5px solid ${stroke}`, background: fill, transform: 'rotate(45deg)' });

/** Hairline, lozenge, hairline: the brand sheet's chapter divider. */
export const ornament = (width = 220, ground = C.ground) =>
  div({ alignItems: 'center', width: `${width}px` }, [
    div({ flexGrow: 1, height: '1px', background: C.goldDim }),
    div({ margin: '0 10px' }, [lozenge(9, { fill: ground })]),
    div({ flexGrow: 1, height: '1px', background: C.goldDim })
  ]);

/** Facts set as a run separated by small lozenges. */
export const facts = (items, { color = C.muted, size = 19 } = {}) =>
  div(
    { alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
    items.flatMap((item, i) => [
      ...(i ? [lozenge(7, { stroke: C.goldDim })] : []),
      text({ fontFamily: 'Plex', fontWeight: 500, fontSize: size, color, letterSpacing: '0.02em' }, item)
    ])
  );

// ---------------------------------------------------------------- frame

const corner = (pos) =>
  div({ position: 'absolute', width: '30px', height: '30px', ...pos }, [
    div({ position: 'absolute', top: '0px', left: '0px', width: '30px', height: '1.5px', background: C.gold }),
    div({ position: 'absolute', top: '0px', left: '0px', width: '1.5px', height: '30px', background: C.gold }),
    div({ position: 'absolute', top: '7px', left: '7px', width: '8px', height: '8px', border: `1.5px solid ${C.gold}`, transform: 'rotate(45deg)' })
  ]);

/**
 * Every card: black ground, an engraving bleeding in from the right and
 * masked into the ground, a double rule with gilt corners, the wordmark top
 * left and the address bottom right. `body` is laid over all of it.
 */
export function frame({ art, artWidth = 820, logo, body, ground = C.ground }) {
  const corners = [
    { top: '18px', left: '18px' },
    { top: '18px', right: '18px', transform: 'scaleX(-1)' },
    { bottom: '18px', left: '18px', transform: 'scaleY(-1)' },
    { bottom: '18px', right: '18px', transform: 'scale(-1, -1)' }
  ];
  return div({ width: `${W}px`, height: `${H}px`, position: 'relative', background: ground, overflow: 'hidden' }, [
    ...(art
      ? [
          img(art, { position: 'absolute', top: '0px', right: '0px', width: `${artWidth}px`, height: `${H}px`, objectFit: 'cover' }),
          div({
            position: 'absolute', top: '0px', left: '0px', width: `${W}px`, height: `${H}px`,
            backgroundImage: `linear-gradient(90deg, ${ground} 0%, ${ground} ${Math.round(((W - artWidth) / W) * 100)}%, rgba(15,15,16,0.72) ${Math.round(((W - artWidth) / W) * 100) + 14}%, rgba(15,15,16,0.18) 100%)`
          }),
          div({
            position: 'absolute', top: '0px', left: '0px', width: `${W}px`, height: `${H}px`,
            backgroundImage: 'linear-gradient(0deg, rgba(15,15,16,0.92) 0%, rgba(15,15,16,0) 34%, rgba(15,15,16,0) 82%, rgba(15,15,16,0.55) 100%)'
          })
        ]
      : []),
    div({ position: 'absolute', top: '18px', left: '18px', width: `${W - 36}px`, height: `${H - 36}px`, border: `1px solid ${C.ruleStrong}` }),
    div({ position: 'absolute', top: '24px', left: '24px', width: `${W - 48}px`, height: `${H - 48}px`, border: `1px solid ${C.ruleSoft}` }),
    ...corners.map(corner),
    div({ position: 'absolute', top: '0px', left: '0px', width: `${W}px`, height: `${H}px`, flexDirection: 'column', padding: '50px 64px 46px' }, [
      div({ alignItems: 'center', gap: '14px' }, [
        img(logo, { width: '22px', height: '32px' }),
        text({ fontFamily: 'Cormorant', fontWeight: 600, fontSize: 30, color: C.parchment, letterSpacing: '0.005em' }, 'HadithCritic')
      ]),
      div({ flexGrow: 1, flexDirection: 'column', position: 'relative' }, body),
      div({ justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }, [
        lozenge(7, { fill: C.gold, stroke: C.gold }),
        text({ fontFamily: 'Plex', fontWeight: 500, fontSize: 17, color: C.ash, letterSpacing: '0.12em', textTransform: 'uppercase' }, 'hadithcriticblog.com')
      ])
    ])
  ]);
}

/** Title block on the left: kicker, display title, optional Arabic, ornament. */
export function masthead({ kicker, title, accent, arabicTitle, size, width = 640 }) {
  const fontSize = size ?? (title.length + (accent?.length ?? 0) > 34 ? 66 : title.length > 22 ? 76 : 88);
  return div({ flexDirection: 'column', width: `${width}px`, marginTop: '34px' }, [
    label(kicker),
    // One flex child per word, so a long title wraps like text, not as two
    // rigid blocks, and the gold phrase can share a line with the rest.
    div({ flexWrap: 'wrap', columnGap: `${Math.round(fontSize * 0.24)}px`, marginTop: '14px' }, [
      ...title.split(/\s+/).map((w) => text({ fontFamily: 'Cormorant', fontWeight: 600, fontSize, lineHeight: 1.02, color: C.parchment }, w)),
      ...(accent ? accent.split(/\s+/).map((w) => text({ fontFamily: 'Cormorant', fontWeight: 600, fontSize, lineHeight: 1.02, color: C.gold }, w)) : [])
    ]),
    ...(arabicTitle ? [div({ marginTop: '10px' }, [arabic(arabicTitle, { size: Math.round(fontSize * 0.46), color: C.goldDim })])] : []),
    div({ marginTop: '22px' }, [ornament(200)])
  ]);
}
