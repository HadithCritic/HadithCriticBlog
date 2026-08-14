const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '../src/content/articles');
const outDir = path.join(__dirname, '../public');

const glob = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) results = results.concat(glob(full));
    else if (file.endsWith('.md') || file.endsWith('.mdx')) results.push(full);
  });
  return results;
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseFrontmatter(raw) {
  const parts = raw.split('---');
  if (parts.length < 3) return { data: {}, content: raw };
  const front = parts[1];
  const content = parts.slice(2).join('---');

  const data = {};
  const titleMatch = front.match(/title:\s*["']?([^"'\n\r]+)["']?/);
  if (titleMatch) data.title = titleMatch[1].trim();

  const descMatch = front.match(/description:\s*["']?([^"'\n\r]+)["']?/);
  if (descMatch) data.description = descMatch[1].trim();

  const catMatch = front.match(/category:\s*["']?([^"'\n\r]+)["']?/);
  if (catMatch) data.category = catMatch[1].trim();

  const tagsMatch = front.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    data.tags = tagsMatch[1]
      .split(',')
      .map(t => t.replace(/["'\s]/g, '').trim())
      .filter(Boolean);
  }

  const dateMatch = front.match(/date:\s*["']?([^"'\n\r]+)["']?/);
  if (dateMatch) data.date = dateMatch[1].trim();

  return { data, content };
}

function cleanMarkdown(md) {
  return md
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
    .replace(/export\s+const\s+[\s\S]*?;\n/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSections(rawContent) {
  const sections = [];
  const lines = rawContent.split('\n');
  let currentHeading = 'Introduction';
  let currentSlug = '';
  let currentParagraphs = [];

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      if (currentParagraphs.length > 0) {
        sections.push({
          heading: currentHeading,
          slug: currentSlug,
          text: cleanMarkdown(currentParagraphs.join(' '))
        });
      }
      currentHeading = headerMatch[1].trim();
      currentSlug = slugify(currentHeading);
      currentParagraphs = [];
    } else {
      if (!line.startsWith('import ') && !line.startsWith('export ')) {
        currentParagraphs.push(line);
      }
    }
  }

  if (currentParagraphs.length > 0) {
    sections.push({
      heading: currentHeading,
      slug: currentSlug,
      text: cleanMarkdown(currentParagraphs.join(' '))
    });
  }

  return sections;
}

function buildIndex() {
  const files = glob(articlesDir);
  const searchIndex = [];

  files.forEach(file => {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = parseFrontmatter(raw);
    
    const relPath = path.relative(articlesDir, file).replace(/\\/g, '/');
    const id = relPath.replace(/\.(md|mdx)$/, '');

    const sections = extractSections(content);
    const fullText = cleanMarkdown(content);

    searchIndex.push({
      id,
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      tags: data.tags || [],
      date: data.date || '',
      sections,
      fullText
    });
  });

  const outFile = path.join(outDir, 'search-index.json');
  fs.writeFileSync(outFile, JSON.stringify(searchIndex), 'utf8');
  console.log(`Generated search index with ${searchIndex.length} articles at ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);
}

buildIndex();
