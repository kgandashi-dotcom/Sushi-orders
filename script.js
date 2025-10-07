/* ================== CONFIG ================== */
const SUPABASE_URL = 'https://oxjokdjwdvmmdtcvqvon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94am9rZGp3ZHZtbWR0Y3Zxdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzgwMzMsImV4cCI6MjA3NDY1NDAzM30.DmKp79UiPi9iOU50UutevdqRcPyREMUJ7NT5ZmBHDsg';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const GOOGLE_CLIENT_ID = '962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com';
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r';

/* ================== STORAGE / STATE ================== */
let bookedTimes = JSON.parse(localStorage.getItem('bookedTimes') || '[]');
let dailyRollCount = JSON.parse(localStorage.getItem('dailyRollCount') || '{}');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};

/* ================== DATA ================== */
/* full menu arrays (same as you provided earlier) */
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

/* ================== HELPERS ================== */
function $id(id){ return document.getElementById(id); }
function showMessage(txt,isError=true){
  const m = $id('messages'); m.textContent = txt; m.style.color = isError? '#b71c1c':'#2a7a2a';
  setTimeout(()=>{ if(m.textContent===txt) m.textContent=''; },6000);
}
function generateUUID(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){ const r=Math.random()*16|0, v=c==='x'?r:(r&0x3|0x8); return v.toString(16); }); }

/* ================== RENDER MENU ================== */
function createRollCard(item, containerId){
  const container = $id(containerId);
  const card = document.createElement('div'); card.className='roll-card'; card.dataset.id=item.id; card.dataset.price=item.price;
  const info = document.createElement('div'); info.className='info'; info.innerHTML=`<h3>${item.name}</h3><p>${item.description}</p>`;
  const controls = document.createElement('div'); controls.className='quantity-control';
  const btnMinus = document.createElement('button'); btnMinus.textContent='−';
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value=selectedRolls[item.id]||0; inputQty.readOnly=true;
  const btnPlus = document.createElement('button'); btnPlus.textContent='+';

  btnPlus.addEventListener('click', ()=>{ selectedRolls[item.id] = (selectedRolls[item.id]||0) + 1; inputQty.value = selectedRolls[item.id]; updateSummary(); });
  btnMinus.addEventListener('click', ()=>{ if((selectedRolls[item.id]||0)>0){ selectedRolls[item.id]--; inputQty.value = selectedRolls[item.id]; updateSummary(); } });

  controls.append(btnMinus, inputQty, btnPlus);
  card.append(info, controls);
  container.appendChild(card);
}

function createSauceCard(item){
  const container = $id('sauces-container');
  const card = document.createElement('div'); card.className='roll-card'; card.dataset.id=item.id; card.dataset.price=item.price;
  const info = document.createElement('div'); info.className='info'; info.innerHTML=`<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪</p>`;
  const controls = document.createElement('div'); controls.className='quantity-control';
  const btnMinus = document.createElement('button'); btnMinus.textContent='−';
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value=selectedSauces[item.id]||0; inputQty.readOnly=true;
  const btnPlus = document.createElement('button'); btnPlus.textContent='+';

  btnPlus.addEventListener('click', ()=>{ selectedSauces[item.id] = (selectedSauces[item.id]||0) + 1; inputQty.value = selectedSauces[item.id]; updateSummary(); });
  btnMinus.addEventListener('click', ()=>{ if((selectedSauces[item.id]||0)>0){ selectedSauces[item.id]--; inputQty.value = selectedSauces[item.id]; updateSummary(); } });

  controls.append(btnMinus, inputQty, btnPlus);
  card.append(info, controls);
  container.appendChild(card);
}

function initMenu(){
  ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls','sauces-container'].forEach(id=>{ const el=$id(id); if(el) el.innerHTML=''; });
  insideOutRollsData.forEach(r=>createRollCard(r,'insideout-rolls'));
  makiRollsData.forEach(r=>createRollCard(r,'maki-rolls'));
  onigiriData.forEach(r=>createRollCard(r,'onigiri-rolls'));
  pokeData.forEach(r=>createRollCard(r,'poke-rolls'));
  saucesData.forEach(s=>createSauceCard(s));
}

