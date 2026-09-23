import json
from app.database.db import get_db, init_db

VILLAGES_SEED = [
    {
        "village_id": "TN-NIL-01",
        "name": "Coonoor Valley",
        "state": "Tamil Nadu",
        "district": "The Nilgiris",
        "taluk": "Coonoor",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "population": 4200,
        "static": {
            "elevation_m": 1850.0,
            "slope_deg": 14.5,
            "aspect": "SE",
            "nearest_stream_name": "Coonoor River Tributary",
            "distance_to_stream_m": 280.0,
            "catchment_area_sqkm": 32.4,
            "soil_type": "Laterite Clay Loam",
            "soil_depth_cm": 65.0,
            "soil_clay_pct": 48.0,
            "soil_sand_pct": 22.0,
            "land_cover_agri_pct": 45.0,
            "land_cover_forest_pct": 42.0,
            "land_cover_urban_pct": 10.0,
            "land_cover_water_pct": 3.0,
            "historical_flood_count": 5,
            "historical_records": [
                {"year": 2019, "event": "Nilgiris Torrential Cloudburst", "rainfall_24h_mm": 290, "impact": "Flash flood and road breach"},
                {"year": 2021, "event": "NE Monsoon Flash Flood", "rainfall_24h_mm": 210, "impact": "Stream bank overflow"},
                {"year": 2023, "event": "High-intensity storm", "rainfall_24h_mm": 185, "impact": "Tea estate runoff accumulation"}
            ],
            "evacuation_shelters": [
                {"name": "St. Joseph Higher Secondary School", "type": "School", "distance_km": 0.8, "elevation_m": 1890, "capacity": 450, "contact": "+91 94431 20011"},
                {"name": "Township Community Hall Upper Ridge", "type": "Community Hall", "distance_km": 1.4, "elevation_m": 1910, "capacity": 300, "contact": "+91 94431 20012"}
            ],
            "upstream_polygon": [
                [11.370, 76.780],
                [11.385, 76.810],
                [11.360, 76.825],
                [11.345, 76.805],
                [11.353, 76.7959]
            ]
        }
    },
    {
        "village_id": "TN-CUD-02",
        "name": "Bhuvanagiri",
        "state": "Tamil Nadu",
        "district": "Cuddalore",
        "taluk": "Chidambaram",
        "latitude": 11.4553,
        "longitude": 79.6425,
        "population": 8500,
        "static": {
            "elevation_m": 12.0,
            "slope_deg": 1.8,
            "aspect": "E",
            "nearest_stream_name": "Vellar River",
            "distance_to_stream_m": 150.0,
            "catchment_area_sqkm": 75.0,
            "soil_type": "Alluvial Clay",
            "soil_depth_cm": 120.0,
            "soil_clay_pct": 58.0,
            "soil_sand_pct": 15.0,
            "land_cover_agri_pct": 68.0,
            "land_cover_forest_pct": 8.0,
            "land_cover_urban_pct": 18.0,
            "land_cover_water_pct": 6.0,
            "historical_flood_count": 6,
            "historical_records": [
                {"year": 2015, "event": "Cyclone Micro-burst Inundation", "rainfall_24h_mm": 380, "impact": "Submergence of riverbanks"},
                {"year": 2020, "event": "Cyclone Nivar Surge", "rainfall_24h_mm": 240, "impact": "Vellar discharge breach"},
                {"year": 2023, "event": "Michaung depression rainfall", "rainfall_24h_mm": 190, "impact": "Agricultural lowland pooling"}
            ],
            "evacuation_shelters": [
                {"name": "Government Multipurpose Cyclone Shelter", "type": "Cyclone Shelter", "distance_km": 0.5, "elevation_m": 18, "capacity": 800, "contact": "+91 94432 30021"},
                {"name": "Bhuvanagiri Taluk High School", "type": "School", "distance_km": 1.1, "elevation_m": 16, "capacity": 500, "contact": "+91 94432 30022"}
            ],
            "upstream_polygon": [
                [11.470, 79.620],
                [11.485, 79.650],
                [11.460, 79.670],
                [11.440, 79.650],
                [11.4553, 79.6425]
            ]
        }
    },
    {
        "village_id": "TN-KKI-04",
        "name": "Pechiparai Foothills",
        "state": "Tamil Nadu",
        "district": "Kanniyakumari",
        "taluk": "Vilavancode",
        "latitude": 8.3512,
        "longitude": 77.2910,
        "population": 2900,
        "static": {
            "elevation_m": 95.0,
            "slope_deg": 8.2,
            "aspect": "SW",
            "nearest_stream_name": "Kodayar River Outflow",
            "distance_to_stream_m": 320.0,
            "catchment_area_sqkm": 48.0,
            "soil_type": "Sandy Clay Loam",
            "soil_depth_cm": 75.0,
            "soil_clay_pct": 38.0,
            "soil_sand_pct": 40.0,
            "land_cover_agri_pct": 52.0,
            "land_cover_forest_pct": 36.0,
            "land_cover_urban_pct": 8.0,
            "land_cover_water_pct": 4.0,
            "historical_flood_count": 4,
            "historical_records": [
                {"year": 2017, "event": "Cyclone Ockhi Flash Flooding", "rainfall_24h_mm": 310, "impact": "Rapid overflow of dam spillway"},
                {"year": 2021, "event": "Western Ghat Heavy Downpour", "rainfall_24h_mm": 220, "impact": "Kodayar stream flash surge"}
            ],
            "evacuation_shelters": [
                {"name": "Pechiparai Forest Welfare School", "type": "School", "distance_km": 1.2, "elevation_m": 120, "capacity": 350, "contact": "+91 94433 40031"}
            ],
            "upstream_polygon": [
                [8.375, 77.270],
                [8.390, 77.305],
                [8.365, 77.315],
                [8.340, 77.300],
                [8.3512, 77.2910]
            ]
        }
    },
    {
        "village_id": "KL-WAY-01",
        "name": "Chooralmala",
        "state": "Kerala",
        "district": "Wayanad",
        "taluk": "Vythiri",
        "latitude": 11.5342,
        "longitude": 76.1785,
        "population": 3600,
        "static": {
            "elevation_m": 880.0,
            "slope_deg": 19.8,
            "aspect": "W",
            "nearest_stream_name": "Iruvanjippuzha Tributary",
            "distance_to_stream_m": 120.0,
            "catchment_area_sqkm": 28.5,
            "soil_type": "Gravelly Sandy Clay",
            "soil_depth_cm": 50.0,
            "soil_clay_pct": 42.0,
            "soil_sand_pct": 35.0,
            "land_cover_agri_pct": 38.0,
            "land_cover_forest_pct": 52.0,
            "land_cover_urban_pct": 8.0,
            "land_cover_water_pct": 2.0,
            "historical_flood_count": 5,
            "historical_records": [
                {"year": 2024, "event": "Wayanad Cloudburst Catastrophe", "rainfall_24h_mm": 372, "impact": "Devastating debris flow and flash flood"},
                {"year": 2019, "event": "Puthumala Flash Flood", "rainfall_24h_mm": 280, "impact": "River channel avulsion"}
            ],
            "evacuation_shelters": [
                {"name": "Meppadi St. Joseph Relief Center", "type": "Community Hall", "distance_km": 2.5, "elevation_m": 940, "capacity": 600, "contact": "+91 94470 10041"},
                {"name": "Vythiri Higher Secondary School", "type": "School", "distance_km": 3.8, "elevation_m": 965, "capacity": 500, "contact": "+91 94470 10042"}
            ],
            "upstream_polygon": [
                [11.555, 76.160],
                [11.565, 76.195],
                [11.540, 76.210],
                [11.520, 76.185],
                [11.5342, 76.1785]
            ]
        }
    },
    {
        "village_id": "UK-CHA-01",
        "name": "Raini Village",
        "state": "Uttarakhand",
        "district": "Chamoli",
        "taluk": "Joshimath",
        "latitude": 30.4851,
        "longitude": 79.6975,
        "population": 1200,
        "static": {
            "elevation_m": 2150.0,
            "slope_deg": 28.5,
            "aspect": "N",
            "nearest_stream_name": "Rishi Ganga / Dhauliganga",
            "distance_to_stream_m": 180.0,
            "catchment_area_sqkm": 54.0,
            "soil_type": "Morainic Stony Loam",
            "soil_depth_cm": 35.0,
            "soil_clay_pct": 20.0,
            "soil_sand_pct": 55.0,
            "land_cover_agri_pct": 15.0,
            "land_cover_forest_pct": 60.0,
            "land_cover_urban_pct": 5.0,
            "land_cover_water_pct": 20.0,
            "historical_flood_count": 6,
            "historical_records": [
                {"year": 2021, "event": "Chamoli Disaster Flash Surge", "rainfall_24h_mm": 110, "impact": "Dam wall breach, bridge destruction"},
                {"year": 2013, "event": "Kedarnath/Alaknanda Cloudburst", "rainfall_24h_mm": 320, "impact": "Historic gorge submergence"}
            ],
            "evacuation_shelters": [
                {"name": "Joshimath High Ridge ITBP Camp Hall", "type": "Military/Disaster Camp", "distance_km": 4.1, "elevation_m": 2350, "capacity": 400, "contact": "+91 94120 50051"}
            ],
            "upstream_polygon": [
                [30.510, 79.680],
                [30.525, 79.720],
                [30.495, 79.735],
                [30.470, 79.705],
                [30.4851, 79.6975]
            ]
        }
    },
    {
        "village_id": "AS-MAJ-01",
        "name": "Garamur",
        "state": "Assam",
        "district": "Majuli",
        "taluk": "Majuli Sub-division",
        "latitude": 26.9667,
        "longitude": 94.2167,
        "population": 5100,
        "static": {
            "elevation_m": 84.0,
            "slope_deg": 0.8,
            "aspect": "SW",
            "nearest_stream_name": "Kherkatia Suti / Brahmaputra",
            "distance_to_stream_m": 210.0,
            "catchment_area_sqkm": 120.0,
            "soil_type": "Silty Floodplain Clay",
            "soil_depth_cm": 150.0,
            "soil_clay_pct": 62.0,
            "soil_sand_pct": 12.0,
            "land_cover_agri_pct": 60.0,
            "land_cover_forest_pct": 15.0,
            "land_cover_urban_pct": 10.0,
            "land_cover_water_pct": 15.0,
            "historical_flood_count": 8,
            "historical_records": [
                {"year": 2022, "event": "Assam State Wave Flooding", "rainfall_24h_mm": 250, "impact": "Embankment breach and village inundation"},
                {"year": 2020, "event": "Monsoon Brahmaputra Peak", "rainfall_24h_mm": 215, "impact": "Complete waterlogging for 7 days"}
            ],
            "evacuation_shelters": [
                {"name": "Garamur Elevated Flood Shelter Platform", "type": "High Ground Platform", "distance_km": 0.6, "elevation_m": 92, "capacity": 900, "contact": "+91 94350 60061"},
                {"name": "Majuli College Auditorium", "type": "College", "distance_km": 1.5, "elevation_m": 89, "capacity": 600, "contact": "+91 94350 60062"}
            ],
            "upstream_polygon": [
                [26.985, 94.195],
                [27.000, 94.235],
                [26.975, 94.250],
                [26.950, 94.225],
                [26.9667, 94.2167]
            ]
        }
    },
    {
        "village_id": "MH-RAT-01",
        "name": "Chiplun Riverside",
        "state": "Maharashtra",
        "district": "Ratnagiri",
        "taluk": "Chiplun",
        "latitude": 17.5323,
        "longitude": 73.5186,
        "population": 9400,
        "static": {
            "elevation_m": 18.0,
            "slope_deg": 6.5,
            "aspect": "W",
            "nearest_stream_name": "Vashishti River",
            "distance_to_stream_m": 90.0,
            "catchment_area_sqkm": 62.0,
            "soil_type": "Clayey Alluvium",
            "soil_depth_cm": 90.0,
            "soil_clay_pct": 52.0,
            "soil_sand_pct": 20.0,
            "land_cover_agri_pct": 40.0,
            "land_cover_forest_pct": 35.0,
            "land_cover_urban_pct": 20.0,
            "land_cover_water_pct": 5.0,
            "historical_flood_count": 5,
            "historical_records": [
                {"year": 2021, "event": "Konkan Extreme Flash Flood", "rainfall_24h_mm": 415, "impact": "Vashishti river reached 2-storey height"},
                {"year": 2019, "event": "Tivare Dam Burst & Chiplun Inundation", "rainfall_24h_mm": 310, "impact": "Catastrophic river surge"}
            ],
            "evacuation_shelters": [
                {"name": "Chiplun Nagar Parishad High Ground Shelter", "type": "Community Hall", "distance_km": 0.9, "elevation_m": 42, "capacity": 1000, "contact": "+91 94220 70071"},
                {"name": "DBJ College Hilltop Campus", "type": "College", "distance_km": 1.7, "elevation_m": 55, "capacity": 750, "contact": "+91 94220 70072"}
            ],
            "upstream_polygon": [
                [17.555, 73.495],
                [17.570, 73.535],
                [17.545, 73.550],
                [17.520, 73.525],
                [17.5323, 73.5186]
            ]
        }
    },
    {
        "village_id": "HP-KUL-01",
        "name": "Palchan",
        "state": "Himachal Pradesh",
        "district": "Kullu",
        "taluk": "Manali",
        "latitude": 32.3167,
        "longitude": 77.1667,
        "population": 1850,
        "static": {
            "elevation_m": 2280.0,
            "slope_deg": 24.0,
            "aspect": "S",
            "nearest_stream_name": "Beas River / Solang Nullah Confluence",
            "distance_to_stream_m": 110.0,
            "catchment_area_sqkm": 38.0,
            "soil_type": "Mountain Lithosol & Silt",
            "soil_depth_cm": 45.0,
            "soil_clay_pct": 25.0,
            "soil_sand_pct": 50.0,
            "land_cover_agri_pct": 20.0,
            "land_cover_forest_pct": 58.0,
            "land_cover_urban_pct": 7.0,
            "land_cover_water_pct": 15.0,
            "historical_flood_count": 6,
            "historical_records": [
                {"year": 2023, "event": "Beas Basin Cloudburst Disaster", "rainfall_24h_mm": 260, "impact": "Flash flood swept bridges and highway"},
                {"year": 2018, "event": "Solang Nullah Flash Flood", "rainfall_24h_mm": 195, "impact": "Torrential debris accumulation"}
            ],
            "evacuation_shelters": [
                {"name": "Palchan Senior Secondary School Upper Terrace", "type": "School", "distance_km": 0.7, "elevation_m": 2340, "capacity": 300, "contact": "+91 94180 80081"}
            ],
            "upstream_polygon": [
                [32.335, 77.145],
                [32.350, 77.185],
                [32.325, 77.200],
                [32.300, 77.175],
                [32.3167, 77.1667]
            ]
        }
    }
]

