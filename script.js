// ====== CONFIG ======
const GOOGLE_CLIENT_ID = "962297663657-7bsrugivo5rjbu534lamiuc256gbqoc4.apps.googleusercontent.com";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";
const PREP_MINUTES_PER_ROLL = 6;
const MAX_ROLLS_PER_DAY = 15;
const WARNING_THRESHOLD = 10; // above this show warning

// ====== DATA ======
const insideOut = [
  {id:"bingo", name:"רול בינגו", desc:"סלמון נא, שמנת, אבוקדו בציפוי שומשום קלוי", price:50},
  {id:"luna", name:"רול לונה", desc:"ספייסי סלמון אפוי על רול בטטה, אבוקדו ושיטאקי", price:50},
  {id:"belgian", name:"רול ריי", desc:"טרטר ספייסי טונה נא על רול מלפפון, עירית ואושינקו", price:55},
  {id:"crazy-bruno", name:"רול קרייזי ברונו", desc:"דג לבן, טונה, סלמון בציפוי שומשום קלוי", price:60},
  {id:"happy-bruno", name:"רול האפי ברונו", desc:"סלמון בציפוי שקדים קלויים ורוטב טריאקי", price:60},
  {id:"mila", name:"רול מילה", desc:"בטטה, עירית ואבוקדו בעיטוף סלמון צרוב", price:50},
  {id:"newton", name:"רול ניוטון", desc:"טונה אדומה, אבוקדו, בטטה בציפוי פנקו ורוטב בוטנים", price:55},
  {id:"oli", name:"רול אולי", desc:"דג לבן, מלפפון, אבוקדו בציפוי שומשום", price:50},
  {id:"milli", name:"רול מילי", desc:"מקל סורימי, דג לבן אפוי, אושינקו בציפוי פנקו", price:50},
  {id:"scar", name:"רול סקאר", desc:"ספייסי סלמון אפוי עם אבוקדו, מלפפון ובטטה בעיטור מיונז וצ'יפס", price:50},
  {id:"magi", name:"רול מגי🌱", desc:"מלפפון, בטטה, עירית ואבוקדו בעיטור בטטה ורוטב בוטנים", price:40},
  {id:"tyson", name:"רול טייסון וקיילה", desc:"סלמון נא, קנפיו, בטטה בעיטוף שבבי פנקו סגול", price:50},
  {id:"lucy", name:"רול לוסי", desc:"סלמון נא, פטריות שיטאקי ואושינקו בציפוי טוביקו", price:55},
  {id:"billy", name:"רול בילי", desc:"דג לבן צרוב, עירית, בטטה מצופה בפנקו", price:50},
  {id:"lucky", name:"רול לאקי", desc:"טרטר ספייסי סלמון עם אבוקדו, מלפפון ועירית", price:50}
];

const maki = [
  {id:"alfi", name:"רול אלפי", desc:"מאקי סלמון", price:35},
  {id:"maymay", name:"רול מיי מיי🌱", desc:"מאקי בטטה ואבוקדו", price:25},
  {id:"snoopy", name:"רול סנופי🌱", desc:"מאקי אושינקו וקנפיו", price:25}
];

const onigiri = [
  {id:"rocky", name:"אוניגירי רוקי", desc:"טרטר טונה אדומה עם ספייסי מיונז ובצל ירוק", price:35},
  {id:"johnny", name:"אוניגירי ג׳וני", desc:"טרטר סלמון עם ספייסי מיונז ובצל ירוק", price:30},
  {id:"gisel", name:"אוניגירי ג׳יזל🌱", desc:"אבוקדו ובטטה", price:25}
];

const poke = [
  {id:"dog", name:"בול-דוג", desc:"אורז סושי, סלמון במרינדה, אדממה, מלפפון, אבוקדו, בצל ירוק", price:60},
  {id:"pit", name:"פיט-בול", desc:"אורז סושי, טונה במרינדה, אדממה, מנגו, כרוב סגול, פטריות שיטאקי", price:70},
  {id:"trir", name:"בול-טרייר🌱", desc:"אורז סושי, אדממה, מלפפון, פטריות שיטאקי, גזר ואבוקדו", price:45}
];

