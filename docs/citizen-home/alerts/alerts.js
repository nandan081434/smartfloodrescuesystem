// ===============================
// 🔥 FIREBASE IMPORTS
// ===============================

import { db } from "../../css/js/firebase-auth.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// 🗺 MAP SETUP
// ===============================

const map = L.map("map").setView([18.32, 78.35], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

let floodLayer;


// ===============================
// 📍 USER LOCATION
// ===============================

navigator.geolocation.getCurrentPosition(position => {

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup("Your Location")
    .openPopup();
});


// ===============================
// 🌧 FLOOD CHECK FUNCTION
// ===============================

window.checkFlood = async function () {

  const response = await fetch("http://localhost:3000/api/alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userGridId: 1
    })
  });

  const data = await response.json();

  document.getElementById("rainfallValue").innerText = data.rainfall;

  updateAlert(data.level, data.message);
  drawFlood(data.floodedGrids);
  startCountdown(data.level);
};


// ===============================
// 🚨 UPDATE ALERT STATUS
// ===============================

function updateAlert(level, message) {

  const box = document.getElementById("alertBox");

  box.className = "alert " + level;
  box.innerText = level + " - " + message;
}


// ===============================
// 🌊 DRAW FLOOD AREA
// ===============================

function drawFlood(floodedGrids) {

  if (floodLayer) map.removeLayer(floodLayer);

  floodLayer = L.geoJSON(floodedGrids, {
    style: {
      color: "red",
      fillColor: "red",
      fillOpacity: 0.6
    }
  }).addTo(map);
}


// ===============================
// ⏳ COUNTDOWN
// ===============================

function startCountdown(level) {

  if (level === "EMERGENCY") {
    document.getElementById("countdown").innerText = "NOW";
    return;
  }

  let time = 30;

  const interval = setInterval(() => {
    time--;
    document.getElementById("countdown").innerText = time + " sec";

    if (time <= 0) clearInterval(interval);
  }, 1000);
}


// ===============================
// 🔥 RESCUE TEAM REALTIME LISTENER
// ===============================

const rescueContainer = document.getElementById("rescueAlerts");

const rescueQuery = query(
  collection(db, "alerts"),
  orderBy("timestamp", "desc")
);

onSnapshot(rescueQuery, (snapshot) => {

  rescueContainer.innerHTML = "";

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    // Only show ACTIVE alerts
    if (data.status !== "active") return;

    const card = document.createElement("div");
    card.style.background = "red";
    card.style.color = "white";
    card.style.padding = "15px";
    card.style.marginBottom = "10px";
    card.style.borderRadius = "10px";
    card.style.boxShadow = "0 0 15px red";

    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.message}</p>
      <strong>${data.type}</strong>
    `;

    rescueContainer.appendChild(card);
  });

});