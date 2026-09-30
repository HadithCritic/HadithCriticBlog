export {};

type FieldValue = {
  exactText: string;
  attributes: Array<{ expandedName: string; exactValue: string }>;
  elementName: string;
  elementPath: string;
  line: number;
  locator: string;
  sourceUrl: string;
};
type IntertextRecord = {
  nativeId: string | null;
  recordLocator: string;
  source: { file: string; line: number; sha256: string; url: string };
  fields: Record<string, { label: string; values: FieldValue[] }>;
};
type IntertextIndex = { recordCount: number; records: IntertextRecord[] };

const INDEX_URL = "/data/quran/releases/v0.5.26-cc-57cb2b7be321/intertext-catalog.json";
const PAGE_SIZE = 20;
const form = document.querySelector<HTMLFormElement>("#qix-form");
const queryInput = document.querySelector<HTMLInputElement>("#qix-query");
const status = document.querySelector<HTMLElement>("#qix-status");
const results = document.querySelector<HTMLOListElement>("#qix-results");
const more = document.querySelector<HTMLButtonElement>("#qix-more");
let index: IntertextIndex | null = null;
let visibleCount = 0;

function appendField(parent: HTMLElement, record: IntertextRecord, key: string): void {
  const field = record.fields[key];
  if (!field?.values.length) return;
  for (const value of field.values) {
    const group = document.createElement("section");
    group.className = "qix-field";
    const label = document.createElement("h4");
    label.textContent = field.label;
    const exact = document.createElement("p");
    exact.className = "qix-exact";
    exact.dir = "auto";
    exact.textContent = value.exactText || "[empty source element]";
    const locator = document.createElement("p");
    locator.className = "qix-locator";
    locator.textContent = `${value.locator} · source line ${value.line}`;
    const link = document.createElement("a");
    link.href = value.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open source element line ↗";
    group.appendChild(label);
    group.appendChild(exact);
    if (value.attributes.length) {
      const attrs = document.createElement("ul");
      attrs.className = "qix-attrs";
      for (const attribute of value.attributes) {
        const row = document.createElement("li");
        row.textContent = `${attribute.expandedName} = ${attribute.exactValue}`;
        attrs.appendChild(row);
      }
      group.appendChild(attrs);
    }
    group.appendChild(locator);
    group.appendChild(link);
    parent.appendChild(group);
  }
}

function appendRecord(record: IntertextRecord): void {
  if (!results) return;
  const item = document.createElement("li");
  item.className = "qix-entry";
  const titleValue = record.fields.sourceDocumentTitle?.values[0]?.exactText;
  const title = document.createElement("h3");
  title.textContent = titleValue || "Source document title not supplied";
  const identity = document.createElement("p");
  identity.className = "qix-identity";
  identity.textContent = `Native msDesc ID: ${record.nativeId ?? "not supplied"} · ${record.recordLocator} · source line ${record.source.line}`;
  const sourceLink = document.createElement("a");
  sourceLink.href = record.source.url;
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";
  sourceLink.textContent = "Open exact TEI record line ↗";
  item.appendChild(title);
  item.appendChild(identity);
  item.appendChild(sourceLink);
  for (const key of ["repository", "identifier", "workTitle", "workAuthor", "textLanguage", "originDate", "originPlace", "summary", "bibliography"]) {
    appendField(item, record, key);
  }
  results.appendChild(item);
}

function render(reset: boolean): void {
  if (!index || !results || !status || !more || !queryInput) return;
  const query = queryInput.value;
  const recordId = new URLSearchParams(window.location.search).get("record");
  const matching = recordId
    ? index.records.filter((record) => record.nativeId === recordId)
    : query
    ? index.records.filter((record) => JSON.stringify(record).includes(query))
    : index.records;
  if (reset) {
    visibleCount = 0;
    results.replaceChildren();
  }
  matching.slice(visibleCount, visibleCount + PAGE_SIZE).forEach(appendRecord);
  visibleCount = Math.min(matching.length, visibleCount + PAGE_SIZE);
  more.hidden = visibleCount >= matching.length;
  status.textContent = recordId
    ? matching.length
      ? `Exact source record ${recordId} found in the pinned catalog.`
      : `No record ${recordId} in this pinned catalog.`
    : `${matching.length.toLocaleString()} of ${index.records.length.toLocaleString()} source records match. Showing ${visibleCount.toLocaleString()}. Search is a literal, case-sensitive substring check; displayed source values are unchanged.`;
}

if (form && queryInput && status && results && more) {
  void fetch(INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Intertext catalogue unavailable");
      return response.json() as Promise<IntertextIndex>;
    })
    .then((data) => {
      if (data.records.length !== data.recordCount || data.recordCount !== 713) {
        throw new Error("Intertext catalogue coverage mismatch");
      }
      index = data;
      queryInput.disabled = false;
      form.querySelector<HTMLButtonElement>("button[type='submit']")!.disabled = false;
      more.disabled = false;
      queryInput.value = new URLSearchParams(window.location.search).get("q") ?? "";
      render(true);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.delete("record");
        if (queryInput.value) url.searchParams.set("q", queryInput.value);
        else url.searchParams.delete("q");
        window.history.replaceState({}, "", url);
        render(true);
      });
      more.addEventListener("click", () => render(false));
    })
    .catch((error) => {
      console.error("Could not load Quran intertext catalogue", error);
      status.textContent = "The intertext catalogue could not be loaded. The source-linked preview remains available.";
    });
}
