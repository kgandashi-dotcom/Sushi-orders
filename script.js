// script.js — גרסה סופית עם התפריט שלך, רטבים גלובליים, Google Sign-in ו-Make webhook

// ====== CONFIG ======
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

const FREE_SAUCES_PER_ROLL = 2;
const EXTRA_SAUCE_PRICE = 3;
const MAX_ROLLS_PER_DAY = 15;

// ====== MENU DATA (השתמשתי ברשימות שנתת קודם) ======
const insideOutRollsData = [
  {id:"bingo", name:"רול בינגו - 50₪", description:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
  {id:"luna", name:"רול לונה - 50₪", description:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50},
  {id:"belgian", name:"רול ריי - 55₪", description:"טרטר ספייסי טונה נא על רול מלפפון, עירית ואושינקו", price:55},
  {id:"crazy-bruno", name:"רול קרייזי ברונו - 60₪", description:"דג לבן, טונה, סלמון בציפוי שומשום קלוי", price:60},
  {id:"happy-bruno", name:"רול האפי ברונו - 60₪", description:"סלמון בציפוי שקדים קלויים ורוטב טריאקי", price:60},
  {id:"mila", name:"רול מילה - 50₪", description:"בטטה, עירית ואבוקדו בעיטוף סלמון צרוב", price:50},
  {id:"newton", name:"רול ניוטון - 55₪", description:"טונה אדומה, אבוקדו, בטטה בציפוי פנקו ורוטב בוטנים", price:55},
  {id:"oli", name:"רול אולי - 50₪", description:"דג לבן, מלפפון, אבוקדו בציפוי שומשום", price:50},
  {id:"milli", name:"רול מילי - 50₪", description:"מקל סורימי, דג לבן אפוי, אושינקו בציפוי פנקו", price:50},
  {id:"scar", name:"רול סקאר - 50₪", description:"ספייסי סלמון אפוי עם אבוקדו, מלפפון ובטטה בעיטור מיונז וציפס", price:50},
  {id:"magi", name:"רול מגי🌱 - 40₪", description:"מלפפון, בטטה, עירית ואבוקדו בעיטור בטטה ורוטב בוטנים", price:40},
  {id:"tyson", name:"רול טייסון וקיילה - 50₪", description:"סלמון נא, קנפיו, בטטה בעיטוף שבבי פנקו סגול", price:50},
  {id:"lucy", name:"רול לוסי - 55₪", description:"סלמון נא, פטריות שיטאקי ואושינקו בציפוי טוביקו", price:55},
  {id:"billy", name:"רול בילי - 50₪", description:"דג לבן צרוב, עירית, בטטה מצופה בפנקו", price:50},
  {id:"lucky", name:"רול לאקי - 50₪", description:"טרטר ספייסי סלמון עם אבוקדו, מלפפון ועירית", price:50}
];

const makiRollsData = [
  {id:"alfi", name:"רול אלפי - 35₪", description:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי🌱 - 25₪", description:"מאקי בטטה ואבוקדו", price:25},
  {id:"snoopy", name:"רול סנופי🌱 - 25₪", description:"מאקי אושינקו וקנפיו", price:25}
];

const onigiriData = [
  {id:"rocky", name:"אוניגירי רוקי - 35₪", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני - 30₪", description:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱 - 25₪", description:"אבוקדו ובטטה", price:25}
];

const PokeData = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק . מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי . מעל בצל שאלוט מטוגן ורוטב אננס מתוק ", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו . מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  { id:"spicy-mayo", name:"ספייסי מיונז" },
  { id:"soy", name:"רוטב סויה" },
  { id:"teriyaki", name:"רוטב טריאקי" },
  { id:"ginger", name:"ג׳ינג׳ר" },
  { id:"wasabi", name:"וואסבי" }
];

// ====== STATE ======
let rollsSelected = {};   // rollId -> qty
let saucesSelected = {};  // sauceId -> qty (global)
let chopsticksCount = 1;
let notesText = "";
let selectedPickupTime = "";
let currentUser = null;
let pendingOrderAfterLogin = false;

// ====== Helper: date keys for demo storage (localStorage) ======
function todayKey(){ return new Date().toISOString().slice(0,10); }
function getDailyCount(){ return parseInt(localStorage.getItem("rolls_count_"+todayKey()) || "0", 10); }
function addDailyCount(n){ localStorage.setItem("rolls_count_"+todayKey(), String(getDailyCount() + n)); }
function getBookedTimes(){ try{ return JSON.parse(localStorage.getItem("booked_times_"+todayKey()) || "[]"); }catch{ return []; } }
function addBookedTime(t){ const k="booked_times_"+todayKey(); const arr=getBookedTimes(); arr.push(t); localStorage.setItem(k, JSON.stringify(arr)); }

// ====== UI builders ======
document.addEventListener("DOMContentLoaded", ()=> {
  // init roll selection structure
  [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...PokeData].forEach(r => { rollsSelected[r.id] = 0; });
  saucesData.forEach(s => { saucesSelected[s.id] = 0; });

  // render categories
  renderCategory("insideout-container", insideOutRollsData);
  renderCategory("maki-container", makiRollsData);
  renderCategory("onigiri-container", onigiriData);
  renderCategory("poke-container", PokeData);

  // render sauces (global)
  renderSauces();

  // chopsticks controls
  document.getElementById("chopsticks-minus").addEventListener("click", ()=>{
    if(chopsticksCount>1) chopsticksCount--;
    document.getElementById("chopsticks-qty").value = chopsticksCount;
    updateSummary();
  });
  document.getElementById("chopsticks-plus").addEventListener("click", ()=>{
    chopsticksCount++;
    document.getElementById("chopsticks-qty").value = chopsticksCount;
    updateSummary();
  });

  // notes
  document.getElementById("notes").addEventListener("input", (e)=> { notesText = e.target.value; updateSummary(); });

  // pickup times
  populatePickupTimes();

  // send button
  document.getElementById("send-order").addEventListener("click", handleSendClick);

  // initialize Google ID (does not auto prompt)
  if(window.google && google.accounts && GOOGLE_CLIENT_ID){
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false
    });
  }

  refreshCapacityInfo();
  updateSummary();
});

