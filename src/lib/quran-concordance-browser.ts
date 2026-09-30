import { concordanceFieldDisplayLabel } from "../data/quran-concordance-field-labels";

export {};

type FieldValue = string;
type RecordRow = {
  nativeId: string | null;
  sourceOrder: number;
  attributes: Array<{ expandedName: string; exactValue: string }>;
  fieldValuesExact: FieldValue[];
  locator: string;
  elementPath: string;
  line: number;
  sourceUrl: string;
};
type Shard = {
  path: string;
  sourceFile: string;
  sourceFileSha256: string;
  bytes: number;
  sha256: string;
  recordCount: number;
  fieldCount: number;
  sourceTitleExact: string;
  sourceTitlePath: string;
  sourceTitleLine: number;
  sourceTitleLocator: string;
  sourceTitleSourceUrl: string;
};
type Catalog = {
  schemaVersion: string;
  sourceCommit: string;
  sourceLicense: string;
  recordCount: number;
  fieldCount: number;
  fieldOrderExact: string[];
  shards: Shard[];
};
type Payload = { sourceFile: string; sourceFileSha256: string; recordCount: number; fieldCount: number; records: RecordRow[] };

const RELEASE = "v0.5.23-cc-57cb2b7be321";
const ROOT = `/data/quran/releases/${RELEASE}/`;
const PAGE_SIZE = 20;
const form = document.querySelector<HTMLFormElement>("#qcn-form");
const fileSelect = document.querySelector("#qcn-file") as HTMLSelectElement | null;
const queryInput = document.querySelector<HTMLInputElement>("#qcn-query");
const status = document.querySelector<HTMLElement>("#qcn-status");
const results = document.querySelector<HTMLOListElement>("#qcn-results");
const more = document.querySelector<HTMLButtonElement>("#qcn-more");
let catalog: Catalog | null = null;
let payload: Payload | null = null;
let matching: RecordRow[] = [];
let visible = 0;

function updateTitleSourceLink(): void {
  if (!fileSelect || !catalog) return;
  const target = document.querySelector("#qcn-title-source") as HTMLElement | null;
  const shard = catalog.shards.find((item) => item.path === fileSelect.value);
  if (!target || !shard) return;
  target.replaceChildren();
  const link = document.createElement("a");
  link.href = shard.sourceTitleSourceUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = `Open the exact source title at line ${shard.sourceTitleLine} ↗`;
  target.appendChild(link);
  const locator = document.createElement("span");
  locator.textContent = ` · ${shard.sourceTitleLocator}`;
  target.appendChild(locator);
}

function field(row: RecordRow, type: string): string {
  const index = catalog?.fieldOrderExact.indexOf(type) ?? -1;
  return index < 0 ? "" : row.fieldValuesExact[index] ?? "";
}

function textElement(tag: string, className: string, text: string): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function appendRecord(row: RecordRow): void {
  if (!results || !catalog) return;
  const item = document.createElement("li");
  item.className = "qcn-record";
  const title = document.createElement("h3");
  const sura = field(row, "sura");
  const verse = field(row, "verse");
  const word = field(row, "word_number");
  const analysis = field(row, "analysis_number");
  title.textContent = `Source word ${sura}:${verse}:${word} · analysis ${analysis}`;
  item.appendChild(title);

  const comparison = document.createElement("dl");
  comparison.className = "qcn-comparison";
  for (const type of ["word_rafi_talmon", "word_corpus_coranicum", "base_rafi_talmon", "base_corpus_coranicum", "root_rafi_talmon", "root_corpus_coranicum"]) {
    const dt = document.createElement("dt");
    dt.textContent = concordanceFieldDisplayLabel(type);
    const dd = document.createElement("dd");
    dd.dir = "auto";
    const value = field(row, type);
    dd.textContent = value === "" ? "[empty source field]" : value;
    comparison.appendChild(dt);
    comparison.appendChild(dd);
  }
  item.appendChild(comparison);

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = `All ${catalog.fieldOrderExact.length} source fields`;
  details.appendChild(summary);
  const table = document.createElement("dl");
  table.className = "qcn-fields";
  catalog.fieldOrderExact.forEach((type, index) => {
    const dt = document.createElement("dt");
    dt.textContent = concordanceFieldDisplayLabel(type);
    const dd = document.createElement("dd");
    dd.dir = "auto";
    const value = row.fieldValuesExact[index] ?? "";
    dd.textContent = value === "" ? "[empty source field]" : value;
    table.appendChild(dt);
    table.appendChild(dd);
  });
  details.appendChild(table);
  item.appendChild(details);

  const locator = textElement("p", "qcn-locator", `${row.locator} · source line ${row.line} · source order ${row.sourceOrder}`);
  item.appendChild(locator);
  const source = document.createElement("a");
  source.href = row.sourceUrl;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = "Open source TEI line ↗";
  item.appendChild(source);
  results.appendChild(item);
}

