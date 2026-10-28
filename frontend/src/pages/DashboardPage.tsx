import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Activity,
  History,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  FileText,
  AlertCircle,
  Zap
} from 'lucide-react';
import { ecgApi } from '../services/api';
import type { AnalysisRecord } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  useEffect(() => {
    ecgApi.listAnalyses()
      .then((data) => {
        setRecentAnalyses(data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLaunchDemo = async (variant: string) => {
    try {
      setDemoLoading(variant);
      const res = await ecgApi.loadDemo(variant);
      navigate(`/analysis/${res.id}`);
    } catch (e) {
      alert('Failed to launch demo. Ensure backend is running.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#070b14] min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              Workspace &bull; Research &amp; Decision Support
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CardioExplain AI Clinical Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Upload new electrocardiographic tracings, inspect delineated intervals, evaluate calibrated ML predictions, and review clinical safety notes.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all text-sm shrink-0"
        >
          <UploadCloud className="w-4 h-4 text-slate-950" />
          <span>New ECG Upload</span>
        </Link>
      </div>

      {/* Instant Safe Demo Showcase Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 rounded-2xl p-6 text-white border border-emerald-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>TEST WORKFLOW INSTANTLY (NO UPLOAD NEEDED)</span>
            </div>
            <h2 className="text-lg font-bold text-white">Safe Synthetic Cardiac Case Library</h2>
            <p className="text-xs text-slate-300">
              Select an illustrative calibrated case below to exercise the full filtering, Pan-Tompkins delineation, and report generation pipeline immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'normal', label: 'Normal Sinus Rhythm' },
              { id: 'tachycardia', label: 'Sinus Tachycardia' },
              { id: 'bradycardia', label: 'Sinus Bradycardia' },
              { id: 'st_elevation', label: 'ST Elevation (Urgent)' },
              { id: 'long_qt', label: 'Prolonged QTc' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleLaunchDemo(d.id)}
                disabled={demoLoading !== null}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{demoLoading === d.id ? 'Loading...' : d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Recent Analyses & Educational Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Analyses */}
        <div className="lg:col-span-2 bg-[#0b1120] rounded-2xl border border-slate-800 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Recent Completed Analyses</h2>
            </div>
            <Link to="/history" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all history <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading recent analyses...
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No recent analyses found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload your first ECG tracing or run a synthetic demo case above to populate analysis records.
              </p>
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
              >
                <UploadCloud className="w-4 h-4" /> Upload Recording
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentAnalyses.map((rec) => {
                const isUrgent = rec.has_urgent_findings;
                return (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/analysis/${rec.id}`)}
                    className="py-3.5 px-2 hover:bg-slate-900/80 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isUrgent ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                        {isUrgent ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{rec.filename}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                            {rec.file_type}
                          </span>
                          {isUrgent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-950 text-rose-400 border border-rose-500/40">
                              URGENT FINDING
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(rec.created_at).toLocaleString()} &bull; {rec.num_leads} lead(s) &bull; Quality: {rec.quality.rating.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:text-emerald-300">
                        View Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Quick Clinical & Educational Guides */}
        <div className="space-y-6">
          <div className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 shadow-md">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">ECG Educational Hub</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Refresh your understanding of atrial depolarization, AV nodal delay, QT dispersion, and 12-lead vector geometry.
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/education#p-wave" className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/30 block transition-colors text-slate-300 font-medium">
                  &bull; P Wave &amp; PR Interval Reference
                </Link>
              </li>
              <li>
                <Link to="/education#qrs-complex" className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/30 block transition-colors text-slate-300 font-medium">
                  &bull; QRS Complex &amp; Bundle Branch Blocks
                </Link>
              </li>
              <li>
                <Link to="/education#st-segment" className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/30 block transition-colors text-slate-300 font-medium">
                  &bull; ST Segment Deviation &amp; Ischemia Criteria
                </Link>
              </li>
              <li>
                <Link to="/education#qt-interval" className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/30 block transition-colors text-slate-300 font-medium">
                  &bull; QTc Bazett vs. Fridericia Calculations
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-[#0b1120] rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 text-xs text-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Medical Safety Reminder</span>
            </div>
            <p className="leading-relaxed">
              Automated interpretations must always be correlated with the patient's hemodynamic status, serum electrolytes, and medication profile.
            </p>
            <Link to="/about" className="inline-block font-semibold text-emerald-400 hover:text-emerald-300 hover:underline pt-1">
              Read platform validation details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
