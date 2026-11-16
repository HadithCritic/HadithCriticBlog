/* The resources catalogue: every link on /resources and the shelf, tools and
   GitBook band on the front page. Both pages read this list. */
import youtubeMeta from './youtube-meta.json';

/* A channel's own colors, sampled from its logo. Every ink/background and
   ink/accent pair clears WCAG AA, so the tiles are fixed-color and read the same
   in both themes. A blog with no fetchable logo carries initials instead. */
export type Brand = { bg: string; ink: string; accent: string; logo?: string; initials?: string; shape?: 'app' };

/* Art built into a feature card: a wide image on its own layer, faded into the card's ground. */
export type Art = { src: string; type: 'banner' };

export type Stat = { value: string; label: string };

export type Resource = {
  title: string;
  description: string;
  href: string;
  tag: string;
  brand?: Brand;
  cover?: string;
  pages?: number;
  art?: Art;
  stats?: Stat[];
  texture?: 'engraving' | 'dots' | 'brick' | 'rules' | 'grid' | 'greenbar' | 'lattice';
  meta?: string;
  cta?: string;
};

export type Category = {
  id: string;
  name: string;
  title: string;
  items: Resource[];
};

/* The channel's own numbers come from the YouTube snapshot (npm run sync:youtube). */
const formatCount = (value: number, decimals = 1): string => {
  if (value < 1000) return String(value);
  const scaled = value / 1000;
  const text = scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(decimals);
  return `${text.includes('.') ? text.replace(/\.?0+$/, '') : text}K`;
};
const channelStats: Stat[] = [
  { value: formatCount(youtubeMeta.channel.subscribers, 2), label: 'subscribers' },
  { value: String(youtubeMeta.channel.videos), label: 'videos' },
  { value: formatCount(youtubeMeta.channel.views), label: 'views' }
];

const logo = (name: string) => `/images/resources/logos/${name}.webp`;
const cover = (name: string) => `/images/resources/covers/${name}.webp`;
const art = (name: string) => `/images/resources/art/${name}.webp`;
const doc = (name: string) => `/images/resources/docs/${name}.webp`;

const BRANDS = {
  hadithcritic: { bg: '#0e0f11', ink: '#f2ebdc', accent: '#e2c38a', logo: logo('hadithcritic') },
  qurantalk: { bg: '#151515', ink: '#f5f0e0', accent: '#d1b345', logo: logo('qurantalk') },
  submissionArchives: { bg: '#000000', ink: '#ffffff', accent: '#b4b4b4', logo: logo('submission-archives') },
  submittersCollective: { bg: '#335cc0', ink: '#ffffff', accent: '#e8efff', logo: logo('submitters-collective') },
  godAlone: { bg: '#ffffff', ink: '#000000', accent: '#4a4a4a', logo: logo('god-alone') },
  quranStudy: { bg: '#23444d', ink: '#f4ede4', accent: '#e0b48c', logo: logo('quran-study-archive') },
  quranicLabs: { bg: '#180a29', ink: '#f3ecfa', accent: '#b57cf0', logo: logo('quranic-labs') },
  submissionToGod: { bg: '#1f1106', ink: '#fbf1dc', accent: '#fdbd29', logo: logo('submission-to-god') },
  qurantalkBlog: { bg: '#0a0a0a', ink: '#f5f0e0', accent: '#d6c26f', logo: logo('qurantalk-blog') },
  medium: { bg: '#f5f4f0', ink: '#191919', accent: '#4d4d4d' },
  // WikiSubmission's front page: warm near-black with a tan accent, sampled from the live page.
  // The app is set on the black of its icon, and the Discord server takes its indigo and
  // neon violet from its banner.
  wikisubmission: { bg: '#14110e', ink: '#eee4d0', accent: '#d4a373', logo: logo('wikisubmission') },
  wikisubmissionApp: { bg: '#070606', ink: '#f1ece2', accent: '#d4a373', logo: logo('wikisubmission-app'), shape: 'app' },
  discord19: { bg: '#0f0630', ink: '#f6f1ff', accent: '#c9a2ff', logo: logo('discord-19') },
  // Publication cards take their grounds from the cover: the teal-blue of the Final Testament,
  // the navy of Visual Presentation, the paper gray of a line-printer sheet, the deep green of
  // Quran, Hadith and Islam.
  finalTestament: { bg: '#075e80', ink: '#f2fafd', accent: '#bfe6f5' },
  visualPresentation: { bg: '#061a35', ink: '#eaf0fb', accent: '#a7c0f2' },
  computerSpeaks: { bg: '#dfe2e0', ink: '#15171a', accent: '#2f5d3a' },
  quranHadithIslam: { bg: '#0f1f1e', ink: '#ecf1ee', accent: '#c5d0cc' },
  // Documentary cards take their grounds and accents from each video's thumbnail.
  codeFirstLook: { bg: '#060b16', ink: '#eef3fb', accent: '#8db3e3' },
  basmala: { bg: '#141311', ink: '#f3efe4', accent: '#f2d31b' },
  haMim: { bg: '#17130c', ink: '#f6f0df', accent: '#f0cf16' },
  firewall: { bg: '#0a0f0d', ink: '#f1eee2', accent: '#e2a94a' },
  proof: { bg: '#0d0d0d', ink: '#f5f5ee', accent: '#fff33e' }
} satisfies Record<string, Brand>;

