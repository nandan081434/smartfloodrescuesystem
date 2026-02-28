import random
from datetime import datetime

def get_live_area_data(grid):
    return {
        "grid_id": grid.get("Grid ID", "UNKNOWN"),
        "area_name": grid.get("Area_Name", "Unknown Area"),
        "coordinates": {
            "lat": grid.get("Latitude", 18.32),
            "lon": grid.get("Longitude", 78.30)
        },
        "risk_level": random.choice(["low", "medium", "high"]),
        "safety_score": random.randint(20, 90),
        "water_level": {
            "value": round(random.uniform(0.5, 3.5), 2),
            "unit": "meters"
        },
        "rainfall": {
            "value": random.randint(0, 60),
            "unit": "mm/hr"
        },
        "flow_speed": {
            "value": round(random.uniform(0.2, 4.5), 2),
            "unit": "m/s"
        },
        "updated_at": datetime.now().isoformat()
    }
