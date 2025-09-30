let currentUser = null;
let chopsticksCount = 1;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const PICKUP_TIME = "21:30";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- נתונים ---
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
  {id:"pit", name:"פיט-בול - 70₪", description:" אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי . מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו . מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:0},
  {id:"soy", name:"רוטב סויה", price:0},
  {id:"teriyaki", name:"רוטב טריאקי", price:0}
];

// --- כרטיסים ---
function createCard(item, container) {
  const card = document.createElement("div");
  card.className = "roll-card";

  const title = document.createElement("h3");
  title.textContent = item.name;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = item.description;
  card.appendChild(desc);

  const qtyDiv = document.createElement("div");
  qtyDiv.className = "quantity-control";

  const minusBtn = document.createElement("button");
  minusBtn.textContent = "−";
  minusBtn.disabled = true;

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = 0;
  qtyInput.value = 0;
  qtyInput.readOnly = true;

  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+";

  qtyDiv.append(minusBtn, qtyInput, plusBtn);
  card.appendChild(qtyDiv);
  container.appendChild(card);

  plusBtn.addEventListener("click", () => {
    qtyInput.value = parseInt(qtyInput.value)+1;
    minusBtn.disabled = false;
    updateSummary();
  });
  minusBtn.addEventListener("click", () => {
    let val = parseInt(qtyInput.value)-1;
    if(val<0) val=0;
    qtyInput.value = val;
    minusBtn.disabled = val===0;
    updateSummary();
  });
}

function initMenu() {
  const insideOutContainer = document.getElementById("insideOutRolls");
  insideOutRollsData.forEach(r=>createCard(r,insideOutContainer));

  const makiContainer = document.getElementById("makiRolls");
  makiRollsData.forEach(r=>createCard(r,makiContainer));

  const onigiriContainer = document.getElementById("onigiriRolls");
  onigiriData.forEach(r=>createCard(r,onigiriContainer));

  const pokeContainer = document.getElementById("pokeRolls");
  pokeData.forEach(r=>createCard(r,pokeContainer));

  const saucesContainer = document.getElementById("sauces");
  saucesData.forEach(r=>createCard(r,saucesContainer));
}

// --- התחברות גוגל ---
function handleGoogleLogin(response) {
  const decoded = jwt_decode(response.credential);
  currentUser = { name: decoded.name, email: decoded.email, phone: decoded.phone_number||"" };
  alert("התחברת בהצלחה! כעת ניתן לשלוח הזמנה");
}

// --- סיכום ---
function updateSummary() {
  let text = "הזמנה חדשה:\n";
  let allSelected = false;

  // רולים
  ["insideOutRolls","makiRolls","onigiriRolls","pokeRolls","sauces"].forEach(id=>{
    const container = document.getElementById(id);
    Array.from(container.querySelectorAll(".roll-card")).forEach(card=>{
      const input = card.querySelector("input");
      if(parseInt(input.value)>0){
        allSelected=true;
        text+=`${card.querySelector("h3").textContent} x${input.value}\n`;
      }
    });
  });

  text += `\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = document.getElementById("notes").value.trim();
  if(notes) text+=`הערות: ${notes}\n`;
  text += `כתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\nטלפון: ${currentUser.phone}\n`;

  document.getElementById("order-summary").textContent = text;
  document.getElementById("send-order").disabled=!currentUser || !allSelected;
}

// --- צ'ופסטיקס ---
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

// --- שליחת הזמנה ---
document.getElementById("send-order").addEventListener("click",()=>{
  if(!currentUser){
    alert("אנא התחבר קודם");
    return;
  }
  const payload = { order: document.getElementById("order-summary").textContent, user: currentUser };
  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  }).then(()=>{
    alert("ההזמנה נשלחה בהצלחה!");
  }).catch(err=>{
    console.error(err);
    alert("שגיאה בשליחת ההזמנה.");
  });
});

initMenu();
updateSummary();
