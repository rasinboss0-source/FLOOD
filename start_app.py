import os
import sys
import subprocess
from pathlib import Path

# Reconfigure stdout/stderr for clean Unicode support on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"

def main():
    print("=" * 60)
    print("      [FLASHFLOODWARNING] - VILLAGE EARLY WARNING SYSTEM")
    print("=" * 60)
    print("\n[1/3] Setting up Python environment paths...")
    sys.path.insert(0, str(BACKEND_DIR))
    
    # Check Python executable
    python_exe = sys.executable
    print(f"Using Python: {python_exe}")

    print("\n[2/3] Checking ML model and database tables...")
    from app.database.db import init_db
    from app.database.seed_data import seed_database
    from app.ml.model import get_model
    
    init_db()
    seed_database()
    get_model()
    print("-> Database seeded & Calibrated ML model ready!")

    print("\n[3/3] Launching FastAPI Web Application Server...")
    print("-> Web App URL:  http://127.0.0.1:8000")
    print("-> Swagger Docs: http://127.0.0.1:8000/docs")
    print("=" * 60)
    print("Press CTRL+C in this terminal to stop the server.\n")

    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False, app_dir=str(BACKEND_DIR))

if __name__ == "__main__":
    main()
