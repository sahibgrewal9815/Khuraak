// =====================================================================
//  Khurak – app logic
// =====================================================================
// NUTRIENTS, INGREDIENTS and DISHES come from foods.js
const KEYS = NUTRIENTS.map(n => n.key);
const STORE = "khurak-v1";
const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];

// Daily targets (ICMR-NIN 2020 RDAs for adults; sodium is an upper limit)
const MICRO_TARGETS = {
  male:   { ca: 1000, fe: 19, zn: 17,   mg: 440, k: 3510, na: 2000, vitA: 1000, vitC: 80, folate: 300, b12: 2.5 },
  female: { ca: 1000, fe: 29, zn: 13.2, mg: 370, k: 3510, na: 2000, vitA: 840,  vitC: 65, folate: 220, b12: 2.5 }
};
const LIMITS = new Set(["na"]); // shown red when over

// ---------------- storage ----------------
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE));
    if (d && d.log) return d;
  } catch (e) {}
  return { log: {}, settings: { sex: "male", kcal: 2100, protein: 60 }, favs: [], recents: [] };
}
let data = load();
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(data)); }
  catch (e) { toast("Couldn't save. Phone storage may be full."); }
}

// ---------------- helpers ----------------
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const r0 = x => Math.round(x);
const r1 = x => Math.round(x * 10) / 10;
const fmt = (x, unit) => (unit === "kcal" || x >= 100 ? r0(x) : r1(x)) + (unit === "kcal" ? "" : " " + unit);

