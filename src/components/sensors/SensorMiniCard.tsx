import React from 'react';
import { SensorStatus } from '../../types';

interface Props {
  title: string;
  value: number;
  unit: string;
  status: SensorStatus;
  thresholdLabel: string;
  icon: React.ElementType;
  accentColor: string;
  history?: number[];
}

export const SensorMiniCard: React.FC<Props> = ({
  title,
  value,
  unit,
  status,
  thresholdLabel,
  icon: Icon,
  accentColor,
  history = [40, 41, 42, 42.5, 42, 41.8, 42],
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-status-danger/15 text-status-danger border-status-danger/40';
      case 'WARNING':
        return 'bg-status-warning/15 text-status-warning border-status-warning/40';
      case 'MONITOR':
        return 'bg-[#FFB067]/15 text-[#FFB067] border-[#FFB067]/40';
      default:
        return 'bg-status-safe/15 text-status-safe border-status-safe/40';
    }
  };

  const minVal = Math.min(...history);
  const maxVal = Math.max(...history) + 0.001;
  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * 100;
      const y = 26 - ((val - minVal) / (maxVal - minVal)) * 18;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="p-3 rounded-xl glass-card border border-white/[0.06] flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="telemetry-label truncate">{title}</span>
        </div>

        <span
          className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${getStatusBadge()}`}
        >
          {status}
        </span>
      </div>

      {/* Metric & Sparkline */}
      <div className="my-2 flex items-end justify-between">
        <div>
          <div className="text-2xl font-mono font-bold text-text-primary tracking-tight">
            {typeof value === 'number' ? value.toFixed(1) : value}
            <span className="text-xs font-normal text-text-muted ml-1">{unit}</span>
          </div>
          <div className="text-[10px] font-mono text-text-muted mt-0.5">
            {thresholdLabel}
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-16 h-7 flex items-center justify-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28">
            <polyline
              fill="none"
              stroke={accentColor}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
