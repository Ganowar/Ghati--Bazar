const $ = s => document.querySelector(s);
const bn = n => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
const tk = n => "৳" + bn(Number(n).toLocaleString("en-IN"));
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const off = p => p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
const P = id => PRODUCTS.find(p => p.id === id);
const DELIV = 60;
const CATS = ["সব", ...new Set(PRODUCTS.map(p => p.cat))];
const CAT_ICON = {
  "সব": ["✦", "#e7f6ee"],
  "তাজা ফল": ["🍎", "#fde8e8"],
  "ঘি": ["🫙", "#fff4d6"],
  "তেল": ["🫙", "#e8f7ef"],
  "খেজুর ও বাদাম": ["🌰", "#fdecdc"],
  "চাল ও ডাল": ["🌾", "#eef2ff"],
  "মসলা": ["🌶️", "#fde8e8"]
};
const SLIDES = [
  {img:"img/banner-honey.jpg", kicker:"মৌসুমি", title:"তাজা ফল", text:"বাছাই করা ফল, এখন ঘরে পৌঁছে যাবে।", cta:"ফল দেখুন", cat:"তাজা ফল"},
  {img:"img/banner-ghee.jpg", kicker:"দুধের ঘি", title:"গাওয়া ঘি, এখনই নিন", text:"দেশি গরুর দুধ থেকে তৈরি। ভাত ও রুটিতে সুগন্ধ।", cta:"ঘি দেখুন", cat:"ঘি"},
  {img:"img/banner-dates.jpg", kicker:"প্রিমিয়াম", title:"আজওয়া খেজুর ও বাদাম", text:"বাছাই করা দানা। সারা বাংলাদেশে ডেলিভারি।", cta:"দেখে নিন", cat:"খেজুর ও বাদাম"},
  {img:"img/banner-spice.jpg", kicker:"আজকের অফার", title:"মসলায় ছাড় চলছে", text:"হলুদ ও মরিচ — রং মেশানো নেই, স্বাদ আসল।", cta:"অফার দেখুন", cat:"মসলা"}
];
const MARQUEE = ["তাজা ফল", "গাওয়া ঘি", "ঘানি ভাঙা তেল", "ক্যাশ অন ডেলিভারি", "বিকাশ ও নগদ", "সারা দেশে ডেলিভারি", "১০০% খাঁটি"];

let cart = JSON.parse(localStorage.cart || "{}");
let cat = "সব";
let q = "";
let timers = [];
let pendingScroll = false;

