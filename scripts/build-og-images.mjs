/**
 * Social preview card generator.
 *
 * Writes the og:image set under public/og/ as 1200x630 JPEGs. Every card is
 * built from the same parts as the page it previews: the page's own engraving
 * masked into the dark ground, the Cormorant title, the ornament rule, the
 * site's double frame with gilt corners, and the page's signature instrument
 * drawn from the same data (the corpus catalogue card, the register's
 * century chart, the readers' hues, the opening verse, the atlas decades, the
 * ICMA family mix). A pasted link should be recognisable as this site, and as
 * which part of it, before anyone reads a word.
 *
 * Why build time rather than on demand: runtime rasterisation (satori plus
 * resvg-wasm) would add about 1.5 MB to a worker that already sits near
 * Cloudflare's free-plan ceiling. satori is a devDependency and never ships.
 *
 * Why satori rather than SVG text through sharp: sharp resolves fonts through
 * the host's fontconfig, so output differed between machines and Arabic came
 * out unshaped. satori embeds the fonts and emits outlines.
 *
 * Why JPEG: every card carries an engraving, which as PNG ran to ~1 MB a card.
 * Feeds fetch these on every paste; at quality 86 they are ~150 KB.
 *
 * Regenerate with `npm run build:og`. Output is committed. Inputs are all
 * committed files (see scripts/og/data.mjs), so no corpus build is needed.
 */

import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { loadData } from './og/data.mjs';
import {
  C, W, H, loadFonts, raster, pngData, div, text, img, arabic, label, lozenge, facts, frame, masthead
} from './og/kit.mjs';

const OUT = 'public/og';
const n = (value) => Number(value).toLocaleString('en-US');

