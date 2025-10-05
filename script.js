/*  script.js — קוד מלא מקצה לקצה
  חשוב:
   - ודא שה‑Google OAuth Client ID שלך רשום ב-Google Cloud Console under Authorized JS origins
   - ודא ש‑MAKE_WEBHOOK_URL נכון ומטפל ב‑payload לשליחת מייל/Whatsapp דרך Make
*/

const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL   = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r"; // שלך

// מסדי נתונים זמניים בצד לקוח (בפיתוח) — יאוחסנו ב‑localStorage
// bookedTimes: רשימת שעות שכבר “נשמרו” ככאלו שהוזמנו (format "HH:MM")
// dailyRollCount[date] = מספר רולים שהוזמנו באותו יום
let bookedTimes = JSON.parse(localStorage.getItem('bookedTimes') || '[]');
let dailyRollCount = JSON.parse(localStorage.getItem('dailyRollCount') || '{}');

let currentUser = null;
let chopsticksCount = 1;
let selectedRolls = {};    // id -> qty
let selectedSauces = {};   // id -> qty

// ----------------- נתוני תפריט (מלאים כפי שביקשת) -----------------
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
  {id:"scar", name:"רול סקאר - 50₪", description:"ספייסי סלמון אפוי עם אבוקדו, מלפפון ובטטה בעיטור מיונז וצ'יפס", price:50},
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

const pokeData = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק. מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי. מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו. מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:3},
  {id:"soy", name:"רוטב סויה", price:3},
  {id:"teriyaki", name:"רוטב טריאקי", price:3}
];

// ----------------- UI בנייה -----------------
function $id(id){ return document.getElementById(id); }

