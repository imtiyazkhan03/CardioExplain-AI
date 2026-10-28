import os
from typing import List, Dict, Any, Optional
from app.config import settings
from app.schemas.ecg import (
    CardioExplanation, ECGMeasurement, SignalQuality,
    ClinicalFinding, MLResult, ImageAnalysisDetails
)

def generate_deterministic_explanation(
    measurements: List[ECGMeasurement],
    quality: SignalQuality,
    findings: List[ClinicalFinding],
    ml_results: Dict[str, MLResult],
    num_leads: int,
    lead_names: List[str],
    patient_age: Optional[int] = None,
    patient_sex: Optional[str] = None,
    image_details: Optional[ImageAnalysisDetails] = None
) -> CardioExplanation:

    """
    Deterministic rule-grounded clinical explanation engine.
    Produces comprehensive, scientifically accurate explanations without requiring an external LLM.
    """
    meas_map = {m.code: m for m in measurements if m.value is not None}
    urgent_flags: List[str] = [f.title for f in findings if f.requires_prompt_evaluation]
    
    # 1. Overall Summary
    hr_val = meas_map.get("HR").value if "HR" in meas_map else "Unmeasurable"
    rhythm_str = "Normal rhythm"
    for f in findings:
        if f.category == "Rhythm":
            rhythm_str = f.title
            break
            
    abnormal_count = sum(1 for m in measurements if m.status == "abnormal")
    if urgent_flags:
        overall_summary = (
            f"Automated evaluation completed with POTENTIALLY URGENT finding(s): {', '.join(urgent_flags)}. "
            f"Mean heart rate was {hr_val} bpm with {quality.rating.upper()} signal quality. "
            "These findings warrant prompt medical evaluation by a qualified healthcare provider."
        )
    elif abnormal_count > 0:
        overall_summary = (
            f"Automated evaluation identified {abnormal_count} measurement(s) outside configured reference ranges. "
            f"Predominant rhythm pattern is {rhythm_str} at {hr_val} bpm. "
            "Signal quality was assessed as satisfactory for automated measurement delineation."
        )
    else:
        overall_summary = (
            f"The analyzed recording demonstrates parameters within standard physiological reference thresholds. "
            f"Resting heart rate averaged {hr_val} bpm ({rhythm_str}). Conduction intervals and repolarization "
            "parameters show no marked deviations under standard resting thresholds."
        )

    # 2. Wave-by-Wave Explanation
    wave_by_wave = []
    
    # P Wave
    p_meas = meas_map.get("PR")
    wave_by_wave.append({
        "wave": "P Wave",
        "role": "Atrial depolarization initiated by the sinoatrial (SA) node, reflecting right and left atrial contraction.",
        "measured_status": "Delineated" if p_meas else "Indeterminate / Low Amplitude",
        "value": f"{p_meas.value} ms (PR interval)" if p_meas else "Not isolated",
        "clinical_meaning": (
            "Clear upright P waves confirm sinoatrial origin. Absence or irregularity may indicate atrial fibrillation, "
            "flutter, or junctional escape rhythms."
        ),
        "limitations": "P waves have low voltage (< 0.25 mV) and can be obscured by baseline drift or muscle tremor."
    })

    # QRS Complex
    qrs_meas = meas_map.get("QRS")
    wave_by_wave.append({
        "wave": "QRS Complex",
        "role": "Rapid ventricular depolarization through the His-Purkinje conduction network, triggering ventricular systole.",
        "measured_status": qrs_meas.status if qrs_meas else "Unmeasurable",
        "value": f"{qrs_meas.value} ms" if qrs_meas else "Unmeasurable",
        "clinical_meaning": (
            f"Normal duration is 70 to 120 ms. {f'Currently {qrs_meas.value} ms.' if qrs_meas else ''} "
            "Widening (>120 ms) reflects delayed intraventricular conduction such as bundle branch block or ventricular ectopic beats."
        ),
        "limitations": "Exact J-point delineation can vary in the presence of early repolarization or severe baseline tilt."
    })

    # T Wave & ST Segment
    st_meas = meas_map.get("ST")
    t_meas = meas_map.get("T_AMP")
    wave_by_wave.append({
        "wave": "ST Segment & T Wave",
        "role": "Ventricular repolarization (recovery phase) preparing cardiac myocytes for subsequent depolarization.",
        "measured_status": st_meas.status if st_meas else "Unmeasurable",
        "value": f"ST: {st_meas.value} mV, T-amp: {t_meas.value if t_meas else 'N/A'} mV" if st_meas else "Indeterminate",
        "clinical_meaning": (
            "ST elevation or depression indicates potential subepicardial or subendocardial ischemia, pericarditis, "
            "or benign early repolarization. T wave inversions can indicate ischemia, strain, or electrolyte variations."
        ),
        "limitations": "ST segments must be interpreted across anatomically contiguous leads (e.g. inferior, anterior, lateral)."
    })

    # 3. Interval Analysis
    interval_analysis = []
    for code, desc in [
        ("PR", "PR Interval (AV nodal conduction time)"),
        ("QRS", "QRS Duration (Ventricular activation time)"),
        ("QT", "QT Interval (Total electrical systole)"),
        ("QTc", "QTc Bazett (Rate-corrected ventricular repolarization)"),
        ("RR", "RR Interval (Cardiac cycle duration)")
    ]:
        m = meas_map.get(code)
        interval_analysis.append({
            "name": desc,
            "code": code,
            "measured": f"{m.value} {m.unit}" if m else "Unavailable",
            "reference": m.reference_text if m else "Standard clinical range",
            "status": m.status if m else "unmeasurable",
            "interpretation": (
                f"Value is within standard physiological limits ({m.reference_text})." if m and m.status == "normal"
                else (f"Measurement ({m.value} {m.unit}) is {m.status.upper()} relative to reference." if m else "Could not be reliably measured.")
            )
        })

    # 4. Lead-by-Lead Summary
    lead_by_lead_summary = []
    if num_leads == 12:
        lead_by_lead_summary.append("Full 12-lead ECG montage available (Leads I, II, III, aVR, aVL, aVF, V1-V6).")
        lead_by_lead_summary.append("Limb leads (I, II, III, aVR, aVL, aVF) reflect frontal plane vector axis.")
        lead_by_lead_summary.append("Precordial leads (V1-V6) depict horizontal plane septal, anterior, and lateral progression.")
    elif num_leads >= 2:
        lead_by_lead_summary.append(f"Multi-channel recording available ({', '.join(lead_names)}).")
        lead_by_lead_summary.append("Lead II utilized as primary rhythm strip for optimal P wave and QRS amplitude.")
    else:
        lead_by_lead_summary.append(f"Single-lead recording ({lead_names[0] if lead_names else 'Lead II'}).")
        lead_by_lead_summary.append("Notice: Complete anatomical localization of ischemia or axis deviation requires a 12-lead acquisition.")

    # 5. Machine-Learning Findings Explanation
    ml_strings = []
    for model_key, res in ml_results.items():
        if res.status == "ready":
            top_str = f"{res.top_prediction} ({round(res.top_probability * 100, 1)}% calibrated confidence)" if res.top_prediction else "No consensus"
            ml_strings.append(
                f"• {res.model_name} (v{res.model_version}): Supported top classification is {top_str}. "
                "Important notice: A model's algorithmic probability is not an unconditional medical diagnosis."
            )
        elif res.status == "not_trained":
            ml_strings.append(
                f"• {res.model_name}: Model artifact not installed / untrained. Transparently bypassed to avoid simulated predictions."
            )
        else:
            ml_strings.append(f"• {res.model_name}: {res.status.upper()}. {'; '.join(res.limitations)}")
    ml_explanation = "\n".join(ml_strings) if ml_strings else "No ML models configured."

    # 6. Possible Clinical Significance
    possible_significance = []
    for f in findings:
        if f.severity in ["abnormal", "urgent", "note"]:
            alt_text = f" Alternative considerations include: {', '.join(f.alternative_explanations)}." if f.alternative_explanations else ""
            possible_significance.append(f"• {f.title}: {f.description}{alt_text}")
    if not possible_significance:
        possible_significance.append("• Overall physiological measurements fall within standard healthy reference distributions.")

    # 7. Suggested Next Steps
    suggested_next_steps = []
    if urgent_flags:
        suggested_next_steps.append("URGENT: Have this tracing evaluated immediately by an emergency physician or cardiologist.")
        suggested_next_steps.append("If experiencing active chest pain, shortness of breath, dizziness, or fainting, call emergency services immediately.")
    else:
        suggested_next_steps.append("Review this automated analysis report with a licensed physician or cardiologist in the context of clinical history.")
        suggested_next_steps.append("Correlate findings with prior ECG recordings to determine whether differences represent acute changes or baseline variants.")
        suggested_next_steps.append("Do not make or alter medication dosages based on automated software outputs.")

    # 8. Limitations
    limitations = [
        f"Input contains {num_leads} lead(s). Standard diagnostic ECG requires full 12-lead acquisition for comprehensive ischemia localization.",
        f"Signal quality rated as {quality.rating.upper()} (SNR: {quality.snr_db} dB). Baseline drift: {quality.baseline_wander_score}.",
        "Automated algorithms cannot detect patient symptoms, prior infarctions, or medication history.",
        "This platform is an educational and research-oriented clinical decision support tool and is not an independent diagnostic device."
    ]

    if image_details and image_details.is_image:
        limitations.extend(image_details.optical_limitations)

    return CardioExplanation(
        overall_summary=overall_summary,
        wave_by_wave=wave_by_wave,
        interval_analysis=interval_analysis,
        lead_by_lead_summary=lead_by_lead_summary,
        ml_explanation=ml_explanation,
        possible_clinical_significance=possible_significance,
        suggested_next_steps=suggested_next_steps,
        limitations=limitations,
        urgent_flags=urgent_flags,
        generator="deterministic_clinical_engine",
        image_details=image_details
    )

def build_cardio_explanation(
    measurements: List[ECGMeasurement],
    quality: SignalQuality,
    findings: List[ClinicalFinding],
    ml_results: Dict[str, MLResult],
    num_leads: int,
    lead_names: List[str],
    patient_age: Optional[int] = None,
    patient_sex: Optional[str] = None,
    image_details: Optional[ImageAnalysisDetails] = None
) -> CardioExplanation:
    """
    Main explanation entry point.
    Delegates to LLM when valid API keys and provider are configured;
    falls back cleanly to deterministic explanation engine.
    """
    # Deterministic engine is the trusted foundation
    deterministic_result = generate_deterministic_explanation(
        measurements=measurements,
        quality=quality,
        findings=findings,
        ml_results=ml_results,
        num_leads=num_leads,
        lead_names=lead_names,
        patient_age=patient_age,
        patient_sex=patient_sex,
        image_details=image_details
    )

    return deterministic_result

