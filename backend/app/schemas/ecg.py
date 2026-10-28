from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ECGMeasurement(BaseModel):
    name: str
    code: str
    value: Optional[float] = None
    unit: str
    lead: str = "Lead II"
    reference_min: Optional[float] = None
    reference_max: Optional[float] = None
    reference_text: str = ""
    status: str = "normal"  # normal, borderline, abnormal, unmeasurable
    method: str = "automated_delineation"
    confidence: float = 1.0
    provenance: str = "digital_signal"  # digital_signal, reconstructed_image, ocr_extracted
    reason_unavailable: Optional[str] = None

class SignalQuality(BaseModel):
    snr_db: float = 0.0
    baseline_wander_score: float = 0.0
    noise_score: float = 0.0
    clipping_detected: bool = False
    flatline_detected: bool = False
    rating: str = "high"  # high, moderate, low, unacceptable
    lead_qualities: Dict[str, float] = {}
    notes: List[str] = []

class MLPrediction(BaseModel):
    condition: str
    probability: float
    confidence_level: str  # low, moderate, high
    calibrated: bool = False

class MLResult(BaseModel):
    status: str  # "ready", "not_trained", "unsupported_input"
    model_name: str
    model_version: str
    predictions: List[MLPrediction] = []
    top_prediction: Optional[str] = None
    top_probability: Optional[float] = None
    limitations: List[str] = []
    details: Optional[str] = None

class ClinicalFinding(BaseModel):
    id: str
    category: str  # Rhythm, Conduction, Repolarization, Morphology, Ischemia
    title: str
    description: str
    severity: str  # normal, note, abnormal, urgent
    evidence: str
    source: str  # direct_measurement, rule_engine, ml_model, ocr_report
    requires_prompt_evaluation: bool = False
    alternative_explanations: List[str] = []

class WaveformLeadData(BaseModel):
    lead_name: str
    sampling_rate: float
    time: List[float]
    voltage: List[float]
    p_peaks: List[int] = []
    r_peaks: List[int] = []
    t_peaks: List[int] = []
    q_onsets: List[int] = []
    s_offsets: List[int] = []
    uncertain_segments: List[Dict[str, int]] = []  # start, end indices of noisy regions

class ExplanationSection(BaseModel):
    title: str
    content: str
    bullet_points: List[str] = []

class ImageAnalysisDetails(BaseModel):
    is_image: bool = False
    image_url: Optional[str] = None
    dimensions: str = "N/A"
    aspect_ratio: str = "N/A"
    estimated_dpi: int = 300
    sharpness_score: float = 0.0
    detected_grid_type: str = "Standard Pink/Red 1mm x 5mm Grid"
    grid_confidence: float = 0.0
    detected_layout: str = "Standard 12-Lead (3x4 Matrix with Rhythm Strip)"
    calibration_pulse_detected: bool = True
    calibration_voltage_scale: str = "10 mm/mV (Standard)"
    calibration_time_scale: str = "25 mm/s (Standard)"
    waveform_extraction_confidence: float = 0.0
    printed_header_extracted: bool = False
    printed_heart_rate: Optional[float] = None
    printed_rr_interval: Optional[float] = None
    printed_pr_interval: Optional[float] = None
    printed_qrs_duration: Optional[float] = None
    printed_qtc: Optional[float] = None
    printed_qt: Optional[float] = None
    printed_diagnosis: Optional[str] = None
    ocr_raw_text: Optional[str] = None
    optical_limitations: List[str] = []
    clinical_visual_assessment: str = ""

class CardioExplanation(BaseModel):
    overall_summary: str
    wave_by_wave: List[Dict[str, Any]]
    interval_analysis: List[Dict[str, Any]]
    lead_by_lead_summary: List[str]
    ml_explanation: str
    possible_clinical_significance: List[str]
    suggested_next_steps: List[str]
    limitations: List[str]
    urgent_flags: List[str] = []
    generator: str = "deterministic_clinical_engine"  # or llm provider
    image_details: Optional[ImageAnalysisDetails] = None


class AnalysisRecordResponse(BaseModel):
    id: str
    created_at: str
    filename: str
    file_type: str
    status: str  # completed, failed, partial
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    sampling_rate: float
    duration_seconds: float
    num_leads: int
    lead_names: List[str]
    quality: SignalQuality
    measurements: List[ECGMeasurement]
    findings: List[ClinicalFinding]
    ml_results: Dict[str, MLResult]
    explanation: CardioExplanation
    image_details: Optional[ImageAnalysisDetails] = None
    image_url: Optional[str] = None
    has_report: bool = False
    has_urgent_findings: bool = False

