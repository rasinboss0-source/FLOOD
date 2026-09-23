import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.database.db import init_db
from app.database.seed_data import seed_database
from app.ml.train import train_and_save_model
from app.ml.model import predict_flood_risk, get_model
from app.ml.feature_engine import extract_features
from app.services.data_cleaner import clean_environmental_data
from app.services.weather_service import fetch_live_weather
from app.services.alert_engine import classify_risk, generate_alert_bulletin
from app.api.prediction import get_flood_prediction
from app.api.iot import simulate_weather_scenario, SimulationPayload

def run_all_tests():
    print("==================================================")
    print("RUNNING FLASHFLOODWARNING VERIFICATION SUITE")
    print("==================================================")

    # 1. DB initialization and seeding test
    print("\n[TEST 1] Initializing and Seeding Database...")
    init_db()
    seed_database()
    print("-> DB Seed Passed!")

    # 2. ML Training and Pipeline Test
    print("\n[TEST 2] Training Calibrated ML Model...")
    train_and_save_model()
    model = get_model()
    assert model is not None, "Model failed to load!"
    print("-> Model Loaded Successfully!")

    # 3. Data Cleaning Test (anomalies, -999, physical bounds)
    print("\n[TEST 3] Testing Data Cleaner on Corrupted Sensor Input...")
    dirty_input = {
        "rainfall_1h": -999,
        "rainfall_3h": -5.0,
        "rainfall_24h": 900.0,
        "soil_moisture_pct": 140.0,
        "river_water_level_m": -999,
        "river_rise_rate_m_per_hr": 15.0
    }
    cleaned = clean_environmental_data(dirty_input)
    assert cleaned["rainfall_1h"] == 0.0, f"Expected 0.0, got {cleaned['rainfall_1h']}"
    assert cleaned["soil_moisture_pct"] == 100.0, f"Expected 100.0, got {cleaned['soil_moisture_pct']}"
    assert cleaned["river_rise_rate_m_per_hr"] == 3.5, f"Expected 3.5, got {cleaned['river_rise_rate_m_per_hr']}"
    print("-> Data Cleaner Passed!")

    # 4. Feature Extraction Test
    print("\n[TEST 4] Testing Feature Engine Extraction...")
    sample_static = {
        "elevation_m": 120.0,
        "slope_deg": 12.0,
        "distance_to_stream_m": 180.0,
        "catchment_area_sqkm": 35.0,
        "soil_clay_pct": 48.0,
        "land_cover_urban_pct": 15.0,
        "land_cover_forest_pct": 45.0,
        "historical_flood_count": 4
    }
    sample_live = {
        "rainfall_1h": 72.0,
        "rainfall_3h": 115.0,
        "rainfall_6h": 140.0,
        "rainfall_24h": 185.0,
        "rainfall_72h": 220.0,
        "forecast_3h": 45.0,
        "soil_moisture_pct": 88.0,
        "river_water_level_m": 3.9,
        "river_rise_rate_m_per_hr": 0.65
    }
    extracted = extract_features(sample_static, sample_live)
    assert len(extracted["feature_array"]) == 20, f"Expected 20 features, got {len(extracted['feature_array'])}"
    print(f"-> Feature Vector Created: {extracted['feature_array'][:5]}... ({len(extracted['feature_array'])} total)")

    # 5. ML Model Prediction on Cloudburst conditions
    print("\n[TEST 5] Testing ML Inference on Severe Cloudburst Conditions...")
    result = predict_flood_risk(extracted["feature_dict"], extracted["feature_array"])
    print(f"-> Flood Probability: {result['probability'] * 100:.1f}% | Risk Level: {result['risk_level']}")
    assert result["probability"] >= 0.70, f"Expected high probability for cloudburst, got {result['probability']}"
    assert result["risk_level"] in ["HIGH", "VERY HIGH"], f"Expected HIGH or VERY HIGH, got {result['risk_level']}"
    assert len(result["contributing_factors"]) > 0, "Expected contributing factors!"
    for f in result["contributing_factors"]:
        print(f"   * [{f['impact']}] {f['feature']}: {f['value']} - {f['explanation']}")

    # 6. ML Model Prediction on Sunny Dry conditions
    print("\n[TEST 6] Testing ML Inference on Normal Sunny Conditions...")
    dry_live = {
        "rainfall_1h": 0.0,
        "rainfall_3h": 0.0,
        "rainfall_6h": 0.0,
        "rainfall_24h": 1.0,
        "rainfall_72h": 2.0,
        "forecast_3h": 0.0,
        "soil_moisture_pct": 25.0,
        "river_water_level_m": 1.1,
        "river_rise_rate_m_per_hr": -0.02
    }
    dry_extracted = extract_features(sample_static, dry_live)
    dry_result = predict_flood_risk(dry_extracted["feature_dict"], dry_extracted["feature_array"])
    print(f"-> Flood Probability: {dry_result['probability'] * 100:.1f}% | Risk Level: {dry_result['risk_level']}")
    assert dry_result["probability"] <= 0.35, f"Expected low probability for dry day, got {dry_result['probability']}"
    assert dry_result["risk_level"] in ["LOW", "MODERATE"]

    # 7. End-to-End Village Prediction Query Test
    print("\n[TEST 7] Testing End-to-End Prediction for 'TN-NIL-01' (Coonoor Valley, Tamil Nadu)...")
    pred_response = get_flood_prediction("TN-NIL-01")
    assert pred_response["village_name"] == "Coonoor Valley"
    assert "prediction" in pred_response
    assert "bulletin" in pred_response
    print(f"-> Success! Village: {pred_response['village_name']}, State: {pred_response['state']}")
    print(f"   Predicted Risk: {pred_response['prediction']['risk_level']} ({pred_response['prediction']['probability_pct']}%)")
    print(f"   Alert Headline: {pred_response['bulletin']['headline'].encode('ascii', 'replace').decode('ascii')}")

    # 8. IoT Simulator Test
    print("\n[TEST 8] Testing IoT Hardware Simulator Scenario Injection...")
    sim_res = simulate_weather_scenario(SimulationPayload(
        village_id="TN-NIL-01",
        scenario="cloudburst"
    ))
    assert sim_res["status"] == "simulation_applied"
    post_sim_pred = get_flood_prediction("TN-NIL-01")
    print(f"-> Injected Cloudburst Scenario! New Probability: {post_sim_pred['prediction']['probability_pct']}% | Risk: {post_sim_pred['prediction']['risk_level']}")
    assert post_sim_pred['prediction']['risk_level'] in ["HIGH", "VERY HIGH"]

    print("\n==================================================")
    print("ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
