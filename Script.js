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
  {id:"belgian", name:"רול ריי - 55₪", description:"טרטר ספייסי טונה נא על רול מלפפון, עירית ואושינקו", price:55}
];
const makiRollsData = [
  {id:"alfi", name:"רול אלפי - 35₪", description:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי🌱 - 25₪", description:"מאקי בטטה ואבוקדו", price:25}
];
const onigiriData = [
  {id:"rocky", name:"אוניגירי רוקי - 35₪", description:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35}
];
const PokeData = [
  {id:"dog", name:"בול-דוג - 60₪", description:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק", price:60}
];
const saucesData = [
  {id:"spicy-mayo", name:"ספייסי מיונז", price:0},
  {id:"soy", name:"רוטב סויה", price:0}
];

// --- משתנים ---
let rollsSelected = {};
let saucesSelected = {};

// --- יצירת כרטיסי רולים ורטבים ---
function createRollCard(item, container, isSauce=false){
  const card = document.createElement("div");
  card.className = "roll-card";

  const title = document.createElement("h3");
  title.textContent = item.name;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = item.description;
  card.appendChild(desc);

  if(!isSauce){
    // כפתורי כמות
    const qtyDiv = document.createElement("div");
    qtyDiv.className = "quantity-control";
    const minus = document.createElement("button");
    minus.textContent="−"; minus.disabled=true;
    const input = document.createElement("input"); input.type="number"; input.value=0; input.readOnly=true;
    const plus = document.createElement("button"); plus.textContent="+";

    plus.addEventListener("click", ()=>{
      input.value=parseInt(input.value)+1;
      rollsSelected[item.id]=parseInt(input.value);
      minus.disabled=false;
      updateSummary();
    });
    minus.addEventListener("click", ()=>{
      input.value=Math.max(0, parseInt(input.value)-1);
      if(input.value==0) delete rollsSelected[item.id];
      else rollsSelected[item.id]=parseInt(input.value);
      minus.disabled=(input.value==0);
      updateSummary();
    });

    qtyDiv.append(minus,input,plus);
    card.appendChild(qtyDiv);
  }else{
    const qtyDiv = document.createElement("div");
    qtyDiv.className = "quantity-control";
    const checkbox = document.createElement("input");
    checkbox.type="checkbox";
    checkbox.addEventListener("change", ()=>{ saucesSelected[item.id]=checkbox.checked; updateSummary(); });
    const label = document.createElement("label");
    label.textContent = item.name;
    qtyDiv.append(checkbox,label);
    card.appendChild(qtyDiv);
  }

  container.appendChild(card);
}

// --- אתחול כל המנות ---
function initAll(){
  const containers = [
    [insideOutRollsData,"insideOutRolls"],
    [makiRollsData,"makiRolls"],
    [onigiriData,"onigiri"],
    [PokeData,"Poke"]
  ];
  containers.forEach(([arr,id])=>{
    const container=document.getElementById(id);
    container.innerHTML="";
    arr.forEach(item=>createRollCard(item,container));
  });
  // sauces
  const sauceContainer=document.getElementById("sauces-container");
  sauceContainer.innerHTML="";
  saucesData.forEach(item=>createRollCard(item,sauceContainer,true));
}

// --- סיכום הזמנה ---
function updateSummary(){
  let text="";
  let totalCount=0;
  for(let key in rollsSelected) totalCount+=rollsSelected[key];
  if(totalCount==0){ document.getElementById("order-login-btn").disabled=false; }
  text+="הזמנה חדשה:\n";
  if(totalCount>0){
    for(let key in rollsSelected){
      const r=[...insideOutRollsData,...makiRollsData,...onigiriData,...PokeData].find(x=>x.id==key);
      text+=`${r.name} x${rollsSelected[key]}\n`;
    }
  }
  text+="\nרטבים:\n";
  for(let key in saucesSelected){ if(saucesSelected[key]){ const r=saucesData.find(x=>x.id==key); text+=r.name+"\n"; } }
  text+=`\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes=document.getElementById("notes").value.trim();
  if(notes) text+="\nהערות: "+notes+"\n";
  if(currentUser) text+=`\nלקוח: ${currentUser.name} (${currentUser.email})\nטלפון: ${currentUser.phone||"לא זמין"}\n`;
  text+=`\nכתובת: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  document.getElementById("order-summary").textContent=text;
}

// --- כפתור צ'ופסטיקס ---
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

// --- כפתור ביצוע הזמנה / התחברות Google ---
document.getElementById("order-login-btn").addEventListener("click",()=>{
  if(!currentUser){
    google.accounts.id.initialize({
      client_id: "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com",
      callback: handleGoogleLogin
    });
    google.accounts.id.prompt(); // התחברות ללא מעבר לדף חדש
  }else{
    sendOrder();
  }
});

// --- התחברות Google ---
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = { name: decoded.name, email: decoded.email, phone: decoded.phone_number||"" };
  alert(`שלום ${currentUser.name}, כעת ניתן לשלוח את ההזמנה`);
  updateSummary();
  sendOrder(); // שולח מיד לאחר ההתחברות
}

// --- שליחת ההזמנה ---
function sendOrder(){
  if(Object.keys(rollsSelected).length===0){ alert("בחר לפחות רול אחד לפני שליחה"); return; }

  const payload={
    user: currentUser,
    rolls: rollsSelected,
    sauces: saucesSelected,
    chopsticksCount,
    notes: document.getElementById("notes").value.trim(),
    address: ADDRESS,
    pickupTime: PICKUP_TIME
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  })
  .then(()=>{
    alert("ההזמנה נשלחה! תוקן גם למייל ול-WhatsApp");
  })
  .catch(err=>{ console.error(err); alert("שגיאה בשליחת ההזמנה"); });
}

// --- אתחול ---
initAll();
updateSummary();
