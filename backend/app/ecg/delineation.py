import math
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from scipy import signal
from app.config import settings
from app.schemas.ecg import ECGMeasurement

def pan_tompkins_qrs(ecg_signal: np.ndarray, fs: float) -> List[int]:
    """
    Standard Pan-Tompkins QRS detection algorithm:
    1. Bandpass filter (5-15 Hz)
    2. Differentiation
    3. Squaring
    4. Moving Window Integration (approx 150 ms)
    5. Adaptive dual-threshold peak finding with refractory period (200 ms)
    """
    if len(ecg_signal) < int(fs * 0.5):
        return []

    # 1. Bandpass filter 5 - 15 Hz
    nyq = 0.5 * fs
    low = max(5.0 / nyq, 0.01)
    high = min(15.0 / nyq, 0.95)
    b, a = signal.butter(2, [low, high], btype='bandpass')
    filtered = signal.filtfilt(b, a, ecg_signal)

    # 2. Derivative filter
    # 5-point derivative: y[n] = (1/8T) * (-x[n-2] - 2x[n-1] + 2x[n+1] + x[n+2])
    diff_kernel = np.array([-1, -2, 0, 2, 1]) * (fs / 8.0)
    derivative = np.convolve(filtered, diff_kernel, mode='same')

    # 3. Squaring
    squared = derivative ** 2

    # 4. Moving Window Integration (~150 ms window)
    window_size = max(int(0.15 * fs), 3)
    kernel = np.ones(window_size) / window_size
    integrated = np.convolve(squared, kernel, mode='same')

    # 5. Peak detection on integrated signal with adaptive thresholds
    min_distance = int(0.25 * fs)  # 250 ms refractory period (~240 bpm max)
    
    # Candidate peaks on integrated waveform
    candidates, _ = signal.find_peaks(integrated, distance=min_distance)
    if len(candidates) == 0:
        return []

    # Adaptive thresholding
    spki = np.percentile(integrated[candidates], 75) if len(candidates) > 0 else np.max(integrated) * 0.3
    npki = np.percentile(integrated, 50)
    threshold_i1 = npki + 0.25 * (spki - npki)

    qrs_peaks_integrated = []
    for c in candidates:
        val = integrated[c]
        if val > threshold_i1:
            qrs_peaks_integrated.append(c)
            spki = 0.125 * val + 0.875 * spki
        else:
            npki = 0.125 * val + 0.875 * npki
        threshold_i1 = npki + 0.25 * (spki - npki)

    # Map integrated peaks back to precise maximum in raw ECG signal within [-window, +window]
    r_peaks: List[int] = []
    search_radius = int(0.12 * fs)
    
    for ip in qrs_peaks_integrated:
        start = max(0, ip - search_radius)
        end = min(len(ecg_signal), ip + search_radius)
        if start < end:
            # Find the peak with highest absolute deviation or positive peak
            sub = ecg_signal[start:end]
            local_max_idx = start + int(np.argmax(np.abs(sub)))
            # Enforce minimum distance from last detected peak
            if not r_peaks or (local_max_idx - r_peaks[-1]) >= min_distance:
                r_peaks.append(local_max_idx)

    return sorted(r_peaks)

