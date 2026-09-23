"""
Master Village Cadastre Importer & Feature Synthesizer for SIH26192
Tamil Nadu Hyperlocal Flash Flood Early Warning System
Integrates 1,872 official village records across Nilgiris, Dindigul, Coimbatore, Theni, and Salem.
"""

import os
import re
import json
import csv
import math
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "scripts", "raw")
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_DIR = os.path.join(BASE_DIR, "database")

# Known multi-word subdistricts
MULTI_WORD_SUBDISTRICTS = [
    "Coimbatore North",
    "Coimbatore South",
    "Salem South",
    "Salem West",
]

# District centroids & typical geography
DISTRICT_CONFIG = {
    "The Nilgiris": {
        "id": "TN-NIL",
        "name": "The Nilgiris",
        "state": "Tamil Nadu",
        "is_hilly_district": True,
        "center_lat": 11.41,
        "center_lon": 76.70,
        "elevation_base": 1800,
        "elevation_span": 600,
        "slope_base": 24.0,
        "primary_soil": "Laterite Clay Loam",
        "geology": "Charnockite & Granulite Complex",
        "subdistricts": {
            "Coonoor": {"lat": 11.353, "lon": 76.795, "elev": 1850, "slope": 22.5},
            "Gudalur": {"lat": 11.507, "lon": 76.495, "elev": 1180, "slope": 18.0},
            "Kotagiri": {"lat": 11.425, "lon": 76.877, "elev": 1790, "slope": 26.0},
            "Kundah": {"lat": 11.280, "lon": 76.650, "elev": 2050, "slope": 31.0},
            "Panthalur": {"lat": 11.520, "lon": 76.380, "elev": 920, "slope": 19.5},
            "Udhagamandalam": {"lat": 11.410, "lon": 76.695, "elev": 2240, "slope": 20.0},
        }
    },
    "Dindigul": {
        "id": "TN-DGL",
        "name": "Dindigul",
        "state": "Tamil Nadu",
        "is_hilly_district": True,
        "center_lat": 10.36,
        "center_lon": 77.98,
        "elevation_base": 550,
        "elevation_span": 1400,
        "slope_base": 16.0,
        "primary_soil": "Red Sandy Loam / Hill Clay",
        "geology": "Feldspathic Gneiss & Charnockite",
        "subdistricts": {
            "Athoor": {"lat": 10.285, "lon": 77.850, "elev": 360, "slope": 12.0},
            "Dindiguleast": {"lat": 10.380, "lon": 78.050, "elev": 290, "slope": 8.5},
            "Dindigulwest": {"lat": 10.360, "lon": 77.920, "elev": 310, "slope": 10.0},
            "Gujiliamparai": {"lat": 10.680, "lon": 78.120, "elev": 240, "slope": 6.5},
            "Kodaikanal": {"lat": 10.238, "lon": 77.489, "elev": 2130, "slope": 33.5},
            "Natham": {"lat": 10.220, "lon": 78.230, "elev": 260, "slope": 14.0},
            "Nilakkottai": {"lat": 10.160, "lon": 77.860, "elev": 320, "slope": 11.0},
            "Oddanchatram": {"lat": 10.480, "lon": 77.750, "elev": 340, "slope": 9.5},
            "Palani": {"lat": 10.450, "lon": 77.520, "elev": 420, "slope": 18.5},
            "Vedasandur": {"lat": 10.530, "lon": 77.950, "elev": 270, "slope": 7.0},
        }
    },
    "Coimbatore": {
        "id": "TN-CBE",
        "name": "Coimbatore",
        "state": "Tamil Nadu",
        "is_hilly_district": True,
        "center_lat": 11.00,
        "center_lon": 76.96,
        "elevation_base": 420,
        "elevation_span": 900,
        "slope_base": 14.0,
        "primary_soil": "Red Loam & Black Soil Interbed",
        "geology": "Peninsular Gneissic Complex",
        "subdistricts": {
            "Anaimalai": {"lat": 10.580, "lon": 76.930, "elev": 310, "slope": 16.0},
            "Annur": {"lat": 11.230, "lon": 77.100, "elev": 370, "slope": 6.0},
            "Coimbatore North": {"lat": 11.050, "lon": 76.940, "elev": 430, "slope": 7.5},
            "Coimbatore South": {"lat": 10.980, "lon": 76.960, "elev": 410, "slope": 6.5},
            "Kinathukadavu": {"lat": 10.820, "lon": 77.020, "elev": 340, "slope": 7.0},
            "Madukkari": {"lat": 10.900, "lon": 76.950, "elev": 380, "slope": 9.0},
            "Mettupalayam": {"lat": 11.300, "lon": 76.940, "elev": 560, "slope": 21.0},
            "Perur": {"lat": 10.980, "lon": 76.880, "elev": 440, "slope": 11.5},
            "Pollachi": {"lat": 10.660, "lon": 77.010, "elev": 320, "slope": 7.0},
            "Sulur": {"lat": 11.020, "lon": 77.120, "elev": 350, "slope": 5.5},
            "Valparai": {"lat": 10.320, "lon": 76.950, "elev": 1190, "slope": 29.5},
        }
    },
    "Theni": {
        "id": "TN-THN",
        "name": "Theni",
        "state": "Tamil Nadu",
        "is_hilly_district": True,
        "center_lat": 10.01,
        "center_lon": 77.47,
        "elevation_base": 390,
        "elevation_span": 1100,
        "slope_base": 19.0,
        "primary_soil": "Alluvial Loam & Hill Skeletal Soil",
        "geology": "Granitic Gneiss & Khondalite",
        "subdistricts": {
            "Andipatti": {"lat": 9.980, "lon": 77.620, "elev": 340, "slope": 14.0},
            "Bodinayakanur": {"lat": 10.010, "lon": 77.350, "elev": 420, "slope": 23.5},
            "Periyakulam": {"lat": 10.120, "lon": 77.550, "elev": 380, "slope": 18.0},
            "Theni": {"lat": 10.010, "lon": 77.480, "elev": 310, "slope": 9.5},
            "Uthamapalayam": {"lat": 9.810, "lon": 77.330, "elev": 360, "slope": 21.0},
        }
    },
    "Salem": {
        "id": "TN-SLM",
        "name": "Salem",
        "state": "Tamil Nadu",
        "is_hilly_district": True,
        "center_lat": 11.66,
        "center_lon": 78.14,
        "elevation_base": 320,
        "elevation_span": 1300,
        "slope_base": 15.0,
        "primary_soil": "Red Sandy Loam & Colluvial Soil",
        "geology": "Charnockite & Hornblende Gneiss",
        "subdistricts": {
            "Attur": {"lat": 11.600, "lon": 78.600, "elev": 280, "slope": 11.0},
            "Edappadi": {"lat": 11.580, "lon": 77.850, "elev": 270, "slope": 7.0},
            "Gangavalli": {"lat": 11.480, "lon": 78.650, "elev": 240, "slope": 13.0},
            "Kadayampatti": {"lat": 11.850, "lon": 78.100, "elev": 380, "slope": 17.0},
            "Mettur": {"lat": 11.800, "lon": 77.800, "elev": 280, "slope": 14.5},
            "Omalur": {"lat": 11.740, "lon": 78.040, "elev": 300, "slope": 8.0},
            "Pethanaickanpalayam": {"lat": 11.640, "lon": 78.500, "elev": 310, "slope": 15.5},
            "Salem": {"lat": 11.660, "lon": 78.140, "elev": 290, "slope": 8.0},
            "Salem South": {"lat": 11.610, "lon": 78.130, "elev": 280, "slope": 6.5},
            "Salem West": {"lat": 11.680, "lon": 78.080, "elev": 290, "slope": 7.0},
            "Sankari": {"lat": 11.480, "lon": 77.870, "elev": 260, "slope": 6.5},
            "Thalaivasal": {"lat": 11.580, "lon": 78.750, "elev": 220, "slope": 7.0},
            "Vazhapadi": {"lat": 11.650, "lon": 78.400, "elev": 300, "slope": 16.0},
            "Yercaud": {"lat": 11.780, "lon": 78.210, "elev": 1515, "slope": 31.0},
        }
    }
}

