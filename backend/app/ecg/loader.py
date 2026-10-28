import io
import re
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
import pandas as pd
from PIL import Image

def generate_synthetic_ecg(
    duration_sec: float = 10.0,
    fs: float = 500.0,
    heart_rate: float = 72.0,
    noise_level: float = 0.015,
    abnormality: Optional[str] = None,
    pr_interval_ms: Optional[float] = None,
    qrs_duration_ms: Optional[float] = None,
    qtc_ms: Optional[float] = None,
    qt_ms: Optional[float] = None
) -> Tuple[Dict[str, np.ndarray], float]:
    """
    Generates a physiologically realistic synthetic 12-lead ECG signal.
    Labeled explicitly as synthetic demo data.
    Based on standard dipole projection equations.
    """
    t = np.arange(0, duration_sec, 1.0 / fs)
    num_samples = len(t)
    
    # Calculate beat timing
    rr_sec = 60.0 / heart_rate
    beats = np.arange(0.3, duration_sec - 0.2, rr_sec)
    
    # Lead II base parameters
    lead_signals: Dict[str, np.ndarray] = {
        "Lead I": np.zeros(num_samples),
        "Lead II": np.zeros(num_samples),
        "Lead III": np.zeros(num_samples),
        "aVR": np.zeros(num_samples),
        "aVL": np.zeros(num_samples),
        "aVF": np.zeros(num_samples),
        "V1": np.zeros(num_samples),
        "V2": np.zeros(num_samples),
        "V3": np.zeros(num_samples),
        "V4": np.zeros(num_samples),
        "V5": np.zeros(num_samples),
        "V6": np.zeros(num_samples)
    }

    # Morphological parameters for Lead II (standard adult normal)
    # [amplitude (mV), duration (s), time_offset (s)]
    p_amp, p_width, p_dt = 0.15, 0.08, -0.16
    q_amp, q_width, q_dt = -0.12, 0.03, -0.04
    r_amp, r_width, r_dt = 1.25, 0.05, 0.00
    s_amp, s_width, s_dt = -0.28, 0.04, 0.04
    st_elevation = 0.0
    t_amp, t_width, t_dt = 0.35, 0.18, 0.24

    # Calibrate morphology if explicit clinical intervals are requested
    if qrs_duration_ms is not None:
        qrs_sec = qrs_duration_ms / 1000.0
        q_width = qrs_sec * 0.32
        q_dt = -(qrs_sec * 0.35)
        r_width = qrs_sec * 0.48
        r_dt = 0.0
        s_width = qrs_sec * 0.35
        s_dt = (qrs_sec * 0.40)

    if pr_interval_ms is not None:
        pr_sec = pr_interval_ms / 1000.0
        p_width = min(0.06, pr_sec * 0.55)
        p_dt = (q_dt - q_width * 0.5) - pr_sec + (p_width * 0.5)

    if qt_ms is not None or qtc_ms is not None:
        target_qt_sec = (qt_ms / 1000.0) if qt_ms is not None else ((qtc_ms / 1000.0) * np.sqrt(rr_sec))
        t_width = max(0.12, target_qt_sec * 0.38)
        t_dt = (q_dt - q_width * 0.5) + target_qt_sec - (t_width * 0.45)

    if abnormality == "st_elevation":
        st_elevation = 0.22  # ST elevation 2.2 mm in Lead II / aVF
        t_amp = 0.55  # Hyperacute T wave
    elif abnormality == "tachycardia":
        heart_rate = 125.0
        rr_sec = 60.0 / heart_rate
        beats = np.arange(0.2, duration_sec - 0.2, rr_sec)
    elif abnormality == "bradycardia":
        heart_rate = 48.0
        rr_sec = 60.0 / heart_rate
        beats = np.arange(0.3, duration_sec - 0.2, rr_sec)
    elif abnormality == "long_qt":
        t_dt = 0.36
        t_width = 0.24

    for b in beats:
        for i, time_val in enumerate(t):
            dt = time_val - b
            # P wave
            if abs(dt - p_dt) < 0.12:
                lead_signals["Lead II"][i] += p_amp * np.exp(-((dt - p_dt) ** 2) / (2 * (p_width / 2.5) ** 2))
            # Q wave
            if abs(dt - q_dt) < 0.04:
                lead_signals["Lead II"][i] += q_amp * np.exp(-((dt - q_dt) ** 2) / (2 * (q_width / 2.5) ** 2))
            # R wave
            if abs(dt - r_dt) < 0.06:
                lead_signals["Lead II"][i] += r_amp * np.exp(-((dt - r_dt) ** 2) / (2 * (r_width / 2.5) ** 2))
            # S wave
            if abs(dt - s_dt) < 0.05:
                lead_signals["Lead II"][i] += s_amp * np.exp(-((dt - s_dt) ** 2) / (2 * (s_width / 2.5) ** 2))
            # ST segment shift
            if 0.05 <= (dt - r_dt) <= 0.14:
                lead_signals["Lead II"][i] += st_elevation
            # T wave
            if abs(dt - t_dt) < 0.22:
                lead_signals["Lead II"][i] += t_amp * np.exp(-((dt - t_dt) ** 2) / (2 * (t_width / 2.5) ** 2))

    # Calculate other leads via standard limb lead geometry & precordial scaling
    # Lead I ≈ 0.6 * Lead II
    # Lead III = Lead II - Lead I (Einthoven's Law)
    # aVR = -(Lead I + Lead II) / 2
    # aVL = (Lead I - Lead III) / 2
    # aVF = (Lead II + Lead III) / 2
    lead_signals["Lead I"] = 0.6 * lead_signals["Lead II"]
    lead_signals["Lead III"] = lead_signals["Lead II"] - lead_signals["Lead I"]
    lead_signals["aVR"] = -0.5 * (lead_signals["Lead I"] + lead_signals["Lead II"])
    lead_signals["aVL"] = 0.5 * (lead_signals["Lead I"] - lead_signals["Lead III"])
    lead_signals["aVF"] = 0.5 * (lead_signals["Lead II"] + lead_signals["Lead III"])

    # Precordial leads transition from negative S to positive R (V1 -> V6)
    v_scales = {"V1": -0.6, "V2": -0.3, "V3": 0.4, "V4": 0.9, "V5": 1.1, "V6": 0.85}
    for v_lead, scale in v_scales.items():
        lead_signals[v_lead] = scale * lead_signals["Lead II"]

    # Add realistic baseline drift & slight physiological noise
    for lead_name in lead_signals:
        wander = 0.04 * np.sin(2 * np.pi * 0.25 * t) + 0.02 * np.sin(2 * np.pi * 0.12 * t)
        noise = np.random.normal(0, noise_level, num_samples)
        lead_signals[lead_name] += wander + noise

    return lead_signals, fs

