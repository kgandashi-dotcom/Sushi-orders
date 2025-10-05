// =================== CONFIG ===================
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";
const PREP_MIN_PER_ROLL = 6; // דקות הכנה לרול
const MAX_ROLLS_PER_DAY = 15;
const WARNING_THRESHOLD = 10; // מעליו התראה

// =================== DATA (תפריט מלא) ===================
const INSIDE = [
  {id:"bingo", name:"רול בינגו", desc:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
  {id:"luna", name:"רול לונה", desc:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50},
  {id:"belgian", name:"רול ריי", desc:"טרטר ספייסי טונה נא על רול מלפפון, עירית ואושינקו", price:55},
  {id:"crazy-bruno", name:"רול קרייזי ברונו", desc:"דג לבן, טונה, סלמון בציפוי שומשום קלוי", price:60},
  {id:"happy-bruno", name:"רול האפי ברונו", desc:"סלמון בציפוי שקדים קלויים ורוטב טריאקי", price:60},
  {id:"mila", name:"רול מילה", desc:"בטטה, עירית ואבוקדו בעיטוף סלמון צרוב", price:50},
  {id:"newton", name:"רול ניוטון", desc:"טונה אדומה, אבוקדו, בטטה בציפוי פנקו ורוטב בוטנים", price:55},
  {id:"oli", name:"רול אולי", desc:"דג לבן, מלפפון, אבוקדו בציפוי שומשום", price:50},
  {id:"milli", name:"רול מילי", desc:"מקל סורימי, דג לבן אפוי, אושינקו בציפוי פנקו", price:50},
  {id:"scar", name:"רול סקאר", desc:"ספייסי סלמון אפוי עם אבוקדו, מלפפון ובטטה בעיטור מיונז וצ'יפס", price:50},
  {id:"magi", name:"רול מגי🌱", desc:"מלפפון, בטטה, עירית ואבוקדו בעיטור בטטה ורוטב בוטנים", price:40},
  {id:"tyson", name:"רול טייסון וקיילה", desc:"סלמון נא, קנפיו, בטטה בעיטוף שבבי פנקו סגול", price:50},
  {id:"lucy", name:"רול לוסי", desc:"סלמון נא, פטריות שיטאקי ואושינקו בציפוי טוביקו", price:55},
  {id:"billy", name:"רול בילי", desc:"דג לבן צרוב, עירית, בטטה מצופה בפנקו", price:50},
  {id:"lucky", name:"רול לאקי", desc:"טרטר ספייסי סלמון עם אבוקדו, מלפפון ועירית", price:50}
];

const MAKI = [
  {id:"alfi", name:"רול אלפי", desc:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי🌱", desc:"מאקי בטטה ואבוקדו", price:25},
  {id:"snoopy", name:"רול סנופי🌱", desc:"מאקי אושינקו וקנפיו", price:25}
];

const ONIGIRI = [
  {id:"rocky", name:"אוניגירי רוקי", desc:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני", desc:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱", desc:"אבוקדו ובטטה", price:25}
];

const POKE = [
  {id:"dog", name:"בול-דוג", desc:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק", price:60},
  {id:"pit", name:"פיט-בול", desc:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי", price:70},
  {id:"trir", name:"בול-טרייר🌱", desc:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו", price:45}
];

const SAUCES = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// =================== STATE ===================
let CURRENT_USER = null; // {name,email,phone}
let selectedRolls = {}; // id -> qty
let selectedSauces = {}; // id -> qty
let chopsticks = 1;
let selectedPickup = ""; // "HH:MM"

// =================== STORAGE HELPERS (local orders for availability) ===================
const LOCAL_ORDERS_KEY = "gandashi_local_orders";

function loadLocalOrders(){
  try{ return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]"); }
  catch(e){ return []; }
}
function saveLocalOrder(o){
  const arr = loadLocalOrders();
  arr.push(o);
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(arr));
}

// =================== TIME HELPERS ===================
function toDateToday(hhmm){
  const [hh,mm] = hhmm.split(":").map(n=>parseInt(n,10));
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}
function fmtTime(date){
  return String(date.getHours()).padStart(2,"0") + ":" + String(date.getMinutes()).padStart(2,"0");
}
function minutesToMs(m){ return m * 60 * 1000; }

// =================== AVAILABILITY LOGIC ===================
// returns {ok:true} or {ok:false, reason, suggestions: [...]}
function checkAvailability(pickupHHMM, rollsCount){
  const newEnd = toDateToday(pickupHHMM);
  const newPrep = rollsCount * PREP_MIN_PER_ROLL;
  const newStart = new Date(newEnd.getTime() - minutesToMs(newPrep));

  // total per day
  const today = (new Date()).toISOString().slice(0,10);
  const ordersToday = loadLocalOrders().filter(o=>o.date===today);
  const totalToday = ordersToday.reduce((sum,o)=>sum + (o.totalRolls||0), 0);
  if(totalToday + rollsCount > MAX_ROLLS_PER_DAY){
    return {ok:false, reason:`לא אפשרי — יחרוג מהמקסימום היומי (${MAX_ROLLS_PER_DAY} רולים).`};
  }

  // check overlap
  for(const o of ordersToday){
    const existingEnd = toDateToday(o.pickupTime);
    const existingStart = new Date(existingEnd.getTime() - minutesToMs((o.totalRolls||0) * PREP_MIN_PER_ROLL));
    if(newStart < existingEnd && existingStart < newEnd){
      // conflict -> suggest up to 3 alternative end times (next 30min slots)
      const suggestions = [];
      const slotStep = 30; // minutes
      let scan = new Date(newEnd.getTime() + slotStep*60*1000);
      for(let i=0;i<12;i++){
        const candidateEnd = new Date(scan.getTime());
        const candidateStart = new Date(candidateEnd.getTime() - minutesToMs(newPrep));
        let ok = true;
        for(const oo of ordersToday){
          const exEnd = toDateToday(oo.pickupTime);
          const exStart = new Date(exEnd.getTime() - minutesToMs((oo.totalRolls||0) * PREP_MIN_PER_ROLL));
          if(candidateStart < exEnd && exStart < candidateEnd){ ok = false; break; }
        }
        if(ok) suggestions.push(fmtTime(candidateEnd));
        scan = new Date(scan.getTime() + slotStep*60*1000);
        if(suggestions.length>=3) break;
      }
      return {ok:false, reason:`זמן איסוף ${pickupHHMM} מתנגש עם הזמנה קיימת (${o.pickupTime}).`, suggestions};
    }
  }

  return {ok:true};
}

// compute availability for each slot given current selection
function computeSlotAvailability(rollCount){
  const slots = ["19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30"];
  const res = {};
  for(const s of slots){
    const ok = checkAvailability(s, rollCount);
    res[s] = ok.ok ? true : false;
  }
  return res;
}

// =================== RENDERING ===================
function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className = cls; return e; }

function createItemRow(item, container, isSauce=false){
  const row = el("div","item-row");
  const left = el("div","item-left");
  const name = el("div","item-name"); name.textContent = item.name + (isSauce? "" : ` — ${item.price}₪`);
  const desc = el("div","item-desc"); desc.textContent = item.desc || "";
  left.appendChild(name); if(item.desc) left.appendChild(desc);

  const price = el("div","item-price"); price.textContent = isSauce ? "" : `${item.price}₪`;

  const qty = el("div","row-qty");
  const minus = el("button"); minus.type="button"; minus.textContent="−";
  const input = el("input"); input.type="number"; input.value = 0; input.readOnly = true;
  const plus = el("button"); plus.type="button"; plus.textContent="+";

  minus.addEventListener("click", ()=>{
    const v = Math.max(0, parseInt(input.value)-1);
    input.value = v;
    if(isSauce) selectedSauces[item.id] = v;
    else selectedRolls[item.id] = v;
    onSelectionChanged();
  });
  plus.addEventListener("click", ()=>{
    const v = parseInt(input.value)+1;
    input.value = v;
    if(isSauce) selectedSauces[item.id] = v;
    else selectedRolls[item.id] = v;
    onSelectionChanged();
  });

  qty.appendChild(minus); qty.appendChild(input); qty.appendChild(plus);
  row.appendChild(left); row.appendChild(price); row.appendChild(qty);
  container.appendChild(row);
}

function populateAll(){
  document.getElementById("inside-list").innerHTML = "";
  document.getElementById("maki-list").innerHTML = "";
  document.getElementById("onigiri-list").innerHTML = "";
  document.getElementById("poke-list").innerHTML = "";
  document.getElementById("sauces-list").innerHTML = "";

  INSIDE.forEach(i => createItemRow(i, document.getElementById("inside-list"), false));
  MAKI.forEach(i => createItemRow(i, document.getElementById("maki-list"), false));
  ONIGIRI.forEach(i => createItemRow(i, document.getElementById("onigiri-list"), false));
  POKE.forEach(i => createItemRow(i, document.getElementById("poke-list"), false));
  SAUCES.forEach(s => createItemRow(s, document.getElementById("sauces-list"), true));
}

// populate pickup select and update disabled based on availability
function populatePickupOptions(){
  const sel = document.getElementById("pickup-time");
  const currentRollCount = totalSelectedRolls();
  const avail = computeSlotAvailability(currentRollCount);
  sel.innerHTML = '<option value="">בחר שעה</option>';
  const slots = ["19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30"];
  for(const s of slots){
    const opt = document.createElement("option");
    opt.value = s; opt.textContent = s;
    if(!avail[s]) opt.disabled = true;
    sel.appendChild(opt);
  }
}

// =================== SUMMARY CALCS ===================
function totalSelectedRolls(){
  return Object.values(selectedRolls).reduce((a,b)=>a + (parseInt(b)||0), 0);
}
function totalSelectedSauces(){
  return Object.values(selectedSauces).reduce((a,b)=>a + (parseInt(b)||0), 0);
}
function calcTotals(){
  let sum = 0;
  let rolls = 0;
  for(const [id,q] of Object.entries(selectedRolls)){
    if(q>0){
      const item = [...INSIDE,...MAKI,...ONIGIRI,...POKE].find(x=>x.id===id);
      if(item){ sum += item.price * q; rolls += q; }
    }
  }
  const sauceCount = totalSelectedSauces();
  const freeAllowed = rolls * 2;
  const extraSauces = Math.max(0, sauceCount - freeAllowed);
  const saucesCost = extraSauces * 3;
  sum += saucesCost;
  return { totalPrice: sum, rolls, sauceCount, freeAllowed, extraSauces, saucesCost };
}

// update summary / UI
function updateSummaryUI(){
  const s = calcTotals();
  let t = "";
  if(s.rolls === 0){ t = "לא נבחרו רולים\n"; }
  else {
    t += "רולים:\n";
    for(const [id,q] of Object.entries(selectedRolls)){
      if(q>0){
        const item = [...INSIDE,...MAKI,...ONIGIRI,...POKE].find(x=>x.id===id);
        t += `${item.name} × ${q} — ${item.price}₪ כל אחד → ${item.price * q}₪\n`;
      }
    }
  }
  t += `\nרטבים: ${s.sauceCount} (חינם עד ${s.freeAllowed})`;
  if(s.extraSauces > 0) t += ` — תשלום נוסף: ${s.saucesCost}₪`;
  t += `\n\nצ'ופסטיקס: ${chopsticks}`;
  const notes = document.getElementById("notes").value.trim();
  if(notes) t += `\nהערות: ${notes}`;
  t += `\n\nשעת איסוף: ${selectedPickup || "לא נבחרה"}`;
  t += `\n\nסה״כ לתשלום: ${s.totalPrice}₪`;

  // daily capacity warnings
  const today = (new Date()).toISOString().slice(0,10);
  const totalToday = loadLocalOrders().filter(o=>o.date===today).reduce((a,b)=>a + (b.totalRolls||0), 0);
  if(totalToday + s.rolls > MAX_ROLLS_PER_DAY){
    t += `\n\n! שגיאה: לאחר הזמנה זו תחרוג מהמקסימום היומי (${MAX_ROLLS_PER_DAY}).`;
  } else if(totalToday + s.rolls > WARNING_THRESHOLD){
    t += `\n\n! התראה — נשארו ${MAX_ROLLS_PER_DAY - (totalToday + s.rolls)} מקומות עד המקסימום היומי.`;
  }

  document.getElementById("order-summary").textContent = t;

  // enable send only if rolls>0 and pickup chosen
  const sendBtn = document.getElementById("send-btn");
  sendBtn.disabled = !(s.rolls > 0 && selectedPickup !== "");
  // refresh pickup options (disable conflicting slots)
  populatePickupOptions();
}

// called whenever selection changed
function onSelectionChanged(){
  // ensure selectedRolls & selectedSauces contain all items (already done on click)
  updateSummaryUI();
}

// =================== Google Sign-in ===================
function handleGoogleCredential(resp){
  try{
    const p = jwt_decode(resp.credential);
    CURRENT_USER = { name: p.name || "", email: p.email || "", phone: p.phone_number || "" };
    // feedback
    console.log("Google user:", CURRENT_USER);
    // if we had been waiting to send, call attemptSend
    attemptSendAfterSignIn();
  } catch(e){
    console.error("Google decode error", e);
    alert("שגיאה בקבלת פרטי Google");
  }
}
function initGoogle(){
  if(window.google && google.accounts && google.accounts.id){
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false
    });
    // do not auto render a button — we prompt on demand
  } else {
    console.warn("Google Identity not loaded");
  }
}

// =================== SEND FLOW ===================
let pendingSend = false; // flag - if sign in required, we set to true and prompt

function attemptSendAfterSignIn(){
  if(!pendingSend) return;
  pendingSend = false;
  doSend();
}

function attemptSend(){
  const s = calcTotals();
  if(s.rolls === 0){ alert("אנא בחר לפחות רול אחד."); return; }
  if(!selectedPickup){ alert("אנא בחר שעת איסוף."); return; }
  // availability double-check
  const avail = checkAvailability(selectedPickup, s.rolls);
  if(!avail.ok){
    let msg = `לא ניתן לקבוע איסוף ב־${selectedPickup}: ${avail.reason}`;
    if(avail.suggestions && avail.suggestions.length){
      msg += `\n\nהצעות חלופיות:\n- ${avail.suggestions.join("\n- ")}`;
    }
    alert(msg);
    return;
  }
  // ensure signed in
  if(!CURRENT_USER){
    pendingSend = true;
    if(window.google && google.accounts && google.accounts.id){
      google.accounts.id.prompt(); // opens google one-tap / prompt
    } else {
      alert("Google Sign-In לא זמין כעת. בדוק חיבור או Client ID.");
    }
    return;
  }
  // ensure phone present
  if(!CURRENT_USER.phone || CURRENT_USER.phone.trim() === ""){
    const phone = prompt("אנא הכנס מספר טלפון למשלוח אישור (פורמט +9725...):","");
    if(!phone){ alert("טלפון נדרש עבור אישור ההזמנה (WhatsApp)."); return; }
    CURRENT_USER.phone = phone.trim();
  }

  // all good -> send
  doSend();
}

function doSend(){
  const s = calcTotals();
  const payload = {
    user: CURRENT_USER,
    rolls: Object.entries(selectedRolls).filter(([k,v])=>v>0).map(([id,q])=>{
      const it = [...INSIDE,...MAKI,...ONIGIRI,...POKE].find(x=>x.id===id);
      return {id, name: it.name, qty: q, price: it.price};
    }),
    sauces: Object.entries(selectedSauces).filter(([k,v])=>v>0).map(([id,q])=>{
      const it = SAUCES.find(x=>x.id===id);
      return {id, name: it.name, qty: q};
    }),
    chopsticks,
    notes: document.getElementById("notes").value.trim(),
    pickupTime: selectedPickup,
    totalRolls: s.rolls,
    totals: s
  };

  // POST to Make webhook
  fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  }).then(async res=>{
    if(!res.ok){
      const text = await res.text().catch(()=>"(no text)");
      throw new Error("Webhook failed: " + res.status + " " + text);
    }
    // success: save order locally (to simulate DB & for availability)
    const rec = {
      id: "loc-" + Date.now(),
      date: (new Date()).toISOString().slice(0,10),
      pickupTime: selectedPickup,
      totalRolls: s.rolls,
      createdAt: new Date().toISOString(),
      payload
    };
    saveLocalOrder(rec);
    alert("ההזמנה נשלחה בהצלחה! אישור יישלח במייל ובוואטסאפ.");
    // reset selections (keep user)
    selectedRolls = {}; selectedSauces = {}; chopsticks = 1; selectedPickup = "";
    document.getElementById("chop-qty").value = 1;
    document.getElementById("pickup-time").value = "";
    document.getElementById("notes").value = "";
    // rebuild UI values to zeros
    populateAll(); updateSummaryUI();
  }).catch(err=>{
    console.error(err);
    alert("שגיאה בשליחת ההזמנה. בדוק את ה־Webhook ב־Make. פרטים ב־console.");
  });
}