function dateKey(d) {
  const z = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function shiftDate(key, days) {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}
function dateLabel(key) {
  const today = dateKey(new Date());
  if (key === today) return "Today";
  if (key === shiftDate(today, -1)) return "Yesterday";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
function defaultMeal() {
  const h = new Date().getHours();
  return h < 11 ? "Breakfast" : h < 16 ? "Lunch" : h < 19 ? "Snacks" : "Dinner";
}

function targets() {
  const s = data.settings;
  const kcal = +s.kcal || 2100;
  return {
    kcal, protein: +s.protein || 60,
    carbs: (kcal * 0.55) / 4, fat: (kcal * 0.30) / 9, fiber: 30,
    ...MICRO_TARGETS[s.sex === "female" ? "female" : "male"]
  };
}

// ---------------- nutrition math ----------------
function zero() { const o = {}; KEYS.forEach(k => (o[k] = 0)); return o; }
function addInto(t, n, m = 1) { KEYS.forEach(k => (t[k] += (n[k] || 0) * m)); return t; }
function fromGrams(items) {
  const t = zero();
  for (const [ing, g] of Object.entries(items)) {
    const v = INGREDIENTS[ing] && INGREDIENTS[ing].v;
    if (!v) continue;
    KEYS.forEach((k, i) => (t[k] += (v[i] * g) / 100));
  }
  return t;
}
// Returns grams of each ingredient for ONE unit with the chosen options
function dishGrams(dish, sel) {
  const m = (dish.sizes[sel.size] ?? 1) * ((sel.adjust || 100) / 100);
  const g = {};
  const put = (items) => { for (const [k, v] of Object.entries(items)) g[k] = (g[k] || 0) + v * m; };
  put(dish.base);
  if (dish.extra) {
    const opt = dish.extra.options.find(o => o.name === sel.extra) || dish.extra.options[0];
    put(opt.items);
  }
  return g;
}
function compute(kind, food, sel) {
  if (kind === "manual") return { ...zero(), ...sel.n };
  if (kind === "ing") {
    const grams = sel.unit === "grams" ? +sel.grams || 0 : (+sel.unitG || 0) * (+sel.qty || 0);
    return fromGrams({ [food]: grams });
  }
  const dish = DISHES.find(d => d.id === food);
  const t = fromGrams(dishGrams(dish, sel));
  KEYS.forEach(k => (t[k] *= +sel.qty || 0));
  return t;
}
function describe(kind, food, sel) {
  if (kind === "manual") return "Entered manually";
  if (kind === "ing") {
    return sel.unit === "grams" ? `${r0(sel.grams)} g` : `${sel.qty} × ${sel.unit}`;
  }
  const dish = DISHES.find(d => d.id === food);
  const parts = [`${sel.qty} × ${sel.size}`];
  if (dish.extra) parts.push(sel.extra);
  if (sel.adjust && sel.adjust !== 100) parts.push(`${sel.adjust}% size`);
  return parts.join(", ");
}
function foodName(kind, food) {
  if (kind === "dish") return DISHES.find(d => d.id === food).name;
  if (kind === "ing") return INGREDIENTS[food].name;
  return food;
}

// ---------------- state ----------------
let tab = "today";
let day = dateKey(new Date());
let cat = "All";
let query = "";

// ---------------- rendering ----------------
function render() {
  document.querySelectorAll("nav.tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  $("#datenav").style.visibility = tab === "settings" || tab === "history" ? "hidden" : "visible";
  $("#dateLabel").textContent = dateLabel(day);
  $("#nextDay").disabled = day >= dateKey(new Date());
  $("#nextDay").style.opacity = $("#nextDay").disabled ? 0.35 : 1;
  const v = $("#view");
  if (tab === "today") v.innerHTML = viewToday();
  else if (tab === "add") { v.innerHTML = viewAdd(); bindAdd(); }
  else if (tab === "history") v.innerHTML = viewHistory();
  else { v.innerHTML = viewSettings(); bindSettings(); }
}

function dayTotals(key) {
  const t = zero();
  (data.log[key] || []).forEach(e => addInto(t, e.n));
  return t;
}

function thali(t, T) {
  const R = 72, C = 2 * Math.PI * R;
  const pk = t.protein * 4, ck = t.carbs * 4, fk = t.fat * 9;
  const macroK = pk + ck + fk || 1;
  const filled = Math.min(t.kcal / T.kcal, 1) * C;
  let offset = 0;
  const arc = (val, color) => {
    const len = (val / macroK) * filled;
    const s = `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${color}" stroke-width="18"
      stroke-dasharray="${len} ${C}" stroke-dashoffset="${-offset}" transform="rotate(-90 100 100)"/>`;
    offset += len;
    return s;
  };
  const over = t.kcal - T.kcal;
  return `
  <div class="thali">
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="97" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 4"/>
      <circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--chip)" stroke-width="18"/>
      ${t.kcal > 0 ? arc(pk, "var(--protein)") + arc(ck, "var(--carbs)") + arc(fk, "var(--fat)") : ""}
    </svg>
    <div class="center">
      <div class="kcal">${r0(t.kcal)}</div>
      <div class="of">of ${r0(T.kcal)} kcal</div>
      ${over > 0 ? `<div class="small" style="color:var(--phulkari);font-weight:700">${r0(over)} over</div>` : ""}
    </div>
  </div>
  <div class="legend">
    <span><i style="background:var(--protein)"></i>Protein</span>
    <span><i style="background:var(--carbs)"></i>Carbs</span>
    <span><i style="background:var(--fat)"></i>Fat</span>
  </div>`;
}

function nutrientRows(t, T, keys, showTags) {
  return `<div class="rows">${keys.map(k => {
    const n = NUTRIENTS.find(x => x.key === k);
    const pct = T[k] ? (t[k] / T[k]) * 100 : 0;
    const limit = LIMITS.has(k);
    const over = limit && pct > 100;
    let tag = "";
    if (showTags) {
      if (limit && pct > 100) tag = `<span class="tag high">High</span>`;
      else if (!limit && !["kcal", "carbs", "fat"].includes(k) && pct < 70) tag = `<span class="tag low">Low</span>`;
    }
    return `<div class="row">
      <div class="top"><span>${n.name}${limit ? ' <span class="small muted">(limit)</span>' : ""}${tag}</span>
      <span class="val">${fmt(t[k], n.unit)} / ${fmt(T[k], n.unit)}${n.unit === "kcal" ? " kcal" : ""} · ${r0(pct)}%</span></div>
      <div class="bar ${over ? "over" : ""}"><div style="width:${Math.min(pct, 100)}%"></div></div>
    </div>`;
  }).join("")}</div>`;
}

function viewToday() {
  const T = targets();
  const entries = data.log[day] || [];
  const t = dayTotals(day);
  let html = thali(t, T);
  html += `<h2>Macros</h2>` + nutrientRows(t, T, ["protein", "carbs", "fat", "fiber"]);
  html += `<h2>Vitamins &amp; minerals</h2>` +
    nutrientRows(t, T, ["ca", "fe", "zn", "mg", "k", "vitA", "vitC", "folate", "b12", "na"]);
  html += `<h2>What you ate</h2>`;
  if (!entries.length) {
    html += `<div class="empty">Nothing logged for ${dateLabel(day).toLowerCase()} yet.<br>
      <button class="btn" onclick="go('add')">Add your first food</button></div>`;
  } else {
    MEALS.forEach(meal => {
      const es = entries.filter(e => e.meal === meal);
      if (!es.length) return;
      const mk = es.reduce((s, e) => s + e.n.kcal, 0);
      html += `<div class="meal"><h3>${meal}<span>${r0(mk)} kcal</span></h3>
        ${es.map(e => `<div class="entry">
          <div class="info" ${e.kind !== "manual" ? `onclick="editEntry('${e.id}')" role="button" tabindex="0"` : ""}>
            <div class="name">${esc(e.name)}</div>
            <div class="desc">${esc(e.desc)} · ${r1(e.n.protein)} g protein</div>
          </div>
          <div class="kc">${r0(e.n.kcal)}</div>
          <button aria-label="Delete ${esc(e.name)}" onclick="delEntry('${e.id}')">×</button>
        </div>`).join("")}</div>`;
    });
  }
  return html;
}

// ---------------- add screen ----------------
const CATS = ["All", "Breads", "Dal & sabzi", "Rice", "Non-veg", "Snacks", "Sweets", "Drinks", "Other cuisines", "Basic foods"];

function viewAdd() {
  let html = `<input class="search" id="q" type="search" placeholder="Search: paratha, dal, lassi…" value="${esc(query)}" autocomplete="off">
    <div class="chips" id="cats">${CATS.map(c => `<button class="chip ${c === cat ? "on" : ""}" data-cat="${c}">${c}</button>`).join("")}</div>`;
  html += `<div id="results">${resultsHtml()}</div>`;
  return html;
}

function resultsHtml() {
  const q = query.trim().toLowerCase();
  let html = "";
  if (!q && cat === "All") {
    if (data.favs.length) {
      html += `<h2>My foods</h2><div class="list">${data.favs.map((f, i) => `
        <button class="item" onclick="openFav(${i})"><span><b>${esc(f.label)}</b><div class="sub">${esc(f.desc)}</div></span><span class="plus">+</span></button>`).join("")}</div>`;
    }
    if (data.recents.length) {
      html += `<h2>Recent</h2><div class="list">${data.recents.map((f, i) => `
        <button class="item" onclick="openRecent(${i})"><span><b>${esc(f.name)}</b><div class="sub">${esc(f.desc)}</div></span><span class="plus">+</span></button>`).join("")}</div>`;
    }
    html += `<h2>All foods</h2>`;
  }
  const dishes = DISHES.filter(d => (cat === "All" || d.cat === cat) && (!q || d.name.toLowerCase().includes(q)));
  const ings = Object.entries(INGREDIENTS).filter(([id, g]) => id !== "salt" &&
    (cat === "All" || cat === "Basic foods") && (!q || g.name.toLowerCase().includes(q)) && (cat === "Basic foods" || q || g.units));
  html += `<div class="list">`;
  html += dishes.map(d => `<button class="item" onclick="openDish('${d.id}')"><span>${esc(d.name)}<div class="sub">${d.cat} · per ${d.unit}</div></span><span class="plus">+</span></button>`).join("");
  html += ings.map(([id, g]) => `<button class="item" onclick="openIng('${id}')"><span>${esc(g.name)}<div class="sub">Basic food · by weight</div></span><span class="plus">+</span></button>`).join("");
  html += `</div>`;
  if (!dishes.length && !ings.length) html += `<div class="empty">No match for “${esc(query)}”. Add it with its calories instead.</div>`;
  html += `<button class="btn ghost" style="width:100%;margin-top:10px" onclick="openManual()">Enter calories manually (packaged food, etc.)</button>`;
  return html;
}

function bindAdd() {
  $("#q").addEventListener("input", e => { query = e.target.value; $("#results").innerHTML = resultsHtml(); });
  $("#cats").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    cat = b.dataset.cat;
    $("#cats").querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.cat === cat));
    $("#results").innerHTML = resultsHtml();
  });
}

