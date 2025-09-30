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
function createCard(item, container) {
  const card = document.createElement("div");
  card.className = container.id.includes("sauces") ? "sauce-item" : "roll-card";

  const title = document.createElement("span");
  title.textContent = item.name;
  card.appendChild(title);

  const qtyDiv = document.createElement("div");
  qtyDiv.className = "quantity-control";

  const minusBtn = document.createElement("button");
  minusBtn.textContent = "−";
  minusBtn.addEventListener("click", ()=>{
    const input = qtyDiv.querySelector("input");
    if(parseInt(input.value)>0) input.value = parseInt(input.value)-1;
    updateSummary();
  });
  qtyDiv.appendChild(minusBtn);

  const input = document.createElement("input");
  input.type = "number";
  input.value = 0;
  input.readOnly = true;
  qtyDiv.appendChild(input);

  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+";
  plusBtn.addEventListener("click", ()=>{
    const input = qtyDiv.querySelector("input");
    input.value = parseInt(input.value)+1;
    updateSummary();
  });
  qtyDiv.appendChild(plusBtn);

  card.appendChild(qtyDiv);
  container.appendChild(card);
}

// --- אתחול קטגוריות ---
function initCategories() {
  const containers = [
    {data: insideOutRollsData, container: document.getElementById("insideout-container")},
    {data: makiRollsData, container: document.getElementById("maki-container")},
    {data: onigiriData, container: document.getElementById("onigiri-container")},
    {data: pokeData, container: document.getElementById("poke-container")},
    {data: saucesData, container: document.getElementById("sauces-container")}
  ];

  containers.forEach(obj=>{
    obj.data.forEach(item=>{
      createCard(item,obj.container);
    });
  });
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

// --- סיכום הזמנה ---
function updateSummary() {
  let summary = "הזמנה חדשה:\n";

  // רולים
  ["insideout-container","maki-container","onigiri-container","poke-container"].forEach(id=>{
    const container = document.getElementById(id);
    container.querySelectorAll(".roll-card").forEach(card=>{
      const qty = parseInt(card.querySelector("input").value);
      if(qty>0) summary += `${card.querySelector("span").textContent} × ${qty}\n`;
    });
  });

  // רטבים
  const saucesSummary = [];
  document.getElementById("sauces-container").querySelectorAll(".sauce-item").forEach(card=>{
    const qty = parseInt(card.querySelector("input").value);
    if(qty>0) saucesSummary.push(`${card.querySelector("span").textContent} × ${qty}`);
  });
  if(saucesSummary.length>0) summary += "רטבים:\n" + saucesSummary.join(", ") + "\n";

  summary += `צ’ופסטיקס: ${chopsticksCount}\n`;
  summary += `הערות: ${document.getElementById("notes").value.trim()}\n`;
  if(currentUser) summary += `לקוח: ${currentUser.name} (${currentUser.email})\n`;

  document.getElementById("order-summary").textContent = summary;
}

// --- התחברות ושליחה ---
document.getElementById("send-order").addEventListener("click", ()=>{
  const hasRolls = Array.from(document.querySelectorAll(".roll-card input")).some(i=>parseInt(i.value)>0);
  if(!hasRolls){ alert("אנא בחר לפחות רול אחד"); return; }

  // אם לא מחובר, פתח גוגל login
  if(!currentUser){
    google.accounts.id.prompt();
    return;
  }

  // יצירת payload ושליחה
  const payload = {
    user: currentUser,
    chopsticksCount,
    notes: document.getElementById("notes").value.trim()
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  }).then(()=>{ alert("ההזמנה נשלחה!"); }).catch(e=>{console.error(e); alert("שגיאה בשליחה"); });
});

// --- התחברות גוגל ---
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = {name:decoded.name,email:decoded.email, picture:decoded.picture};
  alert(`התחברת בהצלחה כ ${currentUser.name}`);
  updateSummary();
}

// --- אתחול ---
initCategories();
updateSummary();
