
// ==================================================
// Flood Safety & Rescue – FINAL STABLE VERSION
// ==================================================

// ================= CONFIG =================
const API_BASE = "http://127.0.0.1:5000";

// ================= GLOBAL STATE =================
let userLocation = null;
let userRiskLevel = "unknown";

let mapInstance = null;
let routeLayer = null;
let vehicleMarker = null;
let navigationTimer = null;

let activeRescueTarget = null;
let routeCoordinates = [];
let routeIndex = 0;
let gpsWatcher = null;

// ================= TEMP RESCUE AREA DATA =================
const rescueAreas = {
    GRID_101: {
        area_name: "Old Bus Stand Area",
        grid_id: "GRID_101",
        lat: 18.3168,
        lon: 78.3412,
        safety_score: 35,
        water_level: "3.6 m",
        rainfall: "71 mm/hr",
        flow_speed: "2.6 m/s",
        weather: "Severe Rain"
    },
    GRID_102: {
        area_name: "Railway Station Area",
        grid_id: "GRID_102",
        lat: 18.3095,
        lon: 78.3291,
        safety_score: 42,
        water_level: "2.9 m",
        rainfall: "60 mm/hr",
        flow_speed: "2.1 m/s",
        weather: "Heavy Rain"
    }
};

// ================= INIT =================
window.addEventListener("load", () => {
    showScreen("menu-screen");
    detectLocation();
});

// ================= SCREEN NAVIGATION =================
function hideAllScreens() {
    document.querySelectorAll(".screen").forEach(s => {
        s.style.display = "none";
    });
}

function showScreen(id) {
    hideAllScreens();
    document.getElementById(id).style.display = "block";
}

function showRescue() {
    showScreen("rescue-screen");
}

function goBackToMenu() {
    showScreen("menu-screen");
}
function showSafety() {
    showScreen("safety-screen");
}

