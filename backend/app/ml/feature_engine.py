import math

FEATURE_NAMES = [
    "rainfall_1h",
    "rainfall_3h",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_72h",
    "forecast_3h",
    "soil_moisture_pct",
    "river_water_level_m",
    "river_rise_rate_m_per_hr",
    "elevation_m",
    "slope_deg",
    "distance_to_stream_m",
    "catchment_area_sqkm",
    "soil_clay_pct",
    "land_cover_urban_pct",
    "land_cover_forest_pct",
    "historical_flood_count",
    "rational_runoff_index",
    "slope_velocity_index",
    "stream_vulnerability_index"
]

def extract_features(static_data: dict, live_data: dict, iot_data: dict = None) -> dict:
    """
    Blends Static GIS, Live Ingestion, and IoT sensor observations into a normalized feature vector.
    Local IoT sensor data takes precedence if available and valid.
    """
    # 1. Resolve rainfall (IoT gauge override if available)
    r1h = float(iot_data.get("local_rainfall_1h") if iot_data and iot_data.get("local_rainfall_1h") is not None else live_data.get("rainfall_1h", 0.0))
    r3h = float(live_data.get("rainfall_3h", r1h * 1.5))
    r6h = float(live_data.get("rainfall_6h", r3h * 1.4))
    r24h = float(live_data.get("rainfall_24h", r6h * 1.5))
    r72h = float(live_data.get("rainfall_72h", r24h * 1.3))
    f3h = float(live_data.get("forecast_3h", 10.0))

    # 2. Resolve Soil Moisture
    sm = float(iot_data.get("local_soil_moisture_pct") if iot_data and iot_data.get("local_soil_moisture_pct") is not None else live_data.get("soil_moisture_pct", 50.0))

    # 3. Resolve River Level & Rate of Rise
    wl = float(iot_data.get("local_water_level_m") if iot_data and iot_data.get("local_water_level_m") is not None else live_data.get("river_water_level_m", 1.5))
    rr = float(live_data.get("river_rise_rate_m_per_hr", 0.0))

    # 4. Static GIS Parameters
    elev = float(static_data.get("elevation_m", 100.0))
    slope = float(static_data.get("slope_deg", 5.0))
    dist_stream = float(static_data.get("distance_to_stream_m", 500.0))
    catchment = float(static_data.get("catchment_area_sqkm", 20.0))
    clay = float(static_data.get("soil_clay_pct", 40.0))
    urban = float(static_data.get("land_cover_urban_pct", 10.0))
    forest = float(static_data.get("land_cover_forest_pct", 30.0))
    hist_count = int(static_data.get("historical_flood_count", 2))

    # 5. Hydrological Derived Features
    # Rational Runoff Index Q ~ C * I * A
    # C depends on soil clay, urban %, and soil moisture
    c_coeff = 0.2 + (0.35 * (clay / 100.0)) + (0.30 * (urban / 100.0)) + (0.30 * (sm / 100.0))
    runoff_index = c_coeff * (r1h + (r3h * 0.5)) * math.log(catchment + 1.0)

    # Slope velocity index (steeper slopes concentrate water much quicker)
    slope_rad = math.radians(max(0.5, slope))
    slope_velocity = math.sqrt(math.sin(slope_rad)) * 10.0

    # Stream vulnerability index (inverse of distance to stream)
    stream_vuln = 1000.0 / (dist_stream + 50.0)

    feature_dict = {
        "rainfall_1h": r1h,
        "rainfall_3h": r3h,
        "rainfall_6h": r6h,
        "rainfall_24h": r24h,
        "rainfall_72h": r72h,
        "forecast_3h": f3h,
        "soil_moisture_pct": sm,
        "river_water_level_m": wl,
        "river_rise_rate_m_per_hr": rr,
        "elevation_m": elev,
        "slope_deg": slope,
        "distance_to_stream_m": dist_stream,
        "catchment_area_sqkm": catchment,
        "soil_clay_pct": clay,
        "land_cover_urban_pct": urban,
        "land_cover_forest_pct": forest,
        "historical_flood_count": hist_count,
        "rational_runoff_index": round(runoff_index, 3),
        "slope_velocity_index": round(slope_velocity, 3),
        "stream_vulnerability_index": round(stream_vuln, 3)
    }

    feature_array = [feature_dict[name] for name in FEATURE_NAMES]
    return {
        "feature_dict": feature_dict,
        "feature_array": feature_array,
        "feature_names": FEATURE_NAMES
    }
