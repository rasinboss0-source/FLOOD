from fastapi import APIRouter
from app.database.db import get_db
from app.api.prediction import get_flood_prediction

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("")
def get_active_alerts():
    """
    Returns active flash flood alerts across all monitored villages.
    Identifies high-risk regions requiring immediate response.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT village_id, name, state, district FROM villages")
        villages = cursor.fetchall()
        
    alerts = []
    risk_counts = {"VERY_HIGH": 0, "HIGH": 0, "MODERATE": 0, "LOW": 0}
    
    for v in villages:
        try:
            pred_data = get_flood_prediction(v["village_id"])
            p = pred_data["prediction"]
            risk = p["risk_level"]
            
            if risk == "VERY HIGH":
                risk_counts["VERY_HIGH"] += 1
            elif risk == "HIGH":
                risk_counts["HIGH"] += 1
            elif risk == "MODERATE":
                risk_counts["MODERATE"] += 1
            else:
                risk_counts["LOW"] += 1
                
            alerts.append({
                "village_id": v["village_id"],
                "village_name": v["name"],
                "district": v["district"],
                "state": v["state"],
                "risk_level": risk,
                "probability": p["probability"],
                "probability_pct": p["probability_pct"],
                "headline": pred_data["bulletin"]["headline"],
                "siren_active": pred_data["bulletin"]["siren_active"],
                "badge_color": pred_data["bulletin"]["badge_color"],
                "key_drivers": p["contributing_factors"],
                "updated_at": pred_data["live_metrics"]["updated_at"]
            })
        except Exception:
            continue
            
    # Sort with highest risk first
    risk_priority = {"VERY HIGH": 4, "HIGH": 3, "MODERATE": 2, "LOW": 1}
    alerts.sort(key=lambda a: (risk_priority.get(a["risk_level"], 0), a["probability"]), reverse=True)
    
    return {
        "total_monitored": len(alerts),
        "summary": risk_counts,
        "critical_alert_active": (risk_counts["VERY_HIGH"] > 0 or risk_counts["HIGH"] > 0),
        "alerts": alerts
    }