function createRollCard(item, containerId){
  const container = $id(containerId);
  const card = document.createElement('div');
  card.className = 'roll-card';
  card.dataset.id = item.id;
  card.dataset.price = item.price;

  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p>`;

  const controls = document.createElement('div');
  controls.className = 'quantity-control';
  const btnMinus = document.createElement('button'); btnMinus.textContent = '−';
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value=0; inputQty.readOnly=true;
  const btnPlus = document.createElement('button'); btnPlus.textContent = '+';

  btnPlus.addEventListener('click', ()=>{
    const id = item.id;
    selectedRolls[id] = (selectedRolls[id]||0) + 1;
    inputQty.value = selectedRolls[id];
    updateSummary();
  });
  btnMinus.addEventListener('click', ()=>{
    const id = item.id;
    if((selectedRolls[id]||0) > 0){
      selectedRolls[id]--; inputQty.value = selectedRolls[id];
      updateSummary();
    }
  });

  controls.appendChild(btnMinus); controls.appendChild(inputQty); controls.appendChild(btnPlus);
  card.appendChild(info); card.appendChild(controls);
  container.appendChild(card);
}

function createSauceCard(item){
  const container = $id('sauces-container');
  const card = document.createElement('div');
  card.className='roll-card';
  card.dataset.id = item.id;
  card.dataset.price = item.price;

  const info = document.createElement('div'); info.className='info';
  info.innerHTML = `<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪ לרוטב נוסף</p>`;

  const controls = document.createElement('div'); controls.className='quantity-control';
  const btnMinus = document.createElement('button'); btnMinus.textContent='−';
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value=0; inputQty.readOnly=true;
  const btnPlus = document.createElement('button'); btnPlus.textContent='+';

  btnPlus.addEventListener('click', ()=>{ const id=item.id; selectedSauces[id]=(selectedSauces[id]||0)+1; inputQty.value=selectedSauces[id]; updateSummary(); });
  btnMinus.addEventListener('click', ()=>{ const id=item.id; if((selectedSauces[id]||0)>0){ selectedSauces[id]--; inputQty.value=selectedSauces[id]; updateSummary(); } });

  controls.appendChild(btnMinus); controls.appendChild(inputQty); controls.appendChild(btnPlus);
  card.appendChild(info); card.appendChild(controls);
  container.appendChild(card);
}

// אתחול תפריט
function initMenu(){
  // נקי קודם
  ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls','sauces-container'].forEach(id=>{
    const el = $id(id); if(el) el.innerHTML='';
  });

  insideOutRollsData.forEach(r=> createRollCard(r,'insideout-rolls'));
  makiRollsData.forEach(r=> createRollCard(r,'maki-rolls'));
  onigiriData.forEach(r=> createRollCard(r,'onigiri-rolls'));
  pokeData.forEach(r=> createRollCard(r,'poke-rolls'));
  saucesData.forEach(s=> createSauceCard(s));
}

// ------------- שעות איסוף 19:00–22:30 חצי שעה --------------
function initPickupTimes(){
  const sel = $id('pickup-time');
  sel.innerHTML = '<option value="">בחר שעה</option>';
  for(let h=19; h<=22; h++){
    for(let m of [0,30]){
      if(h===22 && m>30) continue;
      const label = `${String(h).padStart(2,'0')}:${m===0?'00':'30'}`;
      if(bookedTimes.includes(label)) continue; // לא מוסיף כלל אם תפוס
      const opt = document.createElement('option');
      opt.value = label; opt.textContent = label;
      sel.appendChild(opt);
    }
  }
  $id('pickup-note').textContent = bookedTimes.length ? `יש כבר ${bookedTimes.length} שעות תפוסות` : '';
}

// ------------- סיכום וסכומים --------------
function computeSummary(){
  let total = 0;
  let totalRolls = 0;
  const rollsLines = [];

  // רולים מכל הקטגוריות
  const allDatas = [...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData];
  for(const id in selectedRolls){
    const qty = selectedRolls[id] || 0;
    if(qty>0){
      const item = allDatas.find(x=>x.id===id);
      if(!item) continue;
      rollsLines.push(`${item.name} x${qty} — ${item.price * qty}₪`);
      total += item.price * qty;
      totalRolls += qty;
    }
  }

  // רטבים — 2 חינם לכל רול
  let sauceLines = [];
  let extraSauceCost = 0;
  const freeAllowance = totalRolls * 2;
  let usedSaucesCount = 0;
  for(const id in selectedSauces){
    const qty = selectedSauces[id] || 0;
    if(qty>0){
      const item = saucesData.find(s=>s.id===id);
      sauceLines.push(`${item.name} x${qty}`);
      usedSaucesCount += qty;
    }
  }
  const extra = Math.max(0, usedSaucesCount - freeAllowance);
  extraSauceCost = extra * 3;
  total += extraSauceCost;

  return { rollsLines, sauceLines, totalRolls, usedSaucesCount, extra, extraSauceCost, total };
}

function updateSummary(){
  const s = computeSummary();
  let text = `הזמנה חדשה:\n\n`;

  if(s.rollsLines.length) text += s.rollsLines.join('\n') + '\n\n';
  else text += '(לא נבחרו רולים)\n\n';

  text += 'רטבים:\n';
  if(s.sauceLines.length) text += s.sauceLines.join('\n') + '\n';
  else text += '(לא נבחרו רטבים)\n';
  if(s.extra > 0) text += `\nעלות רטבים נוספים: ${s.extra} × 3₪ = ${s.extraSauceCost}₪\n`;

  text += `\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;

  const notes = $id('notes').value.trim();
  if(notes) text += `\nהערות: ${notes}\n`;

  const pickup = $id('pickup-time').value;
  text += `\nשעת איסוף: ${pickup || '(לא נבחרה)'}\n`;

  if(currentUser) text += `\nלקוח: ${currentUser.name} (${currentUser.email})\n`;

  text += `\nסה"כ לתשלום: ${s.total}₪\n`;

  $id('order-summary').textContent = text;

  // כפתור שליחה פעיל רק אם נבחרו רולים ושעה
  const sendBtn = $id('send-order');
  sendBtn.disabled = !(s.totalRolls>0 && !!pickup);
}

// ------------- עזרי UI --------------
$id('chopsticks-minus').addEventListener('click', ()=>{
  if(chopsticksCount>1) chopsticksCount--;
  $id('chopsticks-qty').value = chopsticksCount;
  updateSummary();
});
$id('chopsticks-plus').addEventListener('click', ()=>{
  chopsticksCount++;
  $id('chopsticks-qty').value = chopsticksCount;
  updateSummary();
});

