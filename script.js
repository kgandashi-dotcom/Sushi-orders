/*  script.js — קוד מלא מקצה לקצה
  חשוב:
   - ודא שה‑Google OAuth Client ID שלך רשום ב-Google Cloud Console under Authorized JS origins
   - ודא ש‑MAKE_WEBHOOK_URL נכון ומטפל ב‑payload לשליחת מייל/Whatsapp דרך Make
*/
const SUPABASE_URL = 'https://oxjokdjwdvmmdtcvqvon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94am9rZGp3ZHZtbWR0Y3Zxdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzgwMzMsImV4cCI6MjA3NDY1NDAzM30.DmKp79UiPi9iOU50UutevdqRcPyREMUJ7NT5ZmBHDsg';

// יצירת חיבור
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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
function showMessage(txt,isError=true){
  const m = $id('messages');
  m.textContent = txt;
  m.style.color = isError ? '#b71c1c':'#2a7a2a';
  setTimeout(()=>{ if(m.textContent===txt)m.textContent=''; },6000);
}
function generateUUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
    const r=Math.random()*16|0, v=c==='x'?r:(r&0x3|0x8);
    return v.toString(16);
  });
}


function createRollCard(item,containerId){
  const container=$id(containerId);
  const card=document.createElement('div');
  card.className='roll-card';
  card.dataset.id=item.id;
  card.dataset.price=item.price;

  const info=document.createElement('div');
  info.className='info';
  info.innerHTML=`<h3>${item.name}</h3><p>${item.description}</p>`;

  const controls=document.createElement('div');
  controls.className='quantity-control';
  const btnMinus=document.createElement('button'); btnMinus.textContent='−';
  const inputQty=document.createElement('input'); inputQty.type='number'; inputQty.value=selectedRolls[item.id]||0; inputQty.readOnly=true;
  const btnPlus=document.createElement('button'); btnPlus.textContent='+';

  btnPlus.addEventListener('click',()=>{ selectedRolls[item.id]=(selectedRolls[item.id]||0)+1; inputQty.value=selectedRolls[item.id]; updateSummary(); });
  btnMinus.addEventListener('click',()=>{ if((selectedRolls[item.id]||0)>0){ selectedRolls[item.id]--; inputQty.value=selectedRolls[item.id]; updateSummary(); } });

  controls.append(btnMinus,inputQty,btnPlus);
  card.append(info,controls);
  container.appendChild(card);
}

function createSauceCard(item){
  const container=$id('sauces-container');
  const card=document.createElement('div');
  card.className='roll-card';
  card.dataset.id=item.id;
  card.dataset.price=item.price;

  const info=document.createElement('div'); info.className='info';
  info.innerHTML=`<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪ לרוטב נוסף</p>`;

  const controls=document.createElement('div'); controls.className='quantity-control';
  const btnMinus=document.createElement('button'); btnMinus.textContent='−';
  const inputQty=document.createElement('input'); inputQty.type='number'; inputQty.value=selectedSauces[item.id]||0; inputQty.readOnly=true;
  const btnPlus=document.createElement('button'); btnPlus.textContent='+';

  btnPlus.addEventListener('click',()=>{ selectedSauces[item.id]=(selectedSauces[item.id]||0)+1; inputQty.value=selectedSauces[item.id]; updateSummary(); });
  btnMinus.addEventListener('click',()=>{ if((selectedSauces[item.id]||0)>0){ selectedSauces[item.id]--; inputQty.value=selectedSauces[item.id]; updateSummary(); } });

  controls.append(btnMinus,inputQty,btnPlus);
  card.append(info,controls);
  container.appendChild(card);
}

// ----------------- INIT ----------------
function initMenu(){
  ['insideout-rolls','maki-rolls','onigiri-rolls','poke-rolls','sauces-container'].forEach(id=>{ const el=$id(id); if(el) el.innerHTML=''; });
  insideOutRollsData.forEach(r=>createRollCard(r,'insideout-rolls'));
  makiRollsData.forEach(r=>createRollCard(r,'maki-rolls'));
  onigiriData.forEach(r=>createRollCard(r,'onigiri-rolls'));
  pokeData.forEach(r=>createRollCard(r,'poke-rolls'));
  saucesData.forEach(s=>createSauceCard(s));
}

