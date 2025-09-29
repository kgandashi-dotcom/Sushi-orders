// --- הגדרות ---
let currentUser = null;
let chopsticksCount = 1;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const PICKUP_TIME = "21:30";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- נתוני רולים ---
const rollsData = [
  {id:"bingo", name:"רול בינגו - 50₪", description:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
  {id:"luna", name:"רול לונה - 50₪", description:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50},
  {id:"belgian", name:"רול ריי - 55₪", description:"טרטר ספייסי טונה נא על רול מלפפון, עירית ואושינקו", price:55},
  {id:"crazy-bruno", name:"רול קרייזי ברונו - 60₪", description:"דג לבן, טונה, סלמון בציפוי שומשום קלוי", price:60},
  {id:"happy-bruno", name:"רול האפי ברונו - 60₪", description:"סלמון בציפוי שקדים קלויים ורוטב טריאקי", price:60},
  {id:"mila", name:"רול מילה - 50₪", description:"בטטה, עירית ואבוקדו בעיטוף סלמון צרוב", price:50}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// --- יצירת כרטיסים ---
function createRollCard(item, container){
  const card=document.createElement("div");
  card.className="roll-card";
  const title=document.createElement("h3");
  title.textContent=item.name;
  const desc=document.createElement("p");
  desc.textContent=item.description;
  card.append(title,desc);
  container.appendChild(card);
}

function initRolls(){ const container=document.getElementById("rolls-container"); container.innerHTML=""; rollsData.forEach(r=>createRollCard(r,container)); }
function initSauces(){ const container=document.getElementById("sauces-container"); container.innerHTML=""; saucesData.forEach(s=>createRollCard(s,container)); }

// --- Google Login Popup Mode ---
function handleGoogleLogin(response){
  const decoded=jwt_decode(response.credential);
  currentUser={name:decoded.name,email:decoded.email};
  document.getElementById("social-login").style.display="none";
  document.getElementById("order-section").style.display="block";
  initRolls();
  initSauces();
  updateSummary();
}

window.onload=function(){
  google.accounts.id.initialize({
    client_id:"962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com",
    callback:handleGoogleLogin,
    ux_mode:"popup"
  });
  google.accounts.id.renderButton(
    document.getElementById("google-button"),
    {theme:"outline",size:"large"}
  );
}

// --- סיכום הזמנה ---
function updateSummary(){
  let text=`הזמנה חדשה:\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes=document.getElementById("notes").value.trim();
  if(notes) text+=`\nהערות: ${notes}\n`;
  text+=`\nכתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;
  document.getElementById("order-summary").textContent=text;
  document.getElementById("send-order").disabled=!currentUser;
}

// --- כמות צ’ופסטיקס ---
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

// --- שליחת הזמנה ל-Make ---
document.getElementById("send-order").addEventListener("click",()=>{
  if(!currentUser){ alert("אנא התחבר קודם"); return; }
  const payload={user:currentUser,chopsticksCount,notes:document.getElementById("notes").value.trim(),address:ADDRESS,pickupTime:PICKUP_TIME};
  fetch(MAKE_WEBHOOK_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  }).then(()=>{ alert("ההזמנה נשלחה בהצלחה!"); document.getElementById("notes").value=''; chopsticksCount=1; updateSummary(); })
    .catch(err=>{ console.error(err); alert("שגיאה בשליחת ההזמנה."); });
});
