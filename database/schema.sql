-- ============================================================================
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
