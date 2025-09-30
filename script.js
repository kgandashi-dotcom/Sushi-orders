// --- נתונים ---
let currentUser = null;
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};
let selectedPickupTime = "";

const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- זמני איסוף ---
const pickupTimes = [
  "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
];

// --- הרולים לפי קטגוריות ---
const rollsData = {
  "Inside Out": [
    {id:"bingo", name:"רול בינגו - 50₪", description:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
    {id:"luna", name:"רול לונה - 50₪", description:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50}
  ],
  "Maki": [
    {id:"alfi", name:"רול אלפי - 35₪", description:"מאקי סלמון", price:35}
  ],
  "Onigiri": [
    {id:"rocky", name:"אוניגירי רוקי - 35₪", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35}
  ],
  "Poke": [
    {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק", price:60}
  ]
};

// --- רטבים ---
const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// --- יצירת כרטיסי רולים ---
function createRollCard(roll, container) {
  const card = document.createElement("div");
  card.className = "roll-card";

  const title = document.createElement("h3");
  title.textContent = roll.name;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = roll.description;
  card.appendChild(desc);

  const quantity = document.createElement("div");
  quantity.className = "quantity-control";

  const minus = document.createElement("button");
  minus.textContent = "−";
  minus.addEventListener("click", () => {
    if(selectedRolls[roll.id] > 0) selectedRolls[roll.id]--;
    qty.value = selectedRolls[roll.id];
    updateSummary();
  });

  const qty = document.createElement("input");
  qty.type = "number";
  qty.value = selectedRolls[roll.id] || 0;
  qty.readOnly = true;

  const plus = document.createElement("button");
  plus.textContent = "+";
  plus.addEventListener("click", () => {
    selectedRolls[roll.id] = (selectedRolls[roll.id] || 0) + 1;
    qty.value = selectedRolls[roll.id];
    updateSummary();
  });

  quantity.appendChild(minus);
  quantity.appendChild(qty);
  quantity.appendChild(plus);

  card.appendChild(quantity);
  container.appendChild(card);
}

// --- יצירת רטבים ---
function createSauceCard(sauce, container) {
  const card = document.createElement("div");
  card.className = "sauce-card";

  const title = document.createElement("h4");
  title.textContent = sauce.name;
  card.appendChild(title);

  const quantity = document.createElement("div");
  quantity.className = "quantity-control";

  const minus = document.createElement("button");
  minus.textContent = "−";
  minus.addEventListener("click", () => {
    if(selectedSauces[sauce.id] > 0) selectedSauces[sauce.id]--;
    qty.value = selectedSauces[sauce.id] || 0;
    updateSummary();
  });

  const qty = document.createElement("input");
  qty.type = "number";
  qty.value = selectedSauces[sauce.id] || 0;
  qty.readOnly = true;

  const plus = document.createElement("button");
  plus.textContent = "+";
  plus.addEventListener("click", () => {
    selectedSauces[sauce.id] = (selectedSauces[sauce.id] || 0) + 1;
    qty.value = selectedSauces[sauce.id];
    updateSummary();
  });

  quantity.appendChild(minus);
  quantity.appendChild(qty);
  quantity.appendChild(plus);

  card.appendChild(quantity);
  container.appendChild(card);
}

// --- אתחול תפריט ---
function initMenu() {
  const rollsContainer = document.getElementById("rolls-container");
  rollsContainer.innerHTML = "";
  for(const category in rollsData){
    const catTitle = document.createElement("h2");
    catTitle.textContent = category;
    rollsContainer.appendChild(catTitle);
    rollsData[category].forEach(r => createRollCard(r, rollsContainer));
  }

  const saucesContainer = document.getElementById("sauces-container");
  saucesContainer.innerHTML = "";
  saucesData.forEach(s => createSauceCard(s, saucesContainer));
}

// --- עדכון סיכום ---
function updateSummary() {
  let text = "סיכום הזמנה:\n\n";

  let totalRolls = 0;
  for(const cat in rollsData){
    rollsData[cat].forEach(r=>{
      const qty = selectedRolls[r.id] || 0;
      if(qty>0){
        text += `${r.name} x${qty} (${r.price*qty}₪)\n`;
        totalRolls += qty;
      }
    });
  }

  let totalSauces = 0;
  for(const s of saucesData){
    const qty = selectedSauces[s.id] || 0;
    if(qty>2) totalSauces += (qty-2)*3; // על כל רוטב נוסף 3₪
    if(qty>0) text += `${s.name} x${qty} ${qty>2?`(+${(qty-2)*3}₪)`:"(2 חינם)"}\n`;
  }

  text += `\nכמות צ’ופסטיקס: ${chopsticksCount}\n`;
  text += `הערות: ${document.getElementById("notes").value}\n`;
  text += `שעת איסוף: ${selectedPickupTime || "לא נבחרה"}\n`;
  text += `כתובת: ${ADDRESS}\n`;
  if(currentUser) text += `לקוח: ${currentUser.name} (${currentUser.email})\n`;

  document.getElementById("order-summary").textContent = text;
}

// --- כמות צ’ופסטיקס ---
document.getElementById("chopsticks-minus").addEventListener("click", ()=>{
  if(chopsticksCount>1) chopsticksCount--;
  document.getElementById("chopsticks-qty").value = chopsticksCount;
  updateSummary();
});
document.getElementById("chopsticks-plus").addEventListener("click", ()=>{
  chopsticksCount++;
  document.getElementById("chopsticks-qty").value = chopsticksCount;
  updateSummary();
});

// --- בחירת שעת איסוף ---
const pickupSelect = document.getElementById("pickup-time");
pickupTimes.forEach(time=>{
  const option = document.createElement("option");
  option.value = time;
  option.textContent = time;
  pickupSelect.appendChild(option);
});
pickupSelect.addEventListener("change", ()=>{
  selectedPickupTime = pickupSelect.value;
  updateSummary();
});

// --- Google Login ---
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = {name: decoded.name, email: decoded.email, phone: decoded.phoneNumber||""};
  alert(`שלום ${currentUser.name}, ההזמנה מוכנה לשליחה`);
  updateSummary();
}

// --- שליחת הזמנה / התחברות ---
document.getElementById("order-button").addEventListener("click", ()=>{
  // בדיקות
  if(Object.values(selectedRolls).reduce((a,b)=>a+b,0)==0){
    alert("אנא בחר לפחות רול אחד");
    return;
  }
  if(!selectedPickupTime){
    alert("אנא בחר שעת איסוף");
    return;
  }

  // אם לא מחובר - התחבר
  if(!currentUser){
    google.accounts.id.prompt();
    return;
  }

  const payload = {
    user: currentUser,
    rolls: selectedRolls,
    sauces: selectedSauces,
    chopsticks: chopsticksCount,
    pickupTime: selectedPickupTime,
    notes: document.getElementById("notes").value
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  }).then(()=>{
    alert("ההזמנה נשלחה! בדוק את המייל או WhatsApp שלך.");
  }).catch(err=>{
    console.error(err);
    alert("שגיאה בשליחת ההזמנה");
  });
});

// --- אתחול ---
initMenu();
updateSummary();
