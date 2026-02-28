let userLocation = null;
let GRID_DATA = null;

// ------------------ LOAD GEOJSON ------------------
fetch("kmr_grids_ai_latlon.geojson")
  .then(res => res.json())
  .then(data => {
    GRID_DATA = data.features;
    console.log("GeoJSON Loaded");
  });

// ------------------ GET LOCATION ------------------
window.onload = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        addMsg("AI: 📍 Location detected successfully.", "ai");
      },
      () => {
        addMsg("AI: ❌ Location access denied.", "ai");
      }
    );
  }
};

// ------------------ FIND USER GRID ------------------
function findUserGrid(lat, lon) {
  if (!GRID_DATA) return null;

  const point = turf.point([lon, lat]);

  for (let feature of GRID_DATA) {
    const polygon = turf.polygon(feature.geometry.coordinates);
    if (turf.booleanPointInPolygon(point, polygon)) {
      return feature.properties;
    }
  }
  return null;
}

// ------------------ THINK AND REPLY ------------------
function thinkAndReply(userMsg, props, lat, lon) {

  let msg = userMsg.toLowerCase().trim();

  let risk = props.risk_level || "Unknown";
  let safety = parseFloat(props.safety_score || 0);
let elevDiff = parseFloat(
    props.elev_diff ?? props["elev_diff\n"] ?? 0
);
  let gridId = props.id || "N/A";
  let row = props.row_index || "N/A";
  let col = props.col_index || "N/A";

  if (msg.includes("safety")) {

    let assessment =
      safety >= 80 ? "Your area is relatively safe." :
      safety >= 60 ? "Your area has moderate safety levels." :
      safety >= 40 ? "Your area requires caution." :
      "Your area is vulnerable to flooding.";

    return `
🔍 Safety Status

📍 Location: ${lat.toFixed(5)}, ${lon.toFixed(5)}
🧭 Grid: ${gridId} (Row ${row}, Column ${col})
📊 Safety Score: ${safety}/100
⚠ Risk Level: ${risk}
⛰ Elevation Difference: ${elevDiff} m

Assessment: ${assessment}
    `;
  }

  if (msg.includes("risk")) {
    return `
⚠ Flood Risk Analysis

Grid: ${gridId}
Safety Score: ${safety}/100
Risk Level: ${risk}
Elevation: ${elevDiff}m
    `;
  }

  return `
🌊 Flood Safety Assistant

Grid: ${gridId}
Safety Score: ${safety}/100
Risk: ${risk}

Ask about:
• safety check
• risk
• guidance
    `;
}

// ------------------ SEND MESSAGE ------------------
function sendMessage() {

  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMsg("You: " + text, "user");
  input.value = "";

  if (!userLocation) {
    addMsg("AI: Location not available yet.", "ai");
    return;
  }

  const props = findUserGrid(userLocation.lat, userLocation.lon);

  if (!props) {
    addMsg("AI: Outside mapped flood monitoring area.", "ai");
    return;
  }

  const reply = thinkAndReply(text, props, userLocation.lat, userLocation.lon);
  addMsg("AI: " + reply, "ai");
}

// ------------------ UI MESSAGE ------------------
function addMsg(msg, cls) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = cls;
  div.innerText = msg;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}