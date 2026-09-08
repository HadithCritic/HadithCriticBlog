const fs = require('fs');

let content = fs.readFileSync('21-hadith-the-prophet-was-bewitched-by-a-jew.mdx', 'utf-8');

const importStatement = `import IsnadDiagram from '../../components/IsnadDiagram.astro';

export const bewitchmentNodes = [
  { id: 'prophet', label: 'Prophet Muhammad', kind: 'root', x: 400, y: 700, labelPos: 'right' },
  { id: 'aisha', label: 'ʿĀʾishah', x: 250, y: 600, labelPos: 'left' },
  { id: 'urwa', label: 'ʿUrwah b. al-Zubayr', x: 250, y: 500, labelPos: 'left' },
  { id: 'hisham', label: 'Hishām b. ʿUrwah', kind: 'cl', x: 250, y: 400, labelPos: 'left' },
  { id: 'yahya', label: 'Yaḥyā\\n(Aḥmad 24237)', x: 100, y: 200, labelPos: 'below' },
  { id: 'hammad', label: 'Ḥammād b. Usāma\\n(Aḥmad 24348)', x: 250, y: 200, labelPos: 'below' },
  { id: 'ibn_numayr', label: 'Ibn Numayr\\n(Aḥmad 24300)', x: 400, y: 200, labelPos: 'below' },

  { id: 'zayd', label: 'Zayd b. Arqam', x: 550, y: 600, labelPos: 'right' },
  { id: 'yazid', label: 'Yazīd b. Ḥayyān', x: 550, y: 500, labelPos: 'right' },
  { id: 'amash', label: 'al-Aʿmash', kind: 'cl', x: 550, y: 400, labelPos: 'right' },
  { id: 'abu_muawiyah', label: 'Abū Muʿāwiyah', x: 550, y: 300, labelPos: 'right' },
  
  { id: 'tabarani', label: 'Ṭabarānī 5016', x: 450, y: 150, labelPos: 'below' },
  { id: 'nasai', label: 'Nasāʾī 4080 / 3529', x: 550, y: 150, labelPos: 'below' },
  { id: 'ahmad_kufan', label: 'Aḥmad 19267', x: 650, y: 150, labelPos: 'below' }
];

export const bewitchmentEdges = [
  { from: 'prophet', to: 'aisha', kind: 'trunk' },
  { from: 'aisha', to: 'urwa', kind: 'trunk' },
  { from: 'urwa', to: 'hisham', kind: 'trunk' },
  { from: 'hisham', to: 'yahya' },
  { from: 'hisham', to: 'hammad' },
  { from: 'hisham', to: 'ibn_numayr' },
  
  { from: 'prophet', to: 'zayd', kind: 'trunk' },
  { from: 'zayd', to: 'yazid', kind: 'trunk' },
  { from: 'yazid', to: 'amash', kind: 'trunk' },
  { from: 'amash', to: 'abu_muawiyah' },
  { from: 'abu_muawiyah', to: 'tabarani' },
  { from: 'abu_muawiyah', to: 'nasai' },
  { from: 'abu_muawiyah', to: 'ahmad_kufan' },
  
  { from: 'hisham', to: 'amash', kind: 'transfer' }
];
`;

content = content.replace(/import QuranVerse from '\.\.\/\.\.\/components\/article\/QuranVerse\.astro';/, `import QuranVerse from '../../components/article/QuranVerse.astro';\n${importStatement}`);

content = content.replace(/!\[\]\(https:\/\/hadithcriticblog\.com\/wp-content\/uploads\/2025\/01\/Screenshot-2025-01-12-130823-1024x575\.png\)/, `<IsnadDiagram nodes={bewitchmentNodes} edges={bewitchmentEdges} caption="Isnād Map of the Bewitchment Hadith" width={800} height={800} />`);

fs.writeFileSync('21-hadith-the-prophet-was-bewitched-by-a-jew.mdx', content, 'utf-8');
console.log('Fixed diagram in 21');
