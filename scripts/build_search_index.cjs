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
  if (dateMatch) {
    const rawDate = dateMatch[1].trim();
    const d = new Date(rawDate);
    data.date = isNaN(d.getTime()) ? rawDate : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return { data, content };
}

function stripCodeAndMdx(content) {
  // Strip import statements
  let clean = content.replace(/^import\s+[\s\S]*?;(?:\r?\n|$)/gm, '');
  clean = clean.replace(/^import\s+['"][^'"]+['"];?(?:\r?\n|$)/gm, '');

  // Strip multi-line/single-line export blocks
  clean = clean.replace(/^export\s+(?:const|let|var|function|default)\s+[\s\S]*?;(?:\r?\n|$)/gm, '');
  
  // Strip code blocks
  clean = clean.replace(/```[\s\S]*?```/g, ' ');

  // Strip JSX / MDX components (like <IsnadDiagram ... />, <HadithBlock>...</HadithBlock>, etc.)
  clean = clean.replace(/<[A-Z][A-Za-z0-9_]*[\s\S]*?(\/>|<\/[A-Z][A-Za-z0-9_]*>)/g, ' ');
  // Strip standard HTML tags and comments
  clean = clean.replace(/<!--[\s\S]*?-->/g, ' ');
  clean = clean.replace(/<[^>]+>/g, ' ');

  return clean;
}

function cleanMarkdown(md) {
  return stripCodeAndMdx(md)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
    .replace(/\[\^[^\]]+\]:?[^\n]*/g, '') // footnotes
    .replace(/^#+\s+/gm, '') // headings
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/[*_~]+/g, '') // emphasis
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSections(rawContent) {
  const sanitized = stripCodeAndMdx(rawContent);
  const sections = [];
  const lines = sanitized.split(/\r?\n/);
  let currentHeading = 'Introduction';
  let currentSlug = '';
  let currentParagraphs = [];

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      const sectionText = cleanMarkdown(currentParagraphs.join(' '));
      if (sectionText.length > 20) {
        sections.push({
          heading: currentHeading,
          slug: currentSlug,
          text: sectionText
        });
      }
      currentHeading = headerMatch[1].trim();
      currentSlug = slugify(currentHeading);
      currentParagraphs = [];
    } else {
      currentParagraphs.push(line);
    }
  }

  const lastSectionText = cleanMarkdown(currentParagraphs.join(' '));
  if (lastSectionText.length > 20) {
    sections.push({
      heading: currentHeading,
      slug: currentSlug,
      text: lastSectionText
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