/* ================== PICKUP TIMES ================== */
function initPickupTimes(){
  const sel = $id('pickup-time'); sel.innerHTML = '<option value="">בחר שעה</option>';
  for(let h=19; h<=22; h++){
    for(let m of [0,30]){
      if(h===22 && m>30) continue;
      const label = `${String(h).padStart(2,'0')}:${m===0?'00':'30'}`;
      if(bookedTimes.includes(label)) continue;
      const opt = document.createElement('option'); opt.value=label; opt.textContent=label; sel.appendChild(opt);
    }
  }
  $id('pickup-note').textContent = bookedTimes.length ? `יש כבר ${bookedTimes.length} שעות תפוסות` : '';
}

/* ================== SUMMARY ================== */
function computeSummary(){
  let total=0, totalRolls=0;
  const rollsLines = [];
  const all = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData];
  for(const id in selectedRolls){
    const qty = selectedRolls[id] || 0;
    if(qty>0){
      const item = all.find(x=>x.id===id);
      if(!item) continue;
      rollsLines.push(`${item.name} x${qty} — ${item.price*qty}₪`);
      total += item.price*qty;
      totalRolls += qty;
    }
  }

  let sauceLines = [], usedSaucesCount=0;
  for(const id in selectedSauces){
    const qty = selectedSauces[id] || 0;
    if(qty>0){
      const s = saucesData.find(x=>x.id===id);
      sauceLines.push(`${s.name} x${qty}`);
      usedSaucesCount += qty;
    }
  }
  const extra = Math.max(0, usedSaucesCount - (totalRolls*2));
  const extraSauceCost = extra * 3;
  total += extraSauceCost;
  return { rollsLines, sauceLines, totalRolls, usedSaucesCount, extra, extraSauceCost, total };
}

function updateSummary(){
  const s = computeSummary();
  let text = `הזמנה חדשה:\n\n`;
  if(s.rollsLines.length) text += s.rollsLines.join('\n') + '\n\n'; else text += '(לא נבחרו רולים)\n\n';
  text += 'רטבים:\n';
  if(s.sauceLines.length) text += s.sauceLines.join('\n') + '\n'; else text += '(לא נבחרו רטבים)\n';
  if(s.extra>0) text += `\nעלות רטבים נוספים: ${s.extra} × 3₪ = ${s.extraSauceCost}₪\n`;
  text += `\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = $id('notes').value.trim(); if(notes) text += `\nהערות: ${notes}\n`;
  const pickup = $id('pickup-time').value; text += `\nשעת איסוף: ${pickup || '(לא נבחרה)'}\n`;
  if(currentUser) text += `\nלקוח: ${currentUser.name} (${currentUser.email||currentUser.phone||'אורח'})\n`;
  text += `\nסה"כ לתשלום: ${s.total}₪\n`;
  $id('order-summary').textContent = text;
  $id('send-order').disabled = !(s.totalRolls>0 && !!pickup);
}

/* ================== TABS ================== */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    // hide all menu-area children and only show target
    ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls'].forEach(id=>{
      const el = $id(id); if(el) el.style.display = 'none';
    });
    const t = tab.dataset.target;
    if(t && $id(t)) $id(t).style.display = 'flex';
    // if sauces selected, the sauces container is on the side — no extra show needed
  });
});

/* ================== CHOPSTICKS / INPUTS ================== */
$id('chopsticks-minus').addEventListener('click', ()=>{ if(chopsticksCount>1) chopsticksCount--; $id('chopsticks-qty').value = chopsticksCount; updateSummary(); });
$id('chopsticks-plus').addEventListener('click', ()=>{ chopsticksCount++; $id('chopsticks-qty').value = chopsticksCount; updateSummary(); });
$id('pickup-time').addEventListener('change', updateSummary);
$id('notes').addEventListener('input', updateSummary);

/* ================== AUTH & PROFILE ================== */
function openModal(modalId){ const m = $id(modalId); if(m){ m.style.display='flex'; m.setAttribute('aria-hidden','false'); } }
function closeModal(modalId){ const m = $id(modalId); if(m){ m.style.display='none'; m.setAttribute('aria-hidden','true'); } }

$id('profile-btn').addEventListener('click', ()=>{
  if(!currentUser){
    // prompt Google sign-in
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' });
    google.accounts.id.prompt();
    return;
  }
  openModal('profile-modal');
  $id('user-name').value = currentUser.name || '';
  $id('user-email').value = currentUser.email || '';
  $id('user-phone').value = currentUser.phone || '';
});

