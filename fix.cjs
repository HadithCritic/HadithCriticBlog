const fs = require('fs');
let code = fs.readFileSync('src/pages/youtube.astro', 'utf8');

// 1. Remove "Collections Curated Series" section (playlists section)
code = code.replace(/\{\/\* ═══════════════════════════════════════════\s*PLAYLISTS: Horizontal momentum scroll\s*═══════════════════════════════════════════ \*\/\}\s*<section class="yt-playlists"[\s\S]*?<\/section>/, '');
// And its array:
code = code.replace(/const playlists = \[\s*\{[\s\S]*?\];/g, '');

// 2. Remove cursor effect html
code = code.replace(/<div class="custom-cursor" id="cursor" aria-hidden="true">[\s\S]*?<\/div>/, '');

// 3. Remove background image
code = code.replace(/url\('\/images\/YTbanner\.png'\)/, "none");

// 4. Remove cursor JS
code = code.replace(/\/\/ ── Custom Cursor ─────────────────────────[\s\S]*?\/\/ ── Scroll Progress ─────────────────────/, '// ── Scroll Progress ─────────────────────');

// 5. Replace videos array with the videos from the channel
const vids = [
  {
    id: '6bpJBji3E0M',
    title: "The Truth About 'The Crucifixion of Jesus'",
    thumbnail: 'https://i.ytimg.com/vi/6bpJBji3E0M/maxresdefault.jpg',
    duration: '28:11',
    views: '11.8K',
    date: '2024',
    category: 'theology',
    description: '',
  },
  {
    id: 'HWHjCfaPn_0',
    title: 'Hadith Can Never Reach Epistemological Certainty.',
    thumbnail: 'https://i.ytimg.com/vi/HWHjCfaPn_0/maxresdefault.jpg',
    duration: '8:58',
    views: '5.2K',
    date: '2024',
    category: 'epistemology',
    description: '',
  },
  {
    id: 'xhDQSpYjqQ8',
    title: 'Refuting OrthodoxMuslim & His Baghdad Failures',
    thumbnail: 'https://i.ytimg.com/vi/xhDQSpYjqQ8/maxresdefault.jpg',
    duration: '10:58',
    views: '3.4K',
    date: '2024',
    category: 'prophecy',
    description: '',
  },
  {
    id: '2sgC2CaJxqk',
    title: 'The FAILED Baghdad Hadith Prophecy That Never Was',
    thumbnail: 'https://i.ytimg.com/vi/2sgC2CaJxqk/maxresdefault.jpg',
    duration: '21:21',
    views: '6.7K',
    date: '2024',
    category: 'prophecy',
    description: '',
  },
  {
    id: 'MLaRB6uGhAk',
    title: 'How One Quranic Story Refutes All Sunni Jurisprudence',
    thumbnail: 'https://i.ytimg.com/vi/MLaRB6uGhAk/maxresdefault.jpg',
    duration: '6:20',
    views: '4.1K',
    date: '2024',
    category: 'history',
    description: '',
  },
  {
    id: 'YTMWY2wsmNA',
    title: 'Your Imam Can’t Outrule God’s Words (Refutation of Imām al-Shāfiʿī)',
    thumbnail: 'https://i.ytimg.com/vi/YTMWY2wsmNA/maxresdefault.jpg',
    duration: '37:52',
    views: '8.2K',
    date: '2023',
    category: 'theology',
    description: '',
  },
  {
    id: 'O79Y4X4tcyM',
    title: 'The Anatomy of Hypocrisy',
    thumbnail: 'https://i.ytimg.com/vi/O79Y4X4tcyM/maxresdefault.jpg',
    duration: '21:53',
    views: '2.3K',
    date: '2023',
    category: 'philosophy',
    description: '',
  }
];

const startIdx = code.indexOf('const videos: Video[] = [');
const endIdx = code.indexOf('];', startIdx) + 2;
code = code.substring(0, startIdx) + 'const videos: Video[] = ' + JSON.stringify(vids, null, 2).replace(/"([^"]+)":/g, '$1:') + ';' + code.substring(endIdx);

fs.writeFileSync('src/pages/youtube.astro', code);
console.log('done');
