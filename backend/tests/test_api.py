import io
import sys
from pathlib import Path
import pytest
import numpy as np

# Ensure backend root is in python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

from app.ecg.loader import generate_synthetic_ecg, parse_csv_ecg
from app.ecg.filtering import preprocess_ecg_lead, remove_baseline_wander
from app.ecg.quality import assess_multilead_quality
from app.ecg.delineation import pan_tompkins_qrs, analyze_lead_measurements
from app.ml.manifest import load_manifest

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CardioExplain AI" in data["service"]

def test_model_status_endpoint():
    response = client.get("/api/model/status")
    assert response.status_code == 200
    manifest = response.json()
    assert "models" in manifest
    assert "baseline_feature_rf" in manifest["models"]

def test_synthetic_ecg_generator():
    signals, fs = generate_synthetic_ecg(duration_sec=5.0, fs=500.0, heart_rate=75.0)
    assert fs == 500.0
    assert "Lead II" in signals
    assert len(signals["Lead II"]) == 2500  # 5s * 500Hz
    assert len(signals) == 12  # Complete 12-lead set

def test_filtering_and_delineation():
    signals, fs = generate_synthetic_ecg(duration_sec=6.0, fs=500.0, heart_rate=60.0)
    filtered = preprocess_ecg_lead(signals["Lead II"], fs=fs)
    assert len(filtered) == len(signals["Lead II"])
    
    r_peaks = pan_tompkins_qrs(filtered, fs=fs)
    # At 60 bpm over 6s, expect approximately 5-7 beats
    assert len(r_peaks) >= 4

    meas, diag, landmarks = analyze_lead_measurements("Lead II", filtered, fs=fs)
    assert len(meas) > 0
    hr_meas = next((m for m in meas if m.code == "HR"), None)
    assert hr_meas is not None
    assert 50.0 <= hr_meas.value <= 75.0

def test_quality_assessment():
    signals, fs = generate_synthetic_ecg(duration_sec=4.0, fs=500.0)
    quality = assess_multilead_quality(signals, fs=fs)
    assert quality.rating in ["high", "moderate"]
    assert quality.snr_db > 0.0

def test_demo_load_endpoint():
    response = client.post("/api/demo/load?variant=normal")
    assert response.status_code == 200
    record = response.json()
    assert record["status"] == "completed"
    assert "DEMO" in record["filename"]
    assert len(record["measurements"]) > 0
    assert record["has_report"] is True
    
    # Check waveform endpoint
    analysis_id = record["id"]
    wf_resp = client.get(f"/api/analyses/{analysis_id}/waveform?lead=Lead%20II")
    assert wf_resp.status_code == 200
    wf_data = wf_resp.json()
    assert wf_data["lead_name"] == "Lead II"
    assert len(wf_data["voltage"]) > 0

def test_upload_invalid_file_rejected():
    # Empty file
    files = {"file": ("empty.csv", b"", "text/csv")}
    response = client.post(
        "/api/ecg/upload",
        files=files,
        data={"consent_confirmed": "true"}
    )
    assert response.status_code in [400, 422]

def test_upload_unsupported_format_rejected():
    files = {"file": ("bad_script.exe", b"malicious binary", "application/octet-stream")}
    response = client.post(
        "/api/ecg/upload",
        files=files,
        data={"consent_confirmed": "true"}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_upload_valid_csv():
    # Generate CSV in-memory
    csv_str = "Time,Lead II,Lead I\n0.00,0.01,0.005\n0.002,0.02,0.01\n0.004,0.05,0.02\n0.006,0.1,0.04\n0.008,0.5,0.2\n0.010,1.2,0.6\n0.012,0.1,0.05\n0.014,-0.2,-0.1\n0.016,0.0,0.0"
    for i in range(200):
        t = 0.018 + i * 0.002
        csv_str += f"\n{t:.3f},0.01,0.005"
        
    files = {"file": ("patient_ecg.csv", csv_str.encode("utf-8"), "text/csv")}
    response = client.post(
        "/api/ecg/upload",
        files=files,
        data={"consent_confirmed": "true", "sampling_rate": "500.0"}
    )
    assert response.status_code == 200
    rec = response.json()
    assert rec["file_type"] == "CSV"
    assert rec["status"] == "completed"
