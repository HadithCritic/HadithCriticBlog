/* Behavior for the history reading editions (styles in history-reader.css):
   text size, contents sidebar and drawer, note popovers, the translation notes
   panel, and the place marker. The color theme is the site's own. */
const R = document.documentElement;
const body = document.body;
const book = document.querySelector(".bk");

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const el = (tag, cls, text) => {
  const x = document.createElement(tag);
  if (cls) x.className = cls;
  if (text != null) x.textContent = text;
  return x;
};
const store = (k, v) => {
  try {
    if (v != null) localStorage.setItem(k, v);
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const narrow = () => matchMedia("(max-width: 999px)").matches;

if (book) init();

function init() {
  // ---------- text size ----------
  const FS_KEY = "hc-history-reader-fs";
  let fs = Number(store(FS_KEY)) || 0;
  const applySize = () => {
    if (fs) book.style.setProperty("--fs", fs + "px");
    else book.style.removeProperty("--fs");
  };
  const baseSize = () => parseFloat(getComputedStyle(book).getPropertyValue("--fs")) || 20;
  applySize();
  $("#sm").onclick = () => { fs = Math.max(15, (fs || baseSize()) - 1); store(FS_KEY, fs); applySize(); };
  $("#lg").onclick = () => { fs = Math.min(27, (fs || baseSize()) + 1); store(FS_KEY, fs); applySize(); };

  // ---------- contents sidebar ----------
  const side = $(".side", book);
  const toc = $(".toc", side);
  const navbtn = $("#navbtn");
  const pop = $("#pop");
  const scrim = el("div", "bk-scrim");
  book.appendChild(scrim);
  const setNav = (on) => {
    body.classList.toggle("bk-nav-open", on);
    navbtn.setAttribute("aria-expanded", on ? "true" : "false");
  };
  navbtn.onclick = (e) => { e.stopPropagation(); pop.hidden = true; setNav(!body.classList.contains("bk-nav-open")); };
  scrim.onclick = () => setNav(false);

  // Link text in its own span (so honorific symbols do not break the row), and years set as a number plus their subject.
  $$("a", toc).forEach((a) => {
    const t = el("span", "t");
    [...a.childNodes].filter((n) => !(n.classList && (n.classList.contains("cn") || n.classList.contains("min")))).forEach((n) => t.appendChild(n));
    const first = t.firstChild;
    const m = first && first.nodeType === 3 && first.textContent.match(/^The Year (\d+): */);
    if (m) {
      first.textContent = first.textContent.slice(m[0].length);
      a.appendChild(el("span", "yn", m[1]));
    }
    a.appendChild(t);
    const cn = $(".cn", a);
    if (cn) a.prepend(cn);
  });

  const head = $(".side-head", side);
  const meter = el("div", "side-meter");
  const meterRow = el("div", "side-meter-row");
  const meterPct = el("span", "", "0%");
  meterRow.append(el("span", "", "Read"), meterPct);
  const track = el("div", "side-meter-track");
  const fill = el("div", "side-meter-fill");
  track.appendChild(fill);
  meter.append(meterRow, track);
  if (head) head.appendChild(meter);
  const close = el("button", "side-close");
  close.type = "button";
  close.setAttribute("aria-label", "Close the contents");
  close.onclick = () => { setNav(false); navbtn.focus(); };
  if (head) head.prepend(close);

  const find = el("div", "side-find");
  const input = el("input");
  input.type = "search";
  input.placeholder = "Find a chapter or name";
  input.setAttribute("aria-label", "Find in the contents");
  find.appendChild(input);
  const scroller = el("nav", "side-scroll");
  scroller.setAttribute("aria-label", "Chapters");
  const empty = el("p", "side-empty", "Nothing in the contents matches.");
  empty.hidden = true;
  toc.before(find);
  toc.before(scroller);
  scroller.append(toc, empty);
  const foot = el("div", "side-foot");
  const back = el("a", "", "All histories");
  back.href = "/projects/history/";
  const count = $$(":scope > li > a", toc).filter((a) => document.getElementById(a.hash.slice(1))?.classList.contains("chapter")).length;
  foot.append(back, el("span", "", count + (count === 1 ? " chapter" : " chapters")));
  side.appendChild(foot);
  side.classList.add("is-enhanced");

  // Groups with subsections fold away; the one being read opens by itself. Short contents stay open.
  const allLinks = $$("a", toc);
  const groups = $$(":scope > li", toc).filter((li) => $(":scope > ul", li));
  const foldAll = allLinks.length > 30;
  groups.forEach((li) => {
    const label = $(":scope > a .t", li)?.textContent.trim() || "this chapter";
    const tw = el("button", "twist");
    tw.type = "button";
    const n = $$(":scope > ul > li", li).length;
    li.insertBefore(el("span", "twist-n", String(n)), $(":scope > ul", li));
    const sync = () => {
      const open = !li.classList.contains("is-closed");
      tw.setAttribute("aria-expanded", open ? "true" : "false");
      tw.setAttribute("aria-label", (open ? "Hide" : "Show") + " the " + n + " sections in " + label);
    };
    tw.onclick = (e) => { e.stopPropagation(); li.classList.toggle("is-closed"); li.dataset.user = "1"; sync(); };
    li.insertBefore(tw, $(":scope > ul", li));
    if (foldAll) li.classList.add("is-closed");
    li._sync = sync;
    sync();
  });

  // Filter: matches ignore diacritics and the ʿayn and hamza marks, so "abd allah" finds ʿAbd Allāh.
  const fold = (s) => s.normalize("NFD").replace(/[̀-ͯʿʾʼ’']/g, "").toLowerCase();
  const items = $$("li", toc).map((li) => ({ li, hay: fold($(":scope > a", li)?.textContent || "") }));
  input.addEventListener("input", () => {
    const q = fold(input.value.trim());
    side.classList.toggle("is-filtering", !!q);
    let shown = 0;
    items.forEach((it) => {
      const hit = !q || it.hay.includes(q);
      const kid = q && $$("li", it.li).some((c) => fold(c.textContent).includes(q));
      it.li.hidden = !(hit || kid);
      if (hit && q) shown++;
    });
    empty.hidden = !q || shown > 0;
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = $$("a", toc).find((a) => !a.closest("li[hidden]"));
      if (first) first.click();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".side a") && narrow()) setNav(false);
  });

  // ---------- footnote popovers ----------
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".note-ref a");
    if (!a) { if (!e.target.closest("#pop")) pop.hidden = true; return; }
    e.preventDefault();
    const n = document.getElementById(a.hash.slice(1));
    if (!n) return;
    const b = $(".nb", n).cloneNode(true);
    $$(".note-back", b).forEach((x) => x.remove());
    pop.replaceChildren();
    const label = el("strong", "", "Note " + a.textContent);
    const textNode = el("div", "pop-body");
    textNode.append(...b.childNodes);
    const go = el("a", "go", "Go to note");
    go.href = a.hash;
    pop.append(label, textNode, go);
    pop.hidden = false;
    const r = a.getBoundingClientRect();
    pop.style.top = scrollY + r.bottom + 10 + "px";
    pop.style.left = scrollX + Math.max(8, Math.min(r.left - 40, innerWidth - pop.offsetWidth - 8)) + "px";
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { pop.hidden = true; setNav(false); }
  });

  // First paragraph of each chapter opens with a drop cap.
  $$(".chapter", book).forEach((ch) => {
    const p = $$(":scope > *", ch).find((x) => x.tagName !== "HEADER" && !x.matches(".basmala, .isnad, .pa"));
    if (p && p.matches("p:not([class])") && p.textContent.trim().length > 160) p.classList.add("lead");
  });

  // ---------- translation notes panel (Khalifa): "This section" shows the notes of the year being read ----------
  const place = { part: "", year: "" };
  const panel = $("#notes-panel");
  let mode = "here";
  function showNotes() {
    if (!panel) return;
    let shown = 0;
    $$(".tn", panel).forEach((n) => {
      const hit = mode === "all" || (place.year ? n.dataset.year === place.year : !n.dataset.year && n.dataset.part === place.part);
      n.hidden = !hit;
      if (hit) shown++;
    });
    $(".np-empty", panel).hidden = shown !== 0;
  }
  if (panel) {
    const btn = el("button", "", "Notes");
    btn.id = "notesbtn";
    btn.type = "button";
    btn.setAttribute("aria-controls", "notes-panel");
    btn.setAttribute("aria-expanded", "false");
    $("#sm").before(btn);
    const toggle = (on) => { body.classList.toggle("bk-notes-open", on); btn.setAttribute("aria-expanded", on ? "true" : "false"); };
    btn.onclick = (e) => { e.stopPropagation(); toggle(!body.classList.contains("bk-notes-open")); setNav(false); };
    $$(".np-tabs button", panel).forEach((b) => b.addEventListener("click", () => {
      mode = b.dataset.mode;
      $$(".np-tabs button", panel).forEach((x) => x.setAttribute("aria-selected", x === b ? "true" : "false"));
      showNotes();
    }));
    document.addEventListener("click", (e) => { if (!e.target.closest("#notes-panel") && !e.target.closest("#notesbtn")) toggle(false); });
    panel.addEventListener("click", (e) => { if (e.target.closest(".tn-go") && narrow()) toggle(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
    showNotes();
  }

  // ---------- where the reader is: contents mark, bar label, progress ----------
  const here = $("#here");
  const bar = $("#bar");
  const subbar = $(".subbar", book);
  const text = $(".bk-text", book);
  const byHash = new Map(allLinks.map((a) => [a.getAttribute("href"), a]));
  const spies = $$("[data-spy]", book);
  const textOf = (x) => (x ? x.textContent.replace(/\s+/g, " ").trim() : "");
  const label = (x) => {
    const ch = x.closest(".chapter");
    if (x.classList.contains("part")) return [textOf($(".part-label", x)) || "Part", textOf($("h2", x))];
    if (x.classList.contains("chapter")) {
      const num = $(":scope > header .num", x);
      const yr = $(":scope > header .yr", x);
      return [num ? textOf(num) : yr ? "Year " + textOf(yr) : textOf($(":scope > header .kicker", x)), textOf($(":scope > header h2", x))];
    }
    if (x.classList.contains("year")) return [textOf($(".year-n", x)), textOf($(":scope > header h2", ch))];
    if (x.matches("h3, h4")) return [textOf($(":scope > header h2", ch)), textOf(x)];
    if (x.classList.contains("notes")) return ["", "Notes"];
    if (x.id === "edition-note") return ["", "About this edition"];
    return null;
  };
  const line = () => subbar.getBoundingClientRect().bottom + innerHeight * 0.18;
  function locate() {
    let lo = 0, hi = spies.length - 1, best = -1;
    const y = line();
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (spies[mid].getBoundingClientRect().top <= y) { best = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return best;
  }
  let lastIdx = -2, lastLink = null;
  function mark() {
    // Progress through the book's text, not the whole page with its cover and footer.
    const box = text.getBoundingClientRect();
    const span = box.height - innerHeight * 0.6;
    const pct = span > 0 ? Math.min(100, Math.max(0, ((line() - box.top) / span) * 100)) : 0;
    bar.style.width = pct + "%";
    fill.style.width = pct + "%";
    meterPct.textContent = Math.round(pct) + "%";
    subbar.classList.toggle("is-reading", box.top < line());

    const idx = locate();
    if (idx === lastIdx) return;
    lastIdx = idx;
    const cur = spies[idx];
    // The nearest heading that the contents lists.
    let link = null;
    for (let i = idx; i >= 0 && !link; i--) link = byHash.get("#" + spies[i].id) || null;
    if (link !== lastLink) {
      if (lastLink) lastLink.removeAttribute("aria-current");
      $$(".has-current", toc).forEach((x) => x.classList.remove("has-current"));
      lastLink = link;
      if (link) {
        link.setAttribute("aria-current", "true");
        const group = link.closest("ol.toc > li");
        if (group) {
          group.classList.add("has-current");
          groups.forEach((g) => {
            if (g === group && g.classList.contains("is-closed")) { g.classList.remove("is-closed"); g._sync(); }
            else if (g !== group && !g.dataset.user && foldAll && !g.classList.contains("is-closed")) { g.classList.add("is-closed"); g._sync(); }
          });
        }
        if (!body.classList.contains("bk-nav-open") || !narrow()) {
          const r = link.getBoundingClientRect();
          const sr = scroller.getBoundingClientRect();
          if (r.top < sr.top + 30 || r.bottom > sr.bottom - 30) scroller.scrollTop += r.top - sr.top - sr.height / 3;
        }
      }
    }
    if (cur) {
      if (cur.classList.contains("chapter")) { place.part = cur.id; place.year = ""; }
      else if (cur.classList.contains("year")) { place.year = cur.id; place.part = cur.closest(".chapter")?.id || ""; }
      showNotes();
    }
    const t = cur ? label(cur) : null;
    here.replaceChildren();
    if (t) {
      if (t[0]) here.appendChild(el("b", "", t[0]));
      here.appendChild(el("span", "", t[1]));
    }
  }
  let queued = false;
  addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mark(); });
  }, { passive: true });
  addEventListener("resize", () => { lastIdx = -2; mark(); });
  R.classList.add("has-book");
  mark();

  // A link into the book (#chapter-4) lands on its place once the text and fonts have settled.
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target && book.contains(target)) {
    const go = () => target.scrollIntoView({ block: "start" });
    go();
    document.fonts?.ready.then(go);
  }
}
