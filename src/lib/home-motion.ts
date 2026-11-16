/* Motion for the front page figures. Three jobs, each opted into from markup:

   data-ambient-scene   A looping figure. It gets data-motion-paused while it
                        is off screen or the tab is hidden, and one rule in
                        global.css pauses its CSS animations.
   data-reveal-once     A figure that plays once. Script adds .is-armed (its
                        start state) and then .is-playing the first time half
                        of it (or half the screen, for a very tall figure) is
                        on screen. Without script, or under reduced
                        motion, neither class is added and the figure shows
                        its finished state.
   .reveal              A block that rises into place as it enters the
                        viewport. Hidden only once this script runs.

   Every observer is dropped on astro:before-swap, so a view transition never
   leaves one watching nodes that are gone. */

type Cleanup = () => void;

const REDUCED = "(prefers-reduced-motion: reduce)";

const prefersReducedMotion = (): boolean => window.matchMedia(REDUCED).matches;

/** Reads a CSS duration such as "3.6s" or "800ms" in milliseconds. */
export function readDuration(value: string, fallback: number): number {
  const match = value.trim().match(/^([\d.]+)(ms|s)$/);
  if (!match) return fallback;
  const ms = Number(match[1]) * (match[2] === "s" ? 1000 : 1);
  return Number.isFinite(ms) && ms > 0 ? ms : fallback;
}

function watchAmbientScenes(root: ParentNode): Cleanup {
  const scenes = [...root.querySelectorAll<HTMLElement>("[data-ambient-scene]")];
  if (!scenes.length) return () => {};

  const visible = new Set<Element>();
  const sync = (scene: Element) =>
    scene.toggleAttribute("data-motion-paused", document.hidden || !visible.has(scene));

  scenes.forEach(sync);
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
      sync(entry.target);
    }
  });
  scenes.forEach((scene) => observer.observe(scene));

  const onVisibility = () => scenes.forEach(sync);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

function armRevealOnce(root: ParentNode): Cleanup {
  const figures = [...root.querySelectorAll<HTMLElement>("[data-reveal-once]:not(.is-armed)")];
  if (!figures.length || prefersReducedMotion()) return () => {};

  /* Half the figure on screen, or, for a figure taller than two screens,
     half the screen filled by it; otherwise a tall card would never play. */
  const inView = (entry: IntersectionObserverEntry) => {
    const screen = entry.rootBounds?.height ?? window.innerHeight;
    return entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= screen * 0.5;
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !inView(entry)) continue;
        observer.unobserve(entry.target);
        entry.target.classList.add("is-playing");
      }
    },
    { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] },
  );
  for (const figure of figures) {
    figure.classList.add("is-armed");
    observer.observe(figure);
  }
  return () => observer.disconnect();
}

function revealOnScroll(root: ParentNode): Cleanup {
  const items = [...root.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")];
  if (!items.length || prefersReducedMotion()) return () => {};

  document.documentElement.classList.add("home-reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  items.forEach((item) => observer.observe(item));
  return () => observer.disconnect();
}

/* Sections below the fold skip layout and paint until they come near. Each
   section is measured once at its real height first, so the scrollbar and
   in-page links do not jump when it renders. */
function deferOffscreenSections(root: ParentNode): Cleanup {
  if (!CSS.supports("content-visibility", "auto")) return () => {};
  let stopped = false;
  const sizer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const section = entry.target as HTMLElement;
      section.style.containIntrinsicBlockSize = `auto ${Math.round(entry.contentRect.height)}px`;
      section.style.contentVisibility = "auto";
      sizer.unobserve(section);
    }
  });
  document.fonts.ready.then(() => {
    if (stopped) return;
    root.querySelectorAll<HTMLElement>("[data-defer-paint]").forEach((section) => sizer.observe(section));
  });
  return () => {
    stopped = true;
    sizer.disconnect();
  };
}

let active: Cleanup | null = null;

/** Starts every motion job on the page. Safe to call again after a swap. */
export function initHomeMotion(root: ParentNode = document): void {
  active?.();
  const cleanups = [
    watchAmbientScenes(root),
    armRevealOnce(root),
    revealOnScroll(root),
    deferOffscreenSections(root),
  ];
  active = () => {
    cleanups.forEach((cleanup) => cleanup());
    active = null;
  };
  document.addEventListener("astro:before-swap", () => active?.(), { once: true });
}
