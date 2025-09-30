// -------------------------
// נתוני רולים
// -------------------------
const insideOutRolls = [
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

const makiRolls = [
  {id:"alfi", name:"רול אלפי - 35₪", description:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי🌱 - 25₪", description:"מאקי בטטה ואבוקדו", price:25},
  {id:"snoopy", name:"רול סנופי🌱 - 25₪", description:"מאקי אושינקו וקנפיו", price:25}
];

const onigiriRolls = [
  {id:"rocky", name:"אוניגירי רוקי - 35₪", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני - 30₪", description:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱 - 25₪", description:"אבוקדו ובטטה", price:25}
];

const pokeRolls = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק . מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי . מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו . מעל שומשום ורוטב בוטנים", price:45}
];

const sauces = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// -------------------------
// משתנים גלובליים
// -------------------------
let currentUser = null;
let selectedRolls = {};
let selectedSauces = {};
let chopsticksCount = 1;
let selectedTime = "";
const MAX_ROLLS_PER_DAY = 15;
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// -------------------------
// פונקציות עזר ליצירת כרטיסים
// -------------------------
function createRollCard(item, container) {
  const card = document.createElement("div");
  card.className = "roll-card";

  const infoDiv = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.name;
  const desc = document.createElement("p");
  desc.textContent = item.description;
  infoDiv.appendChild(title);
  infoDiv.appendChild(desc);

  const qtyDiv = document.createElement("div");
  qtyDiv.className = "quantity-control";

  const minusBtn = document.createElement("button");
  minusBtn.textContent = "−";
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.value = 0;
  qtyInput.readOnly = true;
  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+";

  minusBtn.onclick = () => {
    if (qtyInput.value > 0) {
      qtyInput.value--;
      selectedRolls[item.id] = qtyInput.value;
      updateSummary();
    }
  };
  plusBtn.onclick = () => {
    qtyInput.value++;
    selectedRolls[item.id] = qtyInput.value;
    updateSummary();
  };

  qtyDiv.appendChild(minusBtn);
  qtyDiv.appendChild(qtyInput);
  qtyDiv.appendChild(plusBtn);

  card.appendChild(infoDiv);
  card.appendChild(qtyDiv);

  container.appendChild(card);
}

// -------------------------
// רוטבים
// -------------------------
function createSauceCard(item, container) {
  const card = document.createElement("div");
  card.className = "sauce-card";

  const title = document.createElement("h3");
  title.textContent = item.name;

  const qtyDiv = document.createElement("div");
  qtyDiv.className = "quantity-control";

  const minusBtn = document.createElement("button");
  minusBtn.textContent = "−";
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.value = 0;
  qtyInput.readOnly = true;
  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+";

  minusBtn.onclick = () => {
    if (qtyInput.value > 0) {
      qtyInput.value--;
      selectedSauces[item.id] = qtyInput.value;
      updateSummary();
    }
  };
  plusBtn.onclick = () => {
    qtyInput.value++;
    selectedSauces[item.id] = qtyInput.value;
    updateSummary();
  };

  qtyDiv.appendChild(minusBtn);
  qtyDiv.appendChild(qtyInput);
  qtyDiv.appendChild(plusBtn);

  card.appendChild(title);
  card.appendChild(qtyDiv);

  container.appendChild(card);
}

// -------------------------
// אתחול התפריט
// -------------------------
function initMenu() {
  const sections = [
    {data: insideOutRolls, containerId:"insideout-container"},
    {data: makiRolls, containerId:"maki-container"},
    {data: onigiriRolls, containerId:"onigiri-container"},
    {data: pokeRolls, containerId:"poke-container"}
  ];
  sections.forEach(sec => {
    const container = document.getElementById(sec.containerId);
    container.innerHTML = "";
    sec.data.forEach(item => createRollCard(item, container));
  });

  const sauceContainer = document.getElementById("sauces-container");
  sauceContainer.innerHTML = "";
  sauces.forEach(item => createSauceCard(item, sauceContainer));
}

// -------------------------
// סיכום הזמנה
// -------------------------
function updateSummary() {
  let text = "";

  // רולים
  let totalRolls = 0;
  Object.keys(selectedRolls).forEach(id => {
    const qty = parseInt(selectedRolls[id]);
    if(qty>0){
      let item = [...insideOutRolls,...makiRolls,...onigiriRolls,...pokeRolls].find(r=>r.id===id);
      text += `${item.name} × ${qty} = ${item.price*qty}₪\n`;
      totalRolls += qty;
    }
  });

  if(totalRolls===0) {
    document.getElementById("send-order").disabled = true;
    document.getElementById("order-summary").textContent = "אנא בחר רול לפחות אחד.";
    return;
  }

  // רטבים
  let extraSaucesCost = 0;
  Object.keys(selectedSauces).forEach(id => {
    const qty = parseInt(selectedSauces[id]);
    if(qty>2) extraSaucesCost += (qty-2)*3;
    text += `${sauces.find(s=>s.id===id).name} × ${qty}\n`;
  });

  text += `צ'ופסטיקס: ${chopsticksCount}\n`;

  text += `סה"כ רולים: ${totalRolls}\nעלות רטבים נוספים: ${extraSaucesCost}₪\n`;

  if(selectedTime) text += `שעת איסוף: ${selectedTime}\n`;

  if(currentUser) text += `לקוח: ${currentUser.name} (${currentUser.email})\n`;

  document.getElementById("order-summary").textContent = text;
  document.getElementById("send-order").disabled = !currentUser || totalRolls===0 || !selectedTime;
}

// -------------------------
// לחיצה על כפתור שליחה/התחברות
// -------------------------
document.getElementById("send-order").addEventListener("click", () => {
  if(!currentUser){
    alert("אנא התחבר עם גוגל לפני השליחה.");
    return;
  }
  if(!selectedTime){
    alert("אנא בחר שעת איסוף.");
    return;
  }
  let totalRolls = Object.values(selectedRolls).reduce((a,b)=>a+parseInt(b),0);
  if(totalRolls===0){
    alert("בחר לפחות רול אחד להזמנה.");
    return;
  }

  const payload = {
    user: currentUser,
    rolls: selectedRolls,
    sauces: selectedSauces,
    chopsticks: chopsticksCount,
    pickupTime: selectedTime
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(()=> alert("ההזמנה נשלחה בהצלחה!"))
  .catch(err=>{ console.error(err); alert("שגיאה בשליחת ההזמנה."); });
});

// -------------------------
// התחברות בגוגל
// -------------------------
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = {
    name: decoded.name,
    email: decoded.email,
    phone: decoded.phone_number || ""
  };
  updateSummary();
}

// -------------------------
// אתחול ראשוני
// -------------------------
window.onload = function(){
  initMenu();
  updateSummary();
};
