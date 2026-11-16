/* Behavior for the front page compiler map (CompilerMap.astro).

   A region opens on hover or keyboard focus and closes when the pointer or
   focus leaves. A click or tap holds it open; Escape, or a click outside the
   map, lets it go. The century switch marks regions and compilers outside the
   chosen century with data-out, and the stylesheet fades them.

   Returns a cleanup that removes the document listeners, so the page can run
   it again after a client-side navigation. */

type Cleanup = () => void;

function bindMap(map: HTMLElement, signal: AbortSignal): void {
  const points = [...map.querySelectorAll<HTMLElement>(".cmap__point")];
  const callout = (point: HTMLElement) => {
    const id = point.querySelector("button")?.getAttribute("aria-controls");
    return id ? map.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
  };
  let held: HTMLElement | null = null;

  const show = (point: HTMLElement | null) => {
    for (const other of points) {
      const open = other === point;
      other.classList.toggle("is-active", open);
      other.querySelector("button")?.setAttribute("aria-expanded", String(open));
      const panel = callout(other);
      if (panel) panel.hidden = !open;
    }
    if (point) map.dataset.active = point.dataset.region ?? "";
    else delete map.dataset.active;
  };
  const release = () => {
    held = null;
    show(null);
  };

  for (const point of points) {
    const button = point.querySelector("button");
    point.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" && !held) show(point);
    }, { signal });
    point.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse" && !held) show(null);
    }, { signal });
    button?.addEventListener("focus", () => {
      if (!held) show(point);
    }, { signal });
    button?.addEventListener("blur", () => {
      if (!held) show(null);
    }, { signal });
    button?.addEventListener("click", () => {
      if (held === point) {
        release();
        return;
      }
      held = point;
      show(point);
    }, { signal });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && map.dataset.active !== undefined) release();
  }, { signal });
  document.addEventListener("pointerdown", (event) => {
    if (held && !map.contains(event.target as Node)) release();
  }, { signal });

  const switcher = map.querySelector<HTMLFieldSetElement>("[data-cmap-switch]");
  if (!switcher) return;
  switcher.hidden = false;
  switcher.addEventListener("change", (event) => {
    const value = (event.target as HTMLInputElement).value;
    const all = value === "all";
    for (const point of points) {
      const centuries = (point.dataset.centuries ?? "").split(" ");
      point.toggleAttribute("data-out", !all && !centuries.includes(value));
    }
    for (const row of map.querySelectorAll<HTMLElement>(".cmap__compilers li")) {
      row.toggleAttribute("data-out", !all && row.dataset.century !== value);
    }
  }, { signal });
}

export function initCompilerMap(root: ParentNode = document): Cleanup {
  const controller = new AbortController();
  for (const map of root.querySelectorAll<HTMLElement>("[data-compiler-map]")) {
    bindMap(map, controller.signal);
  }
  return () => controller.abort();
}
