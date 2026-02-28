console.log("🚑 Rescue dashboard loaded");

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

let allSOS = [];
let rescueLat = null;
let rescueLng = null;

/*************************************************
 * USE MY LOCATION BUTTON
 *************************************************/
document.addEventListener("click", function(e){
  if(e.target.id === "useLocationBtn"){
    
    navigator.geolocation.getCurrentPosition(position => {

      // ✅ Force numeric
      rescueLat = Number(position.coords.latitude);
      rescueLng = Number(position.coords.longitude);

      console.log("Rescue Base:", rescueLat, rescueLng);

      alert("📍 Rescue base location updated!");
      applyFilter();

    }, error=>{
      alert("Location permission required.");
    });

  }
});

/*************************************************
 * HAVERSINE DISTANCE FUNCTION
 *************************************************/
function getDistance(lat1, lon1, lat2, lon2){

  // ✅ Ensure numeric values
  lat1 = Number(lat1);
  lon1 = Number(lon1);
  lat2 = Number(lat2);
  lon2 = Number(lon2);

  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/*************************************************
 * REAL-TIME LISTENER
 *************************************************/
function listenSOS(){

  db.collection("sos")
    .orderBy("createdAt","desc")
    .onSnapshot(snapshot => {

      allSOS = [];

      snapshot.forEach(doc=>{
        const data = doc.data();

        // ✅ Ensure lat/lng always numbers
        allSOS.push({
          id: doc.id,
          ...data,
          lat: Number(data.lat),
          lng: Number(data.lng)
        });
      });

      applyFilter();
    });
}

/*************************************************
 * APPLY FILTER
 *************************************************/
function applyFilter(){

  const filter = document.getElementById("filterSelect").value;
  const container = document.getElementById("sosList");
  container.innerHTML = "";

  let filtered = allSOS;

  if(filter !== "all"){
    filtered = allSOS.filter(item => 
      item.status === filter || 
      item.priority?.toLowerCase() === filter
    );
  }

  if(filtered.length === 0){
    container.innerHTML = "<p>No matching SOS</p>";
    return;
  }

  filtered.forEach(d=>{

    const div = document.createElement("div");
    div.className = "card " + (d.priority?.toLowerCase());

    let distanceText = "Click 'Use My Location'";
    let etaText = "-";

    // ✅ Only calculate if rescue location exists
    if(rescueLat !== null && rescueLng !== null){

      // ✅ Use ONLY real GPS coordinates
      const distance = getDistance(
        rescueLat,
        rescueLng,
        d.lat,
        d.lng
      );

      distanceText = distance.toFixed(2) + " km";

      const speed = 50; // km/h
      const eta = (distance / speed) * 60;
      etaText = eta.toFixed(1) + " mins";
    }

    div.innerHTML = `
      <b>Name:</b> ${d.name}<br>
      <b>Location:</b> ${d.location}<br>
      <b>Priority:</b> ${d.priority}<br>
      <b>Status:</b> ${d.status.toUpperCase()}<br>
      <b>Distance:</b> ${distanceText}<br>
      <b>Estimated Time:</b> ${etaText}<br>
    `;

    // STATUS BUTTONS
    if(d.status === "pending"){
      const btn = document.createElement("button");
      btn.innerText = "Mark ACTIVE";
      btn.className = "active-btn";
      btn.onclick = () => updateStatus(d.id,"active");
      div.appendChild(btn);
    }

    if(d.status === "active"){
      const btn2 = document.createElement("button");
      btn2.innerText = "Mark COMPLETED";
      btn2.className = "complete-btn";
      btn2.onclick = () => updateStatus(d.id,"completed");
      div.appendChild(btn2);
    }

    /*************************************************
     * NAVIGATION BUTTON (SAFE VERSION)
     *************************************************/
    const navBtn = document.createElement("button");
    navBtn.innerText = "Navigate 🚑";
    navBtn.style.background = "#ff5722";
    navBtn.style.marginLeft = "8px";

    navBtn.onclick = () => {

      // ✅ Force numeric GPS
      const destLat = Number(d.lat);
      const destLng = Number(d.lng);

      const url =
        `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;

      window.open(url, "_blank");
    };

    div.appendChild(navBtn);

    container.appendChild(div);
  });
}

/*************************************************
 * UPDATE STATUS
 *************************************************/
async function updateStatus(id,status){
  await db.collection("sos").doc(id).update({status});
}

/*************************************************
 * FILTER CHANGE EVENT
 *************************************************/
document.addEventListener("change", function(e){
  if(e.target.id === "filterSelect"){
    applyFilter();
  }
});

/*************************************************
 * START
 *************************************************/
listenSOS();
