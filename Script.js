let currentUser = null;
let chopsticksCount = 1;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const PICKUP_TIME = "21:30";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- נתוני רולים ---
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

const PokeData = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק . מעל שומשום ורוטב ספייסי מיונז", price:60},
  {id:"pit", name:"פיט-בול - 70₪", description:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי . מעל בצל שאלוט מטוגן ורוטב אננס מתוק", price:70},
  {id:"trir", name:"בול-טרייר🌱 - 45₪", description:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו . מעל שומשום ורוטב בוטנים", price:45}
];

const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// --- פונקציות כלליות ---
function createCard(item, container){
  const card = document.createElement("div");
  card.className="roll-card";
  const title=document.createElement("h3"); title.textContent=item.name;
  const desc=document.createElement("p"); desc.textContent=item.description;
  card.append(title,desc);

  const qtyDiv=document.createElement("div"); qtyDiv.className="quantity-control";
  const minus=document.createElement("button"); minus.textContent="−"; minus.disabled=true;
  const input=document.createElement("input"); input.type="number"; input.value=0; input.readOnly=true;
  const plus=document.createElement("button"); plus.textContent="+";

  plus.addEventListener("click",()=>{
    input.value=parseInt(input.value)+1; minus.disabled=false; updateSummary();
  });
  minus.addEventListener("click",()=>{
    input.value=Math.max(0,parseInt(input.value)-1); minus.disabled=input.value==0; updateSummary();
  });
  qtyDiv.append(minus,input,plus);
  card.appendChild(qtyDiv);
  container.appendChild(card);
}

function initAllCards(){
  insideOutRollsData.forEach(r=>createCard(r,document.getElementById("insideOutRolls")));
  makiRollsData.forEach(r=>createCard(r,document.getElementById("makiRolls")));
  onigiriData.forEach(r=>createCard(r,document.getElementById("onigiri")));
  PokeData.forEach(r=>createCard(r,document.getElementById("poke")));
  saucesData.forEach(r=>createCard(r,document.getElementById("sauces")));
}

// --- התחברות Google ---
document.getElementById("google-login").addEventListener("click",()=>{
  google.accounts.id.prompt();
});
function handleGoogleLogin(response){
  const decoded=jwt_decode(response.credential);
  currentUser={name:decoded.name,email:decoded.email,phone:decoded.phone_number||""};
  document.getElementById("login-section").style.display="none";
  document.getElementById("menu").style.display="block";
  initAllCards();
  updateSummary();
}

// --- צ’ופסטיקס ---
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

// --- סיכום ---
function updateSummary(){
  let text=`הזמנה חדשה:\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes=document.getElementById("notes").value.trim();
  if(notes) text+=`\nהערות: ${notes}\n`;
  text+=`\nכתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;
  document.getElementById("order-summary").textContent=text;
}

// --- שליחת ההזמנה ---
document.getElementById("send-order").addEventListener("click",()=>{
  if(!currentUser){ alert("אנא התחבר עם Google כדי לשלוח הזמנה"); return; }

  const orderDetails={
    user: currentUser,
    chopsticks: chopsticksCount,
    notes:document.getElementById("notes").value.trim(),
    address:ADDRESS,
    pickupTime:PICKUP_TIME
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(orderDetails)
  })
  .then(()=>alert("ההזמנה נשלחה! נשלח גם למייל והוואטסאפ שלך אם מסופק מספר."))
  .catch(err=>{console.error(err); alert("שגיאה בשליחת ההזמנה.");});

  updateSummary();
});

// --- אתחול ---
updateSummary();
