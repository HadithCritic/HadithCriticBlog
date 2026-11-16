/* The front page open source figures: the src/data folders as a tree with
   their file counts, and the three setup tabs (read the data, run the site,
   cite a source), whose sample record and citation are read from one hadith
   JSON export. Every count is read from disk at build time. Build time only. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import packageJson from '../../package.json';

export const GITHUB_REPO = 'https://github.com/HadithCritic/HadithCriticBlog';
const SITE = 'https://hadithcriticblog.com';
const DATA_DIR = 'src/data';

/* The narration the "Read the data" and "Cite a source" tabs show. Any
   narration in a collection with chapter pages will build. */
const SAMPLE = { slug: 'al-jami-ibn-wahb', id: '303' };

/* What each folder holds. Every top-level folder needs a line, so a new area
   cannot appear in the tree unexplained; a subfolder without one shows only
   its count. */
const NOTES: Record<string, string> = {
  hadith: 'The hadith collections: the edited page of every collection and chapter, and their JSON exports.',
  'hadith/pages': 'One folder per collection, with its landing page and a page per chapter, edited as HTML.',
  'hadith/json': 'One bilingual JSON file per collection, every narration in Arabic and English.',
  'hadith/local-editions': 'The source text of Ṣaḥīfat Hammām and Faḍāʾil Makka, which have readers of their own.',
  tafsir: 'The four commentaries on the Qur\'an and the registry that lists them.',
  'tafsir/pages': 'Mujāhid, al-Thawrī, al-Zamakhsharī and al-Ṭabarī on al-Fātiḥa, one HTML file per surah.',
  'tafsir/tabari': 'Al-Ṭabarī on every other surah, one JSON file each.',
  rijal: 'The narrators register, from Ibn Ḥajar\'s Taqrīb al-Tahdhīb.',
  'rijal/taqrib': 'One record per biography, with the fields read from the Arabic.',
  'rijal/pages': 'The register\'s pages, prebuilt as HTML.',
  history: 'The history library: the books it holds and their readers.',
  'history/readers': 'Each book as one prebuilt, editable HTML document.',
  quran: 'Surah names, their English senses and the verse text.',
  research: 'The academic studies, the ICMA families and the research graph.',
  blog: 'Artwork and crops for the studies.',
  site: 'Front page data: the map coastline, the YouTube snapshot and the resources catalogue.',
};

export interface TreeNode {
  path: string;
  name: string;
  files: number;
  note: string | null;
  children: TreeNode[];
}

export interface SetupStep {
  text: string;
  code: string | null;
}

export interface SetupTab {
  id: string;
  label: string;
  steps: SetupStep[];
  /** A block shown after the steps: what the last step prints or gives. */
  result: { label: string; text: string } | null;
}

export interface OpenSourceFigure {
  repo: string;
  tree: TreeNode[];
  files: number;
  tabs: SetupTab[];
}

const fail = (message: string): never => {
  throw new Error(`Front page open source: ${message}`);
};

const root = (path: string) => resolve(process.cwd(), path);

function countFiles(dir: string): number {
  return readdirSync(dir, { withFileTypes: true }).reduce(
    (total, entry) => total + (entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1),
    0,
  );
}

const subfolders = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

function node(path: string, depth: number): TreeNode {
  const dir = root(`${DATA_DIR}/${path}`);
  const note = NOTES[path] ?? (depth === 0 ? fail(`src/data/${path} has no line in NOTES (home-open-source.ts).`) : null);
  return {
    path,
    name: path.split('/').pop() ?? path,
    files: countFiles(dir),
    note,
    children: depth === 0 ? subfolders(dir).map((name) => node(`${path}/${name}`, 1)) : [],
  };
}

interface ExportEntry {
  id: string;
  number?: string;
  citation?: string;
  isnad_ar?: string;
  matn_ar?: string;
  isnad_en?: string;
  matn_en?: string;
}

interface CompilationExport {
  title_en: string;
  entry_count: number;
  sections: Array<{ entries: ExportEntry[] }>;
}

/* The chapter page that holds a narration, found by its anchor. */
function narrationHref(slug: string, id: string): string {
  const dir = root(`src/data/hadith/pages/${slug}/chapters`);
  const chapter = readdirSync(dir).find((file) => readFileSync(join(dir, file), 'utf8').includes(`id="hadith-${id}"`));
  if (!chapter) return fail(`narration ${id} is on no chapter page of ${slug}.`);
  return `${SITE}/hadith/collection/${slug}/chapter/${chapter.replace(/\.html$/, '')}/#hadith-${id}`;
}

function setupTabs(): SetupTab[] {
  const { slug, id } = SAMPLE;
  const jsonPath = `${DATA_DIR}/hadith/json/${slug}.json`;
  const data = JSON.parse(readFileSync(root(jsonPath), 'utf8')) as CompilationExport;
  const entry = data.sections.flatMap((section) => section.entries).find((item) => item.id === id);
  if (!entry?.citation || !entry.matn_en) return fail(`${slug} #${id} is missing, or has no citation or English.`);
  const jsonFiles = readdirSync(root(`${DATA_DIR}/hadith/json`)).filter((name) => name.endsWith('.json')).length;
  const nodeVersion = packageJson.engines?.node ?? fail('package.json gives no Node version.');
  const dir = GITHUB_REPO.split('/').pop();

  return [
    {
      id: 'data',
      label: 'Read the data',
      steps: [
        { text: `Every collection is one JSON file, ${jsonFiles} in all, in`, code: `${DATA_DIR}/hadith/json/` },
        { text: `Narrations sit in sections, each with its isnad and matn in Arabic and English. ${data.title_en} has ${data.entry_count}:`, code: `jq '.sections[].entries[] | select(.id == "${id}")' ${jsonPath}` },
      ],
      result: { label: 'Output', text: JSON.stringify(entry, null, 2) },
    },
    {
      id: 'run',
      label: 'Run the site',
      steps: [
        { text: 'Clone the repository.', code: `git clone ${GITHUB_REPO}.git` },
        { text: `Install the packages with Node ${nodeVersion.replace('>=', '')} or later.`, code: `cd ${dir} && npm install` },
        { text: 'Start the dev server; it serves on 127.0.0.1:4321.', code: 'npm run dev' },
      ],
      result: null,
    },
    {
      id: 'cite',
      label: 'Cite a source',
      steps: [
        { text: 'Each narration carries its printed edition, volume and page in its citation field.', code: entry.citation },
        { text: 'Cite that, and link the narration on its chapter page.', code: null },
      ],
      result: {
        label: 'Citation',
        text: `${data.title_en}, no. ${entry.number ?? id} (${entry.citation.split(' · ').slice(1).join(', ')}). HadithCritic, ${narrationHref(slug, id)}`,
      },
    },
  ];
}

export function openSourceFigure(): OpenSourceFigure {
  const dataDir = root(DATA_DIR);
  if (!statSync(dataDir).isDirectory()) fail('src/data is missing.');
  const tree = subfolders(dataDir).map((name) => node(name, 0));
  return {
    repo: GITHUB_REPO,
    tree,
    files: tree.reduce((total, folder) => total + folder.files, 0),
    tabs: setupTabs(),
  };
}
