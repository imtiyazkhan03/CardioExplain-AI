import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DownloadCloud,
  ShieldAlert,
  ChevronRight,
  Info,
  Cpu,
  ArrowLeft,
  FileImage,
  Activity,
  Sparkles,
  Columns
} from 'lucide-react';

import { ecgApi } from '../services/api';
import type { AnalysisRecord } from '../types';
import { ECGWaveformViewer } from '../components/ECGWaveformViewer';
import { ImageAnalysisSection } from '../components/ImageAnalysisSection';
import { MeasurementGauge } from '../components/MeasurementGauge';

export const AnalysisWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Visualization View Mode: 'waveform', 'image', or 'split'
  const [viewMode, setViewMode] = useState<'waveform' | 'image' | 'split'>('waveform');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    ecgApi.getAnalysis(id)
      .then((data) => {
        setRecord(data);
        if (data.image_details?.is_image) {
          setViewMode('split');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message || 'Failed to load analysis record.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-bold text-slate-800">Analyzing Electrocardiogram Tracing...</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Executing digital filtering, Pan-Tompkins wave delineation, computer vision grid verification, and clinical synthesis.
        </p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 inline-block mb-4 shadow-xs">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Analysis Workspace Error</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'Could not find the requested analysis record.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const isDemo = record.filename.includes('DEMO');
  const hasImage = Boolean(record.image_details?.is_image);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'waveform', label: 'Waveform Analysis' },
    { id: 'leads', label: 'Lead-by-Lead Analysis' },
    { id: 'measurements', label: 'Measurements & Intervals' },
    { id: 'ml', label: 'AI/ML Findings' },
    { id: 'explanation', label: 'Detailed Explanation' },
    { id: 'report', label: 'Download Report' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900 font-medium">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/history" className="hover:text-slate-900 font-medium">Analyses</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold truncate max-w-[220px]">{record.filename}</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={ecgApi.getReportUrl(record.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Download PDF Report</span>
          </a>
        </div>
      </div>

      {/* Demo Warning Banner if Synthetic */}
      {isDemo && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-3 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span>DEMO MODE — NOT A REAL PATIENT RECORD.</span>
            <span className="font-normal text-amber-800 ml-1">
              Generated using benchmark synthetic dipole equations for safe clinical workflow testing.
            </span>
          </div>
        </div>
      )}

      {/* Urgent Finding Alert Banner */}
      {record.has_urgent_findings && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="font-extrabold text-sm sm:text-base tracking-tight text-rose-900">
              POTENTIALLY URGENT CARDIAC PATTERN DETECTED
            </h2>
            <p className="text-xs text-rose-800 leading-relaxed">
              Automated rules flagged findings requiring prompt clinical evaluation:{' '}
              <strong className="underline decoration-rose-400">{record.explanation.urgent_flags.join(', ')}</strong>.
            </p>
            <p className="text-[11px] text-rose-700 font-medium">
              If the patient is experiencing chest discomfort, dyspnea, lightheadedness, or syncope, immediately seek emergency medical attention.
            </p>
          </div>
        </div>
      )}

      {/* Header Record Summary Card with Glassmorphic Accent */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{record.filename}</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                {record.file_type}
              </span>
              {hasImage && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                  <FileImage className="w-3 h-3" /> Image Ingestion
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Record ID: <span className="font-mono text-slate-700">{record.id}</span> &bull; Analyzed on{' '}
              {new Date(record.created_at).toUTCString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Signal Quality</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase inline-block shadow-2xs ${
                  record.quality.rating === 'high'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : record.quality.rating === 'moderate'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {record.quality.rating} ({record.quality.snr_db} dB SNR)
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPI Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-medium">Heart Rate</span>
            <span className="text-lg font-extrabold text-slate-900">
              {record.measurements.find((m) => m.code === 'HR')?.value ?? '--'}{' '}
              <span className="text-xs font-normal text-slate-500">bpm</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-medium">PR Interval</span>
            <span className="text-lg font-extrabold text-slate-900">
              {record.measurements.find((m) => m.code === 'PR')?.value ?? 'Unmeasurable'}{' '}
              <span className="text-xs font-normal text-slate-500">ms</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-medium">QRS Duration</span>
            <span className="text-lg font-extrabold text-slate-900">
              {record.measurements.find((m) => m.code === 'QRS')?.value ?? '--'}{' '}
              <span className="text-xs font-normal text-slate-500">ms</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-medium">QTc (Bazett)</span>
            <span className="text-lg font-extrabold text-slate-900">
              {record.measurements.find((m) => m.code === 'QTc')?.value ?? '--'}{' '}
              <span className="text-xs font-normal text-slate-500">ms</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-medium">Lead Channels</span>
            <span className="text-lg font-extrabold text-slate-900">
              {record.num_leads}{' '}
              <span className="text-xs font-normal text-slate-500">leads</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  active
                    ? 'border-teal-600 text-teal-800 bg-white font-bold shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Panes */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dual View Mode Selector for Image uploads */}
          {hasImage && (
            <div className="bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-700 ml-2">Viewing Mode:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'split' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" /> Side-by-Side Dual View
                </button>
                <button
                  onClick={() => setViewMode('waveform')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'waveform' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> Waveform Canvas
                </button>
                <button
                  onClick={() => setViewMode('image')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'image' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileImage className="w-3.5 h-3.5" /> Original Scan / Document
                </button>
              </div>
            </div>
          )}

          {/* Dual Split View */}
          {hasImage && viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <ImageAnalysisSection imageDetails={record.image_details!} filename={record.filename} />
              <ECGWaveformViewer
                analysisId={record.id}
                leadNames={record.lead_names}
                initialLead="Lead II"
                waveformFetcher={ecgApi.getWaveform}
              />
            </div>
          )}

          {/* Waveform Only View */}
          {(!hasImage || viewMode === 'waveform') && (
            <ECGWaveformViewer
              analysisId={record.id}
              leadNames={record.lead_names}
              initialLead="Lead II"
              waveformFetcher={ecgApi.getWaveform}
            />
          )}

          {/* Image Only View */}
          {hasImage && viewMode === 'image' && (
            <ImageAnalysisSection imageDetails={record.image_details!} filename={record.filename} />
          )}

          {/* Clinical Synthesis Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Automated Clinical Synthesis</h2>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              {record.explanation.overall_summary}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900">Clinical Rule Flags:</span>
              {record.findings.map((f, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-md font-semibold ${
                    f.severity === 'urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : f.severity === 'abnormal'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {f.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. WAVEFORM ANALYSIS TAB */}
      {activeTab === 'waveform' && (
        <div className="space-y-6">
          <ECGWaveformViewer
            analysisId={record.id}
            leadNames={record.lead_names}
            initialLead="Lead II"
            waveformFetcher={ecgApi.getWaveform}
          />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Waveform Landmark Inspection Guide</h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              The Pan-Tompkins QRS detector utilizes digital bandpass filtering (5-15 Hz), differentiation, squaring, and adaptive thresholding to detect R-peaks without amplitude distortion.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                <span className="font-bold text-red-800">R Peaks (Red Circle)</span>
                <p className="text-slate-600 mt-1">Identifies ventricular depolarization timing and establishes the RR interval timebase.</p>
              </div>
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                <span className="font-bold text-teal-800">P Waves (Teal Diamond)</span>
                <p className="text-slate-600 mt-1">Reflects sinoatrial firing and atrial contraction. Delineated 80-240 ms prior to QRS.</p>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-800">T Waves (Purple Triangle)</span>
                <p className="text-slate-600 mt-1">Ventricular repolarization marker. Used to calculate rate-corrected QT/QTc dispersion.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LEAD-BY-LEAD ANALYSIS TAB */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Multi-Lead Configuration &amp; Vector Summary</h2>
            <div className="space-y-2 text-xs text-slate-700 mb-6">
              {record.explanation.lead_by_lead_summary.map((line, idx) => (
                <p key={idx}>&bull; {line}</p>
              ))}
            </div>

            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Individual Lead Quality Ratings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {record.lead_names.map((lead) => {
                const score = record.quality.lead_qualities[lead] ?? 1.0;
                return (
                  <div key={lead} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <span className="font-bold text-slate-800 text-sm block">{lead}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Score: {(score * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <ECGWaveformViewer
            analysisId={record.id}
            leadNames={record.lead_names}
            initialLead={record.lead_names[0] || 'Lead II'}
            waveformFetcher={ecgApi.getWaveform}
          />
        </div>
      )}

      {/* 4. MEASUREMENTS & INTERVALS TAB */}
      {activeTab === 'measurements' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Delineated ECG Measurements &amp; Reference Gauges</h2>
              <p className="text-xs text-slate-500">
                Visual range brackets compare each physiological landmark against AHA/ESC diagnostic thresholds.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-3">Measured</th>
                  <th className="py-3 px-2">Unit</th>
                  <th className="py-3 px-4 min-w-[200px]">Reference Range &amp; Gauge</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {record.measurements.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {m.value !== null ? m.value : <span className="text-slate-400 italic">Unmeasurable</span>}
                    </td>
                    <td className="py-3 px-2 text-slate-500">{m.unit}</td>
                    <td className="py-3 px-4">
                      <MeasurementGauge
                        value={m.value}
                        unit={m.unit}
                        minRef={m.reference_min}
                        maxRef={m.reference_max}
                        status={m.status}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-2xs ${
                          m.status === 'normal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'abnormal'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{m.provenance.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. AI/ML FINDINGS TAB */}
      {activeTab === 'ml' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">Machine Learning Classification &amp; Confidence</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Model outputs represent algorithmic classifications trained on documented benchmark distributions (PTB-XL / PhysioNet). An algorithmic probability does not equate to an unconditional clinical diagnosis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(record.ml_results).map(([key, res]) => (
                <div key={key} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{res.model_name}</h3>
                      <span className="text-[11px] text-slate-500">Version: {res.model_version}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        res.status === 'ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {res.status.replace('_', ' ')}
                    </span>
                  </div>

                  {res.status === 'ready' && res.predictions.length > 0 ? (
                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold text-slate-700 block">Calibrated Class Probabilities:</span>
                      {res.predictions.map((p, pIdx) => (
                        <div key={pIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-800 font-medium">{p.condition}</span>
                            <span className="font-mono font-bold text-slate-900">{(p.probability * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-teal-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, p.probability * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800 mb-1">Status Notice:</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        {res.limitations.map((lim, lIdx) => (
                          <li key={lIdx}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. DETAILED EXPLANATION TAB */}
      {activeTab === 'explanation' && (
        <div className="space-y-6">
          {/* If Image details exist, display dedicated Computer Vision Assessment banner */}
          {hasImage && record.image_details && (
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Computer Vision &amp; Image Ingestion Assessment</span>
              </div>
              <h3 className="text-lg font-bold">Uploaded Electrocardiogram Document Evaluation</h3>
              <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
                {record.image_details.clinical_visual_assessment}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Grid Divisions</span>
                  <span className="font-bold text-white text-xs">{record.image_details.detected_grid_type}</span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Sharpness Index</span>
                  <span className="font-bold text-white text-xs">{record.image_details.sharpness_score} / 100</span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Lead Layout</span>
                  <span className="font-bold text-white text-xs truncate block">{record.image_details.detected_layout}</span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Trace Continuity</span>
                  <span className="font-bold text-emerald-400 text-xs">{(record.image_details.waveform_extraction_confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Physiological Wave-by-Wave Explanation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Physiological Wave-by-Wave Explanation</h2>
              <p className="text-xs text-slate-500">
                Detailed clinical breakdown of each cardiac electrical phase and its physiological significance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {record.explanation.wave_by_wave.map((wbw, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-teal-800 text-sm block">{wbw.wave}</span>
                  <div className="text-[11px] text-slate-600">
                    <strong>Measured:</strong> {wbw.value}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{wbw.role}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{wbw.clinical_meaning}</p>
                  <p className="text-[11px] text-slate-400 italic">Limitation: {wbw.limitations}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Possible Clinical Significance &amp; Differentials</h3>
              <div className="space-y-2 text-xs text-slate-700">
                {record.explanation.possible_clinical_significance.map((item, idx) => (
                  <p key={idx} className="leading-relaxed">{item}</p>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Suggested Next Clinical Steps</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {record.explanation.suggested_next_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">&bull;</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 7. DOWNLOAD REPORT TAB */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
            <DownloadCloud className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">CardioExplain AI Clinical Report Ready</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            A comprehensive, formatted PDF containing the full measurement table, optical scan parameters, rule-based differentials, and required safety disclaimers is generated and ready for archival.
          </p>

          <div className="pt-2">
            <a
              href={ecgApi.getReportUrl(record.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs hover:shadow-sm transition-all"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>Download Signed PDF Document</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-400">
            ReportLab PDF Engine &bull; Timestamped &bull; Educational Decision Support
          </p>
        </div>
      )}
    </div>
  );
};
