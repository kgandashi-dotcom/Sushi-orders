// --- קבועים ---
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";
const TWILIO_SANDBOX_NUMBER = "+14155238886";
const SENDER_EMAIL = "Gandashi.events@gmail.com";
const MAX_ROLLS_PER_DAY = 15;
const ROLLS_WARNING_THRESHOLD = 10;

// --- נתוני תפריט ---
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
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק. מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי. מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו. מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// --- מצב המשתמש ---
let currentUser = null;
let selectedRolls = {};
let selectedSauces = {};
let chopsticksCount = 1;
let pickupTime = "";

// --- פונקציות ---
function createCard(item, container, type="roll") {
  const card = document.createElement("div");
  card.className = "roll-card";
  const title = document.createElement("h3");
  title.textContent = item.name;
  const desc = document.createElement("p");
  desc.textContent = item.description;
  card.appendChild(title);
  card.appendChild(desc);

  // רק עבור רולים ורטבים - כפתורי כמות
  if(type==="roll" || type==="sauce") {
    const qtyControl = document.createElement("div");
    qtyControl.className="quantity-control";
    const minus = document.createElement("button");
    minus.textContent="−";
    const input = document.createElement("input");
    input.type="number";
    input.value=0;
    input.readOnly = true;
    const plus = document.createElement("button");
    plus.textContent="+";

    minus.onclick = () => { if(parseInt(input.value)>0) input.value--; updateSelections(item.id,type,input.value);}
    plus.onclick = () => { input.value++; updateSelections(item.id,type,input.value);}

    qtyControl.appendChild(minus);
    qtyControl.appendChild(input);
    qtyControl.appendChild(plus);
    card.appendChild(qtyControl);
  }

  container.appendChild(card);
}

function updateSelections(id,type,value){
  if(type==="roll") selectedRolls[id]=parseInt(value);
  if(type==="sauce") selectedSauces[id]=parseInt(value);
  updateSummary();
}

// --- התחברות Google ---
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = {
    name: decoded.name,
    email: decoded.email,
    phone: decoded.phone_number || ""
  };
  alert(`שלום ${currentUser.name}! כעת ניתן לשלוח הזמנה.`);
  document.getElementById("send-order").disabled=false;
}

// --- עדכון סיכום ---
function updateSummary(){
  let summary = "";
  let total = 0;
  // רולים
  summary+="רולים:\n";
  for(const [id,qty] of Object.entries(selectedRolls)){
    if(qty>0){
      const item = [...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData].find(r=>r.id===id);
      summary+=`${item.name} x${qty} = ${item.price*qty}₪\n`;
      total+=item.price*qty;
    }
  }

  // רטבים נוספים
  let extraSauces=0;
  summary+="\nרטבים:\n";
  for(const [id,qty] of Object.entries(selectedSauces)){
    if(qty>0){
      const item = saucesData.find(s=>s.id===id);
      summary+=`${item.name} x${qty}\n`;
      if(qty>2) extraSauces += (qty-2)*3;
    }
  }
  if(extraSauces>0) summary+=`(תשלום נוסף על רטבים: ${extraSauces}₪)\n`;
  total+=extraSauces;

  // צ'ופסטיקס והערות
  summary+=`\nצ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = document.getElementById("notes").value.trim();
  if(notes) summary+=`\nהערות: ${notes}\n`;

  summary+=`\nשעת איסוף: ${pickupTime || "לא נבחרה"}\n`;

  summary+=`\nסה"כ: ${total}₪`;

  document.getElementById("order-summary").textContent = summary;
}

// --- שליחת ההזמנה ---
function sendOrder(){
  if(!currentUser){ alert("יש להתחבר קודם"); return; }
  if(!pickupTime){ alert("יש לבחור שעת איסוף"); return; }
  if(Object.values(selectedRolls).reduce((a,b)=>a+b,0)===0){ alert("יש לבחור לפחות רול אחד"); return; }

  const payload = {
    user: currentUser,
    rolls:selectedRolls,
    sauces:selectedSauces,
    chopsticksCount,
    notes:document.getElementById("notes").value.trim(),
    pickupTime
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  }).then(()=>alert("ההזמנה נשלחה בהצלחה!"))
    .catch(err=>{ console.error(err); alert("שגיאה בשליחת ההזמנה"); });
}

// --- התחלה ---
function init(){
  const container = document.getElementById("rolls-container");
  [...insideOutRollsData,...makiRollsData,...onigiriData,...pokeData].forEach(r=>{
    createCard(r,container,"roll");
  });

  const sauceContainer = document.getElementById("sauces-container");
  saucesData.forEach(s=> createCard(s,sauceContainer,"sauce"));

  document.getElementById("chopsticks-plus").onclick = () => { chopsticksCount++; updateSummary();}
  document.getElementById("chopsticks-minus").onclick = () => { if(chopsticksCount>1) chopsticksCount--; updateSummary();}

  document.getElementById("send-order").onclick = sendOrder;
  updateSummary();
}

window.onload = init;
