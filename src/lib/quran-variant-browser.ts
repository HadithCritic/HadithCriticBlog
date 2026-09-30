export {};

type CatalogRecord = {
  variantId: string;
  readerNativeKey: string | null;
  readerExactLabel: string | null;
  readerAuthority: null | { nativeKey: string; exactLabel: string | null; sourceUrl: string };
  readerReferences: Array<{
    ordinal: number;
    nativeKey: string | null;
    exactLabel: string;
    sourceRecord: { url: string; line: number; locator: string };
    readerAuthority: null | { nativeKey: string; exactLabel: string | null; sourceUrl: string; linkRule: string };
  }>;
  sourceNativeKey: string | null;
  exactSourceText: string;
  sourceRecord: { url: string; line: number };
  citationState: string;
  candidateCount: number;
  candidateVerseIds: string[];
  detailsFile: string;
};

type DetailWord = {
  ordinal: number;
  exactText: string;
  sourceLocator: string | null;
  alignment: null | {
    method: string;
    reviewState: string;
    targetExactText: string;
    targetSourceUrl: string | null;
    targetVerseSourceUrl: string | null;
    targetVerseId: string;
  };
};

type DetailShard = {
  records: Array<{ variantId: string; words: DetailWord[] }>;
  passages: Record<string, { exactText: string | null; sourceUrl: string | null }>;
};

type ReaderIndex = { records: Array<{ variantId: string; references: CatalogRecord["readerReferences"] }> };
type VariantCatalog = { recordCount: number; readerIndexFiles: Array<{ path: string }>; records: Array<Omit<CatalogRecord, "readerReferences"> & { readerReferenceCount: number }> };

const RELEASE_URL = new URL(
  "/data/quran/releases/v0.5.23-cc-57cb2b7be321/",
  window.location.origin,
);
const CATALOG_URL = new URL("variant-catalog.json", RELEASE_URL);
const MISSING_READER_KEY = "__missing_reader_key__";
const PAGE_SIZE = 24;

const form = document.querySelector<HTMLFormElement>("#qv-search-form");
const queryInput = document.querySelector<HTMLInputElement>("#qv-query");
const readerSelect = document.querySelector("#qv-reader") as HTMLSelectElement | null;
const submit = form?.querySelector<HTMLButtonElement>("button[type='submit']");
const results = document.querySelector<HTMLOListElement>("#qv-results");
const searchStatus = document.querySelector<HTMLElement>("#qv-search-status");
const more = document.querySelector<HTMLButtonElement>("#qv-more");

const shardCache = new Map<string, Promise<DetailShard>>();
let allRecords: CatalogRecord[] = [];
let filteredRecords: CatalogRecord[] = [];
let shown = 0;
let initialFragmentHandled = false;
let printDetails: Array<{ element: HTMLDetailsElement; open: boolean }> = [];
let catalogPromise: Promise<void> | null = null;

window.addEventListener("beforeprint", () => {
  printDetails = [...document.querySelectorAll<HTMLDetailsElement>(".qv-record details")]
    .map((element) => ({ element, open: element.open }));
  for (const entry of printDetails) entry.element.open = true;
});
window.addEventListener("afterprint", () => {
  for (const entry of printDetails) entry.element.open = entry.open;
});

function loadShard(filename: string): Promise<DetailShard> {
  let cached = shardCache.get(filename);
  if (!cached) {
    cached = fetch(new URL(filename, CATALOG_URL))
      .then((response) => {
        if (!response.ok) throw new Error("Variant detail shard unavailable");
        return response.json() as Promise<DetailShard>;
      });
    shardCache.set(filename, cached);
  }
  return cached;
}

function appendExternalLink(parent: HTMLElement, href: string | null, label: string): void {
  if (!href) return;
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  parent.appendChild(link);
}

