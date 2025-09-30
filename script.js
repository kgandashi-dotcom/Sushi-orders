/* ====== הגדרות ומשתנים ====== */
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com"; // החלף אם צריך
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r"; // ודא שזה ה-Webhook הנכון
const MAX_ROLLS_PER_DAY = 15;
const FREE_SAUCES_PER_ROLL = 2;
const EXTRA_SAUCE_PRICE = 3;

let currentUser = null;
let pendingOrderAfterLogin = false;

/* נתוני תפריט (מלאים) */
const insideOutRolls = [
  {id:"bingo", name:"רול בינגו", description:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
  {id:"luna", name:"רול לונה", description:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50},
  {id:"belgian", name:"רול ריי", description:"טרטר ספייסי טונה נא על רול מלפפון, עירית ואושינקו", price:55},
  {id:"crazy-bruno", name:"רול קרייזי ברונו", description:"דג לבן, טונה, סלמון בציפוי שומשום קלוי", price:60},
  {id:"happy-bruno", name:"רול האפי ברונו", description:"סלמון בציפוי שקדים קלויים ורוטב טריאקי", price:60},
  {id:"mila", name:"רול מילה", description:"בטטה, עירית ואבוקדו בעיטוף סלמון צרוב", price:50},
  {id:"newton", name:"רול ניוטון", description:"טונה אדומה, אבוקדו, בטטה בציפוי פנקו ורוטב בוטנים", price:55},
  {id:"oli", name:"רול אולי", description:"דג לבן, מלפפון, אבוקדו בציפוי שומשום", price:50},
  {id:"milli", name:"רול מילי", description:"מקל סורימי, דג לבן אפוי, אושינקו בציפוי פנקו", price:50},
  {id:"scar", name:"רול סקאר", description:"ספייסי סלמון אפוי עם אבוקדו, מלפפון ובטטה בעיטור מיונז וציפס", price:50},
  {id:"magi", name:"רול מגי🌱", description:"מלפפון, בטטה, עירית ואבוקדו בעיטור בטטה ורוטב בוטנים", price:40},
  {id:"tyson", name:"רול טייסון וקיילה", description:"סלמון נא, קנפיו, בטטה בעיטוף שבבי פנקו סגול", price:50},
  {id:"lucy", name:"רול לוסי", description:"סלמון נא, פטריות שיטאקי ואושינקו בציפוי טוביקו", price:55},
  {id:"billy", name:"רול בילי", description:"דג לבן צרוב, עירית, בטטה מצופה בפנקו", price:50},
  {id:"lucky", name:"רול לאקי", description:"טרטר ספייסי סלמון עם אבוקדו, מלפפון ועירית", price:50}
];

const makiRolls = [
  {id:"alfi", name:"רול אלפי", description:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי🌱", description:"מאקי בטטה ואבוקדו", price:25},
  {id:"snoopy", name:"רול סנופי🌱", description:"מאקי אושינקו וקנפיו", price:25}
];

const onigiriRolls = [
  {id:"rocky", name:"אוניגירי רוקי", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני", description:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱", description:"אבוקדו ובטטה", price:25}
];

const pokeRolls = [
  {id:"dog", name:"בול-דוג", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק", price:60},
  {id:"pit", name:"פיט-בול", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי", price:70},
  {id:"trir", name:"בול-טרייר🌱", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו", price:45}
];

const saucesList = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

/* מבנה בחירות - rollsSelected[rollId] = { qty: number, sauces: { sauceId: number } } */
let rollsSelected = {};
let chopsticksCount = 1;
let notesText = "";
let selectedPickupTime = "";

/* === עזרי תאריכים / localStorage להדגמה (מנוע כפילויות ומעקב כמות יומית) === */
function todayKey(){
  const d = new Date();
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}
function getDailyCount(){
  const key = "rolls_count_"+todayKey();
  return parseInt(localStorage.getItem(key) || "0", 10);
}
function addDailyCount(n){
  const key = "rolls_count_"+todayKey();
  const cur = getDailyCount();
  localStorage.setItem(key, String(cur + n));
}
function getBookedTimes(){
  const key = "booked_times_"+todayKey();
  try{
    return JSON.parse(localStorage.getItem(key) || "[]");
  }catch{
    return [];
  }
}
function addBookedTime(time){
  const key = "booked_times_"+todayKey();
  const arr = getBookedTimes();
  arr.push(time);
  localStorage.setItem(key, JSON.stringify(arr));
}

/* === UI בנייה === */
document.addEventListener("DOMContentLoaded", ()=>{

  // init pickup times 19:30 .. 22:30 (כולל)
  const times = ["19:30","20:00","20:30","21:00","21:30","22:00","22:30"];
  const sel = document.getElementById("pickup-time");
  times.forEach(t=>{
    const o = document.createElement("option"); o.value=t; o.textContent=t; sel.appendChild(o);
  });
  sel.addEventListener("change",(e)=>{ selectedPickupTime = e.target.value; updateSummary(); });

  // init chopsticks buttons
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

  // render menu by categories (keeps categories separate)
  renderCategory("insideout-container", insideOutRolls);
  renderCategory("maki-container", makiRolls);
  renderCategory("onigiri-container", onigiriRolls);
  renderCategory("poke-container", pokeRolls);

  // render sauces legend
  const legend = document.getElementById("sauces-legend");
  saucesList.forEach(s=>{
    const sp = document.createElement("div");
    sp.className = "sauce-legend-item";
    sp.textContent = `${s.name} (+${EXTRA_SAUCE_PRICE}₪ מעל ${FREE_SAUCES_PER_ROLL} חינם לכל רול)`;
    legend.appendChild(sp);
  });

  // send order button
  document.getElementById("send-order").addEventListener("click", handleSendClick);

  // init google id (we initialize but won't prompt automatically)
  if(window.google && google.accounts && GOOGLE_CLIENT_ID){
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }

  // show capacity info / remaining
  refreshCapacityInfo();

  // initial summary
  updateSummary();
});

/* renderCategory - כל רול מקבל UI עם כמות + ממשק רטבים per-roll */
function renderCategory(containerId, dataArray){
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  dataArray.forEach(item=>{
    // default selection structure
    rollsSelected[item.id] = {qty:0, sauces:{}};
    saucesList.forEach(s=> rollsSelected[item.id].sauces[s.id] = 0);

    const card = document.createElement("div");
    card.className = "roll-card";

    const h = document.createElement("h3"); h.textContent = `${item.name} - ${item.price}₪`; card.appendChild(h);
    const p = document.createElement("p"); p.textContent = item.description; card.appendChild(p);

    // quantity controls
    const qdiv = document.createElement("div"); qdiv.className = "quantity-control";
    const minus = document.createElement("button"); minus.textContent = "−";
    const input = document.createElement("input"); input.type="number"; input.value = 0; input.readOnly=true;
    const plus = document.createElement("button"); plus.textContent = "+";
    qdiv.append(minus, input, plus);
    card.appendChild(qdiv);

    minus.addEventListener("click", ()=>{
      if(rollsSelected[item.id].qty > 0) rollsSelected[item.id].qty--;
      input.value = rollsSelected[item.id].qty;
      updateSummary();
      refreshCapacityInfo();
    });
    plus.addEventListener("click", ()=>{
      rollsSelected[item.id].qty++;
      input.value = rollsSelected[item.id].qty;
      updateSummary();
      refreshCapacityInfo();
    });

    // sauces controls inside the roll card
    const saucesRow = document.createElement("div"); saucesRow.className = "sauces-row";
    saucesList.forEach(s=>{
      const mini = document.createElement("div"); mini.className = "sauce-mini";
      const minusS = document.createElement("button"); minusS.textContent = "−"; minusS.style.padding="2px 6px";
      const cnt = document.createElement("span"); cnt.textContent = "0"; cnt.style.minWidth="18px"; cnt.style.textAlign="center";
      const plusS = document.createElement("button"); plusS.textContent = "+"; plusS.style.padding="2px 6px";
      const lbl = document.createElement("div"); lbl.textContent = s.name; lbl.style.fontSize="0.82rem"; lbl.style.marginRight="6px";
      mini.append(minusS, cnt, plusS, lbl);
      saucesRow.appendChild(mini);

      // handlers for sauce +/- per-roll (these counts are per 1 roll unit)
      minusS.addEventListener("click", ()=>{
        if(rollsSelected[item.id].sauces[s.id] > 0){
          rollsSelected[item.id].sauces[s.id]--;
          cnt.textContent = rollsSelected[item.id].sauces[s.id];
          updateSummary();
        }
      });
      plusS.addEventListener("click", ()=>{
        // allow increment even if qty==0 — user can set sauces before adding quantity (applies per unit)
        rollsSelected[item.id].sauces[s.id]++;
        cnt.textContent = rollsSelected[item.id].sauces[s.id];
        updateSummary();
      });
    });
    card.appendChild(saucesRow);

    container.appendChild(card);
  });
}

/* חישוב וסיכום מפורט */
function updateSummary(){
  let lines = [];
  let totalRollsSelected = 0;
  let grandTotal = 0;

  // iterate over rollsSelected
  for(const rollId in rollsSelected){
    const sel = rollsSelected[rollId];
    if(!sel || sel.qty <= 0) continue;
    // find price & name
    const r = findRollById(rollId);
    if(!r) continue;
    totalRollsSelected += sel.qty;

    // calculate sauces per unit for this roll
    let saucesPerUnit = 0;
    let sauceDetails = [];
    for(const sId in sel.sauces){
      const cnt = sel.sauces[sId] || 0;
      if(cnt>0){
        saucesPerUnit += cnt;
        const sName = findSauceById(sId).name;
        sauceDetails.push(`${sName} x${cnt}`);
      }
    }
    const extraSaucesPerUnit = Math.max(0, saucesPerUnit - FREE_SAUCES_PER_ROLL);
    const extraPerUnitCost = extraSaucesPerUnit * EXTRA_SAUCE_PRICE;
    const unitTotal = r.price + extraPerUnitCost;
    const itemTotal = unitTotal * sel.qty;
    grandTotal += itemTotal;

    lines.push(`${r.name} — ${r.price}₪`);
    lines.push(`  כמות: ${sel.qty} — מחיר לפריט (עם רטבים נוספים): ${unitTotal}₪ -> סך לפריט: ${itemTotal}₪`);
    if(sauceDetails.length) lines.push(`  רטבים: ${sauceDetails.join(", ")}`);
  }

  // sauces chosen overall but not attached to qty? (we used per-roll approach)
  lines.push("");
  lines.push(`צ'ופסטיקס: ${chopsticksCount} (לא מחושב במחיר)`);
  const notes = document.getElementById("notes").value.trim();
  if(notes) lines.push(`הערות: ${notes}`);

  if(selectedPickupTime) lines.push(`שעת איסוף: ${selectedPickupTime}`); else lines.push(`שעת איסוף: לא נבחרה (חובה)`);

  if(currentUser) lines.push(`לקוח: ${currentUser.name} (${currentUser.email})`);
  lines.push("");
  lines.push(`סה"כ לתשלום (כולל תוספות רטבים): ${grandTotal}₪`);

  document.getElementById("order-summary").textContent = lines.join("\n");
  // enable/disable send button
  const sendBtn = document.getElementById("send-order");
  sendBtn.disabled = (totalRollsSelected === 0 || !selectedPickupTime);
}

/* חיפוש לפי id */
function findRollById(id){
  return insideOutRolls.concat(makiRolls, onigiriRolls, pokeRolls).find(r=>r.id===id);
}
function findSauceById(id){
  return saucesList.find(s=>s.id===id) || {name:id};
}

/* עדכון קיבולת והצגת הודעות */
function refreshCapacityInfo(){
  const daily = getDailyCount();
  const remaining = Math.max(0, MAX_ROLLS_PER_DAY - daily);
  const el = document.getElementById("capacity-info");
  el.innerHTML = `<span class="capacity-badge">נותרו ${remaining} מתוך ${MAX_ROLLS_PER_DAY} רולים להיום</span>`;
  if(remaining <= 5){
    el.innerHTML += ` <span style="color:#b23; margin-left:10px;">מומלץ למהר — נשארו ${remaining}</span>`;
  }
}

/* טיפול לחיצה על כפתור שליחה */
function handleSendClick(){
  // compute total rolls requested
  const totalRequested = Object.values(rollsSelected).reduce((acc, sel) => acc + (sel.qty || 0), 0);
  if(totalRequested === 0){
    alert("אנא בחר לפחות רול אחד לפני שליחה.");
    return;
  }
  if(!selectedPickupTime){
    alert("אנא בחר שעת איסוף.");
    return;
  }
  // check daily capacity
  const daily = getDailyCount();
  if(daily + totalRequested > MAX_ROLLS_PER_DAY){
    alert(`לא ניתן להזמין ${totalRequested} רולים — נשארו ${MAX_ROLLS_PER_DAY - daily} להיום.`);
    return;
  }
  // check booked times (localStorage demo)
  const booked = getBookedTimes();
  if(booked.includes(selectedPickupTime)){
    alert("האופציה שבחרת כבר תפוסה. בחר שעת איסוף אחרת או פנה אלינו.");
    return;
  }

  // if not logged in -> prompt Google sign-in, then send
  if(!currentUser){
    pendingOrderAfterLogin = true;
    if(window.google && GOOGLE_CLIENT_ID){
      google.accounts.id.prompt(); // shows the One Tap / signin dialog
    } else {
      alert("התחברות Google לא מאומתת בדפדפן. ודא ש-Google Identity נטען כראוי.");
    }
    return;
  }

  // all good -> send
  sendOrder();
}

/* שליחת ההזמנה ל-Make / עדכון localStorage / פתיחת וואטסאפ אופציונלית */
async function sendOrder(){
  try{
    // prepare payload with detailed items
    const items = [];
    let totalRolls = 0;
    let totalPrice = 0;
    for(const id in rollsSelected){
      const sel = rollsSelected[id];
      if(!sel || sel.qty <= 0) continue;
      const r = findRollById(id);
      let saucesPerUnit = 0;
      const sauceBreak = [];
      for(const sId in sel.sauces){
        const c = sel.sauces[sId] || 0;
        if(c>0){ saucesPerUnit += c; sauceBreak.push({id:sId, name: findSauceById(sId).name, count:c}); }
      }
      const extra = Math.max(0, saucesPerUnit - FREE_SAUCES_PER_ROLL);
      const extraCostPerUnit = extra * EXTRA_SAUCE_PRICE;
      const unitPrice = r.price + extraCostPerUnit;
      const itemTotal = unitPrice * sel.qty;
      items.push({
        id: r.id, name: r.name, qty: sel.qty, unitPrice: unitPrice, saucesPerUnit, sauceBreak, itemTotal
      });
      totalRolls += sel.qty;
      totalPrice += itemTotal;
    }

    const payload = {
      user: currentUser,
      items,
      chopsticks: chopsticksCount,
      notes: document.getElementById("notes").value.trim(),
      pickupTime: selectedPickupTime,
      orderDate: todayKey(),
      totalRolls,
      totalPrice
    };

    // disable button while sending
    const btn = document.getElementById("send-order");
    btn.disabled = true;
    btn.textContent = "שולח...";

    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      const text = await res.text().catch(()=>"(no body)");
      throw new Error("HTTP " + res.status + " " + text);
    }

    // update demo storage: mark the time booked & add daily count
    addBookedTime(selectedPickupTime);
    addDailyCount(totalRolls);
    refreshCapacityInfo();

    // optionally ask for phone if not available to open WhatsApp
    let phone = currentUser.phone || "";
    if(!phone){
      phone = prompt("אנא הכנס מספר טלפון לקבלת אישור בוואטסאפ (לדוגמה: 9725XXXXXXXX):", "");
      if(phone) currentUser.phone = phone;
    }
    // prepare whatsapp message
    let waText = `הזמנה התקבלה:\n`;
    waText += items.map(it => `${it.name} x${it.qty} — ${it.itemTotal}₪`).join("\n");
    waText += `\nסה"כ: ${totalPrice}₪\nשעת איסוף: ${selectedPickupTime}`;
    const encoded = encodeURIComponent(waText);

    // if phone provided -> open whatsapp web in new tab
    if(phone){
      // remove non-digit chars
      const digits = phone.replace(/\D/g,'');
      // open wa.me
      window.open(`https://wa.me/${digits}?text=${encoded}`, "_blank");
    }

    alert("ההזמנה נשלחה בהצלחה! נשלח אישור גם במייל (דרך Make).");

    // reset selections (keep localStorage bookings)
    resetSelections();

  }catch(err){
    console.error("sendOrder error:", err);
    alert("שגיאה בשליחת ההזמנה: " + (err.message || err));
    const btn = document.getElementById("send-order");
    btn.disabled = false;
    btn.textContent = "שלח הזמנה / התחבר עם Google";
  }
}

/* reset selections (UI + data) */
function resetSelections(){
  // reset rollsSelected qty & sauces
  for(const id in rollsSelected){
    rollsSelected[id].qty = 0;
    for(const s in rollsSelected[id].sauces) rollsSelected[id].sauces[s] = 0;
  }
  chopsticksCount = 1;
  document.getElementById("chopsticks-qty").value = 1;
  document.getElementById("notes").value = "";
  selectedPickupTime = "";
  document.getElementById("pickup-time").value = "";
  // re-render UI inputs (quick solution: rebuild categories)
  renderCategory("insideout-container", insideOutRolls);
  renderCategory("maki-container", makiRolls);
  renderCategory("onigiri-container", onigiriRolls);
  renderCategory("poke-container", pokeRolls);
  // re-attach send button text
  const btn = document.getElementById("send-order");
  btn.disabled = false;
  btn.textContent = "שלח הזמנה / התחבר עם Google";
  updateSummary();
}

/* Google callback */
function handleCredentialResponse(response){
  try{
    const decoded = jwt_decode(response.credential);
    currentUser = { name: decoded.name || decoded.given_name || "לקוח", email: decoded.email, phone: decoded.phone_number || "" };
    // if pending order -> send automatically
    if(pendingOrderAfterLogin){
      pendingOrderAfterLogin = false;
      sendOrder();
    } else {
      updateSummary();
      alert(`התחברת בהצלחה כ־ ${currentUser.name}`);
    }
  }catch(err){
    console.error("google decode error", err);
    alert("שגיאה בקריאת פרטי Google. נסה שוב.");
  }
}
