import sqlite3
import json
from contextlib import contextmanager
from app.config import DB_PATH

def init_db():
    """Initializes SQLite database tables."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Villages table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS villages (
                village_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                state TEXT NOT NULL,
                district TEXT NOT NULL,
                taluk TEXT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                population INTEGER DEFAULT 1000
            )
        """)
        
        # Static GIS & Terrain table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS static_gis (
                village_id TEXT PRIMARY KEY,
                elevation_m REAL NOT NULL,
                slope_deg REAL NOT NULL,
                aspect TEXT,
                nearest_stream_name TEXT,
                distance_to_stream_m REAL NOT NULL,
                catchment_area_sqkm REAL NOT NULL,
                soil_type TEXT NOT NULL,
                soil_depth_cm REAL DEFAULT 80.0,
                soil_clay_pct REAL DEFAULT 45.0,
                soil_sand_pct REAL DEFAULT 25.0,
                land_cover_agri_pct REAL DEFAULT 50.0,
                land_cover_forest_pct REAL DEFAULT 30.0,
                land_cover_urban_pct REAL DEFAULT 15.0,
                land_cover_water_pct REAL DEFAULT 5.0,
                historical_flood_count INTEGER DEFAULT 0,
                historical_records_json TEXT,
                evacuation_shelters_json TEXT,
                upstream_polygon_json TEXT,
                FOREIGN KEY (village_id) REFERENCES villages(village_id)
            )
        """)
        
        # Live readings cache table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS live_readings (
                village_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                rainfall_1h REAL NOT NULL,
                rainfall_3h REAL NOT NULL,
                rainfall_6h REAL NOT NULL,
                rainfall_24h REAL NOT NULL,
                rainfall_72h REAL NOT NULL,
                forecast_1h REAL NOT NULL,
                forecast_3h REAL NOT NULL,
                forecast_6h REAL NOT NULL,
                soil_moisture_pct REAL NOT NULL,
                river_water_level_m REAL NOT NULL,
                river_rise_rate_m_per_hr REAL NOT NULL,
                source TEXT DEFAULT 'satellite_forecast',
                FOREIGN KEY (village_id) REFERENCES villages(village_id)
            )
        """)
        
        # IoT Edge station telemetry table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS iot_telemetry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                village_id TEXT NOT NULL,
                station_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                local_rainfall_1h REAL,
                local_water_level_m REAL,
                local_soil_moisture_pct REAL,
                battery_voltage REAL DEFAULT 3.95,
                signal_rssi INTEGER DEFAULT -72,
                status TEXT DEFAULT 'ONLINE',
                FOREIGN KEY (village_id) REFERENCES villages(village_id)
            )
        """)
        
        # Prediction & Alert history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                village_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                probability REAL NOT NULL,
                risk_level TEXT NOT NULL,
                contributing_factors_json TEXT,
                FOREIGN KEY (village_id) REFERENCES villages(village_id)
            )
        """)
        
        conn.commit()

@contextmanager
def get_db():
    """Provides a database connection with dictionary-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
