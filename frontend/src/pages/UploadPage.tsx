import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Activity,
  Info
} from 'lucide-react';

import { ecgApi } from '../services/api';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientSex, setPatientSex] = useState<string>('');
  const [samplingRate, setSamplingRate] = useState<string>('500');
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allowedExtensions = ['.csv', '.txt', '.pdf', '.png', '.jpg', '.jpeg'];

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMessage(`Unsupported format '${ext}'. Please upload a CSV, TXT, PDF, PNG, or JPG file.`);
      return false;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15 MB threshold.');
      return false;
    }
    return true;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or drop an ECG file to analyze.');
      return;
    }
    if (!consentConfirmed) {
      setErrorMessage('You must confirm the intended-use and consent notice to proceed.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      if (patientAge) formData.append('patient_age', patientAge);
      if (patientSex) formData.append('patient_sex', patientSex);
      if (samplingRate) formData.append('sampling_rate', samplingRate);
      formData.append('consent_confirmed', 'true');

      const result = await ecgApi.uploadECG(formData);
      navigate(`/analysis/${result.id}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'An error occurred during ECG processing.';
      setErrorMessage(detail);
      setLoading(false);
    }
  };

  const handleLaunchPresetDemo = async (variant: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await ecgApi.loadDemo(variant);
      navigate(`/analysis/${res.id}`);
    } catch (err: any) {
      setErrorMessage('Could not load demo record. Please verify that the backend API is online.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#070b14] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Upload Electrocardiogram (ECG) Recording
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Supports digital time-series CSV files, digitized waveforms, scanned paper ECG images, and clinical PDF reports.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-bold text-sm text-white">Upload or Processing Rejection</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-400 bg-emerald-950/30'
              : selectedFile
              ? 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'border-slate-800 hover:border-emerald-500/40 bg-[#0b1120] hover:shadow-[0_0_25px_rgba(16,185,129,0.1)]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.txt,.pdf,.png,.jpg,.jpeg"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <UploadCloud className="w-8 h-8" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-base">{selectedFile.name}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB &bull; Type: {selectedFile.type || 'ECG File'}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="mt-2 text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <>
                <p className="text-base font-bold text-white">
                  Drag and drop your ECG report or digital file here
                </p>
                <p className="text-xs text-slate-400">
                  or click to browse from your computer (CSV, TXT, PDF, PNG, JPG up to 15MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Optional Context & Acquisition Configuration */}
        <div className="bg-[#0b1120] rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Optional Clinical Context &amp; Signal Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Patient Age (Years, Optional)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="e.g. 54"
                className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#070b14] text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Biological Sex (Optional)
              </label>
              <select
                value={patientSex}
                onChange={(e) => setPatientSex(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#070b14] text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="" className="bg-[#0b1120] text-slate-300">Unspecified</option>
                <option value="male" className="bg-[#0b1120] text-slate-300">Male (QTc threshold 450 ms)</option>
                <option value="female" className="bg-[#0b1120] text-slate-300">Female (QTc threshold 460 ms)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sampling Rate (Hz)
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                value={samplingRate}
                onChange={(e) => setSamplingRate(e.target.value)}
                placeholder="500"
                className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#070b14] text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Sex helps establish gender-specific QTc upper limits. Sampling rate defaults to 500 Hz if not embedded in file metadata.
          </p>
        </div>

        {/* Consent and Intended-Use Notice */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
          <input
            type="checkbox"
            id="consent-check"
            checked={consentConfirmed}
            onChange={(e) => setConsentConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-700 bg-slate-950 cursor-pointer"
          />
          <label htmlFor="consent-check" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
            <strong className="text-white">Consent &amp; Intended-Use Acknowledgment:</strong> I understand that CardioExplain AI is an investigational decision-support and educational tool. It does not replace a clinical cardiologist, diagnose acute conditions definitively, or triage emergencies. I confirm that any uploaded data complies with applicable research privacy guidelines.
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedFile || !consentConfirmed}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-base shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Waveform &amp; Classifying...</span>
            </>
          ) : (
            <>
              <Activity className="w-5 h-5" />
              <span>Start Comprehensive ECG Analysis</span>
            </>
          )}
        </button>
      </form>

      {/* Alternative Quick-Test Banner */}
      <div className="mt-12 pt-8 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Reviewer Quick Testing Mode (No File Needed)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Click any preset case below to immediately load a benchmark synthetic signal:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'normal', title: 'Normal Sinus' },
            { id: 'tachycardia', title: 'Sinus Tachycardia' },
            { id: 'bradycardia', title: 'Sinus Bradycardia' },
            { id: 'st_elevation', title: 'ST Elevation' },
            { id: 'long_qt', title: 'Prolonged QTc' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleLaunchPresetDemo(item.id)}
              disabled={loading}
              className="p-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 bg-slate-900 text-slate-300 hover:text-emerald-300 text-xs font-medium text-center transition-all shadow-xs"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
