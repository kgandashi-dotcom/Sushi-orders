let currentUser = null;
let chopsticksCount = 1;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const PICKUP_TIME = "21:30";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- נתוני רולים ---
const insideOutRollsData = [ /* כאן שמים את כל הרולים שלך */ ];
const makiRollsData = [ /* כל המאקי */ ];
const onigiriData = [ /* כל האוניגירי */ ];
const PokeData = [ /* כל הפוקי */ ];
const saucesData = [ /* רטבים */ ];

let rollsSelected = {};
let saucesSelected = {};

// --- פונקציית יצירת כרטיסים ---
function createRollCard(roll, container, isSauce=false) {
  const card = document.createElement("div");
  card.className = "roll-card";

  const title = document.createElement("h3");
  title.textContent = roll.name;
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.textContent = roll.description;
  card.appendChild(desc);

  if(!isSauce){
    const qtyDiv = document.createElement("div");
    qtyDiv.className = "quantity-control";
    const minusBtn = document.createElement("button");
    minusBtn.textContent = "−";
    minusBtn.disabled = true;
    const qtyInput = document.createElement("input");
    qtyInput.value = 0;
    qtyInput.readOnly = true;
    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    qtyDiv.append(minusBtn, qtyInput, plusBtn);
    card.appendChild(qtyDiv);

    plusBtn.addEventListener("click", ()=>{
      qtyInput.value = parseInt(qtyInput.value)+1;
      rollsSelected[roll.id] = parseInt(qtyInput.value);
      minusBtn.disabled = false;
      updateSummary();
    });
    minusBtn.addEventListener("click", ()=>{
      let val = parseInt(qtyInput.value)-1;
      if(val<0) val=0;
      qtyInput.value=val;
      if(val===0) delete rollsSelected[roll.id];
      else rollsSelected[roll.id]=val;
      minusBtn.disabled = val===0;
      updateSummary();
    });
  }
  container.appendChild(card);
}

function initRolls(){
  const containers = [
    {data: insideOutRollsData, elem: document.getElementById("insideOutRolls")},
    {data: makiRollsData, elem: document.getElementById("makiRolls")},
    {data: onigiriData, elem: document.getElementById("onigiri")},
    {data: PokeData, elem: document.getElementById("Poke")}
  ];
  containers.forEach(group=>{
    group.data.forEach(r=>createRollCard(r, group.elem));
  });
}

function initSauces(){
  const container = document.getElementById("sauces-container");
  saucesData.forEach(s=>createRollCard(s, container, true));
}

// --- Google Login ---
function handleGoogleLogin(response){
  const decoded = jwt_decode(response.credential);
  currentUser = { name: decoded.name, email: decoded.email };
  document.getElementById("send-order").disabled = Object.keys(rollsSelected).length===0;
  updateSummary();
  alert(`שלום ${currentUser.name}, אתה מחובר!`);
}

// --- Summary ---
function updateSummary(){
  let text = `הזמנה חדשה:\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  if(Object.keys(rollsSelected).length===0) text += "\nלא נבחרו רולים עדיין!\n";
  const notes = document.getElementById("notes").value.trim();
  if(notes) text+=`\nהערות: ${notes}\n`;
  text+=`\nכתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;
  if(currentUser) text+=`לקוח: ${currentUser.name} (${currentUser.email})\n`;
  document.getElementById("order-summary").textContent = text;

  document.getElementById("send-order").disabled = !currentUser || Object.keys(rollsSelected).length===0;
}

// --- Chopsticks ---
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

// --- Send Order ---
document.getElementById("send-order").addEventListener("click", ()=>{
  if(!currentUser){ alert("אנא התחבר קודם"); return; }
  if(Object.keys(rollsSelected).length===0){ alert("בחר לפחות רול אחד"); return; }

  const payload = {
    user: currentUser,
    chopsticksCount,
    rolls: rollsSelected,
    notes: document.getElementById("notes").value.trim(),
    address: ADDRESS,
    pickupTime: PICKUP_TIME
  };

  fetch(MAKE_WEBHOOK_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(()=>{ alert("ההזמנה נשלחה בהצלחה!"); updateSummary(); })
  .catch(err=>{ console.error(err); alert("שגיאה בשליחת ההזמנה."); });
});

// --- Init ---
initRolls();
initSauces();
updateSummary();
