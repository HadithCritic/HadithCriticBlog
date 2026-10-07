import { compareFigures, figurePositions, toScore } from "./fiqh-compass-figures.js";

const SHOWN = 5;
const RELATION_LABEL = { agree: "close", partly: "some distance", differ: "far apart" };

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function kindLabel(placement) {
  if (placement.kind === "report") return `Reported by ${placement.by}`;
  if (placement.kind === "editor") return "Quoted in the modern editor's introduction";
  return "From the figure's own work";
}

function citation(placement, books) {
  const book = books[placement.book];
  const volume = placement.volume === "مقدمة" ? "introduction" : `vol. ${placement.volume}`;
  return `${book.author_en}, ${book.title_en}, ${volume}, p. ${placement.page} (Shamela book ${placement.book}, serial ${placement.serial})`;
}

/** One cited passage: the reading, the Arabic it rests on, and where it is. */
function sourceEntry(placement, books, name) {
  const entry = el("div", "fc-source");
  const head = el("p", "fc-source__statement");
  if (name) head.append(el("strong", "", `${name}. `));
  head.append(placement.statement_en);
  const quote = el("blockquote", "fc-source__ar", placement.quote_ar);
  quote.lang = "ar";
  quote.dir = "rtl";
  entry.append(head, quote, el("p", "fc-source__cite", `${kindLabel(placement)} · ${citation(placement, books)}`));
  return entry;
}

function figureCard(entry, data, axisTitle) {
  const { figure } = entry;
  const card = el("article", "fc-figure");
  card.append(
    el("h3", "fc-figure__name", figure.name_en),
    el("p", "fc-figure__meta", `d. ${figure.died_ah} AH / ${figure.died_ce} CE · ${figure.tradition}`),
    el("p", "fc-figure__score", `${Math.round(entry.agreement)}% similar on ${entry.axes.length} shared dimension${entry.axes.length === 1 ? "" : "s"}`),
  );
  const list = el("ul", "fc-figure__axes");
  for (const axis of entry.axes) {
    const item = el("li");
    item.append(
      el("span", "fc-figure__axis", axisTitle.get(axis.axisId)),
      el("span", "fc-figure__values", `You ${Math.round(axis.respondent)} · ${figure.name_en} ${Math.round(axis.figure)}`),
      el("span", "fc-figure__relation", RELATION_LABEL[axis.relation]),
    );
    list.append(item);
  }
  card.append(list);
  const shared = new Set(entry.axes.map((a) => a.axisId));
  const sources = el("details", "fc-figure__sources");
  sources.append(el("summary", "", "The passages behind these placements"));
  for (const p of data.placements) {
    if (p.figure === figure.id && shared.has(p.axis)) sources.append(sourceEntry(p, data.books, axisTitle.get(p.axis)));
  }
  card.append(sources);
  return card;
}

/** Fill the closest-figures section from the respondent's axis scores. */
export function renderFigureComparison(container, axes, axisScores, data) {
  container.replaceChildren();
  const axisTitle = new Map(axes.map((a) => [a.id, a.title]));
  const { compared, tooFew, stability } = compareFigures(axisScores, data.figures, data.placements);
  container.append(el("h2", "fc-figures__title", "Closest historical figures"));
  container.append(el("p", "fc-figures__lede",
    "A figure is placed on a dimension only where a cited passage states a view, so each comparison uses only the dimensions you and that figure share. "
    + "The readings were made with machine assistance and have not been reviewed by a specialist. Similarity is 100 minus the average distance on those dimensions; it is not a probability, an identity, or a measure of who is right."));
  if (!compared.length) {
    container.append(el("p", "fc-figures__empty", "Answer more statements to compare: each figure needs at least two dimensions in common with your answers."));
    return;
  }
  if (stability) {
    const top = compared[0].figure.name_en;
    container.append(el("p", "fc-figures__stability",
      `${top} stays closest in ${stability.held} of ${stability.of} checks that each leave out one shared dimension.`));
  }
  const list = el("div", "fc-figures__list");
  compared.slice(0, SHOWN).forEach((entry) => list.append(figureCard(entry, data, axisTitle)));
  container.append(list);
  const rest = compared.slice(SHOWN);
  if (rest.length) {
    const more = el("details", "fc-figures__more");
    more.append(el("summary", "", `${rest.length} more compared`));
    rest.forEach((entry) => more.append(figureCard(entry, data, axisTitle)));
    container.append(more);
  }
  if (tooFew.length) {
    container.append(el("p", "fc-figures__few",
      `Too few shared dimensions to compare: ${tooFew.map((f) => f.name_en).join(", ")}.`));
  }
}

/** Every placement on one axis, for the per-dimension result row. */
export function axisFigureDisclosure(axisId, data) {
  const here = data.placements.filter((p) => p.axis === axisId);
  if (!here.length) return null;
  const names = new Map(data.figures.map((f) => [f.id, f.name_en]));
  const positions = figurePositions(here);
  const details = el("details", "fc-figures-axis");
  details.append(el("summary", "", `Where figures stand on this dimension (${positions.size})`));
  for (const p of [...here].sort((a, b) => a.position - b.position)) {
    const name = `${names.get(p.figure)}, ${Math.round(toScore(p.position))}/100`;
    details.append(sourceEntry(p, data.books, name));
  }
  return details;
}
