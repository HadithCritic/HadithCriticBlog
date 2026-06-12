const fs = require('fs');
const path = require('path');

const filesToInclude = [
  'src/pages/blogs/the-abbasid-mahdi.astro',
  'src/components/article/ArticleProse.astro',
  'src/components/article/HadithBlock.astro',
  'src/components/article/SourceComparisonTable.astro',
  'src/components/article/IsnadMap.astro',
  'src/components/article/ContextNote.astro',
  'src/components/article/VerdictBox.astro',
  'src/components/article/ClaimBox.astro',
  'src/styles/article.css',
  'src/styles/global.css'
];

let output = `# HadithCritic Blog Component Context\n\nThis document contains the source code for the custom Astro components, styling, and the template usage example used to construct the rich articles on the HadithCritic blog. You can use this as context to format markdown into the proper components.\n\n`;

const ROOT = path.join(__dirname, '..');

for (const relPath of filesToInclude) {
  const fullPath = path.join(ROOT, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const ext = path.extname(fullPath).substring(1);
    output += `## \`${relPath}\`\n\n\`\`\`${ext}\n${content}\n\`\`\`\n\n`;
  } else {
    output += `## \`${relPath}\`\n\n(File not found)\n\n`;
  }
}

fs.writeFileSync(path.join(ROOT, 'docs', 'blog-components-context.md'), output, 'utf8');
console.log('Successfully generated blog_components_context.md');