// =================== EVENTS & INIT ===================
function attachEvents(){
  document.getElementById("chop-minus").addEventListener("click", ()=>{
    if(chopsticks > 1) chopsticks--;
    document.getElementById("chop-qty").value = chopsticks;
    updateSummaryUI();
  });
  document.getElementById("chop-plus").addEventListener("click", ()=>{
    chopsticks++;
    document.getElementById("chop-qty").value = chopsticks;
    updateSummaryUI();
  });
  document.getElementById("pickup-time").addEventListener("change", (e)=>{
    selectedPickup = e.target.value;
    updateSummaryUI();
  });
  document.getElementById("notes").addEventListener("input", updateSummaryUI);
  document.getElementById("send-btn").addEventListener("click", attemptSend);
}

function initApp(){
  // init selected containers
  selectedRolls = {}; selectedSauces = {};
  INSIDE.concat(MAKI,ONIGIRI,POKE).forEach(i=> selectedRolls[i.id] = 0);
  SAUCES.forEach(s=> selectedSauces[s.id] = 0);

  populateAll();
  populatePickupOptions();
  attachEvents();
  updateSummaryUI();
  initGoogle();
  console.log("App initialized. Local orders:", loadLocalOrders());
}

document.addEventListener("DOMContentLoaded", initApp);
