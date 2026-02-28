from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3
import os
from datetime import datetime
from shapely.geometry import shape, Point
from ai_engine import think_and_reply

# ================== APP SETUP ==================
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))
DB_PATH = os.path.join(BASE_DIR, "rescue.db")

# ================== LOAD GEOJSON (AUTO-DETECT) ==================
geojson_data = None
GEOJSON_PATH = None

if not os.path.exists(DATA_DIR):
    raise FileNotFoundError(f"❌ Data directory not found: {DATA_DIR}")

for file in os.listdir(DATA_DIR):
    if file.lower().endswith(".geojson"):
        GEOJSON_PATH = os.path.join(DATA_DIR, file)
        with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)
        print(f"✅ Loaded GeoJSON: {file}")
        break

if geojson_data is None:
    raise FileNotFoundError("❌ No .geojson file found in data directory")

# ================== DATABASE ==================
def get_db():
    return sqlite3.connect(DB_PATH)

def init_rescue_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS emergencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grid_id TEXT,
            lat REAL,
            lon REAL,
            status TEXT DEFAULT 'active',
            severity TEXT DEFAULT 'medium',
            description TEXT,
            reporter_name TEXT,
            reporter_phone TEXT,
            people_affected INTEGER DEFAULT 1,
            needs TEXT,
            reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            lat REAL,
            lon REAL,
            status TEXT DEFAULT 'available',
            vehicle_type TEXT,
            capacity INTEGER,
            contact TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            quantity INTEGER,
            location TEXT,
            status TEXT DEFAULT 'available'
        )
    """)

    conn.commit()
    conn.close()

init_rescue_db()

# ================== GRID HELPERS ==================
def find_grid(lat, lon):
    if lat is None or lon is None:
        return None

    point = Point(lon, lat)  # GeoJSON = (lon, lat)
    for feature in geojson_data.get("features", []):
        try:
            polygon = shape(feature["geometry"])
            if polygon.contains(point):
                return feature.get("properties", {})
        except Exception:
            continue
    return None

def risk_from_score(score):
    """
    Safety_Score expected on a 0–100 scale
    """
    try:
        score = float(score)
    except Exception:
        return "unknown"

    if score >= 70:
        return "low"
    elif score >= 40:
        return "medium"
    else:
        return "high"


# ================== API ENDPOINTS ==================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Flood Safety AI & Rescue System",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/grid-info", methods=["GET"])
def grid_info():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "lat and lon required"}), 400

    grid = find_grid(lat, lon)
    if not grid:
        return jsonify({"error": "Location outside flood grid"}), 404

    return jsonify({
        "Grid ID": grid.get("Grid ID", "UNKNOWN"),
        "Safety_Score": grid.get("Safety_Score", 0),
        "Water_Level": grid.get("Water_Level", "Unknown")
    })

@app.route("/safety-check", methods=["POST"])
def safety_check():
    data = request.json or {}
    lat = data.get("lat")
    lon = data.get("lon")

    grid = find_grid(lat, lon)
    if not grid:
        return jsonify({"error": "Location outside flood grid"}), 404

    score = grid.get("Safety_Score", 0)
    risk = risk_from_score(score)

    advice_map = {
        "low": "Area is relatively safe. Stay alert.",
        "medium": "Prepare evacuation plan.",
        "high": "Evacuate immediately if advised."
    }

    return jsonify({
        "grid_id": grid.get("Grid ID", "UNKNOWN"),
        "safety_score": score,
        "risk_level": risk,
        "water_level": grid.get("Water_Level", "Unknown"),
        "timestamp": datetime.now().isoformat(),
        "advice": advice_map.get(risk, "Follow official guidance.")
    })

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json or {}
    message = data.get("message", "")
    lat = data.get("lat")
    lon = data.get("lon")
    history = data.get("history", [])

    grid = find_grid(lat, lon)

    reply = think_and_reply(
        message,
        lat,
        lon,
        grid,
        history
    )

    return jsonify({
        "reply": reply,
        "risk_level": risk_from_score(grid.get("Safety_Score", 0)) if grid else "unknown"
    })

@app.route("/rescue/report", methods=["POST"])
def rescue_report():
    data = request.json or {}
    lat = data.get("lat")
    lon = data.get("lon")

    grid = find_grid(lat, lon)
    grid_id = grid.get("Grid ID", "UNKNOWN") if grid else "UNKNOWN"

    conn = get_db()
    c = conn.cursor()

    c.execute("""
        INSERT INTO emergencies
        (grid_id, lat, lon, severity, description, reporter_name, reporter_phone, people_affected, needs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        grid_id,
        lat,
        lon,
        data.get("severity", "medium"),
        data.get("description", ""),
        data.get("reporter_name", "Anonymous"),
        data.get("reporter_phone", ""),
        data.get("people_affected", 1),
        data.get("needs", "")
    ))

    conn.commit()
    emergency_id = c.lastrowid
    conn.close()

    return jsonify({
        "success": True,
        "emergency_id": emergency_id
    })

# ================== MAIN ==================
if __name__ == "__main__":
    print("🌊 Flood Safety AI backend running")
    print(f"📂 Data directory: {DATA_DIR}")
    print(f"🗺️ GeoJSON file: {os.path.basename(GEOJSON_PATH)}")
    print("🚀 Server: http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
from data_provider import get_live_area_data

@app.route("/rescue/area-live/<grid_id>", methods=["GET"])
def area_live_data(grid_id):
    for feature in geojson_data["features"]:
        props = feature.get("properties", {})
        if props.get("Grid ID") == grid_id:
            return jsonify(get_live_area_data(props))

    return jsonify({"error": "Grid not found"}), 404
