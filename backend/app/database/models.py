from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, JSON
from app.database.session import Base

class AnalysisRecord(Base):
    __tablename__ = "analyses"

    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    status = Column(String(50), default="processing")  # processing, completed, failed
    
    # Patient Voluntary Context
    patient_age = Column(Integer, nullable=True)
    patient_sex = Column(String(10), nullable=True)
    
    # Signal Attributes
    sampling_rate = Column(Float, default=500.0)
    duration_seconds = Column(Float, default=0.0)
    num_leads = Column(Integer, default=1)
    lead_names = Column(JSON, default=list)
    
    # Quality Assessment
    quality = Column(JSON, default=dict)
    
    # Measurements & Findings
    measurements = Column(JSON, default=list)
    findings = Column(JSON, default=list)
    
    # ML & Explanations
    ml_results = Column(JSON, default=dict)
    explanation = Column(JSON, default=dict)
    
    # Artifact tracking
    signal_file_path = Column(String(512), nullable=True)
    pdf_report_path = Column(String(512), nullable=True)
    uploaded_image_path = Column(String(512), nullable=True)
    image_details = Column(JSON, default=dict)
    has_urgent_findings = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)

