// --- נתונים ---
let currentUser = null;
let chopsticksCount = 1;
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- רולים ---
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

const pokeData = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק . מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי . מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו . מעל שומשום ורוטב בוטנים", price:45}
];

// --- רטבים ---
const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// --- בחירות ---
const selections = {
  rolls: {},
  sauces: {},
  chopsticks: 1,
  notes: '',
  pickupTime: ''
};

// --- יצירת כרטיסים ---
function createRollCard(item, container){
  const card = document.createElement('div');
  card.className = 'roll-card';
  const title = document.createElement('h3'); title.textContent = item.name;
  const desc = document.createElement('p'); desc.textContent = item.description;
  const quantityDiv = document.createElement('div'); quantityDiv.className='quantity-control';
  const minusBtn = document.createElement('button'); minusBtn.textContent='−';
  const qtyInput = document.createElement('input'); qtyInput.type='number'; qtyInput.value=0; qtyInput.readOnly=true;
  const plusBtn = document.createElement('button'); plusBtn.textContent='+';

  minusBtn.onclick = ()=>{ if(qtyInput.value>0){ qtyInput.value--; selections.rolls[item.id]=qtyInput.value; updateSummary(); } };
  plusBtn.onclick = ()=>{ qtyInput.value++; selections.rolls[item.id]=qtyInput.value; updateSummary(); };

  quantityDiv.append(minusBtn, qtyInput, plusBtn);
  card.append(title, desc, quantityDiv);
  container.appendChild(card);
}

// --- רטבים ---
function createSauceCard(item, container){
  const card = document.createElement('div'); card.className='sauce-card';
  const title = document.createElement('h3'); title.textContent=item.name;
  const quantityDiv = document.createElement('div'); quantityDiv.className='quantity-control';
  const minusBtn = document.createElement('button'); minusBtn.textContent='−';
  const qtyInput = document.createElement('input'); qtyInput.type='number'; qtyInput.value=0; qtyInput.readOnly=true;
  const plusBtn = document.createElement('button'); plusBtn.textContent='+';

  minusBtn.onclick = ()=>{ if(qtyInput.value>0){ qtyInput.value--; selections.sauces[item.id]=qtyInput.value; updateSummary(); } };
  plusBtn.onclick = ()=>{ qtyInput.value++; selections.sauces[item.id]=qtyInput.value; updateSummary(); };

  quantityDiv.append(minusBtn, qtyInput, plusBtn);
  card.append(title, quantityDiv);
  container.appendChild(card);
}

// --- אתחול ---
function initMenu(){
  const insideOutContainer=document.getElementById('insideout-container');
  const makiContainer=document.getElementById('maki-container');
  const onigiriContainer=document.getElementById('onigiri-container');
  const pokeContainer=document.getElementById('poke-container');
  const saucesContainer=document.getElementById('sauces-container');

  insideOutRollsData.forEach(r=>createRollCard(r,insideOutContainer));
  makiRollsData.forEach(r=>createRollCard(r,makiContainer));
  onigiriData.forEach(r=>createRollCard(r,onigiriContainer));
  pokeData.forEach(r=>createRollCard(r,pokeContainer));
  saucesData.forEach(s=>createSauceCard(s,saucesContainer));
}

// --- כמות צ'ופסטיקס ---
document.getElementById('chopsticks-minus').onclick=()=>{
  if(chopsticksCount>1){ chopsticksCount--; selections.chopsticks=chopsticksCount; document.getElementById('chopsticks-qty').value=chopsticksCount; updateSummary(); }
};
document.getElementById('chopsticks-plus').onclick=()=>{
  chopsticksCount++; selections.chopsticks=chopsticksCount; document.getElementById('chopsticks-qty').value=chopsticksCount; updateSummary();
};

// --- שעת איסוף ---
function initPickupTimes(){
  const select=document.getElementById('pickup-time');
  const times=["19:30","20:00","20:30","21:00","21:30","22:00","22:30"];
  times.forEach(t=>{
    const opt=document.createElement('option'); opt.value=t; opt.textContent=t; select.appendChild(opt);
  });
  select.onchange=()=>{ selections.pickupTime=select.value; updateSummary(); };
}

// --- סיכום הזמנה ---
function updateSummary(){
  let text="הזמנה חדשה:\n\n";
  let total=0;
  let totalSauce=0;

  for(let id in selections.rolls){
    const qty=parseInt(selections.rolls[id]);
    if(qty>0){
      const item=[...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData].find(r=>r.id===id);
      text+=`${item.name} x${qty} = ${item.price*qty}₪\n`; total+=item.price*qty;
    }
  }

  text+="\nרטבים נוספים:\n";
  for(let id in selections.sauces){
    const qty=parseInt(selections.sauces[id]);
    if(qty>0){
      text+=`${saucesData.find(s=>s.id===id).name} x${qty} = ${Math.max(0,qty-2)*3}₪\n`;
      totalSauce+=Math.max(0,qty-2)*3;
    }
  }

  text+=`\nכמות צ'ופסטיקס: ${selections.chopsticks}\n`;
  text+=`הערות: ${document.getElementById('notes').value}\n`;
  text+=`שעת איסוף: ${selections.pickupTime || "לא נבחרה"}\n\n`;
  text+=`סה"כ: ${total+totalSauce}₪\n`;

  document.getElementById('order-summary').textContent=text;
}

// --- התחברות / שליחה ---
function sendOrder(){
  if(!selections.pickupTime){ alert("אנא בחר שעת איסוף"); return; }
  const totalRolls=Object.values(selections.rolls).reduce((a,b)=>a+b,0);
  if(totalRolls===0){ alert("אנא בחר לפחות רול אחד"); return; }

  // התחברות Google
  google.accounts.id.prompt(); // יפעיל את פופאפ Google

  google.accounts.id.initialize({
    client_id:"962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com",
    callback: handleGoogleLogin
  });
}

// --- טיפול לאחר התחברות ---
function handleGoogleLogin(response){
  const decoded=jwt_decode(response.credential);
  currentUser={ name: decoded.name, email: decoded.email, phone: decoded.phone_number || '' };

  // שליחת ההזמנה ל-Make
  const payload={ user: currentUser, selections };
  fetch(MAKE_WEBHOOK_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  }).then(()=>{ 
    alert("ההזמנה נשלחה בהצלחה!"); 
    // אפשר גם לשלוח WhatsApp / מייל כאן עם payload
  }).catch(err=>{ console.error(err); alert("שגיאה בשליחת ההזמנה"); });
}

// --- כפתור ---
document.getElementById('send-order').onclick=sendOrder;

// --- התחלה ---
initMenu();
initPickupTimes();
updateSummary();
