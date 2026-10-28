import React from 'react';

interface Props {
  value: number | null;
  unit: string;
  minRef?: number;
  maxRef?: number;
  status: 'normal' | 'borderline' | 'abnormal' | 'unmeasurable';
}

export const MeasurementGauge: React.FC<Props> = ({
  value,
  unit,
  minRef,
  maxRef,
  status,
}) => {
  if (value === null || minRef === undefined || maxRef === undefined) {
    return (
      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div className="h-full bg-slate-800 w-1/4 rounded-full"></div>
      </div>
    );
  }

  // Calculate percentage position along a safe visual bracket: [minRef - delta, maxRef + delta]
  const rangeSpan = maxRef - minRef;
  const padding = Math.max(rangeSpan * 0.4, 10);
  const scaleMin = minRef - padding;
  const scaleMax = maxRef + padding;
  const totalScale = scaleMax - scaleMin;

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const leftPercent = ((minRef - scaleMin) / totalScale) * 100;
  const widthPercent = (rangeSpan / totalScale) * 100;
  const valuePercent = clamp(((value - scaleMin) / totalScale) * 100, 2, 98);

  const markerColor =
    status === 'normal'
      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
      : status === 'abnormal'
      ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
      : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]';

  return (
    <div className="w-full space-y-1">
      {/* Gauge track */}
      <div className="relative w-full h-3 bg-slate-900/90 rounded-full border border-slate-800 overflow-hidden">
        {/* Normal Reference Range Zone */}
        <div
          className="absolute h-full bg-emerald-950/60 border-x border-emerald-500/40"
          style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
        ></div>

        {/* Value Marker Dot */}
        <div
          className={`absolute top-0 bottom-0 w-2.5 -ml-1.25 rounded-full ${markerColor} border border-slate-950 transition-all`}
          style={{ left: `${valuePercent}%` }}
        ></div>
      </div>

      {/* Numerical markers beneath */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span>{minRef} {unit}</span>
        <span className="text-emerald-400/80 font-medium">Safe Window</span>
        <span>{maxRef} {unit}</span>
      </div>
    </div>
  );
};
