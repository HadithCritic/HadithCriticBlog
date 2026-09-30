export {};

type CommentaryRecord = {
  elementName: string;
  nativeId: string | null;
  exactText: string;
  xmlLangExact: string | null;
  locator: string;
  elementPath: string;
  line: number;
  sourceUrl: string;
};
type CommentaryShard = {
  sourceFile: string;
  recordCount: number;
  records: CommentaryRecord[];
  sourceElementCount: number;
  sourceElements: CommentaryRecord[];
  headerElementCount: number;
  headerElements: CommentaryRecord[];
};
type CommentaryManifest = {
  recordCount: number;
  sourceFileCount: number;
  exactTextUtf8Bytes: number;
  sourceElementCount: number;
  headerElementCount: number;
  headerElementNameCounts: Record<string, number>;
  sourceElementNameCounts: Record<string, number>;
  sourceElementNames: string[];
  headerElementNames: string[];
  assets: Array<{ sourceFile: string; path: string; recordCount: number; sourceElementCount: number; headerElementCount: number }>;
};

const MANIFEST_URL = "/data/quran/releases/v0.5.23-cc-57cb2b7be321/commentary-manifest.json";
const PAGE_SIZE = 30;
const form = document.querySelector<HTMLFormElement>("#qcb-form");
const sourceSelect = document.querySelector("#qcb-source") as HTMLSelectElement | null;
const scopeSelect = document.querySelector("#qcb-scope") as HTMLSelectElement | null;
const elementSelect = document.querySelector("#qcb-element") as HTMLSelectElement | null;
const queryInput = document.querySelector<HTMLInputElement>("#qcb-query");
const emptyInput = document.querySelector<HTMLInputElement>("#qcb-include-empty");
const status = document.querySelector<HTMLElement>("#qcb-status");
const results = document.querySelector<HTMLOListElement>("#qcb-results");
const more = document.querySelector<HTMLButtonElement>("#qcb-more");

const shardCache = new Map<string, Promise<CommentaryShard>>();
let manifest: CommentaryManifest | null = null;
let records: CommentaryRecord[] = [];
let sourceElements: CommentaryRecord[] = [];
let headerElements: CommentaryRecord[] = [];
let visibleCount = 0;

function fetchShard(path: string): Promise<CommentaryShard> {
  let pending = shardCache.get(path);
  if (!pending) {
    const manifestUrl = new URL(MANIFEST_URL, window.location.origin);
    pending = fetch(new URL(path, manifestUrl)).then((response) => {
      if (!response.ok) throw new Error(`Commentary source shard unavailable: ${path}`);
      return response.json() as Promise<CommentaryShard>;
    });
    shardCache.set(path, pending);
  }
  return pending;
}

function appendRecord(record: CommentaryRecord): void {
  if (!results) return;
  const item = document.createElement("li");
  item.className = "qcb-entry";
  const header = document.createElement("header");
  const kind = document.createElement("span");
  kind.className = "qcb-kind";
  kind.textContent = `TEI ${record.elementName}`;
  const language = document.createElement("span");
  language.className = "qcb-language";
  language.textContent = record.xmlLangExact ?? "Language not declared on this element";
  header.appendChild(kind);
  header.appendChild(language);

  const quotation = document.createElement("blockquote");
  quotation.className = "qcb-exact";
  quotation.dir = "auto";
  if (record.xmlLangExact) quotation.lang = record.xmlLangExact;
  quotation.textContent = record.exactText;

  const locator = document.createElement("p");
  locator.className = "qcb-locator";
  locator.textContent = `${record.locator} · source line ${record.line}`;
  const source = document.createElement("a");
  source.href = record.sourceUrl;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = "Open exact commentary TEI line ↗";

  item.appendChild(header);
  item.appendChild(quotation);
  item.appendChild(locator);
  item.appendChild(source);
  results.appendChild(item);
}

