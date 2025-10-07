// ====== CONFIG — החלף בערכים שלך אם שונה ======
const SUPABASE_URL = 'https://oxjokdjwdvmmdtcvqvon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94am9rZGp3ZHZtbWR0Y3Zxdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzgwMzMsImV4cCI6MjA3NDY1NDAzM30.DmKp79UiPi9iOU50UutevdqRcPyREMUJ7NT5ZmBHDsg';
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";
const ADMIN_EMAIL = 'kgandashi@gmail.com';
// ===============================================

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// state
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};
let bookedTimes = []; // list of "HH:MM" for today
let dailyRollCount = 0;

// menu data (same as before)
const insideOutRollsData = [
  {id:"bingo", name:"רול בינגו - 50₪", description:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
  {id:"luna", name:"רול לונה - 50₪", description:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50},
  {id:"belgian", name:"רול ריי - 55₪", description:"טרטר ספייסי טונה נא על רול מלפפון, עירית ואושינקו", price:55},
  {id:"crazy-bruno", name:"רול קרייזי ברונו - 60₪", description:"דג לבן, טונה, סלמון בציפוי שומשום קלוי", price:60},
  {id:"happy-bruno", name:"רול האפי ברונו - 60₪", description:"סלמון בציפוי שקדים קלויים ורוטב טריאקי", price:60},
  {id:"mila", name:"רול מילה - 50₪", description:"בטטה, עירית ואבוקדו בעיטוף סלמון צרוב", price:50},
  {id:"newton", name:"רול ניוטון - 55₪", description:"טונה אדומה, אבוקדו, בטטה בציפוי פנקו ורוטב בוטנים", price:55},
  {id:"oli", name:"רול אולי - 50₪", description:"דג לבן, מלפפון, אבוקדו בציפוי שומשומר", price:50},
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

// helper
function $id(id){ return document.getElementById(id); }
function showMessage(txt,isError=true){
  const m = $id('messages');
  m.textContent = txt;
  m.style.color = isError ? '#b71c1c' : '#2a7a2a';
  setTimeout(()=>{ if(m.textContent === txt) m.textContent = ''; }, 6000);
}
function generateUUID(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){ const r=Math.random()*16|0, v=c==='x'?r:(r&0x3|0x8); return v.toString(16); }); }

// --------------- tabs ---------------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    document.querySelectorAll('.category-container').forEach(c=>c.style.display='none');
    const el = $id(target);
    if(el) el.style.display = 'flex';
  });
});

// --------------- Supabase realtime / load booked times ---------------
async function loadTodayBooking(){
  const today = new Date().toISOString().slice(0,10);
  try{
    const { data, error } = await supabase
      .from('BookingTimes')
      .select('*')
      .eq('date', today)
      .single();
    if(error && error.code !== 'PGRST116') console.error(error);
    if(data){
      bookedTimes = data.booked_times || [];
      dailyRollCount = data.daily_roll_count || 0;
    } else {
      bookedTimes = [];
      dailyRollCount = 0;
    }
    initPickupTimes();
  }catch(e){ console.error(e); }
}

async function saveTodayBooking(){
  const today = new Date().toISOString().slice(0,10);
  try{
    const { error } = await supabase.from('BookingTimes').upsert({
      date: today,
      booked_times: bookedTimes,
      daily_roll_count: dailyRollCount
    }, { onConflict: 'date' });
    if(error) console.error('saveTodayBooking error', error);
  }catch(e){ console.error(e); }
}

// subscribe to changes (Realtime)
function subscribeBookingTimesRealtime(){
  // older supabase-js (UMD) uses .from(...).on(...).subscribe()
  try{
    supabase
      .from(`BookingTimes:date=eq.${new Date().toISOString().slice(0,10)}`)
      .on('*', payload => {
        // refetch when change occurs
        loadTodayBooking();
      })
      .subscribe();
  }catch(e){
    // if subscription api differs, ignore silently; loadTodayBooking will still fetch on start
    console.warn('Realtime subscription failed (check supabase-js version):', e);
  }
}

