from flask import Flask, request, jsonify
from flask_cors import CORS
from shapely.geometry import shape, Point
import json
import os
from ai_engine import think_and_reply
from flask import send_from_directory

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)


@app.route("/")
def serve_frontend():
    return app.send_static_file("index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("../frontend", path)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GRID_PATH = os.path.join(BASE_DIR, "../data/kmr_grids_ai_latlon.geojson")

with open(GRID_PATH, "r", encoding="utf-8") as f:
    GRID_DATA = json.load(f)["features"]

def find_user_grid(lat, lon):
    point = Point(lon, lat)
    for feature in GRID_DATA:
        polygon = shape(feature["geometry"])
        if polygon.contains(point):
            return feature["properties"]
    return None

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json

    lat = data.get("lat")
    lon = data.get("lon")
    message = data.get("message", "").strip()

    if lat is None or lon is None:
        return jsonify({"reply": "Location not received."})

    props = find_user_grid(lat, lon)

    if not props:
        return jsonify({
            "reply": "Your location is outside the mapped flood monitoring area."
        })

    # Simple call - ALL logic in ai_engine.py
    ai_reply = think_and_reply(message, props, lat, lon)
    
    return jsonify({"reply": ai_reply})

if __name__ == "__main__":
    print("Flood Safety AI backend running...")
    app.run(host="127.0.0.1", port=5500, debug=True)