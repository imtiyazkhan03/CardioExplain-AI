import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "reports"
MODELS_DIR = BASE_DIR.parent / "ml" / "models"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "CardioExplain AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/cardioexplain.db")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "deterministic")  # "deterministic" or "openai" or "gemini"
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-pro")
    
    # File limits
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: list[str] = [".csv", ".txt", ".dat", ".hea", ".pdf", ".png", ".jpg", ".jpeg"]
    
    # ECG Reference Standards (American Heart Association / ESC guidelines)
    REF_HR_MIN: float = 60.0
    REF_HR_MAX: float = 100.0
    REF_PR_MIN: float = 120.0  # ms
    REF_PR_MAX: float = 200.0  # ms
    REF_QRS_MAX: float = 120.0  # ms
    REF_QTC_MALE_MAX: float = 450.0  # ms
    REF_QTC_FEMALE_MAX: float = 460.0  # ms
    REF_ST_ELEVATION_THRESHOLD: float = 0.1  # mV (1 mm standard calibration)
    REF_ST_DEPRESSION_THRESHOLD: float = -0.05  # mV (0.5 mm)

settings = Settings()