// ---------------- sheet (portion picker) ----------------
let ctx = null; // { kind, food, sel, editId }

function defaultDishSel(d) {
  const sizes = Object.keys(d.sizes);
  let size = sizes.find(s => d.sizes[s] === 1) || sizes[0];
  let extra = d.extra ? (d.extra.options.find(o => o.name === "Normal") || d.extra.options[0]).name : null;
  if (d.presets && d.presets.Home) [size, extra] = d.presets.Home;
  return { size, extra, qty: 1, adjust: 100, meal: defaultMeal() };
}

window.openDish = id => {
  const d = DISHES.find(x => x.id === id);
  ctx = { kind: "dish", food: id, sel: defaultDishSel(d) };
  openSheet();
};
window.openIng = id => {
  const g = INGREDIENTS[id];
  const u = g.units && g.units[0];
  ctx = { kind: "ing", food: id, sel: u ? { unit: u.name, unitG: u.g, qty: 1, grams: u.g, meal: defaultMeal() }
                                        : { unit: "grams", unitG: 1, qty: 1, grams: 100, meal: defaultMeal() } };
  openSheet();
};
window.openRecent = i => { const r = data.recents[i]; ctx = { kind: r.kind, food: r.food, sel: { ...r.sel, meal: defaultMeal() } }; openSheet(); };
window.openFav = i => { const r = data.favs[i]; ctx = { kind: r.kind, food: r.food, sel: { ...r.sel, meal: defaultMeal() }, favLabel: r.label }; openSheet(); };
window.editEntry = id => {
  const e = (data.log[day] || []).find(x => x.id === id); if (!e) return;
  ctx = { kind: e.kind, food: e.food, sel: { ...e.sel, meal: e.meal }, editId: id };
  openSheet();
};