// Render category (cards row)
function renderCategory(containerId, items){
  const cont = document.getElementById(containerId);
  if(!cont) return;
  cont.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "roll-card";

    const h = document.createElement("h3"); h.textContent = `${item.name}`; card.appendChild(h);
    const p = document.createElement("p"); p.textContent = item.description; card.appendChild(p);
    const price = document.createElement("div"); price.className = "price"; price.textContent = `${item.price}₪`; card.appendChild(price);

    // quantity controls
    const q = document.createElement("div"); q.className = "quantity-control";
    const minus = document.createElement("button"); minus.textContent = "−";
    const input = document.createElement("input"); input.type="number"; input.value = rollsSelected[item.id] || 0; input.readOnly = true;
    const plus = document.createElement("button"); plus.textContent = "+";
    q.append(minus, input, plus);
    card.appendChild(q);

    minus.addEventListener("click", ()=>{
      if(rollsSelected[item.id] > 0) rollsSelected[item.id]--;
      input.value = rollsSelected[item.id];
      updateSummary();
      refreshCapacityInfo();
    });
    plus.addEventListener("click", ()=>{
      rollsSelected[item.id]++;
      input.value = rollsSelected[item.id];
      updateSummary();
      refreshCapacityInfo();
    });

    cont.appendChild(card);
  });
}

