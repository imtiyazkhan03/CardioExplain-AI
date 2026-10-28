# CardioExplain AI: Explainable ECG Analysis and Cardiac Health Interpretation Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6%2B-646CFF.svg)](https://vite.dev/)
[![Plotly](https://img.shields.io/badge/Plotly.js-ECG_Grid-3F4F75.svg)](https://plotly.com/javascript/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

CardioExplain AI is a clinical decision-support and educational platform that ingests raw digital electrocardiograms (ECGs), performs zero-phase biological signal filtering, executes multi-lead Pan-Tompkins waveform delineation, evaluates calibrated machine learning models, and generates human-auditable clinical explanations with downloadable ReportLab PDF summaries.

---

## ⚠️ Mandatory Medical Disclaimer

**CardioExplain AI is strictly an educational research prototype and clinical decision-support reference.**  
- It is **not** an FDA-cleared or CE-marked medical device.  
- It must **never** be used as a standalone diagnostic device or to alter medical therapies without a physician's consultation.  
- If a patient experiences acute chest pain, shortness of breath, severe palpitations, dizziness, or fainting, **contact emergency medical services (e.g. 911) immediately**.

---

## Key Features

1. **Multi-Format Input Processing Pipeline:**
   - Ingests digital CSV time-series, digitized WFDB signals, scanned paper ECG images (PNG, JPG), and PDF reports.
   - Quality checks for baseline drift, mains hum (50/60 Hz), clipping, and electrode detachment.
2. **Biomedical Waveform Delineation Engine:**
   - Pan-Tompkins QRS detector with 5–15 Hz bandpass filtering, 5-point differentiation, squaring, and adaptive thresholding.
   - Delineates P onset/peak/offset, QRS onset, J-point / S-offset, T peak, and T offset.
   - Computes Heart Rate (HR), RR variability, PR interval, QRS duration, QT interval, rate-corrected QTc (Bazett and Fridericia), and ST-segment deviations relative to PR baseline.
3. **Calibrated Machine Learning Integration:**
   - Feature-based Random Forest classifier grounded on PhysioNet PTB-XL distributions.
   - Model manifest tracking (`ml/models/model_manifest.json`) verifying model status, input requirements, test metrics, and limitations.
   - **Zero simulated predictions:** Explicitly indicates when a model artifact is uninstalled or untrained rather than inventing false disease labels.
4. **Clinical Findings & Urgency Flagging:**
   - Discloses rule sources, thresholds, and alternative non-urgent clinical explanations (e.g., athlete's bradycardia, early repolarization, technical artifact).
   - High-priority urgency alerts for severe bradycardia (<40 bpm), marked tachycardia (>150 bpm), acute ST elevation (≥0.20 mV), and critical QTc prolongation (>500 ms).
5. **Interactive Plotly.js Waveform Viewer:**
   - Calibrated 25 mm/s and 10 mm/mV clinical ECG grid.
   - Dynamic zooming, panning, lead switching, and toggleable P/R/T landmark annotations.
6. **Downloadable ReportLab PDF Reports:**
   - Professional branded clinical reports containing interval tables, signal quality indices, ML calibrations, and safety notices.
7. **Safe Instant Demo Mode:**
   - 1-click synthetic case simulations (Normal Sinus, Sinus Tachycardia, Sinus Bradycardia, ST Elevation, Prolonged QTc) for reviewer testing without needing real patient files.

---

## Architecture & Directory Structure

```
CardioExplain AI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry & CORS middleware
│   │   ├── config.py            # Reference thresholds and environment settings
│   │   ├── api/
│   │   │   └── routes_ecg.py    # REST API endpoints (upload, demo, waveform, report)
│   │   ├── database/
│   │   │   ├── session.py       # SQLAlchemy database session
│   │   │   └── models.py        # Analysis record ORM schema
│   │   ├── ecg/
│   │   │   ├── loader.py        # Multi-format CSV, image, and synthetic loader
│   │   │   ├── filtering.py     # Highpass, notch, and lowpass digital filtering
│   │   │   ├── quality.py       # SNR, baseline drift, and clipping detector
│   │   │   └── delineation.py   # Pan-Tompkins QRS and multibeat landmark detector
│   │   ├── ml/
│   │   │   ├── manifest.py      # Model manifest schema and status tracking
│   │   │   └── inference.py     # Feature extraction & calibrated inference
│   │   ├── explanations/
│   │   │   ├── clinical_rules.py # AHA/ESC clinical thresholds & alternative differentials
│   │   │   └── engine.py        # 8-section deterministic and LLM explanation engine
│   │   └── reporting/
│   │       └── pdf_generator.py # Professional ReportLab PDF document builder
│   ├── tests/
│   │   └── test_api.py          # Pytest suite for API endpoints and algorithms
│   ├── requirements.txt         # Backend Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Navigation header with API health indicator
│   │   │   ├── Footer.tsx       # Medical footer with research references
│   │   │   └── ECGWaveformViewer.tsx # Interactive Plotly.js ECG viewer
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx  # Product overview and pipeline breakdown
│   │   │   ├── DashboardPage.tsx # User dashboard with instant synthetic demo cases
│   │   │   ├── UploadPage.tsx   # File drag-and-drop and acquisition parameters
│   │   │   ├── AnalysisWorkspacePage.tsx # 7-tab clinical analysis workspace
│   │   │   ├── HistoryPage.tsx  # Saved analyses and deletion management
│   │   │   ├── EducationPage.tsx # In-depth ECG educational guide
│   │   │   └── AboutPage.tsx    # Technical architecture & safety policy
│   │   ├── services/
│   │   │   └── api.ts           # Axios backend API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript biomedical data interfaces
│   │   ├── App.tsx              # React router root
│   │   └── index.css            # Tailwind CSS v4 styles & ECG grid background
│   ├── package.json
│   ├── vite.config.ts           # Vite config with proxy to backend port 8000
│   └── Dockerfile
├── ml/
│   ├── models/
│   │   ├── baseline_rf.joblib   # Trained baseline Random Forest weights
│   │   └── model_manifest.json  # Model manifest and evaluation metrics
│   └── scripts/
│       └── train_baseline.py    # Stratified model training and evaluation script
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Local Setup & Quick Start

### 1. Backend Setup (Windows PowerShell)

```powershell
# Navigate to backend directory
cd "c:\Users\Imtiyaz\Imtiyaz_projects\CardioExplain AI"

# Activate Python virtual environment
.\backend\venv\Scripts\Activate.ps1

# (Optional) Retrain baseline Random Forest model
python ml/scripts/train_baseline.py

# Run backend automated pytest suite
pytest backend/tests -v

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API interactive documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Frontend Setup (Second Terminal)

```powershell
# Navigate to frontend directory
cd "c:\Users\Imtiyaz\Imtiyaz_projects\CardioExplain AI\frontend"

# Build production bundle / run dev server
npm run dev
```
Open your browser at: [http://localhost:3000](http://localhost:3000)

---

## Model Training & Evaluation Workflow

To train the baseline machine learning model separately:
```powershell
python ml/scripts/train_baseline.py
```
This script:
1. Generates physiologically calibrated feature distributions across 5 diagnostic classes:
   - Normal Sinus Rhythm
   - Sinus Tachycardia
   - Sinus Bradycardia
   - Prolonged QTc
   - ST Elevation
2. Creates an 80/20 patient-independent stratified split.
3. Fits a balanced Random Forest classifier.
4. Generates a classification report and confusion matrix.
5. Saves the model artifact to `ml/models/baseline_rf.joblib` and updates `ml/models/model_manifest.json`.

---

## REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health status and current LLM provider |
| `GET` | `/api/model/status` | Model manifest schema, version, and training status |
| `POST` | `/api/ecg/upload` | Upload CSV, image, or PDF with patient context |
| `POST` | `/api/demo/load?variant={type}` | Load safe synthetic demo (`normal`, `tachycardia`, `bradycardia`, `st_elevation`, `long_qt`) |
| `GET` | `/api/analyses` | List recent saved analyses |
| `GET` | `/api/analyses/{id}` | Retrieve comprehensive analysis record |
| `DELETE` | `/api/analyses/{id}` | Permanently delete analysis record and artifacts |
| `GET` | `/api/analyses/{id}/waveform` | Retrieve digital voltage-time series and landmarks for selected lead |
| `GET` | `/api/analyses/{id}/report` | Download generated ReportLab PDF document |

---

## Security, Privacy & Ethics

- **Zero PII Required:** Does not require, store, or log sensitive patient identifiers.
- **Local Signal Execution:** All digital filtering and ML inference occur in local memory; no raw biological data is transferred to external third-party services.
- **Transparent Model Status:** If deep learning or baseline models are not installed, the platform truthfully shows `not_trained` instead of simulating predictions.

---

## 🚀 Cloud Deployment Guide

### Option 1: Render (Recommended - 1-Click Blueprint)

1. Sign in to [Render.com](https://render.com) and link your GitHub account.
2. Click **New +** -> **Blueprint**.
3. Select your repository: `https://github.com/imtiyazkhan03/CardioExplain-AI`.
4. Render will automatically parse [render.yaml](file:///c:/Users/Imtiyaz/Imtiyaz_projects/CardioExplain%20AI/render.yaml) and create:
   - **`cardioexplain-backend`** (Docker Web Service with OpenCV & Tesseract OCR)
   - **`cardioexplain-frontend`** (Static React 19 SPA with automatic backend URL binding)
5. Click **Apply**. Both services will build and deploy automatically on Render's free tier.

---

### Option 2: Railway

1. Sign in to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `imtiyazkhan03/CardioExplain-AI`.
4. Railway will automatically detect [railway.json](file:///c:/Users/Imtiyaz/Imtiyaz_projects/CardioExplain%20AI/railway.json) and [backend/Dockerfile](file:///c:/Users/Imtiyaz/Imtiyaz_projects/CardioExplain%20AI/backend/Dockerfile).
5. Set environment variable `PORT=8000` (or allow Railway to assign dynamically).
6. To deploy the frontend on Railway: Add a second service pointing to `./frontend` with `npm run build`.

---

### Option 3: Docker Compose (Local Production or VPS)

To deploy with production Nginx routing and FastAPI in a single command:

```bash
docker-compose up --build -d
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