function openSheet() { renderSheet(); $("#sheet").classList.add("open"); $("#scrim").classList.add("open"); }
function closeSheet() { $("#sheet").classList.remove("open"); $("#scrim").classList.remove("open"); ctx = null; }
$("#scrim").addEventListener("click", closeSheet);
document.addEventListener("keydown", e => { if (e.key === "Escape" && ctx) closeSheet(); });

function chipRow(name, options, current) {
  return `<div class="chips">${options.map(o =>
    `<button class="chip ${o === current ? "on" : ""}" data-set="${name}" data-val="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
}

function renderSheet() {
  if (!ctx) return;
  const { kind, food, sel } = ctx;
  let html = `<div class="grab"></div>`;

  if (kind === "manual") {
    html += `<h2>Enter manually</h2>
      <div class="rows">
        <div class="field"><span>Food name</span><input id="mName" style="width:170px;text-align:left" value="${esc(sel.name || "")}" placeholder="e.g. Biscuits"></div>
        ${["kcal", "protein", "carbs", "fat"].map(k => `<div class="field"><span>${NUTRIENTS.find(n => n.key === k).name} (${k === "kcal" ? "kcal" : "g"})</span><input type="number" inputmode="decimal" min="0" data-m="${k}" value="${sel.n[k] || ""}"></div>`).join("")}
      </div>
      <div class="label">Meal</div>${chipRow("meal", MEALS, sel.meal)}
      <div class="note">Copy the numbers from the packet for the amount you ate.</div>
      <div class="actions"><button class="btn ghost" onclick="closeSheet()">Cancel</button><button class="btn" id="addBtn">Add to log</button></div>`;
    $("#sheet").innerHTML = html;
    $("#sheet").querySelectorAll("[data-m]").forEach(inp => inp.addEventListener("input", () => (sel.n[inp.dataset.m] = +inp.value || 0)));
    $("#mName").addEventListener("input", e => (sel.name = e.target.value));
    bindSheet();
    return;
  }

  html += `<h2>${esc(ctx.favLabel || foodName(kind, food))}</h2>`;

  if (kind === "dish") {
    const d = DISHES.find(x => x.id === food);
    if (d.presets) {
      const names = { Home: "Home-made", Dhaba: "Dhaba / bought" };
      html += `<div class="chips">${Object.entries(d.presets).map(([k, [s, e]]) =>
        `<button class="chip ${sel.size === s && sel.extra === e ? "on" : ""}" data-preset="${k}">${names[k] || k}</button>`).join("")}</div>`;
    }
    html += `<div class="label">Size</div>${chipRow("size", Object.keys(d.sizes), sel.size)}`;
    if (d.extra) html += `<div class="label">${d.extra.label}</div>${chipRow("extra", d.extra.options.map(o => o.name), sel.extra)}`;
    html += `<div class="label">How many (${d.unit})</div>
      <div class="stepper"><button data-step="-0.5" aria-label="Less">−</button><span class="q">${sel.qty}</span><button data-step="0.5" aria-label="More">+</button></div>
      <div class="label">Fine-tune portion: ${sel.adjust}%</div>
      <input type="range" min="50" max="200" step="5" value="${sel.adjust}" id="adj" aria-label="Fine-tune portion">`;
    const g = dishGrams(d, sel);
    html += `<div class="note">One ${d.unit} ≈ ${Object.entries(g).filter(([k]) => k !== "salt").map(([k, v]) => `${INGREDIENTS[k].name.toLowerCase()} ${r0(v)} g`).join(", ")} (raw weights).</div>`;
  } else {
    const ing = INGREDIENTS[food];
    const units = [...(ing.units || []).map(u => u.name), "grams"];
    html += `<div class="label">Amount</div>${chipRow("unit", units, sel.unit)}`;
    if (sel.unit === "grams") {
      html += `<div class="stepper"><input class="grams" id="grams" type="number" inputmode="decimal" min="0" value="${sel.grams}"> <span>grams</span></div>`;
    } else {
      html += `<div class="stepper"><button data-step="-0.5" aria-label="Less">−</button><span class="q">${sel.qty}</span><button data-step="0.5" aria-label="More">+</button></div>`;
    }
  }

  html += `<div class="label">Meal</div>${chipRow("meal", MEALS, sel.meal)}`;
  const n = compute(kind, food, sel);
  html += `<div class="preview">
    <div><b>${r0(n.kcal)}</b><span>kcal</span></div>
    <div><b>${r1(n.protein)}</b><span>protein g</span></div>
    <div><b>${r1(n.carbs)}</b><span>carbs g</span></div>
    <div><b>${r1(n.fat)}</b><span>fat g</span></div>
  </div>
  <div class="actions">
    <button class="btn ghost" id="favBtn">Save as my food</button>
    <button class="btn" id="addBtn">${ctx.editId ? "Save changes" : "Add to log"}</button>
  </div>`;
  $("#sheet").innerHTML = html;
  bindSheet();
}

