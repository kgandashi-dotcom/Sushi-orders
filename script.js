// --- נתונים ---
let currentUser = null;
let chopsticksCount = 1;
const MAX_ROLLS_PER_DAY = 15;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- רולים ---
const rollsData = [
  // Inside-out Rolls
  {id:"bingo", name:"רול בינגו", price:50},
  {id:"luna", name:"רול לונה", price:50},
  {id:"belgian", name:"רול ריי", price:55},
  {id:"crazy-bruno", name:"רול קרייזי ברונו", price:60},
  {id:"happy-bruno", name:"רול האפי ברונו", price:60},
  {id:"mila", name:"רול מילה", price:50},
  {id:"newton", name:"רול ניוטון", price:55},
  {id:"oli", name:"רול אולי", price:50},
  {id:"milli", name:"רול מילי", price:50},
  {id:"scar", name:"רול סקאר", price:50},
  {id:"magi", name:"רול מגי🌱", price:40},
  {id:"tyson", name:"רול טייסון וקיילה", price:50},
  {id:"lucy", name:"רול לוסי", price:55},
  {id:"billy", name:"רול בילי", price:50},
  {id:"lucky", name:"רול לאקי", price:50},
  // Maki
  {id:"alfi", name:"רול אלפי", price:35},
  {id:"maymay", name:"רול מיי מיי🌱", price:25},
  {id:"snoopy", name:"רול סנופי🌱", price:25},
  // Onigiri
  {id:"rocky", name:"אוניגירי רוקי", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱", price:25},
  // Poke
  {id:"dog", name:"בול-דוג", price:60},
  {id:"pit", name:"פיט-בול", price:70},
  {id:"trir", name:"בול-טרייר🌱", price:45}
];

// --- רטבים ---
const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

const userSelections = {
  rolls:{}, // id -> quantity
  sauces:{}, // id -> quantity
  chopsticks:1,
  notes:"",
  pickupTime:""
};

// --- יצירת כרטיסים ---
function createCard(item, container, type){
  const card = document.createElement("div");
  card.className = type+"-card";

  const title = document.createElement("h3");
  title.textContent = item.name + (item.price?" - "+item.price+"₪":"");
  card.appendChild(title);

  // כפתורי כמות אם זה רול
  if(type==="roll"){
    const controls = document.createElement("div");
    controls.className="quantity-control";
    const minus = document.createElement("button");
    minus.textContent="−";
    const qtyInput = document.createElement("input");
    qtyInput.type="number";
    qtyInput.value=userSelections.rolls[item.id]||0;
    qtyInput.readOnly=true;
    const plus = document.createElement("button");
    plus.textContent="+";

    minus.onclick=()=>{
      if((userSelections.rolls[item.id]||0)>0) userSelections.rolls[item.id]--;
      qtyInput.value=userSelections.rolls[item.id]||0;
      updateSummary();
    };
    plus.onclick=()=>{
      userSelections.rolls[item.id]=(userSelections.rolls[item.id]||0)+1;
      qtyInput.value=userSelections.rolls[item.id];
      updateSummary();
    };

    controls.appendChild(minus);
    controls.appendChild(qtyInput);
    controls.appendChild(plus);
    card.appendChild(controls);
  }

  container.appendChild(card);
}

// --- התחלת הצגת כל הקטגוריות ---
function initMenu(){
  const rollsContainer=document.getElementById("rolls-container");
  rollsContainer.innerHTML="";
  rollsData.forEach(r=>createCard(r,rollsContainer,"roll"));

  const saucesContainer=document.getElementById("sauces-container");
  saucesContainer.innerHTML="";
  saucesData.forEach(s=>createCard(s,saucesContainer,"sauce"));

  document.getElementById("chopsticks-qty").value=userSelections.chopsticks;
}

// --- חישוב סיכום ---
function updateSummary(){
  let totalRolls=0;
  let text="הזמנה חדשה:\n";

  for(const id in userSelections.rolls){
    const qty=userSelections.rolls[id];
    if(qty>0){
      const roll=rollsData.find(r=>r.id===id);
      text+=`${roll.name} x${qty} - ${roll.price*qty}₪\n`;
      totalRolls+=qty;
    }
  }

  text+=`\nרוטבים:\n`;
  for(const id in userSelections.sauces){
    const qty=userSelections.sauces[id];
    if(qty>2) qtyExtra=qty-2; else qtyExtra=0;
    if(qty>0){
      const sauce=saucesData.find(s=>s.id===id);
      text+=`${sauce.name} x${qty} (תוספת ${qtyExtra*3}₪)\n`;
    }
  }

  text+=`\nצ'ופסטיקס: ${userSelections.chopsticks}\n`;
  text+=`הערות: ${userSelections.notes}\n`;
  text+=`שעת איסוף: ${userSelections.pickupTime||"לא נבחרה"}\n`;
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;

  document.getElementById("order-summary").textContent=text;
  document.getElementById("send-order").disabled=totalRolls===0 || !userSelections.pickupTime;
}

// --- כפתורי צ’ופסטיקס ---
document.getElementById("chopsticks-minus").onclick=()=>{
  if(userSelections.chopsticks>1) userSelections.chopsticks--;
  document.getElementById("chopsticks-qty").value=userSelections.chopsticks;
  updateSummary();
};
document.getElementById("chopsticks-plus").onclick=()=>{
  userSelections.chopsticks++;
  document.getElementById("chopsticks-qty").value=userSelections.chopsticks;
  updateSummary();
};

// --- בחירת שעת איסוף ---
function initPickupTimes(){
  const select=document.getElementById("pickup-time");
  select.innerHTML='<option value="">בחר שעה</option>';
  const times=["19:30","20:00","20:30","21:00","21:30","22:00","22:30"];
  times.forEach(t=>{
    const opt=document.createElement("option");
    opt.value=t;
    opt.textContent=t;
    select.appendChild(opt);
  });
  select.onchange=()=>{userSelections.pickupTime=select.value; updateSummary();}
}

// --- התחברות בגוגל בעת לחיצה על כפתור ---
document.getElementById("send-order").onclick=()=>{
  const totalRolls=Object.values(userSelections.rolls).reduce((a,b)=>a+b,0);
  if(totalRolls===0){
    alert("בחר לפחות רול אחד לפני השליחה");
    return;
  }
  if(!userSelections.pickupTime){
    alert("בחר שעת איסוף");
    return;
  }

  // אם לא מחובר - התחבר
  if(!currentUser){
    google.accounts.id.prompt();
    google.accounts.id.initialize({
      client_id:"962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com",
      callback: handleGoogleLogin
    });
    return;
  }

  sendOrder();
};

// --- Callback של גוגל ---
function handleGoogleLogin(response){
  const decoded=jwt_decode(response.credential);
  currentUser={name:decoded.name,email:decoded.email};
  alert("התחברת בהצלחה! ההזמנה שלך נשמרת");
  updateSummary();
  sendOrder();
}

// --- שליחת ההזמנה ל-Make + וואטסאפ ---
function sendOrder(){
  const payload={user:currentUser, selections:userSelections};
  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  })
  .then(()=>{ 
    alert("ההזמנה נשלחה בהצלחה! גם למייל וגם לוואטסאפ.");
    initMenu(); 
    userSelections.rolls={}; 
    userSelections.sauces={};
    userSelections.chopsticks=1;
    userSelections.notes="";
    userSelections.pickupTime="";
    updateSummary();
  })
  .catch(err=>{console.error(err); alert("שגיאה בשליחת ההזמנה.");});
}

// --- Init ---
initMenu();
initPickupTimes();
updateSummary();
