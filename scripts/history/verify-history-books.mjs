// Checks that every history fragment divides into reading pages without
// losing text: the words of a book's pages must equal the words of its
// fragment's chapters, and every note must land on a page. Run with:
//   node --experimental-strip-types scripts/history/verify-history-books.mjs [--list]
import { readFileSync, readdirSync } from 'node:fs';
import { parseHistoryBook, readingTime } from '../../src/lib/history-book.ts';
import { historySources } from '../../src/data/history/history.ts';

const dir = new URL('../../src/data/history/readers/', import.meta.url);
const list = process.argv.includes('--list');
const words = (html) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
let failed = false;

for (const file of readdirSync(dir).filter((name) => name.endsWith('.html'))) {
  const slug = file.replace(/\.html$/, '');
  const fragment = readFileSync(new URL(file, dir), 'utf8');
  const book = parseHistoryBook(slug, fragment);

  const article = fragment.slice(fragment.indexOf('<article class="bk-text"'), fragment.lastIndexOf('</article>'));
  const chapters = [...article.matchAll(/<section class="chapter([^"]*)"[^>]*>([\s\S]*?)<\/section>/g)];
  const source = chapters.reduce((total, match) => total + words(match[2].replace(/^\s*<header>[\s\S]*?<\/header>/, '')), 0);
  // A year chapter's own title becomes the sub-line of its year heading.
  const generated = book.pages.reduce((total, page) => total + (page.html.match(/<h3 class="year" id="heading-/g) ?? []).length, 0);
  const sourceNotes = (article.match(/<div class="note" /g) ?? []).length;
  const pageNotes = book.pages.reduce((total, page) => total + (page.notes.match(/<div class="note" /g) ?? []).length, 0);
  const sourceTn = (fragment.match(/<section class="tn"/g) ?? []).length;
  const pageTn = book.pages.reduce((total, page) => total + (page.translationNotes.match(/<section class="tn"/g) ?? []).length, 0);
  const slugs = new Set(book.pages.map((page) => page.slug));
  const sizes = book.pages.map((page) => page.words).sort((a, b) => a - b);
  const text = book.pages.reduce((total, page) => total + words(page.html.replace(/<h3 class="year" id="heading-[\s\S]*?<\/h3>/g, '').replace(/<header class="ch-head">[\s\S]*?<\/header>/g, '')), 0);

  const problems = [];
  if (text !== source) problems.push(`words ${text} != ${source}`);
  if (pageNotes !== sourceNotes) problems.push(`notes ${pageNotes} != ${sourceNotes}`);
  if (pageTn !== sourceTn) problems.push(`translation notes ${pageTn} != ${sourceTn}`);
  if (slugs.size !== book.pages.length) problems.push('duplicate page slugs');
  const record = historySources.find((source) => source.reader?.slug === slug)?.reader;
  if (!record) problems.push('no record in src/data/history/history.ts');
  else if (record.entries !== book.pages.length || record.words !== book.words) problems.push(`history.ts records ${record.entries} pages and ${record.words} words`);
  if (problems.length) failed = true;

  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${slug}: ${book.layout}, ${book.parts.length} parts, ${book.chapters.length} chapters, ${book.pages.length} pages, ${book.words} words, ${readingTime(book.minutes)}; page words ${sizes[0]}/${sizes[sizes.length >> 1]}/${sizes[sizes.length - 1]}; ${generated} year chapters${problems.length ? ' :: ' + problems.join('; ') : ''}`);
  if (list) {
    for (const part of book.parts) {
      console.log(`  [${part.label ?? ''} ${part.title ?? ''}]`);
      for (const index of part.chapters) {
        const chapter = book.chapters[index];
        const facts = [
          chapter.kind,
          `${chapter.words}w`,
          `${chapter.pages.length}p`,
          chapter.years ? `years ${chapter.years.join('-')}` : '',
          chapter.reports ? `reports ${chapter.reports.join('-')}` : '',
          chapter.entries ? `${chapter.entries} entries` : '',
        ].filter(Boolean).join(', ');
        console.log(`    ${chapter.number ?? '-'} ${chapter.title.slice(0, 70)} (${facts})`);
        if (chapter.pages.length > 1) {
          for (const pageIndex of chapter.pages) {
            const page = book.pages[pageIndex];
            console.log(`        ${page.slug}: ${page.label.slice(0, 60)} (${page.words}w, ${page.headings.length}h${page.folios ? `, pp ${page.folios.join('-')}` : ''})`);
          }
        }
      }
    }
  }
}
process.exit(failed ? 1 : 0);
