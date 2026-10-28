import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  LayoutDashboard,
  UploadCloud,
  History,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import { ecgApi } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    ecgApi.getHealth()
      .then(() => setBackendHealthy(true))
      .catch(() => setBackendHealthy(false));
  }, []);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Analyze ECG', icon: UploadCloud },
    { to: '/history', label: 'History', icon: History },
    { to: '/education', label: 'ECG Education', icon: BookOpen },
    { to: '/about', label: 'About & Safety', icon: ShieldCheck },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      {/* Safety Notice Strip */}
      <div className="bg-[#04060b] text-slate-400 px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800/40">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
        <span>
          <strong className="text-slate-300">Educational &amp; Clinical Decision Support Research Platform:</strong> Never replaces professional cardiologist evaluation. In emergencies, call emergency services immediately.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                CardioExplain <span className="text-emerald-400 font-extrabold text-xs uppercase px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30">AI</span>
              </span>
              <p className="text-[10px] text-emerald-400/70 font-medium tracking-wide">Explainable Cardiac Intelligence</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-900/80 border-slate-800 text-slate-400">
              {backendHealthy === true && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">API Online</span>
                </>
              )}
              {backendHealthy === false && (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">API Offline</span>
                </>
              )}
              {backendHealthy === null && <span>Checking API...</span>}
            </div>

            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
            >
              <UploadCloud className="w-4 h-4 text-slate-950" />
              <span>Analyze ECG</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