// --------------- menu UI ---------------
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
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value = 0; inputQty.readOnly = true;
  const btnPlus = document.createElement('button'); btnPlus.textContent = '+';

  btnPlus.addEventListener('click', ()=> {
    const id = item.id;
    selectedRolls[id] = (selectedRolls[id]||0) + 1;
    inputQty.value = selectedRolls[id];
    updateSummary();
  });
  btnMinus.addEventListener('click', ()=> {
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
  const card = document.createElement('div'); card.className='roll-card';
  card.dataset.id = item.id; card.dataset.price = item.price;
  const info = document.createElement('div'); info.className='info';
  info.innerHTML = `<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪ לרוטב נוסף</p>`;
  const controls = document.createElement('div'); controls.className='quantity-control';
  const btnMinus = document.createElement('button'); btnMinus.textContent = '−';
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value=0; inputQty.readOnly=true;
  const btnPlus = document.createElement('button'); btnPlus.textContent = '+';

  btnPlus.addEventListener('click', ()=> { const id = item.id; selectedSauces[id] = (selectedSauces[id]||0)+1; inputQty.value = selectedSauces[id]; updateSummary(); });
  btnMinus.addEventListener('click', ()=> { const id = item.id; if((selectedSauces[id]||0)>0){ selectedSauces[id]--; inputQty.value = selectedSauces[id]; updateSummary(); } });

  controls.appendChild(btnMinus); controls.appendChild(inputQty); controls.appendChild(btnPlus);
  card.appendChild(info); card.appendChild(controls);
  container.appendChild(card);
}

function initMenu(){
  ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls','sauces-container'].forEach(id=>{
    const el = $id(id);
    if(el) el.innerHTML = '';
  });
  insideOutRollsData.forEach(r=> createRollCard(r,'insideout-rolls'));
  makiRollsData.forEach(r=> createRollCard(r,'maki-rolls'));
  onigiriData.forEach(r=> createRollCard(r,'onigiri-rolls'));
  pokeData.forEach(r=> createRollCard(r,'poke-rolls'));
  saucesData.forEach(s=> createSauceCard(s));
}

// --------------- pickup times ---------------
function initPickupTimes(){
  const sel = $id('pickup-time');
  sel.innerHTML = '<option value="">בחר שעה</option>';
  for(let h=19; h<=22; h++){
    for(const m of [0,30]){
      if(h === 22 && m > 30) continue;
      const label = `${String(h).padStart(2,'0')}:${m===0?'00':'30'}`;
      if(bookedTimes.includes(label)) continue;
      const opt = document.createElement('option');
      opt.value = label; opt.textContent = label;
      sel.appendChild(opt);
    }
  }
  $id('pickup-note').textContent = bookedTimes.length ? `יש כבר ${bookedTimes.length} שעות תפוסות` : '';
}

// --------------- summary ---------------
function computeSummary(){
  let total = 0;
  let totalRolls = 0;
  const rollsLines = [];
  const allDatas = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData];

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

  let sauceLines = [];
  let usedSaucesCount = 0;
  for(const id in selectedSauces){
    const qty = selectedSauces[id] || 0;
    if(qty>0){
      const item = saucesData.find(s=>s.id===id);
      sauceLines.push(`${item.name} x${qty}`);
      usedSaucesCount += qty;
    }
  }

  const freeAllowance = totalRolls * 2;
  const extra = Math.max(0, usedSaucesCount - freeAllowance);
  const extraSauceCost = extra * 3;
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
  $id('send-order').disabled = !(s.totalRolls > 0 && !!pickup);
}

// --------------- controls ---------------
$id('chopsticks-minus').addEventListener('click', ()=>{
  if(chopsticksCount > 1) chopsticksCount--;
  $id('chopsticks-qty').value = chopsticksCount;
  updateSummary();
});
$id('chopsticks-plus').addEventListener('click', ()=>{
  chopsticksCount++;
  $id('chopsticks-qty').value = chopsticksCount;
  updateSummary();
});
$id('pickup-time').addEventListener('change', updateSummary);
$id('notes').addEventListener('input', updateSummary);

