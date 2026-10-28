import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import type { WaveformLeadData } from '../types';
import { Activity, Eye, ShieldAlert } from 'lucide-react';


interface Props {
  analysisId: string;
  leadNames: string[];
  initialLead?: string;
  waveformFetcher: (analysisId: string, lead: string) => Promise<WaveformLeadData>;
}

export const ECGWaveformViewer: React.FC<Props> = ({
  analysisId,
  leadNames,
  initialLead = 'Lead II',
  waveformFetcher,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLead, setSelectedLead] = useState<string>(
    leadNames.includes(initialLead) ? initialLead : (leadNames[0] || 'Lead II')
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [waveData, setWaveData] = useState<WaveformLeadData | null>(null);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    waveformFetcher(analysisId, selectedLead)
      .then((data) => {
        if (isMounted) {
          setWaveData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load ECG waveform data.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [analysisId, selectedLead, waveformFetcher]);

  useEffect(() => {
    if (!containerRef.current || !waveData || loading) return;

    const time = waveData.time;
    const voltage = waveData.voltage;

    // Traces
    const traces: Plotly.Data[] = [
      {
        x: time,
        y: voltage,
        type: 'scatter',
        mode: 'lines',
        name: `${selectedLead} Voltage`,
        line: {
          color: '#0284c7', // Professional Medical Deep Cyan / Blue
          width: 1.8,
        },
        hoverinfo: 'x+y',
        hovertemplate: 'Time: %{x:.3f} s<br>Voltage: %{y:.3f} mV<extra></extra>',
      },
    ];

    if (showAnnotations) {
      // 1. R-peaks
      if (waveData.r_peaks && waveData.r_peaks.length > 0) {
        const rX = waveData.r_peaks.map((idx) => time[idx]);
        const rY = waveData.r_peaks.map((idx) => voltage[idx]);
        traces.push({
          x: rX,
          y: rY,
          mode: 'markers+text',
          type: 'scatter',
          name: 'R Peak (Ventricular Depol)',
          text: waveData.r_peaks.map(() => 'R'),
          textposition: 'top center',
          textfont: { family: 'Inter, sans-serif', size: 11, color: '#dc2626' },
          marker: { color: '#dc2626', size: 8, symbol: 'circle' },
          hovertemplate: 'R Peak: %{x:.3f}s, %{y:.2f}mV<extra></extra>',
        });
      }

      // 2. P-peaks
      if (waveData.p_peaks && waveData.p_peaks.length > 0) {
        const pX = waveData.p_peaks.map((idx) => time[idx]);
        const pY = waveData.p_peaks.map((idx) => voltage[idx]);
        traces.push({
          x: pX,
          y: pY,
          mode: 'markers+text',
          type: 'scatter',
          name: 'P Peak (Atrial Depol)',
          text: waveData.p_peaks.map(() => 'P'),
          textposition: 'top center',
          textfont: { family: 'Inter, sans-serif', size: 10, color: '#0d9488' },
          marker: { color: '#0d9488', size: 6, symbol: 'diamond' },
          hovertemplate: 'P Peak: %{x:.3f}s, %{y:.2f}mV<extra></extra>',
        });
      }

      // 3. T-peaks
      if (waveData.t_peaks && waveData.t_peaks.length > 0) {
        const tX = waveData.t_peaks.map((idx) => time[idx]);
        const tY = waveData.t_peaks.map((idx) => voltage[idx]);
        traces.push({
          x: tX,
          y: tY,
          mode: 'markers+text',
          type: 'scatter',
          name: 'T Peak (Repol)',
          text: waveData.t_peaks.map(() => 'T'),
          textposition: 'top center',
          textfont: { family: 'Inter, sans-serif', size: 10, color: '#7c3aed' },
          marker: { color: '#7c3aed', size: 6, symbol: 'triangle-up' },
          hovertemplate: 'T Peak: %{x:.3f}s, %{y:.2f}mV<extra></extra>',
        });
      }
    }

    // Medical grid configuration (Standard 25 mm/s, 10 mm/mV)
    // Major grid every 0.2 seconds and 0.5 mV
    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      height: 420,
      margin: { l: 55, r: 25, t: 30, b: 50 },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#fffbfb', // Subtle pinkish-cream medical grid tint
      showlegend: true,
      legend: {
        orientation: 'h',
        y: 1.15,
        x: 0,
        font: { family: 'Inter, sans-serif', size: 11 },
      },
      xaxis: {
        title: { text: 'Time (seconds)', font: { size: 12, color: '#334155' } },
        showgrid: true,
        gridcolor: 'rgba(239, 68, 68, 0.15)', // Light red ECG grid line
        gridwidth: 1,
        dtick: 0.2, // 200 ms major grid
        minor: {
          dtick: 0.04, // 40 ms minor grid
          gridcolor: 'rgba(239, 68, 68, 0.06)',
          gridwidth: 0.5,
          showgrid: true,
        },
        zeroline: true,
        zerolinecolor: '#cbd5e1',
        range: [0, Math.min(time[time.length - 1] || 10, 5.0)], // Default 5 seconds zoom window
      },
      yaxis: {
        title: { text: 'Amplitude (mV)', font: { size: 12, color: '#334155' } },
        showgrid: true,
        gridcolor: 'rgba(239, 68, 68, 0.15)',
        gridwidth: 1,
        dtick: 0.5, // 0.5 mV major grid
        minor: {
          dtick: 0.1, // 0.1 mV minor grid
          gridcolor: 'rgba(239, 68, 68, 0.06)',
          gridwidth: 0.5,
          showgrid: true,
        },
        zeroline: true,
        zerolinecolor: '#94a3b8',
        zerolinewidth: 1.2,
      },
      hovermode: 'closest',
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    Plotly.react(containerRef.current, traces, layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [waveData, showAnnotations, loading, selectedLead]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 overflow-hidden">
      {/* Viewer Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Interactive Waveform Delineation</h3>
            <p className="text-xs text-slate-500">
              Calibrated display (25 mm/s, 10 mm/mV) &bull; Pan &amp; Zoom enabled
            </p>
          </div>
        </div>

        {/* Lead Selection and Annotation Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="font-medium">Lead:</span>
            <select
              value={selectedLead}
              onChange={(e) => setSelectedLead(e.target.value)}
              className="bg-transparent font-semibold text-teal-800 outline-none cursor-pointer"
            >
              {leadNames.map((lead) => (
                <option key={lead} value={lead}>
                  {lead}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              showAnnotations
                ? 'bg-teal-50 text-teal-800 border-teal-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {showAnnotations ? 'P-QRS-T Marks: ON' : 'P-QRS-T Marks: OFF'}
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full min-h-[420px] bg-white rounded-lg border border-slate-100">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs z-10">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium text-slate-600">Retrieving digital ECG lead signals...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800 mb-1">Waveform Retrieval Failed</p>
            <p className="text-xs text-slate-500 max-w-md">{error}</p>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Viewer Footer Legend / Technical Note */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> R Peak (Ventricular)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rotate-45 bg-teal-600 inline-block"></span> P Wave (Atrial)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block"></span> T Wave (Repolarization)
          </span>
        </div>
        <div>
          Sampling: {waveData?.sampling_rate || 500} Hz &bull; Grid: 40 ms minor / 200 ms major
        </div>
      </div>
    </div>
  );
};
