/**
 * Shared clipboard helpers.
 *
 * Seven call sites had independently reimplemented the same copy-to-clipboard
 * flow. Five of them were near-identical: write text, add `is-copied`, swap a
 * label, revert after 2200ms, warn on failure. The other two (contact page,
 * narrator dossier) copy text but report it differently — a separate feedback
 * element, a different duration, or an `alert()`.
 *
 * So this module exposes two pieces rather than one do-everything function:
 * `copyText` is the primitive every caller shares, and `flashCopied` is the
 * label-swap feedback the five article components share. Callers with their own
 * feedback mechanism use `copyText` alone and keep their own reporting, which
 * is why their behaviour is unchanged.
 */

/**
 * Write `text` to the clipboard. Returns whether it succeeded rather than
 * throwing, so callers can gate their feedback without a try/catch each.
 *
 * `context` only shapes the console warning, matching the wording each call
 * site used before ("Failed to copy verse:", "Failed to copy link:", …).
 */
export async function copyText(text: string, context = 'text'): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn(`Failed to copy ${context}:`, err);
    return false;
  }
}

export interface CopiedFeedbackOptions {
  /** Selector for the label element inside the button, if it has one. */
  labelSelector?: string;
  /** Label shown while in the copied state. */
  copiedLabel?: string;
  /** Label restored afterwards. */
  idleLabel?: string;
  /** How long the copied state lasts, in ms. */
  duration?: number;
  /** State class toggled on the button. */
  className?: string;
}

/**
 * The shared "button briefly says Copied!" affordance: add a state class, swap
 * the label, then restore both. Assumes the copy already succeeded.
 */
export function flashCopied(button: HTMLElement, options: CopiedFeedbackOptions = {}): void {
  const {
    labelSelector,
    copiedLabel = 'Copied!',
    idleLabel = 'Copy',
    duration = 2200,
    className = 'is-copied'
  } = options;

  button.classList.add(className);
  const label = labelSelector ? button.querySelector(labelSelector) : null;
  if (label) label.textContent = copiedLabel;

  window.setTimeout(() => {
    button.classList.remove(className);
    if (label) label.textContent = idleLabel;
  }, duration);
}

/**
 * Join the parts of a citation the way the article components do: the Arabic
 * or primary text, then the quoted translation, then an em-dash reference,
 * separated by blank lines. Empty parts are dropped.
 */
export function buildCitation(parts: {
  primary?: string | null;
  quoted?: string | null;
  reference?: string | null;
}): string {
  const out: string[] = [];
  if (parts.primary) out.push(parts.primary.trim());
  if (parts.quoted) out.push(`"${parts.quoted.trim()}"`);
  if (parts.reference) out.push(`— ${parts.reference.trim()}`);
  return out.join('\n\n');
}
