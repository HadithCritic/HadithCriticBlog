const fs = require('fs');

let content = fs.readFileSync('22-the-abbasid-mahdi-the-black-banners-abu-abbas-al-saffah.mdx', 'utf-8');

const importStatement = `import IsnadDiagram from '../../components/IsnadDiagram.astro';

export const groupANodes = [
  { id: 'abu_hashim', x: 400, y: 700, label: 'Abū Hāshim b. Muḥammad\\nb. al-Ḥanafiyya', kind: 'root', labelPos: 'right' },
  { id: 'muhammad_ali', x: 400, y: 550, label: 'Muḥammad b. ʿAlī al-ʿAbbāsī', labelPos: 'right' },
  { id: 'maysara', x: 200, y: 400, label: 'Maysara → Kūfa', labelPos: 'left' },
  { id: 'anonymous', x: 600, y: 400, label: 'Anonymous → Khurāsān', labelPos: 'right' },
  { id: 'call', x: 600, y: 300, label: '\\'call to al-riḍā;\\ndo not name anyone\\'', labelPos: 'right' },
  { id: 'responders', x: 600, y: 200, label: '70 responders → 12 naqībs', labelPos: 'right' },
  { id: 'abu_muslim', x: 600, y: 100, label: 'Abū Muslim al-Khurāsānī', labelPos: 'right' },
  { id: 'ibrahim_abbas', x: 600, y: 0, label: 'Ibrāhīm al-Imām →\\nAbū al-ʿAbbās al-Saffāḥ', labelPos: 'right' }
];

export const groupAEdges = [
  { from: 'abu_hashim', to: 'muhammad_ali', kind: 'trunk' },
  { from: 'muhammad_ali', to: 'maysara' },
  { from: 'muhammad_ali', to: 'anonymous' },
  { from: 'anonymous', to: 'call' },
  { from: 'call', to: 'responders' },
  { from: 'responders', to: 'abu_muslim' },
  { from: 'abu_muslim', to: 'ibrahim_abbas' }
];

export const groupBNodes = [
  { id: 'prophet', x: 400, y: 700, label: 'Prophet', kind: 'root', labelPos: 'right' },
  { id: 'ibn_masud', x: 400, y: 600, label: 'ʿAbd Allāh b. Masʿūd', labelPos: 'right' },
  { id: 'alqama', x: 400, y: 500, label: 'ʿAlqama', labelPos: 'right' },
  { id: 'ibrahim', x: 400, y: 400, label: 'Ibrāhīm al-Nakhaʿī', labelPos: 'right' },
  { id: 'yazid', x: 400, y: 300, label: 'Yazīd b. Abī Ziyād', kind: 'cl', labelPos: 'right' },
  { id: 'ali', x: 300, y: 200, label: 'ʿAlī b. Ṣāliḥ', labelPos: 'left' },
  { id: 'muawiya', x: 300, y: 100, label: 'Muʿāwiya b. Hishām', labelPos: 'left' },
  { id: 'uthman', x: 200, y: 0, label: 'ʿUthmān b. Abī Shayba', labelPos: 'left' },
  { id: 'ibn_abi_shayba', x: 400, y: 0, label: 'Ibn Abī Shayba', kind: 'collector', labelPos: 'right' },
  { id: 'ibn_majah', x: 200, y: -100, label: 'Ibn Mājah', kind: 'collector', labelPos: 'below' },
  { id: 'parallel', x: 500, y: 200, label: 'Parallel proliferation:\\nBazzār, Abū Yaʿlā,\\nṬabarānī, Ḥākim', kind: 'collector', labelPos: 'right' }
];

export const groupBEdges = [
  { from: 'prophet', to: 'ibn_masud', kind: 'trunk' },
  { from: 'ibn_masud', to: 'alqama', kind: 'trunk' },
  { from: 'alqama', to: 'ibrahim', kind: 'trunk' },
  { from: 'ibrahim', to: 'yazid', kind: 'trunk' },
  { from: 'yazid', to: 'ali' },
  { from: 'yazid', to: 'parallel' },
  { from: 'ali', to: 'muawiya' },
  { from: 'muawiya', to: 'uthman' },
  { from: 'muawiya', to: 'ibn_abi_shayba' },
  { from: 'uthman', to: 'ibn_majah' }
];

export const groupCNodes = [
  { id: 'prophet', x: 400, y: 700, label: 'Prophet', kind: 'root', labelPos: 'right' },
  { id: 'thawban', x: 400, y: 600, label: 'Thawbān', labelPos: 'right' },
  { id: 'abu_asma', x: 400, y: 500, label: 'Abū Asmāʾ al-Raḥabī', labelPos: 'right' },
  { id: 'abu_qilaba', x: 400, y: 400, label: 'Abū Qilāba', kind: 'cl', labelPos: 'right' },
  { id: 'khalid', x: 250, y: 300, label: 'Khālid al-Ḥadhdhāʾ', labelPos: 'left' },
  { id: 'ali_zayd', x: 550, y: 300, label: 'ʿAlī b. Zayd b. Judʿān', labelPos: 'right' },
  { id: 'sufyan', x: 250, y: 200, label: 'Sufyān al-Thawrī', labelPos: 'left' },
  { id: 'sharik', x: 550, y: 200, label: 'Sharīk', labelPos: 'right' },
  { id: 'abd_razzaq', x: 250, y: 100, label: 'ʿAbd al-Razzāq', labelPos: 'left' },
  { id: 'abd_wahhab', x: 100, y: 100, label: 'ʿAbd al-Wahhāb\\nb. ʿAṭāʾ', labelPos: 'left' },
  { id: 'waki', x: 550, y: 100, label: 'Wakīʿ', labelPos: 'right' },
  { id: 'ibn_majah', x: 150, y: 0, label: 'Ibn Mājah 4084\\n(expanded form)', kind: 'collector', labelPos: 'below' },
  { id: 'bayhaqi', x: 350, y: 0, label: 'Bayhaqī Dalāʾil', kind: 'collector', labelPos: 'below' },
  { id: 'bayhaqi_mawqif', x: 50, y: 0, label: 'Bayhaqī Dalāʾil\\n[mawqūf short form]', kind: 'collector', labelPos: 'below' },
  { id: 'ahmad', x: 550, y: 0, label: 'Aḥmad Musnad 22387\\n(short form)', kind: 'collector', labelPos: 'below' }
];

export const groupCEdges = [
  { from: 'prophet', to: 'thawban', kind: 'trunk' },
  { from: 'thawban', to: 'abu_asma', kind: 'trunk' },
  { from: 'abu_asma', to: 'abu_qilaba', kind: 'trunk' },
  { from: 'abu_qilaba', to: 'khalid' },
  { from: 'abu_qilaba', to: 'ali_zayd' },
  { from: 'khalid', to: 'sufyan' },
  { from: 'khalid', to: 'abd_wahhab' },
  { from: 'sufyan', to: 'abd_razzaq' },
  { from: 'abd_razzaq', to: 'ibn_majah' },
  { from: 'abd_razzaq', to: 'bayhaqi' },
  { from: 'abd_wahhab', to: 'bayhaqi_mawqif' },
  { from: 'ali_zayd', to: 'sharik' },
  { from: 'sharik', to: 'waki' },
  { from: 'waki', to: 'ahmad' }
];

export const groupENodes = [
  { id: 'prophet', x: 400, y: 700, label: 'Prophet / Kaʿb', kind: 'root', labelPos: 'right' },
  { id: 'abu_hurayra', x: 400, y: 600, label: 'Abū Hurayra', labelPos: 'right' },
  { id: 'qabisa', x: 400, y: 500, label: 'Qabīṣa b. Dhūʾayb', labelPos: 'right' },
  { id: 'zuhri', x: 400, y: 400, label: 'al-Zuhrī', labelPos: 'right' },
  { id: 'yunus', x: 400, y: 300, label: 'Yūnus b. Yazīd', labelPos: 'right' },
  { id: 'rushdin', x: 400, y: 200, label: 'Rushdīn b. Saʿd', kind: 'cl', labelPos: 'right' },
  { id: 'abdallah', x: 400, y: 100, label: 'ʿAbd Allāh b. Yūsuf', labelPos: 'right' },
  { id: 'muhammad', x: 400, y: 0, label: 'Muḥammad b. Isḥāq', labelPos: 'right' },
  { id: 'bayhaqi', x: 400, y: -100, label: 'Bayhaqī Dalāʾil', kind: 'collector', labelPos: 'below' }
];

export const groupEEdges = [
  { from: 'prophet', to: 'abu_hurayra', kind: 'trunk' },
  { from: 'abu_hurayra', to: 'qabisa', kind: 'trunk' },
  { from: 'qabisa', to: 'zuhri', kind: 'trunk' },
  { from: 'zuhri', to: 'yunus', kind: 'trunk' },
  { from: 'yunus', to: 'rushdin', kind: 'trunk' },
  { from: 'rushdin', to: 'abdallah' },
  { from: 'abdallah', to: 'muhammad' },
  { from: 'muhammad', to: 'bayhaqi' }
];
`;

