/* ================== CONFIG ================== */
/* TODO: החלף את הערכים הבאים במפתחות שלך אם אתה רוצה שימוש ב-Supabase ו-Google Sign-In */
const SUPABASE_URL = 'https://oxjokdjwdvmmdtcvqvon.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY_HERE'; // <-- הכנס כאן את המפתח שלך או השאר מחרוזת ריקה כדי לדלג על שמירה ב-DB
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // <-- הכנס כאן את Google OAuth Client ID או השאר ריק
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r';

/* supabase client (אם זמין) */
const supabase = (typeof supabase !== 'undefined' && SUPABASE_KEY && SUPABASE_KEY !== 'YOUR_SUPABASE_KEY_HERE')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* ================== STORAGE / STATE ================== */
let bookedTimes = JSON.parse(localStorage.getItem('bookedTimes') || '[]');
let dailyRollCount = JSON.parse(localStorage.getItem('dailyRollCount') || '{}');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let chopsticksCount = 1;
let selectedRolls = {};   // { rollId: qty }
let selectedSauces = {};  // { sauceId: qty }

/* ================== DATA (מלא) ================== */
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
  {id:"scar", name:"רול סקאר", description:"ספייסי סלמון אפוי עם אבוקדו, מלפפון ובטטה בעיטור מיונז וצ'יפס", price:50},
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
  {id:"johnny", name:"אוניגירי ג׳וני", description:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱", description:"אבוקדו ובטטה", price:25}
];

const pokeData = [
  {id:"dog", name:"בול-דוג", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק. מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי. מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו. מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:3},
  {id:"soy", name:"רוטב סויה", price:3},
  {id:"teriyaki", name:"רוטב טריאקי", price:3},
  {id:"ginger", name:"ג׳ינג׳ר", price:3},
  {id:"wasabi", name:"וואסאבי", price:3}
];

/* ================== HELPERS ================== */
function $id(id){ return document.getElementById(id); }
function showMessage(txt, isError = true){
  const m = $id('messages');
  if(!m) return;
  m.textContent = txt;
  m.style.color = isError ? '#b71c1c' : '#2a7a2a';
  setTimeout(()=>{ if(m.textContent === txt) m.textContent = ''; }, 6000);
}
function generateUUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
    const r = Math.random()*16|0; const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* ================== RENDER MENU ================== */
function createRollCard(item, containerId){
  const container = $id(containerId);
  if(!container) return;
  const card = document.createElement('div');
  card.className = 'roll-card';
  card.dataset.id = item.id;
  card.dataset.price = item.price;

  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<h3>${item.name} — ${item.price}₪</h3><p>${item.description}</p>`;

  const controls = document.createElement('div');
  controls.className = 'quantity-control';

  const btnMinus = document.createElement('button');
  btnMinus.textContent = '−';
  const inputQty = document.createElement('input');
  inputQty.type = 'number';
  inputQty.readOnly = true;
  inputQty.value = selectedRolls[item.id] || 0;
  const btnPlus = document.createElement('button');
  btnPlus.textContent = '+';

  btnPlus.addEventListener('click', ()=>{
    selectedRolls[item.id] = (selectedRolls[item.id] || 0) + 1;
    inputQty.value = selectedRolls[item.id];
    updateSummary();
  });

  btnMinus.addEventListener('click', ()=>{
    if((selectedRolls[item.id] || 0) > 0){
      selectedRolls[item.id]--;
      inputQty.value = selectedRolls[item.id];
      updateSummary();
    }
  });

  controls.append(btnMinus, inputQty, btnPlus);
  card.append(info, controls);
  container.appendChild(card);
}

function createSauceCard(item){
  const container = $id('sauces-container');
  if(!container) return;
  const card = document.createElement('div');
  card.className = 'roll-card';
  card.dataset.id = item.id;
  card.dataset.price = item.price;

  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪</p>`;

  const controls = document.createElement('div');
  controls.className = 'quantity-control';
  const btnMinus = document.createElement('button'); btnMinus.textContent = '−';
  const inputQty = document.createElement('input'); inputQty.type = 'number'; inputQty.readOnly = true; inputQty.value = selectedSauces[item.id] || 0;
  const btnPlus = document.createElement('button'); btnPlus.textContent = '+';

  btnPlus.addEventListener('click', ()=>{ selectedSauces[item.id] = (selectedSauces[item.id] || 0) + 1; inputQty.value = selectedSauces[item.id]; updateSummary(); });
  btnMinus.addEventListener('click', ()=>{ if((selectedSauces[item.id] || 0) > 0){ selectedSauces[item.id]--; inputQty.value = selectedSauces[item.id]; updateSummary(); } });

  controls.append(btnMinus, inputQty, btnPlus);
  card.append(info, controls);
  container.appendChild(card);
}

