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
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-slate-300 w-1/4 rounded-full"></div>
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
      ? 'bg-emerald-500 shadow-emerald-500/50'
      : status === 'abnormal'
      ? 'bg-rose-500 shadow-rose-500/50'
      : 'bg-amber-500 shadow-amber-500/50';

  return (
    <div className="w-full space-y-1">
      {/* Gauge track */}
      <div className="relative w-full h-3 bg-slate-100 rounded-full border border-slate-200/60 overflow-hidden">
        {/* Normal Reference Range Zone */}
        <div
          className="absolute h-full bg-emerald-100/70 border-x border-emerald-300/60"
          style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
        ></div>

        {/* Value Marker Dot */}
        <div
          className={`absolute top-0 bottom-0 w-2.5 -ml-1.25 rounded-full ${markerColor} shadow-sm border border-white transition-all`}
          style={{ left: `${valuePercent}%` }}
        ></div>
      </div>

      {/* Numerical markers beneath */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span>{minRef} {unit}</span>
        <span className="text-slate-500 font-medium">Ref Range</span>
        <span>{maxRef} {unit}</span>
      </div>
    </div>
  );
};
