import numpy as np
from scipy import signal

def remove_baseline_wander(data: np.ndarray, fs: float, cutoff: float = 0.67) -> np.ndarray:
    """
    Remove low-frequency baseline drift (respiration, patient movement)
    using a forward-backward zero-phase Butterworth high-pass filter.
    0.67 Hz cutoff satisfies AHA recommendations (0.05-0.67 Hz) without distorting ST segments.
    """
    if len(data) < int(fs * 2):
        return data - np.median(data)
    
    nyquist = 0.5 * fs
    normal_cutoff = cutoff / nyquist
    if normal_cutoff >= 1.0 or normal_cutoff <= 0:
        return data - np.mean(data)
        
    sos = signal.butter(3, normal_cutoff, btype='highpass', output='sos')
    filtered = signal.sosfiltfilt(sos, data)
    return filtered

def remove_powerline_noise(data: np.ndarray, fs: float, freq: float = 50.0, q: float = 30.0) -> np.ndarray:
    """
    Remove mains electrical interference (50 Hz or 60 Hz) using a digital notch filter.
    """
    nyquist = 0.5 * fs
    if freq >= nyquist:
        return data
        
    w0 = freq / nyquist
    b, a = signal.iirnotch(w0, q)
    filtered = signal.filtfilt(b, a, data)
    return filtered

def remove_high_frequency_noise(data: np.ndarray, fs: float, cutoff: float = 45.0) -> np.ndarray:
    """
    Remove electromyographic (EMG) muscle tremor and high frequency noise.
    Standard clinical diagnostic bandwidth is 0.05 - 40/100 Hz.
    """
    nyquist = 0.5 * fs
    normal_cutoff = min(cutoff / nyquist, 0.95)
    if normal_cutoff <= 0:
        return data
        
    sos = signal.butter(4, normal_cutoff, btype='lowpass', output='sos')
    filtered = signal.sosfiltfilt(sos, data)
    return filtered

def preprocess_ecg_lead(raw_signal: np.ndarray, fs: float, mains_freq: float = 50.0) -> np.ndarray:
    """
    Standard complete ECG preprocessing pipeline:
    1. Check for valid signal length and NaNs
    2. Detrend / zero-phase highpass
    3. Notch filter for powerline hum
    4. Lowpass filter for muscle noise
    """
    sig = np.nan_to_num(raw_signal, nan=0.0)
    
    # 1. High-pass filter for baseline wander
    sig = remove_baseline_wander(sig, fs=fs, cutoff=0.67)
    
    # 2. Notch filter for 50Hz (and 60Hz if applicable)
    sig = remove_powerline_noise(sig, fs=fs, freq=mains_freq)
    if fs >= 130:
        sig = remove_powerline_noise(sig, fs=fs, freq=60.0)
        
    # 3. Low-pass filter
    sig = remove_high_frequency_noise(sig, fs=fs, cutoff=45.0)
    
    return sig