function initMenu(){
  ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls','sauces-container'].forEach(id=>{
    const el = $id(id);
    if(el) el.innerHTML = '';
  });
  insideOutRollsData.forEach(r => createRollCard(r, 'insideout-rolls'));
  makiRollsData.forEach(r => createRollCard(r, 'maki-rolls'));
  onigiriData.forEach(r => createRollCard(r, 'onigiri-rolls'));
  pokeData.forEach(r => createRollCard(r, 'poke-rolls'));
  saucesData.forEach(s => createSauceCard(s));
}

/* ================== PICKUP TIMES ================== */
function initPickupTimes(){
  const sel = $id('pickup-time');
  if(!sel) return;
  sel.innerHTML = '<option value="">בחר שעה</option>';
  for(let h = 19; h <= 22; h++){
    for(const m of [0,30]){
      if(h === 22 && m > 30) continue;
      const label = `${String(h).padStart(2,'0')}:${m === 0 ? '00' : '30'}`;
      if(bookedTimes.includes(label)) continue;
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = label;
      sel.appendChild(opt);
    }
  }
  $id('pickup-note').textContent = bookedTimes.length ? `יש כבר ${bookedTimes.length} שעות תפוסות` : '';
}

/* ================== SUMMARY ================== */
function computeSummaryObject(){
  const all = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData];
  let total = 0;
  let totalRolls = 0;
  const rolls = [];

  for(const id in selectedRolls){
    const qty = selectedRolls[id] || 0;
    if(qty <= 0) continue;
    const item = all.find(x => x.id === id);
    if(!item) continue;
    rolls.push({ id: item.id, name: item.name, qty, unitPrice: item.price, lineTotal: item.price * qty });
    total += item.price * qty;
    totalRolls += qty;
  }

  const sauces = [];
  let usedSaucesCount = 0;
  for(const id in selectedSauces){
    const qty = selectedSauces[id] || 0;
    if(qty <= 0) continue;
    const s = saucesData.find(x => x.id === id);
    if(!s) continue;
    sauces.push({ id: s.id, name: s.name, qty, unitPrice: s.price });
    usedSaucesCount += qty;
  }

  const freeSauces = totalRolls * 2;
  const extraSauces = Math.max(0, usedSaucesCount - freeSauces);
  const extraSauceCost = extraSauces * 3;
  total += extraSauceCost;

  return { rolls, sauces, totalRolls, usedSaucesCount, freeSauces, extraSauces, extraSauceCost, total };
}

function updateSummary(){
  const s = computeSummaryObject();
  let text = `הזמנה חדשה:\n\n`;
  if(s.rolls.length){
    s.rolls.forEach(r => text += `${r.name} x${r.qty} — ${r.lineTotal}₪\n`);
    text += '\n';
  } else {
    text += '(לא נבחרו רולים)\n\n';
  }

  text += 'רטבים:\n';
  if(s.sauces.length){
    s.sauces.forEach(su => text += `${su.name} x${su.qty}\n`);
  } else {
    text += '(לא נבחרו רטבים)\n';
  }

  if(s.extraSauces > 0){
    text += `\nעלות רטבים נוספים: ${s.extraSauces} × 3₪ = ${s.extraSauceCost}₪\n`;
  }

  text += `\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = $id('notes') ? $id('notes').value.trim() : '';
  if(notes) text += `\nהערות: ${notes}\n`;

  const pickup = $id('pickup-time') ? $id('pickup-time').value : '';
  text += `\nשעת איסוף: ${pickup || '(לא נבחרה)'}\n`;
  if(currentUser) text += `\nלקוח: ${currentUser.name} (${currentUser.email || currentUser.phone || 'אורח'})\n`;

  text += `\nסה"כ לתשלום: ${s.total}₪\n`;

  if($id('order-summary')) $id('order-summary').textContent = text;
  if($id('send-order')) $id('send-order').disabled = !(s.totalRolls > 0 && !!pickup);
}

/* ================== TABS & INPUTS ================== */
function setupTabs(){
  document.querySelectorAll('.tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.target;
      ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls'].forEach(id=>{
        const el = $id(id);
        if(!el) return;
        el.style.display = (id === target) ? 'flex' : 'none';
      });
      // sauces are in aside — keep visible
    });
  });
}

function setupChopsticks(){
  $id('chopsticks-minus').addEventListener('click', ()=>{ if(chopsticksCount > 1) chopsticksCount--; $id('chopsticks-qty').value = chopsticksCount; updateSummary(); });
  $id('chopsticks-plus').addEventListener('click', ()=>{ chopsticksCount++; $id('chopsticks-qty').value = chopsticksCount; updateSummary(); });
  if($id('pickup-time')) $id('pickup-time').addEventListener('change', updateSummary);
  if($id('notes')) $id('notes').addEventListener('input', updateSummary);
}