content = content.replace(/import VerdictBox from '\.\.\/\.\.\/components\/article\/VerdictBox\.astro';/, `import VerdictBox from '../../components/article/VerdictBox.astro';\n${importStatement}`);

const replacement = `## Appendix B — Provisional Isnād / Development Diagrams

### GROUP A — Historical daʿwa
<IsnadDiagram nodes={groupANodes} edges={groupAEdges} caption="Historical daʿwa" width={800} height={800} />

### GROUP B — Ibn Masʿūd eastern banners
<IsnadDiagram nodes={groupBNodes} edges={groupBEdges} caption="Ibn Masʿūd eastern banners" width={800} height={900} />

### GROUP C / D — Thawbān cluster
<IsnadDiagram nodes={groupCNodes} edges={groupCEdges} caption="Thawbān cluster" width={800} height={850} />

### GROUP E — Khurāsān to Īliyāʾ
<IsnadDiagram nodes={groupENodes} edges={groupEEdges} caption="Khurāsān to Īliyāʾ" width={800} height={950} />

### GROUP F — Explicit Abbasid
* **Various:** Kaʿb, Ibn ʿAbbās, Muḥammad b. al-Ḥanafiyya, al-Zuhrī
  * ↓ Multiple second-century transmitters
    * ↓ Nuʿaym b. Ḥammād Kitāb al-Fitan (nos. 545–548, 570)
    * ↓ Ibn Hammād al-Khuzāʿī Fitan
    * ↓ Ibn ʿAsākir Tārīkh Dimashq

### GROUP G — Khurāsān searches for Mahdī
* **ʿAlī (attribution)**
  * ↓ Nuʿaym b. Ḥammād Kitāb al-Fitan nos. 881–882

### GROUP H — Counter-reports
* **Various:** ʿAlī, Prophet (post-eventum)
  * ↓ Nuʿaym b. Ḥammād (preserved alongside pro-banner material)`;

content = content.replace(/## Appendix B — Provisional Isnād \/ Development Diagrams[\s\S]*?GROUP H — Counter-reports[\s\S]*? Nuʿaym b\. Ḥammād \(preserved alongside pro-banner material\)/, replacement);

fs.writeFileSync('22-the-abbasid-mahdi-the-black-banners-abu-abbas-al-saffah.mdx', content, 'utf-8');
console.log('Fixed article 22');