export const RESOURCE_CATEGORIES: Category[] = [
  {
    id: 'gitbooks',
    name: 'GitBooks',
    title: 'Digital manuscripts and studies.',
    items: [
      { title: 'Problematic Sahih Hadith', description: 'Critical analysis of widely accepted hadiths and their contradictions with Quranic principles.', href: 'https://qurantalk.gitbook.io/problematic-sahih-hadith/', tag: 'GitBook' },
      { title: 'Hadith Refutation', description: 'Systematic refutation of hadith authority through textual and theological evidence.', href: 'https://qurantalk.gitbook.io/hadith-refutation/', tag: 'GitBook' },
      { title: 'Quran Initial Count', description: "Mathematical patterns and numerical structure in the Quran's composition.", href: 'https://qurantalk.gitbook.io/quran-initial-count/', tag: 'GitBook' },
      { title: 'Problems in Christianity', description: 'Comparative analysis of Christian theological inconsistencies from a Quranic perspective.', href: 'https://qurantalk.gitbook.io/problems-in-christianity/', tag: 'GitBook' },
      { title: 'False Verses', description: 'Examination of verses incorrectly attributed to divine revelation.', href: 'https://qurantalk.gitbook.io/false-verses/', tag: 'GitBook' },
      { title: 'Muhammad Was Not Illiterate', description: 'Historical and linguistic evidence challenging traditional narratives of prophetic illiteracy.', href: 'https://qurantalk.gitbook.io/muhammad-was-not-illiterate/', tag: 'GitBook' },
      { title: 'Shahada', description: 'Analysis of the testimony of faith and its evolution in Islamic tradition.', href: 'https://qurantalk.gitbook.io/shahada/', tag: 'GitBook' },
      { title: 'Salat', description: 'Quranic approach to prayer practices and ritual worship.', href: 'https://qurantalk.gitbook.io/salat/', tag: 'GitBook' },
      { title: 'Rashad Khalifa Archive', description: 'Comprehensive collection of lectures and videos by Rashad Khalifa.', href: 'https://rashad-khalifa-audios-and-videos.gitbook.io/rashad-khalifa-audios-and-videos', tag: 'GitBook' },
      { title: 'Dietary Prohibitions', description: 'Quranic guidance on permissible and forbidden foods.', href: 'https://qurantalk.gitbook.io/dietary-prohibitions/', tag: 'GitBook' },
      { title: 'Sunni Idol Worship', description: 'Analysis of veneration practices that contradict Quranic monotheism.', href: 'https://qurantalk.gitbook.io/sunni-idol-worship', tag: 'GitBook' }
    ]
  },
  {
    id: 'youtube',
    name: 'Channels',
    title: 'Channels and lectures.',
    items: [
      { title: 'HadithCritic', description: 'Primary channel for critical analysis of hadith sciences and Islamic methodology.', href: 'https://www.youtube.com/@HadithCritic/videos', tag: 'Channel', brand: BRANDS.hadithcritic, stats: channelStats },
      { title: 'QuranTalk', description: 'Discussions and lectures focused on Quranic interpretation and practice.', href: 'https://www.youtube.com/@QuranTalk/videos', tag: 'Channel', brand: BRANDS.qurantalk },
      { title: 'Submission Archives', description: 'Historical lectures and archived content on Quranic submission.', href: 'https://www.youtube.com/@SubmissionArchives/videos', tag: 'Channel', brand: BRANDS.submissionArchives },
      { title: 'Submitters Collective', description: 'Community-driven content exploring Quran-alone perspectives.', href: 'https://www.youtube.com/@SubmittersCollective', tag: 'Channel', brand: BRANDS.submittersCollective },
      { title: 'God Alone', description: 'Educational videos emphasizing strict Quranic monotheism.', href: 'https://www.youtube.com/@godalone7427', tag: 'Channel', brand: BRANDS.godAlone },
      { title: 'Quran Study Archive', description: 'Systematic Quranic study sessions and verse-by-verse analysis.', href: 'https://www.youtube.com/@QuranStudyArchive/videos', tag: 'Channel', brand: BRANDS.quranStudy },
      { title: 'QuranicLabs', description: 'Research-focused content on Quranic numerical patterns and structure.', href: 'https://www.youtube.com/@QuranicLabs19', tag: 'Channel', brand: BRANDS.quranicLabs }
    ]
  },
  {
    id: 'blogs',
    name: 'Blogs',
    title: 'Essays and reflections.',
    items: [
      { title: 'HadithCritic Blog', description: 'Primary blog for detailed analysis and research articles on hadith methodology.', href: 'https://hadithcriticblog.com/', tag: 'Blog', brand: BRANDS.hadithcritic },
      { title: 'Submission to God', description: 'Theological essays and practical guidance for Quran-centered living.', href: 'https://submissiontogod.wordpress.com/', tag: 'Blog', brand: BRANDS.submissionToGod },
      { title: 'QuranTalk Blog', description: 'Regular posts on Quranic interpretation and contemporary issues.', href: 'https://qurantalkblog.com/', tag: 'Blog', brand: BRANDS.qurantalkBlog },
      { title: 'EJ The Submitter', description: 'Personal reflections and analysis from a Quran-alone perspective.', href: 'https://medium.com/@dutchkickboxing1on1', tag: 'Blog', brand: { ...BRANDS.medium, logo: logo('ej-the-submitter') } },
      { title: 'Team Asset', description: 'Personal reflections connecting the Quran to the human being.', href: 'https://medium.com/@team.19.asset', tag: 'Blog', brand: { ...BRANDS.medium, initials: 'TA' } }
    ]
  },
  {
    id: 'pdfs',
    name: 'Publications',
    title: 'Publications and editions.',
    items: [
      { title: 'Quran: The Final Testament', description: 'Complete Quran translation with appendices on mathematical structure.', href: 'https://library.wikisubmission.org/file/books/quran-the-final-testament', tag: 'PDF', cover: cover('final-testament'), pages: 560, brand: BRANDS.finalTestament, texture: 'rules' },
      { title: 'Visual Presentation of the Miracle', description: 'Illustrated guide to the mathematical patterns in the Quran.', href: 'https://library.wikisubmission.org/file/books/visual-presentation-of-the-miracle', tag: 'PDF', cover: cover('visual-presentation'), pages: 252, brand: BRANDS.visualPresentation, texture: 'grid' },
      { title: 'The Computer Speaks', description: 'Computer-assisted analysis revealing Quranic mathematical structure.', href: 'https://library.wikisubmission.org/file/books/the-computer-speaks', tag: 'PDF', cover: cover('computer-speaks'), pages: 280, brand: BRANDS.computerSpeaks, texture: 'greenbar' },
      { title: 'Quran, Hadith and Islam', description: 'Foundational critique of hadith authority from a Quranic perspective.', href: 'https://library.wikisubmission.org/file/books/quran-hadith-and-islam-original', tag: 'PDF', cover: cover('quran-hadith-islam'), pages: 92, brand: BRANDS.quranHadithIslam, texture: 'lattice' }
    ]
  },
  {
    id: 'apps',
    name: 'Tools',
    title: 'Tools and software.',
    items: [
      { title: 'WikiSubmission', description: 'Read, search and study Quran: The Final Testament online, from the WikiSubmission nonprofit.', href: 'https://wikisubmission.org/', tag: 'Tool', brand: BRANDS.wikisubmission, art: { src: art('wikisubmission-bg'), type: 'banner' }, texture: 'engraving', meta: 'wikisubmission.org', cta: 'Open the website' },
      { title: 'WikiSubmission App', description: 'Quran: The Final Testament on iOS in more than ten languages, with bookmarks, notes, audio recitations and search.', href: 'https://apps.apple.com/us/app/wikisubmission/id6444260632', tag: 'Tool', brand: BRANDS.wikisubmissionApp, art: { src: art('wikisubmission-app'), type: 'banner' }, texture: 'dots', meta: 'App Store, iOS', cta: 'View on the App Store' },
      { title: '19 - Submission Server', description: 'The Discord community for studying and discussing the Quran and Submission.', href: 'https://discord.gg/SubmissionServer', tag: 'Tool', brand: BRANDS.discord19, art: { src: art('discord-19'), type: 'banner' }, texture: 'brick', meta: 'Discord', cta: 'Join the server' }
    ]
  },
  {
    id: 'featured',
    name: 'Documentaries',
    title: 'Documentary and evidence.',
    items: [
      { title: 'Code 19: A First Look', description: 'Introduction to the mathematical miracle of the Quran.', href: 'https://www.youtube.com/watch?v=4TUYIuxkAmQ', tag: 'Video', brand: BRANDS.codeFirstLook, art: { src: doc('code-19-first-look'), type: 'banner' }, meta: '44:25 · Submission Archives', cta: 'Watch on YouTube' },
      { title: 'The Basmala Evidence', description: 'Mathematical structure of Bismillah in Quranic composition.', href: 'https://www.youtube.com/watch?v=c-DepvPR-CI', tag: 'Video', brand: BRANDS.basmala, art: { src: doc('basmala'), type: 'banner' }, meta: '17:17 · Submission Archives', cta: 'Watch on YouTube' },
      { title: 'The Ha Mim Pattern', description: 'Analysis of numerical patterns in Ha Mim chapters.', href: 'https://www.youtube.com/watch?v=upWxuDwXB3Y&t=1s', tag: 'Video', brand: BRANDS.haMim, art: { src: doc('ha-mim'), type: 'banner' }, meta: '17:13 · Submission Archives', cta: 'Watch on YouTube' },
      { title: 'The Divine Firewall', description: 'Explanation of Code 19 as protection against textual corruption.', href: 'https://www.youtube.com/watch?v=nO5ikXuDRV8', tag: 'Video', brand: BRANDS.firewall, art: { src: doc('divine-firewall'), type: 'banner' }, meta: '23:04 · Submission Archives', cta: 'Watch on YouTube' },
      { title: 'Proof of Rashad Khalifa', description: "Documentary evidence supporting Rashad Khalifa's messengership.", href: 'https://www.youtube.com/watch?v=BPDkEZoUyXE', tag: 'Video', brand: BRANDS.proof, art: { src: doc('proof-of-rashad-khalifa'), type: 'banner' }, meta: '1:32:46 · Submission Archives', cta: 'Watch on YouTube' }
    ]
  }
];

/** One section of the catalogue by id; a missing one fails the build. */
export function resourceCategory(id: string): Category {
  const category = RESOURCE_CATEGORIES.find((entry) => entry.id === id);
  if (!category) throw new Error(`Resources: no section "${id}" in src/data/site/resources.ts.`);
  return category;
}
