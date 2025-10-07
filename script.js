# חלק 1/2 - script.js

```javascript
/* script.js — Production Final (Fixed) - PART 1 */

// ====== CONFIG ======
const SUPABASE_URL = 'https://oxjokdjwdvmmdtcvqvon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94am9rZGp3ZHZtbWR0Y3Zxdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzgwMzMsImV4cCI6MjA3NDY1NDAzM30.DmKp79UiPi9iOU50UutevdqRcPyREMUJ7NT5ZmBHDsg';
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";
const ADMIN_EMAIL = 'kgandashi@gmail.com';

// ====== FIX: Correct Supabase initialization ======
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ====== STATE ======
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};
let bookedTimes = [];
let dailyRollCount = 0;

// ====== MENU DATA ======
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
  {id:"magi", name:"רול מגי 🌱", description:"מלפפון, בטטה, עירית ואבוקדו בעיטור בטטה ורוטב בוטנים", price:40},
  {id:"tyson", name:"רול טייסון וקיילה", description:"סלמון נא, קנפיו, בטטה בעיטוף שבבי פנקו סגול", price:50},
  {id:"lucy", name:"רול לוסי", description:"סלמון נא, פטריות שיטאקי ואושינקו בציפוי טוביקו", price:55},
  {id:"billy", name:"רול בילי", description:"דג לבן צרוב, עירית, בטטה מצופה בפנקו", price:50},
  {id:"lucky", name:"רול לאקי", description:"טרטר ספייסי סלמון עם אבוקדו, מלפפון ועירית", price:50}
];

const makiRollsData = [
  {id:"alfi", name:"רול אלפי", description:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי 🌱", description:"מאקי בטטה ואבוקדו", price:25},
  {id:"snoopy", name:"רול סנופי 🌱", description:"מאקי אושינקו וקנפיו", price:25}
];

const onigiriData = [
  {id:"rocky", name:"אוניגירי רוקי", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני", description:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל 🌱", description:"אבוקדו ובטטה", price:25}
];

const pokeData = [
  {id:"dog", name:"בול-דוג", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק. מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי. מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר 🌱", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו. מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:3},
  {id:"soy", name:"רוטב סויה", price:3},
  {id:"teriyaki", name:"רוטב טריאקי", price:3}
];

// ====== HELPERS ======
function $id(id){ return document.getElementById(id); }

function showMessage(txt, isError=true){
  const m = $id('messages');
  m.textContent = txt;
  m.style.color = isError ? '#b71c1c' : '#2a7a2a';
  setTimeout(() => { if(m.textContent === txt) m.textContent = ''; }, 6000);
}

function generateUUID(){ 
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { 
    const r = Math.random()*16|0, v = c==='x' ? r : (r&0x3|0x8); 
    return v.toString(16); 
  }); 
}

// ====== TABS ======
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      document.querySelectorAll('.category-container').forEach(c => c.style.display='none');
      const el = $id(target);
      if(el) el.style.display = 'flex';
    });
  });
});

// ====== SUPABASE BOOKING ======
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
  } catch(e) { console.error(e); }
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
  } catch(e) { console.error(e); }
}

// ====== REALTIME SUBSCRIPTION ======
function subscribeBookingTimesRealtime(){
  try{
    const today = new Date().toISOString().slice(0,10);
    supabase
      .channel('booking-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'BookingTimes', filter: `date=eq.${today}` },
        () => { loadTodayBooking(); }
      )
      .subscribe();
  } catch(e) {
    console.warn('Realtime subscription failed:', e);
  }
}

// ====== MENU UI ======
function createRollCard(item, containerId){
  const container = $id(containerId);
  const card = document.createElement('div');
  card.className = 'roll-card';

  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p><p style="font-weight:700;color:var(--accent);">${item.price}₪</p>`;

  const controls = document.createElement('div');
  controls.className = 'quantity-control';
  
  const btnMinus = document.createElement('button'); 
  btnMinus.textContent = '−';
  
  const inputQty = document.createElement('input'); 
  inputQty.type = 'number'; 
  inputQty.value = 0; 
  inputQty.readOnly = true;
  
  const btnPlus = document.createElement('button'); 
  btnPlus.textContent = '+';

  btnPlus.addEventListener('click', () => {
    selectedRolls[item.id] = (selectedRolls[item.id] || 0) + 1;
    inputQty.value = selectedRolls[item.id];
    updateSummary();
  });

  btnMinus.addEventListener('click', () => {
    if((selectedRolls[item.id] || 0) > 0){
      selectedRolls[item.id]--;
      inputQty.value = selectedRolls[item.id];
      updateSummary();
    }
  });

  controls.appendChild(btnMinus);
  controls.appendChild(inputQty);
  controls.appendChild(btnPlus);
  
  card.appendChild(info);
  card.appendChild(controls);
  container.appendChild(card);
}