function loadCandidateDetails(details: HTMLDetailsElement, content: HTMLElement, record: CatalogRecord): void {
  if (details.dataset.loaded === "true" || details.dataset.loading === "true") return;
  details.dataset.loading = "true";
  const loading = document.createElement("p");
  loading.textContent = "Loading source-linked candidate details…";
  content.replaceChildren(loading);

  void loadShard(record.detailsFile).then((shard) => {
    const detailRecord = shard.records.find((entry) => entry.variantId === record.variantId);
    if (!detailRecord) throw new Error("Source record not found in its declared shard");
    const list = document.createElement("ol");
    for (const word of detailRecord.words) {
      const alignment = word.alignment;
      if (!alignment) continue;
      const row = document.createElement("li");
      const locator = document.createElement("span");
      locator.textContent = `Variant word ${word.sourceLocator ?? "No locator supplied"}`;
      const candidate = document.createElement("span");
      candidate.className = "qv-record__candidate-state";
      candidate.textContent = "Candidate · not reviewed";
      const method = document.createElement("span");
      method.className = "qv-record__candidate-method";
      method.textContent = `Candidate rule: ${alignment.method}`;
      const target = document.createElement("pre");
      target.className = "qv-record__arabic";
      target.dir = "rtl";
      target.lang = "ar";
      target.textContent = alignment.targetExactText;
      row.appendChild(locator);
      row.appendChild(candidate);
      row.appendChild(method);
      row.appendChild(target);

      const passage = shard.passages[alignment.targetVerseId];
      if (passage?.exactText) {
        const contextLabel = document.createElement("span");
        contextLabel.className = "qv-record__context-label";
        contextLabel.textContent = "Cairo 1924 Arabic text · verse context";
        const context = document.createElement("pre");
        context.className = "qv-record__arabic";
        context.dir = "rtl";
        context.lang = "ar";
        context.textContent = passage.exactText;
        row.appendChild(contextLabel);
        row.appendChild(context);
        appendExternalLink(row, passage.sourceUrl, "Open Cairo verse record ↗");
      }

      const passageLink = document.createElement("a");
      const passageParams = new URLSearchParams({
        verse: alignment.targetVerseId,
        reader: record.readerNativeKey ?? MISSING_READER_KEY,
      });
      passageLink.href = `/projects/quran/read/?${passageParams.toString()}`;
      passageLink.textContent = `Open passage ${alignment.targetVerseId.replace("verse-", "")} in Read & Compare`;
      row.appendChild(passageLink);
      appendExternalLink(row, alignment.targetSourceUrl, "Open Cairo TEI token source line ↗");
      list.appendChild(row);
    }
    const note = document.createElement("p");
    note.textContent = "These links follow matching TEI locator formats; they do not establish that the readings are equivalent.";
    content.replaceChildren(list, note);
    details.dataset.loaded = "true";
    delete details.dataset.loading;
  }).catch(() => {
    const error = document.createElement("p");
    error.textContent = "Candidate details could not be loaded. The source record link above remains available.";
    content.replaceChildren(error);
    delete details.dataset.loading;
    shardCache.delete(record.detailsFile);
  });
}

