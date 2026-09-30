export {};

type RelationshipType = "reported_reader_authority" | "candidate_cairo_word_locator" | "commentary_quran_reference" | "source_explicit_tei_reference" | "candidate_commentary_cairo_range_locator" | "source_bibliographic_key_reference";
type ReaderEdge = {
  variantId: string; variantSourceUrl: string; readerAuthorityKey: string; sourceKeyExact: string;
  readerLabelExact: string; readerReferenceOrdinal: number; readerReferenceSourceUrl: string;
};
type CandidateEdge = {
  variantId: string; variantSourceUrl: string; variantWordOrdinal: number; variantWordLocator: string | null;
  variantWordExactText: string; candidateMethod: string; cairoWordLocator: string | null;
  cairoWordExactText: string; cairoWordSourceUrl: string | null; passageNativeId: string;
};
type CommentaryEdge = {
  sourceLocator: string; sourceLine: number; sourceFileSha256: string; referenceExactText: string;
  referenceTypeExact: string; targetExact: string; sourceUrl: string;
};
type SourceReferenceEdge = {
  sourceLocator: string; sourceLine: number; sourceFileSha256: string; referenceNativeId: string | null;
  referenceTypeExact: string | null; referenceExactText: string; targetExact: string;
  attributesExact: Record<string, string>; sourceUrl: string;
  targetResolution?: { state: "exact_source_record"; method: string; nativeId: string; recordLocator: string;
    sourceFile: string; sourceLine: number; sourceFileSha256: string; sourceUrl: string };
};
type BibliographyKeyEdge = {
  sourceLocator: string; sourceLine: number; sourceFileSha256: string;
  citationNativeId: string | null; citationTypeExact: string | null; citationKeyExact: string;
  citationExactText: string; attributesExact: Record<string, string>; sourceUrl: string;
};
type CommentaryRangeCandidateEdge = {
  sourceLocator: string; sourceLine: number; sourceFileSha256: string; referenceExactText: string;
  referenceTypeExact: string; targetExact: string; attributesExact: Record<string, string>;
  candidateStartPassageNativeId: string; candidateEndPassageNativeId: string;
  candidateMethod: string; candidateStatus: "unreviewed"; sourceUrl: string;
};
type GraphEdge = ReaderEdge | CandidateEdge | CommentaryEdge | SourceReferenceEdge | CommentaryRangeCandidateEdge | BibliographyKeyEdge;
type GraphShard = { relationshipType: RelationshipType; state: "source_reported" | "candidate"; edges: GraphEdge[] };
type GraphManifest = {
  edgeCount: number;
  countsByType: Record<RelationshipType, number>;
  readerAuthorities: Array<{ nativeKey: string; exactLabel: string | null; sourceUrl: string }>;
  assets: Array<{ path: string; edgeCount: number }>;
};

const MANIFEST_URL = "/data/quran/releases/v0.5.26-cc-57cb2b7be321/research-graph-v5-manifest.json";
const PAGE_SIZE = 20;
const ZOTERO_ITEM_KEY_PREFIX = /^zotero-([A-Z0-9]{8})$/u;
const ZOTERO_ITEM_KEY_URL = "https://www.zotero.org/groups/corpuscoranicum_pub/items/itemKey/";
const form = document.querySelector<HTMLFormElement>("#qrg-form");
const typeSelect = document.querySelector("#qrg-type") as HTMLSelectElement | null;
const queryInput = document.querySelector<HTMLInputElement>("#qrg-query");
const status = document.querySelector<HTMLElement>("#qrg-status");
const results = document.querySelector<HTMLOListElement>("#qrg-results");
const more = document.querySelector<HTMLButtonElement>("#qrg-more");

const shardCache = new Map<string, Promise<GraphShard>>();
let manifest: GraphManifest | null = null;
let currentEdges: GraphEdge[] = [];
let visibleCount = 0;

function fetchShard(path: string): Promise<GraphShard> {
  let pending = shardCache.get(path);
  if (!pending) {
    const manifestUrl = new URL(MANIFEST_URL, window.location.origin);
    pending = fetch(new URL(path, manifestUrl))
      .then((response) => {
        if (!response.ok) throw new Error(`Relationship shard unavailable: ${path}`);
        return response.json() as Promise<GraphShard>;
      });
    shardCache.set(path, pending);
  }
  return pending;
}

function appendLink(parent: HTMLElement, href: string | null | undefined, label: string): void {
  if (!href) return;
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  parent.appendChild(link);
}