// עדכון summary כשמחליפים שעת איסוף
$id('pickup-time').addEventListener('change', updateSummary);
$id('notes').addEventListener('input', updateSummary);
function checkAdminAndAddResetButton() {
  const adminEmail = 'kgandashi@gmail.com'; // מייל המנהל
  const existingBtn = document.getElementById('reset-orders');

  if(existingBtn) return;

  if(currentUser && currentUser.email === adminEmail){
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'אפס הזמנות';
    resetBtn.id = 'reset-orders';
    resetBtn.style.margin = '10px';
    resetBtn.style.backgroundColor = '#f44336';
    resetBtn.style.color = '#fff';
    resetBtn.style.padding = '6px 12px';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.cursor = 'pointer';

    resetBtn.addEventListener('click', ()=>{
      if(confirm('אתה בטוח שברצונך לאפס את כל ההזמנות?')){
        bookedTimes = [];
        dailyRollCount = {};
        localStorage.setItem('bookedTimes', JSON.stringify(bookedTimes));
        localStorage.setItem('dailyRollCount', JSON.stringify(dailyRollCount));
        initPickupTimes();
        updateSummary();
        alert('כל ההזמנות אופסו בהצלחה!');
      }
    });

    document.body.appendChild(resetBtn);
  }
}
// ------------- Google login flow --------------
function googleInit(){
  // לא קורא מיד — נקרא בלחיצה על כפתור
  // חשוב: Google Client ID חייב להיות מאושר ב‑Origins
}

function handleCredentialResponse(response){
  try{
    const decoded = jwt_decode(response.credential);
    currentUser = {
      name: decoded.name || decoded.given_name || 'Google User',
      email: decoded.email || ''
    };

    // לבדוק אם כבר שמור מספר טלפון למייל הזה
    const savedPhones = JSON.parse(localStorage.getItem('savedPhones') || '{}');
    if(savedPhones[currentUser.email]){
      currentUser.phone = savedPhones[currentUser.email]; // נטען מהאחסון
    } else {
      // בקשה ידנית עם בדיקה בסיסית של פורמט
      let phone = '';
      while(!phone || !/^\+9725\d{8}$/.test(phone)) {
        phone = prompt('לא נמצא מספר טלפון ב‑Google. הכנס טלפון למשלוח אישור (פורמט +9725XXXXXXXX):');
        if(phone === null) break; // ביטול
        if(!/^\+9725\d{8}$/.test(phone)){
          alert('פורמט לא חוקי. נסה שוב.');
        }
      }
      currentUser.phone = phone || '';
      if(currentUser.phone){
        savedPhones[currentUser.email] = currentUser.phone;
        localStorage.setItem('savedPhones', JSON.stringify(savedPhones));
      }
    }

    updateSummary();
    performPostLoginSend(); // שולח הזמנה אוטומטית
    checkAdminAndAddResetButton(); // מוסיף כפתור מנהל אם צריך
  }catch(e){
    console.error('decode error', e);
    showMessage('שגיאה בקריאת תשובת Google');
  }
}
// ------------- שליחה ל-Make (ושם תטפל ב-Twilio/Email) --------------
function postToMake(payload){
  return fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
}

function showMessage(txt, isError=true){
  const m = $id('messages');
  m.textContent = txt;
  m.style.color = isError ? '#b71c1c' : '#2a7a2a';
  setTimeout(()=>{ if(m.textContent === txt) m.textContent = ''; }, 6000);
}

