/* ============ CONFIG ============ */
const SUPABASE_URL = 'https://oxjokdjwdvmmdtcvqvon.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r';
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============ STORAGE / STATE ============ */
let bookedTimes = JSON.parse(localStorage.getItem('bookedTimes')||'[]');
let dailyRollCount = JSON.parse(localStorage.getItem('dailyRollCount')||'{}');
let currentUser = JSON.parse(localStorage.getItem('currentUser')||'null');
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};

/* ============ SAMPLE MENU DATA ============ */
const insideOutRollsData = [
  {id:"bingo", name:"רול בינגו - 50₪", description:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
  {id:"luna", name:"רול לונה - 50₪", description:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50}
  // אפשר להוסיף שאר התפריט
];

const makiRollsData = [
  {id:"alfi", name:"רול אלפי - 35₪", description:"מאקי סלמון", price:35}
];

const onigiriData = [
  {id:"rocky", name:"אוניגירי רוקי - 35₪", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35}
];

const pokeData = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק. מעל שומשום ורוטב ספייסי מיונז", price:60}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:3},
  {id:"soy", name:"רוטב סויה", price:3}
];

/* ============ HELPERS ============ */
function $id(id){ return document.getElementById(id); }

function showMessage(txt, isError=true){
  const m = $id('messages');
  m.textContent = txt;
  m.style.color = isError? '#b71c1c':'#2a7a2a';
  setTimeout(()=>{ if(m.textContent===txt) m.textContent=''; },6000);
}

function generateUUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
    const r=Math.random()*16|0, v=c==='x'?r:(r&0x3|0x8);
    return v.toString(16);
  });
}

/* ============ RENDER MENU ============ */
function createRollCard(item, containerId){
  const container = $id(containerId);
  const card = document.createElement('div');
  card.className='roll-card';
  card.dataset.id=item.id;
  card.dataset.price=item.price;

  const info = document.createElement('div');
  info.className='info';
  info.innerHTML=`<h3>${item.name}</h3><p>${item.description}</p>`;

  const controls = document.createElement('div');
  controls.className='quantity-control';

  const btnMinus = document.createElement('button'); btnMinus.textContent='−';
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value=selectedRolls[item.id]||0; inputQty.readOnly=true;
  const btnPlus = document.createElement('button'); btnPlus.textContent='+';

  btnPlus.addEventListener('click', ()=>{ selectedRolls[item.id]=(selectedRolls[item.id]||0)+1; inputQty.value=selectedRolls[item.id]; updateSummary(); });
  btnMinus.addEventListener('click', ()=>{ if((selectedRolls[item.id]||0)>0){ selectedRolls[item.id]--; inputQty.value=selectedRolls[item.id]; updateSummary(); } });

  controls.append(btnMinus, inputQty, btnPlus);
  card.append(info, controls);
  container.appendChild(card);
}

function createSauceCard(item){
  const container = $id('sauces-container');
  const card = document.createElement('div');
  card.className='roll-card';
  card.dataset.id=item.id;
  card.dataset.price=item.price;

  const info = document.createElement('div'); info.className='info';
  info.innerHTML=`<h3>${item.name}</h3><p>2 חינם לכל רול — מעבר לכך ${item.price}₪</p>`;

  const controls = document.createElement('div'); controls.className='quantity-control';
  const btnMinus = document.createElement('button'); btnMinus.textContent='−';
  const inputQty = document.createElement('input'); inputQty.type='number'; inputQty.value=selectedSauces[item.id]||0; inputQty.readOnly=true;
  const btnPlus = document.createElement('button'); btnPlus.textContent='+';

  btnPlus.addEventListener('click', ()=>{ selectedSauces[item.id]=(selectedSauces[item.id]||0)+1; inputQty.value=selectedSauces[item.id]; updateSummary(); });
  btnMinus.addEventListener('click', ()=>{ if((selectedSauces[item.id]||0)>0){ selectedSauces[item.id]--; inputQty.value=selectedSauces[item.id]; updateSummary(); } });

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

/* ============ SUMMARY ============ */
function computeSummary(){
  let total=0, totalRolls=0, rollsLines=[], sauceLines=[], usedSaucesCount=0;
  const all=[...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData];

  for(const id in selectedRolls){
    const qty = selectedRolls[id]||0;
    if(qty>0){
      const item = all.find(x=>x.id===id);
      rollsLines.push(`${item.name} x${qty} — ${item.price*qty}₪`);
      total += item.price*qty;
      totalRolls += qty;
    }
  }

  for(const id in selectedSauces){
    const qty = selectedSauces[id]||0;
    if(qty>0){
      const s = saucesData.find(x=>x.id===id);
      sauceLines.push(`${s.name} x${qty}`);
      usedSaucesCount += qty;
    }
  }

  const extra = Math.max(0, usedSaucesCount-(totalRolls*2));
  const extraSauceCost = extra*3;
  total += extraSauceCost;

  return { rollsLines, sauceLines, totalRolls, usedSaucesCount, extra, extraSauceCost, total };
}

function updateSummary(){
  const s = computeSummary();
  let text = `הזמנה חדשה:\n\n`;
  text += s.rollsLines.length ? s.rollsLines.join('\n')+'\n\n':'(לא נבחרו רולים)\n\n';
  text += 'רטבים:\n';
  text += s.sauceLines.length ? s.sauceLines.join('\n')+'\n':'(לא נבחרו רטבים)\n';
  if(s.extra>0) text += `\nעלות רטבים נוספים: ${s.extra} × 3₪ = ${s.extraSauceCost}₪\n`;
  text += `\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = $id('notes').value.trim();
  if(notes) text += `\nהערות: ${notes}\n`;
  const pickup = $id('pickup-time').value;
  text += `\nשעת איסוף: ${pickup || '(לא נבחרה)'}\n`;
  text += `\nסה"כ לתשלום: ${s.total}₪\n`;
  $id('order-summary').textContent = text;
}

/* ============ INIT ============ */
window.addEventListener('DOMContentLoaded', ()=>{
  initMenu();
  updateSummary();

  // default tab
  const firstTab = document.querySelectorAll('.tab')[0];
  if(firstTab) firstTab.click();
});
