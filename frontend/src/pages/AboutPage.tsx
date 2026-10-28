import React from 'react';
import { ShieldAlert, Cpu, Database, Lock, HeartPulse, CheckCircle2, ExternalLink } from 'lucide-react';


export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
          <span>Platform Architecture &bull; Ethics &bull; Safety Principles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About CardioExplain AI &amp; Clinical Safety
        </h1>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          An explainable biomedical engineering platform designed to bridge the gap between complex digital cardiac waveforms and transparent, human-auditable clinical explanations.
        </p>
      </div>

      {/* Mandatory Clinical Disclaimer Card */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-rose-900 font-extrabold text-base">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <span>MANDATORY CLINICAL &amp; EMERGENCY NOTICE</span>
        </div>
        <p className="text-xs text-rose-900 leading-relaxed">
          CardioExplain AI is strictly an investigational and educational software system designed for academic evaluation, clinical decision-support research, and biomedical teaching. 
          <strong> It is NOT an FDA-cleared or CE-marked medical device and MUST NEVER be used as a standalone diagnostic tool or to independently alter medical therapies.</strong>
        </p>
        <p className="text-xs text-rose-800 leading-relaxed">
          If a patient is presenting with acute chest discomfort, radiating left arm/jaw pain, dyspnea, lightheadedness, or syncope, <strong>activate emergency medical services (such as 911 or local emergency response) immediately</strong>. Never delay emergency intervention based on an automated software prediction.
        </p>
      </div>

      {/* Technology Stack Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Cpu className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">Technology Stack &amp; Implementation Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Frontend Engineering</h3>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li><strong>React 19 &amp; Vite:</strong> Fast modular component architecture.</li>
              <li><strong>TypeScript:</strong> Strict typing for biomedical structures and ECG parameters.</li>
              <li><strong>Tailwind CSS v4:</strong> Accessible medical dashboard design language.</li>
              <li><strong>Plotly.js:</strong> Interactive waveform canvas with 25 mm/s and 10 mm/mV clinical grids.</li>
              <li><strong>Lucide React:</strong> Standardized accessible clinical iconography.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Backend &amp; Signal Pipeline</h3>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
              <li><strong>FastAPI &amp; Uvicorn:</strong> Asynchronous high-performance RESTful API.</li>
              <li><strong>SciPy Signal Processing:</strong> Zero-phase Butterworth highpass, notch, and lowpass filtering.</li>
              <li><strong>Pan-Tompkins QRS Algorithm:</strong> Proven adaptive dual-threshold detection.</li>
              <li><strong>ReportLab:</strong> Automated print-ready PDF clinical summary generation.</li>
              <li><strong>SQLite / SQLAlchemy:</strong> Modular ORM data layer with local privacy controls.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dataset & Machine Learning Grounding */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">Benchmark Datasets &amp; Validation Policy</h2>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          The models and reference distributions implemented in CardioExplain AI adhere to internationally recognized open biomedical benchmarks:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">PTB-XL Database v1.0.0</span>
              <a
                href="https://physionet.org/content/ptb-xl/1.0.0/"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 hover:text-teal-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Large 12-lead diagnostic electrocardiography dataset containing 21,837 clinical recordings from 18,885 patients, sampled at 500 Hz with certified cardiologist annotations.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">MIT-BIH Arrhythmia Database</span>
              <a
                href="https://physionet.org/content/mitdb/1.0.0/"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 hover:text-teal-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Standard rhythm benchmark containing 48 half-hour continuous ambulatory two-lead recordings, serving as the gold standard for QRS detector validation.
            </p>
          </div>
        </div>
      </div>

      {/* Patient Privacy Safeguards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">Privacy Safeguards &amp; Data Ethics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">No Patient Identifiers Required:</strong> Patient name, national ID, or contact info are never requested or stored.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Local Processing Guarantee:</strong> All digital signal processing, filtering, and model inference run locally on server without third-party data transmission.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Explicit Deletion Rights:</strong> Users can permanently purge any recording, extracted landmarks, and PDF reports directly from the History view.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Transparent AI Status:</strong> If a model artifact is uninstalled or untrained, the system clearly discloses its absence rather than inventing synthetic predictions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