function bindSheet() {
  const sh = $("#sheet");
  const { kind, food, sel } = ctx;
  sh.querySelectorAll("[data-set]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.set, v = b.dataset.val;
    sel[k] = v;
    if (k === "unit" && v !== "grams") {
      sel.unitG = INGREDIENTS[food].units.find(u => u.name === v).g;
    }
    renderSheet();
  }));
  sh.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => {
    const d = DISHES.find(x => x.id === food);
    [sel.size, sel.extra] = d.presets[b.dataset.preset];
    renderSheet();
  }));
  sh.querySelectorAll("[data-step]").forEach(b => b.addEventListener("click", () => {
    sel.qty = Math.max(0.5, Math.round((sel.qty + +b.dataset.step) * 2) / 2);
    renderSheet();
  }));
  const adj = $("#adj");
  if (adj) adj.addEventListener("change", e => { sel.adjust = +e.target.value; renderSheet(); });
  const gr = $("#grams");
  if (gr) gr.addEventListener("change", e => { sel.grams = Math.max(0, +e.target.value || 0); renderSheet(); });
  const fav = $("#favBtn");
  if (fav) fav.addEventListener("click", () => {
    const label = prompt("Name for this food (e.g. Mom's aloo paratha):", ctx.favLabel || foodName(kind, food));
    if (!label) return;
    const { meal, ...rest } = sel;
    data.favs = data.favs.filter(f => f.label !== label);
    data.favs.unshift({ label, kind, food, sel: rest, desc: describe(kind, food, rest) });
    save(); toast("Saved to My foods");
  });
  $("#addBtn").addEventListener("click", addEntry);
}

