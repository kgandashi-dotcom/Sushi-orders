let currentUser = null;
let chopsticksCount = 1;
const ADDRESS = "אור עקיבא, רחוב מור, בניין 17ב, דירה 3";
const PICKUP_TIME = "21:30";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/asitqrbtyjum10ph3vf6gxhkd766us3r";

// --- Google Login ---
function handleGoogleLogin(response) {
  const decoded = jwt_decode(response.credential);
  currentUser = {
    name: decoded.name,
    email: decoded.email,
    picture: decoded.picture
  };
  onLoginSuccess();
}

// --- Facebook Init ---
window.fbAsyncInit = function() {
  FB.init({
    appId      : 'YOUR_FACEBOOK_APP_ID',
    cookie     : true,
    xfbml      : true,
    version    : 'v16.0'
  });
};

// --- Facebook Login ---
document.getElementById("facebook-login").addEventListener("click", () => {
  FB.login(function(response) {
    if (response.status === 'connected') {
      FB.api('/me', { fields: 'name,email' }, function(user) {
        currentUser = { name: user.name, email: user.email };
        onLoginSuccess();
      });
    }
  }, {scope: 'email'});
});

// --- Apple Placeholder ---
document.getElementById("apple-login").addEventListener("click", () => {
  alert("התחברות עם אפל תתווסף בהמשך.");
});

// --- After Login ---
function onLoginSuccess() {
  document.getElementById("social-login").style.display = "none";
  document.getElementById("order-section").style.display = "block";
  updateSummary();
}

// --- Summary ---
function updateSummary() {
  let text = `הזמנה חדשה:\nכמות צ'ופסטיקס: ${chopsticksCount}\n`;
  const notes = document.getElementById("notes").value.trim();
  if (notes) text += `\nהערות: ${notes}\n`;
  text += `\nכתובת איסוף: ${ADDRESS}\nשעת איסוף: ${PICKUP_TIME}\n`;

  if (currentUser) {
    text += `\nלקוח: ${currentUser.name} (${currentUser.email})\n`;
  }

  document.getElementById("order-summary").textContent = text;
  document.getElementById("send-order").disabled = !currentUser;
}

// --- Chopsticks Control ---
document.getElementById("chopsticks-minus").addEventListener("click", () => {
  if (chopsticksCount > 1) chopsticksCount--;
  document.getElementById("chopsticks-qty").value = chopsticksCount;
  updateSummary();
});
document.getElementById("chopsticks-plus").addEventListener("click", () => {
  chopsticksCount++;
  document.getElementById("chopsticks-qty").value = chopsticksCount;
  updateSummary();
});

// --- Send Order ---
document.getElementById("send-order").addEventListener("click", () => {
  if (!currentUser) {
    alert("אנא התחבר קודם");
    return;
  }

  const payload = {
    user: currentUser,
    chopsticksCount,
    notes: document.getElementById("notes").value.trim(),
    address: ADDRESS,
    pickupTime: PICKUP_TIME
  };

  fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(() => {
      alert("ההזמנה נשלחה בהצלחה!");
      document.getElementById("notes").value = '';
      chopsticksCount = 1;
      updateSummary();
    })
    .catch(err => {
      console.error(err);
      alert("שגיאה בשליחת ההזמנה.");
    });
});

// --- Init ---
updateSummary();
