/**
 * Browser side of the email signup, shared by every subscribe form on the
 * page (the inline SubscribeForm variants and the header's pop-up).
 *
 * A container carries [data-subscribe-form]; inside it are the form
 * ([data-subscribe-form-el], rendered hidden so it only appears once this
 * script runs) and a live region ([data-subscribe-form-status]). Binding is
 * idempotent, so two scripts calling bindSubscribeForms() is harmless.
 */

const SUCCESS = "You're on the list. We'll email you when a new study is published.";
const FAILURE = "Something went wrong. Please try again.";

interface SubscribeResult {
  success: boolean;
  error?: string;
}

async function submit(email: string, website: string): Promise<SubscribeResult> {
  const response = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, website }),
  });
  const result = (await response.json()) as Partial<SubscribeResult>;
  return { success: result.success === true, error: typeof result.error === "string" ? result.error : undefined };
}

function bind(container: HTMLElement) {
  const form = container.querySelector("[data-subscribe-form-el]");
  const status = container.querySelector("[data-subscribe-form-status]");
  if (!(form instanceof HTMLFormElement) || !status || container.dataset.subscribeBound) return;
  container.dataset.subscribeBound = "1";
  form.hidden = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = data.get("email");
    const website = data.get("website");
    if (typeof email !== "string" || !email) return;

    const button = form.querySelector('button[type="submit"]');
    if (button instanceof HTMLButtonElement) button.disabled = true;
    status.textContent = "";
    container.classList.remove("is-success", "is-error");

    try {
      const result = await submit(email, typeof website === "string" ? website : "");
      status.textContent = result.success ? SUCCESS : result.error || FAILURE;
      container.classList.add(result.success ? "is-success" : "is-error");
      if (result.success) form.reset();
    } catch {
      status.textContent = FAILURE;
      container.classList.add("is-error");
    } finally {
      if (button instanceof HTMLButtonElement) button.disabled = false;
    }
  });
}

export function bindSubscribeForms(root: Document | Element = document): void {
  root.querySelectorAll<HTMLElement>("[data-subscribe-form]").forEach(bind);
}
