// ============================================================================
// SIH26192 — Tamil Nadu Hyperlocal Flash Flood Early Warning System
// Complete Feature Schema — Groups A, B, C, D (fully spec-compliant)
// ============================================================================

// ── Group A: Static Features (per-village, computed once) ──────────────────

export interface VillageStaticFeatures {
  // Terrain / DEM
  elevation_m: number;
  average_slope_deg: number;
  aspect_deg: number;              // [NEW] Numeric degrees 0–360 (was string "SE")
  aspect: string;                  // Human-readable cardinal direction label
  distance_to_stream_m: number;
  upstream_catchment_sqkm: number;

  // Land / Geology
  land_cover: string;
  soil_type: string;
  soil_depth_cm: number;
  geology: string;
  landslide_zone_flag: boolean;    // [NEW] GSI Bhukosh known unstable zone

  // Historical incidents
  historical_flood_count: number;
  historical_landslide_count: number;

  // Exposure / Demographics
  population: number;
  households: number;
  road_access: string;
  nearest_shelter: string;
  shelter_distance_m: number;      // [NEW] Distance to nearest shelter in metres
}

// ── Group B: Dynamic Features (hourly satellite/forecast refresh) ───────────

export interface VillageLiveData {
  // Rainfall — current
  rainfall_1h_mm: number;
  rainfall_3h_mm: number;
  rainfall_6h_mm: number;
  rainfall_24h_mm: number;
  rainfall_3day_mm: number;
  rainfall_7day_mm: number;         // [NEW] 7-day antecedent wetness index

  // Rainfall — forecast
  forecast_rainfall_6h_mm: number;
  forecast_rainfall_24h_mm: number; // [NEW] 24-hour forecast (was only 6h)

  // Soil
  soil_moisture_pct: number;

  // Hydrology
  water_level_m: number;
  water_level_rate_mh: number;
  river_discharge_cumecs: number;   // [NEW] CWC flow volume (m³/s)

  // Atmosphere
  temperature_c: number;
  humidity_pct: number;
  weather_warning: string;          // IMD nowcast flag

  // Metadata
  timestamp: string;
}

// ── Group C: Ground Sensor (IoT) Features ──────────────────────────────────

export interface IoTSensor {
  sensor_id: string;
  type: string;
  value: number;
  rate?: number;
  unit: string;
  status: 'ONLINE' | 'CALIBRATING' | 'MAINTENANCE' | 'OFFLINE';
  battery_pct: number;
  telemetry: string;
  last_updated: string;
  is_simulated: boolean;            // [NEW] true = synthetic data, false = live hardware
}

// ── Group D: Target Labels (model output) ──────────────────────────────────

export interface ShapFactor {
  factor: string;
  weight: number;
  contribution: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  val: string;
}

export interface TrendPoint {
  hour: string;
  risk_score: number;
}

export interface VillageRisk {
  // Flood model output
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'VERY HIGH';
  flood_probability: number;
  prediction_window: string;
  lead_time_hrs: number;            // [NEW] Numeric hours (was buried in string)

  // Landslide model output (separate head)
  landslide_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH'; // [NEW]
  landslide_probability: number;    // [NEW] 0.0–1.0

  // Alert dispatch
  alert_status: 'NORMAL' | 'MONITORING' | 'ACTIVE';
  trend: string;

  // Explainability & history
  shap_factors: ShapFactor[];
  trend_24h: TrendPoint[];
  model_version: string;
  last_updated: string;
}

// ── Top-level Village (sensor_available flag added) ────────────────────────

export interface Village {
  id: string;
  village_code: string;
  village_name: string;
  district: string;
  sub_district: string;
  coverage_type: string;
  lgd_code: string;
  gram_panchayat_ulb: string;
  latitude: number;
  longitude: number;
  is_reserve_forest: boolean;
  sensor_available: boolean;        // [NEW] false = A+B-only inference fallback
  static: VillageStaticFeatures;
  live: VillageLiveData;
  risk: VillageRisk;
  sensors: IoTSensor[];
  alerts: VillageAlert[];
}

// ── Supporting Interfaces ──────────────────────────────────────────────────

export interface VillageAlert {
  alert_id: string;
  level: string;
  score: number;
  status: string;
  triggers: string[];
  prediction_window: string;
  sop_action: string;
}

export interface DistrictSummary {
  id: string;
  district_name: string;
  state: string;
  is_hilly_district: boolean;
  center_lat: number;
  center_lon: number;
  total_villages: number;
  sub_districts_count: number;
  sub_districts: string[];
  low_risk: number;
  moderate_risk: number;
  elevated_risk: number;
  high_risk: number;
  very_high_risk: number;
  active_alerts: number;
  sensors_online: number;
  avg_elevation_m: number;
  avg_slope_deg: number;
}

export interface SubDistrictSummary {
  district: string;
  sub_district: string;
  total_villages: number;
  low_risk: number;
  moderate_risk: number;
  elevated_risk: number;
  high_risk: number;
  very_high_risk: number;
  active_alerts: number;
  sensors_online: number;
  villages: string[];
}