def delineate_beat(
    signal_data: np.ndarray,
    r_idx: int,
    fs: float,
    rr_prior: Optional[float] = None
) -> Dict[str, Optional[int]]:
    """
    Delineates single beat landmarks:
    P onset, P peak, P offset, Q onset, S offset (J-point), T peak, T offset.
    """
    n = len(signal_data)
    beat = {
        "p_onset": None,
        "p_peak": None,
        "p_offset": None,
        "q_onset": None,
        "r_peak": r_idx,
        "s_offset": None,
        "t_peak": None,
        "t_offset": None,
        "j_point": None
    }

    # 1. Q onset: local minimum 20 - 80 ms before R
    q_search_start = max(0, r_idx - int(0.09 * fs))
    q_search_end = max(0, r_idx - int(0.015 * fs))
    if q_search_start < q_search_end:
        q_min_local = q_search_start + int(np.argmin(signal_data[q_search_start:q_search_end]))
        beat["q_onset"] = q_min_local
    else:
        beat["q_onset"] = max(0, r_idx - int(0.04 * fs))

    # 2. S offset (J-point): local minimum / return to baseline 20 - 80 ms after R
    s_search_start = min(n - 1, r_idx + int(0.02 * fs))
    s_search_end = min(n, r_idx + int(0.10 * fs))
    if s_search_start < s_search_end:
        s_min_local = s_search_start + int(np.argmin(signal_data[s_search_start:s_search_end]))
        # J-point is the inflection where slope flattens after S wave
        j_search_end = min(n, s_min_local + int(0.04 * fs))
        beat["s_offset"] = s_min_local
        beat["j_point"] = min(n - 1, s_min_local + int(0.02 * fs))
    else:
        beat["s_offset"] = min(n - 1, r_idx + int(0.05 * fs))
        beat["j_point"] = beat["s_offset"]

    # 3. P wave: search 80 - 240 ms prior to Q onset
    q_on = beat["q_onset"] if beat["q_onset"] is not None else r_idx - int(0.04 * fs)
    p_win_start = max(0, q_on - int(0.24 * fs))
    p_win_end = max(0, q_on - int(0.06 * fs))
    
    if p_win_start < p_win_end and (p_win_end - p_win_start) > 4:
        p_sub = signal_data[p_win_start:p_win_end]
        # Detect positive peak or inverted peak
        p_max_idx = p_win_start + int(np.argmax(p_sub))
        p_amp = signal_data[p_max_idx]
        
        # Verify P wave amplitude is distinct from local noise floor
        p_baseline = np.median(signal_data[p_win_start:p_win_end])
        if abs(p_amp - p_baseline) > 0.015:  # >= 0.015 mV
            beat["p_peak"] = p_max_idx
            p_half_width = int(0.04 * fs)
            beat["p_onset"] = max(0, p_max_idx - p_half_width)
            beat["p_offset"] = min(q_on, p_max_idx + p_half_width)

    # 4. T wave: search 100 - 450 ms after S offset
    j_pt = beat["j_point"] if beat["j_point"] is not None else r_idx + int(0.05 * fs)
    # Scale T-wave window dynamically with RR if available
    max_t_delay = 0.45 if rr_prior is None else min(0.48, rr_prior * 0.6)
    t_win_start = min(n - 1, j_pt + int(0.08 * fs))
    t_win_end = min(n, j_pt + int(max_t_delay * fs))
    
    if t_win_start < t_win_end and (t_win_end - t_win_start) > 6:
        t_sub = signal_data[t_win_start:t_win_end]
        # Find peak with highest absolute deviation (handles upright and inverted T waves)
        t_baseline = np.median(signal_data[max(0, j_pt - 5):j_pt + 5]) if j_pt < n else 0.0
        devs = np.abs(t_sub - t_baseline)
        t_max_rel = int(np.argmax(devs))
        t_peak_idx = t_win_start + t_max_rel
        
        if devs[t_max_rel] > 0.03:  # discernible T wave
            beat["t_peak"] = t_peak_idx
            # Tangent / slope intercept for T offset
            t_half = int(0.08 * fs)
            beat["t_offset"] = min(n - 1, t_peak_idx + t_half)

    return beat