// Render global sauces section (plus/minus per sauce)
function renderSauces(){
  const cont = document.getElementById("sauces-container");
  cont.innerHTML = "";
  saucesData.forEach(s => {
    const card = document.createElement("div");
    card.className = "sauce-card";

    const h = document.createElement("h4"); h.textContent = s.name; card.appendChild(h);

    const qc = document.createElement("div"); qc.className = "quantity-control";
    const minus = document.createElement("button"); minus.textContent = "−";
    const input = document.createElement("input"); input.type="number"; input.value = saucesSelected[s.id] || 0; input.readOnly = true;
    const plus = document.createElement("button"); plus.textContent = "+";
    qc.append(minus, input, plus);
    card.appendChild(qc);

    minus.addEventListener("click", ()=>{
      if(saucesSelected[s.id] > 0) saucesSelected[s.id]--;
      input.value = saucesSelected[s.id];
      updateSummary();
    });
    plus.addEventListener("click", ()=>{
      saucesSelected[s.id]++;
      input.value = saucesSelected[s.id];
      updateSummary();
    });

    cont.appendChild(card);
  });
}

// Pickup times 19:30 .. 22:30 step 30m
function populatePickupTimes(){
  const sel = document.getElementById("pickup-time");
  sel.innerHTML = "<option value=''>בחר שעת איסוף</option>";
  const times = ["19:30","20:00","20:30","21:00","21:30","22:00","22:30"];
  times.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", (e)=> {
    selectedPickupTime = e.target.value;
    // check booked times (demo localStorage)
    const booked = getBookedTimes();
    const warn = document.getElementById("time-warning");
    if(booked.includes(selectedPickupTime)){
      warn.textContent = "שעה זו כבר תפוסה (בדוגמה זו). בחר שעה אחרת.";
    } else {
      warn.textContent = "";
    }
    updateSummary();
  });
}

// Update capacity info from localStorage demo
function refreshCapacityInfo(){
  const daily = getDailyCount();
  const remaining = Math.max(0, MAX_ROLLS_PER_DAY - daily);
  const el = document.getElementById("capacity-info");
  if(!el) return;
  el.innerHTML = `<span class="capacity-badge">נותרו ${remaining} מתוך ${MAX_ROLLS_PER_DAY} רולים להיום</span>`;
  if(remaining <= 5) el.innerHTML += ` <span style="color:#b23; margin-left:10px;">מומלץ למהר — נשארו ${remaining}</span>`;
}

// ====== Summary & pricing ======
function updateSummary(){
  const summaryEl = document.getElementById("order-summary");
  const lines = [];
  let totalRolls = 0;
  let subtotalRollsPrice = 0;

  // list rolls
  for(const id in rollsSelected){
    const qty = rollsSelected[id] || 0;
    if(qty <= 0) continue;
    const item = findRollById(id);
    if(!item) continue;
    const linePrice = item.price * qty;
    lines.push(`${item.name} x${qty} — ${linePrice}₪`);
    totalRolls += qty;
    subtotalRollsPrice += linePrice;
  }

  // sauces count
  const totalSaucesChosen = Object.values(saucesSelected).reduce((a,b)=>a+b,0);
  const freeSaucesQuota = totalRolls * FREE_SAUCES_PER_ROLL;
  const extraSauces = Math.max(0, totalSaucesChosen - freeSaucesQuota);
  const saucesCost = extraSauces * EXTRA_SAUCE_PRICE;

  // show sauces details if any chosen
  if(totalSaucesChosen > 0){
    lines.push("");
    lines.push("רטבים (גלובליים):");
    for(const sId in saucesSelected){
      const q = saucesSelected[sId];
      if(q>0){
        const s = saucesData.find(x=>x.id===sId);
        lines.push(`  ${s.name} x${q}`);
      }
    }
    lines.push(`סה"כ רטבים נבחרו: ${totalSaucesChosen}`);
    lines.push(`מגיעים חינם: ${freeSaucesQuota}`);
    lines.push(`בטופס נוסף: ${extraSauces} → ${saucesCost}₪`);
  } else {
    lines.push("");
    lines.push("לא נבחרו רטבים.");
    lines.push(`על כל רול מגיעים ${FREE_SAUCES_PER_ROLL} רטבים חינם.`);
  }

  lines.push("");
  lines.push(`צ'ופסטיקס: ${chopsticksCount}`);
  const notesVal = document.getElementById("notes").value.trim();
  if(notesVal) lines.push(`הערות: ${notesVal}`);

  lines.push("");
  lines.push(`שעת איסוף: ${selectedPickupTime || "לא נבחרה"}`);

  const grandTotal = subtotalRollsPrice + saucesCost;
  lines.push("");
  lines.push(`סה"כ לתשלום: ${grandTotal}₪`);

  // warnings
  const remaining = Math.max(0, MAX_ROLLS_PER_DAY - getDailyCount());
  if(totalRolls > MAX_ROLLS_PER_DAY){
    lines.push("");
    lines.push(`שגיאה: נבחרו ${totalRolls} רולים — חורג מהמגבלה היומית של ${MAX_ROLLS_PER_DAY}.`);
  } else if(totalRolls > 0 && totalRolls > remaining){
    lines.push("");
    lines.push(`שגיאה: נותרו רק ${remaining} רולים להיום.`);
  } else if(remaining <= 5 && remaining > 0){
    lines.push("");
    lines.push(`התרעה: נותרו ${remaining} רולים בלבד להיום.`);
  }

  // user info
  if(currentUser){
    lines.push("");
    lines.push(`לקוח: ${currentUser.name} (${currentUser.email})`);
  }

  summaryEl.textContent = lines.join("\n");

  // enable/disable send button
  const sendBtn = document.getElementById("send-order");
  sendBtn.disabled = (totalRolls === 0 || !selectedPickupTime || totalRolls > MAX_ROLLS_PER_DAY || totalRolls > remaining);
}

