// --- נתונים ---
let currentUser = null;
let chopsticksCount = 1;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const PICKUP_TIME = "21:30";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

const rollsData = [
  { id:"bingo", name:"רול בינגו - 50₪", description:"סלמון נא, שמנת, אבוקדו", price:50 },
  { id:"luna", name:"רול לונה - 50₪", description:"ספייסי סלמון, בטטה, אבוקדו", price:50 },
  { id:"belgian", name:"רול ריי - 55₪", description:"טרטר טונה, מלפפון, עירית", price:55 }
];

const saucesData = [
  { id:"spicy-mayo", name:"ספייסי מיונז" },
  { id:"soy", name:"רוטב סויה" },
  { id:"teriyaki", name:"רוטב טריאקי" }
];

// --- יצירת כרטיסים ---
function createRollCard(item, container) {
  const card = document.createElement("div");
  card.className = "roll-card";

  const title = document.createElement("h3");
  title.textContent = item.name;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = item.description;
  card.appendChild(desc);

  container.appendChild(card);
}

function initRolls() {
  const container = document.getElementById("rolls-container");
  container.innerHTML = "";
  rollsData.forEach(r => createRollCard(r, container));
}

function initSauces() {
  const container = document.getElementById("sauces-container");
  container.innerHTML = "";
  saucesData.forEach(s => createRollCard(s, container));
}

// --- התחברות גוגל ---
function handleGoogleLogin(response) {
  const decoded = jwt_decode(response.credential);
  currentUser = { name: decoded.name, email: decoded.email };
  document.getElementById("social-login").style.display = "none";
  document.getElementById("order-section").style.display = "block";

  initRolls();
  initSauces();
  updateSummary();
}

// --- סיכום ---
function updateSummary() {
  let text = `הזמנה חדשה:\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = document.getElementById("notes").value.trim();
  if (notes) text += `\nהערות: ${notes}\n`;
  text += `\nכתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  if (currentUser) text += `לקוח: ${currentUser.name} (${currentUser.email})\n`;

  document.getElementById("order-summary").textContent = text;
  document.getElementById("send-order").disabled = !currentUser;
}

// --- כמות צ’ופסטיקס ---
document.getElementById("chopsticks-minus").addEventListener("click", () => {
  if(chopsticksCount>1) chopsticksCount--;
  document.getElementById("chopsticks-qty").value = chopsticksCount;
  updateSummary();
});
document.getElementById("chopsticks-plus").addEventListener("click", () => {
  chopsticksCount++;
  document.getElementById("chopsticks-qty").value = chopsticksCount;
  updateSummary();
});

// --- שליחת הזמנה ל-Make ---
document.getElementById("send-order").addEventListener("click", () => {
  if(!currentUser){ alert("אנא התחבר קודם"); return; }

  const payload = {
    user: currentUser,
    chopsticksCount,
    notes: document.getElementById("notes").value.trim(),
    address: ADDRESS,
    pickupTime: PICKUP_TIME
  };

  fetch(MAKE_WEBHOOK_URL, {
   