const sauces = [
  {id:"spicy-mayo", name:"ספייסי מיונז"},
  {id:"soy", name:"רוטב סויה"},
  {id:"teriyaki", name:"רוטב טריאקי"}
];

// ====== State ======
let user = null; // {name,email,phone}
let selected = {}; // id -> qty for rolls
let selectedSauces = {}; // id->qty
let chopsticks = 1;
let selectedPickup = "";

// ====== Utilities: local orders storage (for availability checks) ======
function loadOrders(){
  try{ return JSON.parse(localStorage.getItem("gandashi_orders")||"[]"); }
  catch(e){ return []; }
}
function saveOrderToLocal(o){
  const arr = loadOrders();
  arr.push(o);
  localStorage.setItem("gandashi_orders", JSON.stringify(arr));
}

// returns Date object for today at HH:MM
function timeToDateToday(hhmm){
  const [hh,mm] = hhmm.split(":").map(n=>parseInt(n,10));
  const d = new Date();
  d.setSeconds(0,0);
  d.setHours(hh, mm, 0, 0);
  return d;
}
// format date short
function fmtTime(d){
  return d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
}

// prep minutes for given roll count
function prepMinutesForRolls(n){ return n * PREP_MINUTES_PER_ROLL; }

// check availability: returns {ok:true} or {ok:false, reason, suggestions: [hh:mm,...]}
function checkAvailabilityFor(pickupHHMM, rollsCount){
  const all = loadOrders(); // existing accepted orders
  const newPrep = prepMinutesForRolls(rollsCount);
  const newEnd = timeToDateToday(pickupHHMM); // end time is pickup time
  const newStart = new Date(newEnd.getTime() - newPrep*60*1000);

  // Check total per day
  const todayStr = (new Date()).toISOString().slice(0,10);
  let totalToday = 0;
  all.forEach(o=>{
    if(o.date === todayStr){
      totalToday += o.totalRolls || 0;
    }
  });
  if(totalToday + rollsCount > MAX_ROLLS_PER_DAY){
    return {ok:false, reason:`אין מקום — הגעת למקסימום של ${MAX_ROLLS_PER_DAY} רולים ביום.`};
  }
  if(totalToday + rollsCount > WARNING_THRESHOLD){
    // still may allow but warn later
  }

  // For each existing order, compute start/end
  for(const o of all){
    if(o.date !== todayStr) continue;
    const existingEnd = timeToDateToday(o.pickupTime);
    const existingStart = new Date(existingEnd.getTime() - prepMinutesForRolls(o.totalRolls)*60*1000);
    // overlap condition: (newStart < existingEnd) && (existingStart < newEnd)
    if(newStart < existingEnd && existingStart < newEnd){
      // conflict
      // propose suggestions: scan next slots (30min increments) up to 6 hours ahead
      const suggestions = [];
      const slotStep = 30; // minutes
      let scanStart = new Date(newEnd.getTime() + slotStep*60*1000);
      for(let i=0;i<12;i++){ // next 6 hours max
        const candidateEnd = new Date(scanStart.getTime());
        const candidateStart = new Date(candidateEnd.getTime() - newPrep*60*1000);
        // check candidate against all
        let ok = true;
        for(const oo of all){
          if(oo.date !== todayStr) continue;
          const exEnd = timeToDateToday(oo.pickupTime);
          const exStart = new Date(exEnd.getTime() - prepMinutesForRolls(oo.totalRolls)*60*1000);
          if(candidateStart < exEnd && exStart < candidateEnd){ ok = false; break; }
        }
        if(ok) suggestions.push(fmtTime(candidateEnd));
        scanStart = new Date(scanStart.getTime() + slotStep*60*1000);
        if(suggestions.length>=3) break;
      }
      return {ok:false, reason:`זמן איסוף ${pickupHHMM} מתנגש עם הזמנה קיימת (${o.pickupTime}).`, suggestions};
    }
  }

  return {ok:true};
}

// ====== Render UI ======
function el(tag