$id('close-profile').addEventListener('click', ()=> closeModal('profile-modal'));

/* login button (top) */
$id('auth-btn').addEventListener('click', ()=>{
  if(currentUser){
    // logout
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showMessage('התנתקת', false);
    closeModal('profile-modal');
    return;
  }
  // login with Google
  google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' });
  google.accounts.id.prompt();
});

/* google callback */
function handleCredentialResponse(response){
  try{
    const decoded = jwt_decode(response.credential);
    currentUser = {
      name: decoded.name || decoded.given_name || '',
      email: decoded.email || '',
      phone: (JSON.parse(localStorage.getItem('savedPhones')||'{}'))[decoded.email] || ''
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    showMessage(`שלום ${currentUser.name}`, false);
    // optionally show profile so user can edit phone
    openModal('profile-modal');
  }catch(e){
    console.error(e); showMessage('שגיאה בהתחברות Google', true);
  }
}

/* save user changes */
$id('save-user').addEventListener('click', ()=>{
  if(!currentUser) return;
  currentUser.name = $id('user-name').value.trim();
  currentUser.phone = $id('user-phone').value.trim();
  if(currentUser.phone && !/^05\d{8}$/.test(currentUser.phone)){
    showMessage('פורמט טלפון אינו תקין (05XXXXXXXX)', true); return;
  }
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  const map = JSON.parse(localStorage.getItem('savedPhones') || '{}');
  if(currentUser.email) map[currentUser.email] = currentUser.phone;
  localStorage.setItem('savedPhones', JSON.stringify(map));
  showMessage('פרטי משתמש נשמרו', false);
  closeModal('profile-modal');
});

/* logout button inside modal */
$id('logout-btn').addEventListener('click', ()=>{
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI();
  closeModal('profile-modal');
  showMessage('התנתקת', false);
});

/* update auth UI */
function updateAuthUI(){
  const authBtn = $id('auth-btn');
  if(currentUser){
    authBtn.textContent = 'התנתק';
    $id('profile-btn').textContent = 'פרופיל';
  } else {
    authBtn.textContent = 'התחבר';
    $id('profile-btn').textContent = 'פרופיל';
  }
  updateSummary();
}

/* ================== SEND FLOW ================== */
$id('send-order').addEventListener('click', ()=> openModal('send-choice-modal'));
$id('guest-btn').addEventListener('click', ()=> openModal('send-choice-modal'));
$id('cancel-send').addEventListener('click', ()=> closeModal('send-choice-modal'));

$id('continue-login').addEventListener('click', ()=> {
  google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' });
  google.accounts.id.prompt();
});
$id('continue-guest').addEventListener('click', ()=> { $id('guest-phone-row').style.display = 'block'; });
$id('guest-send-confirm').addEventListener('click', async ()=>{
  const phone = $id('guest-phone').value.trim();
  if(!/^05\d{8}$/.test(phone)){ showMessage('אנא הכנס טלפון תקין (05XXXXXXXX)', true); return; }
  const prevUser = currentUser;
  currentUser = { name: 'אורח', email: '', phone };
  await performPostLoginSend();
  currentUser = prevUser;
  closeModal('send-choice-modal');
});

/* ================== perform send ================== */
async function postToMake(payload){ return fetch(MAKE_WEBHOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); }

async function performPostLoginSend(){
  try{
    const s = computeSummary();
    if(s.totalRolls === 0){ showMessage('יש לבחור לפחות רול אחד', true); return; }
    const pickup = $id('pickup-time').value;
    if(!pickup){ showMessage('יש לבחור שעת איסוף', true); return; }
    const today = new Date().toISOString().slice(0,10);
    const todayCount = dailyRollCount[today] || 0;
    if(todayCount + s.totalRolls > 15){ showMessage(`לא ניתן להזמין — הושגו כבר ${todayCount} רולים היום (מקסימום 15).`, true); return; }
    if(bookedTimes.includes(pickup)){ showMessage('השעה תפוסה, בחר שעה אחרת', true); initPickupTimes(); return; }

    const orderUUID = generateUUID();
    const payload = {
      uuid: orderUUID,
      timestamp: new Date().toISOString(),
      user: currentUser || { name: 'אורח', email: '', phone: '' },
      pickupTime: pickup,
      chopsticks: chopsticksCount,
      notes: $id('notes').value.trim(),
      rolls: [],
      sauces: [],
      summary: $id('order-summary').textContent
    };

    const allCards = [...document.querySelectorAll('#insideout-rolls .roll-card'), ...document.querySelectorAll('#maki-rolls .roll-card'), ...document.querySelectorAll('#onigiri-rolls .roll-card'), ...document.querySelectorAll('#poke-rolls .roll-card')];
    allCards.forEach(card => {
      const id = card.dataset.id; const qty = selectedRolls[id] || 0;
      if(qty>0){
        const item = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData].find(x=>x.id===id);
        payload.rolls.push({ id, name: item.name, qty, price: item.price });
      }
    });

    Object.keys(selectedSauces).forEach(id=>{
      const qty = selectedSauces[id] || 0;
      if(qty>0){
        const sdata = saucesData.find(x=>x.id===id);
        payload.sauces.push({ id, name: sdata.name, qty, extraPrice: Math.max(0, qty - (payload.rolls.reduce((a,b)=>a+b.qty,0)*2)) * 3 });
      }
    });

    // send to Make
    await postToMake(payload);

    // insert to Supabase
    if(!SUPABASE_KEY || SUPABASE_KEY === '') {
      console.warn('Supabase key missing - skipping DB insert.');
    } else {
      const { error } = await supabase.from('Sushi').insert({
        Id: payload.uuid,
        created_at: payload.timestamp,
        User_name: payload.user.name,
        User_email: payload.user.email || '',
        User_phone: payload.user.phone || '',
        pickup_time: payload.pickupTime,
        notes: payload.notes,
        Rolls: payload.rolls,
        sauces: payload.sauces,
        chopsticks_count: payload.chopsticks,
        Summary: payload.summary
      });
      if(error){ console.error('Supabase insert error', error); showMessage('שגיאה בשמירה ל-DB', true); return; }
    }

    // update local booked times and daily counts
    bookedTimes.push(pickup); localStorage.setItem('bookedTimes', JSON.stringify(bookedTimes));
    dailyRollCount[today] = (dailyRollCount[today]||0) + s.totalRolls; localStorage.setItem('dailyRollCount', JSON.stringify(dailyRollCount));

    showMessage('ההזמנה נשלחה ונשמרה בהצלחה!', false);
    initPickupTimes();
    updateSummary();
  } catch(err){
    console.error(err); showMessage('שגיאה בשליחת ההזמנה', true);
  }
}

