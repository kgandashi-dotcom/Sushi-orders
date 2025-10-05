/* ========== CONFIG ========== */
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL   = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";
const ROLL_PREP_MINUTES  = 6;
const MAX_ROLLS_PER_DAY  = 15;
const WARNING_THRESHOLD  = 10; // when to warn remaining

/* ========== STATE ========== */
let currentUser = null;               // {name,email,phone}
let chopsticksCount = 1;
let selectedPickup = null;
let existingOrders = []; // load from localStorage to block times (simulate DB)
let cartSavedKey = "sushi_cart_v1";
let ordersSavedKey = "sushi_orders_v1";

/* ========== MENU DATA (מלא כל הפריטים שלך כאן) ========== */
const insideOutRollsData = [
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

const makiRollsData = [
  {id:"alfi", name:"רול אלפי", description:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי🌱", description:"מאקי בטטה ואבוקדו", price:25},
  {id:"snoopy", name:"רול סנופי🌱", description:"מאקי אושינקו וקנפיו", price:25}
];

const onigiriData = [
  {id:"rocky", name:"אוניגירי רוקי", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג'וני", description:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג'יזל🌱", description:"אבוקדו ובטטה", price:25}
];

const pokeData = [
  {id:"dog", name:"בול-דוג", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק", price:60},
  {id:"pit", name:"פיט-בול", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי", price:70},
  {id:"trir", name:"בול-טרייר🌱", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"},
  {id:"ginger", name:"ג'ינג'ר"},
  {id:"wasabi", name:"וואסבי"}
];

/* ========== DOM ========== */
const insideContainer = document.getElementById("insideout-container");
const makiContainer = document.getElementById("maki-container");
const onigiriContainer = document.getElementById("onigiri-container");
const pokeContainer = document.getElementById("poke-container");
const saucesContainer = document.getElementById("sauces-container");
const chopMinus = document.getElementById("chopsticks-minus");
const chopPlus  = document.getElementById("chopsticks-plus");
const chopQty   = document.getElementById("chopsticks-qty");
const notesEl   = document.getElementById("notes");
const pickupSel = document.getElementById("pickup-time");
const summaryEl = document.getElementById("order-summary");
const sendBtn   = document.getElementById("send-order");
const availabilityNote = document.getElementById("availability-note");
const statusMessage = document.getElementById("status-message");

/* ========== UTIL ========== */
function saveOrdersToStorage(){ localStorage.setItem(ordersSavedKey, JSON.stringify(existingOrders||[])); }
function loadOrdersFromStorage(){ existingOrders = JSON.parse(localStorage.getItem(ordersSavedKey) || "[]"); }
function saveCartToStorage(){
  const cart = {
    inside: insideOutRollsData.map(r=>({id:r.id,qty:r.qty||0})),
    maki: makiRollsData.map(r=>({id:r.id,qty:r.qty||0})),
    onigiri: onigiriData.map(r=>({id:r.id,qty:r.qty||0})),
    poke: pokeData.map(r=>({id:r.id,qty:r.qty||0})),
    sauces: saucesData.map(s=>({id:s.id,qty:s.qty||0})),
    chopsticks: chopsticksCount,
    notes: notesEl.value,
    pickup: pickupSel.value
  };
  localStorage.setItem(cartSavedKey, JSON.stringify(cart));
}
function loadCartFromStorage(){
  const cart = JSON.parse(localStorage.getItem(cartSavedKey)||"null");
  if(!cart) return;
  const setQty=(arr,stored)=>{
    arr.forEach(item=>{
      const s = stored.find(x=>x.id===item.id);
      if(s) item.qty = s.qty||0;
    });
  };
  setQty(insideOutRollsData, cart.inside||[]);
  setQty(makiRollsData, cart.maki||[]);
  setQty(onigiriData, cart.onigiri||[]);
  setQty(pokeData, cart.poke||[]);
  setQty(saucesData, cart.sauces||[]);
  chopsticksCount = cart.chopsticks || 1;
  chopQty.value = chopsticksCount;
  notesEl.value = cart.notes || "";
  if(cart.pickup) pickupSel.value = cart.pickup;
}

/* ========== RENDER CARDS ========== */
function createCard(item, container, isSauce=false){
  const card = document.createElement("div");
  card.className = isSauce ? "sauce-card" : "roll-card";

  const h = document.createElement("h3"); h.textContent = item.name;
  const p = document.createElement("p"); p.textContent = item.description || "";

  const qtyRow = document.createElement("div"); qtyRow.className = "quantity-row";
  const qtyControl = document.createElement("div"); qtyControl.className = "quantity-control";
  const minus = document.createElement("button"); minus.textContent = "−";
  const inp = document.createElement("input"); inp.type="number"; inp.value = item.qty||0; inp.readOnly = true;
  const plus = document.createElement("button"); plus.textContent = "+";

  minus.onclick = ()=>{
    if((item.qty||0) > 0){ item.qty--; inp.value=item.qty; onCartChanged(); }
  };
  plus.onclick = ()=>{
    item.qty = (item.qty||0) + 1; inp.value = item.qty; onCartChanged();
  };

  qtyControl.appendChild(minus); qtyControl.appendChild(inp); qtyControl.appendChild(plus);
  qtyRow.appendChild(qtyControl);

  card.appendChild(h);
  card.appendChild(p);
  card.appendChild(qtyRow);
  container.appendChild(card);

  // keep reference for computations
  item._inputEl = inp;
}

function renderMenu(){
  insideContainer.innerHTML = "";
  makiContainer.innerHTML = "";
  onigiriContainer.innerHTML = "";
  pokeContainer.innerHTML = "";
  saucesContainer.innerHTML = "";

  insideOutRollsData.forEach(r=>createCard(r, insideContainer));
  makiRollsData.forEach(r=>createCard(r, makiContainer));
  onigiriData.forEach(r=>createCard(r, onigiriContainer));
  pokeData.forEach(r=>createCard(r, pokeContainer));
  saucesData.forEach(s=>createCard(s, saucesContainer, true));
}

/* ========== TIMES & AVAILABILITY ========== */
function generateTimes(){
  const times = [];
  // from 19:00 to 22:30 step 30min
  let hour = 19, min = 0;
  while(true){
    if(!(hour===19 && min===0) && hour===23) break;
    const label = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    // only include 19:00? user previously wanted 19:30; here include 19:00 as you requested earlier — I'll include from 19:00 per final requirement
    // But ensure <=22:30
    if(label >= "19:00" && label <= "22:30") times.push(label);
    min += 30;
    if(min>=60){ min = 0; hour++; }
    if(hour>22 || (hour===22 && min>30)) break;
  }
  return times;
}

function refreshPickupOptions(){
  const times = generateTimes();
  pickupSel.innerHTML = "";
  times.forEach(t=>{
    // blocked check (existingOrders contains objects {pickupTime, totalRolls, date})
    const blocked = isTimeBlocked(t);
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t + (blocked ? " — תפוס" : "");
    if(blocked) opt.disabled = true;
    pickupSel.appendChild(opt);
  });
  // set selectedTime if previously saved and still available
  if(selectedPickup && !isTimeBlocked(selectedPickup)){
    pickupSel.value = selectedPickup;
  } else {
    selectedPickup = pickupSel.value || "";
  }
  updateSummary();
}

function isTimeBlocked(timeStr){
  // existingOrders stores orders for "today" only (date key omitted for demo)
  // For each existing order compute its prep window: start = pickupTime - totalRolls*ROLL_PREP_MINUTES
  const currMins = toMinutes(timeStr);
  return existingOrders.some(o=>{
    const oPickup = toMinutes(o.pickupTime);
    const prep = (o.totalRolls || 0) * ROLL_PREP_MINUTES;
    const start = oPickup - prep;
    const end = oPickup; // cannot schedule new order that starts during this window
    return (currMins >= start && currMins <= end);
  });
}
function toMinutes(t){ const [h,m]=t.split(":").map(Number); return h*60+m; }

/* ========== CART & SUMMARY ========== */
function getAllRolls(){
  return [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData];
}
function totalSelectedRolls(){
  return getAllRolls().reduce((s,r)=>s + (Number(r.qty)||0), 0);
}
function totalSauceCount(){
  return saucesData.reduce((s,x)=>s + (Number(x.qty)||0), 0);
}

function onCartChanged(){
  // update inputs and save
  getAllRolls().forEach(r=>{
    if(r._inputEl) r._inputEl.value = r.qty || 0;
  });
  saucesData.forEach(s=>{ if(s._inputEl) s._inputEl.value = s.qty || 0; });
  saveCartToStorage();
  refreshAvailabilityNote();
  updateSummary();
}

function refreshAvailabilityNote(){
  const tzLeft = MAX_ROLLS_PER_DAY - totalSelectedRolls() - existingOrders.reduce((s,o)=>s+ (o.totalRolls||0), 0);
  if(tzLeft <= 0){
    availabilityNote.textContent = `נחסום - הושגו ${MAX_ROLLS_PER_DAY} רולים היום. אין אפשרות להוסיף עוד.`;
    availabilityNote.className = "muted error";
  } else if(tzLeft <= (MAX_ROLLS_PER_DAY - WARNING_THRESHOLD)){
    availabilityNote.textContent = `נותרו ${tzLeft} רולים להזמנה היום — מהיר!`;
    availabilityNote.className = "muted";
  } else {
    availabilityNote.textContent = "";
  }
}

function updateSummary(){
  const notes = notesEl.value.trim();
  let text = `כמות צ'ופסטיקס: ${chopsticksCount}\n\n`;
  const rolls = getAllRolls().filter(r=> (r.qty||0) > 0 );
  if(rolls.length===0) text += "(לא נבחרו רולים)\n";
  else {
    text += "רולים:\n";
    rolls.forEach(r=>{
      text += `• ${r.name} x ${r.qty} = ${r.price * r.qty}₪\n`;
    });
  }
  const saucesSelected = saucesData.filter(s=> (s.qty||0) > 0);
  let total = rolls.reduce((s,r)=>s + r.price*r.qty, 0);

  // sauce pricing: up to 2 per roll free
  const sauceCount = saucesSelected.reduce((s,x)=>s + x.qty, 0);
  const freeAllowed = totalSelectedRolls()*2;
  const extraSauces = Math.max(0, sauceCount - freeAllowed);
  const extraSauceCost = extraSauces * 3;
  if(saucesSelected.length>0){
    text += `\nרטבים:\n`;
    saucesSelected.forEach(s=> text += `• ${s.name} x ${s.qty}\n`);
    text += `\nרטבים חינם עד ${freeAllowed}. רטבים נוספים: ${extraSauces} × 3₪ = ${extraSauceCost}₪\n`;
  }
  total += extraSauceCost;

  if(notes) text += `\nהערות: ${notes}\n`;

  if(pickupSel.value) {
    text += `\nשעת איסוף: ${pickupSel.value}\n`;
  } else {
    text += `\nשעת איסוף: (לא נבחרה)\n`;
  }

  if(currentUser){
    text += `\nלקוח: ${currentUser.name} (${currentUser.email})\n`;
    if(currentUser.phone) text += `טלפון: ${currentUser.phone}\n`;
  }

  text += `\nסה"כ לתשלום: ${total}₪\n`;
  summaryEl.textContent = text;
}

/* ========== PERSISTENCE (orders simulation) ========== */
function addOrderToExisting(order){
  // store minimal order summary for blocking times
  existingOrders.push({ pickupTime: order.pickupTime, totalRolls: order.totalRolls });
  saveOrdersToStorage();
  refreshPickupOptions();
}

/* ========== GOOGLE SIGN-IN SETUP ========== */
function initGoogle(){
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: googleCallback,
    auto_select: false,
  });
  // optional: render button somewhere (we use prompt on send)
  // google.accounts.id.renderButton(document.getElementById("gbtn"), { theme: "outline", size: "large" });
}
function googleCallback(resp){
  try {
    const decoded = jwt_decode(resp.credential);
    currentUser = {
      name: decoded.name || decoded.given_name || "",
      email: decoded.email || "",
      phone: decoded.phone_number || "" // often absent
    };
    // if no phone, ask user
    if(!currentUser.phone) {
      const manual = prompt("לא קיבלנו מספר טלפון מ‑Google. אנא הזן מספר טלפון למשלוח (כולל קידומת):");
      if(manual) currentUser.phone = manual.trim();
    }
    // persist minimal currentUser
    localStorage.setItem("sushi_user", JSON.stringify(currentUser));
    updateSummary();
    statusMessage.textContent = `מחובר כ־${currentUser.name}`;
    statusMessage.className = "muted success";
  } catch(e){
    console.error(e);
  }
}

/* ========== SEND FLOW ========== */
async function handleSendClick(){
  // validate cart
  const totalRolls = totalSelectedRolls();
  if(totalRolls === 0){
    alert("אנא בחר לפחות רול אחד לפני השליחה.");
    return;
  }
  // limit per day – existingOrders + totalRolls <= MAX_ROLLS_PER_DAY
  const alreadyToday = existingOrders.reduce((s,o)=>s + (o.totalRolls||0), 0);
  if(alreadyToday + totalRolls > MAX_ROLLS_PER_DAY){
    alert(`אין אפשרות – סה"כ רולים היום יחרוג מהמגבלה (${MAX_ROLLS_PER_DAY}). נשארו ${MAX_ROLLS_PER_DAY - alreadyToday} רולים.`);
    return;
  }

  // pickup selected
  const pickup = pickupSel.value;
  if(!pickup){
    alert("בחר שעת איסוף (Pickup).");
    return;
  }
  if(isTimeBlocked(pickup)){
    alert("השעה שנבחרה תפוסה. בחר שעה אחרת.");
    refreshPickupOptions();
    return;
  }

  // ensure user logged in via Google; if not, trigger prompt and exit (google callback will continue)
  if(!currentUser){
    // call google prompt; when successful, googleCallback will set currentUser. We'll not automatically re-call send here because callback async; instead, we request sign-in and tell user to press Send again (or you can auto-continue).
    google.accounts.id.prompt(notification=>{
      // if granted, googleCallback will be triggered and currentUser set
    });
    alert("אנא התחבר עם Google כדי להשלים את ההזמנה. לאחר ההתחברות לחץ שוב על 'התחבר ושלח הזמנה'.");
    return;
  }

  // build payload
  const rolls = getAllRolls().filter(r=>r.qty>0).map(r=>({ id:r.id, name:r.name, qty:r.qty, price:r.price }));
  const sauces = saucesData.filter(s=>s.qty>0).map(s=>({ id:s.id, name:s.name, qty:s.qty }));
  const totalSauces = sauces.reduce((s,x)=>s + x.qty, 0);
  const freeAllowed = totalRolls * 2;
  const extraSauces = Math.max(0, totalSauces - freeAllowed);
  const extraSauceCost = extraSauces * 3;
  const subtotalRolls = rolls.reduce((s,r)=>s + r.qty*r.price, 0);
  const totalPrice = subtotalRolls + extraSauceCost;

  const payload = {
    user: currentUser,
    rolls,
    sauces,
    chopsticks: chopsticksCount,
    notes: notesEl.value.trim(),
    pickupTime: pickup,
    totalRolls: totalRolls,
    totalPrice
  };

  // send to Make
  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error("Webhook returned not OK: " + res.status);
    // success
    alert("ההזמנה נשלחה בהצלחה! יישלחו אישורים במייל וב‑WhatsApp.");
    // add to local existingOrders so the time becomes blocked
    addOrderToExisting({ pickupTime: pickup, totalRolls: totalRolls });
    // save cart state (clear)
    clearCartAfterOrder();
    updateSummary();
  } catch(err){
    console.error(err);
    alert("שגיאה בשליחת ההזמנה. בדוק את חיבור ה‑Webhook/Make.");
  }
}

function clearCartAfterOrder(){
  // reset quantities
  getAllRolls().forEach(r=>{ r.qty = 0; if(r._inputEl) r._inputEl.value = 0; });
  saucesData.forEach(s=>{ s.qty = 0; if(s._inputEl) s._inputEl.value = 0; });
  chopsticksCount = 1; chopQty.value = 1;
  notesEl.value = "";
  saveCartToStorage();
}

/* ========== HELPERS ========== */
function getAllRolls(){ return [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData]; }

/* ========== INIT ========== */
function init(){
  loadOrdersFromStorage();
  renderMenu();
  loadCartFromStorage();
  renderMenu(); // re-render to attach inputs
  // after render attach input values
  getAllRolls().forEach(r=>{ if(r._inputEl) { r._inputEl.value = r.qty || 0; }});
  saucesData.forEach(s=>{ if(s._inputEl) s._inputEl.value = s.qty || 0; });
  chopQty.value = chopsticksCount;
  // pickup
  refreshPickupOptions();
  // events
  chopMinus.onclick = ()=>{ if(chopsticksCount>1) chopsticksCount--; chopQty.value = chopsticksCount; saveCartToStorage(); updateSummary(); };
  chopPlus.onclick  = ()=>{ chopsticksCount++; chopQty.value = chopsticksCount; saveCartToStorage(); updateSummary(); };
  notesEl.oninput = ()=>{ saveCartToStorage(); updateSummary(); };
  pickupSel.onchange = ()=>{ selectedPickup = pickupSel.value; saveCartToStorage(); updateSummary(); };
  sendBtn.onclick = handleSendClick;
  // init google
  initGoogle();
  // load persisted user if any
  const u = JSON.parse(localStorage.getItem("sushi_user")||"null");
  if(u){ currentUser = u; statusMessage.textContent = `מחובר: ${currentUser.name}`; statusMessage.className="muted success"; }
  refreshAvailabilityNote();
  updateSummary();
  // save on unload
  window.addEventListener("beforeunload", saveCartToStorage);
}

init();
