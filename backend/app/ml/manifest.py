import json
from pathlib import Path
from typing import Dict, Any, Optional
from app.config import MODELS_DIR

MANIFEST_FILE = MODELS_DIR / "model_manifest.json"

DEFAULT_MANIFEST: Dict[str, Any] = {
    "manifest_version": "1.0.0",
    "dataset_source": "PTB-XL Diagnostic ECG Database v1.0.0 & MIT-BIH Arrhythmia Database",
    "dataset_url": "https://physionet.org/content/ptb-xl/1.0.0/",
    "models": {
        "baseline_feature_rf": {
            "name": "Random Forest ECG Feature Classifier",
            "version": "1.0.0",
            "architecture": "RandomForestClassifier(n_estimators=100, max_depth=12)",
            "status": "not_trained",
            "weights_file": "baseline_rf.joblib",
            "input_type": "engineered_features_vector",
            "feature_names": [
                "heart_rate", "rr_mean_ms", "rr_variability_ms",
                "pr_interval_ms", "qrs_duration_ms", "qt_interval_ms",
                "qtc_bazett_ms", "st_level_mv", "t_amplitude_mv",
                "snr_db", "baseline_wander_score"
            ],
            "supported_classes": ["Normal Sinus Rhythm", "Sinus Tachycardia", "Sinus Bradycardia", "Prolonged QTc", "ST Elevation"],
            "training_samples": 0,
            "test_metrics": None,
            "limitations": [
                "Requires reliable P-Q-R-S-T delineation",
                "Not validated on pediatric ECGs",
                "Does not replace 12-lead full anatomical localization"
            ]
        },
        "deep_1d_cnn": {
            "name": "1D-ResNet/CNN Multi-lead Time-Series Classifier",
            "version": "1.0.0",
            "architecture": "1D Convolutional Neural Network with Residual Connections",
            "status": "not_trained",
            "weights_file": "ecg_1d_cnn.weights.h5",
            "input_type": "normalized_lead_timeseries",
            "input_shape": [5000, 12],
            "sampling_rate": 500.0,
            "supported_classes": ["NORM", "MI", "STTC", "CD", "HYP"],
            "training_samples": 0,
            "test_metrics": None,
            "limitations": [
                "Requires complete 12-lead digital signal sampled at 500 Hz",
                "Sensitive to electrode misplacement and baseline artifacts"
            ]
        }
    }
}

def load_manifest() -> Dict[str, Any]:
    """Loads model manifest or initializes default if absent."""
    if not MANIFEST_FILE.exists():
        save_manifest(DEFAULT_MANIFEST)
        return DEFAULT_MANIFEST
    try:
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_MANIFEST

def save_manifest(data: Dict[str, Any]) -> None:
    """Saves updated model manifest."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def update_model_status(model_key: str, status: str, metrics: Optional[Dict[str, Any]] = None, num_samples: int = 0):
    manifest = load_manifest()
    if model_key in manifest["models"]:
        manifest["models"][model_key]["status"] = status
        if metrics:
            manifest["models"][model_key]["test_metrics"] = metrics
        if num_samples:
            manifest["models"][model_key]["training_samples"] = num_samples
        save_manifest(manifest)