// --------------- Google sign-in ---------------
function initGoogleButton(){
  if(window.google && google.accounts && google.accounts.id){
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp)=>{ // wrapper
        try{
          const decoded = jwt_decode(resp.credential);
          currentUser = { name: decoded.name || decoded.given_name || 'Google User', email: decoded.email || '', phone: '' };
          // try load phone mapping
          const savedPhones = JSON.parse(localStorage.getItem('savedPhones') || '{}');
          if(savedPhones[currentUser.email]) currentUser.phone = savedPhones[currentUser.email];
          // if no phone, ask once
          if(!currentUser.phone){
            let phone = '';
            while(!phone || !/^05\d{8}$/.test(phone)){
              phone = prompt('הכנס טלפון למשלוח אישור (05XXXXXXXX):');
              if(phone === null) break;
              if(!/^05\d{8}$/.test(phone)) alert('פורמט לא חוקי — נסה שוב.');
            }
            if(phone){
              currentUser.phone = phone;
              savedPhones[currentUser.email] = phone;
              localStorage.setItem('savedPhones', JSON.stringify(savedPhones));
            }
          }
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          updateUIAfterLogin();
        }catch(e){ console.error('decode error', e); showMessage('שגיאה בקריאת Google', true); }
      },
      ux_mode: 'popup'
    });
    google.accounts.id.renderButton($id('login-btn'), { theme: 'outline', size: 'large' });
  } else {
    console.warn('Google Identity not ready yet.');
  }
}

function updateUIAfterLogin(){
  $id('login-btn').style.display = 'none';
  $id('profile-btn').style.display = 'inline-block';
  $id('logout-btn').style.display = 'inline-block';
  checkAdminButton();
  updateSummary();
}

$id('logout-btn').addEventListener('click', ()=>{
  currentUser = null;
  localStorage.removeItem('currentUser');
  $id('login-btn').style.display = 'block';
  $id('profile-btn').style.display = 'none';
  $id('logout-btn').style.display = 'none';
  // hide profile panel if open
  $id('profile-panel').style.display = 'none';
  updateSummary();
});

// --------------- profile panel & history ---------------
$id('profile-btn').addEventListener('click', async ()=>{
  const panel = $id('profile-panel');
  if(panel.style.display === 'block') { panel.style.display = 'none'; return; }

  if(!currentUser){
    showMessage('יש להתחבר כדי לראות פרופיל והיסטוריה', true);
    return;
  }

  // fill profile info
  const infoDiv = $id('profile-info');
  infoDiv.innerHTML = `<strong>${currentUser.name}</strong><br>${currentUser.email || ''}<br>${currentUser.phone || ''}`;

  // load history from Supabase (table Sush i)
  try{
    const { data, error } = await supabase
      .from('Sushi')
      .select('*')
      .eq('User_email', currentUser.email)
      .order('created_at', { ascending: false })
      .limit(50);
    if(error){ console.error(error); showMessage('שגיאה בטעינת היסטוריה', true); return; }
    const histDiv = $id('order-history');
    histDiv.innerHTML = '';
    if(!data || data.length === 0){ histDiv.textContent = 'אין הזמנות קודמות.'; }
    else {
      data.forEach(row => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const created = new Date(row.created_at).toLocaleString('he-IL');
        item.innerHTML = `<div><strong>${created}</strong> — איסוף: ${row.pickup_time || '-'} — טלפון: ${row.User_phone || '-'}</div>
          <div>סה"כ רולים: ${(row.Rolls || []).reduce((a,b)=>a+b.qty,0) || 0} — סה"כ: ${row.Summary ? '' : ''}</div>`;
        histDiv.appendChild(item);
      });
    }
  }catch(e){ console.error(e); showMessage('שגיאה בטעינת היסטוריה', true); return; }

  panel.style.display = 'block';
});