function createSauceCard(item){
  const container = $id('sauces-container');
  const card = document.createElement('div');
  card.className = 'roll-card';

  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML = `<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪ לרוטב נוסף</p>`;

  const controls = document.createElement('div');
  controls.className = 'quantity-control';
  
  const btnMinus = document.createElement('button');
  btnMinus.textContent = '−';
  
  const inputQty = document.createElement('input');
  inputQty.type = 'number';
  inputQty.value = 0;
  inputQty.readOnly = true;
  
  const btnPlus = document.createElement('button');
  btnPlus.textContent = '+';

  btnPlus.addEventListener('click', () => {
    selectedSauces[item.id] = (selectedSauces[item.id] || 0) + 1;
    inputQty.value = selectedSauces[item.id];
    updateSummary();
  });

  btnMinus.addEventListener('click', () => {
    if((selectedSauces[item.id] || 0) > 0){
      selectedSauces[item.id]--;
      inputQty.value = selectedSauces[item.id];
      updateSummary();
    }
  });

  controls.appendChild(btnMinus);
  controls.appendChild(inputQty);
  controls.appendChild(btnPlus);
  
  card.appendChild(info);
  card.appendChild(controls);
  container.appendChild(card);
}

function initMenu(){
  ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls','sauces-container'].forEach(id => {
    const el = $id(id);
    if(el) el.innerHTML = '';
  });
  
  insideOutRollsData.forEach(r => createRollCard(r, 'insideout-rolls'));
  makiRollsData.forEach(r => createRollCard(r, 'maki-rolls'));
  onigiriData.forEach(r => createRollCard(r, 'onigiri-rolls'));
  pokeData.forEach(r => createRollCard(r, 'poke-rolls'));
  saucesData.forEach(s => createSauceCard(s));
}

