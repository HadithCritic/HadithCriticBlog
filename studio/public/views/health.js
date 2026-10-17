import { el, when, statusBadge, viewHead, card, button, errorLine } from './common.js';

const CHECKS = [
  ['site', 'Public site', 'The home page answers 200.'],
  ['corpus', 'Hadith corpus', 'The live corpus version answers a range read with 206 and SQLite bytes.'],
  ['branches', 'Branches and CI', 'What is waiting on drafts, and whether CI passes on both branches.'],
  ['sending', 'Newsletter sending', 'The sending domain is verified in Resend.']
];
const ACTIONS_URL = 'https://github.com/HadithCritic/HadithCriticBlog/actions';

export function healthView(root, { api }) {
  const refresh = button('Run checks again', 'button');
  const status = el('p', '', 'view-status');
  status.setAttribute('role', 'status');
  const body = el('div', undefined, 'view-body');
  root.replaceChildren(viewHead('Live checks', 'Site health', 'Each check runs now against production, so a failure here is a failure readers see.', [refresh]), status, body);

  function render(result) {
    const grid = el('div', undefined, 'check-grid');
    for (const [key, title, purpose] of CHECKS) {
      const check = result.checks[key] || { ok: null, detail: 'Not checked.' };
      const node = el('article', undefined, `check check--${check.ok === true ? 'ok' : check.ok === false ? 'error' : 'quiet'}`);
      const head = el('header', undefined, 'check__head');
      head.append(el('h2', title), statusBadge(check.ok));
      node.append(head, el('p', check.detail, 'check__detail'), el('p', `${purpose}${Number.isFinite(check.ms) ? ` ${check.ms} ms.` : ''}`, 'check__purpose'));
      if (key === 'branches') {
        const link = el('a', 'Open GitHub Actions');
        link.href = ACTIONS_URL;
        link.rel = 'noreferrer';
        link.target = '_blank';
        node.append(link);
      }
      grid.append(node);
    }
    const commits = result.checks.branches?.commits || [];
    const queue = card('Release queue', commits.length ? `Newest ${commits.length} commits on drafts and not on main` : 'Nothing waiting',
      commits.length ? listCommits(commits) : el('p', 'drafts has nothing that main lacks.', 'empty-line'));
    body.replaceChildren(grid, queue);
  }

  function listCommits(commits) {
    const list = el('ol', undefined, 'commit-list');
    for (const commit of commits) {
      const item = el('li');
      item.append(el('code', commit.sha), el('span', commit.message, 'commit-list__message'), el('span', when(commit.date), 'commit-list__date'));
      list.append(item);
    }
    return list;
  }

  async function load() {
    refresh.disabled = true;
    status.textContent = 'Checking production…';
    body.setAttribute('aria-busy', 'true');
    try {
      const result = await api('/api/health');
      render(result);
      status.textContent = `Checked ${when(result.checkedAt)}.`;
    } catch (error) {
      body.replaceChildren(errorLine(error.message));
      status.textContent = '';
    } finally {
      refresh.disabled = false;
      body.removeAttribute('aria-busy');
    }
  }
  refresh.addEventListener('click', load);
  return { show: () => { if (!body.childElementCount) load(); } };
}
