import { parseFragment } from 'parse5';

/**
 * Read an HTML fragment as text, decoding character references once as an HTML
 * parser does. This is text extraction, not markup safe to render as HTML.
 * @param {string} source
 * @param {string} [separator]
 * @returns {string}
 */
export function htmlText(source, separator = '') {
  /** @type {string[]} */
  const parts = [];
  /** @param {import('parse5').DefaultTreeAdapterMap['node']} node */
  const visit = (node) => {
    if ('value' in node) parts.push(node.value);
    else if (node.nodeName !== 'script' && node.nodeName !== 'style' && 'childNodes' in node) {
      for (const child of node.childNodes) visit(child);
    }
  };
  visit(parseFragment(source));
  return parts.join(separator);
}

/**
 * Remove stylesheet blocks from a raw MDX source without rewriting its text.
 * Repeat until stable so removing a block cannot assemble another style tag.
 * @param {string} source
 * @returns {string}
 */
export function removeStyleBlocks(source) {
  let previous;
  let result = source;
  do {
    previous = result;
    result = result.replace(/<style\b[^>]*>[\s\S]*?(?:<\/style\s*>|$)/gi, '');
  } while (result !== previous);
  return result;
}
