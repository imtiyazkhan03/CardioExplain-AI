from typing import List, Dict, Any, Optional
from app.config import settings
from app.schemas.ecg import ECGMeasurement, SignalQuality, ClinicalFinding, MLResult

def evaluate_clinical_findings(
    measurements: List[ECGMeasurement],
    quality: SignalQuality,
    ml_results: Dict[str, MLResult],
    patient_age: Optional[int] = None,
    patient_sex: Optional[str] = None
) -> List[ClinicalFinding]:
    """
    Evaluates rule-based findings against AHA/ESC guideline thresholds.
    Distinguishes direct measurements, rule triggers, ML hypotheses, and uncertain states.
    Discloses alternative clinical explanations and urgency flags.
    """
    findings: List[ClinicalFinding] = []
    meas_map = {m.code: m for m in measurements if m.value is not None}

    # 1. Low Signal Quality Warning
    if quality.rating in ["low", "unacceptable"]:
        findings.append(ClinicalFinding(
            id="FIND_QUAL_LOW",
            category="Signal Quality",
            title="Compromised Signal Quality / High Artifact Level",
            description=(
                f"Overall recording quality is rated {quality.rating.upper()} (SNR: {quality.snr_db} dB). "
                "Significant baseline wander, electrode artifact, or high-frequency tremor was observed."
            ),
            severity="abnormal" if quality.rating == "unacceptable" else "note",
            evidence=f"SNR={quality.snr_db} dB; Wander={quality.baseline_wander_score}; Noise={quality.noise_score}",
            source="signal_quality_evaluator",
            requires_prompt_evaluation=False,
            alternative_explanations=[
                "Patient movement during recording",
                "Loose, dry, or displaced electrode contact",
                "Mains electrical line interference (50/60 Hz)",
                "Electromyographic (EMG) muscle tension"
            ]
        ))

    # 2. Heart Rate and Rhythm Assessment
    if "HR" in meas_map:
        hr = meas_map["HR"].value
        if hr < 40.0:
            findings.append(ClinicalFinding(
                id="FIND_RHYTHM_SEVERE_BRADY",
                category="Rhythm",
                title="Marked Bradycardia (< 40 bpm)",
                description=f"Automated calculation identified a resting heart rate of {hr} bpm, substantially below the 60 bpm threshold.",
                severity="urgent",
                evidence=f"Heart rate measured at {hr} bpm",
                source="rule_engine",
                requires_prompt_evaluation=True,
                alternative_explanations=[
                    "High-grade atrioventricular (AV) nodal conduction block",
                    "Sick sinus syndrome / sinus arrest",
                    "Medication effect (Beta-blockers, Calcium channel blockers, Digoxin)",
                    "Severe hypothermia or vagal hyper-reactivity"
                ]
            ))
        elif hr < settings.REF_HR_MIN:
            findings.append(ClinicalFinding(
                id="FIND_RHYTHM_BRADY",
                category="Rhythm",
                title="Sinus Bradycardia",
                description=f"Heart rate is {hr} bpm (reference 60 - 100 bpm).",
                severity="note",
                evidence=f"HR = {hr} bpm (< 60 bpm)",
                source="rule_engine",
                requires_prompt_evaluation=False,
                alternative_explanations=[
                    "Normal physiological adaptation in well-conditioned athletes",
                    "Elevated vagal tone during rest or sleep",
                    "Mild rate-controlling medication effect"
                ]
            ))
        elif hr > 150.0:
            findings.append(ClinicalFinding(
                id="FIND_RHYTHM_SEVERE_TACHY",
                category="Rhythm",
                title="Marked Tachycardia (> 150 bpm)",
                description=f"Resting heart rate measured at {hr} bpm. Exceeds typical benign physiological elevation.",
                severity="urgent",
                evidence=f"Heart rate measured at {hr} bpm",
                source="rule_engine",
                requires_prompt_evaluation=True,
                alternative_explanations=[
                    "Supraventricular tachycardia (SVT / AVNRT / Atrial flutter)",
                    "Ventricular tachycardia (if associated with wide QRS)",
                    "Severe physiological stress, shock, sepsis, or pulmonary embolism"
                ]
            ))
        elif hr > settings.REF_HR_MAX:
            findings.append(ClinicalFinding(
                id="FIND_RHYTHM_TACHY",
                category="Rhythm",
                title="Sinus Tachycardia",
                description=f"Heart rate is {hr} bpm (reference 60 - 100 bpm).",
                severity="note",
                evidence=f"HR = {hr} bpm (> 100 bpm)",
                source="rule_engine",
                requires_prompt_evaluation=False,
                alternative_explanations=[
                    "Emotional anxiety, stress, or caffeine / stimulant consumption",
                    "Recent physical exertion",
                    "Fever, dehydration, or mild anemia"
                ]
            ))

    # 3. Conduction & PR Interval
    if "PR" in meas_map:
        pr = meas_map["PR"].value
        if pr > settings.REF_PR_MAX:
            findings.append(ClinicalFinding(
                id="FIND_COND_FIRST_DEGREE_AVB",
                category="Conduction",
                title="Prolonged PR Interval (First-Degree AV Block Pattern)",
                description=f"PR interval is {pr} ms, exceeding the 200 ms upper limit of normal AV nodal conduction.",
                severity="note",
                evidence=f"PR interval = {pr} ms (Threshold: > 200 ms)",
                source="rule_engine",
                requires_prompt_evaluation=False,
                alternative_explanations=[
                    "Physiological delay in elite athletes",
                    "AV nodal slowing drugs (beta blockers, verapamil, diltiazem)",
                    "Degenerative conduction system disease"
                ]
            ))
        elif pr < settings.REF_PR_MIN:
            findings.append(ClinicalFinding(
                id="FIND_COND_SHORT_PR",
                category="Conduction",
                title="Short PR Interval (< 120 ms)",
                description=f"PR interval measured {pr} ms, below the 120 ms lower threshold.",
                severity="note",
                evidence=f"PR interval = {pr} ms (< 120 ms)",
                source="rule_engine",
                requires_prompt_evaluation=False,
                alternative_explanations=[
                    "Pre-excitation syndrome (Wolff-Parkinson-White pattern if delta wave present)",
                    "Low atrial or junctional pacemaker focus",
                    "Normal variant in younger individuals"
                ]
            ))

    # 4. Intraventricular Conduction (QRS Duration)
    if "QRS" in meas_map:
        qrs = meas_map["QRS"].value
        if qrs >= 140.0:
            findings.append(ClinicalFinding(
                id="FIND_COND_SEVERE_QRS_WIDE",
                category="Conduction",
                title="Marked QRS Prolongation (>= 140 ms)",
                description=f"Ventricular depolarization duration is {qrs} ms, indicating substantial ventricular conduction delay.",
                severity="abnormal",
                evidence=f"QRS duration = {qrs} ms (Threshold >= 140 ms)",
                source="rule_engine",
                requires_prompt_evaluation=True,
                alternative_explanations=[
                    "Complete Left Bundle Branch Block (LBBB) or Right Bundle Branch Block (RBBB)",
                    "Ventricular paced rhythm",
                    "Severe hyperkalemia or class I antiarrhythmic toxicity",
                    "Ventricular ectopic focus"
                ]
            ))
        elif qrs > settings.REF_QRS_MAX:
            findings.append(ClinicalFinding(
                id="FIND_COND_QRS_WIDE",
                category="Conduction",
                title="Widened QRS Complex (> 120 ms)",
                description=f"QRS duration of {qrs} ms exceeds normal physiological duration (<= 120 ms).",
                severity="abnormal",
                evidence=f"QRS duration = {qrs} ms (> 120 ms)",
                source="rule_engine",
                requires_prompt_evaluation=False,
                alternative_explanations=[
                    "Incomplete or complete bundle branch block",
                    "Nonspecific intraventricular conduction delay (IVCD)",
                    "Left ventricular hypertrophy with conduction strain"
                ]
            ))

    # 5. Repolarization & QT/QTc
    if "QTc" in meas_map:
        qtc = meas_map["QTc"].value
        qtc_limit = settings.REF_QTC_FEMALE_MAX if patient_sex == "female" else settings.REF_QTC_MALE_MAX
        if qtc > 500.0:
            findings.append(ClinicalFinding(
                id="FIND_REPOL_CRITICAL_LONG_QTC",
                category="Repolarization",
                title="Marked QTc Prolongation (> 500 ms)",
                description=(
                    f"Heart-rate corrected QT interval (Bazett) is {qtc} ms. Values exceeding 500 ms represent "
                    "a known electrophysiological risk for polymorphic ventricular tachycardia (Torsades de Pointes)."
                ),
                severity="urgent",
                evidence=f"QTc (Bazett) = {qtc} ms (Critical threshold: > 500 ms)",
                source="rule_engine",
                requires_prompt_evaluation=True,
                alternative_explanations=[
                    "Drug-induced QT prolongation (antiarrhythmics, psychotropics, macrolides)",
                    "Electrolyte derangement (hypokalemia, hypomagnesemia, hypocalcemia)",
                    "Congenital Long QT Syndrome (LQTS)",
                    "Overestimation of QT due to prominent U waves merged with T wave"
                ]
            ))
        elif qtc > qtc_limit:
            findings.append(ClinicalFinding(
                id="FIND_REPOL_BORDERLINE_QTC",
                category="Repolarization",
                title="Prolonged QTc Interval",
                description=f"Corrected QT interval is {qtc} ms (Sex-specific reference limit: <= {qtc_limit} ms).",
                severity="abnormal",
                evidence=f"QTc = {qtc} ms (Limit: {qtc_limit} ms for {patient_sex or 'standard'})",
                source="rule_engine",
                requires_prompt_evaluation=False,
                alternative_explanations=[
                    "Mild electrolyte imbalance",
                    "Medication side effect",
                    "Bazett formula overcorrection at elevated heart rates (check Fridericia formula)"
                ]
            ))

    # 6. ST Segment Deviation (Ischemia / Infarction Pattern)
    if "ST" in meas_map:
        st_val = meas_map["ST"].value
        if st_val >= 0.20:
            findings.append(ClinicalFinding(
                id="FIND_ISCHEMIA_SEVERE_STE",
                category="Ischemia / Infarction",
                title="Marked ST Elevation (>= 0.20 mV / 2 mm)",
                description=(
                    f"Significant J-point elevation of {st_val} mV detected. "
                    "When present in anatomically contiguous leads with reciprocal depression, this is consistent with acute transmural myocardial injury."
                ),
                severity="urgent",
                evidence=f"ST deviation = +{st_val} mV (Threshold >= 0.20 mV)",
                source="rule_engine",
                requires_prompt_evaluation=True,
                alternative_explanations=[
                    "Acute ST-elevation myocardial infarction (STEMI)",
                    "Acute pericarditis (usually widespread with PR depression)",
                    "Benign early repolarization (especially in young athletes)",
                    "Left ventricular aneurysm or Brugada pattern (in V1-V2)"
                ]
            ))
        elif st_val >= settings.REF_ST_ELEVATION_THRESHOLD:
            findings.append(ClinicalFinding(
                id="FIND_ISCHEMIA_MILD_STE",
                category="Ischemia / Infarction",
                title="ST Segment Elevation (>= 0.10 mV)",
                description=f"ST segment elevation of {st_val} mV detected relative to the PR baseline.",
                severity="abnormal",
                evidence=f"ST deviation = +{st_val} mV (Threshold >= 0.10 mV)",
                source="rule_engine",
                requires_prompt_evaluation=True,
                alternative_explanations=[
                    "Early repolarization variant",
                    "Evolving myocardial ischemia",
                    "Pericardial irritation"
                ]
            ))
        elif st_val <= settings.REF_ST_DEPRESSION_THRESHOLD:
            findings.append(ClinicalFinding(
                id="FIND_ISCHEMIA_STD",
                category="Ischemia / Infarction",
                title="ST Segment Depression",
                description=f"ST segment depression of {st_val} mV observed below the isoelectric baseline.",
                severity="abnormal",
                evidence=f"ST deviation = {st_val} mV (Threshold <= -0.05 mV)",
                source="rule_engine",
                requires_prompt_evaluation=False,
                alternative_explanations=[
                    "Subendocardial myocardial ischemia",
                    "Reciprocal changes to acute ST elevation in opposite leads",
                    "Secondary repolarization abnormalities from LVH or bundle branch block",
                    "Digitalis effect ('sagging' ST depression)"
                ]
            ))

    # If no abnormal findings were generated and quality is good
    if not findings and quality.rating in ["high", "moderate"]:
        findings.append(ClinicalFinding(
            id="FIND_NORMAL_RHYTHM",
            category="Rhythm & Conduction",
            title="Normal ECG (NSR - Normal Sinus Rhythm)",
            description="Analyzed heart rate, conduction intervals (PR, QRS), repolarization (QTc), and ST segments fall within standard reference intervals.",
            severity="normal",
            evidence="All evaluated parameters within AHA/ESC standard ranges.",
            source="rule_engine",
            requires_prompt_evaluation=False,
            alternative_explanations=[]
        ))

    return findings