/* ================== AUTH & PROFILE ================== */
function openModal(modalId){ const m = $id(modalId); if(m){ m.style.display = 'flex'; m.setAttribute('aria-hidden','false'); } }
function closeModal(modalId){ const m = $id(modalId); if(m){ m.style.display = 'none'; m.setAttribute('aria-hidden','true'); } }

$id('profile-btn').addEventListener('click', ()=>{
  if(!currentUser){
    if(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE'){
      google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' });
      google.accounts.id.prompt();
    } else {
      showMessage('אין Google Client ID – הורד להתחברות או שלח כאורח.', true);
    }
    return;
  }
  openModal('profile-modal');
  if($id('user-name')) $id('user-name').value = currentUser.name || '';
  if($id('user-email')) $id('user-email').value = currentUser.email || '';
  if($id('user-phone')) $id('user-phone').value = currentUser.phone || '';
});

$id('close-profile').addEventListener('click', ()=> closeModal('profile-modal'));

$id('auth-btn').addEventListener('click', ()=>{
  if(currentUser){
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showMessage('התנתקת', false);
    return;
  }
  if(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE'){
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' });
    google.accounts.id.prompt();
  } else {
    showMessage('אין Google Client ID – אין אפשרות להתחבר באמצעות Google', true);
  }
});

