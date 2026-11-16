/* The front page lecture player. Every tile is a real link to the video, so
   without script it opens YouTube. With script:

     a.yt-lite              swaps itself for the privacy-enhanced embed in place
     a[data-play-lecture]   a rail item; it plays its video in the featured
                            stage ([data-lecture-stage]) and the caption beside
                            it ([data-lecture-title], -meta, -link) follows

   A click with a modifier key keeps the link's own behavior. Returns a cleanup
   that removes the listeners, for client-side navigation. */

type Cleanup = () => void;

const REDUCED = "(prefers-reduced-motion: reduce)";

function embed(id: string, title: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`;
  iframe.title = title || "YouTube video player";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  return iframe;
}

const plainClick = (event: MouseEvent) => !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);

function bindLite(link: HTMLAnchorElement, signal: AbortSignal): void {
  link.addEventListener(
    "click",
    (event) => {
      const id = link.dataset.videoId;
      if (!id || !plainClick(event)) return;
      event.preventDefault();
      const frame = document.createElement("div");
      frame.className = link.className;
      frame.dataset.videoId = id;
      const iframe = embed(id, link.getAttribute("aria-label")?.replace(/^Play: /, "") ?? "");
      frame.appendChild(iframe);
      link.replaceWith(frame);
      iframe.focus();
    },
    { signal },
  );
}

function bindRail(item: HTMLAnchorElement, signal: AbortSignal): void {
  item.addEventListener(
    "click",
    (event) => {
      const scope = item.closest<HTMLElement>("[data-lectures]");
      const stage = scope?.querySelector<HTMLElement>("[data-lecture-stage]");
      const id = item.dataset.videoId;
      if (!scope || !stage || !id || !plainClick(event)) return;
      event.preventDefault();
      const title = item.dataset.title ?? "";
      const frame = document.createElement("div");
      frame.className = "yt-lite";
      frame.dataset.videoId = id;
      frame.appendChild(embed(id, title));
      stage.replaceChildren(frame);

      const set = (key: string, apply: (el: HTMLElement) => void) => {
        const el = scope.querySelector<HTMLElement>(`[data-lecture-${key}]`);
        if (el) apply(el);
      };
      set("title", (el) => (el.textContent = title));
      set("meta", (el) => (el.textContent = item.dataset.meta ?? ""));
      set("link", (el) => el.setAttribute("href", item.href));
      set("label", (el) => (el.textContent = "Now playing"));
      for (const other of scope.querySelectorAll("[data-play-lecture]")) other.removeAttribute("aria-current");
      item.setAttribute("aria-current", "true");

      const smooth = !window.matchMedia(REDUCED).matches;
      stage.scrollIntoView({ block: "nearest", behavior: smooth ? "smooth" : "auto" });
      frame.querySelector("iframe")?.focus({ preventScroll: true });
    },
    { signal },
  );
}

export function initLectures(root: ParentNode = document): Cleanup {
  const controller = new AbortController();
  root.querySelectorAll<HTMLAnchorElement>("a.yt-lite").forEach((link) => bindLite(link, controller.signal));
  root.querySelectorAll<HTMLAnchorElement>("a[data-play-lecture]").forEach((item) => bindRail(item, controller.signal));
  return () => controller.abort();
}
