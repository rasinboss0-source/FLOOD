def calculate_soil_saturation(soil_type: str, soil_clay_pct: float, rainfall_24h: float, rainfall_72h: float, current_moisture_pct: float = None) -> dict:
    """
    Computes effective soil moisture saturation and runoff curve coefficient.
    Higher clay content increases runoff potential once soil is wet.
    """
    # Base runoff curve index based on clay content and soil type
    clay_factor = min(1.0, max(0.1, soil_clay_pct / 100.0))
    
    # Cumulative infiltration index
    infil_index = (rainfall_24h * 0.7) + (rainfall_72h * 0.3)
    
    if current_moisture_pct is not None:
        saturation_pct = current_moisture_pct
    else:
        # Estimate saturation percentage based on recent rains and soil water-holding capacity
        saturation_pct = min(98.0, max(15.0, 25.0 + (infil_index * 0.45 * (1.0 + clay_factor))))
        
    # Runoff factor: when saturation > 70%, runoff spikes non-linearly
    if saturation_pct > 75.0:
        runoff_factor = 0.75 + (0.25 * ((saturation_pct - 75.0) / 25.0))
    elif saturation_pct > 50.0:
        runoff_factor = 0.45 + (0.30 * ((saturation_pct - 50.0) / 25.0))
    else:
        runoff_factor = 0.20 + (0.25 * (saturation_pct / 50.0))
        
    return {
        "saturation_pct": round(saturation_pct, 1),
        "runoff_coefficient": round(runoff_factor, 3),
        "status": "CRITICALLY SATURATED" if saturation_pct >= 85 else ("NEAR SATURATION" if saturation_pct >= 70 else "NORMAL INFILTRATION")
    }
