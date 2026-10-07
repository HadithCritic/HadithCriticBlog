import { answerOptions, axes, contentVersion, questions } from "../data/fiqh-compass.ts";
import { fiqhCompassPublicEvidence } from "../data/fiqh-compass-evidence.ts";
import { selectPublicEvidence } from "./fiqh-compass-evidence.js";
import { scoreAxes } from "./fiqh-compass-scoring.js";

const STORAGE_KEY = "hadithcritic:fiqh-compass:prototype-1";
const form = document.querySelector("[data-compass-form]");

if (form instanceof HTMLElement) {
  const questionPanels = [...form.querySelectorAll("[data-question]")];
  const quiz = document.querySelector("[data-compass-quiz]");
  const results = document.querySelector("[data-compass-results]");
  const backButton = form.querySelector("[data-compass-back]");
  const nextButton = form.querySelector("[data-compass-next]");
  const resetButtons = document.querySelectorAll("[data-compass-reset]");
  const reviewButton = document.querySelector("[data-compass-review]");
  const printButton = document.querySelector("[data-compass-print]");
  const position = form.querySelector("[data-question-position]");
  const answeredPercent = form.querySelector("[data-answered-percent]");
  const progressTrack = form.querySelector("[data-progress-track]");
  const progressSegments = [...form.querySelectorAll("[data-progress-segment]")];
  const autoAdvance = form.querySelector("[data-compass-auto-advance]");
  const status = form.querySelector("[data-compass-status]");
  let activeIndex = 0;
  let answers = {};
  let completed = false;
  let storageAvailable = true;
  let advanceTimer = 0;

  const knownValues = new Set(["-2", "-1", "0", "1", "2", "unknown", "na"]);
  const countAnswered = () => questions.filter((question) => knownValues.has(answers[question.id])).length;

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: contentVersion, activeIndex, answers, completed }));
    } catch {
      storageAvailable = false;
      if (status) status.textContent = "Progress cannot be saved in this browser. Keep this page open to finish.";
    }
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.version === contentVersion && saved.answers && typeof saved.answers === "object") {
      answers = Object.fromEntries(
        questions
          .filter((question) => knownValues.has(saved.answers[question.id]))
          .map((question) => [question.id, saved.answers[question.id]]),
      );
      activeIndex = Math.min(Math.max(Number(saved.activeIndex) || 0, 0), questionPanels.length - 1);
      completed = saved.completed === true;
      for (const question of questions) {
        const value = answers[question.id];
        if (value !== undefined) {
          const input = form.querySelector(`input[name="${question.id}"][value="${CSS.escape(value)}"]`);
          if (input instanceof HTMLInputElement) input.checked = true;
        }
      }
    }
  } catch {
    storageAvailable = false;
  }

  const showQuestion = (index) => {
    activeIndex = Math.max(0, Math.min(index, questionPanels.length - 1));
    completed = false;
    questionPanels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeIndex;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.setAttribute("data-active", String(isActive));
    });
    const totalAnswered = countAnswered();
    const percentage = Math.round((totalAnswered / questions.length) * 100);
    if (position) position.textContent = `Question ${activeIndex + 1} of ${questions.length}`;
    if (answeredPercent) answeredPercent.textContent = `${percentage}% answered`;
    if (progressTrack instanceof HTMLElement) {
      progressTrack.setAttribute("aria-valuenow", String(totalAnswered));
      progressTrack.setAttribute("aria-valuetext", `${totalAnswered} of ${questions.length} answered`);
    }
    progressSegments.forEach((segment, segmentIndex) => {
      segment.classList.toggle("is-current", segmentIndex === activeIndex);
      segment.classList.toggle("is-answered", knownValues.has(answers[questions[segmentIndex]?.id]));
    });
    if (backButton instanceof HTMLButtonElement) backButton.disabled = activeIndex === 0;
    if (nextButton instanceof HTMLButtonElement) {
      nextButton.innerHTML = activeIndex === questionPanels.length - 1
        ? 'See my provisional profile <span aria-hidden="true">→</span>'
        : 'Next <span aria-hidden="true">→</span>';
    }
    save();
  };

  const renderResults = async () => {
    if (!(results instanceof HTMLElement) || !(quiz instanceof HTMLElement)) return;
    window.clearTimeout(advanceTimer);
    const answeredCount = questions.filter((question) => /^-?\d+$/.test(answers[question.id] ?? "")).length;
    const chosenCount = countAnswered();
    const count = results.querySelector("[data-result-count]");
    if (count) count.textContent = `${chosenCount} of ${questions.length} responses recorded · ${answeredCount} included in axis scores`;
    const rows = results.querySelector("[data-axis-results]");
    if (!(rows instanceof HTMLElement)) return;
    rows.replaceChildren();
    const axisScores = new Map(scoreAxes(axes, questions, answers).map((entry) => [entry.axisId, entry]));
    const publishedEvidence = await selectPublicEvidence(fiqhCompassPublicEvidence);
    const answerLabel = new Map(answerOptions.map((option) => [option.value, option.label]));

    // Until a reviewed passage is cleared for display, say so once rather than under every axis.
    const evidenceNote = results.querySelector("[data-evidence-note]");
    if (evidenceNote instanceof HTMLElement) evidenceNote.hidden = publishedEvidence.length > 0;

    for (const axis of axes) {
      const axisQuestions = questions.filter((question) => question.axis === axis.id);
      const result = axisScores.get(axis.id);
      const row = document.createElement("article");
      row.className = "fc-result-row";
      const title = document.createElement("h2");
      title.textContent = axis.title;
      const score = result?.score ?? null;
      const meta = document.createElement("p");
      meta.className = "fc-result-meta";
      meta.textContent = score === null
        ? `No scored answers · 0 of ${axisQuestions.length} draft items`
        : `${result.answered} of ${axisQuestions.length} draft items scored · ${Math.round(score)}/100${result.pattern === "mixed" ? " · responses pull in both directions" : ""}`;
      row.append(title, meta);

      if (score !== null) {
        const meter = document.createElement("div");
        meter.className = "fc-meter";
        meter.setAttribute("role", "img");
        meter.setAttribute("aria-label", `${axis.title}: ${Math.round(score)} out of 100, from ${axis.low} to ${axis.high}`);
        const low = document.createElement("span");
        low.className = "fc-meter__label fc-meter__label--low";
        low.textContent = axis.low;
        const track = document.createElement("span");
        track.className = "fc-meter__track";
        const marker = document.createElement("span");
        marker.className = "fc-meter__marker";
        marker.style.left = `${score}%`;
        track.append(marker);
        const high = document.createElement("span");
        high.className = "fc-meter__label fc-meter__label--high";
        high.textContent = axis.high;
        meter.append(low, track, high);
        row.append(meter);
      }

      const note = document.createElement("p");
      note.className = "fc-result-note";
      note.textContent = axis.note;
      row.append(note);

      // The statements behind this coordinate, with the answer given to each.
      const basis = document.createElement("details");
      basis.className = "fc-result-basis";
      const basisSummary = document.createElement("summary");
      basisSummary.textContent = "Your answers on this dimension";
      basis.append(basisSummary);
      const basisList = document.createElement("ol");
      for (const question of axisQuestions) {
        const item = document.createElement("li");
        const prompt = document.createElement("p");
        prompt.textContent = question.prompt;
        const given = document.createElement("p");
        given.className = "fc-result-basis__answer";
        const value = answers[question.id];
        given.textContent = value === undefined ? "Skipped" : answerLabel.get(value) ?? value;
        item.append(prompt, given);
        basisList.append(item);
      }
      basis.append(basisList);
      row.append(basis);

      const evidenceEntries = publishedEvidence.filter((entry) => entry.axisIds.includes(axis.id));
      if (!evidenceEntries.length) {
        rows.append(row);
        continue;
      }
      const evidenceDisclosure = document.createElement("details");
      evidenceDisclosure.className = "fc-evidence-disclosure";
      const evidenceSummary = document.createElement("summary");
      evidenceSummary.textContent = "Source evidence and review status";
      evidenceDisclosure.append(evidenceSummary);
      const attributionLabels = {
        author_argument: "Author’s argument",
        author_ruling: "Author’s ruling",
        quoted_view: "Quoted view",
        reported_view: "Reported view",
        editorial_inference: "Editorial inference",
      };
      for (const evidence of evidenceEntries) {
        const article = document.createElement("article");
        article.className = "fc-evidence-entry";
        const citation = document.createElement("p");
        citation.className = "fc-evidence-citation";
        citation.textContent = `${evidence.authorLabel}, ${evidence.workTitle}, ${evidence.editionLabel}, ${evidence.printedLocator} (digital locator: ${evidence.digitalLocator})`;
        article.append(citation);
        const type = document.createElement("p");
        type.textContent = `Attribution: ${attributionLabels[evidence.attributionType]}. Review finding: ${evidence.finding.replaceAll("_", " ")}.`;
        article.append(type);
        const arabic = document.createElement("blockquote");
        arabic.lang = "ar";
        arabic.dir = "rtl";
        arabic.textContent = evidence.arabicText;
        article.append(arabic);
        const translation = document.createElement("blockquote");
        translation.lang = "en";
        translation.textContent = evidence.englishText;
        article.append(translation);
        for (const [label, values] of [["Scope", [evidence.scopeNote]], ["Qualifications", evidence.qualifications], ["Counterevidence", evidence.counterEvidence], ["Unresolved", evidence.unresolved]]) {
          if (!values.length) continue;
          const section = document.createElement("p");
          section.textContent = `${label}: ${values.join(" ")}`;
          article.append(section);
        }
        evidenceDisclosure.append(article);
      }
      row.append(evidenceDisclosure);
      rows.append(row);
    }

    completed = true;
    quiz.hidden = true;
    results.hidden = false;
    save();
    results.scrollIntoView({ behavior: "smooth", block: "start" });
    results.querySelector("h1")?.focus({ preventScroll: true });
  };

  form.setAttribute("data-quiz-enhanced", "true");
  if (status && !storageAvailable) status.textContent = "Progress cannot be saved in this browser. Keep this page open to finish.";

  backButton?.addEventListener("click", () => {
    window.clearTimeout(advanceTimer);
    showQuestion(activeIndex - 1);
    questionPanels[activeIndex]?.querySelector("input:checked, input")?.focus({ preventScroll: true });
  });

  form.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "radio") return;
    answers[event.target.name] = event.target.value;
    save();
    if (autoAdvance instanceof HTMLInputElement && autoAdvance.checked) {
      window.clearTimeout(advanceTimer);
      if (status) status.textContent = activeIndex === questionPanels.length - 1 ? "Answer recorded. Preparing your provisional profile." : "Answer recorded. Moving to the next question.";
      advanceTimer = window.setTimeout(() => {
        if (activeIndex === questionPanels.length - 1) {
          renderResults();
          return;
        }
        showQuestion(activeIndex + 1);
        questionPanels[activeIndex]?.querySelector("input:checked, input")?.focus({ preventScroll: true });
      }, 180);
    }
  });

  const advance = () => {
    window.clearTimeout(advanceTimer);
    if (activeIndex === questionPanels.length - 1) {
      renderResults();
      return;
    }
    showQuestion(activeIndex + 1);
    questionPanels[activeIndex]?.querySelector("input:checked, input")?.focus({ preventScroll: true });
    questionPanels[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  nextButton?.addEventListener("click", advance);

  const reset = () => {
    if (countAnswered() > 0 && !window.confirm("Clear every answer and start the quiz again?")) return;
    window.clearTimeout(advanceTimer);
    answers = {};
    activeIndex = 0;
    completed = false;
    try { localStorage.removeItem(STORAGE_KEY); } catch { storageAvailable = false; }
    form.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
    if (results instanceof HTMLElement) results.hidden = true;
    if (quiz instanceof HTMLElement) quiz.hidden = false;
    showQuestion(0);
    questionPanels[0]?.querySelector("input")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  resetButtons.forEach((button) => button.addEventListener("click", reset));
  reviewButton?.addEventListener("click", () => {
    if (results instanceof HTMLElement) results.hidden = true;
    if (quiz instanceof HTMLElement) quiz.hidden = false;
    showQuestion(0);
    questionPanels[0]?.querySelector("input:checked, input")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  printButton?.addEventListener("click", () => window.print());

  document.documentElement.classList.add("js");
  if (completed) renderResults();
  else showQuestion(activeIndex);
}