def seed_database():
    """Seeds villages and static GIS data."""
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        
        for item in VILLAGES_SEED:
            v_id = item["village_id"]
            cursor.execute("""
                INSERT OR REPLACE INTO villages (village_id, name, state, district, taluk, latitude, longitude, population)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                v_id, item["name"], item["state"], item["district"], item["taluk"],
                item["latitude"], item["longitude"], item["population"]
            ))
            
            s = item["static"]
            cursor.execute("""
                INSERT OR REPLACE INTO static_gis (
                    village_id, elevation_m, slope_deg, aspect, nearest_stream_name,
                    distance_to_stream_m, catchment_area_sqkm, soil_type, soil_depth_cm,
                    soil_clay_pct, soil_sand_pct, land_cover_agri_pct, land_cover_forest_pct,
                    land_cover_urban_pct, land_cover_water_pct, historical_flood_count,
                    historical_records_json, evacuation_shelters_json, upstream_polygon_json
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                v_id, s["elevation_m"], s["slope_deg"], s["aspect"], s["nearest_stream_name"],
                s["distance_to_stream_m"], s["catchment_area_sqkm"], s["soil_type"], s["soil_depth_cm"],
                s["soil_clay_pct"], s["soil_sand_pct"], s["land_cover_agri_pct"], s["land_cover_forest_pct"],
                s["land_cover_urban_pct"], s["land_cover_water_pct"], s["historical_flood_count"],
                json.dumps(s["historical_records"]), json.dumps(s["evacuation_shelters"]), json.dumps(s["upstream_polygon"])
            ))
            
            # Initial baseline reading
            cursor.execute("""
                INSERT OR REPLACE INTO live_readings (
                    village_id, timestamp, rainfall_1h, rainfall_3h, rainfall_6h, rainfall_24h, rainfall_72h,
                    forecast_1h, forecast_3h, forecast_6h, soil_moisture_pct, river_water_level_m, river_rise_rate_m_per_hr, source
                )
                VALUES (?, datetime('now'), 12.0, 28.0, 45.0, 68.0, 92.0, 10.0, 22.0, 35.0, 48.0, 1.8, 0.05, 'initial_seed')
            """, (v_id,))
            
            # Initial IoT sensor record
            cursor.execute("""
                INSERT OR REPLACE INTO iot_telemetry (
                    village_id, station_id, timestamp, local_rainfall_1h, local_water_level_m, local_soil_moisture_pct, battery_voltage, signal_rssi, status
                )
                VALUES (?, ?, datetime('now'), 12.5, 1.85, 49.0, 3.98, -68, 'ONLINE')
            """, (v_id, f"ESP32-{v_id}"))
            
        conn.commit()

if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully!")
