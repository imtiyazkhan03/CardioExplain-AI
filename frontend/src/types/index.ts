export interface ECGMeasurement {
  name: string;
  code: string;
  value: number | null;
  unit: string;
  lead: string;
  reference_min?: number;
  reference_max?: number;
  reference_text: string;
  status: 'normal' | 'borderline' | 'abnormal' | 'unmeasurable';
  method: string;
  confidence: number;
  provenance: string;
  reason_unavailable?: string;
}

export interface SignalQuality {
  snr_db: number;
  baseline_wander_score: number;
  noise_score: number;
  clipping_detected: boolean;
  flatline_detected: boolean;
  rating: 'high' | 'moderate' | 'low' | 'unacceptable';
  lead_qualities: Record<string, number>;
  notes: string[];
}

export interface MLPrediction {
  condition: string;
  probability: number;
  confidence_level: 'low' | 'moderate' | 'high';
  calibrated: boolean;
}

export interface MLResult {
  status: 'ready' | 'not_trained' | 'unsupported_input' | 'error';
  model_name: string;
  model_version: string;
  predictions: MLPrediction[];
  top_prediction?: string;
  top_probability?: number;
  limitations: string[];
  details?: string;
}

export interface ClinicalFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'normal' | 'note' | 'abnormal' | 'urgent';
  evidence: string;
  source: string;
  requires_prompt_evaluation: boolean;
  alternative_explanations: string[];
}

export interface CardioExplanation {
  overall_summary: string;
  wave_by_wave: Array<{
    wave: string;
    role: string;
    measured_status: string;
    value: string;
    clinical_meaning: string;
    limitations: string;
  }>;
  interval_analysis: Array<{
    name: string;
    code: string;
    measured: string;
    reference: string;
    status: string;
    interpretation: string;
  }>;
  lead_by_lead_summary: string[];
  ml_explanation: string;
  possible_clinical_significance: string[];
  suggested_next_steps: string[];
  limitations: string[];
  urgent_flags: string[];
  generator: string;
  image_details?: ImageAnalysisDetails;
}

export interface ImageAnalysisDetails {
  is_image: boolean;
  image_url?: string;
  dimensions: string;
  aspect_ratio: string;
  estimated_dpi: number;
  sharpness_score: number;
  detected_grid_type: string;
  grid_confidence: number;
  detected_layout: string;
  calibration_pulse_detected: boolean;
  calibration_voltage_scale: string;
  calibration_time_scale: string;
  waveform_extraction_confidence: number;
  printed_header_extracted?: boolean;
  printed_heart_rate?: number;
  printed_rr_interval?: number;
  printed_pr_interval?: number;
  printed_qrs_duration?: number;
  printed_qtc?: number;
  printed_qt?: number;
  printed_diagnosis?: string;
  ocr_raw_text?: string;
  optical_limitations: string[];
  clinical_visual_assessment: string;
}

export interface AnalysisRecord {
  id: string;
  created_at: string;
  filename: string;
  file_type: string;
  status: string;
  patient_age?: number;
  patient_sex?: string;
  sampling_rate: number;
  duration_seconds: number;
  num_leads: number;
  lead_names: string[];
  quality: SignalQuality;
  measurements: ECGMeasurement[];
  findings: ClinicalFinding[];
  ml_results: Record<string, MLResult>;
  explanation: CardioExplanation;
  image_details?: ImageAnalysisDetails;
  has_report: boolean;
  has_urgent_findings: boolean;
}


export interface WaveformLeadData {
  lead_name: string;
  sampling_rate: number;
  time: number[];
  voltage: number[];
  p_peaks: number[];
  r_peaks: number[];
  t_peaks: number[];
  q_onsets: number[];
  s_offsets: number[];
}
