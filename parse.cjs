const fs = require('fs');
let text = fs.readFileSync('src/data/yt_videos.json', 'utf16le');
if (text.charCodeAt(0) === 0xFEFF) {
  text = text.slice(1);
}
const lines = text.split('\n').filter(Boolean);
const vids = lines.map(l => JSON.parse(l)).map(d => ({
  id: d.id, 
  title: d.title, 
  duration: Math.floor(d.duration/60)+':'+(Math.floor(d.duration%60)).toString().padStart(2, '0'), 
  views: d.view_count ? (d.view_count/1000).toFixed(1)+'K' : 'N/A',
  thumbnail: 'https://i.ytimg.com/vi/'+d.id+'/maxresdefault.jpg'
}));
fs.writeFileSync('src/data/videos_parsed.json', JSON.stringify(vids, null, 2));