function addEntry() {
  const { kind, food, sel } = ctx;
  const { meal, ...rest } = sel;
  let name, desc;
  if (kind === "manual") {
    name = (sel.name || "").trim() || "Manual entry";
    desc = "Entered manually";
    if (!sel.n.kcal) { toast("Enter the calories first"); return; }
  } else {
    name = ctx.favLabel || foodName(kind, food);
    desc = describe(kind, food, rest);
  }
  const entry = { id: ctx.editId || uid(), kind, food, sel: rest, name, desc, meal, n: compute(kind, food, sel) };
  const list = data.log[day] || (data.log[day] = []);
  if (ctx.editId) {
    const i = list.findIndex(e => e.id === ctx.editId);
    if (i >= 0) list[i] = entry;
  } else list.push(entry);

  if (kind !== "manual") {
    const sig = kind + food + JSON.stringify(rest);
    data.recents = [{ kind, food, sel: rest, name, desc, sig }, ...data.recents.filter(r => r.sig !== sig)].slice(0, 8);
  }
  save();
  const wasEdit = !!ctx.editId;
  closeSheet();
  toast(wasEdit ? "Changes saved" : `Added ${name} · ${r0(entry.n.kcal)} kcal`);
  if (wasEdit) render();
  else if (tab === "add") $("#results").innerHTML = resultsHtml();
  else render();
}

window.openManual = () => { ctx = { kind: "manual", food: null, sel: { name: "", n: {}, meal: defaultMeal() } }; openSheet(); };
window.closeSheet = closeSheet;
window.delEntry = id => {
  const list = data.log[day] || [];
  const e = list.find(x => x.id === id);
  if (!e || !confirm(`Remove ${e.name}?`)) return;
  data.log[day] = list.filter(x => x.id !== id);
  save(); render();
};

