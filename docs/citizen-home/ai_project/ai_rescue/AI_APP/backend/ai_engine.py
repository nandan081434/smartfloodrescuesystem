def think_and_reply(message, lat=None, lon=None, grid_info=None, history=None):
    """
    Flood Safety & Rescue AI Engine
    Clean, stable, frontend-compatible
    """

    msg = (message or "").lower().strip()
    history = history or []

    # ---------- LOCATION CONTEXT ----------
    location_text = ""
    if lat is not None and lon is not None:
        location_text = f"\n📍 Location: {lat:.4f}, {lon:.4f}"

    # ---------- GRID / RISK CONTEXT ----------
    risk = "unknown"
    safety_score = None
    water_level = "Unknown"

    if grid_info:
        safety_score = grid_info.get("safety_score")
        water_level = grid_info.get("Water_Level")

        if safety_score >= 7:
            risk = "low"
        elif safety_score >= 4:
            risk = "medium"
        else:
            risk = "high"

    # ---------- INTENT HANDLING ----------

    # Emergency / Help
    if any(w in msg for w in ["emergency", "urgent", "help", "rescue", "trapped"]):
        return (
            "🚨 **Emergency Guidance**\n"
            "• Move to higher ground immediately\n"
            "• Avoid flowing or knee-deep water\n"
            "• Use the **Rescue** tab to alert teams\n"
            "• Keep your phone charged\n"
            f"{location_text}"
        )

    # Risk / Safety
    if any(w in msg for w in ["risk", "safe", "danger", "hazard"]):
        return (
            f"🛡️ **Flood Risk Assessment**\n"
            f"• Risk Level: **{risk.upper()}**\n"
            f"• Safety Score: {safety_score if safety_score is not None else 'N/A'} / 10\n"
            "• Stay alert to official warnings\n"
            f"{location_text}"
        )

    # Water / Flood Level
    if any(w in msg for w in ["water", "level", "depth", "flood"]):
        return (
            "🌊 **Flood Conditions**\n"
            f"• Water Level: {water_level}\n"
            f"• Risk Level: {risk.upper()}\n"
            "• Avoid drains, bridges, and flooded roads"
        )

    # Evacuation / Shelter
    if any(w in msg for w in ["evacuate", "evacuation", "shelter", "safe zone"]):
        return (
            "🏠 **Evacuation & Shelters**\n"
            "• Move to government-designated shelters\n"
            "• Schools & community halls are often used\n"
            "• Carry water, documents, medicines\n"
            "• Help children, elderly, and disabled persons first"
        )

    # Resources / Teams
    if any(w in msg for w in ["team", "boat", "resources", "equipment", "medical"]):
        return (
            "🚤 **Rescue Resources**\n"
            "• Boats and rescue teams are on standby\n"
            "• Medical assistance available\n"
            "• Use the **Rescue** tab to request help"
        )

    # Weather
    if any(w in msg for w in ["weather", "rain", "storm", "forecast"]):
        return (
            "🌦️ **Weather Advisory**\n"
            "• Heavy rainfall increases flood risk\n"
            "• Monitor official weather updates\n"
            "• Prepare for evacuation if rainfall continues"
        )

    # ---------- DEFAULT RESPONSE ----------
    return (
        "🤖 **Flood Safety AI**\n"
        "I can help you with:\n"
        "• Flood risk assessment\n"
        "• Nearby shelters & evacuation advice\n"
        "• Emergency rescue guidance\n"
        "• Safety precautions\n"
        "Ask me anything related to flood safety."
        f"{location_text}"
    )
