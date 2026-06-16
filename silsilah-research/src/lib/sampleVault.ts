import type { Citation } from '../components/citations/citationTypes';
import type { IsnadDiagram } from '../components/isnad/isnadTypes';
import type { ProjectInfo } from './files';

export const sampleProject: ProjectInfo = {
  name: 'Sample Research Project',
  createdAt: '2026-06-16',
  version: '0.1.0',
};

export const sampleCitations: Citation[] = [
  {
    id: 'motzki-2010-amt',
    type: 'book',
    author: 'Harald Motzki',
    title: 'Analysing Muslim Traditions',
    publisher: 'Brill',
    year: 2010,
    place: 'Leiden',
  },
  {
    id: 'brown-2009-hadith',
    type: 'book',
    author: 'Jonathan A. C. Brown',
    title: 'Hadith: Muhammad’s Legacy in the Medieval and Modern World',
    publisher: 'Oneworld',
    year: 2009,
    place: 'Oxford',
  },
  {
    id: 'juynboll-2007-encyclopedia',
    type: 'book',
    author: 'G. H. A. Juynboll',
    title: 'Encyclopedia of Canonical Hadith',
    publisher: 'Brill',
    year: 2007,
    place: 'Leiden',
  },
];

export const sampleDiagram: IsnadDiagram = {
  id: 'diagram-001',
  title: 'Bukhari 2487 Chain',
  nodes: [
    {
      id: 'muhammad-ibn-abdullah',
      name: 'Muhammad ibn Abdullah ibn al-Muthanna',
      verb: 'narrated to us',
    },
    {
      id: 'father',
      name: 'his father',
      verb: 'narrated to me',
    },
    {
      id: 'thumama',
      name: 'Thumama ibn Abdullah ibn Anas',
      verb: 'narrated to me',
    },
    {
      id: 'anas',
      name: 'Anas',
      verb: 'narrated to him',
    },
    {
      id: 'abu-bakr',
      name: 'Abu Bakr',
      verb: 'wrote',
    },
  ],
};

export const sampleFiles: Record<string, string> = {
  'project.json': JSON.stringify(sampleProject, null, 2),
  'citations.json': JSON.stringify(sampleCitations, null, 2),
  'drafts/paper.md': `---
title: "The Abbasid Black Banner Reports"
type: "paper"
created: "2026-06-16"
updated: "2026-06-16"
---

# Introduction

This draft starts with a plain Markdown file in the project vault. It can mix Arabic and English in the same document without forcing a special writing mode.

The first methodological claim cites a local source [[cite:motzki-2010-amt:210]] and keeps the citation visible in the right panel.

## Source Block

:::hadith
id: bukhari-2487
collection: Sahih al-Bukhari
reference: Bukhari 2487
arabic: |
  حَدَّثَنَا مُحَمَّدُ بْنُ عَبْدِ اللَّهِ بْنِ الْمُثَنَّى، قَالَ حَدَّثَنِي أَبِي، قَالَ حَدَّثَنِي ثُمَامَةُ بْنُ عَبْدِ اللَّهِ بْنِ أَنَسٍ، أَنَّ أَنَسًا حَدَّثَهُ، أَنَّ أَبَا بَكْرٍ رَضِيَ اللَّهُ عَنْهُ كَتَبَ لَهُ...
english_isnad: |
  Narrated Muhammad ibn Abdullah ibn al-Muthanna, who said: my father narrated to me, who said: Thumama ibn Abdullah ibn Anas narrated to me, that Anas narrated to him, that Abu Bakr, may God be pleased with him, wrote for him...
english_matn: |
  Abu Bakr, may God be pleased with him, wrote for him the zakat ordinance which the Messenger of God had made obligatory.
:::

## Working Notes

Keep source-critical claims close to the evidence. Diagram references can be inserted from the isnad editor.
`,
  'notes/zuhri-notes.md': `---
title: "Notes on al-Zuhri"
type: "note"
created: "2026-06-16"
updated: "2026-06-16"
---

# Notes on al-Zuhri

Use this note for source observations, bibliography, and transmission comments.
`,
  'sources/source-log.md': `---
title: "Source Log"
type: "source-log"
created: "2026-06-16"
updated: "2026-06-16"
---

# Source Log

- Add scanned books, editions, and Zotero exports here.
`,
  'diagrams/bukhari-2487.isnad.json': JSON.stringify(sampleDiagram, null, 2),
};
