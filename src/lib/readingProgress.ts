export function initReadingProgress(root: ParentNode = document) {
  const article = root.querySelector<HTMLElement>('[data-reading-progress-source]');
  const bar = root.querySelector<HTMLElement>('[data-reading-progress-bar]');
  if (!article || !bar) return () => {};

  let frame = 0;
  const update = () => {
    frame = 0;
    const start = article.offsetTop;
    const end = start + article.offsetHeight - window.innerHeight;
    const range = Math.max(end - start, 1);
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / range));
    bar.style.transform = `scaleX(${progress})`;
  };
  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
  return () => {
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
    if (frame) cancelAnimationFrame(frame);
  };
}
