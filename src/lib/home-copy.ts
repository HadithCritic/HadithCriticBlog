/* Copy buttons on the front page. A [data-copy] button copies the text of
   the first <code> in its [data-copy-scope] and says so for a moment: the
   button gets data-copied (its icon turns to a check) and the
   [data-copy-status] of its [data-copy-root] tells screen readers. Buttons
   are hidden in the markup and shown here only where the clipboard API is
   available. Returns a cleanup for client-side navigation. */

type Cleanup = () => void;

const COPIED_MS = 1600;

export function initCopyButtons(root: ParentNode = document): Cleanup {
  const controller = new AbortController();
  const timers = new Set<number>();
  if (!navigator.clipboard?.writeText) return () => {};

  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    const code = button.closest("[data-copy-scope]")?.querySelector("code");
    if (!code) continue;
    const status = button.closest("[data-copy-root]")?.querySelector<HTMLElement>("[data-copy-status]");
    button.hidden = false;
    button.addEventListener(
      "click",
      async () => {
        try {
          await navigator.clipboard.writeText(code.textContent ?? "");
        } catch {
          if (status) status.textContent = "Copying failed. Select the text and copy it instead.";
          return;
        }
        button.dataset.copied = "";
        if (status) status.textContent = "Copied to the clipboard.";
        const timer = window.setTimeout(() => {
          delete button.dataset.copied;
          timers.delete(timer);
        }, COPIED_MS);
        timers.add(timer);
      },
      { signal: controller.signal },
    );
  }

  return () => {
    controller.abort();
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}
