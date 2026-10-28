import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Activity,
  Cpu,
  FileCheck2,
  DownloadCloud,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Sparkles,
  CheckCircle
} from 'lucide-react';

import { ecgApi } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const handleLaunchInstantDemo = async () => {
    try {
      setLoadingDemo(true);
      const record = await ecgApi.loadDemo('normal');
      navigate(`/analysis/${record.id}`);
    } catch (err) {
      navigate('/upload');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Transparent &bull; Biomedical Signal Processing &bull; Calibrated AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Explainable AI-Powered <br />
              <span className="text-teal-600">Cardiac ECG Interpretation</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              A clinical decision support platform providing end-to-end signal filtering, multi-lead Pan-Tompkins waveform delineation,
              and transparent explanations grounded on AHA/ESC standards.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/upload"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all text-base"
              >
                <span>Upload &amp; Analyze ECG</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button
                onClick={handleLaunchInstantDemo}
                disabled={loadingDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-6 py-3.5 rounded-xl shadow-xs transition-all text-base"
              >
                <Activity className="w-5 h-5 text-teal-600" />
                <span>{loadingDemo ? 'Synthesizing Demo...' : 'Explore Interactive Demo'}</span>
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Supports CSV signals, digital recordings, scanned ECG images, and PDF reports.
            </p>
          </div>
        </div>

        {/* Decorative Grid Accent */}
        <div className="absolute inset-0 pointer-events-none opacity-20 ecg-grid-bg mask-gradient"></div>
      </section>

      {/* Pipeline Explanation: How CardioExplain Works */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Transparent 5-Stage Analysis Pipeline
            </h2>
            <p className="text-slate-600 text-sm">
              Unlike opaque black-box AI tools, CardioExplain AI exposes every intermediate physiological parameter and extraction step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Input Ingestion',
                desc: 'Loads CSV, images, or PDFs with sampling rate validation and channel discovery.',
                icon: Sliders
              },
              {
                step: '02',
                title: 'Signal Conditioning',
                desc: 'Zero-phase Butterworth high-pass and notch filtering to remove baseline drift and mains hum.',
                icon: Activity
              },
              {
                step: '03',
                title: 'Pan-Tompkins Delineation',
                desc: 'Isolates P peaks, QRS complexes, T waves, PR intervals, and ST segments across cardiac beats.',
                icon: HeartPulse
              },
              {
                step: '04',
                title: 'Calibrated AI & Rules',
                desc: 'Compares measurements against AHA/ESC criteria and executes machine learning inference.',
                icon: Cpu
              },
              {
                step: '05',
                title: 'Explainable Report',
                desc: 'Synthesizes clinical explanations, highlights urgency flags, and generates a downloadable PDF.',
                icon: FileCheck2
              }
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      STAGE {st.step}
                    </span>
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">{st.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-16 bg-slate-50/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Clinical Engineering Features
            </h2>
            <p className="text-slate-600 text-sm">
              Built for biomedical researchers, clinicians, and health-tech developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Interactive Waveform Canvas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plotly.js-powered multi-lead ECG viewer with standard 25 mm/s and 10 mm/mV grid overlay. Zoom into individual beats and inspect R-peak, P-wave, and T-wave annotations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Grounded Machine Learning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trained on PhysioNet PTB-XL benchmarks. Discloses calibrated class probabilities, model versions, and explicitly indicates when a model artifact is uninstalled rather than fabricating results.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Formal ReportLab PDF Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate downloadable, print-ready medical PDF reports containing interval tables, signal quality indices (SNR, drift), wave-by-wave rationales, and mandatory safety notices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intended Use & Safety Disclosure */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8 flex items-start gap-4">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Educational Scope &amp; Medical Disclaimer
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                CardioExplain AI is designed exclusively for educational demonstration and research-oriented clinical decision support.
                It is <strong>not</strong> an FDA or CE cleared medical device and must never be utilized as the sole basis for clinical diagnosis or treatment alterations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Preserves signal quality warnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transparently handles missing leads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Flags urgent findings for clinician review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No fabricated diagnostic predictions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
