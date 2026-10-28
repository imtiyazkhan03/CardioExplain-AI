import React from 'react';
import { HeartPulse, ShieldAlert, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050811] text-slate-400 text-sm mt-auto border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Role */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">CardioExplain AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md mb-4">
              An explainable AI platform bridging raw electrocardiographic signal processing, multi-lead time-series delineation,
              and transparent clinical decision support. Grounded on PhysioNet PTB-XL and MIT-BIH benchmark methodologies.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-lg max-w-md">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Educational &amp; Research Prototype &bull; Not an FDA-cleared diagnostic device</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 text-emerald-400">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/upload" className="hover:text-emerald-400 transition-colors">Analyze ECG</Link></li>
              <li><Link to="/history" className="hover:text-emerald-400 transition-colors">Analysis History</Link></li>
              <li><Link to="/education" className="hover:text-emerald-400 transition-colors">ECG Educational Guide</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">Safety &amp; Architecture</Link></li>
            </ul>
          </div>

          {/* Col 3: Research Datasets & Standards */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 text-cyan-400">Standards &amp; Datasets</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://physionet.org/content/ptb-xl/1.0.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  PTB-XL Database <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://physionet.org/content/mitdb/1.0.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  MIT-BIH Arrhythmia <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ahajournals.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  AHA/ESC ECG Standards <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} CardioExplain AI. Open Biomedical Research Prototype.</p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Zero PII Stored &bull; Calibrated Inference Engine
          </p>
        </div>
      </div>
    </footer>
  );
};