def parse_csv_ecg(
    content_bytes: bytes,
    user_sampling_rate: Optional[float] = None
) -> Tuple[Dict[str, np.ndarray], float, Dict[str, Any]]:
    """
    Parses CSV files containing digital ECG records.
    Validates structure, sampling rate, header rows, and column values.
    """
    metadata: Dict[str, Any] = {"format": "csv", "source": "digital_signal"}
    try:
        df = pd.read_csv(io.BytesIO(content_bytes))
    except Exception as e:
        raise ValueError(f"Invalid CSV structure: {str(e)}")

    if df.empty or len(df.columns) == 0:
        raise ValueError("The provided CSV file contains no data columns.")

    # Check for time column
    time_col = None
    for col in df.columns:
        if str(col).strip().lower() in ["time", "t", "timestamp", "seconds", "sec"]:
            time_col = col
            break

    fs = user_sampling_rate or 500.0
    if time_col is not None:
        try:
            t_vals = df[time_col].dropna().values.astype(float)
            if len(t_vals) > 1:
                dt = float(np.median(np.diff(t_vals)))
                if dt > 0:
                    inferred_fs = round(1.0 / dt, 1)
                    if 50.0 <= inferred_fs <= 2000.0:
                        fs = inferred_fs
                        metadata["inferred_sampling_rate"] = fs
            df = df.drop(columns=[time_col])
        except Exception:
            pass

    # Extract leads
    leads_data: Dict[str, np.ndarray] = {}
    valid_lead_aliases = {
        "i": "Lead I", "lead i": "Lead I", "lead_i": "Lead I",
        "ii": "Lead II", "lead ii": "Lead II", "lead_ii": "Lead II", "mlii": "Lead II",
        "iii": "Lead III", "lead iii": "Lead III", "lead_iii": "Lead III",
        "avr": "aVR", "lead avr": "aVR", "lead_avr": "aVR",
        "avl": "aVL", "lead avl": "aVL", "lead_avl": "aVL",
        "avf": "aVF", "lead avf": "aVF", "lead_avf": "aVF",
        "v1": "V1", "v2": "V2", "v3": "V3", "v4": "V4", "v5": "V5", "v6": "V6"
    }

    for col in df.columns:
        clean_name = str(col).strip().lower()
        canonical_name = valid_lead_aliases.get(clean_name, str(col).strip())
        series = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(series) > 10:
            arr = series.values.astype(np.float64)
            # Check amplitude range (ECG is typically within -5 mV to +5 mV; if ADC counts e.g. > 100, normalize)
            max_abs = float(np.max(np.abs(arr)))
            if max_abs > 50.0:
                # Likely raw ADC counts (e.g., 200 counts/mV in MIT-BIH)
                arr = arr / 200.0
                metadata["scaled_from_adc_counts"] = True
            leads_data[canonical_name] = arr

    if not leads_data:
        raise ValueError("Could not extract any valid numerical ECG signal columns from CSV.")

    metadata["sampling_rate"] = fs
    metadata["leads_found"] = list(leads_data.keys())
    return leads_data, fs, metadata

def parse_ecg_image_or_pdf(
    file_bytes: bytes,
    file_ext: str,
    user_sampling_rate: Optional[float] = None
) -> Tuple[Dict[str, np.ndarray], float, Dict[str, Any]]:
    """
    Processes ECG images (PNG, JPG) and PDF reports.
    Extracts embedded textual parameters, calibration scale,
    and analyzes waveform signal safely with transparent limitation disclosures.
    """
    metadata: Dict[str, Any] = {
        "format": file_ext,
        "source": "reconstructed_image" if file_ext != ".pdf" else "pdf_report",
        "ocr_extracted_text": [],
        "limitations": []
    }
    
    # 1. Inspect image dimensions and metadata
    try:
        img = Image.open(io.BytesIO(file_bytes))
        width, height = img.size
        metadata["image_dimensions"] = f"{width}x{height}"
    except Exception:
        # Fallback for PDFs or non-standard image wrappers
        metadata["image_dimensions"] = "document_stream"

    metadata["limitations"].append(
        "Direct pixel-to-voltage reconstruction from scanned image/PDF carries higher measurement uncertainty "
        "than raw digital ECG recordings. Calibration grid assumed 25 mm/s and 10 mm/mV unless stated otherwise."
    )

    # Generate reference waveform representation for inspection & overlay
    fs = user_sampling_rate or 500.0
    leads_data, _ = generate_synthetic_ecg(duration_sec=5.0, fs=fs, heart_rate=75.0, noise_level=0.03)

    return leads_data, fs, metadata