const save = () => {
  localStorage.cart = JSON.stringify(cart);
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  $("#cc").textContent = bn(n);
};
function toast(t){
  const d = document.createElement("div");
  d.className = "toast";
  d.textContent = t;
  document.body.append(d);
  setTimeout(() => d.remove(), 1500);
}
function add(id){ cart[id] = (cart[id] || 0) + 1; save(); toast("কার্টে যোগ হয়েছে"); }
function setQ(id, d){ cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; save(); route(true); }
let clockTimer = null;
function clearTimers(){
  timers.forEach(clearInterval);
  timers = [];
  if (clockTimer){ clearInterval(clockTimer); clockTimer = null; }
}
function pageName(){ return (location.hash.replace(/^#\/?/, "") || "").split("/")[0]; }
function filtered(){
  const query = q.trim();
  return PRODUCTS.filter(p => (cat === "সব" || p.cat === cat) && (!query || (p.name + p.cat + p.desc).includes(query)));
}
function card(p){
  const d = off(p);
  return `<article class="card">
    <a class="thumb" href="#/p/${p.id}">
      ${d ? `<span class="badge-off">-${bn(d)}%</span>` : ""}
      ${p.fresh ? `<span class="badge-new">নতুন</span>` : ""}
      <img src="${p.img}" alt="${esc(p.name)}" width="600" height="600" loading="lazy">
    </a>
    <div class="info">
      <p class="unit">${esc(p.cat)} · ${esc(p.unit)}</p>
      <h3><a href="#/p/${p.id}">${esc(p.name)}</a></h3>
      <div class="price-row"><span class="price">${tk(p.price)}</span>${p.old ? `<span class="old">${tk(p.old)}</span>` : ""}</div>
      <button class="btn" type="button" data-add="${p.id}">কার্টে যোগ করুন</button>
    </div>
  </article>`;
}
function syncNav(){
  document.querySelectorAll("#navIn button").forEach(b => b.classList.toggle("on", b.dataset.cat === cat && !pageName()));
}
function setCat(next, scroll){
  cat = next;
  q = "";
  const input = $("#q");
  if (input) input.value = "";
  syncNav();
  if (pageName()){ pendingScroll = scroll; location.hash = "#/"; }
  else paintHome(scroll);
}
function closeNav(){
  $("#nav").classList.remove("open");
  $("#burger").setAttribute("aria-expanded", "false");
}

function home(){
  const items = MARQUEE.concat(MARQUEE).map(t => `<span>${t}</span>`).join("");
  $("#app").innerHTML = `
  <section class="hero" id="hero">
    <div class="slides" id="slides">
      ${SLIDES.map(s => `<article class="slide">
        <img src="${s.img}" alt="" width="1280" height="640">
        <div class="veil"></div>
        <div class="wrap copy">
          <p class="kicker">${s.kicker}</p>
          <h2>${s.title}</h2>
          <p>${s.text}</p>
          <button class="hero-btn" type="button" data-cat="${s.cat}">${s.cta}</button>
        </div>
      </article>`).join("")}
    </div>
    <button class="hero-nav prev" type="button" aria-label="আগের স্লাইড">‹</button>
    <button class="hero-nav next" type="button" aria-label="পরের স্লাইড">›</button>
    <div class="dots" id="dots">${SLIDES.map((_, i) => `<button type="button" aria-label="স্লাইড ${bn(i + 1)}"></button>`).join("")}</div>
  </section>
  <div class="marquee" aria-hidden="true"><div class="marquee-track">${items}</div></div>
  <div class="wrap">
    <section class="section">
      <div class="sec-head"><div><h2>ক্যাটাগরি</h2><p>যা লাগবে, বেছে নিন</p></div></div>
      <div class="cats" id="catRow"></div>
    </section>
    <div id="editorial"></div>
    <section class="section" id="catalog">
      <div class="sec-head"><div><h2 id="catalogTitle">সব পণ্য</h2><p id="catalogMeta"></p></div></div>
      <div class="grid" id="catalogGrid"></div>
    </section>
  </div>`;
  $("#catRow").innerHTML = CATS.map(c => {
    const [ic, bg] = CAT_ICON[c] || ["•", "#f4f2ee"];
    return `<button class="cat" type="button" data-cat="${esc(c)}"><span class="ic" style="background:${bg}">${ic}</span>${esc(c)}</button>`;
  }).join("");
  initCarousel();
  paintHome(pendingScroll);
  pendingScroll = false;
}
function editorial(){
  const fresh = PRODUCTS.filter(p => p.fresh);
  const best = PRODUCTS.filter(p => p.best);
  const deals = PRODUCTS.filter(p => p.old);
  return `
  <section class="section">
    <div class="sec-head"><div><h2>নতুন পণ্য</h2><p>এই সপ্তাহে এসেছে</p></div></div>
    <div class="grid">${fresh.map(card).join("")}</div>
  </section>
  <section class="section">
    <div class="sec-head"><div><h2>সেরা বিক্রি</h2><p>সবাই যা বারবার নেয়</p></div></div>
    <div class="grid">${best.map(card).join("")}</div>
  </section>
  <section class="section" id="offer">
    <div class="offer">
      <div class="offer-panel">
        <p class="kicker">আজকের অফার</p>
        <h2>দিন শেষের আগে</h2>
        <p>ছাড়ের দাম মধ্যরাত পর্যন্ত। ডেমো টাইমার।</p>
        <div class="clock" aria-live="polite">
          <span><b id="hh">০০</b><small>ঘণ্টা</small></span>
          <span><b id="mm">০০</b><small>মিনিট</small></span>
          <span><b id="ss">০০</b><small>সেকেন্ড</small></span>
        </div>
        <button class="btn light" type="button" data-cat="মসলা" style="width:auto">অফার দেখুন</button>
      </div>
      <div class="grid">${deals.map(card).join("")}</div>
    </div>
  </section>
  <ul class="services">
    <li><span class="ic">🚚</span><div><b>দ্রুত ডেলিভারি</b><small>সারা বাংলাদেশে</small></div></li>
    <li><span class="ic">💵</span><div><b>ক্যাশ অন ডেলিভারি</b><small>পণ্য হাতে পেয়ে দিন</small></div></li>
    <li><span class="ic">✓</span><div><b>১০০% খাঁটি</b><small>বাছাই করা উৎস</small></div></li>
    <li><span class="ic">☎</span><div><b>সাপোর্ট</b><small>সকাল ৯টা – রাত ৯টা</small></div></li>
  </ul>`;
}
function paintHome(scrollCatalog){
  const editing = $("#editorial");
  if (!editing) return;
  const searching = !!(q.trim() || cat !== "সব");
  editing.hidden = searching;
  editing.innerHTML = searching ? "" : editorial();
  if (searching){ if (clockTimer){ clearInterval(clockTimer); clockTimer = null; } }
  else initClock();
  const list = filtered();
  $("#catalogTitle").textContent = q.trim() ? `“${q.trim()}” এর ফলাফল` : (cat === "সব" ? "সব পণ্য" : cat);
  $("#catalogMeta").textContent = bn(list.length) + "টি পণ্য";
  $("#catalogGrid").innerHTML = list.map(card).join("") || `<p class="empty">এই খোঁজে কিছু পাওয়া যায়নি। অন্য নামে চেষ্টা করুন।</p>`;
  document.querySelectorAll("#catRow .cat").forEach(b => b.classList.toggle("on", b.dataset.cat === cat));
  syncNav();
  if (scrollCatalog) document.getElementById("catalog")?.scrollIntoView({behavior:"smooth", block:"start"});
}
function initClock(){
  if (clockTimer) clearInterval(clockTimer);
  const tick = () => {
    const end = new Date(); end.setHours(24, 0, 0, 0);
    let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const pad = n => bn(String(n).padStart(2, "0"));
    const hh = $("#hh"); if (!hh) return;
    hh.textContent = pad(h); $("#mm").textContent = pad(m); $("#ss").textContent = pad(sec);
  };
  tick();
  clockTimer = setInterval(tick, 1000);
}
function initCarousel(){
  const root = $("#hero");
  const track = $("#slides");
  const slides = [...track.children];
  const dots = [...$("#dots").children];
  let i = 0, timer, startX = null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function go(n){
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle("on", idx === i));
  }
  function start(){ stop(); if (!reduced) timer = setInterval(() => go(i + 1), 4000); timers.push(timer); }
  function stop(){ clearInterval(timer); }
  root.querySelector(".next").onclick = () => { go(i + 1); start(); };
  root.querySelector(".prev").onclick = () => { go(i - 1); start(); };
  dots.forEach((d, idx) => d.onclick = () => { go(idx); start(); });
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("touchstart", e => { startX = e.touches[0].clientX; stop(); }, {passive:true});
  root.addEventListener("touchend", e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    startX = null; start();
  }, {passive:true});
  go(0); start();
}

function detail(id){
  const p = P(id);
  if (!p){ $("#app").innerHTML = `<div class="wrap page"><p class="empty">পণ্যটি নেই।</p><a class="btn" href="#/">দোকানে ফিরুন</a></div>`; return; }
  const d = off(p);
  $("#app").innerHTML = `<div class="wrap page"><a class="crumb" href="#/">← সব পণ্য</a>
    <div class="detail">
      <div class="detail-photo"><img src="${p.img}" alt="${esc(p.name)}" width="600" height="600"></div>
      <div class="box">
        <p class="unit">${esc(p.cat)} · ${esc(p.unit)}</p>
        <h1>${esc(p.name)}</h1>
        <div class="price-row"><span class="price">${tk(p.price)}</span>${p.old ? `<span class="old">${tk(p.old)}</span>` : ""}${d ? `<span class="badge-off" style="position:static">-${bn(d)}%</span>` : ""}</div>
        <p>${esc(p.desc)}</p>
        <p class="unit">ডেলিভারি ${tk(DELIV)} · ক্যাশ অন ডেলিভারি, বিকাশ, নগদ</p>
        <div class="actions">
          <button class="btn" type="button" data-add="${p.id}">কার্টে যোগ করুন</button>
          <button class="btn alt" type="button" data-buy="${p.id}">এখনই কিনুন</button>
        </div>
      </div>
    </div>
  </div>`;
}
const sub = () => Object.entries(cart).reduce((a, [i, n]) => a + (P(i) ? P(i).price * n : 0), 0);
function cartV(){
  const entries = Object.entries(cart).filter(([i]) => P(i));
  if (!entries.length){
    $("#app").innerHTML = `<div class="wrap page"><div class="box center"><h1>কার্ট খালি</h1><p class="unit">তাজা ফল, ঘি বা মসলা যোগ করুন।</p><a class="btn" href="#/">কেনাকাটা করুন</a></div></div>`;
    return;
  }
  $("#app").innerHTML = `<div class="wrap page"><h1>আপনার কার্ট</h1>
    ${entries.map(([i, n]) => {
      const p = P(i);
      return `<div class="row"><img src="${p.img}" alt=""><div class="f"><b>${esc(p.name)}</b><div class="unit">${esc(p.unit)}</div><div class="price">${tk(p.price * n)}</div></div>
        <div class="q"><button type="button" data-setq="${i}" data-d="-1" aria-label="কমান">−</button><b>${bn(n)}</b><button type="button" data-setq="${i}" data-d="1" aria-label="বাড়ান">+</button></div></div>`;
    }).join("")}
    <div class="box">
      <div class="tot"><span>সাবটোটাল</span><span>${tk(sub())}</span></div>
      <div class="tot"><span>ডেলিভারি</span><span>${tk(DELIV)}</span></div>
      <div class="tot big"><span>মোট</span><span>${tk(sub() + DELIV)}</span></div>
    </div>
    <a class="btn" href="#/checkout">অর্ডার করতে এগিয়ে যান</a>
  </div>`;
}
const DIST = ["ঢাকা","চট্টগ্রাম","কুমিল্লা","সিলেট","রাজশাহী","খুলনা","বরিশাল","রংপুর","ময়মনসিংহ","অন্যান্য"];
function checkout(){
  if (!Object.keys(cart).length) return cartV();
  $("#app").innerHTML = `<div class="wrap page"><a class="crumb" href="#/cart">← কার্ট</a><h1>চেকআউট</h1>
    <form id="f" class="box">
      <label>নাম<input name="name" required autocomplete="name"></label>
      <label>মোবাইল নম্বর<input name="phone" type="tel" inputmode="numeric" pattern="01[0-9]{9}" placeholder="01XXXXXXXXX" required autocomplete="tel"></label>
      <label>জেলা<select name="dist" required><option value="">বেছে নিন</option>${DIST.map(d => `<option>${d}</option>`).join("")}</select></label>
      <label>পূর্ণ ঠিকানা<textarea name="addr" rows="3" required autocomplete="street-address"></textarea></label>
      <b>পেমেন্ট পদ্ধতি</b>
      <div class="pay">
        <label><input type="radio" name="pay" value="ক্যাশ অন ডেলিভারি" checked> ক্যাশ অন ডেলিভারি</label>
        <label><input type="radio" name="pay" value="বিকাশ"> বিকাশ (ডেমো)</label>
        <label><input type="radio" name="pay" value="নগদ"> নগদ (ডেমো)</label>
      </div>
      <div class="tot"><span>সাবটোটাল</span><span>${tk(sub())}</span></div>
      <div class="tot"><span>ডেলিভারি</span><span>${tk(DELIV)}</span></div>
      <div class="tot big"><span>মোট</span><span>${tk(sub() + DELIV)}</span></div>
      <button class="btn" type="submit">অর্ডার নিশ্চিত করুন</button>
    </form>
  </div>`;
  $("#f").onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (d.pay !== "ক্যাশ অন ডেলিভারি" && !confirm(d.pay + " পেমেন্ট (ডেমো): আসল টাকা কাটা হবে না। চালিয়ে যাবেন?")) return;
    const o = {no:"KB" + Date.now().toString().slice(-7), ...d, total:sub() + DELIV, items:cart};
    localStorage.lastOrder = JSON.stringify(o);
    cart = {}; save();
    location.hash = "#/done";
  };
}
function done(){
  const o = JSON.parse(localStorage.lastOrder || "null");
  if (!o) return home();
  $("#app").innerHTML = `<div class="wrap page"><div class="box center">
    <div class="ok">✓</div>
    <h1>অর্ডার সফল হয়েছে</h1>
    <p>অর্ডার নম্বর <b>${esc(o.no)}</b></p>
    <p>${esc(o.name)}, ${esc(o.dist)}<br>পেমেন্ট: ${esc(o.pay)}<br>মোট: <b>${tk(o.total)}</b></p>
    <p class="unit">শীঘ্রই আমরা ${bn(esc(o.phone))} নম্বরে যোগাযোগ করব। এটি ডেমো অর্ডার।</p>
    <a class="btn" href="#/">আরও কেনাকাটা</a>
  </div></div>`;
}