// ================= LOCATION =================
function detectLocation() {
    const statusEl = document.getElementById("location-status");
    const coordEl = document.getElementById("coordinates");

    if (!navigator.geolocation) {
        statusEl.innerText = "❌ Geolocation not supported";
        return;
    }

    statusEl.innerHTML =
        `<i class="fas fa-spinner fa-spin"></i> Detecting location...`;

    gpsWatcher = navigator.geolocation.watchPosition(
        pos => {
            userLocation = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude
            };

            statusEl.innerHTML =
                `<i class="fas fa-map-marker-alt"></i> Location detected`;

            coordEl.innerText =
                `${userLocation.lat.toFixed(5)}, ${userLocation.lon.toFixed(5)}`;

            updateRiskFromNearestGrid();
        },
        err => {
            statusEl.innerText = "❌ Location permission denied";
            console.error(err);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// ================= RISK =================
function updateRiskFromNearestGrid() {
    if (!userLocation) return;

    let nearest = null;
    let minDist = Infinity;

    Object.values(rescueAreas).forEach(area => {
        const d = distance(
            userLocation.lat,
            userLocation.lon,
            area.lat,
            area.lon
        );
        if (d < minDist) {
            minDist = d;
            nearest = area;
        }
    });

    if (!nearest) return;

    const score = nearest.safety_score;
    let risk = "HIGH";
    if (score >= 70) risk = "LOW";
    else if (score >= 40) risk = "MEDIUM";

    userRiskLevel = risk;
    document.getElementById("risk-level").innerText = risk;
}

// ================= RESCUE SELECT =================
function directToArea(gridId) {
    const area = rescueAreas[gridId];

    if (!area) return;

    if (!userLocation) {
        alert("Waiting for GPS location...");
        return;
    }

    activeRescueTarget = area;

    showScreen("operation-screen");

    loadMap(area.lat, area.lon);
}

// ================= MAP =================
function loadMap(targetLat, targetLon) {

    clearInterval(navigationTimer);

    if (mapInstance) {
        mapInstance.remove();
    }

    mapInstance = L.map("map").setView(
        [userLocation.lat, userLocation.lon],
        13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(mapInstance);

    // Target Marker
    L.marker([targetLat, targetLon])
        .addTo(mapInstance)
        .bindPopup("🚨 Rescue Location");

    drawRoute(
        userLocation.lat,
        userLocation.lon,
        targetLat,
        targetLon
    );
}

// ================= ROUTE =================
function drawRoute(sLat, sLon, eLat, eLon) {

    const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(res => res.json())
        .then(data => {

            if (!data.routes || !data.routes.length) {
                alert("Route not found");
                return;
            }

            const route = data.routes[0].geometry;

            routeLayer = L.geoJSON(route, {
                style: { color: "blue", weight: 5 }
            }).addTo(mapInstance);

            routeCoordinates = route.coordinates.map(c => ({
                lat: c[1],
                lon: c[0]
            }));

            startNavigation();
        })
        .catch(err => {
            console.error("Routing error:", err);
        });
}

// ================= LIVE NAVIGATION =================
function startNavigation() {

    routeIndex = 0;

    vehicleMarker = L.marker(
        [routeCoordinates[0].lat, routeCoordinates[0].lon],
        {
            icon: L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
                iconSize: [40, 40]
            })
        }
    ).addTo(mapInstance);

navigationTimer = setInterval(() => {

    if (routeIndex >= routeCoordinates.length) {
        clearInterval(navigationTimer);

        // Show start button only after arrival
        document
            .getElementById("start-rescue-container")
            .classList.remove("hidden");

        return;
    }

    const p = routeCoordinates[routeIndex];
    vehicleMarker.setLatLng([p.lat, p.lon]);
    mapInstance.panTo([p.lat, p.lon], { animate: true });

    routeIndex++;

}, 800);

}

// ================= START RESCUE =================
function startRescueOperation() {
    const panel = document.getElementById("rescue-details-panel");

    if (!activeRescueTarget) return;

    const area = activeRescueTarget;

    panel.innerHTML = `
        <h3>📍 ${area.area_name}</h3>
        <p><strong>Grid ID:</strong> ${area.grid_id}</p>
        <p><strong>Water Level:</strong> ${area.water_level}</p>
        <p><strong>Rainfall:</strong> ${area.rainfall}</p>
        <p><strong>Flow Speed:</strong> ${area.flow_speed}</p>
        <p><strong>Weather:</strong> ${area.weather}</p>

        <hr>

        <h4>🧍 People Affected</h4>
        <p>Adults: 12 | Children: 5 | Elderly: 3</p>

        <h4>🚑 Resources Required</h4>
        <p>Boats: 2</p>
        <p>Life Jackets: 25</p>
        <p>Medical Kits: 4</p>

        <h4>📋 Rescue Status</h4>
        <p>Rescue Started</p>
    `;

    panel.classList.remove("hidden");

    document
        .getElementById("start-rescue-container")
        .classList.add("hidden");
}


// ================= DISTANCE =================
function distance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function resetRescueState() {

    if (navigationTimer) clearInterval(navigationTimer);

    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    routeLayer = null;
    vehicleMarker = null;
    routeCoordinates = [];
    routeIndex = 0;
    activeRescueTarget = null;

    document.getElementById("start-rescue-container")
        .classList.add("hidden");

    document.getElementById("rescue-details-panel")
        .classList.add("hidden");
}
// =====================================================
// FINAL RESCUE FLOW FIX (PASTE AT END OF FILE)
// =====================================================

// Distance check every 2 seconds
setInterval(() => {
    if (!activeRescueTarget || !userLocation) return;

    const dist = getDistanceMeters(
        userLocation.lat,
        userLocation.lon,
        activeRescueTarget.lat,
        activeRescueTarget.lon
    );

    // Show button only if within 120 meters
    if (dist <= 120 && navigationTimer === null) {
        const btn = document.getElementById("start-rescue-container");
        if (btn) btn.classList.remove("hidden");
    }
}, 2000);


// Reset rescue UI when selecting new area
const originalDirectToArea = directToArea;
directToArea = function(gridId) {

    // Hide previous rescue UI
    const btn = document.getElementById("start-rescue-container");
    const panel = document.getElementById("rescue-details-panel");

    if (btn) btn.classList.add("hidden");
    if (panel) panel.classList.add("hidden");

    // Clear previous route
    if (routeLayer && mapInstance) {
        mapInstance.removeLayer(routeLayer);
    }

    if (vehicleMarker && mapInstance) {
        mapInstance.removeLayer(vehicleMarker);
    }

    clearInterval(navigationTimer);
    navigationTimer = null;

    // Call original function
    originalDirectToArea(gridId);
};


// Override startRescueOperation to avoid duplicate panels
startRescueOperation = function() {

    const btn = document.getElementById("start-rescue-container");
    const panel = document.getElementById("rescue-details-panel");

    if (btn) btn.classList.add("hidden");

    if (panel && panel.classList.contains("hidden")) {
        panel.classList.remove("hidden");
    }
};
// ==================================================
// RESCUE FIELD AI – SMART RULE BASED SYSTEM
// ==================================================

function rescueAIResponse(message) {
    if (!activeRescueTarget) {
        return "No active rescue location selected.";
    }

    const area = activeRescueTarget;
    const msg = message.toLowerCase();

    // Context Data
    const water = parseFloat(area.water_level);
    const rain = parseFloat(area.rainfall);
    const flow = parseFloat(area.flow_speed);

    // --- Intelligent Conditions ---

    if (msg.includes("priority")) {
        return `Priority: Evacuate children (${5}) and elderly (${3}) first.`;
    }

    if (msg.includes("water")) {
        if (water > 3)
            return "⚠️ Water level critical. Use boats immediately.";
        else
            return "Water level manageable but caution required.";
    }

    if (msg.includes("rain")) {
        if (rain > 60)
            return "Heavy rainfall continuing. Expect rising water.";
        else
            return "Rainfall moderate.";
    }

    if (msg.includes("flow")) {
        if (flow > 2)
            return "Strong water current. Avoid walking evacuation.";
        else
            return "Flow speed safe for controlled rescue.";
    }

    if (msg.includes("route")) {
        return "Recommended route is already plotted. Avoid low elevation roads.";
    }

    if (msg.includes("status")) {
        return "Rescue team has reached location. Awaiting start command.";
    }

    if (msg.includes("resources")) {
        return "Required: 2 Boats, 25 Life Jackets, 4 Medical Kits.";
    }

    return "Stay alert. Monitor water level and evacuate vulnerable people first.";
}

// Send AI Message (SMART VERSION)
function sendRescueAIMessage() {

    const input = document.getElementById("rescue-ai-input");
    const chatBox = document.getElementById("rescue-ai-messages");

    const userText = input.value.trim();
    if (!userText) return;

    input.value = "";

    // Add user message
    chatBox.innerHTML += `
        <div class="ai-user-msg">${userText}</div>
    `;

    const reply = generateAIResponse(userText);

    // Optional typing delay
    setTimeout(() => {

        chatBox.innerHTML += `
            <div class="ai-bot-msg">${reply}</div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

    }, 600);
}

// ==================================================
// ADVANCED STRUCTURED RESCUE FIELD AI ENGINE
// ==================================================

function generateAIResponse(message) {

    if (!activeRescueTarget) {
        return `
        <div class="ai-report">
            <strong>⚠ Rescue target data not available.</strong>
        </div>`;
    }

    const area = activeRescueTarget;

    const waterLevel = parseFloat(area.water_level);
    const rainfall = parseFloat(area.rainfall);
    const flowSpeed = parseFloat(area.flow_speed);

    const msg = message.toLowerCase();

    // ==================================================
    // 📊 Predictive Flood Model
    // ==================================================
    const predictedIncrease = (rainfall * 0.015 + flowSpeed * 0.2);
    const projectedLevel = (waterLevel + predictedIncrease);

    // ==================================================
    // 🚨 1️⃣ FIELD ENTRY SAFETY
    // ==================================================
    if (msg.includes("zone safe") || msg.includes("enter") || msg.includes("team entry")) {

        let riskCategory = "Low";
        let entryAdvice = "Safe for controlled ground team entry.";

        if (waterLevel >= 4) {
            riskCategory = "Severe";
            entryAdvice = "Unsafe for entry. Deploy rescue boats only.";
        } 
        else if (waterLevel >= 3) {
            riskCategory = "High";
            entryAdvice = "Caution required. Verify water depth before entry.";
        }

        return `
        <div class="ai-report">
            <div class="ai-title">🚨 Field Entry Assessment</div>

            <div class="ai-row">
                Current Water Level: <strong>${waterLevel.toFixed(2)} m</strong>
            </div>

            <div class="ai-row">
                Risk Category: <strong>${riskCategory}</strong>
            </div>

            <hr>

            <div class="ai-recommendation">
                ${entryAdvice}
            </div>
        </div>
        `;
    }

    // ==================================================
    // 📈 2️⃣ WATER LEVEL PREDICTION
    // ==================================================
    if (msg.includes("increase") || msg.includes("prediction") || msg.includes("increment")) {

        return `
        <div class="ai-report">
            <div class="ai-title">📊 Flood Prediction Report</div>

            <div class="ai-row">
                Current Level: <strong>${waterLevel.toFixed(2)} m</strong>
            </div>

            <div class="ai-row">
                Rainfall Intensity: <strong>${rainfall} mm/hr</strong>
            </div>

            <div class="ai-row">
                Flow Speed: <strong>${flowSpeed} m/s</strong>
            </div>

            <hr>

            <div class="ai-highlight">
                Estimated 1-Hour Rise:
                <strong>+${predictedIncrease.toFixed(2)} m</strong>
            </div>

            <div class="ai-highlight">
                Projected Level:
                <strong>${projectedLevel.toFixed(2)} m</strong>
            </div>

            <hr>

            <div class="ai-recommendation">
                🚨 Prepare rapid response units.
            </div>
        </div>
        `;
    }

    // ==================================================
    // 🌊 3️⃣ CURRENT WATER STATUS
    // ==================================================
    if (msg.includes("water level")) {

        let riskStatus = "Moderate";
        let recommendation = "Continue monitoring.";

        if (waterLevel >= 4) {
            riskStatus = "Severe";
            recommendation = "Immediate evacuation required.";
        } 
        else if (waterLevel >= 3) {
            riskStatus = "High";
            recommendation = "Prepare evacuation teams.";
        }

        return `
        <div class="ai-report">
            <div class="ai-title">🌊 Water Level Status</div>

            <div class="ai-highlight">
                Current Level: <strong>${waterLevel.toFixed(2)} m</strong>
            </div>

            <div class="ai-row">
                Risk Category: <strong>${riskStatus}</strong>
            </div>

            <hr>

            <div class="ai-recommendation">
                ${recommendation}
            </div>
        </div>
        `;
    }

    // ==================================================
    // 🏃 4️⃣ EVACUATION PRIORITY
    // ==================================================
    if (msg.includes("evacuate") || msg.includes("priority")) {

        let evacuationLevel = "Moderate";

        if (waterLevel >= 4) {
            evacuationLevel = "Immediate";
        } else if (waterLevel >= 3) {
            evacuationLevel = "High Alert";
        }

        return `
        <div class="ai-report">
            <div class="ai-title">🚑 Evacuation Priority Plan</div>

            <div class="ai-row">Priority Level: <strong>${evacuationLevel}</strong></div>

            <div class="ai-row">1️⃣ Elderly</div>
            <div class="ai-row">2️⃣ Children</div>
            <div class="ai-row">3️⃣ Injured</div>
            <div class="ai-row">4️⃣ Adults</div>

            <hr>

            <div class="ai-recommendation">
                Coordinate based on current level ${waterLevel.toFixed(2)} m.
            </div>
        </div>
        `;
    }

    // ==================================================
    // 🚑 5️⃣ RESOURCE DEPLOYMENT
    // ==================================================
    if (msg.includes("resource") || msg.includes("boat") || msg.includes("deploy")) {

        let advice = "Standard monitoring teams sufficient.";

        if (waterLevel > 3) {
            advice = "Deploy additional rescue boats and increase medical support.";
        }

        return `
        <div class="ai-report">
            <div class="ai-title">🚨 Resource Deployment Analysis</div>

            <div class="ai-row">Boats Required: 2+</div>
            <div class="ai-row">Life Jackets: 25+</div>
            <div class="ai-row">Medical Kits: 4+</div>

            <hr>

            <div class="ai-recommendation">
                ${advice}
            </div>
        </div>
        `;
    }

    // ==================================================
    // 📡 DEFAULT RESPONSE
    // ==================================================
    return `
    <div class="ai-report">
        📡 Monitoring flood parameters.
        <br><br>
        Ask about:
        <ul>
            <li>Water level</li>
            <li>Increase prediction</li>
            <li>Evacuation priority</li>
            <li>Resource deployment</li>
            <li>Zone safety</li>
        </ul>
    </div>
    `;
}
function getAreaData() {
    return {
        area_name: "Old Bus Stand Area",
        grids: 5,
        times_affected: 12,
        min_water_level_history: 0.5,
        max_water_level_history: 3.2,
        risk_level: "HIGH",
        live_data: {
            water_level: 1.8,
            rainfall: 32,
            wind_speed: 18,
            temperature: 29,
            humidity: 86,
            weather: "Heavy Rain",
            trend: "Rising"
        }
    };
}

function toggleAreaInfo(gridId) {

    const row = document.getElementById(`info-${gridId}`);

    if (row.classList.contains("hidden")) {
        row.classList.remove("hidden");
        loadAreaDetails(gridId);
    } else {
        row.classList.add("hidden");
    }
}

function loadAreaDetails(gridId) {

    const data = {
        grids: 5,
        times_affected: 12,
        min_water: 0.5,
        max_water: 3.2,
        risk: "HIGH",
        live: {
            water_level: 1.8,
            rainfall: 32,
            wind_speed: 18,
            weather: "Heavy Rain"
        }
    };

    const container = document.querySelector(`#info-${gridId} .area-details`);

    container.innerHTML = `
        <h4>Historical Summary</h4>
        <p>No. of Grids: ${data.grids}</p>
        <p>Total Times Affected: ${data.times_affected}</p>
        <p>Min Water Level: ${data.min_water} m</p>
        <p>Max Water Level: ${data.max_water} m</p>
        <p>Risk Level: ${data.risk}</p>

        <h4>Live Situation</h4>
        <p>Water Level: ${data.live.water_level} m</p>
        <p>Rainfall: ${data.live.rainfall} mm/hr</p>
        <p>Wind Speed: ${data.live.wind_speed} km/h</p>
        <p>Weather: ${data.live.weather}</p>
    `;
}