function render(reset: boolean): void {
  if (!status || !results || !more || !queryInput || !emptyInput || !sourceSelect || !scopeSelect || !elementSelect) return;
  const sourceFile = sourceSelect.value;
  const query = queryInput.value;
  const scope = scopeSelect.value === "body" ? sourceElements
    : scopeSelect.value === "header" ? headerElements : records;
  const elementName = elementSelect.value;
  const matching = scope.filter((record) => (query ? record.exactText.includes(query) : scopeSelect.value === "blocks" || emptyInput.checked || Boolean(record.exactText.trim()))
    && (elementName === "all" || record.elementName === elementName));
  if (reset) {
    visibleCount = 0;
    results.replaceChildren();
  }
  matching.slice(visibleCount, visibleCount + PAGE_SIZE).forEach(appendRecord);
  visibleCount = Math.min(matching.length, visibleCount + PAGE_SIZE);
  more.hidden = visibleCount >= matching.length;
  const scopeLabel = scopeSelect.value === "body" ? "text/body elements"
    : scopeSelect.value === "header" ? "teiHeader elements" : "text blocks";
  const label = matching.length === 1 ? "record matches" : "records match";
  status.textContent = `${matching.length.toLocaleString()} of ${scope.length.toLocaleString()} ${scopeLabel} in ${sourceFile}${elementName === "all" ? "" : ` · TEI ${elementName}`}: ${label}. Showing ${visibleCount.toLocaleString()}. Search is literal and case-sensitive; displayed text is unchanged.`;
}

async function loadSelectedFile(): Promise<void> {
  if (!manifest || !status || !sourceSelect || !scopeSelect || !elementSelect) return;
  const selected = manifest.assets.find((asset) => asset.sourceFile === sourceSelect.value);
  if (!selected) {
    records = [];
    if (results) results.replaceChildren();
    if (more) more.hidden = true;
    status.textContent = "Choose a commentary source file to load its source-located records.";
    return;
  }
  status.textContent = `Loading commentary records from ${selected.sourceFile}…`;
  try {
    const shard = await fetchShard(selected.path);
    if (shard.sourceFile !== selected.sourceFile || shard.records.length !== selected.recordCount
        || shard.sourceElements.length !== selected.sourceElementCount
        || shard.sourceElementCount !== selected.sourceElementCount
        || shard.headerElements.length !== selected.headerElementCount
        || shard.headerElementCount !== selected.headerElementCount) {
      throw new Error("Commentary shard identity or count mismatch");
    }
    records = shard.records;
    sourceElements = shard.sourceElements;
    headerElements = shard.headerElements;
    render(true);
  } catch (error) {
    console.error("Could not load Quran commentary shard", error);
    status.textContent = "This commentary file could not be loaded. Use the release manifest to inspect the indexed source files.";
  }
}

if (form && sourceSelect && scopeSelect && elementSelect && queryInput && emptyInput && status && results && more) {
  void fetch(MANIFEST_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Commentary manifest unavailable");
      return response.json() as Promise<CommentaryManifest>;
    })
    .then((data) => {
      manifest = data;
      sourceSelect.disabled = false;
      scopeSelect.disabled = false;
      elementSelect.disabled = false;
      queryInput.disabled = false;
      emptyInput.disabled = false;
      form.querySelector<HTMLButtonElement>("button[type='submit']")!.disabled = false;
      more.disabled = false;
      const params = new URLSearchParams(window.location.search);
      const requestedFile = params.get("file");
      const requestedAsset = data.assets.find((asset) => asset.sourceFile === requestedFile);
      sourceSelect.value = requestedAsset?.sourceFile ?? data.assets[0]?.sourceFile ?? "";
      scopeSelect.value = ["body", "header"].includes(params.get("scope") ?? "") ? params.get("scope")! : "blocks";
      const requestedElement = params.get("element");
      elementSelect.value = requestedElement && [...data.sourceElementNames, ...data.headerElementNames].includes(requestedElement) ? requestedElement : "all";
      queryInput.value = params.get("q") ?? "";
      emptyInput.checked = params.get("includeEmpty") === "1";
      void loadSelectedFile();
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set("file", sourceSelect.value);
        url.searchParams.set("scope", scopeSelect.value);
        if (elementSelect.value === "all") url.searchParams.delete("element");
        else url.searchParams.set("element", elementSelect.value);
        if (queryInput.value) url.searchParams.set("q", queryInput.value);
        else url.searchParams.delete("q");
        if (emptyInput.checked) url.searchParams.set("includeEmpty", "1");
        else url.searchParams.delete("includeEmpty");
        window.history.replaceState({}, "", url);
        void loadSelectedFile();
      });
      emptyInput.addEventListener("change", () => render(true));
      more.addEventListener("click", () => render(false));
    })
    .catch((error) => {
      console.error("Could not load Quran commentary manifest", error);
      status.textContent = "The commentary index could not be loaded. Source links in the preview remain available.";
    });
}
