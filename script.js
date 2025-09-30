let currentUser = null;
let chopsticksCount = 1;
const MAX_ROLLS_PER_DAY = 15;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// ---------- נתונים ----------
const insideOutRollsData = [ /* כל הרולים כפי שהגדרת */ ];
const makiRollsData = [ /* כל הרולים כפי שהגדרת */ ];
const onigiriData = [ /* כל הרולים כפי שהגדרת */ ];
const pokeData = [ /* כל הרולים כפי שהגדרת */ ];
const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:3},
  {id:"soy", name:"רוטב סויה", price:3},
  {id:"teriyaki", name:"רוטב טריאקי", price:3}
];

let selectedRolls = {};
let selectedSauces = {};
let unavailableTimes = [];

// ---------- פונקציות עזר ----------
function createCard(item, container, type="roll") {
  const card = document.createElement("div");
  card.className = type === "roll" ? "roll-card" : "sauce-card";
  
  const info = document.createElement("div");
  info.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p>`;
  card.appendChild(info);
  
  if(type==="roll" || type==="sauce") {
    const qtyControl = document.createElement("div");
    qtyControl.className="quantity-control";
    const minus = document.createElement("button"); minus.textContent="−";
    const input = document.createElement("input");
    input.type="number"; input.value=0; input.readOnly=true;
    const plus = document.createElement("button"); plus.textContent="+";
    
    minus.addEventListener("click", ()=> {
      if(input.value>0){ input.value--; updateSelection(item.id, type, input.value); }
    });
    plus.addEventListener("click", ()=> {
      input.value++; updateSelection(item.id, type, input.value);
    });
    
    qtyControl.appendChild(minus);
    qtyControl.appendChild(input);
    qtyControl.appendChild(plus);
    card.appendChild(qtyControl);
  }

  container.appendChild(card);
}

function updateSelection(id, type, qty){
  if(type==="roll") selectedRolls[id]=qty;
  else if(type==="sauce") selectedSauces[id]=qty;
  updateSummary();
}

function initSection(data, containerId, type){
  const container=document.getElementById(containerId);
  container.innerHTML="";
  data.forEach(item=> createCard(item, container, type));
}

function initRollsAndSauces(){
  initSection(insideOutRollsData,"rolls-section","roll");
  initSection(makiRollsData,"rolls-section","roll");
  initSection(onigiriData,"rolls-section","roll");
  initSection(pokeData,"rolls-section","roll");
  initSection(saucesData,"sauces-container","sauce");
}

// ---------- כמות צ’ופסטיקס ----------
document.getElementById("chopsticks-minus").addEventListener("click", ()=> {
  if(chopsticksCount>1) chopsticksCount--;
  document.getElementById("chopsticks-qty").value=chopsticksCount;
  updateSummary();
});
document.getElementById("chopsticks-plus").addEventListener("click", ()=> {
  chopsticksCount++;
  document.getElementById("chopsticks-qty").value=chopsticksCount;
  updateSummary();
});

// ---------- שעות איסוף ----------
function initPickupTimes(){
  const select=document.getElementById("pickup-time");
  select.innerHTML="";
  let hour=19, min=30;
  while(hour<22 || (hour===22 && min<=30)){
    const timeStr=`${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
    if(!unavailableTimes.includes(timeStr)){
      const option=document.createElement("option"); option.value=timeStr; option.textContent=timeStr;
      select.appendChild(option);
    }
    min+=30; if(min===60){ hour++; min=0; }
  }
}

// ---------- סיכום הזמנה ----------
function updateSummary(){
  let text="הזמנה חדשה:\n";
  let totalRolls=0;
  
  // רולים
  for(const [id, qty] of Object.entries(selectedRolls)){
    if(qty>0){
      let item = [...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData].find(x=>x.id===id);
      text+=`${item.name} x${qty}\n`;
      totalRolls+=parseInt(qty);
    }
  }
  
  // רטבים
  let extraSauces=0;
  for(const [id, qty] of Object.entries(selectedSauces)){
    if(qty>0){
      let item = saucesData.find(x=>x.id===id);
      text+=`${item.name} x${qty}\n`;
      if(qty>2) extraSauces += (qty-2)*item.price;
    }
  }
  
  text+=`\nכמות צ’ופסטיקס: ${chopsticksCount}\n`;
  text+=`הערות: ${document.getElementById("notes").value.trim()}\n`;
  text+=`שעת איסוף: ${document.getElementById("pickup-time").value}\n`;
  text+=`כתובת: ${ADDRESS}\n`;
  text+=`סך רטבים נוספים: ${extraSauces}₪\n`;
  
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;
  
  if(totalRolls>10) text+=`נותרו עוד ${MAX_ROLLS_PER_DAY-totalRolls} רולים עד הסף היומי.\n`;
  
  document.getElementById("order-summary").textContent=text;
}

// ---------- Google login + שליחת הזמנה ----------
function handleGoogleLogin(response){
  const decoded=jwt_decode(response.credential);
  currentUser={name:decoded.name,email:decoded.email};
  alert(`שלום ${decoded.name}, ההזמנה שלך מוכנה לשליחה!`);
  sendOrder();
}

function sendOrder(){
  const pickup=document.getElementById("pickup-time").value;
  const totalRolls = Object.values(selectedRolls).reduce((a,b)=>a+b,0);
  
  if(totalRolls===0){ alert("בחר לפחות רול אחד"); return; }
  if(!pickup){ alert("בחר שעת איסוף"); return; }
  
  const payload={
    user: currentUser,
    rolls:selectedRolls,
    sauces:selectedSauces,
    chopsticks:chopsticksCount,
    notes:document.getElementById("notes").value.trim(),
    pickupTime:pickup,
    address:ADDRESS
  };
  
  fetch(MAKE_WEBHOOK_URL,{method:"POST", headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)})
    .then(()=> alert("ההזמנה נשלחה! יישלח גם אימייל ללקוח"))
    .catch(e=>{console.error(e); alert("שגיאה בשליחת ההזמנה"); });
}

// ---------- כפתור התחבר/שלח ----------
document.getElementById("send-order").addEventListener("click", ()=>{
  if(!currentUser){
    google.accounts.id.initialize({
      client_id: "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com",
      callback: handleGoogleLogin
    });
    google.accounts.id.prompt();
  } else sendOrder();
});

// ---------- אתחול ----------
initRollsAndSauces();
initPickupTimes();
updateSummary();
