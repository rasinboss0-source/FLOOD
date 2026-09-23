import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database.db import init_db
from app.database.seed_data import seed_database
from app.ml.model import get_model
from app.api.villages import router as villages_router
from app.api.prediction import router as prediction_router
from app.api.iot import router as iot_router
from app.api.alerts import router as alerts_router

app = FastAPI(
    title="FlashFloodWarning API",
    description="Village-Level Flash Flood Prediction & Early Warning System",
    version="1.0.0"
)

# Enable CORS for cross-origin mobile and web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(villages_router)
app.include_router(prediction_router)
app.include_router(iot_router)
app.include_router(alerts_router)

# Paths for frontend
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"

@app.on_event("startup")
def on_startup():
    """Initializes DB, seeds Indian villages, and prepares calibrated ML model."""
    print("Initializing FlashFloodWarning database...")
    init_db()
    seed_database()
    print("Verifying ML Model...")
    get_model()
    print("FlashFloodWarning Ready!")

# Serve static frontend files if directory exists
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    def serve_index():
        return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "FlashFloodWarning",
        "version": "1.0.0",
        "description": "Integrating Static GIS + Live Ingestion + IoT Telemetry + ML Prediction"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