// ----------------- PICKUP TIMES ----------------
function initPickupTimes(){
  const sel=$id('pickup-time'); sel.innerHTML='<option value="">בחר שעה</option>';
  for(let h=19; h<=22; h++){
    for(let m of [0,30]){
      if(h===22 && m>30) continue;
      const label=`${String(h).padStart(2,'0')}:${m===0?'00':'30'}`;
      if(bookedTimes.includes(label)) continue;
      const opt=document.createElement('option'); opt.value=label; opt.textContent=label; sel.appendChild(opt);
    }
  }
  $id('pickup-note').textContent = bookedTimes.length ? `יש כבר ${bookedTimes.length} שעות תפוסות` : '';
}

// ----------------- SUMMARY ----------------
function computeSummary(){
  let total=0,totalRolls=0;
  const rollsLines=[];
  const allDatas=[...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData];
  for(const id in selectedRolls){
    const qty=selectedRolls[id]||0;
    if(qty>0){
      const item=allDatas.find(x=>x.id===id);
      rollsLines.push(`${item.name} x${qty} — ${item.price*qty}₪`);
      total+=item.price*qty;
      totalRolls+=qty;
    }
  }
  // sauces
  let sauceLines=[],extraSauceCost=0;
  const freeAllowance=totalRolls*2;
  let usedSaucesCount=0;
  for(const id in selectedSauces){
    const qty=selectedSauces[id]||0;
    if(qty>0){
      const item=saucesData.find(s=>s.id===id);
      sauceLines.push(`${item.name} x${qty}`);
      usedSaucesCount+=qty;
    }
  }
  const extra=Math.max(0,usedSaucesCount-freeAllowance);
  extraSauceCost=extra*3;
  total+=extraSauceCost;
  return {rollsLines,sauceLines,totalRolls,usedSaucesCount,extra,extraSauceCost,total};
}

function updateSummary(){
  const s=computeSummary();
  let text=`הזמנה חדשה:\n\n`;
  if(s.rollsLines.length) text+=s.rollsLines.join('\n')+'\n\n'; else text+='(לא נבחרו רולים)\n\n';
  text+='רטבים:\n';
  if(s.sauceLines.length) text+=s.sauceLines.join('\n')+'\n'; else text+='(לא נבחרו רטבים)\n';
  if(s.extra>0) text+=`\nעלות רטבים נוספים: ${s.extra} × 3₪ = ${s.extraSauceCost}₪\n`;
  text+=`\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes=$id('notes').value.trim();
  if(notes) text+=`\nהערות: ${notes}\n`;
  const pickup=$id('pickup-time').value;
  text+=`\nשעת איסוף: ${pickup || '(לא נבחרה)'}\n`;
  if(currentUser) text+=`\nלקוח: ${currentUser.name} (${currentUser.email})\n`;
  text+=`\nסה"כ לתשלום: ${s.total}₪\n`;
  $id('order-summary').textContent=text;
  $id('send-order').disabled=!(s.totalRolls>0 && !!pickup);
}

// ----------------- TABS ----------------
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=> {
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const target=tab.dataset.target;
    document.querySelectorAll('#menu > div,#sauces-container').forEach(d=>d.style.display='none');
    $id(target).style.display='flex';
  });
});

// ----------------- CHOPSTICKS ----------------
$id('chopsticks-minus').addEventListener('click',()=>{ if(chopsticksCount>1) chopsticksCount--; $id('chopsticks-qty').value=chopsticksCount; updateSummary(); });
$id('chopsticks-plus').addEventListener('click',()=>{ chopsticksCount++; $id('chopsticks-qty').value=chopsticksCount; updateSummary(); });
$id('pickup-time').addEventListener('change',updateSummary);
$id('notes').addEventListener('input',updateSummary);

// ----------------- GOOGLE LOGIN ----------------
$id('login-btn').addEventListener('click',()=>{
  google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleCredentialResponse,ux_mode:'popup'});
  google.accounts.id.prompt();
});

function handleCredentialResponse(response){
  try{
    const decoded=jwt_decode(response.credential);
    currentUser={name:decoded.name||decoded.given_name||'Google User',email:decoded.email||'',phone:''};
    const savedPhones=JSON.parse(localStorage.getItem('savedPhones')||'{}');
    if(savedPhones[currentUser.email]) currentUser.phone=savedPhones[currentUser.email];
    localStorage.setItem('currentUser',JSON.stringify(currentUser));
    showUserPanel();
    updateSummary();
  }catch(e){console.error(e); showMessage('שגיאה בקריאת Google');}
}

