import numpy as np
from typing import Dict, Any, List
from app.schemas.ecg import SignalQuality

def assess_lead_quality(lead_signal: np.ndarray, fs: float) -> Dict[str, Any]:
    """
    Evaluates signal quality for a single ECG lead.
    Calculates SNR, baseline drift, clipping, and detects disconnected flatlines.
    """
    n = len(lead_signal)
    if n == 0:
        return {
            "snr_db": 0.0,
            "baseline_wander": 1.0,
            "noise": 1.0,
            "clipping": True,
            "flatline": True,
            "score": 0.0,
            "notes": ["Empty signal lead"]
        }
        
    notes = []
    
    # 1. Flatline detection (lead off)
    variance = np.var(lead_signal)
    if variance < 1e-6:
        return {
            "snr_db": 0.0,
            "baseline_wander": 0.0,
            "noise": 0.0,
            "clipping": False,
            "flatline": True,
            "score": 0.0,
            "notes": ["Flatline detected: Lead appears disconnected or zero-amplitude"]
        }
    
    # Check for sustained flatline segments (> 0.5s)
    diff = np.abs(np.diff(lead_signal))
    zero_diff_streak = 0
    max_zero_diff_streak = 0
    streak_thresh = int(fs * 0.4)
    for d in diff:
        if d < 1e-5:
            zero_diff_streak += 1
            if zero_diff_streak > max_zero_diff_streak:
                max_zero_diff_streak = zero_diff_streak
        else:
            zero_diff_streak = 0
            
    is_flatline = max_zero_diff_streak >= streak_thresh
    if is_flatline:
        notes.append("Intermittent flatline or electrode detachment detected")

    # 2. Clipping detection (ADC saturation)
    min_val, max_val = np.min(lead_signal), np.max(lead_signal)
    clipped_top = np.sum(lead_signal >= (max_val - 1e-4))
    clipped_bot = np.sum(lead_signal <= (min_val + 1e-4))
    is_clipped = (clipped_top > 15) or (clipped_bot > 15)
    if is_clipped:
        notes.append("Amplitude clipping / saturation detected")

    # 3. Baseline drift assessment
    # Ratio of low frequency energy (< 0.6 Hz) to total energy
    fft_vals = np.abs(np.fft.rfft(lead_signal - np.mean(lead_signal)))
    freqs = np.fft.rfftfreq(n, 1.0 / fs)
    
    total_energy = np.sum(fft_vals ** 2) + 1e-9
    low_freq_mask = freqs < 0.6
    baseline_energy = np.sum(fft_vals[low_freq_mask] ** 2)
    baseline_ratio = float(baseline_energy / total_energy)

    # 4. High-frequency noise assessment (> 45 Hz)
    high_freq_mask = freqs > 45.0
    high_energy = np.sum(fft_vals[high_freq_mask] ** 2)
    noise_ratio = float(high_energy / total_energy)

    # 5. QRS band energy (0.6 - 40 Hz) as signal of interest
    qrs_band_mask = (freqs >= 0.6) & (freqs <= 40.0)
    signal_energy = np.sum(fft_vals[qrs_band_mask] ** 2)
    noise_floor = baseline_energy + high_energy + 1e-9
    snr_db = float(10 * np.log10(signal_energy / noise_floor))

    # Overall lead score from 0.0 to 1.0
    score = 1.0
    if is_flatline:
        score -= 0.6
    if is_clipped:
        score -= 0.3
    if baseline_ratio > 0.4:
        score -= 0.2
        notes.append("Significant respiratory baseline wander")
    if noise_ratio > 0.3:
        score -= 0.2
        notes.append("High-frequency muscle artifact present")
        
    score = max(0.0, min(1.0, score))
    
    return {
        "snr_db": round(snr_db, 2),
        "baseline_wander": round(baseline_ratio, 3),
        "noise": round(noise_ratio, 3),
        "clipping": is_clipped,
        "flatline": is_flatline,
        "score": round(score, 3),
        "notes": notes
    }

def assess_multilead_quality(leads_data: Dict[str, np.ndarray], fs: float) -> SignalQuality:
    """
    Evaluates multichannel quality across all available ECG leads.
    """
    lead_scores = {}
    all_notes: List[str] = []
    snrs: List[float] = []
    baseline_wanders: List[float] = []
    noise_scores: List[float] = []
    any_clipping = False
    any_flatline = False
    
    for lead_name, signal_arr in leads_data.items():
        q = assess_lead_quality(signal_arr, fs)
        lead_scores[lead_name] = q["score"]
        snrs.append(q["snr_db"])
        baseline_wanders.append(q["baseline_wander"])
        noise_scores.append(q["noise"])
        if q["clipping"]:
            any_clipping = True
        if q["flatline"]:
            any_flatline = True
        for note in q["notes"]:
            if f"{lead_name}: {note}" not in all_notes:
                all_notes.append(f"{lead_name}: {note}")

    avg_score = float(np.mean(list(lead_scores.values()))) if lead_scores else 0.0
    avg_snr = float(np.mean(snrs)) if snrs else 0.0
    avg_bw = float(np.mean(baseline_wanders)) if baseline_wanders else 0.0
    avg_noise = float(np.mean(noise_scores)) if noise_scores else 0.0
    
    if avg_score >= 0.8:
        rating = "high"
    elif avg_score >= 0.55:
        rating = "moderate"
    elif avg_score >= 0.3:
        rating = "low"
    else:
        rating = "unacceptable"

    return SignalQuality(
        snr_db=round(avg_snr, 2),
        baseline_wander_score=round(avg_bw, 3),
        noise_score=round(avg_noise, 3),
        clipping_detected=any_clipping,
        flatline_detected=any_flatline,
        rating=rating,
        lead_qualities=lead_scores,
        notes=all_notes
    )
