// --- נתונים ---
let currentUser = null;
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};
let selectedTime = "";
const MAX_ROLLS_PER_DAY = 15;
const FREE_SAUCES = 2;
const EXTRA_SAUCE_PRICE = 3;
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

const rollsData = [
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

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

const pickupTimes = [];
for(let hour=19; hour<=22; hour++){
  [0,30].forEach(min=>{
    let h = hour<10?"0"+hour:hour;
    let m = min===0?"30":"00";
    if(!(hour===19 && min===0)) pickupTimes.push(`${h}:${m}`);
  });
}

// --- איניטיאליזציה ---
function initMenu(){
  const rollsContainer = document.getElementById("rolls-container");
  rollsContainer.innerHTML = "";
  rollsData.forEach(r=>{
    selectedRolls[r.id]=0;
    const card = document.createElement("div");
    card.className = "roll-card";
    card.innerHTML=`
      <h3>${r.name}</h3>
      <p>${r.description}</p>
      <div class="quantity-control">
        <button class="minus">−</button>
        <input type="number" value="0" readonly>
        <button class="plus">+</button>
      </div>
    `;
    const minusBtn = card.querySelector(".minus");
    const plusBtn = card.querySelector(".plus");
    const input = card.querySelector("input");
    minusBtn.addEventListener("click",()=>{
      if(selectedRolls[r.id]>0) selectedRolls[r.id]--;
      input.value = selectedRolls[r.id];
      updateSummary();
    });
    plusBtn.addEventListener("click",()=>{
      selectedRolls[r.id]++;
      input.value = selectedRolls[r.id];
      updateSummary();
    });
    rollsContainer.appendChild(card);
  });

  const saucesContainer = document.getElementById("sauces-container");
  saucesContainer.innerHTML="";
  saucesData.forEach(s=>{
    selectedSauces[s.id]=false;
    const label = document.createElement("label");
    label.innerHTML=`<input type="checkbox" data-id="${s.id}"> ${s.name}`;
    const checkbox = label.querySelector("input");
    checkbox.addEventListener("change",()=>{
      selectedSauces[s.id]=checkbox.checked;
      updateSummary();
    });
    saucesContainer.appendChild(label);
  });

  const pickupSelect = document.getElementById("pickup-time");
  pickupSelect.innerHTML="<option value=''>בחר שעת איסוף</option>";
  pickupTimes.forEach(t=>{
    const opt = document.createElement("option");
    opt.value=t;
    opt.textContent=t;
    pickupSelect.appendChild(opt);
  });
  pickupSelect.addEventListener("change",(e)=>{
    selectedTime = e.target.value;
    updateSummary();
  });
}

// --- עדכון סיכום ---
function updateSummary(){
  let text="הזמנה חדשה:\n\n";
  let totalRolls=0;
  for(let id in selectedRolls){
    if(selectedRolls[id]>0){
      const r = rollsData.find(x=>x.id===id);
      text+=`${r.name} x ${selectedRolls[id]} = ${r.price*selectedRolls[id]}₪\n`;
      totalRolls+=selectedRolls[id];
    }
  }
  let sauceCount = Object.values(selectedSauces).filter(v=>v).length;
  let extraSauce = Math.max(0,sauceCount-FREE_SAUCES);
  text+=`\nרוטבים נוספים: ${extraSauce>0?extraSauce*EXTRA_SAUCE_PRICE+"₪":0}\n`;
  text+=`\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = document.getElementById("notes").value.trim();
  if(notes) text+=`\nהערות: ${notes}\n`;
  if(selectedTime) text+=`\nשעת איסוף: ${selectedTime}\n`;
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;
  if(totalRolls>MAX_ROLLS_PER_DAY) text+="\n**חריגה מהמגבלה היומית של 15 רולים**";

  document.getElementById("order-summary").textContent=text;
  const sendBtn=document.getElementById("send-order");
  sendBtn.disabled=totalRolls===0 || !selectedTime;
}

// --- כפתורי צ’ופסטיקס ---
document.getElementById("chopsticks-minus").addEventListener("click",()=>{
  if(chopsticksCount>1) chopsticksCount--;
  document.getElementById("chopsticks-qty").value=chopsticksCount;
  updateSummary();
});
document.getElementById("chopsticks-plus").addEventListener("click",()=>{
  chopsticksCount++;
  document.getElementById("chopsticks-qty").value=chopsticksCount;
  updateSummary();
});

// --- התחברות גוגל ---
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = {
    name: decoded.name,
    email: decoded.email,
    phone: decoded.phone_number || ""
  };
  alert("התחברת בהצלחה! ההזמנה שלך מוכנה לשליחה.");
  updateSummary();
}

// --- שליחת הזמנה ---
document.getElementById("send-order").addEventListener("click",()=>{
  if(!currentUser){
    // אם לא מחובר, מפעילים login גוגל
    google.accounts.id.prompt();
    return;
  }

  const payload={
    user: currentUser,
    rolls:selectedRolls,
    sauces:selectedSauces,
    chopsticksCount,
    pickupTime:selectedTime,
    notes:document.getElementById("notes").value.trim()
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  }).then(()=>{
    alert("ההזמנה נשלחה בהצלחה! בדוק גם את המייל שלך.");
  }).catch(err=>{
    console.error(err);
    alert("שגיאה בשליחת ההזמנה");
  });
});

// --- התחלה ---
initMenu();
updateSummary();
