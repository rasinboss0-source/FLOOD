def assess_river_stage(water_level_m: float, rise_rate_m_per_hr: float, distance_to_stream_m: float) -> dict:
    """
    Assesses river danger level based on water height, rate of rise, and village stream proximity.
    """
    # Flash flood risk rises sharply when water rise rate > +0.3 m/hr
    if rise_rate_m_per_hr >= 0.6:
        rise_status = "RAPID SURGE (CRITICAL)"
        rise_risk_score = 0.95
    elif rise_rate_m_per_hr >= 0.3:
        rise_status = "RISING RAPIDLY"
        rise_risk_score = 0.70
    elif rise_rate_m_per_hr > 0.05:
        rise_status = "STEADY RISE"
        rise_risk_score = 0.40
    elif rise_rate_m_per_hr < -0.05:
        rise_status = "RECEDING"
        rise_risk_score = 0.15
    else:
        rise_status = "STABLE"
        rise_risk_score = 0.20

    # Stream proximity factor (villages within 300m are directly exposed to bank overtopping)
    proximity_factor = max(0.2, min(1.0, 1.0 - (distance_to_stream_m / 1000.0)))

    return {
        "water_level_m": round(water_level_m, 2),
        "rise_rate_m_per_hr": round(rise_rate_m_per_hr, 2),
        "rise_status": rise_status,
        "rise_risk_score": round(rise_risk_score, 2),
        "proximity_factor": round(proximity_factor, 2)
    }