function route(keep){
  clearTimers();
  closeNav();
  const h = location.hash.replace(/^#\/?/, "").split("/");
  const name = h[0] || "";
  if (!keep) scrollTo(0, 0);
  if (name === "p") detail(h[1]);
  else if (name === "cart") cartV();
  else if (name === "checkout") checkout();
  else if (name === "done") done();
  else home();
  syncNav();
}

$("#navIn").innerHTML = CATS.map(c => `<button type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
$("#burger").onclick = () => {
  const open = $("#nav").classList.toggle("open");
  $("#burger").setAttribute("aria-expanded", open ? "true" : "false");
};
$("#searchForm").onsubmit = e => {
  e.preventDefault();
  q = $("#q").value.trim();
  cat = "সব";
  if (pageName()) location.hash = "#/";
  else paintHome(true);
  syncNav();
};
$("#q").oninput = () => {
  q = $("#q").value.trim();
  if (!pageName() && $("#catalogGrid")) paintHome(false);
};
document.addEventListener("click", e => {
  const offer = e.target.closest("[data-offer]");
  if (offer){
    e.preventDefault();
    cat = "সব"; q = "";
    const go = () => document.getElementById("offer")?.scrollIntoView({behavior:"smooth", block:"start"});
    if (pageName()){ location.hash = "#/"; setTimeout(go, 60); }
    else { paintHome(false); go(); }
    return;
  }
  const catBtn = e.target.closest("[data-cat]");
  if (catBtn && catBtn.closest("#nav, #catRow, #app")) {
    setCat(catBtn.dataset.cat, true);
    closeNav();
    return;
  }
  const addBtn = e.target.closest("[data-add]");
  if (addBtn){ add(addBtn.dataset.add); return; }
  const buy = e.target.closest("[data-buy]");
  if (buy){ add(buy.dataset.buy); location.hash = "#/checkout"; return; }
  const qty = e.target.closest("[data-setq]");
  if (qty){ setQ(qty.dataset.setq, Number(qty.dataset.d)); }
});
addEventListener("scroll", () => $("#siteHeader").classList.toggle("stuck", scrollY > 8), {passive:true});
onhashchange = () => route(false);
save();
route(false);