// find roll item by id
function findRollById(id){
  return insideOutRollsData.concat(makiRollsData, onigiriData, PokeData).find(r=>r.id===id);
}

// ====== Send flow & Google integration ======
function handleSendClick(){
  const totalRolls = Object.values(rollsSelected).reduce((a,b)=>a+b,0);
  if(totalRolls === 0){ alert("בחר לפחות רול אחד לפני השליחה."); return; }
  if(!selectedPickupTime){ alert("בחר שעת איסוף."); return; }
  // capacity checks
  const remaining = Math.max(0, MAX_ROLLS_PER_DAY - getDailyCount());
  if(totalRolls > remaining){ alert(`לא ניתן להזמין ${totalRolls} רולים — נשארו ${remaining} להיום.`); return; }
  // time double-booking (demo localStorage)
  if(getBookedTimes().includes(selectedPickupTime)){ alert("השעה שבחרת כבר תפוסה. בחר שעה אחרת."); return; }

  // if not logged -> prompt google sign-in (One Tap / popup)
  if(!currentUser){
    pendingOrderAfterLogin = true;
    if(window.google && GOOGLE_CLIENT_ID){
      google.accounts.id.prompt(); // shows the dialog
    } else {
      alert("Google Identity לא נטען. בדוק חיבור לאינטרנט ושילוב הסקריפט של גוגל.");
    }
    return;
  }

  // else send immediately
  sendOrderToMake();
}

// Google callback (when user signs in)
function handleCredentialResponse(response){
  try{
    const decoded = jwt_decode(response.credential);
    currentUser = {
      name: decoded.name || decoded.given_name || "לקוח",
      email: decoded.email || "",
      phone: decoded.phone_number || ""
    };
    // if we were pending a send -> proceed
    if(pendingOrderAfterLogin){
      pendingOrderAfterLogin = false;
      sendOrderToMake();
    } else {
      updateSummary();
      alert(`התחברת בהצלחה כ־${currentUser.name}`);
    }
  } catch(err){
    console.error("Google decode error:", err);
    alert("שגיאה בקריאת פרטי Google. נסה שוב.");
  }
}

