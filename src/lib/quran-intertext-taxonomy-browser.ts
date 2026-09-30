export {};

type Description = {
  exactText: string;
  attributes: Array<{ expandedName: string; exactValue: string }>;
  locator: string;
  line: number;
  sourceUrl: string;
};
type Category = {
  nativeId: string;
  parentNativeId: string;
  depth: number;
  siblingOrder: number;
  attributes: Array<{ expandedName: string; exactValue: string }>;
  elementPath: string;
  line: number;
  locator: string;
  sourceUrl: string;
  descriptions: Description[];
};
type Taxonomy = { categoryCount: number; categories: Category[] };

const INDEX_URL = "/data/quran/releases/v0.5.23-cc-57cb2b7be321/intertext-taxonomy.json";
const form = document.querySelector<HTMLFormElement>("#qtx-form");
const input = document.querySelector<HTMLInputElement>("#qtx-query");
const status = document.querySelector<HTMLElement>("#qtx-status");
const results = document.querySelector<HTMLOListElement>("#qtx-results");
let categoryById = new Map<string, Category>();

function makeEntry(category: Category): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qtx-entry";
  item.dataset.categoryId = category.nativeId;
  item.style.setProperty("--qtx-depth", String(category.depth - 1));
  const headingRow = document.createElement("div");
  headingRow.className = "qtx-entry-heading";
  const heading = document.createElement("h3");
  heading.textContent = category.descriptions[0]?.exactText || "[category has no description]";
  const sourceLink = document.createElement("a");
  sourceLink.href = category.sourceUrl;
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";
  sourceLink.textContent = "Open source category line ↗";
  headingRow.appendChild(heading);
  headingRow.appendChild(sourceLink);

  const parent = categoryById.get(category.parentNativeId);
  const identity = document.createElement("p");
  identity.className = "qtx-identity";
  const code = document.createElement("code");
  code.textContent = category.nativeId;
  identity.appendChild(code);
  identity.appendChild(document.createTextNode(` · parent: ${parent?.descriptions[0]?.exactText || category.parentNativeId} · depth ${category.depth} · source order ${category.siblingOrder}`));
  const locator = document.createElement("p");
  locator.className = "qtx-locator";
  locator.textContent = `${category.locator} · ${category.elementPath} · source line ${category.line}`;
  item.appendChild(headingRow);
  item.appendChild(identity);
  item.appendChild(locator);

  if (category.attributes.length) {
    const attrs = document.createElement("ul");
    attrs.className = "qtx-attrs";
    for (const attribute of category.attributes) {
      const row = document.createElement("li");
      row.textContent = `${attribute.expandedName} = ${attribute.exactValue}`;
      attrs.appendChild(row);
    }
    item.appendChild(attrs);
  }
  for (const description of category.descriptions.slice(1)) {
    const group = document.createElement("div");
    group.className = "qtx-description";
    const text = document.createElement("p");
    text.dir = "auto";
    text.textContent = description.exactText || "[empty source description]";
    const sourceLocator = document.createElement("p");
    sourceLocator.className = "qtx-locator";
    sourceLocator.textContent = `${description.locator} · source line ${description.line}`;
    const link = document.createElement("a");
    link.href = description.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open source description line ↗";
    group.appendChild(text);
    group.appendChild(sourceLocator);
    group.appendChild(link);
    item.appendChild(group);
  }
  return item;
}

function render(taxonomy: Taxonomy): void {
  if (!input || !status || !results) return;
  const query = input.value;
  const matches = query
    ? taxonomy.categories.filter((category) =>
        category.nativeId.includes(query)
        || category.attributes.some((attribute) => attribute.exactValue.includes(query))
        || category.descriptions.some((description) =>
          description.exactText.includes(query)
          || description.attributes.some((attribute) => attribute.exactValue.includes(query)))
      )
    : taxonomy.categories;
  const visibleIds = new Set(matches.map((category) => category.nativeId));
  for (const category of matches) {
    let parent = categoryById.get(category.parentNativeId);
    while (parent) {
      visibleIds.add(parent.nativeId);
      parent = categoryById.get(parent.parentNativeId);
    }
  }
  results.replaceChildren(...taxonomy.categories
    .filter((category) => visibleIds.has(category.nativeId))
    .map((category) => makeEntry(category)));
  status.textContent = `${matches.length.toLocaleString()} of ${taxonomy.categories.length.toLocaleString()} source categories match. Showing matching categories with their source ancestors. Search is a literal, case-sensitive substring check.`;
}

if (form && input && status && results) {
  void fetch(INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Intertext taxonomy unavailable");
      return response.json() as Promise<Taxonomy>;
    })
    .then((taxonomy) => {
      if (taxonomy.categories.length !== taxonomy.categoryCount || taxonomy.categoryCount !== 122) {
        throw new Error("Intertext taxonomy coverage mismatch");
      }
      categoryById = new Map(taxonomy.categories.map((category) => [category.nativeId, category]));
      input.disabled = false;
      form.querySelector<HTMLButtonElement>("button[type='submit']")!.disabled = false;
      input.value = new URLSearchParams(window.location.search).get("q") ?? "";
      render(taxonomy);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const url = new URL(window.location.href);
        if (input.value) url.searchParams.set("q", input.value);
        else url.searchParams.delete("q");
        window.history.replaceState({}, "", url);
        render(taxonomy);
      });
    })
    .catch((error) => {
      console.error("Could not load Quran intertext taxonomy", error);
      status.textContent = "The interactive category search could not be loaded. The complete source hierarchy remains available below.";
    });
}
