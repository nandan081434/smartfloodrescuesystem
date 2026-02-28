// ==================================================
// SAFETY AI ENGINE (GRID BASED)
// ==================================================

let gridData = null;
let activeGrid = null;

// Load grid file
function initializeSafetyAI() {
    fetch("../data/kmr_grids_ai_latlon.geojson")
        .then(res => res.json())
        .then(data => {
            gridData = data;

            // For now use first grid
            activeGrid = gridData.features[0];

            console.log("Grid loaded successfully");
            console.log("Active Grid:", activeGrid);
        })
        .catch(err => console.error("Grid load error:", err));
}

// Call on load
initializeSafetyAI();


// ==================================================
// SEND MESSAGE
// ==================================================

function sendSafetyMessage() {

    const input = document.getElementById("safety-input");
    const chatBox = document.getElementById("safety-chat");

    const message = input.value.trim();
    if (!message) return;

    // Add user message
    chatBox.innerHTML += `
        <div class="user-msg">${message}</div>
    `;

    input.value = "";

    // Generate AI reply
    const reply = generateSafetyResponse(message);

    chatBox.innerHTML += `
        <div class="ai-msg">${reply}</div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;
}


// ==================================================
// AI RESPONSE LOGIC
// ==================================================

function generateSafetyResponse(message) {

    if (!activeGrid) {
        return "⏳ Loading grid data... please wait.";
    }

    const props = activeGrid.properties;

    
    const elevDiff = props.elev_diff;
    const riskLevel = props.risk_level;
    const safetyScore = props.safety_score;

    const msg = message.toLowerCase();

   // ==================================================
// SAFETY AI RESPONSE LOGIC (ENHANCED VERSION)
// ==================================================
const elevation = props.elev_diff;


// ==================================================

if (msg.includes("risk") || msg.includes("check")) {

    let recommendation = "";

    if (riskLevel.toLowerCase().includes("low")) {
        recommendation = "Conditions stable. Continue routine monitoring.";
    }
    else if (riskLevel.toLowerCase().includes("moderate")) {
        recommendation = "Maintain alert status. Keep response teams ready.";
    }
    else {
        recommendation = "High vulnerability detected. Immediate preparedness and resource positioning required.";
    }
return `
🧠 SAFETY AI - AREA RISK ASSESSMENT
────────────────────────────────

📍 AREA SUMMARY
   ▸ Risk Level      : ${riskLevel}
   ▸ Safety Score    : ${safetyScore}/100
   ▸ Elevation Diff  : ${elevDiff} meters

📊 TERRAIN ANALYSIS
${
    elevDiff > 30 
        ? "• High terrain variation detected.\n  Water may rapidly flow toward lower zones."
        : elevDiff > 15
        ? "• Moderate terrain variation.\n  Monitor drainage flow and runoff channels."
        : "• Low terrain variation.\n  Water spread may be more uniform."
}

📌 Operational Advisory:
${recommendation}
`;
}

// ==================================================

if (msg.includes("score") || msg.includes("safe")) {

    return `
🧠 SAFETY AI – SAFETY METRICS
────────────────────────────
🛡 Current Safety Score : ${safetyScore}/100
⚠ Associated Risk Level : ${riskLevel}

Interpretation:
Higher score indicates better terrain resilience against flood accumulation.
`;
}


// ==================================================

if (msg.includes("flood") || msg.includes("water")) {

    let floodAdvice = "";

    if (riskLevel.toLowerCase().includes("low")) {
        floodAdvice = "Minimal flood probability. Maintain periodic checks.";
    }
    else if (riskLevel.toLowerCase().includes("moderate")) {
        floodAdvice = "Moderate flood probability. Prepare standby rescue units.";
    }
    else {
        floodAdvice = "Severe flood probability. Immediate response protocol recommended.";
    }

    return `
🧠 SAFETY AI – FLOOD RESPONSE STATUS
──────────────────────────────────
⚠ Current Risk Classification : ${riskLevel}

📌 Flood Advisory:
${floodAdvice}
`;
}


// ==================================================

return `
🧠 SAFETY AI ASSISTANT

You can ask about:
• Elevation details
• Flood risk assessment
• Safety score
• Water accumulation risk
`;  

}