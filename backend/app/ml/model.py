import os
import joblib
import numpy as np
from app.config import MODEL_PATH
from app.services.alert_engine import classify_risk

_model_cache = None

def get_model():
    """Loads the calibrated ML model from disk, training if missing."""
    global _model_cache
    if _model_cache is not None:
        return _model_cache
        
    if not os.path.exists(MODEL_PATH):
        from app.ml.train import train_and_save_model
        train_and_save_model()
        
    payload = joblib.load(MODEL_PATH)
    _model_cache = payload["model"]
    return _model_cache

def explain_top_factors(feature_dict: dict) -> list:
    """
    Computes human-readable feature contribution explanations for the village resident.
    """
    factors = []
    
    r1h = feature_dict.get("rainfall_1h", 0)
    rr = feature_dict.get("river_rise_rate_m_per_hr", 0)
    sm = feature_dict.get("soil_moisture_pct", 50)
    catchment = feature_dict.get("catchment_area_sqkm", 20)
    slope = feature_dict.get("slope_deg", 5)
    dist_stream = feature_dict.get("distance_to_stream_m", 500)
    f3h = feature_dict.get("forecast_3h", 10)
    
    # 1. 1-hour rainfall intensity impact
    if r1h >= 50.0:
        factors.append({
            "feature": "1-Hour Rainfall Intensity",
            "value": f"{r1h} mm/hr",
            "impact": "CRITICAL",
            "explanation": f"Extreme torrential cloudburst ({r1h} mm in past hour) exceeds natural drainage capacity.",
            "weight": 0.40
        })
    elif r1h >= 25.0:
        factors.append({
            "feature": "1-Hour Rainfall Intensity",
            "value": f"{r1h} mm/hr",
            "impact": "ELEVATED",
            "explanation": f"Heavy rainfall ({r1h} mm) generating active surface runoff.",
            "weight": 0.25
        })

    # 2. River rise rate impact
    if rr >= 0.5:
        factors.append({
            "feature": "River Water Surge Rate",
            "value": f"+{rr} m/hr",
            "impact": "CRITICAL",
            "explanation": f"Stream water level is rising rapidly (+{rr} m/hour), indicating acute upstream dam or flash surge.",
            "weight": 0.35
        })
    elif rr >= 0.2:
        factors.append({
            "feature": "River Water Surge Rate",
            "value": f"+{rr} m/hr",
            "impact": "ELEVATED",
            "explanation": f"Stream water level is steadily climbing (+{rr} m/hour).",
            "weight": 0.20
        })

    # 3. Soil moisture saturation
    if sm >= 80.0:
        factors.append({
            "feature": "Soil Saturation",
            "value": f"{sm}%",
            "impact": "HIGH",
            "explanation": f"Ground soil is {sm}% waterlogged; nearly 100% of incoming rain turns into immediate surface runoff.",
            "weight": 0.20
        })

    # 4. Upstream catchment and slope dynamics
    if catchment >= 40.0:
        factors.append({
            "feature": "Upstream Catchment Area",
            "value": f"{catchment} km²",
            "impact": "MODERATE",
            "explanation": f"Large {catchment} km² watershed collects rain from multiple surrounding hills toward this village.",
            "weight": 0.15
        })

    if slope >= 15.0:
        factors.append({
            "feature": "Terrain Slope",
            "value": f"{slope}°",
            "impact": "MODERATE",
            "explanation": f"Steep hillside slopes ({slope}°) drastically shorten runoff concentration time.",
            "weight": 0.12
        })

    if dist_stream <= 150.0:
        factors.append({
            "feature": "Stream Proximity",
            "value": f"{dist_stream} m",
            "impact": "HIGH",
            "explanation": f"Village is directly adjacent to riverbed ({dist_stream}m), highly vulnerable to bank overtopping.",
            "weight": 0.22
        })

    # Sort by weight descending
    factors.sort(key=lambda x: x["weight"], reverse=True)
    return factors[:4]

def predict_flood_risk(feature_dict: dict, feature_array: list) -> dict:
    """
    Runs the calibrated machine learning inference pipeline.
    Returns: probability (0.0 to 1.0), risk_level, and top contributing drivers.
    """
    clf = get_model()
    X = np.array([feature_array])
    
    # Predict calibrated probability of flash flood (Class 1)
    probabilities = clf.predict_proba(X)
    flood_prob = float(probabilities[0][1])
    
    # Bound check
    flood_prob = max(0.01, min(0.99, flood_prob))
    risk_level = classify_risk(flood_prob)
    factors = explain_top_factors(feature_dict)
    
    return {
        "probability": round(flood_prob, 3),
        "probability_pct": int(round(flood_prob * 100)),
        "risk_level": risk_level,
        "contributing_factors": factors,
        "model_version": "RandomForest-Calibrated-v1.0"
    }