// --------------- send order (Make + Supabase) ---------------
async function sendOrder(){
  const s = computeSummary();
  if(s.totalRolls === 0){ showMessage('יש לבחור לפחות רול אחד', true); return; }
  const pickup = $id('pickup-time').value;
  if(!pickup){ showMessage('יש לבחור שעת איסוף', true); return; }

  // daily limit
  if(dailyRollCount + s.totalRolls > 15){
    showMessage(`לא ניתן להזמין — כבר הוזמנו ${dailyRollCount} רולים היום (מקסימום 15).`, true);
    return;
  }

  if(bookedTimes.includes(pickup)){
    showMessage('השעה תפוסה — בחר שעה אחרת', true);
    initPickupTimes();
    return;
  }

  // if not logged in => ask send as guest
  if(!currentUser){
    const asGuest = confirm('אתה לא מחובר — לשלוח כאורח עם מספר טלפון?');
    if(!asGuest) return;
    let phone = '';
    while(!phone || !/^05\d{8}$/.test(phone)){
      phone = prompt('הכנס טלפון למשלוח (05XXXXXXXX):');
      if(phone === null) return;
      if(!/^05\d{8}$/.test(phone)) alert('פורמט לא חוקי — נסה שוב');
    }
    currentUser = { name: 'אורח', email: '', phone };
  }

  // payload build
  const orderUUID = generateUUID();
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

  // collects rolls
  const allCards = [...document.querySelectorAll('#insideout-rolls .roll-card'),
                    ...document.querySelectorAll('#maki-rolls .roll-card'),
                    ...document.querySelectorAll('#onigiri-rolls .roll-card'),
                    ...document.querySelectorAll('#poke-rolls .roll-card')];
  allCards.forEach(card => {
    const id = card.dataset.id;
    const qty = selectedRolls[id] || 0;
    if(qty > 0){
      const item = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData].find(x=>x.id===id);
      payload.rolls.push({ id, name: item.name, qty, price: item.price });
    }
  });

  // sauces
  Object.keys(selectedSauces).forEach(id=>{
    const qty = selectedSauces[id] || 0;
    if(qty>0){
      const sdata = saucesData.find(s=>s.id===id);
      payload.sauces.push({
        id, name: sdata.name, qty,
        extraPrice: Math.max(0, qty - (payload.rolls.reduce((a,b)=>a+b.qty,0) * 2)) * 3
      });
    }
  });

  // send to Make webhook
  try{
    await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  }catch(e){
    console.error('Make webhook error', e);
    showMessage('שגיאה בשליחת Webhook', true);
    return;
  }

  // insert to Supabase — טבלת Sushi
  try{
    const { error } = await supabase.from('Sushi').insert({
      Id: payload.uuid,
      created_at: payload.timestamp,
      User_name: payload.user.name || '',
      User_email: payload.user.email || '',
      User_phone: payload.user.phone || '',
      pickup_time: payload.pickupTime,
      notes: payload.notes,
      Rolls: payload.rolls,
      sauces: payload.sauces,
      chopsticks_count: payload.chopsticks,
      Summary: payload.summary
    });
    if(error){ console.error('Supabase insert error', error); showMessage('שגיאה בשמירת ההזמנה', true); return; }
  }catch(e){
    console.error(e);
    showMessage('שגיאה בשמירת ההזמנה', true);
    return;
  }

  // update bookedTimes/dailyRollCount and save to Supabase
  bookedTimes.push(pickup);
  dailyRollCount += s.totalRolls;
  await saveTodayBooking();

  showMessage('ההזמנה נשלחה ונשמרה בהצלחה!', false);

  // reset UI
  selectedRolls = {}; selectedSauces = {}; chopsticksCount = 1;
  $id('chopsticks-qty').value = 1;
  $id('notes').value = '';
  $id('pickup-time').value = '';
  initPickupTimes();
  updateSummary();
}

// --------------- admin reset button ---------------
function checkAdminButton(){
  if(currentUser && currentUser.email === ADMIN_EMAIL){
    if(!$id('reset-orders')){
      const btn = document.createElement('button');
      btn.id = 'reset-orders';
      btn.textContent = 'אפס הזמנות היום';
      btn.style.marginLeft = '8px';
      btn.style.background = '#f44336';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.padding = '6px 10px';
      btn.style.borderRadius = '6px';
      btn.addEventListener('click', async ()=>{
        if(!confirm('למחוק את כל ההזמנות/שעות של היום?')) return;
        const today = new Date().toISOString().slice(0,10);
        try{
          await supabase.from('BookingTimes').upsert({ date: today, booked_times: [], daily_roll_count: 0 }, { onConflict: 'date' });
          bookedTimes = []; dailyRollCount = 0;
          initPickupTimes(); updateSummary();
          showMessage('איפוס בוצע', false);
        }catch(e){ console.error(e); showMessage('שגיאה באיפוס', true); }
      });
      document.querySelector('header .user-buttons').appendChild(btn);
    }
  } else {
    const ex = $id('reset-orders');
    if(ex) ex.remove();
  }
}

