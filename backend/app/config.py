import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR = BASE_DIR / "app" / "ml"
MODEL_PATH = MODEL_DIR / "flood_model.pkl"
DB_PATH = DATA_DIR / "flashflood.db"

# Risk Thresholds
RISK_THRESHOLDS = {
    "LOW": (0.00, 0.30),
    "MODERATE": (0.30, 0.60),
    "HIGH": (0.60, 0.80),
    "VERY_HIGH": (0.80, 1.00),
}

# Emergency Helpline Contacts
EMERGENCY_CONTACTS = [
    {"name": "National Disaster Response Force (NDRF)", "number": "1078", "type": "National"},
    {"name": "State Emergency Operation Centre (SEOC)", "number": "1070", "type": "State"},
    {"name": "District Disaster Control Room", "number": "1077", "type": "District"},
    {"name": "National Emergency Number", "number": "112", "type": "Emergency"},
    {"name": "Ambulance", "number": "108", "type": "Medical"},
]

# Forecast parameters
FLASH_FLOOD_WINDOW_HOURS = "1–3 Hours"
DEFAULT_REFRESH_INTERVAL_SEC = 60
