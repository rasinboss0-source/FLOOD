# 🌊 FlashFloodWarning

**Village-Level Flash Flood Risk Prediction & Early Warning System**

FlashFloodWarning answers the critical question for any Indian village:
> *"What is the probability that Village X will experience a flash flood in the next 1–3 hours?"*

---

## 🏛️ System Architecture

```
                    EXTERNAL DATA
                         │
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
    NASA/ESA            IMD             CWC
    Satellite         Weather         River Data
  (Open-Meteo/GPM)   (Forecast)      (Gauge Level)
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ↓
                  DATA INGESTION
                         │
                         ↓
             FASTAPI BACKEND (Python 3.11)
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
       DATA CLEANING            SQLITE DB
       (Outlier/Missing)       (Villages, Static,
             │                  IoT, Alerts)
             └───────────┬───────────┘
                         ↓
                  FEATURE ENGINE
          (Rain 1h/3h/24h, River Rise Rate,
           Catchment, Slope, Soil Saturation)
                         ↓
                  AI / ML MODEL
          (Calibrated Random Forest Ensemble)
                         ↓
               FLOOD PROBABILITY (0–100%)
                         ↓
                    RISK ENGINE
          (LOW / MODERATE / HIGH / VERY HIGH)
                         ↓
                    REST API
                         │
         ┌───────────────┴───────────────┐
         ↓                               ↓
    MOBILE WEB APP                 ALERT SYSTEM
(Interactive Map, Gauges,      (Early Warning Sirens,
 IoT Simulator, Shelters)       Threshold Crossings)
```

---

## 📁 Directory Structure

```
flashfloodwarning/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI server & route mounting
│   │   ├── config.py                # Environment configs & thresholds
│   │   ├── api/
│   │   │   ├── villages.py          # /api/villages endpoints
│   │   │   ├── prediction.py        # /api/villages/{id}/predict
│   │   │   ├── iot.py               # /api/iot/telemetry & /api/iot/simulate
│   │   │   └── alerts.py            # /api/alerts feed
│   │   ├── services/
│   │   │   ├── weather_service.py   # Live Open-Meteo API + GPM fallback
│   │   │   ├── soil_service.py      # Soil moisture saturation calculation
│   │   │   ├── river_service.py     # CWC-style river gauge tracking
│   │   │   ├── data_cleaner.py      # Missing values, anomaly filters, bounds
│   │   │   └── alert_engine.py      # Thresholds & notification generator
│   │   ├── ml/
│   │   │   ├── feature_engine.py    # Extracts ML feature vector from static+live+iot
│   │   │   ├── model.py             # Calibrated inference pipeline & XAI
│   │   │   ├── train.py             # Model training script & synthetic calibration
│   │   │   └── flood_model.pkl      # Saved trained model weights (ROC-AUC 0.9969)
│   │   └── database/
│   │       ├── db.py                # SQLite connection manager
│   │       └── seed_data.py         # Seed dataset for Indian villages
│   ├── tests/
│   │   └── test_system.py           # Comprehensive automated verification suite
│   └── requirements.txt
├── frontend/
│   ├── index.html                   # Mobile-first responsive app
│   ├── css/
│   │   └── styles.css               # Clean responsive styles, gauge animations, sirens
│   └── js/
│       ├── app.js                   # State management, Web Audio siren, screen switching
│       ├── map.js                   # Interactive Leaflet map, catchment polygons, stream reach
│       └── simulator.js             # IoT sensor simulation controls
├── start_app.py                     # One-command unified launcher
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Run Automated Test Suite
```powershell
& "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe" backend\tests\test_system.py
```

### 2. Start the Application
```powershell
& "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe" start_app.py
```

Open your browser to:
- **Web App**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/villages` | List all monitored Indian villages with search/filter |
| `GET` | `/api/villages/{id}` | Complete village profile (DEM, slope, catchment, shelters) |
| `GET` | `/api/villages/{id}/predict` | **Primary prediction**: 1–3h probability, risk tier, XAI drivers |
| `POST` | `/api/iot/telemetry` | Ingest live ESP32/LoRa edge sensor telemetry |
| `POST` | `/api/iot/simulate` | Interactive scenario simulator (Dry, Monsoon, Cloudburst, Custom) |
| `GET` | `/api/iot/status/{id}` | IoT station status (battery, signal, latest readings) |
| `GET` | `/api/alerts` | Active emergency alerts feed across all villages |

---

## 🛰️ Real Hardware Integration (ESP32)

Physical microcontrollers (ESP32 / LoRaWAN / GSM) can post telemetry to:
```http
POST /api/iot/telemetry
Content-Type: application/json

{
  "village_id": "TN-NIL-01",
  "station_id": "ESP32-EDGE-01",
  "rainfall_1h": 68.5,
  "water_level": 3.85,
  "soil_moisture": 86.0,
  "battery_voltage": 3.92,
  "signal_rssi": -68
}
```

> **Note on Prototype**: IoT data is simulated in the interactive UI simulator for prototype demonstrations, while the architecture natively supports real ESP32 hardware payloads.