function makeReaderEdge(edge: ReaderEdge, authorities: Map<string, GraphManifest["readerAuthorities"][number]>): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qrg-entry";
  const head = document.createElement("header");
  const title = document.createElement("p");
  title.textContent = "TEI-listed label → linked authority record";
  const state = document.createElement("span");
  state.className = "qrg-state qrg-state--reported";
  state.textContent = "Source key";
  head.appendChild(title);
  head.appendChild(state);
  const body = document.createElement("p");
  const variantLink = document.createElement("a");
  variantLink.href = `/projects/quran/variants/?q=${encodeURIComponent(edge.variantId)}`;
  variantLink.textContent = edge.variantId;
  body.appendChild(document.createTextNode("Variant record "));
  body.appendChild(variantLink);
  body.appendChild(document.createTextNode(` · source key ${edge.sourceKeyExact} · authority key ${edge.readerAuthorityKey} · label ${edge.readerReferenceOrdinal}`));
  const authority = authorities.get(edge.readerAuthorityKey);
  const sourceLabel = document.createElement("p");
  sourceLabel.className = "qrg-exact";
  sourceLabel.textContent = edge.readerLabelExact;
  item.appendChild(head);
  item.appendChild(body);
  item.appendChild(sourceLabel);
  if (authority) {
    const label = document.createElement("p");
    label.className = "qrg-exact";
    label.textContent = authority.exactLabel ?? "Authority label not supplied";
    item.appendChild(label);
    const links = document.createElement("nav");
    links.setAttribute("aria-label", "Relationship sources");
    appendLink(links, edge.variantSourceUrl, "Open variant source record ↗");
    appendLink(links, edge.readerReferenceSourceUrl, "Open this TEI-listed label ↗");
    appendLink(links, authority.sourceUrl, "Open reader authority record ↗");
    item.appendChild(links);
  } else {
    const link = document.createElement("nav");
    link.setAttribute("aria-label", "Relationship source");
    appendLink(link, edge.variantSourceUrl, "Open variant source record ↗");
    appendLink(link, edge.readerReferenceSourceUrl, "Open this TEI-listed label ↗");
    item.appendChild(link);
  }
  return item;
}

function makeCandidateEdge(edge: CandidateEdge): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qrg-entry";
  const head = document.createElement("header");
  const title = document.createElement("p");
  title.textContent = "Variant word → Cairo token locator";
  const state = document.createElement("span");
  state.className = "qrg-state qrg-state--candidate";
  state.textContent = "Candidate · unreviewed";
  head.appendChild(title);
  head.appendChild(state);
  const identity = document.createElement("p");
  const variantLink = document.createElement("a");
  variantLink.href = `/projects/quran/variants/?q=${encodeURIComponent(edge.variantId)}`;
  variantLink.textContent = edge.variantId;
  identity.appendChild(document.createTextNode("Variant record "));
  identity.appendChild(variantLink);
  identity.appendChild(document.createTextNode(` · word ${edge.variantWordOrdinal} · locator ${edge.variantWordLocator ?? "not supplied"}`));
  const comparison = document.createElement("p");
  comparison.className = "qrg-words";
  const variantWord = document.createElement("bdi");
  variantWord.dir = "ltr";
  variantWord.textContent = edge.variantWordExactText;
  const cairoWord = document.createElement("bdi");
  cairoWord.dir = "rtl";
  cairoWord.lang = "ar";
  cairoWord.textContent = edge.cairoWordExactText;
  comparison.appendChild(variantWord);
  comparison.appendChild(document.createTextNode(" → "));
  comparison.appendChild(cairoWord);
  const links = document.createElement("nav");
  links.setAttribute("aria-label", "Candidate source links");
  appendLink(links, edge.variantSourceUrl, "Open variant source record ↗");
  appendLink(links, edge.cairoWordSourceUrl, "Open Cairo token source line ↗");
  const passage = document.createElement("a");
  passage.href = `/projects/quran/read/?verse=${encodeURIComponent(edge.passageNativeId)}`;
  passage.textContent = `Open passage ${edge.passageNativeId.replace("verse-", "")} in Read & Compare`;
  links.appendChild(passage);
  item.appendChild(head);
  item.appendChild(identity);
  item.appendChild(comparison);
  item.appendChild(links);
  return item;
}