// actual send to Make, update localStorage bookings/demo flows, open WhatsApp link
async function sendOrderToMake(){
  try{
    // prepare payload
    const items = [];
    let totalRolls = 0;
    let subtotal = 0;
    for(const id in rollsSelected){
      const qty = rollsSelected[id] || 0;
      if(qty<=0) continue;
      const r = findRollById(id);
      items.push({ id: r.id, name: r.name, qty, unitPrice: r.price, price: r.price * qty });
      totalRolls += qty;
      subtotal += r.price * qty;
    }

    const totalSauces = Object.values(saucesSelected).reduce((a,b)=>a+b,0);
    const freeSauces = totalRolls * FREE_SAUCES_PER_ROLL;
    const extraSauces = Math.max(0, totalSauces - freeSauces);
    const saucesCost = extraSauces * EXTRA_SAUCE_PRICE;

    const payload = {
      user: currentUser,
      items,
      sauces: saucesSelected,
      saucesSummary: { totalSauces, freeSauces, extraSauces, saucesCost },
      chopsticks: chopsticksCount,
      notes: document.getElementById("notes").value.trim(),
      pickupTime: selectedPickupTime,
      orderDate: todayKey(),
      totalRolls,
      totalPrice: subtotal + saucesCost
    };

    // UI disable while sending
    const btn = document.getElementById("send-order");
    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = "שולח...";

    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if(!res.ok){
      const txt = await res.text().catch(()=>"");
      throw new Error("Webhook error: " + res.status + " " + txt);
    }

    // success — update demo storages
    addBookedTime(selectedPickupTime);
    addDailyCount(payload.totalRolls);
    refreshCapacityInfo();

    // open whatsapp if phone available or ask
    let phone = currentUser.phone || "";
    if(!phone){
      phone = prompt("אנא הכנס מספר טלפון לקבלת אישור בוואטסאפ (ללא אפסים +972...):", "");
      if(phone) currentUser.phone = phone;
    }
    if(phone){
      const digits = phone.replace(/\D/g, "");
      const waText = encodeURIComponent(`הזמנתי מחברתכם:\n${items.map(it=>`${it.name} x${it.qty}`).join("\n")}\nשעת איסוף: ${selectedPickupTime}\nסה"כ: ${payload.totalPrice}₪`);
      window.open(`https://wa.me/${digits}?text=${waText}`, "_blank");
    }

    alert("ההזמנה נשלחה בהצלחה! קיבלת אישור במייל (דרך Make).");

    // reset selections (keep booked times)
    resetSelections();

  } catch(err){
    console.error("sendOrderToMake error:", err);
    alert("שגיאה בשליחת ההזמנה: " + (err.message || err));
    const btn = document.getElementById("send-order");
    btn.disabled = false;
    btn.textContent = "שלח הזמנה / התחבר עם Google";
  }
}

// reset UI & data (after successful send)
function resetSelections(){
  for(const id in rollsSelected) rollsSelected[id] = 0;
  for(const s in saucesSelected) saucesSelected[s] = 0;
  chopsticksCount = 1;
  document.getElementById("chopsticks-qty").value = 1;
  document.getElementById("notes").value = "";
  selectedPickupTime = "";
  const sel = document.getElementById("pickup-time");
  if(sel) sel.value = "";
  // re-render inputs to zeros
  // simpler: rebuild categories and sauces to update input values
  renderCategory("insideout-container", insideOutRollsData);
  renderCategory("maki-container", makiRollsData);
  renderCategory("onigiri-container", onigiriData);
  renderCategory("poke-container", PokeData);
  renderSauces();
  refreshCapacityInfo();
  updateSummary();
  const btn = document.getElementById("send-order");
  btn.disabled = false;
  btn.textContent = "שלח הזמנה / התחבר עם Google";
}

// ===== Initialization for Google after script loaded (if google available) =====
window.handleCredentialResponse = handleCredentialResponse;
if(window.google && google.accounts && GOOGLE_CLIENT_ID){
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });
}

// ===== end of script =====
