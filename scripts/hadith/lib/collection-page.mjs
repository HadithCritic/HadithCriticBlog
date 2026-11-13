import fs from 'node:fs';
import path from 'node:path';

const pageRoot = path.resolve('src/pages/hadith/collection');

/**
 * Writes the Astro page for one reader edition. Every edition gets the same title and description
 * pattern, derived from its chapter index by src/lib/collection-units.ts.
 */
export function writeCollectionPage(slug, title) {
  const page = [
    '---',
    'import BaseLayout from "../../../layouts/BaseLayout.astro";',
    'import { OG } from "../../../lib/seo";',
    'import { collectionFrontMatter } from "../../../lib/collection-units";',
    `import collectionHtml from "../../../data/hadith/pages/${slug}/collection.html?raw";`,
    'import "../../../styles/hadith-library.css";',
    'import "../../../styles/hadith-collection-aligned.css";',
    '',
    `const { title, description } = collectionFrontMatter("${slug}", ${JSON.stringify(title)});`,
    '---',
    '',
    '<BaseLayout',
    '  title={`${title} | HadithCritic`}',
    '  description={description}',
    `  image={OG.collection("${slug}")}`,
    '  imageAlt={`${title} | HadithCritic`}',
    '  crumbs={[',
    '    { name: "Home", url: "/" },',
    '    { name: "Corpus", url: "/hadith/" },',
    `    { name: title, url: "/hadith/collection/${slug}/" },`,
    '  ]}',
    '>',
    '  <Fragment set:html={collectionHtml} />',
    '</BaseLayout>',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(pageRoot, `${slug}.astro`), page, 'utf8');
}