function makeCommentaryEdge(edge: CommentaryEdge): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qrg-entry";
  const head = document.createElement("header");
  const title = document.createElement("p");
  title.textContent = "Commentary TEI reference → Quran-native target";
  const state = document.createElement("span");
  state.className = "qrg-state qrg-state--reported";
  state.textContent = "Source-reported reference";
  head.appendChild(title);
  head.appendChild(state);
  const citation = document.createElement("pre");
  citation.className = "qrg-exact qrg-exact--citation";
  citation.textContent = edge.referenceExactText;
  const target = document.createElement("p");
  target.textContent = `TEI reference type ${edge.referenceTypeExact} · target ${edge.targetExact}`;
  const locator = document.createElement("p");
  locator.className = "qrg-locator";
  locator.textContent = `${edge.sourceLocator} · source line ${edge.sourceLine}`;
  const links = document.createElement("nav");
  links.setAttribute("aria-label", "Commentary reference source");
  appendLink(links, edge.sourceUrl, "Open exact commentary TEI line ↗");
  item.appendChild(head);
  item.appendChild(locator);
  item.appendChild(citation);
  item.appendChild(target);
  item.appendChild(links);
  return item;
}

function makeSourceReferenceEdge(edge: SourceReferenceEdge): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qrg-entry";
  const head = document.createElement("header");
  const title = document.createElement("p");
  title.textContent = "Explicit TEI reference";
  const state = document.createElement("span");
  state.className = "qrg-state qrg-state--reported";
  state.textContent = "Source-reported reference";
  head.appendChild(title);
  head.appendChild(state);
  const locator = document.createElement("p");
  locator.className = "qrg-locator";
  locator.textContent = `${edge.sourceLocator} · source line ${edge.sourceLine}`;
  const exactText = document.createElement("pre");
  exactText.className = "qrg-exact qrg-exact--citation";
  exactText.textContent = edge.referenceExactText;
  const target = document.createElement("p");
  target.appendChild(document.createTextNode(`TEI type ${edge.referenceTypeExact ?? "not supplied"} · exact target `));
  const targetValue = document.createElement("code");
  targetValue.textContent = edge.targetExact;
  target.appendChild(targetValue);
  if (edge.targetResolution?.state === "exact_source_record") {
    target.appendChild(document.createTextNode(" · publisher-coded target"));
  }
  const attributes = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Exact reference attributes";
  const attributeValues = document.createElement("pre");
  attributeValues.className = "qrg-exact qrg-exact--citation";
  attributeValues.textContent = JSON.stringify(edge.attributesExact, null, 2);
  attributes.appendChild(summary);
  attributes.appendChild(attributeValues);
  const links = document.createElement("nav");
  links.setAttribute("aria-label", "Explicit reference sources");
  appendLink(links, edge.sourceUrl, "Open exact TEI source line ↗");
  if (edge.targetResolution?.state === "exact_source_record") {
    const intertextLink = document.createElement("a");
    intertextLink.href = `/projects/quran/intertexts/?record=${encodeURIComponent(edge.targetResolution.nativeId)}`;
    intertextLink.textContent = "Open source-linked intertext record ↗";
    links.appendChild(intertextLink);
  }
  if (!/\s/.test(edge.targetExact)) {
    try {
      const targetUrl = new URL(edge.targetExact);
      if (targetUrl.protocol === "http:" || targetUrl.protocol === "https:") {
        appendLink(links, edge.targetExact, "Open referenced target ↗");
      }
    } catch {
      // Keep non-URL target strings visible verbatim without interpreting them.
    }
  }
  item.appendChild(head);
  item.appendChild(locator);
  item.appendChild(exactText);
  item.appendChild(target);
  item.appendChild(attributes);
  item.appendChild(links);
  return item;
}