/* ================== HISTORY VIEW ================== */
$id('view-orders').addEventListener('click', async ()=>{
  if(!currentUser || (!currentUser.email && !currentUser.phone)){
    showMessage('אין פרטי משתמש כדי למצוא היסטוריה', true); return;
  }
  openModal('history-modal');
  $id('orders-list').textContent = 'טוען...';
  try{
    if(!SUPABASE_KEY || SUPABASE_KEY === ''){ $id('orders-list').textContent = 'אין חיבור ל-Supabase (מפתח לא הוזן).'; return; }
    let query = supabase.from('Sushi').select('*').order('created_at', { ascending:false });
    if(currentUser.email) query = query.eq('User_email', currentUser.email);
    else query = query.eq('User_phone', currentUser.phone);
    const { data, error } = await query;
    if(error){ console.error(error); $id('orders-list').textContent = 'שגיאה בטעינת ההיסטוריה'; return; }
    if(!data || data.length===0){ $id('orders-list').textContent = 'אין הזמנות קודמות'; return; }
    $id('orders-list').textContent = data.map(o => `${o.created_at}\n${o.Summary}`).join('\n\n-----\n\n');
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
  }

  initMenu();
  initPickupTimes();
  updateSummary();
  updateAuthUI();

  // show first category by default
  const firstTab = document.querySelectorAll('.tab')[0];
  if(firstTab) firstTab.click();
});

/* close modals on outside click */
document.querySelectorAll('.modal').forEach(modal=>{
  modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.style.display='none'; });
});

/* keep logged in if currentUser exists */
if(currentUser){
  updateAuthUI();
}