function render(reset: boolean): void {
  if (!status || !results || !more || !queryInput || !payload) return;
  if (reset) {
    visible = 0;
    results.replaceChildren();
  }
  matching.slice(visible, visible + PAGE_SIZE).forEach(appendRecord);
  visible = Math.min(matching.length, visible + PAGE_SIZE);
  more.hidden = visible >= matching.length;
  status.textContent = `${matching.length.toLocaleString()} source records match in ${payload.sourceFile}. Showing ${visible.toLocaleString()}. Search is literal and case-sensitive; source values and field order are unchanged.`;
}

async function loadSelected(): Promise<void> {
  if (!fileSelect || !status || !catalog) return;
  const shard = catalog.shards.find((item) => item.path === fileSelect.value);
  if (!shard) throw new Error("Selected source file is absent from the catalog");
  status.textContent = `Loading ${shard.sourceFile} (${shard.recordCount.toLocaleString()} source records)…`;
  const response = await fetch(`${ROOT}${encodeURIComponent(shard.path)}`);
  if (!response.ok) throw new Error(`Could not load ${shard.sourceFile}`);
  const data = await response.json() as Payload;
  if (data.sourceFile !== shard.sourceFile || data.sourceFileSha256 !== shard.sourceFileSha256
      || data.records.length !== shard.recordCount || data.fieldCount !== shard.fieldCount) {
    throw new Error("Selected source shard failed catalog coverage checks");
  }
  payload = data;
  const query = queryInput?.value ?? "";
  matching = query
    ? data.records.filter((row) => row.fieldValuesExact.some((value) => value.includes(query)))
    : data.records;
  render(true);
}

if (form && fileSelect && queryInput && status && results && more) {
  void fetch(`${ROOT}concordance-catalog.json`)
    .then((response) => {
      if (!response.ok) throw new Error("Concordance catalog unavailable");
      return response.json() as Promise<Catalog>;
    })
    .then((data) => {
      if (data.sourceCommit !== "57cb2b7be321ecfba100cb5f7988974f47864a14"
          || data.shards.length !== 114 || data.recordCount !== 91285
          || data.fieldCount !== 3833970 || data.fieldOrderExact.length !== 42) {
        throw new Error("Concordance catalog coverage mismatch");
      }
      catalog = data;
      fileSelect.replaceChildren(...data.shards.map((shard) => {
        const option = document.createElement("option");
        option.value = shard.path;
        option.textContent = `${shard.sourceTitleExact} · ${shard.recordCount.toLocaleString()} source records`;
        return option;
      }));
      const params = new URLSearchParams(window.location.search);
      queryInput.value = params.get("q") ?? "";
      const requested = params.get("file");
      if (requested && data.shards.some((shard) => shard.path === requested)) fileSelect.value = requested;
      updateTitleSourceLink();
      fileSelect.addEventListener("change", updateTitleSourceLink);
      fileSelect.disabled = false;
      queryInput.disabled = false;
      form.querySelector<HTMLButtonElement>("button[type='submit']")!.disabled = false;
      more.disabled = false;
      status.textContent = "Choose a source file and load its exact source records.";
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set("file", fileSelect.value);
        if (queryInput.value) url.searchParams.set("q", queryInput.value);
        else url.searchParams.delete("q");
        window.history.replaceState({}, "", url);
        void loadSelected().catch((error: unknown) => {
          console.error("Could not load Quran concordance", error);
          status.textContent = "The selected source file could not be loaded. Use the catalog download to inspect release metadata.";
        });
      });
      more.addEventListener("click", () => render(false));
      if (requested && data.shards.some((shard) => shard.path === requested)) {
        void loadSelected().catch((error: unknown) => {
          console.error("Could not load Quran concordance", error);
          status.textContent = "The selected source file could not be loaded.";
        });
      }
    })
    .catch((error: unknown) => {
      console.error("Could not load Quran concordance catalog", error);
      status.textContent = "The concordance catalog could not be loaded. The release manifest and source files remain available below.";
    });
}