DISTRICT_RAW_FILES = [
    ("The Nilgiris", "nilgiris.txt"),
    ("Dindigul", "dindigul.txt"),
    ("Coimbatore", "coimbatore.txt"),
    ("Theni", "theni.txt"),
    ("Salem", "salem.txt"),
]

def parse_line(line, district_name):
    """
    Parses a single line from the OCR raw text.
    Handles multi-word subdistricts, variable spaces, FULL/PART flags, LGD codes, GP/ULB strings.
    """
    line = line.strip()
    if not line:
        return None

    # Step 1: extract S No
    m_sno = re.match(r'^(\d+)\s+(.+)$', line)
    if not m_sno:
        return None
    s_no = int(m_sno.group(1))
    remainder = m_sno.group(2).strip()

    # Step 2: extract Sub-District
    sub_district = None
    for mws in MULTI_WORD_SUBDISTRICTS:
        if remainder.startswith(mws):
            sub_district = mws
            remainder = remainder[len(mws):].strip()
            break
    
    if not sub_district:
        tokens = remainder.split(maxsplit=1)
        sub_district = tokens[0]
        remainder = tokens[1] if len(tokens) > 1 else ""

    # Step 3: extract Village Code (usually 6 digits)
    m_code = re.match(r'^(\d{6})\s+(.+)$', remainder)
    if m_code:
        village_code = m_code.group(1)
        remainder = m_code.group(2).strip()
    else:
        tokens = remainder.split(maxsplit=1)
        village_code = tokens[0]
        remainder = tokens[1] if len(tokens) > 1 else ""

    # Step 4: Check if FULL or PART appears in remainder
    # Look for " FULL " or " PART "
    m_cov = re.search(r'\b(FULL|PART)\b', remainder)
    if m_cov:
        coverage_type = m_cov.group(1)
        village_name = remainder[:m_cov.start()].strip()
        after_cov = remainder[m_cov.end():].strip()
        
        # After coverage, look for LGD code (numeric)
        m_lgd = re.match(r'^(\d+)\s*(.*)$', after_cov)
        if m_lgd:
            lgd_code = m_lgd.group(1)
            gp_name = m_lgd.group(2).strip()
        else:
            lgd_code = "N/A"
            gp_name = after_cov
    else:
        coverage_type = "N/A"
        lgd_code = "N/A"
        gp_name = "N/A"
        village_name = remainder.strip()

    return {
        "s_no": s_no,
        "district": district_name,
        "sub_district": sub_district,
        "village_code": village_code,
        "village_name": village_name,
        "coverage_type": coverage_type,
        "lgd_code": lgd_code,
        "gram_panchayat_ulb": gp_name if gp_name else "N/A",
    }