function makeRecord(record: CatalogRecord): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qv-record";
  item.id = record.variantId;

  const head = document.createElement("header");
  head.className = "qv-record__head";
  const identity = document.createElement("div");
  const native = document.createElement("p");
  native.className = "qv-record__native";
  native.appendChild(document.createTextNode("TEI record "));
  const id = document.createElement("code");
  id.textContent = record.variantId;
  native.appendChild(id);
  const reader = document.createElement("pre");
  reader.className = "qv-record__reader";
  reader.textContent = record.readerReferences.length
    ? `${record.readerReferences[0].exactLabel}${record.readerReferences.length > 1 ? ` · ${record.readerReferences.length} TEI-listed labels` : ""}`
    : "No TEI-listed label in this record";
  identity.appendChild(native);
  identity.appendChild(reader);

  const source = document.createElement("a");
  source.className = "qv-record__source";
  source.href = record.sourceRecord.url;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = `Open source line ${record.sourceRecord.line} ↗`;
  head.appendChild(identity);
  head.appendChild(source);
  item.appendChild(head);

  if (record.readerReferences.length) {
    const readerDetails = document.createElement("details");
    readerDetails.className = "qv-record__reader-references";
    const readerSummary = document.createElement("summary");
    readerSummary.textContent = `Inspect ${record.readerReferences.length.toLocaleString()} TEI-listed label${record.readerReferences.length === 1 ? "" : "s"} and source keys`;
    const readerList = document.createElement("ol");
    for (const reference of record.readerReferences) {
      const entry = document.createElement("li");
      const exact = document.createElement("pre");
      exact.textContent = reference.exactLabel;
      entry.appendChild(exact);
      const key = document.createElement("code");
      key.textContent = reference.nativeKey ?? "key not supplied";
      entry.appendChild(key);
      appendExternalLink(entry, reference.sourceRecord.url, `Open this persName source line ${reference.sourceRecord.line} ↗`);
      if (reference.readerAuthority) {
        appendExternalLink(entry, reference.readerAuthority.sourceUrl,
          `Open linked authority ${reference.readerAuthority.exactLabel || reference.readerAuthority.nativeKey} ↗`);
      }
      readerList.appendChild(entry);
    }
    readerDetails.appendChild(readerSummary);
    readerDetails.appendChild(readerList);
    item.appendChild(readerDetails);
  }

  const label = document.createElement("p");
  label.className = "qv-record__label";
  label.textContent = "Variant text as stored in the TEI record";
  const text = document.createElement("pre");
  text.className = "qv-record__text";
  text.dir = "ltr";
  text.textContent = record.exactSourceText;
  const citation = document.createElement("p");
  citation.className = "qv-record__missing";
  citation.textContent = record.citationState === "source-key-missing"
    ? "The TEI record has no linked source authority key."
    : "A source-authority key is present, but its cited work has not been reviewed.";
  item.appendChild(label);
  item.appendChild(text);
  item.appendChild(citation);

  if (record.candidateCount > 0) {
    const details = document.createElement("details");
    details.className = "qv-record__alignments";
    const summary = document.createElement("summary");
    summary.textContent = `Inspect ${record.candidateCount.toLocaleString()} unreviewed Cairo locator candidate${record.candidateCount === 1 ? "" : "s"}`;
    const content = document.createElement("div");
    content.className = "qv-record__detail-content";
    details.appendChild(summary);
    details.appendChild(content);
    details.addEventListener("toggle", () => {
      if (details.open) loadCandidateDetails(details, content, record);
    });
    item.appendChild(details);
  }
  return item;
}

