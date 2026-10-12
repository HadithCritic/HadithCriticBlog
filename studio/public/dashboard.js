import { newsletterView } from './views/newsletter.js';
import { analyticsView } from './views/analytics.js';
import { healthView } from './views/health.js';
import { activityView } from './views/activity.js';

// Tabs are addressed by the URL hash, so each has a link that survives a
// reload. Switching tabs hides the writing view without closing the editor:
// an open draft keeps its unsaved state and autosave while another tab is up.
const VIEWS = ['writing', 'newsletter', 'analytics', 'health', 'activity'];
const TITLES = { writing: 'Writing', newsletter: 'Newsletter', analytics: 'Analytics', health: 'Site health', activity: 'Activity' };
const FACTORIES = { newsletter: newsletterView, analytics: analyticsView, health: healthView, activity: activityView };

export function mountDashboard(deps) {
  const instances = {};
  const node = (name) => document.getElementById(`view-${name}`);

  function current() {
    const name = location.hash.replace(/^#\/?/, '');
    return VIEWS.includes(name) ? name : 'writing';
  }

  function go(name) {
    const hash = name === 'writing' ? '#/' : `#/${name}`;
    if (location.hash !== hash) location.hash = hash;
  }

  function apply(moveFocus) {
    const name = current();
    document.body.dataset.view = name;
    for (const view of VIEWS) node(view).hidden = view !== name;
    for (const link of document.querySelectorAll('.nav-link[data-view]')) {
      const active = link.dataset.view === name;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    }
    document.title = `${TITLES[name]} · Studio · HadithCritic`;
    if (name !== 'writing') {
      instances[name] ??= FACTORIES[name](node(name), deps);
      instances[name].show();
    }
    if (moveFocus) {
      const heading = node(name).querySelector('h1:not([hidden])');
      if (heading && heading.offsetParent) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0 });
    }
  }

  window.addEventListener('hashchange', () => apply(true));
  document.getElementById('new-article').addEventListener('click', () => go('writing'));
  apply(false);
  return { current, go };
}
