/*
 * Writes src/data/hadith/chapter-cover-meta.json: for each painted 3rd-century collection, one entry per
 * chapter with a short card title and the alt text of its painted plate.
 *
 * The alt text is the scene each plate was painted from, read out of
 * docs/design/third-century-image-prompts.md (the prompt up to its "Setting:" sentence). The short title is
 * cut from the chapter's own English heading in chapter-index.json.
 *
 *   node scripts/hadith/build-chapter-cover-meta.mjs
 *
 * Rerun after a chapter index or a prompt changes. It stops if a chapter has no prompt or a plate is missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PROMPTS = path.join(root, 'docs/design/third-century-image-prompts.md');
const OUT = path.join(root, 'src/data/hadith/chapter-cover-meta.json');

export const PAINTED_SLUGS = [
  'kitab-al-kharaj-yahya-ibn-adam',
  'musnad-al-shafii',
  'hadith-muhammad-ibn-abd-allah-al-ansari',
  'kitab-al-salah-abu-nuaym',
  'musnad-al-humaydi',
  'musnad-ibn-abi-shayba',
  'musnad-khalifa-ibn-khayyat',
  'kitab-al-iman-al-adani',
  'qiraat-al-nabi-al-duri',
  'musnad-sad-ibn-abi-waqqas',
  'birr-al-walidayn',
  'sunan-al-athram',
  'al-marasil-abi-dawud',
];

const MAX_TITLE = 42;

/** Reads the prompt book into slug -> chapter number -> scene sentence(s). */
function readScenes(markdown) {
  const scenes = new Map();
  let slug = null;
  let chapter = null;
  for (const line of markdown.split(/\r?\n/)) {
    const slugLine = line.match(/^- Slug: `([^`]+)`/);
    if (slugLine) {
      slug = slugLine[1];
      scenes.set(slug, new Map());
      chapter = null;
      continue;
    }
    const heading = line.match(/^#### (\d+)\. /);
    if (heading) {
      chapter = Number(heading[1]);
      continue;
    }
    if (slug && chapter !== null && line && !line.startsWith('```') && !line.startsWith('File:')) {
      const scene = line.split(' Setting: ')[0].trim();
      scenes.get(slug).set(chapter, scene);
      chapter = null;
    }
  }
  return scenes;
}

const HONORIFICS = /,?\s*(may God( the Exalted| Almighty)? be pleased with (him|her|them)[^,;]*|\(may God[^)]*\)|ؓ|﵄|﵁|ﷺ|ﷻ|\(ﷺ\))/g;

function cutTitle(title) {
  if (title.length <= MAX_TITLE) return title;
  const clipped = title.slice(0, MAX_TITLE + 1);
  const space = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, space > 20 ? space : MAX_TITLE).replace(/[,;:\s]+$/, '')}…`;
}

/** A card title from a chapter heading: the subject without "Chapter on", formulae or chains. */
export function shortTitle(slug, raw) {
  let t = raw.replace(/\s+/g, ' ').trim();
  t = t.replace(HONORIFICS, '').replace(/\s+,/g, ',').replace(/\s*—\s*/g, ': ').trim();
  t = t.replace(/^In the name of God[^.]*\.\s*/i, '');
  t = t.replace(/^Chapters? on [^.]*\.\s*Chapter:\s*/i, '');
  t = t.replace(/^(Continuation of the )?(chapter|section)( on| regarding)?[:\s]*/i, (m, cont) => (cont ? 'More on ' : ''));
  t = t.replace(/^What (has come|is mentioned) (regarding|about|on) /i, '');
  t = t.replace(/^From the (Book|Abridgment) (of|on) (the )?/i, '').replace(/^From the Greater Book of /i, '').replace(/^Reports extracted from the Book of /i, '');
  t = t.replace(/^Book of /i, '');
  t = t.replace(/^(The )?(Ḥadīth|Hadiths?|Musnad|Narrations?|Reports?|Two (narrations|reports)) of /i, '');
  if (/narrated/i.test(t)) t = t.replace(/^What (was narrated by )?/i, '').replace(/ ?narrated from the (Prophet|Messenger of God).*$/i, '');
  t = t.replace(/ from the Messenger of God.*$/i, '').replace(/ from the Prophet\s*$/i, '');
  t = t.replace(/^And from Surat /i, 'Sūrat ').replace(/^From Surat /i, 'Sūrat ');
  t = t.replace(/^[[\]]+|[[\]]/g, '').replace(/^On /, '').replace(/[\s.,;]+$/, '').trim();
  if (slug === 'hadith-muhammad-ibn-abd-allah-al-ansari') t = t.replace(/^(Muḥammad b. ʿAbd Allāh al-Anṣārī|al-Anṣārī|Sulaymān al-Taymī|al-Taymī) from /, 'From ');
  if (slug === 'musnad-al-shafii') {
    t = t.split(';')[0].replace(/\s*\(al-Rabīʿ[^)]*\)?.*$/, '');
    t = t.replace(/,? (excluding repeat(s|ed material)|(material )?not (directly )?heard from.*|material al-Rabīʿ.*)$/i, '');
  }
  if (!t) t = 'Further reports';
  return cutTitle(t.charAt(0).toUpperCase() + t.slice(1));
}

function altFor(scene) {
  const text = scene.replace(/\.$/, '');
  return `${text}, painted in oils.`;
}

function main() {
  const scenes = readScenes(fs.readFileSync(PROMPTS, 'utf8'));
  const out = {};
  for (const slug of PAINTED_SLUGS) {
    const index = JSON.parse(fs.readFileSync(path.join(root, 'src/data/hadith/pages', slug, 'chapter-index.json'), 'utf8'));
    const bySlug = scenes.get(slug);
    if (!bySlug) throw new Error(`${slug}: not in the prompt book`);
    out[slug] = index.map((chapter) => {
      const scene = bySlug.get(chapter.n);
      if (!scene) throw new Error(`${slug}: no prompt for chapter ${chapter.n}`);
      const file = path.join(root, 'public/images/hadith/chapter-covers', slug, `${String(chapter.n).padStart(2, '0')}.webp`);
      if (!fs.existsSync(file)) throw new Error(`${slug}: missing plate ${path.relative(root, file)}`);
      return { n: chapter.n, title: shortTitle(slug, chapter.title_en), alt: altFor(scene) };
    });
  }
  fs.writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);
  const total = Object.values(out).reduce((sum, list) => sum + list.length, 0);
  console.log(`Wrote ${path.relative(root, OUT)}: ${total} chapters in ${PAINTED_SLUGS.length} collections`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
