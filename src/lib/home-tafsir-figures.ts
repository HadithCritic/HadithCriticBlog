/* Behavior for the front page tafsir figures.

   Verse layers (VerseLayers.astro): hovering, focusing or pressing a
   commentary makes it current; its plate lifts and its passage shows. The
   choice stays until another is made, so it works the same by touch.

   Coverage grid (SurahCoverage.astro): hovering or focusing a cell lights its
   row and column and fills the readout with what each commentary has for
   that surah. The grid is one tab stop; the arrow keys, Home and End move
   between cells, Enter follows a cell's link and Escape clears the readout.

   Returns a cleanup that removes the listeners, so the page can run it again
   after a client-side navigation. */

type Cleanup = () => void;

function bindLayers(figure: HTMLElement, signal: AbortSignal): void {
  const keys = [...figure.querySelectorAll<HTMLButtonElement>("[data-layer]")];
  const plates = [...figure.querySelectorAll<HTMLElement>("[data-plate]")];
  const passages = [...figure.querySelectorAll<HTMLElement>("[data-passage]")];
  if (!keys.length) return;

  const select = (id: string) => {
    keys.forEach((key) => key.setAttribute("aria-pressed", String(key.dataset.layer === id)));
    plates.forEach((plate) => plate.classList.toggle("is-current", plate.dataset.plate === id));
    passages.forEach((passage) => passage.classList.toggle("is-current", passage.dataset.passage === id));
  };

  const listen = (element: HTMLElement, id: string) => {
    element.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && select(id), { signal });
  };
  for (const key of keys) {
    const id = key.dataset.layer ?? "";
    listen(key, id);
    key.addEventListener("click", () => select(id), { signal });
    key.addEventListener("focus", () => select(id), { signal });
  }
  plates.forEach((plate) => listen(plate.querySelector<HTMLElement>(".tlayers__face") ?? plate, plate.dataset.plate ?? ""));

  figure.classList.add("is-ready");
  select(keys[0].dataset.layer ?? "");
}

function bindCoverage(figure: HTMLElement, signal: AbortSignal): void {
  const rows = [...figure.querySelectorAll<HTMLElement>(".tcov__row")].map((row) => ({
    id: row.dataset.row ?? "",
    element: row,
    cells: [...row.querySelectorAll<HTMLElement>(".tcov__cell")],
  }));
  if (!rows.length) return;
  const title = figure.querySelector<HTMLElement>("[data-readout-title]");
  const readouts = new Map(
    [...figure.querySelectorAll<HTMLElement>("[data-readout]")].map((dd) => [dd.dataset.readout ?? "", dd]),
  );
  const defaults = {
    title: title?.textContent ?? "",
    notes: new Map([...readouts].map(([id, dd]) => [id, dd.textContent ?? ""])),
  };
  const all = rows.flatMap((row) => row.cells);
  let lit: HTMLElement[] = [];

  const show = (rowIndex: number, n: number) => {
    lit.forEach((cell) => cell.classList.remove("is-col", "is-cell"));
    lit = rows.map((row) => row.cells[n - 1]).filter(Boolean);
    lit.forEach((cell) => cell.classList.add("is-col"));
    rows[rowIndex]?.cells[n - 1]?.classList.add("is-cell");
    rows.forEach((row, index) => row.element.classList.toggle("is-active", index === rowIndex));
    figure.dataset.rowActive = rows[rowIndex]?.id ?? "";
    const name = (rows[0].cells[n - 1]?.getAttribute("aria-label") ?? "").split(":")[0];
    if (title) title.textContent = `Surah ${name.replace(/^(\d+)\. /, "$1, ")}`;
    for (const row of rows) {
      const dd = readouts.get(row.id);
      if (dd) dd.textContent = row.cells[n - 1]?.dataset.note ?? "";
    }
  };
  const reset = () => {
    lit.forEach((cell) => cell.classList.remove("is-col", "is-cell"));
    lit = [];
    rows.forEach((row) => row.element.classList.remove("is-active"));
    delete figure.dataset.rowActive;
    if (title) title.textContent = defaults.title;
    readouts.forEach((dd, id) => (dd.textContent = defaults.notes.get(id) ?? ""));
  };
  const place = (cell: HTMLElement) => [Number(cell.dataset.rowIndex), Number(cell.dataset.n)] as const;

  /* One tab stop: the cell last moved to. */
  let current = all[0];
  all.forEach((cell) => cell.setAttribute("tabindex", cell === current ? "0" : "-1"));
  const move = (cell: HTMLElement | undefined) => {
    if (!cell) return;
    current.setAttribute("tabindex", "-1");
    cell.setAttribute("tabindex", "0");
    current = cell;
    cell.focus();
  };

  for (const cell of all) {
    cell.addEventListener("pointerenter", () => show(...place(cell)), { signal });
    cell.addEventListener("focus", () => show(...place(cell)), { signal });
    cell.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          reset();
          return;
        }
        const [rowIndex, n] = place(cell);
        const at = (r: number, c: number) => rows[r]?.cells[c - 1];
        const next: Record<string, HTMLElement | undefined> = {
          ArrowRight: at(rowIndex, n + 1),
          ArrowLeft: at(rowIndex, n - 1),
          ArrowDown: at(rowIndex + 1, n),
          ArrowUp: at(rowIndex - 1, n),
          Home: at(rowIndex, 1),
          End: at(rowIndex, rows[rowIndex].cells.length),
        };
        if (!(event.key in next)) return;
        event.preventDefault();
        move(next[event.key]);
      },
      { signal },
    );
  }
  figure.querySelector(".tcov__rows")?.addEventListener(
    "pointerleave",
    () => {
      if (!all.includes(document.activeElement as HTMLElement)) reset();
    },
    { signal },
  );
  figure.addEventListener(
    "focusout",
    (event) => {
      if (!all.includes(event.relatedTarget as HTMLElement)) reset();
    },
    { signal },
  );
}

export function initTafsirFigures(root: ParentNode = document): Cleanup {
  const controller = new AbortController();
  root.querySelectorAll<HTMLElement>("[data-verse-layers]").forEach((figure) => bindLayers(figure, controller.signal));
  root.querySelectorAll<HTMLElement>("[data-surah-coverage]").forEach((figure) => bindCoverage(figure, controller.signal));
  return () => controller.abort();
}
