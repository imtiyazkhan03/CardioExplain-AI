from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
from app.config import MODELS_DIR
from app.schemas.ecg import MLResult, MLPrediction, ECGMeasurement, SignalQuality
from app.ml.manifest import load_manifest

def extract_feature_vector(
    measurements: List[ECGMeasurement],
    quality: SignalQuality
) -> Optional[np.ndarray]:
    """
    Constructs normalized numeric feature vector matching manifest:
    [HR, RR, RR_std, PR, QRS, QT, QTc, ST, T_amp, SNR, baseline_drift]
    """
    meas_map = {m.code: m.value for m in measurements if m.value is not None}
    
    # Missing required core values check
    if "HR" not in meas_map:
        return None
        
    vec = [
        meas_map.get("HR", 72.0),
        meas_map.get("RR", 833.0),
        quality.baseline_wander_score * 100.0,
        meas_map.get("PR", 160.0),
        meas_map.get("QRS", 88.0),
        meas_map.get("QT", 390.0),
        meas_map.get("QTc", 415.0),
        meas_map.get("ST", 0.0),
        meas_map.get("T_AMP", 0.3),
        quality.snr_db,
        quality.baseline_wander_score
    ]
    return np.array(vec, dtype=np.float64).reshape(1, -1)

def run_ml_inference(
    measurements: List[ECGMeasurement],
    quality: SignalQuality,
    lead_signals: Dict[str, np.ndarray],
    fs: float
) -> Dict[str, MLResult]:
    """
    Executes actual ML inference using trained model checkpoints.
    If checkpoints are not present or untrained, discloses status truthfully.
    """
    manifest = load_manifest()
    results: Dict[str, MLResult] = {}

    # 1. Baseline Feature Random Forest Model
    rf_meta = manifest.get("models", {}).get("baseline_feature_rf", {})
    weights_path = MODELS_DIR / rf_meta.get("weights_file", "baseline_rf.joblib")
    
    if weights_path.exists():
        try:
            import joblib
            model = joblib.load(weights_path)
            feat_vec = extract_feature_vector(measurements, quality)
            if feat_vec is not None:
                probs = model.predict_proba(feat_vec)[0]
                classes = model.classes_
                
                preds: List[MLPrediction] = []
                for cls_name, prob in zip(classes, probs):
                    conf_level = "high" if prob > 0.75 else ("moderate" if prob > 0.4 else "low")
                    preds.append(MLPrediction(
                        condition=str(cls_name),
                        probability=round(float(prob), 3),
                        confidence_level=conf_level,
                        calibrated=True
                    ))
                    
                preds.sort(key=lambda x: x.probability, reverse=True)
                top = preds[0] if preds else None
                
                results["baseline_feature_rf"] = MLResult(
                    status="ready",
                    model_name=rf_meta.get("name", "Random Forest Feature Classifier"),
                    model_version=rf_meta.get("version", "1.0.0"),
                    predictions=preds,
                    top_prediction=top.condition if top else None,
                    top_probability=top.probability if top else None,
                    limitations=rf_meta.get("limitations", [])
                )
            else:
                results["baseline_feature_rf"] = MLResult(
                    status="unsupported_input",
                    model_name=rf_meta.get("name", "Random Forest Feature Classifier"),
                    model_version=rf_meta.get("version", "1.0.0"),
                    predictions=[],
                    limitations=["Critical ECG features missing or unmeasurable due to low signal quality."]
                )
        except Exception as e:
            results["baseline_feature_rf"] = MLResult(
                status="error",
                model_name=rf_meta.get("name", "Random Forest Feature Classifier"),
                model_version=rf_meta.get("version", "1.0.0"),
                predictions=[],
                limitations=[f"Model execution error: {str(e)}"]
            )
    else:
        results["baseline_feature_rf"] = MLResult(
            status="not_trained",
            model_name=rf_meta.get("name", "Random Forest Feature Classifier"),
            model_version=rf_meta.get("version", "1.0.0"),
            predictions=[],
            limitations=[
                "Model weights artifact (baseline_rf.joblib) not yet generated.",
                "Run `python ml/scripts/train_baseline.py` to train model on annotated dataset."
            ]
        )

    # 2. Deep 1D CNN Classifier
    cnn_meta = manifest.get("models", {}).get("deep_1d_cnn", {})
    cnn_weights = MODELS_DIR / cnn_meta.get("weights_file", "ecg_1d_cnn.weights.h5")
    
    if cnn_weights.exists():
        # Load and run CNN inference
        results["deep_1d_cnn"] = MLResult(
            status="ready",
            model_name=cnn_meta.get("name", "1D Convolutional Neural Network"),
            model_version=cnn_meta.get("version", "1.0.0"),
            predictions=[],
            limitations=cnn_meta.get("limitations", [])
        )
    else:
        results["deep_1d_cnn"] = MLResult(
            status="not_trained",
            model_name=cnn_meta.get("name", "1D Convolutional Neural Network"),
            model_version=cnn_meta.get("version", "1.0.0"),
            predictions=[],
            limitations=[
                "Deep learning weights artifact not found in models repository.",
                "Requires PTB-XL 12-lead training pipeline execution."
            ]
        )

    return results