// --------------- init bootstrap ---------------
async function bootstrap(){
  initMenu();
  await loadTodayBooking();
  updateSummary();

  // load stored user
  const stored = localStorage.getItem('currentUser');
  if(stored){
    try{ currentUser = JSON.parse(stored); updateUIAfterLogin(); }catch(e){ currentUser = null; }
  }

  // init Google button
  initGoogleButton();

  // subscribe realtime (best-effort)
  subscribeBookingTimesRealtime();

  // handlers
  $id('send-order').addEventListener('click', sendOrder);
  $id('profile-btn').style.display = currentUser ? 'inline-block' : 'none';
  $id('logout-btn').style.display = currentUser ? 'inline-block' : 'none';
  checkAdminButton();
}

window.addEventListener('DOMContentLoaded', bootstrap);
/* ========== STATE ========== */
let bookedTimes = JSON.parse(localStorage.getItem('bookedTimes') || '[]');
let dailyRollCount = JSON.parse(localStorage.getItem('dailyRollCount') || '{}');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};

/* ========== DATA ========== */
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

/* ========== HELPERS ========== */
function $id(id){ return document.getElementById(id); }
function showToast(msg, isError = false){
  const t = $id('messages');
  t.textContent = msg;
  t.style.display = 'block';
  t.style.background = isError ? '#fff0f0' : '#f0fff4';
  t.style.border = isError ? '1px solid #f5c6c6' : '1px solid #c6f5da';
  setTimeout(()=>{ t.style.display = 'none'; }, 3500);
}
function generateUUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){ const r=Math.random()*16|0; const v=c==='x'?r:(r&0x3|0x8); return v.toString(16); });
}

