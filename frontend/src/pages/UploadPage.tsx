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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Electrocardiogram (ECG) Recording
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Supports digital time-series CSV files, digitized waveforms, scanned paper ECG images, and clinical PDF reports.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-bold text-sm">Upload or Processing Rejection</p>
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
              ? 'border-teal-500 bg-teal-50/50'
              : selectedFile
              ? 'border-teal-400 bg-teal-50/20'
              : 'border-slate-300 hover:border-slate-400 bg-white'
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
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-base">{selectedFile.name}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB &bull; Type: {selectedFile.type || 'ECG File'}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="mt-2 text-xs text-rose-600 hover:underline font-semibold"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <>
                <p className="text-base font-bold text-slate-800">
                  Drag and drop your ECG report or digital file here
                </p>
                <p className="text-xs text-slate-500">
                  or click to browse from your computer (CSV, TXT, PDF, PNG, JPG up to 15MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Optional Context & Acquisition Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Optional Clinical Context &amp; Signal Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Patient Age (Years, Optional)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="e.g. 54"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Biological Sex (Optional)
              </label>
              <select
                value={patientSex}
                onChange={(e) => setPatientSex(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 bg-white"
              >
                <option value="">Unspecified</option>
                <option value="male">Male (QTc threshold 450 ms)</option>
                <option value="female">Female (QTc threshold 460 ms)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sampling Rate (Hz)
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                value={samplingRate}
                onChange={(e) => setSamplingRate(e.target.value)}
                placeholder="500"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Sex helps establish gender-specific QTc upper limits. Sampling rate defaults to 500 Hz if not embedded in file metadata.
          </p>
        </div>

        {/* Consent and Intended-Use Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <input
            type="checkbox"
            id="consent-check"
            checked={consentConfirmed}
            onChange={(e) => setConsentConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
          />
          <label htmlFor="consent-check" className="text-xs text-slate-700 cursor-pointer leading-relaxed">
            <strong>Consent &amp; Intended-Use Acknowledgment:</strong> I understand that CardioExplain AI is an investigational decision-support and educational tool. It does not replace a clinical cardiologist, diagnose acute conditions definitively, or triage emergencies. I confirm that any uploaded data complies with applicable research privacy guidelines.
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedFile || !consentConfirmed}
          className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold text-base shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Reviewer Quick Testing Mode (No File Needed)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
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
              className="p-2.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 bg-white text-slate-700 text-xs font-medium text-center transition-all shadow-xs"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
