import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from app.config import REPORT_DIR
from app.schemas.ecg import AnalysisRecordResponse

def generate_pdf_report(record: AnalysisRecordResponse) -> Path:
    """
    Generates a professional, medical-grade PDF report using ReportLab.
    """
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    pdf_filename = f"CardioExplain_{record.id[:8]}_Report.pdf"
    pdf_path = REPORT_DIR / pdf_filename

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles
    primary_color = colors.HexColor("#0f172a")  # Dark Navy
    teal_accent = colors.HexColor("#0d9488")    # Medical Teal
    danger_color = colors.HexColor("#dc2626")   # Medical Red
    border_color = colors.HexColor("#e2e8f0")
    soft_bg = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569")
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )

    urgent_style = ParagraphStyle(
        'UrgentText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=danger_color
    )

    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b")
    )

    elements = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>CardioExplain AI</b><br/><font size=8 color='#0d9488'>INTELLIGENT ECG ANALYSIS & EXPLANATION PLATFORM</font>", title_style),
            Paragraph(
                f"<b>Report ID:</b> {record.id[:12]}<br/>"
                f"<b>Date:</b> {record.created_at[:16]} UTC<br/>"
                f"<b>Input File:</b> {record.filename} ({record.file_type})",
                subtitle_style
            )
        ]
    ]
    header_table = Table(header_data, colWidths=[3.8 * inch, 3.4 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=teal_accent, spaceBefore=4, spaceAfter=12))

    # 2. Urgent Alert Banner (if applicable)
    if record.has_urgent_findings:
        urgent_data = [[
            Paragraph(
                "<b>POTENTIALLY URGENT CARDIAC FINDING DETECTED</b><br/>"
                f"Findings: {', '.join(record.explanation.urgent_flags)}<br/>"
                "<i>This automated alert requires prompt medical evaluation by a licensed physician or emergency clinical provider.</i>",
                urgent_style
            )
        ]]
        urgent_table = Table(urgent_data, colWidths=[7.2 * inch])
        urgent_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
            ('BOX', (0, 0), (-1, -1), 1.5, danger_color),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(urgent_table)
        elements.append(Spacer(1, 10))

    # 3. Patient Context & Signal Quality Summary
    context_data = [
        [
            Paragraph("<b>Patient Context</b>", subtitle_style),
            Paragraph("<b>Signal Quality Assessment</b>", subtitle_style),
            Paragraph("<b>Acquisition Parameters</b>", subtitle_style)
        ],
        [
            Paragraph(
                f"Age: {record.patient_age if record.patient_age else 'Unspecified'}<br/>"
                f"Sex: {record.patient_sex.title() if record.patient_sex else 'Unspecified'}<br/>"
                "Intended Use: Educational / Research",
                body_style
            ),
            Paragraph(
                f"Rating: <b>{record.quality.rating.upper()}</b><br/>"
                f"SNR: {record.quality.snr_db} dB<br/>"
                f"Baseline Drift: {record.quality.baseline_wander_score}",
                body_style
            ),
            Paragraph(
                f"Sampling Rate: {record.sampling_rate} Hz<br/>"
                f"Duration: {record.duration_seconds} s<br/>"
                f"Channels: {record.num_leads} lead(s) ({', '.join(record.lead_names[:3])}{'...' if len(record.lead_names) > 3 else ''})",
                body_style
            )
        ]
    ]
    context_table = Table(context_data, colWidths=[2.4 * inch, 2.4 * inch, 2.4 * inch])
    context_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), soft_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(context_table)
    elements.append(Spacer(1, 12))

    # 4. Overall Interpretation Summary
    elements.append(Paragraph("Clinical Synthesis & Overview", section_heading))
    elements.append(Paragraph(record.explanation.overall_summary, body_style))
    elements.append(Spacer(1, 10))

    # 5. Delineated Measurements Table
    elements.append(Paragraph("ECG Waves, Intervals & Reference Ranges", section_heading))
    meas_rows = [
        [
            Paragraph("<b>Parameter</b>", body_style),
            Paragraph("<b>Measured</b>", body_style),
            Paragraph("<b>Unit</b>", body_style),
            Paragraph("<b>Reference Threshold</b>", body_style),
            Paragraph("<b>Status</b>", body_style),
            Paragraph("<b>Provenance</b>", body_style)
        ]
    ]
    for m in record.measurements:
        status_color = colors.HexColor("#16a34a") if m.status == "normal" else (
            colors.HexColor("#dc2626") if m.status == "abnormal" else colors.HexColor("#ca8a04")
        )
        val_str = f"{m.value}" if m.value is not None else "Unmeasurable"
        status_para = Paragraph(f"<font color='{status_color}'><b>{m.status.upper()}</b></font>", body_style)
        meas_rows.append([
            Paragraph(m.name, body_style),
            Paragraph(val_str, body_style),
            Paragraph(m.unit, body_style),
            Paragraph(m.reference_text, body_style),
            status_para,
            Paragraph(m.provenance.replace("_", " ").title(), body_style)
        ])

    meas_table = Table(meas_rows, colWidths=[1.8 * inch, 1.0 * inch, 0.7 * inch, 1.7 * inch, 1.0 * inch, 1.0 * inch])
    meas_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(meas_table)
    elements.append(Spacer(1, 12))

    # 6. Machine-Learning Findings Section
    elements.append(Paragraph("AI / Machine Learning Findings & Calibration", section_heading))
    elements.append(Paragraph(record.explanation.ml_explanation.replace("\n", "<br/>"), body_style))
    elements.append(Spacer(1, 10))

    # 7. Clinical Significance & Suggested Next Steps
    elements.append(Paragraph("Possible Clinical Significance & Differential Insights", section_heading))
    for sig in record.explanation.possible_clinical_significance:
        elements.append(Paragraph(sig, body_style))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Suggested Next Steps", section_heading))
    for step in record.explanation.suggested_next_steps:
        elements.append(Paragraph(f"• {step}", body_style))
    elements.append(Spacer(1, 8))

    # 8. Limitations & Provenance
    elements.append(Paragraph("Recording Limitations", section_heading))
    for lim in record.explanation.limitations:
        elements.append(Paragraph(f"• {lim}", body_style))
    elements.append(Spacer(1, 14))

    # 9. Mandatory Safety Disclaimer
    elements.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=4, spaceAfter=6))
    elements.append(Paragraph(
        "<b>MANDATORY MEDICAL SAFETY DISCLAIMER:</b> CardioExplain AI is an investigational and educational software tool. "
        "It does not provide definitive medical diagnoses, clinical treatment recommendations, or emergency triage. "
        "All automated waveform measurements, machine learning probabilities, and clinical rules must be verified by a board-certified "
        "physician or cardiologist. If the patient is experiencing chest discomfort, dyspnea, syncope, or other acute symptoms, "
        "contact emergency medical services immediately regardless of automated results.",
        disclaimer_style
    ))

    doc.build(elements)
    return pdf_path