/* ========== RENDER UI ========== */
function createRollCard(item, containerId){
  const container = $id(containerId);
  const card = document.createElement('div'); card.className = 'roll-card'; card.dataset.id = item.id;
  const info = document.createElement('div'); info.className = 'info';
  info.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p>`;
  const controls = document.createElement('div'); controls.className = 'quantity-control';
  const minus = document.createElement('button'); minus.textContent = '−';
  const qty = document.createElement('input'); qty.type='number'; qty.value = selectedRolls[item.id] || 0; qty.readOnly=true;
  const plus = document.createElement('button'); plus.textContent = '+';

  plus.addEventListener('click', ()=>{ selectedRolls[item.id] = (selectedRolls[item.id]||0)+1; qty.value = selectedRolls[item.id]; updateSummary(); });
  minus.addEventListener('click', ()=>{ if((selectedRolls[item.id]||0)>0){ selectedRolls[item.id]--; qty.value = selectedRolls[item.id]; updateSummary(); } });

  controls.append(minus, qty, plus);
  card.append(info, controls);
  container.appendChild(card);
}

function createSauceCard(item){
  const container = $id('sauces-container');
  const card = document.createElement('div'); card.className='roll-card'; card.dataset.id = item.id;
  const info = document.createElement('div'); info.className='info'; info.innerHTML = `<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪</p>`;
  const controls = document.createElement('div'); controls.className='quantity-control';
  const minus = document.createElement('button'); minus.textContent='−';
  const qty = document.createElement('input'); qty.type='number'; qty.value = selectedSauces[item.id]||0; qty.readOnly=true;
  const plus = document.createElement('button'); plus.textContent = '+';

  plus.addEventListener('click', ()=>{ selectedSauces[item.id] = (selectedSauces[item.id]||0)+1; qty.value = selectedSauces[item.id]; updateSummary(); });
  minus.addEventListener('click', ()=>{ if((selectedSauces[item.id]||0)>0){ selectedSauces[item.id]--; qty.value = selectedSauces[item.id]; updateSummary(); } });

  controls.append(minus, qty, plus);
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

/* ========== PICKUP TIMES ========== */
function initPickupTimes(){
  const sel = $id('pickup-time'); sel.innerHTML = '<option value="">בחר שעה</option>';
  for(let h=19; h<=22; h++){
    for(let m of [0,30]){
      if(h===22 && m>30) continue;
      const label = `${String(h).padStart(2,'0')}:${m===0?'00':'30'}`;
      if(bookedTimes.includes(label)) continue;
      const opt = document.createElement('option'); opt.value = label; opt.textContent = label; sel.appendChild(opt);
    }
  }
  $id('pickup-note').textContent = bookedTimes.length ? `יש כבר ${bookedTimes.length} שעות תפוסות` : '';
}

/* ========== SUMMARY ========== */
function computeSummary(){
  let total=0, totalRolls=0; const rollsLines=[]; const all = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData];
  for(const id in selectedRolls){
    const qty = selectedRolls[id]||0; if(qty>0){ const item = all.find(x=>x.id===id); if(!item) continue; rollsLines.push(`${item.name} x${qty} — ${item.price*qty}₪`); total += item.price*qty; totalRolls += qty; }
  }
  let sauceLines=[], usedSaucesCount=0;
  for(const id in selectedSauces){ const q = selectedSauces[id]||0; if(q>0){ const s = saucesData.find(x=>x.id===id); sauceLines.push(`${s.name} x${q}`); usedSaucesCount += q; } }
  const extra = Math.max(0, usedSaucesCount - (totalRolls*2)); const extraSauceCost = extra * 3; total += extraSauceCost;
  return { rollsLines, sauceLines, totalRolls, usedSaucesCount, extra, extraSauceCost, total };
}

function updateSummary(){
  const s = computeSummary();
  const short = s.rollsLines.length ? s.rollsLines[0] : '(לא נבחרו פריטים)';
  $id('summary-short').textContent = `${short} • ${s.total}₪`;
  let text = `הזמנה חדשה:\n\n`;
  if(s.rollsLines.length) text += s.rollsLines.join('\n') + '\n\n'; else text += '(לא נבחרו רולים)\n\n';
  text += 'רטבים:\n'; if(s.sauceLines.length) text += s.sauceLines.join('\n') + '\n'; else text += '(לא נבחרו רטבים)\n';
  if(s.extra>0) text += `\nעלות רטבים נוספים: ${s.extra} × 3₪ = ${s.extraSauceCost}₪\n`;
  text += `\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = $id('notes').value.trim(); if(notes) text += `\nהערות: ${notes}\n`;
  const pickup = $id('pickup-time').value; text += `\nשעת איסוף: ${pickup || '(לא נבחרה)'}\n`;
  if(currentUser) text += `\nלקוח: ${currentUser.name} (${currentUser.email||currentUser.phone||'אורח'})\n`;
  text += `\nסה"כ לתשלום: ${s.total}₪\n`;
  $id('order-summary').textContent = text;
  $id('send-order').disabled = !(s.totalRolls>0 && !!pickup);
}

/* ========== TABS ========== */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls'].forEach(id=>{ const el=$id(id); if(el) el.style.display='none'; });
    const target = tab.dataset.target; if(target && $id(target)) $id(target).style.display='flex';
  });
});

/* ========== INPUTS ========== */
$id('chopsticks-minus').addEventListener('click', ()=>{ if(chopsticksCount>1) chopsticksCount--; $id('chopsticks-qty').value = chopsticksCount; updateSummary(); });
$id('chopsticks-plus').addEventListener('click', ()=>{ chopsticksCount++; $id('chopsticks-qty').value = chopsticksCount; updateSummary(); });
$id('pickup-time').addEventListener('change', updateSummary);
$id('notes').addEventListener('input', updateSummary);

/* ========== AUTH & PROFILE ========== */
function openProfile(){ const s=$id('profile-screen'); s.classList.remove('off'); s.classList.add('on'); s.style.display='flex'; }
function closeProfile(){ const s=$id('profile-screen'); s.classList.remove('on'); s.classList.add('off'); setTimeout(()=>s.style.display='none',280); }

$id('profile-btn').addEventListener('click', ()=>{
  if(!currentUser){
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' }); google.accounts.id.prompt();
    return;
  }
  openProfile();
  $id('user-name').value = currentUser.name || '';
  $id('user-email').value = currentUser.email || '';
  $id('user-phone').value = currentUser.phone || '';
});

$id('close-profile-screen').addEventListener('click', ()=> closeProfile());
$id('logout-screen-btn').addEventListener('click', ()=> { currentUser=null; localStorage.removeItem('currentUser'); updateAuthUI(); closeProfile(); showToast('התנתקת', false); });

