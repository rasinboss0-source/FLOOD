import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from app.database.db import get_db
from app.services.weather_service import fetch_live_weather
from app.services.soil_service import calculate_soil_saturation
from app.services.river_service import assess_river_stage
from app.services.data_cleaner import clean_environmental_data
from app.services.alert_engine import generate_alert_bulletin
from app.ml.feature_engine import extract_features
from app.ml.model import predict_flood_risk

router = APIRouter(prefix="/api/villages", tags=["Prediction"])

@router.get("/{village_id}/predict")
def get_flood_prediction(village_id: str, refresh_live: bool = Query(False, description="Force re-fetch from live weather API")):
    """
    Primary Prediction Endpoint:
    Answers: 'What is the probability that this village will experience a flash flood in the next 1–3 hours?'
    Combines Static GIS + Live Environmental Data + IoT Sensors -> Feature Engine -> ML Model -> Alert Engine.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Fetch Village and Static GIS
        cursor.execute("""
            SELECT v.*, s.*
            FROM villages v
            JOIN static_gis s ON v.village_id = s.village_id
            WHERE v.village_id = ?
        """, (village_id,))
        village_row = cursor.fetchone()
        if not village_row:
            raise HTTPException(status_code=404, detail="Village not found")

        # 2. Fetch Latest Live Readings (or fetch new from Open-Meteo if requested or missing)
        cursor.execute("""
            SELECT * FROM live_readings WHERE village_id = ?
        """, (village_id,))
        live_row = cursor.fetchone()
        
        if not live_row or refresh_live:
            fresh = fetch_live_weather(village_row["latitude"], village_row["longitude"])
            cursor.execute("""
                INSERT OR REPLACE INTO live_readings (
                    village_id, timestamp, rainfall_1h, rainfall_3h, rainfall_6h, rainfall_24h, rainfall_72h,
                    forecast_1h, forecast_3h, forecast_6h, soil_moisture_pct, river_water_level_m, river_rise_rate_m_per_hr, source
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                village_id, fresh["timestamp"], fresh["rainfall_1h"], fresh["rainfall_3h"], fresh["rainfall_6h"],
                fresh["rainfall_24h"], fresh["rainfall_72h"], fresh["forecast_1h"], fresh["forecast_3h"],
                fresh["forecast_6h"], fresh["soil_moisture_pct"],
                live_row["river_water_level_m"] if live_row else 1.8,
                live_row["river_rise_rate_m_per_hr"] if live_row else 0.05,
                fresh["source"]
            ))
            conn.commit()
            cursor.execute("SELECT * FROM live_readings WHERE village_id = ?", (village_id,))
            live_row = cursor.fetchone()

        # 3. Fetch Latest IoT Telemetry (Edge station)
        cursor.execute("""
            SELECT * FROM iot_telemetry WHERE village_id = ? ORDER BY id DESC LIMIT 1
        """, (village_id,))
        iot_row = cursor.fetchone()

        # 4. Prepare data dictionaries
        static_dict = dict(village_row)
        live_dict = dict(live_row)
        iot_dict = dict(iot_row) if iot_row else {}

        # 5. Clean and validate incoming readings
        cleaned_live = clean_environmental_data(live_dict)

        # 6. Extract Feature Vector
        features = extract_features(static_dict, cleaned_live, iot_dict)

        # 7. ML Model Inference
        prediction = predict_flood_risk(features["feature_dict"], features["feature_array"])

        # 8. Alert Engine: Bulletin & Instructions
        shelters = json.loads(village_row["evacuation_shelters_json"] or "[]")
        bulletin = generate_alert_bulletin(
            village_name=village_row["name"],
            state=village_row["state"],
            district=village_row["district"],
            risk_level=prediction["risk_level"],
            probability=prediction["probability"],
            factors=prediction["contributing_factors"],
            shelters=shelters
        )

        # 9. Soil and River Stage Details
        soil_analysis = calculate_soil_saturation(
            soil_type=village_row["soil_type"],
            soil_clay_pct=village_row["soil_clay_pct"],
            rainfall_24h=cleaned_live["rainfall_24h"],
            rainfall_72h=cleaned_live["rainfall_72h"],
            current_moisture_pct=cleaned_live["soil_moisture_pct"]
        )

        river_analysis = assess_river_stage(
            water_level_m=cleaned_live["river_water_level_m"],
            rise_rate_m_per_hr=cleaned_live["river_rise_rate_m_per_hr"],
            distance_to_stream_m=village_row["distance_to_stream_m"]
        )

        # 10. Record prediction log
        cursor.execute("""
            INSERT INTO predictions (village_id, timestamp, probability, risk_level, contributing_factors_json)
            VALUES (?, datetime('now'), ?, ?, ?)
        """, (village_id, prediction["probability"], prediction["risk_level"], json.dumps(prediction["contributing_factors"])))
        conn.commit()

        return {
            "village_id": village_id,
            "village_name": village_row["name"],
            "state": village_row["state"],
            "district": village_row["district"],
            "window": "Next 1–3 Hours",
            "prediction": prediction,
            "bulletin": bulletin,
            "live_metrics": {
                "rainfall_1h": cleaned_live["rainfall_1h"],
                "rainfall_3h": cleaned_live["rainfall_3h"],
                "rainfall_24h": cleaned_live["rainfall_24h"],
                "rainfall_72h": cleaned_live["rainfall_72h"],
                "forecast_1h": cleaned_live["forecast_1h"],
                "forecast_3h": cleaned_live["forecast_3h"],
                "soil_moisture_pct": cleaned_live["soil_moisture_pct"],
                "river_water_level_m": cleaned_live["river_water_level_m"],
                "river_rise_rate_m_per_hr": cleaned_live["river_rise_rate_m_per_hr"],
                "data_source": cleaned_live.get("source", "Live Ingestion"),
                "updated_at": cleaned_live["timestamp"]
            },
            "hydrology": {
                "soil_analysis": soil_analysis,
                "river_analysis": river_analysis,
                "runoff_index": features["feature_dict"]["rational_runoff_index"]
            },
            "iot_status": {
                "station_id": iot_dict.get("station_id", f"ESP32-{village_id}"),
                "status": iot_dict.get("status", "ONLINE"),
                "battery_voltage": iot_dict.get("battery_voltage", 3.95),
                "signal_rssi": iot_dict.get("signal_rssi", -70),
                "simulated": True,
                "note": "IoT data is simulated for the prototype; the architecture supports real ESP32/LoRa/GSM sensors."
            }
        }