// ---------------- history ----------------
function viewHistory() {
  const T = targets();
  const today = dateKey(new Date());
  const keys = Array.from({ length: 7 }, (_, i) => shiftDate(today, i - 6));
  const totals = keys.map(k => dayTotals(k));
  const max = Math.max(T.kcal * 1.25, ...totals.map(t => t.kcal));
  let html = `<h2>Last 7 days</h2>
    <div class="days">
      <div class="goalline" style="bottom:${8 + 22 + (T.kcal / max) * 100}px" title="Goal"></div>
      ${keys.map((k, i) => {
        const h = (totals[i].kcal / max) * 100;
        const [y, m, d] = k.split("-").map(Number);
        const wd = new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
        return `<div class="day"><span>${totals[i].kcal ? r0(totals[i].kcal) : ""}</span><div class="col ${totals[i].kcal > T.kcal ? "over" : ""}" style="height:${h}px"></div><span>${wd}</span></div>`;
      }).join("")}
    </div>
    <p class="small muted">Dashed line is your calorie goal.</p>`;
  const logged = keys.filter(k => (data.log[k] || []).length);
  if (!logged.length) return html + `<div class="empty">Log a few days of food to see your averages here.</div>`;
  const avg = zero();
  logged.forEach(k => addInto(avg, dayTotals(k), 1 / logged.length));
  html += `<h2>Daily average</h2><p class="small muted">Over ${logged.length} logged day${logged.length > 1 ? "s" : ""}. “Low” means under 70% of your daily need.</p>`;
  html += nutrientRows(avg, T, ["kcal", "protein", "carbs", "fat", "fiber", "ca", "fe", "zn", "mg", "k", "vitA", "vitC", "folate", "b12", "na"], true);
  return html;
}

// ---------------- settings ----------------
function viewSettings() {
  const s = data.settings;
  return `<h2>Your daily goals</h2>
  <div class="rows">
    <div class="field"><span>Vitamin &amp; mineral needs for</span>
      <select id="sex"><option value="male" ${s.sex !== "female" ? "selected" : ""}>Man</option><option value="female" ${s.sex === "female" ? "selected" : ""}>Woman</option></select></div>
    <div class="field"><span>Calories (kcal)</span><input id="kcal" type="number" inputmode="numeric" value="${s.kcal}"></div>
    <div class="field"><span>Protein (g)</span><input id="protein" type="number" inputmode="numeric" value="${s.protein}"></div>
  </div>
  <p class="small muted">A common protein starting point is about 0.8–1 g per kg of body weight, more if you train hard. Vitamin and mineral targets follow ICMR-NIN 2020 adult values.</p>
  <h2>Backup</h2>
  <p class="small muted">Your log is stored only on this phone. Export a backup now and then so you never lose it.</p>
  <div class="stack">
    <button class="btn" id="exportBtn">Export backup</button>
    <button class="btn ghost" id="importBtn">Import backup</button>
    <button class="btn ghost" id="clearBtn" style="color:var(--phulkari)">Delete all data</button>
  </div>
  <p class="small muted" style="margin-top:20px">Nutrition values are estimates from standard food tables and typical recipes. Home and dhaba cooking vary a lot, so treat the numbers as a guide.</p>`;
}

function bindSettings() {
  const upd = () => {
    data.settings = { sex: $("#sex").value, kcal: +$("#kcal").value || 2100, protein: +$("#protein").value || 60 };
    save(); toast("Goals saved");
  };
  ["#sex", "#kcal", "#protein"].forEach(s => $(s).addEventListener("change", upd));
  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `khurak-backup-${dateKey(new Date())}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#clearBtn").addEventListener("click", () => {
    if (!confirm("Delete your whole food log, goals and saved foods? This can't be undone.")) return;
    localStorage.removeItem(STORE); data = load(); render(); toast("All data deleted");
  });
}
$("#importFile").addEventListener("change", async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!d || typeof d.log !== "object") throw new Error();
    if (!confirm("Replace the data on this phone with this backup?")) return;
    data = { settings: { sex: "male", kcal: 2100, protein: 60 }, favs: [], recents: [], ...d };
    save(); render(); toast("Backup imported");
  } catch { toast("That file isn't a Khurak backup"); }
  e.target.value = "";
});

// ---------------- nav & misc ----------------
window.go = t => { tab = t; render(); window.scrollTo(0, 0); };
document.querySelectorAll("nav.tabs button").forEach(b => b.addEventListener("click", () => go(b.dataset.tab)));
$("#prevDay").addEventListener("click", () => { day = shiftDate(day, -1); render(); });
$("#nextDay").addEventListener("click", () => { if (day < dateKey(new Date())) { day = shiftDate(day, 1); render(); } });

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

render();
