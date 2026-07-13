import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initReadingProgress } from './readingProgress';

let registered = false;

export function initMotion(root: Document = document) {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }

  const cleanups: Array<() => void> = [initReadingProgress(root)];
  const media = gsap.matchMedia();
  root.documentElement.classList.add('motion-ready');

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const context = gsap.context(() => {
      const defaults = { duration: 0.65, ease: 'power3.out' };
      const revealTargets = gsap.utils.toArray<HTMLElement>(
        '[data-motion="reveal"], [data-motion-item], [data-motion-row]'
      );
      if (revealTargets.length) {
        gsap.set(revealTargets, { autoAlpha: 0, y: window.innerWidth < 768 ? 10 : 18 });
        ScrollTrigger.batch(revealTargets, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { ...defaults, autoAlpha: 1, y: 0, stagger: 0.08, overwrite: true })
        });
      }
      const rules = gsap.utils.toArray<HTMLElement>('[data-motion="rule"]');
      if (rules.length) {
        gsap.set(rules, { scaleX: 0 });
        ScrollTrigger.batch(rules, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { scaleX: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 })
        });
      }
      if (window.innerWidth >= 768) {
        gsap.utils.toArray<HTMLElement>('[data-motion="parallax"]').forEach((element) => {
          const y = Number(element.dataset.parallaxY || 18);
          gsap.to(element, { y, ease: 'none', scrollTrigger: { trigger: element, scrub: 0.4, start: 'top bottom', end: 'bottom top' } });
        });
      }
    }, root.documentElement);
    return () => context.revert();
  });

  return () => {
    media.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    cleanups.forEach((cleanup) => cleanup());
    root.documentElement.classList.remove('motion-ready');
  };
}
