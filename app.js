const $=s=>document.querySelector(s),bn=n=>String(n).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]),tk=n=>"৳"+bn(n.toLocaleString("en-IN"));
let cart=JSON.parse(localStorage.cart||"{}"),cat="সব",q="";const DELIV=60;
const save=()=>{localStorage.cart=JSON.stringify(cart);$("#cc").textContent=bn(Object.values(cart).reduce((a,b)=>a+b,0))};
const P=id=>PRODUCTS.find(p=>p.id==id);
function toast(t){const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.append(d);setTimeout(()=>d.remove(),1500)}
function add(id){cart[id]=(cart[id]||0)+1;save();toast("কার্টে যোগ হয়েছে ✓")}
function setQ(id,d){cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];save();route()}
const card=p=>`<div class="card"><a href="#/p/${p.id}"><img src="${p.img}" alt=""></a><div class="b"><h3>${p.name}</h3><span class="u">${p.unit}</span><div><span class="price">${tk(p.price)}</span>${p.old?`<span class="old">${tk(p.old)}</span>`:""}</div><button class="btn" onclick="add('${p.id}')">কার্টে যোগ করুন</button></div></div>`;
function home(){const cats=["সব",...new Set(PRODUCTS.map(p=>p.cat))];
$("#app").innerHTML=`<div class="hero"><h1>খাঁটি ও নিরাপদ খাবার</h1><p>ঘরে বসে অর্ডার করুন, ক্যাশ অন ডেলিভারি সুবিধা</p></div>
<input id="s" placeholder="🔍 পণ্য খুঁজুন..." value="${q}"><div class="chips">${cats.map(c=>`<button class="chip ${c==cat?"on":""}" data-c="${c}">${c}</button>`).join("")}</div><div class="grid" id="g"></div>`;
const draw=()=>{const l=PRODUCTS.filter(p=>(cat=="সব"||p.cat==cat)&&(p.name+p.desc).includes(q));$("#g").innerHTML=l.map(card).join("")||"<p>কিছু পাওয়া যায়নি</p>"};draw();
$("#s").oninput=e=>{q=e.target.value.trim();draw()};document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{cat=b.dataset.c;home()})}
function detail(id){const p=P(id);$("#app").innerHTML=`<div class="detail"><img src="${p.img}"><div class="box"><h2>${p.name}</h2><p class="u">${p.cat} · ${p.unit}</p><p class="price">${tk(p.price)}${p.old?`<span class="old">${tk(p.old)}</span>`:""}</p><p>${p.desc}</p><button class="btn" onclick="add('${p.id}')">কার্টে যোগ করুন</button><br><button class="btn alt" onclick="add('${p.id}');location.hash='#/checkout'">এখনই কিনুন</button></div><a href="#/">← সব পণ্য</a></div>`}
const sub=()=>Object.entries(cart).reduce((a,[i,n])=>a+P(i).price*n,0);
function cartV(){const e=Object.entries(cart);if(!e.length){$("#app").innerHTML=`<div class="box" style="text-align:center"><p>কার্ট খালি</p><a class="btn" href="#/">কেনাকাটা করুন</a></div>`;return}
$("#app").innerHTML=`<h2>আপনার কার্ট</h2>${e.map(([i,n])=>{const p=P(i);return`<div class="row"><img src="${p.img}"><div class="f"><b>${p.name}</b><div class="price">${tk(p.price*n)}</div></div><div class="q"><button onclick="setQ('${i}',-1)">−</button><b>${bn(n)}</b><button onclick="setQ('${i}',1)">+</button></div></div>`}).join("")}
<div class="box"><div class="tot"><span>সাবটোটাল</span><span>${tk(sub())}</span></div><div class="tot"><span>ডেলিভারি</span><span>${tk(DELIV)}</span></div><div class="tot big"><span>মোট</span><span>${tk(sub()+DELIV)}</span></div></div><a class="btn" href="#/checkout">অর্ডার করতে এগিয়ে যান →</a>`}
const DIST=["ঢাকা","চট্টগ্রাম","কুমিল্লা","সিলেট","রাজশাহী","খুলনা","বরিশাল","রংপুর","ময়মনসিংহ","অন্যান্য"];
function checkout(){if(!Object.keys(cart).length)return cartV();
$("#app").innerHTML=`<h2>চেকআউট</h2><form id="f" class="box"><label>নাম*<input name="name" required></label><label>মোবাইল নম্বর*<input name="phone" type="tel" pattern="01[0-9]{9}" placeholder="01XXXXXXXXX" required></label><label>জেলা*<select name="dist" required><option value="">বেছে নিন</option>${DIST.map(d=>`<option>${d}</option>`).join("")}</select></label><label>পূর্ণ ঠিকানা*<textarea name="addr" rows="3" required></textarea></label>
<b>পেমেন্ট পদ্ধতি</b><div class="pay"><label><input type="radio" name="pay" value="ক্যাশ অন ডেলিভারি" checked>💵 ক্যাশ অন ডেলিভারি</label><label><input type="radio" name="pay" value="বিকাশ">📱 বিকাশ (ডেমো)</label><label><input type="radio" name="pay" value="নগদ">📱 নগদ (ডেমো)</label></div>
<div class="tot big"><span>মোট</span><span>${tk(sub()+DELIV)}</span></div><button class="btn">✓ অর্ডার নিশ্চিত করুন</button></form>`;
$("#f").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(d.pay!="ক্যাশ অন ডেলিভারি"&&!confirm(d.pay+" পেমেন্ট (ডেমো): আসল টাকা কাটা হবে না। চালিয়ে যাবেন?"))return;
const o={no:"KB"+Date.now().toString().slice(-7),...d,total:sub()+DELIV,items:cart};localStorage.lastOrder=JSON.stringify(o);cart={};save();location.hash="#/done"}}
function done(){const o=JSON.parse(localStorage.lastOrder||"null");if(!o)return home();$("#app").innerHTML=`<div class="box" style="text-align:center"><div class="ok">✅</div><h2>অর্ডার সফল হয়েছে!</h2><p>অর্ডার নম্বর: <b>${o.no}</b></p><p>${o.name}, ${o.dist}<br>পেমেন্ট: ${o.pay}<br>মোট: <b>${tk(o.total)}</b></p><p class="u">শীঘ্রই আমরা ${bn(o.phone)} নম্বরে কল করব। (ডেমো)</p><a class="btn" href="#/">আরও কেনাকাটা</a></div>`}
function route(){const h=location.hash.slice(2).split("/");scrollTo(0,0);({p:()=>detail(h[1]),cart:cartV,checkout,done}[h[0]]||home)()}
onhashchange=route;save();route();