// ----------------- USER PANEL ----------------
function showUserPanel(){
  if(!currentUser) return;
  $id('user-panel').style.display='block';
  $id('user-name').value=currentUser.name;
  $id('user-email').value=currentUser.email;
  $id('user-phone').value=currentUser.phone||'';
}
$id('save-user').addEventListener('click',()=>{
  if(!currentUser) return;
  currentUser.name=$id('user-name').value;
  currentUser.phone=$id('user-phone').value;
  localStorage.setItem('currentUser',JSON.stringify(currentUser));
  const savedPhones=JSON.parse(localStorage.getItem('savedPhones')||'{}');
  savedPhones[currentUser.email]=currentUser.phone;
  localStorage.setItem('savedPhones',JSON.stringify(savedPhones));
  showMessage('פרטי משתמש נשמרו',false);
});

// ----------------- ORDER SEND ----------------
async function postToMake(payload){ return fetch(MAKE_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); }

$id('send-order').addEventListener('click',performPostLoginSend);

async function performPostLoginSend(){
  try{
    const s=computeSummary();
    if(s.totalRolls===0){showMessage('יש לבחור לפחות רול');return;}
    const pickup=$id('pickup-time').value;
    if(!pickup){showMessage('יש לבחור שעת איסוף');return;}
    const today=new Date().toISOString().slice(0,10);
    const todayCount=dailyRollCount[today]||0;
    if(todayCount+s.totalRolls>15){showMessage(`לא ניתן להזמין — הושגו כבר ${todayCount} רולים היום (מקסימום 15).`);return;}
    if(bookedTimes.includes(pickup)){showMessage('השעה תפוסה, בחר אחרת'); initPickupTimes(); return;}
    const orderUUID=generateUUID();
    const payload={uuid:orderUUID,timestamp:new Date().toISOString(),user:currentUser,pickupTime:pickup,chopsticks:chopsticksCount,notes:$id('notes').value.trim(),rolls:[],sauces:[],summary:$id('order-summary').textContent};
    const allCart=[...document.querySelectorAll('#insideout-rolls .roll-card,#maki-rolls .roll-card,#onigiri-rolls .roll-card,#poke-rolls .roll-card')];
    allCart.forEach(card=>{
      const id=card.dataset.id, qty=selectedRolls[id]||0;
      if(qty>0){
        const item=[...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData].find(x=>x.id===id);
        payload.rolls.push({id,name:item.name,qty,price:item.price});
      }
    });
    Object.keys(selectedSauces).forEach(id=>{
      const qty=selectedSauces[id]||0;
      if(qty>0){
        const sdata=saucesData.find(s=>s.id===id);
        payload.sauces.push({id,name:sdata.name,qty,extraPrice:Math.max(0,qty-(payload.rolls.reduce((a,b)=>a+b.qty,0)*2))*3});
      }
    });
    await postToMake(payload);
    const { error }=await supabase.from('Sushi').insert({
      Id:payload.uuid,
      created_at:payload.timestamp,
      User_name:payload.user.name,
      User_email:payload.user.email,
      User_phone:payload.user.phone||'',
      pickup_time:payload.pickupTime,
      notes:payload.notes,
      Rolls:payload.rolls,
      sauces:payload.sauces,
      chopsticks_count:payload.chopsticks,
      Summary:payload.summary
    });
    if(error){console.error(error);showMessage('שגיאה בשמירה ל-Supabase');return;}
    bookedTimes.push(pickup); localStorage.setItem('bookedTimes',JSON.stringify(bookedTimes));
    dailyRollCount[today]=(dailyRollCount[today]||0)+s.totalRolls; localStorage.setItem('dailyRollCount',JSON.stringify(dailyRollCount));
    showMessage('ההזמנה נשלחה ונשמרה בהצלחה!',false); initPickupTimes(); updateSummary();
  }catch(err){console.error(err);showMessage('שגיאה בשליחה',true);}
}

// ----------------- INIT ----------------
window.addEventListener('DOMContentLoaded',()=>{
  initMenu(); initPickupTimes(); updateSummary(); showUserPanel();
});