function render(reset: boolean): void {
  if (!queryInput || !readerSelect || !results || !searchStatus || !more) return;
  let fragment = "";
  if (reset) {
    const query = queryInput.value.toLowerCase();
    const reader = readerSelect.value;
    filteredRecords = allRecords.filter((record) => {
      const searchable = [record.variantId, record.readerNativeKey ?? "", record.readerExactLabel ?? "",
        ...record.readerReferences.flatMap((reference) => [reference.nativeKey ?? "", reference.exactLabel]),
        record.sourceNativeKey ?? "", record.exactSourceText];
      const matchesQuery = !query || searchable.some((value) => value.toLowerCase().includes(query));
      const matchesReader = !reader || (reader === MISSING_READER_KEY
        ? record.readerReferences.length === 0
        : record.readerReferences.some((reference) => reference.nativeKey === reader));
      return matchesQuery && matchesReader;
    });
    try {
      fragment = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      fragment = window.location.hash.slice(1);
    }
    const linkedIndex = filteredRecords.findIndex((record) => record.variantId === fragment);
    if (linkedIndex > 0) filteredRecords.unshift(filteredRecords.splice(linkedIndex, 1)[0]);
    shown = 0;
    results.replaceChildren();
  }

  for (const record of filteredRecords.slice(shown, shown + PAGE_SIZE)) {
    results.appendChild(makeRecord(record));
  }
  shown += Math.min(PAGE_SIZE, filteredRecords.length - shown);
  more.hidden = shown >= filteredRecords.length;
  searchStatus.textContent = `${filteredRecords.length.toLocaleString()} of ${allRecords.length.toLocaleString()} source records match. Showing ${shown.toLocaleString()}. Source text stays unchanged; search folds case for matching.`;

  const url = new URL(window.location.href);
  if (queryInput.value) url.searchParams.set("q", queryInput.value);
  else url.searchParams.delete("q");
  if (readerSelect.value) url.searchParams.set("reader", readerSelect.value);
  else url.searchParams.delete("reader");
  window.history.replaceState({}, "", url);

  if (!initialFragmentHandled && window.location.hash) {
    initialFragmentHandled = true;
    requestAnimationFrame(() => {
      const target = document.getElementById(fragment || window.location.hash.slice(1));
      if (target) {
        target.tabIndex = -1;
        target.scrollIntoView({ block: "start" });
        target.focus({ preventScroll: true });
      }
    });
  }
}

async function loadCompleteCatalog(): Promise<void> {
  if (!form || !queryInput || !readerSelect || !submit || !results || !searchStatus || !more) return;
  if (allRecords.length) return;
  if (!catalogPromise) {
    searchStatus.textContent = "Loading the complete 18,000-record search catalog…";
    catalogPromise = fetch(CATALOG_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Complete catalog unavailable");
        return response.json() as Promise<VariantCatalog>;
      })
      .then(async (catalog) => {
        if (catalog.records.length !== catalog.recordCount) throw new Error("Catalog record total mismatch");
        const indexes = await Promise.all(catalog.readerIndexFiles.map(async ({ path }) => {
          const response = await fetch(new URL(path, RELEASE_URL));
          if (!response.ok) throw new Error("TEI-listed label index unavailable");
          return response.json() as Promise<ReaderIndex>;
        }));
        const references = new Map<string, CatalogRecord["readerReferences"]>();
        for (const index of indexes) for (const record of index.records) references.set(record.variantId, record.references);
        allRecords = catalog.records.map((record) => ({
          ...record,
          readerReferences: references.get(record.variantId) ?? [],
        }));
        const keys = [...new Set(allRecords.flatMap((record) => record.readerReferences
          .map((reference) => reference.nativeKey).filter((key): key is string => Boolean(key))))].sort();
        if (allRecords.some((record) => record.readerReferences.length === 0)) {
          const missing = document.createElement("option");
          missing.value = MISSING_READER_KEY;
          missing.textContent = "Reader key not supplied";
          readerSelect.appendChild(missing);
        }
        for (const key of keys) {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = key;
          readerSelect.appendChild(option);
        }
        const params = new URLSearchParams(window.location.search);
        readerSelect.value = params.get("reader") ?? "";
        more.disabled = false;
        render(true);
      })
      .catch((error: unknown) => {
        catalogPromise = null;
        searchStatus.textContent = "The complete catalog could not be loaded. The 12 source-linked preview records and full catalog download remain available.";
        throw error;
      });
  }
  await catalogPromise;
}

if (form && queryInput && readerSelect && submit && results && searchStatus && more) {
  const params = new URLSearchParams(window.location.search);
  queryInput.value = params.get("q") ?? "";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void loadCompleteCatalog().catch(() => {});
  });
  readerSelect.addEventListener("change", () => {
    if (allRecords.length) render(true);
  });
  more.addEventListener("click", () => render(false));
  if (params.has("q") || params.has("reader") || window.location.hash) {
    void loadCompleteCatalog().catch(() => {});
  }
}
