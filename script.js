// --- נתונים ---
let currentUser = null;
let chopsticksCount = 1;
let selectedRolls = {};
let selectedSauces = {};
let selectedTime = '';
const MAX_ROLLS_PER_DAY = 15;
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";

// --- שעות איסוף חצי שעה בין 19:30 ל-22:30 ---
const pickupTimes = [];
for(let h=19; h<=22; h++){
  [0,30].forEach(m=>{
    const hour = h.toString().padStart(2,'0');
    const min = m.toString().padStart(2,'0');
    const time = `${hour}:${min}`;
    if(!(h===22 && m>30)) pickupTimes.push(time);
  });
}

// --- רולים ---
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
  {id:"scar", name:"רול סקאר - 50₪", description:"ספייסי סלמון אפוי עם אבוקדו, מלפפון ובטטה בעיטור מיונז וציפס", price:50},
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

const onigiri = [
  {id:"rocky", name:"אוניגירי רוקי - 35₪", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני - 30₪", description:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱 - 25₪", description:"אבוקדו ובטטה", price:25}
];

const poke = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק. מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי. מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו. מעל שומשום ורוטב בוטנים", price:45}
];

// רטבים
const sauces = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:3},
  {id:"soy", name:"רוטב סויה", price:3},
  {id:"teriyaki", name:"רוטב טריאקי", price:3}
];

// --- פונקציות עזר ---
function createRollCard(item, container){
  const card = document.createElement("div");
  card.className="roll-card";
  
  const title = document.createElement("h3");
  title.textContent=item.name;
  card.appendChild(title);
  
  const desc = document.createElement("p");
  desc.textContent=item.description;
  card.appendChild(desc);
  
  // כפתורי כמות
  const qDiv = document.createElement("div");
  qDiv.className="quantity-control";
  const minus = document.createElement("button");
  minus.textContent="−";
  const input = document.createElement("input");
  input.type="number";
  input.value=0;
  input.readOnly=true;
  const plus = document.createElement("button");
  plus.textContent="+";
  
  minus.addEventListener("click", ()=>{
    if(input.value>0) input.value--;
    selectedRolls[item.id] = parseInt(input.value);
    updateSummary();
  });
  plus.addEventListener("click", ()=>{
    input.value++;
    selectedRolls[item.id] = parseInt(input.value);
    updateSummary();
  });
  
  qDiv.appendChild(minus);
  qDiv.appendChild(input);
  qDiv.appendChild(plus);
  card.appendChild(qDiv);
  
  container.appendChild(card);
}

// רטבים
function createSauceCard(item, container){
  const card = document.createElement("div");
  card.className="sauce-card";
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type="checkbox";
  checkbox.addEventListener("change", ()=>{
    selectedSauces[item.id] = checkbox.checked;
    updateSummary();
  });
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(item.name+" (+3₪ מעל שני חינם)"));
  card.appendChild(label);
  container.appendChild(card);
}

// הצגת כל התפריט
function displayMenu(){
  const rollContainer = document.getElementById("rolls-container");
  rollContainer.innerHTML="";
  insideOutRolls.concat(makiRolls, onigiri, poke).forEach(r=>{
    createRollCard(r, rollContainer);
  });
  
  const sauceContainer = document.getElementById("sauces-container");
  sauceContainer.innerHTML="";
  sauces.forEach(s=>createSauceCard(s,sauceContainer));
  
  const timeSelect = document.getElementById("pickup-time");
  timeSelect.innerHTML="";
  pickupTimes.forEach(t=>{
    const option = document.createElement("option");
    option.value=t;
    option.textContent=t;
    timeSelect.appendChild(option);
  });
}

// --- סיכום ---
function updateSummary(){
  let totalR = 0;
  let text = "הזמנה חדשה:\n";
  for(let key in selectedRolls){
    if(selectedRolls[key]>0){
      totalR += selectedRolls[key];
      text += `${key}: ${selectedRolls[key]} יחידות\n`;
    }
  }
  if(totalR>MAX_ROLLS_PER_DAY){
    alert("לא ניתן להזמין יותר מ-15 רולים ביום");
    return;
  }
  
  text += `\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  
  // רטבים מעבר לשניים
  let extraSauceCount = 0;
  for(let s in selectedSauces){
    if(selectedSauces[s]) extraSauceCount++;
  }
  if(extraSauceCount>2) text += `\nתוספת רטבים: ${extraSauceCount-2} (3₪ כל אחד)\n`;
  
  text += `שעת איסוף: ${selectedTime || "לא נבחרה"}\n`;
  
  const notes = document.getElementById("notes").value.trim();
  if(notes) text += `הערות: ${notes}\n`;
  
  if(currentUser) text += `לקוח: ${currentUser.name} (${currentUser.email})\nטלפון: ${currentUser.phone || "לא קיים"}\n`;
  
  document.getElementById("order-summary").textContent=text;
}

// --- כפתורי צ'ופסטיקס ---
document.getElementById("chopsticks-minus").addEventListener("click", ()=>{
  if(chopsticksCount>1) chopsticksCount--;
  document.getElementById("chopsticks-qty").value=chopsticksCount;
  updateSummary();
});
document.getElementById("chopsticks-plus").addEventListener("click", ()=>{
  chopsticksCount++;
  document.getElementById("chopsticks-qty").value=chopsticksCount;
  updateSummary();
});

// --- בחירת שעה ---
document.getElementById("pickup-time").addEventListener("change",(e)=>{
  selectedTime=e.target.value;
  updateSummary();
});

// --- התחברות/שליחת הזמנה ---
document.getElementById("send-order").addEventListener("click",()=>{
  // בדיקה אם בחרו לפחות רול אחד
  let anyRoll = Object.values(selectedRolls).some(v=>v>0);
  if(!anyRoll){ alert("בחר לפחות רול אחד"); return; }
  
  if(!currentUser){
    // התחברות גוגל
    google.accounts.id.prompt();
    return;
  }
  
  const payload = {
    user: currentUser,
    rolls: selectedRolls,
    sauces: selectedSauces,
    chopsticks: chopsticksCount,
    pickupTime: selectedTime,
    notes: document.getElementById("notes").value.trim()
  };
  
  fetch(MAKE_WEBHOOK_URL,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(()=> alert("ההזמנה נשלחה בהצלחה!"))
  .catch(err=>{ console.error(err); alert("שגיאה בשליחת ההזמנה"); });
});

// --- התחברות גוגל ---
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = {name: decoded.name, email: decoded.email, phone: decoded.phoneNumber};
  updateSummary();
}

// --- התחלת תצוגה ---
displayMenu();
updateSummary();
