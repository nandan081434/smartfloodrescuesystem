console.log("✅ sos.js loaded");

/*************************************************
 * USER ROLE
 *************************************************/
const USER_ROLE = "citizen"; // change to "admin" for rescue team

/*************************************************
 * FIREBASE INIT
 *************************************************/
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "flood-rescue-guide-ac3a8.firebaseapp.com",
  projectId: "flood-rescue-guide-ac3a8",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/*************************************************
 * SEND SOS WITH WEATHER PRIORITY
 *************************************************/
async function sendSOS(){
  const name = document.getElementById("name").value.trim();
  const manualLocation = document.getElementById("location").value.trim();

  if(!name || !manualLocation){
    alert("Fill all fields");
    return;
  }

  if(!navigator.geolocation){
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async pos=>{

    // ✅ Ensure numeric values
    const lat = Number(pos.coords.latitude);
    const lng = Number(pos.coords.longitude);

    let priority = "Low"; // default

    try{
      const apiKey = "4d883e189d23fe24b5e2a63da587a352";

      const weatherURL =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

      const response = await fetch(weatherURL);
      const data = await response.json();

      console.log("🌦 Weather API Data:", data);

      let rainfall = 0;

      if(data.rain && data.rain["1h"]){
        rainfall = data.rain["1h"];
      }

      const weatherMain = data.weather[0].main;

      // 🔴 PRIORITY LOGIC (UNCHANGED)

      if(weatherMain === "Thunderstorm"){
        priority = "High";
      }
      else if(rainfall > 20){
        priority = "High";
      }
      else if(rainfall > 5){
        priority = "Medium";
      }
      else if(weatherMain === "Extreme"){
        priority = "High";
      }
      else{
        priority = "Low";
      }

    }catch(error){
      console.log("Weather API error:", error);
      priority = "Medium"; // fallback safety
    }

    // 🔥 SAVE TO FIRESTORE (STRUCTURE UNCHANGED)
    await db.collection("sos").add({
      name: name,
      location: manualLocation,   // user entered area
      lat: lat,                   // real GPS latitude
      lng: lng,                   // real GPS longitude
      status: "pending",
      priority: priority,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("🚨 SOS Sent! Priority: " + priority);

    // Optional: clear form after sending
    document.getElementById("name").value = "";
    document.getElementById("location").value = "";

    loadHistory();

  }, error=>{
    alert("Location access required to send SOS.");
  }, {
    enableHighAccuracy: true
  });
}

/*************************************************
 * LOAD HISTORY
 *************************************************/
async function loadHistory(){
  const h=document.getElementById("history");
  h.innerHTML="";

  const snap=await db.collection("sos")
                     .orderBy("createdAt","desc")
                     .get();

  if(snap.empty){
    h.innerHTML="<p>No history</p>";
    updateSOSSidebarGlow();
    return;
  }

  snap.forEach(doc=>{
    const d=doc.data();
    let btn="";

    if(USER_ROLE==="citizen" && d.status!=="completed"){
      btn=`<button class="toggle-btn" onclick="toggleStatus('${doc.id}','completed')">Mark COMPLETED</button>`;
    }

    if(USER_ROLE==="admin" && d.status==="pending"){
      btn=`<button class="toggle-btn" onclick="toggleStatus('${doc.id}','active')">Mark ACTIVE</button>`;
    }

    h.innerHTML+=`
      <div class="sos-card">
        <b>${d.name}</b><br>
        ${d.location}<br>
        <span class="status ${d.status}">${d.status.toUpperCase()}</span><br>
        <span class="priority ${d.priority?.toLowerCase()}">
          Priority: ${d.priority}
        </span>
        ${btn}
      </div>`;
  });

  updateSOSSidebarGlow();
}

/*************************************************
 * UPDATE STATUS
 *************************************************/
async function toggleStatus(id,status){
  await db.collection("sos").doc(id).update({status});
  loadHistory();
}

/*************************************************
 * SIDEBAR GLOW LOGIC
 *************************************************/
async function updateSOSSidebarGlow(){
  const sosBtn = document.getElementById("sosMenu");
  if(!sosBtn) return;

  sosBtn.classList.remove(
    "sos-alert-default",
    "sos-alert-pending"
  );

  const snap = await db.collection("sos").get();

  let hasPending = false;
  let hasActive = false;

  snap.forEach(doc=>{
    const s = doc.data().status;
    if(s === "pending") hasPending = true;
    if(s === "active") hasActive = true;
  });

  if(hasPending){
    sosBtn.classList.add("sos-alert-pending");
  }
  else if(hasActive || snap.empty){
    sosBtn.classList.add("sos-alert-default");
  }
}

window.onload = loadHistory;
setInterval(updateSOSSidebarGlow, 5000);