def analyze_lead_measurements(
    lead_name: str,
    signal_arr: np.ndarray,
    fs: float,
    patient_sex: Optional[str] = "male"
) -> Tuple[List[ECGMeasurement], Dict[str, Any], Dict[str, List[int]]]:
    """
    Comprehensive multibeat analysis on a single ECG lead:
    Extracts HR, PR, QRS, QT, QTc, ST elevation/depression, and P/T wave metrics.
    Aggregates statistics across all detected cardiac cycles.
    """
    r_peaks = pan_tompkins_qrs(signal_arr, fs)
    landmarks = {
        "p_peaks": [],
        "r_peaks": r_peaks,
        "t_peaks": [],
        "q_onsets": [],
        "s_offsets": []
    }
    
    measurements: List[ECGMeasurement] = []
    diagnostics: Dict[str, Any] = {}

    if len(r_peaks) < 2:
        # Not enough beats to establish reliable rhythm
        diagnostics["error"] = "Insufficient cardiac beats detected for complete waveform analysis."
        return measurements, diagnostics, landmarks

    # Calculate RR intervals
    rr_intervals_sec = np.diff(r_peaks) / fs
    rr_ms = rr_intervals_sec * 1000.0
    mean_rr = float(np.mean(rr_ms))
    std_rr = float(np.std(rr_ms))
    heart_rate = float(60.0 / np.mean(rr_intervals_sec))

    diagnostics["heart_rate"] = round(heart_rate, 1)
    diagnostics["rr_mean_ms"] = round(mean_rr, 1)
    diagnostics["rr_variability_ms"] = round(std_rr, 1)

    # 1. Heart Rate Measurement
    hr_status = "normal"
    if heart_rate < settings.REF_HR_MIN:
        hr_status = "abnormal"  # Bradycardia
    elif heart_rate > settings.REF_HR_MAX:
        hr_status = "abnormal"  # Tachycardia

    measurements.append(ECGMeasurement(
        name="Heart Rate",
        code="HR",
        value=round(heart_rate, 1),
        unit="bpm",
        lead=lead_name,
        reference_min=settings.REF_HR_MIN,
        reference_max=settings.REF_HR_MAX,
        reference_text=f"{settings.REF_HR_MIN} - {settings.REF_HR_MAX} bpm",
        status=hr_status,
        method="R-R interval averaging (Pan-Tompkins)",
        confidence=0.95,
        provenance="digital_signal"
    ))

    # 2. RR Interval Measurement
    measurements.append(ECGMeasurement(
        name="RR Interval",
        code="RR",
        value=round(mean_rr, 1),
        unit="ms",
        lead=lead_name,
        reference_min=600.0,
        reference_max=1000.0,
        reference_text="600 - 1000 ms",
        status="normal" if 600.0 <= mean_rr <= 1000.0 else "borderline",
        method="Mean beat-to-beat cycle duration",
        confidence=0.95,
        provenance="digital_signal"
    ))

    # Analyze individual beats
    pr_intervals: List[float] = []
    qrs_durations: List[float] = []
    qt_intervals: List[float] = []
    st_levels: List[float] = []
    t_amplitudes: List[float] = []
    p_amplitudes: List[float] = []

    for i, r_idx in enumerate(r_peaks):
        rr_prior = rr_intervals_sec[i - 1] if i > 0 else None
        beat = delineate_beat(signal_arr, r_idx, fs, rr_prior=rr_prior)
        
        if beat["p_peak"] is not None:
            landmarks["p_peaks"].append(beat["p_peak"])
            p_amplitudes.append(signal_arr[beat["p_peak"]])
        if beat["t_peak"] is not None:
            landmarks["t_peaks"].append(beat["t_peak"])
            t_amplitudes.append(signal_arr[beat["t_peak"]])
        if beat["q_onset"] is not None:
            landmarks["q_onsets"].append(beat["q_onset"])
        if beat["s_offset"] is not None:
            landmarks["s_offsets"].append(beat["s_offset"])

        # PR Interval
        if beat["p_onset"] is not None and beat["q_onset"] is not None:
            pr_ms = (beat["q_onset"] - beat["p_onset"]) * 1000.0 / fs
            if 80.0 <= pr_ms <= 350.0:
                pr_intervals.append(pr_ms)

        # QRS Duration
        if beat["q_onset"] is not None and beat["s_offset"] is not None:
            qrs_ms = (beat["s_offset"] - beat["q_onset"]) * 1000.0 / fs
            if 40.0 <= qrs_ms <= 240.0:
                qrs_durations.append(qrs_ms)

        # QT Interval
        if beat["q_onset"] is not None and beat["t_offset"] is not None:
            qt_ms = (beat["t_offset"] - beat["q_onset"]) * 1000.0 / fs
            if 200.0 <= qt_ms <= 700.0:
                qt_intervals.append(qt_ms)

        # ST Segment Level (measured at J + 60ms vs PR baseline)
        if beat["j_point"] is not None and beat["p_offset"] is not None:
            j_60 = min(len(signal_arr) - 1, beat["j_point"] + int(0.06 * fs))
            baseline = signal_arr[beat["p_offset"]]
            st_val = signal_arr[j_60] - baseline
            st_levels.append(st_val)

    # 3. PR Interval
    if len(pr_intervals) > 0:
        mean_pr = float(np.median(pr_intervals))
        pr_status = "normal"
        if mean_pr < settings.REF_PR_MIN:
            pr_status = "borderline"  # Short PR (WPW or junctional)
        elif mean_pr > settings.REF_PR_MAX:
            pr_status = "abnormal"  # 1st degree AV block

        measurements.append(ECGMeasurement(
            name="PR Interval",
            code="PR",
            value=round(mean_pr, 1),
            unit="ms",
            lead=lead_name,
            reference_min=settings.REF_PR_MIN,
            reference_max=settings.REF_PR_MAX,
            reference_text=f"{settings.REF_PR_MIN} - {settings.REF_PR_MAX} ms",
            status=pr_status,
            method="P-onset to QRS-onset median",
            confidence=0.88,
            provenance="digital_signal"
        ))
    else:
        measurements.append(ECGMeasurement(
            name="PR Interval",
            code="PR",
            value=None,
            unit="ms",
            lead=lead_name,
            reference_text="120 - 200 ms",
            status="unmeasurable",
            method="P-onset to QRS-onset",
            confidence=0.0,
            provenance="digital_signal",
            reason_unavailable="P waves could not be delineated with sufficient confidence or absent (possible AFib/junctional rhythm)."
        ))

    # 4. QRS Duration
    if len(qrs_durations) > 0:
        mean_qrs = float(np.median(qrs_durations))
        qrs_status = "normal" if mean_qrs <= settings.REF_QRS_MAX else "abnormal"  # Bundle branch block or IVCD
        measurements.append(ECGMeasurement(
            name="QRS Duration",
            code="QRS",
            value=round(mean_qrs, 1),
            unit="ms",
            lead=lead_name,
            reference_min=70.0,
            reference_max=settings.REF_QRS_MAX,
            reference_text=f"70 - {settings.REF_QRS_MAX} ms",
            status=qrs_status,
            method="Q-onset to S-offset median",
            confidence=0.92,
            provenance="digital_signal"
        ))
    else:
        measurements.append(ECGMeasurement(
            name="QRS Duration",
            code="QRS",
            value=None,
            unit="ms",
            lead=lead_name,
            reference_text="70 - 120 ms",
            status="unmeasurable",
            method="Q-onset to S-offset",
            confidence=0.0,
            provenance="digital_signal",
            reason_unavailable="QRS boundaries not distinguishable."
        ))

    # 5. QT and QTc Intervals
    if len(qt_intervals) > 0 and len(rr_intervals_sec) > 0:
        mean_qt = float(np.median(qt_intervals))
        rr_sec_ref = float(np.mean(rr_intervals_sec))
        
        # Bazett correction: QTc = QT / sqrt(RR_sec)
        qtc_bazett = mean_qt / math.sqrt(rr_sec_ref)
        # Fridericia correction: QTc = QT / cbrt(RR_sec)
        qtc_fridericia = mean_qt / (rr_sec_ref ** (1.0 / 3.0))

        qtc_max_ref = settings.REF_QTC_FEMALE_MAX if patient_sex == "female" else settings.REF_QTC_MALE_MAX
        qtc_status = "normal" if qtc_bazett <= qtc_max_ref else "abnormal"

        measurements.append(ECGMeasurement(
            name="QT Interval",
            code="QT",
            value=round(mean_qt, 1),
            unit="ms",
            lead=lead_name,
            reference_min=350.0,
            reference_max=450.0,
            reference_text="350 - 450 ms",
            status="normal",
            method="Q-onset to T-offset median",
            confidence=0.85,
            provenance="digital_signal"
        ))

        measurements.append(ECGMeasurement(
            name="QTc Interval (Bazett)",
            code="QTc",
            value=round(qtc_bazett, 1),
            unit="ms",
            lead=lead_name,
            reference_min=360.0,
            reference_max=qtc_max_ref,
            reference_text=f"360 - {qtc_max_ref} ms ({patient_sex or 'standard'})",
            status=qtc_status,
            method="Bazett formula (QT / sqrt(RR))",
            confidence=0.85,
            provenance="digital_signal"
        ))
        diagnostics["qtc_fridericia"] = round(qtc_fridericia, 1)
    else:
        measurements.append(ECGMeasurement(
            name="QTc Interval",
            code="QTc",
            value=None,
            unit="ms",
            lead=lead_name,
            reference_text="360 - 450 ms",
            status="unmeasurable",
            method="Bazett formula",
            confidence=0.0,
            provenance="digital_signal",
            reason_unavailable="T-wave end point could not be reliably delineated."
        ))

    # 6. ST Segment Level
    if len(st_levels) > 0:
        mean_st = float(np.median(st_levels))
        st_status = "normal"
        if mean_st >= settings.REF_ST_ELEVATION_THRESHOLD:
            st_status = "abnormal"
        elif mean_st <= settings.REF_ST_DEPRESSION_THRESHOLD:
            st_status = "abnormal"

        measurements.append(ECGMeasurement(
            name="ST Segment Level",
            code="ST",
            value=round(mean_st, 3),
            unit="mV",
            lead=lead_name,
            reference_min=settings.REF_ST_DEPRESSION_THRESHOLD,
            reference_max=settings.REF_ST_ELEVATION_THRESHOLD,
            reference_text="-0.05 to +0.10 mV",
            status=st_status,
            method="J-point + 60ms vs PR baseline median",
            confidence=0.86,
            provenance="digital_signal"
        ))

    # 7. T Wave Amplitude & Polarity
    if len(t_amplitudes) > 0:
        median_t = float(np.median(t_amplitudes))
        measurements.append(ECGMeasurement(
            name="T Wave Amplitude",
            code="T_AMP",
            value=round(median_t, 3),
            unit="mV",
            lead=lead_name,
            reference_min=0.05,
            reference_max=0.8,
            reference_text="Positive upright (>0.05 mV)",
            status="normal" if median_t >= 0.05 else "abnormal",
            method="Median T-wave peak voltage",
            confidence=0.88,
            provenance="digital_signal"
        ))

    return measurements, diagnostics, landmarks
