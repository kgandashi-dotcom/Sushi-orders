// --- נתונים ---
let currentUser = null;
let chopsticksCount = 1;

const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const PICKUP_TIME = "21:30";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- כל הרולים ---
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
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק . מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי . מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו . מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:0},
  {id:"soy", name:"רוטב סויה", price:0},
  {id:"teriyaki", name:"רוטב טריאקי", price:0}
];

// --- בחירות ---
let rollsSelected = {};
let saucesSelected = {};

// --- יצירת כרטיס עם כמות ---
function createCard(item, container, selectedObj){
  const card=document.createElement("div");
  card.className=container.id.includes("sauces")?"sauce-card":"roll-card";

  const info=document.createElement("div");
  info.innerHTML=`<strong>${item.name}</strong><br>${item.description}`;
  card.appendChild(info);

  const controls=document.createElement("div");
  controls.className="quantity-control";

  const minusBtn=document.createElement("button");
  minusBtn.textContent="−";
  minusBtn.disabled=true;

  const qtyInput=document.createElement("input");
  qtyInput.type="number";
  qtyInput.min=0;
  qtyInput.value=0;
  qtyInput.readOnly=true;

  const plusBtn=document.createElement("button");
  plusBtn.textContent="+";

  controls.append(minusBtn, qtyInput, plusBtn);
  card.appendChild(controls);
  container.appendChild(card);

  plusBtn.addEventListener("click",()=>{
    qtyInput.value=parseInt(qtyInput.value)+1;
    selectedObj[item.id]=parseInt(qtyInput.value);
    minusBtn.disabled=false;
    updateSummary();
  });

  minusBtn.addEventListener("click",()=>{
    let val=parseInt(qtyInput.value)-1;
    if(val<0) val=0;
    qtyInput.value=val;
    if(val===0) delete selectedObj[item.id];
    else selectedObj[item.id]=val;
    minusBtn.disabled=val===0;
    updateSummary();
  });
}

// --- אתחול תפריט ---
function initMenu(){
  document.getElementById("insideOutRolls").innerHTML="";
  insideOutRollsData.forEach(r=>createCard(r, document.getElementById("insideOutRolls"), rollsSelected));

  document.getElementById("makiRolls").innerHTML="";
  makiRollsData.forEach(r=>createCard(r, document.getElementById("makiRolls"), rollsSelected));

  document.getElementById("onigiri").innerHTML="";
  onigiriData.forEach(r=>createCard(r, document.getElementById("onigiri"), rollsSelected));

  document.getElementById("poke").innerHTML="";
  pokeData.forEach(r=>createCard(r, document.getElementById("poke"), rollsSelected));

  document.getElementById("sauces").innerHTML="";
  saucesData.forEach(s=>createCard(s, document.getElementById("sauces"), saucesSelected));
}

// --- כמות צ'ופסטיקס ---
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

// --- סיכום הזמנה ---
function updateSummary(){
  let text="הזמנה חדשה:\n";
  if(Object.keys(rollsSelected).length===0){ text+="(לא נבחרו רולים עדיין)\n"; }
  text+=`כמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes=document.getElementById("notes").value.trim();
  if(notes) text+=`הערות: ${notes}\n`;
  text+=`כתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;
  document.getElementById("order-summary").textContent=text;
  document.getElementById("google-login").disabled=Object.keys(rollsSelected).length===0;
}

// --- שליחת הזמנה + WhatsApp ---
function sendOrder(){
  if(!currentUser || Object.keys(rollsSelected).length===0){ alert("בחר לפחות רול אחד"); return; }

  let orderText="הזמנה חדשה:\n";
  for(let id in rollsSelected){
    const r=[...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData].find(x=>x.id===id);
    orderText+=`${r.name} x${rollsSelected[id]}\n`;
  }
  orderText+="\nרטבים:\n";
  for(let id in saucesSelected){
    const s=saucesData.find(x=>x.id===id);
    orderText+=`${s.name} x${saucesSelected[id]}\n`;
  }
  orderText+=`כמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes=document.getElementById("notes").value.trim();
  if(notes) orderText+=`הערות: ${notes}\n`;
  orderText+=`כתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  orderText+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;

  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({user:currentUser, order:orderText})
  }).then(()=>{
    alert("ההזמנה נשלחה בהצלחה! הודעה גם נשלחה לוואטסאפ.");
    const waText=encodeURIComponent(orderText);
    if(currentUser.phone) window.open(`https://wa.me/${currentUser.phone}?text=${waText}`,'_blank');
  }).catch(err=>{
    console.error(err);
    alert("שגיאה בשליחת ההזמנה.");
  });
}

// --- התחברות Google ---
function handleGoogleLogin(response){
  const decoded=jwt_decode(response.credential);
  currentUser={name:decoded.name,email:decoded.email,phone:decoded.phone_number||''};
  document.getElementById("menu").style.display="block";
  initMenu();
  updateSummary();
  sendOrder(); // שליחה אוטומטית
}

// --- כפתור ביצוע / התחברות ---
document.getElementById("google-login").addEventListener("click",()=>{
  google.accounts.id.prompt();
});

// --- אתחול ---
updateSummary();
