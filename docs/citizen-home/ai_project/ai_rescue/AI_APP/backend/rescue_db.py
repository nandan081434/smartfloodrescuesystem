from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from ai_engine import think_and_reply
from rescue_db import RescueDatabase  # New module needed

app = Flask(__name__)
CORS(app)

# Initialize rescue database
db = RescueDatabase()

# ------------------ EXISTING USER AI ENDPOINTS ------------------
@app.route("/ask", methods=["POST"])
def ask():
    """Existing user AI endpoint - KEEP AS IS"""
    # ... existing code ...

# ------------------ NEW RESCUE ENDPOINTS ------------------

@app.route("/rescue/emergencies", methods=["GET"])
def get_emergencies():
    """Get all active emergencies"""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    
    emergencies = db.get_active_emergencies()
    
    if lat and lon:
        # Sort by distance to user
        emergencies = sort_by_distance(emergencies, float(lat), float(lon))
    
    return jsonify({
        "count": len(emergencies),
        "emergencies": emergencies[:10]  # Top 10 closest
    })

@app.route("/rescue/emergency/<grid_id>", methods=["GET"])
def get_emergency_details(grid_id):
    """Get detailed info about specific emergency"""
    details = db.get_emergency_details(grid_id)
    return jsonify(details)

@app.route("/rescue/navigation/<grid_id>", methods=["GET"])
def get_navigation(grid_id):
    """Get navigation route to emergency"""
    start_lat = request.args.get("start_lat")
    start_lon = request.args.get("start_lon")
    
    route = calculate_route(
        start=(start_lat, start_lon),
        end=db.get_grid_coordinates(grid_id),
        avoid_flooded=True
    )
    
    return jsonify(route)

@app.route("/rescue/ai-advice", methods=["POST"])
def get_rescue_ai_advice():
    """Rescue-specific AI advice"""
    data = request.json
    question = data.get("question")
    user_location = data.get("location")
    emergency_id = data.get("emergency_id")
    
    if emergency_id:
        emergency_data = db.get_emergency_details(emergency_id)
    else:
        emergency_data = db.get_active_emergencies()
    
    advice = think_and_reply(question, user_location, emergency_data)
    return jsonify({"advice": advice})

@app.route("/rescue/sensor-data/<grid_id>", methods=["GET"])
def get_sensor_data(grid_id):
    """Get live sensor data for grid"""
    sensors = db.get_sensor_readings(grid_id)
    return jsonify(sensors)

@app.route("/rescue/update-status", methods=["POST"])
def update_rescue_status():
    """Update emergency status (being helped, completed, etc.)"""
    data = request.json
    grid_id = data.get("grid_id")
    status = data.get("status")
    user_id = data.get("user_id")
    
    db.update_emergency_status(grid_id, status, user_id)
    return jsonify({"success": True})

@app.route("/rescue/report", methods=["POST"])
def report_emergency():
    """Report new emergency (from citizens or teams)"""
    data = request.json
    db.add_emergency_report(data)
    return jsonify({"success": True})

@app.route("/rescue/resources", methods=["GET"])
def get_available_resources():
    """Get available rescue resources"""
    resources = db.get_resources()
    return jsonify(resources)

@app.route("/rescue/allocate-resource", methods=["POST"])
def allocate_resource():
    """Allocate resource to emergency"""
    data = request.json
    db.allocate_resource(data)
    return jsonify({"success": True})

@app.route("/rescue/weather/<grid_id>", methods=["GET"])
def get_grid_weather(grid_id):
    """Get weather forecast for specific grid"""
    weather = fetch_weather_forecast(grid_id)
    return jsonify(weather)

@app.route("/rescue/evacuation-plan/<grid_id>", methods=["GET"])
def get_evacuation_plan(grid_id):
    """Get evacuation plan for grid"""
    plan = generate_evacuation_plan(grid_id)
    return jsonify(plan)

@app.route("/rescue/analytics", methods=["GET"])
def get_rescue_analytics():
    """Get rescue operation analytics"""
    analytics = db.get_analytics()
    return jsonify(analytics)

# ------------------ HELPER FUNCTIONS ------------------
def calculate_route(start, end, avoid_flooded=True):
    """Calculate safe route between points"""
    # Implementation needed
    pass

def sort_by_distance(emergencies, user_lat, user_lon):
    """Sort emergencies by distance to user"""
    # Implementation needed
    pass

def fetch_weather_forecast(grid_id):
    """Fetch weather data for grid"""
    # Implementation needed
    pass

def generate_evacuation_plan(grid_id):
    """Generate evacuation plan"""
    # Implementation needed
    pass

if __name__ == "__main__":
    print("Rescue AI System starting...")
    app.run(host="127.0.0.1", port=5001, debug=True)  # Different port!