$id('auth-btn').addEventListener('click', ()=>{
  if(currentUser){ currentUser=null; localStorage.removeItem('currentUser'); updateAuthUI(); showToast('התנתקת', false); return; }
  google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' }); google.accounts.id.prompt();
});

function handleCredentialResponse(response){
  try{
    const decoded = jwt_decode(response.credential);
    currentUser = { name: decoded.name || decoded.given_name || '', email: decoded.email || '', phone: (JSON.parse(localStorage.getItem('savedPhones')||'{}'))[decoded.email] || '' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    showToast(`שלום ${currentUser.name}`, false);
    openProfile();
  }catch(e){ console.error(e); showToast('שגיאה בהתחברות', true); }
}

$id('save-user').addEventListener('click', ()=> {
  if(!currentUser) return;
  currentUser.name = $id('user-name').value.trim();
  currentUser.phone = $id('user-phone').value.trim();
  if(currentUser.phone && !/^05\d{8}$/.test(currentUser.phone)){ showToast('פורמט טלפון לא תקין', true); return; }
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  const map = JSON.parse(localStorage.getItem('savedPhones')||'{}'); if(currentUser.email) map[currentUser.email] = currentUser.phone; localStorage.setItem('savedPhones', JSON.stringify(map));
  showToast('פרטי משתמש נשמרו', false);
  closeProfile();
});

/* ========== SEND FLOW (modal) ========== */
$id('send-order').addEventListener('click', ()=> openSendModal());
$id('guest-btn').addEventListener('click', ()=> openSendModal());

function openSendModal(){ const m=$id('send-modal'); m.classList.add('on'); m.style.display='flex'; m.setAttribute('aria-hidden','false'); }
function closeSendModal(){ const m=$id('send-modal'); m.classList.remove('on'); setTimeout(()=>{ m.style.display='none'; m.setAttribute('aria-hidden','true'); $id('guest-phone').value=''; $id('guest-phone-area').style.display='none'; },280); }

$id('modal-cancel').addEventListener('click', ()=> closeSendModal());
$id('modal-login').addEventListener('click', ()=> { google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse, ux_mode:'popup' }); google.accounts.id.prompt(); });
$id('modal-guest').addEventListener('click', ()=> { $id('guest-phone-area').style.display = 'block'; });
$id('guest-send-confirm').addEventListener('click', async ()=> {
  const phone = $id('guest-phone').value.trim();
  if(!/^05\d{8}$/.test(phone)){ showToast('הכנס טלפון תקין (05XXXXXXXX)', true); return; }
  const prevUser = currentUser; currentUser = { name: 'אורח', email:'', phone }; await performPostLoginSend(); currentUser = prevUser; closeSendModal();
});

/* ========== PERFORM SEND ========== */
async function postToMake(payload){ return fetch(MAKE_WEBHOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); }