// ====== PICKUP TIMES ======
function initPickupTimes(){
  const sel = $id('pickup-time');
  sel.innerHTML = '<option value="">בחר שעה</option>';
  
  for(let h = 19; h <= 22; h++){
    for(const m of [0, 30]){
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

// ====== SUMMARY CALCULATION ======
function computeSummary(){
  let total = 0;
  let totalRolls = 0;
  const rollsLines = [];
  const allDatas = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData];

  for(const id in selectedRolls){
    const qty = selectedRolls[id] || 0;
    if(qty > 0){
      const item = allDatas.find(x => x.id === id);
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
    if(qty > 0){
      const item = saucesData.find(s => s.id === id);
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
  let text = `📦 הזמנה חדשה:\n\n`;

  if(s.rollsLines.length) text += s.rollsLines.join('\n') + '\n\n';
  else text += '(לא נבחרו רולים)\n\n';

  text += '🥢 רטבים:\n';
  if(s.sauceLines.length) text += s.sauceLines.join('\n') + '\n';
  else text += '(לא נבחרו רטבים)\n';
  if(s.extra > 0) text += `\nעלות רטבים נוספים: ${s.extra} × 3₪ = ${s.extraSauceCost}₪\n`;

  text += `\n🥢 כמות צ'ופסטיקס: ${chopsticksCount}\n`;

  const notes = $id('notes').value.trim();
  if(notes) text += `\n📝 הערות: ${notes}\n`;

  const pickup = $id('pickup-time').value;
  text += `\n⏰ שעת איסוף: ${pickup || '(לא נבחרה)'}\n`;

  if(currentUser) text += `\n👤 לקוח: ${currentUser.name} (${currentUser.email})\n`;

  text += `\n💰 סה"כ לתשלום: ${s.total}₪\n`;

  $id('order-summary').textContent = text;
  $id('send-order').disabled = !(s.totalRolls > 0 && !!pickup);
}

// ====== CONTROLS ======
document.addEventListener('DOMContentLoaded', () => {
  $id('chopsticks-minus').addEventListener('click', () => {
    if(chopsticksCount > 1) chopsticksCount--;
    $id('chopsticks-qty').value = chopsticksCount;
    updateSummary();
  });

  $id('chopsticks-plus').addEventListener('click', () => {
    chopsticksCount++;
    $id('chopsticks-qty').value = chopsticksCount;
    updateSummary();
  });

  $id('pickup-time').addEventListener('change', updateSummary);
  $id('notes').addEventListener('input', updateSummary);
});
```

# חלק 2/2 - script.js (המשך)

```javascript
/* script.js — PART 2 (המשך) */

// ====== GOOGLE SIGN-IN ======
function initGoogleButton(){
  if(window.google && google.accounts && google.accounts.id){
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => {
        try{
          const decoded = jwt_decode(resp.credential);
          currentUser = {
            name: decoded.name || decoded.given_name || 'Google User',
            email: decoded.email || '',
            phone: ''
          };

          const savedPhones = JSON.parse(localStorage.getItem('savedPhones') || '{}');
          if(savedPhones[currentUser.email]){
            currentUser.phone = savedPhones[currentUser.email];
          }

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
        } catch(e) {
          console.error('decode error', e);
          showMessage('שגיאה בקריאת Google', true);
        }
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

document.addEventListener('DOMContentLoaded', () => {
  $id('logout-btn').addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    $id('login-btn').style.display = 'block';
    $id('profile-btn').style.display = 'none';
    $id('logout-btn').style.display = 'none';
    $id('profile-panel').style.display = 'none';
    updateSummary();
  });
});

// ====== PROFILE PANEL & HISTORY ======
document.addEventListener('DOMContentLoaded', () => {
  $id('profile-btn').addEventListener('click', async () => {
    const panel = $id('profile-panel');
    if(panel.style.display === 'block'){
      panel.style.display = 'none';
      return;
    }

    if(!currentUser){
      showMessage('יש להתחבר כדי לראות פרופיל והיסטוריה', true);
      return;
    }

    const infoDiv = $id('profile-info');
    infoDiv.innerHTML = `<strong>${currentUser.name}</strong><br>${currentUser.email || ''}<br>${currentUser.phone || ''}`;

    try{
      const { data, error } = await supabase
        .from('Sushi')
        .select('*')
        .eq('User_email', currentUser.email)
        .order('created_at', { ascending: false })
        .limit(50);

      if(error){
        console.error(error);
        showMessage('שגיאה בטעינת היסטוריה', true);
        return;
      }

      const histDiv = $id('order-history');
      histDiv.innerHTML = '';

      if(!data || data.length === 0){
        histDiv.textContent = 'אין הזמנות קודמות.';
      } else {
        data.forEach(row => {
          const item = document.createElement('div');
          item.className = 'history-item';
          const created = new Date(row.created_at).toLocaleString('he-IL');
          const rollsCount = (row.Rolls || []).reduce((a, b) => a + b.qty, 0) || 0;
          
          item.innerHTML = `
            <div><strong>${created}</strong> — איסוף: ${row.pickup_time || '-'} — טלפון: ${row.User_phone || '-'}</div>
            <div>סה"כ רולים: ${rollsCount}</div>
          `;
          histDiv.appendChild(item);
        });
      }
    } catch(e) {
      console.error(e);
      showMessage('שגיאה בטעינת היסטוריה', true);
      return;
    }

    panel.style.display = 'block';
  });
});

// ====== SEND ORDER ======
async function sendOrder(){
  const s = computeSummary();
  
  if(s.totalRolls === 0){
    showMessage('יש לבחור לפחות רול אחד', true);
    return;
  }

  const pickup = $id('pickup-time').value;
  if(!pickup){
    showMessage('יש לבחור שעת איסוף', true);
    return;
  }

  if(dailyRollCount + s.totalRolls > 15){
    showMessage(`לא ניתן להזמין — כבר הוזמנו ${dailyRollCount} רולים היום (מקסימום 15).`, true);
    return;
  }

  if(bookedTimes.includes(pickup)){
    showMessage('השעה תפוסה — בחר שעה אחרת', true);
    initPickupTimes();
    return;
  }

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

  const allDatas = [...insideOutRollsData, ...makiRollsData, ...onigiriData, ...pokeData];
  
  Object.keys(selectedRolls).forEach(id => {
    const qty = selectedRolls[id] || 0;
    if(qty > 0){
      const item = allDatas.find(x => x.id === id);
      payload.rolls.push({ id, name: item.name, qty, price: item.price });
    }
  });

  Object.keys(selectedSauces).forEach(id => {
    const qty = selectedSauces[id] || 0;
    if(qty > 0){
      const sdata = saucesData.find(s => s.id === id);
      payload.sauces.push({
        id,
        name: sdata.name,
        qty,
        extraPrice: Math.max(0, qty - (payload.rolls.reduce((a, b) => a + b.qty, 0) * 2)) * 3
      });
    }
  });

  try{
    await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch(e) {
    console.error('Make webhook error', e);
    showMessage('שגיאה בשליחת Webhook', true);
    return;
  }

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

    if(error){
      console.error('Supabase insert error', error);
      showMessage('שגיאה בשמירת ההזמנה', true);
      return;
    }
  } catch(e) {
    console.error(e);
    showMessage('שגיאה בשמירת ההזמנה', true);
    return;
  }

  bookedTimes.push(pickup);
  dailyRollCount += s.totalRolls;
  await saveTodayBooking();

  showMessage('✅ ההזמנה נשלחה ונשמרה בהצלחה!', false);

  selectedRolls = {};
  selectedSauces = {};
  chopsticksCount = 1;
  $id('chopsticks-qty').value = 1;
  $id('notes').value = '';
  $id('pickup-time').value = '';
  initPickupTimes();
  updateSummary();
}

// ====== ADMIN RESET BUTTON ======
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
      btn.style.cursor = 'pointer';
      
      btn.addEventListener('click', async () => {
        if(!confirm('למחוק את כל ההזמנות/שעות של היום?')) return;
        
        const today = new Date().toISOString().slice(0,10);
        try{
          await supabase.from('BookingTimes').upsert({ 
            date: today, 
            booked_times: [], 
            daily_roll_count: 0 
          }, { onConflict: 'date' });
          
          bookedTimes = [];
          dailyRollCount = 0;
          initPickupTimes();
          updateSummary();
          showMessage('✅ איפוס בוצע בהצלחה', false);
        } catch(e) {
          console.error(e);
          showMessage('שגיאה באיפוס', true);
        }
      });
      
      document.querySelector('header .user-buttons').appendChild(btn);
    }
  } else {
    const ex = $id('reset-orders');
    if(ex) ex.remove();
  }
}

// ====== BOOTSTRAP / INIT ======
async function bootstrap(){
  initMenu();
  await loadTodayBooking();
  updateSummary();

  const stored = localStorage.getItem('currentUser');
  if(stored){
    try{
      currentUser = JSON.parse(stored);
      updateUIAfterLogin();
    } catch(e) {
      currentUser = null;
    }
  }

  initGoogleButton();
  subscribeBookingTimesRealtime();

  $id('send-order').addEventListener('click', sendOrder);
  $id('profile-btn').style.display = currentUser ? 'inline-block' : 'none';
  $id('logout-btn').style.display = currentUser ? 'inline-block' : 'none';
  checkAdminButton();
}

window.addEventListener('DOMContentLoaded', bootstrap);
```