// פעולה שקוראת אחרי שהמשתמש התחבר (או אם כבר היה מחובר)
function performPostLoginSend(){
  // בדיקות
  const s = computeSummary();
  if(s.totalRolls === 0){
    showMessage('יש לבחור לפחות רול אחד');
    return;
  }
  const pickup = $id('pickup-time').value;
  if(!pickup){ showMessage('יש לבחור שעת איסוף'); return; }

  // נבדוק הגבלת יומיים — מקסימום 15 רולים ליום
  const today = (new Date()).toISOString().slice(0,10);
  const todayCount = dailyRollCount[today] || 0;
  if(todayCount + s.totalRolls > 15){
    showMessage(`לא ניתן להזמין — הושגו כבר ${todayCount} רולים היום. המקסימום ליום הוא 15.`, true);
    return;
  }

  // נבדוק אם השעה תפוסה
  if(bookedTimes.includes(pickup)){
    showMessage('השעה שבחרת כבר תפוסה, בחר שעה אחרת', true);
    initPickupTimes(); // לרענן אופציות
    return;
  }

  const orderUUID = generateUUID(); 
  // הכנת payload לשליחה ל‑Make: כל המידע
  const payload = {
    uuid: orderUUID, 
    timestamp: new Date().toISOString(),
    user: currentUser,
    pickupTime: pickup,
    chopsticks: chopsticksCount,
    notes: $id('notes').value.trim(),
    rolls: [],
    sauces: [],
    summary: $id('order-summary').textContent
  };

  // לאסוף רולים
  const allCart = [...document.querySelectorAll('#insideout-rolls .roll-card'),
                   ...document.querySelectorAll('#maki-rolls .roll-card'),
                   ...document.querySelectorAll('#onigiri-rolls .roll-card'),
                   ...document.querySelectorAll('#poke-rolls .roll-card')];
  allCart.forEach(card=>{
    const id = card.dataset.id;
    const qty = selectedRolls[id] || 0;
    if(qty>0){
      const item = [...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData].find(x=>x.id===id);
      payload.rolls.push({id, name:item.name, qty, price:item.price});
    }
  });

  // רטבים
  Object.keys(selectedSauces).forEach(id=>{
    const qty = selectedSauces[id]||0;
    if(qty>0){
      const sdata = saucesData.find(s=>s.id===id);
      payload.sauces.push({id, name:sdata.name, qty, extraPrice: Math.max(0, qty - (payload.rolls.reduce((a,b)=>a+b.qty,0)*2)) * 3 });
    }
  });

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } 

  // לשלוח ל‑Make
  postToMake(payload)
    .then(res=>{
      if(!res.ok) throw new Error('Make returned ' + res.status);
      
      // הצלחה — עדכון bookedTimes לפי כל רול
      const totalRolls = payload.rolls.reduce((a,b)=>a+b.qty,0);
      for(let i=0; i<totalRolls; i++){
        bookedTimes.push(pickup);
      }
      localStorage.setItem('bookedTimes', JSON.stringify(bookedTimes));

      // עדכון מספר רולים יומי
      dailyRollCount[today] = (dailyRollCount[today]||0) + totalRolls;
      localStorage.setItem('dailyRollCount', JSON.stringify(dailyRollCount));

      showMessage('ההזמנה נשלחה בהצלחה! הודעת אישור תישלח במייל ובוואטסאפ.', false);
      
      // רענון אפשרויות זמנים
      initPickupTimes();
    })
    .catch(err=>{
      console.error(err);
      showMessage('שגיאה בשליחת ההזמנה ל‑Make. בדוק את ה‑Webhook.', true);
    });
}

// ------------- לחצן שליחה / התחברות --------------
$id('send-order').addEventListener('click', ()=>{
  // בדיקה בסיסית לפני קריאה לגוגל
  const totalSelectedRolls = Object.values(selectedRolls).reduce((a,b)=>a+(b||0),0);
  const pickup = $id('pickup-time').value;
  if(totalSelectedRolls === 0){
    showMessage('יש לבחור לפחות רול אחד', true); return;
  }
  if(!pickup){ showMessage('יש לבחור שעת איסוף', true); return; }

  // אם כבר מחובר — ישלח מיד
  if(currentUser){
    performPostLoginSend();
    return;
  }

  // אחרת — נתחבר באמצעות Google One‑Tap / SignIn
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
    ux_mode: 'popup' // מוודא שההתחברות לא תנווט את הדף
  });
  google.accounts.id.prompt(); // מציג את הprompt / popup
});

// ------------- התחלה כאשר DOM מוכן --------------
window.addEventListener('DOMContentLoaded', ()=>{
  initMenu();
  initPickupTimes();
  updateSummary();

  // מאזינים לכל לחיצה על כרטיסים כדי לעדכן סיכום (כיוון שאנו מעדכנים selectedRolls/selectedSauces)
  document.body.addEventListener('click', (e)=> {
    // גמיש — updateSummary בתוך event handlers של כפתורים כבר קורא אותו
    // כאן נשאיר למקרה שקורית פעולה אחרת
  });
});
