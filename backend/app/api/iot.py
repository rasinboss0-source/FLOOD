from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from fastapi import APIRouter, HTTPException
from app.database.db import get_db

router = APIRouter(prefix="/api/iot", tags=["IoT & Simulation"])

class TelemetryPayload(BaseModel):
    village_id: str
    station_id: Optional[str] = "ESP32-STATION-01"
    rainfall_1h: float = Field(..., ge=0, le=500, description="Local rain gauge 1-hour accumulation in mm")
    water_level: float = Field(..., ge=0, le=30, description="Ultrasonic river water level in metres")
    soil_moisture: float = Field(..., ge=0, le=100, description="Capacitive soil moisture probe percentage")
    battery_voltage: Optional[float] = 3.95
    signal_rssi: Optional[int] = -72

class SimulationPayload(BaseModel):
    village_id: str
    scenario: str = Field(..., description="Preset: 'dry', 'moderate', 'heavy', 'cloudburst', or 'custom'")
    custom_rainfall_1h: Optional[float] = None
    custom_river_level_m: Optional[float] = None
    custom_river_rise_rate: Optional[float] = None
    custom_soil_moisture: Optional[float] = None

@router.post("/telemetry")
def ingest_telemetry(payload: TelemetryPayload):
    """
    Ingests live telemetry from village ESP32 edge microcontroller via LoRa/GSM/WiFi.
    Updates the database with ground sensor readings.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify village exists
        cursor.execute("SELECT village_id FROM villages WHERE village_id = ?", (payload.village_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Village '{payload.village_id}' not found")
            
        now_str = datetime.now().isoformat()
        
        # 1. Insert raw telemetry log
        cursor.execute("""
            INSERT INTO iot_telemetry (
                village_id, station_id, timestamp, local_rainfall_1h, local_water_level_m,
                local_soil_moisture_pct, battery_voltage, signal_rssi, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ONLINE')
        """, (
            payload.village_id, payload.station_id, now_str, payload.rainfall_1h,
            payload.water_level, payload.soil_moisture, payload.battery_voltage, payload.signal_rssi
        ))
        
        # 2. Update live readings table to factor in local ground observations
        cursor.execute("""
            UPDATE live_readings
            SET rainfall_1h = ?,
                river_water_level_m = ?,
                soil_moisture_pct = ?,
                timestamp = ?,
                source = 'ESP32_Edge_Sensor'
            WHERE village_id = ?
        """, (payload.rainfall_1h, payload.water_level, payload.soil_moisture, now_str, payload.village_id))
        
        conn.commit()
        
        return {
            "status": "success",
            "message": "Telemetry received and ingested into real-time pipeline",
            "village_id": payload.village_id,
            "station_id": payload.station_id,
            "timestamp": now_str
        }

@router.post("/simulate")
def simulate_weather_scenario(payload: SimulationPayload):
    """
    Interactive Hardware & Weather Scenario Simulator for testing and demonstrations.
    Transparently labels data as simulated while demonstrating end-to-end model reaction.
    """
    v_id = payload.village_id
    sc = payload.scenario.lower()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM villages WHERE village_id = ?", (v_id,))
        v_row = cursor.fetchone()
        if not v_row:
            raise HTTPException(status_code=404, detail=f"Village '{v_id}' not found")

        if sc == "dry":
            r1 = 0.0
            r3 = 0.0
            r24 = 2.0
            r72 = 5.0
            f3 = 1.0
            sm = 28.0
            wl = 1.2
            rr = -0.05
            scenario_name = "Dry Sunny Conditions"
        elif sc == "moderate":
            r1 = 18.0
            r3 = 35.0
            r24 = 65.0
            r72 = 90.0
            f3 = 20.0
            sm = 62.0
            wl = 2.3
            rr = 0.15
            scenario_name = "Steady Monsoon Rainfall"
        elif sc == "heavy":
            r1 = 54.0
            r3 = 98.0
            r24 = 160.0
            r72 = 210.0
            f3 = 45.0
            sm = 84.0
            wl = 3.6
            rr = 0.45
            scenario_name = "Torrential Downpour / High Alert"
        elif sc == "cloudburst":
            r1 = 88.0
            r3 = 145.0
            r24 = 230.0
            r72 = 290.0
            f3 = 70.0
            sm = 95.0
            wl = 4.8
            rr = 0.85
            scenario_name = "Extreme Cloudburst Emergency"
        elif sc == "custom":
            r1 = float(payload.custom_rainfall_1h if payload.custom_rainfall_1h is not None else 30.0)
            r3 = r1 * 1.6
            r24 = r3 * 1.8
            r72 = r24 * 1.4
            f3 = r1 * 0.8
            sm = float(payload.custom_soil_moisture if payload.custom_soil_moisture is not None else 65.0)
            wl = float(payload.custom_river_level_m if payload.custom_river_level_m is not None else 2.5)
            rr = float(payload.custom_river_rise_rate if payload.custom_river_rise_rate is not None else 0.25)
            scenario_name = "Custom Environmental Injection"
        else:
            raise HTTPException(status_code=400, detail="Unknown scenario. Choose: dry, moderate, heavy, cloudburst, custom")

        now_str = datetime.now().isoformat()

        # Update live_readings
        cursor.execute("""
            INSERT OR REPLACE INTO live_readings (
                village_id, timestamp, rainfall_1h, rainfall_3h, rainfall_6h, rainfall_24h, rainfall_72h,
                forecast_1h, forecast_3h, forecast_6h, soil_moisture_pct, river_water_level_m, river_rise_rate_m_per_hr, source
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            v_id, now_str, r1, r3, r3 * 1.2, r24, r72,
            f3 * 0.4, f3, f3 * 1.5, sm, wl, rr, f"Simulator: {scenario_name}"
        ))

        # Update IoT station telemetry
        cursor.execute("""
            INSERT INTO iot_telemetry (
                village_id, station_id, timestamp, local_rainfall_1h, local_water_level_m,
                local_soil_moisture_pct, battery_voltage, signal_rssi, status
            )
            VALUES (?, ?, ?, ?, ?, ?, 3.92, -65, 'ONLINE')
        """, (v_id, f"ESP32-SIM-{v_id}", now_str, r1, wl, sm))

        conn.commit()

        return {
            "status": "simulation_applied",
            "village_id": v_id,
            "village_name": v_row["name"],
            "scenario": scenario_name,
            "simulated_values": {
                "rainfall_1h": r1,
                "rainfall_3h": r3,
                "soil_moisture_pct": sm,
                "river_water_level_m": wl,
                "river_rise_rate_m_per_hr": rr
            },
            "disclaimer": "IoT data is simulated for the prototype; the architecture supports real ESP32/LoRa/GSM sensors."
        }

@router.get("/status/{village_id}")
def get_station_status(village_id: str):
    """Returns IoT edge telemetry and sensor station status."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM iot_telemetry WHERE village_id = ? ORDER BY id DESC LIMIT 1
        """, (village_id,))
        row = cursor.fetchone()
        if not row:
            return {
                "village_id": village_id,
                "station_id": f"ESP32-{village_id}",
                "status": "OFFLINE",
                "message": "No sensor telemetry received yet."
            }
        return {
            "village_id": village_id,
            "station_id": row["station_id"],
            "status": row["status"],
            "battery_voltage": row["battery_voltage"],
            "signal_rssi": row["signal_rssi"],
            "latest_reading": {
                "rainfall_1h": row["local_rainfall_1h"],
                "water_level_m": row["local_water_level_m"],
                "soil_moisture_pct": row["local_soil_moisture_pct"],
                "timestamp": row["timestamp"]
            },
            "disclaimer": "IoT data is simulated for the prototype; the architecture supports real ESP32/LoRa/GSM sensors."
        }