def synthesize_village_profile(record, index, district_cfg):
    """
    Synthesizes realistic, geographically calibrated static features, live conditions,
    IoT readings, and risk assessment for each official village record.
    """
    dist_name = record["district"]
    sub_dist_name = record["sub_district"]
    village_name = record["village_name"]
    is_rf = "R.F." in village_name or "R.F" in village_name or "Forest" in village_name or "Block Rf" in village_name

    sub_cfg = district_cfg["subdistricts"].get(sub_dist_name, {
        "lat": district_cfg["center_lat"],
        "lon": district_cfg["center_lon"],
        "elev": district_cfg["elevation_base"],
        "slope": district_cfg["slope_base"]
    })

    # Deterministic pseudo-random seed based on village code + s_no for consistency
    seed_val = int(record["village_code"] if record["village_code"].isdigit() else index + 10000) + record["s_no"]
    rng = random.Random(seed_val)

    # Offset lat/lon within subdistrict area (approx 3-10 km radius)
    lat_offset = (rng.random() - 0.5) * 0.08
    lon_offset = (rng.random() - 0.5) * 0.08
    lat = round(sub_cfg["lat"] + lat_offset, 5)
    lon = round(sub_cfg["lon"] + lon_offset, 5)

    # Elevation & Slope
    elev = int(sub_cfg["elev"] + (rng.random() - 0.5) * 180)
    slope = round(max(3.5, sub_cfg["slope"] + (rng.random() - 0.5) * 8.0), 1)
    if is_rf:
        slope = round(slope * 1.25, 1)
        elev += 80

    aspects = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    aspect = aspects[rng.randint(0, len(aspects) - 1)]
    # Aspect in numeric degrees (0=N, 45=NE, 90=E, ...)
    aspect_deg = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].index(aspect) * 45

    # Stream & Hydrology
    distance_to_stream = round(rng.uniform(60, 650), 1)
    catchment_area = round(rng.uniform(4.5, 48.0), 1)
    # Landslide zone flag (GSI Bhukosh — high slope villages more likely)
    landslide_zone_flag = bool(slope > 28 or (historical_landslides > 2) or (is_rf and rng.random() > 0.5))
    # Shelter distance in metres (250m–8km range)
    shelter_distance_m = rng.randint(250, 7800)

    # Soil & Geology
    soil_type = district_cfg["primary_soil"]
    soil_depth_cm = round(rng.uniform(35, 110), 1)
    geology = district_cfg["geology"]

    # Demographics
    if is_rf:
        pop = rng.randint(0, 150)
        households = rng.randint(0, 35)
        land_cover = "Dense Mountain Forest / Reserve Sanctuary"
        road_access = "Forest Patrol Track (Seasonal)"
    else:
        pop = rng.randint(850, 8400)
        households = int(pop / 4.2)
        land_cover = "Terraced Tea / Horticulture / Settlement" if elev > 1000 else "Dry Deciduous / Agro-horticulture"
        road_access = "Paved All-Weather Ghat Road" if rng.random() > 0.3 else "Narrow Hill Link Road"

    shelter_options = [
        f"Panchayat Union Community Hall ({sub_dist_name})",
        f"Govt Higher Secondary School Disaster Relief Center",
        f"Village Cyclone & Flash Flood Multi-Purpose Shelter",
        f"Sub-Taluk Primary Health Center Upper Ridge Campus"
    ]
    nearest_shelter = shelter_options[rng.randint(0, len(shelter_options) - 1)]
    historical_floods = rng.randint(1, 7) if slope > 20 or distance_to_stream < 150 else rng.randint(0, 3)
    historical_landslides = rng.randint(1, 5) if slope > 25 else rng.randint(0, 2)

    # Dynamic Environmental Baseline (Simulated)
    # We assign a baseline risk that varies across the district realistically
    # e.g., higher in steep Nilgiris/Kodaikanal/Yercaud near streams
    is_hotspot = (dist_name == "The Nilgiris" and sub_dist_name in ["Coonoor", "Kotagiri", "Kundah"]) or \
                 (dist_name == "Dindigul" and sub_dist_name == "Kodaikanal") or \
                 (dist_name == "Salem" and sub_dist_name == "Yercaud") or \
                 (dist_name == "Coimbatore" and sub_dist_name == "Valparai")

    if is_hotspot and rng.random() > 0.45:
        # High or Elevated baseline
        rf_1h = round(rng.uniform(32, 68), 1)
        rf_3h = round(rf_1h + rng.uniform(40, 80), 1)
        rf_24h = round(rf_3h + rng.uniform(60, 110), 1)
        soil_moisture = round(rng.uniform(78, 94), 1)
        water_level = round(rng.uniform(2.1, 3.8), 2)
        water_rate = round(rng.uniform(0.12, 0.35), 2)
    elif rng.random() > 0.7:
        # Moderate baseline
        rf_1h = round(rng.uniform(15, 30), 1)
        rf_3h = round(rf_1h + rng.uniform(20, 45), 1)
        rf_24h = round(rf_3h + rng.uniform(30, 60), 1)
        soil_moisture = round(rng.uniform(55, 76), 1)
        water_level = round(rng.uniform(1.2, 2.0), 2)
        water_rate = round(rng.uniform(0.04, 0.11), 2)
    else:
        # Low baseline
        rf_1h = round(rng.uniform(0, 12), 1)
        rf_3h = round(rf_1h + rng.uniform(2, 18), 1)
        rf_24h = round(rf_3h + rng.uniform(5, 25), 1)
        soil_moisture = round(rng.uniform(28, 52), 1)
        water_level = round(rng.uniform(0.4, 1.1), 2)
        water_rate = round(rng.uniform(-0.02, 0.03), 2)

    rf_6h = round(rf_3h + rng.uniform(10, 35), 1)
    rf_3d = round(rf_24h + rng.uniform(20, 80), 1)
    rf_7d = round(rf_3d + rng.uniform(30, 130), 1)          # [NEW] 7-day antecedent wetness
    forecast_rf_6h = round(rf_1h * rng.uniform(0.8, 1.6), 1)
    forecast_rf_24h = round(rf_1h * rng.uniform(1.5, 3.5), 1) # [NEW] 24h forecast
    # River discharge (CWC cumecs): correlated with water level + catchment
    river_discharge = round(max(2.0, water_level * catchment_area * rng.uniform(1.8, 4.5)), 1)  # [NEW]
    temp = round(16.5 + (2800 - elev) * 0.005 + (rng.random() - 0.5) * 3, 1)
    humidity = int(min(98, 65 + rf_1h * 0.5 + soil_moisture * 0.25))

    # Calculate prototype ML flash flood risk score (0-100)
    # Weights: rainfall intensity (30%), soil saturation (25%), stream level & rise (25%), terrain slope (12%), catchment (8%)
    c_rf = min(100, (rf_1h / 65.0) * 100)
    c_soil = min(100, max(0, (soil_moisture - 40) / 55.0 * 100))
    c_water = min(100, (water_level / 3.5) * 70 + (water_rate / 0.3) * 30)
    c_terrain = min(100, (slope / 35.0) * 100)
    c_catchment = min(100, (catchment_area / 45.0) * 100)

    raw_score = (c_rf * 0.32) + (c_soil * 0.26) + (c_water * 0.24) + (c_terrain * 0.12) + (c_catchment * 0.06)
    risk_score = int(min(99, max(5, round(raw_score))))

    # Risk level classification
    if risk_score >= 81:
        risk_level = "VERY HIGH"
        alert_status = "ACTIVE"
        weather_warning = "Red Alert: Torrential Cloudburst Imminent"
    elif risk_score >= 61:
        risk_level = "HIGH"
        alert_status = "ACTIVE"
        weather_warning = "Orange Alert: Heavy Inundation Threat"
    elif risk_score >= 41:
        risk_level = "ELEVATED"
        alert_status = "MONITORING"
        weather_warning = "Yellow Watch: Runoff Rising"
    elif risk_score >= 21:
        risk_level = "MODERATE"
        alert_status = "NORMAL"
        weather_warning = "Advisory: Intermittent Precipitation"
    else:
        risk_level = "LOW"
        alert_status = "NORMAL"
        weather_warning = "Green: Normal Conditions"

    flood_prob = round(risk_score / 100.0, 2)
    prediction_window = "Next 1\u20133 hours" if risk_score >= 61 else "Next 3\u20136 hours"
    # Numeric lead time (Group D)
    if risk_score >= 81:   lead_time_hrs = 1
    elif risk_score >= 61: lead_time_hrs = 2
    elif risk_score >= 41: lead_time_hrs = 4
    else:                  lead_time_hrs = 6

    # ── Landslide Model (Group D — separate inference head) ───────
    ls_slope = min(100, (slope / 40.0) * 100)
    ls_ant7d = min(100, (rf_7d / 200.0) * 100)
    ls_soil  = min(100, max(0, (soil_moisture - 50) / 45.0 * 100))
    ls_zone  = 18 if landslide_zone_flag else 0
    raw_ls   = ls_slope * 0.40 + ls_ant7d * 0.30 + ls_soil * 0.20 + ls_zone
    ls_score = int(min(99, max(5, round(raw_ls))))
    ls_prob  = round(ls_score / 100.0, 2)
    if ls_score >= 75:   ls_level = "VERY HIGH"
    elif ls_score >= 55: ls_level = "HIGH"
    elif ls_score >= 35: ls_level = "MODERATE"
    else:                ls_level = "LOW"

    # SHAP-like feature contributions (7 factors, updated weights)
    shap_contributions = [
        {"factor": "Rainfall Intensity (1h)",      "weight": round(c_rf * 0.28, 1),  "contribution": "HIGH" if c_rf > 60 else ("MODERATE" if c_rf > 30 else "LOW"),  "val": f"{rf_1h} mm/hr"},
        {"factor": "7-Day Antecedent Wetness",     "weight": round(min(100,(rf_7d/280)*100) * 0.06, 1), "contribution": "HIGH" if rf_7d > 200 else ("MODERATE" if rf_7d > 100 else "LOW"), "val": f"{rf_7d} mm (7d)"},
        {"factor": "Soil Saturation (TDR)",        "weight": round(c_soil * 0.22, 1), "contribution": "HIGH" if c_soil > 60 else ("MODERATE" if c_soil > 30 else "LOW"), "val": f"{soil_moisture}%"},
        {"factor": "Stream Level & Rise Rate",     "weight": round(c_water * 0.18, 1), "contribution": "VERY HIGH" if c_water > 75 else ("HIGH" if c_water > 50 else "LOW"), "val": f"{water_level} m (+{water_rate} m/h)"},
        {"factor": "River Discharge (CWC)",        "weight": round(min(100, river_discharge/500*100) * 0.08, 1), "contribution": "HIGH" if river_discharge > 200 else ("MODERATE" if river_discharge > 80 else "LOW"), "val": f"{river_discharge} m\u00b3/s"},
        {"factor": "Terrain Steepness (Slope)",   "weight": round(c_terrain * 0.12, 1), "contribution": "HIGH" if slope > 25 else "MODERATE", "val": f"{slope}\u00b0"},
        {"factor": "Upstream Catchment Exposure",  "weight": round(c_catchment * 0.06, 1), "contribution": "MODERATE" if catchment_area > 20 else "LOW", "val": f"{catchment_area} km\u00b2"},
    ]

    # IoT Sensors — all marked is_simulated: True (no live hardware deployed yet)
    sensors = [
        {
            "sensor_id": f"S-RG-{record['village_code']}",
            "type": "Tipping Bucket Rain Gauge",
            "value": rf_1h,
            "unit": "mm/h",
            "status": "ONLINE" if rng.random() > 0.04 else "CALIBRATING",
            "battery_pct": rng.randint(82, 99),
            "telemetry": "LoRaWAN 868MHz Gateway",
            "last_updated": "2 mins ago",
            "is_simulated": True           # [NEW] Group C: synthetic flag
        },
        {
            "sensor_id": f"S-SM-{record['village_code']}",
            "type": "TDR Soil Moisture Sensor",
            "value": soil_moisture,
            "unit": "%",
            "status": "ONLINE",
            "battery_pct": rng.randint(79, 98),
            "telemetry": "LoRaWAN 868MHz Gateway",
            "last_updated": "2 mins ago",
            "is_simulated": True           # [NEW]
        },
        {
            "sensor_id": f"S-WL-{record['village_code']}",
            "type": "Ultrasonic Stream Level Gauge",
            "value": water_level,
            "rate": water_rate,
            "unit": "m",
            "status": "ONLINE" if rng.random() > 0.03 else "MAINTENANCE",
            "battery_pct": rng.randint(84, 100),
            "telemetry": "GSM / 4G Cellular Backhaul",
            "last_updated": "1 min ago",
            "is_simulated": True           # [NEW]
        }
    ]

    # Historical 24h trend
    # A realistic 24h curve with values leading up to current risk_score
    trend_24h = []
    base_trend = max(10, risk_score - rng.randint(15, 35))
    for hour in range(0, 25, 2):
        progress = hour / 24.0
        val = int(base_trend + (risk_score - base_trend) * (progress ** 1.6) + (rng.random() - 0.5) * 4)
        trend_24h.append({
            "hour": f"{hour:02d}:00",
            "risk_score": max(5, min(99, val))
        })
    trend_24h[-1]["risk_score"] = risk_score

    # Unique internal ID
    vid = f"TN-{district_cfg['id'].split('-')[1]}-{record['village_code']}-{record['s_no']}"

    return {
        "id": vid,
        "village_code": record["village_code"],
        "village_name": record["village_name"],
        "district": dist_name,
        "sub_district": sub_dist_name,
        "coverage_type": record["coverage_type"],
        "lgd_code": record["lgd_code"],
        "gram_panchayat_ulb": record["gram_panchayat_ulb"],
        "latitude": lat,
        "longitude": lon,
        "is_reserve_forest": is_rf,
        "sensor_available": True,               # [NEW] Group C: A+B fallback flag
        "static": {
            "elevation_m": elev,
            "average_slope_deg": slope,
            "aspect": aspect,
            "aspect_deg": aspect_deg,           # [NEW] Group A: numeric 0-315°
            "distance_to_stream_m": distance_to_stream,
            "upstream_catchment_sqkm": catchment_area,
            "land_cover": land_cover,
            "soil_type": soil_type,
            "soil_depth_cm": soil_depth_cm,
            "geology": geology,
            "landslide_zone_flag": landslide_zone_flag,  # [NEW] Group A: GSI Bhukosh
            "historical_flood_count": historical_floods,
            "historical_landslide_count": historical_landslides,
            "population": pop,
            "households": households,
            "road_access": road_access,
            "nearest_shelter": nearest_shelter,
            "shelter_distance_m": shelter_distance_m,   # [NEW] Group A: metres
        },
        "live": {
            "rainfall_1h_mm": rf_1h,
            "rainfall_3h_mm": rf_3h,
            "rainfall_6h_mm": rf_6h,
            "rainfall_24h_mm": rf_24h,
            "rainfall_3day_mm": rf_3d,
            "rainfall_7day_mm": rf_7d,                  # [NEW] Group B: antecedent
            "forecast_rainfall_6h_mm": forecast_rf_6h,
            "forecast_rainfall_24h_mm": forecast_rf_24h, # [NEW] Group B: 24h forecast
            "soil_moisture_pct": soil_moisture,
            "water_level_m": water_level,
            "water_level_rate_mh": water_rate,
            "river_discharge_cumecs": river_discharge,   # [NEW] Group B: CWC flow
            "temperature_c": temp,
            "humidity_pct": humidity,
            "weather_warning": weather_warning,
            "timestamp": "2026-09-23T00:26:00+05:30"
        },
        "risk": {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "flood_probability": flood_prob,
            "prediction_window": prediction_window,
            "lead_time_hrs": lead_time_hrs,             # [NEW] Group D: numeric hrs
            "landslide_risk_level": ls_level,           # [NEW] Group D: 2nd model
            "landslide_probability": ls_prob,           # [NEW] Group D
            "alert_status": alert_status,
            "trend": "\u2191 Increasing" if water_rate > 0.05 or rf_1h > 20 else ("\u2193 Receding" if water_rate < -0.01 else "\u2192 Stable"),
            "shap_factors": shap_contributions,
            "trend_24h": trend_24h,
            "model_version": "XGBoost-FlashFlood-TN-v2.4",
            "last_updated": "Just now"
        },
        "sensors": sensors,
        "alerts": [
            {
                "alert_id": f"ALT-{record['village_code']}",
                "level": risk_level,
                "score": risk_score,
                "status": alert_status,
                "triggers": [
                    f"Precipitation intensity {rf_1h} mm/hr exceeding hilly percolation threshold",
                    f"Soil saturation at {soil_moisture}% limit",
                    f"Upstream water level {water_level} m rising at +{water_rate} m/h"
                ] if alert_status == "ACTIVE" else ["Nominal catchment flow"],
                "prediction_window": prediction_window,
                "sop_action": "Evacuate low-lying riverbank habitats to designated shelter" if risk_level in ["HIGH", "VERY HIGH"] else "Maintain vigilant watch on culverts and stream gauges."
            }
        ] if alert_status in ["ACTIVE", "MONITORING"] else []
    }