function makeBibliographyKeyEdge(edge: BibliographyKeyEdge): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qrg-entry";
  const head = document.createElement("header");
  const title = document.createElement("p");
  title.textContent = "TEI bibliographic citation key";
  const state = document.createElement("span");
  state.className = "qrg-state qrg-state--reported";
  state.textContent = "Source key · record unresolved";
  head.appendChild(title);
  head.appendChild(state);
  const key = document.createElement("p");
  key.appendChild(document.createTextNode("Exact TEI key "));
  const code = document.createElement("code");
  code.textContent = edge.citationKeyExact;
  key.appendChild(code);
  const citation = document.createElement("p");
  citation.className = "qrg-exact";
  citation.textContent = edge.citationExactText || "[empty citation text in source]";
  const locator = document.createElement("p");
  locator.className = "qrg-source-locator";
  locator.textContent = `${edge.sourceLocator} · line ${edge.sourceLine} · type ${edge.citationTypeExact ?? "not supplied"}`;
  const source = document.createElement("nav");
  source.setAttribute("aria-label", "Bibliographic citation source");
  appendLink(source, edge.sourceUrl, "Open exact TEI source line ↗");
  const itemKey = edge.citationTypeExact === "zotero"
    ? ZOTERO_ITEM_KEY_PREFIX.exec(edge.citationKeyExact)?.[1]
    : undefined;
  if (itemKey) {
    appendLink(source, `${ZOTERO_ITEM_KEY_URL}${itemKey}`, "Open Zotero item-key URL ↗");
    const locatorNote = document.createElement("p");
    locatorNote.textContent = "External locator formed from the exact TEI key using the pinned Corpus Coranicum website convention; target content is not verified here and the local bibliography record remains unresolved.";
    item.appendChild(head);
    item.appendChild(key);
    item.appendChild(citation);
    item.appendChild(locator);
    item.appendChild(locatorNote);
    item.appendChild(source);
    return item;
  }
  const unresolvedNote = document.createElement("p");
  unresolvedNote.textContent = edge.citationTypeExact === "zotero"
    ? "No external item link: this exact source key does not match the documented eight-character Zotero key form."
    : "No external item link: the source does not identify this key as a Zotero item key.";
  item.appendChild(head);
  item.appendChild(key);
  item.appendChild(citation);
  item.appendChild(locator);
  item.appendChild(unresolvedNote);
  item.appendChild(source);
  return item;
}

function makeCommentaryRangeCandidateEdge(edge: CommentaryRangeCandidateEdge): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "qrg-entry";
  const head = document.createElement("header");
  const title = document.createElement("p");
  title.textContent = "Commentary target → Cairo passage locator candidate";
  const state = document.createElement("span");
  state.className = "qrg-state qrg-state--candidate";
  state.textContent = "Unreviewed navigation candidate";
  head.appendChild(title);
  head.appendChild(state);
  const locator = document.createElement("p");
  locator.className = "qrg-locator";
  locator.textContent = `${edge.sourceLocator} · source line ${edge.sourceLine}`;
  const citation = document.createElement("pre");
  citation.className = "qrg-exact qrg-exact--citation";
  citation.textContent = edge.referenceExactText;
  const target = document.createElement("p");
  target.appendChild(document.createTextNode(`TEI type ${edge.referenceTypeExact} · exact target `));
  const targetValue = document.createElement("code");
  targetValue.textContent = edge.targetExact;
  target.appendChild(targetValue);
  const attributes = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Exact TEI reference attributes";
  const values = document.createElement("pre");
  values.className = "qrg-exact qrg-exact--citation";
  values.textContent = JSON.stringify(edge.attributesExact, null, 2);
  attributes.appendChild(summary);
  attributes.appendChild(values);
  const method = document.createElement("p");
  method.textContent = `Candidate rule: ${edge.candidateMethod}. This string-to-ID match has not been reviewed as a passage equivalence.`;
  const links = document.createElement("nav");
  links.setAttribute("aria-label", "Candidate Cairo passage links and source");
  const startUrl = `/projects/quran/read/?verse=${encodeURIComponent(edge.candidateStartPassageNativeId)}`;
  const endUrl = `/projects/quran/read/?verse=${encodeURIComponent(edge.candidateEndPassageNativeId)}`;
  const startLink = document.createElement("a");
  startLink.href = startUrl;
  startLink.textContent = edge.candidateStartPassageNativeId === edge.candidateEndPassageNativeId
    ? "Open candidate passage in Cairo reader →" : `Open candidate start ${edge.candidateStartPassageNativeId} →`;
  links.appendChild(startLink);
  if (edge.candidateStartPassageNativeId !== edge.candidateEndPassageNativeId) {
    const endLink = document.createElement("a");
    endLink.href = endUrl;
    endLink.textContent = `Open candidate end ${edge.candidateEndPassageNativeId} →`;
    links.appendChild(endLink);
  }
  appendLink(links, edge.sourceUrl, "Open exact commentary TEI line ↗");
  item.appendChild(head);
  item.appendChild(locator);
  item.appendChild(citation);
  item.appendChild(target);
  item.appendChild(attributes);
  item.appendChild(method);
  item.appendChild(links);
  return item;
}

