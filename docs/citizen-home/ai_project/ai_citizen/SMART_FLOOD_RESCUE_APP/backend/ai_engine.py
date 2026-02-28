def think_and_reply(user_msg, props, lat, lon):
    msg = user_msg.lower().strip()

    # Extract data DIRECTLY from props (GeoJSON properties)
    risk = props.get("risk_level", "Unknown")
    safety = props.get("safety_score" )  # Default to string "0"
    elev_diff = props.get("elev_diff\n" )  # Default to string "0"
    grid_id = props.get("id", "N/A")
    row = props.get("row_index", "N/A")
    col = props.get("col_index", "N/A")
    
    # Convert to proper types
    try:
        safety_num = float(safety)
    except:
        safety_num = 0.0
    
    try:
        elev_diff_num = float(elev_diff)
    except:
        elev_diff_num = 0.0

    # ------------------ INTENT DETECTION ------------------
    if "safety" in msg and ("check" in msg or "my" in msg or "is it" in msg or "situation" in msg):
        intent = "safety_status"
    elif "safe" in msg and ("how" in msg or "guidance" in msg or "tips" in msg or "advice" in msg):
        intent = "guidance"
    elif "where" in msg or "location" in msg:
        intent = "location"
    elif "risk" in msg:
        intent = "risk_info"
    else:
        intent = "fallback"

    # ------------------ RESPONSE 1: SAFETY STATUS ------------------
    if intent == "safety_status":
        # Safety assessment based on ACTUAL data
        if safety_num >= 80:
            assessment = "Your area is relatively safe from flooding."
            advice = "Normal precautions are sufficient."
        elif safety_num >= 60:
            assessment = "Your area has moderate safety levels."
            advice = "Stay alert during heavy rainfall."
        elif safety_num >= 40:
            assessment = "Your area requires caution."
            advice = "Be prepared for possible flooding."
        else:
            assessment = "Your area is vulnerable to flooding."
            advice = "Take immediate precautions during rains."
        
        # Elevation analysis based on ACTUAL data
        if elev_diff_num > 2:
            elevation_note = f"Your area is {elev_diff_num:.1f}m above city average, providing good natural protection."
        elif elev_diff_num > 0:
            elevation_note = f"Your area is {elev_diff_num:.1f}m above city average, offering some protection."
        elif elev_diff_num < -2:
            elevation_note = f"⚠️ Your area is {abs(elev_diff_num):.1f}m below city average, making it more flood-prone."
        else:
            elevation_note = "Your elevation is similar to city average."

        return (
            f"🔍 **Safety Status Report**\n\n"
            f"📍 **Your Location:** {round(lat, 5)}, {round(lon, 5)}\n"
            f"🧭 **Grid ID:** {grid_id} (Row {row}, Column {col})\n"
            f"📊 **Safety Score:** {safety_num:.1f}/100\n"
            f"⚠️ **Risk Level:** {risk}\n"
            f"⛰️ **Elevation Difference:** {elev_diff_num:.1f} m\n\n"
            f"**Assessment:** {assessment}\n"
            f"**Elevation Analysis:** {elevation_note}\n"
            f"**Advice:** {advice}"
        )

    # ------------------ RESPONSE 2: SAFETY GUIDANCE ------------------
    if intent == "guidance":
        # Elevation advice from ACTUAL data
        if elev_diff_num > 1:
            elev_advice = f"Your area is {elev_diff_num:.1f}m above city average. This elevation helps reduce immediate flood impact."
        elif elev_diff_num < -1:
            elev_advice = f"⚠️ Your area is {abs(elev_diff_num):.1f}m below city average. You are in a low-lying zone that may flood faster."
        else:
            elev_advice = "Your elevation is similar to city average. Monitor water levels during heavy rain."

        # Risk-specific tips based on ACTUAL risk level
        if risk == "High":
            tips = [
                f"🚨 {risk} Risk Area: Stay alert to weather warnings",
                f"📊 Safety Score {safety_num:.1f}/100: Prepare emergency kit",
                f"⛰️ Elevation {elev_diff_num:.1f}m: Consider evacuation if flooding starts",
                "📱 Keep emergency contacts handy",
                "💧 Store 3-4 days of drinking water"
            ]
        elif risk == "Medium":
            tips = [
                f"⚠️ {risk} Risk Area: Monitor weather alerts regularly",
                f"📊 Safety Score {safety_num:.1f}/100: Moderate caution needed",
                f"⛰️ Elevation {elev_diff_num:.1f}m: Stay on higher floors if needed",
                "📱 Charge power banks and phones",
                "🧳 Keep important documents elevated"
            ]
        else:  # Low risk
            tips = [
                f"✅ {risk} Risk Area: Standard precautions sufficient",
                f"📊 Safety Score {safety_num:.1f}/100: Good safety level",
                f"⛰️ Elevation {elev_diff_num:.1f}m: Normal monitoring required",
                "🌧️ Avoid driving through standing water",
                "📱 Save local emergency numbers"
            ]

        tips_text = "\n".join([f"• {tip}" for tip in tips])

        return (
            f"🛡️ **Safety Guidelines**\n\n"
            f"📍 **Grid {grid_id}** | ⚠️ **{risk} Risk** | 📊 **Score: {safety_num:.1f}/100**\n"
            f"⛰️ **Elevation Difference:** {elev_diff_num:.1f} m\n\n"
            f"**Based on your location data:**\n"
            f"{elev_advice}\n\n"
            f"**Recommended Actions:**\n"
            f"{tips_text}\n\n"
            f"**General Flood Safety:**\n"
            f"• Never walk or drive through flood water\n"
            f"• Stay on higher ground during heavy rain\n"
            f"• Follow official evacuation orders\n"
            f"• Check on neighbors and elderly residents"
        )

    # ------------------ RESPONSE 3: LOCATION ------------------
    if intent == "location":
        return (
            f"📍 **Location Information**\n\n"
            f"**Coordinates:** {round(lat, 5)}, {round(lon, 5)}\n"
            f"**Grid Reference:** ID {grid_id} (Row {row}, Column {col})\n"
            f"**Safety Data:** Score {safety_num:.1f}/100 | Risk {risk}\n"
            f"**Elevation:** {elev_diff_num:.1f}m difference from city average\n"
            f"**Map Reference:** {round(lat, 3)}°N, {round(lon, 3)}°E"
        )

    # ------------------ RESPONSE 4: RISK INFO ------------------
    if intent == "risk_info":
        # Risk explanation based on ACTUAL data
        risk_explanation = ""
        if risk == "High":
            risk_explanation = f"High flood probability. With safety score of {safety_num:.1f}/100 and elevation {elev_diff_num:.1f}m, water may accumulate quickly during heavy rain."
        elif risk == "Medium":
            risk_explanation = f"Moderate flood possibility. Safety score {safety_num:.1f}/100 and elevation {elev_diff_num:.1f}m suggest some areas may experience waterlogging."
        else:
            risk_explanation = f"Low flood probability. Safety score {safety_num:.1f}/100 and elevation {elev_diff_num:.1f}m indicate minor water accumulation possible in extreme conditions."

        return (
            f"⚠️ **Flood Risk Analysis**\n\n"
            f"**Location Data:**\n"
            f"• Grid: {grid_id}\n"
            f"• Safety Score: {safety_num:.1f}/100\n"
            f"• Risk Level: {risk}\n"
            f"• Elevation: {elev_diff_num:.1f}m difference\n\n"
            f"**Risk Assessment:**\n"
            f"{risk_explanation}\n\n"
            f"**Data Interpretation:**\n"
           f"A safety score of {safety_num:.1f}/100 indicates {'significant vulnerability' if safety_num < 40 else 'moderate resilience' if safety_num < 70 else 'good safety levels'}.\n"
f"Elevation difference of {elev_diff_num:.1f}m {'improves' if elev_diff_num > 0 else 'reduces'} flood resistance."
        )

    # ------------------ FALLBACK ------------------
    return (
    f"🌊 **Flood Safety Assistant**\n\n"
    f"I'm here to help with flood safety information for your location.\n\n"
    f"📍 **Your Current Location:**\n"
    f"• Grid: {grid_id} | Safety: {safety_num:.1f}/100 | Risk: {risk}\n"
    f"• Elevation: {elev_diff_num:.1f}m from city average\n\n"
    f"You can ask me about:\n"
    f"• check your safety \n"
    f"• Safety guidance\n"
    f"• Location details\n"
    f"• Flood risk analysis"
)