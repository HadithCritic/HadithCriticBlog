import { visit, SKIP } from 'unist-util-visit';

/**
 * Rehype plugin to wrap Markdown tables in a responsive, accessible container.
 *
 * Prevents tables from overflowing narrow viewports (e.g. mobile phones)
 * while providing standard keyboard navigation (`tabindex="0"`, `role="region"`).
 */
export function rehypeTableWrap() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table') return;
      if (!parent || typeof index !== 'number') return;

      // Skip if table is already wrapped in a known table container
      const parentClasses = Array.isArray(parent.properties?.className)
        ? parent.properties.className
        : (parent.properties?.className ? [parent.properties.className] : []);

      const isAlreadyWrapped = parentClasses.some((c) =>
        ['hc-table-wrap', 'variant-table-wrap', 'b46-table-container', 'hc-source-table-wrapper'].includes(String(c))
      );

      if (isAlreadyWrapped) return;

      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['hc-table-wrap'],
          tabIndex: 0,
          role: 'region',
          ariaLabel: 'Table'
        },
        children: [node]
      };

      parent.children[index] = wrapper;
      return [SKIP, index + 1];
    });
  };
}
