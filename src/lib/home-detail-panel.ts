/* A figure whose items fill one shared panel: the chronology rail, the
   generation ladder, the resources shelf and the data tree.

     [data-detail-panel]   the figure
     [data-detail-key]     an item; hovering or focusing it shows its card
     [data-detail="…"]     the cards, one per key, and one with an empty key
                           that shows while nothing is chosen
     [data-detail-area]    the region whose pointer exit clears the choice
     [data-detail-roving]  on the figure: its items are one tab stop, and the
                           arrow keys, Home and End move between them. The
                           markup gives every item tabindex="0", so without
                           script each is still reachable

   The chosen item's element (its parent, or the closest [data-detail-item])
   gets .is-active and the figure gets data-active, for the stylesheet to dim
   the rest. Escape, or focus leaving the figure, clears the choice.

   Returns a cleanup that removes the listeners, so the page can run it again
   after a client-side navigation. */

type Cleanup = () => void;

function bindPanel(figure: HTMLElement, signal: AbortSignal): void {
  const keys = [...figure.querySelectorAll<HTMLElement>("[data-detail-key]")];
  const cards = [...figure.querySelectorAll<HTMLElement>("[data-detail]")];
  const itemOf = (key: HTMLElement) => key.closest<HTMLElement>("[data-detail-item]") ?? key.parentElement;

  const show = (id: string) => {
    for (const key of keys) itemOf(key)?.classList.toggle("is-active", key.dataset.detailKey === id);
    for (const card of cards) card.hidden = card.dataset.detail !== id;
    if (id) figure.dataset.active = id;
    else delete figure.dataset.active;
  };

  if (figure.hasAttribute("data-detail-roving")) rove(keys, signal);

  for (const key of keys) {
    const id = key.dataset.detailKey ?? "";
    key.addEventListener("pointerenter", () => show(id), { signal });
    key.addEventListener("focus", () => show(id), { signal });
  }
  figure.querySelector("[data-detail-area]")?.addEventListener("pointerleave", () => show(""), { signal });
  figure.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && figure.dataset.active !== undefined) show("");
    },
    { signal },
  );
  figure.addEventListener(
    "focusout",
    (event) => {
      if (!figure.contains(event.relatedTarget as Node | null)) show("");
    },
    { signal },
  );
}

const STEPS: Record<string, (index: number, last: number) => number> = {
  ArrowDown: (i, last) => Math.min(i + 1, last),
  ArrowRight: (i, last) => Math.min(i + 1, last),
  ArrowUp: (i) => Math.max(i - 1, 0),
  ArrowLeft: (i) => Math.max(i - 1, 0),
  Home: () => 0,
  End: (_, last) => last,
};

/* One tab stop for the figure: the item last moved to. */
function rove(keys: HTMLElement[], signal: AbortSignal): void {
  keys.forEach((key, index) => (key.tabIndex = index === 0 ? 0 : -1));
  keys.forEach((key, index) => {
    key.addEventListener(
      "keydown",
      (event) => {
        const step = STEPS[event.key];
        if (!step) return;
        event.preventDefault();
        const next = keys[step(index, keys.length - 1)];
        keys.forEach((other) => (other.tabIndex = other === next ? 0 : -1));
        next.focus();
      },
      { signal },
    );
  });
}

export function initDetailPanels(root: ParentNode = document): Cleanup {
  const controller = new AbortController();
  root.querySelectorAll<HTMLElement>("[data-detail-panel]").forEach((figure) => bindPanel(figure, controller.signal));
  return () => controller.abort();
}
