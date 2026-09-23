import math
from datetime import datetime

def clean_environmental_data(raw_data: dict) -> dict:
    """
    Cleans raw environmental observations:
    - Filters sentinel values like -999, negative precipitation, or unrealistically high values (> 400mm/h)
    - Replaces missing / NaN entries with safe default medians
    - Bounds soil moisture between 0 and 100%
    - Bounds river water levels and rise rates
    - Synchronizes timestamp to ISO format
    """
    clean = {}
    
    # 1. Clean rainfall fields
    rain_fields = ["rainfall_1h", "rainfall_3h", "rainfall_6h", "rainfall_24h", "rainfall_72h", "forecast_1h", "forecast_3h", "forecast_6h"]
    for field in rain_fields:
        val = raw_data.get(field)
        if val is None or val == -999 or (isinstance(val, float) and math.isnan(val)) or val < 0:
            clean[field] = 0.0
        elif val > 600.0:
            # Physical storm cap anomaly
            clean[field] = 350.0
        else:
            clean[field] = float(val)
            
    # Consistency check: 3h cannot be less than 1h, 24h cannot be less than 3h
    if clean["rainfall_3h"] < clean["rainfall_1h"]:
        clean["rainfall_3h"] = clean["rainfall_1h"]
    if clean["rainfall_6h"] < clean["rainfall_3h"]:
        clean["rainfall_6h"] = clean["rainfall_3h"]
    if clean["rainfall_24h"] < clean["rainfall_6h"]:
        clean["rainfall_24h"] = clean["rainfall_6h"]
    if clean["rainfall_72h"] < clean["rainfall_24h"]:
        clean["rainfall_72h"] = clean["rainfall_24h"]

    # 2. Clean Soil Moisture
    sm = raw_data.get("soil_moisture_pct")
    if sm is None or sm == -999 or (isinstance(sm, float) and math.isnan(sm)):
        clean["soil_moisture_pct"] = 45.0
    else:
        clean["soil_moisture_pct"] = max(5.0, min(100.0, float(sm)))

    # 3. Clean River Level & Rise Rate
    wl = raw_data.get("river_water_level_m")
    if wl is None or wl == -999 or (isinstance(wl, float) and math.isnan(wl)) or wl < 0:
        clean["river_water_level_m"] = 1.5
    else:
        clean["river_water_level_m"] = max(0.1, min(25.0, float(wl)))

    rr = raw_data.get("river_rise_rate_m_per_hr")
    if rr is None or rr == -999 or (isinstance(rr, float) and math.isnan(rr)):
        clean["river_rise_rate_m_per_hr"] = 0.0
    else:
        # Bound rise rate to realistic extremes [-2.0 m/h to +3.5 m/h]
        clean["river_rise_rate_m_per_hr"] = max(-2.0, min(3.5, float(rr)))

    # 4. Timestamp
    clean["timestamp"] = raw_data.get("timestamp") or datetime.now().isoformat()
    clean["source"] = raw_data.get("source", "cleaned_sensor_pipeline")
    
    return clean
