const fs = require('fs');

let content = fs.readFileSync('23-battle-of-the-isnads-judaism-vs-christianity-vs-islam.mdx', 'utf-8');

const importStatement = `import IsnadDiagram from '../../components/IsnadDiagram.astro';

export const judaicNodes = [
  { id: 'god', label: 'God\\n(The Source)', kind: 'root', x: 400, y: 800, labelPos: 'right' },
  { id: 'moses', label: 'Moses\\n(The Prophet)', kind: 'cl', x: 400, y: 700, labelPos: 'right' },
  
  { id: 'joshua', label: 'Joshua', x: 250, y: 600, labelPos: 'left' },
  { id: 'pinchas', label: 'Pinchas', x: 400, y: 600, labelPos: 'left' },
  { id: 'elders', label: 'The Elders', x: 550, y: 600, labelPos: 'right' },
  
  { id: 'eli', label: 'Eli\\n(The High Priest)', kind: 'cl', x: 400, y: 500, labelPos: 'right' },
  { id: 'samuel', label: 'Samuel\\n(The Prophet)', kind: 'cl', x: 400, y: 400, labelPos: 'right' },
  { id: 'david', label: 'David\\n(The King)', kind: 'cl', x: 400, y: 300, labelPos: 'right' },
  { id: 'prophets', label: 'The Prophets\\n(Elijah, Elisha...)', x: 400, y: 200, labelPos: 'right' },
  { id: 'ezra', label: 'Ezra & The Great Assembly', x: 400, y: 100, labelPos: 'right' }
];

export const judaicEdges = [
  { from: 'god', to: 'moses', kind: 'trunk' },
  { from: 'moses', to: 'joshua', kind: 'trunk' },
  { from: 'moses', to: 'pinchas', kind: 'trunk' },
  { from: 'moses', to: 'elders', kind: 'trunk' },
  
  { from: 'joshua', to: 'eli', kind: 'trunk' },
  { from: 'pinchas', to: 'eli', kind: 'trunk' },
  { from: 'elders', to: 'eli', kind: 'trunk' },
  
  { from: 'eli', to: 'samuel', kind: 'trunk' },
  { from: 'samuel', to: 'david', kind: 'trunk' },
  { from: 'david', to: 'prophets', kind: 'trunk' },
  { from: 'prophets', to: 'ezra', kind: 'trunk' }
];
`;

content = content.replace(/import BibleVerse from '\.\.\/\.\.\/components\/article\/BibleVerse\.astro';/, `import BibleVerse from '../../components/article/BibleVerse.astro';\n${importStatement}`);

const htmlDiagram = `<div class="judaicIsnad" aria-label="Judaic Chain of Transmission">
  <div class="isnadStep"><strong>God</strong> <span>(The Source)</span></div>
  <div class="isnadArrow">↓</div>
  <div class="isnadStep"><strong>Moses</strong> <span>(The Prophet)</span></div>
  <div class="isnadArrow">↓</div>
  <div class="isnadStep split">
    <div><strong>Joshua</strong></div>
    <div><strong>Pinchas</strong></div>
    <div><strong>The Elders</strong></div>
  </div>
  <div class="isnadArrow">↓</div>
  <div class="isnadStep"><strong>Eli</strong> <span>(The High Priest)</span></div>
  <div class="isnadArrow">↓</div>
  <div class="isnadStep"><strong>Samuel</strong> <span>(The Prophet)</span></div>
  <div class="isnadArrow">↓</div>
  <div class="isnadStep"><strong>David</strong> <span>(The King)</span></div>
  <div class="isnadArrow">↓</div>
  <div class="isnadStep"><strong>The Prophets</strong> <span>(Elijah → Elisha → Isaiah → Jeremiah...)</span></div>
  <div class="isnadArrow">↓</div>
  <div class="isnadStep"><strong>Ezra & The Great Assembly</strong></div>
</div>`;

content = content.replace(htmlDiagram, `<IsnadDiagram nodes={judaicNodes} edges={judaicEdges} caption="Judaic Chain of Transmission (Oral Torah)" width={800} height={850} />`);

// Remove the CSS styles at the bottom
const styleBlockRegex = /<style>\{`[\s\S]*?`\}<\/style>/;
content = content.replace(styleBlockRegex, '');

fs.writeFileSync('23-battle-of-the-isnads-judaism-vs-christianity-vs-islam.mdx', content, 'utf-8');
console.log('Fixed 23 diagram');
