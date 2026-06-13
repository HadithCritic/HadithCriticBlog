import fs from 'fs';
import path from 'path';

const articlesDir = path.join(process.cwd(), 'src/content/articles');

// Get all MDX files sorted by date to determine article number
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'));
const articles = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
  const dateMatch = content.match(/^date:\s*(.+)$/m);
  if (dateMatch) {
    articles.push({ file, date: dateMatch[1].trim() });
  }
}

articles.sort((a, b) => a.date.localeCompare(b.date));

// Available thumbnails (mapped by article number)
const thumbnailMap = {
  22: '/images/blog_thumbnails/tn.22.webp',
  67: '/images/blog_thumbnails/tn.67.webp',
  70: '/images/blog_thumbnails/tn.70.png',
  71: '/images/blog_thumbnails/tn.71.png',
  72: '/images/blog_thumbnails/tn.72.png',
  73: '/images/blog_thumbnails/tn.73.png',
  74: '/images/blog_thumbnails/tn.74.png',
};

const genericThumbnail = '/images/blog_thumbnails/tn.generic.webp';

let changed = 0;

articles.forEach((article, index) => {
  const articleNum = index + 1;
  const newThumbnail = thumbnailMap[articleNum] || genericThumbnail;
  
  const filePath = path.join(articlesDir, article.file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace the thumbnail line in frontmatter
  const updated = content.replace(
    /^thumbnail:\s*"[^"]*"$/m,
    `thumbnail: "${newThumbnail}"`
  );
  
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf-8');
    console.log(`#${articleNum} ${article.file} → ${newThumbnail}`);
    changed++;
  } else {
    // Check if already correct
    const currentMatch = content.match(/^thumbnail:\s*"([^"]*)"$/m);
    if (currentMatch && currentMatch[1] === newThumbnail) {
      console.log(`#${articleNum} ${article.file} — already correct`);
    } else {
      console.log(`#${articleNum} ${article.file} — no thumbnail field found`);
    }
  }
});

console.log(`\nDone. Updated ${changed} files.`);