window.handleCredentialResponse = function(response){
  try{
    const decoded = jwt_decode(response.credential);
    currentUser = { name: decoded.name || decoded.given_name || '', email: decoded.email || '', phone: '' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    showMessage(`שלום ${currentUser.name}`, false);
    openModal('profile-modal');
    if($id('user-name')) $id('user-name').value = currentUser.name || '';
    if($id('user-email')) $id('user-email').value = currentUser.email || '';
  } catch(e){
    console.error(e);
    showMessage('שגיאה בהתחברות Google', true);
  }
};

$id('save-user').addEventListener('click', ()=>{
  if(!currentUser) currentUser = {};
  currentUser.name = $id('user-name').value.trim();
  currentUser.phone = $id('user-phone').value.trim();
  if(currentUser.phone && !/^05\d{8}$/.test(currentUser.phone)){
    showMessage('פורמט טלפון אינו תקין (05XXXXXXXX)', true);
    return;
  }
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  closeModal('profile-modal');
  updateAuthUI();
  showMessage('פרטי משתמש נשמרו', false);
  updateSummary();
});

$id('logout-btn').addEventListener('click', ()=>{
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI();
  closeModal('profile-modal');
  showMessage('התנתקת', false);
});

function updateAuthUI(){
  const authBtn = $id('auth-btn');
  const profileBtn = $id('profile-btn');
  if(currentUser){
    if(authBtn) authBtn.textContent = 'התנתק';
    if(profileBtn) profileBtn.style.display = 'inline-block';
  } else {
    if(authBtn) authBtn.textContent = 'התחבר';
    if(profileBtn) profileBtn.style.display = 'inline-block';
  }
}

/* ================== SEND ORDER ================== */
$id('send-order').addEventListener('click', ()=> {
  if(!currentUser){
    openModal('send-choice-modal');
    return;
  }
  performSend();
});

$id('guest-btn').addEventListener('click', ()=> openModal('send-choice-modal'));
$id('cancel-send').addEventListener('click', ()=> closeModal('send-choice-modal'));
$id('continue-login').addEventListener('click', ()=> {
  if(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE'){
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' });
    google.accounts.id.prompt();
  } else {
    showMessage('אין Google Client ID', true);
  }
});
$id('continue-guest').addEventListener('click', ()=> { if($id('guest-phone-row')) $id('guest-phone-row').style.display = 'block'; });

$id('guest-send-confirm').addEventListener('click', async ()=>{
  const phone = $id('guest-phone').value.trim();
  if(!/^05\d{8}$/.test(phone)){ showMessage('אנא הכנס טלפון תקין (05XXXXXXXX)', true); return; }
  const prevUser = currentUser;
  currentUser = { name: 'אורח', email: '', phone };
  await performSend();
  currentUser = prevUser;
  closeModal('send-choice-modal');
});

async function performSend(){
  const s = computeSummaryObject();
  if(s.totalRolls === 0){ showMessage('יש לבחור לפחות רול אחד', true); return; }
  const pickup = $id('pickup-time').value;
  if(!pickup){ showMessage('יש לבחור שעת איסוף', true); return; }

  const today = new Date().toISOString().slice(0,10);
  const todayCount = dailyRollCount[today] || 0;
  if(todayCount + s.totalRolls > 15){
    showMessage(`לא ניתן להזמין — הושגו כבר ${todayCount} רולים היום (מקסימום 15).`, true);
    return;
  }

  if(bookedTimes.includes(pickup)){ showMessage('השעה תפוסה, בחר שעה אחרת', true); initPickupTimes(); return; }

  const orderUUID = generateUUID();
  const payload = {
    id: orderUUID,
    timestamp: new Date().toISOString(),
    user: currentUser || { name: 'אורח', email:'', phone:'' },
    pickupTime: pickup,
    chopsticks: chopsticksCount,
    notes: $id('notes').value.trim(),
    rolls: s.rolls,
    sauces: s.sauces,
    summary: $id('order-summary').textContent,
    total: s.total
  };

  try{
    // send to Make webhook (best-effort)
    try {
      await fetch(MAKE_WEBHOOK_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    } catch(e){
      console.warn('Make webhook failed', e);
    }

    // insert to Supabase if configured
    if(supabase){
      const { error } = await supabase.from('orders').insert([{
        id: payload.id,
        created_at: payload.timestamp,
        user_name: payload.user.name,
        user_email: payload.user.email || '',
        user_phone: payload.user.phone || '',
        pickup_time: payload.pickupTime,
        notes: payload.notes,
        rolls: payload.rolls,
        sauces: payload.sauces,
        chopsticks_count: payload.chopsticks,
        total: payload.total,
        summary: payload.summary
      }]);
      if(error){ console.error('Supabase insert error', error); showMessage('שגיאה בשמירה ל-DB', true); return; }
    }

    // update local booked times & daily count
    bookedTimes.push(pickup);
    localStorage.setItem('bookedTimes', JSON.stringify(bookedTimes));
    dailyRollCount[today] = (dailyRollCount[today] || 0) + s.totalRolls;
    localStorage.setItem('dailyRollCount', JSON.stringify(dailyRollCount));

    showMessage('ההזמנה נשלחה ונשמרה בהצלחה!', false);

    // reset selections
    selectedRolls = {};
    selectedSauces = {};
    chopsticksCount = 1;
    if($id('chopsticks-qty')) $id('chopsticks-qty').value = 1;
    if($id('notes')) $id('notes').value = '';
    if($id('pickup-time')) $id('pickup-time').value = '';

    initMenu();
    initPickupTimes();
    updateSummary();

  } catch(err){
    console.error(err);
    showMessage('שגיאה בשליחת ההזמנה', true);
  }
}

/* ================== HISTORY VIEW ================== */
$id('view-orders').addEventListener('click', async ()=>{
  if(!currentUser || (!currentUser.email && !currentUser.phone)){ showMessage('אין פרטי משתמש כדי למצוא היסטוריה', true); return; }
  openModal('history-modal');
  $id('orders-list').textContent = 'טוען…';
  if(!supabase){ $id('orders-list').textContent = 'אין חיבור ל-Supabase (מפתח לא הוזן).'; return; }
  try{
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if(currentUser.email) query = query.eq('user_email', currentUser.email);
    else query = query.eq('user_phone', currentUser.phone);
    const { data, error } = await query;
    if(error){ console.error(error); $id('orders-list').textContent = 'שגיאה בטעינת ההיסטוריה'; return; }
    if(!data || data.length === 0){ $id('orders-list').textContent = 'אין הזמנות קודמות'; return; }
    $id('orders-list').textContent = data.map(o => `${o.created_at}\n${o.summary}`).join('\n\n—–\n\n');
  } catch(e){
    console.error(e); $id('orders-list').textContent = 'שגיאה בטעינת ההיסטוריה';
  }
});
$id('close-history').addEventListener('click', ()=> closeModal('history-modal'));

/* ================== INIT ================== */
window.addEventListener('DOMContentLoaded', ()=>{
  // daily reset
  const today = new Date().toISOString().slice(0,10);
  if(localStorage.getItem('lastResetDate') !== today){
    bookedTimes = [];
    dailyRollCount = {};
    localStorage.setItem('bookedTimes', JSON.stringify(bookedTimes));
    localStorage.setItem('dailyRollCount', JSON.stringify(dailyRollCount));
    localStorage.setItem('lastResetDate', today);
  } else {
    bookedTimes = JSON.parse(localStorage.getItem('bookedTimes') || '[]');
    dailyRollCount = JSON.parse(localStorage.getItem('dailyRollCount') || '{}');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  initMenu();
  initPickupTimes();
  updateSummary();
  updateAuthUI();
  setupTabs();
  setupChopsticks();

  // default first tab show
  const firstTab = document.querySelectorAll('.tab')[0];
  if(firstTab) firstTab.click();

  // close modals on outside click
  document.querySelectorAll('.modal').forEach(modal=>{
    modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.style.display = 'none'; });
  });
});
