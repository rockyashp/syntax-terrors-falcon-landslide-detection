import React from 'react';
import { RiskLevel } from '../../types';

interface Props {
  score: number;
  level: RiskLevel;
  trend?: 'STABLE' | 'INCREASING' | 'DECREASING';
}

export const RiskGauge: React.FC<Props> = ({ score, level, trend = 'STABLE' }) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const radius = 68;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (260 / 360);
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  const getLevelDetails = () => {
    if (clampedScore >= 75 || level === 'CRITICAL' || level === 'VERY_HIGH') {
      return {
        text: 'text-status-danger',
        stroke: '#FF3B30',
        badge: 'bg-status-danger/15 text-status-danger border-status-danger/40',
        label: 'CRITICAL HAZARD',
      };
    }
    if (clampedScore >= 50 || level === 'HIGH') {
      return {
        text: 'text-[#FF7A24]',
        stroke: '#FF7A24',
        badge: 'bg-accent/15 text-[#FF8A3D] border-accent/40',
        label: 'HIGH RISK',
      };
    }
    if (clampedScore >= 25 || level === 'MODERATE' || level === 'MONITOR') {
      return {
        text: 'text-status-warning',
        stroke: '#FFB020',
        badge: 'bg-status-warning/15 text-status-warning border-status-warning/40',
        label: 'ELEVATED / MONITOR',
      };
    }
    return {
      text: 'text-status-safe',
      stroke: '#35D07F',
      badge: 'bg-status-safe/15 text-status-safe border-status-safe/40',
      label: 'STABLE / LOW RISK',
    };
  };

  const details = getLevelDetails();

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Radial Arc Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-220" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            fill="none"
          />

          {/* Value Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={details.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-extrabold font-mono tracking-tighter text-text-primary">
            {clampedScore}
            <span className="text-xl font-normal text-text-muted ml-0.5">%</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted mt-1 font-semibold">
            LANDSLIDE RISK
          </span>
        </div>
      </div>

      {/* Level Badge */}
      <div className="mt-0.5 flex items-center space-x-2">
        <span
          className={`text-xs font-mono font-bold tracking-wider px-3.5 py-0.5 rounded-full border ${details.badge}`}
        >
          {details.label}
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          TREND: <span className="text-text-secondary font-semibold">{trend}</span>
        </span>
      </div>
    </div>
  );
};
