const fs = require('fs');

const rawData = fs.readFileSync('src/data/videos_parsed.json', 'utf8');
const allVideos = JSON.parse(rawData);

// Map to Astro structure
const videosArray = allVideos.map((v, i) => {
  const titleLower = v.title.toLowerCase();
  let category = 'history';
  if (titleLower.includes('prophecy') || titleLower.includes('dajjal') || titleLower.includes('mahdi') || titleLower.includes('jesus')) {
    category = 'prophecy';
  } else if (titleLower.includes('epistemolog') || titleLower.includes('certainty') || titleLower.includes('science') || titleLower.includes('chain')) {
    category = 'epistemology';
  } else if (titleLower.includes('quran') || titleLower.includes('god') || titleLower.includes('theology') || titleLower.includes('satanic') || titleLower.includes('allah')) {
    category = 'theology';
  } else if (titleLower.includes('philosophy') || titleLower.includes('logic') || titleLower.includes('induction')) {
    category = 'philosophy';
  }
  
  return {
    id: v.id,
    title: v.title,
    thumbnail: v.thumbnail,
    duration: v.duration,
    views: v.views,
    date: '2024',
    category: category,
    description: '',
  };
});

let code = fs.readFileSync('src/pages/youtube.astro', 'utf8');

const startIdx = code.indexOf('const videos: Video[] = [');
const endIdx = code.indexOf('];', startIdx) + 2;

const newVideosStr = 'const videos: Video[] = ' + JSON.stringify(videosArray, null, 2).replace(/"([^"]+)":/g, '$1:') + ';';

code = code.substring(0, startIdx) + newVideosStr + code.substring(endIdx);

fs.writeFileSync('src/pages/youtube.astro', code);
console.log('Successfully injected ' + videosArray.length + ' videos');
