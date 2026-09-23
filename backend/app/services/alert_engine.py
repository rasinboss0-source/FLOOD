import json
from app.config import RISK_THRESHOLDS, EMERGENCY_CONTACTS

def classify_risk(probability: float) -> str:
    """Classifies flood probability into risk tiers."""
    prob = max(0.0, min(1.0, float(probability)))
    if prob >= RISK_THRESHOLDS["VERY_HIGH"][0]:
        return "VERY HIGH"
    elif prob >= RISK_THRESHOLDS["HIGH"][0]:
        return "HIGH"
    elif prob >= RISK_THRESHOLDS["MODERATE"][0]:
        return "MODERATE"
    else:
        return "LOW"

def generate_alert_bulletin(village_name: str, state: str, district: str, risk_level: str, probability: float, factors: list, shelters: list) -> dict:
    """
    Generates a structured official alert bulletin with emergency guidelines,
    nearest safe shelters, and response helpline numbers.
    """
    prob_pct = int(round(probability * 100))
    is_urgent = risk_level in ["HIGH", "VERY HIGH"]
    
    if risk_level == "VERY HIGH":
        headline = f"🔴 CRITICAL FLASH FLOOD EMERGENCY: Evacuate Low-lying Areas in {village_name}"
        instructions = [
            "IMMEDIATE ACTION REQUIRED: Move to designated high ground or emergency shelters immediately.",
            "Do NOT attempt to cross streams, low bridges, or overflowing culverts on foot or in vehicles.",
            "Disconnect electrical mains and LPG cylinders before evacuating.",
            "Carry emergency go-bag (drinking water, flashlight, medicines, essential documents)."
        ]
        siren_active = True
        badge_color = "#ef4444"
    elif risk_level == "HIGH":
        headline = f"🟠 FLASH FLOOD WARNING: High Danger Expected in {village_name} Within 1–3 Hours"
        instructions = [
            "PREPARE FOR EVACUATION: Move livestock and valuable possessions to high ground.",
            "Keep emergency battery torches, mobile phones fully charged.",
            "Monitor local stream levels and listen for official warning sirens.",
            "Identify nearest evacuation shelter route."
        ]
        siren_active = True
        badge_color = "#f97316"
    elif risk_level == "MODERATE":
        headline = f"🟡 FLASH FLOOD ADVISORY: Elevated Water Flow in {village_name}"
        instructions = [
            "Be vigilant: Rainfall intensity is increasing in the upstream catchment.",
            "Avoid camping, fishing, or lingering near riverbanks and mountain streams.",
            "Check local drainage culverts for blockage."
        ]
        siren_active = False
        badge_color = "#eab308"
    else:
        headline = f"🟢 NORMAL CONDITIONS: Low Flash Flood Probability in {village_name}"
        instructions = [
            "Conditions are currently stable.",
            "Regular seasonal monitoring active."
        ]
        siren_active = False
        badge_color = "#22c55e"

    return {
        "village": village_name,
        "district": district,
        "state": state,
        "risk_level": risk_level,
        "probability_pct": prob_pct,
        "headline": headline,
        "instructions": instructions,
        "siren_active": siren_active,
        "badge_color": badge_color,
        "key_drivers": factors,
        "nearest_shelters": shelters[:2] if shelters else [],
        "emergency_contacts": EMERGENCY_CONTACTS
    }