async function performPostLoginSend(){
  try{
    const s = computeSummary();
    if(s.totalRolls === 0){ showToast('יש לבחור לפחות רול אחד', true); return; }
    const pickup = $id('pickup-time').value; if(!pickup){ showToast('יש לבחור שעת איסוף', true); return; }
    const today = new Date().toISOString().slice(0,10); const todayCount = dailyRollCount[today]||0;
    if(todayCount + s.totalRolls > 15){ showToast(`הושגו כבר ${todayCount} רולים (מקסימום 15)`, true); return; }
    if(bookedTimes.includes(pickup)){ showToast('השעה תפוסה, בחר שעה אחרת', true); initPickupTimes(); return; }

    const orderUUID = generateUUID();
    const payload = { uuid: orderUUID, timestamp: new Date().toISOString(), user: currentUser || {name:'אורח',email:'',phone:''}, pickupTime: pickup, chopsticks: chopsticksCount, notes: $id('notes').value.trim(), rolls: [], sauces: [], summary: $id('order-summary').textContent };

    // collect rolls
    const allCards = [...document.querySelectorAll('#insideout-rolls .roll-card'), ...document.querySelectorAll('#maki-rolls .roll-card'), ...document.querySelectorAll('#onigiri-rolls .roll-card'), ...document.querySelectorAll('#poke-rolls .roll-card')];
    allCards.forEach(card => { const id = card.dataset.id; const qty = selectedRolls[id]||0; if(qty>0){ const item = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData].find(x=>x.id===id); payload.rolls.push({ id, name: item.name, qty, price: item.price }); } });

    // sauces
    Object.keys(selectedSauces).forEach(id => { const qty = selectedSauces[id]||0; if(qty>0){ const sdata = saucesData.find(x=>x.id===id); payload.sauces.push({ id, name: sdata.name, qty, extraPrice: Math.max(0, qty - (payload.rolls.reduce((a,b)=>a+b.qty,0)*2)) * 3 }); } });

    // send to Make
    await postToMake(payload);

    // insert into Supabase
    if(!SUPABASE_KEY || SUPABASE_KEY === ''){ console.warn('Supabase key missing - skipping DB insert'); }
    else {
      const { error } = await supabase.from('Sushi').insert({
        Id: payload.uuid, created_at: payload.timestamp, User_name: payload.user.name, User_email: payload.user.email||'', User_phone: payload.user.phone||'', pickup_time: payload.pickupTime, notes: payload.notes, Rolls: payload.rolls, sauces: payload.sauces, chopsticks_count: payload.chopsticks, Summary: payload.summary
      });
      if(error){ console.error(error); showToast('שגיאה בשמירה ל-Supabase', true); return; }
    }

    // update local bookedTimes/dailyRollCount
    bookedTimes.push(payload.pickupTime); localStorage.setItem('bookedTimes', JSON.stringify(bookedTimes));
    dailyRollCount[today] = (dailyRollCount[today]||0) + s.totalRolls; localStorage.setItem('dailyRollCount', JSON.stringify(dailyRollCount));

    showToast('ההזמנה נשלחה ונשמרה בהצלחה!', false);
    initPickupTimes(); updateSummary();
  } catch(e){ console.error(e); showToast('שגיאה בשליחת ההזמנה', true); }
}

/* ========== HISTORY ========== */
$id('view-orders').addEventListener('click', async ()=>{
  if(!currentUser || (!currentUser.email && !currentUser.phone)){ showToast('אין פרטי משתמש להציג היסטוריה', true); return; }
  $id('orders-list').textContent = 'טוען...';
  try{
    if(!SUPABASE_KEY || SUPABASE_KEY === ''){ $id('orders-list').textContent = 'אין חיבור ל-Supabase (מפתח לא הוזן).'; return; }
    let q = supabase.from('Sushi').select('*').order('created_at', { ascending:false });
    if(currentUser.email) q = q.eq('User_email', currentUser.email); else q = q.eq('User_phone', currentUser.phone);
    const { data, error } = await q;
    if(error){ console.error(error); $id('orders-list').textContent = 'שגיאה בטעינת היסטוריה'; return; }
    if(!data || data.length===0){ $id('orders-list').textContent = 'אין הזמנות קודמות'; return; }
    $id('orders-list').textContent = data.map(o => `${o.created_at}\n${o.Summary}`).join('\n\n-----\n\n');
  } catch(e){ console.error(e); $id('orders-list').textContent = 'שגיאה בטעינת היסטוריה'; }
});

/* ========== DAILY RESET + INIT ========== */
window.addEventListener('DOMContentLoaded', ()=>{
  const today = new Date().toISOString().slice(0,10);
  if(localStorage.getItem('lastResetDate') !== today){
    bookedTimes = []; dailyRollCount = {}; localStorage.setItem('bookedTimes', JSON.stringify(bookedTimes)); localStorage.setItem('dailyRollCount', JSON.stringify(dailyRollCount)); localStorage.setItem('lastResetDate', today);
  }

  initMenu(); initPickupTimes(); updateSummary(); updateAuthUI();

  // show first category by default
  const first = document.querySelectorAll('.tab')[0]; if(first) first.click();
});

/* close modal on background click */
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click', (e)=>{ if(e.target === m) closeSendModal(); });
});

/* keep logged in if exists */
if(currentUser) updateAuthUI();

function updateAuthUI(){
  const authBtn = $id('auth-btn');
  if(currentUser){ authBtn.textContent = 'התנתק'; } else { authBtn.textContent = 'התחבר'; }
  updateSummary();
}
