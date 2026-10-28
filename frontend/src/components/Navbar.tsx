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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Safety Notice Strip */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
        <span>
          <strong>Educational &amp; Clinical Decision Support Research Platform:</strong> Never replaces professional cardiologist evaluation. In emergencies, call emergency services immediately.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-700 transition-colors">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                CardioExplain <span className="text-teal-600 font-extrabold text-sm uppercase px-1.5 py-0.5 rounded-md bg-teal-50 border border-teal-200">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Explainable Cardiac Intelligence</p>
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
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
              {backendHealthy === true && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>API Online</span>
                </>
              )}
              {backendHealthy === false && (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>API Offline</span>
                </>
              )}
              {backendHealthy === null && <span>Checking API...</span>}
            </div>

            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs hover:shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Analyze ECG</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
