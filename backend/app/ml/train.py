import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from app.config import MODEL_PATH
from app.ml.feature_engine import FEATURE_NAMES

def generate_synthetic_training_dataset(n_samples: int = 3000):
    """
    Synthesizes hydrologically consistent training samples representing
    Indian terrain types: Western Ghats, Himalayan valleys, Brahmaputra basin, and coastal deltas.
    """
    np.random.seed(42)
    
    # 1. Base variables
    elev = np.random.uniform(5.0, 2500.0, n_samples)
    slope = np.random.uniform(0.5, 35.0, n_samples)
    dist_stream = np.random.uniform(30.0, 1500.0, n_samples)
    catchment = np.random.uniform(5.0, 150.0, n_samples)
    clay = np.random.uniform(15.0, 65.0, n_samples)
    urban = np.random.uniform(5.0, 40.0, n_samples)
    forest = np.random.uniform(10.0, 70.0, n_samples)
    hist_count = np.random.randint(0, 10, n_samples)
    
    # 2. Weather & hydrological conditions
    # We mix dry days, moderate monsoon, and severe cloudburst storms
    scenario_type = np.random.choice(["dry", "moderate", "heavy_monsoon", "cloudburst"], p=[0.40, 0.30, 0.20, 0.10], size=n_samples)
    
    r1h = np.zeros(n_samples)
    r3h = np.zeros(n_samples)
    r6h = np.zeros(n_samples)
    r24h = np.zeros(n_samples)
    r72h = np.zeros(n_samples)
    f3h = np.zeros(n_samples)
    sm = np.zeros(n_samples)
    wl = np.zeros(n_samples)
    rr = np.zeros(n_samples)
    
    for i in range(n_samples):
        st = scenario_type[i]
        if st == "dry":
            r1h[i] = np.random.uniform(0.0, 2.0)
            r3h[i] = r1h[i] + np.random.uniform(0.0, 3.0)
            r6h[i] = r3h[i] + np.random.uniform(0.0, 5.0)
            r24h[i] = r6h[i] + np.random.uniform(0.0, 10.0)
            r72h[i] = r24h[i] + np.random.uniform(0.0, 20.0)
            f3h[i] = np.random.uniform(0.0, 5.0)
            sm[i] = np.random.uniform(15.0, 45.0)
            wl[i] = np.random.uniform(0.5, 1.8)
            rr[i] = np.random.uniform(-0.1, 0.05)
        elif st == "moderate":
            r1h[i] = np.random.uniform(5.0, 20.0)
            r3h[i] = r1h[i] + np.random.uniform(10.0, 30.0)
            r6h[i] = r3h[i] + np.random.uniform(10.0, 30.0)
            r24h[i] = r6h[i] + np.random.uniform(20.0, 50.0)
            r72h[i] = r24h[i] + np.random.uniform(30.0, 80.0)
            f3h[i] = np.random.uniform(5.0, 25.0)
            sm[i] = np.random.uniform(45.0, 70.0)
            wl[i] = np.random.uniform(1.5, 2.8)
            rr[i] = np.random.uniform(0.0, 0.25)
        elif st == "heavy_monsoon":
            r1h[i] = np.random.uniform(25.0, 55.0)
            r3h[i] = r1h[i] + np.random.uniform(40.0, 80.0)
            r6h[i] = r3h[i] + np.random.uniform(40.0, 90.0)
            r24h[i] = r6h[i] + np.random.uniform(60.0, 150.0)
            r72h[i] = r24h[i] + np.random.uniform(80.0, 200.0)
            f3h[i] = np.random.uniform(25.0, 60.0)
            sm[i] = np.random.uniform(70.0, 92.0)
            wl[i] = np.random.uniform(2.5, 4.5)
            rr[i] = np.random.uniform(0.2, 0.65)
        else: # cloudburst / flash flood extreme
            r1h[i] = np.random.uniform(60.0, 110.0)
            r3h[i] = r1h[i] + np.random.uniform(50.0, 120.0)
            r6h[i] = r3h[i] + np.random.uniform(50.0, 120.0)
            r24h[i] = r6h[i] + np.random.uniform(80.0, 180.0)
            r72h[i] = r24h[i] + np.random.uniform(90.0, 220.0)
            f3h[i] = np.random.uniform(40.0, 90.0)
            sm[i] = np.random.uniform(82.0, 98.0)
            wl[i] = np.random.uniform(3.5, 6.0)
            rr[i] = np.random.uniform(0.5, 1.2)

    # 3. Compute derived features
    c_coeff = 0.2 + (0.35 * (clay / 100.0)) + (0.30 * (urban / 100.0)) + (0.30 * (sm / 100.0))
    runoff_index = c_coeff * (r1h + (r3h * 0.5)) * np.log(catchment + 1.0)
    slope_velocity = np.sqrt(np.sin(np.radians(np.maximum(0.5, slope)))) * 10.0
    stream_vuln = 1000.0 / (dist_stream + 50.0)

    # 4. Determine Flash Flood Ground Truth (Hydrological criteria)
    # Flash flood happens when runoff accumulation overwhelms drainage channel
    flash_score = (
        (r1h * 0.45) +
        (r3h * 0.20) +
        (rr * 35.0) +
        ((sm - 50.0) * 0.35) +
        (stream_vuln * 1.5) +
        (runoff_index * 0.15) +
        (hist_count * 1.5) -
        (dist_stream * 0.015)
    )
    
    # Add small stochastic noise
    flash_score += np.random.normal(0, 4.0, n_samples)
    y = (flash_score > 36.0).astype(int)

    X = np.column_stack([
        r1h, r3h, r6h, r24h, r72h, f3h, sm, wl, rr, elev,
        slope, dist_stream, catchment, clay, urban, forest,
        hist_count, runoff_index, slope_velocity, stream_vuln
    ])
    return X, y

def train_and_save_model():
    """Trains the calibrated random forest model and saves it."""
    print("Generating hydrological training dataset...")
    X, y = generate_synthetic_training_dataset(3500)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training set: {X_train.shape[0]} samples (Floods: {np.sum(y_train)})")
    print(f"Testing set: {X_test.shape[0]} samples (Floods: {np.sum(y_test)})")
    
    base_rf = RandomForestClassifier(
        n_estimators=120,
        max_depth=9,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42
    )
    
    # Calibrated probability classifier (Sigmoid/Platt scaling)
    calibrated_clf = CalibratedClassifierCV(estimator=base_rf, method="sigmoid", cv=5)
    calibrated_clf.fit(X_train, y_train)
    
    y_pred = calibrated_clf.predict(X_test)
    y_prob = calibrated_clf.predict_proba(X_test)[:, 1]
    
    auc = roc_auc_score(y_test, y_prob)
    print(f"Model Training Completed! Test ROC-AUC: {auc:.4f}")
    print(classification_report(y_test, y_pred, target_names=["No Flood", "Flash Flood"]))
    
    os.makedirs(MODEL_PATH.parent, exist_ok=True)
    payload = {
        "model": calibrated_clf,
        "feature_names": FEATURE_NAMES,
        "auc_score": float(auc)
    }
    joblib.dump(payload, MODEL_PATH)
    print(f"Model saved successfully to {MODEL_PATH}")

if __name__ == "__main__":
    train_and_save_model()
