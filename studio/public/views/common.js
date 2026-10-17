// Helpers the dashboard tabs share. Every value from the server is placed with
// textContent; nothing here assigns innerHTML from data.
export const $ = (id) => document.getElementById(id);

export const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
};

export const number = (value) => Number(value || 0).toLocaleString();

export function bytes(value) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Number(value || 0), unit = 0;
  while (size >= 1000 && unit < units.length - 1) { size /= 1000; unit++; }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export const percent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

export function when(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? String(value) : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

export function day(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

export function stat(label, value, note) {
  const card = el('article', undefined, 'stat stat--plain');
  card.append(el('p', value, 'stat__value'), el('p', label, 'stat__label'));
  if (note) card.append(el('p', note, 'stat__note'));
  return card;
}

export function statusBadge(ok, labels = ['Problem', 'OK', 'Not checked']) {
  const [bad, good, unknown] = labels;
  const text = ok === true ? good : ok === false ? bad : unknown;
  return el('span', text, `badge badge--${ok === true ? 'ok' : ok === false ? 'error' : 'quiet'}`);
}

export function errorLine(message) {
  return el('p', message, 'view-error');
}

/** A minimal table; rows are arrays of strings or nodes. */
export function table(caption, headings, rows, { numeric = [] } = {}) {
  const node = el('table', undefined, 'data-table');
  const cap = el('caption', caption, 'sr-only');
  const head = el('thead');
  const headRow = el('tr');
  headings.forEach((heading, index) => {
    const th = el('th', heading);
    th.scope = 'col';
    if (numeric.includes(index)) th.className = 'is-num';
    headRow.append(th);
  });
  head.append(headRow);
  const body = el('tbody');
  for (const row of rows) {
    const tr = el('tr');
    row.forEach((cell, index) => {
      const td = el('td');
      if (cell instanceof Node) td.append(cell); else td.textContent = cell ?? '';
      if (numeric.includes(index)) td.className = 'is-num';
      tr.append(td);
    });
    body.append(tr);
  }
  node.append(cap, head, body);
  return node;
}

const SVG = 'http://www.w3.org/2000/svg';
const svgNode = (tag, attributes = {}) => {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  return node;
};

/**
 * A bar chart for one series. Each bar carries a <title> for pointer users;
 * the caller supplies a table of the same numbers for screen readers.
 */
export function barChart(points, { label, height = 180, format = number } = {}) {
  const width = 720, padTop = 18, padBottom = 24;
  const max = Math.max(1, ...points.map((point) => point.value));
  const slot = width / Math.max(points.length, 1);
  const gap = Math.min(4, slot * 0.25);
  const svg = svgNode('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart', role: 'img', 'aria-label': label, preserveAspectRatio: 'none' });
  svg.style.height = `${height}px`;
  const plot = height - padTop - padBottom;
  svg.append(svgNode('line', { x1: 0, x2: width, y1: height - padBottom + 0.5, y2: height - padBottom + 0.5, class: 'chart__axis' }));
  points.forEach((point, index) => {
    const h = point.value ? Math.max(2, (point.value / max) * plot) : 0;
    const bar = svgNode('rect', { x: index * slot + gap / 2, y: height - padBottom - h, width: Math.max(1, slot - gap), height: h, class: 'chart__bar' });
    const title = svgNode('title');
    title.textContent = `${point.label}: ${format(point.value)}`;
    bar.append(title);
    svg.append(bar);
  });
  const wrap = el('figure', undefined, 'chart-wrap');
  const scale = el('div', undefined, 'chart__scale');
  scale.append(el('span', format(max)), el('span', '0'));
  const axis = el('div', undefined, 'chart__labels');
  if (points.length) axis.append(el('span', points[0].label), el('span', points.at(-1).label));
  wrap.append(scale, svg, axis);
  return wrap;
}

export function viewHead(eyebrow, title, lede, actions = []) {
  const head = el('header', undefined, 'view-head');
  const text = el('div');
  const ornament = el('span', undefined, 'ornament');
  ornament.setAttribute('aria-hidden', 'true');
  text.append(el('p', eyebrow, 'eyebrow'), el('h1', title), ornament, el('p', lede, 'view-head__lede'));
  const side = el('div', undefined, 'view-head__actions');
  side.append(...actions);
  head.append(text, side);
  return head;
}

export function card(title, note, ...children) {
  const node = el('section', undefined, 'card');
  const head = el('header', undefined, 'card__head');
  head.append(el('h2', title));
  if (note) head.append(el('span', note, 'card__note'));
  node.append(head, ...children);
  return node;
}

export function button(text, className = 'button', onClick) {
  const node = el('button', text, className);
  node.type = 'button';
  if (onClick) node.addEventListener('click', onClick);
  return node;
}