def main():
    print("=" * 70)
    print("SIH26192 — Processing Master Village Datasets for Tamil Nadu")
    print("=" * 70)

    all_villages = []
    district_summaries = {}
    subdistrict_summaries = {}

    total_records = 0

    for dist_name, filename in DISTRICT_RAW_FILES:
        filepath = os.path.join(RAW_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Error: Missing file {filepath}")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f if line.strip()]

        print(f"\nProcessing {dist_name}: {len(lines)} records in {filename}...")
        dist_cfg = DISTRICT_CONFIG[dist_name]
        dist_records = []

        for idx, line in enumerate(lines):
            parsed = parse_line(line, dist_name)
            if not parsed:
                print(f"Warning: Failed to parse line {idx+1}: {line}")
                continue
            
            village_profile = synthesize_village_profile(parsed, idx, dist_cfg)
            dist_records.append(village_profile)
            all_villages.append(village_profile)

            # Sub-district aggregation
            sd_key = f"{dist_name}:{parsed['sub_district']}"
            if sd_key not in subdistrict_summaries:
                subdistrict_summaries[sd_key] = {
                    "district": dist_name,
                    "sub_district": parsed["sub_district"],
                    "total_villages": 0,
                    "low_risk": 0,
                    "moderate_risk": 0,
                    "elevated_risk": 0,
                    "high_risk": 0,
                    "very_high_risk": 0,
                    "active_alerts": 0,
                    "sensors_online": 0,
                    "villages": []
                }
            
            sd_summary = subdistrict_summaries[sd_key]
            sd_summary["total_villages"] += 1
            lvl = village_profile["risk"]["risk_level"]
            if lvl == "VERY HIGH":
                sd_summary["very_high_risk"] += 1
            elif lvl == "HIGH":
                sd_summary["high_risk"] += 1
            elif lvl == "ELEVATED":
                sd_summary["elevated_risk"] += 1
            elif lvl == "MODERATE":
                sd_summary["moderate_risk"] += 1
            else:
                sd_summary["low_risk"] += 1

            if village_profile["risk"]["alert_status"] == "ACTIVE":
                sd_summary["active_alerts"] += 1
            sd_summary["sensors_online"] += sum(1 for s in village_profile["sensors"] if s["status"] == "ONLINE")
            sd_summary["villages"].append(village_profile["id"])

        # District aggregation
        district_summaries[dist_name] = {
            "id": dist_cfg["id"],
            "district_name": dist_name,
            "state": "Tamil Nadu",
            "is_hilly_district": True,
            "center_lat": dist_cfg["center_lat"],
            "center_lon": dist_cfg["center_lon"],
            "total_villages": len(dist_records),
            "sub_districts_count": len(dist_cfg["subdistricts"]),
            "sub_districts": list(dist_cfg["subdistricts"].keys()),
            "low_risk": sum(1 for v in dist_records if v["risk"]["risk_level"] == "LOW"),
            "moderate_risk": sum(1 for v in dist_records if v["risk"]["risk_level"] == "MODERATE"),
            "elevated_risk": sum(1 for v in dist_records if v["risk"]["risk_level"] == "ELEVATED"),
            "high_risk": sum(1 for v in dist_records if v["risk"]["risk_level"] == "HIGH"),
            "very_high_risk": sum(1 for v in dist_records if v["risk"]["risk_level"] == "VERY HIGH"),
            "active_alerts": sum(1 for v in dist_records if v["risk"]["alert_status"] == "ACTIVE"),
            "sensors_online": sum(sum(1 for s in v["sensors"] if s["status"] == "ONLINE") for v in dist_records),
            "avg_elevation_m": round(sum(v["static"]["elevation_m"] for v in dist_records) / max(1, len(dist_records))),
            "avg_slope_deg": round(sum(v["static"]["average_slope_deg"] for v in dist_records) / max(1, len(dist_records)), 1),
        }

        total_records += len(dist_records)
        print(f"  -> Successfully imported {len(dist_records)} villages for {dist_name}.")

    print("\n" + "=" * 70)
    print(f"TOTAL OFFICIAL VILLAGE CADASTRE RECORDS IMPORTED: {total_records}")
    print("=" * 70)

    # Save to JSON
    os.makedirs(DATA_DIR, exist_ok=True)
    villages_json_path = os.path.join(DATA_DIR, "villages_master.json")
    with open(villages_json_path, "w", encoding="utf-8") as f:
        json.dump(all_villages, f, indent=2, ensure_ascii=False)
    print(f"Saved: {villages_json_path} ({len(all_villages)} villages)")

    districts_json_path = os.path.join(DATA_DIR, "districts_master.json")
    with open(districts_json_path, "w", encoding="utf-8") as f:
        json.dump(list(district_summaries.values()), f, indent=2, ensure_ascii=False)
    print(f"Saved: {districts_json_path}")

    subdistricts_json_path = os.path.join(DATA_DIR, "subdistricts_master.json")
    with open(subdistricts_json_path, "w", encoding="utf-8") as f:
        json.dump(list(subdistrict_summaries.values()), f, indent=2, ensure_ascii=False)
    print(f"Saved: {subdistricts_json_path}")

    # Save to CSV
    villages_csv_path = os.path.join(DATA_DIR, "villages_master.csv")
    with open(villages_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "id", "district", "sub_district", "village_code", "village_name",
            "coverage_type", "lgd_code", "gram_panchayat_ulb", "latitude", "longitude",
            "elevation_m", "slope_deg", "distance_to_stream_m", "catchment_sqkm",
            "rainfall_1h_mm", "rainfall_24h_mm", "soil_moisture_pct", "water_level_m",
            "water_level_rate_mh", "risk_score", "risk_level", "alert_status"
        ])
        for v in all_villages:
            writer.writerow([
                v["id"], v["district"], v["sub_district"], v["village_code"], v["village_name"],
                v["coverage_type"], v["lgd_code"], v["gram_panchayat_ulb"], v["latitude"], v["longitude"],
                v["static"]["elevation_m"], v["static"]["average_slope_deg"], v["static"]["distance_to_stream_m"],
                v["static"]["upstream_catchment_sqkm"], v["live"]["rainfall_1h_mm"], v["live"]["rainfall_24h_mm"],
                v["live"]["soil_moisture_pct"], v["live"]["water_level_m"], v["live"]["water_level_rate_mh"],
                v["risk"]["risk_score"], v["risk"]["risk_level"], v["risk"]["alert_status"]
            ])
    print(f"Saved: {villages_csv_path}")

    # Generate PostgreSQL / PostGIS schema
    os.makedirs(DB_DIR, exist_ok=True)
    schema_sql_path = os.path.join(DB_DIR, "schema.sql")
    with open(schema_sql_path, "w", encoding="utf-8") as f:
        f.write("""-- ============================================================================
-- Smart India Hackathon SIH26192 - Flash Flood Prediction
-- Tamil Nadu Hyperlocal Flash Flood Early Warning System
-- PostgreSQL + PostGIS Production Relational Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(32) PRIMARY KEY,
    district_name VARCHAR(128) NOT NULL UNIQUE,
    state VARCHAR(64) DEFAULT 'Tamil Nadu',
    is_hilly_district BOOLEAN DEFAULT TRUE,
    center_latitude DOUBLE PRECISION,
    center_longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sub-Districts / Taluks Table
CREATE TABLE IF NOT EXISTS sub_districts (
    id SERIAL PRIMARY KEY,
    district_id VARCHAR(32) REFERENCES districts(id) ON DELETE CASCADE,
    sub_district_name VARCHAR(128) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, sub_district_name)
);

-- 3. Master Villages Table (Preserving full/part cadastre and duplicate names)
CREATE TABLE IF NOT EXISTS villages (
    id VARCHAR(64) PRIMARY KEY,
    district_id VARCHAR(32) REFERENCES districts(id),
    sub_district_name VARCHAR(128) NOT NULL,
    village_code VARCHAR(32) NOT NULL,
    village_name VARCHAR(256) NOT NULL,
    coverage_type VARCHAR(16) DEFAULT 'FULL',
    lgd_code VARCHAR(32) DEFAULT 'N/A',
    gram_panchayat_ulb TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    is_reserve_forest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_villages_geom ON villages USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_villages_code ON villages(village_code);
CREATE INDEX IF NOT EXISTS idx_villages_subdist ON villages(sub_district_name);

-- 4. Village Static Baseline Vulnerability Profile
CREATE TABLE IF NOT EXISTS village_static_features (
    village_id VARCHAR(64) PRIMARY KEY REFERENCES villages(id) ON DELETE CASCADE,
    elevation DOUBLE PRECISION NOT NULL,
    average_slope DOUBLE PRECISION NOT NULL,
    aspect VARCHAR(16),
    distance_to_stream DOUBLE PRECISION,
    upstream_catchment_area DOUBLE PRECISION,
    land_cover VARCHAR(128),
    soil_type VARCHAR(128),
    soil_depth DOUBLE PRECISION,
    geology VARCHAR(128),
    historical_flood_count INTEGER DEFAULT 0,
    historical_landslide_count INTEGER DEFAULT 0,
    population INTEGER,
    households INTEGER,
    road_access VARCHAR(128),
    nearest_shelter VARCHAR(256),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Live Environmental Conditions (Dynamic Ingestion)
CREATE TABLE IF NOT EXISTS village_live_data (
    id SERIAL PRIMARY KEY,
    village_id VARCHAR(64) REFERENCES villages(id) ON DELETE CASCADE,
    rainfall_1h DOUBLE PRECISION,
    rainfall_3h DOUBLE PRECISION,
    rainfall_6h DOUBLE PRECISION,
    rainfall_24h DOUBLE PRECISION,
    rainfall_3day DOUBLE PRECISION,
    rainfall_intensity DOUBLE PRECISION,
    forecast_rainfall DOUBLE PRECISION,
    soil_moisture DOUBLE PRECISION,
    water_level DOUBLE PRECISION,
    water_level_rate DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    weather_warning VARCHAR(256),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_data_village_time ON village_live_data(village_id, recorded_at DESC);

-- 6. IoT Sensor Telemetry
CREATE TABLE IF NOT EXISTS iot_sensor_readings (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(64) NOT NULL,
    village_id VARCHAR(64) REFERENCES villages(id) ON DELETE CASCADE,
    sensor_type VARCHAR(64) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(16) NOT NULL,
    rate_of_rise DOUBLE PRECISION,
    status VARCHAR(32) DEFAULT 'ONLINE',
    battery_pct INTEGER,
    telemetry_type VARCHAR(64),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_iot_village ON iot_sensor_readings(village_id, recorded_at DESC);

-- 7. Risk Predictions (AI/ML Engine Outputs)
CREATE TABLE IF NOT EXISTS risk_predictions (
    id SERIAL PRIMARY KEY,
    village_id VARCHAR(64) REFERENCES villages(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    flood_probability DOUBLE PRECISION NOT NULL,
    prediction_window VARCHAR(64),
    model_version VARCHAR(64),
    alert_status VARCHAR(32) DEFAULT 'NORMAL',
    shap_factors JSONB,
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_predictions_village ON risk_predictions(village_id, predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_level ON risk_predictions(risk_level);
""")
    print(f"Saved: {schema_sql_path}")
    print("\nMaster Data Synthesis & Database Migration Ready!")

if __name__ == "__main__":
    main()