/** Matches the slug already used by /narrators?generation= links. */
export const generationSlug = (g) =>
  String(g || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unclassified';

const categorySlug = (name) => name.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ------------------------------------------------------------- signatures

/** Corpus: the parchment catalogue card from the /hadith/ masthead. */
function catalogueCard({ head, headRight, lead, figure, rows }) {
  return div({ padding: '7px', background: C.parchment, width: '372px' }, [
    div({ flexDirection: 'column', width: '100%', padding: '18px 22px 16px', border: '1px solid rgba(26,23,21,0.28)', background: C.parchment }, [
      div({ justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '10px', borderBottom: '1px solid rgba(26,23,21,0.32)' }, [
        label(head, { color: C.inkGold, size: 14, spacing: '0.14em' }),
        text({ fontFamily: 'Plex', fontWeight: 500, fontSize: 14, color: C.inkSoft }, headRight)
      ]),
      text({ fontFamily: 'Serif', fontSize: 19, color: C.inkSoft, marginTop: '12px' }, lead),
      text({ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 60, lineHeight: 1, color: C.ink, marginTop: '2px' }, figure),
      ...rows.map(([k, v]) =>
        div({ justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(26,23,21,0.18)' }, [
          text({ fontFamily: 'Serif', fontSize: 19, color: C.inkSoft }, k),
          text({ fontFamily: 'Plex', fontWeight: 600, fontSize: 18, color: C.ink }, v)
        ])
      )
    ])
  ]);
}

/** A dark instrument plate, the backing every on-art signature sits on. */
const plate = (width, caption, children) =>
  div({ flexDirection: 'column', width: `${width}px`, padding: '20px 22px', background: 'rgba(15,15,16,0.84)', border: `1px solid ${C.rule}` }, [
    label(caption, { color: C.ash, size: 13, spacing: '0.12em' }),
    div({ flexDirection: 'column', marginTop: '14px' }, children)
  ]);

/** Register: transmitters by century of death. */
function centuryChart(centuries) {
  const max = Math.max(...centuries.map((c) => c.n));
  return plate(400, 'Transmitters by century of death, AH', [
    div({ alignItems: 'flex-end', gap: '5px', height: '130px', borderBottom: `1px solid ${C.ruleStrong}`, paddingBottom: '4px' },
      centuries.map((c) =>
        div({ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flexGrow: 1, height: '100%' }, [
          div({ width: '100%', height: `${Math.max(2, (c.n / max) * 120)}px`, backgroundImage: `linear-gradient(180deg, ${C.goldSoft}, ${C.goldDim})` })
        ])
      )
    ),
    div({ gap: '5px', marginTop: '6px' }, centuries.map((c) =>
      text({ flexGrow: 1, flexBasis: '0px', justifyContent: 'center', fontFamily: 'Plex', fontWeight: 500, fontSize: 13, color: C.ash }, c.value)
    )),
    text({ fontFamily: 'Serif', fontSize: 17, color: C.muted, marginTop: '12px' },
      `${n(centuries.reduce((s, c) => s + c.n, 0))} dated, peaking in the ${ordinal(centuries.reduce((a, b) => (b.n > a.n ? b : a)).value)} century`)
  ]);
}

const ordinal = (k) => `${k}${k % 10 === 1 && k !== 11 ? 'st' : k % 10 === 2 && k !== 12 ? 'nd' : k % 10 === 3 && k !== 13 ? 'rd' : 'th'}`;

/** Readings: the ten readers, each in his hue. */
function readersLegend(readers) {
  const row = (r) =>
    div({ alignItems: 'center', gap: '10px', width: '100%', padding: '7px 0', borderBottom: `1px solid ${C.ruleSoft}` }, [
      div({ width: '16px', height: '16px' }, [
        div({ width: '8px', height: '16px', background: r.deep }),
        div({ width: '8px', height: '16px', background: r.light })
      ]),
      text({ fontFamily: 'Serif', fontWeight: 600, fontSize: 18, color: C.parchment, flexGrow: 1 }, r.name),
      arabic(r.arabic, { size: 19, color: C.muted })
    ]);
  return plate(500, 'The ten readers', [
    div({ gap: '22px' }, [
      div({ flexDirection: 'column', width: '217px' }, readers.slice(0, 5).map(row)),
      div({ flexDirection: 'column', width: '217px' }, readers.slice(5).map(row))
    ])
  ]);
}

/** Reader: the opening verse, the unit the reader is built around. */
const verseCard = (verse) =>
  div({ flexDirection: 'column', alignItems: 'center', width: '440px', padding: '26px 28px 20px', background: 'rgba(15,15,16,0.84)', border: `1px solid ${C.rule}` }, [
    arabic(verse.ar, { size: 48, color: C.goldSoft, family: 'AmiriQuran' }),
    div({ width: '100%', height: '1px', background: C.ruleSoft, margin: '10px 0 14px' }),
    text({ fontFamily: 'Serif', fontStyle: 'italic', fontSize: 22, color: C.parchment, textAlign: 'center', marginBottom: '10px' }, verse.en),
    label('Q 1:1', { color: C.ash, size: 13, spacing: '0.14em' })
  ]);

/** Atlas: works in the collection by decade. */
function decadeBars(decades) {
  const max = Math.max(...decades.map(([, k]) => k));
  return plate(380, 'Works by decade of publication', decades.map(([decade, k]) =>
    div({ alignItems: 'center', gap: '10px', height: '15px' }, [
      text({ width: '50px', flexShrink: 0, fontFamily: 'Plex', fontWeight: 500, fontSize: 13, color: C.muted }, `${decade}s`),
      div({ width: '250px', flexShrink: 0 }, [div({ width: `${Math.max(2, Math.round((k / max) * 250))}px`, height: '8px', backgroundImage: `linear-gradient(90deg, ${C.goldDim}, ${C.goldSoft})` })]),
      text({ width: '26px', flexShrink: 0, justifyContent: 'flex-end', fontFamily: 'Plex', fontWeight: 500, fontSize: 13, color: C.parchment }, k)
    ])
  ));
}

/** ICMA: the family mix bar and its legend. */
function familyMix(icma) {
  const total = icma.families.reduce((s, f) => s + f.count, 0);
  return plate(440, `${icma.studies} studies in ${icma.families.length} research families`, [
    div({ gap: '3px', height: '14px', marginBottom: '14px' }, icma.families.map((f) => div({ width: `${(f.count / total) * 100}%`, height: '14px', background: f.bg }))),
    div({ flexWrap: 'wrap', columnGap: '20px' }, icma.families.map((f) =>
      div({ alignItems: 'center', gap: '9px', width: '186px', padding: '6px 0', borderBottom: `1px solid ${C.ruleSoft}` }, [
        div({ width: '13px', height: '13px', background: f.bg, border: '1px solid rgba(242,235,220,0.35)' }),
        text({ fontFamily: 'Serif', fontWeight: 600, fontSize: 17, color: C.parchment, flexGrow: 1 }, f.label),
        text({ fontFamily: 'Plex', fontWeight: 500, fontSize: 14, color: C.ash }, f.count)
      ])
    ))
  ]);
}

/** Archive: the three newest studies' plates, fanned like proofs on a desk. */
const proofFan = (plates) =>
  div({ position: 'relative', width: '470px', height: '330px' }, plates.map((src, i) =>
    div({
      position: 'absolute', left: `${i * 78}px`, top: `${[46, 12, 58][i]}px`,
      padding: '6px', background: C.parchment, transform: `rotate(${[-5, 1.5, 6][i]}deg)`,
      boxShadow: '0 18px 40px rgba(0,0,0,0.55)'
    }, [img(src, { width: '300px', height: '200px', objectFit: 'cover' })])
  ));

/** Category: the branch's three newest studies, folio first. */
const branchList = (color, rows) =>
  div({ flexDirection: 'column', width: '470px', padding: '20px 24px 10px', background: 'rgba(15,15,16,0.86)', border: `1px solid ${C.rule}`, borderTop: `3px solid ${color}` }, [
    label('Latest in this branch', { color: C.ash, size: 13, spacing: '0.12em' }),
    ...rows.map((r) =>
      div({ alignItems: 'flex-start', gap: '16px', padding: '12px 0', borderBottom: `1px solid ${C.ruleSoft}` }, [
        text({ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 34, lineHeight: 1, color: C.goldDim, width: '58px' }, r.folio),
        text({ fontFamily: 'Serif', fontWeight: 600, fontSize: 19, lineHeight: 1.3, color: C.parchment, width: '350px' }, clip(r.title, 72))
      ])
    )
  ]);

const clip = (s, max) => (s.length > max ? `${s.slice(0, max - 1).replace(/[\s,:;]+\S*$/, '')}…` : s);

/** Collection: a parchment slip with the edition's own extent. */
const collectionSlip = (vol, count) =>
  div({ padding: '7px', background: C.parchment, width: '300px' }, [
    div({ flexDirection: 'column', width: '100%', padding: '18px 22px', border: '1px solid rgba(26,23,21,0.28)' }, [
      div({ justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(26,23,21,0.32)' }, [
        label('Collection', { color: C.inkGold, size: 14, spacing: '0.14em' }),
        text({ fontFamily: 'Plex', fontWeight: 500, fontSize: 14, color: C.inkSoft }, `Vol. ${vol}`)
      ]),
      text({ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 72, lineHeight: 1, color: C.ink, marginTop: '14px' }, n(count)),
      text({ fontFamily: 'Serif', fontSize: 19, color: C.inkSoft, marginTop: '4px' }, 'narrations, in source order')
    ])
  ]);

/** Dossier: an isnad chain with this generation's link filled. */
function chain(active, steps) {
  return plate(420, 'Position in the chain', [
    div({ alignItems: 'center' }, steps.flatMap((step, i) => {
      const on = i === active;
      const node = div({ flexDirection: 'column', alignItems: 'center', width: '64px' }, [
        div({ width: on ? '24px' : '15px', height: on ? '24px' : '15px', borderRadius: '999px', background: on ? C.gold : C.ground, border: `2px solid ${on ? C.gold : C.goldDim}` })
      ]);
      return i === steps.length - 1 ? [node] : [node, div({ flexGrow: 1, height: '2px', background: C.goldDim, marginTop: '0px' })];
    })),
    div({ marginTop: '10px' }, steps.map((step, i) =>
      text({ width: `${i === steps.length - 1 ? 64 : 64 + 0}px`, flexGrow: i === steps.length - 1 ? 0 : 1, fontFamily: 'Plex', fontWeight: 500, fontSize: 13, color: i === active ? C.gold : C.ash }, step)
    ))
  ]);
}

// ------------------------------------------------------------------ cards

function card({ art, logo, kicker, title, accent, arabicTitle, size, titleWidth, factsList, signature, sigPos }) {
  return frame({
    art,
    logo,
    body: [
      masthead({ kicker, title, accent, arabicTitle, size, width: titleWidth }),
      div({ flexGrow: 1 }),
      ...(factsList ? [div({ marginBottom: '-30px' }, [facts(factsList)])] : []),
      // Signatures stand clear of the address line in the footer row.
      ...(signature ? [div({ position: 'absolute', right: '0px', ...(sigPos ?? { bottom: '30px' }) }, [signature])] : [])
    ]
  });
}

async function main() {
  const fonts = await loadFonts();
  const data = loadData();
  const { meta, articles } = data;
  const logo = await pngData('public/images/brand/hc-logo-transparent-192.png', 44, 64);
  const art = (name, width = 820) => raster(`public/images/platform/${name}.webp`, width, H);
  const editorial = (name, width = 820) => raster(`public/images/editorial/${name}-hero.webp`, width, H);

  fs.rmSync(OUT, { recursive: true, force: true });
  let count = 0;
  let bytes = 0;
  const emit = async (el, rel) => {
    const svg = await satori(el, { width: W, height: H, fonts });
    const jpg = await sharp(Buffer.from(svg)).flatten({ background: C.ground }).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
    const file = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, jpg);
    count += 1;
    bytes += jpg.length;
    process.stdout.write(`  ${rel} ${(jpg.length / 1024).toFixed(0)} KB\n`);
  };

  const folio = (a) => String(articles.length - articles.indexOf(a)).padStart(3, '0');
  const counts = meta.counts;

  // ---- site and editorial pages -----------------------------------------
  await emit(card({
    art: await art('home', 840), logo,
    kicker: 'Independent source criticism', title: 'Tracing the origins of', accent: 'early traditions.', size: 80, titleWidth: 640,
    factsList: [`${articles.length} studies`, `${n(counts.hadith)} narrations`, `${n(counts.narrators)} transmitters`]
  }), 'default.jpg');

  const latestArt = articles.slice(0, 3).map((a) => {
    const stem = a.id.split('/').pop().match(/^(\d+)-/)?.[1];
    const file = stem && fs.readdirSync('public/images/blog-editorial').find((f) => f.startsWith(`${stem}-`) && f.endsWith('-720.webp'));
    return file ? `public/images/blog-editorial/${file}` : null;
  }).filter(Boolean);
  await emit(card({
    art: await editorial('academia', 700), logo,
    kicker: 'From the archive', title: 'Research, analysis, and', accent: 'critical inquiry.', size: 74, titleWidth: 600,
    factsList: [`${articles.length} studies`, '4 research branches'],
    signature: proofFan(await Promise.all(latestArt.map((f) => raster(f, 600, 400, { position: 'right', zoom: 1.35 })))), sigPos: { bottom: '30px' }
  }), 'blogs.jpg');

  for (const [page, kicker, title, accent] of [
    ['projects', 'Projects', 'Tools for reading', 'transmission.'],
    ['academia', 'Academia', 'Treatises and', 'critical monographs.'],
    ['youtube', 'Lectures in video', 'Evidence-led forensics for', 'hadith literature.'],
    ['contact', 'Correspondence', 'Write to the', 'editorial desk.'],
    ['resources', 'Resources', 'A working', 'catalogue.']
  ]) {
    await emit(card({ art: await editorial(page, 840), logo, kicker, title, accent, size: 80, titleWidth: 620 }), `${page}.jpg`);
  }

  // ---- categories -------------------------------------------------------
  for (const name of Object.keys(C.category)) {
    const inBranch = articles.filter((a) => a.category === name);
    const [first, ...rest] = name.split(' & ');
    await emit(card({
      art: await art('home', 760), logo,
      kicker: 'Research branch', title: `${first} &`, accent: rest.join(' & '), size: 76, titleWidth: 560,
      factsList: [`${inBranch.length} studies`, `Latest ${inBranch[0].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`],
      signature: branchList(C.category[name], inBranch.slice(0, 3).map((a) => ({ folio: folio(a), title: a.title }))),
      sigPos: { bottom: '30px' }
    }), `category/${categorySlug(name)}.jpg`);
  }

  // ---- research projects ------------------------------------------------
  await emit(card({
    art: await art('corpus'), logo,
    kicker: 'Corpus attestation archive', title: 'The Hadith', accent: 'Research Corpus', arabicTitle: 'الحديث', size: 78, titleWidth: 560,
    factsList: ['Facing Arabic and English', 'No authenticity grading'],
    signature: catalogueCard({
      head: 'Catalogue card', headRight: `Build ${meta.corpusVersion.slice(0, 10)}`, lead: 'Narrations', figure: n(counts.hadith),
      rows: [['Compilations', counts.collections], ['Named transmitters', n(counts.narrators)], ['Chain links', n(counts.chainLinks)]]
    })
  }), 'hadith.jpg');

  await emit(card({
    art: await art('rijal'), logo,
    kicker: 'A critical register', title: 'Rijāl', accent: 'Register', arabicTitle: 'الرجال', size: 92, titleWidth: 520,
    factsList: [`${n(counts.narrators)} transmitters`, `${n(counts.criticismStatements)} attributed statements`],
    signature: centuryChart(meta.facets.centuries)
  }), 'narrators.jpg');

  await emit(card({
    art: await art('qiraat'), logo,
    kicker: 'A comparative reading register', title: 'The Qirāʾāt', accent: 'Variants', arabicTitle: 'القراءات', size: 84, titleWidth: 520,
    factsList: [`${data.qiraat.surasWithData} of 114 suras`, `${data.qiraat.rules} general rules`],
    signature: readersLegend(data.readers)
  }), 'quran.jpg');

  await emit(card({
    art: await art('tafsir'), logo,
    kicker: 'Verse-first reading framework', title: 'Tafsir', accent: 'Reader', arabicTitle: 'التفسير', size: 96, titleWidth: 480,
    factsList: [`${data.tafsir.suras} suras`, `${n(data.tafsir.verses)} verses`],
    signature: verseCard(data.tafsir.opening), sigPos: { bottom: '40px' }
  }), 'tafsir.jpg');

  await emit(card({
    art: await art('atlas'), logo,
    kicker: 'Research atlas', title: 'Islamic Studies', accent: 'Atlas', arabicTitle: 'الدراسات الإسلامية', size: 80, titleWidth: 560,
    factsList: [`${data.atlas.works} works`, `${data.atlas.scholars} scholars`, `${n(data.atlas.citations)} citations`],
    signature: decadeBars(data.atlas.decades), sigPos: { bottom: '30px' }
  }), 'atlas.jpg');

  await emit(card({
    art: await art('icma'), logo,
    kicker: 'Isnād-cum-matn studies', title: 'The ICMA', accent: 'Register', arabicTitle: 'الإسناد والمتن', size: 88, titleWidth: 520,
    factsList: ['Common link and dating on every study'],
    signature: familyMix(data.icma)
  }), 'icma.jpg');

  // ---- collections ------------------------------------------------------
  const corpusArt = await art('corpus', 760);
  const collections = [...meta.collections].sort((a, b) => b.hadith_count - a.hadith_count);
  for (const [i, b] of collections.entries()) {
    await emit(card({
      art: corpusArt, logo,
      kicker: 'Hadith collection', title: b.title_en, arabicTitle: b.title_ar,
      size: b.title_en.length > 26 ? 64 : b.title_en.length > 18 ? 74 : 86, titleWidth: 620,
      factsList: ['Facing Arabic and English', 'No authenticity grading'],
      signature: collectionSlip(String(i + 1).padStart(2, '0'), b.hadith_count)
    }), `collection/${b.slug}.jpg`);
  }

  // ---- transmitter dossiers, one per generation --------------------------
  const rijalArt = await art('rijal', 760);
  const steps = ['Companion', 'Follower', 'Successor', 'Later'];
  const generations = [...meta.facets.generations.map((g) => g.value), ''];
  for (const g of generations) {
    const short = g.replace(/\s*\(.*\)$/, '');
    const active = steps.indexOf(short);
    await emit(card({
      art: rijalArt, logo,
      kicker: 'Rijāl dossier', title: 'Transmitter', accent: 'Dossier', size: 86, titleWidth: 560,
      factsList: [short && short !== 'Unclassified' ? short : 'Teachers, students, critics', 'Attributed criticism only'],
      signature: chain(active, steps)
    }), g ? `narrator/${generationSlug(g)}.jpg` : 'narrator/default.jpg');
  }

  // The manifest src/lib/seo.ts checks before pointing a collection page at a
  // card, so a collection added after this ran falls back to the corpus card.
  const slugs = JSON.stringify(collections.map((b) => b.slug).sort());
  fs.writeFileSync('src/lib/og-cards.ts', `// Generated by scripts/build-og-images.mjs. Do not edit by hand.
// Regenerate with \`npm run build:og\` after adding a collection.
export const COLLECTION_CARDS: ReadonlySet<string> = new Set(${slugs});
`);
  process.stdout.write(`\n${count} cards, ${(bytes / 1024 / 1024).toFixed(1)} MB total\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