function matchesQuery(edge: GraphEdge, query: string): boolean {
  if (!query) return true;
  return JSON.stringify(edge).toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

function render(reset: boolean): void {
  if (!manifest || !results || !status || !more || !queryInput || !typeSelect) return;
  const query = queryInput.value.trim();
  const matching = currentEdges.filter((edge) => matchesQuery(edge, query));
  if (reset) {
    visibleCount = 0;
    results.replaceChildren();
  }
  const authorityByKey = new Map(manifest.readerAuthorities.map((authority) => [authority.nativeKey, authority]));
  for (const edge of matching.slice(visibleCount, visibleCount + PAGE_SIZE)) {
    let element: HTMLLIElement;
    if ("variantId" in edge && "readerAuthorityKey" in edge) {
      element = makeReaderEdge(edge, authorityByKey);
    } else if ("variantId" in edge && "cairoWordLocator" in edge) {
      element = makeCandidateEdge(edge);
    } else if ("candidateStartPassageNativeId" in edge) {
      element = makeCommentaryRangeCandidateEdge(edge);
    } else if ("citationKeyExact" in edge) {
      element = makeBibliographyKeyEdge(edge);
    } else if ("attributesExact" in edge) {
      element = makeSourceReferenceEdge(edge);
    } else {
      element = makeCommentaryEdge(edge as CommentaryEdge);
    }
    results.appendChild(element);
  }
  visibleCount = Math.min(matching.length, visibleCount + PAGE_SIZE);
  more.hidden = visibleCount >= matching.length;
  status.textContent = `${matching.length.toLocaleString()} of ${currentEdges.length.toLocaleString()} ${typeSelect.selectedOptions[0]?.textContent ?? ""}: ${matching.length === 1 ? "record matches" : "records match"}. Showing ${visibleCount.toLocaleString()}. Search changes matching only; source strings are unchanged.`;
}

async function loadSelectedRelationships(selectedOverride?: string): Promise<void> {
  if (!manifest || !status || !typeSelect) return;
  const selected = (selectedOverride ?? typeSelect.value) as RelationshipType | "";
  if (!selected) {
    currentEdges = [];
    render(true);
    status.textContent = "Choose a relationship type to load its source-linked records.";
    return;
  }
  const shardMarkers: Record<RelationshipType, string> = {
    reported_reader_authority: "-readers-",
    candidate_cairo_word_locator: "-candidates-",
    commentary_quran_reference: "-commentary-",
    source_explicit_tei_reference: "-refs-",
    candidate_commentary_cairo_range_locator: "-commentary-ranges-",
    source_bibliographic_key_reference: "-bibliography-",
  };
  const assets = manifest.assets.filter((asset) => asset.path.includes(shardMarkers[selected]));
  status.textContent = `Loading ${manifest.countsByType[selected].toLocaleString()} source-linked relationships…`;
  try {
    const shards = await Promise.all(assets.map((asset) => fetchShard(asset.path)));
    if (shards.some((shard) => shard.relationshipType !== selected)) throw new Error("Relationship shard type mismatch");
    currentEdges = shards.flatMap((shard) => shard.edges);
    if (currentEdges.length !== manifest.countsByType[selected]) throw new Error("Relationship count mismatch");
    render(true);
  } catch (error) {
    console.error("Could not load Quran relationship shards", error);
    status.textContent = "These relationship records could not be loaded. Use the source links in the release manifest to inspect the data.";
  }
}

if (form && typeSelect && queryInput && status && results && more) {
  void fetch(MANIFEST_URL)
    .then((response) => { if (!response.ok) throw new Error("Graph manifest unavailable"); return response.json() as Promise<GraphManifest>; })
    .then((data) => {
      manifest = data;
      typeSelect.disabled = false;
      queryInput.disabled = false;
      form.querySelector<HTMLButtonElement>("button[type='submit']")!.disabled = false;
      more.disabled = false;
      const params = new URLSearchParams(window.location.search);
      queryInput.value = params.get("q") ?? "";
      typeSelect.value = params.get("type") ?? "";
      typeSelect.addEventListener("change", () => {
        const selected = typeSelect.options[typeSelect.selectedIndex]?.value ?? "";
        status.textContent = selected ? `Ready to load ${typeSelect.selectedOptions[0]?.textContent ?? "these relationships"}.` : "Choose a relationship type to load its source-linked records.";
      });
      if (typeSelect.value) void loadSelectedRelationships(typeSelect.options[typeSelect.selectedIndex]?.value ?? "");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const selected = String(new FormData(form).get("type") ?? "");
        typeSelect.value = selected;
        const url = new URL(window.location.href);
        if (queryInput.value) url.searchParams.set("q", queryInput.value);
        else url.searchParams.delete("q");
        if (selected) url.searchParams.set("type", selected);
        else url.searchParams.delete("type");
        window.history.replaceState({}, "", url);
        void loadSelectedRelationships(selected);
      });
      more.addEventListener("click", () => render(false));
    })
    .catch(() => { status.textContent = "The relationship manifest could not be loaded. Source-index links remain available below."; });
}
